# Phase 2: ガバナンス設計 (Governance Design)

## メタ情報

| 項目     | 値                                     |
| -------- | -------------------------------------- |
| タスクID | TASK-P0-09                             |
| 機能名   | claude-sdk-permission-hooks-governance |
| Phase    | 2                                      |
| 作成日   | 2026-03-31                             |

---

## 1. SkillCreatorSdkPolicy インターフェース設計

### 1.1 型定義

```typescript
/**
 * skill-creator lane の phase ごとの SDK permission policy
 *
 * Facade が SDK query() を呼び出す際に、phase に応じた
 * permissionMode / allowedTools / disallowedTools / canUseTool を注入する。
 */
export interface SkillCreatorSdkPolicy {
  /** 対象 phase */
  readonly phase: SkillCreatorGovernancePhase;

  /** SDK permissionMode */
  readonly permissionMode: "plan" | "acceptEdits";

  /** 許可するツール一覧 */
  readonly allowedTools: readonly string[];

  /** 明示的に拒否するツール一覧（省略時は allowedTools の補集合が暗黙拒否） */
  readonly disallowedTools?: readonly string[];

  /**
   * ツール使用の追加判定関数（省略時は allowedTools / disallowedTools のみで判定）
   * execute / improve phase で、書き込み先パスを skill target dir に制限するために使用
   */
  readonly canUseTool?: (
    toolName: string,
    input: Record<string, unknown>,
  ) => ToolUseDecision;
}

/** phase 識別子 */
export type SkillCreatorGovernancePhase =
  | "plan"
  | "execute"
  | "verify"
  | "improve";

/** canUseTool の判定結果 */
export interface ToolUseDecision {
  /** 許可 / 拒否 */
  readonly allowed: boolean;
  /** 拒否時の理由（UI 表示 / audit 記録用） */
  readonly reason?: string;
}
```

### 1.2 Phase 別 Policy 定義

```typescript
/**
 * phase 別の immutable な policy 定義
 * skillTargetDir は実行時に決定されるため、factory 関数で生成する。
 */
export function createPolicies(
  skillTargetDir: string,
): Record<SkillCreatorGovernancePhase, SkillCreatorSdkPolicy> {
  return {
    plan: {
      phase: "plan",
      permissionMode: "plan",
      allowedTools: ["Read", "Glob", "Grep", "Bash"],
      disallowedTools: ["Edit", "Write"],
    },

    execute: {
      phase: "execute",
      permissionMode: "acceptEdits",
      allowedTools: ["Read", "Edit", "Write", "Glob", "Grep", "Bash"],
      canUseTool: (toolName, input) =>
        checkWriteScope(toolName, input, skillTargetDir, ["Write", "Edit"]),
    },

    verify: {
      phase: "verify",
      permissionMode: "plan",
      allowedTools: ["Read", "Glob", "Grep", "Bash"],
      disallowedTools: ["Edit", "Write"],
    },

    improve: {
      phase: "improve",
      permissionMode: "acceptEdits",
      allowedTools: ["Read", "Edit", "Glob", "Grep"],
      disallowedTools: ["Write"],
      canUseTool: (toolName, input) =>
        checkWriteScope(toolName, input, skillTargetDir, ["Edit"]),
    },
  };
}

/**
 * 書き込み系ツールのスコープチェック
 * 指定ツールの file_path が skillTargetDir 配下であることを検証する
 */
function checkWriteScope(
  toolName: string,
  input: Record<string, unknown>,
  skillTargetDir: string,
  restrictedTools: string[],
): ToolUseDecision {
  if (!restrictedTools.includes(toolName)) {
    return { allowed: true };
  }

  const filePath =
    typeof input.file_path === "string" ? input.file_path : undefined;

  if (!filePath) {
    return {
      allowed: false,
      reason: `${toolName} に file_path が指定されていません`,
    };
  }

  // path traversal 対策: resolve 後に prefix 検証
  const resolved = path.resolve(filePath);
  const normalizedTarget = path.resolve(skillTargetDir);

  if (
    !resolved.startsWith(normalizedTarget + path.sep) &&
    resolved !== normalizedTarget
  ) {
    return {
      allowed: false,
      reason: `${toolName} は ${normalizedTarget} 配下のみ許可されています（要求: ${resolved}）`,
    };
  }

  return { allowed: true };
}
```

### 1.3 Facade への注入ポイント

