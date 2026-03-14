# Phase 2 設計 - 設計サマリー

## メタ情報

| 項目       | 内容                                     |
| ---------- | ---------------------------------------- |
| タスクID   | TASK-IMP-SKILL-AGENT-RUNTIME-ROUTING-001 |
| Phase      | 2                                        |
| 作成日     | 2026-03-14                               |
| ステータス | completed                                |

---

## 1. 設計方針

| 方針                | 詳細                                                                                   |
| ------------------- | -------------------------------------------------------------------------------------- |
| 単一 runtime policy | Skill / Agent / Creator 全 surface が `RuntimePolicyResolver` を共有                   |
| 入口解決            | access capability の解決は execute 入口（Main Process）で行う。Renderer では判定しない |
| role 非露出         | internal role（Planner/Executor/Improver）は UI に露出しない。job 名で統一             |
| permission 再利用   | 既存 preflight / PermissionResolver / PermissionStore を再利用する                     |
| terminal handoff    | `claude_code` モードまたは API key 不在時は terminal handoff を返す（エラーではない）  |

---

## 2. 責務境界

### 2.1 レイヤー設計

```
[Renderer]
  └─ AuthMode Store (Zustand)  ← auth-mode 値の参照のみ
  └─ useSkillExecution / useAgent  ← UI state management
  └─ UI Components (execution bar / permission dialog / handoff card)

[IPC / Preload]
  └─ skill:execute / agent:query / creator:plan|execute|improve
  └─ skill:stream / agent:stream  ← streaming events

[Main / RuntimePolicyResolver]  ← NEW: 共通 runtime policy 解決
  └─ resolveRuntime(authMode, apiKey): RuntimeDecision
       ├─ RuntimeDecision.type = "integrated_api"
       │    → engine = SDK query()
       └─ RuntimeDecision.type = "terminal_handoff"
             → handoff = { launcher, promptBundle, cwd, runbook }

[Main / SkillExecutor]
  └─ execute(request, skill, runtimeDecision)
       ├─ integrated_api → callSDKQuery()
       └─ terminal_handoff → buildHandoffBundle()

[Main / AgentExecutor]
  └─ start(request, runtimeDecision)
       ├─ integrated_api → SDK query()
       └─ terminal_handoff → buildHandoffBundle()

[Main / SkillCreatorService]  ← 設計対象（未実装）
  └─ plan(spec) → Planner role
  └─ execute(skill) → Executor role → SkillExecutor 委譲
  └─ improve(result) → Improver role

[Terminal Surface]
  └─ ClaudeCliManager / ipc-handler.ts
       └─ executeScript() → claude CLI process
```

### 2.2 RuntimePolicyResolver 設計

```typescript
// 設計インターフェース（実装は後続タスク）
interface RuntimeDecision {
  type: "integrated_api" | "terminal_handoff";
  // integrated_api 時
  apiKey?: string;
  permissionMode?: "default" | "acceptEdits" | "bypassPermissions";
  // terminal_handoff 時
  handoff?: TerminalHandoffBundle;
}

interface TerminalHandoffBundle {
  launcher: string; // "claude -p \"...\""
  promptBundle: string; // full prompt context
  cwd: string; // 作業ディレクトリ
  suggestedCommand: string; // コピー可能コマンド文字列
  manualRetryRule: string; // ユーザー向け案内
  runbook?: string; // manual 操作手順
}

interface RuntimePolicyResolver {
  resolve(authMode: AuthMode, apiKey: string | null): Promise<RuntimeDecision>;
}
```

---

## 3. Internal Role 設計

### 3.1 Skill Creator の role 分担

| Role     | 責務                                              | UI 表示名 | Main 担当                     |
| -------- | ------------------------------------------------- | --------- | ----------------------------- |
| Planner  | skill 仕様を受け取り、実行計画を立てる            | 作成中... | SkillCreatorService.plan()    |
| Executor | 実行計画を SkillExecutor に委譲し、結果を受け取る | 実行中... | SkillExecutor.execute() 委譲  |
| Improver | 実行結果を分析し、skill 改善提案を生成する        | 改善中... | SkillCreatorService.improve() |

**重要**: role は UI に漏らさない。execution bar は job 名（`作成` / `実行` / `改善`）のみ表示。

### 3.2 role の IPC 設計

| IPC チャンネル    | 方向            | 担当 role                         |
| ----------------- | --------------- | --------------------------------- |
| `creator:plan`    | Renderer → Main | Planner                           |
| `creator:execute` | Renderer → Main | Executor（SkillExecutor 委譲）    |
| `creator:improve` | Renderer → Main | Improver                          |
| `creator:stream`  | Main → Renderer | 全 role の streaming              |
| `creator:handoff` | Main → Renderer | terminal handoff 時の bundle 返却 |

---

## 4. Authority 配置

### 4.1 preflight authority

| 項目           | 配置                                   | 変更点                       |
| -------------- | -------------------------------------- | ---------------------------- |
| API key 確認   | Main: RuntimePolicyResolver.resolve()  | auth-mode 分岐を追加         |
| auth-mode 確認 | Main: RuntimePolicyResolver.resolve()  | 新規                         |
| preflight 結果 | Renderer: useSkillExecution / useAgent | 結果に handoff bundle を追加 |

### 4.2 permission authority

| 項目                  | 配置                                         | 変更点   |
| --------------------- | -------------------------------------------- | -------- |
| 危険コマンドブロック  | Main: SkillExecutor.createHooks().PreToolUse | 変更なし |
| 保護パスブロック      | Main: SkillExecutor.createHooks().PreToolUse | 変更なし |
| rememberChoice 永続化 | Main: PermissionStore                        | 変更なし |
| permission dialog IPC | Main → Renderer: SKILL_PERMISSION_REQUEST    | 変更なし |

### 4.3 streaming authority

| 項目                   | 配置                                                 | 変更点   |
| ---------------------- | ---------------------------------------------------- | -------- |
| Skill streaming        | Main: SKILL_CHANNELS.SKILL_STREAM                    | 変更なし |
| Agent streaming        | Main: IPC_CHANNELS.AGENT_EXECUTION_STREAM            | 変更なし |
| Creator streaming      | Main: `creator:stream`                               | 新規     |
| terminal handoff event | Main → Renderer: `creator:handoff` / `skill:handoff` | 新規     |

### 4.4 session / status authority

| 項目            | 配置                                     | 変更点   |
| --------------- | ---------------------------------------- | -------- |
| session 作成    | Main: AgentHandler.handleCreateSession() | 変更なし |
| execution state | Main: ExecutionManager / SkillExecutor   | 変更なし |
| auth-mode state | Renderer: Zustand authModeSlice          | 変更なし |

---

## 5. 依存関係と接続順序

```
1. App 起動
2. authModeSlice.initializeAuthMode()  ← Zustand store で auth-mode を初期化
3. ユーザーが skill / agent / creator を実行
4. [Renderer] useSkillExecution / useAgent が IPC 呼び出し
5. [Main] RuntimePolicyResolver.resolve(authMode, apiKey)
   5a. integrated_api → SkillExecutor / AgentExecutor → SDK query()
   5b. terminal_handoff → buildHandoffBundle() → IPC で Renderer に返却
6. [Renderer] 結果を UI に反映
   6a. streaming → execution bar に表示
   6b. handoff → handoff card に表示
```

---

## 完了確認

- [x] shared runtime policy が Skill / Agent / Creator / Agent SDK UI / Hook / CLI まで定義されている
- [x] internal role と UI surface の責務分離が明文化されている
- [x] permission / streaming / terminal handoff の UI 状態と導線が定義されている
