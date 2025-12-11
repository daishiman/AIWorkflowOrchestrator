---
description: |
  GitHub Actionsワークフローテンプレートを作成するコマンド。

  Organization全体で共有できるワークフローテンプレートを生成し、
  チーム全体のCI/CD品質を向上させます。

  🤖 起動エージェント:
  - Phase 2: `.claude/agents/gha-workflow-architect.md` - GitHub Actions専門エージェント

  📚 利用可能スキル（gha-workflow-architectエージェントが参照）:
  - `.claude/skills/workflow-templates/SKILL.md` - ワークフローパターン、ベストプラクティス
  - `.claude/skills/github-actions-optimization/SKILL.md` - 並列化、キャッシュ最適化
  - `.claude/skills/ci-cd-security/SKILL.md` - セキュアなCI/CD設計

  ⚙️ このコマンドの設定:
  - argument-hint: "[workflow-name]"（必須: test/build/deploy等）
  - allowed-tools: テンプレート生成用
    • Task: gha-workflow-architectエージェント起動用
    • Write(.github/workflow-templates/**): テンプレート生成専用
  - model: sonnet（標準的なワークフローテンプレート生成）

  📋 成果物:
  - `.github/workflow-templates/[workflow-name].yml`
  - `.github/workflow-templates/[workflow-name].properties.json`

  🎯 対応ワークフロー:
  - test: テスト自動化
  - build: ビルド・デプロイ
  - security: セキュリティスキャン

  トリガーキーワード: workflow template, GitHub Actions, CI/CD テンプレート
argument-hint: "[workflow-name]"
allowed-tools:
  - Task
  - Write(.github/workflow-templates/**)
model: sonnet
---

# ワークフローテンプレート作成

このコマンドは、GitHub Actionsワークフローテンプレートを作成します。

## 📋 実行フロー

### Phase 1: ワークフロー名の確認

```bash
workflow_name="$ARGUMENTS"

if [ -z "$workflow_name" ]; then
  エラー: ワークフロー名は必須です
  使用例: /ai:create-workflow-template test
fi
```

### Phase 2: gha-workflow-architectエージェントを起動

**使用エージェント**: `.claude/agents/gha-workflow-architect.md`

**依頼内容**:

```markdown
「${workflow_name}」ワークフローテンプレートを作成してください。

**要件**:

1. .github/workflow-templates/${workflow_name}.yml生成
2. .github/workflow-templates/${workflow_name}.properties.json生成

**スキル参照**: `.claude/skills/workflow-templates/SKILL.md`

**成果物**: ワークフローテンプレート
```

### Phase 3: 完了報告

```markdown
## ワークフローテンプレート作成完了

ワークフロー: ${workflow_name}

### 成果物

✅ .github/workflow-templates/${workflow_name}.yml
✅ .github/workflow-templates/${workflow_name}.properties.json
```

## 使用例

```bash
/ai:create-workflow-template test
```

## 参照

- gha-workflow-architect: `.claude/agents/gha-workflow-architect.md`
- workflow-templates: `.claude/skills/workflow-templates/SKILL.md`
