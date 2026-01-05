---
description: |
  機能の完全な開発サイクルを実行する包括的なワークフローコマンド。
  実行は専門エージェントに委譲します。

  🤖 起動エージェント:
  - `.claude/agents/product-manager.md`: 機能価値定義、優先順位決定
  - `.claude/agents/req-analyst.md`: 要件整理、ユースケース、受け入れ基準
  - `.claude/agents/spec-writer.md`: 詳細仕様書作成（TDD準拠）
  - `.claude/agents/domain-modeler.md`: ドメインモデル設計
  - `.claude/agents/ui-designer.md`: UIコンポーネント設計（必要時）
  - `.claude/agents/logic-dev.md`: ビジネスロジック実装（Executor、Repository）
  - `.claude/agents/unit-tester.md`: ユニットテスト作成（TDD: Red-Green-Refactor）
  - `.claude/agents/code-quality.md`: コード品質レビュー
  - `.claude/agents/sec-auditor.md`: セキュリティ監査

  ⚙️ このコマンドの設定:
  - argument-hint: [feature-name]
  - allowed-tools: Task（エージェント起動のみ）
  - model: opus

  トリガーキーワード: full feature, complete development, 機能開発, TDD, end-to-end, 完全開発サイクル
argument-hint: "[feature-name]"
allowed-tools:
  - Task
model: opus
---

# 機能完全開発サイクル

## 目的

`.claude/commands/ai/full-feature-development.md` の入力を受け取り、専門エージェントに実行を委譲します。

## エージェント起動フロー

### Phase 1: 機能価値定義、優先順位決定の実行

**目的**: 機能価値定義、優先順位決定に関するタスクを実行し、結果を整理する

**背景**: 専門知識が必要なため専門エージェントに委譲する

**ゴール**: 機能価値定義、優先順位決定の結果と次アクションが提示された状態

**起動エージェント**: `.claude/agents/product-manager.md`

Task ツールで `.claude/agents/product-manager.md` を起動:

**コンテキスト**:

- 引数: $ARGUMENTS（[feature-name]）

**依頼内容**:

- コマンドの目的に沿って実行する
- 結果と次アクションを提示する

**期待成果物**:

- `docs/00-requirements/features/`
- `docs/20-specifications/features/`
- `src/shared/core/entities/`
- `src/features/`
- `src/shared/infrastructure/repositories/`
- `src/app/components/`
- `.claude/docs/quality/`
- `.claude/docs/security/`
- `src/shared/core/interfaces/`
- `src/shared/core/errors/`
- `src/features/registry.ts`
- `src/app/api/`
- `src/features/youtube-summarize/schema.ts`
- `src/features/youtube-summarize/executor.ts`
- `docs/00-requirements/master_system_design.md`

**完了条件**:

- [ ] 主要な結果と根拠が整理されている
- [ ] 次のアクションが提示されている

### Phase 2: 要件整理、ユースケース、受け入れ基準の実行

**目的**: 要件整理、ユースケース、受け入れ基準に関するタスクを実行し、結果を整理する

**背景**: 専門知識が必要なため専門エージェントに委譲する

**ゴール**: 要件整理、ユースケース、受け入れ基準の結果と次アクションが提示された状態

**起動エージェント**: `.claude/agents/req-analyst.md`

Task ツールで `.claude/agents/req-analyst.md` を起動:

**コンテキスト**:

- 引数: $ARGUMENTS（[feature-name]）

**依頼内容**:

- コマンドの目的に沿って実行する
- 結果と次アクションを提示する

**期待成果物**:

- `docs/00-requirements/features/`
- `docs/20-specifications/features/`
- `src/shared/core/entities/`
- `src/features/`
- `src/shared/infrastructure/repositories/`
- `src/app/components/`
- `.claude/docs/quality/`
- `.claude/docs/security/`
- `src/shared/core/interfaces/`
- `src/shared/core/errors/`
- `src/features/registry.ts`
- `src/app/api/`
- `src/features/youtube-summarize/schema.ts`
- `src/features/youtube-summarize/executor.ts`
- `docs/00-requirements/master_system_design.md`

**完了条件**:

- [ ] 主要な結果と根拠が整理されている
- [ ] 次のアクションが提示されている

### Phase 3: 詳細仕様書作成（TDD準拠）の実行

**目的**: 詳細仕様書作成（TDD準拠）に関するタスクを実行し、結果を整理する

**背景**: 専門知識が必要なため専門エージェントに委譲する

**ゴール**: 詳細仕様書作成（TDD準拠）の結果と次アクションが提示された状態

