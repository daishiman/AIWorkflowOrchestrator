# Level 2: Intermediate

## 概要

Martin FowlerのPoEAAに基づくRepositoryパターン設計と実装を専門とするスキル。 アプリケーション層とデータアクセス層を分離し、ドメインエンティティをコレクション風 インターフェースで操作する抽象化を提供します。

resources/・scripts/・templates/ の活用を前提とした運用を整理します。

## 前提条件

- Level 1 の内容を理解している
- SKILL.md の適用範囲を説明できる

## 詳細ガイド

### 必要な知識・情報
- 主要トピック: Repository設計原則 / 1. コレクション抽象化原則 / 2. 集約ルート原則 / エンティティマッピングガイド / マッピング戦略 / 1. 直接マッピング
- 実務指針: Repositoryインターフェースを設計する時 / Repository実装を作成する時 / ドメインエンティティとDB型の変換を設計する時

### 判断基準と検証観点
- 回避事項: アンチパターンや注意点を確認せずに進めることを避ける

### リソース運用
- `resources/design-principles.md`: Repository設計原則（把握する知識: Repository設計原則 / 1. コレクション抽象化原則 / 2. 集約ルート原則）
- `resources/entity-mapping.md`: エンティティマッピングガイド（把握する知識: エンティティマッピングガイド / マッピング戦略 / 1. 直接マッピング）
- `resources/implementation-patterns.md`: Repository実装パターン（把握する知識: Repository実装パターン / 基本実装構造 / 標準Repository実装）
- `resources/interface-patterns.md`: Repositoryインターフェース設計パターン（把握する知識: Repositoryインターフェース設計パターン / 基本インターフェースパターン / 1. 汎用Repositoryインターフェース）
- `resources/requirements-index.md`: 要求仕様の索引（docs/00-requirements と同期）（把握する知識: コアインターフェース仕様）
- `resources/legacy-skill.md`: 旧SKILL.mdの全文（把握する知識: Repository Pattern / リソース構造 / リソース読み取り）

### スクリプト運用
- `scripts/log_usage.mjs`: 使用記録・自動評価スクリプト
- `scripts/validate-repository.mjs`: Repository構造検証スクリプト
- `scripts/validate-skill.mjs`: スキル構造検証スクリプト

### テンプレート運用
- `templates/repository-implementation-template.md`: Repository実装テンプレート
- `templates/repository-interface-template.md`: Repositoryインターフェーステンプレート

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
