# Phase 12 成果物: 実装ガイド

## タスク: TASK-LLM-MOD-05-RENDERER-DESC-DISPLAY

---

## Part 1: 中学生レベルの概念説明

### 日常生活での例え話

本屋さんで本を選ぶとき、タイトルだけが書いてある棚より、
「この本はこんな内容です」という短いメモが添えてある棚の方が
選びやすいですよね。

このタスクは、チャット画面の「モデル選択ドロップダウン」に
そのメモを追加する改善です。

### なぜ必要か

- モデル名（"GPT-4o", "Claude 3.5 Sonnet" など）だけだと、
  似たモデルの違いが一目でわからない
- 説明メモ（description）があれば、選ぶ前に「得意分野」や「特徴」を
  判断できる
- ただし、メモを常に画面に表示するとコンパクトな UI が崩れてしまうので、
  マウスを乗せたときだけ（tooltip）や、
  画面には見えないがスクリーンリーダーに読まれる形（sr-only）で見せる

### Before / After

**Before（改善前）**: ドロップダウンを開くとモデル名だけが並ぶ

```
✓ GPT-4o
  GPT-4o Mini
  GPT-4o Nano
```

**After（改善後）**: マウスホバーで説明 tooltip が表示される

```
✓ GPT-4o          ← ホバーすると「高性能マルチモーダルモデル」と出る
  GPT-4o Mini     ← description なし → tooltip なし
  GPT-4o Nano     ← description なし → tooltip なし
```

---

## Part 2: 技術的詳細

### 変更ファイル

| ファイル                                                                          | 種別                 | 内容                                                   |
| --------------------------------------------------------------------------------- | -------------------- | ------------------------------------------------------ |
| `apps/desktop/src/renderer/components/llm/InlineModelSelector.tsx`                | 修正（+15行）        | SelectorDropdown の models.map に description 表示追加 |
| `apps/desktop/src/renderer/components/llm/__tests__/InlineModelSelector.test.tsx` | テスト追加（+380行） | T-DESC-1〜T-DESC-15 追加                               |

### インターフェース / 型定義（変更なし）

```typescript
// packages/shared/src/types/llm/schemas/provider.ts
const LLMModelSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  description: z.string().optional(), // ← 既存フィールド（SSOT）
  contextWindow: z.number().int().positive().optional(),
  isDefault: z.boolean().default(false),
});
```

### 実装の核心

```tsx
// SelectorDropdown の models.map 内（InlineModelSelector.tsx）
models.map((model) => {
  const hasDescription =
    typeof model.description === "string" &&
    model.description.trim().length > 0;
  const descriptionId = hasDescription
    ? `inline-model-${model.id}-desc`
    : undefined;
  return (
    <button
      title={hasDescription ? model.description : undefined}
      aria-describedby={descriptionId}
      // ...他の props
    >
      {model.name}
      {hasDescription && (
        <span id={descriptionId} className="sr-only">
          {model.description}
        </span>
      )}
    </button>
  );
});
```

### エラーハンドリングとエッジケース

| 入力値                         | `hasDescription` | 結果                                         |
| ------------------------------ | ---------------- | -------------------------------------------- |
| `"高性能マルチモーダルモデル"` | `true`           | title / aria-describedby / sr-only 表示      |
| `undefined`                    | `false`          | 補助要素なし（レイアウト変化なし）           |
| `""`                           | `false`          | `trim().length === 0` で除外                 |
| `"   "`                        | `false`          | 空白のみも除外                               |
| `null`（型違反）               | `false`          | `typeof !== "string"` で除外                 |
| `<script>...</script>`         | `true`           | React 自動エスケープでテキスト化（XSS 不可） |
| 1000文字の長文                 | `true`           | DOM を増やさず title + sr-only で保持        |

### アクセシビリティ設計

| 属性 / クラス                 | 目的                                           |
| ----------------------------- | ---------------------------------------------- |
| `title`                       | OS ネイティブ tooltip（マウスホバーで表示）    |
| `aria-describedby`            | スクリーンリーダー向け補助情報参照             |
| `id="inline-model-{id}-desc"` | aria-describedby の参照先                      |
| `className="sr-only"`         | 視覚的には非表示、スクリーンリーダーに読み上げ |

### テスト戦略（計 55 テスト、全 PASS）

| カテゴリ                 | テスト数 | 主要テスト           |
| ------------------------ | -------- | -------------------- |
| 既存テスト（回帰確認）   | 40       | T1〜T11              |
| description 表示（新規） | 9        | T-DESC-1〜T-DESC-9   |
| description 拡充（新規） | 6        | T-DESC-10〜T-DESC-15 |

### Phase 11 スクリーンショット

renderer harness を用いて実スクリーンショットを取得済み。
自動テスト（55件 PASS）も補強証跡として併記する。

参照:

- `outputs/phase-11/screenshots/inline-model-selector-description-hidden.png`
- `outputs/phase-11/screenshots/inline-model-selector-tooltip-visible.png`
- `outputs/phase-11/phase11-capture-metadata.json`

metadata には以下の確認結果を記録している:

- closed state の triggerText: `GPT-4o`
- open state の `title`: `高性能マルチモーダルモデル`
- `aria-describedby`: `inline-model-gpt-4o-desc`
- 余計な属性は description なしのモデルには付与されない
- tooltip visible の証跡は Playwright overlay を使って取得している

---

## 受入条件達成確認

| AC   | 内容                                    | 達成 |
| ---- | --------------------------------------- | ---- |
| AC-1 | InlineModelSelector で description 表示 | ✅   |
| AC-2 | description 未設定時の安全処理          | ✅   |
| AC-3 | 既存フロー・アクセシビリティ維持        | ✅   |
| AC-4 | 既存テストへ description 期待値追加     | ✅   |
| AC-5 | TypeScript 型エラー・ESLint エラーなし  | ✅   |
| AC-6 | docs と UI の文言が一致                 | ✅   |
