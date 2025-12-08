/**
 * E2Eテスト用Vite設定
 *
 * PlaywrightテストではRendererプロセスのみをテストするため、
 * electron-viteとは別にViteサーバーを起動する
 */

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

export default defineConfig({
  plugins: [react()],
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
  // electronAPIのモック用グローバル変数
  define: {
    "window.electronAPI": JSON.stringify(undefined),
  },
});
