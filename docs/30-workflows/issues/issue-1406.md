# [#1406] [UT-STATUSBADGE-MAPPING-3VALUES-001] StatusBadge マッピング仕様への新3値追加

## メタ情報

```yaml
task_id: UT-STATUSBADGE-MAPPING-3VALUES-001
task_name: StatusBadge の色/ラベルマッピングに review/improve_ready/reuse_ready を追加
category: 仕様書更新
priority: 中
scale: 小規模
status: 未実施
source_phase: UT-LIFECYCLE-EXECUTION-STATUS-TYPE-SPEC-SYNC-001 Phase 12
created_date: 2026-03-20
spec_path: docs/30-workflows/unassigned-task/UT-STATUSBADGE-MAPPING-3VALUES-001.md
```

## 概要

SkillExecutionStatus に review / improve_ready / reuse_ready が追加されたことで、DisplayableStatus に新3値が自動的に含まれる。StatusBadge コンポーネントの色/ラベルマッピング仕様に新値の定義が必要。

## 受入基準

- [ ] StatusBadge のマッピングテーブルに3値の色/ラベルが定義されている
- [ ] テーブル内容が Apple HIG カラーパレットに準拠している
