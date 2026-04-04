# Phase 2: 設計 - LLMAdapter 初期化エラー UI 通知・状態公開

## メタ情報

| 項目    | 値                                            |
| ------- | --------------------------------------------- |
| Phase   | 2 - 設計                                      |
| 機能名  | task-rt-01-llm-adapter-error-propagation      |
| 作成日  | 2026-04-04                                    |
| 前Phase | [Phase 1: 要件定義](phase-01-requirements.md) |

## 目的

Phase 1 で確定した受入条件を実装可能な設計に落とし込む。
IPC 4 層（チャネル定義・ALLOWED リスト・ハンドラ・Preload API）の対応表を確定し、
Renderer 側コンポーネント・フックの責務境界を定める。

## 実行タスク

- **IPC 4層設計**: 新規チャネルの4層全ての対応表を作成する
- **Facade コールバック設計**: `onAdapterStatusChanged` の型と呼び出しタイミングを定義する
- **コンポーネント設計**: `LLMAdapterErrorBanner` のProps・表示ロジックを定義する
- **フック設計**: `useLLMAdapterStatus` の pull+push 状態管理フローを定義する
- **型設計**: `LLMAdapterStatusPayload` 型の定義
- **型互換性検証テーブル（下書き）**: Phase 3 で最終確認する

## 参照資料

| 資料名                    | パス                                                                          | 用途                           |
| ------------------------- | ----------------------------------------------------------------------------- | ------------------------------ |
| IPC 4層整合ガイド         | `.claude/skills/task-specification-creator/references/phase-template-core.md` | IPC 4層チェック                |
| 既存 channels.ts          | `apps/desktop/src/preload/channels.ts`                                        | チャネル追加先の構造確認       |
| 既存 creatorHandlers.ts   | `apps/desktop/src/main/ipc/creatorHandlers.ts`                                | ハンドラ追加パターン           |
| 既存 skill-creator-api.ts | `apps/desktop/src/preload/skill-creator-api.ts`                               | `safeInvoke`/`safeOn` パターン |
| 既存 ErrorBanner.tsx      | `apps/desktop/src/renderer/components/skill/ErrorBanner.tsx`                  | スタイルパターン参照           |
| shared 型定義             | `packages/shared/src/types/skillCreator.ts`                                   | 型追加先                       |
| shared 型 export 集約     | `packages/shared/src/types/index.ts`                                          | `@repo/shared/types` 再export  |

## IPC 4層設計

### 新規チャネル: `skill-creator:get-adapter-status`（invoke/pull）

| 層                | 対象ファイル                                    | 追加内容                                                                                |
| ----------------- | ----------------------------------------------- | --------------------------------------------------------------------------------------- |
| 1. チャネル定数   | `apps/desktop/src/preload/channels.ts`          | `SKILL_CREATOR_GET_ADAPTER_STATUS: "skill-creator:get-adapter-status"`                  |
| 2. ALLOWED リスト | `apps/desktop/src/preload/channels.ts`          | `ALLOWED_INVOKE_CHANNELS` 配列に `IPC_CHANNELS.SKILL_CREATOR_GET_ADAPTER_STATUS` を追加 |
| 3. ハンドラ登録   | `apps/desktop/src/main/ipc/creatorHandlers.ts`  | `ipcMain.handle(IPC_CHANNELS.SKILL_CREATOR_GET_ADAPTER_STATUS, ...)`                    |
| 4. Preload API    | `apps/desktop/src/preload/skill-creator-api.ts` | `getAdapterStatus: () => safeInvoke(IPC_CHANNELS.SKILL_CREATOR_GET_ADAPTER_STATUS)`     |

### 新規チャネル: `skill-creator:adapter-status-changed`（on/push）