```typescript
// RuntimeSkillCreatorFacade.ts への変更イメージ

export interface RuntimeSkillCreatorFacadeDeps {
  // ... 既存 deps ...
  /** phase 別 governance policy（省略時はガバナンスなし） */
  governanceHooksFactory?: SkillCreatorGovernanceHooksFactory;
}

// plan() メソッド内での使用例
async plan(skillSpec: string, authMode: AuthMode, apiKey: string | null) {
  const policy = this.governanceHooksFactory?.createPolicy("plan");
  const decision = await this.resolveDecision(authMode, apiKey);

  if (decision.type === "integrated_api") {
    // SDK query() に policy を注入
    const sdkOptions = {
      permissionMode: policy?.permissionMode ?? decision.permissionMode,
      allowedTools: policy?.allowedTools,
      disallowedTools: policy?.disallowedTools,
      hooks: this.governanceHooksFactory?.createHooks("plan"),
    };
    // ... SDK 呼び出し ...
  }
}
```

---

## 2. SkillCreatorGovernanceHooksFactory 設計

### 2.1 Factory インターフェース

```typescript
/**
 * phase に応じた SDK hooks を生成する factory
 *
 * 責務:
 * - phase 別の policy 生成
 * - SDK hooks (SessionStart / PreToolUse / PostToolUse / SessionEnd) 生成
 * - GovernanceAuditSink への event 委譲
 */
export interface SkillCreatorGovernanceHooksFactory {
  /**
   * phase 用の policy を生成する
   */
  createPolicy(phase: SkillCreatorGovernancePhase): SkillCreatorSdkPolicy;

  /**
   * phase 用の SDK hooks を生成する
   * hooks は内部で GovernanceAuditSink に event を記録する
   */
  createHooks(
    phase: SkillCreatorGovernancePhase,
    context?: GovernanceHooksContext,
  ): SkillCreatorGovernanceHooks;
}

/**
 * hooks 生成時の追加コンテキスト
 */
export interface GovernanceHooksContext {
  /** スキル名（skill target dir 解決に使用） */
  skillName?: string;
  /** 明示的な skill target dir */
  skillTargetDir?: string;
  /** plan ID（workflow tracking 用） */
  planId?: string;
  /** source provenance */
  sourceProvenance?: GovernanceProvenance;
}

/**
 * SDK に渡す hooks オブジェクト
 * Claude Code SDK の hooks 契約に準拠
 */
export interface SkillCreatorGovernanceHooks {
  onSessionStart?: (event: SdkSessionStartEvent) => void | Promise<void>;
  onPreToolUse?: (
    event: SdkPreToolUseEvent,
  ) => ToolUseDecision | Promise<ToolUseDecision>;
  onPostToolUse?: (event: SdkPostToolUseEvent) => void | Promise<void>;
  onSessionEnd?: (event: SdkSessionEndEvent) => void | Promise<void>;
}

// SDK イベント型（SDK 契約に合わせた薄い wrapper）
export interface SdkSessionStartEvent {
  sessionId: string;
  timestamp: string;
}

export interface SdkPreToolUseEvent {
  toolName: string;
  toolInput: Record<string, unknown>;
}

export interface SdkPostToolUseEvent {
  toolName: string;
  duration: number;
  success: boolean;
}

export interface SdkSessionEndEvent {
  sessionId: string;
  timestamp: string;
}
```

### 2.2 Factory 実装設計

