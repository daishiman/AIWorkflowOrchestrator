# Anthropic API キーの設定・検証 UI - タスク指示書

## メタ情報

```yaml
issue_number: 1881
```

## メタ情報

| 項目         | 内容                                       |
| ------------ | ------------------------------------------ |
| タスクID     | TASK-RT-04                                 |
| タスク名     | Anthropic API キーの設定・検証 UI          |
| 分類         | 新機能（Runtime系）                        |
| 対象機能     | Skill Creator Agent SDK Lane - APIキー管理 |
| 優先度       | 高                                         |
| 見積もり規模 | 中規模（5〜8日）                           |
| ステータス   | 未実施                                     |
| 発見元       | P0是正パック（ギャップ分析）               |
| 発見日       | 2026-04-04                                 |
| Step         | 08（並列実行可能）                         |
| 依存タスク   | なし（他タスクと並列実行可能）             |
| 後続タスク   | TASK-P0-06（会話型UIの統合）               |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

Skill Creator Agent SDK Lane は Anthropic Claude API を内部的に呼び出してスキル生成を行う。
この API 呼び出しには有効な `ANTHROPIC_API_KEY` が必要だが、現時点では以下の問題がある。

- APIキーの設定・管理専用 UI が存在しない
- 既存の `apiKey:save` / `apiKey:validate` IPCチャネルはあるが、Skill Creator 起動フローへの統合が未実装
- TASK-SDK-SC-03（External API Support）で HttpExternalApiAdapter 向けの外部API設定フォームは実装済みだが、Anthropic Adapter 専用のキー管理フロー（起動時確認・設定誘導）が不足している

### 1.2 問題点・課題

1. **未設定時のエラーが不明確**: APIキー未設定のままスキル作成を実行すると `LLMAdapterFactory.getAdapter("anthropic")` で `Error: API key not found for provider: anthropic` が発生するが、Renderer 側にはこのエラーが生エラーとして届いており、何を設定すればいいか分からない
2. **設定への動線がない**: APIキーを設定するには Settings 画面に移動する必要があるが、Skill Creator 起動時に誘導する UI が存在しない
3. **TASK-P0-06 のブロッカー**: 会話型インタビュー UI（TASK-P0-06）は Anthropic APIキーが設定済みであることを前提とする。APIキー管理フローが未整備のままでは P0-06 の品質が担保できない

### 1.3 放置した場合の影響

- ユーザーが Skill Creator を初めて起動した際にクラッシュ様のエラーが発生し、使用方法が分からない（UX致命的）
- TASK-P0-06（会話型UI）の統合テストがブロックされる
- サポート問合せが増加する

---

## 2. 何を達成するか（What）

### 2.1 目的

Skill Creator 起動フローに「Anthropic APIキー確認・設定・検証」ステップを追加し、ユーザーが迷わずにスキル作成を開始できる状態を実現する。

### 2.2 最終ゴール

- Skill Creator 起動時（`skill-creator:start-session` IPC 送信前）に APIキーの有無を確認し、未設定の場合は設定フォームに誘導する
- APIキーの入力 → Anthropic API への疎通確認（ヘルスチェック）→ 安全なストレージへの保存 が 1 フローで完結する
- APIキーはマスク表示（`sk-ant-****...****`）し、SecureStorage（`apiKeyStorage`）に保存される
- 設定済みの場合は確認バナーを表示し、スキル作成に即進める

### 2.3 スコープ

**含むもの**

- `AnthropicApiKeySetupModal` UIコンポーネント（新規）
- `useAnthropicApiKeyStatus` カスタムフック（新規）
- IPCチャネル追加: `skill-creator:get-api-key-status`, `skill-creator:set-api-key`, `skill-creator:validate-api-key`
- Main プロセス IPCハンドラ（新規: `skillCreatorApiKeyHandlers.ts`）
- `SkillCreateWizard` または `SkillLifecyclePanel` への起動前チェック統合
- セキュアなAPIキー保存（既存 `SecureStorage` / `apiKeyStorage` を使用）
- IPC 非同期パターン（PR#1829 の `auth:login` 実装パターンを踏襲）

**含まないもの**

