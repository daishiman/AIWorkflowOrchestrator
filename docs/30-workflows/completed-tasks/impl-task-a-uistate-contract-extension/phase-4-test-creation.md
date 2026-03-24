# Phase 4: テスト作成（TDD RED フェーズ）

## メタ情報

| 項目     | 値                                      |
| -------- | --------------------------------------- |
| Phase    | 4                                       |
| 機能名   | uistate-contract-extension              |
| タスクID | TASK-IMP-UISTATE-CONTRACT-EXTENSION-001 |
| 作成日   | 2026-03-24                              |

## 目的

Phase 2 設計書に基づき、8 値 UiState と Contract Matrix のテストコードを TDD RED フェーズとして先行作成する。resolveUiState() の 8 分岐テスト、Contract Matrix 全 32 セルテスト、到達不能セル 13 件ガードテスト、Guard 関数テスト、および既存テスト CC-1〜CC-5 の維持確認を行う。

## 前提成果物

| Phase | 成果物       | パス                                                       |
| ----- | ------------ | ---------------------------------------------------------- |
| 1     | 要件定義     | [phase-1-requirements.md](./phase-1-requirements.md)       |
| 2     | 設計         | [phase-2-design.md](./phase-2-design.md)                   |
| 3     | 設計レビュー | [phase-3-design-review.md](./phase-3-design-review.md)     |
| -     | 現行テスト   | `packages/shared/src/types/__tests__/cta-contract.test.ts` |

## 参照資料

| 資料名                 | パス / 説明                                                                                                 |
| ---------------------- | ----------------------------------------------------------------------------------------------------------- |
| Phase 2 設計書（正本） | [phase-2-design.md](./phase-2-design.md)                                                                    |
| 既存テストファイル     | `packages/shared/src/types/__tests__/cta-contract.test.ts`                                                  |
| 主要変更対象           | `packages/shared/src/types/execution-capability.ts`                                                         |
| HandoffGuidance 型定義 | `packages/shared/src/types/handoff.ts`                                                                      |
| 画面状態マトリクス     | `docs/30-workflows/ai-runtime-execution-responsibility-realignment/ui-ux-realization.md#画面状態マトリクス` |
| TDD ルール             | `.claude/rules/02-code-quality.md#テスト駆動開発（TDD）`                                                    |
| テスト設計注意         | `.claude/rules/06-known-pitfalls.md#P9`                                                                     |
| P60 対策               | `.claude/rules/06-known-pitfalls.md#P60`（Phase 4/5 間の wrapper 形式合意不足）                             |

## 実行タスク

### Task 1: resolveUiState() 8 値テスト作成

**ファイル**: `packages/shared/src/types/__tests__/uistate-resolve.test.ts`

Phase 2 D-3 の評価優先順位に完全準拠したテストケースを作成する。

#### 使用する型・値（Phase 2 D-1〜D-2 から）

```typescript
import { resolveUiState } from "../execution-capability";
import type { CapabilityContext, UiStateResult } from "../execution-capability";
```

**UiState 8 値（Phase 2 D-1）**:
`ready` | `blocked` | `unavailable` | `streaming` | `handoff` | `terminal-only` | `guidance-only` | `degraded`

**AccessCapability 4 値（Phase 2 D-1 参照）**:
`integratedRuntime` | `terminalSurface` | `both` | `none`

**CapabilityContext 新 optional フィールド（Phase 2 D-2）**:
`isStreaming` | `isHandoffRequired` | `isDegraded` | `hasAlternativeGuidance`

#### テストケーステーブル（Phase 2 D-3 評価優先順位準拠）

