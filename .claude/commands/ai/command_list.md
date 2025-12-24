# 全コマンドリスト

全エージェントとそのスキルを最大限活用するための包括的なコマンドリストです。
各コマンドには設定可能な要素(引数、model 等)を明記しています。

---

## 1. プロジェクト初期化・セットアップ

### .claude/commands/ai/init-project.md

- 目的: 新規プロジェクトの完全な初期化を実行するコマンド。プロジェクトゴール定義、初期要件整理、アーキテクチャ方針確立を自動化します。
- 引数: [project-name]
- model: opus
- トリガーキーワード: init, initialize, setup, new project, 新規プロジェクト, 初期化

### .claude/commands/ai/scaffold-project.md

- 目的: プロジェクト設計書（master_system_design.md）に準拠したハイブリッドアーキテクチャのディレクトリ構造と設定ファイルを自動生成するコマンド。
- 引数: [template-type]
- model: sonnet
- トリガーキーワード: scaffold, init, setup, project-structure, hybrid-architecture, MVP, テンプレート

### .claude/commands/ai/setup-dev-env.md

- 目的: プロジェクトの開発環境を完全セットアップするコマンド。
- 引数: なし
- model: sonnet
- トリガーキーワード: setup, environment, dev-env, 開発環境, 初期化, pnpm

### .claude/commands/ai/init-git-workflow.md

- 目的: Gitワークフローとブランチ戦略（git-flow/github-flow/trunk-based）を確立するコマンド。
- 引数: [strategy]
- model: sonnet
- トリガーキーワード: git workflow, branch strategy, git-flow, github-flow, hooks, automation

## 2. 要件定義・仕様策定

### .claude/commands/ai/gather-requirements.md

- 目的: ステークホルダーへのヒアリングを実施し、曖昧な要望を検証可能な要件に変換します。
- 引数: [stakeholder-name]
- model: opus
- トリガーキーワード: 要件定義、ヒアリング、要求分析、requirements gathering

### .claude/commands/ai/create-user-stories.md

- 目的: ユーザーストーリーとアクセプタンスクライテリアを作成する専門コマンド。
- 引数: [feature-name]
- model: opus
- トリガーキーワード: user stories, acceptance criteria, ユーザーストーリー, 受け入れ基準, backlog, バックログ, MVP

### .claude/commands/ai/define-use-cases.md

- 目的: ユースケース図とシナリオの作成を行う専門コマンド。
- 引数: [actor-name]
- model: sonnet
- トリガーキーワード: use-case, ユースケース, シナリオ, アクター, フロー設計, 対話設計

### .claude/commands/ai/write-spec.md

- 目的: 実装可能な詳細仕様書作成（Specification-Driven Development）
- 引数: [feature-name]
- model: sonnet
- トリガーキーワード: spec, specification, 仕様書, 詳細仕様, 実装仕様, 設計書

### .claude/commands/ai/estimate-project.md

- 目的: プロジェクト規模の見積もりと予測可能な計画の策定。
- 引数: なし
- model: opus
- トリガーキーワード: estimate, estimation, 見積もり, 規模, ストーリーポイント, ベロシティ, リリース予測

## 3. 設計・アーキテクチャ

### .claude/commands/ai/design-architecture.md

- 目的: システム全体のアーキテクチャ設計を行うコマンド。
- 引数: [architecture-style]
- model: opus
- トリガーキーワード: architecture, design, アーキテクチャ, 設計, clean architecture, DDD

### .claude/commands/ai/review-architecture.md

- 目的: アーキテクチャレビューと依存関係チェックを実行するコマンド。
- 引数: [scope]
- model: opus
- トリガーキーワード: architecture review, アーキテクチャレビュー, 依存関係, SOLID, clean architecture, コードスメル

### .claude/commands/ai/design-domain-model.md

- 目的: ドメイン駆動設計（DDD）に基づくドメインモデルの設計を行う専門コマンド。
- 引数: [domain-name]
- model: opus
- トリガーキーワード: domain, DDD, entity, value object, aggregate, ドメインモデル, エンティティ, 値オブジェクト, ユビキタス言語

### .claude/commands/ai/design-api.md

