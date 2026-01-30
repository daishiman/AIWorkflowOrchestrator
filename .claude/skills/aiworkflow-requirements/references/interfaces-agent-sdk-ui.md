# Agent SDK UI 仕様

> 本ドキュメントは interfaces-agent-sdk.md の分割ファイルです。
> 親ファイル: interfaces-agent-sdk.md
> 管理: .claude/skills/aiworkflow-requirements/

---

## 概要

Agent Execution UI、AgentSDKPageに関する型定義とコンポーネント仕様。
実行画面UI実装時に参照する。

---

## Agent Execution UI 型定義（AGENT-004）

Agent Execution UI機能で使用する型定義。エージェント実行画面でのチャットインターフェース、ストリーミング出力、権限確認ダイアログを提供する。

### 実装ファイル

| ファイル                                                                 | 説明                                   |
| ------------------------------------------------------------------------ | -------------------------------------- |
| `packages/shared/src/types/agent.ts`                                     | Agent Execution UI型定義（共有）       |
| `apps/desktop/src/renderer/store/slices/agentSlice.ts`                   | Zustand状態管理（Agent Execution拡張） |
| `apps/desktop/src/renderer/views/AgentExecutionView/`                    | メインビュー                           |
| `apps/desktop/src/renderer/components/skill/PermissionDialog.tsx`         | 権限確認ダイアログ（TASK-7C実装済み）  |
| `apps/desktop/src/renderer/components/organisms/AgentChatInterface/`     | チャットインターフェース               |
| `apps/desktop/src/renderer/components/molecules/AgentMessageInput/`      | メッセージ入力                         |
| `apps/desktop/src/renderer/components/molecules/AgentExecutionControls/` | 実行制御ボタン                         |

---

### アーキテクチャ

Agent Execution UIは、Electronのマルチプロセスアーキテクチャに基づいて設計されている。Renderer ProcessとMain Processが明確に分離され、IPCを介して通信する。

#### プロセス構成

| プロセス         | 責務                                           |
| ---------------- | ---------------------------------------------- |
| Renderer Process | UI表示、ユーザー操作の受付、状態管理           |
| Main Process     | Claude Agent SDK統合、IPC処理、システムリソース |

#### Renderer Process コンポーネント階層

| レイヤー | コンポーネント           | 役割                                         |
| -------- | ------------------------ | -------------------------------------------- |
| View     | AgentExecutionView       | 最上位ビュー、全体レイアウト管理             |
| Organism | AgentChatInterface       | チャット会話表示領域                         |
| Molecule | AgentOutputStream        | ストリーミング出力のリアルタイム表示         |
| Molecule | AgentExecutionControls   | 実行制御ボタン（キャンセル、クリア）         |
| Molecule | AgentMessageInput        | メッセージ入力フィールドと送信ボタン         |
| Organism | PermissionDialog         | ツール実行許可の確認モーダル（許可/拒否/常に許可） |

#### プロセス間通信

Renderer ProcessはPreload APIを通じてMain Processと通信する。window.agentAPIがcontextBridgeによってRenderer Processに公開され、IPCチャンネル経由でMain ProcessのAgent IPC Handlersを呼び出す。Main ProcessはClaude Agent SDK Integrationを通じて実際のエージェント処理を実行する。

---

### 型定義

#### AgentExecutionStatus型

エージェント実行の7つの状態を表す列挙型。

| 値                    | 説明                           |
| --------------------- | ------------------------------ |
| `idle`                | 待機中（初期状態）             |
| `executing`           | 実行中（クエリ処理中）         |
| `streaming`           | ストリーミング中（応答受信中） |
| `awaiting_permission` | 権限待ち（ユーザー確認待ち）   |
| `completed`           | 完了（正常終了）               |
| `cancelled`           | キャンセル済（ユーザー中断）   |
| `error`               | エラー（異常終了）             |

#### AgentMessage型

チャットインターフェースに表示されるメッセージ。

| プロパティ    | 型                                  | 必須 | 説明                   |
| ------------- | ----------------------------------- | ---- | ---------------------- |
| `id`          | `string`                            | ✓    | メッセージの一意識別子 |
| `role`        | `'user' \| 'assistant' \| 'system'` | ✓    | メッセージの送信者     |
| `content`     | `string`                            | ✓    | メッセージ内容         |
| `timestamp`   | `Date`                              | ✓    | 送信日時               |
| `isStreaming` | `boolean`                           | -    | ストリーミング中フラグ |
| `type`        | `'text' \| 'error' \| 'tool_use'`   | -    | メッセージタイプ       |

#### PermissionRequest型

ツール使用の権限確認リクエスト。

