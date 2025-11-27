---
name: ci-cd-pipelines
description: |
  ジーン・キムのDevOps原則に基づくCI/CDパイプライン設計と実装を専門とするスキル。
  📚 リソース参照:
  このスキルには以下のリソースが含まれています。
  必要に応じて該当するリソースを参照してください:

  - `.claude/skills/ci-cd-pipelines/resources/caching-strategies.md`: pnpm/npm/yarn依存関係キャッシュ、Next.js/Turboビルドキャッシュの実装パターンと10GB制限対策
  - `.claude/skills/ci-cd-pipelines/resources/github-actions-syntax.md`: GitHub Actions構文リファレンス
  - `.claude/skills/ci-cd-pipelines/resources/parallelization.md`: 並列化とマトリクスビルド
  - `.claude/skills/ci-cd-pipelines/resources/pipeline-patterns.md`: パイプラインアーキテクチャパターン
  - `.claude/skills/ci-cd-pipelines/resources/quality-gates.md`: 静的チェック・テスト・セキュリティの3層品質ゲートとブランチ保護設定パターン
  - `.claude/skills/ci-cd-pipelines/templates/ci-workflow-template.yml`: CI Workflow Template
  - `.claude/skills/ci-cd-pipelines/templates/deploy-workflow-template.yml`: Deploy Workflow Template
  - `.claude/skills/ci-cd-pipelines/templates/reusable-workflow-template.yml`: Reusable Workflow Template
  - `.claude/skills/ci-cd-pipelines/scripts/validate-workflow.mjs`: GitHub Actions Workflow Validator

  専門分野:
  - GitHub Actions設計: ワークフロー構文、トリガー設定、ジョブ構成
  - パイプラインアーキテクチャ: 多段階パイプライン、品質ゲート、並列化
  - キャッシュ戦略: 依存関係キャッシュ、ビルドキャッシュ、アーティファクト管理
  - 再利用可能ワークフロー: Composite Actions、Reusable Workflows

  使用タイミング:
  - GitHub Actionsワークフローを新規作成・最適化する時
  - CI/CDパイプラインの品質ゲートを設計する時
  - ビルド・テストの並列化による高速化が必要な時
  - 再利用可能なワークフローパターンを設計する時

  Use proactively when users need to create GitHub Actions workflows,
  design CI/CD pipelines, or optimize build and test automation.
version: 1.0.0
---

# CI/CD Pipelines

## 概要

このスキルは、ジーン・キムが提唱するDevOps原則（フローの原則、フィードバックの原則、継続的学習の原則）に基づき、
GitHub Actionsを活用した効率的なCI/CDパイプラインの設計と実装を支援します。

**主要な価値**:
- 開発からデプロイまでの価値の流れを高速化
- 問題の早期発見と即時フィードバック
- 品質の作り込みによる本番障害の削減

**対象ユーザー**:
- CI/CDパイプラインを構築するDevOpsエンジニア
- GitHub Actionsを最適化したい開発者
- デプロイ自動化を実現したいチーム

## リソース構造

```
ci-cd-pipelines/
├── SKILL.md                                    # 本ファイル（概要とワークフロー）
├── resources/
│   ├── github-actions-syntax.md               # GitHub Actions構文リファレンス
│   ├── pipeline-patterns.md                   # パイプラインアーキテクチャパターン
│   ├── caching-strategies.md                  # キャッシュ戦略の詳細
│   ├── quality-gates.md                       # 品質ゲート設計
│   └── parallelization.md                     # 並列化とマトリクスビルド
├── scripts/
│   └── validate-workflow.mjs                  # ワークフロー構文検証スクリプト
└── templates/
    ├── ci-workflow-template.yml               # CIワークフローテンプレート
    ├── deploy-workflow-template.yml           # デプロイワークフローテンプレート
    └── reusable-workflow-template.yml         # 再利用可能ワークフローテンプレート
```

## コマンドリファレンス

### リソース読み取り

```bash
# GitHub Actions構文リファレンス
cat .claude/skills/ci-cd-pipelines/resources/github-actions-syntax.md

# パイプラインアーキテクチャパターン
cat .claude/skills/ci-cd-pipelines/resources/pipeline-patterns.md

# キャッシュ戦略詳細
cat .claude/skills/ci-cd-pipelines/resources/caching-strategies.md

# 品質ゲート設計
cat .claude/skills/ci-cd-pipelines/resources/quality-gates.md

# 並列化とマトリクスビルド
cat .claude/skills/ci-cd-pipelines/resources/parallelization.md
```

### スクリプト実行

```bash
# ワークフロー構文検証
node .claude/skills/ci-cd-pipelines/scripts/validate-workflow.mjs .github/workflows/ci.yml

# 複数ワークフローの一括検証
node .claude/skills/ci-cd-pipelines/scripts/validate-workflow.mjs .github/workflows/*.yml
```

