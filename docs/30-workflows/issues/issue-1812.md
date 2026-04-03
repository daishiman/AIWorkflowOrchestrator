# [#1812] [UT-TASKSPEC-UI-PHASE12-EVIDENCE-GATE-001] task-specification-creator Phase 12 UI evidence hard gate 実装

## メタ情報

```yaml
issue_number: 1812
title: [UT-TASKSPEC-UI-PHASE12-EVIDENCE-GATE-001] task-specification-creator Phase 12 UI evidence hard gate 実装
state: OPEN
priority: 低
scale: 小規模
category: 改善
status: 未実施
created_date: 2026-03-31
updated_date: 2026-03-31
url: https://github.com/daishiman/AIWorkflowOrchestrator/issues/1812
dependencies: []
```

| 項目       | 内容   |
| ---------- | ------ |
| 優先度     | 低     |
| 規模       | 小規模 |
| ステータス | 未実施 |

---

## タスク概要

`task-specification-creator` スキルの Phase 12 完了条件にUIタスク用 evidence hard gate とフューチャーワーディング禁止ルールを追加する。

## 発見元

- UT-UIUX-PLAYWRIGHT-E2E-001 Phase 12 / skill-feedback-report.md
- 発見日: 2026-03-31

## Why

**問題1**: UI タスクの Phase 12 close-out 前に `screenshot-plan.json` / `screenshot-coverage.md` / metadata JSON / screenshots ディレクトリの存在チェックが hard gate になっていない。成果物の実体が不足したまま close-out 文書だけが完了扱いになるリスクが顕在化した。

**問題2**: `artifacts.json` の wording を Phase 13 へ先送りする記述が validator で弾かれなかった。「planned」「future」などの wording が残ったまま Phase 完了になる構造的問題がある。

## What

1. `phase-11-12-guide.md` に UI タスク Phase 12 evidence hard gate チェックリストを追記
2. `phase-12-documentation-guide.md` に artifacts.json フューチャーワーディング禁止ルールを追記
3. `.agents/skills/task-specification-creator/` との divergence を 0 に保つ

## 受け入れ条件

- [ ] `phase-11-12-guide.md` に UI タスク evidence hard gate が追記されている
- [ ] `phase-12-documentation-guide.md` にフューチャーワーディング禁止ルールが追記されている
- [ ] `.agents/skills/task-specification-creator/` との `diff -qr` が 0

## 関連タスク

- UT-UIUX-PLACEHOLDER-EVIDENCE-VALIDATOR-001 (#1800) — スクリプト実装との協調

## 仕様書

`docs/30-workflows/unassigned-task/UT-TASKSPEC-UI-PHASE12-EVIDENCE-GATE-001.md`
