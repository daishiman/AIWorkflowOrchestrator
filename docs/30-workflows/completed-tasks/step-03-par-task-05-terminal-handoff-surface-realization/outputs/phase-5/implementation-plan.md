# Phase 5 成果物: 実装計画

## メタ情報

| 項目       | 内容                                               |
| ---------- | -------------------------------------------------- |
| タスクID   | TASK-IMP-TERMINAL-HANDOFF-SURFACE-REALIZATION-001  |
| Phase      | 5                                                  |
| 成果物種別 | 実装計画                                           |
| 作成日     | 2026-03-22                                         |
| 依存成果物 | phase-2/contract-matrix.md, phase-4/test-matrix.md |

---

## 1. 実装タスク一覧

### タスク 1: toHandoffGuidance() adapter 追加 (MN-1 対応)

**対象ファイル**: `packages/shared/src/types/handoff.ts`

**目的**: `SkillDocsCapabilityResult` を `HandoffGuidance` に変換するアダプター関数を追加する。guidance-only / terminal-handoff パスの DTO 統一を実現する。

**実装内容**:

```typescript
// packages/shared/src/types/handoff.ts

export interface HandoffGuidance {
  terminalCommand: string;
  contextSummary: string;
  reason: string;
}

/**
 * SkillDocsCapabilityResult を HandoffGuidance に変換する。
 * integrated-api の場合は handoff 不要のため null を返す。
 *
 * @param result - SkillDocsCapabilityResult
 * @returns HandoffGuidance | null
 */
export function toHandoffGuidance(
  result: SkillDocsCapabilityResult,
): HandoffGuidance | null {
  if (result.capability === "guidance-only") {
    return {
      terminalCommand: "claude docs generate",
      contextSummary: result.guidance ?? "API key を設定してください",
      reason: "guidance-only: LLM provider 未設定",
    };
  }
  if (result.capability === "terminal-handoff") {
    return {
      terminalCommand: "claude docs generate",
      contextSummary: `terminal-handoff: ${result.reason ?? "LLM 到達不可"}`,
      reason: result.reason ?? "LLM 到達不可",
    };
  }
  // integrated-api: handoff 不要
  return null;
}
```

**完了条件**:

- UT-A-1〜6 が全 PASS すること
- `terminalCommand` に API key パターンが含まれないこと (NFR-1a)
- 関数が `packages/shared` から export されること (NFR-2b)

**禁止事項**:

- `any` 型の使用
- `as` によるキャストでバリデーション回避 (P19 対策)

---

### タスク 2: TerminalHandoffBuilder に buildForSurface() 統一メソッド追加

**対象ファイル**: `apps/desktop/src/main/services/runtime/TerminalHandoffBuilder.ts`

**目的**: `TerminalHandoffBundle` → `HandoffGuidance` への変換を担う統一メソッドを提供し、全 consumer が同一インターフェースで HandoffGuidance を取得できるようにする。

**実装内容**:

```typescript
// apps/desktop/src/main/services/runtime/TerminalHandoffBuilder.ts

import type { HandoffGuidance } from "@repo/shared/types/handoff";

export class TerminalHandoffBuilder {
  // 既存メソッド...

  /**
   * TerminalHandoffBundle を HandoffGuidance に変換する。
   * IPC 非通過型 (TerminalHandoffBundle) を IPC 通過型 (HandoffGuidance) に変換する統一エントリポイント。
   *
   * @param bundle - Main Process 内部型（Renderer には渡さない）
   * @param surfaceType - 変換元のsurface種別 ("agent" | "skill" | "docs")
   * @returns HandoffGuidance（IPC 通過可能な型）
   */
  buildForSurface(
    bundle: TerminalHandoffBundle,
    surfaceType: "agent" | "skill" | "docs",
  ): HandoffGuidance {
    // P42 準拠 3段バリデーション
    if (
      typeof bundle?.suggestedCommand !== "string" ||
      bundle.suggestedCommand.trim() === ""
    ) {
      throw {
        code: "VALIDATION_ERROR",
        message: "suggestedCommand must be a non-empty string",
      };
    }

    const contextSummary = this.buildContextSummary(bundle, surfaceType);

    return {
      terminalCommand: bundle.suggestedCommand,
      contextSummary,
      reason: bundle.launcher?.reason ?? "terminal handoff",
    };
  }

  private buildContextSummary(
    bundle: TerminalHandoffBundle,
    surfaceType: "agent" | "skill" | "docs",
  ): string {
    switch (surfaceType) {
      case "agent":
        return `surface=agent`;
      case "skill":
        return `surface=skill skill=${bundle.launcher?.skillName ?? "unknown"}`;
      case "docs":
        return `surface=docs`;
    }
  }
}
```

