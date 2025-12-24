# Level 2: Intermediate

## 概要

E2EテストにおけるAPI モック技術。

resources/・scripts/・templates/ の活用を前提とした運用を整理します。

## 前提条件

- Level 1 の内容を理解している
- SKILL.md の適用範囲を説明できる

## 詳細ガイド

### 必要な知識・情報
- 主要トピック: APIモックパターン / 目次 / 基本的なモックパターン / MSW（Mock Service Worker）統合ガイド / MSWとは / 核心概念
- 実務指針: 外部APIへの依存を排除する必要がある時 / API エラーケース（4xx, 5xx）をテストする時 / テスト実行の安定性・速度向上が必要な時

### 判断基準と検証観点
- 回避事項: アンチパターンや注意点を確認せずに進めることを避ける

### リソース運用
- `resources/mock-patterns.md`: APIモックパターン（把握する知識: APIモックパターン / 目次 / 基本的なモックパターン）
- `resources/msw-integration-guide.md`: MSW（Mock Service Worker）統合ガイド（把握する知識: MSW（Mock Service Worker）統合ガイド / 目次 / MSWとは）
- `resources/legacy-skill.md`: 旧SKILL.mdの全文（把握する知識: 核心概念 / 1. Playwright Route Mocking / 2. エラーケースのシミュレーション）

### スクリプト運用
- `scripts/generate-mock-handlers.mjs`: MSWモックハンドラー自動生成スクリプト
- `scripts/log_usage.mjs`: 使用記録・自動評価スクリプト
- `scripts/validate-skill.mjs`: スキル構造検証スクリプト

### テンプレート運用
- `templates/mock-handler-template.ts`: MSWモックハンドラーテンプレート

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
