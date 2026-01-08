# 全コマンド・全オプション完全ガイド

## 📋 **全 24 コマンドの詳細使用方法**

30 の専門エージェントが連携してプロンプトエンジニアリングの包括的支援を提供します。各コマンドは特定の用途に最適化されており、段階的な機能展開と効率的な開発ワークフローを実現します。

---

## **1. コア管理コマンド (3 コマンド)**

### `/ai:core:init` - システム初期化

#### 概要

プロジェクトの初期化と基盤エージェントチームの起動を行う。Phase
1-5 の段階的展開により、プロジェクトの成長に応じて必要なエージェントを順次活性化し、DDD（ドメイン駆動設計）準拠の堅牢なアーキテクチャを構築する。

#### 使用エージェント（全30エージェント完全配置）

**Phase 1: 基盤構築（7エージェント）**

- **system-architect**
  (リーダー): アーキテクチャビジョン策定、技術意思決定統括、DDD原則適用監督
- **domain-modeller**: ドメイン境界定義、集約ルート設計、ユビキタス言語確立
- **backend-developer**: ドメインロジック実装、API開発、ビジネスルール実装
- **database-administrator**: データアーキテクチャ設計、永続化層構築、クエリ最適化
- **devops-coordinator**:
  CI/CDパイプライン構築、インフラ自動化、デプロイメント戦略
- **security-architect**: セキュリティアーキテクチャ設計、脅威モデリング、認証認可システム
- **version-control-specialist**:
  Git戦略設計、ブランチ管理、ソースコード管理体制構築

**Phase 2: コア機能実装（12エージェント）** 上記Phase 1 + 以下5エージェント:

- **prompt-engineering-specialist**: プロンプトテンプレート設計、マルチモデル最適化戦略
- **llm-integration**: 100+LLMプロバイダー統合、自動ルーティング、コスト最適化
- **api-designer**: RESTful/GraphQL/gRPC設計、OpenAPI仕様作成、APIガバナンス
- **frontend-architect**: Next.js/React実装、モダンフロントエンドアーキテクチャ
- **event-bus-manager**: イベント駆動設計統括、非同期メッセージング基盤
- **test-automation-engineer**: TDD実装、自動テストフレームワーク、品質保証

**Phase 3: 高度機能実装（18エージェント）** 上記Phase 2 + 以下6エージェント:

- **evaluation-engine**: 多層評価メトリクス、RAG指標測定、品質評価自動化
- **workflow-orchestrator**:
  LangGraphワークフロー、プロンプトチェーン、ビジュアルエディタ
- **vector-database-specialist**: libSQL
  Vector管理、埋め込み戦略、類似度検索最適化
- **real-time-features-specialist**: WebSocket実装、協調編集、リアルタイム同期
- **ui-ux-designer**: ユーザー中心設計、デザインシステム、Figmaプロトタイプ
- **observability-engineer**: 分散トレーシング、3
  Pillars監視、観測可能性プラットフォーム

**Phase 4: 最適化・運用（24エージェント）** 上記Phase 3 + 以下6エージェント:

- **performance-optimizer**: システム全体最適化、ボトルネック解消、効率改善
- **edge-computing-specialist**: Cloudflare
  Workers、エッジコンピューティング、グローバル配信
- **sre-agent**: SLO管理、可用性確保、インシデント対応、運用自動化
- **cost-optimization**: FinOps実践、LLMコスト最適化、ROI最大化、予算管理
- **data-analyst**: 統計分析、機械学習、ビジネスインテリジェンス、データ駆動意思決定
- **qa-coordinator**: 品質保証戦略、テスト活動統括、継続的品質改善

**Phase 5: エンタープライズ対応（全30エージェント）** 上記Phase
4 + 以下6エージェント:

- **compliance-officer**:
  GDPR/CCPA対応、データプライバシー保護、監査対応、規制要件管理
- **data-migration-specialist**: ゼロダウンタイム移行、ETLパイプライン、データ整合性保証
- **user-research**: ユーザーインサイト発掘、定性定量調査、UX向上提案
- **product-manager**: 製品ビジョン策定、ステークホルダー調整、ビジネス成果最大化
- **technical-documentation**:
  API仕様書、アーキテクチャ文書、運用ドキュメント体系管理

#### 全オプション一覧

| オプション | 値               | 説明                   |
| ---------- | ---------------- | ---------------------- |
| --phase    | 1-5              | 活性化フェーズ指定     |
| --agents   | core/all/custom  | エージェント選択モード |
| --env      | dev/staging/prod | 環境指定               |
| --ddd      | フラグ           | DDD 構造強制適用       |

#### 使用例と説明

```bash
# 基本形: プロジェクト名のみ指定（デフォルト: phase 1, agents core, env dev）
/ai:core:init my-project

# Phase 1: 基盤構築（7エージェント）
/ai:core:init my-project --phase 1 --agents core --env dev
# system-architect, domain-modeller, devops-coordinator,
# product-manager, technical-documentation, backend-developer, version-control-specialist が起動

# Phase 2: コア機能（13エージェント）
/ai:core:init my-project --phase 2 --agents core --env dev
# Phase 1 + api-designer, frontend-architect, database-administrator,
# test-automation-engineer, prompt-engineering-specialist, llm-integration

# Phase 3: 高度機能（19エージェント）
/ai:core:init my-project --phase 3 --agents all --env staging
# Phase 2 + evaluation-engine, workflow-orchestrator, vector-database-specialist,
# real-time-features-specialist, ui-ux-designer, observability-engineer

# Phase 4: 最適化（25エージェント）
/ai:core:init my-project --phase 4 --agents all --env staging
# Phase 3 + performance-optimizer, edge-computing-specialist, sre,
# cost-optimization, data-analyst, qa-coordinator

# Phase 5: エンタープライズ（全30エージェント）
/ai:core:init my-project --phase 5 --agents all --env prod --ddd
# 全エージェント起動 + DDD完全準拠構造

# カスタムエージェント選択（対話的）
/ai:core:init my-project --agents custom
# 対話形式で必要なエージェントを選択

# 本番環境での初期化
/ai:core:init production-system --phase 5 --agents all --env prod --ddd
# 本番用設定、全エージェント、DDD強制
```

### `/ai:core:sync` - エージェント同期

#### 概要

エージェント間の状態同期とメモリ共有を管理する。異なるエージェントが並列作業する際の一貫性を保ち、コンフリクトの自動解決やナレッジの効率的な共有を実現。チーム単位での部分同期から全エージェント同期まで柔軟に対応。

#### 使用エージェント（全30エージェント中の関連エージェント）

**同期統括チーム（10エージェント）**

- **event-bus-manager**
  (リーダー): イベント駆動同期統括、非同期メッセージング制御、状態同期調整
- **system-architect**: 同期アーキテクチャ設計、整合性ルール定義、分散システム設計
- **backend-developer**: 同期エンジン実装、状態管理システム構築、コンフリクト解決ロジック
- **observability-engineer**: 同期プロセス監視、パフォーマンス追跡、分散トレーシング
- **qa-coordinator**: 同期品質保証、データ整合性検証、テスト戦略統括
- **database-administrator**: データ一貫性管理、分散データベース同期、トランザクション制御
- **performance-optimizer**: 同期処理最適化、レイテンシ削減、スループット改善
- **real-time-features-specialist**: リアルタイム同期機能、WebSocket状態管理、協調編集同期
- **security-architect**: 同期セキュリティ、アクセス制御、暗号化通信
- **devops-coordinator**: 同期インフラ管理、CI/CD統合、デプロイメント調整

**間接支援エージェント（8エージェント）**

- **frontend-architect**: クライアント側同期実装、UI状態管理、オフライン対応
- **test-automation-engineer**: 同期テスト自動化、整合性テスト、負荷テスト
- **api-designer**: 同期API設計、エンドポイント仕様、RESTful同期プロトコル
- **technical-documentation**: 同期仕様文書、運用手順書、トラブルシューティングガイド
- **cost-optimization**: 同期処理コスト分析、リソース効率化、使用量最適化
- **compliance-officer**: データ同期コンプライアンス、プライバシー保護、監査対応
- **user-research**: 同期UX調査、ユーザビリティテスト、フィードバック収集
- **sre-agent**: 同期可用性管理、障害対応、SLO設定

#### 全オプション一覧

| オプション | 値                       | 説明       |
| ---------- | ------------------------ | ---------- |
| --scope    | all/team/specific-agents | 同期範囲   |
| --mode     | share/merge/resolve      | 同期モード |
| --priority | high/normal              | 優先度     |

#### 使用例と説明

```bash
# 基本形: 全エージェント共有モード
/ai:core:sync

# 全エージェント同期 - 共有モード（読み取り専用）
/ai:core:sync --scope all --mode share
# 全30エージェントの状態を共有、変更なし

# 全エージェント同期 - マージモード（統合）
/ai:core:sync --scope all --mode merge
# 各エージェントの状態を統合、自動コンフリクト解決

# 全エージェント同期 - 解決モード（コンフリクト解決）
/ai:core:sync --scope all --mode resolve --priority high
# コンフリクトを優先度付きで解決

# チーム単位の同期
/ai:core:sync --scope team:prompt-optimization --mode share
# プロンプト最適化チーム（5エージェント）のみ同期

# 特定エージェント間の同期
/ai:core:sync --scope specific-agents --mode merge
# 対話的に選択したエージェント間で同期

# 緊急同期（高優先度）
/ai:core:sync --scope all --mode resolve --priority high
# システム異常時の緊急同期、強制解決
```

### `/ai:core:team` - チーム編成

#### 概要

タスクの性質と規模に応じて最適なエージェントチームを動的に編成する。小規模タスクから大規模プロジェクトまで、コスト効率・品質・パフォーマンスのバランスを考慮した戦略的チーム構築により、リソース最適化と成果最大化を実現。

#### 使用エージェント（全30エージェント完全活用）

**チーム戦略統括（12エージェント）**

- **product-manager**
  (リーダー): チーム編成戦略立案、ビジネス目標アライメント、ステークホルダー調整
- **system-architect**: 技術要件分析、アーキテクチャ複雑度評価、技術スタック選定
- **qa-coordinator**: 品質基準定義、テスト戦略チーム構成、品質ゲート設計
- **cost-optimization**: コスト効率分析、リソース配分最適化、予算制約考慮
- **user-research**: ユーザー要件分析、機能優先度評価、UX要件定義
- **domain-modeller**: ドメイン複雑度分析、専門知識要件評価、チーム構成提案
- **devops-coordinator**: インフラ要件評価、デプロイメント戦略、運用負荷分析
- **security-architect**: セキュリティ要件分析、コンプライアンス要件、セキュリティチーム編成
- **compliance-officer**: 規制要件評価、監査対応チーム、コンプライアンス体制
- **technical-documentation**: ドキュメント要件分析、文書化体制、ナレッジ管理
- **observability-engineer**: 監視要件分析、運用チーム構成、SLO定義
- **sre-agent**: 可用性要件評価、運用負荷分析、インシデント対応体制

**専門機能チーム編成（18エージェント）**

**小規模チーム（3-5エージェント）**: コスト重視、シンプルタスク

- **backend-developer**: コア実装、API開発
- **frontend-architect**: UI実装、ユーザーインターフェース
- **test-automation-engineer**: 品質保証、自動テスト
- **database-administrator**: データ管理、永続化
- **api-designer**: インターフェース設計

**中規模チーム（6-10エージェント）**: 品質重視、標準的プロジェクト

- 上記5エージェント +
- **prompt-engineering-specialist**: プロンプト最適化
- **llm-integration**: LLM統合管理
- **performance-optimizer**: パフォーマンス調整
- **ui-ux-designer**: デザインシステム
- **vector-database-specialist**: ベクトル検索

**大規模チーム（11+エージェント）**: パフォーマンス重視、複雑プロジェクト

- 上記10エージェント +
- **evaluation-engine**: 評価メトリクス
- **workflow-orchestrator**: ワークフロー自動化
- **real-time-features-specialist**: リアルタイム機能
- **edge-computing-specialist**: エッジ最適化
- **event-bus-manager**: イベント駆動設計
- **data-analyst**: データ分析・インサイト
- **data-migration-specialist**: データ移行
- **version-control-specialist**: ソースコード管理

#### 全オプション一覧

| オプション | 値                       | 説明         |
| ---------- | ------------------------ | ------------ |
| --size     | small/medium/large       | チームサイズ |
| --optimize | performance/cost/quality | 最適化戦略   |
| --duration | sprint/epic              | 期間設定     |

#### 使用例と説明

```bash
# 基本形: タスクタイプのみ指定
/ai:core:team feature-development

# 小規模チーム（3-5エージェント）
/ai:core:team simple-task --size small --optimize cost
# コスト重視の小規模チーム編成

# 中規模チーム（6-10エージェント）
/ai:core:team normal-task --size medium --optimize quality --duration sprint
# 品質重視、2週間スプリント向けチーム

# 大規模チーム（11+エージェント）
/ai:core:team complex-project --size large --optimize performance --duration epic
# パフォーマンス重視、2-3ヶ月エピック向け

# インシデント対応チーム
/ai:core:team incident-response --size small --optimize performance --duration sprint
# sre, observability-engineer, security-architect の即応チーム

# プロンプト最適化チーム
/ai:core:team prompt-optimization --size medium --optimize quality
# prompt-engineering-specialist主導の5エージェントチーム
```

---

## **2. 要件定義コマンド (2 コマンド)**

### `/ai:requirements:define` - 要件定義

#### 概要

ステークホルダーのニーズを体系的に収集・分析し、実装可能な要件仕様に変換する。アジャイル、ウォーターフォール、ハイブリッド手法に対応し、ユーザーストーリーから詳細仕様書まで幅広い形式で要件を定義。優先順位付けと検証により品質を担保。

#### 使用エージェント（全30エージェント中の要件関連エージェント）

**要件定義コアチーム（15エージェント）**

- **product-manager**
  (リーダー): ビジネス要件定義、ステークホルダー調整、優先順位設定