**完了条件**:

- `TerminalHandoffBundle` の内部フィールド (`promptBundle`, `manualRetryRule`) が `HandoffGuidance` に含まれないこと (NFR-1f)
- `terminalCommand` に API key が含まれないこと (NFR-1a)
- P42 準拠 3段バリデーションが実装されていること

---

### タスク 3: SkillDocsCapabilityResolver terminal-handoff パス実装 (GAP-06)

**対象ファイル**: `apps/desktop/src/main/services/skill/SkillDocsCapabilityResolver.ts`

**目的**: `terminal-handoff` パスの実装を完成させ、`SkillDocsCapabilityResult.capability === "terminal-handoff"` の場合に `toHandoffGuidance()` を呼び出して `HandoffGuidance` を返すようにする。

**実装内容**:

```typescript
// apps/desktop/src/main/services/skill/SkillDocsCapabilityResolver.ts

import { toHandoffGuidance } from "@repo/shared/types/handoff";

export class SkillDocsCapabilityResolver {
  async resolve(request: SkillDocsRequest): Promise<SkillDocsResolveResult> {
    const capabilityResult = await this.policyResolver.resolve(request);

    // integrated-api: handoff 不要
    if (capabilityResult.capability === "integrated-api") {
      return { type: "integrated", provider: capabilityResult.provider };
    }

    // guidance-only / terminal-handoff: toHandoffGuidance() で DTO 統一
    const handoffGuidance = toHandoffGuidance(capabilityResult);
    if (handoffGuidance === null) {
      // このパスには到達しない（上記 integrated-api で return 済み）
      // assertNoSilentFallback で防御
      assertNoSilentFallback(capabilityResult.capability, "unavailable");
    }

    return { type: "handoff", guidance: handoffGuidance };
  }
}
```

**完了条件**:

- IT-B-1〜4 が全 PASS すること
- `integrated-api` パスで `toHandoffGuidance()` が呼ばれないこと
- `guidance-only` / `terminal-handoff` パスで `HandoffGuidance` が返却されること

**禁止事項**:

- `IRuntimePolicyResolver.resolve()` 以外での capability 判定 (NFR-2a)
- silent fallback: capability がマッピングなし → 暗黙的に `ready` 状態への遷移 (P62)

---

### タスク 4: GuidanceBlock vs TerminalHandoffCard 判定条件の明記 (MN-3 対応)

**対象ファイル**: `apps/desktop/src/renderer/components/organisms/ExecutionEnvironment/index.tsx`

**目的**: `capability` の値に応じて `GuidanceBlock` と `TerminalHandoffCard` のどちらを表示するかを明確に実装し、mixed 表示を防ぐ。

**判定ロジック**:

| capability 判定                          | 表示コンポーネント     | 根拠                                           |
| ---------------------------------------- | ---------------------- | ---------------------------------------------- |
| `handoff` / `terminal-handoff`           | `TerminalHandoffCard`  | terminalCommand の copy-first UX が必要        |
| `guidance-only` (API key 未設定)         | `GuidanceBlock`        | 設定ガイダンス + launcher CTA の組み合わせ表示 |
| `integrated-api`                         | 通常 UI (handoff なし) | handoff 不要                                   |
| `none` + `hasResolutionAction === true`  | blocked UI (設定導線)  | capability 未解決、解決手段あり                |
| `none` + `hasResolutionAction === false` | unavailable UI         | capability 未解決、解決手段なし                |

**実装方針**:

```typescript
// apps/desktop/src/renderer/components/organisms/ExecutionEnvironment/index.tsx

// handoffGuidance が存在 + capability が handoff 系 → TerminalHandoffCard
if (
  handoffGuidance != null &&
  (resolvedCapability === "handoff" || resolvedCapability === "terminal-handoff")
) {
  return <TerminalHandoffCard handoffGuidance={handoffGuidance} onDismiss={handleDismiss} />;
}

// guidance-only → GuidanceBlock (handoff variant)
if (resolvedCapability === "guidance-only") {
  return <GuidanceBlock variant="handoff" guidance={handoffGuidance} />;
}
```

**完了条件**:

- `TerminalHandoffCard` と `GuidanceBlock` が同時に表示されないこと
- capability 判定が Renderer ローカルで行われていないこと (NFR-2a)
- MN-3 で指摘された混在パターンが排除されていること

---

### タスク 5: ExecutionEnvironment terminal case placeholder 更新設計

**対象ファイル**: `apps/desktop/src/renderer/components/organisms/ExecutionEnvironment/index.tsx`

**目的**: terminal-only capability のケースで placeholder を適切な UI（launcher CTA）に更新する。Task06 (Terminal Dock) 完成後に差し替える前提の暫定実装を設ける。

**設計方針**:

- 現在の placeholder (`/* TODO: Task06 dependency */`) を launcher CTA を示す UI に更新する
- launcher ボタンは `cta.openTerminal` i18n key を使用する (FR-1c)
- Task06 が完成するまでは bottom sheet ではなく stub 表示（Task06 dependency フラグ付き）とする

```typescript
// terminal-only capability の暫定実装
// TODO(Task06): bottom sheet を TerminalDock に差し替える
{capability === "terminalSurface" && (
  <button
    onClick={handleOpenTerminal}
    data-testid="terminal-launcher-cta"
    // Task06 stub: bottom sheet は未実装。クリックで console.log のみ
  >
    {t("cta.openTerminal")}
  </button>
)}
```

**完了条件**:

- placeholder が `TODO(Task06)` コメントで明示されていること
- launcher ボタンの i18n key が `cta.openTerminal` であること (FR-1c)
- auto-send が発生しないこと (NFR-1b)

---

## 2. 実装禁止事項（全タスク共通）

| 禁止内容                                              | 根拠               |
| ----------------------------------------------------- | ------------------ |
| silent fallback: capability none → ready への暗黙遷移 | P62                |
| Renderer ローカルでの capability / auth 判定          | NFR-2a             |
| `TerminalHandoffBundle` の IPC 経由 Renderer 送信     | NFR-1f             |
| no-op: handoff 発生時に何も表示しない                 | AC-1, AC-3         |
| `any` 型の使用                                        | 02-code-quality.md |
| IPC_CHANNELS 以外のハードコード文字列                 | P27, NFR-2d        |
| auto-send: terminal dock を開いて自動コマンド送信     | NFR-1b             |

---

## 3. MINOR 追跡解決確認

| MINOR ID | 解決タスク | 解決内容                                                               |
| -------- | ---------- | ---------------------------------------------------------------------- |
| MN-1     | タスク 1   | `toHandoffGuidance()` を `packages/shared/src/types/handoff.ts` に追加 |
| MN-3     | タスク 4   | GuidanceBlock vs TerminalHandoffCard の判定条件を明記                  |

> MN-2 (Terminal Dock aborted state) は Phase 6 で対応。

---

## 4. 実装順序

```
タスク 1 (toHandoffGuidance adapter)
  ↓ テスト UT-A-1〜6 PASS 確認
タスク 2 (buildForSurface 統一メソッド)
  ↓ テスト IT-A-1 PASS 確認
タスク 3 (SkillDocsCapabilityResolver terminal-handoff パス)
  ↓ テスト IT-B-1〜4 PASS 確認
タスク 4 (GuidanceBlock vs TerminalHandoffCard 判定)
  ↓ テスト UT-B-1〜5 PASS 確認
タスク 5 (placeholder 更新設計)
  ↓ IT-C-1〜4 PASS 確認（stub 動作）
```

依存関係: タスク 1 → タスク 3 (toHandoffGuidance を使用)。タスク 2 → タスク 4 (buildForSurface を使用)。タスク 5 は独立。
