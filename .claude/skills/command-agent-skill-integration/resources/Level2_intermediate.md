# Level 2: Intermediate

## 概要

コマンド、エージェント、スキルの統合を専門とするスキル。 三位一体の概念、コマンド→エージェント起動パターン、コマンド→スキル参照パターン、 複合ワークフローの設計を提供します。

resources/・scripts/・templates/ の活用を前提とした運用を整理します。

## 前提条件

- Level 1 の内容を理解している
- SKILL.md の適用範囲を説明できる

## 詳細ガイド

### 必要な知識・情報
- 主要トピック: Command → Agent統合パターン / 基本概念 / なぜコマンドからエージェントを起動するのか？ / 明示的参照構文 / Step N: Load Best Practices / 三位一体統合の価値
- 実務指針: コマンドからエージェントを起動したい時 / コマンド内でスキルを参照したい時 / Command-Agent-Skillの協調ワークフローを設計する時

### 判断基準と検証観点
- 回避事項: アンチパターンや注意点を確認せずに進めることを避ける

### リソース運用
- `resources/command-to-agent-patterns.md`: コマンドからエージェント呼び出しパターン（把握する知識: Command → Agent統合パターン / 基本概念 / なぜコマンドからエージェントを起動するのか？）
- `resources/command-to-skill-patterns.md`: コマンドからスキル参照パターン（把握する知識: 基本概念 / 明示的参照構文 / Step N: Load Best Practices）
- `resources/composite-workflows.md`: 複合ワークフロー設計（把握する知識: 三位一体統合の価値 / 完全統合がもたらすもの / 構造）
- `resources/trinity-architecture.md`: コマンド・エージェント・スキル三位一体アーキテクチャ（把握する知識: 三位一体アーキテクチャ（Trinity Architecture） / アーキテクチャ図 / 三位一体の3つの役割）
- `resources/legacy-skill.md`: 旧SKILL.mdの全文（把握する知識: リソース構造 / リソース種別 / いつ使うか）

### スクリプト運用
- `scripts/log_usage.mjs`: 使用記録・自動評価スクリプト
- `scripts/validate-integration.mjs`: エージェント参照・スキル参照・連携パターンの正確性検証とTrinity Architectureの統合チェック
- `scripts/validate-skill.mjs`: スキル構造検証スクリプト

### テンプレート運用
- `templates/agent-invocation-template.md`: エージェント起動テンプレート
- `templates/composite-workflow-template.md`: 複合ワークフローテンプレート
- `templates/skill-reference-template.md`: スキル参照テンプレート

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
