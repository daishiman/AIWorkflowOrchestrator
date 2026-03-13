# Phase 12 仕様更新サマリー

## Step 1-A: canonical 完了記録

| 種別            | パス                                                                                                                                             | 実施内容                                                                                                                                                                                                                                                                                                                                        |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| workflow        | `docs/30-workflows/completed-tasks/task-061-ui-09-onboarding-wizard/`                                                                            | `index.md` / `artifacts.json` / `phase-1..13` / `outputs/phase-4..12/*` / `outputs/verification-report.md` を実績値へ更新                                                                                                                                                                                                                       |
| system spec     | `.claude/skills/aiworkflow-requirements/references/*.md`                                                                                         | `task-workflow.md` / `ui-ux-components.md` / `ui-ux-feature-components.md` / `ui-ux-settings.md` / `ui-ux-navigation.md` / `arch-state-management.md` / `lessons-learned.md` / `workflow-onboarding-wizard-alignment.md` を更新し、mobile selected card order の follow-up 追加、既存 follow-up 2 件の current contract resweep、統合入口を反映 |
| unassigned task | `docs/30-workflows/unassigned-task/*.md`                                                                                                         | `UT-IMP-ONBOARDING-MOBILE-STARTER-CARD-ORDER-001` を新規作成し、`UT-IMP-ONBOARDING-TEST-HARDENING-GUARD-001` / `UT-IMP-SETTINGS-ONBOARDING-RERUN-DISCOVERABILITY-001` の配置確認と本文契約の再同期を実施                                                                                                                                        |
| skill logs      | `.claude/skills/aiworkflow-requirements/LOGS.md`, `.claude/skills/task-specification-creator/LOGS.md`, `.claude/skills/skill-creator/LOGS.md`    | TASK-UI-09 の Phase 12 実行記録と follow-up drift 再発防止パターン反映を追加                                                                                                                                                                                                                                                                    |
| skill history   | `.claude/skills/aiworkflow-requirements/SKILL.md`, `.claude/skills/task-specification-creator/SKILL.md`, `.claude/skills/skill-creator/SKILL.md` | 変更履歴に current task の再監査知見を追加し、workflow 統合入口、follow-up 未タスク contract resync、Phase 12 template profile を追記した                                                                                                                                                                                                       |

## Step 1-B / 1-C: workflow 状態と traceability

| 項目                | 結果                                                                                                                                               |
| ------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| `artifacts.json`    | Phase 1-12=`completed`, Phase 13=`skipped`                                                                                                         |
| workflow index      | `node .claude/skills/task-specification-creator/scripts/generate-index.js --workflow ... --regenerate` PASS                                        |
| task traceability   | `rg -l "TASK-UI-09-ONBOARDING-WIZARD" .claude/.../references` で 7 files を確認                                                                    |
| screenshot evidence | `TC-11-01`〜`TC-11-06` を Phase 11 root / outputs / system spec に同期し、`TC-11-04` は current build で `system` preview readability を再撮影した |

## Step 1-D / 1-G: index 再生成と validation

| 項目                                                                                | 結果                                                                                                           |
| ----------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| `node .claude/skills/aiworkflow-requirements/scripts/generate-index.js`             | PASS（`indexes/topic-map.md`, `indexes/keywords.json` 再生成）                                                 |
| `node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js` | PASS（source=`.claude/skills/aiworkflow-requirements/references/task-workflow.md`, `220/220`）                 |
| `audit-unassigned-tasks --json --diff-from HEAD --target-file <3 files>`            | PASS（new 1件 + existing 2件の全てで `current=0`）                                                             |
| `quick_validate .claude/skills/aiworkflow-requirements`                             | PASS（0エラー, 136警告）                                                                                       |
| `quick_validate .claude/skills/task-specification-creator`                          | PASS（0エラー, 0警告）                                                                                         |
| `quick_validate .claude/skills/skill-creator`                                       | PASS（0エラー, 0警告）                                                                                         |
| warning 分類                                                                        | aiworkflow 側 warning は `indexes/resource-map.md` / `indexes/topic-map.md` 経由参照のため「要監視・対応不要」 |

## Step 2: system spec 更新判断

| 項目                     | 判定     | 理由                                                                                                                                |
| ------------------------ | -------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| UI/UX spec               | 更新あり | onboarding overlay、Settings rerun、`system` preview readability、Phase 11 screenshot 6件を current implementation へ再同期したため |
| state management spec    | 更新あり | `App.tsx` local state と wizard local state の ownership を追加したため                                                             |
| lesson/task ledger       | 更新あり | task-061 の苦戦箇所、検証値、completed workflow path を残す必要があるため                                                           |
| `api-*` / `interfaces-*` | 更新不要 | 新規 IPC channel や preload public API を追加していないため                                                                         |
| `ui-ux-design-system.md` | 更新不要 | global token / design system rule を変更していないため                                                                              |

## canonical / mirror 同期

| 種別           | パス             | 判定                                                                          |
| -------------- | ---------------- | ----------------------------------------------------------------------------- |
| canonical root | `.claude/skills` | 更新完了                                                                      |
| mirror root    | `.agents/skills` | 同期完了（対象ファイルを canonical から再同期し、`diff -qr` で差分 0 を確認） |

## P1/P25/P29 準拠確認

| ルール | 内容                                                                                                                                             | 状態 |
| ------ | ------------------------------------------------------------------------------------------------------------------------------------------------ | ---- |
| P1/P25 | `LOGS.md` は `aiworkflow-requirements` / `task-specification-creator` / `skill-creator` の 3 ファイルを更新                                      | 完了 |
| P29    | `SKILL.md` の変更履歴を `aiworkflow-requirements`（`9.01.96`）/ `task-specification-creator`（`v10.08.66`）/ `skill-creator`（`10.37.40`）へ追記 | 完了 |
| P2     | `topic-map.md` を `generate-index.js` で再生成                                                                                                   | 完了 |
