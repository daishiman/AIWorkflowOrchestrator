# Phase 11 手動テスト計画

## 実行環境

| 項目         | 内容                                                           |
| ------------ | -------------------------------------------------------------- |
| base command | `pnpm --filter @repo/desktop run screenshot:onboarding-wizard` |
| harness      | `phase11-onboarding-wizard.html`                               |
| reviewer     | Codex                                                          |
| review style | Apple UI/UX engineer 観点                                      |

## 実行順序

1. `pnpm --filter @repo/desktop exec tsc --noEmit`
2. `pnpm --filter @repo/desktop exec vitest run ...`
3. `pnpm --filter @repo/desktop build`
4. `pnpm --filter @repo/desktop run screenshot:onboarding-wizard`
5. `view_image` で representative screenshot を確認

## テストケース

| テストケース | route                                                   | viewport | theme           | 主観点                       |
| ------------ | ------------------------------------------------------- | -------- | --------------- | ---------------------------- |
| TC-11-01     | `/phase11-onboarding-wizard.html?theme=light`           | 1440x980 | light           | step1 hierarchy              |
| TC-11-02     | `/phase11-onboarding-wizard.html?theme=dark`            | 1440x980 | dark            | step2 interaction            |
| TC-11-03     | `/phase11-onboarding-wizard.html?theme=dark`            | 1024x900 | dark            | tablet layout                |
| TC-11-04     | `/phase11-onboarding-wizard.html?theme=light`           | 1440x980 | light           | `system` preview readability |
| TC-11-05     | `/phase11-onboarding-wizard.html?theme=dark`            | 390x844  | dark            | mobile readability           |
| TC-11-06     | `/phase11-onboarding-wizard.html?theme=kanagawa-dragon` | 1440x980 | kanagawa-dragon | completion hierarchy         |
