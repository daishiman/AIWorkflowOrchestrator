---
name: .claude/skills/railway-turso-management/SKILL.md
description: |
  Railway Database管理スキル。Railway環境グループ、Variables vs Secrets、
  Turso integration、Railway CLI統合、一時ファイルセキュリティを提供します。
  
  📖 参照書籍:
  - 『The Pragmatic Programmer』（Andrew Hunt, David Thomas）: 実践的改善
  
  📚 リソース参照:
  - `references/Level1_basics.md`: レベル1の基礎ガイド
  - `references/Level2_intermediate.md`: レベル2の実務ガイド
  - `references/Level3_advanced.md`: レベル3の応用ガイド
  - `references/Level4_expert.md`: レベル4の専門ガイド
  - `references/legacy-skill.md`: 旧SKILL.mdの全文
  - `references/railway-secrets-guide.md`: railway-secrets-guide のガイド
  - `references/railway-turso-guide.md`: Railway Turso 詳細ガイド
  - `scripts/log_usage.mjs`: 使用記録・自動評価スクリプト
  - `scripts/validate-skill.mjs`: スキル構造検証スクリプト
  - `references/requirements-index.md`: 要求仕様の索引（docs/00-requirements と同期）
  
  Use proactively when handling railway turso management tasks.
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

# Railway Turso Database Management

## 概要

Railway Database管理スキル。Railway環境グループ、Variables vs Secrets、
Turso integration、Railway CLI統合、一時ファイルセキュリティを提供します。

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
- RailwayプロジェクトのSecret管理を設計する時
- Railway環境グループを設定する時
- Turso integrationを設定する時
- Railway CLI経由のローカル開発を設定する時
- Railway Logsセキュリティを確保する時

### 避けるべきこと
- アンチパターンや注意点を確認せずに進めることを避ける

## コマンドリファレンス

### リソース読み取り
```bash
cat .claude/skills/railway-turso-management/references/Level1_basics.md
cat .claude/skills/railway-turso-management/references/Level2_intermediate.md
cat .claude/skills/railway-turso-management/references/Level3_advanced.md
cat .claude/skills/railway-turso-management/references/Level4_expert.md
cat .claude/skills/railway-turso-management/references/legacy-skill.md
cat .claude/skills/railway-turso-management/references/railway-secrets-guide.md
cat .claude/skills/railway-turso-management/references/railway-turso-guide.md
```

### スクリプト実行
```bash
node .claude/skills/railway-turso-management/scripts/log_usage.mjs --help
node .claude/skills/railway-turso-management/scripts/validate-skill.mjs --help
```

## 変更履歴

| Version | Date | Changes |
| --- | --- | --- |
| 1.0.0 | 2025-12-24 | Spec alignment and required artifacts added |
