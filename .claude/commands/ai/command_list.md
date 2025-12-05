# 全コマンドリスト - 36 エージェント活用版（設定詳細版）

全エージェントとそのスキルを最大限活用するための包括的なコマンドリストです。
各コマンドには設定可能な要素(引数、model、allowed-tools 等)を明記しています。

---

---

## 1. プロジェクト初期化・セットアップ

### `/ai:init-project`

- **目的**: 新規プロジェクト初期化（ビジョン → 要件 → アーキテクチャ）
- **引数**: `[project-name]` - プロジェクト名（オプション）
- **使用エージェント**:
  - Phase 1: `.claude/agents/product-manager.md` - ゴール・ロードマップ
  - Phase 2: `.claude/agents/req-analyst.md` - 要件整理・受け入れ基準
  - Phase 3: `.claude/agents/arch-police.md` - アーキテクチャ方針
- **model**: opus
- **トリガーキーワード**: init, initialize, setup, new project, 新規プロジェクト, 初期化

### `/ai:scaffold-project`

- **目的**: ハイブリッドアーキテクチャの完全な構造生成
- **引数**: `[template-type]` - テンプレート種類（オプション）
- **使用エージェント**: なし（直接実行）
- **model**: sonnet
- **トリガーキーワード**: scaffold, structure, ディレクトリ構造, 雛形生成

### `/ai:setup-dev-env`

- **目的**: プロジェクト開発環境のセットアップ
- **引数**: なし
- **使用エージェント**:
  - Phase 1: `.claude/agents/dep-mgr.md` - pnpm 依存関係・基本設定
  - Phase 2: `.claude/agents/hook-master.md` - Hooks・品質ツール
  - Phase 3: `.claude/agents/devops-eng.md` - Docker・Railway・PM2
- **主要スキル**（各エージェントが参照）:
  - `.claude/skills/semantic-versioning/SKILL.md` - セマンティックバージョニング
  - `.claude/skills/lock-file-management/SKILL.md` - ロックファイル管理
  - `.claude/skills/monorepo-dependency-management/SKILL.md` - モノレポ依存管理
  - `.claude/skills/git-hooks-concepts/SKILL.md` - Git Hooks 基礎
  - `.claude/skills/claude-code-hooks/SKILL.md` - Claude Code Hooks
  - `.claude/skills/linting-formatting-automation/SKILL.md` - Lint・フォーマット自動化
  - `.claude/skills/docker-best-practices/SKILL.md` - Docker ベストプラクティス
  - `.claude/skills/infrastructure-as-code/SKILL.md` - IaC 原則
- **model**: sonnet
- **トリガーキーワード**: setup, environment, dev-env, 開発環境, 初期化, pnpm, railway

### `/ai:init-git-workflow`

- **目的**: Git ワークフローとブランチ戦略の確立
- **引数**: `[strategy]` - ブランチ戦略（オプション）
- **使用エージェント**: `.claude/agents/hook-master.md` - Hooks 設計・実装
- **主要スキル**（各エージェントが参照）:
  - `.claude/skills/git-hooks-concepts/SKILL.md` - Git Hooks 基礎
  - `.claude/skills/claude-code-hooks/SKILL.md` - Claude Code Hooks
  - `.claude/skills/automation-scripting/SKILL.md` - 自動化スクリプト実装
  - `.claude/skills/linting-formatting-automation/SKILL.md` - Lint・フォーマット自動化
- **model**: sonnet
- **トリガーキーワード**: git, workflow, hooks, ブランチ戦略, Git Hooks

---

## 2. 要件定義・仕様策定

### `/ai:gather-requirements`

- **目的**: ステークホルダーヒアリングと要件整理
- **引数**: `[stakeholder-name]` - ステークホルダー名（オプション）
- **使用エージェント**: `.claude/agents/req-analyst.md` - 要件分析・整理
- **主要スキル**（各エージェントが参照）:
  - `.claude/skills/interview-techniques/SKILL.md` - ヒアリング手法
  - `.claude/skills/requirements-engineering/SKILL.md` - 要求工学
- **model**: opus
- **トリガーキーワード**: requirements, stakeholder, ヒアリング, 要件整理, インタビュー, 仕様駆動

### `/ai:create-user-stories`

- **目的**: ユーザーストーリーとアクセプタンスクライテリアの作成
- **引数**: `[feature-name]` - 機能名（オプション、未指定時はインタラクティブ）
- **使用エージェント**:
  - `.claude/agents/product-manager.md`
  - `.claude/agents/req-analyst.md`
- **スキル活用**:
  - **product-manager**: `.claude/skills/user-story-mapping/SKILL.md`（必須）, `.claude/skills/product-vision/SKILL.md`, `.claude/skills/prioritization-frameworks/SKILL.md`
  - **req-analyst**: `.claude/skills/acceptance-criteria-writing/SKILL.md`（必須）, `.claude/skills/requirements-triage/SKILL.md`, `.claude/skills/ambiguity-elimination/SKILL.md`

- **model**: opus

- **トリガーキーワード**: user stories, acceptance criteria, ユーザーストーリー, 受け入れ基準

### `/ai:define-use-cases`

- **目的**: ユースケース図とシナリオの作成
- **引数**: `[actor-name]` - アクター名（オプション、未指定時はインタラクティブ）
- **使用エージェント**: `.claude/agents/req-analyst.md`
- **スキル活用**: `.claude/skills/use-case-modeling/SKILL.md`（必須）, `.claude/skills/requirements-triage/SKILL.md`, `.claude/skills/functional-non-functional-requirements/SKILL.md`

- **model**: sonnet

- **トリガーキーワード**: use case, ユースケース, アクター, シナリオ

### `/ai:write-spec`

- **目的**: 実装可能な詳細仕様書の作成（TDD 準拠、テストケース定義を含む）
- **引数**: `[feature-name]` - 機能名（オプション、未指定時はインタラクティブ）
- **使用エージェント**: `.claude/agents/spec-writer.md`
- **スキル活用**: `.claude/skills/markdown-advanced-syntax/SKILL.md`（必須）, `.claude/skills/technical-documentation-standards/SKILL.md`（必須）, api-documentation-best-practices（API 仕様の場合）, progressive-disclosure（複雑仕様の場合）

- **model**: sonnet

- **トリガーキーワード**: specification, spec, 仕様書, 詳細仕様, 実装仕様

### `/ai:estimate-project`

- **目的**: プロジェクト規模の見積もりと予測可能な計画の策定
- **引数**: なし（プロジェクトドキュメントから自動収集）
- **使用エージェント**: `.claude/agents/product-manager.md`（Phase 1 で起動）
- **スキル活用**（フェーズ別）:
  - **Phase 1**: `.claude/skills/user-story-mapping/SKILL.md`, `.claude/skills/backlog-management/SKILL.md`
  - **Phase 2**: `.claude/skills/estimation-techniques/SKILL.md`（必須）, `.claude/skills/metrics-tracking/SKILL.md`（必須）
  - **Phase 3**: `.claude/skills/risk-management/SKILL.md`, `.claude/skills/prioritization-frameworks/SKILL.md`
  - **Phase 4**: `.claude/skills/stakeholder-communication/SKILL.md`

- **model**: opus

- **トリガーキーワード**: estimate, estimation, 見積もり, 規模, ストーリーポイント, ベロシティ, リリース予測

---

## 3. 設計・アーキテクチャ

### `/ai:design-architecture`

- **目的**: システム全体のアーキテクチャ設計（ハイブリッド構造準拠）
- **引数**: `[architecture-style]` - アーキテクチャスタイル(clean/hexagonal/onion)、未指定時はプロジェクト要件から自動選択
- **使用エージェント**:
  - `.claude/agents/arch-police.md`
  - `.claude/agents/domain-modeler.md`
- **スキル活用**（エージェントが必要時に参照）:
  - **arch-police**: `.claude/skills/clean-architecture-principles/SKILL.md`, `.claude/skills/architectural-patterns/SKILL.md`, `.claude/skills/solid-principles/SKILL.md`, `.claude/skills/dependency-analysis/SKILL.md`
  - **domain-modeler**: `.claude/skills/domain-driven-design/SKILL.md`, `.claude/skills/ubiquitous-language/SKILL.md`, `.claude/skills/bounded-context/SKILL.md`, `.claude/skills/value-object-patterns/SKILL.md`, `.claude/skills/domain-services/SKILL.md`

- **model**: opus

- **トリガーキーワード**: architecture, design, アーキテクチャ, システム設計, clean architecture, DDD

### `/ai:review-architecture`

- **目的**: 既存プロジェクトのアーキテクチャを分析し、Clean Architecture 原則違反、SOLID 原則遵守状況、循環依存、コードスメルを検出
- **引数**: `[scope]` - 分析スコープ（オプション、デフォルトは`src/`全体）
- **使用エージェント**:
  - `.claude/agents/arch-police.md`
- **スキル活用**:
  - **Phase 1（構造分析 - 必須）**:
    - `.claude/skills/clean-architecture-principles/SKILL.md`: 依存関係ルール、レイヤー構造、ハイブリッドアーキテクチャマッピング
    - `.claude/skills/dependency-analysis/SKILL.md`: 依存グラフ構築、循環依存検出、安定度メトリクス
  - **Phase 2（原則評価 - 必須）**:
    - `.claude/skills/solid-principles/SKILL.md`: SRP, OCP, LSP, ISP, DIP の評価基準と検出パターン
  - **Phase 3（品質分析 - 推奨）**:
    - `.claude/skills/code-smell-detection/SKILL.md`: クラス/メソッドスメル、アーキテクチャアンチパターン
    - `.claude/skills/architectural-patterns/SKILL.md`: Hexagonal, Onion, Vertical Slice パターン評価

- **model**: sonnet

- **トリガーキーワード**: architecture review, アーキテクチャレビュー, 依存関係, SOLID, clean architecture, コードスメル

### `/ai:design-domain-model`

- **目的**: ドメイン駆動設計（DDD）に基づくドメインモデルの設計
- **引数**: `[domain-name]` - ドメイン名（オプション、未指定時はインタラクティブ）
- **使用エージェント**: `.claude/agents/domain-modeler.md`
- **スキル活用**（エージェントが必要時に自動参照）:
  - **必須（Phase 1-2）**: `.claude/skills/domain-driven-design/SKILL.md`, `.claude/skills/ubiquitous-language/SKILL.md`, `.claude/skills/value-object-patterns/SKILL.md`
  - **推奨（Phase 3-4）**: `.claude/skills/domain-services/SKILL.md`, `.claude/skills/bounded-context/SKILL.md`