- 一般的な外部API接続設定（TASK-SDK-SC-03 で実装済みの `HttpExternalApiAdapter` 管理）
- LLMAdapter 初期化エラー通知・リトライ（TASK-RT-01 の責務）
- 会話型インタビューの質問/回答 UI（TASK-P0-06 の責務）
- OpenAI・Google・xAI など他プロバイダーのキー管理（既存 Settings 画面で対応済み）

### 2.4 成果物

| 成果物                 | パス                                                                                    |
| ---------------------- | --------------------------------------------------------------------------------------- |
| IPCハンドラ            | `apps/desktop/src/main/ipc/skillCreatorApiKeyHandlers.ts`（新規）                       |
| Preload API            | `apps/desktop/src/preload/skill-creator-api-key-api.ts`（新規）                         |
| UIコンポーネント       | `apps/desktop/src/renderer/components/skill/AnthropicApiKeySetupModal.tsx`（新規）      |
| カスタムフック         | `apps/desktop/src/renderer/hooks/useAnthropicApiKeyStatus.ts`（新規）                   |
| チャネル定数追加       | `packages/shared/src/ipc/channels.ts` への追記                                          |
| Preload チャネル追加   | `apps/desktop/src/preload/channels.ts` への追記                                         |
| SkillCreateWizard 統合 | `apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx` の修正               |
| ユニットテスト         | `apps/desktop/src/main/ipc/skillCreatorApiKeyHandlers.test.ts`（新規）                  |
| UIコンポーネントテスト | `apps/desktop/src/renderer/components/skill/AnthropicApiKeySetupModal.test.tsx`（新規） |

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- Node.js 20+、pnpm 9+ がインストール済み
- `apps/desktop` の開発環境が動作すること（`pnpm --filter @repo/desktop dev`）
- Anthropic APIキー（テスト用）を手元に用意すること

### 3.2 依存タスク

なし（並列実行可能）

参照すべき実装済みタスク:

- TASK-SDK-SC-03: `apps/desktop/src/renderer/components/skill/ExternalApiConfigForm.tsx` の実装パターン（API設定フォームの参考）
- PR#1829 (`auth:login` IPC 非同期化): `apps/desktop/src/main/ipc/authHandlers.ts` の非同期 IPC パターン

### 3.3 必要な知識

| 知識領域                      | 参照先                                                                                   |
| ----------------------------- | ---------------------------------------------------------------------------------------- |
| Electron IPC（invoke/handle） | `apps/desktop/src/preload/ipc-utils.ts`、`apps/desktop/src/main/ipc/authModeHandlers.ts` |
| SecureStorage（APIキー保存）  | `apps/desktop/src/main/services/secureStorage.ts`                                        |
| LLMAdapterFactory             | `apps/desktop/src/main/adapters/llm/LLMAdapterFactory.ts`                                |
| AnthropicAdapter.checkHealth  | `apps/desktop/src/main/adapters/llm/AnthropicAdapter.ts`（`checkHealth()` メソッド）     |
| IPC チャネル命名規則          | `apps/desktop/src/preload/channels.ts`、`packages/shared/src/ipc/channels.ts`            |
| IPC セキュリティ              | `apps/desktop/src/main/infrastructure/security/ipc-validator.ts`（`validateIpcSender`）  |
| エラーサニタイズ              | `apps/desktop/src/main/ipc/skillCreatorHandlers.ts` の `sanitizeErrorMessage`            |

### 3.4 推奨アプローチ

1. **Contract First（IPC仕様から先に決める）**: チャネル定数・型定義を先に実装し、Main/Renderer の両側を型安全に繋ぐ
2. **既存 SecureStorage を使い回す**: `SecureStorage.setApiKey("anthropic", key)` / `SecureStorage.getApiKey("anthropic")` で保存・取得し、新規ストレージを作らない
3. **`AnthropicAdapter.checkHealth()` を検証手段に使う**: 最小コスト（`max_tokens: 1`）で疎通確認できる実装が既にある
4. **`LLMAdapterFactory.clearInstance("anthropic")` でキャッシュ更新**: APIキー変更後は必ずインスタンスキャッシュをクリアする
5. **`sanitizeErrorMessage` パターンを踏襲**: APIキーを含むエラーメッセージは Renderer に渡す前にサニタイズし、`sk-ant-****` パターンをマスクする

---

