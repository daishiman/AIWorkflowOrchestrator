---
description: |
  AIプロンプトの最適化を行う専門コマンド。

  Riley Goodsideのプロンプトエンジニアリング手法に基づき、Chain-of-Thought推論、
  Few-Shot Learning、構造化出力設計、ハルシネーション対策を適用してプロンプトの
  精度とパフォーマンスを最大化します。

  🤖 起動エージェント:
  - `.claude/agents/prompt-eng.md`: プロンプトエンジニアリング専門エージェント

  📚 利用可能スキル（タスクに応じてprompt-engエージェントが必要時に参照）:
  **基礎スキル:** prompt-engineering-for-agents（プロンプト設計基本原則）
  **構造化出力:** structured-output-design（JSON Schema、Function Calling、Zod）
  **品質保証:** hallucination-prevention（3層防御モデル、Temperature調整）
  **学習パターン:** few-shot-learning-patterns（例示設計）、chain-of-thought-reasoning（段階的推論）
  **テスト:** prompt-testing-evaluation（評価メトリクス、A/Bテスト）
  **最適化:** context-optimization（トークン効率化）
  **運用:** prompt-versioning-management（バージョン管理、デプロイ）

  ⚙️ このコマンドの設定:
  - argument-hint: オプション引数1つ（プロンプトファイルパス、未指定時は対話形式）
  - allowed-tools: エージェント起動と最小限の確認用
    • Task: prompt-engエージェント起動用
    • Read: 既存プロンプトファイル参照確認用
    • Edit: プロンプトファイル編集用
    • Grep: プロンプトパターン検索用
  - model: opus（高度なプロンプト最適化タスクのため）

  トリガーキーワード: prompt, AI, optimization, hallucination, few-shot, chain-of-thought
argument-hint: "[prompt-file]"
allowed-tools:
   - Task
   - Read
   - Edit
   - Grep
model: opus
---

# AIプロンプト最適化コマンド

## 目的

既存のAIプロンプトを分析し、以下の観点から最適化を行います:

- **推論最適化**: Chain-of-Thought、Tree-of-Thought、Self-Consistencyなどの推論パターン
- **出力品質制御**: 構造化出力、スキーマ定義、検証メカニズム
- **ハルシネーション対策**: 3層防御モデル（プロンプト、パラメータ、検証）
- **パフォーマンス最適化**: トークン効率、コンテキストウィンドウ管理、レイテンシ削減

## 使用方法

### 基本的な使用（対話形式）

```bash
/ai:optimize-prompts
```

対話形式でプロンプト最適化の要件をヒアリングします。

### ファイル指定

```bash
/ai:optimize-prompts path/to/prompt.md
```

既存のプロンプトファイルを指定して最適化を実行します。

## 実行フロー

### Phase 1: 起動準備

**prompt-eng エージェントを起動**:

```
@.claude/agents/prompt-eng.md を起動し、以下を依頼:

1. プロンプトファイルが指定されている場合:
   - 既存プロンプトの読み込みと分析
   - 問題点の特定（精度、ハルシネーション、形式）

2. プロンプトファイルが未指定の場合:
   - インタラクティブに要件をヒアリング
   - プロンプトの目的と期待出力の理解
```

### Phase 2: 最適化実行

**prompt-eng エージェントが以下を実行**:

1. **要件分析**（prompt-engineering-for-agents スキル参照）
   - タスクの目的と期待出力の理解
   - 入力形式と出力形式の決定
   - 品質要件（精度、一貫性）の定義

2. **設計と実装**（タスクに応じたスキル参照）
   - 役割定義と制約の設計
   - Few-Shot例示の作成（few-shot-learning-patterns）
   - 出力スキーマの定義（structured-output-design）
   - CoT誘導の追加（chain-of-thought-reasoning）

3. **品質保証**
   - ハルシネーション対策の適用（hallucination-prevention）
   - テストケースの作成と実行（prompt-testing-evaluation）
   - 評価メトリクスの測定

### Phase 3: 成果物

**prompt-eng エージェントが以下を提供**:

- 最適化されたプロンプト定義
- 改善前後の比較分析
- 評価メトリクスとテスト結果
- バージョン管理用のchangelog（prompt-versioning-management）

## 期待される成果物

```
最適化されたプロンプトファイル:
- プロンプト本体（役割定義、制約、Few-Shot例示、出力スキーマ）
- 評価レポート（改善効果の測定結果）
- テストケース（品質保証用）
- changlogログ（変更履歴）
```

## 注意事項

- **詳細な実装**: すべての最適化ロジックは prompt-eng エージェントと各スキルが実行
- **コマンドの役割**: エージェント起動と要件の受け渡しのみ
- **パラメータ調整**: Temperature、Top-pなどのパラメータ推奨値も提供
- **A/Bテスト**: 可能な場合は改善前後の比較テストを実施

## 関連コマンド

- `/ai:implement`: AI機能の実装時にプロンプトを統合
- `/ai:test`: プロンプトの品質テストを実行