```typescript
/**
 * SkillCreatorGovernanceHooksFactory の具体実装
 */
export class DefaultGovernanceHooksFactory implements SkillCreatorGovernanceHooksFactory {
  constructor(
    private readonly auditSink: GovernanceAuditSink,
    private readonly defaultSkillTargetDir: string,
  ) {}

  createPolicy(phase: SkillCreatorGovernancePhase): SkillCreatorSdkPolicy {
    const policies = createPolicies(this.defaultSkillTargetDir);
    return policies[phase];
  }

  createHooks(
    phase: SkillCreatorGovernancePhase,
    context?: GovernanceHooksContext,
  ): SkillCreatorGovernanceHooks {
    const policy = this.createPolicy(phase);
    const sink = this.auditSink;

    // session-scoped な state
    const sessionState: GovernanceSessionState = {
      sessionId: "",
      phase,
      startTime: 0,
      toolCalls: 0,
      denials: 0,
      toolBreakdown: {},
    };

    return {
      onSessionStart: (event) => {
        sessionState.sessionId = event.sessionId;
        sessionState.startTime = Date.now();

        sink.record({
          timestamp: event.timestamp,
          sessionId: event.sessionId,
          phase,
          eventKind: "session_start",
          provenance: context?.sourceProvenance ?? {
            sourceRoot: this.defaultSkillTargetDir,
            permissionMode: policy.permissionMode,
            allowedTools: [...policy.allowedTools],
            disallowedTools: policy.disallowedTools
              ? [...policy.disallowedTools]
              : undefined,
          },
        });
      },

      onPreToolUse: (event) => {
        sessionState.toolCalls++;
        sessionState.toolBreakdown[event.toolName] =
          (sessionState.toolBreakdown[event.toolName] ?? 0) + 1;

        // Step 1: allowedTools チェック
        if (!policy.allowedTools.includes(event.toolName)) {
          sessionState.denials++;
          const reason = `${event.toolName} は ${phase} phase で許可されていません`;
          sink.record({
            timestamp: new Date().toISOString(),
            sessionId: sessionState.sessionId,
            phase,
            eventKind: "tool_request",
            toolName: event.toolName,
            decision: "deny",
            reason,
          });
          return { allowed: false, reason };
        }

        // Step 2: disallowedTools チェック
        if (policy.disallowedTools?.includes(event.toolName)) {
          sessionState.denials++;
          const reason = `${event.toolName} は ${phase} phase で明示的に禁止されています`;
          sink.record({
            timestamp: new Date().toISOString(),
            sessionId: sessionState.sessionId,
            phase,
            eventKind: "tool_request",
            toolName: event.toolName,
            decision: "deny",
            reason,
          });
          return { allowed: false, reason };
        }

        // Step 3: canUseTool チェック
        if (policy.canUseTool) {
          const decision = policy.canUseTool(event.toolName, event.toolInput);
          if (!decision.allowed) {
            sessionState.denials++;
          }
          sink.record({
            timestamp: new Date().toISOString(),
            sessionId: sessionState.sessionId,
            phase,
            eventKind: "tool_request",
            toolName: event.toolName,
            decision: decision.allowed ? "allow" : "deny",
            reason: decision.reason,
          });
          return decision;
        }

        // 全チェック通過
        sink.record({
          timestamp: new Date().toISOString(),
          sessionId: sessionState.sessionId,
          phase,
          eventKind: "tool_request",
          toolName: event.toolName,
          decision: "allow",
        });
        return { allowed: true };
      },

      onPostToolUse: (event) => {
        sink.record({
          timestamp: new Date().toISOString(),
          sessionId: sessionState.sessionId,
          phase,
          eventKind: "tool_result",
          toolName: event.toolName,
          toolResult: {
            duration: event.duration,
            success: event.success,
          },
        });
      },

      onSessionEnd: (event) => {
        const sessionDuration = Date.now() - sessionState.startTime;
        sink.record({
          timestamp: event.timestamp,
          sessionId: event.sessionId,
          phase,
          eventKind: "session_end",
          sessionSummary: {
            totalToolCalls: sessionState.toolCalls,
            denialCount: sessionState.denials,
            sessionDuration,
            toolBreakdown: { ...sessionState.toolBreakdown },
          },
        });
      },
    };
  }
}

/** hooks 内部のセッション状態（hooks 生成ごとに独立） */
interface GovernanceSessionState {
  sessionId: string;
  phase: SkillCreatorGovernancePhase;
  startTime: number;
  toolCalls: number;
  denials: number;
  toolBreakdown: Record<string, number>;
}
```

---

## 3. GovernanceAuditSink 設計

### 3.1 インターフェース

```typescript
/**
 * ガバナンス監査イベントの収集と保存を担う sink
 *
 * 設計原則:
 * - append-only: 記録済みイベントの変更・削除は不可
 * - 同期記録: record() は同期的に完了する（I/O は非同期バッファリング）
 * - メモリ制限: 最大イベント数を超えた場合は古いイベントを drop する
 */
export interface GovernanceAuditSink {
  /**
   * 監査イベントを記録する
   */
  record(event: GovernanceAuditEvent): void;

  /**
   * 記録済みイベントを取得する（フィルタ付き）
   */
  getEvents(filter?: GovernanceAuditFilter): readonly GovernanceAuditEvent[];

  /**
   * セッション別のサマリーを取得する
   */
  getSessionSummary(sessionId: string): GovernanceSessionSummary | undefined;

  /**
   * 全イベントをクリアする（テスト用）
   */
  clear(): void;
}

export interface GovernanceAuditFilter {
  sessionId?: string;
  phase?: SkillCreatorGovernancePhase;
  eventKind?: GovernanceAuditEvent["eventKind"];
  decision?: "allow" | "deny";
  /** 指定タイムスタンプ以降のイベントのみ */
  since?: string;
}

export interface GovernanceSessionSummary {
  sessionId: string;
  phase: SkillCreatorGovernancePhase;
  totalToolCalls: number;
  denialCount: number;
  sessionDuration: number;
  toolBreakdown: Record<string, number>;
  deniedTools: Array<{
    toolName: string;
    reason: string;
    timestamp: string;
  }>;
}
```

