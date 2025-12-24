---
name: .claude/skills/memory-monitoring-strategies/SKILL.md
description: |
  Node.jsアプリケーションのメモリ監視とリーク検出を専門とするスキル。
  PM2、V8ヒープ分析、メモリプロファイリングを活用した効率的なメモリ管理を設計します。
  
  📖 参照書籍:
  - 『Observability Engineering』（Charity Majors）: ログ設計
  
  📚 リソース参照:
  - `resources/Level1_basics.md`: レベル1の基礎ガイド
  - `resources/Level2_intermediate.md`: レベル2の実務ガイド
  - `resources/Level3_advanced.md`: レベル3の応用ガイド
  - `resources/Level4_expert.md`: レベル4の専門ガイド
  - `resources/heap-analysis.md`: heapdump取得、Chrome DevTools分析、スナップショット比較、リーク原因特定
  - `resources/leak-detection.md`: リーク兆候の検出、継続的増加パターン、GC効果測定、原因診断手法
  - `resources/legacy-skill.md`: 旧SKILL.mdの全文
  - `resources/memory-metrics.md`: RSS/heapUsed/heapTotal/external各メトリクス説明、警告閾値設定
  - `scripts/log_usage.mjs`: 使用記録・自動評価スクリプト
  - `scripts/memory-monitor.mjs`: メモリ使用量のリアルタイム監視（PID/PM2アプリ指定、閾値アラート）
  - `scripts/validate-skill.mjs`: スキル構造検証スクリプト
  - `templates/memory-tracker.template.ts`: PM2カスタムメトリクス実装テンプレート（TypeScript、io.metric活用）
  
  Use proactively when handling memory monitoring strategies tasks.
version: 1.0.0
level: 1
last_updated: 2025-12-24
references:
  - book: "Observability Engineering"
    author: "Charity Majors"
    concepts:
      - "ログ設計"
      - "メトリクス"
---

# Memory Monitoring Strategies

## 概要

Node.jsアプリケーションのメモリ監視とリーク検出を専門とするスキル。
PM2、V8ヒープ分析、メモリプロファイリングを活用した効率的なメモリ管理を設計します。

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
- メモリ使用量の監視を設定する時
- メモリリークを調査する時
- PM2のメモリ制限を設定する時
- ヒープ分析を行う時

### 避けるべきこと
- アンチパターンや注意点を確認せずに進めることを避ける

## コマンドリファレンス

### リソース読み取り
```bash
cat .claude/skills/memory-monitoring-strategies/resources/Level1_basics.md
cat .claude/skills/memory-monitoring-strategies/resources/Level2_intermediate.md
cat .claude/skills/memory-monitoring-strategies/resources/Level3_advanced.md
cat .claude/skills/memory-monitoring-strategies/resources/Level4_expert.md
cat .claude/skills/memory-monitoring-strategies/resources/heap-analysis.md
cat .claude/skills/memory-monitoring-strategies/resources/leak-detection.md
cat .claude/skills/memory-monitoring-strategies/resources/legacy-skill.md
cat .claude/skills/memory-monitoring-strategies/resources/memory-metrics.md
```

### スクリプト実行
```bash
node .claude/skills/memory-monitoring-strategies/scripts/log_usage.mjs --help
node .claude/skills/memory-monitoring-strategies/scripts/memory-monitor.mjs --help
node .claude/skills/memory-monitoring-strategies/scripts/validate-skill.mjs --help
```

### テンプレート参照
```bash
cat .claude/skills/memory-monitoring-strategies/templates/memory-tracker.template.ts
```

## 変更履歴

| Version | Date | Changes |
| --- | --- | --- |
| 1.0.0 | 2025-12-24 | Spec alignment and required artifacts added |
