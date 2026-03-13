# Phase 5 実装計画

## 実装順序

1. `OnboardingWizard` を新規作成し、step UI と completion payload を実装する。
2. `App.tsx` に persist load、overlay mount、complete handler、force-open handler を追加する。
3. `SettingsView` に rerun button を追加する。
4. `store/index.ts` の display name fallback を調整する。
5. Phase 11 用 harness と screenshot script を追加する。

## 変更対象

| 種別 | ファイル                                                                    |
| ---- | --------------------------------------------------------------------------- |
| 新規 | `apps/desktop/src/renderer/components/organisms/OnboardingWizard/index.tsx` |
| 新規 | `apps/desktop/src/renderer/phase11-onboarding-wizard.tsx`                   |
| 新規 | `apps/desktop/src/renderer/phase11-onboarding-wizard.html`                  |
| 新規 | `apps/desktop/scripts/capture-task-061-onboarding-wizard-phase11.mjs`       |
| 変更 | `apps/desktop/src/renderer/App.tsx`                                         |
| 変更 | `apps/desktop/src/renderer/views/SettingsView/index.tsx`                    |
| 変更 | `apps/desktop/src/renderer/store/index.ts`                                  |
| 変更 | `apps/desktop/package.json`                                                 |

## 実装原則

- 新しい `ViewType` を増やさない（NFR-01 準拠）
- persist は `window.electronAPI.store.get/set` に限定する（NFR-02 準拠: 新規 IPC チャンネル不使用）
- Step 3 は `selectedStarterTool` の保存に留める（ツールのインストールは行わない）
- theme は既存 `ThemeMode` 契約を守る（NFR-01 準拠）

## FR/NFR 実装マッピング

| 要件                                            | 実装箇所                                                   | 実装方法                                                                                              |
| ----------------------------------------------- | ---------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- | --- | ----------------------------------- |
| FR-01: 初回/未完了時 overlay 表示               | `App.tsx` L382-385                                         | `shouldShowOnboarding` で `isOnboardingReady && (forcedOpen                                           |     | (!completed && !dismissed))` を評価 |
| FR-02: Step 1 名前入力 + リアルタイムプレビュー | `OnboardingWizard/index.tsx` L491-555                      | `draftName` state + `getPreviewName()` 関数                                                           |
| FR-03: 完了時 greeting 反映                     | `App.tsx` L253-254                                         | `updateUserProfile({ name: trimmedName })` + `setCurrentView("dashboard")`                            |
| FR-04: Step 2 の 3 つ suggestion                | `OnboardingWizard/index.tsx` L30-55                        | `AI_PROMPTS` 定数配列（3 件）                                                                         |
| FR-05: モック応答（外部 API 非依存）            | `OnboardingWizard/index.tsx` L35-55                        | `responseTitle`/`responseBody` を定数として持ち、ネットワーク接続なし                                 |
| FR-06: Step 3 starter tool 選択・保存           | `OnboardingWizard/index.tsx` L57-79 + `App.tsx` L242-244   | `STARTER_TOOLS` 定数 + `electronAPI.store.set` で persist                                             |
| FR-07: Step 4 テーマ選択 + 即時プレビュー       | `OnboardingWizard/index.tsx` L678-748 + `ThemePreviewCard` | `selectedThemeMode` state + `ThemePreviewCard` コンポーネント                                         |
| FR-08: 完了時の保存                             | `App.tsx` L234-261                                         | `handleCompleteOnboarding` で 4 キーを `electronAPI.store.set` で一括書き込み                         |
| FR-09: 完了後 dashboard 遷移                    | `App.tsx` L262                                             | `setCurrentView("dashboard")`                                                                         |
| FR-10: Settings 再表示                          | `SettingsView/index.tsx` L99-107                           | `onOpenOnboarding` prop 経由のボタン（`data-testid="settings-open-onboarding"`）                      |
| NFR-01: ViewType 未追加                         | `App.tsx` renderView switch                                | `OnboardingWizard` は overlay として既存 view の上に重ねる。`ViewType` 追加なし                       |
| NFR-02: 新規 IPC 不使用                         | `App.tsx` L98-147                                          | `electronAPI.store.get/set` のみ使用。新規 IPC チャンネルなし                                         |
| NFR-03: semantic token 使用                     | `OnboardingWizard/index.tsx` 全体                          | CSS 変数（`var(--text-primary)` 等）を Tailwind arbitrary value で使用                                |
| NFR-04: キーボード/a11y                         | `OnboardingWizard/index.tsx` L279-332                      | focus trap (Tab wrap)、ESC 閉じ、`role="dialog"`、`aria-modal`、`aria-labelledby`、`aria-describedby` |
| NFR-05: レスポンシブ                            | `OnboardingWizard/index.tsx` 全体                          | `sm:` / `lg:` breakpoint で grid/padding を切り替え                                                   |
