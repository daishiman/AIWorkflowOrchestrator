# Claude Agent SDK統合 - スコープ定義

## 1. 実装範囲（In Scope）

### 1.1 コア機能

| 機能             | 説明                    | 実装ファイル        |
| ---------------- | ----------------------- | ------------------- |
| AgentExecutor    | SDK query() APIラッパー | AgentExecutor.ts    |
| ExecutionManager | 複数実行管理            | ExecutionManager.ts |
| HooksFactory     | Hooks生成・IPC連携      | HooksFactory.ts     |
| PermissionRules  | 宣言的権限ルール        | PermissionRules.ts  |

### 1.2 IPCハンドラー

| ハンドラー          | チャネル             | 説明     |
| ------------------- | -------------------- | -------- |
| handleStart         | agent:start          | 実行開始 |
| handleStop          | agent:stop           | 実行停止 |
| handlePermissionRes | agent:permission:res | 権限応答 |

### 1.3 型定義

| 型名               | 説明                     |
| ------------------ | ------------------------ |
| AgentStreamMessage | ストリーミングメッセージ |
| AgentStatusMessage | ステータス通知           |
| AgentStartRequest  | 実行開始リクエスト       |
| PermissionRequest  | 権限確認リクエスト       |
| PermissionResponse | 権限確認応答             |
| ExecutionState     | 実行状態                 |

### 1.4 Hooks実装

| Hook              | 実装内容                 |
| ----------------- | ------------------------ |
| PreToolUse        | 危険コマンドブロック     |
| PostToolUse       | ロギング・ステータス更新 |
| PermissionRequest | UI確認フロー             |

### 1.5 Permission Rules

| ルール種別 | 対象                               |
| ---------- | ---------------------------------- |
| deny       | 危険コマンド、システムディレクトリ |
| allow      | プロジェクト内Read                 |
| ask        | Write、Edit                        |

---

## 2. 実装範囲外（Out of Scope）

### 2.1 本タスクで実装しないもの

| 項目                 | 理由                         | 代替・将来対応         |
| -------------------- | ---------------------------- | ---------------------- |
| カスタム実行環境     | AGENT-006/007で実装          | 別タスクで対応         |
| MCP統合              | 別機能として分離             | 将来タスクで対応       |
| サブエージェント管理 | 複雑度が高い                 | 将来タスクで対応       |
| セッション永続化     | 初期版ではスコープ外         | 将来タスクで対応       |
| 実行履歴DB保存       | 既存History機能と統合が必要  | 別タスクで対応         |
| Permission Dialog UI | AGENT-004で実装済み/実装予定 | 連携のみ本タスクで実装 |
| エージェント実行UI   | AGENT-004で実装              | 本タスクは並行開発     |

### 2.2 依存タスクとの境界

```
本タスク（AGENT-005）の責務:
├── SDK統合レイヤー（Main Process）
├── IPCハンドラー
├── Hooksシステム
└── Permission Control

AGENT-004の責務:
├── エージェント実行UI（Renderer Process）
├── Permission Dialog表示
├── 実行状態表示
└── ストリーミング出力表示
```

---

## 3. 技術的境界

### 3.1 レイヤー境界

```
┌─────────────────────────────────────────────┐
│            Renderer Process                  │
│  (AGENT-004の責務 - 本タスク範囲外)          │
├─────────────────────────────────────────────┤
│                IPC Layer                     │
│        (本タスク: ハンドラー実装)            │
├─────────────────────────────────────────────┤
│            Main Process                      │
│  ┌─────────────────────────────────────────┐│
│  │     AgentExecutor (本タスク)            ││
│  │     ExecutionManager (本タスク)         ││
│  │     HooksFactory (本タスク)             ││
│  │     PermissionRules (本タスク)          ││
│  └─────────────────────────────────────────┘│
├─────────────────────────────────────────────┤
│         @anthropic-ai/claude-agent-sdk       │
│              (外部依存)                      │
└─────────────────────────────────────────────┘
```

### 3.2 依存境界

