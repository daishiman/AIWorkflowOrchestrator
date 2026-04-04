# Claude Code CLI連携パターン

> 本ドキュメントは統合システム設計仕様書の一部です。
> 管理: .claude/skills/aiworkflow-requirements/
>
> **親ドキュメント**: [architecture-patterns.md](./architecture-patterns.md)

---

## 変更履歴

| バージョン | 日付       | 変更内容                                       |
| ---------- | ---------- | ---------------------------------------------- |
| v1.1.0     | 2026-01-26 | 仕様ガイドライン準拠: コード例を表形式・文章に変換 |
| v1.0.0     | 2026-01-17 | 初版作成                                       |

---

## Claude Code CLI連携（Desktop Main Process）

### 概要

Claude Code CLI連携はElectronのMain Processで動作し、`claude`コマンド（CLIツール）をchild_process.spawnで起動してスキル実行・セッション管理・ストリーミング出力を提供する。Facadeパターンを採用し、外部からは単一のManagerインターフェースを提供する。

**実装場所**: `apps/desktop/src/main/claude-cli/`

### コンポーネント構成

Main Process（Electron）内で以下の階層構造を持つ：

| レイヤー | コンポーネント   | 親コンポーネント | 責務                       |
| -------- | ---------------- | ---------------- | -------------------------- |
| Facade   | ClaudeCliManager | -                | エントリポイント           |
| 内部     | ProcessManager   | ClaudeCliManager | プロセス生成・監視・終了   |
| 内部     | SessionManager   | ClaudeCliManager | セッションライフサイクル管理 |
| 内部     | SkillScanner     | ClaudeCliManager | スキルディレクトリスキャン |
| IPC      | IPC Handlers     | -                | Renderer通信               |

### ファイル構成

| ファイル              | 責務                         |
| --------------------- | ---------------------------- |
| `ProcessManager.ts`   | 子プロセス生成・監視・終了   |
| `SessionManager.ts`   | セッションライフサイクル管理 |
| `SkillScanner.ts`     | スキルディレクトリスキャン   |
| `ClaudeCliManager.ts` | Facadeサービス（外部API）    |
| `ipc-handler.ts`      | IPCハンドラ                  |
| `index.ts`            | エクスポート                 |

### Shared State Boundary

- `ClaudeCliManager` の state owner は `claude-cli/ipc-handler.ts` 内の module-scope `manager` である。
- Main Process の他モジュールが参照してよい入口は `getClaudeCliManager()` のみとし、`apps/desktop/src/main/ipc/index.ts` から Advanced Console callback へ DI する。
- Renderer 向けの安定契約は `advancedConsoleHandlers.ts` が返す `TERMINAL_LOG_ERROR` / `COPY_COMMAND_ERROR` であり、`SESSION_NOT_FOUND` は callback 内部で使う内部コードとして扱う。

### 型定義

| 型名                 | 定義場所                                  | 説明             |
| -------------------- | ----------------------------------------- | ---------------- |
| `ClaudeCliResult<T>` | `packages/shared/src/claude-cli/types.ts` | Result Pattern型 |
| `SessionStatus`      | `packages/shared/src/claude-cli/types.ts` | セッション状態   |
| `ClaudeCliSkill`     | `packages/shared/src/claude-cli/types.ts` | スキル情報       |
| `SessionSummary`     | `packages/shared/src/claude-cli/types.ts` | セッション概要   |
| `OutputEvent`        | `packages/shared/src/claude-cli/types.ts` | 出力イベント     |

### IPC APIチャネル

| チャネル                        | 引数                      | 戻り値                                      | 説明           |
| ------------------------------- | ------------------------- | ------------------------------------------- | -------------- |
| `claude-cli:check-installation` | なし                      | `ClaudeCliResult<CliInstallationStatus>`    | CLI存在確認    |
| `claude-cli:list-skills`        | `ListSkillsRequest`       | `ClaudeCliResult<ScanResult>`               | スキル一覧取得 |
| `claude-cli:get-skill-detail`   | `GetSkillDetailRequest`   | `ClaudeCliResult<ClaudeCliSkillDetail>`     | スキル詳細取得 |
| `claude-cli:execute-script`     | `ExecuteScriptRequest`    | `ClaudeCliResult<ExecuteScriptResponse>`    | スクリプト実行 |
| `claude-cli:terminate-session`  | `TerminateSessionRequest` | `ClaudeCliResult<TerminateSessionResponse>` | セッション終了 |
| `claude-cli:list-sessions`      | なし                      | `ClaudeCliResult<SessionSummary[]>`         | セッション一覧 |
| `claude-cli:get-session`        | `GetSessionRequest`       | `ClaudeCliResult<SessionDetail>`            | セッション詳細 |

