# テストケース一覧

## メタ情報

| 項目       | 値                    |
| ---------- | --------------------- |
| Phase      | 4                     |
| タスク名   | history-preload-setup |
| 作成日     | 2026-01-13            |
| ステータス | 完了                  |

---

## テストケース詳細

### カテゴリ1: API存在確認テスト (5ケース)

#### API-001: window.historyAPIの存在確認

| 項目       | 内容                                      |
| ---------- | ----------------------------------------- |
| 前提条件   | preloadスクリプトが実行済み               |
| 入力       | なし                                      |
| 期待結果   | `window.historyAPI` が `defined` である   |
| 検証コード | `expect(window.historyAPI).toBeDefined()` |

#### API-002: getFileHistoryメソッドの存在確認

| 項目       | 内容                                                                |
| ---------- | ------------------------------------------------------------------- |
| 前提条件   | window.historyAPIが存在する                                         |
| 入力       | なし                                                                |
| 期待結果   | `getFileHistory` が `function` である                               |
| 検証コード | `expect(typeof window.historyAPI?.getFileHistory).toBe("function")` |

#### API-003: getVersionDetailメソッドの存在確認

| 項目       | 内容                                                                  |
| ---------- | --------------------------------------------------------------------- |
| 前提条件   | window.historyAPIが存在する                                           |
| 入力       | なし                                                                  |
| 期待結果   | `getVersionDetail` が `function` である                               |
| 検証コード | `expect(typeof window.historyAPI?.getVersionDetail).toBe("function")` |

#### API-004: getConversionLogsメソッドの存在確認

| 項目       | 内容                                                                   |
| ---------- | ---------------------------------------------------------------------- |
| 前提条件   | window.historyAPIが存在する                                            |
| 入力       | なし                                                                   |
| 期待結果   | `getConversionLogs` が `function` である                               |
| 検証コード | `expect(typeof window.historyAPI?.getConversionLogs).toBe("function")` |

#### API-005: restoreVersionメソッドの存在確認

| 項目       | 内容                                                                |
| ---------- | ------------------------------------------------------------------- |
| 前提条件   | window.historyAPIが存在する                                         |
| 入力       | なし                                                                |
| 期待結果   | `restoreVersion` が `function` である                               |
| 検証コード | `expect(typeof window.historyAPI?.restoreVersion).toBe("function")` |

---

### カテゴリ2: IPC呼び出しテスト (4ケース)

#### IPC-001: getFileHistory IPCチャンネル確認

| 項目       | 内容                                                                                 |
| ---------- | ------------------------------------------------------------------------------------ |
| 前提条件   | ipcRenderer.invokeがモック化されている                                               |
| 入力       | `fileId: "test-file-id"`, `options: { limit: 10, offset: 0 }`                        |
| 期待結果   | `history:getFileHistory` チャンネルが呼ばれる                                        |
| 検証コード | `expect(mockInvoke).toHaveBeenCalledWith("history:getFileHistory", fileId, options)` |

#### IPC-002: getVersionDetail IPCチャンネル確認

| 項目       | 内容                                                                                |
| ---------- | ----------------------------------------------------------------------------------- |
| 前提条件   | ipcRenderer.invokeがモック化されている                                              |
| 入力       | `conversionId: "test-conversion-id"`                                                |
| 期待結果   | `history:getVersionDetail` チャンネルが呼ばれる                                     |
| 検証コード | `expect(mockInvoke).toHaveBeenCalledWith("history:getVersionDetail", conversionId)` |

#### IPC-003: getConversionLogs IPCチャンネル確認

| 項目       | 内容                                                                                          |
| ---------- | --------------------------------------------------------------------------------------------- |
| 前提条件   | ipcRenderer.invokeがモック化されている                                                        |
| 入力       | `conversionId: "test-conversion-id"`, `options: { level: "error" }`                           |
| 期待結果   | `history:getConversionLogs` チャンネルが呼ばれる                                              |
| 検証コード | `expect(mockInvoke).toHaveBeenCalledWith("history:getConversionLogs", conversionId, options)` |