| 層                | 対象ファイル                                    | 追加内容                                                                                        |
| ----------------- | ----------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| 1. チャネル定数   | `apps/desktop/src/preload/channels.ts`          | `SKILL_CREATOR_ADAPTER_STATUS_CHANGED: "skill-creator:adapter-status-changed"`                  |
| 2. ALLOWED リスト | `apps/desktop/src/preload/channels.ts`          | `ALLOWED_ON_CHANNELS` 配列に `IPC_CHANNELS.SKILL_CREATOR_ADAPTER_STATUS_CHANGED` を追加         |
| 3. push 送信      | `apps/desktop/src/main/ipc/creatorHandlers.ts`  | `mainWindow.webContents.send(IPC_CHANNELS.SKILL_CREATOR_ADAPTER_STATUS_CHANGED, payload)`       |
| 4. Preload API    | `apps/desktop/src/preload/skill-creator-api.ts` | `onAdapterStatusChanged: (cb) => safeOn(IPC_CHANNELS.SKILL_CREATOR_ADAPTER_STATUS_CHANGED, cb)` |

## 型設計

### `LLMAdapterStatusPayload`（`packages/shared/src/types/skillCreator.ts` に追加）

```typescript
/** LLMAdapter ステータス IPC レスポンス payload (TASK-RT-01) */
export interface LLMAdapterStatusPayload {
  status: LLMAdapterStatus; // "ready" | "initializing" | "failed"
  failureReason: string | null; // "failed" 時のエラー詳細
}
```

追加位置: `LLMAdapterStatus` 型定義（line 338）の直下。

### `@repo/shared/types` からの再エクスポート

本タスクの実装では `import type { LLMAdapterStatusPayload } from "@repo/shared/types";` を使用するため、
`packages/shared/src/types/index.ts` の `export type { ... } from "./skillCreator";` に
`LLMAdapterStatusPayload` を追加して再エクスポートする（列挙型 export のため自動では出ない）。

### 型互換性検証テーブル（下書き、Phase 3 で確認）

| 型                        | 定義場所                                    | 使用場所                                                               | 互換性           |
| ------------------------- | ------------------------------------------- | ---------------------------------------------------------------------- | ---------------- |
| `LLMAdapterStatusPayload` | `packages/shared/src/types/skillCreator.ts` | `creatorHandlers.ts`, `skill-creator-api.ts`, `useLLMAdapterStatus.ts` | TBD              |
| `LLMAdapterStatus`        | `packages/shared/src/types/skillCreator.ts` | `RuntimeSkillCreatorFacade.ts`, `LLMAdapterErrorBanner.tsx`            | 既存（変更不要） |

## Facade 設計

### `onAdapterStatusChanged` コールバック

```typescript
// RuntimeSkillCreatorFacade クラスに追加するパブリックプロパティ
onAdapterStatusChanged?: (
  status: LLMAdapterStatus,
  reason: string | null,
) => void;
```

呼び出しタイミング:

| 呼び出し元メソッド            | 遷移後のステータス | 呼び出し引数         |
| ----------------------------- | ------------------ | -------------------- |
| `setLLMAdapter(adapter)`      | `"ready"`          | `("ready", null)`    |
| `setLLMAdapterFailed(reason)` | `"failed"`         | `("failed", reason)` |

**設計方針**: 冪等性を保つため、同一状態への遷移でもコールバックを呼び出す（Renderer 側で重複更新は無視）。

## IPC ハンドラ設計

### `SKILL_CREATOR_GET_ADAPTER_STATUS` ハンドラ（pull）

```typescript
// registerRuntimeSkillCreatorHandlers 内に追加
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

### push 通知ワイヤリング（`onAdapterStatusChanged` → `webContents.send`）

```typescript
// registerRuntimeSkillCreatorHandlers 内の onWorkflowStateSnapshot ワイヤリング直後に追加
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

### `unregisterRuntimeSkillCreatorHandlers` への追加

```typescript
ipcMain.removeHandler(IPC_CHANNELS.SKILL_CREATOR_GET_ADAPTER_STATUS);
```

加えて、push コールバックは Main 側サービス参照に紐づくため、解除時に必ずクリーンアップする：

```typescript
runtimeSkillCreatorService.onAdapterStatusChanged = undefined;
```

補足: `unregisterRuntimeSkillCreatorHandlers()` が引数無しのため、`creatorHandlers.ts` 側で
`registerRuntimeSkillCreatorHandlers` に渡された `runtimeSkillCreatorService` を module-scope に保持し、
`unregisterRuntimeSkillCreatorHandlers` で参照して `onAdapterStatusChanged` を `undefined` に戻す。

## Preload API 設計

### `SkillCreatorAPI` インターフェース拡張

