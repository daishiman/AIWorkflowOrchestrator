# Phase 11: スクリーンショット撮影計画

## 撮影対象

| TC    | コンポーネント      | 状態                  | テーマ | ファイル名                   |
| ----- | ------------------- | --------------------- | ------ | ---------------------------- |
| TC-01 | SkillLifecyclePanel | filter=all デフォルト | light  | TC-01-default-all-light.png  |
| TC-02 | SkillLifecyclePanel | filter=all デフォルト | dark   | TC-02-default-all-dark.png   |
| TC-03 | SkillLifecyclePanel | filter=warning+       | light  | TC-03-warning-plus-light.png |
| TC-04 | SkillLifecyclePanel | filter=warning+       | dark   | TC-04-warning-plus-dark.png  |
| TC-05 | SkillLifecyclePanel | filter=error          | light  | TC-05-error-only-light.png   |
| TC-06 | SkillLifecyclePanel | filter=error          | dark   | TC-06-error-only-dark.png    |
| TC-07 | SkillLifecyclePanel | 0件Layer非表示        | light  | TC-07-empty-layer-light.png  |
| TC-08 | SkillLifecyclePanel | check 0件             | light  | TC-08-no-checks-light.png    |

## 実施状況

Playwright harness により 2026-04-03 時点で撮影済み。
各ケースの実体は `outputs/phase-11/screenshots/` を参照。
