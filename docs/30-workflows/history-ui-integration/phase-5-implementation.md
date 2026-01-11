# Phase 5: 実装（TDD: Green） - タスク仕様書

## メタ情報

| 項目       | 内容                   |
| ---------- | ---------------------- |
| Phase      | 5                      |
| Phase名    | 実装                   |
| 前提Phase  | Phase 4                |
| 後続Phase  | Phase 6                |
| ステータス | 未実施                 |
| 作成日     | 2026-01-10             |
| 機能名     | history-ui-integration |

---

## 目的

Phase 4で作成したテストを通すための最小限の実装を行う（Green状態）。

## 背景

TDD原則に従い、Phase 4で作成した失敗テストを通すための実装を行う。既存のUIコンポーネント（VersionHistory等）は完成済みなので、統合部分（preload、IPCハンドラー、HistoryPage、ルーティング）を実装する。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: preloadスクリプト実装

**目的**: historyAPIをRendererプロセスに公開する

**実行手順**:

1. `apps/desktop/src/main/preload.ts` を開く
2. Phase 2の設計に従い、historyAPIを追加
3. 型定義との整合性を確認

**期待される成果物**:

- preload.ts への historyAPI 追加

**実装コード**:

```typescript
// apps/desktop/src/main/preload.ts への追加
import { contextBridge, ipcRenderer } from "electron";

// 既存のAPI定義の後に追加
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

### タスク2: IPCハンドラー実装

**目的**: メインプロセスで履歴操作を処理するハンドラーを実装

**実行手順**:

1. `apps/desktop/src/main/ipc/historyHandlers.ts` を新規作成
2. Phase 2の設計に従い、4つのハンドラーを実装
3. HistoryServiceとの連携を実装
4. エラーハンドリングを実装

**期待される成果物**:

- historyHandlers.ts

**実装コード**:

```typescript
// apps/desktop/src/main/ipc/historyHandlers.ts
import { ipcMain } from "electron";
import type { HistoryService } from "../services/HistoryService";

export function registerHistoryHandlers(historyService: HistoryService): void {
  ipcMain.handle(
    "history:getFileHistory",
    async (_, fileId: string, options?: any) => {
      try {
        const result = await historyService.getFileHistory(fileId, options);
        return { success: true, data: result };
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Unknown error";
        return { success: false, error: { message } };
      }
    },
  );

  ipcMain.handle(
    "history:getVersionDetail",
    async (_, conversionId: string) => {
      try {
        const result = await historyService.getVersionDetail(conversionId);
        return { success: true, data: result };
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Unknown error";
        return { success: false, error: { message } };
      }
    },
  );

  ipcMain.handle(
    "history:getConversionLogs",
    async (_, conversionId: string, options?: any) => {
      try {
        const result = await historyService.getConversionLogs(
          conversionId,
          options,
        );
        return { success: true, data: result };
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Unknown error";
        return { success: false, error: { message } };
      }
    },
  );

  ipcMain.handle(
    "history:restoreVersion",
    async (_, fileId: string, conversionId: string) => {
      try {
        const result = await historyService.restoreVersion(
          fileId,
          conversionId,
        );
        return { success: true, data: result };
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Unknown error";
        return { success: false, error: { message } };
      }
    },
  );
}
```

---

### タスク3: global.d.ts型定義追加

**目的**: HistoryAPI型をWindowインターフェースに追加

**実行手順**:

1. `apps/desktop/src/renderer/global.d.ts` を開く（または新規作成）
2. Phase 2の設計に従い、HistoryAPI型を追加
3. 既存の型定義との整合性を確認

**期待される成果物**:

- global.d.ts への HistoryAPI 型追加

**実装コード**:

```typescript
// apps/desktop/src/renderer/global.d.ts
import type {
  VersionHistoryItem,
  ConversionLog,
  PaginationOptions,
  LogFilterOptions,
} from "./components/history/types";

interface PaginatedResult<T> {
  items: T[];
  total: number;
  hasMore: boolean;
}

interface SuccessResult<T> {
  success: true;
  data: T;
}

interface ErrorResult {
  success: false;
  error: { message: string };
}

type Result<T> = SuccessResult<T> | ErrorResult;

interface VersionDetailData extends VersionHistoryItem {
  logs: ConversionLog[];
}

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

declare global {
  interface Window {
    historyAPI: HistoryAPI;
  }
}

export {};
```

---

### タスク4: HistoryPage実装

**目的**: 履歴表示ページコンポーネントを実装

**実行手順**:

1. `apps/desktop/src/renderer/pages/HistoryPage.tsx` を新規作成
2. Phase 2の設計に従い、コンポーネントを実装
3. 既存コンポーネント（VersionHistory等）との連携を実装

**期待される成果物**:

- HistoryPage.tsx

**実装コード**:

```typescript
// apps/desktop/src/renderer/pages/HistoryPage.tsx
import { useState, useCallback } from 'react';
import { VersionHistory } from '../components/history/VersionHistory';
import { VersionDetail } from '../components/history/VersionDetail';
import { RestoreDialog } from '../components/history/RestoreDialog';
import { useRestore } from '../hooks/useRestore';
import type { VersionHistoryItem } from '../components/history/types';

