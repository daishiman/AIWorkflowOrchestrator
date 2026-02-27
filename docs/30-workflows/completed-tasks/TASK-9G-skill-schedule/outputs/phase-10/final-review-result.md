# Phase 10 最終レビュー結果

## メタ情報

| 項目          | 内容                                     |
| ------------- | ---------------------------------------- |
| レビュー日    | 2026-02-27                               |
| 対象タスク    | TASK-9G                                  |
| レビューPhase | 10（再実行）                             |
| レビュー担当  | Claude Code（自動レビュー + テスト実行） |

---

## 総合判定

**MINOR（未タスク仕様書変換後、Phase 11 へ進行可）**

---

## 8項目レビュー結果サマリー

| #   | レビュー観点       | 結果      | 指摘事項                                                                          | 重要度 |
| --- | ------------------ | --------- | --------------------------------------------------------------------------------- | ------ |
| 1   | 機能完全性         | OK        | 5チャンネル・4種スケジュール全実装済み                                            | -      |
| 2   | セキュリティ       | 指摘あり  | sanitizeErrorMessage未適用、destroy()未実装、上限チェック未実装                   | MINOR  |
| 3   | 型安全性           | 指摘あり  | `as` キャスト1箇所（updateSchedule、型推論補助目的）                              | MINOR  |
| 4   | テスト品質         | 指摘あり  | 60テスト中59 PASS / 1 FAIL（hasActiveJob テスト失敗）                             | MINOR  |
| 5   | コード品質         | OK        | Lint/型チェッククリア、命名規則準拠                                               | -      |
| 6   | エラーハンドリング | OK        | 全パスで `success/error` 形式。unknown は "Internal error" に正規化               | -      |
| 7   | IPC契約            | OK        | P44/P45対策完了、引数形式・セマンティクス一致                                     | -      |
| 8   | 外部依存リスク     | 指摘あり  | @types/node-cron メジャーバージョン不一致（初期化統合の記述差分はPhase 12で解消） | MINOR  |
| -   | **最終判定**       | **MINOR** | **7件の MINOR 指摘 + 1件のテスト失敗**                                            | -      |

---

## テスト実行結果（2026-02-27 再実行）

### desktop テスト（55テスト: 54 PASS / 1 FAIL）

| テストファイル                | テスト数 | PASS | FAIL | 結果 |
| ----------------------------- | -------- | ---- | ---- | ---- |
| ScheduleStore.test.ts         | 20       | 20   | 0    | PASS |
| SkillScheduler.test.ts        | 23       | 22   | 1    | FAIL |
| skillScheduleHandlers.test.ts | 12       | 12   | 0    | PASS |

### shared テスト（5テスト: 5 PASS）

| テストファイル         | テスト数 | PASS | FAIL | 結果 |
| ---------------------- | -------- | ---- | ---- | ---- |
| skill-schedule.test.ts | 5        | 5    | 0    | PASS |

### 合計: 60テスト中 59 PASS / 1 FAIL

### 失敗テスト詳細

| テスト名                                | ファイル               | 行番号 | エラー内容                  |
| --------------------------------------- | ---------------------- | ------ | --------------------------- |
| hasActiveJob() はジョブの存在確認を返す | SkillScheduler.test.ts | L988   | `expected false to be true` |

**原因分析**: `addSchedule()` で返される `result.id` が "sched-001"（モックの返却値）だが、実際に `activeJobs` Map に登録されるのは `addSchedule()` 内で生成される UUID。テストが `scheduler.hasActiveJob("sched-001")` で確認しているが、実際のジョブIDは `randomUUID()` で生成された別の値。モックの `add()` が返すオブジェクトの `id` と `activateSchedule()` に渡される `result.id` が異なるために不一致が発生している。

**推奨対応**: テスト側で `result.id` を使用して `hasActiveJob(result.id)` を呼び出すか、モックの返却値を `addSchedule()` の内部生成IDと一致させる。

---

## MINOR指摘一覧

