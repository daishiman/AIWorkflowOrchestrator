# LLMAdapter 初期化エラーの UI 通知・状態公開 - タスク指示書

## メタ情報

```yaml
issue_number: 1879
task_id: TASK-RT-01
task_name: LLMAdapter 初期化エラーの UI 通知・状態公開
priority: 高
scale: 中規模
status: 未実施
```

| 項目         | 内容                                            |
| ------------ | ----------------------------------------------- |
| タスクID     | TASK-RT-01                                      |
| タスク名     | LLMAdapter 初期化エラーの UI 通知・状態公開     |
| 分類         | バグ修正・改善（Runtime系）                     |
| 対象機能     | Skill Creator Agent SDK Lane - LLMAdapter初期化 |
| 優先度       | 高                                              |
| 見積もり規模 | 中規模（M: 10〜20ファイル変更）                 |
| ステータス   | 未実施                                          |
| 発見元       | P0是正パック（30思考法による多角的検証）        |
| 発見日       | 2026-04-04                                      |
| Step         | 08（並列実行可能）                              |
| 依存タスク   | なし                                            |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

Skill Creator Agent SDK Lane（TASK-SDK-01〜08）のPhase 1-12は完了済みである。しかし、実動作調査によって LLMAdapter 初期化失敗時のエラー伝播経路が未整備であることが判明した。

`RuntimeSkillCreatorFacade` には `_llmAdapterStatus`（`LLMAdapterStatus` 型: `"ready" | "initializing" | "failed"`）と `_llmAdapterFailureReason` のフィールド、および `setLLMAdapter()` / `setLLMAdapterFailed()` メソッドが既に実装されている（`packages/shared/src/types/skillCreator.ts` の `LLMAdapterStatus` 型定義も存在する）。

しかし現状、`setLLMAdapterFailed()` が呼び出された後の **Renderer 側への通知パス** が存在しない。`plan()` メソッド内でのみ `_llmAdapterStatus === "failed"` チェックが行われているが、ユーザーが `plan()` を呼ぶ前の段階でエラーを認識する手段がない。

### 1.2 問題点・課題

1. **UIへのエラー通知が欠如**: `LLMAdapterFactory.getAdapter()` が `API key not found for provider` 等のエラーを throw しても、Main プロセス内で catch されるだけで Renderer 側に通知されない。
2. **無音の失敗**: スキル作成フローを開始しようとすると、バックエンドでは初期化失敗状態なのに UI は「初期化中」または「準備完了」のまま固まる。
3. **アクション不能**: ユーザーはリトライ・APIキー設定への遷移・サポート問い合わせのいずれも実行できない。
4. **IPC経由の状態公開なし**: `RuntimeSkillCreatorFacade.llmAdapterStatus` の getter は存在するが、Renderer から IPC 経由で取得できるチャネルが未定義。

### 1.3 放置した場合の影響

- **即時**: ユーザーが API キー未設定や誤設定のままスキル作成を試みると、操作不能な状態に陥る（UX 破損）
- **短期**: サポート問い合わせが増加し、「何も起きない」という報告が多発する
- **中期**: エラー状態への対処方法が不明なため、ユーザーがアプリを放棄するリスクがある
- **長期**: TASK-RT-04（APIキー設定UI）との接続点が未定義のまま進むと、後工程で大幅なリファクタリングが必要になる

---

## 2. 何を達成するか（What）

### 2.1 目的

LLMAdapter 初期化が失敗した場合に、そのエラー状態を IPC 経由で Renderer に即時公開し、ユーザーが次のアクション（APIキー設定・リトライ・問い合わせ）を取れるよう UI に適切なエラー表示を追加する。

### 2.2 最終ゴール

