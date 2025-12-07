# 全コマンドリスト

全エージェントとそのスキルを最大限活用するための包括的なコマンドリストです。
各コマンドには設定可能な要素(引数、model 等)を明記しています。

---

## 1. プロジェクト初期化・セットアップ

### /ai:init-project

- 目的: 新規プロジェクト初期化（ビジョン → 要件 → アーキテクチャ）
- 引数: [project-name] - プロジェクト名（オプション）
- model: opus
- トリガーキーワード: init, initialize, setup, new project, 新規プロジェクト, 初期化

### /ai:scaffold-project

- 目的: ハイブリッドアーキテクチャの完全な構造生成
- 引数: [template-type] - テンプレート種類（オプション）
- model: sonnet
- トリガーキーワード: scaffold, structure, ディレクトリ構造, 雛形生成

### /ai:setup-dev-env

- 目的: プロジェクト開発環境のセットアップ
- 引数: なし
- model: sonnet
- トリガーキーワード: setup, environment, dev-env, 開発環境, 初期化, pnpm, railway

### /ai:init-git-workflow

- 目的: Git ワークフローとブランチ戦略の確立
- 引数: [strategy] - ブランチ戦略（オプション）
- model: sonnet
- トリガーキーワード: git, workflow, hooks, ブランチ戦略, Git Hooks

---

## 2. 要件定義・仕様策定

### /ai:gather-requirements

- 目的: ステークホルダーヒアリングと要件整理
- 引数: [stakeholder-name] - ステークホルダー名（オプション）
- model: opus
- トリガーキーワード: requirements, stakeholder, ヒアリング, 要件整理, インタビュー, 仕様駆動

### /ai:create-user-stories

- 目的: ユーザーストーリーとアクセプタンスクライテリアの作成
- 引数: [feature-name] - 機能名（オプション、未指定時はインタラクティブ）
- model: opus
- トリガーキーワード: user stories, acceptance criteria, ユーザーストーリー, 受け入れ基準

### /ai:define-use-cases

- 目的: ユースケース図とシナリオの作成
- 引数: [actor-name] - アクター名（オプション、未指定時はインタラクティブ）
- model: sonnet
- トリガーキーワード: use case, ユースケース, アクター, シナリオ

### /ai:write-spec

- 目的: 実装可能な詳細仕様書の作成（TDD 準拠、テストケース定義を含む）
- 引数: [feature-name] - 機能名（オプション、未指定時はインタラクティブ）
- model: sonnet
- トリガーキーワード: specification, spec, 仕様書, 詳細仕様, 実装仕様

### /ai:estimate-project

- 目的: プロジェクト規模の見積もりと予測可能な計画の策定
- 引数: なし（プロジェクトドキュメントから自動収集）
- model: opus
- トリガーキーワード: estimate, estimation, 見積もり, 規模, ストーリーポイント, ベロシティ, リリース予測

---

## 3. 設計・アーキテクチャ

### /ai:design-architecture

- 目的: システム全体のアーキテクチャ設計（ハイブリッド構造準拠）
- 引数: [architecture-style] - アーキテクチャスタイル(clean/hexagonal/onion)、未指定時はプロジェクト要件から自動選択
- model: opus
- トリガーキーワード: architecture, design, アーキテクチャ, システム設計, clean architecture, DDD

### /ai:review-architecture

- 目的: 既存プロジェクトのアーキテクチャを分析し、Clean Architecture 原則違反、SOLID 原則遵守状況、循環依存、コードスメルを検出
- 引数: [scope] - 分析スコープ（オプション、デフォルトはsrc/全体）
- model: sonnet
- トリガーキーワード: architecture review, アーキテクチャレビュー, 依存関係, SOLID, clean architecture, コードスメル

### /ai:design-domain-model

- 目的: ドメイン駆動設計（DDD）に基づくドメインモデルの設計
- 引数: [domain-name] - ドメイン名（オプション、未指定時はインタラクティブ）
- model: opus
- トリガーキーワード: domain, DDD, entity, value object, aggregate, ドメインモデル, エンティティ, 値オブジェクト, ユビキタス言語

