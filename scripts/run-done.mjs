#!/usr/bin/env node
import { spawn } from "node:child_process";
import { writeFile } from "node:fs/promises";
import { createWriteStream } from "node:fs";
import { join } from "node:path";

/**
 * 명령을 실행하고 stdout/stderr를 logPath에 저장한 뒤 요약 JSON을 쓴다.
 * @param {{ cwd?: string, command: string, logPath: string, timeoutMs: number }} opts
 * @returns {Promise<{ ok: boolean, exitCode: number, outputPath: string }>}
 */
export async function runDone({ cwd, command, logPath, timeoutMs }) {
  const donePath = `${logPath}.done.json`;

  return new Promise((resolve) => {
    const child = spawn(command, {
      cwd: cwd || process.cwd(),
      shell: true,
    });

    const logStream = createWriteStream(logPath);
    child.stdout.pipe(logStream);
    child.stderr.pipe(logStream);

    const timer = setTimeout(async () => {
      child.kill();
      await writeSummary(donePath, { ok: false, exitCode: -1, outputPath: donePath, command });
      resolve({ ok: false, exitCode: -1, outputPath: donePath });
    }, timeoutMs);

    child.on("close", async (exitCode) => {
      clearTimeout(timer);
      // 스트림이 아직 끝나지 않았을 수 있으므로 flush 후 요약 작성
      await new Promise((resolveStream) => logStream.end(resolveStream));
      await writeSummary(donePath, { ok: exitCode === 0, exitCode, outputPath: donePath, command });
      resolve({ ok: exitCode === 0, exitCode, outputPath: donePath });
    });

    child.on("error", async () => {
      clearTimeout(timer);
      await writeSummary(donePath, { ok: false, exitCode: -1, outputPath: donePath, command });
      resolve({ ok: false, exitCode: -1, outputPath: donePath });
    });
  });
}

async function writeSummary(path, data) {
  try {
    await writeFile(path, JSON.stringify(data, null, 2) + "\n", "utf8");
  } catch {
    // 요약 작성 실패 시 무시
  }
}

// CLI 실행 엔트리포인트
if (process.argv[1] && process.argv[1].endsWith("run-done.mjs")) {
  const args = process.argv.slice(2);
  const command = args.join(" ");
  const logPath = args[args.length - 1] || "output.log";
  const timeoutMs = parseInt(process.env.TIMEOUT_MS || "30000", 10);

  runDone({ command, logPath, timeoutMs }).then((result) => {
    console.log(JSON.stringify(result, null, 2));
    process.exit(result.ok ? 0 : 1);
  });
}
