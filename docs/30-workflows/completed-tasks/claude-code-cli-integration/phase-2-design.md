# Phase 2: 設計

## メタ情報

| 項目   | 値                          |
| ------ | --------------------------- |
| Phase  | 2                           |
| 機能名 | claude-code-cli-integration |
| 作成日 | 2026-01-16                  |

## 目的

Phase 1で定義した要件を実現可能なアーキテクチャ・詳細設計に落とし込む。

## 実行タスク

### タスク1: アーキテクチャ設計

**目的**: システム全体構造を設計する

**手順**:

1. 既存Agent SDK統合のアーキテクチャを参照（`interfaces-agent-sdk.md`）
2. CLI統合用のコンポーネント構成を設計
3. Main Process / Renderer Process の責務分離を明確化
4. 依存関係・データフローを図示

**アーキテクチャ図（設計対象）**:

```
┌─────────────────────────────────────────────────────┐
│                   Renderer Process                   │
│  ┌─────────────────────────────────────────────────┐ │
│  │                   React UI                       │ │
│  │          window.claudeCliAPI.execute()           │ │
│  └──────────────────────┬──────────────────────────┘ │
└─────────────────────────┼───────────────────────────┘
                          │ IPC (contextBridge)
┌─────────────────────────┼───────────────────────────┐
│                   Main Process                       │
│  ┌──────────────────────┴──────────────────────────┐ │
│  │              IPC Handler (cli-handler)           │ │
│  └──────────────────────┬──────────────────────────┘ │
│  ┌──────────────────────┴──────────────────────────┐ │
│  │           CLI Process Manager                    │ │
│  │         (child_process spawn/管理)               │ │
│  └──────────────────────┬──────────────────────────┘ │
│  ┌──────────────────────┴──────────────────────────┐ │
│  │              Skill Executor                      │ │
│  │        (スキル実行・出力パース)                  │ │
│  └──────────────────────┬──────────────────────────┘ │
│  ┌──────────────────────┴──────────────────────────┐ │
│  │              Session Manager                     │ │
│  │        (セッション管理・クリーンアップ)          │ │
│  └──────────────────────────────────────────────────┘ │
└─────────────────────────┼───────────────────────────┘
                          │ child_process
┌─────────────────────────┴───────────────────────────┐
│                   Claude Code CLI                    │
│              (外部プロセス: claude)                  │
└─────────────────────────────────────────────────────┘
```

**期待される成果物**:

- アーキテクチャ設計書
- コンポーネント図
- データフロー図

### タスク2: IPC API設計

**目的**: Main-Renderer間のIPC通信プロトコルを設計する

**手順**:

1. 既存IPC API設計パターンを参照（`api-endpoints.md`）
2. セキュリティ要件を確認（`security-api-electron.md`）
3. IPCチャンネル設計（invoke/stream）
4. リクエスト/レスポンス型定義
5. エラーハンドリング設計

**IPC チャンネル（設計対象）**:

| チャンネル                   | 方向            | 説明               |
| ---------------------------- | --------------- | ------------------ |
| `claude-cli:check`           | Renderer → Main | CLI存在確認        |
| `claude-cli:list-skills`     | Renderer → Main | スキル一覧取得     |
| `claude-cli:execute`         | Renderer → Main | スキル実行開始     |
| `claude-cli:abort`           | Renderer → Main | 実行中断           |
| `claude-cli:stream`          | Main → Renderer | ストリーミング出力 |
| `claude-cli:complete`        | Main → Renderer | 実行完了通知       |
| `claude-cli:error`           | Main → Renderer | エラー通知         |
| `claude-cli:session:list`    | Renderer → Main | セッション一覧     |
| `claude-cli:session:destroy` | Renderer → Main | セッション破棄     |

**期待される成果物**:

- IPC API仕様書
- チャンネル定義
- セキュリティ要件確認チェックリスト

### タスク3: 型定義設計

**目的**: TypeScript型定義を設計する

**手順**:

1. 既存Agent SDK型定義を参照（`interfaces-agent-sdk.md`のAgent型）
2. CLI統合用の型定義を設計
3. Zodスキーマの設計
4. エラー型の設計

**主要型定義（設計対象）**:

```typescript
// CLI実行リクエスト
interface CliExecuteRequest {
  skillPath: string; // スキルパス（例: "task-specification-creator"）
  prompt: string; // 実行プロンプト
  args?: string[]; // 追加引数
  timeout?: number; // タイムアウト（ms）
  sessionId?: string; // セッションID（継続実行用）
}

// CLI実行レスポンス
interface CliExecuteResponse {
  sessionId: string;
  status: CliExecutionStatus;
}

// CLI実行ステータス
type CliExecutionStatus =
  | "idle"
  | "starting"
  | "executing"
  | "streaming"
  | "completed"
  | "error"
  | "aborted";

// ストリーミングメッセージ
interface CliStreamMessage {
  sessionId: string;
  type: "stdout" | "stderr" | "progress";
  content: string;
  timestamp: number;
}

// スキル情報
interface CliSkillInfo {
  name: string;
  path: string;
  description: string;
  triggers: string[];
}
```

**期待される成果物**:

- 型定義設計書
- Zodスキーマ定義

## 参照資料

| 資料名          | パス                                                                        | 説明          |
| --------------- | --------------------------------------------------------------------------- | ------------- |
| 要件定義書      | `outputs/phase-1/requirements-definition.md`                                | Phase 1成果物 |
| CLI調査レポート | `outputs/phase-1/cli-investigation-report.md`                               | Phase 1成果物 |
| Agent SDK仕様   | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk.md` | 既存API設計   |

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料                  | パス                                                                         | 内容                              |
| ------------------------- | ---------------------------------------------------------------------------- | --------------------------------- |
| Agent SDKインターフェース | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk.md`  | 既存Agent API設計（参考パターン） |
| APIエンドポイント         | `.claude/skills/aiworkflow-requirements/references/api-endpoints.md`         | IPC API設計パターン               |
| Electronセキュリティ      | `.claude/skills/aiworkflow-requirements/references/security-api-electron.md` | IPC通信セキュリティ要件           |
| アーキテクチャパターン    | `.claude/skills/aiworkflow-requirements/references/architecture-patterns.md` | Zustand Slice/サービスパターン    |

## 統合テスト連携【必須】

統合ポイント/契約（IPC API・スキーマ）を設計に反映する:

| 統合ポイント       | 契約定義                                                |
| ------------------ | ------------------------------------------------------- |
| Renderer → Main    | `CliExecuteRequest` / `CliExecuteResponse`              |
| Main → Renderer    | `CliStreamMessage` / `CliCompletionMessage`             |
| Main → CLI Process | `child_process.spawn()` / `stdin` / `stdout` / `stderr` |
| CLI → Skill        | スキルパス、プロンプト、引数                            |

## 成果物

| 成果物             | パス                                       | 説明             |
| ------------------ | ------------------------------------------ | ---------------- |
| アーキテクチャ設計 | `outputs/phase-2/architecture-design.md`   | システム構造     |
| IPC API仕様        | `outputs/phase-2/ipc-api-specification.md` | IPC通信設計      |
| 型定義設計         | `outputs/phase-2/type-definitions.md`      | TypeScript型設計 |
| シーケンス図       | `outputs/phase-2/sequence-diagrams.md`     | 処理フロー       |

## 完了条件

- [ ] アーキテクチャ設計書が完成している
- [ ] IPC通信プロトコルが設計されている
- [ ] TypeScript型定義が設計されている
- [ ] Zodスキーマが設計されている
- [ ] エラー型が設計されている
- [ ] 既存Agent SDK設計との整合性が確認されている
- [ ] セキュリティ要件が反映されている
- [ ] 統合ポイント/契約が設計に反映されている
- [ ] **本Phase内の全タスクを100%実行完了**

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. 既存Agent SDKアーキテクチャの確認
2. CLI統合アーキテクチャ設計
3. IPC APIチャンネル設計
4. リクエスト/レスポンス型設計
5. Zodスキーマ設計
6. エラー型設計
7. セキュリティ要件確認
8. 統合テスト連携（契約定義）の反映
9. 成果物の作成・配置
10. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐにcompletedに更新すること。

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.mjs docs/30-workflows/claude-code-cli-integration --phase 2
```

## 次のPhase

Phase 3: 設計レビューゲート
