# Phase 2: 設計

## メタ情報

| 項目          | 値                                                                                  |
| ------------- | ----------------------------------------------------------------------------------- |
| Phase番号     | 2                                                                                   |
| 機能名        | WorkspaceChat ストリーミングエラーUX改善                                            |
| タスクID      | TASK-FIX-WORKSPACE-CHAT-STREAM-ERROR                                                |
| 作成日        | 2026-03-20                                                                          |
| 前Phase成果物 | `docs/30-workflows/04-TASK-FIX-WORKSPACE-CHAT-STREAM-ERROR/phase-1-requirements.md` |

## 目的

Phase 1で確定した要件をもとに、WorkspaceChatのストリーミングエラーUX改善の詳細設計を行う。エラー種別に応じたUI分岐、アクションボタンの設計、エラー後の状態リカバリのアーキテクチャを定義する。

## 実行タスク

### Task 1: 型定義設計

#### StreamingError型の定義

```typescript
// packages/shared/src/types/llm/schemas.ts または
// apps/desktop/src/renderer/views/WorkspaceView/types.ts に追加

export type StreamingErrorAction = "SETTINGS" | "RETRY" | null;

export interface StreamingErrorState {
  code: string;
  message: string;
  retryable: boolean;
  action: StreamingErrorAction;
  /** RATE_LIMIT時のヒントテキスト */
  hint?: string;
}
```

#### WorkspaceChatControllerインターフェースへの追加

```typescript
// useWorkspaceChatController.ts の WorkspaceChatController に追加
export interface WorkspaceChatController {
  // ... 既存フィールド維持 ...

  /** 構造化されたストリーミングエラー状態。null = エラーなし */
  streamingError: StreamingErrorState | null;

  /** リトライ実行関数。retryable === true のエラー時のみ有効 */
  retryLastMessage: () => Promise<void>;

  /** エラーをdismissしてstreamingErrorをクリアする */
  dismissStreamingError: () => void;
}
```

### Task 2: エラーコードからStreamingErrorStateへのマッピング設計

```typescript
// useWorkspaceChatController.ts 内のヘルパー関数

function mapLLMErrorToStreamingError(error: LLMError): StreamingErrorState {
  const code = "code" in error ? (error.code as string) : "UNKNOWN";

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

### Task 3: useWorkspaceChatController.ts の状態変更設計

#### 追加state

```typescript
// フック内に追加
const [streamingError, setStreamingError] =
  useState<StreamingErrorState | null>(null);
const lastUserMessageRef = useRef<string | null>(null); // リトライ用に最後のメッセージを保持
```

#### onStreamError ハンドラの改修

```typescript
// 既存の disposeError 部分を置換
const disposeError = window.electronAPI.llm.onStreamError((error: LLMError) => {
  if (!isStreamingRef.current) {
    return;
  }

  // チャット状態のリセット（変更なし）
  streamRequestIdRef.current = null;
  isStreamingRef.current = false;
  setIsStreaming(false);
  streamContentRef.current = "";
  setStreamContent("");

  // 構造化エラー状態を設定（新規追加）
  const structured = mapLLMErrorToStreamingError(error);
  setStreamingError(structured);

  // 後方互換: errorMessage も更新
  setErrorMessage(structured.message);
});
```

#### retryLastMessage 実装

```typescript
const retryLastMessage = useCallback(async () => {
  if (!streamingError?.retryable || !lastUserMessageRef.current) {
    return;
  }
  dismissStreamingError();
  // sendMessage の内部ロジックを lastUserMessageRef.current で再呼び出し
  // 実装詳細は Phase 5 で決定
}, [streamingError, dismissStreamingError]);
```

#### dismissStreamingError 実装

```typescript
const dismissStreamingError = useCallback(() => {
  setStreamingError(null);
  setErrorMessage(null);
}, []);
```

#### sendMessage でのリトライ用メッセージ記録

```typescript
// sendMessage 実行時に lastUserMessageRef を更新
lastUserMessageRef.current = inputToSend;
```

### Task 4: StreamingErrorDisplayコンポーネント設計

#### コンポーネント配置

```
apps/desktop/src/renderer/views/WorkspaceView/
  components/
    StreamingErrorDisplay.tsx    ← 新規作成
