# Level 2: Intermediate

## 概要

暗号化と鍵ライフサイクル管理スキル。暗号化アルゴリズム選定、 鍵生成、保管、ローテーション、廃棄の全フェーズを網羅します。 保存時・転送時・使用時の暗号化戦略を提供します。

resources/・scripts/・templates/ の活用を前提とした運用を整理します。

## 前提条件

- Level 1 の内容を理解している
- SKILL.md の適用範囲を説明できる

## 詳細ガイド

### 必要な知識・情報
- 主要トピック: ゼロダウンタイムRotationの5段階 / Rotationタイプ別手順 / データベーストークンRotation（Turso） / Encryption & Key Lifecycle Management / 暗号化レベルの選択 / レベル 1: 保存時暗号化（Encryption at Rest）
- 実務指針: 暗号化方式を選択する時 / 鍵生成・保管方法を設計する時 / Secret Rotationプロセスを実装する時

### 判断基準と検証観点
- 回避事項: アンチパターンや注意点を確認せずに進めることを避ける

### リソース運用
- `resources/rotation-procedures.md`: rotation-procedures の詳細ガイド（把握する知識: ゼロダウンタイムRotationの5段階 / Rotationタイプ別手順 / データベーストークンRotation（Turso））
- `resources/legacy-skill.md`: 旧SKILL.mdの全文（把握する知識: Encryption & Key Lifecycle Management / 暗号化レベルの選択 / レベル 1: 保存時暗号化（Encryption at Rest））

### スクリプト運用
- `scripts/generate-keys.mjs`: keysを生成するスクリプト
- `scripts/log_usage.mjs`: 使用記録・自動評価スクリプト
- `scripts/validate-skill.mjs`: スキル構造検証スクリプト

### テンプレート運用
- テンプレートはありません

### 成果物要件
- 判断根拠と次のアクションが明確な成果物を作る

## 実践手順

1. 利用するリソースを選定し、適用順を決める
2. スクリプトは `--help` で引数を確認し、検証系から実行する
3. `scripts/log_usage.mjs` で実行記録を残す

## チェックリスト

- [ ] リソースから必要な知識を抽出できた
- [ ] スクリプトの役割と実行順を把握している
- [ ] 成果物要件を満たしている
