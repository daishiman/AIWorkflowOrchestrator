# 正本仕様更新マトリクス

## aiworkflow-requirements

| ファイル                                                                        | Step 1-A | Step 1-B | Step 1-C | Step 2 | 実施内容                                                                   | 状態      |
| ------------------------------------------------------------------------------- | -------- | -------- | -------- | ------ | -------------------------------------------------------------------------- | --------- |
| `.claude/skills/aiworkflow-requirements/references/ui-ux-navigation.md`         | -        | -        | -        | Yes    | `mobileLabel` を含む Global Navigation 正式仕様を維持                      | completed |
| `.claude/skills/aiworkflow-requirements/references/ui-ux-components.md`         | Yes      | Yes      | -        | Yes    | 実装完了記録へ re-audit 追補、`mobileLabel` と Phase 12 台帳ドリフトを追加 | completed |
| `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md` | Yes      | Yes      | -        | Yes    | Global Navigation Core catalog と現行ナビ導線表記を同期                    | completed |
| `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`    | -        | -        | -        | Yes    | `uiSlice` nav 状態と selector を同期済みとして維持                         | completed |
| `.claude/skills/aiworkflow-requirements/references/architecture-overview.md`    | -        | -        | -        | Yes    | renderer layout 構成と rollback path を同期済みとして維持                  | completed |
| `.claude/skills/aiworkflow-requirements/references/directory-structure.md`      | -        | -        | -        | Yes    | organisms / `uiSlice` の現行構成を反映                                     | completed |
| `.claude/skills/aiworkflow-requirements/references/task-workflow.md`            | Yes      | Yes      | Yes      | Yes    | TASK-UI-02 完了台帳へ再監査追補、未タスク current/baseline 分離を追加      | completed |
| `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`          | Yes      | -        | -        | Yes    | 苦戦箇所へ Phase 12 台帳ドリフトと mobileLabel 観点を追加                  | completed |
| `.claude/skills/aiworkflow-requirements/LOGS.md`                                | Yes      | -        | -        | -      | 이번再監査の実行ログを追記                                                 | completed |

## workflow 本体

| ファイル                                                                                                                  | Step 1-A | Step 1-B | Step 1-C | Step 2 | 実施内容                                                                                         | 状態      |
| ------------------------------------------------------------------------------------------------------------------------- | -------- | -------- | -------- | ------ | ------------------------------------------------------------------------------------------------ | --------- |
| `docs/30-workflows/completed-tasks/task-057-ui-02-global-nav-core/phase-1..11-*.md`                                       | Yes      | -        | -        | -      | workflow 本文に残っていた `pending` / 未チェック完了条件 / 実行タスク結果を completed 実態へ同期 | completed |
| `docs/30-workflows/completed-tasks/task-057-ui-02-global-nav-core/phase-12-documentation.md`                              | Yes      | -        | -        | -      | pending から completed へ同期し、Task 12-1〜12-5 と実行記録を更新                                | completed |
| `docs/30-workflows/completed-tasks/task-057-ui-02-global-nav-core/artifacts.json`                                         | Yes      | -        | -        | -      | `status=in_progress` / `currentPhase=12` を反映                                                  | completed |
| `docs/30-workflows/completed-tasks/task-057-ui-02-global-nav-core/outputs/artifacts.json`                                 | Yes      | -        | -        | -      | `artifacts.json` と同内容で新規同期                                                              | completed |
| `docs/30-workflows/completed-tasks/task-057-ui-02-global-nav-core/index.md`                                               | Yes      | Yes      | -        | -      | `generate-index.js --regenerate` で Phase 状態を再生成                                           | completed |
| `docs/30-workflows/completed-tasks/task-057-ui-02-global-nav-core/outputs/phase-12/phase12-task-spec-compliance-check.md` | Yes      | -        | -        | -      | Task 12-1〜12-5 と workflow stale 是正の準拠証跡を追加                                           | completed |

## 関連 skill / template

| ファイル                                                                            | Step 1-A | Step 1-B | Step 1-C | Step 2 | 実施内容                                                                                | 状態      |
| ----------------------------------------------------------------------------------- | -------- | -------- | -------- | ------ | --------------------------------------------------------------------------------------- | --------- |
| `.claude/skills/task-specification-creator/references/phase-11-12-guide.md`         | Yes      | -        | -        | -      | `outputs/artifacts.json` / `index.md` に加え `phase-1..11` 本文 pending 残置確認を追加  | completed |
| `.claude/skills/task-specification-creator/references/spec-update-workflow.md`      | Yes      | -        | -        | -      | `index.md` stale と `phase-1..11` 本文 stale を誤判断パターンに追加                     | completed |
| `.claude/skills/skill-creator/references/patterns.md`                               | Yes      | -        | -        | -      | workflow index / artifacts 二重同期と `phase-1..11` 本文同期パターンを追加              | completed |
| `.claude/skills/skill-creator/assets/phase12-system-spec-retrospective-template.md` | Yes      | -        | -        | -      | `outputs/artifacts.json` / `index.md` に加え `phase-1..11` 検証コマンドと完了条件を追加 | completed |
| `.claude/skills/skill-creator/assets/phase12-spec-sync-subagent-template.md`        | Yes      | -        | -        | -      | SubAgent テンプレートへ workflow index / artifacts / `phase-1..11` 本文同期確認を追加   | completed |
| `.claude/skills/task-specification-creator/LOGS.md`                                 | Yes      | -        | -        | -      | 実行ログを追記                                                                          | completed |
| `.claude/skills/skill-creator/LOGS.md`                                              | Yes      | -        | -        | -      | 実行ログを追記                                                                          | completed |

## 補足

- `spec_created` ではなく `completed` を採用した。
- Step 3 `AppDock` 削除は readiness 管理として扱い、完了扱いにはしていない。
- repo-wide の未タスク baseline 93件は今回差分起因ではなく、current 0件を合否基準とした。
