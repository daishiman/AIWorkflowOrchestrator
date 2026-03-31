/**
 * preload バンドル検証テスト
 *
 * electron-vite 設定の preload セクションで @repo/shared が
 * externalizeDepsPlugin から除外されていることを検証する。
 * 設定ファイルの内容を静的に解析するユニットテスト（実際のビルドは不要）。
 */
import { describe, it, expect } from "vitest";
import { readFile } from "fs/promises";
import { resolve } from "path";

const DESKTOP_ROOT = resolve(__dirname, "..");
const ELECTRON_VITE_CONFIG_PATH = resolve(
  DESKTOP_ROOT,
  "electron.vite.config.ts",
);

describe("preload バンドル設定検証", () => {
  let configContent: string;

  beforeAll(async () => {
    configContent = await readFile(ELECTRON_VITE_CONFIG_PATH, "utf-8");
  });

  it("electron.vite.config.ts が存在し読み込めること", () => {
    expect(configContent).toBeDefined();
    expect(configContent.length).toBeGreaterThan(0);
  });

  it("preload セクションが存在すること", () => {
    expect(configContent).toContain("preload:");
    // もしくは preload プロパティとして
    expect(configContent).toMatch(/preload\s*:\s*\{/);
  });

  it("preload セクションで externalizeDepsPlugin に exclude オプションが設定されていること", () => {
    // preload セクション内で externalizeDepsPlugin({ exclude: [...] }) パターンを検出
    const preloadMatch = configContent.match(
      /preload\s*:\s*\{[\s\S]*?externalizeDepsPlugin\(\s*\{[\s\S]*?exclude\s*:\s*\[[\s\S]*?\][\s\S]*?\}\s*\)/,
    );
    expect(preloadMatch).not.toBeNull();
  });

  it("@repo/shared が externalizeDepsPlugin の exclude リストに含まれていること", () => {
    // preload セクション内の externalizeDepsPlugin で @repo/shared が除外されていることを確認
    const preloadSection = configContent.match(
      /preload\s*:\s*\{[\s\S]*?(?=\n\s{4}\},?\n\s{4}\w|\n\s{4}\};\n)/,
    );
    expect(preloadSection).not.toBeNull();

    const preloadContent = preloadSection![0];
    expect(preloadContent).toContain("externalizeDepsPlugin");
    expect(preloadContent).toContain("exclude");
    expect(preloadContent).toMatch(/@repo\/shared/);
  });

  it("main セクションの externalizeDepsPlugin には exclude が設定されていないこと（main は外部化のまま）", () => {
    // main セクションを抽出
    const mainMatch = configContent.match(
      /main\s*:\s*\{[\s\S]*?externalizeDepsPlugin\(\s*\)/,
    );
    expect(mainMatch).not.toBeNull();
  });
});
