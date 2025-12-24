---
description: |
  新しいClaude Codeスキル（.claude/skills/*/SKILL.md）を作成する専門コマンド。 skill-librarian エージェントを起動し、SECIモデル（暗黙知→形式知変換）に基づいた Progressive Disclosure方式の実運用レベルのスキルファイルを生成します。
  実行は専門エージェントに委譲します。

  🤖 起動エージェント:
  - `.claude/agents/skill-librarian.md`: 知識体系化・スキル作成専門

  ⚙️ このコマンドの設定:
  - argument-hint: [skill-name]
  - allowed-tools: Task（エージェント起動のみ）
  - model: opus

  トリガーキーワード: skill, スキル作成, 知識体系化, ベストプラクティス, 形式知化
argument-hint: "[skill-name]"
allowed-tools:
  - Task
model: opus
---

# スキル作成コマンド

## 目的

`.claude/commands/ai/create-skill.md` の入力を受け取り、専門エージェントに実行を委譲します。

## エージェント起動フロー

### Phase 1: 知識体系化・スキル作成専門の実行

**目的**: 知識体系化・スキル作成専門に関するタスクを実行し、結果を整理する

**背景**: 専門知識が必要なため専門エージェントに委譲する

**ゴール**: 知識体系化・スキル作成専門の結果と次アクションが提示された状態

**起動エージェント**: `.claude/agents/skill-librarian.md`

Task ツールで `.claude/agents/skill-librarian.md` を起動:

**コンテキスト**:

- 引数: $ARGUMENTS（[skill-name]）

**依頼内容**:

- コマンドの目的に沿って実行する
- 結果と次アクションを提示する

**期待成果物**:

- `docs/reports/create-skill.md`

**完了条件**:

- [ ] 主要な結果と根拠が整理されている
- [ ] 次のアクションが提示されている

## 使用例

```bash
/ai:create-skill [skill-name]
```
