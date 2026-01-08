---
description: |
  プロジェクト規模の見積もりと予測可能な計画の策定。
  実行は専門エージェントに委譲します。

  🤖 起動エージェント:
  - `.claude/agents/product-manager.md`: プロダクトマネージャーエージェント（Phase 1で起動）

  ⚙️ このコマンドの設定:
  - allowed-tools: Task（エージェント起動のみ）
  - model: opus

  トリガーキーワード: estimate, estimation, 見積もり, 規模, ストーリーポイント, ベロシティ, リリース予測
allowed-tools:
  - Task
model: opus
---

# プロジェクト見積もり実行

## 目的

`.claude/commands/ai/estimate-project.md` の入力を受け取り、専門エージェントに実行を委譲します。

## エージェント起動フロー

### Phase 1: プロダクトマネージャーエージェント（Phase 1で起動）の実行

**目的**: プロダクトマネージャーエージェント（Phase 1で起動）に関するタスクを実行し、結果を整理する

**背景**: 専門知識が必要なため専門エージェントに委譲する

**ゴール**: プロダクトマネージャーエージェント（Phase 1で起動）の結果と次アクションが提示された状態

**起動エージェント**: `.claude/agents/product-manager.md`

Task ツールで `.claude/agents/product-manager.md` を起動:

**コンテキスト**:

- 引数: なし

**依頼内容**:

- コマンドの目的に沿って実行する
- 結果と次アクションを提示する

**期待成果物**:

- `docs/00-requirements/`
- `docs/20-specifications/`
- `docs/30-project-management/`

**完了条件**:

- [ ] 主要な結果と根拠が整理されている
- [ ] 次のアクションが提示されている

## 使用例

```bash
/ai:estimate-project
```
