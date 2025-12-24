---
description: |
  プロジェクト設計書（master_system_design.md）に準拠したハイブリッドアーキテクチャのディレクトリ構造と設定ファイルを自動生成するコマンド。
  実行は専門エージェントに委譲します。

  🤖 起動エージェント:
  - `.claude/agents/arch-police.md`: プロジェクト構造の設計確認

  ⚙️ このコマンドの設定:
  - argument-hint: [template-type]
  - allowed-tools: Task（エージェント起動のみ）
  - model: sonnet

  トリガーキーワード: scaffold, init, setup, project-structure, hybrid-architecture, MVP, テンプレート
argument-hint: "[template-type]"
allowed-tools:
  - Task
model: sonnet
---

# Universal AI Workflow Orchestrator - プロジェクト Scaffold

## 目的

`.claude/commands/ai/scaffold-project.md` の入力を受け取り、専門エージェントに実行を委譲します。

## エージェント起動フロー

### Phase 1: プロジェクト構造の設計確認の実行

**目的**: プロジェクト構造の設計確認に関するタスクを実行し、結果を整理する

**背景**: 専門知識が必要なため専門エージェントに委譲する

**ゴール**: プロジェクト構造の設計確認の結果と次アクションが提示された状態

**起動エージェント**: `.claude/agents/arch-police.md`

Task ツールで `.claude/agents/arch-police.md` を起動:

**コンテキスト**:

- 引数: $ARGUMENTS（[template-type]）

**依頼内容**:

- コマンドの目的に沿って実行する
- 結果と次アクションを提示する

**期待成果物**:

- `docs/00-requirements/master_system_design.md`
- `src/shared/`
- `src/features/`
- `src/app/`
- `.github/workflows/`
- `.github/workflows/README.md`
- `src/shared/core/entities/workflow.ts`
- `src/shared/core/interfaces/IWorkflowExecutor.ts`
- `src/shared/core/errors/WorkflowError.ts`
- `src/features/registry.ts`
- `src/shared/infrastructure/database/schema.ts`
- `local-agent/ecosystem.config.js`
- `tsconfig.json`
- `eslint.config.js`
- `.prettierrc`
- `pnpm-workspace.yaml`
- `vitest.config.ts`
- `drizzle.config.ts`
- `railway.json`
- `.env`
- `.env.example`
- `README.md`

**完了条件**:

- [ ] 主要な結果と根拠が整理されている
- [ ] 次のアクションが提示されている

## 使用例

```bash
/ai:scaffold-project [template-type]
```
