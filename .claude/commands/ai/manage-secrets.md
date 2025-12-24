---
description: |
  機密情報（APIキー、シークレット、環境変数）を安全に管理し、ハードコードされたシークレットを検出して適切な管理手法を実装します。
  実行は専門エージェントに委譲します。

  🤖 起動エージェント:
  - `.claude/agents/secret-mgr.md`: 機密情報管理専門エージェント

  ⚙️ このコマンドの設定:
  - allowed-tools: Task（エージェント起動のみ）
  - model: sonnet

  トリガーキーワード: secret management, 機密情報管理, API key, 環境変数, .env, シークレット検出, credentials
allowed-tools:
  - Task
model: sonnet
---

# .claude/commands/ai/manage-secrets.md - 機密情報の安全な管理

## 目的

`.claude/commands/ai/manage-secrets.md` の入力を受け取り、専門エージェントに実行を委譲します。

## エージェント起動フロー

### Phase 1: 機密情報管理専門エージェントの実行

**目的**: 機密情報管理専門エージェントに関するタスクを実行し、結果を整理する

**背景**: 専門知識が必要なため専門エージェントに委譲する

**ゴール**: 機密情報管理専門エージェントの結果と次アクションが提示された状態

**起動エージェント**: `.claude/agents/secret-mgr.md`

Task ツールで `.claude/agents/secret-mgr.md` を起動:

**コンテキスト**:

- 引数: なし

**依頼内容**:

- コマンドの目的に沿って実行する
- 結果と次アクションを提示する

**期待成果物**:

- `src/config/env.ts`
- `src/env.mjs`
- `docs/security/secret-management.md`
- `docs/setup/local-development.md`
- `docs/security/secret-scan-report.md`
- `.env`
- `.env.example`

**完了条件**:

- [ ] 主要な結果と根拠が整理されている
- [ ] 次のアクションが提示されている

## 使用例

```bash
/ai:manage-secrets
```
