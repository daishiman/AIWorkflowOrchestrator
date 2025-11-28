# 全コマンドリスト - 36エージェント活用版（設定詳細版）

全36エージェントとそのスキルを最大限活用するための包括的なコマンドリストです。
各コマンドには設定可能な要素(引数、model、allowed-tools等)を明記しています。

---

## 📋 凡例

各コマンドの記載項目:
- **引数**: `$ARGUMENTS`で受け取るパラメータ
- **使用エージェント**: 起動するエージェント
- **フロー**: 実行ステップ
- **成果物**: 生成されるファイル・アーティファクト
- **設定**:
  - `model`: 使用モデル(opus/sonnet/haiku)
  - `allowed-tools`: 許可するツール
  - `disable-model-invocation`: モデル自動起動の可否

---

## 1. プロジェクト初期化・セットアップ

### `/ai:init-project`
- **目的**: 新規プロジェクトの完全な初期化（ビジョン→要件→アーキテクチャの3段階）
- **引数**: `[project-name]` - プロジェクト名（オプション、未指定時はインタラクティブ）
- **使用エージェント**:
  - `.claude/agents/product-manager.md`: プロジェクトゴール・ロードマップ・OKR定義
  - `.claude/agents/req-analyst.md`: 要件整理・ユースケース・受け入れ基準作成
  - `.claude/agents/arch-police.md`: アーキテクチャ方針・レイヤー構造・依存関係ルール確立
- **フロー**:
  1. Phase 1: プロジェクト名・タイプ・技術スタック確認
  2. Phase 2: product-manager起動 → ビジョン・ロードマップ・初期バックログ作成
  3. Phase 3: req-analyst起動 → 要件化（機能/非機能）・ユースケース・受け入れ基準定義
  4. Phase 4: arch-police起動 → アーキテクチャスタイル選定・レイヤー構造・ADR作成
  5. Phase 5: ディレクトリ構造生成（ハイブリッド: shared + features + app）
  6. Phase 6: 設定ファイル生成（package.json, tsconfig.json, eslint.config.js, railway.json, .env.example, CLAUDE.md）
  7. Phase 7: 完了報告とNext Steps提示
- **成果物**:
  - **要件**: docs/00-requirements/{master_system_design,functional,non-functional,use-cases,acceptance-criteria}.md
  - **アーキテクチャ**: docs/10-architecture/{overview,layer-structure,dependency-rules}.md + docs/99-adr/001-hybrid-architecture.md
  - **設定**: package.json, tsconfig.json, eslint.config.js, .env.example, railway.json, .gitignore
  - **構造**: src/{shared/{core,infrastructure},features,app}, local-agent/, tests/, .github/workflows/, .claude/CLAUDE.md
- **参照スキル**:
  - **product-manager**: agile-project-management, user-story-mapping, product-vision, prioritization-frameworks, metrics-tracking
  - **req-analyst**: requirements-triage, ambiguity-elimination, use-case-modeling, acceptance-criteria-writing, functional-non-functional-requirements
  - **arch-police**: clean-architecture-principles, solid-principles, dependency-analysis, architectural-patterns
- **設定**:
  - `model: opus` (高度な計画と3エージェント調整が必要)
  - `allowed-tools: [Task, Read, Write, Bash(mkdir*|git init*)]`
  - **トークン見積もり**: 約20-30K（3エージェント起動 + ドキュメント生成）
- **トリガーキーワード**: init, initialize, setup, new project, 新規プロジェクト, 初期化

#### `/ai:scaffold-project`
- **目的**: プロジェクトディレクトリ構造の自動生成
- **引数**: `[template-type]` - テンプレートタイプ(nextjs/react/node等)
- **使用エージェント**: @command-arch
- **成果物**: src/, tests/, docs/, .github/
- **設定**:
  - `model: sonnet`
  - `allowed-tools: Bash(mkdir*|npx*), Write`## `/ai:scaffold-project`
- **目的**: プロジェクトディレクトリ構造の自動生成
- **引数**: `[template-type]` - テンプレートタイプ(nextjs/react/node等)
- **使用エージェント**: @command-arch
- **成果物**: src/, tests/, docs/, .github/
- **設定**:
  - `model: sonnet`
  - `allowed-tools: Bash(mkdir*|npx*), Write`

### `/ai:setup-dev-env`
- **目的**: 開発環境の完全セットアップ
- **引数**: なし
- **使用エージェント**: @devops-eng, @dep-mgr, @hook-master
- **フロー**:
  1. @dep-mgr: package.json作成、依存関係インストール
  2. @hook-master: Git hooks、Claude Code hooks設定
  3. @devops-eng: Docker、環境変数設定
- **成果物**: package.json, .env.example, hooks設定
- **設定**:
  - `model: sonnet`
  - `allowed-tools: Bash(npm*|pnpm*), Read, Write`

### `/ai:init-git-workflow`
- **目的**: Gitワークフローとブランチ戦略の確立
- **引数**: `[strategy]` - ブランチ戦略(git-flow/github-flow/trunk-based)
- **使用エージェント**: @hook-master
- **成果物**: .git/, .gitignore, Git hooks
- **設定**:
  - `model: sonnet`
  - `allowed-tools: Bash(git*), Write`

---

## 2. 要件定義・仕様策定

### `/ai:gather-requirements`
- **目的**: ステークホルダーへのヒアリングと要件整理
- **引数**: `[stakeholder-name]` - ステークホルダー名(オプション)
- **使用エージェント**: @req-analyst
- **スキル活用**: requirements-engineering, interview-techniques
- **成果物**: docs/00-requirements/requirements.md
- **設定**:
  - `model: opus` (複雑なヒアリング分析)
  - `allowed-tools: Read, Write(docs/**)`

### `/ai:create-user-stories`
- **目的**: ユーザーストーリーとアクセプタンスクライテリアの作成
- **引数**: `[feature-name]` - 機能名
- **使用エージェント**: @product-manager, @req-analyst
- **スキル活用**: user-story-mapping, acceptance-criteria-writing
- **成果物**: docs/00-requirements/user-stories.md
- **設定**:
  - `model: opus`
  - `allowed-tools: Read, Write(docs/**)`

### `/ai:define-use-cases`
- **目的**: ユースケース図とシナリオの作成
- **引数**: `[actor-name]` - アクター名
- **使用エージェント**: @req-analyst
- **スキル活用**: use-case-modeling
- **成果物**: docs/00-requirements/use-cases.md
- **設定**:
  - `model: sonnet`
  - `allowed-tools: Read, Write(docs/**)`

