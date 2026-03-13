# Phase 6 テスト拡充計画

## 追加した観点（Phase 5 時点）

| 観点              | 反映先                      | 内容                                                         |
| ----------------- | --------------------------- | ------------------------------------------------------------ |
| generic name 除外 | `DashboardView.test.tsx`    | `"User"` / `"ユーザー"` / 空文字を greeting 名として使わない |
| 完了済み分岐      | `App.onboarding.test.tsx`   | persist 済みなら overlay を自動表示しない                    |
| keyboard          | `OnboardingWizard.test.tsx` | ESC close と focus trap                                      |
| rerun callback    | `SettingsView.test.tsx`     | button の callback 発火                                      |
| responsive visual | Phase 11 capture            | mobile step indicator 修正後の再撮影                         |

## Phase 6 境界ケース追加（task-061 Phase 6 実施分）

以下の境界ケースを `OnboardingWizard.test.tsx` に追加した（9ケース追加、計20テスト）。

| テストケース                                           | 検証対象                                       | カバーする分岐 |
| ------------------------------------------------------ | ---------------------------------------------- | -------------- |
| `allowDismiss=false` で閉じるボタン非表示かつ ESC 無効 | `allowDismiss` prop / ESC ガード               | L297, L426-439 |
| 完了画面（step index 4）でESCが無効                    | `currentStep === COMPLETION_STEP_INDEX` ガード | L297           |
| `isCompleting` 中にESCが無効                           | `isCompleting` ガード                          | L297           |
| 空文字名前で完了したとき `payload.userName` が空文字   | `draftName.trim()` の動作                      | L371           |
| `initialThemeMode` 省略時に `kanagawa-dragon` になる   | prop default 値                                | L243           |
| `Error` 以外の reject でフォールバックメッセージ表示   | `error instanceof Error` の else 分岐          | L381           |
| Step 3 で starter tool 未選択のとき「次へ」disabled    | `canGoNext` の Step 3 分岐                     | L346           |
| `handleNext` は disabled ボタンでは step を進めない    | disabled 属性の動作確認                        | L350-352       |
| 完了ステップで「ホームへ進む」が `onClose` を呼ぶ      | 完了後のナビゲーション                         | L798-800       |

## 追加しなかった観点

| 観点                                           | 理由                                                                                                          | 扱い                                            |
| ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------- | ----------------------------------------------- |
| Main IPC handler 単体                          | 既存 `store.get/set` を再利用し、新規 handler を追加していない                                                | Phase 5 の設計説明に記録                        |
| full Settings screenshot                       | 既存 shell 全体より wizard 本体の視覚差分が主対象である                                                       | follow-up の discoverability backlog で継続管理 |
| `handleComplete` の早期 return（L363-364）     | selectedBubbleId/selectedStarterTool は前ステップの disabled 制約で null を防止しており、通常経路では到達不可 | 防御コードとして残存、カバレッジ未到達を許容    |
| `getFocusableElements` の 0件 分岐（L307-309） | happy-dom 環境で常に最低1つのフォーカス可能要素が存在するため再現困難                                         | 許容                                            |
