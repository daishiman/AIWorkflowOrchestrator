---
id: TASK-9G
title: スキルスケジュール実行機能実装
tier: 3
phase: 9
depends_on: [TASK-9B]
parallel_with: [TASK-9D, TASK-9E, TASK-9F, TASK-9H, TASK-9I, TASK-9J]
blocks: []
status: pending
priority: low
estimated_complexity: large
tags: [backend, main, skill-management, schedule, cron, automation, future]

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
    - apps/desktop/src/main/services/skill/SkillScheduler.ts
    - apps/desktop/src/main/services/skill/ScheduleStore.ts
  # UI成果物は ./task-032-ui-05b-skill-advanced-views.md#3B で定義
  modifies:
    - apps/desktop/src/main/ipc/skillHandlers.ts
    - apps/desktop/src/preload/skillAPI.ts
    - apps/desktop/src/main/index.ts
---

# スキルスケジュール実行機能実装

## 概要

スキルを定期的に、または特定のタイミングで自動実行するスケジューリング機能。

## 入力

- TASK-9B: skill-creator スキル（scheduleコマンド追加済み）
- specification.md §21: スケジュール実行機能仕様
- technical-decisions.md §22: 設計判断

## 出力

- SkillScheduler サービス
- ScheduleStore 永続化
- スケジュール管理UI

## 実装手順

### Step 1: 型定義追加

**ファイル**: `packages/shared/src/types/skillSchedule.ts`

```typescript
export interface ScheduledSkill {
  id: string;
  skillName: string;
  prompt: string;
  schedule: SkillSchedule;
  enabled: boolean;
  lastRun?: Date;
  nextRun?: Date;
  runHistory: ScheduledRunResult[];
  notification: NotificationSettings;
}

export interface SkillSchedule {
  type: "cron" | "interval" | "once" | "event";
  cronExpression?: string;
  interval?: number;
  runAt?: Date;
  event?: "app_start" | "file_change" | "git_commit";
  eventConfig?: Record<string, unknown>;
}

export interface NotificationSettings {
  onSuccess: boolean;
  onFailure: boolean;
  notificationType: "system" | "inApp" | "both";
}

export interface ScheduledRunResult {
  runId: string;
  startedAt: Date;
  completedAt?: Date;
  success: boolean;
  output?: string;
  error?: string;
}
```

### Step 2: ScheduleStore 実装

**ファイル**: `apps/desktop/src/main/services/skill/ScheduleStore.ts`

- electron-store によるスケジュール永続化
- CRUD操作
- 実行履歴管理

### Step 3: SkillScheduler 実装

**ファイル**: `apps/desktop/src/main/services/skill/SkillScheduler.ts`

```typescript
export class SkillScheduler {
  async initialize(): Promise<void>; // アプリ起動時
  async addSchedule(
    schedule: Omit<ScheduledSkill, "id" | "runHistory">,
  ): Promise<ScheduledSkill>;
  async updateSchedule(
    id: string,
    updates: Partial<ScheduledSkill>,
  ): Promise<void>;
  async deleteSchedule(id: string): Promise<void>;
  async enableSchedule(id: string): Promise<void>;
  async disableSchedule(id: string): Promise<void>;

  private activateSchedule(schedule: ScheduledSkill): void;
  private deactivateSchedule(id: string): void;
  private executeScheduledSkill(schedule: ScheduledSkill): Promise<void>;
  private calculateNextRun(schedule: SkillSchedule): Date | undefined;
  private registerEventListener(schedule: ScheduledSkill): void;
}
```

### Step 4: アプリ起動時の初期化

**修正**: `apps/desktop/src/main/index.ts`

- `SkillScheduler.initialize()` をアプリ起動時に呼び出し
- 保存済みスケジュールの復元

### Step 5: IPC拡張

**チャネル追加**:

- `skill:schedule:list`
- `skill:schedule:add`
- `skill:schedule:update`
- `skill:schedule:delete`
- `skill:schedule:toggle`

### Step 6: ScheduleSkillDialog 実装

> **📐 UI仕様は本ディレクトリの UI タスク（task-030/031/032）に移管済み**
>
> Apple HIG 準拠の UI 仕様: [05B-skill-advanced-views.md#3b-schedulemanager](./task-032-ui-05b-skill-advanced-views.md#3b-schedulemanager)
>
> 本ファイルはバックエンドサービス・IPC 契約・型定義のみを定義します。

### Step 7: CronEditor 実装

> **📐 UI仕様は本ディレクトリの UI タスク（task-030/031/032）に移管済み**
>
> Apple HIG 準拠の UI 仕様: [05B-skill-advanced-views.md#3b-schedulemanager](./task-032-ui-05b-skill-advanced-views.md#3b-schedulemanager)
>
> 本ファイルはバックエンドサービス・IPC 契約・型定義のみを定義します。

### Step 8: ScheduleList 実装

> **📐 UI仕様は本ディレクトリの UI タスク（task-030/031/032）に移管済み**
>
> Apple HIG 準拠の UI 仕様: [05B-skill-advanced-views.md#3b-schedulemanager](./task-032-ui-05b-skill-advanced-views.md#3b-schedulemanager)
>
> 本ファイルはバックエンドサービス・IPC 契約・型定義のみを定義します。

## 依存パッケージ

```bash
pnpm --filter @repo/desktop add node-cron
pnpm --filter @repo/desktop add -D @types/node-cron
```

## 検証条件

### 必須条件

- [ ] Cron形式でスケジュールを設定できる
- [ ] 指定時刻にスキルが自動実行される
- [ ] アプリ再起動後もスケジュールが保持される
- [ ] スケジュールの有効/無効を切り替えられる
- [ ] 実行結果の通知が機能する
- [ ] イベントトリガー（app_start）が機能する

### 自動検証コマンド

```bash
pnpm --filter @repo/desktop typecheck
pnpm --filter @repo/desktop test -- --grep "SkillScheduler"
```

## 関連仕様

- specification.md §21: スケジュール実行機能
- technical-decisions.md §22: 設計判断
