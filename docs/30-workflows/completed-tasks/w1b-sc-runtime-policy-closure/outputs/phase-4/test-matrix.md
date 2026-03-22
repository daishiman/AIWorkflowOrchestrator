# Phase 4: テストケース一覧

## メタ情報

| 項目     | 値                                |
| -------- | --------------------------------- |
| Phase    | 4                                 |
| タスクID | TASK-SC-02-RUNTIME-POLICY-CLOSURE |
| 作成日   | 2026-03-22                        |

## テストケース一覧

| #   | テストケース                                                  | パターン    | 結果(Red)       |
| --- | ------------------------------------------------------------- | ----------- | --------------- |
| 1   | api-key + 有効apiKey → integrated_api                         | A           | PASS (既存)     |
| 2   | api-key + 空白apiKey → terminal_handoff                       | A→B/C       | PASS (既存)     |
| 3   | api-key + null → terminal_handoff                             | A→B/C       | PASS (既存)     |
| 4   | api-key + 空文字列 → terminal_handoff                         | A→B/C       | PASS (既存)     |
| 5   | apiKey無効 + subscription有効 → subscription terminal_handoff | C           | FAIL (新規)     |
| 6   | apiKey無効 + subscription有効 → bundle.runbook存在            | C           | FAIL (新規)     |
| 7   | apiKey無効 + subscription無効 → no-auth terminal_handoff      | B           | FAIL (新規)     |
| 8   | subscription + 有効apiKey → integrated_api（A優先）           | A           | FAIL (新規)     |
| 9   | no-auth bundle 必須フィールド                                 | B           | PASS (既存更新) |
| 10  | subscription bundle 必須フィールド                            | C           | FAIL (新規)     |
| 11  | permissionMode default                                        | A           | PASS (既存)     |
| 12  | apiKey trim                                                   | A           | PASS (既存)     |
| 13  | validateToken()例外 → no-auth                                 | degradation | FAIL (新規)     |
| 14  | provider未注入 → no-auth                                      | degradation | FAIL (新規)     |
| 15  | getKey()例外 + subscription有効 → subscription                | degradation | FAIL (新規)     |
| 16  | getKey()例外 + subscription無効 → no-auth                     | degradation | FAIL (新規)     |
| 17  | resolveWithService → integrated_api                           | service     | PASS (既存)     |
| 18  | resolveWithService null → terminal_handoff                    | service     | PASS (既存)     |
| 19  | authKeyService無し → terminal_handoff                         | service     | PASS (既存)     |

## Red確認結果

- 9テスト FAIL（新規テスト: subscription/graceful degradation）
- 10テスト PASS（既存テスト: パターンA・構造テスト）

## 完了条件チェック

- [x] パターンA（integrated_api）テストが作成されている
- [x] パターンB（no-auth terminal_handoff）テストが作成されている
- [x] パターンC（subscription terminal_handoff）テストが作成されている
- [x] TerminalHandoffBundle の各モード別フィールドテストが作成されている
- [x] graceful degradation テスト（例外/未注入）が作成されている
- [x] pnpm vitest run で全テストが Red（実装前のため失敗）であることを確認している
