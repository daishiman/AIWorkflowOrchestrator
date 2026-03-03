# エージェント機能 - タスク一覧とインデックス

```yaml
issue_number: 959
```

## 概要

Claude CodeのClaude Agent SDKを使用したエージェント機能をアプリケーションに統合するためのタスク群。

## 機能概要

- サイドバーに「エージェント」メニューを追加
- `.claude/skills/`配下のスキルを一覧表示し、必要なスキルを選択的にインポート
- インポートしたスキルを管理・検索・フィルタリング
- **Claude Agent SDK（`@anthropic-ai/claude-agent-sdk`）** を使用してスキルを実行
  - ユーザーのClaude Codeサブスクリプションを自動利用
  - Hooksシステムによる危険なコマンドのブロック
  - Permission Controlによる宣言的権限ルール
  - Permission Dialogによるユーザー承認フロー
- エージェントとのチャット形式対話とストリーミング出力表示
- HTMLプレビュー等のカスタム実行環境で成果物をリアルタイム確認

## タスク一覧

| #   | タスクID  | タスク名                       | 規模   | 優先度 |
| --- | --------- | ------------------------------ | ------ | ------ |
| 01  | AGENT-001 | エージェントダッシュボード基盤 | 中規模 | 高     |
| 02  | AGENT-002 | スキル管理UI                   | 中規模 | 高     |
| 03  | AGENT-003 | スキル管理バックエンド         | 中規模 | 高     |
| 04  | AGENT-004 | エージェント実行UI             | 大規模 | 高     |
| 05  | AGENT-005 | Claude Agent SDK統合           | 大規模 | 高     |
| 06  | AGENT-006 | カスタム実行環境UI             | 大規模 | 中     |
| 07  | AGENT-007 | 実行環境管理バックエンド       | 中規模 | 中     |

## 依存関係マップ

```
レイヤー1（起点）
└── task-agent-01-dashboard-foundation.md (AGENT-001)
    │
    │
レイヤー2（01完了後、並行実行可能）
├── task-agent-02-skill-management-ui.md (AGENT-002)
│
└── task-agent-03-skill-management-backend.md (AGENT-003) ※02と並行可能
    │
    │
レイヤー3（02,03完了後、並行実行可能）
├── task-agent-04-execution-ui.md (AGENT-004)
│
└── task-agent-05-claude-code-integration.md (AGENT-005) ※04と並行可能
    │
    │
レイヤー4（04,05完了後、並行実行可能）
├── task-agent-06-custom-environment-ui.md (AGENT-006)
│
└── task-agent-07-environment-backend.md (AGENT-007) ※06と並行可能
```

## 並行実行グループ

効率的に実装を進めるため、以下のグループで並行実行が可能です。

### グループA（基盤）

| タスク    | 依存 | 並行可能 |
| --------- | ---- | -------- |
| AGENT-001 | なし | -        |

### グループB（スキル管理）

| タスク    | 依存      | 並行可能        |
| --------- | --------- | --------------- |
| AGENT-002 | AGENT-001 | AGENT-003と並行 |
| AGENT-003 | AGENT-001 | AGENT-002と並行 |

### グループC（エージェント実行）

| タスク    | 依存                 | 並行可能        |
| --------- | -------------------- | --------------- |
| AGENT-004 | AGENT-002, AGENT-003 | AGENT-005と並行 |
| AGENT-005 | AGENT-003            | AGENT-004と並行 |

### グループD（カスタム環境）

| タスク    | 依存                 | 並行可能        |
| --------- | -------------------- | --------------- |
| AGENT-006 | AGENT-004, AGENT-005 | AGENT-007と並行 |
| AGENT-007 | AGENT-005            | AGENT-006と並行 |

## 推奨実行順序

```
Week 1:  AGENT-001
Week 2:  AGENT-002 ║ AGENT-003 （並行）
Week 3:  AGENT-004 ║ AGENT-005 （並行）
Week 4:  AGENT-006 ║ AGENT-007 （並行）
```

## ファイル一覧

| ファイル名                                  | 内容                           |
| ------------------------------------------- | ------------------------------ |
| `task-agent-00-index.md`                    | 本インデックス                 |
| `task-agent-01-dashboard-foundation.md`     | エージェントダッシュボード基盤 |
| `task-agent-02-skill-management-ui.md`      | スキル管理UI                   |
| `task-agent-03-skill-management-backend.md` | スキル管理バックエンド         |
| `task-agent-04-execution-ui.md`             | エージェント実行UI             |
| `task-agent-05-claude-code-integration.md`  | Claude Agent SDK統合           |
| `task-agent-06-custom-environment-ui.md`    | カスタム実行環境UI             |
| `task-agent-07-environment-backend.md`      | 実行環境管理バックエンド       |

## 成果物サマリー

### フロントエンド（Renderer Process）

