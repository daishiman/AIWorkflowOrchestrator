# 履歴UIコンポーネント統合 - 実装ガイド

## メタ情報

| 項目       | 内容                   |
| ---------- | ---------------------- |
| タスクID   | history-ui-integration |
| 作成日     | 2026-01-11             |
| Phase      | 12                     |
| バージョン | 1.0.0                  |

---

# Part 1: 概念的な説明

> この部分は初学者・非技術者向けに書かれています。専門用語は最小限にして、「中学生でもわかる」レベルで説明します。

## これは何？

履歴UIコンポーネント統合とは、**すでに作成済みの「履歴表示画面」を、実際のアプリで使えるようにする作業**です。

例えるなら：

- パーツ（履歴表示コンポーネント）は完成していた
- でも配線（データを取得する仕組み）がなかった
- この作業で配線をつなげて、電気が通るようにした

## なぜ必要だったの？

Electronアプリには「2つの世界」があります：

```
┌─────────────────┐     ┌─────────────────┐
│    画面の世界    │     │  裏方の世界      │
│  （Renderer）    │     │  （Main）        │
│                 │     │                 │
│  ユーザーが     │     │  ファイル操作    │
│  見て操作する   │     │  データベース    │
│  ところ         │     │  などを担当      │
└─────────────────┘     └─────────────────┘
         ↑                      ↑
         └──────── 壁 ──────────┘
            （直接話せない！）
```

画面の世界と裏方の世界は、セキュリティのために直接会話できません。そこで「橋渡し役」が必要になります。この統合作業では、その橋渡し役（preload）を設定して、データのやり取りができるようにしました。

## どう動く？（図解）

ユーザーが履歴を見るまでの流れ：

```
ユーザーが履歴ボタンをクリック
         ↓
   ┌─────────────────────────────┐
   │    HistoryPage（画面）       │  ← ここが今回作った画面
   │    ┌───────────┬──────────┐ │
   │    │ 履歴一覧   │ 詳細表示  │ │
   │    │  (左側)   │  (右側)   │ │
   │    └───────────┴──────────┘ │
   └─────────────────────────────┘
         ↓ データをください！
   ┌─────────────────────────────┐
   │    preload（橋渡し役）       │  ← セキュリティチェック
   └─────────────────────────────┘
         ↓ OKなので渡します
   ┌─────────────────────────────┐
   │    Main（裏方）              │
   │    → HistoryService         │  ← データベースに聞く人
   └─────────────────────────────┘
         ↓ データ取得
   ┌─────────────────────────────┐
   │    Database（データベース）   │  ← 保存されている場所
   └─────────────────────────────┘
         ↓ はいどうぞ
       （データが逆順に戻る）
         ↓
      画面にデータが表示される！
```

## 主な機能

1. **履歴一覧表示**: ファイルの過去バージョンを一覧で見れる
2. **詳細表示**: 選んだバージョンの詳しい情報を見れる
3. **ログ確認**: 変換処理のログを見れる
4. **復元**: 過去のバージョンに戻せる

---

# Part 2: 技術的な詳細

> この部分は開発者・技術者向けに書かれています。

## アーキテクチャ

### 全体構成図

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
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

### データフロー

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

## IPC通信チャンネル

### チャンネル定義

| チャンネル名                | 用途               | パラメータ             |
| --------------------------- | ------------------ | ---------------------- |
| `history:getFileHistory`    | 履歴一覧取得       | fileId, options?       |
| `history:getVersionDetail`  | バージョン詳細取得 | conversionId           |
| `history:getConversionLogs` | 変換ログ取得       | conversionId, options? |
| `history:restoreVersion`    | バージョン復元     | fileId, conversionId   |

### 登録箇所

```typescript
// apps/desktop/src/preload/channels.ts
export const IPC_CHANNELS = {
  // ...
  HISTORY_GET_FILE_HISTORY: "history:getFileHistory",
  HISTORY_GET_VERSION_DETAIL: "history:getVersionDetail",
  HISTORY_GET_CONVERSION_LOGS: "history:getConversionLogs",
  HISTORY_RESTORE_VERSION: "history:restoreVersion",
} as const;

// ALLOWED_INVOKE_CHANNELS にも追加済み
```

## コード例

### preload での API 公開

```typescript
// apps/desktop/src/preload/index.ts
const historyAPI: HistoryAPI = {
  getFileHistory: (fileId: string, options?: PaginationOptions) =>
    safeInvoke(IPC_CHANNELS.HISTORY_GET_FILE_HISTORY, fileId, options),
  getVersionDetail: (conversionId: string) =>
    safeInvoke(IPC_CHANNELS.HISTORY_GET_VERSION_DETAIL, conversionId),
  getConversionLogs: (conversionId: string, options?: LogFilterOptions) =>
    safeInvoke(IPC_CHANNELS.HISTORY_GET_CONVERSION_LOGS, conversionId, options),
  restoreVersion: (fileId: string, conversionId: string) =>
    safeInvoke(IPC_CHANNELS.HISTORY_RESTORE_VERSION, fileId, conversionId),
};

contextBridge.exposeInMainWorld("historyAPI", historyAPI);
```

