# Phase 10: 最終レビューゲート

## メタ情報

| 項目       | 内容                                                  |
| ---------- | ----------------------------------------------------- |
| Phase      | 10                                                    |
| 機能名     | UT-SKILL-WIZARD-SEMANTIC-DEFAULT-EXTENSIBILITY-001    |
| タスク名   | ConversationRoundStep semantic default 入力元拡張対応 |
| 前提Phase  | Phase 9（品質保証）                                   |
| 後続Phase  | Phase 11（手動テスト検証）                            |
| 作成日     | 2026-04-11                                            |
| ステータス | pending                                               |

---

## 目的

AC-1〜AC-5 の全てが PASS であることを確認し、Phase 11 へ進んでよいかを最終判定する。
MAJOR 問題があれば Phase 4 または Phase 8 に戻す。MINOR 問題は未タスクとして記録し Phase 11 へ進む。

---

## 実行タスク

### Task 1: 受け入れ基準チェックリスト

Phase 9 の品質レポートおよびリスク台帳を参照し、全 AC を判定する。

| AC-ID | 基準                                                                               | 証跡ファイル名                                                       | 判定        |
| ----- | ---------------------------------------------------------------------------------- | -------------------------------------------------------------------- | ----------- |
| AC-1  | `QuestionSemanticLabelMap` 型が `@repo/shared` からインポートできる                | `outputs/phase-9/quality-report.md`（TypeScript 型チェック結果）     | PASS / FAIL |
| AC-2  | `resolveSemanticLabel()` が `ConversationRoundStep.tsx` 内にハードコードを持たない | `outputs/phase-9/quality-report.md`（コードレビュー結果）            | PASS / FAIL |
| AC-3  | `applySmartDefaults()` テストが10件以上存在し全件 PASS                             | `outputs/phase-7/traceability-coverage-report.md`（vitest 実行ログ） | PASS / FAIL |
| AC-4  | 正準形対応表が `outputs/phase-3/design-decisions.md` に文書化されている            | `outputs/phase-8/refactoring-plan.md`（ドキュメント確認結果）        | PASS / FAIL |
| AC-5  | 既存のウィザード動作が変わらない（回帰テスト）                                     | `outputs/phase-6/regression-test-result.md`（全件 PASS 確認）        | PASS / FAIL |

**記入手順:**

1. 各 AC に対して、対応する証跡ファイルを開き内容を確認する
2. 証跡ファイル名に実際のファイル名を記入する（上記はデフォルト候補）
3. 判定欄に `PASS` または `FAIL` を記入する

### Task 2: ブロッカー判定

以下の基準で MAJOR / MINOR を判定する。

**MAJOR（Phase 4 または Phase 8 への戻りが必要）:**

| 条件                                 | 確認結果 |
| ------------------------------------ | -------- |
| AC-1〜AC-5 のいずれかが FAIL         |          |
| 型エラーや Lint エラーが残存している |          |
| テスト総数が10件未満                 |          |

MAJOR に該当する場合:

- 型設計・実装に問題がある場合 → Phase 4 に戻る
- テスト・リファクタリングに問題がある場合 → Phase 8 に戻る

**MINOR（未タスク化して Phase 11 へ進む）:**

| 条件                                                           | 確認結果 |
| -------------------------------------------------------------- | -------- |
| テストカバレッジが目標値未満でも許容範囲内                     |          |
| JSDoc の完成度が不十分                                         |          |
| `outputs/phase-3/design-decisions.md` の補足記述が不足している |          |

MINOR に該当する場合:

- `outputs/phase-10/corrective-action-plan.md` に未タスク候補として記録し Phase 11 へ進む

### Task 3: ゲート判定

Task 1・Task 2 の結果を統合し、最終判定を下す。

| 判定     | 条件                                                     | 対応                                  |
| -------- | -------------------------------------------------------- | ------------------------------------- |
| **PASS** | AC-1〜AC-5 が全て PASS かつ MAJOR ブロッカーなし         | Phase 11 へ進む                       |
| **FAIL** | AC-1〜AC-5 のいずれかが FAIL または MAJOR ブロッカーあり | Phase 4 または Phase 8 に戻り修正する |

**ゲート判定結果:** （ここに `PASS` または `FAIL` を記入する）

**戻り先（FAIL の場合）:** （Phase 4 または Phase 8 を記入する）

**判定根拠:** （判定の理由を記述する）

### Task 4: MINOR 指摘の未タスク化