- 目的: REST API設計とOpenAPI 3.x仕様書の作成（エンドポイント定義、認証設計、スキーマ生成）。
- 引数: [resource-name]
- model: opus
- トリガーキーワード: api, design, endpoint, openapi, swagger, REST, エンドポイント設計, API仕様書

### .claude/commands/ai/design-database.md

- 目的: データベーススキーマ設計（Drizzle ORM 0.39.x + Turso SQLite準拠）。
- 引数: [table-name]
- model: opus
- トリガーキーワード: database design, schema, table, ER diagram, データベース設計, スキーマ, テーブル, 正規化

## 4. フロントエンド開発

### .claude/commands/ai/create-component.md

- 目的: Reactコンポーネント（Atomic Design準拠）を作成する専門コマンド。
- 引数: [component-name] [type]
- model: opus
- トリガーキーワード: component, ui, react, atomic-design, アクセシビリティ, デザインシステム

### .claude/commands/ai/create-page.md

- 目的: Next.js App Routerのページ（page.tsx）を作成する専門コマンド。
- 引数: [route-path]
- model: opus
- トリガーキーワード: page, route, Next.js, App Router, ページ作成

### .claude/commands/ai/setup-state-management.md

- 目的: React状態管理ライブラリ（SWR/React Query）のセットアップと実装を行う専門コマンド。
- 引数: [library]
- model: opus
- トリガーキーワード: state management, data fetching, SWR, React Query, hooks, 状態管理

### .claude/commands/ai/create-custom-hook.md

- 目的: 再利用可能なReactカスタムフックを設計・実装する専門コマンド。
- 引数: [hook-name]
- model: opus
- トリガーキーワード: custom hook, use〜, カスタムフック, ロジック抽出, 再利用

### .claude/commands/ai/setup-design-system.md

- 目的: デザインシステム基盤とTailwind CSS設定の完全セットアップ。
- 引数: なし
- model: sonnet
- トリガーキーワード: design-system, tailwind, デザイントークン, スタイル設定, UI基盤

### .claude/commands/ai/optimize-frontend-performance.md

- 目的: Next.jsフロントエンドのパフォーマンス最適化を実行する専門コマンド。
- 引数: [target-page]
- model: opus
- トリガーキーワード: performance, optimize, frontend, パフォーマンス, 最適化, LCP, Core Web Vitals

## 5. バックエンド開発

### .claude/commands/ai/create-entity.md

- 目的: 新しいドメインエンティティを作成する専門コマンド。
- 引数: [entity-name] (optional) - エンティティ名（例: User, Task）
- model: opus
- トリガーキーワード: entity, domain, ドメインエンティティ, DDD

### .claude/commands/ai/create-executor.md

- 目的: 新しいワークフロー機能のExecutor実装を作成する専門コマンド。
- 引数: [workflow-name]
- model: opus
- トリガーキーワード: executor, workflow, ビジネスロジック, 機能実装

### .claude/commands/ai/implement-business-logic.md

- 目的: ビジネスロジック実装専門コマンド。マーティン・ファウラーの思想に基づき、可読性が高くテスト容易なExecutorクラスを実装します。
- 引数: [logic-name]
- model: opus
- トリガーキーワード: business logic, executor, implement, 実装, ビジネスロジック, TDD

### .claude/commands/ai/create-api-gateway.md

- 目的: 外部API統合ゲートウェイの実装（Discord、Slack、OpenAI等）。
- 引数: [api-name] (例: discord, slack, openai, stripe)
- model: opus
- トリガーキーワード: api, gateway, integration, 外部連携, Discord, Slack, OpenAI

### .claude/commands/ai/create-schema.md

- 目的: Zodスキーマ定義の作成（Zod 3.x + TypeScript 5.x準拠）。
- 引数: [schema-name]
- model: opus
- トリガーキーワード: schema, zod, validation, バリデーション, スキーマ, 型定義, input validation

### .claude/commands/ai/optimize-prompts.md

- 目的: AIプロンプトの最適化を行う専門コマンド。
- 引数: [prompt-file]
- model: opus
- トリガーキーワード: prompt, AI, optimization, hallucination, few-shot, .claude/skills/chain-of-thought/SKILL.md

## 6. データベース

