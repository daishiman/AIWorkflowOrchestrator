# 全コマンドリスト - 36エージェント活用版（設定詳細版）

全エージェントとそのスキルを最大限活用するための包括的なコマンドリストです。
各コマンドには設定可能な要素(引数、model、allowed-tools等)を明記しています。

---

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

### `/ai:scaffold-project`
- **目的**: プロジェクト設計書に準拠したハイブリッドアーキテクチャの完全な構造生成
- **引数**: `[template-type]` - hybrid-mvp（このプロジェクト専用）
- **使用エージェント**: なし（設計書準拠の直接実行）
- **参照スキル**:
  - `.claude/skills/clean-architecture-principles/SKILL.md`: Clean Architecture、依存関係ルール
  - `.claude/skills/architectural-patterns/SKILL.md`: ハイブリッドアーキテクチャパターン
  - `.claude/skills/code-style-guides/SKILL.md`: ディレクトリ命名規則
  - `.claude/skills/best-practices-curation/SKILL.md`: プロジェクト構成ベストプラクティス
- **設計書参照**:
  - `docs/00-requirements/master_system_design.md`: 第4章（ディレクトリ構造）、第2章（設定要件）、第5章（依存関係）、第12章（Railway/GHA）
- **フロー**:
  1. 設計書参照（master_system_design.md 第4.3節）
  2. 既存構造チェック
  3. ハイブリッドディレクトリ構造作成（shared/core, shared/infrastructure, features, app, local-agent）
  4. 設定ファイル作成（tsconfig strict, eslint.config.js Flat Config + boundaries, prettier, vitest, drizzle, railway.json, pnpm-workspace.yaml, .env.example）
  5. GitHub Actions ワークフロー作成（ci.yml, deploy.yml, reusable-test.yml, README.md）
  6. コアファイルテンプレート作成（entities, interfaces, errors, registry, schema, ecosystem.config.js）
  7. .gitignore、README作成
  8. 構造検証と設計書準拠チェック
- **成果物**:
  - **ディレクトリ**: .claude/, docs/, src/shared/core/, src/shared/infrastructure/, src/features/, src/app/, local-agent/, .github/workflows/
  - **設定ファイル**: tsconfig.json, eslint.config.js, .prettierrc, vitest.config.ts, drizzle.config.ts, railway.json, pnpm-workspace.yaml, .env.example
  - **コアファイル**: workflow.ts, IWorkflowExecutor.ts, WorkflowError.ts, registry.ts, schema.ts, ecosystem.config.js
  - **ワークフロー**: ci.yml, deploy.yml, reusable-test.yml
- **設定**:
  - `model: sonnet`（構造化タスク）
  - `allowed-tools: Bash(mkdir*), Write, Read`（ディレクトリ作成、ファイル生成、既存確認）

### `/ai:setup-dev-env`
- **目的**: プロジェクト開発環境の完全セットアップ（master_system_design.md準拠）
- **引数**: なし
- **使用エージェント**:
  - `.claude/agents/dep-mgr.md`: Phase 1 - pnpm依存関係・基本設定
  - `.claude/agents/hook-master.md`: Phase 2 - Hooks・品質ツール統合
  - `.claude/agents/devops-eng.md`: Phase 3 - Docker・Railway・PM2統合
- **フロー**:
  1. Phase 1 (@dep-mgr):
     - package.json作成（pnpm 9.x、Node.js 22.x指定）
     - pnpm-workspace.yaml作成（モノレポ）
     - tsconfig.json作成（strict: true、paths: @/*）
     - pnpmインストール、セキュリティ監査
  2. Phase 2 (@hook-master):
     - Git hooks（.husky/pre-commit、.husky/pre-push）
     - Claude Code hooks（settings.json）
     - eslint.config.js（Flat Config、eslint-plugin-boundaries）
     - .prettierrc（singleQuote、semi、tabWidth: 2）
     - vitest.config.ts（**/__tests__/**/*.test.ts、coverage: 60%）
     - lint-staged設定（package.json内）
  3. Phase 3 (@devops-eng):
     - railway.json（Nixpacks、pnpm build/start）
     - Dockerfile（マルチステージビルド）
     - docker-compose.yml（Next.js + PostgreSQL）
     - .env.example（DATABASE_URL、AI APIキー、DISCORD_TOKEN等）
     - drizzle.config.ts（schema、migrations）
     - local-agent/ecosystem.config.js（PM2、autorestart、500M制限）
- **スキル活用**:
  - Phase 1: semantic-versioning, lock-file-management, monorepo-dependency-management
  - Phase 2: git-hooks-concepts, claude-code-hooks, linting-formatting-automation
  - Phase 3: docker-best-practices, infrastructure-as-code
