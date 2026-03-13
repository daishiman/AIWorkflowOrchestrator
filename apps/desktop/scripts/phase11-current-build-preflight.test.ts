// @vitest-environment node

import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  parsePhase11CurrentBuildPreflightArgs,
  runPhase11CurrentBuildPreflightCli,
} from "./phase11-current-build-preflight.mjs";

const createdDirs: string[] = [];
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

afterEach(async () => {
  await Promise.all(
    createdDirs
      .splice(0)
      .map((dir) => fs.rm(dir, { recursive: true, force: true })),
  );
});

function createResult(overrides: Record<string, unknown> = {}) {
  return {
    bundleName: "phase11-current-build-preflight",
    timestamp: "2026-03-13T00:00:00.000Z",
    baseUrl: "http://127.0.0.1:4173",
    summary: {
      status: "pass",
      failedBucket: null,
      readyForCapture: true,
      autoServed: false,
      exitCode: 0,
    },
    checks: [],
    guidance: [],
    ...overrides,
  };
}

describe("phase11-current-build-preflight CLI", () => {
  it("argv を期待どおりに解釈する", () => {
    expect(
      parsePhase11CurrentBuildPreflightArgs([
        "--json",
        "--write",
        "tmp/report.json",
        "--base-url",
        "http://127.0.0.1:4280",
        "--no-auto-serve",
      ]),
    ).toEqual({
      baseUrl: "http://127.0.0.1:4280",
      json: true,
      noAutoServe: true,
      write: "tmp/report.json",
    });
  });

  it("--json で shared core の結果をそのまま返す", async () => {
    const runPreflight = vi.fn(async () => ({
      result: createResult(),
      cleanup: null,
    }));
    const cliResult = await runPhase11CurrentBuildPreflightCli(["--json"], {
      runPreflight,
    });

    expect(cliResult.exitCode).toBe(0);
    expect(JSON.parse(cliResult.output)).toMatchObject({
      bundleName: "phase11-current-build-preflight",
      summary: { status: "pass" },
    });
  });

  it("--write で指定先へ JSON を書き込む", async () => {
    const tempDir = await fs.mkdtemp(
      path.join(os.tmpdir(), "phase11-preflight-"),
    );
    createdDirs.push(tempDir);

    const cliResult = await runPhase11CurrentBuildPreflightCli(
      ["--write", "artifacts/preflight.json"],
      {
        repoRoot: tempDir,
        runPreflight: async () => ({
          result: createResult(),
          cleanup: null,
        }),
      },
    );

    expect(cliResult.writePath).toBe(
      path.join(tempDir, "artifacts/preflight.json"),
    );
    const written = JSON.parse(
      await fs.readFile(cliResult.writePath as string, "utf8"),
    );
    expect(written.bundleName).toBe("phase11-current-build-preflight");
  });

  it("--base-url と --no-auto-serve を shared core へ伝える", async () => {
    const runPreflight = vi.fn(async () => ({
      result: createResult({
        baseUrl: "http://127.0.0.1:4280",
        summary: {
          status: "fail",
          failedBucket: "baseUrl",
          readyForCapture: false,
          autoServed: false,
          exitCode: 40,
        },
      }),
      cleanup: null,
    }));

    const cliResult = await runPhase11CurrentBuildPreflightCli(
      ["--base-url", "http://127.0.0.1:4280", "--no-auto-serve"],
      {
        runPreflight,
      },
    );

    expect(runPreflight).toHaveBeenCalledWith({
      baseUrl: "http://127.0.0.1:4280",
      autoServe: false,
    });
    expect(cliResult.exitCode).toBe(40);
  });

  it("capture script が shared core 呼び出しへ寄せられている", async () => {
    const source = await fs.readFile(
      path.join(
        __dirname,
        "capture-light-theme-contrast-regression-guard-phase11.mjs",
      ),
      "utf8",
    );

    expect(source).toContain("runPhase11CurrentBuildPreflight");
    expect(source).not.toContain("probeStaticServer(");
    expect(source).not.toContain("startRendererStaticServer(");
  });
});
