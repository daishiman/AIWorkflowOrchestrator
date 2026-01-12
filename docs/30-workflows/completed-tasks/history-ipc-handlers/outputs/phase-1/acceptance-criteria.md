# Phase 1 タスク3: 受け入れ基準

## 実行日時

2026-01-11

---

## 機能要件

### AC-01: 4つのIPCハンドラーが登録される

**条件**: アプリケーション起動時

**期待結果**:

- `history:getFileHistory` ハンドラーが登録される
- `history:getVersionDetail` ハンドラーが登録される
- `history:getConversionLogs` ハンドラーが登録される
- `history:restoreVersion` ハンドラーが登録される

**検証方法**: ユニットテストで`ipcMain.handle`が4回呼ばれることを確認

---

### AC-02: history:getFileHistory が正常動作する

**条件**: 有効なfileIdを指定して呼び出し

**期待結果**:

- HistoryService.getFileHistoryが呼び出される
- `{ success: true, data: PaginatedResult<VersionHistoryItem> }` が返却される

**異常系**:

- 無効なfileId → `{ success: false, error: { message: "Invalid file ID" } }`
- HistoryServiceエラー → `{ success: false, error: { message: <エラーメッセージ> } }`

---

### AC-03: history:getVersionDetail が正常動作する

**条件**: 有効なconversionIdを指定して呼び出し

**期待結果**:

- HistoryService.getVersionDetailが呼び出される
- `{ success: true, data: VersionDetailData }` が返却される

**異常系**:

- 無効なconversionId → `{ success: false, error: { message: "Invalid conversion ID" } }`
- 存在しないID → `{ success: false, error: { message: "Version not found" } }`

---

### AC-04: history:getConversionLogs が正常動作する

**条件**: 有効なconversionIdを指定して呼び出し

**期待結果**:

- HistoryService.getConversionLogsが呼び出される
- `{ success: true, data: PaginatedResult<ConversionLog> }` が返却される

**異常系**:

- 無効なconversionId → `{ success: false, error: { message: "Invalid conversion ID" } }`

---

### AC-05: history:restoreVersion が正常動作する

**条件**: 有効なfileIdとconversionIdを指定して呼び出し

**期待結果**:

- HistoryService.restoreVersionが呼び出される
- `{ success: true, data: VersionHistoryItem }` が返却される（復元後の新バージョン）

**異常系**:

- 無効なfileId → `{ success: false, error: { message: "Invalid file ID" } }`
- 無効なconversionId → `{ success: false, error: { message: "Invalid conversion ID" } }`
- 復元失敗 → `{ success: false, error: { message: "Restore failed" } }`

---

## 非機能要件

### NF-01: セキュリティ要件

| 項目               | 要件                 | 検証方法                |
| ------------------ | -------------------- | ----------------------- |
| contextIsolation   | true                 | BrowserWindow設定確認   |
| nodeIntegration    | false                | BrowserWindow設定確認   |
| ホワイトリスト     | チャンネル名が限定的 | preload/channels.ts確認 |
| 入力バリデーション | Main側で実施         | テストで検証            |

---

### NF-02: エラーハンドリング要件

| 項目             | 要件                          |
| ---------------- | ----------------------------- |
| 例外捕捉         | try-catchで全例外を捕捉       |
| Result型         | 全ハンドラーでResult型返却    |
| ログ出力         | エラー時はconsole.errorで出力 |
| エラーメッセージ | ユーザーに分かりやすい表現    |

---

### NF-03: パフォーマンス要件

| 項目         | 目標値                           |
| ------------ | -------------------------------- |
| IPC応答時間  | <100ms（HistoryService処理除く） |
| メモリリーク | なし                             |

---

## テスト観点

### ユニットテスト

| テストケース             | 検証内容                    |
| ------------------------ | --------------------------- |
| ハンドラー登録           | 4つのハンドラーが登録される |
| 正常系（各チャンネル）   | 正しいデータが返却される    |
| 異常系（パラメータ不正） | エラーResult型が返却される  |
| 異常系（Service例外）    | 例外がResult型に変換される  |

### 統合テスト

| テストケース | 検証内容                        |
| ------------ | ------------------------------- |
| IPC疎通      | Renderer → Main通信が成功       |
| データフロー | IPC → HistoryService → 結果返却 |
| エラー伝播   | Serviceエラーが適切に伝播       |

---

## 受け入れ基準サマリー

| ID    | 基準                            | 優先度 |
| ----- | ------------------------------- | ------ |
| AC-01 | 4つのIPCハンドラーが登録される  | 必須   |
| AC-02 | getFileHistoryが正常動作する    | 必須   |
| AC-03 | getVersionDetailが正常動作する  | 必須   |
| AC-04 | getConversionLogsが正常動作する | 必須   |
| AC-05 | restoreVersionが正常動作する    | 必須   |
| NF-01 | セキュリティ要件を満たす        | 必須   |
| NF-02 | エラーハンドリング要件を満たす  | 必須   |
| NF-03 | パフォーマンス要件を満たす      | 推奨   |

---

## 完了判定

以下が全て達成された場合、実装完了とする：

- [ ] AC-01〜AC-05の全機能要件を満たす
- [ ] NF-01〜NF-02の非機能要件を満たす
- [ ] ユニットテストが全て成功
- [ ] テストカバレッジがLine 80%以上
