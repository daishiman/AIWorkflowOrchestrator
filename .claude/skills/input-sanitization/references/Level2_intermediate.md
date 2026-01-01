# Level 2: Intermediate

## 概要

ユーザー入力のサニタイズとセキュリティ対策を専門とするスキル。 XSS、SQLインジェクション、コマンドインジェクションなどの攻撃を防止し、 安全なデータ処理を実現します。

resources/・scripts/・templates/ の活用を前提とした運用を整理します。

## 前提条件

- Level 1 の内容を理解している
- SKILL.md の適用範囲を説明できる

## 詳細ガイド

### 必要な知識・情報
- 主要トピック: コマンドインジェクション対策 / コマンドインジェクションの仕組み / 攻撃の例 / ファイルアップロードセキュリティ / リスク一覧 / ファイル検証
- 実務指針: ユーザー入力を処理するAPIエンドポイント設計時 / HTMLコンテンツを動的に生成する際 / データベースクエリを構築する際

### 判断基準と検証観点
- 回避事項: アンチパターンや注意点を確認せずに進めることを避ける

### リソース運用
- `resources/command-injection-prevention.md`: execFileによるシェルコマンド実行と許可リスト検証パターン（把握する知識: コマンドインジェクション対策 / コマンドインジェクションの仕組み / 攻撃の例）
- `resources/file-upload-security.md`: MIMEタイプ検証、パストラバーサル対策、サイズ制限実装（把握する知識: ファイルアップロードセキュリティ / リスク一覧 / ファイル検証）
- `resources/requirements-index.md`: 要求仕様の索引（docs/00-requirements と同期）（把握する知識: セキュリティガイドライン）
- `resources/sql-injection-prevention.md`: パラメータ化クエリとORMによるSQLインジェクション防止（把握する知識: SQLインジェクション対策 / SQLインジェクションの仕組み / 攻撃の例）
- `resources/xss-prevention.md`: HTMLエスケープ、CSP、DOMベースXSS対策の実装パターン（把握する知識: XSS（クロスサイトスクリプティング）対策 / XSSの種類 / 1. Stored XSS（蓄積型））
- `resources/legacy-skill.md`: 旧SKILL.mdの全文（把握する知識: Input Sanitization / リソース構造 / リソース読み取り）

### スクリプト運用
- `scripts/log_usage.mjs`: 使用記録・自動評価スクリプト
- `scripts/scan-vulnerabilities.mjs`: コードベースのXSS/SQLインジェクション脆弱性スキャン
- `scripts/validate-skill.mjs`: スキル構造検証スクリプト

### テンプレート運用
- `templates/sanitization-utils.ts`: 入力検証とサニタイズユーティリティ関数テンプレート

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
