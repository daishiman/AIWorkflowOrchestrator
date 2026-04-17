# Phase 4: テストケース設計書

## メタ情報

| 項目       | 内容                                   |
| ---------- | -------------------------------------- |
| Phase      | 4                                      |
| タスクID   | TASK-SW-STREAM-002                     |
| 機能名     | skill-creator-handlers-progress-wiring |
| 作成日     | 2026-04-16                             |
| ステータス | 完了（TDD Red 確認済み）               |

## テストケース一覧

### 正常系テストケース

| TC ID | テスト名                                                     | 検証内容                                                                 | AC         |
| ----- | ------------------------------------------------------------ | ------------------------------------------------------------------------ | ---------- |
| TC-01 | コールバックが呼ばれると sendSkillCreatorProgress が発火する | createSkill の onProgress コールバックが sendSkillCreatorProgress を呼ぶ | AC-1, AC-2 |
| TC-02 | planning フェーズの進捗が正しく送信される                    | `{ phase: "planning", percentage: 10 }` で webContents.send が呼ばれる   | AC-2       |
| TC-03 | done フェーズの進捗が正しく送信される                        | `{ phase: "done", percentage: 100 }` で webContents.send が呼ばれる      | AC-2       |
| TC-04 | createSkill の結果が正しく返される                           | コールバック接続後も `skillDir` が { success: true, data: ... } で返る   | AC-1       |

### 異常系テストケース

| TC ID | テスト名                                             | 検証内容                                                                  | AC   |
| ----- | ---------------------------------------------------- | ------------------------------------------------------------------------- | ---- |
| TC-05 | mainWindow が破壊済みの場合に IPC 送信をスキップする | `mainWindow.isDestroyed()` が true の場合に webContents.send が呼ばれない | AC-3 |
| TC-06 | createSkill がエラーの場合にエラーレスポンスを返す   | createSkill が reject した場合に { success: false, error: ... } が返る    | AC-4 |

## テストファイル

**パス**: `apps/desktop/src/main/ipc/__tests__/skillCreatorHandlers.progress.test.ts`

## TDD Red 確認結果

テスト作成後、実装前に FAIL（Red）であることを確認:

```
実行コマンド:
pnpm --filter @repo/desktop exec vitest run src/main/ipc/__tests__/skillCreatorHandlers.progress.test.ts

結果: FAIL
- TC-01: onProgress コールバックが createSkill に渡されていないため FAIL
- TC-02: webContents.send が呼ばれないため FAIL
- TC-03: webContents.send が呼ばれないため FAIL
- TC-04: PASS（戻り値は変わらないため）
- TC-05: PASS（mainWindow 破棄時のスキップは sendSkillCreatorProgress に実装済み）
- TC-06: PASS（エラーハンドリングは既存実装）
```

## 既存テスト回帰確認

```
実行コマンド:
pnpm --filter @repo/desktop exec vitest run src/main/ipc/__tests__/skillCreatorHandlers.validation.test.ts src/main/ipc/__tests__/skillCreatorIpc.integration.test.ts

結果:
 ✓ skillCreatorIpc.integration.test.ts (71 tests) 241ms
 ✓ skillCreatorHandlers.validation.test.ts (46 tests) 191ms
 Test Files  2 passed (2)
      Tests  117 passed (117)
```

既存テスト 117件は全て PASS（回帰なし）。

## 完了条件確認

- [x] `skillCreatorHandlers.progress.test.ts` 作成済み
- [x] TC-01〜TC-04 正常系テスト実装済み
- [x] TC-05〜TC-06 異常系テスト実装済み
- [x] TDD Red 確認済み（TC-01〜TC-03 が FAIL）
- [x] 既存テスト PASS 確認済み（117件 全 PASS）
