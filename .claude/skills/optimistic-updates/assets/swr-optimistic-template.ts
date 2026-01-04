/**
 * SWR 楽観的更新テンプレート
 *
 * このテンプレートは SWR を使用した楽観的更新の基本パターンを提供します。
 * 実際の使用時には、型定義とロジックをカスタマイズしてください。
 */

import useSWR, { mutate } from "swr";

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

// フェッチャー関数
const fetcher = (url: string) => fetch(url).then((res) => res.json());

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
 * SWR を使用したアイテム一覧フック（楽観的更新対応）
 */
export function useItems() {
  const { data, error, isLoading } = useSWR<Item[]>("/api/items", fetcher);

  /**
   * 楽観的更新を使用したアイテム更新
   */
  const updateItem = async (input: UpdateItemInput) => {
    // 楽観的更新を実行
    await mutate(
      "/api/items",
      async (currentData: Item[] | undefined) => {
        // 楽観的にデータを更新
        const optimisticData = currentData?.map((item) =>
          item.id === input.id ? { ...item, ...input } : item,
        );

        try {
          // 実際のAPI呼び出し
          await updateItemApi(input);
          return optimisticData;
        } catch (error) {
          // エラー時は自動的にロールバックされる
          throw error;
        }
      },
      {
        // 楽観的データ: サーバー応答前に表示するデータ
        optimisticData: (currentData: Item[] | undefined) =>
          currentData?.map((item) =>
            item.id === input.id ? { ...item, ...input } : item,
          ),

        // エラー時に自動ロールバック
        rollbackOnError: true,

        // 完了後にサーバーと再検証
        revalidate: true,

        // 楽観的更新中は他のリクエストを待たない
        populateCache: true,
      },
    );
  };

  return {
    items: data,
    isLoading,
    isError: error,
    updateItem,
  };
}

/**
 * 使用例
 *
 * ```tsx
 * function ItemList() {
 *   const { items, isLoading, isError, updateItem } = useItems();
 *
 *   if (isLoading) return <div>読み込み中...</div>;
 *   if (isError) return <div>エラーが発生しました</div>;
 *
 *   return (
 *     <ul>
 *       {items?.map((item) => (
 *         <li key={item.id}>
 *           <input
 *             type="checkbox"
 *             checked={item.completed}
 *             onChange={() =>
 *               updateItem({
 *                 id: item.id,
 *                 completed: !item.completed,
 *               })
 *             }
 *           />
 *           {item.title}
 *         </li>
 *       ))}
 *     </ul>
 *   );
 * }
 * ```
 */
