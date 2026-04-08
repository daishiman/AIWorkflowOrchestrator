# 実行能力契約仕様 / execution capability contract

> この文書は [arch-state-management-core.md](arch-state-management-core.md) から分離されたものです。
> 親仕様書: [arch-state-management.md](arch-state-management.md)
> 役割: execution capability contract specification

## AccessCapability の shared パッケージ移動（TASK-IMP-EXECUTION-RESPONSIBILITY-CONTRACT-FOUNDATION-001 / Task01）

> 完了日: 2026-03-20

### 変更概要

`AccessCapability` 型が `apps/desktop/src/renderer/store/slices/chatSlice.ts` の Renderer ローカル定義から `packages/shared/src/types/execution-capability.ts` に移動した。`chatSlice.ts` は re-export パターンで後方互換性を維持する。

### 変更前後

| 項目 | 変更前 | 変更後 |
| --- | --- | --- |
| 型定義場所 | `chatSlice.ts`（Renderer ローカル） | `packages/shared/src/types/execution-capability.ts` |
| chatSlice.ts の role | 型を直接定義 | `execution-capability.ts` から re-export |
| `packages/shared/src/types/index.ts` | エクスポートなし | `execution-capability` re-export 追加 |

### re-export パターン

```typescript
// chatSlice.ts（後方互換 re-export）
export type { AccessCapability } from "@repo/shared";
```

### resolveUiState / resolveCtaContract の Renderer 消費パターン

Renderer 側は `packages/shared` から直接インポートして消費する。

```typescript
import { resolveUiState, resolveCtaContract, AccessCapability } from "@repo/shared";
const uiState = resolveUiState(capability, context);
const cta = resolveCtaContract(capability, ctaInput);
```

### 設計判断

- 新規 Slice: **不要**。`AccessCapability` は純粋な型であり Zustand Slice に持つ必要がない
- P31/P48 対策: `resolveUiState` などの解決関数は純粋関数のため Zustand セレクタへの混入リスクがない
- silent fallback 禁止: `assertNoSilentFallback()` により `none` 能力でのサイレント fallback を型レベルで強制禁止

### 関連タスク

| タスクID | 内容 | ステータス | 備考 |
| --- | --- | --- | --- |
| TASK-IMP-EXECUTION-RESPONSIBILITY-CONTRACT-FOUNDATION-001 | ExecutionResponsibility 契約基盤 | **完了**（2026-03-20） | |
| TASK-IMP-RUNTIME-POLICY-CAPABILITY-BRIDGE-001 | RuntimePolicyResolver capability bridge | **完了**（2026-03-21） | direct caller lane で resolveCapability() を authority として使用。assertNoSilentFallback enforcement 組み込み。execute() で terminalSurface handoff 分岐追加。internal `creatorHandlers.ts` adapter test 追加 |
| UT-IMP-RUNTIME-SKILL-CREATOR-IPC-WIRING-001 | Skill Creator public IPC wiring 統合 | 残課題 | internal `creator:*` と public `skill-creator:*` の境界整理 |
| UT-IMP-RUNTIME-POLICY-SUBSCRIPTION-SERVICE-INTEGRATION-001 | subscription service 統合 | **完了**（2026-03-22） | TASK-SC-02-RUNTIME-POLICY-CLOSURE で実装。`ISubscriptionAuthProvider.validateToken()` による実サブスクリプション判定を統合。3パターン分岐（integrated_api / terminal_handoff subscription / terminal_handoff no-auth）安定化 |
| TASK-SC-03 | Plan LLM プロンプト構築 | **完了**（2026-03-23） | plan() に LLM 呼び出し・JSON パース・型ガードを実装 |
| UT-EXEC-01 | ExecutionCapabilityStatus を chatSlice に統合 | 残課題 | |
| UT-EXEC-02 | resolveCapability ストリーミング/エラー状態結合テスト | 残課題 | |
| UT-EXEC-03 | CTA ラベル多言語対応設計 | 残課題 | |
| UT-SC-03-001 | IResourceLoader インターフェース抽出 | 残課題 | TASK-SC-03 派生。`docs/30-workflows/unassigned-task/UT-SC-03-001.md` |
| UT-SC-03-002 | 動的 apiKey 注入 | 残課題 | TASK-SC-03 派生。`docs/30-workflows/unassigned-task/UT-SC-03-002.md` |
| UT-SC-03-003 | DI 配線の実装 | **完了**（2026-03-24） | TASK-SC-03 派生。setLLMAdapter Setter Injection + ResourceLoader コンストラクタ注入 + fire-and-forget async LLMAdapter。`docs/30-workflows/completed-tasks/ut-sc-03-003-di-wiring/`。MINOR 2件: [UT-SC-03-003-M01](../../../docs/30-workflows/unassigned-task/UT-SC-03-003-M01-subscription-auth-provider-injection.md), [UT-SC-03-003-M02](../../../docs/30-workflows/unassigned-task/UT-SC-03-003-M02-test-type-cast-cleanup.md) |
| UT-SC-03-004 | SkillBlueprint 互換移行 | 残課題 | TASK-SC-03 派生。`docs/30-workflows/unassigned-task/UT-SC-03-004.md` |
| UT-SC-03-005 | plan() エラーハンドリングの Result<T,E> パターン移行 | 残課題 | TASK-SC-03 エレガント検証。`docs/30-workflows/unassigned-task/UT-SC-03-005.md` |
| UT-SC-03-006 | buildPlanSystemPrompt / parsePlanResponse 単体テスト追加 | 残課題 | TASK-SC-03 エレガント検証。`docs/30-workflows/unassigned-task/UT-SC-03-006.md` |
| UT-SC-03-007 | improve() P42 準拠バリデーション追加 | 残課題 | TASK-SC-03 エレガント検証。`docs/30-workflows/unassigned-task/UT-SC-03-007.md` |

