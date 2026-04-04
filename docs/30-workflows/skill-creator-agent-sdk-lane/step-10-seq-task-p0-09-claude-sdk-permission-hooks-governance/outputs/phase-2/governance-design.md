# Phase 2: Governance 設計書 (Governance Design)

## メタ情報

| 項目     | 値                                     |
| -------- | -------------------------------------- |
| タスクID | TASK-P0-09                             |
| Phase    | 2                                      |
| 機能名   | claude-sdk-permission-hooks-governance |
| 作成日   | 2026-03-31                             |

---

## 1. TypeScript インターフェース定義

### 1.1 SkillCreatorPhase

```typescript
/**
 * skill-creator lane の governance 対象 phase。
 * workflow engine の SkillCreatorWorkflowPhase とは別の関心事として分離する。
 * governance では plan / execute / verify / improve の 4 phase のみを扱う。
 */
export type SkillCreatorGovernancePhase =
  | "plan"
  | "execute"
  | "verify"
  | "improve";
```

### 1.2 SkillCreatorSdkPolicy

```typescript
/**
 * phase ごとの SDK permission policy。
 * RuntimeSkillCreatorFacade が SDK query() option を組み立てる際に参照する。
 */
export interface SkillCreatorSdkPolicy {
  /** 対象 phase */
  phase: SkillCreatorGovernancePhase;

  /**
   * Claude Code SDK の permissionMode。
   * "bypassPermissions" は skill-creator lane では禁止。
   */
  permissionMode: "default" | "acceptEdits";

  /** 許可する tool 名のリスト */
  allowedTools: readonly string[];

  /** 明示的に禁止する tool 名のリスト（allowedTools より優先） */
  disallowedTools: readonly string[];

  /**
   * canUseTool コールバックの判断ロジック識別子。
   * "path_scoped" = パス制約チェックを行う (execute / improve)
   * "tool_list_only" = allowedTools / disallowedTools のみで判断 (plan / verify)
   */
  canUseToolStrategy: "path_scoped" | "tool_list_only";
}
```

### 1.3 GovernanceAuditEvent

```typescript
/**
 * Governance layer が記録する audit event。
 * hooks factory が生成し、audit sink が一元蓄積する。
 */
export interface GovernanceAuditEvent {
  /** イベント一意 ID（UUID v4） */
  eventId: string;

  /** ISO 8601 タイムスタンプ */
  timestamp: string;

  /** SDK session ID */
  sessionId: string;

  /** 現在の governance phase */
  phase: SkillCreatorGovernancePhase;

  /** 発火した hook の種別 */
  hookType: GovernanceHookType;

  /** tool 名（PreToolUse / PostToolUse 時のみ） */
  toolName?: string;

  /** tool 入力（PreToolUse 時のみ、パス情報等を含む） */
  toolInput?: Record<string, unknown>;

  /** 判定結果（PreToolUse 時のみ） */
  decision?: "allow" | "deny";

  /** 判定理由（deny 時は必須、allow 時は任意） */
  reason?: string;

  /** tool 実行結果（PostToolUse 時のみ） */
  toolResult?: "success" | "error";

  /** tool 実行時間（PostToolUse 時のみ、ミリ秒） */
  durationMs?: number;

  /** エラーメッセージ（PostToolUse error 時のみ） */
  errorMessage?: string;

  /** source provenance（SessionStart 時は必須、他は任意） */
  sourceProvenance?: SkillCreatorWorkflowSourceProvenance;

  /** session summary（SessionEnd 時のみ） */
  sessionSummary?: GovernanceSessionSummary;
}
```

### 1.4 HookEvent 関連型