### .claude/commands/ai/create-db-schema.md

- 目的: Drizzle ORMスキーマ作成を行う専門コマンド。
- 引数: [table-name]
- model: opus
- トリガーキーワード: schema, database, table, Drizzle, normalization, JSON, SQLite, Turso

### .claude/commands/ai/create-migration.md

- 目的: データベースマイグレーションファイル作成を行う専門コマンド。
- 引数: [migration-name]
- model: sonnet
- トリガーキーワード: migration, schema-change, rollback, Up/Down, Drizzle

### .claude/commands/ai/optimize-queries.md

- 目的: データベースクエリの最適化を行う専門コマンド。
- 引数: [file-path]
- model: opus
- トリガーキーワード: query, optimization, N+1, EXPLAIN, performance, slow-query

### .claude/commands/ai/setup-db-backup.md

- 目的: データベースバックアップ・リカバリ戦略の設定を行う専門コマンド。
- 引数: [backup-schedule]
- model: sonnet
- トリガーキーワード: backup, recovery, disaster, PITR, RPO, RTO, restoration

### .claude/commands/ai/create-repository.md

- 目的: 新しいRepositoryパターン実装を作成する専門コマンド。
- 引数: [entity-name] (optional) - エンティティ名（例: Workflow, User）
- model: opus
- トリガーキーワード: repository, data access, データアクセス, CRUD, ORM

### .claude/commands/ai/seed-database.md

- 目的: データベース初期データ投入コマンド（開発・テスト・本番環境対応）。
- 引数: [environment]
- model: sonnet
- トリガーキーワード: seed, seeding, 初期データ, テストデータ, マスターデータ

## 7. テスト

### .claude/commands/ai/generate-unit-tests.md

- 目的: ユニットテストの自動生成を行う専門コマンド。
- 引数: [target-file]
- model: opus
- トリガーキーワード: unit test, test generation, TDD, coverage, テスト作成

### .claude/commands/ai/generate-component-tests.md

- 目的: コンポーネントテスト自動生成（Vitest + React Testing Library）
- 引数: <component-path>
- model: sonnet
- トリガーキーワード: component test, react testing, vitest, testing library, コンポーネントテスト, テスト生成

### .claude/commands/ai/generate-e2e-tests.md

- 目的: E2Eテストシナリオの自動作成を行う専門コマンド。
- 引数: [user-flow]
- model: opus
- トリガーキーワード: e2e test, integration test, user flow, playwright, E2Eテスト

### .claude/commands/ai/run-all-tests.md

- 目的: 全テストスイート（ユニットテスト + E2Eテスト）の実行と結果集約を行うコマンド。
- 引数: [--coverage]
- model: sonnet
- トリガーキーワード: run tests, all tests, test suite, CI, テスト実行

### .claude/commands/ai/tdd-cycle.md

- 目的: TDDサイクル（Red-Green-Refactor）の実行を自動化する専門コマンド。
- 引数: [feature-name]
- model: opus
- トリガーキーワード: TDD, test-driven, red green refactor, テスト駆動

### .claude/commands/ai/create-test-fixtures.md

- 目的: テストデータ・フィクスチャの自動作成を行う専門コマンド。
- 引数: [fixture-type]
- model: opus
- トリガーキーワード: fixture, test data, seeding, テストデータ, フィクスチャ

### .claude/commands/ai/fix-flaky-tests.md

- 目的: 不安定なテスト（フレーキーテスト）の検出と修正を自動化する専門コマンド。
- 引数: [test-file]
- model: sonnet
- トリガーキーワード: flaky test, unstable test, 不安定なテスト, フレーキー

## 8. 品質管理

### .claude/commands/ai/lint.md

- 目的: ESLintによるコード品質チェックを実行し、潜在的な問題を特定します。自動修正オプション付きでLint実行し、結果をレポートします。
- 引数: [--fix]
- model: sonnet
- トリガーキーワード: lint, eslint, code quality, コードチェック, 静的解析

### .claude/commands/ai/format.md

- 目的: Prettierによるコードフォーマットを実行し、一貫したコードスタイルを保証します。指定されたファイルまたはパターンに自動フォーマットを適用します。
- 引数: [target-pattern]
- model: sonnet
- トリガーキーワード: format, prettier, フォーマット, 整形, code style