### データフロー

データは以下の順序で処理される：

| ステップ | 送信元                | 経由             | 送信先                                            |
| -------- | --------------------- | ---------------- | ------------------------------------------------- |
| 1        | Renderer              | IPC Channel      | Main Process                                      |
| 2        | Main Process          | ClaudeCliManager | ProcessManager / SessionManager / SkillScanner    |
| 3        | 結果/ストリーミング   | IPC Channel      | Renderer                                          |

### ClaudeCliManager（Facade）API

| メソッド            | 引数                      | 戻り値                                 | 説明           |
| ------------------- | ------------------------- | -------------------------------------- | -------------- |
| `checkInstallation` | -                         | `Promise<ClaudeCliResult<...>>`        | CLI存在確認    |
| `listSkills`        | `ListSkillsRequest`       | `Promise<ClaudeCliResult<ScanResult>>` | スキル一覧     |
| `getSkillDetail`    | `GetSkillDetailRequest`   | `Promise<ClaudeCliResult<...>>`        | スキル詳細     |
| `executeScript`     | `ExecuteScriptRequest`    | `Promise<ClaudeCliResult<...>>`        | スクリプト実行 |
| `terminateSession`  | `TerminateSessionRequest` | `Promise<ClaudeCliResult<...>>`        | セッション終了 |
| `listSessions`      | -                         | `Promise<ClaudeCliResult<...>>`        | セッション一覧 |
| `getSession`        | `GetSessionRequest`       | `Promise<ClaudeCliResult<...>>`        | セッション詳細 |
| `shutdown`          | -                         | `Promise<void>`                        | シャットダウン |

### イベント駆動（EventEmitter）

| イベント           | ペイロード                                | 説明             |
| ------------------ | ----------------------------------------- | ---------------- |
| `sessionCreated`   | `{ sessionId, skillName }`                | セッション作成時 |
| `sessionDestroyed` | `{ sessionId }`                           | セッション破棄時 |
| `statusChanged`    | `{ sessionId, oldStatus, newStatus }`     | 状態変更時       |
| `output`           | `{ sessionId, type, content, timestamp }` | 出力発生時       |

### 設計原則

- **Facadeパターン**: ClaudeCliManagerが外部との唯一のインターフェース
- **Result Pattern**: 全APIがClaudeCliResult<T>を返却
- **EventEmitter**: ストリーミング出力とセッション状態変更の通知
- **セッション分離**: 各セッションは独立したプロセスで実行
- **リソース制限**: 最大10セッションまで同時実行可能

### 関連タスク

- claude-code-cli-integration（2026-01-17完了）

---

## Claude CLI Renderer API（Preload API）

### 概要

Claude CLI Renderer APIはElectronのPreloadスクリプトで提供され、Renderer Process（UI）からMain ProcessのClaude CLI機能を安全に呼び出すためのAPIインターフェースを提供する。`contextBridge`経由で`window.claudeCliAPI`として公開される。

**実装場所**: `apps/desktop/src/preload/index.ts`

### コンポーネント構成

通信フローは Renderer Process → Preload Script → Main Process の順で流れる。

| レイヤー         | コンポーネント         | 説明                                   |
| ---------------- | ---------------------- | -------------------------------------- |
| Renderer Process | UI                     | window.claudeCliAPIを通じてAPIを呼び出す |
| Preload Script   | contextBridge          | セキュアなAPI公開                      |
| Preload Script   | safeInvoke             | ホワイトリスト検証付きIPC呼び出し       |
| Preload Script   | safeOn                 | ホワイトリスト検証付きイベント購読      |
| Preload Script   | claudeCliAPIオブジェクト | 公開APIインターフェース                |
| Main Process     | ClaudeCliManager       | Facade（実処理）                       |

### ファイル構成

| ファイル                         | 責務                         |
| -------------------------------- | ---------------------------- |
| `preload/index.ts`               | claudeCliAPIオブジェクト定義 |
| `preload/channels.ts`            | IPCチャンネル名定数定義      |
| `preload/types.ts`               | ClaudeCliAPI型定義           |
| `main/claude-cli/ipc-handler.ts` | Main Process側IPCハンドラ    |

### API定義

