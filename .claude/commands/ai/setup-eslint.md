---
description: |
  ESLint設定の最適化を行うコマンド。

  プロジェクトに適したスタイルガイド（Airbnb/Google/Standard）を選択し、
  ESLint Flat Config形式で設定ファイルを生成・更新します。

  🤖 起動エージェント:
  - Phase 2: `.claude/agents/code-quality.md` - コード品質・静的解析専門エージェント

  📚 利用可能スキル（code-qualityエージェントが参照）:
  - `.claude/skills/eslint-configuration/SKILL.md` - Flat Config設定、ルール選択、プラグイン統合
  - `.claude/skills/code-style-guides/SKILL.md` - Airbnb/Google/Standard比較、選択基準
  - `.claude/skills/linting-automation/SKILL.md` - pre-commit hooks、CI/CD統合、自動修正

  ⚙️ このコマンドの設定:
  - argument-hint: "[style-guide]"（airbnb/google/standard、デフォルト: airbnb）
  - allowed-tools: ESLint設定用
    • Task: code-qualityエージェント起動用
    • Bash(pnpm*|pnpm*): ESLintパッケージインストール専用
    • Read: 既存設定確認用
    • Write: eslint.config.js生成用
    • Edit: package.json scripts更新用
  - model: sonnet（標準的なESLint設定タスク）

  📋 成果物:
  - `eslint.config.js`（Flat Config形式）
  - 更新されたpackage.json（lint scripts）
  - `.eslintignore`

  🎯 スタイルガイド:
  - **Airbnb**（推奨、React向け）: 厳格、React Best Practices
  - **Google**: モダン、読みやすさ重視
  - **Standard**: シンプル、設定レス

  トリガーキーワード: eslint, linting, code style, コードスタイル, 静的解析
argument-hint: "[style-guide]"
allowed-tools:
  - Task
  - Bash(pnpm*)
  - Read
  - Write
  - Edit
model: sonnet
---

# ESLint設定

このコマンドは、ESLintの設定を最適化します。

## 📋 実行フロー

### Phase 1: スタイルガイドの選択

**引数検証**:
```bash
style_guide="${ARGUMENTS:-airbnb}"

if ! [[ "$style_guide" =~ ^(airbnb|google|standard)$ ]]; then
  エラー: 無効なスタイルガイドです
  使用可能: airbnb, google, standard
fi
```

### Phase 2: code-qualityエージェントを起動

**使用エージェント**: `.claude/agents/code-quality.md`

**エージェントへの依頼内容**:
```markdown
ESLint設定を「${style_guide}」スタイルガイドで構築してください。

**要件**:
1. 必要パッケージのインストール:
   ```bash
   # Airbnb の場合
   pnpm add -D eslint \
     @typescript-eslint/parser \
     @typescript-eslint/eslint-plugin \
     eslint-config-airbnb-base \
     eslint-config-airbnb-typescript \
     eslint-plugin-import
   ```

2. eslint.config.js生成（Flat Config）:
   ```javascript
   import js from '@eslint/js';
   import typescript from '@typescript-eslint/eslint-plugin';
   import parser from '@typescript-eslint/parser';

   export default [
     js.configs.recommended,
     {
       files: ['**/*.ts', '**/*.tsx'],
       languageOptions: {
         parser,
         parserOptions: {
           project: './tsconfig.json',
         },
       },
       plugins: { '@typescript-eslint': typescript },
       rules: {
         // Airbnb rules
         '@typescript-eslint/no-unused-vars': 'error',
         '@typescript-eslint/no-explicit-any': 'warn',
       },
     },
   ];
   ```

3. package.json scripts追加:
   ```json
   {
     "scripts": {
       "lint": "eslint .",
       "lint:fix": "eslint . --fix"
     }
   }
   ```

4. .eslintignore生成:
   ```
   node_modules/
   .next/
   out/
   build/
   dist/
   ```

**スキル参照**:
- `.claude/skills/eslint-configuration/SKILL.md` - Flat Config設定方法
- `.claude/skills/code-style-guides/SKILL.md` - スタイルガイド比較

**成果物**: eslint.config.js、package.json、.eslintignore
```

### Phase 3: 完了報告

```markdown
## ESLint設定完了

スタイルガイド: ${style_guide}

### 設定内容
✅ Flat Config形式
✅ TypeScript対応
✅ ${style_guide} ルール適用

### Next Steps
1. リント実行: `pnpm lint`
2. 自動修正: `pnpm lint:fix`
3. pre-commit hook設定（推奨）
```

## 使用例

### Airbnb（推奨、React向け）

```bash
/ai:setup-eslint airbnb
```

### Google（モダン、読みやすさ重視）

```bash
/ai:setup-eslint google
```

### Standard（シンプル、設定レス）

```bash
/ai:setup-eslint standard
```

## スタイルガイド比較

| 特徴 | Airbnb | Google | Standard |
|------|--------|--------|----------|
| 厳格度 | 高 | 中 | 低 |
| React | ✅ | ⚠️ | ⚠️ |
| 設定量 | 多 | 中 | 少 |
| 推奨用途 | React/TypeScript | 汎用 | シンプルプロジェクト |

## ベストプラクティス

### pre-commit hook統合

```bash
# Husky + lint-staged
pnpm add -D husky lint-staged

# .husky/pre-commit
pnpm run lint:fix
```

### CI/CD統合

```yaml
# .github/workflows/lint.yml
- name: Run ESLint
  run: pnpm lint
```

## 参照

- code-quality: `.claude/agents/code-quality.md`
- eslint-configuration: `.claude/skills/eslint-configuration/SKILL.md`
