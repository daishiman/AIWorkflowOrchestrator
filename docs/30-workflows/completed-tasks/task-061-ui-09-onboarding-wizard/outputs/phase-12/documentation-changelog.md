# Phase 12 ドキュメント更新履歴

## メタ情報

| 項目                                                | 内容                                                                      |
| --------------------------------------------------- | ------------------------------------------------------------------------- |
| 作成日                                              | 2026-03-13                                                                |
| タスクID                                            | TASK-UI-09-ONBOARDING-WIZARD                                              |
| 最終確定テスト数                                    | 22 件（OnboardingWizard.test.tsx: 20 件 + App.onboarding.test.tsx: 2 件） |
| 最終カバレッジ（scope: OnboardingWizard/index.tsx） | Statements 97.72% / Branches 93.44% / Functions 92.85% / Lines 97.72%     |

## 1. workflow 成果物

| ファイル                         | 変更内容                                                                                |
| -------------------------------- | --------------------------------------------------------------------------------------- |
| `index.md`                       | ステータスを completed へ更新                                                           |
| `artifacts.json`                 | Phase 1-12 completed、Phase 13 skipped を記録                                           |
| `phase-1..13`                    | validator 準拠の構造へ更新                                                              |
| `outputs/phase-4..12/*`          | 実施結果ベースの成果物を追加                                                            |
| `outputs/verification-report.md` | validator / test / build / screenshot の実測値を記録（vitest: 4 files / 50 tests PASS） |
| `outputs/phase-13/pr-info.md`    | PR スキップ理由を追加                                                                   |

## 2. system spec

| ファイル                                  | 変更内容                                                                                                                                                                                 |
| ----------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `task-workflow.md`                        | TASK-UI-09 の完了記録を current evidence へ更新し、mobile Step 3 selected card order の follow-up を追加                                                                                 |
| `ui-ux-components.md`                     | component inventory と完了タスクへ `OnboardingWizard` を追加                                                                                                                             |
| `ui-ux-feature-components.md`             | onboarding wizard feature sectionへ related UT 3件と mobile selected-state prominence ルールを追加                                                                                       |
| `ui-ux-settings.md`                       | Settings rerun button の契約（`data-testid="settings-open-onboarding"` + `onOpenOnboarding` Props）を追加                                                                                |
| `ui-ux-navigation.md`                     | onboarding overlay の表示条件、`system` preview readability、Phase 11 screenshot 6件、mobile selected card prominence follow-up、dual-root drift 是正を同期                              |
| `arch-state-management.md`                | App.tsx 6 state 変数と OnboardingWizard 7 local state の ownership を追加                                                                                                                |
| `lessons-learned.md`                      | task-061 の苦戦箇所（rerun / persist 分離、follow-up 未タスク contract drift、mobile step indicator、mobile selected card prominence、`system` preview contrast）と 5 分解決カードを追加 |
| `workflow-onboarding-wizard-alignment.md` | onboarding 実装・Settings rerun・follow-up backlog resweep・SubAgent 分担・最適なファイル形成を 1 ファイルへ集約し、mobile Step 3 follow-up も追加                                       |

## 3. skill metadata / index

