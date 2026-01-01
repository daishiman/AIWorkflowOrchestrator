---
name: github-actions-expressions
description: |
  GitHub Actionsのワークフローで使用できる式構文とコンテキストオブジェクトを専門とするスキル。
  ${{ }}構文、演算子、リテラル、組み込み関数、および利用可能なすべてのコンテキスト（github, env, job, steps, runner, secrets, needs, matrix, inputs）を提供します。

  Anchors:
  • Continuous Delivery (Jez Humble) / 適用: パイプライン設計とCI/CD自動化 / 目的: 信頼性の高いワークフロー式の設計

  Trigger:
  Use when implementing conditional execution (if:), referencing step outputs, generating dynamic values, or utilizing context information (branch names, commit SHA, event types) in GitHub Actions workflows.
  Keywords: github actions, workflow, expressions, context, ${{ }}, if condition, matrix, secrets, steps output
version: 1.0.0
level: 1
last_updated: 2025-12-31
---

# GitHub Actions Expressions

## 概要

GitHub Actionsのワークフローで使用できる式構文とコンテキストオブジェクトを専門とするスキル。
${{ }}構文、演算子、リテラル、組み込み関数、および利用可能なすべてのコンテキスト（github, env, job, steps, runner, secrets, needs, matrix, inputs）を提供します。
専門分野:

詳細な手順や背景は `references/Level1_basics.md` と `references/Level2_intermediate.md` を参照してください。

## ワークフロー

### Phase 1: 要件分析とタスク起動

**目的**: ワークフロー要件を分析し、適切な式設計を行う

**タスク**: Expression Analyzer (`agents/expression-analyzer.md`)

**アクション**:

1. `references/Level1_basics.md` でスキルの基本を確認
2. ワークフロー要件を明確化（条件分岐、動的値生成、コンテキスト使用）
3. Expression Analyzer タスクを起動し、式設計仕様書を作成
   - 使用コンテキストの選択
   - 組み込み関数の選定
   - 適用パターンの特定

**成果物**: 式設計仕様書（使用コンテキスト、関数、パターン、エッジケース含む）

### Phase 2: 式の実装

**目的**: 設計された式を正確なYAML形式で実装する

**タスク**: Expression Implementer (`agents/expression-implementer.md`)

**アクション**:

1. `references/expression-syntax.md` で構文規則を確認
2. Expression Implementer タスクを起動し、式を実装
   - 設計仕様書に基づく実装
   - `assets/expression-examples.yaml` のテンプレート形式に準拠
   - 説明コメントとエッジケース対応を追加

**成果物**: 実装済みワークフロー式（YAML形式、コメント、使用例含む）

### Phase 3: 検証と記録

**目的**: 実装された式の品質を検証し、実行記録を保存する

**タスク**: Expression Validator (`agents/expression-validator.md`)

**アクション**:

1. Expression Validator タスクを起動し、検証を実施
   - `scripts/validate-expressions.mjs` で構文検証
   - `references/conditional-patterns.md` でアンチパターン確認
   - エッジケーステスト実施
2. 検証レポートを確認し、必要に応じて修正
3. `scripts/log_usage.mjs` で実行記録を保存

**成果物**: 検証レポート、修正提案、ログ記録

## Task仕様（実行直前に参照）

### Expression Analyzer

- **パス**: `agents/expression-analyzer.md`
- **役割**: ワークフロー要件を分析し、適切な式設計を行う
- **入力**: ワークフロー要件、既存ワークフローファイル（任意）
- **出力**: 式設計仕様書（コンテキスト、関数、パターン、エッジケース）
- **参照**: `references/context-objects.md`, `references/builtin-functions.md`, `references/conditional-patterns.md`

### Expression Implementer

- **パス**: `agents/expression-implementer.md`
- **役割**: 設計された式を正確なYAML形式で実装する
- **入力**: 式設計仕様書
- **出力**: 実装済みワークフロー式（YAML、コメント、使用例）
- **参照**: `references/expression-syntax.md`, `assets/expression-examples.yaml`

### Expression Validator

- **パス**: `agents/expression-validator.md`
- **役割**: 実装された式の品質を検証する
- **入力**: 実装済みワークフロー式、式設計仕様書（参照用）
- **出力**: 検証レポート（構文、ロジック、セキュリティ、パフォーマンス）
- **参照**: `scripts/validate-expressions.mjs`, `references/conditional-patterns.md`