```typescript
/**
 * Hooks の種別。SDK の hook ライフサイクルに対応する。
 */
export type GovernanceHookType =
  | "SessionStart"
  | "PreToolUse"
  | "PostToolUse"
  | "SessionEnd";

/**
 * SessionEnd 時に記録する session 全体のサマリー。
 */
export interface GovernanceSessionSummary {
  /** session 全体の tool 呼び出し回数 */
  totalToolCalls: number;

  /** permission denial の回数 */
  denialCount: number;

  /** session 全体の経過時間（ミリ秒） */
  totalDurationMs: number;

  /** 使用された tool の名前と回数 */
  toolUsageCounts: Record<string, number>;
}

/**
 * canUseTool コールバックの入力。
 * Claude Code SDK の tool_use イベントから抽出される。
 */
export interface CanUseToolInput {
  /** tool 名 */
  tool_name: string;

  /** tool に渡される入力パラメータ */
  tool_input: Record<string, unknown>;
}

/**
 * canUseTool コールバックの出力。
 */
export interface CanUseToolResult {
  /** 許可するか */
  allowed: boolean;

  /** 判定理由（deny 時は必須） */
  reason?: string;
}

/**
 * UI 向け permission denial 表示用 payload。
 * renderer に push される denial 通知の構造。
 */
export interface GovernancePermissionDenialPayload {
  /** denial が発生した phase */
  phase: SkillCreatorGovernancePhase;

  /** 拒否された tool 名 */
  toolName: string;

  /** human-readable な拒否理由 */
  reason: string;

  /** denial 発生時刻（ISO 8601） */
  timestamp: string;

  /** source provenance（利用可能な場合） */
  sourceProvenance?: SkillCreatorWorkflowSourceProvenance;
}
```

---

## 2. Phase 別 Policy テーブル

### 2.1 定数マップ設計

```typescript
/**
 * phase ごとの policy 定数マップ。
 * SkillCreatorGovernancePolicy.resolve() から参照される。
 */
const PHASE_POLICIES: Record<
  SkillCreatorGovernancePhase,
  SkillCreatorSdkPolicy
> = {
  plan: {
    phase: "plan",
    permissionMode: "default",
    allowedTools: ["Read", "Glob", "Grep", "WebSearch"],
    disallowedTools: ["Write", "Edit", "Bash", "Execute"],
    canUseToolStrategy: "tool_list_only",
  },
  execute: {
    phase: "execute",
    permissionMode: "acceptEdits",
    allowedTools: ["Read", "Write", "Edit", "Bash"],
    disallowedTools: [],
    canUseToolStrategy: "path_scoped",
  },
  verify: {
    phase: "verify",
    permissionMode: "default",
    allowedTools: ["Read", "Glob", "Grep", "Bash"],
    disallowedTools: ["Write", "Edit"],
    canUseToolStrategy: "tool_list_only",
  },
  improve: {
    phase: "improve",
    permissionMode: "acceptEdits",
    allowedTools: ["Read", "Edit"],
    disallowedTools: ["Write"],
    canUseToolStrategy: "path_scoped",
  },
};
```

### 2.2 policy テーブル（読みやすい表形式）

| Phase     | permissionMode | allowedTools                | disallowedTools            | canUseToolStrategy | パス制約                 |
| --------- | -------------- | --------------------------- | -------------------------- | ------------------ | ------------------------ |
| `plan`    | `default`      | Read, Glob, Grep, WebSearch | Write, Edit, Bash, Execute | `tool_list_only`   | なし                     |
| `execute` | `acceptEdits`  | Read, Write, Edit, Bash     | (なし、canUseTool で制御)  | `path_scoped`      | skill dir 内のみ許可     |
| `verify`  | `default`      | Read, Glob, Grep, Bash      | Write, Edit                | `tool_list_only`   | なし                     |
| `improve` | `acceptEdits`  | Read, Edit                  | Write                      | `path_scoped`      | 改善対象ファイルのみ許可 |

### 2.3 canUseTool 判断フロー

