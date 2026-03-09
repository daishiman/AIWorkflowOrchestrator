# 仕様更新サマリー - TASK-FIX-AUTHGUARD-TIMEOUT-SETTINGS-BYPASS-001

## メタ情報

| 項目       | 内容                                           |
| ---------- | ---------------------------------------------- |
| タスクID   | TASK-FIX-AUTHGUARD-TIMEOUT-SETTINGS-BYPASS-001 |
| Phase      | 12 - Task 2                                    |
| ステータス | completed                                      |
| 実行日     | 2026-03-10                                     |

## Step 1-A: タスク完了記録

| 対象ファイル                                         | 更新内容                                                         | 状態 |
| ---------------------------------------------------- | ---------------------------------------------------------------- | ---- |
| `.claude/skills/aiworkflow-requirements/LOGS.md`     | 再監査、reset guard 修正、screenshot 4件、system spec 同期を記録 | 完了 |
| `.claude/skills/task-specification-creator/LOGS.md`  | screenshot 必須運用と worktree preflight を記録                  | 完了 |
| `.claude/skills/aiworkflow-requirements/SKILL.md`    | `9.01.56` を追加                                                 | 完了 |
| `.claude/skills/task-specification-creator/SKILL.md` | `v10.08.39` を追加                                               | 完了 |
| `references/task-workflow.md`                        | 完了タスク台帳に再監査内容と検証証跡を追加                       | 完了 |
| `references/lessons-learned.md`                      | 再発防止手順を追加                                               | 完了 |

## Step 1-B: 実装状況テーブル

該当なし。今回の追加は renderer 側の状態制御と workflow/system spec 同期であり、独立した API/IPC 実装状況テーブル更新は不要。

## Step 1-C: 関連タスク・関連仕様更新

| 対象ファイル                               | 更新内容                                                                         | 状態 |
| ------------------------------------------ | -------------------------------------------------------------------------------- | ---- |
| `references/ui-ux-feature-components.md`   | `AuthTimeoutFallback` と Settings 公開シェルを UI 機能仕様へ追記                 | 完了 |
| `references/ui-ux-navigation.md`           | `settings` を未認証 reset 対象外として追記、画面証跡4件を同期                    | 完了 |
| `references/architecture-auth-security.md` | Settings bypass が shell bypass + reset 除外の両条件で成立することを明記         | 完了 |
| `references/arch-state-management.md`      | `PUBLIC_UNAUTHENTICATED_VIEWS` / `shouldResetUnauthenticatedView` 相当契約を追記 | 完了 |

## Step 1-D: index 再生成

| コマンド                                                                | 結果 |
| ----------------------------------------------------------------------- | ---- |
| `node .claude/skills/aiworkflow-requirements/scripts/generate-index.js` | PASS |

## Step 1-E: 未タスク配置と監査

| コマンド                                                                                                   | 結果                                           | 判定                           |
| ---------------------------------------------------------------------------------------------------------- | ---------------------------------------------- | ------------------------------ |
| `node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js`                        | `total=213 / existing=213 / missing=0`         | PASS                           |
| `node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js --json --diff-from HEAD` | `currentViolations=0 / baselineViolations=130` | PASS（今回差分に新規違反なし） |

補足:

- 今回タスクで `docs/30-workflows/unassigned-task/` に新規配置すべき未タスクは 0 件。
- baseline 側の legacy 負債は継続監視対象であり、本タスクの Phase 12 未完了とは切り分ける。

## Step 2: システム仕様更新

| 対象ファイル                               | 変更内容                                                                                                | 状態 |
| ------------------------------------------ | ------------------------------------------------------------------------------------------------------- | ---- |
| `references/architecture-auth-security.md` | `v1.6.1`。`AuthTimeoutFallback` を「retry + settings」へ是正し、Settings bypass の reset 除外要件を追加 | 完了 |
| `references/arch-state-management.md`      | `v3.14.1`。未認証時 view reset ルールと公開ビュー境界を追加                                             | 完了 |
| `references/ui-ux-navigation.md`           | `v1.7.1`。`settings` の到達性を bypass + reset 除外のセットで定義                                       | 完了 |
| `references/ui-ux-feature-components.md`   | `v1.14.24`。`AuthTimeoutFallback` / Settings 公開シェルの UI 収録を追加                                 | 完了 |
| `references/task-workflow.md`              | `1.67.35`。完了タスク、検証証跡、0件未タスクを追加                                                      | 完了 |
| `references/lessons-learned.md`            | `1.29.57`。再監査の苦戦箇所と 4 ステップ解決手順を追加                                                  | 完了 |

## 付記: skill-creator 反映

| 対象ファイル                                                                        | 更新内容                                                                                   | 状態 |
| ----------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ | ---- |
| `.claude/skills/skill-creator/references/patterns.md`                               | 明示 screenshot 要求時の `plan / metadata / reset guard` 同期パターンを追加                | 完了 |
| `.claude/skills/skill-creator/assets/phase12-system-spec-retrospective-template.md` | worktree preflight、screenshot 補助証跡、公開ビュー bypass 時の reset guard チェックを追加 | 完了 |
| `.claude/skills/skill-creator/LOGS.md`                                              | 今回の skill 更新ログを追記                                                                | 完了 |
| `.claude/skills/skill-creator/SKILL.md`                                             | `10.37.20` を追加                                                                          | 完了 |

## 付記: workflow 成果物の是正

| ファイル                                        | 是正内容                                             |
| ----------------------------------------------- | ---------------------------------------------------- |
| `phase-11-manual-test.md`                       | screenshot 前提の実績に同期                          |
| `outputs/phase-11/manual-test-result.md`        | P53 代替記述を削除し、実画面 4 件 + 110 tests に更新 |
| `outputs/phase-12/unassigned-task-detection.md` | open 0 件へ再判定                                    |
| `outputs/phase-12/documentation-changelog.md`   | 「未完了」記述を除去して実更新ログへ同期             |
| `outputs/verification-report.md`                | `verify-all-specs` PASS の最新検証結果へ更新         |

## 総括

今回の再監査では、単なる Settings bypass だけでは不十分で、未認証時の view reset から `settings` を除外しないと仕様が相殺されることが判明した。コード、workflow 成果物、system spec をその一点で揃え直した。
