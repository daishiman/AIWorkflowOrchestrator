# Phase 8: リファクタリング - タスク仕様書

## メタ情報

| 項目       | 内容                              |
| ---------- | --------------------------------- |
| Phase      | 8                                 |
| Phase名    | リファクタリング（TDD: Refactor） |
| タスクID   | TASK-9G                           |
| 前提Phase  | Phase 7（カバレッジ確認）         |
| 後続Phase  | Phase 9（品質保証）               |
| ステータス | 完了（2026-02-27）                |
| 作成日     | 2026-02-27                        |
| 機能名     | TASK-9G-skill-schedule            |

---

## 目的

TDD の Refactor フェーズとして、テストを維持しながらスキルスケジュール機能全体（SkillScheduler / ScheduleStore / IPCハンドラー）のコード品質を向上させる。
重複コードの抽出、SOLID原則の適用、命名の統一を実施し、保守性を改善する。

## 背景

Phase 5〜7 で実装した SkillScheduler（スケジューラサービス）、ScheduleStore（永続化）、IPCハンドラー5件は、各レイヤーで類似のバリデーション・エラーハンドリングパターンを繰り返している。
特に activateSchedule / deactivateSchedule のスケジュール制御ロジックと、5つのIPCハンドラーの3段バリデーションパターンに重複が見込まれる。
統合的なリファクタリングにより、レイヤー横断での品質向上と今後のスケジュールUI実装時の保守性を確保する。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: SkillScheduler の重複コード分析・抽出

**目的**: SkillScheduler 内の activateSchedule / deactivateSchedule / スケジュール種別ごとの起動ロジックに重複がないか分析し、抽出する

**実行手順**:

1. `apps/desktop/src/main/services/skill/SkillScheduler.ts` を読み込む
2. スケジュール種別（cron / interval / oneshot / event）ごとの起動ロジックで重複箇所を特定する
3. activateSchedule / deactivateSchedule でスケジュール状態変更の処理パターンが共通化可能か分析する
4. node-cron / setInterval / setTimeout の管理パターンが統一されているか確認する
5. SRP（単一責務原則）の観点でスケジュール実行とスケジュール管理の分離を検討する
6. 抽出・分離する場合は実装し、全テストがパスすることを確認する
7. 分離しない場合はその理由を記録する

**分析観点**:

| 観点                             | 確認内容                                                                                 |
| -------------------------------- | ---------------------------------------------------------------------------------------- |
| スケジュール起動ロジック重複     | cron/interval/oneshot/event の各起動処理で同一のセットアップコードが繰り返されていないか |
| activate/deactivate重複          | 状態変更→永続化→タイマー操作の3ステップが両メソッドで共通化可能か                        |
| タイマーリソース管理パターン統一 | cron.schedule / setInterval / setTimeout の停止・クリーンアップが統一されているか        |
| エラーハンドリングパターン       | 各メソッドのcatchブロックで同一パターンが繰り返されていないか                            |

**判断基準**:

| 判断     | 条件                                                             |
| -------- | ---------------------------------------------------------------- |
| 抽出する | 3行以上の完全に同一のコードブロックが3箇所以上ある場合           |
| 分離する | タイマー管理のメソッドが4つ以上あり独立した責務を形成する場合    |
| 見送る   | 抽出・分離すると可読性が低下し、テストの保守コストが増加する場合 |

**確認コマンド**:

```bash
cd apps/desktop && pnpm vitest run src/main/services/skill/__tests__/SkillScheduler --reporter=verbose
```

**期待される成果物**:

- `outputs/phase-8/skillscheduler-refactoring-analysis.md`

---

### タスク2: ScheduleStore のバリデーションロジック抽出

**目的**: ScheduleStore 内のスケジュールデータバリデーション（cron式検証、インターバル範囲検証、日時検証）の重複を分析・抽出する

**実行手順**:

1. `apps/desktop/src/main/services/skill/ScheduleStore.ts` を読み込む
2. addSchedule / updateSchedule で同一のバリデーションロジックが繰り返されていないか確認する
3. スケジュール種別ごとのバリデーション（cron式の妥当性、インターバルの範囲チェック、oneshot日時の過去チェック）の共通化可能性を分析する
4. electron-store からの読み込みデータの実行時バリデーション（P19対策）が統一されているか確認する
5. 共通バリデーション関数の抽出可否を判断する
6. 抽出する場合は実装し、全テストがパスすることを確認する

**バリデーション重複候補**:

```typescript
// Before: add/update で繰り返されるパターン（想定）
if (schedule.type === "cron" && !cron.validate(schedule.cronExpression)) {
  throw { code: "VALIDATION_ERROR", message: "Invalid cron expression" };
}
if (schedule.type === "interval" && schedule.intervalMs < 60000) {
  throw { code: "VALIDATION_ERROR", message: "Interval must be >= 60s" };
}

// After: 共通バリデーション関数（検討）
function validateScheduleConfig(schedule: SkillSchedule): void {
  // スケジュール種別ごとのバリデーションを1箇所に集約
}
```

