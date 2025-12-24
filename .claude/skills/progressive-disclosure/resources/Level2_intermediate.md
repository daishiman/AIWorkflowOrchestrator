# Level 2: Intermediate

## 概要

3層開示モデルによるトークン効率と知識スケーラビリティの両立を専門とするスキル。 メタデータ→本文→リソースの段階的な情報提供により、必要な時に必要な知識だけを ロードし、スキル発動信頼性を最大化します。

resources/・scripts/・templates/ の活用を前提とした運用を整理します。

## 前提条件

- Level 1 の内容を理解している
- SKILL.md の適用範囲を説明できる

## 詳細ガイド

### 必要な知識・情報
- 主要トピック: 基本構造 / 必須ルール / 2. フルパス形式 / コミットメントメカニズム設計ガイド / コミットメントメカニズムの本質 / 解決: コミットメントの強制
- 実務指針: スキルのYAML Frontmatter（特にdescription）を設計する時 / トークン使用量を最小化する必要がある時 / スキルの自動発動率を向上させる時

### 判断基準と検証観点
- 回避事項: アンチパターンや注意点を確認せずに進めることを避ける

### リソース運用
- `resources/agent-dependency-format-guide.md`: agent-dependency-format-guide のガイド（把握する知識: 基本構造 / 必須ルール / 2. フルパス形式）
- `resources/commitment-mechanism.md`: コミットメントメカニズム設計ガイド（把握する知識: コミットメントメカニズム設計ガイド / コミットメントメカニズムの本質 / 解決: コミットメントの強制）
- `resources/metadata-design.md`: メタデータ設計ガイド（把握する知識: メタデータ設計ガイド / YAML Frontmatter の構成要素 / 必須要素）
- `resources/skill-activation-optimization.md`: スキル発動最適化ガイド（把握する知識: 発動率の現状 / 基本統計（Scott Spence氏の研究より） / 発動率向上の3つのアプローチ）
- `resources/three-layer-model.md`: 3層開示モデル詳細ガイド（把握する知識: 3層の定義 / レベル1: メタデータ層（常時ロード） / レベル2: 本文層（必要時ロード））
- `resources/token-efficiency-strategies.md`: 遅延読み込み、インデックス駆動設計によるトークン使用量60-80%削減手法（把握する知識: トークン効率化戦略 / 3つの効率化戦略 / 戦略1: 遅延読み込み（Lazy Loading））
- `resources/legacy-skill.md`: 旧SKILL.mdの全文（把握する知識: Progressive Disclosure / リソース構造 / リソース種別）

### スクリプト運用
- `scripts/calculate-token-usage.mjs`: Token Usage Calculator for Claude Code Skills
- `scripts/log_usage.mjs`: 使用記録・自動評価スクリプト
- `scripts/validate-skill.mjs`: スキル構造検証スクリプト

### テンプレート運用
- `templates/skill-metadata-template.yaml`: skill-metadata-template設定ファイル

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
