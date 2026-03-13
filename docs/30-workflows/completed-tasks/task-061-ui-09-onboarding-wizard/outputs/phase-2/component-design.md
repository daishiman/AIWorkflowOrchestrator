# Component Design

## 実装上のコンポーネント構造

設計時に想定したサブコンポーネント分割（`WizardModal`, `StepIndicator`, `WizardStep` 等）は採用されず、**単一ファイル `index.tsx` にフラット化**して実装された。これはスコープ内の迅速な実装を優先した設計判断であり、Phase 4 以降のテスト・リファクタリングフェーズで分割を検討する余地がある。

### 実装上のコンポーネント

| 論理的責務                       | 実装形式                                               |
| -------------------------------- | ------------------------------------------------------ |
| overlay + focus trap             | `OnboardingWizard` 本体の `useEffect` + `div`          |
| step indicator                   | `<ol>` インライン（header 内）                         |
| Step 1: 名前入力                 | `currentStep === 0` の JSX ブランチ                    |
| Step 2: AI おためし              | `currentStep === 1` の JSX ブランチ                    |
| Step 3: スターターツール         | `currentStep === 2` の JSX ブランチ                    |
| Step 4: テーマ選択 + preview     | `currentStep === 3` の JSX ブランチ                    |
| 完了画面                         | `currentStep === COMPLETION_STEP_INDEX` ブランチ       |
| ナビゲーション（戻る/次へ/完了） | `<footer>` インライン                                  |
| テーマプレビューカード           | `ThemePreviewCard`（同ファイル内の関数コンポーネント） |

`ThemePreviewCard` だけが唯一分離された関数コンポーネントとして抽出されている。

## 当初設計との差分

| 設計上の想定            | 実装の実態                                    | 影響                                         |
| ----------------------- | --------------------------------------------- | -------------------------------------------- |
| `WizardModal` 分離      | `OnboardingWizard` 本体に統合                 | focus trap ロジックが本体に混在              |
| `StepIndicator` 分離    | `<header>` 内にインライン                     | step indicator の独立テストが書きにくい      |
| confetti                | 未実装（完了アイコン + サマリーカードで代替） | 設計の意図は維持（完了の視覚フィードバック） |
| `WizardNavigation` 分離 | `<footer>` 内にインライン                     | ナビゲーションのテストが本体依存             |

## 既存コンポーネント再利用

- `SuggestionBubble`: 再利用済み（Step 2 の AI プロンプト選択で使用）
- `Button`, `Input`, `Icon`: atoms として全 step で使用
- `ThemeSelector`: 直接再利用しない（オンボーディング専用 preview card を実装）
- Dashboard greeting: `onComplete` 内で `updateUserProfile` を経由して更新

## テーマオプション

設計では `system` テーマを「補助選択または未提示でもよい」としたが、実装では **4 択**（`kanagawa-dragon`, `light`, `dark`, `system`）全てを `THEME_OPTIONS` に含めている。`system` の preview card は対角線グラデーションで light/dark 両方を示す。

## Props インターフェース

```typescript
interface OnboardingWizardProps {
  isOpen: boolean;
  initialName?: string;
  initialStarterTool?: OnboardingStarterToolId | null;
  initialThemeMode?: ThemeMode;
  allowDismiss?: boolean;
  onClose: () => void;
  onComplete: (payload: OnboardingCompletionPayload) => Promise<void> | void;
}
```

## エクスポートされる型・定数

- `ONBOARDING_STORE_KEYS`: store キーの定数オブジェクト（App.tsx 側でも参照）
- `OnboardingBubbleId`: `"summarize" | "plan" | "debug"`
- `OnboardingStarterToolId`: `"workspace" | "skillCenter" | "agent"`
- `OnboardingCompletionPayload`: 完了時に `onComplete` へ渡すペイロード型
- `isOnboardingStarterToolId`: 型ガード関数（store から取得した値の検証に使用）

## レスポンシブ方針

- Step 1 / Step 2 / Step 4: `lg:grid-cols-[*fr_*fr]` の 2 カラム（`lg` ブレークポイント以上）
- Step 3: `lg:grid-cols-3` の 3 カラムカード
- step indicator: `sm:grid-cols-4`（小画面では 2 カラム）
- footer ナビゲーション: `sm:flex-row`（小画面では縦積み）
- モーダル全体: `max-w-[1040px]`, `max-h-[min(100vh-24px,920px)]` で高さ制限
