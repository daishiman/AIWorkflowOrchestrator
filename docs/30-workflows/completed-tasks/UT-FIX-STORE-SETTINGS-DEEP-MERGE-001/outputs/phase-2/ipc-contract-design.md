# IPC 契約設計書: settings:update

## 4層整合性チェック

| 層            | ファイル                                     | チャネル                  | 確認結果                                     |
| ------------- | -------------------------------------------- | ------------------------- | -------------------------------------------- |
| Shared 定数   | `packages/shared/src/ipc/channels.ts`        | `USER_SETTINGS_UPDATE`    | `"settings:update"` 定義済み                 |
| Preload       | `apps/desktop/src/preload/channels.ts`       | `ALLOWED_INVOKE_CHANNELS` | `settings:update` ホワイトリスト済み         |
| Main ハンドラ | `apps/desktop/src/main/ipc/storeHandlers.ts` | `ipcMain.handle`          | `IPC_CHANNELS.USER_SETTINGS_UPDATE` 登録済み |
| Preload API   | `apps/desktop/src/preload/channels.ts`       | `settings:update`         | invoke 定義済み                              |

## ハンドラ入出力型

| 項目         | 型                                             |
| ------------ | ---------------------------------------------- |
| 入力         | `Record<string, unknown>`（plain object のみ） |
| 出力（成功） | `{ success: true }`                            |
| 出力（失敗） | `{ success: false; error: string }`            |

## 変更影響

- IPC 契約（チャネル名・成功/失敗の戻り値）は変更なし
- `settings:update` は runtime で plain object validation を行い、非 plain object は validation error で拒否する
- 内部実装（deepMerge マージ戦略・危険キー除外）のみ変更
