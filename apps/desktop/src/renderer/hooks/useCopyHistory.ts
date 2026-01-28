/**
 * useCopyHistory - コピー履歴機能を使用するためのフック
 *
 * TASK-3-2-D: コピー履歴機能
 *
 * @module @repo/desktop/renderer/hooks/useCopyHistory
 */

import { useContext } from "react";
import {
  CopyHistoryContext,
  type CopyHistoryContextValue,
} from "../contexts/CopyHistoryContext";

/**
 * コピー履歴機能を使用するためのフック
 *
 * @returns CopyHistoryContextValue - 履歴状態とアクション
 * @throws Context外で使用された場合にエラー
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { history, addToHistory, copyFromHistory } = useCopyHistory();
 *
 *   const handleCopy = async (content: string) => {
 *     await navigator.clipboard.writeText(content);
 *     addToHistory(content);
 *   };
 *
 *   return (
 *     <div>
 *       {history.map((item) => (
 *         <button key={item.id} onClick={() => copyFromHistory(item.id)}>
 *           {item.content}
 *         </button>
 *       ))}
 *     </div>
 *   );
 * }
 * ```
 */
export function useCopyHistory(): CopyHistoryContextValue {
  const context = useContext(CopyHistoryContext);

  if (!context) {
    throw new Error("useCopyHistory must be used within CopyHistoryProvider");
  }

  return context;
}
