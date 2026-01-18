# Phase 2: 設計 - タスク仕様書

## メタ情報

| 項目       | 内容                    |
| ---------- | ----------------------- |
| Phase      | 2                       |
| Phase名    | 設計                    |
| 前提Phase  | Phase 1                 |
| 後続Phase  | Phase 3                 |
| ステータス | 未実施                  |
| 作成日     | 2026-01-17              |
| 機能名     | claude-cli-renderer-api |

---

## 目的

Phase 1で定義した要件に基づき、Claude CLI Renderer APIの設計を確認・文書化する。

## 背景

Phase 1で既存実装の状況が判明した。本Phaseでは、既存設計の妥当性を確認し、必要に応じて改善点を洗い出す。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: 既存API設計の確認

**目的**: 既存のClaudeCliAPI設計を確認・文書化する

**実行手順**:

1. `apps/desktop/src/preload/types.ts`から`ClaudeCliAPI`インターフェースを読み取る
2. 各メソッドのシグネチャを確認する:
   - `checkInstallation(): Promise<ClaudeCliResult<CliInstallationStatus>>`
   - `listSkills(request?: ClaudeCliListSkillsRequest): Promise<ClaudeCliResult<ScanResult>>`
   - `getSkillDetail(request: ClaudeCliGetSkillDetailRequest): Promise<ClaudeCliResult<ClaudeCliSkillDetail>>`
   - `executeScript(request: ClaudeCliExecuteScriptRequest): Promise<ClaudeCliResult<ExecuteScriptResponse>>`
   - `terminateSession(request: ClaudeCliTerminateSessionRequest): Promise<ClaudeCliResult<TerminateSessionResponse>>`
   - `listSessions(): Promise<ClaudeCliResult<SessionSummary[]>>`
   - `getSession(request: ClaudeCliGetSessionRequest): Promise<ClaudeCliResult<SessionDetail>>`
   - `onSessionOutput(callback: (event: ClaudeCliSessionOutputEvent) => void): () => void`
   - `onSessionStatus(callback: (event: ClaudeCliSessionStatusEvent) => void): () => void`
3. 設計ドキュメントを`outputs/phase-2/api-design.md`に出力する

**期待される成果物**:

- `outputs/phase-2/api-design.md`（API設計書）

---

### タスク2: IPC通信パターンの確認

**目的**: Preload APIとMain Process間のIPC通信設計を確認する

**実行手順**:

1. `apps/desktop/src/preload/channels.ts`からClaude CLI関連のチャンネルを抽出する:
   - `CLAUDE_CLI_CHECK_INSTALLATION`
   - `CLAUDE_CLI_LIST_SKILLS`
   - `CLAUDE_CLI_GET_SKILL_DETAIL`
   - `CLAUDE_CLI_EXECUTE_SCRIPT`
   - `CLAUDE_CLI_TERMINATE_SESSION`
   - `CLAUDE_CLI_LIST_SESSIONS`
   - `CLAUDE_CLI_GET_SESSION`
   - `CLAUDE_CLI_SESSION_OUTPUT`（ストリーミング）
   - `CLAUDE_CLI_SESSION_STATUS`（ストリーミング）
2. `ALLOWED_INVOKE_CHANNELS`と`ALLOWED_ON_CHANNELS`に登録されていることを確認する
3. IPC通信フロー図を作成する
4. `outputs/phase-2/ipc-design.md`に出力する

**期待される成果物**:

- `outputs/phase-2/ipc-design.md`（IPC設計書）

---

### タスク3: セキュリティ設計の確認

**目的**: Preload APIのセキュリティ設計を確認する

**実行手順**:

1. `safeInvoke`関数によるチャンネルホワイトリスト検証を確認する
2. `safeOn`関数によるイベント購読のセキュリティを確認する
3. `contextBridge`による安全な公開パターンを確認する
4. セキュリティ設計書を`outputs/phase-2/security-design.md`に出力する

**期待される成果物**:

- `outputs/phase-2/security-design.md`（セキュリティ設計書）

---

### タスク4: 型定義の確認

**目的**: ClaudeCliAPI関連の型定義を確認する

**実行手順**:

1. `apps/desktop/src/preload/types.ts`から以下の型を確認する:
   - `ClaudeCliAPI`
   - `ClaudeCliListSkillsRequest`
   - `ClaudeCliGetSkillDetailRequest`
   - `ClaudeCliExecuteScriptRequest`
   - `ClaudeCliTerminateSessionRequest`
   - `ClaudeCliGetSessionRequest`
   - `ClaudeCliSessionOutputEvent`
   - `ClaudeCliSessionStatusEvent`
2. `packages/shared/src/claude-cli/types.ts`との整合性を確認する
3. 型定義書を`outputs/phase-2/type-definitions.md`に出力する

**期待される成果物**:

- `outputs/phase-2/type-definitions.md`（型定義書）

---

## 参照資料

| 参照資料        | パス                                      | 内容               |
| --------------- | ----------------------------------------- | ------------------ |
| Phase 1成果物   | `outputs/phase-1/`                        | 要件定義・実装状況 |
| Preload API実装 | `apps/desktop/src/preload/index.ts`       | 既存実装           |
| 型定義          | `apps/desktop/src/preload/types.ts`       | ClaudeCliAPI型     |
| 共有型定義      | `packages/shared/src/claude-cli/types.ts` | Claude CLI共通型   |

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料               | パス                                                                         | 内容                      |
| ---------------------- | ---------------------------------------------------------------------------- | ------------------------- |
| アーキテクチャパターン | `.claude/skills/aiworkflow-requirements/references/architecture-patterns.md` | Claude CLI連携パターン    |
| セキュリティ原則       | `.claude/skills/aiworkflow-requirements/references/security-principles.md`   | Electron IPC セキュリティ |
| Electron IPC API       | `.claude/skills/aiworkflow-requirements/references/security-api-electron.md` | IPC API設計パターン       |

---

## 成果物

| 成果物             | パス                                  | 内容             |
| ------------------ | ------------------------------------- | ---------------- |
| API設計書          | `outputs/phase-2/api-design.md`       | ClaudeCliAPI設計 |
| IPC設計書          | `outputs/phase-2/ipc-design.md`       | IPC通信設計      |
| セキュリティ設計書 | `outputs/phase-2/security-design.md`  | セキュリティ設計 |
| 型定義書           | `outputs/phase-2/type-definitions.md` | 型定義一覧       |

---

## 統合テスト連携（Phase 1〜11は必須）

Preload API設計・contextBridge公開パターンを設計に反映する。具体的には:

- `safeInvoke`/`safeOn`による安全なIPC呼び出しパターン
- `contextBridge.exposeInMainWorld`による安全な公開
- Main Process側の`ClaudeCliManager`との連携設計

---

## 完了条件

- [ ] API設計書（`outputs/phase-2/api-design.md`）を作成した
- [ ] IPC設計書（`outputs/phase-2/ipc-design.md`）を作成した
- [ ] セキュリティ設計書（`outputs/phase-2/security-design.md`）を作成した
- [ ] 型定義書（`outputs/phase-2/type-definitions.md`）を作成した
- [ ] 設計が既存実装と整合していることを確認した

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 依存関係

- **前提**: Phase 1 が完了していること
- **後続**: Phase 3 へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/claude-cli-renderer-api/phase-3-design-review.md`
