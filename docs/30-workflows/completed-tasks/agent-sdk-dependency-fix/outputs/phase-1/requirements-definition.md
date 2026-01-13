# 要件定義書 - Agent SDK 依存関係修正

## メタ情報

| 項目       | 内容                                    |
| ---------- | --------------------------------------- |
| タスクID   | AGENT-SDK-DEP-FIX                       |
| Phase      | 1 - 要件定義                            |
| 作成日     | 2026-01-13                              |
| ステータス | 完了                                    |
| ブランチ   | docs/task-spec-agent-sdk-dependency-fix |

---

## 目的

`@anthropic-ai/claude-agent-sdk` パッケージがElectronメインプロセスで正常に解決され、Agent機能が正常に動作するようにする。

---

## 機能要件（FR）

### FR-001: SDK パッケージの正常解決

| 項目   | 内容                                                                |
| ------ | ------------------------------------------------------------------- |
| 要件ID | FR-001                                                              |
| 要件名 | SDK パッケージの正常解決                                            |
| 優先度 | 必須                                                                |
| 説明   | `@anthropic-ai/claude-agent-sdk` がnode_modulesから正常に解決される |

**詳細要件**:

1. `packages/shared/package.json` にSDKの依存関係を追加
2. `pnpm install` 実行後、node_modulesにパッケージが存在する
3. `pnpm ls @anthropic-ai/claude-agent-sdk` で正常にリストされる

---

### FR-002: Electronアプリ起動

| 項目   | 内容                                                       |
| ------ | ---------------------------------------------------------- |
| 要件ID | FR-002                                                     |
| 要件名 | Electronアプリ起動                                         |
| 優先度 | 必須                                                       |
| 説明   | Electronアプリが `ERR_MODULE_NOT_FOUND` エラーなく起動する |

**詳細要件**:

1. `pnpm --filter @repo/desktop dev` でアプリが起動する
2. Main Processが正常に初期化される
3. Renderer Processが正常にレンダリングされる

---

### FR-003: Agent IPC通信

| 項目   | 内容                                                           |
| ------ | -------------------------------------------------------------- |
| 要件ID | FR-003                                                         |
| 要件名 | Agent IPC通信                                                  |
| 優先度 | 必須                                                           |
| 説明   | Renderer ProcessからMain ProcessへのAgent関連IPC通信が機能する |

**詳細要件**:

1. `agent:query` チャンネルでクエリを送信可能
2. `agent:abort` チャンネルでクエリを中断可能
3. `agent:getStatus` チャンネルでステータス取得可能
4. `agent:createSession` チャンネルでセッション作成可能
5. `agent:resumeSession` チャンネルでセッション再開可能
6. `agent:destroySession` チャンネルでセッション破棄可能
7. `agent:message` チャンネルでストリーミング応答を受信可能

---

### FR-004: SDK初期化シーケンス

| 項目   | 内容                                                             |
| ------ | ---------------------------------------------------------------- |
| 要件ID | FR-004                                                           |
| 要件名 | SDK初期化シーケンス                                              |
| 優先度 | 必須                                                             |
| 説明   | AgentClientクラスが正常に初期化され、SDKインスタンスが生成される |

**詳細要件**:

1. AgentClient.initialize() が正常完了する
2. ClaudeSDKインスタンスが生成される
3. ステータスが `initialized` に更新される

---

### FR-005: ビルドプロセス

| 項目   | 内容                                                         |
| ------ | ------------------------------------------------------------ |
| 要件ID | FR-005                                                       |
| 要件名 | ビルドプロセス                                               |
| 優先度 | 必須                                                         |
| 説明   | `electron-vite build` が正常完了し、ビルド成果物が生成される |

**詳細要件**:

1. `pnpm --filter @repo/desktop build` が正常完了
2. `apps/desktop/out/main/index.js` が生成される
3. ビルド後のアプリが `ERR_MODULE_NOT_FOUND` なく起動する

---

## 非機能要件（NFR）

### NFR-001: ビルド時間への影響

