# Phase 5 実装サマリー

## 実装内容

| 変更点                  | 内容                                                                                                  |
| ----------------------- | ----------------------------------------------------------------------------------------------------- |
| `OnboardingWizard` 追加 | 名前入力、AI おためし、starter tool、theme、completion の 4 step + 1 completion を実装                |
| `App.tsx` 統合          | persist load、force-open、dismiss、completion 保存、theme 更新、Dashboard handoff を追加              |
| `SettingsView` 導線     | header 右側に `はじめてガイドを再表示` button を追加                                                  |
| `useDisplayName()` 補正 | `"User"` / `"ユーザー"` / 空文字を generic name として除外し、`userProfile.name` を fallback に含めた |
| screenshot harness      | `DashboardView` を背景にした dedicated route と Playwright capture script を追加                      |

## 変更ファイル一覧

| 種別 | ファイルパス                                                                                |
| ---- | ------------------------------------------------------------------------------------------- |
| 新規 | `apps/desktop/src/renderer/components/organisms/OnboardingWizard/index.tsx`                 |
| 新規 | `apps/desktop/src/renderer/components/organisms/OnboardingWizard/OnboardingWizard.test.tsx` |
| 新規 | `apps/desktop/src/renderer/App.onboarding.test.tsx`                                         |
| 新規 | `apps/desktop/src/renderer/phase11-onboarding-wizard.tsx`                                   |
| 新規 | `apps/desktop/src/renderer/phase11-onboarding-wizard.html`                                  |
| 新規 | `apps/desktop/scripts/capture-task-061-onboarding-wizard-phase11.mjs`                       |
| 変更 | `apps/desktop/src/renderer/App.tsx`                                                         |
| 変更 | `apps/desktop/src/renderer/views/SettingsView/index.tsx`                                    |
| 変更 | `apps/desktop/src/renderer/store/index.ts`                                                  |
| 変更 | `apps/desktop/package.json`                                                                 |

## 保存キー

| キー                             | 型                                                | 用途                                                                         |
| -------------------------------- | ------------------------------------------------- | ---------------------------------------------------------------------------- |
| `onboarding.hasCompleted`        | `boolean`                                         | 初回表示抑制フラグ。`true` になると自動表示を停止する                        |
| `onboarding.userName`            | `string`                                          | 名前の再利用。次回 forced open 時に `initialName` として渡す                 |
| `onboarding.selectedStarterTool` | `"workspace" \| "skillCenter" \| "agent" \| null` | starter tool の再利用。次回 forced open 時に `initialStarterTool` として渡す |
| `onboarding.lastCompletedAt`     | `string` (ISO 8601)                               | 完了時刻記録。診断・デバッグ用途                                             |

すべてのキーは `window.electronAPI.store.get/set` 経由で読み書きする。electron-store の名前空間にドット記法で格納される。

## 完了時の副作用

| 副作用     | 内容                                                                                        | 実装箇所           |
| ---------- | ------------------------------------------------------------------------------------------- | ------------------ |
| theme 反映 | `setThemeMode(payload.themeMode)`                                                           | `App.tsx` L250     |
| 名前反映   | `updateUserProfile({ name: trimmedName })`（名前が空でない場合のみ）                        | `App.tsx` L253-255 |
| 画面遷移   | `setCurrentView("dashboard")`                                                               | `App.tsx` L262     |
| UI 状態    | `isOnboardingCompleted=true`, `isOnboardingForcedOpen=false`, `isOnboardingDismissed=false` | `App.tsx` L259-261 |
| 初期値更新 | `onboardingInitialName` / `onboardingInitialStarterTool` を完了時の値で更新                 | `App.tsx` L257-258 |

## FR/NFR 充足状況

| 要件                                            | 充足 | 備考                                                               |
| ----------------------------------------------- | ---- | ------------------------------------------------------------------ |
| FR-01: 初回/未完了時 overlay 表示               | 充足 | `shouldShowOnboarding` ロジックで制御                              |
| FR-02: Step 1 名前入力 + リアルタイムプレビュー | 充足 | `draftName` state + `getPreviewName()`                             |
| FR-03: 完了時 greeting 反映                     | 充足 | `updateUserProfile` + Dashboard 遷移                               |
| FR-04: Step 2 の 3 つ suggestion                | 充足 | `AI_PROMPTS` 配列（summarize / plan / debug）                      |
| FR-05: モック応答（外部 API 非依存）            | 充足 | `responseTitle`/`responseBody` を定数として保持                    |
| FR-06: Step 3 starter tool 選択・保存           | 充足 | `STARTER_TOOLS` 定数 + `electronAPI.store.set`                     |
| FR-07: Step 4 テーマ選択 + 即時プレビュー       | 充足 | `ThemePreviewCard` が `selectedThemeMode` に連動                   |
| FR-08: 完了時の保存                             | 充足 | 4 キーを `Promise.all` で一括書き込み                              |
| FR-09: 完了後 dashboard 遷移                    | 充足 | `setCurrentView("dashboard")`                                      |
| FR-10: Settings 再表示                          | 充足 | `onOpenOnboarding` prop + `data-testid="settings-open-onboarding"` |
| NFR-01: ViewType 未追加                         | 充足 | overlay 方式のため既存 ViewType 変更なし                           |
| NFR-02: 新規 IPC 不使用                         | 充足 | `electronAPI.store.get/set` のみ（既存チャンネル）                 |
| NFR-03: semantic token 使用                     | 充足 | `var(--text-primary)` 等 CSS 変数を全面使用                        |
| NFR-04: キーボード/a11y                         | 充足 | focus trap、ESC、role/aria 属性を完全実装                          |
| NFR-05: レスポンシブ                            | 充足 | `sm:` / `lg:` breakpoint で grid/padding を調整                    |

## テスト結果

- `OnboardingWizard.test.tsx`: 11 tests PASS
- `App.onboarding.test.tsx`: 2 tests PASS
- 合計: **13 tests PASS**（2026-03-13 実行確認）
