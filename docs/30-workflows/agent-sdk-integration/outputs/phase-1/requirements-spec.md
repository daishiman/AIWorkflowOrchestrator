# Agent SDK統合 要件定義書

> Phase 1 成果物
> 作成日: 2026-01-08
> スキル: functional-non-functional-requirements

---

## 1. 概要

### 1.1 目的

Claude Agent SDK（`@anthropic-ai/claude-agent-sdk`）をElectronデスクトップアプリケーションに統合し、スライド生成スキル（`presentation-slide-generator`）をAIエージェント経由で実行可能にする。

### 1.2 スコープ

| 範囲内             | 範囲外                   |
| ------------------ | ------------------------ |
| Agent SDK初期化    | 複数エージェント同時実行 |
| query() API統合    | MCP統合（将来Phase）     |
| IPC通信実装        | 本番環境デプロイ         |
| セッション管理     | 課金・使用量管理         |
| エラーハンドリング | -                        |

---

## 2. 機能要件（FR）

### FR-001: Agent SDK初期化

| 項目   | 内容                                                                   |
| ------ | ---------------------------------------------------------------------- |
| ID     | FR-001                                                                 |
| 優先度 | Must                                                                   |
| 説明   | Electronアプリ起動時にClaude Agent SDKを初期化し、使用可能な状態にする |

**詳細要件**:

1. Main Processでのみ初期化を行う（Renderer Processからは不可）
2. ANTHROPIC_API_KEYは環境変数から取得する
3. 初期化失敗時はエラーをログに記録し、UIに通知する
4. 初期化状態を確認するAPIを提供する

**依存関係**: なし

---

### FR-002: スキル呼び出し機能（query API）

| 項目   | 内容                                                                          |
| ------ | ----------------------------------------------------------------------------- |
| ID     | FR-002                                                                        |
| 優先度 | Must                                                                          |
| 説明   | Renderer ProcessからMain Process経由でClaude Agent SDKのquery() APIを呼び出す |

**詳細要件**:

1. IPCチャネル `agent:query` でクエリを受け付ける
2. プロンプト、オプション（timeout、sessionId）を引数として受け取る
3. ストリーミングレスポンスをRenderer Processに転送する
4. AbortSignalによるキャンセル機能を提供する

**依存関係**: FR-001

---

### FR-003: セッション管理機能

| 項目   | 内容                                                     |
| ------ | -------------------------------------------------------- |
| ID     | FR-003                                                   |
| 優先度 | Should                                                   |
| 説明   | 会話のコンテキストを維持するセッション管理機能を提供する |

**詳細要件**:

1. セッションID生成機能
2. セッション状態の保持（メモリ内）
3. セッション再開機能
4. セッション破棄機能

**依存関係**: FR-001

---

### FR-004: IPC通信インターフェース

| 項目   | 内容                                                      |
| ------ | --------------------------------------------------------- |
| ID     | FR-004                                                    |
| 優先度 | Must                                                      |
| 説明   | Renderer ProcessとMain Process間の安全なIPC通信を実装する |

**詳細要件**:

1. contextBridgeを使用してAPIを公開する
2. 以下のチャネルを実装する:
   - `agent:query` - クエリ実行
   - `agent:abort` - 処理中断
   - `agent:getStatus` - 状態取得
   - `agent:createSession` - セッション作成
   - `agent:resumeSession` - セッション再開
   - `agent:destroySession` - セッション破棄
   - `agent:onMessage` - メッセージ受信（ストリーミング）
3. すべてのIPCハンドラで引数バリデーションを行う

**依存関係**: FR-001, FR-002, FR-003

---

### FR-005: エラーハンドリング

| 項目   | 内容                                             |
| ------ | ------------------------------------------------ |
| ID     | FR-005                                           |
| 優先度 | Must                                             |
| 説明   | SDKおよびIPC通信で発生するエラーを適切に処理する |

**詳細要件**:

1. エラー種別の分類:
   - `AgentInitializationError` - 初期化エラー
   - `AgentQueryError` - クエリ実行エラー
   - `AgentTimeoutError` - タイムアウトエラー
   - `AgentAbortedError` - キャンセルエラー
   - `AgentSessionError` - セッションエラー
