---
name: .claude/skills/workflow-templates/SKILL.md
description: |
  GitHub Actions ワークフローテンプレートの選択、カスタマイズ、生成スキル
  
  📖 参照書籍:
  - 『Continuous Delivery』（Jez Humble）: パイプライン
  
  📚 リソース参照:
  - `resources/Level1_basics.md`: レベル1の基礎ガイド
  - `resources/Level2_intermediate.md`: レベル2の実務ガイド
  - `resources/Level3_advanced.md`: レベル3の応用ガイド
  - `resources/Level4_expert.md`: レベル4の専門ガイド
  - `resources/legacy-skill.md`: 旧SKILL.mdの全文
  - `resources/project-type-selection.md`: Project Type Selectionリソース
  - `resources/template-types.md`: Template Typesリソース
  - `scripts/generate-workflow.mjs`: Generate Workflowスクリプト
  - `scripts/log_usage.mjs`: 使用記録・自動評価スクリプト
  - `scripts/validate-skill.mjs`: スキル構造検証スクリプト
  - `templates/cd-template.yaml`: CD（継続的デプロイ）テンプレート：環境別デプロイ、ヘルスチェック、通知統合
  - `templates/ci-template.yaml`: CI（継続的統合）テンプレート：Lint、テスト、ビルド、複数バージョン対応
  - `templates/docker-template.yaml`: Dockerテンプレート
  - `templates/nodejs-template.yaml`: Nodejsテンプレート
  - `resources/requirements-index.md`: 要求仕様の索引（docs/00-requirements と同期）
  
  Use proactively when handling workflow templates tasks.
version: 1.0.0
level: 1
last_updated: 2025-12-24
references:
  - book: "Continuous Delivery"
    author: "Jez Humble"
    concepts:
      - "パイプライン"
      - "自動化"
---

# Workflow Templates

## 概要

GitHub Actions ワークフローテンプレートの選択、カスタマイズ、生成スキル

詳細な手順や背景は `resources/Level1_basics.md` と `resources/Level2_intermediate.md` を参照してください。


## ワークフロー

### Phase 1: 目的と前提の整理

**目的**: タスクの目的と前提条件を明確にする

**アクション**:

1. `resources/Level1_basics.md` と `resources/Level2_intermediate.md` を確認
2. 必要な resources/scripts/templates を特定

### Phase 2: スキル適用

**目的**: スキルの指針に従って具体的な作業を進める

**アクション**:

1. 関連リソースやテンプレートを参照しながら作業を実施
2. 重要な判断点をメモとして残す

### Phase 3: 検証と記録

**目的**: 成果物の検証と実行記録の保存

**アクション**:

1. `scripts/validate-skill.mjs` でスキル構造を確認
2. 成果物が目的に合致するか確認
3. `scripts/log_usage.mjs` を実行して記録を残す


## ベストプラクティス

### すべきこと
- resources/Level1_basics.md を参照し、適用範囲を明確にする
- resources/Level2_intermediate.md を参照し、実務手順を整理する

### 避けるべきこと
- アンチパターンや注意点を確認せずに進めることを避ける

## コマンドリファレンス

### リソース読み取り
```bash
cat .claude/skills/workflow-templates/resources/Level1_basics.md
cat .claude/skills/workflow-templates/resources/Level2_intermediate.md
cat .claude/skills/workflow-templates/resources/Level3_advanced.md
cat .claude/skills/workflow-templates/resources/Level4_expert.md
cat .claude/skills/workflow-templates/resources/legacy-skill.md
cat .claude/skills/workflow-templates/resources/project-type-selection.md
cat .claude/skills/workflow-templates/resources/template-types.md
```

### スクリプト実行
```bash
node .claude/skills/workflow-templates/scripts/generate-workflow.mjs --help
node .claude/skills/workflow-templates/scripts/log_usage.mjs --help
node .claude/skills/workflow-templates/scripts/validate-skill.mjs --help
```

### テンプレート参照
```bash
cat .claude/skills/workflow-templates/templates/cd-template.yaml
cat .claude/skills/workflow-templates/templates/ci-template.yaml
cat .claude/skills/workflow-templates/templates/docker-template.yaml
cat .claude/skills/workflow-templates/templates/nodejs-template.yaml
```

## 変更履歴

| Version | Date | Changes |
| --- | --- | --- |
| 1.0.0 | 2025-12-24 | Spec alignment and required artifacts added |
