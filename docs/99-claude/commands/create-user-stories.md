---
description: |
  ユーザーストーリーとアクセプタンスクライテリアを作成する専門コマンド。
  実行は専門エージェントに委譲します。

  🤖 起動エージェント:
  - `.claude/agents/product-manager.md`: プロダクト価値とストーリーマッピング（Phase 1で起動）
  - `.claude/agents/req-analyst.md`: 受け入れ基準定義と要件検証（Phase 2で起動）
  - `.claude/agents/spec-writer.md`: への引き継ぎ事項）

  ⚙️ このコマンドの設定:
  - argument-hint: [feature-name]
  - allowed-tools: Task（エージェント起動のみ）
  - model: opus

  トリガーキーワード: user stories, acceptance criteria, ユーザーストーリー, 受け入れ基準, backlog, バックログ, MVP
argument-hint: "[feature-name]"
allowed-tools:
  - Task
model: opus
---

# ユーザーストーリーとアクセプタンスクライテリア作成

## 目的

`.claude/commands/ai/create-user-stories.md` の入力を受け取り、専門エージェントに実行を委譲します。

## エージェント起動フロー

### Phase 1: プロダクト価値とストーリーマッピング（Phase 1で起動）の実行

**目的**: プロダクト価値とストーリーマッピング（Phase 1で起動）に関するタスクを実行し、結果を整理する

**背景**: 専門知識が必要なため専門エージェントに委譲する

**ゴール**: プロダクト価値とストーリーマッピング（Phase 1で起動）の結果と次アクションが提示された状態

**起動エージェント**: `.claude/agents/product-manager.md`

Task ツールで `.claude/agents/product-manager.md` を起動:

**コンテキスト**:

- 引数: $ARGUMENTS（[feature-name]）

**依頼内容**:

- コマンドの目的に沿って実行する
- 結果と次アクションを提示する

**期待成果物**:

- `docs/00-requirements/`
- `docs/00-requirements/master_system_design.md`
- `docs/00-requirements/user-stories.md`

**完了条件**:

- [ ] 主要な結果と根拠が整理されている
- [ ] 次のアクションが提示されている

### Phase 2: 受け入れ基準定義と要件検証（Phase 2で起動）の実行

**目的**: 受け入れ基準定義と要件検証（Phase 2で起動）に関するタスクを実行し、結果を整理する

**背景**: 専門知識が必要なため専門エージェントに委譲する

**ゴール**: 受け入れ基準定義と要件検証（Phase 2で起動）の結果と次アクションが提示された状態

**起動エージェント**: `.claude/agents/req-analyst.md`

Task ツールで `.claude/agents/req-analyst.md` を起動:

**コンテキスト**:

- 引数: $ARGUMENTS（[feature-name]）

**依頼内容**:

- コマンドの目的に沿って実行する
- 結果と次アクションを提示する

**期待成果物**:

- `docs/00-requirements/`
- `docs/00-requirements/master_system_design.md`
- `docs/00-requirements/user-stories.md`

**完了条件**:

- [ ] 主要な結果と根拠が整理されている
- [ ] 次のアクションが提示されている

### Phase 3: への引き継ぎ事項）の実行

**目的**: への引き継ぎ事項）に関するタスクを実行し、結果を整理する

**背景**: 専門知識が必要なため専門エージェントに委譲する

**ゴール**: への引き継ぎ事項）の結果と次アクションが提示された状態

**起動エージェント**: `.claude/agents/spec-writer.md`

Task ツールで `.claude/agents/spec-writer.md` を起動:

**コンテキスト**:

- 引数: $ARGUMENTS（[feature-name]）

**依頼内容**:

- コマンドの目的に沿って実行する
- 結果と次アクションを提示する

**期待成果物**:

- `docs/00-requirements/`
- `docs/00-requirements/master_system_design.md`
- `docs/00-requirements/user-stories.md`

**完了条件**:

- [ ] 主要な結果と根拠が整理されている
- [ ] 次のアクションが提示されている

## 使用例

```bash
/ai:create-user-stories [feature-name]
```