## 4. 実行手順

### Phase 1: IPC チャネル定数の追加

**ファイル**: `packages/shared/src/ipc/channels.ts`

`SKILL_CREATOR_EXTERNAL_API_CHANNELS` の直後に以下を追加する。

```typescript
/**
 * Skill Creator Anthropic APIキー管理のIPCチャネル
 * TASK-RT-04: API Key Management UI
 */
export const SKILL_CREATOR_API_KEY_CHANNELS = {
  /** Renderer → Main: APIキーの設定状況を取得 */
  GET_API_KEY_STATUS: "skill-creator:get-api-key-status",
  /** Renderer → Main: APIキーを保存 */
  SET_API_KEY: "skill-creator:set-api-key",
  /** Renderer → Main: APIキーの接続検証（Anthropic APIへのヘルスチェック） */
  VALIDATE_API_KEY: "skill-creator:validate-api-key",
} as const;
```

**ファイル**: `apps/desktop/src/preload/channels.ts`

`SKILL_CREATOR_EXTERNAL_API_CHANNELS` のスプレッドの後に追記する。

```typescript
// 既存
...SKILL_CREATOR_EXTERNAL_API_CHANNELS,

// 追加
...SKILL_CREATOR_API_KEY_CHANNELS,
```

また `import` 文に `SKILL_CREATOR_API_KEY_CHANNELS` を追加する。

---

### Phase 2: 共有型定義の追加

**ファイル**: `packages/shared/src/types/skill-creator-api-key.ts`（新規）

```typescript
/**
 * TASK-RT-04: Skill Creator APIキー管理 共有型定義
 */

/** APIキーの設定状況 */
export interface AnthropicApiKeyStatus {
  /** APIキーが設定されているかどうか */
  isSet: boolean;
  /** マスク表示用文字列（設定済みの場合のみ。例: "sk-ant-****...****"） */
  maskedKey?: string;
  /** 最後に検証した日時（ISO 8601） */
  lastValidatedAt?: string;
}

/** APIキー設定リクエスト */
export interface SetAnthropicApiKeyRequest {
  apiKey: string;
}

/** APIキー検証レスポンス */
export interface ValidateAnthropicApiKeyResult {
  /** 検証成功かどうか */
  success: boolean;
  /** エラーメッセージ（失敗時のみ） */
  errorMessage?: string;
  /** レイテンシ（ms） */
  latency?: number;
}
```

**ファイル**: `packages/shared/src/types/index.ts`

上記の型をエクスポートに追加する。

---

### Phase 3: Main プロセス IPCハンドラの実装

**ファイル**: `apps/desktop/src/main/ipc/skillCreatorApiKeyHandlers.ts`（新規）

