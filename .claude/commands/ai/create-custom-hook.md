---
description: |
  再利用可能なReactカスタムフックを設計・実装する専門コマンド。
  実行は専門エージェントに委譲します。

  🤖 起動エージェント:
  - `.claude/agents/state-manager.md`: React状態管理専門エージェント（Phase 1で起動）
  - `.claude/agents/unit-tester.md`: に委譲します。

  ⚙️ このコマンドの設定:
  - argument-hint: [hook-name]
  - allowed-tools: Task（エージェント起動のみ）
  - model: opus

  トリガーキーワード: custom hook, use〜, カスタムフック, ロジック抽出, 再利用
argument-hint: "[hook-name]"
allowed-tools:
  - Task
model: opus
---

# Reactカスタムフック作成コマンド

## 目的

`.claude/commands/ai/create-custom-hook.md` の入力を受け取り、専門エージェントに実行を委譲します。

## エージェント起動フロー

### Phase 1: React状態管理専門エージェント（Phase 1で起動）の実行

**目的**: React状態管理専門エージェント（Phase 1で起動）に関するタスクを実行し、結果を整理する

**背景**: 専門知識が必要なため専門エージェントに委譲する

**ゴール**: React状態管理専門エージェント（Phase 1で起動）の結果と次アクションが提示された状態

**起動エージェント**: `.claude/agents/state-manager.md`

Task ツールで `.claude/agents/state-manager.md` を起動:

**コンテキスト**:

- 引数: $ARGUMENTS（[hook-name]）

**依頼内容**:

- コマンドの目的に沿って実行する
- 結果と次アクションを提示する

**期待成果物**:

- `src/hooks/`
- `src/features/`
- `src/features/youtube-summarize/`
- `src/hooks/useDebounce.ts`

**完了条件**:

- [ ] 主要な結果と根拠が整理されている
- [ ] 次のアクションが提示されている

### Phase 2: に委譲します。の実行

**目的**: に委譲します。に関するタスクを実行し、結果を整理する

**背景**: 専門知識が必要なため専門エージェントに委譲する

**ゴール**: に委譲します。の結果と次アクションが提示された状態

**起動エージェント**: `.claude/agents/unit-tester.md`

Task ツールで `.claude/agents/unit-tester.md` を起動:

**コンテキスト**:

- 引数: $ARGUMENTS（[hook-name]）

**依頼内容**:

- コマンドの目的に沿って実行する
- 結果と次アクションを提示する

**期待成果物**:

- `src/hooks/`
- `src/features/`
- `src/features/youtube-summarize/`
- `src/hooks/useDebounce.ts`

**完了条件**:

- [ ] 主要な結果と根拠が整理されている
- [ ] 次のアクションが提示されている

## 使用例

```bash
/ai:create-custom-hook [hook-name]
```
