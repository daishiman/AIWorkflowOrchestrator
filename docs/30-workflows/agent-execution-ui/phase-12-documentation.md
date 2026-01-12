# Phase 12: ドキュメント更新

## メタ情報

| 項目       | 値                 |
| ---------- | ------------------ |
| Phase      | 12                 |
| 機能名     | agent-execution-ui |
| 作成日     | 2026-01-12         |
| ステータス | 未実施             |

## 目的

実装した内容をシステム要件ドキュメントに反映し、技術的な理解を促進するドキュメントを作成し、未完了タスクを検出・記録する。

## 実行タスク

- **実装ガイド作成**: 概念的説明 + 技術的詳細の2パート構成ドキュメント作成
- **システムドキュメント更新**: aiworkflow-requirements等の更新
- **未タスク検出**: 残課題の検出と記録

## サブフェーズ

### Phase 12-1: 実装ガイド作成【必須】

**2パート構成**の実装ガイドを作成する:

| パート | 対象読者         | 内容                                  |
| ------ | ---------------- | ------------------------------------- |
| Part 1 | 初学者・非技術者 | 概念的な説明（中学生でもわかる版）    |
| Part 2 | 開発者・技術者   | 技術的な詳細（スキーマ・API・使用例） |

**テンプレート**: `.claude/skills/task-specification-creator/assets/implementation-guide-template.md`

### Phase 12-2: システムドキュメント更新

- 更新対象: `docs/00-requirements/` 配下
- 更新対象: `.claude/skills/aiworkflow-requirements/references/`
- 更新原則: 概要のみ記載、Single Source of Truth遵守

### Phase 12-3: 未タスク検出【必須】

| #   | ソース                 | 確認項目                      |
| --- | ---------------------- | ----------------------------- |
| 1   | Phase 3レビュー結果    | MINOR判定の指摘事項           |
| 2   | Phase 10レビュー結果   | MINOR判定の指摘事項           |
| 3   | Phase 11手動テスト結果 | スコープ外の発見事項          |
| 4   | 各Phase成果物          | 「将来対応」「TODO」「FIXME」 |
| 5   | コードベース           | TODO/FIXME/HACK/XXXコメント   |

**検索コマンド例**:

```bash
grep -rn "TODO\|FIXME\|HACK\|XXX" apps/desktop/src/renderer/views/AgentExecutionView/
grep -r "将来対応\|TODO\|FIXME" outputs/
```

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

| 成果物               | パス                                           | 必須 | 説明                      |
| -------------------- | ---------------------------------------------- | ---- | ------------------------- |
| 実装ガイド           | `outputs/phase-12/implementation-guide.md`     | ✅   | 概念的+技術的ドキュメント |
| ドキュメント更新履歴 | `outputs/phase-12/documentation-update-log.md` | ✅   | 更新履歴                  |
| 未タスク検出レポート | `outputs/phase-12/unassigned-task-report.md`   | ✅   | 検出結果（なしでも出力）  |
| 未完了タスク指示書   | `docs/30-workflows/unassigned-task/*.md`       | 条件 | 検出時のみ作成            |
| コードコメント       | `apps/desktop/src/renderer/**/*.{ts,tsx}`      | ✅   | JSDoc追加                 |

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

- [ ] **実装ガイドが作成されている**（Part 1: 概念的 + Part 2: 技術的）
- [ ] 新規型定義にJSDoc/TSDocが追加されている
- [ ] 新規コンポーネントにJSDoc/TSDocが追加されている
- [ ] IPCチャンネル仕様が文書化されている
- [ ] コンポーネント仕様が文書化されている
- [ ] システム仕様書（aiworkflow-requirements）が更新されている
- [ ] **未タスク検出レポートが作成されている**（検出結果なしでも作成）
- [ ] **本Phase内の全タスクを100%実行完了**

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. 参照資料の確認（現行仕様書）
2. **実装ガイド作成（Part 1: 概念的 + Part 2: 技術的）**
3. 型定義へのJSDoc追加
4. コンポーネントへのJSDoc追加
5. API仕様書の作成
6. コンポーネント仕様書の作成
7. interfaces-agent-sdk.mdの更新
8. ui-ux-components.mdの更新
9. **未タスク検出の実施**
10. **未タスク検出レポートの作成**
11. 仕様書更新差分の記録
12. 完了条件の検証

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
