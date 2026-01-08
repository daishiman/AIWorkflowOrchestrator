---
description: |
  ユーザー中心のマニュアル・チュートリアルの作成。エンドユーザーが「やりたいこと」を達成できるドキュメントを作成します。
  実行は専門エージェントに委譲します。

  🤖 起動エージェント:
  - `.claude/agents/manual-writer.md`: ユーザー中心ドキュメンテーション専門エージェント

  ⚙️ このコマンドの設定:
  - argument-hint: [target-audience]
  - allowed-tools: Task（エージェント起動のみ）
  - model: sonnet

  トリガーキーワード: manual, tutorial, guide, user, documentation
argument-hint: "[target-audience]"
allowed-tools:
  - Task
model: sonnet
---

# ユーザーマニュアル作成コマンド

## 目的

`.claude/commands/ai/write-user-manual.md` の入力を受け取り、専門エージェントに実行を委譲します。

## エージェント起動フロー

### Phase 1: ユーザー中心ドキュメンテーション専門エージェントの実行

**目的**: ユーザー中心ドキュメンテーション専門エージェントに関するタスクを実行し、結果を整理する

**背景**: 専門知識が必要なため専門エージェントに委譲する

**ゴール**: ユーザー中心ドキュメンテーション専門エージェントの結果と次アクションが提示された状態

**起動エージェント**: `.claude/agents/manual-writer.md`

Task ツールで `.claude/agents/manual-writer.md` を起動:

**コンテキスト**:

- 引数: $ARGUMENTS（[target-audience]）

**依頼内容**:

- コマンドの目的に沿って実行する
- 結果と次アクションを提示する

**期待成果物**:

- `docs/manual/`
- `docs/tutorials/`
- `src/features/`
- `docs/manual/user-guide.md`
- `docs/manual/quick-start.md`
- `docs/manual/faq.md`
- `docs/manual/troubleshooting.md`

**完了条件**:

- [ ] 主要な結果と根拠が整理されている
- [ ] 次のアクションが提示されている

## 使用例

```bash
/ai:write-user-manual [target-audience]
```