- **model**: opus

- **トリガーキーワード**: domain, DDD, entity, value object, aggregate, ドメインモデル, エンティティ, 値オブジェクト, ユビキタス言語

### `/ai:design-api`

- **目的**: REST API 設計と OpenAPI 3.x 仕様書の作成（エンドポイント定義、認証設計、スキーマ生成）
- **引数**: `[resource-name]` - リソース名（オプション、未指定時はインタラクティブ）
- **使用エージェント**:
  - `.claude/agents/gateway-dev.md`
  - `.claude/agents/api-doc-writer.md`
- **スキル活用**（エージェントが必要時に参照）:
  - **gateway-dev**: `.claude/skills/api-client-patterns/SKILL.md`, `.claude/skills/http-best-practices/SKILL.md`
  - **api-doc-writer**: `.claude/skills/openapi-specification/SKILL.md`, `.claude/skills/swagger-ui/SKILL.md`, `.claude/skills/api-documentation-best-practices/SKILL.md`, `.claude/skills/request-response-examples/SKILL.md`

- **model**: sonnet

- **トリガーキーワード**: api, design, endpoint, openapi, swagger, REST, エンドポイント設計, API 仕様書

### `/ai:design-database`

- **目的**: データベーススキーマ設計（Drizzle ORM + Turso SQLite 準拠）
- **引数**: `[table-name]` - テーブル名（オプション、未指定時は全スキーマ設計）
- **使用エージェント**: `.claude/agents/db-architect.md`
- **スキル活用**（フェーズ別、エージェントが必要時に参照）:
  - **Phase 1（要件理解時）**: なし（既存スキーマ分析のみ）
  - **Phase 2（スキーマ設計時）**: `.claude/skills/database-normalization/SKILL.md`（必須）, `.claude/skills/json-optimization/SKILL.md`（JSON 使用時）
  - **Phase 3（インデックス設計時）**: `.claude/skills/indexing-strategies/SKILL.md`（必須）
  - **Phase 4（制約設計時）**: `.claude/skills/foreign-key-constraints/SKILL.md`（必須）, `.claude/skills/transaction-management/SKILL.md`（必要時）
  - **Phase 5（検証時）**: `.claude/skills/sql-anti-patterns/SKILL.md`（必須）, `.claude/skills/database-migrations/SKILL.md`（マイグレーション実行時）

- **model**: opus

- **トリガーキーワード**: database design, schema, table, ER diagram, データベース設計, スキーマ, テーブル, 正規化

---

## 4. フロントエンド開発

### `/ai:create-component`

- **目的**: React コンポーネント（Atomic Design 準拠）の作成
- **引数**: `[component-name] [type]` - コンポーネント名と種類(atom/molecule/organism)
- **使用エージェント**: `.claude/agents/ui-designer.md`
- **スキル活用**（ui-designer が必要時に参照）:
  - **必須（Phase 1-2）**: `.claude/skills/design-system-architecture/SKILL.md`, `.claude/skills/component-composition-patterns/SKILL.md`, `.claude/skills/headless-ui-principles/SKILL.md`, `.claude/skills/tailwind-css-patterns/SKILL.md`
  - **必須（Phase 3）**: `.claude/skills/accessibility-wcag/SKILL.md`
  - **推奨（Apple 向け）**: `.claude/skills/apple-hig-guidelines/SKILL.md`

- **model**: sonnet

- **トリガーキーワード**: component, ui, react, atomic-design, アクセシビリティ

### `/ai:create-page`

- **目的**: Next.js App Router のページ（page.tsx）を作成（Server Components 優先、パフォーマンス最適化、Metadata API 統合）
- **引数**: `[route-path]` - ルートパス（必須、例: /dashboard, /products/[id], /settings/profile）
- **使用エージェント**: `.claude/agents/router-dev.md` - Next.js App Router 専門エージェント（Phase 2 で起動）
- **スキル活用**（フェーズ別、router-dev エージェントが必要時に参照）:
  - **Phase 1（ルーティング設計時）**: `.claude/skills/nextjs-app-router/SKILL.md`, `.claude/skills/server-components-patterns/SKILL.md`
  - **Phase 2（実装時）**: `.claude/skills/nextjs-app-router/SKILL.md`（必須）, `.claude/skills/server-components-patterns/SKILL.md`（必須）
  - **Phase 3（最適化時）**: `.claude/skills/seo-optimization/SKILL.md`（必要時）, `.claude/skills/web-performance/SKILL.md`（必要時）
  - **Phase 4（エラー対応時）**: `.claude/skills/error-boundary/SKILL.md`（必要時）, `.claude/skills/data-fetching-strategies/SKILL.md`（ローディング状態、必要時）

- **model**: sonnet

- **トリガーキーワード**: page, route, Next.js, App Router, ページ作成

### `/ai:setup-state-management`

- **目的**: React 状態管理ライブラリ（SWR/React Query）の完全セットアップと実装
- **引数**: `[library]` - ライブラリ(swr/react-query)、未指定時は要件分析に基づき推奨
- **使用エージェント**: `.claude/agents/state-manager.md`（Phase 2 で起動）
- **スキル活用**（フェーズ別、state-manager が必要時に参照）:
  - **Phase 1（分析時）**: `.claude/skills/react-hooks-advanced/SKILL.md`, `.claude/skills/data-fetching-strategies/SKILL.md`, `.claude/skills/state-lifting/SKILL.md`
  - **Phase 2（設計時）**: `.claude/skills/data-fetching-strategies/SKILL.md`（必須）, `.claude/skills/custom-hooks-patterns/SKILL.md`（必須）
  - **Phase 3（実装時）**: `.claude/skills/custom-hooks-patterns/SKILL.md`（必須）, `.claude/skills/react-hooks-advanced/SKILL.md`（必須）
  - **Phase 4（エラー処理時）**: `.claude/skills/error-boundary/SKILL.md`, data-fetching-strategies（非同期エラー）
  - **Phase 5（最適化時）**: performance-optimization-react（必要時）

- **model**: sonnet

- **トリガーキーワード**: state management, data fetching, SWR, React Query, hooks, 状態管理

### `/ai:create-custom-hook`

- **目的**: 再利用可能な React カスタムフックを設計・実装（TDD 準拠、ハイブリッド構造対応）
- **引数**: `[hook-name]` - フック名（オプション、use〜形式推奨、未指定時はインタラクティブ）
- **使用エージェント**:
  - `.claude/agents/state-manager.md`
- **スキル活用**（state-manager エージェントが必要時に参照）:
  - **Phase 1（分析時）**: `.claude/skills/custom-hooks-patterns/SKILL.md`（必須）, `.claude/skills/react-hooks-advanced/SKILL.md`
  - **Phase 2（設計時）**: `.claude/skills/custom-hooks-patterns/SKILL.md`（必須）, `.claude/skills/state-lifting/SKILL.md`
  - **Phase 3（実装時）**: `.claude/skills/custom-hooks-patterns/SKILL.md`（必須）, `.claude/skills/react-hooks-advanced/SKILL.md`
  - **Phase 4（テスト時）**: `.claude/skills/custom-hooks-patterns/SKILL.md`（必須）

- **model**: sonnet

- **トリガーキーワード**: custom hook, use〜, カスタムフック, ロジック抽出, 再利用

### `/ai:setup-design-system`

- **目的**: デザインシステム基盤と Tailwind CSS 設定の完全セットアップ（デザイントークン体系、Tailwind 設定、コンポーネント規約の統合構築）
- **引数**: なし（インタラクティブ設定推奨）
- **使用エージェント**: `.claude/agents/ui-designer.md`（UI 設計・デザインシステム専門エージェント）
- **スキル活用**（ui-designer エージェントが必要時に参照）:
  - **デザインシステム基盤（必須）**: `.claude/skills/design-system-architecture/SKILL.md`（デザイントークン管理、3 層モデル）、`.claude/skills/tailwind-css-patterns/SKILL.md`（Tailwind 設定、CVA、ダークモード）
  - **コンポーネント設計（推奨）**: `.claude/skills/component-composition-patterns/SKILL.md`、`.claude/skills/headless-ui-principles/SKILL.md`
  - **品質（必須）**: `.claude/skills/accessibility-wcag/SKILL.md`（WCAG 2.1 AA 準拠）、`.claude/skills/apple-hig-guidelines/SKILL.md`（Apple 向け製品の場合）

- **model**: sonnet

- **トリガーキーワード**: design-system, tailwind, デザイントークン, スタイル設定, UI 基盤

### `/ai:optimize-frontend-performance`

- **目的**: Next.js フロントエンドのパフォーマンス最適化（Core Web Vitals 改善）
- **引数**: `[target-page]` - 対象ページパス（オプション、未指定時は全体最適化）
- **使用エージェント**:
  - `.claude/agents/router-dev.md`
- **スキル活用**（router-dev エージェントが必要時に参照）:
  - **Phase 1（分析時）**: `.claude/skills/web-performance/SKILL.md`（必須）
  - **Phase 2（最適化時）**: `.claude/skills/nextjs-app-router/SKILL.md`, `.claude/skills/server-components-patterns/SKILL.md`
  - **Phase 3（検証時）**: `.claude/skills/web-performance/SKILL.md`（必須）

- **model**: sonnet

- **トリガーキーワード**: performance, optimize, frontend, パフォーマンス, 最適化, LCP, Core Web Vitals

---

## 5. バックエンド開発

### `/ai:create-entity`

- **目的**: ドメインエンティティの作成（DDD 準拠）
- **引数**: `[entity-name]` - エンティティ名（オプション、未指定時はインタラクティブ）
- **使用エージェント**: `.claude/agents/domain-modeler.md`
- **スキル活用**（domain-modeler エージェントが必要時に自動参照）:
  - **Phase 1-2（必須）**: `.claude/skills/domain-driven-design/SKILL.md`, `.claude/skills/ubiquitous-language/SKILL.md`, `.claude/skills/value-object-patterns/SKILL.md`
  - **Phase 3（推奨）**: `.claude/skills/domain-services/SKILL.md`, `.claude/skills/bounded-context/SKILL.md`

- **model**: sonnet

- **トリガーキーワード**: entity, domain, ドメインエンティティ, DDD

### `/ai:create-executor`

- **目的**: 新しいワークフロー機能の Executor 実装作成（src/features/[workflow-name]/executor.ts）
- **引数**: `[workflow-name]` - ワークフロー名（オプション、未指定時はインタラクティブ）
- **使用エージェント**:
  - `.claude/agents/logic-dev.md`

