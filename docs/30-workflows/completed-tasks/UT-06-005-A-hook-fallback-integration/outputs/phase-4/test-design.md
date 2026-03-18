# Phase 4 成果物: テスト設計

## メタ情報

| 項目     | 値                              |
| -------- | ------------------------------- |
| タスクID | UT-06-005-A                     |
| フェーズ | Phase 4 - テスト作成（TDD Red） |
| 作成日   | 2026-03-17                      |

## テストファイル

`apps/desktop/src/main/services/skill/__tests__/SkillExecutor.hook-fallback.test.ts`

## テストケース一覧

### TC-A: コアテスト（Phase 4）

| TC-ID      | テスト名                          | AC対応        | 確認内容                                      |
| ---------- | --------------------------------- | ------------- | --------------------------------------------- |
| TC-A-001-a | Permission拒否→max_retries→abort  | AC-001        | retry が3回で打ち切られ abort                 |
| TC-A-001-b | Permission拒否→skip→proceed:false | AC-001        | skip応答で proceed:false                      |
| TC-A-002   | タイムアウト→abort("timeout")     | AC-002        | 50ms (テスト用短縮) で PermissionTimeoutError |
| TC-A-003-a | retry→2回目承認→proceed:true      | AC-003        | waitForResponse 2回呼出                       |
| TC-A-003-b | 3回retry→max_retries→abort        | AC-003/AC-007 | FR-106 max_retries                            |
| TC-A-004   | skip→proceed:false+message        | AC-004        | executeSkipFlow 実行確認                      |
| TC-A-005   | abort→エラースロー                | AC-005        | max_retries到達でthrow                        |
| TC-A-006   | 例外→fail-closed→abort            | AC-006        | NFR-101 準拠                                  |
| NFR-105    | 許可済みツール自動承認            | AC-007        | waitForResponse 未呼出                        |

### TC-B: 拡充テスト（Phase 6）

| TC-ID    | テスト名                             | 確認内容                 |
| -------- | ------------------------------------ | ------------------------ |
| TC-B-001 | rememberChoice=true→allowTool呼出    | 許可記憶パス             |
| TC-B-002 | rememberChoice=false→allowTool未呼出 | 非記憶パス               |
| TC-B-003 | retry1回→承認                        | waitForResponse 2回      |
| TC-B-004 | retry後skip                          | 複合フォールバック       |
| TC-B-005 | PermissionTimeoutErrorプロパティ     | name, timeoutMs, message |
| TC-B-006 | abort冪等性（同一executionId）       | 二重abort防止            |

## モックパターン

既存 `SkillExecutor.fallback.test.ts` のモック構成を踏襲:

- `vi.mock("../PermissionResolver")` でPermissionResolverモック
- `vi.mock("../PermissionStore")` でPermissionStoreモック
- `vi.mock("@anthropic-ai/claude-agent-sdk")` でSDKモック
- `mockAuthKeyService` でAuthKeyServiceモック

## Red確認

全9テスト（TC-A）が `TypeError: executor.handlePermissionCheck is not a function` で失敗を確認。
