---
name: .claude/skills/api-versioning/SKILL.md
description: |
  APIバージョニング戦略と後方互換性管理を専門とするスキル。
  
  📖 参照書籍:
  - 『RESTful Web APIs』（Leonard Richardson）: リソース設計
  
  📚 リソース参照:
  - `resources/Level1_basics.md`: レベル1の基礎ガイド
  - `resources/Level2_intermediate.md`: レベル2の実務ガイド
  - `resources/Level3_advanced.md`: レベル3の応用ガイド
  - `resources/Level4_expert.md`: レベル4の専門ガイド
  - `resources/breaking-changes.md`: 破壊的変更の定義と影響範囲管理
  - `resources/deprecation-process.md`: 段階的廃止プロセスとHTTPヘッダー活用
  - `resources/legacy-skill.md`: 旧SKILL.mdの全文
  - `resources/versioning-strategies.md`: バージョニング方式の比較と選択基準
  - `scripts/check-breaking-changes.js`: 破壊的変更検出スクリプト
  - `scripts/generate-migration-guide.sh`: 移行ガイド自動生成スクリプト
  - `scripts/log_usage.mjs`: 使用記録・自動評価スクリプト
  - `scripts/validate-skill.mjs`: スキル構造検証スクリプト
  - `templates/deprecation-notice-template.md`: 非推奨化通知テンプレート
  - `templates/migration-guide-template.md`: バージョン間移行ガイドテンプレート
  - `resources/requirements-index.md`: 要求仕様の索引（docs/00-requirements と同期）
  
  Use proactively when handling api versioning tasks.
version: 1.0.0
level: 1
last_updated: 2025-12-24
references:
  - book: "RESTful Web APIs"
    author: "Leonard Richardson"
    concepts:
      - "リソース設計"
      - "HTTP設計"
---

# API Versioning スキル

## 概要

APIバージョニング戦略と後方互換性管理を専門とするスキル。

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
- APIバージョニング戦略を決定する時
- 破壊的変更を導入する時
- エンドポイントを非推奨化する時
- バージョン間の移行ガイドを作成する時

### 避けるべきこと
- アンチパターンや注意点を確認せずに進めることを避ける

## コマンドリファレンス

### リソース読み取り
```bash
cat .claude/skills/api-versioning/resources/Level1_basics.md
cat .claude/skills/api-versioning/resources/Level2_intermediate.md
cat .claude/skills/api-versioning/resources/Level3_advanced.md
cat .claude/skills/api-versioning/resources/Level4_expert.md
cat .claude/skills/api-versioning/resources/breaking-changes.md
cat .claude/skills/api-versioning/resources/deprecation-process.md
cat .claude/skills/api-versioning/resources/legacy-skill.md
cat .claude/skills/api-versioning/resources/versioning-strategies.md
```

### スクリプト実行
```bash
.claude/skills/api-versioning/scripts/check-breaking-changes.js
.claude/skills/api-versioning/scripts/generate-migration-guide.sh
node .claude/skills/api-versioning/scripts/log_usage.mjs --help
node .claude/skills/api-versioning/scripts/validate-skill.mjs --help
```

### テンプレート参照
```bash
cat .claude/skills/api-versioning/templates/deprecation-notice-template.md
cat .claude/skills/api-versioning/templates/migration-guide-template.md
```

## 変更履歴

| Version | Date | Changes |
| --- | --- | --- |
| 1.0.0 | 2025-12-24 | Spec alignment and required artifacts added |
