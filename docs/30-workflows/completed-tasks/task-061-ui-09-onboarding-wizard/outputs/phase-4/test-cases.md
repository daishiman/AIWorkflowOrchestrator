# Phase 4 テストケース一覧

更新日: 2026-03-13（Phase 3 MINOR 指摘 M-01/M-02 反映、不足ケース追加）

## 自動テスト

### グループ A: overlay 表示制御（App shell 統合）

| TC-ID    | 要件  | AC    | テスト種別  | テストファイル            | 期待結果                                                                                                                                                               | 既存 |
| -------- | ----- | ----- | ----------- | ------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---- |
| AT-04-01 | FR-01 | AC-1  | integration | `App.onboarding.test.tsx` | `onboarding.hasCompleted=false` で overlay（`data-testid="onboarding-wizard"`）が表示される                                                                            | あり |
| AT-04-02 | FR-01 | AC-2  | integration | `App.onboarding.test.tsx` | `onboarding.hasCompleted=true` で overlay が自動表示されない                                                                                                           | あり |
| AT-04-17 | FR-08 | AC-18 | integration | `App.onboarding.test.tsx` | 完了時に `onboarding.hasCompleted=true`、`onboarding.userName`、`onboarding.selectedStarterTool`、`onboarding.lastCompletedAt` が `electronAPI.store.set` で保存される | なし |
| AT-04-18 | FR-08 | AC-19 | integration | `App.onboarding.test.tsx` | 名前が非空の場合 `updateUserProfile({ name })` が呼ばれる。名前が空の場合は呼ばれない（Phase 3 Review Gate 条件 2）                                                    | なし |
| AT-04-19 | FR-09 | AC-21 | integration | `App.onboarding.test.tsx` | 完了後に `currentView` が `"dashboard"` に遷移する                                                                                                                     | なし |
| AT-04-20 | FR-10 | AC-3  | integration | `App.onboarding.test.tsx` | `handleOpenOnboarding` は `setIsOnboardingForcedOpen(true)` のみで `hasCompleted` を書き換えない（Phase 3 Review Gate 条件 3）                                         | なし |

### グループ B: Step 1（名前入力・generic name 正規化）

| TC-ID    | 要件  | AC   | テスト種別 | テストファイル              | 期待結果                                                                                          | 既存 |
| -------- | ----- | ---- | ---------- | --------------------------- | ------------------------------------------------------------------------------------------------- | ---- |
| AT-04-03 | FR-02 | AC-4 | unit       | `OnboardingWizard.test.tsx` | 名前入力が `data-testid="onboarding-name-preview"` にリアルタイムで反映される                     | あり |
| AT-04-10 | FR-02 | AC-6 | unit       | `OnboardingWizard.test.tsx` | 名前が空欄の場合プレビューに「User」が表示され、入力値がある場合はトリム後の文字列が表示される    | なし |
| AT-04-11 | FR-03 | AC-5 | unit       | `OnboardingWizard.test.tsx` | 名前フィールドが空欄のまま「次へ」を押しても Step 2 に進行できる                                  | なし |
| AT-04-07 | FR-02 | AC-7 | unit       | `OnboardingWizard.test.tsx` | `initialName="User"` を渡した場合、入力フィールドが空欄として扱われる（GENERIC_NAMES 正規化）     | なし |
| AT-04-08 | FR-02 | AC-7 | unit       | `OnboardingWizard.test.tsx` | `initialName="ユーザー"` を渡した場合、入力フィールドが空欄として扱われる（GENERIC_NAMES 正規化） | なし |
| AT-04-09 | FR-02 | AC-7 | unit       | `OnboardingWizard.test.tsx` | `initialName=""` を渡した場合、入力フィールドが空欄として扱われる（空文字正規化）                 | なし |

### グループ C: Step 2（AI おためし・M-02 対応）

| TC-ID    | 要件  | AC          | テスト種別 | テストファイル              | 期待結果                                                                                                     | 既存 |
| -------- | ----- | ----------- | ---------- | --------------------------- | ------------------------------------------------------------------------------------------------------------ | ---- |
| AT-04-12 | FR-04 | AC-9        | unit       | `OnboardingWizard.test.tsx` | Step 2 で bubble を選択していない状態では「次へ」ボタンが disabled になっている（M-02）                      | なし |
| AT-04-13 | FR-04 | AC-8, AC-10 | unit       | `OnboardingWizard.test.tsx` | bubble を選択すると「次へ」が活性化し、`data-testid="onboarding-ai-response"` のモック応答パネルが表示される | なし |

### グループ D: Step 3（スターター用途）

| TC-ID    | 要件                       | AC           | テスト種別 | テストファイル              | 期待結果                                                                                                                                                             | 既存         |
| -------- | -------------------------- | ------------ | ---------- | --------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------ |
| AT-04-14 | FR-06                      | AC-12        | unit       | `OnboardingWizard.test.tsx` | Step 3 でスターター用途を選択していない状態では「完了する」ボタンが disabled になっている                                                                            | なし         |
| AT-04-04 | FR-04, FR-06, FR-07, FR-08 | AC-18, AC-20 | unit       | `OnboardingWizard.test.tsx` | bubble・starter tool・theme を選択後に「完了する」を押すと `onComplete` が全フィールドを含む payload で呼ばれ、`data-testid="onboarding-step-complete"` が表示される | あり（既存） |

### グループ E: Step 4（テーマ・M-01 対応）