## HealthPolicy 統合（TASK-IMP-HEALTH-POLICY-UNIFICATION-001）

> 完了日: 2026-03-25

### 設計概要

接続状態判定の統一ポリシーとして `HealthPolicy` インターフェースを導入し、`RuntimePolicyResolver` と `mainlineAccess.ts` が共通消費する設計。37ファイルに分散していた health check ロジックを `resolveHealthPolicy()` 純粋関数に集約。

### RuntimePolicyResolver への DI パターン（D-4）

コンストラクタ第3引数に `healthPolicy?: HealthPolicy` を optional DI で注入。

```typescript
constructor(
  private readonly authKeyService?: IAuthKeyService,
  private readonly subscriptionAuthProvider?: ISubscriptionAuthProvider,
  private readonly healthPolicy?: HealthPolicy,  // D-4
) {}
```

isDegraded チェックは resolve() の最初に実行され、P62 対策として degraded 時は integrated_api を一切返さない。

### mainlineAccess.ts での消費パターン（D-5）

`MainlineExecutionAccessInput` に `healthPolicy?: HealthPolicy` を追加。渡された場合は HealthPolicy から isConnectionAvailable / isDegraded を導出し、既存の healthStatus / apiKeyDegraded より優先する。

### HealthIndicator.tsx 表示統合（D-6）

`HealthIndicatorProps` に `healthPolicy?: HealthPolicy` を追加。`getStatusDisplay()` が healthPolicy を優先し、`healthPolicyDisplayMap` で4値ステータスを表示色・テキストにマッピング。

### 関連タスク

| タスクID | 内容 | ステータス | 備考 |
| --- | --- | --- | --- |
| TASK-IMP-HEALTH-POLICY-UNIFICATION-001 | HealthPolicy 統一インターフェース | **完了**（2026-03-25） | Gap-3 解消。38テスト全PASS |
| UT-HEALTH-POLICY-MAINLINE-MIGRATION-001 | useMainlineExecutionAccess 移行 | 残課題 | `docs/30-workflows/unassigned-task/UT-HEALTH-POLICY-MAINLINE-MIGRATION-001.md` |
| UT-HEALTH-POLICY-RUNTIME-INJECTION-001 | RuntimePolicyResolver 注入元実装 | **完了**（2026-04-07） | `docs/30-workflows/ut-health-policy-runtime-injection/` |
| UT-HEALTH-POLICY-DEPRECATED-REMOVAL-001 | @deprecated apiKeyDegraded 除去（v0.8.0） | 残課題 | `docs/30-workflows/unassigned-task/UT-HEALTH-POLICY-DEPRECATED-REMOVAL-001.md` |
