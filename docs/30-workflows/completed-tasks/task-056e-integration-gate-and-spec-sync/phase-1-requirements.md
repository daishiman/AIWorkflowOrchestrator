# Phase 1: 要件定義

## メタ情報

| 項目         | 内容                                     |
| ------------ | ---------------------------------------- |
| Phase        | 1                                        |
| Phase名      | 要件定義                                 |
| 前提Phase    | なし                                     |
| 後続Phase    | Phase 2                                  |
| ステータス   | completed                                |
| 作成日       | 2026-03-06                               |
| 機能名       | task-056e-integration-gate-and-spec-sync |
| 担当SubAgent | SubAgent-E1                              |

## 目的

統合レビューゲートの判定対象、仕様同期の対象範囲、後続UIタスクへの引き渡し条件を検証可能な要件として固定する。

## 実行タスク

- 要件抽出: A/B/C/D の成果物から統合判定に必要な入力項目を抽出する。
- 受け入れ基準定義: PASS / MINOR / MAJOR の判定条件を数値と有無で定義する。
- スコープ定義: Eが決定する事項と、C/Dまたは後続UIタスクへ委譲する事項を切り分ける。

## 参照資料

| 参照資料                        | パス                                                                                                                                       | 内容                                |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------- |
| 親エントリ仕様                  | `docs/30-workflows/completed-tasks/task-056e-integration-gate-and-spec-sync/index.md`                                                      | タスク目的と依存関係                |
| 親統合タスク                    | `docs/30-workflows/skill-import-agent-system/tasks/task-00-unified-implementation-sequence/task-056-ui-01-store-ipc-architecture.md`       | 親タスクの責務とブロック対象        |
| 056統合インデックス             | `docs/30-workflows/skill-import-agent-system/tasks/task-00-unified-implementation-sequence/task-056-ui-01-store-ipc-architecture/index.md` | 正本導線                            |
| A正本                           | `docs/30-workflows/completed-tasks/task-056a-a-store-slice-baseline/index.md`                                                              | Store境界の正本                     |
| B正本                           | `docs/30-workflows/skill-import-agent-system/tasks/completed-task/task-056a-b-ipc-contract-security.md`                                    | IPC契約とセキュリティの正本         |
| C正本                           | `docs/30-workflows/completed-tasks/task-056c-notification-history-domain/index.md`                                                         | Notification / HistorySearch の正本 |
| D正本                           | `docs/30-workflows/completed-tasks/task-056d-viewtype-routing-nav/index.md`                                                                | ViewType / ナビ整合の正本           |
| aiworkflow リソースマップ       | `.claude/skills/aiworkflow-requirements/indexes/resource-map.md`                                                                           | 必要仕様の初期選定                  |
| aiworkflow クイックリファレンス | `.claude/skills/aiworkflow-requirements/indexes/quick-reference.md`                                                                        | IPC / state / 品質の早見表          |
| aiworkflow トピックマップ       | `.claude/skills/aiworkflow-requirements/indexes/topic-map.md`                                                                              | 該当セクションの行位置確認          |

## システム仕様（aiworkflow-requirements）

| 参照資料            | パス                                                                                        | 内容                              |
| ------------------- | ------------------------------------------------------------------------------------------- | --------------------------------- |
| アーキテクチャ総論  | `.claude/skills/aiworkflow-requirements/references/architecture-overview.md`                | 関心分離とレイヤ責務              |
| 実装パターン        | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | safeInvoke / safeOn と契約境界    |
| 状態管理パターン    | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`                | state責務の判定基準               |
| IPC仕様             | `.claude/skills/aiworkflow-requirements/references/api-ipc-system.md`                       | IPC同期対象の判定基準             |
| Preloadセキュリティ | `.claude/skills/aiworkflow-requirements/references/security-api-electron.md`                | contextBridge 公開境界            |
| IPCセキュリティ     | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`                | sender検証と検証順序              |
| エラーハンドリング  | `.claude/skills/aiworkflow-requirements/references/error-handling.md`                       | 判定失敗時の戻り値と理由形式      |
| 履歴統合            | `.claude/skills/aiworkflow-requirements/references/ui-history-integration.md`               | notification / history の統合観点 |
| ナビゲーションUI    | `.claude/skills/aiworkflow-requirements/references/ui-ux-navigation.md`                     | nav引き渡し基準                   |
| 品質要件            | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`                 | 受け入れ基準の定量化              |
| タスク台帳          | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`                        | spec_created の反映先             |

## 実行手順

### ステップ1: 入力正本の固定

