---
id: TASK-9E
title: スキルフォーク・派生機能実装
tier: 3
phase: 9
depends_on: [TASK-9B]
parallel_with: [TASK-9D, TASK-9F, TASK-9G, TASK-9H, TASK-9I, TASK-9J]
blocks: []
status: pending
priority: low
estimated_complexity: medium
tags: [backend, main, skill-management, fork, derive, future]

execution:
  mode: sequential
  timeout_minutes: 60
  retry_count: 1
  allow_partial: false

verification:
  auto_verify: true
  require_tests: true
  require_typecheck: true

artifacts:
  creates:
    - apps/desktop/src/main/services/skill/SkillForker.ts
    - packages/shared/src/types/skill/fork.ts
  # UI成果物は ./task-030-ui-05-skill-center-view.md#15B.1 で定義
  modifies:
    - packages/shared/src/types/skill/index.ts
    - apps/desktop/src/main/ipc/skillHandlers.ts
    - apps/desktop/src/preload/channels.ts
    - apps/desktop/src/preload/skill-api.ts
    - apps/desktop/src/preload/types.ts
---

# スキルフォーク・派生機能実装

## 概要

既存スキルをベースに新しいスキルを作成する機能。元スキルの設定や構造を引き継ぎながらカスタマイズできる。

## 入力

- TASK-9B: skill-creator スキル（forkコマンド追加済み）
- specification.md §19: フォーク・派生機能仕様
- technical-decisions.md §20: 設計判断

## 出力

- SkillForker サービス
- ForkSkillDialog UI コンポーネント

## 実装手順

### Step 1: 型定義追加と SkillForker 実装

**ファイル**: `packages/shared/src/types/skill/fork.ts`, `apps/desktop/src/main/services/skill/SkillForker.ts`

`ForkOptions` / `ForkResult` / `ForkMetadata` は `packages/shared/src/types/skill/fork.ts` に定義し、`SkillForker.ts` から import して利用する。

```typescript
export interface ForkOptions {
  sourceSkill: string;
  newName: string;
  description?: string;
  copyAgents: boolean;
  copyReferences: boolean;
  copyScripts: boolean;
  copyAssets: boolean;
  modifyAllowedTools?: string[];
}

export interface ForkResult {
  success: boolean;
  newSkillPath: string;
  copiedFiles: string[];
  warnings?: string[];
}

export class SkillForker {
  async fork(options: ForkOptions): Promise<ForkResult>;
  private modifySkillMd(content: string, options: ForkOptions): string;
  private copyDirectory(
    src: string,
    dest: string,
    subDir: string,
  ): Promise<string[]>;
  private writeForkMetadata(
    destPath: string,
    metadata: ForkMetadata,
  ): Promise<void>;
}
```

### Step 2: IPC拡張

**チャネル追加**:

- `skill:fork` - スキルフォーク実行

### Step 3: ForkSkillDialog 実装

> **📐 UI仕様は本ディレクトリの UI タスク（task-030/031/032）に移管済み**
>
> Apple HIG 準拠の UI 仕様: [05-skill-center-view.md#15b1-forkskilldialog](./task-030-ui-05-skill-center-view.md#15b1-forkskilldialog)
>
> 本ファイルはバックエンドサービス・IPC 契約・型定義のみを定義します。

## 検証条件

### 必須条件

- [ ] 既存スキルをフォークして新スキルを作成できる
- [ ] SKILL.md の名前・説明が更新される
- [ ] 選択したサブディレクトリのみコピーされる
- [ ] フォークメタデータ（forked-from）が記録される
- [ ] 同名スキルへのフォークがエラーになる

### 自動検証コマンド

```bash
pnpm --filter @repo/desktop typecheck
pnpm --filter @repo/desktop test -- --grep "SkillForker"
```

## 関連仕様

- specification.md §19: フォーク・派生機能
- technical-decisions.md §20: 設計判断