### .claude/commands/ai/analyze-code-quality.md

- 目的: メトリクス、複雑度、Code Smellsを含む包括的なコード品質分析を実行します。アクション可能な推奨事項を含む詳細な品質レポートを生成します。
- 引数: [directory]
- model: sonnet
- トリガーキーワード: code quality, analyze, metrics, complexity, 品質分析, メトリクス, 複雑度

### .claude/commands/ai/run-accessibility-audit.md

- 目的: アクセシビリティ自動監査（axe-core + WCAG 2.1 AA）
- 引数: [--scope page|component|all] [--wcag-level A|AA|AAA] [--fix-mode auto|manual]
- model: sonnet
- トリガーキーワード: accessibility, a11y, WCAG, axe-core, audit, アクセシビリティ, 監査

### .claude/commands/ai/setup-pre-commit.md

- 目的: HuskyとLint-stagedを使用したPre-commit hooksの設定を行います。コミット前にLintとフォーマットを自動実行するGit hooksをセットアップします。
- 引数: なし
- model: sonnet
- トリガーキーワード: pre-commit, git hooks, husky, lint-staged, 品質自動化

### .claude/commands/ai/refactor.md

- 目的: コード品質、保守性、ベストプラクティスへの準拠を改善するためのリファクタリングを実行します。テストを通じて機能性を維持しながらリファクタリング技法を適用します。
- 引数: <target-file>
- model: opus
- トリガーキーワード: refactor, improve, clean code, リファクタリング, 改善, コード整理

## 9. セキュリティ

### .claude/commands/ai/security-audit.md

- 目的: 包括的なセキュリティ監査を実施し、脆弱性、権限設定、認証・認可の問題を検出してレポートを生成します。
- 引数: [scope: all|auth|api|database]
- model: opus
- トリガーキーワード: security audit, セキュリティ監査, OWASP, 権限チェック, 認証監査

### .claude/commands/ai/setup-auth.md

- 目的: 認証・認可システムを実装します。OAuth 2.0（GitHub/Google）または Credentials認証をサポートし、NextAuth.jsまたはPassport.jsベースの実装を提供します。
- 引数: [provider: github|google|credentials]
- model: sonnet
- トリガーキーワード: authentication, authorization, 認証実装, OAuth, NextAuth, ログイン

### .claude/commands/ai/scan-vulnerabilities.md

- 目的: プロジェクトの依存関係とコードベースをスキャンし、既知の脆弱性（CVE）を検出してレポートを生成します。
- 引数: なし
- model: sonnet
- トリガーキーワード: vulnerability scan, 脆弱性スキャン, pnpm audit, pnpm audit, CVE検出

### .claude/commands/ai/setup-rate-limiting.md

- 目的: APIエンドポイントにレート制限を実装し、 DoS攻撃やブルートフォース攻撃を防御します。
- 引数: [rate-limit]
- model: sonnet
- トリガーキーワード: rate limiting, レート制限, throttling, DoS対策, API制限

### .claude/commands/ai/manage-secrets.md

- 目的: 機密情報（APIキー、シークレット、環境変数）を安全に管理し、ハードコードされたシークレットを検出して適切な管理手法を実装します。
- 引数: なし
- model: sonnet
- トリガーキーワード: secret management, 機密情報管理, API key, 環境変数, .env, シークレット検出, credentials

### .claude/commands/ai/rotate-secrets.md

- 目的: APIキーやシークレットを安全にローテーション（更新）し、古いシークレットの無効化と新しいシークレットの設定を支援します。
- 引数: [secret-name]
- model: sonnet
- トリガーキーワード: secret rotation, キーローテーション, パスワード変更, API key rotation, 鍵更新

## 10. CI/CD・デプロイ

### .claude/commands/ai/create-ci-workflow.md

- 目的: GitHub ActionsのCI（継続的インテグレーション）ワークフローを作成します。テスト・Lint・ビルドなどのワークフロータイプに対応し、キャッシュ戦略とマトリックスビルドを最適化します。
- 引数: test|lint|build
- model: sonnet
- トリガーキーワード: ci, workflow, github actions, continuous integration