```

#### インターフェース定義

```typescript
interface StreamingErrorDisplayProps {
  error: StreamingErrorState;
  onDismiss: () => void;
  onRetry: () => Promise<void>;
  onOpenSettings: () => void;
  isRetrying?: boolean;
}
```

#### コンポーネント構造（擬似コード）

```
<div role="alert" aria-live="assertive">
  <div class="error-container">
    <!-- アイコン + メッセージ -->
    <ExclamationIcon color="systemRed" />
    <span>{error.message}</span>

    <!-- RATE_LIMITのヒント -->
    {error.hint && <p class="hint-text">{error.hint}</p>}

    <!-- アクションボタン -->
    {error.action === "SETTINGS" && (
      <Button onClick={onOpenSettings} aria-label="設定を開く">
        設定を開く
      </Button>
    )}
    {error.action === "RETRY" && (
      <Button
        onClick={onRetry}
        disabled={isRetrying}
        aria-label="再試行"
      >
        {isRetrying ? "再試行中..." : "再試行"}
      </Button>
    )}

    <!-- Dismissボタン -->
    <button onClick={onDismiss} aria-label="エラーを閉じる">
      ×
    </button>
  </div>
</div>
```

#### スタイル設計（Apple HIG準拠）

| 要素                     | ライトモード                             | ダークモード                |
| ------------------------ | ---------------------------------------- | --------------------------- |
| エラーコンテナ背景       | `rgba(255, 59, 48, 0.08)`                | `rgba(255, 69, 58, 0.12)`   |
| エラーアイコン・テキスト | `#FF3B30` (systemRed)                    | `#FF453A` (systemRed dark)  |
| アクションボタン         | `#007AFF` (systemBlue)                   | `#0A84FF` (systemBlue dark) |
| ヒントテキスト           | `rgba(60, 60, 67, 0.6)` (secondaryLabel) | `rgba(235, 235, 245, 0.6)`  |
| ボーダー                 | `#C6C6C8` (opaqueSeparator)              | `#38383A`                   |
| 角丸                     | `8px`                                    | `8px`                       |

### Task 5: WorkspaceChatPanel.tsx への統合設計

```typescript
// WorkspaceChatPanel.tsx での StreamingErrorDisplay 使用
import { StreamingErrorDisplay } from "./components/StreamingErrorDisplay";

// コントローラーから取得
const {
  streamingError,
  retryLastMessage,
  dismissStreamingError,
  // ... 既存フィールド
} = useWorkspaceChatController();

// Settings遷移ハンドラ（既存のナビゲーション手段を利用）
const handleOpenSettings = useCallback(() => {
  // 既存のSettings遷移実装に合わせる
  // Phase 5 で実装詳細確定
}, []);

// レンダリング
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

### Task 6: Settings遷移設計

既存のSettings遷移パターンを調査して利用する。

```bash
# 既存のSettings遷移パターンを確認
grep -rn "navigate.*settings\|settings.*navigate\|openSettings\|useNavigate" \
  apps/desktop/src/renderer/views/WorkspaceView/ \
  apps/desktop/src/renderer/store/
