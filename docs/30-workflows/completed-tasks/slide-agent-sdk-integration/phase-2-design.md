# Phase 2: 設計 - タスク仕様書

## メタ情報

| 項目       | 内容                        |
| ---------- | --------------------------- |
| Phase      | 2                           |
| Phase名    | 設計                        |
| 前提Phase  | Phase 1                     |
| 後続Phase  | Phase 3                     |
| ステータス | 未実施                      |
| 作成日     | 2026-01-16                  |
| 機能名     | slide-agent-sdk-integration |

---

## 目的

要件を実現可能な構造に落とし込み、Claude Agent SDK統合のアーキテクチャとAPI設計を行う。

## 背景

Phase 1で定義した要件に基づき、skill-executor.tsとagent-client.tsにClaude Agent SDKを統合するための具体的な設計を行う。既存のinterfaces-agent-sdk.mdの仕様に準拠しつつ、スライド機能固有の要件に対応する設計を策定する。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: アーキテクチャ設計

**目的**: Claude Agent SDK統合のシステム構造を設計する

**実行手順**:

1. 現行アーキテクチャを確認する:

   ```
   ┌─────────────────────────────────────────────────────┐
   │                   Main Process                       │
   │  ┌─────────────────────────────────────────────────┐ │
   │  │              FileWatcher (chokidar)              │ │
   │  │          onHtmlChange / onStructureChange       │ │
   │  └──────────────────────┬──────────────────────────┘ │
   │  ┌──────────────────────┴──────────────────────────┐ │
   │  │                   SyncManager                    │ │
   │  │           forwardSync() / reverseSync()         │ │
   │  └──────────────────────┬──────────────────────────┘ │
   │  ┌──────────────────────┴──────────────────────────┐ │
   │  │                 SkillExecutor                    │ │
   │  │        execute() ← 現在シミュレーション          │ │
   │  └──────────────────────┬──────────────────────────┘ │
   │  ┌──────────────────────┴──────────────────────────┐ │
   │  │                  AgentClient                     │ │
   │  │        query() ← 現在シミュレーション            │ │
   │  └──────────────────────┬──────────────────────────┘ │
   └─────────────────────────┼───────────────────────────┘
                             │ HTTPS（統合後）
   ┌─────────────────────────┴───────────────────────────┐
   │                Claude Agent SDK                      │
   │             (Anthropic Cloud Service)               │
   └─────────────────────────────────────────────────────┘
   ```

2. SDK統合後のアーキテクチャを設計する:
   - SkillExecutor: スキルフェーズをAgent SDKスキル名にマッピング
   - AgentClient: 実際のHTTPS通信を行うクライアント
   - APIキー管理: safeStorageから取得
   - 進捗管理: ストリーミング応答から進捗を算出

3. 依存関係を整理する:
   - `@anthropic-ai/claude-agent-sdk`パッケージの追加が必要か確認
   - packages/shared への依存追加が必要か確認

**期待される成果物**:

- `outputs/phase-2/architecture-design.md` - アーキテクチャ設計書

---

### タスク2: API設計

**目的**: Agent SDK呼び出しのAPI設計を行う

**実行手順**:

1. SkillExecutor API設計:

   ```typescript
   interface SkillExecutor {
     execute(
       phase: SkillPhase,
       projectPath: string,
     ): Promise<SkillExecutionResult>;
     cancel(): void;
     onProgress(callback: (progress: number) => void): void;
     isExecuting(): boolean;
   }
   ```

2. AgentClient API設計:

   ```typescript
   interface ModifierAgentAPI {
     query(
       options: ModifierAgentQueryOptions,
     ): Promise<ModifierAgentQueryResponse>;
     abort(): void;
     getStatus(): AgentInternalStatus;
     onMessage(callback: (message: SDKMessage) => void): () => void;
   }
   ```

3. スキルフェーズマッピング設計:

   ```typescript
   const skillMap: Record<SkillPhase, string> = {
     hearing: "hearing-facilitator",
     structure: "structure-designer",
     html: "html-generator",
     modifier: "slide-modifier",
   };
   ```

