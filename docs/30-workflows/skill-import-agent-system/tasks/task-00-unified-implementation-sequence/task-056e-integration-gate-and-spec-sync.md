---
id: TASK-UI-01-E-INTEGRATION-GATE-SPEC-SYNC
tier: 3
title: 統合レビューゲートとシステム仕様同期要件
phase: 6
depends_on:
  [TASK-UI-01-C-NOTIFICATION-HISTORY-DOMAIN, TASK-UI-01-D-VIEWTYPE-ROUTING-NAV]
parallel_with: []
blocks:
  [
    TASK-UI-02-GLOBAL-NAV-CORE,
    TASK-UI-03-AGENT-VIEW-ENHANCEMENT,
    TASK-UI-04A-WORKSPACE-LAYOUT,
  ]
status: pending
priority: critical
estimated_complexity: medium
tags: [integration, quality-gate, documentation, spec-sync]

execution:
  mode: sequential
  timeout_minutes: 45
  retry_count: 1
  allow_partial: false

verification:
  auto_verify: true
  require_tests: false
  require_typecheck: false

artifacts:
  creates:
    - docs/30-workflows/skill-import-agent-system/tasks/task-00-unified-implementation-sequence/task-056-ui-01-store-ipc-architecture/outputs/task-056e-review-gate.md
    - docs/30-workflows/skill-import-agent-system/tasks/task-00-unified-implementation-sequence/task-056-ui-01-store-ipc-architecture/outputs/task-056e-spec-sync-targets.md
  modifies:
    - docs/30-workflows/skill-import-agent-system/tasks/task-00-unified-implementation-sequence/task-056-ui-01-store-ipc-architecture.md
---

# TASK-UI-01-E: 統合レビューゲートとシステム仕様同期要件

## 概要

A〜Dで確定した仕様を統合し、後続タスクが参照できる完了判定を定義する。あわせて `aiworkflow-requirements` 正本仕様へ反映すべき更新候補を整理し、仕様ドリフトを防止する。

## 入力

- `task-056a-a-store-slice-baseline.md` の成果物
- `task-056a-b-ipc-contract-security.md` の成果物
- `task-056c-notification-history-domain.md` の成果物
- `task-056d-viewtype-routing-nav/index.md` の成果物

## 出力

- `outputs/task-056e-review-gate.md`: PASS/MINOR/MAJOR判定基準
- `outputs/task-056e-spec-sync-targets.md`: aiworkflow反映対象一覧
- 親仕様書への統合追記（SubAgent分割計画・参照資料・完了条件）

## システム仕様（aiworkflow-requirements）

| 参照資料             | パス                                                                           | 反映ポイント                  |
| -------------------- | ------------------------------------------------------------------------------ | ----------------------------- |
| 仕様更新ワークフロー | `.claude/skills/task-specification-creator/references/spec-update-workflow.md` | Step 1-A/1-B/1-C適用          |
| アーキテクチャ総論   | `.claude/skills/aiworkflow-requirements/references/architecture-overview.md`   | 状態管理/IPC更新影響判定      |
| APIインデックス      | `.claude/skills/aiworkflow-requirements/references/api-endpoints.md`           | IPC一覧更新候補判定           |
| IPCセキュリティ      | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`   | sender検証/validation反映判定 |
| 状態管理パターン     | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`   | Slice追加・統合更新判定       |

## 実行手順

### Step 1: 統合レビューゲート定義

- A〜Dの成果物差分を照合し、矛盾項目を抽出する。
- 判定基準を PASS / MINOR / MAJOR に分類する。

### Step 2: 仕様同期対象の抽出

- 変更タイプを `state / ipc / security / navigation` で分類する。
- `aiworkflow-requirements` の更新要否を Step 1-B基準で判定する。

### Step 3: 後続タスク向け引き渡し

- `TASK-UI-02` 以降が参照すべき正本リンクを確定する。
- ブロッカー解除条件をチェックリスト化する。

## 検証条件

- [ ] A〜Dの仕様差分が統合済み
- [ ] ゲート判定基準が検証可能な形式で定義済み
- [ ] aiworkflow正本への更新対象が一覧化済み
- [ ] 後続タスクの参照リンクが欠落なく記載済み

## リスクと対策

| リスク               | 対策                         |
| -------------------- | ---------------------------- |
| 仕様間の重複/矛盾    | 統合表を単一ファイルで管理   |
| 仕様更新漏れ         | Step 1-B/1-Cチェックを固定化 |
| 後続タスクの参照迷子 | 正本リンクを親仕様に集約     |
