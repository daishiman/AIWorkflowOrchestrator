# Phase 5: 実装

## メタ情報

| 項目          | 値                                                                                                                     |
| ------------- | ---------------------------------------------------------------------------------------------------------------------- |
| Phase番号     | 5                                                                                                                      |
| 機能名        | WorkspaceChat ストリーミングエラーUX改善                                                                               |
| タスクID      | TASK-FIX-WORKSPACE-CHAT-STREAM-ERROR                                                                                   |
| 作成日        | 2026-03-20                                                                                                             |
| 前Phase成果物 | `docs/30-workflows/ai-chat-llm-integration-fix/tasks/04-TASK-FIX-WORKSPACE-CHAT-STREAM-ERROR/phase-4-test-creation.md` |

## 目的

Phase 4で作成したテストを Green にする実装を行う。`StreamingErrorState` 型定義、`mapLLMErrorToStreamingError` ヘルパー関数、`StreamingErrorDisplay` コンポーネント、`useWorkspaceChatController` のエラーハンドリング拡張、`WorkspaceChatPanel` への統合を順番に実装する。

## 実行タスク

### Task 1: 実装前の現状調査（P50チェック）

```bash
# 既存のエラーハンドリング実装を確認
grep -n "onStreamError\|streamingError\|errorMessage\|setErrorMessage" \
  apps/desktop/src/renderer/views/WorkspaceView/hooks/useWorkspaceChatController.ts

# Task 1との共通化確認（TASK-FIX-CHATVIEW-ERROR-SILENT-FAILURE）
grep -rn "StreamingErrorState\|StreamingErrorDisplay\|StreamingErrorAction" \
  apps/desktop/src/renderer/views/ \
  apps/desktop/src/renderer/store/ \
  packages/shared/src/

# Settings遷移パターンの確認
grep -rn "navigate.*setting\|openSettings\|useNavigate\|setView\|workspaceView" \
  apps/desktop/src/renderer/views/WorkspaceView/ \
  apps/desktop/src/renderer/store/ | head -20

# WorkspaceChatController インターフェース確認
grep -n "interface WorkspaceChatController" \
  apps/desktop/src/renderer/views/WorkspaceView/hooks/useWorkspaceChatController.ts
```

### Task 2: 型定義の作成

#### 2-A: StreamingErrorState 型の配置先決定

調査結果に基づき以下のいずれかに配置する:

- **選択肢A**: `apps/desktop/src/renderer/views/WorkspaceView/types.ts`（WorkspaceView専用の場合）
- **選択肢B**: `packages/shared/src/types/llm/schemas.ts`（Task 1との共有が必要な場合）

Task 1 (`TASK-FIX-CHATVIEW-ERROR-SILENT-FAILURE`) で同一型が既に存在する場合はそれを流用する。

#### 2-B: 型定義コード

```typescript
export type StreamingErrorAction = "SETTINGS" | "RETRY" | null;

export interface StreamingErrorState {
  /** エラーコード（例: "API_KEY_MISSING", "NETWORK_ERROR"） */
  code: string;
  /** ユーザー向け日本語エラーメッセージ */
  message: string;
  /** リトライ可能かどうか */
  retryable: boolean;
  /** UIに表示するアクション種別 */
  action: StreamingErrorAction;
  /** RATE_LIMIT時などの追加ヒントテキスト */
  hint?: string;
}
```

### Task 3: mapLLMErrorToStreamingError ヘルパー関数の実装

**ファイル**: `apps/desktop/src/renderer/views/WorkspaceView/hooks/mapLLMErrorToStreamingError.ts`

