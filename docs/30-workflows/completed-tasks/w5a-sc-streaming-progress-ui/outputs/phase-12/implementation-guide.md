# ストリーミング進捗UI 実装ガイド

## Part 1: 概念説明（中学生レベル）

### なぜ進捗表示が必要なの？

ネットで買い物をしたとき、「注文受付 → 発送準備 → 配送中 → 到着」と段階的にステータスが更新されますよね。もしこの表示がなかったら、「本当に届くのかな？」と不安になります。スキル作成の進捗表示もこれと同じです。AIがスキルを作っている間、今どの段階にいるのかをリアルタイムでバーとチェックマークで見せることで、「ちゃんと動いているんだ」という安心感を提供します。もし途中で問題が起きたら、何が起きたのか・どうすればいいかも画面に表示されます。

### 4つのステップ

スキルを作る時、コンピュータは4つのステップを順番に進めます:

1. **計画を立てる** - スキルの構造（どんな部品が必要か）を考えます
2. **設計図を作る** - SKILL.md というファイルに設計図を書きます
3. **部品を作る** - エージェント（お手伝いロボット）の設計図を作ります
4. **確認する** - 全部正しくできているかチェックします

### エラーが起きたら？

もしうまくいかない場合は、何が問題かを教えてくれます:

- **APIキーがない** → 設定画面を開くボタンが出ます
- **生成エラー** → もう一度やり直すボタンが出ます
- **ネットワーク切断** → インターネット接続を確認してくださいと表示します

### 途中でやめたくなったら？

「キャンセル」ボタンを押せば、いつでも作業を中止できます。

---

## Part 2: 開発者向け実装詳細

### アーキテクチャ概要

```
Main Process (Electron)
  │ SKILL_CREATOR_PROGRESS イベント (IPC)
  ▼
Preload Script (skill-creator-api.ts)
  │ onProgress コールバック
  ▼
useStreamingProgress Hook
  │ phase -> stage マッピング
  ▼
Zustand generationProgressSlice
  │ 個別セレクタ (P31対策)
  ▼
GenerateStep コンポーネント (UI)
  ├── ProgressBar (role="progressbar")
  ├── StepList (4段階表示)
  ├── PreviewPanel
  ├── ErrorCards (ApiKey/LLM/Network)
  └── CancelButton
```

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
```

### useStreamingProgress Hook

IPC経由の進捗イベントを受信し、Zustandストアに反映するHook。

```typescript
import { useStreamingProgress } from "../hooks/useStreamingProgress";

function MyComponent() {
  const { stage, percent, message, previewContent, error, isGenerating } =
    useStreamingProgress();
  // stage: 現在の生成段階
  // percent: 進捗パーセント (0-100)
  // message: 現在のステータスメッセージ
  // previewContent: 生成中のSKILL.mdプレビュー（null可）
  // error: エラー情報（null可）
  // isGenerating: 生成中かどうか
}
```

P5対策: useEffectクリーンアップでIPCリスナーを解除。

### useCancelGeneration Hook

AbortControllerを管理し、キャンセル操作を提供するHook。

```typescript
import { useCancelGeneration } from "../hooks/useCancelGeneration";

function MyComponent() {
  const { startGeneration, cancelGeneration } = useCancelGeneration();
  // startGeneration(): AbortSignal を返す。生成開始時に呼ぶ
  // cancelGeneration(): 生成を中断する。AbortController.abort() を呼ぶ
}
```

### Zustand generationProgressSlice

```typescript
// 個別セレクタ（P31対策: 合成Hook依存回避）
import {
  useStreamingStage,
  useStreamingPercent,
  useStreamingMessage,
  useStreamingPreviewContent,
  useStreamingGenerationError,
  useUpdateStreamingProgress,
  useResetStreamingProgress,
} from "../store";
```

P48対策: 配列セレクタ不要のため useShallow 適用箇所なし。

### エラーハンドリング

P47対策として `Record<GenerationErrorCode, ...>` パターンでエラーUIを管理:

```typescript
// generate-step/ErrorCards.tsx
import { renderErrorCard } from "./generate-step/ErrorCards";

// コンポーネント内で使用
{
  error && renderErrorCard(error.code, error.message, onRetry, onOpenSettings);
}
```

### GenerateStep Props

```typescript
interface GenerateStepProps {
  stage: GenerationStage; // 現在の生成段階
  percent: number; // 進捗パーセント (0-100)
  message: string; // ステータスメッセージ
  previewContent?: string | null; // SKILLプレビュー
  error?: GenerationError | null; // エラー情報
  onCancel?: () => void; // キャンセルハンドラ
  onRetry?: () => void; // リトライハンドラ
  onOpenSettings?: () => void; // 設定画面を開くハンドラ
}
```

### アクセシビリティ

- プログレスバー: `role="progressbar"`, `aria-valuenow`, `aria-valuemin=0`, `aria-valuemax=100`
- ステップリスト: `aria-live="polite"` でスクリーンリーダーに通知
- エラーカード: `role="alert"` で即座に読み上げ

### ファイル構成

| ファイル                                  | 役割                     |
| ----------------------------------------- | ------------------------ |
| `wizard/GenerateStep.tsx`                 | メインUIコンポーネント   |
| `wizard/generate-step/ErrorCards.tsx`     | エラーカード3種（atoms） |
| `hooks/useStreamingProgress.ts`           | IPCリスナー管理Hook      |
| `hooks/useCancelGeneration.ts`            | キャンセル操作Hook       |
| `store/slices/generationProgressSlice.ts` | Zustandスライス          |
| `store/index.ts`                          | 個別セレクタexport       |
