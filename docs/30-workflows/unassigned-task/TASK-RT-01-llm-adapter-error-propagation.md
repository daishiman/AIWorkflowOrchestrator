# TASK-RT-01: LLMAdapter 初期化エラーの UI 通知・状態公開

## メタ情報

```yaml
task_id: TASK-RT-01
task_name: LLMAdapter 初期化エラーの UI 通知・状態公開
category: 機能追加 / UX改善
target_feature: Skill Creator — LLMAdapter エラー通知
priority: 高
scale: 中規模
status: 未実施
source_phase: Phase 12（実動作調査で判明）
created_date: 2026-04-04
dependencies: []
spec_path: docs/30-workflows/unassigned-task/TASK-RT-01-llm-adapter-error-propagation.md
```

| 項目       | 内容   |
| ---------- | ------ |
| 優先度     | 高     |
| 規模       | 中規模 |
| ステータス | 未実施 |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

Skill Creator Agent SDK Lane（TASK-SDK-01〜08）の Phase 1-12 は完了済みである。
しかし、実動作調査によって **LLMAdapter 初期化失敗時のエラー伝播経路が未整備** であることが判明した。

`RuntimeSkillCreatorFacade` には以下が既に実装されている（コード確認済み）：

| 実装済み項目                                              | ファイル・行                                        |
| --------------------------------------------------------- | --------------------------------------------------- |
| `_llmAdapterStatus: LLMAdapterStatus` フィールド          | `RuntimeSkillCreatorFacade.ts:146`                  |
| `_llmAdapterFailureReason: string \| null` フィールド     | `RuntimeSkillCreatorFacade.ts:147`                  |
| `setLLMAdapter(adapter)` — status を "ready" にする       | `RuntimeSkillCreatorFacade.ts:216-220`              |
| `setLLMAdapterFailed(reason)` — status を "failed" にする | `RuntimeSkillCreatorFacade.ts:226-229`              |
| `llmAdapterStatus` getter                                 | `RuntimeSkillCreatorFacade.ts:198-200`              |
| `llmAdapterFailureReason` getter                          | `RuntimeSkillCreatorFacade.ts:203-205`              |
| `LLMAdapterStatus` 型定義                                 | `packages/shared/src/types/skillCreator.ts:338`     |
| `SkillCreatorErrorCode` 型定義                            | `packages/shared/src/types/skillCreator.ts:341-344` |
| 初期化失敗時の `setLLMAdapterFailed()` 呼び出し           | `apps/desktop/src/main/ipc/index.ts:1060-1063`      |

しかし現状、`setLLMAdapterFailed()` が呼び出された後の **Renderer 側への通知パス** が存在しない。
`plan()` メソッド内でのみ `_llmAdapterStatus === "failed"` チェックが行われているが、
ユーザーが `plan()` を呼ぶ前の段階でエラーを認識する手段がない。

### 1.2 問題点・課題

1. **IPC 経由の状態公開なし**: `RuntimeSkillCreatorFacade.llmAdapterStatus` の getter は存在するが、Renderer から IPC 経由で取得できるチャネルが未定義
2. **UIへのエラー通知が欠如**: `LLMAdapterFactory.getAdapter()` が `API key not found for provider` 等のエラーを throw しても、Main プロセス内で catch されるだけで Renderer 側に通知されない
3. **無音の失敗**: スキル作成フローを開始しようとすると、バックエンドでは初期化失敗状態なのに UI は「初期化中」または「準備完了」のまま固まる
4. **アクション不能**: ユーザーはリトライ・APIキー設定への遷移・サポート問い合わせのいずれも実行できない

### 1.3 放置した場合の影響

- **即時**: ユーザーが API キー未設定や誤設定のままスキル作成を試みると、操作不能な状態に陥る（UX 破損）
- **短期**: サポート問い合わせが増加し、「何も起きない」という報告が多発する
- **中期**: エラー状態への対処方法が不明なため、ユーザーがアプリを放棄するリスクがある
- **長期**: TASK-RT-04（APIキー設定UI）との接続点が未定義のまま進むと、後工程で大幅なリファクタリングが必要になる

---

## 2. 何を達成するか（What）

### 2.1 目的