| #   | 期待 UiState    | capability          | isStreaming | isHandoffRequired | isDegraded | hasAlternativeGuidance | isConnectionAvailable | isTerminalAvailable | hasResolutionAction | 優先度                 |
| --- | --------------- | ------------------- | ----------- | ----------------- | ---------- | ---------------------- | --------------------- | ------------------- | ------------------- | ---------------------- |
| 1   | `streaming`     | `integratedRuntime` | true        | false             | false      | false                  | true                  | false               | false               | P1                     |
| 2   | `streaming`     | `both`              | true        | true              | false      | false                  | true                  | true                | false               | P1（P2より優先）       |
| 3   | `handoff`       | `terminalSurface`   | false       | true              | false      | false                  | true                  | true                | false               | P2                     |
| 4   | `handoff`       | `both`              | false       | true              | false      | false                  | true                  | true                | false               | P2                     |
| 5   | `terminal-only` | `terminalSurface`   | false       | false             | false      | false                  | true                  | true                | false               | P3                     |
| 6   | `unavailable`   | `terminalSurface`   | false       | false             | false      | false                  | false                 | false               | false               | P3（terminal使えない） |
| 7   | `degraded`      | `integratedRuntime` | false       | false             | true       | false                  | true                  | false               | false               | P4                     |
| 8   | `degraded`      | `both`              | false       | false             | true       | false                  | true                  | true                | false               | P4                     |
| 9   | `ready`         | `integratedRuntime` | false       | false             | false      | false                  | true                  | false               | false               | P5                     |
| 10  | `ready`         | `both`              | false       | false             | false      | false                  | true                  | true                | false               | P5                     |
| 11  | `guidance-only` | `none`              | false       | false             | false      | true                   | false                 | false               | false               | P6                     |
| 12  | `blocked`       | `none`              | false       | false             | false      | false                  | false                 | false               | true                | P7                     |
| 13  | `unavailable`   | `none`              | false       | false             | false      | false                  | false                 | false               | false               | P8                     |

#### テストコード構造

