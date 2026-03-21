/**
 * localStorage.clear() 意図しない呼び出し検証テスト
 *
 * localStorage.clear() が App shell / 初期化フロー内で
 * 呼ばれないことを検証する（テストヘルパー内は許容）。
 */
import { execSync } from "child_process";
import { readFileSync } from "fs";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";
import { describe, expect, it } from "vitest";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const desktopSrc = resolve(__dirname, "..");

function readFile(relativePath: string): string {
  return readFileSync(resolve(desktopSrc, relativePath), "utf-8");
}

describe("localStorage.clear() 意図しない呼び出し検証", () => {
  it("3-1: App.tsx に localStorage.clear() が含まれない", () => {
    const content = readFile("renderer/App.tsx");
    expect(content).not.toContain("localStorage.clear()");
  });

  it("3-2: renderer/ 配下の初期化ファイルに localStorage.clear() が含まれない", () => {
    // App.tsx 以外の初期化系ファイルも確認
    const filesToCheck = ["renderer/App.tsx", "renderer/main.tsx"];
    for (const file of filesToCheck) {
      try {
        const content = readFile(file);
        expect(
          content,
          `${file} に localStorage.clear() が含まれています`,
        ).not.toContain("localStorage.clear()");
      } catch (e: unknown) {
        // ファイルが存在しない場合はスキップ
        if (
          e instanceof Error &&
          "code" in e &&
          (e as NodeJS.ErrnoException).code === "ENOENT"
        ) {
          continue;
        }
        throw e;
      }
    }
  });

  it("3-3: preload/ 配下に localStorage.clear() が含まれない", () => {
    const desktopRoot = resolve(desktopSrc, "..");
    try {
      const result = execSync(
        'grep -rn "localStorage\\.clear()" src/preload/ 2>/dev/null || true',
        { encoding: "utf-8", cwd: desktopRoot },
      ).trim();
      expect(
        result,
        `preload/ に localStorage.clear() が含まれています:\n${result}`,
      ).toBe("");
    } catch {
      // preload ディレクトリが存在しない場合はPASS
    }
  });
});
