# Phase 7: Dependency Edge Matrix

| edge             | source                                  | target                    | evidence                              |
| ---------------- | --------------------------------------- | ------------------------- | ------------------------------------- |
| shared build     | `packages/shared/tsup.config.ts`        | `dist/*.js`, `dist/*.cjs` | `build-verification.test.ts`          |
| shared publish   | `packages/shared/package.json`          | preload / consumers       | `build-verification.test.ts`          |
| preload bundling | `apps/desktop/electron.vite.config.ts`  | `out/preload/index.js`    | `preload-bundle-verification.test.ts` |
| install guard    | `scripts/setup-native-modules.sh`       | local dev env             | `native-module-verification.test.ts`  |
| package guard    | `electron-builder.yml` + afterPack hook | packaged app              | `native-module-verification.test.ts`  |
