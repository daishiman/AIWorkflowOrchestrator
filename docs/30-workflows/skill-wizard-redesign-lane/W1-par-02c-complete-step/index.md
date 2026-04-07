# W1-par-02c: CompleteStep 完了画面再設計（起点画面化）

## メタ情報

- タスクID: UT-SKILL-WIZARD-W1-par-02c
- 機能名: CompleteStep 完了画面再設計（起点画面化）
- 実行順: Wave 1（並列実行可）
- 依存: W0-seq-01完了後
- 作成日: 2026-04-07

## タスク概要

`apps/desktop/src/renderer/components/skill/wizard/CompleteStep.tsx` を大幅改修する。現行の「スキルが作成されました」テキスト＋「閉じる」ボタンのみのシンプルな完了画面を、品質フィードバック・ネクストアクション3カード・リカバリーフローを備えた「スキル作成の起点画面」へ再設計する。表示責務は最小限に抑え、生成結果コンテキストは親側から受け取る。

## 実装スコープ

### 削除対象

- 「スキルが作成されました」テキスト
- スキルパス表示
- 「閉じる」ボタン1つのみの構成
- `generationMethod` に依存した表示分岐

### 新規実装

- 完了ヘッダー（「✓ スキルの骨格を生成しました」）
- 品質フィードバック（👍/👎ボタン）
- ネクストアクション3カード（今すぐ実行・エディタで開く・別スキルを作る）
- 動作確認チェック（外部連携あり時のみ表示）
- リカバリーフロー（👎クリックでStep 0に戻り前回入力をプリフィル）

## UIコンポーネント仕様

```
1. 完了ヘッダー
   「✓ スキルの骨格を生成しました」
   ※「骨格を生成した（完全動作ではない）」を明示

2. 品質フィードバック（1問）
   「この骨格は期待通りでしたか？」
   [👍 はい]  [👎 イメージと違う → やり直す]
   ※👎クリックでリカバリーフロー発動

3. ネクストアクション（3カード）
   ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
   │  ▶ 今すぐ    │ │  ✏ エディタ  │ │  ＋ 別の     │
   │    実行する  │ │    で開く    │ │    スキルを  │
   │              │ │              │ │    作る      │
   └──────────────┘ └──────────────┘ └──────────────┘

4. 動作確認チェック（外部連携あり時のみ表示）
   ☐ Slack Webhook URLを設定する
   ☐ テスト実行で動作確認する
```

## コンポーネントProps

```typescript
interface CompleteStepProps {
  generatedSkill: GeneratedSkill | null; // W2 のオーケストレーションから受け取る生成結果コンテキスト
  hasExternalIntegration: boolean;
  externalToolName?: string;
  onExecuteNow?: () => void;
  onOpenInEditor?: () => void;
  onCreateAnother?: () => void;
  onQualityFeedback: (satisfied: boolean) => void;
  onRetry?: () => void; // リカバリーフロー用
}
```

## リカバリーフロー仕様

- 👎クリック → Step 0に戻る
- `onRetry` は Step 0 への復帰トリガーのみを担う
- Step 0 の前回入力プリフィルは W2-seq-03a の責務とする
- ユーザーは差分のみ書き直して再生成可能

## Phase一覧

| Phase | ファイル                  | 内容               |
| ----- | ------------------------- | ------------------ |
| 1     | phase-1-requirements.md   | 要件定義           |
| 2     | phase-2-design.md         | 設計               |
| 3     | phase-3-design-review.md  | 設計レビュー       |
| 4     | phase-4-test-creation.md  | テスト作成         |
| 5     | phase-5-implementation.md | 実装               |
| 6     | phase-6-test-expansion.md | テスト拡充         |
| 7     | phase-7-coverage.md       | カバレッジ確認     |
| 8     | phase-8-refactoring.md    | リファクタリング   |
| 9     | phase-9-qa.md             | QA                 |
| 10    | phase-10-final-review.md  | 最終レビュー       |
| 11    | phase-11-manual-test.md   | 手動テスト         |
| 12    | phase-12-docs.md          | ドキュメント整備   |
| 13    | phase-13-pr.md            | PRレビュー・マージ |
