---
description: |
  新規プロジェクトの完全な初期化を実行するコマンド。
  プロジェクトゴール定義、初期要件整理、アーキテクチャ方針確立を自動化します。

  🤖 起動エージェント（起動順）:
  1. `.claude/agents/product-manager.md`: プロジェクトゴール・ロードマップ定義
  2. `.claude/agents/req-analyst.md`: 初期要件の整理と受け入れ基準作成
  3. `.claude/agents/arch-police.md`: アーキテクチャ方針の確立とレイヤー構造設計

  📚 各エージェントが参照するスキル:

  **product-manager エージェント:**
  - `.claude/skills/agile-project-management/SKILL.md`: スクラム・カンバン手法
  - `.claude/skills/user-story-mapping/SKILL.md`: ユーザージャーニー可視化
  - `.claude/skills/product-vision/SKILL.md`: OKR設定、ロードマップ作成
  - `.claude/skills/prioritization-frameworks/SKILL.md`: MoSCoW法、RICE Scoring
  - `.claude/skills/metrics-tracking/SKILL.md`: ベロシティ、バーンダウン測定

  **req-analyst エージェント:**
  - `.claude/skills/requirements-triage/SKILL.md`: MoSCoW分類、優先順位付け
  - `.claude/skills/ambiguity-elimination/SKILL.md`: 曖昧性除去パターン
  - `.claude/skills/use-case-modeling/SKILL.md`: ユースケース構造化
  - `.claude/skills/acceptance-criteria-writing/SKILL.md`: Given-When-Then基準
  - `.claude/skills/functional-non-functional-requirements/SKILL.md`: 要件分類

  **arch-police エージェント:**
  - `.claude/skills/clean-architecture-principles/SKILL.md`: レイヤー構造、依存関係ルール
  - `.claude/skills/solid-principles/SKILL.md`: SRP, OCP, LSP, ISP, DIP
  - `.claude/skills/dependency-analysis/SKILL.md`: 依存グラフ構築
  - `.claude/skills/architectural-patterns/SKILL.md`: Hexagonal, Onion パターン

  ⚙️ このコマンドの設定:
  - argument-hint: オプション引数1つ（プロジェクト名、未指定時はインタラクティブ）
  - allowed-tools: エージェント起動、ファイル作成、ドキュメント生成用
    • Task: エージェント起動用
    • Read: 既存構造確認用
    • Write: プロジェクトドキュメント・CLAUDE.md生成用
    • Bash: ディレクトリ作成、Git初期化用
  - model: opus（高度な計画と調整が必要）

  トリガーキーワード: init, initialize, setup, new project, 新規プロジェクト, 初期化
argument-hint: "[project-name]"
allowed-tools: [Task, Read, Write, Bash(mkdir*|git init*)]
model: opus
---

# プロジェクト初期化

## Phase 1: プロジェクト名確認

プロジェクト名: $ARGUMENTS

引数未指定の場合:
- ユーザーに対話的にプロジェクト名を質問
- プロジェクトタイプ（Web/Mobile/Backend）を確認
- 主要技術スタック（言語・フレームワーク）を確認

## Phase 2: Product Manager エージェント起動

Task ツールで `.claude/agents/product-manager.md` を起動:

```
エージェント: product-manager
プロジェクト名: ${プロジェクト名}

依頼内容:
1. プロダクトビジョンとゴールステートメント作成
2. 初期ロードマップの策定（3-6ヶ月）
3. OKR設定と主要マイルストーン定義
4. 優先順位付けされた初期バックログ作成
5. メトリクス追跡方針の確立

必須成果物:
- docs/00-vision/vision-statement.md
- docs/00-vision/roadmap.md
- docs/00-vision/okrs.md
- 初期バックログ（優先順位付き）

参照スキル（エージェントが自動参照）:
- agile-project-management
- user-story-mapping
- product-vision
- prioritization-frameworks
- metrics-tracking
```

**期待成果物:**
- プロジェクトビジョン文書
- 3-6ヶ月ロードマップ
- OKR定義
- 優先順位付き初期バックログ

## Phase 3: Requirements Analyst エージェント起動

Task ツールで `.claude/agents/req-analyst.md` を起動:

```
エージェント: Requirements Analyst
プロジェクト名: ${プロジェクト名}
入力: Phase 2で作成されたバックログ

依頼内容:
1. バックログアイテムの要件化（曖昧性除去）
2. 機能要件と非機能要件の分類（master_system_design.md Section 2.x 準拠）
3. ユースケースモデリング（基本フロー・代替フロー・例外フロー）
4. 受け入れ基準定義（Given-When-Then、TDD対応）
5. 要件の検証と一貫性確認
6. master_system_design.md の非機能要件セクション反映確認

必須成果物:
- docs/00-requirements/functional-requirements.md（機能要件）
- docs/00-requirements/non-functional-requirements.md（Section 2.x: 認証、TLS、ログ、テスト戦略）
- docs/00-requirements/use-cases.md（ユースケース）
- docs/00-requirements/acceptance-criteria.md（TDD対応の受け入れ基準）

master_system_design.md との整合性:
- Section 2.1: 基本要件（認証、TLS、Zod、ログ）を反映
- Section 2.4: テスト戦略（TDD、テストピラミッド）を反映
- Section 2.5: 設定ファイル要件を反映

参照スキル（エージェントが自動参照）:
- requirements-triage
- ambiguity-elimination
- use-case-modeling
- acceptance-criteria-writing
- functional-non-functional-requirements
```

**期待成果物:**
- 機能要件仕様書（ワークフロー実行、Discord連携等）
- 非機能要件仕様書（認証、TLS、ログ、TDD戦略）
- ユースケース定義（基本・代替・例外フロー）
- 受け入れ基準（Given-When-Then、テスト可能）

## Phase 4: Architecture Police エージェント起動

Task ツールで `.claude/agents/arch-police.md` を起動:

```
エージェント: arch-police
プロジェクト名: ${プロジェクト名}
入力: Phase 3で作成された要件仕様
参照仕様: docs/00-requirements/master_system_design.md

依頼内容:
1. ハイブリッドアーキテクチャ（shared + features）の適用確認
2. レイヤー構造の詳細定義（Section 4.4: app → features → shared/infrastructure → shared/core）
3. 依存関係ルールの確立（ESLint boundaries plugin設定含む）
4. SOLID原則適用指針の策定
5. ADR作成（アーキテクチャスタイル選定理由）

必須成果物:
- docs/10-architecture/architecture-overview.md（ハイブリッド構造の全体像）
- docs/10-architecture/layer-structure.md（共通インフラ vs 機能プラグインの責務）
- docs/10-architecture/dependency-rules.md（レイヤー間依存、features間独立性）
- docs/99-adr/001-hybrid-architecture.md（ハイブリッド採用理由）

master_system_design.md との整合性:
- Section 4.3: ディレクトリ構造に準拠
- Section 4.4: 依存関係ルールに準拠
- Section 5.1: ハイブリッドアーキテクチャ原則に準拠

参照スキル（エージェントが自動参照）:
- clean-architecture-principles
- solid-principles
- dependency-analysis
- architectural-patterns
```

**期待成果物:**
- ハイブリッドアーキテクチャ概要（shared + features）
- レイヤー構造定義（依存方向の明示）
- ESLint boundaries 設定
- ADR（アーキテクチャスタイル選定理由）

## Phase 5: プロジェクト構造生成

master_system_design.md (Section 4.3) に基づいてハイブリッドアーキテクチャ構造を作成:

```bash
# プロジェクトルート作成
mkdir -p ${プロジェクト名}
cd ${プロジェクト名}

# ドキュメント構造（Section 4.3 準拠）
mkdir -p docs/{00-requirements,10-architecture,20-specifications/features,99-adr}

# ソースディレクトリ（ハイブリッド: shared + features + app）
# Section 4.3 の詳細構造に従う
mkdir -p src/shared/core/{entities,interfaces,errors}
mkdir -p src/shared/infrastructure/{database/{repositories},ai/providers,discord/{events,commands},storage}
mkdir -p src/features
mkdir -p src/app/api/{webhook/generic,agent/{upload,poll},health}

# ローカルエージェント（Section 9 準拠）
mkdir -p local-agent/{src,__tests__}

# CI/CD（Section 12.2 準拠）
mkdir -p .github/workflows

# テストディレクトリ
mkdir -p tests/{unit,integration,e2e}

# Claude Code 設定
mkdir -p .claude/{agents,skills,commands}

# Git初期化
git init
```

## Phase 6: 設定ファイル生成

master_system_design.md (Section 2.5, 3.x, 13.x) に基づいて設定ファイルを生成:

### 6.1 CLAUDE.md 生成

```
Write: .claude/CLAUDE.md

内容（master_system_design.md から抽出）:
- プロジェクト概要（Section 1.1-1.2: ハイブリッド構成、無限の拡張性）
- アーキテクチャ原則（Section 1.5: Clean Architecture、Event-driven、TDD）
- ディレクトリ構造（Section 4.3: ハイブリッド構造）
- 依存関係ルール（Section 4.4: app → features → shared/infrastructure → shared/core）
- 技術スタック（Section 3.x: Next.js 15.x, TypeScript 5.x, pnpm, Drizzle, Neon）
- 開発ワークフロー（Section 2.4: TDD, Red-Green-Refactor）
- 品質基準（Section 2.4: カバレッジ60%以上）
```

