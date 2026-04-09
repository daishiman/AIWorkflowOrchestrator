# スコープ定義書

## 変更ファイル一覧（コード）

| ファイル                                                              | 変更種別 | 変更内容                                                                 |
| --------------------------------------------------------------------- | -------- | ------------------------------------------------------------------------ |
| `packages/shared/src/types/skillCreator.ts`                           | 修正     | `VerifyResult` / `VerifyCheckResult` 型を追加                            |
| `packages/shared/src/ipc/channels.ts`                                 | 修正     | `SKILL_CREATOR_VERIFY` 定数・IPC_CHANNELS エントリを追加                 |
| `apps/desktop/src/preload/channels.ts`                                | 修正     | `IPC_CHANNELS.SKILL_CREATOR_VERIFY` + ALLOWED_INVOKE_CHANNELS 追加       |
| `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts` | 修正     | `verify(skillName, authMode, apiKey)` 追加、`skillName -> skillDir` 解決 |
| `apps/desktop/src/main/ipc/creatorHandlers.ts`                        | 修正     | verify ハンドラ追加・unregister に removeHandler 追加                    |
| `apps/desktop/src/preload/skill-creator-api.ts`                       | 修正     | `verifySkill` メソッド（インターフェース＋実装）を追加                   |

## 変更ファイル一覧（テスト）

| ファイル                                                             | 変更種別 | 変更内容                                      |
| -------------------------------------------------------------------- | -------- | --------------------------------------------- |
| `apps/desktop/src/main/ipc/__tests__/creatorHandlers.verify.test.ts` | 新規作成 | verify ハンドラのユニットテスト (TC-V-01〜07) |
| `apps/desktop/src/test/skill-creator-integration.test.ts`            | 修正     | verify テストケース (TC-E2E-V-01/02) を追加   |

## スコープ外（変更しない）

- `SkillCreatorVerificationEngine`（TASK-P0-01 で実装済み）
- 既存の内部用 `verifySkill(skillDir)`（IPC surface ではなく内部 util として維持）
- Renderer 側コード（本タスクのスコープ外）
- 既存の plan/execute/improve/applyImprovement ハンドラ（破壊的変更禁止）

## タスク分類

**NON_VISUAL task** — IPC / Main プロセス実装。Renderer UI 変更なし。
Phase 11 は NON_VISUAL として実行し、スクリーンショットは取得しない。
