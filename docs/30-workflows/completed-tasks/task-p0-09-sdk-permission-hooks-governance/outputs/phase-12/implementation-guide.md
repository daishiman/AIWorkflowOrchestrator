# SDK ガバナンス基盤 実装ガイド

## Part 1: やさしい説明（中学生レベル）

### なぜ必要なの？

スキルクリエイターという AI アシスタントが、あなたのパソコンの中でいろいろな作業をします。
でも、AI がどんなファイルでも自由に書き換えられると困りますよね？

たとえば「設計を考える（plan）フェーズ」では、AI は読むだけでよく、
ファイルを書き換えるのは「実際に作る（execute）フェーズ」だけにしたいです。

### 何をしているの？

**許可証（permission）の仕組み**:
スーパーのアルバイトが「品出しはOK、レジ操作はNG」と決まっているように、
AI にも「このフェーズではこのツールだけ使えるよ」とルールを設定します。

- plan フェーズ：読むだけOK（Write/Edit は禁止）
- execute フェーズ：ファイルを書いてもOK
- verify フェーズ：テストを実行するだけOK（書き換え禁止）
- improve フェーズ：既存ファイルの編集だけOK（新規作成は禁止）

**監視カメラ（hooks）の仕組み**:
AI が何かをしようとするとき（before）と、した後（after）に記録をつけます。
コンビニの防犯カメラみたいなものです。

**記録帳（audit）の仕組み**:
「いつ・誰が・何のツールを・使ったか」を手帳に書き留めます。
後で何か問題があったとき、この記録帳を見れば原因がわかります。
記録は最大 500件まで保存され、それ以上は古いものから消えます。

---

## Part 2: 技術者向け詳細説明

### アーキテクチャ概要

```
RuntimeSkillCreatorFacade
    └── createGovernanceHooks(phase)
          ├── SkillCreatorPermissionPolicy  (policy テーブル定義)
          ├── SkillCreatorHooksFactory      (lifecycle hooks 生成)
          └── SkillCreatorAuditSink         (in-memory ring buffer)
```

### 1. SkillCreatorPermissionPolicy

```typescript
import { getPolicy, canUseTool, getAllPolicies } from "./governance";

// phase別 policy 取得
const policy = getPolicy("execute");
// {
//   phase: 'execute',
//   permissionMode: 'acceptEdits',
//   allowedTools: ['Read', 'Glob', 'Grep', 'Bash', 'Agent', 'Write', 'Edit'],
//   disallowedTools: ['NotebookEdit']
// }

// ツール使用可否判定
const decision = canUseTool("Write", "execute");
// { allowed: true, reason: '...', phase: 'execute', toolName: 'Write' }

const denied = canUseTool("Write", "plan");
// { allowed: false, reason: 'Tool "Write" is disallowed in phase "plan"', ... }

// コンテキスト付き判定（path-scoped、U1で実配線）
const contextDecision = canUseTool("Write", "execute", {
  targetPath: "/skills/my-skill/SKILL.md",
  allowedSkillRoot: "/skills/my-skill",
});
```

### 2. SkillCreatorAuditSink

```typescript
import { SkillCreatorAuditSink } from "./governance";

const auditSink = new SkillCreatorAuditSink(500); // maxEvents: 500（デフォルト）

// イベント記録
auditSink.recordEvent({
  eventType: "pre_tool_use",
  sessionId: "session-uuid-1",
  phase: "execute",
  toolName: "Write",
  decision: {
    allowed: true,
    reason: "...",
    phase: "execute",
    toolName: "Write",
  },
});

// イベント取得
auditSink.getEvents(); // 全イベント（read-only コピー）
auditSink.getRecentEvents(20); // 直近 N 件
auditSink.getEventsBySession("session-1"); // session 別フィルタ
auditSink.getDenialEvents(); // denial のみ
auditSink.clear(); // session 終了時にリセット
auditSink.size; // 現在の件数
```

### 3. SkillCreatorHooksFactory

```typescript
import { createHooks } from "./governance";

const hooks = createHooks("execute", auditSink, provenance);

hooks.onSessionStart({ sessionId: "session-1" });

const decision = hooks.onPreToolUse({
  sessionId: "session-1",
  toolName: "Write",
});
// decision.allowed === true → SDK に許可

hooks.onPostToolUse({
  sessionId: "session-1",
  toolName: "Write",
  success: true,
});

hooks.onSessionEnd({ sessionId: "session-1", summary: "Execute completed" });
```

### 4. RuntimeSkillCreatorFacade.getGovernanceState()

IPC 経由で renderer から governance 状態を参照する:

```typescript
// 返り値: SkillCreatorGovernanceState
const state = facade.getGovernanceState();
// {
//   phase: 'execute',
//   activePolicy: { phase: 'execute', permissionMode: 'acceptEdits', ... },
//   recentAuditEvents: [...],  // 直近 20 件
//   recentDenials: [...]       // 直近 denial イベント
// }
```

### エラーハンドリング

- `onSessionEnd` は `try/finally` ブロックで呼ばれるため、早期リターン時も必ず記録される
- ring buffer は maxEvents 超過時に自動トリムするため、メモリリークなし
- `_input` 未使用: `createExecuteGovernanceCanUseTool()` の context-aware 判定は TASK-P0-09-U1 で実装予定

### 設定可能パラメータ

| パラメータ      | 場所                                | デフォルト | 説明               |
| --------------- | ----------------------------------- | ---------- | ------------------ |
| maxEvents       | `SkillCreatorAuditSink` constructor | 500        | ring buffer 上限   |
| permissionMode  | POLICY_TABLE                        | phase 別   | SDK permissionMode |
| allowedTools    | POLICY_TABLE                        | phase 別   | 許可ツールリスト   |
| disallowedTools | POLICY_TABLE                        | phase 別   | 禁止ツールリスト   |

### テスト証跡

- Phase 11 自動テスト: 5ファイル / 90件 / 全PASS（2026-04-06）
- typecheck: EXIT:0 / lint: warning-only（0 errors / 10 warnings）

**作成日**: 2026-04-06
