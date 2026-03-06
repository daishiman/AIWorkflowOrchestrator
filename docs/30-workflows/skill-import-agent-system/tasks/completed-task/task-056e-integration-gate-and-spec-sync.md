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
status: spec_created
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
    - docs/30-workflows/skill-import-agent-system/tasks/task-00-unified-implementation-sequence/task-056-ui-01-store-ipc-architecture/index.md
    - docs/30-workflows/completed-tasks/task-056e-integration-gate-and-spec-sync/index.md
    - docs/30-workflows/completed-tasks/task-056e-integration-gate-and-spec-sync/phase-1-requirements.md
    - docs/30-workflows/completed-tasks/task-056e-integration-gate-and-spec-sync/phase-2-design.md
    - docs/30-workflows/completed-tasks/task-056e-integration-gate-and-spec-sync/phase-3-design-review.md
    - docs/30-workflows/completed-tasks/task-056e-integration-gate-and-spec-sync/phase-4-test-creation.md
    - docs/30-workflows/completed-tasks/task-056e-integration-gate-and-spec-sync/phase-5-implementation.md
    - docs/30-workflows/completed-tasks/task-056e-integration-gate-and-spec-sync/phase-6-test-expansion.md
    - docs/30-workflows/completed-tasks/task-056e-integration-gate-and-spec-sync/phase-7-coverage-check.md
    - docs/30-workflows/completed-tasks/task-056e-integration-gate-and-spec-sync/phase-8-refactoring.md
    - docs/30-workflows/completed-tasks/task-056e-integration-gate-and-spec-sync/phase-9-quality-assurance.md
    - docs/30-workflows/completed-tasks/task-056e-integration-gate-and-spec-sync/phase-10-final-review.md
    - docs/30-workflows/completed-tasks/task-056e-integration-gate-and-spec-sync/phase-11-manual-test.md
    - docs/30-workflows/completed-tasks/task-056e-integration-gate-and-spec-sync/phase-12-documentation.md
    - docs/30-workflows/completed-tasks/task-056e-integration-gate-and-spec-sync/phase-13-pr-creation.md
    - docs/30-workflows/completed-tasks/task-056e-integration-gate-and-spec-sync/artifacts.json
    - docs/30-workflows/completed-tasks/task-056e-integration-gate-and-spec-sync/outputs/verification-report.md
    - docs/30-workflows/completed-tasks/task-056e-integration-gate-and-spec-sync/outputs/elegant-solution-review.md
  modifies:
    - docs/30-workflows/skill-import-agent-system/tasks/task-00-unified-implementation-sequence/task-056-ui-01-store-ipc-architecture.md
    - docs/30-workflows/skill-import-agent-system/tasks/task-00-unified-implementation-sequence/task-0560-index.md
---

# TASK-UI-01-E: 統合レビューゲートとシステム仕様同期要件

## 仕様書ディレクトリ（task-specification-creator準拠）

以下のディレクトリに、`index.md` と `phase-1` から `phase-13` の実行仕様書を作成済み。

- `docs/30-workflows/skill-import-agent-system/tasks/task-00-unified-implementation-sequence/task-056-ui-01-store-ipc-architecture/`
- `docs/30-workflows/completed-tasks/task-056e-integration-gate-and-spec-sync/`
- `index.md`
- `phase-1-requirements.md` から `phase-13-pr-creation.md`
- `artifacts.json`

本ファイルは親タスクから参照されるエントリ仕様として維持し、実行時の正本は上記ディレクトリ配下を参照する。

## 概要

A〜Dで確定した仕様を統合し、後続タスクが参照できる完了判定を定義する。あわせて `aiworkflow-requirements` 正本仕様へ反映すべき更新候補を整理し、仕様ドリフトを防止する。

## 入力

- `docs/30-workflows/completed-tasks/task-056a-a-store-slice-baseline/index.md` の成果物
- `docs/30-workflows/skill-import-agent-system/tasks/completed-task/task-056a-b-ipc-contract-security.md` の成果物
- `docs/30-workflows/completed-tasks/task-056c-notification-history-domain/index.md` の成果物
- `docs/30-workflows/completed-tasks/task-056d-viewtype-routing-nav/index.md` の成果物

## 出力

- `task-056-ui-01-store-ipc-architecture/index.md`: 056系SubAgentの正本導線
- `docs/30-workflows/completed-tasks/task-056e-integration-gate-and-spec-sync/index.md`: 実行正本インデックス
- `docs/30-workflows/completed-tasks/task-056e-integration-gate-and-spec-sync/phase-1-requirements.md` 〜 `phase-13-pr-creation.md`: 13Phase仕様書
- `docs/30-workflows/completed-tasks/task-056e-integration-gate-and-spec-sync/artifacts.json`: Phase依存と状態定義
- `docs/30-workflows/completed-tasks/task-056e-integration-gate-and-spec-sync/outputs/verification-report.md`: 機械検証と補強内容
- `docs/30-workflows/completed-tasks/task-056e-integration-gate-and-spec-sync/outputs/elegant-solution-review.md`: 破棄判断と抽出完全性監査

## 仕様書作成ステータス