LLMAdapter 初期化が失敗した場合に、そのエラー状態を IPC 経由で Renderer に即時公開し、
ユーザーが次のアクション（APIキー設定・リトライ・問い合わせ）を取れるよう UI に適切なエラー表示を追加する。

### 2.2 最終ゴール

- `LLMAdapterFactory.getAdapter()` が失敗したとき、`SkillLifecyclePanel` にエラーバナーが表示される
- エラーメッセージが actionable（「APIキーを設定してください」など具体的な操作指示を含む）であること
- UI は `"ready"` / `"initializing"` / `"failed"` の3状態を適切に表示し切り替えられること
- IPC チャネル `skill-creator:get-adapter-status` によって Renderer がアダプタ状態を pull できること
- `setLLMAdapterFailed()` が呼ばれたタイミングで Renderer に push 通知が届くこと（`skill-creator:adapter-status-changed`）

### 2.3 スコープ

#### 含むもの

- IPC 経由でのアダプタ状態公開（新規チャネル `skill-creator:get-adapter-status` の追加）
- Push 通知チャネル `skill-creator:adapter-status-changed` の追加
- `RuntimeSkillCreatorFacade` への `onAdapterStatusChanged` コールバック追加
- `creatorHandlers.ts` への IPC ハンドラ追加
- `skill-creator-api.ts` への `getAdapterStatus()` / `onAdapterStatusChanged()` メソッド追加
- `LLMAdapterErrorBanner.tsx` コンポーネント（新規）
- `useLLMAdapterStatus.ts` フック（新規）
- `SkillLifecyclePanel.tsx` へのエラー表示統合
- 単体テスト・統合テストの追加

#### 含まないもの

- APIキー設定UIの実装（`TASK-RT-04` の責務）
- スタブ応答のエラー変換ロジック（`TASK-RT-02` の責務）
- LLMAdapterFactory 自体の retry logic（`task-ut-rt-01-llm-adapter-retry-logic-001.md`）
- `SkillCreateWizard` への統合（優先度を下げ、`SkillLifecyclePanel` のみを初回スコープとする）

### 2.4 成果物

| 成果物                   | パス                                                                                  | 状態 |
| ------------------------ | ------------------------------------------------------------------------------------- | ---- |
| IPC チャネル定義追加     | `apps/desktop/src/preload/channels.ts`                                                | 修正 |
| IPC ハンドラ追加         | `apps/desktop/src/main/ipc/creatorHandlers.ts`                                        | 修正 |
| Facade コールバック追加  | `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`                 | 修正 |
| Preload API 追加         | `apps/desktop/src/preload/skill-creator-api.ts`                                       | 修正 |
| shared 型追加            | `packages/shared/src/types/skillCreator.ts`                                           | 修正 |
| エラー表示コンポーネント | `apps/desktop/src/renderer/components/skill/LLMAdapterErrorBanner.tsx`                | 新規 |
| アダプタ状態フック       | `apps/desktop/src/renderer/components/skill/hooks/useLLMAdapterStatus.ts`             | 新規 |
| SkillLifecyclePanel 統合 | `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx`                  | 修正 |
| 単体テスト               | `apps/desktop/src/main/ipc/__tests__/creatorHandlers.adapterStatus.test.ts`           | 新規 |
| 統合テスト               | `apps/desktop/src/renderer/components/skill/__tests__/LLMAdapterErrorBanner.test.tsx` | 新規 |

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- Node.js 20.x 以上、pnpm 9.x 以上
- Electron 開発環境が起動可能な状態
- `ANTHROPIC_API_KEY` 環境変数が **未設定** または **無効な値** の状態でテスト可能なこと
- TypeScript 5.x（strict モード）

### 3.2 依存タスク

なし（このタスクは独立して実施可能）

ただし、以下のタスクとの協調が必要：

- `TASK-RT-04`（APIキー設定UI）: エラー表示から設定画面への遷移リンクを追加する場合、インターフェイスを事前に合意すること

### 3.3 必要な知識

| 知識領域          | 詳細                                                                                    |
| ----------------- | --------------------------------------------------------------------------------------- |
| Electron IPC      | `ipcMain.handle`（invoke/pull）/ `webContents.send`（on/push）による Main↔Renderer 通信 |
| TypeScript 型設計 | `LLMAdapterStatus` の discriminated union、型ガード                                     |
| React / Zustand   | エラー状態のストア管理、`useEffect` による IPC 購読                                     |
| Tailwind CSS      | エラーバナーのスタイリング（既存 `ErrorBanner.tsx` を参考）                             |

