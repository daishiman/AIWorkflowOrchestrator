# Level 2: Intermediate

## 概要

claude code hooks に関するベストプラクティスと判断基準を整理するスキル。

resources/・scripts/・templates/ の活用を前提とした運用を整理します。

## 前提条件

- Level 1 の内容を理解している
- SKILL.md の適用範囲を説明できる

## 詳細ガイド

### 必要な知識・情報
- 主要トピック: Claude Code ガイドライン / Claude Code 統合の特性 / 1. マルチターン編集 / 品質指標定義 / メトリクス体系 / コードカバレッジ

### 判断基準と検証観点
- 回避事項: アンチパターンや注意点を確認せずに進めることを避ける

### リソース運用
- `resources/claude-code-guidelines.md`: Claude Code ガイドライン（把握する知識: Claude Code ガイドライン / Claude Code 統合の特性 / 1. マルチターン編集）
- `resources/quality-metrics.md`: カバレッジ80%・複雑度10以下・脆弱性0個などの定量的品質基準とメトリクス収集方法（把握する知識: 品質指標定義 / メトリクス体系 / コードカバレッジ）
- `resources/legacy-skill.md`: 旧SKILL.mdの全文（把握する知識: Claude Code フック実装 / 核心概念 / 1. Claude Code特有の課題）

### スクリプト運用
- `scripts/log_usage.mjs`: 使用記録・自動評価スクリプト
- `scripts/validate-claude-quality.mjs`: Claude Code Quality Validation Script
- `scripts/validate-skill.mjs`: スキル構造検証スクリプト

### テンプレート運用
- `templates/claude-commit-template.sh`: !/bin/bash
- `templates/claude-quality-template.sh`: !/bin/bash

### 成果物要件
- テンプレートの構成・必須項目を反映する

## 実践手順

1. 利用するリソースを選定し、適用順を決める
2. スクリプトは `--help` で引数を確認し、検証系から実行する
3. テンプレートを使い成果物の形式を統一する
4. `scripts/log_usage.mjs` で実行記録を残す

## チェックリスト

- [ ] リソースから必要な知識を抽出できた
- [ ] スクリプトの役割と実行順を把握している
- [ ] テンプレートで成果物の形式を揃えた
