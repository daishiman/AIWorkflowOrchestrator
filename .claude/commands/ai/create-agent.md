---
description: |
  新しいClaude Codeエージェント（.claude/agents/*.md）を作成する専門コマンド。
  実行は専門エージェントに委譲します。

  🤖 起動エージェント:
  - `.claude/agents/meta-agent-designer.md`: エージェント設計・実装の専門家（マービン・ミンスキー『心の社会』に基づく単一責任設計）

  ⚙️ このコマンドの設定:
  - argument-hint: [agent-name] [specialty]
  - allowed-tools: Task（エージェント起動のみ）
  - model: opus

  トリガーキーワード: agent, エージェント, meta-agent, ペルソナ設計, マルチエージェント
argument-hint: "[agent-name] [specialty]"
allowed-tools:
  - Task
model: opus
---

# エージェント作成

## 目的

`.claude/commands/ai/create-agent.md` の入力を受け取り、専門エージェントに実行を委譲します。

## エージェント起動フロー

### Phase 1: エージェント設計・実装の専門家（マービン・ミンスキー『心の社会』に基づく単一責任設計）の実行

**目的**: エージェント設計・実装の専門家（マービン・ミンスキー『心の社会』に基づく単一責任設計）に関するタスクを実行し、結果を整理する

**背景**: 専門知識が必要なため専門エージェントに委譲する

**ゴール**: エージェント設計・実装の専門家（マービン・ミンスキー『心の社会』に基づく単一責任設計）の結果と次アクションが提示された状態

**起動エージェント**: `.claude/agents/meta-agent-designer.md`

Task ツールで `.claude/agents/meta-agent-designer.md` を起動:

**コンテキスト**:

- 引数: $ARGUMENTS（[agent-name] [specialty]）

**依頼内容**:

- コマンドの目的に沿って実行する
- 結果と次アクションを提示する

**期待成果物**:

- `docs/00-requirements/18-claude-code-skill-specification.md`

**完了条件**:

- [ ] 主要な結果と根拠が整理されている
- [ ] 次のアクションが提示されている

## 使用例

```bash
/ai:create-agent [agent-name] [specialty]
```
