---
description: |
  デザインシステム基盤とTailwind CSS設定の完全セットアップ。
  実行は専門エージェントに委譲します。

  🤖 起動エージェント:
  - `.claude/agents/ui-designer.md`: UI設計・デザインシステム専門エージェント

  ⚙️ このコマンドの設定:
  - allowed-tools: Task（エージェント起動のみ）
  - model: sonnet

  トリガーキーワード: design-system, tailwind, デザイントークン, スタイル設定, UI基盤
allowed-tools:
  - Task
model: sonnet
---

# デザインシステムセットアップ

## 目的

`.claude/commands/ai/setup-design-system.md` の入力を受け取り、専門エージェントに実行を委譲します。

## エージェント起動フロー

### Phase 1: UI設計・デザインシステム専門エージェントの実行

**目的**: UI設計・デザインシステム専門エージェントに関するタスクを実行し、結果を整理する

**背景**: 専門知識が必要なため専門エージェントに委譲する

**ゴール**: UI設計・デザインシステム専門エージェントの結果と次アクションが提示された状態

**起動エージェント**: `.claude/agents/ui-designer.md`

Task ツールで `.claude/agents/ui-designer.md` を起動:

**コンテキスト**:

- 引数: なし

**依頼内容**:

- コマンドの目的に沿って実行する
- 結果と次アクションを提示する

**期待成果物**:

- `src/styles/globals.css`
- `src/styles/tokens/`
- `src/app/`
- `src/features/`
- `src/styles/`
- `src/components/`
- `src/lib/utils.ts`
- `docs/10-architecture/component-naming.md`
- `docs/10-architecture/design-system.md`
- `docs/00-requirements/master_system_design.md`
- `package.json`
- `tsconfig.json`

**完了条件**:

- [ ] 主要な結果と根拠が整理されている
- [ ] 次のアクションが提示されている

## 使用例

```bash
/ai:setup-design-system
```
