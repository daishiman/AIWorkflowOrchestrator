# スコープ定義書 - slide-agent-sdk-integration

## メタ情報

| 項目       | 内容                                     |
| ---------- | ---------------------------------------- |
| タスクID   | task-imp-slide-agent-sdk-integration-001 |
| Phase      | 1                                        |
| 作成日     | 2026-01-17                               |
| ステータス | 完了                                     |

---

## 概要

本ドキュメントは、slide-agent-sdk-integrationタスクの実装スコープを明確に定義し、スコープ内外を明記する。

---

## スコープ内（In Scope）

### 1. skill-executor.tsへのClaude Agent SDK統合

| 項目     | 内容                                            |
| -------- | ----------------------------------------------- |
| ファイル | `apps/desktop/src/main/slide/skill-executor.ts` |
| 変更範囲 | 87-102行目のシミュレーション実装                |
| 変更内容 | シミュレーション→実SDK呼び出しへの置換          |
| 影響範囲 | execute()メソッド内部のみ                       |

**具体的な変更**:

- `await executeWithAgentSDK(skillName, projectPath, abortController.signal)` の実装
- Agent SDKからのレスポンス処理
- 進捗コールバックのSDKイベント連携

### 2. agent-client.tsへの実SDK API呼び出し実装

| 項目     | 内容                                          |
| -------- | --------------------------------------------- |
| ファイル | `apps/desktop/src/main/slide/agent-client.ts` |
| 変更範囲 | executeAgentQuery()関数（174-239行目）        |
| 変更内容 | シミュレーション→実API呼び出しへの置換        |
| 依存追加 | @anthropic-ai/claude-agent-sdk                |

**具体的な変更**:

- Claude Agent SDKクライアントの初期化
- 実際のAPI呼び出し実装
- ストリーミング応答の処理
- メッセージリスナーへの通知

### 3. projectPathパラメータの活用

| 項目 | 内容                                                  |
| ---- | ----------------------------------------------------- |
| 対象 | skill-executor.ts, agent-client.ts                    |
| 実装 | systemPromptまたはコンテキストへのprojectPath埋め込み |
| 用途 | スキル実行時のプロジェクトコンテキスト提供            |

### 4. スキルフェーズとAgent SDKスキル名のマッピング

| 項目 | 内容                                          |
| ---- | --------------------------------------------- |
| 対象 | getSkillName()関数（skill-executor.ts:29-37） |
| 実装 | 既存のマッピングを維持（変更なし）            |
| 検証 | 全フェーズでの動作確認                        |

**マッピング表**:
| Phase | Skill Name |
| ----- | ---------- |
| hearing | hearing-facilitator |
| structure | structure-designer |
| html | html-generator |
| modifier | slide-modifier |

### 5. エラーハンドリングの実装

| 項目     | 内容                                    |
| -------- | --------------------------------------- |
| 対象     | agent-client.ts, skill-executor.ts      |
| 実装     | タイムアウト、中断、API障害の適切な処理 |
| エラー型 | AgentError階層の活用                    |

**対応するエラー**:

- `AgentQueryError` - API呼び出し失敗
- `AgentTimeoutError` - 30秒タイムアウト
- `AgentAbortedError` - ユーザーによるキャンセル

### 6. 統合テストの追加

| 項目           | 内容                                     |
| -------------- | ---------------------------------------- |
| 対象ファイル   | `apps/desktop/src/main/slide/__tests__/` |
| テスト種別     | ユニットテスト、統合テスト               |
| カバレッジ目標 | Line 80%、Branch 60%、Function 80%       |

**テストファイル**:

- `skill-executor.test.ts` - skill-executor.ts用
- `agent-client.test.ts` - agent-client.ts用
- `sdk-integration.test.ts` - 統合テスト

---

## スコープ外（Out of Scope）

### 1. Agent SDK自体の開発・修正

| 項目 | 理由                                   |
| ---- | -------------------------------------- |
| 対象 | @anthropic-ai/claude-agent-sdk         |
| 理由 | 外部パッケージであり、本タスクの範囲外 |
| 代替 | SDK のバージョンアップは別タスクで対応 |

### 2. 新しいスキルフェーズの追加

| 項目 | 理由                                           |
| ---- | ---------------------------------------------- |
| 対象 | hearing/structure/html/modifier 以外のフェーズ |
| 理由 | 既存フェーズの統合が目的                       |
| 代替 | 新フェーズは別タスクで追加                     |

### 3. UIコンポーネントの変更

| 項目 | 理由                                           |
| ---- | ---------------------------------------------- |
| 対象 | SyncStatusIndicator等のUIコンポーネント        |
| 理由 | 既存UIで対応可能                               |
| 影響 | 進捗表示・エラー表示は既存コンポーネントで対応 |

### 4. 他のSlide関連モジュールの変更

| 項目 | 理由                             |
| ---- | -------------------------------- |
| 対象 | file-watcher.ts, sync-manager.ts |
| 理由 | SDK統合に直接関係しない          |
| 状態 | これらのモジュールは既に実装完了 |

### 5. リトライロジックの実装

