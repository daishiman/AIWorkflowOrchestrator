# Phase 13: Change Summary

## コード

- `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`
  - `plan()` / `improve()` の degraded path で `governanceHooks.onSessionEnd()` を必ず呼ぶように整理
  - `_executeInternal()` の `llmAdapter` 未注入時に explicit error を返す分岐を維持しつつ、`recordExecutionFailure()` と `session_end` まで記録するように整理
  - `terminal_handoff` でも `session_end` を閉じるようにして、監査の断絶を解消

## テスト

- `apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.stub-elimination.test.ts`
  - `execute()` / `plan()` の degraded 回帰を追加
  - `session_start` / `session_end` の対を確認
- 既存の runtime テスト群
  - `RuntimeSkillCreatorFacade.test.ts`
  - `RuntimeSkillCreatorFacade.improve.test.ts`
  - `RuntimeSkillCreatorFacade.executeAsync.test.ts`
  - `RuntimeSkillCreatorFacade.notification.test.ts`
  - `RuntimeSkillCreatorFacade.persist-integration.test.ts`
  - 変更後も PASS を確認

## ドキュメント

- `docs/30-workflows/completed-tasks/step-08-par-task-rt-02-stub-response-error-notification/phase-12-documentation.md`
  - `spec_created` 参照を `implementation_complete` に更新
  - Task 12-1〜12-6 の完了条件を現状に合わせて整理
- `docs/30-workflows/completed-tasks/step-08-par-task-rt-02-stub-response-error-notification/phase-6-test-expansion.md`
  - 完了条件を [x] に更新
- `docs/30-workflows/completed-tasks/step-08-par-task-rt-02-stub-response-error-notification/phase-8-refactoring.md`
  - 完了条件を [x] に更新
- `docs/30-workflows/completed-tasks/step-08-par-task-rt-02-stub-response-error-notification/outputs/phase-11/*`
  - current task screenshots へ差し替え
  - `ui-sanity-visual-review.md` と `phase11-capture-metadata.json` を追加
- `docs/30-workflows/completed-tasks/step-08-par-task-rt-02-stub-response-error-notification/outputs/phase-12/*`
  - implementation guide / system spec / changelog / compliance check / unassigned task detection / skill feedback を current facts に追従

## 追加メモ

- `pnpm vitest run` のフルスイートは既存の環境依存失敗を含むため、変更対象の runtime 回帰テストで実質検証を補完した
- commit / PR はユーザー承認なしのため未実行
