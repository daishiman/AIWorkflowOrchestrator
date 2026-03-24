# Phase 5: 実装（TDD GREEN フェーズ）

## メタ情報

| 項目     | 値                                      |
| -------- | --------------------------------------- |
| Phase    | 5                                       |
| 機能名   | uistate-contract-extension              |
| タスクID | TASK-IMP-UISTATE-CONTRACT-EXTENSION-001 |
| 作成日   | 2026-03-24                              |

## 目的

Phase 4 で作成した RED テストを全て GREEN にするため、Phase 2 設計書（D-1〜D-7）に完全準拠した実装を行う。UiState 型の 8 値拡張、CapabilityContext の optional フィールド追加、resolveUiState() / resolveCtaContract() の分岐ロジック更新、UiStateResult への handoffGuidance 追加、Guard 関数の追加、および後方互換性の維持を実施する。

## 前提成果物

| Phase | 成果物                        | パス                                                          |
| ----- | ----------------------------- | ------------------------------------------------------------- |
| 2     | 設計書（正本）                | [phase-2-design.md](./phase-2-design.md)                      |
| 4     | RED テスト（uistate-resolve） | `packages/shared/src/types/__tests__/uistate-resolve.test.ts` |
| 4     | RED テスト（contract-matrix） | `packages/shared/src/types/__tests__/contract-matrix.test.ts` |
| 4     | 既存テスト（CC-1〜CC-5）      | `packages/shared/src/types/__tests__/cta-contract.test.ts`    |

## 参照資料

| 資料名                  | パス / 説明                                                                                                 |
| ----------------------- | ----------------------------------------------------------------------------------------------------------- |
| Phase 2 設計書（正本）  | [phase-2-design.md](./phase-2-design.md)                                                                    |
| 主要変更対象            | `packages/shared/src/types/execution-capability.ts`                                                         |
| HandoffGuidance 型定義  | `packages/shared/src/types/handoff.ts`                                                                      |
| 画面状態マトリクス      | `docs/30-workflows/ai-runtime-execution-responsibility-realignment/ui-ux-realization.md#画面状態マトリクス` |
| 型安全ルール            | `.claude/rules/02-code-quality.md#TypeScript型安全`                                                         |
| P60 IPC wrapper 形式    | `.claude/rules/06-known-pitfalls.md#P60`（Phase 4/5 間の wrapper 形式合意不足）                             |
| P62 暗黙 fallback 禁止  | `.claude/rules/06-known-pitfalls.md#P62`                                                                    |
| P42 trim バリデーション | `.claude/rules/06-known-pitfalls.md#P42`                                                                    |
| DIP 設計原則            | `.claude/rules/06-known-pitfalls.md#P61`                                                                    |

## 実行タスク

### Task 1: UiState 型拡張（Phase 2 D-1 準拠）

**対象ファイル**: `packages/shared/src/types/execution-capability.ts`

**実装前の確認チェック**:

- [ ] 現在の UiState 型の定義（値名・数）を確認した
- [ ] Phase 2 D-1 の型定義と一致させる意図を理解した

Phase 2 D-1 の定義をそのまま実装する。既存 3 値（`ready` / `blocked` / `unavailable`）に 5 値を追加し、合計 8 値の union 型に拡張する。

```typescript
/**
 * UI 表示状態 8 値
 *
 * 既存 3 値（ready / blocked / unavailable）に
 * streaming / handoff / terminal-only / guidance-only / degraded を追加。
 *
 * @see phase-2-design.md D-1
 */
export type UiState =
  | "ready"
  | "blocked"
  | "unavailable"
  | "streaming"
  | "handoff"
  | "terminal-only"
  | "guidance-only"
  | "degraded";

export const UI_STATE_VALUES = [
  "ready",
  "blocked",
  "unavailable",
  "streaming",
  "handoff",
  "terminal-only",
  "guidance-only",
  "degraded",
] as const satisfies readonly UiState[];
```

**禁止値**: `idle`, `running`, `completed`, `error`, `handoff_pending` は UiState に含めない。

**後方互換性**: union 拡張は TypeScript の assignability 規則により既存コードの型エラーにはならない。ただし `switch` 文の `default` ケースで新値が fallthrough する箇所は lint / テストで検出すること。

### Task 2: AccessCapability 型の確認

**対象ファイル**: `packages/shared/src/types/execution-capability.ts`

AccessCapability が以下の 4 値で定義されていることを確認する（既存定義のままで変更不要）。

