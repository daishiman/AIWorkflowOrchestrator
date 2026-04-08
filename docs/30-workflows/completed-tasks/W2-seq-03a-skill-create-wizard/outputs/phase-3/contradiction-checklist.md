# W2-seq-03a 矛盾・漏れ・整合性チェックリスト

## タスクID: W2-seq-03a

---

## チェックリスト

### A. 要件 vs 設計の整合性

| ID   | チェック項目                                                                                                                                                      | 結果 | 備考                                                                              |
| ---- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---- | --------------------------------------------------------------------------------- |
| A-01 | `generationMode` 削除が requirements-definition.md と architecture-design.md で一致しているか                                                                     | PASS | 両方で削除対象として明記                                                          |
| A-02 | STEPS配列のラベルが requirements-definition.md と architecture-design.md で一致しているか                                                                         | PASS | 両方で `["スキル情報入力", "詳細設定", "生成", "完了"]`                           |
| A-03 | `inferSmartDefaults` のルール数が requirements-definition.md と inference-flowchart.md で一致しているか                                                           | PASS | 両方で7ルール（Slack/GitHub/Notion/schedule/realtime/code-support/data-analysis） |
| A-04 | `handleRetry` の formData 保持仕様が requirements-definition.md と architecture-design.md で一致しているか                                                        | PASS | 両方で「formData を保持」と明記                                                   |
| A-05 | AC-09 の CompleteStep props（skillPath/hasExternalIntegration/externalToolName/action cards/onRetry）が architecture-design.md のレンダリング設計に含まれているか | PASS | Step 3 のレンダリング設計に全 prop が記載されている                               |

### B. 設計 vs テスト戦略の整合性

| ID   | チェック項目                                                                                        | 結果 | 備考                                          |
| ---- | --------------------------------------------------------------------------------------------------- | ---- | --------------------------------------------- |
| B-01 | `inferSmartDefaults` の推論ルール7件が test-strategy.md のユニットテストでカバーされているか        | PASS | UT-SD-01〜07 + UT-SD-08（デフォルト）でカバー |
| B-02 | `handleStep0Next` が test-strategy.md の統合テストに含まれているか                                  | PASS | IT-H0-01〜03 で3ケースをカバー                |
| B-03 | `handleGenerate` が test-strategy.md の統合テストに含まれているか                                   | PASS | IT-HG-01〜02 でカバー                         |
| B-04 | `handleRetry` が test-strategy.md の統合テストに含まれているか                                      | PASS | IT-HR-01〜03 でカバー                         |
| B-05 | legacy削除確認（`generationMode`/`description`/`DescribeStep`）が test-strategy.md に含まれているか | PASS | CT-02〜CT-04 でカバー                         |

### C. 影響範囲マップ vs 設計の整合性

| ID   | チェック項目                                                                                                                                      | 結果 | 備考                                                  |
| ---- | ------------------------------------------------------------------------------------------------------------------------------------------------- | ---- | ----------------------------------------------------- |
| C-01 | impact-scope-map.md の削除対象が architecture-design.md の設計に反映されているか                                                                  | PASS | 削除 State・ハンドラ・Import が設計から除外されている |
| C-02 | impact-scope-map.md の追加対象が architecture-design.md の State設計テーブルに含まれているか                                                      | PASS | 7つの追加 State 全て State設計テーブルに記載          |
| C-03 | impact-scope-map.md の変更対象（STEPS配列・GenerateStep props・CompleteStep props）が architecture-design.md のレンダリング設計に反映されているか | PASS | 各ステップのレンダリング設計に変更が反映されている    |

### D. 受け入れ基準の完全性

| ID   | チェック項目                                                                                         | 結果 | 備考                                                                               |
| ---- | ---------------------------------------------------------------------------------------------------- | ---- | ---------------------------------------------------------------------------------- |
| D-01 | AC-01〜AC-10 の全件が requirements-definition.md の機能要件に対応しているか                          | PASS | 各 AC が機能要件の項目にトレースバック可能                                         |
| D-02 | AC-04（inferSmartDefaults の7ルール）が inference-flowchart.md に全て記載されているか                | PASS | Slack/GitHub/Notion/schedule/realtime/code-support/data-analysis の7ルール全て記載 |
| D-03 | AC-10（handleRetry の formData 保持）が architecture-design.md の handleRetry 設計に反映されているか | PASS | `// formData は保持` とコメント付きで明記                                          |

### E. 漏れチェック

| ID   | チェック項目                                                                        | 結果 | 備考                                             |
| ---- | ----------------------------------------------------------------------------------- | ---- | ------------------------------------------------ |
| E-01 | `handleQualityFeedback` の設計が architecture-design.md に含まれているか            | PASS | ハンドラ設計セクションに記載                     |
| E-02 | `QualityFeedback` 型定義が architecture-design.md に含まれているか                  | PASS | 型定義セクションに記載                           |
| E-03 | `CompleteStep` の `onClose` の optional 化が impact-scope-map.md に記載されているか | PASS | 変更対象一覧に `onClose → optional` と記載       |
| E-04 | スコープ外ファイル（`ConversationRoundStep.tsx` 等）が変更対象から除外されているか  | PASS | impact-scope-map.md のスコープ外セクションに明記 |

---

## 総合判定: 全項目 PASS

矛盾・漏れ・整合性の問題なし。Phase 4 へ進行可能。