```typescript
/**
 * Skill Creator Anthropic APIキー管理 IPCハンドラ
 * TASK-RT-04
 */
import { ipcMain } from "electron";
import type { IpcMainInvokeEvent } from "electron";
import { IPC_CHANNELS } from "../../preload/channels";
import { SecureStorage } from "../services/secureStorage";
import { LLMAdapterFactory } from "../adapters/llm/LLMAdapterFactory";
import { AnthropicAdapter } from "../adapters/llm/AnthropicAdapter";
import { validateIpcSender } from "../infrastructure/security/ipc-validator";
import type {
  AnthropicApiKeyStatus,
  SetAnthropicApiKeyRequest,
  ValidateAnthropicApiKeyResult,
} from "@repo/shared/types/skill-creator-api-key";

/** APIキーのマスク表示（末尾4文字のみ表示） */
function maskApiKey(key: string): string {
  if (key.length <= 8) return "****";
  return `sk-ant-****...${key.slice(-4)}`;
}

/** エラーメッセージのサニタイズ（APIキー漏洩防止） */
function sanitizeError(error: unknown): string {
  if (!(error instanceof Error)) return "不明なエラーが発生しました";
  return error.message
    .replace(/sk-ant-[\w-]+/gi, "sk-***")
    .replace(/(api.?key|token|secret)=\S+/gi, "$1=***");
}

export function registerSkillCreatorApiKeyHandlers(): void {
  // APIキーの設定状況取得
  ipcMain.handle(
    IPC_CHANNELS.GET_API_KEY_STATUS,
    async (event: IpcMainInvokeEvent): Promise<AnthropicApiKeyStatus> => {
      const validation = validateIpcSender(event.senderFrame);
      if (!validation.valid) {
        return { isSet: false };
      }

      try {
        const apiKey = await SecureStorage.getApiKey("anthropic");
        if (!apiKey || apiKey.length === 0) {
          return { isSet: false };
        }
        return {
          isSet: true,
          maskedKey: maskApiKey(apiKey),
        };
      } catch {
        return { isSet: false };
      }
    },
  );

  // APIキーの保存
  ipcMain.handle(
    IPC_CHANNELS.SET_API_KEY,
    async (
      event: IpcMainInvokeEvent,
      request: SetAnthropicApiKeyRequest,
    ): Promise<{ success: boolean; errorMessage?: string }> => {
      const validation = validateIpcSender(event.senderFrame);
      if (!validation.valid) {
        return { success: false, errorMessage: "不正なリクエスト送信元です" };
      }

      try {
        const { apiKey } = request;
        if (!apiKey || apiKey.trim().length === 0) {
          return { success: false, errorMessage: "APIキーを入力してください" };
        }
        await SecureStorage.setApiKey("anthropic", apiKey.trim());
        // キャッシュをクリアして次回 getAdapter 時に新しいキーを使う
        LLMAdapterFactory.clearInstance("anthropic");
        return { success: true };
      } catch (error) {
        return { success: false, errorMessage: sanitizeError(error) };
      }
    },
  );

  // APIキーの接続検証
  ipcMain.handle(
    IPC_CHANNELS.VALIDATE_API_KEY,
    async (
      event: IpcMainInvokeEvent,
      request?: SetAnthropicApiKeyRequest,
    ): Promise<ValidateAnthropicApiKeyResult> => {
      const validation = validateIpcSender(event.senderFrame);
      if (!validation.valid) {
        return { success: false, errorMessage: "不正なリクエスト送信元です" };
      }

      try {
        // 一時的なキー（引数）か、保存済みキーを使う
        let apiKey: string | null = request?.apiKey?.trim() ?? null;
        if (!apiKey) {
          apiKey = await SecureStorage.getApiKey("anthropic");
        }
        if (!apiKey || apiKey.length === 0) {
          return {
            success: false,
            errorMessage: "APIキーが設定されていません",
          };
        }

        const adapter = new AnthropicAdapter(apiKey);
        const result = await adapter.checkHealth();

        if (result.status === "connected") {
          return { success: true, latency: result.latency };
        } else {
          return {
            success: false,
            errorMessage: result.errorMessage ?? "接続に失敗しました",
          };
        }
      } catch (error) {
        return { success: false, errorMessage: sanitizeError(error) };
      }
    },
  );
}

export function unregisterSkillCreatorApiKeyHandlers(): void {
  ipcMain.removeHandler(IPC_CHANNELS.GET_API_KEY_STATUS);
  ipcMain.removeHandler(IPC_CHANNELS.SET_API_KEY);
  ipcMain.removeHandler(IPC_CHANNELS.VALIDATE_API_KEY);
}
```

**ファイル**: `apps/desktop/src/main/ipc/index.ts`

`registerSkillCreatorApiKeyHandlers` を既存のハンドラ登録処理の中に追加する。

---

### Phase 4: Preload API の実装

**ファイル**: `apps/desktop/src/preload/skill-creator-api-key-api.ts`（新規）

