---
name: .claude/skills/ci-cd-pipelines/SKILL.md
description: |
  ジーン・キムのDevOps原則に基づくCI/CDパイプライン設計と実装を専門とするスキル。
  
  📖 参照書籍:
  - 『Continuous Delivery』（Jez Humble）: パイプライン
  
  📚 リソース参照:
  - `resources/Level1_basics.md`: レベル1の基礎ガイド
  - `resources/Level2_intermediate.md`: レベル2の実務ガイド
  - `resources/Level3_advanced.md`: レベル3の応用ガイド
  - `resources/Level4_expert.md`: レベル4の専門ガイド
  - `resources/caching-strategies.md`: pnpm/pnpm/yarn依存関係キャッシュ、Next.js/Turboビルドキャッシュの実装パターンと10GB制限対策
  - `resources/github-actions-syntax.md`: GitHub Actions構文リファレンス
  - `resources/legacy-skill.md`: 旧SKILL.mdの全文
  - `resources/parallelization.md`: 並列化とマトリクスビルド
  - `resources/pipeline-patterns.md`: パイプラインアーキテクチャパターン
  - `resources/quality-gates.md`: 静的チェック・テスト・セキュリティの3層品質ゲートとブランチ保護設定パターン
  - `scripts/log_usage.mjs`: 使用記録・自動評価スクリプト
  - `scripts/validate-skill.mjs`: スキル構造検証スクリプト
  - `scripts/validate-workflow.mjs`: GitHub Actions Workflow Validator
  - `templates/ci-workflow-template.yml`: CI Workflow Template
  - `templates/deploy-workflow-template.yml`: Deploy Workflow Template
  - `templates/reusable-workflow-template.yml`: Reusable Workflow Template
  - `resources/requirements-index.md`: 要求仕様の索引（docs/00-requirements と同期）
  
  Use proactively when handling ci cd pipelines tasks.
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

# CI/CD Pipelines

## 概要

ジーン・キムのDevOps原則に基づくCI/CDパイプライン設計と実装を専門とするスキル。

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
- GitHub Actionsワークフローを新規作成・最適化する時
- CI/CDパイプラインの品質ゲートを設計する時
- ビルド・テストの並列化による高速化が必要な時
- 再利用可能なワークフローパターンを設計する時

### 避けるべきこと
- アンチパターンや注意点を確認せずに進めることを避ける

## コマンドリファレンス

### リソース読み取り
```bash
cat .claude/skills/ci-cd-pipelines/resources/Level1_basics.md
cat .claude/skills/ci-cd-pipelines/resources/Level2_intermediate.md
cat .claude/skills/ci-cd-pipelines/resources/Level3_advanced.md
cat .claude/skills/ci-cd-pipelines/resources/Level4_expert.md
cat .claude/skills/ci-cd-pipelines/resources/caching-strategies.md
cat .claude/skills/ci-cd-pipelines/resources/github-actions-syntax.md
cat .claude/skills/ci-cd-pipelines/resources/legacy-skill.md
cat .claude/skills/ci-cd-pipelines/resources/parallelization.md
cat .claude/skills/ci-cd-pipelines/resources/pipeline-patterns.md
cat .claude/skills/ci-cd-pipelines/resources/quality-gates.md
```

### スクリプト実行
```bash
node .claude/skills/ci-cd-pipelines/scripts/log_usage.mjs --help
node .claude/skills/ci-cd-pipelines/scripts/validate-skill.mjs --help
node .claude/skills/ci-cd-pipelines/scripts/validate-workflow.mjs --help
```

### テンプレート参照
```bash
cat .claude/skills/ci-cd-pipelines/templates/ci-workflow-template.yml
cat .claude/skills/ci-cd-pipelines/templates/deploy-workflow-template.yml
cat .claude/skills/ci-cd-pipelines/templates/reusable-workflow-template.yml
```

## 変更履歴

| Version | Date | Changes |
| --- | --- | --- |
| 1.0.0 | 2025-12-24 | Spec alignment and required artifacts added |
