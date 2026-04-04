# Phase 5: 実装 - LLMAdapter 初期化エラー UI 通知・状態公開

## メタ情報

| 項目    | 値                                               |
| ------- | ------------------------------------------------ |
| Phase   | 5 - 実装                                         |
| 機能名  | task-rt-01-llm-adapter-error-propagation         |
| 作成日  | 2026-04-04                                       |
| 前Phase | [Phase 4: テスト作成](phase-04-test-creation.md) |

## 目的

Phase 4 で作成したテストを GREEN にするため、Phase 2 設計書の通りに実装する。
IPC 基盤（Main 側）→ Preload API → Renderer UI の順に実装し、各ステップでテストを確認する。

## 実行タスク

実装は以下の順序で行う（依存関係に従い直列）:

1. **shared 型追加**: `LLMAdapterStatusPayload` 型を追加する
2. **channels.ts 修正**: 2チャネルの定数・ALLOWED リスト追加
3. **Facade コールバック追加**: `onAdapterStatusChanged` プロパティ追加 + 呼び出し
4. **IPC ハンドラ追加**: `creatorHandlers.ts` に pull ハンドラ + push ワイヤリング追加
5. **Preload API 追加**: `skill-creator-api.ts` に 2メソッド追加
6. **コンポーネント作成**: `LLMAdapterErrorBanner.tsx` 新規作成
7. **フック作成**: `useLLMAdapterStatus.ts` 新規作成
8. **SkillLifecyclePanel 統合**: フックとコンポーネントを統合
9. **テスト GREEN 確認**

## 参照資料

| 資料名                   | パス                                                                  | 用途                  |
| ------------------------ | --------------------------------------------------------------------- | --------------------- |
| Phase 2 設計書           | `phase-02-design.md`                                                  | 実装仕様              |
| Phase 4 テスト           | `phase-04-test-creation.md`                                           | テスト GREEN 確認対象 |
| 既存 channels.ts         | `apps/desktop/src/preload/channels.ts`                                | チャネル追加先        |
| 既存 Facade              | `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts` | コールバック追加先    |
| 既存 creatorHandlers.ts  | `apps/desktop/src/main/ipc/creatorHandlers.ts`                        | ハンドラ追加先        |
| 既存 skill-creator-api   | `apps/desktop/src/preload/skill-creator-api.ts`                       | API 追加先            |
| 既存 ErrorBanner.tsx     | `apps/desktop/src/renderer/components/skill/ErrorBanner.tsx`          | スタイルパターン      |
| 既存 SkillLifecyclePanel | `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx`  | 統合先                |
| shared 型 export 集約    | `packages/shared/src/types/index.ts`                                  | `@repo/shared/types`  |

---

## 実装ステップ

### ステップ 1: shared 型追加

**対象ファイル**: `packages/shared/src/types/skillCreator.ts`

`LLMAdapterStatus` 型定義（line 338）の直下に追加：

```typescript
/** LLMAdapter ステータス IPC レスポンス payload (TASK-RT-01) */
export interface LLMAdapterStatusPayload {
  status: LLMAdapterStatus; // "ready" | "initializing" | "failed"
  failureReason: string | null; // "failed" 時のエラー詳細
}
```

**対象ファイル**: `packages/shared/src/types/index.ts`

本タスクでは `@repo/shared/types` から `LLMAdapterStatusPayload` を import するため、
列挙 export に `LLMAdapterStatusPayload` を追加して再エクスポートする：

```typescript
export type {
  // ...
  LLMAdapterStatus,
  LLMAdapterStatusPayload,
  // ...
} from "./skillCreator";
```

---

### ステップ 2: channels.ts 修正

**対象ファイル**: `apps/desktop/src/preload/channels.ts`

#### 2-1. チャネル定数追加

既存の `skill-creator:*` チャネル定数群の末尾に追加：

```typescript
SKILL_CREATOR_GET_ADAPTER_STATUS: "skill-creator:get-adapter-status",
SKILL_CREATOR_ADAPTER_STATUS_CHANGED: "skill-creator:adapter-status-changed",
```

#### 2-2. ALLOWED_INVOKE_CHANNELS への追加

`ALLOWED_INVOKE_CHANNELS` 配列の `skill-creator:*` グループ末尾に追加：

```typescript
IPC_CHANNELS.SKILL_CREATOR_GET_ADAPTER_STATUS,
```

#### 2-3. ALLOWED_ON_CHANNELS への追加

`ALLOWED_ON_CHANNELS` 配列の `skill-creator:*` グループ末尾に追加：

```typescript
IPC_CHANNELS.SKILL_CREATOR_ADAPTER_STATUS_CHANGED,
```

