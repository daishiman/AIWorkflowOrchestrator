# Documentation Changelog

## 変更ファイル一覧

### 実装ファイル

| ファイル                                               | 変更種別 | 差分概要                                                          |
| ------------------------------------------------------ | -------- | ----------------------------------------------------------------- |
| `packages/shared/tsup.config.ts`                       | 修正     | `format: ["esm", "cjs"]` へ変更                                   |
| `packages/shared/package.json`                         | 修正     | 34 exports に `require` 追加                                      |
| `apps/desktop/electron.vite.config.ts`                 | 修正     | shared plugin を factory 化し main / preload に適用               |
| `apps/desktop/package.json`                            | 修正     | `@electron/rebuild` 追加、`rebuild:electron` を手動復旧コマンド化 |
| `scripts/setup-native-modules.sh`                      | 修正     | root から desktop workspace を固定し Electron 検証 / 必要時再構築 |
| `apps/desktop/scripts/rebuild-native-for-electron.mjs` | 新規     | `afterPack` 時の native rebuild                                   |
| `apps/desktop/electron-builder.yml`                    | 修正     | `afterPack` フック追加                                            |
| `package.json`                                         | 修正     | root `postinstall` を bootstrap owner に固定                      |

### テストファイル

| ファイル                                                         | テスト数 | 差分概要                               |
| ---------------------------------------------------------------- | -------- | -------------------------------------- |
| `packages/shared/src/__tests__/build/cjs-exports.test.ts`        | 7        | shared dual output / exports 整合      |
| `apps/desktop/src/__tests__/build/preload-bundle.test.ts`        | 8        | preload bundle / externalizeDeps guard |
| `apps/desktop/src/__tests__/build/vite-config.test.ts`           | 2        | config guard                           |
| `apps/desktop/src/__tests__/build/native-module-rebuild.test.ts` | 8        | rebuild / afterPack / script guard     |
| `apps/desktop/src/__tests__/build/setup-script-fallback.test.ts` | 3        | root bootstrap / Electron 実行 guard   |
| `apps/desktop/src/__tests__/build/main-bundle.test.ts`           | 2        | main bundle guard                      |

### ドキュメント・仕様同期

| ファイル                                                                       | 役割                       |
| ------------------------------------------------------------------------------ | -------------------------- |
| `CHANGELOG.md`                                                                 | root changelog             |
| `CLAUDE.md`                                                                    | 開発者向け運用ガイド       |
| `docs/30-workflows/electron-build-infra-fix/artifacts.json`                    | root 台帳                  |
| `docs/30-workflows/electron-build-infra-fix/outputs/artifacts.json`            | outputs 台帳               |
| `docs/30-workflows/electron-build-infra-fix/phase-11-manual-test.md`           | 実測 Phase 11 記録         |
| `docs/30-workflows/electron-build-infra-fix/outputs/phase-12/*.md`             | Phase 12 必須 6 成果物     |
| `.claude/skills/aiworkflow-requirements/LOGS.md`                               | canonical log              |
| `.claude/skills/aiworkflow-requirements/SKILL.md`                              | canonical history          |
| `.claude/skills/aiworkflow-requirements/references/deployment-electron.md`     | deployment current fact    |
| `.claude/skills/aiworkflow-requirements/references/technology-desktop.md`      | desktop stack current fact |
| `.claude/skills/aiworkflow-requirements/references/task-workflow-completed.md` | completed ledger           |
| `.claude/skills/aiworkflow-requirements/references/task-workflow-history.md`   | history ledger             |
| `.agents/skills/aiworkflow-requirements/...`                                   | mirror sync                |

## 検証結果

| 項目                                                                   | 結果                                                 |
| ---------------------------------------------------------------------- | ---------------------------------------------------- |
| `pnpm --filter @repo/shared exec npx vitest run src/__tests__/build/`  | 7 PASS                                               |
| `pnpm --filter @repo/desktop exec npx vitest run src/__tests__/build/` | 23 PASS                                              |
| `pnpm --filter @repo/shared build`                                     | 成功                                                 |
| `pnpm --filter @repo/desktop build`                                    | 成功                                                 |
| `pnpm lint`                                                            | 0 errors, 10 warnings                                |
| `pnpm typecheck`                                                       | 0 errors                                             |
| `pnpm install`                                                         | 成功、root `postinstall` 完走                        |
| `pnpm --filter @repo/desktop dev`                                      | `start electron app...` まで到達、起動直後エラーなし |
| `validate-phase12-implementation-guide.js`                             | `ok: true`                                           |
| `validate-phase-output.js docs/30-workflows/electron-build-infra-fix`  | 検証成功（0エラー、0警告）                           |
| `audit-unassigned-tasks.js --json --diff-from HEAD`                    | `currentViolations: 0`                               |

## current / baseline 区別

- **baseline**
  - root `artifacts.json` が pending のまま
  - `outputs/artifacts.json` だけ completed
  - `phase-11-manual-test.md` が空欄
  - `implementation-guide.md` が `@electron/rebuild@^4.1.1` と誤記
  - system spec が Electron bootstrap owner を反映していない

- **current**
  - root / outputs 台帳を completed へ整合
  - Phase 11 実測値を反映
  - Phase 11 補助成果物として `screenshot-plan.json` と PNG 証跡を追加
  - `@electron/rebuild@^4.0.3` に修正
  - root `postinstall` / desktop `rebuild:electron` / `afterPack` の三層責務を文書化
  - canonical / mirror を same-wave sync

## 台帳同期

- `docs/30-workflows/electron-build-infra-fix/artifacts.json` と `docs/30-workflows/electron-build-infra-fix/outputs/artifacts.json` を同期した
- Phase 12 artifacts に root 文書と system spec canonical / mirror を追加した
- `phase-12-documentation.md` に same-wave sync 対象を追記した

## future wording チェック

- `phase-12-documentation.md`
- `docs/30-workflows/electron-build-infra-fix/outputs/phase-12/*.md`

上記を確認し、`更新予定` / `計画済み` / `PR マージ後に実施` のような未実施前提の表現を残していないことを確認した。