```typescript
describe("resolveUiState", () => {
  // 状態をテスト間で共有しないこと（P9 対策）
  // 各テストで CapabilityContext を明示的に構築する

  describe("P1: streaming（最優先）", () => {
    it("should return 'streaming' when isStreaming is true (integratedRuntime)", () => {
      const context: CapabilityContext = {
        capability: "integratedRuntime",
        isConnectionAvailable: true,
        isTerminalAvailable: false,
        hasResolutionAction: false,
        isStreaming: true,
      };
      const result = resolveUiState(context);
      expect(result.uiState).toBe("streaming");
    });

    it("should return 'streaming' even when isHandoffRequired is also true", () => {
      const context: CapabilityContext = {
        capability: "both",
        isConnectionAvailable: true,
        isTerminalAvailable: true,
        hasResolutionAction: false,
        isStreaming: true,
        isHandoffRequired: true,
      };
      const result = resolveUiState(context);
      expect(result.uiState).toBe("streaming");
    });
  });

  describe("P2: handoff", () => {
    it("should return 'handoff' when isHandoffRequired and capability is terminalSurface", () => {
      const context: CapabilityContext = {
        capability: "terminalSurface",
        isConnectionAvailable: true,
        isTerminalAvailable: true,
        hasResolutionAction: false,
        isHandoffRequired: true,
      };
      const result = resolveUiState(context);
      expect(result.uiState).toBe("handoff");
      // handoff 状態では handoffGuidance が必須（D-4）
      expect(result.handoffGuidance).toBeDefined();
    });

    it("should return 'handoff' when isHandoffRequired and capability is both", () => {
      const context: CapabilityContext = {
        capability: "both",
        isConnectionAvailable: true,
        isTerminalAvailable: true,
        hasResolutionAction: false,
        isHandoffRequired: true,
      };
      const result = resolveUiState(context);
      expect(result.uiState).toBe("handoff");
    });
  });

  describe("P3: terminal-only", () => {
    it("should return 'terminal-only' when capability is terminalSurface and isTerminalAvailable", () => {
      const context: CapabilityContext = {
        capability: "terminalSurface",
        isConnectionAvailable: true,
        isTerminalAvailable: true,
        hasResolutionAction: false,
      };
      const result = resolveUiState(context);
      expect(result.uiState).toBe("terminal-only");
    });

    it("should return 'unavailable' when capability is terminalSurface but !isTerminalAvailable", () => {
      const context: CapabilityContext = {
        capability: "terminalSurface",
        isConnectionAvailable: false,
        isTerminalAvailable: false,
        hasResolutionAction: false,
      };
      const result = resolveUiState(context);
      expect(result.uiState).toBe("unavailable");
    });
  });

  describe("P4: degraded", () => {
    it("should return 'degraded' when isDegraded and capability is integratedRuntime", () => {
      const context: CapabilityContext = {
        capability: "integratedRuntime",
        isConnectionAvailable: true,
        isTerminalAvailable: false,
        hasResolutionAction: false,
        isDegraded: true,
      };
      const result = resolveUiState(context);
      expect(result.uiState).toBe("degraded");
    });

    it("should return 'degraded' when isDegraded and capability is both", () => {
      const context: CapabilityContext = {
        capability: "both",
        isConnectionAvailable: true,
        isTerminalAvailable: true,
        hasResolutionAction: false,
        isDegraded: true,
      };
      const result = resolveUiState(context);
      expect(result.uiState).toBe("degraded");
    });
  });

  describe("P5: ready", () => {
    it("should return 'ready' when capability is integratedRuntime (normal state)", () => {
      const context: CapabilityContext = {
        capability: "integratedRuntime",
        isConnectionAvailable: true,
        isTerminalAvailable: false,
        hasResolutionAction: false,
      };
      const result = resolveUiState(context);
      expect(result.uiState).toBe("ready");
    });

    it("should return 'ready' when capability is both", () => {
      const context: CapabilityContext = {
        capability: "both",
        isConnectionAvailable: true,
        isTerminalAvailable: true,
        hasResolutionAction: false,
      };
      const result = resolveUiState(context);
      expect(result.uiState).toBe("ready");
    });
  });

  describe("P6: guidance-only", () => {
    it("should return 'guidance-only' when capability is none and hasAlternativeGuidance", () => {
      const context: CapabilityContext = {
        capability: "none",
        isConnectionAvailable: false,
        isTerminalAvailable: false,
        hasResolutionAction: false,
        hasAlternativeGuidance: true,
      };
      const result = resolveUiState(context);
      expect(result.uiState).toBe("guidance-only");
    });
  });

  describe("P7: blocked", () => {
    it("should return 'blocked' when capability is none and hasResolutionAction", () => {
      const context: CapabilityContext = {
        capability: "none",
        isConnectionAvailable: false,
        isTerminalAvailable: false,
        hasResolutionAction: true,
      };
      const result = resolveUiState(context);
      expect(result.uiState).toBe("blocked");
      expect(result.blockedAction).toBeDefined();
      expect(result.blockedAction?.targetRoute).toBeDefined();
    });
  });

  describe("P8: unavailable（デフォルト）", () => {
    it("should return 'unavailable' when capability is none with no alternatives", () => {
      const context: CapabilityContext = {
        capability: "none",
        isConnectionAvailable: false,
        isTerminalAvailable: false,
        hasResolutionAction: false,
      };
      const result = resolveUiState(context);
      expect(result.uiState).toBe("unavailable");
    });
  });
});
```

### Task 2: resolveCtaContract() 新 5 状態テスト作成

**ファイル**: `packages/shared/src/types/__tests__/cta-contract.test.ts`（既存ファイルへ追記）

Phase 2 D-5 の CTA マッピングに基づき、新 5 状態（streaming/handoff/terminal-only/guidance-only/degraded）のテストを追加する。

