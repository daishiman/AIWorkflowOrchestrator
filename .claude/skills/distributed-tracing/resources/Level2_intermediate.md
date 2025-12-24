# Level 2: Intermediate

## 概要

分散トレーシングとOpenTelemetry統合の専門スキル。 マイクロサービスアーキテクチャにおけるリクエストフローの可視化とボトルネック特定を提供します。 使用タイミング:

resources/・scripts/・templates/ の活用を前提とした運用を整理します。

## 前提条件

- Level 1 の内容を理解している
- SKILL.md の適用範囲を説明できる

## 詳細ガイド

### 必要な知識・情報
- 主要トピック: スパン設計ガイド / スパンの粒度 / 適切な粒度の判断基準 / トレース構造設計 / トレースの階層構造 / 基本的な親子関係
- 実務指針: 分散システムのリクエストフロー を可視化する時 / OpenTelemetryで分散トレーシングを導入する時 / トレースIDとスパンIDを設計する時

### 判断基準と検証観点
- 回避事項: アンチパターンや注意点を確認せずに進めることを避ける

### リソース運用
- `resources/span-design-guide.md`: span-design-guide のガイド（把握する知識: スパン設計ガイド / スパンの粒度 / 適切な粒度の判断基準）
- `resources/trace-structure-design.md`: trace-structure-design の詳細ガイド（把握する知識: トレース構造設計 / トレースの階層構造 / 基本的な親子関係）
- `resources/w3c-trace-context.md`: w3c-trace-context の詳細ガイド（把握する知識: W3C Trace Context 実装ガイド / W3C Trace Context 標準 / 主要ヘッダー）
- `resources/legacy-skill.md`: 旧SKILL.mdの全文（把握する知識: Distributed Tracing - 分散トレーシング / 核心概念 / 1. トレースの構造）

### スクリプト運用
- `scripts/analyze-trace.mjs`: traceを分析するスクリプト
- `scripts/log_usage.mjs`: 使用記録・自動評価スクリプト
- `scripts/validate-skill.mjs`: スキル構造検証スクリプト

### テンプレート運用
- `templates/tracing-config.ts`: tracing-config のテンプレート

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
