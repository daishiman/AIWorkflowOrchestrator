# Phase 6: テスト拡充 — TASK-9G スキルスケジュール実行機能

## メタ情報

| 項目       | 値                                               |
| ---------- | ------------------------------------------------ |
| Phase      | 6                                                |
| 機能名     | TASK-9G-skill-schedule                           |
| 作成日     | 2026-02-27                                       |
| 前提Phase  | Phase 5（実装・Green状態確認）                   |
| 依存タスク | TASK-9B（SkillService / SkillExecutor 実装済み） |

## 目的

Phase 5 の実装に対して、カバレッジ基準（Line 80%+, Branch 60%+, Function 80%+）を満たすために**不足しているテストを追加**する。境界値・エッジケース・並行実行・イベントトリガーのテストにより、実装の堅牢性を検証する。

## カバレッジ基準

| 指標              | 最低基準 | 推奨基準 | 対象ファイル                                             |
| ----------------- | -------- | -------- | -------------------------------------------------------- |
| Line Coverage     | 80%      | 90%      | `apps/desktop/src/main/services/skill/SkillScheduler.ts` |
| Branch Coverage   | 60%      | 70%      | `apps/desktop/src/main/services/skill/ScheduleStore.ts`  |
| Function Coverage | 80%      | 90%      | `apps/desktop/src/main/ipc/skillHandlers.ts`             |

## 実行タスク

- Task 1: ScheduleStore の境界値テストを追加する
- Task 2: SkillScheduler の境界値・エッジケーステストを追加する
- Task 3: IPCハンドラーの境界値テストを追加する
- Task 4: セキュリティテストを追加する

### Task 1: ScheduleStore 境界値テスト追加

**対象ファイル**: `apps/desktop/src/main/services/skill/__tests__/ScheduleStore.test.ts`（既存ファイルに追加）

#### 1.1 テストケース一覧

| No    | テスト項目                                                          | 期待結果                                            |
| ----- | ------------------------------------------------------------------- | --------------------------------------------------- |
| DB-01 | 複数スケジュール（10件）追加後に全件取得できる                      | `getAll().length === 10`                            |
| DB-02 | 同一スキルに複数スケジュールを登録できる                            | 同じ skillName で2件追加後に `getAll()` が2件を含む |
| DB-03 | update で enabled 以外のフィールド（prompt）も変更できる            | update 後に prompt が新しい値に変更されている       |
| DB-04 | addRunResult で completedAt / output フィールドが保存される         | 追加した結果の全フィールドが復元される              |
| DB-05 | 保存データの各要素が不正（id フィールド欠損）な場合にフィルタされる | 不正要素がフィルタされ、正常要素のみ復元される      |

### Task 2: SkillScheduler 境界値・エッジケーステスト追加

**対象ファイル**: `apps/desktop/src/main/services/skill/__tests__/SkillScheduler.test.ts`（既存ファイルに追加）

#### 2.1 テストケース一覧（タイマー関連 — P13対策: advanceTimersByTime 使用）

| No    | テスト項目                                              | 期待結果                                                       |
| ----- | ------------------------------------------------------- | -------------------------------------------------------------- |
| SB-01 | interval スケジュールが指定間隔ごとに繰り返し実行される | `vi.advanceTimersByTime(interval * 3)` 後に3回実行される       |
| SB-02 | once スケジュールが実行後に再実行されない               | `vi.advanceTimersByTime(delay * 2)` 後に1回だけ実行される      |
| SB-03 | disableSchedule 後に interval タイマーが実行されない    | disable 後の `vi.advanceTimersByTime(interval)` で実行されない |
| SB-04 | deleteSchedule 後にタイマーが実行されない               | delete 後の `vi.advanceTimersByTime(interval)` で実行されない  |

#### 2.2 テストケース一覧（並行実行）

