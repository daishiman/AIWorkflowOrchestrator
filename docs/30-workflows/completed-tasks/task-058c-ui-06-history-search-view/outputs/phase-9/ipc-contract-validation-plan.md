# Phase 9 IPC 契約検証計画

## 契約一覧

| 契約                           | 確認方法                                  | 結果 |
| ------------------------------ | ----------------------------------------- | ---- |
| `history:search` request shape | `preload/types.ts` と handler test を照合 | PASS |
| `history:get-stats` envelope   | 既存 handler 実装と UI 呼び出しを照合     | PASS |
| query trim                     | `historySearchHandlers.test.ts`           | PASS |
| renderer error surface         | `HistorySearchView.test.tsx` と TC-11-11  | PASS |

## 残リスク

- sender validation の詳細分岐は 058c 範囲外のため専用 test 未追加
- `history:get-stats` は UI 上で常設しなくなったが契約自体は維持している
