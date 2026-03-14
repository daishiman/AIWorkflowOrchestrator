# Phase 1 要件定義 - 要件整理

## メタ情報

| 項目       | 内容                                     |
| ---------- | ---------------------------------------- |
| タスクID   | TASK-IMP-SKILL-AGENT-RUNTIME-ROUTING-001 |
| Phase      | 1                                        |
| 作成日     | 2026-03-14                               |
| ステータス | completed                                |

---

## 1. 現状経路棚卸し

### 1.1 Skill 実行経路

```
[Renderer]
  └─ preflightSkillExecutionAuth()
       └─ window.electronAPI.authKey.exists()  ← API key 有無のみ確認（auth-mode 非依存）
  └─ useSkillExecution.executeSkill()
       └─ IPC: skill:execute
[Main / SkillHandlers]
  └─ SkillService.executeSkill()
       └─ SkillExecutor.execute()
            ├─ authKeyService.getKey() or process.env.ANTHROPIC_API_KEY
            ├─ @anthropic-ai/claude-agent-sdk query()  ← Integrated API Runtime
            ├─ PermissionResolver + PermissionStore  ← permission 記憶
            └─ IPC stream: SKILL_CHANNELS.SKILL_STREAM → Renderer
```

**問題点**:

- `preflightSkillExecutionAuth()` は API key 存在確認のみ。`auth-mode` を見ない
- `SkillExecutor.getApiKey()` は `authKeyService` or 環境変数。auth-mode（integrated/claude_code）を区別しない
- terminal handoff の設計が存在しない（API key がなければ単にエラー）

### 1.2 Agent 実行経路

```
[Renderer]
  └─ useAgent.query(prompt, options)
       └─ window.agentAPI.query(prompt, options)
            └─ IPC: agent:query
[Main / AgentHandler]
  └─ agentClient.query(prompt, callback, options)
       └─ AgentClient → @anthropic-ai/claude-agent-sdk query()  ← Integrated API Runtime
            ├─ HooksFactory → permission dialog IPC
            └─ event.sender.send("agent:message", message)  ← streaming

[別系統: AgentExecutor (ExecutionManager経由)]
  └─ AgentExecutor.start()
       ├─ HooksFactory.createHooks()
       └─ @anthropic-ai/claude-agent-sdk query() → IPC AGENT_EXECUTION_STREAM
```

**問題点**:

- `AgentHandler` は `apiKey` をコンストラクタ引数で受け取る（静的注入）。auth-mode 対応なし
- `AgentExecutor` も同様に SDK を直接呼び出す。auth-mode awareness なし
- `useAgent` Hook は auth-mode 状態を参照しない

### 1.3 Skill Creator 実行経路

```
[Renderer]
  └─ SkillCreatorService（未実装/設計段階）
       └─ Planner role: skill 仕様生成
       └─ Executor role: skill 実行検証
       └─ Improver role: skill 改善提案
```

**問題点**:

- 現状 SkillCreatorService は未統合。runtime policy が未設計

### 1.4 Claude Code Terminal surface

```
[Renderer]
  └─ IPC: claude-cli:execute-script
[Main / ClaudeCliManager]
  └─ スクリプト実行 → claude CLI process 起動（terminal surface）
  └─ streaming: SESSION_OUTPUT, SESSION_STATUS → Renderer
```

**現状**:

- Claude CLI 経由の terminal 実行は独立した系統として存在
- Skill/Agent との handoff 設計は未定義

### 1.5 Agent SDK UI / Hook 経路

```
[AgentSDKPage]
  └─ useAgent Hook → agentAPI → IPC agent:query → AgentHandler → SDK
[AgentChatInterface]
  └─ useAgent Hook → messages 配列 → UI streaming 表示
```

---

## 2. 既存保証（維持すべき契約）

### 2.1 preflight 保証

| 保証                                                | 現状の場所                       | 維持要否                                     |
| --------------------------------------------------- | -------------------------------- | -------------------------------------------- |
| API key 存在確認                                    | `skillExecutionAuthPreflight.ts` | ✅ 維持（integrated runtime 経路でのみ必要） |
| API key 取得失敗時エラー表示                        | `SkillExecutor.getApiKey()`      | ✅ 維持                                      |
| preflight が API 不在時に AUTHENTICATION_ERROR 返却 | `preflightSkillExecutionAuth()`  | ✅ 維持                                      |