### テンプレート参照

```bash
# CIワークフローテンプレート
cat .claude/skills/ci-cd-pipelines/templates/ci-workflow-template.yml

# デプロイワークフローテンプレート
cat .claude/skills/ci-cd-pipelines/templates/deploy-workflow-template.yml

# 再利用可能ワークフローテンプレート
cat .claude/skills/ci-cd-pipelines/templates/reusable-workflow-template.yml
```

## いつ使うか

### シナリオ1: 新規プロジェクトのCI/CDセットアップ

**状況**: 新しいプロジェクトにCI/CDパイプラインを構築したい

**適用条件**:
- [ ] プロジェクトのビルドシステムが確立している
- [ ] テストフレームワークが導入されている
- [ ] GitHub（またはGitHub互換）でホスティングされている

**期待される成果**: 自動テスト・ビルド・デプロイが可能なワークフロー

### シナリオ2: パイプライン最適化

**状況**: 既存のCI/CDパイプラインが遅い、または不安定

**適用条件**:
- [ ] パイプライン実行時間が目標を超えている（例: >10分）
- [ ] キャッシュが活用されていない
- [ ] 並列化可能なジョブが直列実行されている

**期待される成果**: 実行時間50%以上短縮、安定性向上

### シナリオ3: 品質ゲート導入

**状況**: 品質基準を満たさないコードが本番に流入している

**適用条件**:
- [ ] テストカバレッジが追跡されていない
- [ ] Lint/Formatter違反がマージされている
- [ ] セキュリティ脆弱性チェックがない

**期待される成果**: 品質基準を満たさないPRのマージブロック

## ワークフロー

### Phase 1: 要件分析と設計

**目的**: プロジェクト固有のCI/CD要件を明確化

**ステップ**:
1. **プロジェクト構造分析**:
   - パッケージマネージャーの特定（pnpm/npm/yarn）
   - テストフレームワークの特定（Vitest/Jest/Playwright）
   - ビルドシステムの特定（Next.js/Vite等）

2. **パイプラインステージ設計**:
   - Build Stage: ソースからデプロイ可能な成果物を生成
   - Test Stage: ユニット/統合/E2Eテストの実行
   - Quality Gate: 静的解析、カバレッジ、セキュリティスキャン
   - Deploy Stage: ステージング/本番環境への自動デプロイ

**判断基準**:
- [ ] プロジェクトの技術スタックが特定されているか？
- [ ] 各ステージの達成条件が明確か？
- [ ] 品質基準が測定可能か？

**リソース**: `resources/pipeline-patterns.md`

### Phase 2: ワークフロー実装

**目的**: 設計に基づいてGitHub Actionsワークフローを実装

**ステップ**:
1. **トリガー設定**:
   - PR作成時: `pull_request`
   - mainブランチへのプッシュ: `push`
   - 手動実行: `workflow_dispatch`

2. **ジョブ構成**:
   - 並列実行可能なジョブの特定
   - 依存関係（needs）の設定
   - マトリクスビルドの設計

3. **キャッシュ設定**:
   - 依存関係キャッシュ（node_modules/.pnpm-store）
   - ビルドキャッシュ（.next/cache）

**判断基準**:
- [ ] トリガー条件が要件を満たしているか？
- [ ] ジョブの並列化が最大化されているか？
- [ ] キャッシュが適切に設定されているか？

**リソース**: `resources/github-actions-syntax.md`, `resources/caching-strategies.md`

### Phase 3: 品質ゲート設定

**目的**: 品質基準を満たさないコードの本番流入を防ぐ

**ステップ**:
1. **必須チェック設定**:
   - TypeScript型チェック
   - ESLint/Prettier
   - テストカバレッジ閾値
   - セキュリティスキャン

2. **ブランチ保護設定**:
   - 必須ステータスチェック
   - PRレビュー要件
   - マージ前の最新化要求

**判断基準**:
- [ ] すべての品質基準がCI/CDで強制されているか？
- [ ] 品質ゲート失敗時のフィードバックが明確か？
- [ ] ブランチ保護が適切に設定されているか？

**リソース**: `resources/quality-gates.md`

### Phase 4: 検証と最適化

**目的**: パイプラインの動作確認と継続的改善

**ステップ**:
1. **動作検証**:
   - テストPRでの動作確認
   - すべてのジョブの成功確認
   - キャッシュヒットの確認

2. **パフォーマンス最適化**:
   - 実行時間の測定
   - ボトルネックの特定
   - 並列化の追加検討

**判断基準**:
- [ ] パイプラインが期待通り動作するか？
- [ ] 実行時間が目標以内か？
- [ ] キャッシュヒット率が高いか？

**リソース**: `resources/parallelization.md`

