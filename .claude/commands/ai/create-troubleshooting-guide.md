---
description: |
  トラブルシューティングガイドとFAQの作成。症状別の診断フローと解決策を提示し、ユーザーの自己解決率を向上させます。
  実行は専門エージェントに委譲します。

  🤖 起動エージェント:
  - `.claude/agents/manual-writer.md`: ユーザー中心ドキュメンテーション専門エージェント

  ⚙️ このコマンドの設定:
  - allowed-tools: Task（エージェント起動のみ）
  - model: sonnet

  トリガーキーワード: troubleshooting, faq, error, problem, issue
allowed-tools:
  - Task
model: sonnet
---

# トラブルシューティングガイド作成コマンド

## 目的

`.claude/commands/ai/create-troubleshooting-guide.md` の入力を受け取り、専門エージェントに実行を委譲します。

## エージェント起動フロー

### Phase 1: ユーザー中心ドキュメンテーション専門エージェントの実行

**目的**: ユーザー中心ドキュメンテーション専門エージェントに関するタスクを実行し、結果を整理する

**背景**: 専門知識が必要なため専門エージェントに委譲する

**ゴール**: ユーザー中心ドキュメンテーション専門エージェントの結果と次アクションが提示された状態

**起動エージェント**: `.claude/agents/manual-writer.md`

Task ツールで `.claude/agents/manual-writer.md` を起動:

**コンテキスト**:

- 引数: なし

**依頼内容**:

- コマンドの目的に沿って実行する
- 結果と次アクションを提示する

**期待成果物**:

- `docs/manual/troubleshooting.md`
- `docs/manual/faq.md`
- `src/shared/core/errors/`

**完了条件**:

- [ ] 主要な結果と根拠が整理されている
- [ ] 次のアクションが提示されている

## 使用例

```bash
/ai:create-troubleshooting-guide
```
