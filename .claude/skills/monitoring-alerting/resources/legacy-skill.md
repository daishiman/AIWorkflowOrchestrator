---
name: .claude/skills/monitoring-alerting/SKILL.md
description: |
  アプリケーションとインフラの監視・アラート設計を専門とするスキル。
  メトリクス収集、ログ設計、アラート閾値設定、ダッシュボード構成を提供します。

  📚 リソース参照:
  このスキルには以下のリソースが含まれています。
  必要に応じて該当するリソースを参照してください:

  - `.claude/skills/monitoring-alerting/resources/alerting-rules.md`: 閾値設定、警告/重大レベル、エスカレーション、通知先、抑制ルール設計
  - `.claude/skills/monitoring-alerting/resources/discord-notifications.md`: Discord Webhook連携、メッセージフォーマット、Embed活用、アラート送信
  - `.claude/skills/monitoring-alerting/resources/golden-signals.md`: レイテンシー・トラフィック・エラー・飽和度の4指標、SLI/SLO設計
  - `.claude/skills/monitoring-alerting/resources/logging-design.md`: 構造化ログ（JSON）、ログレベル設計、相関ID、環境別設定
  - `.claude/skills/monitoring-alerting/scripts/check-metrics.mjs`: メトリクスエンドポイント確認、死活監視、レスポンスタイム測定
  - `.claude/skills/monitoring-alerting/templates/alert-rules-template.yml`: アラートルール定義テンプレート（Prometheus/Alertmanager形式）
  - `.claude/skills/monitoring-alerting/templates/dashboard-template.json`: ダッシュボード設定テンプレート（Grafana形式、ゴールデンシグナル可視化）
  - `.claude/skills/monitoring-alerting/templates/incident-report-template.md`: インシデントレポートテンプレート（発生・影響・原因・対応・再発防止）
  - `.claude/skills/monitoring-alerting/templates/structured-logger-template.ts`: 構造化ロガー実装テンプレート（Winston/Pino、TypeScript）

  専門分野:
  - メトリクス設計: ゴールデンシグナル、SLI/SLO
  - ログ設計: 構造化ログ、ログレベル設計
  - アラート設計: 閾値設定、エスカレーション
  - ダッシュボード: 可視化、トレンド分析

  使用タイミング:
  - 監視戦略を設計する時
  - アラートルールを定義する時
  - ログ出力を設計する時
  - 可観測性を向上させたい時

  Use proactively when users need to design monitoring strategies,
version: 1.0.0
---

# Monitoring & Alerting

## 概要

このスキルは、『The DevOps Handbook』と『Site Reliability Engineering』の原則に基づき、
効果的な監視・アラート戦略を提供します。

**主要な価値**:

- 問題の早期検出と迅速な対応
- システム状態の可視化
- インシデント対応時間の短縮
- データ駆動の意思決定

**対象ユーザー**:

- 監視システムを設計するエンジニア
- インシデント対応を改善したいチーム
- 可観測性を向上させたい DevOps

## リソース構造

```
monitoring-alerting/
├── SKILL.md                                    # 本ファイル
├── resources/
│   ├── golden-signals.md                      # ゴールデンシグナル
│   ├── logging-design.md                      # ログ設計
│   ├── alerting-rules.md                      # アラートルール設計
│   └── discord-notifications.md               # Discord通知
├── scripts/
│   └── check-metrics.mjs                      # メトリクス確認スクリプト
└── templates/
    └── structured-logger-template.ts          # 構造化ログテンプレート
```

## コマンドリファレンス

### リソース読み取り

```bash
# ゴールデンシグナル
cat .claude/skills/monitoring-alerting/resources/golden-signals.md

# ログ設計
cat .claude/skills/monitoring-alerting/resources/logging-design.md

# アラートルール設計
cat .claude/skills/monitoring-alerting/resources/alerting-rules.md

# Discord通知
cat .claude/skills/monitoring-alerting/resources/discord-notifications.md
```

### スクリプト実行

```bash
# メトリクス確認
node .claude/skills/monitoring-alerting/scripts/check-metrics.mjs https://app.example.com
```

### テンプレート参照

```bash
# 構造化ログテンプレート
cat .claude/skills/monitoring-alerting/templates/structured-logger-template.ts
```

## いつ使うか

### シナリオ 1: 新サービスの監視設計

**状況**: 新しいサービスの監視戦略を設計したい

**適用条件**:

- [ ] 本番環境へのデプロイを予定
- [ ] SLO/SLI を定義したい
- [ ] インシデント対応を準備したい

**期待される成果**: 包括的な監視戦略と実装計画

### シナリオ 2: アラート疲れへの対応

**状況**: アラートが多すぎて重要な問題を見逃している

**適用条件**:

- [ ] 誤検知が多い
- [ ] アラートの優先度が不明確
- [ ] エスカレーションが機能していない

**期待される成果**: 効果的なアラート戦略への改善

### シナリオ 3: ログの可視性向上

**状況**: ログが散在して問題調査に時間がかかる

**適用条件**:

- [ ] ログフォーマットが不統一
- [ ] 相関 ID がない
- [ ] 検索・分析が困難

**期待される成果**: 構造化された効率的なログシステム

## ワークフロー

### Phase 1: 要件分析

**目的**: 監視要件と制約を明確化

**ステップ**:

1. **ビジネス要件**:
   - SLO/SLI 目標
   - 対応時間要件
   - ステークホルダーの期待

2. **技術要件**:
   - システムアーキテクチャ
   - 利用可能なツール
   - データ保持期間