### /ai:design-api

- 目的: REST API 設計と OpenAPI 3.x 仕様書の作成（エンドポイント定義、認証設計、スキーマ生成）
- 引数: [resource-name] - リソース名（オプション、未指定時はインタラクティブ）
- model: sonnet
- トリガーキーワード: api, design, endpoint, openapi, swagger, REST, エンドポイント設計, API 仕様書

### /ai:design-database

- 目的: データベーススキーマ設計（Drizzle ORM + Turso SQLite 準拠）
- 引数: [table-name] - テーブル名（オプション、未指定時は全スキーマ設計）
- model: opus
- トリガーキーワード: database design, schema, table, ER diagram, データベース設計, スキーマ, テーブル, 正規化

---

## 4. フロントエンド開発

### /ai:create-component

- 目的: React コンポーネント（Atomic Design 準拠）の作成
- 引数: [component-name] [type] - コンポーネント名と種類(atom/molecule/organism)
- model: sonnet
- トリガーキーワード: component, ui, react, atomic-design, アクセシビリティ

### /ai:create-page

- 目的: Next.js App Router のページ（page.tsx）を作成（Server Components 優先、パフォーマンス最適化、Metadata API 統合）
- 引数: [route-path] - ルートパス（必須、例: /dashboard, /products/[id], /settings/profile）
- model: sonnet
- トリガーキーワード: page, route, Next.js, App Router, ページ作成

### /ai:setup-state-management

- 目的: React 状態管理ライブラリ（SWR/React Query）の完全セットアップと実装
- 引数: [library] - ライブラリ(swr/react-query)、未指定時は要件分析に基づき推奨
- model: sonnet
- トリガーキーワード: state management, data fetching, SWR, React Query, hooks, 状態管理

### /ai:create-custom-hook

- 目的: 再利用可能な React カスタムフックを設計・実装（TDD 準拠、ハイブリッド構造対応）
- 引数: [hook-name] - フック名（オプション、use〜形式推奨、未指定時はインタラクティブ）
- model: sonnet
- トリガーキーワード: custom hook, use〜, カスタムフック, ロジック抽出, 再利用

### /ai:setup-design-system

- 目的: デザインシステム基盤と Tailwind CSS 設定の完全セットアップ（デザイントークン体系、Tailwind 設定、コンポーネント規約の統合構築）
- 引数: なし（インタラクティブ設定推奨）
- model: sonnet
- トリガーキーワード: design-system, tailwind, デザイントークン, スタイル設定, UI 基盤

### /ai:optimize-frontend-performance

- 目的: Next.js フロントエンドのパフォーマンス最適化（Core Web Vitals 改善）
- 引数: [target-page] - 対象ページパス（オプション、未指定時は全体最適化）
- model: sonnet
- トリガーキーワード: performance, optimize, frontend, パフォーマンス, 最適化, LCP, Core Web Vitals

---

## 5. バックエンド開発

### /ai:create-entity

- 目的: ドメインエンティティの作成（DDD 準拠）
- 引数: [entity-name] - エンティティ名（オプション、未指定時はインタラクティブ）
- model: sonnet
- トリガーキーワード: entity, domain, ドメインエンティティ, DDD

### /ai:create-executor

- 目的: 新しいワークフロー機能の Executor 実装作成（src/features/[workflow-name]/executor.ts）
- 引数: [workflow-name] - ワークフロー名（オプション、未指定時はインタラクティブ）
- model: opus
- トリガーキーワード: executor, workflow, ビジネスロジック, 機能実装, TDD

### /ai:implement-business-logic

- 目的: ビジネスロジック実装（TDD 準拠の Executor クラス実装）
- 引数: [logic-name] - ロジック名（例: youtube-summarize, meeting-transcribe）
- model: opus

- トリガーキーワード: business logic, executor, implement, 実装, ビジネスロジック, TDD

### /ai:create-api-gateway

