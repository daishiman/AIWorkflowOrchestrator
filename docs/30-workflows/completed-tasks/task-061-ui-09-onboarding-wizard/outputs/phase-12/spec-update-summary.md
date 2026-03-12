# Phase 12 Spec Update Summary

## canonical root

- 正本更新先は `.claude/skills/aiworkflow-requirements/`
- 今回の同期対象は `task-workflow` / `ui-ux-feature-components` / `ui-ux-navigation` / `ui-ux-settings` / `lessons-learned`

## Step 別結果

| Step | 結果 | 内容 |
| --- | --- | --- |
| 1-A | 完了 | workflow 本文、Phase 12 成果物、`task-workflow.md`、UI/設定/ナビ/教訓の正本を同期 |
| 1-B | 完了 | feature catalog の `Onboarding Wizard` 行を `完了` として扱い、workflow 本文 `phase-4..12` を completed へ是正 |
| 1-C | 完了 | `task-workflow.md` の open item を unassigned report 参照から正式な未タスク指示書参照へ置換 |
| 1-D | 補完 | workflow `index.md`、`artifacts.json`、`outputs/artifacts.json` の Phase 12 記録を同一内容へそろえた |
| 1-E | 完了 | 未タスクは 2 件を formalize し、`docs/30-workflows/unassigned-task/` で追跡できるようにした |
| 1-F | N/A | DevOps / CI 契約の変更はなし |
| 1-G | 完了 | Phase 12 準拠確認用に `phase12-task-spec-compliance-check.md` を追加 |
| Step 2 | 完了 | UI domain spec と workflow 台帳に実装内容・苦戦箇所・open item を反映 |

## 更新した workflow / outputs

| 項目 | 反映内容 |
| --- | --- |
| `phase-12-documentation.md` | Task 12-1〜12-5 を明記し、完了条件を再構成 |
| `implementation-guide.md` | Part 1 / Part 2、型定義、API、edge case、設定値を追記 |
| `documentation-changelog.md` | workflow 本文・system spec・skill 更新を 1 本化 |
| `unassigned-task-detection.md` | raw 候補 3 件を精査し、2 件を formalize |
| `phase12-task-spec-compliance-check.md` | Task 12-1〜12-5 / Step 1-A〜1-G / Step 2 の証跡集約を追加 |
| `index.md` / `phase-4..11` | `planned` / `not_started` から completed へ是正 |
| `artifacts.json` / `outputs/artifacts.json` | Phase 12 supplemental artifact を追加し、時刻を同期 |

## 更新した `.claude` 正本仕様

| ファイル | 反映内容 |
| --- | --- |
| `task-workflow.md` | 完了記録と正式未タスク参照へ更新 |
| `ui-ux-feature-components.md` | onboarding feature 本文、苦戦箇所、5分解決カードを追加 |
| `ui-ux-navigation.md` | dashboard overlay / settings rerun 契約と画面証跡を追加 |
| `ui-ux-settings.md` | Settings rerun card の文言、persist、error handling を追加 |
| `lessons-learned.md` | overlay / `skillName` 分離 / rerun discoverability / Phase 12 formalize の教訓を追加 |

## formalize した未タスク

| 未タスクID | 概要 | 配置先 |
| --- | --- | --- |
| UT-IMP-ONBOARDING-TEST-HARDENING-GUARD-001 | function coverage と `act(...)` warning のテスト hardening | `docs/30-workflows/unassigned-task/task-imp-onboarding-test-hardening-guard-001.md` |
| UT-IMP-SETTINGS-ONBOARDING-RERUN-DISCOVERABILITY-001 | Settings rerun card の IA / 発見性改善 | `docs/30-workflows/unassigned-task/task-imp-settings-onboarding-rerun-discoverability-001.md` |
