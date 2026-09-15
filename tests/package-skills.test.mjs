import assert from "node:assert/strict";
import { readFile, readdir, stat } from "node:fs/promises";
import { join } from "node:path";
import test from "node:test";

const requiredSkills = [
  "codebase-design",
  "domain-modeling",
  "grilling",
  "wayfinder",
  "to-tickets",
  "tdd",
  "code-review"
];

const workflowAgents = {
  explorer: ["matt-pocock-atomic-workflow"],
  planner: ["matt-pocock-atomic-workflow", "codebase-design", "domain-modeling", "grilling", "wayfinder"],
  tasker: ["matt-pocock-atomic-workflow", "to-tickets"],
  worker: ["matt-pocock-atomic-workflow", "tdd"],
  reviewer: ["matt-pocock-atomic-workflow", "code-review"]
};

const oldAgentIds = ["g-explorer", "g-planner", "g-tasker", "g-worker", "g-reviewer"];

function parseFrontmatter(text, file) {
  const match = text.match(/^---\n([\s\S]*?)\n---\n/);
  assert.ok(match, `${file} must have YAML frontmatter`);
  const map = {};
  for (const line of match[1].split("\n")) {
    const idx = line.indexOf(":");
    if (idx === -1) continue;
    map[line.slice(0, idx).trim()] = line.slice(idx + 1).trim();
  }
  return map;
}

async function walkFiles(dir, files = []) {
  for (const name of await readdir(dir)) {
    if (name === ".git" || name === "node_modules" || name === "tests") continue;
    const path = join(dir, name);
    const stats = await stat(path);
    if (stats.isDirectory()) {
      await walkFiles(path, files);
    } else if (/\.(md|json|mjs|js|ps1)$/.test(name)) {
      files.push(path);
    }
  }
  return files;
}

function isAllowedOldAgentMention(line) {
  return /g-\*\.md/.test(line)
    || /still use `g-/.test(line)
    || /기존 설정에 `g-/.test(line);
}

test("package.json includes skills directory", async () => {
  const pkgStr = await readFile("package.json", "utf8");
  const pkg = JSON.parse(pkgStr);
  assert.ok(pkg.pi && pkg.pi.skills && pkg.pi.skills.includes("./skills"), "package.json must declare pi.skills array containing './skills'");
  assert.deepEqual(pkg.pi.subagents, { agents: ["./agents"] });
});

test("package.json meets public publish metadata contract", async () => {
  const pkgStr = await readFile("package.json", "utf8");
  const pkg = JSON.parse(pkgStr);
  const expectedKeywords = [
    "pi-package",
    "pi",
    "pi-coding-agent",
    "workflow",
    "atomic-workflow",
    "skills",
    "agents"
  ];
  const expectedFiles = [
    "agents/",
    "prompts/",
    "skills/",
    "scripts/",
    ".cursor/",
    "settings.example.json",
    "README.md",
    "README.kr.md",
    "THIRD_PARTY_LICENSES/",
    "LICENSE"
  ];

  assert.equal(pkg.name, "matt-pocock-atomic-workflow");
  assert.equal(pkg.version, "0.1.0");
  assert.ok(!Object.hasOwn(pkg, "private"), "package.json must not declare private");
  assert.equal(typeof pkg.description, "string");
  assert.ok(pkg.description.trim().length > 0, "description must be non-empty");
  assert.equal(pkg.license, "MIT");
  assert.deepEqual(pkg.repository, {
    type: "git",
    url: "git+https://github.com/donggrri/matt-pocock-atomic-workflow.git"
  });
  assert.equal(pkg.homepage, "https://github.com/donggrri/matt-pocock-atomic-workflow#readme");
  assert.equal(pkg.bugs?.url, "https://github.com/donggrri/matt-pocock-atomic-workflow/issues");
  for (const keyword of expectedKeywords) {
    assert.ok(pkg.keywords?.includes(keyword), `keywords must include ${keyword}`);
  }
  assert.deepEqual(pkg.files, expectedFiles);
  assert.deepEqual(pkg.pi?.skills, ["./skills"]);
  assert.deepEqual(pkg.pi?.prompts, ["./prompts"]);
  assert.deepEqual(pkg.pi?.subagents, { agents: ["./agents"] });

  const licenseStats = await stat("LICENSE").catch(() => null);
  assert.ok(licenseStats && licenseStats.isFile(), "root LICENSE file must exist");
});

