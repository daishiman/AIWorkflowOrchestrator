# 受け入れ基準定義書

## メタ情報

| 項目       | 値                    |
| ---------- | --------------------- |
| Phase      | 1                     |
| タスク名   | history-preload-setup |
| 作成日     | 2026-01-13            |
| ステータス | 完了                  |

---

## 受け入れ基準

### 機能要件

| AC-ID  | 受け入れ基準                                 | 検証方法                                                    | 既存実装 |
| ------ | -------------------------------------------- | ----------------------------------------------------------- | -------- |
| AC-001 | window.historyAPIがundefinedでないこと       | DevToolsで`window.historyAPI`を確認                         | ✅       |
| AC-002 | getFileHistoryが関数として存在すること       | `typeof window.historyAPI.getFileHistory === "function"`    | ✅       |
| AC-003 | getVersionDetailが関数として存在すること     | `typeof window.historyAPI.getVersionDetail === "function"`  | ✅       |
| AC-004 | getConversionLogsが関数として存在すること    | `typeof window.historyAPI.getConversionLogs === "function"` | ✅       |
| AC-005 | restoreVersionが関数として存在すること       | `typeof window.historyAPI.restoreVersion === "function"`    | ✅       |
| AC-006 | 各メソッドがipcRenderer.invokeを呼び出すこと | ユニットテストで検証                                        | ✅       |
| AC-007 | contextIsolationが有効な状態で動作すること   | `process.contextIsolated === true`                          | ✅       |
| AC-008 | TypeScript型エラーがないこと                 | `pnpm typecheck`                                            | ✅       |

### 検証スクリプト

```javascript
// DevToolsコンソールで実行
console.log("AC-001:", window.historyAPI !== undefined);
console.log("AC-002:", typeof window.historyAPI?.getFileHistory === "function");
console.log(
  "AC-003:",
  typeof window.historyAPI?.getVersionDetail === "function",
);
console.log(
  "AC-004:",
  typeof window.historyAPI?.getConversionLogs === "function",
);
console.log("AC-005:", typeof window.historyAPI?.restoreVersion === "function");
console.log("Methods:", Object.keys(window.historyAPI || {}));
```

---

## セキュリティ要件

| 要件ID | セキュリティ要件                                     | 検証方法              | 既存実装 |
| ------ | ---------------------------------------------------- | --------------------- | -------- |
| SEC-01 | contextIsolation: true を維持すること                | BrowserWindow設定確認 | ✅       |
| SEC-02 | nodeIntegration: false を維持すること                | BrowserWindow設定確認 | ✅       |
| SEC-03 | contextBridge.exposeInMainWorldのみでAPI公開すること | preload.ts確認        | ✅       |
| SEC-04 | ipcRenderer全体を公開しないこと                      | preload.ts確認        | ✅       |
| SEC-05 | チャンネル名はホワイトリストで管理されていること     | channels.ts確認       | ✅       |

---

## セキュリティ検証スクリプト

```javascript
// DevToolsコンソールで実行
// SEC-04: ipcRenderer全体が公開されていないこと
console.log("ipcRenderer exposed:", typeof window.ipcRenderer); // undefined
console.log("require exposed:", typeof window.require); // undefined
```

---

## 完了確認

- [x] AC-001〜AC-008が定義されている
- [x] SEC-01〜SEC-05が整理されている
- [x] 既存実装の状況が確認されている
- [x] **本Phase内の全タスクを100%実行完了**
