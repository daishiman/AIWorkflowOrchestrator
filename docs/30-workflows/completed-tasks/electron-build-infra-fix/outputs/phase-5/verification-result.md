# Phase 5: Verification Result

| 対象                   | 結果 | 根拠                                                  |
| ---------------------- | ---- | ----------------------------------------------------- |
| shared dual output     | PASS | `packages/shared/tsup.config.ts` が `esm` + `cjs`     |
| shared exports require | PASS | `packages/shared/package.json` 全 export に `require` |
| preload bundling       | PASS | `electron.vite.config.ts` preload 設定                |
| desktop rebuild script | PASS | `apps/desktop/package.json` に `rebuild:electron`     |
| install guard          | PASS | `scripts/setup-native-modules.sh`                     |
| package guard          | PASS | `electron-builder.yml` + afterPack hook               |
