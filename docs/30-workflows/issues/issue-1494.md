# [#1494] [UT-SC-03-001] IResourceLoader インターフェース抽出

## メタ情報

```yaml
issue_number: 1494
title: [UT-SC-03-001] IResourceLoader インターフェース抽出
state: OPEN
priority: 中
scale: -
category: リファクタリング
status: 未実施
created_date: 2026-03-23
updated_date: 2026-03-23
url: https://github.com/daishiman/AIWorkflowOrchestrator/issues/1494
dependencies: []
```

| 項目       | 内容   |
| ---------- | ------ |
| 優先度     | 中     |
| 規模       | -      |
| ステータス | 未実施 |

---

## 概要

RuntimeSkillCreatorFacade の依存 `ResourceLoader` を具象クラスから `IResourceLoader` インターフェースに変更し、DIP 準拠・テスタビリティ向上を図る。

## 背景

- TASK-SC-03 Phase 3 レビュー MINOR #1 で指摘
- テストで `as never` キャストが必要（P19 軽度パターン）

## 関連タスク

- TASK-SC-03-PLAN-LLM-PROMPT（親タスク）
- 指示書: `docs/30-workflows/unassigned-task/UT-SC-03-001.md`

## ラベル

priority:medium, status:unassigned, type:refactoring
