# Phase 11: 手動テスト

## メタ情報

| 項目   | 値                           |
| ------ | ---------------------------- |
| Phase  | 11                           |
| 機能名 | multi-select-user-input-kind |
| 作成日 | 2026-03-29                   |

## 目的

manual walkthrough で複数選択入力の表示、選択、送信、既存入力種別への戻りを確認する。

## 実行タスク

- `multi_select` request を表示し、複数候補を選択できることを確認する
- 送信後に `selectedOptionIds` が submit payload へ反映されることを確認する
- kind を切り替えたときに前の選択 state が残らないことを確認する
- `single_select` / `free_text` / `secret` / `confirm` が従来どおり動くことを確認する

## 参照資料

| 資料名       | パス                        | 説明      |
| ------------ | --------------------------- | --------- |
| Phase 5 実装 | `phase-5-implementation.md` | 実装対象  |
| Phase 6 拡充 | `phase-6-test-expansion.md` | edge case |

## 実行手順

### 3層評価シナリオ

#### M11-1: multi_select request 表示（3層評価）

| 層           | 確認項目                           | 期待結果                          | 自動化方法       |
| ------------ | ---------------------------------- | --------------------------------- | ---------------- |
| 層1 Semantic | checkbox に `role="checkbox"` 付与 | 全 option に role 付与            | Playwright       |
| 層1 Semantic | `aria-label` が意味のある文字列    | 空文字なし                        | Playwright       |
| 層2 Visual   | スクリーンショット比較             | ベースラインと一致（diff ≤ 50px） | toHaveScreenshot |
| 層3 AI UX    | AI によるユーザビリティ評価        | HIGH 問題なし                     | ai-ux-evaluator  |

#### M11-2: 2件選択して送信（3層評価）

| 層           | 確認項目                              | 期待結果               | 自動化方法       |
| ------------ | ------------------------------------- | ---------------------- | ---------------- |
| 層1 Semantic | 選択状態の `aria-checked="true"` 付与 | 選択した 2 件に付与    | Playwright       |
| 層2 Visual   | 選択後スクリーンショット              | ベースラインと一致     | toHaveScreenshot |
| 層3 AI UX    | 選択状態の視認性評価                  | 選択済みが明確に分かる | ai-ux-evaluator  |

#### M11-3: kind 切り替え（3層評価）

| 層           | 確認項目                       | 期待結果                       | 自動化方法       |
| ------------ | ------------------------------ | ------------------------------ | ---------------- |
| 層1 Semantic | 切り替え後の ARIA 状態リセット | `aria-checked` が全て false    | Playwright       |
| 層2 Visual   | 切り替え後スクリーンショット   | 前 kind の UI 要素が消えている | toHaveScreenshot |
| 層3 AI UX    | kind 切り替えの直感性評価      | HIGH 問題なし                  | ai-ux-evaluator  |

#### M11-4: 既存 4 kind 確認（3層評価）

| 種別          | 層         | 確認項目               | 期待結果           | 自動化方法       |
| ------------- | ---------- | ---------------------- | ------------------ | ---------------- |
| single_select | 層2 Visual | スクリーンショット比較 | ベースラインと一致 | toHaveScreenshot |
| free_text     | 層2 Visual | スクリーンショット比較 | ベースラインと一致 | toHaveScreenshot |
| secret        | 層2 Visual | スクリーンショット比較 | ベースラインと一致 | toHaveScreenshot |
| confirm       | 層2 Visual | スクリーンショット比較 | ベースラインと一致 | toHaveScreenshot |

## 統合テスト連携

- Phase 4 / 6 の自動テストでは拾えない操作順を walkthrough で補完する
- Phase 12 の説明文書に実操作の注意点を反映する

## 成果物

| 成果物       | パス                                        | 説明             |
| ------------ | ------------------------------------------- | ---------------- |
| 手動確認仕様 | `phase-11-manual-test.md`                   | walkthrough 条件 |
| checklist    | `outputs/phase-11/manual-test-checklist.md` | 確認項目         |
| result       | `outputs/phase-11/manual-test-result.md`    | 実施結果         |
| report       | `outputs/phase-11/manual-test-report.md`    | 所見             |
| issues       | `outputs/phase-11/discovered-issues.md`     | blocker / note   |

## 完了条件

- [ ] walkthrough シナリオが定義されている
- [ ] 既存 4 kind への非破壊確認が定義されている
- [ ] Phase 11 補助成果物の配置先が定義されている
- [ ] **本Phase内の全タスクを100%実行完了**
