# Phase 2: 設計

## メタ情報

| 項目   | 値                         |
| ------ | -------------------------- |
| Phase  | 2                          |
| 機能名 | uistate-contract-extension |
| 作成日 | 2026-03-24                 |

## 目的

Phase 1 で確定した 8 値 UiState と Contract Matrix を、既存コードの後方互換性を維持しつつ実装するためのアーキテクチャ設計を行う。

## 前提成果物

- Phase 1: [phase-1-requirements.md](./phase-1-requirements.md)
- 現行ソース: `packages/shared/src/types/execution-capability.ts`
- 現行テスト: `packages/shared/src/types/__tests__/cta-contract.test.ts`

## 参照資料

| 資料名                 | パス                                                                                                            | 内容                            |
| ---------------------- | --------------------------------------------------------------------------------------------------------------- | ------------------------------- |
| 画面状態マトリクス     | `docs/30-workflows/ai-runtime-execution-responsibility-realignment/ui-ux-realization.md#画面状態マトリクス`     | 8 値の表示ルール・CTA・禁止事項 |
| CTA 契約仕様           | `docs/30-workflows/ai-runtime-execution-responsibility-realignment/ui-ux-realization.md#CTA契約`                | primary 1 + secondary 1 の制約  |
| 実行責任 workflow 正本 | `.claude/skills/aiworkflow-requirements/references/workflow-ai-runtime-execution-responsibility-realignment.md` | 状態語彙定義の canonical        |
| HandoffGuidance 型     | `packages/shared/src/types/handoff.ts`                                                                          | handoff 状態で返す DTO 定義     |

### システム仕様（aiworkflow-requirements）

| 参照資料         | パス                                                                              | 内容                         |
| ---------------- | --------------------------------------------------------------------------------- | ---------------------------- |
| State management | `.claude/skills/aiworkflow-requirements/references/arch-state-management-core.md` | Renderer selector 境界       |
| Auth core        | `.claude/skills/aiworkflow-requirements/references/interfaces-auth-core.md`       | AuthModeStatus transport DTO |

## 設計方針

### D-1: UiState 型拡張（後方互換）

```typescript
/**
 * UI 表示状態 8 値
 *
 * 既存 3 値（ready / blocked / unavailable）に
 * streaming / handoff / terminal-only / guidance-only / degraded を追加。
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

**後方互換性**: 既存コードが `"ready" | "blocked" | "unavailable"` を参照している場合、ユニオン拡張は assignable のため TypeScript 型エラーにはならない。ただし `switch` 文の `default` ケースで新値が fallthrough する箇所は lint / テストで検出する。

### D-2: CapabilityContext 拡張

```typescript
export interface CapabilityContext {
  // 既存フィールド（変更なし）
  capability: AccessCapability;
  isConnectionAvailable: boolean;
  isTerminalAvailable: boolean;
  hasResolutionAction: boolean;

  // 新規フィールド（全て optional でデフォルト false）
  isStreaming?: boolean;
  isHandoffRequired?: boolean;
  isDegraded?: boolean;
  hasAlternativeGuidance?: boolean;
}
```

**設計判断**: 新フィールドを `optional` にすることで、既存の呼び出し元が `CapabilityContext` を構築する際にフィールド追加が不要。未指定時は `false` として扱う。

### D-3: resolveUiState() 拡張 - 評価優先順位

8 値への分岐は以下の **優先順位** で評価する（上位が先に評価される）:

```
優先度 1: streaming     (isStreaming === true)
優先度 2: handoff       (isHandoffRequired === true && capability includes terminalSurface)
優先度 3: terminal-only (capability === "terminalSurface" && !isConnectionAvailable)
優先度 4: degraded      (isDegraded === true && capability !== "none")
優先度 5: ready         (capability !== "none")
優先度 6: guidance-only (capability === "none" && hasAlternativeGuidance)
優先度 7: blocked       (capability === "none" && hasResolutionAction)
優先度 8: unavailable   (capability === "none" && !hasResolutionAction && !hasAlternativeGuidance)
```

**擬似コード**:

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

  // P4: degraded（legacy lane で品質低下）
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

  // P8: unavailable
  return {
    uiState: "unavailable",
    blockedReason: "利用可能な実行環境がありません",
  };
}
```

### D-4: UiStateResult 拡張

```typescript
export interface UiStateResult {
  uiState: UiState;
  blockedReason?: string;
  blockedAction?: { label: string; targetRoute: string };
  /** handoff 状態で返す terminal 委譲ガイダンス */
  handoffGuidance?: HandoffGuidance;
}
```

### D-5: resolveCtaContract() 拡張 - 新状態の CTA マッピング

Phase 1 の Contract Matrix に基づき、新 5 状態の CTA を追加する:

```typescript
// streaming 状態
if (uiState === "streaming") {
  return {
    primary: { label: "停止", action: "stopStreaming" },
    secondary: { label: "最新へ移動", action: "scrollToLatest" },
  };
}

// handoff 状態
if (uiState === "handoff") {
  return {
    primary: { label: "terminal を開く", action: "openTerminal" },
    secondary: { label: "コマンドをコピー", action: "copyCommandToClipboard" },
  };
}

// terminal-only 状態
if (uiState === "terminal-only") {
  return {
    primary: { label: "terminal を開く", action: "openTerminal" },
    secondary: { label: "コマンドをコピー", action: "copyCommandToClipboard" },
  };
}

// guidance-only 状態
if (uiState === "guidance-only") {
  return {
    primary: { label: "設定を見る", action: "openSettings" },
    secondary: { label: "ヘルプを表示", action: "openHelp" },
  };
}

// degraded 状態
if (uiState === "degraded") {
  return {
    primary: { label: "manual fallback", action: "openManualFallback" },
    secondary: { label: "ヘルプを表示", action: "openHelp" },
  };
}
```

