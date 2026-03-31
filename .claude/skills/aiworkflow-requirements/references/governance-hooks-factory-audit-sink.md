# GovernanceHooksFactory / GovernanceAuditSink 実装仕様

> 親仕様書: [interfaces-agent-sdk-skill-reference.md](interfaces-agent-sdk-skill-reference.md)
> タスク: TASK-P0-09 claude-sdk-permission-hooks-governance（2026-03-31）

## 概要

TASK-P0-09 で導入したガバナンス基盤の2コンポーネント実装仕様。
`GovernanceHooksFactory` が phase 別 SDK Hooks セットを生成し、
`GovernanceAuditSink` が監査イベントを蓄積・UI payload へ変換する。

**実装ファイル**:

| ファイル | パス |
| --- | --- |
| `GovernanceHooksFactory.ts` | `apps/desktop/src/main/services/runtime/` |
| `GovernanceAuditSink.ts` | `apps/desktop/src/main/services/runtime/` |
| `SkillCreatorGovernancePolicy.ts` | `apps/desktop/src/main/services/runtime/` |

---

## GovernanceHooksFactory

### 概要

Phase 別の SDK Hooks セットを生成するファクトリ関数。
`createGovernanceHooks(options)` を呼び出すと `{ hooks, auditSink }` を返す。
生成された `hooks` は SDK `query()` の hooks option に直接渡せる。

### エントリポイント

```typescript
function createGovernanceHooks(options: GovernanceHooksFactoryOptions): {
  hooks: GovernanceHooks;
  auditSink: GovernanceAuditSink;
}
```

### GovernanceHooksFactoryOptions

| フィールド | 型 | 必須 | 説明 |
| --- | --- | --- | --- |
| `phase` | `SkillCreatorGovernancePhase` | ✓ | 対象 phase（plan / execute / verify / improve） |
| `sessionId` | `string` | - | セッション識別子（省略時は匿名） |
| `skillTargetDir` | `string` | - | execute/improve 時の書き込み許可ディレクトリ |
| `provenance` | `SkillCreatorWorkflowSourceProvenance` | - | ワークフロー起源情報 |
| `auditSink` | `GovernanceAuditSink` | - | 外部注入 sink（省略時は新規作成） |

### GovernanceHooks インターフェース

| フック | 呼び出しタイミング | 戻り値 |
| --- | --- | --- |
| `onSessionStart(params)` | SDK セッション開始時 | `void` |
| `onPreToolUse(params)` | ツール呼び出し前 | `{ allow: boolean; reason?: string }` |
| `onPostToolUse(params)` | ツール呼び出し後 | `void` |
| `onSessionEnd(params)` | SDK セッション終了時 | `void` |
| `SessionStart(input, ...)` | SDK pascal-case 形式 | `Promise<{}>` |
| `PreToolUse(input, ...)` | SDK pascal-case 形式 | `Promise<{ proceed: boolean; message?: string }>` |
| `PostToolUse(input, ...)` | SDK pascal-case 形式 | `Promise<{}>` |
| `SessionEnd(input, ...)` | SDK pascal-case 形式 | `Promise<{}>` |

> camelCase hooks は内部ロジック実装用、PascalCase hooks は SDK 直結 adapter。

### フック実行フロー

```
onPreToolUse(toolName, toolInput)
  └─ canUseTool(toolName, toolInput)  // SkillCreatorGovernancePolicy
       ├─ allowed: true  → auditSink.record("pre_tool_use", decision="allow")
       └─ allowed: false → auditSink.record("tool_denied", decision="deny")
                           return { allow: false, reason }
```

---

## GovernanceAuditSink

### 概要

監査イベントを蓄積するシングルインスタンスクラス。
`record()` でイベントを追加し、`buildUiPayload()` で `GovernanceUiPayload` を生成する。

### クラス API

| メソッド | シグネチャ | 説明 |
| --- | --- | --- |
| `record` | `(event: GovernanceAuditEvent) => void` | イベントを追記する |
| `getEvents` | `() => readonly GovernanceAuditEvent[]` | 全イベントを返す |
| `getRecentDenials` | `(limit?, phase?, sessionId?) => GovernanceAuditEvent[]` | 直近の denial イベントを取得する |
| `buildSessionSummary` | `(phase, sessionId?, provenance?) => GovernanceSessionSummary` | セッションサマリーを生成する |
| `buildUiPayload` | `(phase, sessionId?, provenance?) => GovernanceUiPayload` | UI 向けペイロードを生成する |
| `clear` | `() => void` | 全イベントをクリアする |

