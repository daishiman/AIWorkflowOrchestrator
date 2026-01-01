---
name: markdown-advanced-syntax
description: |
  Markdown高度構文を活用した技術文書作成の専門スキル。
  Mermaid図、高度なテーブル、コードブロック、数式表現等を適切に使用し、
  読み手にとって分かりやすく、メンテナンス性の高いドキュメントを作成します。

  Anchors:
  • 『GitHub Flavored Markdown仕様』（GitHub） / 適用: ドキュメント構文 / 目的: 拡張構文の正確な実装
  • 『CommonMark仕様』（CommonMark） / 適用: 共通構文 / 目的: プラットフォーム間互換性の確保
  • 『Mermaid公式ドキュメント』（Mermaid） / 適用: 図表化 / 目的: 視覚的な技術文書作成

  Trigger:
  Use when creating technical documentation with advanced Markdown syntax, Mermaid diagrams, complex tables, code blocks, or mathematical expressions.
allowed-tools:
  - Read
  - Write
  - Edit
  - Bash
  - Glob
  - Grep
---

# Markdown Advanced Syntax

## 概要

Markdown高度構文を活用した技術文書作成の専門スキル。
Mermaid図、高度なテーブル、コードブロック、数式表現等を適切に使用し、
読み手にとって分かりやすく、メンテナンス性の高いドキュメントを作成します。

詳細な手順や背景は `references/Level1_basics.md` と `references/Level2_intermediate.md` を参照してください。

## ワークフロー

### Phase 1: 目的と前提の整理

**目的**: タスクの目的と前提条件を明確にする

**アクション**:

1. ドキュメントの目的（仕様書、技術説明、ガイドなど）を確認
2. ターゲット読者層とその前提知識を特定
3. 必要な高度構文要素（図、表、数式など）を判定

### Phase 2: スキル適用

**目的**: スキルの指針に従ってMarkdown文書を作成・編集する

**アクション**:

1. 適切なレベルガイド（Level 1-4）を参照
2. テンプレートを活用して初期構造を作成
3. Mermaid図・表・コード例を含める場合は専用リソースを確認
4. 検証スクリプトで構文チェック（特にMermaid）

### Phase 3: 検証と記録

**目的**: 成果物の検証と実行記録の保存

**アクション**:

1. `scripts/validate-skill.mjs` でスキル構造と構文を確認
2. `scripts/validate-mermaid.mjs` でMermaid図が正しくレンダリング可能か検証
3. ドキュメント品質とメンテナンス性を確認
4. `scripts/log_usage.mjs` を実行して使用記録を保存

## Task仕様ナビ

各フェーズで起動するTaskと、その入出力を定義します。

### Phase 1: Planning（文書設計）

**Task**: `agents/planning.md` - Document Planning

- **役割**: 文書の目的・対象読者・必要な構文要素を特定
- **入力**: ユーザーからの文書化要求
- **出力**: 文書設計仕様（種類、読者層、必要な構文要素リスト、推奨レベルガイド）
- **参照**: `references/Level1_basics.md`, `references/Level2_intermediate.md`

### Phase 2: Implementation（実装）

**Task**: `agents/implementation.md` - Markdown Implementation

- **役割**: 設計仕様に基づいた技術文書の実装
- **入力**: Phase 1 の文書設計仕様
- **出力**: 実装済み技術文書（Mermaid図、テーブル、コード、数式を含む）
- **参照**: レベルガイド（Level 1-4）、`references/mermaid-diagrams.md`、`references/advanced-tables.md`、`references/code-blocks.md`、`references/math-expressions.md`

### Phase 3: Validation（検証と記録）

**Task**: `agents/validation.md` - Quality Validation

- **役割**: 品質検証と使用記録の保存
- **入力**: Phase 2 の実装済み技術文書
- **出力**: 検証レポート、使用記録（LOGS.md / EVALS.json）
- **スクリプト**: `scripts/validate-skill.mjs`, `scripts/validate-mermaid.mjs`, `scripts/log_usage.mjs`

---

## レベルガイド対応表

