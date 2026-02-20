# Phase 6 テスト拡充報告書 — UT-FIX-SKILL-REMOVE-INTERFACE-001

## メタ情報

| 項目        | 値                                     |
| ----------- | -------------------------------------- |
| タスクID    | UT-FIX-SKILL-REMOVE-INTERFACE-001      |
| Phase       | 6（テスト拡充）                        |
| 前Phase依存 | Phase 5 実装完了（`outputs/phase-5/`） |
| 担当        | Claude Code                            |
| 実施日      | 2026-02-20                             |

## 目的

Phase 5 で実装した skill:remove ハンドラの修正に対して、セキュリティ検証・エッジケース・エラー伝播テストを追加し、カバレッジ基準の達成を目指す。

## 追加テストケース一覧

| ID       | 種別         | テスト内容                                                                                                                  | 引数                                        | 期待結果                                                                                                                               | 結果 |
| -------- | ------------ | --------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- | ---- |
| SH-RM-07 | セキュリティ | `validateIpcSender` が正しいチャンネル・オプション引数で呼ばれる（P41準拠: `getAllowedWindows` コールバック戻り値検証含む） | `"valid-skill"`                             | `validateIpcSender` が `IPC_CHANNELS.SKILL_REMOVE` と `{ getAllowedWindows }` で呼ばれ、`getAllowedWindows()` が `[mainWindow]` を返す | PASS |
| SH-RM-08 | セキュリティ | `validateIpcSender` が invalid を返した時に `toIPCValidationError` の結果がスローされる                                     | `"valid-skill"`（sender検証を FAIL に設定） | `toIPCValidationError` が呼ばれ、その結果がスローされる                                                                                | PASS |
| SH-RM-09 | エッジケース | パストラバーサル文字列がサービス層に委譲される                                                                              | `"../../../etc/passwd"`                     | バリデーション通過し `removeSkill("../../../etc/passwd")` が呼ばれる（パストラバーサル対策はサービス層の責務）                         | PASS |
| SH-RM-10 | エッジケース | タブ・改行のみの文字列がバリデーションエラーになる                                                                          | `"\t\n"`                                    | `{ code: "VALIDATION_ERROR", message: "skillName must be a non-empty string" }` がスローされる                                         | PASS |
| SH-RM-11 | エラー伝播   | `skillService.removeSkill` のエラーが上位に伝播する                                                                         | `"error-skill"`                             | サービスの `Error("File system error")` がそのまま上位にスローされる                                                                   | PASS |

## テスト実行結果

### 実行コマンド

```bash
cd apps/desktop && pnpm vitest run src/main/ipc/__tests__/skillHandlers.test.ts
```

### 結果サマリ

- **Test Files**: 1 passed (1)
- **Tests**: 45 passed (45)
  - 既存テスト: 34 passed
  - Phase 4 追加（SH-RM-01〜SH-RM-06）: 6 passed
  - Phase 6 追加（SH-RM-07〜SH-RM-11）: 5 passed

### skill:remove テスト結果（全11件）

| テストID | テスト名                                                                  | 結果 |
| -------- | ------------------------------------------------------------------------- | ---- |
| SH-RM-01 | should call skillService.removeSkill with skillName                       | PASS |
| SH-RM-02 | should validate skillName is a string                                     | PASS |
| SH-RM-03 | should validate skillName is not empty                                    | PASS |
| SH-RM-04 | should handle non-existent skill gracefully                               | PASS |
| SH-RM-05 | should reject whitespace-only skillName (P42)                             | PASS |
| SH-RM-06 | should reject undefined skillName                                         | PASS |
| SH-RM-07 | should call validateIpcSender with correct channel and options            | PASS |
| SH-RM-08 | should throw when validateIpcSender returns invalid                       | PASS |
| SH-RM-09 | should pass path traversal string to skillService (service-level concern) | PASS |
| SH-RM-10 | should reject tab/newline-only skillName                                  | PASS |
| SH-RM-11 | should propagate skillService.removeSkill error                           | PASS |

## P41 対策確認

SH-RM-07 において、`validateIpcSender` の第3引数に渡された `getAllowedWindows` コールバックの戻り値を明示的に検証している。

```typescript
// P41準拠: getAllowedWindows コールバックの戻り値を明示的に検証
const callArgs = mockValidateIpcSender.mock.calls.find(
  (call) => call[1] === SKILL_CHANNELS.REMOVE,
);
if (callArgs && callArgs[2]?.getAllowedWindows) {
  const windows = callArgs[2].getAllowedWindows();
  expect(windows).toContain(mockMainWindow);
}
```

これにより、v8 カバレッジプロバイダがインラインアロー関数（`getAllowedWindows: () => [mainWindow]`）を独立した関数としてカウントする問題（P41）に対処し、Function Coverage の低下を防止している。

## リグレッション確認

- skill:remove 以外の 34 テスト: 全て PASS（リグレッションなし）

## 完了条件チェックリスト

- [x] SH-RM-07〜SH-RM-11 の5テストケースが追加されている
- [x] SH-RM-07 で `validateIpcSender` の呼び出しと `getAllowedWindows` コールバックを検証している（P41準拠）
- [x] SH-RM-08 で sender 検証失敗時のエラースローを検証している
- [x] SH-RM-09 でパストラバーサル文字列がサービス層に渡ることを検証している
- [x] SH-RM-10 でタブ・改行のみの文字列が拒否されることを検証している
- [x] SH-RM-11 でサービスエラーの伝播を検証している
- [x] SH-RM-01〜SH-RM-11 の全11テストが PASS
- [x] skill:remove 以外のテストにリグレッションがない
