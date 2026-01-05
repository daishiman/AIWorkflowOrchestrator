---
description: |
  リリース準備の完全自動化を行うコマンド。
  実行は専門エージェントに委譲します。

  🤖 起動エージェント:
  - `.claude/agents/unit-tester.md`: 全テスト実行、カバレッジ検証
  - `.claude/agents/code-quality.md`: SOLID原則、Clean Code、コードスメル検出
  - `.claude/agents/sec-auditor.md`: OWASP Top 10、脆弱性スキャン
  - `.claude/agents/spec-writer.md`: CHANGELOG、リリースノート、API仕様書更新
  - `.claude/agents/devops-eng.md`: ビルド検証、Railway設定確認

  ⚙️ このコマンドの設定:
  - argument-hint: [version]
  - allowed-tools: Task（エージェント起動のみ）
  - model: sonnet

  トリガーキーワード: release, リリース準備, deploy preparation, 本番デプロイ, quality gate
argument-hint: "[version]"
allowed-tools:
  - Task
model: sonnet
---

# リリース準備自動化

## 目的

`.claude/commands/ai/prepare-release.md` の入力を受け取り、専門エージェントに実行を委譲します。

## エージェント起動フロー

### Phase 1: 全テスト実行、カバレッジ検証の実行

**目的**: 全テスト実行、カバレッジ検証に関するタスクを実行し、結果を整理する

**背景**: 専門知識が必要なため専門エージェントに委譲する

**ゴール**: 全テスト実行、カバレッジ検証の結果と次アクションが提示された状態

**起動エージェント**: `.claude/agents/unit-tester.md`

Task ツールで `.claude/agents/unit-tester.md` を起動:

**コンテキスト**:

- 引数: $ARGUMENTS（[version]）

**依頼内容**:

- コマンドの目的に沿って実行する
- 結果と次アクションを提示する

**期待成果物**:

- `.claude/docs/quality/release-`
- `.claude/docs/security/release-`
- `docs/releases/`
- `package.json`
- `railway.json`
- `.env`
- `.env.example`
- `README.md`
- `CHANGELOG.md`

**完了条件**:

- [ ] 主要な結果と根拠が整理されている
- [ ] 次のアクションが提示されている

### Phase 2: SOLID原則、Clean Code、コードスメル検出の実行

**目的**: SOLID原則、Clean Code、コードスメル検出に関するタスクを実行し、結果を整理する

**背景**: 専門知識が必要なため専門エージェントに委譲する

**ゴール**: SOLID原則、Clean Code、コードスメル検出の結果と次アクションが提示された状態

**起動エージェント**: `.claude/agents/code-quality.md`

Task ツールで `.claude/agents/code-quality.md` を起動:

**コンテキスト**:

- 引数: $ARGUMENTS（[version]）

**依頼内容**:

- コマンドの目的に沿って実行する
- 結果と次アクションを提示する

**期待成果物**:

- `.claude/docs/quality/release-`
- `.claude/docs/security/release-`
- `docs/releases/`
- `package.json`
- `railway.json`
- `.env`
- `.env.example`
- `README.md`
- `CHANGELOG.md`

**完了条件**:

- [ ] 主要な結果と根拠が整理されている
- [ ] 次のアクションが提示されている

### Phase 3: OWASP Top 10、脆弱性スキャンの実行

**目的**: OWASP Top 10、脆弱性スキャンに関するタスクを実行し、結果を整理する

**背景**: 専門知識が必要なため専門エージェントに委譲する

**ゴール**: OWASP Top 10、脆弱性スキャンの結果と次アクションが提示された状態

**起動エージェント**: `.claude/agents/sec-auditor.md`

Task ツールで `.claude/agents/sec-auditor.md` を起動:

**コンテキスト**:

- 引数: $ARGUMENTS（[version]）

**依頼内容**:

- コマンドの目的に沿って実行する
- 結果と次アクションを提示する

**期待成果物**:

- `.claude/docs/quality/release-`
- `.claude/docs/security/release-`
- `docs/releases/`
- `package.json`
- `railway.json`
- `.env`
- `.env.example`
- `README.md`
- `CHANGELOG.md`

**完了条件**:

- [ ] 主要な結果と根拠が整理されている
- [ ] 次のアクションが提示されている

### Phase 4: CHANGELOG、リリースノート、API仕様書更新の実行

**目的**: CHANGELOG、リリースノート、API仕様書更新に関するタスクを実行し、結果を整理する

**背景**: 専門知識が必要なため専門エージェントに委譲する

**ゴール**: CHANGELOG、リリースノート、API仕様書更新の結果と次アクションが提示された状態

**起動エージェント**: `.claude/agents/spec-writer.md`

Task ツールで `.claude/agents/spec-writer.md` を起動:

**コンテキスト**:

- 引数: $ARGUMENTS（[version]）

**依頼内容**:

- コマンドの目的に沿って実行する
- 結果と次アクションを提示する

**期待成果物**:

- `.claude/docs/quality/release-`
- `.claude/docs/security/release-`
- `docs/releases/`
- `package.json`
- `railway.json`
- `.env`
- `.env.example`
- `README.md`
- `CHANGELOG.md`

**完了条件**:

- [ ] 主要な結果と根拠が整理されている
- [ ] 次のアクションが提示されている

### Phase 5: ビルド検証、Railway設定確認の実行

**目的**: ビルド検証、Railway設定確認に関するタスクを実行し、結果を整理する

**背景**: 専門知識が必要なため専門エージェントに委譲する

**ゴール**: ビルド検証、Railway設定確認の結果と次アクションが提示された状態

**起動エージェント**: `.claude/agents/devops-eng.md`

Task ツールで `.claude/agents/devops-eng.md` を起動:

**コンテキスト**:

- 引数: $ARGUMENTS（[version]）

**依頼内容**:

- コマンドの目的に沿って実行する
- 結果と次アクションを提示する

**期待成果物**:

- `.claude/docs/quality/release-`
- `.claude/docs/security/release-`
- `docs/releases/`
- `package.json`
- `railway.json`
- `.env`
- `.env.example`
- `README.md`
- `CHANGELOG.md`

**完了条件**:

- [ ] 主要な結果と根拠が整理されている
- [ ] 次のアクションが提示されている

## 使用例

```bash
/ai:prepare-release [version]
```