### `/ai:write-spec`
- **目的**: 実装可能な詳細仕様書の作成
- **引数**: `[feature-name]` - 機能名
- **使用エージェント**: @spec-writer
- **スキル活用**: markdown-advanced-syntax, technical-documentation-standards
- **成果物**: docs/20-specifications/*.md
- **設定**:
  - `model: sonnet`
  - `allowed-tools: Read, Write(docs/**)`

### `/ai:estimate-project`
- **目的**: プロジェクト規模の見積もり
- **引数**: なし
- **使用エージェント**: @product-manager
- **スキル活用**: estimation-techniques, metrics-tracking
- **成果物**: 見積もりレポート、ストーリーポイント
- **設定**:
  - `model: opus`
  - `allowed-tools: Read, Write(docs/**)`

---

## 3. 設計・アーキテクチャ

### `/ai:design-architecture`
- **目的**: システム全体のアーキテクチャ設計
- **引数**: `[architecture-style]` - アーキテクチャスタイル(clean/hexagonal/onion)
- **使用エージェント**: @arch-police, @domain-modeler
- **スキル活用**: clean-architecture-principles, domain-driven-design
- **成果物**: docs/30-architecture/system-design.md
- **設定**:
  - `model: opus`
  - `allowed-tools: Read, Write(docs/**), Task`

### `/ai:review-architecture`
- **目的**: アーキテクチャレビューと依存関係チェック
- **引数**: なし
- **使用エージェント**: @arch-police
- **スキル活用**: dependency-analysis, code-smell-detection
- **成果物**: アーキテクチャレビューレポート
- **設定**:
  - `model: opus`
  - `allowed-tools: Read, Grep, Glob, Write(docs/**)`

### `/ai:design-domain-model`
- **目的**: ドメインモデルの設計
- **引数**: `[domain-name]` - ドメイン名
- **使用エージェント**: @domain-modeler
- **スキル活用**: domain-driven-design, ubiquitous-language, bounded-context
- **成果物**: src/core/entities/, ドメインモデル図
- **設定**:
  - `model: opus`
  - `allowed-tools: Read, Write(src/core/**|docs/**)`

### `/ai:design-api`
- **目的**: REST API設計とエンドポイント定義
- **引数**: `[resource-name]` - リソース名
- **使用エージェント**: @gateway-dev, @api-doc-writer
- **スキル活用**: api-client-patterns, openapi-specification
- **成果物**: openapi.yaml, API設計書
- **設定**:
  - `model: sonnet`
  - `allowed-tools: Read, Write`

### `/ai:design-database`
- **目的**: データベーススキーマ設計
- **引数**: `[table-name]` - テーブル名(オプション)
- **使用エージェント**: @db-architect
- **スキル活用**: database-normalization, indexing-strategies
- **成果物**: ER図、スキーマ定義
- **設定**:
  - `model: sonnet`
  - `allowed-tools: Read, Write(docs/**|src/infrastructure/database/**)`

---

## 4. フロントエンド開発

### `/ai:create-component`
- **目的**: Reactコンポーネントの作成(Atomic Design準拠)
- **引数**: `[component-name] [type]` - コンポーネント名と種類(atom/molecule/organism)
- **使用エージェント**: @ui-designer
- **スキル活用**: atomic-design, component-composition, accessibility-wcag
- **成果物**: src/components/ui/*.tsx
- **設定**:
  - `model: sonnet`
  - `allowed-tools: Read, Write(src/components/**), Edit`

### `/ai:create-page`
- **目的**: Next.js App Routerページの作成
- **引数**: `[route-path]` - ルートパス(例: /dashboard/settings)
- **使用エージェント**: @router-dev
- **スキル活用**: nextjs-app-router, server-components-patterns, seo-optimization
- **成果物**: src/app/**/*.tsx
- **設定**:
  - `model: sonnet`
  - `allowed-tools: Read, Write(src/app/**), Edit`

### `/ai:setup-state-management`
- **目的**: 状態管理の実装(SWR/React Query)
- **引数**: `[library]` - ライブラリ(swr/react-query)
- **使用エージェント**: @state-manager
- **スキル活用**: data-fetching-strategies, custom-hooks-patterns
- **成果物**: src/hooks/, カスタムフック
- **設定**:
  - `model: sonnet`
  - `allowed-tools: Bash(npm*), Read, Write(src/hooks/**)`

### `/ai:create-custom-hook`
- **目的**: 再利用可能なカスタムフックの作成
- **引数**: `[hook-name]` - フック名(use〜形式)
- **使用エージェント**: @state-manager
- **スキル活用**: custom-hooks-patterns, react-hooks-advanced
- **成果物**: src/hooks/use*.ts
- **設定**:
  - `model: sonnet`
  - `allowed-tools: Read, Write(src/hooks/**), Edit`

### `/ai:setup-design-system`
- **目的**: デザインシステムとTailwind設定
- **引数**: なし
- **使用エージェント**: @ui-designer
- **スキル活用**: design-systems, tailwind-css-patterns
- **成果物**: tailwind.config.ts, デザイントークン
- **設定**:
  - `model: sonnet`
  - `allowed-tools: Bash(npm*), Read, Write, Edit`

### `/ai:optimize-frontend-performance`
- **目的**: フロントエンドパフォーマンス最適化
- **引数**: `[target-page]` - 対象ページパス(オプション)
- **使用エージェント**: @router-dev
- **スキル活用**: web-performance
- **成果物**: 最適化されたコンポーネント、動的インポート
- **設定**:
  - `model: sonnet`
  - `allowed-tools: Read, Edit, Bash(npm run build)`

---

## 5. バックエンド開発

### `/ai:create-entity`
- **目的**: ドメインエンティティの作成
- **引数**: `[entity-name]` - エンティティ名
- **使用エージェント**: @domain-modeler
- **スキル活用**: domain-driven-design, value-object-patterns
- **成果物**: src/core/entities/*.ts
- **設定**:
  - `model: sonnet`
  - `allowed-tools: Read, Write(src/core/**), Edit`

### `/ai:create-executor`
- **目的**: ワークフローExecutorの実装
- **引数**: `[workflow-name]` - ワークフロー名
- **使用エージェント**: @workflow-engine, @logic-dev
- **スキル活用**: design-patterns-behavioral, plugin-architecture
- **成果物**: src/features/*/executor.ts
- **設定**:
  - `model: sonnet`
  - `allowed-tools: Read, Write(src/features/**), Edit`

### `/ai:implement-business-logic`
- **目的**: ビジネスロジックの実装
- **引数**: `[logic-name]` - ロジック名
- **使用エージェント**: @logic-dev
- **スキル活用**: refactoring-techniques, clean-code-practices, tdd-red-green-refactor
- **成果物**: ビジネスロジック実装
- **設定**:
  - `model: sonnet`
  - `allowed-tools: Read, Write(src/**), Edit, Task`

