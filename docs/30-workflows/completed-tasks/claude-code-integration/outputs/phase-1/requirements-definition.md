# Claude Agent SDK統合 - 要件定義書

## 1. 概要

Claude Agent SDK（`@anthropic-ai/claude-agent-sdk`）の`query()` APIをElectronアプリに統合し、Hooksシステム、Permission Control、ストリーミング出力を実装する。ユーザーのClaude Codeサブスクリプションを活用したスキルベースのタスク実行基盤を提供する。

## 2. 機能要件（FR）

### FR-01: SDK query() API実行 [優先度: 高]

| 項目 | 内容                                        |
| ---- | ------------------------------------------- |
| 要件 | SDK `query()` APIでエージェントを実行できる |
| 入力 | prompt（文字列）、skillPath（スキルパス）   |
| 出力 | ストリーミングメッセージ（SDKMessage型）    |
| 依存 | @anthropic-ai/claude-agent-sdk              |

**詳細**:

- スキルコンテキストを`settingSources`で`query()`に渡す
- `tools`オプションで使用可能ツールを指定
- `permissionMode`で権限モードを指定

### FR-02: Hooksシステム実装 [優先度: 高]

| 項目     | 内容                                                                |
| -------- | ------------------------------------------------------------------- |
| 要件     | Hooksシステム（PreToolUse/PostToolUse/PermissionRequest）を実装する |
| Hook種別 | PreToolUse, PostToolUse, PermissionRequest                          |
| 処理     | ツール使用前後の検証、権限確認フロー                                |

**対応Hook一覧**:

- `PreToolUse`: ツール実行前バリデーション
- `PostToolUse`: ツール実行後ロギング
- `PermissionRequest`: 動的権限制御

### FR-03: Permission Control [優先度: 高]

| 項目   | 内容                           |
| ------ | ------------------------------ |
| 要件   | 宣言的に権限ルールを定義できる |
| ルール | allow/deny/ask ルール          |
| 対象   | ツール名、パス、コマンド       |

**Permission Rules構造**:

```typescript
interface PermissionRules {
  allow?: ToolPermissionRule[];
  deny?: ToolPermissionRule[];
  ask?: ToolPermissionRule[];
}
```

### FR-04: ストリーミングIPC転送 [優先度: 高]

| 項目     | 内容                                              |
| -------- | ------------------------------------------------- |
| 要件     | ストリーミング出力をIPC経由でRendererに転送できる |
| チャネル | agent:stream                                      |
| データ   | AgentStreamMessage型                              |

**ストリーミングデータフロー**:

```
SDK query() → for await → IPC send → Renderer
```

### FR-05: AbortSignalキャンセル [優先度: 高]

| 項目     | 内容                                     |
| -------- | ---------------------------------------- |
| 要件     | AbortSignalで実行をキャンセルできる      |
| トリガー | agent:stop IPCチャネル                   |
| 処理     | AbortController.abort() → クリーンアップ |

### FR-06: 複数実行管理 [優先度: 中]

| 項目   | 内容                           |
| ------ | ------------------------------ |
| 要件   | 複数の実行を独立して管理できる |
| 識別子 | executionId（UUID）            |
| 機能   | 個別キャンセル、ステータス取得 |

### FR-07: Permission Dialog連携 [優先度: 高]

| 項目 | 内容                                        |
| ---- | ------------------------------------------- |
| 要件 | Permission Dialogでユーザー承認を求められる |
| IPC  | agent:permission（Main→Renderer）           |
|      | agent:permission:res（Renderer→Main）       |
| UI   | AGENT-004（エージェント実行UI）と連携       |

## 3. 非機能要件（NFR）

### NFR-01: 危険コマンドブロック [優先度: 高]

| 項目 | 内容                                       |
| ---- | ------------------------------------------ |
| 要件 | 危険なBashコマンドをブロックする           |
| 対象 | rm -rf, sudo, chmod 777, dd if=, fork bomb |
| 実装 | PreToolUse Hookで検証                      |

