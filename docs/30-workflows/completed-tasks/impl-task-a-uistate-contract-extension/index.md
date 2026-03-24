# TASK-IMP-UISTATE-CONTRACT-EXTENSION-001

## メタ情報

| 項目         | 値                                              |
| ------------ | ----------------------------------------------- |
| タスクID     | TASK-IMP-UISTATE-CONTRACT-EXTENSION-001         |
| 通称         | UiState Contract Extension                      |
| ステータス   | spec_created                                    |
| 作成日       | 2026-03-24                                      |
| 依存タスク   | なし（foundation 層の型拡張）                   |
| 親パック     | ai-runtime-execution-responsibility-realignment |
| 対応ギャップ | Gap-1（画面状態語彙の不足）                     |

## 目的

`packages/shared/src/types/execution-capability.ts` の `UiState` 型を現行の 3 値（`ready` / `blocked` / `unavailable`）から仕様書が要求する 8 値に拡張し、`resolveUiState()` / `resolveCtaContract()` の分岐ロジックと Contract Matrix テストを全面更新する。

## 背景

`ui-ux-realization.md` の画面状態マトリクスは 8 つの状態（`ready` / `running` / `streaming` / `handoff` / `terminal-only` / `guidance-only` / `unavailable` / `blocked` / `degraded`）を定義しているが、現行コードは 3 値のみ。下流の UI コンポーネント（GuidanceBlock, HandoffCard, RuntimeBanner, SlideRuntimeBanner 等）が状態に応じた表示分岐を実装できない。

## スコープ

### 含む

- `UiState` 型への 5 値追加: `handoff` / `guidance-only` / `terminal-only` / `streaming` / `degraded`
- `UI_STATE_VALUES` 配列の拡張
- `CapabilityContext` への追加フィールド（`isStreaming`, `isDegraded` 等）
- `resolveUiState()` の分岐ロジック拡張
- `resolveCtaContract()` の新状態対応 CTA マッピング追加
- Contract Matrix テストの全面更新（8 state × 4 capability = 32 セル）
- `UiStateResult` 型の拡張（`handoffGuidance` フィールド追加）

### 含まない

- UI コンポーネントの実装（別タスク: guided-execution-console-realization）
- Renderer 側の selector / hook 実装（別タスク: task-exec-renderer-capability-consumer-integration-001）
- HealthPolicy の統一（別タスク: TASK-IMP-HEALTH-POLICY-UNIFICATION-001）

## 受入基準

- AC-1: `UiState` 型が 8 値を含み、`UI_STATE_VALUES` と一致する
- AC-2: `resolveUiState()` が `CapabilityContext` の全フィールドに基づき 8 値を正しく導出する
- AC-3: `resolveCtaContract()` が 8 state × 4 capability の全組み合わせで仕様準拠の CTA を返す
- AC-4: `handoff` 状態で `UiStateResult.handoffGuidance` が `HandoffGuidance` 型を返す
- AC-5: 既存の 3 値テスト（32 件）が全て PASS する（後方互換性）
- AC-6: 新規 Contract Matrix テスト（全 32 セル + エッジケース）が PASS する
- AC-7: `pnpm typecheck` / `pnpm lint` が PASS する

## 成果物パス規則

```
docs/30-workflows/impl-task-a-uistate-contract-extension/
  index.md
  phase-1-requirements.md
  phase-2-design.md
  phase-3-design-review.md
  phase-4-test-creation.md
  phase-5-implementation.md
  phase-6-test-augmentation.md
  phase-7-coverage-check.md
  phase-8-refactoring.md
  phase-9-quality-assurance.md
  phase-10-final-review.md
  phase-11-manual-testing.md
  phase-12-documentation.md
  phase-13-pr.md
  artifacts.json
```

## 参照資料

| 参照資料                  | パス                                                                                          | 内容                             |
| ------------------------- | --------------------------------------------------------------------------------------------- | -------------------------------- |
| 画面状態マトリクス        | `docs/30-workflows/ai-runtime-execution-responsibility-realignment/ui-ux-realization.md`      | 8 値の状態定義と CTA 契約        |
| 現行 execution-capability | `packages/shared/src/types/execution-capability.ts`                                           | 拡張対象の型定義と pure function |
| 現行テスト                | `packages/shared/src/types/__tests__/cta-contract.test.ts`                                    | 既存の Contract Matrix テスト    |
| HandoffGuidance 型        | `packages/shared/src/types/handoff.ts`                                                        | handoff 状態で返す DTO 定義      |
| CTA 契約仕様              | `ui-ux-realization.md#CTA契約`                                                                | primary 1 + secondary 1 の制約   |
| UiState consumer          | `docs/30-workflows/unassigned-task/task-exec-renderer-capability-consumer-integration-001.md` | 下流の Renderer 消費タスク       |

## 次Phase

Phase 1: [phase-1-requirements.md](./phase-1-requirements.md)