### 6.2 package.json 生成

```
Write: package.json

内容:
- name: ${プロジェクト名}
- version: 0.1.0
- packageManager: "pnpm@9.x"
- scripts:
  - dev: "next dev"
  - build: "next build"
  - start: "next start"
  - test: "vitest"
  - typecheck: "tsc --noEmit"
  - lint: "eslint ."
  - format: "prettier --write ."
- dependencies: Next.js 15.x, TypeScript 5.x, Drizzle, Zod
- devDependencies: Vitest, Playwright, ESLint 9.x, Prettier
```

### 6.3 TypeScript 設定

```
Write: tsconfig.json

内容（Section 2.5 準拠）:
- strict: true（必須）
- module: "ESNext"
- moduleResolution: "bundler"
- paths: {"@/*": ["./src/*"]}
- noUnusedLocals: true
- noUnusedParameters: true
```

### 6.4 ESLint 設定

```
Write: eslint.config.js

内容（Section 2.5 準拠）:
- Flat Config形式（ESLint 9.x）
- @typescript-eslint ルール
- eslint-plugin-boundaries（依存関係違反検出）
- no-unused-vars, no-console (warn)
```

### 6.5 環境変数テンプレート

```
Write: .env.example

内容（Section 13.1 準拠）:
- DATABASE_URL=（Neon接続文字列）
- OPENAI_API_KEY=
- ANTHROPIC_API_KEY=
- GOOGLE_AI_API_KEY=
- XAI_API_KEY=
- DISCORD_TOKEN=
- DISCORD_CLIENT_ID=
- AGENT_SECRET_KEY=
```

### 6.6 Railway 設定

```
Write: railway.json

内容（Section 12.1 準拠）:
- builder: "NIXPACKS"
- buildCommand: "pnpm install && pnpm build"
- startCommand: "pnpm start"
- restartPolicyType: "ON_FAILURE"
```

## Phase 7: 完了報告

生成されたファイルとディレクトリ構造を報告:

```
✅ プロジェクト初期化完了: ${プロジェクト名}

📁 生成されたドキュメント:
- docs/00-requirements/master_system_design.md（システム設計の正本）
- docs/00-requirements/functional-requirements.md
- docs/00-requirements/non-functional-requirements.md
- docs/00-requirements/use-cases.md
- docs/00-requirements/acceptance-criteria.md
- docs/10-architecture/architecture-overview.md
- docs/10-architecture/layer-structure.md（ハイブリッド: shared + features）
- docs/10-architecture/dependency-rules.md
- docs/99-adr/001-architecture-style.md
- .claude/CLAUDE.md

⚙️ 生成された設定ファイル:
- package.json（pnpm, Next.js 15.x, TypeScript 5.x）
- tsconfig.json（strict mode, path aliases）
- eslint.config.js（Flat Config, boundaries plugin）
- .env.example（全API keys, DB接続文字列）
- railway.json（Nixpacks, auto-deploy設定）
- .gitignore

🏗️ ディレクトリ構造（master_system_design.md Section 4.3 準拠）:
- src/shared/core/（ドメイン共通: entities, interfaces, errors）
- src/shared/infrastructure/（共通インフラ: database, ai, discord, storage）
- src/features/（機能プラグイン: 垂直スライス）
- src/app/（Next.js App Router: api, pages）
- local-agent/（ローカルファイル監視エージェント）
- tests/（unit, integration, e2e）
- .github/workflows/（CI/CD）

📊 技術スタック（master_system_design.md Section 3.x）:
- Framework: Next.js 15.x (App Router)
- Language: TypeScript 5.x (strict mode)
- Package Manager: pnpm 9.x
- Database: Neon (Serverless PostgreSQL) + Drizzle ORM
- AI: Vercel AI SDK 4.x (OpenAI, Anthropic, Google, xAI)
- Integration: discord.js 14.x
- Testing: Vitest 2.x, Playwright
- Deployment: Railway (Git auto-deploy)
- Process Manager: PM2 5.x (local-agent)

📋 次のステップ（TDD原則に基づく開発フロー）:
1. docs/00-requirements/master_system_design.md を確認
2. 最初の機能を選択（例: YouTube要約）
3. TDDサイクル開始:
   - Red: tests/を先に作成（失敗確認）
   - Green: features/機能名/executor.ts 実装
   - Refactor: コード改善
4. railway run pnpm dev でローカル確認
5. PRを作成してCI実行
```

## 使用例

### プロジェクト名指定

```bash
/ai:init-project my-awesome-app
```

### インタラクティブモード

```bash
/ai:init-project
```

## 参照

- エージェント: `.claude/agents/product-manager.md`, `.claude/agents/req-analyst.md`, `.claude/agents/arch-police.md`