| No    | テスト項目                                                                 | 期待結果                                           |
| ----- | -------------------------------------------------------------------------- | -------------------------------------------------- |
| SB-05 | 同一スキルの複数スケジュールが同時に動作する                               | 2つの interval スケジュールが独立して実行される    |
| SB-06 | スケジュール実行中に deleteSchedule しても実行中のタスクはクラッシュしない | 既に開始した実行が正常完了し、次回実行が発生しない |

#### 2.3 テストケース一覧（エラーリカバリ）

| No    | テスト項目                                                                   | 期待結果                                                            |
| ----- | ---------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| SB-07 | SkillExecutor.execute が例外をスローしてもスケジューラは停止しない           | エラーが runHistory に記録され、次回実行が正常にスケジュールされる  |
| SB-08 | SkillExecutor.execute がタイムアウト（30秒超）しても runHistory に記録される | completedAt が記録され、success: false でエラーメッセージが含まれる |

#### 2.4 テストケース一覧（イベントトリガー）

| No    | テスト項目                                                      | 期待結果                                                        |
| ----- | --------------------------------------------------------------- | --------------------------------------------------------------- |
| SB-09 | event: "app_start" のスケジュールが initialize 時に実行される   | `executeScheduledSkill` が initialize 完了後に呼ばれる          |
| SB-10 | event: "file_change" のスケジュールがファイル変更時に実行される | ファイル変更イベント発火後に `executeScheduledSkill` が呼ばれる |
| SB-11 | event: "git_commit" のスケジュールが git commit 時に実行される  | git commit イベント発火後に `executeScheduledSkill` が呼ばれる  |
| SB-12 | 無効化されたイベントスケジュールはイベント発火時に実行されない  | disable 後のイベント発火で `executeScheduledSkill` が呼ばれない |

### Task 3: IPCハンドラー境界値テスト追加

**対象ファイル**: `apps/desktop/src/main/ipc/__tests__/skillScheduleHandlers.test.ts`（既存ファイルに追加）

#### 3.1 テストケース一覧

| No    | チャンネル              | テスト項目                                              | 期待結果                                                                                                 |
| ----- | ----------------------- | ------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| HB-01 | `skill:schedule:add`    | prompt がスペースのみ `"   "`                           | `{ success: false, error: "prompt must be a non-empty string" }`                                         |
| HB-02 | `skill:schedule:add`    | schedule.type が null                                   | `{ success: false, error: "schedule.type must be one of: ..." }`                                         |
| HB-03 | `skill:schedule:add`    | type: "cron" で cronExpression がスペースのみ           | `{ success: false, error: "cronExpression is required for cron schedule" }`                              |
| HB-04 | `skill:schedule:add`    | type: "interval" で interval が文字列                   | `{ success: false, error: "interval must be a positive number" }`                                        |
| HB-05 | `skill:schedule:add`    | type: "interval" で interval が Number.MAX_SAFE_INTEGER | 正常に登録される（極端に大きい値だが有効）                                                               |
| HB-06 | `skill:schedule:add`    | type: "once" で runAt が不正な日時文字列                | `{ success: false, error: "runAt must be a valid ISO 8601 date string" }`                                |
| HB-07 | `skill:schedule:add`    | type: "event" で event が未指定                         | `{ success: false, error: "event is required for event schedule" }`                                      |
| HB-08 | `skill:schedule:add`    | type: "event" で event が不正な値（`"unknown_event"`）  | `{ success: false, error: "event must be one of: app_start, file_change, git_commit" }`                  |
| HB-09 | `skill:schedule:add`    | notification が未指定の場合にデフォルト値が適用される   | notification のデフォルト値（onSuccess: false, onFailure: true, notificationType: "system"）が設定される |
| HB-10 | `skill:schedule:update` | updates が空オブジェクト `{}`                           | 正常に完了する（変更なし）                                                                               |
| HB-11 | `skill:schedule:delete` | id がスペースのみ `"  "`                                | `{ success: false, error: "id must be a non-empty string" }`                                             |

### Task 4: セキュリティテスト追加