2. エラーメッセージのユーザー向けローカライズ
3. エラーログの記録（構造化ログ）
4. リトライ戦略の実装（指数バックオフ）

**依存関係**: FR-001, FR-002

---

## 3. 非機能要件（NFR）

### NFR-001: パフォーマンス

| 項目                   | 目標値 |
| ---------------------- | ------ |
| SDK初期化時間          | < 2秒  |
| IPC往復遅延            | < 50ms |
| ストリーミング初回応答 | < 3秒  |
| メモリ使用量増加       | < 50MB |

---

### NFR-002: セキュリティ

| 項目           | 要件                                                         |
| -------------- | ------------------------------------------------------------ |
| API Key管理    | Main Processでのみ保持。Renderer Processには絶対に公開しない |
| IPC検証        | すべてのIPCリクエストの送信元を検証する                      |
| CSP準拠        | Content Security Policyに準拠した実装                        |
| サンドボックス | Electronサンドボックスを有効化                               |

**セキュリティ制約**:

```typescript
// BrowserWindow設定
{
  webPreferences: {
    nodeIntegration: false,
    contextIsolation: true,
    sandbox: true,
    webSecurity: true,
  }
}
```

---

### NFR-003: 可用性

| 項目           | 要件                                      |
| -------------- | ----------------------------------------- |
| エラー復旧     | 一時的なエラー時は自動リトライ（最大3回） |
| フォールバック | SDK接続不可時はエラーメッセージを表示     |
| オフライン対応 | オフライン時は明確なエラーを返す          |

---

### NFR-004: 保守性

| 項目             | 要件                                          |
| ---------------- | --------------------------------------------- |
| コード構造       | packages/shared/src/agent/ に共通ロジック配置 |
| 型安全性         | TypeScript strictモード準拠                   |
| テストカバレッジ | Line 80%+, Branch 60%+, Function 80%+         |
| ドキュメント     | JSDocによるAPI文書化                          |

---

## 4. 接続要件（統合テスト連携）

### 4.1 Agent SDK APIエンドポイント

| 項目       | 値                               |
| ---------- | -------------------------------- |
| パッケージ | `@anthropic-ai/claude-agent-sdk` |
| 主要API    | `query()`                        |
| 認証方式   | ANTHROPIC_API_KEY（環境変数）    |

### 4.2 認証フロー

```
1. 環境変数 ANTHROPIC_API_KEY を取得
2. Main Process で SDK を初期化
3. 初期化成功後、IPC経由でRenderer Processに通知
```

### 4.3 データフロー

```
Renderer Process (UI)
    │
    │ IPC: agent:query
    ▼
Main Process (agentHandler.ts)
    │
    │ query()
    ▼
Claude Agent SDK
    │
    │ stream messages
    ▼
Main Process (agentHandler.ts)
    │
    │ IPC: agent:onMessage
    ▼
Renderer Process (useAgent hook)
```

---

## 5. 制約事項

### 5.1 技術制約

| 制約          | 説明                                 |
| ------------- | ------------------------------------ |
| Electron IPC  | Main-Renderer間通信はIPC経由のみ     |
| Node.js環境   | Agent SDKはMain Processでのみ動作    |
| contextBridge | Renderer Processへの API公開は限定的 |

### 5.2 ビジネス制約

| 制約         | 説明                                     |
| ------------ | ---------------------------------------- |
| 開発環境限定 | `permissionMode: 'auto'` は開発環境のみ  |
| API使用量    | 開発時の使用量を考慮したタイムアウト設定 |

---

## 6. 用語定義

| 用語             | 定義                                                 |
| ---------------- | ---------------------------------------------------- |
| Agent SDK        | Claude Agent SDK (`@anthropic-ai/claude-agent-sdk`)  |
| query()          | SDKのメッセージ送信API                               |
| IPC              | Inter-Process Communication（プロセス間通信）        |
| Main Process     | Electronのメインプロセス                             |
| Renderer Process | Electronのレンダラープロセス                         |
| Preload Script   | Renderer ProcessとMain Processを橋渡しするスクリプト |
| contextBridge    | PreloadスクリプトでAPIを安全に公開する仕組み         |

---

## 変更履歴

| バージョン | 日付       | 変更内容 |
| ---------- | ---------- | -------- |
| 1.0.0      | 2026-01-08 | 初版作成 |