| プロパティ    | 型                        | 必須 | 説明           |
| ------------- | ------------------------- | ---- | -------------- |
| `executionId` | `string`                  | ✓    | 実行ID         |
| `requestId`   | `string`                  | ✓    | リクエストID   |
| `toolName`    | `string`                  | ✓    | ツール名       |
| `args`        | `Record<string, unknown>` | ✓    | ツール引数     |
| `reason`      | `string`                  | -    | リクエスト理由 |

#### PermissionResponse型

ツール使用の権限確認レスポンス。

| プロパティ  | 型        | 必須 | 説明             |
| ----------- | --------- | ---- | ---------------- |
| `requestId` | `string`  | ✓    | リクエストID     |
| `granted`   | `boolean` | ✓    | 許可されたか     |
| `remember`  | `boolean` | -    | 選択を記憶するか |

---

### Zustand状態管理（agentSlice拡張）

#### AgentExecutionState型

| プロパティ                | 型                          | 説明                     |
| ------------------------- | --------------------------- | ------------------------ |
| `status`                  | `AgentExecutionStatus`      | 実行状態                 |
| `currentSkill`            | `Skill \| null`             | 現在のスキル             |
| `messages`                | `AgentMessage[]`            | メッセージ履歴           |
| `currentStreamingContent` | `string`                    | ストリーミング中テキスト |
| `error`                   | `string \| null`            | エラーメッセージ         |
| `pendingPermission`       | `PermissionRequest \| null` | 待機中の権限要求         |
| `rememberedChoices`       | `Record<string, boolean>`   | 記憶された選択           |

#### Agent Execution Actions

| アクション                 | 引数                                 | 説明                   |
| -------------------------- | ------------------------------------ | ---------------------- |
| `setExecutionStatus`       | `status: AgentExecutionStatus`       | 実行状態設定           |
| `setCurrentSkill`          | `skill: Skill \| null`               | 現在のスキル設定       |
| `addMessage`               | `message: AgentMessage`              | メッセージ追加         |
| `appendStreamingContent`   | `content: string`                    | ストリーミング追記     |
| `finalizeStreamingMessage` | -                                    | ストリーミング完了処理 |
| `setError`                 | `error: string \| null`              | エラー設定             |
| `setPendingPermission`     | `request: PermissionRequest \| null` | 権限要求設定           |
| `rememberPermissionChoice` | `toolName: string, granted: boolean` | 選択記憶               |
| `clearMessages`            | -                                    | メッセージクリア       |
| `resetExecutionState`      | -                                    | 状態リセット           |

---

### Preview State Management（AGENT-006）

#### Preview State型

| プロパティ            | 型                       | 説明                 |
| --------------------- | ------------------------ | -------------------- |
| `previewContent`      | `PreviewContent \| null` | プレビューコンテンツ |
| `selectedEnvironment` | `EnvironmentType`        | 選択中の環境         |
| `splitRatio`          | `number`                 | 分割比率 (0-100)     |

#### EnvironmentType

| 値         | 説明                         | 実装状態 |
| ---------- | ---------------------------- | -------- |
| `none`     | プレビューなし（デフォルト） | ✅       |
| `html`     | HTMLプレビュー               | ✅       |
| `markdown` | Markdownプレビュー           | ✅       |
| `terminal` | ターミナル（将来実装）       | 未実装   |
| `code`     | コード実行環境（将来実装）   | 未実装   |

---

### IPC チャンネル（Agent Execution）

| チャンネル             | 方向            | 説明                 |
| ---------------------- | --------------- | -------------------- |
| `agent:start`          | Renderer → Main | エージェント実行開始 |
| `agent:stop`           | Renderer → Main | エージェント実行停止 |
| `agent:stream`         | Main → Renderer | ストリーミング出力   |
| `agent:complete`       | Main → Renderer | 実行完了通知         |
| `agent:error`          | Main → Renderer | エラー通知           |
| `agent:permission`     | Main → Renderer | 権限確認要求         |
| `agent:permission:res` | Renderer → Main | 権限確認応答         |

#### agent:start ペイロード

| フィールド | 型       | 説明         |
| ---------- | -------- | ------------ |
| `skillId`  | `string` | 実行スキルID |
| `prompt`   | `string` | ユーザー入力 |

#### agent:stream ペイロード

| フィールド    | 型       | 説明         |
| ------------- | -------- | ------------ |
| `executionId` | `string` | 実行ID       |
| `delta`       | `string` | 差分テキスト |
| `content`     | `string` | 累積テキスト |

---

### Preload API（window.agentAPI拡張）

#### startExecution

エージェント実行を開始する。

| パラメータ | 型       | 必須 | 説明       |
| ---------- | -------- | ---- | ---------- |
| `skillId`  | `string` | ✓    | スキルID   |
| `prompt`   | `string` | ✓    | プロンプト |

