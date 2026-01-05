---
description: |
  依存パッケージを一括更新するコマンド。
  実行は専門エージェントに委譲します。

  🤖 起動エージェント:
  - `.claude/agents/dep-mgr.md`: 依存関係管理専門エージェント（一括更新・監査）

  ⚙️ このコマンドの設定:
  - argument-hint: [strategy]
  - allowed-tools: Task（エージェント起動のみ）
  - model: sonnet

  トリガーキーワード: update dependencies, upgrade packages, 依存関係更新, パッケージアップグレード
argument-hint: "[strategy]"
allowed-tools:
  - Task
model: sonnet
---

# 依存パッケージ一括更新

## 目的

`.claude/commands/ai/update-dependencies.md` の入力を受け取り、専門エージェントに実行を委譲します。

## エージェント起動フロー

### Phase 1: 依存関係管理専門エージェント（一括更新・監査）の実行

**目的**: 依存関係管理専門エージェント（一括更新・監査）に関するタスクを実行し、結果を整理する

**背景**: 専門知識が必要なため専門エージェントに委譲する

**ゴール**: 依存関係管理専門エージェント（一括更新・監査）の結果と次アクションが提示された状態

**起動エージェント**: `.claude/agents/dep-mgr.md`

Task ツールで `.claude/agents/dep-mgr.md` を起動:

**コンテキスト**:

- 引数: $ARGUMENTS（[strategy]）

**依頼内容**:

- コマンドの目的に沿って実行する
- 結果と次アクションを提示する

**期待成果物**:

- `package.json`
- `pnpm-lock.yaml`
- `package-lock.json`
- `yarn.lock`
- `tsconfig.json`

**完了条件**:

- [ ] 主要な結果と根拠が整理されている
- [ ] 次のアクションが提示されている

## 使用例

```bash
/ai:update-dependencies [strategy]
```