```typescript
/**
 * Skill Creator APIキー管理 Preload API
 * TASK-RT-04
 */
import { ALLOWED_INVOKE_CHANNELS } from "./channels";
import { invokeWithTimeout } from "./ipc-utils";
import { IPC_CHANNELS } from "./channels";
import type {
  AnthropicApiKeyStatus,
  SetAnthropicApiKeyRequest,
  ValidateAnthropicApiKeyResult,
} from "@repo/shared/types/skill-creator-api-key";

function safeInvoke<T>(channel: string, ...args: unknown[]): Promise<T> {
  return invokeWithTimeout<T>(ALLOWED_INVOKE_CHANNELS, channel, ...args);
}

export interface SkillCreatorApiKeyAPI {
  getApiKeyStatus: () => Promise<AnthropicApiKeyStatus>;
  setApiKey: (
    request: SetAnthropicApiKeyRequest,
  ) => Promise<{ success: boolean; errorMessage?: string }>;
  validateApiKey: (
    request?: SetAnthropicApiKeyRequest,
  ) => Promise<ValidateAnthropicApiKeyResult>;
}

export const skillCreatorApiKeyAPI: SkillCreatorApiKeyAPI = {
  getApiKeyStatus: () =>
    safeInvoke<AnthropicApiKeyStatus>(IPC_CHANNELS.GET_API_KEY_STATUS),
  setApiKey: (request) =>
    safeInvoke<{ success: boolean; errorMessage?: string }>(
      IPC_CHANNELS.SET_API_KEY,
      request,
    ),
  validateApiKey: (request?) =>
    safeInvoke<ValidateAnthropicApiKeyResult>(
      IPC_CHANNELS.VALIDATE_API_KEY,
      request,
    ),
};
```

**ファイル**: `apps/desktop/src/preload/index.ts`

`contextBridge.exposeInMainWorld` の公開オブジェクトに `skillCreatorApiKey: skillCreatorApiKeyAPI` を追加する。

**ファイル**: `apps/desktop/src/preload/types.ts` / `types.d.ts`

`Window` 型定義に `skillCreatorApiKey: SkillCreatorApiKeyAPI` を追加する。

---

### Phase 5: カスタムフックの実装

**ファイル**: `apps/desktop/src/renderer/hooks/useAnthropicApiKeyStatus.ts`（新規）

```typescript
/**
 * Anthropic APIキー状態管理フック
 * TASK-RT-04
 */
import { useState, useEffect, useCallback } from "react";
import type {
  AnthropicApiKeyStatus,
  ValidateAnthropicApiKeyResult,
} from "@repo/shared/types/skill-creator-api-key";

export interface UseAnthropicApiKeyStatusReturn {
  /** 現在のAPIキー状態 */
  status: AnthropicApiKeyStatus | null;
  /** ローディング中かどうか */
  isLoading: boolean;
  /** エラーメッセージ */
  errorMessage: string | null;
  /** APIキーを保存する */
  saveApiKey: (apiKey: string) => Promise<boolean>;
  /** APIキーを検証する（引数なしの場合は保存済みキーを使用） */
  validateApiKey: (apiKey?: string) => Promise<ValidateAnthropicApiKeyResult>;
  /** 状態を再取得する */
  refresh: () => Promise<void>;
}

export function useAnthropicApiKeyStatus(): UseAnthropicApiKeyStatusReturn {
  const [status, setStatus] = useState<AnthropicApiKeyStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const result = await window.skillCreatorApiKey.getApiKeyStatus();
      setStatus(result);
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : "状態取得に失敗しました",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const saveApiKey = useCallback(
    async (apiKey: string): Promise<boolean> => {
      setIsLoading(true);
      setErrorMessage(null);
      try {
        const result = await window.skillCreatorApiKey.setApiKey({ apiKey });
        if (result.success) {
          await refresh();
          return true;
        } else {
          setErrorMessage(result.errorMessage ?? "保存に失敗しました");
          return false;
        }
      } catch (err) {
        setErrorMessage(
          err instanceof Error ? err.message : "保存に失敗しました",
        );
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [refresh],
  );

  const validateApiKey = useCallback(
    async (apiKey?: string): Promise<ValidateAnthropicApiKeyResult> => {
      try {
        return await window.skillCreatorApiKey.validateApiKey(
          apiKey ? { apiKey } : undefined,
        );
      } catch (err) {
        return {
          success: false,
          errorMessage:
            err instanceof Error ? err.message : "検証に失敗しました",
        };
      }
    },
    [],
  );

  return {
    status,
    isLoading,
    errorMessage,
    saveApiKey,
    validateApiKey,
    refresh,
  };
}
```

---

### Phase 6: UIコンポーネントの実装

**ファイル**: `apps/desktop/src/renderer/components/skill/AnthropicApiKeySetupModal.tsx`（新規）

モーダルの要件:

