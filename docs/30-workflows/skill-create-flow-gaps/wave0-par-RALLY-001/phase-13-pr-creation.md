# Phase 13: PR作成

## メタ情報

| 項目       | 内容                                    |
| ---------- | --------------------------------------- |
| Phase      | 13                                      |
| タスクID   | TASK-RALLY-001                          |
| 機能名     | skill-lifecycle-panel-dead-code-removal |
| 前提Phase  | Phase 12                                |
| 後続Phase  | - （タスク完了）                        |
| 作成日     | 2026-04-21                              |
| ステータス | pending                                 |

## 目的

dead code 削除の変更を GitHub Pull Request として提出し、レビューを依頼する。

## PR作成手順

```bash
# 1. ブランチ確認
git branch

# 2. 変更内容の最終確認
git diff --stat

# 3. コミット（まだの場合）
git add apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx
git commit -m "refactor(skill-lifecycle): remove dead code _handleSubmitWorkflowInput and unused states

TASK-RALLY-001: SkillLifecyclePanel dead code削除

- Remove _handleSubmitWorkflowInput function (unused input submit handler)
- Remove selectedOptionId, textAnswer, secretAnswer, confirmAnswer state declarations
- These were only referenced within the dead handler and are not used in the current rally flow

Part of RALLY Wave 0 cleanup before RALLY-005 workflowSnapshot authority design."

# 4. PR作成
gh pr create \
  --title "refactor(skill-lifecycle): TASK-RALLY-001 remove dead code from SkillLifecyclePanel" \
  --body "..."
```

## PR説明テンプレート

```markdown
## 概要

TASK-RALLY-001: SkillLifecyclePanel から未使用の dead code を削除する。

## 変更内容

- `_handleSubmitWorkflowInput` 関数定義の削除
- `selectedOptionId` / `textAnswer` / `secretAnswer` / `confirmAnswer` の state 宣言削除

## 背景

これらの dead code は現在の入力送信フロー（ConversationalInterview の submitAnswer）では使用されておらず、
コードの意図と実装の整合性を損なっていた。

後続タスク（RALLY-005〜RALLY-008）が SkillLifecyclePanel に変更を加える際の読み間違いリスクを排除するため、
Wave 0 のタスクとして先行して削除する。

## テスト

- [x] `pnpm --filter @repo/desktop typecheck` 通過
- [x] `pnpm --filter @repo/desktop lint` 通過
- [x] 既存テスト全通過
- [x] `grep -rn "_handleSubmitWorkflowInput"` 結果が空

## 関連タスク

- Wave 0 並列: RALLY-002, RALLY-004
- Wave 1 後続: RALLY-005（本PR完了が前提）
```

## 完了条件

- [ ] PR を作成した
- [ ] PR URL を artifacts.json に記録した
- [ ] レビュアーをアサインした

## タスク100%実行確認【必須】

- [ ] Phase 1（要件定義）完了・P50チェック実施済み
- [ ] Phase 2（設計）完了
- [ ] Phase 3（設計レビュー）完了・ゲートPASS
- [ ] Phase 4（テスト作成）完了
- [ ] Phase 5（実装）完了
- [ ] Phase 6（テスト拡充）完了
- [ ] Phase 7（カバレッジ確認）完了
- [ ] Phase 8（リファクタリング）完了
- [ ] Phase 9（品質保証）完了
- [ ] Phase 10（最終レビュー）完了・ゲートPASS
- [ ] Phase 11（手動テスト）完了
- [ ] Phase 12（ドキュメント）完了
- [ ] 受け入れ基準 AC-1〜AC-5 全 PASS
- [ ] PR 作成完了
