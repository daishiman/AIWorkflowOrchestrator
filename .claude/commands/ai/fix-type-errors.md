---
description: |
  TypeScript型エラーの修正を行うコマンド。

  型チェックで検出されたエラーを分析し、適切な型定義で修正します。

  🤖 起動エージェント:
  - Phase 2: `.claude/agents/schema-def.md` - 型定義専門エージェント

  📚 利用可能スキル（schema-defエージェントが参照）:
  - `.claude/skills/type-safety-patterns/SKILL.md` - 型安全性パターン、型ガード
  - `.claude/skills/typescript-advanced/SKILL.md` - 高度な型定義、ジェネリクス

  ⚙️ このコマンドの設定:
  - argument-hint: "[file-path]"（オプション: 対象ファイル指定）
  - allowed-tools: 型チェックと修正用
    • Task: schema-defエージェント起動用
    • Bash(tsc*): 型チェック実行専用
    • Read: コード確認用
    • Edit: 型エラー修正用
  - model: sonnet（標準的な型エラー修正タスク）

  📋 成果物:
  - 修正されたコード（型エラー解消）

  トリガーキーワード: type error, 型エラー, TypeScript エラー
argument-hint: "[file-path]"
allowed-tools:
  - Task
  - Bash(tsc*)
  - Read
  - Edit
model: sonnet
---

# TypeScript型エラー修正

このコマンドは、TypeScript型エラーを修正します。

## 📋 実行フロー

### Phase 1: 型チェック実行

```bash
file_path="$ARGUMENTS"

if [ -z "$file_path" ]; then
  # 全体チェック
  pnpm typecheck 2>&1 | tee type-errors.log
else
  # 特定ファイル
  tsc --noEmit "$file_path" 2>&1 | tee type-errors.log
fi
```

### Phase 2: schema-defエージェントを起動

**使用エージェント**: `.claude/agents/schema-def.md`

**依頼内容**:
```markdown
型エラーを修正してください。

**エラーログ**: ${cat type-errors.log}

**要件**:
1. 型エラーの特定
2. 適切な型定義で修正
3. 型チェック再実行

**スキル参照**: `.claude/skills/type-safety-patterns/SKILL.md`

**成果物**: 修正されたコード
```

### Phase 3: 完了報告

```markdown
## 型エラー修正完了

### 修正サマリー
- エラー数: ${error_count}件
- 修正ファイル: ${file_count}件

### 型チェック結果
✅ エラーなし
```

## 使用例

```bash
/ai:fix-type-errors
/ai:fix-type-errors src/features/sample/executor.ts
```

## 参照

- schema-def: `.claude/agents/schema-def.md`
- type-safety-patterns: `.claude/skills/type-safety-patterns/SKILL.md`
