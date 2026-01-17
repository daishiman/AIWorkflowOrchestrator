# 要件定義書 - slide-agent-sdk-integration

## メタ情報

| 項目       | 内容                                     |
| ---------- | ---------------------------------------- |
| タスクID   | task-imp-slide-agent-sdk-integration-001 |
| Phase      | 1                                        |
| 作成日     | 2026-01-17                               |
| ステータス | 完了                                     |

---

## 概要

本ドキュメントは、skill-executor.tsおよびagent-client.tsにClaude Agent SDKを統合するために必要な機能要件および非機能要件を定義する。

---

## 背景分析

### 現状の実装状態

| ファイル                                        | 現状                                | TODOコメント位置 |
| ----------------------------------------------- | ----------------------------------- | ---------------- |
| `apps/desktop/src/main/slide/skill-executor.ts` | シミュレーション実装（1秒後に応答） | 87-89行目        |
| `apps/desktop/src/main/slide/agent-client.ts`   | シミュレーション実装（1秒後に応答） | 192行目          |

### 現状のシミュレーション実装

**skill-executor.ts（87-89行目）**:

```typescript
// TODO: Claude Agent SDK統合後に実装
// 現在はシミュレーション
// const result = await executeWithAgentSDK(skillName, projectPath, abortController.signal);
```

**agent-client.ts（192行目）**:

```typescript
// TODO: Agent SDK統合後に実際のAPI呼び出しを実装
```

### 参照仕様

- **interfaces-agent-sdk.md**: Claude Agent SDK統合インターフェース仕様
- **アーキテクチャ**: Renderer → IPC → Main Process → Agent SDK → Anthropic Cloud

---

## 機能要件（FR: Functional Requirements）

### FR-01: skill-executor.tsがClaude Agent SDKを呼び出してスキルを実行できる

| 項目         | 内容                                                                                                |
| ------------ | --------------------------------------------------------------------------------------------------- |
| 説明         | skill-executor.ts内のexecute()メソッドがClaude Agent SDKのqueryメソッドを呼び出してスキルを実行する |
| 関連ファイル | `apps/desktop/src/main/slide/skill-executor.ts`                                                     |
| 変更箇所     | 87-102行目のシミュレーション実装を実SDK呼び出しに置換                                               |
| 優先度       | 高                                                                                                  |

### FR-02: agent-client.tsが実際のAgent SDK API呼び出しを行う

| 項目         | 内容                                                                                                       |
| ------------ | ---------------------------------------------------------------------------------------------------------- |
| 説明         | executeAgentQuery()関数が実際のClaude Agent SDK（@anthropic-ai/claude-agent-sdk）を使用してHTTPS通信を行う |
| 関連ファイル | `apps/desktop/src/main/slide/agent-client.ts`                                                              |
| 変更箇所     | 192-237行目のシミュレーション実装を実API呼び出しに置換                                                     |
| 優先度       | 高                                                                                                         |

### FR-03: スキルフェーズマッピング

| 項目       | 内容                                                                                                     |
| ---------- | -------------------------------------------------------------------------------------------------------- |
| 説明       | 各スキルフェーズ（hearing/structure/html/modifier）がAgent SDKスキル名に正しくマッピングされて実行される |
| マッピング | hearing→hearing-facilitator, structure→structure-designer, html→html-generator, modifier→slide-modifier  |
| 関連コード | getSkillName()関数（skill-executor.ts:29-37）                                                            |
| 優先度     | 高                                                                                                       |

### FR-04: projectPathパラメータのコンテキスト渡し

| 項目   | 内容                                                                 |
| ------ | -------------------------------------------------------------------- |
| 説明   | projectPathパラメータをAgent SDKリクエストのコンテキストとして渡せる |
| 用途   | スキル実行時にプロジェクトディレクトリを認識させる                   |
| 優先度 | 中                                                                   |

### FR-05: 進捗コールバックによるUI反映

| 項目       | 内容                                                                                       |
| ---------- | ------------------------------------------------------------------------------------------ |
| 説明       | スキル実行中に進捗（0%, 25%, 50%, 100%）がSyncStatusIndicator UIコンポーネントに反映される |
| 関連コード | emitProgress()関数、onProgress()メソッド                                                   |
| IPC        | slide:sync-progress                                                                        |
| 優先度     | 中                                                                                         |

### FR-06: AbortControllerによるキャンセル機能

| 項目       | 内容                                                                        |
| ---------- | --------------------------------------------------------------------------- |
| 説明       | cancel()呼び出しでAbortController.abortが発火し、実行中のクエリが中断される |
| 関連コード | cancel()メソッド（skill-executor.ts:146-151）                               |
| 優先度     | 高                                                                          |

