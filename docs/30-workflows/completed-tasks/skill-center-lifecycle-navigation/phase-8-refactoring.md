# Phase 8: リファクタリング

## TASK-SKILL-CENTER-LIFECYCLE-NAV-001

---

## 1. リファクタリング対象分析

| 対象                           | Before                               | After                                                           | 理由                                                    |
| ------------------------------ | ------------------------------------ | --------------------------------------------------------------- | ------------------------------------------------------- |
| `navigateToSkillCreate` の命名 | 関数は残存（skillCreate 用途のまま） | 削除せず。`skillCreate` 主導線のまま維持                        | 既存テスト・`/advanced/` URL との後退互換性を保つため   |
| `skillLifecycle` top-level 案  | 追加対象として残っていた             | 採用しない                                                      | canonical route と責務境界に反するため                  |
| `dockCurrentView`              | なし                                 | `skillManagement` を `skillCenter` に畳む                       | shell の active state を壊さないため                    |
| `SkillManagementPanel` close   | 暗黙の `window.history.back()` 任せ  | `onClose` と fallback を明示                                    | main-shell / advanced route の両対応を 1 実装で扱うため |
| CTA の視覚的優先度             | なし                                 | `skillCreate` を primary、`skillManagement` を secondary に固定 | 主導線と副導線の役割を UI 上で明確に分けるため          |

---

## 2. 重複・ドリフト確認

| チェック                                                                           | 結果                                                                 |
| ---------------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| `SkillManagementPanel` が App.tsx に直接 import されたことで循環依存が発生しないか | なし（unidirectional: App → component）                              |
| `skillManagement` を store / routing / UI の 3 層で同じ意味に保てているか          | ✅ 保持済み                                                          |
| `SkillManagementPanel.route-classification.test.tsx` との二重定義                  | なし。既存テストは内部 lifecycle/create 切替の保証としてそのまま残す |
| `navigateToSkillCreate` が使われなくなるか                                         | ならない。`skillCreate` 主導線の回帰防止として維持                   |

---

## Phase 8 完了確認

- [ ] Before/After テーブル記録完了
- [ ] 重複・循環依存チェック完了
- [ ] リファクタ後テスト全 PASS
