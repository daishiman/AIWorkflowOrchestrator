---
description: |
  AIプロンプトの最適化を行う専門コマンド。
  実行は専門エージェントに委譲します。

  🤖 起動エージェント:
  - `.claude/agents/prompt-eng.md`: プロンプトエンジニアリング専門エージェント

  ⚙️ このコマンドの設定:
  - argument-hint: [prompt-file]
  - allowed-tools: Task（エージェント起動のみ）
  - model: opus

  トリガーキーワード: prompt, AI, optimization, hallucination, few-shot, .claude/skills/chain-of-thought/SKILL.md
argument-hint: "[prompt-file]"
allowed-tools:
  - Task
model: opus
---

# AIプロンプト最適化コマンド

## 目的

`.claude/commands/ai/optimize-prompts.md` の入力を受け取り、専門エージェントに実行を委譲します。

## エージェント起動フロー

### Phase 1: プロンプトエンジニアリング専門エージェントの実行

**目的**: プロンプトエンジニアリング専門エージェントに関するタスクを実行し、結果を整理する

**背景**: 専門知識が必要なため専門エージェントに委譲する

**ゴール**: プロンプトエンジニアリング専門エージェントの結果と次アクションが提示された状態

**起動エージェント**: `.claude/agents/prompt-eng.md`

Task ツールで `.claude/agents/prompt-eng.md` を起動:

**コンテキスト**:

- 引数: $ARGUMENTS（[prompt-file]）

**依頼内容**:

- コマンドの目的に沿って実行する
- 結果と次アクションを提示する

**期待成果物**:

- `docs/reports/optimize-prompts.md`

**完了条件**:

- [ ] 主要な結果と根拠が整理されている
- [ ] 次のアクションが提示されている

## 使用例

```bash
/ai:optimize-prompts [prompt-file]
```
