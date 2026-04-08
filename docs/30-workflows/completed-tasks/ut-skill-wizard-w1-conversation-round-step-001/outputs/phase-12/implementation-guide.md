# Phase 12 成果物: 実装ガイド

## Part 1: 中学生向けの説明

この Step では、スキル作成のための 6 つの質問を 2 ページに分けて答えます。

- 1ページ目: Q1〜Q3
- 2ページ目: Q4〜Q6

全部を一度に出すと見づらいので、3問ずつに分けています。

最初の答えは、Step 0 で集めた情報から自動で入れます。
たとえば、`自分だけ` のような推測値が来ても、画面では `自分のみ` にそろえて表示します。
これで、見た目の言い方と内部のデータを分けて扱えます。

この Step は `NON_VISUAL` なので、スクリーンショット検証は不要です。

## Part 2: 技術者向けの説明

### Props

```ts
export interface ConversationRoundStepProps {
  smartDefaults: SmartDefaultResult;
  onComplete: (answers: ConversationAnswers) => void;
  onBack?: () => void;
}
```

### buildInitialAnswers()

`buildInitialAnswers(defaults)` は `SmartDefaultResult` を `ConversationAnswers` に変換する純粋関数です。

- `q1` は `自分だけ` を `自分のみ` に正規化する
- `q3` は `scheduled` を `定期実行`、`realtime` を `イベント駆動` に正規化する
- `q5` は `slack` / `github` / `notion` を UI ラベルにそろえる
- `q6` は `code` / `structured` を UI ラベルにそろえる
- `null` は `selectedOption: null` のまま維持する

### ページング

- `useState<1 | 2>(1)` でページ状態を管理する
- 1ページ目は Q1〜Q3
- 2ページ目は Q4〜Q6

### 役割分担

- `ConversationRoundStep` は質問表示と回答収集を担当する
- `buildInitialAnswers()` は初期値の変換だけを担当する
- `InterviewProgressBar` は進捗表示を担当する
- `wizard/index.ts` は export の集約点になる

### 実行メモ

- `ConfigureStep.tsx` / `WizardOptions` の削除と `SkillCreateWizard.tsx` への統合は W2-seq-03a の責務
- 手元での再実行ログは esbuild バイナリ不一致の影響を受ける場合がある
