---
description: |
  未使用コード・ファイルの削除を行うコマンド。

  デッドコード、未使用インポート、未使用ファイルを検出し、
  安全に削除してコードベースをクリーンに保ちます。

  🤖 起動エージェント:
  - Phase 2: `.claude/agents/code-quality.md` - 未使用コード検出専門
  - Phase 3: `.claude/agents/arch-police.md` - アーキテクチャ検証専門

  📚 利用可能スキル（エージェントが参照）:
  - `.claude/skills/code-smell-detection/SKILL.md` - デッドコード、重複コード検出
  - `.claude/skills/dependency-analysis/SKILL.md` - 未使用依存関係分析
  - `.claude/skills/refactoring-techniques/SKILL.md` - 安全なリファクタリング手法

  ⚙️ このコマンドの設定:
  - argument-hint: "[--dry-run]"（ドライランフラグ、実際の削除前に確認）
  - allowed-tools: コード分析と削除用
    • Task: code-quality/arch-policeエージェント起動用
    • Read: コード確認用
    • Grep, Glob: 未使用コード検索用
    • Edit: 未使用インポート削除用
    • Bash(rm*): ファイル削除専用（--dry-run時は実行なし）
  - model: sonnet（標準的なコードクリーンアップタスク）

  📋 成果物:
  - クリーンなコードベース（未使用コード・ファイル削除済み）
  - 削除レポート（`docs/maintenance/cleanup-report.md`）

  🎯 検出対象:
  - 未使用インポート
  - デッドコード（到達不能コード）
  - 未使用ファイル
  - 重複コード

  トリガーキーワード: clean code, dead code, unused files, コードクリーンアップ, 未使用コード削除
argument-hint: "[--dry-run]"
allowed-tools:
  - Task
  - Read
  - Grep
  - Glob
  - Edit
  - Bash(rm*)
model: sonnet
---

# コードベースクリーンアップ

このコマンドは、未使用コード・ファイルを削除します。

## 📋 実行フロー

### Phase 1: ドライランフラグ確認

**引数検証**:

```bash
dry_run=false
if [[ "$ARGUMENTS" == "--dry-run" ]]; then
  dry_run=true
  echo "ドライランモード: 実際の削除は行いません"
fi
```

### Phase 2: code-qualityエージェントを起動（未使用コード検出）

**使用エージェント**: `.claude/agents/code-quality.md`

**エージェントへの依頼内容**:

````markdown
未使用コード・ファイルを検出してください。

**要件**:

1. 未使用インポート検出:
   ```bash
   # ESLint no-unused-vars
   pnpm lint --rule 'no-unused-vars: error'
   ```
````

2. 未使用ファイル検出:
   - すべてのTypeScriptファイルをスキャン
   - インポートされていないファイルを特定
   - エントリーポイントからの到達性分析

3. デッドコード検出:
   - 到達不能なコードブロック
   - 使用されない関数・クラス
   - 条件が常にfalseのif文

4. 検出結果レポート:

   ```markdown
   ## クリーンアップ対象

   ### 未使用インポート（12件）

   - src/features/sample/executor.ts: `import { unused } from 'lib'`
   - src/app/page.tsx: `import React from 'react'`（React 17+不要）

   ### 未使用ファイル（5件）

   - src/utils/old-helper.ts（参照なし）
   - src/components/deprecated.tsx（参照なし）

   ### デッドコード（3件）

   - src/features/sample/executor.ts:45-50（到達不能）
   ```

**スキル参照**:

- `.claude/skills/code-smell-detection/SKILL.md` - デッドコード検出
- `.claude/skills/dependency-analysis/SKILL.md` - 依存関係分析

**成果物**: クリーンアップ候補リスト

````

### Phase 3: arch-policeエージェントを起動（影響範囲確認）

**使用エージェント**: `.claude/agents/arch-police.md`

