---
name: .claude/skills/agent-persona-design/SKILL.md
description: |
  エージェントペルソナ設計を専門とするスキル。実在する専門家の思想をエージェントに移植します。

  📖 参照書籍:
  - 『The Society of Mind（心の社会）』（Marvin Minsky）: 小さなエージェント群による知性実現
  - 『Thinking, Fast and Slow（ファスト&スロー）』（Daniel Kahneman）: 専門家の思考パターンモデリング

  📚 リソース参照:
  - `resources/expert-modeling-guide.md`: 専門家モデリングガイド
  - `templates/persona-template.md`: ペルソナ設計テンプレート
  - `scripts/analyze-persona.mjs`: ペルソナ分析スクリプト
  - `scripts/log_usage.mjs`: 使用記録・自動レベルアップスクリプト

  Use proactively when designing agent personas or selecting expert models.
version: 2.0.0
level: 2
last_updated: 2025-12-23
references:
  - book: "The Society of Mind"
    author: "Marvin Minsky"
    concepts:
      - "小さな特化型エージェントの集合体としての知性"
      - "単一責任原則"
  - book: "Thinking, Fast and Slow"
    author: "Daniel Kahneman"
    concepts:
      - "専門家の直感的判断パターン"
      - "System 1/System 2思考のモデル化"
---

# Agent Persona Design

## 概要

エージェントペルソナ設計は、実在する専門家をモデルとするか、
明確な役割定義に基づいてエージェントの人格を設計する方法論です。

**主要な価値**:

- 専門家の思想により、一貫性のある判断が可能
- 明確な役割により、責務が明確化
- 設計原則により、実装の指針が提供される

## ワークフロー

### Phase 1: 設計方針の決定

**目的**: ペルソナ設計の方針を決定する

**背景**: 専門分野によって専門家モデルベースか役割ベースかが異なる

**ゴール**: 設計方針が決定され、次フェーズに進める状態

**アクション**:

1. 対象ドメインに明確な第一人者が存在するか調査
2. 存在する場合 → 専門家モデルベース設計
3. 存在しない場合 → 役割ベース設計

**期待成果物**:

- 設計方針の決定事項
- 専門家候補リスト（専門家モデルの場合）

**完了条件**:

- [ ] 設計方針が決定されている
- [ ] 専門家が特定されている（専門家モデルの場合）

---

### Phase 2: ペルソナ設計

**目的**: エージェントのペルソナを設計する

**背景**: ペルソナが明確でないと、エージェントの判断に一貫性がなくなる

**ゴール**: ペルソナが完全に定義された状態

**アクション**:

専門家モデルベースの場合:

1. 専門家の代表的著作（1-3冊）を特定
2. 核心概念を抽出（3-5項目）
3. エージェント動作への適用方法を定義

役割ベースの場合:

1. 「あなたは○○です」で始まる明確な役割を定義
2. 専門分野を列挙（3-5項目）
3. 責任範囲と制約を明確化

**期待成果物**:

- ペルソナ定義書
- 設計原則リスト
- 制約リスト

**完了条件**:

- [ ] ペルソナが明確に定義されている
- [ ] 参照書籍が特定されている（専門家モデルの場合）
- [ ] 設計原則が定義されている

---

### Phase 3: 検証と最適化

**目的**: ペルソナ設計を検証し、最適化する

**背景**: 設計の一貫性と適用可能性を確認する必要がある

**ゴール**: ペルソナが検証され、適用可能な状態

**アクション**:

1. ペルソナの一貫性を確認
2. 単一責任原則を満たしているか検証
3. 必要に応じて `scripts/analyze-persona.mjs` を実行

**期待成果物**:

- 検証レポート
- 最適化されたペルソナ定義

**完了条件**:

- [ ] ペルソナの一貫性が確認されている
- [ ] 単一責任原則を満たしている
- [ ] エージェントとして適用可能

---

## ベストプラクティス

### すべきこと

- 第一人者を選定する（専門家モデルの場合）
- 代表的著作から核心概念を抽出する
- 思想に一貫性を持たせる
- 明確な役割定義を行う（役割ベースの場合）
- 具体的な専門分野を列挙する
- 測定可能な責任範囲を設定する

### 避けるべきこと

- マイナーな専門家の選定
- 思想の歪曲
- 無関係な原則の追加
- 曖昧な役割定義
- 抽象的な専門分野
- 不明確な責任範囲

---

## 関連スキル

- **.claude/skills/agent-structure-design/SKILL.md** (`.claude/skills/agent-structure-design/SKILL.md`): YAML Frontmatter・ワークフロー設計
- **.claude/skills/agent-architecture-patterns/SKILL.md** (`.claude/skills/agent-architecture-patterns/SKILL.md`): アーキテクチャパターンと設計原則

## コマンドリファレンス

このスキルで使用可能なリソース・スクリプトへのアクセス方法:

### リソース参照

```bash
# 専門家モデリングガイド
cat .claude/skills/agent-persona-design/resources/expert-modeling-guide.md
```

### スクリプト実行

```bash
# ペルソナ分析スクリプト
node .claude/skills/agent-persona-design/scripts/analyze-persona.mjs <agent_file.md>

# 使用記録スクリプト
node .claude/skills/agent-persona-design/scripts/log_usage.mjs \
  --result success \
  --phase "Phase2" \
  --agent "meta-agent-designer"
```

### テンプレート参照

```bash
# ペルソナテンプレート
cat .claude/skills/agent-persona-design/templates/persona-template.md
```

## 変更履歴

詳細な変更履歴は `CHANGELOG.md` を参照してください。

| バージョン | 日付       | 変更内容                 |
| ---------- | ---------- | ------------------------ |
| 2.0.0      | 2025-12-23 | 参照書籍フィールドを追加 |
| 1.0.0      | 2025-12-11 | 初版作成                 |
