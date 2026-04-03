# [#1727] [task-imp-layer12-spec-definition-004] aiworkflow-requirements Layer 1/2 check ID 体系追記

## メタ情報

```yaml
issue_number: 1727
title: [task-imp-layer12-spec-definition-004] aiworkflow-requirements Layer 1/2 check ID 体系追記
state: OPEN
priority: 中
scale: -
category: 改善
status: 未実施
created_date: 2026-03-29
updated_date: 2026-03-29
url: https://github.com/daishiman/AIWorkflowOrchestrator/issues/1727
dependencies: []
```

| 項目       | 内容   |
| ---------- | ------ |
| 優先度     | 中     |
| 規模       | -      |
| ステータス | 未実施 |

---

## 背景・目的

FR-04 verify契約にL1-NNN/L2-NNNのcheck ID体系が未記載。aiworkflow-requirementsの仕様書に Layer 1/2 の check ID 体系を明記することで、実装と仕様の契約を強化する。

## スコープ

- FR-04 verify契約へのL1/L2 check ID体系追記
- 既存の Layer 3/4 との整合確認
- check ID命名規則のドキュメント化

## 技術的コンテキスト

Phase 12 implementation guide で定義されたcheck ID体系:

### Layer 1 (構造検証)

- L1-001: SKILL.md existence
- L1-002: agents/ directory existence
- L1-003: agents/ has files
- L1-004: references/ existence (warning)
- L1-005: output-schema.json existence (warning)

### Layer 2 (コンテンツ検証)

- L2-001: SKILL.md H1 heading
- L2-002: overview section (## 概要)
- L2-003: Trigger section
- L2-004: Anchors section (warning)
- L2-005: agent H1 heading (per .md file)
- L2-006: agent responsibility section (per .md file)
- L2-007: output-schema.json JSON validity

## 参照

- Phase 12 implementation guide: `docs/30-workflows/step-09-par-task-p0-01-verify-execution-engine-layer12/outputs/phase-12/implementation-guide.md`