- 目的: 外部 API 統合ゲートウェイの実装（Discord、Slack、OpenAI 等）
- 引数: [api-name] - API 名（例: discord, slack, openai, stripe）
- model: opus
- トリガーキーワード: api, gateway, integration, 外部連携, Discord, Slack, OpenAI

### /ai:create-schema

- 目的: Zod スキーマ定義の作成（Zod 3.x + TypeScript 5.x 準拠）
- 引数: [schema-name] - スキーマ名（例: user, auth/login-request）（オプション、未指定時はインタラクティブ）
- model: sonnet
- トリガーキーワード: schema, zod, validation, バリデーション, スキーマ, 型定義, input validation

### /ai:optimize-prompts

- 目的: AI プロンプトの最適化
- 引数: [prompt-file] - プロンプトファイルパス（オプション、未指定時は対話形式）
- model: opus
- トリガーキーワード: prompt, AI, optimization, hallucination, few-shot, chain-of-thought

---

## 6. データベース

### /ai:create-db-schema

- 目的: Drizzle ORM スキーマの作成
- 引数: [table-name] - テーブル名（オプション、未指定時は対話形式）
- model: sonnet
- トリガーキーワード: schema, database, table, Drizzle, normalization, JSON

### /ai:create-migration

- 目的: データベースマイグレーションファイル作成
- 引数: [migration-name] - マイグレーション名（オプション、未指定時は対話形式）
- model: sonnet
- トリガーキーワード: migration, schema-change, rollback, Up/Down, Drizzle

### /ai:optimize-queries

- 目的: データベースクエリの最適化
- 引数: [file-path] - 対象ファイルパス（オプション、未指定時は対話形式）
- model: sonnet
- トリガーキーワード: query, optimization, N+1, EXPLAIN, performance, slow-query

### /ai:setup-db-backup

- 目的: バックアップ・リカバリ戦略の設定
- 引数: [backup-schedule] - バックアップスケジュール(daily/hourly、未指定時は対話形式)
- model: sonnet
- トリガーキーワード: backup, recovery, disaster, PITR, RPO, RTO, restoration

### /ai:create-repository

- 目的: Repository パターン実装（インターフェース + 実装）
- 引数: [entity-name] - エンティティ名（オプション、未指定時はインタラクティブ）
- model: opus
- トリガーキーワード: repository, data access, データアクセス, CRUD, ORM

### /ai:seed-database

- 目的: データベース初期データ投入（開発・テスト・本番環境対応）
- 引数: [environment] - 環境(development/test/production、未指定時は development)
- model: sonnet
- トリガーキーワード: seed, seeding, 初期データ, テストデータ, マスターデータ

---

## 7. テスト

### /ai:generate-unit-tests

- 目的: ユニットテストの自動生成（TDD 原則・境界値分析）
- 引数: [target-file] - テスト対象ファイルパス（必須）
- model: opus
- トリガーキーワード: unit test, test generation, TDD, coverage, テスト作成

### /ai:generate-e2e-tests

- 目的: E2E テストシナリオの自動作成（Playwright・フレーキー防止）
- 引数: [user-flow] - ユーザーフロー名（必須）
- model: opus
- トリガーキーワード: e2e test, integration test, user flow, playwright, E2E テスト

### /ai:run-all-tests

- 目的: 全テストスイート（ユニット + E2E）の統合実行
- 引数: [--coverage] - カバレッジレポート生成フラグ（オプション）
- model: sonnet
- トリガーキーワード: run tests, all tests, test suite, CI, テスト実行

### /ai:tdd-cycle

- 目的: TDD サイクル（Red-Green-Refactor）の自動実行
- 引数: [feature-name] - 機能名（必須）
- model: sonnet
- トリガーキーワード: TDD, test-driven, red green refactor, テスト駆動

### /ai:create-test-fixtures

- 目的: テストデータ・フィクスチャの自動作成（型安全・並列実行対応）
- 引数: [fixture-type] - フィクスチャタイプ（user/post/product 等、必須）
- model: sonnet
- トリガーキーワード: fixture, test data, seeding, テストデータ, フィクスチャ

