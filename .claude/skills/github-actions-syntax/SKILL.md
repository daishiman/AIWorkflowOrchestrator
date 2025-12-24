---
name: .claude/skills/github-actions-syntax/SKILL.md
description: |
  GitHub Actions ワークフロー構文の完全リファレンス。
  専門分野:
  
  📖 参照書籍:
  - 『Continuous Delivery』（Jez Humble）: パイプライン
  
  📚 リソース参照:
  - `resources/Level1_basics.md`: レベル1の基礎ガイド
  - `resources/Level2_intermediate.md`: レベル2の実務ガイド
  - `resources/Level3_advanced.md`: レベル3の応用ガイド
  - `resources/Level4_expert.md`: レベル4の専門ガイド
  - `resources/event-triggers.md`: event-triggers の詳細ガイド
  - `resources/jobs-and-steps.md`: jobs-and-steps の詳細ガイド
  - `resources/legacy-skill.md`: 旧SKILL.mdの全文
  - `resources/permissions-and-env.md`: permissions-and-env の詳細ガイド
  - `resources/workflow-syntax-reference.md`: workflow-syntax-reference のリファレンス
  - `scripts/log_usage.mjs`: 使用記録・自動評価スクリプト
  - `scripts/validate-skill.mjs`: スキル構造検証スクリプト
  - `scripts/validate-workflow.mjs`: ワークフローを検証するスクリプト
  - `templates/workflow-template.yaml`: workflow-template のテンプレート
  - `resources/requirements-index.md`: 要求仕様の索引（docs/00-requirements と同期）
  
  Use proactively when handling github actions syntax tasks.
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

# GitHub Actions Workflow Syntax

## 概要

GitHub Actions ワークフロー構文の完全リファレンス。
専門分野:

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
- ワークフローファイル(.github/workflows/*.yml)を作成・編集する時
- イベントトリガーを設定する時
- ジョブやステップの構文エラーを解決する時
- パーミッション、環境変数、条件分岐を設定する時

### 避けるべきこと
- アンチパターンや注意点を確認せずに進めることを避ける

## コマンドリファレンス

### リソース読み取り
```bash
cat .claude/skills/github-actions-syntax/resources/Level1_basics.md
cat .claude/skills/github-actions-syntax/resources/Level2_intermediate.md
cat .claude/skills/github-actions-syntax/resources/Level3_advanced.md
cat .claude/skills/github-actions-syntax/resources/Level4_expert.md
cat .claude/skills/github-actions-syntax/resources/event-triggers.md
cat .claude/skills/github-actions-syntax/resources/jobs-and-steps.md
cat .claude/skills/github-actions-syntax/resources/legacy-skill.md
cat .claude/skills/github-actions-syntax/resources/permissions-and-env.md
cat .claude/skills/github-actions-syntax/resources/workflow-syntax-reference.md
```

### スクリプト実行
```bash
node .claude/skills/github-actions-syntax/scripts/log_usage.mjs --help
node .claude/skills/github-actions-syntax/scripts/validate-skill.mjs --help
node .claude/skills/github-actions-syntax/scripts/validate-workflow.mjs --help
```

### テンプレート参照
```bash
cat .claude/skills/github-actions-syntax/templates/workflow-template.yaml
```

## 変更履歴

| Version | Date | Changes |
| --- | --- | --- |
| 1.0.0 | 2025-12-24 | Spec alignment and required artifacts added |
