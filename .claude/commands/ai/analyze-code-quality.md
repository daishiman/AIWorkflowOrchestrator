---
description: |
  メトリクス、複雑度、Code Smellsを含む包括的なコード品質分析を実行します。
  アクション可能な推奨事項を含む詳細な品質レポートを生成します。

  🤖 起動エージェント:
  - `.claude/agents/code-quality.md` (メイン)

  📚 利用可能スキル (フェーズ別):
  - Phase 1 (準備): `.claude/skills/static-analysis/SKILL.md`
  - Phase 2 (実行): `.claude/skills/code-smell-detection/SKILL.md`, `.claude/skills/code-style-guides/SKILL.md`
  - Phase 3 (レポート): `.claude/skills/static-analysis/SKILL.md`

  ⚙️ このコマンドの設定:
  - model: sonnet (深層分析対応)
  - allowed-tools: Task, Grep, Glob, Bash, Write(docs/quality-reports/**)

  トリガーキーワード: code quality, analyze, metrics, complexity, 品質分析, メトリクス, 複雑度
argument-hint: "[directory]"
allowed-tools:
  - Task
  - Grep
  - Glob
  - Bash
  - Write"
model: sonnet
---

# 包括的コード品質分析

## 目的

深層コード品質分析を実行し、メトリクス、複雑度の問題、Code Smells、保守性の懸念を特定します。

## Phase 1: 準備

1. `.claude/agents/code-quality.md` エージェントを分析コンテキストで起動
2. `.claude/skills/static-analysis/SKILL.md` を参照して分析フレームワークを確認
3. 引数解析: `$1` でターゲットディレクトリを取得（デフォルト: `src/`）
4. Globパターンを使用してファイルスコープを特定

## Phase 2: 実行

1. `.claude/skills/code-smell-detection/SKILL.md` を参照して検出パターンを確認
2. `.claude/skills/code-style-guides/SKILL.md` を参照してスタイル準拠を確認
3. `.claude/agents/code-quality.md` エージェントに多次元分析を委譲:
   - 循環的複雑度メトリクス
   - コード重複検出
   - Code Smells特定（長いメソッド、God Class等）
   - スタイルガイド準拠度
   - 保守性インデックス計算
4. Grepを使用してパターンベースの問題検出
5. Bashを使用して追加ツール実行（例: eslint --format json、複雑度レポーター）

## Phase 3: 検証とレポート生成

1. `.claude/skills/static-analysis/SKILL.md` を参照してレポート構造を確認
2. `.claude/agents/code-quality.md` エージェントから分析結果を集約
3. `docs/quality-reports/quality-analysis-[timestamp].md` に包括的レポート生成:
   - エグゼクティブサマリー（総合品質スコア）
   - ファイル/モジュール別の複雑度メトリクス
   - トップ10 Code Smells（位置情報付き）
   - 影響度で優先順位付けされたリファクタリング推奨事項
   - トレンド分析（履歴データがある場合）
4. 即座の対応が必要な重要問題をハイライト

**期待される成果物**: 優先順位付けされたアクション項目を含む詳細な品質メトリクスレポート