### 3.4 推奨アプローチ

**Pull + Push の組み合わせ**:

1. マウント時に `skill-creator:get-adapter-status` を invoke して初期状態を取得（pull）
2. `skill-creator:adapter-status-changed` を購読して状態変化をリアルタイム受信（push）
3. Facade の `setLLMAdapterFailed()` / `setLLMAdapter()` 呼び出し時に `onAdapterStatusChanged` コールバック経由で push 通知

---

## 4. 実行手順

### Phase 構成

| Phase   | 内容                                  | 実行形態       |
| ------- | ------------------------------------- | -------------- |
| Phase 1 | Main 側 IPC 基盤実装                  | 直列           |
| Phase 2 | Renderer 側フック・コンポーネント実装 | Phase 1 完了後 |
| Phase 3 | SkillLifecyclePanel 統合              | Phase 2 完了後 |
| Phase 4 | テスト追加                            | Phase 3 完了後 |

---

### Phase 1: Main 側 IPC 基盤実装

#### 目的

IPC チャネルを定義し、Main 側のハンドラとコールバックを実装する。

#### 手順

**Step 1-1: `packages/shared/src/types/skillCreator.ts` に型を追加**

`LLMAdapterStatus` 型定義（line 338）の直下に以下を追加する：

```typescript
/** LLMAdapter ステータス IPC レスポンス payload (TASK-RT-01) */
export interface LLMAdapterStatusPayload {
  status: LLMAdapterStatus;
  failureReason: string | null;
}
```

**Step 1-2: `apps/desktop/src/preload/channels.ts` にチャネル追加**

`SKILL_CREATOR_GET_GOVERNANCE_STATE` 行（line 353）の直下（コメント `// TASK-P0-09` の後）に追加：

```typescript
// LLMAdapter ステータス (TASK-RT-01)
SKILL_CREATOR_GET_ADAPTER_STATUS: "skill-creator:get-adapter-status",
SKILL_CREATOR_ADAPTER_STATUS_CHANGED: "skill-creator:adapter-status-changed",
```

`ALLOWED_INVOKE_CHANNELS` 配列（`IPC_CHANNELS.SKILL_CREATOR_GET_GOVERNANCE_STATE` の後）に追加：

```typescript
IPC_CHANNELS.SKILL_CREATOR_GET_ADAPTER_STATUS,
```

`ALLOWED_ON_CHANNELS` 配列（`IPC_CHANNELS.SKILL_CREATOR_WORKFLOW_STATE_CHANGED` の後）に追加：

```typescript
IPC_CHANNELS.SKILL_CREATOR_ADAPTER_STATUS_CHANGED,
```

**Step 1-3: `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts` にコールバック追加**

クラス本体の public プロパティ群に以下を追加（`onWorkflowStateSnapshot` の隣）：

```typescript
/** LLMAdapter ステータス変化時コールバック (TASK-RT-01) */
onAdapterStatusChanged?: (
  status: LLMAdapterStatus,
  reason: string | null,
) => void;
```

`setLLMAdapter()` メソッド（line 216-220）の末尾に呼び出しを追加：

```typescript
setLLMAdapter(adapter: ILLMAdapter): void {
  this.llmAdapter = adapter;
  this._llmAdapterStatus = "ready";
  this._llmAdapterFailureReason = null;
  this.onAdapterStatusChanged?.("ready", null);  // 追加
}
```

`setLLMAdapterFailed()` メソッド（line 226-229）の末尾に呼び出しを追加：

```typescript
setLLMAdapterFailed(reason: string): void {
  this._llmAdapterStatus = "failed";
  this._llmAdapterFailureReason = reason;
  this.onAdapterStatusChanged?.("failed", reason);  // 追加
}
```

**Step 1-4: `apps/desktop/src/main/ipc/creatorHandlers.ts` にハンドラ追加**

`registerRuntimeSkillCreatorHandlers` 関数内、`onWorkflowStateSnapshot` ワイヤリング直後（line 124 付近）に push 通知ワイヤリングを追加：

