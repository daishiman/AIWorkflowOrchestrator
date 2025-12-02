---
description: |
  Claude Code hooksの設定を行う専門コマンド。

  🤖 起動エージェント:
  - `.claude/agents/hook-master.md`: Git hooks・Claude Code hooks統合専門エージェント

  📚 利用可能スキル（hook-masterエージェントが参照）:
  - `.claude/skills/claude-code-hooks/SKILL.md` - PreToolUse/PostToolUse/UserPromptSubmit設計
  - `.claude/skills/git-hooks-concepts/SKILL.md` - pre-commit/commit-msg/pre-push実装
  - `.claude/skills/automation-scripting/SKILL.md` - Bash/Node.js自動化スクリプト
  - `.claude/skills/linting-formatting-automation/SKILL.md` - ESLint/Prettier統合、lint-staged

  ⚙️ このコマンドの設定:
  - argument-hint: "[hook-type]"（オプション: PreToolUse/PostToolUse/Stop等、未指定時は全設定）
  - allowed-tools: hook-masterエージェント起動と最小限の確認用
    • Task: hook-masterエージェント起動用
    • Read: 既存hook・設定ファイル確認用
    • Edit: settings.json編集用（Claude Code hooks）
   - model: sonnet（標準的なhooks設定タスク）

  📋 成果物:
  - `.claude/settings.json`（Claude Code hooks設定）
  - `.husky/pre-commit`、`.husky/commit-msg`、`.husky/pre-push`（Git hooks）
  - `.claude/hooks/`（カスタムhookスクリプト）

  トリガーキーワード: hooks, git hooks, claude code hooks, 自動化, lint, format, validation
argument-hint: "[hook-type]"
allowed-tools:
  - Task
  - Read
  - Edit
model: sonnet
---

# Claude Code Hooks設定

このコマンドは、Claude Code hooksとGit hooksの統合設定を行います。

## 📋 実行フロー

### Phase 1: Hook種別の確認

**引数確認**:
```bash
# Hook種別が指定されている場合
hook-type: "$ARGUMENTS"（PreToolUse, PostToolUse, Stop等）

# 未指定の場合
hook-type: "all"（全hooks設定）
```

### Phase 2: hook-masterエージェントを起動

**使用エージェント**: `.claude/agents/hook-master.md`

**エージェントへの依頼内容**:
```markdown
Claude Code hooksとGit hooksの統合設定を行ってください。

**Hook種別**: ${hook-type}

**要件**:
1. Claude Code hooks設定（settings.json）:
   - PreToolUse: ツール実行前の検証（破壊的操作の確認、パス検証）
   - PostToolUse: ツール実行後の処理（ログ記録、通知）
   - UserPromptSubmit: プロンプト送信前の処理（文脈分析、最適化提案）
   - Stop: 停止時の処理（状態保存、クリーンアップ）

2. Git hooks統合:
   - pre-commit: lint、format、型チェック
   - commit-msg: コミットメッセージ検証（Conventional Commits準拠）
   - pre-push: テスト実行、セキュリティ監査

3. 自動化スクリプト:
   - lint-staged設定（package.json）
   - ESLint/Prettier実行スクリプト
   - カスタム検証ロジック

**スキル参照**:
- `.claude/skills/claude-code-hooks/SKILL.md`: Claude Code hooks設計パターン
- `.claude/skills/git-hooks-concepts/SKILL.md`: Git hooksライフサイクル
- `.claude/skills/automation-scripting/SKILL.md`: Bash/Node.jsスクリプト実装
- `.claude/skills/linting-formatting-automation/SKILL.md`: ESLint/Prettier統合

**成果物**:
- `.claude/settings.json`（Claude Code hooks設定、既存設定を保持）
- `.husky/`（Git hooks、huskyフレームワーク使用）
- `.claude/hooks/`（カスタムスクリプト）
- `package.json`（lint-staged設定追加）

**品質基準**:
- hooks実行時のパフォーマンス（pre-commit < 5秒、pre-push < 30秒）
- エラーハンドリング（失敗時の明確なメッセージ、リトライ可否）
- セキュリティ（パス検証、破壊的操作の確認）
- 既存設定の保持（settings.jsonマージ、Git設定保護）
```

### Phase 3: 検証と完了

**検証内容**:
1. settings.json構文チェック
2. Git hooks実行権限確認（chmod +x）
3. huskyインストール確認
4. lint-staged動作確認

**完了報告**:
- 設定されたhooks一覧
- 使用方法とテスト手順
- トラブルシューティングガイド

## 使用例

### 全hooks設定（デフォルト）

```bash
/ai:setup-hooks
```

### 特定のhook設定

```bash
# Claude Code hookのみ
/ai:setup-hooks PreToolUse

# Git hookのみ
/ai:setup-hooks pre-commit
```

## 設定されるhooks

### Claude Code Hooks

**PreToolUse（ツール実行前）**:
- 破壊的操作の確認（Write/Edit/Bash）
- パス検証（禁止パターン、許可パターン）
- コンテキスト分析（トークン使用量警告）

**PostToolUse（ツール実行後）**:
- 実行ログ記録（ツール名、引数、結果）
- エラー通知（Discord/Slack連携）
- メトリクス収集（実行時間、成功率）

**UserPromptSubmit（プロンプト送信前）**:
- 文脈分析（重要情報の欠落検出）
- 最適化提案（より効率的なツール使用提案）
- セキュリティチェック（秘密情報の混入検出）

### Git Hooks

**pre-commit**:
```bash
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

# ESLint + Prettier（lint-staged経由）
npx lint-staged

# TypeScript型チェック
pnpm typecheck

# テストファイルがある場合のみユニットテスト
git diff --cached --name-only | grep -q "\.test\." && pnpm test
```

**commit-msg**:
```bash
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

# Conventional Commits検証
npx --no -- commitlint --edit $1
```

**pre-push**:
```bash
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

# 全テスト実行
pnpm test

# セキュリティ監査
pnpm audit --audit-level=moderate
```

## トラブルシューティング

### hooksが実行されない

**原因**: Git hooksの実行権限がない

**解決策**:
```bash
chmod +x .husky/pre-commit
chmod +x .husky/commit-msg
chmod +x .husky/pre-push
```

### pre-commitが遅い

**原因**: lint-stagedの対象ファイルが多すぎる

**解決策**:
package.jsonのlint-staged設定を最適化:
```json
{
  "lint-staged": {
    "*.{ts,tsx}": ["eslint --fix", "prettier --write"],
    "*.{json,md}": ["prettier --write"]
  }
}
```

### settings.json構文エラー

**原因**: JSONフォーマット不正

**解決策**:
```bash
# JSONフォーマット検証
cat .claude/settings.json | jq .

# 自動修正
cat .claude/settings.json | jq . > .claude/settings.json.tmp
mv .claude/settings.json.tmp .claude/settings.json
```

## 参照

- hook-master エージェント: `.claude/agents/hook-master.md`
- claude-code-hooks スキル: `.claude/skills/claude-code-hooks/SKILL.md`
- git-hooks-concepts スキル: `.claude/skills/git-hooks-concepts/SKILL.md`