### 2.2 permission 保証

| 保証                             | 現状の場所                                | 維持要否 |
| -------------------------------- | ----------------------------------------- | -------- |
| 危険コマンドブロック（Bash）     | `SkillExecutor.createHooks().PreToolUse`  | ✅ 維持  |
| 保護パスへの書き込みブロック     | `SkillExecutor.createHooks().PreToolUse`  | ✅ 維持  |
| ツール許可記憶（rememberChoice） | `PermissionStore.allowTool()`             | ✅ 維持  |
| 権限ダイアログ → IPC → Renderer  | `SKILL_CHANNELS.SKILL_PERMISSION_REQUEST` | ✅ 維持  |
| Agent permission hooks           | `HooksFactory.createHooks()`              | ✅ 維持  |

### 2.3 streaming 保証

| 保証                                                         | 現状の場所                            | 維持要否 |
| ------------------------------------------------------------ | ------------------------------------- | -------- |
| Skill streaming: text/tool_use/error/complete                | `SKILL_CHANNELS.SKILL_STREAM`         | ✅ 維持  |
| Agent streaming: assistant/user/result/tool_use/status/error | `IPC_CHANNELS.AGENT_EXECUTION_STREAM` | ✅ 維持  |
| Abort（AbortController）                                     | SkillExecutor / AgentExecutor         | ✅ 維持  |
| Retry（Exponential Backoff）                                 | SkillExecutor.executeWithRetry()      | ✅ 維持  |

---

## 3. Internal Role 対応付け

| Internal Role | 既存 API / Class                                | 責務                          |
| ------------- | ----------------------------------------------- | ----------------------------- |
| Planner       | （未実装）SkillCreatorService → skill spec 生成 | skill 仕様の入力→設計         |
| Executor      | SkillExecutor / AgentExecutor                   | 実際の SDK query() 呼び出し   |
| Improver      | （未実装）SkillCreatorService → improve         | 実行結果を受けて skill を改善 |

---

## 4. 新規要件（統合設計への課題）

### 4.1 auth-mode 対応要件

- `preflight` は auth-mode（`integrated_api` / `claude_code`）を見て分岐すべき
  - `integrated_api` モード: API key 確認 → SDK query()
  - `claude_code` モード: terminal handoff → launcher + prompt bundle 返却
- `SkillExecutor` / `AgentExecutor` / Skill Creator は同一の runtime policy resolver を使うべき

### 4.2 terminal handoff 要件

- `claude_code` モードまたは API key 未設定時：
  - `suggested_command`: `claude -p "..."` 形式のコマンド
  - `prompt_bundle`: skill prompt + context を含むバンドル
  - `cwd`: 作業ディレクトリ
  - `manual_retry_rule`: ユーザーへの案内メッセージ
- UI: handoff card として表示。「terminal で続ける」CTA

### 4.3 UI surface 要件

- `useAgent` / `AgentChatInterface` / `AgentSDKPage` は auth-mode を Zustand store から取得
- internal role（Planner/Executor/Improver）は UI に露出しない
- job 名（`作成` / `実行` / `改善`）で統一

### 4.4 skill-lifecycle Task03 連携要件

- Task03（skill lifecycle）が参照できるよう runtime policy の interface を設計する
- 同一の access capability resolver を経由して engine を選択する

---

## 5. 統合テスト連携要件

| テスト観点       | 詳細                                                   |
| ---------------- | ------------------------------------------------------ |
| execute 成功系   | integrated_api モードで API key あり → SDK 正常実行    |
| execute 異常系   | API key なし → AUTHENTICATION_ERROR / terminal handoff |
| preflight 分岐   | auth-mode に応じた preflight 結果の分岐                |
| permission 維持  | 統合後も permission dialog / rememberChoice が動く     |
| streaming 維持   | 統合後も streaming が IPC 経由で Renderer に届く       |
| terminal handoff | claude_code モードで正しい prompt bundle が返る        |
| abort            | AbortController が統合後も機能する                     |
| retry            | Exponential Backoff が統合後も機能する                 |

---

## 完了確認

- [x] runtime と auth-mode の現状経路が Skill / Agent / Creator / Agent SDK UI / Hook / CLI まで整理されている
- [x] 維持すべき preflight と permission 契約が抜き出されている
