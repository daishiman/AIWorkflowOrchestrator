# トレーサビリティ・カバレッジ対応表

## メタ情報

| 項目   | 内容                  |
| ------ | --------------------- |
| Phase  | 7                     |
| タスク | UT-IPC-HANDLER-CI-001 |

## 要件 → テストケース → カバレッジ対応表

| 要件 ID             | 要件内容                             | テストケース                                                  | カバレッジ状態 |
| ------------------- | ------------------------------------ | ------------------------------------------------------------- | -------------- |
| REG-SNAP-01         | チャンネル一覧のスナップショット固定 | `creatorHandlers.registrationSnapshot.test.ts` > REG-SNAP-01  | ✅ カバー済み  |
| REG-DEDUP-01        | 重複チャンネルの検出                 | `creatorHandlers.registrationSnapshot.test.ts` > REG-DEDUP-01 | ✅ カバー済み  |
| REG-COUNT-01        | チャンネル総数 19 の固定             | `creatorHandlers.registrationSnapshot.test.ts` > REG-COUNT-01 | ✅ カバー済み  |
| REG-SNAP-01 (冗長)  | 同上（vi.mock パターン）             | `ipcHandlerRegistrationSnapshot.test.ts` > TC-01              | ✅ カバー済み  |
| REG-DEDUP-01 (冗長) | 同上（vi.mock パターン）             | `ipcHandlerRegistrationSnapshot.test.ts` > TC-02              | ✅ カバー済み  |

## 異常系トレーサビリティ

| 異常シナリオ            | テストケース | 検証方法                                               |
| ----------------------- | ------------ | ------------------------------------------------------ |
| 重複チャンネル追加      | REG-EDGE-01  | `Set.size !== array.length` で検出証明                 |
| `ipcMain.on()` の誤混入 | REG-EDGE-02  | `handles` 配列に `on` チャンネルが含まれないことを確認 |
| テスト間の副作用        | REG-EDGE-03  | `beforeEach` リセットで独立性を確認                    |

## 網羅率サマリー

| 対象                                      | 網羅率     | 備考                             |
| ----------------------------------------- | ---------- | -------------------------------- |
| 受け入れ基準（REG-SNAP-01, REG-DEDUP-01） | 100%       | 両基準ともカバー済み             |
| 異常系（REG-EDGE-01〜03）                 | 100%       | 全 3 ケースカバー済み            |
| `creatorHandlers.ts` 行カバレッジ         | 意図的低値 | ハンドラ本体は既存テスト群が担当 |
