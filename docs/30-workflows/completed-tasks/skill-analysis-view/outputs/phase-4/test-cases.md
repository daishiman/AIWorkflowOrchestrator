# Phase 4: テストケース一覧

## メタ情報

| 項目     | 値         |
| -------- | ---------- |
| タスクID | TASK-10A-B |
| 作成日   | 2026-03-02 |
| Phase    | 4          |

---

## SkillAnalysisView テストケース（12件）

| No  | テストケース名                   | 検証内容                                                                                   | 対応FR | 結果 |
| --- | -------------------------------- | ------------------------------------------------------------------------------------------ | ------ | ---- |
| 1   | 初期ローディング状態を表示する   | analyze を遅延Promise化し、マウント時に「分析中...」テキストが表示される                   | FR-1   | PASS |
| 2   | 分析APIを自動呼び出しする        | マウント時に `analyze("test-skill")` が1回呼ばれる                                         | FR-1   | PASS |
| 3   | 分析結果の正常表示               | ScoreDisplay（スコア72）、SuggestionList（3提案）、RiskPanel（2リスク）が描画される        | FR-2   | PASS |
| 4   | 分析失敗時のエラー表示           | API失敗時に `role="alert"` 内にエラーメッセージと再試行ボタンが表示される                  | FR-5   | PASS |
| 5   | 再試行ボタンで分析を再実行する   | 初回失敗 → 再試行クリック → analyze 2回目呼び出し → スコア72が表示される                   | FR-5   | PASS |
| 6   | 提案選択のトグル動作             | チェックボックス3件表示、クリックで checked/unchecked がトグルされる                       | FR-3   | PASS |
| 7   | 選択した改善を適用する           | checkboxes[0],[2]選択 → 「選択を適用」クリック → applyImprovements が選択済み2件で呼ばれる | FR-3   | PASS |
| 8   | 全自動改善を実行する             | 「全自動改善」クリック → window.confirm 確認 → autoImprove("test-skill") 呼び出し          | FR-4   | PASS |
| 9   | 改善適用中のdisabled状態         | applyImprovements を遅延 → 「選択を適用」「全自動改善」ボタンが disabled になる            | FR-3   | PASS |
| 10  | onClose呼び出し                  | aria-label="閉じる" ボタンクリックで onClose コールバックが1回呼ばれる                     | -      | PASS |
| 11  | 空の提案リスト時の表示           | suggestions=[] で「改善提案はありません」メッセージが表示される                            | FR-2   | PASS |
| 12  | 改善適用後に分析結果を再取得する | applyImprovements 成功後に analyze が2回目呼び出し、スコア85に更新される                   | FR-3   | PASS |

## ScoreDisplay テストケース（8件）

| No  | テストケース名                       | 検証内容                                                                                                                                       | 対応FR | 結果 |
| --- | ------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------- | ------ | ---- |
| 1   | 総合スコアを数値表示する             | `overallScore: 72` の値と「総合スコア」テキストが画面に表示される                                                                              | FR-2   | PASS |
| 2   | カテゴリ別スコアバーを表示する       | 「カテゴリ別分析」見出しと3カテゴリ名が表示され、`role="progressbar"` が3つ存在                                                                | FR-2   | PASS |
| 3   | 高スコア（80-100）に成功色を適用する | `createHighScoreAnalysis()` でスコア85の要素に `scoreVariantStyles.success` が含まれる。`getScoreVariant(80/85/100)` が全て `"success"` を返す | FR-2   | PASS |
| 4   | 中スコア（60-79）に警告色を適用する  | スコア72の要素に `scoreVariantStyles.warning` が含まれる。`getScoreVariant(60/72/79)` が全て `"warning"` を返す                                | FR-2   | PASS |
| 5   | 低スコア（0-59）にエラー色を適用する | `createLowScoreAnalysis()` でスコア35の要素に `scoreVariantStyles.error` が含まれる。`getScoreVariant(0/35/59)` が全て `"error"` を返す        | FR-2   | PASS |
| 6   | カテゴリの詳細テキストを表示する     | `details: "コードの品質は良好です"` が画面に表示される                                                                                         | FR-2   | PASS |
| 7   | カテゴリの課題リストを表示する       | `issues: ["SQLインジェクションの脆弱性", "入力値検証の不足"]` が箇条書きで表示される                                                           | FR-2   | PASS |
| 8   | ARIA属性が正しく設定される           | 2つの `role="progressbar"` に `aria-valuenow`/`aria-valuemin="0"`/`aria-valuemax="100"` が設定される                                           | NFR-2  | PASS |