- **domain-modeller**: ドメイン知識要件反映、ユビキタス言語確立、ビジネスルール定義
- **user-research**: ユーザーニーズ調査、ペルソナ・ジャーニーマップ作成、行動分析
- **system-architect**: 技術制約・実現可能性評価、非機能要件定義、アーキテクチャ制約
- **qa-coordinator**: 受入基準定義、テスタビリティ要件、品質基準設定
- **compliance-officer**: 規制・コンプライアンス要件確認、法的制約、監査要件
- **security-architect**: セキュリティ要件定義、脅威分析、データ保護要件
- **api-designer**: API要件定義、インターフェース仕様、統合要件
- **ui-ux-designer**: UI/UX要件、ユーザビリティ基準、アクセシビリティ要件
- **performance-optimizer**: パフォーマンス要件、レスポンス時間、スループット基準
- **cost-optimization**: 予算制約、コスト要件、ROI目標設定
- **technical-documentation**: 文書化要件、仕様書形式、ドキュメント体系
- **backend-developer**: 技術実装要件、開発制約、実装可能性評価
- **frontend-architect**: フロントエンド要件、ブラウザ対応、モバイル要件
- **database-administrator**: データ要件、永続化制約、データモデル要件

**専門要件支援チーム（10エージェント）**

- **prompt-engineering-specialist**: プロンプト品質要件、AI機能仕様、LLM要件
- **llm-integration**: LLMプロバイダー要件、API制約、コスト制約
- **evaluation-engine**: 評価指標要件、品質メトリクス、測定基準
- **real-time-features-specialist**: リアルタイム要件、同期仕様、レイテンシ要件
- **vector-database-specialist**: ベクトル検索要件、埋め込み仕様、類似度基準
- **workflow-orchestrator**: ワークフロー要件、自動化仕様、プロセス定義
- **observability-engineer**: 監視要件、ログ仕様、メトリクス要件
- **devops-coordinator**: デプロイメント要件、CI/CD仕様、インフラ制約
- **test-automation-engineer**: テスト要件、自動化仕様、品質保証基準
- **data-analyst**: 分析要件、レポート仕様、データ活用要件

**運用・保守要件チーム（5エージェント）**

- **sre-agent**: 可用性要件、SLO定義、運用要件
- **edge-computing-specialist**: エッジ要件、配信仕様、グローバル対応
- **event-bus-manager**: イベント要件、メッセージング仕様、非同期処理
- **data-migration-specialist**: データ移行要件、互換性仕様、移行戦略
- **version-control-specialist**: バージョン管理要件、ブランチ戦略、リリース管理

#### 全オプション一覧

| オプション | 値                     | 説明         |
| ---------- | ---------------------- | ------------ |
| --format   | agile/waterfall/hybrid | 開発手法     |
| --validate | フラグ                 | 検証実行     |
| --priority | フラグ                 | 優先順位付け |

#### 使用例と説明

```bash
# 基本形: スコープのみ指定
/ai:requirements:define user-authentication

# アジャイル形式
/ai:requirements:define payment-system --format agile
# ユーザーストーリー形式での要件定義

# ウォーターフォール形式
/ai:requirements:define enterprise-feature --format waterfall --validate
# 詳細な仕様書形式、完全性検証付き

# ハイブリッド形式
/ai:requirements:define complex-system --format hybrid --priority
# アジャイルとウォーターフォールの混合、MoSCoW優先順位

# 完全検証付き要件定義
/ai:requirements:define critical-feature --format agile --validate --priority
# すべてのオプション有効化
```

### `/ai:requirements:domain` - ドメインモデリング

#### 概要

DDD（ドメイン駆動設計）の中核となるドメインモデルを設計・構築する。集約ルート、エンティティ、値オブジェクトの適切な設計により、ビジネスロジックを明確に表現。イベントソーシングやCQRSパターンとの統合により、複雑なビジネス要件に対応した堅牢なドメイン層を構築。

#### 使用エージェント（全30エージェント中のDDD関連エージェント）

**ドメインモデリングコアチーム（12エージェント）**

- **domain-modeller**
  (リーダー): ドメインモデル設計、集約境界定義、ユビキタス言語確立、境界コンテキスト分析
- **system-architect**:
  DDD戦術パターン適用、アーキテクチャ整合性確保、ドメイン層設計監督
- **event-bus-manager**: ドメインイベント設計、イベントソーシング統合、イベントストア管理
- **backend-developer**: ドメインロジック実装、永続化層統合、集約ルート実装
- **api-designer**: ドメインモデルAPI表現、境界コンテキスト間通信、ドメインサービス公開
- **database-administrator**: 集約永続化戦略、データモデルマッピング、リポジトリパターン実装
- **prompt-engineering-specialist**: プロンプトドメイン設計、AIドメイン知識モデリング、専門用語体系化
- **vector-database-specialist**: ドメイン埋め込み戦略、概念類似度モデリング、セマンティック検索
- **test-automation-engineer**: ドメインテスト設計、ビジネスルールテスト、仕様テスト自動化
- **qa-coordinator**: ドメイン品質基準、ビジネス要件適合性、ドメイン整合性検証
- **technical-documentation**: ドメイン文書体系、ユビキタス言語辞書、ドメイン知識ベース
- **performance-optimizer**: ドメイン処理最適化、集約サイズ調整、ドメインサービス効率化

**DDD戦術パターン実装チーム（10エージェント）**

- **workflow-orchestrator**: ドメインプロセス自動化、ビジネスワークフロー、プロセスマネージャー実装
- **real-time-features-specialist**: ドメインイベントリアルタイム配信、イベント投影、ライブ更新
- **evaluation-engine**: ドメインルール評価、ビジネス指標測定、コンプライアンス検証
- **observability-engineer**: ドメインメトリクス監視、ビジネスプロセス追跡、ドメインログ分析
- **security-architect**: ドメインセキュリティ、認可ルール、データ保護ポリシー
- **compliance-officer**: ビジネスルールコンプライアンス、規制要件マッピング、監査対応
- **cost-optimization**: ドメイン処理コスト分析、リソース効率化、ビジネス価値最適化
- **data-analyst**: ドメインデータ分析、ビジネスインサイト、パターン発見
- **user-research**: ドメインエキスパートインタビュー、業務フロー調査、要件抽出
- **product-manager**: ドメイン戦略、ビジネス価値定義、ドメイン優先順位

**DDD支援・統合チーム（8エージェント）**

- **frontend-architect**: ドメインUI表現、アプリケーションサービス、プレゼンテーション層
- **llm-integration**: ドメイン知識AI活用、自然言語ドメイン処理、知識ベース統合
- **devops-coordinator**: ドメイン境界デプロイ、マイクロサービス展開、境界コンテキスト運用
- **sre-agent**: ドメインサービス可用性、ビジネス継続性、ドメインSLO管理
- **edge-computing-specialist**: ドメイン処理分散、エッジでのビジネスロジック、地理的分散
- **data-migration-specialist**: ドメインデータ移行、レガシー統合、ドメインモデル変換
- **ui-ux-designer**: ドメイン概念UI表現、ユーザージャーニー、ドメイン操作デザイン
- **version-control-specialist**: ドメインモデルバージョニング、進化管理、互換性保証

#### 全オプション一覧

| オプション       | 値                       | 説明                     |
| ---------------- | ------------------------ | ------------------------ |
| --aggregate      | root/entity/value-object | 集約タイプ               |
| --event-sourcing | フラグ                   | イベントソーシング有効化 |
| --cqrs           | フラグ                   | CQRS 有効化              |

#### 使用例と説明

```bash
# 基本形: コンテキスト名のみ
/ai:requirements:domain user-context

# 集約ルート設計
/ai:requirements:domain prompt-context --aggregate root
# プロンプト集約ルートの定義

# エンティティ設計
/ai:requirements:domain evaluation-context --aggregate entity
# 評価エンティティの定義

# 値オブジェクト設計
/ai:requirements:domain score-context --aggregate value-object
# スコア値オブジェクトの定義

# イベントソーシング対応
/ai:requirements:domain audit-context --aggregate root --event-sourcing
# 監査ログ用イベントソーシング設計

# CQRS実装
/ai:requirements:domain reporting-context --cqrs
# 読み取りモデルと書き込みモデル分離

# 完全DDD設計
/ai:requirements:domain core-context --aggregate root --event-sourcing --cqrs
# すべての戦術的パターン適用
```

---

## **3. アーキテクチャコマンド (2 コマンド)**

### `/ai:architecture:design` - システム設計

#### 概要

システム全体のアーキテクチャパターンを設計・選択する。マイクロサービス、モノリス、サーバーレス、ハイブリッド構成から最適解を決定し、DDD原則とイベント駆動アーキテクチャを統合。スケーラビリティ、保守性、コスト効率を総合的に考慮した技術戦略を策定。

#### 使用エージェント（全30エージェント中のアーキテクチャ関連エージェント）

**アーキテクチャ設計コアチーム（15エージェント）**

- **system-architect**
  (リーダー): アーキテクチャビジョン策定、技術意思決定統括、全体設計監督
- **domain-modeller**: 境界コンテキスト設計、ドメイン分割戦略、マイクロサービス境界定義
- **security-architect**: セキュリティアーキテクチャ統合、脅威モデリング、ゼロトラスト設計
- **performance-optimizer**: パフォーマンス要件定義、ボトルネック予測、スケーラビリティ設計
- **edge-computing-specialist**: エッジコンピューティング戦略、分散アーキテクチャ、CDN統合
- **devops-coordinator**: インフラストラクチャ設計、デプロイメント戦略、CI/CD アーキテクチャ
- **cost-optimization**: TCO分析、コスト効率最適化、リソース配分戦略
- **backend-developer**: バックエンドアーキテクチャ、サービス間通信、API ゲートウェイ設計
- **frontend-architect**: フロントエンドアーキテクチャ、クライアント設計、マイクロフロントエンド
- **database-administrator**: データアーキテクチャ、分散データベース、データ一貫性戦略
- **event-bus-manager**: イベント駆動アーキテクチャ、メッセージングパターン、非同期処理設計
- **api-designer**:
  API アーキテクチャ、サービスメッシュ、インターフェース統合戦略
- **observability-engineer**: 観測可能性アーキテクチャ、監視戦略、ログ集約設計
- **sre-agent**: 可用性アーキテクチャ、障害対応設計、SLO 駆動設計
- **compliance-officer**: コンプライアンスアーキテクチャ、規制対応設計、データガバナンス

**専門機能アーキテクチャチーム（10エージェント）**

- **prompt-engineering-specialist**: プロンプト処理アーキテクチャ、LLM統合設計、AI パイプライン
- **llm-integration**: マルチLLMアーキテクチャ、プロバイダー統合、自動ルーティング設計
- **evaluation-engine**: 評価アーキテクチャ、メトリクス収集設計、品質測定システム
- **workflow-orchestrator**: ワークフローアーキテクチャ、プロセス自動化、LangGraph統合
- **vector-database-specialist**: ベクトルアーキテクチャ、埋め込み処理、類似度検索システム
- **real-time-features-specialist**: リアルタイムアーキテクチャ、WebSocket設計、協調編集システム
- **ui-ux-designer**: デザインシステムアーキテクチャ、コンポーネント設計、アクセシビリティ
- **test-automation-engineer**: テストアーキテクチャ、自動化戦略、品質保証システム
- **data-migration-specialist**: 移行アーキテクチャ、ETL設計、データ変換システム
- **data-analyst**: 分析アーキテクチャ、データパイプライン、BI システム設計

**運用・統合アーキテクチャチーム（5エージェント）**

- **technical-documentation**: ドキュメントアーキテクチャ、知識管理システム、情報設計
- **qa-coordinator**: 品質アーキテクチャ、テスト戦略統合、品質ゲートシステム
- **user-research**: ユーザー中心アーキテクチャ、フィードバックループ設計、UX データ統合
- **product-manager**: プロダクトアーキテクチャ、ビジネス価値設計、機能統合戦略
- **version-control-specialist**: バージョン管理アーキテクチャ、リリース戦略、ブランチ設計

#### 全オプション一覧

| オプション     | 値                                       | 説明                   |
| -------------- | ---------------------------------------- | ---------------------- |
| pattern        | microservices/monolith/serverless/hybrid | アーキテクチャパターン |
| --ddd          | フラグ                                   | DDD 適用               |
| --event-driven | フラグ                                   | イベント駆動有効化     |
| --scale        | horizontal/vertical                      | スケーリング戦略       |

#### 使用例と説明

```bash
# マイクロサービス設計
/ai:architecture:design microservices
# 基本的なマイクロサービスアーキテクチャ

# モノリス設計
/ai:architecture:design monolith --ddd
# DDDモノリス設計

# サーバーレス設計
/ai:architecture:design serverless --scale horizontal
# Cloudflare Workers活用、水平スケーリング

# ハイブリッド設計
/ai:architecture:design hybrid --ddd --event-driven
# モノリスとマイクロサービスの混合、イベント駆動

# 完全な設計
/ai:architecture:design microservices --ddd --event-driven --scale horizontal
# DDD+イベント駆動+水平スケーリング
```

### `/ai:architecture:event` - イベント設計

#### 概要

イベント駆動アーキテクチャの設計・実装を行う。Sagaパターンによる分散トランザクション、CQRSによる読み書き分離、イベントソーシングによる状態管理など、複雑なビジネス要件に対応。非同期処理とリアルタイム通信により、スケーラブルで疎結合なシステムを構築。

#### 使用エージェント（全30エージェント中のイベント関連エージェント）

**イベント駆動設計コアチーム（12エージェント）**

- **event-bus-manager**
  (リーダー): イベント駆動設計統括、メッセージングアーキテクチャ、イベントバス管理
- **system-architect**: イベントアーキテクチャ承認、整合性確保、分散システム設計
- **domain-modeller**: ドメインイベント定義、集約間イベント設計、ビジネスイベントモデリング
- **backend-developer**: イベントハンドラー実装、Sagaオーケストレーション、イベントソーシング実装
- **real-time-features-specialist**: リアルタイムイベント配信、WebSocket統合、ライブイベントストリーミング
- **observability-engineer**: イベントトレーシング、分散ログ監視、イベントフロー可視化
- **performance-optimizer**: イベント処理最適化、スループット調整、レイテンシ削減
- **database-administrator**: イベントストア設計、イベント永続化、CQRS読み書き分離
- **security-architect**: イベントセキュリティ、メッセージ暗号化、認可制御
- **api-designer**: イベント API 設計、イベント駆動 API、非同期インターフェース
- **devops-coordinator**: イベントインフラ管理、メッセージブローカー運用、スケーリング戦略
- **sre-agent**: イベント可用性管理、メッセージ配信保証、障害回復

