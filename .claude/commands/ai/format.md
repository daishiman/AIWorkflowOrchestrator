---
description: |
  Prettierによるコードフォーマットを実行し、一貫したコードスタイルを保証します。
  指定されたファイルまたはパターンに自動フォーマットを適用します。

  🤖 起動エージェント:
  - `.claude/agents/code-quality.md` (メイン)

  📚 利用可能スキル (フェーズ別):
  - Phase 1 (準備): `.claude/skills/prettier-integration/SKILL.md`
  - Phase 2 (実行): `.claude/skills/linting-formatting-automation/SKILL.md`

  ⚙️ このコマンドの設定:
  - model: sonnet (軽量・高速)
  - allowed-tools: Task, Bash(npx prettier*|pnpm format*), Edit

  トリガーキーワード: format, prettier, フォーマット, 整形, code style
argument-hint: "[target-pattern]"
allowed-tools:
   - Task
   - Bash
   - Edit
model: sonnet
---

# Prettier コードフォーマット

## 目的

Prettierを実行してコードベース全体に一貫したコードフォーマットを適用します。

## Phase 1: 準備

1. `.claude/agents/code-quality.md` エージェントをフォーマットコンテキストで起動
2. `.claude/skills/prettier-integration/SKILL.md` を参照して設定パターンを確認
3. 引数解析: `$1` でターゲットパターンを取得（デフォルト: すべてのサポートファイル）

## Phase 2: 実行

1. `.claude/skills/linting-formatting-automation/SKILL.md` を参照して自動化ワークフローを確認
2. ターゲットパターンを決定:
   - `$1` が指定されている場合: 指定されたパターンを使用（例: `src/**/*.ts`）
   - 空の場合: prettier設定のデフォルトパターンを使用
3. フォーマットコマンドを実行:
   - `pnpm format` (利用可能な場合)
   - `npx prettier --write [pattern]`
4. フォーマットされたファイルリストをキャプチャ

## Phase 3: 検証

1. `.claude/agents/code-quality.md` エージェントからフォーマット結果を分析
2. サマリー生成:
   - フォーマットされたファイル数
   - 影響を受けたファイルパス
   - フォーマットエラーまたは競合
3. フォーマットによって構文エラーが導入されていないか検証（クイック検証）

**期待される成果物**: サマリーレポート付きのフォーマット済みコードベース
