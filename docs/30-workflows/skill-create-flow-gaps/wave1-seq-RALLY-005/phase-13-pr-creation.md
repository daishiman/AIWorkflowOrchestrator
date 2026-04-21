# Phase 13: PR作成

## メタ情報

| 項目       | 値             |
| ---------- | -------------- |
| Phase      | 13             |
| 機能名     | TASK-RALLY-005 |
| 前提Phase  | Phase 12       |
| 後続Phase  | -              |
| ステータス | pending        |

## SubAgentチーム編成

| SubAgent   | 担当             | 実行形態 |
| ---------- | ---------------- | -------- |
| SubAgent-A | PR作成・完了確認 | **直列** |

## PR作成手順

```bash
# 変更の最終確認
git diff packages/shared/src/types/skillCreator.ts
git diff apps/desktop/src/main/ipc/creatorHandlers.ts
git diff apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx

# コミット
git add packages/shared/src/types/skillCreator.ts
git add apps/desktop/src/main/ipc/creatorHandlers.ts
git add apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx
git commit -m "feat(ipc): RALLY-005 workflowSnapshot更新権限設計確立

- WorkflowSnapshot型にseqNoフィールド追加
- creatorHandlers.tsでsnapshotにseqNo付与
- SkillLifecyclePanelにworkflowSnapshotRef・pendingPushRef実装
- onWorkflowStateChangedにisSubmittingガード・seqNo比較ガード追加

rally-phase-1-analysis.md 懸念点1・11を解消。
RALLY-006・RALLY-008・RALLY-003の実行前提を確立。
chain_id: RALLY-IPC-UNIFY-CHAIN-001 (1/2)"

# PR作成
gh pr create \
  --title "feat(ipc): RALLY-005 workflowSnapshot更新権限設計確立" \
  --body "..."
```

## PR説明テンプレート

```markdown
## 概要

workflowSnapshot の更新経路を「IPC invoke 戻り値を正規ソース・push イベントを補完ソース」として設計確立します。

## 変更内容

- `WorkflowSnapshot` 型に `seqNo?: number` フィールド追加
- `creatorHandlers.ts` で snapshot に seqNo を付与
- `SkillLifecyclePanel.tsx` に競合ガードロジック実装（pendingPushRef・seqNo比較）

## 関連タスク

- TASK-RALLY-005
- chain_id: RALLY-IPC-UNIFY-CHAIN-001 (1/2)
- 後続: RALLY-006・RALLY-008・RALLY-003

## テスト

- TC-1〜TC-7 全件 PASS
- `pnpm typecheck` PASS
- `pnpm lint` PASS（exhaustive-deps 警告ゼロ）
```

## 完了条件

- [ ] PR が作成されている
- [ ] CI がすべて PASS している
- [ ] レビュアーがアサインされている
- [ ] RALLY-006・RALLY-008・RALLY-003 の着手可能状態であることを確認済み

## タスク100%実行確認【必須】

- [ ] Phase 1（要件定義）完了・P50チェック実施済み
- [ ] Phase 2（設計）完了
- [ ] Phase 3（設計レビュー）完了
- [ ] Phase 4（テスト設計）完了
- [ ] Phase 5（実装）完了
- [ ] Phase 6（テスト拡充）完了
- [ ] Phase 7（カバレッジ確認）完了
- [ ] Phase 8（リファクタリング）完了
- [ ] Phase 9（品質保証）完了
- [ ] Phase 10（最終レビュー）完了
- [ ] Phase 11（手動テスト）完了
- [ ] Phase 12（ドキュメント）完了
- [ ] 受け入れ基準 AC-1〜AC-6 全 PASS
- [ ] RALLY-006 / RALLY-008 の実行前提（seqNo型・pendingPushRef実装）が整っている
