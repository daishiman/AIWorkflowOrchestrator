# Phase 11: 3層評価テスト結果

## メタ情報

| 項目   | 値                                    |
| ------ | ------------------------------------- |
| Phase  | 11                                    |
| 機能名 | phase11-ui-ux-auto-eval-feedback-loop |
| 作成日 | 2026-03-31                            |

> **注記**: 実際のテスト実行は Electron アプリの起動が必要なため、本ファイルは Phase 11 実行時に記録するテンプレートです。

## current scaffold 証跡

| 項目                   | 値                                                                                |
| ---------------------- | --------------------------------------------------------------------------------- |
| capture metadata       | `outputs/phase-11/screenshots/phase11-capture-metadata.json` は `status: not_run` |
| screenshot placeholder | `outputs/phase-11/screenshots/scaffold-placeholder.png` のみ存在                  |
| 実測 screenshot        | 未取得                                                                            |
| 判定                   | 本ファイルは PASS/FAIL 証跡ではなく execution scaffold                            |

---

## テストカテゴリ別結果

### 機能テスト（正常系）

| テストケース | 機能                      | 期待結果                                                              | 結果                  | 備考                     |
| ------------ | ------------------------- | --------------------------------------------------------------------- | --------------------- | ------------------------ |
| M11-1        | multi_select request 表示 | ARIA ラベル付与、初期表示のスクリーンショット一致                     | Phase 11 実行時に記録 | 層1 + 層2 統合テスト     |
| M11-2        | 2件選択して送信           | aria-checked=true が 2 件、payload に selectedOptionIds 配列          | Phase 11 実行時に記録 | 層1 + 層2 + payload 検証 |
| M11-3        | kind 切り替え             | aria-checked が全て false にリセット                                  | Phase 11 実行時に記録 | 層1 + 層2 統合テスト     |
| M11-4        | 既存 4 kind 確認          | single_select / free_text / secret / confirm のスクリーンショット一致 | Phase 11 実行時に記録 | 層2 のみ（回帰テスト）   |

### エラーハンドリングテスト（異常系）

| テストケース | 状況                     | 期待結果                           | 結果                  | 備考             |
| ------------ | ------------------------ | ---------------------------------- | --------------------- | ---------------- |
| M11-ERR-01   | ANTHROPIC_API_KEY 未設定 | API エラーメッセージ出力、異常終了 | Phase 11 実行時に記録 | 層3 前提条件違反 |
| M11-ERR-02   | ベースライン画像不在     | `--update-snapshots` 案内出力      | Phase 11 実行時に記録 | 層2 初回実行時   |

### アクセシビリティテスト

| テストケース | 要件                     | 結果                  | WCAG違反              |
| ------------ | ------------------------ | --------------------- | --------------------- |
| M11-A11Y-01  | キーボードナビゲーション | Phase 11 実行時に記録 | Phase 11 実行時に記録 |
| M11-A11Y-02  | スクリーンリーダー対応   | Phase 11 実行時に記録 | Phase 11 実行時に記録 |
| M11-A11Y-03  | コントラスト比 4.5:1     | Phase 11 実行時に記録 | Phase 11 実行時に記録 |

### スクリーンショットエビデンス（UI/UX変更時）

| テストケース | 撮影ファイル                     | 仕様照合結果          | 備考                  |
| ------------ | -------------------------------- | --------------------- | --------------------- |
| M11-1        | `M11-1-multi-select-display.png` | Phase 11 実行時に記録 | multi_select 初期表示 |
| M11-2        | `M11-2-checkbox-selected.png`    | Phase 11 実行時に記録 | 2件選択状態           |
| M11-3        | `M11-3-kind-switched.png`        | Phase 11 実行時に記録 | kind 切り替え後       |
| M11-4        | `M11-4-kind-single_select.png`   | Phase 11 実行時に記録 | single_select 表示    |
| M11-4        | `M11-4-kind-free_text.png`       | Phase 11 実行時に記録 | free_text 表示        |
| M11-4        | `M11-4-kind-secret.png`          | Phase 11 実行時に記録 | secret 表示           |
| M11-4        | `M11-4-kind-confirm.png`         | Phase 11 実行時に記録 | confirm 表示          |

> **命名ルール**: 撮影ファイル名は実際の画面状態と意味を一致させる。
> 例: 未保存離脱ダイアログの証跡は `*-unsaved-dialog-*.png` のように状態名を含める。

### 仕様照合結果サマリー

| 確認項目           | 結果                  |
| ------------------ | --------------------- |
| レイアウト一致     | Phase 11 実行時に記録 |
| カラーパレット準拠 | Phase 11 実行時に記録 |
| 8pxグリッド準拠    | Phase 11 実行時に記録 |
| ダークモード確認   | Phase 11 実行時に記録 |
| エラー状態UI       | Phase 11 実行時に記録 |