```typescript
if (runtimeSkillCreatorService) {
  runtimeSkillCreatorService.onAdapterStatusChanged = (status, reason) => {
    if (!mainWindow.isDestroyed()) {
      mainWindow.webContents.send(
        IPC_CHANNELS.SKILL_CREATOR_ADAPTER_STATUS_CHANGED,
        { status, failureReason: reason },
      );
    }
  };
}
```

`ipcMain.handle(IPC_CHANNELS.SKILL_CREATOR_GET_GOVERNANCE_STATE, ...)` の直後（line 587 付近）に以下のハンドラを追加：

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

`LLMAdapterStatusPayload` 型を import に追加：

```typescript
import type {
  // ... 既存 ...
  LLMAdapterStatusPayload,
} from "@repo/shared/types";
```

`unregisterRuntimeSkillCreatorHandlers` 関数末尾に追加：

```typescript
ipcMain.removeHandler(IPC_CHANNELS.SKILL_CREATOR_GET_ADAPTER_STATUS);
```

**Step 1-5: `apps/desktop/src/preload/skill-creator-api.ts` にメソッド追加**

`SkillCreatorAPI` インターフェース（`getGovernanceState` の後）に追加：

```typescript
/**
 * LLMAdapter の現在のステータスを取得する (TASK-RT-01)
 */
getAdapterStatus: () => Promise<IpcResult<LLMAdapterStatusPayload>>;

/**
 * LLMAdapter ステータス変化イベントを購読する (TASK-RT-01)
 * @returns unsubscribe 関数
 */
onAdapterStatusChanged: (
  callback: (payload: LLMAdapterStatusPayload) => void,
) => () => void;
```

`skillCreatorAPI` オブジェクト（`getGovernanceState` 実装の後）に追加：

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

`LLMAdapterStatusPayload` を import に追加：

```typescript
import type {
  // ... 既存 ...
  LLMAdapterStatusPayload,
} from "@repo/shared/types";
```

#### 成果物

- `packages/shared/src/types/skillCreator.ts`（修正）
- `apps/desktop/src/preload/channels.ts`（修正）
- `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`（修正）
- `apps/desktop/src/main/ipc/creatorHandlers.ts`（修正）
- `apps/desktop/src/preload/skill-creator-api.ts`（修正）

#### 完了条件

- TypeScript 型エラーなし（`pnpm --filter @repo/desktop typecheck`）
- `pnpm --filter @repo/shared typecheck` が通る

---

### Phase 2: Renderer 側フック・コンポーネント実装

#### 目的

Renderer 側で LLMAdapter ステータスを管理するフックと、エラーを表示するコンポーネントを実装する。

#### 手順

**Step 2-1: `LLMAdapterErrorBanner.tsx` を新規作成**

ファイル: `apps/desktop/src/renderer/components/skill/LLMAdapterErrorBanner.tsx`

```typescript
/**
 * @file LLMAdapterErrorBanner.tsx
 * @description LLMAdapter 初期化エラーを actionable な形で表示するバナーコンポーネント
 * TASK-RT-01
 */

import { memo } from "react";
import type { LLMAdapterStatus } from "@repo/shared/types";

export interface LLMAdapterErrorBannerProps {
  status: LLMAdapterStatus;
  failureReason: string | null;
  onOpenSettings?: () => void;
}

export const LLMAdapterErrorBanner = memo<LLMAdapterErrorBannerProps>(
  ({ status, failureReason, onOpenSettings }) => {
    if (status !== "failed") return null;

    const message = failureReason?.includes("API key")
      ? "APIキーが設定されていないか、無効です。設定画面でAPIキーを確認してください。"
      : `LLMアダプターの初期化に失敗しました: ${failureReason ?? "不明なエラー"}`;

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
          <div>
            <p className="text-xs font-medium text-[var(--status-error)]">
              LLMアダプター初期化エラー
            </p>
            <p className="text-sm text-[var(--status-error)]">{message}</p>
          </div>
        </div>
        {onOpenSettings ? (
          <button
            type="button"
            onClick={onOpenSettings}
            className="shrink-0 rounded-lg border border-[var(--status-error)]/30 px-3 py-1 text-xs font-medium text-[var(--status-error)] transition-colors duration-200 hover:bg-[var(--status-error)]/10"
          >
            設定を開く
          </button>
        ) : null}
      </div>
    );
  },
);

LLMAdapterErrorBanner.displayName = "LLMAdapterErrorBanner";
```

