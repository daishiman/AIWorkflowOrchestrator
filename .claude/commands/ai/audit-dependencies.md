---
description: |
  依存関係の脆弱性監査を実行するコマンド。
  実行は専門エージェントに委譲します。

  🤖 起動エージェント:
  - `.claude/agents/dep-mgr.md`: 依存関係監査専門
  - `.claude/agents/sec-auditor.md`: セキュリティ評価専門

  ⚙️ このコマンドの設定:
  - allowed-tools: Task（エージェント起動のみ）
  - model: sonnet

  トリガーキーワード: audit dependencies, security scan, 脆弱性監査, セキュリティチェック
allowed-tools:
  - Task
model: sonnet
---

# 依存関係監査

## 目的

`.claude/commands/ai/audit-dependencies.md` の入力を受け取り、専門エージェントに実行を委譲します。

## エージェント起動フロー

### Phase 1: 依存関係監査専門の実行

**目的**: 依存関係監査専門に関するタスクを実行し、結果を整理する

**背景**: 専門知識が必要なため専門エージェントに委譲する

**ゴール**: 依存関係監査専門の結果と次アクションが提示された状態

**起動エージェント**: `.claude/agents/dep-mgr.md`

Task ツールで `.claude/agents/dep-mgr.md` を起動:

**コンテキスト**:

- 引数: なし

**依頼内容**:

- コマンドの目的に沿って実行する
- 結果と次アクションを提示する

**期待成果物**:

- `docs/security/dependency-audit-report.md`
- `.github/workflows/security-audit.yml`
- `package.json`
- `pnpm-lock.yaml`
- `package-lock.json`

**完了条件**:

- [ ] 主要な結果と根拠が整理されている
- [ ] 次のアクションが提示されている

### Phase 2: セキュリティ評価専門の実行

**目的**: セキュリティ評価専門に関するタスクを実行し、結果を整理する

**背景**: 専門知識が必要なため専門エージェントに委譲する

**ゴール**: セキュリティ評価専門の結果と次アクションが提示された状態

**起動エージェント**: `.claude/agents/sec-auditor.md`

Task ツールで `.claude/agents/sec-auditor.md` を起動:

**コンテキスト**:

- 引数: なし

**依頼内容**:

- コマンドの目的に沿って実行する
- 結果と次アクションを提示する

**期待成果物**:

- `docs/security/dependency-audit-report.md`
- `.github/workflows/security-audit.yml`
- `package.json`
- `pnpm-lock.yaml`
- `package-lock.json`

**完了条件**:

- [ ] 主要な結果と根拠が整理されている
- [ ] 次のアクションが提示されている

## 使用例

```bash
/ai:audit-dependencies
```