- `LLMAdapterFactory.getAdapter()` が失敗したとき、`SkillLifecyclePanel` / `SkillCreateWizard` にエラーバナーが表示される
- エラーメッセージが actionable（「APIキーを設定してください」など具体的な操作指示を含む）であること
- UI は `"ready"` / `"initializing"` / `"failed"` の3状態を適切に表示し切り替えられること
- IPC チャネル `skill-creator:get-adapter-status` または既存チャネルの拡張によって Renderer がアダプタ状態を pull できること
- `setLLMAdapterFailed()` が呼ばれたタイミングで Renderer に push 通知が届くこと（オプション: push チャネルの追加）

### 2.3 スコープ

#### 含むもの

- `LLMAdapterStatus` 型・エラーコード定義の確認と必要に応じた拡張（`packages/shared/src/types/skillCreator.ts`）
- `RuntimeSkillCreatorFacade.setLLMAdapterFailed()` 呼び出し元の実装（Main 側の初期化コードに catch ブロックを追加）
- IPC 経由でのアダプタ状態公開（新規チャネル `skill-creator:get-adapter-status` の追加、または既存チャネルの拡張）
- Renderer 側 pull / push による状態取得フックの実装
- `SkillLifecyclePanel` / `SkillCreateWizard` へのエラー表示コンポーネント追加
- 単体テスト・統合テストの追加

#### 含まないもの

- APIキー設定UIの実装（`TASK-RT-04` の責務）
- スタブ応答のエラー変換ロジック（`TASK-RT-02` の責務）
- verify engine の改善（`TASK-P0-01` の責務）
- LLMAdapterFactory 自体の retry logic（別タスク: `task-ut-rt-01-llm-adapter-retry-logic-001.md`）

### 2.4 成果物

| 成果物                   | パス                                                                                          |
| ------------------------ | --------------------------------------------------------------------------------------------- |
| IPC チャネル定義追加     | `apps/desktop/src/preload/channels.ts`                                                        |
| IPC ハンドラ追加         | `apps/desktop/src/main/ipc/creatorHandlers.ts`                                                |
| Facade 初期化エラー捕捉  | `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`（または初期化コード）   |
| エラー型の確認・拡張     | `packages/shared/src/types/skillCreator.ts`                                                   |
| エラー表示コンポーネント | `apps/desktop/src/renderer/components/skill/LLMAdapterErrorBanner.tsx`（新規）                |
| SkillLifecyclePanel 統合 | `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx`                          |
| ストアフック追加         | `apps/desktop/src/renderer/store/slices/agentSlice.ts`（または新規スライス）                  |
| 単体テスト               | `apps/desktop/src/main/ipc/__tests__/creatorHandlers.adapterStatus.test.ts`（新規）           |
| 統合テスト               | `apps/desktop/src/renderer/components/skill/__tests__/LLMAdapterErrorBanner.test.tsx`（新規） |

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- Node.js 20.x 以上
- pnpm 9.x 以上
- Electron 開発環境が起動可能な状態
- `ANTHROPIC_API_KEY` 環境変数が **未設定** または **無効な値** の状態でテスト可能なこと
- TypeScript 5.x（strict モード）

### 3.2 依存タスク

なし（このタスクは独立して実施可能）

ただし、以下のタスクとの協調が必要：

- `TASK-RT-04`（APIキー設定UI）: 本タスクのエラー表示から TASK-RT-04 が提供する設定画面への遷移リンクを追加する場合、インターフェイスを事前に合意すること
- `TASK-RT-02`（APIキーUI/アダプタ状態統合）: 状態管理の重複を避けるため、アダプタ状態スライスの設計を調整すること

### 3.3 必要な知識

| 知識領域          | 詳細                                                                 |
| ----------------- | -------------------------------------------------------------------- |
| Electron IPC      | `ipcMain.handle` / `webContents.send` による Main ↔ Renderer 通信    |
| TypeScript 型設計 | `LLMAdapterStatus` の discriminated union、型ガード                  |
| React / Zustand   | エラー状態のストア管理、`useEffect` による IPC 購読                  |
| Tailwind CSS      | エラーバナーのスタイリング（red-500 系トークン）                     |
| Vitest            | `vi.fn()` / `vi.spyOn()` によるモック、`ipcMain.handle` のテスト方法 |

