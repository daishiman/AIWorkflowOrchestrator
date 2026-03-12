# Phase 4 Test Specification

## 目的

オンボーディング overlay の 4 step 進行、永続化、display name 反映、settings rerun 導線を、component / integration / manual handoff に分けて検証する。

## テスト対象

| 領域 | 対象 | 期待値 | 実装先 |
| --- | --- | --- | --- |
| Wizard UI | `OnboardingWizard.tsx` | Step 1-4 の活性条件、完了画面、自動 close、Escape skip、focus trap | `OnboardingWizard.test.tsx` |
| Gate/Persistence | `OnboardingGate.tsx` | `onboarding.completed` 読み書き、theme apply、skill import handoff、profile 更新 | `OnboardingGate.test.tsx` |
| Greeting fallback | `useDisplayName()` | `userProfile.name` が dashboard greeting の最優先候補になる | `DashboardView.test.tsx` |
| Settings rerun | `SettingsView` | rerun card 表示、`onboarding.completed=false` 保存、`dashboard` へ戻す | `SettingsView.test.tsx`, `SettingsView.integration.test.tsx` |
| Manual handoff | screenshot / keyboard | responsive、theme、rerun 再表示、Tab/Escape 体験 | Phase 11 |

## 重点ケース

1. Step 1 は空文字で進めず、入力値が preview に即時反映されること。
2. Step 2 は API 呼び出しなしで mock response を返すこと。
3. Step 3 は `skillName` ベースで選択と import handoff を行うこと。
4. Step 4 は theme card を押すまで完了ボタンが有効化されないこと。
5. complete 後に `userProfile.name`、selected skill、completed flag が一貫して保存されること。
6. settings rerun で completed flag が false に戻り、dashboard overlay が再表示可能になること。

## Accessibility Handoff

- `role="dialog"` と `aria-modal="true"` を維持する。
- `Tab` / `Shift+Tab` が dialog 内で循環することを manual/test 両方で確認する。
- `Escape` で skip できることを component test と manual check で重複確認する。
