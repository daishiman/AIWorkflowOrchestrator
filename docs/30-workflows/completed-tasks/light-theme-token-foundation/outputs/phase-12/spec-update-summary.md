# Phase 12 成果物: spec-update-summary

## Step 1-A（タスク完了記録）

- 更新先: `ui-ux-design-system.md`, `task-workflow.md`, `lessons-learned.md`
- 反映内容: TASK-FIX-LIGHT-THEME-TOKEN-FOUNDATION-001 の完了記録、Phase 11 視覚検証、後続タスク引き継ぎ

## Step 1-B（実装状況テーブル更新）

- `ui-ux-design-system.md` の token セクションを light token foundation 実装値へ更新
- 判定: `completed`（`spec_created` ではない）

## Step 1-C（関連タスク更新）

- 既存関連タスク `UT-UI-03-LIGHT-SECONDARY-TEXT-CONTRAST-001` との関係を整理
- follow-up を 2 件起票し、その後 shared-color migration は `docs/30-workflows/completed-tasks/task-fix-light-theme-shared-color-migration-001.md` へ完了移管、contrast regression guard は `docs/30-workflows/completed-tasks/light-theme-contrast-regression-guard/` と archive task spec で同期した

## Step 2（条件付きシステム仕様更新）

- 判定: **更新あり**
- 理由: token 契約値・完了台帳・教訓が新規発生したため
- 更新ファイル:
  - `.claude/skills/aiworkflow-requirements/references/ui-ux-design-system.md`
  - `.claude/skills/aiworkflow-requirements/references/task-workflow.md`
  - `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`

### Step 2 追補（実装内容 + 苦戦箇所の同粒度化）

- `task-workflow.md`: 苦戦箇所4（未タスク配置ドリフト）を追加し、`docs/30-workflows/completed-tasks/light-theme-token-foundation/unassigned-task/` 正本配置を標準化
- `ui-ux-design-system.md`: 本タスク専用の苦戦箇所節を追加（Phase成果物不足 / Phase 11必須節不足 / 未タスク配置ドリフト）

## Skill Creator 最適化（テンプレート準拠）

- 更新ファイル:
  - `.claude/skills/skill-creator/assets/phase12-system-spec-retrospective-template.md`
  - `.claude/skills/skill-creator/assets/phase12-spec-sync-subagent-template.md`
- 反映内容:
  - workflow 直下 `.../<workflow>/unassigned-task/` 参照で止めない canonical path ルールを追加
  - `audit-unassigned-tasks --json --diff-from HEAD --target-file <unassigned-file>` を検証コマンドへ明示

## 仕様書別 SubAgent 分担（実行記録）

| SubAgent   | 関心ごと                                        | 実施内容                                                                                                     |
| ---------- | ----------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| SubAgent-A | 完了台帳同期（`task-workflow.md`）              | 実装内容 + 苦戦箇所4 + 変更履歴 1.67.45 を反映                                                               |
| SubAgent-B | UI design spec 同期（`ui-ux-design-system.md`） | 実装内容節に対応する苦戦箇所節を追加し、変更履歴 1.5.8 を反映                                                |
| SubAgent-C | 教訓同期（`lessons-learned.md`）                | 既存追補（1.29.67）との整合を確認し、再利用ルールを維持                                                      |
| SubAgent-D | skill-creator 改善                              | テンプレート2件へ canonical path 固定 + `audit --target-file` 条件を追加                                     |
| SubAgent-E | 検証担当                                        | `verify-all-specs` / `validate-phase-output` / `verify-unassigned-links` / `audit` / screenshot 再確認を実施 |

- 並列実行: A/B/D/E は独立関心として並列進行し、C は A/B 完了後に整合チェックを実施。

## 付帯同期

- `SKILL.md` / `LOGS.md` を `aiworkflow-requirements` / `skill-creator` / `task-specification-creator` で更新
- workflow `artifacts.json` と `outputs/artifacts.json` を同一内容で同期
- `unassigned-task-detection.md` を 2件起票結果とその後の canonical path 更新に合わせて再同期
