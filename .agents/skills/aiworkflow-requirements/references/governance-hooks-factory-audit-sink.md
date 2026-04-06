# SkillCreatorHooksFactory / SkillCreatorAuditSink 実装仕様

> 親仕様書: [interfaces-agent-sdk-skill-reference.md](interfaces-agent-sdk-skill-reference.md)
> タスク: TASK-P0-09 claude-sdk-permission-hooks-governance（2026-04-06 更新）

## 概要

TASK-P0-09 で導入したガバナンス基盤の 3 コンポーネント実装仕様。
`SkillCreatorPermissionPolicy` が phase 別 policy を定義し、
`createHooks()` が lifecycle hooks を生成し、
`SkillCreatorAuditSink` が監査イベントを ring buffer で蓄積する。

**実装ファイル**:

| ファイル | パス |
| --- | --- |
| `SkillCreatorPermissionPolicy.ts` | `apps/desktop/src/main/services/runtime/governance/` |
| `SkillCreatorHooksFactory.ts` | `apps/desktop/src/main/services/runtime/governance/` |
| `SkillCreatorAuditSink.ts` | `apps/desktop/src/main/services/runtime/governance/` |
| `index.ts` | `apps/desktop/src/main/services/runtime/governance/` |

---

## SkillCreatorPermissionPolicy

### 概要

Phase 別の tool 使用許可テーブルを定義するモジュール。
`POLICY_TABLE` を `Object.freeze()` で保護し、外部からの accidental mutation を防ぐ。

### エクスポート

```typescript
export function getPolicy(phase: SkillCreatorGovernancePhase): SkillCreatorSdkPolicy
export function canUseTool(toolName: string, phase: SkillCreatorGovernancePhase): SkillCreatorToolDecision
export function getAllPolicies(): Record<SkillCreatorGovernancePhase, SkillCreatorSdkPolicy>
export function evaluateContextPolicy(context: CanUseToolContext): SkillCreatorToolDecision
export type CanUseToolContext = { toolName: string; phase: SkillCreatorGovernancePhase; targetPath?: string; skillTargetDir?: string }
```

### Phase 別 Policy テーブル

| phase | permissionMode | allowedTools | disallowedTools |
| --- | --- | --- | --- |
| `plan` | `"default"` | READ_TOOLS（Read/Glob/Grep/Bash/Agent） | Write/Edit + DESTRUCTIVE_TOOLS |
| `execute` | `"acceptEdits"` | WRITE_TOOLS（+Write/Edit） | DESTRUCTIVE_TOOLS |
| `verify` | `"default"` | TEST_TOOLS（Read/Glob/Grep/Bash/Agent） | Write/Edit + DESTRUCTIVE_TOOLS |
| `improve` | `"acceptEdits"` | IMPROVE_TOOLS（+Edit、Write は除外） | Write + DESTRUCTIVE_TOOLS |

> `DESTRUCTIVE_TOOLS = ["NotebookEdit"]` は全 phase の `disallowedTools` に含まれる。

### `canUseTool()` の判定ロジック

```
canUseTool(toolName, phase)
  1. disallowedTools に含まれる → denied（DESTRUCTIVE_TOOLS または phase 制限）
  2. allowedTools に含まれる → allowed
  3. いずれにも属さない → denied（デフォルト拒否）
```

> **注意**: 引数順は `(toolName, phase)` の順。両方 `string` 型のため型エラーにならない逆転バグに注意（lessons-learned #7 参照）。

---

## SkillCreatorHooksFactory

### 概要

Phase 別の lifecycle hooks を生成するファクトリ関数モジュール。
クラスではなく `createHooks()` 関数として公開する（状態は `auditSink` に委譲）。

### エントリポイント

```typescript
export function createHooks(
  phase: SkillCreatorGovernancePhase,
  auditSink: SkillCreatorAuditSink,
  provenance?: SkillCreatorWorkflowSourceProvenance,
): SkillCreatorHooks
```

### SkillCreatorHooks インターフェース

```typescript
export interface SkillCreatorHooks {
  onSessionStart: (params: { sessionId: string; provenance?: SkillCreatorWorkflowSourceProvenance }) => void;
  onPreToolUse:   (params: { sessionId: string; toolName: string }) => SkillCreatorToolDecision;
  onPostToolUse:  (params: { sessionId: string; toolName: string; success: boolean; error?: string }) => void;
  onSessionEnd:   (params: { sessionId: string; summary?: string }) => void;
}
```

### フック実行フロー

```
onSessionStart({ sessionId, provenance })
  └─ auditSink.recordEvent({ eventType: "session_start", ... })

onPreToolUse({ sessionId, toolName })
  └─ canUseTool(toolName, phase)
       ├─ allowed: true  → recordEvent("pre_tool_use", decision={allowed:true}) → return {allowed:true}
       └─ allowed: false → recordEvent("pre_tool_use", decision={allowed:false,reason}) → return {allowed:false,reason}

onPostToolUse({ sessionId, toolName, success, error })
  └─ auditSink.recordEvent({ eventType: "post_tool_use", ... })

onSessionEnd({ sessionId, summary })
  └─ auditSink.recordEvent({ eventType: "session_end", ... })
```

---

