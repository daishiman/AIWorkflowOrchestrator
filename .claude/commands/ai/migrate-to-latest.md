---
description: |
  フレームワーク・ライブラリの最新版移行を行うコマンド。

  Next.js、React、TypeScript等の主要ライブラリを最新版に移行し、
  破壊的変更への対応とコード修正を自動化します。

  🤖 起動エージェント:
  - Phase 2: `.claude/agents/dep-mgr.md` - 依存関係管理・アップグレード計画
  - Phase 3: `.claude/agents/logic-dev.md` - コード修正・マイグレーション実装

  📚 利用可能スキル（エージェントが参照）:
  - `.claude/skills/upgrade-strategies/SKILL.md` - マイグレーション戦略、破壊的変更対応
  - `.claude/skills/semantic-versioning/SKILL.md` - バージョン影響評価
  - `.claude/skills/refactoring-techniques/SKILL.md` - 安全なリファクタリング手法

  ⚙️ このコマンドの設定:
  - argument-hint: "[library-name]"（必須: next/react/typescript等）
  - allowed-tools: アップグレード実行とコード修正用
    • Task: dep-mgr/logic-devエージェント起動用
    • Bash(pnpm*|pnpm*): パッケージアップグレード専用
    • Read: コード・CHANGELOG確認用
    • Edit: 破壊的変更対応コード修正用
  - model: opus（複雑なマイグレーション調整が必要）

  📋 成果物:
  - アップグレードされたpackage.json
  - 破壊的変更対応コード修正
  - マイグレーションレポート（`docs/migrations/`）

  🎯 対応ライブラリ:
  - Next.js（App Router移行含む）
  - React（新機能対応）
  - TypeScript（型システム変更対応）
  - その他メジャーライブラリ

  トリガーキーワード: migrate, upgrade library, マイグレーション, アップグレード, 最新版移行
argument-hint: "[library-name]"
allowed-tools:
  - Task
  - Bash(pnpm*)
  - Read
  - Edit
model: opus
---

# 最新版マイグレーション

このコマンドは、ライブラリを最新版に移行します。

## 📋 実行フロー

### Phase 1: ライブラリとバージョン確認

```bash
library_name="$ARGUMENTS"

if [ -z "$library_name" ]; then
  エラー: ライブラリ名は必須です
  使用例: /ai:migrate-to-latest next
fi

# 現在バージョン確認
current_version=$(pnpm list $library_name --depth=0 | grep $library_name | awk '{print $NF}')
echo "現在: $library_name@$current_version"

# 最新バージョン確認
latest_version=$(pnpm view $library_name version)
echo "最新: $library_name@$latest_version"
```

### Phase 2: dep-mgrエージェントを起動（移行計画）

**使用エージェント**: `.claude/agents/dep-mgr.md`

**依頼内容**:
```markdown
「${library_name}」を最新版に移行する計画を作成してください。

**現在バージョン**: ${current_version}
**最新バージョン**: ${latest_version}

**要件**:
1. CHANGELOG分析:
   - 破壊的変更の特定
   - 非推奨APIの特定
   - 新機能の確認

2. 依存関係影響評価:
   - 他パッケージとの互換性
   - peer dependencies要件

3. マイグレーション計画:
   ```markdown
   ## マイグレーション計画

   ### 破壊的変更（3件）
   1. API変更: `getStaticProps` → `generateStaticParams`
   2. 設定変更: `next.config.js` → `next.config.mjs`
   3. インポートパス変更: `next/link` → 新しいLink API

   ### コード修正箇所
   - src/app/**/*.tsx: 15ファイル
   - next.config.js: 1ファイル

   ### 推定作業時間: 2-4時間
   ```

**スキル参照**: `.claude/skills/upgrade-strategies/SKILL.md`

**成果物**: マイグレーション計画書
```

### Phase 3: logic-devエージェントを起動（コード修正）

**使用エージェント**: `.claude/agents/logic-dev.md`

**依頼内容**:
```markdown
マイグレーション計画に基づいてコード修正を実行してください。

**入力**: ${migration_plan}

**要件**:
1. 破壊的変更への対応
2. 非推奨API の置き換え
3. 型エラー修正

**スキル参照**: `.claude/skills/refactoring-techniques/SKILL.md`

**成果物**: 修正されたコード
```

### Phase 4: 完了報告

```markdown
## マイグレーション完了

ライブラリ: ${library_name}
バージョン: ${current_version} → ${latest_version}

### 変更サマリー
- ファイル修正: ${file_count}件
- 破壊的変更対応: ${breaking_changes}件

### Next Steps
1. テスト実行: pnpm test
2. 型チェック: pnpm typecheck
3. ビルド確認: pnpm build
4. ローカル動作確認
```

## 使用例

```bash
/ai:migrate-to-latest next
/ai:migrate-to-latest react
/ai:migrate-to-latest typescript
```

## 参照

- dep-mgr: `.claude/agents/dep-mgr.md`
- logic-dev: `.claude/agents/logic-dev.md`
- upgrade-strategies: `.claude/skills/upgrade-strategies/SKILL.md`