4. エラーハンドリング設計:
   - タイムアウトエラー: `Error("Request timeout")`
   - 中断エラー: `Error("Aborted")`
   - SDK呼び出しエラー: `Error("SDK call failed: ...")`

5. 認証設計:
   - APIキーはsafeStorageから取得
   - 環境変数フォールバック（開発時）

**期待される成果物**:

- `outputs/phase-2/api-design.md` - API設計書

---

### タスク3: シーケンス設計

**目的**: SDK統合の処理フローを設計する

**実行手順**:

1. スキル実行シーケンスを設計する:

   ```
   User/FileWatcher → SyncManager → SkillExecutor → AgentClient → Claude SDK
        │                │              │              │            │
        │                │              │              │            │
        │ onChange       │ forwardSync  │ execute      │ query      │ HTTPS
        │────────────────>│─────────────>│─────────────>│───────────>│
        │                │              │              │            │
        │                │              │ onProgress   │ onMessage  │ stream
        │<───────────────│<─────────────│<─────────────│<───────────│
        │                │              │              │            │
   ```

2. キャンセルシーケンスを設計する:

   ```
   User → SkillExecutor → AgentClient → AbortController
    │          │              │              │
    │ cancel() │ cancel()     │ abort()      │ signal.abort
    │─────────>│─────────────>│─────────────>│
   ```

3. エラーシーケンスを設計する:
   - タイムアウト発生時のフロー
   - SDK呼び出し失敗時のフロー
   - ネットワークエラー時のフロー

**期待される成果物**:

- `outputs/phase-2/sequence-design.md` - シーケンス設計書

---

## 参照資料

| 参照資料      | パス                                                                        | 内容          |
| ------------- | --------------------------------------------------------------------------- | ------------- |
| 要件定義書    | `outputs/phase-1/requirements-definition.md`                                | Phase 1成果物 |
| 受け入れ基準  | `outputs/phase-1/acceptance-criteria.md`                                    | Phase 1成果物 |
| Agent SDK仕様 | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk.md` | SDK仕様       |

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料      | パス                                                                        | 内容                    |
| ------------- | --------------------------------------------------------------------------- | ----------------------- |
| Agent SDK仕様 | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk.md` | SDK統合インターフェース |
| Electron IPC  | `.claude/skills/aiworkflow-requirements/references/architecture-*.md`       | Main/Renderer通信       |

---

## 成果物

| 成果物         | パス                                     | 内容             |
| -------------- | ---------------------------------------- | ---------------- |
| アーキテクチャ | `outputs/phase-2/architecture-design.md` | システム構造設計 |
| API設計        | `outputs/phase-2/api-design.md`          | API仕様          |
| シーケンス設計 | `outputs/phase-2/sequence-design.md`     | 処理フロー設計   |

---

## 統合テスト連携【必須】

Agent SDK統合ポイント・APIスキーマを設計に反映する:

| 統合ポイント       | 契約定義                                           |
| ------------------ | -------------------------------------------------- |
| SkillExecutor→SDK  | execute() → AgentClient.query() → SDK HTTPS        |
| 認証               | safeStorage → APIキー取得 → SDK Authヘッダー       |
| エラーハンドリング | SDK例外 → AgentClient例外 → SkillExecutor例外 → UI |
| ストリーミング     | SDK onMessage → AgentClient callback → 進捗更新    |

---

## 完了条件

- [ ] アーキテクチャが定義されている
- [ ] API設計が完了している（SkillExecutor, AgentClient）
- [ ] シーケンス設計が完了している（正常系・異常系・キャンセル）
- [ ] 要件との整合性が確認されている
- [ ] SDK統合ポイント/契約が設計に反映されている
- [ ] **本Phase内の全タスクを100%実行完了**

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 依存関係

- **前提**: Phase 1（要件定義）が完了していること
- **後続**: Phase 3（設計レビューゲート）へ進む

---

## 次のPhase

Phase 3: 設計レビューゲート