**対象ファイル**: `apps/desktop/src/main/ipc/__tests__/skillScheduleHandlers.test.ts`（既存ファイルに追加）

#### 4.1 テストケース一覧

| No    | テスト項目                                           | 期待結果                                                         |
| ----- | ---------------------------------------------------- | ---------------------------------------------------------------- |
| HS-01 | 全5ハンドラーで mainWindow が destroyed 後に呼び出し | validateIpcSender が `{ valid: false }` を返し、例外が送出される |
| HS-02 | 予期しない Error のスタックトレースが漏洩しない      | レスポンスの `error` にスタックトレースが含まれない              |
| HS-03 | 予期しない Error のファイルパス情報が漏洩しない      | レスポンスの `error` に絶対パスが含まれない                      |

---

## 実行手順

### Step 1: 現在のカバレッジ計測

```bash
cd apps/desktop && pnpm vitest run src/main/services/skill/__tests__/SkillScheduler src/main/services/skill/__tests__/ScheduleStore src/main/ipc/__tests__/skillScheduleHandlers --coverage
```

カバレッジレポートを確認し、不足箇所を特定する。

### Step 2: テスト追加

Task 1-4 のテストケースのうち、カバレッジ向上に寄与するものから優先的に追加する。

### Step 3: カバレッジ再計測

テスト追加後に再度カバレッジを計測し、基準を満たしているか確認する。

```bash
cd apps/desktop && pnpm vitest run src/main/services/skill/__tests__/SkillScheduler src/main/services/skill/__tests__/ScheduleStore src/main/ipc/__tests__/skillScheduleHandlers --coverage
```

### Step 4: 基準未達の場合

カバレッジ基準を満たさない場合は、レポートの未カバー行・分岐を確認し、追加テストを作成する。

---

## 参照資料

| 資料                                                                        | 用途                         |
| --------------------------------------------------------------------------- | ---------------------------- |
| Phase 4 成果物（phase-4-test-creation.md）                                  | 既存テスト仕様               |
| Phase 5 成果物（phase-5-implementation.md）                                 | 実装コード                   |
| `apps/desktop/src/main/ipc/__tests__/skillFileHandlers.test.ts`             | エッジケーステストパターン   |
| `.claude/rules/02-code-quality.md`                                          | カバレッジ基準定義           |
| `.claude/skills/aiworkflow-requirements/references/quality-requirements.md` | 品質要件の正本               |
| `.claude/rules/06-known-pitfalls.md#P13`                                    | タイマーテスト無限ループ防止 |

## 統合テスト連携

| 連携先                    | 内容                                                                     |
| ------------------------- | ------------------------------------------------------------------------ |
| Phase 5（実装）           | 実装済みサービスに対する境界値・エッジケース・並行実行シナリオを追加する |
| Phase 7（カバレッジ確認） | 拡充後テストを用いて coverage gate 判定を実施する                        |

## 成果物

| 成果物                                                                  | 説明                                         |
| ----------------------------------------------------------------------- | -------------------------------------------- |
| `apps/desktop/src/main/services/skill/__tests__/ScheduleStore.test.ts`  | 境界値テスト追加（5テスト）                  |
| `apps/desktop/src/main/services/skill/__tests__/SkillScheduler.test.ts` | 境界値・並行・イベントテスト追加（12テスト） |
| `apps/desktop/src/main/ipc/__tests__/skillScheduleHandlers.test.ts`     | 境界値・セキュリティテスト追加（14テスト）   |

## 完了条件

- [ ] Task 1-4 の全テストケース（31テスト）が追加されている
- [ ] 追加した全テストが Green 状態（成功）である
- [ ] タイマーテストで `vi.advanceTimersByTime()` を使用している（P13対策: `runAllTimers` 不使用）
- [ ] カバレッジ計測コマンドが実行可能である
- [ ] 既存テスト（Phase 4 の76テスト）が引き続き全てPASSしている

## 次のPhase

Phase 7（カバレッジ確認）へ進む。カバレッジ基準の充足を最終確認する。
