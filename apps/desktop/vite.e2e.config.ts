/**
 * E2Eテスト用Vite設定
 *
 * PlaywrightテストではRendererプロセスのみをテストするため、
 * electron-viteとは別にViteサーバーを起動する
 */

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  root: resolve(__dirname, "src/renderer"),
  resolve: {
    alias: {
      "@renderer": resolve(__dirname, "src/renderer"),
    },
  },
  server: {
    port: 5173,
    strictPort: true,
  },
  // E2E環境フラグのみ定義（electronAPIはaddInitScriptで注入）
  define: {
    "import.meta.env.VITE_E2E_MODE": JSON.stringify("true"),
  },
});
