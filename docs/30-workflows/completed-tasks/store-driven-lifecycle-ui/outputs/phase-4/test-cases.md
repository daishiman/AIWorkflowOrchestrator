# Phase 4 テストケース一覧: Store駆動ライフサイクルUI統合

## タスク情報

| 項目     | 値         |
| -------- | ---------- |
| タスクID | TASK-10A-F |
| Phase    | 4          |

## テストファイル一覧

### 1. SkillCreateWizard.store-integration.test.tsx (10テスト)

| #   | テスト名                                         | カテゴリ  | 検証内容                                           |
| --- | ------------------------------------------------ | --------- | -------------------------------------------------- |
| 1   | store.createSkillが呼ばれる（electronAPI不使用） | Store統合 | mockCreateSkill呼び出し + spySkillCreate未呼び出し |
| 2   | description/optionsが正しく渡される              | Store統合 | 引数パターン検証                                   |
| 3   | 成功後にStep 4遷移+パス表示                      | 状態遷移  | 完了画面+パス文字列                                |
| 4   | 失敗時にError.message表示                        | 異常系    | エラーメッセージ表示                               |
| 5   | Error以外でフォールバックメッセージ              | 異常系    | フォールバック「スキル生成に失敗しました」         |
| 6   | 空文字列返却時にフォールバックエラー             | 異常系    | Store action空文字列返却パス                       |
| 7   | 生成中はGenerateStep表示                         | UI状態    | wizard-step-generate testid                        |
| 8   | 初期状態はStep 0                                 | 状態遷移  | wizard-step-describe testid                        |
| 9   | 成功でStep 3遷移                                 | 状態遷移  | wizard-step-complete testid                        |
| 10  | 失敗でStep 2維持                                 | 状態遷移  | wizard-step-generate testid + エラー               |

### 2. SkillAnalysisView.store-integration.test.tsx (11テスト)

| #   | テスト名                                               | カテゴリ  | 検証内容                                                    |
| --- | ------------------------------------------------------ | --------- | ----------------------------------------------------------- |
| 1   | mount時store.analyzeSkill呼び出し（electronAPI不使用） | Store統合 | mockAnalyzeSkill呼び出し + spyAnalyze未呼び出し             |
| 2   | currentAnalysis設定で分析結果表示                      | Store統合 | スコア+提案+リスク表示                                      |
| 3   | isAnalyzing=trueで分析中表示                           | UI状態    | 「分析中...」テキスト                                       |
| 4   | skillError設定でエラー表示                             | 異常系    | role="alert"エラーメッセージ                                |
| 5   | 選択適用でstore.applySkillImprovements呼び出し         | Store統合 | mockApplySkillImprovements + spyApplyImprovements未呼び出し |
| 6   | isImproving=trueでボタンdisabled                       | UI状態    | 選択適用+全自動改善disabled                                 |
| 7   | 全自動改善でstore.autoImproveSkill呼び出し             | Store統合 | mockAutoImproveSkill + spyAutoImprove未呼び出し             |
| 8   | confirmキャンセルでautoImproveSkill不呼び出し          | UI操作    | window.confirm false -> 不呼び出し                          |
| 9   | チェックボックストグルがローカルstate管理              | UI操作    | checked状態トグル                                           |
| 10  | エラーにrole="alert"設定                               | a11y      | ARIA属性確認                                                |
| 11  | 閉じるボタンにaria-label設定                           | a11y      | aria-label="閉じる"                                         |

### 3. SkillCreateWizard.test.tsx (19テスト - 既存テスト更新)

Store action モック方式に移行。mockCreate -> mockCreateSkill、引数パターンを (description, options) 2引数に変更。

### 4. SkillAnalysisView.test.tsx (33テスト - 既存テスト更新)

window.electronAPI直接モックからStore セレクタモック方式に移行。

## テスト合計

| ファイル                                     | テスト数 | 結果       |
| -------------------------------------------- | -------- | ---------- |
| SkillCreateWizard.store-integration.test.tsx | 10       | PASS       |
| SkillAnalysisView.store-integration.test.tsx | 11       | PASS       |
| SkillCreateWizard.test.tsx                   | 19       | PASS       |
| SkillAnalysisView.test.tsx                   | 33       | PASS       |
| **合計**                                     | **73**   | **全PASS** |
