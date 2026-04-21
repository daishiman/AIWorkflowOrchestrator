# TASK-RALLY-005 - workflowSnapshot更新権限設計確立

## メタ情報

| 項目                | 値                                              |
| ------------------- | ----------------------------------------------- |
| タスクID            | TASK-RALLY-005                                  |
| 機能名              | スキルクリエイター ラリー機能 IPC更新権限設計   |
| 作成日              | 2026-04-21                                      |
| 衝突ドメイン        | SkillLifecyclePanelドメイン                     |
| 実行形態            | seq（Wave 1 - RALLY-001完了後）                 |
| タスク間依存        | RALLY-001完了後                                 |
| 後続タスク          | RALLY-003・RALLY-006・RALLY-008（同一ドメイン） |
| implementation_mode | new                                             |
| chain_id            | RALLY-IPC-UNIFY-CHAIN-001                       |
| chain_position      | 1/2                                             |

## 目的

ラリー機能でワークフロー状態が不整合になる根本原因は「IPC invoke 戻り値（submitUserInputの戻り値）と IPC push イベント（onWorkflowStateChanged）の両方が `workflowSnapshot` の更新権限を持ち、どちらが優先されるかがコードレベルで決まっていない」点にある。

本タスクでは「IPC invoke 戻り値を正規ソース、IPC push イベントは重複ガード付き補完とする」というルールを設計確立し、SkillLifecyclePanel と creatorHandlers の両方に実装する。seqNo または timestamp ベースの排他制御を追加する。

## 実行フロー

### タスク間の直列/並列

```
Wave 0（並列実行可）:
  RALLY-001 ┐
  RALLY-002 │ 同時実行可（ファイル衝突なし）
  RALLY-004 ┘
↓
Wave 1（コア設計確立）:
  RALLY-005 ← RALLY-001完了後（SkillLifecyclePanelドメイン中核）
  RALLY-009 ← RALLY-004完了後（並列可・別ファイル）
  RALLY-002 ← 並列可（ConversationalInterview.tsx）
↓
Wave 2（副作用フック修正）:
  RALLY-006 ← RALLY-005完了後（直列・同一ファイル）
  RALLY-008 ← RALLY-006完了後（直列・同一ファイル）
↓
Wave 3（拡張機能）:
  RALLY-003 ← RALLY-005完了後
```

### Phase内SubAgent編成

- **Phase 1**: SubAgent-A（SkillLifecyclePanel調査）・SubAgent-B（creatorHandlers調査）・SubAgent-C（型定義調査）を**並列**実行
- **Phase 2**: SubAgent-D（統合設計）が**直列**（A・B・C完了後）
- **Phase 4**: SubAgent-A（SkillLifecyclePanelテスト）・SubAgent-B（creatorHandlersテスト）を**並列**作成可
- **Phase 5**: 型定義変更 → creatorHandlers変更 → SkillLifecyclePanel変更 の順で**直列**実装

## 対象ファイル

- `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx`
- `apps/desktop/src/main/ipc/creatorHandlers.ts`
- `packages/shared/src/types/skillCreator.ts`

## Phases

| Phase | ファイル                     | ステータス |
| ----- | ---------------------------- | ---------- |
| 1     | phase-1-requirements.md      | pending    |
| 2     | phase-2-design.md            | pending    |
| 3     | phase-3-design-review.md     | pending    |
| 4     | phase-4-test-creation.md     | pending    |
| 5     | phase-5-implementation.md    | pending    |
| 6     | phase-6-test-expansion.md    | pending    |
| 7     | phase-7-coverage-check.md    | pending    |
| 8     | phase-8-refactoring.md       | pending    |
| 9     | phase-9-quality-assurance.md | pending    |
| 10    | phase-10-final-review.md     | pending    |
| 11    | phase-11-manual-test.md      | pending    |
| 12    | phase-12-documentation.md    | pending    |
| 13    | phase-13-pr-creation.md      | pending    |
