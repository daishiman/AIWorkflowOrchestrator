# TASK-3-1-A スコープ定義書

## メタ情報

| 項目       | 内容       |
| ---------- | ---------- |
| タスクID   | TASK-3-1-A |
| Phase      | 1          |
| 作成日     | 2026-01-24 |
| ステータス | 完了       |

---

## 実装範囲（In Scope）

### 1. SkillExecutor クラス

**ファイル**: `apps/desktop/src/main/services/skill/SkillExecutor.ts`

| メソッド/プロパティ      | 説明                               |
| ------------------------ | ---------------------------------- |
| `execute(request)`       | スキルを実行し、executionId を返す |
| `abort(executionId)`     | 指定した実行を中断する             |
| `getActiveExecutions()`  | 実行中のクエリ一覧を取得する       |
| `getExecutionStatus(id)` | 特定の実行の状態を取得する         |

### 2. 型定義

**ファイル**: `packages/shared/src/types/skill-execution.ts`

| 型名                    | 説明               |
| ----------------------- | ------------------ |
| `SkillExecutionRequest` | 実行リクエストの型 |
| `SkillExecutionResult`  | 実行結果の型       |
| `ExecutionState`        | 実行状態の列挙型   |
| `ExecutionInfo`         | 実行情報の型       |
| `SkillExecutionError`   | 実行エラーの型     |

### 3. IPC ハンドラー

**ファイル**: `apps/desktop/src/main/services/skill/skill-execution-handler.ts`

| チャンネル        | 説明                                          |
| ----------------- | --------------------------------------------- |
| `skill:execute`   | スキル実行                                    |
| `skill:abort`     | 実行中断                                      |
| `skill:getStatus` | 実行状態取得                                  |
| `skill:message`   | ストリーミングメッセージ配信（Main→Renderer） |

### 4. Preload API

**ファイル**: `apps/desktop/src/preload/skillExecutionApi.ts`

| API                                    | 説明                       |
| -------------------------------------- | -------------------------- |
| `window.skillExecutionAPI.execute()`   | スキル実行                 |
| `window.skillExecutionAPI.abort()`     | 実行中断                   |
| `window.skillExecutionAPI.onMessage()` | メッセージ受信コールバック |

### 5. テスト

| ファイル                                                                           | 説明           |
| ---------------------------------------------------------------------------------- | -------------- |
| `apps/desktop/src/main/services/skill/__tests__/SkillExecutor.test.ts`             | ユニットテスト |
| `apps/desktop/src/main/services/skill/__tests__/SkillExecutor.integration.test.ts` | 統合テスト     |

---

## 実装範囲外（Out of Scope）

以下は本タスクの範囲外とし、後続タスクで実装する。

| 項目                         | 理由                     | 対象タスク |
| ---------------------------- | ------------------------ | ---------- |
| PreToolUse/PostToolUse Hooks | 別タスクで実装予定       | TASK-3-1-B |
| PermissionRequest ダイアログ | Hooks実装後に実装        | TASK-3-1-C |
| スキル結果の永続化           | 履歴管理として別途実装   | TASK-4-x   |
| スキル実行ログ               | ログ基盤として別途実装   | TASK-4-x   |
| カスタムツール実装           | ツール拡張として別途実装 | TASK-5-x   |
| MCPサーバー統合              | MCP対応として別途実装    | TASK-6-x   |

---

## 前提条件

| 前提条件                        | 確認方法                                       |
| ------------------------------- | ---------------------------------------------- |
| TASK-2A（SkillScanner）完了     | SkillScanner クラスが利用可能                  |
| TASK-2C（セキュリティ）完了     | セキュリティ関数が利用可能                     |
| Claude Agent SDK インストール済 | package.json に @anthropic-ai/claude-agent-sdk |
| Electron IPC 基盤構築済         | contextBridge が設定済み                       |

---

## 技術的制約

| 制約           | 内容                                  |
| -------------- | ------------------------------------- |
| 実行環境       | Electron Main Process                 |
| SDK バージョン | @anthropic-ai/claude-agent-sdk ^0.2.5 |
| TypeScript     | 厳密モード（strict: true）            |
| 同時実行数     | 最大 5 クエリ                         |
| タイムアウト   | デフォルト 30 秒                      |

---

## 成果物一覧

| 種別          | 成果物                                                            | ステータス |
| ------------- | ----------------------------------------------------------------- | ---------- |
| ソースコード  | `apps/desktop/src/main/services/skill/SkillExecutor.ts`           | 未作成     |
| 型定義        | `packages/shared/src/types/skill-execution.ts`                    | 未作成     |
| IPCハンドラー | `apps/desktop/src/main/services/skill/skill-execution-handler.ts` | 未作成     |
| Preload API   | `apps/desktop/src/preload/skillExecutionApi.ts`                   | 未作成     |
| テスト        | `__tests__/SkillExecutor.test.ts`                                 | 未作成     |
| 統合テスト    | `__tests__/SkillExecutor.integration.test.ts`                     | 未作成     |

---

## リスクと対策

| リスク             | 影響度 | 対策                                     |
| ------------------ | ------ | ---------------------------------------- |
| SDK API 変更       | 高     | バージョン固定、型定義で差分吸収         |
| ストリーミング遅延 | 中     | バッファリング最適化                     |
| メモリリーク       | 高     | AbortController での適切なクリーンアップ |
| 同時実行数超過     | 中     | キュー制御、エラーハンドリング           |

---

## 変更履歴

| バージョン | 日付       | 変更内容 |
| ---------- | ---------- | -------- |
| 1.0.0      | 2026-01-24 | 初版作成 |
