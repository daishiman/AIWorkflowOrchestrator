# Phase 9: 品質保証 - タスク仕様書

## メタ情報

| 項目       | 値                                 |
| ---------- | ---------------------------------- |
| Phase      | 9                                  |
| タスクID   | TASK-UI-SCHEDULE-CRON-SEMANTIC-001 |
| 機能名     | 意味論的 cron バリデーション追加   |
| タスク種別 | implementation                     |
| 前Phase    | Phase 8: リファクタリング          |
| 次Phase    | Phase 10: 最終レビューゲート       |
| ステータス | 未実施                             |
| 作成日     | 2026-04-12                         |

---

## 目的

lint / typecheck / test / coverage の一括判定を行い、Phase 10 レビューゲートへの進入可否を判定する。

AC-1〜AC-5 の受け入れ基準を最終確認し、Phase 10 に進むための品質水準を保証する。

---

## 実行タスク

### タスク1: 品質チェックコマンド実行計画

以下のコマンドを順番に実行し、全件 PASS を確認する:

```bash
# 型チェック
pnpm --filter @repo/desktop typecheck
```

```bash
# Lint
pnpm --filter @repo/desktop lint
```

```bash
# テスト全件
pnpm vitest run apps/desktop/src/__tests__/utils/scheduleConfigValidator.test.ts \
              apps/desktop/src/__tests__/utils/scheduleConfigValidator.edge.test.ts
```

```bash
# カバレッジ（scheduleConfigValidator.ts に限定）
pnpm vitest run --coverage \
  --coverage.include="apps/desktop/src/renderer/utils/scheduleConfigValidator.ts" \
  apps/desktop/src/__tests__/utils/scheduleConfigValidator.test.ts \
  apps/desktop/src/__tests__/utils/scheduleConfigValidator.edge.test.ts
```

各コマンドの結果は `outputs/phase-9/quality-report.md` に記録する。

### タスク2: AC-1〜AC-5 の最終確認チェックリスト

| AC   | 確認コマンド                                      | 期待結果                                                        |
| ---- | ------------------------------------------------- | --------------------------------------------------------------- |
| AC-1 | `vitest run scheduleConfigValidator.edge.test.ts` | TC-01 PASS（`"0 0 31 2 *"` + semantic=true でエラーが返る）     |
| AC-2 | `vitest run scheduleConfigValidator.edge.test.ts` | TC-04, TC-06 PASS（`"0 0 * * *"` 等の正常ケースが null を返す） |
| AC-3 | `vitest run scheduleConfigValidator.test.ts`      | SCV-01〜SCV-12 全件 PASS                                        |
| AC-4 | coverage report                                   | `scheduleConfigValidator.ts` 変更部分 Line ≥ 90% / Branch ≥ 85% |
| AC-5 | `grep "semantic" scheduleConfigValidator.ts`      | JSDoc に `options.semantic` の説明あり                          |

**AC-5 確認コマンド**:

```bash
grep -n "semantic\|options\.semantic\|@param" \
  apps/desktop/src/renderer/utils/scheduleConfigValidator.ts
```

### タスク3: Phase 9 PASS/FAIL 判定基準

| 判定 | 条件                                                                                   |
| ---- | -------------------------------------------------------------------------------------- |
| PASS | typecheck・lint・全テスト・カバレッジ・AC-1〜AC-5 の全件 PASS                          |
| FAIL | 上記のいずれか 1 件でも FAIL → 該当 Phase（Phase 5〜8）に戻り修正後に Phase 9 を再実施 |

**FAIL 時の戻り先**:

| 失敗内容                             | 戻り先  |
| ------------------------------------ | ------- |
| typecheck エラー                     | Phase 5 |
| lint エラー                          | Phase 8 |
| AC-1 失敗（semantic チェック未検出） | Phase 5 |
| AC-2/AC-3 失敗（既存テスト失敗）     | Phase 5 |
| AC-4 失敗（カバレッジ不足）          | Phase 7 |
| AC-5 失敗（JSDoc 未更新）            | Phase 8 |

**[FB-UI-02-1] PASS 基準注意**: 削除確認は「git delete されている OR stub 化かつ live import ゼロのいずれか」を PASS とする。

---

## 参照資料

| 資料名                              | パス                                                                    | 説明                            |
| ----------------------------------- | ----------------------------------------------------------------------- | ------------------------------- |
| Phase 8 リファクタリングログ        | `outputs/phase-8/refactoring-log.md`                                    | リファクタリング完了状態の確認  |
| Phase 7 カバレッジレポート          | `outputs/phase-7/coverage-report.md`                                    | カバレッジ目標値の参照          |
| Phase 1 受け入れ基準                | `outputs/phase-1/acceptance-criteria.md`                                | AC-1〜AC-5 の定義               |
| scheduleConfigValidator 実装        | `apps/desktop/src/renderer/utils/scheduleConfigValidator.ts`            | 型チェック・lint・AC-5 確認対象 |
| scheduleConfigValidator テスト      | `apps/desktop/src/__tests__/utils/scheduleConfigValidator.test.ts`      | AC-3 確認対象（SCV-01〜SCV-12） |
| scheduleConfigValidator edge テスト | `apps/desktop/src/__tests__/utils/scheduleConfigValidator.edge.test.ts` | AC-1, AC-2, AC-4 確認対象       |

