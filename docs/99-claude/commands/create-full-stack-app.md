---
description: |
  フルスタックアプリケーション（Next.js App Router）の構築を行う包括的なコマンド。
  実行は専門エージェントに委譲します。

  🤖 起動エージェント:
  - `.claude/agents/router-dev.md`: App Router、Page設計
  - `.claude/agents/ui-designer.md`: UIコンポーネント、デザインシステム
  - `.claude/agents/state-manager.md`: クライアント状態管理、データフェッチ
  - `.claude/agents/domain-modeler.md`: エンティティ、バリューオブジェクト、集約
  - `.claude/agents/db-architect.md`: DB設計、スキーマ、インデックス
  - `.claude/agents/repo-dev.md`: Repository実装、トランザクション
  - `.claude/agents/gateway-dev.md`: API Gateway、エンドポイント設計

  ⚙️ このコマンドの設定:
  - argument-hint: [app-name] [--features]
  - allowed-tools: Task（エージェント起動のみ）
  - model: opus

  トリガーキーワード: full stack, nextjs app, フルスタック, アプリケーション構築, end-to-end
argument-hint: "[app-name] [--features]"
allowed-tools:
  - Task
model: opus
---

# フルスタックアプリケーション構築

## 目的

`.claude/commands/ai/create-full-stack-app.md` の入力を受け取り、専門エージェントに実行を委譲します。

## エージェント起動フロー

### Phase 1: App Router、Page設計の実行

**目的**: App Router、Page設計に関するタスクを実行し、結果を整理する

**背景**: 専門知識が必要なため専門エージェントに委譲する

**ゴール**: App Router、Page設計の結果と次アクションが提示された状態

**起動エージェント**: `.claude/agents/router-dev.md`

Task ツールで `.claude/agents/router-dev.md` を起動:

**コンテキスト**:

- 引数: $ARGUMENTS（[app-name] [--features]）

**依頼内容**:

- コマンドの目的に沿って実行する
- 結果と次アクションを提示する

**期待成果物**:

- `src/app/`
- `src/app/components/`
- `src/shared/core/entities/`
- `src/shared/infrastructure/database/`
- `src/features/`
- `src/shared/core/interfaces/`
- `src/shared/infrastructure/database/schema.ts`
- `src/shared/infrastructure/database/repositories/`
- `src/app/api/v1/`
- `src/app/layout.tsx`
- `src/app/page.tsx`
- `src/app/error.tsx`
- `src/app/not-found.tsx`
- `src/app/components/ui/`
- `src/hooks/`
- `src/app/providers.tsx`
- `src/hooks/use`
- `src/shared/infrastructure/`
- `src/shared/core/`
- `.env`

**完了条件**:

- [ ] 主要な結果と根拠が整理されている
- [ ] 次のアクションが提示されている

### Phase 2: UIコンポーネント、デザインシステムの実行

**目的**: UIコンポーネント、デザインシステムに関するタスクを実行し、結果を整理する

**背景**: 専門知識が必要なため専門エージェントに委譲する

**ゴール**: UIコンポーネント、デザインシステムの結果と次アクションが提示された状態

**起動エージェント**: `.claude/agents/ui-designer.md`

Task ツールで `.claude/agents/ui-designer.md` を起動:

**コンテキスト**:

- 引数: $ARGUMENTS（[app-name] [--features]）

**依頼内容**:

- コマンドの目的に沿って実行する
- 結果と次アクションを提示する

**期待成果物**:

- `src/app/`
- `src/app/components/`
- `src/shared/core/entities/`
- `src/shared/infrastructure/database/`
- `src/features/`
- `src/shared/core/interfaces/`
- `src/shared/infrastructure/database/schema.ts`
- `src/shared/infrastructure/database/repositories/`
- `src/app/api/v1/`
- `src/app/layout.tsx`
- `src/app/page.tsx`
- `src/app/error.tsx`
- `src/app/not-found.tsx`
- `src/app/components/ui/`
- `src/hooks/`
- `src/app/providers.tsx`
- `src/hooks/use`
- `src/shared/infrastructure/`
- `src/shared/core/`
- `.env`

**完了条件**:

- [ ] 主要な結果と根拠が整理されている
- [ ] 次のアクションが提示されている

### Phase 3: クライアント状態管理、データフェッチの実行

**目的**: クライアント状態管理、データフェッチに関するタスクを実行し、結果を整理する

**背景**: 専門知識が必要なため専門エージェントに委譲する

**ゴール**: クライアント状態管理、データフェッチの結果と次アクションが提示された状態

**起動エージェント**: `.claude/agents/state-manager.md`

Task ツールで `.claude/agents/state-manager.md` を起動:

**コンテキスト**:

- 引数: $ARGUMENTS（[app-name] [--features]）

**依頼内容**:

- コマンドの目的に沿って実行する
- 結果と次アクションを提示する

**期待成果物**:

- `src/app/`
- `src/app/components/`
- `src/shared/core/entities/`
- `src/shared/infrastructure/database/`
- `src/features/`
- `src/shared/core/interfaces/`
- `src/shared/infrastructure/database/schema.ts`
- `src/shared/infrastructure/database/repositories/`
- `src/app/api/v1/`
- `src/app/layout.tsx`
- `src/app/page.tsx`
- `src/app/error.tsx`
- `src/app/not-found.tsx`
- `src/app/components/ui/`
- `src/hooks/`
- `src/app/providers.tsx`
- `src/hooks/use`
- `src/shared/infrastructure/`
- `src/shared/core/`
- `.env`

**完了条件**:

- [ ] 主要な結果と根拠が整理されている
- [ ] 次のアクションが提示されている

### Phase 4: エンティティ、バリューオブジェクト、集約の実行

