# Phase 2: 設計 - タスク仕様書

## メタ情報

| 項目       | 内容                   |
| ---------- | ---------------------- |
| Phase      | 2                      |
| Phase名    | 設計                   |
| 前提Phase  | Phase 1                |
| 後続Phase  | Phase 3                |
| ステータス | 未実施                 |
| 作成日     | 2026-01-10             |
| 機能名     | history-ui-integration |

---

## 目的

履歴UIコンポーネントをElectronアプリケーションに統合するためのアーキテクチャと詳細設計を行う。

## 背景

Phase 1で定義された要件を満たすため、preloadスクリプト、IPCハンドラー、ページコンポーネント、ルーティングの設計を行う。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: preloadスクリプト設計

**目的**: historyAPIをRendererプロセスに公開する設計

**実行手順**:

1. 既存のpreload.tsの構造を確認
2. historyAPIの公開方法を設計
3. 型安全性を確保する方法を決定

**期待される成果物**:

- preloadスクリプト設計書

**設計内容**:

```typescript
// apps/desktop/src/main/preload.ts への追加
contextBridge.exposeInMainWorld("historyAPI", {
  getFileHistory: (fileId: string, options?: PaginationOptions) =>
    ipcRenderer.invoke("history:getFileHistory", fileId, options),
  getVersionDetail: (conversionId: string) =>
    ipcRenderer.invoke("history:getVersionDetail", conversionId),
  getConversionLogs: (conversionId: string, options?: LogFilterOptions) =>
    ipcRenderer.invoke("history:getConversionLogs", conversionId, options),
  restoreVersion: (fileId: string, conversionId: string) =>
    ipcRenderer.invoke("history:restoreVersion", fileId, conversionId),
});
```

---

### タスク2: IPCハンドラー設計

**目的**: メインプロセスで履歴操作を処理するハンドラーを設計

**実行手順**:

1. 既存のIPCハンドラー構造を確認
2. historyHandlers.tsの設計
3. エラーハンドリングパターンを決定

**期待される成果物**:

- IPCハンドラー設計書

**設計内容**:

```typescript
// apps/desktop/src/main/ipc/historyHandlers.ts
import { ipcMain } from "electron";
import { HistoryService } from "../services/HistoryService";

export function registerHistoryHandlers(historyService: HistoryService): void {
  ipcMain.handle("history:getFileHistory", async (_, fileId, options) => {
    try {
      const result = await historyService.getFileHistory(fileId, options);
      return { success: true, data: result };
    } catch (error) {
      return { success: false, error: { message: error.message } };
    }
  });

  ipcMain.handle("history:getVersionDetail", async (_, conversionId) => {
    try {
      const result = await historyService.getVersionDetail(conversionId);
      return { success: true, data: result };
    } catch (error) {
      return { success: false, error: { message: error.message } };
    }
  });

  ipcMain.handle(
    "history:getConversionLogs",
    async (_, conversionId, options) => {
      try {
        const result = await historyService.getConversionLogs(
          conversionId,
          options,
        );
        return { success: true, data: result };
      } catch (error) {
        return { success: false, error: { message: error.message } };
      }
    },
  );

  ipcMain.handle("history:restoreVersion", async (_, fileId, conversionId) => {
    try {
      const result = await historyService.restoreVersion(fileId, conversionId);
      return { success: true, data: result };
    } catch (error) {
      return { success: false, error: { message: error.message } };
    }
  });
}
```

---

### タスク3: HistoryPage設計

**目的**: 履歴表示ページコンポーネントの設計

**実行手順**:

1. 既存ページコンポーネントの構造を確認
2. HistoryPage.tsxのレイアウト設計
3. 状態管理とコンポーネント連携を設計

**期待される成果物**:

- ページコンポーネント設計書

**設計内容**:

