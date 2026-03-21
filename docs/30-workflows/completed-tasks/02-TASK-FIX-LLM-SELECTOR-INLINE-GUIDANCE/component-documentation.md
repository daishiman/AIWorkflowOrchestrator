# Component Documentation

## LLMGuidanceBanner

### 概要

ChatView ヘッダー直下に表示する、モデル未選択状態専用のインライン guidance banner。状態判定は store selector に閉じ込め、親コンポーネントは Settings へ遷移する callback だけを渡す。

### ファイルパス

`apps/desktop/src/renderer/views/ChatView/LLMGuidanceBanner.tsx`

### 公開契約

```ts
type NavigateToSettings = () => void;

interface LLMGuidanceBannerProps {
  onNavigateToSettings: NavigateToSettings;
}
```

### 表示ロジック

```ts
const selectedModelId = useSelectedModelId();
const selectedProviderId = useSelectedProviderId();
const isModelSelected = selectedModelId != null && selectedProviderId != null;

if (isModelSelected) {
  return null;
}
```

| 観点       | 内容                                                                                     |
| ---------- | ---------------------------------------------------------------------------------------- |
| 表示条件   | `selectedModelId` または `selectedProviderId` が `null` / `undefined` のとき表示         |
| 非表示条件 | provider と model がともに非 null のとき `null` を返す                                   |
| 責務境界   | state の読み取りは banner 内、画面遷移は呼び出し元に委譲                                 |
| P31 対策   | Zustand 合成 Hook ではなく `useSelectedModelId()` / `useSelectedProviderId()` を直接使用 |

### 使用例

```tsx
import { LLMGuidanceBanner } from "./LLMGuidanceBanner";

<LLMGuidanceBanner onNavigateToSettings={() => setCurrentView("settings")} />;
```

### UI とアクセシビリティ

| 要素        | 実装                                                                |
| ----------- | ------------------------------------------------------------------- |
| ルート      | `role="alert"`                                                      |
| CTA         | `type="button"` + `aria-label="設定画面へ移動"`                     |
| light theme | `border-orange-200 bg-orange-50 text-[#007AFF]`                     |
| dark theme  | `dark:border-orange-800 dark:bg-orange-950 dark:text-[#0A84FF]`     |
| motion      | `transition-opacity duration-200`, `transition-colors duration-200` |

### 関連テスト

- `apps/desktop/src/renderer/views/ChatView/__tests__/LLMGuidanceBanner.test.tsx`
- `apps/desktop/src/renderer/views/ChatView/__tests__/ChatView.guidance.test.tsx`

---

## ChatView 統合ポイント

### ファイルパス

`apps/desktop/src/renderer/views/ChatView/index.tsx`

### 接続内容

| 接続点             | 内容                                                      |
| ------------------ | --------------------------------------------------------- |
| banner 挿入位置    | ヘッダー直下、SystemPromptToggleButton より前             |
| 遷移 callback      | `onNavigateToSettings={() => setCurrentView("settings")}` |
| エラー導線との分離 | `chatError` banner と責務を分離し、LLM 未選択だけを扱う   |

---

## GuidanceBlock（既存コンポーネント）

### ファイルパス

`apps/desktop/src/renderer/views/WorkspaceView/components/GuidanceBlock.tsx`

### Props

| Prop        | 型                                  | 必須 | 説明                    |
| ----------- | ----------------------------------- | ---- | ----------------------- |
| variant     | `"error" \| "handoff" \| "blocked"` | Yes  | バリアント              |
| message     | `string`                            | Yes  | 表示メッセージ          |
| actionLabel | `string`                            | No   | CTA ラベル              |
| onAction    | `() => void`                        | No   | CTA クリック時 callback |

### ボタン表示条件

`actionLabel` と `onAction` の両方が指定された場合にのみ CTA が描画される。本タスクでは `WorkspaceChatPanel.tsx` で `onAction={() => setCurrentView("settings")}` を接続した。

### 関連テスト

- `apps/desktop/src/renderer/views/WorkspaceView/__tests__/WorkspaceChatPanel.guidance.test.tsx`
