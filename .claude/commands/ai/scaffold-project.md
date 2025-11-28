---
description: |
  プロジェクト設計書（master_system_design.md）に準拠したハイブリッドアーキテクチャの
  ディレクトリ構造と設定ファイルを自動生成するコマンド。

  MVP向けに最適化された構造（shared/core + shared/infrastructure + features）を作成し、
  TypeScript strict mode、ESLint Flat Config、Vitest、Drizzle、Railway設定を含みます。

  🤖 起動エージェント:
  - なし（設計書準拠の構造化タスクのため直接実行）

  📚 参照スキル:
  - `.claude/skills/clean-architecture-principles/SKILL.md`: Clean Architecture、依存関係ルール
  - `.claude/skills/architectural-patterns/SKILL.md`: ハイブリッドアーキテクチャパターン
  - `.claude/skills/code-style-guides/SKILL.md`: ディレクトリ命名規則
  - `.claude/skills/best-practices-curation/SKILL.md`: プロジェクト構成ベストプラクティス

  📖 設計書参照:
  - `docs/00-requirements/master_system_design.md`: 第4章（ディレクトリ構造）、第2章（設定要件）

  ⚙️ このコマンドの設定:
  - argument-hint: テンプレートタイプ（このプロジェクト専用: hybrid-mvp）
  - allowed-tools: ディレクトリ作成と設定ファイル生成用
    • Bash(mkdir*): ディレクトリ構造作成用
    • Write: 設定ファイル・テンプレートファイル作成用
    • Read: 既存構造確認・設計書参照用
  - model: sonnet（構造化タスク）

  トリガーキーワード: scaffold, init, setup, project-structure, hybrid-architecture, MVP, テンプレート
argument-hint: "[template-type]"
allowed-tools: [Bash(mkdir*), Write, Read]
model: sonnet
---

# Universal AI Workflow Orchestrator - プロジェクト Scaffold

## 目的

`docs/00-requirements/master_system_design.md` に準拠したハイブリッドアーキテクチャの
プロジェクト構造を自動生成します。

## 設計書参照

このコマンドは以下の設計書章節に準拠します:
- 第4章: ディレクトリ構造（ハイブリッドアーキテクチャ）
- 第2章: 設定ファイル要件、テスト戦略
- 第5章: Clean Architecture依存関係ルール
- 第12章: Railway/GitHub Actions設定

## 実行フロー（ハブ呼び出し）

### Phase 1: 設計書参照とスキル読み込み

設計書を参照:
```
docs/00-requirements/master_system_design.md
```

必須スキルを読み込み:
```
.claude/skills/clean-architecture-principles/SKILL.md
.claude/skills/architectural-patterns/SKILL.md
.claude/skills/code-style-guides/SKILL.md
.claude/skills/best-practices-curation/SKILL.md
```

### Phase 2: ディレクトリ構造生成

**実行内容**:
設計書第4.3節に記載された完全なディレクトリ構造を作成:
- .claude/, docs/, src/shared/, src/features/, src/app/, local-agent/, .github/workflows/

**参照スキル**:
- `.claude/skills/clean-architecture-principles/SKILL.md`: 依存関係ルール（core → infrastructure → features → app）
- `.claude/skills/architectural-patterns/SKILL.md`: ハイブリッド構造パターン

### Phase 3: 設定ファイル生成

**実行内容**:
設計書第2.5節に記載された全設定ファイルを作成:
- tsconfig.json (strict mode, path alias)
- eslint.config.js (Flat Config, boundaries plugin)
- .prettierrc
- vitest.config.ts (カバレッジ60%)
- drizzle.config.ts
- railway.json
- pnpm-workspace.yaml
- .env.example

**参照スキル**:
- `.claude/skills/code-style-guides/SKILL.md`: TypeScript/ESLint設定パターン
- `.claude/skills/best-practices-curation/SKILL.md`: テスト・品質設定ベストプラクティス

### Phase 4: GitHub Actions ワークフロー生成

**実行内容**:
設計書第12.2節に記載されたワークフローを作成:
- ci.yml (PR時の品質ゲート)
- deploy.yml (Discord通知)
- reusable-test.yml
- .github/workflows/README.md (Mermaid可視化)

**参照スキル**:
- `.claude/skills/github-actions-syntax/SKILL.md`: ワークフロー構文
- `.claude/skills/caching-strategies-gha/SKILL.md`: pnpm cache設定

### Phase 5: コアファイルテンプレート生成

**実行内容**:
設計書第5章、第6章、第7章に記載されたコアファイルを作成:
- src/shared/core/entities/workflow.ts (第5.2.3節)
- src/shared/core/interfaces/IWorkflowExecutor.ts (第6.1節)
- src/shared/core/errors/WorkflowError.ts (第7.1節)
- src/features/registry.ts (第11.1節)
- src/shared/infrastructure/database/schema.ts (第5.2.3節)
- local-agent/ecosystem.config.js (第9.4節)

**参照スキル**:
- `.claude/skills/domain-driven-design/SKILL.md`: エンティティ設計
- `.claude/skills/interface-segregation/SKILL.md`: インターフェース設計
- `.claude/skills/zod-validation/SKILL.md`: スキーマバリデーション

### Phase 6: 検証と報告

**実行内容**:
- 作成されたディレクトリ構造の表示
- 設定ファイルの確認
- 設計書準拠チェック（8項目）

## 期待成果物

**ディレクトリ構造** (設計書第4.3節):
- ハイブリッドアーキテクチャ準拠のフォルダ構成

**設定ファイル** (設計書第2.5節):
- TypeScript、ESLint、Prettier、Vitest、Drizzle、Railway設定

**コアファイル** (設計書第5-7章):
- エンティティ、インターフェース、エラークラス、レジストリ、スキーマ

**CI/CDワークフロー** (設計書第12.2節):
- GitHub Actions（ci.yml、deploy.yml、reusable-test.yml）

## スキル参照（フェーズ別）

| フェーズ | スキル | 用途 |
|---------|--------|------|
| Phase 2 | clean-architecture-principles | 依存関係ルール |
| Phase 2 | architectural-patterns | ハイブリッド構造 |
| Phase 3 | code-style-guides | 命名規則 |
| Phase 4 | best-practices-curation | CI/CD設定 |
| Phase 5 | domain-driven-design | エンティティ設計 |
| Phase 5 | interface-segregation | インターフェース設計 |
| Phase 5 | zod-validation | スキーマ設計 |

## 使用例

```bash
# ハイブリッド構造を生成
/ai:scaffold-project hybrid-mvp

# 引数なし（デフォルトでhybrid-mvp）
/ai:scaffold-project
```

## 注意事項

- ⚠️ このプロジェクト専用コマンド（Universal AI Workflow Orchestrator）
- ✅ 設計書 `master_system_design.md` に100%準拠
- ✅ 既存ファイルは上書き確認プロンプト表示
- ✅ 作成後は `git init && git add . && git commit -m "chore: scaffold project structure"` 推奨
