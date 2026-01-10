# Level 2: Intermediate

## 概要

エージェントライフサイクル管理を専門とするスキル。 起動、実行、状態管理、終了、バージョニング、メンテナンスにより、 エージェントの継続的な品質を保証します。

resources/・scripts/・templates/ の活用を前提とした運用を整理します。

## 前提条件

- Level 1 の内容を理解している
- SKILL.md の適用範囲を説明できる

## 詳細ガイド

### 必要な知識・情報
- 主要トピック: エージェント設計の基本フロー / .claude/skills/agent-architecture-patterns/SKILL.mdを参照するタイミング / .claude/skills/agent-structure-design/SKILL.mdを参照するタイミング / ローカルエージェント仕様 / Versioning Guide / セマンティックバージョニング
- 実務指針: エージェントのライフサイクルを設計する時 / バージョン管理戦略を定義する時 / メンテナンス計画を策定する時

### 判断基準と検証観点
- 回避事項: アンチパターンや注意点を確認せずに進めることを避ける

### リソース運用
- `resources/execution-protocol.md`: execution-protocol の詳細ガイド（把握する知識: エージェント設計の基本フロー / .claude/skills/agent-architecture-patterns/SKILL.mdを参照するタイミング / .claude/skills/agent-structure-design/SKILL.mdを参照するタイミング）
- `resources/requirements-index.md`: 要求仕様の索引（docs/00-requirements と同期）（把握する知識: ローカルエージェント仕様）
- `resources/versioning-guide.md`: バージョニングガイド（把握する知識: Versioning Guide / セマンティックバージョニング / 形式）
- `resources/legacy-skill.md`: 旧SKILL.mdの全文（把握する知識: Agent Lifecycle Management / リソース読み取り）

### スクリプト運用
- `scripts/check-lifecycle.mjs`: ライフサイクル検証スクリプト
- `scripts/log_usage.mjs`: 使用記録・自動評価スクリプト
- `scripts/validate-skill.mjs`: スキル構造検証スクリプト

### テンプレート運用
- `templates/lifecycle-template.md`: ライフサイクルテンプレート

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