### `/ai:create-api-gateway`
- **目的**: 外部API統合ゲートウェイの実装
- **引数**: `[api-name]` - API名(discord/slack/openai等)
- **使用エージェント**: @gateway-dev
- **スキル活用**: api-client-patterns, retry-strategies, http-best-practices
- **成果物**: src/infrastructure/*/client.ts
- **設定**:
  - `model: sonnet`
  - `allowed-tools: Read, Write(src/infrastructure/**), Edit`

### `/ai:create-schema`
- **目的**: Zodスキーマ定義の作成
- **引数**: `[schema-name]` - スキーマ名
- **使用エージェント**: @schema-def
- **スキル活用**: zod-validation, type-safety-patterns, input-sanitization
- **成果物**: schema.ts
- **設定**:
  - `model: sonnet`
  - `allowed-tools: Read, Write(src/**/*.schema.ts), Edit`

### `/ai:optimize-prompts`
- **目的**: AIプロンプトの最適化
- **引数**: `[prompt-file]` - プロンプトファイルパス
- **使用エージェント**: @prompt-eng
- **スキル活用**: prompt-engineering-for-agents, context-optimization
- **成果物**: 最適化されたプロンプト定義
- **設定**:
  - `model: opus`
  - `allowed-tools: Read, Edit`

---

## 6. データベース

### `/ai:create-db-schema`
- **目的**: Drizzle ORMスキーマの作成
- **引数**: `[table-name]` - テーブル名
- **使用エージェント**: @db-architect
- **スキル活用**: database-normalization, jsonb-optimization, foreign-key-constraints
- **成果物**: src/infrastructure/database/schema.ts
- **設定**:
  - `model: sonnet`
  - `allowed-tools: Read, Write(src/infrastructure/database/**), Edit`

### `/ai:create-migration`
- **目的**: データベースマイグレーションファイル作成
- **引数**: `[migration-name]` - マイグレーション名
- **使用エージェント**: @dba-mgr
- **スキル活用**: database-migrations
- **成果物**: drizzle/migrations/*.sql
- **設定**:
  - `model: sonnet`
  - `allowed-tools: Bash(pnpm drizzle*), Read, Write(drizzle/**)`

### `/ai:create-repository`
- **目的**: Repositoryパターン実装
- **引数**: `[entity-name]` - エンティティ名
- **使用エージェント**: @repo-dev
- **スキル活用**: repository-pattern, query-optimization, transaction-management
- **成果物**: src/infrastructure/repositories/*.ts
- **設定**:
  - `model: sonnet`
  - `allowed-tools: Read, Write(src/infrastructure/repositories/**), Edit`

### `/ai:seed-database`
- **目的**: 初期データ・テストデータの投入
- **引数**: `[environment]` - 環境(development/test/production)
- **使用エージェント**: @dba-mgr
- **スキル活用**: database-seeding
- **成果物**: seed.ts
- **設定**:
  - `model: sonnet`
  - `allowed-tools: Bash(pnpm*), Read, Write`

### `/ai:optimize-queries`
- **目的**: データベースクエリの最適化
- **引数**: `[file-path]` - 対象ファイルパス
- **使用エージェント**: @repo-dev, @dba-mgr
- **スキル活用**: query-optimization, query-performance-tuning
- **成果物**: 最適化されたクエリ
- **設定**:
  - `model: sonnet`
  - `allowed-tools: Read, Edit, Bash(pnpm drizzle-kit studio)`

### `/ai:setup-db-backup`
- **目的**: バックアップ・リカバリ戦略の設定
- **引数**: `[backup-schedule]` - バックアップスケジュール(daily/hourly)
- **使用エージェント**: @dba-mgr
- **スキル活用**: backup-recovery
- **成果物**: バックアップスクリプト、復旧手順書
- **設定**:
  - `model: sonnet`
  - `allowed-tools: Bash, Write(scripts/**|docs/**)`

---

## 7. テスト

### `/ai:generate-unit-tests`
- **目的**: ユニットテストの自動生成
- **引数**: `[target-file]` - テスト対象ファイルパス
- **使用エージェント**: @unit-tester
- **スキル活用**: tdd-principles, vitest-advanced, boundary-value-analysis
- **成果物**: __tests__/*.test.ts
- **設定**:
  - `model: sonnet`
  - `allowed-tools: Read, Write(__tests__/**), Edit`

### `/ai:generate-e2e-tests`
- **目的**: E2Eテストシナリオの作成
- **引数**: `[user-flow]` - ユーザーフロー名
- **使用エージェント**: @e2e-tester
- **スキル活用**: playwright-testing, test-data-management
- **成果物**: tests/*.spec.ts
- **設定**:
  - `model: sonnet`
  - `allowed-tools: Read, Write(tests/**), Edit`

### `/ai:run-all-tests`
- **目的**: 全テストスイートの実行
- **引数**: `[--coverage]` - カバレッジ出力フラグ(オプション)
- **使用エージェント**: @unit-tester, @e2e-tester
- **フロー**:
  1. ユニットテスト実行
  2. E2Eテスト実行
  3. カバレッジレポート生成
- **成果物**: テスト結果、カバレッジレポート
- **設定**:
  - `model: haiku` (シンプルな実行)
  - `allowed-tools: Bash(npm test*|pnpm test*), Read`

### `/ai:tdd-cycle`
- **目的**: TDDサイクル(Red-Green-Refactor)の実行
- **引数**: `[feature-name]` - 機能名
- **使用エージェント**: @unit-tester, @logic-dev
- **スキル活用**: tdd-red-green-refactor, test-doubles
- **成果物**: テスト + 実装コード
- **設定**:
  - `model: sonnet`
  - `allowed-tools: Read, Write, Edit, Bash(npm test*)`

### `/ai:create-test-fixtures`
- **目的**: テストデータ・フィクスチャの作成
- **引数**: `[fixture-type]` - フィクスチャタイプ(user/post/product等)
- **使用エージェント**: @unit-tester, @e2e-tester
- **スキル活用**: test-data-management
- **成果物**: tests/fixtures/*.ts
- **設定**:
  - `model: sonnet`
  - `allowed-tools: Write(tests/fixtures/**)`

### `/ai:fix-flaky-tests`
- **目的**: 不安定なテストの修正
- **引数**: `[test-file]` - 対象テストファイル
- **使用エージェント**: @e2e-tester
- **スキル活用**: flaky-test-prevention
- **成果物**: 安定化されたテスト
- **設定**:
  - `model: sonnet`
  - `allowed-tools: Read, Edit, Bash(npm test*)`

---

## 8. 品質管理

### `/ai:lint`
- **目的**: ESLintによるコードチェック
- **引数**: `[--fix]` - 自動修正フラグ(オプション)
- **使用エージェント**: @code-quality
- **スキル活用**: eslint-configuration
- **成果物**: Lintレポート
- **設定**:
  - `model: haiku`
  - `allowed-tools: Bash(npm run lint*|pnpm lint*), Edit`

### `/ai:format`
- **目的**: Prettierによるコードフォーマット
- **引数**: `[target-pattern]` - 対象パターン(src/**/*.ts等)
- **使用エージェント**: @code-quality
- **スキル活用**: prettier-integration
- **成果物**: フォーマット済みコード
- **設定**:
  - `model: haiku`
  - `allowed-tools: Bash(npx prettier*), Edit`

### `/ai:analyze-code-quality`
- **目的**: コード品質の詳細分析
- **引数**: `[directory]` - 対象ディレクトリ
- **使用エージェント**: @code-quality
- **スキル活用**: static-analysis, code-style-guides
- **成果物**: 品質メトリクスレポート(複雑度、保守性等)
- **設定**:
  - `model: sonnet`
  - `allowed-tools: Read, Grep, Glob, Bash, Write(docs/**)`

### `/ai:setup-pre-commit`
- **目的**: Pre-commit hooksの設定
- **引数**: なし
- **使用エージェント**: @hook-master, @code-quality
- **スキル活用**: commit-hooks, linting-formatting-automation
- **成果物**: .husky/, lint-staged設定
- **設定**:
  - `model: sonnet`
  - `allowed-tools: Bash(npx husky*), Write`

### `/ai:refactor`
- **目的**: コードリファクタリング
- **引数**: `[target-file]` - 対象ファイルパス
- **使用エージェント**: @logic-dev, @arch-police
- **スキル活用**: refactoring-techniques, clean-code-practices
- **成果物**: リファクタリング済みコード
- **設定**:
  - `model: sonnet`
  - `allowed-tools: Read, Edit, Bash(npm test*)`