**確認コマンド**:

```bash
cd apps/desktop && pnpm vitest run src/main/services/skill/__tests__/ScheduleStore --reporter=verbose
```

**期待される成果物**:

- `outputs/phase-8/schedulestore-validation-extraction.md`

---

### タスク3: IPCハンドラーの共通バリデーション関数化

**目的**: 5つのスケジュール関連IPCハンドラーに共通する3段バリデーション（型チェック → 空文字列 → トリム空文字列）を共通関数に抽出する

**実行手順**:

1. `apps/desktop/src/main/ipc/skillHandlers.ts` のスケジュール関連5ハンドラーを読み込む
2. 各ハンドラーの `validateIpcSender` → バリデーション → try/catch パターンを分析する
3. P42準拠の3段バリデーション（型チェック → 空文字列 → トリム空文字列）が各ハンドラーで重複していないか確認する
4. 既存の他のskillHandlers（TASK-9Aで追加されたものを含む）との共通化可能性を確認する
5. 共通バリデーション関数の抽出可否を判断する
6. 抽出する場合は実装し、全テスト（スケジュール関連ハンドラーテスト全件）がパスすることを確認する

**抽出候補**:

```typescript
// Before: 各ハンドラーで繰り返されるパターン
if (typeof skillName !== "string" || skillName.trim() === "") {
  throw {
    code: "VALIDATION_ERROR",
    message: "skillName must be a non-empty string",
  };
}
if (typeof scheduleId !== "string" || scheduleId.trim() === "") {
  throw {
    code: "VALIDATION_ERROR",
    message: "scheduleId must be a non-empty string",
  };
}

// After: 共通バリデーション関数（検討）
function validateStringArg(value: unknown, argName: string): string {
  if (typeof value !== "string" || value.trim() === "") {
    throw {
      code: "VALIDATION_ERROR",
      message: `${argName} must be a non-empty string`,
    };
  }
  return value.trim();
}
```

**確認コマンド**:

```bash
cd apps/desktop && pnpm vitest run src/main/ipc/__tests__/skillHandlers --reporter=verbose --grep "schedule"
```

**期待される成果物**:

- `outputs/phase-8/ipc-schedule-validation-commonization.md`

---

### タスク4: 命名規則・型定義統一確認

**目的**: スキルスケジュール機能の全ファイルで命名規則と型定義が統一されていることを確認する

**実行手順**:

1. 全対象ファイルの命名パターンを確認する
2. P45対策として、IPCハンドラーの引数名が実際の値のセマンティクスと一致しているか確認する
3. boolean変数に `is`/`has`/`can`/`should` プレフィックスが使われているか確認する
4. `packages/shared/src/types/skill-schedule.ts` の型名とプロパティ名がプロジェクト全体の命名規則に準拠しているか確認する
5. 全テストがパスすることを確認する

**命名規則チェックリスト**:

| チェック項目         | 基準                                                                |
| -------------------- | ------------------------------------------------------------------- |
| 型名                 | PascalCase（例: `SkillSchedule`, `ScheduleType`, `ScheduleConfig`） |
| 関数名               | camelCase（例: `addSchedule`, `toggleSchedule`）                    |
| 定数名               | UPPER_SNAKE_CASE（例: `SKILL_SCHEDULE_LIST`, `SKILL_SCHEDULE_ADD`） |
| boolean変数          | `is`/`has`/`can`/`should` プレフィックス（例: `isActive`）          |
| 引数名セマンティクス | 実際の値と一致（P45対策: scheduleId/skillName等の乖離なし）         |

**対象ファイル**:

| ファイル                                                 | 確認内容           |
| -------------------------------------------------------- | ------------------ |
| `apps/desktop/src/main/services/skill/SkillScheduler.ts` | サービス層命名     |
| `apps/desktop/src/main/services/skill/ScheduleStore.ts`  | ストア層命名       |
| `apps/desktop/src/main/ipc/skillHandlers.ts`             | IPCハンドラー命名  |
| `packages/shared/src/types/skill-schedule.ts`            | 型定義命名         |
| `apps/desktop/src/preload/skill-api.ts`                  | Preload API命名    |
| `apps/desktop/src/preload/types.ts`                      | 型定義命名         |
| `apps/desktop/src/preload/channels.ts`                   | チャンネル定数命名 |

**確認コマンド**:

```bash
# P45対策: 引数名の一致確認
grep -rn "scheduleId\|skillName" apps/desktop/src/main/services/skill/SkillScheduler.ts apps/desktop/src/main/services/skill/ScheduleStore.ts apps/desktop/src/main/ipc/skillHandlers.ts
```

**期待される成果物**:

- `outputs/phase-8/naming-type-unification.md`

---

## 参照資料

