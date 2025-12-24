---
name: .claude/skills/log-rotation-strategies/SKILL.md
description: |
  Node.jsアプリケーションのログローテーション戦略を専門とするスキル。
  PM2、logrotate、Winston等を活用した効率的なログ管理を設計します。
  
  📖 参照書籍:
  - 『The Pragmatic Programmer』（Andrew Hunt, David Thomas）: 実践的改善
  
  📚 リソース参照:
  - `resources/Level1_basics.md`: レベル1の基礎ガイド
  - `resources/Level2_intermediate.md`: レベル2の実務ガイド
  - `resources/Level3_advanced.md`: レベル3の応用ガイド
  - `resources/Level4_expert.md`: レベル4の専門ガイド
  - `resources/legacy-skill.md`: 旧SKILL.mdの全文
  - `resources/log-aggregation.md`: 集中ログ管理オプション（ELK/Datadog/CloudWatch/Loki）、サービス選定基準
  - `resources/pm2-logrotate-guide.md`: pm2-logrotate設定、max_size/retain/compress、ecosystem.config.js統合
  - `resources/rotation-patterns.md`: サイズベース・時間ベース・ハイブリッド方式の選択基準と実装パターン
  - `scripts/analyze-log-usage.mjs`: ログ使用量分析（ディレクトリサイズ、世代数、圧縮率）
  - `scripts/log_usage.mjs`: 使用記録・自動評価スクリプト
  - `scripts/validate-skill.mjs`: スキル構造検証スクリプト
  - `templates/winston-rotation.template.ts`: Winston DailyRotateFile設定テンプレート（TypeScript）
  
  Use proactively when handling log rotation strategies tasks.
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

# Log Rotation Strategies

## 概要

Node.jsアプリケーションのログローテーション戦略を専門とするスキル。
PM2、logrotate、Winston等を活用した効率的なログ管理を設計します。

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
- ログローテーションを設定する時
- ディスク容量管理を最適化する時
- ログフォーマットを標準化する時
- PM2ログ設定を行う時

### 避けるべきこと
- アンチパターンや注意点を確認せずに進めることを避ける

## コマンドリファレンス

### リソース読み取り
```bash
cat .claude/skills/log-rotation-strategies/resources/Level1_basics.md
cat .claude/skills/log-rotation-strategies/resources/Level2_intermediate.md
cat .claude/skills/log-rotation-strategies/resources/Level3_advanced.md
cat .claude/skills/log-rotation-strategies/resources/Level4_expert.md
cat .claude/skills/log-rotation-strategies/resources/legacy-skill.md
cat .claude/skills/log-rotation-strategies/resources/log-aggregation.md
cat .claude/skills/log-rotation-strategies/resources/pm2-logrotate-guide.md
cat .claude/skills/log-rotation-strategies/resources/rotation-patterns.md
```

### スクリプト実行
```bash
node .claude/skills/log-rotation-strategies/scripts/analyze-log-usage.mjs --help
node .claude/skills/log-rotation-strategies/scripts/log_usage.mjs --help
node .claude/skills/log-rotation-strategies/scripts/validate-skill.mjs --help
```

### テンプレート参照
```bash
cat .claude/skills/log-rotation-strategies/templates/winston-rotation.template.ts
```

## 変更履歴

| Version | Date | Changes |
| --- | --- | --- |
| 1.0.0 | 2025-12-24 | Spec alignment and required artifacts added |
