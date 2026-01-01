# Level 2: Intermediate

## 概要

NextAuth.js v5の設定とカスタマイズパターン。 プロバイダー設定、アダプター統合、セッション戦略、 コールバックカスタマイズ、型安全性の確保を提供。

resources/・scripts/・templates/ の活用を前提とした運用を整理します。

## 前提条件

- Level 1 の内容を理解している
- SKILL.md の適用範囲を説明できる

## 詳細ガイド

### 必要な知識・情報
- 主要トピック: NextAuth.js Provider Configurations / Google OAuth 2.0 / GitHub OAuth 2.0 / NextAuth.js Session Callbacks Guide / コールバックの役割 / jwt() コールバック
- 実務指針: NextAuth.jsの初期設定時 / OAuth 2.0プロバイダー統合時 / セッション戦略（JWT/Database）の実装時

### 判断基準と検証観点
- 回避事項: アンチパターンや注意点を確認せずに進めることを避ける

### リソース運用
- `resources/provider-configurations.md`: NextAuth.js Provider Configurations（把握する知識: NextAuth.js Provider Configurations / Google OAuth 2.0 / GitHub OAuth 2.0）
- `resources/session-callbacks-guide.md`: NextAuth.js Session Callbacks Guide（把握する知識: NextAuth.js Session Callbacks Guide / コールバックの役割 / jwt() コールバック）
- `resources/legacy-skill.md`: 旧SKILL.mdの全文（把握する知識: NextAuth.js Patterns / 基本設定 / auth.ts設定）

### スクリプト運用
- `scripts/log_usage.mjs`: 使用記録・自動評価スクリプト
- `scripts/validate-nextauth-config.mjs`: NextAuth.js設定ファイルの妥当性検証とプロバイダー設定・コールバック実装の検査スクリプト
- `scripts/validate-skill.mjs`: スキル構造検証スクリプト

### テンプレート運用
- `templates/nextauth-config-template.ts`: Google/GitHub OAuth統合・Drizzleアダプター・JWT/Databaseセッション戦略を含むauth.ts設定テンプレート

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
