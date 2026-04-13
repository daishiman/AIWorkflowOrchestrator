# Phase 7: テストカバレッジ確認 - タスク仕様書

## メタ情報

| 項目       | 値                                 |
| ---------- | ---------------------------------- |
| Phase      | 7                                  |
| タスクID   | TASK-UI-SCHEDULE-CRON-SEMANTIC-001 |
| 機能名     | 意味論的 cron バリデーション追加   |
| タスク種別 | implementation                     |
| 前Phase    | Phase 6: Green 確認                |
| 次Phase    | Phase 8: リファクタリング          |
| ステータス | 未実施                             |
| 作成日     | 2026-04-12                         |

---

## 目的

Phase 5 で追加した意味論的バリデーションロジックのカバレッジを確認し、実装行が適切にテストされているかを検証する。

**重要**: カバレッジ目標は `scheduleConfigValidator.ts` の変更部分のみを対象とする。全体一律指定（例: `--coverage.all`）は行わない。

---

## 実行タスク

### タスク1: カバレッジ計測コマンドの実行計画

以下のコマンドで対象ファイルのカバレッジを計測する:

```bash
pnpm vitest run --coverage --coverage.include="apps/desktop/src/renderer/utils/scheduleConfigValidator.ts" \
  apps/desktop/src/__tests__/utils/scheduleConfigValidator.test.ts \
  apps/desktop/src/__tests__/utils/scheduleConfigValidator.edge.test.ts
```

計測結果は `outputs/phase-7/coverage-report.md` に記録する。

### タスク2: カバレッジ目標の定義

| 対象                                          | Line coverage | Branch coverage |
| --------------------------------------------- | ------------- | --------------- |
| `validateCronExpression`（変更部分）          | ≥ 90%         | ≥ 85%           |
| `options.semantic` 分岐（true 時）            | 100%          | 100%            |
| `options.semantic` 分岐（false/undefined 時） | 100%          | 100%            |

**確認観点**:

- `options?.semantic === true` の分岐（true / false/undefined の両方）がテストされているか
- `cron-parser` が例外を投げるケース（不正な日付）がカバーされているか
- `cron-parser` が正常終了するケース（到達可能な cron）がカバーされているか
- 構文チェックのみのパス（semantic 未指定時）がカバーされているか

### タスク3: カバレッジ不足時の追加テスト方針

カバレッジ目標を下回る場合は以下の方針で追加テストを作成する:

| 不足パターン                         | 対応方針                                                              |
| ------------------------------------ | --------------------------------------------------------------------- |
| semantic=true かつ正常ケース未カバー | `"0 0 * * *"`, `"0 12 1 1 *"` 等の正常ケースを `edge.test.ts` に追加  |
| semantic=true かつ異常ケース未カバー | `"0 0 31 2 *"`, `"0 0 30 2 *"` 等の不正ケースを `edge.test.ts` に追加 |
| semantic 未指定の分岐未カバー        | `options` 未指定呼び出しを `test.ts` に追加（既存 SCV-11 と整合確認） |
| try-catch の catch 節未カバー        | `cron-parser` が例外を投げるケースを `edge.test.ts` に追加            |

---

## 参照資料

| 資料名                              | パス                                                                    | 説明                           |
| ----------------------------------- | ----------------------------------------------------------------------- | ------------------------------ |
| Phase 5 実装                        | `outputs/phase-5/implementation-plan.md`                                | 意味論的バリデーション実装内容 |
| Phase 6 Green 確認結果              | `outputs/phase-6/expanded-test-cases.md`                                | テスト GREEN 確認済みケース    |
| scheduleConfigValidator 実装        | `apps/desktop/src/renderer/utils/scheduleConfigValidator.ts`            | カバレッジ計測対象ファイル     |
| scheduleConfigValidator テスト      | `apps/desktop/src/__tests__/utils/scheduleConfigValidator.test.ts`      | 既存テスト SCV-01〜SCV-12      |
| scheduleConfigValidator edge テスト | `apps/desktop/src/__tests__/utils/scheduleConfigValidator.edge.test.ts` | 追加テスト（Phase 4 で作成）   |
| Phase 1 受け入れ基準                | `outputs/phase-1/acceptance-criteria.md`                                | AC-4: カバレッジ向上の基準     |