## SuggestionList テストケース（9件）

| No  | テストケース名                             | 検証内容                                                                          | 対応FR | 結果 |
| --- | ------------------------------------------ | --------------------------------------------------------------------------------- | ------ | ---- |
| 1   | 提案リストを表示する                       | `role="listitem"` が3件表示される                                                 | FR-2   | PASS |
| 2   | 優先度別にグループ化する                   | `heading` level 3 が3つ、「高優先度」「中優先度」「低優先度」の順で表示される     | FR-2   | PASS |
| 3   | チェックボックスのトグルで onToggle を呼ぶ | checkboxes[0] クリックで `onToggle(0)` が1回呼ばれる                              | FR-3   | PASS |
| 4   | 選択状態のチェックボックス表示             | `selected: Set([0, 2])` で checkboxes[0]と[2]がchecked、[1]がunchecked            | FR-3   | PASS |
| 5   | autoFixableバッジを表示する                | `autoFixable: true` の提案2件に「自動修正」バッジが表示される                     | FR-2   | PASS |
| 6   | タイプバッジを表示する                     | "security", "structure", "documentation" の3つのタイプバッジが表示される          | FR-2   | PASS |
| 7   | 優先度バッジの色分け                       | "high"/"medium"/"low" バッジに `priorityStyles` の各クラスが適用される（P47準拠） | FR-2   | PASS |
| 8   | 空リスト時のメッセージ表示                 | suggestions=[] で「改善提案はありません」メッセージが表示される                   | FR-2   | PASS |
| 9   | 提案の説明テキストを表示する               | 3件の description テキストが全て表示される                                        | FR-2   | PASS |

## RiskPanel テストケース（7件）

| No  | テストケース名                           | 検証内容                                                                                          | 対応FR | 結果 |
| --- | ---------------------------------------- | ------------------------------------------------------------------------------------------------- | ------ | ---- |
| 1   | リスク情報を表示する                     | 3件のリスク説明テキストが表示され、`role="listitem"` が3つ存在する                                | FR-2   | PASS |
| 2   | criticalレベルにエラー色を適用する       | `level: "critical"` のリストアイテムに `riskLevelStyles.critical` の全クラスが含まれる            | FR-2   | PASS |
| 3   | highレベルに警告色を適用する             | `level: "high"` のリストアイテムに `riskLevelStyles.high` の全クラスが含まれる                    | FR-2   | PASS |
| 4   | medium/lowレベルに情報色を適用する       | medium/low のリストアイテムに `riskLevelStyles.medium`/`riskLevelStyles.low` がそれぞれ適用される | FR-2   | PASS |
| 5   | mitigationテキストを表示する             | 「対策」見出しと mitigation テキストが表示される                                                  | FR-2   | PASS |
| 6   | mitigation未定義時は対策セクション非表示 | `mitigation: undefined` の場合、「対策」テキストが DOM に存在しない                               | FR-2   | PASS |
| 7   | impact情報を表示する                     | 「影響」見出しと impact テキストが表示される                                                      | FR-2   | PASS |

---

## テスト結果サマリー

| コンポーネント    | Phase 4 テスト数 | 結果                 |
| ----------------- | ---------------- | -------------------- |
| SkillAnalysisView | 12               | 全 PASS              |
| ScoreDisplay      | 8                | 全 PASS              |
| SuggestionList    | 9                | 全 PASS              |
| RiskPanel         | 7                | 全 PASS              |
| **合計**          | **36**           | **全 PASS（Green）** |

## テストファイル配置

| テストファイル                                                                      | 対象コンポーネント |
| ----------------------------------------------------------------------------------- | ------------------ |
| `apps/desktop/src/renderer/components/skill/__tests__/SkillAnalysisView.test.tsx`   | SkillAnalysisView  |
| `apps/desktop/src/renderer/components/skill/__tests__/ScoreDisplay.test.tsx`        | ScoreDisplay       |
| `apps/desktop/src/renderer/components/skill/__tests__/SuggestionList.test.tsx`      | SuggestionList     |
| `apps/desktop/src/renderer/components/skill/__tests__/RiskPanel.test.tsx`           | RiskPanel          |
| `apps/desktop/src/renderer/components/skill/__tests__/helpers/mock-electron-api.ts` | モック定義         |
| `apps/desktop/src/renderer/components/skill/__tests__/helpers/test-data-factory.ts` | テストデータ       |
