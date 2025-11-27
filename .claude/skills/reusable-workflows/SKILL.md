---
skill_name: reusable-workflows
version: 1.0.0
description: |
  GitHub Actions再利用可能ワークフローの設計と実装。
  workflow_call イベント、入力/出力/シークレット定義、呼び出しパターン、
  合成設計、継承、チェーンパターンの専門知識を提供。
triggers:
  - "再利用可能なワークフロー"
  - "workflow_call"
  - "共通ワークフロー"
  - "ワークフロー合成"
  - "ワークフローテンプレート"
related_skills:
  - ".claude/skills/github-actions-syntax/SKILL.md"
  - ".claude/skills/github-actions-expressions/SKILL.md"
  - ".claude/skills/composite-actions/SKILL.md"
  - ".claude/skills/workflow-templates/SKILL.md"
tags:
  - github-actions
  - reusability
  - workflow-design
  - composition
---

# Reusable Workflows Skill

GitHub Actions再利用可能ワークフローの設計と実装の専門知識。

## 📁 Directory Structure

```
.claude/skills/reusable-workflows/
├── SKILL.md                          # このファイル (~150-200行)
├── resources/
│   ├── workflow-call-syntax.md       # workflow_call詳細定義
│   ├── caller-patterns.md            # 呼び出しパターン
│   └── design-patterns.md            # 合成・継承・チェーン
├── templates/
│   ├── reusable-workflow.yaml        # 再利用可能ワークフロー
│   └── caller-workflow.yaml          # 呼び出し側テンプレート
└── scripts/
    └── validate-reusable.mjs         # 検証スクリプト
```

## 🎯 Core Concept

再利用可能ワークフローは `workflow_call` イベントで定義され、他のワークフローから呼び出し可能:

```yaml
# .github/workflows/reusable-build.yml
name: Reusable Build

on:
  workflow_call:
    inputs:
      node-version:
        required: true
        type: string
    outputs:
      build-id:
        value: ${{ jobs.build.outputs.build-id }}
    secrets:
      NPM_TOKEN:
        required: true

jobs:
  build:
    runs-on: ubuntu-latest
    outputs:
      build-id: ${{ steps.build.outputs.id }}
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ inputs.node-version }}
      - run: npm ci
        env:
          NPM_TOKEN: ${{ secrets.NPM_TOKEN }}
```

## 📚 Command Reference

### リソース参照

```bash
# workflow_call 構文詳細
cat .claude/skills/reusable-workflows/resources/workflow-call-syntax.md

# 呼び出しパターン
cat .claude/skills/reusable-workflows/resources/caller-patterns.md

# 設計パターン
cat .claude/skills/reusable-workflows/resources/design-patterns.md
```

### テンプレート使用

```bash
# 再利用可能ワークフローテンプレート
cat .claude/skills/reusable-workflows/templates/reusable-workflow.yaml

# 呼び出し側テンプレート
cat .claude/skills/reusable-workflows/templates/caller-workflow.yaml
```

### 検証

```bash
# 再利用可能ワークフロー検証
node .claude/skills/reusable-workflows/scripts/validate-reusable.mjs <workflow.yml>
```

## 🔄 Calling Reusable Workflows

```yaml
# .github/workflows/ci.yml
name: CI

on: [push]

jobs:
  build:
    uses: ./.github/workflows/reusable-build.yml
    with:
      node-version: '20'
    secrets:
      NPM_TOKEN: ${{ secrets.NPM_TOKEN }}

  test:
    needs: build
    uses: ./.github/workflows/reusable-test.yml
    with:
      build-id: ${{ needs.build.outputs.build-id }}
```

## 💡 Key Features

### Input Types
- `string`: テキスト値
- `boolean`: true/false
- `number`: 数値

### Output Propagation
ジョブ出力をワークフロー出力として伝播:
```yaml
outputs:
  result:
    value: ${{ jobs.main.outputs.result }}
```

### Secret Inheritance
```yaml
# すべてのシークレットを継承
secrets: inherit

# または個別に指定
secrets:
  TOKEN: ${{ secrets.TOKEN }}
```

## 🎨 Design Patterns

1. **Composition**: 複数ワークフローを組み合わせる
2. **Inheritance**: 基本ワークフローを継承
3. **Chaining**: ワークフローを連鎖実行
4. **Matrix**: 複数構成で並列実行

詳細は `resources/design-patterns.md` を参照。

## 🔗 Related Skills

- **github-actions-syntax**: `.claude/skills/github-actions-syntax/SKILL.md`
- **github-actions-expressions**: `.claude/skills/github-actions-expressions/SKILL.md`
- **composite-actions**: `.claude/skills/composite-actions/SKILL.md`
- **workflow-templates**: `.claude/skills/workflow-templates/SKILL.md`

## 📖 When to Use

- 共通CI/CDパターンの標準化
- 複数プロジェクト間でワークフローを共有
- ワークフローロジックの重複を削減
- チーム全体で一貫したパイプライン
- メンテナンスコストの削減

詳細な構文、呼び出しパターン、設計パターンは `resources/` を参照してください。