---

## 9. セキュリティ

### `/ai:security-audit`
- **目的**: 包括的セキュリティ監査
- **引数**: `[scope]` - スコープ(all/auth/api/database)
- **使用エージェント**: @sec-auditor, @auth-specialist, @secret-mgr
- **スキル活用**: owasp-top-10, vulnerability-scanning
- **成果物**: セキュリティレポート
- **設定**:
  - `model: opus`
  - `allowed-tools: Read, Grep, Bash(npm audit), Write(docs/**)`

### `/ai:setup-auth`
- **目的**: 認証・認可システムの実装
- **引数**: `[provider]` - 認証プロバイダー(github/google/credentials)
- **使用エージェント**: @auth-specialist
- **スキル活用**: oauth2-flows, rbac-implementation, nextauth-patterns
- **成果物**: src/auth.ts, Middleware
- **設定**:
  - `model: sonnet`
  - `allowed-tools: Bash(npm install*), Read, Write(src/**), Edit`

### `/ai:scan-vulnerabilities`
- **目的**: 脆弱性スキャン
- **引数**: なし
- **使用エージェント**: @sec-auditor, @dep-mgr
- **スキル活用**: vulnerability-scanning, dependency-auditing
- **成果物**: npm audit結果、脆弱性レポート
- **設定**:
  - `model: sonnet`
  - `allowed-tools: Bash(npm audit|pnpm audit), Write(docs/**)`

### `/ai:setup-rate-limiting`
- **目的**: レート制限の実装
- **引数**: `[rate-limit]` - レート制限値(例: 100/hour)
- **使用エージェント**: @sec-auditor, @gateway-dev
- **スキル活用**: rate-limiting-strategies
- **成果物**: レート制限ミドルウェア
- **設定**:
  - `model: sonnet`
  - `allowed-tools: Read, Write(src/**), Edit`

### `/ai:manage-secrets`
- **目的**: 機密情報の安全な管理
- **引数**: なし
- **使用エージェント**: @secret-mgr
- **スキル活用**: tool-permission-management, best-practices-curation, project-architecture-integration
- **成果物**: .env.example, Secret管理手順書
- **設定**:
  - `model: sonnet`
  - `allowed-tools: Read, Write(.env.example|docs/**)`
  - `disable-model-invocation: false`

### `/ai:rotate-secrets`
- **目的**: APIキー・シークレットのローテーション
- **引数**: `[secret-name]` - シークレット名
- **使用エージェント**: @secret-mgr
- **スキル活用**: tool-permission-management, best-practices-curation
- **成果物**: ローテーションスクリプト
- **設定**:
  - `model: sonnet`
  - `allowed-tools: Bash, Write(scripts/**)`
  - `disable-model-invocation: true` (安全のため手動のみ)

---

## 10. CI/CD・デプロイ

### `/ai:create-ci-workflow`
- **目的**: CI(継続的インテグレーション)ワークフローの作成
- **引数**: `[workflow-type]` - ワークフロータイプ(test/lint/build)
- **使用エージェント**: @gha-workflow-architect
- **スキル活用**: github-actions-syntax, matrix-builds, caching-strategies-gha
- **成果物**: .github/workflows/ci.yml
- **設定**:
  - `model: sonnet`
  - `allowed-tools: Read, Write(.github/workflows/**)`

### `/ai:create-cd-workflow`
- **目的**: CD(継続的デプロイ)ワークフローの作成
- **引数**: `[environment]` - 環境(staging/production)
- **使用エージェント**: @gha-workflow-architect, @devops-eng
- **スキル活用**: deployment-environments-gha, deployment-strategies
- **成果物**: .github/workflows/deploy.yml
- **設定**:
  - `model: sonnet`
  - `allowed-tools: Read, Write(.github/workflows/**)`

### `/ai:create-reusable-workflow`
- **目的**: 再利用可能なワークフローの作成
- **引数**: `[workflow-name]` - ワークフロー名
- **使用エージェント**: @gha-workflow-architect
- **スキル活用**: reusable-workflows
- **成果物**: .github/workflows/reusable-*.yml
- **設定**:
  - `model: sonnet`
  - `allowed-tools: Read, Write(.github/workflows/reusable-**)`

