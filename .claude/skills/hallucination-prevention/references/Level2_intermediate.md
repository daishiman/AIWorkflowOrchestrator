# Level 2: Intermediate

## 概要

AIのハルシネーション（幻覚・誤情報生成）を防止するスキル。 プロンプトレベル、パラメータレベル、検証レベルの3層防御により、 信頼性の高いAI出力を実現します。

resources/・scripts/・templates/ の活用を前提とした運用を整理します。

## 前提条件

- Level 1 の内容を理解している
- SKILL.md の適用範囲を説明できる

## 詳細ガイド

### 必要な知識・情報
- 主要トピック: パラメータ調整ガイド / 主要パラメータ / Temperature / プロンプトレベル防御 / 基本原則 / 防御パターン
- 実務指針: 事実に基づく出力が必要な時 / AIの誤情報を防ぎたい時 / 信頼性の高い出力が求められる時

### 判断基準と検証観点
- 回避事項: アンチパターンや注意点を確認せずに進めることを避ける

### リソース運用
- `resources/parameter-tuning.md`: parameter-tuning の詳細ガイド（把握する知識: パラメータ調整ガイド / 主要パラメータ / Temperature）
- `resources/prompt-level-defense.md`: prompt-level-defense の詳細ガイド（把握する知識: プロンプトレベル防御 / 基本原則 / 防御パターン）
- `resources/verification-mechanisms.md`: verification-mechanisms の詳細ガイド（把握する知識: 検証メカニズム / 検証タイプ / 1. 構造検証）
- `resources/legacy-skill.md`: 旧SKILL.mdの全文（把握する知識: Hallucination Prevention / リソース構造 / リソース読み取り）

### スクリプト運用
- `scripts/log_usage.mjs`: 使用記録・自動評価スクリプト
- `scripts/validate-skill.mjs`: スキル構造検証スクリプト

### テンプレート運用
- `templates/verification-checklist.md`: verification-checklist のチェックリスト

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
