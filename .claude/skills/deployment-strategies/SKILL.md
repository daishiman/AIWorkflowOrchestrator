---
name: deployment-strategies
description: |
    本番環境への安全なデプロイとリスク軽減を専門とするスキル。
    Blue-Green、Canary、Rolling等のデプロイパターンとロールバック戦略を提供します。
    専門分野:
    - デプロイパターン: Blue-Green、Canary、Rolling Deployment
    - ロールバック戦略: 自動/手動ロールバック、復旧手順
    - ヘルスチェック: デプロイ後の検証、スモークテスト
    - ダウンタイム最小化: ゼロダウンタイムデプロイの実現
    使用タイミング:
    - デプロイ戦略を選択・設計する時
    - ロールバック手順を定義する時
    - 本番デプロイのリスクを最小化したい時
    - ヘルスチェックとスモークテストを設計する時
    Use proactively when users need to design deployment strategies,
    implement rollback procedures, or minimize deployment risks.

  📚 リソース参照:
  このスキルには以下のリソースが含まれています。
  必要に応じて該当するリソースを参照してください:

  - `.claude/skills/deployment-strategies/resources/deployment-patterns.md`: Blue-Green、Canary、Rollingデプロイパターンの詳細と選択基準
  - `.claude/skills/deployment-strategies/resources/health-checks.md`: ヘルスチェックエンドポイント設計とスモークテスト実装ガイド
  - `.claude/skills/deployment-strategies/resources/railway-deployment.md`: Railway固有のデプロイメカニズムとゼロダウンタイムデプロイ設定
  - `.claude/skills/deployment-strategies/resources/rollback-strategies.md`: 自動・手動ロールバック手順と復旧時間目標の設計
  - `.claude/skills/deployment-strategies/templates/deployment-runbook.md`: デプロイ手順書テンプレート
  - `.claude/skills/deployment-strategies/templates/health-endpoint-template.ts`: ヘルスチェックエンドポイント実装テンプレート
  - `.claude/skills/deployment-strategies/templates/rollback-checklist.md`: ロールバック実行チェックリストテンプレート
  - `.claude/skills/deployment-strategies/templates/smoke-test-template.ts`: デプロイ後スモークテストテンプレート
  - `.claude/skills/deployment-strategies/scripts/health-check.mjs`: ヘルスチェック実行スクリプト

version: 1.0.0
---

# Deployment Strategies

## 概要

このスキルは、『Continuous Delivery』の原則に基づき、
本番環境への安全なデプロイとリスク軽減のための戦略を提供します。

**主要な価値**:

- ダウンタイムの最小化または排除
- デプロイ失敗時の迅速な復旧
- 段階的なリリースによるリスク軽減
- 本番環境の安定性維持

**対象ユーザー**:

- 本番デプロイを担当する DevOps
- リリース戦略を設計するエンジニア
- 可用性を重視するチーム

## リソース構造

```
deployment-strategies/
├── SKILL.md                                    # 本ファイル
├── resources/
│   ├── deployment-patterns.md                 # デプロイパターン詳細
│   ├── rollback-strategies.md                 # ロールバック戦略
│   ├── health-checks.md                       # ヘルスチェック設計
│   └── railway-deployment.md                  # Railway固有のデプロイ
├── scripts/
│   └── health-check.mjs                       # ヘルスチェックスクリプト
└── templates/
    └── health-endpoint-template.ts            # ヘルスエンドポイントテンプレート
```

## コマンドリファレンス

### リソース読み取り

```bash
# デプロイパターン詳細
cat .claude/skills/deployment-strategies/resources/deployment-patterns.md

# ロールバック戦略
cat .claude/skills/deployment-strategies/resources/rollback-strategies.md

# ヘルスチェック設計
cat .claude/skills/deployment-strategies/resources/health-checks.md

# Railway固有のデプロイ
cat .claude/skills/deployment-strategies/resources/railway-deployment.md
```

### スクリプト実行

```bash
# ヘルスチェック実行
node .claude/skills/deployment-strategies/scripts/health-check.mjs https://app.example.com/api/health
```

### テンプレート参照

```bash
# ヘルスエンドポイントテンプレート
cat .claude/skills/deployment-strategies/templates/health-endpoint-template.ts
```

## いつ使うか

### シナリオ 1: 新サービスのデプロイ戦略設計

**状況**: 新しいサービスの本番デプロイ戦略を決めたい

**適用条件**:

- [ ] 高可用性が要求される
- [ ] ダウンタイムを最小化したい
- [ ] ロールバック手順が必要

**期待される成果**: 適切なデプロイパターンの選択と実装計画

### シナリオ 2: デプロイ失敗への対応

**状況**: デプロイ後に問題が発生した

**適用条件**:

- [ ] 本番環境で障害が発生
- [ ] 迅速な復旧が必要
- [ ] 原因調査も並行して必要

**期待される成果**: 即座のロールバックと復旧

### シナリオ 3: ゼロダウンタイムデプロイの実現

**状況**: 24/7 稼働のサービスでダウンタイムなしでデプロイしたい

**適用条件**:

- [ ] 常時稼働が要求される
- [ ] ユーザーへの影響を最小化したい
- [ ] 段階的なロールアウトが可能

**期待される成果**: ゼロダウンタイムデプロイの実装

## ワークフロー

### Phase 1: 要件分析

**目的**: デプロイ要件と制約を明確化

**ステップ**:

1. **可用性要件**:

   - 許容ダウンタイム
   - SLA 要件
   - ピーク時間帯

