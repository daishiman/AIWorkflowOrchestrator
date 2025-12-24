# Level 2: Intermediate

## 概要

Model Context Protocol (MCP) の標準仕様とツール定義パターンに関する専門知識。 MCPプロトコルの構造、サーバー設定、ツール定義、パラメータスキーマ設計を提供します。

resources/・scripts/・templates/ の活用を前提とした運用を整理します。

## 前提条件

- Level 1 の内容を理解している
- SKILL.md の適用範囲を説明できる

## 詳細ガイド

### 必要な知識・情報
- 主要トピック: MCP設定例集 / 1. 基本的なMCPサーバー設定 / npxベースのサーバー / 1. プロトコルバージョン / バージョン管理 / 2. メッセージフォーマット
- 実務指針: MCPサーバーの新規設定が必要な時 / ツール定義のYAML/JSON構造を設計する時 / MCPプロトコル仕様への準拠を確認する時

### 判断基準と検証観点
- 回避事項: アンチパターンや注意点を確認せずに進めることを避ける

### リソース運用
- `resources/config-examples.md`: command/url/stdio接続方式の実例、環境変数マッピング、複数サーバー設定（把握する知識: MCP設定例集 / 1. 基本的なMCPサーバー設定 / npxベースのサーバー）
- `resources/mcp-specification.md`: プロトコル仕様、ツール定義構造、inputSchema設計、エラーコード体系（把握する知識: 1. プロトコルバージョン / バージョン管理 / 2. メッセージフォーマット）
- `resources/requirements-index.md`: 要求仕様の索引（docs/00-requirements と同期）（把握する知識: 技術スタック仕様書）
- `resources/troubleshooting.md`: 接続エラー診断、タイムアウト対応、レスポンス形式不正の解決（把握する知識: MCP トラブルシューティングガイド / 1. 接続問題 / サーバーが起動しない）
- `resources/legacy-skill.md`: 旧SKILL.mdの全文（把握する知識: コアコンセプト / 1. MCP アーキテクチャ / 2. MCP サーバー定義構造）

### スクリプト運用
- `scripts/log_usage.mjs`: 使用記録・自動評価スクリプト
- `scripts/validate-mcp-config.mjs`: MCP設定ファイルの自動検証（構文、必須フィールド、環境変数）
- `scripts/validate-skill.mjs`: スキル構造検証スクリプト
- `scripts/validate-tool-schema.mjs`: ツール定義スキーマの検証（JSON Schema準拠、型安全性）

### テンプレート運用
- `templates/server-config-template.json`: MCPサーバー設定テンプレート（command/args/env構造）
- `templates/tool-definition-template.json`: ツール定義テンプレート（name/description/inputSchema）

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