### /ai:fix-flaky-tests

- 目的: 不安定なテスト（フレーキーテスト）の検出と修正
- 引数: [test-file] - 対象テストファイルパス（必須）
- model: sonnet
- トリガーキーワード: flaky test, unstable test, 不安定なテスト, フレーキー

---

## 8. 品質管理

### /ai:lint

- 目的: ESLint によるコード品質チェック（自動修正オプション付き、構文エラー・Code Smells 検出）
- 引数: [--fix] - 自動修正フラグ(オプション)
- model: sonnet
- トリガーキーワード: lint, eslint, code check, コードチェック, 構文エラー, 静的解析

### /ai:format

- 目的: Prettier によるコードフォーマット（指定パターンまたは全体、一貫したスタイル保証）
- 引数: [target-pattern] - 対象パターン(src/\*_/_.ts 等、未指定時は全体)
- model: sonnet
- トリガーキーワード: format, prettier, フォーマット, 整形, code style

### /ai:analyze-code-quality

- 目的: コード品質の包括的分析（複雑度メトリクス、Code Smells、保守性評価）
- 引数: [directory] - 対象ディレクトリ（デフォルト: src/）
- model: sonnet
- トリガーキーワード: analyze, quality, metrics, complexity, 品質分析, メトリクス, 複雑度, 保守性

### /ai:setup-pre-commit

- 目的: Pre-commit hooks の完全設定（Husky + lint-staged 統合、コミット時品質ゲート）
- 引数: なし
- 起動エージェント:
- model: sonnet
- トリガーキーワード: pre-commit, git hooks, husky, lint-staged, 品質自動化, コミットフック

### /ai:refactor

- 目的: コードリファクタリング（Clean Code 原則適用、SOLID 原則準拠、テスト駆動）
- 引数: [target-file] - 対象ファイルパス（必須）
- model: sonnet
- トリガーキーワード: refactor, improve, clean code, リファクタリング, 改善, コード整理, SOLID

---

## 9. セキュリティ

### /ai:security-audit

- 目的: 包括的セキュリティ監査（OWASP Top 10 準拠、CVSS スコアリング）
- 引数: [scope] - スコープ(all/auth/api/database、デフォルト: all)
- model: opus
- トリガーキーワード: security audit, vulnerability, OWASP, セキュリティ監査, 脆弱性診断, penetration test

### /ai:setup-auth

- 目的: 認証・認可システムの完全実装（NextAuth.js/Passport.js、OAuth 2.0、RBAC）
- 引数: [provider] - 認証プロバイダー(github/google/credentials、デフォルト: credentials)
- model: sonnet
- トリガーキーワード: auth, authentication, authorization, OAuth, NextAuth, login, session, 認証, 認可

### /ai:scan-vulnerabilities

- 目的: 依存関係の脆弱性スキャン（npm audit、CVE 評価、修正優先順位付け）
- 引数: なし
- model: sonnet
- トリガーキーワード: vulnerability scan, pnpm audit, CVE, 脆弱性スキャン, dependency audit

### /ai:setup-rate-limiting

- 目的: レート制限の実装（Token Bucket/Sliding Window、DoS/ブルートフォース対策）
- 引数: [rate-limit] - レート制限値（例: 100/hour, 10/minute、デフォルト: 100/hour）
- model: sonnet
- トリガーキーワード: rate limit, throttle, DoS, brute force, レート制限, 流量制限, API 制限

### /ai:manage-secrets

- 目的: 機密情報の安全な管理（Git 混入防止、.env.example 生成、型安全なアクセス）
- 引数: なし
- model: sonnet
- トリガーキーワード: secrets, environment variables, API keys, credentials, 機密情報, シークレット管理, .env

### /ai:rotate-secrets

- 目的: API キー・シークレットのローテーション（手動実行必須、ロールバック対応）
- 引数: [secret-name] - シークレット名（例: OPENAI_API_KEY、DATABASE_PASSWORD）
- model: sonnet
- トリガーキーワード: rotate secrets, key rotation, secret rotation, シークレットローテーション, 鍵ローテーション, API キー更新

