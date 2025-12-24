---
name: .claude/skills/docker-build-push-action/SKILL.md
description: |
  GitHub ActionsにおけるDockerイメージのビルドとプッシュの専門知識。
  専門分野:
  
  📖 参照書籍:
  - 『Docker Deep Dive』（Nigel Poulton）: コンテナ基礎
  
  📚 リソース参照:
  - `resources/Level1_basics.md`: レベル1の基礎ガイド
  - `resources/Level2_intermediate.md`: レベル2の実務ガイド
  - `resources/Level3_advanced.md`: レベル3の応用ガイド
  - `resources/Level4_expert.md`: レベル4の専門ガイド
  - `resources/build-push-syntax.md`: build-push-syntax の詳細ガイド
  - `resources/legacy-skill.md`: 旧SKILL.mdの全文
  - `resources/registry-auth.md`: registry-auth の詳細ガイド
  - `scripts/analyze-dockerfile.mjs`: dockerfileを分析するスクリプト
  - `scripts/log_usage.mjs`: 使用記録・自動評価スクリプト
  - `scripts/validate-skill.mjs`: スキル構造検証スクリプト
  - `templates/docker-workflow.yaml`: docker-workflow のテンプレート
  
  Use proactively when handling docker build push action tasks.
version: 1.0.0
level: 1
last_updated: 2025-12-24
references:
  - book: "Docker Deep Dive"
    author: "Nigel Poulton"
    concepts:
      - "コンテナ基礎"
      - "イメージ設計"
---

# Docker Build/Push Action

## 概要

GitHub ActionsにおけるDockerイメージのビルドとプッシュの専門知識。
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
- Dockerイメージをビルド・プッシュするワークフローを作成する時
- マルチプラットフォーム対応のイメージを構築する時
- コンテナレジストリへの認証を設定する時
- BuildKitキャッシュを最適化してビルド時間を短縮する時

### 避けるべきこと
- アンチパターンや注意点を確認せずに進めることを避ける

## コマンドリファレンス

### リソース読み取り
```bash
cat .claude/skills/docker-build-push-action/resources/Level1_basics.md
cat .claude/skills/docker-build-push-action/resources/Level2_intermediate.md
cat .claude/skills/docker-build-push-action/resources/Level3_advanced.md
cat .claude/skills/docker-build-push-action/resources/Level4_expert.md
cat .claude/skills/docker-build-push-action/resources/build-push-syntax.md
cat .claude/skills/docker-build-push-action/resources/legacy-skill.md
cat .claude/skills/docker-build-push-action/resources/registry-auth.md
```

### スクリプト実行
```bash
node .claude/skills/docker-build-push-action/scripts/analyze-dockerfile.mjs --help
node .claude/skills/docker-build-push-action/scripts/log_usage.mjs --help
node .claude/skills/docker-build-push-action/scripts/validate-skill.mjs --help
```

### テンプレート参照
```bash
cat .claude/skills/docker-build-push-action/templates/docker-workflow.yaml
```

## 変更履歴

| Version | Date | Changes |
| --- | --- | --- |
| 1.0.0 | 2025-12-24 | Spec alignment and required artifacts added |