```

- 既存パターンが `useAppStore` 経由であれば同パターンを使用する
- 既存パターンが `useNavigate` であれば同パターンを使用する
- Settings遷移先は AI Provider セクションを優先的に表示する

### Task 7: IPC設計（変更なし確認）

本タスクでは IPC 層の変更は行わない。エラーは既存の `onStreamError` IPC リスナーで受信し、Renderer 側のみで処理を追加する。

## 参照資料

### システム仕様（aiworkflow-requirements）

| ドキュメント            | パス                                                                                        | 参照目的                       |
| ----------------------- | ------------------------------------------------------------------------------------------- | ------------------------------ |
| エラーハンドリング仕様  | `.claude/skills/aiworkflow-requirements/references/error-handling.md`                       | エラーカテゴリ定義             |
| エラーハンドリング コア | `.claude/skills/aiworkflow-requirements/references/error-handling-core.md`                  | エラーコード一覧・リトライ戦略 |
| 状態管理アーキテクチャ  | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`                | Zustand / useState 設計原則    |
| アーキテクチャ概要      | `.claude/skills/aiworkflow-requirements/references/architecture-overview.md`                | Renderer レイヤー設計          |
| 実装パターン            | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | コンポーネント実装パターン     |

### Phase 1成果物

| ドキュメント | パス                                                                                |
| ------------ | ----------------------------------------------------------------------------------- |
| 要件定義書   | `docs/30-workflows/04-TASK-FIX-WORKSPACE-CHAT-STREAM-ERROR/phase-1-requirements.md` |

### 実装ファイル

| ファイル             | パス                                                                                | 参照目的                    |
| -------------------- | ----------------------------------------------------------------------------------- | --------------------------- |
| コントローラーフック | `apps/desktop/src/renderer/views/WorkspaceView/hooks/useWorkspaceChatController.ts` | L545-589 onStreamError実装  |
| チャットパネル       | `apps/desktop/src/renderer/views/WorkspaceView/WorkspaceChatPanel.tsx`              | StreamingErrorDisplay統合先 |
| チャット入力         | `apps/desktop/src/renderer/views/WorkspaceView/WorkspaceChatInput.tsx`              | エラー時入力状態表示        |

## 実行手順

1. Task 1: `StreamingErrorState` 型定義を確定する（ファイル配置先を決定する）
2. Task 2: `mapLLMErrorToStreamingError` ヘルパー関数の設計を確定する
3. Task 3: `useWorkspaceChatController.ts` の状態変更設計を確定する
4. Task 4: `StreamingErrorDisplay` コンポーネントの詳細設計を確定する
5. Task 5: `WorkspaceChatPanel.tsx` への統合設計を確定する
6. Task 6: Settings遷移の既存パターンを調査・設計に組み込む
7. Task 7: IPC層変更なしを確認する
8. 設計レビュー向けドキュメントを整備する

## 統合テスト連携

- `StreamingErrorState` / `StreamingErrorAction` は unit test と component test の fixture 型として共通利用する。
- `retryLastMessage()` / `dismissStreamingError()` は runtime test で panel 経由の挙動まで検証できる設計にする。
- Phase 11 capture script で Settings / Retry / dismiss / non-action error を visual evidence として残す前提で設計する。

## 成果物

| 成果物                       | パス                                                                          | 形式     |
| ---------------------------- | ----------------------------------------------------------------------------- | -------- |
| Phase 2 設計書（本ファイル） | `docs/30-workflows/04-TASK-FIX-WORKSPACE-CHAT-STREAM-ERROR/phase-2-design.md` | Markdown |

## 完了条件

- [ ] `StreamingErrorState` 型定義が確定済み（ファイル配置先含む）
- [ ] `mapLLMErrorToStreamingError` のエラーコード網羅性が確認済み
- [ ] `WorkspaceChatController` インターフェースの変更が後方互換を維持していることを確認済み
- [ ] `StreamingErrorDisplay` コンポーネントのインターフェース定義が確定済み
- [ ] Apple HIG準拠のカラー設計が確定済み
- [ ] Settings遷移の実装方針が確定済み
- [ ] IPC層に変更が不要であることを確認済み
- [ ] Phase 3 設計レビューへの引き渡し準備完了

## 次Phase

Phase 3: 設計レビュー (`phase-3-design-review.md`)
