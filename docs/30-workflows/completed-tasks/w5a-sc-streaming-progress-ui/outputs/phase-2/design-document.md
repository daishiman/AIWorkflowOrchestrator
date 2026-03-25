# Phase 2: 設計書

## タスク1: GenerateStep UI改修設計

### コンポーネント構成

```
GenerateStep
  +-- ProgressBar (role="progressbar", aria-valuenow)
  +-- StepList (4段階表示)
  |     +-- StepItem (planning)
  |     +-- StepItem (generating-skill)
  |     +-- StepItem (generating-agents)
  |     +-- StepItem (validating)
  +-- PreviewPanel (previewContent表示、存在する場合のみ)
  +-- ErrorDisplay (エラー時のみ)
  |     +-- ApiKeyErrorCard | LlmErrorCard | NetworkErrorCard
  +-- CancelButton (生成中のみ表示)
```

## タスク2: Zustand generationProgress スライス設計

### 型定義

```typescript
type GenerationStage =
  | "idle"
  | "planning"
  | "generating-skill"
  | "generating-agents"
  | "validating"
  | "done"
  | "error"
  | "cancelled";

type GenerationErrorCode = "API_KEY_NOT_SET" | "LLM_ERROR" | "NETWORK_ERROR";

interface GenerationError {
  code: GenerationErrorCode;
  message: string;
}

interface GenerationProgressSlice {
  // State
  generationStage: GenerationStage;
  generationPercent: number;
  generationMessage: string;
  generationPreviewContent: string | null;
  generationError: GenerationError | null;

  // Actions
  setGenerationStage: (stage: GenerationStage) => void;
  setGenerationPercent: (percent: number) => void;
  setGenerationMessage: (message: string) => void;
  setGenerationPreviewContent: (content: string | null) => void;
  setGenerationError: (error: GenerationError | null) => void;
  updateGenerationProgress: (progress: {
    stage: GenerationStage;
    percent: number;
    message: string;
    previewContent?: string | null;
  }) => void;
  resetGenerationProgress: () => void;
}
```

### P5対策: リスナー二重登録防止

- `useEffect` クリーンアップで `onProgress` の返却関数を呼び出してリスナー解除
- React StrictMode 対応: クリーンアップ → 再登録が安全に動作する設計

### P31対策: 個別セレクタ

```typescript
// 個別セレクタ（P31対策: 合成Hook依存回避）
export const useGenerationStage = () => useAppStore((s) => s.generationStage);
export const useGenerationPercent = () =>
  useAppStore((s) => s.generationPercent);
export const useGenerationMessage = () =>
  useAppStore((s) => s.generationMessage);
export const useGenerationPreviewContent = () =>
  useAppStore((s) => s.generationPreviewContent);
export const useStreamingGenerationError = () =>
  useAppStore((s) => s.generationError);

// アクションセレクタ
export const useUpdateGenerationProgress = () =>
  useAppStore((s) => s.updateGenerationProgress);
export const useResetGenerationProgress = () =>
  useAppStore((s) => s.resetGenerationProgress);
export const useSetGenerationError = () =>
  useAppStore((s) => s.setGenerationError);
```

### P48対策: useShallow

- 現スライスでは配列を返すセレクタが不要なため、useShallow適用箇所なし

## タスク3: エラー表示設計

| エラーコード      | コンポーネント     | UI構成                                             |
| ----------------- | ------------------ | -------------------------------------------------- |
| `API_KEY_NOT_SET` | `ApiKeyErrorCard`  | アイコン + メッセージ + 「設定を開く」リンクボタン |
| `LLM_ERROR`       | `LlmErrorCard`     | アイコン + メッセージ + リトライボタン             |
| `NETWORK_ERROR`   | `NetworkErrorCard` | アイコン + オフラインメッセージ + 再接続待機表示   |

全エラーカードに `role="alert"` を付与。

## タスク4: キャンセル設計

### フロー

1. ユーザーがキャンセルボタン押下
2. `useCancelGeneration` Hook が `AbortController.abort()` を呼び出す
3. IPC `skill-creator:cancel` を送信（新規チャンネル不要の場合は既存のabort機構を使用）
4. Zustand state を `cancelled` に更新
5. 「キャンセルしました」メッセージ表示
6. 一定時間後またはユーザー操作でウィザード先頭に戻る

### AbortController管理

```typescript
// useCancelGeneration Hook
function useCancelGeneration() {
  const abortControllerRef = useRef<AbortController | null>(null);

  const startGeneration = useCallback(() => {
    abortControllerRef.current = new AbortController();
    return abortControllerRef.current.signal;
  }, []);

  const cancelGeneration = useCallback(() => {
    abortControllerRef.current?.abort();
    // IPC cancel送信 + state更新
  }, []);

  return { startGeneration, cancelGeneration };
}
```

## タスク5: カスタムHook設計

### useStreamingProgress Hook

```typescript
interface UseStreamingProgressReturn {
  stage: GenerationStage;
  percent: number;
  message: string;
  previewContent: string | null;
  error: GenerationError | null;
  isGenerating: boolean;
}
```

- IPC `SKILL_CREATOR_PROGRESS` リスナー登録/解除を管理
- 受信データを Zustand ストアに反映
- useEffect クリーンアップでリスナー解除（P5対策）

### useCancelGeneration Hook

```typescript
interface UseCancelGenerationReturn {
  cancelGeneration: () => void;
  isCancelling: boolean;
}
```