| ファイル                                                                             | 変更内容                                                                                            |
| ------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------- |
| `.claude/skills/aiworkflow-requirements/LOGS.md`                                     | TASK-UI-09 の system spec 更新ログに mobile Step 3 follow-up formalize を追加                       |
| `.claude/skills/aiworkflow-requirements/SKILL.md`                                    | 変更履歴 `9.01.96` を追加し、follow-up unassigned resweep を記録                                    |
| `.claude/skills/aiworkflow-requirements/indexes/topic-map.md`                        | `generate-index.js` 再生成（`node generate-index.js` PASS）                                         |
| `.claude/skills/aiworkflow-requirements/indexes/keywords.json`                       | `generate-index.js` 再生成                                                                          |
| `.claude/skills/task-specification-creator/LOGS.md`                                  | TASK-UI-09 の Phase 1-12 実行ログを追加                                                             |
| `.claude/skills/task-specification-creator/SKILL.md`                                 | 変更履歴 `v10.08.66` を追加し、既存 follow-up 未タスクの contract drift guard を記録                |
| `.claude/skills/skill-creator/LOGS.md`                                               | onboarding follow-up backlog の contract drift guard を追加                                         |
| `.claude/skills/skill-creator/SKILL.md`                                              | 変更履歴 `10.37.41` を追加し、onboarding template profile と follow-up drift 再発防止パターンを記録 |
| `.claude/skills/skill-creator/assets/phase12-system-spec-retrospective-template.md`  | onboarding overlay / rerun / follow-up backlog resweep の反映先マトリクスを追加                     |
| `.claude/skills/skill-creator/assets/phase12-spec-sync-subagent-template.md`         | canonical docs 7点と existing follow-up resweep を完了条件へ追加                                    |
| `.claude/skills/skill-creator/references/resource-map.md`                            | onboarding template profile を asset 説明へ同期                                                     |
| `.claude/skills/task-specification-creator/references/phase-templates.md`            | Phase 11/12 の command examples を `.claude` 正本基準へ統一                                         |
| `.claude/skills/task-specification-creator/references/spec-update-workflow.md`       | `verify-unassigned-links` / `generate-index` / `quick_validate` の正規経路を `.claude` へ統一       |
| `.claude/skills/task-specification-creator/references/patterns.md`                   | 失敗/成功パターン内の canonical path 例を `.claude` 基準へ補正                                      |
| `.claude/skills/task-specification-creator/scripts/verify-unassigned-links.js`       | 既定 source を `.claude/skills/aiworkflow-requirements/references/task-workflow.md` へ是正          |
| `.claude/skills/task-specification-creator/references/unassigned-task-guidelines.md` | 既存 follow-up 未タスクの current contract 再同期チェックを追加                                     |
| `.claude/skills/skill-creator/references/patterns.md`                                | onboarding follow-up backlog を current contract へ再同期する Phase 12 パターンを追加               |

**注**: LOGS.md は `aiworkflow-requirements` / `task-specification-creator` / `skill-creator` の 3 ファイルを更新。SKILL.md も同 3 ファイルを更新し、Phase 12 再監査知見を反映した。

## 4. ソースコード変更

| ファイル                                                                    | 変更内容                                                                                                                       |
| --------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `apps/desktop/src/renderer/components/organisms/OnboardingWizard/index.tsx` | wizard 本体を新規追加（4 step + completion、focus trap、GENERIC_NAMES 正規化、ThemePreviewCard）                               |
| `apps/desktop/src/renderer/App.tsx`                                         | overlay 表示制御 6 state / readOnboardingValue / writeOnboardingValue / handleCompleteOnboarding / handleOpenOnboarding を追加 |
| `apps/desktop/src/renderer/views/SettingsView/index.tsx`                    | header 右側に `data-testid="settings-open-onboarding"` rerun button を追加                                                     |
| `apps/desktop/src/renderer/store/index.ts`                                  | `useDisplayName()` で `"User"` / `"ユーザー"` を generic name として除外する fallback を調整                                   |
| `apps/desktop/src/renderer/phase11-onboarding-wizard.tsx`                   | screenshot harness（DashboardView 背景の dedicated route）を追加                                                               |
| `apps/desktop/src/renderer/phase11-onboarding-wizard.html`                  | harness entry を追加                                                                                                           |
| `apps/desktop/scripts/capture-task-061-onboarding-wizard-phase11.mjs`       | Playwright screenshot capture script を追加                                                                                    |

## 5. テストコード変更

| ファイル                                     | 変更内容                                                                  | テスト数       |
| -------------------------------------------- | ------------------------------------------------------------------------- | -------------- |
| `OnboardingWizard/OnboardingWizard.test.tsx` | step 遷移・payload・focus trap・ESC ガード 3 条件・境界ケース 9 件        | 20 件          |
| `App.onboarding.test.tsx`                    | overlay 表示条件・完了時 4 キー保存                                       | 2 件           |
| `SettingsView/SettingsView.test.tsx`         | rerun button（`data-testid="settings-open-onboarding"`）の存在と callback | 既存テスト更新 |
| `DashboardView.test.tsx`                     | `useDisplayName()` generic name 除外の回帰確認                            | 既存テスト更新 |

