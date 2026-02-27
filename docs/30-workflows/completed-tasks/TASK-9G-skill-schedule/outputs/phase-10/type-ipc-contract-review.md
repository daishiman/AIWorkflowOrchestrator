# Phase 10 型安全性・IPC契約レビュー

## メタ情報

| 項目          | 内容                                     |
| ------------- | ---------------------------------------- |
| レビュー日    | 2026-02-27                               |
| 対象タスク    | TASK-9G                                  |
| レビューPhase | 10（再実行）                             |
| レビュー担当  | Claude Code（自動レビュー + テスト実行） |

---

## 型整合性マトリクス

| メソッド        | Preload引数型                                      | Main引数型                                         | Preload戻り値型               | Main戻り値型                          | 整合 |
| --------------- | -------------------------------------------------- | -------------------------------------------------- | ----------------------------- | ------------------------------------- | :--: |
| schedule.list   | なし                                               | なし                                               | `ScheduledSkill[]`            | `{ success, data: ScheduledSkill[] }` |  OK  |
| schedule.add    | `Omit<ScheduledSkill, "id" \| "runHistory">`       | `Omit<ScheduledSkill, "id" \| "runHistory">`       | `ScheduledSkill`              | `{ success, data: ScheduledSkill }`   |  OK  |
| schedule.update | `{ id: string, updates: Partial<ScheduledSkill> }` | `{ id: string, updates: Partial<ScheduledSkill> }` | `void`                        | `{ success: true }`                   |  OK  |
| schedule.delete | `{ id: string }`                                   | `{ id: string }`                                   | `void`                        | `{ success: true }`                   |  OK  |
| schedule.toggle | `{ id: string }`                                   | `{ id: string }`                                   | `ScheduledSkill \| undefined` | `{ success, data: ScheduledSkill }`   |  OK  |

### Preload側の呼び出し形式確認

```typescript
// skill-api.ts
scheduleList: () =>
  safeInvokeUnwrap<ScheduledSkill[]>(IPC_CHANNELS.SKILL_SCHEDULE_LIST);
scheduleAdd: (input) =>
  safeInvokeUnwrap<ScheduledSkill>(IPC_CHANNELS.SKILL_SCHEDULE_ADD, input);
scheduleUpdate: (id, updates) =>
  safeInvokeUnwrap<void>(IPC_CHANNELS.SKILL_SCHEDULE_UPDATE, { id, updates });
scheduleDelete: (id) =>
  safeInvokeUnwrap<void>(IPC_CHANNELS.SKILL_SCHEDULE_DELETE, { id });
scheduleToggle: (id) =>
  safeInvokeUnwrap<ScheduledSkill | undefined>(
    IPC_CHANNELS.SKILL_SCHEDULE_TOGGLE,
    { id },
  );
```

- `safeInvokeUnwrap` がIpcResult ラッパーを展開するため、Renderer側は `data` フィールドを直接取得する
- Preloadの引数がオブジェクト形式（`{ id }`, `{ id, updates }`）であり、Main側ハンドラーの引数定義と一致している

---

## IPC契約チェック（P44/P45対策）

| チェック項目             | 確認内容                                                              | 結果 |
| ------------------------ | --------------------------------------------------------------------- | :--: |
| 引数形式一致             | Preload側 `{ id }` / `{ id, updates }` とMain側引数型が一致           |  OK  |
| 引数名セマンティクス一致 | `id` = スケジュールID（UUID）、`skillName` = スキル名。命名と値が一致 |  OK  |
| 内部メソッド引数名伝搬   | `SkillScheduler.updateSchedule(id, updates)` - Preload側と一致        |  OK  |
| 型アサーション不使用     | **2箇所で `as` 使用あり（MINOR指摘）**                                | 指摘 |
| 共有型利用               | `ScheduledSkill` が `@repo/shared` から正しくimportされている         |  OK  |

### 型アサーション使用箇所（MINOR指摘）

#### MINOR-TYPE-01: SkillScheduler.ts addSchedule() メソッド

実装では `Omit<ScheduledSkill, "id" | "runHistory">` の各フィールドを個別にスプレッドし、`id` と `runHistory` を明示的に追加している。`as` キャストは使用されていない。

```typescript
const schedule: ScheduledSkill = {
  skillName: input.skillName,
  prompt: input.prompt,
  schedule: input.schedule,
  enabled: input.enabled,
  notification: input.notification,
  lastRun: input.lastRun,
  id: randomUUID(),
  runHistory: [],
  nextRun: nextRun ? nextRun.toISOString() : null,
  createdAt: now,
  updatedAt: now,
};
```

- **判定: PASS** - 前回レビュー時点から改善済み。各フィールドを明示的に列挙しており型安全

#### MINOR-TYPE-02: SkillScheduler.ts updateSchedule() 152行目

