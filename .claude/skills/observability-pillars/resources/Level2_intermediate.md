# Level 2: Intermediate

## 概要

オブザーバビリティの三本柱（ログ・メトリクス・トレース）の統合設計スキル。 Charity Majorsの『Observability Engineering』に基づく実践的な統合パターンを提供します。

resources/・scripts/・templates/ の活用を前提とした運用を整理します。

## 前提条件

- Level 1 の内容を理解している
- SKILL.md の適用範囲を説明できる

## 詳細ガイド

### 必要な知識・情報
- 主要トピック: 三本柱統合パターン / パターン1: 相関IDによる統合 / 設計原則 / OpenTelemetry導入ガイド / OpenTelemetryとは / 主要コンポーネント
- 実務指針: ログ、メトリクス、トレースを統合的に設計する時 / 相関IDで三本柱を連携させる時 / メトリクス異常から該当ログへナビゲートする仕組みを構築する時

### 判断基準と検証観点
- 回避事項: アンチパターンや注意点を確認せずに進めることを避ける

### リソース運用
- `resources/integration-patterns.md`: ログ・メトリクス・トレースの相関ID統合と双方向ナビゲーション（メトリクス異常→ログ→トレース）設計（把握する知識: 三本柱統合パターン / パターン1: 相関IDによる統合 / 設計原則）
- `resources/opentelemetry-guide.md`: OpenTelemetry導入ガイド（把握する知識: OpenTelemetry導入ガイド / OpenTelemetryとは / 主要コンポーネント）
- `resources/requirements-index.md`: 要求仕様の索引（docs/00-requirements と同期）（把握する知識: 非機能要件）
- `resources/sampling-strategies.md`: サンプリング戦略設計（把握する知識: サンプリング戦略設計 / サンプリングの必要性 / サンプリングの種類）
- `resources/legacy-skill.md`: 旧SKILL.mdの全文（把握する知識: Observability Pillars - オブザーバビリティ三本柱統合 / 核心概念 / 1. 三本柱の役割と相互補完）

### スクリプト運用
- `scripts/analyze-telemetry.mjs`: テレメトリデータの相関ID一貫性検証とサンプリング率・高カーディナリティデータ分析スクリプト
- `scripts/log_usage.mjs`: 使用記録・自動評価スクリプト
- `scripts/validate-skill.mjs`: スキル構造検証スクリプト

### テンプレート運用
- `templates/integration-config.ts`: OpenTelemetry自動計装・スパン属性設定・相関ID伝播を含む三本柱統合設定テンプレート

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
