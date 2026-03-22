# InlineModelSelector 実装ガイド

## Part 1: 概念説明（中学生向け）

### なぜこの機能が必要か

チャット画面で AI モデルを切り替えるたびに設定画面へ移動すると、会話の流れが切れます。`InlineModelSelector` は、その場で素早く provider と model を選べるようにして、作業を止めずに使える状態を作るために必要です。

### 何をする機能か

この機能は、小さな selector の中で provider と model を切り替え、今どの AI が使われるかをすぐ分かるようにします。

#### 日常生活での例え

たとえば、飲み物の自動販売機で「メーカーを選んでから商品を選ぶ」流れに近いです。最初にメーカーの棚を決め、そのあと欲しい商品を押します。`InlineModelSelector` も同じで、最初に provider を決め、その provider に属する model を選びます。

もうひとつの見方をすると、テレビのリモコンで入力切替をする感覚にも近いです。別の部屋へ行かず、手元で操作して映す先だけを切り替えます。

#### この機能でできること

| 機能               | 説明                                   | 例                                     |
| ------------------ | -------------------------------------- | -------------------------------------- |
| provider を選ぶ    | AI サービスの提供元を切り替える        | Anthropic から OpenAI へ変える         |
| model を選ぶ       | provider ごとの具体的な model を決める | Claude 3.5 Sonnet から GPT-4o へ変える |
| 状態を確認する     | 小さな色付きドットで接続状態を知る     | 緑なら healthy、赤なら error           |
| compact 表示にする | 狭い場所でも使える小さい表示にする     | Workspace 側の header などで使う       |

## Part 2: 開発者向け実装詳細

### TypeScript 型定義

```ts
type HealthStatus = "healthy" | "degraded" | "checking" | "error" | "unknown";

interface InlineModelSelectorProps {
  compact?: boolean;
  className?: string;
  onSelectionChange?: (selection: {
    providerId: string;
    modelId: string;
  }) => void;
  disabled?: boolean;
  providers?: LLMProvider[];
  selectedProviderId?: LLMProviderId | null;
  selectedModelId?: string | null;
  healthStatus?: HealthStatus;
}
```

### APIシグネチャ

```ts
function InlineModelSelector(props: InlineModelSelectorProps): JSX.Element;

function useFetchProviders(): () => Promise<void>;
function useSelectProvider(): (providerId: LLMProviderId) => void;
function useSelectModel(): (modelId: string) => void;
function useCheckLLMHealth(): (providerId: string) => Promise<void>;
```

### コンポーネント構成

- `InlineModelSelector.tsx`: main component。trigger / dropdown / store integration をまとめる
- `SelectorTrigger`: 現在の provider/model と health dot を表示する
- `SelectorDropdown`: provider list と selected provider の models を表示する

### Store 連携の要点

1. `providers` prop が渡された場合は props 値を優先する
2. `providers` prop が未指定で store 側 provider list が空なら `fetchProviders()` を呼ぶ
3. effective provider が変わったら `checkHealth(providerId)` を呼ぶ
4. provider click 時は default model を即時選び、store mode でも `onSelectionChange` を返す

### 使用例

```tsx
import { InlineModelSelector } from "@/renderer/components/llm";

function ChatHeader() {
  return (
    <InlineModelSelector
      onSelectionChange={({ providerId, modelId }) => {
        console.log("selection changed", providerId, modelId);
      }}
    />
  );
}

function CompactWorkspaceHeader({ providers }: { providers: LLMProvider[] }) {
  return (
    <InlineModelSelector
      compact
      providers={providers}
      selectedProviderId="anthropic"
      selectedModelId="claude-3-5-sonnet"
      healthStatus="healthy"
    />
  );
}
```

### エラーハンドリング

- provider list が空のときは dropdown に空メッセージを表示する
- health map に provider が存在しないときは `unknown` へフォールバックする
- `onSelectionChange` が未指定でも選択処理は継続する
- `vitest` は current 環境で `esbuild` platform mismatch により起動不能だったため、Phase 12 では compile と test 定義レビューを証跡として残した

### エッジケース

- `providers` prop と store list の両方がある場合は prop を正本にする
- selected provider に model が 0 件なら model section は空メッセージを表示する
- provider click 時に default model が見つからない場合は先頭 model を使う
- live screen capture は consumer surface 未統合のため Task01 単独では実行できない

### 設定と定数

| 種別        | 名称                    | 役割                                                  |
| ----------- | ----------------------- | ----------------------------------------------------- |
| style token | `selectorTriggerStyles` | trigger の base / active / disabled / size を定義する |
| style token | `healthDotStyles`       | health status ごとの dot 色を定義する                 |
| style token | `dropdownStyles`        | dropdown container / option / label を定義する        |
| prop        | `compact`               | compact 表示の切り替え                                |
| prop        | `disabled`              | 操作不能状態の切り替え                                |

### 実装メモ

- `pnpm exec tsc -p tsconfig.json --noEmit --pretty false`: PASS
- `pnpm exec vitest run src/renderer/components/llm/__tests__/InlineModelSelector.test.tsx`: BLOCKED
- mount 先の live surface は Task02/03 で扱うため、Task01 は shared component contract の確定までを責務とする