**起動エージェント**: `.claude/agents/spec-writer.md`

Task ツールで `.claude/agents/spec-writer.md` を起動:

**コンテキスト**:

- 引数: $ARGUMENTS（[feature-name]）

**依頼内容**:

- コマンドの目的に沿って実行する
- 結果と次アクションを提示する

**期待成果物**:

- `docs/00-requirements/features/`
- `docs/20-specifications/features/`
- `src/shared/core/entities/`
- `src/features/`
- `src/shared/infrastructure/repositories/`
- `src/app/components/`
- `.claude/docs/quality/`
- `.claude/docs/security/`
- `src/shared/core/interfaces/`
- `src/shared/core/errors/`
- `src/features/registry.ts`
- `src/app/api/`
- `src/features/youtube-summarize/schema.ts`
- `src/features/youtube-summarize/executor.ts`
- `docs/00-requirements/master_system_design.md`

**完了条件**:

- [ ] 主要な結果と根拠が整理されている
- [ ] 次のアクションが提示されている

### Phase 4: ドメインモデル設計の実行

**目的**: ドメインモデル設計に関するタスクを実行し、結果を整理する

**背景**: 専門知識が必要なため専門エージェントに委譲する

**ゴール**: ドメインモデル設計の結果と次アクションが提示された状態

**起動エージェント**: `.claude/agents/domain-modeler.md`

Task ツールで `.claude/agents/domain-modeler.md` を起動:

**コンテキスト**:

- 引数: $ARGUMENTS（[feature-name]）

**依頼内容**:

- コマンドの目的に沿って実行する
- 結果と次アクションを提示する

**期待成果物**:

- `docs/00-requirements/features/`
- `docs/20-specifications/features/`
- `src/shared/core/entities/`
- `src/features/`
- `src/shared/infrastructure/repositories/`
- `src/app/components/`
- `.claude/docs/quality/`
- `.claude/docs/security/`
- `src/shared/core/interfaces/`
- `src/shared/core/errors/`
- `src/features/registry.ts`
- `src/app/api/`
- `src/features/youtube-summarize/schema.ts`
- `src/features/youtube-summarize/executor.ts`
- `docs/00-requirements/master_system_design.md`

**完了条件**:

- [ ] 主要な結果と根拠が整理されている
- [ ] 次のアクションが提示されている

### Phase 5: UIコンポーネント設計（必要時）の実行

**目的**: UIコンポーネント設計（必要時）に関するタスクを実行し、結果を整理する

**背景**: 専門知識が必要なため専門エージェントに委譲する

**ゴール**: UIコンポーネント設計（必要時）の結果と次アクションが提示された状態

**起動エージェント**: `.claude/agents/ui-designer.md`

Task ツールで `.claude/agents/ui-designer.md` を起動:

**コンテキスト**:

- 引数: $ARGUMENTS（[feature-name]）

**依頼内容**:

- コマンドの目的に沿って実行する
- 結果と次アクションを提示する

**期待成果物**:

- `docs/00-requirements/features/`
- `docs/20-specifications/features/`
- `src/shared/core/entities/`
- `src/features/`
- `src/shared/infrastructure/repositories/`
- `src/app/components/`
- `.claude/docs/quality/`
- `.claude/docs/security/`
- `src/shared/core/interfaces/`
- `src/shared/core/errors/`
- `src/features/registry.ts`
- `src/app/api/`
- `src/features/youtube-summarize/schema.ts`
- `src/features/youtube-summarize/executor.ts`
- `docs/00-requirements/master_system_design.md`

**完了条件**:

- [ ] 主要な結果と根拠が整理されている
- [ ] 次のアクションが提示されている

### Phase 6: ビジネスロジック実装（Executor、Repository）の実行

**目的**: ビジネスロジック実装（Executor、Repository）に関するタスクを実行し、結果を整理する

**背景**: 専門知識が必要なため専門エージェントに委譲する

**ゴール**: ビジネスロジック実装（Executor、Repository）の結果と次アクションが提示された状態

**起動エージェント**: `.claude/agents/logic-dev.md`

Task ツールで `.claude/agents/logic-dev.md` を起動:

**コンテキスト**:

- 引数: $ARGUMENTS（[feature-name]）

**依頼内容**:

- コマンドの目的に沿って実行する
- 結果と次アクションを提示する

**期待成果物**:

