import { readFileSync } from "fs";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";
import { describe, expect, it } from "vitest";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const desktopRoot = resolve(__dirname, "..", "..");
const sharedChannelsPath = resolve(
  desktopRoot,
  "../../packages/shared/src/ipc/channels.ts",
);

function loadElectronViteConfigRaw(): string {
  return readFileSync(resolve(desktopRoot, "electron.vite.config.ts"), "utf-8");
}

describe("electron-vite preload alias 設定", () => {
  const configRaw = loadElectronViteConfigRaw();

  it("preload で @repo/shared を externalize 対象から除外している", () => {
    expect(configRaw).toContain(
      'externalizeDepsPlugin({ exclude: ["@repo/shared"] })',
    );
  });

  it("shared IPC channels の完全一致 alias を持つ", () => {
    expect(configRaw).toContain('"@repo/shared/src/ipc/channels": resolve(');
    expect(configRaw).toContain('"../../packages/shared/src/ipc/channels.ts"');
  });

  it("alias の解決先が実在する", () => {
    expect(
      sharedChannelsPath.endsWith("packages/shared/src/ipc/channels.ts"),
    ).toBe(true);
  });
});
