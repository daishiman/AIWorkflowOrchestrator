---
name: .claude/skills/graceful-shutdown-patterns/SKILL.md
description: |
  Node.jsアプリケーションのGraceful Shutdown実装を専門とするスキル。
  Twelve-Factor Appの「廃棄容易性」原則に基づき、優雅なプロセス終了、
  リソースクリーンアップ、接続ドレイン、タイムアウト処理を設計します。
  
  📖 参照書籍:
  - 『The Pragmatic Programmer』（Andrew Hunt, David Thomas）: 実践的改善
  
  📚 リソース参照:
  - `resources/Level1_basics.md`: レベル1の基礎ガイド
  - `resources/Level2_intermediate.md`: レベル2の実務ガイド
  - `resources/Level3_advanced.md`: レベル3の応用ガイド
  - `resources/Level4_expert.md`: レベル4の専門ガイド
  - `resources/connection-draining.md`: connection-draining の詳細ガイド
  - `resources/legacy-skill.md`: 旧SKILL.mdの全文
  - `resources/resource-cleanup.md`: resource-cleanup の詳細ガイド
  - `resources/shutdown-sequence.md`: shutdown-sequence の詳細ガイド
  - `resources/shutdown-strategies.md`: shutdown-strategies の詳細ガイド
  - `scripts/log_usage.mjs`: 使用記録・自動評価スクリプト
  - `scripts/test-graceful-shutdown.mjs`: gracefulshutdownをテストするスクリプト
  - `scripts/validate-skill.mjs`: スキル構造検証スクリプト
  - `templates/graceful-shutdown.template.ts`: graceful-shutdown.template のテンプレート
  - `templates/shutdown-manager.ts`: shutdown-manager のテンプレート
  
  Use proactively when designing shutdown sequences, implementing.
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

# Graceful Shutdown Patterns

## 概要

Node.jsアプリケーションのGraceful Shutdown実装を専門とするスキル。
Twelve-Factor Appの「廃棄容易性」原則に基づき、優雅なプロセス終了、
リソースクリーンアップ、接続ドレイン、タイムアウト処理を設計します。

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
- アプリケーションの終了処理を設計する時
- リソースリークを防ぐクリーンアップを実装する時
- ゼロダウンタイムデプロイを実現する時
- PM2でのgraceful reload設定時

### 避けるべきこと
- アンチパターンや注意点を確認せずに進めることを避ける

## コマンドリファレンス

### リソース読み取り
```bash
cat .claude/skills/graceful-shutdown-patterns/resources/Level1_basics.md
cat .claude/skills/graceful-shutdown-patterns/resources/Level2_intermediate.md
cat .claude/skills/graceful-shutdown-patterns/resources/Level3_advanced.md
cat .claude/skills/graceful-shutdown-patterns/resources/Level4_expert.md
cat .claude/skills/graceful-shutdown-patterns/resources/connection-draining.md
cat .claude/skills/graceful-shutdown-patterns/resources/legacy-skill.md
cat .claude/skills/graceful-shutdown-patterns/resources/resource-cleanup.md
cat .claude/skills/graceful-shutdown-patterns/resources/shutdown-sequence.md
cat .claude/skills/graceful-shutdown-patterns/resources/shutdown-strategies.md
```

### スクリプト実行
```bash
node .claude/skills/graceful-shutdown-patterns/scripts/log_usage.mjs --help
node .claude/skills/graceful-shutdown-patterns/scripts/test-graceful-shutdown.mjs --help
node .claude/skills/graceful-shutdown-patterns/scripts/validate-skill.mjs --help
```

### テンプレート参照
```bash
cat .claude/skills/graceful-shutdown-patterns/templates/graceful-shutdown.template.ts
cat .claude/skills/graceful-shutdown-patterns/templates/shutdown-manager.ts
```

## 変更履歴

| Version | Date | Changes |
| --- | --- | --- |
| 1.0.0 | 2025-12-24 | Spec alignment and required artifacts added |
