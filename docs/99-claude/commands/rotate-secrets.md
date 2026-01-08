---
description: |
  APIキーやシークレットを安全にローテーション（更新）し、古いシークレットの無効化と新しいシークレットの設定を支援します。
  実行は専門エージェントに委譲します。

  🤖 起動エージェント:
  - `.claude/agents/secret-mgr.md`: 機密情報ローテーション専門

  ⚙️ このコマンドの設定:
  - argument-hint: [secret-name]
  - allowed-tools: Task（エージェント起動のみ）
  - model: sonnet

  トリガーキーワード: secret rotation, キーローテーション, パスワード変更, API key rotation, 鍵更新
argument-hint: "[secret-name]"
allowed-tools:
  - Task
model: sonnet
---

# .claude/commands/ai/rotate-secrets.md - APIキー・シークレットのローテーション

## 目的

`.claude/commands/ai/rotate-secrets.md` の入力を受け取り、専門エージェントに実行を委譲します。

## エージェント起動フロー

### Phase 1: 機密情報ローテーション専門の実行

**目的**: 機密情報ローテーション専門に関するタスクを実行し、結果を整理する

**背景**: 専門知識が必要なため専門エージェントに委譲する

**ゴール**: 機密情報ローテーション専門の結果と次アクションが提示された状態

**起動エージェント**: `.claude/agents/secret-mgr.md`

Task ツールで `.claude/agents/secret-mgr.md` を起動:

**コンテキスト**:

- 引数: $ARGUMENTS（[secret-name]）

**依頼内容**:

- コマンドの目的に沿って実行する
- 結果と次アクションを提示する

**期待成果物**:

- `scripts/rotate-secret-`
- `scripts/verify-secret-`
- `scripts/rollback-secret-`
- `docs/security/rotation-guide-`
- `scripts/verify-secret-TURSO_AUTH_TOKEN.sh`
- `scripts/rollback-secret-DATABASE_URL.sh`
- `.env`

**完了条件**:

- [ ] 主要な結果と根拠が整理されている
- [ ] 次のアクションが提示されている

## 使用例

```bash
/ai:rotate-secrets [secret-name]
```