## 核心知識

### GitHub Actions構文の要点

**ワークフロートリガー**:
- `pull_request`: PR作成/更新時に実行
- `push`: 指定ブランチへのプッシュ時に実行
- `workflow_dispatch`: 手動実行を許可
- `schedule`: cron形式でスケジュール実行

**ジョブ構成の原則**:
- `needs`: ジョブ間の依存関係を定義
- `strategy.matrix`: 複数環境での並列テスト
- `continue-on-error`: 失敗しても次のジョブを実行
- `if`: 条件付き実行

**キャッシュの要点**:
- `actions/cache`: 依存関係のキャッシュ
- キーにはlock fileのハッシュを使用
- `restore-keys`: フォールバックキーの設定

詳細は `resources/github-actions-syntax.md` を参照

### パイプラインパターン

**多段階パイプライン（推奨）**:
```
Build → Test → Quality Gate → Deploy Staging → Deploy Production
```

**並列パイプライン**:
```
├── Build
├── Test Unit
├── Test E2E
├── Lint
└── Security Scan
→ Quality Gate → Deploy
```

詳細は `resources/pipeline-patterns.md` を参照

## ベストプラクティス

### すべきこと

1. **高速フィードバック**:
   - 最も失敗しやすいチェックを先に実行
   - キャッシュを活用して実行時間を短縮
   - 並列化可能なジョブは並列実行

2. **品質の作り込み**:
   - 品質ゲートは厳格に設定
   - テストカバレッジ閾値を設定
   - セキュリティスキャンを統合

3. **再利用性**:
   - Composite Actionsで共通処理を抽出
   - Reusable Workflowsでワークフローを共有
   - 環境変数で設定を外部化

### 避けるべきこと

1. **手動ステップ**:
   - ❌ 手動承認を必要とするデプロイ（本番を除く）
   - ✅ すべてのステージを自動化

2. **遅いフィードバック**:
   - ❌ 10分以上のパイプライン
   - ✅ 5分以内を目標

3. **フレーキーテスト**:
   - ❌ ランダムに失敗するテストの許容
   - ✅ フレーキーテストの即時修正

## トラブルシューティング

### 問題1: パイプラインが遅い

**症状**: 実行時間が10分を超える

**原因**:
- キャッシュが効いていない
- 並列化されていない
- 不要なステップがある

**解決策**:
1. キャッシュキーを確認し、ヒット率を測定
2. 独立したジョブを並列化
3. 不要なステップを削除

### 問題2: 品質ゲートが機能しない

**症状**: 品質基準を満たさないコードがマージされる

**原因**:
- ブランチ保護が未設定
- 必須ステータスチェックが未設定

**解決策**:
1. リポジトリ設定でブランチ保護を有効化
2. 必須ステータスチェックを設定
3. "Require branches to be up to date"を有効化

### 問題3: キャッシュが効かない

**症状**: 毎回依存関係がインストールされる

**原因**:
- キャッシュキーが毎回変わる
- restore-keysが未設定
- キャッシュサイズ上限

**解決策**:
1. lock fileのハッシュをキーに使用
2. restore-keysでフォールバックを設定
3. キャッシュサイズを確認（GitHub: 10GB上限）

## 関連スキル

- **infrastructure-as-code** (`.claude/skills/infrastructure-as-code/SKILL.md`): 構成管理の自動化
- **deployment-strategies** (`.claude/skills/deployment-strategies/SKILL.md`): デプロイ戦略
- **monitoring-alerting** (`.claude/skills/monitoring-alerting/SKILL.md`): モニタリングとアラート
- **docker-best-practices** (`.claude/skills/docker-best-practices/SKILL.md`): Docker最適化

## メトリクス

### パイプライン実行時間

**目標**: < 5分（CI）、< 10分（CD含む）

**測定方法**: GitHub Actions Insights

### キャッシュヒット率

**目標**: > 90%

**測定方法**: ワークフローログでcache-hitを確認

### デプロイ頻度

**目標**: 1日複数回

**測定方法**: デプロイワークフローの実行回数

### 変更失敗率

**目標**: < 5%

**測定方法**: (失敗デプロイ数 / 総デプロイ数) × 100

## 変更履歴

| バージョン | 日付 | 変更内容 |
|-----------|------|---------|
| 1.0.0 | 2025-11-25 | 初版作成 - GitHub Actions中心のCI/CDパイプライン設計 |

## 参考文献

- **『The DevOps Handbook』** Gene Kim他著
  - Chapter 9: Create the Foundations of Our Deployment Pipeline
  - Chapter 10: Enable Fast and Reliable Automated Testing

- **『Continuous Delivery』** Jez Humble, David Farley著
  - Chapter 5: Anatomy of the Deployment Pipeline
  - Chapter 6: Build and Deployment Scripting