### .claude/commands/ai/create-cd-workflow.md

- 目的: GitHub ActionsのCD（継続的デプロイ）ワークフローを作成します。ステージング・本番環境へのデプロイ自動化、承認フロー、ロールバック機能を提供します。
- 引数: staging|production
- model: sonnet
- トリガーキーワード: cd, deploy, deployment, continuous deployment

### .claude/commands/ai/create-reusable-workflow.md

- 目的: 再利用可能なGitHub Actionsワークフローを作成します。共通処理をモジュール化し、複数のワークフローから呼び出し可能にします。
- 引数: workflow-name
- model: sonnet
- トリガーキーワード: reusable, workflow, shared, common

### .claude/commands/ai/create-composite-action.md

- 目的: カスタムコンポジットアクションを作成します。複数のステップをまとめて再利用可能なアクションとしてパッケージ化します。
- 引数: action-name
- model: sonnet
- トリガーキーワード: composite action, custom action, reusable action

### .claude/commands/ai/optimize-ci-performance.md

- 目的: CI/CDパイプラインのパフォーマンスを最適化します。キャッシュ戦略、並列実行、コスト削減により実行時間を短縮します。
- 引数: workflow-file
- model: sonnet
- トリガーキーワード: optimize, performance, speed up, ci performance

### .claude/commands/ai/setup-deployment-environments.md

- 目的: GitHub Environmentsを使用してステージング・本番環境を設定します。環境変数管理、承認フロー、デプロイ履歴記録を構成します。
- 引数: なし
- model: sonnet
- トリガーキーワード: environment, staging, production, deployment setup

### .claude/commands/ai/setup-docker.md

- 目的: Dockerコンテナ化の設定を作成します。 Dockerfile、docker-compose.yml、マルチステージビルド、ベストプラクティスを適用します。
- 引数: service-name
- model: sonnet
- トリガーキーワード: docker, container, dockerfile, docker-compose

### .claude/commands/ai/deploy-staging.md

- 目的: ステージング環境へのデプロイを実行します。ビルド → テスト → デプロイ → ヘルスチェックのフローを自動化します。
- 引数: [--dry-run]
- model: sonnet
- トリガーキーワード: deploy staging, staging deployment

### .claude/commands/ai/deploy-production.md

- 目的: 本番環境への安全なデプロイを実行します。承認フロー → ビルド → テスト → デプロイ → 監視の厳格なフローを適用します。
- 引数: なし
- model: opus
- トリガーキーワード: deploy production, production deployment

## 11. ドキュメント

### .claude/commands/ai/generate-api-docs.md

- 目的: API仕様書(OpenAPI 3.x)とSwagger UIの自動生成。ソースコードから開発者向けAPI仕様書を作成し、インタラクティブなドキュメントを構築します。
- 引数: [source-path]
- model: sonnet
- トリガーキーワード: api, documentation, openapi, swagger, endpoint

### .claude/commands/ai/write-user-manual.md

- 目的: ユーザー中心のマニュアル・チュートリアルの作成。エンドユーザーが「やりたいこと」を達成できるドキュメントを作成します。
- 引数: [target-audience]
- model: sonnet
- トリガーキーワード: manual, tutorial, guide, user, documentation

### .claude/commands/ai/create-troubleshooting-guide.md

- 目的: トラブルシューティングガイドとFAQの作成。症状別の診断フローと解決策を提示し、ユーザーの自己解決率を向上させます。
- 引数: なし
- model: sonnet
- トリガーキーワード: troubleshooting, faq, error, problem, issue

### .claude/commands/ai/generate-changelog.md

- 目的: Git履歴からCHANGELOG.mdを自動生成。バージョン範囲を指定してリリースノートを作成し、変更をグループ化します。
- 引数: [from-tag] [to-tag]
- model: sonnet
- トリガーキーワード: changelog, release notes, version, git history

### .claude/commands/ai/update-readme.md

- 目的: README.mdの更新と保守。プロジェクト概要、セットアップ手順、機能説明を最新の状態に保ちます。
- 引数: なし
- model: sonnet
- トリガーキーワード: readme, project overview, documentation

## 12. 運用・監視

