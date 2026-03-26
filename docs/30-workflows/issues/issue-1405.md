# [#1405] [UT-FIX-VERIFY-ALL-SPECS-BLOCKED-PHASE-001] verify-all-specs の blocked phase 判定整合

## メタ情報

```yaml
issue_number: 1405
title: [UT-FIX-VERIFY-ALL-SPECS-BLOCKED-PHASE-001] verify-all-specs の blocked phase 判定整合
state: OPEN
priority: 中
scale: 小規模
category: 改善
status: 未実施
created_date: 2026-03-20
updated_date: 2026-03-20
url: https://github.com/daishiman/AIWorkflowOrchestrator/issues/1405
dependencies: []
```

| 項目       | 内容   |
| ---------- | ------ |
| 優先度     | 中     |
| 規模       | 小規模 |
| ステータス | 未実施 |

---

## 概要

`verify-all-specs.js` が Phase 13 `blocked` を workflow 文脈に応じて扱えず、`outputs/verification-report.md` で `PR作成 ✅ 問題なし` と誤記録する問題を是正する。

## 背景

TASK-IMP-AGENTVIEW-IMPROVE-ROUTE-001 Phase 12 再監査（2026-03-20）にて検出。`artifacts.json.status=blocked` と verification report の結果が矛盾している。

## 対応方針

- `verify-all-specs.js` に blocked phase の許容条件を追加する
- `outputs/verification-report.md` のサマリーと Phase 別結果で blocked を表現できるようにする
- `artifacts.json.status=blocked` と verification report の結果が矛盾しないことを確認する

## 完了条件

- [ ] Phase 13 が `blocked` の workflow で verification report が blocked を明示する
- [ ] completed workflow の既存結果を壊さない
- [ ] Task04 の `outputs/verification-report.md` が手修正なしで整合する

## 検証コマンド

```bash
node .claude/skills/task-specification-creator/scripts/verify-all-specs.js --workflow docs/30-workflows/skill-lifecycle-routing/tasks/step-03-seq-task-04-agentview-improve-route
```

## 参照

- タスク指示書: `docs/30-workflows/unassigned-task/task-ut-fix-verify-all-specs-blocked-phase-001.md`
- 発見元: TASK-IMP-AGENTVIEW-IMPROVE-ROUTE-001 Phase 12 再監査