| 項目   | 内容                                       |
| ------ | ------------------------------------------ |
| 要件ID | NFR-001                                    |
| 要件名 | ビルド時間への影響                         |
| 優先度 | 推奨                                       |
| 説明   | 修正によるビルド時間の増加を最小限に抑える |

**詳細要件**:

1. ビルド時間の増加は10%以内
2. SDKはバンドルせず外部化を維持（バンドルサイズ削減）

---

### NFR-002: 依存関係の一貫性

| 項目   | 内容                                     |
| ------ | ---------------------------------------- |
| 要件ID | NFR-002                                  |
| 要件名 | 依存関係の一貫性                         |
| 優先度 | 必須                                     |
| 説明   | モノレポ内での依存関係の一貫性を維持する |

**詳細要件**:

1. SDKバージョンはワークスペース全体で統一
2. pnpmのストリクトモードに準拠
3. 幽霊依存関係を作らない

---

### NFR-003: 後方互換性

| 項目   | 内容                               |
| ------ | ---------------------------------- |
| 要件ID | NFR-003                            |
| 要件名 | 後方互換性                         |
| 優先度 | 必須                               |
| 説明   | 既存の機能・テストに影響を与えない |

**詳細要件**:

1. 既存のVitestテストがすべてパス
2. 既存のE2Eテストがすべてパス
3. Agent API の I/F は変更なし

---

### NFR-004: エラーハンドリング

| 項目   | 内容                                                 |
| ------ | ---------------------------------------------------- |
| 要件ID | NFR-004                                              |
| 要件名 | エラーハンドリング                                   |
| 優先度 | 推奨                                                 |
| 説明   | モジュール解決失敗時の適切なフォールバックを提供する |

**詳細要件**:

1. SDK未インストール時のエラーメッセージが明確
2. 初期化失敗時のステータスが `error` に設定される
3. エラー情報がログに記録される

---

## 接続要件

### SDK初期化

| 項目             | 内容                                   |
| ---------------- | -------------------------------------- |
| 初期化タイミング | Electronアプリ起動時（Main Process内） |
| 必要な認証情報   | APIキー（環境変数経由）                |
| 初期化順序       | IPC Handler登録前にSDK初期化           |

### IPC通信

| チャンネル             | 方向            | データ形式         |
| ---------------------- | --------------- | ------------------ |
| `agent:query`          | Renderer → Main | QueryRequest       |
| `agent:abort`          | Renderer → Main | void               |
| `agent:getStatus`      | Renderer → Main | void → AgentStatus |
| `agent:createSession`  | Renderer → Main | void → SessionID   |
| `agent:resumeSession`  | Renderer → Main | SessionID → void   |
| `agent:destroySession` | Renderer → Main | SessionID → void   |
| `agent:message`        | Main → Renderer | SDKMessage         |

### エラーハンドリング

| エラー種別         | 対応方法                       |
| ------------------ | ------------------------------ |
| モジュール解決失敗 | 起動時に明確なエラーログを出力 |
| SDK初期化失敗      | ステータスを `error` に更新    |
| クエリ失敗         | リトライ後にエラーを返却       |
| タイムアウト       | AbortControllerでキャンセル    |

---

## 技術制約

| 制約項目               | 内容                              |
| ---------------------- | --------------------------------- |
| パッケージマネージャー | pnpm（strictモード）              |
| ビルドツール           | electron-vite                     |
| モジュール形式         | ESM (Main Process), CJS (Preload) |
| Node.jsバージョン      | >= 22.0.0                         |
| Electronバージョン     | 39.x                              |

---

## 関連仕様

| 仕様                      | パス                                                                         |
| ------------------------- | ---------------------------------------------------------------------------- |
| Agent SDKインターフェース | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk.md`  |
| 技術スタック              | `.claude/skills/aiworkflow-requirements/references/technology-core.md`       |
| モノレポアーキテクチャ    | `.claude/skills/aiworkflow-requirements/references/architecture-monorepo.md` |

---

## 変更履歴

| バージョン | 日付       | 変更内容 |
| ---------- | ---------- | -------- |
| 1.0.0      | 2026-01-13 | 初版作成 |
