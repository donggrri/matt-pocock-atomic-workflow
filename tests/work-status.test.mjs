import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync, writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";

import {
  getWorkflowRoot,
  getShortRepo,
  getWorkflowPaths,
  readStatus,
  writeStatus,
  updateStatus,
  listAllStatuses,
  syncFromFiles,
  importDocs,
} from "../scripts/work-status.mjs";

test("getWorkflowRoot respects MATT_POCOCK_WORKFLOW_HOME and defaults to ~/.matt-pocock-workflow", () => {
  const orig = process.env.MATT_POCOCK_WORKFLOW_HOME;
  try {
    process.env.MATT_POCOCK_WORKFLOW_HOME = "/custom/workflow/root";
    assert.equal(getWorkflowRoot(), "/custom/workflow/root");

    delete process.env.MATT_POCOCK_WORKFLOW_HOME;
    assert.match(getWorkflowRoot(), /\.matt-pocock-workflow$/);
  } finally {
    if (orig !== undefined) {
      process.env.MATT_POCOCK_WORKFLOW_HOME = orig;
    } else {
      delete process.env.MATT_POCOCK_WORKFLOW_HOME;
    }
  }
});

test("getShortRepo normalizes repo basename to kebab-case and caps at 24 chars", () => {
  assert.equal(getShortRepo("/path/to/my-repo"), "my-repo");
  assert.equal(getShortRepo("/path/to/My_Awesome_Repo"), "my-awesome-repo");
  assert.equal(
    getShortRepo("/path/to/matt-pocock-atomic-workflow"),
    "matt-pocock-atomic-workf"
  );
  assert.ok(getShortRepo("/path/to/very-very-very-very-long-project-name").length <= 24);
});

test("getWorkflowPaths returns docs, runs, evidence, and statusJson paths", () => {
  const tmpRoot = mkdtempSync(join(tmpdir(), "wf-test-"));
  const orig = process.env.MATT_POCOCK_WORKFLOW_HOME;
  try {
    process.env.MATT_POCOCK_WORKFLOW_HOME = tmpRoot;
    const paths = getWorkflowPaths("/fake/my-repo", "sample-slug");
    assert.equal(paths.shortRepo, "my-repo");
    assert.equal(paths.slug, "sample-slug");
    assert.equal(paths.docsDir, join(tmpRoot, "docs", "my-repo", "sample-slug"));
    assert.equal(paths.runsDir, join(tmpRoot, "runs", "my-repo", "sample-slug"));
    assert.equal(paths.statusJson, join(tmpRoot, "docs", "my-repo", "sample-slug", "STATUS.json"));
  } finally {
    rmSync(tmpRoot, { recursive: true, force: true });
    if (orig !== undefined) process.env.MATT_POCOCK_WORKFLOW_HOME = orig;
    else delete process.env.MATT_POCOCK_WORKFLOW_HOME;
  }
});

test("writeStatus and readStatus perform atomic write and read", async () => {
  const tmpRoot = mkdtempSync(join(tmpdir(), "wf-test-"));
  const orig = process.env.MATT_POCOCK_WORKFLOW_HOME;
  try {
    process.env.MATT_POCOCK_WORKFLOW_HOME = tmpRoot;
    const repo = "/fake/my-repo";
    const slug = "test-atomic";

    const initial = await writeStatus(repo, slug, {
      slug,
      repo,
      worktree: null,
      cwd: repo,
      branch: "main",
      phase: "plan",
      tasks: { total: 3, done: 1, blockedId: null, blockedReason: null },
      lastCommand: "/matt-pocock-atomic-plan",
    });

    assert.equal(initial.phase, "plan");
    assert.equal(initial.shortRepo, "my-repo");

    const loaded = await readStatus(repo, slug);
    assert.ok(loaded);
    assert.equal(loaded.slug, slug);
    assert.equal(loaded.phase, "plan");
    assert.equal(loaded.tasks.done, 1);

    const updated = await updateStatus(repo, slug, {
      phase: "execute",
      tasks: { total: 3, done: 2, blockedId: null, blockedReason: null },
    });
    assert.equal(updated.phase, "execute");
    assert.equal(updated.tasks.done, 2);
  } finally {
    rmSync(tmpRoot, { recursive: true, force: true });
    if (orig !== undefined) process.env.MATT_POCOCK_WORKFLOW_HOME = orig;
    else delete process.env.MATT_POCOCK_WORKFLOW_HOME;
  }
});