### 3.2 実装設計

```typescript
/**
 * インメモリ実装の GovernanceAuditSink
 * セッション単位でイベントを保持し、最大数を超えたら古いものから drop する
 */
export class InMemoryGovernanceAuditSink implements GovernanceAuditSink {
  private readonly events: GovernanceAuditEvent[] = [];
  private readonly maxEvents: number;

  constructor(options?: { maxEvents?: number }) {
    this.maxEvents = options?.maxEvents ?? 10000;
  }

  record(event: GovernanceAuditEvent): void {
    this.events.push(Object.freeze({ ...event }));
    if (this.events.length > this.maxEvents) {
      this.events.shift();
    }
  }

  getEvents(filter?: GovernanceAuditFilter): readonly GovernanceAuditEvent[] {
    if (!filter) {
      return [...this.events];
    }

    return this.events.filter((event) => {
      if (filter.sessionId && event.sessionId !== filter.sessionId)
        return false;
      if (filter.phase && event.phase !== filter.phase) return false;
      if (filter.eventKind && event.eventKind !== filter.eventKind)
        return false;
      if (filter.decision && event.decision !== filter.decision) return false;
      if (filter.since && event.timestamp < filter.since) return false;
      return true;
    });
  }

  getSessionSummary(sessionId: string): GovernanceSessionSummary | undefined {
    const sessionEvents = this.events.filter(
      (event) => event.sessionId === sessionId,
    );
    if (sessionEvents.length === 0) return undefined;

    const endEvent = sessionEvents.find(
      (event) => event.eventKind === "session_end",
    );
    const startEvent = sessionEvents.find(
      (event) => event.eventKind === "session_start",
    );

    const deniedEvents = sessionEvents.filter(
      (event) => event.decision === "deny",
    );

    return {
      sessionId,
      phase: startEvent?.phase ?? sessionEvents[0].phase,
      totalToolCalls: endEvent?.sessionSummary?.totalToolCalls ?? 0,
      denialCount: endEvent?.sessionSummary?.denialCount ?? deniedEvents.length,
      sessionDuration: endEvent?.sessionSummary?.sessionDuration ?? 0,
      toolBreakdown: endEvent?.sessionSummary?.toolBreakdown ?? {},
      deniedTools: deniedEvents.map((event) => ({
        toolName: event.toolName ?? "unknown",
        reason: event.reason ?? "unknown",
        timestamp: event.timestamp,
      })),
    };
  }

  clear(): void {
    this.events.length = 0;
  }
}
```

---

## 4. UI 向け Permission Denial ペイロード設計

### 4.1 型定義

```typescript
/**
 * renderer に送信する permission denial 通知
 * 既存の SkillCreatorSdkPermissionDenial を拡張し、governance 情報を追加
 */
export interface GovernancePermissionDenialPayload {
  /** セッション ID */
  sessionId: string;

  /** 拒否された phase */
  phase: SkillCreatorGovernancePhase;

  /** 拒否されたツール名 */
  toolName: string;

  /** 拒否理由（ユーザー向けメッセージ） */
  reason: string;

  /** 拒否の種別 */
  denialKind:
    | "not_in_allowed_tools"
    | "in_disallowed_tools"
    | "scope_violation"
    | "custom_policy";

  /** スコープ違反の場合の詳細 */
  scopeDetail?: {
    /** 要求されたパス */
    requestedPath: string;
    /** 許可されたスコープ */
    allowedScope: string;
  };

  /** タイムスタンプ */
  timestamp: string;
}

/**
 * renderer 向けの governance 状態スナップショット
 * IPC 経由で UI に公開される
 */
export interface GovernanceStateSnapshot {
  /** 現在の phase */
  currentPhase: SkillCreatorGovernancePhase;

  /** 適用中の permissionMode */
  permissionMode: string;

  /** 許可ツール一覧 */
  allowedTools: readonly string[];

  /** 最近の denial 一覧（最大 10 件） */
  recentDenials: GovernancePermissionDenialPayload[];

  /** セッション中の合計 denial 数 */
  totalDenials: number;

  /** source provenance（表示用の要約） */
  provenanceSummary?: {
    sourceRoot: string;
    manifestHash?: string;
  };
}
```

