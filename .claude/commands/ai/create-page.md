---
description: |
  Next.js App Routerのページ（page.tsx）を作成する専門コマンド。
  実行は専門エージェントに委譲します。

  🤖 起動エージェント:
  - `.claude/agents/router-dev.md`: Next.js App Router専門エージェント（Phase 2で起動）

  ⚙️ このコマンドの設定:
  - argument-hint: [route-path]
  - allowed-tools: Task（エージェント起動のみ）
  - model: opus

  トリガーキーワード: page, route, Next.js, App Router, ページ作成
argument-hint: "[route-path]"
allowed-tools:
  - Task
model: opus
---

# Next.js App Routerページ作成

## 目的

`.claude/commands/ai/create-page.md` の入力を受け取り、専門エージェントに実行を委譲します。

## エージェント起動フロー

### Phase 1: Next.js App Router専門エージェント（Phase 2で起動）の実行

**目的**: Next.js App Router専門エージェント（Phase 2で起動）に関するタスクを実行し、結果を整理する

**背景**: 専門知識が必要なため専門エージェントに委譲する

**ゴール**: Next.js App Router専門エージェント（Phase 2で起動）の結果と次アクションが提示された状態

**起動エージェント**: `.claude/agents/router-dev.md`

Task ツールで `.claude/agents/router-dev.md` を起動:

**コンテキスト**:

- 引数: $ARGUMENTS（[route-path]）

**依頼内容**:

- コマンドの目的に沿って実行する
- 結果と次アクションを提示する

**期待成果物**:

- `src/app/`
- `src/app/layout.tsx`
- `src/features/`
- `src/shared/infrastructure/database/`
- `src/shared/infrastructure/ai/`
- `src/app/dashboard/page.tsx`
- `src/app/products/`
- `src/app/settings/profile/page.tsx`
- `src/app/workflows/page.tsx`
- `docs/20-specifications/features/`
- `docs/00-requirements/master_system_design.md`
- `.claude/commands/ai/command_list.md`

**完了条件**:

- [ ] 主要な結果と根拠が整理されている
- [ ] 次のアクションが提示されている

## 使用例

```bash
/ai:create-page [route-path]
```