```typescript
import type { StreamingErrorState } from "../types";

type LLMError = { code?: string; message: string };

export function mapLLMErrorToStreamingError(
  error: LLMError,
): StreamingErrorState {
  const code = error.code ?? "UNKNOWN";

  switch (code) {
    case "API_KEY_MISSING":
      return {
        code,
        message: "APIキーが設定されていません。",
        retryable: false,
        action: "SETTINGS",
      };
    case "MODEL_NOT_FOUND":
      return {
        code,
        message:
          "指定されたモデルが見つかりません。Settings でモデルを再選択してください。",
        retryable: false,
        action: "SETTINGS",
      };
    case "NETWORK_ERROR":
      return {
        code,
        message: "ネットワークエラーが発生しました。",
        retryable: true,
        action: "RETRY",
      };
    case "TIMEOUT":
      return {
        code,
        message: "リクエストがタイムアウトしました。",
        retryable: true,
        action: "RETRY",
      };
    case "RATE_LIMIT":
      return {
        code,
        message: "API のレート制限に達しました。",
        retryable: true,
        action: "RETRY",
        hint: "しばらく待ってから再試行してください。",
      };
    case "VALIDATION_ERROR":
      return {
        code,
        message: `リクエストの検証に失敗しました: ${error.message}`,
        retryable: false,
        action: null,
      };
    default:
      return {
        code,
        message: `AI応答に失敗しました: ${error.message}`,
        retryable: false,
        action: null,
      };
  }
}
```

### Task 4: StreamingErrorDisplay コンポーネントの実装

**ファイル**: `apps/desktop/src/renderer/views/WorkspaceView/components/StreamingErrorDisplay.tsx`

Task 1 (`TASK-FIX-CHATVIEW-ERROR-SILENT-FAILURE`) で類似コンポーネントが実装済みの場合、共通コンポーネントを流用またはextendする。独立実装の場合は以下を実装する。

```typescript
import React, { useCallback } from "react";
import type { StreamingErrorState } from "../types";

interface StreamingErrorDisplayProps {
  error: StreamingErrorState;
  onDismiss: () => void;
  onRetry: () => Promise<void>;
  onOpenSettings: () => void;
  isRetrying?: boolean;
}

export function StreamingErrorDisplay({
  error,
  onDismiss,
  onRetry,
  onOpenSettings,
  isRetrying = false,
}: StreamingErrorDisplayProps) {
  const handleRetry = useCallback(async () => {
    await onRetry();
  }, [onRetry]);

  return (
    <div
      role="alert"
      aria-live="assertive"
      className="mx-4 mb-2 flex flex-col gap-1 rounded-lg border border-[#C6C6C8] bg-[rgba(255,59,48,0.08)] p-3
        dark:border-[#38383A] dark:bg-[rgba(255,69,58,0.12)]"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-2">
          {/* エラーアイコン */}
          <span
            className="mt-0.5 text-sm text-[#FF3B30] dark:text-[#FF453A]"
            aria-hidden="true"
          >
            ⚠
          </span>
          {/* エラーメッセージ */}
          <span className="text-sm text-[#FF3B30] dark:text-[#FF453A]">
            {error.message}
          </span>
        </div>

        {/* Dismissボタン */}
        <button
          onClick={onDismiss}
          aria-label="エラーを閉じる"
          className="flex-shrink-0 rounded p-0.5 text-[#FF3B30] hover:opacity-70
            dark:text-[#FF453A]"
        >
          <span aria-hidden="true">×</span>
        </button>
      </div>

      {/* RATE_LIMIT ヒント */}
      {error.hint && (
        <p className="ml-5 text-xs text-[rgba(60,60,67,0.6)] dark:text-[rgba(235,235,245,0.6)]">
          {error.hint}
        </p>
      )}

      {/* アクションボタン */}
      {error.action === "SETTINGS" && (
        <div className="ml-5 mt-1">
          <button
            onClick={onOpenSettings}
            aria-label="設定を開く"
            className="rounded px-3 py-1 text-sm font-medium text-[#007AFF]
              hover:opacity-70 dark:text-[#0A84FF]"
          >
            設定を開く
          </button>
        </div>
      )}

      {error.action === "RETRY" && (
        <div className="ml-5 mt-1">
          <button
            onClick={handleRetry}
            disabled={isRetrying}
            aria-label={isRetrying ? "再試行中" : "再試行"}
            className="rounded px-3 py-1 text-sm font-medium text-[#007AFF]
              hover:opacity-70 disabled:cursor-not-allowed disabled:opacity-40
              dark:text-[#0A84FF]"
          >
            {isRetrying ? "再試行中..." : "再試行"}
          </button>
        </div>
      )}
    </div>
  );
}
```

