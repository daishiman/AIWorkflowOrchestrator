# トークン最適化

## description圧縮

```yaml
# ❌ Before (冗長 - 45 tokens)
description: |
  This command creates a new React component with TypeScript.
  It generates the component file, test file, and story file.
  The component is created in the components directory.
  Also updates the index file to export the new component.

# ✅ After (簡潔 - 12 tokens)
description: Create React component with TypeScript, tests, and stories
```

**削減率**: 73%

## 本文圧縮

```markdown
# ❌ Before
## Step 1: Preparation
First, we need to check if the component already exists.
If it exists, we should ask the user if they want to overwrite it.
Then we need to create the directory structure if it doesn't exist.

# ✅ After
## Step 1: Check & Prepare
Check component existence
Create directories if needed
```

## 不要な情報削除

削除すべき:
- 冗長な説明
- 自明なステップ
- 詳細すぎるコメント
- 例示の過剰な繰り返し

保持すべき:
- コマンド構造
- 重要な条件分岐
- エラーハンドリング
- 必須パラメータ

## 測定

```bash
# トークン数確認（概算）
wc -w command.md  # 単語数 ≈ トークン数 × 0.75
```
