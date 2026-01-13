# Phase 5: 実装（TDD: Green）

## メタ情報

| 項目   | 値                    |
| ------ | --------------------- |
| Phase  | 5                     |
| 機能名 | history-preload-setup |
| 作成日 | 2026-01-12            |

---

## 目的

Phase 4で作成したテストを通すための最小限の実装を行う。preload.tsとglobal.d.tsを更新してhistoryAPIを公開する。

---

## 実行タスク

| タスク           | 責務                                            |
| ---------------- | ----------------------------------------------- |
| preload.ts更新   | contextBridge.exposeInMainWorldでhistoryAPI公開 |
| global.d.ts更新  | Window型にHistoryAPI追加                        |
| DevTools疎通確認 | window.historyAPIの存在確認                     |

---

## 参照資料

| 資料名 | パス                                                    | 説明          |
| ------ | ------------------------------------------------------- | ------------- |
| 設計書 | `outputs/phase-2/architecture-design.md`                | Phase 2成果物 |
| テスト | `apps/desktop/src/preload/__tests__/historyAPI.test.ts` | Phase 4成果物 |

### システム仕様（aiworkflow-requirements）

> 実装時に必ず以下のシステム仕様を確認し、仕様準拠を確保してください。

| 参照資料                  | パス                                                                         | 内容                               |
| ------------------------- | ---------------------------------------------------------------------------- | ---------------------------------- |
| 履歴/ログ表示UI仕様       | `.claude/skills/aiworkflow-requirements/references/ui-ux-history-panel.md`   | HistoryAPI仕様・IPCチャンネル名    |
| APIセキュリティ・Electron | `.claude/skills/aiworkflow-requirements/references/security-api-electron.md` | preload・contextBridgeセキュリティ |

**仕様検索**: `node .claude/skills/aiworkflow-requirements/scripts/search-spec.mjs "contextBridge"`

---

## 実行手順

### 1. preload.ts 更新

`apps/desktop/src/preload/index.ts` に以下を追加:

```typescript
import { contextBridge, ipcRenderer } from "electron";
import { HISTORY_CHANNELS } from "./channels";

// HistoryAPI型定義（preload内）
interface PaginationOptions {
  limit?: number;
  offset?: number;
}

interface LogFilterOptions extends PaginationOptions {
  level?: "info" | "warn" | "error" | "debug";
}

// historyAPIの公開
contextBridge.exposeInMainWorld("historyAPI", {
  getFileHistory: (fileId: string, options?: PaginationOptions) =>
    ipcRenderer.invoke(HISTORY_CHANNELS.GET_FILE_HISTORY, fileId, options),

  getVersionDetail: (conversionId: string) =>
    ipcRenderer.invoke(HISTORY_CHANNELS.GET_VERSION_DETAIL, conversionId),

  getConversionLogs: (conversionId: string, options?: LogFilterOptions) =>
    ipcRenderer.invoke(
      HISTORY_CHANNELS.GET_CONVERSION_LOGS,
      conversionId,
      options,
    ),

  restoreVersion: (fileId: string, conversionId: string) =>
    ipcRenderer.invoke(HISTORY_CHANNELS.RESTORE_VERSION, fileId, conversionId),
});
```

### 2. global.d.ts 更新

`apps/desktop/src/renderer/global.d.ts` に以下を追加:

```typescript
import type {
  VersionHistoryItem,
  ConversionLog,
  PaginatedResult,
  Result,
} from "./components/history/types";

interface HistoryAPI {
  getFileHistory(
    fileId: string,
    options?: { limit?: number; offset?: number },
  ): Promise<Result<PaginatedResult<VersionHistoryItem>>>;

  getVersionDetail(
    conversionId: string,
  ): Promise<Result<{ version: VersionHistoryItem; logs: ConversionLog[] }>>;

  getConversionLogs(
    conversionId: string,
    options?: { limit?: number; offset?: number; level?: string },
  ): Promise<Result<PaginatedResult<ConversionLog>>>;

  restoreVersion(
    fileId: string,
    conversionId: string,
  ): Promise<Result<VersionHistoryItem>>;
}

declare global {
  interface Window {
    historyAPI?: HistoryAPI;
  }
}

export {};
```

### 3. DevTools疎通確認

```javascript
// アプリ起動後、DevToolsコンソールで確認
console.log(window.historyAPI); // オブジェクトが表示される
console.log(typeof window.historyAPI.getFileHistory); // "function"
console.log(Object.keys(window.historyAPI)); // ["getFileHistory", "getVersionDetail", "getConversionLogs", "restoreVersion"]
```

---

## 統合テスト連携【必須】

preload.ts・global.d.ts実装とDevToolsでの疎通確認:

| 実装項目           | 内容                                           |
| ------------------ | ---------------------------------------------- |
| API接続            | ipcRenderer.invoke → IPCハンドラー → Result<T> |
| エラーハンドリング | IPCハンドラーでResult型を返却                  |
| 状態同期           | N/A（履歴APIは同期的なリクエスト/レスポンス）  |

---

## 成果物

| 成果物      | パス                                    | 説明           |
| ----------- | --------------------------------------- | -------------- |
| preload更新 | `apps/desktop/src/preload/index.ts`     | historyAPI公開 |
| 型定義更新  | `apps/desktop/src/renderer/global.d.ts` | Window型拡張   |

---

## 完了条件

- [ ] preload.tsにhistoryAPIが追加されている
- [ ] global.d.tsにHistoryAPI型定義が追加されている
- [ ] すべてのテストが成功状態（Green）
- [ ] TypeScript型エラーがない
- [ ] DevToolsでwindow.historyAPIが確認できる
- [ ] **本Phase内の全タスクを100%実行完了**

---

## TDD検証

```bash
# テスト実行コマンド
pnpm --filter @repo/desktop test

# 確認項目
# - [ ] テストが成功することを確認（Green状態）
```

---

## 次のPhase

Phase 6: テスト拡充
