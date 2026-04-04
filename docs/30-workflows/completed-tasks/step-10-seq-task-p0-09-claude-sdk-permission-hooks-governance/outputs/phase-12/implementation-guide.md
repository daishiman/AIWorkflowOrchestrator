# Implementation Guide

## Part 1: 中学生にもわかる説明 — Permission / Hooks / Audit とは何か

### なぜ必要か

AI が自動でファイルを読み書きするとき、勝手に大事なファイルを壊したり、見てはいけないファイルを覗いたりしないようにルールが必要になる。このルールのことを「ガバナンス」と呼ぶ。ルールがなければ、「計画を立てる段階」のはずなのにファイルを書き換えてしまったり、「確認する段階」のはずなのに新しいファイルを作ってしまったりする。段階ごとに「できること」を分けておかないと、安全に作業を進められない。

### 日常生活での例え

たとえば、学校の図書室を思い浮かべてほしい。

- **読書の時間（plan phase）**: 本を読めるけど書き込みはできない。
- **美術の時間（execute phase）**: 作品を作れるけど、自分の画用紙にだけ。他の人の画用紙には描けない。
- **テストの時間（verify phase）**: 答案を確認するだけで書き直しはできない。
- **添削の時間（improve phase）**: 赤ペンで修正できるけど、新しい答案用紙を追加することはできない。

この仕組みは 3 つの役割で成り立っている。

1. **ルールブック（Policy）**: 各時間で何ができるかを決める
2. **見守り係（Hooks）**: 生徒が何をしようとしたか、その場で確認して通すか止めるか判断する
3. **活動記録ノート（Audit Sink）**: 誰が何をしたか全部書き留めておく

### この機能でできること

| 機能                 | 説明                                       | 例                                            |
| -------------------- | ------------------------------------------ | --------------------------------------------- |
| Phase 別アクセス制御 | 実行フェーズごとに使えるツールを制限する   | plan 時はファイル読み取りのみ                 |
| ツール使用監査       | どのツールがいつ使われたか記録する         | Write ツールが 3 回使われた                   |
| 拒否理由の表示       | 操作が拒否された理由を UI に表示する       | 「plan phase では Edit は禁止」               |
| パス制限             | 書き込み先をスキルディレクトリ内に限定する | `~/.claude/skills/my-skill/` のみ書き込み可能 |

---

## Part 2: 開発者向け技術詳細

### 型定義

`packages/shared/src/types/skillCreator.ts` に以下の governance 関連型を定義している。

```typescript
type SkillCreatorGovernancePhase = "plan" | "execute" | "verify" | "improve";

type SdkPermissionMode =
  | "default"
  | "acceptEdits"
  | "bypassPermissions"
  | "plan";

interface SkillCreatorSdkPolicy {
  phase: SkillCreatorGovernancePhase;
  permissionMode: SdkPermissionMode;
  allowedTools: string[];
  disallowedTools?: string[];
}

interface CanUseToolResult {
  allowed: boolean;
  reason?: string;
}

type GovernanceAuditEventKind =
  | "session_start"
  | "pre_tool_use"
  | "post_tool_use"
  | "tool_denied"
  | "session_end";

interface GovernanceAuditEvent {
  timestamp: string;
  sessionId?: string;
  phase: SkillCreatorGovernancePhase;
  eventKind: GovernanceAuditEventKind;
  toolName?: string;
  decision?: "allow" | "deny";
  reason?: string;
  durationMs?: number;
  provenance?: SkillCreatorWorkflowSourceProvenance;
  metadata?: Record<string, unknown>;
}

interface GovernanceSessionSummary {
  sessionId?: string;
  phase: SkillCreatorGovernancePhase;
  totalToolCalls: number;
  deniedToolCalls: number;
  allowedToolNames: string[];
  deniedToolNames: string[];
  durationMs: number;
  provenance?: SkillCreatorWorkflowSourceProvenance;
}

interface GovernanceUiPayload {
  phase: SkillCreatorGovernancePhase;
  permissionMode: SdkPermissionMode;
  activePolicyToolCount: number;
  recentDenials: GovernanceAuditEvent[];
  sessionSummary?: GovernanceSessionSummary;
}
```

### API シグネチャ

#### SkillCreatorGovernancePolicy

```typescript
// Phase 別ポリシーを取得する
function getPolicyForPhase(
  phase: SkillCreatorGovernancePhase,
): SkillCreatorSdkPolicy;

// canUseTool コールバックを生成する
function createCanUseToolCallback(
  phase: SkillCreatorGovernancePhase,
  skillTargetDir?: string,
): (toolName: string, toolInput: Record<string, unknown>) => CanUseToolResult;
```

