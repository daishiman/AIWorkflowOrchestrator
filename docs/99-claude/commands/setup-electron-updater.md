---
description: |
  Electron自動更新システム構築（electron-updater）
  実行は専門エージェントに委譲します。

  🤖 起動エージェント:
  - `.claude/agents/electron-devops.md`: 担当エージェント

  ⚙️ このコマンドの設定:
  - argument-hint: [--provider github|s3|generic]
  - allowed-tools: Task（エージェント起動のみ）
  - model: sonnet

  トリガーキーワード: electron updater, auto update, electron-updater, update provider, 自動更新, アップデート, 配布
argument-hint: "[--provider github|s3|generic]"
allowed-tools:
  - Task
model: sonnet
---

# Electron自動更新システム構築コマンド

## 目的

`.claude/commands/ai/setup-electron-updater.md` の入力を受け取り、専門エージェントに実行を委譲します。

## エージェント起動フロー

### Phase 1: 担当エージェントの実行

**目的**: 担当エージェントに関するタスクを実行し、結果を整理する

**背景**: 専門知識が必要なため専門エージェントに委譲する

**ゴール**: 担当エージェントの結果と次アクションが提示された状態

**起動エージェント**: `.claude/agents/electron-devops.md`

Task ツールで `.claude/agents/electron-devops.md` を起動:

**コンテキスト**:

- 引数: $ARGUMENTS（[--provider github|s3|generic]）

**依頼内容**:

- コマンドの目的に沿って実行する
- 結果と次アクションを提示する

**期待成果物**:

- `src/main/services/updateService.ts`
- `src/main/ipc/update.ts`
- `src/renderer/hooks/useAutoUpdate.ts`

**完了条件**:

- [ ] 主要な結果と根拠が整理されている
- [ ] 次のアクションが提示されている

## 使用例

```bash
/ai:setup-electron-updater [--provider github|s3|generic]
```
