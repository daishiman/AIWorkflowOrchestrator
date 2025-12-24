---
name: .claude/skills/connection-pooling/SKILL.md
description: |
  データベース接続管理の専門スキル。
  サーバーレス環境での接続管理、Tursoの接続管理とEmbedded Replicas、
  高負荷時の接続最適化を専門とします。
  
  📖 参照書籍:
  - 『The Pragmatic Programmer』（Andrew Hunt, David Thomas）: 実践的改善
  
  📚 リソース参照:
  - `resources/Level1_basics.md`: レベル1の基礎ガイド
  - `resources/Level2_intermediate.md`: レベル2の実務ガイド
  - `resources/Level3_advanced.md`: レベル3の応用ガイド
  - `resources/Level4_expert.md`: レベル4の専門ガイド
  - `resources/error-handling.md`: error-handling の詳細ガイド
  - `resources/legacy-skill.md`: 旧SKILL.mdの全文
  - `resources/pool-sizing-guide.md`: pool-sizing-guide のガイド
  - `resources/serverless-connections.md`: serverless-connections の詳細ガイド
  - `scripts/check-connections.mjs`: connectionsを検証するスクリプト
  - `scripts/log_usage.mjs`: 使用記録・自動評価スクリプト
  - `scripts/validate-skill.mjs`: スキル構造検証スクリプト
  - `templates/drizzle-config-template.ts`: drizzle-config-template のテンプレート
  - `resources/requirements-index.md`: 要求仕様の索引（docs/00-requirements と同期）
  
  Use proactively when handling connection pooling tasks.
version: 1.0.0
level: 1
last_updated: 2025-12-24
references:
  - book: "The Pragmatic Programmer"
    author: "Andrew Hunt, David Thomas"
    concepts:
      - "実践的改善"
      - "品質維持"
---

# Connection Pooling

## 概要

データベース接続管理の専門スキル。
サーバーレス環境での接続管理、Tursoの接続管理とEmbedded Replicas、
高負荷時の接続最適化を専門とします。

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
- 新規プロジェクトでDB接続を設定する時
- 接続設定のサイジングを決める時
- サーバーレス環境での接続問題を解決する時
- 接続エラーが頻発する時
- 高負荷時の接続最適化が必要な時

### 避けるべきこと
- アンチパターンや注意点を確認せずに進めることを避ける

## コマンドリファレンス

### リソース読み取り
```bash
cat .claude/skills/connection-pooling/resources/Level1_basics.md
cat .claude/skills/connection-pooling/resources/Level2_intermediate.md
cat .claude/skills/connection-pooling/resources/Level3_advanced.md
cat .claude/skills/connection-pooling/resources/Level4_expert.md
cat .claude/skills/connection-pooling/resources/error-handling.md
cat .claude/skills/connection-pooling/resources/legacy-skill.md
cat .claude/skills/connection-pooling/resources/pool-sizing-guide.md
cat .claude/skills/connection-pooling/resources/serverless-connections.md
```

### スクリプト実行
```bash
node .claude/skills/connection-pooling/scripts/check-connections.mjs --help
node .claude/skills/connection-pooling/scripts/log_usage.mjs --help
node .claude/skills/connection-pooling/scripts/validate-skill.mjs --help
```

### テンプレート参照
```bash
cat .claude/skills/connection-pooling/templates/drizzle-config-template.ts
```

## 変更履歴

| Version | Date | Changes |
| --- | --- | --- |
| 1.0.0 | 2025-12-24 | Spec alignment and required artifacts added |