### 3.4 推奨アプローチ

**Pull + Push の二重対応を推奨する。**

1. **Pull**: Renderer 起動時に `skill-creator:get-adapter-status` を invoke して現在の状態を取得する
2. **Push**: `setLLMAdapterFailed()` が呼ばれた際に `webContents.send(SKILL_CREATOR_ADAPTER_STATUS_CHANGED, ...)` で即時通知する

これにより、Renderer がバックグラウンドで初期化が失敗した場合でも（ウィンドウがすでに表示されている状態）確実に通知を受け取れる。

---

## 4. 実行手順

### Phase 構成

| Phase | 内容                                     | 目安時間 |
| ----- | ---------------------------------------- | -------- |
| 1     | 調査・設計                               | 1h       |
| 2     | エラー型・状態定義の確認・拡張           | 0.5h     |
| 3     | Main 側実装（LLMAdapter 捕捉・IPC 通知） | 2h       |
| 4     | Renderer 側実装（エラー表示）            | 2h       |
| 5     | テスト                                   | 2h       |
| 6     | レビュー・完了                           | 1h       |

---

### Phase 1: 調査・設計

**目的**: 実装前に現状の動作と設計の全体像を把握する。

#### 手順

1. `LLMAdapterFactory.getAdapter()` のエラー発生パスを特定する
   - ファイル: `apps/desktop/src/main/adapters/llm/LLMAdapterFactory.ts`
   - 確認点: `API key not found for provider` エラーが throw されるコード行
   - 確認点: `getAdapter()` の呼び出し元（初期化コード）の場所

2. `RuntimeSkillCreatorFacade` の初期化フローを確認する
   - ファイル: `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`
   - 確認点: `setLLMAdapter()` / `setLLMAdapterFailed()` が呼ばれる場所
   - 確認点: `_llmAdapterStatus` が `"initializing"` のままになるケース

3. 既存の IPC チャネル一覧を確認する
   - ファイル: `apps/desktop/src/preload/channels.ts`
   - 確認点: `SKILL_CREATOR_*` 系チャネルの命名規則

4. `creatorHandlers.ts` の既存ハンドラ構造を確認する
   - ファイル: `apps/desktop/src/main/ipc/creatorHandlers.ts`
   - 確認点: `registerRuntimeSkillCreatorHandlers()` の引数・戻り値

5. Renderer 側の既存エラー表示パターンを確認する
   - ファイル: `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx`
   - 確認点: `useGenerationError` / `useWorkflowError` フックの使用箇所

#### 成果物

- 設計メモ（Phase 3〜4 の実装方針を 10行以内で記述）

---

### Phase 2: エラー型・状態定義の確認・拡張

**目的**: `packages/shared` 側の型が実装に必要な情報を全て持っているか確認し、不足があれば追加する。

#### 手順

1. `packages/shared/src/types/skillCreator.ts` を開き、以下の型が存在することを確認する
   - `LLMAdapterStatus`: `"ready" | "initializing" | "failed"`
   - `SkillCreatorErrorCode`: `"LLM_ADAPTER_FAILED" | "LLM_ADAPTER_INITIALIZING"`

2. アダプタ状態取得の IPC レスポンス型を追加する（まだ存在しない場合）

```typescript
// packages/shared/src/types/skillCreator.ts に追加（既存の LLMAdapterStatus セクションの直下）

/** LLMAdapter ステータス IPC レスポンス */
export interface LLMAdapterStatusResponse {
  status: LLMAdapterStatus;
  /** 失敗時のエラー理由（actionable なメッセージ形式） */
  failureReason: string | null;
}
```

