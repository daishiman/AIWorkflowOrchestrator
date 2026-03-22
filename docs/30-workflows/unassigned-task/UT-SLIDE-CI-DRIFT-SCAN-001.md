# UT-SLIDE-CI-DRIFT-SCAN-001: canonical チャネルリストと registerAllIpcHandlers の自動突合 CI スクリプト

## メタ情報

| 項目       | 値                                            |
| ---------- | --------------------------------------------- |
| タスク ID  | UT-SLIDE-CI-DRIFT-SCAN-001                    |
| 優先度     | medium                                        |
| 検出元     | TASK-IMP-SLIDE-RUNTIME-ALIGNMENT-001 Phase 12 |
| 関連 Issue | #1363                                         |

## 背景

slide-runtime-alignment-impl で D1（IPC handler 未接続）と D2（チャネル名 legacy）の drift が発見された。これらは `api-ipc-system-core.md` の canonical チャネルリストと `registerAllIpcHandlers()` の実際の登録リストの乖離に起因する。現在 `check-ipc-contracts.ts` が存在するが、slide チャネル固有の突合ルール（12チャネル全数確認）はカバーしていない。

## 要件

1. `api-ipc-system-core.md` から slide セクションの canonical チャネルリスト（invoke 6 + push 6）を抽出する
2. `apps/desktop/src/main/slide/ipc-handlers.ts` の実際の `ipcMain.handle()` / `mainWindow.webContents.send()` 呼び出しと突合する
3. 差分がある場合は CI で失敗させる
4. 既存の `check-ipc-contracts.ts` に統合する形で実装する

## 受入基準

- [ ] canonical 12チャネルと実装の突合が CI で自動実行される
- [ ] 差分がある場合は具体的なチャネル名を表示して失敗する
- [ ] `pnpm --filter @repo/desktop run check-ipc-contracts` で実行可能

## 参照

- `apps/desktop/scripts/check-ipc-contracts.ts`
- `.claude/skills/aiworkflow-requirements/references/api-ipc-system-core.md`
