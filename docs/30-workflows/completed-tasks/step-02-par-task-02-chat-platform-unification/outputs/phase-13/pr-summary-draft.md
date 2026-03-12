# PR Summary Draft

## タイトル案

`feat(chat-platform): 共通会話基盤と仕様同期を完了`

## 目的

- `general` / `workspace` / `skill-lifecycle` を 1 つの `ChatView` + `chatSlice` 基盤へ統合する
- `WorkspaceView` / `SkillCenterView` を handoff 入口へ整理し、共通 session persist / revive 契約を固定する
- 実装内容、苦戦箇所、未タスク、skill 改善を task spec / system spec / skill 正本へ同期する

## 主な変更点

- `chatSlice` を session platform として再設計し、mode ごとの session 再利用、retry / abort、error state、persist / revive を集約
- `WorkspaceView` に `workspace-open-chat` handoff CTA を追加し、選択ファイル文脈を `ChatView` へ渡す導線を実装
- `SkillCenterView` から `skill-lifecycle` mode へ handoff する導線と `ChatView` の mode summary / recent rail を実装
- `ChatView` / `ChatMessage` の light theme コントラストを修正し、Phase 11 screenshot で再確認
- `.claude/skills/aiworkflow-requirements/` 正本と `.agents` mirror に、今回の共通会話基盤・handoff・revive・苦戦箇所・未タスクを反映
- `task-specification-creator` / `skill-creator` / `github-issue-manager` の追補を取り込み、Issue 同期と Phase 12 再監査パターンを改善

## テスト / 検証

- `pnpm typecheck`
- `pnpm lint`
- `pnpm --filter @repo/shared build`
- `pnpm --filter @repo/desktop build`
- `pnpm --filter @repo/desktop exec vitest run src/renderer/store/slices/chatSlice.test.ts src/renderer/views/ChatView/ChatView.test.tsx src/renderer/views/WorkspaceView/WorkspaceView.test.tsx src/renderer/views/SkillCenterView/__tests__/SkillCenterView.test.tsx`
- `pnpm test --testTimeout=900000`
- `node .claude/skills/task-specification-creator/scripts/validate-phase11-screenshot-coverage.js --workflow docs/30-workflows/completed-tasks/step-02-par-task-02-chat-platform-unification`
- `node .claude/skills/github-issue-manager/scripts/sync_new_issues.js --check`

## 関連ドキュメント

- Phase 12 実装ガイド:
  `docs/30-workflows/completed-tasks/step-02-par-task-02-chat-platform-unification/outputs/phase-12/implementation-guide.md`
- Phase 12 仕様更新サマリー:
  `docs/30-workflows/completed-tasks/step-02-par-task-02-chat-platform-unification/outputs/phase-12/spec-update-summary.md`
- Phase 11 スクリーンショットカバレッジ:
  `docs/30-workflows/completed-tasks/step-02-par-task-02-chat-platform-unification/outputs/phase-11/screenshot-coverage.md`

## 関連 Issue 方針

- 本実装の follow-up は `#1163` (`UT-IMP-CHAT-PLATFORM-HANDOFF-REVIVE-GUARD-001`) として別管理する
- PR 本文の `Closes #` は、親タスクに対応する issue が確認できた場合のみ設定する