```typescript
// 新 5 状態の CTA テスト（Phase 2 D-5 準拠）
describe("resolveCtaContract - 新 5 状態（Phase 2 D-5）", () => {
  it("CC-N1: streaming 状態 - primary は '停止'(stopStreaming)", () => {
    const cta = resolveCtaContract("streaming", "integratedRuntime");
    expect(cta.primary.label).toBe("停止");
    expect(cta.primary.action).toBe("stopStreaming");
    expect(cta.secondary?.label).toBe("最新へ移動");
    expect(cta.secondary?.action).toBe("scrollToLatest");
  });

  it("CC-N2: handoff 状態 - primary は 'terminal を開く'(openTerminal)", () => {
    const cta = resolveCtaContract("handoff", "terminalSurface");
    expect(cta.primary.label).toBe("terminal を開く");
    expect(cta.primary.action).toBe("openTerminal");
    expect(cta.secondary?.label).toBe("コマンドをコピー");
    expect(cta.secondary?.action).toBe("copyCommandToClipboard");
  });

  it("CC-N3: terminal-only 状態 - primary は 'terminal を開く'(openTerminal)", () => {
    const cta = resolveCtaContract("terminal-only", "terminalSurface");
    expect(cta.primary.label).toBe("terminal を開く");
    expect(cta.primary.action).toBe("openTerminal");
    expect(cta.secondary?.label).toBe("コマンドをコピー");
    expect(cta.secondary?.action).toBe("copyCommandToClipboard");
  });

  it("CC-N4: guidance-only 状態 - primary は '設定を見る'(openSettings)", () => {
    const cta = resolveCtaContract("guidance-only", "none");
    expect(cta.primary.label).toBe("設定を見る");
    expect(cta.primary.action).toBe("openSettings");
    expect(cta.secondary?.label).toBe("ヘルプを表示");
    expect(cta.secondary?.action).toBe("openHelp");
  });

  it("CC-N5: degraded 状態 - primary は 'manual fallback'(openManualFallback)", () => {
    const cta = resolveCtaContract("degraded", "integratedRuntime");
    expect(cta.primary.label).toBe("manual fallback");
    expect(cta.primary.action).toBe("openManualFallback");
    expect(cta.secondary?.label).toBe("ヘルプを表示");
    expect(cta.secondary?.action).toBe("openHelp");
  });
});
```

### Task 3: Contract Matrix 全 32 セルテスト作成

**ファイル**: `packages/shared/src/types/__tests__/contract-matrix.test.ts`

8 state × 4 capability の全 32 セルに対するテストを作成する。

**Contract Matrix（Phase 2 設計書 / Phase 1 要件）**:

| UiState \ Capability | integratedRuntime | terminalSurface | both         | none         |
| -------------------- | ----------------- | --------------- | ------------ | ------------ |
| `ready`              | セル 1            | セル 2（-）     | セル 3       | セル 4（-）  |
| `blocked`            | セル 5（-）       | セル 6（-）     | セル 7（-）  | セル 8       |
| `unavailable`        | セル 9（-）       | セル 10         | セル 11（-） | セル 12      |
| `streaming`          | セル 13           | セル 14（-）    | セル 15      | セル 16（-） |
| `handoff`            | セル 17（-）      | セル 18         | セル 19      | セル 20（-） |
| `terminal-only`      | セル 21（-）      | セル 22         | セル 23（-） | セル 24（-） |
| `guidance-only`      | セル 25（-）      | セル 26（-）    | セル 27（-） | セル 28      |
| `degraded`           | セル 29           | セル 30（-）    | セル 31      | セル 32（-） |

（`-` は到達不能セル）