---

## 成果物

| 成果物           | 配置先                              | 形式     |
| ---------------- | ----------------------------------- | -------- |
| 品質保証レポート | `outputs/phase-9/quality-report.md` | Markdown |

**`outputs/phase-9/quality-report.md` に含める内容**:

- 各品質チェックコマンドの実行結果（PASS / FAIL）
- AC-1〜AC-5 の最終確認結果テーブル
- Phase 9 総合判定（PASS / FAIL）
- FAIL がある場合は戻り先 Phase と修正内容の記録

---

## 統合テスト連携

- Phase 8 のリファクタリング完了状態を前提とする
- Phase 10（最終レビューゲート）へのインプット: 本 Phase の品質レポートを参照資料として提供する
- AC-1〜AC-5 の充足状況を Phase 10 レビュー観点テーブルに引き継ぐ
- NON_VISUAL 評価（Phase 11）：バリデーターロジックのみの変更のため、UI スクリーンショット不要・コマンド出力での確認のみ

---

## 完了条件チェックリスト

- [ ] `pnpm --filter @repo/desktop typecheck` が PASS していること
- [ ] `pnpm --filter @repo/desktop lint` が PASS していること
- [ ] `scheduleConfigValidator.test.ts`（SCV-01〜SCV-12）が全件 PASS していること
- [ ] `scheduleConfigValidator.edge.test.ts` が全件 PASS していること
- [ ] カバレッジが Line ≥ 90%、Branch ≥ 85% を満たしていること
- [ ] AC-1: `"0 0 31 2 *"` + `{ semantic: true }` がエラーを返すことが確認されていること
- [ ] AC-2: 正常な cron 式が `{ semantic: true }` 指定でも null を返すことが確認されていること
- [ ] AC-3: 既存テスト SCV-01〜SCV-12 が全件 PASS していること
- [ ] AC-4: カバレッジが向上（Phase 7 目標値達成）していることが確認されていること
- [ ] AC-5: JSDoc に `options.semantic` の説明が記述されていることが確認されていること
- [ ] `outputs/phase-9/quality-report.md` に全結果が記録されていること

---

## Phase 末端アクション【必須】

Phase 9 完了時に以下を実行すること:

1. `outputs/phase-9/quality-report.md` に各品質チェックの実行結果を記録する
2. AC-1〜AC-5 の最終確認結果を記録する
3. 総合判定（PASS / FAIL）を明示的に記録する（「PASS: Phase 10 へ進む」等）
4. FAIL がある場合は戻り先 Phase を特定し、修正後に Phase 9 を再実施する
5. 全完了条件チェックリストを確認し、未完了項目がある場合は完了させてから Phase 10 へ進む

---

## 依存関係

| 依存Phase/タスク | 依存内容                                                       |
| ---------------- | -------------------------------------------------------------- |
| Phase 7 完了     | カバレッジ目標（Line ≥ 90%, Branch ≥ 85%）が達成済みであること |
| Phase 8 完了     | リファクタリング完了・全テスト PASS・JSDoc 更新済みであること  |

---

## Phase 実行記録テンプレート

```markdown
## Phase 9 実行記録

- 実行日時: YYYY-MM-DD HH:mm
- 実行者: -
- typecheck: [ ] PASS / [ ] FAIL（エラー内容: ）
- lint: [ ] PASS / [ ] FAIL（エラー内容: ）
- テスト全件（test.ts）: [ ] PASS / [ ] FAIL（失敗テスト: ）
- テスト全件（edge.test.ts）: [ ] PASS / [ ] FAIL（失敗テスト: ）
- カバレッジ: Line X% / Branch X%（目標 ≥ 90% / ≥ 85%）: [ ] PASS / [ ] FAIL
- AC-1: [ ] PASS / [ ] FAIL
- AC-2: [ ] PASS / [ ] FAIL
- AC-3: [ ] PASS / [ ] FAIL
- AC-4: [ ] PASS / [ ] FAIL
- AC-5: [ ] PASS / [ ] FAIL
- Phase 9 総合判定: [ ] PASS / [ ] FAIL
- FAIL がある場合の戻り先: Phase X（理由: ）
- 完了条件充足状況: X / 11 項目完了
- Phase 10 移行判定: [ ] PASS（Phase 10 へ進む）/ [ ] HOLD（Phase X へ戻る）
```

---

## 次のPhase案内

**Phase 10: 最終レビューゲート** — AC-1〜AC-5 の受け入れ基準に対して PASS / MINOR / MAJOR の判定を行い、Phase 11 への進入可否を決定する。Phase 9 で全品質チェックが PASS した状態でレビューゲートに進む。
