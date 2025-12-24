---
description: |
  新しい依存パッケージを安全に追加するコマンド。
  実行は専門エージェントに委譲します。

  🤖 起動エージェント:
  - `.claude/agents/dep-mgr.md`: 依存関係管理専門エージェント（パッケージ追加・監査）

  ⚙️ このコマンドの設定:
  - argument-hint: [package-name] [--dev]
  - allowed-tools: Task（エージェント起動のみ）
  - model: sonnet

  トリガーキーワード: add package, install dependency, 依存関係追加, パッケージインストール, ライブラリ追加
argument-hint: "[package-name] [--dev]"
allowed-tools:
  - Task
model: sonnet
---

# 依存パッケージ追加

## 目的

`.claude/commands/ai/add-dependency.md` の入力を受け取り、専門エージェントに実行を委譲します。

## エージェント起動フロー

### Phase 1: 依存関係管理専門エージェント（パッケージ追加・監査）の実行

**目的**: 依存関係管理専門エージェント（パッケージ追加・監査）に関するタスクを実行し、結果を整理する

**背景**: 専門知識が必要なため専門エージェントに委譲する

**ゴール**: 依存関係管理専門エージェント（パッケージ追加・監査）の結果と次アクションが提示された状態

**起動エージェント**: `.claude/agents/dep-mgr.md`

Task ツールで `.claude/agents/dep-mgr.md` を起動:

**コンテキスト**:

- 引数: $ARGUMENTS（[package-name] [--dev]）

**依頼内容**:

- コマンドの目的に沿って実行する
- 結果と次アクションを提示する

**期待成果物**:

- `package.json`
- `pnpm-lock.yaml`
- `package-lock.json`
- `yarn.lock`

**完了条件**:

- [ ] 主要な結果と根拠が整理されている
- [ ] 次のアクションが提示されている

## 使用例

```bash
/ai:add-dependency [package-name] [--dev]
```
