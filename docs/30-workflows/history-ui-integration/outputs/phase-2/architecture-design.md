# アーキテクチャ設計書 - 履歴UIコンポーネント統合

## メタ情報

| 項目       | 内容       |
| ---------- | ---------- |
| 作成日     | 2026-01-11 |
| Phase      | 2          |
| ステータス | 完了       |

---

## 1. システムアーキテクチャ概要

### 1.1 統合アーキテクチャ図

```
┌─────────────────────────────────────────────────────────────────┐
│                       Renderer Process                          │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                    HistoryPage.tsx                        │  │
│  │  ┌─────────────────┐  ┌────────────────────────────────┐ │  │
│  │  │ VersionHistory  │  │         VersionDetail          │ │  │
│  │  │  - 履歴一覧      │  │  - バージョン詳細              │ │  │
│  │  │  - ページネーション │  │  - ConversionLogs              │ │  │
│  │  └─────────────────┘  └────────────────────────────────┘ │  │
│  │              │                       │                    │  │
│  │              └───────┬───────────────┘                    │  │
│  │                      ▼                                    │  │
│  │              RestoreDialog                                │  │
│  └──────────────────────────────────────────────────────────┘  │
│                          │                                      │
│                          ▼ window.historyAPI                    │
├─────────────────────────────────────────────────────────────────┤
│                    preload/index.ts                             │
│    contextBridge.exposeInMainWorld("historyAPI", {...})         │
│                          │                                      │
│                          ▼ ipcRenderer.invoke()                 │
├─────────────────────────────────────────────────────────────────┤
│                       Main Process                              │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              ipc/historyHandlers.ts                       │  │
│  │  - history:getFileHistory                                 │  │
│  │  - history:getVersionDetail                               │  │
│  │  - history:getConversionLogs                              │  │
│  │  - history:restoreVersion                                 │  │
│  └──────────────────────────────────────────────────────────┘  │
│                          │                                      │
│                          ▼                                      │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                  HistoryService                           │  │
│  │  (CONV-05-02で実装済み - 参照のみ)                        │  │
│  └──────────────────────────────────────────────────────────┘  │
│                          │                                      │
│                          ▼                                      │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │               Database (SQLite)                           │  │
│  │  (CONV-05-01で実装済み - 参照のみ)                        │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

### 1.2 データフロー

```
[User Action]
     │
     ▼
[HistoryPage] ─→ [Custom Hook] ─→ [window.historyAPI]
                                          │
                                          ▼
                              [preload/index.ts]
                              contextBridge.exposeInMainWorld
                                          │
                                          ▼ ipcRenderer.invoke()
                              [IPC Channel: history:*]
                                          │
                                          ▼
                              [historyHandlers.ts]
                              ipcMain.handle()
                                          │
                                          ▼
                              [HistoryService]
                                          │
                                          ▼
                              [SQLite Database]
                                          │
                                          ▼ Result<T>
                              [Response Chain (逆順)]
                                          │
                                          ▼
                              [UI Update]
```

---

## 2. 既存構造との整合性

### 2.1 既存パターンの踏襲

| 既存パターン     | 適用箇所                      | 理由                         |
| ---------------- | ----------------------------- | ---------------------------- |
| electronAPI構造  | historyAPIは別途公開          | 既存electronAPIとの責務分離  |
| IPC_CHANNELS定数 | channels.tsに追加             | 型安全性とホワイトリスト管理 |
| withValidation   | historyHandlersで使用         | セキュリティパターンの統一   |
| Result<T>型      | 既存types.tsの型を再利用      | エラーハンドリングの統一     |
| カスタムフック   | 既存useVersionHistory等を使用 | 状態管理パターンの統一       |

### 2.2 ファイル配置

```
apps/desktop/src/
├── preload/
│   ├── index.ts          ← historyAPI公開を追加
│   ├── channels.ts       ← HISTORY_*チャンネル追加
│   └── types.ts          ← HistoryAPI型をインポート
├── main/
│   └── ipc/
│       ├── index.ts      ← registerHistoryHandlers呼び出し追加
│       └── historyHandlers.ts ← 新規作成
└── renderer/
    ├── pages/
    │   └── HistoryPage.tsx    ← 新規作成
    ├── components/
    │   └── history/           ← 既存（CONV-05-03）
    │       ├── VersionHistory.tsx
    │       ├── VersionDetail.tsx
    │       ├── ConversionLogs.tsx
    │       ├── RestoreDialog.tsx
    │       └── types.ts       ← HistoryAPI型を含む
    ├── hooks/                 ← 既存（CONV-05-03）
    │   ├── useVersionHistory.ts
    │   ├── useVersionDetail.ts
    │   ├── useConversionLogs.ts
    │   └── useRestore.ts
    └── App.tsx               ← ルーティング追加
