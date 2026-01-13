# Phase 1: 要件定義

## メタ情報

| 項目   | 値                    |
| ------ | --------------------- |
| Phase  | 1                     |
| 機能名 | history-preload-setup |
| 作成日 | 2026-01-12            |

---

## 目的

preloadスクリプトでhistoryAPIを公開するための要件を明確化し、APIメソッド・IPCチャンネル名・型定義を抽出する。

---

## 実行タスク

| タスク           | 責務                                               |
| ---------------- | -------------------------------------------------- |
| 要件抽出         | HistoryAPI仕様からAPIメソッド・IPCチャンネルを抽出 |
| 受け入れ基準作成 | 各APIメソッドに対して検証可能な基準を定義          |
| セキュリティ要件 | contextIsolation・contextBridge関連の要件整理      |

---

## 参照資料

| 資料名                    | パス                                                                         | 説明                               |
| ------------------------- | ---------------------------------------------------------------------------- | ---------------------------------- |
| 履歴/ログ表示UI仕様       | `.claude/skills/aiworkflow-requirements/references/ui-ux-history-panel.md`   | HistoryAPI仕様・IPCチャンネル名    |
| APIセキュリティ・Electron | `.claude/skills/aiworkflow-requirements/references/security-api-electron.md` | preload・contextBridgeセキュリティ |

---

## 実行手順

### 1. 要件抽出

ui-ux-history-panel.mdから以下を抽出:

#### HistoryAPI メソッド

| メソッド          | IPCチャンネル               | 引数                                   | 戻り値                                      |
| ----------------- | --------------------------- | -------------------------------------- | ------------------------------------------- |
| getFileHistory    | `history:getFileHistory`    | fileId: string, options?: Pagination   | Result<PaginatedResult<VersionHistoryItem>> |
| getVersionDetail  | `history:getVersionDetail`  | conversionId: string                   | Result<VersionDetailData>                   |
| getConversionLogs | `history:getConversionLogs` | conversionId: string, options?: Filter | Result<PaginatedResult<ConversionLog>>      |
| restoreVersion    | `history:restoreVersion`    | fileId: string, conversionId: string   | Result<VersionHistoryItem>                  |

### 2. 受け入れ基準作成

| AC-ID  | 受け入れ基準                                 |
| ------ | -------------------------------------------- |
| AC-001 | window.historyAPIがundefinedでないこと       |
| AC-002 | getFileHistoryが関数として存在すること       |
| AC-003 | getVersionDetailが関数として存在すること     |
| AC-004 | getConversionLogsが関数として存在すること    |
| AC-005 | restoreVersionが関数として存在すること       |
| AC-006 | 各メソッドがipcRenderer.invokeを呼び出すこと |
| AC-007 | contextIsolationが有効な状態で動作すること   |
| AC-008 | TypeScript型エラーがないこと                 |

### 3. セキュリティ要件

| 要件ID | セキュリティ要件                                     |
| ------ | ---------------------------------------------------- |
| SEC-01 | contextIsolation: true を維持すること                |
| SEC-02 | nodeIntegration: false を維持すること                |
| SEC-03 | contextBridge.exposeInMainWorldのみでAPI公開すること |
| SEC-04 | ipcRenderer全体を公開しないこと                      |
| SEC-05 | チャンネル名はホワイトリストで管理されていること     |

---

## 統合テスト連携【必須】

IPC接続要件（チャンネル名・型定義）を要件に明記:

| 接続要件カテゴリ | 記載内容                                                                                            |
| ---------------- | --------------------------------------------------------------------------------------------------- |
| IPCチャンネル    | history:getFileHistory, history:getVersionDetail, history:getConversionLogs, history:restoreVersion |
| 型定義           | HistoryAPI interface, Result<T>, PaginatedResult<T>                                                 |
| 認証フロー       | N/A（履歴APIは認証不要）                                                                            |

---

## 成果物

| 成果物       | パス                                         | 説明            |
| ------------ | -------------------------------------------- | --------------- |
| 要件定義書   | `outputs/phase-1/requirements-definition.md` | APIメソッド要件 |
| 受け入れ基準 | `outputs/phase-1/acceptance-criteria.md`     | AC定義          |
| スコープ定義 | `outputs/phase-1/scope-definition.md`        | 実装範囲        |

---

## 完了条件

- [ ] HistoryAPIの4メソッドが抽出されている
- [ ] 各メソッドのIPCチャンネル名が特定されている
- [ ] 受け入れ基準（AC-001〜AC-008）が定義されている
- [ ] セキュリティ要件（SEC-01〜SEC-05）が整理されている
- [ ] IPC接続要件が明記されている
- [ ] **本Phase内の全タスクを100%実行完了**

---

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. ui-ux-history-panel.mdの確認
2. APIメソッド・IPCチャンネル抽出
3. 受け入れ基準作成
4. セキュリティ要件整理
5. 成果物の作成・配置
6. 完了条件の検証

---

## 次のPhase

Phase 2: 設計
