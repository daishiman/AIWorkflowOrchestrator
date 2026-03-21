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
| UT-IMP-RUNTIME-POLICY-SUBSCRIPTION-SERVICE-INTEGRATION-001 | subscription service 統合 | 残課題 | `resolveFromServices()` の `subscriptionValid` hardcode 解消 |
| UT-EXEC-01 | ExecutionCapabilityStatus を chatSlice に統合 | 残課題 | |
| UT-EXEC-02 | resolveCapability ストリーミング/エラー状態結合テスト | 残課題 | |
| UT-EXEC-03 | CTA ラベル多言語対応設計 | 残課題 | |