```typescript
// getGovernanceState の直後に追加
getAdapterStatus: () => Promise<IpcResult<LLMAdapterStatusPayload>>;

onAdapterStatusChanged: (
  callback: (payload: LLMAdapterStatusPayload) => void,
) => () => void;  // unsubscribe 関数を返す
```

### `skillCreatorAPI` 実装

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

## コンポーネント設計: `LLMAdapterErrorBanner`

**ファイル**: `apps/desktop/src/renderer/components/skill/LLMAdapterErrorBanner.tsx`

### Props

```typescript
export interface LLMAdapterErrorBannerProps {
  status: LLMAdapterStatus;
  failureReason: string | null;
  onOpenSettings?: () => void;
}
```

### 表示ロジック

| status           | 表示             |
| ---------------- | ---------------- |
| `"ready"`        | `null`（非表示） |
| `"initializing"` | `null`（非表示） |
| `"failed"`       | エラーバナー表示 |

### メッセージ生成ロジック

```
failureReason に "API key" が含まれる（大文字小文字は区別しない: /api key/i）
  → "APIキーが設定されていないか、無効です。設定画面でAPIキーを確認してください。"
それ以外
  → `LLMアダプターの初期化に失敗しました: ${failureReason ?? "不明なエラー"}`
```

### テスト ID

- `data-testid="llm-adapter-error-banner"`
- `role="alert"` を付与（アクセシビリティ）

### スタイル

既存 `ErrorBanner.tsx` のスタイルパターン（Tailwind + `var(--status-error)` トークン使用）に準拠。
本タスクでは inline style は使わず、`className` ベースで揃える。

## フック設計: `useLLMAdapterStatus`

**ファイル**: `apps/desktop/src/renderer/components/skill/hooks/useLLMAdapterStatus.ts`

### 状態型

```typescript
export interface LLMAdapterStatusState {
  status: LLMAdapterStatus;
  failureReason: string | null;
}
```

### 初期状態

```typescript
{ status: "initializing", failureReason: null }
```

アプリ起動直後はアダプタ初期化中のため `"initializing"` を初期値とする。

### pull + push フロー

```
マウント時
  ├─ pull: api.getAdapterStatus() → 初期状態を取得してセット（失敗時は初期状態維持）
  └─ push: api.onAdapterStatusChanged(cb) → 変化を購読（API が無い場合は no-op）

アンマウント時
  ├─ cancelled = true（pull の非同期結果を破棄）
  └─ unsubscribe()（push の購読を解除）
```

### 例外・不在APIの扱い（graceful degradation）

- `window.electronAPI?.skillCreator` が無い場合: no-op（`{ status: "initializing", failureReason: null }` のまま）
- `getAdapterStatus()` が `{ success: false }` を返す、または Promise rejection する場合: no-op（初期状態維持）
- `onAdapterStatusChanged` が無い場合: no-op（購読しない）。`unsubscribe` は空関数として扱う
- cleanup は冪等: `unsubscribe` は例外を投げない前提で呼ぶ（念のため try/catch してもよい）

### 競合状態の防止

```typescript
let cancelled = false;
// pull の非同期コールバック内
if (cancelled) return; // アンマウント後は状態更新しない
```

### `getSkillCreatorApi()` のアクセスパターン

`SkillLifecyclePanel.tsx` の既存パターンと同じく、`window.electronAPI?.skillCreator ?? window.skillCreatorAPI` を参照する。
Renderer 側で旧 bridge 名が残っていても hook が壊れないよう、`electronAPI` と `skillCreatorAPI` の両方を受け付ける。

## `SkillLifecyclePanel` 統合設計

### 追加するインポート

```typescript
import { LLMAdapterErrorBanner } from "./LLMAdapterErrorBanner";
import { useLLMAdapterStatus } from "./hooks/useLLMAdapterStatus";
```

### フック呼び出し位置

既存フック群の末尾（`setHandoffGuidance` の後）に追加：

```typescript
const adapterStatus = useLLMAdapterStatus();
```

### JSX 配置

`SkillLifecyclePanel` の return ブロック内、最上部（全コンテンツラッパーの直後）：

```tsx
<LLMAdapterErrorBanner
  status={adapterStatus.status}
  failureReason={adapterStatus.failureReason}
  onOpenSettings={onOpenWizard}
/>
```

