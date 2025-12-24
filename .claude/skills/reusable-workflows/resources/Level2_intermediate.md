# Level 2: Intermediate

## 概要

GitHub Actions再利用可能ワークフローの設計と実装。 workflow_call イベント、入力/出力/シークレット定義、呼び出しパターン、 合成設計、継承、チェーンパターンの専門知識を提供。

resources/・scripts/・templates/ の活用を前提とした運用を整理します。

## 前提条件

- Level 1 の内容を理解している
- SKILL.md の適用範囲を説明できる

## 詳細ガイド

### 必要な知識・情報
- 主要トピック: Caller Patterns / Basic Calling Pattern / Local vs Remote / Design Patterns / Composition Patterns / Basic Composition

### 判断基準と検証観点
- 回避事項: アンチパターンや注意点を確認せずに進めることを避ける

### リソース運用
- `resources/caller-patterns.md`: Caller Patternsリソース（把握する知識: Caller Patterns / Basic Calling Pattern / Local vs Remote）
- `resources/design-patterns.md`: Design Patternsリソース（把握する知識: Design Patterns / Composition Patterns / Basic Composition）
- `resources/workflow-call-syntax.md`: Workflow Call Syntaxリソース（把握する知識: Workflow Call Syntax / Basic Structure / Inputs Definition）
- `resources/legacy-skill.md`: 旧SKILL.mdの全文（把握する知識: 📁 Directory Structure / 🎯 Core Concept / 📚 Command Reference）

### スクリプト運用
- `scripts/log_usage.mjs`: 使用記録・自動評価スクリプト
- `scripts/validate-reusable.mjs`: Validate Reusableスクリプト
- `scripts/validate-skill.mjs`: スキル構造検証スクリプト

### テンプレート運用
- `templates/caller-workflow.yaml`: Caller Workflowテンプレート
- `templates/reusable-workflow.yaml`: Reusable Workflowテンプレート

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