```
canUseTool(tool_name, tool_input)
  │
  ├─ step 1: disallowedTools に含まれるか？
  │    └─ YES → deny("tool '{tool_name}' is disallowed in {phase} phase")
  │
  ├─ step 2: allowedTools に含まれるか？
  │    └─ NO → deny("tool '{tool_name}' is not in allowed list for {phase} phase")
  │
  ├─ step 3: canUseToolStrategy === "path_scoped" ?
  │    └─ YES → パス制約チェックへ
  │         ├─ execute: tool_input のパスが skillDir 配下か？
  │         │    └─ NO → deny("path '{path}' is outside skill directory scope")
  │         └─ improve: tool_input のパスが改善対象ファイルか？
  │              └─ NO → deny("path '{path}' is not an improvement target")
  │
  └─ step 4: allow (暗黙)
```

---

## 3. Hooks Factory 設計

### 3.1 アーキテクチャ

```
SkillCreatorHooksFactory
  │
  ├─ createHooks(phase, sourceProvenance, skillDir?)
  │    │
  │    ├─ SessionStart hook
  │    │    └─ auditSink.record(SessionStart event)
  │    │
  │    ├─ PreToolUse hook
  │    │    ├─ GovernancePolicy.canUseTool(phase, tool)
  │    │    ├─ auditSink.record(PreToolUse event with decision)
  │    │    └─ return allow/deny
  │    │
  │    ├─ PostToolUse hook
  │    │    └─ auditSink.record(PostToolUse event with result)
  │    │
  │    └─ SessionEnd hook
  │         ├─ auditSink.record(SessionEnd event with summary)
  │         └─ emit summary to UI via IPC
  │
  └─ depends on:
       ├─ SkillCreatorGovernancePolicy (policy 判定)
       └─ SkillCreatorAuditSink (event 記録)
```

### 3.2 HooksFactory インターフェース

```typescript
/**
 * Hooks factory。phase ごとの hooks セットを生成する。
 */
export class SkillCreatorHooksFactory {
  constructor(
    private readonly policy: SkillCreatorGovernancePolicy,
    private readonly auditSink: SkillCreatorAuditSink,
    private readonly onDenial?: (
      payload: GovernancePermissionDenialPayload,
    ) => void,
  ) {}

  /**
   * 指定された phase 用の hooks セットを生成する。
   *
   * @param phase - governance phase
   * @param sessionId - SDK session ID
   * @param sourceProvenance - 動的読込の provenance
   * @param skillDir - 生成対象の skill ディレクトリ（execute/improve 時のみ必須）
   */
  createHooks(
    phase: SkillCreatorGovernancePhase,
    sessionId: string,
    sourceProvenance?: SkillCreatorWorkflowSourceProvenance,
    skillDir?: string,
  ): SkillCreatorGovernanceHooks;
}

/**
 * createHooks() が返す hooks セット。
 * Claude Code SDK の query() option に渡す形式。
 */
export interface SkillCreatorGovernanceHooks {
  onSessionStart: () => void;
  onPreToolUse: (input: CanUseToolInput) => CanUseToolResult;
  onPostToolUse: (
    toolName: string,
    result: "success" | "error",
    durationMs: number,
  ) => void;
  onSessionEnd: () => void;
}
```

### 3.3 hook → audit event マッピング

| Hook         | 生成する GovernanceAuditEvent フィールド                                                       |
| ------------ | ---------------------------------------------------------------------------------------------- |
| SessionStart | eventId, timestamp, sessionId, phase, hookType, sourceProvenance                               |
| PreToolUse   | eventId, timestamp, sessionId, phase, hookType, toolName, toolInput, decision, reason          |
| PostToolUse  | eventId, timestamp, sessionId, phase, hookType, toolName, toolResult, durationMs, errorMessage |
| SessionEnd   | eventId, timestamp, sessionId, phase, hookType, sessionSummary                                 |

---

## 4. Audit Sink 設計

### 4.1 責務

- governance audit event の一元蓄積
- session 単位のフィルタリング・集計
- renderer への denial 通知 push の仲介

### 4.2 インターフェース