| レベル | ガイド                              | 対応タスク                                           | 習得目標                                           |
| ------ | ----------------------------------- | ---------------------------------------------------- | -------------------------------------------------- |
| **1**  | `references/Level1_basics.md`       | 基本的なMarkdown記法、標準テーブル、簡単なコード例   | Markdownの基本構文と標準的なフォーマット方法を習得 |
| **2**  | `references/Level2_intermediate.md` | 複雑なテーブル、言語別コードブロック、Mermaid基礎    | 実務的な技術文書作成と図表化の基礎スキルを習得     |
| **3**  | `references/Level3_advanced.md`     | 高度なMermaid図（ER図、状態遷移）、数式表現、最適化  | エンタープライズレベルのドキュメント品質を実現     |
| **4**  | `references/Level4_expert.md`       | カスタムスタイリング、パフォーマンス最適化、複合構造 | 業界標準の専門的ドキュメント作成を実現             |

## リソース参照

### レベルガイド

- **基礎** (`references/Level1_basics.md`): 標準Markdown記法、基本テーブル、シンプルなコード表記
- **応用** (`references/Level2_intermediate.md`): テーブル拡張、コードブロック装飾、図表導入
- **専門** (`references/Level3_advanced.md`): 複雑図形化、数式統合、最適化テクニック
- **エキスパート** (`references/Level4_expert.md`): カスタム実装、パフォーマンス、複合構造設計

### 構文別リソース

- **`references/advanced-tables.md`**: カラム整列、マージセル表現、複雑なデータ構造、読みやすさ最適化
- **`references/code-blocks.md`**: 言語固有ハイライト、差分表示、行番号、ファイル名表示、実行可能コード
- **`references/mermaid-diagrams.md`**: フローチャート・シーケンス図・ER図・状態遷移図の作成ガイド、スタイリング
- **`references/math-expressions.md`**: LaTeX/KaTeX記法、インライン数式、ディスプレイ数式、数学記号
- **`references/front-matter.md`**: YAMLメタデータ定義、title/version/author、ステータス管理、検索最適化
- **`references/legacy-skill.md`**: 旧バージョンSKILL.mdのリファレンス

### テンプレート

- **`assets/specification-template.md`**: 仕様書テンプレート（Mermaid図・高度テーブル・コードブロック統合）

### スクリプト

- **`scripts/validate-skill.mjs`**: スキル構造検証スクリプト
- **`scripts/validate-mermaid.mjs`**: Mermaid構文の自動検証（構文エラー、レンダリング可能性チェック）
- **`scripts/log_usage.mjs`**: 使用記録・自動評価スクリプト

## ベストプラクティス

### すべきこと

- **図解の活用**: 複雑なフローやシステム構造をMermaid図で視覚化する
- **表の適切な使用**: APIやデータモデルの構造を表形式で整理する
- **コード例の明示**: サンプルコードは言語タイプと説明を含めて提示する
- **数式の正確な記述**: 数学的な概念や計算式はLaTeX表記で正確に表現する
- **メタデータの設定**: YAML front-matterで文書のメタ情報を定義する

### 避けるべきこと

- **構文確認不足**: Mermaid図やLaTeX式は必ず検証スクリプトで確認する
- **テーブル過度な複雑化**: ネストが深すぎる表は逆に読みづらくなるため注意
- **コード例の省略**: 動作確認可能なコード例を必ず含める
- **アンチパターンの放置**: 既知の問題パターンは `references/Level3_advanced.md` で確認

## 変更履歴

| Version | Date       | Changes                                                                                                  |
| ------- | ---------- | -------------------------------------------------------------------------------------------------------- |
| 1.1.0   | 2025-12-31 | agents/ディレクトリ追加（planning/implementation/validation）、EVALS.json・LOGS.md追加、仕様完全準拠完了 |
| 1.0.0   | 2025-12-31 | 18-skills.md仕様に準拠。Task仕様ナビ、リソース参照セクション追加                                         |
| 0.9.0   | 2025-12-24 | スキル構造検証スクリプトと成果物の統合完了                                                               |
