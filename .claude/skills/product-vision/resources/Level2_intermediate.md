# Level 2: Intermediate

## 概要

ビジョンボード作成、OKR設定、プロダクトロードマップ策定の体系的手法。 長期的な製品戦略を明確化し、チームとステークホルダーの方向性を 一致させる手法を提供します。

resources/・scripts/・templates/ の活用を前提とした運用を整理します。

## 前提条件

- Level 1 の内容を理解している
- SKILL.md の適用範囲を説明できる

## 詳細ガイド

### 必要な知識・情報
- 主要トピック: 統合システム設計仕様書：Universal AI Workflow Orchestrator / いつ使うか / コア概念 / プロダクトビジョンの要素

### 判断基準と検証観点
- 回避事項: アンチパターンや注意点を確認せずに進めることを避ける

### リソース運用
- `resources/requirements-index.md`: 要求仕様の索引（docs/00-requirements と同期）（把握する知識: 統合システム設計仕様書：Universal AI Workflow Orchestrator）
- `resources/legacy-skill.md`: 旧SKILL.mdの全文（把握する知識: いつ使うか / コア概念 / プロダクトビジョンの要素）

### スクリプト運用
- `scripts/log_usage.mjs`: 使用記録・自動評価スクリプト
- `scripts/validate-skill.mjs`: スキル構造検証スクリプト

### テンプレート運用
- `templates/okr-template.md`: OKR (Objectives and Key Results) テンプレート

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
