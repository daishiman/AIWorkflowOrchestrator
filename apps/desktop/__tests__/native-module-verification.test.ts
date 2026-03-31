// @vitest-environment node

import { describe, it, expect } from "vitest";
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { normalizeElectronBuilderArch } from "../scripts/rebuild-native-for-electron.mjs";

const ROOT = resolve(__dirname, "..");
const PROJECT_ROOT = resolve(__dirname, "../../..");

describe("native-module-verification: Electron ABI リビルド導線", () => {
  describe("setup-native-modules.sh — Electron ABI 検査コード", () => {
    const scriptPath = resolve(PROJECT_ROOT, "scripts/setup-native-modules.sh");

    it("スクリプトファイルが存在する", () => {
      expect(existsSync(scriptPath)).toBe(true);
    });

    it("Electron ABI 検査コードを含む", () => {
      const content = readFileSync(scriptPath, "utf-8");
      expect(content).toContain("Electron ABI");
      expect(content).toContain("ELECTRON_RUN_AS_NODE=1");
      expect(content).toContain("better-sqlite3");
    });

    it("Electron バイナリ検索ロジックを含む", () => {
      const content = readFileSync(scriptPath, "utf-8");
      expect(content).toContain("Electron.app");
      expect(content).toContain("electron.exe");
    });

    it("Electron が見つからない場合のスキップ処理を含む", () => {
      const content = readFileSync(scriptPath, "utf-8");
      expect(content).toContain("Electron ABI検査をスキップ");
    });

    it("失敗時に rebuild:electron を呼び出す導線を含む", () => {
      const content = readFileSync(scriptPath, "utf-8");
      expect(content).toContain("rebuild:electron");
    });
  });

  describe("rebuild-native-for-electron.mjs — afterPack hook スクリプト", () => {
    const scriptPath = resolve(ROOT, "scripts/rebuild-native-for-electron.mjs");

    it("スクリプトファイルが存在する", () => {
      expect(existsSync(scriptPath)).toBe(true);
    });

    it("afterPack 関数を default export している", () => {
      const content = readFileSync(scriptPath, "utf-8");
      expect(content).toContain("export default async function afterPack");
    });

    it("better-sqlite3 の再ビルドコマンドを含む", () => {
      const content = readFileSync(scriptPath, "utf-8");
      expect(content).toContain("@electron/rebuild");
      expect(content).toContain("better-sqlite3");
    });

    it("darwin と非darwin の node_modules パスを分岐処理する", () => {
      const content = readFileSync(scriptPath, "utf-8");
      expect(content).toContain('electronPlatformName === "darwin"');
      expect(content).toContain("app.asar.unpacked/node_modules");
    });

    it("electron-builder の arch enum を electron-rebuild の文字列 arch に正規化する", async () => {
      expect(normalizeElectronBuilderArch(1)).toBe("x64");
      expect(normalizeElectronBuilderArch(3)).toBe("arm64");
      expect(normalizeElectronBuilderArch("x64")).toBe("x64");
    });
  });

  describe("electron-builder.yml — afterPack hook 登録", () => {
    const ymlPath = resolve(ROOT, "electron-builder.yml");

    it("設定ファイルが存在する", () => {
      expect(existsSync(ymlPath)).toBe(true);
    });

    it("afterPack が scripts/rebuild-native-for-electron.mjs に設定されている", () => {
      const content = readFileSync(ymlPath, "utf-8");
      expect(content).toContain(
        "afterPack: scripts/rebuild-native-for-electron.mjs",
      );
    });
  });

  describe("desktop package.json — rebuild:electron スクリプト", () => {
    const pkgPath = resolve(ROOT, "package.json");

    it("package.json が存在する", () => {
      expect(existsSync(pkgPath)).toBe(true);
    });

    it("rebuild:electron スクリプトが定義されている", () => {
      const pkg = JSON.parse(readFileSync(pkgPath, "utf-8"));
      expect(pkg.scripts["rebuild:electron"]).toBeDefined();
      expect(pkg.scripts["rebuild:electron"]).toContain(
        "rebuild-sqlite-for-electron",
      );
    });

    it("@electron/rebuild が devDependencies に含まれている", () => {
      const pkg = JSON.parse(readFileSync(pkgPath, "utf-8"));
      expect(pkg.devDependencies["@electron/rebuild"]).toBeDefined();
    });
  });

  // TODO(human): 環境に応じた ABI ロードテスト
  // Electron バイナリが存在する場合のみ、実際に better-sqlite3 をロードして
  // ABI 互換性を検証するテストを追加してください。
  // CI など Electron がない環境ではスキップする方式を想定しています。
});
