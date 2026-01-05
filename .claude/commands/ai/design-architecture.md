---
description: |
  システム全体のアーキテクチャ設計を行うコマンド。
  実行は専門エージェントに委譲します。

  🤖 起動エージェント:
  - `.claude/agents/arch-police.md`: 2 - アーキテクチャレビューと依存関係分析
  - `.claude/agents/domain-modeler.md`: 4 - ドメインモデル設計とユビキタス言語確立

  ⚙️ このコマンドの設定:
  - argument-hint: [architecture-style]
  - allowed-tools: Task（エージェント起動のみ）
  - model: opus

  トリガーキーワード: architecture, design, アーキテクチャ, 設計, clean architecture, DDD
argument-hint: "[architecture-style]"
allowed-tools:
  - Task
model: opus
---

# システムアーキテクチャ設計

## 目的

`.claude/commands/ai/design-architecture.md` の入力を受け取り、専門エージェントに実行を委譲します。

## エージェント起動フロー

### Phase 1: 2 - アーキテクチャレビューと依存関係分析の実行

**目的**: 2 - アーキテクチャレビューと依存関係分析に関するタスクを実行し、結果を整理する

**背景**: 専門知識が必要なため専門エージェントに委譲する

**ゴール**: 2 - アーキテクチャレビューと依存関係分析の結果と次アクションが提示された状態

**起動エージェント**: `.claude/agents/arch-police.md`

Task ツールで `.claude/agents/arch-police.md` を起動:

**コンテキスト**:

- 引数: $ARGUMENTS（[architecture-style]）

**依頼内容**:

- コマンドの目的に沿って実行する
- 結果と次アクションを提示する

**期待成果物**:

- `docs/00-requirements/master_system_design.md`
- `docs/10-architecture/`
- `src/shared/core`
- `src/shared/infrastructure`
- `src/features`
- `src/app`
- `docs/10-architecture/current-analysis.md`
- `docs/10-architecture/layer-structure.md`
- `docs/10-architecture/dependency-rules.md`
- `docs/99-adr/002-architecture-principles.md`
- `docs/10-architecture/domain-model.md`
- `docs/10-architecture/ubiquitous-language.md`
- `docs/10-architecture/bounded-contexts.md`
- `docs/10-architecture/core-interfaces.md`
- `docs/10-architecture/value-objects.md`
- `docs/10-architecture/domain-services.md`
- `docs/10-architecture/invariants.md`
- `docs/10-architecture/system-design.md`
- `docs/10-architecture/implementation-guide.md`
- `docs/99-adr/`

**完了条件**:

- [ ] 主要な結果と根拠が整理されている
- [ ] 次のアクションが提示されている

### Phase 2: 4 - ドメインモデル設計とユビキタス言語確立の実行

**目的**: 4 - ドメインモデル設計とユビキタス言語確立に関するタスクを実行し、結果を整理する

**背景**: 専門知識が必要なため専門エージェントに委譲する

**ゴール**: 4 - ドメインモデル設計とユビキタス言語確立の結果と次アクションが提示された状態

**起動エージェント**: `.claude/agents/domain-modeler.md`

Task ツールで `.claude/agents/domain-modeler.md` を起動:

**コンテキスト**:

- 引数: $ARGUMENTS（[architecture-style]）

**依頼内容**:

- コマンドの目的に沿って実行する
- 結果と次アクションを提示する

**期待成果物**:

- `docs/00-requirements/master_system_design.md`
- `docs/10-architecture/`
- `src/shared/core`
- `src/shared/infrastructure`
- `src/features`
- `src/app`
- `docs/10-architecture/current-analysis.md`
- `docs/10-architecture/layer-structure.md`
- `docs/10-architecture/dependency-rules.md`
- `docs/99-adr/002-architecture-principles.md`
- `docs/10-architecture/domain-model.md`
- `docs/10-architecture/ubiquitous-language.md`
- `docs/10-architecture/bounded-contexts.md`
- `docs/10-architecture/core-interfaces.md`
- `docs/10-architecture/value-objects.md`
- `docs/10-architecture/domain-services.md`
- `docs/10-architecture/invariants.md`
- `docs/10-architecture/system-design.md`
- `docs/10-architecture/implementation-guide.md`
- `docs/99-adr/`

**完了条件**:

- [ ] 主要な結果と根拠が整理されている
- [ ] 次のアクションが提示されている

## 使用例

```bash
/ai:design-architecture [architecture-style]
```