- **成果物**（計18ファイル）:
  - Phase 1: package.json, pnpm-workspace.yaml, tsconfig.json, pnpm-lock.yaml
  - Phase 2: .husky/*, settings.json, eslint.config.js, .prettierrc, vitest.config.ts, lint-staged
  - Phase 3: railway.json, Dockerfile, docker-compose.yml, .env.example, drizzle.config.ts, ecosystem.config.js, .dockerignore
- **設定**:
  - `model: sonnet`
  - `allowed-tools: [Task, Read, Write, Bash(pnpm*)]`（pnpm専用、npm禁止）
- **プロジェクト要件準拠**:
  - pnpm 9.x必須、Node.js 22.x LTS
  - TypeScript strict モード、@/*パスエイリアス
  - ESLint 9.x Flat Config + boundaries plugin
  - Vitest 2.x、カバレッジ60%目標
  - Railway Nixpacks、Railway CLI統合
  - PM2（local-agent、autorestart、500M制限）
- **トリガーキーワード**: setup, environment, dev-env, 開発環境, 初期化, pnpm, railway

### `/ai:init-git-workflow`
- **目的**: Gitワークフローとブランチ戦略の確立
- **引数**: `[strategy]` - ブランチ戦略(git-flow/github-flow/trunk-based)、未指定時は対話的に選択
- **使用エージェント**: `.claude/agents/hook-master.md`
- **依存スキル**:
  - `.claude/skills/git-hooks-concepts/SKILL.md`: Git Hook基本概念、ライフサイクル
  - `.claude/skills/claude-code-hooks/SKILL.md`: Claude Code Hook設計（UserPromptSubmit、PreToolUse、PostToolUse）
  - `.claude/skills/automation-scripting/SKILL.md`: Bash/Node.js自動化スクリプト実装
  - `.claude/skills/linting-formatting-automation/SKILL.md`: ESLint/Prettier統合、lint-staged設定
- **フロー**:
  1. ブランチ戦略確認（引数または対話）
  2. 現状Git設定分析（git status、branch確認）
  3. `.claude/agents/hook-master.md` エージェント起動
     - ブランチ戦略に基づくGit Hooks設計・実装
     - .gitignore最適化
     - Claude Code Hooks統合（UserPromptSubmit、PreToolUse、PostToolUse）
     - 自動化スクリプト実装（Lint、Format、Commit検証）
     - settings.json へのHooks設定統合
  4. 設定ファイル検証
  5. Git Hooks動作テスト
- **成果物**: .gitignore、.claude/hooks/（Hookスクリプト）、.claude/settings.json（Hooks設定）、ブランチ戦略ドキュメント
- **設定**:
  - `model: sonnet`
  - `allowed-tools: [Task, Bash(git*), Read, Write, Grep]`
  - `argument-hint: "[strategy]"`

---

## 2. 要件定義・仕様策定

### `/ai:gather-requirements`
- **目的**: ステークホルダーへのヒアリングと要件整理（**Specification-Driven Development**の起点）
- **引数**: `[stakeholder-name]` - ステークホルダー名(オプション、未指定時は汎用質問)
- **使用エージェント**: `.claude/agents/req-analyst.md`
- **スキル活用**（フェーズ別）:
  - **Phase 1**: `.claude/skills/interview-techniques/SKILL.md`, `.claude/skills/requirements-engineering/SKILL.md`
  - **Phase 2-5**: エージェント内で8つの依存スキルを自動参照（requirements-triage, ambiguity-elimination等）
- **フロー**:
  1. Phase 1: エージェント起動と準備（**master_system_design.md**の参照必須）
  2. Phase 2: プロジェクト固有制約の確認（TDD、Clean Architecture、ハイブリッド構造）
  3. Phase 3: 要件収集実行（ソクラテス式質問、5W1H分析）
  4. Phase 4: 成果物生成（**プロジェクト用語・制約を含む**構造化要件書）
  5. Phase 5: TDDフロー準備（テストファイルパス、詳細仕様への連携）
- **成果物**:
  - `docs/00-requirements/requirements.md`（要件ドキュメント、曖昧性0・完全性>95%）
  - **プロジェクト制約セクション**（TDD必須、ハイブリッド構造、技術スタック）
  - **用語集**（workflows, executor, registry, shared/, features/）
  - **次フェーズ連携情報**（詳細仕様、テスト作成、Executor実装への引き継ぎ）
- **設定**:
  - `model: opus` (複雑なヒアリング分析と曖昧性除去の判断が必要)
  - `allowed-tools: Read(docs/**), Write(docs/00-requirements/**)`（ドキュメント作成に必要な最小権限）
- **プロジェクト固有の考慮**:
  - [ ] TDD準拠（仕様 → テスト → 実装の順序を要件に明記）
  - [ ] ハイブリッド構造（shared/ と features/ の責務を要件に反映）
  - [ ] 用語集（workflows, executor, registry等を必ず定義）
- **トリガーキーワード**: requirements, stakeholder, ヒアリング, 要件整理, インタビュー, 仕様駆動

### `/ai:create-user-stories`
- **目的**: ユーザーストーリーとアクセプタンスクライテリアの作成
- **引数**: `[feature-name]` - 機能名（オプション、未指定時はインタラクティブ）
- **使用エージェント**:
  - `.claude/agents/product-manager.md`: ユーザーストーリーマッピング作成
  - `.claude/agents/req-analyst.md`: アクセプタンスクライテリア定義
- **スキル活用**:
  - **product-manager**: user-story-mapping（必須）, product-vision, prioritization-frameworks
  - **req-analyst**: acceptance-criteria-writing（必須）, requirements-triage, ambiguity-elimination
- **フロー**:
  1. Phase 1: 機能名確認、既存要件の確認（docs/00-requirements/、master_system_design.md）
  2. Phase 2: product-manager起動 → ユーザーストーリーマッピング作成（As a-I want-so that形式、ストーリーポイント見積もり）
  3. Phase 3: req-analyst起動 → アクセプタンスクライテリア定義（Given-When-Then形式、測定可能な受け入れ基準）
  4. Phase 4: 成果物生成と検証
- **成果物**: `docs/00-requirements/user-stories.md`（ユーザーストーリー一覧、アクセプタンスクライテリア、ストーリーポイント見積もり、優先順位情報）
- **設定**:
  - `model: opus`（2エージェント調整が必要）
  - `allowed-tools: [Task, Read, Write(docs/**)]`
- **トリガーキーワード**: user stories, acceptance criteria, ユーザーストーリー, 受け入れ基準

### `/ai:define-use-cases`
- **目的**: ユースケース図とシナリオの作成
- **引数**: `[actor-name]` - アクター名（オプション、未指定時はインタラクティブ）
- **使用エージェント**: `.claude/agents/req-analyst.md`
- **スキル活用**: use-case-modeling（必須）, requirements-triage, functional-non-functional-requirements
- **フロー**:
  1. Phase 1: アクター名確認、既存要件の確認（docs/00-requirements/、既存アクター定義との整合性）
  2. Phase 2: req-analyst起動 → ユースケース図作成（Mermaid形式）、各ユースケースのシナリオ定義、主要・代替シナリオの明確化、事前条件・事後条件の定義
  3. Phase 3: 成果物生成と検証（アクター定義、ユースケース間関係、シナリオ具体性、master_system_design.md整合性）
- **成果物**: `docs/00-requirements/use-cases.md`（ユースケース図Mermaid、アクター定義一覧、各ユースケース詳細シナリオ、主要・代替・例外フロー、事前条件・事後条件）
- **設定**:
  - `model: sonnet`
  - `allowed-tools: [Task, Read, Write(docs/**)]`
- **トリガーキーワード**: use case, ユースケース, アクター, シナリオ

### `/ai:write-spec`
- **目的**: 実装可能な詳細仕様書の作成（TDD準拠、テストケース定義を含む）
- **引数**: `[feature-name]` - 機能名（オプション、未指定時はインタラクティブ）
- **使用エージェント**: `.claude/agents/spec-writer.md`
- **スキル活用**: markdown-advanced-syntax（必須）, technical-documentation-standards（必須）, api-documentation-best-practices（API仕様の場合）, progressive-disclosure（複雑仕様の場合）
- **フロー**:
  1. Phase 1: 機能名確認、既存要件読み込み（docs/00-requirements/、user-stories.md、use-cases.md、master_system_design.md制約事項）
  2. Phase 2: spec-writer起動 → 詳細仕様書作成（実装可能レベル、TDD準拠テストケース、API設計、データモデル設計、エラーハンドリング、パフォーマンス要件）
  3. Phase 3: 成果物生成と検証（エッジケースカバー、テストケース明確性、エラーハンドリング網羅性、master_system_design.md準拠、TDDフロー実現可能性）
- **成果物**: `docs/20-specifications/${feature-name}.md`（機能概要・スコープ、API仕様OpenAPI/Markdown、データモデル定義Drizzle ORM準拠、ビジネスロジック詳細、エラーハンドリング仕様、テストケース定義TDD準拠、パフォーマンス要件・制約、セキュリティ考慮事項、実装例・コードスニペット）
- **設定**:
  - `model: sonnet`
  - `allowed-tools: [Task, Read, Write(docs/**)]`
- **トリガーキーワード**: specification, spec, 仕様書, 詳細仕様, 実装仕様

### `/ai:estimate-project`
- **目的**: プロジェクト規模の見積もりと予測可能な計画の策定
- **引数**: なし（プロジェクトドキュメントから自動収集）
- **使用エージェント**: `.claude/agents/product-manager.md`（Phase 1で起動）
- **スキル活用**（フェーズ別）:
  - **Phase 1**: user-story-mapping, backlog-management
  - **Phase 2**: estimation-techniques（必須）, metrics-tracking（必須）
  - **Phase 3**: risk-management, prioritization-frameworks
  - **Phase 4**: stakeholder-communication
- **フロー**:
  1. Phase 1: プロジェクトドキュメント分析（要件・仕様・バックログ確認）
  2. Phase 2: 見積もり実行（ストーリーポイント集計、ベロシティ推定、リリース予測）
  3. Phase 3: リスク評価（不確実性定量化、リスク調整、バッファ戦略）
  4. Phase 4: 見積もりレポート生成（総合レポート、ストーリーポイント集計、ベロシティ予測、リスク評価）
- **成果物**:
  - `docs/30-project-management/estimates/project-estimate-report.md`（総合レポート、信頼区間付き）
  - `docs/30-project-management/estimates/story-points-summary.md`（ストーリーポイント集計表）
  - `docs/30-project-management/estimates/velocity-forecast.md`（ベロシティ予測、楽観的・現実的・悲観的）
  - `docs/30-project-management/estimates/risk-assessment.md`（リスク評価とバッファ戦略）
- **設定**:
  - `model: opus`（複雑な見積もり分析と予測計算が必要）
  - `allowed-tools: [Task, Read, Write(docs/**), Grep]`
- **トリガーキーワード**: estimate, estimation, 見積もり, 規模, ストーリーポイント, ベロシティ, リリース予測

---

## 3. 設計・アーキテクチャ

### `/ai:design-architecture`
- **目的**: システム全体のアーキテクチャ設計（ハイブリッド構造準拠）
- **引数**: `[architecture-style]` - アーキテクチャスタイル(clean/hexagonal/onion)、未指定時はプロジェクト要件から自動選択
- **使用エージェント**:
  - `.claude/agents/arch-police.md`: Phase 1-2 - アーキテクチャレビュー、依存関係分析、SOLID原則適用
  - `.claude/agents/domain-modeler.md`: Phase 3-4 - ドメインモデル設計、ユビキタス言語確立
- **スキル活用**（エージェントが必要時に参照）:
  - **arch-police**: `.claude/skills/clean-architecture-principles/SKILL.md`, `.claude/skills/architectural-patterns/SKILL.md`, `.claude/skills/solid-principles/SKILL.md`, `.claude/skills/dependency-analysis/SKILL.md`
  - **domain-modeler**: `.claude/skills/domain-driven-design/SKILL.md`, `.claude/skills/ubiquitous-language/SKILL.md`, `.claude/skills/bounded-context/SKILL.md`, `.claude/skills/value-object-patterns/SKILL.md`, `.claude/skills/domain-services/SKILL.md`
- **参照仕様書**: `docs/00-requirements/master_system_design.md` 第5章（アーキテクチャ設計詳細）、第4章（ディレクトリ構造）
- **フロー**:
  1. Phase 0: 準備と`master_system_design.md`確認
  2. Phase 1-2: arch-police起動 → 現状分析、依存関係グラフ構築、SOLID原則適用、ADR作成
  3. Phase 3-4: domain-modeler起動（並列） → ユビキタス言語確立、ドメインモデル設計、値オブジェクト設計
  4. Phase 5: 統合 → システム全体設計書作成、実装ガイドライン提供
- **成果物**:
  - `docs/10-architecture/system-design.md`: システムアーキテクチャ全体設計書
  - `docs/10-architecture/layer-structure.md`: レイヤー構造定義
  - `docs/10-architecture/dependency-rules.md`: 依存関係ルール
  - `docs/10-architecture/domain-model.md`: ドメインモデル設計書
  - `docs/10-architecture/ubiquitous-language.md`: ドメイン用語集
  - `docs/99-adr/002-architecture-principles.md`: アーキテクチャ原則ADR
- **設定**:
  - `model: opus`（複雑な設計判断と2エージェント調整が必要）
  - `allowed-tools: [Task, Read, Write(docs/**), Grep, Glob]`
  - **並列実行**: Phase 1とPhase 3を並列実行可能（約40%時間短縮）
  - **トークン見積もり**: 約25-35K（2エージェント起動 + 複数ドキュメント生成）
- **トリガーキーワード**: architecture, design, アーキテクチャ, システム設計, clean architecture, DDD

### `/ai:review-architecture`
- **目的**: 既存プロジェクトのアーキテクチャを分析し、Clean Architecture原則違反、SOLID原則遵守状況、循環依存、コードスメルを検出
- **引数**: `[scope]` - 分析スコープ（オプション、デフォルトは`src/`全体）
- **使用エージェント**:
  - `.claude/agents/arch-police.md`: アーキテクチャ監視専門エージェント
- **スキル活用**:
  - **Phase 1（構造分析 - 必須）**:
    - `.claude/skills/clean-architecture-principles/SKILL.md`: 依存関係ルール、レイヤー構造、ハイブリッドアーキテクチャマッピング
    - `.claude/skills/dependency-analysis/SKILL.md`: 依存グラフ構築、循環依存検出、安定度メトリクス
  - **Phase 2（原則評価 - 必須）**:
    - `.claude/skills/solid-principles/SKILL.md`: SRP, OCP, LSP, ISP, DIP の評価基準と検出パターン
  - **Phase 3（品質分析 - 推奨）**:
    - `.claude/skills/code-smell-detection/SKILL.md`: クラス/メソッドスメル、アーキテクチャアンチパターン
    - `.claude/skills/architectural-patterns/SKILL.md`: Hexagonal, Onion, Vertical Slice パターン評価
- **参照仕様書**:
  - `docs/00-requirements/master_system_design.md`: 第1.5章（アーキテクチャ原則）、第4章（ディレクトリ構造）、第4.4章（依存関係ルール）
- **成果物**:
  - `docs/10-architecture/review-report.md`: アーキテクチャレビューレポート（優先度付き問題リスト、是正方針、メトリクスダッシュボード）
- **設定**:
  - `model: sonnet`（標準的なレビュータスク）
  - `allowed-tools: [Task, Read, Grep, Glob, Write(docs/**)]`
  - **実行フロー**: Phase 1（構造分析）→ Phase 2（原則評価）→ Phase 3（品質分析）→ Phase 4（レポート生成）
  - **トークン見積もり**: 約15-25K（1エージェント起動 + 5スキル参照 + レポート生成）
- **トリガーキーワード**: architecture review, アーキテクチャレビュー, 依存関係, SOLID, clean architecture, コードスメル

### `/ai:design-domain-model`
- **目的**: ドメイン駆動設計（DDD）に基づくドメインモデルの設計
- **引数**: `[domain-name]` - ドメイン名（オプション、未指定時はインタラクティブ）
- **使用エージェント**: `.claude/agents/domain-modeler.md`
- **スキル活用**（エージェントが必要時に自動参照）:
  - **必須（Phase 1-2）**: `.claude/skills/domain-driven-design/SKILL.md`, `.claude/skills/ubiquitous-language/SKILL.md`, `.claude/skills/value-object-patterns/SKILL.md`
  - **推奨（Phase 3-4）**: `.claude/skills/domain-services/SKILL.md`, `.claude/skills/bounded-context/SKILL.md`
- **フロー**:
  1. Phase 1: プロジェクト仕様確認（master_system_design.md 第6章、第14章）、ドメイン名確認
  2. Phase 2: domain-modeler 起動 → ビジネスルール抽出、Entity/ValueObject/Aggregate識別、ユビキタス言語確立
  3. Phase 3: 成果物検証と報告
- **成果物**:
  - `src/shared/core/entities/[domain-name].ts`: Entity/Aggregate定義
  - `src/shared/core/entities/[domain-name]/*.ts`: ValueObject群
  - `docs/10-architecture/domain-model.md`: ドメインモデル設計書（Mermaid図含む）
  - `docs/10-architecture/ubiquitous-language.md`: ドメイン用語集更新
  - `docs/99-adr/00X-domain-[domain-name].md`: 設計判断のADR
- **設定**:
  - `model: opus`（複雑なドメインモデル設計とビジネスルール抽出が必要）
  - `allowed-tools: [Task, Read, Write(src/shared/core/**|docs/**), Edit, Grep]`
- **トリガーキーワード**: domain, DDD, entity, value object, aggregate, ドメインモデル, エンティティ, 値オブジェクト, ユビキタス言語

### `/ai:design-api`
- **目的**: REST API設計とOpenAPI 3.x仕様書の作成（エンドポイント定義、認証設計、スキーマ生成）
- **引数**: `[resource-name]` - リソース名（オプション、未指定時はインタラクティブ）
- **使用エージェント**:
  - `.claude/agents/gateway-dev.md`: Phase 1 - API設計パターン分析、エンドポイント設計
  - `.claude/agents/api-doc-writer.md`: Phase 2 - OpenAPI仕様書生成、ドキュメント作成
- **スキル活用**（エージェントが必要時に参照）:
  - **gateway-dev**: `.claude/skills/api-client-patterns/SKILL.md`, `.claude/skills/http-best-practices/SKILL.md`
  - **api-doc-writer**: `.claude/skills/openapi-specification/SKILL.md`, `.claude/skills/swagger-ui/SKILL.md`, `.claude/skills/api-documentation-best-practices/SKILL.md`, `.claude/skills/request-response-examples/SKILL.md`
- **フロー**:
  1. Phase 0: 引数確認、master_system_design.md第8章参照、既存パターン確認
  2. Phase 1: gateway-dev起動 → API設計（master_system_design.md第8章準拠）
  3. Phase 2: api-doc-writer起動 → OpenAPI 3.x仕様書生成
  4. Phase 3: 整合性チェック、完了報告
- **成果物**:
  - `docs/20-specifications/api-design-$ARGUMENTS.md`: API設計書
  - `openapi.yaml`: OpenAPI 3.x仕様書
  - `docs/20-specifications/api-documentation-$ARGUMENTS.md`: 詳細ドキュメント（cURL例、SDK例）
  - `src/app/api/[resource]/route.ts`: Next.js実装ガイド（オプション）
- **プロジェクト要件準拠**:
  - REST API 設計原則（master_system_design.md 第8章）
  - APIバージョニング: URL パスベース（/api/v1/...）
  - HTTPステータスコード規約、エラーレスポンス形式、ページネーション実装
- **設定**:
  - `model: sonnet`
  - `allowed-tools: [Task, Read, Write(docs/**|openapi.yaml), Grep]`
  - **トークン見積もり**: 約15-25K（2エージェント起動 + ドキュメント生成）
- **トリガーキーワード**: api, design, endpoint, openapi, swagger, REST, エンドポイント設計, API仕様書

### `/ai:design-database`
- **目的**: データベーススキーマ設計（Drizzle ORM + Neon PostgreSQL準拠）
- **引数**: `[table-name]` - テーブル名（オプション、未指定時は全スキーマ設計）
- **使用エージェント**: `.claude/agents/db-architect.md`
- **スキル活用**（フェーズ別、エージェントが必要時に参照）:
  - **Phase 1（要件理解時）**: なし（既存スキーマ分析のみ）
  - **Phase 2（スキーマ設計時）**: `.claude/skills/database-normalization/SKILL.md`（必須）, `.claude/skills/jsonb-optimization/SKILL.md`（JSONB使用時）
  - **Phase 3（インデックス設計時）**: `.claude/skills/indexing-strategies/SKILL.md`（必須）
  - **Phase 4（制約設計時）**: `.claude/skills/foreign-key-constraints/SKILL.md`（必須）, `.claude/skills/transaction-management/SKILL.md`（必要時）
  - **Phase 5（検証時）**: `.claude/skills/sql-anti-patterns/SKILL.md`（必須）, `.claude/skills/database-migrations/SKILL.md`（マイグレーション実行時）
- **フロー**:
  1. Phase 1: db-architect起動 → 要件理解（master_system_design.md第5.2節、既存schema.ts確認、アクセスパターン特定）
  2. Phase 2: スキーマ設計 → 3NF正規化、JSONB構造設計、Drizzle ORM型安全定義、ソフトデリート対応
  3. Phase 3: インデックス設計 → 外部キー索引、GINインデックス（JSONB）、複合インデックス、部分インデックス
  4. Phase 4: 制約設計 → 外部キー制約、CASCADE動作、CHECK制約、JSONB基本検証
  5. Phase 5: 検証・ドキュメント → SQLアンチパターンチェック、マイグレーション計画、設計文書化
- **成果物**:
  - `docs/database/er-diagram.md`（ER図Mermaid形式、エンティティ関係、カーディナリティ、制約可視化）
  - `src/shared/infrastructure/database/schema.ts`（Drizzleテーブル定義、外部キー、インデックス、制約）
  - `drizzle/migrations/YYYYMMDD_HHMMSS_description.sql`（マイグレーションスクリプト、SQL、インデックス作成）
  - `docs/database/indexing-strategy.md`（インデックス戦略、クエリ最適化ガイドライン、非正規化文書）
- **設計原則準拠**（master_system_design.md 第5.2節）:
  - [ ] 第3正規形準拠（意図的非正規化は文書化）
  - [ ] UUID主キー、created_at/updated_at必須
  - [ ] ソフトデリート（deleted_at）対応
  - [ ] 全外部キーにインデックスと制約
  - [ ] JSONB構造にGINインデックス
  - [ ] トランザクション境界明確化
  - [ ] マイグレーションロールバック可能
- **設定**:
  - `model: opus`（構造化設計タスク）
  - `allowed-tools: [Task, Read, Write(docs/**|src/shared/infrastructure/database/**|drizzle/migrations/**), Grep]`
    • Task: db-architectエージェント起動用
    • Read: 既存スキーマ・設計書確認用
    • Write(制限付き): スキーマ・ドキュメント・マイグレーション生成用
    • Grep: アクセスパターン分析、アンチパターン検索用
  - **トークン見積もり**: 約8-12K（エージェント起動 + スキーマ生成 + ドキュメント作成）
- **トリガーキーワード**: database design, schema, table, ER diagram, データベース設計, スキーマ, テーブル, 正規化

---

## 4. フロントエンド開発

### `/ai:create-component`
- **目的**: Reactコンポーネント（Atomic Design準拠）の作成
- **引数**: `[component-name] [type]` - コンポーネント名と種類(atom/molecule/organism)
- **使用エージェント**: `.claude/agents/ui-designer.md`
- **スキル活用**（ui-designerが必要時に参照）:
  - **必須（Phase 1-2）**: `.claude/skills/design-system-architecture/SKILL.md`, `.claude/skills/component-composition-patterns/SKILL.md`, `.claude/skills/headless-ui-principles/SKILL.md`, `.claude/skills/tailwind-css-patterns/SKILL.md`
  - **必須（Phase 3）**: `.claude/skills/accessibility-wcag/SKILL.md`
  - **推奨（Apple向け）**: `.claude/skills/apple-hig-guidelines/SKILL.md`
- **フロー**:
  1. Phase 1: 引数確認とコンテキスト収集（コンポーネント名、種類、配置場所）
  2. Phase 2: ui-designer起動 → デザインシステム確認 → Compositionパターン適用 → WCAG準拠実装 → Tailwind CSSスタイリング → テスト作成
  3. Phase 3: 検証と報告（TypeScript型チェック、アクセシビリティスコア、テスト結果）
- **成果物**:
  - src/app/components/${component-name}.tsx または src/features/*/components/
  - __tests__/${component-name}.test.tsx（カバレッジ80%目標）
  - Storybook（オプション）: ${component-name}.stories.tsx
