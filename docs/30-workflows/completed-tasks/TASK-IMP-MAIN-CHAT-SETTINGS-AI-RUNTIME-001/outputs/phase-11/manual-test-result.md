# Phase 11: 手動テスト結果

## メタ情報

| 項目     | 内容                                       |
| -------- | ------------------------------------------ |
| Phase    | 11                                         |
| 機能名   | Main Chat / Settings runtime 同期          |
| タスクID | TASK-IMP-MAIN-CHAT-SETTINGS-AI-RUNTIME-001 |
| 成果物   | manual-test-result.md                      |
| 作成日   | 2026-03-17                                 |

---

## 0. Phase 11 テストケース証跡サマリー（実績）

| TC-ID    | テストケース                 | 判定    | 証跡                                                                     |
| -------- | ---------------------------- | ------- | ------------------------------------------------------------------------ |
| TC-11-01 | Settings access card         | PASS    | `outputs/phase-11/screenshots/TC-11-01-settings-access-matrix.png`       |
| TC-11-02 | selector と prompt           | PARTIAL | `outputs/phase-11/screenshots/TC-11-02-main-chat-selector-prompt.png`    |
| TC-11-03 | health / RAG                 | PASS    | `outputs/phase-11/screenshots/TC-11-03-settings-health-rag-guidance.png` |
| TC-11-04 | persistent terminal launcher | PARTIAL | `outputs/phase-11/screenshots/TC-11-04-settings-terminal-launcher.png`   |

補足:

- 実行コマンド: `pnpm --filter @repo/desktop exec node scripts/capture-task-06-main-chat-settings-runtime-sync-phase11.mjs`
- 実行時刻: 2026-03-17 13:19 JST
- 取得 metadata: `outputs/phase-11/screenshots/phase11-capture-metadata.json`

---

## 1. 実施方法

- `phase11-auth-mode` ハーネス（Vite + Playwright）で Settings 画面を固定し、4ケースを fullPage で取得。
- 取得画像の実体は 1x1 プレースホルダーではなく、`1512 x 2206` の実画面 PNG。
- 旧 fallback review-board 証跡（`*-rerun-20260317*.png`）は比較用として保持し、canonical は上記4枚へ更新。

---

## 2. 実測観測（metadata 抜粋）

| 観測項目             | TC-11-01 | TC-11-02 | TC-11-03 | TC-11-04 |
| -------------------- | -------- | -------- | -------- | -------- |
| hasAuthModeStatus    | true     | true     | true     | true     |
| hasAuthKeySection    | true     | true     | true     | true     |
| hasApiKeysSection    | true     | true     | true     | true     |
| hasRagSection        | true     | true     | true     | true     |
| hasTerminalLauncher  | false    | false    | false    | false    |
| hasSelectorPanel     | false    | false    | false    | false    |
| hasSystemPromptPanel | false    | false    | false    | false    |

判定理由:

- `TC-11-02`: selector/prompt の最終UIは本ハーネス未搭載のため、Settings 側同期領域の確認までを実施（PARTIAL）。
- `TC-11-04`: terminal launcher 導線は testid で検出できず、persistent 要件の完全検証は未達（PARTIAL）。

---

## 3. 実行結果サマリー

| 観点                                      | 結果                      |
| ----------------------------------------- | ------------------------- |
| Access Capability / AuthKey / APIキー一覧 | PASS                      |
| health / RAG guidance 表示                | PASS                      |
| Main Chat selector/prompt の画面証跡      | PARTIAL（ハーネス範囲外） |
| terminal launcher 常設導線                | PARTIAL（要素検出未達）   |

---

## 4. 後続対応

- PARTIAL 項目は `outputs/phase-11/discovered-issues.md` と `outputs/phase-12/unassigned-task-detection.md` に未タスクとして連携済み。
