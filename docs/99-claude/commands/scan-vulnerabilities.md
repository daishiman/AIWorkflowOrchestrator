---
description: |
  プロジェクトの依存関係とコードベースをスキャンし、既知の脆弱性（CVE）を検出してレポートを生成します。
  実行は専門エージェントに委譲します。

  🤖 起動エージェント:
  - `.claude/agents/sec-auditor.md`: セキュリティ監査専門
  - `.claude/agents/dep-mgr.md`: 依存関係脆弱性分析

  ⚙️ このコマンドの設定:
  - allowed-tools: Task（エージェント起動のみ）
  - model: sonnet

  トリガーキーワード: vulnerability scan, 脆弱性スキャン, pnpm audit, pnpm audit, CVE検出
allowed-tools:
  - Task
model: sonnet
---

# .claude/commands/ai/scan-vulnerabilities.md - 脆弱性スキャン

## 目的

`.claude/commands/ai/scan-vulnerabilities.md` の入力を受け取り、専門エージェントに実行を委譲します。

## エージェント起動フロー

### Phase 1: セキュリティ監査専門の実行

**目的**: セキュリティ監査専門に関するタスクを実行し、結果を整理する

**背景**: 専門知識が必要なため専門エージェントに委譲する

**ゴール**: セキュリティ監査専門の結果と次アクションが提示された状態

**起動エージェント**: `.claude/agents/sec-auditor.md`

Task ツールで `.claude/agents/sec-auditor.md` を起動:

**コンテキスト**:

- 引数: なし

**依頼内容**:

- コマンドの目的に沿って実行する
- 結果と次アクションを提示する

**期待成果物**:

- `docs/security/vulnerability-report.md`
- `docs/security/vulnerability-scan-`
- `scripts/fix-vulnerabilities.sh`
- `docs/security/`
- `package.json`
- `package-lock.json`

**完了条件**:

- [ ] 主要な結果と根拠が整理されている
- [ ] 次のアクションが提示されている

### Phase 2: 依存関係脆弱性分析の実行

**目的**: 依存関係脆弱性分析に関するタスクを実行し、結果を整理する

**背景**: 専門知識が必要なため専門エージェントに委譲する

**ゴール**: 依存関係脆弱性分析の結果と次アクションが提示された状態

**起動エージェント**: `.claude/agents/dep-mgr.md`

Task ツールで `.claude/agents/dep-mgr.md` を起動:

**コンテキスト**:

- 引数: なし

**依頼内容**:

- コマンドの目的に沿って実行する
- 結果と次アクションを提示する

**期待成果物**:

- `docs/security/vulnerability-report.md`
- `docs/security/vulnerability-scan-`
- `scripts/fix-vulnerabilities.sh`
- `docs/security/`
- `package.json`
- `package-lock.json`

**完了条件**:

- [ ] 主要な結果と根拠が整理されている
- [ ] 次のアクションが提示されている

## 使用例

```bash
/ai:scan-vulnerabilities
```
