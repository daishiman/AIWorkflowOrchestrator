/**
 * agent-client.ts SDK直接利用の確認テスト
 * ipc-handlers.ts / skill-executor.ts が @anthropic-ai/sdk を直接 import していないことを検証
 * @module main/slide/__tests__/agent-client-removal.test
 */

import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { resolve } from "path";

const SLIDE_DIR = resolve(__dirname, "..");

describe("agent-client.ts SDK直接利用の確認 (AC-7)", () => {
  it("ipc-handlers.ts should NOT directly import @anthropic-ai/sdk", () => {
    const content = readFileSync(
      resolve(SLIDE_DIR, "ipc-handlers.ts"),
      "utf-8",
    );
    expect(content).not.toContain("@anthropic-ai/sdk");
    expect(content).not.toContain("safeStorage");
    expect(content).not.toContain("process.env.ANTHROPIC_API_KEY");
  });

  it("skill-executor.ts should NOT directly import @anthropic-ai/sdk", () => {
    const content = readFileSync(
      resolve(SLIDE_DIR, "skill-executor.ts"),
      "utf-8",
    );
    expect(content).not.toContain("@anthropic-ai/sdk");
    expect(content).not.toContain("process.env.ANTHROPIC_API_KEY");
  });
});
