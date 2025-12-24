---
description: |
  包括的なセキュリティ監査を実施し、脆弱性、権限設定、認証・認可の問題を検出してレポートを生成します。
  実行は専門エージェントに委譲します。

  🤖 起動エージェント:
  - `.claude/agents/sec-auditor.md`: 全領域セキュリティ監査
  - `.claude/agents/auth-specialist.md`: 認証・認可監査
  - `.claude/agents/dba-mgr.md`: データベースセキュリティ監査

  ⚙️ このコマンドの設定:
  - argument-hint: [scope: all|auth|api|database]
  - allowed-tools: Task（エージェント起動のみ）
  - model: opus

  トリガーキーワード: security audit, セキュリティ監査, OWASP, 権限チェック, 認証監査
argument-hint: "[scope: all|auth|api|database]"
allowed-tools:
  - Task
model: opus
---

# .claude/commands/ai/security-audit.md - 包括的セキュリティ監査

## 目的

`.claude/commands/ai/security-audit.md` の入力を受け取り、専門エージェントに実行を委譲します。

## エージェント起動フロー

### Phase 1: 全領域セキュリティ監査の実行

**目的**: 全領域セキュリティ監査に関するタスクを実行し、結果を整理する

**背景**: 専門知識が必要なため専門エージェントに委譲する

**ゴール**: 全領域セキュリティ監査の結果と次アクションが提示された状態

**起動エージェント**: `.claude/agents/sec-auditor.md`

Task ツールで `.claude/agents/sec-auditor.md` を起動:

**コンテキスト**:

- 引数: $ARGUMENTS（[scope: all|auth|api|database]）

**依頼内容**:

- コマンドの目的に沿って実行する
- 結果と次アクションを提示する

**期待成果物**:

- `docs/security/security-audit-report.md`
- `docs/security/audit-report-`
- `docs/security/`

**完了条件**:

- [ ] 主要な結果と根拠が整理されている
- [ ] 次のアクションが提示されている

### Phase 2: 認証・認可監査の実行

**目的**: 認証・認可監査に関するタスクを実行し、結果を整理する

**背景**: 専門知識が必要なため専門エージェントに委譲する

**ゴール**: 認証・認可監査の結果と次アクションが提示された状態

**起動エージェント**: `.claude/agents/auth-specialist.md`

Task ツールで `.claude/agents/auth-specialist.md` を起動:

**コンテキスト**:

- 引数: $ARGUMENTS（[scope: all|auth|api|database]）

**依頼内容**:

- コマンドの目的に沿って実行する
- 結果と次アクションを提示する

**期待成果物**:

- `docs/security/security-audit-report.md`
- `docs/security/audit-report-`
- `docs/security/`

**完了条件**:

- [ ] 主要な結果と根拠が整理されている
- [ ] 次のアクションが提示されている

### Phase 3: データベースセキュリティ監査の実行

**目的**: データベースセキュリティ監査に関するタスクを実行し、結果を整理する

**背景**: 専門知識が必要なため専門エージェントに委譲する

**ゴール**: データベースセキュリティ監査の結果と次アクションが提示された状態

**起動エージェント**: `.claude/agents/dba-mgr.md`

Task ツールで `.claude/agents/dba-mgr.md` を起動:

**コンテキスト**:

- 引数: $ARGUMENTS（[scope: all|auth|api|database]）

**依頼内容**:

- コマンドの目的に沿って実行する
- 結果と次アクションを提示する

**期待成果物**:

- `docs/security/security-audit-report.md`
- `docs/security/audit-report-`
- `docs/security/`

**完了条件**:

- [ ] 主要な結果と根拠が整理されている
- [ ] 次のアクションが提示されている

## 使用例

```bash
/ai:security-audit [scope: all|auth|api|database]
```
