# Phase 3: 設計レビューゲート

## メタ情報

| 項目       | 内容                                      |
| ---------- | ----------------------------------------- |
| Phase      | 3                                         |
| 機能名     | TASK-FIX-SKILL-AUTH-PREFLIGHT-GUARD-001   |
| タスク名   | AUTHENTICATION_ERROR の事前検知と設定誘導 |
| 前提Phase  | Phase 2                                   |
| 後続Phase  | Phase 4                                   |
| 作成日     | 2026-03-03                                |
| ステータス | completed                                 |

## 目的

AUTHENTICATION_ERROR の事前検知と設定誘導 を実装可能な単位へ分解し、Phase 3 の成果物を確定する。

## 背景

AUTHENTICATION_ERROR の事前検知と設定誘導 を実行する前提として、Phase 3 で必要な判断材料と成果物の境界を固定する。

## SubAgent分担

| SubAgent | 担当                      |
| -------- | ------------------------- |
| A        | Main/IPC 観点             |
| B        | Preload/Renderer 観点     |
| C        | テスト/品質/仕様同期 観点 |

## 実行タスク

- 設計監査: 要件との整合を検証する
- セキュリティ監査: sender検証と入力検証を検証する
- Gate判定: PASS/MINOR/MAJOR を判定する

## 参照資料

| 資料名                                | パス                                                                                 | 用途                          |
| ------------------------------------- | ------------------------------------------------------------------------------------ | ----------------------------- |
| Executor仕様正本                      | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-executor.md` | AUTHENTICATION_ERROR 契約確認 |
| エラーハンドリング正本                | `.claude/skills/aiworkflow-requirements/references/error-handling.md`                | エラー分類確認                |
| セキュリティ原則                      | `.claude/skills/aiworkflow-requirements/references/security-principles.md`           | AuthKeyService 運用方針確認   |
| Electron API セキュリティ             | `.claude/skills/aiworkflow-requirements/references/security-api-electron.md`         | Preload境界確認               |
| IPC契約正本                           | `.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md`                 | 戻り値契約確認                |
| 認証I/F正本                           | `.claude/skills/aiworkflow-requirements/references/interfaces-auth.md`               | 設定導線と状態定義確認        |
| 抽出網羅行列                          | `outputs/phase-1/implementation-spec-traceability-matrix.md`                         | 実装仕様抽出の単一正本        |
| Phase 1 仕様                          | `phase-1-requirements.md`                                                            | 依存入力（要件定義）          |
| Phase 2 仕様                          | `phase-2-design.md`                                                                  | 依存入力（設計）              |
| acceptance-criteria.md                | `outputs/phase-1/acceptance-criteria.md`                                             | Phase 1 成果物                |
| aiworkflow-requirements-extraction.md | `outputs/phase-1/aiworkflow-requirements-extraction.md`                              | Phase 1 成果物                |
| branch-diff-coverage.md               | `outputs/phase-1/branch-diff-coverage.md`                                            | Phase 1 成果物                |
| requirements-definition.md            | `outputs/phase-1/requirements-definition.md`                                         | Phase 1 成果物                |
| architecture-design.md                | `outputs/phase-2/architecture-design.md`                                             | Phase 2 成果物                |
| ipc-contract-design.md                | `outputs/phase-2/ipc-contract-design.md`                                             | Phase 2 成果物                |
| test-strategy.md                      | `outputs/phase-2/test-strategy.md`                                                   | Phase 2 成果物                |

## 実行手順

1. 要件トレーサビリティを確認する。
2. セキュリティ観点を確認する。
3. Gate判定を記録する。

## レビューゲート判定基準

| 判定  | 条件                     | 対応                          |
| ----- | ------------------------ | ----------------------------- |
| PASS  | 全レビュー観点で問題なし | Phase 4 へ進行                |
| MINOR | 軽微な指摘あり           | 指摘を記録して Phase 4 へ進行 |
| MAJOR | 重大な問題あり           | 戻り先を決定して再実施        |

## 戻り先判定

| 問題種別         | 戻り先              |
| ---------------- | ------------------- |
| 要件の問題       | Phase 1（要件定義） |
| 設計の問題       | Phase 2（設計）     |
| 要件と設計の両方 | Phase 1（要件定義） |

## 統合テスト連携

- 監査で承認した統合テスト観点を Phase 4 に引き継ぐ。

## 多角的チェック観点（AIが判断）

| 観点           | 確認内容                           | 参照仕様                              |
| -------------- | ---------------------------------- | ------------------------------------- |
| セキュリティ   | sender検証、入力検証、権限境界     | `security-*.md`                       |
| IPC契約        | チャンネル名、引数、戻り値、エラー | `api-ipc-agent.md`, `interfaces-*.md` |
| アーキテクチャ | Main/Preload/Renderer の責務境界   | `architecture-*.md`                   |
| 品質           | テスト観点、回帰防止、可観測性     | `quality-*.md`, `error-handling.md`   |

## 成果物

| 成果物           | パス                                      | 内容     |
| ---------------- | ----------------------------------------- | -------- |
| 設計レビュー結果 | `outputs/phase-3/design-review-result.md` | 指摘一覧 |
| Gate判定         | `outputs/phase-3/gate-decision.md`        | 判定結果 |

## 完了条件

- [ ] 実行タスクの成果物が全件定義されている
- [ ] 依存Phaseとの整合が確認できる
- [ ] 次Phaseへ引き継ぐ情報が記録されている
- [ ] 本Phase内の全タスクを100%実行完了

## サブタスク管理

1. 参照資料を確認する。
2. 実行タスクを実施する。
3. 成果物を outputs/phase-3/ に定義する。
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

Phase 4: テスト作成