### .claude/commands/ai/setup-logging.md

- 目的: 構造化ロギングシステムの設計と実装。 JSON形式ログ、相関ID、ログレベル管理を含む堅牢なロギング基盤を構築します。
- 引数: [log-level]
- model: sonnet
- トリガーキーワード: logging, log, json, structured, correlation id

### .claude/commands/ai/setup-monitoring.md

- 目的: 監視・アラートシステムの設計と設定。 SLO/SLI定義、ダッシュボード構築、アラートルール設定を含む包括的な監視基盤を構築します。
- 引数: [service-name]
- model: sonnet
- トリガーキーワード: monitoring, alert, slo, sli, dashboard, observability

### .claude/commands/ai/setup-local-agent.md

- 目的: ローカルエージェント（ファイル監視）のセットアップ。 Chokidarによるファイル監視、PM2プロセス管理、クラウドAPI連携を構築します。
- 引数: なし
- model: sonnet
- トリガーキーワード: local agent, file watching, chokidar, pm2, local sync

### .claude/commands/ai/manage-dependencies.md

- 目的: 依存パッケージの管理・更新・セキュリティ監査。セマンティックバージョニング、脆弱性検出、段階的アップグレードを実施します。
- 引数: [--upgrade-strategy]
- model: sonnet
- トリガーキーワード: dependencies, package, update, security, audit, vulnerability

## 13. Claude Code 環境

### .claude/commands/ai/create-agent-command-skill.md

- 目的: エージェント、コマンド、スキルを統合的に作成する高度なメタコマンド。プロジェクト全体の一貫性を保ちながら、相互に連携する3つのコンポーネントを同時に設計・生成します。
- 引数: [domain-name]
- model: opus
- トリガーキーワード: agent-command-skill, エージェント・コマンド・スキル作成, 統合作成, システム構築, 専門分野追加

### .claude/commands/ai/create-agent.md

- 目的: 新しいClaude Codeエージェント（.claude/agents/\*.md）を作成する専門コマンド。
- 引数: [agent-name] [specialty]
- model: opus
- トリガーキーワード: agent, エージェント, meta-agent, ペルソナ設計, マルチエージェント

### .claude/commands/ai/create-skill.md

- 目的: 新しいClaude Codeスキル（.claude/skills/\*/SKILL.md）を作成する専門コマンド。 skill-librarian エージェントを起動し、SECIモデル（暗黙知→形式知変換）に基づいた Progressive Disclosure方式の実運用レベルのスキルファイルを生成します。
- 引数: [skill-name]
- model: opus
- トリガーキーワード: skill, スキル作成, 知識体系化, ベストプラクティス, 形式知化

### .claude/commands/ai/create-command.md

- 目的: 新しいスラッシュコマンド（.claude/commands/\*.md）を作成する専門コマンド。
- 引数: [command-name]
- model: sonnet
- トリガーキーワード: command, slash-command, コマンド作成, workflow, 自動化

### .claude/commands/ai/setup-hooks.md

- 目的: Claude Code hooksの設定を行う専門コマンド。
- 引数: [hook-type]
- model: sonnet
- トリガーキーワード: hooks, git hooks, claude code hooks, 自動化, lint, format, validation

### .claude/commands/ai/setup-mcp.md

- 目的: MCPサーバーの統合設定を行う専門コマンド。
- 引数: [mcp-server-name]
- model: sonnet
- トリガーキーワード: mcp, mcp server, tool integration, context7, sequential, playwright, ツール統合

### .claude/commands/ai/optimize-context.md

- 目的: コンテキスト使用量の最適化を行う専門コマンド。
- 引数: なし
- model: opus
- トリガーキーワード: optimize, context, token, コンテキスト最適化, トークン削減, Progressive Disclosure

## 14. 統合ワークフロー

### .claude/commands/ai/full-feature-development.md

- 目的: 機能の完全な開発サイクルを実行する包括的なワークフローコマンド。
- 引数: [feature-name]
- model: opus
- トリガーキーワード: full feature, complete development, 機能開発, TDD, end-to-end, 完全開発サイクル

### .claude/commands/ai/create-full-stack-app.md