#### GovernanceHooksFactory

```typescript
function createGovernanceHooks(options: GovernanceHooksFactoryOptions): {
  hooks: GovernanceHooks;
  auditSink: GovernanceAuditSink;
};

interface GovernanceHooksFactoryOptions {
  phase: SkillCreatorGovernancePhase;
  sessionId?: string;
  skillTargetDir?: string;
  provenance?: SkillCreatorWorkflowSourceProvenance;
  auditSink?: GovernanceAuditSink;
}

interface GovernanceHooks {
  SessionStart?: (
    input: { sessionId?: string },
    toolUseId: string,
    context: { signal: AbortSignal },
  ) => Promise<Record<string, never>>;
  PreToolUse?: (
    input: { toolName: string; args: Record<string, unknown> },
    toolUseId: string,
    context: { signal: AbortSignal },
  ) => Promise<{ proceed: boolean; message?: string }>;
  PostToolUse?: (
    input: { toolName: string; result?: unknown; durationMs?: number },
    toolUseId: string,
    context: { signal: AbortSignal },
  ) => Promise<Record<string, never>>;
  SessionEnd?: (
    input: { sessionId?: string },
    toolUseId: string,
    context: { signal: AbortSignal },
  ) => Promise<Record<string, never>>;
}
```

#### SkillExecutor governance options

```typescript
interface SkillExecutionGovernanceOptions {
  permissionMode?:
    | "default"
    | "acceptEdits"
    | "bypassPermissions"
    | "plan"
    | "delegate"
    | "dontAsk";
  hooks?: Record<string, unknown>;
  permissions?: Record<string, unknown>;
}
```

#### GovernanceAuditSink

```typescript
class GovernanceAuditSink {
  record(event: GovernanceAuditEvent): void;
  getEvents(): readonly GovernanceAuditEvent[];
  getRecentDenials(
    limit?: number,
    phase?: SkillCreatorGovernancePhase,
    sessionId?: string,
  ): GovernanceAuditEvent[];
  buildSessionSummary(
    phase: SkillCreatorGovernancePhase,
    sessionId?: string,
    provenance?: SkillCreatorWorkflowSourceProvenance,
  ): GovernanceSessionSummary;
  buildUiPayload(
    phase: SkillCreatorGovernancePhase,
    sessionId?: string,
    provenance?: SkillCreatorWorkflowSourceProvenance,
  ): GovernanceUiPayload;
  clear(): void;
}
```

#### RuntimeSkillCreatorFacade（governance 拡張）

```typescript
class RuntimeSkillCreatorFacade {
  getGovernanceUiPayload(
    phase: SkillCreatorGovernancePhase,
  ): GovernanceUiPayload;
  getGovernanceAuditEvents(): readonly GovernanceAuditEvent[];
  private resolveSkillTargetDir(skillName: string): string;
}
```

### 使用例

#### ポリシー取得と canUseTool

```typescript
import {
  getPolicyForPhase,
  createCanUseToolCallback,
} from "./SkillCreatorGovernancePolicy";

const policy = getPolicyForPhase("plan");
// => { phase: "plan", permissionMode: "plan", allowedTools: ["Read","Glob","Grep","Bash"], disallowedTools: ["Edit","Write"] }

const canUseTool = createCanUseToolCallback("plan");
const result = canUseTool("Edit", { file_path: "/some/path" });
// => { allowed: false, reason: 'Tool "Edit" is disallowed in plan phase' }
```

#### Hooks 生成と監査

```typescript
import { createGovernanceHooks } from "./GovernanceHooksFactory";

const { hooks, auditSink } = createGovernanceHooks({
  phase: "execute",
  sessionId: "plan-123",
  skillTargetDir: "/home/user/.claude/skills/my-skill",
});

await hooks.SessionStart?.({ sessionId: "plan-123" }, "", {
  signal: new AbortController().signal,
});
const decision = await hooks.PreToolUse?.(
  {
    toolName: "Write",
    args: { file_path: "/home/user/.claude/skills/my-skill/SKILL.md" },
  },
  "",
  { signal: new AbortController().signal },
);
// => { proceed: true }

const payload = auditSink.buildUiPayload("execute", "plan-123");
// => { phase: "execute", permissionMode: "acceptEdits", activePolicyToolCount: 6, ... }
```

#### IPC 経由の governance 状態取得

```typescript
// renderer 側
const payload = await window.skillCreatorApi.getGovernancePayload("execute");
// => GovernanceUiPayload
```

#### 現在の接続範囲

