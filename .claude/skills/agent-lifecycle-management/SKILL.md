---
name: agent-lifecycle-management
description: |
  エージェントライフサイクル管理を専門とするスキル。
  起動、実行、状態管理、終了、バージョニング、メンテナンスにより、
  エージェントの継続的な品質を保証します。

  📚 リソース参照:
  このスキルには以下のリソースが含まれています。
  必要に応じて該当するリソースを参照してください:

  - `.claude/skills/agent-lifecycle-management/resources/versioning-guide.md`: バージョニングガイド
  - `.claude/skills/agent-lifecycle-management/templates/lifecycle-template.md`: ライフサイクルテンプレート
  - `.claude/skills/agent-lifecycle-management/scripts/check-lifecycle.mjs`: ライフサイクル検証スクリプト

  専門分野:
  - 起動プロトコル: 初期化、依存関係の確認
  - 実行管理: 状態追跡、進捗監視
  - 終了処理: クリーンアップ、結果報告
  - バージョニング: セマンティックバージョニング、変更管理
  - メンテナンス: 定期レビュー、品質改善

  使用タイミング:
  - エージェントのライフサイクルを設計する時
  - バージョン管理戦略を定義する時
  - メンテナンス計画を策定する時

  Use proactively when designing agent lifecycle or versioning strategies.
version: 1.0.0
---

# Agent Lifecycle Management

## 概要

ライフサイクル管理は、エージェントの起動から終了までの全プロセスを
管理し、継続的な品質を保証する方法論です。

**主要な価値**:

- 明確なライフサイクルにより、動作が予測可能
- バージョニングにより、変更が追跡可能
- メンテナンス計画により、品質が維持される

## ワークフロー

### Phase 1: 起動（Initialization）

**起動プロトコル**:

1. 依存スキルの確認
2. 必要なツールの確認
3. 環境要件の確認
4. 初期状態の設定

### Phase 2: 実行（Execution）

**実行管理**:

- Phase進捗の追跡
- 状態の記録
- エラーハンドリング

### Phase 3: 終了（Termination）

**終了処理**:

1. クリーンアップ
2. 結果の報告
3. ハンドオフ（必要時）
4. ログの記録

### Phase 4: バージョニング

**セマンティックバージョニング**:

- major.minor.patch
- major: 破壊的変更
- minor: 機能追加
- patch: バグ修正

**変更履歴**:

```markdown
| バージョン | 日付       | 変更内容 |
| ---------- | ---------- | -------- |
| 1.1.0      | 2025-11-24 | 機能追加 |
| 1.0.1      | 2025-11-23 | バグ修正 |
| 1.0.0      | 2025-11-22 | 初版     |
```

### Phase 5: メンテナンス

**定期レビュー**:

- 6ヶ月ごとの品質評価
- 陳腐化のチェック
- 改善の実施

## ベストプラクティス

✅ **すべきこと**:

- 明確な起動・終了処理
- セマンティックバージョニング
- 定期的なメンテナンス

❌ **避けるべきこと**:

- 不明確なライフサイクル
- バージョン管理の欠如
- メンテナンスの放置

## 関連スキル

- **agent-quality-standards** (`.claude/skills/agent-quality-standards/SKILL.md`)
- **agent-validation-testing** (`.claude/skills/agent-validation-testing/SKILL.md`)

## 詳細リファレンス

詳細な実装ガイドとツールは以下を参照:

- バージョニングガイド (`resources/versioning-guide.md`)

## コマンドリファレンス

このスキルで使用可能なリソース、スクリプト、テンプレートへのアクセスコマンド:

### リソース読み取り

```bash
# バージョニングガイド
cat .claude/skills/agent-lifecycle-management/resources/versioning-guide.md
```

### 他のスキルのスクリプトを活用

```bash
# エージェント構造検証（agent-structure-designスキルのスクリプトを使用）
node .claude/skills/agent-structure-design/scripts/validate-structure.mjs <agent_file.md>

# 循環依存チェック（agent-dependency-designスキルのスクリプトを使用）
node .claude/skills/agent-dependency-design/scripts/check-circular-deps.mjs <agent_file.md>

# アーキテクチャ検証（agent-architecture-patternsスキルのスクリプトを使用）
node .claude/skills/agent-architecture-patterns/scripts/validate-architecture.mjs <agent_file.md>
```