### Main プロセスでのハンドラー登録

```typescript
// apps/desktop/src/main/ipc/historyHandlers.ts
export function registerHistoryHandlers(
  mainWindow: BrowserWindow,
  historyService: HistoryService,
): void {
  ipcMain.handle(
    IPC_CHANNELS.HISTORY_GET_FILE_HISTORY,
    async (_event, fileId: string, options?: PaginationOptions) => {
      try {
        validateNotEmpty(fileId, "fileId");
        const result = await historyService.getFileHistory(fileId, options);
        return success(result);
      } catch (err) {
        return error(normalizeError(err));
      }
    },
  );
  // 他のハンドラーも同様のパターン
}
```

### レンダラーでの使用

```typescript
// apps/desktop/src/renderer/pages/HistoryPage.tsx
export function HistoryPage({ fileId: propFileId }: HistoryPageProps = {}) {
  // historyAPI の存在確認
  if (typeof window === "undefined" || !window.historyAPI) {
    return <div role="alert">History API not available</div>;
  }

  // VersionHistory コンポーネントが内部で window.historyAPI を使用
  return (
    <div className="flex h-full flex-col">
      <header>...</header>
      <div className="flex flex-1 overflow-hidden">
        <div className="w-1/3">
          <VersionHistory fileId={fileId} onVersionSelect={...} />
        </div>
        <div className="w-2/3">
          {selectedVersion ? <VersionDetail ... /> : <Placeholder />}
        </div>
      </div>
    </div>
  );
}
```

## 設計意図

### 1. contextBridge による安全な API 公開

```typescript
// セキュリティ: レンダラーから直接 Node.js API にアクセスさせない
contextBridge.exposeInMainWorld("historyAPI", historyAPI);
```

### 2. ホワイトリスト方式のチャンネル管理

```typescript
// セキュリティ: 許可されたチャンネルのみ使用可能
if (!ALLOWED_INVOKE_CHANNELS.includes(channel)) {
  return Promise.reject(new Error(`Channel ${channel} is not allowed`));
}
```

### 3. Result<T> 型によるエラーハンドリング統一

```typescript
type Result<T> = { success: true; data: T } | { success: false; error: Error };
```

### 4. 入力検証の標準化

```typescript
function validateNotEmpty(value: string, fieldName: string): void {
  if (!value || value.trim() === "") {
    throw new Error(`${fieldName} is required and cannot be empty`);
  }
}
```

## ファイル構成

```
apps/desktop/src/
├── preload/
│   ├── index.ts          ← historyAPI公開
│   └── channels.ts       ← HISTORY_*チャンネル定義
├── main/
│   ├── ipc/
│   │   ├── index.ts      ← registerHistoryHandlers登録
│   │   └── historyHandlers.ts ← IPCハンドラー実装
│   └── services/
│       └── HistoryService.ts  ← サービス実装（スタブ）
└── renderer/
    ├── pages/
    │   └── HistoryPage.tsx    ← ページコンポーネント
    ├── components/history/
    │   ├── VersionHistory.tsx ← 既存（CONV-05-03）
    │   ├── VersionDetail.tsx  ← 既存（CONV-05-03）
    │   ├── ConversionLogs.tsx ← 既存（CONV-05-03）
    │   └── RestoreDialog.tsx  ← 既存（CONV-05-03）
    └── App.tsx               ← ルーティング追加
```

## テスト構成

| テストファイル          | テスト数 | 内容                       |
| ----------------------- | -------- | -------------------------- |
| historyHandlers.test.ts | 22       | IPCハンドラーテスト        |
| HistoryPage.test.tsx    | 18       | ページコンポーネントテスト |
| RestoreDialog.test.tsx  | 12       | ダイアログテスト           |
| **合計**                | **52**   | 全テスト成功               |

---

## 用語集

| 用語             | 読み方               | 意味                                             |
| ---------------- | -------------------- | ------------------------------------------------ |
| IPC              | アイピーシー         | Inter-Process Communication、プロセス間通信      |
| preload          | プリロード           | レンダラーとメインプロセスを橋渡しするスクリプト |
| contextBridge    | コンテキストブリッジ | 安全にAPIを公開するElectronの仕組み              |
| Renderer Process | レンダラープロセス   | UIを表示するプロセス（ブラウザ相当）             |
| Main Process     | メインプロセス       | Node.jsが動作するプロセス（サーバー相当）        |
| Result<T>        | リザルト             | 成功/失敗を統一的に扱う型                        |
| conversionId     | コンバージョンID     | 変換処理を一意に識別するID                       |

---

## 変更履歴

| Version | Date       | Changes            |
| ------- | ---------- | ------------------ |
| 1.0.0   | 2026-01-11 | Phase 12で初版作成 |