**エージェントへの依頼内容**:
```markdown
削除候補の影響範囲を確認してください。

**入力**: ${cleanup_candidates}

**要件**:
1. 依存関係チェック:
   - 削除候補が他ファイルから参照されていないか確認
   - テストファイルからの参照も確認

2. 安全性評価:
   - **Safe**: 削除しても影響なし
   - **Warning**: テストファイルからのみ参照
   - **Unsafe**: 他ファイルから参照あり（削除不可）

3. 削除推奨リスト生成（Safe + Warningのみ）

**スキル参照**: `.claude/skills/dependency-analysis/SKILL.md`

**成果物**: 安全な削除候補リスト
````

### Phase 4: クリーンアップ実行

```bash
if [ "$dry_run" = true ]; then
  echo "ドライラン: 以下のファイルが削除されます"
  cat cleanup-list.txt
else
  # 未使用インポート削除（ESLint --fix）
  pnpm lint --fix

  # 未使用ファイル削除
  while IFS= read -r file; do
    echo "削除: $file"
    rm "$file"
  done < cleanup-list.txt

  # Gitステータス確認
  git status
fi
```

### Phase 5: 完了報告

```markdown
## クリーンアップ完了

### 削除サマリー

- 未使用インポート: ${import_count}件削除
- 未使用ファイル: ${file_count}件削除
- デッドコード: ${dead_code_count}行削除

### ディスク削減

- 削減サイズ: ${size_reduced} KB

### Next Steps

1. テスト実行: `pnpm test`（削除影響確認）
2. ビルド確認: `pnpm build`
3. コミット: `git commit -m "chore: remove unused code"`
```

## 使用例

### ドライラン（推奨、最初の実行）

```bash
/ai:clean-codebase --dry-run
```

削除候補を表示、実際の削除は行わない

### 実際のクリーンアップ

```bash
/ai:clean-codebase
```

未使用コード・ファイルを実際に削除

## クリーンアップレポート例

````markdown
# コードベースクリーンアップレポート

実行日時: 2025-01-15 10:00:00

## 削除サマリー

- 未使用インポート: 12件
- 未使用ファイル: 5件
- デッドコード: 3ブロック（150行）
- ディスク削減: 45 KB

## 詳細

### 未使用インポート削除（12件）

1. `src/features/sample/executor.ts:3`

   ```typescript
   // Before
   import { unused, used } from "lib";

   // After
   import { used } from "lib";
   ```
````

### 未使用ファイル削除（5件）

1. `src/utils/old-helper.ts`（参照: 0件）
2. `src/components/deprecated.tsx`（参照: 0件）
3. `src/lib/legacy.ts`（参照: 0件）

### デッドコード削除（3ブロック）

1. `src/features/sample/executor.ts:45-50`
   ```typescript
   // 削除: 到達不能コード
   if (false) {
     console.log("Never executed");
   }
   ```

## 影響確認

✅ テスト: すべて合格
✅ ビルド: 成功
✅ 型チェック: エラーなし

````

## トラブルシューティング

### 削除後のテスト失敗

**原因**: 間接的な依存関係を見落とし

**解決策**:
```bash
# 変更をリバート
git checkout .

# より慎重な削除（1ファイルずつ）
````

### 未使用と誤検出

**原因**: 動的インポートやリフレクションによる参照

**解決策**:

```bash
# 除外リスト作成
# .cleanupignore
src/features/dynamic-loaded/
src/plugins/
```

## ベストプラクティス

### 定期的なクリーンアップ

```bash
# 月次または四半期毎に実行
/ai:clean-codebase --dry-run
# レビュー後
/ai:clean-codebase
```

### クリーンアップ前の準備

```bash
# 1. ブランチ作成
git checkout -b chore/cleanup-codebase

# 2. テスト実行（現状確認）
pnpm test

# 3. クリーンアップ
/ai:clean-codebase --dry-run
/ai:clean-codebase

# 4. 検証
pnpm test && pnpm build
```

## 参照

- code-quality: `.claude/agents/code-quality.md`
- arch-police: `.claude/agents/arch-police.md`
- code-smell-detection: `.claude/skills/code-smell-detection/SKILL.md`