```typescript
/**
 * Audit event の一元記録先。
 * main プロセスで singleton として管理される。
 */
export class SkillCreatorAuditSink {
  /** audit event を記録する */
  record(event: GovernanceAuditEvent): void;

  /** session ID で audit event をフィルタして取得する */
  getBySession(sessionId: string): GovernanceAuditEvent[];

  /** denial event のみをフィルタして取得する */
  getDenials(sessionId?: string): GovernanceAuditEvent[];

  /** session summary を取得する（SessionEnd 時に記録された summary） */
  getSessionSummary(sessionId: string): GovernanceSessionSummary | undefined;

  /** 全イベントをクリアする（テスト用） */
  clear(): void;

  /** 蓄積されたイベント数を取得する */
  get size(): number;
}
```

### 4.3 保存戦略

- **初回実装**: インメモリ配列（`GovernanceAuditEvent[]`）
- **上限**: session あたり最大 1000 件。超過時は古い event から切り捨て
- **永続化**: 初回スコープ外。将来的に electron-store / SQLite への永続化を検討
- **プライバシー**: tool_input にファイル内容は含めない。パス情報のみ記録

---

## 5. UI Payload 設計

### 5.1 Permission Denial 表示

renderer に push される denial payload の設計。

```typescript
// IPC channel: "skill-creator:governance-denial"
// direction: main → renderer (push)
interface GovernancePermissionDenialPayload {
  phase: SkillCreatorGovernancePhase;
  toolName: string;
  reason: string; // human-readable（日本語）
  timestamp: string; // ISO 8601
  sourceProvenance?: SkillCreatorWorkflowSourceProvenance;
}
```

**表示例**:

```
[plan phase] Write tool の使用が拒否されました
理由: plan phase では読取専用です。変更を伴う tool は使用できません。
```

### 5.2 Governance Audit 読取 API

renderer が能動的に audit 情報を取得する API。

```typescript
// IPC channel: "skill-creator:get-governance-audit"
// direction: renderer → main (invoke) → main → renderer (response)
interface GetGovernanceAuditRequest {
  sessionId: string;
  filter?: "all" | "denials";
}

interface GetGovernanceAuditResponse {
  events: GovernanceAuditEvent[];
  summary?: GovernanceSessionSummary;
}
```

### 5.3 IPC Channel 追加一覧

| Channel 名                               | 方向            | 用途                            |
| ---------------------------------------- | --------------- | ------------------------------- |
| `skill-creator:governance-denial`        | main → renderer | denial 発生時の push 通知       |
| `skill-creator:get-governance-audit`     | renderer → main | audit event の読取              |
| `skill-creator:governance-state-changed` | main → renderer | governance 状態変更の push 通知 |

---

## 6. IPC 4 層整合設計

### 6.1 L1: 定数・型 (`packages/shared/`)

```
packages/shared/src/types/skillCreator.ts
  追加:
  - SkillCreatorGovernancePhase
  - SkillCreatorSdkPolicy
  - GovernanceAuditEvent
  - GovernanceHookType
  - GovernanceSessionSummary
  - CanUseToolInput / CanUseToolResult
  - GovernancePermissionDenialPayload

packages/shared/src/ipc/channels.ts (または preload/channels.ts)
  追加:
  - SKILL_CREATOR_GOVERNANCE_DENIAL
  - SKILL_CREATOR_GET_GOVERNANCE_AUDIT
  - SKILL_CREATOR_GOVERNANCE_STATE_CHANGED
```

### 6.2 L2: Main Handler (`apps/desktop/src/main/`)

```
apps/desktop/src/main/ipc/creatorHandlers.ts
  追加:
  - SKILL_CREATOR_GET_GOVERNANCE_AUDIT handler
  - denial push 呼び出し（HooksFactory の onDenial コールバックから）

apps/desktop/src/main/services/runtime/
  新規:
  - SkillCreatorGovernancePolicy.ts  (policy resolver)
  - SkillCreatorHooksFactory.ts      (hooks factory)
  - SkillCreatorAuditSink.ts         (audit sink)

  変更:
  - RuntimeSkillCreatorFacade.ts
    - constructor に GovernancePolicy / HooksFactory / AuditSink を DI
    - plan() / execute() / improve() に hooks 接続
```