interface HistoryPageProps {
  fileId?: string;
}

export function HistoryPage({ fileId = '' }: HistoryPageProps) {
  const [selectedVersion, setSelectedVersion] = useState<VersionHistoryItem | null>(null);
  const [restoreTarget, setRestoreTarget] = useState<VersionHistoryItem | null>(null);
  const { restore, isLoading, error, isSuccess, reset } = useRestore();

  // historyAPI未定義チェック
  if (typeof window === 'undefined' || !window.historyAPI) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-red-500">History API not available</p>
      </div>
    );
  }

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
      <div className="w-1/3 border-r overflow-auto">
        <VersionHistory
          fileId={fileId}
          onVersionSelect={handleVersionSelect}
          onRestore={handleRestoreClick}
        />
      </div>
      <div className="w-2/3 overflow-auto">
        {selectedVersion ? (
          <VersionDetail
            conversionId={selectedVersion.conversionId}
            onRestore={() => handleRestoreClick(selectedVersion)}
            onBack={() => setSelectedVersion(null)}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-gray-500">
            バージョンを選択してください
          </div>
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

### タスク5: ルーティング設定

**目的**: 履歴ページへのルートを追加

**実行手順**:

1. 既存のルーティング設定ファイルを確認
2. 履歴ページへのルートを追加
3. ナビゲーションリンクを追加（必要に応じて）

**期待される成果物**:

- ルーティング設定の更新

---

### タスク6: メインプロセスでのハンドラー登録

**目的**: アプリ起動時にIPCハンドラーを登録

**実行手順**:

1. メインプロセスのエントリーポイントを確認
2. registerHistoryHandlersを呼び出す
3. HistoryServiceのインスタンスを渡す

**期待される成果物**:

- メインプロセスでのハンドラー登録

---

## 参照資料

| 参照資料           | パス                                                                       | 内容                   |
| ------------------ | -------------------------------------------------------------------------- | ---------------------- |
| テスト仕様書       | `outputs/phase-4/test-specification.md`                                    | Phase 4成果物          |
| 設計書             | `outputs/phase-2/architecture-design.md`                                   | Phase 2成果物          |
| 履歴UI仕様         | `.claude/skills/aiworkflow-requirements/references/ui-ux-history-panel.md` | 実装仕様参考           |
| 既存コンポーネント | `apps/desktop/src/renderer/components/history/`                            | 利用するコンポーネント |

---

## 成果物

| 成果物        | パス                                              | 内容                 |
| ------------- | ------------------------------------------------- | -------------------- |
| preload更新   | `apps/desktop/src/main/preload.ts`                | historyAPI公開       |
| IPCハンドラー | `apps/desktop/src/main/ipc/historyHandlers.ts`    | 4チャンネル登録      |
| 型定義        | `apps/desktop/src/renderer/global.d.ts`           | HistoryAPI型         |
| HistoryPage   | `apps/desktop/src/renderer/pages/HistoryPage.tsx` | ページコンポーネント |

---

## 統合テスト連携【必須】

フロント/バック接続の実装とテスト支援コード整備:

| 実装項目           | 内容                                                                 |
| ------------------ | -------------------------------------------------------------------- |
| IPC接続            | preload.ts で historyAPI を公開、historyHandlers.ts でハンドラー登録 |
| エラーハンドリング | Result<T>型で成功/失敗を返却、UIでエラー表示                         |
| 状態同期           | 復元後にVersionHistoryを再取得                                       |

---

## 完了条件

- [ ] preload.ts に historyAPI が追加されている
- [ ] historyHandlers.ts が作成されている
- [ ] global.d.ts に HistoryAPI 型が追加されている
- [ ] HistoryPage.tsx が作成されている
- [ ] ルーティングが設定されている
- [ ] メインプロセスでハンドラーが登録されている
- [ ] すべてのテストが成功状態（Green）
- [ ] フロント/バック接続が実装されている
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

1. preloadスクリプト実装
2. IPCハンドラー実装
3. global.d.ts型定義追加
4. HistoryPage実装
5. ルーティング設定
6. メインプロセスでのハンドラー登録
7. テストが成功状態（Green）であることを確認
8. 完了条件の検証

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
node .claude/skills/task-specification-creator/scripts/validate-phase-output.mjs docs/30-workflows/history-ui-integration --phase 5
```

---

## TDD検証

```bash
# テスト実行コマンド
pnpm --filter @repo/desktop test

# 確認項目
# - [ ] テストが成功することを確認（Green状態）
```

---

## 依存関係

- **前提**: Phase 4 が完了していること
- **後続**: Phase 6（テスト拡充）へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/history-ui-integration/phase-6-test-enhancement.md`