---

### ステップ 3: Facade コールバック追加

**対象ファイル**: `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`

#### 3-1. コールバックプロパティ定義追加

クラスのパブリックプロパティとして追加：

```typescript
onAdapterStatusChanged?: (
  status: LLMAdapterStatus,
  reason: string | null,
) => void;
```

#### 3-2. `setLLMAdapter` メソッド内での呼び出し

`setLLMAdapter` メソッドの末尾に追加：

```typescript
this.onAdapterStatusChanged?.("ready", null);
```

#### 3-3. `setLLMAdapterFailed` メソッド内での呼び出し

`setLLMAdapterFailed` メソッドの末尾に追加：

```typescript
this.onAdapterStatusChanged?.("failed", reason);
```

---

### ステップ 4: IPC ハンドラ追加

**対象ファイル**: `apps/desktop/src/main/ipc/creatorHandlers.ts`

#### 4-1. インポート追加

ファイル先頭のインポートに追加：

```typescript
import type { LLMAdapterStatusPayload } from "@repo/shared/types";
```

#### 4-2. pull ハンドラ追加

`registerRuntimeSkillCreatorHandlers` 内の既存ハンドラ登録コードの末尾に追加：

```typescript
ipcMain.handle(
  IPC_CHANNELS.SKILL_CREATOR_GET_ADAPTER_STATUS,
  (event: IpcMainInvokeEvent): IpcResult<LLMAdapterStatusPayload> => {
    validateSender(
      event,
      IPC_CHANNELS.SKILL_CREATOR_GET_ADAPTER_STATUS,
      mainWindow,
    );
    if (!runtimeSkillCreatorService) {
      return validationError(RUNTIME_SKILL_CREATOR_UNAVAILABLE);
    }
    return {
      success: true,
      data: {
        status: runtimeSkillCreatorService.llmAdapterStatus,
        failureReason: runtimeSkillCreatorService.llmAdapterFailureReason,
      },
    };
  },
);
```

#### 4-3. push ワイヤリング追加

`onWorkflowStateSnapshot` ワイヤリング直後に追加：

```typescript
if (runtimeSkillCreatorService) {
  runtimeSkillCreatorService.onAdapterStatusChanged = (status, reason) => {
    if (!mainWindow.isDestroyed()) {
      mainWindow.webContents.send(
        IPC_CHANNELS.SKILL_CREATOR_ADAPTER_STATUS_CHANGED,
        { status, failureReason: reason } satisfies LLMAdapterStatusPayload,
      );
    }
  };
}
```

#### 4-4. `unregisterRuntimeSkillCreatorHandlers` への追加

既存の `ipcMain.removeHandler` 呼び出し群の末尾に追加：

```typescript
ipcMain.removeHandler(IPC_CHANNELS.SKILL_CREATOR_GET_ADAPTER_STATUS);
```

加えて、push コールバックも必ず解除する（メモリリーク/誤通知防止）:

```typescript
runtimeSkillCreatorService.onAdapterStatusChanged = undefined;
```

補足: `unregisterRuntimeSkillCreatorHandlers()` が引数無しの場合は、`registerRuntimeSkillCreatorHandlers` に渡された
`runtimeSkillCreatorService` を module-scope に保持しておき、unregister 時にクリアできるようにする。

---

### ステップ 5: Preload API 追加

**対象ファイル**: `apps/desktop/src/preload/skill-creator-api.ts`

#### 5-1. インポート追加

```typescript
import type { LLMAdapterStatusPayload } from "@repo/shared/types";
```

#### 5-2. `SkillCreatorAPI` インターフェース拡張

`getGovernanceState` の直後に追加：

```typescript
getAdapterStatus: () => Promise<IpcResult<LLMAdapterStatusPayload>>;
onAdapterStatusChanged: (
  callback: (payload: LLMAdapterStatusPayload) => void,
) => () => void;
```

#### 5-3. `skillCreatorAPI` 実装オブジェクトに追加

```typescript
getAdapterStatus: (): Promise<IpcResult<LLMAdapterStatusPayload>> =>
  safeInvoke(IPC_CHANNELS.SKILL_CREATOR_GET_ADAPTER_STATUS),

onAdapterStatusChanged: (
  callback: (payload: LLMAdapterStatusPayload) => void,
): (() => void) =>
  safeOn<LLMAdapterStatusPayload>(
    IPC_CHANNELS.SKILL_CREATOR_ADAPTER_STATUS_CHANGED,
    callback,
  ),
```

---

### ステップ 6: LLMAdapterErrorBanner.tsx 新規作成