**イベントパターン実装チーム（10エージェント）**

- **workflow-orchestrator**:
  Sagaパターン実装、プロセスマネージャー、ワークフローイベント管理
- **prompt-engineering-specialist**: プロンプトイベント設計、AI処理イベント、評価イベント
- **llm-integration**: LLMイベント統合、モデル切替イベント、API呼び出しイベント
- **evaluation-engine**: 評価イベント設計、メトリクスイベント、品質測定イベント
- **vector-database-specialist**: ベクトルイベント処理、埋め込み更新イベント、検索イベント
- **test-automation-engineer**: テストイベント自動化、品質ゲートイベント、CI/CDイベント
- **data-analyst**: データイベント分析、ビジネスインサイトイベント、レポートイベント
- **cost-optimization**: コストイベント監視、リソース使用イベント、最適化トリガー
- **compliance-officer**: コンプライアンスイベント、監査ログイベント、規制対応イベント
- **frontend-architect**:
  UIイベント統合、ユーザーアクションイベント、状態同期イベント

**イベント運用・統合チーム（8エージェント）**

- **technical-documentation**: イベント仕様文書、イベントカタログ、統合ガイド
- **qa-coordinator**: イベント品質保証、イベントテスト戦略、統合テスト
- **user-research**: ユーザーイベント分析、行動イベント、フィードバックイベント
- **product-manager**: プロダクトイベント戦略、ビジネスイベント定義、価値測定イベント
- **ui-ux-designer**:
  UIイベント設計、ユーザーエクスペリエンスイベント、インタラクションイベント
- **data-migration-specialist**: 移行イベント管理、データ変換イベント、同期イベント
- **edge-computing-specialist**: エッジイベント処理、分散イベント配信、地理的イベント管理
- **version-control-specialist**: バージョン管理イベント、リリースイベント、デプロイメントイベント

#### 全オプション一覧

| オプション | 値                       | 説明                 |
| ---------- | ------------------------ | -------------------- |
| --pattern  | saga/cqrs/event-sourcing | イベントパターン     |
| --broker   | redis/kafka/rabbitmq     | メッセージブローカー |

#### 使用例と説明

```bash
# 基本形: ドメインのみ指定
/ai:architecture:event payment-domain

# Sagaパターン
/ai:architecture:event order-processing --pattern saga --broker redis
# 分散トランザクション管理

# CQRSパターン
/ai:architecture:event user-management --pattern cqrs --broker kafka
# コマンドとクエリの分離

# イベントソーシング
/ai:architecture:event audit-log --pattern event-sourcing --broker kafka
# イベントストア実装

# 複合パターン
/ai:architecture:event complex-domain --pattern saga --pattern cqrs --broker redis
# Saga+CQRS実装
```

---

## **4. プロンプト管理コマンド (4 コマンド)**

### `/ai:prompt:create` - プロンプト作成

#### 概要

高品質なプロンプトの設計・作成を支援する。テンプレート駆動のアプローチで段階的にプロンプトを構築し、100+のLLMプロバイダーに対応したマルチモデル最適化を実行。プロンプトチェーンによる複雑なワークフロー対応と、再利用可能なテンプレート化により効率的なプロンプト管理を実現。

#### 使用エージェント（全30エージェント中のプロンプト作成関連エージェント）

**プロンプト設計コアチーム（15エージェント）**

- **prompt-engineering-specialist**
  (リーダー): プロンプト設計、品質最適化、チェーン構築、テンプレート開発
- **llm-integration**: マルチモデル対応、プロバイダー固有最適化、API統合、コスト効率化
- **domain-modeller**: ドメイン知識プロンプト反映、専門用語整理、ビジネスロジック統合
- **workflow-orchestrator**: プロンプトチェーン設計、LangGraph統合、ワークフロー自動化
- **vector-database-specialist**: プロンプト埋め込み生成、類似検索基盤、セマンティック分析
- **evaluation-engine**: プロンプト品質評価、自動テスト実行、メトリクス測定
- **user-research**: ユーザーニーズ分析、プロンプト使用パターン調査、フィードバック収集
- **ui-ux-designer**: プロンプト作成UI設計、ユーザビリティ最適化、インタラクションデザイン
- **frontend-architect**: プロンプトエディタ実装、リアルタイムプレビュー、UI統合
- **backend-developer**: プロンプト処理エンジン、バックエンドAPI、データ管理
- **data-analyst**: プロンプト利用統計、効果分析、改善提案データ
- **technical-documentation**: プロンプト仕様書、使用ガイド、ベストプラクティス文書
- **performance-optimizer**: プロンプト処理最適化、レスポンス時間改善、リソース効率化
- **security-architect**: プロンプトセキュリティ、機密情報保護、アクセス制御
- **cost-optimization**: プロンプト実行コスト分析、トークン最適化、予算管理

**プロンプト品質保証チーム（8エージェント）**

- **qa-coordinator**: プロンプト品質基準、テスト戦略、品質保証プロセス
- **test-automation-engineer**: プロンプトテスト自動化、回帰テスト、品質検証
- **compliance-officer**: プロンプトコンプライアンス、倫理ガイドライン、規制対応
- **observability-engineer**: プロンプト実行監視、パフォーマンス追跡、ログ分析
- **sre-agent**: プロンプトサービス可用性、障害対応、SLO管理
- **api-designer**: プロンプトAPI設計、インターフェース仕様、統合サポート
- **database-administrator**: プロンプトデータ管理、バージョン管理、永続化戦略
- **real-time-features-specialist**: リアルタイムプロンプト処理、協調編集、ライブプレビュー

**プロンプト統合・運用チーム（7エージェント）**

- **devops-coordinator**: プロンプトデプロイメント、CI/CD統合、運用自動化
- **edge-computing-specialist**: エッジでのプロンプト処理、分散実行、レイテンシ最適化
- **event-bus-manager**: プロンプトイベント管理、非同期処理、イベント駆動統合
- **data-migration-specialist**: レガシープロンプト移行、データ変換、互換性確保
- **system-architect**: プロンプトアーキテクチャ、システム統合、技術戦略
- **product-manager**: プロンプト製品戦略、ロードマップ、ビジネス価値最大化
- **version-control-specialist**: プロンプトバージョン管理、ブランチ戦略、リリース管理

#### 全オプション一覧

| オプション | 値                     | 説明           |
| ---------- | ---------------------- | -------------- |
| --model    | gpt4/claude/gemini/all | 対象モデル     |
| --chain    | フラグ                 | チェーン有効化 |
| --optimize | フラグ                 | 最適化実行     |
| --template | フラグ                 | テンプレート化 |

#### 使用例と説明

```bash
# 基本形: 目的のみ指定
/ai:prompt:create code-review

# 単一モデル向け
/ai:prompt:create sql-query --model gpt4
# GPT-4専用プロンプト

# マルチモデル対応
/ai:prompt:create general-assistant --model all --optimize
# 全モデル対応、最適化済み

# プロンプトチェーン
/ai:prompt:create research-flow --chain --template
# 多段階プロンプト、テンプレート化

# 完全最適化
/ai:prompt:create production-prompt --model all --chain --optimize --template
# すべての機能有効化
```

### `/ai:prompt:evaluate` - プロンプト評価

#### 概要

多層評価メトリクスによりプロンプト品質を定量的に分析・評価する。精度、一貫性、コスト効率、倫理性、RAG指標など包括的な評価軸で客観的品質測定を実行。ベースライン比較と改善提案により継続的なプロンプト最適化サイクルを実現し、データ駆動のプロンプト開発を支援。

#### 使用エージェント（全30エージェント中のプロンプト評価関連エージェント）

**評価エンジンコアチーム（12エージェント）**

- **evaluation-engine**
  (リーダー): 多層評価メトリクス実装、品質スコアリング、評価フレームワーク統括
- **llm-integration**: 複数モデル評価実行、プロバイダー間比較、マルチモデル評価統合
- **data-analyst**: 評価結果統計分析、パフォーマンス傾向分析、データ駆動インサイト
- **prompt-engineering-specialist**: 評価結果改善提案、品質向上戦略、プロンプト最適化
- **cost-optimization**: トークンコスト分析、ROI計算、評価コスト最適化
- **vector-database-specialist**: 類似プロンプト検索、品質ベンチマーク、セマンティック比較
- **test-automation-engineer**: 評価テスト自動化、回帰評価、品質保証テスト
- **observability-engineer**: 評価プロセス監視、メトリクス収集、パフォーマンス追跡
- **workflow-orchestrator**: 評価ワークフロー自動化、バッチ評価、スケジュール実行
- **backend-developer**: 評価システム実装、評価API開発、データ処理エンジン
- **database-administrator**: 評価結果保存、履歴管理、評価データベース最適化
- **performance-optimizer**: 評価処理最適化、並列評価、実行時間短縮

**評価品質・分析チーム（10エージェント）**

- **qa-coordinator**: 評価基準定義、評価品質保証、メトリクス標準化
- **user-research**: ユーザー評価フィードバック、主観的品質分析、満足度調査
- **domain-modeller**: ドメイン固有評価基準、専門分野メトリクス、業界標準適用
- **compliance-officer**: 評価倫理基準、バイアス検出、公正性確保
- **security-architect**: 評価セキュリティ、機密性評価、プライバシー保護
- **frontend-architect**: 評価結果表示UI、ダッシュボード実装、可視化インターフェース
- **ui-ux-designer**: 評価結果UX設計、データ可視化、インタラクティブレポート
- **api-designer**: 評価API設計、外部統合、評価サービスインターフェース
- **technical-documentation**: 評価指標文書、評価手順書、メトリクス仕様書
- **real-time-features-specialist**: リアルタイム評価、ライブフィードバック、即時分析

**評価運用・統合チーム（8エージェント）**

- **devops-coordinator**: 評価インフラ管理、CI/CD評価統合、自動評価パイプライン
- **sre-agent**: 評価サービス可用性、評価システム監視、障害対応
- **edge-computing-specialist**: 分散評価処理、エッジでの評価実行、グローバル評価
- **event-bus-manager**: 評価イベント管理、非同期評価、イベント駆動評価
- **system-architect**: 評価アーキテクチャ設計、評価システム統合、技術戦略
- **product-manager**: 評価戦略策定、評価ロードマップ、ビジネス価値測定
- **data-migration-specialist**: 評価データ移行、レガシー評価統合、データ変換
- **version-control-specialist**: 評価バージョン管理、評価履歴追跡、変更管理

#### 全オプション一覧

| オプション | 値                            | 説明         |
| ---------- | ----------------------------- | ------------ |
| --metrics  | accuracy/consistency/cost/all | 評価指標     |
| --compare  | baseline-id                   | 比較対象     |
| --improve  | フラグ                        | 改善提案生成 |

#### 使用例と説明

```bash
# 基本形: プロンプトIDのみ
/ai:prompt:evaluate prompt-123

# 特定メトリクス評価
/ai:prompt:evaluate prompt-123 --metrics accuracy
# 正確性のみ評価

# コスト評価
/ai:prompt:evaluate prompt-123 --metrics cost --improve
# トークンコスト分析と改善提案

# 全メトリクス評価
/ai:prompt:evaluate prompt-123 --metrics all --compare baseline-v1
# 全指標でベースラインと比較

# 完全分析
/ai:prompt:evaluate prompt-123 --metrics all --compare baseline-v1 --improve
# 比較分析と改善提案
```

### `/ai:prompt:intent-diff` - 意図差分分析

#### 概要

ユーザーの意図と現在のプロンプト出力間のギャップを可視化・分析する革新的機能。意図差分ビューワーにより、期待する結果と実際の出力の乖離を定量的に測定し、具体的な改善ポイントを特定。自動修正機能と対話的調整により、意図とプロンプトの完全な整合を実現。

#### 使用エージェント（全30エージェント中の意図差分分析関連エージェント）

**意図差分分析コアチーム（12エージェント）**

- **prompt-engineering-specialist**
  (リーダー): 意図分析、差分特定、修正提案、プロンプト改善戦略
- **evaluation-engine**: 意図出力乖離度測定、精度スコアリング、客観的品質評価
- **ui-ux-designer**: 意図差分ビューワーUI設計、可視化インターフェース、インタラクションデザイン
- **data-analyst**: 差分パターン分析、改善トレンド追跡、統計的インサイト
- **user-research**: ユーザー意図分析、フィードバック収集、意図理解調査
- **llm-integration**: 修正後プロンプトテスト実行、マルチモデル検証、A/Bテスト
- **vector-database-specialist**: 意図ベクトル化、意図類似度分析、セマンティック差分検出
- **frontend-architect**: 差分ビューワー実装、リアルタイム比較表示、インタラクティブ可視化
- **workflow-orchestrator**: 差分分析ワークフロー、自動修正パイプライン、反復改善プロセス
- **domain-modeller**: ドメイン固有意図分析、専門分野意図モデリング、業務意図理解
- **backend-developer**: 差分分析エンジン実装、意図解析API、差分計算システム
- **observability-engineer**: 差分分析プロセス監視、精度メトリクス追跡、分析パフォーマンス測定

**意図理解・改善チーム（10エージェント）**

- **test-automation-engineer**: 差分テスト自動化、回帰差分検証、品質保証テスト
- **qa-coordinator**: 差分分析品質基準、意図理解精度基準、分析プロセス品質管理
- **compliance-officer**: 意図分析倫理基準、バイアス検出、公正性評価
- **performance-optimizer**: 差分分析最適化、処理速度改善、リアルタイム分析最適化
- **security-architect**: 意図データセキュリティ、プライバシー保護、機密意図処理
- **cost-optimization**: 差分分析コスト最適化、処理効率化、リソース使用量管理
- **technical-documentation**: 差分分析仕様書、意図モデル文書、使用ガイド
- **database-administrator**: 意図データ管理、差分履歴保存、分析結果永続化
- **api-designer**: 差分分析API設計、外部統合インターフェース、分析サービス公開
- **real-time-features-specialist**: リアルタイム差分分析、ライブ意図追跡、即座フィードバック

