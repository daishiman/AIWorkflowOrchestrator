# Level 2: Intermediate

## 概要

Zero Trust Security原則に基づく機密情報管理スキル。

resources/・scripts/・templates/ の活用を前提とした運用を整理します。

## 前提条件

- Level 1 の内容を理解している
- SKILL.md の適用範囲を説明できる

## 詳細ガイド

### 必要な知識・情報
- 主要トピック: 継続的検証の実装 / セッショントークン管理 / 短命トークン実装 / JIT (Just-In-Time) Access パターン / JITアクセスの概念 / JITアクセスの利点

### 判断基準と検証観点
- 回避事項: アンチパターンや注意点を確認せずに進めることを避ける

### リソース運用
- `resources/continuous-verification-implementation.md`: Continuous Verification Implementationリソース（把握する知識: 継続的検証の実装 / セッショントークン管理 / 短命トークン実装）
- `resources/jit-access-patterns.md`: Jit Access Patternsリソース（把握する知識: JIT (Just-In-Time) Access パターン / JITアクセスの概念 / JITアクセスの利点）
- `resources/rbac-implementation.md`: Rbac Implementationリソース（把握する知識: RBAC (Role-Based Access Control) 実装ガイド / RBAC構成要素 / 1. User (ユーザー)）
- `resources/requirements-index.md`: 要求仕様の索引（docs/00-requirements と同期）（把握する知識: 非機能要件 / セキュリティガイドライン）
- `resources/legacy-skill.md`: 旧SKILL.mdの全文（把握する知識: Zero Trust Security / Zero Trust の 5 原則 / 原則 1: 境界の消失）

### スクリプト運用
- `scripts/log_usage.mjs`: 使用記録・自動評価スクリプト
- `scripts/validate-skill.mjs`: スキル構造検証スクリプト

### テンプレート運用
- `templates/access-policy-template.yaml`: Access Policyテンプレート

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