- 目的: フルスタックアプリケーション（Next.js App Router）の構築を行う包括的なコマンド。
- 引数: [app-name] [--features]
- model: opus
- トリガーキーワード: full stack, nextjs app, フルスタック, アプリケーション構築, end-to-end

### .claude/commands/ai/prepare-release.md

- 目的: リリース準備の完全自動化を行うコマンド。
- 引数: [version]
- model: sonnet
- トリガーキーワード: release, リリース準備, deploy preparation, 本番デプロイ, quality gate

### .claude/commands/ai/code-review-complete.md

- 目的: 包括的なコードレビューを実施するコマンド。
- 引数: [target-path]
- model: opus
- トリガーキーワード: code review, レビュー, 品質チェック, アーキテクチャレビュー, comprehensive review

### .claude/commands/ai/onboard-developer.md

- 目的: 新規開発者のオンボーディングガイドを生成するコマンド。
- 引数: [developer-role]
- model: sonnet
- トリガーキーワード: onboarding, オンボーディング, 新規開発者, developer guide, getting started

## 15. Git・バージョン管理

### .claude/commands/ai/commit.md

- 目的: Conventional Commitsに準拠したGitコミットを自動生成・実行するシンプルなコマンド。
- 引数: [commit-message]
- model: sonnet
- トリガーキーワード: commit, git commit, conventional commits, コミット作成, 変更コミット

### .claude/commands/ai/create-pr.md

- 目的: GitHub Pull Requestを自動作成するコマンド。
- 引数: [base-branch]
- model: sonnet
- トリガーキーワード: pull request, pr, create pr, プルリクエスト作成, レビュー依頼

### .claude/commands/ai/merge-pr.md

- 目的: GitHub Pull Requestのマージを安全に実行するシンプルなコマンド。
- 引数: [pr-number]
- model: sonnet
- トリガーキーワード: merge pr, pull request merge, マージ, PR承認, レビュー完了

### .claude/commands/ai/tag-release.md

- 目的: Gitリリースタグとリリースノートを作成するコマンド。
- 引数: [version]
- model: sonnet
- トリガーキーワード: release tag, git tag, リリースタグ, バージョンタグ, リリースノート

## 16. パッケージ・依存関係

### .claude/commands/ai/add-dependency.md

- 目的: 新しい依存パッケージを安全に追加するコマンド。
- 引数: [package-name] [--dev]
- model: sonnet
- トリガーキーワード: add package, install dependency, 依存関係追加, パッケージインストール, ライブラリ追加

### .claude/commands/ai/update-dependencies.md

- 目的: 依存パッケージを一括更新するコマンド。
- 引数: [strategy]
- model: sonnet
- トリガーキーワード: update dependencies, upgrade packages, 依存関係更新, パッケージアップグレード

### .claude/commands/ai/audit-dependencies.md

- 目的: 依存関係の脆弱性監査を実行するコマンド。
- 引数: なし
- model: sonnet
- トリガーキーワード: audit dependencies, security scan, 脆弱性監査, セキュリティチェック

## 17. 環境設定・設定ファイル

### .claude/commands/ai/create-env-file.md

- 目的: .env.exampleファイルの作成・更新を行うコマンド。
- 引数: なし
- model: sonnet
- トリガーキーワード: env file, environment variables, .env.example, 環境変数, 設定ファイル

### .claude/commands/ai/setup-eslint.md

- 目的: ESLint設定の最適化を行うコマンド。
- 引数: [style-guide]
- model: sonnet
- トリガーキーワード: eslint, linting, code style, コードスタイル, 静的解析

### .claude/commands/ai/setup-prettier.md

- 目的: Prettier設定を行うコマンド。
- 引数: なし
- model: sonnet
- トリガーキーワード: prettier, code format, フォーマット, 整形

### .claude/commands/ai/setup-typescript.md

- 目的: TypeScript設定の最適化を行うコマンド。
- 引数: [strictness]
- model: sonnet
- トリガーキーワード: typescript, tsconfig, 型チェック, 型安全性

## 18. メンテナンス・最適化

### .claude/commands/ai/clean-codebase.md

