# Onboarding Wizard 実装ガイド

## Part 1: はじめて触る人向け

### 1. なぜ必要か

この機能は、初めてアプリを開いた人が「まず何をすればいいか」を迷わず決めるために入っています。最初の画面で名前、使い始め方、見た目の好みを決めておくと、その後のホーム画面がその人に合わせた状態で始まります。

### 2. 何をするか

アプリの上に案内用の大きなカードを重ねて表示します。案内は 4 つの小さな質問でできていて、最後に「準備が終わった」と伝えて通常画面へ戻します。

### 3. たとえ話

**アプリ全体の流れ（引越し初日の手続き）**:
新しい家に引越したとき、最初に「表札を書く（Step 1: 名前）」「今日やりたいことをざっと言ってみる（Step 2: AI おためし）」「よく使う部屋を決める（Step 3: 使い始め）」「照明の明るさを合わせる（Step 4: テーマ）」をやっておくと、その後の生活がずっと楽になります。今回の wizard は、引越し当日に「まずここだけ決めておきましょう」と教えてくれる案内役です。

| ステップ            | 日常の例え                                       | アプリで行うこと                                             |
| ------------------- | ------------------------------------------------ | ------------------------------------------------------------ |
| Step 1: 名前        | 表札に自分の名前を書く                           | ホーム画面のあいさつ文に表示する名前を決める                 |
| Step 2: AI おためし | 引越し業者さんに「どんな作業を頼みたいか」と話す | AI に 3 種類の相談テーマを見せてもらい、反応を試す           |
| Step 3: 使い始め    | 「まず台所？書斎？」とよく使う部屋を決める       | workspace / スキルセンター / AI 相談の 3 択から選ぶ          |
| Step 4: テーマ      | 照明の色温度を調節して落ち着く明るさにする       | Kanagawa / ライト / ダーク / システムの 4 択でテーマを決める |

**再表示の案内（設定からやり直す）**:
設定画面に「はじめてガイドを再表示」ボタンがあります。これは「引越し手続きを見直したい」ときに使います。前回入力した名前やスターターツールは初期値として再利用できます。

### 4. 使う人が感じる変化

| 変更前                                           | 変更後                                     |
| ------------------------------------------------ | ------------------------------------------ |
| 最初に何を触ればよいか分かりにくい               | wizard が最初の一手を提示する              |
| 名前を入れてもホーム画面のあいさつに反映されない | 完了後に greeting が即座に更新される       |
| テーマ選択が設定画面まで分散している             | 初回から 4 択のプレビューを見ながら選べる  |
| 途中で閉じるとまた最初から案内が来る             | `hasCompleted=true` になると自動表示しない |

---

## Part 2: 開発者向け

### 1. 主要型

```ts
export const ONBOARDING_STORE_KEYS = {
  hasCompleted: "onboarding.hasCompleted",
  userName: "onboarding.userName",
  selectedStarterTool: "onboarding.selectedStarterTool",
  lastCompletedAt: "onboarding.lastCompletedAt",
} as const;

export type OnboardingBubbleId = "summarize" | "plan" | "debug";
export type OnboardingStarterToolId = "workspace" | "skillCenter" | "agent";

export interface OnboardingCompletionPayload {
  userName: string;
  selectedBubbleId: OnboardingBubbleId;
  selectedStarterTool: OnboardingStarterToolId;
  themeMode: ThemeMode;
}

// Props
export interface OnboardingWizardProps {
  isOpen: boolean;
  initialName?: string;
  initialStarterTool?: OnboardingStarterToolId | null;
  initialThemeMode?: ThemeMode;
  allowDismiss?: boolean;
  onClose: () => void;
  onComplete: (payload: OnboardingCompletionPayload) => Promise<void> | void;
}

// SettingsView への Props 追加
export interface SettingsViewProps {
  className?: string;
  onOpenOnboarding?: () => void;
}
```

### 2. App.tsx ローカル状態（表示制御）

OnboardingWizard の表示制御は App.tsx がすべて管理する。

| state 変数                     | 型                                | 役割                                           |
| ------------------------------ | --------------------------------- | ---------------------------------------------- |
| `isOnboardingReady`            | `boolean`                         | electron store からの初期ロード完了フラグ      |
| `isOnboardingCompleted`        | `boolean`                         | `hasCompleted === true` のキャッシュ           |
| `isOnboardingDismissed`        | `boolean`                         | 完了前に閉じた「このセッションで非表示」フラグ |
| `isOnboardingForcedOpen`       | `boolean`                         | Settings からの強制再表示フラグ                |
| `onboardingInitialName`        | `string`                          | store / userProfile から取得した初期表示名     |
| `onboardingInitialStarterTool` | `OnboardingStarterToolId \| null` | store から取得した初期スターターツール         |

### 3. 実装境界

