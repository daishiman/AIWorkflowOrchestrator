# [#1951] [UT-CHILD-COMPANION-LABELING-001] task-workflow-completed-\*.md 全件への `> 区分: 履歴記録` ラベル追記

## メタ情報

```yaml
issue_number: 1951
title: [UT-CHILD-COMPANION-LABELING-001] task-workflow-completed-*.md 全件への `> 区分: 履歴記録` ラベル追記
state: OPEN
priority: 低
scale: 小規模
category: 改善
status: 未実施
created_date: 2026-04-06
updated_date: 2026-04-06
url: https://github.com/daishiman/AIWorkflowOrchestrator/issues/1951
dependencies: []
```

| 項目       | 内容   |
| ---------- | ------ |
| 優先度     | 低     |
| 規模       | 小規模 |
| ステータス | 未実施 |

---

## 概要

`task-workflow-completed-*.md` の child companion ファイル（13件）の冒頭に `> 区分: 履歴記録（history record）` を追記し、インデックスなしで各ファイルを開いた際も正本/履歴を即判別できるようにする。

## 背景・目的

UT-VERIFY-DOC-CONSOLIDATION-001 にて `task-workflow.md` インデックスに「区分」列を追加し、`task-workflow-completed.md`（baseline）に `> 区分: 履歴記録` を付与済み。しかし派生 child companion 13件には未追記のため、インデックス経由でのみ区分が判別可能な状態が残っている。

## 対象ファイル（13件）

- `task-workflow-completed-workspace-chat-lifecycle-tests.md`
- `task-workflow-completed-ipc-graceful-degradation-lifecycle.md`
- `task-workflow-completed-notification-history-auth-key-state.md`
- `task-workflow-completed-skill-import-skill-center-nav.md`
- `task-workflow-completed-advanced-views-analytics-audit.md`
- `task-workflow-completed-debug-scheduler-doc-generation-theme.md`
- `task-workflow-completed-ipc-contract-preload-alignment.md`
- `task-workflow-completed-quality-gates-module-resolution-logging.md`
- `task-workflow-completed-abort-contract-auth-session-chat.md`
- `task-workflow-completed-skill-lifecycle-agent-view-line-budget.md`
- `task-workflow-completed-skill-lifecycle.md`
- `task-workflow-completed-skill-create-ui-integration.md`
- `task-workflow-completed-ui-ux-visual-baseline-drift.md`

すべて `.claude/skills/aiworkflow-requirements/references/` 配下。

## 実装ガイド（Phase 12 相当）

### 実装手順

1. `task-workflow-completed.md`（baseline）の `> 区分:` 形式を確認（テンプレート）
2. 13ファイルを SubAgent で並列処理
3. 各ファイルの H1 タイトル直後に以下を追記:
   ```
   > 区分: 履歴記録（history record）
   ```
4. baseline との表記統一を確認

### 完了条件

- [ ] 全 13 ファイルの冒頭 5 行以内に `> 区分: 履歴記録（history record）` が含まれている
- [ ] baseline（`task-workflow-completed.md`）との表記が統一されている
- [ ] `task-workflow.md` インデックスの「区分: 履歴」列と整合している

## 苦戦箇所（予測）

- 13ファイルと数が多いため SubAgent 並列化を推奨
- 各ファイルの冒頭構造が統一されていない可能性（`> 役割:` の有無）に注意

## 参照

- タスク仕様書: `docs/30-workflows/unassigned-task/UT-CHILD-COMPANION-LABELING-001.md`
- 発見元: UT-VERIFY-DOC-CONSOLIDATION-001 Phase 12 skill-feedback-report 改善提案#1
- 関連 Issue: #1916（UT-VERIFY-DOC-CONSOLIDATION-001）