- execute phase は `RuntimeSkillCreatorFacade.execute()` から `SkillExecutor.execute(..., governanceOptions)` へ `permissionMode` / `hooks` を伝播する
- plan / verify / improve は policy 定義と型は揃っているが、同じ enforcement を runtime 全経路へ広げる follow-up は別タスク化している
- renderer 可視化は public payload まで公開済みで、画面表示そのものは follow-up で実装する

### Phase ポリシー定数表

| Phase   | permissionMode | allowedTools                        | disallowedTools |
| ------- | -------------- | ----------------------------------- | --------------- |
| plan    | `plan`         | Read, Glob, Grep, Bash              | Edit, Write     |
| execute | `acceptEdits`  | Read, Edit, Write, Glob, Grep, Bash | (なし)          |
| verify  | `plan`         | Read, Glob, Grep, Bash              | Edit, Write     |
| improve | `acceptEdits`  | Read, Edit, Glob, Grep              | Write           |

### エラーハンドリング

`canUseTool` は例外を投げない。ポリシー違反の場合は `{ allowed: false, reason: "..." }` を返す。Hooks も例外を投げない設計であり、監査イベントの記録に失敗しても SDK 実行は中断されない。

| 状況           | 動作                                                                                          |
| -------------- | --------------------------------------------------------------------------------------------- |
| 禁止ツール使用 | `{ allowed: false, reason: 'Tool "X" is disallowed in Y phase' }`                             |
| 未知ツール使用 | `{ allowed: false, reason: 'Tool "X" is not in the allowed list for Y phase' }`               |
| パス制限違反   | `{ allowed: false, reason: 'Write is restricted to "dir" in execute phase. Target: "path"' }` |

### エッジケース

| ケース                                         | 動作                                                                                           |
| ---------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| 未知のツール名                                 | allowedTools に含まれないため `{ allowed: false }`                                             |
| `file_path` が空文字列                         | `{ allowed: false, reason: "... file_path/path ..." }` を返して拒否                            |
| `file_path` 未指定（`toolInput` に含まれない） | `{ allowed: false, reason: "... file_path/path ..." }` を返して拒否                            |
| null byte を含むパス                           | `{ allowed: false, reason: "... 無効なパス ..." }` を返して拒否                                |
| パストラバーサル（`../` を含む）               | `path.resolve` / `path.relative` で target dir 外と判定し拒否                                  |
| `skillTargetDir` 未指定                        | execute / improve の Write/Edit は拒否                                                         |
| `auditSink` 未指定で hooks 生成                | 新規 `GovernanceAuditSink` インスタンスが自動生成される                                        |
| execute 失敗時                                 | 失敗結果は facade 側で review-ready state に保存され、hook 記録は SDK ライフサイクルに委譲する |
| 複数 phase / session の監査混在                | `GovernanceAuditSink` が phase / session 単位で denial / summary を絞り込む                    |

### 設定項目・定数一覧

| 項目                              | 設定箇所                                         | 説明                                               |
| --------------------------------- | ------------------------------------------------ | -------------------------------------------------- |
| `PHASE_POLICIES`                  | `SkillCreatorGovernancePolicy.ts`                | 4 phase 分のポリシー定数。`as const` で固定        |
| `skillTargetDir`                  | `createCanUseToolCallback` 第 2 引数             | execute/improve 時の書き込み許可ディレクトリ       |
| `limit`                           | `GovernanceAuditSink.getRecentDenials` 第 1 引数 | 直近 denial 取得件数（デフォルト 10）              |
| `phase`                           | `GovernanceAuditSink.getRecentDenials` 第 2 引数 | denial を phase 単位で絞り込む                     |
| `sessionId`                       | `GovernanceAuditSink.getRecentDenials` 第 3 引数 | denial を session 単位で絞り込む                   |
| `SKILL_CREATOR_GET_GOVERNANCE`    | `channels.ts`                                    | IPC チャネル名 `"skill-creator:get-governance"`    |
| `SkillExecutionGovernanceOptions` | `SkillExecutor.execute()` 第 3 引数              | SDK へ permissionMode / hooks / permissions を渡す |

### Phase 11 visual evidence

- 本タスクで追加したのは execute governance wiring と payload 契約であり、renderer 上の governance 表示 UI は未実装
- そのため screenshot evidence は N/A とし、UI surface は `UT-P0-09-GOVERNANCE-RUNTIME-COVERAGE-AND-UI-SURFACE-001` へ分離した

### IPC エンドポイント

| チャネル                       | リクエスト                               | レスポンス                       |
| ------------------------------ | ---------------------------------------- | -------------------------------- |
| `skill-creator:get-governance` | `{ phase: SkillCreatorGovernancePhase }` | `IpcResult<GovernanceUiPayload>` |
