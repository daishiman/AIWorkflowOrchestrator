# State And Persistence Design

## state 分類

| concern | 保存場所 | 備考 |
| --- | --- | --- |
| `currentStep` | `useState` | wizard local |
| `userNameDraft` | `useState` | Step 1 input |
| `selectedBubble` | `useState` | Step 2 |
| `selectedSkillName` | `useState` + `electronAPI.store` | Step 3 完了時に保存 |
| `themeMode` | `settingsSlice.themeMode` | `useSetThemeMode()` で更新 |
| `isCompleted` | `useState` | completion screen の切替 |

## persistence keys

| key | value | 書き込み契約 |
| --- | --- | --- |
| `onboarding.completed` | `boolean` | `window.electronAPI.store.set({ key, value })` |
| `onboarding.selectedSkillName` | `string` | `window.electronAPI.store.set({ key, value })` |

## display name fallback

| 優先順位 | 取得元 |
| --- | --- |
| 1 | `state.profile?.displayName` |
| 2 | `state.authUser?.displayName` |
| 3 | `state.userProfile.name` |
| 4 | `"User"` |

## selector policy

- `useSetThemeMode()` を使う
- `useImportSkill()` を使う
- 合成 hook を新設しない
- `useAppStore((state) => state.userProfile)` のように個別セレクタで参照する