`resource-map.md` と `quick-reference.md` を起点に必要仕様を選定し、`topic-map.md` で対象セクションを特定してから A/B/C/D の正本を固定する。

### ステップ2: 入力正本の確定

A/B/C/D の正本パス、更新日、参照優先順位を表にまとめる。

### ステップ3: 判定軸の抽出

state、ipc、security、navigation、documentation の5軸で統合判定項目を定義する。

### ステップ4: 後続タスク境界の固定

`TASK-UI-02`、`TASK-UI-03`、`TASK-UI-04A` が参照する引き渡し項目を要件ID付きで列挙する。

## 統合テスト連携

| 観点     | 内容                                                                         |
| -------- | ---------------------------------------------------------------------------- |
| 入力統合 | A/B/C/D の正本が同一ターンで参照できることを要件に含める                     |
| 下流解放 | `TASK-UI-02` / `TASK-UI-03` / `TASK-UI-04A` のブロッカー解除条件を明文化する |
| 仕様同期 | state / ipc / security / navigation / task-workflow の同期対象分類を固定する |

## アーキテクチャ層別要件（AIが判断）

| 層            | 確認観点                                                                           |
| ------------- | ---------------------------------------------------------------------------------- |
| Renderer      | 下流UIタスクが参照する navigation / history 導線が明確か                           |
| Preload       | 公開API境界と最小公開方針が gate 要件へ反映されているか                            |
| Main          | 統合レビュー判定ロジックと責務分離が明確か                                         |
| IPC           | channel / payload / sender / error 契約が要件へ反映されているか                    |
| Documentation | `task-workflow.md` / `lessons-learned.md` / `LOGS.md` 更新責務が要件化されているか |

## 成果物

| 成果物       | パス                                         | 内容               |
| ------------ | -------------------------------------------- | ------------------ |
| 要件定義書   | `outputs/phase-1/requirements-definition.md` | FR/NFR一覧         |
| 受け入れ基準 | `outputs/phase-1/acceptance-criteria.md`     | 判定基準一覧       |
| スコープ定義 | `outputs/phase-1/scope-definition.md`        | 対象・非対象の境界 |

## 完了条件

- [x] A/B/C/D の入力正本が固定されている
- [x] PASS / MINOR / MAJOR の判定条件が検証可能な文で記載されている
- [x] state / ipc / security / navigation / documentation の5分類が確定している
- [x] 下流タスクへの引き渡し項目が要件ID付きで整理されている
- [x] Renderer / Preload / Main / IPC / Documentation の層別要件が整理されている
- [x] 非スコープ項目が明記されている

## 次のPhase

Phase 2: 設計

## 多角的チェック観点（AIが判断）

| 観点                         | 適用判断                                          | 仕様参照先                                                                                           |
| ---------------------------- | ------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| アーキテクチャ               | 依存境界を固定するため適用                        | `aiworkflow-requirements: architecture-overview.md`                                                  |
| 状態管理                     | state 判定軸を確定するため適用                    | `aiworkflow-requirements: arch-state-management.md`                                                  |
| IPC / Preload / セキュリティ | IPC / security 判定軸と公開境界を確定するため適用 | `aiworkflow-requirements: api-ipc-system.md`, `security-api-electron.md`, `security-electron-ipc.md` |
| 履歴 / ナビゲーション        | history / navigation の統合要件を確定するため適用 | `aiworkflow-requirements: ui-history-integration.md`, `ui-ux-navigation.md`                          |
| エラーハンドリング           | 判定失敗時の記録形式を確定するため適用            | `aiworkflow-requirements: error-handling.md`                                                         |
| ドキュメント整合             | task-workflow 反映先を確定するため適用            | `aiworkflow-requirements: task-workflow.md`                                                          |

## サブタスク管理

Phase実行開始時に、TodoWriteツールまたは同等のタスク管理手段で以下のサブタスクを作成し、完了後ただちに `completed` へ更新する。

1. resource-map / quick-reference / topic-map の確認
2. A/B/C/D 正本パスの固定
3. 判定軸の抽出
4. 下流タスク境界の固定
5. 完了条件の検証

## タスク100%実行確認【必須】

- [x] 本Phase内の全タスクを100%実行完了
- [x] aiworkflow 抽出導線を参照資料と手順へ反映
- [x] 正本パスと下流境界を成果物へ反映
- [x] `artifacts.json` の対象Phaseステータス更新内容を確認

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js \
  docs/30-workflows/completed-tasks/task-056e-integration-gate-and-spec-sync \
  --phase 1
```
