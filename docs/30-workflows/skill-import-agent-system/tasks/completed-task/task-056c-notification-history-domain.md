---
id: TASK-UI-01-C-NOTIFICATION-HISTORY-DOMAIN
tier: 3
title: Notification/HistorySearchドメイン統合仕様
phase: 6
depends_on:
  [TASK-UI-01-A-STORE-SLICE-BASELINE, TASK-UI-01-B-IPC-CONTRACT-SECURITY]
parallel_with: [TASK-UI-01-D-VIEWTYPE-ROUTING-NAV]
blocks: [TASK-UI-01-E-INTEGRATION-GATE-SPEC-SYNC]
status: spec_created
priority: high
estimated_complexity: large
tags: [frontend, backend, domain, notification, history]

execution:
  mode: sequential
  timeout_minutes: 70
  retry_count: 1
  allow_partial: false

verification:
  auto_verify: true
  require_tests: true
  require_typecheck: true

artifacts:
  creates:
    - docs/30-workflows/completed-tasks/task-056c-notification-history-domain/index.md
    - docs/30-workflows/completed-tasks/task-056c-notification-history-domain/phase-1-requirements.md
    - docs/30-workflows/completed-tasks/task-056c-notification-history-domain/phase-13-pr-creation.md
  modifies:
    - apps/desktop/src/renderer/store/slices/notificationSlice.ts
    - apps/desktop/src/renderer/store/slices/historySearchSlice.ts
    - apps/desktop/src/main/ipc/notificationHandlers.ts
    - apps/desktop/src/main/ipc/historySearchHandlers.ts
---

# TASK-UI-01-C: Notification/HistorySearchドメイン統合仕様

## 仕様書ディレクトリ（task-specification-creator準拠）

以下のディレクトリに、`index.md` + `phase-1` 〜 `phase-13` のタスク仕様書を作成済み。

- `docs/30-workflows/completed-tasks/task-056c-notification-history-domain/`
- `index.md`（全体仕様）
- `phase-1-requirements.md` 〜 `phase-13-pr-creation.md`
- `artifacts.json`（初期化済み）

本ファイルは親タスクから参照されるエントリ仕様として維持し、実行時の正本は上記ディレクトリ配下を参照する。

## 概要

Store仕様（A）とIPC仕様（B）を入力に、通知ドメインと履歴検索ドメインの境界を統合設計する。後続タスク（UI-06/UI-08）が契約を再利用できるよう、型・イベント・永続化ポリシーを確定する。

## 入力

- `task-056a-a-store-slice-baseline.md` の成果物
- `task-056a-b-ipc-contract-security.md` の成果物
- `task-058c-ui-06-history-search-view.md`
- `task-058e-ui-08-notification-center.md`

## 出力

- `task-056c-notification-history-domain/index.md`: メインタスク仕様書
- `task-056c-notification-history-domain/phase-1-requirements.md` 〜 `phase-13-pr-creation.md`: 13Phase仕様書
- `task-056c-notification-history-domain/outputs/phase-2/aiworkflow-requirements-extract.md`: 正本仕様抽出レポート
- `task-056c-notification-history-domain/outputs/phase-2/implementation-spec-traceability-matrix.md`: 実装ファイル×正本仕様トレース
- `task-056c-notification-history-domain/outputs/skill-compliance-audit.md`: 2skill準拠監査レポート

## システム仕様（aiworkflow-requirements）

| 参照資料             | パス                                                                         | 反映ポイント                       |
| -------------------- | ---------------------------------------------------------------------------- | ---------------------------------- |
| 状態管理パターン     | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md` | Slice構造、derived state扱い       |
| システムIPC仕様      | `.claude/skills/aiworkflow-requirements/references/api-ipc-system.md`        | notification/history チャネル定義  |
| IPCセキュリティ      | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md` | Pushイベント・listener登録の安全性 |
| ナビゲーションUI設計 | `.claude/skills/aiworkflow-requirements/references/ui-ux-navigation.md`      | View遷移時の通知・履歴導線         |
| アーキテクチャ総論   | `.claude/skills/aiworkflow-requirements/references/architecture-overview.md` | Layer境界、依存方向                |

## 実行手順

### Step 1: Notificationドメイン仕様

- 通知データモデル（type/source/read状態）を確定する。
- `NOTIFICATION_NEW` 受信時のStore更新ルールを定義する。
- `unreadCount` の更新タイミングを固定する。

### Step 2: HistorySearchドメイン仕様

- 検索クエリ、フィルタ、結果、統計の型境界を定義する。
- `history:search` / `history:get-stats` の戻り値契約を確定する。

### Step 3: 永続化・容量制限

- 通知保持件数（上限）と削除ポリシーを明文化する。
- 起動時復元と既読同期フローを時系列で定義する。

## 検証条件

- [ ] NotificationとHistorySearchの責務境界が重複なく定義済み
- [ ] 2ドメインのIPC契約が型付きで定義済み
- [ ] 通知上限超過時の削除ポリシーが定義済み
- [ ] Listener登録/解除フローが明文化済み
- [ ] UI-06/UI-08で再利用できる参照リンクが付与済み

## リスクと対策

| リスク             | 対策                                |
| ------------------ | ----------------------------------- |
| ドメイン責務の混線 | Notification/Historyを別Sliceで固定 |
| listenerリーク     | `safeOn` + cleanupパターンを仕様化  |
| 永続化の肥大化     | 件数上限 + 既読優先削除を定義       |