- [x] ブランチ作成完了（`task/task-ui-01-e-integration-gate-spec-sync-spec`）
- [x] `task-056-ui-01-store-ipc-architecture/` ディレクトリ作成
- [x] `task-056e-integration-gate-and-spec-sync/` ディレクトリ作成
- [x] Phase 1〜13仕様書を作成
- [x] aiworkflow-requirements 正本参照を各Phaseへ反映
- [x] 実装、コミット、PRは未実施

## 破棄判断とエレガント化方針

| 判断対象                  | 結論   | 理由                                                                                                                                                                          |
| ------------------------- | ------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 現行13Phase構造の全面破棄 | 不採用 | 生成済み構造と親導線は妥当で、検証スクリプトとも整合していたため                                                                                                              |
| 不足前提の破棄            | 採用   | `validator pass` だけでは skill 完全準拠を保証しないため、参照仕様・Phase 12・監査成果物の前提を再設計した                                                                    |
| aiworkflow 参照の拡張     | 採用   | A/B/C/D の抽出結果の和集合で `architecture-implementation-patterns`、`security-api-electron`、`error-handling`、`ui-history-*`、`interfaces-agent-sdk-*` まで点検対象を広げた |

## Atent Team（SubAgent）分割

| SubAgent | 関心ごと                   | 成果物                                       |
| -------- | -------------------------- | -------------------------------------------- |
| E1       | 統合ゲート判定軸の設計     | `outputs/phase-2/integration-gate-design.md` |
| E2       | aiworkflow反映台帳の設計   | `outputs/phase-5/spec-sync-targets.md`       |
| E3       | 下流タスクへの引き渡し監査 | `outputs/phase-2/dependency-handoff-plan.md` |
| E4       | 全Phase横断の矛盾検査      | `outputs/phase-10/final-review-result.md`    |

## システム仕様（aiworkflow-requirements）

| 参照資料                 | パス                                                                                        | 反映ポイント                      |
| ------------------------ | ------------------------------------------------------------------------------------------- | --------------------------------- |
| アーキテクチャ総論       | `.claude/skills/aiworkflow-requirements/references/architecture-overview.md`                | 状態管理/IPC更新影響判定          |
| 実装パターン             | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | safeInvoke / safeOn 再利用判定    |
| 状態管理パターン         | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`                | Slice追加・統合更新判定           |
| APIインデックス          | `.claude/skills/aiworkflow-requirements/references/api-endpoints.md`                        | IPC一覧更新候補判定               |
| IPC仕様                  | `.claude/skills/aiworkflow-requirements/references/api-ipc-system.md`                       | notification / history の更新判定 |
| Preloadセキュリティ      | `.claude/skills/aiworkflow-requirements/references/security-api-electron.md`                | contextBridge / whitelist 判定    |
| IPCセキュリティ          | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`                | sender検証/validation反映判定     |
| エラーハンドリング       | `.claude/skills/aiworkflow-requirements/references/error-handling.md`                       | FAIL理由と戻り値契約の判定        |
| 履歴データ型             | `.claude/skills/aiworkflow-requirements/references/ui-history-data-types.md`                | history DTO 更新判定              |
| 履歴統合                 | `.claude/skills/aiworkflow-requirements/references/ui-history-integration.md`               | history導線更新判定               |
| ナビゲーションUI設計     | `.claude/skills/aiworkflow-requirements/references/ui-ux-navigation.md`                     | ViewType / AppDock 更新判定       |
| UIインターフェース       | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-ui.md`              | 下流UI契約更新判定                |
| Skill UIインターフェース | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md`           | SkillCenter導線更新判定           |
| 品質要件                 | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`                 | ゲート品質 / テスト閾値判定       |
| タスク台帳               | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`                        | spec_created と下流解放記録       |
| 教訓集                   | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`                      | 再発防止策の反映先                |
| 仕様更新ワークフロー     | `.claude/skills/task-specification-creator/references/spec-update-workflow.md`              | Step 1-A/1-B/1-C/2適用            |

## 実行手順

### Step 1: 入力正本の固定

- A/B/C/D の正本パス、更新日、参照優先順位を固定する。
- completed-tasks と current path の混在を正規化する。

### Step 2: 統合レビューゲートと同期台帳の設計

- 判定軸を `state / ipc / security / navigation / documentation` で分類する。
- aiworkflow 反映対象を常時更新、条件付き更新、更新不要で分類する。

### Step 3: 後続タスク向け引き渡し仕様書の生成

- `TASK-UI-02`、`TASK-UI-03`、`TASK-UI-04A` が参照する正本リンクを固定する。
- Phase 1〜13 の実行仕様へブロッカー解除条件と証跡要件を落とし込む。

## 検証条件

- [ ] A/B/C/D の入力正本が固定済み
- [ ] 13Phase仕様書が作成済み
- [ ] ゲート判定基準が検証可能な形式で定義済み
- [ ] aiworkflow 正本への更新対象が一覧化済み
- [ ] 後続タスクの参照リンクが欠落なく記載済み

## リスクと対策

| リスク               | 対策                                  |
| -------------------- | ------------------------------------- |
| 仕様間の重複/矛盾    | 判定軸と同期台帳を単一正本で管理      |
| 仕様更新漏れ         | Step 1-B/1-C/2 の区分を固定化         |
| 後続タスクの参照迷子 | 056統合インデックスへ正本リンクを集約 |
