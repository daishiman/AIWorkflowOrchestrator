# Level 2: Intermediate

## 概要

ロバート・C・マーティン（Uncle Bob）の『Clean Architecture』に基づく

resources/・scripts/・templates/ の活用を前提とした運用を整理します。

## 前提条件

- Level 1 の内容を理解している
- SKILL.md の適用範囲を説明できる

## 詳細ガイド

### 必要な知識・情報
- 主要トピック: 基本原則 / 依存の方向 / 何が依存とみなされるか / ハイブリッドアーキテクチャへのマッピング / shared/core/（Entities相当） / shared/infrastructure/（Interface Adapters相当）
- 実務指針: アーキテクチャの依存関係違反を検出する時 / レイヤー構造を設計・検証する時 / インターフェースによる境界設計が必要な時

### 判断基準と検証観点
- 回避事項: アンチパターンや注意点を確認せずに進めることを避ける

### リソース運用
- `resources/dependency-rule.md`: 内側→外側依存の禁止ルール、インポート文・型参照・継承での違反検出と対処法（把握する知識: 基本原則 / 依存の方向 / 何が依存とみなされるか）
- `resources/hybrid-architecture-mapping.md`: ハイブリッドアーキテクチャへのマッピング（把握する知識: ハイブリッドアーキテクチャへのマッピング / shared/core/（Entities相当） / shared/infrastructure/（Interface Adapters相当））
- `resources/layer-structure.md`: Entities・Use Cases・Interface Adapters・Frameworksの4層構造と各層の責務・依存制約・チェックリスト（把握する知識: 4層構造 / 1. Entities（エンティティ層） / 2. Use Cases（ユースケース層））
- `resources/requirements-index.md`: 要求仕様の索引（docs/00-requirements と同期）（把握する知識: アーキテクチャ設計）
- `resources/legacy-skill.md`: 旧SKILL.mdの全文（把握する知識: Clean Architecture Principles / リソース構造 / リソース読み取り）

### スクリプト運用
- `scripts/check-layer-violation.mjs`: Clean Architecture レイヤー違反検出スクリプト
- `scripts/log_usage.mjs`: 使用記録・自動評価スクリプト
- `scripts/validate-skill.mjs`: スキル構造検証スクリプト

### テンプレート運用
- `templates/architecture-review-checklist.md`: アーキテクチャレビューチェックリスト

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