- `isOpen: boolean`, `onClose: () => void`, `onSuccess: () => void` を Props として受け取る
- APIキー入力フィールド（type="password"、トグルで表示/非表示切替）
- 入力中は `sk-ant-` プレフィックスをガイダンスとして表示
- 「接続テスト」ボタン: `validateApiKey(inputValue)` を実行し、結果をインライン表示（成功: 緑バナー + レイテンシ、失敗: 赤バナー + エラー）
- 「保存」ボタン: `saveApiKey(inputValue)` を実行し、成功時に `onSuccess()` を呼ぶ
- 既存のキーがある場合: マスク表示（`maskedKey`）と「更新」モードの表示切替
- Tailwind CSS でスタイリング
- ロード中は Spinner 表示（既存の `Spinner` コンポーネントを流用）

```tsx
// コンポーネントのシグネチャ（Props型）
interface AnthropicApiKeySetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function AnthropicApiKeySetupModal({
  isOpen,
  onClose,
  onSuccess,
}: AnthropicApiKeySetupModalProps): React.JSX.Element | null {
  // 実装は useAnthropicApiKeyStatus フックを使う
  // ...
}
```

**ファイル**: `apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx`

既存の `SkillCreateWizard` の先頭（ステップ 0 の前）に APIキーチェックステップを追加する。

```tsx
// 追加するロジックのイメージ
const { status: apiKeyStatus, isLoading: apiKeyLoading } =
  useAnthropicApiKeyStatus();
const [showApiKeyModal, setShowApiKeyModal] = useState(false);

// レンダリング部分の先頭に追加
if (!apiKeyLoading && !apiKeyStatus?.isSet) {
  // APIキー未設定の場合: モーダル表示 or インラインバナーで誘導
}
```

または、`SkillLifecyclePanel.tsx` の起動ボタン押下時に確認フローを差し込む方法（どちらが適切かはコードリーディングで判断する）。

---

### Phase 7: ユニットテストの実装

**ファイル**: `apps/desktop/src/main/ipc/skillCreatorApiKeyHandlers.test.ts`（新規）

テストケース:

- APIキー未設定時に `getApiKeyStatus` が `{ isSet: false }` を返す
- APIキー設定済み時に `getApiKeyStatus` が `{ isSet: true, maskedKey: "sk-ant-****...xxxx" }` を返す
- `setApiKey` に空文字を渡すとバリデーションエラーが返る
- `setApiKey` 成功後に `LLMAdapterFactory.clearInstance` が呼ばれる
- `validateApiKey` が `AnthropicAdapter.checkHealth` の結果を正しくマッピングする
- エラーサニタイズ: APIキーを含むエラーメッセージが `sk-***` にマスクされる

**ファイル**: `apps/desktop/src/renderer/components/skill/AnthropicApiKeySetupModal.test.tsx`（新規）

テストケース:

- モーダルが開いている場合に入力フィールドが表示される
- 「接続テスト」ボタン押下で `validateApiKey` IPC が呼ばれる
- 検証成功時にサクセスバナーが表示される
- 検証失敗時にエラーバナーが表示される
- 「保存」ボタン押下で `saveApiKey` IPC が呼ばれ、成功時に `onSuccess` が発火する

---

## 5. 完了条件チェックリスト

### IPC 層

- [ ] `packages/shared/src/ipc/channels.ts` に `SKILL_CREATOR_API_KEY_CHANNELS` が追加されている
- [ ] `apps/desktop/src/preload/channels.ts` にチャネル定数がスプレッドされている
- [ ] `apps/desktop/src/preload/channels.ts` の `ALLOWED_INVOKE_CHANNELS` に 3 チャネルが含まれている
- [ ] `apps/desktop/src/preload/types.ts` / `types.d.ts` に `skillCreatorApiKey` の型定義がある
- [ ] `apps/desktop/src/preload/index.ts` で `skillCreatorApiKey` が `contextBridge.exposeInMainWorld` に公開されている

### Main プロセス

- [ ] `skillCreatorApiKeyHandlers.ts` が実装されている
- [ ] `validateIpcSender` によるセキュリティチェックが全ハンドラに適用されている
- [ ] APIキー文字列をサニタイズした上でエラーメッセージをレスポンスに含める
- [ ] `SecureStorage.setApiKey("anthropic", ...)` でキーが保存される
- [ ] `LLMAdapterFactory.clearInstance("anthropic")` でキャッシュがクリアされる
- [ ] `AnthropicAdapter.checkHealth()` でヘルスチェックが行われる
- [ ] `apps/desktop/src/main/ipc/index.ts` でハンドラ登録が行われている

