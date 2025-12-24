---
description: |
  Electronアプリケーションのセキュリティ強化を行う専門コマンド。
  実行は専門エージェントに委譲します。

  🤖 起動エージェント:
  - `.claude/agents/electron-security.md`: Electronセキュリティ専門エージェント

  ⚙️ このコマンドの設定:
  - argument-hint: [scope]
  - allowed-tools: Task（エージェント起動のみ）
  - model: opus

  トリガーキーワード: electron, security, セキュリティ, csp, sandbox, 脆弱性
argument-hint: "[scope]"
allowed-tools:
  - Task
model: opus
---

# Electronセキュリティ強化

## 目的

`.claude/commands/ai/secure-electron-app.md` の入力を受け取り、専門エージェントに実行を委譲します。

## エージェント起動フロー

### Phase 1: Electronセキュリティ専門エージェントの実行

**目的**: Electronセキュリティ専門エージェントに関するタスクを実行し、結果を整理する

**背景**: 専門知識が必要なため専門エージェントに委譲する

**ゴール**: Electronセキュリティ専門エージェントの結果と次アクションが提示された状態

**起動エージェント**: `.claude/agents/electron-security.md`

Task ツールで `.claude/agents/electron-security.md` を起動:

**コンテキスト**:

- 引数: $ARGUMENTS（[scope]）

**依頼内容**:

- コマンドの目的に沿って実行する
- 結果と次アクションを提示する

**期待成果物**:

- `src/main/security/csp.ts`
- `.claude/docs/`

**完了条件**:

- [ ] 主要な結果と根拠が整理されている
- [ ] 次のアクションが提示されている

## 使用例

```bash
/ai:secure-electron-app [scope]
```
