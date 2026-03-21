# Phase 2: 設計 - タスク仕様書

## メタ情報

| 項目       | 内容                                          |
| ---------- | --------------------------------------------- |
| Phase      | 2                                             |
| Phase 名   | 設計                                          |
| タスクID   | TASK-IMP-RUNTIME-POLICY-CAPABILITY-BRIDGE-001 |
| 前提 Phase | Phase 1（要件定義）                           |
| 後続 Phase | Phase 3（設計レビュー）                       |
| ステータス | completed                                     |
| 作成日     | 2026-03-21                                    |
| 機能名     | runtime-policy-resolver-4state                |

## 目的

RuntimePolicyResolver.ts のリファクタリング後のインターフェース設計、呼び出し元の修正設計、語彙統一マッピング表を作成する。

## 実行タスク

- インターフェース設計: RuntimePolicyResolver の capability bridge 契約を定義する
- direct caller 設計: RuntimeSkillCreatorFacade と creatorHandlers の4状態分岐を定義する
- 語彙統一: 旧語彙から capability 語彙へのマッピング表を固定する
- 互換型設計: RuntimeDecision の移行形を direct caller 境界に限定する

## 参照資料

| 参照資料                  | パス                                                                     | 内容                 |
| ------------------------- | ------------------------------------------------------------------------ | -------------------- |
| Phase 1 成果物            | docs/30-workflows/runtime-policy-resolver-4state/phase-1-requirements.md | 語彙対応表・影響範囲 |
| execution-capability.ts   | packages/shared/src/types/execution-capability.ts                        | 4状態型定義          |
| RuntimePolicyResolver     | apps/desktop/src/main/services/runtime/RuntimePolicyResolver.ts          | 現状コード           |
| RuntimeSkillCreatorFacade | apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts      | 呼び出し元           |

## 実行手順

### ステップ1: RuntimePolicyResolver のリファクタリング後インターフェース設計

#### 1-1: 新しい resolve メソッドシグネチャ

```typescript
import {
  type AccessCapability,
  type ExecutionCapabilityInput,
  resolveCapability,
  assertNoSilentFallback,
} from "@repo/shared/types/execution-capability";

export interface IRuntimePolicyResolver {
  /**
   * ExecutionCapabilityInput から AccessCapability（4状態）を解決する。
   * capability が "none" のとき assertNoSilentFallback() が例外を throw する。
   */
  resolve(input: ExecutionCapabilityInput): AccessCapability;

  /**
   * authKeyService を使って入力を自動構築し、AccessCapability を解決するヘルパー。
   * assertNoSilentFallback は呼び出し元の判断で適用する（silent=true で抑制可能）。
   */
  resolveFromServices(options?: {
    silent?: boolean;
  }): Promise<AccessCapability>;
}
```

#### 1-2: RuntimeDecision 型の4状態対応

`RuntimeDecision` は `AccessCapability` に置換する。ただし、呼び出し元が `apiKey` や `TerminalHandoffBundle` を必要とする場面があるため、`RuntimeDecision` は段階的に廃止する。

```typescript
/**
 * 4状態対応の RuntimeDecision（移行期間中の互換型）
 *
 * Phase 5 実装時に AccessCapability + 付随データの組み合わせに再設計する。
 * 呼び出し元は capability フィールドでまず4状態を判定し、
 * その後 apiKey / bundle を参照する。
 */
export type RuntimeDecision =
  | { capability: "integratedRuntime"; apiKey: string; permissionMode?: string }
  | { capability: "terminalSurface"; bundle: TerminalHandoffBundle }
  | { capability: "both"; apiKey: string; bundle: TerminalHandoffBundle }
  | { capability: "none" }; // assertNoSilentFallback で到達しないが型として定義
```

#### 1-3: assertNoSilentFallback の組み込み位置

```
入力(ExecutionCapabilityInput)
  → resolveCapability(input)     ← packages/shared
  → assertNoSilentFallback(cap)  ← packages/shared（"none" で例外）
  → RuntimeDecision 構築         ← 付随データ（apiKey / bundle）を付与
  → return
```

### ステップ2: 呼び出し元の修正設計

#### 2-1: RuntimeSkillCreatorFacade の修正

現状: `plan(skillSpec, authMode, apiKey)` → `resolver.resolve(authMode, apiKey)`
修正後: `plan(skillSpec, input)` → `resolver.resolve(input)` → 4状態 switch

```typescript
// 修正前
async plan(
  skillSpec: string,
  authMode: AuthMode,
  apiKey: string | null,
): Promise<SkillPlanResult | { type: "terminal_handoff"; bundle: ... }>

// 修正後
async plan(
  skillSpec: string,
  input: ExecutionCapabilityInput,
): Promise<SkillPlanResult | { type: "terminal_handoff"; bundle: TerminalHandoffBundle }>
```

