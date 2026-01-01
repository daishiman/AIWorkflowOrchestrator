---
name: health-check-implementation
description: |
  ヘルスチェックの設計・実装・監視の指針を提供するスキル。

  Anchors:
  • Observability Engineering / 適用: ヘルスチェック設計の観測性原則 / 目的: 効果的なモニタリング指標の選定
  • SRE (Site Reliability Engineering) / 適用: ヘルスチェックのレベル分類と段階的実装 / 目的: 運用負荷の最適化

  Trigger:
  マイクロサービスのヘルスチェック設計時、またはシステム信頼性のためのモニタリング実装時に使用。ベースラインメトリクスの確立やアラート閾値の設定時に適用。
allowed-tools:
  - read-files
  - write-files
  - bash
tags:
  - observability
  - health-check
  - monitoring
  - reliability
dependencies:
  - .claude/skills/metrics-tracking/SKILL.md
  - .claude/skills/alert-design/SKILL.md
---

# Health Check Implementation

## 概要

ヘルスチェックの設計・実装・監視を通じて、マイクロサービスの信頼性と観測性を確立するためのガイダンス。

## ワークフロー

### Phase 1: 目的と前提の整理

**目的**: ヘルスチェック実装の要件を明確化する

**アクション**:

1. `references/Level1_basics.md` でヘルスチェックの分類（深さ・粒度）を確認
2. 対象システムの要件（RTO/RPO、アラート粒度）を整理
3. 依存スキル「metrics-tracking」「alert-design」との関連性を確認

### Phase 2: スキル適用と実装

**目的**: ヘルスチェック実装を段階的に進める

**アクション**:

1. `references/Level2_intermediate.md` で段階別実装手順を参照
2. 選定したヘルスチェックタイプに応じて実装を実施
3. メトリクス定義とアラート設定を並行実施

### Phase 3: 検証と記録

**目的**: 成果物の検証と実行フィードバックの保存

**アクション**:

1. 実装したヘルスチェックが観測性要件を満たすか確認
2. `scripts/log_usage.mjs` を実行してフィードバックを記録
3. `references/Level3_advanced.md` で高度なパターンの適用を検討

## Task仕様ナビゲーション

（注: 現在agents/は未実装。以下の任務は必要に応じてTask化される予定）

| Task                   | 目的                                         | 入力                             | 出力                       | 参照リソース                     |
| ---------------------- | -------------------------------------------- | -------------------------------- | -------------------------- | -------------------------------- |
| ヘルスチェック仕様策定 | システム要件に合致した監視戦略の設計         | システム構成、RTO/RPO、運用体制  | ヘルスチェック仕様書       | references/Level2_intermediate.md |
| メトリクス定義         | 有効なヘルスチェック指標の定義               | ビジネス要件、システムトポロジー | メトリクスリスト、取得方法 | references/Level1_basics.md       |
| アラートしきい値設定   | 運用効率とカバレッジを両立させるしきい値決定 | メトリクスデータ、過去の事象ログ | アラート設定               | dependent skill: alert-design    |

## ベストプラクティス

### すべきこと

- `references/Level1_basics.md` でヘルスチェックの分類（深さ・粒度）を確認してから仕様を立案する
- `references/Level2_intermediate.md` で段階的実装パターンを参照し、運用コストと効果のバランスを取る
- メトリクスとアラート設定を一体で設計し、トリアージ効率を考慮する
- 本番環境への導入前に非本番環境で検証を実施する

### 避けるべきこと

- ヘルスチェック仕様を無視してアドホックに実装する
- 過度に細粒度なヘルスチェックを導入して運用負荷を増加させる
- アラートしきい値を根拠なく決定する（トレンドデータやベンチマークを参照すること）
- ヘルスチェック失敗時の自動修復を単純に有効化する（段階的なフェイルセーフを検討）

## リソース参照

### 参考リソース

- **レベル別ガイド**: See [references/Level1_basics.md](references/Level1_basics.md) （基礎：ヘルスチェックの分類と基本パターン）
- **実装ガイド**: See [references/Level2_intermediate.md](references/Level2_intermediate.md) （実務：段階的実装とベストプラクティス）
- **高度なパターン**: See [references/Level3_advanced.md](references/Level3_advanced.md) （応用：複雑なトポロジーへの対応）
- **専門知識**: See [references/Level4_expert.md](references/Level4_expert.md) （専門：大規模分散システムへの展開）

### 関連スキル

- **metrics-tracking**: ヘルスチェック値の収集と分析
- **alert-design**: アラート設定としきい値決定の連動

### スクリプト

- `scripts/log_usage.mjs`: 実行記録とフィードバック記録

## 変更履歴

| バージョン | 日付       | 変更内容                                                                              |
| ---------- | ---------- | ------------------------------------------------------------------------------------- |
| 1.1.0      | 2025-12-31 | 18-skills.md仕様に準拠。Anchors/Trigger追加、Task仕様ナビ導入、ベストプラクティス強化 |
| 1.0.0      | 2025-12-24 | 初版リリース                                                                          |