#### IPC-004: restoreVersion IPCチャンネル確認

| 項目       | 内容                                                                                      |
| ---------- | ----------------------------------------------------------------------------------------- |
| 前提条件   | ipcRenderer.invokeがモック化されている                                                    |
| 入力       | `fileId: "test-file-id"`, `conversionId: "test-conversion-id"`                            |
| 期待結果   | `history:restoreVersion` チャンネルが呼ばれる                                             |
| 検証コード | `expect(mockInvoke).toHaveBeenCalledWith("history:restoreVersion", fileId, conversionId)` |

---

### カテゴリ3: 型チェックテスト (2ケース)

#### TYPE-001: 戻り値がPromiseであること

| 項目       | 内容                                     |
| ---------- | ---------------------------------------- |
| 前提条件   | window.historyAPIが存在する              |
| 入力       | `fileId: "file-id"`                      |
| 期待結果   | 戻り値が `Promise` インスタンスである    |
| 検証コード | `expect(result).toBeInstanceOf(Promise)` |

#### TYPE-002: オプションパラメータの受け入れ

| 項目       | 内容                                    |
| ---------- | --------------------------------------- |
| 前提条件   | window.historyAPIが存在する             |
| 入力       | オプションなし / オプションあり         |
| 期待結果   | 両方のパターンでエラーなく呼び出せる    |
| 検証コード | オプションなし/ありで呼び出しが成功する |

---

### カテゴリ4: エラーハンドリングテスト (2ケース)

#### ERR-001: 未許可チャンネルでのエラー

| 項目       | 内容                                             |
| ---------- | ------------------------------------------------ |
| 前提条件   | ホワイトリストに含まれないチャンネルを使用       |
| 入力       | `channel: "invalid:channel"`                     |
| 期待結果   | `Channel invalid:channel is not allowed` エラー  |
| 検証コード | `expect(promise).rejects.toThrow("not allowed")` |

#### ERR-002: IPC呼び出し失敗時のエラー伝搬

| 項目       | 内容                                |
| ---------- | ----------------------------------- |
| 前提条件   | ipcRenderer.invokeがエラーを返す    |
| 入力       | 任意のメソッド呼び出し              |
| 期待結果   | Promiseがrejectされる               |
| 検証コード | `expect(promise).rejects.toThrow()` |

---

### カテゴリ5: セキュリティテスト (2ケース)

#### SEC-001: ホワイトリスト外チャンネル拒否

| 項目       | 内容                                 |
| ---------- | ------------------------------------ |
| 前提条件   | safeInvoke関数が使用されている       |
| 入力       | ホワイトリストに含まれないチャンネル |
| 期待結果   | エラーが返される                     |
| 検証コード | ホワイトリストチェックの動作確認     |

#### SEC-002: safeInvokeラッパーの動作

| 項目       | 内容                                         |
| ---------- | -------------------------------------------- |
| 前提条件   | preload/index.tsが読み込まれている           |
| 入力       | 各historyAPIメソッド呼び出し                 |
| 期待結果   | safeInvoke経由でipcRenderer.invokeが呼ばれる |
| 検証コード | ホワイトリストチェック実行確認               |

---

## テストケースサマリー

| カテゴリ           | ケース数 | 状態       |
| ------------------ | -------- | ---------- |
| API存在確認        | 5        | 作成済     |
| IPC呼び出し        | 4        | 作成済     |
| 型チェック         | 2        | 作成済     |
| エラーハンドリング | 2        | 作成済     |
| セキュリティ       | 2        | 作成済     |
| **合計**           | **15**   | **作成済** |

---

## 完了確認

- [x] API存在確認テスト（5ケース）が定義されている
- [x] IPC呼び出しテスト（4ケース）が定義されている
- [x] 型チェックテスト（2ケース）が定義されている
- [x] エラーハンドリングテスト（2ケース）が定義されている
- [x] セキュリティテスト（2ケース）が定義されている
- [x] **本Phase内の全タスクを100%実行完了**
