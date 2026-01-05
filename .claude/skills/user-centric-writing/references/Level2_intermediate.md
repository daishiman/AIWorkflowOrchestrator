# Level 2: Intermediate

## 概要

キャシー・シエラの『Badass: Making Users Awesome』に基づく

resources/・scripts/・templates/ の活用を前提とした運用を整理します。

## 前提条件

- Level 1 の内容を理解している
- SKILL.md の適用範囲を説明できる

## 詳細ガイド

### 必要な知識・情報
- 主要トピック: 平易な言葉ガイド / 専門用語の言い換え辞典 / システム・技術用語 / UI/UX ガイドライン / 核心概念 / キャシー・シエラの 5 原則

### 判断基準と検証観点
- 回避事項: アンチパターンや注意点を確認せずに進めることを避ける

### リソース運用
- `resources/plain-language-guide.md`: Plain Language Guideリソース（把握する知識: 平易な言葉ガイド / 専門用語の言い換え辞典 / システム・技術用語）
- `resources/requirements-index.md`: 要求仕様の索引（docs/00-requirements と同期）（把握する知識: UI/UX ガイドライン）
- `resources/legacy-skill.md`: 旧SKILL.mdの全文（把握する知識: 核心概念 / キャシー・シエラの 5 原則 / タスク指向 vs 機能指向）

### スクリプト運用
- `scripts/log_usage.mjs`: 使用記録・自動評価スクリプト
- `scripts/measure-readability.mjs`: Measure Readabilityスクリプト
- `scripts/validate-skill.mjs`: スキル構造検証スクリプト

### テンプレート運用
- `templates/persona-template.md`: Personaテンプレート

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
