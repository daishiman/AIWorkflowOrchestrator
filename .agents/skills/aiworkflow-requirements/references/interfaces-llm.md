# LLM・Embedding インターフェース仕様

> 本ドキュメントは統合システム設計仕様書の一部です。
> 管理: .claude/skills/aiworkflow-requirements/

---

## 概要

本ドキュメントはAIWorkflowOrchestratorプロジェクトのLLM・Embeddingインターフェースのインデックスです。
各カテゴリは以下の分割ドキュメントで詳細を定義しています。

---

## ドキュメント構成

| カテゴリ               | ファイル                                                     | 説明                                        |
| ---------------------- | ------------------------------------------------------------ | ------------------------------------------- |
| IPC型定義・Multi-LLM   | [llm-ipc-types.md](./llm-ipc-types.md)                       | Desktop IPC型、プロバイダー切替、Zod Schema |
| ストリーミング         | [llm-streaming.md](./llm-streaming.md)                       | SSE、AbortController、キャンセル機構        |
| Embedding Generation   | [llm-embedding.md](./llm-embedding.md)                       | チャンキング、バッチ処理、パイプライン      |
| Workspace Chat Edit    | [llm-workspace-chat-edit.md](./llm-workspace-chat-edit.md)   | ファイルI/O、コンテキスト構築、LLM統合      |

---

## アーキテクチャ概要

LLM統合アーキテクチャは、Electronのセキュアなプロセス分離モデルに基づき、Renderer ProcessとMain Processの2層構成で設計されている。

### Renderer Process（UIレイヤー）

ユーザーインターフェースを担当し、以下のコンポーネントで構成される。

| コンポーネント     | 責務                                   |
| ------------------ | -------------------------------------- |
| ProviderSelector   | LLMプロバイダーの選択UI                |
| ModelSelector      | モデルの選択UI                         |
| StreamingMessage   | ストリーミングレスポンスの表示         |

これらのコンポーネントは、contextBridgeを介したIPC Bridgeを通じてMain Processと通信する。

### Main Process（バックエンドレイヤー）

セキュアな処理を担当し、IPC Handlersがリクエストを受け付けて以下のサービスに振り分ける。

| サービス           | 責務                                   |
| ------------------ | -------------------------------------- |
| LLM Adapters       | 各プロバイダー（OpenAI, Anthropic等）への接続とリクエスト処理 |
| Embedding Provider | テキストのベクトル化処理               |
| ChatEdit Service   | ワークスペースコンテキストを含むチャット処理 |

### 通信フロー

Renderer Processの各コンポーネントからのリクエストは、IPC Bridge（contextBridge）を経由してMain ProcessのIPC Handlersに到達する。IPC Handlersは処理内容に応じて適切なサービス（LLM Adapters、Embedding Provider、ChatEdit Service）にルーティングする

---

## 対応LLMプロバイダー

| プロバイダー | モデル例                         | コンテキストウィンドウ |
| ------------ | -------------------------------- | ---------------------- |
| OpenAI       | gpt-5.2-instant, gpt-4           | 400K, 8K               |
| Anthropic    | claude-sonnet-4.5, claude-3-opus | 200K (1M beta), 200K   |
| Google       | gemini-3-flash, gemini-pro       | 1M, 32K                |
| xAI          | grok-4.1-fast, grok-1            | 2M, 8K                 |

---

## 主要IPCチャンネル

| チャンネル           | 方向            | 説明                     | 詳細                     |
| -------------------- | --------------- | ------------------------ | ------------------------ |
| llm:get-providers    | Renderer → Main | プロバイダー一覧取得     | [llm-ipc-types.md](./llm-ipc-types.md) |
| llm:send-chat        | Renderer → Main | チャット送信             | [llm-ipc-types.md](./llm-ipc-types.md) |
| llm:stream-chat      | Renderer ↔ Main | ストリーミングチャット   | [llm-streaming.md](./llm-streaming.md) |
| chat-edit:send-with-context | Renderer → Main | コンテキスト付きチャット | [llm-workspace-chat-edit.md](./llm-workspace-chat-edit.md) |