**Step 2-2: `useLLMAdapterStatus.ts` フックを新規作成**

ファイル: `apps/desktop/src/renderer/components/skill/hooks/useLLMAdapterStatus.ts`

このフックは **pull（マウント時に初期状態取得）+ push（変化時にリアルタイム更新）** の組み合わせで実装する。

```typescript
/**
 * @file useLLMAdapterStatus.ts
 * @description LLMAdapter ステータスを pull + push で管理するフック (TASK-RT-01)
 */

import { useState, useEffect } from "react";
import type { LLMAdapterStatus } from "@repo/shared/types";

export interface LLMAdapterStatusState {
  status: LLMAdapterStatus;
  failureReason: string | null;
}

type SkillCreatorApi = {
  getAdapterStatus?: () => Promise<{
    success: boolean;
    data?: LLMAdapterStatusState;
    error?: string;
  }>;
  onAdapterStatusChanged?: (
    callback: (payload: LLMAdapterStatusState) => void,
  ) => () => void;
};

function getSkillCreatorApi(): SkillCreatorApi {
  const w = window as Window & {
    electronAPI?: { skillCreator?: SkillCreatorApi };
  };
  return w.electronAPI?.skillCreator ?? {};
}

/**
 * LLMAdapter ステータスを取得・購読するフック
 *
 * - マウント時: `getAdapterStatus` を invoke して初期状態を pull
 * - 以降: `onAdapterStatusChanged` イベントを subscribe して状態変化を push 受信
 *
 * @returns { status, failureReason } — status は "ready" | "initializing" | "failed"
 */
export function useLLMAdapterStatus(): LLMAdapterStatusState {
  const [state, setState] = useState<LLMAdapterStatusState>({
    status: "initializing",
    failureReason: null,
  });

  useEffect(() => {
    const api = getSkillCreatorApi();
    let cancelled = false;

    // Pull: 初期状態を取得
    if (api.getAdapterStatus) {
      void api.getAdapterStatus().then((result) => {
        if (cancelled) return;
        if (result.success && result.data) {
          setState(result.data);
        }
      });
    }

    // Push: 変化を購読
    const unsubscribe = api.onAdapterStatusChanged?.(
      (payload: LLMAdapterStatusState) => {
        if (!cancelled) {
          setState(payload);
        }
      },
    );

    return () => {
      cancelled = true;
      unsubscribe?.();
    };
  }, []);

  return state;
}
```

#### 成果物

- `apps/desktop/src/renderer/components/skill/LLMAdapterErrorBanner.tsx`（新規）
- `apps/desktop/src/renderer/components/skill/hooks/useLLMAdapterStatus.ts`（新規）

#### 完了条件

- TypeScript 型エラーなし
- コンポーネントが Storybook または手動確認でレンダリングされること

---

### Phase 3: SkillLifecyclePanel 統合

#### 目的

`SkillLifecyclePanel` の描画領域先頭に `LLMAdapterErrorBanner` を表示する。

#### 手順

**Step 3-1: `SkillLifecyclePanel.tsx` に import 追加**

```typescript
import { LLMAdapterErrorBanner } from "./LLMAdapterErrorBanner";
import { useLLMAdapterStatus } from "./hooks/useLLMAdapterStatus";
```

**Step 3-2: フック呼び出しを追加**

`SkillLifecyclePanel` コンポーネント関数内、既存のフック呼び出しの最後（`setHandoffGuidance` の後）に追加：

```typescript
const adapterStatus = useLLMAdapterStatus();
```

**Step 3-3: JSX への統合**

`SkillLifecyclePanel` の return ブロック内、最上部（全コンテンツのラッパーの直後）に追加。
既存の返却ロジックを確認し、適切な場所（スキル一覧や入力フォームの上部）に挿入する：

```tsx
<LLMAdapterErrorBanner
  status={adapterStatus.status}
  failureReason={adapterStatus.failureReason}
  onOpenSettings={onOpenWizard}
/>
```

#### 成果物

- `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx`（修正）

#### 完了条件

