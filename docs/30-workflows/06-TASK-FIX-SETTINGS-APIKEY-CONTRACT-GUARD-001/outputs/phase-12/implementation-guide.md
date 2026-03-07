# 実装ガイド: 設定画面 apiKey.list 契約防御と providers 正規化

## メタ情報

| 項目      | 値                                          |
| --------- | ------------------------------------------- |
| タスク ID | TASK-FIX-SETTINGS-APIKEY-CONTRACT-GUARD-001 |
| Phase     | 12 - ドキュメント                           |
| 作成日    | 2026-03-07                                  |

---

## Part 1: 概念説明（中学生でもわかるレベル）

なぜ必要かを先に説明すると、受け取るデータが壊れている可能性は常にあり、確認しないと画面全体が止まるからです。何をするかはその次で、受け取った内容を段階的に検証して安全な形にそろえます。

### データを検証するとは？

お店で注文した料理が来たとき、注文通りの料理か確認してから食べるのと同じです。もし違う料理が来ても、慌てず「すみません、これは違います」と言えば大丈夫です。プログラムでも、受け取ったデータが期待通りか確認してから使うことで、エラーで画面が止まるのを防ぎます。

### 今回の修正を料理に例えると

設定画面では「APIキーの一覧」というデータを裏方（Main Process）から受け取ります。

**修正前の問題:**

- 「一覧」と言いながら、実は一覧（配列）じゃないもの（例えば数値や null）が届く可能性があった
- 一覧の中に、必要な情報（プロバイダー名やステータス）が欠けた不良品が混ざっている可能性があった
- これらが起きると、画面がクラッシュして真っ白になってしまう

**修正後:**

1. **裏方側（Main Process）**: 料理を出す前に「これは本当に一覧（配列）か？」を確認する。違っていたら空の皿（空配列）を出す
2. **表側（Renderer）**: 受け取った料理の中身を1つずつ確認する。プロバイダー名が入っていない、ステータスが入っていない、そもそも null のような不良品はフィルタで除外する
3. **パターン統一**: 別の画面（プロフィール画面）でも同じ「配列かどうか確認する」パターンを統一した

### 防御の多層構造

1層だけだと、その1層が破られたら終わりです。料理屋さんでも「厨房でチェック」「配膳前にチェック」「テーブルに届いてからチェック」と複数回確認することで、間違いの確率を大幅に減らせます。

---

## Part 2: 開発者向け実装詳細

### 変更概要

| 変更ファイル                           | 変更内容                                     | GAP ID    |
| -------------------------------------- | -------------------------------------------- | --------- |
| `ApiKeysSection/index.tsx`             | normalizeProviders フィルタ追加              | GAP-01,03 |
| `apiKeyHandlers.ts`                    | list ハンドラに Array.isArray バリデーション | GAP-05    |
| `profileHandlers.ts`                   | 3箇所の `?? []` を Array.isArray に統一      | GAP-06    |
| `ApiKeysSection.test.tsx`（新規）      | Renderer 側テスト 7件追加                    | GAP-TEST  |
| `apiKeyHandlers.test.ts`（既存に追加） | Main 側テスト 13件追加                       | GAP-TEST  |

### 1. normalizeProviders フィルタ設計（Renderer 側）

`ApiKeysSection/index.tsx` の `fetchApiKeyStatuses` 関数内に、要素レベルの防御フィルタを追加しました。

**設計判断:**

- `rawProviders` として配列を取得した後、type predicate 付きの `.filter()` で不正要素を除外
- type predicate `(item): item is ProviderStatus` により、フィルタ後の型が `ProviderStatus[]` として推論される
- フィルタ条件は5段階: `null チェック` → `typeof object` → `"provider" in item` → `typeof string` → `"status" in item` + `typeof string`

**フィルタで除外される要素の例:**

| 入力値                          | 除外理由                                   |
| ------------------------------- | ------------------------------------------ |
| `null`                          | `item != null` で除外                      |
| `undefined`                     | `item != null` で除外                      |
| `42`（数値）                    | `typeof item === "object"` で除外          |
| `"string"`                      | `typeof item === "object"` で除外          |
| `{ status: "registered" }`      | `"provider" in item` で除外                |
| `{ provider: "openai" }`        | `"status" in item` で除外                  |
| `{ provider: 123, status: "" }` | `typeof item.provider === "string"` で除外 |

**差分が出た場合の警告ログ:**

```typescript
if (rawProviders.length !== providers.length) {
  console.warn(
    "[ApiKeysSection] Some provider entries were malformed and filtered out:",
    rawProviders.length - providers.length,
    "entries removed",
  );
}
```

### 2. Main 側バリデーション（apiKeyHandlers.ts）