```

---

## 3. セキュリティアーキテクチャ

### 3.1 Electronセキュリティ要件

| 要件             | 設定値 | 実装方針                        |
| ---------------- | ------ | ------------------------------- |
| contextIsolation | true   | contextBridge経由でAPI公開      |
| nodeIntegration  | false  | Node.js APIへの直接アクセス禁止 |
| sandbox          | true   | サンドボックス化されたRenderer  |

### 3.2 IPC通信セキュリティ

```typescript
// 1. チャンネルホワイトリスト (channels.ts)
export const ALLOWED_INVOKE_CHANNELS = [
  // ...existing channels
  IPC_CHANNELS.HISTORY_GET_FILE_HISTORY,
  IPC_CHANNELS.HISTORY_GET_VERSION_DETAIL,
  IPC_CHANNELS.HISTORY_GET_CONVERSION_LOGS,
  IPC_CHANNELS.HISTORY_RESTORE_VERSION,
];

// 2. ハンドラーバリデーション (historyHandlers.ts)
ipcMain.handle(
  IPC_CHANNELS.HISTORY_GET_FILE_HISTORY,
  withValidation(
    IPC_CHANNELS.HISTORY_GET_FILE_HISTORY,
    async (_, fileId, options) => { ... },
    { getAllowedWindows: () => [mainWindow] }
  )
);
```

### 3.3 入力検証

| パラメータ   | 検証内容                     |
| ------------ | ---------------------------- |
| fileId       | string型, 空文字チェック     |
| conversionId | string型, 空文字チェック     |
| options      | オブジェクト型, 範囲チェック |

---

## 4. 統合ポイント

### 4.1 契約定義

| 統合ポイント          | 契約                                            |
| --------------------- | ----------------------------------------------- |
| Renderer → preload    | window.historyAPI（4メソッド）                  |
| preload → Main        | IPC*CHANNELS.HISTORY*\*（4チャンネル）          |
| Main → HistoryService | getFileHistory, getVersionDetail等（4メソッド） |

### 4.2 エラー伝播

```
HistoryService Error
    ↓ throw Error
historyHandlers.ts
    ↓ catch → { success: false, error: { message, code? } }
preload/index.ts
    ↓ Promise<Result<T>>
Custom Hook (useVersionHistory)
    ↓ setError(result.error)
UI Component
    ↓ ErrorDisplay表示
```

---

## 5. 変更影響範囲

### 5.1 変更対象

| ファイル            | 変更内容                    | 影響範囲      |
| ------------------- | --------------------------- | ------------- |
| preload/index.ts    | historyAPI公開追加          | Rendererのみ  |
| preload/channels.ts | HISTORY\_\*チャンネル追加   | preload, Main |
| ipc/index.ts        | registerHistoryHandlers追加 | Main          |
| App.tsx             | /history ルート追加         | Renderer      |

### 5.2 変更しない対象

| 項目                 | 理由                 |
| -------------------- | -------------------- |
| 既存コンポーネント   | CONV-05-03で完了済み |
| 既存フック           | CONV-05-03で完了済み |
| HistoryService       | CONV-05-02で完了済み |
| データベーススキーマ | CONV-05-01で完了済み |

---

## 確認結果

- [x] システムアーキテクチャが定義されている
- [x] データフローが明確化されている
- [x] 既存パターンとの整合性が確認されている
- [x] セキュリティ要件が満たされている
- [x] 統合ポイントが定義されている
- [x] 変更影響範囲が特定されている

---

## 変更履歴

| Version | Date       | Changes       |
| ------- | ---------- | ------------- |
| 1.0.0   | 2026-01-11 | Phase 2で作成 |
