import { defineConfig, externalizeDepsPlugin, loadEnv } from "electron-vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode);

  return {
    main: {
      plugins: [externalizeDepsPlugin()],
      define: {
        "process.env.VITE_SUPABASE_URL": JSON.stringify(env.VITE_SUPABASE_URL),
        "process.env.VITE_SUPABASE_ANON_KEY": JSON.stringify(
          env.VITE_SUPABASE_ANON_KEY,
        ),
        "process.env.VITE_AUTH_REDIRECT_URL": JSON.stringify(
          env.VITE_AUTH_REDIRECT_URL,
        ),
      },
      build: {
        outDir: "out/main",
        rollupOptions: {
          input: {
            index: resolve(__dirname, "src/main/index.ts"),
          },
        },
      },
    },
    preload: {
      plugins: [externalizeDepsPlugin()],
      build: {
        outDir: "out/preload",
        rollupOptions: {
          input: {
            index: resolve(__dirname, "src/preload/index.ts"),
          },
          output: {
            format: "cjs",
            entryFileNames: "[name].js",
          },
        },
      },
    },
    renderer: {
      plugins: [react()],
      build: {
        outDir: "out/renderer",
        rollupOptions: {
          input: {
            index: resolve(__dirname, "src/renderer/index.html"),
          },
        },
      },
      resolve: {
        alias: {
          "@renderer": resolve(__dirname, "src/renderer"),
          "@": resolve(__dirname, "src"),
        },
      },
    },
  };
});
