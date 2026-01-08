---
description: |
  ローカルエージェント（ファイル監視）のセットアップ。 Chokidarによるファイル監視、PM2プロセス管理、クラウドAPI連携を構築します。
  実行は専門エージェントに委譲します。

  🤖 起動エージェント:
  - `.claude/agents/local-watcher.md`: ファイル監視専門エージェント
  - `.claude/agents/local-sync.md`: クラウド同期専門エージェント（補助）
  - `.claude/agents/process-mgr.md`: PM2プロセス管理専門エージェント（補助）

  ⚙️ このコマンドの設定:
  - allowed-tools: Task（エージェント起動のみ）
  - model: sonnet

  トリガーキーワード: local agent, file watching, chokidar, pm2, local sync
allowed-tools:
  - Task
model: sonnet
---

# ローカルエージェントセットアップコマンド

## 目的

`.claude/commands/ai/setup-local-agent.md` の入力を受け取り、専門エージェントに実行を委譲します。

## エージェント起動フロー

### Phase 1: ファイル監視専門エージェントの実行

**目的**: ファイル監視専門エージェントに関するタスクを実行し、結果を整理する

**背景**: 専門知識が必要なため専門エージェントに委譲する

**ゴール**: ファイル監視専門エージェントの結果と次アクションが提示された状態

**起動エージェント**: `.claude/agents/local-watcher.md`

Task ツールで `.claude/agents/local-watcher.md` を起動:

**コンテキスト**:

- 引数: なし

**依頼内容**:

- コマンドの目的に沿って実行する
- 結果と次アクションを提示する

**期待成果物**:

- `docs/00-requirements/master_system_design.md`
- `local-agent/src/watcher.ts`
- `local-agent/src/config.ts`
- `local-agent/src/sync.ts`
- `local-agent/ecosystem.config.js`
- `local-agent/package.json`
- `local-agent/src/index.ts`
- `local-agent/.env.example`
- `package.json`
- `.env`
- `.env.example`

**完了条件**:

- [ ] 主要な結果と根拠が整理されている
- [ ] 次のアクションが提示されている

### Phase 2: クラウド同期専門エージェント（補助）の実行

**目的**: クラウド同期専門エージェント（補助）に関するタスクを実行し、結果を整理する

**背景**: 専門知識が必要なため専門エージェントに委譲する

**ゴール**: クラウド同期専門エージェント（補助）の結果と次アクションが提示された状態

**起動エージェント**: `.claude/agents/local-sync.md`

Task ツールで `.claude/agents/local-sync.md` を起動:

**コンテキスト**:

- 引数: なし

**依頼内容**:

- コマンドの目的に沿って実行する
- 結果と次アクションを提示する

**期待成果物**:

- `docs/00-requirements/master_system_design.md`
- `local-agent/src/watcher.ts`
- `local-agent/src/config.ts`
- `local-agent/src/sync.ts`
- `local-agent/ecosystem.config.js`
- `local-agent/package.json`
- `local-agent/src/index.ts`
- `local-agent/.env.example`
- `package.json`
- `.env`
- `.env.example`

**完了条件**:

- [ ] 主要な結果と根拠が整理されている
- [ ] 次のアクションが提示されている

### Phase 3: PM2プロセス管理専門エージェント（補助）の実行

**目的**: PM2プロセス管理専門エージェント（補助）に関するタスクを実行し、結果を整理する

**背景**: 専門知識が必要なため専門エージェントに委譲する

**ゴール**: PM2プロセス管理専門エージェント（補助）の結果と次アクションが提示された状態

**起動エージェント**: `.claude/agents/process-mgr.md`

Task ツールで `.claude/agents/process-mgr.md` を起動:

**コンテキスト**:

- 引数: なし

**依頼内容**:

- コマンドの目的に沿って実行する
- 結果と次アクションを提示する

**期待成果物**:

- `docs/00-requirements/master_system_design.md`
- `local-agent/src/watcher.ts`
- `local-agent/src/config.ts`
- `local-agent/src/sync.ts`
- `local-agent/ecosystem.config.js`
- `local-agent/package.json`
- `local-agent/src/index.ts`
- `local-agent/.env.example`
- `package.json`
- `.env`
- `.env.example`

**完了条件**:

- [ ] 主要な結果と根拠が整理されている
- [ ] 次のアクションが提示されている

## 使用例

```bash
/ai:setup-local-agent
```