Phase 10 で検出した MINOR 指摘は必ず未タスク候補として記録する。

- 未タスク候補の記録先: `outputs/phase-10/corrective-action-plan.md`
- 記録形式:

  ```
  ## MINOR 指摘 未タスク候補一覧

  | No. | 指摘内容 | 優先度 | 対応方針 |
  | --- | -------- | ------ | -------- |
  | 1   |          |        |          |
  ```

- Phase 12 の「未タスク検出」セクションに引き継ぐ

---

## 参照資料

| 資料名                   | パス                                              | 用途                            |
| ------------------------ | ------------------------------------------------- | ------------------------------- |
| Phase 9 品質レポート     | `outputs/phase-9/quality-report.md`               | AC-1・AC-2 の証跡確認           |
| Phase 9 リスク台帳       | `outputs/phase-9/risk-register.md`                | 残存リスクの確認                |
| Phase 7 カバレッジ報告   | `outputs/phase-7/traceability-coverage-report.md` | AC-3 の証跡確認（テスト総数）   |
| Phase 6 回帰テスト結果   | `outputs/phase-6/regression-test-result.md`       | AC-5 の証跡確認                 |
| Phase 8 リファクタリング | `outputs/phase-8/refactoring-plan.md`             | AC-4 の証跡確認（ドキュメント） |
| 受け入れ基準             | `outputs/phase-1/acceptance-criteria.md`          | AC-1〜AC-5 の定義確認           |

---

## 統合テスト連携

- ゲート PASS 後、Phase 11 で手動テスト（NON_VISUAL 代替証跡）を実施する
- MINOR 指摘は `outputs/phase-10/corrective-action-plan.md` に記録し、Phase 12 の未タスク検出に引き継ぐ
- ゲート FAIL の場合、戻り先 Phase（Phase 4 または Phase 8）に判定根拠と修正指示を伝達する

---

## 多角的チェック観点（AIが判断）

| 思考法       | 確認内容                                                                                 |
| ------------ | ---------------------------------------------------------------------------------------- |
| 論点思考     | 最終判定の根拠が AC-1〜AC-5 に正確に紐付いているか                                       |
| システム思考 | 個別 AC の PASS が全体（ウィザードの動作正常性）の PASS を意味するか                     |
| 整合性確認   | 証跡ファイルの内容と AC 判定結果が一致しているか                                         |
| リスク思考   | Phase 9 リスク台帳の残存リスクが Phase 11 以降に顕在化する可能性があるか                 |
| 価値提案思考 | 全 PASS で Phase 11 へ進んだ場合、手動テストで追加問題が発見されるリスクをどう見積もるか |

---

## 成果物

| 成果物名             | パス                                              | 必須 |
| -------------------- | ------------------------------------------------- | ---- |
| 最終レビュー結果     | `outputs/phase-10/final-review-result.md`         | ✅   |
| 是正計画（未タスク） | `outputs/phase-10/corrective-action-plan.md`      | ✅   |
| 出荷準備チェック     | `outputs/phase-10/release-readiness-checklist.md` | ✅   |

---

## 完了条件

- [ ] AC-1〜AC-5 の全項目に証跡ファイル名と判定（PASS / FAIL）が記入されている
- [ ] MAJOR / MINOR のブロッカー判定が完了している
- [ ] ゲート判定（PASS / FAIL）が `outputs/phase-10/final-review-result.md` に記録されている
- [ ] MINOR 指摘が `outputs/phase-10/corrective-action-plan.md` に未タスク候補として記録されている
- [ ] PASS の場合、Phase 11 への引き継ぎ事項が明記されている
- [ ] FAIL の場合、戻り先 Phase と修正指示が明記されている

## タスク100%実行確認【必須】

- [ ] Task 1: 受け入れ基準チェックリスト（AC-1〜AC-5 全判定）✅
- [ ] Task 2: ブロッカー判定（MAJOR / MINOR の分類）✅
- [ ] Task 3: ゲート判定（PASS / FAIL の確定）✅
- [ ] Task 4: MINOR 指摘の未タスク化（corrective-action-plan.md への記録）✅
- [ ] 全成果物が `outputs/phase-10/` に保存されていること ✅

---

## 次Phase

**PASS** の場合 → **Phase 11: 手動テスト検証**（`phase-11-manual-test.md`）へ進む。
**FAIL** の場合 → 戻り先 Phase（Phase 4 または Phase 8）に修正指示とともに戻る。
