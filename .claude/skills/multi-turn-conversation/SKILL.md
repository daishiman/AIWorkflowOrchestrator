---
name: multi-turn-conversation
description: |
  複数ターンに渡る対話の設計と状態管理を実現するスキル。エージェント・ユーザー間の対話フロー、コンテキスト管理、ターン管理を通じて、一貫性のある対話体験を構築します。

  Anchors:
  • The Pragmatic Programmer / 適用: ターン設計と状態管理の手順設計 / 目的: 対話フローの体系的な構築
  • Conversation Design Pattern / 適用: マルチターン対話パターン / 目的: 実務的な対話フロー実装

  Trigger:
  Use when designing multi-turn conversation flows, implementing dialogue state management, tracking user intent across turns, managing conversation context, or ensuring consistency in long-running dialogues.
  Keywords: multi-turn, dialogue, conversation flow, context management, state tracking, turn management, conversation design

allowed-tools:
  - Read
  - Write
  - Edit
  - Bash
  - Grep

version: 1.2.0
level: 1
last_updated: 2025-12-31
---

# Multi Turn Conversation

## 概要

複数ターンに渡る対話の設計と状態管理を実現するスキル。エージェント・ユーザー間の対話フロー、コンテキスト管理、ターン管理を通じて、一貫性のある対話体験を構築します。このスキルは以下を実現します：

- **ターン管理**: ユーザーメッセージとエージェント応答の順序と依存関係を管理
- **コンテキスト保持**: 対話全体の履歴と現在の文脈を維持
- **状態追跡**: ユーザー意図、タスク進捗、メタ情報の一貫性確保
- **応答整合性**: 過去の発言との矛盾を防止し、連続性を保証
- **流動的遷移**: 対話パターンの柔軟な状態遷移設計

## ワークフロー

### Phase 1: 目的と前提の整理

**目的**: 対話設計タスクの目的と前提条件を明確にする

**アクション**:

1. 対話の目的とユースケースを確認（サポートチャット、ウィザード、分析等）
2. `references/Level1_basics.md` で対話パターンの基礎を理解
3. 必要なレベルのリソース（Level 2-4）を特定
4. コンテキスト保持方式と状態管理の戦略を選定

### Phase 2: スキル適用と設計実装

**目的**: マルチターン対話の設計・実装を進める

**アクション**:

1. `references/Level2_intermediate.md` で実務パターンを確認
2. 対話フロー図またはメッセージスキーマを設計
3. ターン管理メカニズム（メモリ・DB・キャッシュ等）を選定
4. コンテキスト更新ロジックを実装
5. 関連パターンガイドを参照しながら実装を進行
6. `assets/multi-turn-template.md` でテンプレート確認

### Phase 3: 検証と記録

**目的**: 成果物の検証と実行記録の保存

**アクション**:

1. 対話フローの一貫性と正確性を確認
2. エッジケース（コンテキスト喪失、超長対話等）への対応を検証
3. `scripts/validate-skill.mjs` でスキル構造を確認
4. `scripts/log_usage.mjs` を実行して使用記録を保存

## ベストプラクティス

### すべきこと

- **ターン番号管理**: 各メッセージにターンIDを付与し、順序を明確化
- **コンテキスト参照**: 最新N個の対話ターンを常に参照可能な構造にする
- **意図の明示**: ユーザー意図を明確に解析し、状態に保存
- **境界の設定**: 超長対話時のコンテキスト折りたたみやサマリー化を実装
- **エラーハンドリング**: コンテキスト喪失時のフォールバック機構を用意
- **監査ログ**: 対話履歴を完全に記録して問題追跡可能にする

### 避けるべきこと

- グローバル状態への直接アクセス（状態オブジェクトを通じた管理）
- ターン情報の削除（監査要件との矛盾）
- ユーザー意図の同期ズレ（毎ターン明示的に更新）
- コンテキスト無制限保持（メモリ圧迫へのリスク）
- 仮定に基づくユーザー状態操作（常に確認メッセージを送信）

## Task仕様ナビ

| Task                       | フェーズ  | 関連リソース                      | スクリプト         | テンプレート                |
| -------------------------- | --------- | --------------------------------- | ------------------ | --------------------------- |
| 対話パターンの基礎習得     | Phase 1   | Level1_basics.md                  | validate-skill.mjs | -                           |
| 対話フローの設計           | Phase 2   | Level2_intermediate.md            | validate-skill.mjs | multi-turn-template.md      |
| コンテキスト管理機構の実装 | Phase 2   | context-patterns.md               | validate-skill.mjs | context-management-guide.md |
| ターン状態管理の構築       | Phase 2   | state-management-guide.md         | validate-skill.mjs | state-machine-template.md   |
| 複雑対話シナリオへの適用   | Phase 2   | Level3_advanced.md, edge-cases.md | validate-skill.mjs | -                           |
| エッジケース対応           | Phase 2   | error-handling-patterns.md        | validate-skill.mjs | -                           |
| 検証と記録                 | Phase 3   | -                                 | log_usage.mjs      | -                           |
| ベストプラクティス確認     | Phase 1-3 | Level4_expert.md                  | -                  | -                           |

## リソース参照

### 学習リソース

| リソース                                | 説明                                          | 対象         |
| --------------------------------------- | --------------------------------------------- | ------------ |
| `references/Level1_basics.md`           | マルチターン対話の基礎パターン                | 初心者       |
| `references/Level2_intermediate.md`     | 実務的な対話フロー設計パターン                | 実務者       |
| `references/Level3_advanced.md`         | 複雑なシナリオへの応用と最適化                | 上級者       |
| `references/Level4_expert.md`           | ベストプラクティスとアンチパターン            | エキスパート |
| `references/context-patterns.md`        | コンテキスト管理パターン集                    | Phase 2      |
| `references/state-management-guide.md`  | ユーザー意図と対話状態の管理ガイド            | Phase 2      |
| `references/edge-cases.md`              | エッジケースと対応パターン                    | Phase 2      |
| `references/error-handling-patterns.md` | エラーハンドリングと復帰パターン              | Phase 2      |
| `references/requirements-index.md`      | 要求仕様の索引（docs/00-requirements と同期） | 全レベル     |

### 実行スクリプト

```bash
# スキル構造の検証
node .claude/skills/multi-turn-conversation/scripts/validate-skill.mjs

# 使用記録の保存
node .claude/skills/multi-turn-conversation/scripts/log_usage.mjs --task <task-name>

# リソースの確認
cat .claude/skills/multi-turn-conversation/references/Level1_basics.md
cat .claude/skills/multi-turn-conversation/references/Level2_intermediate.md
cat .claude/skills/multi-turn-conversation/references/Level3_advanced.md
cat .claude/skills/multi-turn-conversation/references/Level4_expert.md
```

### テンプレート

```bash
# テンプレートの確認
cat .claude/skills/multi-turn-conversation/assets/multi-turn-template.md
cat .claude/skills/multi-turn-conversation/assets/context-management-guide.md
cat .claude/skills/multi-turn-conversation/assets/state-machine-template.md
```

## 変更履歴

| Version | Date       | Changes                                                                |
| ------- | ---------- | ---------------------------------------------------------------------- |
| 1.1.0   | 2025-12-31 | 18-skills.md仕様に完全準拠。Anchors/Triggers実装、Task仕様ナビ追加完了 |
| 1.0.0   | 2025-12-24 | 初版リリース。スキル基本構造の定義                                     |
