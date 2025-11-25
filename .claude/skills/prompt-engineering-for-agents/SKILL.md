---
name: prompt-engineering-for-agents
description: |
  エージェント向けプロンプトエンジニアリングを専門とするスキル。
  System Prompt設計、Few-Shot Examples、Role Prompting技術により、
  高品質なエージェント動作を実現します。

  専門分野:
  - System Prompt設計: 構造化と明確性
  - Role Prompting: 役割付与による性能向上
  - Few-Shot Examples: 具体例による学習
  - コンテキスト強化: 役割に関連する知識ベース提供

  使用タイミング:
  - System Promptを設計する時
  - エージェントの動作を最適化する時
  - 具体例を追加する時

  Use proactively when designing system prompts or optimizing agent behavior.
version: 1.0.0
---

# Prompt Engineering for Agents

## 概要

プロンプトエンジニアリングは、AIエージェントの動作を最適化するための
System Prompt設計技術です。

**主要な価値**:
- 明確な役割付与により、一貫性が向上
- 具体例により、期待される動作が明確化
- 構造化により、理解しやすさが向上

## ワークフロー

### Phase 1: Role Prompting

**基本形式**:
```markdown
あなたは **[役割名]** です。

[役割の説明]
```

**効果**:
- 役割の明確化
- 一貫性のある判断
- 専門性の向上

### Phase 2: System Prompt構造化

**推奨構造**:
1. 役割定義
2. 専門分野
3. 責任範囲
4. 制約
5. タスク実行時の動作
6. ツール使用方針
7. 品質基準

### Phase 3: Few-Shot Examples

**提供方法**:
```markdown
## 例

### 例1: [シナリオ]
入力: [入力例]
出力: [期待される出力]

### 例2: [シナリオ]
...
```

**推奨数**: 2-3個（最小限）

### Phase 4: コンテキスト強化

**方法**:
- スキル参照による知識提供
- プロジェクト固有ドキュメントへの参照
- 判断基準の明示

## ベストプラクティス

✅ **すべきこと**:
- 明確な役割定義
- 構造化されたSystem Prompt
- 最小限の具体例

❌ **避けるべきこと**:
- 曖昧な役割
- 非構造化なPrompt
- 過度な具体例

## 関連スキル

- **agent-persona-design** (`.claude/skills/agent-persona-design/SKILL.md`)
- **agent-structure-design** (`.claude/skills/agent-structure-design/SKILL.md`)

## 詳細リファレンス

詳細な実装ガイドとツールは以下を参照:
- System Promptパターン (`resources/system-prompt-patterns.md`)

## コマンドリファレンス

このスキルで使用可能なリソース、テンプレートへのアクセスコマンド:

### リソース読み取り

```bash
# System Promptパターンのガイドを読み取る
cat .claude/skills/prompt-engineering-for-agents/resources/system-prompt-patterns.md
```

### 他のスキルのスクリプトを活用

```bash
# エージェント構造検証
node .claude/skills/agent-structure-design/scripts/validate-structure.mjs <agent_file.md>

# トークン見積もり
node .claude/skills/context-optimization/scripts/estimate-tokens.mjs <file.md>

# トークン使用量計算
node .claude/skills/progressive-disclosure/scripts/calculate-token-usage.mjs <file.md>

# 知識ドキュメントの品質検証
node .claude/skills/knowledge-management/scripts/validate-knowledge.mjs <file.md>
```

## 変更履歴

| バージョン | 日付 | 変更内容 |
|-----------|------|---------|
| 1.0.0 | 2025-11-24 | 初版作成 |
