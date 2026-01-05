---
description: |
  .env.exampleファイルの作成・更新を行うコマンド。
  実行は専門エージェントに委譲します。

  🤖 起動エージェント:
  - `.claude/agents/secret-mgr.md`: 環境変数管理・セキュリティ専門

  ⚙️ このコマンドの設定:
  - allowed-tools: Task（エージェント起動のみ）
  - model: sonnet

  トリガーキーワード: env file, environment variables, .env.example, 環境変数, 設定ファイル
allowed-tools:
  - Task
model: sonnet
---

# .env.exampleファイル作成

## 目的

`.claude/commands/ai/create-env-file.md` の入力を受け取り、専門エージェントに実行を委譲します。

## エージェント起動フロー

### Phase 1: 環境変数管理・セキュリティ専門の実行

**目的**: 環境変数管理・セキュリティ専門に関するタスクを実行し、結果を整理する

**背景**: 専門知識が必要なため専門エージェントに委譲する

**ゴール**: 環境変数管理・セキュリティ専門の結果と次アクションが提示された状態

**起動エージェント**: `.claude/agents/secret-mgr.md`

Task ツールで `.claude/agents/secret-mgr.md` を起動:

**コンテキスト**:

- 引数: なし

**依頼内容**:

- コマンドの目的に沿って実行する
- 結果と次アクションを提示する

**期待成果物**:

- `docs/environment-setup.md`
- `docs/app/building-your-application/configuring/environment-variables`
- `.env`
- `.env.example`

**完了条件**:

- [ ] 主要な結果と根拠が整理されている
- [ ] 次のアクションが提示されている

## 使用例

```bash
/ai:create-env-file
```
