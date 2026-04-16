import { defineConfig, externalizeDepsPlugin, loadEnv } from "electron-vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode);
  const sharedTsconfig = resolve(__dirname, "tsconfig.json");

  return {
    main: {
      plugins: [
        externalizeDepsPlugin(),
        tsconfigPaths({ projects: [sharedTsconfig] }),
      ],
      define: {
        "process.env.VITE_SUPABASE_URL": JSON.stringify(env.VITE_SUPABASE_URL),
        "process.env.VITE_SUPABASE_ANON_KEY": JSON.stringify(
          env.VITE_SUPABASE_ANON_KEY,
        ),
        "process.env.VITE_AUTH_REDIRECT_URL": JSON.stringify(
          env.VITE_AUTH_REDIRECT_URL,
        ),
      },
      resolve: {
        alias: {
          "@": resolve(__dirname, "src"),
        },
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
      plugins: [
        externalizeDepsPlugin({ exclude: ["@repo/shared"] }),
        tsconfigPaths({ projects: [sharedTsconfig] }),
      ],
      resolve: {
        // externalizeDepsPlugin の external チェックは resolveId より前に走るため、
        // resolve.alias だけでは @repo/shared の外部化を防げない。
        // exclude + alias の組み合わせで Rollup にソースをインライン化させる。
        alias: {
          "@repo/shared/src/ipc/channels": resolve(
            __dirname,
            "../../packages/shared/src/ipc/channels.ts",
          ),
        },
      },
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
      plugins: [react(), tsconfigPaths({ projects: [sharedTsconfig] })],
      build: {
        outDir: "out/renderer",
        rollupOptions: {
          input: {
            index: resolve(__dirname, "src/renderer/index.html"),
            "phase11-light-theme-contrast-guard": resolve(
              __dirname,
              "src/renderer/phase11-light-theme-contrast-guard.html",
            ),
            "phase11-execution-status-type-spec-sync": resolve(
              __dirname,
              "src/renderer/phase11-execution-status-type-spec-sync.html",
            ),
            "phase11-approval-request-surface": resolve(
              __dirname,
              "src/renderer/phase11-approval-request-surface.html",
            ),
            "phase11-task-llm-mod-05-renderer-desc-display": resolve(
              __dirname,
              "src/renderer/phase11-task-llm-mod-05-renderer-desc-display.html",
            ),
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
