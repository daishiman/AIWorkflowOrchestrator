# 楽観的更新パターン

## 概要

楽観的更新（Optimistic Updates）は、サーバーからの応答を待たずに
UIを即座に更新するパターンです。ユーザー体験を向上させますが、
失敗時のロールバック処理が必要です。

## 基本フロー

```
ユーザー操作
    │
    ├──► 1. 現在の状態を保存（ロールバック用）
    │
    ├──► 2. UIを即座に更新（楽観的）
    │
    ├──► 3. サーバーにリクエスト送信
    │
    └──► 4. レスポンス処理
            │
            ├── 成功 ──► 確定（何もしない or 最新データで上書き）
            │
            └── 失敗 ──► ロールバック + エラー通知
```

## React Query での実装

### 基本パターン

```typescript
import { useMutation, useQueryClient } from "@tanstack/react-query";

function useTodoMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateTodo,

    // ミューテーション開始前
    onMutate: async (newTodo) => {
      // 進行中のクエリをキャンセル
      await queryClient.cancelQueries({ queryKey: ["todos"] });

      // 現在の状態を保存
      const previousTodos = queryClient.getQueryData(["todos"]);

      // 楽観的に更新
      queryClient.setQueryData(["todos"], (old: Todo[]) =>
        old.map((todo) => (todo.id === newTodo.id ? newTodo : todo)),
      );

      // ロールバック用にコンテキストを返す
      return { previousTodos };
    },

    // エラー時のロールバック
    onError: (err, newTodo, context) => {
      queryClient.setQueryData(["todos"], context?.previousTodos);
      toast.error("更新に失敗しました");
    },

    // 成功/失敗にかかわらず実行
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["todos"] });
    },
  });
}
```

### 新規作成の楽観的更新

```typescript
const mutation = useMutation({
  mutationFn: createTodo,

  onMutate: async (newTodo) => {
    await queryClient.cancelQueries({ queryKey: ["todos"] });
    const previousTodos = queryClient.getQueryData(["todos"]);

    // 仮のIDで楽観的に追加
    const optimisticTodo = {
      ...newTodo,
      id: `temp-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };

    queryClient.setQueryData(["todos"], (old: Todo[]) => [
      ...old,
      optimisticTodo,
    ]);

    return { previousTodos, optimisticTodo };
  },

  onSuccess: (data, variables, context) => {
    // サーバーからの正式なデータで更新
    queryClient.setQueryData(["todos"], (old: Todo[]) =>
      old.map((todo) => (todo.id === context?.optimisticTodo.id ? data : todo)),
    );
  },

  onError: (err, newTodo, context) => {
    queryClient.setQueryData(["todos"], context?.previousTodos);
  },
});
```

### 削除の楽観的更新

```typescript
const deleteMutation = useMutation({
  mutationFn: deleteTodo,

  onMutate: async (todoId) => {
    await queryClient.cancelQueries({ queryKey: ["todos"] });
    const previousTodos = queryClient.getQueryData(["todos"]);

    // 楽観的に削除
    queryClient.setQueryData(["todos"], (old: Todo[]) =>
      old.filter((todo) => todo.id !== todoId),
    );

    return { previousTodos };
  },

  onError: (err, todoId, context) => {
    queryClient.setQueryData(["todos"], context?.previousTodos);
    toast.error("削除に失敗しました");
  },
});
```

## SWR での実装

### 基本パターン

```typescript
import useSWR, { useSWRConfig } from "swr";

function useTodos() {
  const { data, error } = useSWR("/api/todos", fetcher);
  const { mutate } = useSWRConfig();

  const updateTodo = async (newTodo: Todo) => {
    // 楽観的更新
    mutate(
      "/api/todos",
      (todos: Todo[]) =>
        todos.map((todo) => (todo.id === newTodo.id ? newTodo : todo)),
      false, // revalidateをfalseにして即座更新
    );

    try {
      // サーバーに送信
      await api.updateTodo(newTodo);
      // 成功時は再検証
      mutate("/api/todos");
    } catch (error) {
      // 失敗時はロールバック（再検証で元に戻る）
      mutate("/api/todos");
      throw error;
    }
  };

  return { todos: data, error, updateTodo };
}
```

### 新しいSWR API（useSWRMutation）

```typescript
import useSWRMutation from "swr/mutation";

function useTodoMutation() {
  const { trigger, isMutating } = useSWRMutation(
    "/api/todos",
    async (url, { arg }: { arg: Todo }) => {
      return await api.updateTodo(arg);
    },
    {
      // 楽観的更新
      optimisticData: (currentData, arg) =>
        currentData.map((todo) => (todo.id === arg.id ? arg : todo)),
      // 失敗時は自動ロールバック
      rollbackOnError: true,
      // 成功後に再検証
      revalidate: true,
    },
  );

  return { updateTodo: trigger, isMutating };
}
```

## 考慮すべきケース

### 1. 競合状態の処理

複数のミューテーションが同時に発生する場合

```typescript
// React Query
const mutation = useMutation({
  mutationFn: updateTodo,
  onMutate: async (newTodo) => {
    // 他のミューテーションをキャンセル
    await queryClient.cancelQueries({ queryKey: ["todos", newTodo.id] });
    // ...
  },
});
```

### 2. ネットワークエラーの処理

```typescript
onError: (error, variables, context) => {
  // ロールバック
  queryClient.setQueryData(['todos'], context?.previousTodos);

  // エラーの種類に応じた処理
  if (error.message === 'Network Error') {
    toast.error('ネットワークエラー。再試行してください。');
  } else if (error.response?.status === 409) {
    toast.error('競合が発生しました。画面を更新してください。');
    queryClient.invalidateQueries({ queryKey: ['todos'] });
  } else {
    toast.error('更新に失敗しました');
  }
},
```

### 3. 部分的な更新

```typescript
// サーバーからの応答で特定のフィールドのみ更新
onSuccess: (serverData, variables, context) => {
  queryClient.setQueryData(['todos'], (old: Todo[]) =>
    old.map(todo =>
      todo.id === serverData.id
        ? { ...todo, ...serverData } // サーバーのデータで上書き
        : todo
    )
  );
},
```

## ベストプラクティス

### 1. 適用する基準

```
✅ 楽観的更新が適切
- 成功率が高いミューテーション（99%以上）
- 失敗時のロールバックが許容される
- ユーザーの待ち時間を減らしたい

❌ 楽観的更新は避ける
- 重要な金融トランザクション
- 不可逆な操作
- 成功率が低いミューテーション
```

### 2. ユーザーへのフィードバック

```typescript
// 成功時
toast.success('更新しました');

// 失敗時（ロールバック後）
toast.error('更新に失敗しました。元に戻しました。');

// 進行中の表示（オプション）
{isMutating && <Spinner />}
```

### 3. エラー境界との組み合わせ

```typescript
// 楽観的更新の失敗はエラー境界でキャッチしない
// 代わりにローカルでハンドリング
onError: (error) => {
  // ログ記録
  console.error('Optimistic update failed:', error);

  // ユーザー通知
  toast.error('操作に失敗しました');

  // 必要に応じてエラー報告
  reportError(error);
},
```

## テスト

```typescript
describe("optimistic updates", () => {
  it("should update UI immediately", async () => {
    // 楽観的更新が即座に反映されることを確認
  });

  it("should rollback on error", async () => {
    // サーバーエラー時にロールバックすることを確認
    server.use(
      rest.put("/api/todos/:id", (req, res, ctx) => {
        return res(ctx.status(500));
      }),
    );

    // ミューテーション実行
    // ロールバック確認
  });
});
```