test("writeStatus detects cross-repo collision and rejects overwrite", async () => {
  const tmpRoot = mkdtempSync(join(tmpdir(), "wf-test-"));
  const orig = process.env.MATT_POCOCK_WORKFLOW_HOME;
  try {
    process.env.MATT_POCOCK_WORKFLOW_HOME = tmpRoot;
    const repoA = "/fake/repo-one/my-repo";
    const repoB = "/different/path/my-repo";
    const slug = "same-slug";

    await writeStatus(repoA, slug, {
      slug,
      repo: repoA,
      phase: "explore",
    });

    await assert.rejects(
      async () => {
        await writeStatus(repoB, slug, {
          slug,
          repo: repoB,
          phase: "explore",
        });
      },
      /collision/i
    );
  } finally {
    rmSync(tmpRoot, { recursive: true, force: true });
    if (orig !== undefined) process.env.MATT_POCOCK_WORKFLOW_HOME = orig;
    else delete process.env.MATT_POCOCK_WORKFLOW_HOME;
  }
});

test("syncFromFiles parses TASKS file checkmarks and blockage", async () => {
  const tmpRoot = mkdtempSync(join(tmpdir(), "wf-test-"));
  const orig = process.env.MATT_POCOCK_WORKFLOW_HOME;
  try {
    process.env.MATT_POCOCK_WORKFLOW_HOME = tmpRoot;
    const repo = "/fake/my-repo";
    const slug = "sync-slug";

    const paths = getWorkflowPaths(repo, slug);
    mkdirSync(paths.docsDir, { recursive: true });

    const tasksContent = `# TASKS: test
- [x] T1 done item
- [ ] T2 blocked item
  막힘: build failure in step 2
- [ ] T3 remaining
`;
    writeFileSync(join(paths.docsDir, `TASKS-${slug}.md`), tasksContent, "utf8");

    const synced = await syncFromFiles(repo, slug);
    assert.equal(synced.tasks.total, 3);
    assert.equal(synced.tasks.done, 1);
    assert.equal(synced.tasks.blockedId, "T2");
    assert.match(synced.tasks.blockedReason, /build failure/);
  } finally {
    rmSync(tmpRoot, { recursive: true, force: true });
    if (orig !== undefined) process.env.MATT_POCOCK_WORKFLOW_HOME = orig;
    else delete process.env.MATT_POCOCK_WORKFLOW_HOME;
  }
});

test("listAllStatuses returns all recorded statuses across repos", async () => {
  const tmpRoot = mkdtempSync(join(tmpdir(), "wf-test-"));
  const orig = process.env.MATT_POCOCK_WORKFLOW_HOME;
  try {
    process.env.MATT_POCOCK_WORKFLOW_HOME = tmpRoot;
    await writeStatus("/fake/repo-a", "slug-1", { phase: "explore" });
    await writeStatus("/fake/repo-b", "slug-2", { phase: "execute" });

    const list = await listAllStatuses();
    assert.equal(list.length, 2);
    const slugs = list.map((item) => item.slug).sort();
    assert.deepEqual(slugs, ["slug-1", "slug-2"]);
  } finally {
    rmSync(tmpRoot, { recursive: true, force: true });
    if (orig !== undefined) process.env.MATT_POCOCK_WORKFLOW_HOME = orig;
    else delete process.env.MATT_POCOCK_WORKFLOW_HOME;
  }
});

test("importDocs copies .docs slugs into global home and records origin paths", async () => {
  const tmpRoot = mkdtempSync(join(tmpdir(), "wf-test-"));
  const repo = mkdtempSync(join(tmpdir(), "repo-"));
  const orig = process.env.MATT_POCOCK_WORKFLOW_HOME;
  try {
    process.env.MATT_POCOCK_WORKFLOW_HOME = tmpRoot;
    const slugDir = join(repo, ".docs", "legacy-slug");
    mkdirSync(slugDir, { recursive: true });
    writeFileSync(join(slugDir, "PLAN-legacy-slug.md"), "# PLAN\n", "utf8");
    writeFileSync(join(slugDir, "TASKS-legacy-slug.md"), "- [x] T1 done\n- [ ] T2 open\n", "utf8");

    const imported = await importDocs(repo, join(repo, ".docs"));
    assert.equal(imported.length, 1);
    assert.equal(imported[0].slug, "legacy-slug");
    assert.equal(imported[0].repo, repo);
    assert.equal(imported[0].sourceDocs, slugDir);
    assert.equal(imported[0].artifacts.plan, true);
    assert.equal(imported[0].artifacts.tasks, true);
    assert.equal(imported[0].tasks.total, 2);
    assert.equal(imported[0].tasks.done, 1);
    assert.equal(imported[0].phase, "execute");
  } finally {
    rmSync(tmpRoot, { recursive: true, force: true });
    rmSync(repo, { recursive: true, force: true });
    if (orig !== undefined) process.env.MATT_POCOCK_WORKFLOW_HOME = orig;
    else delete process.env.MATT_POCOCK_WORKFLOW_HOME;
  }
});
