# UT-06-003: SafetyGatePort 具象クラス実装（DefaultSafetyGate）

## メタ情報

| 項目         | 値                                                 |
| ------------ | -------------------------------------------------- |
| タスクID     | UT-06-003                                          |
| タスク名     | SafetyGatePort 具象クラス実装（DefaultSafetyGate） |
| 機能名       | safety-gate-implementation                         |
| 分類         | 実装                                               |
| 優先度       | 高（priority:high）                                |
| ステータス   | Phase 12 完了                                      |
| 発見元       | TASK-SKILL-LIFECYCLE-06 Phase 12                   |
| GitHub Issue | #1260                                              |
| 作成日       | 2026-03-16                                         |

## 関連タスク

| タスクID                | 関係性                           | ステータス |
| ----------------------- | -------------------------------- | ---------- |
| TASK-SKILL-LIFECYCLE-06 | 発見元（SafetyGatePort契約定義） | 完了       |
| TASK-SKILL-LIFECYCLE-08 | 後続（本タスク完了後にDIで利用） | 未実施     |
| UT-06-001               | 前提（TOOL_RISK_CONFIG定数実装） | 未実施     |
| UT-06-002               | 前提（PermissionStore実装）      | 未実施     |

## 目的

`SafetyGatePort` の具象クラス `DefaultSafetyGate` を Main Process に実装し、`evaluate(skillName)` が `SafetyGateResult.overallGrade`（`SAFE` / `SAFE_WITH_WARNINGS` / `UNSAFE`）を返せる状態にする。

現在 `SafetyGatePort` は契約（インターフェース）のみ定義されており、評価ロジックの実体が存在しない。これにより公開前ブロック判定が機能せず、後続の TASK-SKILL-LIFECYCLE-08（PermissionDialog 実装）で DI 利用できない状態となっている。

## スコープ

### スコープ内

- `DefaultSafetyGate` クラスの実装（`apps/desktop/src/main/permissions/default-safety-gate.ts`）
- `SafetyCheckId` 5種の評価ロジック実装
- Grade集約ルール（UNSAFE優先）の実装
- `skill:evaluate-safety` IPCハンドラの追加
- 単体テスト（blocked/warned/passedの代表ケース固定）
- DI境界の維持（Portインターフェース越しの利用）

### スコープ外

- PermissionDialog UI の実装（TASK-SKILL-LIFECYCLE-08）
- INS-01〜03 説明責任UIコンポーネント（UT-06-004）
- abort/skip/retry fallbackフロー（UT-06-005、完了済み）
- TOOL_RISK_CONFIG定数の定義（UT-06-001）
- PermissionStore の実装（UT-06-002）

## 受入基準

- [ ] `evaluate(skillName): Promise<SafetyGateResult>` が動作する
- [ ] `SafetyCheckId` 5種の評価ロジックが実装されている
- [ ] Grade集約ルール（UNSAFE優先）が実装されている
- [ ] `CRITICAL_TOOL_REQUIRED` が `UNSAFE` へ集約される
- [ ] `HIGH_TOOL_REQUIRED` が `SAFE_WITH_WARNINGS` へ集約される
- [ ] `skill:evaluate-safety` IPCハンドラが追加されている
- [ ] IPC経由で結果取得できる
- [ ] DI境界を維持し、Portインターフェース越しに利用できる
- [ ] 単体テストでblocked/warned/passedの代表ケースが固定されている
- [ ] 全テストがPASSすること
- [ ] `pnpm --filter @repo/desktop typecheck` が通ること

## 成果物

| 成果物                | パス                                                            | 種別   |
| --------------------- | --------------------------------------------------------------- | ------ |
| DefaultSafetyGate実装 | `apps/desktop/src/main/permissions/default-safety-gate.ts`      | コード |
| IPCハンドラ           | `apps/desktop/src/main/ipc/handlers/safety-gate.ts`             | コード |
| 単体テスト            | `apps/desktop/src/main/permissions/default-safety-gate.test.ts` | テスト |
| IPCハンドラテスト     | `apps/desktop/src/main/ipc/handlers/safety-gate.test.ts`        | テスト |

