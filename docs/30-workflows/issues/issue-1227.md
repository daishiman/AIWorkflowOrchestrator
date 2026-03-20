# [#1227] [TASK-IMP-CHAT-EDIT-SCREENSHOT-AUTOMATION-001] Phase 11 Chat Edit 画面証跡の Electron capture 基盤整備

## メタ情報

```yaml
issue_number: 1227
title: [TASK-IMP-CHAT-EDIT-SCREENSHOT-AUTOMATION-001] Phase 11 Chat Edit 画面証跡の Electron capture 基盤整備
state: OPEN
priority: 低
scale: 中規模
category: 改善
status: 未実施
created_date: 2026-03-14
updated_date: 2026-03-14
url: https://github.com/daishiman/AIWorkflowOrchestrator/issues/1227
dependencies: []
```

| 項目       | 内容   |
| ---------- | ------ |
| 優先度     | 低     |
| 規模       | 中規模 |
| ステータス | 未実施 |

---

## 概要

現状は Playwright harness で5状態の capture を実施できるが、Electron 実ウィンドウ経由の capture 基盤は未整備。Phase 11 の画面証跡を Electron 実体でも安定自動取得できる状態にし、harness 依存を減らす。

## 対象

- 既存 `capture-task-ai-runtime-chat-edit-phase11.mjs` を基点に、Electron capture（`webContents.capturePage()`）系スクリプトを追加
- CI 実行手順（headless/xvfb）を文書化

## 完了条件

- [ ] Electron 実体で TC-11-01〜05 を自動取得できる
- [ ] screenshot-plan と metadata 形式が既存と互換である
- [ ] 失敗時ログで原因（起動/遷移/保存）が判別できる

## 発見元

TASK-IMP-WORKSPACE-CHAT-EDIT-AI-RUNTIME-001 Phase 12 (2026-03-14)

## 仕様書パス

`docs/30-workflows/completed-tasks/step-02-par-task-02-workspace-chat-edit-runtime-activation/unassigned-task/task-imp-chat-edit-screenshot-automation-001.md`
