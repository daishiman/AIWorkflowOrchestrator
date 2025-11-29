---
description: |
  コード品質、保守性、ベストプラクティスへの準拠を改善するためのリファクタリングを実行します。
  テストを通じて機能性を維持しながらリファクタリング技法を適用します。

  🤖 起動エージェント:
  - `.claude/agents/logic-dev.md` (メイン - リファクタリング実装)
  - `.claude/agents/arch-police.md` (補助 - アーキテクチャ検証)

  📚 利用可能スキル (フェーズ別):
  - Phase 1 (分析): `.claude/skills/code-smell-detection/SKILL.md`, `.claude/skills/clean-code-practices/SKILL.md`
  - Phase 2 (実装): `.claude/skills/refactoring-techniques/SKILL.md`
  - Phase 3 (検証): `.claude/skills/clean-code-practices/SKILL.md`

  ⚙️ このコマンドの設定:
  - model: sonnet (コード変更タスク)
  - allowed-tools: Task, Read, Edit, MultiEdit, Bash(npm test*|pnpm test*)

  トリガーキーワード: refactor, improve, clean code, リファクタリング, 改善, コード整理
argument-hint: "<target-file>"
allowed-tools: ["Task", "Read", "Edit", "MultiEdit", "Bash"]
model: sonnet
---

# コードリファクタリング

## 目的

機能性を維持しながら、コード品質、可読性、保守性を改善するための体系的なリファクタリングを適用します。

## Phase 1: 分析

1. @logic-dev エージェントをリファクタリングコンテキストで起動
2. `.claude/skills/code-smell-detection/SKILL.md` を参照して問題特定を行う
3. `.claude/skills/clean-code-practices/SKILL.md` を参照して品質基準を確認
4. 引数解析: `$1` でターゲットファイルパスを取得（必須）
5. @logic-dev エージェントから現在の状態を分析:
   - Code Smellsを特定（長いメソッド、重複コード、複雑な条件分岐）
   - SOLID原則違反を検出
   - テストカバレッジの可用性を評価
6. @arch-police エージェントにアーキテクチャ上の懸念を相談

## Phase 2: 実装

1. `.claude/skills/refactoring-techniques/SKILL.md` を参照して技法選択を行う
2. @logic-dev エージェントにリファクタリング実行を委譲:
   - 適切な技法を適用（Extract Method、Replace Conditional with Polymorphism等）
   - 単一責任原則を維持
   - 命名の明確性を改善
   - 複雑度とネストを削減
3. Edit/MultiEditを使用してコード変換を実行
4. 各リファクタリングステップ後にテストを実行: `pnpm test` または `npm test`
5. テストが失敗した場合はロールバック、テストが通るまで反復

## Phase 3: 検証

1. `.claude/skills/clean-code-practices/SKILL.md` を参照して品質チェックリストを確認
2. @arch-police エージェントで検証:
   - アーキテクチャの整合性が維持されているか
   - デザインパターンが正しく適用されているか
   - 新しい技術的負債が導入されていないか
3. @logic-dev エージェントから最終検証:
   - すべてのテストが通過しているか
   - コード複雑度が削減されているか
   - 可読性が改善されているか
4. リファクタリングサマリーを生成:
   - 適用された技法
   - メトリクスの改善（リファクタリング前/後の複雑度）
   - テストカバレッジ状況

**期待される成果物**: 品質メトリクスが改善され、テストが通過したリファクタリング済みコード
