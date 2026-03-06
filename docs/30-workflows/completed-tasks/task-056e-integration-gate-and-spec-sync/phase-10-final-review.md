# Phase 10: 最終レビューゲート

## メタ情報

| 項目         | 内容                                     |
| ------------ | ---------------------------------------- |
| Phase        | 10                                       |
| Phase名      | 最終レビューゲート                       |
| 前提Phase    | Phase 1, Phase 2, Phase 5                |
| 後続Phase    | Phase 11                                 |
| ステータス   | completed                                |
| 作成日       | 2026-03-06                               |
| 機能名       | task-056e-integration-gate-and-spec-sync |
| 担当SubAgent | SubAgent-E4                              |

## 目的

統合レビューゲート仕様が実行準備済みか、仕様同期台帳が更新漏れなく定義済みかを最終判定する。

## 実行タスク

- 最終判定: 品質、整合、下流解放の観点で PASS / MINOR / MAJOR を決定する。
- 差し戻し記録: 指摘ごとに戻り先Phaseと再開条件を定義する。
- 解放判断: 下流UIタスクのブロッカー解除可否を決定する。

## 参照資料

| 参照資料               | パス                                                                           | 内容                                     |
| ---------------------- | ------------------------------------------------------------------------------ | ---------------------------------------- |
| Phase 1要件            | `phase-1-requirements.md`                                                      | 判定基準                                 |
| Phase 2設計            | `phase-2-design.md`                                                            | 判定基準                                 |
| Phase 5実装            | `phase-5-implementation.md`                                                    | 判定対象                                 |
| Phase 9品質保証        | `phase-9-quality-assurance.md`                                                 | 品質監査結果                             |
| レビューゲート         | `outputs/phase-5/review-gate.md`                                               | 最終判定対象                             |
| 仕様同期対象一覧       | `outputs/phase-5/spec-sync-targets.md`                                         | 最終判定対象                             |
| レビューゲート基準     | `.claude/skills/task-specification-creator/references/review-gate-criteria.md` | PASS / MINOR / MAJOR / CRITICAL 判定基準 |
| 要件定義書             | `outputs/phase-1/requirements-definition.md`                                   | Phase 1 成果物                           |
| 受け入れ基準           | `outputs/phase-1/acceptance-criteria.md`                                       | Phase 1 成果物                           |
| スコープ定義           | `outputs/phase-1/scope-definition.md`                                          | Phase 1 成果物                           |
| 統合ゲート設計         | `outputs/phase-2/integration-gate-design.md`                                   | Phase 2 成果物                           |
| 仕様同期マトリクス     | `outputs/phase-2/spec-sync-matrix.md`                                          | Phase 2 成果物                           |
| 引き渡し計画           | `outputs/phase-2/dependency-handoff-plan.md`                                   | Phase 2 成果物                           |
| aiworkflow抽出レポート | `outputs/phase-2/aiworkflow-requirements-extract.md`                           | Phase 2 成果物                           |
| トレーサビリティ表     | `outputs/phase-2/traceability-matrix.md`                                       | Phase 2 成果物                           |
| 実装計画               | `outputs/phase-5/implementation-plan.md`                                       | Phase 5 成果物                           |
| カバレッジ目標レポート | `outputs/phase-7/coverage-target-report.md`                                    | Phase 7 成果物                           |
| カバレッジ判定結果     | `outputs/phase-7/coverage-gate-result.md`                                      | Phase 7 成果物                           |
| リファクタ計画         | `outputs/phase-8/refactoring-plan.md`                                          | Phase 8 成果物                           |
| 一貫性チェック         | `outputs/phase-8/contract-consistency-check.md`                                | Phase 8 成果物                           |
| 品質チェックリスト     | `outputs/phase-9/quality-checklist.md`                                         | Phase 9 成果物                           |
| 仕様同期準備レポート   | `outputs/phase-9/spec-sync-readiness.md`                                       | Phase 9 成果物                           |

## システム仕様（aiworkflow-requirements）