```typescript
// apps/desktop/src/renderer/pages/HistoryPage.tsx
import { useState, useCallback } from 'react';
import { VersionHistory } from '../components/history/VersionHistory';
import { VersionDetail } from '../components/history/VersionDetail';
import { RestoreDialog } from '../components/history/RestoreDialog';
import { useRestore } from '../hooks/useRestore';
import type { VersionHistoryItem } from '../components/history/types';

export function HistoryPage() {
  const [selectedVersion, setSelectedVersion] = useState<VersionHistoryItem | null>(null);
  const [restoreTarget, setRestoreTarget] = useState<VersionHistoryItem | null>(null);
  const { restore, isLoading, error, isSuccess, reset } = useRestore();

  // fileIdは実際にはルーターパラメータまたはコンテキストから取得
  const fileId = 'current-file-id';

  const handleVersionSelect = useCallback((item: VersionHistoryItem) => {
    setSelectedVersion(item);
  }, []);

  const handleRestoreClick = useCallback((item: VersionHistoryItem) => {
    setRestoreTarget(item);
  }, []);

  const handleRestoreConfirm = useCallback(async () => {
    if (!restoreTarget) return;
    await restore(restoreTarget.fileId, restoreTarget.conversionId);
    setRestoreTarget(null);
  }, [restoreTarget, restore]);

  const handleRestoreCancel = useCallback(() => {
    setRestoreTarget(null);
    reset();
  }, [reset]);

  return (
    <div className="flex h-full">
      <div className="w-1/3 border-r">
        <VersionHistory
          fileId={fileId}
          onVersionSelect={handleVersionSelect}
          onRestore={handleRestoreClick}
        />
      </div>
      <div className="w-2/3">
        {selectedVersion && (
          <VersionDetail
            conversionId={selectedVersion.conversionId}
            onRestore={() => handleRestoreClick(selectedVersion)}
            onBack={() => setSelectedVersion(null)}
          />
        )}
      </div>
      {restoreTarget && (
        <RestoreDialog
          isOpen={!!restoreTarget}
          version={restoreTarget}
          isLoading={isLoading}
          error={error}
          onConfirm={handleRestoreConfirm}
          onCancel={handleRestoreCancel}
        />
      )}
    </div>
  );
}
```

---

### タスク4: ルーティング設計

**目的**: 履歴ページへのルーティングを設計

**実行手順**:

1. 既存のルーティング設定を確認
2. 履歴ページへのルートを設計
3. ナビゲーション方法を決定

**期待される成果物**:

- ルーティング設計書

---

### タスク5: 型定義設計

**目的**: global.d.tsにHistoryAPI型を追加

**実行手順**:

1. 既存のglobal.d.tsを確認
2. HistoryAPI型定義を設計
3. 既存の型との整合性を確認

**期待される成果物**:

- 型定義設計書

**設計内容**:

```typescript
// apps/desktop/src/renderer/global.d.ts への追加
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

interface Window {
  historyAPI: HistoryAPI;
}
```

---

## 参照資料

| 参照資料             | パス                                                                         | 内容                 |
| -------------------- | ---------------------------------------------------------------------------- | -------------------- |
| 要件定義書           | `outputs/phase-1/requirements-definition.md`                                 | Phase 1成果物        |
| 履歴/ログ表示UI仕様  | `.claude/skills/aiworkflow-requirements/references/ui-ux-history-panel.md`   | IPC通信・型定義      |
| Electronセキュリティ | `.claude/skills/aiworkflow-requirements/references/security-api-electron.md` | IPCセキュリティ      |
| 既存preload          | `apps/desktop/src/main/preload.ts`                                           | 既存実装参考         |
| 既存ルーティング     | `apps/desktop/src/renderer/App.tsx`                                          | 既存ルーティング参考 |

---

## 成果物

| 成果物             | パス                                     | 内容                |
| ------------------ | ---------------------------------------- | ------------------- |
| アーキテクチャ設計 | `outputs/phase-2/architecture-design.md` | 統合アーキテクチャ  |
| コンポーネント設計 | `outputs/phase-2/component-design.md`    | HistoryPage設計     |
| IPC設計            | `outputs/phase-2/ipc-design.md`          | preload/handler設計 |

---

## 統合テスト連携【必須】

統合ポイント/契約（API・スキーマ）を設計に反映する:

| 統合ポイント          | 契約定義                                                            |
| --------------------- | ------------------------------------------------------------------- |
| Renderer → preload    | historyAPI（4メソッド）                                             |
| preload → Main        | IPCチャンネル（history:\*）                                         |
| Main → HistoryService | getFileHistory, getVersionDetail, getConversionLogs, restoreVersion |

---

## 完了条件

- [ ] preloadスクリプトの設計完了
- [ ] IPCハンドラーの設計完了
- [ ] HistoryPage.tsxの設計完了
- [ ] ルーティング設計完了
- [ ] 型定義（global.d.ts）の設計完了
- [ ] 統合ポイント/契約が設計に反映されている
- [ ] **本Phase内の全タスクを100%実行完了**

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認
- [ ] artifacts.jsonが更新されている

---

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. preloadスクリプト設計
2. IPCハンドラー設計
3. HistoryPage設計
4. ルーティング設計
5. 型定義設計
6. 成果物の作成・配置
7. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐにcompletedに更新すること。

---

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.mjs docs/30-workflows/history-ui-integration --phase 2
```

---

## 依存関係

- **前提**: Phase 1 が完了していること
- **後続**: Phase 3（設計レビューゲート）へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/history-ui-integration/phase-3-design-review.md`
