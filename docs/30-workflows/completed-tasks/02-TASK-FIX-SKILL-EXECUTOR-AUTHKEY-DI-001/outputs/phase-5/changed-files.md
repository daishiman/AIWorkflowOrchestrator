# Phase 5 変更ファイル一覧

| ファイル                                                              | 変更種別 | 変更要約                                                                          |
| --------------------------------------------------------------------- | -------- | --------------------------------------------------------------------------------- |
| `apps/desktop/src/main/ipc/skillHandlers.ts`                          | 実装     | `registerSkillHandlers` に `authKeyService` optional引数追加、SkillExecutorへ注入 |
| `apps/desktop/src/main/ipc/index.ts`                                  | 実装     | `AuthKeyService` 生成を前倒しし、Skill/Authハンドラ間で同一インスタンス共有       |
| `apps/desktop/src/main/ipc/__tests__/ipc-double-registration.test.ts` | テスト   | `registerSkillHandlers` へのauthKeyService注入と同一インスタンス比較を追加        |
