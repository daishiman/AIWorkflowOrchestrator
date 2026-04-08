# Phase 9: リスクレジスター — UT-SDK-07-APPROVAL-REQUEST-SURFACE-001

## リスク一覧

| ID   | リスク内容                                                      | 発生確率 | 影響度 | 対策                                                                     | 現状       |
| ---- | --------------------------------------------------------------- | -------- | ------ | ------------------------------------------------------------------------ | ---------- |
| R-01 | APPROVAL_REQUEST が ALLOWED_ON_CHANNELS から除外される          | 低       | 高     | TC-APPR-13 で検証済み                                                    | 軽減済み   |
| R-02 | pendingApproval state が null のまま approve/reject が呼ばれる  | 低       | 中     | handleApprove/Reject に early return ガード実装済み                      | 軽減済み   |
| R-03 | アンマウント後に approval callback が発火し setState が呼ばれる | 低       | 中     | useEffect の cleanup で unsubscribe 済み（TC-APPR-10）                   | 軽減済み   |
| R-04 | 多重購読による listener 蓄積（メモリリーク）                    | 低       | 低     | 各購読の unsubscribe を返す設計（TC-APPR-11/12）                         | 軽減済み   |
| R-05 | respondToApproval が失敗した場合の UI 整合性                    | 中       | 中     | Promise の void 処理。現状 UI はクリア済みで Main 側エラーは別途通知想定 | 残存リスク |
| R-06 | ApprovalSheet の data-testid が変更された場合のテスト脆弱性     | 低       | 低     | テストは UI 実装と密結合だが、変更時は同時修正が必要                     | 残存リスク |

## 残存リスクの評価

**R-05**: `respondToApproval` が失敗してもUIはクリアされる。Main プロセス側でエラーが発生した場合の再表示フローは現スコープ外。許容可能なリスクと判断。

**R-06**: data-testid ベースのテストは UI リグレッション検出に有効。testid 変更は意図的な場合のみ発生するため許容可能。

## 総合リスク評価: LOW（残存2件はいずれも低影響）
