---
description: |
  新しいワークフロー機能のExecutor実装を作成する専門コマンド。

  src/features/[workflow-name]/executor.ts を生成し、
  IWorkflowExecutor インターフェースに準拠したビジネスロジックを実装します。

  🤖 起動エージェント:
  - `.claude/agents/logic-dev.md`: ビジネスロジック実装専門エージェント（Phase 2で起動）

  📚 利用可能スキル（タスクに応じてlogic-devエージェントが必要時に参照）:
  **Phase 1（テスト作成時）:** tdd-red-green-refactor（TDD Red-Green-Refactorサイクル）
  **Phase 2（実装時）:** transaction-script（トランザクションスクリプトパターン）, clean-code-practices（Clean Codeプラクティス）
  **Phase 3（リファクタリング時）:** refactoring-techniques（リファクタリング技法）, test-doubles（テストダブル選択）

  ⚙️ このコマンドの設定:
  - argument-hint: オプション引数1つ（ワークフロー名、未指定時はインタラクティブ）
  - allowed-tools: エージェント起動と最小限のファイル操作用
    • Task: logic-devエージェント起動用
    • Read: 既存パターン参照、スキーマ確認用
    • Write(src/features/**): executor.ts生成用（パス制限）
    • Grep: 既存実装パターン検索用
  - model: sonnet（標準的な実装タスク）

  トリガーキーワード: executor, workflow, ビジネスロジック, 機能実装
argument-hint: "[workflow-name]"
allowed-tools:
  - Task
  - Read
  - Write(src/features/**)
  - Grep
model: opus
---

# Executor実装コマンド

このコマンドは、新しいワークフロー機能のExecutor実装を作成します。

## 実行フロー

### Phase 1: ワークフロー名の確認

ワークフロー名が引数として提供されていない場合、ユーザーに確認します。

**確認事項**:
- ワークフロー名（例: youtube-summarize, meeting-transcribe）
- 機能の目的と処理内容
- 入出力スキーマの存在確認

### Phase 2: logic-dev エージェント起動

`.claude/agents/logic-dev.md` エージェントを起動し、executor.tsの実装を依頼します。

**エージェントへの依頼内容**:
```
`.claude/agents/logic-dev.md` エージェントを起動し、以下のワークフローのExecutor実装を作成してください:

- ワークフロー名: $1 または{ユーザー入力}
- 成果物パス: src/features/$1/executor.ts
- テストパス: src/features/$1/__tests__/executor.test.ts

**要件**:
1. IWorkflowExecutor インターフェースを実装
2. TDD（Red-Green-Refactor）サイクルに従う
3. 入出力は src/features/$1/schema.ts の定義に準拠
4. 共通インフラ（AI、DB）は @/shared/infrastructure/ から import
5. エラーハンドリングとログ出力を実装

**参照**:
- アーキテクチャ設計: docs/00-requirements/master_system_design.md
- 機能仕様: docs/20-specifications/features/$1.md（存在する場合）
- 既存パターン: src/features/*/executor.ts

タスクに応じて以下のスキルを参照してください:
- TDD実践: .claude/skills/tdd-red-green-refactor/SKILL.md
- パターン選択: .claude/skills/transaction-script/SKILL.md
- コード品質: .claude/skills/clean-code-practices/SKILL.md
- リファクタリング: .claude/skills/refactoring-techniques/SKILL.md
```

### Phase 3: 成果物の確認

logic-dev エージェントの完了後、成果物を確認します:

**確認項目**:
- [ ] executor.ts が生成されている
- [ ] IWorkflowExecutor を実装している
- [ ] テストファイルが作成されている
- [ ] テストがパスしている

**完了メッセージ**:
```
✅ Executor実装が完了しました

📁 成果物:
- src/features/{workflow-name}/executor.ts
- src/features/{workflow-name}/__tests__/executor.test.ts

📝 次のステップ:
- /ai:test-executor {workflow-name} でテスト実行
- /ai:review-code src/features/{workflow-name} でコードレビュー
```

## エラーハンドリング

### ワークフロー名未指定
→ ユーザーに入力を促す

### スキーマファイル未存在
→ /ai:create-schema コマンドを提案

### 既存executor.ts存在
→ 上書き確認または新しいワークフロー名を提案

## 関連コマンド

- `/ai:create-schema [workflow-name]`: 入出力スキーマ作成
- `/ai:test-executor [workflow-name]`: Executorのテスト実行
- `/ai:review-code [path]`: コードレビュー
