# historyAPI 実装ガイド

## メタ情報

| 項目       | 値                    |
| ---------- | --------------------- |
| Phase      | 12                    |
| タスク名   | history-preload-setup |
| 作成日     | 2026-01-13            |
| ステータス | 完了                  |

---

## Part 1: 概念的な説明（初学者・非技術者向け）

### なぜpreload.tsでhistoryAPIを公開する必要があるのか

Electronアプリケーションでは、**セキュリティのため**にWebページ（UI）とシステム機能が分離されています。
これは「ガラス越しの会話」に例えることができます。

### 「ガラス越しの会話」の比喩

```
┌─────────────────────────────────────────────────────────────┐
│ 🏠 家の中 (Main Process)                                    │
│                                                             │
│   ・データベースにアクセスできる                            │
│   ・ファイルを読み書きできる                                │
│   ・システムの機能を使える                                  │
│                                                             │
└───────────────────────────┬─────────────────────────────────┘
                            │
                      🪟 窓口 (preload.ts)
                      ・許可されたAPIのみ提供
                      ・「履歴を見せて」→ OK
                      ・「ファイルを削除して」→ NG（許可されていない）
                            │
┌───────────────────────────┼─────────────────────────────────┐
│ 🌐 家の外 (Renderer Process)                                │
│                                                             │
│   ・Webページ（UIの表示）                                   │
│   ・直接システムにアクセスできない                          │
│   ・窓口を通じてのみ家の中と通信                            │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 3つの登場人物

| 登場人物 | 比喩   | 役割                                   |
| -------- | ------ | -------------------------------------- |
| Main     | 家の中 | データベースやファイルにアクセスできる |
| Renderer | 家の外 | UIを表示する（Webページと同じ）        |
| Preload  | 窓口   | 許可された機能だけを家の外に公開する   |

### なぜこの仕組みが必要なのか

もしWebページ（Renderer）が直接システムにアクセスできたら...

- 悪意のあるスクリプトがファイルを削除できてしまう
- 個人情報を勝手に外部に送信できてしまう
- パソコン全体が危険にさらされる

**preload.ts**は「許可されたAPIだけ」を公開することで、安全性を保ちながら必要な機能を提供します。

### historyAPIでできること

| 機能               | 説明                           |
| ------------------ | ------------------------------ |
| 履歴一覧を取得     | ファイルの過去バージョンを表示 |
| バージョン詳細取得 | 特定バージョンの詳細情報を表示 |
| 変換ログ取得       | 変換処理のログを表示           |
| バージョン復元     | 過去のバージョンに戻す         |

---

## Part 2: 技術的な詳細（開発者・技術者向け）

### アーキテクチャ

```
┌─────────────────────────────────────────────────────────────┐
│ Renderer Process (React)                                    │
│   window.historyAPI.getFileHistory(fileId)                  │
└───────────────────────────┬─────────────────────────────────┘
                            │ contextBridge
┌───────────────────────────┼─────────────────────────────────┐
│ Preload Script            │                                 │
│   historyAPI object       │                                 │
│   safeInvoke(channel)     │                                 │
└───────────────────────────┼─────────────────────────────────┘
                            │ ipcRenderer.invoke
┌───────────────────────────┼─────────────────────────────────┐
│ Main Process              │                                 │
│   IPCハンドラー           │                                 │
│   HistoryService          │                                 │
└───────────────────────────┴─────────────────────────────────┘
```

### API仕様

#### HistoryAPI インターフェース

```typescript
interface HistoryAPI {
  getFileHistory(
    fileId: string,
    options?: PaginationOptions,
  ): Promise<Result<PaginatedResult<VersionHistoryItem>>>;

  getVersionDetail(conversionId: string): Promise<Result<VersionDetailData>>;

  getConversionLogs(
    conversionId: string,
    options?: LogFilterOptions,
  ): Promise<Result<PaginatedResult<ConversionLog>>>;