- **設定**:
  - `model: sonnet`
  - `allowed-tools: [Task, Read, Write(src/app/**|src/features/**), Edit, Grep]`
- **プロジェクト準拠**:
  - Clean Architecture（依存関係: app/ → features/ → shared/）
  - Next.js App Router（"use client"、Server/Client分離）
  - Zodバリデーション、TypeScript strict mode
  - デザイントークン活用、Compositionパターン
  - WCAG 2.1 AA準拠、カラーコントラスト4.5:1以上
- **トリガーキーワード**: component, ui, react, atomic-design, アクセシビリティ

### `/ai:create-page`
- **目的**: Next.js App Routerのページ（page.tsx）を作成（Server Components優先、パフォーマンス最適化、Metadata API統合）
- **引数**: `[route-path]` - ルートパス（必須、例: /dashboard, /products/[id], /settings/profile）
- **使用エージェント**: `.claude/agents/router-dev.md` - Next.js App Router専門エージェント（Phase 2で起動）
- **スキル活用**（フェーズ別、router-devエージェントが必要時に参照）:
  - **Phase 1（ルーティング設計時）**: `.claude/skills/nextjs-app-router/SKILL.md`, `.claude/skills/server-components-patterns/SKILL.md`
  - **Phase 2（実装時）**: `.claude/skills/nextjs-app-router/SKILL.md`（必須）, `.claude/skills/server-components-patterns/SKILL.md`（必須）
  - **Phase 3（最適化時）**: `.claude/skills/seo-optimization/SKILL.md`（必要時）, `.claude/skills/web-performance/SKILL.md`（必要時）
  - **Phase 4（エラー対応時）**: `.claude/skills/error-boundary/SKILL.md`（必要時）, `.claude/skills/data-fetching-strategies/SKILL.md`（ローディング状態、必要時）