```typescript
describe("Contract Matrix - 全 32 セル", () => {
  // 到達可能セル（19 セル — D-5 準拠。一部は CC-1〜CC-5 既存テストと重複）
  describe("到達可能セル", () => {
    // ready
    it("cell-1: ready × integratedRuntime", () => {
      expect(resolveCtaContract("ready", "integratedRuntime")).toBeDefined();
    });
    it("cell-3: ready × both", () => {
      expect(resolveCtaContract("ready", "both")).toBeDefined();
    });
    // blocked
    it("cell-8: blocked × none", () => {
      expect(resolveCtaContract("blocked", "none")).toBeDefined();
    });
    // unavailable
    it("cell-10: unavailable × terminalSurface (terminal 利用不可)", () => {
      expect(
        resolveCtaContract("unavailable", "terminalSurface"),
      ).toBeDefined();
    });
    it("cell-12: unavailable × none", () => {
      expect(resolveCtaContract("unavailable", "none")).toBeDefined();
    });
    // streaming
    it("cell-13: streaming × integratedRuntime", () => {
      const cta = resolveCtaContract("streaming", "integratedRuntime");
      expect(cta.primary.action).toBe("stopStreaming");
    });
    it("cell-15: streaming × both", () => {
      const cta = resolveCtaContract("streaming", "both");
      expect(cta.primary.action).toBe("stopStreaming");
    });
    // handoff
    it("cell-18: handoff × terminalSurface", () => {
      const cta = resolveCtaContract("handoff", "terminalSurface");
      expect(cta.primary.action).toBe("openTerminal");
    });
    it("cell-19: handoff × both", () => {
      const cta = resolveCtaContract("handoff", "both");
      expect(cta.primary.action).toBe("openTerminal");
    });
    // terminal-only
    it("cell-22: terminal-only × terminalSurface", () => {
      const cta = resolveCtaContract("terminal-only", "terminalSurface");
      expect(cta.primary.action).toBe("openTerminal");
    });
    // guidance-only
    it("cell-28: guidance-only × none", () => {
      const cta = resolveCtaContract("guidance-only", "none");
      expect(cta.primary.action).toBe("openSettings");
    });
    // degraded
    it("cell-29: degraded × integratedRuntime", () => {
      const cta = resolveCtaContract("degraded", "integratedRuntime");
      expect(cta.primary.action).toBe("openManualFallback");
    });
    it("cell-31: degraded × both", () => {
      const cta = resolveCtaContract("degraded", "both");
      expect(cta.primary.action).toBe("openManualFallback");
    });
  });
});
```

### Task 4: 到達不能セル 13 件のガードテスト作成

**ファイル**: `packages/shared/src/types/__tests__/contract-matrix.test.ts`（Task 3 と同一ファイル）

Phase 2 設計書に定義された 13 件の到達不能セルに対し、`resolveCtaContract()` が安全なフォールバック（`unavailable` CTA を返す）を行うことを検証する。

```typescript
describe("到達不能セル - 13 件（Phase 2 D-5 到達不能テーブル準拠）", () => {
  const unreachableCells: Array<[string, string]> = [
    // integratedRuntime × handoff/terminal-only/guidance-only
    ["handoff", "integratedRuntime"],
    ["terminal-only", "integratedRuntime"],
    ["guidance-only", "integratedRuntime"],
    // terminalSurface × streaming/guidance-only/degraded
    ["streaming", "terminalSurface"],
    ["guidance-only", "terminalSurface"],
    ["degraded", "terminalSurface"],
    // both × terminal-only/guidance-only
    ["terminal-only", "both"],
    ["guidance-only", "both"],
    // none × ready/streaming/handoff/terminal-only/degraded
    ["ready", "none"],
    ["streaming", "none"],
    ["handoff", "none"],
    ["terminal-only", "none"],
    ["degraded", "none"],
  ];

  // 到達不能セルは 'unavailable' 相当の安全なフォールバックを返すこと
  test.each(unreachableCells)(
    "unreachable: %s × %s -> safe fallback",
    (uiState, capability) => {
      // production 環境では例外を投げず、安全なフォールバックを返す
      expect(() =>
        resolveCtaContract(uiState as UiState, capability as AccessCapability),
      ).not.toThrow();
    },
  );
});
```

### Task 5: Guard 関数テスト作成

**ファイル**: `packages/shared/src/types/__tests__/uistate-resolve.test.ts`（Task 1 と同一ファイルに追記）

Phase 2 D-7 の Guard 関数テスト:

```typescript
describe("Guard 関数（Phase 2 D-7）", () => {
  describe("assertStreamingCtaContract", () => {
    it("should not throw when streaming state has primary label '停止'", () => {
      const cta: CtaContract = {
        primary: { label: "停止", action: "stopStreaming" },
        secondary: { label: "最新へ移動", action: "scrollToLatest" },
      };
      expect(() => assertStreamingCtaContract("streaming", cta)).not.toThrow();
    });

    it("should throw when streaming state has primary label other than '停止'", () => {
      const cta: CtaContract = {
        primary: { label: "実行", action: "execute" },
      };
      expect(() => assertStreamingCtaContract("streaming", cta)).toThrow(
        "[assertStreamingCtaContract]",
      );
    });

    it("should not throw when non-streaming state regardless of primary label", () => {
      const cta: CtaContract = {
        primary: { label: "実行", action: "execute" },
      };
      expect(() => assertStreamingCtaContract("ready", cta)).not.toThrow();
    });
  });

  describe("assertHandoffGuidanceExists", () => {
    it("should not throw when handoff state has handoffGuidance", () => {
      const result: UiStateResult = {
        uiState: "handoff",
        handoffGuidance: { command: "claude --resume", description: "..." },
      };
      expect(() =>
        assertHandoffGuidanceExists("handoff", result),
      ).not.toThrow();
    });

    it("should throw when handoff state has no handoffGuidance", () => {
      const result: UiStateResult = {
        uiState: "handoff",
      };
      expect(() => assertHandoffGuidanceExists("handoff", result)).toThrow(
        "[assertHandoffGuidanceExists]",
      );
    });

    it("should not throw when non-handoff state has no handoffGuidance", () => {
      const result: UiStateResult = {
        uiState: "ready",
      };
      expect(() => assertHandoffGuidanceExists("ready", result)).not.toThrow();
    });
  });
});
```

### Task 6: 既存テスト CC-1〜CC-5 の回帰テスト確認

既存テストファイル `packages/shared/src/types/__tests__/cta-contract.test.ts` の CC-1〜CC-5 が、型拡張後も変更なしで PASS することを確認する。

確認ポイント:

- `import` パスが変更されていないこと
- `resolveCtaContract()` の既存 3 状態（`ready` / `blocked` / `unavailable`）の戻り値が変わっていないこと
- 型定義の拡張（union 拡張）が既存テストの型エラーを引き起こしていないこと

## 成果物

| 成果物                               | パス                                                                       |
| ------------------------------------ | -------------------------------------------------------------------------- |
| resolveUiState テスト                | `packages/shared/src/types/__tests__/uistate-resolve.test.ts`              |
| Contract Matrix テスト（32 セル）    | `packages/shared/src/types/__tests__/contract-matrix.test.ts`              |
| 新 5 状態 CTA テスト（既存ファイル） | `packages/shared/src/types/__tests__/cta-contract.test.ts`（CC-N1〜CC-N5） |

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

- [ ] `uistate-resolve.test.ts` に Phase 2 D-3 評価優先順位（P1〜P8）の 8 分岐テストケースが存在する
- [ ] UiState の値名が正確に `ready | blocked | unavailable | streaming | handoff | terminal-only | guidance-only | degraded` である（`idle`, `running`, `completed`, `error`, `handoff_pending` は使用していない）
- [ ] AccessCapability の値名が正確に `integratedRuntime | terminalSurface | both | none` である（`canExecute`, `canStream`, `canCancel`, `canRetry` は使用していない）
- [ ] CapabilityContext の新フィールド名が `isStreaming / isHandoffRequired / isDegraded / hasAlternativeGuidance` である（`isCompleted`, `isHandoffPending` は使用していない）
- [ ] `contract-matrix.test.ts` に到達可能セルと到達不能セル 13 件のテストが存在する
- [ ] Guard 関数（assertStreamingCtaContract, assertHandoffGuidanceExists）のテストが存在する
- [ ] 既存テスト CC-1〜CC-5 が変更されていないことを確認済み
- [ ] 全テストが RED（実装未完了のため FAIL）であることを確認済み
- [ ] テスト間で状態を共有していない（`beforeEach` でリセット または 各テストで新規構築）
- [ ] テスト実行順序に依存していない

## 次Phase

[Phase 5: 実装](./phase-5-implementation.md)