- **model**: opus

- **トリガーキーワード**: executor, workflow, ビジネスロジック, 機能実装, TDD

### `/ai:implement-business-logic`

- **目的**: ビジネスロジック実装（TDD 準拠の Executor クラス実装）
- **引数**: `[logic-name]` - ロジック名（例: youtube-summarize, meeting-transcribe）
- **使用エージェント**: `.claude/agents/logic-dev.md`（ビジネスロジック実装専門）
- **スキル活用**（logic-dev エージェントがフェーズに応じて参照）:
  - **Phase 2（TDD 実装時）**:
    - `.claude/skills/tdd-red-green-refactor/SKILL.md`: Red-Green-Refactor サイクル
    - `.claude/skills/transaction-script/SKILL.md`: Executor パターン実装
    - `.claude/skills/test-doubles/SKILL.md`: テストダブル選択
  - **Phase 3（リファクタリング時）**:
    - `.claude/skills/refactoring-techniques/SKILL.md`: コードスメル検出・改善
    - `.claude/skills/clean-code-practices/SKILL.md`: 命名・関数設計

- **model**: opus

- **トリガーキーワード**: business logic, executor, implement, 実装, ビジネスロジック, TDD

### `/ai:create-api-gateway`

- **目的**: 外部 API 統合ゲートウェイの実装（Discord、Slack、OpenAI 等）
- **引数**: `[api-name]` - API 名（例: discord, slack, openai, stripe）
- **使用エージェント**: `.claude/agents/gateway-dev.md`
- **スキル活用**（gateway-dev エージェントが参照）:
  - Phase 2: `.claude/skills/api-client-patterns/SKILL.md`（Adapter、Facade、Anti-Corruption Layer）
  - Phase 3: `.claude/skills/http-best-practices/SKILL.md`（ステータスコード、べき等性）、`.claude/skills/authentication-flows/SKILL.md`（OAuth 2.0、JWT、API Key）
  - Phase 4: `.claude/skills/retry-strategies/SKILL.md`（Exponential Backoff、Circuit Breaker）、`.claude/skills/rate-limiting/SKILL.md`（429 処理、バックオフ戦略）

- **model**: opus

- **トリガーキーワード**: api, gateway, integration, 外部連携, Discord, Slack, OpenAI

### `/ai:create-schema`

- **目的**: Zod スキーマ定義の作成（Zod 3.x + TypeScript 5.x 準拠）
- **引数**: `[schema-name]` - スキーマ名（例: user, auth/login-request）（オプション、未指定時はインタラクティブ）
- **使用エージェント**:
  - `.claude/agents/schema-def.md`

- **model**: sonnet

- **トリガーキーワード**: schema, zod, validation, バリデーション, スキーマ, 型定義, input validation

### `/ai:optimize-prompts`

- **目的**: AI プロンプトの最適化
- **引数**: `[prompt-file]` - プロンプトファイルパス（オプション、未指定時は対話形式）
- **使用エージェント**:
  - `.claude/agents/prompt-eng.md`

- **model**: opus

- **トリガーキーワード**: prompt, AI, optimization, hallucination, few-shot, chain-of-thought

---

## 6. データベース

### `/ai:create-db-schema`

- **目的**: Drizzle ORM スキーマの作成
- **引数**: `[table-name]` - テーブル名（オプション、未指定時は対話形式）
- **使用エージェント**:
  - `.claude/agents/db-architect.md`

- **model**: sonnet

- **トリガーキーワード**: schema, database, table, Drizzle, normalization, JSON

### `/ai:create-migration`

- **目的**: データベースマイグレーションファイル作成
- **引数**: `[migration-name]` - マイグレーション名（オプション、未指定時は対話形式）
- **使用エージェント**:
  - `.claude/agents/dba-mgr.md`

- **model**: sonnet

- **トリガーキーワード**: migration, schema-change, rollback, Up/Down, Drizzle

### `/ai:optimize-queries`

- **目的**: データベースクエリの最適化
- **引数**: `[file-path]` - 対象ファイルパス（オプション、未指定時は対話形式）
- **使用エージェント**:
  - `.claude/agents/repo-dev.md`
  - `.claude/agents/dba-mgr.md`

- **model**: sonnet

- **トリガーキーワード**: query, optimization, N+1, EXPLAIN, performance, slow-query

### `/ai:setup-db-backup`

- **目的**: バックアップ・リカバリ戦略の設定
- **引数**: `[backup-schedule]` - バックアップスケジュール(daily/hourly、未指定時は対話形式)
- **使用エージェント**:
  - `.claude/agents/dba-mgr.md`

- **model**: sonnet

- **トリガーキーワード**: backup, recovery, disaster, PITR, RPO, RTO, restoration

### `/ai:create-repository`

- **目的**: Repository パターン実装（インターフェース + 実装）
- **引数**: `[entity-name]` - エンティティ名（オプション、未指定時はインタラクティブ）
- **使用エージェント**:
  - `.claude/agents/repo-dev.md`

- **model**: opus

- **トリガーキーワード**: repository, data access, データアクセス, CRUD, ORM

### `/ai:seed-database`

- **目的**: データベース初期データ投入（開発・テスト・本番環境対応）
- **引数**: `[environment]` - 環境(development/test/production、未指定時は development)
- **使用エージェント**:
  - `.claude/agents/dba-mgr.md`

- **スキル活用**:
  - **必須**: `.claude/skills/database-seeding/SKILL.md`（環境別 Seeding、べき等性、ファクトリパターン）
  - **推奨**: database-migrations（スキーマ確認）、test-data-management（テストデータ生成）

- **model**: sonnet

- **トリガーキーワード**: seed, seeding, 初期データ, テストデータ, マスターデータ

---

## 7. テスト

### `/ai:generate-unit-tests`

- **目的**: ユニットテストの自動生成（TDD 原則・境界値分析）
- **引数**: `[target-file]` - テスト対象ファイルパス（必須）
- **起動エージェント**:
  - `.claude/agents/unit-tester.md`

- **model**: opus

- **トリガーキーワード**: unit test, test generation, TDD, coverage, テスト作成

### `/ai:generate-e2e-tests`

- **目的**: E2E テストシナリオの自動作成（Playwright・フレーキー防止）
- **引数**: `[user-flow]` - ユーザーフロー名（必須）
- **起動エージェント**:
  - `.claude/agents/e2e-tester.md`

- **model**: opus

- **トリガーキーワード**: e2e test, integration test, user flow, playwright, E2E テスト

### `/ai:run-all-tests`

- **目的**: 全テストスイート（ユニット + E2E）の統合実行
- **引数**: `[--coverage]` - カバレッジレポート生成フラグ（オプション）
- **起動エージェント**:
  - `.claude/agents/unit-tester.md` - ユニットテスト実行とカバレッジ測定
  - `.claude/agents/e2e-tester.md`

- **model**: sonnet

- **トリガーキーワード**: run tests, all tests, test suite, CI, テスト実行

### `/ai:tdd-cycle`

- **目的**: TDD サイクル（Red-Green-Refactor）の自動実行
- **引数**: `[feature-name]` - 機能名（必須）
- **起動エージェント**:
  - `.claude/agents/unit-tester.md` - テストファースト実装（Red フェーズ）
  - `.claude/agents/logic-dev.md` - 最小実装とリファクタリング（Green/Refactor フェーズ）

- **model**: sonnet

- **トリガーキーワード**: TDD, test-driven, red green refactor, テスト駆動

### `/ai:create-test-fixtures`

- **目的**: テストデータ・フィクスチャの自動作成（型安全・並列実行対応）
- **引数**: `[fixture-type]` - フィクスチャタイプ（user/post/product 等、必須）
- **起動エージェント**:
  - `.claude/agents/unit-tester.md` - ユニットテスト用 Fixture 作成
  - `.claude/agents/e2e-tester.md` - E2E テスト用 Fixture 作成（Seeding、Teardown 戦略含む）

- **model**: sonnet

- **トリガーキーワード**: fixture, test data, seeding, テストデータ, フィクスチャ

### `/ai:fix-flaky-tests`

- **目的**: 不安定なテスト（フレーキーテスト）の検出と修正
- **引数**: `[test-file]` - 対象テストファイルパス（必須）
- **起動エージェント**:
  - `.claude/agents/e2e-tester.md`

- **model**: sonnet

- **トリガーキーワード**: flaky test, unstable test, 不安定なテスト, フレーキー

---

## 8. 品質管理

### `/ai:lint`

- 目的: ESLint によるコード品質チェック（自動修正オプション付き、構文エラー・Code Smells 検出）
- 引数: `[--fix]` - 自動修正フラグ(オプション)
- 起動エージェント:
  - `.claude/agents/code-quality.md` - コード品質管理専門
- 参照スキル（code-quality が必要時に参照）:
  - Phase 1: `.claude/skills/eslint-configuration/SKILL.md`（Flat Config、ルール選択、プラグイン統合）
  - Phase 2: `.claude/skills/linting-formatting-automation/SKILL.md`（Lint 自動化、結果分析、--fix オプション最適化）
  - Phase 3: `.claude/skills/code-smell-detection/SKILL.md`（長いメソッド、複雑な条件分岐、重複コード検出）
- 実行フロー:
  1. 既存 ESLint 設定確認（eslint.config.js、Flat Config 形式）
  2. package.json の lint スクリプト確認（pnpm lint 優先）
  3. 引数解析（`$ARGUMENTS`から`--fix`フラグ検出）
  4. Lint 実行（pnpm lint/pnpm run lint/npx eslint .）
  5. `--fix`指定時は自動修正適用、エラー/警告の分類
  6. 詳細レポート生成（重要度別、ファイル別）
- 成果物:
  - Lint レポート（`docs/quality-reports/lint-report-[timestamp].md`）
  - エラー数/警告数サマリー
  - 自動修正数（--fix 使用時）
  - ファイル別問題一覧
  - 修正推奨事項（優先度付き）
- 設定:
  - `model: sonnet`（軽量・高速な Lint タスク）
  - `allowed-tools:
    - Task
    - Read
    - Bash(pnpm run lint*|pnpm lint*|eslint\*)
    - Write(docs/quality-reports/\*\*)`
- トリガーキーワード: lint, eslint, code check, コードチェック, 構文エラー, 静的解析

### `/ai:format`