**意図差分統合・運用チーム（8エージェント）**

- **devops-coordinator**: 差分分析インフラ管理、CI/CD統合、自動化パイプライン
- **sre-agent**: 差分分析サービス可用性、システム監視、障害対応
- **edge-computing-specialist**: 分散差分分析、エッジでの意図処理、レイテンシ最適化
- **event-bus-manager**: 差分分析イベント管理、非同期処理、イベント駆動分析
- **system-architect**: 差分分析アーキテクチャ、システム統合設計、技術戦略
- **product-manager**: 意図差分機能戦略、ロードマップ策定、ビジネス価値最大化
- **data-migration-specialist**: 意図データ移行、レガシー分析統合、データ変換
- **version-control-specialist**: 差分分析バージョン管理、分析履歴追跡、変更管理

#### 全オプション一覧

| オプション    | 値      | 説明       |
| ------------- | ------- | ---------- |
| --visualize   | フラグ  | 可視化有効 |
| --auto-fix    | フラグ  | 自動修正   |
| --threshold   | 0.0-1.0 | 精度閾値   |
| --interactive | フラグ  | 対話モード |

#### 使用例と説明

```bash
# 基本形: プロンプトIDのみ
/ai:prompt:intent-diff prompt-123

# 可視化付き分析
/ai:prompt:intent-diff prompt-123 --visualize
# 差分のビジュアル表示

# 自動修正
/ai:prompt:intent-diff prompt-123 --auto-fix --threshold 0.8
# 80%精度での自動修正

# 対話的修正
/ai:prompt:intent-diff prompt-123 --visualize --interactive
# ユーザー確認付き修正

# 完全機能
/ai:prompt:intent-diff prompt-123 --visualize --auto-fix --threshold 0.9 --interactive
# すべての機能有効化
```

### `/ai:prompt:style-genome` - スタイル管理

#### 概要

ユーザー固有のプロンプトスタイルを抽出・分析し、個人の思考パターンを再現可能な形で保存する画期的機能。過去の履歴やフィードバックからスタイル・ゲノムを生成し、新しいプロンプトに一貫したスタイルを適用。チーム間でのスタイル転送により、組織全体での品質標準化も実現。

#### 使用エージェント（全30エージェント中のスタイル・ゲノム関連エージェント）

**スタイル・ゲノム抽出コアチーム（15エージェント）**

- **prompt-engineering-specialist**
  (リーダー): スタイル抽出、パターン分析、適用戦略、スタイル最適化
- **data-analyst**: 履歴データ分析、スタイル特徴量抽出、統計的パターン認識、トレンド分析
- **user-research**: ユーザーフィードバック分析、スタイル嗜好理解、個人化研究
- **vector-database-specialist**: スタイルベクトル生成、類似スタイル検索、スタイル埋め込み管理
- **llm-integration**: スタイル適用実行、マルチモデル対応、スタイル転送実装
- **backend-developer**: スタイル・ゲノム保存・管理システム実装、スタイルAPI開発
- **domain-modeller**: ドメイン固有スタイル分析、専門分野スタイル特徴、業界標準スタイル
- **evaluation-engine**: スタイル品質評価、スタイル一貫性測定、効果測定
- **workflow-orchestrator**: スタイル抽出ワークフロー、自動スタイル適用、バッチ処理
- **frontend-architect**: スタイル管理UI実装、スタイル適用インターフェース、プレビュー機能
- **ui-ux-designer**: スタイル可視化デザイン、ユーザースタイル体験、インタラクション設計
- **database-administrator**: スタイルデータ管理、履歴保存、スタイルバージョン管理
- **performance-optimizer**: スタイル処理最適化、高速スタイル検索、リアルタイム適用
- **security-architect**: スタイルデータセキュリティ、プライバシー保護、アクセス制御
- **observability-engineer**: スタイル使用状況監視、適用効果追跡、パフォーマンス分析

**スタイル品質・分析チーム（8エージェント）**

- **qa-coordinator**: スタイル品質基準、スタイル適用品質保証、一貫性検証
- **test-automation-engineer**: スタイルテスト自動化、回帰スタイルテスト、品質保証
- **compliance-officer**: スタイル倫理基準、バイアス検出、公平性確保
- **technical-documentation**: スタイル仕様書、使用ガイド、スタイルカタログ
- **api-designer**: スタイルAPI設計、外部統合、スタイルサービスインターフェース
- **real-time-features-specialist**: リアルタイムスタイル適用、ライブスタイル変更、即座反映
- **cost-optimization**: スタイル処理コスト分析、効率化、リソース最適化
- **edge-computing-specialist**: 分散スタイル処理、エッジでのスタイル適用、レイテンシ最適化

**スタイル統合・運用チーム（7エージェント）**

- **devops-coordinator**: スタイルインフラ管理、CI/CD統合、デプロイメント自動化
- **sre-agent**: スタイルサービス可用性、システム監視、障害対応
- **event-bus-manager**: スタイルイベント管理、非同期処理、イベント駆動スタイル更新
- **system-architect**: スタイルアーキテクチャ設計、システム統合、技術戦略
- **product-manager**: スタイル機能戦略、ロードマップ、ビジネス価値最大化
- **data-migration-specialist**: スタイルデータ移行、レガシー統合、データ変換
- **version-control-specialist**: スタイルバージョン管理、変更履歴、スタイル進化追跡

#### 全オプション一覧

| オプション | 値               | 説明         |
| ---------- | ---------------- | ------------ |
| --analyze  | history/feedback | 分析対象     |
| --extract  | フラグ           | スタイル抽出 |
| --apply    | prompt-id        | 適用先       |
| --transfer | フラグ           | スタイル転送 |

#### 使用例と説明

```bash
# 履歴分析
/ai:prompt:style-genome user-123 --analyze history
# 過去プロンプトからスタイル分析

# フィードバック分析
/ai:prompt:style-genome user-123 --analyze feedback --extract
# フィードバックからスタイル抽出

# スタイル適用
/ai:prompt:style-genome user-123 --apply new-prompt
# 特定プロンプトへスタイル適用

# スタイル転送
/ai:prompt:style-genome user-123 --apply target-prompt --transfer
# 別ユーザーへスタイル転送

# 完全処理
/ai:prompt:style-genome user-123 --analyze history --extract --apply new-prompt --transfer
# 分析→抽出→適用→転送
```

---

## **5. 開発コマンド (4 コマンド)**

### `/ai:development:implement` - 機能実装

#### 概要

DDD原則に基づく高品質な機能実装を実行する。TDD（テスト駆動開発）によるテスト品質確保、リアルタイム機能対応、並列開発による効率化を実現。カバレッジ目標設定により品質基準を明確化し、保守性と拡張性を兼ね備えた堅牢なコードを実装。

#### 使用エージェント（全30エージェント中の機能実装関連エージェント）

**機能実装コアチーム（18エージェント）**

- **backend-developer**
  (リーダー): ドメインロジック実装、API開発、アーキテクチャ準拠、ビジネスルール実装
- **frontend-architect**: フロントエンド実装、UI/UX統合、ユーザーインターフェース構築、モダンフレームワーク実装
- **test-automation-engineer**:
  TDD実装、自動テスト設計、品質保証、テスト駆動開発プロセス
- **real-time-features-specialist**:
  WebSocket実装、リアルタイム機能、協調編集対応、同期メカニズム
- **domain-modeller**: ドメインロジック整合性確認、ビジネスルール実装、ドメイン知識統合
- **api-designer**:
  API仕様実装、エンドポイント設計、インターフェース統合、RESTful/GraphQL実装
- **database-administrator**: データアクセス層実装、永続化戦略、クエリ最適化、データ整合性
- **ui-ux-designer**: ユーザーインターフェース設計、デザインシステム実装、ユーザビリティ最適化
- **prompt-engineering-specialist**:
  AI機能実装、プロンプト処理ロジック、LLM統合実装
- **llm-integration**: LLMプロバイダー統合、マルチモデル対応、コスト最適化実装
- **vector-database-specialist**: ベクトル検索実装、埋め込み処理、類似度計算ロジック
- **workflow-orchestrator**: ワークフロー実装、プロセス自動化、LangGraph統合実装
- **event-bus-manager**: イベント駆動実装、非同期処理、メッセージング統合
- **evaluation-engine**: 評価システム実装、品質メトリクス、自動評価ロジック
- **security-architect**: セキュリティ実装、認証認可、データ保護機能
- **performance-optimizer**: パフォーマンス最適化実装、ボトルネック解消、効率化
- **observability-engineer**: 監視機能実装、ログ出力、メトリクス収集、トレーシング統合
- **devops-coordinator**: CI/CD統合、デプロイメント自動化、インフラ連携

**品質保証・テストチーム（7エージェント）**

- **qa-coordinator**: 品質基準実装、テスト戦略統括、品質ゲート設定
- **compliance-officer**: コンプライアンス実装、規制対応機能、監査ログ実装
- **sre-agent**: 可用性実装、障害対応機能、SLO管理実装
- **cost-optimization**: コスト監視実装、リソース最適化、使用量追跡機能
- **data-analyst**: 分析機能実装、レポート生成、データ処理ロジック
- **technical-documentation**: 仕様書実装、自動文書生成、コード文書化
- **edge-computing-specialist**: エッジ機能実装、分散処理、CDN統合

**統合・運用支援チーム（5エージェント）**

- **system-architect**: アーキテクチャ整合性確認、技術判断、設計レビュー
- **product-manager**: 機能要件確認、ビジネス価値検証、優先順位調整
- **user-research**: ユーザビリティ実装、フィードバック統合、使用性向上
- **data-migration-specialist**: データ移行実装、レガシー統合、データ変換処理
- **version-control-specialist**: バージョン管理実装、ブランチ戦略、リリース管理

#### 全オプション一覧

| オプション | 値     | 説明             |
| ---------- | ------ | ---------------- |
| --tdd      | フラグ | TDD 有効化       |
| --realtime | フラグ | リアルタイム機能 |
| --coverage | 0-100  | カバレッジ目標   |
| --parallel | フラグ | 並列実行         |

#### 使用例と説明

```bash
# 基本形: 機能名のみ
/ai:development:implement login-feature

# TDD実装
/ai:development:implement payment --tdd --coverage 80
# 80%カバレッジでTDD実装

# リアルタイム機能
/ai:development:implement chat --realtime --tdd
# WebSocket対応チャット機能

# 並列開発
/ai:development:implement multi-feature --tdd --coverage 90 --parallel
# 90%カバレッジ、並列実行

# フル機能
/ai:development:implement complex-feature --tdd --realtime --coverage 95 --parallel
# すべてのオプション有効
```

### `/ai:development:workflow` - ワークフロー実装

#### 概要

LangGraphを活用した複雑なプロンプトチェーンとワークフローを設計・実装する。ビジュアルエディタによる直感的なフロー作成、条件分岐・並列実行・順次処理の柔軟な組み合わせを実現。ノーコード/ローコードアプローチで非技術者でも高度なワークフローを構築可能。

#### 使用エージェント（全30エージェント中のワークフロー実装関連エージェント）

**ワークフロー設計・実装コアチーム（15エージェント）**

- **workflow-orchestrator** (リーダー):
  LangGraphワークフロー設計、実行エンジン統合、プロセス自動化統括
- **frontend-architect**: ビジュアルエディタ実装、ドラッグ&ドロップインターフェース、リアルタイムプレビュー
- **prompt-engineering-specialist**: プロンプトチェーン設計、ステップ間連携、AI ワークフロー最適化
- **event-bus-manager**: ワークフローイベント管理、状態遷移制御、非同期処理調整
- **backend-developer**: ワークフローエンジン実装、実行環境構築、API統合
- **ui-ux-designer**: ワークフローエディタUX設計、操作性最適化、ユーザビリティ向上
- **llm-integration**: LLMワークフロー統合、マルチモデル実行、プロバイダー切替
- **evaluation-engine**: ワークフロー評価システム、品質測定、パフォーマンス分析
- **vector-database-specialist**: ワークフローテンプレート検索、類似フロー発見、ナレッジベース
- **real-time-features-specialist**: リアルタイムワークフロー実行、協調編集、ライブ更新
- **database-administrator**: ワークフローデータ管理、実行履歴保存、状態永続化
- **api-designer**: ワークフローAPI設計、外部システム統合、サービス連携
- **security-architect**: ワークフローセキュリティ、実行権限管理、データ保護
- **performance-optimizer**: ワークフロー実行最適化、並列処理、リソース効率化
- **observability-engineer**: ワークフロー監視、実行追跡、パフォーマンス計測

**ワークフロー品質・自動化チーム（8エージェント）**

- **test-automation-engineer**: ワークフローテスト自動化、実行検証、品質保証
- **qa-coordinator**: ワークフロー品質基準、テスト戦略、品質ゲート設定
- **domain-modeller**: ビジネスプロセスモデリング、ドメインワークフロー設計、業務ルール統合
- **devops-coordinator**: ワークフローCI/CD統合、デプロイメント自動化、運用管理
- **compliance-officer**: ワークフローコンプライアンス、規制対応、監査証跡
- **cost-optimization**: ワークフロー実行コスト分析、リソース最適化、効率化施策
- **technical-documentation**: ワークフロー仕様書、使用ガイド、テンプレート文書
- **sre-agent**: ワークフローサービス可用性、障害対応、SLO管理

**ワークフロー統合・運用チーム（7エージェント）**

- **system-architect**: ワークフローアーキテクチャ設計、システム統合戦略、技術判断
- **product-manager**: ワークフロー機能戦略、ロードマップ、ビジネス価値最大化
- **user-research**: ワークフローユーザビリティ調査、使用パターン分析、改善提案
- **data-analyst**: ワークフロー利用分析、効果測定、改善インサイト
- **data-migration-specialist**: レガシーワークフロー移行、プロセス変換、統合支援
- **edge-computing-specialist**: 分散ワークフロー実行、エッジでの処理、レイテンシ最適化
- **version-control-specialist**: ワークフローバージョン管理、変更履歴、リリース管理

#### 全オプション一覧