2. **リスク評価**:
   - 変更の影響範囲
   - ロールバック可能性
   - データ互換性

**判断基準**:

- [ ] 可用性要件が明確か？
- [ ] リスクが評価されているか？
- [ ] ロールバック計画があるか？

**リソース**: `resources/deployment-patterns.md`

### Phase 2: 戦略選択

**目的**: 要件に最適なデプロイ戦略を選択

**ステップ**:

1. **パターン選択**:

   - Blue-Green: 高可用性、即座の切り替え
   - Canary: 段階的、リスク軽減
   - Rolling: リソース効率、漸進的

2. **ロールバック設計**:
   - 自動ロールバック条件
   - 手動ロールバック手順
   - 復旧時間目標

**判断基準**:

- [ ] パターンが要件を満たすか？
- [ ] ロールバック手順が定義されているか？

**リソース**: `resources/rollback-strategies.md`

### Phase 3: 実装

**目的**: デプロイ戦略の実装

**ステップ**:

1. **インフラ設定**:

   - Railway 構成
   - ヘルスチェック設定
   - 環境変数設定

2. **ワークフロー作成**:
   - GitHub Actions ワークフロー
   - 通知設定
   - 承認フロー（必要に応じて）

**判断基準**:

- [ ] デプロイワークフローが作成されているか？
- [ ] ヘルスチェックが設定されているか？

**リソース**: `resources/railway-deployment.md`

### Phase 4: 検証

**目的**: デプロイプロセスの検証

**ステップ**:

1. **スモークテスト**:

   - 主要機能の動作確認
   - API 応答確認
   - パフォーマンス確認

2. **ロールバックテスト**:
   - ロールバック手順の実行
   - 復旧時間の測定
   - データ整合性の確認

**判断基準**:

- [ ] スモークテストが成功するか？
- [ ] ロールバックが正常に動作するか？

**リソース**: `resources/health-checks.md`

## 核心知識

### デプロイパターン比較

| パターン   | ダウンタイム | ロールバック | リソース | 複雑性 |
| ---------- | ------------ | ------------ | -------- | ------ |
| Blue-Green | なし         | 即座         | 2 倍     | 中     |
| Canary     | なし         | 段階的       | 少量追加 | 高     |
| Rolling    | 最小         | 段階的       | 同等     | 低     |
| 再作成     | あり         | 新デプロイ   | 同等     | 最低   |

### Railway でのデプロイ

Railway は自動的にゼロダウンタイムデプロイを実現:

```
1. 新コンテナをビルド
2. 新コンテナを起動
3. ヘルスチェック（設定時）
4. トラフィックを新コンテナに切り替え
5. 旧コンテナを停止
```

詳細は `resources/railway-deployment.md` を参照

### ロールバック戦略

**自動ロールバック**:

- ヘルスチェック失敗時
- エラー率閾値超過時
- 応答時間閾値超過時

**手動ロールバック**:

- 問題検出時に即座に実行
- 前バージョンへの切り替え

詳細は `resources/rollback-strategies.md` を参照

## ベストプラクティス

### すべきこと

1. **ヘルスチェックの実装**:

   - `/api/health` エンドポイント
   - DB 接続確認
   - 外部サービス確認

2. **段階的ロールアウト**:

   - 小さな変更を頻繁に
   - 影響範囲を限定
   - 監視を強化

3. **ロールバック計画**:
   - 事前にテスト
   - 手順をドキュメント化
   - 権限を明確化

### 避けるべきこと

1. **ビッグバンデプロイ**:

   - ❌ 大規模変更の一括デプロイ
   - ✅ 小さな変更を頻繁に

2. **テストなしデプロイ**:

   - ❌ 本番直接デプロイ
   - ✅ ステージングでの事前検証

3. **ロールバック計画なし**:
   - ❌ 問題発生時に即席対応
   - ✅ 事前に手順を準備

## トラブルシューティング

### 問題 1: デプロイ後にエラー率上昇

**症状**: デプロイ後に 500 エラーが増加

**対応**:

1. 即座にロールバック
2. ログを確認
3. ステージングで再現
4. 修正後に再デプロイ

### 問題 2: ヘルスチェック失敗

**症状**: デプロイは成功するがヘルスチェックで失敗

**対応**:

1. ヘルスエンドポイントの実装確認
2. タイムアウト設定の確認
3. 依存サービスの状態確認

### 問題 3: ロールバック失敗

**症状**: 前バージョンに戻せない

**対応**:

1. 手動でコンテナを切り替え
2. 環境変数を確認
3. DB 互換性を確認

## 関連スキル

- **ci-cd-pipelines** (`.claude/skills/ci-cd-pipelines/SKILL.md`): CI/CD パイプライン
- **infrastructure-as-code** (`.claude/skills/infrastructure-as-code/SKILL.md`): インフラ構成
- **monitoring-alerting** (`.claude/skills/monitoring-alerting/SKILL.md`): モニタリング

## メトリクス

### デプロイ成功率

**目標**: > 99%

### 平均復旧時間 (MTTR)

**目標**: < 5 分

### 変更失敗率

**目標**: < 5%

## 変更履歴

| バージョン | 日付       | 変更内容 |
| ---------- | ---------- | -------- |
| 1.0.0      | 2025-11-25 | 初版作成 |

## 参考文献

- **『Continuous Delivery』** Jez Humble, David Farley 著
  - Chapter 10: Deploying and Releasing Applications