### Task 5: useWorkspaceChatController.ts の拡張

#### 5-A: state追加（既存ファイルを編集）

```typescript
// useState追加（既存の const [errorMessage, ...] の直後に追加）
const [streamingError, setStreamingError] =
  useState<StreamingErrorState | null>(null);

// lastUserMessageRef追加（既存refの直後に追加）
const lastUserMessageRef = useRef<string | null>(null);
```

#### 5-B: dismissStreamingError の追加

```typescript
const dismissStreamingError = useCallback(() => {
  setStreamingError(null);
  setErrorMessage(null);
}, []);
```

#### 5-C: onStreamError ハンドラの改修

既存の `disposeError` 内で `setErrorMessage` を呼んでいる箇所の直後に追加:

```typescript
// 構造化エラー状態を設定（新規追加）
const structured = mapLLMErrorToStreamingError(error);
setStreamingError(structured);
```

#### 5-D: sendMessage での lastUserMessageRef 更新

既存の `sendMessage` 内で `window.electronAPI.llm.sendMessage` 呼び出し直前に追加:

```typescript
lastUserMessageRef.current = inputToSend;
```

#### 5-E: retryLastMessage の実装

Settings遷移の既存パターンを調査した上で実装する:

```typescript
const retryLastMessage = useCallback(async () => {
  if (!streamingError?.retryable || !lastUserMessageRef.current) {
    return;
  }
  const messageToRetry = lastUserMessageRef.current;
  dismissStreamingError();
  // 既存の sendMessage ロジックを再利用
  await sendMessage(messageToRetry);
}, [streamingError, dismissStreamingError, sendMessage]);
```

#### 5-F: WorkspaceChatController インターフェースへの追加

```typescript
export interface WorkspaceChatController {
  // ... 既存フィールド維持 ...
  streamingError: StreamingErrorState | null;
  retryLastMessage: () => Promise<void>;
  dismissStreamingError: () => void;
}
```

#### 5-G: return オブジェクトへの追加

```typescript
return {
  // ... 既存フィールド維持 ...
  streamingError,
  retryLastMessage,
  dismissStreamingError,
};
```

### Task 6: WorkspaceChatPanel.tsx への統合

```typescript
// 追加インポート
import { StreamingErrorDisplay } from "./components/StreamingErrorDisplay";

// コントローラーから取得
const {
  streamingError,
  retryLastMessage,
  dismissStreamingError,
  // ... 既存フィールド
} = useWorkspaceChatController();

// Settings遷移ハンドラ（調査結果に基づく既存パターンを使用）
const handleOpenSettings = useCallback(() => {
  // Task 1の調査結果に基づいて実装
  // 例: navigateToSettings() または useAppStore のアクション呼び出し
}, []);

// JSX内（チャット入力の上部に追加）
{streamingError && (
  <StreamingErrorDisplay
    error={streamingError}
    onDismiss={dismissStreamingError}
    onRetry={retryLastMessage}
    onOpenSettings={handleOpenSettings}
    isRetrying={isSending}
  />
)}
```

### Task 7: 型チェックと動作確認

```bash
# TypeScriptの型チェック
pnpm --filter @repo/desktop typecheck

# テストの実行（Green になることを確認）
cd apps/desktop && pnpm vitest run src/renderer/views/WorkspaceView

# lint
pnpm --filter @repo/desktop lint
```

## 参照資料