| 参照資料            | パス                                                                                        | 内容                                    |
| ------------------- | ------------------------------------------------------------------------------------------- | --------------------------------------- |
| アーキテクチャ総論  | `.claude/skills/aiworkflow-requirements/references/architecture-overview.md`                | SoC と依存方向の最終確認                |
| 実装パターン        | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | 型契約と safeInvoke / safeOn の最終確認 |
| 状態管理            | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`                | state同期判断の最終確認                 |
| IPC仕様             | `.claude/skills/aiworkflow-requirements/references/api-ipc-system.md`                       | IPC同期判断の最終確認                   |
| Preloadセキュリティ | `.claude/skills/aiworkflow-requirements/references/security-api-electron.md`                | 公開境界の最終確認                      |
| IPCセキュリティ     | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`                | sender順序と cleanup の最終確認         |
| エラーハンドリング  | `.claude/skills/aiworkflow-requirements/references/error-handling.md`                       | FAIL / CRITICAL 理由の最終確認          |
| 履歴統合            | `.claude/skills/aiworkflow-requirements/references/ui-history-integration.md`               | history導線の最終確認                   |
| ナビゲーションUI    | `.claude/skills/aiworkflow-requirements/references/ui-ux-navigation.md`                     | nav導線の最終確認                       |
| 品質要件            | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`                 | 最終判定基準                            |
| タスク台帳          | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`                        | 下流解放と台帳反映の基準                |
| 教訓集              | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`                      | 056系での最終レビュー観点               |

## 実行手順

### ステップ1: 判定前提の確認

Phase 9 までの残課題と品質リスクを確認する。

### ステップ2: 最終判定

`review-gate-criteria.md` に従って PASS / MINOR / MAJOR / CRITICAL のいずれかを根拠付きで決定する。CRITICAL は Phase 1 へ戻して要件再確認とし、PR材料化を停止する。

### ステップ3: 再開条件の確定

差し戻しがある場合は戻り先Phaseと再開条件を記録する。

## 統合テスト連携

| 観点     | 内容                                                                 |
| -------- | -------------------------------------------------------------------- |
| 判定軸   | 5軸すべてに最終判定があるか確認する                                  |
| 下流解放 | `TASK-UI-02` / `TASK-UI-03` / `TASK-UI-04A` ごとに解放可否を確認する |
| 台帳準備 | spec_created 反映と lessons 追記の材料が揃っているか確認する         |

## 成果物

| 成果物           | パス                                      | 内容                  |
| ---------------- | ----------------------------------------- | --------------------- |
| 最終レビュー結果 | `outputs/phase-10/final-review-result.md` | 判定と根拠            |
| 差し戻し判断ログ | `outputs/phase-10/rework-decision-log.md` | 戻り先Phaseと再開条件 |

## 完了条件

- [x] `review-gate-criteria.md` に準拠した PASS / MINOR / MAJOR / CRITICAL の判定が根拠付きで記録されている
- [x] 下流タスク3件の解放可否が記録されている
- [x] 差し戻しがある場合は戻り先Phaseが記録されている
- [x] spec_created 反映の材料が揃っている
- [x] Phase 11 で確認する手動検証項目が整理されている

## 次のPhase

Phase 11: 手動テスト検証

## 多角的チェック観点（AIが判断）

| 観点                   | 適用判断                                                        | 仕様参照先                                                                                                                                               |
| ---------------------- | --------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 品質判定               | 最終判定の妥当性を確認するため適用                              | `aiworkflow-requirements: quality-requirements.md`                                                                                                       |
| 正本整合               | state / ipc / history / navigation の統合整合を確認するため適用 | `aiworkflow-requirements: architecture-overview.md`, `arch-state-management.md`, `api-ipc-system.md`, `ui-history-integration.md`, `ui-ux-navigation.md` |
| Preload / セキュリティ | 公開境界と sender 順序を確認するため適用                        | `aiworkflow-requirements: security-api-electron.md`, `security-electron-ipc.md`                                                                          |
| エラーハンドリング     | FAIL / CRITICAL の理由粒度を確認するため適用                    | `aiworkflow-requirements: error-handling.md`                                                                                                             |
| 台帳反映               | spec_created 反映の準備状況を確認するため適用                   | `aiworkflow-requirements: task-workflow.md`                                                                                                              |
| 教訓反映               | 再発防止策が織り込まれているか確認するため適用                  | `aiworkflow-requirements: lessons-learned.md`                                                                                                            |
| 下流解放               | 3件の下流タスク解放可否を確認するため適用                       | `phase-2-design.md`                                                                                                                                      |

## サブタスク管理

Phase実行開始時に、TodoWriteツールまたは同等のタスク管理手段で以下のサブタスクを作成し、完了後ただちに `completed` へ更新する。

1. 判定前提の確認
2. 最終判定
3. 再開条件の確定
4. 下流解放条件の整理
5. 完了条件の検証

## タスク100%実行確認【必須】

- [x] 本Phase内の全タスクを100%実行完了
- [x] 最終レビュー結果と差し戻し判断ログを成果物へ反映
- [x] 下流解放可否を成果物へ反映
- [x] `artifacts.json` の対象Phaseステータス更新内容を確認

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js \
  docs/30-workflows/completed-tasks/task-056e-integration-gate-and-spec-sync \
  --phase 10
```