4状態ハンドリング（`switch` 文でのパターン）:

```typescript
const decision = this.resolver.resolve(input);
switch (decision.capability) {
  case "integratedRuntime":
    // integrated API で計画生成
    return { planId, skillSpec, estimatedSteps: 3 };
  case "terminalSurface":
    // terminal handoff bundle を返す
    return { type: "terminal_handoff", bundle: this.handoffBuilder.build(...) };
  case "both":
    // デフォルトで integrated を使用（secondary で terminal も利用可能）
    return { planId, skillSpec, estimatedSteps: 3 };
  case "none":
    // assertNoSilentFallback で到達しないが、型安全のため記述
    throw new Error("Unreachable: capability 'none' は assertNoSilentFallback で阻止される");
}
```

#### 2-2: creatorHandlers.ts の修正

現状: `args.authMode` を `RuntimeSkillCreatorFacade.plan()` に渡す
修正後: `args` から `ExecutionCapabilityInput` を構築して渡す

```typescript
// 修正前
const authMode: AuthMode = args.authMode ?? "api-key";

// 修正後
const input: ExecutionCapabilityInput = {
  apiKeyValid: typeof args.apiKey === "string" && args.apiKey.trim() !== "",
  subscriptionValid: args.authMode === "subscription",
  apiKeyDegraded: args.apiKeyDegraded ?? false,
};
```

### ステップ3: 語彙統一マッピング表（ファイル別）

#### RuntimePolicyResolver.ts

| 行  | 旧コード                                                                                      | 新コード                                                                                                                                                    |
| --- | --------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| L11 | `import type { AuthMode } from "@repo/shared/types/auth-mode"`                                | `import { resolveCapability, assertNoSilentFallback, type AccessCapability, type ExecutionCapabilityInput } from "@repo/shared/types/execution-capability"` |
| L42 | `resolve(authMode: AuthMode, apiKey: string \| null)`                                         | `resolve(input: ExecutionCapabilityInput): AccessCapability`                                                                                                |
| L31 | `type RuntimeDecision = { type: "integrated_api"; ... } \| { type: "terminal_handoff"; ... }` | 4状態対応 RuntimeDecision（ステップ1-2 参照）                                                                                                               |
| L58 | `async resolve(authMode, apiKey)` 本体                                                        | `resolveCapability(input)` + `assertNoSilentFallback()` に置換                                                                                              |
| L85 | `resolveWithService(authMode: AuthMode)`                                                      | `resolveFromServices(options?)` に置換                                                                                                                      |

#### RuntimeSkillCreatorFacade.ts

| 行   | 旧コード                             | 新コード                                   |
| ---- | ------------------------------------ | ------------------------------------------ |
| L18  | `import type { AuthMode }`           | `import type { ExecutionCapabilityInput }` |
| L68  | `authMode: AuthMode`                 | `input: ExecutionCapabilityInput`          |
| L77  | `resolver.resolve(authMode, apiKey)` | `resolver.resolve(input)`                  |
| L103 | `authMode: AuthMode, apiKey: string` | `input: ExecutionCapabilityInput`          |
| L145 | `authMode: AuthMode, apiKey: string` | `input: ExecutionCapabilityInput`          |

## 統合テスト連携

- direct caller suite: `apps/desktop/src/main/services/runtime/__tests__/RuntimePolicyResolver.test.ts` と `apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.test.ts` に直結する設計だけを扱う
- IPC boundary: `apps/desktop/src/main/ipc/creatorHandlers.ts` の入力正規化パターンを固定し、broader consumer は親タスクへ残す
- spec validator: `validate-phase-output` と `verify-all-specs --strict` が読める phase 参照と成果物パスをこの段階で整える

## 成果物

| 成果物                 | 配置先                                   |
| ---------------------- | ---------------------------------------- |
| インターフェース設計書 | 本ファイル（phase-2-design.md）ステップ1 |
| 呼び出し元修正設計書   | 本ファイル ステップ2                     |
| 語彙統一マッピング表   | 本ファイル ステップ3                     |

## 完了条件

- [ ] RuntimePolicyResolver のリファクタリング後インターフェースが設計されている
- [ ] RuntimeDecision 型の4状態対応が設計されている
- [ ] `assertNoSilentFallback()` の組み込み位置がパイプライン図で明示されている
- [ ] RuntimeSkillCreatorFacade の4状態 switch パターンが設計されている
- [x] creatorHandlers.ts の `ExecutionCapabilityInput` 構築パターンが設計されている
- [ ] 語彙統一マッピング表がファイル別に作成されている

## 次 Phase

Phase 3（設計レビュー）へ進む。
