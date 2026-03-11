# API エンドポイント一覧

> 本ドキュメントは統合システム設計仕様書の一部です。
> 管理: .claude/skills/aiworkflow-requirements/

---

## 概要

本ドキュメントはAIWorkflowOrchestratorプロジェクトのAPIエンドポイントのインデックスです。
REST API、Desktop IPC APIの詳細は以下の分割ドキュメントで定義しています。

---

## ドキュメント構成

| カテゴリ               | ファイル                                     | 説明                                |
| ---------------------- | -------------------------------------------- | ----------------------------------- |
| 認証・プロフィールIPC  | [api-ipc-auth.md](./api-ipc-auth.md)         | OAuth認証、プロフィール管理IPC      |
| Agent・Chat Edit IPC   | [api-ipc-agent.md](./api-ipc-agent.md)       | スキル管理、ワークスペースチャット  |
| システムIPC・AIプロバイダー | [api-ipc-system.md](./api-ipc-system.md) | AI/チャット、スライド同期、APIキー  |

---

## REST API エンドポイント一覧

### ワークフロー管理

| メソッド | パス                          | 説明                   | 認証 |
| -------- | ----------------------------- | ---------------------- | ---- |
| POST     | /api/v1/workflows             | ワークフロー作成       | 必要 |
| GET      | /api/v1/workflows             | ワークフロー一覧取得   | 必要 |
| GET      | /api/v1/workflows/{id}        | ワークフロー詳細取得   | 必要 |
| PATCH    | /api/v1/workflows/{id}        | ワークフロー更新       | 必要 |
| DELETE   | /api/v1/workflows/{id}        | ワークフロー削除       | 必要 |
| POST     | /api/v1/workflows/{id}/retry  | ワークフローリトライ   | 必要 |
| POST     | /api/v1/workflows/{id}/cancel | ワークフローキャンセル | 必要 |

### Local Agent API

| メソッド | パス                    | 説明                 | 認証  |
| -------- | ----------------------- | -------------------- | ----- |
| POST     | /api/v1/agent/sync      | ファイル同期         | Agent |
| POST     | /api/v1/agent/execute   | ワークフロー実行     | Agent |
| GET      | /api/v1/agent/status    | エージェント状態確認 | Agent |
| POST     | /api/v1/agent/heartbeat | ハートビート         | Agent |

### ユーザー設定

| メソッド | パス                  | 説明             | 認証 |
| -------- | --------------------- | ---------------- | ---- |
| GET      | /api/v1/settings      | ユーザー設定取得 | 必要 |
| PATCH    | /api/v1/settings      | ユーザー設定更新 | 必要 |
| GET      | /api/v1/api-keys      | APIキー一覧取得  | 必要 |
| POST     | /api/v1/api-keys      | APIキー登録      | 必要 |
| DELETE   | /api/v1/api-keys/{id} | APIキー削除      | 必要 |

### システム

| メソッド | パス           | 説明           | 認証 |
| -------- | -------------- | -------------- | ---- |
| GET      | /api/health    | ヘルスチェック | 不要 |
| GET      | /api/v1/status | 詳細ステータス | 必要 |

### チャット履歴

| メソッド | パス                           | 説明                   | 認証 |
| -------- | ------------------------------ | ---------------------- | ---- |
| GET      | /api/v1/sessions               | セッション一覧取得     | 必要 |
| GET      | /api/v1/sessions/{id}          | セッション詳細取得     | 必要 |
| POST     | /api/v1/sessions               | セッション作成         | 必要 |
| PATCH    | /api/v1/sessions/{id}          | セッション更新         | 必要 |
| DELETE   | /api/v1/sessions/{id}          | セッション削除         | 必要 |
| GET      | /api/v1/sessions/{id}/messages | メッセージ一覧取得     | 必要 |
| POST     | /api/v1/sessions/{id}/messages | メッセージ追加         | 必要 |
| GET      | /api/v1/sessions/{id}/export   | セッションエクスポート | 必要 |
| POST     | /api/v1/sessions/export/batch  | 一括エクスポート       | 必要 |

---

## エンドポイント命名規則

### 命名パターン

| パターン     | 例                           | 説明             |
| ------------ | ---------------------------- | ---------------- |
| コレクション | /api/v1/workflows            | 複数形を使用     |
| 個別リソース | /api/v1/workflows/{id}       | ID指定           |
| サブリソース | /api/v1/workflows/{id}/steps | 親子関係         |
| アクション   | /api/v1/workflows/{id}/retry | 動詞が必要な操作 |

