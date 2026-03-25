# Phase 1: 受入条件定義

| AC    | 条件                                                        | 検証方法       |
| ----- | ----------------------------------------------------------- | -------------- |
| AC-1  | DescribeStepに「LLMで生成」「テンプレートから作成」の選択UI | 自動テスト     |
| AC-2  | LLM選択→ConfigureStepスキップ→GenerateStepでplanSkill呼出   | 自動テスト     |
| AC-3  | GenerateStepでplan結果(type, estimatedSteps, guidance)表示  | 自動テスト     |
| AC-4  | 実行ボタンでexecutePlan呼出、成功時CompleteStep遷移         | 自動テスト     |
| AC-5  | キャンセルボタンでplanクリアしDescribeStepへ戻る            | 自動テスト     |
| AC-6  | generationProgressがGenerateStepに表示                      | 自動テスト     |
| AC-7  | planSkill/executePlanエラー時にエラーメッセージ表示         | 自動テスト     |
| AC-8  | テンプレートフロー非破壊                                    | 自動テスト     |
| AC-9  | PlanResult型はagentSlice.tsのSingle Source of Truth         | コードレビュー |
| AC-10 | Hybrid State Pattern対称クリア                              | 自動テスト     |