```typescript
export type AccessCapability =
  | "integratedRuntime"
  | "terminalSurface"
  | "both"
  | "none";
```

**禁止値**: `canExecute`, `canStream`, `canCancel`, `canRetry` は AccessCapability に含めない。

### Task 3: CapabilityContext 拡張（Phase 2 D-2 準拠）

**対象ファイル**: `packages/shared/src/types/execution-capability.ts`

Phase 2 D-2 の定義に基づき、既存フィールドを維持しつつ 4 つの optional フィールドを追加する。

```typescript
export interface CapabilityContext {
  // 既存フィールド（変更なし）
  capability: AccessCapability;
  isConnectionAvailable: boolean;
  isTerminalAvailable: boolean;
  hasResolutionAction: boolean;

  // 新規フィールド（全て optional でデフォルト false）
  // @see phase-2-design.md D-2
  isStreaming?: boolean;
  isHandoffRequired?: boolean;
  isDegraded?: boolean;
  hasAlternativeGuidance?: boolean;
}
```

**禁止フィールド名**: `isCompleted`, `isHandoffPending` は追加しない（Phase 2 D-2 に存在しない）。

**設計判断（Phase 2 D-2 より）**: 新フィールドを `optional` にすることで、既存の呼び出し元が `CapabilityContext` を構築する際にフィールド追加が不要。未指定時は `false` として扱う。

### Task 4: UiStateResult 拡張（Phase 2 D-4 準拠）

**対象ファイル**: `packages/shared/src/types/execution-capability.ts`

Phase 2 D-4 の定義に基づき、`handoffGuidance` フィールドを追加する。

```typescript
export interface UiStateResult {
  uiState: UiState;
  blockedReason?: string;
  blockedAction?: { label: string; targetRoute: string };
  /** handoff 状態で返す terminal 委譲ガイダンス
   * @see phase-2-design.md D-4
   */
  handoffGuidance?: HandoffGuidance;
}
```

`HandoffGuidance` は `packages/shared/src/types/handoff.ts` からインポートする。

### Task 5: resolveUiState() の 8 値分岐ロジック実装（Phase 2 D-3 準拠）

**対象ファイル**: `packages/shared/src/types/execution-capability.ts`

Phase 2 D-3 の擬似コードをそのまま実装する。評価優先順位（P1〜P8）を厳守し、P62 準拠で暗黙の fallback を行わない。

**実装前チェック（Phase 4 との整合性）**:

- [ ] Phase 4 のテストが期待する戻り値の型が `UiStateResult`（`{ uiState: UiState, ... }`）であることを確認した
- [ ] Phase 4 のテストが期待するフィールド名（`uiState`, `blockedReason`, `blockedAction`, `handoffGuidance`）と一致していることを確認した

```typescript
export function resolveUiState(context: CapabilityContext): UiStateResult {
  const {
    capability,
    isStreaming = false,
    isHandoffRequired = false,
    isDegraded = false,
    hasAlternativeGuidance = false,
    isTerminalAvailable,
    hasResolutionAction,
  } = context;

  // P1: streaming は最優先（実行中の表示状態）
  if (isStreaming) {
    return { uiState: "streaming" };
  }

  // P2: handoff（terminal へ委譲する条件が成立）
  if (
    isHandoffRequired &&
    (capability === "terminalSurface" || capability === "both")
  ) {
    return {
      uiState: "handoff",
      handoffGuidance: buildHandoffGuidance(context),
    };
  }

  // P3: terminal-only（terminal のみが利用可能）
  if (capability === "terminalSurface" && !isTerminalAvailable) {
    // terminal すら使えない場合は unavailable へ
    return { uiState: "unavailable" };
  }
  if (capability === "terminalSurface") {
    // handoff 条件不成立だが terminal のみ
    return { uiState: "terminal-only" };
  }

  // P4: degraded（capability ありだが品質低下。integratedRuntime/both で到達可能）
  if (isDegraded && capability !== "none") {
    return { uiState: "degraded" };
  }

  // P5: ready（通常の実行可能状態）
  if (capability === "integratedRuntime" || capability === "both") {
    return { uiState: "ready" };
  }

  // capability === "none" の分岐
  // P6: guidance-only
  if (hasAlternativeGuidance) {
    return { uiState: "guidance-only" };
  }

  // P7: blocked
  if (hasResolutionAction) {
    return {
      uiState: "blocked",
      blockedReason: "認証情報が設定されていません",
      blockedAction: { label: "設定を開く", targetRoute: "/settings" },
    };
  }

  // P8: unavailable（P62 準拠: 暗黙の fallback ではなく明示的なデフォルト）
  return {
    uiState: "unavailable",
    blockedReason: "利用可能な実行環境がありません",
  };
}
```