**判断基準**:

- [ ] SLO/SLI が定義されているか？
- [ ] 監視対象が特定されているか？
- [ ] ツール選択の制約があるか？

**リソース**: `resources/golden-signals.md`

### Phase 2: メトリクス設計

**目的**: 収集すべきメトリクスを定義

**ステップ**:

1. **ゴールデンシグナル**:
   - レイテンシー
   - トラフィック
   - エラー率
   - 飽和度

2. **カスタムメトリクス**:
   - ビジネスメトリクス
   - アプリケーション固有の指標

**判断基準**:

- [ ] ゴールデンシグナルがカバーされているか？
- [ ] メトリクスの粒度は適切か？

**リソース**: `resources/golden-signals.md`

### Phase 3: アラート設計

**目的**: 効果的なアラートルールを定義

**ステップ**:

1. **閾値設定**:
   - 警告レベル
   - 重大レベル
   - 自動復旧

2. **通知設計**:
   - 通知先
   - エスカレーション
   - 抑制ルール

**判断基準**:

- [ ] 閾値が適切か？
- [ ] エスカレーションが定義されているか？

**リソース**: `resources/alerting-rules.md`

### Phase 4: ログ設計

**目的**: 効果的なログ戦略を実装

**ステップ**:

1. **フォーマット**:
   - 構造化ログ（JSON）
   - 必須フィールド
   - 相関 ID

2. **レベル設計**:
   - ERROR/WARN/INFO/DEBUG
   - 環境別設定

**判断基準**:

- [ ] ログフォーマットが統一されているか？
- [ ] 相関 ID が実装されているか？

**リソース**: `resources/logging-design.md`

## 核心知識

### ゴールデンシグナル

SRE の基本的な 4 つの監視指標：

| シグナル     | 説明               | 例                |
| ------------ | ------------------ | ----------------- |
| レイテンシー | リクエスト処理時間 | p50, p95, p99     |
| トラフィック | システム負荷       | RPS, 同時接続数   |
| エラー       | 失敗率             | 5xx 率, 例外数    |
| 飽和度       | リソース使用率     | CPU, Memory, Disk |

### SLI/SLO/SLA

```
SLI (Service Level Indicator): 測定指標
 例: API応答時間の99パーセンタイル

SLO (Service Level Objective): 目標値
 例: 99.9%のリクエストが200ms以内

SLA (Service Level Agreement): 契約
 例: 月間稼働率99.5%を保証
```

### ログレベル設計

| レベル | 用途               | 本番 | 開発 |
| ------ | ------------------ | ---- | ---- |
| ERROR  | 即座の対応が必要   | ✅   | ✅   |
| WARN   | 注意が必要な状況   | ✅   | ✅   |
| INFO   | 重要な業務イベント | ✅   | ✅   |
| DEBUG  | デバッグ情報       | ❌   | ✅   |

詳細は `resources/logging-design.md` を参照

## ベストプラクティス

### すべきこと

1. **ゴールデンシグナルの監視**:
   - 4 つのシグナルを必ず監視
   - ダッシュボードで可視化

2. **構造化ログの実装**:
   - JSON フォーマット
   - 相関 ID の付与
   - 適切なログレベル

3. **アラートの階層化**:
   - 重大度に応じた通知
   - エスカレーションパス
   - 抑制ルール

### 避けるべきこと

1. **アラート疲れ**:
   - ❌ 無意味なアラートの乱発
   - ✅ アクション可能なアラートのみ

2. **情報の過剰収集**:
   - ❌ すべてを記録
   - ✅ 必要な情報のみ

3. **メトリクスの孤立**:
   - ❌ 相関のないメトリクス
   - ✅ コンテキストのあるダッシュボード

## トラブルシューティング

### 問題 1: アラートが多すぎる

**症状**: 毎日大量のアラートが発生

**対応**:

1. 閾値の見直し
2. 抑制ルールの追加
3. 自動復旧の実装
4. 根本原因の対処

### 問題 2: 問題検出が遅い

**症状**: ユーザー報告で問題が発覚

**対応**:

1. 監視カバレッジの確認
2. 閾値の調整
3. 合成監視の追加
4. ログアラートの追加

### 問題 3: ログが役に立たない

**症状**: ログがあるが調査に使えない

**対応**:

1. 構造化ログへの移行
2. 相関 ID の追加
3. コンテキスト情報の充実
4. ログレベルの見直し

## 関連スキル

- **.claude/skills/deployment-strategies/SKILL.md** (`.claude/skills/deployment-strategies/SKILL.md`): デプロイ戦略
- **.claude/skills/ci-cd-pipelines/SKILL.md** (`.claude/skills/ci-cd-pipelines/SKILL.md`): CI/CD パイプライン
- **.claude/skills/infrastructure-as-code/SKILL.md** (`.claude/skills/infrastructure-as-code/SKILL.md`): インフラ構成

## メトリクス

### MTTD（平均検出時間）

**目標**: < 5 分

### MTTR（平均復旧時間）

**目標**: < 15 分

### アラート精度

**目標**: 誤検知率 < 5%

## 変更履歴

| バージョン | 日付       | 変更内容 |
| ---------- | ---------- | -------- |
| 1.0.0      | 2025-11-26 | 初版作成 |

## 参考文献

- **『Site Reliability Engineering』** Google 著
  - Chapter 6: Monitoring Distributed Systems

- **『The DevOps Handbook』** Gene Kim 他著
  - Part IV: The Second Way - Feedback
