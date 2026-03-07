# Phase 12: 実装ガイド

## Part 1: 中学生向け

### なぜ必要か

なぜ必要かというと、保存データが壊れていたときにアプリが落ちると、ユーザーは設定画面を開けなくなるからです。

### 何をしたか

学校のロッカーの名簿を想像してください。名簿は本来「名前の一覧」ですが、壊れて数字だけになっていると先生は読み取れません。
このタスクでは、名簿を読む前に「一覧かどうか」を確認し、壊れていたら空の名簿に置き換えるようにしました。

## Part 2: 開発者向け

### TypeScript 型定義

```ts
interface PersistedStoreState {
  expandedFolders?: unknown;
  viewHistory?: unknown;
}
```

### API/関数シグネチャ

```ts
getItem(name: string): unknown;
setItem(name: string, value: unknown): void;
setCurrentView(view: ViewType): void;
```

### 使用例

```ts
const raw = parsed.state.expandedFolders;
const folders = Array.isArray(raw)
  ? new Set(raw.filter((v: unknown): v is string => typeof v === "string"))
  : new Set<string>();
```

### エラーハンドリング

- `expandedFolders` が配列でない場合は warning を出して空 `Set` にフォールバックする。
- `viewHistory` が配列でない場合は `setCurrentView` で `[view]` に復旧し、`goBack` は安全に return する。

### エッジケース

- `expandedFolders` が `null` / `number` / `object` の場合
- `expandedFolders` が混合配列（`[1, "folder", null]`）の場合
- `viewHistory` が非配列のまま遷移操作される場合

### 設定可能なパラメータと定数一覧

| 項目               | 値                       | 用途                   |
| ------------------ | ------------------------ | ---------------------- |
| persist key        | `knowledge-studio-store` | localStorageの保存キー |
| fallback (folders) | `new Set<string>()`      | 破損時の安全既定値     |
| fallback (history) | `[view]` / `false`       | 破損時の遷移ガード     |
