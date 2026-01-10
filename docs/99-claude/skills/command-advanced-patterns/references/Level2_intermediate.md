# レベル2: 実務

## 概要

高度な実装パターンを専門とするスキル。 パイプラインパターン（複数コマンド連鎖）、メタコマンドパターン（コマンド自身の管理）、 インタラクティブパターン（ユーザー確認統合）の設計と実装を提供します。

references/・scripts/・assets/ の活用を前提とした運用を整理します。

## 前提条件

- Level 1 の内容を理解している
- SKILL.md の適用範囲を説明できる

## 詳細ガイド

### 必要な知識・情報
- 主要トピック: インタラクティブパターン / 基本構造 / Step 1: Show Impact / メタコマンドパターン / List All Commands / パイプラインパターンガイド
- 実務指針: 複数コマンドを連鎖させたい時 / コマンドを管理するメタコマンドを作成する時 / ユーザー確認を統合したインタラクティブなコマンドを作成する時

### 判断基準と検証観点
- 回避事項: アンチパターンや注意点を確認せずに進めることを避ける

### リソース運用
- `references/interactive-pattern-guide.md`: インタラクティブパターン詳細ガイド（把握する知識: インタラクティブパターン / 基本構造 / Step 1: Show Impact）
- `references/meta-command-pattern-guide.md`: メタコマンドパターン詳細ガイド（把握する知識: メタコマンドパターン / 基本構造 / List All Commands）
- `references/pipeline-pattern-guide.md`: パイプラインパターン詳細ガイド（把握する知識: パイプラインパターンガイド / パイプラインの利点 / 1. 再利用性）
- `references/legacy-skill.md`: 旧SKILL.mdの全文（把握する知識: Command Advanced Patterns / リソース構造 / リソース種別）

### スクリプト運用
- `scripts/log_usage.mjs`: 使用記録・自動評価スクリプト
- `scripts/validate-advanced.mjs`: 高度パターン検証スクリプト
- `scripts/validate-skill.mjs`: スキル構造検証スクリプト

### テンプレート運用
- `assets/interactive-template.md`: インタラクティブコマンドテンプレート
- `assets/meta-command-template.md`: メタコマンドテンプレート
- `assets/pipeline-template.md`: パイプラインコマンドテンプレート

### 成果物要件
- アセットの構成・必須項目を反映する

## 実践手順

1. 利用するリソースを選定し、適用順を決める
2. スクリプトは `--help` で引数を確認し、検証系から実行する
3. アセットを使い成果物の形式を統一する
4. `scripts/log_usage.mjs` で実行記録を残す

## チェックリスト

- [ ] リソースから必要な知識を抽出できた
- [ ] スクリプトの役割と実行順を把握している
- [ ] アセットで成果物の形式を揃えた