| メソッド              | 引数                               | 戻り値                                            | 説明             |
| --------------------- | ---------------------------------- | ------------------------------------------------- | ---------------- |
| `checkInstallation()` | なし                               | `Promise<ClaudeCliResult<CliInstallationStatus>>` | CLI存在確認      |
| `listSkills()`        | `ClaudeCliListSkillsRequest?`      | `Promise<ClaudeCliResult<ScanResult>>`            | スキル一覧取得   |
| `getSkillDetail()`    | `ClaudeCliGetSkillDetailRequest`   | `Promise<ClaudeCliResult<SkillManifest>>`         | スキル詳細取得   |
| `executeScript()`     | `ClaudeCliExecuteScriptRequest`    | `Promise<ClaudeCliResult<ExecuteResult>>`         | スクリプト実行   |
| `terminateSession()`  | `ClaudeCliTerminateSessionRequest` | `Promise<ClaudeCliResult<void>>`                  | セッション終了   |
| `listSessions()`      | なし                               | `Promise<ClaudeCliResult<Session[]>>`             | セッション一覧   |
| `getSession()`        | `ClaudeCliGetSessionRequest`       | `Promise<ClaudeCliResult<Session\|null>>`         | セッション詳細   |
| `onSessionOutput()`   | `(event: OutputEvent) => void`     | `() => void`                                      | 出力イベント購読 |
| `onSessionStatus()`   | `(event: StatusEvent) => void`     | `() => void`                                      | 状態イベント購読 |

### IPCチャンネル定義

定義場所: `apps/desktop/src/preload/channels.ts`

IPC_CHANNELS定数として以下のチャンネルが定義される：

| 定数名                        | チャンネル値                    |
| ----------------------------- | ------------------------------- |
| CLAUDE_CLI_CHECK_INSTALLATION | claude-cli:check-installation   |
| CLAUDE_CLI_LIST_SKILLS        | claude-cli:list-skills          |
| CLAUDE_CLI_GET_SKILL_DETAIL   | claude-cli:get-skill-detail     |
| CLAUDE_CLI_EXECUTE_SCRIPT     | claude-cli:execute-script       |
| CLAUDE_CLI_TERMINATE_SESSION  | claude-cli:terminate-session    |
| CLAUDE_CLI_LIST_SESSIONS      | claude-cli:list-sessions        |
| CLAUDE_CLI_GET_SESSION        | claude-cli:get-session          |
| CLAUDE_CLI_SESSION_OUTPUT     | claude-cli:session-output       |
| CLAUDE_CLI_SESSION_STATUS     | claude-cli:session-status       |

### ホワイトリストパターン

定義場所: `apps/desktop/src/preload/channels.ts`

セキュリティのため、許可されたチャンネルのみをホワイトリストとして定義する。

**ALLOWED_INVOKE_CHANNELS（invoke用）**:

| 許可チャンネル                          |
| --------------------------------------- |
| CLAUDE_CLI_CHECK_INSTALLATION           |
| CLAUDE_CLI_LIST_SKILLS                  |
| CLAUDE_CLI_GET_SKILL_DETAIL             |
| CLAUDE_CLI_EXECUTE_SCRIPT               |
| CLAUDE_CLI_TERMINATE_SESSION            |
| CLAUDE_CLI_LIST_SESSIONS                |
| CLAUDE_CLI_GET_SESSION                  |
| その他プロジェクト固有のチャンネル       |

**ALLOWED_ON_CHANNELS（イベント購読用）**:

| 許可チャンネル                |
| ----------------------------- |
| CLAUDE_CLI_SESSION_OUTPUT     |
| CLAUDE_CLI_SESSION_STATUS     |
| その他プロジェクト固有のチャンネル |

### safeInvoke/safeOnセキュリティパターン

定義場所: `apps/desktop/src/preload/index.ts`

| 関数名     | 目的                             | 引数                                 | 戻り値              |
| ---------- | -------------------------------- | ------------------------------------ | ------------------- |
| safeInvoke | ホワイトリスト検証付きIPC呼び出し | channel: string, ...args: unknown[]  | Promise<T>          |
| safeOn     | ホワイトリスト検証付きイベント購読 | channel: string, callback: Function  | () => void（解除関数） |

**safeInvokeの動作**:
1. チャンネルがALLOWED_INVOKE_CHANNELSに含まれるか検証
2. 含まれない場合、エラーを含むPromiseをreject
3. 含まれる場合、ipcRenderer.invokeを呼び出して結果を返す

**safeOnの動作**:
1. チャンネルがALLOWED_ON_CHANNELSに含まれるか検証
2. 含まれない場合、エラーログを出力し空の関数を返す
3. 含まれる場合、ipcRenderer.onでイベントを購読
4. 戻り値としてリスナー解除用の関数を返す

### 実装パターン

定義場所: `apps/desktop/src/preload/index.ts`

claudeCliAPIオブジェクトは以下のメソッドをsafeInvoke/safeOn経由で実装する：