**合計テスト数**: 22 件（新規）+ 既存テストの回帰確認

## 6. Phase 12 成果物の精査・強化内容（SubAgent-E 実施分）

| ファイル                                                                                                                                  | 強化内容                                                                                                                                                                                                                                                                                            |
| ----------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `outputs/phase-12/implementation-guide.md`                                                                                                | Part 1 に各 Step の日常例えテーブルと再表示ガイドを追加。Part 2 に `OnboardingWizardProps` 型・App.tsx ローカル状態テーブル・最終テスト数・カバレッジ最終値を追加。エラーハンドリングに `onComplete` reject ケースと GENERIC_NAMES 正規化ケースを追加。エッジケースに Step 別 disabled 条件を追加。 |
| `docs/30-workflows/completed-tasks/task-061-ui-09-onboarding-wizard/unassigned-task/task-imp-onboarding-mobile-starter-card-order-001.md` | Phase 11 manual note の mobile selected card order 改善余地を 9 セクションの task-spec へ formalize し、親タスクの苦戦箇所も継承した。                                                                                                                                                              |
| `outputs/phase-12/unassigned-task-detection.md`                                                                                           | `system` preview readability / TC-ID drift / canonical-mirror drift は current turn で解消し、Phase 11 manual note 由来の mobile selected card order 改善余地を新規未タスク 1 件として formalize した。既存 follow-up 2 件の配置確認と contract resync も記録した。                                 |
| `outputs/phase-12/skill-feedback-report.md`                                                                                               | task-061 の設計上の強み（overlay 方式・IPC 再利用・GENERIC_NAMES）に関する総評を維持しつつ、visual / non-visual ID 分離、Phase 11 pre-flight、`diff -qr` 必須化、既存 follow-up unassigned task の contract drift check を改善提案へ追加した。                                                      |
| `apps/desktop/src/renderer/components/organisms/OnboardingWizard/index.tsx`                                                               | `system` preview の inner panel を readable な light surface に是正し、split-theme 表現を保ったまま primary text のコントラストを回復した。                                                                                                                                                         |
| `outputs/phase-12/documentation-changelog.md`                                                                                             | 最終テスト数（22 件）・カバレッジ最終値をメタ情報に追加。system spec の変更内容をより詳細に記述。LOGS.md / SKILL.md 3 スキル更新の注記を追加し、統合 workflow ref、新 template profile、new 1件 + existing 2件の unassigned task 同期を記録した。                                                   |
| `outputs/phase-12/spec-update-summary.md`                                                                                                 | `verify-unassigned-links.js` の `.claude` 既定 source、`quick_validate` 最新結果、new 1件 + existing 2件の `audit --target-file` PASS、workflow 統合入口、最新 change history version を追記。                                                                                                      |
| `outputs/phase-12/phase12-task-spec-compliance-check.md`                                                                                  | Task 12-4 / Step 1-E に new unassigned task 1件の formalize と existing follow-up 2 件の配置確認 / contract resync 結果を追記した。                                                                                                                                                                 |

## 7. 変更サマリー

- workflow 成果物、system spec canonical、skill metadata、実装コード、テストコード、Phase 11 screenshot evidence を同一ターンで同期した。
- `generate-index.js` / workflow index regenerate / validator / quick_validate の結果を root evidence と Phase 12 成果物へ再転記した。
- Phase 12 再監査で、`system` preview の readability 問題、`TC-11-07` の重複定義、`ui-ux-navigation.md` の canonical / mirror drift、既存 follow-up 未タスク 2 件の rerun contract drift、Phase 11/12 command path の `.agents` 残存を検出し、当日中に修正と再同期まで完了した。
