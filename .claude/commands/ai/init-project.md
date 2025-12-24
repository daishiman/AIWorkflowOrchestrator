---
description: |
  新規プロジェクトの完全な初期化を実行するコマンド。プロジェクトゴール定義、初期要件整理、アーキテクチャ方針確立を自動化します。
  実行は専門エージェントに委譲します。

  🤖 起動エージェント:
  - `.claude/agents/product-manager.md`: プロジェクトゴール・ロードマップ定義
  - `.claude/agents/req-analyst.md`: 初期要件の整理と受け入れ基準作成
  - `.claude/agents/arch-police.md`: アーキテクチャ方針の確立とレイヤー構造設計

  ⚙️ このコマンドの設定:
  - argument-hint: [project-name]
  - allowed-tools: Task（エージェント起動のみ）
  - model: opus

  トリガーキーワード: init, initialize, setup, new project, 新規プロジェクト, 初期化
argument-hint: "[project-name]"
allowed-tools:
  - Task
model: opus
---

# プロジェクト初期化

## 目的

`.claude/commands/ai/init-project.md` の入力を受け取り、専門エージェントに実行を委譲します。

## エージェント起動フロー

### Phase 1: プロジェクトゴール・ロードマップ定義の実行

**目的**: プロジェクトゴール・ロードマップ定義に関するタスクを実行し、結果を整理する

**背景**: 専門知識が必要なため専門エージェントに委譲する

**ゴール**: プロジェクトゴール・ロードマップ定義の結果と次アクションが提示された状態

**起動エージェント**: `.claude/agents/product-manager.md`

Task ツールで `.claude/agents/product-manager.md` を起動:

**コンテキスト**:

- 引数: $ARGUMENTS（[project-name]）

**依頼内容**:

- コマンドの目的に沿って実行する
- 結果と次アクションを提示する

**期待成果物**:

- `docs/00-vision/vision-statement.md`
- `docs/00-vision/roadmap.md`
- `docs/00-vision/okrs.md`
- `docs/00-requirements/functional-requirements.md`
- `docs/00-requirements/non-functional-requirements.md`
- `docs/00-requirements/use-cases.md`
- `docs/00-requirements/acceptance-criteria.md`
- `docs/00-requirements/master_system_design.md`
- `docs/10-architecture/architecture-overview.md`
- `docs/10-architecture/layer-structure.md`
- `docs/10-architecture/dependency-rules.md`
- `docs/99-adr/001-hybrid-architecture.md`
- `src/shared/core/`
- `src/shared/infrastructure/`
- `src/features`
- `src/app/api/`
- `.github/workflows`
- `.claude/CLAUDE.md`
- `docs/99-adr/001-architecture-style.md`
- `src/features/`
- `src/app/`
- `.github/workflows/`
- `package.json`
- `tsconfig.json`
- `eslint.config.js`
- `railway.json`
- `.env`
- `.env.example`

**完了条件**:

- [ ] 主要な結果と根拠が整理されている
- [ ] 次のアクションが提示されている

### Phase 2: 初期要件の整理と受け入れ基準作成の実行

**目的**: 初期要件の整理と受け入れ基準作成に関するタスクを実行し、結果を整理する

**背景**: 専門知識が必要なため専門エージェントに委譲する

**ゴール**: 初期要件の整理と受け入れ基準作成の結果と次アクションが提示された状態

**起動エージェント**: `.claude/agents/req-analyst.md`

Task ツールで `.claude/agents/req-analyst.md` を起動:

**コンテキスト**:

- 引数: $ARGUMENTS（[project-name]）

**依頼内容**:

- コマンドの目的に沿って実行する
- 結果と次アクションを提示する

**期待成果物**:

- `docs/00-vision/vision-statement.md`
- `docs/00-vision/roadmap.md`
- `docs/00-vision/okrs.md`
- `docs/00-requirements/functional-requirements.md`
- `docs/00-requirements/non-functional-requirements.md`
- `docs/00-requirements/use-cases.md`
- `docs/00-requirements/acceptance-criteria.md`
- `docs/00-requirements/master_system_design.md`
- `docs/10-architecture/architecture-overview.md`
- `docs/10-architecture/layer-structure.md`
- `docs/10-architecture/dependency-rules.md`
- `docs/99-adr/001-hybrid-architecture.md`
- `src/shared/core/`
- `src/shared/infrastructure/`
- `src/features`
- `src/app/api/`
- `.github/workflows`
- `.claude/CLAUDE.md`
- `docs/99-adr/001-architecture-style.md`
- `src/features/`
- `src/app/`
- `.github/workflows/`
- `package.json`
- `tsconfig.json`
- `eslint.config.js`
- `railway.json`
- `.env`
- `.env.example`

**完了条件**:

- [ ] 主要な結果と根拠が整理されている
- [ ] 次のアクションが提示されている

### Phase 3: アーキテクチャ方針の確立とレイヤー構造設計の実行

**目的**: アーキテクチャ方針の確立とレイヤー構造設計に関するタスクを実行し、結果を整理する

**背景**: 専門知識が必要なため専門エージェントに委譲する

**ゴール**: アーキテクチャ方針の確立とレイヤー構造設計の結果と次アクションが提示された状態

**起動エージェント**: `.claude/agents/arch-police.md`

Task ツールで `.claude/agents/arch-police.md` を起動:

**コンテキスト**:

- 引数: $ARGUMENTS（[project-name]）

**依頼内容**:

- コマンドの目的に沿って実行する
- 結果と次アクションを提示する

**期待成果物**:

- `docs/00-vision/vision-statement.md`
- `docs/00-vision/roadmap.md`
- `docs/00-vision/okrs.md`
- `docs/00-requirements/functional-requirements.md`
- `docs/00-requirements/non-functional-requirements.md`
- `docs/00-requirements/use-cases.md`
- `docs/00-requirements/acceptance-criteria.md`
- `docs/00-requirements/master_system_design.md`
- `docs/10-architecture/architecture-overview.md`
- `docs/10-architecture/layer-structure.md`
- `docs/10-architecture/dependency-rules.md`
- `docs/99-adr/001-hybrid-architecture.md`
- `src/shared/core/`
- `src/shared/infrastructure/`
- `src/features`
- `src/app/api/`
- `.github/workflows`
- `.claude/CLAUDE.md`
- `docs/99-adr/001-architecture-style.md`
- `src/features/`
- `src/app/`
- `.github/workflows/`
- `package.json`
- `tsconfig.json`
- `eslint.config.js`
- `railway.json`
- `.env`
- `.env.example`

**完了条件**:

- [ ] 主要な結果と根拠が整理されている
- [ ] 次のアクションが提示されている

## 使用例

```bash
/ai:init-project [project-name]
```
