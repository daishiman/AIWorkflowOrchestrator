# Level 2: Intermediate

## 概要

要件ドキュメントの構造化、品質メトリクス、ハンドオフプロトコルを提供します。 カール・ウィーガーズの要求工学理論に基づき、ステークホルダーと開発チームの両方にとって 有用なドキュメントを作成します。

resources/・scripts/・templates/ の活用を前提とした運用を整理します。

## 前提条件

- Level 1 の内容を理解している
- SKILL.md の適用範囲を説明できる

## 詳細ガイド

### 必要な知識・情報
- 主要トピック: requirements index / Requirements Documentation / 適用タイミング / コア概念
- 実務指針: 要件定義書、要件仕様書を作成する時 / 要件ドキュメントの標準構造が必要な時 / ステークホルダーレビューの準備をする時

### 判断基準と検証観点
- 回避事項: アンチパターンや注意点を確認せずに進めることを避ける

### リソース運用
- `resources/requirements-index.md`: 要求仕様の索引（docs/00-requirements と同期）
- `resources/legacy-skill.md`: 旧SKILL.mdの全文（把握する知識: Requirements Documentation / 適用タイミング / コア概念）

### スクリプト運用
- `scripts/log_usage.mjs`: 使用記録・自動評価スクリプト
- `scripts/validate-skill.mjs`: スキル構造検証スクリプト

### テンプレート運用
- `templates/requirements-document-template.md`: 要件定義書の標準テンプレート（セクション構造と記述例）

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