- API キー未設定状態でアプリを起動すると、`SkillLifecyclePanel` 上部にエラーバナーが表示される
- エラーバナーの「設定を開く」ボタンが機能する（`onOpenWizard` / API キー設定へ遷移）
- 正常状態（API キー設定済み）ではバナーが表示されない

---

### Phase 4: テスト追加

#### 目的

単体テストと統合テストを追加して品質を保証する。

#### 手順

**Step 4-1: IPC ハンドラ単体テスト**

ファイル: `apps/desktop/src/main/ipc/__tests__/creatorHandlers.adapterStatus.test.ts`

テストシナリオ：

- `runtimeSkillCreatorService` が未定義の場合、`RUNTIME_SKILL_CREATOR_UNAVAILABLE` エラーを返す
- `llmAdapterStatus === "ready"` の場合、`{ success: true, data: { status: "ready", failureReason: null } }` を返す
- `llmAdapterStatus === "failed"` の場合、`{ success: true, data: { status: "failed", failureReason: "..." } }` を返す
- 送信元の BrowserWindow 検証が機能する（不正な送信元は弾かれる）

**Step 4-2: LLMAdapterErrorBanner コンポーネントテスト**

ファイル: `apps/desktop/src/renderer/components/skill/__tests__/LLMAdapterErrorBanner.test.tsx`

テストシナリオ：

- `status === "failed"` かつ `failureReason` に "API key" が含まれる場合、日本語の案内メッセージが表示される
- `status === "failed"` で `onOpenSettings` が渡された場合、「設定を開く」ボタンが表示される
- `status === "ready"` の場合、コンポーネントが `null` をレンダリングする（非表示）
- `status === "initializing"` の場合、コンポーネントが `null` をレンダリングする（非表示）
- `data-testid="llm-adapter-error-banner"` が `role="alert"` と共に設定されている

**Step 4-3: `useLLMAdapterStatus` フックテスト**

既存のフックテストパターン（`apps/desktop/src/renderer/components/skill/hooks/` 内）に合わせて実装。

テストシナリオ：

- 初期状態が `{ status: "initializing", failureReason: null }` であること
- `getAdapterStatus` が成功した場合、返却値で状態が更新される
- `onAdapterStatusChanged` コールバックが呼ばれたとき、状態が更新される
- アンマウント時に unsubscribe が呼ばれること

#### 成果物

- `apps/desktop/src/main/ipc/__tests__/creatorHandlers.adapterStatus.test.ts`（新規）
- `apps/desktop/src/renderer/components/skill/__tests__/LLMAdapterErrorBanner.test.tsx`（新規）
- `apps/desktop/src/renderer/components/skill/hooks/__tests__/useLLMAdapterStatus.test.ts`（新規、任意）

#### 完了条件

- `pnpm --filter @repo/desktop test` がすべて pass する
- 新規テストがカバレッジに寄与している

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] `ANTHROPIC_API_KEY` 未設定状態でアプリ起動 → `SkillLifecyclePanel` にエラーバナー表示
- [ ] エラーバナーに actionable メッセージが含まれる（「APIキーを設定してください」等）
- [ ] 「設定を開く」ボタンが機能する
- [ ] `ANTHROPIC_API_KEY` 正常設定状態ではバナーが表示されない
- [ ] `skill-creator:get-adapter-status` を invoke するとアダプタ状態が返る

### 品質要件

- [ ] `pnpm --filter @repo/desktop typecheck` が通る
- [ ] `pnpm --filter @repo/shared typecheck` が通る
- [ ] `pnpm --filter @repo/desktop test` が pass する
- [ ] ESLint エラーなし

### ドキュメント要件

- [ ] 新規ファイルに JSDoc コメントを記述
- [ ] IPC チャネル名がコメントで説明されている

---

## 6. 検証方法

### テストケース

| ID   | シナリオ                                                                | 期待動作                                                                            |
| ---- | ----------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| TC-1 | `ANTHROPIC_API_KEY` 未設定でアプリ起動                                  | エラーバナーが SkillLifecyclePanel 上部に表示される                                 |
| TC-2 | `ANTHROPIC_API_KEY` 正常設定でアプリ起動                                | バナーは表示されない                                                                |
| TC-3 | バナーの「設定を開く」をクリック                                        | APIキー設定画面が開く                                                               |
| TC-4 | DevTools で `window.electronAPI.skillCreator.getAdapterStatus()` を実行 | `{ success: true, data: { status: "...", failureReason: ... } }` が返る             |
| TC-5 | 正常 API キー設定後にリトライ                                           | バナーが消える（Facade が `setLLMAdapter` を呼び出しステータスが "ready" に変わる） |

