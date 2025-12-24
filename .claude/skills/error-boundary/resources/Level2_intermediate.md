# Level 2: Intermediate

## 概要

ReactにおけるError Boundaryとエラーハンドリングのベストプラクティスを専門とするスキル。 堅牢なエラー処理とユーザーフレンドリーなフォールバックUIを提供します。 専門分野:

resources/・scripts/・templates/ の活用を前提とした運用を整理します。

## 前提条件

- Level 1 の内容を理解している
- SKILL.md の適用範囲を説明できる

## 詳細ガイド

### 必要な知識・情報
- 主要トピック: Error Boundary 基礎 / 基本的なError Boundary / キャッチできるエラー / エラー報告・監視 / 報告すべき情報 / 基本情報
- 実務指針: アプリケーションのエラーハンドリングを設計する時 / クラッシュからの回復UIを実装する時 / エラー監視を設定する時

### 判断基準と検証観点
- 回避事項: アンチパターンや注意点を確認せずに進めることを避ける

### リソース運用
- `resources/error-boundary-basics.md`: error-boundary-basics の詳細ガイド（把握する知識: Error Boundary 基礎 / 基本的なError Boundary / キャッチできるエラー）
- `resources/error-reporting.md`: error-reporting の詳細ガイド（把握する知識: エラー報告・監視 / 報告すべき情報 / 基本情報）
- `resources/fallback-ui-patterns.md`: fallback-ui-patterns のパターン集（把握する知識: フォールバックUIパターン / 基本パターン / シンプルエラー表示）
- `resources/recovery-strategies.md`: recovery-strategies の詳細ガイド（把握する知識: リカバリー戦略 / リカバリー戦略の種類 / 1. 再試行（Retry））
- `resources/requirements-index.md`: 要求仕様の索引（docs/00-requirements と同期）（把握する知識: エラーハンドリング仕様）
- `resources/legacy-skill.md`: 旧SKILL.mdの全文（把握する知識: Error Boundary / リソース構造 / リソース読み取り）

### スクリプト運用
- `scripts/analyze-error-handling.mjs`: errorhandlingを分析するスクリプト
- `scripts/log_usage.mjs`: 使用記録・自動評価スクリプト
- `scripts/validate-skill.mjs`: スキル構造検証スクリプト

### テンプレート運用
- `templates/error-boundary-template.md`: error-boundary-template のテンプレート
- `templates/error-fallback-template.md`: error-fallback-template のテンプレート

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