### 4.2 IPC チャネル設計

```typescript
/**
 * governance 関連の IPC チャネル定義
 * 既存の skill-creator IPC チャネルに追加する形で設計
 */
export const GOVERNANCE_IPC_CHANNELS = {
  /** governance 状態スナップショット取得 */
  GET_GOVERNANCE_STATE: "skill-creator:governance-state",

  /** permission denial イベント（main → renderer push） */
  PERMISSION_DENIAL_EVENT: "skill-creator:permission-denial",

  /** audit イベント一覧取得（デバッグ / 管理画面用） */
  GET_AUDIT_EVENTS: "skill-creator:audit-events",
} as const;
```

### 4.3 UI 表示の設計方針

1. **リアルタイム通知**: PreToolUse で deny が発生したら、即座に renderer へ push する
2. **非ブロッキング**: denial 通知は toast / notification UI で表示し、ユーザー操作をブロックしない
3. **理由の明示**: denial 理由は日本語で、具体的なパスやツール名を含める
4. **集約表示**: セッション中の denial 統計を governance 状態パネルで表示可能

---

## 5. 全体アーキテクチャ図

```text
┌─────────────────────────────────────────────────────────────┐
│                   RuntimeSkillCreatorFacade                   │
│                                                              │
│  plan() ─┐                                                   │
│  execute()┼── resolveDecision() ── RuntimePolicyResolver     │
│  verify() ┤                                                   │
│  improve()┘                                                   │
│       │                                                       │
│       ▼                                                       │
│  GovernanceHooksFactory.createPolicy(phase)                   │
│  GovernanceHooksFactory.createHooks(phase)                    │
│       │                                                       │
│       ▼                                                       │
│  ┌──────────────────────────────────────┐                    │
│  │ SkillCreatorGovernanceHooks          │                    │
│  │                                      │                    │
│  │  onSessionStart ─┐                  │                    │
│  │  onPreToolUse  ──┤── record() ──▶ GovernanceAuditSink   │
│  │  onPostToolUse ──┤                  │                    │
│  │  onSessionEnd  ──┘                  │                    │
│  └──────────────────────────────────────┘                    │
│       │                                                       │
│       ▼                                                       │
│  SDK query() に hooks + policy を注入                        │
│       │                                                       │
│       ▼                                                       │
│  Claude Code SDK（動的 skill-creator 実行）                  │
└─────────────────────────────────────────────────────────────┘
        │
        ▼ (IPC push on denial)
┌─────────────────────────────────────────┐
│            Renderer (UI)                 │
│                                          │
│  GovernanceStateSnapshot 表示            │
│  Permission Denial 通知                  │
└─────────────────────────────────────────┘
```

---

## 6. 既存コードとの統合ポイント

| 変更対象ファイル                                | 変更内容                                               |
| ----------------------------------------------- | ------------------------------------------------------ |
| `RuntimeSkillCreatorFacade.ts`                  | deps に `governanceHooksFactory` 追加、各 phase で注入 |
| `RuntimePolicyResolver.ts`                      | 変更なし（既存の `permissionMode` はそのまま）         |
| `packages/shared/src/types/skillCreator.ts`     | `GovernanceAuditEvent` 等の型追加                      |
| `apps/desktop/src/main/ipc/index.ts`            | governance IPC チャネル追加                            |
| `apps/desktop/src/preload/skill-creator-api.ts` | governance 状態 / denial 取得 API 追加                 |

---

## 7. 設計判断の記録

| 判断項目                        | 決定                                     | 理由                                                   |
| ------------------------------- | ---------------------------------------- | ------------------------------------------------------ |
| audit sink のストレージ         | インメモリ（append-only リングバッファ） | ファイル I/O を避け、セッション寿命で十分              |
| canUseTool の path 検証         | `path.resolve` + prefix 比較             | path traversal 攻撃を防止                              |
| denial 通知の方式               | IPC push（main → renderer）              | ポーリングより即時性が高い                             |
| hooks と主処理の関係            | 監査のみ（ブロックは PreToolUse のみ）   | 主処理を阻害しない設計原則を維持                       |
| GovernanceHooksFactory の所有者 | RuntimeSkillCreatorFacade                | Facade が phase を知っているため、factory 生成を委ねる |
