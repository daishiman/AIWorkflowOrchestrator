---
description: |
  Prettier設定を行うコマンド。

  コードフォーマッターPrettierの設定ファイルを生成し、
  ESLintとの統合・エディタ統合を設定します。

  🤖 起動エージェント:
  - Phase 2: `.claude/agents/code-quality.md` - コードフォーマット専門エージェント

  📚 利用可能スキル（code-qualityエージェントが参照）:
  - `.claude/skills/prettier-integration/SKILL.md` - Prettier設定、ESLint統合、エディタ設定
  - `.claude/skills/code-style-guides/SKILL.md` - フォーマット規則、統一基準

  ⚙️ このコマンドの設定:
  - argument-hint: なし
  - allowed-tools: Prettier設定用
    • Task: code-qualityエージェント起動用
    • Bash(pnpm*): Prettierインストール専用
    • Write(.prettierrc*): 設定ファイル生成専用
  - model: sonnet（シンプルなPrettier設定タスク）

  📋 成果物:
  - `.prettierrc`（設定ファイル）
  - `.prettierignore`
  - package.json（format scripts）

  🎯 フォーマット規則:
  - シングルクォート、セミコロンあり、タブ幅2
  - 行幅80文字、Trailing Comma ES5

  トリガーキーワード: prettier, code format, フォーマット, 整形
argument-hint: ""
allowed-tools:
  - Task
  - Bash(pnpm*)
  - Write(.prettierrc*)
model: sonnet
---

# Prettier設定

このコマンドは、Prettierの設定を行います。

## 📋 実行フロー

### Phase 1: code-qualityエージェントを起動

**使用エージェント**: `.claude/agents/code-quality.md`

**エージェントへの依頼内容**:

````markdown
Prettier設定を構築してください。

**要件**:

1. インストール:
   ```bash
   pnpm add -D prettier eslint-config-prettier
   ```
````

2. .prettierrc生成:

   ```json
   {
     "semi": true,
     "singleQuote": true,
     "tabWidth": 2,
     "trailingComma": "es5",
     "printWidth": 80,
     "arrowParens": "always"
   }
   ```

3. .prettierignore生成:

   ```
   node_modules/
   .next/
   out/
   dist/
   pnpm-lock.yaml
   ```

4. package.json scripts:
   ```json
   {
     "scripts": {
       "format": "prettier --write .",
       "format:check": "prettier --check ."
     }
   }
   ```

**スキル参照**: `.claude/skills/prettier-integration/SKILL.md`

**成果物**: .prettierrc、.prettierignore、package.json

````

### Phase 2: 完了報告

```markdown
## Prettier設定完了

### 設定内容
✅ シングルクォート
✅ セミコロンあり
✅ タブ幅2

### Next Steps
1. フォーマット実行: `pnpm format`
2. エディタ統合（VSCode: Format On Save）
````

## 使用例

```bash
/ai:setup-prettier
```

自動実行:

1. Prettierインストール
2. .prettierrc生成
3. ESLint統合設定
4. package.json scripts追加

## エディタ統合

### VSCode

`.vscode/settings.json`:

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode"
}
```

## 参照

- code-quality: `.claude/agents/code-quality.md`
- prettier-integration: `.claude/skills/prettier-integration/SKILL.md`
