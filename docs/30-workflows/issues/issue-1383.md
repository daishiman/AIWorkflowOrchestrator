# [#1383] [UT-IMP-INTERMEDIATE-COMPONENT-PROPS-DESIGN-GUIDE-001] 中間コンポーネント Props 経路設計ガイドライン追加

## メタ情報

```yaml
issue_number: 1383
title: [UT-IMP-INTERMEDIATE-COMPONENT-PROPS-DESIGN-GUIDE-001] 中間コンポーネント Props 経路設計ガイドライン追加
state: OPEN
priority: 中
scale: 小規模
category: -
status: 未実施
created_date: 2026-03-19
updated_date: 2026-03-19
url: https://github.com/daishiman/AIWorkflowOrchestrator/issues/1383
dependencies: []
```

| 項目       | 内容   |
| ---------- | ------ |
| 優先度     | 中     |
| 規模       | 小規模 |
| ステータス | 未実施 |

---

## 概要

Phase 2 Props 設計テンプレートに「callback 引数のデータフロー追跡」チェック項目を追加し、中間コンポーネント Props 経路パターンを architecture-implementation-patterns に記録する。

## 背景

TASK-IMP-SKILLDETAIL-ACTION-BUTTONS-001 で SkillDetailPanelProps の拡張は設計したが、内部 PanelContentProps への `skillName` 追加が漏れ、Phase 5 で手戻りが発生。callback が親 state を参照する場合の中間コンポーネント Props 経路設計が明文化されていなかった。

## 対象ファイル

- `.claude/skills/task-specification-creator/references/phase-templates.md`
- `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns*.md`

## 受入基準

- [ ] Phase 2 テンプレートに「callback 引数のデータフロー追跡」チェック項目が含まれている
- [ ] 中間コンポーネント Props 経路パターン（データフロー図）がドキュメントに記載されている
- [ ] null ガード後の型ナロイングを活用した Props 設計の推奨パターンが記載されている

## 仕様書

`docs/30-workflows/unassigned-task/task-imp-intermediate-component-props-design-guide-001.md`
