# Component Architecture

## コンポーネント配置

| レイヤー | 想定ファイル | 責務 |
| --- | --- | --- |
| gate | `components/onboarding/OnboardingGate.tsx` | completed flag の取得と overlay 表示判定 |
| wizard | `components/onboarding/OnboardingWizard.tsx` | currentStep、complete、skip、auto navigate |
| step shell | `components/onboarding/OnboardingStepFrame.tsx` | icon、title、body、navigation |
| step local | `components/onboarding/steps/*` | Step 1-4 の local interaction |
| completion | `components/onboarding/OnboardingCompletion.tsx` | EmptyState、confetti、auto navigate |

## shared reuse

| 既存 component | 利用箇所 | 利用方針 |
| --- | --- | --- |
| `SuggestionBubble` | Step 2 | `size="lg"` で再利用する |
| `EmptyState` | 完了画面 | `mood="celebrating"` を使う |
| `ThemeSelector` | Step 4 参照 | card layout は wizard 用 wrapper を持つ |
| `OnboardingStepFrame` | 共通 wrapper | step header、progress indicator、操作領域、navigation を一体管理 |

## view-local 優先ルール

- wizard 専用 UI は shared へ早期抽出しない
- `ToolCard` と `StepIndicator` は onboarding 配下の local component とする
- shared へ抽出する条件は 2 画面以上で再利用が発生した時点とする

## micro interaction 配置

- Step2 の bubble は `SuggestionBubble` の props 増設で bounce を制御する。
- Step4 の card layout は `ThemeSelector` の既存イベント設計を尊重し、画面全体には親 wrapper で transition class を付与する。
- complete 時は `EmptyState` の祝福演出を受ける wrapper で confetti タイムラインを制御する。
