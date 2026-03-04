# Phase 10: 最終レビューゲート

## メタ情報

| 項目       | 内容                                      |
| ---------- | ----------------------------------------- |
| Phase      | 10                                        |
| 機能名     | TASK-FIX-SKILL-AUTH-PREFLIGHT-GUARD-001   |
| タスク名   | AUTHENTICATION_ERROR の事前検知と設定誘導 |
| 前提Phase  | Phase 9                                   |
| 後続Phase  | Phase 11                                  |
| 作成日     | 2026-03-03                                |
| ステータス | completed                                 |

## 目的

AUTHENTICATION_ERROR の事前検知と設定誘導 を実装可能な単位へ分解し、Phase 10 の成果物を確定する。

## 背景

AUTHENTICATION_ERROR の事前検知と設定誘導 を実行する前提として、Phase 10 で必要な判断材料と成果物の境界を固定する。

## SubAgent分担

| SubAgent | 担当                      |
| -------- | ------------------------- |
| A        | Main/IPC 観点             |
| B        | Preload/Renderer 観点     |
| C        | テスト/品質/仕様同期 観点 |

## 実行タスク

- 最終レビュー計画: リリース可否の判定基準を適用する
- 重大リスク確認計画: MAJOR/CRITICAL の扱いを確認する
- 戻り先判定計画: 戻りPhaseの条件を明記する

## 参照資料