```typescript
const merged = { ...stored, ...updates } as ScheduledSkill;
```

- `stored` は `ScheduledSkill`、`updates` は `Partial<ScheduledSkill>` のため、マージ結果は `ScheduledSkill` であるはず。TypeScriptの型推論ではスプレッド結果がPartialの影響を受けるため `as` が必要
- **判定: MINOR** - 型推論の制約による使用であり、バリデーション回避ではない

---

## Date -> ISO 8601 変換の一貫性

### 型定義での方針

```typescript
// skill-schedule.ts コメント
// IPC シリアライズ方針:
// - 日時フィールド（lastRun, nextRun, startedAt, completedAt, runAt）は全て string（ISO 8601）で定義
// - Main Process 内部では Date オブジェクトを使用し、IPC 境界で .toISOString() に変換する
```

### 変換箇所の検証

| フィールド  | 変換箇所                                             | 変換方法                           | 確認 |
| ----------- | ---------------------------------------------------- | ---------------------------------- | :--: |
| createdAt   | SkillScheduler.addSchedule()                         | `new Date().toISOString()`         |  OK  |
| updatedAt   | SkillScheduler.addSchedule(), ScheduleStore.update() | `new Date().toISOString()`         |  OK  |
| nextRun     | SkillScheduler.addSchedule(), calculateNextRun()     | `nextRun.toISOString()`            |  OK  |
| lastRun     | ScheduleStore.addRunResult()                         | `result.startedAt`（既にISO 8601） |  OK  |
| startedAt   | SkillScheduler.executeScheduledSkill()               | `new Date().toISOString()`         |  OK  |
| completedAt | SkillScheduler.buildRunResult()                      | `new Date().toISOString()`         |  OK  |

**評価**: 全日時フィールドが ISO 8601 文字列としてシリアライズされている。Date オブジェクトが直接 IPC 境界を越えることはない。

---

## P32チェック（型定義の二箇所同時更新）

| ファイル                               | 更新状況 | 内容                                                    |
| -------------------------------------- | :------: | ------------------------------------------------------- |
| `packages/shared/src/types/index.ts`   |    OK    | `export * from "./skill-schedule"` 追加                 |
| `apps/desktop/src/preload/channels.ts` |    OK    | `SKILL_SCHEDULE_*` 5チャンネル定数 + ホワイトリスト追加 |

### 共有型の参照パス確認

| レイヤー | ファイル                                                                | import元                                | 確認 |
| -------- | ----------------------------------------------------------------------- | --------------------------------------- | :--: |
| Shared   | `packages/shared/src/types/skill-schedule.ts`                           | 正本（型定義元）                        |  OK  |
| Main     | `apps/desktop/src/main/ipc/skillHandlers.ts`                            | `@repo/shared`                          |  OK  |
| Main     | `apps/desktop/src/main/services/skill/SkillScheduler.ts`                | `@repo/shared`                          |  OK  |
| Main     | `apps/desktop/src/main/services/skill/ScheduleStore.ts`                 | `@repo/shared`                          |  OK  |
| Preload  | `apps/desktop/src/preload/skill-api.ts`                                 | `@repo/shared`                          |  OK  |
| Test     | `packages/shared/src/types/__tests__/skill-schedule.test.ts`            | `../skill-schedule`                     |  OK  |
| Test     | `apps/desktop/src/main/services/skill/__tests__/ScheduleStore.test.ts`  | `@repo/shared/src/types/skill-schedule` |  OK  |
| Test     | `apps/desktop/src/main/services/skill/__tests__/SkillScheduler.test.ts` | `@repo/shared/src/types/skill-schedule` |  OK  |

---

## ScheduledSkill の createdAt/updatedAt フィールド確認

型定義（`skill-schedule.ts`）では `createdAt: string` / `updatedAt: string` が必須フィールドだが、`ScheduleStore.test.ts` の `createTestSchedule()` ではこれらのフィールドが含まれていない。

- ScheduleStore の `add()` メソッドがデフォルト値を補完するため、テスト動作には影響しない
- TypeScript コンパイルでは `ScheduledSkill` 型に `createdAt`/`updatedAt` が必須だが、テストヘルパーの型が暗黙的に互換
- **判定: 情報のみ** - テストヘルパーの型完全性を改善する余地はあるが、テスト結果には影響しない

---

## 判定

**指摘あり（MINOR x 1）**

- Preload側引数形式とMain側ハンドラー引数が完全一致（P44対策完了）
- 引数名のセマンティクスが実際の値と一致（P45対策完了）
- 共有型 `ScheduledSkill` が全レイヤーで `@repo/shared` から正しく参照
- P32（型定義の二箇所同時更新）が適切に実施済み
- Date -> ISO 8601 変換が全日時フィールドで一貫して実施
- `as` キャスト1箇所（updateSchedule）は型推論補助目的であり、バリデーション回避ではない（MINOR）
