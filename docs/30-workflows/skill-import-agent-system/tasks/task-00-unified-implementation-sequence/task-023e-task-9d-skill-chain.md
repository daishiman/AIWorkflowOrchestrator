---
id: TASK-9D
title: スキルチェーン機能実装
tier: 3
phase: 9
depends_on: [TASK-9B]
parallel_with: [TASK-9E, TASK-9F, TASK-9G, TASK-9H, TASK-9I, TASK-9J]
blocks: []
status: pending
priority: low
estimated_complexity: large
tags: [backend, main, skill-management, chain, pipeline, future]

execution:
  mode: sequential
  timeout_minutes: 90
  retry_count: 1
  allow_partial: false

verification:
  auto_verify: true
  require_tests: true
  require_typecheck: true

artifacts:
  creates:
    - apps/desktop/src/main/services/skill/SkillChain.ts
    - apps/desktop/src/main/services/skill/SkillChainExecutor.ts
    - packages/shared/src/types/skill/chain.ts
  # UI成果物は ./task-031b-ui-05b-skill-advanced-views.md#3A で定義
  modifies:
    - packages/shared/src/types/skill/index.ts
    - apps/desktop/src/main/ipc/skillHandlers.ts
    - apps/desktop/src/preload/channels.ts
    - apps/desktop/src/preload/skill-api.ts
    - apps/desktop/src/preload/types.ts
    - apps/desktop/src/renderer/store/slices/skillSlice.ts
---

# スキルチェーン機能実装

## 概要

複数のスキルをパイプラインとして連携させ、1つのスキルの出力を次のスキルの入力として渡す機能を実装する。

## 入力

- TASK-9B: skill-creator スキル（チェーン作成コマンド追加済み）
- specification.md §18: スキル連携・チェーン機能仕様
- technical-decisions.md §19: 設計判断

## 出力

- SkillChainExecutor サービス
- SkillChainBuilder UI コンポーネント
- IPC/API 拡張

## 実装手順

### Step 1: 型定義追加

**ファイル**: `packages/shared/src/types/skill/chain.ts`

```typescript
export interface SkillChainDefinition {
  id: string;
  name: string;
  description: string;
  steps: SkillChainStep[];
  variables: Record<string, unknown>;
  errorHandling: "stop" | "skip" | "retry";
  createdAt: string;
  updatedAt: string;
}

export interface SkillChainStep {
  stepId: string;
  skillName: string;
  inputMapping: InputMapping;
  outputMapping?: OutputMapping;
  condition?: SkillChainCondition;
  timeout?: number;
  retryCount?: number;
}

export interface InputMapping {
  type: "literal" | "variable" | "template" | "previousOutput";
  value?: string;
  template?: string;
}

export interface OutputMapping {
  extractPath?: string;
  variableName: string;
}

export interface SkillChainCondition {
  type: "always" | "ifVariable" | "ifPreviousSuccess" | "expression";
  expression?: string;
  variable?: string;
  expectedValue?: unknown;
}

export interface SkillChainResult {
  chainId: string;
  success: boolean;
  results: StepResult[];
  finalVariables: Record<string, unknown>;
  totalDuration: number;
}

export interface StepResult {
  stepId: string;
  success?: boolean;
  skipped?: boolean;
  output?: string;
  error?: string;
  duration?: number;
}
```

### Step 2: SkillChainExecutor 実装

**ファイル**: `apps/desktop/src/main/services/skill/SkillChainExecutor.ts`

- `executeChain()` - チェーン実行
- `buildStepInput()` - ステップ入力構築
- `evaluateCondition()` - 条件評価
- `extractOutput()` - 出力抽出（JSONPath）
- `renderTemplate()` - Mustacheテンプレート処理

### Step 3: SkillChainStore 実装

**ファイル**: `apps/desktop/src/main/services/skill/SkillChainStore.ts`

- `save()` - チェーン保存
- `get()` - チェーン取得
- `list()` - チェーン一覧
- `delete()` - チェーン削除

### Step 4: IPC拡張

**チャネル追加**:

- `skill:chain:list`
- `skill:chain:get`
- `skill:chain:save`
- `skill:chain:delete`
- `skill:chain:execute`

### Step 5: SkillChainBuilder UI実装

> **📐 UI仕様は本ディレクトリの UI タスク（task-030/031/032）に移管済み**
>
> Apple HIG 準拠の UI 仕様: [05B-skill-advanced-views.md#3a-skillchainbuilder](./task-031b-ui-05b-skill-advanced-views.md#3a-skillchainbuilder)
>
> 本ファイルはバックエンドサービス・IPC 契約・型定義のみを定義します。

### Step 6: SkillChainStepEditor 実装

> **📐 UI仕様は本ディレクトリの UI タスク（task-030/031/032）に移管済み**
>
> Apple HIG 準拠の UI 仕様: [05B-skill-advanced-views.md#3a-skillchainbuilder](./task-031b-ui-05b-skill-advanced-views.md#3a-skillchainbuilder)
>
> 本ファイルはバックエンドサービス・IPC 契約・型定義のみを定義します。

## 検証条件

### 必須条件

- [ ] チェーン定義の作成・保存ができる
- [ ] チェーン実行で各ステップが順次実行される
- [ ] 前ステップの出力が次ステップの入力として渡される
- [ ] 条件付きステップが正しく評価される
- [ ] エラーハンドリング（stop/skip/retry）が機能する

### 自動検証コマンド

```bash
# 型チェック
pnpm --filter @repo/desktop typecheck

# テスト
pnpm --filter @repo/desktop test -- --grep "SkillChain"
```

## 関連仕様

- specification.md §18: スキル連携・チェーン機能
- technical-decisions.md §19: 設計判断
