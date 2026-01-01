---
name: example-usage-patterns
description: |
  Documentation patterns for creating clear, comprehensive, and maintainable usage examples across APIs, CLIs, libraries, and frameworks. Provides systematic approaches to example creation that balance clarity, completeness, and practical applicability.

  📖 参考資料:
  • 『Docs for Developers』（Jared Bhatti et al.）/ 適用: 実践的な例示パターン / 目的: 開発者に即座に理解・実行可能な例を提供
  • 『The Documentation System』（Diátaxis）/ 適用: チュートリアル・ハウツー・リファレンス分類 / 目的: 目的に応じた例の種類と粒度を選択
  • 『Writing Great Specifications』（Kamil Nicieja）/ 適用: サンプルコードの品質基準 / 目的: 正確性・再現性・保守性の確保

  Trigger:
  Use when creating code examples, writing tutorials, documenting API usage, building sample projects, establishing example conventions, reviewing documentation quality, or standardizing example patterns across a codebase.

allowed-tools:
  - Read
  - Write
  - Edit
  - Bash
  - Grep
  - Glob
tags:
  - documentation
  - examples
  - patterns
  - best-practices
  - developer-experience
---

# Example Usage Patterns スキル

## 概要

実践的で保守可能な使用例を作成するための体系的なアプローチを提供します。このスキルは、API、CLI、ライブラリ、フレームワークなど、あらゆる種類のソフトウェアコンポーネントに適用できる例示パターンとベストプラクティスを定義します。

詳細な手順は以下のレベル別リソースを参照してください：

- **Level 1**: 基礎的な例の構造と要素（参照: `references/Level1_basics.md`）
- **Level 2**: 実践的なパターンとアンチパターン（参照: `references/Level2_intermediate.md`）
- **Level 3**: 高度なシナリオと複雑性管理（参照: `references/Level3_advanced.md`）
- **Level 4**: 大規模プロジェクトとメンテナンス戦略（参照: `references/Level4_expert.md`）

## ワークフロー

### Phase 1: コンテキスト分析

**目的**: 例示対象の性質と要件を明確化する

**アクション**:

1. `references/Level1_basics.md` で例示の基本原則を確認
2. `references/example-types.md` で例の種類（チュートリアル、ハウツー、リファレンス）を決定
3. 対象ユーザーの技術レベルと背景知識を評価
4. 例示範囲（最小限の例、実践的な例、完全なアプリケーション）を定義

**Task**: `agents/analyze-example-context.md` を参照

### Phase 2: 例の設計と作成

**目的**: 効果的な使用例を設計・実装する

**アクション**:

1. `assets/example-template.md` を使用して構造を定義
2. `references/clarity-principles.md` に基づいて明確性を確保
3. `references/completeness-checklist.md` で網羅性を検証
4. `scripts/validate-examples.mjs` で実行可能性を確認
5. `references/Level2_intermediate.md` の実装パターンを適用

**Task**: `agents/design-example.md` を参照

### Phase 3: 検証と改善

**目的**: 例の品質を確保し、フィードバックループを構築する

**アクション**:

1. `scripts/test-examples.mjs` で全例を自動テスト
2. `references/review-criteria.md` に基づいてレビュー
3. `scripts/validate-skill.mjs` でスキル構造を検証
4. `scripts/log_usage.mjs` で使用履歴を記録
5. `references/Level3_advanced.md` で最適化の余地を確認

**Task**: `agents/validate-examples.md` を参照

## Task仕様ナビ

| タスク                   | 対象レベル | 主要リソース                | スクリプト              | テンプレート          |
| ------------------------ | ---------- | --------------------------- | ----------------------- | --------------------- |
| 最小限の例作成           | L1         | `Level1_basics.md`          | -                       | `example-template.md` |
| 実践的な例作成           | L2         | `Level2_intermediate.md`    | `validate-examples.mjs` | `example-template.md` |
| 複雑なシナリオの例示     | L3         | `Level3_advanced.md`        | `test-examples.mjs`     | `complex-example.md`  |
| サンプルプロジェクト構築 | L3-L4      | `Level3_advanced.md`        | `generate-project.mjs`  | `project-template/`   |
| 例のテスト自動化         | L2-L3      | `testing-strategies.md`     | `test-examples.mjs`     | -                     |
| 例の品質レビュー         | L2-L4      | `review-criteria.md`        | `validate-examples.mjs` | -                     |
| ドキュメント統合         | L2-L3      | `documentation-patterns.md` | -                       | -                     |
| 例のメンテナンス         | L3-L4      | `Level4_expert.md`          | `update-examples.mjs`   | -                     |