| 境界               | 責務                                                                |
| ------------------ | ------------------------------------------------------------------- |
| `OnboardingWizard` | step UI、focus trap、completion payload の組み立て                  |
| `App.tsx`          | persist load/save、force-open、dismiss、Dashboard handoff           |
| `SettingsView`     | rerun button の表示と callback 発火                                 |
| `store/index.ts`   | `useDisplayName()` での generic name (`"User"` / `"ユーザー"`) 除外 |

### 4. API シグネチャ

```ts
// electron-store IPC（既存チャンネルを再利用。新規チャンネルなし）
window.electronAPI.store.get({
  key: string,
  defaultValue: unknown,
}): Promise<{ success: boolean; data?: unknown }>;

window.electronAPI.store.set({
  key: string,
  value: unknown,
}): Promise<{ success: boolean }>;

// Zustand アクション（既存）
setThemeMode(mode: ThemeMode): Promise<void>;
updateUserProfile(profile: { name?: string }): void;
```

### 5. 使用例

```ts
// Settings から再表示するハンドラ（App.tsx）
const handleOpenOnboarding = (): void => {
  setIsOnboardingForcedOpen(true);
  setIsOnboardingDismissed(false);
};

// wizard 完了ハンドラ（App.tsx）
const handleCompleteOnboarding = async (
  payload: OnboardingCompletionPayload,
): Promise<void> => {
  const trimmedName = payload.userName.trim();

  await Promise.all([
    writeOnboardingValue(ONBOARDING_STORE_KEYS.hasCompleted, true),
    writeOnboardingValue(ONBOARDING_STORE_KEYS.userName, trimmedName),
    writeOnboardingValue(
      ONBOARDING_STORE_KEYS.selectedStarterTool,
      payload.selectedStarterTool,
    ),
    writeOnboardingValue(
      ONBOARDING_STORE_KEYS.lastCompletedAt,
      new Date().toISOString(),
    ),
    setThemeMode(payload.themeMode),
  ]);

  if (trimmedName.length > 0) {
    updateUserProfile({ name: trimmedName });
  }

  setCurrentView("dashboard");
};
```

### 6. エラーハンドリング

| ケース                                                      | 対応                                                                                    |
| ----------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| `store.get` 失敗                                            | `defaultValue` へフォールバックする                                                     |
| `store.set` 失敗                                            | UI state は更新し、保存失敗は in-memory で吸収する（完了フラグのみ未永続化）            |
| 空の名前                                                    | preview は `"User"` を表示し、保存時は空文字のまま許容する                              |
| `"User"` / `"ユーザー"` を initialName として受け取った場合 | `normalizeInitialName()` で空文字に正規化する（`GENERIC_NAMES` Set で管理）             |
| `onComplete` が reject した場合                             | `completionError` state に格納し `data-testid="onboarding-completion-error"` で表示する |

### 7. エッジケース

| ケース                         | 動作                                                                               |
| ------------------------------ | ---------------------------------------------------------------------------------- |
| `hasCompleted=true` のユーザー | `shouldShowOnboarding` が `false` になるため自動表示しない                         |
| Settings から rerun            | `hasCompleted` フラグは維持しつつ `isOnboardingForcedOpen=true` で再表示する       |
| mobile                         | step indicator を `grid-cols-2`（2 列）にして main content を first fold に収める  |
| theme `system`                 | `THEME_OPTIONS` に 4 番目として含まれており、選択・保存は他の ThemeMode と同じ契約 |
| Step 1 で「次へ」              | 空欄でも進行可能（`canGoNext = currentStep === 0` で常時 true）                    |
| Step 2 で Bubble 未選択        | 「次へ」が disabled になる                                                         |
| Step 3 で tool 未選択          | 「完了する」が disabled になる                                                     |

### 8. 設定項目と定数一覧

| 項目                                                    | 値                                                                       |
| ------------------------------------------------------- | ------------------------------------------------------------------------ |
| `ONBOARDING_STORE_KEYS.hasCompleted`                    | `"onboarding.hasCompleted"`                                              |
| `ONBOARDING_STORE_KEYS.userName`                        | `"onboarding.userName"`                                                  |
| `ONBOARDING_STORE_KEYS.selectedStarterTool`             | `"onboarding.selectedStarterTool"`                                       |
| `ONBOARDING_STORE_KEYS.lastCompletedAt`                 | `"onboarding.lastCompletedAt"`                                           |
| default theme                                           | `"kanagawa-dragon"`                                                      |
| step count                                              | 4 steps + 1 completion screen                                            |
| `GENERIC_NAMES`                                         | `new Set(["User", "ユーザー"])`                                          |
| テスト数（Phase 7 境界テスト後）                        | 20（`OnboardingWizard.test.tsx`）+ 2（`App.onboarding.test.tsx`）= 22 件 |
| カバレッジ最終値（scope: `OnboardingWizard/index.tsx`） | Statements 97.72% / Branches 93.44% / Functions 92.85% / Lines 97.72%    |
| screenshot harness                                      | `apps/desktop/src/renderer/phase11-onboarding-wizard.tsx`                |
| screenshot capture script                               | `apps/desktop/scripts/capture-task-061-onboarding-wizard-phase11.mjs`    |