### 検証手順

1. `pnpm --filter @repo/desktop dev` でアプリ起動
2. `.env` または環境変数で `ANTHROPIC_API_KEY` を未設定または無効値にする
3. SkillLifecyclePanel を開き、エラーバナーの表示を確認
4. 「設定を開く」ボタンをクリックして遷移を確認
5. 正常な API キーを設定して再起動し、バナーが消えることを確認

---

## 7. リスクと対策

| リスク                                                | 影響度 | 発生確率 | 対策                                                                         |
| ----------------------------------------------------- | ------ | -------- | ---------------------------------------------------------------------------- |
| Push 通知のリスナーリーク                             | 中     | 低       | `useEffect` クリーンアップで確実に unsubscribe する                          |
| Pull と Push の競合（古い pull 結果が push を上書き） | 中     | 低       | `cancelled` フラグ（AbortController パターン）で pull をキャンセル可能にする |
| `SkillLifecyclePanel` の既存テストが壊れる            | 中     | 中       | `window.electronAPI.skillCreator.getAdapterStatus` を適切にモックする        |
| channels.ts の ALLOWED リスト追加漏れ                 | 高     | 中       | Phase 1 完了後に `pnpm typecheck` + preload テストで確認                     |

---

## 8. 参照情報

### 関連コード

- `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts` — Facade 本体（line 146-229 が LLMAdapter 状態管理）
- `apps/desktop/src/main/ipc/creatorHandlers.ts` — 既存 IPC ハンドラ群（line 109-605）
- `apps/desktop/src/preload/skill-creator-api.ts` — Preload API（`safeInvoke` / `safeOn` パターン参照）
- `apps/desktop/src/preload/channels.ts` — チャネル定義と ALLOWED リスト
- `apps/desktop/src/renderer/components/skill/ErrorBanner.tsx` — 既存エラーバナーコンポーネント（スタイル参考）
- `apps/desktop/src/renderer/components/atoms/AdapterStatusBadge/index.tsx` — `LLMAdapterStatus` を表示する既存コンポーネント（ApiKeysSection で使用済み）

### 関連タスク

- `TASK-RT-04` — APIキー設定UI（エラーバナーの遷移先）
- `task-ut-rt-01-execute-improve-adapter-guard-001.md` — execute/improve のアダプタガード
- `task-ut-rt-01-llm-adapter-retry-logic-001.md` — LLMAdapterFactory の retry logic

### 既知の落とし穴

- **P34 (Lazy Injection)**: `LLMAdapter` は非同期初期化のため、コンストラクタで注入できない。`setLLMAdapter()` の Setter Injection パターンが採用されている（変更不要）
- `safeOn` は `ALLOWED_ON_CHANNELS` に含まれないチャネルを拒否する。追加漏れに注意

---

## 9. 備考

### 実装状況調査結果（2026-04-04）

コード調査（`apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts` 等）により、以下が確認済み：

**実装済み（変更不要）:**

- `RuntimeSkillCreatorFacade` の `_llmAdapterStatus` / `setLLMAdapterFailed()` 等
- `ipc/index.ts` での `LLMAdapterFactory.getAdapter()` 失敗時の `setLLMAdapterFailed()` 呼び出し
- `packages/shared/src/types/skillCreator.ts` の `LLMAdapterStatus` 型

**未実装（このタスクで対応):**

- IPC チャネル `skill-creator:get-adapter-status` / `skill-creator:adapter-status-changed`
- `creatorHandlers.ts` のハンドラ
- `Facade.onAdapterStatusChanged` コールバック
- `skill-creator-api.ts` の `getAdapterStatus()` / `onAdapterStatusChanged()`
- `LLMAdapterErrorBanner.tsx` コンポーネント
- `useLLMAdapterStatus.ts` フック
- `SkillLifecyclePanel.tsx` への統合
- テスト群

### GitHub Issue

https://github.com/daishiman/AIWorkflowOrchestrator/issues/1879（管理上クローズ、未実施）
