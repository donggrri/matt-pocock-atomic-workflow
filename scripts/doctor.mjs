#!/usr/bin/env node
import { readFile, writeFile, readdir, stat, copyFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join, resolve } from "node:path";
import { homedir } from "node:os";

export const BUNDLED_SKILLS = [
  "code-review",
  "codebase-design",
  "domain-modeling",
  "grill-me",
  "grilling",
  "tdd",
  "to-tickets",
  "wayfinder"
];

export const WORKFLOW_SKILL = "matt-pocock-atomic-workflow";

/**
 * 전역 또는 프로젝트 스킬 디렉터리에서 번들 스킬과 충돌하는 스킬들을 탐지한다.
 */
export async function checkCollisions(options = {}) {
  const home = homedir();
  const searchDirs = options.searchDirs || [
    join(home, ".agents", "skills"),
    join(home, ".pi", "agent", "skills")
  ];

  const collisions = [];

  for (const dir of searchDirs) {
    if (!existsSync(dir)) continue;
    try {
      const entries = await readdir(dir);
      for (const entry of entries) {
        if (BUNDLED_SKILLS.includes(entry)) {
          const fullPath = join(dir, entry);
          const skillMd = join(fullPath, "SKILL.md");
          if (existsSync(skillMd)) {
            collisions.push({
              skill: entry,
              foundIn: fullPath,
              skillFile: skillMd
            });
          }
        }
      }
    } catch {
      // 디렉터리 읽기 실패 시 무시
    }
  }

  return collisions;
}

/**
 * settings.json의 패키지 필터를 확인하고 필요한 경우 수정한다.
 */
export async function checkSettingsFilter(options = {}) {
  const home = homedir();
  const settingsPath = options.settingsPath || join(home, ".pi", "agent", "settings.json");

  if (!existsSync(settingsPath)) {
    return { exists: false, isFiltered: false, packageConfig: null };
  }

  try {
    const raw = await readFile(settingsPath, "utf8");
    const settings = JSON.parse(raw);
    const packages = settings.packages || [];

    for (const pkg of packages) {
      if (typeof pkg === "string" && pkg.includes("matt-pocock-atomic-workflow")) {
        return { exists: true, isFiltered: false, packageConfig: pkg, settings, settingsPath };
      }
      if (typeof pkg === "object" && pkg !== null && pkg.source && pkg.source.includes("matt-pocock-atomic-workflow")) {
        const skills = pkg.skills;
        const isFiltered = Array.isArray(skills) && skills.some(s => s.includes("matt-pocock-atomic-workflow") && !s.includes("./skills"));
        return { exists: true, isFiltered, packageConfig: pkg, settings, settingsPath };
      }
    }

    return { exists: true, isFiltered: false, packageConfig: null, settings, settingsPath };
  } catch (err) {
    return { exists: true, error: err.message, isFiltered: false, settingsPath };
  }
}

/**
 * settings.json에 패키지 필터를 적용하여 스킬 충돌을 완화한다.
 */
export async function fixSettingsFilter(options = {}) {
  const check = await checkSettingsFilter(options);
  if (!check.exists || !check.settings) return { success: false, reason: "settings.json not found" };

  const settings = check.settings;
  const packages = settings.packages || [];
  let updated = false;

  for (let i = 0; i < packages.length; i++) {
    const pkg = packages[i];
    const sourceStr = typeof pkg === "string" ? pkg : pkg.source;

    if (sourceStr && sourceStr.includes("matt-pocock-atomic-workflow")) {
      packages[i] = {
        source: sourceStr,
        skills: ["skills/matt-pocock-atomic-workflow"]
      };
      updated = true;
      break;
    }
  }

  if (!updated) {
    return { success: false, reason: "package not found in settings.packages" };
  }

  settings.packages = packages;
  await writeFile(check.settingsPath, JSON.stringify(settings, null, 2) + "\n", "utf8");
  return { success: true, settingsPath: check.settingsPath };
}

/**
 * 디렉터리 내의 모든 SKILL.md 파일을 재귀 탐색한다.
 */
export async function findSkillFiles(dir, files = []) {
  if (!existsSync(dir)) return files;
  try {
    const entries = await readdir(dir);
    for (const name of entries) {
      if (name === "node_modules" || name === ".git") continue;
      const fullPath = join(dir, name);
      const st = await stat(fullPath).catch(() => null);
      if (!st) continue;

      if (st.isDirectory()) {
        await findSkillFiles(fullPath, files);
      } else if (name === "SKILL.md") {
        files.push(fullPath);
      }
    }
  } catch {
    // 접근 불가 시 무시
  }
  return files;
}

/**
 * SKILL.md의 frontmatter에서 따옴표 없는 콜론 등 YAML 파싱 위험 요소를 검출한다.
 */
export function validateSkillFrontmatter(content, filePath = "") {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n/);
  if (!match) {
    return { valid: false, reason: "Missing frontmatter", issues: [] };
  }

  const frontmatter = match[1];
  const issues = [];

  const lines = frontmatter.split(/\r?\n/);
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // description 필드 검사
    if (/^description\s*:/.test(trimmed)) {
      const val = trimmed.replace(/^description\s*:\s*/, "");

      // 블록 스칼라(>, |) 또는 따옴표로 감싸진 경우 안전
      const isQuoted = /^["'].*["']$/.test(val);
      const isBlockScalar = /^[>|][-+]?$/.test(val);

      if (!isQuoted && !isBlockScalar) {
        // 내부에 ': ' (콜론+공백)이 포함되어 있으면 YAML 파서가 중첩 매핑 키로 오인
        if (/:\s+/.test(val)) {
          issues.push({
            line: i + 1,
            field: "description",
            value: val,
            error: "Unquoted description containing ': ' causes YAML nested mapping parse error",
            suggestedFix: `description: ${JSON.stringify(val)}`
          });
        }
      }
    }
  }

  return {
    valid: issues.length === 0,
    issues
  };
}

