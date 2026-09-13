import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);
const bundled = [
  "codebase-design",
  "domain-modeling",
  "grilling",
  "grill-me",
  "wayfinder",
  "to-tickets",
  "tdd",
  "code-review",
];

const text = async (path) => readFile(new URL(path, root), "utf8");

function frontmatterValue(markdown, key) {
  const match = markdown.match(new RegExp(`^${key}:\\s*(.+)$`, "m"));
  return match?.[1].trim();
}

test("bundled skills: package resource contains the selected upstream skills", async () => {
  const pkg = JSON.parse(await text("package.json"));
  assert.ok(pkg.pi.skills.includes("./skills"));

  const discovered = [];
  for (const entry of await readdir(new URL("skills/", root), { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    try {
      const markdown = await text(`skills/${entry.name}/SKILL.md`);
      discovered.push(frontmatterValue(markdown, "name"));
    } catch (error) {
      if (error.code !== "ENOENT") throw error;
    }
  }

  for (const skill of bundled) assert.ok(discovered.includes(skill), `${skill} must be discoverable`);
  assert.equal((await text("THIRD_PARTY_LICENSES/mattpocock-skills-REVISION")).trim().length, 40);
  assert.match(await text("THIRD_PARTY_LICENSES/mattpocock-skills-LICENSE"), /MIT License/);
});

test("planning skills: parent preflight uses grilling and agent references resolve", async () => {
  const prompt = await text("prompts/g-plan.md");
  const planner = await text("agents/g-planner.md");

  assert.match(prompt, /Planning preflight/);
  assert.match(prompt, /`grilling`/);
  assert.match(prompt, /답을 기다린다/);
  assert.match(prompt, /local-wayfinding/);
  assert.doesNotMatch(prompt, /way-finder/);

  const declared = frontmatterValue(planner, "skills").split(/,\s*/);
  for (const skill of ["codebase-design", "domain-modeling", "grilling", "wayfinder"]) {
    assert.ok(declared.includes(skill), `g-planner must declare ${skill}`);
    assert.ok(bundled.includes(skill), `${skill} must ship with the package`);
  }

  assert.equal(frontmatterValue(await text("skills/grilling/SKILL.md"), "disable-model-invocation"), undefined);
  assert.equal(frontmatterValue(await text("skills/grill-me/SKILL.md"), "disable-model-invocation"), "true");
  assert.equal(frontmatterValue(await text("skills/wayfinder/SKILL.md"), "disable-model-invocation"), "true");
});

test("bundled skills: every phase agent skill reference resolves", async () => {
  const available = new Set(["matt-pocock-atomic-workflow", ...bundled]);
  for (const file of await readdir(new URL("agents/", root))) {
    if (!file.endsWith(".md")) continue;
    const markdown = await text(`agents/${file}`);
    const value = frontmatterValue(markdown, "skills");
    if (!value) continue;
    for (const skill of value.split(/,\s*/)) {
      assert.ok(available.has(skill), `${file} references unbundled skill ${skill}`);
    }
  }
});

test("documentation: installation does not require an external skill directory", async () => {
  const readme = await text("README.md");
  const settings = JSON.parse(await text("settings.example.json"));
  assert.match(readme, /설치하면 아래 스킬도 Pi package resource로 함께 설치·발견/);
  assert.doesNotMatch(readme, /```bash\s*npx skills add/);
  assert.equal(settings.skills, undefined);
});
