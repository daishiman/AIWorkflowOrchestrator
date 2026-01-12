# Phase 12: ドキュメント更新

## メタ情報

| 項目       | 値                 |
| ---------- | ------------------ |
| Phase      | 12                 |
| 機能名     | agent-execution-ui |
| 作成日     | 2026-01-12         |
| ステータス | 未実施             |

## 目的

実装内容を反映したドキュメント・コメントを整備する。

## 実行タスク

- **コードコメント**: JSDoc/TSDocの追加・更新
- **API仕様書**: IPC通信・型定義のドキュメント化
- **コンポーネント仕様**: Storybookまたは仕様書の更新
- **システム仕様更新**: aiworkflow-requirements仕様書の更新

## 参照資料

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料            | パス                                                                        | 内容           |
| ------------------- | --------------------------------------------------------------------------- | -------------- |
| Agent SDK仕様       | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk.md` | 更新対象仕様書 |
| UI/UXコンポーネント | `.claude/skills/aiworkflow-requirements/references/ui-ux-components.md`     | 更新対象仕様書 |

### 前Phase成果物

| 資料           | パス                                     | 説明           |
| -------------- | ---------------------------------------- | -------------- |
| 手動テスト結果 | `outputs/phase-11/manual-test-result.md` | Phase 11成果物 |

## 実行手順

### ステップ1: コードコメント整備

**型定義のJSDoc**

```typescript
// packages/shared/src/types/agent.ts

/**
 * エージェント実行のステータス
 * @description エージェントの実行状態を表す
 */
export type AgentExecutionStatus =
  | "idle" // 待機中
  | "executing" // 実行中
  | "streaming" // ストリーミング中
  | "awaiting_permission" // 権限待ち
  | "completed" // 完了
  | "cancelled" // キャンセル済
  | "error"; // エラー

/**
 * エージェントメッセージ
 * @description チャットインターフェースに表示されるメッセージ
 */
export interface AgentMessage {
  /** メッセージの一意識別子 */
  id: string;
  /** メッセージの送信者ロール */
  role: "user" | "assistant" | "system";
  /** メッセージ内容 */
  content: string;
  /** メッセージ送信日時 */
  timestamp: Date;
  /** ストリーミング中かどうか */
  isStreaming?: boolean;
}

/**
 * 権限リクエスト
 * @description ツール使用の権限確認リクエスト
 */
export interface PermissionRequest {
  /** 実行ID */
  executionId: string;
  /** リクエストID */
  requestId: string;
  /** ツール名 */
  toolName: string;
  /** ツール引数 */
  args: Record<string, unknown>;
  /** リクエスト理由 */
  reason?: string;
}
```

**コンポーネントのJSDoc**

````typescript
// apps/desktop/src/renderer/views/AgentExecutionView/index.tsx

/**
 * AgentExecutionView
 * @description エージェント実行のメインビューコンポーネント
 *
 * @example
 * ```tsx
 * <AgentExecutionView skillId="skill-001" />
 * ```
 *
 * @features
 * - チャットインターフェース
 * - ストリーミング出力表示
 * - 権限確認ダイアログ
 * - 実行制御（キャンセル・クリア）
 */
export const AgentExecutionView: React.FC<Props> = (props) => {
  // ...
};
````

### ステップ2: API仕様書更新

**IPCチャンネル仕様の追加**

```markdown
## Agent Execution IPC Channels

### agent:start

エージェント実行を開始する

**Request:**
| フィールド | 型 | 説明 |
| ---------- | ------ | -------------- |
| skillId | string | 実行スキルID |
| prompt | string | ユーザープロンプト |

**Response:**
| フィールド | 型 | 説明 |
| ----------- | ------ | -------- |
| executionId | string | 実行ID |

### agent:stream

ストリーミング出力を受信する

**Payload:**
| フィールド | 型 | 説明 |
| ----------- | ------ | -------------- |
| executionId | string | 実行ID |
| content | string | 出力コンテンツ |
| delta | string | 差分コンテンツ |
```

### ステップ3: コンポーネント仕様書

```markdown
## AgentExecutionView コンポーネント

### 概要

エージェント実行のメインビューコンポーネント

### Props

| Prop    | 型     | 必須 | 説明         |
| ------- | ------ | ---- | ------------ |
| skillId | string | Yes  | 実行スキルID |

### 状態管理

Zustand agentSliceを使用

### 子コンポーネント

- AgentChatInterface
- AgentMessageInput
- AgentExecutionControls
- PermissionDialog
```

### ステップ4: システム仕様更新

`.claude/skills/aiworkflow-requirements/references/` 配下の関連仕様書を更新:

1. `interfaces-agent-sdk.md` に以下を追加:
   - AgentExecutionStatus型定義
   - AgentMessage型定義
   - PermissionRequest/Response型定義
   - IPCチャンネル定義

2. `ui-ux-components.md` に以下を追加:
   - AgentExecutionViewコンポーネント仕様
   - PermissionDialogコンポーネント仕様

## 統合テスト連携【必須】

ドキュメント化による統合テスト支援:

| ドキュメント       | 統合テスト観点への寄与 |
| ------------------ | ---------------------- |
| IPCチャンネル仕様  | テストケース設計の基準 |
| 型定義仕様         | モックデータ設計の基準 |
| コンポーネント仕様 | UIテスト設計の基準     |

## 成果物

| 成果物             | パス                                          | 説明             |
| ------------------ | --------------------------------------------- | ---------------- |
| コードコメント     | `apps/desktop/src/renderer/**/*.{ts,tsx}`     | JSDoc追加        |
| API仕様書          | `outputs/phase-12/api-specification.md`       | IPC仕様          |
| コンポーネント仕様 | `outputs/phase-12/component-specification.md` | UI仕様           |
| 仕様書更新差分     | `outputs/phase-12/specification-updates.md`   | 更新内容サマリー |

## ドキュメント更新テンプレート

```markdown
# ドキュメント更新記録

## 更新日: {{DATE}}

## 更新内容

### 1. コードコメント

| ファイル | 追加/更新 | 内容 |
| -------- | --------- | ---- |
| -        | -         | -    |

### 2. API仕様書

| セクション | 追加/更新 | 内容 |
| ---------- | --------- | ---- |
| -          | -         | -    |

### 3. システム仕様書

| 仕様書 | セクション | 変更内容 |
| ------ | ---------- | -------- |
| -      | -          | -        |

## レビュー状況

- [ ] コードコメントレビュー完了
- [ ] API仕様書レビュー完了
- [ ] システム仕様書レビュー完了
```

## 完了条件

- [ ] 新規型定義にJSDoc/TSDocが追加されている
- [ ] 新規コンポーネントにJSDoc/TSDocが追加されている
- [ ] IPCチャンネル仕様が文書化されている
- [ ] コンポーネント仕様が文書化されている
- [ ] システム仕様書（aiworkflow-requirements）が更新されている
- [ ] **本Phase内の全タスクを100%実行完了**

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. 参照資料の確認（現行仕様書）
2. 型定義へのJSDoc追加
3. コンポーネントへのJSDoc追加
4. API仕様書の作成
5. コンポーネント仕様書の作成
6. interfaces-agent-sdk.mdの更新
7. ui-ux-components.mdの更新
8. 仕様書更新差分の記録
9. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐにcompletedに更新すること。

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.mjs docs/30-workflows/agent-execution-ui --phase 12
```

## 次のPhase

Phase 13: PR作成