| 依存先           | 依存内容       | 境界                  |
| ---------------- | -------------- | --------------------- |
| claude-agent-sdk | query() API    | パッケージAPI使用のみ |
| SkillService     | スキル情報取得 | 既存APIを呼び出すのみ |
| electron-store   | 設定永続化     | 既存パターンに従う    |
| agentHandlers    | IPC登録        | 既存ファイルを拡張    |

---

## 4. 成果物一覧

### 4.1 新規作成ファイル

| ファイル                                                   | 種別   | 説明           |
| ---------------------------------------------------------- | ------ | -------------- |
| `apps/desktop/src/main/services/agent/AgentExecutor.ts`    | 機能   | SDK統合クラス  |
| `apps/desktop/src/main/services/agent/ExecutionManager.ts` | 機能   | 実行管理クラス |
| `apps/desktop/src/main/services/agent/HooksFactory.ts`     | 機能   | Hooks生成      |
| `apps/desktop/src/main/services/agent/PermissionRules.ts`  | 機能   | 権限ルール     |
| `apps/desktop/src/main/services/agent/index.ts`            | 機能   | エクスポート   |
| `apps/desktop/src/main/services/agent/*.test.ts`           | テスト | ユニットテスト |

### 4.2 更新ファイル

| ファイル                                     | 更新内容       |
| -------------------------------------------- | -------------- |
| `packages/shared/src/types/agent.ts`         | 型定義追加     |
| `apps/desktop/src/main/ipc/agentHandlers.ts` | ハンドラー追加 |
| `apps/desktop/src/preload/channels.ts`       | チャネル追加   |

### 4.3 ドキュメント成果物

| ドキュメント                               | 説明            |
| ------------------------------------------ | --------------- |
| `outputs/phase-12/implementation-guide.md` | 実装ガイド      |
| `outputs/phase-12/api-reference.md`        | APIリファレンス |

---

## 5. 品質基準

### 5.1 テストカバレッジ

| 指標              | 最低基準 | 推奨基準 |
| ----------------- | -------- | -------- |
| Line Coverage     | 80%      | 90%      |
| Branch Coverage   | 60%      | 70%      |
| Function Coverage | 80%      | 90%      |

### 5.2 コード品質

| 項目       | 基準             |
| ---------- | ---------------- |
| TypeScript | 型エラーなし     |
| ESLint     | エラーなし       |
| Prettier   | フォーマット済み |

### 5.3 セキュリティ

| 項目                     | 基準             |
| ------------------------ | ---------------- |
| 危険コマンドブロック     | PreToolUseで検証 |
| システムディレクトリ保護 | denyルールで設定 |
| AbortSignalチェック      | Hooks内で検証    |

---

## 6. 制約事項

### 6.1 技術的制約

1. **Claude Code依存**: ユーザーのマシンにClaude Codeがインストールされ、認証済みである必要がある
2. **Main Process実行**: SDK呼び出しはMain Processでのみ行う（Renderer Processでは不可）
3. **nodeIntegration: false**: セキュリティ設定を維持
4. **contextIsolation: true**: preloadスクリプト分離を維持

### 6.2 運用制約

1. **サブスクリプション**: ユーザーが有効なClaude Codeサブスクリプションを持っている必要がある
2. **ネットワーク**: インターネット接続が必要
3. **並行実行**: 最大実行数に制限を設ける（推奨: 5実行まで）

---

## 7. リスク

| リスク                     | 影響度 | 発生確率 | 対策                             |
| -------------------------- | ------ | -------- | -------------------------------- |
| Claude Code未認証          | 高     | 中       | 起動時チェック、ガイド表示       |
| Permission応答タイムアウト | 中     | 中       | デフォルト拒否、タイムアウト設定 |
| ストリーミング途切れ       | 中     | 低       | エラーハンドリング               |
| AbortSignal伝播漏れ        | 中     | 低       | 定期チェック実装                 |

---

作成日: 2026-01-12
Phase: 1
ステータス: 完了
