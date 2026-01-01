---
name: .claude/skills/prompt-versioning-management/SKILL.md
description: |
  プロンプトのライフサイクル管理を専門とするスキル。
  バージョン管理、デプロイ戦略、ロールバック、変更追跡により、
  本番環境で安全かつ効率的なプロンプト運用を実現します。
  
  📖 参照書籍:
  - 『The Pragmatic Programmer』（Andrew Hunt, David Thomas）: 手順設計
  
  📚 リソース参照:
  - `references/Level1_basics.md`: レベル1の基礎ガイド
  - `references/Level2_intermediate.md`: レベル2の実務ガイド
  - `references/Level3_advanced.md`: レベル3の応用ガイド
  - `references/Level4_expert.md`: レベル4の専門ガイド
  - `references/deployment-patterns.md`: Blue-Green、Canary、Feature Flagなどのデプロイ戦略と実装手順
  - `references/legacy-skill.md`: 旧SKILL.mdの全文
  - `references/rollback-procedures.md`: 即座・段階的ロールバック手順とフォールバック設計パターン
  - `references/versioning-strategies.md`: セマンティックバージョニング、変更分類、依存関係管理の詳細
  - `scripts/log_usage.mjs`: 使用記録・自動評価スクリプト
  - `scripts/validate-skill.mjs`: スキル構造検証スクリプト
  - `assets/changelog-template.md`: 変更ログテンプレート
  - `assets/deployment-checklist.md`: デプロイチェックリスト
  
  Use proactively when handling prompt versioning management tasks.
version: 1.0.0
level: 1
last_updated: 2025-12-24
references:
  - book: "The Pragmatic Programmer"
    author: "Andrew Hunt, David Thomas"
    concepts:
      - "手順設計"
      - "実践的改善"
---

# Prompt Versioning Management Skill

## 概要

プロンプトのライフサイクル管理を専門とするスキル。
バージョン管理、デプロイ戦略、ロールバック、変更追跡により、
本番環境で安全かつ効率的なプロンプト運用を実現します。

詳細な手順や背景は `references/Level1_basics.md` と `references/Level2_intermediate.md` を参照してください。


## ワークフロー

### Phase 1: 目的と前提の整理

**目的**: タスクの目的と前提条件を明確にする

**アクション**:

1. `references/Level1_basics.md` と `references/Level2_intermediate.md` を確認
2. 必要な references/scripts/templates を特定

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
- プロンプトを本番環境にデプロイする時
- プロンプトの変更履歴を管理する時
- ロールバック戦略を設計する時
- プロンプトの依存関係を追跡する時

### 避けるべきこと
- アンチパターンや注意点を確認せずに進めることを避ける

## コマンドリファレンス

### リソース読み取り
```bash
cat .claude/skills/prompt-versioning-management/references/Level1_basics.md
cat .claude/skills/prompt-versioning-management/references/Level2_intermediate.md
cat .claude/skills/prompt-versioning-management/references/Level3_advanced.md
cat .claude/skills/prompt-versioning-management/references/Level4_expert.md
cat .claude/skills/prompt-versioning-management/references/deployment-patterns.md
cat .claude/skills/prompt-versioning-management/references/legacy-skill.md
cat .claude/skills/prompt-versioning-management/references/rollback-procedures.md
cat .claude/skills/prompt-versioning-management/references/versioning-strategies.md
```

### スクリプト実行
```bash
node .claude/skills/prompt-versioning-management/scripts/log_usage.mjs --help
node .claude/skills/prompt-versioning-management/scripts/validate-skill.mjs --help
```

### テンプレート参照
```bash
cat .claude/skills/prompt-versioning-management/assets/changelog-template.md
cat .claude/skills/prompt-versioning-management/assets/deployment-checklist.md
```

## 変更履歴

| Version | Date | Changes |
| --- | --- | --- |
| 1.0.0 | 2025-12-24 | Spec alignment and required artifacts added |
