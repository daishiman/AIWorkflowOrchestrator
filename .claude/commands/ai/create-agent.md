---
description: |
  新しいClaude Codeエージェント（.claude/agents/*.md）を作成する専門コマンド。

  🤖 起動エージェント:
  - `.claude/agents/meta-agent-designer.md`: エージェント設計・実装の専門家（マービン・ミンスキー『心の社会』に基づく単一責任設計）

  ⚙️ このコマンドの設定:
  - argument-hint: エージェント名と専門分野（オプション）
  - allowed-tools: エージェント作成に必要な最小限のツール
    • Task: meta-agent-designer 起動用
    • Read: 既存エージェント・スキル確認用
    • Write(.claude/agents/**): エージェントファイル生成用（パス制限）
    • Grep: 既存実装調査・重複チェック用
  - model: opus（複雑なエージェント設計が必要）

  トリガーキーワード: agent, エージェント, meta-agent, ペルソナ設計, マルチエージェント
argument-hint: "[agent-name] [specialty]"
allowed-tools:
  - Task
  - Read
  - Write(.claude/agents/**)
  - Grep
model: opus
---

# エージェント作成

## 目的

`.claude/agents/meta-agent-designer.md` エージェントを起動し、新しいエージェントファイルを生成します。

## エージェント起動フロー

### Phase 1: 引数確認

**目的**: ユーザー入力を取得し、エージェント作成の準備を行う

**背景**: エージェント名と専門分野が明確でないと、適切な設計ができない

**ゴール**: エージェント名と専門分野が決定され、次フェーズに進める状態

**起動エージェント**: なし（コマンド自身が実行）

**アクション**:

1. 引数 `$ARGUMENTS` を確認
2. 未指定の場合は AskUserQuestion で対話的に収集

**期待成果物**: なし（変数として保持）

**完了条件**:

- [ ] エージェント名が決定されている
- [ ] 専門分野が決定されている

---

### Phase 2: meta-agent-designer エージェント起動

**目的**: エージェント設計・実装の専門エージェントにタスクを委譲する

**背景**: エージェント設計は複雑な専門知識が必要なため、専門エージェントに委譲

**ゴール**: 仕様に準拠したエージェントファイルが生成された状態

**起動エージェント**: `.claude/agents/meta-agent-designer.md`

Task ツールで `.claude/agents/meta-agent-designer.md` を起動:

**コンテキスト**:

- エージェント名: $AGENT_NAME
- 専門分野: $SPECIALTY
- プロジェクト構造: 既存の .claude/ ディレクトリ
- 仕様書: `docs/00-requirements/18-claude-code-skill-specification.md`

**依頼内容**:

- マービン・ミンスキー『心の社会』に基づく単一責任設計
- 実在する専門家ベースのペルソナ設計
- 450-550行範囲内のエージェント実装
- YAML Frontmatter + Markdown本文の生成
- 依存スキルの相対パス参照
- 最小権限のツール設定

**期待成果物**:

- `.claude/agents/$AGENT_NAME.md`
- 450-550行範囲内
- YAML Frontmatter が有効
- 相対パスでスキル参照

**完了条件**:

- [ ] エージェントファイルが生成されている
- [ ] 行数が450-550行範囲内
- [ ] YAML構文が有効
- [ ] 単一責任原則を遵守

---

### Phase 3: 検証と報告

**目的**: 生成されたエージェントを検証し、ユーザーに報告する

**背景**: 品質を保証し、ユーザーが結果を確認できるようにする

**ゴール**: エージェントが検証され、使用準備が整った状態

**起動エージェント**: なし（コマンド自身が実行）

**アクション**:

1. エージェントファイルのパスを確認
2. 行数を検証
3. YAML構文を検証
4. ユーザーに完了を報告

**期待成果物**: なし（報告のみ）

**完了条件**:

- [ ] 検証が完了している
- [ ] ユーザーに報告されている

## 参照

- エージェント: `.claude/agents/meta-agent-designer.md`
- 仕様書: `docs/00-requirements/18-claude-code-skill-specification.md`
