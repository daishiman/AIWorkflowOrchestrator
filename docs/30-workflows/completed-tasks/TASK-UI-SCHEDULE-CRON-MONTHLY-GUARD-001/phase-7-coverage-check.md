# Phase 7: テストカバレッジ確認

## メタ情報

| 項目       | 内容                                    |
| ---------- | --------------------------------------- |
| Phase      | 7                                       |
| Phase名    | テストカバレッジ確認                    |
| 前提Phase  | Phase 6（テスト拡充）                   |
| 後続Phase  | Phase 8                                 |
| ステータス | 未実施                                  |
| 作成日     | 2026-04-13                              |
| 機能名     | TASK-UI-SCHEDULE-CRON-MONTHLY-GUARD-001 |

---

## 目的

`cronConverter.ts` の `monthly` 分岐に追加したガード処理のテストカバレッジを計測し、
未到達パスがないことを確認する。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: カバレッジ計測

**目的**: ガード処理のコードパスがテストで網羅されていることを確認する

**実行手順**:

1. カバレッジ付きでテストを実行する:
   ```bash
   pnpm --filter @repo/desktop test --coverage
   ```
2. `cronConverter.ts` のカバレッジレポートを確認する
3. `monthly` 分岐の各パスがカバーされているか確認する:
   - 範囲外パス（`dayOfMonth < 1` または `dayOfMonth > 31`）
   - 非整数パス（`Number.isInteger(dayOfMonth)` が False となる `NaN` / 小数）
   - 正常パス（ガード条件が False となるケース）
   - 整数入力パス（`Number.isInteger(dayOfMonth)` が True となるケース）

**期待される成果物**:

- `outputs/phase-7/coverage-report.md`（カバレッジレポート）

---

### タスク2: 未到達パス分析

**目的**: カバレッジで到達していないパスを特定し、対応方針を決定する

**実行手順**:

1. カバレッジレポートで未到達行・分岐を特定する
2. 未到達箇所がある場合:
   - Phase 6 のテスト追加で対応できるか検討する
   - 対応不要な場合はその理由を記録する
3. 分析結果を記録する

**期待される成果物**:

- `outputs/phase-7/uncovered-analysis.md`（未到達パス分析書）

---

### タスク3: トレーサビリティ確認

**目的**: AC-1〜AC-6 が全てテストで検証されていることを確認する

**実行手順**:

1. 以下のトレーサビリティマトリクスを確認する:

   | AC番号 | テストケース | カバレッジ状態 |
   | ------ | ------------ | -------------- |
   | AC-1   | TC-11        | [確認]         |
   | AC-2   | TC-12        | [確認]         |
   | AC-3   | TC-13        | [確認]         |
   | AC-4   | TC-14        | [確認]         |
   | AC-5   | TC-15        | [確認]         |
   | AC-6   | 全既存テスト | [確認]         |

2. 全 AC がカバーされていることを確認する

**期待される成果物**:

- `outputs/phase-7/traceability-matrix.md`（トレーサビリティマトリクス）

---

## 参照資料

| 参照資料       | パス                                                          | 内容               |
| -------------- | ------------------------------------------------------------- | ------------------ |
| 実装ファイル   | `apps/desktop/src/renderer/utils/cronConverter.ts`            | カバレッジ計測対象 |
| テストファイル | `apps/desktop/src/__tests__/utils/cronConverter.edge.test.ts` | テスト全件         |
| Phase 4 成果物 | `outputs/phase-4/test-spec.md`                                | AC対応確認         |
| Phase 6 成果物 | `outputs/phase-6/expanded-test-cases.md`                      | 拡充テスト一覧     |

---

## 成果物

| 成果物                     | パス                                     | 内容                 |
| -------------------------- | ---------------------------------------- | -------------------- |
| カバレッジレポート         | `outputs/phase-7/coverage-report.md`     | カバレッジ計測結果   |
| 未到達パス分析書           | `outputs/phase-7/uncovered-analysis.md`  | 未到達箇所と対応方針 |
| トレーサビリティマトリクス | `outputs/phase-7/traceability-matrix.md` | AC↔テスト対応表      |

---

## 統合テスト連携

- `cronConverter.ts` の `monthly` 分岐が十分にカバーされていることを確認する
- 未到達パスがある場合は Phase 6 に戻るか、Phase 8 での対応を記録する

---

## 完了条件

- [ ] カバレッジ計測が完了している
- [ ] `monthly` 分岐の全パスがカバーされている（または未到達の理由が記録されている）
- [ ] AC-1〜AC-6 のトレーサビリティが確認されている
- [ ] `outputs/phase-7/coverage-report.md` が作成されている
- [ ] `outputs/phase-7/uncovered-analysis.md` が作成されている
- [ ] `outputs/phase-7/traceability-matrix.md` が作成されている

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスク（タスク1〜3）を100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 依存関係

- **前提**: Phase 6（テスト拡充）が完了していること
- **後続**: Phase 8（リファクタリング）へ進む
- **カバレッジ未達時**: Phase 6 へ戻りテスト追加を行う

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/TASK-UI-SCHEDULE-CRON-MONTHLY-GUARD-001/phase-8-refactoring.md`
