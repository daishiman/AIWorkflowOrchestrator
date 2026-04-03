# [#1728] [task-imp-l2-section-name-flexible-005] L2 SKILL.md セクション名柔軟化（多言語・別名対応）

## メタ情報

```yaml
issue_number: 1728
title: [task-imp-l2-section-name-flexible-005] L2 SKILL.md セクション名柔軟化（多言語・別名対応）
state: OPEN
priority: 低
scale: -
category: 改善
status: 未実施
created_date: 2026-03-29
updated_date: 2026-03-29
url: https://github.com/daishiman/AIWorkflowOrchestrator/issues/1728
dependencies: []
```

| 項目       | 内容   |
| ---------- | ------ |
| 優先度     | 低     |
| 規模       | -      |
| ステータス | 未実施 |

---

## 背景・目的

## 概要 以外のセクション名（## Overview等の英語名や別名）でL2チェックのfalse negativeが発生している。多言語・別名対応を実装することで検証精度を向上させる。

## スコープ

- L2-002: overview section チェックの別名対応（## Overview, ## 説明 等）
- L2-003: Trigger section チェックの別名対応
- L2-004: Anchors section チェックの別名対応
- L2-006: agent responsibility section の別名対応（## 責務 → ## Responsibility 等）
- テスト追加（別名パターンの網羅）

## 現状

Phase 12 implementation guide の Note N-01, N-02 にて発見事項として記録:

- N-01: 実スキルの SKILL.md セクション名が L2 チェックと一致しないケースあり（スコープ外）
- N-02: agent spec の `## 責務` が別名で書かれているケースで warning（スコープ外）

Phase 11 手動テストでは `.agents/skills/task-specification-creator` で errors: 2, warnings: 11 が検出されたが、セクション名不一致が原因のfalse negativeが含まれる可能性がある。

## 参照

- Phase 12 implementation guide: `docs/30-workflows/step-09-par-task-p0-01-verify-execution-engine-layer12/outputs/phase-12/implementation-guide.md`
- VerificationEngine: `apps/desktop/src/main/services/runtime/SkillCreatorVerificationEngine.ts`