`onOpenWizard` が `undefined` の場合は「設定を開く」ボタンが非表示になる（`LLMAdapterErrorBanner` の Props 設計による）。

## concern 数による設計書分割判断

| concern     | 内容                                                                        |
| ----------- | --------------------------------------------------------------------------- |
| IPC 基盤    | channels.ts, Facade, creatorHandlers.ts, skill-creator-api.ts               |
| Renderer UI | LLMAdapterErrorBanner.tsx, useLLMAdapterStatus.ts, SkillLifecyclePanel 統合 |

concern は 2 つ。単一 `phase-02-design.md` で記述（分割不要）。

## 統合テスト連携

Phase 4 で以下のテストを先行作成し、Phase 5 の実装で通す：

| テストファイル                          | 確認する concern                                             |
| --------------------------------------- | ------------------------------------------------------------ |
| `creatorHandlers.adapterStatus.test.ts` | IPC ハンドラの pull、エラー時の graceful degradation         |
| `LLMAdapterErrorBanner.test.tsx`        | status 別表示制御、message 生成ロジック                      |
| `useLLMAdapterStatus.test.ts`           | 初期状態、pull 成功、push 受信、アンマウント時クリーンアップ |

## 多角的チェック観点（AIが判断）

| 観点             | 適用判断 | 確認内容                                                                         |
| ---------------- | -------- | -------------------------------------------------------------------------------- |
| IPC 4層整合      | 必須     | 2チャネルの 4 層対応表が全て埋まっているか                                       |
| セキュリティ     | 必須     | `validateIpcSender` が新規ハンドラに適用されているか                             |
| メモリリーク防止 | 必須     | `useEffect` クリーンアップで `cancelled = true` + `unsubscribe()` が実行されるか |
| アクセシビリティ | 適用     | エラーバナーに `role="alert"` が付与されているか                                 |
| 状態所有権       | 適用     | LLMAdapter 状態は Main のみが持ち、Renderer は pull/push でのみ参照するか        |

## サブタスク管理

| ID     | 内容                                      | 依存           |
| ------ | ----------------------------------------- | -------------- |
| ST-2-1 | IPC 4層対応表の完成                       | Phase 1        |
| ST-2-2 | 型設計（`LLMAdapterStatusPayload`）の確定 | ST-2-1         |
| ST-2-3 | コンポーネント Props・表示ロジックの確定  | ST-2-1         |
| ST-2-4 | フック状態フローの確定                    | ST-2-1         |
| ST-2-5 | `SkillLifecyclePanel` 統合ポイントの確定  | ST-2-3, ST-2-4 |

## 成果物

| 成果物                         | パス                                                                            |
| ------------------------------ | ------------------------------------------------------------------------------- |
| 設計ドキュメント（本ファイル） | `docs/30-workflows/task-rt-01-llm-adapter-error-propagation/phase-02-design.md` |
| IPC 4層設計表                  | `outputs/phase-2/ipc-4layer-design.md`                                          |
| 型互換性検証テーブル（下書き） | `outputs/phase-2/type-compatibility-draft.md`                                   |

## 完了条件

- [ ] IPC 2チャネルの4層対応表が全て定義されている
- [ ] `LLMAdapterStatusPayload` 型が定義されている
- [ ] `LLMAdapterStatusPayload` が `@repo/shared/types` から参照できるよう `packages/shared/src/types/index.ts` の再エクスポート方針が明記されている
- [ ] `onAdapterStatusChanged` コールバックの型・呼び出しタイミングが明確
- [ ] `LLMAdapterErrorBanner` の Props・表示ロジックが定義されている
- [ ] `useLLMAdapterStatus` の pull+push フローが定義されている
- [ ] 型互換性検証テーブル（下書き）が作成されている
- [ ] `SkillLifecyclePanel` への統合ポイントが確定している

## タスク100%実行確認【必須】

- [ ] 上記「完了条件」を全て達成した
- [ ] 成果物を `outputs/phase-2/` に配置した
- [ ] `artifacts.json` の Phase 2 を `completed` に更新した

## 次Phase

Phase 2 完了後 → [Phase 3: 設計レビューゲート](phase-03-design-review.md) へ進む