| ID            | カテゴリ       | 指摘内容                                                            | 未タスク化 |
| ------------- | -------------- | ------------------------------------------------------------------- | :--------: |
| MINOR-SEC-01  | セキュリティ   | `SkillScheduler.destroy()` メソッドの未実装                         |    必要    |
| MINOR-SEC-02  | セキュリティ   | スケジュール最大登録数の上限チェック未実装                          |    必要    |
| MINOR-SEC-03  | セキュリティ   | `sanitizeErrorMessage` のスケジュールハンドラーへの未適用           |    必要    |
| MINOR-TYPE-02 | 型安全性       | `SkillScheduler.updateSchedule()` の `as ScheduledSkill` キャスト   |    必要    |
| MINOR-TEST-01 | テスト品質     | `hasActiveJob()` テストの失敗（モックIDと実IDの不一致）             |    必要    |
| MINOR-ARCH-01 | アーキテクチャ | 初期化統合パス記述の不一致（`main/index.ts` ↔ `main/ipc/index.ts`） |    不要    |
| MINOR-DEP-01  | 外部依存       | `@types/node-cron` v3 と `node-cron` v4 のメジャーバージョン不一致  |    必要    |

---

## 判定根拠

### PASS 条件を満たさない理由

- 7件の MINOR 指摘（うち MINOR-ARCH-01 は Phase 12 で解消済み）+ 1件のテスト失敗が存在する
- 05-task-execution.md 準拠により、MINOR 指摘は「機能影響なし」であっても未タスク仕様書への変換が省略不可

### MAJOR/CRITICAL ではない理由

- テスト失敗1件は機能ロジックの問題ではなく、テスト側のモック設定不備（MINOR-TEST-01）
- 全 MINOR 指摘は機能の正常動作に影響しない
- セキュリティ上の致命的な脆弱性は検出されない
  - `validateIpcSender` が全5チャンネルに適用済み
  - P42準拠3段バリデーションが全必須フィールドに適用済み
  - cron式インジェクション防止（`cron.validate()`）が実装済み
- IPC契約にドリフトがない（P44/P45対策完了）
- 型定義が全レイヤーで `@repo/shared` から一貫して参照されている

### 初期化統合パス差分について（Phase 12で解消）

- Phase 10 出力時点では `main/index.ts` を参照して未統合と判定していたが、実実装は `main/ipc/index.ts` で統合済みだった
- Phase 12 で `artifacts.json` と関連仕様書のパスを `main/ipc/index.ts` に統一し、MINOR-ARCH-01 は解消済み

---

## 次のアクション

1. **未タスク仕様書の作成** - 継続する MINOR 指摘を `unassigned-task/` に指示書として作成する
2. **task-workflow.md の残課題テーブルに登録** - 継続指摘を登録する
3. **関連仕様書に参照リンクを追加** - 3ステップ全完了で未タスク化
4. **Phase 11 へ進行** - 未タスク化完了後、手動テスト検証へ

---

## レビュー対象ファイル一覧

| ファイル             | パス                                                                    |
| -------------------- | ----------------------------------------------------------------------- |
| IPCハンドラー        | `apps/desktop/src/main/ipc/skillHandlers.ts` (L544-L784)                |
| スケジューラ         | `apps/desktop/src/main/services/skill/SkillScheduler.ts`                |
| ストア               | `apps/desktop/src/main/services/skill/ScheduleStore.ts`                 |
| Preload API          | `apps/desktop/src/preload/skill-api.ts` (L390-L417)                     |
| チャンネル定数       | `apps/desktop/src/preload/channels.ts` (L306-L311, L539-L544)           |
| 共有型定義           | `packages/shared/src/types/skill-schedule.ts`                           |
| 共有型エクスポート   | `packages/shared/src/types/index.ts` (L152)                             |
| ScheduleStoreテスト  | `apps/desktop/src/main/services/skill/__tests__/ScheduleStore.test.ts`  |
| SkillSchedulerテスト | `apps/desktop/src/main/services/skill/__tests__/SkillScheduler.test.ts` |
| IPCハンドラーテスト  | `apps/desktop/src/main/ipc/__tests__/skillScheduleHandlers.test.ts`     |
| 型定義テスト         | `packages/shared/src/types/__tests__/skill-schedule.test.ts`            |
