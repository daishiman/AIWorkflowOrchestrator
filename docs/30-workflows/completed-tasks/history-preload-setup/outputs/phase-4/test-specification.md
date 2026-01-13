# テスト仕様書

## メタ情報

| 項目       | 値                    |
| ---------- | --------------------- |
| Phase      | 4                     |
| タスク名   | history-preload-setup |
| 作成日     | 2026-01-13            |
| ステータス | 完了                  |

---

## 概要

本ドキュメントはhistoryAPI preloadスクリプトのテスト仕様を定義する。

---

## テスト対象

| 対象             | ファイル                               | 説明              |
| ---------------- | -------------------------------------- | ----------------- |
| historyAPI       | `apps/desktop/src/preload/index.ts`    | preload API       |
| HistoryAPI型定義 | `renderer/components/history/types.ts` | 型定義            |
| HISTORY_CHANNELS | `apps/desktop/src/preload/channels.ts` | IPCチャンネル定義 |

---

## テストファイル構成

| テストファイル                                          | 説明              |
| ------------------------------------------------------- | ----------------- |
| `apps/desktop/src/preload/__tests__/historyAPI.test.ts` | preload APIテスト |

---

## テスト戦略

### 1. ユニットテスト

preload APIの各メソッドを単体でテストする。ipcRendererとcontextBridgeをモック化してテストを実行。

### 2. 統合テスト

preload → Main Process → HistoryService のデータフローを検証する。既存の`historyHandlers.test.ts`でIPCハンドラー側のテストは実施済み。

---

## テストカテゴリ

### カテゴリ1: API存在確認テスト

| テストケースID | テスト内容                          | 期待結果           |
| -------------- | ----------------------------------- | ------------------ |
| API-001        | window.historyAPIの存在確認         | definedであること  |
| API-002        | getFileHistoryメソッドの存在確認    | functionであること |
| API-003        | getVersionDetailメソッドの存在確認  | functionであること |
| API-004        | getConversionLogsメソッドの存在確認 | functionであること |
| API-005        | restoreVersionメソッドの存在確認    | functionであること |

### カテゴリ2: IPC呼び出しテスト

| テストケースID | テスト内容                          | 期待結果                                |
| -------------- | ----------------------------------- | --------------------------------------- |
| IPC-001        | getFileHistory IPCチャンネル確認    | history:getFileHistoryが呼ばれること    |
| IPC-002        | getVersionDetail IPCチャンネル確認  | history:getVersionDetailが呼ばれること  |
| IPC-003        | getConversionLogs IPCチャンネル確認 | history:getConversionLogsが呼ばれること |
| IPC-004        | restoreVersion IPCチャンネル確認    | history:restoreVersionが呼ばれること    |

### カテゴリ3: 型チェックテスト

| テストケースID | テスト内容                     | 期待結果              |
| -------------- | ------------------------------ | --------------------- |
| TYPE-001       | 戻り値がPromiseであること      | Promise型を返す       |
| TYPE-002       | オプションパラメータの受け入れ | オプションなし/あり可 |

### カテゴリ4: エラーハンドリングテスト

| テストケースID | テスト内容                    | 期待結果                  |
| -------------- | ----------------------------- | ------------------------- |
| ERR-001        | 未許可チャンネルでのエラー    | Channel not allowedエラー |
| ERR-002        | IPC呼び出し失敗時のエラー伝搬 | rejectされること          |

### カテゴリ5: セキュリティテスト

| テストケースID | テスト内容                     | 期待結果                   |
| -------------- | ------------------------------ | -------------------------- |
| SEC-001        | ホワイトリスト外チャンネル拒否 | エラーが返されること       |
| SEC-002        | safeInvokeラッパーの動作       | ホワイトリストチェック実行 |

---

## カバレッジ目標

| メトリクス    | 目標値 |
| ------------- | ------ |
| Line Coverage | 80%+   |
| Branch        | 80%+   |
| Function      | 100%   |

---

## テスト実行コマンド

```bash
# preloadテスト実行
pnpm --filter @repo/desktop test src/preload/__tests__/historyAPI.test.ts

# カバレッジ付き実行
pnpm --filter @repo/desktop test --coverage src/preload/__tests__/historyAPI.test.ts
```

---

## 完了確認

- [x] テスト対象が明確に定義されている
- [x] テストカテゴリが5つ設計されている
- [x] テストケースIDが付与されている
- [x] カバレッジ目標が設定されている
- [x] テスト実行コマンドが記載されている
- [x] **本Phase内の全タスクを100%実行完了**
