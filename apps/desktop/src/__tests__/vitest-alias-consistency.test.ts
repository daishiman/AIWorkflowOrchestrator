/**
 * Vitest alias と TypeScript paths の整合性テスト
 *
 * vitest.config.ts の resolve.alias と tsconfig.json の paths が
 * 同一のモジュールを指していることを検証する。
 * TASK-FIX-TS-SHARED-MODULE-RESOLUTION-001 Phase 4
 */
import { readFileSync, existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { describe, it, expect } from "vitest";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const desktopRoot = resolve(__dirname, "../..");

function loadDesktopTsconfig(): Record<string, unknown> {
  const content = readFileSync(resolve(desktopRoot, "tsconfig.json"), "utf-8");
  return JSON.parse(content);
}

/**
 * vitest.config.ts から @repo/shared 関連の alias を抽出する。
 */
function parseVitestAliases(): Record<string, string> {
  const content = readFileSync(
    resolve(desktopRoot, "vitest.config.ts"),
    "utf-8",
  );

  const aliases: Record<string, string> = {};
  const regex =
    /"(@repo\/shared[^"]*)":\s*resolve\(\s*__dirname,\s*"([^"]+)"\s*,?\s*\)/g;
  let match;
  while ((match = regex.exec(content)) !== null) {
    aliases[match[1]] = match[2];
  }
  return aliases;
}

describe("Vitest alias と TypeScript paths の整合性", () => {
  const tsconfig = loadDesktopTsconfig();
  const compilerOptions = tsconfig.compilerOptions as Record<string, unknown>;
  const paths = compilerOptions.paths as Record<string, string[]>;
  const vitestAliases = parseVitestAliases();

  describe("T-VAC-01: Vitest alias の全エントリが TypeScript paths に存在する", () => {
    const aliasKeys = Object.keys(vitestAliases);
    for (const key of aliasKeys) {
      it(`Vitest alias "${key}" に対応する TypeScript paths が存在する`, () => {
        expect(paths).toHaveProperty(key);
      });
    }
  });

  describe("T-VAC-02: TypeScript paths の @repo/shared エントリが Vitest alias に存在する", () => {
    const repoSharedPaths = Object.keys(paths).filter((k) =>
      k.startsWith("@repo/shared"),
    );
    for (const key of repoSharedPaths) {
      it(`TypeScript paths "${key}" に対応する Vitest alias が存在する`, () => {
        expect(vitestAliases).toHaveProperty(key);
      });
    }
  });

  describe("T-VAC-03: alias と paths が同一のソースファイルを指している", () => {
    const aliasKeys = Object.keys(vitestAliases);
    for (const key of aliasKeys) {
      it(`"${key}" の alias と paths が同じファイルを指す`, () => {
        const aliasRelPath = vitestAliases[key];
        const aliasAbsPath = resolve(desktopRoot, aliasRelPath);

        const pathsEntry = paths[key];
        if (!pathsEntry) return;

        const pathsAbsPath = resolve(desktopRoot, pathsEntry[0]);
        expect(aliasAbsPath).toBe(pathsAbsPath);
      });
    }
  });

  describe("T-VAC-04: 全てのパスが実在するファイルを指している", () => {
    const aliasKeys = Object.keys(vitestAliases);
    for (const key of aliasKeys) {
      it(`"${key}" の alias パスが実在する`, () => {
        const aliasRelPath = vitestAliases[key];
        const aliasAbsPath = resolve(desktopRoot, aliasRelPath);
        expect(existsSync(aliasAbsPath)).toBe(true);
      });
    }
  });
});