### Renderer / UI

- [ ] `useAnthropicApiKeyStatus` フックが実装されている
- [ ] `AnthropicApiKeySetupModal` コンポーネントが実装されている
- [ ] APIキーはパスワードフィールドで入力でき、表示/非表示切替ができる
- [ ] 接続テストボタンで検証結果（レイテンシ or エラー）がインライン表示される
- [ ] `SkillCreateWizard` または `SkillLifecyclePanel` 起動時に APIキー確認フローが統合されている
- [ ] APIキー未設定時に設定誘導モーダルが表示される
- [ ] APIキー設定済み時にはスムーズにスキル作成フローに進める

### テスト・品質

- [ ] `pnpm --filter @repo/desktop test` がグリーンになる
- [ ] `pnpm --filter @repo/shared build` が成功する
- [ ] `pnpm typecheck` がエラーなく通る
- [ ] `pnpm lint` がエラーなく通る
- [ ] `skillCreatorApiKeyHandlers.test.ts` のユニットテストが全ケースパスする
- [ ] `AnthropicApiKeySetupModal.test.tsx` のコンポーネントテストが全ケースパスする

---

## 6. 検証方法

### 手動検証シナリオ

**シナリオ A: APIキー未設定状態からスキル作成**

1. `SecureStorage` から `anthropic` キーを削除した状態でアプリ起動
2. Skill Creator を開く
3. APIキー未設定の警告バナーまたはモーダルが表示されることを確認
4. APIキーを入力し「接続テスト」をクリック
5. 「接続成功（レイテンシ: XXms）」バナーが表示されることを確認
6. 「保存」をクリック
7. モーダルが閉じ、スキル作成フローに進めることを確認

**シナリオ B: APIキー設定済み状態でスキル作成**

1. `anthropic` のAPIキーが設定済みの状態でアプリ起動
2. Skill Creator を開く
3. APIキー確認の画面なしにスキル作成フローに直接進めることを確認

**シナリオ C: 無効なAPIキーの入力**

1. 無効なAPIキー（例: `sk-ant-invalid-key`）を入力
2. 「接続テスト」をクリック
3. エラーバナーが表示され、APIキーが伏せ字になっていることを確認（`sk-***` 形式）
4. 「保存」ボタンが無効化されているか、保存後に再入力を促す UI が表示されること

**シナリオ D: IPC セキュリティ**

1. DevTools から `window.skillCreatorApiKey.setApiKey({ apiKey: "malicious-key" })` を実行
2. `validateIpcSender` によって弾かれることを確認（正規の Renderer からは通る）

---

## 7. リスクと対策

| リスク                                     | 影響度 | 発生確率 | 対策                                                                         |
| ------------------------------------------ | ------ | -------- | ---------------------------------------------------------------------------- |
| `ALLOWED_INVOKE_CHANNELS` への追加漏れ     | 高     | 中       | Phase 1 完了後に `pnpm --filter @repo/desktop test:preload` などで確認       |
| `LLMAdapterFactory.clearInstance` 呼び忘れ | 中     | 中       | テストで保存後のアダプターキャッシュ挙動を検証する                           |
| APIキー文字列がエラーログに漏れる          | 高     | 低       | `sanitizeError` でパターンマッチングをテストで担保                           |
| `SkillCreateWizard` のフロー破壊           | 高     | 低       | 既存のウィザードステップ（STEPS 配列）を変更せず、前段チェックとして追加する |
| `AnthropicAdapter.checkHealth` のコスト    | 低     | 低       | `max_tokens: 1` で最小コスト呼び出し済み（既存実装通り）                     |
| `SecureStorage` とのロック競合             | 低     | 低       | `apiKeyStorage` は非同期 await チェーンで直列化されているため問題なし        |

### 苦戦予測箇所と事前対策

**苦戦1: `ALLOWED_INVOKE_CHANNELS` と `ALLOWED_ON_CHANNELS` の管理**

- `preload/channels.ts` の末尾に定義されているホワイトリスト配列に 3 チャネルを追加し忘れると IPC が動かない
- 対策: Phase 1 完了直後にユニットテストで `ALLOWED_INVOKE_CHANNELS.includes("skill-creator:get-api-key-status")` をアサートする