---

## 成果物

| 成果物             | 配置先                               | 形式     |
| ------------------ | ------------------------------------ | -------- |
| カバレッジレポート | `outputs/phase-7/coverage-report.md` | Markdown |

**`outputs/phase-7/coverage-report.md` に含める内容**:

- カバレッジ計測コマンドと実行日時
- `scheduleConfigValidator.ts` の変更部分の Line/Branch カバレッジ数値
- `options.semantic` 分岐（true / false/undefined）それぞれのカバレッジ
- 目標値との比較（達成 / 未達）
- カバレッジ不足が存在した場合は追加テスト内容と再計測結果

---

## 統合テスト連携

- Phase 4 で作成した TC-01〜TC-08 の期待値（TC-01 はエラー、TC-02〜TC-08 は PASS）が満たされていることを前提とする（Phase 6 確認済み）
- Phase 8 リファクタリングへのインプット: カバレッジが 90%/85% を下回る行・分岐を記録し、Phase 8 でのコード整理時に影響がないか確認する
- AC-4（追加テストケースでカバレッジが向上している）の充足を本 Phase で確定する
- NON_VISUAL 評価（Phase 11）：バリデーターロジックのみの変更のため、スクリーンショット不要・カバレッジ数値確認のみ

---

## 完了条件チェックリスト

- [ ] カバレッジ計測コマンドが実行されていること
- [ ] `validateCronExpression` 変更部分の Line coverage が ≥ 90% であること
- [ ] `validateCronExpression` 変更部分の Branch coverage が ≥ 85% であること
- [ ] `options.semantic` 分岐（true 時）が 100% カバーされていること
- [ ] `options.semantic` 分岐（false/undefined 時）が 100% カバーされていること
- [ ] カバレッジ不足がある場合は追加テストを作成し、再計測で目標値を達成していること
- [ ] AC-4（カバレッジ向上）の充足が確認されていること
- [ ] `outputs/phase-7/coverage-report.md` にカバレッジ結果が記録されていること

---

## Phase 末端アクション【必須】

Phase 7 完了時に以下を実行すること:

1. `outputs/phase-7/coverage-report.md` に計測結果と目標値との比較を記録する
2. カバレッジ目標に未達の場合は追加テストを作成し、再計測で目標値を達成してから Phase 8 へ進む
3. AC-4 の充足状況を明示的に記録する（「AC-4 PASS: カバレッジ X% / 目標 90%」等）
4. 全完了条件チェックリストを確認し、未完了項目がある場合は完了させてから Phase 8 へ進む

---

## 依存関係

| 依存Phase/タスク | 依存内容                                               |
| ---------------- | ------------------------------------------------------ |
| Phase 5 完了     | 意味論的バリデーションロジックの実装が完了していること |
| Phase 6 完了     | 全テスト GREEN 確認が完了していること                  |

---

## Phase 実行記録テンプレート

```markdown
## Phase 7 実行記録

- 実行日時: YYYY-MM-DD HH:mm
- 実行者: -
- カバレッジ計測コマンド実行: [ ] YES / [ ] NO
- validateCronExpression 変更部分:
  - Line coverage: X% （目標 ≥ 90%）: [ ] PASS / [ ] FAIL
  - Branch coverage: X% （目標 ≥ 85%）: [ ] PASS / [ ] FAIL
- options.semantic 分岐（true 時）: X% （目標 100%）: [ ] PASS / [ ] FAIL
- options.semantic 分岐（false/undefined 時）: X% （目標 100%）: [ ] PASS / [ ] FAIL
- カバレッジ不足への対応: [ ] 追加テスト作成・再計測済み / [ ] 不要（目標達成）
- AC-4 充足状況: [ ] PASS / [ ] FAIL
- 完了条件充足状況: X / 8 項目完了
- Phase 8 移行判定: [ ] PASS（Phase 8 へ進む）/ [ ] HOLD（カバレッジ不足・再計測中）
```

---

## 次のPhase案内

**Phase 8: リファクタリング** — Phase 5 の実装を clean code の観点でレビューし、重複・命名ドリフト・過剰な複雑さを取り除く。インターフェースは変更しない。カバレッジ目標を達成した状態でリファクタリングを実施し、リファクタリング後も同水準のカバレッジを維持することを確認する。
