---
description: |
  ElectronアプリケーションのウィンドウとネイティブUI要素を実装する専門コマンド。
  実行は専門エージェントに委譲します。

  🤖 起動エージェント:
  - `.claude/agents/electron-ui-dev.md`: Electron UI実装専門エージェント

  ⚙️ このコマンドの設定:
  - argument-hint: [window-type]
  - allowed-tools: Task（エージェント起動のみ）
  - model: sonnet

  トリガーキーワード: electron, window, menu, dialog, tray, titlebar, ウィンドウ
argument-hint: "[window-type]"
allowed-tools:
  - Task
model: sonnet
---

# Electronウィンドウ/UI作成

## 目的

`.claude/commands/ai/create-electron-window.md` の入力を受け取り、専門エージェントに実行を委譲します。

## エージェント起動フロー

### Phase 1: Electron UI実装専門エージェントの実行

**目的**: Electron UI実装専門エージェントに関するタスクを実行し、結果を整理する

**背景**: 専門知識が必要なため専門エージェントに委譲する

**ゴール**: Electron UI実装専門エージェントの結果と次アクションが提示された状態

**起動エージェント**: `.claude/agents/electron-ui-dev.md`

Task ツールで `.claude/agents/electron-ui-dev.md` を起動:

**コンテキスト**:

- 引数: $ARGUMENTS（[window-type]）

**依頼内容**:

- コマンドの目的に沿って実行する
- 結果と次アクションを提示する

**期待成果物**:

- `src/main/window.ts`
- `src/main/menu.ts`
- `src/main/tray.ts`
- `src/renderer/components/TitleBar.tsx`

**完了条件**:

- [ ] 主要な結果と根拠が整理されている
- [ ] 次のアクションが提示されている

## 使用例

```bash
/ai:create-electron-window [window-type]
```
