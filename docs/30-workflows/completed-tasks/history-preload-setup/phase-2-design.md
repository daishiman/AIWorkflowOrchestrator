# Phase 2: 設計

## メタ情報

| 項目   | 値                    |
| ------ | --------------------- |
| Phase  | 2                     |
| 機能名 | history-preload-setup |
| 作成日 | 2026-01-12            |

---

## 目的

Phase 1で抽出した要件を実現するためのpreloadスクリプト設計とglobal.d.ts型定義設計を行う。

---

## 実行タスク

| タスク           | 責務                                           |
| ---------------- | ---------------------------------------------- |
| preload設計      | contextBridge.exposeInMainWorldでのAPI公開設計 |
| 型定義設計       | global.d.tsでのWindow型拡張設計                |
| ファイル構成設計 | 既存preloadファイルとの統合方針                |

---

## 参照資料

| 資料名       | パス                                         | 説明          |
| ------------ | -------------------------------------------- | ------------- |
| 要件定義書   | `outputs/phase-1/requirements-definition.md` | Phase 1成果物 |
| 受け入れ基準 | `outputs/phase-1/acceptance-criteria.md`     | Phase 1成果物 |

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料                  | パス                                                                         | 内容                               |
| ------------------------- | ---------------------------------------------------------------------------- | ---------------------------------- |
| 履歴/ログ表示UI仕様       | `.claude/skills/aiworkflow-requirements/references/ui-ux-history-panel.md`   | HistoryAPI仕様・IPCチャンネル名    |
| APIセキュリティ・Electron | `.claude/skills/aiworkflow-requirements/references/security-api-electron.md` | preload・contextBridgeセキュリティ |

**仕様検索**: `node .claude/skills/aiworkflow-requirements/scripts/search-spec.mjs "preload"`

---

## 実行手順

### 1. preloadスクリプト設計

#### 実装場所

既存の `apps/desktop/src/preload/index.ts` に追加する。

#### API設計

```typescript
// apps/desktop/src/preload/index.ts への追加

import { contextBridge, ipcRenderer } from "electron";
import { HISTORY_CHANNELS } from "./channels";

// HistoryAPI型定義（ローカル）
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

### 2. 型定義設計

#### 実装場所

`apps/desktop/src/renderer/global.d.ts` に追加する。

#### 型定義

```typescript
// apps/desktop/src/renderer/global.d.ts

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

### 3. ファイル構成設計

#### 変更対象ファイル

| ファイル                                | 変更内容                   |
| --------------------------------------- | -------------------------- |
| `apps/desktop/src/preload/index.ts`     | historyAPI公開追加         |
| `apps/desktop/src/preload/channels.ts`  | HISTORY_CHANNELSの参照確認 |
| `apps/desktop/src/renderer/global.d.ts` | HistoryAPI型定義追加       |

#### 既存との統合

- preload/channels.tsに既存のHISTORY_CHANNELSを利用
- global.d.tsの既存Window型拡張に追加
- historyAPIはオプショナル（`?`）として定義し、存在確認パターンを適用

---

## 統合テスト連携【必須】

contextBridge API公開設計を設計に反映:

| 統合ポイント   | 契約定義                                                         |
| -------------- | ---------------------------------------------------------------- |
| preload → Main | ipcRenderer.invoke(HISTORY_CHANNELS.\*, ...args)                 |
| Window → React | window.historyAPI?.getFileHistory(fileId) → Promise<Result<...>> |
| 型安全性       | HistoryAPI interface による型チェック                            |

---

## 成果物

| 成果物         | パス                                     | 説明            |
| -------------- | ---------------------------------------- | --------------- |
| アーキテクチャ | `outputs/phase-2/architecture-design.md` | preload構成設計 |
| API設計        | `outputs/phase-2/api-design.md`          | historyAPI設計  |
| 型定義設計     | `outputs/phase-2/type-definition.md`     | global.d.ts設計 |

---

## 完了条件

- [ ] preload.tsへの追加コードが設計されている
- [ ] global.d.tsの型定義が設計されている
- [ ] 既存ファイルとの統合方針が明確である
- [ ] Phase 1の要件との整合性が確認されている
- [ ] 統合ポイント/契約が設計に反映されている
- [ ] **本Phase内の全タスクを100%実行完了**

---

## 次のPhase

Phase 3: 設計レビューゲート
