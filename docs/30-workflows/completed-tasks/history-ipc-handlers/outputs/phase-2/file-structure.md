# Phase 2 タスク1: ファイル構成設計

## 実行日時

2026-01-11

---

## 既存ファイル構成の確認

既存のIPC実装構造を確認した結果、以下の構成が確認された。

### 現行ディレクトリ構造

```
apps/desktop/src/
├── main/
│   ├── ipc/
│   │   ├── historyHandlers.ts      # ✅ 実装済み - IPCハンドラー
│   │   ├── index.ts                # ✅ 登録済み
│   │   ├── fileHandlers.ts
│   │   ├── storeHandlers.ts
│   │   ├── dashboardHandlers.ts
│   │   ├── graphHandlers.ts
│   │   ├── aiHandlers.ts
│   │   ├── windowHandlers.ts
│   │   ├── themeHandlers.ts
│   │   ├── authHandlers.ts
│   │   ├── profileHandlers.ts
│   │   ├── avatarHandlers.ts
│   │   ├── apiKeyHandlers.ts
│   │   ├── dialogHandlers.ts
│   │   ├── workspaceHandlers.ts
│   │   ├── searchHandlers.ts
│   │   └── fileSelectionHandlers.ts
│   ├── services/
│   │   └── HistoryService.ts       # ✅ スタブ実装済み
│   └── handlers/
│       └── llm/
│           └── index.ts
├── preload/
│   └── channels.ts                  # ✅ チャンネル定義・ホワイトリスト追加済み
└── renderer/
    └── components/
        └── history/
            └── types.ts             # ✅ 型定義済み
```

---

## 対象ファイル一覧

| ファイル                               | 役割                 | 状態        |
| -------------------------------------- | -------------------- | ----------- |
| `main/ipc/historyHandlers.ts`          | IPCハンドラー実装    | ✅ 実装済み |
| `main/ipc/historyHandlers.test.ts`     | ユニットテスト       | ⏳ 未確認   |
| `main/services/HistoryService.ts`      | サービス層（スタブ） | ✅ 実装済み |
| `main/ipc/index.ts`                    | ハンドラー登録       | ✅ 登録済み |
| `preload/channels.ts`                  | チャンネル定義       | ✅ 定義済み |
| `renderer/components/history/types.ts` | 共有型定義           | ✅ 定義済み |

---

## ファイル配置方針

### 1. IPCハンドラー

- **配置**: `apps/desktop/src/main/ipc/historyHandlers.ts`
- **責務**: IPC通信の受信、バリデーション、サービス呼び出し、Result型変換
- **命名規則**: `{機能名}Handlers.ts`

### 2. サービス層

- **配置**: `apps/desktop/src/main/services/HistoryService.ts`
- **責務**: ビジネスロジック、データベースアクセス
- **依存注入**: ファクトリ関数 `createHistoryService()` を使用

### 3. チャンネル定義

- **配置**: `apps/desktop/src/preload/channels.ts`
- **責務**: IPCチャンネル名の一元管理、ホワイトリスト管理
- **定数**: `IPC_CHANNELS.HISTORY_*`

### 4. 型定義

- **配置**: `apps/desktop/src/renderer/components/history/types.ts`
- **責務**: Main/Renderer間で共有される型の定義
- **共有方法**: 相対パスでインポート

### 5. テストファイル

- **配置**: `apps/desktop/src/main/ipc/__tests__/historyHandlers.test.ts`
- **責務**: ユニットテスト
- **命名規則**: `{対象ファイル名}.test.ts`

---

## 依存関係図

```
┌─────────────────────────────────────────────────────────────────┐
│                         Renderer Process                         │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  renderer/components/history/types.ts (型定義)          │    │
│  └─────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ contextBridge
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                         Preload Script                           │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  preload/channels.ts (チャンネル定義・ホワイトリスト)   │    │
│  └─────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ ipcMain.handle
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                          Main Process                            │
│  ┌────────────────────────────────────────────────────────┐     │
│  │  main/ipc/index.ts                                      │     │
│  │    └── registerAllIpcHandlers()                         │     │
│  │          └── registerHistoryHandlers()                  │     │
│  └────────────────────────────────────────────────────────┘     │
│                              │                                   │
│                              ▼                                   │
│  ┌────────────────────────────────────────────────────────┐     │
│  │  main/ipc/historyHandlers.ts                            │     │
│  │    ├── registerHistoryHandlers()                        │     │
│  │    ├── success<T>()                                     │     │
│  │    ├── error<T>()                                       │     │
│  │    ├── normalizeError()                                 │     │
│  │    └── validateNotEmpty()                               │     │
│  └────────────────────────────────────────────────────────┘     │
│                              │                                   │
│                              │ DI                                │
│                              ▼                                   │
│  ┌────────────────────────────────────────────────────────┐     │
│  │  main/services/HistoryService.ts                        │     │
│  │    ├── HistoryService class                             │     │
│  │    └── createHistoryService()                           │     │
│  └────────────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────────┘
```

---

## 確認結果

| 項目               | 状態 | 備考                                                |
| ------------------ | ---- | --------------------------------------------------- |
| historyHandlers.ts | ✅   | 4つのIPCハンドラーが実装済み                        |
| HistoryService.ts  | ✅   | スタブ実装（CONV-05-02で本実装予定）                |
| index.ts           | ✅   | registerHistoryHandlers が呼び出し済み              |
| channels.ts        | ✅   | HISTORY\_\*チャンネルが定義・ホワイトリスト追加済み |
| types.ts           | ✅   | Result型、PaginatedResult型などが定義済み           |

---

## 結論

ファイル構成は既存のプロジェクト規約に従い、適切に配置されている。
本タスクでは既存実装のテスト追加・改善に焦点を当てる。
