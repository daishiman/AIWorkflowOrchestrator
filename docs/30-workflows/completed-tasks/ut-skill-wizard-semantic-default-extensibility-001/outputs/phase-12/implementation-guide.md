# Phase 12: 実装ガイド

---

## Part 1: 初学者向け解説

### なぜ必要か

`ConversationRoundStep.tsx` では、質問ごとの入力値を画面表示に合う言葉へそろえる必要がある。
たとえば「自分だけ」という入力を「自分のみ」に統一しないと、同じ意味なのに表示がばらつく。

### 何をするか

- 質問ごとの言い換えを1か所の表にまとめる
- その表を `shared` から参照する
- `applySmartDefaults()` が初期値を作るときに、その表を使って言葉をそろえる

### 日常の例え

みんなで同じ言い方を使うための「共有の辞書」を作るイメージ。
各部屋に別々の辞書を置くのではなく、1冊の辞書を共有して見るようにする。

### 今回作ったもの

- `QuestionSemanticLabelMap`: 質問ごとの言い換え表の型
- `SEMANTIC_LABEL_MAP`: 正準の言い換え表
- `resolveSemanticLabel()`: 1つの値を言い換える内部処理
- `applySmartDefaults()`: 初期値をまとめて反映する処理

---

## Part 2: 技術者向け解説

### 型定義

```typescript
// packages/shared/src/types/skill-wizard-label-map.ts
export type QuestionSemanticLabelMap = Record<string, Record<string, string>>;

export const SEMANTIC_LABEL_MAP: QuestionSemanticLabelMap = {
  q1: { 自分だけ: "自分のみ" },
  q2: {},
  q3: { scheduled: "定期実行" },
  q4: {},
  q5: { slack: "Slack", github: "GitHub", notion: "その他" },
  q6: { 週次: "週に1回" },
};
```

### API シグネチャ

```typescript
function resolveSemanticLabel(
  value: string | undefined,
  questionId: string,
  labelMap?: QuestionSemanticLabelMap,
): string | undefined;
```

### 使用例

```typescript
import {
  SEMANTIC_LABEL_MAP,
  type QuestionSemanticLabelMap,
} from "@repo/shared/types/skillWizard";

const customMap: QuestionSemanticLabelMap = {
  q5: { notion: "Notion" },
};

const label = resolveSemanticLabel("自分だけ", "q1", SEMANTIC_LABEL_MAP);
// => "自分のみ"

const customLabel = resolveSemanticLabel("notion", "q5", customMap);
// => "Notion"
```

### エラーハンドリング

- `value` が `undefined` の場合は `undefined` を返す
- `questionId` が未知の場合は元の `value` を返す（フォールバック）
- `labelMap` が未指定の場合は `SEMANTIC_LABEL_MAP` を使う
- 未定義の `rawValue` は元の値を返す（フォールバック）

### エッジケース

- 空文字列は空文字列をそのまま返す（`TC-11` でカバー）
- `q5` の外部ツール連携は大文字小文字の揺れを吸収する（`toLowerCase()` 正規化）
- `q6` の頻度は同義語を1つの表示に寄せる（`週次` → `週に1回`）
- 将来 `q7` 以降が増えた場合は、`SEMANTIC_LABEL_MAP` に追記するだけで対応できる

### 設定項目と定数一覧

| 項目                 | 型                                      | 既定値               | 用途               |
| -------------------- | --------------------------------------- | -------------------- | ------------------ |
| `value`              | `string \| undefined`                   | なし                 | 正規化対象の生値   |
| `questionId`         | `string`                                | なし                 | 対象質問の識別子   |
| `labelMap`           | `QuestionSemanticLabelMap \| undefined` | `SEMANTIC_LABEL_MAP` | DI 用の正準マップ  |
| `SEMANTIC_LABEL_MAP` | `QuestionSemanticLabelMap`              | なし                 | 共有する正準マップ |

### テスト構成

- `apps/desktop/src/renderer/components/skill/wizard/__tests__/ConversationRoundStep.test.tsx` で `applySmartDefaults()` の初期反映を確認する
- `resolveSemanticLabel()` の振る舞いは TC-01〜TC-12 および Phase 6 拡張テストで直接検証する
- `@repo/shared/types/skillWizard` の import 可否を TC-12 で確認する
- `packages/shared/tsup.config.ts` の build entry 追加により shared dist 生成を確実にする
- 既存のページング・スケジュール展開・外部ツール連携テストを回帰として維持する（72件全 PASS）

### vitest.config.ts への alias 追加（注意事項）

`@repo/shared/types/skillWizard` は value import を含むため、`tsconfigPaths` プラグインだけでは
解決できない場合がある。`vitest.config.ts` の `resolve.alias` に直接追加する：

```typescript
"@repo/shared/types/skillWizard": resolve(
  __dirname,
  "../../packages/shared/src/types/skill-wizard-label-map.ts",
),
```