| メソッド           | 使用関数   | 使用チャンネル                  | 引数渡し方式         |
| ------------------ | ---------- | ------------------------------- | -------------------- |
| checkInstallation  | safeInvoke | CLAUDE_CLI_CHECK_INSTALLATION   | なし                 |
| listSkills         | safeInvoke | CLAUDE_CLI_LIST_SKILLS          | request（省略可）    |
| getSkillDetail     | safeInvoke | CLAUDE_CLI_GET_SKILL_DETAIL     | request（必須）      |
| executeScript      | safeInvoke | CLAUDE_CLI_EXECUTE_SCRIPT       | request（必須）      |
| terminateSession   | safeInvoke | CLAUDE_CLI_TERMINATE_SESSION    | request（必須）      |
| listSessions       | safeInvoke | CLAUDE_CLI_LIST_SESSIONS        | なし                 |
| getSession         | safeInvoke | CLAUDE_CLI_GET_SESSION          | request（必須）      |
| onSessionOutput    | safeOn     | CLAUDE_CLI_SESSION_OUTPUT       | callback（必須）     |
| onSessionStatus    | safeOn     | CLAUDE_CLI_SESSION_STATUS       | callback（必須）     |

**公開方式**: contextBridge.exposeInMainWorldを使用して、claudeCliAPIオブジェクトをwindow.claudeCliAPIとしてRenderer Processに公開する。

### セキュリティ要件

| 要件             | 実装                              | 確認方法                 |
| ---------------- | --------------------------------- | ------------------------ |
| ホワイトリスト   | ALLOWED_INVOKE/ON_CHANNELS        | 定義外チャンネルはエラー |
| contextIsolation | `contextBridge.exposeInMainWorld` | BrowserWindow設定で有効  |
| 型安全性         | ClaudeCliResult<T>型              | TypeScript型チェック     |
| メモリリーク防止 | unsubscribe関数パターン           | イベント購読解除機能     |

### データフロー

Renderer ProcessからMain Processへの通信フローは以下の順序で処理される：

| ステップ | レイヤー         | 処理内容                                |
| -------- | ---------------- | --------------------------------------- |
| 1        | Renderer (UI)    | window.claudeCliAPIのメソッドを呼び出す   |
| 2        | Preload          | safeInvoke/safeOnでホワイトリスト検証     |
| 3        | Preload          | ipcRenderer.invoke/onでIPC呼び出し        |
| 4        | Main Process     | ClaudeCliManagerで実処理を実行            |
| 5        | Main Process     | ipcMain.handleでレスポンスを返す          |
| 6        | Preload          | Promise解決またはイベントコールバック実行   |
| 7        | Renderer (UI)    | 結果を受け取り、UIを更新                   |

### 使用例

Renderer Process（Reactコンポーネント）での典型的な使用パターンを以下に示す。

**CLI状態確認の例**:

| 手順 | 処理内容                                           |
| ---- | -------------------------------------------------- |
| 1    | window.claudeCliAPI.checkInstallation()を呼び出す   |
| 2    | 戻り値のresult.successをチェック                    |
| 3    | result.data.installedでCLIインストール状態を取得    |

**ストリーミング出力購読の例**:

| 手順 | 処理内容                                                          |
| ---- | ----------------------------------------------------------------- |
| 1    | useEffect内でonSessionOutputを呼び出してイベント購読               |
| 2    | コールバックでevent.sessionId、event.type、event.contentを処理     |
| 3    | useEffectのクリーンアップ関数でunsubscribe()を呼び出して購読解除     |

**注意**: イベント購読時は必ずコンポーネントのアンマウント時にunsubscribe()を呼び出し、メモリリークを防止すること。

### テスト

| テストカテゴリ         | テスト数 | 状態 |
| ---------------------- | -------- | ---- |
| チャンネル定義         | 10       | ✅   |
| ホワイトリスト登録     | 9        | ✅   |
| safeInvokeセキュリティ | 7        | ✅   |
| safeOnセキュリティ     | 2        | ✅   |
| エラーハンドリング     | 4        | ✅   |
| ストリーミングイベント | 8        | ✅   |
| 統合テストシナリオ     | 5        | ✅   |
| **合計**               | **74**   | ✅   |

### 関連タスク

- **claude-cli-renderer-api**: Renderer API実装・検証・ドキュメント化（2026-01-17完了）

---

## 関連ドキュメント

- [アーキテクチャパターン概要](./architecture-patterns.md)
- [IPC・永続化パターン](./arch-ipc-persistence.md)
- [Electronサービス](./arch-electron-services.md)
