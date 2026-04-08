# 受入基準 AC-1〜AC-11

| AC番号 | 基準                                                                                                                 | 検証方法              |
| ------ | -------------------------------------------------------------------------------------------------------------------- | --------------------- |
| AC-1   | `channels.ts` に `SKILL_CREATOR_VERIFY = "skill-creator:verify"` 定数が追加されている                                | コードレビュー / grep |
| AC-2   | `preload/channels.ts` に verify surface と invoke whitelist が追加されている                                         | コードレビュー / grep |
| AC-3   | `RuntimeSkillCreatorFacade` に `verify(skillName, authMode, apiKey)` メソッドが実装されている                        | コードレビュー        |
| AC-4   | `creatorHandlers.ts` に verify ハンドラが `validateSender + isBlank + sanitizeErrorMessage` パターンで登録されている | コードレビュー        |
| AC-5   | `skill-creator-api.ts` に `verifySkill` メソッドが公開されている                                                     | コードレビュー        |
| AC-6   | verify レスポンスが `IpcResult<VerifyResult>` 形式である                                                             | テスト PASS           |
| AC-7   | エラー時にサニタイズされたエラーメッセージ（string 型）が返る                                                        | テスト PASS           |
| AC-8   | `unregisterRuntimeSkillCreatorHandlers` に verify チャネルの `removeHandler` が追加されている                        | コードレビュー / grep |
| AC-9   | 既存の plan/execute/improve テストが全件 PASS のまま維持されている                                                   | `pnpm test` PASS      |
| AC-10  | `pnpm --filter @repo/desktop typecheck` が通る                                                                       | typecheck PASS        |
| AC-11  | verify ハンドラ UT と E2E テスト全件 PASS                                                                            | `pnpm test` PASS      |
