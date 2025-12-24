# Level 2: Intermediate

## 概要

コマンドの起動メカニズムを専門とするスキル。 ユーザー明示起動、モデル自動起動（SlashCommand Tool）、Extended Thinkingトリガー、 実行フローの完全図解を提供します。

resources/・scripts/・templates/ の活用を前提とした運用を整理します。

## 前提条件

- Level 1 の内容を理解している
- SKILL.md の適用範囲を説明できる

## 詳細ガイド

### 必要な知識・情報
- 主要トピック: 実行フロー図解 / ユーザー明示起動フロー / SlashCommand Tool起動フロー / Extended Thinking トリガー / トリガーキーワード / 明示的トリガー
- 実務指針: SlashCommand Toolによる自動起動を理解したい時 / Extended Thinkingを活用したい時 / コマンド実行フローを設計する時

### 判断基準と検証観点
- 回避事項: アンチパターンや注意点を確認せずに進めることを避ける

### リソース運用
- `resources/execution-flow-diagrams.md`: コマンド実行フロー図解（把握する知識: 実行フロー図解 / ユーザー明示起動フロー / SlashCommand Tool起動フロー）
- `resources/extended-thinking-triggers.md`: Extended Thinkingトリガー設計（把握する知識: Extended Thinking トリガー / トリガーキーワード / 明示的トリガー）
- `resources/requirements-index.md`: 要求仕様の索引（docs/00-requirements と同期）（把握する知識: タスク実行仕様書生成ガイド / Claude Code 3層アーキテクチャ設計仕様書）
- `resources/slashcommand-tool-guide.md`: SlashCommandツール詳細ガイド（把握する知識: SlashCommand Tool完全ガイド / 起動条件 / description最適化）
- `resources/user-explicit-activation.md`: ユーザー明示的起動パターン（把握する知識: ユーザー明示起動 / 基本構文 / $ARGUMENTS の動作）
- `resources/legacy-skill.md`: 旧SKILL.mdの全文（把握する知識: Command Activation Mechanisms / リソース構造 / リソース種別）

### スクリプト運用
- `scripts/log_usage.mjs`: 使用記録・自動評価スクリプト
- `scripts/validate-activation.mjs`: 起動メカニズム検証スクリプト
- `scripts/validate-skill.mjs`: スキル構造検証スクリプト

### テンプレート運用
- `templates/auto-invocation-template.md`: 自動起動コマンドテンプレート
- `templates/extended-thinking-template.md`: Extended Thinking活用テンプレート

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
