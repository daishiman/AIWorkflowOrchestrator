# Phase 11: 手動テスト検証

## メタ情報

| 項目         | 内容           |
| ------------ | -------------- |
| Phase        | 11             |
| Phase名      | 手動テスト検証 |
| ステータス   | completed      |
| 作成日       | 2026-03-13     |
| 担当SubAgent | SubAgent-D     |

## 目的

wizard の見え方、step 導線、theme 差分、responsive、completion 表示を representative screenshot と Apple UI/UX 目視レビューで確認する。

## 実行タスク

- capture 実行: harness route から wizard 6 状態の screenshot を取得する
- visual review 実行: light、dark、kanagawa、mobile の品質を目視確認する
- result 記録: TC-ID と png を 1 対 1 で記録する
- issue 反映: mobile step indicator の視認性調整を再撮影まで含めて反映する

## 参照資料

| 参照資料                   | パス                                                                        | 用途                     |
| -------------------------- | --------------------------------------------------------------------------- | ------------------------ |
| Phase 2 コンポーネント設計 | `outputs/phase-2/component-design.md`                                       | step 構成確認            |
| Phase 5 実装サマリー       | `outputs/phase-5/implementation-summary.md`                                 | UI 実装差分確認          |
| Phase 6 回帰マトリクス     | `outputs/phase-6/regression-matrix.md`                                      | manual で再確認する項目  |
| Phase 7 coverage           | `outputs/phase-7/coverage-gate-result.md`                                   | 自動テストの基礎確認     |
| Phase 8 抽出判定           | `outputs/phase-8/component-extraction-check.md`                             | local / shared 境界確認  |
| Phase 9 品質チェック       | `outputs/phase-9/quality-checklist.md`                                      | static quality の確認    |
| Phase 10 最終レビュー      | `outputs/phase-10/final-review-result.md`                                   | manual review の入力     |
| 手動テスト計画             | `outputs/phase-11/manual-test-plan.md`                                      | 実行順序                 |
| 手動テスト結果             | `outputs/phase-11/manual-test-result.md`                                    | 実施結果                 |
| screenshot plan            | `outputs/phase-11/screenshot-plan.json`                                     | route / viewport / theme |
| capture metadata           | `outputs/phase-11/screenshots/phase11-capture-metadata.json`                | 実測時刻                 |
| screenshot 手順            | `.agents/skills/task-specification-creator/references/phase-11-12-guide.md` | validator 条件           |

## 統合テスト連携

| 観点              | 根拠                        | 連携内容                                                      |
| ----------------- | --------------------------- | ------------------------------------------------------------- |
| wizard state      | `OnboardingWizard.test.tsx` | step 遷移と payload を先に固定したうえで visual review を行う |
| shell integration | `App.onboarding.test.tsx`   | overlay 表示条件と screenshot 表示条件を一致させる            |
| rerun action      | `SettingsView.test.tsx`     | visual review 対象外の callback は automated test で担保する  |

## テストケース

| テストケース | 状態                          | 観点              | 期待結果                                                                |
| ------------ | ----------------------------- | ----------------- | ----------------------------------------------------------------------- |
| TC-11-01     | step1 / light / desktop       | hierarchy         | 名前入力、preview、CTA が同一画面で読める                               |
| TC-11-02     | step2 / dark / desktop        | interaction       | bubble 選択後の応答カードが読みやすい                                   |
| TC-11-03     | step3 / dark / tablet         | responsive        | starter tool card が 1024px 幅で破綻しない                              |
| TC-11-04     | step4 / light / desktop       | theme             | `system` preview card を含め、選択 state と primary text が明確に読める |
| TC-11-05     | step3 / dark / mobile         | mobile visibility | step indicator が主コンテンツを押し下げない                             |
| TC-11-06     | complete / kanagawa / desktop | completion        | 完了メッセージと CTA 階層が明確である                                   |

## 画面カバレッジマトリクス

| 画面              | 表示状態 | テーマ          | viewport | 優先度 | テストケース | 証跡ファイル                                                                     | 備考                             |
| ----------------- | -------- | --------------- | -------- | ------ | ------------ | -------------------------------------------------------------------------------- | -------------------------------- |
| Onboarding Wizard | step1    | light           | 1440x980 | A      | TC-11-01     | `outputs/phase-11/screenshots/TC-11-01-onboarding-step1-light-desktop.png`       | 名前入力と preview               |
| Onboarding Wizard | step2    | dark            | 1440x980 | A      | TC-11-02     | `outputs/phase-11/screenshots/TC-11-02-onboarding-step2-dark-desktop.png`        | bubble 応答                      |
| Onboarding Wizard | step3    | dark            | 1024x900 | A      | TC-11-03     | `outputs/phase-11/screenshots/TC-11-03-onboarding-step3-dark-tablet.png`         | tablet 配置                      |
| Onboarding Wizard | step4    | light           | 1440x980 | A      | TC-11-04     | `outputs/phase-11/screenshots/TC-11-04-onboarding-step4-light-desktop.png`       | `system` preview readability     |
| Onboarding Wizard | step3    | dark            | 390x844  | A      | TC-11-05     | `outputs/phase-11/screenshots/TC-11-05-onboarding-step3-dark-mobile.png`         | mobile step indicator 再撮影済み |
| Onboarding Wizard | complete | kanagawa-dragon | 1440x980 | A      | TC-11-06     | `outputs/phase-11/screenshots/TC-11-06-onboarding-complete-kanagawa-desktop.png` | completion screen                |

## 成果物

- `outputs/phase-11/manual-test-plan.md`
- `outputs/phase-11/manual-test-result.md`
- `outputs/phase-11/screenshot-plan.json`

## 完了条件

- [x] `テストケース` と `画面カバレッジマトリクス` が揃っている
- [x] TC-11-01〜TC-11-06 に png 証跡が紐付いている
- [x] Apple UI/UX 観点のレビューが手動テスト結果へ転記されている
