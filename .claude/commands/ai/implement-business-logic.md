---
description: |
  ビジネスロジック実装専門コマンド。
  マーティン・ファウラーの思想に基づき、可読性が高くテスト容易なExecutorクラスを実装します。

  🤖 起動エージェント:
  - `.claude/agents/logic-dev.md`: ビジネスロジック実装専門エージェント（Phase 2で起動）

  📚 利用可能スキル（タスクに応じてlogic-devエージェントが必要時に参照）:
  **Phase 1（要件理解時）:** なし（仕様書・スキーマ参照のみ）
  **Phase 2（テスト駆動実装時）:**
    - `.claude/skills/tdd-red-green-refactor/SKILL.md`: Red-Green-Refactorサイクル
    - `.claude/skills/transaction-script/SKILL.md`: Executorパターン実装
    - `.claude/skills/test-doubles/SKILL.md`: テストダブル選択
  **Phase 3（リファクタリング時）:**
    - `.claude/skills/refactoring-techniques/SKILL.md`: コードスメル検出・改善
    - `.claude/skills/clean-code-practices/SKILL.md`: 命名・関数設計

  📋 参照仕様書:
  - `docs/00-requirements/master_system_design.md`: 第5章（ハイブリッドアーキテクチャ）、第6章（IWorkflowExecutor）、第4章（featuresディレクトリ）

  ⚙️ このコマンドの設定:
  - argument-hint: `[logic-name]` - 実装するロジック名（例: youtube-summarize, meeting-transcribe）
  - allowed-tools: エージェント起動と最小限の確認・実装用
    • Task: logic-devエージェント起動用
    • Read: 仕様書・スキーマ・既存実装参照用
    • Write(src/features/**): Executor・テストファイル生成用（パス制限）
    • Edit: 既存ファイル編集用
    • Grep, Glob: パターン検索・ファイル探索用
    • Bash(pnpm test*): テスト実行用
  - model: sonnet（標準的な実装タスク）

  トリガーキーワード: business logic, executor, implement, 実装, ビジネスロジック, TDD
argument-hint: "[logic-name]"
allowed-tools: [Task, Read, Write(src/features/**), Edit, Grep, Glob, Bash(pnpm test*)]
model: opus
---

# ビジネスロジック実装

## 目的

`$ARGUMENTS` のビジネスロジックを実装します。

## 実行フロー

### Phase 1: 準備と要件確認

1. **引数の確認**
   - `$ARGUMENTS` が指定されていない場合 → ユーザーに確認
   - 指定されている場合 → Phase 2へ

2. **関連情報の収集**
   - `docs/20-specifications/features/$ARGUMENTS.md` の確認（存在する場合）
   - `src/features/$ARGUMENTS/schema.ts` の確認（存在する場合）
   - `docs/00-requirements/master_system_design.md` 第6章（IWorkflowExecutor）の確認

### Phase 2: エージェント起動

@.claude/agents/logic-dev.md を起動し、以下を依頼:

```
対象: $ARGUMENTS

依頼内容:
1. 機能仕様の理解（docs/20-specifications/features/ または要件確認）
2. スキーマ定義の確認または作成（src/features/$ARGUMENTS/schema.ts）
3. テスト駆動実装（Red-Green-Refactor）
   - テストケース作成（__tests__/executor.test.ts）
   - 最小限の実装（executor.ts）
   - リファクタリング
4. IWorkflowExecutor インターフェース準拠の確認
5. Registry登録の確認（src/features/registry.ts）

成果物:
- src/features/$ARGUMENTS/executor.ts
- src/features/$ARGUMENTS/__tests__/executor.test.ts
- src/features/$ARGUMENTS/schema.ts（未存在の場合）

品質基準:
- テストカバレッジ: 80%以上
- 関数の長さ: 30行以下
- 循環的複雑度: 10以下
```

### Phase 3: 検証と報告

1. **テスト実行**
   ```bash
   pnpm test src/features/$ARGUMENTS/
   ```

2. **実装サマリーの報告**
   - 実装したファイル一覧
   - テスト結果
   - 適用したリファクタリング
   - 次のステップ（Registry登録、統合テスト等）

## 成果物

| ファイル | 説明 |
|---------|------|
| `src/features/$ARGUMENTS/executor.ts` | ビジネスロジック実装（IWorkflowExecutor準拠） |
| `src/features/$ARGUMENTS/__tests__/executor.test.ts` | ユニットテスト（Vitest） |
| `src/features/$ARGUMENTS/schema.ts` | 入出力スキーマ（Zod）※未存在の場合 |

## 使用例

```bash
# YouTube要約機能のExecutor実装
/ai:implement-business-logic youtube-summarize

# 議事録文字起こし機能のExecutor実装
/ai:implement-business-logic meeting-transcribe

# 新機能のExecutor実装（インタラクティブ）
/ai:implement-business-logic
```

## 関連コマンド

- `/ai:write-spec [feature-name]`: 詳細仕様書の作成（実装前に推奨）
- `/ai:design-domain-model [domain-name]`: ドメインモデル設計（複雑なロジックの場合）
- `/ai:create-tests [target]`: テスト拡充（カバレッジ向上）
