# State / IPC Design

## State 境界

### OnboardingWizard コンポーネント内 local state（useState）

| state 変数            | 型                                | 初期値                              | 用途                                      |
| --------------------- | --------------------------------- | ----------------------------------- | ----------------------------------------- |
| `currentStep`         | `number`                          | `0`                                 | 現在のステップインデックス                |
| `draftName`           | `string`                          | `normalizeInitialName(initialName)` | 名前入力のドラフト値                      |
| `selectedBubbleId`    | `OnboardingBubbleId \| null`      | `null`                              | Step 2 で選択した AI プロンプト           |
| `selectedStarterTool` | `OnboardingStarterToolId \| null` | `initialStarterTool`                | Step 3 で選択したスターターツール         |
| `selectedThemeMode`   | `ThemeMode`                       | `initialThemeMode`                  | Step 4 で選択したテーマ                   |
| `isCompleting`        | `boolean`                         | `false`                             | `onComplete` 呼び出し中のローディング状態 |
| `completionError`     | `string \| null`                  | `null`                              | `onComplete` 失敗時のエラーメッセージ     |

### App.tsx 内 orchestration state（useState）

OnboardingWizard の表示制御は App.tsx が全て管理する。

| state 変数                     | 型                                | 用途                                               |
| ------------------------------ | --------------------------------- | -------------------------------------------------- |
| `isOnboardingReady`            | `boolean`                         | electron store からの初期ロード完了フラグ          |
| `isOnboardingCompleted`        | `boolean`                         | `hasCompleted === true` のキャッシュ               |
| `isOnboardingDismissed`        | `boolean`                         | 完了前に閉じた際の「このセッションで非表示」フラグ |
| `isOnboardingForcedOpen`       | `boolean`                         | Settings からの強制再表示フラグ                    |
| `onboardingInitialName`        | `string`                          | 初期表示名（store または userProfile から取得）    |
| `onboardingInitialStarterTool` | `OnboardingStarterToolId \| null` | 初期スターターツール（store から取得）             |

### Persisted state（electron-store 経由）

`ONBOARDING_STORE_KEYS` 定数で管理（実装と設計が完全一致）:

| キー名                           | 型                        | 保存タイミング             |
| -------------------------------- | ------------------------- | -------------------------- |
| `onboarding.hasCompleted`        | `boolean`                 | `handleCompleteOnboarding` |
| `onboarding.userName`            | `string`                  | `handleCompleteOnboarding` |
| `onboarding.selectedStarterTool` | `OnboardingStarterToolId` | `handleCompleteOnboarding` |
| `onboarding.lastCompletedAt`     | `string`（ISO 8601）      | `handleCompleteOnboarding` |

全てのキーは `^[a-zA-Z0-9_.-]+$` に適合する。

## IPC 方針

新規 channel は追加しない。App.tsx に定義した `readOnboardingValue` / `writeOnboardingValue` helper を通じて既存の `window.electronAPI.store.get` / `store.set` を呼び出す。

```typescript
// App.tsx に定義された helper（IPC エラーを catch してフォールバック）
const readOnboardingValue = async (key: string, defaultValue: unknown): Promise<unknown>
const writeOnboardingValue = async (key: string, value: unknown): Promise<void>
```

electron store API が未初期化（`!storeApi?.get`）の場合は `defaultValue` を返す。`store.set` 失敗時は in-memory state のみで動作（完了フラグのみ反映されない）。

## Display Name 整合

`onComplete` コールバック内で以下の順に実行:

1. `writeOnboardingValue(ONBOARDING_STORE_KEYS.userName, trimmedName)` で永続化
2. `trimmedName.length > 0` の場合 `updateUserProfile({ name: trimmedName })` で Zustand store の `userProfile.name` を更新
3. `setOnboardingInitialName(trimmedName)` でウィザード再表示時の初期値を更新

Dashboard greeting は `userProfile.name` を参照するため、完了後即座に greeting が更新される。

`getFallbackOnboardingName()` ヘルパーにより、`userProfile.name` が `"User"` / `"ユーザー"` の場合は空文字として扱い、ウィザードの初期値をクリアする。

## Theme 整合

設計時に想定した「Warm/Traditional → `kanagawa-dragon`」のような文字列変換は実装されていない。`THEME_OPTIONS` の各エントリが `mode: ThemeMode` を直接持ち、選択された値がそのまま `selectedThemeMode`（local state）に格納される。

保存時の流れ:

1. `onComplete` で `payload.themeMode` を受け取る
2. `setThemeMode(payload.themeMode)` で Zustand store を更新（テーマ即時反映）
3. `writeOnboardingValue(ONBOARDING_STORE_KEYS.selectedStarterTool, ...)` で starterTool を永続化（テーマ自体は ThemeMode store の persist 機構で保存）

`system` テーマも選択可能として実装されており（`THEME_OPTIONS` に4番目として含まれる）、UI / IPC / store 全ての契約に影響しない。
