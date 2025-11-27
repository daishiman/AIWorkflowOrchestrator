---
name: command-documentation-patterns
description: |
  コマンドのドキュメンテーションを専門とするスキル。
  セルフドキュメンティング構造、使用例、トラブルシューティング、
  ユーザーフレンドリーな説明の作成方法を提供します。

  使用タイミング:
  - コマンドのドキュメントを作成する時
  - 使用例を充実させたい時
  - トラブルシューティングセクションを追加する時

  Use proactively when documenting commands, adding examples,
  or creating troubleshooting sections.

  📚 リソース参照:
  このスキルには以下のリソースが含まれています。
  必要に応じて該当するリソースを参照してください:

  - `.claude/skills/command-documentation-patterns/resources/documentation-guide.md`: セルフドキュメンティング構造とMarkdownセクション構成ガイド
  - `.claude/skills/command-documentation-patterns/scripts/validate-docs.mjs`: コマンドドキュメントの完全性検証スクリプト
  - `.claude/skills/command-documentation-patterns/templates/command-documentation.md`: description/argument-hint/allowed-toolsを含むコマンドテンプレート
version: 1.0.0
---

# Command Documentation Patterns

## 概要

このスキルは、Claude Codeコマンドのドキュメンテーションパターンを提供します。
セルフドキュメンティング構造、豊富な使用例、トラブルシューティングにより、
ユーザーフレンドリーで保守しやすいコマンドを作成できます。

**主要な価値**:
- 自己説明的なコマンド構造
- 豊富な使用例
- 実践的なトラブルシューティング
- 一貫したドキュメンテーション

**対象ユーザー**:
- コマンドを作成するエージェント（@command-arch）
- ドキュメントを充実させたい開発者
- ユーザーフレンドリーなコマンドを作成したいチーム

## リソース構造

```
command-documentation-patterns/
├── SKILL.md                                    # 本ファイル
├── resources/
│   ├── self-documenting-structure.md          # セルフドキュメンティング構造
│   ├── example-patterns.md                    # 使用例パターン
│   ├── troubleshooting-guide.md               # トラブルシューティングガイド
│   └── writing-style-guide.md                 # ライティングスタイルガイド
└── templates/
    ├── full-documentation-template.md         # 完全ドキュメントテンプレート
    └── minimal-documentation-template.md      # 最小ドキュメントテンプレート
```

### リソース種別

- **構造詳細** (`resources/*.md`): 各ドキュメンテーションパターンの詳細
- **スタイルガイド** (`resources/writing-style-guide.md`): ライティング規則
- **テンプレート** (`templates/`): ドキュメントテンプレート

## いつ使うか

### シナリオ1: 新規コマンドのドキュメント作成
**状況**: 新しいコマンドに適切なドキュメントを追加したい

**適用条件**:
- [ ] ドキュメント構造が不明
- [ ] 何を書くべきかわからない
- [ ] 一貫性のあるスタイルが欲しい

**期待される成果**: 完全なドキュメント

### シナリオ2: 使用例の追加
**状況**: コマンドの使い方を示す例を追加したい

**適用条件**:
- [ ] 基本的な使用例のみ
- [ ] 高度な使用例が欠けている
- [ ] エッジケースの例が必要

**期待される成果**: 豊富な使用例

### シナリオ3: トラブルシューティングの追加
**状況**: よくある問題と解決方法を文書化したい

**適用条件**:
- [ ] ユーザーが同じ問題で困っている
- [ ] エラーメッセージが不明確
- [ ] デバッグ方法が不明

**期待される成果**: 実用的なトラブルシューティング

## セルフドキュメンティング構造

### 完全版テンプレート

```markdown
---
description: |
  [4-8行の詳細な説明]
  [キーワードを含める]
  [使用タイミングを明記]
argument-hint: [arg1] [arg2]
---

# [Command Name]

## 📋 Purpose
[このコマンドの目的]

## 📥 Input
- `$ARGUMENTS`: [引数の説明]
- `$1`: [第一引数]（必要な場合）
- `$2`: [第二引数]（必要な場合）

## 📤 Output
- [生成されるファイル]
- [コンソール出力]
- [副作用]

## ⚙️ Prerequisites
- [必要な環境]
- [依存関係]
- [権限]

## 🔧 Configuration
このコマンドが参照する設定:
- `.env` ファイル
- `package.json`
- プロジェクト設定ファイル

## 🚀 Execution Steps
1. [ステップ1]
2. [ステップ2]
3. [ステップ3]

## 📝 Examples

### Example 1: Basic usage
```bash
/command basic-input
```

Expected output:
```
✅ Operation completed successfully
📁 Created: output.txt
```

### Example 2: Advanced usage
```bash
/command advanced-input --flag
```

Expected output:
```
🔄 Processing with advanced options...
✅ Done
```

## 🐛 Troubleshooting

### Problem 1: [Common issue]
**Symptoms**: [What user sees]

**Solution**:
1. [Step to fix]
2. [Step to verify]

### Problem 2: [Another issue]
**Symptoms**: [What user sees]

**Solution**:
[How to fix]

## ⚠️ Warnings
- [Important warning 1]
- [Important warning 2]

## 🔗 Related
- [Related command 1]
- [Related command 2]
- [Documentation link]
```

