# Phase 13: PR作成

## メタ情報

| 項目       | 値             |
| ---------- | -------------- |
| Phase      | 13             |
| 機能名     | TASK-RALLY-006 |
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
git diff apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx

# コミット
git add apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx
git commit -m "fix(skill): RALLY-006 L675-708 useEffect依存配列からworkflowSnapshot?.planIdを除去

- workflowSnapshotPlanIdRefを追加しworkflowSnapshot?.planIdをref追跡
- メインuseEffectの依存配列からworkflowSnapshot?.planIdを除去
- フォールバック参照をworkflowSnapshotPlanIdRef.current経由に変更

IPC pull再実行ループリスクを排除。
RALLY-008（processWorkflowOutcome await統一）の実行前提を確立。"

# PR作成
gh pr create \
  --title "fix(skill): RALLY-006 useEffect依存配列循環リスク排除" \
  --body "..."
```

## PR説明テンプレート

```markdown
## 概要

`SkillLifecyclePanel.tsx` L675-708 の useEffect 依存配列から `workflowSnapshot?.planId` を除去し、IPC pull の再実行ループリスクを排除します。

## 変更内容

- `workflowSnapshotPlanIdRef` を追加し `workflowSnapshot?.planId` の最新値を ref 追跡
- メイン useEffect の依存配列から `workflowSnapshot?.planId` を除去
- エフェクト内フォールバック参照を `workflowSnapshotPlanIdRef.current` 経由に変更

## 関連タスク

- TASK-RALLY-006
- 依存: RALLY-005（IPC権限設計確立）完了後
- 後続: RALLY-008（processWorkflowOutcome await統一）

## テスト

- TC-1〜TC-5 全件 PASS
- `pnpm typecheck` PASS
- `pnpm lint` PASS（exhaustive-deps 警告ゼロ）
```

## 完了条件

- [ ] PR が作成されている
- [ ] CI がすべて PASS している
- [ ] レビュアーがアサインされている
- [ ] RALLY-008 の着手可能状態であることを確認済み

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
- [ ] RALLY-008 の実行前提（依存配列循環排除済み）が整っている
