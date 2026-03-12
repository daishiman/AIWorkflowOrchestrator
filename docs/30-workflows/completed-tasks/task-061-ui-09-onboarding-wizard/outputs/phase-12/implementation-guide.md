# Phase 12 Implementation Guide

## Part 1: はじめて触る人向けの説明

### なぜ必要か

初回起動の人にいきなり全部の画面を見せると、何から始めればよいか分からなくなる。そこで最初だけ「名前を決める」「おすすめのスキルを選ぶ」「使うスキルを決める」「見た目を選ぶ」を順番に案内する。

### 何をしているか

この機能は、いつもの `dashboard` の上に大きな案内カードを一枚だけ重ねる。

たとえば、新しい机を買ったときに「引き出しはここ」「ライトはここ」「よく使う文房具はここ」と最初に案内カードが出るイメージに近い。机そのものを別の部屋へ移動するのではなく、同じ場所の上に案内だけを重ねている。

### どう動くか

1. アプリが「もう案内を見終わったか」を `onboarding.completed` で確認する。
2. まだ見終わっていなければ、`dashboard` の上に 4 ステップの案内を表示する。
3. 最後まで終えると、名前、選んだスキル、見た目を保存して、次回からは案内を出さない。
4. 設定画面の「はじめようを再表示」を押すと、保存した完了印だけ外して、もう一度 `dashboard` から案内を出す。

### この設計のポイント

- 新しい専用画面は作らない。`dashboard` の上に重ねるだけにして、既存ナビゲーションを壊さない。
- 表示名と内部で使う `skillName` を分ける。人に見せる言葉と、実際に import で使う識別子は役割が違う。
- 設定画面から再実行できるが、再実行の本体はあくまで `dashboard` 側で開く。

## Part 2: 技術者向けの詳細

### 構成

1. `App.tsx`
   `currentView === "dashboard"` のときだけ `OnboardingGate` を重ねる。
2. `OnboardingGate.tsx`
   `window.electronAPI.store.get/set` を使って open / close を判断し、complete / skip 後の保存処理を統括する。
3. `OnboardingWizard.tsx`
   4 step dialog、focus trap、skip / complete、theme 選択 UI を持つ。
4. `SettingsView/index.tsx`
   rerun card から `onboarding.completed=false` を保存し、`setCurrentView("dashboard")` へ戻す。
5. `phase11-onboarding-wizard.tsx`
   screenshot / manual review 専用 harness。Phase 11 の代表状態を固定する。

### 説明用型定義

以下は本機能の責務を表す説明用型であり、実装の要点を簡潔に示す。

```ts
type OnboardingStep = 1 | 2 | 3 | 4;
type OnboardingStoreKey =
  | "onboarding.completed"
  | "onboarding.selectedSkillName";
type OnboardingTheme = "light" | "dark" | "kanagawa-dragon";

interface OnboardingSkillChoice {
  label: string;
  skillName: string;
  description: string;
}

interface OnboardingCompletionPayload {
  name: string;
  selectedSkillName: string;
  theme: OnboardingTheme;
}
```

### 主要API / 呼び出し契約

| API / Action | 用途 | 実装上の要点 |
| --- | --- | --- |
| `window.electronAPI.store.get("onboarding.completed")` | 初回表示判定 | `false` のときのみ overlay を開く |
| `window.electronAPI.store.set({ key: "onboarding.completed", value })` | 完了フラグ保存 | complete 時は `true`、rerun 時は `false` |
| `window.electronAPI.store.set({ key: "onboarding.selectedSkillName", value })` | 選択スキル保存 | 表示ラベルではなく `skillName` を保存する |
| `updateUserProfile({ name })` | Step 1 の名前反映 | `settingsSlice.userProfile.name` と greeting fallback に接続する |
| `importSkill(skillName)` | Step 3 の import | UI copy ではなく内部 `skillName` を渡す |
| `selectSkillByName(skillName)` | import 後の選択反映 | 選択状態と import 実行の handoff を分離する |
| `setThemeMode(mode)` | Step 4 のテーマ反映 | light / dark / kanagawa-dragon を切り替える |
| `setCurrentView("dashboard")` | rerun 復帰 | Settings から overlay を直接描画せず、dashboard に戻して開く |

