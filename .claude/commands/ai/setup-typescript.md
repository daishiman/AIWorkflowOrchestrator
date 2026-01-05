---
description: |
  TypeScript設定の最適化を行うコマンド。
  実行は専門エージェントに委譲します。

  🤖 起動エージェント:
  - `.claude/agents/schema-def.md`: 型定義・スキーマ専門エージェント

  ⚙️ このコマンドの設定:
  - argument-hint: [strictness]
  - allowed-tools: Task（エージェント起動のみ）
  - model: sonnet

  トリガーキーワード: typescript, tsconfig, 型チェック, 型安全性
argument-hint: "[strictness]"
allowed-tools:
  - Task
model: sonnet
---

# TypeScript設定

## 目的

`.claude/commands/ai/setup-typescript.md` の入力を受け取り、専門エージェントに実行を委譲します。

## エージェント起動フロー

### Phase 1: 型定義・スキーマ専門エージェントの実行

**目的**: 型定義・スキーマ専門エージェントに関するタスクを実行し、結果を整理する

**背景**: 専門知識が必要なため専門エージェントに委譲する

**ゴール**: 型定義・スキーマ専門エージェントの結果と次アクションが提示された状態

**起動エージェント**: `.claude/agents/schema-def.md`

Task ツールで `.claude/agents/schema-def.md` を起動:

**コンテキスト**:

- 引数: $ARGUMENTS（[strictness]）

**依頼内容**:

- コマンドの目的に沿って実行する
- 結果と次アクションを提示する

**期待成果物**:

- `.github/workflows/typecheck.yml`
- `tsconfig.json`

**完了条件**:

- [ ] 主要な結果と根拠が整理されている
- [ ] 次のアクションが提示されている

## 使用例

```bash
/ai:setup-typescript [strictness]
```