### `/ai:create-composite-action`
- **目的**: カスタムコンポジットアクションの作成
- **引数**: `[action-name]` - アクション名
- **使用エージェント**: @gha-workflow-architect
- **スキル活用**: composite-actions
- **成果物**: .github/actions/*/action.yml
- **設定**:
  - `model: sonnet`
  - `allowed-tools: Write(.github/actions/**)`

### `/ai:optimize-ci-performance`
- **目的**: CI/CDパイプラインの高速化
- **引数**: `[workflow-file]` - 対象ワークフローファイル
- **使用エージェント**: @gha-workflow-architect
- **スキル活用**: cost-optimization-gha, parallel-jobs-gha, caching-strategies-gha
- **成果物**: 最適化されたワークフロー
- **設定**:
  - `model: sonnet`
  - `allowed-tools: Read, Edit`

### `/ai:setup-deployment-environments`
- **目的**: ステージング・本番環境の設定
- **引数**: なし
- **使用エージェント**: @devops-eng, @gha-workflow-architect
- **スキル活用**: deployment-environments-gha, infrastructure-as-code
- **成果物**: 環境設定、承認フロー
- **設定**:
  - `model: sonnet`
  - `allowed-tools: Read, Write(.github/**|docs/**)`

### `/ai:setup-docker`
- **目的**: Dockerコンテナ化
- **引数**: `[service-name]` - サービス名
- **使用エージェント**: @devops-eng
- **スキル活用**: docker-best-practices
- **成果物**: Dockerfile, docker-compose.yml
- **設定**:
  - `model: sonnet`
  - `allowed-tools: Read, Write`

### `/ai:deploy-staging`
- **目的**: ステージング環境へのデプロイ
- **引数**: `[--dry-run]` - ドライランフラグ(オプション)
- **使用エージェント**: @devops-eng, @gha-workflow-architect
- **フロー**: ビルド → テスト → デプロイ → ヘルスチェック
- **成果物**: デプロイ済みアプリケーション
- **設定**:
  - `model: sonnet`
  - `allowed-tools: Bash(gh*), Read`

### `/ai:deploy-production`
- **目的**: 本番環境へのデプロイ(承認フロー付き)
- **引数**: なし
- **使用エージェント**: @devops-eng, @gha-workflow-architect
- **フロー**: 承認 → ビルド → テスト → デプロイ → 監視
- **成果物**: 本番デプロイ
- **設定**:
  - `model: opus`
  - `allowed-tools: Bash(gh*), Read`
  - `disable-model-invocation: true` (安全のため手動のみ)

---

## 11. ドキュメント

### `/ai:generate-api-docs`
- **目的**: API仕様書の自動生成
- **引数**: `[source-path]` - ソースコードパス
- **使用エージェント**: @api-doc-writer
- **スキル活用**: openapi-specification, swagger-ui
- **成果物**: openapi.yaml, Swagger UI
- **設定**:
  - `model: sonnet`
  - `allowed-tools: Read, Write(docs/**|openapi.yaml)`

### `/ai:write-user-manual`
- **目的**: ユーザーマニュアルの作成
- **引数**: `[target-audience]` - 対象読者(beginner/advanced/admin)
- **使用エージェント**: @manual-writer
- **スキル活用**: user-centric-writing, tutorial-design
- **成果物**: docs/user-manual.md
- **設定**:
  - `model: sonnet`
  - `allowed-tools: Read, Write(docs/**)`

### `/ai:create-troubleshooting-guide`
- **目的**: トラブルシューティングガイドの作成
- **引数**: なし
- **使用エージェント**: @manual-writer
- **スキル活用**: troubleshooting-guides
- **成果物**: docs/troubleshooting.md
- **設定**:
  - `model: sonnet`
  - `allowed-tools: Read, Write(docs/**)`

### `/ai:generate-changelog`
- **目的**: CHANGELOG.mdの自動生成
- **引数**: `[from-tag] [to-tag]` - バージョン範囲(オプション)
- **使用エージェント**: @spec-writer
- **フロー**: Git履歴から変更をグループ化
- **成果物**: CHANGELOG.md
- **設定**:
  - `model: sonnet`
  - `allowed-tools: Bash(git log*), Read, Write(CHANGELOG.md)|Edit`

### `/ai:update-readme`
- **目的**: README.mdの更新
- **引数**: なし
- **使用エージェント**: @spec-writer, @manual-writer
- **スキル活用**: markdown-advanced-syntax
- **成果物**: README.md
- **設定**:
  - `model: sonnet`
  - `allowed-tools: Read, Edit`

---

## 12. 運用・監視

### `/ai:setup-logging`
- **目的**: 構造化ロギングの実装
- **引数**: `[log-level]` - ログレベル(debug/info/warn/error)
- **使用エージェント**: @sre-observer
- **スキル活用**: structured-logging, observability-pillars
- **成果物**: ロギング設定、ログ出力実装
- **設定**:
  - `model: sonnet`
  - `allowed-tools: Read, Write(src/**), Edit`

### `/ai:setup-monitoring`
- **目的**: 監視・アラートの設定
- **引数**: `[service-name]` - サービス名
- **使用エージェント**: @sre-observer
- **スキル活用**: slo-sli-design, alert-design, distributed-tracing
- **成果物**: 監視設定、アラートルール
- **設定**:
  - `model: sonnet`
  - `allowed-tools: Read, Write`

### `/ai:setup-local-agent`
- **目的**: ローカルエージェントのセットアップ
- **引数**: なし
- **使用エージェント**: @local-watcher, @local-sync, @process-mgr
- **スキル活用**: multi-agent-systems, agent-lifecycle-management
- **成果物**: local-agent/, ecosystem.config.js
- **設定**:
  - `model: sonnet`
  - `allowed-tools: Bash, Read, Write(local-agent/**)`

### `/ai:manage-dependencies`
- **目的**: 依存パッケージの管理・更新
- **引数**: `[--upgrade-strategy]` - 更新戦略(patch/minor/major)
- **使用エージェント**: @dep-mgr
- **スキル活用**: semantic-versioning, dependency-auditing, upgrade-strategies
- **成果物**: 更新されたpackage.json
- **設定**:
  - `model: sonnet`
  - `allowed-tools: Bash(npm*|pnpm*), Read, Edit`

---

## 13. Claude Code環境

### `/ai:create-agent-command-skill`
- **目的**: エージェント、コマンド、スキルを統合的に作成する高度なメタコマンド
- **引数**: `[domain-name]` - ドメイン名（オプション、未指定時はインタラクティブ）
- **使用エージェント**: @skill-librarian, @meta-agent-designer, @command-arch
- **スキル活用**:
  - **知識層(スキル)**: knowledge-management, progressive-disclosure, documentation-architecture, context-optimization, best-practices-curation
  - **実行層(エージェント)**: agent-architecture-patterns, agent-structure-design, agent-persona-design, tool-permission-management, agent-dependency-design, multi-agent-systems, project-architecture-integration, agent-quality-standards, agent-validation-testing, prompt-engineering-for-agents, agent-template-patterns, agent-lifecycle-management
  - **UI層(コマンド)**: command-structure-fundamentals, command-arguments-system, command-security-design, command-basic-patterns, command-advanced-patterns, command-agent-skill-integration, command-activation-mechanisms, command-error-handling, command-naming-conventions, command-documentation-patterns, command-placement-priority, command-best-practices, command-performance-optimization
- **フロー**:
  - **Phase 0**: 統合設計（全体アーキテクチャ決定、コンポーネント責任分担、依存関係マッピング）
  - **Phase 1**: スキル作成（@skill-librarian: SECIモデルによる暗黙知→形式知化）
  - **Phase 2**: エージェント作成（@meta-agent-designer: ペルソナ設計、ワークフロー定義、Phase 1スキル参照）
  - **Phase 3**: コマンド作成（@command-arch: 統合インターフェース設計、Phase 2エージェント起動）
  - **Phase 4**: 統合検証（依存関係、YAML構文、行数制約、相対パス、ツール権限）
  - **Phase 5**: ドキュメント生成（使用ガイド、テストケース、保守手順書）
- **成果物**:
  - `.claude/skills/[domain-name]/SKILL.md`（500行以内）+ resources/, scripts/, templates/
  - `.claude/agents/[domain-name].md`（450-550行範囲内）+ スキル参照
  - `.claude/commands/ai/[domain-name].md`（YAML Frontmatter + エージェント起動ロジック）
  - `.claude/docs/[domain-name]/`（usage-guide.md, test-cases.md, maintenance.md）
- **設定**:
  - `model: opus`（複雑な統合設計が必要）
  - `allowed-tools: [Task, Read, Write(.claude/**), Grep, Bash]`
  - **品質基準**: 関心の分離、依存性の方向（コマンド→エージェント→スキル）、Progressive Disclosure、単一責任原則、最小権限の原則、テスト可能性
- **使用シナリオ**: 新しい専門分野の完全な統合、複雑なワークフローの自動化システム構築、マルチエージェント協調システムの新規構築、プロジェクト固有のベストプラクティス体系化

### `/ai:create-agent`
- **目的**: 新しいClaude Codeエージェント（.claude/agents/*.md）の作成
- **引数**: `[agent-name] [specialty]` - エージェント名と専門分野（両方オプション、未指定時はインタラクティブ）
- **使用エージェント**: @meta-agent-designer
- **スキル活用**（タスクに応じて必要なスキルのみ読み込み）:
  - **コア設計**: agent-architecture-patterns, agent-structure-design, agent-persona-design, tool-permission-management
  - **統合・協調**: agent-dependency-design, multi-agent-systems, project-architecture-integration
  - **品質・検証**: agent-quality-standards, agent-validation-testing, prompt-engineering-for-agents
  - **テンプレート**: agent-template-patterns, agent-lifecycle-management
- **フロー**:
  1. @meta-agent-designer: Phase 1 - 要件分析とアーキテクチャ選択（単一責任原則の確認）
  2. @meta-agent-designer: Phase 2 - ペルソナとワークフロー設計（実在する専門家ベース、YAML Frontmatter、ツール権限）
  3. @meta-agent-designer: Phase 3 - 依存関係と統合設計（スキル依存、エージェント間協調、プロジェクト統合）
  4. @meta-agent-designer: Phase 4 - 品質基準と検証（完了条件、テストケース）
  5. @meta-agent-designer: Phase 5 - 最適化と完成（System Prompt最適化、450-550行調整）
- **成果物**:
  - .claude/agents/[agent-name].md（450-550行範囲内）
  - 単一責任を持つ特化型エージェント
  - 実在する専門家ベースのペルソナ
  - テストケースと検証基準
- **設定**:
  - `model: opus`（高度なペルソナ設計が必要）
  - `allowed-tools: [Read, Write(.claude/agents/**), Grep, Bash]`
  - **品質基準**: マービン・ミンスキーの『心の社会』、単一責任原則、最小権限の原則、450-550行範囲内、テスト可能性

### `/ai:create-skill`
- **目的**: 新しいClaude Codeスキル（.claude/skills/*/SKILL.md）の作成
- **引数**: `[skill-name]` - スキル名（オプション、未指定時はインタラクティブ）
- **使用エージェント**: @skill-librarian
- **スキル活用**:
  - knowledge-management: SECIモデルによる暗黙知→形式知変換
  - progressive-disclosure: 3層開示モデル（メタデータ→本文→リソース）
  - documentation-architecture: トピック分割、階層設計、リソース最適化
  - context-optimization: トークン効率化、段階的ロード設計
  - best-practices-curation: 知識の収集、更新、陳腐化防止
