# Level 2: Intermediate

## 概要

スキル作成・改善の詳細ワークフロー（Phase 1-5）を定義。 新規スキル作成、既存エージェント軽量化、既存スキル改善の 3つのワークフローパターンと、各Phaseの具体的なステップ、

resources/・scripts/・templates/ の活用を前提とした運用を整理します。

## 前提条件

- Level 1 の内容を理解している
- SKILL.md の適用範囲を説明できる

## 詳細ガイド

### 必要な知識・情報
- 主要トピック: Purpose / Key Steps / Success Criteria / Claude Code 3層アーキテクチャ設計仕様書 / 情報源評価ガイド / 品質基準と成功の定義
- 実務指針: 新規スキルを作成する時（ワークフローA） / 既存エージェントを軽量化する時（ワークフローB） / 既存スキルを改善する時（ワークフローC）

### 判断基準と検証観点
- 回避事項: アンチパターンや注意点を確認せずに進めることを避ける

### リソース運用
- `resources/phase-details.md`: Phase 1-5の詳細手順、判断基準、成功条件の完全ガイド（把握する知識: Purpose / Key Steps / Success Criteria）
- `resources/requirements-index.md`: 要求仕様の索引（docs/00-requirements と同期）（把握する知識: Claude Code 3層アーキテクチャ設計仕様書）
- `resources/legacy-skill.md`: 旧SKILL.mdの全文（把握する知識: 情報源評価ガイド / 品質基準と成功の定義 / 成功の定義）

### スクリプト運用
- `scripts/log_usage.mjs`: 使用記録・自動評価スクリプト
- `scripts/validate-skill.mjs`: スキルファイル品質検証ツール（必須フィールド、行数チェック）

### テンプレート運用
- `templates/skill-template.md`: 新規スキル作成用の標準テンプレート（YAML frontmatter + 本文構造）

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