## ベストプラクティス

### すべきこと

- 必ず `references/context-objects.md` でコンテキストの利用可能性を確認
- `references/builtin-functions.md` から適切な関数を選択
- `references/conditional-patterns.md` の推奨パターンを適用
- セキュリティリスク（secrets の不適切な使用）に注意
- エッジケースを考慮した設計・実装

### 避けるべきこと

- コンテキストや関数の仕様を確認せずに進めること
- `references/conditional-patterns.md` のアンチパターンを使用すること
- 検証なしで本番環境に適用すること
- 複雑すぎる式（可読性・保守性の低下）

## リソース参照（Progressive Disclosure）

### Level 1: 基礎（必要時のみ読み込み)

- **パス**: `references/Level1_basics.md`
- **内容**: スキルの基本運用、使用タイミング、判断基準
- **読み込み条件**: スキル初回使用時、基本概念の確認が必要な時

### Level 2: 中級（リソース活用時に読み込み）

- **パス**: `references/Level2_intermediate.md`
- **内容**: リソース運用、スクリプト運用、テンプレート運用
- **読み込み条件**: リソースやスクリプトの使用方法を確認する時

### Level 3: 上級（複雑なパターン適用時に読み込み）

- **パス**: `references/Level3_advanced.md`
- **内容**: 複雑なパターン、エッジケース対応
- **読み込み条件**: 高度な実装や最適化が必要な時

### Level 4: エキスパート（専門的な知識が必要な時に読み込み）

- **パス**: `references/Level4_expert.md`
- **内容**: 専門的な知識、最適化技術
- **読み込み条件**: 専門的な問題解決や最適化が必要な時

### トピック別リファレンス（該当トピック扱う時のみ読み込み）

#### コンテキストオブジェクト

- **パス**: `references/context-objects.md`
- **内容**: github, env, job, steps, runner, secrets, needs, matrix, inputs等
- **読み込み条件**: コンテキストの選択・使用時

#### 組み込み関数

- **パス**: `references/builtin-functions.md`
- **内容**: 文字列関数、配列関数、型変換、contains等
- **読み込み条件**: 関数の選択・使用時

#### 条件パターン

- **パス**: `references/conditional-patterns.md`
- **内容**: ブランチ条件、イベント条件、マトリックス条件、アンチパターン
- **読み込み条件**: 条件分岐の実装時

#### 式構文

- **パス**: `references/expression-syntax.md`
- **内容**: ${{ }}構文、演算子、リテラル、エスケープ
- **読み込み条件**: 構文の確認・実装時

## スクリプト

### 式検証スクリプト

```bash
node .claude/skills/github-actions-expressions/scripts/validate-expressions.mjs <workflow-file>
```

- **用途**: ワークフロー式の構文検証
- **実行タイミング**: Phase 3 検証時
- **終了コード**: 0=成功, 1=エラー, 2=引数エラー

### 使用記録スクリプト

```bash
node .claude/skills/github-actions-expressions/scripts/log_usage.mjs \
  --result success|failure \
  --phase "phase-name" \
  --agent "agent-name" \
  --notes "feedback"
```

- **用途**: 実行記録とメトリクス更新
- **実行タイミング**: Phase 3 完了時（必須）
- **出力**: LOGS.md, EVALS.json を更新

### スキル構造検証スクリプト

```bash
node .claude/skills/github-actions-expressions/scripts/validate-skill.mjs
```

- **用途**: スキル構造の妥当性確認
- **実行タイミング**: スキル更新時

## テンプレート

### 式実装テンプレート

- **パス**: `assets/expression-examples.yaml`
- **用途**: 標準的な式パターンのテンプレート
- **使用タイミング**: Phase 2 実装時

## メトリクスとフィードバック

### 評価基準

- **パス**: `EVALS.json`
- **内容**: 実行回数、成功率、レベル基準、フェーズ別メトリクス
- **更新**: `scripts/log_usage.mjs` により自動更新

### 使用履歴

- **パス**: `LOGS.md`
- **内容**: 実行ログ、フィードバック、改善提案
- **更新**: `scripts/log_usage.mjs` により自動追記

## 変更履歴

| Version | Date       | Changes                                                                               |
| ------- | ---------- | ------------------------------------------------------------------------------------- |
| 1.0.0   | 2025-12-31 | 18-skills.md仕様準拠: agents/追加、EVALS.json/LOGS.md作成、Progressive Disclosure適用 |