**苦戦2: Preload 型定義の `contextBridge` 公開漏れ**

- `preload/index.ts` の `exposeInMainWorld` 呼び出しと `preload/types.d.ts` の `Window` 型定義の両方を更新しないとランタイムエラーになる
- 対策: Phase 4 完了後に `pnpm typecheck` を必ず実行する

**苦戦3: `SkillCreateWizard` の既存フロー設計との整合**

- ウィザードは `STEPS` 配列でステップを管理しているため、APIキーチェックをステップ追加で実装すると StepIndicator の表示が崩れる
- 対策: ステップは追加せず、ウィザードの Step 0 表示前に「ガード」として条件分岐でモーダルを差し込む

---

## 8. 参照情報

### 関連ドキュメント

| ドキュメント                        | パス                                                                                    |
| ----------------------------------- | --------------------------------------------------------------------------------------- |
| TASK-SDK-SC-03（外部API設定）       | `docs/30-workflows/unassigned-task/task-sdk-sc-03-external-api-support.md`              |
| TASK-SC-13（認証モードAPIキー実装） | `docs/30-workflows/unassigned-task/TASK-SC-13-AUTH-MODE-API-KEY-IMPLEMENTATION.md`      |
| RT-02（Adapter Status Integration） | `docs/30-workflows/unassigned-task/task-rt-02-api-key-ui-adapter-status-integration.md` |

### 関連実装ファイル（読むべき順）

1. `apps/desktop/src/main/services/secureStorage.ts` - APIキー保存ロジック
2. `apps/desktop/src/main/adapters/llm/AnthropicAdapter.ts` - `checkHealth()` の実装
3. `apps/desktop/src/main/adapters/llm/LLMAdapterFactory.ts` - `clearInstance()` の実装
4. `apps/desktop/src/main/ipc/authModeHandlers.ts` - IPCハンドラの実装パターン・`sanitizeErrorMessage` の参考
5. `apps/desktop/src/main/ipc/skillCreatorHandlers.ts` - `validateIpcSender` の使用例
6. `apps/desktop/src/preload/skill-creator-session-api.ts` - Preload API の実装パターン
7. `apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx` - 統合先コンポーネント

### 苦戦箇所の記録

- **HttpExternalApiAdapter との統合判断**: TASK-SDK-SC-03 の `ExternalApiConfigForm` は汎用的な外部API設定 UI。Anthropic APIキー専用のフローはこれとは独立して実装し、共通化は後続リファクタリングタスクに委ねる（現時点では分離を維持）
- **APIキーのSecretとしての秘匿化**: `SecureStorage.setApiKey` は内部で `apiKeyStorage.saveApiKey` を呼び出しており、Electron の `safeStorage`（OS キーチェーン）を使っているため、追加の暗号化実装は不要
- **Skill Creator起動フローへの統合方法**: `SkillCreateWizard.tsx` の `STEPS` 配列を変更するとステップインジケーターの表示が変わるため、ステップ 0 の手前に「前提チェック」として条件分岐を挿入する方針を採用する
- **IPC 非同期パターン**: PR#1829 で `auth:login` が非同期化された実績あり。`skill-creator:validate-api-key` も同様に `ipcMain.handle` の非同期ハンドラとして実装し、Renderer 側は `await window.skillCreatorApiKey.validateApiKey()` で待機する

---

## 9. 備考

- 本タスクは TASK-P0-06（会話型インタビュー UI）の前提条件を満たすために優先的に実施する
- APIキーの入力 UI は設定画面（Settings）の `API Key` タブとの重複を避けるため、Skill Creator 専用の「起動前ガード」として実装する。設定画面側は既存のまま維持する
- TASK-RT-01（LLMAdapter 初期化エラー通知）が実装される場合、本タスクの APIキー未設定ガードと連携して「エラー → 設定誘導」フローを構築できる。ただし本タスクでは TASK-RT-01 との結合は行わず、独立して完結させる
- IPCチャネルのプレフィックスに `skill-creator:` を使用することで、既存の `apiKey:save` / `apiKey:validate`（汎用LLM APIキー管理）と名前空間を分離する
