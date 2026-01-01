# Level 2: Intermediate

## 概要

ファイル監視システムのセキュリティ対策とプロダクション環境での安全な運用パターン。 最小権限の原則、Defense in Depth、Fail-Safe Defaultsに基づく多層防御設計を提供。 専門分野:

resources/・scripts/・templates/ の活用を前提とした運用を整理します。

## 前提条件

- Level 1 の内容を理解している
- SKILL.md の適用範囲を説明できる

## 詳細ガイド

### 必要な知識・情報
- 主要トピック: ローカルエージェント仕様 / ファイル監視システム 脅威モデル / 脅威カテゴリ / 1. パストラバーサル攻撃 / .claude/skills/file-watcher-security/SKILL.md / 設計原則
- 実務指針: マルチテナント環境でファイル監視を実装する時 / 本番環境でのセキュリティ要件を満たす時 / パストラバーサルやsymlink攻撃を防ぐ時

### 判断基準と検証観点
- 回避事項: アンチパターンや注意点を確認せずに進めることを避ける

### リソース運用
- `resources/requirements-index.md`: 要求仕様の索引（docs/00-requirements と同期）（把握する知識: ローカルエージェント仕様）
- `resources/threat-model.md`: threat-model の詳細ガイド（把握する知識: ファイル監視システム 脅威モデル / 脅威カテゴリ / 1. パストラバーサル攻撃）
- `resources/legacy-skill.md`: 旧SKILL.mdの全文（把握する知識: .claude/skills/file-watcher-security/SKILL.md / 設計原則 / クイックリファレンス）

### スクリプト運用
- `scripts/log_usage.mjs`: 使用記録・自動評価スクリプト
- `scripts/validate-skill.mjs`: スキル構造検証スクリプト

### テンプレート運用
- `templates/secure-watcher.ts`: secure-watcher のテンプレート

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