| オプション      | 値                              | 説明               |
| --------------- | ------------------------------- | ------------------ |
| --langgraph     | フラグ                          | LangGraph 使用     |
| --visual-editor | フラグ                          | ビジュアルエディタ |
| --type          | sequential/parallel/conditional | 実行タイプ         |

#### 使用例と説明

```bash
# 基本形: ワークフロー名のみ
/ai:development:workflow approval-flow

# LangGraph実装
/ai:development:workflow data-pipeline --langgraph
# LangGraphベースのパイプライン

# ビジュアルエディタ付き
/ai:development:workflow user-journey --visual-editor
# ドラッグ&ドロップエディタ

# 実行タイプ指定
/ai:development:workflow batch-process --type parallel
# 並列処理ワークフロー

# 条件分岐フロー
/ai:development:workflow decision-tree --type conditional --visual-editor
# 条件分岐付きビジュアルフロー

# 完全機能
/ai:development:workflow complex-flow --langgraph --visual-editor --type conditional
# すべての機能有効化
```

### `/ai:development:realtime` - リアルタイム機能

#### 概要

WebSocketとCRDT/OTアルゴリズムを活用した高性能リアルタイム機能を実装する。協調プロンプト編集、リアルタイム評価結果配信、マルチユーザー同期を実現。プレゼンス機能によるユーザー状態可視化とスケーラブルなリアルタイムインフラで、Googleドキュメント並みの協調編集体験を提供。

#### 使用エージェント（全30エージェント中のリアルタイム機能関連エージェント）

**リアルタイム機能コアチーム（15エージェント）**

- **real-time-features-specialist** (リーダー):
  WebSocket実装、同期アルゴリズム設計、協調編集エンジン、CRDT/OT統合
- **frontend-architect**: リアルタイムUI実装、カーソル共有、ライブ更新インターフェース、クライアント同期
- **backend-developer**:
  WebSocketサーバー実装、コンフリクト解決、状態管理、セッション管理
- **event-bus-manager**: リアルタイムイベント配信、メッセージング最適化、イベントストリーミング
- **performance-optimizer**: レイテンシ最適化、スループット改善、ネットワーク効率化、帯域幅最適化
- **observability-engineer**: リアルタイム監視、接続状態追跡、パフォーマンス分析、メトリクス収集
- **ui-ux-designer**: リアルタイムUX設計、プレゼンス表示、協調編集体験設計
- **database-administrator**: リアルタイムデータ同期、状態永続化、データ一貫性管理
- **security-architect**:
  WebSocketセキュリティ、認証認可、通信暗号化、アクセス制御
- **prompt-engineering-specialist**: リアルタイムプロンプト編集、協調プロンプト作成、同時編集対応
- **workflow-orchestrator**: リアルタイムワークフロー、ライブプロセス実行、動的フロー更新
- **vector-database-specialist**: リアルタイムベクトル検索、ライブ埋め込み更新、即座類似度計算
- **api-designer**: リアルタイムAPI設計、WebSocket プロトコル、ストリーミングインターフェース
- **edge-computing-specialist**: エッジでのリアルタイム処理、分散同期、グローバル協調編集
- **evaluation-engine**: リアルタイム評価、ライブ品質測定、即座フィードバック

**リアルタイム品質・最適化チーム（8エージェント）**

- **test-automation-engineer**: リアルタイムテスト、同期テスト、協調編集テスト自動化
- **qa-coordinator**: リアルタイム品質基準、同期品質保証、コンフリクト解決テスト
- **devops-coordinator**: リアルタイムインフラ管理、WebSocketスケーリング、負荷分散
- **sre-agent**: リアルタイムサービス可用性、接続監視、障害対応、サービス復旧
- **cost-optimization**: リアルタイム処理コスト、接続コスト最適化、リソース効率化
- **compliance-officer**: リアルタイムデータ保護、プライバシー、規制対応
- **technical-documentation**: リアルタイム仕様書、同期プロトコル文書、実装ガイド
- **data-analyst**: リアルタイム利用分析、協調パターン分析、使用統計

**リアルタイム統合・運用チーム（7エージェント）**

- **system-architect**: リアルタイムアーキテクチャ設計、分散システム設計、技術戦略
- **product-manager**: リアルタイム機能戦略、協調編集価値、ロードマップ策定
- **user-research**: リアルタイムUX調査、協調編集ユーザビリティ、フィードバック収集
- **llm-integration**: リアルタイムLLM処理、ライブAI応答、マルチモデル同時実行
- **data-migration-specialist**: リアルタイムデータ移行、ライブマイグレーション、無停止更新
- **domain-modeller**: リアルタイムドメインモデル、協調ビジネスプロセス、同期ドメインロジック
- **version-control-specialist**: リアルタイムバージョン管理、ライブ変更追跡、協調コード編集

#### 全オプション一覧

| オプション  | 値     | 説明             |
| ----------- | ------ | ---------------- |
| --websocket | フラグ | WebSocket 使用   |
| --crdt/--ot | フラグ | 同期アルゴリズム |
| --scale     | フラグ | スケーリング対応 |
| --presence  | フラグ | プレゼンス機能   |

#### 使用例と説明

```bash
# 基本形: 機能名のみ
/ai:development:realtime live-updates

# WebSocket実装
/ai:development:realtime notifications --websocket
# WebSocketベース通知

# CRDT同期
/ai:development:realtime collaborative-doc --crdt --presence
# CRDT協調編集、カーソル共有

# OT同期
/ai:development:realtime text-editor --ot --scale
# Operational Transform、スケーラブル

# 完全機能
/ai:development:realtime collaboration --websocket --crdt --scale --presence
# すべての機能有効化
```

### `/ai:development:git` - バージョン管理

#### 概要

Git操作とバージョン管理戦略を自動化・最適化する。GitFlow、GitHub
Flow、Trunk-basedなど主要ブランチ戦略に対応し、自動マージ・セマンティックバージョニング・Gitフックによる品質ゲートを統合。コンフリクト解決支援とモノレポ管理により、大規模開発チームでの効率的なソースコード管理を実現。

#### 使用エージェント（全30エージェント中のバージョン管理関連エージェント）

**バージョン管理コアチーム（12エージェント）**

- **version-control-specialist** (リーダー):
  Git戦略設計、ブランチ管理、コンフリクト解決、リリース管理統括
- **devops-coordinator**:
  CI/CD統合、自動デプロイ、パイプライン設定、インフラ連携
- **test-automation-engineer**:
  pre-commitフック、テスト自動化、マージ条件設定、品質ゲート実装
- **qa-coordinator**: 品質ゲート設定、レビュープロセス、承認フロー、品質基準管理
- **technical-documentation**: ドキュメント同期、変更履歴管理、リリースノート、仕様書バージョニング
- **backend-developer**: フィーチャーブランチ開発、コード統合、実装調整、マージ作業
- **frontend-architect**: フロントエンドブランチ戦略、UI変更管理、デプロイメント調整
- **security-architect**: セキュリティスキャン統合、脆弱性チェック、署名付きコミット、アクセス制御
- **system-architect**: アーキテクチャ変更追跡、技術決定記録、設計変更管理
- **observability-engineer**: バージョン管理メトリクス、開発プロセス監視、効率性分析
- **performance-optimizer**: ブランチ戦略最適化、マージ効率化、リポジトリパフォーマンス
- **compliance-officer**: 変更管理コンプライアンス、監査証跡、規制対応記録

**開発プロセス統合チーム（10エージェント）**

- **product-manager**: リリース計画、フィーチャー優先順位、バージョン戦略策定
- **domain-modeller**: ドメインモデル変更管理、ビジネスロジック進化、互換性管理
- **api-designer**: API変更管理、互換性保証、バージョニング戦略
- **database-administrator**: データベースマイグレーション、スキーマ変更管理、データバージョン管理
- **prompt-engineering-specialist**: プロンプトバージョン管理、テンプレート進化、品質追跡
- **llm-integration**: LLM統合変更管理、プロバイダー更新、互換性確保
- **workflow-orchestrator**: ワークフローバージョン管理、プロセス変更追跡、自動化更新
- **evaluation-engine**: 評価基準変更管理、メトリクス進化、品質履歴追跡
- **vector-database-specialist**: ベクトルモデル変更管理、埋め込み互換性、検索精度追跡
- **real-time-features-specialist**: リアルタイム機能変更管理、協調編集履歴、同期プロトコル更新

**運用・最適化チーム（8エージェント）**

- **sre-agent**: リリース可用性管理、ロールバック戦略、障害対応プロセス
- **cost-optimization**: 開発プロセスコスト分析、リソース効率化、ツール最適化
- **user-research**: ユーザーフィードバック統合、機能要求追跡、満足度測定
- **data-analyst**: 開発メトリクス分析、生産性測定、品質インサイト
- **ui-ux-designer**: デザインシステム変更管理、UIバージョン管理、デザイン履歴
- **event-bus-manager**: イベントスキーマ変更管理、メッセージング互換性、プロトコル進化
- **edge-computing-specialist**: エッジデプロイメント管理、分散バージョン管理、グローバル同期
- **data-migration-specialist**: データ移行バージョン管理、スキーマ進化、互換性保証

#### 全オプション一覧

| オプション         | 値                                           | 説明                         |
| ------------------ | -------------------------------------------- | ---------------------------- |
| operation          | init/merge/release/resolve-conflict/monorepo | Git 操作                     |
| --strategy         | gitflow/github-flow/trunk-based              | ブランチ戦略                 |
| --auto-merge       | フラグ                                       | 自動マージ有効化             |
| --semantic-version | フラグ                                       | セマンティックバージョニング |
| --hooks            | フラグ                                       | Git フック設定               |

#### 使用例と説明

```bash
# 基本形: 操作のみ指定
/ai:development:git status
# 現在のリポジトリ状態確認

# ブランチ戦略実装
/ai:development:git init --strategy gitflow --hooks
# Git Flow戦略の完全セットアップ
# develop, release, hotfixブランチ作成
# 保護ルールとフックの自動設定
# CODEOWNERSファイル生成
# .gitignore最適化
# コミットテンプレート設定

# GitHub Flow戦略
/ai:development:git init --strategy github-flow --hooks
# シンプルなfeatureブランチワークフロー
# mainブランチ保護
# プルリクエストテンプレート作成
# 自動レビュー設定

# Trunk-Based Development
/ai:development:git init --strategy trunk-based
# 単一mainブランチ戦略
# 短命なfeatureブランチ
# 機能フラグ統合準備

# 自動マージとCI/CD連携
/ai:development:git merge feature-branch --auto-merge --strategy github-flow
# テスト成功後の自動マージ
# コンフリクト自動解決試行
# CI/CDパイプライントリガー
# Slackへの完了通知
# レビュー承認チェック

# セマンティックリリース
/ai:development:git release v1.2.0 --semantic-version --hooks
# バージョン番号の自動計算
# CHANGELOG自動生成（conventional-changelog）
# リリースノート作成
# タグ付けとGitHubリリース作成
# NPM/PyPI公開準備
# リリースブランチ作成
# ホットフィックス準備

# コンフリクト解決支援
/ai:development:git resolve-conflict feature-branch --strategy rebase
# インテリジェントコンフリクト分析
# 3-way マージ戦略適用
# テスト実行による検証
# コンフリクト解決レポート
# マージコミット最適化

# モノレポ管理
/ai:development:git monorepo --strategy trunk-based
# モノレポ用ブランチ戦略
# パッケージ別バージョニング
# 依存関係グラフ生成
# 選択的CI/CD実行
# Lerna/Nx統合設定

# プルリクエスト管理
/ai:development:git pr feature-branch --auto-merge
# PR自動作成
# レビュアー自動割当
# ラベル自動付与
# マージ条件設定
# ドラフトPR管理

# コミット管理
/ai:development:git commit --hooks --semantic-version
# Conventional Commits強制
# コミットメッセージ検証
# チケット番号自動追加
# 署名付きコミット
# pre-commitフック実行

# ブランチクリーンアップ
/ai:development:git cleanup --strategy gitflow
# マージ済みブランチ削除
# 古いfeatureブランチ警告
# リモートブランチ同期
# ブランチ履歴整理

# Git履歴管理
/ai:development:git history --strategy rebase
# コミット履歴のクリーンアップ
# インタラクティブリベース
# コミットのsquash/fixup
# 履歴の線形化

# タグ管理
/ai:development:git tag v1.0.0 --semantic-version
# アノテーション付きタグ作成
# GPG署名
# タグのプッシュ
# リリースとの関連付け

# サブモジュール管理
/ai:development:git submodule add https://github.com/org/repo
# サブモジュール追加
# 依存関係管理
# 更新戦略設定
# 再帰的クローン設定

# Git LFS設定
/ai:development:git lfs --strategy gitflow
# Large File Storage設定
# バイナリファイル管理
# トラッキングルール設定
# ストレージ最適化

# バックアップとリカバリ
/ai:development:git backup --strategy gitflow
# リポジトリバックアップ
# ブランチアーカイブ
# 災害復旧計画
# ミラーリング設定
```

---

## **6. 運用コマンド (3 コマンド)**

### `/ai:operations:deploy` - デプロイメント

#### 概要

Cloudflareエコシステムを活用した高度なデプロイメント戦略を実行する。カナリア、ブルーグリーン、ローリングデプロイなど多様な戦略に対応し、自動ロールバック機能で安全性を確保。エッジコンピューティングによるグローバル展開とゼロダウンタイムデプロイにより、堅牢で効率的な本番運用を実現。

#### 使用エージェント（全30エージェント中のデプロイメント関連エージェント）

**デプロイメント統括チーム（15エージェント）**

- **devops-coordinator**
  (リーダー): デプロイメント戦略策定、CI/CDパイプライン管理、インフラ自動化統括
- **edge-computing-specialist**: Cloudflare
  Workers設定、エッジデプロイ最適化、CDN統合、グローバル配信
