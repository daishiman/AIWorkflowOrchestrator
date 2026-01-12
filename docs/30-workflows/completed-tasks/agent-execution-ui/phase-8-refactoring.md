# Phase 8: リファクタリング（TDD: Refactor）

## メタ情報

| 項目       | 値                 |
| ---------- | ------------------ |
| Phase      | 8                  |
| 機能名     | agent-execution-ui |
| 作成日     | 2026-01-12         |
| ステータス | 未実施             |

## 目的

テストを維持しながらコード品質を改善する。

## 実行タスク

- **コード品質分析**: 重複コード・複雑度の特定
- **リファクタリング実施**: 抽出・統合・命名改善
- **テスト維持確認**: リファクタリング後のGreen状態維持

## 参照資料

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料            | パス                                                                        | 内容               |
| ------------------- | --------------------------------------------------------------------------- | ------------------ |
| Agent SDK仕様       | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk.md` | 型定義・命名規約   |
| UI/UXコンポーネント | `.claude/skills/aiworkflow-requirements/references/ui-ux-components.md`     | コンポーネント構成 |

### 前Phase成果物

| 資料           | パス                                 | 説明          |
| -------------- | ------------------------------------ | ------------- |
| カバレッジ結果 | `outputs/phase-7/coverage-report.md` | Phase 7成果物 |
| ゲート判定     | `outputs/phase-7/gate-result.md`     | Phase 7成果物 |

## リファクタリング観点

### 1. コード重複の排除

| 対象               | 改善内容                   | 優先度 |
| ------------------ | -------------------------- | ------ |
| IPC通信処理        | 共通ハンドラへの抽出       | 高     |
| エラーハンドリング | 統一エラー処理への集約     | 高     |
| 状態更新ロジック   | agentSliceアクションの統合 | 中     |

### 2. 複雑度の低減

| 対象               | 改善内容           | 優先度 |
| ------------------ | ------------------ | ------ |
| useAgentExecution  | カスタムフック分割 | 高     |
| PermissionDialog   | ロジック分離       | 中     |
| AgentChatInterface | レンダリング最適化 | 中     |

### 3. 命名・構造の改善

| 対象         | 改善内容           | 優先度 |
| ------------ | ------------------ | ------ |
| 変数名       | 意図の明確化       | 低     |
| ファイル構成 | 責務に基づく再編成 | 中     |
| エクスポート | index.tsの整理     | 低     |

## 実行手順

### ステップ1: コード分析

```bash
# 重複検出
pnpm dlx jscpd apps/desktop/src/renderer/views/AgentExecutionView/

# 複雑度測定
pnpm dlx complexity-report apps/desktop/src/renderer/views/AgentExecutionView/
```

### ステップ2: リファクタリング実施

**共通IPCハンドラの抽出**

```typescript
// apps/desktop/src/renderer/utils/ipc/agentIpcHandler.ts

export const createAgentIpcHandler = () => {
  // 共通のIPC通信処理
  // エラーハンドリング
  // リトライロジック
};
```

**カスタムフックの分割**

```typescript
// apps/desktop/src/renderer/views/AgentExecutionView/hooks/
// - useAgentExecution.ts（統合）
// - useAgentMessages.ts（メッセージ管理）
// - useAgentPermission.ts（Permission管理）
// - useAgentStreaming.ts（ストリーミング）
```

**コンポーネントのメモ化**

```typescript
// パフォーマンス改善
export const AgentMessage = React.memo(({ message }: Props) => {
  // メッセージ表示コンポーネント
});
```

### ステップ3: テスト再実行

```bash
# テストがGreen状態を維持していることを確認
pnpm --filter @repo/desktop test
pnpm --filter @repo/desktop test:coverage
```

## 統合テスト連携【必須】

リファクタリング後の統合テスト確認:

| 確認項目             | 確認内容                 | 結果     |
| -------------------- | ------------------------ | -------- |
| IPC通信の動作        | リファクタリング後も正常 | {{結果}} |
| ストリーミングの動作 | リファクタリング後も正常 | {{結果}} |
| Permission連携の動作 | リファクタリング後も正常 | {{結果}} |
| 状態管理の動作       | リファクタリング後も正常 | {{結果}} |

## 成果物

| 成果物               | パス                                     | 説明           |
| -------------------- | ---------------------------------------- | -------------- |
| リファクタリング記録 | `outputs/phase-8/refactoring-log.md`     | 変更内容の記録 |
| コード品質レポート   | `outputs/phase-8/code-quality-report.md` | 品質改善結果   |
| テスト結果           | `outputs/phase-8/test-result.md`         | Green状態確認  |

## リファクタリング記録テンプレート

```markdown
# リファクタリング記録

## 実施日: {{DATE}}

## 実施項目

| No  | カテゴリ | 対象 | 変更内容 | 影響ファイル |
| --- | -------- | ---- | -------- | ------------ |
| 1   | 重複排除 | -    | -        | -            |
| 2   | 複雑度   | -    | -        | -            |
| 3   | 命名     | -    | -        | -            |

## テスト結果

- [ ] 全テストがGreen状態を維持
- [ ] カバレッジが低下していない

## 品質メトリクス

| 指標         | Before | After | 変化 |
| ------------ | ------ | ----- | ---- |
| 重複コード行 | -      | -     | -    |
| 平均複雑度   | -      | -     | -    |
| ファイル数   | -      | -     | -    |
```

## 完了条件

- [ ] 重複コードが特定・排除されている
- [ ] 複雑度が許容範囲に改善されている
- [ ] 命名・構造が改善されている
- [ ] すべてのテストがGreen状態を維持
- [ ] カバレッジが低下していない
- [ ] リファクタリング記録が作成されている
- [ ] **本Phase内の全タスクを100%実行完了**

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. 参照資料の確認（Phase 7成果物）
2. コード重複の分析
3. 複雑度の分析
4. 重複コードの排除
5. 複雑度の改善
6. 命名・構造の改善
7. テスト再実行・Green確認
8. リファクタリング記録の作成
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
node .claude/skills/task-specification-creator/scripts/validate-phase-output.mjs docs/30-workflows/agent-execution-ui --phase 8
```

## 次のPhase

Phase 9: 品質保証