- 目的: Prettier によるコードフォーマット（指定パターンまたは全体、一貫したスタイル保証）
- 引数: `[target-pattern]` - 対象パターン(src/\*_/_.ts 等、未指定時は全体)
- 起動エージェント:
  - `.claude/agents/code-quality.md` - コード品質管理専門
- 参照スキル（code-quality が必要時に参照）:
  - Phase 1: `.claude/skills/prettier-integration/SKILL.md`（.prettierrc 設定、ESLint 競合解決、エディタ統合）
  - Phase 2: `.claude/skills/linting-formatting-automation/SKILL.md`（フォーマット自動化、保存時実行、CI/CD 統合）
- 実行フロー:
  1. .prettierrc 設定確認（singleQuote、semi、tabWidth 等）
  2. 対象パターン特定（引数 `$1` から取得、未指定時は全体）
  3. フォーマットコマンド選択（pnpm format 優先）
  4. Prettier 実行（--write オプション）
  5. フォーマットされたファイルリストをキャプチャ
  6. 構文エラー導入チェック（クイック検証）
- 成果物:
  - フォーマット済みコード（一貫したスタイル適用済み）
  - フォーマット済みファイル数レポート
  - 影響を受けたファイルパス一覧
  - フォーマットエラー/競合レポート（該当する場合）
- 設定:
  - `model: sonnet`（軽量・高速なフォーマットタスク）
  - `allowed-tools`:
    - Task
    - Read
    - Bash(npx prettier*|pnpm format*)
    - Edit
- トリガーキーワード: format, prettier, フォーマット, 整形, code style

### `/ai:analyze-code-quality`

- 目的: コード品質の包括的分析（複雑度メトリクス、Code Smells、保守性評価）
- 引数: `[directory]` - 対象ディレクトリ（デフォルト: src/）
- 起動エージェント:
  - `.claude/agents/code-quality.md` - コード品質管理専門
- 参照スキル（code-quality が必要時に参照）:
  - Phase 1: `.claude/skills/static-analysis/SKILL.md`（循環的複雑度、認知的複雑度、ネスト深度、保守性インデックス）
  - Phase 2: `.claude/skills/code-style-guides/SKILL.md`（Airbnb/Google/Standard 準拠度、カスタムルール評価）
  - Phase 3: `.claude/skills/code-smell-detection/SKILL.md`（長いメソッド、God Class、重複コード、複雑な条件分岐検出）
- 実行フロー:
  1. 対象ディレクトリ特定（引数 `$1` から取得、デフォルト: src/）
  2. Glob パターンでファイルスコープ特定（_.ts、_.tsx）
  3. 循環的複雑度測定（McCabe 複雑度）
  4. 認知的複雑度測定（コード理解の難しさ）
  5. Code Smells 検出（パターンマッチング + 静的解析）
  6. スタイルガイド準拠度評価
  7. 包括的レポート生成（総合スコア + 優先度付き改善提案）
- 成果物:
  - 品質メトリクスレポート（`docs/quality-reports/quality-analysis-[timestamp].md`）
  - エグゼクティブサマリー（総合品質スコア、改善優先度トップ 5）
  - ファイル/モジュール別複雑度スコア
  - トップ 10 Code Smells（位置情報、重要度、修正推奨付き）
  - 保守性評価（A-F ランク）
  - リファクタリング推奨事項（影響度順）
  - トレンド分析（履歴データがある場合）
- 設定:
  - `model: sonnet`（深層分析対応）
  - `allowed-tools`:
    - Task
    - Read
    - Grep
    - Glob
    - Bash
    - Write(docs/quality-reports/\*\*)
- トリガーキーワード: analyze, quality, metrics, complexity, 品質分析, メトリクス, 複雑度, 保守性

### `/ai:setup-pre-commit`

- 目的: Pre-commit hooks の完全設定（Husky + lint-staged 統合、コミット時品質ゲート）
- 引数: なし
- 起動エージェント:
  - `.claude/agents/hook-master.md`
  - `.claude/agents/code-quality.md`
- 参照スキル（各エージェントが必要時に参照）:
  - hook-master Phase 1: `.claude/skills/git-hooks-concepts/SKILL.md`（Git hooks ライフサイクル、pre-commit/commit-msg/pre-push）
  - hook-master Phase 2: `.claude/skills/commit-hooks/SKILL.md`（Husky 設定、lint-staged 設定、パフォーマンス最適化）
  - code-quality Phase 2: `.claude/skills/linting-formatting-automation/SKILL.md`（ESLint/Prettier 統合、--fix 自動修正、--cache 最適化）
  - hook-master Phase 3: `.claude/skills/git-hooks-concepts/SKILL.md`（Hook 検証、エラーハンドリング）
- 実行フロー:
  1. Git リポジトリ確認（.git/ディレクトリ存在確認）
  2. 既存 Hooks 確認（.husky/ディレクトリ、package.json の husky 設定）
  3. パッケージマネージャー特定（pnpm/pnpm/yarn）
  4. Husky + lint-staged インストール（`pnpm add -D husky lint-staged`）
  5. Husky 初期化（`npx husky init`）
  6. Pre-commit hook ファイル作成（`.husky/pre-commit`）
  7. lint-staged 設定追加（package.json 内）
  8. ファイルパターンとコマンド定義（\*.ts → eslint --fix、prettier --write）
  9. テストコミット実行（動作確認）
  10. README.md に使用方法追記
- 成果物:
  - `.husky/pre-commit`（ESLint + Prettier 自動実行スクリプト）
  - package.json に lint-staged 設定（ファイルパターン別コマンド定義）
  - README.md に使用方法セクション
  - コミット時品質ゲート（コミット前に自動 Lint/Format）
  - パフォーマンス最適化済み（--cache オプション、差分のみチェック）
- 設定:
  - `model: sonnet`（セットアップタスク）
  - `allowed-tools`:
    - Task
    - Read
    - Write
    - Bash(npx husky*|pnpm*)
- トリガーキーワード: pre-commit, git hooks, husky, lint-staged, 品質自動化, コミットフック

### `/ai:refactor`

- 目的: コードリファクタリング（Clean Code 原則適用、SOLID 原則準拠、テスト駆動）
- 引数: `<target-file>` - 対象ファイルパス（必須）
- 起動エージェント:
  - `.claude/agents/logic-dev.md`
  - `.claude/agents/arch-police.md`
- 参照スキル（各エージェントが必要時に参照）:
  - logic-dev Phase 1: `.claude/skills/code-smell-detection/SKILL.md`（長いメソッド、重複コード、複雑な条件分岐、God Class 検出）
  - logic-dev Phase 1: `.claude/skills/clean-code-practices/SKILL.md`（命名規則、関数長、単一責任原則）
  - logic-dev Phase 2: `.claude/skills/refactoring-techniques/SKILL.md`（Extract Method、Replace Conditional with Polymorphism、Move Method 等）
  - arch-police Phase 3: `.claude/skills/solid-principles/SKILL.md`（単一責任、開放閉鎖、依存性逆転原則検証）
  - logic-dev Phase 3: `.claude/skills/clean-code-practices/SKILL.md`（品質チェックリスト、可読性評価）
- 実行フロー:
  1. 対象ファイル読み込み（引数 `$1` から取得、必須）
  2. Code Smells 検出（長いメソッド、複雑度、重複コード）
  3. SOLID 原則違反検出（単一責任、依存性逆転等）
  4. テストカバレッジ確認（既存テストの有無）
  5. リファクタリング技法選択（Extract Method、Rename Variable 等）
  6. リファクタリング実行（Edit/MultiEdit 使用）
  7. 各ステップ後にテスト実行（pnpm test、テスト失敗時はロールバック）
  8. アーキテクチャ検証（arch-police、依存関係ルール確認）
  9. 最終品質チェック（複雑度削減、可読性向上確認）
  10. リファクタリングサマリー生成
- 成果物:
  - リファクタリング済みコード（テスト通過確認済み）
  - 複雑度改善レポート（リファクタリング前/後のスコア比較）
  - 適用されたリファクタリング技法一覧
  - SOLID 原則準拠確認結果
  - テストカバレッジ維持確認（カバレッジ低下なし）
  - Code Smells 除去サマリー