| ドキュメント         | パス                                                                                                                   | 参照目的                    |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------- | --------------------------- |
| Phase 2 設計書       | `docs/30-workflows/ai-chat-llm-integration-fix/tasks/04-TASK-FIX-WORKSPACE-CHAT-STREAM-ERROR/phase-2-design.md`        | 型定義・実装設計            |
| Phase 4 テスト       | `docs/30-workflows/ai-chat-llm-integration-fix/tasks/04-TASK-FIX-WORKSPACE-CHAT-STREAM-ERROR/phase-4-test-creation.md` | テストケース確認            |
| P50 既実装確認       | `.claude/rules/06-known-pitfalls.md`                                                                                   | 実装前の現状調査必須        |
| P31 無限ループ対策   | `.claude/rules/06-known-pitfalls.md`                                                                                   | useCallback依存配列チェック |
| アーキテクチャルール | `.claude/rules/01-architecture.md`                                                                                     | Apple HIG カラー定義        |

## 実行手順

1. **Task 1**: 既存コードを調査し実装前の現状を把握する（P50チェック）
2. **Task 2**: 型定義を作成する（または既存型を確認して流用する）
3. **Task 3**: `mapLLMErrorToStreamingError` を独立ファイルとして実装する
4. **Task 4**: `StreamingErrorDisplay` コンポーネントを実装する
5. **Task 5-A〜G**: `useWorkspaceChatController.ts` を段階的に拡張する
6. **Task 6**: `WorkspaceChatPanel.tsx` に `StreamingErrorDisplay` を統合する
7. **Task 7**: 型チェック・テスト・lint を実行して Green を確認する

## 統合テスト連携

- 現行実装との差分、対象テスト、依存タスクとの接続点をこのPhaseで確認・更新する。
- 追加・変更したテスト観点は対応する `apps/desktop/src/` の実装ファイルと1対1で突合する。

## 成果物

| 成果物                               | パス                                                                                                                    | 形式       |
| ------------------------------------ | ----------------------------------------------------------------------------------------------------------------------- | ---------- |
| 型定義                               | `apps/desktop/src/renderer/views/WorkspaceView/types.ts`（または既存ファイル）                                          | TypeScript |
| mapLLMErrorToStreamingError          | `apps/desktop/src/renderer/views/WorkspaceView/hooks/mapLLMErrorToStreamingError.ts`                                    | TypeScript |
| StreamingErrorDisplay コンポーネント | `apps/desktop/src/renderer/views/WorkspaceView/components/StreamingErrorDisplay.tsx`                                    | TypeScript |
| useWorkspaceChatController（拡張後） | `apps/desktop/src/renderer/views/WorkspaceView/hooks/useWorkspaceChatController.ts`                                     | TypeScript |
| WorkspaceChatPanel（統合後）         | `apps/desktop/src/renderer/views/WorkspaceView/WorkspaceChatPanel.tsx`                                                  | TypeScript |
| Phase 5 仕様書（本ファイル）         | `docs/30-workflows/ai-chat-llm-integration-fix/tasks/04-TASK-FIX-WORKSPACE-CHAT-STREAM-ERROR/phase-5-implementation.md` | Markdown   |

## 完了条件

- [ ] Task 1: P50チェック（既存実装調査）完了
- [ ] Task 2: `StreamingErrorState` 型定義が作成または流用確認済み
- [ ] Task 3: `mapLLMErrorToStreamingError` が実装済み
- [ ] Task 4: `StreamingErrorDisplay` が実装済み（Apple HIG準拠）
- [ ] Task 5: `useWorkspaceChatController` に `streamingError` / `retryLastMessage` / `dismissStreamingError` が追加済み
- [ ] Task 6: `WorkspaceChatPanel` への統合完了
- [ ] Task 7: `pnpm typecheck` が通ること
- [ ] Task 7: Phase 4のテストが全て Green になること
- [ ] Task 7: `pnpm lint` が通ること
- [ ] P31対策: `useCallback` の依存配列が適切（合成Hook参照なし）
- [ ] 後方互換: 既存 `errorMessage` state が維持されている

## 次Phase

Phase 6: テスト拡充 (`phase-6-test-expansion.md`)
