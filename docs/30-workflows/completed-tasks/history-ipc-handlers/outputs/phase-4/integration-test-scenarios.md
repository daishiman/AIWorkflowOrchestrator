# Phase 4 タスク3: 統合テストシナリオ

## 実行日時

2026-01-12

---

## 概要

IPC統合テストのシナリオを定義する。
既存のユニットテストに加え、統合レベルでの検証観点を明確化する。

---

## 1. API接続テストシナリオ

### SC-01: IPCチャンネル疎通確認

| 項目       | 内容                                         |
| ---------- | -------------------------------------------- |
| 目的       | 4つのIPCチャンネルが正しく登録・応答すること |
| 前提条件   | アプリケーション起動済み                     |
| テスト手順 | 各チャンネルにinvokeで呼び出し               |
| 期待結果   | Result型のレスポンスが返却される             |

**対象チャンネル**:

| チャンネル                | 検証内容                |
| ------------------------- | ----------------------- |
| history:getFileHistory    | 応答が { success: ... } |
| history:getVersionDetail  | 応答が { success: ... } |
| history:getConversionLogs | 応答が { success: ... } |
| history:restoreVersion    | 応答が { success: ... } |

### SC-02: レスポンス形式検証

| 項目       | 内容                                   |
| ---------- | -------------------------------------- |
| 目的       | 全レスポンスがResult型パターンに準拠   |
| 前提条件   | 有効なパラメータで呼び出し             |
| テスト手順 | 各チャンネルを正常パラメータで呼び出し |
| 期待結果   | `{ success: true, data: T }` 形式      |

---

## 2. データフローテストシナリオ

### SC-03: Renderer → Main → HistoryService フロー

```
テストフロー:
1. Renderer: ipcRenderer.invoke('history:getFileHistory', fileId, options)
2. Main: ipcMain.handle が受信
3. Main: validateNotEmpty(fileId, 'fileId')
4. Main: historyService.getFileHistory(fileId, options)
5. Main: return success(result)
6. Renderer: Result<PaginatedResult<VersionHistoryItem>> を受信
```

| 項目       | 内容                                     |
| ---------- | ---------------------------------------- |
| 目的       | データが正しく伝播すること               |
| 前提条件   | HistoryServiceがモック設定済み           |
| テスト手順 | fileId='file-123' で getFileHistory 呼出 |
| 期待結果   | サービスに同じfileIdが渡される           |

### SC-04: パラメータ透過性検証

| 検証項目           | テスト内容                        |
| ------------------ | --------------------------------- |
| fileIdの透過       | Renderer→Service で値が変化しない |
| optionsの透過      | limit, offset が正しく伝播        |
| conversionIdの透過 | 詳細・ログ取得で正しく伝播        |

---

## 3. エラーハンドリングテストシナリオ

### SC-05: HistoryService障害時のエラー伝播

| 項目       | 内容                                     |
| ---------- | ---------------------------------------- |
| 目的       | サービス例外がErrorResultに変換される    |
| 前提条件   | サービスがthrowするモック設定            |
| テスト手順 | mockRejectedValue(new Error('DB error')) |
| 期待結果   | `{ success: false, error: Error }` 返却  |

### SC-06: バリデーションエラー検証

| パラメータ異常           | 期待エラーメッセージ                           |
| ------------------------ | ---------------------------------------------- |
| fileId = ''              | 'fileId is required and cannot be empty'       |
| fileId = ' '             | 'fileId is required and cannot be empty'       |
| conversionId = ''        | 'conversionId is required and cannot be empty' |
| conversionId = undefined | 'conversionId is required and cannot be empty' |

### SC-07: 予期せぬ例外の処理

| 例外タイプ  | テスト内容                        |
| ----------- | --------------------------------- |
| TypeError   | 非Errorオブジェクトが正規化される |
| RangeError  | スタックトレース付きでラップ      |
| 文字列throw | Error('文字列')に変換             |

---

## 4. 境界値テストシナリオ

### SC-08: 空・null・undefined処理

| 入力                     | チャンネル        | 期待結果    |
| ------------------------ | ----------------- | ----------- |
| fileId = ''              | getFileHistory    | ErrorResult |
| fileId = undefined       | getFileHistory    | ErrorResult |
| conversionId = ''        | getVersionDetail  | ErrorResult |
| conversionId = null      | getConversionLogs | ErrorResult |
| fileId = '', convId = '' | restoreVersion    | ErrorResult |

### SC-09: オプショナルパラメータ省略

| チャンネル        | 省略パラメータ | 期待結果      |
| ----------------- | -------------- | ------------- |
| getFileHistory    | options        | SuccessResult |
| getConversionLogs | options        | SuccessResult |

### SC-10: 空結果の返却

| シナリオ            | 期待結果                                           |
| ------------------- | -------------------------------------------------- |
| 履歴0件のファイル   | `{ success: true, data: { items: [], total: 0 } }` |
| ログ0件のバージョン | `{ success: true, data: { items: [], total: 0 } }` |

---

## 5. セキュリティテストシナリオ

### SC-11: チャンネルホワイトリスト検証

| 項目       | 内容                                |
| ---------- | ----------------------------------- |
| 目的       | 許可されたチャンネルのみ応答        |
| テスト手順 | ALLOWED_INVOKE_CHANNELSを確認       |
| 期待結果   | 4つのhistory:\*チャンネルが登録済み |

### SC-12: 入力サニタイズ検証

| 項目       | 内容                                 |
| ---------- | ------------------------------------ |
| 目的       | 悪意ある入力がサービスに渡されない   |
| テスト手順 | XSS/インジェクション文字列でテスト   |
| 期待結果   | バリデーションエラーまたは安全な処理 |

---

## テストカバレッジ目標

| カテゴリ | 目標カバレッジ |
| -------- | -------------- |
| Line     | 80%以上        |
| Branch   | 70%以上        |
| Function | 90%以上        |

---

## 既存テストとの対応

| シナリオ     | 既存テストケース                          |
| ------------ | ----------------------------------------- |
| SC-01, SC-02 | registerHistoryHandlers テスト            |
| SC-03, SC-04 | HH-GFH-01, HH-GFH-04                      |
| SC-05        | HH-GFH-02, HH-GVD-02, HH-GCL-02, HH-RV-02 |
| SC-06        | HH-GFH-03, HH-GVD-03, HH-RV-03, HH-RV-04  |
| SC-07        | TS-12                                     |
| SC-08        | TS-11, HH-_-03, HH-_-04                   |
| SC-09        | TS-13                                     |
| SC-10        | TS-14                                     |
| SC-11        | channels.tsの定義確認                     |

---

## 結論

統合テストシナリオが定義された。
既存のユニットテスト（22ケース）が全シナリオをカバーしている。