## ベストプラクティス

### すべきこと ✓

- **実行可能性の確保**: すべての例はコピー&ペーストで動作する
- **段階的な複雑化**: 基本例から高度な使用例へ段階的に進める
- **明確なコメント**: 重要な部分には説明コメントを追加
- **現実的なシナリオ**: 実際のユースケースに基づいた例を作成
- **エラーハンドリングの明示**: エラーケースと対処法を含める
- **一貫性の維持**: 命名規則、スタイル、構造を統一
- **自動テストの実装**: 例が常に動作することを保証
- **バージョン管理**: 依存関係のバージョンを明記

### 避けるべきこと ✗

- **複雑すぎる最初の例**: 初心者向けに複雑な概念を詰め込まない
- **説明のない魔法の値**: ハードコード値には理由を添える
- **非現実的な例**: 実際に使用されないシナリオを避ける
- **不完全な例**: 動作に必要な全コンポーネントを含める
- **古い情報**: 非推奨のAPIや古いパターンを使用しない
- **セキュリティリスク**: 安全でない実装パターンを示さない
- **環境依存**: 特定環境でのみ動作する例を避ける
- **過度な抽象化**: 理解を妨げる不必要な抽象化を避ける

## リソース参照

### ドキュメント

| リソース                               | 説明                                 | 対象レベル |
| -------------------------------------- | ------------------------------------ | ---------- |
| `references/Level1_basics.md`          | 例示の基本原則と構造                 | L1         |
| `references/Level2_intermediate.md`    | 実践的なパターンとアンチパターン     | L2         |
| `references/Level3_advanced.md`        | 高度なシナリオと複雑性管理           | L3         |
| `references/Level4_expert.md`          | 大規模プロジェクトとメンテナンス戦略 | L4         |
| `references/example-types.md`          | 例の種類と使い分け                   | L1-L2      |
| `references/clarity-principles.md`     | 明確性の原則                         | L2-L3      |
| `references/completeness-checklist.md` | 網羅性チェックリスト                 | L2-L3      |
| `references/testing-strategies.md`     | 例のテスト戦略                       | L2-L4      |
| `references/documentation-patterns.md` | ドキュメント統合パターン             | L2-L3      |
| `references/review-criteria.md`        | レビュー基準                         | L2-L4      |

### スクリプト

```bash
# 例の実行可能性を検証
node .claude/skills/example-usage-patterns/scripts/validate-examples.mjs --help

# 例の自動テスト実行
node .claude/skills/example-usage-patterns/scripts/test-examples.mjs --help

# サンプルプロジェクト生成
node .claude/skills/example-usage-patterns/scripts/generate-project.mjs --help

# 例の更新と同期
node .claude/skills/example-usage-patterns/scripts/update-examples.mjs --help

# 使用履歴の記録と自動評価
node .claude/skills/example-usage-patterns/scripts/log_usage.mjs --help

# スキル構造の検証
node .claude/skills/example-usage-patterns/scripts/validate-skill.mjs --help
```

### テンプレート

```bash
# 基本的な例のテンプレート
cat .claude/skills/example-usage-patterns/assets/example-template.md

# 複雑なシナリオのテンプレート
cat .claude/skills/example-usage-patterns/assets/complex-example.md

# サンプルプロジェクトのテンプレート
ls .claude/skills/example-usage-patterns/assets/project-template/
```

## 例示原則

### 1. 明確性（Clarity）

- **単一責務**: 各例は1つの概念に焦点を当てる
- **直感的な名前**: 変数名・関数名は目的を明確に示す
- **段階的開示**: 複雑さを段階的に導入する

### 2. 完全性（Completeness）

- **すべての依存関係**: 必要なインポート・設定を含める
- **エラーハンドリング**: 失敗ケースと対処法を示す
- **前提条件**: 必要な環境・設定を明記

### 3. 実用性（Practicality）

- **現実的なシナリオ**: 実際の使用例に基づく
- **ベストプラクティス**: 推奨される実装パターンを使用
- **パフォーマンス考慮**: 非効率的なパターンを避ける

### 4. 保守性（Maintainability）

- **自動テスト**: 例が壊れていないことを継続的に検証
- **バージョン管理**: 依存関係のバージョンを追跡
- **ドキュメント更新**: コード変更に合わせて例を更新

## 変更履歴

| Version | Date       | Changes                                                            |
| ------- | ---------- | ------------------------------------------------------------------ |
| 1.0.0   | 2025-12-31 | 初版作成。18-skills.md仕様準拠、Task仕様ナビ、レベル別リソース統合 |
