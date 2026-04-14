# Phase 2: 設計書

## バッジ制御方式の決定

### 採用案: 案A（Q5キー分岐方式）

| 案      | 方式                | 変更範囲                 | 削除容易性          | 採用     |
| ------- | ------------------- | ------------------------ | ------------------- | -------- |
| **案A** | `key === "q5"` 分岐 | `renderQuestion` 内のみ  | ★★★（2箇所削除）    | **採用** |
| 案B     | Propsフラグ方式     | Props定義 + 呼び出し箇所 | ★★（Props変更必要） | 却下     |

**採用理由**: 変更範囲が最小（`renderQuestion` 内に局所化）、暫定措置として削除が容易。

---

## コンポーネント設計

### 変更ファイル

```
apps/desktop/src/renderer/components/skill/wizard/ConversationRoundStep.tsx
```

### 変更箇所: `renderQuestion` 関数内の `q.options.map`

**変更前**:

```tsx
{
  q.options.map((opt) => (
    <button
      key={opt}
      type="button"
      onClick={() => handleOptionSelect(key, opt)}
      aria-pressed={selectedOptions.includes(opt)}
      className={[
        "px-3 py-1.5 rounded-lg text-sm border transition-colors",
        selectedOptions.includes(opt)
          ? "bg-[var(--status-primary)] text-[var(--text-inverse)] border-[var(--status-primary)]"
          : "border-[var(--border-primary)] text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]",
      ].join(" ")}
    >
      {opt}
    </button>
  ));
}
```

**変更後**:

```tsx
{
  q.options.map((opt) => {
    // TODO(UT-SKILL-WIZARD-MSO-RESOLVE-EXTERNAL-001): 主ツールバッジ - resolveExternalIntegration の主ツール参照ロジック変更後に削除
    const isMainTool =
      key === "q5" && selectedOptions.length >= 2 && selectedOptions[0] === opt;
    return (
      <button
        key={opt}
        type="button"
        onClick={() => handleOptionSelect(key, opt)}
        aria-pressed={selectedOptions.includes(opt)}
        className={[
          "inline-flex items-center px-3 py-1.5 rounded-lg text-sm border transition-colors",
          selectedOptions.includes(opt)
            ? "bg-[var(--status-primary)] text-[var(--text-inverse)] border-[var(--status-primary)]"
            : "border-[var(--border-primary)] text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]",
        ].join(" ")}
      >
        {opt}
        {isMainTool && (
          <span
            aria-label="主ツールとして使用される"
            className="ml-2 inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800"
          >
            主ツール
          </span>
        )}
      </button>
    );
  });
}
```

---

## isMainTool ロジック設計

```typescript
const isMainTool =
  key === "q5" && // Q5設問のみ（他設問には一切影響なし）
  selectedOptions.length >= 2 && // 2件以上選択時のみ
  selectedOptions[0] === opt; // 先頭選択（追加順序の先頭）と完全一致
```

| 条件                          | 説明                                                               |
| ----------------------------- | ------------------------------------------------------------------ |
| `key === "q5"`                | Q1〜Q4, Q6では絶対にバッジが出ない。削除もここだけ消せばよい       |
| `selectedOptions.length >= 2` | 単独選択時は非表示（意味のある「主ツール」の概念は複数選択時のみ） |
| `selectedOptions[0] === opt`  | `resolveExternalIntegration` の `selectedOptions[0]` 参照と対称    |

---

## aria-label 設計

| 要素     | 属性         | 値                           | 理由                                                                               |
| -------- | ------------ | ---------------------------- | ---------------------------------------------------------------------------------- |
| `<span>` | `aria-label` | `"主ツールとして使用される"` | バッジのテキスト「主ツール」より意味を補完。スクリーンリーダーでの文脈理解を助ける |

**注意**: スパンの `aria-label` はスパン自身のアクセシブル名となり、親ボタンのアクセシブル名に影響する。

- バッジなし: `<button>Slack</button>` → accessible name = "Slack"
- バッジあり: `<button>Slack <span aria-label="主ツールとして使用される">主ツール</span></button>` → accessible name = "Slack 主ツールとして使用される"

テストでは `name: /Slack/` の正規表現マッチを使用する（厳密一致では失敗する）。

---

## バッジスタイル設計

```
ml-2 inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800
```

| クラス                              | 意味                                             |
| ----------------------------------- | ------------------------------------------------ |
| `ml-2`                              | テキストとの間隔（8px）                          |
| `inline-flex items-center`          | バッジ内コンテンツを縦中央揃え                   |
| `rounded-full`                      | ピル型（完全円形角丸）                           |
| `bg-blue-100`                       | 薄青背景（情報系バッジの慣例色）                 |
| `px-2 py-0.5`                       | 内側余白（水平8px、垂直2px）                     |
| `text-xs font-medium text-blue-800` | 小さめフォント・ミディアムウェイト・濃青テキスト |

ボタン本体に `inline-flex items-center` を追加してバッジとテキストを横並びにする。

---

## 削除容易性の確認

削除時に変更が必要な箇所:

```
ConversationRoundStep.tsx の renderQuestion 内:
1. isMainTool 変数定義（TODOコメント込み）: 4行
2. {isMainTool && <span ...>主ツール</span>}: 7行
合計: 11行の削除のみ（他ファイルへの影響なし）
```

---

## 検証マトリクス（TC-1〜TC-7）

| TC         | テストケース                     | AC   |
| ---------- | -------------------------------- | ---- |
| TC-1       | Q5 2ツール選択→先頭にバッジ      | AC-1 |
| TC-2       | Q5 2ツール選択→2番目にバッジなし | AC-1 |
| TC-3       | Q5 1ツール選択→バッジなし        | AC-2 |
| TC-4       | aria-label確認                   | AC-3 |
| TC-5       | Q3複数選択→バッジなし            | AC-4 |
| TC-6       | Q5 3ツール選択→先頭のみバッジ    | AC-5 |
| TC-7（FP） | Q4/Q6複数選択→バッジなし         | AC-4 |
