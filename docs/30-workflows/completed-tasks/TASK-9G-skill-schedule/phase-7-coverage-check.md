# Phase 7: テストカバレッジ確認 — TASK-9G スキルスケジュール実行機能

## メタ情報

| 項目       | 値                                               |
| ---------- | ------------------------------------------------ |
| Phase      | 7                                                |
| 機能名     | TASK-9G-skill-schedule                           |
| 作成日     | 2026-02-27                                       |
| 前提Phase  | Phase 6（テスト拡充）                            |
| 依存タスク | TASK-9B（SkillService / SkillExecutor 実装済み） |

## 目的

Phase 5 で実装し Phase 6 でテストを拡充したスキルスケジュール機能のカバレッジが基準を満たしているか**最終確認**する。未達の場合は Phase 6 に戻る。

## カバレッジ基準

| 指標              | 最低基準 | 推奨基準 |
| ----------------- | -------- | -------- |
| Line Coverage     | 80%      | 90%      |
| Branch Coverage   | 60%      | 70%      |
| Function Coverage | 80%      | 90%      |

## 実行タスク

### Task 1: カバレッジ計測

以下のコマンドを実行し、カバレッジレポートを取得する:

```bash
cd apps/desktop && pnpm vitest run src/main/services/skill/__tests__/SkillScheduler src/main/services/skill/__tests__/ScheduleStore src/main/ipc/__tests__/skillScheduleHandlers --coverage --reporter=verbose
```

**計測対象ファイル**:

| ファイル                                                 | 説明                 |
| -------------------------------------------------------- | -------------------- |
| `apps/desktop/src/main/services/skill/SkillScheduler.ts` | スケジューラサービス |
| `apps/desktop/src/main/services/skill/ScheduleStore.ts`  | スケジュール永続化   |
| `apps/desktop/src/main/ipc/skillHandlers.ts`             | IPCハンドラー        |

**注意**: テストファイル自体はカバレッジ計測対象外。型定義ファイル（`skill-schedule.ts`）もロジックを含まないため計測対象外。

### Task 2: ゲート判定

#### 2.1 判定テーブル

| 条件                         | 判定  | 対応                                       |
| ---------------------------- | ----- | ------------------------------------------ |
| 全3指標が最低基準を満たす    | PASS  | Phase 8 へ進む                             |
| 全3指標が推奨基準を満たす    | PASS+ | Phase 8 へ進む（高品質）                   |
| いずれかの指標が最低基準未満 | FAIL  | Phase 6 へ戻り、未カバー箇所のテストを追加 |

#### 2.2 FAIL 時の対応手順

1. カバレッジレポートの `Uncovered Lines` / `Uncovered Branches` を確認する
2. 未カバー箇所を特定し、以下の優先順位でテストを追加する:
   - **Branch Coverage 不足**: 条件分岐のうち未通過パスをテスト（if/else の片方のみカバーされていないケース）
   - **Line Coverage 不足**: 未実行行を特定し、その行を通過するテストを追加
   - **Function Coverage 不足**: 未呼出関数を確認し、呼び出すテストを追加（P41対策: インライン arrow function にも注意）
3. テスト追加後、Task 1 を再実行する
4. 基準を満たすまで Step 2-3 を繰り返す

#### 2.3 FAIL 時の典型的な未カバーパターン

| パターン                                                           | テスト追加方法                                                                  |
| ------------------------------------------------------------------ | ------------------------------------------------------------------------------- |
| `calculateNextRun` の type 別分岐                                  | 各 type（cron/interval/once/event）で個別にテスト追加                           |
| `activateSchedule` のイベントリスナー分岐                          | event: "app_start"/"file_change"/"git_commit" それぞれでテスト追加              |
| `executeScheduledSkill` のエラーハンドリング分岐                   | `skillExecutor.execute` が reject するケースをモック                            |
| `deactivateSchedule` のジョブタイプ別分岐（cron/interval/timeout） | 各タイプのスケジュールを追加→削除して deactivate パスを通過                     |
| IPCハンドラーの `schedule.type` 別バリデーション分岐               | 各 type で必須フィールドが欠損しているケースをテスト                            |
| `validateIpcSender` の `getAllowedWindows` コールバック（P41対策） | `validateIpcSender.mock.calls[i][2].getAllowedWindows()` で明示的に呼び出し確認 |
| `once` スケジュールの runAt が過去の場合の分岐                     | 過去日時の runAt を指定してスケジュール追加をテスト                             |

### Task 3: カバレッジレポート記録

カバレッジ計測結果を以下の形式で記録する:

```markdown
## カバレッジ結果（YYYY-MM-DD）

| ファイル          | Line  | Branch | Function | 判定      |
| ----------------- | ----- | ------ | -------- | --------- |
| SkillScheduler.ts | XX.X% | XX.X%  | XX.X%    | PASS/FAIL |
| ScheduleStore.ts  | XX.X% | XX.X%  | XX.X%    | PASS/FAIL |
| skillHandlers.ts  | XX.X% | XX.X%  | XX.X%    | PASS/FAIL |
```

---

## 参照資料

| 資料                                                                        | 用途                                  |
| --------------------------------------------------------------------------- | ------------------------------------- |
| Phase 5 成果物（phase-5-implementation.md）                                 | 計測対象コードの実装基準              |
| Phase 6 成果物（phase-6-test-expansion.md）                                 | 拡充テストの計測対象                  |
| `.claude/rules/02-code-quality.md`                                          | カバレッジ基準定義                    |
| `.claude/skills/aiworkflow-requirements/references/quality-requirements.md` | 品質要件の正本                        |
| `.claude/rules/06-known-pitfalls.md#P41`                                    | v8 カバレッジのインライン関数カウント |

## 統合テスト連携

| 連携先                      | 内容                                                      |
| --------------------------- | --------------------------------------------------------- |
| Phase 6（テスト拡充）       | 追加テストを含めた全107テストをカバレッジ計測の入力とする |
| Phase 8（リファクタリング） | PASS/PASS+ 判定後に安全に構造改善へ進む                   |

## 成果物

| 成果物             | 説明                          |
| ------------------ | ----------------------------- |
| カバレッジレポート | 各指標の数値と PASS/FAIL 判定 |

## 完了条件

- [ ] カバレッジ計測が実行されている
- [ ] `SkillScheduler.ts` の Line Coverage が 80% 以上である
- [ ] `SkillScheduler.ts` の Branch Coverage が 60% 以上である
- [ ] `SkillScheduler.ts` の Function Coverage が 80% 以上である
- [ ] `ScheduleStore.ts` の Line Coverage が 80% 以上である
- [ ] `ScheduleStore.ts` の Branch Coverage が 60% 以上である
- [ ] `ScheduleStore.ts` の Function Coverage が 80% 以上である
- [ ] `skillHandlers.ts` の Line Coverage が 80% 以上である
- [ ] `skillHandlers.ts` の Branch Coverage が 60% 以上である
- [ ] `skillHandlers.ts` の Function Coverage が 80% 以上である
- [ ] 全テスト（107テスト: Phase 4の76 + Phase 6の31）が PASS している
- [ ] カバレッジ結果が記録されている

## 次のPhase

- **PASS の場合**: Phase 8（リファクタリング）へ進む
- **FAIL の場合**: Phase 6（テスト拡充）へ戻り、未カバー箇所のテストを追加する