3. 型追加後、`packages/shared/src/types/index.ts` または barrel export からエクスポートされているか確認する

#### 確認コマンド

```bash
pnpm --filter @repo/shared build
```

エラーがないことを確認する。

---

### Phase 3: Main 側実装（LLMAdapter 捕捉・IPC 通知）

**目的**: LLMAdapter 初期化失敗を捕捉し、Facade の状態を更新するとともに Renderer に IPC 経由で通知する。

#### 手順 3-1: IPC チャネル定義の追加

`apps/desktop/src/preload/channels.ts` に以下のチャネル定数を追加する。

```typescript
// 既存の SKILL_CREATOR_* チャネルが定義されているブロックに追加

/** LLMAdapter ステータスの取得（invoke チャネル） */
SKILL_CREATOR_GET_ADAPTER_STATUS: "skill-creator:get-adapter-status",

/** LLMAdapter ステータスの変化通知（send チャネル、Main → Renderer） */
SKILL_CREATOR_ADAPTER_STATUS_CHANGED: "skill-creator:adapter-status-changed",
```

#### 手順 3-2: Preload API の拡張

`apps/desktop/src/preload/skill-api.ts`（または対応するpreloadファイル）に以下を追加する。

```typescript
// 既存の skill-creator invoke API に追加
getAdapterStatus: (): Promise<IpcResult<LLMAdapterStatusResponse>> =>
  ipcRenderer.invoke(IPC_CHANNELS.SKILL_CREATOR_GET_ADAPTER_STATUS),

// on 系リスナーに追加
onAdapterStatusChanged: (
  callback: (status: LLMAdapterStatusResponse) => void
) => {
  ipcRenderer.on(IPC_CHANNELS.SKILL_CREATOR_ADAPTER_STATUS_CHANGED, (_event, status) => callback(status));
  return () => {
    ipcRenderer.removeAllListeners(IPC_CHANNELS.SKILL_CREATOR_ADAPTER_STATUS_CHANGED);
  };
},
```

#### 手順 3-3: IPC ハンドラの追加

`apps/desktop/src/main/ipc/creatorHandlers.ts` の `registerRuntimeSkillCreatorHandlers()` 内に以下を追加する。

```typescript
ipcMain.handle(
  IPC_CHANNELS.SKILL_CREATOR_GET_ADAPTER_STATUS,
  async (
    event: IpcMainInvokeEvent,
  ): Promise<IpcResult<LLMAdapterStatusResponse>> => {
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

#### 手順 3-4: Push 通知の実装

`RuntimeSkillCreatorFacade.setLLMAdapterFailed()` が呼ばれた際に Renderer へ通知するため、Facade にコールバックを追加するか、または呼び出し元の初期化コードで `webContents.send()` を呼ぶ。

**方針A（推奨）: Facade にコールバックを追加する**

```typescript
// RuntimeSkillCreatorFacade.ts に追加

/** LLMAdapter ステータス変化時のコールバック（creatorHandlers.ts でセットアップ） */
onAdapterStatusChanged?: (status: LLMAdapterStatus, failureReason: string | null) => void;

