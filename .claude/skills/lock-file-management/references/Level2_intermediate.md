# Level 2: Intermediate

## 概要

ロックファイル（pnpm-lock.yaml、package-lock.json等）の整合性管理と 依存関係の再現性確保を専門とするスキル。

resources/・scripts/・templates/ の活用を前提とした運用を整理します。

## 前提条件

- Level 1 の内容を理解している
- SKILL.md の適用範囲を説明できる

## 詳細ガイド

### 必要な知識・情報
- 主要トピック: CI/CDでの最適化 / キャッシュ戦略 / pnpm + GitHub Actions / マージコンフリクトの解決 / コンフリクトの原因 / よくあるシナリオ
- 実務指針: ロックファイルのマージコンフリクトを解決する時 / 依存関係の再現性問題をデバッグする時 / CI/CD環境での依存関係インストールを最適化する時

### 判断基準と検証観点
- 回避事項: アンチパターンや注意点を確認せずに進めることを避ける

### リソース運用
- `resources/ci-cd-optimization.md`: frozen-lockfile設定、キャッシュ戦略、ビルド時間短縮、並列インストール（把握する知識: CI/CDでの最適化 / キャッシュ戦略 / pnpm + GitHub Actions）
- `resources/conflict-resolution.md`: マージコンフリクト解決手順、再生成戦略、両立性確保の方法（把握する知識: マージコンフリクトの解決 / コンフリクトの原因 / よくあるシナリオ）
- `resources/integrity-verification.md`: package.json同期確認、整合性ハッシュ検証、依存ツリー検証、自動チェックスクリプト（把握する知識: 整合性検証方法 / 検証の種類 / 1. ロックファイルとpackage.jsonの同期確認）
- `resources/lock-file-formats.md`: pnpm/pnpm/yarn各形式の構造、バージョン履歴、形式間比較、移行ガイド（把握する知識: ロックファイル形式 / pnpm-lock.yaml / 構造）
- `resources/legacy-skill.md`: 旧SKILL.mdの全文（把握する知識: Lock File Management / リソース構造 / リソース読み取り）

### スクリプト運用
- `scripts/log_usage.mjs`: 使用記録・自動評価スクリプト
- `scripts/validate-skill.mjs`: スキル構造検証スクリプト
- `scripts/verify-lock-integrity.mjs`: ロックファイル整合性の自動検証（PM検出、同期確認、詳細レポート）

### テンプレート運用
- `templates/lockfile-troubleshooting-template.md`: ロックファイル問題のトラブルシューティング手順テンプレート

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
