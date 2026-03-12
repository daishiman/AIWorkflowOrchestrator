// @vitest-environment node

import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import net from "node:net";
import { afterEach, describe, expect, it } from "vitest";
import {
  canAutoStartLocalStaticServer,
  probeStaticServer,
  startRendererStaticServer,
} from "./phase11-static-server.mjs";

async function getFreePort() {
  return await new Promise((resolve, reject) => {
    const server = net.createServer();
    server.once("error", reject);
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      if (!address || typeof address === "string") {
        reject(new Error("Failed to resolve free port"));
        return;
      }
      const { port } = address;
      server.close((error) => {
        if (error) {
          reject(error);
          return;
        }
        resolve(port);
      });
    });
  });
}

const createdDirs = [];

afterEach(async () => {
  await Promise.all(
    createdDirs
      .splice(0)
      .map((dir) => fs.rm(dir, { recursive: true, force: true })),
  );
});

describe("phase11-static-server", () => {
  it("localhost 系の baseUrl のみ auto-start 対象にする", () => {
    expect(canAutoStartLocalStaticServer("http://127.0.0.1:4173")).toBe(true);
    expect(canAutoStartLocalStaticServer("http://localhost:4173")).toBe(true);
    expect(canAutoStartLocalStaticServer("https://example.com")).toBe(false);
  });

  it("renderer out を static serve して readiness probe を通せる", async () => {
    const tempDir = await fs.mkdtemp(
      path.join(os.tmpdir(), "phase11-static-server-"),
    );
    createdDirs.push(tempDir);

    await fs.writeFile(
      path.join(tempDir, "phase11-light-theme-contrast-guard.html"),
      "<!doctype html><html><body>phase11</body></html>",
      "utf8",
    );
    await fs.mkdir(path.join(tempDir, "assets"), { recursive: true });
    await fs.writeFile(
      path.join(tempDir, "assets", "example.js"),
      "console.log('ok');",
      "utf8",
    );

    const port = await getFreePort();
    const baseUrl = `http://127.0.0.1:${port}`;
    const server = await startRendererStaticServer({
      baseUrl,
      rootDir: tempDir,
    });

    try {
      expect(
        await probeStaticServer(
          `${baseUrl}/phase11-light-theme-contrast-guard.html?surface=settings&theme=light`,
        ),
      ).toBe(true);

      const response = await fetch(`${baseUrl}/assets/example.js`);

      expect(response.status).toBe(200);
      expect(await response.text()).toContain("console.log");
    } finally {
      await server.close();
    }
  });
});
