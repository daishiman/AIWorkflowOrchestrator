# Phase 11: 手動テスト

## メタ情報

| 項目       | 値                       |
| ---------- | ------------------------ |
| Phase番号  | 11                       |
| 機能名     | skill-create-wizard      |
| タスクID   | TASK-10A-C               |
| 実施日     | 2026-03-02               |
| ステータス | completed                |
| 依存Phase  | Phase 10（最終レビュー） |

## 目的

SkillCreateWizard の UI 状態遷移（説明入力/設定/生成中/完了/エラー）を実画面で検証し、Phase 12 で再監査可能な画面証跡を残す。

## 実行タスク

- 手動検証: TC-01〜TC-08 を実画面で実施。
- 画面証跡取得: Playwright で必須状態（優先度A/B）を撮影。
- 網羅率算出: `screenshot-coverage.md` でカバレッジを記録。
- 発見課題整理: `discovered-issues.md` に記録（0件でも作成）。

## 参照資料

| 資料                             | パス                                                                                              |
| -------------------------------- | ------------------------------------------------------------------------------------------------- |
| Phase 2 設計成果物               | `docs/30-workflows/completed-tasks/skill-create-wizard/outputs/phase-2/architecture-design.md`    |
| Phase 10 最終レビュー結果        | `docs/30-workflows/completed-tasks/skill-create-wizard/outputs/phase-10/final-review-result.md`   |
| 実装サマリー                     | `docs/30-workflows/completed-tasks/skill-create-wizard/outputs/phase-5/implementation-summary.md` |
| Phase 6 テスト拡充結果           | `docs/30-workflows/completed-tasks/skill-create-wizard/outputs/phase-6/test-expansion-report.md`  |
| Phase 7 カバレッジ結果           | `docs/30-workflows/completed-tasks/skill-create-wizard/outputs/phase-7/coverage-report.md`        |
| Phase 8 リファクタリング結果     | `docs/30-workflows/completed-tasks/skill-create-wizard/outputs/phase-8/refactoring-summary.md`    |
| Phase 9 品質保証結果             | `docs/30-workflows/completed-tasks/skill-create-wizard/outputs/phase-9/quality-report.md`         |
| UI仕様（Feature）                | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md`                   |
| UI仕様（Components）             | `.claude/skills/aiworkflow-requirements/references/ui-ux-components.md`                           |
| スクリーンショット取得スクリプト | `apps/desktop/scripts/capture-skill-create-wizard-screenshots.mjs`                                |
| 画面証跡                         | `docs/30-workflows/completed-tasks/skill-create-wizard/outputs/phase-11/screenshots/`             |

## テストケース

| TC-ID | テスト観点                    | 優先度 | 期待結果                                 |
| ----- | ----------------------------- | ------ | ---------------------------------------- |
| TC-01 | Step1 初期表示（Dark）        | A      | 説明入力ステップが表示される             |
| TC-02 | Step1 入力後状態（Dark）      | A      | 入力内容反映・次へ遷移可能               |
| TC-03 | Step2 設定画面（Dark）        | A      | オプション設定画面が表示される           |
| TC-04 | Step3 生成中（Dark）          | B      | ローディング表示が表示される             |
| TC-05 | Step4 完了画面（Dark）        | A      | 作成完了メッセージと保存パスが表示される |
| TC-06 | Step3 エラー状態（Dark）      | B      | エラーメッセージが表示される             |
| TC-07 | Step1 初期表示（Light）       | A      | ライトテーマで表示崩れがない             |
| TC-08 | Step1 初期表示（Mobile Dark） | A      | モバイル幅で表示崩れがない               |

## 画面カバレッジマトリクス

| TC    | 画面状態                      | 証跡                                              | 判定 |
| ----- | ----------------------------- | ------------------------------------------------- | ---- |
| TC-01 | Step1 初期表示（Dark）        | `screenshots/TC-01-step1-initial-dark.png`        | PASS |
| TC-02 | Step1 入力後状態（Dark）      | `screenshots/TC-02-step1-filled-dark.png`         | PASS |
| TC-03 | Step2 設定画面（Dark）        | `screenshots/TC-03-step2-configure-dark.png`      | PASS |
| TC-04 | Step3 生成中（Dark）          | `screenshots/TC-04-step3-generating-dark.png`     | PASS |
| TC-05 | Step4 完了画面（Dark）        | `screenshots/TC-05-step4-complete-dark.png`       | PASS |
| TC-06 | Step3 エラー状態（Dark）      | `screenshots/TC-06-step3-error-dark.png`          | PASS |
| TC-07 | Step1 初期表示（Light）       | `screenshots/TC-07-step1-initial-light.png`       | PASS |
| TC-08 | Step1 初期表示（Mobile Dark） | `screenshots/TC-08-step1-initial-mobile-dark.png` | PASS |

## 実行手順

```bash
# 画面証跡取得
pnpm --filter @repo/desktop run screenshot:skill-create-wizard

# 画面証跡のTC紐付け検証
node .claude/skills/task-specification-creator/scripts/validate-phase11-screenshot-coverage.js \
  --workflow docs/30-workflows/completed-tasks/skill-create-wizard
```

## 成果物

| ファイル                                  | 内容                     |
| ----------------------------------------- | ------------------------ |
| `outputs/phase-11/manual-test-result.md`  | TC実行結果（証跡紐付け） |
| `outputs/phase-11/discovered-issues.md`   | 発見課題（0件含む）      |
| `outputs/phase-11/screenshot-plan.json`   | 撮影計画                 |
| `outputs/phase-11/screenshot-coverage.md` | カバレッジ結果           |
| `outputs/phase-11/screenshots/*.png`      | 画面証跡PNG              |

## 統合テスト連携

- Phase 12 では Phase 11 の証跡（TC-01〜TC-08 PNG）を参照し、実装/仕様同期の根拠とする。
- UI追加や導線変更が入った場合は、同スクリプトを再実行して再撮影を必須とする。

## 完了条件

- [x] TC-01〜TC-08 を実行し、全件PASS
- [x] `manual-test-result.md` を作成
- [x] `discovered-issues.md` を作成（0件）
- [x] `screenshot-plan.json` を作成
- [x] `screenshot-coverage.md` を作成
- [x] `screenshots/` に証跡PNGを保存