### 使用例

#### 初回完了

```ts
await updateUserProfile({ name: "田中" });
await importSkill("skill-creator");
selectSkillByName("skill-creator");
await window.electronAPI.store.set({
  key: "onboarding.completed",
  value: true,
});
setThemeMode("kanagawa-dragon");
```

#### Settings からの rerun

```ts
await window.electronAPI.store.set({
  key: "onboarding.completed",
  value: false,
});
setCurrentView("dashboard");
```

### フロー

#### 初回起動

1. `OnboardingGate` が `onboarding.completed` を読む。
2. `false` なら `dashboard` 上に overlay を出す。
3. complete 時に `updateUserProfile`、`importSkill`、`selectSkillByName`、`store.set` を順に実行する。

#### rerun

1. Settings の `rerun-onboarding-button` を押す。
2. `store.set({ key: "onboarding.completed", value: false })` を実行する。
3. `setCurrentView("dashboard")` を実行する。
4. `dashboard` 側 `OnboardingGate` が再度 open する。

### エラーハンドリング

| ケース | 挙動 | ねらい |
| --- | --- | --- |
| `store.get/set` 失敗 | overlay を閉じずに再試行可能な状態を保つ | 初回体験を壊さない |
| `importSkill(skillName)` 失敗 | 選択状態を維持し、失敗したことだけを明示する | 再選択しやすくする |
| 名前入力が空 | 次の step へ進ませない | greeting fallback を壊さない |
| 不正な `skillName` | 表示ラベルから再構成しない | UI copy と内部IDの混線を防ぐ |
| rerun を Settings 側で完結させようとする | `dashboard` へ戻して gate を開く | overlay 責務を 1 箇所に保つ |

### エッジケース

| 観点 | 対応 |
| --- | --- |
| skip | `onboarding.completed=true` にして再表示を止める |
| responsive | desktop / tablet / mobile で representative screenshot を取得する |
| keyboard | `Shift+Tab` / `Tab` / `Escape` を Phase 11 で spot check する |
| display name fallback | auth profile がなくても `settingsSlice.userProfile.name` から greeting できるようにする |
| rerun discoverability | Settings 画面内の発見性は follow-up 未タスクへ切り出す |

### 設定値 / 定数

| 項目 | 値 |
| --- | --- |
| step 数 | 4 |
| persist key | `onboarding.completed`, `onboarding.selectedSkillName` |
| rerun button | `rerun-onboarding-button` |
| rerun 復帰先 | `dashboard` |
| Phase 11 screenshot | `TC-11-01` 〜 `TC-11-05` |

### 実装で苦戦した箇所

| 苦戦箇所 | 原因 | 今回の整理 |
| --- | --- | --- |
| UI copy と import 対象の混線 | 表示名をそのまま `importSkill()` に渡すと実装契約とずれる | 表示ラベルと `skillName` を分離した |
| 新規 view 化の誘惑 | onboarding 専用 `ViewType` を作ると navigation と state が増える | `dashboard` overlay に限定した |
| rerun の責務分散 | Settings で直接 wizard を開くと shell 契約が崩れる | flag reset は Settings、open は Dashboard に固定した |

### 検証コマンド

```bash
pnpm --filter @repo/desktop exec tsc --noEmit --pretty false
pnpm --filter @repo/desktop exec vitest run \
  src/renderer/views/DashboardView/components/onboarding/OnboardingWizard.test.tsx \
  src/renderer/views/DashboardView/components/onboarding/OnboardingGate.test.tsx \
  src/renderer/views/DashboardView/DashboardView.test.tsx \
  src/renderer/views/SettingsView/SettingsView.test.tsx \
  src/renderer/views/SettingsView/__tests__/SettingsView.integration.test.tsx
pnpm --filter @repo/desktop screenshot:task-061-onboarding-wizard
```