**禁止**: `error`, `running`, `completed`, `idle`, `handoff_pending` を返す分岐を追加しない。

### Task 6: resolveCtaContract() の新 5 状態 CTA マッピング実装（Phase 2 D-5 準拠）

**対象ファイル**: `packages/shared/src/types/execution-capability.ts`

既存 3 状態（`ready` / `blocked` / `unavailable`）のマッピングに加え、新 5 状態の CTA を Phase 2 D-5 に基づいて追加する。

`Record<UiState, CtaConfig>` 形式で網羅性を型レベルで保証する。

```typescript
// streaming 状態（Phase 2 D-5）
if (uiState === "streaming") {
  return {
    primary: { label: "停止", action: "stopStreaming" },
    secondary: { label: "最新へ移動", action: "scrollToLatest" },
  };
}

// handoff 状態（Phase 2 D-5）
if (uiState === "handoff") {
  return {
    primary: { label: "terminal を開く", action: "openTerminal" },
    secondary: { label: "コマンドをコピー", action: "copyCommandToClipboard" },
  };
}

// terminal-only 状態（Phase 2 D-5）
if (uiState === "terminal-only") {
  return {
    primary: { label: "terminal を開く", action: "openTerminal" },
    secondary: { label: "コマンドをコピー", action: "copyCommandToClipboard" },
  };
}

// guidance-only 状態（Phase 2 D-5）
if (uiState === "guidance-only") {
  return {
    primary: { label: "設定を見る", action: "openSettings" },
    secondary: { label: "ヘルプを表示", action: "openHelp" },
  };
}

// degraded 状態（Phase 2 D-5）
if (uiState === "degraded") {
  return {
    primary: { label: "manual fallback", action: "openManualFallback" },
    secondary: { label: "ヘルプを表示", action: "openHelp" },
  };
}
```

**到達不能セルの処理（Phase 2 設計書「到達不能セルの設計」準拠）**:

- 開発環境（`process.env.NODE_ENV !== "production"`）では `console.warn` でログを出力する
- production では `unavailable` の CTA を返す安全側フォールバックを行う
- 例外を投げない（Phase 4 Task 4 のガードテストが `not.toThrow()` を期待しているため）

### Task 7: Guard 関数実装（Phase 2 D-7 準拠）

**対象ファイル**: `packages/shared/src/types/execution-capability.ts`

Phase 2 D-7 の擬似コードをそのまま実装する。

```typescript
/**
 * streaming 状態で primary CTA が "停止" 以外であることを検証するガード
 * @see phase-2-design.md D-7
 */
export function assertStreamingCtaContract(
  uiState: UiState,
  ctaContract: CtaContract,
): void {
  if (uiState === "streaming" && ctaContract.primary?.label !== "停止") {
    throw new Error(
      "[assertStreamingCtaContract] streaming 状態では primary CTA は '停止' でなければなりません。",
    );
  }
}

/**
 * handoff 状態で handoffGuidance が存在することを検証するガード
 * @see phase-2-design.md D-7
 */
export function assertHandoffGuidanceExists(
  uiState: UiState,
  result: UiStateResult,
): void {
  if (uiState === "handoff" && !result.handoffGuidance) {
    throw new Error(
      "[assertHandoffGuidanceExists] handoff 状態では handoffGuidance が必須です。",
    );
  }
}
```

### Task 8: overload 2 の後方互換維持（Phase 2 D-6 準拠）

既存の overload 2（`resolveUiState(capability, conditions)`）を Phase 2 D-6 に基づき維持する。overload 2 は 3 値（`ready` / `blocked` / `unavailable`）のみを返す。

```typescript
// overload 1: 8 値対応（新しい呼び出し形式）
export function resolveUiState(context: CapabilityContext): UiStateResult;

// overload 2: 後方互換（3 値のみ）
// @deprecated - overload 1 への移行を推奨
export function resolveUiState(
  capability: AccessCapability,
  conditions: { hasCredentialPath: boolean },
): "ready" | "blocked" | "unavailable";
```

**新パラメータはすべて optional** にし、既存のコール元コードが変更なしで動作することを保証する。

## 関数シグネチャと戻り値型のチェックリスト

実装後、以下が Phase 2 設計書と一致していることを確認する:

| 関数                          | 引数型                      | 戻り値型        | Phase 2 参照 |
| ----------------------------- | --------------------------- | --------------- | ------------ |
| `resolveUiState()`            | `CapabilityContext`         | `UiStateResult` | D-3          |
| `resolveCtaContract()`        | `UiState, AccessCapability` | `CtaContract`   | D-5          |
| `assertStreamingCtaContract`  | `UiState, CtaContract`      | `void`（throw） | D-7          |
| `assertHandoffGuidanceExists` | `UiState, UiStateResult`    | `void`（throw） | D-7          |

## 成果物

| 成果物                     | パス                                                |
| -------------------------- | --------------------------------------------------- |
| UiState 型拡張実装         | `packages/shared/src/types/execution-capability.ts` |
| HandoffGuidance フィールド | `packages/shared/src/types/handoff.ts`（確認のみ）  |

## 統合テスト連携

本 Phase の成果物が他 Phase や他タスクのテストに影響する場合の確認事項:

| 確認項目                         | 確認方法                                                                    | 判定基準      |
| -------------------------------- | --------------------------------------------------------------------------- | ------------- |
| 既存テスト（CC-1〜CC-5）への影響 | `pnpm --filter @repo/shared vitest run`                                     | 全テスト PASS |
| Task B（HealthPolicy）との型整合 | TASK-IMP-HEALTH-POLICY-UNIFICATION-001 の CapabilityContext.isDegraded 参照 | 型定義が一致  |

## サブタスク管理

Phase 実行時に TaskCreate / TaskUpdate で進捗を管理する。

- [ ] Phase 開始時: TaskUpdate で status を `in_progress` に更新
- [ ] 各 Task 完了時: TaskUpdate で該当サブタスクを `completed` に更新
- [ ] Phase 完了時: 全サブタスクが `completed` であることを確認

## タスク100%実行確認【必須】

Phase 完了前に以下を確認する:

- [ ] 実行タスクの全項目が実施されている
- [ ] 成果物テーブルの全成果物が作成されている
- [ ] 完了条件の全チェックボックスがチェックされている
- [ ] 次 Phase への引き継ぎ事項が明確である

## 完了条件

- [ ] UiState 型が 8 値 `ready | blocked | unavailable | streaming | handoff | terminal-only | guidance-only | degraded` の union 型に拡張されている（`idle`, `running`, `completed`, `error`, `handoff_pending` は含まない）
- [ ] UI_STATE_VALUES 配列が上記 8 値を含んでいる
- [ ] AccessCapability が `integratedRuntime | terminalSurface | both | none` の 4 値である（`canExecute`, `canStream`, `canCancel`, `canRetry` は含まない）
- [ ] CapabilityContext に `isStreaming / isHandoffRequired / isDegraded / hasAlternativeGuidance` の 4 つの optional フィールドが追加されている（`isCompleted`, `isHandoffPending` は含まない）
- [ ] UiStateResult に `handoffGuidance?: HandoffGuidance` フィールドが追加されている
- [ ] resolveUiState() が Phase 2 D-3 の評価優先順位（P1: streaming → P2: handoff → P3: terminal-only → P4: degraded → P5: ready → P6: guidance-only → P7: blocked → P8: unavailable）を正しく実装している
- [ ] resolveCtaContract() が Phase 2 D-5 の全 5 状態 CTA マッピングを持つ（`stopStreaming`, `openTerminal`, `copyCommandToClipboard`, `openSettings`, `openHelp`, `openManualFallback`）
- [ ] `Record<UiState, ...>` で網羅性が型レベルで保証されている
- [ ] Guard 関数（assertStreamingCtaContract, assertHandoffGuidanceExists）が Phase 2 D-7 のシグネチャ・エラーメッセージプレフィックスで実装されている
- [ ] overload 2 の後方互換性が維持されている（Phase 2 D-6）
- [ ] Phase 4 の全テスト（uistate-resolve.test.ts, contract-matrix.test.ts の RED テスト）が GREEN（PASS）になっている
- [ ] 既存テスト CC-1〜CC-5 が引き続き PASS している
- [ ] `any` 型を使用していない
- [ ] P62 準拠: 暗黙の fallback を行っていない（全条件を明示的に評価）
- [ ] 到達不能セル処理が Phase 2 設計書「到達不能セルの設計」に準拠している（dev: warn、prod: safe fallback）

## 次Phase

[Phase 6: テスト拡充](./phase-6-test-augmentation.md)