**ブロック対象パターン**:

- `rm -rf /`
- `sudo`
- `chmod 777`
- `dd if=`
- `mkfs`
- `> /dev/`
- `:(){ :|:& };:` (fork bomb)

### NFR-02: システムディレクトリ保護 [優先度: 高]

| 項目 | 内容                                       |
| ---- | ------------------------------------------ |
| 要件 | システムディレクトリへの書き込みを禁止する |
| 対象 | /etc/**, /usr/**, /var/\*\*, ~/.bashrc 等  |
| 実装 | Permission Rules deny ルール               |

### NFR-03: ストリーミング遅延最小化 [優先度: 中]

| 項目 | 内容                             |
| ---- | -------------------------------- |
| 要件 | ストリーミング遅延を最小化する   |
| 目標 | IPC転送遅延 < 50ms               |
| 実装 | 非同期処理、バッファリング最小化 |

### NFR-04: AbortSignal伝播保証 [優先度: 高]

| 項目     | 内容                        |
| -------- | --------------------------- |
| 要件     | AbortSignalを適切に伝播する |
| チェック | signal.abortedの定期確認    |
| 実装     | Hooks内でのsignal検証       |

## 4. IPC接続要件

### 4.1 IPCチャネル一覧

| チャネル             | 方向            | 説明           | データ型           |
| -------------------- | --------------- | -------------- | ------------------ |
| agent:start          | Renderer → Main | 実行開始       | AgentStartRequest  |
| agent:stop           | Renderer → Main | 実行停止       | { executionId }    |
| agent:stream         | Main → Renderer | ストリーミング | AgentStreamMessage |
| agent:status         | Main → Renderer | ステータス通知 | AgentStatusMessage |
| agent:permission     | Main → Renderer | 権限確認要求   | PermissionRequest  |
| agent:permission:res | Renderer → Main | 権限確認応答   | PermissionResponse |

### 4.2 データフロー

```
Renderer → agent:start → Main Process
                            ↓
                     SDK query() API
                            ↓
                     for await (message)
                            ↓
Main Process → agent:stream → Renderer
                            ↓
              agent:status(completed) → Renderer
```

### 4.3 エラーハンドリング

```
SDK例外発生
     ↓
agent:stream(type: 'error', error: message)
     ↓
agent:status(status: 'error')
     ↓
Renderer エラー表示
```

## 5. 成果物マッピング

| 成果物            | 配置先                                                     |
| ----------------- | ---------------------------------------------------------- |
| AgentExecutor     | `apps/desktop/src/main/services/agent/AgentExecutor.ts`    |
| ExecutionManager  | `apps/desktop/src/main/services/agent/ExecutionManager.ts` |
| PermissionRules   | `apps/desktop/src/main/services/agent/PermissionRules.ts`  |
| HooksFactory      | `apps/desktop/src/main/services/agent/HooksFactory.ts`     |
| agentHandlers更新 | `apps/desktop/src/main/ipc/agentHandlers.ts`               |
| 型定義更新        | `packages/shared/src/types/agent.ts`                       |
| IPCチャネル更新   | `apps/desktop/src/preload/channels.ts`                     |

## 6. 依存関係

### 6.1 外部依存

| パッケージ                     | バージョン | 用途    |
| ------------------------------ | ---------- | ------- |
| @anthropic-ai/claude-agent-sdk | ^0.1.73    | SDK本体 |

### 6.2 内部依存

| モジュール     | 説明                   |
| -------------- | ---------------------- |
| AGENT-003      | スキル管理バックエンド |
| SkillService   | スキル情報取得         |
| electron-store | 設定永続化             |

## 7. 制約事項

1. Claude Codeがインストールされ、認証済みであること
2. ユーザーが有効なClaude Codeサブスクリプションを持っていること
3. Main Processでのみquery() APIを呼び出すこと
4. nodeIntegration: false を維持すること

---

作成日: 2026-01-12
Phase: 1
ステータス: 完了
