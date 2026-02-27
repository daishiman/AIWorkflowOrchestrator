# Phase 8 命名・型定義統一確認

## 確認対象ファイル

| ファイル                                                 | 確認内容           |
| -------------------------------------------------------- | ------------------ |
| `apps/desktop/src/main/services/skill/SkillScheduler.ts` | サービス層命名     |
| `apps/desktop/src/main/services/skill/ScheduleStore.ts`  | ストア層命名       |
| `apps/desktop/src/main/ipc/skillHandlers.ts`             | IPCハンドラー命名  |
| `packages/shared/src/types/skill-schedule.ts`            | 型定義命名         |
| `apps/desktop/src/preload/skill-api.ts`                  | Preload API命名    |
| `apps/desktop/src/preload/channels.ts`                   | チャンネル定数命名 |

## 分析日時

2026-02-27（Phase 8-9 統合検証時に再分析）

## 命名規則チェック結果

### 型名（PascalCase）

| 型名                   | 場所              | 判定 |
| ---------------------- | ----------------- | ---- |
| ScheduledSkill         | skill-schedule.ts | OK   |
| SkillSchedule          | skill-schedule.ts | OK   |
| NotificationSettings   | skill-schedule.ts | OK   |
| ScheduledRunResult     | skill-schedule.ts | OK   |
| SchedulerSkillExecutor | SkillScheduler.ts | OK   |
| ActiveJob              | SkillScheduler.ts | OK   |
| ScheduleStoreSchema    | ScheduleStore.ts  | OK   |

### 関数名（camelCase）

| 関数名                               | 場所              | 判定 |
| ------------------------------------ | ----------------- | ---- |
| addSchedule / updateSchedule 他      | SkillScheduler.ts | OK   |
| add / update / delete / addRunResult | ScheduleStore.ts  | OK   |
| registerSkillScheduleHandlers        | skillHandlers.ts  | OK   |
| unregisterSkillScheduleHandlers      | skillHandlers.ts  | OK   |
| validateStringArg (Phase 8 新規)     | skillHandlers.ts  | OK   |
| toIpcErrorResponse (Phase 8 新規)    | skillHandlers.ts  | OK   |
| findIndexOrThrow (Phase 8 新規)      | ScheduleStore.ts  | OK   |
| buildRunResult (Phase 8 新規)        | SkillScheduler.ts | OK   |

### 定数名（UPPER_SNAKE_CASE）

| 定数名                | 場所             | 判定 |
| --------------------- | ---------------- | ---- |
| SKILL_SCHEDULE_LIST   | channels.ts      | OK   |
| SKILL_SCHEDULE_ADD    | channels.ts      | OK   |
| SKILL_SCHEDULE_UPDATE | channels.ts      | OK   |
| SKILL_SCHEDULE_DELETE | channels.ts      | OK   |
| SKILL_SCHEDULE_TOGGLE | channels.ts      | OK   |
| MAX_RUN_HISTORY       | ScheduleStore.ts | OK   |

### boolean 変数プレフィックス

| 変数名    | 場所                 | プレフィックス | 判定 |
| --------- | -------------------- | -------------- | ---- |
| enabled   | ScheduledSkill 型    | -              | 注記 |
| valid     | IPC validation       | -              | 注記 |
| onSuccess | NotificationSettings | -              | 注記 |
| onFailure | NotificationSettings | -              | 注記 |

注記: `enabled`, `valid`, `onSuccess`, `onFailure` は `is` プレフィックスなしだが、以下の理由で現状維持とする:

- `enabled` は ScheduledSkill のデータプロパティであり、「状態」を表すフィールドとして `enabled` が自然（`isEnabled` は冗長）
- `valid` は validateIpcSender の戻り値プロパティで既存のプロジェクト規約に準拠
- `onSuccess`/`onFailure` はイベントハンドラ命名規約（`on` + イベント名）に準拠しており boolean フラグとしての命名とは異なる文脈

### P45 対策: 引数名のセマンティクス一致

| 引数名     | 実際の値       | 場所                     | 判定                   |
| ---------- | -------------- | ------------------------ | ---------------------- |
| skillName  | スキル名       | SkillScheduler           | OK                     |
| skillName  | スキル名       | IPC add ハンドラー       | OK                     |
| id         | スケジュールID | IPC update/delete/toggle | OK                     |
| scheduleId | -              | -                        | 未使用（ドリフトなし） |

P45 パターン（skillId vs skillName のドリフト）は未検出。全レイヤーで `skillName` を一貫して使用。

### IPC チャンネル名の統一

| チャンネル名          | Preload API メソッド名 | 判定 |
| --------------------- | ---------------------- | ---- |
| skill:schedule:list   | scheduleList           | OK   |
| skill:schedule:add    | scheduleAdd            | OK   |
| skill:schedule:update | scheduleUpdate         | OK   |
| skill:schedule:delete | scheduleDelete         | OK   |
| skill:schedule:toggle | scheduleToggle         | OK   |

### IPC 境界の Date 型統一

| フィールド  | 型定義         | IPC シリアライズ | 判定 |
| ----------- | -------------- | ---------------- | ---- |
| lastRun     | string \| null | ISO 8601         | OK   |
| nextRun     | string \| null | ISO 8601         | OK   |
| createdAt   | string         | ISO 8601         | OK   |
| updatedAt   | string         | ISO 8601         | OK   |
| startedAt   | string         | ISO 8601         | OK   |
| completedAt | string \| null | ISO 8601         | OK   |
| runAt       | string \| null | ISO 8601         | OK   |

## 共有型の公開確認

`packages/shared/src/types/index.ts` L151-152 から以下の型が re-export されていることを確認:

```typescript
// スキルスケジュール型定義 (TASK-9G)
export * from "./skill-schedule";
```

公開される型:

- ScheduledSkill
- SkillSchedule
- NotificationSettings
- ScheduledRunResult

## 検出事項

### 1. 型テスト T-01 での createdAt/updatedAt 省略

型テスト `packages/shared/src/types/__tests__/skill-schedule.test.ts` の T-01 で、`ScheduledSkill` の必須フィールド `createdAt` と `updatedAt` が省略されている。Vitest はランタイムテストであり TypeScript の型チェックは実行しないため、テストは PASS するが、型定義上は必須フィールドの省略は不正。

この問題はテストの意図（「必須フィールドを持つ」の検証）に影響しないため、Phase 8 のスコープ外とし、未タスク化の検討対象とする。

### 2. sender検証失敗時のレスポンス方式の不統一

既存ハンドラー（skill:import 等）は `throw toIPCValidationError(validation)` を使用するが、スケジュールハンドラーは `return toIPCValidationError(validation)` を使用。統一化は TASK-9G のスコープ外。

## 結論

- 命名規則・型定義は全ファイルで統一されている
- P45 パターン（引数名のセマンティクスドリフト）は未検出
- boolean プレフィックスは文脈に応じて既存規約を維持（過度な変更は不要）
- IPC 境界の日時フィールドは全て ISO 8601 文字列で統一
- 2件の軽微な検出事項あり（型テストの必須フィールド省略、sender検証レスポンス方式の不統一）
