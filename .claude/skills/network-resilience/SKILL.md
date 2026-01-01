---
name: .claude/skills/network-resilience/SKILL.md
description: |
  ネットワーク障害に対する耐性設計を専門とするスキル。
  アンドリュー・タネンバウムの『分散システム』に基づき、
  部分障害からの自動復旧とデータ整合性保証を設計します。
  
  📖 参照書籍:
  - 『The Pragmatic Programmer』（Andrew Hunt, David Thomas）: 実践的改善
  
  📚 リソース参照:
  - `references/Level1_basics.md`: レベル1の基礎ガイド
  - `references/Level2_intermediate.md`: レベル2の実務ガイド
  - `references/Level3_advanced.md`: レベル3の応用ガイド
  - `references/Level4_expert.md`: レベル4の専門ガイド
  - `references/legacy-skill.md`: 旧SKILL.mdの全文
  - `references/offline-queue-patterns.md`: オフラインキュー設計パターン
  - `references/reconnection-strategies.md`: 指数バックオフ・ジッター・ヘルスチェックによる自動再接続アルゴリズム
  - `references/state-synchronization.md`: ローカル・リモート間のデータ整合性保証と競合解決戦略（タイムスタンプ・サーバー優先・手動解決）
  - `scripts/analyze-network-config.mjs`: ネットワーク設定の妥当性検証とヘルスチェック間隔・タイムアウト値の推奨スクリプト
  - `scripts/log_usage.mjs`: 使用記録・自動評価スクリプト
  - `scripts/validate-skill.mjs`: スキル構造検証スクリプト
  - `assets/connection-manager-template.ts`: 接続状態管理・自動再接続・イベント通知を提供する接続マネージャーテンプレート
  - `assets/offline-queue-template.ts`: JSONL形式の永続キュー実装とFIFO順序保証・べき等性確保テンプレート
  
  Use proactively when implementing network-aware applications.
---

# Network Resilience

## 概要

ネットワーク障害に対する耐性設計を専門とするスキル。
アンドリュー・タネンバウムの『分散システム』に基づき、
部分障害からの自動復旧とデータ整合性保証を設計します。

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
- オフライン時にもタスクを蓄積したい時
- ネットワーク復旧後の自動再同期が必要な時
- 接続状態に応じた動的な動作切り替えが必要な時
- ローカルとリモートのデータ整合性を保証したい時

### 避けるべきこと
- アンチパターンや注意点を確認せずに進めることを避ける

## コマンドリファレンス

### リソース読み取り
```bash
cat .claude/skills/network-resilience/references/Level1_basics.md
cat .claude/skills/network-resilience/references/Level2_intermediate.md
cat .claude/skills/network-resilience/references/Level3_advanced.md
cat .claude/skills/network-resilience/references/Level4_expert.md
cat .claude/skills/network-resilience/references/legacy-skill.md
cat .claude/skills/network-resilience/references/offline-queue-patterns.md
cat .claude/skills/network-resilience/references/reconnection-strategies.md
cat .claude/skills/network-resilience/references/state-synchronization.md
```

### スクリプト実行
```bash
node .claude/skills/network-resilience/scripts/analyze-network-config.mjs --help
node .claude/skills/network-resilience/scripts/log_usage.mjs --help
node .claude/skills/network-resilience/scripts/validate-skill.mjs --help
```

### テンプレート参照
```bash
cat .claude/skills/network-resilience/assets/connection-manager-template.ts
cat .claude/skills/network-resilience/assets/offline-queue-template.ts
```

## 変更履歴

| Version | Date | Changes |
| --- | --- | --- |
| 1.0.0 | 2025-12-24 | Spec alignment and required artifacts added |