- **sre-agent**: 可用性監視、インシデント対応、SLO管理、ロールバック判断、サービス信頼性確保
- **observability-engineer**: デプロイ監視、メトリクス収集、異常検知、分散トレーシング
- **security-architect**: セキュリティスキャン、脆弱性チェック、デプロイ承認、ゼロトラスト実装
- **performance-optimizer**: パフォーマンス監視、ボトルネック検出、最適化提案、負荷テスト
- **system-architect**: デプロイアーキテクチャ設計、技術判断、インフラ整合性確認
- **backend-developer**: バックエンドデプロイ、API更新、サービス統合、データベース連携
- **frontend-architect**: フロントエンドデプロイ、静的サイト生成、CDN配信、クライアント更新
- **database-administrator**: データベースマイグレーション、スキーマ更新、データ整合性確保
- **test-automation-engineer**: デプロイテスト、煙テスト、回帰テスト、品質ゲート
- **qa-coordinator**: デプロイ品質基準、承認プロセス、品質保証、リリース判定
- **version-control-specialist**: リリースブランチ管理、タグ付け、バージョン管理、変更追跡
- **cost-optimization**: デプロイコスト監視、リソース最適化、インフラ費用管理
- **compliance-officer**: デプロイコンプライアンス、規制対応、監査証跡、承認記録

**専門機能デプロイチーム（8エージェント）**

- **prompt-engineering-specialist**: プロンプトテンプレートデプロイ、AI機能更新、LLM統合配信
- **llm-integration**: LLMプロバイダー更新、モデル切替、API統合デプロイ
- **workflow-orchestrator**: ワークフローデプロイ、プロセス更新、LangGraph配信
- **vector-database-specialist**: ベクトルデータベース更新、インデックス再構築、検索機能デプロイ
- **evaluation-engine**: 評価システム更新、メトリクス配信、品質測定機能デプロイ
- **real-time-features-specialist**:
  WebSocket更新、リアルタイム機能デプロイ、協調編集配信
- **event-bus-manager**: イベントシステム更新、メッセージング配信、非同期処理デプロイ
- **api-designer**: API更新、エンドポイント変更、インターフェース配信

**統合・運用支援チーム（7エージェント）**

- **technical-documentation**: デプロイ文書更新、リリースノート、運用手順書
- **product-manager**: リリース戦略、機能ロードマップ、ビジネス価値確認
- **user-research**: ユーザー影響分析、フィードバック収集、満足度測定
- **data-analyst**: デプロイ効果分析、使用統計、パフォーマンス分析
- **ui-ux-designer**: デザインシステム更新、UI変更配信、ユーザビリティ確認
- **domain-modeller**: ドメインモデル更新、ビジネスロジック配信、互換性確保
- **data-migration-specialist**: データ移行実行、ゼロダウンタイム更新、データ整合性確保

#### 全オプション一覧

| オプション | 値                        | 説明             |
| ---------- | ------------------------- | ---------------- |
| env        | dev/staging/prod          | 環境指定         |
| --strategy | canary/blue-green/rolling | デプロイ戦略     |
| --rollback | auto/manual               | ロールバック設定 |
| --edge     | フラグ                    | エッジデプロイ   |

#### 使用例と説明

```bash
# 開発環境デプロイ
/ai:operations:deploy dev
# シンプルなdev環境デプロイ

# カナリアデプロイ
/ai:operations:deploy staging --strategy canary
# 段階的リリース（5%→25%→50%→100%）

# ブルーグリーンデプロイ
/ai:operations:deploy prod --strategy blue-green --rollback auto
# 即座切替、自動ロールバック

# ローリングデプロイ
/ai:operations:deploy staging --strategy rolling
# 順次更新

# エッジデプロイ
/ai:operations:deploy prod --edge --strategy canary
# Cloudflare Workers展開

# 本番フルオプション
/ai:operations:deploy prod --strategy canary --rollback auto --edge
# 全機能有効の本番デプロイ
```

### `/ai:operations:incident` - インシデント管理

#### 概要

インシデント発生時の迅速な対応と体系的な問題解決を実行する。重要度に応じた自動エスカレーション、根本原因分析（RCA）による再発防止、ポストモーテムによる組織学習を統合。インシデント対応チームの自動招集と知識蓄積により、サービス可用性と信頼性を継続的に向上。

#### 使用エージェント（全30エージェント中のインシデント対応関連エージェント）

**インシデント対応統括チーム（18エージェント）**

- **sre-agent**
  (総合リーダー): インシデント対応統括、SLO管理、可用性確保、対応手順実行、復旧戦略決定
- **observability-engineer**
  (検知・分析リーダー): 異常検知、ログ分析、メトリクス監視、原因特定支援、システム状態可視化
- **security-architect**: セキュリティインシデント対応、脅威分析、緊急対策実施、攻撃パターン識別
- **devops-coordinator**: 緊急デプロイ、ロールバック実行、インフラ復旧、CI/CDパイプライン緊急対応
- **root-cause-analyst**: 根本原因分析（RCA）統括、証拠収集、仮説検証、体系的問題調査
- **performance-engineer**: パフォーマンス問題特定、ボトルネック解消、リソース最適化、負荷分析
- **backend-developer**: アプリケーション層問題対応、コード修正、緊急パッチ適用、API復旧
- **database-administrator**: データベース障害対応、データ整合性確認、クエリ最適化、復旧作業
- **edge-computing-specialist**:
  CDN・エッジ問題対応、Cloudflare緊急設定、分散障害対応
- **frontend-architect**: フロントエンド障害対応、UI/UX問題解決、クライアント側エラー対応
- **api-designer**: API障害対応、エンドポイント復旧、インターフェース問題解決
- **network-specialist**: ネットワーク問題診断、接続障害対応、トラフィック分析
- **compliance-officer**: コンプライアンス影響評価、規制対応、監査証跡管理
- **cost-optimization**: インシデント対応コスト管理、リソース使用量監視、緊急時予算承認
- **vector-database-specialist**: ベクトル検索障害対応、埋め込みデータ整合性確認
- **data-migration-specialist**: データ復旧支援、バックアップ復旧、データ整合性確保
- **version-control-specialist**: 緊急時Git操作、コード復旧、バージョン管理支援
- **workflow-orchestrator**: インシデント対応ワークフロー管理、自動化実行、手順統制

**ビジネス・コミュニケーション統括チーム（6エージェント）**

- **product-manager**: ビジネス影響評価、ステークホルダー通知、優先順位判断、顧客対応戦略
- **qa-coordinator**: 品質影響評価、テスト戦略調整、障害範囲特定
- **technical-documentation**: インシデント記録、対応手順書更新、ナレッジ蓄積、ポストモーテム作成
- **user-research**: ユーザー影響分析、フィードバック収集、UX影響評価
- **requirements-analyst**: 要件への影響分析、機能停止範囲特定、復旧優先順位策定
- **socratic-mentor**: インシデント対応学習支援、チーム教育、知識共有促進

**システム・インフラ専門チーム（6エージェント）**

- **system-architect**: システム全体アーキテクチャ評価、設計問題特定、構造的対策検討
- **domain-modeller**: ドメイン影響範囲分析、ビジネスロジック問題特定
- **event-bus-manager**: イベント駆動システム障害対応、メッセージング問題解決
- **real-time-features-specialist**: リアルタイム機能障害対応、WebSocket問題解決
- **test-automation-engineer**: 緊急テスト実行、回帰テスト、品質確認
- **data-analyst**: データ分析による影響評価、メトリクス解析、傾向分析

#### 全オプション一覧

| オプション   | 値                       | 説明             |
| ------------ | ------------------------ | ---------------- |
| severity     | critical/high/medium/low | 重要度           |
| --escalate   | フラグ                   | エスカレーション |
| --rca        | フラグ                   | 根本原因分析     |
| --postmortem | フラグ                   | ポストモーテム   |

#### 使用例と説明

```bash
# 低重要度インシデント
/ai:operations:incident low
# 記録のみ

# 中重要度インシデント
/ai:operations:incident medium --rca
# 根本原因分析実施

# 高重要度インシデント
/ai:operations:incident high --escalate --rca
# エスカレーション+RCA

# クリティカルインシデント
/ai:operations:incident critical --escalate --rca --postmortem
# 全対応実施
```

### `/ai:operations:monitor` - 監視設定

#### 概要

観測可能性の3つの柱（メトリクス、トレース、ログ）を統合した包括的監視体制を構築する。システム全体からエンドポイント単位まで柔軟な監視スコープ設定、アラート自動化による早期問題検知、分散トレーシングによる複雑なシステム動作の可視化を実現し、プロアクティブな運用を支援。

#### 使用エージェント（全30エージェント中の監視・観測性関連エージェント）

**監視・観測性統括チーム（17エージェント）**

- **observability-engineer** (総合リーダー): 監視アーキテクチャ設計、3
  Pillars統合、ダッシュボード構築、可視化戦略策定
- **sre-agent** (信頼性リーダー):
  SLI/SLO設定、アラート閾値調整、運用メトリクス定義、可用性目標管理
- **performance-engineer**: パフォーマンス監視、ボトルネック検出、最適化メトリクス、負荷テスト統合
- **devops-coordinator**: 監視インフラ構築、ツール統合、自動化設定、CI/CD監視組み込み
- **security-architect**: セキュリティ監視、異常行動検知、脅威インテリジェンス、侵入検知システム
- **backend-developer**: アプリケーション監視、ログ出力最適化、トレーシング実装、メトリクス埋め込み
- **database-administrator**: データベース監視、クエリパフォーマンス分析、接続プール監視
- **edge-computing-specialist**: エッジ監視、CDN分析、Cloudflare
  Analytics統合、グローバル監視
- **frontend-architect**: フロントエンド監視、RUM実装、Core Web
  Vitals追跡、ユーザー体験監視
- **api-designer**:
  API監視、エンドポイント分析、レスポンス時間追跡、サービス間通信監視
- **real-time-features-specialist**: リアルタイム監視、WebSocket監視、同期状態追跡
- **vector-database-specialist**: ベクトル検索監視、埋め込み品質メトリクス、類似度検索パフォーマンス
- **event-bus-manager**: イベント監視、メッセージング遅延追跡、イベントストリーム分析
- **cost-optimization**: コスト監視、リソース使用量追跡、予算アラート、効率性メトリクス
- **compliance-officer**: コンプライアンス監視、監査ログ、規制要件追跡
- **data-migration-specialist**: データ品質監視、移行進捗追跡、整合性チェック
- **workflow-orchestrator**: ワークフロー監視、プロセス進捗追跡、自動化ステータス

**品質・分析専門チーム（7エージェント）**

- **qa-coordinator**: 品質メトリクス監視、テスト結果追跡、品質ゲート監視
- **test-automation-engineer**: テスト監視、自動テスト結果追跡、カバレッジ監視
- **data-analyst**: データ分析による監視洞察、傾向分析、予測メトリクス
- **user-research**: ユーザー行動監視、使用パターン分析、満足度メトリクス
- **technical-documentation**: 監視ドキュメント管理、アラートランブック、監視ベストプラクティス
- **version-control-specialist**: コード変更監視、デプロイ影響追跡、リリース監視
- **requirements-analyst**: 要件充足監視、機能使用率追跡、ビジネスメトリクス

**アーキテクチャ・設計統括チーム（6エージェント）**

- **system-architect**: システム全体監視戦略、アーキテクチャメトリクス、依存関係監視
- **domain-modeller**: ドメインメトリクス監視、ビジネスロジック監視、集約監視
- **product-manager**: プロダクトメトリクス監視、KPI追跡、ビジネス影響分析
- **prompt-engineering-specialist**: プロンプト品質監視、AI応答監視、LLM使用量追跡
- **llm-integration**: LLM統合監視、API使用量追跡、モデル性能監視
- **evaluation-engine**: 評価メトリクス監視、AI品質追跡、継続的評価

#### 全オプション一覧

| オプション | 値                      | 説明           |
| ---------- | ----------------------- | -------------- |
| scope      | system/service/endpoint | 監視範囲       |
| --metrics  | フラグ                  | メトリクス収集 |
| --traces   | フラグ                  | トレース収集   |
| --logs     | フラグ                  | ログ収集       |
| --alerts   | フラグ                  | アラート設定   |

#### 使用例と説明

```bash
# システム全体監視
/ai:operations:monitor system
# 基本監視

# メトリクス監視
/ai:operations:monitor service --metrics
# サービスメトリクス収集

# トレーシング
/ai:operations:monitor endpoint --traces
# 分散トレース

# フル監視
/ai:operations:monitor system --metrics --traces --logs --alerts
# 3 Pillars + アラート
```

---

## **7. 品質コマンド (3 コマンド)**

### `/ai:quality:analyze` - 品質分析

#### 概要

多次元品質分析により、コード品質・セキュリティ・パフォーマンスを包括的に評価する。静的解析・動的解析・依存関係分析を組み合わせ、潜在的問題の早期発見と自動修正提案を実行。技術的負債の定量化と改善ロードマップ策定により、持続可能な開発品質を実現。

#### 使用エージェント（全30エージェント中の品質分析関連エージェント）

**品質分析統括チーム（20エージェント）**

- **qa-coordinator**
  (総合リーダー): 品質戦略統括、分析計画策定、改善提案調整、品質ゲート定義
- **test-automation-engineer**
  (テストリーダー): 自動テスト分析、カバレッジ評価、品質メトリクス、テスト戦略設計
- **security-architect**: セキュリティ分析、脆弱性評価、コンプライアンスチェック、セキュリティパターン評価
- **performance-engineer**: パフォーマンス分析、ボトルネック特定、最適化提案、負荷テスト評価
- **backend-developer**: コード品質改善、リファクタリング実装、ベストプラクティス適用、アーキテクチャ評価
- **frontend-architect**: フロントエンド品質分析、UI/UXパターン評価、アクセシビリティチェック
- **database-administrator**: データベース品質分析、クエリ最適化、データ整合性チェック
- **api-designer**: API品質分析、インターフェース設計評価、RESTful原則チェック
- **devops-coordinator**: DevOps品質分析、CI/CD効率評価、自動化品質チェック
- **observability-engineer**: 可観測性品質分析、監視品質評価、ログ品質チェック
- **refactoring-expert**: リファクタリング分析、技術的負債評価、クリーンコード原則適用
- **code-reviewer**: コードレビュー品質分析、コーディング標準チェック、ベストプラクティス評価
- **sre-agent**: 信頼性品質分析、運用品質評価、SLI/SLO準拠チェック
- **cost-optimization**: コスト効率性分析、リソース使用量最適化、効率性メトリクス
- **compliance-officer**: コンプライアンス品質分析、規制要件チェック、ポリシー準拠評価
- **version-control-specialist**: バージョン管理品質分析、Git使用パターン評価、ブランチ戦略チェック
- **technical-documentation**: 品質レポート作成、改善ガイドライン文書化、ドキュメント品質評価
- **edge-computing-specialist**: エッジ品質分析、分散システム品質評価、CDN品質チェック
- **vector-database-specialist**: ベクトルデータ品質分析、埋め込み品質評価、検索品質チェック
- **data-migration-specialist**: データ品質分析、移行品質評価、データ整合性確保

