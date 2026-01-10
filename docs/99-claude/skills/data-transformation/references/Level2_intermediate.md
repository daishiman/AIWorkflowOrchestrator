# レベル2: 実務

## 概要

スキーママッピングとETL設計の実務指針を扱う。

references/ と assets/ を活用する運用を前提とする。

## 前提条件

- レベル1の成果物が揃っている
- 入出力スキーマが明確

## 詳細ガイド

### 必要な知識・情報

- 主要トピック: マッピング設計、ETL設計、検証ポイント
- 参照必須: `references/schema-mapping-guide.md`

### 判断基準と検証観点

- 回避事項: マッピングの抜け漏れ

### リソース運用

- `references/etl-design-patterns.md`: ETL設計パターン
- `references/data-quality-metrics.md`: 品質指標

### スクリプト運用

- `scripts/analyze-transformations.mjs`: 変換点の分析
- `scripts/validate-skill.mjs`: 構造検証

### テンプレート運用

- `assets/etl-pipeline-template.md`: パイプライン設計
- `assets/schema-mapping-template.md`: マッピング整理

### 成果物要件

- マッピングとフローが明記されている

## 実践手順

1. マッピング表を作成する
2. ETLフローを定義する
3. 検証ポイントを整理する

## チェックリスト

- [ ] マッピングが整理されている
- [ ] ETLフローが明記されている
- [ ] 検証ポイントが定義されている
