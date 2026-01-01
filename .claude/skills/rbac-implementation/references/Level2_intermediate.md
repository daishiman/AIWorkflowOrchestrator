# Level 2: Intermediate

## 概要

ロールベースアクセス制御（RBAC）の設計と実装パターン。 最小権限の原則に基づくロール体系設計、多層アクセス制御、 権限チェックロジック、ポリシーエンジン構築を提供。

resources/・scripts/・templates/ の活用を前提とした運用を整理します。

## 前提条件

- Level 1 の内容を理解している
- SKILL.md の適用範囲を説明できる

## 詳細ガイド

### 必要な知識・情報
- 主要トピック: 多層アクセス制御の設計 / 3層防御アーキテクチャ / Layer 1: ミドルウェア（ネットワーク層） / セキュリティガイドライン / ロール・権限設計ガイド / ロール設計原則
- 実務指針: ロールと権限の体系を設計する時 / アクセス制御を多層で実装する時（ミドルウェア、APIルート、データ層） / 権限チェックロジックを実装する時

### 判断基準と検証観点
- 回避事項: アンチパターンや注意点を確認せずに進めることを避ける

### リソース運用
- `resources/multi-layer-access-control.md`: 多層アクセス制御の設計（把握する知識: 多層アクセス制御の設計 / 3層防御アーキテクチャ / Layer 1: ミドルウェア（ネットワーク層））
- `resources/requirements-index.md`: 要求仕様の索引（docs/00-requirements と同期）（把握する知識: セキュリティガイドライン）
- `resources/role-permission-design.md`: ロール・権限設計ガイド（把握する知識: ロール・権限設計ガイド / ロール設計原則 / 最小権限の原則）
- `resources/legacy-skill.md`: 旧SKILL.mdの全文（把握する知識: RBAC Implementation / ロール設計 / ロール粒度の決定）

### スクリプト運用
- `scripts/log_usage.mjs`: 使用記録・自動評価スクリプト
- `scripts/validate-rbac-config.mjs`: RBAC設定検証スクリプト
- `scripts/validate-skill.mjs`: スキル構造検証スクリプト

### テンプレート運用
- `templates/rbac-middleware-template.ts`: RBAC Middleware Template

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
