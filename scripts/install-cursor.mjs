#!/usr/bin/env node
// Cursor 프로젝트에 워크플로 파일을 설치한다.
//
//   node scripts/install-cursor.mjs --target <프로젝트 경로> [--force] [--set-model worker=composer-2.5]
//
// 복사 내용:
//   skills/*                 -> <target>/.agents/skills/*   (기본. --skills-dir 로 변경 가능)
//   .cursor/agents/*.md      -> <target>/.cursor/agents/*.md
//   .cursor/commands/*.md    -> <target>/.cursor/commands/*.md
//
// 이미 있으면 건너뛰고, --force 일 때만 덮어쓴다.
import { readFile, writeFile, mkdir, readdir, stat, cp } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));

export function parseInstallArgs(args) {
  const opts = {
    target: process.cwd(),
    skillsDir: ".agents/skills",
    force: false,
    setModel: {},
    components: { skills: true, agents: true, commands: true }
  };
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === "--target" && args[i + 1]) opts.target = resolve(args[++i]);
    else if (a === "--skills-dir" && args[i + 1]) opts.skillsDir = args[++i];
    else if (a === "--force") opts.force = true;
    else if (a === "--no-skills") opts.components.skills = false;
    else if (a === "--no-agents") opts.components.agents = false;
    else if (a === "--no-commands") opts.components.commands = false;
    else if (a === "--set-model" && args[i + 1]) {
      const pair = args[++i];
      const eq = pair.indexOf("=");
      if (eq === -1) throw new Error(`--set-model 형식은 <agent>=<model> (입력: ${pair})`);
      opts.setModel[pair.slice(0, eq)] = pair.slice(eq + 1);
    }
  }
  return opts;
}

async function copyFileIfNeeded(src, dest, force, record) {
  if (existsSync(dest) && !force) {
    record.skipped.push(dest);
    return;
  }
  await mkdir(dirname(dest), { recursive: true });
  await writeFile(dest, await readFile(src, "utf8"), "utf8");
  record[existsSync(dest) && force ? "overwritten" : "copied"].push(dest);
}

function applyModelOverride(content, model) {
  if (/^model:\s*.*$/m.test(content)) {
    return content.replace(/^model:\s*.*$/m, `model: ${model}`);
  }
  return content.replace(/^---\r?\n/, `---\nmodel: ${model}\n`);
}

export async function installCursor(options = {}) {
  const root = options.root || resolve(here, "..");
  const target = resolve(options.target || process.cwd());
  const skillsDir = options.skillsDir || ".agents/skills";
  const force = !!options.force;
  const setModel = options.setModel || {};
  const components = options.components || { skills: true, agents: true, commands: true };
  const record = { copied: [], overwritten: [], skipped: [] };

  if (components.skills) {
    const srcSkills = join(root, "skills");
    const entries = await readdir(srcSkills);
    for (const entry of entries) {
      const src = join(srcSkills, entry);
      const st = await stat(src).catch(() => null);
      if (!st || !st.isDirectory()) continue;
      const dest = join(target, skillsDir, entry);
      if (existsSync(dest) && !force) {
        record.skipped.push(dest + "/");
        continue;
      }
      await mkdir(dirname(dest), { recursive: true });
      await cp(src, dest, { recursive: true, force });
      record[force && existsSync(dest) ? "overwritten" : "copied"].push(dest + "/");
    }
  }

  for (const kind of ["agents", "commands"]) {
    if (!components[kind]) continue;
    const srcDir = join(root, ".cursor", kind);
    if (!existsSync(srcDir)) {
      throw new Error(
        `.cursor/${kind}/ 가 없습니다. 먼저 'node scripts/sync-cursor.mjs' 를 실행하세요.`
      );
    }
    const files = (await readdir(srcDir)).filter((f) => f.endsWith(".md")).sort();
    for (const file of files) {
      let content = await readFile(join(srcDir, file), "utf8");
      const agentName = file.replace(/\.md$/, "");
      if (kind === "agents" && setModel[agentName]) {
        content = applyModelOverride(content, setModel[agentName]);
      }
      const dest = join(target, ".cursor", kind, file);
      if (existsSync(dest) && !force) {
        record.skipped.push(dest);
        continue;
      }
      await mkdir(dirname(dest), { recursive: true });
      await writeFile(dest, content, "utf8");
      record.copied.push(dest);
    }
  }

  return { target, skillsDir, ...record };
}

if (process.argv[1] && process.argv[1].endsWith("install-cursor.mjs")) {
  let opts;
  try {
    opts = parseInstallArgs(process.argv.slice(2));
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
  installCursor({ ...opts, root: resolve(here, "..") })
    .then((res) => {
      console.log(`Cursor 설치 대상: ${res.target}`);
      console.log(`  스킬 위치: ${res.skillsDir}/`);
      for (const f of res.copied) console.log(`  + ${f}`);
      for (const f of res.overwritten) console.log(`  ~ ${f}`);
      for (const f of res.skipped) console.log(`  = 유지(있음): ${f}`);
      console.log("\n설치 완료. Cursor에서 `/matt-pocock-atomic-plan` 등으로 호출하세요.");
      console.log("단계별 모델은 `.cursor/agents/<에이전트>.md`의 `model`로 지정합니다.");
    })
    .catch((err) => {
      console.error("설치 실패:", err.message);
      process.exit(1);
    });
}
