---
name: .claude/skills/backup-recovery/SKILL.md
description: |
  『Database Reliability Engineering』に基づく、データ損失を許さない堅牢なバックアップ・復旧戦略スキル。
  
  📖 参照書籍:
  - 『The Pragmatic Programmer』（Andrew Hunt, David Thomas）: 実践的改善
  
  📚 リソース参照:
  - `resources/Level1_basics.md`: レベル1の基礎ガイド
  - `resources/Level2_intermediate.md`: レベル2の実務ガイド
  - `resources/Level3_advanced.md`: レベル3の応用ガイド
  - `resources/Level4_expert.md`: レベル4の専門ガイド
  - `resources/backup-strategy-layers.md`: 多層防御バックアップ戦略
  - `resources/disaster-recovery-planning.md`: 災害復旧計画（DR計画）ガイド
  - `resources/legacy-skill.md`: 旧SKILL.mdの全文
  - `resources/recovery-procedures.md`: 3つのシナリオ別復旧手順（行単位誤削除・テーブル復旧・DB全体復旧）とPITR・エクスポート・整合性確認の実践ガイド
  - `resources/rpo-rto-design.md`: RPO/RTO設計ガイド
  - `resources/turso-backup-guide.md`: Tursoバックアップガイド
  - `scripts/log_usage.mjs`: 使用記録・自動評価スクリプト
  - `scripts/validate-skill.mjs`: スキル構造検証スクリプト
  - `scripts/verify-backup.mjs`: バックアップ検証スクリプト
  - `templates/backup-policy-template.md`: バックアップポリシー
  - `templates/recovery-runbook-template.md`: 緊急連絡先・接続情報・復旧手順・チェックリストを含む実践的な復旧作業マニュアルテンプレート
  - `resources/requirements-index.md`: 要求仕様の索引（docs/00-requirements と同期）
  
  Use proactively when handling backup recovery tasks.
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

# Backup & Recovery

## 概要

『Database Reliability Engineering』に基づく、データ損失を許さない堅牢なバックアップ・復旧戦略スキル。

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
- バックアップ戦略を設計・レビューする時
- RPO/RTO要件を定義する時
- 復旧手順を文書化する時
- バックアップからの復旧テストを計画する時
- 災害復旧計画を策定する時

### 避けるべきこと
- アンチパターンや注意点を確認せずに進めることを避ける

## コマンドリファレンス

### リソース読み取り
```bash
cat .claude/skills/backup-recovery/resources/Level1_basics.md
cat .claude/skills/backup-recovery/resources/Level2_intermediate.md
cat .claude/skills/backup-recovery/resources/Level3_advanced.md
cat .claude/skills/backup-recovery/resources/Level4_expert.md
cat .claude/skills/backup-recovery/resources/backup-strategy-layers.md
cat .claude/skills/backup-recovery/resources/disaster-recovery-planning.md
cat .claude/skills/backup-recovery/resources/legacy-skill.md
cat .claude/skills/backup-recovery/resources/recovery-procedures.md
cat .claude/skills/backup-recovery/resources/rpo-rto-design.md
cat .claude/skills/backup-recovery/resources/turso-backup-guide.md
```

### スクリプト実行
```bash
node .claude/skills/backup-recovery/scripts/log_usage.mjs --help
node .claude/skills/backup-recovery/scripts/validate-skill.mjs --help
node .claude/skills/backup-recovery/scripts/verify-backup.mjs --help
```

### テンプレート参照
```bash
cat .claude/skills/backup-recovery/templates/backup-policy-template.md
cat .claude/skills/backup-recovery/templates/recovery-runbook-template.md
```

## 変更履歴

| Version | Date | Changes |
| --- | --- | --- |
| 1.0.0 | 2025-12-24 | Spec alignment and required artifacts added |
