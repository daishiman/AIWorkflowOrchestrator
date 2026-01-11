# 要件定義書 - 履歴UIコンポーネント統合

## メタ情報

| 項目       | 内容                             |
| ---------- | -------------------------------- |
| タスクID   | task-req-history-integration-001 |
| 作成日     | 2026-01-11                       |
| Phase      | 1                                |
| ステータス | 完了                             |

---

## 1. システム仕様確認結果

### 1.1 参照仕様

| 仕様書              | パス                                                                       | 確認結果  |
| ------------------- | -------------------------------------------------------------------------- | --------- |
| 履歴/ログ表示UI仕様 | `.claude/skills/aiworkflow-requirements/references/ui-ux-history-panel.md` | ✅ 確認済 |

### 1.2 IPC通信チャンネル（仕様との整合性確認）

| チャンネル名                | 仕様定義 | 整合性 |
| --------------------------- | -------- | ------ |
| `history:getFileHistory`    | ✅       | ✅     |
| `history:getVersionDetail`  | ✅       | ✅     |
| `history:getConversionLogs` | ✅       | ✅     |
| `history:restoreVersion`    | ✅       | ✅     |

### 1.3 型定義（仕様との整合性確認）

| 型名               | 仕様定義 | 整合性 |
| ------------------ | -------- | ------ |
| HistoryAPI         | ✅       | ✅     |
| VersionHistoryItem | ✅       | ✅     |
| ConversionLog      | ✅       | ✅     |
| LogLevel           | ✅       | ✅     |
| PaginationOptions  | ✅       | ✅     |
| PaginatedResult<T> | ✅       | ✅     |
| Result<T>          | ✅       | ✅     |

---

## 2. 機能要件（FR）

### FR-1: 履歴一覧表示

| 項目     | 内容                                                   |
| -------- | ------------------------------------------------------ |
| 概要     | ファイルIDを指定して履歴一覧を取得・表示できる         |
| 優先度   | 必須                                                   |
| 実現方法 | VersionHistoryコンポーネント + useVersionHistoryフック |

**詳細要件**:

- ファイルIDを指定して履歴一覧を取得
- バージョン番号、作成日時、ファイルサイズを表示
- 最新バージョンは「現在」バッジで識別
- ページネーション（20件ずつ追加読み込み）

### FR-2: バージョン詳細表示

| 項目     | 内容                                                 |
| -------- | ---------------------------------------------------- |
| 概要     | 選択したバージョンの詳細情報を表示できる             |
| 優先度   | 必須                                                 |
| 実現方法 | VersionDetailコンポーネント + useVersionDetailフック |

**詳細要件**:

- 変換ID、バージョン番号、作成日時、サイズ、MIMEタイプ、ハッシュ値を表示
- 関連する変換ログを表示

### FR-3: ログフィルタリング

| 項目     | 内容                                                   |
| -------- | ------------------------------------------------------ |
| 概要     | ログレベル（info/warn/error/debug）でフィルタできる    |
| 優先度   | 必須                                                   |
| 実現方法 | ConversionLogsコンポーネント + useConversionLogsフック |

**詳細要件**:

- 全レベル、info、warn、error、debugで絞り込み
- ログエントリにはタイムスタンプ、レベルバッジ、メッセージを表示

### FR-4: バージョン復元

| 項目     | 内容                                           |
| -------- | ---------------------------------------------- |
| 概要     | 過去のバージョンに復元できる                   |
| 優先度   | 必須                                           |
| 実現方法 | RestoreDialogコンポーネント + useRestoreフック |

**詳細要件**:

- 復元前に確認ダイアログを表示
- 復元処理中はローディング表示
- 復元成功後は履歴一覧を更新
- エラー発生時はエラーメッセージを表示

---

## 3. 非機能要件（NFR）

### NFR-1: パフォーマンス

| 指標             | 目標値 |
| ---------------- | ------ |
| 初期レンダリング | <100ms |
| リスト表示       | <200ms |
| 追加読み込み     | <100ms |
| フィルタ変更     | <150ms |

### NFR-2: アクセシビリティ

| 要件                     | 実装方針                              |
| ------------------------ | ------------------------------------- |
| キーボードナビゲーション | Tab, Enter, Space, Escapeで全操作可能 |
| スクリーンリーダー       | 適切なrole/aria属性を設定             |
| フォーカス管理           | ダイアログ表示時はフォーカストラップ  |

### NFR-3: セキュリティ

| 要件             | 実装方針                            |
| ---------------- | ----------------------------------- |
| contextIsolation | contextBridge経由でAPIを公開        |
| nodeIntegration  | 無効（false）                       |
| 入力検証         | IPCハンドラーで入力パラメータを検証 |

---

## 4. 接続要件

### 4.1 IPC接続

| チャンネル                  | 方向            | 用途               |
| --------------------------- | --------------- | ------------------ |
| `history:getFileHistory`    | Renderer → Main | 履歴一覧取得       |
| `history:getVersionDetail`  | Renderer → Main | バージョン詳細取得 |
| `history:getConversionLogs` | Renderer → Main | 変換ログ取得       |
| `history:restoreVersion`    | Renderer → Main | バージョン復元     |

### 4.2 データフロー

```
Renderer (HistoryPage)
    ↓ window.historyAPI.getFileHistory()
preload (contextBridge)
    ↓ ipcRenderer.invoke('history:getFileHistory')
Main Process (historyHandlers)
    ↓ historyService.getFileHistory()
HistoryService
    ↓ SQLite Query
Database (SQLite)
    ↑ Result
HistoryService
    ↑ { success: true, data: {...} }
Main Process
    ↑ IPC Response
preload
    ↑ Promise<Result<T>>
Renderer
```

### 4.3 認証フロー

N/A（本タスクでは認証不要）

---

## 5. 依存関係

### 5.1 前提タスク

| タスク     | 説明                 | ステータス |
| ---------- | -------------------- | ---------- |
| CONV-05-01 | 履歴データ永続化     | ✅ 完了    |
| CONV-05-02 | 履歴取得サービス     | ✅ 完了    |
| CONV-05-03 | 履歴UIコンポーネント | ✅ 完了    |

### 5.2 利用コンポーネント

| コンポーネント | パス                                          |
| -------------- | --------------------------------------------- |
| VersionHistory | apps/desktop/src/renderer/components/history/ |
| VersionDetail  | apps/desktop/src/renderer/components/history/ |
| ConversionLogs | apps/desktop/src/renderer/components/history/ |
| RestoreDialog  | apps/desktop/src/renderer/components/history/ |

### 5.3 利用フック

| フック            | パス                             |
| ----------------- | -------------------------------- |
| useVersionHistory | apps/desktop/src/renderer/hooks/ |
| useVersionDetail  | apps/desktop/src/renderer/hooks/ |
| useConversionLogs | apps/desktop/src/renderer/hooks/ |
| useRestore        | apps/desktop/src/renderer/hooks/ |

---

## 6. 確認結果

- [x] システム仕様（ui-ux-history-panel.md）を確認済み
- [x] IPC通信チャンネル名が仕様と一致することを確認
- [x] 型定義（HistoryAPI）が仕様と一致することを確認
- [x] 機能要件が抽出されている（FR-1〜FR-4）
- [x] 非機能要件が抽出されている（NFR-1〜NFR-3）
- [x] 接続要件が明記されている

---

## 変更履歴

| Version | Date       | Changes       |
| ------- | ---------- | ------------- |
| 1.0.0   | 2026-01-11 | Phase 1で作成 |