### 6.3 L3: Preload API (`apps/desktop/src/preload/`)

```
apps/desktop/src/preload/skill-creator-api.ts
  追加:
  - getGovernanceAudit(sessionId, filter?)  → invoke
  - onGovernanceDenial(callback)            → on (push listener)
  - onGovernanceStateChanged(callback)      → on (push listener)
```

### 6.4 L4: Renderer UI

```
renderer 側は本タスクの主スコープ外。
ただし、L1 で定義した型を使って以下を表示できる前提で設計する:
  - denial reason の toast / notification
  - governance audit のログビュー
  - session summary の表示
```

---

## 7. Dependency Boundary 設計

### 7.1 責務分離表

| コンポーネント                 | 責務                   | 依存先                         | 依存元                        |
| ------------------------------ | ---------------------- | ------------------------------ | ----------------------------- |
| `SkillCreatorGovernancePolicy` | phase 別 policy 解決   | shared types のみ              | HooksFactory, Facade          |
| `SkillCreatorHooksFactory`     | hooks セット生成       | GovernancePolicy, AuditSink    | Facade                        |
| `SkillCreatorAuditSink`        | audit event 一元記録   | shared types のみ              | HooksFactory, creatorHandlers |
| `RuntimeSkillCreatorFacade`    | SDK option 組み立て    | GovernancePolicy, HooksFactory | creatorHandlers               |
| `creatorHandlers.ts`           | IPC bridge             | Facade, AuditSink              | preload API                   |
| `skill-creator-api.ts`         | renderer 向け API 公開 | IPC channels                   | renderer components           |
| `skillCreator.ts`              | 共有型契約             | なし                           | 全レイヤー                    |

### 7.2 依存グラフ

```
shared types (skillCreator.ts)
    ↑
    ├── GovernancePolicy ──────┐
    │                          │
    ├── AuditSink ─────────────┤
    │                          │
    ├── HooksFactory ──────────┤
    │      ↑ depends on        │
    │      ├── GovernancePolicy│
    │      └── AuditSink       │
    │                          │
    ├── Facade ────────────────┤
    │      ↑ depends on        │
    │      ├── GovernancePolicy│
    │      └── HooksFactory    │
    │                          │
    ├── creatorHandlers ───────┤
    │      ↑ depends on        │
    │      ├── Facade          │
    │      └── AuditSink       │
    │                          │
    └── skill-creator-api ─────┘
           ↑ depends on
           └── IPC channels
```

### 7.3 Facade 変更の最小化方針

`RuntimeSkillCreatorFacade` への変更は以下に限定する:

1. **constructor**: `GovernancePolicy` / `HooksFactory` / `AuditSink` を optional DI で追加
2. **plan()**: 冒頭に `this.hooksFactory?.createHooks("plan", ...)` を追加
3. **execute()**: 冒頭に `this.hooksFactory?.createHooks("execute", ...)` を追加
4. **improve()**: 冒頭に `this.hooksFactory?.createHooks("improve", ...)` を追加
5. **verifySkill()**: 冒頭に `this.hooksFactory?.createHooks("verify", ...)` を追加

既存の `plan()` / `execute()` / `improve()` のロジック本体は変更しない。hooks は wrap として追加するのみ。

---

## 8. 設計完了チェック

- [x] phase 別 policy が設計されている
- [x] hooks factory の責務が定義されている
- [x] audit / UI payload の責務が分離されている
- [x] canonical path と provenance の受け渡しが定義されている
- [x] IPC 4 層整合が確認されている
- [x] dependency boundary が明確である
- [x] 既存実装の破壊的変更が最小化されている
- [x] bypassPermissions の禁止が設計に組み込まれている