// setLLMAdapterFailed() を修正
setLLMAdapterFailed(reason: string): void {
  this._llmAdapterStatus = "failed";
  this._llmAdapterFailureReason = reason;
  // Push 通知
  this.onAdapterStatusChanged?.("failed", reason);
}
```

`creatorHandlers.ts` の `registerRuntimeSkillCreatorHandlers()` でコールバックを設定する。

```typescript
if (runtimeSkillCreatorService) {
  runtimeSkillCreatorService.onAdapterStatusChanged = (
    status,
    failureReason,
  ) => {
    if (!mainWindow.isDestroyed()) {
      mainWindow.webContents.send(
        IPC_CHANNELS.SKILL_CREATOR_ADAPTER_STATUS_CHANGED,
        { status, failureReason },
      );
    }
  };
}
```

#### 手順 3-5: 初期化コードへの catch ブロック追加

LLMAdapterFactory.getAdapter() を呼び出している初期化コードを特定し、catch ブロックで `runtimeSkillCreatorFacade.setLLMAdapterFailed(error.message)` を呼ぶ。

```typescript
// 初期化コード（main/index.ts または DI コンテナ等）
try {
  const adapter = await LLMAdapterFactory.getAdapter("anthropic");
  runtimeSkillCreatorFacade.setLLMAdapter(adapter);
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  runtimeSkillCreatorFacade.setLLMAdapterFailed(message);
  // ログ出力（Renderer への通知は onAdapterStatusChanged コールバックが担う）
  console.error("[main] LLMAdapter 初期化失敗:", message);
}
```

---

### Phase 4: Renderer 側実装（エラー表示）

**目的**: `LLMAdapterStatus` の状態を取得し、`"failed"` の場合にエラーバナーを表示する。

#### 手順 4-1: エラーバナーコンポーネントの作成

`apps/desktop/src/renderer/components/skill/LLMAdapterErrorBanner.tsx` を新規作成する。

```tsx
// LLMAdapterErrorBanner.tsx（実装の骨格）

interface Props {
  failureReason: string | null;
  onRetry?: () => void;
  onOpenSettings?: () => void;
}

export function LLMAdapterErrorBanner({
  failureReason,
  onRetry,
  onOpenSettings,
}: Props) {
  const message = failureReason ?? "LLM アダプタの初期化に失敗しました";
  return (
    <div
      role="alert"
      aria-live="assertive"
      className="rounded-md border border-red-300 bg-red-50 p-4 text-red-800 dark:border-red-700 dark:bg-red-950 dark:text-red-200"
    >
      <p className="font-semibold">LLM アダプタ初期化エラー</p>
      <p className="mt-1 text-sm">{message}</p>
      <div className="mt-3 flex gap-2">
        {onOpenSettings && (
          <button onClick={onOpenSettings} className="...">
            API キーを設定する
          </button>
        )}
        {onRetry && (
          <button onClick={onRetry} className="...">
            再試行
          </button>
        )}
      </div>
    </div>
  );
}
```

#### 手順 4-2: カスタムフックの作成

```typescript
// apps/desktop/src/renderer/hooks/useLLMAdapterStatus.ts（新規）

import { useEffect, useState } from "react";
import type {
  LLMAdapterStatus,
  LLMAdapterStatusResponse,
} from "@repo/shared/types";

export function useLLMAdapterStatus() {
  const [status, setStatus] = useState<LLMAdapterStatus>("initializing");
  const [failureReason, setFailureReason] = useState<string | null>(null);

  useEffect(() => {
    // 初回: pull
    window.electronAPI.skillCreator.getAdapterStatus().then((result) => {
      if (result.success && result.data) {
        setStatus(result.data.status);
        setFailureReason(result.data.failureReason);
      }
    });

    // 以降: push リスナー
    const unsubscribe = window.electronAPI.skillCreator.onAdapterStatusChanged(
      (payload: LLMAdapterStatusResponse) => {
        setStatus(payload.status);
        setFailureReason(payload.failureReason);
      },
    );

    return unsubscribe;
  }, []);

  return { status, failureReason };
}
```

#### 手順 4-3: SkillLifecyclePanel への統合

`apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx` の先頭レンダリング部分に以下を追加する。

```tsx
// SkillLifecyclePanel.tsx 内の適切な箇所に追加

const { status: adapterStatus, failureReason } = useLLMAdapterStatus();