## Phase構成

| Phase | 名称             | 仕様書                                                         | 目的                                       | 依存Phase |
| ----- | ---------------- | -------------------------------------------------------------- | ------------------------------------------ | --------- |
| 1     | 要件定義         | [phase-1-requirements.md](./phase-1-requirements.md)           | スコープ・受入基準・前提条件の確定         | -         |
| 2     | 設計             | [phase-2-design.md](./phase-2-design.md)                       | DefaultSafetyGateクラス設計・IPC設計       | 1         |
| 3     | 設計レビュー     | [phase-3-design-review.md](./phase-3-design-review.md)         | 設計の妥当性検証                           | 2         |
| 4     | テスト作成       | [phase-4-test-creation.md](./phase-4-test-creation.md)         | テストケース設計・テストコード作成         | 3         |
| 5     | 実装             | [phase-5-implementation.md](./phase-5-implementation.md)       | DefaultSafetyGate・IPCハンドラ実装         | 3         |
| 6     | テスト拡充       | [phase-6-test-expansion.md](./phase-6-test-expansion.md)       | 境界値・異常系テスト追加                   | 4, 5      |
| 7     | カバレッジ確認   | [phase-7-coverage-check.md](./phase-7-coverage-check.md)       | カバレッジ基準の充足確認                   | 6         |
| 8     | リファクタリング | [phase-8-refactoring.md](./phase-8-refactoring.md)             | コード品質改善                             | 7         |
| 9     | 品質検証         | [phase-9-quality-assurance.md](./phase-9-quality-assurance.md) | Lint・型チェック・全テスト実行             | 8         |
| 10    | 最終レビュー     | [phase-10-final-review.md](./phase-10-final-review.md)         | 多角的品質・整合性検証                     | 9         |
| 11    | 手動テスト       | [phase-11-manual-test.md](./phase-11-manual-test.md)           | 動作確認・E2Eシナリオ実行                  | 10        |
| 12    | ドキュメント     | [phase-12-documentation.md](./phase-12-documentation.md)       | 実装ガイド・システム仕様更新・未タスク検出 | 11        |
| 13    | 完了             | [phase-13-completion.md](./phase-13-completion.md)             | 成果物最終確認・PR準備                     | 12        |

## 参照資料

| 資料名                        | パス                                                                                                                                                  |
| ----------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| SafetyGate型定義（Phase 5）   | `docs/30-workflows/completed-tasks/step-05-par-task-06-trust-permission-governance/outputs/phase-5/safety-gate.ts`                                    |
| SafetyGate設計契約（Phase 2） | `docs/30-workflows/completed-tasks/step-05-par-task-06-trust-permission-governance/outputs/phase-2/safety-gate-contract.md`                           |
| デシジョンテーブル（Phase 4） | `docs/30-workflows/completed-tasks/step-05-par-task-06-trust-permission-governance/outputs/phase-4/decision-table-risk-permission.md`                 |
| 実装ガイド（Phase 12）        | `docs/30-workflows/completed-tasks/step-05-par-task-06-trust-permission-governance/outputs/phase-12/implementation-guide.md`                          |
| タスク指示書                  | `docs/30-workflows/completed-tasks/step-05-par-task-06-trust-permission-governance/unassigned-task/task-ut-06-003-safety-gate-port-implementation.md` |

## 検証コマンド

```bash
# 単体テスト実行
pnpm --filter @repo/desktop test src/main/permissions/default-safety-gate.test.ts

# IPCハンドラテスト実行
pnpm --filter @repo/desktop test src/main/ipc/handlers/safety-gate.test.ts

# 型チェック
pnpm --filter @repo/desktop typecheck

# Lint
pnpm --filter @repo/desktop lint
```

## 次Phase

Phase 1: 要件定義 → `phase-1-requirements.md`