`apiKey:list` ハンドラのレスポンス生成部分にバリデーションを追加しました。

**変更前:**

```typescript
const result = await apiKeyStorage.listProviders();
return { success: true, data: result };
```

**変更後:**

```typescript
const result = await apiKeyStorage.listProviders();
const providers = Array.isArray(result?.providers) ? result.providers : [];
const registeredCount = providers.filter(
  (p) => p?.status === "registered",
).length;
return {
  success: true,
  data: { providers, registeredCount, totalCount: providers.length },
};
```

**P48 準拠**: `result.providers` への直接アクセスではなく、`Array.isArray()` + optional chaining で実行時型検証を行い、non-null assertion を回避しています。

### 3. profileHandlers パターン統一（GAP-06）

3箇所の `user.identities ?? []` を `Array.isArray(user.identities) ? user.identities : []` に統一しました。

**対象ハンドラ:**

1. `profile:list` — ユーザーの連携プロバイダー一覧取得
2. `profile:get` — プロバイダー解除時の最終プロバイダーチェック
3. `profile:update` — プロフィール更新時の連携プロバイダー情報取得

**なぜ `?? []` では不十分か:**

- Nullish Coalescing (`??`) は `null` と `undefined` のみをフォールバックする
- `user.identities` が数値（`0`）、空文字列（`""`）、オブジェクト（`{}`）の場合はフォールバックされず、後続の `.map()` でクラッシュする
- `Array.isArray()` は「配列かどうか」を厳密に判定するため、上記の全ケースを安全にフォールバックする

### 4. テスト戦略

**テスト総数: 20件**（Renderer 7件 + Main 13件）

#### Renderer 側テスト（7件）

| テスト ID    | シナリオ                                 |
| ------------ | ---------------------------------------- |
| GAP-TEST-01  | `result.data` が undefined の場合        |
| GAP-TEST-01b | `result.data` が null の場合             |
| GAP-TEST-02  | providers が空配列の場合                 |
| GAP-TEST-03  | provider フィールド欠損要素のフィルタ    |
| GAP-TEST-03b | status フィールド欠損要素のフィルタ      |
| GAP-TEST-03c | null/undefined/数値/文字列混在のフィルタ |
| GAP-TEST-04  | apiKey.list() reject 時のエラー表示      |

#### Main 側テスト（13件）

apiKeyHandlers と profileHandlers の Array.isArray バリデーションを網羅的に検証。providers が非配列値（undefined, null, オブジェクト, 数値, 文字列）の場合に空配列にフォールバックすることを確認。

### 5. APIシグネチャと使用例

#### APIシグネチャ

```ts
interface ProviderListResult {
  providers: ProviderStatus[];
  registeredCount: number;
  totalCount: number;
}
```

```typescript
window.electronAPI.apiKey.list(): Promise<
  IPCResponse<{
    providers: ProviderStatus[];
    registeredCount: number;
    totalCount: number;
  }>
>;
```

#### 使用例

```ts
const result = await window.electronAPI.apiKey.list();
if (!result?.success || !result?.data) {
  setError(result?.error?.message ?? "Failed to load API keys");
  return;
}
const providers = Array.isArray(result.data.providers)
  ? result.data.providers
  : [];
```

### 6. エラーハンドリング

- Main 側: 例外時は `IPCResponse` の `error` で返却し、機密情報は `sanitizeApiKeyError` でマスク
- Renderer 側: `try/catch` で例外を吸収し、UIに「APIキーの取得に失敗しました」を表示
- shape 崩れ時: `Array.isArray` で空配列フォールバックし、クラッシュを回避

### 7. エッジケース

- `result.data` が `undefined` / `null`
- `providers` が配列以外（文字列・数値・オブジェクト）
- `providers` 配列に `null` や不完全要素が混在
- `window.electronAPI.apiKey` が未公開

### 8. 設定項目と定数一覧

| 設定項目             | 値                            | 用途                              |
| -------------------- | ----------------------------- | --------------------------------- |
| 対象プロバイダー定数 | `ALL_PROVIDERS`               | 常に4プロバイダー行を表示する基準 |
| 型ガード条件         | `provider/status` が文字列    | malformed 要素除外                |
| フォールバック文言   | `APIキー機能が利用できません` | API未公開時の表示                 |
| フォールバック文言   | `APIキーの取得に失敗しました` | 例外時の表示                      |

### 9. 既知の制約と今後の改善点

- `normalizeProviders` のフィルタロジックは ApiKeysSection 内にインラインで定義。3箇所以上で使われる場合は `ensureArray` ヘルパーとして共通化を検討する
- ErrorBoundary による画面全体のクラッシュ防止は本タスクのスコープ外。将来タスクとして検討する
