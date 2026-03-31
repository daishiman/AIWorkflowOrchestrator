import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const CONFIG_PATH = new URL("../electron.vite.config.ts", import.meta.url);

describe("TASK-FIX-PRELOAD-VITE-ALIAS-SHARED-IPC-001", () => {
  it("preload で @repo/shared を externalize しない設定を持つ", () => {
    const source = readFileSync(CONFIG_PATH, "utf8");
    const preloadBlock = source.match(
      /preload:\s*\{([\s\S]*?)\n\s*\},\n\s*renderer:/,
    );

    expect(preloadBlock?.[1]).toBeTruthy();
    expect(preloadBlock?.[1]).toMatch(
      /externalizeDepsPlugin\(\{\s*exclude:\s*\["@repo\/shared"\]\s*\}\)/,
    );
  });

  it("preload で shared IPC channels を source path へ alias する", () => {
    const source = readFileSync(CONFIG_PATH, "utf8");
    const preloadBlock = source.match(
      /preload:\s*\{([\s\S]*?)\n\s*\},\n\s*renderer:/,
    );

    expect(preloadBlock?.[1]).toBeTruthy();
    expect(preloadBlock?.[1]).toMatch(
      /"@repo\/shared\/src\/ipc\/channels":\s*resolve\(\s*__dirname,\s*"\.\.\/\.\.\/packages\/shared\/src\/ipc\/channels\.ts",\s*\)/,
    );
  });
});