- 設定:
  - `model: sonnet`（コード変更タスク）
  - `allowed-tools:
    - Task
    - Read
    - Edit
    - MultiEdit
    - Bash(pnpm test\*)
- トリガーキーワード: refactor, improve, clean code, リファクタリング, 改善, コード整理, SOLID

---

## 9. セキュリティ

### `/ai:security-audit`

- **目的**: 包括的セキュリティ監査（OWASP Top 10 準拠、CVSS スコアリング）
- **引数**: `[scope]` - スコープ(all/auth/api/database、デフォルト: all)
- **起動エージェント**:
  - `.claude/agents/sec-auditor.md` - セキュリティスキャンと脆弱性評価（メイン）
  - `.claude/agents/auth-specialist.md`
  - `.claude/agents/secret-mgr.md`

- **model**: opus

- **トリガーキーワード**: security audit, vulnerability, OWASP, セキュリティ監査, 脆弱性診断, penetration test

### `/ai:setup-auth`

- **目的**: 認証・認可システムの完全実装（NextAuth.js/Passport.js、OAuth 2.0、RBAC）
- **引数**: `[provider]` - 認証プロバイダー(github/google/credentials、デフォルト: credentials)
- **起動エージェント**:
  - `.claude/agents/auth-specialist.md` - OAuth 2.0 と NextAuth.js 専門

- **model**: sonnet

- **トリガーキーワード**: auth, authentication, authorization, OAuth, NextAuth, login, session, 認証, 認可

### `/ai:scan-vulnerabilities`

- **目的**: 依存関係の脆弱性スキャン（npm audit、CVE 評価、修正優先順位付け）
- **引数**: なし
- **起動エージェント**:
  - `.claude/agents/sec-auditor.md`
  - `.claude/agents/dep-mgr.md`

- **model**: sonnet

- **トリガーキーワード**: vulnerability scan, pnpm audit, CVE, 脆弱性スキャン, dependency audit

### `/ai:setup-rate-limiting`

- **目的**: レート制限の実装（Token Bucket/Sliding Window、DoS/ブルートフォース対策）
- **引数**: `[rate-limit]` - レート制限値（例: 100/hour, 10/minute、デフォルト: 100/hour）
- **起動エージェント**:
  - `.claude/agents/sec-auditor.md` - Rate Limiting 戦略設計
  - `.claude/agents/gateway-dev.md` - ミドルウェア実装

- **model**: sonnet

- **トリガーキーワード**: rate limit, throttle, DoS, brute force, レート制限, 流量制限, API 制限

### `/ai:manage-secrets`

- **目的**: 機密情報の安全な管理（Git 混入防止、.env.example 生成、型安全なアクセス）
- **引数**: なし
- **起動エージェント**:
  - `.claude/agents/secret-mgr.md` - Secret 管理専門（Zero Trust 原則）

- **model**: sonnet

- **トリガーキーワード**: secrets, environment variables, API keys, credentials, 機密情報, シークレット管理, .env

### `/ai:rotate-secrets`

- **目的**: API キー・シークレットのローテーション（手動実行必須、ロールバック対応）
- **引数**: `[secret-name]` - シークレット名（例: OPENAI_API_KEY、DATABASE_PASSWORD）
- **起動エージェント**:
  - `.claude/agents/secret-mgr.md` - Secret Rotation 専門（Zero Trust 原則）

- **model**: sonnet

- **トリガーキーワード**: rotate secrets, key rotation, secret rotation, シークレットローテーション, 鍵ローテーション, API キー更新

---

## 10. CI/CD・デプロイ

### `/ai:create-ci-workflow`

- **目的**: CI(継続的インテグレーション)ワークフローの作成（テスト・Lint・ビルド）
- **引数**: `[workflow-type]` - ワークフロータイプ(test/lint/build、オプション)
- **起動エージェント**:
  - `.claude/agents/gha-workflow-architect.md` - GitHub Actions 専門エージェント（Phase 2 で起動）

- **model**: sonnet

- **トリガーキーワード**: CI, continuous integration, workflow, GitHub Actions, テスト自動化

### `/ai:create-cd-workflow`

- **目的**: CD(継続的デプロイ)ワークフローの作成（Railway 自動デプロイ統合）
- **引数**: `[environment]` - 環境(staging/production、オプション)
- **起動エージェント**:
  - `.claude/agents/gha-workflow-architect.md` - GitHub Actions 専門エージェント（Phase 2 で起動）
  - `.claude/agents/devops-eng.md` - DevOps 専門エージェント（Phase 3 で起動、Railway 統合）

- **model**: sonnet

- **トリガーキーワード**: CD, deploy, continuous deployment, Railway, デプロイ自動化

### `/ai:create-reusable-workflow`

- **目的**: 再利用可能なワークフローの作成（モノレポ対応、パラメータ化）
- **引数**: `[workflow-name]` - ワークフロー名（必須）
- **起動エージェント**:
  - `.claude/agents/gha-workflow-architect.md` - GitHub Actions 専門エージェント（Phase 2 で起動）

- **model**: sonnet

- **トリガーキーワード**: reusable workflow, template, モジュール化, 再利用

### `/ai:create-composite-action`

- **目的**: カスタムコンポジットアクションの作成（複雑な処理の再利用）
- **引数**: `[action-name]` - アクション名（必須）
- **起動エージェント**:
  - `.claude/agents/gha-workflow-architect.md` - GitHub Actions 専門エージェント（Phase 2 で起動）

- **model**: sonnet

- **トリガーキーワード**: composite action, custom action, アクション作成

### `/ai:optimize-ci-performance`

- **目的**: CI/CD パイプラインの高速化（並列実行、キャッシュ最適化）
- **引数**: `[workflow-file]` - 対象ワークフローファイル（オプション）
- **起動エージェント**:
  - `.claude/agents/gha-workflow-architect.md` - GitHub Actions 専門エージェント（Phase 2 で起動）

- **model**: sonnet

- **トリガーキーワード**: optimize, performance, 高速化, CI 最適化

### `/ai:setup-deployment-environments`

- **目的**: GitHub Environments とステージング・本番環境の設定（承認フロー付き）
- **引数**: なし
- **起動エージェント**:
  - `.claude/agents/devops-eng.md` - DevOps 専門エージェント（Phase 1 で起動）
  - `.claude/agents/gha-workflow-architect.md` - GitHub Actions 専門エージェント（Phase 2 で起動、承認フロー設計）

- **model**: sonnet

- **トリガーキーワード**: environments, staging, production, 承認フロー, デプロイ環境

### `/ai:setup-docker`

- **目的**: Docker コンテナ化設定（Dockerfile、docker-compose.yml）
- **引数**: `[service-name]` - サービス名（オプション）
- **起動エージェント**:
  - `.claude/agents/devops-eng.md` - DevOps 専門エージェント（Phase 2 で起動）

- **model**: sonnet

- **トリガーキーワード**: Docker, container, コンテナ化, docker-compose

### `/ai:deploy-staging`

- **目的**: ステージング環境への自動デプロイ（ドライラン対応）
- **引数**: `[--dry-run]` - ドライランフラグ（オプション）
- **起動エージェント**:
  - `.claude/agents/devops-eng.md` - DevOps 専門エージェント（Phase 1 で起動、デプロイ実行）
  - `.claude/agents/gha-workflow-architect.md` - GitHub Actions 専門エージェント（Phase 2 で起動、ワークフロートリガー）

- **model**: sonnet

- **トリガーキーワード**: deploy staging, ステージングデプロイ, 検証環境

### `/ai:deploy-production`

- **目的**: 本番環境への承認フロー付きデプロイ（手動承認必須、最高品質）
- **引数**: なし
- **起動エージェント**:
  - `.claude/agents/devops-eng.md` - DevOps 専門エージェント（Phase 1 で起動、デプロイレポート作成）
  - `.claude/agents/gha-workflow-architect.md` - GitHub Actions 専門エージェント（Phase 2 で起動、承認フロー実行）

- **model**: opus

- **トリガーキーワード**: deploy production, 本番デプロイ, production release

---

## 11. ドキュメント

### `/ai:generate-api-docs`

- **目的**: API 仕様書の自動生成
- **引数**: `[source-path]` - ソースコードパス（オプション、デフォルト: src/app/api）
- **使用エージェント**: `.claude/agents/api-doc-writer.md`
- **スキル活用**:
  - Phase 1: `.claude/skills/openapi-specification/SKILL.md`, `.claude/skills/api-versioning/SKILL.md`
  - Phase 2: `.claude/skills/openapi-specification/SKILL.md`, `.claude/skills/request-response-examples/SKILL.md`
  - Phase 3: authentication-docs, `.claude/skills/api-documentation-best-practices/SKILL.md`
  - Phase 4: `.claude/skills/swagger-ui/SKILL.md`

- **設定**:
  - `model: sonnet`
  - `allowed-tools: Task, Read, Write(openapi.yaml|docs/api/**), Grep`

### `/ai:write-user-manual`

- **目的**: ユーザー中心のマニュアル・チュートリアルの作成
- **引数**: `[target-audience]` - 対象読者レベル(beginner/advanced/admin、オプション)
- **使用エージェント**: `.claude/agents/manual-writer.md`
- **スキル活用**:
  - Phase 1: `.claude/skills/information-architecture/SKILL.md`
  - Phase 2: `.claude/skills/user-centric-writing/SKILL.md`, `.claude/skills/tutorial-design/SKILL.md`
  - Phase 3: `.claude/skills/troubleshooting-guides/SKILL.md`
  - Phase 5: localization-i18n（必要時）

- **設定**:
  - `model: sonnet`
  - `allowed-tools: Task, Read, Write(docs/manual/**|docs/tutorials/**), Edit, Grep`

### `/ai:create-troubleshooting-guide`

- **目的**: トラブルシューティングガイドと FAQ の作成
- **引数**: なし
- **使用エージェント**: `.claude/agents/manual-writer.md`
- **スキル活用**: `.claude/skills/troubleshooting-guides/SKILL.md`（必須）、`.claude/skills/user-centric-writing/SKILL.md`、`.claude/skills/information-architecture/SKILL.md`

- **設定**:
  - `model: sonnet`
  - `allowed-tools: Task, Read, Write(docs/manual/troubleshooting.md|docs/manual/faq.md), Grep`

### `/ai:generate-changelog`

- **目的**: Git 履歴から CHANGELOG.md を自動生成
- **引数**: `[from-tag] [to-tag]` - バージョン範囲（オプション）
- **使用エージェント**: `.claude/agents/spec-writer.md`
- **スキル活用**: `.claude/skills/markdown-advanced-syntax/SKILL.md`, `.claude/skills/version-control-for-docs/SKILL.md`, `.claude/skills/structured-writing/SKILL.md`

- **設定**:
  - `model: sonnet`
  - `allowed-tools: Task, Bash(git log*|git tag*|git diff*), Read, Write(CHANGELOG.md), Edit`

### `/ai:update-readme`

- **目的**: README.md の更新と保守
- **引数**: なし
- **使用エージェント**: `.claude/agents/spec-writer.md`（技術部分）、`.claude/agents/manual-writer.md`（ユーザー向け部分）
- **スキル活用**: `.claude/skills/markdown-advanced-syntax/SKILL.md`, `.claude/skills/structured-writing/SKILL.md`, `.claude/skills/user-centric-writing/SKILL.md`, `.claude/skills/tutorial-design/SKILL.md`

- **設定**:
  - `model: sonnet`
  - `allowed-tools: Task, Read, Edit`

---

## 12. 運用・監視

### `/ai:setup-logging`

- **目的**: 構造化ロギングシステムの設計と実装
- **引数**: `[log-level]` - デフォルトログレベル(debug/info/warn/error、オプション)
- **使用エージェント**: `.claude/agents/sre-observer.md`
- **スキル活用**:
  - Phase 1: `.claude/skills/structured-logging/SKILL.md`, `.claude/skills/observability-pillars/SKILL.md`
  - Phase 3: `.claude/skills/structured-logging/SKILL.md`（必須）, `.claude/skills/distributed-tracing/SKILL.md`

- **設定**:
  - `model: sonnet`
  - `allowed-tools: Task, Read, Write(src/shared/infrastructure/logging/**|config/logging.*), Edit, Grep`

### `/ai:setup-monitoring`

- **目的**: 監視・アラートシステムの設計と設定
- **引数**: `[service-name]` - 監視対象サービス名（オプション）
- **使用エージェント**: `.claude/agents/sre-observer.md`
- **スキル活用**:
  - Phase 2: `.claude/skills/slo-sli-design/SKILL.md`（必須）
  - Phase 4: `.claude/skills/alert-design/SKILL.md`（必須）, `.claude/skills/slo-sli-design/SKILL.md`
  - 補助: `.claude/skills/observability-pillars/SKILL.md`, `.claude/skills/distributed-tracing/SKILL.md`

- **設定**:
  - `model: sonnet`
  - `allowed-tools: Task, Read, Write(config/monitoring.*|docs/observability/**), Grep`

### `/ai:setup-local-agent`

- **目的**: ローカルエージェント（ファイル監視）のセットアップ
- **引数**: なし
- **使用エージェント**:
  - `.claude/agents/local-watcher.md` - ファイル監視専門
  - `.claude/agents/local-sync.md`
  - `.claude/agents/process-mgr.md`
- **スキル活用**:
  - local-watcher: `.claude/skills/event-driven-file-watching/SKILL.md`（必須）, `.claude/skills/debounce-throttle-patterns/SKILL.md`, `.claude/skills/file-exclusion-patterns/SKILL.md`
  - 補助: `.claude/skills/pm2-ecosystem-config/SKILL.md`, `.claude/skills/graceful-shutdown-patterns/SKILL.md`, `.claude/skills/file-watcher-security/SKILL.md`

- **設定**:
  - `model: sonnet`
  - `allowed-tools: Task, Bash, Read, Write(local-agent/**)`

### `/ai:manage-dependencies`

- **目的**: 依存パッケージの管理・更新・セキュリティ監査
- **引数**: `[--upgrade-strategy]` - 更新戦略(patch/minor/major、オプション)
- **使用エージェント**: `.claude/agents/dep-mgr.md`
- **スキル活用**:
  - 常時: `.claude/skills/semantic-versioning/SKILL.md`, `.claude/skills/dependency-auditing/SKILL.md`
  - 更新時: `.claude/skills/upgrade-strategies/SKILL.md`, `.claude/skills/lock-file-management/SKILL.md`
  - モノレポ時: `.claude/skills/monorepo-dependency-management/SKILL.md`

- **設定**:
  - `model: sonnet`
  - `allowed-tools: Task, Bash(pnpm*|pnpm*), Read, Edit`

---

## 13. Claude Code 環境

### `/ai:create-agent-command-skill`

- **目的**: エージェント、コマンド、スキルを統合的に作成する高度なメタコマンド
- **引数**: `[domain-name]` - ドメイン名（オプション、未指定時はインタラクティブ）
- **使用エージェント**: `.claude/agents/skill-librarian.md`, `.claude/agents/meta-agent-designer.md`, `.claude/agents/command-arch.md`
- **スキル活用**:
  - **知識層(スキル)**: `.claude/skills/knowledge-management/SKILL.md`, `.claude/skills/progressive-disclosure/SKILL.md`, `.claude/skills/documentation-architecture/SKILL.md`, `.claude/skills/context-optimization/SKILL.md`, `.claude/skills/best-practices-curation/SKILL.md`
  - **実行層(エージェント)**: `.claude/skills/agent-architecture-patterns/SKILL.md`, `.claude/skills/agent-structure-design/SKILL.md`, `.claude/skills/agent-persona-design/SKILL.md`, `.claude/skills/tool-permission-management/SKILL.md`, `.claude/skills/agent-dependency-design/SKILL.md`, `.claude/skills/multi-agent-systems/SKILL.md`, `.claude/skills/project-architecture-integration/SKILL.md`, `.claude/skills/agent-quality-standards/SKILL.md`, `.claude/skills/agent-validation-testing/SKILL.md`, `.claude/skills/prompt-engineering-for-agents/SKILL.md`, `.claude/skills/agent-template-patterns/SKILL.md`, `.claude/skills/agent-lifecycle-management/SKILL.md`
  - **UI 層(コマンド)**: `.claude/skills/command-structure-fundamentals/SKILL.md`, `.claude/skills/command-arguments-system/SKILL.md`, `.claude/skills/command-security-design/SKILL.md`, `.claude/skills/command-basic-patterns/SKILL.md`, `.claude/skills/command-advanced-patterns/SKILL.md`, `.claude/skills/command-agent-skill-integration/SKILL.md`, `.claude/skills/command-activation-mechanisms/SKILL.md`, `.claude/skills/command-error-handling/SKILL.md`, `.claude/skills/command-naming-conventions/SKILL.md`, `.claude/skills/command-documentation-patterns/SKILL.md`, `.claude/skills/command-placement-priority/SKILL.md`, `.claude/skills/command-best-practices/SKILL.md`, `.claude/skills/command-performance-optimization/SKILL.md`

- **設定**:
  - `model: opus`（複雑な統合設計が必要）
  - `allowed-tools:
    - Task
    - Read
    - Write(.claude/\*\*)
    - Grep
    - Bash
- **使用シナリオ**: 新しい専門分野の完全な統合、複雑なワークフローの自動化システム構築、マルチエージェント協調システムの新規構築、プロジェクト固有のベストプラクティス体系化

### `/ai:create-agent`

- **目的**: 新しい Claude Code エージェント（.claude/agents/\*.md）の作成
- **引数**: `[agent-name] [specialty]` - エージェント名と専門分野（両方オプション、未指定時はインタラクティブ）
- **使用エージェント**: `.claude/agents/meta-agent-designer.md`
- **スキル活用**（タスクに応じて必要なスキルのみ読み込み）:
  - **コア設計**: `.claude/skills/agent-architecture-patterns/SKILL.md`, `.claude/skills/agent-structure-design/SKILL.md`, `.claude/skills/agent-persona-design/SKILL.md`, `.claude/skills/tool-permission-management/SKILL.md`
  - **統合・協調**: `.claude/skills/agent-dependency-design/SKILL.md`, `.claude/skills/multi-agent-systems/SKILL.md`, `.claude/skills/project-architecture-integration/SKILL.md`
  - **品質・検証**: `.claude/skills/agent-quality-standards/SKILL.md`, `.claude/skills/agent-validation-testing/SKILL.md`, `.claude/skills/prompt-engineering-for-agents/SKILL.md`
  - **テンプレート**: `.claude/skills/agent-template-patterns/SKILL.md`, `.claude/skills/agent-lifecycle-management/SKILL.md`

- **設定**:
  - `model: opus`（高度なペルソナ設計が必要）
  - `allowed-tools:
    - Read
    - Write(.claude/agents/\*\*)
    - Grep
    - Bash
  ### `/ai:create-skill`
- **目的**: 新しい Claude Code スキル（.claude/skills/\*/SKILL.md）の作成
- **引数**: `[skill-name]` - スキル名（オプション、未指定時はインタラクティブ）
- **使用エージェント**: `.claude/agents/skill-librarian.md`
- **主要スキル**（エージェントが参照）:
  - `.claude/skills/knowledge-management/SKILL.md` - SECI モデルによる暗黙知 → 形式知変換
  - `.claude/skills/progressive-disclosure/SKILL.md` - 3 層開示モデル（メタデータ → 本文 → リソース）
  - `.claude/skills/documentation-architecture/SKILL.md` - トピック分割、階層設計、リソース最適化
  - `.claude/skills/context-optimization/SKILL.md` - トークン効率化、段階的ロード設計
  - `.claude/skills/best-practices-curation/SKILL.md` - 知識の収集、更新、陳腐化防止

- **設定**:
  - `model: opus`（高度な知識体系化が必要）
  - `allowed-tools:
    - Read
    - Write(.claude/skills/\*\*)
    - Grep
    - Bash
  ### `/ai:create-command`
- **目的**: 新しいスラッシュコマンド（.claude/commands/[機能]/\*.md）の作成
- **引数**: `[command-name]` - コマンド名（オプション、未指定時はインタラクティブ）
- **起動エージェント**:
  - `.claude/agents/command-arch.md`
- **利用可能スキル**（タスクに応じて command-arch エージェントが必要時に参照）:
  - **Phase 1（要件収集・分析時）**: `.claude/skills/command-naming-conventions/SKILL.md`, `.claude/skills/command-placement-priority/SKILL.md`
  - **Phase 2（設計時）**: `.claude/skills/command-structure-fundamentals/SKILL.md`, `.claude/skills/command-arguments-system/SKILL.md`, `.claude/skills/command-basic-patterns/SKILL.md`, `.claude/skills/command-advanced-patterns/SKILL.md`（必要時）, `.claude/skills/command-activation-mechanisms/SKILL.md`（必要時）
  - **Phase 3（セキュリティ時）**: `.claude/skills/command-security-design/SKILL.md`, `.claude/skills/command-error-handling/SKILL.md`
  - **Phase 4（ドキュメント時）**: `.claude/skills/command-documentation-patterns/SKILL.md`, `.claude/skills/command-best-practices/SKILL.md`
  - **Phase 5（最適化時）**: `.claude/skills/command-performance-optimization/SKILL.md`, `.claude/skills/command-agent-skill-integration/SKILL.md`（必要時）

- **設定**:
  - `argument-hint`: オプション引数 1 つ（未指定時はインタラクティブ）
  - `allowed-tools`: [Task, Read, Write(.claude/commands/**), Grep, Glob]
    • Task: エージェント起動用
    • Read: 既存コマンド/スキル参照確認用
    • Write(.claude/commands/\*\*): コマンドファイル生成用（制限付き）
    • Grep, Glob: 既存パターン検索・重複チェック用
  - `model: sonnet`（標準的なコマンド作成タスク）
  ### `/ai:setup-hooks`
- **目的**: Claude Code hooks の設定
- **引数**: `[hook-type]` - フックタイプ(PreToolUse/PostToolUse/Stop 等)
- **使用エージェント**: `.claude/agents/hook-master.md`
- **主要スキル**（エージェントが参照）:
  - `.claude/skills/claude-code-hooks/SKILL.md` - Claude Code Hooks
  - `.claude/skills/automation-scripting/SKILL.md` - 自動化スクリプト実装

- **設定**:
  - `model: sonnet`
  - `allowed-tools: Read, Edit`

### `/ai:setup-mcp`

- **目的**: MCP サーバーの統合設定
- **引数**: `[mcp-server-name]` - MCP サーバー名
- **使用エージェント**: `.claude/agents/mcp-integrator.md`
- **主要スキル**（エージェントが参照）:
  - `.claude/skills/mcp-protocol/SKILL.md` - MCP プロトコル
  - `.claude/skills/tool-security/SKILL.md` - ツールセキュリティ

- **設定**:
  - `model: sonnet`
  - `allowed-tools: Read, Edit, Write`

### `/ai:optimize-context`

- **目的**: コンテキスト使用量の最適化
- **引数**: なし
- **使用エージェント**: `.claude/agents/skill-librarian.md`, `.claude/agents/prompt-eng.md`
- **主要スキル**（エージェントが参照）:
  - `.claude/skills/context-optimization/SKILL.md` - コンテキスト最適化
  - `.claude/skills/progressive-disclosure/SKILL.md` - 段階的開示

- **設定**:
  - `model: opus`
  - `allowed-tools: Read, Edit`

---

## 14. 統合ワークフロー

### `/ai:full-feature-development`

- **目的**: 機能の完全な開発サイクル
- **引数**: `[feature-name]` - 機能名
- **使用エージェント**:
  - `.claude/agents/product-manager.md`, `.claude/agents/req-analyst.md`, `.claude/agents/spec-writer.md`
  - `.claude/agents/domain-modeler.md`, `.claude/agents/ui-designer.md`, `.claude/agents/logic-dev.md`
  - `.claude/agents/unit-tester.md`, `.claude/agents/code-quality.md`, `.claude/agents/sec-auditor.md`

- **設定**:
  - `model: opus` (複雑な調整)
  - `allowed-tools: Bash, Read, Write, Edit, Task`

### `/ai:create-full-stack-app`

- **目的**: フルスタックアプリケーションの構築
- **引数**: `[app-name] [--features]` - アプリ名と機能リスト
- **使用エージェント**:
  - `.claude/agents/router-dev.md`, `.claude/agents/ui-designer.md`, `.claude/agents/state-manager.md`
  - `.claude/agents/domain-modeler.md`, `.claude/agents/db-architect.md`, `.claude/agents/repo-dev.md`, `.claude/agents/gateway-dev.md`

- **設定**:
  - `model: opus`
  - `allowed-tools: Bash, Read, Write, Edit, Task`

### `/ai:prepare-release`

- **目的**: リリース準備の完全自動化
- **引数**: `[version]` - バージョン番号(semver 形式)
- **使用エージェント**:
  - `.claude/agents/unit-tester.md`, `.claude/agents/code-quality.md`, `.claude/agents/sec-auditor.md`
  - `.claude/agents/spec-writer.md`, `.claude/agents/devops-eng.md`

- **設定**:
  - `model: sonnet`
  - `allowed-tools: Bash, Read, Write, Edit`

### `/ai:code-review-complete`

- **目的**: 包括的なコードレビュー
- **引数**: `[target-path]` - レビュー対象パス
- **使用エージェント**:
  - `.claude/agents/arch-police.md`, `.claude/agents/code-quality.md`, `.claude/agents/sec-auditor.md`, `.claude/agents/logic-dev.md`

- **設定**:
  - `model: opus`
  - `allowed-tools: Read, Grep, Glob, Write(docs/**)`

### `/ai:onboard-developer`

- **目的**: 新規開発者のオンボーディング
- **引数**: `[developer-role]` - 開発者の役割(frontend/backend/fullstack)
- **使用エージェント**:
  - `.claude/agents/manual-writer.md`, `.claude/agents/meta-agent-designer.md`, `.claude/agents/skill-librarian.md`

- **設定**:
  - `model: sonnet`
  - `allowed-tools: Read, Write(docs/**)`

---

## 15. Git・バージョン管理

### `/ai:commit`

- **目的**: Conventional Commits に従ったコミット作成
- **引数**: `[commit-message]` - コミットメッセージ(オプション、未指定時は自動生成)
- **使用エージェント**: なし(シンプルな自動化)

- **設定**:
  - `model: sonnet`
  - `allowed-tools: Bash(git*)`

### `/ai:create-pr`

- **目的**: Pull Request 作成
- **引数**: `[base-branch]` - ベースブランチ(デフォルト: main)
- **使用エージェント**: `.claude/agents/spec-writer.md`

- **設定**:
  - `model: sonnet`
  - `allowed-tools: Bash(git*|gh*), Read`

### `/ai:merge-pr`

- **目的**: Pull Request のマージ
- **引数**: `[pr-number]` - PR 番号
- **使用エージェント**: なし

- **設定**:
  - `model: sonnet`
  - `allowed-tools: Bash(gh pr*|git*)`

### `/ai:tag-release`

- **目的**: リリースタグの作成
- **引数**: `[version]` - バージョン番号(v1.0.0 形式)
- **使用エージェント**: `.claude/agents/spec-writer.md`

- **設定**:
  - `model: sonnet`
  - `allowed-tools: Bash(git tag*|gh release*), Read, Write`

---

## 16. パッケージ・依存関係

### `/ai:add-dependency`

- **目的**: 新しい依存パッケージの追加
- **引数**: `[package-name] [--dev]` - パッケージ名、devDependency フラグ
- **使用エージェント**: `.claude/agents/dep-mgr.md`
- **スキル活用**: `.claude/skills/dependency-auditing/SKILL.md`

- **設定**:
  - `model: sonnet`
  - `allowed-tools: Bash(pnpm install*|pnpm add*), Read, Edit`

### `/ai:update-dependencies`

- **目的**: 依存パッケージの一括更新
- **引数**: `[strategy]` - 更新戦略(patch/minor/major/latest)
- **使用エージェント**: `.claude/agents/dep-mgr.md`
- **スキル活用**: `.claude/skills/upgrade-strategies/SKILL.md`, `.claude/skills/semantic-versioning/SKILL.md`

- **設定**:
  - `model: sonnet`
  - `allowed-tools: Bash(pnpm*|pnpm*), Read, Edit`

### `/ai:audit-dependencies`

- **目的**: 依存関係の脆弱性監査
- **引数**: なし
- **使用エージェント**: `.claude/agents/dep-mgr.md`, `.claude/agents/sec-auditor.md`
- **スキル活用**: `.claude/skills/dependency-auditing/SKILL.md`, `.claude/skills/vulnerability-scanning/SKILL.md`

- **設定**:
  - `model: sonnet`
  - `allowed-tools: Bash(pnpm audit*|pnpm audit*), Write(docs/**)`

---

## 17. 環境設定・設定ファイル

### `/ai:create-env-file`

- **目的**: .env.example の作成・更新
- **引数**: なし
- **使用エージェント**: `.claude/agents/secret-mgr.md`
- **スキル活用**: `.claude/skills/agent-architecture-patterns/SKILL.md`, `.claude/skills/best-practices-curation/SKILL.md`

- **設定**:
  - `model: sonnet`
  - `allowed-tools: Read, Write(.env.example)|Edit`

### `/ai:setup-eslint`

- **目的**: ESLint 設定の最適化
- **引数**: `[style-guide]` - スタイルガイド(airbnb/google/standard)
- **使用エージェント**: `.claude/agents/code-quality.md`
- **スキル活用**: `.claude/skills/eslint-configuration/SKILL.md`, `.claude/skills/code-style-guides/SKILL.md`

- **設定**:
  - `model: sonnet`
  - `allowed-tools: Bash(pnpm*), Read, Write, Edit`

### `/ai:setup-prettier`

- **目的**: Prettier 設定
- **引数**: なし
- **使用エージェント**: `.claude/agents/code-quality.md`
- **スキル活用**: `.claude/skills/prettier-integration/SKILL.md`

- **設定**:
  - `model: sonnet`
  - `allowed-tools: Write(.prettierrc*)`

### `/ai:setup-typescript`

- **目的**: TypeScript 設定の最適化
- **引数**: `[strictness]` - 厳格度(strict/moderate/loose)
- **使用エージェント**: `.claude/agents/schema-def.md`
- **スキル活用**: `.claude/skills/type-safety-patterns/SKILL.md`

- **設定**:
  - `model: sonnet`
  - `allowed-tools: Read, Edit`

---

## 18. メンテナンス・最適化

### `/ai:clean-codebase`

- **目的**: 未使用コード・ファイルの削除
- **引数**: `[--dry-run]` - ドライランフラグ
- **使用エージェント**: `.claude/agents/code-quality.md`, `.claude/agents/arch-police.md`
- **スキル活用**: `.claude/skills/code-smell-detection/SKILL.md`

- **設定**:
  - `model: sonnet`
  - `allowed-tools: Read, Grep, Glob, Edit, Bash(rm*)`

### `/ai:update-all-docs`

- **目的**: 全ドキュメントの一括更新
- **引数**: なし
- **使用エージェント**: `.claude/agents/spec-writer.md`, `.claude/agents/api-doc-writer.md`, `.claude/agents/manual-writer.md`

- **設定**:
  - `model: sonnet`
  - `allowed-tools: Read, Edit, Write(docs/**)`

### `/ai:analyze-performance`

- **目的**: パフォーマンス分析とボトルネック特定
- **引数**: `[target]` - 分析対象(frontend/backend/database)
- **使用エージェント**: `.claude/agents/router-dev.md`, `.claude/agents/repo-dev.md`, `.claude/agents/dba-mgr.md`
- **スキル活用**: `.claude/skills/web-performance/SKILL.md`, `.claude/skills/query-performance-tuning/SKILL.md`

- **設定**:
  - `model: sonnet`
  - `allowed-tools: Read, Bash, Write(docs/**)`

### `/ai:migrate-to-latest`

- **目的**: フレームワーク・ライブラリの最新版移行
- **引数**: `[library-name]` - ライブラリ名
- **使用エージェント**: `.claude/agents/dep-mgr.md`, `.claude/agents/logic-dev.md`
- **スキル活用**: `.claude/skills/upgrade-strategies/SKILL.md`

- **設定**:
  - `model: opus`
  - `allowed-tools: Bash(pnpm*|pnpm*), Read, Edit, Task`

---

## 19. トラブルシューティング・デバッグ

### `/ai:debug-error`

- **目的**: エラーのデバッグと原因特定
- **引数**: `[error-message]` - エラーメッセージ
- **使用エージェント**: `.claude/agents/logic-dev.md`, `.claude/agents/sec-auditor.md`

- **設定**:
  - `model: opus`
  - `allowed-tools: Read, Grep, Bash`

### `/ai:fix-build-error`

- **目的**: ビルドエラーの修正
- **引数**: なし
- **使用エージェント**: `.claude/agents/devops-eng.md`, `.claude/agents/code-quality.md`

- **設定**:
  - `model: sonnet`
  - `allowed-tools: Bash(pnpm run build*), Read, Edit`

### `/ai:fix-type-errors`

- **目的**: TypeScript エラーの修正
- **引数**: `[file-path]` - 対象ファイル(オプション)
- **使用エージェント**: `.claude/agents/schema-def.md`
- **スキル活用**: `.claude/skills/type-safety-patterns/SKILL.md`

- **設定**:
  - `model: sonnet`
  - `allowed-tools: Bash(tsc*), Read, Edit`

### `/ai:diagnose-performance-issue`

- **目的**: パフォーマンス問題の診断
- **引数**: `[symptom]` - 症状(slow-render/slow-query/memory-leak)
- **使用エージェント**: `.claude/agents/router-dev.md`, `.claude/agents/repo-dev.md`, `.claude/agents/sre-observer.md`

- **設定**:
  - `model: opus`
  - `allowed-tools: Read, Bash, Write(docs/**)`

---

## 20. チーム・コラボレーション

### `/ai:sync-team-standards`

- **目的**: チームコーディング規約の同期
- **引数**: なし
- **使用エージェント**: `.claude/agents/code-quality.md`, `.claude/agents/skill-librarian.md`

- **設定**:
  - `model: sonnet`
  - `allowed-tools: Read, Edit`

### `/ai:create-workflow-template`

- **目的**: チーム用ワークフローテンプレート作成
- **引数**: `[workflow-name]` - ワークフロー名
- **使用エージェント**: `.claude/agents/gha-workflow-architect.md`
- **スキル活用**: `.claude/skills/workflow-templates/SKILL.md`

- **設定**:
  - `model: sonnet`
  - `allowed-tools: Write(.github/workflow-templates/**)`

### `/ai:onboard-developer`

- **目的**: 新規開発者のオンボーディング
- **引数**: `[developer-role]` - 役割(frontend/backend/fullstack)
- **使用エージェント**: `.claude/agents/manual-writer.md`, `.claude/agents/meta-agent-designer.md`

- **設定**:
  - `model: sonnet`
  - `allowed-tools: Read, Write(docs/**)`

---

## 21. Electron デスクトップアプリ開発

### `/ai:design-electron-app`

- **目的**: Electronアプリケーションのアーキテクチャ設計（Main/Renderer/Preload分離、IPC設計）
- **引数**: `[app-name]` - アプリケーション名（オプション）
- **起動エージェント**:
  - `.claude/agents/electron-architect.md` - Electronアーキテクチャ設計専門
- **参照スキル**（electron-architectが必要時に参照）:
  - `.claude/skills/electron-architecture/SKILL.md`（Main/Renderer分離、IPC設計、コンテキストブリッジ）
- **実行フロー**:
  1. アプリケーション要件の把握
  2. プロセス間通信の必要性分析
  3. プロジェクトディレクトリ構造の設計
  4. Main/Renderer/Preloadの責務定義
  5. IPCチャネル設計と型定義
  6. Preload API設計
- **成果物**:
  - `src/main/index.ts`（Mainプロセスエントリーポイント）
  - `src/preload/index.ts`（Preloadスクリプト）
  - `src/shared/ipc-types.ts`（IPC型定義）
  - プロジェクトディレクトリ構造
- **設定**:
  - `model: sonnet`
  - `allowed-tools: Task, Read, Write(src/**|electron-builder.yml), Edit, Grep, Glob`
- **トリガーキーワード**: electron, デスクトップアプリ, architecture, 設計, main process, renderer

### `/ai:create-electron-window`

- **目的**: ElectronウィンドウとネイティブUI要素の実装（BrowserWindow、メニュー、トレイ）
- **引数**: `[window-type]` - ウィンドウタイプ（main/settings/dialog/tray）
- **起動エージェント**:
  - `.claude/agents/electron-ui-dev.md` - Electron UI実装専門
- **参照スキル**（electron-ui-devが必要時に参照）:
  - `.claude/skills/electron-ui-patterns/SKILL.md`（BrowserWindow、メニュー、ダイアログ、トレイ）
  - `.claude/skills/accessibility-wcag/SKILL.md`（WCAG準拠、ARIAパターン）
- **実行フロー**:
  1. ウィンドウ要件の把握（サイズ、リサイズ、最大化等）
  2. BrowserWindow設定の設計
  3. ウィンドウ状態永続化の実装
  4. アプリケーションメニュー作成（必要時）
  5. カスタムタイトルバー実装（必要時）
  6. システムトレイ実装（必要時）
- **成果物**:
  - `src/main/window.ts`（ウィンドウ管理）
  - `src/main/menu.ts`（メニュー定義）
  - `src/main/tray.ts`（トレイ、必要時）
  - `src/renderer/components/TitleBar.tsx`（カスタムタイトルバー、必要時）
- **設定**:
  - `model: sonnet`
  - `allowed-tools: Task, Read, Write(src/**), Edit, Grep, Glob`
- **トリガーキーワード**: electron, window, menu, dialog, tray, titlebar, ウィンドウ

### `/ai:secure-electron-app`

- **目的**: Electronアプリケーションのセキュリティ強化（サンドボックス、CSP、IPC安全性）
- **引数**: `[scope]` - 監査スコープ（full/config/ipc/csp/deps）
- **起動エージェント**:
  - `.claude/agents/electron-security.md` - Electronセキュリティ専門
- **参照スキル**（electron-securityが必要時に参照）:
  - `.claude/skills/electron-security-hardening/SKILL.md`（サンドボックス、CSP、IPC安全性）
- **実行フロー**:
  1. BrowserWindow設定の監査
  2. Preloadスクリプトのセキュリティレビュー
  3. IPCハンドラーの入力検証確認
  4. CSPポリシーの設計と実装
  5. 依存関係の脆弱性監査（npm audit）
  6. セキュリティレポート生成
- **成果物**:
  - セキュリティ監査レポート
  - CSP設定（`src/main/security/csp.ts`）
  - セキュアPreloadテンプレート
  - セキュリティチェックリスト
- **設定**:
  - `model: sonnet`
  - `allowed-tools: Task, Read, Write(src/**|.claude/docs/**), Edit, Grep, Glob, Bash`
- **トリガーキーワード**: electron, security, セキュリティ, csp, sandbox, 脆弱性

### `/ai:build-electron-app`

- **目的**: Electronアプリケーションのビルド・パッケージング設定（electron-builder、コード署名）
- **引数**: `[platform]` - 対象プラットフォーム（mac/win/linux/all）
- **起動エージェント**:
  - `.claude/agents/electron-builder.md` - Electronビルド専門
- **参照スキル**（electron-builderが必要時に参照）:
  - `.claude/skills/electron-packaging/SKILL.md`（electron-builder、コード署名、アイコン）
- **実行フロー**:
  1. 対象プラットフォームの確認
  2. electron-builder.yml作成/更新
  3. プラットフォーム固有設定（macOS/Windows/Linux）
  4. コード署名設定（必要時）
  5. アイコン設定
  6. CI/CDワークフロー作成（必要時）
- **成果物**:
  - `electron-builder.yml`（ビルド設定）
  - `build/entitlements.mac.plist`（macOSエンタイトルメント）
  - `scripts/notarize.js`（Notarization設定）
  - `.github/workflows/build.yml`（CI/CDワークフロー）
- **設定**:
  - `model: sonnet`
  - `allowed-tools: Task, Read, Write(electron-builder.yml|build/**|scripts/**|.github/**), Edit, Grep, Glob, Bash`
- **トリガーキーワード**: electron, build, package, installer, dmg, nsis, appimage

### `/ai:release-electron-app`

- **目的**: Electronアプリケーションの配布・自動更新設定（electron-updater、GitHub Releases）
- **引数**: `[action]` - アクション（setup/publish/version）
- **起動エージェント**:
  - `.claude/agents/electron-release.md` - Electronリリース専門
- **参照スキル**（electron-releaseが必要時に参照）:
  - `.claude/skills/electron-distribution/SKILL.md`（自動更新、リリースチャネル、配布）
- **実行フロー**:
  1. 配布方法の選択（GitHub/S3/ストア）
  2. electron-updater設定
  3. UpdateServiceクラス実装
  4. 配布先設定
  5. リリースワークフロー作成
  6. CHANGELOG生成
- **成果物**:
  - `src/main/services/updateService.ts`（更新サービス）
  - `electron-builder.yml`（publish設定追加）
  - `.github/workflows/release.yml`（リリースワークフロー）
  - `CHANGELOG.md`
- **設定**:
  - `model: sonnet`
  - `allowed-tools: Task, Read, Write(src/**|electron-builder.yml|.github/**|CHANGELOG.md), Edit, Grep, Glob, Bash`
- **トリガーキーワード**: electron, release, update, 自動更新, 配布, publish

---

## 🔧 allowed-tools 詳細パターン

### Read 専用(分析・レビューコマンド)

```yaml
allowed-tools: Read, Grep, Glob
用途: コードレビュー、分析、監査
例: /analyze-code-quality, /security-audit
```

### Write 制限(ドキュメント専用)

```yaml
allowed-tools: Read, Write(docs/**)
用途: ドキュメント作成・更新
例: /write-spec, /generate-changelog
```

### Write 制限(ソースコード)

```yaml
allowed-tools: Read, Write(src/**), Edit
用途: コード実装
例: /create-component, /implement-business-logic
```

### Bash 制限(Git 操作)

```yaml
allowed-tools: Bash(git*), Read, Write
用途: Git関連操作
例: /init-git-workflow
```

### Bash 制限(パッケージマネージャー)

```yaml
allowed-tools: Bash(pnpm*|pnpm*|npx*), Read, Write, Edit
用途: 依存関係管理、ビルド
例: /setup-dev-env, /manage-dependencies
```

### フルアクセス(統合ワークフロー)

```yaml
allowed-tools: Bash, Read, Write, Edit, Task, Grep, Glob
用途: 複雑な統合ワークフロー
例: /full-feature-development, /create-full-stack-app
```

---

## 📝 コマンド Frontmatter テンプレート

### 基本テンプレート

```yaml
---
description: [1-2行の明確な説明]
argument-hint: [arg1] [arg2]
allowed-tools:
  - [ツール]
  - [ツール]
  - [ツール]
  - [ツール]
model: sonnet
---
```

### セキュリティ重視テンプレート

```yaml
---
description: [セキュリティに関わる操作の説明]
argument-hint: [必要な引数]
allowed-tools: Read, [最小限の権限]
model: opus
disable-model-invocation: true
---
```

### パフォーマンス重視テンプレート

```yaml
---
description: [シンプルな操作の説明]
allowed-tools: Bash([特定コマンド]), Read
model: sonnet
---
```

### 統合ワークフローテンプレート

```yaml
---
description: [複数エージェント連携の説明]
argument-hint: [feature-name] [--options]
allowed-tools: Bash, Read, Write, Edit, Task
model: opus
---
```

---
