# Phase 11: 手動テスト - IPC契約ドリフト自動検出スクリプト

## メタ情報

| 項目     | 値                                           |
| -------- | -------------------------------------------- |
| Phase    | 11                                           |
| 機能名   | UT-TASK06-007-ipc-contract-drift-auto-detect |
| 作成日   | 2026-03-18                                   |
| 再監査日 | 2026-03-19                                   |

## 目的

本タスクは docs-heavy / backend-heavy だが、ユーザーから「画面関係の検証はスクリーンショットで行うこと」と明示要求があったため、Phase 11 を `NON_VISUAL` 単独ではなく `SCREENSHOT + 非視覚コマンド検証` の二層で再実施する。

## 実行タスク

- Screenshot Capture: representative dashboard harness を workflow 配下へ撮影し、画面 sanity check の証跡を残す
- Visual Review: スクリーンショット 5 件を目視確認し、overflow / 可読性 / テーマ破綻の有無を確認する
- CLI Replay: `check-ipc-contracts.ts` の `report-only` / `json` / `strict` を再実行する
- Quality Replay: `typecheck` / 対象テスト / 対象カバレッジを再実行する
- Result Sync: `manual-test-result.md` と `discovered-issues.md` に結果を同期する

## テスト方式

- `SCREENSHOT`: current workflow 配下に representative dashboard harness を撮影し、branch 全体の画面 sanity check を確認する
- `NON_VISUAL`: `check-ipc-contracts.ts` の CLI 挙動、typecheck、対象テスト、対象カバレッジを再確認する

## テストケース

| テストケース | 種別       | 対象                                        | 目的                                          | 期待結果                                                 |
| ------------ | ---------- | ------------------------------------------- | --------------------------------------------- | -------------------------------------------------------- |
| TC-11-01     | SCREENSHOT | ホーム通常表示（light / desktop）           | 通常状態の余白、情報量、可読性を確認          | 主要カードとタイムラインが欠けずに表示される             |
| TC-11-02     | SCREENSHOT | ホーム empty state（light / desktop）       | empty state の導線と CTA を確認               | 空状態メッセージと CTA が中央で破綻なく表示される        |
| TC-11-03     | SCREENSHOT | ホーム loading state（dark / desktop）      | loading skeleton と dark theme の視認性を確認 | skeleton が崩れず、dark 背景で文字コントラストを維持する |
| TC-11-04     | SCREENSHOT | ホーム通常表示（dark / mobile）             | mobile 幅での積み上がりと overflow を確認     | カードが1列化し、横スクロールや文字切れがない            |
| TC-11-05     | SCREENSHOT | ホーム通常表示（kanagawa-dragon / desktop） | 別テーマ適用時の可読性と配色破綻を確認        | テーマ切替後も見出し・本文・カード境界が識別できる       |

## 画面カバレッジマトリクス

| テストケース | 状態                               | ルート                                                            | Viewport | 証跡                                                    | 判定基準                                   |
| ------------ | ---------------------------------- | ----------------------------------------------------------------- | -------- | ------------------------------------------------------- | ------------------------------------------ |
| TC-11-01     | normal / light / desktop           | `/phase11-dashboard-home.html?state=normal&theme=light`           | 1440x980 | `screenshots/TC-11-01-home-normal-light-desktop.png`    | 3カラム相当のカード配置が崩れない          |
| TC-11-02     | empty / light / desktop            | `/phase11-dashboard-home.html?state=empty&theme=light`            | 1440x980 | `screenshots/TC-11-02-home-empty-light-desktop.png`     | CTA が欠けず、空状態説明が読める           |
| TC-11-03     | loading / dark / desktop           | `/phase11-dashboard-home.html?state=loading&theme=dark`           | 1440x980 | `screenshots/TC-11-03-home-loading-dark-desktop.png`    | skeleton と背景のコントラストが維持される  |
| TC-11-04     | normal / dark / mobile             | `/phase11-dashboard-home.html?state=normal&theme=dark`            | 390x844  | `screenshots/TC-11-04-home-normal-mobile-dark.png`      | 1列レイアウトで overflow しない            |
| TC-11-05     | normal / kanagawa-dragon / desktop | `/phase11-dashboard-home.html?state=normal&theme=kanagawa-dragon` | 1440x980 | `screenshots/TC-11-05-home-normal-kanagawa-desktop.png` | テーマ変更後も境界・本文・CTA が識別できる |

