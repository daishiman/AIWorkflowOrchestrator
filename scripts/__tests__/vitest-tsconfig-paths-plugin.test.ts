/**
 * vitest-tsconfig-paths プラグイン導入後の検証テスト
 *
 * Category B: プラグイン導入検証（4件）
 * - B1: vite-tsconfig-paths が devDependencies に存在
 * - B2: vitest.config.ts の plugins に tsconfigPaths() が含まれる
 * - B3: @repo/shared 系手動 alias が削除されている
 * - B4: プロジェクトローカル alias が残っている
 */

import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";

const ROOT_DIR = path.resolve(__dirname, "../..");
const DESKTOP_DIR = path.resolve(ROOT_DIR, "apps/desktop");

describe("vitest-tsconfig-paths プラグイン導入検証", () => {
  // #B1: vite-tsconfig-paths が devDependencies に存在する
  it("vite-tsconfig-paths が apps/desktop/package.json の devDependencies に存在する", () => {
    const packageJsonPath = path.resolve(DESKTOP_DIR, "package.json");
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf-8"));

    expect(packageJson.devDependencies).toBeDefined();
    expect(packageJson.devDependencies["vite-tsconfig-paths"]).toBeDefined();
  });

  // #B2: vitest.config.ts の plugins に tsconfigPaths() が含まれる
  it("vitest.config.ts の plugins に tsconfigPaths() が含まれる", () => {
    const vitestConfigPath = path.resolve(DESKTOP_DIR, "vitest.config.ts");
    const content = fs.readFileSync(vitestConfigPath, "utf-8");

    // import文の確認
    expect(content).toContain(
      'import tsconfigPaths from "vite-tsconfig-paths"',
    );
    // plugins配列にtsconfigPaths()が含まれる
    expect(content).toMatch(/plugins:\s*\[.*tsconfigPaths\(\).*\]/s);
  });

  // #B3: @repo/shared 系手動 alias が削除されている
  it("@repo/shared 系手動 alias が vitest.config.ts から削除されている", () => {
    const vitestConfigPath = path.resolve(DESKTOP_DIR, "vitest.config.ts");
    const content = fs.readFileSync(vitestConfigPath, "utf-8");

    // @repo/shared 系の手動 alias が含まれていないことを確認
    // ただしコメント内の言及は許容
    const aliasRegex = /"@repo\/shared[^"]*":\s*resolve\(\s*__dirname/g;
    const matches = content.match(aliasRegex);

    expect(matches).toBeNull();
  });

  // #B4: プロジェクトローカル alias（@, @renderer, @main, @anthropic-ai/claude-agent-sdk）が残っている
  it("プロジェクトローカル alias が vitest.config.ts に残っている", () => {
    const vitestConfigPath = path.resolve(DESKTOP_DIR, "vitest.config.ts");
    const content = fs.readFileSync(vitestConfigPath, "utf-8");

    // @, @renderer, @main が残っている
    expect(content).toContain('"@":');
    expect(content).toContain('"@renderer":');
    expect(content).toContain('"@main":');
    // SDK モック alias が残っている
    expect(content).toContain('"@anthropic-ai/claude-agent-sdk":');
  });
});
