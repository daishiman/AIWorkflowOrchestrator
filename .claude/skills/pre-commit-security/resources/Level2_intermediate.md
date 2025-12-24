# Level 2: Intermediate

## 概要

pre-commit hookセキュリティスキル。機密情報検出パターン、 git-secrets/gitleaks統合、チーム展開戦略、Git履歴スキャンを提供します。

resources/・scripts/・templates/ の活用を前提とした運用を整理します。

## 前提条件

- Level 1 の内容を理解している
- SKILL.md の適用範囲を説明できる

## 詳細ガイド

### 必要な知識・情報
- 主要トピック: Secret Detection Pattern Library / 汎用Secretパターン / Password / Pre-commit Security Hooks / ツール選択 / git-secrets
- 実務指針: pre-commit hookを実装する時 / 機密情報検出パターンを設計する時 / git-secrets/gitleaksを導入する時

### 判断基準と検証観点
- 回避事項: アンチパターンや注意点を確認せずに進めることを避ける

### リソース運用
- `resources/detection-pattern-library.md`: Secret Detection Pattern Library（把握する知識: Secret Detection Pattern Library / 汎用Secretパターン / Password）
- `resources/legacy-skill.md`: 旧SKILL.mdの全文（把握する知識: Pre-commit Security Hooks / ツール選択 / git-secrets）

### スクリプト運用
- `scripts/log_usage.mjs`: 使用記録・自動評価スクリプト
- `scripts/setup-git-security.mjs`: Git Security Setup Script
- `scripts/validate-skill.mjs`: スキル構造検証スクリプト

### テンプレート運用
- `templates/pre-commit-hook-template.sh`: Pre-commit Hook Template for Secret Detection

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
