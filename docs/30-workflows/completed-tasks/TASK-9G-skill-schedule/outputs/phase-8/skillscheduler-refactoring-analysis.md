# Phase 8 SkillScheduler リファクタリング分析

## 分析対象

- `apps/desktop/src/main/services/skill/SkillScheduler.ts`（411行）

## 分析日時

2026-02-27（Phase 8-9 統合検証時に再分析）

## コード品質分析

### 重複コードの有無

| 観点                             | 判定   | 根拠                                                                                        |
| -------------------------------- | ------ | ------------------------------------------------------------------------------------------- |
| スケジュール起動ロジック重複     | なし   | cron/interval/once/event の各起動処理は方式固有で完全に異なるロジック                       |
| activate/deactivate 重複         | なし   | activate は方式別開始、deactivate は方式別停止で責務が明確に分離                            |
| タイマーリソース管理パターン統一 | 適合   | activeJobs Map で cron/interval/timeout を統一管理                                          |
| エラーハンドリングパターン       | 改善済 | executeScheduledSkill の成功/失敗で ScheduledRunResult 構築が `buildRunResult` に共通化済み |
| 型安全性                         | 改善済 | addSchedule の `as ScheduledSkill` キャストを明示的プロパティ展開に修正済み                 |
| 単一責務                         | 適合   | スケジュール実行制御に責務が集中                                                            |
| 依存分離                         | 適合   | `SchedulerSkillExecutor` インターフェースで DI 実装                                         |
| テスタビリティ                   | 適合   | `scheduleStore` / `skillExecutor` がモック可能                                              |

### 実施済みリファクタリング

#### 1. executeScheduledSkill の ScheduledRunResult 構築共通化

`buildRunResult` プライベートメソッドに抽出済み（L383-396）。成功パスと失敗パスで同一のメソッドを使用し、`addRunResult` 呼び出しを try/catch の外に移動して重複を除去。

```typescript
private buildRunResult(
  runId: string,
  startedAt: string,
  outcome: { success: boolean; output?: string; error?: string },
): ScheduledRunResult {
  return {
    runId,
    startedAt,
    success: outcome.success,
    completedAt: new Date().toISOString(),
    output: outcome.output,
    error: outcome.error,
  };
}
```

#### 2. addSchedule の型安全性改善

input の各プロパティを明示的にスプレッドし、`as ScheduledSkill` キャストを除去済み（L107-119）。`nextRun` が `undefined` になるケースを `null` に統一。

### 追加分析：改善候補の検討

| 候補                                   | 判定   | 根拠                                                                                                                                                                |
| -------------------------------------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| タイマー管理クラスの分離               | 見送り | activeJobs の管理メソッドは3つ（activate, deactivate, has/count）で、独立クラスにすると過度な分離                                                                   |
| スケジュール方式の Strategy パターン化 | 見送り | cron/interval/once/event の各処理は10行以下で、Strategy パターンにすると抽象化コストがメリットを上回る                                                              |
| calculateNextRun の cron-parser 導入   | 検討可 | 現在は簡易実装（次の分を仮の次回実行とする）。cron-parser で正確な次回計算が可能だが、TASK-9G のスコープ外                                                          |
| deactivateSchedule の型キャスト除去    | 検討可 | L255-262 で `job.ref as ScheduledTask` 等のキャストが残存。ActiveJob 型の判別型を使えば除去可能だが、既に `job.type` で分岐しておりランタイム安全性は確保されている |

### コードメトリクス

| 指標                     | 値                                       |
| ------------------------ | ---------------------------------------- |
| 総行数                   | 411行                                    |
| パブリックメソッド       | 8個                                      |
| プライベートメソッド     | 5個                                      |
| クラス外インターフェース | 2個（SchedulerSkillExecutor, ActiveJob） |
| 外部依存                 | 2個（node-cron, crypto）                 |

## テスト結果

- SkillScheduler テスト: 27/28 PASS、1 FAIL
- 失敗テスト: `hasActiveJob() はジョブの存在確認を返す`
  - 原因: テスト側のモック設定バグ。`mockScheduleStore.add` のモックが `createBaseSchedule({ id: "sched-001", ...input })` を返すが、`addSchedule` 内で構築された `schedule` オブジェクト（`randomUUID()` の id を持つ）が `input` として渡されるため、`...input` のスプレッドが `id: "sched-001"` をランダム UUID で上書きする
  - 実装側の問題ではなく、テストヘルパー `createBaseSchedule` のスプレッド順序の問題
  - Phase 10 で修正対象として記録

## 結論

SkillScheduler の実装品質は高い。重複コードは Phase 5/8 で適切に共通化されており、型安全性も改善済み。残存する改善候補（cron-parser 導入、ActiveJob 判別型）は TASK-9G のスコープ外であり、未タスク化の検討対象とする。