**作成先**: `apps/desktop/src/renderer/components/skill/LLMAdapterErrorBanner.tsx`

```tsx
import type { LLMAdapterStatus } from "@repo/shared/types";

export interface LLMAdapterErrorBannerProps {
  status: LLMAdapterStatus;
  failureReason: string | null;
  onOpenSettings?: () => void;
}

function buildMessage(failureReason: string | null): string {
  if (/api key/i.test(failureReason ?? "")) {
    return "APIキーが設定されていないか、無効です。設定画面でAPIキーを確認してください。";
  }
  return `LLMアダプターの初期化に失敗しました: ${failureReason ?? "不明なエラー"}`;
}

export function LLMAdapterErrorBanner({
  status,
  failureReason,
  onOpenSettings,
}: LLMAdapterErrorBannerProps) {
  if (status !== "failed") {
    return null;
  }

  return (
    <div
      role="alert"
      data-testid="llm-adapter-error-banner"
      className="flex items-start justify-between gap-3 rounded-xl border border-[var(--status-error)]/30 bg-[var(--status-error)]/5 px-4 py-3"
    >
      <div className="flex items-start gap-2">
        <span
          className="mt-0.5 shrink-0 text-[var(--status-error)]"
          aria-hidden="true"
        >
          ⚠
        </span>
        <p className="text-sm text-[var(--status-error)]">
          {buildMessage(failureReason)}
        </p>
      </div>
      {onOpenSettings && (
        <button
          type="button"
          onClick={onOpenSettings}
          className="shrink-0 rounded-lg border border-[var(--status-error)]/30 px-3 py-1 text-xs font-medium text-[var(--status-error)] transition-colors duration-200 hover:bg-[var(--status-error)]/10"
        >
          設定を開く
        </button>
      )}
    </div>
  );
}
```

---

### ステップ 7: useLLMAdapterStatus.ts 新規作成

**作成先**: `apps/desktop/src/renderer/components/skill/hooks/useLLMAdapterStatus.ts`

```typescript
import { useState, useEffect } from "react";
import type { LLMAdapterStatus } from "@repo/shared/types";

export interface LLMAdapterStatusState {
  status: LLMAdapterStatus;
  failureReason: string | null;
}

function getSkillCreatorApi() {
  const runtimeWindow = window as Window & {
    electronAPI?: { skillCreator?: unknown };
    skillCreatorAPI?: unknown;
  };
  const bridge =
    runtimeWindow.electronAPI?.skillCreator ?? runtimeWindow.skillCreatorAPI;

  return bridge as
    | {
        getAdapterStatus?: () => Promise<{
          success: boolean;
          data?: { status: LLMAdapterStatus; failureReason: string | null };
        }>;
        onAdapterStatusChanged?: (
          cb: (payload: {
            status: LLMAdapterStatus;
            failureReason: string | null;
          }) => void,
        ) => () => void;
      }
    | undefined;
}

export function useLLMAdapterStatus(): LLMAdapterStatusState {
  const [state, setState] = useState<LLMAdapterStatusState>({
    status: "initializing",
    failureReason: null,
  });

  useEffect(() => {
    const api = getSkillCreatorApi();
    if (!api) return;

    let cancelled = false;

    // pull: マウント時に現在の状態を取得（失敗時は初期状態維持）
    const pull = api.getAdapterStatus?.();
    if (pull) {
      void pull
        .then((result) => {
          if (cancelled) return;
          if (result.success && result.data) {
            setState({
              status: result.data.status,
              failureReason: result.data.failureReason,
            });
          }
        })
        .catch(() => {
          // graceful degradation: 初期状態維持
        });
    }

    // push: 状態変化を購読（API が無い場合は no-op）
    const unsubscribe =
      api.onAdapterStatusChanged?.((payload) => {
        if (cancelled) return;
        setState({
          status: payload.status,
          failureReason: payload.failureReason,
        });
      }) ?? (() => {});

    return () => {
      cancelled = true;
      try {
        unsubscribe();
      } catch {
        // unsubscribe は例外を投げない前提だが、念のため握りつぶす
      }
    };
  }, []);

  return state;
}
```

---

### ステップ 8: SkillLifecyclePanel 統合

**対象ファイル**: `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx`

#### 8-1. インポート追加

既存のコンポーネントインポート群に追加：

```typescript
import { LLMAdapterErrorBanner } from "./LLMAdapterErrorBanner";
import { useLLMAdapterStatus } from "./hooks/useLLMAdapterStatus";
```

#### 8-2. フック呼び出し追加

既存フック群の末尾に追加（`setHandoffGuidance` の後）：