---

## 3層評価

### 層1: Semantic テスト（Playwright `_electron`）

| テストケース | 確認項目                 | 期待結果                           | 結果                  | 備考         |
| ------------ | ------------------------ | ---------------------------------- | --------------------- | ------------ |
| SEM-001      | ARIA role 付与           | 全対話要素に role 付与             | Phase 11 実行時に記録 | M11-1 で検証 |
| SEM-002      | aria-label 設定          | 空文字なし                         | Phase 11 実行時に記録 | M11-1 で検証 |
| SEM-003      | tabIndex 設定            | 対話要素が Tab で到達可能          | Phase 11 実行時に記録 | M11-1 で検証 |
| SEM-004      | キーボードナビゲーション | Space/Enter で操作可能             | Phase 11 実行時に記録 | M11-1 で検証 |
| SEM-005      | アクセシビリティツリー   | スナップショット取得成功           | Phase 11 実行時に記録 | M11-1 で検証 |
| SEM-006      | aria-checked 状態反映    | チェック時 true、解除時 false      | Phase 11 実行時に記録 | M11-2 で検証 |
| SEM-007      | kind 切り替え後リセット  | 切り替え後 aria-checked 全て false | Phase 11 実行時に記録 | M11-3 で検証 |

### 層2: Visual テスト（toHaveScreenshot）

| テストケース | 画面状態              | ベースライン                     | diff (px) | 結果                  | 備考  |
| ------------ | --------------------- | -------------------------------- | --------- | --------------------- | ----- |
| VIS-001      | multi_select 初期表示 | `M11-1-multi-select-display.png` | -         | Phase 11 実行時に記録 | M11-1 |
| VIS-002      | 2件チェック選択後     | `M11-2-checkbox-selected.png`    | -         | Phase 11 実行時に記録 | M11-2 |
| VIS-003      | kind 切り替え後       | `M11-3-kind-switched.png`        | -         | Phase 11 実行時に記録 | M11-3 |
| VIS-004      | kind: single_select   | `M11-4-kind-single_select.png`   | -         | Phase 11 実行時に記録 | M11-4 |
| VIS-005      | kind: free_text       | `M11-4-kind-free_text.png`       | -         | Phase 11 実行時に記録 | M11-4 |
| VIS-006      | kind: secret          | `M11-4-kind-secret.png`          | -         | Phase 11 実行時に記録 | M11-4 |
| VIS-007      | kind: confirm         | `M11-4-kind-confirm.png`         | -         | Phase 11 実行時に記録 | M11-4 |

### 層3: AI UX 評価（Claude API）

| テストケース | 評価対象                    | HIGH 件数 | MEDIUM 件数 | LOW 件数 | 結果                  | 備考                                                                  |
| ------------ | --------------------------- | --------- | ----------- | -------- | --------------------- | --------------------------------------------------------------------- |
| AI-001       | M11-1 multi_select 初期表示 | -         | -           | -        | Phase 11 実行時に記録 | `.claude/skills/task-specification-creator/scripts/evaluate-ui-ux.js` |
| AI-002       | M11-2 2件選択後             | -         | -           | -        | Phase 11 実行時に記録 | `.claude/skills/task-specification-creator/scripts/evaluate-ui-ux.js` |
| AI-003       | M11-3 kind 切り替え後       | -         | -           | -        | Phase 11 実行時に記録 | `.claude/skills/task-specification-creator/scripts/evaluate-ui-ux.js` |

### 3層評価サマリー

| 層           | テスト数 | PASS  | FAIL  | SKIP  | 備考                  |
| ------------ | -------- | ----- | ----- | ----- | --------------------- |
| 層1 Semantic | 7        | -     | -     | -     | Phase 11 実行時に記録 |
| 層2 Visual   | 7        | -     | -     | -     | Phase 11 実行時に記録 |
| 層3 AI UX    | 3        | -     | -     | -     | Phase 11 実行時に記録 |
| **合計**     | **17**   | **-** | **-** | **-** | Phase 11 実行時に記録 |

> **判定基準**: 層3 AI UX で HIGH が 1 件以上の場合、`unassigned-task/` へ自動生成される。
> **実行スクリプト**: `.claude/skills/task-specification-creator/scripts/evaluate-ui-ux.js`

---

## 検出結果サマリー

| ソース           | 検出数                    |
| ---------------- | ------------------------- |
| テスト結果       | Phase 11 実行時に記録     |
| 発見課題         | Phase 11 実行時に記録     |
| アクセシビリティ | Phase 11 実行時に記録     |
| **合計**         | **Phase 11 実行時に記録** |

## 検出タスク一覧

Phase 11 実行後に記録予定。HIGH 重要度の問題が検出された場合、`evaluate-ui-ux-unassigned-task.js` により自動生成されます。
