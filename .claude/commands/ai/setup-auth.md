---
description: |
  認証・認可システムを実装します。OAuth 2.0（GitHub/Google）または Credentials認証をサポートし、NextAuth.jsまたはPassport.jsベースの実装を提供します。
  実行は専門エージェントに委譲します。

  🤖 起動エージェント:
  - `.claude/agents/auth-specialist.md`: 認証・認可実装専門

  ⚙️ このコマンドの設定:
  - argument-hint: [provider: github|google|credentials]
  - allowed-tools: Task（エージェント起動のみ）
  - model: sonnet

  トリガーキーワード: authentication, authorization, 認証実装, OAuth, NextAuth, ログイン
argument-hint: "[provider: github|google|credentials]"
allowed-tools:
  - Task
model: sonnet
---

# .claude/commands/ai/setup-auth.md - 認証・認可システムの実装

## 目的

`.claude/commands/ai/setup-auth.md` の入力を受け取り、専門エージェントに実行を委譲します。

## エージェント起動フロー

### Phase 1: 認証・認可実装専門の実行

**目的**: 認証・認可実装専門に関するタスクを実行し、結果を整理する

**背景**: 専門知識が必要なため専門エージェントに委譲する

**ゴール**: 認証・認可実装専門の結果と次アクションが提示された状態

**起動エージェント**: `.claude/agents/auth-specialist.md`

Task ツールで `.claude/agents/auth-specialist.md` を起動:

**コンテキスト**:

- 引数: $ARGUMENTS（[provider: github|google|credentials]）

**依頼内容**:

- コマンドの目的に沿って実行する
- 結果と次アクションを提示する

**期待成果物**:

- `src/app/api/auth/`
- `src/middleware.ts`
- `src/auth.ts`
- `src/lib/auth.ts`
- `src/auth/passport.config.ts`
- `src/auth/strategies/`
- `src/middleware/auth.middleware.ts`
- `docs/auth/setup-guide.md`
- `docs/auth/usage.md`
- `docs/auth/`
- `.env`
- `.env.example`

**完了条件**:

- [ ] 主要な結果と根拠が整理されている
- [ ] 次のアクションが提示されている

## 使用例

```bash
/ai:setup-auth [provider: github|google|credentials]
```
