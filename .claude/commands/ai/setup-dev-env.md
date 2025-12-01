---
description: |
  プロジェクトの開発環境を完全セットアップするコマンド。

  pnpm依存関係、Git/Claude Code hooks、TypeScript/ESLint/Prettier/Vitest設定、
  Docker環境、Railway統合を3つのエージェントが順次構成します。

  🤖 起動エージェント:
  - `.claude/agents/dep-mgr.md`: 依存パッケージ・モノレポ管理（Phase 1）
  - `.claude/agents/hook-master.md`: Git/Claude Code hooks設定（Phase 2）
  - `.claude/agents/devops-eng.md`: 設定ファイル・Docker・Railway統合（Phase 3）

  📚 利用可能スキル（各エージェントが必要時に参照）:

  **Phase 1 (dep-mgr) - pnpm依存関係:**
  - `.claude/skills/semantic-versioning/SKILL.md`: SemVer範囲指定、互換性判断
  - `.claude/skills/lock-file-management/SKILL.md`: pnpm-lock.yaml整合性、決定性ビルド
  - `.claude/skills/monorepo-dependency-management/SKILL.md`: pnpm-workspace.yaml設定

  **Phase 2 (hook-master) - Hooks統合:**
  - `.claude/skills/git-hooks-concepts/SKILL.md`: pre-commit、pre-push（Husky）
  - `.claude/skills/claude-code-hooks/SKILL.md`: UserPromptSubmit、PreToolUse、PostToolUse
  - `.claude/skills/linting-formatting-automation/SKILL.md`: lint-staged、ESLint/Prettier自動化

  **Phase 3 (devops-eng) - 環境構成:**
  - `.claude/skills/docker-best-practices/SKILL.md`: Dockerfile（マルチステージ）、docker-compose.yml
  - `.claude/skills/infrastructure-as-code/SKILL.md`: Railway CLI、railway.json、環境変数管理

  ⚙️ このコマンドの設定:
  - argument-hint: なし（引数不要）
  - allowed-tools: エージェント起動と最小限の確認用
    • Task: 3エージェント順次起動用
    • Read: 既存設定確認用
    • Write: 設定ファイル生成検証用
    • Bash(pnpm*): pnpm専用操作（npm禁止、プロジェクト要件準拠）
  - model: sonnet（標準的な環境セットアップタスク）

  📋 プロジェクト要件準拠:
  - pnpm 9.x必須（package manager）
  - TypeScript strict モード、パスエイリアス@/*
  - ESLint 9.x Flat Config（eslint.config.js）
  - eslint-plugin-boundaries（依存関係違反検出）
  - Prettier統一フォーマット（シングルクォート、セミコロンあり）
  - Vitest 2.x（**/__tests__/**/*.test.ts）
  - Railway CLI統合、railway.json
  - PM2設定（local-agent用、ecosystem.config.js）

  トリガーキーワード: setup, environment, dev-env, 開発環境, 初期化, pnpm
allowed-tools:
   - Task
   - Read
   - Write
   - Bash(pnpm*)
model: sonnet
---

# 開発環境セットアップ

## 目的

プロジェクトの開発環境を3つのエージェントが協調して完全セットアップします。

## 実行フロー

### Phase 1: pnpm依存関係・設定ファイルセットアップ

**エージェント起動**: `.claude/agents/dep-mgr.md`

```
依頼内容:
プロジェクトの依存関係と基本設定ファイルを初期セットアップしてください。

プロジェクト要件（master_system_design.md準拠）:
- Package Manager: pnpm 9.x必須
- Node.js: 22.x LTS
- TypeScript: 5.x（strict モード、パスエイリアス@/*）
- モノレポ: pnpm-workspace.yaml設定

タスク:
1. package.json作成・更新（pnpm 9.x、Node.js 22.x指定）
2. pnpm-workspace.yaml作成（モノレポ設定）
3. tsconfig.json作成（strict: true、paths: {"@/*": ["./src/*"]}）
4. 必要な依存パッケージをpnpmでインストール
5. pnpm-lock.yaml整合性確認
6. セキュリティ監査実行（pnpm audit）

成果物:
- package.json（pnpm 9.x、Node.js 22.x指定）
- pnpm-workspace.yaml
- tsconfig.json（strict モード、@/*エイリアス）
- pnpm-lock.yaml
- 依存関係インストール完了
```

**待機**: dep-mgrの完了を確認

---

### Phase 2: Hooks・品質ツール統合

**エージェント起動**: `.claude/agents/hook-master.md`