test("bundled skills are present", async () => {
  for (const skill of requiredSkills) {
    const stats = await stat(join("skills", skill, "SKILL.md")).catch(() => null);
    assert.ok(stats && stats.isFile(), `skill ${skill} must exist in skills directory`);
  }
});

test("planning preflight is defined in prompts", async () => {
  const plan = await readFile("prompts/matt-pocock-atomic-plan.md", "utf8");
  assert.match(plan, /grilling/, "matt-pocock-atomic-plan.md must reference grilling");
  assert.match(plan, /wayfinder/, "matt-pocock-atomic-plan.md must reference wayfinder");
  assert.doesNotMatch(plan, /way-finder/, "matt-pocock-atomic-plan.md must not reference old way-finder typo");
});

test("artifact writers use slug folders under .docs and harness docs", async () => {
  const files = [
    "skills/matt-pocock-atomic-workflow/SKILL.md",
    "agents/explorer.md",
    "agents/planner.md",
    "prompts/matt-pocock-atomic-explore.md",
    "prompts/matt-pocock-atomic-plan.md",
    "prompts/matt-pocock-atomic-status.md"
  ];
  for (const file of files) {
    const body = await readFile(file, "utf8");
    assert.match(body, /\.docs\/<slug>\//, `${file} must mention .docs/<slug>/`);
    assert.match(body, /docs\/<slug>\//, `${file} must mention docs/<slug>/`);
    assert.doesNotMatch(
      body,
      /워크스페이스 루트에 `(?:PLAN|EXPLORE)-<slug>\.md`/,
      `${file} must not tell agents to write PLAN/EXPLORE at workspace root`
    );
    assert.doesNotMatch(
      body,
      /Write `(?:PLAN|EXPLORE)-<slug>\.md` in the current workspace root/,
      `${file} must not tell agents to write PLAN/EXPLORE at workspace root`
    );
  }
});

test("workflow agents are registered without g- prefix", async () => {
  const files = (await readdir("agents")).sort();
  assert.deepEqual(files, Object.keys(workflowAgents).map((name) => `${name}.md`).sort());

  for (const [name, skills] of Object.entries(workflowAgents)) {
    const file = `agents/${name}.md`;
    const body = await readFile(file, "utf8");
    const meta = parseFrontmatter(body, file);
    assert.equal(meta.name, name, `${file} name must match filename`);
    assert.equal(meta.advertise, "true", `${file} must be advertised`);
    assert.equal(meta.async, "true", `${file} must run async`);
    assert.ok(!("model" in meta), `${file} must not pin a model in frontmatter`);
    assert.match(meta.tools, /read/, `${file} must have tools`);
    const listed = (meta.skills || "").split(",").map((s) => s.trim()).filter(Boolean);
    for (const skill of skills) {
      assert.ok(listed.includes(skill), `${name} must list skill ${skill}`);
    }
    assert.doesNotMatch(body, /^name: g-/m, `${file} must not use a g- name`);
    assert.doesNotMatch(meta.aliases || "", /\bg-/, `${file} aliases must not keep g- prefix`);
  }
});

test("planner contract uses correct skills", async () => {
  const planner = await readFile("agents/planner.md", "utf8");
  assert.match(planner, /skills:.*grilling/, "planner must use grilling");
  assert.match(planner, /skills:.*wayfinder/, "planner must use wayfinder");
  assert.doesNotMatch(planner, /grill-me/, "planner must not rely on grill-me directly");
  assert.match(planner, /brief/, "planner must require planning refinement brief");
});

test("prompts spawn the renamed agents", async () => {
  const prompts = {
    "prompts/matt-pocock-atomic-explore.md": ["explorer"],
    "prompts/matt-pocock-atomic-plan.md": ["planner", "tasker", "worker", "reviewer"],
    "prompts/matt-pocock-atomic-task.md": ["tasker"],
    "prompts/matt-pocock-atomic-execute.md": ["worker", "reviewer"],
    "prompts/matt-pocock-atomic-review.md": ["reviewer"],
    "prompts/matt-pocock-atomic-delegate.md": ["worker"]
  };
  for (const [file, agents] of Object.entries(prompts)) {
    const body = await readFile(file, "utf8");
    for (const agent of agents) {
      assert.match(body, new RegExp(`\\b${agent}\\b`), `${file} must spawn ${agent}`);
    }
    for (const oldId of oldAgentIds) {
      assert.doesNotMatch(body, new RegExp(`\\b${oldId}\\b`), `${file} must not spawn ${oldId}`);
    }
  }
});

test("settings example keys are unique and match agents", async () => {
  const raw = await readFile("settings.example.json", "utf8");
  const parsed = JSON.parse(raw);
  const keys = Object.keys(parsed.subagents.agentOverrides);
  assert.equal(new Set(keys).size, keys.length, "agentOverrides must not contain duplicate names");
  for (const name of Object.keys(workflowAgents)) {
    assert.ok(keys.includes(name), `settings.example.json must include ${name}`);
    assert.ok(!keys.includes(`g-${name}`), `settings.example.json must not keep g-${name}`);
  }
});

test("documentation matches bundled behavior", async () => {
  const readme = await readFile("README.md", "utf8");
  assert.doesNotMatch(readme, /npx skills add mattpocock/, "README must not instruct to run npx skills add in installation instructions (except as historical context)");
  assert.match(readme, /THIRD_PARTY_LICENSES/, "README must mention THIRD_PARTY_LICENSES");
});

test("workflow prompts use package-prefixed slash command names", async () => {
  const prompts = (await readdir("prompts")).sort();
  assert.deepEqual(prompts, [
    "matt-pocock-atomic-commit.md",
    "matt-pocock-atomic-config.md",
    "matt-pocock-atomic-delegate.md",
    "matt-pocock-atomic-doctor.md",
    "matt-pocock-atomic-execute.md",
    "matt-pocock-atomic-explore.md",
    "matt-pocock-atomic-models.md",
    "matt-pocock-atomic-plan.md",
    "matt-pocock-atomic-review.md",
    "matt-pocock-atomic-settings.md",
    "matt-pocock-atomic-status.md",
    "matt-pocock-atomic-task.md"
  ]);
});

test("bundled skills have valid frontmatter without unquoted colon mapping errors", async () => {
  const { validateSkillFrontmatter } = await import("../scripts/doctor.mjs");
  for (const skill of requiredSkills) {
    const file = join("skills", skill, "SKILL.md");
    const content = await readFile(file, "utf8");
    const result = validateSkillFrontmatter(content, file);
    assert.equal(result.valid, true, `${file} must not have YAML parse risks: ${JSON.stringify(result.issues)}`);
  }
});

test("doctor module correctly detects and fixes unquoted description syntax", async () => {
  const { validateSkillFrontmatter } = await import("../scripts/doctor.mjs");
  const badContent = `---\nname: test-skill\ndescription: Some text. After tag: details here\n---\n# Body`;
  const badResult = validateSkillFrontmatter(badContent, "test.md");
  assert.equal(badResult.valid, false, "Should detect unquoted colon in description");
  assert.equal(badResult.issues.length, 1);
  assert.equal(badResult.issues[0].suggestedFix, 'description: "Some text. After tag: details here"');

  const goodContent = `---\nname: test-skill\ndescription: "Some text. After tag: details here"\n---\n# Body`;
  const goodResult = validateSkillFrontmatter(goodContent, "test.md");
  assert.equal(goodResult.valid, true, "Should accept quoted description");
});

test("old g- agent ids remain only as migration/cleanup notes", async () => {
  const files = await walkFiles(".");
  const leftover = [];
  for (const file of files) {
    const body = await readFile(file, "utf8");
    for (const [i, line] of body.split("\n").entries()) {
      if (!oldAgentIds.some((id) => line.includes(id))) continue;
      if (isAllowedOldAgentMention(line)) continue;
      leftover.push(`${file}:${i + 1}: ${line.trim()}`);
    }
  }
  assert.deepEqual(leftover, [], leftover.join("\n"));
});

