# Phase 1: 要件定義 出力

- タスクID: UT-SKILL-WIZARD-W1-par-02b
- 完了日: 2026-04-08
- ステータス: PASS

## 確定要件

| AC-ID | 要件               | 確定値                                         |
| ----- | ------------------ | ---------------------------------------------- |
| AC-01 | ページング         | Page1: Q1-Q3, Page2: Q4-Q6                     |
| AC-02 | 進捗バー           | 「質問 N/6」テキスト + ゲージ                  |
| AC-03 | スマートデフォルト | key-based マッピング（q1→who, ..., q6→format） |
| AC-04 | Q3スケジュールUI   | 「定期実行」選択時のみインライン展開           |
| AC-05 | Q5必須化           | category === "external-integration" のみ       |
| AC-06 | サマリーカード     | 「今すぐ生成する」→ 未回答問デフォルト一覧表示 |
| AC-07 | dismiss            | ×ボタンでサマリーカードを閉じる                |

## 削除対象

- `ConfigureStep.tsx` および `WizardOptions` 型
- 全参照を `ConversationRoundStep` / `ConversationAnswers` に置換

## 依存タスク

- W0-seq-01（完了）: shared 型確定済み
- W1-par-02a（並列）: formData.category 契約