## SkillCreatorAuditSink

### 概要

監査イベントを in-memory ring buffer で蓄積するクラス。
`maxEvents` を超えた場合は `slice(-maxEvents)` で古いイベントを自動破棄する。
デフォルト `maxEvents = 500`。

### クラス API

| メソッド | シグネチャ | 説明 |
| --- | --- | --- |
| `record` | `(event: SkillCreatorGovernanceAuditEvent) => void` | イベントを追記し ring buffer を維持 |
| `recordEvent` | `(params) => SkillCreatorGovernanceAuditEvent` | 構造化イベントを生成して `record()` を呼ぶ |
| `getEvents` | `() => readonly SkillCreatorGovernanceAuditEvent[]` | 全イベントのコピーを返す（read-only） |
| `getRecentEvents` | `(count: number) => SkillCreatorGovernanceAuditEvent[]` | 直近 N 件を返す |
| `getEventsBySession` | `(sessionId: string) => SkillCreatorGovernanceAuditEvent[]` | sessionId でフィルタ |
| `getDenialEvents` | `() => SkillCreatorGovernanceAuditEvent[]` | `decision.allowed === false` のイベントのみ |
| `clear` | `() => void` | 全イベントをクリア |
| `size` | `get size(): number` | 現在のイベント数 |

### `recordEvent()` パラメータ

```typescript
recordEvent(params: {
  eventType: SkillCreatorHookEventType;  // "session_start" | "pre_tool_use" | "post_tool_use" | "session_end"
  sessionId: string;
  phase: SkillCreatorGovernancePhase;
  toolName?: string;
  decision?: SkillCreatorToolDecision;
  provenance?: SkillCreatorWorkflowSourceProvenance;
  metadata?: Record<string, unknown>;
}): SkillCreatorGovernanceAuditEvent
```

`timestamp` は `new Date().toISOString()` で自動付与される。

### Ring Buffer 動作

```
maxEvents = 500 のとき：
  events.length <= 500 → 追記のみ（O(1)）
  events.length > 500  → events = events.slice(-500)（古いものを破棄）

理由: CircularBuffer クラスは過剰設計。slice(-N) で十分。
```

---

## 使用例

### RuntimeSkillCreatorFacade での組み合わせ

```typescript
import { SkillCreatorAuditSink } from "./governance/SkillCreatorAuditSink";
import { createHooks } from "./governance/SkillCreatorHooksFactory";

// Facade 内部
private auditSink = new SkillCreatorAuditSink();

private createGovernanceHooks(phase: SkillCreatorGovernancePhase): SkillCreatorHooks {
  this.currentGovernancePhase = phase;
  return createHooks(phase, this.auditSink, this.provenance);
}

// plan() での使用例
async plan(): Promise<...> {
  const hooks = this.createGovernanceHooks("plan");
  hooks.onSessionStart({ sessionId: this.sessionId });
  // ... 実処理 ...
  hooks.onSessionEnd({ sessionId: this.sessionId });
}
```

### IPC getGovernanceState()

```typescript
// RuntimeSkillCreatorFacade.getGovernanceState()
getGovernanceState(): SkillCreatorGovernanceState {
  return {
    phase: this.currentGovernancePhase,
    activePolicy: getPolicy(this.currentGovernancePhase),
    recentAuditEvents: this.auditSink.getRecentEvents(20),
    recentDenials: this.auditSink.getDenialEvents().slice(-10),
  };
}
```

---

## 設計上の注意事項

- `SkillCreatorAuditSink` は `auditSink` として外部注入可能（テスト容易性のため）
- `createHooks()` はステートレス：状態は `auditSink` に委譲する
- `canUseTool()` の引数順は `(toolName, phase)` — 順序バグに注意
- execute / improve フェーズで context-aware な path 判定は `evaluateContextPolicy()` 経由（TASK-P0-09-U1 で解消済み）
- plan / verify フェーズでは `Write` / `Edit` は常に denied（policy テーブルで固定）

---

## path-scoped canUseTool 判定（TASK-P0-09-U1 実装済み）

### extractTargetPath(input)

- `input.file_path` → `input.path` の順に fallback
- どちらもなければ `undefined`（tool-level 判定のみ・後方互換）

### skillRoot パラメータ化

- `createExecuteGovernanceCanUseTool(skillRoot: string)`
- `createImproveGovernanceCanUseTool(skillRoot: string)`
- `evaluateGovernanceToolUse` に `{ targetPath, allowedSkillRoot }` context を渡す

### パストラバーサル対策

- `targetPath` が `allowedSkillRoot` の外部を指す場合は deny
- `undefined` targetPath は tool-level 判定のみ（deny しない）

---

## 関連仕様書

| ファイル | 用途 |
| --- | --- |
| [interfaces-agent-sdk-skill-reference.md](interfaces-agent-sdk-skill-reference.md) | RuntimeSkillCreatorFacade の Governance 拡張セクション |
| [api-ipc-agent-core.md](api-ipc-agent-core.md) | `skill-creator:get-governance-state` IPC チャネル仕様 |
| [lessons-learned-governance-hooks-phase-policy.md](lessons-learned-governance-hooks-phase-policy.md) | TASK-P0-09 の苦戦箇所と教訓 |