---

## 10. CI/CD・デプロイ

### /ai:create-ci-workflow

- 目的: CI(継続的インテグレーション)ワークフローの作成（テスト・Lint・ビルド）
- 引数: [workflow-type] - ワークフロータイプ(test/lint/build、オプション)
- model: sonnet
- トリガーキーワード: CI, continuous integration, workflow, GitHub Actions, テスト自動化

### /ai:create-cd-workflow

- 目的: CD(継続的デプロイ)ワークフローの作成（Railway 自動デプロイ統合）
- 引数: [environment] - 環境(staging/production、オプション)
- model: sonnet
- トリガーキーワード: CD, deploy, continuous deployment, Railway, デプロイ自動化

### /ai:create-reusable-workflow

- 目的: 再利用可能なワークフローの作成（モノレポ対応、パラメータ化）
- 引数: [workflow-name] - ワークフロー名（必須）
- model: sonnet
- トリガーキーワード: reusable workflow, template, モジュール化, 再利用

### /ai:create-composite-action

- 目的: カスタムコンポジットアクションの作成（複雑な処理の再利用）
- 引数: [action-name] - アクション名（必須）
- model: sonnet
- トリガーキーワード: composite action, custom action, アクション作成

### /ai:optimize-ci-performance

- 目的: CI/CD パイプラインの高速化（並列実行、キャッシュ最適化）
- 引数: [workflow-file] - 対象ワークフローファイル（オプション）
- model: sonnet
- トリガーキーワード: optimize, performance, 高速化, CI 最適化

### /ai:setup-deployment-environments

- 目的: GitHub Environments とステージング・本番環境の設定（承認フロー付き）
- 引数: なし
- model: sonnet
- トリガーキーワード: environments, staging, production, 承認フロー, デプロイ環境

### /ai:setup-docker

- 目的: Docker コンテナ化設定（Dockerfile、docker-compose.yml）
- 引数: [service-name] - サービス名（オプション）
- model: sonnet
- トリガーキーワード: Docker, container, コンテナ化, docker-compose

### /ai:deploy-staging

- 目的: ステージング環境への自動デプロイ（ドライラン対応）
- 引数: [--dry-run] - ドライランフラグ（オプション）
- model: sonnet
- トリガーキーワード: deploy staging, ステージングデプロイ, 検証環境

### /ai:deploy-production

- 目的: 本番環境への承認フロー付きデプロイ（手動承認必須、最高品質）
- 引数: なし
- model: opus
- トリガーキーワード: deploy production, 本番デプロイ, production release

---

## 11. ドキュメント

### /ai:generate-api-docs

- 目的: API 仕様書の自動生成
- 引数: [source-path] - ソースコードパス（オプション、デフォルト: src/app/api）
- model: sonnet

### /ai:write-user-manual

- 目的: ユーザー中心のマニュアル・チュートリアルの作成
- 引数: [target-audience] - 対象読者レベル(beginner/advanced/admin、オプション)
- model: sonnet

### /ai:create-troubleshooting-guide

- 目的: トラブルシューティングガイドと FAQ の作成
- 引数: なし
- model: sonnet

### /ai:generate-changelog

- 目的: Git 履歴から CHANGELOG.md を自動生成
- 引数: [from-tag] [to-tag] - バージョン範囲（オプション）
- model: sonnet

### /ai:update-readme

- 目的: README.md の更新と保守
- 引数: なし
- model: sonnet

---

## 12. 運用・監視

### /ai:setup-logging

- 目的: 構造化ロギングシステムの設計と実装
- 引数: [log-level] - デフォルトログレベル(debug/info/warn/error、オプション)
- model: sonnet

### /ai:setup-monitoring

- 目的: 監視・アラートシステムの設計と設定
- 引数: [service-name] - 監視対象サービス名（オプション）
- model: sonnet

### /ai:setup-local-agent

