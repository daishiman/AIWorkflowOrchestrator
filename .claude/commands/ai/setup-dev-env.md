---
description: |
  プロジェクトの開発環境を完全セットアップするコマンド。
  実行は専門エージェントに委譲します。

  🤖 起動エージェント:
  - `.claude/agents/dep-mgr.md`: 依存パッケージ・モノレポ管理（Phase 1）
  - `.claude/agents/hook-master.md`: Git/Claude Code hooks設定（Phase 2）
  - `.claude/agents/devops-eng.md`: 設定ファイル・Docker・Railway統合（Phase 3）

  ⚙️ このコマンドの設定:
  - allowed-tools: Task（エージェント起動のみ）
  - model: sonnet

  トリガーキーワード: setup, environment, dev-env, 開発環境, 初期化, pnpm
allowed-tools:
  - Task
model: sonnet
---

# 開発環境セットアップ

## 目的

`.claude/commands/ai/setup-dev-env.md` の入力を受け取り、専門エージェントに実行を委譲します。

## エージェント起動フロー

### Phase 1: 依存パッケージ・モノレポ管理（Phase 1）の実行

**目的**: 依存パッケージ・モノレポ管理（Phase 1）に関するタスクを実行し、結果を整理する

**背景**: 専門知識が必要なため専門エージェントに委譲する

**ゴール**: 依存パッケージ・モノレポ管理（Phase 1）の結果と次アクションが提示された状態

**起動エージェント**: `.claude/agents/dep-mgr.md`

Task ツールで `.claude/agents/dep-mgr.md` を起動:

**コンテキスト**:

- 引数: なし

**依頼内容**:

- コマンドの目的に沿って実行する
- 結果と次アクションを提示する

**期待成果物**:

- `src/shared/infrastructure/database/schema.ts`
- `local-agent/ecosystem.config.js`
- `package.json`
- `pnpm-lock.yaml`
- `tsconfig.json`
- `eslint.config.js`
- `.prettierrc`
- `pnpm-workspace.yaml`
- `vitest.config.ts`
- `drizzle.config.ts`
- `railway.json`
- `.env`
- `.env.example`
- `Dockerfile`
- `docker-compose.yml`

**完了条件**:

- [ ] 主要な結果と根拠が整理されている
- [ ] 次のアクションが提示されている

### Phase 2: Git/Claude Code hooks設定（Phase 2）の実行

**目的**: Git/Claude Code hooks設定（Phase 2）に関するタスクを実行し、結果を整理する

**背景**: 専門知識が必要なため専門エージェントに委譲する

**ゴール**: Git/Claude Code hooks設定（Phase 2）の結果と次アクションが提示された状態

**起動エージェント**: `.claude/agents/hook-master.md`

Task ツールで `.claude/agents/hook-master.md` を起動:

**コンテキスト**:

- 引数: なし

**依頼内容**:

- コマンドの目的に沿って実行する
- 結果と次アクションを提示する

**期待成果物**:

- `src/shared/infrastructure/database/schema.ts`
- `local-agent/ecosystem.config.js`
- `package.json`
- `pnpm-lock.yaml`
- `tsconfig.json`
- `eslint.config.js`
- `.prettierrc`
- `pnpm-workspace.yaml`
- `vitest.config.ts`
- `drizzle.config.ts`
- `railway.json`
- `.env`
- `.env.example`
- `Dockerfile`
- `docker-compose.yml`

**完了条件**:

- [ ] 主要な結果と根拠が整理されている
- [ ] 次のアクションが提示されている

### Phase 3: 設定ファイル・Docker・Railway統合（Phase 3）の実行

**目的**: 設定ファイル・Docker・Railway統合（Phase 3）に関するタスクを実行し、結果を整理する

**背景**: 専門知識が必要なため専門エージェントに委譲する

**ゴール**: 設定ファイル・Docker・Railway統合（Phase 3）の結果と次アクションが提示された状態

**起動エージェント**: `.claude/agents/devops-eng.md`

Task ツールで `.claude/agents/devops-eng.md` を起動:

**コンテキスト**:

- 引数: なし

**依頼内容**:

- コマンドの目的に沿って実行する
- 結果と次アクションを提示する

**期待成果物**:

- `src/shared/infrastructure/database/schema.ts`
- `local-agent/ecosystem.config.js`
- `package.json`
- `pnpm-lock.yaml`
- `tsconfig.json`
- `eslint.config.js`
- `.prettierrc`
- `pnpm-workspace.yaml`
- `vitest.config.ts`
- `drizzle.config.ts`
- `railway.json`
- `.env`
- `.env.example`
- `Dockerfile`
- `docker-compose.yml`

**完了条件**:

- [ ] 主要な結果と根拠が整理されている
- [ ] 次のアクションが提示されている

## 使用例

```bash
/ai:setup-dev-env
```