- **フロー**:
  1. Phase 1: 引数確認とルーティング分析（既存構造確認、動的セグメント判定、レンダリング戦略選定）
  2. Phase 2: router-dev起動 → Phase 1（ルーティング構造設計）→ Phase 2（Server/Client Components実装）→ Phase 3（パフォーマンス最適化、必要時）→ Phase 4（Metadata API / SEO設定、必要時）
  3. Phase 3: 検証と報告（Server Components優先、TypeScript型チェック、レイアウト整合性、パフォーマンス基準）
- **成果物**:
  - `src/app/${ルートパス}/page.tsx`（Server Component）
  - `src/app/${ルートパス}/loading.tsx`（必要時、非同期データフェッチ時）
  - `src/app/${ルートパス}/error.tsx`（必要時）
  - 動的メタデータ設定（必要時、SEO最適化）
  - Client Components（必要最小限、分離ファイル）
- **設定**:
  - `model: sonnet`（標準的なページ作成タスク）
  - `allowed-tools: [Task, Read, Write(src/app/**), Edit, Grep, Glob]`
    • Task: router-devエージェント起動用
    • Read: 既存ページ・レイアウト確認用
    • Write(src/app/**): ページファイル生成用（App Routerパス制限）
    • Edit: 既存ファイル編集用（レイアウト、設定等）
    • Grep, Glob: 既存ルーティング構造確認用
- **プロジェクト要件準拠**:
  - ハイブリッドアーキテクチャ: features/ とのデータ連携（Repository パターン）
  - TypeScript strict モード必須
  - TDD準拠（ページ作成後にテスト追加を推奨）
  - パフォーマンス目標（LCP < 2.5s、CLS < 0.1）
- **トリガーキーワード**: page, route, Next.js, App Router, ページ作成

### `/ai:setup-state-management`
- **目的**: React状態管理ライブラリ（SWR/React Query）の完全セットアップと実装
- **引数**: `[library]` - ライブラリ(swr/react-query)、未指定時は要件分析に基づき推奨
- **使用エージェント**: `.claude/agents/state-manager.md`（Phase 2で起動）
- **スキル活用**（フェーズ別、state-managerが必要時に参照）:
  - **Phase 1（分析時）**: react-hooks-advanced, data-fetching-strategies, state-lifting
  - **Phase 2（設計時）**: data-fetching-strategies（必須）, custom-hooks-patterns（必須）
  - **Phase 3（実装時）**: custom-hooks-patterns（必須）, react-hooks-advanced（必須）
  - **Phase 4（エラー処理時）**: error-boundary, data-fetching-strategies（非同期エラー）
  - **Phase 5（最適化時）**: performance-optimization-react（必要時）
- **フロー**:
  1. Phase 1: ライブラリ確認と要件分析（既存パターン、技術スタック）
  2. Phase 2: state-manager起動 → Phase 1（状態要件分析）→ Phase 2（アーキテクチャ設計）→ Phase 3（Hooks実装）→ Phase 4（エラーハンドリング）→ Phase 5（最適化・テスト戦略）
  3. Phase 3: 検証と報告（TypeScript型チェック、テスト戦略提示）
- **成果物**:
  - `src/hooks/` または `src/app/`: カスタムフック（ハイブリッド構造準拠）
  - `package.json`: pnpmで依存追加
  - Context実装（必要時）
  - Error Boundary（必要時）
  - テスト戦略設計（TDD、@unit-testerに引き継ぎ）
- **設定**:
  - `model: sonnet`（標準的な状態管理実装タスク）
  - `allowed-tools: [Task, Read, Write(src/hooks/**|src/app/**), Bash(pnpm add*), Edit]`
    • Task: state-managerエージェント起動用
    • Read: package.json確認、既存パターン確認用
    • Write(src/hooks/**|src/app/**): カスタムフック・Context作成用（ハイブリッド構造準拠）
    • Bash(pnpm add*): 依存関係追加用（pnpm専用、npm禁止）
    • Edit: 既存ファイル修正用
  - **トークン見積もり**: 約8-12K（エージェント起動 + カスタムフック実装 + テスト戦略設計）
- **プロジェクト固有制約**:
  - [ ] pnpm 9.x必須（npm禁止）
  - [ ] TypeScript strict mode、@/*パスエイリアス
  - [ ] TDD原則（仕様→テスト→実装）、Vitest 2.x
  - [ ] ハイブリッド構造（shared/、features/、app/）に配置
    - 機能固有フック: features/[機能名]/hooks/
    - 共通フック: shared/ または app/ 配下
- **トリガーキーワード**: state management, data fetching, SWR, React Query, hooks, 状態管理

### `/ai:create-custom-hook`
- **目的**: 再利用可能なReactカスタムフックを設計・実装（TDD準拠、ハイブリッド構造対応）
- **引数**: `[hook-name]` - フック名（オプション、use〜形式推奨、未指定時はインタラクティブ）
- **使用エージェント**:
  - `.claude/agents/state-manager.md`: React状態管理専門エージェント（Phase 1で起動）
- **スキル活用**（state-managerエージェントが必要時に参照）:
  - **Phase 1（分析時）**: `.claude/skills/custom-hooks-patterns/SKILL.md`（必須）, `.claude/skills/react-hooks-advanced/SKILL.md`
  - **Phase 2（設計時）**: `.claude/skills/custom-hooks-patterns/SKILL.md`（必須）, `.claude/skills/state-lifting/SKILL.md`
  - **Phase 3（実装時）**: `.claude/skills/custom-hooks-patterns/SKILL.md`（必須）, `.claude/skills/react-hooks-advanced/SKILL.md`
  - **Phase 4（テスト時）**: `.claude/skills/custom-hooks-patterns/SKILL.md`（必須）
- **フロー**:
  1. Phase 0: 引数確認（フック名、目的、配置先）
  2. Phase 1: state-manager起動 → フック抽出基準評価、既存コード分析
  3. Phase 2: インターフェース設計、状態配置決定（機能固有 or 共通）
  4. Phase 3: カスタムフック実装、型安全性確保（TypeScript strict mode）
  5. Phase 4: テスト戦略設計（TDDサイクル準備、Vitest使用）
  6. Phase 5: 検証と完了報告
- **成果物**:
  - カスタムフックファイル（`use${HookName}.ts`）
  - 配置パス:
    - 機能固有: `src/features/[機能名]/hooks/`
    - 共通: `src/hooks/`
  - テスト戦略ドキュメント（テストケース定義、モック戦略）
  - 使用例ドキュメント（API説明、型定義）
- **設定**:
  - `model: sonnet`（標準的な実装タスク）
  - `allowed-tools: [Task, Read, Write(src/hooks/**|src/features/*/hooks/**), Edit, Grep]`
    - Task: state-managerエージェント起動用
    - Read: 既存フック・コンポーネント分析用
    - Write(パス制限): カスタムフック作成用
    - Edit: 既存フック改善用
    - Grep: パターン検索用
- **プロジェクト固有の考慮**:
  - [ ] TDD準拠（テスト作成 → 実装 → リファクタリング）
  - [ ] ハイブリッド構造（依存関係ルール: app → features → shared/infrastructure → shared/core）
  - [ ] 型安全性（TypeScript strict mode、@ts-ignore禁止）
  - [ ] カバレッジ（ユニットテスト60%以上を目標）
- **トリガーキーワード**: custom hook, use〜, カスタムフック, ロジック抽出, 再利用

### `/ai:setup-design-system`
- **目的**: デザインシステム基盤とTailwind CSS設定の完全セットアップ（デザイントークン体系、Tailwind設定、コンポーネント規約の統合構築）
- **引数**: なし（インタラクティブ設定推奨）
- **使用エージェント**: `.claude/agents/ui-designer.md`（UI設計・デザインシステム専門エージェント）
- **スキル活用**（ui-designerエージェントが必要時に参照）:
  - **デザインシステム基盤（必須）**: `.claude/skills/design-system-architecture/SKILL.md`（デザイントークン管理、3層モデル）、`.claude/skills/tailwind-css-patterns/SKILL.md`（Tailwind設定、CVA、ダークモード）
  - **コンポーネント設計（推奨）**: `.claude/skills/component-composition-patterns/SKILL.md`、`.claude/skills/headless-ui-principles/SKILL.md`
  - **品質（必須）**: `.claude/skills/accessibility-wcag/SKILL.md`（WCAG 2.1 AA準拠）、`.claude/skills/apple-hig-guidelines/SKILL.md`（Apple向け製品の場合）
- **成果物**: tailwind.config.ts（デザイントークン統合、ダークモード設定）、src/styles/globals.css（CSS変数、トークン定義）、src/styles/tokens/（トークン定義ファイル群）、package.json（Tailwind CSS、CVA、関連パッケージ）
- **プロジェクト準拠**: master_system_design.md 第4章（ハイブリッド構造: src/app/, src/features/）、第2章（TypeScript strict、ESLint統合）、第5章（Clean Architecture依存関係）
- **設定**:
  - `model: sonnet`（設定ファイル生成・パッケージ管理タスク）
  - `allowed-tools: [Bash(pnpm*), Read, Write, Edit]`（pnpm専用、設定ファイル読み書き）
  - **トークン見積もり**: 約8-12K（設定生成、トークン定義、ドキュメント作成）
- **トリガーキーワード**: design-system, tailwind, デザイントークン, スタイル設定, UI基盤

### `/ai:optimize-frontend-performance`
- **目的**: Next.jsフロントエンドのパフォーマンス最適化（Core Web Vitals改善）
- **引数**: `[target-page]` - 対象ページパス（オプション、未指定時は全体最適化）
- **使用エージェント**:
  - `.claude/agents/router-dev.md`: Next.js App Router専門エージェント（Phase 2で起動）
- **スキル活用**（router-devエージェントが必要時に参照）:
  - **Phase 1（分析時）**: `.claude/skills/web-performance/SKILL.md`（必須）
  - **Phase 2（最適化時）**: `.claude/skills/nextjs-app-router/SKILL.md`, `.claude/skills/server-components-patterns/SKILL.md`
  - **Phase 3（検証時）**: `.claude/skills/web-performance/SKILL.md`（必須）
- **フロー**:
  1. Phase 1: 現状分析（バンドルサイズ、画像・フォント使用状況）
  2. Phase 2: router-dev起動 → web-performanceスキル参照 → 最適化実装
     - 画像を next/image で最適化（priority設定含む）
     - フォントを next/font で最適化（display: swap）
     - 重いコンポーネントを動的インポート
     - Code Splitting適用（条件付きコンポーネント）
     - Streaming SSRとSuspense境界追加
  3. Phase 3: 検証（ビルド再実行、バンドルサイズ比較、Core Web Vitals目標値チェック）
- **成果物**:
  - 最適化されたコンポーネント（next/image、next/font適用）
  - 動的インポート実装（重いコンポーネント、条件付きUI）
  - loading.tsx追加（非同期ページ）
  - ビルドサイズ削減レポート
  - Core Web Vitals改善レポート（LCP ≤2.5s、FID ≤100ms、CLS ≤0.1）
- **設定**:
  - `model: sonnet`（標準的なパフォーマンス最適化タスク）
  - `allowed-tools: [Task, Read, Edit, Bash(npm run build)]`
    • Task: router-devエージェント起動用
    • Read: 既存コンポーネント・ページ確認用
    • Edit: 最適化コード適用用
    • Bash(npm run build): ビルド検証・バンドル分析用
- **トリガーキーワード**: performance, optimize, frontend, パフォーマンス, 最適化, LCP, Core Web Vitals

---

## 5. バックエンド開発

### `/ai:create-entity`
- **目的**: ドメインエンティティの作成（DDD準拠）
- **引数**: `[entity-name]` - エンティティ名（オプション、未指定時はインタラクティブ）
- **使用エージェント**: `.claude/agents/domain-modeler.md`
- **スキル活用**（domain-modelerエージェントが必要時に自動参照）:
  - **Phase 1-2（必須）**: `.claude/skills/domain-driven-design/SKILL.md`, `.claude/skills/ubiquitous-language/SKILL.md`, `.claude/skills/value-object-patterns/SKILL.md`
  - **Phase 3（推奨）**: `.claude/skills/domain-services/SKILL.md`, `.claude/skills/bounded-context/SKILL.md`
- **フロー**:
  1. Phase 1: domain-modelerエージェント起動 → 要件収集（エンティティ名、ドメイン責務、ユビキタス言語）
  2. Phase 2: スキル参照によるモデル設計（Entity/ValueObject識別、不変条件定義、ドメインサービス特定）
  3. Phase 3: 成果物生成と検証（Clean Architecture準拠、用語一貫性、既存エンティティとの整合性）
- **成果物**: `src/shared/core/entities/[EntityName].ts`（TypeScript型定義、バリデーションロジック、ドメインルール）
- **設定**:
  - `model: sonnet`（標準的なドメインモデル設計タスク）
  - `allowed-tools: [Task, Read, Write(src/shared/core/**), Edit, Grep]`（最小権限、パス制限）
- **トリガーキーワード**: entity, domain, ドメインエンティティ, DDD

### `/ai:create-executor`
- **目的**: 新しいワークフロー機能のExecutor実装作成（src/features/[workflow-name]/executor.ts）
- **引数**: `[workflow-name]` - ワークフロー名（オプション、未指定時はインタラクティブ）
- **使用エージェント**:
  - `.claude/agents/logic-dev.md`: ビジネスロジック実装専門エージェント（Phase 2で起動）
- **フロー**:
  1. Phase 1: ワークフロー名・機能目的・入出力スキーマの確認
  2. Phase 2: logic-dev起動 → executor.ts実装（TDD Red-Green-Refactorサイクル）
  3. Phase 3: 成果物確認（executor.ts、テストファイル、テストパス確認）
- **成果物**:
  - `src/features/{workflow-name}/executor.ts` - IWorkflowExecutor実装
  - `src/features/{workflow-name}/__tests__/executor.test.ts` - Vitestテスト
- **参照スキル**（logic-devが必要時に参照）:
  - `.claude/skills/tdd-red-green-refactor/SKILL.md`: TDD Red-Green-Refactorサイクル（Phase 1）
  - `.claude/skills/transaction-script/SKILL.md`: トランザクションスクリプトパターン（Phase 2）
  - `.claude/skills/clean-code-practices/SKILL.md`: Clean Codeプラクティス（Phase 2）
  - `.claude/skills/refactoring-techniques/SKILL.md`: リファクタリング技法（Phase 3）
  - `.claude/skills/test-doubles/SKILL.md`: テストダブル選択（Phase 1）
- **設計書参照**:
  - `docs/00-requirements/master_system_design.md`: 第5.2節（Executor責務）、第6.1節（IWorkflowExecutorインターフェース）、第11節（機能追加手順）
  - `docs/20-specifications/features/{workflow-name}.md`: 機能仕様（存在する場合）
- **設定**:
  - `model: opus`（標準的な実装タスク）
  - `allowed-tools: [Task, Read, Write(src/features/**), Grep]`（logic-dev起動、既存パターン参照、executor.ts生成、パターン検索）
  - **トークン見積もり**: 約5-8K（logic-dev起動 + 実装 + テスト）
- **トリガーキーワード**: executor, workflow, ビジネスロジック, 機能実装, TDD

### `/ai:implement-business-logic`
- **目的**: ビジネスロジック実装（TDD準拠のExecutorクラス実装）
- **引数**: `[logic-name]` - ロジック名（例: youtube-summarize, meeting-transcribe）
- **使用エージェント**: `.claude/agents/logic-dev.md`（ビジネスロジック実装専門）
- **スキル活用**（logic-devエージェントがフェーズに応じて参照）:
  - **Phase 2（TDD実装時）**:
    - `.claude/skills/tdd-red-green-refactor/SKILL.md`: Red-Green-Refactorサイクル
    - `.claude/skills/transaction-script/SKILL.md`: Executorパターン実装
    - `.claude/skills/test-doubles/SKILL.md`: テストダブル選択
  - **Phase 3（リファクタリング時）**:
    - `.claude/skills/refactoring-techniques/SKILL.md`: コードスメル検出・改善
    - `.claude/skills/clean-code-practices/SKILL.md`: 命名・関数設計
- **参照仕様書**:
  - `docs/00-requirements/master_system_design.md`: 第5章（ハイブリッドアーキテクチャ）、第6章（IWorkflowExecutor）
- **フロー**:
  1. Phase 1: 引数確認、仕様書・スキーマ参照
  2. Phase 2: logic-devエージェント起動 → TDD実装（Red-Green-Refactor）
  3. Phase 3: テスト実行、実装サマリー報告
- **成果物**:
  - `src/features/[logic-name]/executor.ts`: IWorkflowExecutor準拠の実装
  - `src/features/[logic-name]/__tests__/executor.test.ts`: ユニットテスト（Vitest）
  - `src/features/[logic-name]/schema.ts`: 入出力スキーマ（Zod）※未存在の場合
- **品質基準**:
  - テストカバレッジ: 80%以上
  - 関数の長さ: 30行以下
  - 循環的複雑度: 10以下
- **設定**:
  - `model: opus`
  - `allowed-tools: [Task, Read, Write(src/features/**), Edit, Grep, Glob, Bash(pnpm test*)]`
- **トリガーキーワード**: business logic, executor, implement, 実装, ビジネスロジック, TDD

### `/ai:create-api-gateway`
- **目的**: 外部API統合ゲートウェイの実装（Discord、Slack、OpenAI等）
- **引数**: `[api-name]` - API名（例: discord, slack, openai, stripe）
- **使用エージェント**: `.claude/agents/gateway-dev.md`
- **スキル活用**（gateway-devエージェントが参照）:
  - Phase 2: `.claude/skills/api-client-patterns/SKILL.md`（Adapter、Facade、Anti-Corruption Layer）
  - Phase 3: `.claude/skills/http-best-practices/SKILL.md`（ステータスコード、べき等性）、`.claude/skills/authentication-flows/SKILL.md`（OAuth 2.0、JWT、API Key）
  - Phase 4: `.claude/skills/retry-strategies/SKILL.md`（Exponential Backoff、Circuit Breaker）、`.claude/skills/rate-limiting/SKILL.md`（429処理、バックオフ戦略）
- **成果物**:
  - `src/shared/infrastructure/[api-name]/client.ts` - APIクライアント実装
  - `src/shared/infrastructure/[api-name]/transformer.ts` - データ変換層（腐敗防止層）
  - `src/shared/infrastructure/[api-name]/__tests__/` - テスト（カバレッジ85%以上）
  - `.env.example` - 環境変数設定例追加
- **プロジェクト制約** (master_system_design.md準拠):
  - ハイブリッドアーキテクチャ: shared/infrastructure配下に配置
  - Clean Architecture: 依存関係は Infrastructure → Core
  - 腐敗防止層（Anti-Corruption Layer）必須
  - リトライ戦略、サーキットブレーカー、タイムアウト必須実装
  - テストカバレッジ85%以上
  - 認証情報は環境変数で管理（.env禁止、ハードコード禁止）
- **設定**:
  - `model: opus` (複雑なアーキテクチャ設計、セキュリティ設計が必要)
  - `allowed-tools: [Read, Write, Grep, Bash]`（エージェント起動、実装、テスト実行）
- **トリガーキーワード**: api, gateway, integration, 外部連携, Discord, Slack, OpenAI

### `/ai:create-schema`
- **目的**: Zodスキーマ定義の作成（Zod 3.x + TypeScript 5.x準拠）
- **引数**: `[schema-name]` - スキーマ名（例: user, auth/login-request）（オプション、未指定時はインタラクティブ）
- **使用エージェント**:
  - `.claude/agents/schema-def.md`: スキーマ定義専門エージェント（Zod設計、型推論、バリデーション）
- **フロー**:
  1. Phase 1: 対象スキーマ確認、既存スキーマ・ドメインモデル分析
  2. Phase 2: schema-def起動 → Zodスキーマ設計（基本スキーマ、カスタムバリデーション、型推論）
  3. Phase 3: セキュリティ・サニタイゼーション（XSS/SQLi/コマンドインジェクション防止）
  4. Phase 4: テスト作成（スキーマテスト、エッジケース、エラーメッセージ検証）
  5. Phase 5: 統合・ドキュメント化（型エクスポート、API/フォーム連携）
- **成果物**:
  - `features/[feature]/schema.ts`（Zodスキーマ定義）
  - `features/[feature]/schema.test.ts`（スキーマテスト）
  - 型エクスポート（`z.infer<typeof schema>`）
- **参照スキル**:
  - **Phase 2**: `.claude/skills/zod-validation/SKILL.md`, `.claude/skills/type-safety-patterns/SKILL.md`
  - **Phase 3**: `.claude/skills/input-sanitization/SKILL.md`
  - **Phase 5（必要時）**: `.claude/skills/api-contract-design/SKILL.md`, `.claude/skills/form-validation/SKILL.md`
- **設計書参照**:
  - `docs/00-requirements/master_system_design.md`: 第2.1節（入力バリデーション原則）
- **設定**:
  - `model: sonnet`（構造化スキーマ設計タスク）
  - `allowed-tools: [Task, Read, Write(src/**/*.schema.ts|features/**/*.schema.ts), Edit, Grep, Glob]`
- **トリガーキーワード**: schema, zod, validation, バリデーション, スキーマ, 型定義, input validation

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

