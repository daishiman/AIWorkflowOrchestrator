# レベル2: 運用

## 概要

リスク分析・対応計画を実務で回すための参照資料とスクリプト運用を整理する。
references/・scripts/・assets/ の活用を前提とする。

## 前提条件

- レベル1の内容を理解している
- SKILL.md の適用範囲を説明できる

## 詳細ガイド

### 必要な知識・情報
- 主要トピック: リスク分析フレームワーク、確率・影響度マトリクス、EMV
- 実務指針: プロジェクト開始時の評価、スプリント計画時の見直し

### 判断基準と検証観点
- 回避事項: 注意点を確認せずに評価を進めること

### 参照資料運用
- `references/risk-analysis-framework.md`: 評価基準とマトリクス設計
- `references/risk-analysis.md`: 分析手法と評価の詳細
- `references/risk-identification-guide.md`: 識別セッション準備と手順
- `references/risk-identification.md`: 識別手法の詳細

### スクリプト運用
- `scripts/calculate-risk-score.mjs`: リスクスコア/EMV計算
- `scripts/log_usage.mjs`: 使用ログの追記
- `scripts/validate-skill.mjs`: スキル構造検証

### テンプレート運用
- `assets/risk-register-template.md`: 詳細版リスクレジスター
- `assets/risk-register.md`: 簡易版レジスター

### 成果物要件
- テンプレートの構成・必須項目を反映する

## 実践手順

1. 利用する参照資料を選定し、適用順を決める
2. スクリプトは `--help` で引数を確認し、検証系から実行する
3. テンプレートを使い成果物の形式を統一する
4. `scripts/log_usage.mjs` で実行記録を残す

## チェックリスト

- [ ] 参照資料から必要な知識を抽出できた
- [ ] スクリプトの役割と実行順を把握している
- [ ] テンプレートで成果物の形式を揃えた