- 目的: ローカルエージェント（ファイル監視）のセットアップ
- 引数: なし
- model: sonnet

### /ai:manage-dependencies

- 目的: 依存パッケージの管理・更新・セキュリティ監査
- 引数: [--upgrade-strategy] - 更新戦略(patch/minor/major、オプション)
- model: sonnet

---

## 13. Claude Code 環境

### /ai:create-agent-command-skill

- 目的: エージェント、コマンド、スキルを統合的に作成する高度なメタコマンド
- 引数: [domain-name] - ドメイン名（オプション、未指定時はインタラクティブ）
- model: opus
- 使用シナリオ: 新しい専門分野の完全な統合、複雑なワークフローの自動化システム構築、マルチエージェント協調システムの新規構築、プロジェクト固有のベストプラクティス体系化

### /ai:create-agent

- 目的: 新しい Claude Code エージェント（.claude/agents/\*.md）の作成
- 引数: [agent-name] [specialty] - エージェント名と専門分野（両方オプション、未指定時はインタラクティブ）
- model: opus

### /ai:create-skill

- 目的: 新しい Claude Code スキル（.claude/skills/\*/SKILL.md）の作成
- 引数: [skill-name] - スキル名（オプション、未指定時はインタラクティブ）
- model: opus

### /ai:create-command

- 目的: 新しいスラッシュコマンド（.claude/commands/[機能]/\*.md）の作成
- 引数: [command-name] - コマンド名（オプション、未指定時はインタラクティブ）
- model: sonnet

### /ai:setup-hooks

- 目的: Claude Code hooks の設定
- 引数: [hook-type] - フックタイプ(PreToolUse/PostToolUse/Stop 等)
- model: sonnet

### /ai:setup-mcp

- 目的: MCP サーバーの統合設定
- 引数: [mcp-server-name] - MCP サーバー名
- model: sonnet

### /ai:optimize-context

- 目的: コンテキスト使用量の最適化
- 引数: なし
- model: opus

---

## 14. 統合ワークフロー

### /ai:full-feature-development

- 目的: 機能の完全な開発サイクル
- 引数: [feature-name] - 機能名
- model: opus

### /ai:create-full-stack-app

- 目的: フルスタックアプリケーションの構築
- 引数: [app-name] [--features] - アプリ名と機能リスト
- model: opus

### /ai:prepare-release

- 目的: リリース準備の完全自動化
- 引数: [version] - バージョン番号(semver 形式)
- model: sonnet

### /ai:code-review-complete

- 目的: 包括的なコードレビュー
- 引数: [target-path] - レビュー対象パス
- model: opus

### /ai:onboard-developer

- 目的: 新規開発者のオンボーディング
- 引数: [developer-role] - 開発者の役割(frontend/backend/fullstack)
- model: sonnet

---

## 15. Git・バージョン管理

### /ai:commit

- 目的: Conventional Commits に従ったコミット作成
- 引数: [commit-message] - コミットメッセージ(オプション、未指定時は自動生成)
- model: sonnet

### /ai:create-pr

- 目的: Pull Request 作成
- 引数: [base-branch] - ベースブランチ(デフォルト: main)
- model: sonnet

### /ai:merge-pr

- 目的: Pull Request のマージ
- 引数: [pr-number] - PR 番号
- model: sonnet

### /ai:tag-release

- 目的: リリースタグの作成
- 引数: [version] - バージョン番号(v1.0.0 形式)
- model: sonnet

---

## 16. パッケージ・依存関係

### /ai:add-dependency

- 目的: 新しい依存パッケージの追加
- 引数: [package-name] [--dev] - パッケージ名、devDependency フラグ
- model: sonnet

### /ai:update-dependencies

- 目的: 依存パッケージの一括更新
- 引数: [strategy] - 更新戦略(patch/minor/major/latest)
- model: sonnet

### /ai:audit-dependencies

- 目的: 依存関係の脆弱性監査
- 引数: なし
- model: sonnet

---

## 17. 環境設定・設定ファイル

