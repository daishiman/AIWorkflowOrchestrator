# Architecture Design

## 統合方式

`OnboardingWizard` は `apps/desktop/src/renderer/App.tsx` 配下で既存シェルの上に重ねる overlay とする。新しい `ViewType` を追加せず、既存 navigation 契約への影響を避ける。

overlay は `renderCatchAllElement()` の返す JSX 末尾に `shouldShowOnboarding` フラグで条件付きレンダリングされる。認証ガード（`AuthGuard`）の外側に配置されており、認証状態に依存しない。

## 表示条件

`shouldShowOnboarding` は以下の条件が全て真のとき `true` になる:

- `isOnboardingReady === true`（electron store からの初期ロード完了）
- `isOnboardingForcedOpen === true` **または** (`isOnboardingCompleted === false` **かつ** `isOnboardingDismissed === false`)

フラグの初期化フロー:

1. `useEffect` が `isOnboardingReady` を監視し、`loadOnboardingState()` を一度だけ実行
2. `store.get` から `hasCompleted`, `userName`, `selectedStarterTool` を並列取得
3. `isOnboardingCompleted` と `isOnboardingDismissed` を `Boolean(hasCompleted)` で初期化
4. `isOnboardingReady = true` をセット後に表示条件が評価される

## close / completion 挙動

- 完了前 close: `allowDismiss={true}` で常に許可。`isOnboardingDismissed = true` をセット、`isOnboardingForcedOpen = false` をセット
- 完了時 close: 4キー全てを `store.set` で保存 + `setThemeMode` + `setCurrentView("dashboard")` に自動遷移。`isOnboardingCompleted = true`, `isOnboardingDismissed = false`, `isOnboardingForcedOpen = false` をセット
- 再表示経由（Settings から `handleOpenOnboarding` 呼び出し）: `isOnboardingForcedOpen = true`, `isOnboardingDismissed = false` をセット

## onboardingInitialThemeMode

`<OnboardingWizard initialThemeMode={themeMode} />` として Zustand store の現在テーマを初期値として渡す。ウィザード内の選択は local state で管理し、完了時に `setThemeMode(payload.themeMode)` で store に反映する。

## 主要アーキテクチャ判断

1. modal step state は local component state（App.tsx は orchestrator、OnboardingWizard は UI のみ担当）
2. persisted onboarding profile は `electronAPI.store`（`readOnboardingValue` / `writeOnboardingValue` helper で IPC エラーを catch してフォールバック）
3. greeting 反映は `onComplete` コールバック内で `updateUserProfile({ name: trimmedName })` を呼び出し、store の `userProfileName` を更新する方式
4. confetti は未実装。CompletionScreen（step index === COMPLETION_STEP_INDEX）でアイコンと完了サマリーを表示
5. actual skill import は architecture boundary の外に置く（`selectedStarterTool` の保存のみ）
6. `isOnboardingDismissed` フラグを導入することで「未完了 close 後の再表示前に forced open がない限り再表示しない」挙動を実現
