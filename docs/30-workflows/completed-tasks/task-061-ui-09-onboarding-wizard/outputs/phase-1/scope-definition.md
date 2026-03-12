# Scope Definition

## in scope

| concern | 内容 |
| --- | --- |
| shell | `dashboard` overlay、scrim、modal、focus 管理 |
| step UX | 名前入力、mock response、skill card、theme selection、complete screen |
| persistence | `onboarding.completed`, `onboarding.selectedSkillName` |
| personalization | `settingsSlice.userProfile.name` と greeting fallback |
| rerun | SettingsView からの再表示 |

## out of scope

| concern | 理由 |
| --- | --- |
| 実コード実装 | 今回は spec 作成に限定する |
| 実テスト | Phase 4-11 は planned のまま保持する |
| commit / PR | ユーザー禁止条件がある |
| 新規 preload surface | 既存 `store` / `theme` / skill import action で足りる |

## phase gate

| gate | 条件 |
| --- | --- |
| Gate-1 | Phase 1-3 が completed になるまで Phase 4 を開始しない |
| Gate-2 | `dashboard` internal ID を変更しない |
| Gate-3 | `settings` 公開シェルと未認証 reset 除外を壊さない |
| Gate-4 | Step 3 の import identifier は現行 metadata から選ぶ |
