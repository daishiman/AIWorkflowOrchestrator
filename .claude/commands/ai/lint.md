---
description: |
  ESLintによるコード品質チェックを実行し、潜在的な問題を特定します。
  自動修正オプション付きでLint実行し、結果をレポートします。

  🤖 起動エージェント:
  - `.claude/agents/code-quality.md` (メイン)

  📚 利用可能スキル (フェーズ別):
  - Phase 1 (準備): `.claude/skills/eslint-configuration/SKILL.md`
  - Phase 2 (実行): `.claude/skills/linting-formatting-automation/SKILL.md`
  - Phase 3 (検証): `.claude/skills/code-smell-detection/SKILL.md` (必要時)

  ⚙️ このコマンドの設定:
  - model: sonnet (軽量・高速)
  - allowed-tools: Task, Bash(npm run lint*|pnpm lint*|eslint*), Write(docs/quality-reports/**)

  トリガーキーワード: lint, eslint, code quality, コードチェック, 静的解析
argument-hint: "[--fix]"
allowed-tools: ["Task", "Bash", "Write"]
model: sonnet
---

# ESLint コード品質チェック

## 目的

ESLintを実行してコード品質を分析し、潜在的な問題を特定し、オプションで自動修正を適用します。

## Phase 1: 準備

1. @code-quality エージェントをLintコンテキストで起動
2. `.claude/skills/eslint-configuration/SKILL.md` を参照してプロジェクト固有のESLint設定を確認
3. 引数解析: `$ARGUMENTS` から `--fix` フラグを検出

## Phase 2: 実行

1. `.claude/skills/linting-formatting-automation/SKILL.md` を参照して自動化パターンを確認
2. 検出されたパッケージマネージャーに基づいてLintコマンドを実行:
   - `pnpm lint` (優先)
   - `npm run lint`
   - `npx eslint .`
3. `--fix` フラグが指定されている場合: コマンドに `--fix` を追加
4. 出力とエラーメッセージをキャプチャ

## Phase 3: 検証

1. @code-quality エージェントからLint結果を分析
2. サマリーレポート生成:
   - 発見された問題の総数（エラー/警告）
   - 自動修正された数（該当する場合）
   - 手動対応が必要な重要問題
3. 問題が見つかった場合: 詳細レポートを `docs/quality-reports/lint-report-[timestamp].md` に書き込み

**期待される成果物**: アクション可能な推奨事項を含むLint実行レポート