| 項目         | 理由                                   |
| ------------ | -------------------------------------- |
| 対象         | API呼び出し失敗時の自動リトライ        |
| 理由         | 複雑性を避け、シンプルな実装を優先     |
| 代替         | 将来タスクとして記録                   |
| 将来タスクID | task-imp-agent-retry-logic-001（予定） |

### 6. 認証UIの実装

| 項目 | 理由                                       |
| ---- | ------------------------------------------ |
| 対象 | APIキー入力画面、認証フロー                |
| 理由 | 既存の認証機構を使用                       |
| 前提 | APIキーはsafeStorageに事前に保存されている |

### 7. オフラインモードの実装

| 項目 | 理由                                 |
| ---- | ------------------------------------ |
| 対象 | ネットワーク未接続時のフォールバック |
| 理由 | 本タスクのスコープを超える           |
| 代替 | エラーメッセージで通知のみ           |

---

## 前提条件

### 技術的前提

| 項目 | 前提内容                                                 |
| ---- | -------------------------------------------------------- |
| SDK  | @anthropic-ai/claude-agent-sdk ^0.2.5 がインストール可能 |
| 認証 | APIキーがsafeStorageに事前保存されている                 |
| 環境 | Electron Main Processでの実行                            |
| 依存 | packages/sharedにSDK依存が宣言されている                 |

### 機能的前提

| 項目        | 前提内容                                    |
| ----------- | ------------------------------------------- |
| FileWatcher | chokidarベースのファイル監視が動作している  |
| SyncManager | 双方向同期ロジックが実装済み                |
| IPC         | slide:\* チャンネルが定義済み               |
| UI          | SyncStatusIndicatorコンポーネントが実装済み |

---

## 制約事項

### 技術的制約

| 制約         | 内容                             |
| ------------ | -------------------------------- |
| タイムアウト | 30秒（設定変更不可、本タスク内） |
| 同時実行     | 1スキルのみ（排他制御済み）      |
| プロセス     | Main Processでのみ実行           |

### ビジネス制約

| 制約       | 内容                                         |
| ---------- | -------------------------------------------- |
| 後方互換性 | 既存の戻り値型（SkillExecutionResult）を維持 |
| 既存テスト | 既存テストが引き続きパスすること             |

---

## 依存関係

### 内部依存

| 依存元            | 依存先               | 説明                                       |
| ----------------- | -------------------- | ------------------------------------------ |
| skill-executor.ts | agent-client.ts      | Agent API呼び出し                          |
| skill-executor.ts | @repo/shared         | 型定義（SkillPhase, SkillExecutionResult） |
| agent-client.ts   | Electron safeStorage | APIキー取得                                |

### 外部依存

| パッケージ                     | バージョン | 説明             |
| ------------------------------ | ---------- | ---------------- |
| @anthropic-ai/claude-agent-sdk | ^0.2.5     | Claude Agent SDK |

### 依存の追加先

| パッケージ                     | 追加先 package.json          |
| ------------------------------ | ---------------------------- |
| @anthropic-ai/claude-agent-sdk | packages/shared/package.json |
| @anthropic-ai/claude-agent-sdk | apps/desktop/package.json    |

---

## 成果物サマリー

### ドキュメント成果物

| 成果物       | パス                                       | Phase |
| ------------ | ------------------------------------------ | ----- |
| 要件定義書   | outputs/phase-1/requirements-definition.md | 1     |
| 受け入れ基準 | outputs/phase-1/acceptance-criteria.md     | 1     |
| スコープ定義 | outputs/phase-1/scope-definition.md        | 1     |

### コード成果物（Phase 5）

| 成果物                | パス                                          |
| --------------------- | --------------------------------------------- |
| skill-executor.ts更新 | apps/desktop/src/main/slide/skill-executor.ts |
| agent-client.ts更新   | apps/desktop/src/main/slide/agent-client.ts   |

### テスト成果物（Phase 4, 6）

| 成果物                  | パス                                                          |
| ----------------------- | ------------------------------------------------------------- |
| skill-executor.test.ts  | apps/desktop/src/main/slide/**tests**/skill-executor.test.ts  |
| agent-client.test.ts    | apps/desktop/src/main/slide/**tests**/agent-client.test.ts    |
| sdk-integration.test.ts | apps/desktop/src/main/slide/**tests**/sdk-integration.test.ts |

---

## 将来タスク（記録）

本タスクのスコープ外で識別された将来タスク:

| ID（予定）                         | タスク名                  | 説明                                 |
| ---------------------------------- | ------------------------- | ------------------------------------ |
| task-imp-agent-retry-logic-001     | Agent SDKリトライロジック | API失敗時の自動リトライ実装          |
| task-imp-agent-offline-mode-001    | オフラインモード          | ネットワーク未接続時のフォールバック |
| task-imp-agent-batch-execution-001 | バッチ実行                | 複数スキルの連続実行最適化           |

---

## 次のステップ

Phase 2: 設計 - 本スコープに基づいたアーキテクチャ設計・API設計を実施

---

**作成日**: 2026-01-17
**Phase 1 タスク3 完了**
