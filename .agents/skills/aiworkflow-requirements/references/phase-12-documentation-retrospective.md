# Phase 12 Documentation Retrospective

## 概要

- タスクID: `TASK-IMP-AIWORKFLOW-REQUIREMENTS-LINE-BUDGET-REFORM-001`
- 対象: `/.claude/skills/aiworkflow-requirements/`（system spec）
- 実施日: 2026-03-13
- フェーズ: 12（Documentation & Sync）

## 実施した内容

1. root evidence の再構成
- `implementation-guide.md` を Part 1 / Part 2 + `たとえば` + 型/API/エッジケース/設定項目まで補強
- `phase12-task-spec-compliance-check.md` を shallow PASS 表から root evidence へ引き上げる前提を整理
- `unassigned-task-detection.md` に `verify-unassigned-links`、`audit --diff-from HEAD`、repo-wide baseline の 3 値を分離記録

2. system spec の再同期
- `.claude/skills/aiworkflow-requirements/references/task-workflow-completed-skill-lifecycle-agent-view-line-budget.md` に Phase 12 再監査の実装内容、苦戦箇所、5分解決カードを追記
- `.claude/skills/aiworkflow-requirements/references/lessons-learned-workflow-quality-line-budget-reform.md` に shallow PASS 防止と split-aware link audit の教訓を追加
- `.claude/skills/aiworkflow-requirements/SKILL.md` / `LOGS.md` に root evidence 化と split-aware 監査の履歴を反映

3. cross-skill 改善
- `task-specification-creator` へ `phase12-task-spec-compliance-template.md` の root evidence 化、`verify-unassigned-links.js` の sibling-aware 化、`unassigned-task-guidelines.md` の追補を戻した
- `skill-creator` へ shallow PASS 防止パターンを追加し、同種 docs-heavy task の再監査を短手順化した

4. 未タスクと blocker の整理
- active follow-up は `docs/30-workflows/completed-tasks/step-04-par-task-09-slide-ai-runtime-alignment/unassigned-task/task-imp-aiworkflow-requirements-generated-index-sharding-001.md` のみ
- active unassigned task を task-specification-creator 形式の 10 見出しへ正規化した
- `TASK-IMP-AIWORKFLOW-REQ-PHASE12-ARTIFACTS-MISSING-001` は対応済み履歴として維持した

## 課題（苦戦ポイント）

- shallow PASS 表の過信
  - 成果物が存在しても、implementation guide の型/API不足や未タスク10見出し欠落を見逃した。
  - 対応: root evidence 1ファイルに 4点突合、必須要素、current/baseline を集約する。

- split 親だけを見る link audit の抜け
  - `task-workflow.md` 親ファイルだけでは、`task-workflow-backlog.md` にある active 未タスクリンクを拾えなかった。
  - 対応: 親 `task-workflow.md` を与えたときは sibling `task-workflow*.md` を一括走査する。

- `current` と `baseline` の意味の混線
  - `current=0` でも `baseline=134` が残るため、未完了と誤判定しやすかった。
  - 対応: 合否は `currentViolations`、repo 全体負債は `baselineViolations` と固定する。

- documentation shell の最終昇格漏れ
  - outputs を補完しても `task-workflow` / `lessons` / `SKILL` / `LOGS` の final state までそろえないと stale state が残る。
  - 対応: close-out 前に workflow outputs、system spec、skill logs を同一ターンで一括再同期する。

## 運用上の最適化提案

- Phase 12 完了前チェックに `validate-phase12-implementation-guide` を固定する
- `verify-unassigned-links` は split 親 `task-workflow.md` 指定を標準ルートにする
- `phase12-task-spec-compliance-check.md` を Task 12-1〜12-5 と Step 1-A〜1-G / Step 2 の root evidence として扱う

## 現在の状態

- workflow 本体は `Phase 1-12 completed / currentPhase=13 / Phase 13 blocked`
- `verify-unassigned-links` は `existing=222 / missing=0`
- `audit-unassigned-tasks --json --diff-from HEAD` は `currentViolations=0 / baselineViolations=134`
- active blocker は generated `topic-map.md` の 500 行超問題で、`TASK-IMP-AIWORKFLOW-REQUIREMENTS-GENERATED-INDEX-SHARDING-001` に引き継いでいる
- あわせて、`generate-index.js` 再実行後の実測値が current docs に stale のまま残らないよう、`TASK-IMP-AIWORKFLOW-GENERATED-INDEX-METRIC-SYNC-GUARD-001` を follow-up として追加する