/**
 * SKILL.md 파일의 unquoted description을 큰따옴표로 감싸 자동 교정한다.
 */
export async function fixSkillFrontmatter(filePath) {
  const content = await readFile(filePath, "utf8");
  const check = validateSkillFrontmatter(content, filePath);

  if (check.valid || check.issues.length === 0) {
    return { fixed: false, issues: [] };
  }

  let modified = content;
  for (const issue of check.issues) {
    if (issue.field === "description" && issue.suggestedFix) {
      // 정확한 행 교체
      const targetPattern = new RegExp(`^description\\s*:\\s*${escapeRegExp(issue.value)}$`, "m");
      modified = modified.replace(targetPattern, issue.suggestedFix);
    }
  }

  if (modified !== content) {
    await writeFile(filePath, modified, "utf8");
    return { fixed: true, fixedIssues: check.issues };
  }

  return { fixed: false, issues: check.issues };
}

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * 통합 doctor 진단 실행 함수
 */
export async function runDoctor(options = {}) {
  const home = homedir();
  const cwd = options.cwd || process.cwd();
  const doFix = !!options.fix;

  const results = {
    collisions: [],
    settingsFilter: null,
    yamlIssues: [],
    fixesApplied: []
  };

  // 1. 스킬 충돌 점검
  const collisions = await checkCollisions();
  results.collisions = collisions;

  const filterStatus = await checkSettingsFilter();
  results.settingsFilter = filterStatus;

  if (collisions.length > 0 && !filterStatus.isFiltered && doFix) {
    const fixResult = await fixSettingsFilter();
    if (fixResult.success) {
      results.fixesApplied.push("Applied package skill filter to ~/.pi/agent/settings.json (resolved collisions)");
      results.settingsFilter.isFiltered = true;
    }
  }

  // 2. YAML frontmatter 검사 대상 수집
  const targetDirs = options.skillsDirs || [
    resolve("skills"),
    join(home, ".agents", "skills"),
    join(cwd, ".agents", "skills")
  ];

  const skillFiles = new Set();
  for (const d of targetDirs) {
    const files = await findSkillFiles(d);
    for (const f of files) skillFiles.add(f);
  }

  for (const file of skillFiles) {
    try {
      const content = await readFile(file, "utf8");
      const validation = validateSkillFrontmatter(content, file);
      if (!validation.valid) {
        results.yamlIssues.push({
          file,
          issues: validation.issues
        });

        if (doFix) {
          const fixRes = await fixSkillFrontmatter(file);
          if (fixRes.fixed) {
            results.fixesApplied.push(`Fixed YAML description formatting in ${file}`);
          }
        }
      }
    } catch {
      // 파일 읽기 오류 무시
    }
  }

  return results;
}

// CLI 실행 엔트리포인트
if (process.argv[1] && process.argv[1].endsWith("doctor.mjs")) {
  const args = process.argv.slice(2);
  const isFix = args.includes("--fix");
  const isJson = args.includes("--json");

  runDoctor({ fix: isFix }).then((res) => {
    if (isJson) {
      console.log(JSON.stringify(res, null, 2));
      return;
    }

    console.log("=== matt-pocock-atomic-workflow Doctor ===\n");

    // 1. 스킬 충돌 상태
    console.log("1. 스킬 충돌(Skill Collisions) 진단:");
    if (res.collisions.length === 0) {
      console.log("  ✓ 충돌 없음: 전역 스킬 디렉터리에 겹치는 번들 스킬이 없습니다.");
    } else {
      console.log(`  ⚠ ${res.collisions.length}개 번들 스킬이 전역 스킬 디렉터리에 이미 존재합니다:`);
      for (const c of res.collisions) {
        console.log(`    - ${c.skill} (${c.foundIn})`);
      }
      if (res.settingsFilter && res.settingsFilter.isFiltered) {
        console.log("  ✓ settings.json에 패키지 필터가 설정되어 있어 Pi 기동 시 충돌 경고가 방지됩니다.");
      } else {
        console.log("  ✗ settings.json에 패키지 필터가 없습니다. (Pi 기동 시 [Skill conflicts] 경고 발생 가능)");
        if (!isFix) {
          console.log("    -> 'node scripts/doctor.mjs --fix' 를 실행하면 자동 필터링이 적용됩니다.");
        }
      }
    }

    console.log("\n2. 스킬 YAML Frontmatter 유효성 진단:");
    if (res.yamlIssues.length === 0) {
      console.log("  ✓ 문법 오류 없음: 모든 SKILL.md frontmatter가 정상입니다.");
    } else {
      console.log(`  ⚠ ${res.yamlIssues.length}개 파일에서 YAML 문법 에러 유발 요소가 감지되었습니다:`);
      for (const y of res.yamlIssues) {
        console.log(`    - ${y.file}`);
        for (const iss of y.issues) {
          console.log(`      Line ${iss.line}: ${iss.error}`);
        }
      }
      if (!isFix) {
        console.log("    -> 'node scripts/doctor.mjs --fix' 를 실행하면 자동으로 큰따옴표를 감싸 교정합니다.");
      }
    }

    if (res.fixesApplied.length > 0) {
      console.log("\n3. 자동 교정(Auto-Fix) 적용 내역:");
      for (const fix of res.fixesApplied) {
        console.log(`  ✓ ${fix}`);
      }
    }

    console.log("\n진단 완료.");
  }).catch((err) => {
    console.error("Doctor error:", err);
    process.exit(1);
  });
}
