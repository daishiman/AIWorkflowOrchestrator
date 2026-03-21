# Implementation Guide: LLMモデル選択インラインガイダンス

## Part 1: 概念説明（中学生レベル）

### なぜこの機能が必要か

教室で発表するときに、まだ担当の人が決まっていないのに「はい、次の人どうぞ」と言われたら、その場が止まります。AIチャットでも同じで、「どのモデルに送るか」が決まっていないまま送信すると、ユーザーは何を直せばいいのか分かりにくくなります。

今回の機能は、その迷いを先に取り除くための案内板です。送信が失敗してから気づかせるのではなく、画面を開いた時点で「まず設定を選んでください」と知らせます。教室の名簿にまだ担当が入っていないとき、先生が最初に「担当を決めてから始めよう」と声をかけるイメージです。

### この機能で何をするか

- ChatView では、モデル未選択ならヘッダー直下に案内バナーを出します。
- WorkspaceView では、blocked guidance に Settings へ進むボタンを出します。
- ユーザーが設定画面へ移動すれば、次に何をすべきかが一目で分かります。

### どんな場面で役立つか

- 初回起動直後で provider / model が未設定のとき
- 設定をリセットした直後
- Workspace 側だけ導線が弱く、どこで設定するか迷いやすいとき

## Part 2: 開発者向け実装詳細

### 実装の責務分割

| ファイル                                                       | 役割                                                |
| -------------------------------------------------------------- | --------------------------------------------------- |
| `ChatView/LLMGuidanceBanner.tsx`                               | ChatView 専用の未選択 guidance banner               |
| `ChatView/index.tsx`                                           | banner の配置と `setCurrentView("settings")` の接続 |
| `WorkspaceChatPanel.tsx`                                       | blocked guidance の CTA 接続                        |
| `ChatView/__tests__/LLMGuidanceBanner.test.tsx`                | banner の表示条件・アクセシビリティ                 |
| `ChatView/__tests__/ChatView.guidance.test.tsx`                | ChatView 統合導線                                   |
| `WorkspaceView/__tests__/WorkspaceChatPanel.guidance.test.tsx` | Workspace 導線                                      |

### TypeScript 型定義

```ts
type NavigateToSettings = () => void;

interface LLMGuidanceBannerProps {
  onNavigateToSettings: NavigateToSettings;
}

interface GuidanceState {
  selectedProviderId: string | null;
  selectedModelId: string | null;
}
```

### APIシグネチャ

```ts
export const LLMGuidanceBanner: React.FC<LLMGuidanceBannerProps>;

declare function useSelectedProviderId(): string | null;
declare function useSelectedModelId(): string | null;
declare function useSetCurrentView(): (view: "settings") => void;
```

```bash
pnpm --filter @repo/desktop screenshot:llm-selector-inline-guidance
```

### 実装ポイント

1. `LLMGuidanceBanner` は selector を直接読み、provider と model が両方そろっている時だけ `null` を返す。
2. `ChatView` は banner を常にレンダリングし、遷移先だけ callback で渡す。
3. `WorkspaceChatPanel` は既存 `GuidanceBlock` に `onAction` を接続し、hidden CTA を visible にする。

### 使用例

```tsx
import { LLMGuidanceBanner } from "./LLMGuidanceBanner";

export function ChatHeaderGuard(): JSX.Element {
  const setCurrentView = useSetCurrentView();

  return (
    <LLMGuidanceBanner
      onNavigateToSettings={() => setCurrentView("settings")}
    />
  );
}
```

### テストモックの使用例

```ts
vi.mock("@/renderer/store", () => ({
  useSelectedModelId: () => mockUseSelectedModelId(),
  useSelectedProviderId: () => mockUseSelectedProviderId(),
  useSetCurrentView: () => mockSetCurrentView,
}));
```

### エラーハンドリング

- この機能は例外を投げて recover する設計ではなく、未選択状態を UI で先回りして説明する。
- provider / model のどちらか片方だけが `null` の場合でも banner を表示し、送信失敗より前に気づかせる。
- CTA の遷移実装は親側の callback に委譲しているため、遷移先の責務を banner 内へ持ち込まない。

### エッジケース

- `selectedModelId === null` かつ `selectedProviderId !== null` でも banner を表示する。
- `selectedProviderId === null` かつ `selectedModelId !== null` でも banner を表示する。
- `selectedModelId === ""` のような非 null 値は現状 non-null 扱いであり、store 正規化の責務外とする。
- dark theme では背景色と CTA 色が変わっても DOM 構造は変えない。
- keyboard focus は `aria-label="設定画面へ移動"` を持つ button に集約する。

### 設定項目と定数

| 項目            | 値 / 実装                        |
| --------------- | -------------------------------- |
| CTA 遷移先      | `setCurrentView("settings")`     |
| alert role      | `role="alert"`                   |
| CTA label       | `設定画面へ` / `Settings を開く` |
| light CTA color | `#007AFF`                        |
| dark CTA color  | `#0A84FF`                        |
| transition      | `duration-200`                   |

### 将来の拡張ポイント

- Settings 画面の LLM セクションへの直接スクロール遷移
- banner の dismiss 制御と、dismiss 状態の寿命設計
