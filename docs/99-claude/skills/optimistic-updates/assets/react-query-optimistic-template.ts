/**
 * React Query 楽観的更新テンプレート
 *
 * このテンプレートは楽観的更新の基本パターンを提供します。
 * 実際の使用時には、型定義とロジックをカスタマイズしてください。
 */

import { useMutation, useQueryClient } from "@tanstack/react-query";

// 型定義（実際の型に置き換えてください）
interface Item {
  id: string;
  title: string;
  completed: boolean;
}

interface UpdateItemInput {
  id: string;
  title?: string;
  completed?: boolean;
}

// API関数（実際の実装に置き換えてください）
async function updateItemApi(input: UpdateItemInput): Promise<Item> {
  const response = await fetch(`/api/items/${input.id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw new Error("Update failed");
  }

  return response.json();
}

/**
 * 楽観的更新を使用したミューテーションフック
 */
export function useOptimisticUpdateItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateItemApi,

    // 1. ミューテーション開始前: 楽観的更新を適用
    onMutate: async (newData: UpdateItemInput) => {
      // 既存のクエリをキャンセル（競合回避）
      await queryClient.cancelQueries({ queryKey: ["items"] });

      // 現在のデータを保存（ロールバック用）
      const previousItems = queryClient.getQueryData<Item[]>(["items"]);

      // 楽観的にキャッシュを更新
      queryClient.setQueryData<Item[]>(["items"], (old) => {
        if (!old) return old;
        return old.map((item) =>
          item.id === newData.id ? { ...item, ...newData } : item,
        );
      });

      // ロールバック用のコンテキストを返す
      return { previousItems };
    },

    // 2. エラー時: ロールバック
    onError: (err, newData, context) => {
      // 保存していた前の状態に戻す
      if (context?.previousItems) {
        queryClient.setQueryData(["items"], context.previousItems);
      }

      // ユーザーへのエラー通知（実装に合わせて変更）
      console.error("更新に失敗しました。変更を元に戻しました。", err);
    },

    // 3. 完了時（成功・失敗問わず）: サーバーと同期
    onSettled: () => {
      // サーバーから最新データを取得して一貫性を確保
      queryClient.invalidateQueries({ queryKey: ["items"] });
    },
  });
}

/**
 * 使用例
 *
 * ```tsx
 * function ItemComponent({ item }: { item: Item }) {
 *   const mutation = useOptimisticUpdateItem();
 *
 *   const handleToggle = () => {
 *     mutation.mutate({
 *       id: item.id,
 *       completed: !item.completed,
 *     });
 *   };
 *
 *   return (
 *     <div>
 *       <input
 *         type="checkbox"
 *         checked={item.completed}
 *         onChange={handleToggle}
 *         disabled={mutation.isPending}
 *       />
 *       {item.title}
 *       {mutation.isError && <span>エラー: 再試行してください</span>}
 *     </div>
 *   );
 * }
 * ```
 */