// レンダリング部分（既存の return 内、最上部）
{
  adapterStatus === "failed" && (
    <LLMAdapterErrorBanner
      failureReason={failureReason}
      onOpenSettings={() => {
        // TASK-RT-04 が提供する設定画面への遷移
        // 現時点では設定ページへのルーティングまたはモーダルオープン
      }}
    />
  );
}
```

---

### Phase 5: テスト

**目的**: 実装の正確性を自動テストで保証する。

#### 手順 5-1: IPC ハンドラのユニットテスト

`apps/desktop/src/main/ipc/__tests__/creatorHandlers.adapterStatus.test.ts` を新規作成する。

テストケース:

- `SKILL_CREATOR_GET_ADAPTER_STATUS` ハンドラが `"ready"` 状態を返す
- `SKILL_CREATOR_GET_ADAPTER_STATUS` ハンドラが `"failed"` 状態と failureReason を返す
- `runtimeSkillCreatorService` が undefined の場合にエラーレスポンスを返す
- `setLLMAdapterFailed()` 呼び出し後に `onAdapterStatusChanged` コールバックが呼ばれる

#### 手順 5-2: エラーバナーのコンポーネントテスト

`apps/desktop/src/renderer/components/skill/__tests__/LLMAdapterErrorBanner.test.tsx` を新規作成する。

テストケース:

- `failureReason` が null のときデフォルトメッセージを表示する
- `failureReason` が文字列のとき、そのメッセージを表示する
- `onOpenSettings` が渡されたとき「API キーを設定する」ボタンが表示される
- `onOpenSettings` ボタンをクリックするとコールバックが呼ばれる
- `role="alert"` と `aria-live="assertive"` が設定されている

#### 確認コマンド

```bash
# 特定テストファイルのみ実行
pnpm vitest run apps/desktop/src/main/ipc/__tests__/creatorHandlers.adapterStatus.test.ts
pnpm vitest run apps/desktop/src/renderer/components/skill/__tests__/LLMAdapterErrorBanner.test.tsx

