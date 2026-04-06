# 未タスク検出レポート

**タスクID**: TASK-UT-RT-01-EXECUTE-ASYNC-SNAPSHOT-ERROR-MESSAGE-001  
**完了日**: 2026-04-06

---

## 未タスク候補リスト

| #   | 候補タスク名                                                              | 発見ソース                                             | 優先度目安                    | 配置先                               |
| --- | ------------------------------------------------------------------------- | ------------------------------------------------------ | ----------------------------- | ------------------------------------ |
| 1   | `RuntimeSkillCreatorExecuteResponse` union 拡張時の exhaustive check 導入 | Phase 3 設計レビュー（未タスク候補欄）                 | 中（将来 union 拡張時に必要） | `docs/30-workflows/unassigned-task/` |
| 2   | Renderer 側でエラーメッセージが実際に UI に表示されるかの確認タスク       | Phase 11 既知の制限 / Phase 1 スコープ「含まないもの」 | 中（ユーザー体験の改善）      | `docs/30-workflows/unassigned-task/` |

---

## 未タスク詳細

### 未タスク 1: exhaustive check 導入

- **背景**: `isStructuredError` は `success === false` を確認するのみで、`RuntimeSkillCreatorExecuteErrorResponse` と `SkillExecuteResult（success:false）` を区別しない
- **課題**: union 型が将来拡張された場合、switch/exhaustive パターンがなければ漏れが発生する
- **優先度**: 現時点では inline 条件式で十分。将来拡張時に対応

### 未タスク 2: Renderer 側 UI 表示確認

- **背景**: 本タスクのスコープは Main 層のみ。Renderer 側（`SkillCreateWizard.tsx` / `SkillLifecyclePanel.tsx`）でエラー第3引数を受け取る実装はスコープ外
- **課題**: `onWorkflowStateSnapshot` の `error?` 引数が Renderer UI に実際に表示されているか未確認
- **優先度**: IPC ワイヤリングは既存のため低リスクだが、E2E 確認として有用

---

## 確認ソース

| #   | ソース                                         | 確認内容                                      |
| --- | ---------------------------------------------- | --------------------------------------------- |
| 1   | Phase 3 レビュー結果                           | MINOR 判定の指摘事項（本タスクは MINOR なし） |
| 2   | Phase 3 未タスク候補欄                         | exhaustive check 導入候補                     |
| 3   | Phase 11 手動テスト 既知の制限                 | Renderer UI 表示確認                          |
| 4   | 各 Phase 成果物の「将来対応」「TODO」「FIXME」 | Phase 1〜11 全体                              |
