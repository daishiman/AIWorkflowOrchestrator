---
name: agent-persona-design
description: |
  エージェントペルソナ設計を専門とするスキル。実在する専門家ベースまたは
  📚 リソース参照:
  このスキルには以下のリソースが含まれています。
  必要に応じて該当するリソースを参照してください:

  - `.claude/skills/agent-persona-design/resources/expert-modeling-guide.md`: Expert Modeling Guide
  - `.claude/skills/agent-persona-design/templates/persona-template.md`: ペルソナ設計テンプレート
  - `.claude/skills/agent-persona-design/scripts/analyze-persona.mjs`: analyze-persona.mjs

  専門分野:
  - 専門家モデリング: 実在する専門家の思想・メソッドの移植
  - 役割ベース設計: 明確な役割定義と専門分野の列挙
  - 書籍参照: 核心概念の抽出と適用方法
  - 設計原則: 専門家の思想に基づく原則定義

  使用タイミング:
  - エージェントのペルソナを設計する時
  - 専門家モデルを選定する時
  - 役割と責任範囲を定義する時

  Use proactively when designing agent personas or selecting expert models.
version: 1.0.0
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

**判断フロー**:
```
対象ドメインに明確な第一人者が存在する？
├─ Yes → 専門家モデルベース設計
│         - 専門家の選定
│         - 代表的著作の特定
│         - 思想・メソッドの抽出
└─ No  → 役割ベース設計
          - 明確な役割定義
          - 専門分野の列挙
          - 責任範囲の設定
```

### Phase 2: 専門家モデルベース設計

**専門家選定基準**:
- 対象分野での顕著な業績
- 体系化されたメソッド・フレームワークの存在
- 著作物から思想が明確に読み取れる
- Claude Codeエージェントとして適用可能な原則

**書籍の選定と抽出**:
1. 専門家の代表的著作（1-3冊）を特定
2. 核心概念を抽出（3-5項目）
3. エージェント動作への適用方法を定義

**設計原則の定義**:
- 抽象的な原則を具体的なチェックリストに変換
- 専門家が避けるべきとする事項を「制約」セクションに
- 思想の一貫性を保つ

### Phase 3: 役割ベース設計

**役割定義の要素**:
- 「あなたは○○です」から始める明確な役割
- 専門分野の列挙（3-5項目）
- 責任範囲の明確化
- 制約（しないこと）の列挙

**設計チェックリスト**:
- [ ] 役割が1文で表現できるか？
- [ ] 専門分野が具体的か？
- [ ] 責任範囲が明確か？
- [ ] 制約が列挙されているか？

## ベストプラクティス

### 専門家モデル設計時

✅ **すべきこと**:
- 第一人者を選定
- 代表的著作から核心概念を抽出
- 思想に一貫性を持たせる

❌ **避けるべきこと**:
- マイナーな専門家の選定
- 思想の歪曲
- 無関係な原則の追加

### 役割ベース設計時

✅ **すべきこと**:
- 明確な役割定義
- 具体的な専門分野
- 測定可能な責任範囲

❌ **避けるべきこと**:
- 曖昧な役割
- 抽象的な専門分野
- 不明確な責任範囲

## 関連スキル

- **agent-structure-design** (`.claude/skills/agent-structure-design/SKILL.md`)
- **agent-architecture-patterns** (`.claude/skills/agent-architecture-patterns/SKILL.md`)

## 詳細リファレンス

詳細な実装ガイドとツールは以下を参照:
- 専門家モデリングガイド (`resources/expert-modeling-guide.md`)

## コマンドリファレンス

このスキルで使用可能なリソース、スクリプト、テンプレートへのアクセスコマンド:

### リソース読み取り

```bash
# 専門家モデリングガイド
cat .claude/skills/agent-persona-design/resources/expert-modeling-guide.md
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