| 参照資料                 | パス                                                             | 内容                   |
| ------------------------ | ---------------------------------------------------------------- | ---------------------- |
| SkillScheduler           | `apps/desktop/src/main/services/skill/SkillScheduler.ts`         | スケジューラ実装       |
| ScheduleStore            | `apps/desktop/src/main/services/skill/ScheduleStore.ts`          | 永続化実装             |
| IPCハンドラー            | `apps/desktop/src/main/ipc/skillHandlers.ts`                     | Main Processハンドラー |
| スケジュール型定義       | `packages/shared/src/types/skill-schedule.ts`                    | 共有型定義             |
| Preload API              | `apps/desktop/src/preload/skill-api.ts`                          | Preload API実装        |
| Preload型定義            | `apps/desktop/src/preload/types.ts`                              | 型定義                 |
| チャンネル定数           | `apps/desktop/src/preload/channels.ts`                           | チャンネル定義         |
| テストファイル           | `apps/desktop/src/main/services/skill/__tests__/SkillScheduler*` | スケジューラテスト     |
| テストファイル           | `apps/desktop/src/main/services/skill/__tests__/ScheduleStore*`  | ストアテスト           |
| Phase 1 要件成果物       | `outputs/phase-1/`                                               | 要件・受入基準         |
| Phase 2 設計成果物       | `outputs/phase-2/`                                               | 設計仕様               |
| Phase 5 実装成果物       | `outputs/phase-5/`                                               | 実装サマリー           |
| Phase 6 テスト拡充成果物 | `outputs/phase-6/`                                               | 追加テスト結果         |
| Phase 7 カバレッジ成果物 | `outputs/phase-7/`                                               | カバレッジ判定結果     |

### システム仕様（aiworkflow-requirements）

| 参照資料           | パス                                                                          | 内容             |
| ------------------ | ----------------------------------------------------------------------------- | ---------------- |
| IPC仕様            | `.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md`          | IPC チャンネル   |
| サービス設計       | `.claude/skills/aiworkflow-requirements/references/arch-electron-services.md` | Electronサービス |
| セキュリティ原則   | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`  | IPC セキュリティ |
| エラーハンドリング | `.claude/skills/aiworkflow-requirements/references/error-handling.md`         | エラーカテゴリ   |

---

## 成果物

| 成果物                       | パス                                                       | 内容                           |
| ---------------------------- | ---------------------------------------------------------- | ------------------------------ |
| SkillSchedulerリファクタ分析 | `outputs/phase-8/skillscheduler-refactoring-analysis.md`   | スケジューラ重複分析・抽出結果 |
| ScheduleStoreバリデーション  | `outputs/phase-8/schedulestore-validation-extraction.md`   | バリデーション共通化結果       |
| IPCバリデーション共通化      | `outputs/phase-8/ipc-schedule-validation-commonization.md` | 3段バリデーション共通化結果    |
| 命名・型定義統一             | `outputs/phase-8/naming-type-unification.md`               | 命名規則・型統一確認結果       |

---

## 統合テスト連携

> リファクタ後の統合テスト継続成功を確認する

| 確認項目                   | 基準                                 |
| -------------------------- | ------------------------------------ |
| 全ユニットテスト           | 100% パス                            |
| SkillSchedulerテスト       | スケジュール登録・実行テスト全件PASS |
| ScheduleStoreテスト        | 永続化・読み込みテスト全件PASS       |
| IPCハンドラーテスト（5件） | 全テストケースPASS                   |
| スケジュール型テスト       | 型定義テスト全件PASS                 |
| セキュリティテスト         | sender検証・バリデーションPASS       |
| カバレッジ維持             | リファクタ前と同等以上               |

---

## TDD検証

### TDD サイクル確認

```bash
# リファクタリング中は継続的にテスト実行
cd apps/desktop && pnpm vitest run src/main/services/skill/__tests__/SkillScheduler --watch
cd apps/desktop && pnpm vitest run src/main/services/skill/__tests__/ScheduleStore --watch
```

**確認項目**:

- [ ] リファクタリング後もSkillSchedulerテストが全て成功する
- [ ] リファクタリング後もScheduleStoreテストが全て成功する
- [ ] リファクタリング後もIPCハンドラーテスト（スケジュール関連5件）が全て成功する
- [ ] リファクタリング後も型定義テストが全て成功する

---

## 完了条件

- [ ] SkillSchedulerの重複コード分析と抽出判断（実施または見送り理由記録）が完了している
- [ ] ScheduleStoreのバリデーションロジック共通化判断が完了している
- [ ] IPCハンドラーの3段バリデーション共通化判断が完了している
- [ ] 命名規則・型定義が全ファイルで統一されている（P45対策: skillName統一を含む）
- [ ] 全てのテストがパスしている
- [ ] カバレッジがリファクタ前と同等以上である

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスク（4タスク）を100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物（4ファイル）が全て生成されていることを確認
- [ ] テストが継続してGreen状態であることを確認

---

## 依存関係

- **前提**: Phase 7 が完了していること
- **後続**: Phase 9（品質保証）へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/completed-tasks/TASK-9G-skill-schedule/phase-9-quality-assurance.md`