### 最小版テンプレート

```markdown
---
description: [Brief description]
---

# [Command Name]

## Purpose
[What this does]

## Usage
```bash
/command [arguments]
```

## Example
```bash
/command example-input
```

Expected: [What happens]
```

## セクション別ガイド

### Purpose セクション

**良い例**:
```markdown
## 📋 Purpose
This command creates a new React component with:
- TypeScript interface
- Unit tests
- Storybook story
- Export in index file

Use this when you need a fully-configured component ready for development.
```

**悪い例**:
```markdown
## Purpose
Creates component
```

### Input セクション

**詳細な説明**:
```markdown
## 📥 Input

### Required
- `$ARGUMENTS`: Component name in PascalCase
  - Must be unique
  - Must not conflict with HTML elements
  - Example: `UserProfile`, `NavigationBar`

### Optional Environment Variables
- `COMPONENT_TEMPLATE`: Custom template path
  - Default: `.claude/templates/component.tsx`
  - Override for project-specific templates
```

### Output セクション

**明確な期待値**:
```markdown
## 📤 Output

### Files Created
- `src/components/[Name]/[Name].tsx` - Component implementation
- `src/components/[Name]/[Name].test.tsx` - Unit tests
- `src/components/[Name]/[Name].stories.tsx` - Storybook stories
- `src/components/[Name]/index.ts` - Export file

### Console Output
```
✅ Component created: UserProfile
📁 Files created: 4
🧪 Tests generated: 3
📚 Story created: 1

Next steps:
1. cd src/components/UserProfile
2. Review generated files
3. npm test -- UserProfile
```
```

### Prerequisites セクション

**包括的なリスト**:
```markdown
## ⚙️ Prerequisites

### Environment
- Node.js >= 18.0.0
- npm >= 9.0.0

### Dependencies
- React >= 18.0.0
- TypeScript >= 5.0.0
- Testing Library installed

### Permissions
- Write access to `src/components/` directory
- Read access to template files

### Project Structure
Required directories:
```
src/
└── components/
    └── index.ts (must exist)
```
```

## 使用例パターン

### レベル1: 基本的な使用

```markdown
### Example 1: Basic Usage
最もシンプルな形式:

```bash
/create-component Button
```

What happens:
1. Creates Button component in `src/components/Button/`
2. Generates tests
3. Updates exports

Result:
```
✅ Button component created
📁 4 files created
🧪 3 tests passing
```
```

### レベル2: 一般的な使用

```markdown
### Example 2: With Props
Props付きコンポーネント:

```bash
/create-component UserCard
```

Then define props when prompted:
```typescript
interface UserCardProps {
  name: string;
  email: string;
  avatar?: string;
}
```

Result: Component with typed props interface
```

### レベル3: 高度な使用

```markdown
### Example 3: Custom Template
カスタムテンプレート使用:

```bash
COMPONENT_TEMPLATE=.claude/templates/advanced-component.tsx \
/create-component Dashboard
```

This uses your custom template with:
- Advanced state management
- Custom hooks
- Error boundaries

Result: Fully-featured component
```

### レベル4: エッジケース

```markdown
### Example 4: Nested Component
ネストされたコンポーネント:

```bash
/create-component forms/LoginForm
```

Creates:
```
src/
└── components/
    └── forms/
        └── LoginForm/
            ├── LoginForm.tsx
            ├── LoginForm.test.tsx
            └── index.ts
```

Note: Parent directory `forms/` must exist
```

## トラブルシューティングパターン

### パターン1: 症状 → 原因 → 解決