### 監査イベントライフサイクル

```
SessionStart
  └─ record("session_start")  // startTime を sessionStartTimes に記録

PreToolUse
  ├─ allow: record("pre_tool_use", decision="allow")
  └─ deny: record("tool_denied", decision="deny", reason)

PostToolUse
  └─ record("post_tool_use", decision="allow", durationMs)

SessionEnd
  ├─ buildSessionSummary()
  └─ record("session_end", metadata.summary)
```

### createAuditEvent ヘルパー

```typescript
function createAuditEvent(
  phase: SkillCreatorGovernancePhase,
  eventKind: GovernanceAuditEventKind,
  options?: {
    sessionId?: string;
    toolName?: string;
    decision?: "allow" | "deny";
    reason?: string;
    durationMs?: number;
    provenance?: SkillCreatorWorkflowSourceProvenance;
    metadata?: Record<string, unknown>;
  }
): GovernanceAuditEvent
```

### セッションサマリー生成ロジック

`buildSessionSummary(phase, sessionId, provenance)` の集計アルゴリズム：

1. `filterEvents(phase, sessionId)` で対象 phase / session のイベントを絞り込む
2. `pre_tool_use` / `tool_denied` / `post_tool_use` のみを集計対象とする
3. `decision="deny"` または `eventKind="tool_denied"` のツールを `deniedSet` に追加
4. それ以外を `allowedSet` に追加
5. `sessionStartTimes` から経過時間（`durationMs`）を算出

| フィールド | 算出方法 |
| --- | --- |
| `totalToolCalls` | `pre_tool_use` + `tool_denied` のイベント数 |
| `deniedToolCalls` | `tool_denied` のイベント数 |
| `allowedToolNames` | `allowedSet` の配列化 |
| `deniedToolNames` | `deniedSet` の配列化 |
| `durationMs` | `Date.now() - sessionStartTimes[key]` |

### UI Payload 構築

`buildUiPayload(phase, sessionId, provenance)` は以下を組み合わせる：

```typescript
{
  phase,
  permissionMode: getPolicyForPhase(phase).permissionMode,
  activePolicyToolCount: getPolicyForPhase(phase).allowedTools.length,
  recentDenials: getRecentDenials(10, phase, sessionId),
  sessionSummary: buildSessionSummary(phase, sessionId, provenance),
}
```

---

## 使用例

### execute フェーズでの Hooks 生成

```typescript
import { createGovernanceHooks } from "./GovernanceHooksFactory";

const { hooks, auditSink } = createGovernanceHooks({
  phase: "execute",
  sessionId: "session-123",
  skillTargetDir: "/path/to/skill",
  provenance: { /* ... */ },
});

// SDK query() に渡す
await query(prompt, { hooks, permissions: { canUseTool } });
```

### UI Payload 取得

```typescript
// IPC ハンドラ（skill-creator:get-governance）
const facade = new RuntimeSkillCreatorFacade(/* ... */);
const payload = facade.getGovernanceUiPayload("execute");
// payload: GovernanceUiPayload
```

### 監査イベントの取得

```typescript
const events = facade.getGovernanceAuditEvents();
// events: readonly GovernanceAuditEvent[]
```

---

## 設計上の注意事項

- `auditSink` は `createGovernanceHooks` で内部生成するか、外部注入できる（テスト容易性）
- `sessionStartTimes` のキーは `${phase}:${sessionId ?? "__anonymous__"}` の複合キー
- `getRecentDenials` の `limit` デフォルトは 10 件（直近順）
- execute / improve フェーズで `Write` / `Edit` を使う場合は `skillTargetDir` が必須
- plan / verify フェーズでは `Edit` / `Write` は `disallowedTools` に含まれ、常に deny

---

## 関連仕様書

| ファイル | 用途 |
| --- | --- |
| [interfaces-agent-sdk-skill-reference.md](interfaces-agent-sdk-skill-reference.md) | RuntimeSkillCreatorFacade の Governance 拡張セクション |
| [api-ipc-agent-core.md](api-ipc-agent-core.md) | `skill-creator:get-governance` IPC チャネル仕様 |
| [lessons-learned-governance-hooks-phase-policy.md](lessons-learned-governance-hooks-phase-policy.md) | TASK-P0-09 の苦戦箇所と教訓 |