- **フロー**:
  1. @skill-librarian: Phase 1 - Socialization（暗黙知の特定と共有）
  2. @skill-librarian: Phase 2 - Externalization（暗黙知を形式知に変換、スキル構造設計）
  3. @skill-librarian: Phase 3 - Combination（既存知識との統合、Progressive Disclosure設計）
  4. @skill-librarian: Phase 4 - Internalization（使用条件明確化、品質検証）
- **成果物**:
  - .claude/skills/[skill-name]/SKILL.md（500行以内）
  - resources/ ディレクトリ（詳細リソース、必要に応じて）
  - scripts/ ディレクトリ（自動化スクリプト、必要に応じて）
  - templates/ ディレクトリ（テンプレート、必要に応じて）
- **設定**:
  - `model: opus`（高度な知識体系化が必要）
  - `allowed-tools: [Read, Write(.claude/skills/**), Grep, Bash]`
  - **品質基準**: SECIモデル、Progressive Disclosure、500行以内、相対パス参照、トークン効率

### `/ai:create-command`
- **目的**: 新しいスラッシュコマンド（.claude/commands/[機能]/*.md）の作成
- **引数**: `[command-name]` - コマンド名（オプション、未指定時はインタラクティブ）
- **起動エージェント**:
  - `.claude/agents/command-arch.md`: スラッシュコマンド作成専門エージェント（Phase 2で起動）
- **利用可能スキル**（タスクに応じてcommand-archエージェントが必要時に参照）:
  - **Phase 1（要件収集・分析時）**: command-naming-conventions, command-placement-priority
  - **Phase 2（設計時）**: command-structure-fundamentals, command-arguments-system, command-basic-patterns, command-advanced-patterns（必要時）, command-activation-mechanisms（必要時）
  - **Phase 3（セキュリティ時）**: command-security-design, command-error-handling
  - **Phase 4（ドキュメント時）**: command-documentation-patterns, command-best-practices
  - **Phase 5（最適化時）**: command-performance-optimization, command-agent-skill-integration（必要時）
- **フロー**:
  1. Phase 1: コマンド名の確認と準備（$ARGUMENTSまたはインタラクティブ）
  2. Phase 2: `.claude/agents/command-arch.md` エージェント起動
     - Phase 1: 要件収集と初期分析
     - Phase 2: コマンド設計（命名、Frontmatter、パターン選択、引数設計）
     - Phase 3: エラーハンドリングとセキュリティレビュー
     - Phase 4: ドキュメンテーションと品質保証
     - Phase 5: 統合と引き継ぎ
  3. Phase 3: 検証と完了報告
- **成果物**:
  - `.claude/commands/*.md`（完全なYAML Frontmatter + Markdown本文）
  - 充実したドキュメンテーション
  - 使用例とトラブルシューティングガイド
- **設定**:
  - `argument-hint`: オプション引数1つ（未指定時はインタラクティブ）
  - `allowed-tools`: [Task, Read, Write(.claude/commands/**), Grep, Glob]
    • Task: エージェント起動用
    • Read: 既存コマンド/スキル参照確認用
    • Write(.claude/commands/**): コマンドファイル生成用（制限付き）
    • Grep, Glob: 既存パターン検索・重複チェック用
  - `model: sonnet`（標準的なコマンド作成タスク）
  - **品質基準**: 単一責任原則、組み合わせ可能性、冪等性、セキュリティベストプラクティス
  - **動的最適化**: エージェントが生成するコマンドの argument-hint, allowed-tools, model はタスクに応じて最適化

### `/ai:setup-hooks`
- **目的**: Claude Code hooksの設定
- **引数**: `[hook-type]` - フックタイプ(PreToolUse/PostToolUse/Stop等)
- **使用エージェント**: @hook-master
- **スキル活用**: claude-code-hooks, automation-scripting
- **成果物**: settings.json (Hooks section)
- **設定**:
  - `model: sonnet`
  - `allowed-tools: Read, Edit`

### `/ai:setup-mcp`
- **目的**: MCPサーバーの統合設定
- **引数**: `[mcp-server-name]` - MCPサーバー名
- **使用エージェント**: @mcp-integrator
- **スキル活用**: mcp-protocol, tool-security
- **成果物**: claude_mcp_config.json
- **設定**:
  - `model: sonnet`
  - `allowed-tools: Read, Edit, Write`

### `/ai:optimize-context`
- **目的**: コンテキスト使用量の最適化
- **引数**: なし
- **使用エージェント**: @skill-librarian, @prompt-eng
- **スキル活用**: context-optimization, progressive-disclosure
- **成果物**: 最適化されたスキル、プロンプト
- **設定**:
  - `model: opus`
  - `allowed-tools: Read, Edit`

---

## 14. 統合ワークフロー

### `/ai:full-feature-development`
- **目的**: 機能の完全な開発サイクル
- **引数**: `[feature-name]` - 機能名
- **使用エージェント**:
  - @product-manager, @req-analyst, @spec-writer
  - @domain-modeler, @ui-designer, @logic-dev
  - @unit-tester, @code-quality, @sec-auditor
- **フロー**: 要件定義 → 設計 → 実装 → テスト → レビュー → デプロイ
- **成果物**: 完全な機能実装
- **設定**:
  - `model: opus` (複雑な調整)
  - `allowed-tools: Bash, Read, Write, Edit, Task`

### `/ai:create-full-stack-app`
- **目的**: フルスタックアプリケーションの構築
- **引数**: `[app-name] [--features]` - アプリ名と機能リスト
- **使用エージェント**:
  - @router-dev, @ui-designer, @state-manager
  - @domain-modeler, @db-architect, @repo-dev, @gateway-dev
- **成果物**: フルスタックアプリケーション
- **設定**:
  - `model: opus`
  - `allowed-tools: Bash, Read, Write, Edit, Task`

### `/ai:prepare-release`
- **目的**: リリース準備の完全自動化
- **引数**: `[version]` - バージョン番号(semver形式)
- **使用エージェント**:
  - @unit-tester, @code-quality, @sec-auditor
  - @spec-writer, @devops-eng
- **フロー**: テスト → 品質 → セキュリティ → ドキュメント → ビルド
- **成果物**: リリース準備完了
- **設定**:
  - `model: sonnet`
  - `allowed-tools: Bash, Read, Write, Edit`

### `/ai:code-review-complete`
- **目的**: 包括的なコードレビュー
- **引数**: `[target-path]` - レビュー対象パス
- **使用エージェント**:
  - @arch-police, @code-quality, @sec-auditor, @logic-dev
- **成果物**: 総合レビューレポート
- **設定**:
  - `model: opus`
  - `allowed-tools: Read, Grep, Glob, Write(docs/**)`

### `/ai:onboard-developer`
- **目的**: 新規開発者のオンボーディング
- **引数**: `[developer-role]` - 開発者の役割(frontend/backend/fullstack)
- **使用エージェント**:
  - @manual-writer, @meta-agent-designer, @skill-librarian
- **成果物**: オンボーディングガイド
- **設定**:
  - `model: sonnet`
  - `allowed-tools: Read, Write(docs/**)`

---

## 📊 設定パターン別分類

### model設定

| モデル | 使用コマンド数 | 用途 |
|--------|--------------|------|
| **opus** | 12 | 高度な計画、複雑な分析、マルチエージェント調整 |
| **sonnet** | 36 | 標準的な実装、ドキュメント作成、テスト |
| **haiku** | 2 | シンプルな実行(lint, format) |

### allowed-tools設定パターン

| パターン | コマンド例 | 用途 |
|---------|-----------|------|
| `Bash, Read, Write, Edit, Task` | /full-feature-development | フルアクセス(統合ワークフロー) |
| `Read, Write(docs/**)` | /gather-requirements | ドキュメント専用 |
| `Read, Write(src/**), Edit` | /create-component | ソースコード編集 |
| `Bash(git*), Read, Write` | /init-git-workflow | Git操作限定 |
| `Bash(npm*\|pnpm*), Read, Write` | /setup-dev-env | パッケージマネージャー限定 |
| `Read, Edit` | /optimize-context | 既存ファイル編集のみ |

### disable-model-invocation設定

| 設定値 | コマンド数 | 該当コマンド |
|--------|-----------|-------------|
| `true` | 2 | /rotate-secrets, /deploy-production |
| `false` (デフォルト) | 48 | その他全て |

**安全な操作のみ手動実行を強制**

---

## 🎯 引数設計パターン

### パターン1: 単一必須引数
```
/create-component [component-name]
/create-entity [entity-name]
/create-migration [migration-name]
```

### パターン2: 複数位置引数
```
/create-user-stories [feature-name]
/design-api [resource-name]
/create-custom-hook [hook-name]
```

### パターン3: オプションフラグ
```
/run-all-tests [--coverage]
/lint [--fix]
/deploy-staging [--dry-run]
```

### パターン4: 引数なし(インタラクティブ)
```
/setup-dev-env
/setup-monitoring
/code-review-complete
```

### パターン5: 複雑な引数組み合わせ
```
/create-full-stack-app [app-name] [--features]
/estimate-project
/manage-dependencies [--upgrade-strategy]
```

---

## 🔧 allowed-tools詳細パターン

### Read専用(分析・レビューコマンド)
```yaml
allowed-tools: Read, Grep, Glob
用途: コードレビュー、分析、監査
例: /analyze-code-quality, /security-audit
```

### Write制限(ドキュメント専用)
```yaml
allowed-tools: Read, Write(docs/**)
用途: ドキュメント作成・更新
例: /write-spec, /generate-changelog
```

### Write制限(ソースコード)
```yaml
allowed-tools: Read, Write(src/**), Edit
用途: コード実装
例: /create-component, /implement-business-logic
```

### Bash制限(Git操作)
```yaml
allowed-tools: Bash(git*), Read, Write
用途: Git関連操作
例: /init-git-workflow
```

### Bash制限(パッケージマネージャー)
```yaml
allowed-tools: Bash(npm*|pnpm*|npx*), Read, Write, Edit
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

## 📝 コマンドFrontmatter テンプレート

### 基本テンプレート
```yaml
---
description: [1-2行の明確な説明]
argument-hint: [arg1] [arg2]
allowed-tools: [必要最小限のツールリスト]
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
model: haiku
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

## 15. Git・バージョン管理

### `/ai:commit`
- **目的**: Conventional Commitsに従ったコミット作成
- **引数**: `[commit-message]` - コミットメッセージ(オプション、未指定時は自動生成)
- **使用エージェント**: なし(シンプルな自動化)
- **成果物**: Gitコミット
- **設定**:
  - `model: sonnet`
  - `allowed-tools: Bash(git*)`

### `/ai:create-pr`
- **目的**: Pull Request作成
- **引数**: `[base-branch]` - ベースブランチ(デフォルト: main)
- **使用エージェント**: @spec-writer
- **成果物**: GitHub Pull Request
- **設定**:
  - `model: sonnet`
  - `allowed-tools: Bash(git*|gh*), Read`

### `/ai:merge-pr`
- **目的**: Pull Requestのマージ
- **引数**: `[pr-number]` - PR番号
- **使用エージェント**: なし
- **成果物**: マージ済みブランチ
- **設定**:
  - `model: haiku`
  - `allowed-tools: Bash(gh pr*|git*)`

### `/ai:tag-release`
- **目的**: リリースタグの作成
- **引数**: `[version]` - バージョン番号(v1.0.0形式)
- **使用エージェント**: @spec-writer
- **成果物**: Gitタグ、リリースノート
- **設定**:
  - `model: sonnet`
  - `allowed-tools: Bash(git tag*|gh release*), Read, Write`

---

## 16. パッケージ・依存関係

### `/ai:add-dependency`
- **目的**: 新しい依存パッケージの追加
- **引数**: `[package-name] [--dev]` - パッケージ名、devDependencyフラグ
- **使用エージェント**: @dep-mgr
- **スキル活用**: dependency-auditing
- **成果物**: 更新されたpackage.json
- **設定**:
  - `model: haiku`
  - `allowed-tools: Bash(npm install*|pnpm add*), Read, Edit`

### `/ai:update-dependencies`
- **目的**: 依存パッケージの一括更新
- **引数**: `[strategy]` - 更新戦略(patch/minor/major/latest)
- **使用エージェント**: @dep-mgr
- **スキル活用**: upgrade-strategies, semantic-versioning
- **成果物**: 更新されたpackage.json
- **設定**:
  - `model: sonnet`
  - `allowed-tools: Bash(npm*|pnpm*), Read, Edit`

### `/ai:audit-dependencies`
- **目的**: 依存関係の脆弱性監査
- **引数**: なし
- **使用エージェント**: @dep-mgr, @sec-auditor
- **スキル活用**: dependency-auditing, vulnerability-scanning
- **成果物**: 監査レポート
- **設定**:
  - `model: sonnet`
  - `allowed-tools: Bash(npm audit*|pnpm audit*), Write(docs/**)`

---

## 17. 環境設定・設定ファイル

### `/ai:create-env-file`
- **目的**: .env.exampleの作成・更新
- **引数**: なし
- **使用エージェント**: @secret-mgr
- **スキル活用**: agent-architecture-patterns, best-practices-curation
- **成果物**: .env.example
- **設定**:
  - `model: sonnet`
  - `allowed-tools: Read, Write(.env.example)|Edit`

### `/ai:setup-eslint`
- **目的**: ESLint設定の最適化
- **引数**: `[style-guide]` - スタイルガイド(airbnb/google/standard)
- **使用エージェント**: @code-quality
- **スキル活用**: eslint-configuration, code-style-guides
- **成果物**: .eslintrc.json
- **設定**:
  - `model: sonnet`
  - `allowed-tools: Bash(npm*), Read, Write, Edit`

### `/ai:setup-prettier`
- **目的**: Prettier設定
- **引数**: なし
- **使用エージェント**: @code-quality
- **スキル活用**: prettier-integration
- **成果物**: .prettierrc
- **設定**:
  - `model: haiku`
  - `allowed-tools: Write(.prettierrc*)`

### `/ai:setup-typescript`
- **目的**: TypeScript設定の最適化
- **引数**: `[strictness]` - 厳格度(strict/moderate/loose)
- **使用エージェント**: @schema-def
- **スキル活用**: type-safety-patterns
- **成果物**: tsconfig.json
- **設定**:
  - `model: sonnet`
  - `allowed-tools: Read, Edit`

---

## 18. メンテナンス・最適化

### `/ai:clean-codebase`
- **目的**: 未使用コード・ファイルの削除
- **引数**: `[--dry-run]` - ドライランフラグ
- **使用エージェント**: @code-quality, @arch-police
- **スキル活用**: code-smell-detection
- **成果物**: クリーンなコードベース
- **設定**:
  - `model: sonnet`
  - `allowed-tools: Read, Grep, Glob, Edit, Bash(rm*)`

### `/ai:update-all-docs`
- **目的**: 全ドキュメントの一括更新
- **引数**: なし
- **使用エージェント**: @spec-writer, @api-doc-writer, @manual-writer
- **成果物**: 更新されたドキュメント
- **設定**:
  - `model: sonnet`
  - `allowed-tools: Read, Edit, Write(docs/**)`

### `/ai:analyze-performance`
- **目的**: パフォーマンス分析とボトルネック特定
- **引数**: `[target]` - 分析対象(frontend/backend/database)
- **使用エージェント**: @router-dev, @repo-dev, @dba-mgr
- **スキル活用**: web-performance, query-performance-tuning
- **成果物**: パフォーマンスレポート
- **設定**:
  - `model: sonnet`
  - `allowed-tools: Read, Bash, Write(docs/**)`

### `/ai:migrate-to-latest`
- **目的**: フレームワーク・ライブラリの最新版移行
- **引数**: `[library-name]` - ライブラリ名
- **使用エージェント**: @dep-mgr, @logic-dev
- **スキル活用**: upgrade-strategies
- **成果物**: 移行済みコード
- **設定**:
  - `model: opus`
  - `allowed-tools: Bash(npm*|pnpm*), Read, Edit, Task`

---

## 19. トラブルシューティング・デバッグ

### `/ai:debug-error`
- **目的**: エラーのデバッグと原因特定
- **引数**: `[error-message]` - エラーメッセージ
- **使用エージェント**: @logic-dev, @sec-auditor
- **成果物**: 原因分析とfix提案
- **設定**:
  - `model: opus`
  - `allowed-tools: Read, Grep, Bash`

### `/ai:fix-build-error`
- **目的**: ビルドエラーの修正
- **引数**: なし
- **使用エージェント**: @devops-eng, @code-quality
- **成果物**: 修正されたコード
- **設定**:
  - `model: sonnet`
  - `allowed-tools: Bash(npm run build*), Read, Edit`

### `/ai:fix-type-errors`
- **目的**: TypeScriptエラーの修正
- **引数**: `[file-path]` - 対象ファイル(オプション)
- **使用エージェント**: @schema-def
- **スキル活用**: type-safety-patterns
- **成果物**: 型エラー修正
- **設定**:
  - `model: sonnet`
  - `allowed-tools: Bash(tsc*), Read, Edit`

### `/ai:diagnose-performance-issue`
- **目的**: パフォーマンス問題の診断
- **引数**: `[symptom]` - 症状(slow-render/slow-query/memory-leak)
- **使用エージェント**: @router-dev, @repo-dev, @sre-observer
- **成果物**: 診断レポート、修正提案
- **設定**:
  - `model: opus`
  - `allowed-tools: Read, Bash, Write(docs/**)`

---

## 20. チーム・コラボレーション

### `/ai:sync-team-standards`
- **目的**: チームコーディング規約の同期
- **引数**: なし
- **使用エージェント**: @code-quality, @skill-librarian
- **成果物**: 更新された.claude/CLAUDE.md
- **設定**:
  - `model: sonnet`
  - `allowed-tools: Read, Edit`

### `/ai:create-workflow-template`
- **目的**: チーム用ワークフローテンプレート作成
- **引数**: `[workflow-name]` - ワークフロー名
- **使用エージェント**: @gha-workflow-architect
- **スキル活用**: workflow-templates
- **成果物**: Organization workflow template
- **設定**:
  - `model: sonnet`
  - `allowed-tools: Write(.github/workflow-templates/**)`

### `/ai:onboard-developer`
- **目的**: 新規開発者のオンボーディング
- **引数**: `[developer-role]` - 役割(frontend/backend/fullstack)
- **使用エージェント**: @manual-writer, @meta-agent-designer
- **成果物**: オンボーディングガイド
- **設定**:
  - `model: sonnet`
  - `allowed-tools: Read, Write(docs/**)`

---

## 📊 最終統計

### コマンド総数: 79個

| カテゴリ | コマンド数 |
|---------|-----------|
| 1. プロジェクト初期化 | 4 |
| 2. 要件定義・仕様 | 5 |
| 3. 設計・アーキテクチャ | 5 |
| 4. フロントエンド開発 | 6 |
| 5. バックエンド開発 | 6 |
| 6. データベース | 6 |
| 7. テスト | 6 |
| 8. 品質管理 | 5 |
| 9. セキュリティ | 6 |
| 10. CI/CD・デプロイ | 9 |
| 11. ドキュメント | 5 |
| 12. 運用・監視 | 4 |
| 13. Claude Code環境 | 7 |
| 14. 統合ワークフロー | 5 |
| 15. Git・バージョン管理 | 4 |
| 16. パッケージ・依存関係 | 3 |
| 17. 環境設定 | 4 |
| 18. メンテナンス・最適化 | 4 |
| 19. トラブルシューティング | 4 |
| 20. チーム・コラボレーション | 3 |

### モデル使用分布

| モデル | コマンド数 | 比率 |
|--------|-----------|------|
| opus | 16 | 20% |
| sonnet | 61 | 77% |
| haiku | 2 | 3% |

### 全エージェント活用確認

全36エージェントが最低1コマンド以上で活用されています。

---

以上、**全79コマンド**（エージェント・コマンド・スキル統合作成コマンドを含む）に設定可能要素の概要を追記しました。

