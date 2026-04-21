# [#2330] [UNASSIGNED-EVALS-MIRROR-RESOURCE-MAP-CROSS-ROOT-LINK-001] resource-map.md の cross-root link を相対パス化

## メタ情報

```yaml
issue_number: 2330
title: [UNASSIGNED-EVALS-MIRROR-RESOURCE-MAP-CROSS-ROOT-LINK-001] resource-map.md の cross-root link を相対パス化
state: OPEN
priority: 低
scale: 小規模
category: 改善
status: 未実施
created_date: 2026-04-19
updated_date: 2026-04-19
url: https://github.com/daishiman/AIWorkflowOrchestrator/issues/2330
dependencies: []
```

| 項目       | 内容   |
| ---------- | ------ |
| 優先度     | 低     |
| 規模       | 小規模 |
| ステータス | 未実施 |

---

## 概要

`.agents/skills/skill-creator/references/resource-map.md` に残る `.claude` 参照を解消し、mirror の片方向依存をなくす。

## 発見元

- TASK-EVALS-CONSUMER-AUDIT-001 Phase 5 / 12
- 判定根拠: [implementation-guide.md](../blob/docs/task-spec-TASK-EVALS-CONSUMER-AUDIT-001/docs/30-workflows/evals-consumer-audit-001/outputs/phase-12/implementation-guide.md) + phase-5/consumer-audit-report.md §8 候補 #3

## 仕様書

`docs/30-workflows/unassigned-task/task-mirror-resource-map-cross-root-link-001.md`

## 依存

- 独立

## 主な苦戦箇所

- .agents 側から .claude 側へ絶対パス参照が残存、mirror 独立性が崩れる
- 他スキルに cross-root link が潜んでいないか grep で網羅確認必要
- 修正後も dual-root-parity.md の bit-for-bit 一致維持が必要
- resource-map.md の参照書式統一（相対 / 両 root 横断）判断