| TC-ID    | 要件  | AC    | テスト種別 | テストファイル              | 期待結果                                                                                                                                                                       | 既存 |
| -------- | ----- | ----- | ---------- | --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---- |
| AT-04-15 | FR-07 | AC-15 | unit       | `OnboardingWizard.test.tsx` | `initialThemeMode="system"` で開始した場合、Step 4 で `system` 選択肢が選択済み状態になっており、`data-testid="onboarding-theme-preview"` が `system` テーマを表示する（M-01） | なし |
| AT-04-16 | FR-07 | AC-16 | unit       | `OnboardingWizard.test.tsx` | テーマ選択を変更すると `data-testid="onboarding-theme-preview"` が即座に切り替わる                                                                                             | なし |

### グループ F: 完了サマリー・エラーハンドリング

| TC-ID    | 要件  | AC    | テスト種別 | テストファイル              | 期待結果                                                                                                                                  | 既存         |
| -------- | ----- | ----- | ---------- | --------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- | ------------ |
| AT-04-04 | FR-09 | AC-20 | unit       | `OnboardingWizard.test.tsx` | 完了サマリー画面（`data-testid="onboarding-step-complete"`）に Name / Start Here / Theme の 3 カード要約が表示される（AT-04-04 で内包）   | あり（内包） |
| AT-04-23 | —     | —     | unit       | `OnboardingWizard.test.tsx` | `onComplete` が reject した場合、`isCompleting` が false に戻り、エラーメッセージ（「はじめてガイドの保存に失敗しました。」）が表示される | なし         |

### グループ G: アクセシビリティ・キーボード操作

| TC-ID    | 要件   | AC                  | テスト種別 | テストファイル              | 期待結果                                                                                                                                       | 既存 |
| -------- | ------ | ------------------- | ---------- | --------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- | ---- |
| AT-04-05 | NFR-04 | AC-22, AC-23, AC-24 | unit       | `OnboardingWizard.test.tsx` | ESC close と Tab wrap（focus trap）が成立する。dialog が `role="dialog"` / `aria-modal="true"` / `aria-labelledby` / `aria-describedby` を持つ | あり |
| AT-04-21 | NFR-04 | AC-24               | unit       | `OnboardingWizard.test.tsx` | `isCompleting` 中（完了処理中）は Escape キーが無効になる                                                                                      | なし |
| AT-04-22 | NFR-04 | AC-24               | unit       | `OnboardingWizard.test.tsx` | 完了サマリー画面（Step 5）では Escape キーが無効になる                                                                                         | なし |
| AT-04-24 | —      | AC-24 補足          | unit       | `OnboardingWizard.test.tsx` | `allowDismiss=false` の場合、閉じるボタンが表示されず、Escape キーを押しても `onClose` が呼ばれない                                            | なし |

### グループ H: 戻るボタン

| TC-ID    | 要件 | AC  | テスト種別 | テストファイル              | 期待結果                                                                                | 既存 |
| -------- | ---- | --- | ---------- | --------------------------- | --------------------------------------------------------------------------------------- | ---- |
| AT-04-25 | —    | —   | unit       | `OnboardingWizard.test.tsx` | Step 2 以降で「戻る」ボタンを押すと前の Step に遷移する（Step 2 → Step 1 の遷移を検証） | なし |

### グループ I: Settings 再表示・greeting フォールバック

| TC-ID    | 要件  | AC   | テスト種別 | テストファイル           | 期待結果                                                                                                                          | 既存                          |
| -------- | ----- | ---- | ---------- | ------------------------ | --------------------------------------------------------------------------------------------------------------------------------- | ----------------------------- |
| AT-04-06 | FR-10 | AC-3 | unit       | `SettingsView.test.tsx`  | `onOpenOnboarding` prop が渡された場合、`data-testid="settings-open-onboarding"` ボタンが表示され、クリックで callback が発火する | なし                          |
| AT-04-07 | FR-02 | AC-7 | regression | `DashboardView.test.tsx` | `userProfile.name` が greeting fallback に使われる。`"User"` / `"ユーザー"` 等の generic name が greeting に表示されない          | あり（AT-04-07 として再整理） |

## 手動テスト（Phase 11 対応）

| TC-ID    | 画面                  | viewport | theme           | 期待結果                                                                                                                                       |
| -------- | --------------------- | -------- | --------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| TC-11-01 | Step 1（名前）        | 1440x980 | light           | 入力欄・preview・CTA の階層が明確。プレビューに「User」がフォールバック表示される                                                              |
| TC-11-02 | Step 2（AI おためし） | 1440x980 | dark            | bubble 3択が並び、選択後にモック応答パネルが読める。未選択時は「次へ」が非活性                                                                 |
| TC-11-03 | Step 3（スターター）  | 1024x900 | dark            | starter tool card 3枚が破綻なく表示される。未選択時は「完了する」が非活性                                                                      |
| TC-11-04 | Step 4（テーマ）      | 1440x980 | light           | 4択（kanagawa-dragon / light / dark / system）が表示され、`system` 選択時も ThemePreviewCard が即時切り替わり、primary text が可読性を維持する |
| TC-11-05 | Step 3（スターター）  | 390x844  | dark            | mobile で主コンテンツが先に視認できる（レスポンシブ grid が破綻しない）                                                                        |
| TC-11-06 | 完了サマリー          | 1440x980 | kanagawa-dragon | Name / Start Here / Theme の 3 カード要約が表示され、completion hierarchy が明確                                                               |
