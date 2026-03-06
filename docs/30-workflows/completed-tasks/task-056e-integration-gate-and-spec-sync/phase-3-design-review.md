# Phase 3: 設計レビューゲート

## メタ情報

| 項目         | 内容                                     |
| ------------ | ---------------------------------------- |
| Phase        | 3                                        |
| Phase名      | 設計レビューゲート                       |
| 前提Phase    | Phase 1, Phase 2                         |
| 後続Phase    | Phase 4                                  |
| ステータス   | completed                                |
| 作成日       | 2026-03-06                               |
| 機能名       | task-056e-integration-gate-and-spec-sync |
| 担当SubAgent | SubAgent-E4                              |

## 目的

Phase 2 の設計成果物が上流正本と矛盾せず、下流タスクへ安全に引き渡せるかを判定する。

## 実行タスク

- 設計整合レビュー: Phase 1 と Phase 2 の整合、A/B/C/D 正本との差分を確認する。
- 判定分類: PASS / MINOR / MAJOR を根拠付きで決定する。
- 差し戻し先決定: 問題ごとに Phase 1 または Phase 2 の戻り先を決定する。

## 参照資料

| 参照資料               | パス                                                                                                                                       | 内容                              |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------- |
| Phase 1要件            | `phase-1-requirements.md`                                                                                                                  | 要件基準                          |
| Phase 2設計            | `phase-2-design.md`                                                                                                                        | レビュー対象                      |
| C正本                  | `docs/30-workflows/completed-tasks/task-056c-notification-history-domain/index.md`                                                         | notification / history の正本確認 |
| D正本                  | `docs/30-workflows/completed-tasks/task-056d-viewtype-routing-nav/index.md`                                                                | navigation の正本確認             |
| 056統合インデックス    | `docs/30-workflows/skill-import-agent-system/tasks/task-00-unified-implementation-sequence/task-056-ui-01-store-ipc-architecture/index.md` | 正本導線確認                      |
| レビューゲート基準     | `.claude/skills/task-specification-creator/references/review-gate-criteria.md`                                                             | PASS / MINOR / MAJOR 判定基準     |
| 要件定義書             | `outputs/phase-1/requirements-definition.md`                                                                                               | Phase 1 成果物                    |
| 受け入れ基準           | `outputs/phase-1/acceptance-criteria.md`                                                                                                   | Phase 1 成果物                    |
| スコープ定義           | `outputs/phase-1/scope-definition.md`                                                                                                      | Phase 1 成果物                    |
| 統合ゲート設計         | `outputs/phase-2/integration-gate-design.md`                                                                                               | Phase 2 成果物                    |
| 仕様同期マトリクス     | `outputs/phase-2/spec-sync-matrix.md`                                                                                                      | Phase 2 成果物                    |
| 引き渡し計画           | `outputs/phase-2/dependency-handoff-plan.md`                                                                                               | Phase 2 成果物                    |
| aiworkflow抽出レポート | `outputs/phase-2/aiworkflow-requirements-extract.md`                                                                                       | Phase 2 成果物                    |
| トレーサビリティ表     | `outputs/phase-2/traceability-matrix.md`                                                                                                   | Phase 2 成果物                    |

## システム仕様（aiworkflow-requirements）