- 目的: 未使用コード・ファイルの削除を行うコマンド。
- 引数: [--dry-run]
- model: sonnet
- トリガーキーワード: clean code, dead code, unused files, コードクリーンアップ, 未使用コード削除

### .claude/commands/ai/update-all-docs.md

- 目的: 全ドキュメントの一括更新を行うコマンド。
- 引数: なし
- model: sonnet
- トリガーキーワード: update docs, documentation, ドキュメント更新, 仕様書更新

### .claude/commands/ai/analyze-performance.md

- 目的: パフォーマンス分析とボトルネック特定を行うコマンド。
- 引数: [target]
- model: opus
- トリガーキーワード: performance, analyze performance, パフォーマンス分析, ボトルネック

### .claude/commands/ai/migrate-to-latest.md

- 目的: フレームワーク・ライブラリの最新版移行を行うコマンド。
- 引数: [library-name]
- model: opus
- トリガーキーワード: migrate, upgrade library, マイグレーション, アップグレード, 最新版移行

## 19. トラブルシューティング・デバッグ

### .claude/commands/ai/debug-error.md

- 目的: エラーのデバッグと原因特定を行うコマンド。
- 引数: [error-message]
- model: opus
- トリガーキーワード: debug, error analysis, エラー調査, デバッグ, 原因特定

### .claude/commands/ai/fix-build-error.md

- 目的: ビルドエラーの修正を行うコマンド。
- 引数: なし
- model: opus
- トリガーキーワード: build error, ビルドエラー, コンパイルエラー

### .claude/commands/ai/fix-type-errors.md

- 目的: TypeScript型エラーの修正を行うコマンド。
- 引数: [file-path]
- model: opus
- トリガーキーワード: type error, 型エラー, TypeScript エラー

### .claude/commands/ai/diagnose-performance-issue.md

- 目的: パフォーマンス問題の診断を行うコマンド。
- 引数: [symptom]
- model: opus
- トリガーキーワード: performance issue, slow, パフォーマンス問題, 遅い

## 20. チーム・コラボレーション

### .claude/commands/ai/sync-team-standards.md

- 目的: チームコーディング規約の同期を行うコマンド。
- 引数: なし
- model: sonnet
- トリガーキーワード: team standards, coding standards, チーム規約, コーディング規約

### .claude/commands/ai/create-workflow-template.md

- 目的: GitHub Actionsワークフローテンプレートを作成するコマンド。
- 引数: [workflow-name]
- model: sonnet
- トリガーキーワード: workflow template, GitHub Actions, CI/CD テンプレート

## 21. Electron デスクトップアプリ開発

### .claude/commands/ai/design-electron-app.md

- 目的: Electronデスクトップアプリケーションのアーキテクチャ設計を行う専門コマンド。
- 引数: [app-name]
- model: opus
- トリガーキーワード: electron, デスクトップアプリ, architecture, 設計, main process, renderer

### .claude/commands/ai/create-electron-window.md

- 目的: ElectronアプリケーションのウィンドウとネイティブUI要素を実装する専門コマンド。
- 引数: [window-type]
- model: sonnet
- トリガーキーワード: electron, window, menu, dialog, tray, titlebar, ウィンドウ

### .claude/commands/ai/secure-electron-app.md

- 目的: Electronアプリケーションのセキュリティ強化を行う専門コマンド。
- 引数: [scope]
- model: opus
- トリガーキーワード: electron, security, セキュリティ, csp, sandbox, 脆弱性

### .claude/commands/ai/build-electron-app.md

- 目的: Electronアプリケーションのビルド・パッケージング設定を行う専門コマンド。
- 引数: [platform]
- model: sonnet
- トリガーキーワード: electron, build, package, installer, dmg, nsis, appimage

### .claude/commands/ai/setup-electron-updater.md

- 目的: Electron自動更新システム構築（electron-updater）
- 引数: [--provider github|s3|generic]
- model: sonnet
- トリガーキーワード: electron updater, auto update, electron-updater, update provider, 自動更新, アップデート, 配布

### .claude/commands/ai/release-electron-app.md

- 目的: Electronアプリケーションの配布・自動更新設定を行う専門コマンド。
- 引数: [action]
- model: sonnet
- トリガーキーワード: electron, release, update, 自動更新, 配布, publish
