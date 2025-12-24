# Level 2: Intermediate

## 概要

コマンドの命名規則を専門とするスキル。 動詞ベース命名、kebab-case、名前空間の活用、 発見可能性の高い命名設計を提供します。

resources/・scripts/・templates/ の活用を前提とした運用を整理します。

## 前提条件

- Level 1 の内容を理解している
- SKILL.md の適用範囲を説明できる

## 詳細ガイド

### 必要な知識・情報
- 主要トピック: コマンド命名規則 / 基本ルール / ケバブケース / Claude Code 3層アーキテクチャ設計仕様書 / Command Naming Conventions / リソース構造
- 実務指針: コマンド名を決定する時 / 名前空間構造を設計する時 / 既存コマンドとの一貫性を保ちたい時

### 判断基準と検証観点
- 回避事項: アンチパターンや注意点を確認せずに進めることを避ける

### リソース運用
- `resources/naming-rules.md`: kebab-case形式・動詞ベース命名・2-4語の長さ制限と一貫性保持の基本ルールと命名パターン集（把握する知識: コマンド命名規則 / 基本ルール / ケバブケース）
- `resources/requirements-index.md`: 要求仕様の索引（docs/00-requirements と同期）（把握する知識: Claude Code 3層アーキテクチャ設計仕様書）
- `resources/legacy-skill.md`: 旧SKILL.mdの全文（把握する知識: Command Naming Conventions / リソース構造 / リソース種別）

### スクリプト運用
- `scripts/log_usage.mjs`: 使用記録・自動評価スクリプト
- `scripts/validate-naming.mjs`: 命名規則検証スクリプト
- `scripts/validate-skill.mjs`: スキル構造検証スクリプト

### テンプレート運用
- `templates/naming-checklist.md`: kebab-case確認・動詞開始・3-20文字範囲・目的推測可能性・重複回避の5項目チェックリスト

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
