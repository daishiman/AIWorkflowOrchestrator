# [#1306] [UT-TASK06-006] Phase 3 MINOR→未タスク自動追跡フロー整備

## メタ情報

```yaml
issue_number: 1306
title: [UT-TASK06-006] Phase 3 MINOR→未タスク自動追跡フロー整備
state: OPEN
priority: 中
scale: 中規模
category: -
status: 未実施
created_date: 2026-03-17
updated_date: 2026-03-17
url: https://github.com/daishiman/AIWorkflowOrchestrator/issues/1306
dependencies: []
```

| 項目       | 内容   |
| ---------- | ------ |
| 優先度     | 中     |
| 規模       | 中規模 |
| ステータス | 未実施 |

---

## 概要

Phase 3 で指摘した MINOR-01〜03 が Phase 12 まで正式な追跡パスなしで放置され、Phase 10 最終レビューで同じ内容が再度 MINOR 指摘として登場した。Phase 3 MINOR → Phase 12 未タスク検出の追跡が手動依存で断絶しやすい。

## タスクID

UT-TASK06-006

## 分類

ワークフロー改善

## 発見元

TASK-IMP-MAIN-CHAT-SETTINGS-AI-RUNTIME-001 Phase 12 skill-feedback-report T-01

## 目的

- Phase 3 設計レビューテンプレートに MINOR 即時登録セクションを追加
- `artifacts.json` に MINOR 候補フィールドを追加
- Phase 12 未タスク検出 Task 4 に「Phase 3 MINOR 3ステップ確認」を必須化

## 苦戦箇所

- TDD Red→Green での既存テスト回帰見落とし（GAP-02 status変更時）
- Phase 3 MINOR の Phase 10 再発見パターン

## 仕様書

`docs/30-workflows/completed-tasks/UT-TASK06-006-minor-tracking-automation.md`
