---
description: |
  ESLint設定の最適化を行うコマンド。
  実行は専門エージェントに委譲します。

  🤖 起動エージェント:
  - `.claude/agents/code-quality.md`: コード品質・静的解析専門エージェント

  ⚙️ このコマンドの設定:
  - argument-hint: [style-guide]
  - allowed-tools: Task（エージェント起動のみ）
  - model: sonnet

  トリガーキーワード: eslint, linting, code style, コードスタイル, 静的解析
argument-hint: "[style-guide]"
allowed-tools:
  - Task
model: sonnet
---

# ESLint設定

## 目的

`.claude/commands/ai/setup-eslint.md` の入力を受け取り、専門エージェントに実行を委譲します。

## エージェント起動フロー

### Phase 1: コード品質・静的解析専門エージェントの実行

**目的**: コード品質・静的解析専門エージェントに関するタスクを実行し、結果を整理する

**背景**: 専門知識が必要なため専門エージェントに委譲する

**ゴール**: コード品質・静的解析専門エージェントの結果と次アクションが提示された状態

**起動エージェント**: `.claude/agents/code-quality.md`

Task ツールで `.claude/agents/code-quality.md` を起動:

**コンテキスト**:

- 引数: $ARGUMENTS（[style-guide]）

**依頼内容**:

- コマンドの目的に沿って実行する
- 結果と次アクションを提示する

**期待成果物**:

- `.github/workflows/lint.yml`
- `package.json`
- `tsconfig.json`
- `eslint.config.js`

**完了条件**:

- [ ] 主要な結果と根拠が整理されている
- [ ] 次のアクションが提示されている

## 使用例

```bash
/ai:setup-eslint [style-guide]
```