**目的**: エンティティ、バリューオブジェクト、集約に関するタスクを実行し、結果を整理する

**背景**: 専門知識が必要なため専門エージェントに委譲する

**ゴール**: エンティティ、バリューオブジェクト、集約の結果と次アクションが提示された状態

**起動エージェント**: `.claude/agents/domain-modeler.md`

Task ツールで `.claude/agents/domain-modeler.md` を起動:

**コンテキスト**:

- 引数: $ARGUMENTS（[app-name] [--features]）

**依頼内容**:

- コマンドの目的に沿って実行する
- 結果と次アクションを提示する

**期待成果物**:

- `src/app/`
- `src/app/components/`
- `src/shared/core/entities/`
- `src/shared/infrastructure/database/`
- `src/features/`
- `src/shared/core/interfaces/`
- `src/shared/infrastructure/database/schema.ts`
- `src/shared/infrastructure/database/repositories/`
- `src/app/api/v1/`
- `src/app/layout.tsx`
- `src/app/page.tsx`
- `src/app/error.tsx`
- `src/app/not-found.tsx`
- `src/app/components/ui/`
- `src/hooks/`
- `src/app/providers.tsx`
- `src/hooks/use`
- `src/shared/infrastructure/`
- `src/shared/core/`
- `.env`

**完了条件**:

- [ ] 主要な結果と根拠が整理されている
- [ ] 次のアクションが提示されている

### Phase 5: DB設計、スキーマ、インデックスの実行

**目的**: DB設計、スキーマ、インデックスに関するタスクを実行し、結果を整理する

**背景**: 専門知識が必要なため専門エージェントに委譲する

**ゴール**: DB設計、スキーマ、インデックスの結果と次アクションが提示された状態

**起動エージェント**: `.claude/agents/db-architect.md`

Task ツールで `.claude/agents/db-architect.md` を起動:

**コンテキスト**:

- 引数: $ARGUMENTS（[app-name] [--features]）

**依頼内容**:

- コマンドの目的に沿って実行する
- 結果と次アクションを提示する

**期待成果物**:

- `src/app/`
- `src/app/components/`
- `src/shared/core/entities/`
- `src/shared/infrastructure/database/`
- `src/features/`
- `src/shared/core/interfaces/`
- `src/shared/infrastructure/database/schema.ts`
- `src/shared/infrastructure/database/repositories/`
- `src/app/api/v1/`
- `src/app/layout.tsx`
- `src/app/page.tsx`
- `src/app/error.tsx`
- `src/app/not-found.tsx`
- `src/app/components/ui/`
- `src/hooks/`
- `src/app/providers.tsx`
- `src/hooks/use`
- `src/shared/infrastructure/`
- `src/shared/core/`
- `.env`

**完了条件**:

- [ ] 主要な結果と根拠が整理されている
- [ ] 次のアクションが提示されている

### Phase 6: Repository実装、トランザクションの実行

**目的**: Repository実装、トランザクションに関するタスクを実行し、結果を整理する

**背景**: 専門知識が必要なため専門エージェントに委譲する

**ゴール**: Repository実装、トランザクションの結果と次アクションが提示された状態

**起動エージェント**: `.claude/agents/repo-dev.md`

Task ツールで `.claude/agents/repo-dev.md` を起動:

**コンテキスト**:

- 引数: $ARGUMENTS（[app-name] [--features]）

**依頼内容**:

- コマンドの目的に沿って実行する
- 結果と次アクションを提示する

**期待成果物**:

- `src/app/`
- `src/app/components/`
- `src/shared/core/entities/`
- `src/shared/infrastructure/database/`
- `src/features/`
- `src/shared/core/interfaces/`
- `src/shared/infrastructure/database/schema.ts`
- `src/shared/infrastructure/database/repositories/`
- `src/app/api/v1/`
- `src/app/layout.tsx`
- `src/app/page.tsx`
- `src/app/error.tsx`
- `src/app/not-found.tsx`
- `src/app/components/ui/`
- `src/hooks/`
- `src/app/providers.tsx`
- `src/hooks/use`
- `src/shared/infrastructure/`
- `src/shared/core/`
- `.env`

**完了条件**:

- [ ] 主要な結果と根拠が整理されている
- [ ] 次のアクションが提示されている

### Phase 7: API Gateway、エンドポイント設計の実行

**目的**: API Gateway、エンドポイント設計に関するタスクを実行し、結果を整理する

**背景**: 専門知識が必要なため専門エージェントに委譲する

**ゴール**: API Gateway、エンドポイント設計の結果と次アクションが提示された状態

**起動エージェント**: `.claude/agents/gateway-dev.md`

Task ツールで `.claude/agents/gateway-dev.md` を起動:

**コンテキスト**:

- 引数: $ARGUMENTS（[app-name] [--features]）

**依頼内容**:

- コマンドの目的に沿って実行する
- 結果と次アクションを提示する

**期待成果物**:

- `src/app/`
- `src/app/components/`
- `src/shared/core/entities/`
- `src/shared/infrastructure/database/`
- `src/features/`
- `src/shared/core/interfaces/`
- `src/shared/infrastructure/database/schema.ts`
- `src/shared/infrastructure/database/repositories/`
- `src/app/api/v1/`
- `src/app/layout.tsx`
- `src/app/page.tsx`
- `src/app/error.tsx`
- `src/app/not-found.tsx`
- `src/app/components/ui/`
- `src/hooks/`
- `src/app/providers.tsx`
- `src/hooks/use`
- `src/shared/infrastructure/`
- `src/shared/core/`
- `.env`

**完了条件**:

- [ ] 主要な結果と根拠が整理されている
- [ ] 次のアクションが提示されている

## 使用例

```bash
/ai:create-full-stack-app [app-name] [--features]
```
