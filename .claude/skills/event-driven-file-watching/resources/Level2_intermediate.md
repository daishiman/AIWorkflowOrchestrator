# Level 2: Intermediate

## 概要

Ryan Dahlのイベント駆動・非同期I/O思想に基づくファイルシステム監視の専門知識。 Chokidarライブラリを中心に、Observer Patternによる効率的なファイル変更検知、 クロスプラットフォーム対応、EventEmitterによる疎結合な通知システムを提供。

resources/・scripts/・templates/ の活用を前提とした運用を整理します。

## 前提条件

- Level 1 の内容を理解している
- SKILL.md の適用範囲を説明できる

## 詳細ガイド

### 必要な知識・情報
- 主要トピック: Chokidar設定リファレンス / 1. ignored（除外パターン） / 2. awaitWriteFinish（書き込み完了待機） / EventEmitter実装パターン / 基本パターン / 1. 継承パターン
- 実務指針: Chokidarによるファイル監視システムを設計・実装する時 / Observer Patternでイベント通知を設計する時 / ファイルシステムイベントのハンドリングを実装する時

### 判断基準と検証観点
- 回避事項: アンチパターンや注意点を確認せずに進めることを避ける

### リソース運用
- `resources/chokidar-config-reference.md`: chokidar-config-reference のリファレンス（把握する知識: Chokidar設定リファレンス / 1. ignored（除外パターン） / 2. awaitWriteFinish（書き込み完了待機））
- `resources/event-emitter-patterns.md`: event-emitter-patterns のパターン集（把握する知識: EventEmitter実装パターン / 基本パターン / 1. 継承パターン）
- `resources/requirements-index.md`: 要求仕様の索引（docs/00-requirements と同期）（把握する知識: ローカルエージェント仕様）
- `resources/legacy-skill.md`: 旧SKILL.mdの全文（把握する知識: Event-Driven File Watching / 核心概念 / 1. イベント駆動アーキテクチャの原則）

### スクリプト運用
- `scripts/log_usage.mjs`: 使用記録・自動評価スクリプト
- `scripts/validate-skill.mjs`: スキル構造検証スクリプト

### テンプレート運用
- `templates/watcher-template.ts`: watcher-template のテンプレート

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