### D-6: overload 2 の後方互換維持

既存の overload 2（`resolveUiState(capability, conditions)`）は 3 値のみ返す形で維持する。新しい 8 値を利用する場合は overload 1（`CapabilityContext` オブジェクト渡し）を使用する。

```typescript
// overload 2: 後方互換（3 値のみ）
export function resolveUiState(
  capability: AccessCapability,
  conditions: { hasCredentialPath: boolean },
): UiState; // 戻り値は "ready" | "blocked" | "unavailable" のみ
```

将来的に overload 2 には `@deprecated` タグを付与し、overload 1 への移行を促す。

### D-7: Guard 関数の拡張

```typescript
/**
 * streaming 状態で primary CTA が "停止" 以外であることを検証するガード
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

## 到達不能セルの設計

Contract Matrix で `-` とマークされた到達不能セルには、実行時ガードを設置する:

| 到達不能な組み合わせ              | 理由                                                                            | D-3 根拠        |
| --------------------------------- | ------------------------------------------------------------------------------- | --------------- |
| integratedRuntime × handoff       | P2 は `terminalSurface \| both` を要求                                          | P2 条件不成立   |
| integratedRuntime × terminal-only | P3 は `terminalSurface` のみ処理                                                | P3 条件不成立   |
| integratedRuntime × guidance-only | P5 が `integratedRuntime` で先に `ready` を返す                                 | P5 が P6 に優先 |
| terminalSurface × streaming       | terminal は app 内 streaming を持たない（意味的制約）                           | 意味的到達不能  |
| terminalSurface × guidance-only   | P3 が `terminalSurface` で先に `terminal-only`/`unavailable` を返す             | P3 が P6 に優先 |
| terminalSurface × degraded        | P3 が `terminalSurface` で先に処理するため P4 に到達しない                      | P3 が P4 に優先 |
| both × terminal-only              | P3 は `terminalSurface` のみ処理するため `both` では `terminal-only` にならない | P3 条件不成立   |
| both × guidance-only              | P5 が `both` で先に `ready` を返す                                              | P5 が P6 に優先 |
| none × ready                      | P5 は `integratedRuntime \| both` を要求                                        | P5 条件不成立   |
| none × streaming                  | 実行能力がないため streaming にならない（意味的制約）                           | 意味的到達不能  |
| none × handoff                    | P2 は `terminalSurface \| both` を要求                                          | P2 条件不成立   |
| none × terminal-only              | P3 は `terminalSurface` のみ処理                                                | P3 条件不成立   |
| none × degraded                   | P4 は `capability !== "none"` を要求するため `none` では到達不能                | P4 条件不成立   |

**合計: 13 セル**（到達可能: 19 セル）

**補足: degraded の到達可能性について**

D-3 コードの P4 条件 `isDegraded && capability !== "none"` により、`degraded` は `integratedRuntime` および `both` で到達可能である。`terminalSurface` では P3 が先に処理するため到達不能。`none` では P4 条件の `capability !== "none"` を満たさないため到達不能。

`resolveCtaContract()` がこれらの組み合わせを受け取った場合、開発環境では `console.warn` でログを出力し、production では `unavailable` の CTA を返す安全側フォールバックを行う。

## ファイル変更計画

| ファイル                                                      | 変更内容                                         | 変更量     |
| ------------------------------------------------------------- | ------------------------------------------------ | ---------- |
| `packages/shared/src/types/execution-capability.ts`           | UiState 拡張 + CapabilityContext 拡張 + ロジック | 大（主要） |
| `packages/shared/src/types/__tests__/cta-contract.test.ts`    | 新状態のテストケース追加                         | 大         |
| `packages/shared/src/types/__tests__/uistate-resolve.test.ts` | 新規: resolveUiState 8 値テスト                  | 新規       |
| `packages/shared/src/types/__tests__/contract-matrix.test.ts` | 新規: 全 32 セル + 到達不能セルテスト            | 新規       |

## 移行戦略

### Phase 1: 型拡張（本タスク）

1. `UiState` 型を 8 値に拡張
2. `CapabilityContext` に optional フィールドを追加
3. `resolveUiState()` overload 1 を 8 値対応に拡張
4. `resolveCtaContract()` を 8 値対応に拡張
5. 既存テスト（CC-1〜CC-5）が全て PASS することを確認
6. 新規 Contract Matrix テスト（全 32 セル）を追加

### Phase 2: 下流消費（別タスク）

- Renderer 側の selector / hook が新 UiState を消費
- UI コンポーネント（GuidanceBlock, HandoffCard 等）の実装
- `HealthPolicy` からの `isDegraded` 供給（TASK-IMP-HEALTH-POLICY-UNIFICATION-001）

## 成果物

| 成果物                   | パス                                  | 内容                        |
| ------------------------ | ------------------------------------- | --------------------------- |
| 設計書（本ドキュメント） | `outputs/phase-2/design-document.md`  | アーキテクチャ設計の全体像  |
| 優先順位図               | `outputs/phase-2/priority-diagram.md` | resolveUiState 評価優先順位 |
| ファイル変更計画         | `outputs/phase-2/change-plan.md`      | 変更対象ファイルと変更量    |

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

- [ ] UiState 8 値の型設計が確定している
- [ ] CapabilityContext の拡張フィールドが optional で設計されている
- [ ] resolveUiState() の評価優先順位が定義されている
- [ ] resolveCtaContract() の新 5 状態の CTA マッピングが定義されている
- [ ] 到達不能セルの処理方針が定義されている
- [ ] 後方互換性の維持方針が明確である
- [ ] ファイル変更計画が作成されている

## 次Phase

Phase 3: [phase-3-design-review.md](./phase-3-design-review.md)