```
依頼内容:
Git hooks、Claude Code hooks、品質ツール設定を統合してください。

プロジェクト要件（master_system_design.md準拠）:
- ESLint: 9.x Flat Config（eslint.config.js）
- eslint-plugin-boundaries: 依存関係違反検出必須
- Prettier: シングルクォート、セミコロンあり、タブ幅2
- Vitest: 2.x、テストパターン **/__tests__/**/*.test.ts

タスク:
1. Git hooks設定（Husky）
   - .husky/pre-commit: lint-staged実行（型チェック、ESLint、Prettier）
   - .husky/pre-push: テスト実行（pnpm test）
2. Claude Code hooks設定（settings.json）
   - UserPromptSubmit: プロンプト送信時の検証
   - PreToolUse: 破壊的操作の承認ゲート
   - PostToolUse: ツール実行後の品質チェック
3. ESLint設定（eslint.config.js）
   - Flat Config形式
   - eslint-plugin-boundaries統合（依存方向: app→features→shared/infrastructure→shared/core）
   - 必須ルール: no-unused-vars、no-console（warn）
4. Prettier設定（.prettierrc）
   - singleQuote: true、semi: true、tabWidth: 2
5. Vitest設定（vitest.config.ts）
   - テストパターン: **/__tests__/**/*.test.ts
   - カバレッジ目標: 60%以上
6. lint-staged設定（package.json内）
   - *.ts, *.tsx: ESLint実行、Prettier実行

成果物:
- .husky/pre-commit、.husky/pre-push
- settings.json（Claude Code hooks）
- eslint.config.js（Flat Config、boundaries plugin）
- .prettierrc
- vitest.config.ts
- package.json（lint-staged設定）
```

**待機**: hook-masterの完了を確認

---

### Phase 3: Docker・Railway・PM2統合

**エージェント起動**: `.claude/agents/devops-eng.md`

```
依頼内容:
Docker環境、Railway統合、PM2設定を完全構成してください。

プロジェクト要件（master_system_design.md準拠）:
- Railway: Nixpacksビルダー、railway.json必須
- Railway CLI: 環境変数同期、ローカル開発統合
- Docker: マルチステージビルド、セキュリティベストプラクティス
- PM2: local-agent用、ecosystem.config.js（autorestart、max_memory_restart: 500M）

タスク:
1. railway.json作成
   - builder: NIXPACKS
   - buildCommand: pnpm install && pnpm build
   - startCommand: pnpm start
   - restartPolicyType: ON_FAILURE
2. Dockerfile作成（マルチステージビルド）
   - Stage 1: 依存関係インストール
   - Stage 2: ビルド
   - Stage 3: 本番実行（最小イメージ）
3. docker-compose.yml作成（開発環境用）
   - Next.js サービス
   - PostgreSQL サービス（Neon互換）
4. .env.example作成（環境変数テンプレート）
   - DATABASE_URL、OPENAI_API_KEY、ANTHROPIC_API_KEY等
   - DISCORD_TOKEN、AGENT_SECRET_KEY
5. drizzle.config.ts作成
   - schema: src/shared/infrastructure/database/schema.ts
   - out: drizzle/migrations/
6. PM2設定（local-agent/ecosystem.config.js）
   - autorestart: true
   - max_memory_restart: 500M
   - log設定（error.log、out.log）
7. .dockerignore設定

成果物:
- railway.json（Nixpacks設定）
- Dockerfile（マルチステージ）
- docker-compose.yml
- .env.example（全必須変数）
- drizzle.config.ts
- local-agent/ecosystem.config.js（PM2設定）
- .dockerignore
```

**待機**: devops-engの完了を確認

---

## 最終確認

### 成果物検証

```bash
# Phase 1: 依存関係・基本設定
ls -la package.json pnpm-workspace.yaml pnpm-lock.yaml tsconfig.json

# Phase 2: Hooks・品質ツール
ls -la .husky/ eslint.config.js .prettierrc vitest.config.ts
cat settings.json | grep -A 10 "hooks"

# Phase 3: Docker・Railway・PM2
ls -la railway.json Dockerfile docker-compose.yml .env.example drizzle.config.ts
ls -la local-agent/ecosystem.config.js
```

### 完了報告

```
✅ Phase 1: pnpm依存関係・設定ファイルセットアップ完了
✅ Phase 2: Hooks・品質ツール統合完了
✅ Phase 3: Docker・Railway・PM2統合完了

📦 成果物（master_system_design.md準拠）:

Phase 1:
- package.json（pnpm 9.x、Node.js 22.x）
- pnpm-workspace.yaml（モノレポ設定）
- tsconfig.json（strict モード、@/*エイリアス）
- pnpm-lock.yaml

Phase 2:
- .husky/pre-commit、.husky/pre-push（Git hooks）
- settings.json（Claude Code hooks）
- eslint.config.js（Flat Config、eslint-plugin-boundaries）
- .prettierrc（シングルクォート、セミコロン、タブ幅2）
- vitest.config.ts（**/__tests__/**/*.test.ts）
- package.json（lint-staged設定）

Phase 3:
- railway.json（Nixpacks、pnpm）
- Dockerfile（マルチステージビルド）
- docker-compose.yml（Next.js + PostgreSQL）
- .env.example（全必須環境変数）
- drizzle.config.ts（schema、migrations設定）
- local-agent/ecosystem.config.js（PM2、autorestart、500M制限）
- .dockerignore

🚀 開発環境セットアップが完了しました。

次のステップ:
- `railway run pnpm dev`: Railway環境変数でローカル開発開始
- `pnpm test`: テスト実行確認
- `pnpm typecheck`: TypeScript型チェック
- `pnpm lint`: ESLint実行
```

## エラーハンドリング

各Phaseでエラーが発生した場合:
1. エラーメッセージを表示
2. 該当エージェントに再試行を依頼
3. 3回失敗した場合はユーザーに報告し、手動対応を提案

## 参照

- 依存管理エージェント: `.claude/agents/dep-mgr.md`
- Hooks管理エージェント: `.claude/agents/hook-master.md`
- DevOpsエージェント: `.claude/agents/devops-eng.md`
