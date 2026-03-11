# [#1112] [UT-IMP-PHASE12-STEP1A-VERIFICATION-SCRIPT-001] Phase 12 Step 1-A 必須更新の機械検証スクリプト

## メタ情報

```yaml
issue_number: 1112
title: [UT-IMP-PHASE12-STEP1A-VERIFICATION-SCRIPT-001] Phase 12 Step 1-A 必須更新の機械検証スクリプト
state: CLOSED
priority: 高
scale: 小規模
category: 改善
status: 未実施
created_date: 2026-03-09
updated_date: 2026-03-09
url: https://github.com/daishiman/AIWorkflowOrchestrator/issues/1112
dependencies: []
```

| 項目       | 内容   |
| ---------- | ------ |
| 優先度     | 高     |
| 規模       | 小規模 |
| ステータス | 未実施 |

---

## 概要

Phase 12 Step 1-A の5つの必須更新（LOGS.md x2, SKILL.md x2, topic-map.md）を機械検証するスクリプトを作成する。

## 背景

- P1/P2/P25/P29 として繰り返し問題になっている更新漏れ
- 既存の verify-all-specs / validate-phase-output は Step 1-A の更新有無を検証しない
- サブエージェントが完了報告しても実際は未完了のケースがある（P43, P51）

## 完了条件

- validate-phase12-step1a.js が5項目を検証可能
- JSON 出力で PASS/FAIL 判定
- 既存検証スクリプトと組み合わせて品質網羅

## 仕様書

docs/30-workflows/unassigned-task/task-phase12-step1a-verification-script.md
