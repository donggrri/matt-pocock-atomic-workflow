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

test("package.json includes skills directory", async () => {
  const pkgStr = await readFile("package.json", "utf8");
  const pkg = JSON.parse(pkgStr);
  assert.ok(pkg.pi && pkg.pi.skills && pkg.pi.skills.includes("./skills"), "package.json must declare pi.skills array containing './skills'");
});

test("bundled skills are present", async () => {
  for (const skill of requiredSkills) {
    const stats = await stat(join("skills", skill, "SKILL.md")).catch(() => null);
    assert.ok(stats && stats.isFile(), `skill ${skill} must exist in skills directory`);
  }
});

test("planning preflight is defined in prompts", async () => {
  const gPlan = await readFile("prompts/matt-pocock-atomic-plan.md", "utf8");
  assert.match(gPlan, /grilling/, "matt-pocock-atomic-plan.md must reference grilling");
  assert.match(gPlan, /wayfinder/, "matt-pocock-atomic-plan.md must reference wayfinder");
  assert.doesNotMatch(gPlan, /way-finder/, "matt-pocock-atomic-plan.md must not reference old way-finder typo");
});

test("g-planner contract uses correct skills", async () => {
  const gPlanner = await readFile("agents/g-planner.md", "utf8");
  assert.match(gPlanner, /skills:.*grilling/, "g-planner must use grilling");
  assert.match(gPlanner, /skills:.*wayfinder/, "g-planner must use wayfinder");
  assert.doesNotMatch(gPlanner, /grill-me/, "g-planner must not rely on grill-me directly");
  assert.match(gPlanner, /brief/, "g-planner must require planning refinement brief");
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
