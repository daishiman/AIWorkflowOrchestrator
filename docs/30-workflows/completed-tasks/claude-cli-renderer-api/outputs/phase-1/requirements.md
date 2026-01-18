# Claude CLI Renderer API 要件定義書

## メタ情報

| 項目       | 内容       |
| ---------- | ---------- |
| バージョン | 1.0.0      |
| 作成日     | 2026-01-17 |
| Phase      | 1          |
| ステータス | 完了       |

---

## 1. 背景・目的

### 1.1 背景

Phase 10最終レビューにて「contextBridge API公開がpreloadで未実装」との指摘があった。

- Main ProcessのIPCハンドラは実装済み
- Renderer ProcessからIPCを呼び出すためのPreload APIが必要
- UIコンポーネントからClaude CLI機能を利用可能にする必要がある

### 1.2 目的

Renderer ProcessからClaude CLI APIを安全に呼び出すためのPreload API（`window.claudeCliAPI`）を実装・検証し、UIコンポーネントからClaude CLI機能を利用可能にする。

---

## 2. 機能要件

### 2.1 必須API一覧

以下のAPIが`window.claudeCliAPI`として利用可能であること：

| メソッド名          | 説明                   | 引数                               | 戻り値                                               |
| ------------------- | ---------------------- | ---------------------------------- | ---------------------------------------------------- |
| `checkInstallation` | CLI存在確認            | なし                               | `Promise<ClaudeCliResult<CliInstallationStatus>>`    |
| `listSkills`        | スキル一覧取得         | `request?: ListSkillsRequest`      | `Promise<ClaudeCliResult<ScanResult>>`               |
| `getSkillDetail`    | スキル詳細取得         | `request: GetSkillDetailRequest`   | `Promise<ClaudeCliResult<ClaudeCliSkillDetail>>`     |
| `executeScript`     | スクリプト実行         | `request: ExecuteScriptRequest`    | `Promise<ClaudeCliResult<ExecuteScriptResponse>>`    |
| `terminateSession`  | セッション終了         | `request: TerminateSessionRequest` | `Promise<ClaudeCliResult<TerminateSessionResponse>>` |
| `listSessions`      | セッション一覧取得     | なし                               | `Promise<ClaudeCliResult<SessionSummary[]>>`         |
| `getSession`        | セッション詳細取得     | `request: GetSessionRequest`       | `Promise<ClaudeCliResult<SessionDetail>>`            |
| `onSessionOutput`   | 出力ストリーミング購読 | `callback: (event) => void`        | `() => void` (cleanup関数)                           |
| `onSessionStatus`   | 状態変更購読           | `callback: (event) => void`        | `() => void` (cleanup関数)                           |

### 2.2 IPC接続要件（統合テスト連携）

- Preload APIがMain Processの`ClaudeCliManager`と正しく通信できること
- ストリーミングイベント（`onSessionOutput`, `onSessionStatus`）が正しく購読できること
- エラーハンドリングが適切に行われること

### 2.3 IPCチャンネル定義

以下のIPCチャンネルが定義されていること：

```typescript
CLAUDE_CLI_CHECK_INSTALLATION: "claude-cli:check-installation";
CLAUDE_CLI_LIST_SKILLS: "claude-cli:list-skills";
CLAUDE_CLI_GET_SKILL_DETAIL: "claude-cli:get-skill-detail";
CLAUDE_CLI_EXECUTE_SCRIPT: "claude-cli:execute-script";
CLAUDE_CLI_TERMINATE_SESSION: "claude-cli:terminate-session";
CLAUDE_CLI_LIST_SESSIONS: "claude-cli:list-sessions";
CLAUDE_CLI_GET_SESSION: "claude-cli:get-session";
CLAUDE_CLI_SESSION_OUTPUT: "claude-cli:session-output"; // ストリーミング
CLAUDE_CLI_SESSION_STATUS: "claude-cli:session-status"; // ストリーミング
```

---

## 3. 非機能要件

### 3.1 型安全性

- すべてのAPIは`@repo/shared`の型定義を使用すること
- `ClaudeCliAPI`インターフェースが定義されていること
- グローバル`Window`インターフェースに`claudeCliAPI`が宣言されていること

### 3.2 セキュリティ

- `ALLOWED_INVOKE_CHANNELS`にClaude CLIチャンネルが含まれていること
- `ALLOWED_ON_CHANNELS`にストリーミングチャンネルが含まれていること
- `safeInvoke`/`safeOn`ラッパーを使用してチャンネル検証を行うこと
- 許可されていないチャンネルは拒否されること

### 3.3 メモリ管理

- イベントリスナーのunsubscribe関数が提供されること
- リスナー解除時にメモリリークが発生しないこと

### 3.4 エラーハンドリング

- IPC呼び出し失敗時に適切なエラーが返されること
- 許可されていないチャンネルへのアクセスは`Promise.reject`で拒否されること

---

## 4. テスト要件

### 4.1 ユニットテスト

- 各APIメソッドが正しいIPCチャンネルを呼び出すことをテスト
- イベントリスナーの登録・解除をテスト
- 許可されていないチャンネルが拒否されることをテスト

### 4.2 統合テスト

- Main ProcessのIPCハンドラとの通信をテスト
- ストリーミングイベントの受信をテスト
- エラーケースのハンドリングをテスト

---

## 5. 依存関係

### 5.1 内部依存

| モジュール                             | 依存理由              |
| -------------------------------------- | --------------------- |
| `@repo/shared`                         | Claude CLI型定義      |
| `apps/desktop/src/main/claude-cli/`    | Main ProcessのIPC実装 |
| `apps/desktop/src/preload/channels.ts` | IPCチャンネル定義     |

### 5.2 外部依存

| パッケージ | バージョン | 用途                       |
| ---------- | ---------- | -------------------------- |
| electron   | ^27.0.0    | contextBridge, ipcRenderer |

---

## 6. 成果物

| 成果物            | パス                                   | 状態   |
| ----------------- | -------------------------------------- | ------ |
| Preload API実装   | `apps/desktop/src/preload/index.ts`    | 確認済 |
| IPCチャンネル定義 | `apps/desktop/src/preload/channels.ts` | 確認済 |
| 型定義            | `apps/desktop/src/preload/types.ts`    | 確認済 |
| ユニットテスト    | `apps/desktop/src/preload/__tests__/`  | 要追加 |

---

## 7. 変更履歴

| バージョン | 日付       | 変更内容                         |
| ---------- | ---------- | -------------------------------- |
| 1.0.0      | 2026-01-17 | 初版作成（既存実装確認に基づく） |
