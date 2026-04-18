# 拡張テストケース

## メタ情報

| 項目   | 内容                  |
| ------ | --------------------- |
| Phase  | 6                     |
| タスク | UT-IPC-HANDLER-CI-001 |

## Phase 5 実装済みの拡張テストケース

Phase 5 のテストファイル実装時に REG-EDGE-01〜03 を同梱済み。

### REG-EDGE-01: 重複チャンネル追加時の検出確認

| 項目      | 内容                                                                          |
| --------- | ----------------------------------------------------------------------------- |
| テスト ID | REG-EDGE-01                                                                   |
| 実装場所  | `creatorHandlers.registrationSnapshot.test.ts` (REG-EDGE-01)                  |
| 結果      | ✅ PASS                                                                       |
| 検証内容  | `new Set(duplicateHandles).size !== duplicateHandles.length` で重複検出を証明 |

### REG-EDGE-02: ipcMain.on() 混在時の spy 範囲確認

| 項目      | 内容                                                           |
| --------- | -------------------------------------------------------------- |
| テスト ID | REG-EDGE-02                                                    |
| 実装場所  | `creatorHandlers.registrationSnapshot.test.ts` (REG-EDGE-02)   |
| 結果      | ✅ PASS                                                        |
| 検証内容  | `ipcMain.on` チャンネルが `handles` 配列に含まれないことを確認 |

### REG-EDGE-03: beforeEach リセット処理の正常動作確認

| 項目      | 内容                                                               |
| --------- | ------------------------------------------------------------------ |
| テスト ID | REG-EDGE-03                                                        |
| 実装場所  | `creatorHandlers.registrationSnapshot.test.ts` (REG-EDGE-03)       |
| 結果      | ✅ PASS                                                            |
| 検証内容  | テスト開始時に `handles` が空（`toHaveLength(0)`）であることを確認 |