| 資料名                                | パス                                                                                 | 用途                          |
| ------------------------------------- | ------------------------------------------------------------------------------------ | ----------------------------- |
| Executor仕様正本                      | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-executor.md` | AUTHENTICATION_ERROR 契約確認 |
| エラーハンドリング正本                | `.claude/skills/aiworkflow-requirements/references/error-handling.md`                | エラー分類確認                |
| セキュリティ原則                      | `.claude/skills/aiworkflow-requirements/references/security-principles.md`           | AuthKeyService 運用方針確認   |
| IPCセキュリティ正本                   | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`         | sender検証/P42順序確認        |
| Electron API セキュリティ             | `.claude/skills/aiworkflow-requirements/references/security-api-electron.md`         | Preload境界確認               |
| IPC契約正本                           | `.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md`                 | 戻り値契約確認                |
| Skill I/F正本                         | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md`    | `skill:execute` 契約境界確認  |
| 認証I/F正本                           | `.claude/skills/aiworkflow-requirements/references/interfaces-auth.md`               | 設定導線と状態定義確認        |
| 認証アーキテクチャ正本                | `.claude/skills/aiworkflow-requirements/references/architecture-auth-security.md`    | 責務分離と導線確認            |
| 品質要件正本                          | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`          | レビューゲート基準確認        |
| UI/UX機能仕様                         | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md`      | 設定誘導UI観点の最終確認      |
| 抽出網羅行列                          | `outputs/phase-1/implementation-spec-traceability-matrix.md`                         | 実装仕様抽出の単一正本        |
| Phase 1 仕様                          | `phase-1-requirements.md`                                                            | 依存入力（要件定義）          |
| Phase 2 仕様                          | `phase-2-design.md`                                                                  | 依存入力（設計）              |
| Phase 5 仕様                          | `phase-5-implementation.md`                                                          | 依存入力（実装）              |
| acceptance-criteria.md                | `outputs/phase-1/acceptance-criteria.md`                                             | Phase 1 成果物                |
| aiworkflow-requirements-extraction.md | `outputs/phase-1/aiworkflow-requirements-extraction.md`                              | Phase 1 成果物                |
| branch-diff-coverage.md               | `outputs/phase-1/branch-diff-coverage.md`                                            | Phase 1 成果物                |
| requirements-definition.md            | `outputs/phase-1/requirements-definition.md`                                         | Phase 1 成果物                |
| architecture-design.md                | `outputs/phase-2/architecture-design.md`                                             | Phase 2 成果物                |
| ipc-contract-design.md                | `outputs/phase-2/ipc-contract-design.md`                                             | Phase 2 成果物                |
| test-strategy.md                      | `outputs/phase-2/test-strategy.md`                                                   | Phase 2 成果物                |
| changed-files.md                      | `outputs/phase-5/changed-files.md`                                                   | Phase 5 成果物                |
| implementation-summary.md             | `outputs/phase-5/implementation-summary.md`                                          | Phase 5 成果物                |
| coverage-plan.md                      | `outputs/phase-7/coverage-plan.md`                                                   | Phase 7 成果物                |
| uncovered-analysis-plan.md            | `outputs/phase-7/uncovered-analysis-plan.md`                                         | Phase 7 成果物                |
| post-refactor-test-plan.md            | `outputs/phase-8/post-refactor-test-plan.md`                                         | Phase 8 成果物                |
| refactoring-plan.md                   | `outputs/phase-8/refactoring-plan.md`                                                | Phase 8 成果物                |
| quality-report.md                     | `outputs/phase-9/quality-report.md`                                                  | Phase 9 成果物                |
| risk-register.md                      | `outputs/phase-9/risk-register.md`                                                   | Phase 9 成果物                |

## 実行手順

1. 最終判定表を作成する。
2. 重大リスクを分類する。
3. 戻り先を確定する。

## レビューゲート判定基準

| 判定     | 条件                     | 対応                                   |
| -------- | ------------------------ | -------------------------------------- |
| PASS     | 全レビュー観点で問題なし | Phase 11 へ進行                        |
| MINOR    | 軽微な指摘あり           | 未タスクとして記録して Phase 11 へ進行 |
| MAJOR    | 重大な問題あり           | 戻り先を決定して再実施                 |
| CRITICAL | 致命的な問題あり         | Phase 1 に戻り要件再確認               |

## 戻り先判定

| 問題種別         | 戻り先                          |
| ---------------- | ------------------------------- |
| 要件の問題       | Phase 1（要件定義）             |
| 設計の問題       | Phase 2（設計）                 |
| テスト設計の問題 | Phase 4（テスト作成）           |
| 実装の問題       | Phase 5（実装）                 |
| テスト拡充の問題 | Phase 6（テスト拡充）           |
| カバレッジ未達   | Phase 7（テストカバレッジ確認） |
| コード品質の問題 | Phase 8（リファクタリング）     |

## 統合テスト連携

- 最終レビューに統合テスト証跡を添付する。

## 多角的チェック観点（AIが判断）

| 観点           | 確認内容                           | 参照仕様                              |
| -------------- | ---------------------------------- | ------------------------------------- |
| セキュリティ   | sender検証、入力検証、権限境界     | `security-*.md`                       |
| IPC契約        | チャンネル名、引数、戻り値、エラー | `api-ipc-agent.md`, `interfaces-*.md` |
| アーキテクチャ | Main/Preload/Renderer の責務境界   | `architecture-*.md`                   |
| 品質           | テスト観点、回帰防止、可観測性     | `quality-*.md`, `error-handling.md`   |

## 成果物

| 成果物           | パス                                         | 内容     |
| ---------------- | -------------------------------------------- | -------- |
| 最終レビュー結果 | `outputs/phase-10/final-review-result.md`    | Gate判定 |
| 是正計画         | `outputs/phase-10/corrective-action-plan.md` | 戻り計画 |

## 完了条件

- [ ] 実行タスクの成果物が全件定義されている
- [ ] 依存Phaseとの整合が確認できる
- [ ] 次Phaseへ引き継ぐ情報が記録されている
- [ ] 本Phase内の全タスクを100%実行完了

## サブタスク管理

1. 参照資料を確認する。
2. 実行タスクを実施する。
3. 成果物を outputs/phase-10/ に定義する。
4. 完了条件を確認する。

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] Phase内で定義した成果物を全件記録
- [ ] 引き継ぎ情報を明記

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/TASK-FIX-SKILL-AUTH-PREFLIGHT-GUARD-001
```

## Phase実行記録

| 項目         | 記録                           |
| ------------ | ------------------------------ |
| 実行タスク   | completed                      |
| 発見事項     | 実装/検証結果を outputs に反映 |
| 引き継ぎ事項 | 次Phaseの入力成果物を同期済み  |

## 次のPhase

Phase 11: 手動テスト検証
