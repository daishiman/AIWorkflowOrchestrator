# Phase 12 Implementation Guide

## Part 1: 非技術者向け

### なぜ必要か

今回の変更は、質問の答えを別の言い方に変える仕組みを、画面の中ではなく共有の表にまとめ直すために必要でした。これをしないと、同じ種類の変換ルールが画面側にだけ残り、あとから修正するときに見落としやすくなります。

### 日常生活での例え

たとえば、郵便物を仕分けする係が「Aさん宛て」は青い箱、「Bさん宛て」は赤い箱、と決めていたのに、ある手紙だけ机の上で手作業のメモを貼っていた状態に似ています。箱のルールにまとめておけば、誰が見ても同じやり方で仕分けできます。

### 今回作ったもの

- 何をするかを先にまとめると、special case を shared の表に移し、未登録値は元の表記を残すようにした
- `notion` だけを特別扱いしていた分岐をやめた
- 変換ルールを `packages/shared` の表に集約した
- 未登録の値は、元の表記をそのまま残すようにした
- 画面の見た目は変えず、裏側の変換だけを整えた
- `resolveSemanticLabel()` の既存契約はそのまま残し、新しい情報が必要なときだけ `resolveLabelEntry()` を使う形に分けた

## Part 2: 実装者向け

### 型定義

```ts
export type SemanticLabelEntry = string | { label: string; freeText?: string };

export type QuestionSemanticLabelMap = Record<
  string,
  Record<string, SemanticLabelEntry>
>;

export type SemanticLabelResult = {
  label: string;
  freeText?: string;
};
```

### APIシグネチャ

```ts
export function resolveLabelEntry(
  value: string | undefined,
  questionId: string,
  labelMap?: QuestionSemanticLabelMap,
): SemanticLabelResult | undefined;

export function resolveSemanticLabel(
  value: string | undefined,
  questionId: string,
  labelMap?: QuestionSemanticLabelMap,
): string | undefined;

export function applySmartDefaults(
  answers: ConversationAnswers,
  smartDefaults: SmartDefaultResult,
): ConversationAnswers;
```

### 使用例

```ts
resolveLabelEntry("notion", "q5");
// => { label: "その他", freeText: "Notion" }

resolveLabelEntry("Jira", "q5");
// => { label: "Jira" }

resolveSemanticLabel("Markdown", "q6");
// => "Markdown"
```

### エラーハンドリング

- `value` が `undefined` のときは `undefined` を返す
- `questionId` に対応する表がないときは、元の値をそのまま返す
- 表に一致しない値は、`toLowerCase()` で見つからなかった場合でも元の表記を保持する
- `resolveSemanticLabel()` は `freeText` を落として、従来どおり文字列だけを返す

### エッジケース

- `q5` の `notion` は `label: "その他"` と `freeText: "Notion"` を返す
- `q5` の `Slack` / `GitHub` は表示ラベルとして選択肢に乗る
- `q5` の `Jira` のような未登録値は、自由入力欄へ元表記のまま入る
- `q6` の `Markdown` / `JSON` は未登録でも大文字小文字を壊さずに選択される
- `q3` の `scheduled` は既存の定期実行ロジックと両立する

### 設定項目と定数一覧

| 項目                           | 役割                                       |
| ------------------------------ | ------------------------------------------ |
| `SEMANTIC_LABEL_MAP`           | 質問ごとの変換ルール本体                   |
| `SEMANTIC_LABEL_MAP.q5.notion` | `その他` と `Notion` を同時に返す特別定義  |
| `DEFAULT_SCHEDULE_CONFIG`      | `q3` が定期実行のときに使う初期値          |
| `DEFAULT_TIMEZONE`             | `scheduleConfig.timezone` の既定値         |
| `QUESTIONS`                    | `q1`〜`q6` の選択肢一覧                    |
| `resolveSemanticLabel()`       | 既存の文字列返却契約を維持する互換 wrapper |

### テスト構成

- `packages/shared/src/types/__tests__/skill-wizard-label-map.test.ts`
  - `notion` の `label` / `freeText` 変換
  - `Jira` の原表記保持
  - `resolveSemanticLabel()` の後方互換
- `apps/desktop/src/renderer/components/skill/wizard/__tests__/ConversationRoundStep.test.tsx`
  - `Markdown` / `JSON` の原表記保持
  - `Jira` の自由入力保持
  - 既存の `notion` 回帰

### 参照ファイル

- `packages/shared/src/types/skill-wizard-label-map.ts`
- `apps/desktop/src/renderer/components/skill/wizard/ConversationRoundStep.tsx`
- `packages/shared/src/types/__tests__/skill-wizard-label-map.test.ts`
