# TASK-IMP-HEALTH-POLICY-UNIFICATION-001

## メタ情報

| 項目         | 値                                                                      |
| ------------ | ----------------------------------------------------------------------- |
| タスクID     | TASK-IMP-HEALTH-POLICY-UNIFICATION-001                                  |
| 通称         | HealthPolicy Unification                                                |
| ステータス   | in_progress                                                             |
| 作成日       | 2026-03-24                                                              |
| 依存タスク   | TASK-IMP-UISTATE-CONTRACT-EXTENSION-001（UiState に `degraded` が必要） |
| 親パック     | ai-runtime-execution-responsibility-realignment                         |
| 対応ギャップ | Gap-3（HealthPolicy の統一不足）                                        |

## 目的

接続状態判定（health check）が 37 ファイルに分散している現状を、統一された `HealthPolicy` インターフェースに集約し、`RuntimePolicyResolver` が `HealthPolicy` を消費する形に再設計する。

## 背景

Task02（Central Policy）の仕様書は完了しているが、`HealthPolicy` を統一ポリシーオブジェクトにする実装タスクが存在しない。現行は:

- `apiKeyDegraded` フラグが `ExecutionCapabilityInput` に直接埋め込み
- `HealthCheckResult` 型が各コンポーネント（HealthIndicator, LLMSelectorPanel, MainlineAccessMatrixSection 等）で個別参照
- 接続状態の判定ロジックが `mainlineAccess.ts` の `buildMainlineExecutionAccessState()` に分散

この状態では、接続障害時の降格ロジックを一箇所で変更できず、P62（DEFAULT_CONFIG への暗黙 fallback）パターンの再発リスクがある。

## スコープ

### 含む

- `HealthPolicy` インターフェース定義（`packages/shared/src/types/`）
- `HealthPolicyResolver` pure function 作成
- `ExecutionCapabilityInput` からの `apiKeyDegraded` フラグ移行
- `RuntimePolicyResolver.ts` での `HealthPolicy` 消費
- `mainlineAccess.ts` での `HealthPolicy` 消費
- `HealthIndicator.tsx` での統一インターフェース利用
- 統一テスト

### 含まない

- UI コンポーネントの新規作成
- UiState 型の変更（依存タスク TASK-IMP-UISTATE-CONTRACT-EXTENSION-001 で実施）
- LLM Adapter 個別の health check ロジック変更

## 受入基準

- AC-1: `HealthPolicy` インターフェースが `packages/shared/src/types/` に定義されている
- AC-2: `HealthPolicyResolver` が接続状態・API key 有効性・レート制限状態から `HealthStatus` を一元的に導出する
- AC-3: `ExecutionCapabilityInput.apiKeyDegraded` が非推奨（`@deprecated`）マークされ、`HealthPolicy` 経由のアクセスに移行する移行パスが明示されている
- AC-4: `RuntimePolicyResolver` が `HealthPolicy` を DI で受け取り、降格判定に使用する
- AC-5: `mainlineAccess.ts` が `HealthPolicy` から `isConnectionAvailable` を導出する
- AC-6: 既存テスト（37 ファイル関連）が全て PASS する（後方互換性）
- AC-7: `pnpm typecheck` / `pnpm lint` が PASS する

## 成果物パス規則

```
docs/30-workflows/impl-task-b-health-policy-unification/
  index.md
  phase-1-requirements.md
  ...
  phase-13-pr.md
  artifacts.json
```

## 参照資料

| 参照資料                  | パス                                                                                           | 内容                                 |
| ------------------------- | ---------------------------------------------------------------------------------------------- | ------------------------------------ |
| Central Policy 仕様       | `docs/30-workflows/completed-tasks/step-02-seq-task-02-runtime-policy-centralization/index.md` | Task02 の policy centralization 仕様 |
| 現行 execution-capability | `packages/shared/src/types/execution-capability.ts`                                            | `apiKeyDegraded` フラグの現行定義    |
| RuntimePolicyResolver     | `apps/desktop/src/main/services/runtime/RuntimePolicyResolver.ts`                              | 中央ポリシー resolver                |
| mainlineAccess            | `apps/desktop/src/renderer/features/mainline-access/mainlineAccess.ts`                         | Renderer 側の health 消費            |
| HealthIndicator           | `apps/desktop/src/renderer/components/llm/HealthIndicator.tsx`                                 | 接続状態 UI                          |
| P62 対策                  | `.claude/rules-disabled/06-known-pitfalls.md#P62`                                              | DEFAULT_CONFIG fallback 禁止         |

### システム仕様（aiworkflow-requirements）

| 参照資料         | パス                                                                              | 内容                         |
| ---------------- | --------------------------------------------------------------------------------- | ---------------------------- |
| API/IPC core     | `.claude/skills/aiworkflow-requirements/references/api-ipc-system-core.md`        | IPC envelope / handler 契約  |
| State management | `.claude/skills/aiworkflow-requirements/references/arch-state-management-core.md` | Renderer selector 境界       |
| Auth core        | `.claude/skills/aiworkflow-requirements/references/interfaces-auth-core.md`       | AuthModeStatus transport DTO |

## Phase一覧

| Phase | 名称             | 仕様書                                                         | ステータス  |
| ----- | ---------------- | -------------------------------------------------------------- | ----------- |
| 1     | 要件定義         | [phase-1-requirements.md](./phase-1-requirements.md)           | completed   |
| 2     | 設計             | [phase-2-design.md](./phase-2-design.md)                       | completed   |
| 3     | 設計レビュー     | [phase-3-design-review.md](./phase-3-design-review.md)         | completed   |
| 4     | テスト作成       | [phase-4-test-creation.md](./phase-4-test-creation.md)         | completed   |
| 5     | 実装             | [phase-5-implementation.md](./phase-5-implementation.md)       | completed   |
| 6     | テスト拡充       | [phase-6-test-augmentation.md](./phase-6-test-augmentation.md) | completed   |
| 7     | カバレッジ確認   | [phase-7-coverage-check.md](./phase-7-coverage-check.md)       | completed   |
| 8     | リファクタリング | [phase-8-refactoring.md](./phase-8-refactoring.md)             | completed   |
| 9     | 品質保証         | [phase-9-quality-assurance.md](./phase-9-quality-assurance.md) | completed   |
| 10    | 最終レビュー     | [phase-10-final-review.md](./phase-10-final-review.md)         | completed   |
| 11    | 手動テスト       | [phase-11-manual-testing.md](./phase-11-manual-testing.md)     | in_progress |
| 12    | ドキュメント     | [phase-12-documentation.md](./phase-12-documentation.md)       | in_progress |
| 13    | PR準備           | [phase-13-pr.md](./phase-13-pr.md)                             | in_progress |
