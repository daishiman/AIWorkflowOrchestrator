# TASK-IMP-HEALTH-POLICY-UNIFICATION-001

## メタ情報

| 項目         | 値                                                                      |
| ------------ | ----------------------------------------------------------------------- |
| タスクID     | TASK-IMP-HEALTH-POLICY-UNIFICATION-001                                  |
| 通称         | HealthPolicy Unification                                                |
| ステータス   | spec_created                                                            |
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
docs/30-workflows/ai-runtime-execution-responsibility-realignment/tasks/impl-task-b-health-policy-unification/
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
| P62 対策                  | `.claude/rules/06-known-pitfalls.md#P62`                                                       | DEFAULT_CONFIG fallback 禁止         |

### システム仕様（aiworkflow-requirements）

| 参照資料         | パス                                                                              | 内容                         |
| ---------------- | --------------------------------------------------------------------------------- | ---------------------------- |
| API/IPC core     | `.claude/skills/aiworkflow-requirements/references/api-ipc-system-core.md`        | IPC envelope / handler 契約  |
| State management | `.claude/skills/aiworkflow-requirements/references/arch-state-management-core.md` | Renderer selector 境界       |
| Auth core        | `.claude/skills/aiworkflow-requirements/references/interfaces-auth-core.md`       | AuthModeStatus transport DTO |

## 次Phase

Phase 1: [phase-1-requirements.md](./phase-1-requirements.md)
