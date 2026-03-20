# [#1305] [UT-TASK06-005] testing-component-patterns-advanced.md デッドリンク修正

## メタ情報

```yaml
issue_number: 1305
title: [UT-TASK06-005] testing-component-patterns-advanced.md デッドリンク修正
state: OPEN
priority: 低
scale: 小規模
category: -
status: 未実施
created_date: 2026-03-17
updated_date: 2026-03-17
url: https://github.com/daishiman/AIWorkflowOrchestrator/issues/1305
dependencies: []
```

| 項目       | 内容   |
| ---------- | ------ |
| 優先度     | 低     |
| 規模       | 小規模 |
| ステータス | 未実施 |

---

## 概要

`validate-structure.js` 実行により、`testing-component-patterns-advanced.md` の L102 が `ui-ux-atoms-specs.md` を参照しているが、該当ファイルが `references/` ディレクトリに存在しないデッドリンクを検出。

## タスクID

UT-TASK06-005

## 分類

ドキュメント修正

## 発見元

TASK-IMP-MAIN-CHAT-SETTINGS-AI-RUNTIME-001 Phase 12 validate-structure.js 実行

## 目的

- `testing-component-patterns-advanced.md` L102 のデッドリンクを解消
- `validate-structure.js` のエラー報告をクリーンにする

## 仕様書

`docs/30-workflows/completed-tasks/UT-TASK06-005-dead-link-atoms-specs.md`
