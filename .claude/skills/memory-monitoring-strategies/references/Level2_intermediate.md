# Level 2: Intermediate

## 概要

Node.jsアプリケーションのメモリ監視とリーク検出を専門とするスキル。 PM2、V8ヒープ分析、メモリプロファイリングを活用した効率的なメモリ管理を設計します。

resources/・scripts/・templates/ の活用を前提とした運用を整理します。

## 前提条件

- Level 1 の内容を理解している
- SKILL.md の適用範囲を説明できる

## 詳細ガイド

### 必要な知識・情報
- 主要トピック: ヒープ分析ガイド / ヒープスナップショットの取得 / heapdumpモジュール / メモリリーク検出ガイド / メモリリークとは / リークの兆候
- 実務指針: メモリ使用量の監視を設定する時 / メモリリークを調査する時 / PM2のメモリ制限を設定する時

### 判断基準と検証観点
- 回避事項: アンチパターンや注意点を確認せずに進めることを避ける

### リソース運用
- `resources/heap-analysis.md`: heapdump取得、Chrome DevTools分析、スナップショット比較、リーク原因特定（把握する知識: ヒープ分析ガイド / ヒープスナップショットの取得 / heapdumpモジュール）
- `resources/leak-detection.md`: リーク兆候の検出、継続的増加パターン、GC効果測定、原因診断手法（把握する知識: メモリリーク検出ガイド / メモリリークとは / リークの兆候）
- `resources/memory-metrics.md`: RSS/heapUsed/heapTotal/external各メトリクス説明、警告閾値設定（把握する知識: Node.jsメモリメトリクスガイド / process.memoryUsage() / RSS (Resident Set Size)）
- `resources/legacy-skill.md`: 旧SKILL.mdの全文（把握する知識: Memory Monitoring Strategies / リソース構造 / リソース読み取り）

### スクリプト運用
- `scripts/log_usage.mjs`: 使用記録・自動評価スクリプト
- `scripts/memory-monitor.mjs`: メモリ使用量のリアルタイム監視（PID/PM2アプリ指定、閾値アラート）
- `scripts/validate-skill.mjs`: スキル構造検証スクリプト

### テンプレート運用
- `templates/memory-tracker.template.ts`: PM2カスタムメトリクス実装テンプレート（TypeScript、io.metric活用）

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
