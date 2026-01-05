---
description: |
  Electronデスクトップアプリケーションのアーキテクチャ設計を行う専門コマンド。
  実行は専門エージェントに委譲します。

  🤖 起動エージェント:
  - `.claude/agents/electron-architect.md`: Electronアーキテクチャ設計専門エージェント

  ⚙️ このコマンドの設定:
  - argument-hint: [app-name]
  - allowed-tools: Task（エージェント起動のみ）
  - model: opus

  トリガーキーワード: electron, デスクトップアプリ, architecture, 設計, main process, renderer
argument-hint: "[app-name]"
allowed-tools:
  - Task
model: opus
---

# Electronアプリ アーキテクチャ設計

## 目的

`.claude/commands/ai/design-electron-app.md` の入力を受け取り、専門エージェントに実行を委譲します。

## エージェント起動フロー

### Phase 1: Electronアーキテクチャ設計専門エージェントの実行

**目的**: Electronアーキテクチャ設計専門エージェントに関するタスクを実行し、結果を整理する

**背景**: 専門知識が必要なため専門エージェントに委譲する

**ゴール**: Electronアーキテクチャ設計専門エージェントの結果と次アクションが提示された状態

**起動エージェント**: `.claude/agents/electron-architect.md`

Task ツールで `.claude/agents/electron-architect.md` を起動:

**コンテキスト**:

- 引数: $ARGUMENTS（[app-name]）

**依頼内容**:

- コマンドの目的に沿って実行する
- 結果と次アクションを提示する

**期待成果物**:

- `src/main/index.ts`
- `src/preload/index.ts`
- `src/shared/ipc-types.ts`
- `src/renderer/`

**完了条件**:

- [ ] 主要な結果と根拠が整理されている
- [ ] 次のアクションが提示されている

## 使用例

```bash
/ai:design-electron-app [app-name]
```
