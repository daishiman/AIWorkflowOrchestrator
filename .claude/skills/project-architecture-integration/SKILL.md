---
name: .claude/skills/project-architecture-integration/SKILL.md
description: |
  プロジェクト固有のアーキテクチャ設計原則を専門とするスキル。
  ハイブリッドアーキテクチャ（shared/features）、データベース設計、REST API、
  テスト戦略、エラーハンドリング、CI/CDの原則をエージェント設計に統合します。
  
  📖 参照書籍:
  - 『Clean Architecture』（Robert C. Martin）: 依存関係ルール
  
  📚 リソース参照:
  - `resources/Level1_basics.md`: レベル1の基礎ガイド
  - `resources/Level2_intermediate.md`: レベル2の実務ガイド
  - `resources/Level3_advanced.md`: レベル3の応用ガイド
  - `resources/Level4_expert.md`: レベル4の専門ガイド
  - `resources/hybrid-architecture-guide.md`: Hybrid Architecture Guide
  - `resources/legacy-skill.md`: 旧SKILL.mdの全文
  - `scripts/check-architecture-compliance.mjs`: check-architecture-compliance.mjs
  - `scripts/log_usage.mjs`: 使用記録・自動評価スクリプト
  - `scripts/validate-skill.mjs`: スキル構造検証スクリプト
  - `templates/architecture-compliance-checklist.md`: アーキテクチャ準拠チェックリスト
  - `resources/requirements-index.md`: 要求仕様の索引（docs/00-requirements と同期）
  
  Use proactively when handling project architecture integration tasks.
version: 1.0.0
level: 1
last_updated: 2025-12-24
references:
  - book: "Clean Architecture"
    author: "Robert C. Martin"
    concepts:
      - "依存関係ルール"
      - "境界の設計"
---

# Project Architecture Integration

## 概要

プロジェクト固有のアーキテクチャ設計原則を専門とするスキル。
ハイブリッドアーキテクチャ（shared/features）、データベース設計、REST API、
テスト戦略、エラーハンドリング、CI/CDの原則をエージェント設計に統合します。

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
- エージェントがプロジェクト構造に準拠したファイルを生成する時
- データベース操作を行うエージェントを設計する時
- API連携エージェントを設計する時
- テスト実行エージェントを設計する時
- デプロイ関連エージェントを設計する時

### 避けるべきこと
- アンチパターンや注意点を確認せずに進めることを避ける

## コマンドリファレンス

### リソース読み取り
```bash
cat .claude/skills/project-architecture-integration/resources/Level1_basics.md
cat .claude/skills/project-architecture-integration/resources/Level2_intermediate.md
cat .claude/skills/project-architecture-integration/resources/Level3_advanced.md
cat .claude/skills/project-architecture-integration/resources/Level4_expert.md
cat .claude/skills/project-architecture-integration/resources/hybrid-architecture-guide.md
cat .claude/skills/project-architecture-integration/resources/legacy-skill.md
```

### スクリプト実行
```bash
node .claude/skills/project-architecture-integration/scripts/check-architecture-compliance.mjs --help
node .claude/skills/project-architecture-integration/scripts/log_usage.mjs --help
node .claude/skills/project-architecture-integration/scripts/validate-skill.mjs --help
```

### テンプレート参照
```bash
cat .claude/skills/project-architecture-integration/templates/architecture-compliance-checklist.md
```

## 変更履歴

| Version | Date | Changes |
| --- | --- | --- |
| 1.0.0 | 2025-12-24 | Spec alignment and required artifacts added |
