# Phase 11: スクリーンショット カバレッジ

## メタ情報

| 項目     | 内容                                       |
| -------- | ------------------------------------------ |
| Phase    | 11                                         |
| 機能名   | Main Chat / Settings runtime 同期          |
| タスクID | TASK-IMP-MAIN-CHAT-SETTINGS-AI-RUNTIME-001 |
| 成果物   | screenshot-coverage.md                     |
| 作成日   | 2026-03-17                                 |

---

## 1. テストケースカバレッジ（実績）

| テストケース | screenshot-plan.json                                                     | 実ファイル                                                               | 実体          |
| ------------ | ------------------------------------------------------------------------ | ------------------------------------------------------------------------ | ------------- |
| TC-11-01     | `outputs/phase-11/screenshots/TC-11-01-settings-access-matrix.png`       | `outputs/phase-11/screenshots/TC-11-01-settings-access-matrix.png`       | PNG 1512x2206 |
| TC-11-02     | `outputs/phase-11/screenshots/TC-11-02-main-chat-selector-prompt.png`    | `outputs/phase-11/screenshots/TC-11-02-main-chat-selector-prompt.png`    | PNG 1512x2206 |
| TC-11-03     | `outputs/phase-11/screenshots/TC-11-03-settings-health-rag-guidance.png` | `outputs/phase-11/screenshots/TC-11-03-settings-health-rag-guidance.png` | PNG 1512x2206 |
| TC-11-04     | `outputs/phase-11/screenshots/TC-11-04-settings-terminal-launcher.png`   | `outputs/phase-11/screenshots/TC-11-04-settings-terminal-launcher.png`   | PNG 1512x2206 |

**テストケースカバレッジ: 100%（4 / 4）**

---

## 2. 画面観点カバレッジ

| 観点                                             | 対応TC   | 判定    | コメント                                                      |
| ------------------------------------------------ | -------- | ------- | ------------------------------------------------------------- |
| Settings access card（auth mode / key guidance） | TC-11-01 | PASS    | `hasAuthModeStatus=true`, `hasAuthKeySection=true`            |
| selector / prompt 同期                           | TC-11-02 | PARTIAL | 本ハーネスは Settings 固定のため selector/prompt 本体は未描画 |
| health / RAG / guidance 表示                     | TC-11-03 | PASS    | `hasRagSection=true` を確認                                   |
| terminal launcher 常設導線                       | TC-11-04 | PARTIAL | `hasTerminalLauncher=false`（testid 未検出）                  |

---

## 3. 取得方式と証跡

| 項目           | 内容                                                                                                         |
| -------------- | ------------------------------------------------------------------------------------------------------------ |
| 実行コマンド   | `pnpm --filter @repo/desktop exec node scripts/capture-task-06-main-chat-settings-runtime-sync-phase11.mjs`  |
| キャプチャ方式 | Playwright + `phase11-auth-mode` ハーネス                                                                    |
| metadata       | `outputs/phase-11/screenshots/phase11-capture-metadata.json`                                                 |
| fallback証跡   | `outputs/phase-11/screenshots/*-rerun-20260317*.png` / `phase11-capture-metadata-rerun-20260317-130919.json` |

---

## 4. 整合性チェック結果

| チェック項目                                   | 結果 |
| ---------------------------------------------- | ---- |
| `phase-11-manual-test.md` の TC-ID と一致      | PASS |
| `manual-test-result.md` の証跡列と一致         | PASS |
| `screenshot-plan.json` のID/ファイル参照と一致 | PASS |
| `outputs/phase-11/screenshots/` の実体存在     | PASS |
| 1x1 プレースホルダー混入なし                   | PASS |