### FR-07: ModifierSkill動作

| 項目   | 内容                                                                             |
| ------ | -------------------------------------------------------------------------------- |
| 説明   | HTML変更検知時にModifierSkillが実行され、structure.mdが更新される（逆同期機能）  |
| フロー | FileWatcher→SyncManager→SkillExecutor→ModifierSkill→AgentClient→Claude Agent SDK |
| 優先度 | 高                                                                               |

---

## 非機能要件（NFR: Non-Functional Requirements）

### NFR-01: 30秒タイムアウト処理

| 項目     | 内容                                                                                                   |
| -------- | ------------------------------------------------------------------------------------------------------ |
| 説明     | SDK呼び出しは30秒（DEFAULT_TIMEOUT=30000ms）以内に完了すること。超過時はタイムアウトエラーを発生させる |
| 関連定数 | DEFAULT_TIMEOUT（interfaces-agent-sdk.md）                                                             |
| 実装     | AbortController + setTimeout組み合わせ                                                                 |
| 優先度   | 高                                                                                                     |

### NFR-02: APIキーのsafeStorage暗号化保存

| 項目         | 内容                                                         |
| ------------ | ------------------------------------------------------------ |
| 説明         | Claude API keyはElectron safeStorageで暗号化されて保存される |
| 参照         | interfaces-agent-sdk.md「safeStorage認証」                   |
| セキュリティ | 平文でのAPIキー保存禁止                                      |
| 優先度       | 高                                                           |

### NFR-03: エラーメッセージ表示

| 項目       | 内容                                                      |
| ---------- | --------------------------------------------------------- |
| 説明       | SDK呼び出し失敗時に、適切なエラーメッセージをUIに表示する |
| エラー種別 | AgentQueryError, AgentTimeoutError, AgentAbortedError     |
| IPC        | slide:sync-error                                          |
| 優先度     | 中                                                        |

### NFR-04: メモリリーク防止

| 項目   | 内容                                                     |
| ------ | -------------------------------------------------------- |
| 説明   | 繰り返しスキル実行後もメモリ使用量が増加し続けない       |
| 対策   | AbortController、リスナー、Promiseの適切なクリーンアップ |
| 検証   | 100回連続実行でメモリ増加5%以下                          |
| 優先度 | 中                                                       |

---

## SDK接続要件（統合テスト連携）

### API接続

| 項目       | 内容                                    |
| ---------- | --------------------------------------- |
| プロトコル | HTTPS                                   |
| 認証       | APIキー（safeStorageから取得）          |
| SDK        | @anthropic-ai/claude-agent-sdk ^0.2.5   |
| 依存宣言   | packages/shared/package.json に追加必須 |

### タイムアウト

| 項目       | 内容                         |
| ---------- | ---------------------------- |
| デフォルト | 30000ms                      |
| 最大       | 300000ms（5分）              |
| 制御       | AbortController + setTimeout |

### エラー処理

| 項目     | 内容                                                   |
| -------- | ------------------------------------------------------ |
| リトライ | なし（スコープ外）                                     |
| エラー型 | AgentError階層（AgentQueryError, AgentTimeoutError等） |
| ログ     | エラー詳細をコンソールに出力                           |

---

## トレーサビリティマトリクス

| 要件ID | 関連ファイル                       | 関連テスト（予定）      |
| ------ | ---------------------------------- | ----------------------- |
| FR-01  | skill-executor.ts                  | skill-executor.test.ts  |
| FR-02  | agent-client.ts                    | agent-client.test.ts    |
| FR-03  | skill-executor.ts                  | skill-executor.test.ts  |
| FR-04  | skill-executor.ts, agent-client.ts | sdk-integration.test.ts |
| FR-05  | skill-executor.ts                  | skill-executor.test.ts  |
| FR-06  | skill-executor.ts, agent-client.ts | skill-executor.test.ts  |
| FR-07  | skill-executor.ts, agent-client.ts | sdk-integration.test.ts |
| NFR-01 | agent-client.ts                    | agent-client.test.ts    |
| NFR-02 | agent-client.ts                    | 手動テスト（Phase 11）  |
| NFR-03 | agent-client.ts                    | agent-client.test.ts    |
| NFR-04 | skill-executor.ts, agent-client.ts | パフォーマンステスト    |

---

## 次のステップ

Phase 2: 設計 - 本要件に基づいたアーキテクチャ設計・API設計を実施

---

**作成日**: 2026-01-17
**Phase 1 タスク1 完了**