---

## 品質メトリクス サマリー

| コンポーネント      | テスト数 | Line Coverage | Branch Coverage |
| ------------------- | -------- | ------------- | --------------- |
| LLM Adapter         | 360      | 99.25%        | 90.56%          |
| Streaming           | 129      | -             | 全PASS          |
| Embedding Pipeline  | 104 + 14 | 91.39%        | 87.13%          |
| Workspace Chat Edit | 164 + 45 | 95%           | 90%             |

---

## 完了タスク

### Workspace Chat Edit Main Process（TASK-WCE-MAIN-001）

| 項目         | 内容                                                           |
| ------------ | -------------------------------------------------------------- |
| タスクID     | TASK-WCE-MAIN-001                                              |
| Issue        | #469                                                           |
| 完了日       | 2026-01-25                                                     |
| 実装内容     | FileService, ContextBuilder, ChatEditService, chatEditHandlers |
| テスト数     | 164（自動）+ 23（手動検証項目）                                |
| カバレッジ   | Line 92.55%, Branch 92.85%                                     |

### LLMストリーミングレスポンス（UT-LLM-STREAM-001）

| 項目         | 内容                                                                                          |
| ------------ | --------------------------------------------------------------------------------------------- |
| タスクID     | UT-LLM-STREAM-001                                                                             |
| 完了日       | 2026-01-24                                                                                    |
| テスト数     | 129（自動テスト）+ 19（手動テスト項目）                                                       |
| 発見課題     | 0件（Critical/Major/Minor）、2件（Info）                                                      |

### 会話履歴永続化（UT-LLM-HISTORY-001）

| 項目         | 内容                                                                                      |
| ------------ | ----------------------------------------------------------------------------------------- |
| タスクID     | UT-LLM-HISTORY-001                                                                        |
| 完了日       | 2026-01-24                                                                                |
| テスト数     | 114（自動テスト）+ 12（手動テスト項目）                                                   |
| カバレッジ   | Line 100%, Branch 100%, Function 100%                                                     |

### Workspace管理統合（TASK-WCE-WORKSPACE-001）

| 項目         | 内容                                                                                    |
| ------------ | --------------------------------------------------------------------------------------- |
| タスクID     | TASK-WCE-WORKSPACE-001                                                                  |
| Issue        | #660                                                                                    |
| 完了日       | 2026-02-02                                                                              |
| 実装内容     | workspacePathパラメータ追加、isWithinWorkspace検証、folderFileTreesからファイル一覧取得 |
| 修正ファイル | chatEditHandlers.ts, useFileContext.ts, fileTreeUtils.ts（新規）                        |
| テスト数     | 45（ユニット＋統合）                                                                    |
| カバレッジ   | Line 95%, Branch 90%, Function 100%                                                     |
| 詳細         | [llm-workspace-chat-edit.md](./llm-workspace-chat-edit.md#workspace管理統合task-wce-workspace-0012026-02-02完了) |

---

## 変更履歴

| Version | Date       | Changes                                                                                |
| ------- | ---------- | -------------------------------------------------------------------------------------- |
| 2.2.0   | 2026-02-02 | TASK-WCE-WORKSPACE-001完了: Workspace管理統合エントリ追加、品質メトリクス更新          |
| 2.1.0   | 2026-01-26 | アーキテクチャ概要をコードブロックから表形式・文章に変換（spec-guidelines準拠）        |
| 2.0.0   | 2026-01-26 | 4ファイルに分割（901行→インデックス+詳細ファイル）                                     |
| 1.2.0   | 2026-01-25 | Workspace Chat Edit サービスインターフェース追加                                       |
| 1.1.0   | 2026-01-24 | LLMストリーミングレスポンス仕様セクション追加                                          |
| 1.0.0   | 2026-01-24 | 初版作成                                                                               |

---

## 関連ドキュメント

- [アーキテクチャ設計](./05-architecture.md)
- [エラーハンドリング仕様](./07-error-handling.md)
- [セキュリティガイドライン](./17-security-guidelines.md)
- [RAGアーキテクチャ](./architecture-rag.md)
