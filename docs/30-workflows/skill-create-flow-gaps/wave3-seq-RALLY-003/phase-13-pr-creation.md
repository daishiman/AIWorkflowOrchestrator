# Phase 13: PR作成

## メタ情報

| 項目       | 内容                                       |
| ---------- | ------------------------------------------ |
| Phase      | 13                                         |
| タスクID   | TASK-RALLY-003                             |
| 機能名     | undo-server-rollback-api                   |
| 前提Phase  | Phase 12                                   |
| 後続Phase  | - （タスク完了・RALLY-UNDO-CHAIN-001完了） |
| 作成日     | 2026-04-21                                 |
| ステータス | pending                                    |

## 目的

Undo サーバー rollback API の変更を GitHub Pull Request として提出し、レビューを依頼する。

## PR作成手順

```bash
# 1. 変更内容の最終確認
git diff --stat

# 2. コミット（まだの場合）
git add \
  packages/shared/src/ipc/channels.ts \
  packages/shared/src/types/skillCreator.ts \
  apps/desktop/src/preload/channels.ts \
  apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts \
  apps/desktop/src/main/ipc/creatorHandlers.ts \
  apps/desktop/src/preload/skill-creator-api.ts \
  apps/desktop/src/renderer/components/skill/ConversationalInterview.tsx

git commit -m "feat(undo): TASK-RALLY-003 add server-side rollback API for Undo operation

- Add SKILL_CREATOR_UNDO_USER_INPUT IPC channel constant
- Add UndoUserInputRequest/UndoUserInputResult types
- Add skill-creator:undo-user-input to allowedChannels
- Add RuntimeSkillCreatorFacade.rollbackLastInput() method
- Add IPC handler for skill-creator:undo-user-input
- Add undoUserInput API to preload/skill-creator-api.ts
- Update handleUndo to call IPC for server-side rollback

Completes RALLY-UNDO-CHAIN-001. Requires RALLY-005 to be completed first."

# 3. PR作成
gh pr create \
  --title "feat(undo): TASK-RALLY-003 add server-side rollback API for Undo" \
  --body "..."
```

## PR説明テンプレート

```markdown
## 概要

TASK-RALLY-003: Undo 操作にサーバー側の状態巻き戻し API を追加する。

## 変更内容

7ファイルに IPC 4層整合で変更を加え、Undo がサーバー状態を巻き戻すようにした。

- `packages/shared/src/ipc/channels.ts`: `SKILL_CREATOR_UNDO_USER_INPUT` チャンネル定数追加
- `packages/shared/src/types/skillCreator.ts`: 型追加
- `apps/desktop/src/preload/channels.ts`: ホワイトリスト追加
- `RuntimeSkillCreatorFacade.ts`: `rollbackLastInput` メソッド追加
- `creatorHandlers.ts`: IPC ハンドラ追加
- `preload/skill-creator-api.ts`: `undoUserInput` API 追加
- `ConversationalInterview.tsx`: `handleUndo` を IPC 呼び出し対応に更新

## 背景

Undo がローカルの UI 状態のみを巻き戻し、サーバー側の `awaitingUserInput` を
巻き戻さないため、Undo 後の次回送信でサーバー状態と UI 状態が乖離していた（RALLY-003）。

## 前提

- RALLY-005 完了（invoke を正規ソースとする方針の確立）が必須前提

## テスト

- [x] `pnpm --filter @repo/shared typecheck` 通過
- [x] `pnpm --filter @repo/desktop typecheck` 通過
- [x] `pnpm --filter @repo/desktop lint` 通過
- [x] IPC / Facade / Renderer 各層テスト全通過
- [x] 手動テストで Undo 後のサーバー状態巻き戻しを確認

## chain完了

RALLY-UNDO-CHAIN-001 完了
```

## 完了条件

- [ ] PR を作成した
- [ ] PR URL を artifacts.json に記録した
- [ ] レビュアーをアサインした

## タスク100%実行確認【必須】

- [ ] Phase 1〜12 全完了確認
- [ ] RALLY-005 完了確認済み
- [ ] 受け入れ基準 AC-1〜AC-6 全 PASS
- [ ] RALLY-UNDO-CHAIN-001 完了記録済み
- [ ] PR 作成完了