```markdown
## 🐛 Troubleshooting

### Component already exists
**Symptoms**:
```
❌ Error: Component 'Button' already exists
📁 Found at: src/components/Button/
```

**Cause**:
A component with this name already exists in the project.

**Solution**:
1. Choose a different name:
   ```bash
   /create-component PrimaryButton
   ```

2. Or delete existing component first:
   ```bash
   rm -rf src/components/Button/
   /create-component Button
   ```
```

### パターン2: チェックリスト形式

```markdown
### Build fails after component creation

Run through this checklist:

- [ ] Is TypeScript installed? `npm list typescript`
- [ ] Is tsconfig.json valid? `npx tsc --noEmit`
- [ ] Are all imports correct? Check file paths
- [ ] Is the component exported? Check `index.ts`
- [ ] Are tests passing? `npm test -- [ComponentName]`

If all checked and still failing:
```bash
# Clear cache and rebuild
rm -rf node_modules/.cache
npm run build
```
```

### パターン3: FAQ形式

```markdown
### FAQ

**Q: Can I create components in subdirectories?**
A: Yes, use forward slashes:
```bash
/create-component forms/LoginForm
/create-component modals/ConfirmDialog
```

**Q: How do I use a custom template?**
A: Set `COMPONENT_TEMPLATE` environment variable:
```bash
export COMPONENT_TEMPLATE=./my-template.tsx
/create-component MyComponent
```

**Q: Can I skip tests generation?**
A: Not with this command. To create component only:
```bash
/create-component-no-tests MyComponent
```
```

## ライティングスタイル

### 原則

1. **明確さ > 簡潔さ**
   - 曖昧さを避ける
   - 具体的な例を提供
   - 専門用語を説明

2. **能動態を使用**
   - ✓ "Creates a component"
   - ✗ "A component is created"

3. **現在形を使用**
   - ✓ "This command creates..."
   - ✗ "This command will create..."

4. **箇条書きを活用**
   - 長い文章より箇条書き
   - ステップは番号付き
   - オプションは記号

5. **コードブロックを使用**
   - コマンド例
   - 期待される出力
   - 設定ファイル例

### 絵文字の使用

```markdown
推奨される絵文字:

📋 Purpose / Overview
📥 Input
📤 Output
⚙️ Prerequisites / Configuration
🚀 Execution / Steps
📝 Examples
🐛 Troubleshooting
⚠️ Warnings
✅ Success
❌ Error
💡 Tips
🔗 Related / Links
📁 Files
🧪 Tests
```

### トーンとボイス

```
✓ フレンドリー:
  "Let's create a component together!"

✓ プロフェッショナル:
  "This command generates production-ready components."

✓ 助けになる:
  "If you encounter issues, check the troubleshooting section below."

✗ 技術的すぎ:
  "Instantiates a React functional component utilizing TypeScript generics..."

✗ カジュアルすぎ:
  "Yo, this thing makes components, ya know?"
```

## 詳細リソースの参照

### セルフドキュメンティング構造
詳細は `resources/self-documenting-structure.md` を参照

### 使用例パターン
詳細は `resources/example-patterns.md` を参照

### トラブルシューティングガイド
詳細は `resources/troubleshooting-guide.md` を参照

### ライティングスタイルガイド
詳細は `resources/writing-style-guide.md` を参照

### テンプレート
- 完全版: `templates/full-documentation-template.md`
- 最小版: `templates/minimal-documentation-template.md`

## コマンドリファレンス

このスキルで使用可能なリソース、テンプレートへのアクセスコマンド:

### リソース読み取り

```bash
# ドキュメンテーションガイド
cat .claude/skills/command-documentation-patterns/resources/documentation-guide.md
```

### 他のスキルのスクリプトを活用

```bash
# 知識ドキュメントの品質検証
node .claude/skills/knowledge-management/scripts/validate-knowledge.mjs .claude/skills/command-documentation-patterns/resources/documentation-guide.md

# トークン見積もり
node .claude/skills/context-optimization/scripts/estimate-tokens.mjs .claude/skills/command-documentation-patterns/SKILL.md

# ドキュメント構造分析
node .claude/skills/documentation-architecture/scripts/analyze-structure.mjs .claude/skills/command-documentation-patterns
```

## 関連スキル

- `.claude/skills/command-structure-fundamentals/SKILL.md` - description書き方
- `.claude/skills/command-arguments-system/SKILL.md` - argument-hint説明
- `.claude/skills/command-error-handling/SKILL.md` - エラーメッセージ設計

## 更新履歴

- v1.0.0 (2025-11-24): 初版作成
