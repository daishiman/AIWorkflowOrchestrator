# Phase 7: テストカバレッジ確認

## メタ情報

| 項目       | 内容                                      |
| ---------- | ----------------------------------------- |
| Phase      | 7                                         |
| 機能名     | TASK-FIX-SKILL-AUTH-PREFLIGHT-GUARD-001   |
| タスク名   | AUTHENTICATION_ERROR の事前検知と設定誘導 |
| 前提Phase  | Phase 6                                   |
| 後続Phase  | Phase 8                                   |
| 作成日     | 2026-03-03                                |
| ステータス | completed                                 |

## 目的

AUTHENTICATION_ERROR の事前検知と設定誘導 を実装可能な単位へ分解し、Phase 7 の成果物を確定する。

## 背景

AUTHENTICATION_ERROR の事前検知と設定誘導 を実行する前提として、Phase 7 で必要な判断材料と成果物の境界を固定する。

## SubAgent分担

| SubAgent | 担当                      |
| -------- | ------------------------- |
| A        | Main/IPC 観点             |
| B        | Preload/Renderer 観点     |
| C        | テスト/品質/仕様同期 観点 |

## 実行タスク

- カバレッジ測定計画: Line/Branch/Function を定義する
- 未到達分析計画: 未到達箇所の分類ルールを定義する
- 補完計画: 追加ケース優先順位を定義する

## 参照資料

| 資料名                    | パス                                                                                 | 用途                          |
| ------------------------- | ------------------------------------------------------------------------------------ | ----------------------------- |
| Executor仕様正本          | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-executor.md` | AUTHENTICATION_ERROR 契約確認 |
| エラーハンドリング正本    | `.claude/skills/aiworkflow-requirements/references/error-handling.md`                | エラー分類確認                |
| セキュリティ原則          | `.claude/skills/aiworkflow-requirements/references/security-principles.md`           | AuthKeyService 運用方針確認   |
| Electron API セキュリティ | `.claude/skills/aiworkflow-requirements/references/security-api-electron.md`         | Preload境界確認               |
| IPC契約正本               | `.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md`                 | 戻り値契約確認                |
| 認証I/F正本               | `.claude/skills/aiworkflow-requirements/references/interfaces-auth.md`               | 設定導線と状態定義確認        |
| 抽出網羅行列              | `outputs/phase-1/implementation-spec-traceability-matrix.md`                         | 実装仕様抽出の単一正本        |
| Phase 5 仕様              | `phase-5-implementation.md`                                                          | 依存入力（実装）              |
| Phase 6 仕様              | `phase-6-test-expansion.md`                                                          | 依存入力（テスト拡充）        |
| expanded-test-cases.md    | `outputs/phase-6/expanded-test-cases.md`                                             | Phase 6 成果物                |
| regression-test-result.md | `outputs/phase-6/regression-test-result.md`                                          | Phase 6 成果物                |

## 実行手順

1. 測定基準を固定する。
2. 未到達箇所の分類ルールを適用する。
3. 補完順序を決定する。

## 統合テスト連携

- 統合テストのカバレッジ寄与を測定し不足箇所を記録する。

## 多角的チェック観点（AIが判断）

| 観点           | 確認内容                           | 参照仕様                              |
| -------------- | ---------------------------------- | ------------------------------------- |
| セキュリティ   | sender検証、入力検証、権限境界     | `security-*.md`                       |
| IPC契約        | チャンネル名、引数、戻り値、エラー | `api-ipc-agent.md`, `interfaces-*.md` |
| アーキテクチャ | Main/Preload/Renderer の責務境界   | `architecture-*.md`                   |
| 品質           | テスト観点、回帰防止、可観測性     | `quality-*.md`, `error-handling.md`   |

## 成果物

| 成果物         | パス                                         | 内容     |
| -------------- | -------------------------------------------- | -------- |
| カバレッジ計画 | `outputs/phase-7/coverage-plan.md`           | 測定基準 |
| 未到達分析計画 | `outputs/phase-7/uncovered-analysis-plan.md` | 補完方針 |

## 完了条件

- [ ] 実行タスクの成果物が全件定義されている
- [ ] 依存Phaseとの整合が確認できる
- [ ] 次Phaseへ引き継ぐ情報が記録されている
- [ ] 本Phase内の全タスクを100%実行完了

## サブタスク管理

1. 参照資料を確認する。
2. 実行タスクを実施する。
3. 成果物を outputs/phase-7/ に定義する。
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

Phase 8: リファクタリング
