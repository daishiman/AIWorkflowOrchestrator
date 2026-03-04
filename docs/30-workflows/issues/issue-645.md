# [#645] [task-architecture-improvements] login-only-auth アーキテクチャ改善

## メタ情報

```yaml
issue_number: 645
title: [task-architecture-improvements] login-only-auth アーキテクチャ改善
state: CLOSED
priority: 低
scale: 小規模
category: リファクタリング
status: 未実施
created_date: 2026-02-01
updated_date: 2026-02-01
url: https://github.com/daishiman/AIWorkflowOrchestrator/issues/645
dependencies: []
```

| 項目       | 内容   |
| ---------- | ------ |
| 優先度     | 低     |
| 規模       | 小規模 |
| ステータス | 未実施 |

---

## タスク仕様書

- **ファイル**: `docs/30-workflows/unassigned-task/task-architecture-improvements.md`
- **対象機能**: 認証画面（AuthView/AuthGuard/AccountSection）のアーキテクチャ最適化
- **優先度**: 低
- **規模**: 小規模
- **ステータス**: 未実施

## 概要

Phase 5.5 Final Review Gateにおけるアーキテクチャレビューで指摘された改善:

- LoadingScreenの配置検討（atoms/への移動候補）
- アニメーション定義の抽出
- コンポーネント責務の明確化
