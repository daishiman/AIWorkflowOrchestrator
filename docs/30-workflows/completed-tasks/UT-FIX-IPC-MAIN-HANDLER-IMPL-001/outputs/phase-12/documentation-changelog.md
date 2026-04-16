# ドキュメント変更ログ — UT-FIX-IPC-MAIN-HANDLER-IMPL-001

## 変更ファイル一覧

### 実装ファイル

| ファイル                                               | 変更種別 | 変更内容                                                                                                                                                 |
| ------------------------------------------------------ | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `apps/desktop/src/main/ipc/authHandlers.ts`            | 修正     | `AuthInvokeChannel` 型拡張、`auth:start-oauth-flow` / `auth:test-callback` ハンドラ追加                                                                  |
| `apps/desktop/src/main/ipc/storeHandlers.ts`           | 修正     | `UserSettings` 型追加、`StoreSchema` に `userSettings` 追加、`settings:get` / `settings:update` ハンドラ追加、sender validation / object validation 追加 |
| `apps/desktop/src/main/ipc/agentHandlers.ts`           | 修正     | `resolvePermissionInternal` ヘルパー追加、`skillService` 引数追加、4チャネル実装 + `unregisterAgentExecutionHandlers` 更新                               |
| `apps/desktop/src/main/ipc/index.ts`                   | 修正     | `SkillService` 生成を `registerAgentExecutionHandlers` より前に移動、第6引数追加                                                                         |
| `apps/desktop/src/main/services/skill/SkillService.ts` | 修正     | `getSkillByName` の引数型を `string` に変更し、IPC からの呼び出し境界を明確化                                                                            |

### テストファイル

| ファイル                                          | 変更種別 | 変更内容                                                                                                                                         |
| ------------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| `apps/desktop/src/main/ipc/authHandlers.test.ts`  | 修正     | `auth:start-oauth-flow` / `auth:test-callback` テストケース追加（計6件）                                                                         |
| `apps/desktop/src/main/ipc/storeHandlers.test.ts` | 修正     | `USER_SETTINGS_GET` / `USER_SETTINGS_UPDATE` テストケース拡張（sender validation / updates validation 含む）、`beforeEach` に `mockReset()` 追加 |
| `apps/desktop/src/main/ipc/agentHandlers.test.ts` | 新規     | 4チャネル全テスト（計14件）                                                                                                                      |

### ドキュメントファイル

| ファイル                                                            | 変更種別 | 変更内容                                                    |
| ------------------------------------------------------------------- | -------- | ----------------------------------------------------------- |
| `docs/30-workflows/UT-FIX-IPC-MAIN-HANDLER-IMPL-001/artifacts.json` | 修正     | 全フェーズ `"completed"` に更新                             |
| `docs/30-workflows/UT-FIX-IPC-MAIN-HANDLER-IMPL-001/index.md`       | 修正     | ステータス・受け入れ条件を `completed` / チェック済みに更新 |
| `docs/.../outputs/phase-12/`                                        | 新規     | 6ファイル作成                                               |

## 差分サマリー

- 追加行数（実装）: 約240行
- 追加行数（テスト）: 約280行
- 修正行数（既存テスト）: 3行（`beforeEach` mock reset）
- 新規ドキュメント: 8ファイル