**ドメイン・アーキテクチャ品質チーム（6エージェント）**

- **system-architect**: システム全体品質分析、アーキテクチャ設計評価、依存関係分析
- **domain-modeller**: ドメインモデル品質分析、ビジネスロジック整合性評価、DDD原則チェック
- **event-bus-manager**: イベント駆動品質分析、メッセージング品質評価、イベント整合性チェック
- **workflow-orchestrator**: ワークフロー品質分析、プロセス効率評価、自動化品質チェック
- **real-time-features-specialist**: リアルタイム品質分析、同期品質評価、WebSocket品質チェック
- **llm-integration**: LLM統合品質分析、AI応答品質評価、プロンプト品質チェック

**プロダクト・ユーザー品質チーム（4エージェント）**

- **product-manager**: プロダクト品質分析、ビジネス価値評価、機能品質チェック
- **user-research**: ユーザー体験品質分析、使いやすさ評価、満足度メトリクス
- **ui-ux-designer**: UI/UX品質分析、デザインシステム評価、ユーザビリティテスト
- **requirements-analyst**: 要件品質分析、仕様充足度評価、ビジネス要件整合性チェック

#### 全オプション一覧

| オプション | 値                               | 説明     |
| ---------- | -------------------------------- | -------- |
| scope      | 分析対象パス                     | 対象指定 |
| --focus    | quality/security/performance/all | 焦点     |
| --depth    | shallow/deep                     | 分析深度 |
| --fix      | フラグ                           | 自動修正 |

#### 使用例と説明

```bash
# 品質分析
/ai:quality:analyze src/ --focus quality
# コード品質分析

# セキュリティ分析
/ai:quality:analyze api/ --focus security --depth deep
# 深層セキュリティ監査

# パフォーマンス分析
/ai:quality:analyze --focus performance --fix
# パフォーマンス最適化と自動修正

# 全側面分析
/ai:quality:analyze --focus all --depth deep --fix
# 包括的分析と修正
```

### `/ai:quality:tdd` - TDD 管理

#### 概要

テスト駆動開発（TDD）のライフサイクル全体を自動化・支援する。Red-Green-Refactorサイクルの効率化、契約テストによるAPI品質保証、ミューテーションテストによるテスト品質検証を実現。継続的監視モードによりコード変更と連動した自動テスト実行で、高品質なコードベースを維持。

#### 使用エージェント（全30エージェント中のTDD・テスト関連エージェント）

**TDD・テスト統括チーム（18エージェント）**

- **test-automation-engineer** (総合リーダー):
  TDD戦略設計、自動テスト実装、品質メトリクス管理、テストピラミッド構築
- **qa-coordinator**
  (品質リーダー): テスト品質基準定義、受入テスト設計、品質ゲート設定、テスト戦略統括
- **backend-developer**:
  TDDサイクル実行、テストファースト開発、リファクタリング実装、ユニットテスト作成
- **frontend-architect**: フロントエンドTDD、UI/UXテスト、コンポーネントテスト、E2Eテスト設計
- **api-designer**: 契約テスト設計、APIテスト仕様、インターフェーステスト、RESTfulテスト
- **domain-modeller**: ドメインテスト設計、ビジネスロジックテスト、仕様検証、DDD原則テスト
- **observability-engineer**: テスト実行監視、カバレッジ追跡、品質メトリクス収集、テスト可視化
- **devops-coordinator**: TDD
  CI/CD統合、自動テスト実行、テスト環境管理、パイプライン設計
- **database-administrator**: データベーステスト、データ整合性テスト、クエリテスト、マイグレーションテスト
- **security-architect**: セキュリティテスト、脆弱性テスト、ペネトレーションテスト、セキュリティTDD
- **performance-engineer**: パフォーマンステスト、負荷テスト、ストレステスト、性能TDD
- **real-time-features-specialist**: リアルタイム機能テスト、WebSocketテスト、同期テスト
- **event-bus-manager**: イベントテスト、メッセージングテスト、イベント駆動テスト
- **edge-computing-specialist**: エッジテスト、CDNテスト、分散システムテスト
- **vector-database-specialist**: ベクトル検索テスト、埋め込みテスト、類似度テスト
- **workflow-orchestrator**: ワークフローテスト、プロセステスト、自動化テスト
- **compliance-officer**: コンプライアンステスト、規制要件テスト、監査テスト
- **technical-documentation**: テストドキュメント、テスト仕様書、TDDガイドライン

**開発・実装チーム（7エージェント）**

- **refactoring-expert**: リファクタリングテスト、コード改善テスト、クリーンコードTDD
- **code-reviewer**: コードレビューテスト、品質チェックテスト、標準準拠テスト
- **sre-agent**: 信頼性テスト、可用性テスト、運用テスト、SLI/SLOテスト
- **system-architect**: アーキテクチャテスト、統合テスト、システムテスト
- **version-control-specialist**: バージョン管理テスト、ブランチテスト、マージテスト
- **data-migration-specialist**: データ移行テスト、データ品質テスト、変換テスト
- **cost-optimization**: コスト効率テスト、リソース使用量テスト、最適化テスト

**プロダクト・ユーザーテストチーム（5エージェント）**

- **product-manager**: プロダクトテスト、機能テスト、ビジネス価値テスト、受入基準
- **user-research**: ユーザビリティテスト、ユーザー体験テスト、使いやすさテスト
- **ui-ux-designer**: UIテスト、UXテスト、デザインテスト、アクセシビリティテスト
- **requirements-analyst**: 要件テスト、仕様テスト、ビジネス要件検証
- **prompt-engineering-specialist**: プロンプトテスト、AI応答テスト、LLMテスト品質

#### 全オプション一覧

| オプション | 値     | 説明             |
| ---------- | ------ | ---------------- |
| feature    | 機能名 | 対象機能         |
| --coverage | 0-100  | カバレッジ目標   |
| --contract | フラグ | 契約テスト       |
| --mutation | フラグ | ミューテーション |
| --watch    | フラグ | 監視モード       |

#### 使用例と説明

```bash
# 基本TDD
/ai:quality:tdd login --coverage 80
# 80%カバレッジ

# 契約テスト
/ai:quality:tdd api --contract --coverage 85
# API契約テスト

# ミューテーションテスト
/ai:quality:tdd core --mutation --coverage 90
# テスト品質検証

# ウォッチモード
/ai:quality:tdd feature --watch --coverage 80
# 継続的テスト実行

# フルテスト
/ai:quality:tdd critical --coverage 95 --contract --mutation --watch
# すべてのテスト機能
```

### `/ai:quality:security` - セキュリティ監査

#### 概要

ゼロトラスト原則に基づく包括的セキュリティ監査を実行する。SAST（静的解析）とDAST（動的解析）の組み合わせ、ペネトレーションテストによる実践的脆弱性検証、GDPR・SOC2等コンプライアンス監査を統合。継続的セキュリティ監視により、開発ライフサイクル全体でセキュリティ品質を保証。

#### 使用エージェント（全30エージェント中のセキュリティ監査関連エージェント）

**セキュリティ監査統括チーム（22エージェント）**

- **security-architect**
  (総合リーダー): セキュリティ監査戦略、脅威モデリング、脆弱性評価、ゼロトラスト設計
- **compliance-officer**
  (コンプライアンスリーダー): 規制要件確認、コンプライアンス監査、ポリシー準拠確認、GDPR/SOC2対応
- **test-automation-engineer**: セキュリティテスト自動化、ペネトレーションテスト実行、SAST/DAST統合
- **devops-coordinator**: セキュリティスキャン統合、CI/CDセキュリティゲート、セキュアデプロイ
- **backend-developer**: セキュリティ修正実装、暗号化対応、認証機能強化、セキュアコーディング
- **observability-engineer**: セキュリティ監視、異常検知、インシデント追跡、セキュリティログ分析
- **sre-agent**: セキュリティ運用、インシデント対応、セキュリティSLO管理、緊急対応
- **frontend-architect**: フロントエンドセキュリティ、XSS対策、CSRF防止、セキュアUI設計
- **api-designer**: APIセキュリティ、認証設計、認可制御、セキュアAPI設計
- **database-administrator**: データベースセキュリティ、データ暗号化、アクセス制御、SQL インジェクション対策
- **edge-computing-specialist**: エッジセキュリティ、CDNセキュリティ、分散攻撃対策
- **network-specialist**: ネットワークセキュリティ、ファイアウォール設定、DDoS対策
- **data-migration-specialist**: データ移行セキュリティ、データ保護、プライバシー確保
- **version-control-specialist**: コードセキュリティ、シークレット管理、セキュアGit運用
- **cost-optimization**: セキュリティコスト管理、セキュリティ投資効率、リスク評価
- **technical-documentation**: セキュリティドキュメント、セキュリティポリシー、手順書作成
- **workflow-orchestrator**: セキュリティワークフロー、自動化セキュリティ、プロセス監査
- **real-time-features-specialist**: リアルタイムセキュリティ、WebSocketセキュリティ、通信暗号化
- **vector-database-specialist**: ベクトルデータセキュリティ、埋め込みデータ保護
- **event-bus-manager**: イベントセキュリティ、メッセージング暗号化、イベント整合性
- **performance-engineer**: セキュリティパフォーマンス、暗号化オーバーヘッド最適化
- **llm-integration**:
  LLMセキュリティ、プロンプトインジェクション対策、AI セキュリティ

**ドメイン・アーキテクチャセキュリティチーム（4エージェント）**

- **system-architect**: システムセキュリティアーキテクチャ、セキュリティ設計原則、依存関係セキュリティ
- **domain-modeller**: ドメインセキュリティ、ビジネスロジックセキュリティ、権限モデル設計
- **refactoring-expert**: セキュアリファクタリング、セキュリティ技術負債解消
- **code-reviewer**: セキュリティコードレビュー、セキュアコーディング標準、脆弱性パターン検出

**プロダクト・ユーザーセキュリティチーム（4エージェント）**

- **product-manager**: プロダクトセキュリティ、セキュリティ要件、リスク評価、セキュリティ戦略
- **user-research**: ユーザープライバシー、データ保護、ユーザー同意管理
- **ui-ux-designer**: セキュアUI/UX、プライバシーバイデザイン、セキュリティユーザビリティ
- **requirements-analyst**: セキュリティ要件分析、脅威要件、コンプライアンス要件定義

#### 全オプション一覧

| オプション   | 値                  | 説明             |
| ------------ | ------------------- | ---------------- |
| scope        | 監査範囲            | 対象指定         |
| --scan       | static/dynamic/both | スキャンタイプ   |
| --pentest    | フラグ              | ペネトレーション |
| --compliance | gdpr/soc2           | コンプライアンス |

#### 使用例と説明

```bash
# 静的スキャン
/ai:quality:security src/ --scan static
# SAST実行

# 動的スキャン
/ai:quality:security api/ --scan dynamic
# DAST実行

# 両方のスキャン
/ai:quality:security --scan both --pentest
# SAST+DAST+ペネトレーション

# コンプライアンス監査
/ai:quality:security --compliance gdpr
# GDPR準拠確認

# フル監査
/ai:quality:security --scan both --pentest --compliance soc2
# 完全セキュリティ監査
```

---

## **8. データ管理コマンド (3 コマンド)**

### `/ai:data:vector` - ベクトル DB 管理

#### 概要

libSQL
Vectorを活用した高性能ベクトルデータベース管理を実行する。プロンプト埋め込み生成・保存、効率的類似度検索、インデックス最適化、ベクトル分析を統合。HNSW・IVFFlatなど複数インデックス戦略に対応し、大規模プロンプトライブラリでの高速検索とパーソナライゼーションを実現。

#### 使用エージェント（全30エージェント中のベクトルDB管理関連エージェント）

**ベクトルDB管理統括チーム（18エージェント）**

- **vector-database-specialist**
  (総合リーダー): ベクトルDB設計、埋め込み戦略、検索最適化、vector extensions統合
- **database-administrator** (DB リーダー): libSQL
  Vector統合、インデックス管理、ストレージ最適化、データベース設計
- **prompt-engineering-specialist**: プロンプト埋め込み生成、類似度基準定義、プロンプト品質評価
- **data-analyst**: ベクトル分析、クラスタリング、パフォーマンス分析、データ洞察生成
- **performance-engineer**: 検索性能最適化、インデックス調整、レスポンス改善、クエリ最適化
- **backend-developer**: ベクトル検索API実装、埋め込み処理パイプライン、バックエンド統合
- **llm-integration**: LLM統合ベクトル処理、埋め込みAPI連携、マルチモデル対応
- **evaluation-engine**: ベクトル品質評価、検索精度測定、パフォーマンス評価
- **api-designer**: ベクトル検索API設計、エンドポイント定義、インターフェース最適化
- **frontend-architect**: ベクトル検索UI実装、検索結果表示、ユーザーインターフェース
- **edge-computing-specialist**: エッジでのベクトル処理、分散検索、Cloudflare
  Vector統合
- **observability-engineer**: ベクトル処理監視、検索メトリクス、パフォーマンス追跡
- **cost-optimization**: ベクトル処理コスト最適化、ストレージコスト管理、効率化
- **security-architect**: ベクトルデータセキュリティ、埋め込みデータ保護、アクセス制御
- **devops-coordinator**: ベクトルDB運用、自動化設定、デプロイ管理
- **workflow-orchestrator**: ベクトル処理ワークフロー、バッチ処理、パイプライン管理
- **real-time-features-specialist**: リアルタイムベクトル検索、即時更新、同期処理
- **technical-documentation**: ベクトルDB文書、API文書、使用ガイド作成

**データ処理・分析チーム（6エージェント）**

