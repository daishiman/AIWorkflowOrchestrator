---
description: |
  Next.jsフロントエンドのパフォーマンス最適化を実行する専門コマンド。
  実行は専門エージェントに委譲します。

  🤖 起動エージェント:
  - `.claude/agents/router-dev.md`: Next.js App Router専門エージェント（Phase 2で起動）

  ⚙️ このコマンドの設定:
  - argument-hint: [target-page]
  - allowed-tools: Task（エージェント起動のみ）
  - model: opus

  トリガーキーワード: performance, optimize, frontend, パフォーマンス, 最適化, LCP, Core Web Vitals
argument-hint: "[target-page]"
allowed-tools:
  - Task
model: opus
---

# フロントエンドパフォーマンス最適化

## 目的

`.claude/commands/ai/optimize-frontend-performance.md` の入力を受け取り、専門エージェントに実行を委譲します。

## エージェント起動フロー

### Phase 1: Next.js App Router専門エージェント（Phase 2で起動）の実行

**目的**: Next.js App Router専門エージェント（Phase 2で起動）に関するタスクを実行し、結果を整理する

**背景**: 専門知識が必要なため専門エージェントに委譲する

**ゴール**: Next.js App Router専門エージェント（Phase 2で起動）の結果と次アクションが提示された状態

**起動エージェント**: `.claude/agents/router-dev.md`

Task ツールで `.claude/agents/router-dev.md` を起動:

**コンテキスト**:

- 引数: $ARGUMENTS（[target-page]）

**依頼内容**:

- コマンドの目的に沿って実行する
- 結果と次アクションを提示する

**期待成果物**:

- `docs/reports/optimize-frontend-performance.md`

**完了条件**:

- [ ] 主要な結果と根拠が整理されている
- [ ] 次のアクションが提示されている

## 使用例

```bash
/ai:optimize-frontend-performance [target-page]
```