**戻り値**: `Promise<{ executionId: string }>`

#### stopExecution

実行中のエージェントを停止する。

**戻り値**: `Promise<void>`

#### respondToPermission

権限確認に応答する。

| パラメータ | 型                   | 必須 | 説明         |
| ---------- | -------------------- | ---- | ------------ |
| `response` | `PermissionResponse` | ✓    | 権限確認応答 |

**戻り値**: `Promise<void>`

#### onStream

ストリーミング出力のコールバックを登録する。

**戻り値**: `() => void` - 購読解除関数

#### onPermissionRequest

権限確認要求のコールバックを登録する。

**戻り値**: `() => void` - 購読解除関数

---

### アクセシビリティ要件（AGENT-004）

| 要件               | 実装                                   |
| ------------------ | -------------------------------------- |
| キーボードナビ     | Tab/Shift+Tab/Enter/Escapeで操作可能   |
| スクリーンリーダー | aria-label, aria-live, role属性設定    |
| フォーカス管理     | PermissionDialogのフォーカストラップ   |
| 色コントラスト     | WCAG 2.1 AA 4.5:1以上                  |
| ライブリージョン   | ストリーミング出力にaria-live="polite" |

---

## AgentSDKPage（ポストリリーステスト検証UI）

### 概要

AGENT-004実装後のポストリリーステストで作成されたAgent SDK統合テスト用UIページ。

### 実装ファイル

| ファイル                                                                       | 説明                               |
| ------------------------------------------------------------------------------ | ---------------------------------- |
| `apps/desktop/src/renderer/pages/AgentSDKPage/index.tsx`                       | AgentSDKPageメインコンポーネント   |
| `apps/desktop/src/renderer/pages/AgentSDKPage/__tests__/AgentSDKPage.test.tsx` | ユニットテスト（29テスト）         |
| `apps/desktop/e2e/agent-sdk-integration.spec.ts`                               | E2E統合テスト（20テスト）          |
| `apps/desktop/e2e/agent-performance.spec.ts`                                   | パフォーマンステスト（4テスト）    |
| `apps/desktop/e2e/agent-network-resilience.spec.ts`                            | ネットワーク障害テスト（18テスト） |

### Preload API（window.agentSDKAPI）

| メソッド         | 説明               |
| ---------------- | ------------------ |
| `getStatus`      | SDK状態取得        |
| `createSession`  | セッション作成     |
| `resumeSession`  | セッション再開     |
| `destroySession` | セッション破棄     |
| `query`          | クエリ実行         |
| `abort`          | クエリ中断         |
| `onMessage`      | メッセージリスナー |
| `setOption`      | オプション設定     |
| `getOption`      | オプション取得     |
| `setSessionId`   | セッションID設定   |

### data-testid一覧

| data-testid               | 要素   | 用途                     |
| ------------------------- | ------ | ------------------------ |
| `agent-status`            | div    | SDK状態表示              |
| `new-session-button`      | button | セッション作成           |
| `session-id`              | div    | セッションID表示         |
| `prompt-input`            | input  | プロンプト入力           |
| `send-button`             | button | 送信ボタン               |
| `abort-button`            | button | 中断ボタン               |
| `response-area`           | div    | 応答表示エリア           |
| `response-chunk`          | span   | ストリーミングチャンク   |
| `execution-status`        | div    | 実行状態                 |
| `permission-dialog`       | div    | 権限確認ダイアログ       |
| `permission-tool-name`    | div    | ツール名表示             |
| `permission-allow-button` | button | 許可ボタン               |
| `permission-deny-button`  | button | 拒否ボタン               |
| `error-message`           | div    | エラーメッセージ         |
| `validation-error`        | div    | バリデーションエラー     |
| `offline-indicator`       | div    | オフラインインジケーター |

### テスト統計

| テスト種類           | テスト数    | カバレッジ   |
| -------------------- | ----------- | ------------ |
| E2Eテスト            | 42          | -            |
| ユニットテスト       | 29          | Lines 72.06% |
| パフォーマンステスト | 4           | -            |
| 安定性テスト         | 1スクリプト | -            |

---

## 関連ドキュメント

| ドキュメント                     | 説明                       |
| -------------------------------- | -------------------------- |
| interfaces-agent-sdk.md          | 親ファイル（インデックス） |
| interfaces-agent-sdk-executor.md | SkillExecutor仕様          |
| ui-ux-components.md              | UIコンポーネント仕様       |

---

## 変更履歴

| 日付       | バージョン | 変更内容                                         |
| ---------- | ---------- | ------------------------------------------------ |
| 2026-01-26 | 1.1.0      | アーキテクチャ図のコードブロックを表形式に変換   |
| 2026-01-26 | 1.0.0      | interfaces-agent-sdk.mdから分割                  |