  restoreVersion(
    fileId: string,
    conversionId: string,
  ): Promise<Result<VersionHistoryItem>>;
}
```

### IPCチャンネル定義

```typescript
// apps/desktop/src/preload/channels.ts
export const IPC_CHANNELS = {
  HISTORY_GET_FILE_HISTORY: "history:getFileHistory",
  HISTORY_GET_VERSION_DETAIL: "history:getVersionDetail",
  HISTORY_GET_CONVERSION_LOGS: "history:getConversionLogs",
  HISTORY_RESTORE_VERSION: "history:restoreVersion",
} as const;
```

### 実装ファイル

| ファイル                                                | 内容                   |
| ------------------------------------------------------- | ---------------------- |
| `apps/desktop/src/preload/index.ts`                     | historyAPIオブジェクト |
| `apps/desktop/src/preload/channels.ts`                  | IPCチャンネル定義      |
| `apps/desktop/src/renderer/components/history/types.ts` | 型定義                 |

### preload/index.ts の実装

```typescript
// historyAPI定義（lines 319-328）
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

// 公開（line 353）
contextBridge.exposeInMainWorld("historyAPI", historyAPI);
```

### 使用例

#### ファイル履歴取得

```typescript
const result = await window.historyAPI?.getFileHistory(fileId, {
  limit: 20,
  offset: 0,
});

if (result?.success) {
  const { items, total, hasMore } = result.data;
  items.forEach((item) => {
    console.log(`Version ${item.version}: ${item.createdAt}`);
  });
}
```

#### バージョン詳細取得

```typescript
const result = await window.historyAPI?.getVersionDetail(conversionId);

if (result?.success) {
  const { version, logs } = result.data;
  console.log(`Version: ${version.version}`);
  console.log(`Logs: ${logs.length} entries`);
}
```

#### バージョン復元

```typescript
const result = await window.historyAPI?.restoreVersion(fileId, conversionId);

if (result?.success) {
  console.log(`Restored to version ${result.data.version}`);
}
```

### エラーハンドリング

```typescript
// Result型パターン
type Result<T> = { success: true; data: T } | { success: false; error: Error };

// 使用例
const result = await window.historyAPI?.getFileHistory(fileId);

if (!result) {
  // APIが利用不可（preload未設定）
  console.error("History API not available");
} else if (!result.success) {
  // API呼び出しエラー
  console.error("Error:", result.error.message);
} else {
  // 成功
  console.log("Data:", result.data);
}
```

---

## セキュリティ考慮事項

| 項目               | 設定/実装                             |
| ------------------ | ------------------------------------- |
| contextIsolation   | true（Renderer分離）                  |
| nodeIntegration    | false（Node.js無効化）                |
| ホワイトリスト     | ALLOWED_INVOKE_CHANNELSで管理         |
| safeInvokeラッパー | チャンネル検証付きipcRenderer呼び出し |

### safeInvoke実装

```typescript
const safeInvoke = async <T>(
  channel: string,
  ...args: unknown[]
): Promise<T> => {
  if (!ALLOWED_INVOKE_CHANNELS.includes(channel)) {
    throw new Error(`Channel not allowed: ${channel}`);
  }
  return ipcRenderer.invoke(channel, ...args);
};
```

---

## 関連ドキュメント

| ドキュメント | パス                                                                       |
| ------------ | -------------------------------------------------------------------------- |
| 設計書       | `outputs/phase-2/architecture-design.md`                                   |
| API設計      | `outputs/phase-2/api-design.md`                                            |
| 型定義設計   | `outputs/phase-2/type-definition.md`                                       |
| テスト仕様   | `outputs/phase-4/test-specification.md`                                    |
| システム仕様 | `.claude/skills/aiworkflow-requirements/references/ui-ux-history-panel.md` |

---

## 完了確認

- [x] Part 1: 概念的説明（初学者向け）が記載されている
- [x] Part 2: 技術的詳細（開発者向け）が記載されている
- [x] アーキテクチャ図が記載されている
- [x] API仕様が記載されている
- [x] 実装ファイル一覧が記載されている
- [x] 使用例が記載されている
- [x] エラーハンドリングが記載されている
- [x] セキュリティ考慮事項が記載されている
- [x] **本Phase内の全タスクを100%実行完了**