### 禁止パターン

| パターン                 | 理由              | 正しい例               |
| ------------------------ | ----------------- | ---------------------- |
| /api/v1/getWorkflows     | URLに動詞を含める | /api/v1/workflows      |
| /api/v1/workflow         | 単数形を使用      | /api/v1/workflows      |
| /api/v1/workflows/create | POSTで十分        | POST /api/v1/workflows |

---

## Desktop IPC API サマリー

### 主要IPCチャンネル

| カテゴリ       | チャンネル例           | 詳細                                 |
| -------------- | ---------------------- | ------------------------------------ |
| 認証           | auth:login, auth:logout | [api-ipc-auth.md](./api-ipc-auth.md) |
| プロフィール   | profile:get, profile:update | [api-ipc-auth.md](./api-ipc-auth.md) |
| Agent          | agent:execute, agent:get-skills | [api-ipc-agent.md](./api-ipc-agent.md) |
| Skill実行      | skill:execute, skill:stream, skill:abort, skill:get-status, skill:complete, skill:error | [interfaces-agent-sdk-skill.md](./interfaces-agent-sdk-skill.md) |
| Skill権限      | skill:permission-request, skill:permission-response | [interfaces-agent-sdk-skill.md](./interfaces-agent-sdk-skill.md) |
| Skill管理      | skill:list, skill:get-imported, skill:scan, skill:import, skill:remove | [interfaces-agent-sdk-skill.md](./interfaces-agent-sdk-skill.md) |
| Chat Edit      | chat-edit:send-with-context | [api-ipc-agent.md](./api-ipc-agent.md) |
| AI/チャット    | AI_CHAT, AI_INDEX, llm:set-selected-config | [api-ipc-system.md](./api-ipc-system.md) |
| Notification   | notification:get-history, notification:mark-read, notification:mark-all-read, notification:delete, notification:clear, notification:new | [api-ipc-system.md](./api-ipc-system.md) |
| HistorySearch  | history:search, history:get-stats | [api-ipc-system.md](./api-ipc-system.md) |
| スライド同期   | slide:sync-status      | [api-ipc-system.md](./api-ipc-system.md) |
| APIキー管理    | apiKey:save, apiKey:validate | [api-ipc-system.md](./api-ipc-system.md) |
| SDK認証キー    | auth-key:set, auth-key:exists, auth-key:validate, auth-key:delete | [api-ipc-system.md](./api-ipc-system.md) |

### IPC設計原則

| 原則                   | 説明                                     |
| ---------------------- | ---------------------------------------- |
| contextIsolation       | Preloadスクリプトでのみ通信APIを公開     |
| チャネルホワイトリスト | 許可されたチャネルのみ通信可能           |
| sender検証             | withValidation()でリクエスト元を検証     |
| 型安全性               | 全チャネルに対してTypeScript型定義を適用 |

---

## 変更履歴

| Version | Date       | Changes                                            |
| ------- | ---------- | -------------------------------------------------- |
| 2.5.0   | 2026-03-11 | TASK-FIX-APIKEY-CHAT-TOOL-INTEGRATION-001: Desktop IPC API サマリーの AI/チャットへ `llm:set-selected-config` を追加 |
| 2.4.0   | 2026-03-11 | TASK-UI-08-NOTIFICATION-CENTER: Notification IPC サマリーに `notification:delete` を追加し、058e の個別削除契約へ同期 |
| 2.3.0   | 2026-03-05 | TASK-UI-01-C-NOTIFICATION-HISTORY-DOMAIN: Notification（5チャネル）/ HistorySearch（2チャネル）をDesktop IPC APIサマリーへ追加 |
| 2.2.0   | 2026-02-08 | TASK-FIX-16-1: SDK認証キーIPCチャンネル4種をDesktop IPC APIサマリーに追加 |
| 2.1.0   | 2026-02-06 | TASK-FIX-5-1: Skill IPC チャンネル（実行/権限/管理 13チャネル）をDesktop IPC APIサマリーに追加 |
| 2.0.0   | 2026-01-26 | 3ファイルに分割（875行→インデックス+詳細ファイル） |
| 1.0.0   | 2026-01-25 | 初版作成                                           |

---

## 関連ドキュメント

- [アーキテクチャパターン](./architecture-patterns.md)
- [セキュリティ設計](./security-api-electron.md)
- [LLMインターフェース](./interfaces-llm.md)