- `docs/00-requirements/features/`
- `docs/20-specifications/features/`
- `src/shared/core/entities/`
- `src/features/`
- `src/shared/infrastructure/repositories/`
- `src/app/components/`
- `.claude/docs/quality/`
- `.claude/docs/security/`
- `src/shared/core/interfaces/`
- `src/shared/core/errors/`
- `src/features/registry.ts`
- `src/app/api/`
- `src/features/youtube-summarize/schema.ts`
- `src/features/youtube-summarize/executor.ts`
- `docs/00-requirements/master_system_design.md`

**完了条件**:

- [ ] 主要な結果と根拠が整理されている
- [ ] 次のアクションが提示されている

### Phase 7: ユニットテスト作成（TDD: Red-Green-Refactor）の実行

**目的**: ユニットテスト作成（TDD: Red-Green-Refactor）に関するタスクを実行し、結果を整理する

**背景**: 専門知識が必要なため専門エージェントに委譲する

**ゴール**: ユニットテスト作成（TDD: Red-Green-Refactor）の結果と次アクションが提示された状態

**起動エージェント**: `.claude/agents/unit-tester.md`

Task ツールで `.claude/agents/unit-tester.md` を起動:

**コンテキスト**:

- 引数: $ARGUMENTS（[feature-name]）

**依頼内容**:

- コマンドの目的に沿って実行する
- 結果と次アクションを提示する

**期待成果物**:

- `docs/00-requirements/features/`
- `docs/20-specifications/features/`
- `src/shared/core/entities/`
- `src/features/`
- `src/shared/infrastructure/repositories/`
- `src/app/components/`
- `.claude/docs/quality/`
- `.claude/docs/security/`
- `src/shared/core/interfaces/`
- `src/shared/core/errors/`
- `src/features/registry.ts`
- `src/app/api/`
- `src/features/youtube-summarize/schema.ts`
- `src/features/youtube-summarize/executor.ts`
- `docs/00-requirements/master_system_design.md`

**完了条件**:

- [ ] 主要な結果と根拠が整理されている
- [ ] 次のアクションが提示されている

### Phase 8: コード品質レビューの実行

**目的**: コード品質レビューに関するタスクを実行し、結果を整理する

**背景**: 専門知識が必要なため専門エージェントに委譲する

**ゴール**: コード品質レビューの結果と次アクションが提示された状態

**起動エージェント**: `.claude/agents/code-quality.md`

Task ツールで `.claude/agents/code-quality.md` を起動:

**コンテキスト**:

- 引数: $ARGUMENTS（[feature-name]）

**依頼内容**:

- コマンドの目的に沿って実行する
- 結果と次アクションを提示する

**期待成果物**:

- `docs/00-requirements/features/`
- `docs/20-specifications/features/`
- `src/shared/core/entities/`
- `src/features/`
- `src/shared/infrastructure/repositories/`
- `src/app/components/`
- `.claude/docs/quality/`
- `.claude/docs/security/`
- `src/shared/core/interfaces/`
- `src/shared/core/errors/`
- `src/features/registry.ts`
- `src/app/api/`
- `src/features/youtube-summarize/schema.ts`
- `src/features/youtube-summarize/executor.ts`
- `docs/00-requirements/master_system_design.md`

**完了条件**:

- [ ] 主要な結果と根拠が整理されている
- [ ] 次のアクションが提示されている

### Phase 9: セキュリティ監査の実行

**目的**: セキュリティ監査に関するタスクを実行し、結果を整理する

**背景**: 専門知識が必要なため専門エージェントに委譲する

**ゴール**: セキュリティ監査の結果と次アクションが提示された状態

**起動エージェント**: `.claude/agents/sec-auditor.md`

Task ツールで `.claude/agents/sec-auditor.md` を起動:

**コンテキスト**:

- 引数: $ARGUMENTS（[feature-name]）

**依頼内容**:

- コマンドの目的に沿って実行する
- 結果と次アクションを提示する

**期待成果物**:

- `docs/00-requirements/features/`
- `docs/20-specifications/features/`
- `src/shared/core/entities/`
- `src/features/`
- `src/shared/infrastructure/repositories/`
- `src/app/components/`
- `.claude/docs/quality/`
- `.claude/docs/security/`
- `src/shared/core/interfaces/`
- `src/shared/core/errors/`
- `src/features/registry.ts`
- `src/app/api/`
- `src/features/youtube-summarize/schema.ts`
- `src/features/youtube-summarize/executor.ts`
- `docs/00-requirements/master_system_design.md`

**完了条件**:

- [ ] 主要な結果と根拠が整理されている
- [ ] 次のアクションが提示されている

## 使用例

```bash
/ai:full-feature-development [feature-name]
```
