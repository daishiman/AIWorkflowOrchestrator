# Level 2: Intermediate

## 概要

Node.jsプロセスのライフサイクル管理を専門とするスキル。 Linuxカーネルのプロセス管理思想に基づき、プロセスの生成、実行、 監視、終了までの完全な制御と、シグナル処理、ゾンビプロセス回避を設計します。

resources/・scripts/・templates/ の活用を前提とした運用を整理します。

## 前提条件

- Level 1 の内容を理解している
- SKILL.md の適用範囲を説明できる

## 詳細ガイド

### 必要な知識・情報
- 主要トピック: 子プロセス管理パターン / Node.js子プロセスAPI / spawn / プロセス状態管理ガイド / プロセスのライフサイクル / 1. Created（生成）
- 実務指針: Node.jsプロセスの起動・終了フローを設計する時 / シグナルハンドラーを実装する時 / 子プロセスの管理戦略を決定する時

### 判断基準と検証観点
- 回避事項: アンチパターンや注意点を確認せずに進めることを避ける

### リソース運用
- `resources/child-process-patterns.md`: 子プロセス管理パターン（把握する知識: 子プロセス管理パターン / Node.js子プロセスAPI / spawn）
- `resources/process-states.md`: プロセス状態管理ガイド（把握する知識: プロセス状態管理ガイド / プロセスのライフサイクル / 1. Created（生成））
- `resources/requirements-index.md`: 要求仕様の索引（docs/00-requirements と同期）（把握する知識: タスク実行仕様書生成ガイド / =============================================================================）
- `resources/signal-handling.md`: SIGTERM、SIGINT、SIGHUPの適切なハンドリングとGraceful Shutdown実装（把握する知識: シグナル処理ガイド / Unix/Linuxシグナル一覧 / プロセス制御シグナル）
- `resources/legacy-skill.md`: 旧SKILL.mdの全文（把握する知識: Process Lifecycle Management / リソース構造 / リソース読み取り）

### スクリプト運用
- `scripts/check-process-health.mjs`: プロセスヘルスチェックスクリプト
- `scripts/log_usage.mjs`: 使用記録・自動評価スクリプト
- `scripts/validate-skill.mjs`: スキル構造検証スクリプト

### テンプレート運用
- `templates/signal-handler.template.ts`: Signal Handler Template

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
