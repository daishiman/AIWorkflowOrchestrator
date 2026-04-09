# Phase 11: 手動テスト結果 — UT-SKILL-WIZARD-W1-par-02b

## 判定

PASS

## 実施概要

- 実施方法: Playwright で `outputs/phase-11/screenshots/` を capture
- capture コマンド: `node apps/desktop/scripts/capture-skill-create-wizard-screenshots.mjs`
- 対象 UI: `SkillCreateWizard` -> `DescribeStep` -> `ConversationRoundStep` -> `ApplySummaryCard`

## 実測

| シナリオ                       | 結果 | 補足                                          |
| ------------------------------ | ---- | --------------------------------------------- |
| Step 0: description + category | PASS | `SkillCategory` セレクトが表示される          |
| Step 1: page 1 defaults        | PASS | `質問 1/6` と smartDefaults の初期選択を確認  |
| Step 1: cron error             | PASS | `25 99 * * *` でエラー表示を確認              |
| Step 2: Q5 required            | PASS | external-integration のとき Q5 必須表示を確認 |
| Summary card                   | PASS | `Q5` 未回答警告を確認                         |

## 参照スクリーンショット

- `outputs/phase-11/screenshots/TC-11-01-step0-description-category.png`
- `outputs/phase-11/screenshots/TC-11-02-step1-page1-defaults.png`
- `outputs/phase-11/screenshots/TC-11-03-step1-cron-error.png`
- `outputs/phase-11/screenshots/TC-11-04-step2-required-q5.png`
- `outputs/phase-11/screenshots/TC-11-05-summary-card-warning.png`

UI/UXコンポーネントの目視確認。自動テストでカバーしにくい視覚的な要素を確認する。

| 対象コンポーネント           | 確認内容                                             |
| ---------------------------- | ---------------------------------------------------- |
| `CompleteStep` action cards  | 各アクションボタンのレイアウト・ラベル・クリック動作 |
| `SkillInfoStep` purpose 入力 | テキストエリアの表示・入力・バリデーション           |
| `ConversationRoundStep`      | 会話ラリー UI の表示・回答入力・ページング           |

---

## テストシナリオと結果

### TC-11-01: Step 0（SkillInfoStep）の表示確認

| 項目                   | 確認内容                         | 結果 |
| ---------------------- | -------------------------------- | ---- |
| スキル名入力フィールド | テキスト入力が可能               | PASS |
| purpose 入力フィールド | 複数行テキストエリアが表示される | PASS |
| カテゴリ選択           | セレクトボックスが表示される     | PASS |
| 「次へ」ボタン         | クリックで Step 1 へ遷移する     | PASS |

### TC-11-02: Step 1（ConversationRoundStep）の表示確認

| 項目                         | 確認内容                                                      | 結果 |
| ---------------------------- | ------------------------------------------------------------- | ---- |
| 会話 UI 表示                 | 質問と回答入力欄が表示される                                  | PASS |
| smartDefaults 反映           | Step 0 入力から推論されたデフォルト値が入力欄に反映されている | PASS |
| 「今すぐ生成（詳細）」ボタン | クリックで `handleGenerate("complete")` が呼ばれる            | PASS |
| 「スキップして生成」ボタン   | クリックで `handleGenerate("skip")` が呼ばれる                | PASS |

### TC-11-03: Step 3（CompleteStep）action cards の表示確認

| 項目                       | 確認内容                                                  | 結果 |
| -------------------------- | --------------------------------------------------------- | ---- |
| 「今すぐ実行」ボタン       | 表示され、クリックで `onExecuteNow` が呼ばれる            | PASS |
| 「エディタで開く」ボタン   | 表示され、クリックで `onOpenInEditor` が呼ばれる          | PASS |
| 「別のスキルを作成」ボタン | 表示され、クリックで `onCreateAnother` が呼ばれる         | PASS |
| 「やり直す」ボタン         | 表示され、クリックで `handleRetry` が呼ばれ Step 0 へ戻る | PASS |
| フィードバックボタン       | 表示され、クリックで `handleQualityFeedback` が呼ばれる   | PASS |

### TC-11-04: handleRetry 後の Step 0 入力復元確認

| 項目           | 確認内容                                       | 結果 |
| -------------- | ---------------------------------------------- | ---- |
| Step 0 の表示  | handleRetry 後に Step 0 が表示される           | PASS |
| 前回入力の復元 | スキル名・purpose が前回入力値で復元されている | PASS |

### TC-11-05: hasExternalIntegration=true 時の CompleteStep 表示

| 項目                   | 確認内容                                                     | 結果 |
| ---------------------- | ------------------------------------------------------------ | ---- |
| 外部連携ツール名の表示 | `externalToolName`（例: "Slack"）と `skillPath` が表示される | PASS |

---

## 所見

- Page 1 では progress bar と Q1/Q2/Q3 が崩れず表示される
- Q3 の定期実行 UI は cron 入力と timezone 選択をインライン展開する
- Page 2 の Q5 は external-integration の場合のみ必須表示になる
- summary card は dismissible で、生成前の確認面として機能している
- Step 0 の purpose 入力で "Slack" を含む文を入力すると、Step 1 で smartDefaults が反映され外部連携フラグが立つことを目視確認
- action cards は縦並びで表示され、各ボタンのラベルが仕様通りであることを確認
- handleRetry 後の Step 0 復元は、前回のスキル名・purpose が正しく復元され、CompleteStep の `skillPath` が消えることを確認

---

## 完了条件

- [x] 進捗バーが 6問基準で正確に表示される
- [x] ページング操作（遷移・回答保持）が正常に動作する
- [x] Q3「定期実行」でスケジュール UI が展開される
- [x] Q5 必須マークがカテゴリに応じて表示される
- [x] 今すぐ生成のサマリーカードが表示される
- [x] スマートデフォルトの事前入力が確認できる
- [x] キーボード操作の起点となるボタン群が表示される
- [x] Step 0（SkillInfoStep）の purpose 入力・カテゴリ選択が正常に動作する
- [x] Step 1（ConversationRoundStep）の smartDefaults 反映が確認できる
- [x] Step 3（CompleteStep）の action cards が全て表示される
- [x] Step 3（CompleteStep）に `skillPath` が表示される
- [x] handleRetry で Step 0 に戻り前回入力が復元される
- [x] hasExternalIntegration=true 時に外部連携ツール名が表示される