## 非視覚確認項目

| ID       | コマンド / 方法                                                                       | 期待結果               |
| -------- | ------------------------------------------------------------------------------------- | ---------------------- |
| NV-11-06 | `pnpm tsx apps/desktop/scripts/check-ipc-contracts.ts --report-only`                  | exit 0、診断結果を出力 |
| NV-11-07 | `pnpm tsx apps/desktop/scripts/check-ipc-contracts.ts --report-only --format json`    | jq で解釈可能な JSON   |
| NV-11-08 | `/usr/bin/time -p pnpm tsx apps/desktop/scripts/check-ipc-contracts.ts --report-only` | 10秒以内               |
| NV-11-09 | `pnpm tsx apps/desktop/scripts/check-ipc-contracts.ts --strict`                       | error 検出時に exit 1  |
| NV-11-10 | `pnpm --filter @repo/desktop typecheck`                                               | PASS                   |
| NV-11-11 | `pnpm --filter @repo/desktop test:run scripts/__tests__/check-ipc-contracts.test.ts`  | PASS                   |

## 実行手順

1. `pnpm --filter @repo/desktop exec node scripts/capture-dashboard-home-phase11.mjs --output-dir ... --port 4283` で representative dashboard harness を current workflow 配下へ capture
2. 5枚の png を目視確認し、可読性・overflow・テーマ破綻の有無を評価
3. `check-ipc-contracts.ts` の `report-only` / `json` / `strict` / 実行時間 / typecheck / targeted tests / targeted coverage を再実行
4. 結果を `manual-test-result.md` と `discovered-issues.md` に同期

## 統合テスト連携

- Phase 9 で確定した summary 値を Phase 11 の CLI 再検証でも再確認する
- Phase 11 の screenshot evidence は `manual-test-result.md` の TC-ID と 1:1 で突合する
- Phase 12 では `validate-phase11-screenshot-coverage.js` と `validate-phase-output.js --phase 11` の結果を documentation 側へ反映する

## 参照資料

- `phase-2-design.md`
- `phase-5-implementation.md`
- `phase-6-test-expansion.md`
- `outputs/phase-7/coverage-report.md`
- `outputs/phase-8/refactoring-report.md`
- `phase-9-quality-assurance.md`
- `phase-10-final-review.md`
- `.claude/skills/task-specification-creator/references/phase-template-phase11.md`
- `.claude/skills/task-specification-creator/references/screenshot-verification-procedure.md`
- `.claude/skills/aiworkflow-requirements/references/ipc-contract-checklist.md`
- `outputs/phase-11/manual-test-result.md`
- `outputs/phase-11/discovered-issues.md`

## 成果物

| 成果物             | パス                                     | 内容                                      |
| ------------------ | ---------------------------------------- | ----------------------------------------- |
| 手動テスト結果     | `outputs/phase-11/manual-test-result.md` | SCREENSHOT 5件 + 非視覚確認 6件の結果     |
| 発見事項           | `outputs/phase-11/discovered-issues.md`  | 再監査で見つかった仕様・証跡・残課題      |
| スクリーンショット | `outputs/phase-11/screenshots/`          | png 5件 + `phase11-capture-metadata.json` |

## 完了条件

- [x] TC-11-01〜TC-11-05 の png 証跡が current workflow 配下に存在する
- [x] `manual-test-result.md` に TC-ID と png が 1:1 で記録されている
- [x] `validate-phase11-screenshot-coverage.js` を通せる構成にした
- [x] `report-only` / `json` / `strict` / typecheck / targeted tests を再実行した
- [x] 発見事項を `discovered-issues.md` に記録した
