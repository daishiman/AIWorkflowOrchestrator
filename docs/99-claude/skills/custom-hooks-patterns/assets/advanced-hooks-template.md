# 高度なカスタムフックテンプレート

## 概要

複雑なユースケースに対応するカスタムフックのテンプレート集。
各カテゴリの詳細実装は個別ファイルを参照。

## カテゴリ一覧

| カテゴリ       | ファイル                                           | 主なフック                            |
| -------------- | -------------------------------------------------- | ------------------------------------- |
| データフェッチ | [data-fetch-hooks.md](data-fetch-hooks.md)         | useFetch, useAsync                    |
| フォーム管理   | [form-hooks.md](form-hooks.md)                     | useForm（バリデーション付き）         |
| 状態管理       | [advanced-state-hooks.md](advanced-state-hooks.md) | useReducerWithMiddleware, useUndoRedo |
| WebSocket      | [websocket-hooks.md](websocket-hooks.md)           | useWebSocket                          |

## データフェッチフック

### useFetch

データフェッチを管理するフック。AbortControllerによるキャンセル対応。

```typescript
const { data, isLoading, error, refetch } = useFetch<User>("/api/user");
```

詳細: [data-fetch-hooks.md](data-fetch-hooks.md)

### useAsync

任意の非同期関数を管理するフック。手動実行とリセット対応。

```typescript
const { execute, data, isLoading, error, reset } = useAsync(updateUser);
```

詳細: [data-fetch-hooks.md](data-fetch-hooks.md)

## フォームフック

### useForm

バリデーションスキーマ付きのフォーム状態管理フック。

```typescript
const form = useForm({
  initialValues: { email: "", password: "" },
  validationSchema: { email: [required(), email()] },
  onSubmit: handleSubmit,
});
```

詳細: [form-hooks.md](form-hooks.md)

## 状態管理フック

### useReducerWithMiddleware

ミドルウェア対応のuseReducer。ロギングや非同期アクション対応。

```typescript
const [state, dispatch] = useReducerWithMiddleware(reducer, initialState, [
  loggerMiddleware,
  thunkMiddleware,
]);
```

詳細: [advanced-state-hooks.md](advanced-state-hooks.md)

### useUndoRedo

Undo/Redo機能付きの状態管理フック。履歴数制限対応。

```typescript
const { state, set, undo, redo, canUndo, canRedo } = useUndoRedo(initialState);
```

詳細: [advanced-state-hooks.md](advanced-state-hooks.md)

## WebSocketフック

### useWebSocket

WebSocket接続の管理フック。自動再接続対応。

```typescript
const { status, lastMessage, sendMessage, connect, disconnect } =
  useWebSocket<Message>(url);
```

詳細: [websocket-hooks.md](websocket-hooks.md)

## 選択ガイド

| ユースケース             | 推奨フック   |
| ------------------------ | ------------ |
| APIからのデータ取得      | useFetch     |
| ボタン押下時の非同期処理 | useAsync     |
| 複雑なフォーム           | useForm      |
| 履歴付きエディタ         | useUndoRedo  |
| リアルタイム通信         | useWebSocket |
