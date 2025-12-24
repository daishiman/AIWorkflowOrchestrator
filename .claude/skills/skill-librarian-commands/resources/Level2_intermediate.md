# Level 2: Intermediate

## 概要

Skill Librarianエージェント専用のコマンド、スクリプト、リソース参照ガイド。 スキル作成・管理に必要なTypeScriptスクリプトの実行方法、 詳細リソースへのアクセスパス、テンプレート参照方法を提供します。

resources/・scripts/・templates/ の活用を前提とした運用を整理します。

## 前提条件

- Level 1 の内容を理解している
- SKILL.md の適用範囲を説明できる

## 詳細ガイド

### 必要な知識・情報
- 主要トピック: Command Reference / Script Execution Commands / validate-knowledge.mjs / Claude Code 3層アーキテクチャ設計仕様書 / TypeScriptスクリプト実行 / 1. 知識ドキュメント品質検証
- 実務指針: スキル品質を検証したい時（validate-knowledge.mjs） / トークン使用量を計算したい時（calculate-token-usage.mjs） / ドキュメント構造を分析したい時（analyze-structure.mjs）

### 判断基準と検証観点
- 回避事項: アンチパターンや注意点を確認せずに進めることを避ける

### リソース運用
- `resources/command-reference.md`: 利用可能なスクリプト・コマンドの完全リファレンス（実行方法、オプション、使用例）（把握する知識: Command Reference / Script Execution Commands / validate-knowledge.mjs）
- `resources/requirements-index.md`: 要求仕様の索引（docs/00-requirements と同期）（把握する知識: Claude Code 3層アーキテクチャ設計仕様書）
- `resources/legacy-skill.md`: 旧SKILL.mdの全文（把握する知識: TypeScriptスクリプト実行 / 1. 知識ドキュメント品質検証 / 2. トークン使用量計算）

### スクリプト運用
- `scripts/list-skills.mjs`: 全スキル一覧表示ツール（パス情報付き、Node.js実行可能）
- `scripts/log_usage.mjs`: 使用記録・自動評価スクリプト
- `scripts/validate-skill.mjs`: スキル構造検証スクリプト

### テンプレート運用
- `templates/resource-template.md`: リソースファイル作成用の標準テンプレート（セクション構造、ベストプラクティス）

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
