# SmartDefault AC-4 フォールバック仕様のフィールド独立推論性明示化 - 実装ガイド

## メタ情報

| 項目     | 内容                                                             |
| -------- | ---------------------------------------------------------------- |
| 機能名   | SmartDefault AC-4 フォールバック仕様のフィールド独立推論性明示化 |
| 作成日   | 2026-04-11                                                       |
| 対象読者 | 開発者・技術者・レビュー担当                                     |

---

## Part 1

### なぜ必要か

SmartDefault の説明で一番誤解されやすい点は、「ひとつの入力が空だと、全部の推論が止まる」と思い込んでしまうことです。
今回の仕様では、`purpose` と `category` は同じ役割ではありません。

- `purpose` は `tool` と `timing` を決める
- `category` は `format` を決める

たとえば、`purpose` が空でも `category` が有効なら `format` は独立して決められます。
この独立性を文書に固定しないと、後続の仕様書やテストで「全部 null にする」誤解が再発します。

### 何をするか

今回の close-out では、以下を明示しました。

1. `purpose` の推論対象を `tool` と `timing` に限定する
2. `category` の推論対象を `format` に限定する
3. `format` は `purpose` からは推論しない
4. 入力の欠損は、そのフィールドにだけ影響させる

つまり、フィールド間の依存を減らして、見た目も実装も読みやすくします。

### 日常の例え

たとえば、買い物メモを分けて考えるとわかりやすいです。

- 「何を買うか」だけ空欄でも
- 「どこで買うか」の分類は決められる

`purpose` は「何をしたいか」のメモ、`category` は「どの種類か」のメモです。
片方が空でも、もう片方の整理は止まりません。

### 今回作ったもの

| 日本語 | 英語     | 役割                                  |
| ------ | -------- | ------------------------------------- |
| 目的   | purpose  | `tool` / `timing` の入力元            |
| 分類   | category | `format` の入力元                     |
| 形式   | format   | `category` からのみ独立推論される結果 |

---

## Part 2

### 型定義

```typescript
interface SmartDefaultResult {
  purpose: string | null;
  category: string | null;
  format: string | null; // category からのみ推論
}
```

### APIシグネチャ

```typescript
inferSmartDefaults(input: SkillInfoFormData): SmartDefaultResult
```

補助関数の責務は以下の通りです。

```typescript
inferTool(purpose: string | null): string | null;
inferTiming(purpose: string | null): string | null;
inferFormat(category: string | null): string | null;
```

### 使用例

```typescript
const purpose = input.purpose?.trim() || null;
const category = input.category?.trim() || null;

const tool = inferTool(purpose);
const timing = inferTiming(purpose);
const format = inferFormat(category);

return {
  purpose,
  category,
  format,
  tool,
  timing,
};
```

### エラーハンドリング

| ケース                                    | 期待動作                                                                      |
| ----------------------------------------- | ----------------------------------------------------------------------------- |
| `purpose` が空文字 / `undefined` / `null` | `purpose` だけ `null` にし、`category` と `format` は独立評価を継続           |
| `category` が空                           | `format` は `null`、`purpose` 由来の `tool` / `timing` は継続                 |
| `purpose` と `category` の両方が有効      | `purpose` から `tool` / `timing`、`category` から `format` をそれぞれ推論     |
| `purpose` が短すぎる / 曖昧               | `tool` / `timing` は `null` を返してもよいが、`category` の結果は巻き込まない |

### エッジケース

- 空白だけの `purpose` は `trim()` 後に `null`
- `format` は `category` からしか決めない
- `purpose` が有効でも `category` が空なら `format` は `null`
- `category` が有効でも `purpose` が空なら `tool` / `timing` は `null` のまま

### 設定項目と定数一覧

| 項目       | 型               | 説明                                   |
| ---------- | ---------------- | -------------------------------------- |
| `purpose`  | `string \| null` | `tool` / `timing` の判定元             |
| `category` | `string \| null` | `format` の判定元                      |
| `format`   | `string \| null` | `category` からのみ推論                |
| `tool`     | `string \| null` | `purpose` から推論される外部連携先     |
| `timing`   | `string \| null` | `purpose` から推論される実行タイミング |

### テスト構成

- `category` が `code-support` のとき `format = "code"`
- `category` が `data-analysis` のとき `format = "structured"`
- `purpose` が空でも `category` 由来の `format` は壊れない
- `purpose` が有効でも `category` が空なら `format` は `null`
- `inferenceLog` の長さが 3 であることを回帰テストで確認する
