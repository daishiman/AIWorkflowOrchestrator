# Phase 2 成果物: 設計書

## タスク: TASK-LLM-MOD-05-RENDERER-DESC-DISPLAY

## 修正対象コンポーネント

| コンポーネント   | ファイル                   | 修正種別             |
| ---------------- | -------------------------- | -------------------- |
| SelectorDropdown | InlineModelSelector.tsx 内 | description 表示追加 |
| ModelSelector    | ModelSelector.tsx          | baseline（変更なし） |
| ProviderSelector | ProviderSelector.tsx       | 対象外（変更なし）   |
| LLMSelectorPanel | LLMSelectorPanel.tsx       | 対象外（変更なし）   |

## 実装パターン

### description 表示設計

compact UI のスペース制約を考慮し、visible text を増やさず `title` と `aria-describedby` + `sr-only` で補助情報を提供する。

```tsx
// SelectorDropdown の models.map 内
const hasDescription =
  typeof model.description === "string" && model.description.trim().length > 0;
const descriptionId = hasDescription
  ? `inline-model-${model.id}-desc`
  : undefined;

<button
  title={hasDescription ? model.description : undefined}
  aria-describedby={descriptionId}
>
  {model.name}
  {hasDescription ? (
    <span id={descriptionId} className="sr-only">
      {model.description}
    </span>
  ) : null}
</button>;
```

## バリデーションパス

| シナリオ                   | 入力                           | 期待動作                                      |
| -------------------------- | ------------------------------ | --------------------------------------------- |
| 正常系（description あり） | `"高性能マルチモーダルモデル"` | title / aria-describedby 付与、sr-only で補助 |
| 正常系（description なし） | `undefined`                    | 補助要素なし、レイアウト変化なし              |
| 境界値（空文字）           | `""`                           | trim() 判定 → 非表示扱い                      |
| 境界値（空白のみ）         | `"   "`                        | trim() 判定 → 非表示扱い                      |
| 異常系（null）             | `null`                         | typeof チェックで除外                         |
| 異常系（長文）             | 500文字以上                    | DOM を増やさず title / sr-only で保持         |

## セキュリティ設計

- `title` 属性と `sr-only` テキストは React の自動エスケープにより XSS 不可
- `innerHTML` / `dangerouslySetInnerHTML` は使用しない
- HTML タグを含む description はテキストとして表示される

## アクセシビリティ設計

| 属性               | 対象         | 目的                                             |
| ------------------ | ------------ | ------------------------------------------------ |
| `title`            | button 要素  | ネイティブ tooltip                               |
| `aria-describedby` | button 要素  | スクリーンリーダー向け補助情報参照               |
| `id`               | sr-only span | aria-describedby の参照先                        |
| `sr-only` クラス   | span 要素    | 視覚的には非表示、スクリーンリーダーには読み上げ |

## テスト戦略

| テストカテゴリ         | 対象                     | テスト手法                       |
| ---------------------- | ------------------------ | -------------------------------- |
| description 表示確認   | title / aria-describedby | screen.getByTitle / getAttribute |
| description 非表示確認 | undefined / 空文字       | queryBy... が null               |
| XSS 防止               | HTMLタグ含む文字列       | テキストとして扱われることを確認 |
| 回帰テスト             | モデル選択・キーボード   | 既存テストが PASS                |

## Phase 2 完了確認

- [x] InlineModelSelector の description 表示方法が確定している
- [x] 空文字・undefined の安全処理設計が確定している
- [x] Tailwind CSS スタイリングが決定している（sr-only）
- [x] テスト戦略が定義されている
- [x] 本 Phase 内の全タスクを 100% 実行完了
