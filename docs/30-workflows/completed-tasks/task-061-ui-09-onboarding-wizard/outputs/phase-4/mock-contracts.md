# Phase 4 Mock Contracts

## `window.electronAPI.store`

```ts
type StoreGet = (request: {
  key: string;
  defaultValue?: unknown;
}) => Promise<{ success: boolean; data?: unknown; error?: string }>;

type StoreSet = (request: {
  key: string;
  value: unknown;
}) => Promise<{ success: boolean; error?: string }>;
```

- `get({ key: "onboarding.completed", defaultValue: false })`
- `set({ key: "onboarding.completed", value: true | false })`
- `set({ key: "onboarding.selectedSkillName", value: skillName })`

## Store actions

| Action | 契約 |
| --- | --- |
| `updateUserProfile({ name })` | Step 1 完了値を `userProfile.name` に反映する |
| `setThemeMode(mode)` | Step 4 theme card 押下時に呼ばれる |
| `fetchSkills()` | overlay open 時に skill card データを取得する |
| `importSkill(skillName)` | Step 3 完了時に 1 回だけ呼ぶ |
| `selectSkillByName(skillName)` | import 成功後に呼ぶ |
| `setCurrentView("dashboard")` | settings rerun 成功後に戻り先として使う |

## Test doubles

- `skillError` は import failure 時の error message として扱う。
- `importedSkills` は import 成功判定の source of truth とする。
- `resolvedTheme` は `themeMode === "system"` の fallback 値にのみ使う。
- Step 2 の suggestion response は pure constant で持ち、外部 API mock は作らない。