### /ai:create-env-file

- 目的: .env.example の作成・更新
- 引数: なし
- model: sonnet

### /ai:setup-eslint

- 目的: ESLint 設定の最適化
- 引数: [style-guide] - スタイルガイド(airbnb/google/standard)
- model: sonnet

### /ai:setup-prettier

- 目的: Prettier 設定
- 引数: なし
- model: sonnet

### /ai:setup-typescript

- 目的: TypeScript 設定の最適化
- 引数: [strictness] - 厳格度(strict/moderate/loose)
- model: sonnet

---

## 18. メンテナンス・最適化

### /ai:clean-codebase

- 目的: 未使用コード・ファイルの削除
- 引数: [--dry-run] - ドライランフラグ
- model: sonnet

### /ai:update-all-docs

- 目的: 全ドキュメントの一括更新
- 引数: なし
- model: sonnet

### /ai:analyze-performance

- 目的: パフォーマンス分析とボトルネック特定
- 引数: [target] - 分析対象(frontend/backend/database)
- model: sonnet

### /ai:migrate-to-latest

- 目的: フレームワーク・ライブラリの最新版移行
- 引数: [library-name] - ライブラリ名
- model: opus

---

## 19. トラブルシューティング・デバッグ

### /ai:debug-error

- 目的: エラーのデバッグと原因特定
- 引数: [error-message] - エラーメッセージ
- model: opus

### /ai:fix-build-error

- 目的: ビルドエラーの修正
- 引数: なし
- model: sonnet

### /ai:fix-type-errors

- 目的: TypeScript エラーの修正
- 引数: [file-path] - 対象ファイル(オプション)
- model: sonnet

### /ai:diagnose-performance-issue

- 目的: パフォーマンス問題の診断
- 引数: [symptom] - 症状(slow-render/slow-query/memory-leak)
- model: opus

---

## 20. チーム・コラボレーション

### /ai:sync-team-standards

- 目的: チームコーディング規約の同期
- 引数: なし
- model: sonnet

### /ai:create-workflow-template

- 目的: チーム用ワークフローテンプレート作成
- 引数: [workflow-name] - ワークフロー名
- model: sonnet

### /ai:onboard-developer

- 目的: 新規開発者のオンボーディング
- 引数: [developer-role] - 役割(frontend/backend/fullstack)
- model: sonnet

---

## 21. Electron デスクトップアプリ開発

### /ai:design-electron-app

- 目的: Electronアプリケーションのアーキテクチャ設計（Main/Renderer/Preload分離、IPC設計）
- 引数: [app-name] - アプリケーション名（オプション）
- model: sonnet
- トリガーキーワード: electron, デスクトップアプリ, architecture, 設計, main process, renderer

### /ai:create-electron-window

- 目的: ElectronウィンドウとネイティブUI要素の実装（BrowserWindow、メニュー、トレイ）
- 引数: [window-type] - ウィンドウタイプ（main/settings/dialog/tray）
- model: sonnet
- トリガーキーワード: electron, window, menu, dialog, tray, titlebar, ウィンドウ

### /ai:secure-electron-app

- 目的: Electronアプリケーションのセキュリティ強化（サンドボックス、CSP、IPC安全性）
- 引数: [scope] - 監査スコープ（full/config/ipc/csp/deps）
- model: sonnet
- トリガーキーワード: electron, security, セキュリティ, csp, sandbox, 脆弱性

### /ai:build-electron-app

- 目的: Electronアプリケーションのビルド・パッケージング設定（electron-builder、コード署名）
- 引数: [platform] - 対象プラットフォーム（mac/win/linux/all）
- model: sonnet
- トリガーキーワード: electron, build, package, installer, dmg, nsis, appimage

### /ai:release-electron-app

- 目的: Electronアプリケーションの配布・自動更新設定（electron-updater、GitHub Releases）
- 引数: [action] - アクション（setup/publish/version）
- model: sonnet
- トリガーキーワード: electron, release, update, 自動更新, 配布, publish

---