# 型チェック
pnpm --filter @repo/desktop typecheck
pnpm --filter @repo/shared typecheck
```

---

### Phase 6: レビュー・完了

**目的**: 実装の品質を最終確認し、タスクをクローズする。

#### 手順

1. `pnpm --filter @repo/desktop lint` を実行してエラーがないことを確認する
2. `pnpm --filter @repo/desktop typecheck` を実行してエラーがないことを確認する
3. Electron アプリを起動し、`ANTHROPIC_API_KEY` を未設定の状態でスキル作成画面を開いて、エラーバナーが表示されることを手動確認する
4. エラーバナーの「API キーを設定する」ボタンの動作を確認する（TASK-RT-04 未実装の場合はボタン自体を非表示にするか、プレースホルダーを表示する）
5. PR を作成し、レビューを依頼する

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] `LLMAdapterFactory.getAdapter()` が例外を throw した場合、`RuntimeSkillCreatorFacade` の `_llmAdapterStatus` が `"failed"` に遷移する
- [ ] `setLLMAdapterFailed()` が呼ばれると、登録済みの `onAdapterStatusChanged` コールバックが実行される
- [ ] `SKILL_CREATOR_GET_ADAPTER_STATUS` IPC チャネルが `LLMAdapterStatusResponse` を返す
- [ ] `SKILL_CREATOR_ADAPTER_STATUS_CHANGED` IPC push チャネルが Main → Renderer に状態変化を通知する
- [ ] `SkillLifecyclePanel` で `adapterStatus === "failed"` のとき `LLMAdapterErrorBanner` が表示される
- [ ] エラーメッセージが actionable（「APIキーを設定してください」など）である
- [ ] `"initializing"` 状態でも適切なローディング表示がされる（既存実装との一貫性）

### 品質要件

- [ ] TypeScript strict モードでエラーが出ない
- [ ] ESLint エラーが出ない
- [ ] `LLMAdapterErrorBanner` コンポーネントに `role="alert"` と `aria-live="assertive"` が設定されている（アクセシビリティ）
- [ ] 新規追加のコードに単体テストが存在し、カバレッジが 80% 以上である
- [ ] `any` 型を使用していない

### ドキュメント要件

- [ ] 新規追加した IPC チャネル定数に JSDoc コメントが付いている
- [ ] `LLMAdapterErrorBanner` コンポーネントに Props の JSDoc が付いている
- [ ] `useLLMAdapterStatus` フックに使用方法のコメントが付いている

---

## 6. 検証方法

### テストケース

| TC-ID | シナリオ                                         | 期待結果                                           |
| ----- | ------------------------------------------------ | -------------------------------------------------- |
| TC-1  | APIキー未設定でアプリ起動                        | `SkillLifecyclePanel` にエラーバナーが表示される   |
| TC-2  | APIキー設定済みでアプリ起動                      | エラーバナーが表示されない                         |
| TC-3  | 起動後にAPIキーが削除された場合（動的削除）      | `SKILL_CREATOR_ADAPTER_STATUS_CHANGED` push で通知 |
| TC-4  | エラーバナーの「API キーを設定する」ボタンを押す | 設定画面へ遷移（またはプレースホルダー表示）       |
| TC-5  | `SKILL_CREATOR_GET_ADAPTER_STATUS` を invoke     | `{ status, failureReason }` を含む正常レスポンス   |
| TC-6  | `runtimeSkillCreatorService` が undefined の状態 | `{ success: false, error: "..." }` を返す          |
| TC-7  | `toActionableMessage()` に API キーエラー文字列  | 「APIキーを設定してください」を返す                |

### 検証手順

1. **ユニットテスト自動実行**:

   ```bash
   pnpm vitest run --reporter=verbose apps/desktop/src/main/ipc/__tests__/creatorHandlers.adapterStatus.test.ts
   ```

2. **型チェック**:

   ```bash
   pnpm --filter @repo/shared typecheck
   pnpm --filter @repo/desktop typecheck
   ```

3. **手動動作確認**（Electron アプリ起動）:
   ```bash
   # APIキー未設定環境で起動
   unset ANTHROPIC_API_KEY
   pnpm --filter @repo/desktop dev
   # → スキル作成画面を開き、エラーバナーが表示されることを確認
   ```

---

## 7. リスクと対策

| リスク                                                   | 影響度 | 対策                                                                                         |
| -------------------------------------------------------- | ------ | -------------------------------------------------------------------------------------------- |
| `onAdapterStatusChanged` コールバックの登録が重複する    | 中     | `registerRuntimeSkillCreatorHandlers()` の冪等性を保証する（上書きのみ許可）                 |
| Renderer が IPC チャネルを purchase する前に push が届く | 低     | Renderer 起動時に必ず pull（`getAdapterStatus`）を実行することで初期状態を取得する           |
| `mainWindow.isDestroyed()` 後に `send` が呼ばれる        | 中     | `send` 前に `isDestroyed()` チェックを挿入（既存の `emitWorkflowStateChanged` と同パターン） |
| TASK-RT-04 未実装時のボタン動作                          | 低     | TASK-RT-04 が未実装の場合、「設定する」ボタンは非表示またはコンソールログのみとする          |
| アダプタ状態の型が `@repo/shared` で二重定義される       | 低     | `LLMAdapterStatus` と `LLMAdapterStatusResponse` は既存定義を優先し、重複追加しない          |

---

## 8. 参照情報

### 関連ドキュメント

- `docs/30-workflows/unassigned-task/task-rt-02-api-key-ui-adapter-status-integration.md`（TASK-RT-02）
- `packages/shared/src/types/skillCreator.ts`（型定義の正本）
- `apps/desktop/src/main/ipc/creatorHandlers.ts`（IPC ハンドラの既存実装）
- `apps/desktop/src/main/adapters/llm/LLMAdapterFactory.ts`（アダプタファクトリ）
- `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`（Facade の状態管理）

### 苦戦箇所の記録

#### P1: PATH 上書きによる spawn ENOENT エラー（step 0 で解決済み）

**問題**: SDK の `query()` 実行時に `env: { ANTHROPIC_API_KEY: apiKey }` を渡すと、Node.js の `child_process.spawn()` が `PATH` を含む全環境変数を上書きしてしまう。結果として `spawn("node")` が PATH を参照できず `ENOENT` エラーが発生した。

**症状**: スキル作成を実行すると `Error: spawn node ENOENT` が発生し、ユーザーには何も表示されずに静かに失敗する。

**解決策** (TASK-FIX-ENV-STRIPPING, step 0 完了済み): `env` オプションを渡す際に `{ ...process.env, ANTHROPIC_API_KEY: apiKey }` のように既存の環境変数を展開して合成する。

**教訓**: Node.js の `child_process` 系 API に `env` を渡す場合、部分的な上書きは `process.env` をスプレッドして行うこと。

---

#### P2: LLMAdapterFactory.getAdapter() の失敗パスが Main 内に閉じている問題

**問題**: `LLMAdapterFactory.getAdapter()` は非同期関数であり、以下の2つの条件でエラーを throw する:

1. `factory` が存在しない（`Unknown provider: ${providerId}`）
2. APIキーが空または未設定（`API key not found for provider: ${providerId}`）

これらのエラーは Main プロセスのコンストラクタ/初期化コードで catch されておらず、`RuntimeSkillCreatorFacade._llmAdapterStatus` が `"initializing"` のまま固着する。

**根本原因**: `LLMAdapterFactory.getAdapter()` は `await` されるため、コンストラクタ内で直接呼び出せない。Setter Injection パターン（`setLLMAdapter()`）が採用されているが、catch ブロックで `setLLMAdapterFailed()` を呼ぶコードが抜けていた。

**解決策**: 初期化コードで `try { const adapter = await LLMAdapterFactory.getAdapter(...); facade.setLLMAdapter(adapter); } catch (e) { facade.setLLMAdapterFailed(e.message); }` のパターンを徹底する。

---

#### P3: IPC 経由でエラー状態を公開する設計がなかった問題

**問題**: `RuntimeSkillCreatorFacade` に `llmAdapterStatus` getter は存在していたが、Renderer 側からこの値を取得する IPC チャネルが定義されていなかった。また、状態変化を push 通知する仕組みもなかった。

**影響**: UI は「初期化済み」を前提とした作りになっており、`"failed"` 状態を受け取るコンポーネントが存在しなかった。

**解決策**: `skill-creator:get-adapter-status`（pull）と `skill-creator:adapter-status-changed`（push）の2チャネルを追加し、Renderer 側に `useLLMAdapterStatus()` フックを実装する。

---

#### P4: toActionableMessage() の存在確認

**補足**: `RuntimeSkillCreatorFacade.ts` の末尾に `toActionableMessage(reason: string | null): string` が既に実装されている。この関数は `/api.?key|ANTHROPIC_API_KEY/i` にマッチするエラーメッセージを「APIキーを設定してください」に変換する。Renderer へのメッセージ生成時はこの関数を通すこと（または同等のロジックを Renderer 側で再実装せず、Main 側で変換済みのメッセージを返す）。

---

## 9. 備考

- このタスクは **Step 08** として並列実行可能である。他のタスクへのブロッカーにはならない。
- TASK-RT-04（APIキー設定UI）が完成した後、`LLMAdapterErrorBanner` の「設定する」ボタンの遷移先を正しいルート/モーダルに繋ぎ直すこと。
- 将来的に LLMAdapter のプロバイダーが増えた場合（OpenAI, Google 等）、エラーメッセージのプロバイダー名を含めると診断精度が上がる（例:「anthropic のAPIキーを設定してください」）。
- `LLMAdapterFactory.hasApiKey(providerId)` メソッドが既に存在するため、定期的なヘルスチェック（ポーリング）への転用も検討可能。ただし本タスクのスコープ外とする。