```typescript
const adapterStatus = useLLMAdapterStatus();
```

#### 8-3. JSX への組み込み

`SkillLifecyclePanel` の return ブロック内、最上部のコンテンツラッパー直後に追加：

```tsx
<LLMAdapterErrorBanner
  status={adapterStatus.status}
  failureReason={adapterStatus.failureReason}
  onOpenSettings={onOpenWizard}
/>
```

---

## テスト GREEN 確認

実装完了後に以下を実行し、全テストが PASS することを確認：

```bash
# Phase 4 で作成したテスト
pnpm --filter @repo/desktop vitest run src/main/ipc/__tests__/creatorHandlers.adapterStatus.test.ts
pnpm --filter @repo/desktop vitest run src/renderer/components/skill/__tests__/LLMAdapterErrorBanner.test.tsx
pnpm --filter @repo/desktop vitest run src/renderer/components/skill/hooks/__tests__/useLLMAdapterStatus.test.ts

# 型チェック
pnpm --filter @repo/desktop typecheck
```

## 多角的チェック観点（AIが判断）

| 観点             | 確認内容                                                                       |
| ---------------- | ------------------------------------------------------------------------------ |
| IPC 4層完全性    | channels.ts / ALLOWED リスト / handler / preload API の 4 層が全て揃っているか |
| セキュリティ     | `validateIpcSender` がハンドラに適用されているか                               |
| メモリリーク防止 | `cancelled = true` + `unsubscribe()` がクリーンアップで呼ばれているか          |
| 型安全           | `satisfies LLMAdapterStatusPayload` で push payload の型が保証されているか     |

## サブタスク管理

| ID     | 内容                                 | ステータス |
| ------ | ------------------------------------ | ---------- |
| ST-5-1 | shared 型追加                        | 未実施     |
| ST-5-2 | channels.ts 修正（2チャネル）        | 未実施     |
| ST-5-3 | Facade コールバック追加              | 未実施     |
| ST-5-4 | IPC ハンドラ追加 + push ワイヤリング | 未実施     |
| ST-5-5 | Preload API 追加                     | 未実施     |
| ST-5-6 | LLMAdapterErrorBanner.tsx 作成       | 未実施     |
| ST-5-7 | useLLMAdapterStatus.ts 作成          | 未実施     |
| ST-5-8 | SkillLifecyclePanel 統合             | 未実施     |
| ST-5-9 | テスト GREEN 確認                    | 未実施     |

## 成果物

| 成果物                    | パス                                                                              |
| ------------------------- | --------------------------------------------------------------------------------- |
| shared 型追加             | `packages/shared/src/types/skillCreator.ts`（変更）                               |
| shared 型 export 追加     | `packages/shared/src/types/index.ts`（変更）                                      |
| channels.ts 修正          | `apps/desktop/src/preload/channels.ts`（変更）                                    |
| Facade コールバック追加   | `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`（変更）     |
| IPC ハンドラ追加          | `apps/desktop/src/main/ipc/creatorHandlers.ts`（変更）                            |
| Preload API 追加          | `apps/desktop/src/preload/skill-creator-api.ts`（変更）                           |
| LLMAdapterErrorBanner.tsx | `apps/desktop/src/renderer/components/skill/LLMAdapterErrorBanner.tsx`（新規）    |
| useLLMAdapterStatus.ts    | `apps/desktop/src/renderer/components/skill/hooks/useLLMAdapterStatus.ts`（新規） |
| SkillLifecyclePanel 変更  | `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx`（変更）      |
| テスト GREEN 確認ログ     | `outputs/phase-5/test-green-confirmation.md`                                      |

## 完了条件

- [ ] 全 8 実装ステップ（ステップ1〜8）が完了している
- [ ] Phase 4 で作成した 3 つのテストファイルが全て PASS している
- [ ] `pnpm --filter @repo/desktop typecheck` が通る
- [ ] `pnpm lint` でエラーなし

## タスク100%実行確認【必須】

- [ ] 上記「完了条件」を全て達成した
- [ ] 成果物を `outputs/phase-5/` に配置した
- [ ] `artifacts.json` の Phase 5 を `completed` に更新した

## 統合テスト連携

本 Phase のテスト成果物は後続 Phase の品質確認・ゲート判定に使用される。

| Phase   | 連携内容                                  |
| ------- | ----------------------------------------- |
| Phase 5 | テスト GREEN を確認してから実装完了とする |
| Phase 9 | 品質保証フェーズで最終確認する            |

## 次Phase

Phase 5 完了後 → [Phase 6: テスト拡充](phase-06-test-expansion.md) へ進む