- **data-migration-specialist**: ベクトルデータ移行、埋め込みデータ変換、データ整合性確保
- **requirements-analyst**: ベクトル検索要件分析、性能要件定義、機能仕様策定
- **test-automation-engineer**: ベクトル検索テスト、性能テスト、品質保証
- **user-research**: ユーザー検索行動分析、検索体験改善、使用パターン調査
- **qa-coordinator**: ベクトルDB品質管理、検索品質保証、テスト戦略
- **compliance-officer**: データプライバシー、規制準拠、データ管理ポリシー

**システム・アーキテクチャチーム（6エージェント）**

- **system-architect**: ベクトルDBアーキテクチャ、システム統合、スケーラビリティ設計
- **domain-modeller**: ベクトル検索ドメイン設計、データモデル定義、ビジネスロジック
- **event-bus-manager**: ベクトル更新イベント、データ同期、イベント駆動処理
- **version-control-specialist**: ベクトルデータバージョン管理、変更追跡、履歴管理
- **refactoring-expert**: ベクトル処理コード改善、性能リファクタリング、技術負債解消
- **sre-agent**: ベクトルDB信頼性、可用性確保、運用監視

#### 全オプション一覧

| オプション  | 値                            | 説明         |
| ----------- | ----------------------------- | ------------ |
| operation   | embed/search/optimize/analyze | 操作         |
| --dimension | 数値                          | ベクトル次元 |
| --index     | hnsw/ivfflat                  | インデックス |

#### 使用例と説明

```bash
# 埋め込み生成
/ai:data:vector embed --dimension 1536
# 1536次元埋め込み

# 検索実装
/ai:data:vector search --dimension 1536 --index hnsw
# HNSW検索（精度重視）

# 最適化
/ai:data:vector optimize --index ivfflat
# IVFFlat最適化（速度重視）

# 分析
/ai:data:vector analyze
# ベクトル分析とクラスタリング
```

### `/ai:data:migrate` - データ移行

#### 概要

ゼロダウンタイムでの安全なデータ移行を実行する。レガシーシステムからモダンアーキテクチャへの段階的移行、データ整合性検証、リアルタイム同期、自動ロールバック計画を統合。ETLパイプライン最適化とデータ品質保証により、大規模データ移行でもサービス継続性を確保。

#### 使用エージェント（全30エージェント中のデータ移行関連エージェント）

**データ移行統括チーム（20エージェント）**

- **data-migration-specialist**
  (総合リーダー): 移行戦略設計、ETLパイプライン構築、データ整合性管理、移行計画策定
- **database-administrator**
  (DB リーダー): 移行実行、スキーマ変換、パフォーマンス最適化、データベース運用
- **backend-developer**: 移行スクリプト実装、API互換性確保、データ変換処理、バックエンド調整
- **data-analyst**: データ検証、整合性チェック、品質分析、移行結果評価
- **sre-agent**: ゼロダウンタイム監視、可用性確保、緊急対応、信頼性管理
- **observability-engineer**: 移行プロセス監視、進捗追跡、異常検知、メトリクス収集
- **devops-coordinator**: 移行自動化、CI/CD統合、インフラ調整、デプロイ管理
- **performance-engineer**: 移行性能最適化、ボトルネック解消、スループット改善
- **security-architect**: データセキュリティ、暗号化管理、アクセス制御、プライバシー保護
- **vector-database-specialist**: ベクトルデータ移行、埋め込みデータ変換、検索インデックス再構築
- **api-designer**: API移行設計、エンドポイント互換性、インターフェース調整
- **test-automation-engineer**: 移行テスト自動化、データ検証テスト、品質保証
- **compliance-officer**: 規制準拠、データガバナンス、監査要件、ポリシー適用
- **cost-optimization**: 移行コスト管理、リソース最適化、効率性評価
- **version-control-specialist**: 移行バージョン管理、変更追跡、ロールバック準備
- **workflow-orchestrator**: 移行ワークフロー管理、プロセス自動化、手順統制
- **technical-documentation**: 移行手順書、ドキュメント更新、ナレッジ管理
- **edge-computing-specialist**: エッジデータ移行、分散データ同期、CDN調整
- **event-bus-manager**: イベントデータ移行、メッセージング移行、イベント整合性
- **real-time-features-specialist**: リアルタイムデータ移行、ライブ同期、即時反映

**ビジネス・品質管理チーム（5エージェント）**

- **product-manager**: 移行ビジネス影響評価、優先順位決定、ステークホルダー調整
- **qa-coordinator**: 移行品質戦略、テスト計画、品質ゲート設定
- **user-research**: ユーザー影響分析、移行体験評価、フィードバック収集
- **requirements-analyst**: 移行要件定義、仕様確認、ビジネス要件整合性
- **root-cause-analyst**: 移行問題分析、障害調査、根本原因特定

**システム・アーキテクチャチーム（5エージェント）**

- **system-architect**: 移行アーキテクチャ設計、システム統合、依存関係管理
- **domain-modeller**: ドメインデータ移行、ビジネスロジック移行、モデル変換
- **frontend-architect**: フロントエンド移行、UI調整、ユーザーインターフェース移行
- **llm-integration**: AI/LLMデータ移行、モデルデータ変換、AI機能移行
- **refactoring-expert**: 移行コード改善、レガシー対応、技術負債解消

#### 全オプション一覧

| オプション      | 値           | 説明             |
| --------------- | ------------ | ---------------- |
| source          | ソース名     | 移行元           |
| target          | ターゲット名 | 移行先           |
| --zero-downtime | フラグ       | ゼロダウンタイム |
| --validate      | フラグ       | 検証実行         |
| --rollback-plan | フラグ       | ロールバック準備 |

#### 使用例と説明

```bash
# 基本移行
/ai:data:migrate old-db new-db
# シンプルな移行

# ゼロダウンタイム移行
/ai:data:migrate sqlite-local turso-prod --zero-downtime
# ダウンタイムなし

# 検証付き移行
/ai:data:migrate legacy cloud --validate
# データ整合性検証

# 完全移行
/ai:data:migrate production staging --zero-downtime --validate --rollback-plan
# 全オプション有効
```

### `/ai:data:analyze` - データ分析

#### 概要

大規模データの統計分析と機械学習を通じて実用的なビジネスインサイトを提供する。プロンプト使用パターン分析、ユーザー行動分析、ベクトル分析による類似度クラスタリングを実行。データ可視化とレポート自動生成により、データ駆動型意思決定とプロダクト改善を支援。

#### 使用エージェント（全30エージェント中のデータ分析関連エージェント）

**データ分析統括チーム（18エージェント）**

- **data-analyst**
  (総合リーダー): 統計分析、機械学習、ビジネスインサイト生成、傾向分析、データサイエンス
- **user-research**
  (行動分析リーダー): ユーザー行動分析、セグメント分析、利用パターン調査、UX分析
- **vector-database-specialist**: ベクトル分析、クラスタリング、類似度計算、埋め込み分析
- **evaluation-engine**: 評価データ分析、品質メトリクス統計、パフォーマンス分析、評価指標
- **cost-optimization**: コスト分析、ROI計算、効率性評価、リソース使用量分析
- **frontend-architect**: データ可視化UI実装、ダッシュボード構築、レポート表示、分析UI設計
- **performance-engineer**: パフォーマンスデータ分析、ボトルネック特定、性能メトリクス分析
- **observability-engineer**: 監視データ分析、ログ分析、メトリクス解析、運用データ分析
- **backend-developer**: データ処理パイプライン実装、分析API開発、データ変換処理
- **database-administrator**: データベース分析、クエリ性能分析、データ品質分析
- **prompt-engineering-specialist**: プロンプトデータ分析、AI使用パターン分析、プロンプト効果測定
- **llm-integration**: LLM使用データ分析、API使用量分析、AI性能分析
- **api-designer**: APIデータ分析、エンドポイント使用統計、インターフェース分析
- **security-architect**: セキュリティデータ分析、脅威分析、リスク評価データ
- **compliance-officer**: コンプライアンスデータ分析、監査データ、規制要件分析
- **workflow-orchestrator**: ワークフローデータ分析、プロセス効率分析、自動化効果測定
- **real-time-features-specialist**: リアルタイムデータ分析、ストリーミング分析、即時データ処理
- **edge-computing-specialist**: エッジデータ分析、分散データ処理、グローバル使用パターン

**ビジネス・戦略分析チーム（7エージェント）**

- **product-manager**: プロダクトデータ分析、機能使用率分析、ビジネスメトリクス、KPI分析
- **requirements-analyst**: 要件データ分析、仕様充足度分析、ビジネス要件評価
- **domain-modeller**: ドメインデータ分析、ビジネスロジック分析、モデル効果測定
- **system-architect**: システムデータ分析、アーキテクチャメトリクス、依存関係分析
- **devops-coordinator**: DevOpsデータ分析、デプロイメトリクス、運用効率分析
- **sre-agent**: 信頼性データ分析、可用性メトリクス、SLI/SLO分析
- **event-bus-manager**: イベントデータ分析、メッセージング統計、イベント流量分析

**技術・品質分析チーム（5エージェント）**

- **qa-coordinator**: 品質データ分析、テストメトリクス、品質傾向分析
- **test-automation-engineer**: テストデータ分析、カバレッジ分析、テスト効果測定
- **technical-documentation**: ドキュメント分析、使用統計、情報アクセス分析
- **version-control-specialist**: バージョン管理データ分析、コミット統計、開発活動分析
- **data-migration-specialist**: データ移行分析、品質評価、移行効果測定

#### 全オプション一覧

| オプション  | 値                    | 説明         |
| ----------- | --------------------- | ------------ |
| dataset     | データセット名        | 分析対象     |
| --type      | statistical/ml/vector | 分析タイプ   |
| --visualize | フラグ                | 可視化       |
| --report    | フラグ                | レポート生成 |

#### 使用例と説明

```bash
# 統計分析
/ai:data:analyze user-data --type statistical
# 基本統計量

# 機械学習分析
/ai:data:analyze events --type ml --visualize
# ML分析と可視化

# ベクトル分析
/ai:data:analyze embeddings --type vector --report
# ベクトル分析レポート

# 完全分析
/ai:data:analyze all-data --type statistical --visualize --report
# 全機能での分析
```

---

## **コマンド組み合わせパターン**

### 新プロジェクト立ち上げの完全フロー

```bash
# 1. 初期化（すべてのオプション活用）
/ai:core:init new-project --phase 1 --agents core --env dev --ddd

# 2. Git設定
/ai:development:git init --strategy gitflow --hooks
/ai:development:git commit --hooks --semantic-version

# 3. 同期（全モード試行）
/ai:core:sync --scope all --mode share
/ai:core:sync --scope all --mode merge
/ai:core:sync --scope all --mode resolve --priority high

# 4. チーム編成（各サイズ）
/ai:core:team initial --size small --optimize cost --duration sprint
/ai:core:team development --size medium --optimize quality --duration sprint
/ai:core:team scaling --size large --optimize performance --duration epic
```

### プロンプト開発の完全フロー

```bash
# 1. 作成（全オプション）
/ai:prompt:create advanced --model all --chain --optimize --template

# 2. 評価（全メトリクス）
/ai:prompt:evaluate advanced --metrics all --compare baseline --improve

# 3. 差分分析（全機能）
/ai:prompt:intent-diff advanced --visualize --auto-fix --threshold 0.9 --interactive

# 4. スタイル適用（完全処理）
/ai:prompt:style-genome user --analyze history --extract --apply advanced --transfer

# 5. バージョン管理
/ai:development:git commit --hooks --semantic-version
/ai:development:git release v1.0.0 --semantic-version --hooks
```

### 開発ワークフローの完全フロー

```bash
# 1. ブランチ作成
/ai:development:git init --strategy github-flow --hooks

# 2. 実装
/ai:development:implement new-feature --tdd --coverage 90 --parallel

# 3. コミット
/ai:development:git commit --hooks --semantic-version

# 4. PR作成とマージ
/ai:development:git pr feature-branch --auto-merge
/ai:development:git merge feature-branch --auto-merge --strategy github-flow

# 5. リリース
/ai:development:git release v2.0.0 --semantic-version --hooks
```

---

## 📊 CI/CD最適化の成果（2025年9月29日追加）

### GitHub Actions使用量削減 - 52.3%削減達成

#### 最適化前後の比較

- **Before**: 3,200分/月（無料枠超過、有料プラン必要）
- **After**: 1,525分/月（無料枠2,000分以内）
- **削減量**: 1,675分/月（52.3%削減）
- **年間コスト削減**: $115.2

#### 実装内容

##### 1. 共有ワークフローの導入

```yaml
# .github/workflows/shared-setup-python.yml
name: "共有Python環境セットアップ"
on:
  workflow_call:
    inputs:
      python-version:
        required: true
        type: string
```

- `shared-setup-python.yml`: Python環境の共通設定
- `shared-setup-node.yml`: Node.js/pnpm環境の共通設定
- `shared-build-cache.yml`: ビルドキャッシュの共通管理

##### 2. スケジュール頻度の最適化

- `security-incident.yml`: 毎時 → 毎日（96%削減）
- `metrics.yml`: 毎日 → 週次（86%削減）
- `audit-logging.yml`: 毎日 → 週次（86%削減）

##### 3. セキュリティ強化の維持

- **CodeQL**: Python/TypeScript静的解析継続
- **TruffleHog**: 秘密情報検出継続
- **監査ログ**: 365日保存
- **DORAメトリクス**: 自動収集継続

#### 関連コマンドとエージェント

##### CI/CD管理用コマンド

- `/ai:operations:deploy`: デプロイメント自動化
- `/ai:operations:monitor`: 監視・メトリクス管理
- `/ai:development:git`: Git操作とワークフロー最適化

##### 担当エージェント

- **devops-coordinator**: CI/CDパイプライン最適化
- **cost-optimization**: GitHub Actions使用量監視
- **sre-agent**: 可用性とインシデント対応

#### 今後の改善提案

1. **さらなる最適化余地**: マトリクステスト見直しで追加10-15%削減可能
2. **監視強化**: GitHub Actions使用量の自動アラート設定
3. **段階的展開**: Phase進行に応じた自動ジョブ有効化
