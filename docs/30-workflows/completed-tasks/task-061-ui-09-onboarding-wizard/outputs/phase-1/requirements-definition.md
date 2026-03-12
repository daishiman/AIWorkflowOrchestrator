# Requirements Definition

## 目的

`TASK-UI-09-ONBOARDING-WIZARD` を、現行 App shell と aiworkflow 正本仕様に沿って実装できる単位へ分解する。

## 要件一覧

| ID | 要件 | 根拠 |
| --- | --- | --- |
| R-01 | 初回起動時だけ wizard を表示する | 参照元タスク本文 |
| R-02 | wizard は `dashboard` の overlay として表示する | `App.tsx` 現行契約 |
| R-03 | completed flag は `electronAPI.store` で保持する | preload / main IPC |
| R-04 | 名前入力は `settingsSlice.userProfile.name` と dashboard greeting に接続する | `settingsSlice`, `useDisplayName()` |
| R-05 | Step 2 は mock response だけで成立する | 参照元タスク本文 |
| R-06 | Step 3 は実 `skillName` を持つ curated card data を使う | `importSkill(skillName)` |
| R-07 | Step 4 は既存 theme action を使う | `themeHandlers.ts`, `settingsSlice.ts` |
| R-08 | SettingsView から再表示できる | `ui-ux-settings.md` |
| R-09 | Step 2 のバブル押下時に視覚ハイライト（bounce）を出す | micro interaction 要件 |
| R-10 | Step 4 は 300ms 程度のクロスフェードでテーマを切替える | `ThemeSelector` 再利用時の体験一貫性 |
| R-11 | 完了画面での祝福演出を提供し、3 秒後に dashboard へ自動遷移する | タスク本文 |
| R-12 | Step 1 は 1 文字以上の入力で完了し、次へはタスク完了時のみ有効化される | UX 要件 |
| R-13 | Step 2 はバブルを 3 種類以上提示し、選択時は `scale(0.97 -> 1.05 -> 1)` bounce とフェードインする mock 応答で完了する | 参照元タスク本文 |
| R-14 | Step 3 はツールカード選択時にチェックアイコンと成功時エフェクト（例: バウンス）を持ち、選択時点で `skillName` が確定する | 参照元タスク本文 |
| R-15 | Step 4 は 3 種類以上のテーマ候補を提示し、チェック表示 / accent border / 300ms 以上のクロスフェードを設計する | 参照元タスク本文 |
| R-16 | Step 切替と完了時 CTA は説明文より操作体験を優先する（長文説明を避け、1 ステップ 1 タスク） | 参照元タスク本文 |

## 契約補正

| 項目 | 旧前提 | 補正後 |
| --- | --- | --- |
| persistence API | `electronAPI.config` | `electronAPI.store` と `electronAPI.theme` |
| display name | `onboardingUserName` 専用 key | `settingsSlice.userProfile.name` + `useDisplayName()` fallback |
| screen model | 専用 page | `dashboard` overlay |
| skill import | copy 文字列をそのまま渡す | `skillName` identifier を別フィールドで保持する |

## hard dependency

- `task-057-ui-02-global-nav-core`
- `task-058a-ui-03-agent-view-enhancement`
- `task-058b-ui-04a-workspace-layout-filebrowser`
- `task-059a-ui-04b-workspace-chat-panel`
- `task-059b-ui-04c-workspace-preview-quicksearch`
- `task-058c-ui-06-history-search-view`
- `task-058d-ui-07-dashboard-enhancement`
- `task-058e-ui-08-notification-center`
- `task-030-ui-05-skill-center-view`

## 設計メモ

- Step 3 の card source は static 文言ではなく curated metadata とする
- `useDisplayName()` は auth profile 不在時に `state.userProfile.name` を見る設計を前提にする
- `settings` 公開シェルの例外を保つため、rerun は SettingsView 内の action として扱う
- micro interaction と transition は core UX 要件なので、`ThemeSelector`/`SuggestionBubble` の再利用時に
  `motion` 依存を最小化し、既存クラス名と class 追加で実装できるように設計する
- Step 1/2/3/4 の完成トリガーは次へ・完了ボタンと直接紐づけ、長文説明を増やさずに Tap & Discover を維持する