| 参照資料            | パス                                                                                        | 内容                                       |
| ------------------- | ------------------------------------------------------------------------------------------- | ------------------------------------------ |
| アーキテクチャ総論  | `.claude/skills/aiworkflow-requirements/references/architecture-overview.md`                | SoC と依存方向のレビュー基準               |
| 実装パターン        | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | safeInvoke / safeOn と型契約のレビュー基準 |
| 状態管理            | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`                | state境界レビュー                          |
| IPC仕様             | `.claude/skills/aiworkflow-requirements/references/api-ipc-system.md`                       | IPC契約レビュー                            |
| Preloadセキュリティ | `.claude/skills/aiworkflow-requirements/references/security-api-electron.md`                | 公開API境界レビュー                        |
| IPCセキュリティ     | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`                | sender / whitelist レビュー                |
| エラーハンドリング  | `.claude/skills/aiworkflow-requirements/references/error-handling.md`                       | FAIL理由の整合性レビュー                   |
| 履歴統合            | `.claude/skills/aiworkflow-requirements/references/ui-history-integration.md`               | history導線レビュー                        |
| ナビゲーションUI    | `.claude/skills/aiworkflow-requirements/references/ui-ux-navigation.md`                     | nav導線レビュー                            |
| 品質要件            | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`                 | レビュー観点                               |
| タスク台帳          | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`                        | spec_created 反映観点                      |
| 教訓集              | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`                      | 056系で再発したドリフト対策                |

## 実行手順

### ステップ1: 事実差分の抽出

設計成果物と A/B/C/D 正本の差分を行単位で記録する。

### ステップ2: 判定分類

`review-gate-criteria.md` に従って差分を PASS / MINOR / MAJOR に分類し、判定理由を1行で記録する。MINOR は Phase 4 開始前に解消条件を、MAJOR は戻り先Phaseを必ず併記する。

### ステップ3: 差し戻し先の確定

各問題を修正すべきPhaseへマッピングし、再レビュー条件を記録する。

## 統合テスト連携

| 観点     | 内容                                                           |
| -------- | -------------------------------------------------------------- |
| 要件整合 | Phase 1 の要件が設計で欠落していないか確認する                 |
| 正本整合 | A/B/C/D の正本と設計成果物の差分をトレースする                 |
| 下流整合 | Phase 2 の引き渡し計画が下流ブロック解除条件を満たすか確認する |

## 成果物

| 成果物           | パス                                      | 内容               |
| ---------------- | ----------------------------------------- | ------------------ |
| 設計レビュー結果 | `outputs/phase-3/design-review-result.md` | 判定、理由、戻り先 |
| レビュー指摘一覧 | `outputs/phase-3/review-findings.md`      | 問題一覧と是正方針 |

## 完了条件

- [x] 設計差分が上流正本ごとに記録されている
- [x] `review-gate-criteria.md` に準拠した PASS / MINOR / MAJOR の判定が根拠付きで記録されている
- [x] MAJOR の戻り先Phaseが定義されている
- [x] MINOR の解消条件が定義されている
- [x] 下流タスクへ渡せない項目があれば一覧化されている

## 次のPhase

Phase 4: テスト作成

## 多角的チェック観点（AIが判断）

| 観点                   | 適用判断                                 | 仕様参照先                                                                                                                                                                                          |
| ---------------------- | ---------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 要件整合               | Phase 1 の要件との差分を確認するため適用 | `phase-1-requirements.md`                                                                                                                                                                           |
| 設計整合               | Phase 2 の設計差分を確認するため適用     | `phase-2-design.md`                                                                                                                                                                                 |
| 正本整合               | A/B/C/D の正本との差分を確認するため適用 | `aiworkflow-requirements: architecture-overview.md`, `architecture-implementation-patterns.md`, `arch-state-management.md`, `api-ipc-system.md`, `ui-history-integration.md`, `ui-ux-navigation.md` |
| Preload / セキュリティ | 公開境界と sender 順序を確認するため適用 | `aiworkflow-requirements: security-api-electron.md`, `security-electron-ipc.md`                                                                                                                     |
| エラーハンドリング     | FAIL理由の粒度を確認するため適用         | `aiworkflow-requirements: error-handling.md`                                                                                                                                                        |
| 品質整合               | レビュー判定の妥当性を確認するため適用   | `aiworkflow-requirements: quality-requirements.md`                                                                                                                                                  |

## サブタスク管理

Phase実行開始時に、TodoWriteツールまたは同等のタスク管理手段で以下のサブタスクを作成し、完了後ただちに `completed` へ更新する。

1. 参照資料の確認
2. 事実差分の抽出
3. 判定分類
4. 差し戻し先の確定
5. 完了条件の検証

## タスク100%実行確認【必須】

- [x] 本Phase内の全タスクを100%実行完了
- [x] レビュー判定と戻り先Phaseを成果物へ反映
- [x] 上流正本との差分を成果物へ反映
- [x] `artifacts.json` の対象Phaseステータス更新内容を確認

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js \
  docs/30-workflows/completed-tasks/task-056e-integration-gate-and-spec-sync \
  --phase 3
```
