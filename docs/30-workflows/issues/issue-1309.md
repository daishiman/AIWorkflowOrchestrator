# [#1309] [UT-TASK06-007] IPC 契約ドリフト自動検出スクリプト（Phase 9 統合）

## メタ情報

```yaml
issue_number: 1309
title: [UT-TASK06-007] IPC 契約ドリフト自動検出スクリプト（Phase 9 統合）
state: CLOSED
priority: 高
scale: 中規模
category: -
status: 未実施
created_date: 2026-03-17
updated_date: 2026-03-18
url: https://github.com/daishiman/AIWorkflowOrchestrator/issues/1309
dependencies: []
```

| 項目       | 内容   |
| ---------- | ------ |
| 優先度     | 高     |
| 規模       | 中規模 |
| ステータス | 未実施 |

---

## 概要

TASK-IMP-MAIN-CHAT-SETTINGS-AI-RUNTIME-001 で発見された GAP/DRIFT の多くが IPC 契約のドリフト（P44/P45 パターン）に起因。Main Process ハンドラの引数型と Preload API の呼び出しパターンの不整合がランタイムまで検出されない。

## タスクID

UT-TASK06-007

## 分類

品質改善・自動化

## 発見元

TASK-IMP-MAIN-CHAT-SETTINGS-AI-RUNTIME-001 Phase 12 skill-feedback-report T-02

## 目的

- Phase 9 品質検証に組み込む IPC 契約ドリフト自動検出スクリプトを実装
- P44/P45/P60 パターンの再発を防止
- Main handler 引数型 vs Preload API 呼び出しパターンの整合チェック

## 苦戦箇所

- P57（設計タスクでの仕様書更新先送り）再発
- worktree 環境でのパスエイリアス不整合
- AI_CHECK_CONNECTION の二重記述問題

## 仕様書

`docs/30-workflows/completed-tasks/UT-TASK06-007-ipc-contract-drift-auto-detect.md`