| コンポーネント         | タスク     | パス                                           |
| ---------------------- | ---------- | ---------------------------------------------- |
| AgentView              | 01         | `views/AgentView/`                             |
| agentSlice             | 01, 03, 04 | `store/slices/agentSlice.ts`                   |
| SkillImportDialog      | 02         | `components/organisms/SkillImportDialog/`      |
| SkillList              | 02         | `components/organisms/SkillList/`              |
| SkillCard              | 02         | `components/molecules/SkillCard/`              |
| SkillDetailPanel       | 02         | `components/organisms/SkillDetailPanel/`       |
| AgentChatInterface     | 04         | `components/organisms/AgentChatInterface/`     |
| AgentMessageInput      | 04         | `components/molecules/AgentMessageInput/`      |
| PermissionDialog       | 04         | `components/organisms/PermissionDialog/`       |
| SplitLayout            | 06         | `components/organisms/SplitLayout/`            |
| HTMLPreviewEnvironment | 06         | `components/organisms/HTMLPreviewEnvironment/` |

### バックエンド（Main Process）

| サービス              | タスク | パス                                       |
| --------------------- | ------ | ------------------------------------------ |
| SkillScanner          | 03     | `services/skill/SkillScanner.ts`           |
| SkillParser           | 03     | `services/skill/SkillParser.ts`            |
| SkillImportManager    | 03     | `services/skill/SkillImportManager.ts`     |
| SkillService          | 03     | `services/skill/SkillService.ts`           |
| AgentExecutor         | 05     | `services/agent/AgentExecutor.ts`          |
| ExecutionManager      | 05     | `services/agent/ExecutionManager.ts`       |
| HooksFactory          | 05     | `services/agent/HooksFactory.ts`           |
| PermissionRulesConfig | 05     | `services/agent/PermissionRules.ts`        |
| ContentExtractor      | 07     | `services/environment/ContentExtractor.ts` |
| ContentSanitizer      | 07     | `services/environment/ContentSanitizer.ts` |

### 共有型定義

| 型                    | タスク | パス                                 |
| --------------------- | ------ | ------------------------------------ |
| Skill                 | 02, 03 | `packages/shared/src/types/agent.ts` |
| AgentMessage          | 04     | `packages/shared/src/types/agent.ts` |
| PermissionRequest     | 04, 05 | `packages/shared/src/types/agent.ts` |
| PermissionResponse    | 04, 05 | `packages/shared/src/types/agent.ts` |
| AgentExecutionRequest | 05     | `packages/shared/src/types/agent.ts` |
| AgentStreamMessage    | 05     | `packages/shared/src/types/agent.ts` |
| AgentExecutionStatus  | 04, 05 | `packages/shared/src/types/agent.ts` |
| PermissionRules       | 05     | `packages/shared/src/types/agent.ts` |
| PreviewContent        | 06, 07 | `packages/shared/src/types/agent.ts` |

## IPCチャネル一覧

### スキル管理（AGENT-003）

| チャネル                      | 方向   | 説明                         |
| ----------------------------- | ------ | ---------------------------- |
| `agent:scan-available-skills` | invoke | 利用可能スキル一覧取得       |
| `agent:get-imported-skills`   | invoke | インポート済みスキル一覧取得 |
| `agent:import-skills`         | invoke | スキルインポート             |
| `agent:remove-skill`          | invoke | スキル削除                   |
| `agent:get-skill-detail`      | invoke | スキル詳細取得               |

### エージェント実行（AGENT-004, AGENT-005）

| チャネル               | 方向            | 説明                           |
| ---------------------- | --------------- | ------------------------------ |
| `agent:start`          | Renderer → Main | SDK query() API実行開始        |
| `agent:stop`           | Renderer → Main | 実行停止（AbortSignal）        |
| `agent:stop-all`       | Renderer → Main | 全実行停止                     |
| `agent:stream`         | Main → Renderer | SDKメッセージストリーム        |
| `agent:status`         | Main → Renderer | 実行状態変更通知               |
| `agent:permission`     | Main → Renderer | 権限確認要求（ダイアログ表示） |
| `agent:permission:res` | Renderer → Main | 権限確認応答（許可/拒否）      |

### カスタム環境（AGENT-007）

| チャネル                    | 方向   | 説明                     |
| --------------------------- | ------ | ------------------------ |
| `agent:extract-content`     | invoke | コンテンツ抽出           |
| `agent:get-preview-content` | invoke | プレビューコンテンツ取得 |

## 開始方法

1. `task-agent-01-dashboard-foundation.md`を読み、Phase 1から開始
2. `/ai:task-specification-creator`スキルを使用してワークフローを管理
3. Phase完了ごとに`artifacts.json`を更新
4. 並行実行可能なタスクは複数開発者で分担可能

## 関連ドキュメント

- `.claude/skills/skill-list.md` - 既存スキル一覧
- `.claude/skills/claude-agent-sdk/` - Claude Agent SDKスキル（SDK統合参照）
  - `references/query-api.md` - query() API
  - `references/hooks-system.md` - Hooksシステム
  - `references/permission-control.md` - Permission Control
  - `references/electron-ipc.md` - Electron IPC統合
- `apps/desktop/src/renderer/store/` - Zustand store構造
- `apps/desktop/src/main/ipc/` - IPC実装パターン
- `apps/desktop/src/preload/channels.ts` - チャネル定義
