# Phase 10: 最終レビューゲート - 新関数テスト拡充

## メタ情報

| 項目    | 値                                                           |
| ------- | ------------------------------------------------------------ |
| Phase   | 10                                                           |
| 機能名  | UT-TASK06-007-EXT-006-new-function-test-expansion            |
| 作成日  | 2026-03-21                                                   |
| 前Phase | [phase-9-quality-assurance.md](phase-9-quality-assurance.md) |

## 目的

Phase 4〜9の成果物を多角的に検証し、タスク指示書の完了条件を全て満たしているかを最終確認する。ゲート判定（PASS/MINOR/MAJOR/CRITICAL）を下してPhase 11（手動テスト）への移行可否を決定する。

## 実行タスク

- 要件充足確認: タスク指示書の完了条件6項目を全て確認
- コード品質確認: export追加がプロダクション動作に影響しないことの確認
- テスト品質確認: 境界値・エッジケースが十分にカバーされているかの確認
- 整合性確認: Phase 1〜9の成果物間のトレーサビリティ確認
- ゲート判定の実施

## 参照資料

| 資料名             | パス                                                                                     | 説明                                     |
| ------------------ | ---------------------------------------------------------------------------------------- | ---------------------------------------- |
| Phase 1成果物      | [phase-1-requirements.md](phase-1-requirements.md)                                       | テスト要件定義（FR-1〜FR-4）             |
| Phase 2成果物      | [phase-2-design.md](phase-2-design.md)                                                   | テスト構造設計                           |
| Phase 3成果物      | [phase-3-design-review.md](phase-3-design-review.md)                                     | 設計レビュー結果（PASS）                 |
| Phase 5成果物      | `outputs/phase-5/green-confirmation.md`                                                  | export追加後のGreen確認                  |
| Phase 8成果物      | `outputs/phase-8/refactoring-report.md`                                                  | リファクタリング結果                     |
| Phase 9成果物      | `outputs/phase-9/quality-report.md`                                                      | Lint・型チェック・テスト・カバレッジ結果 |
| タスク指示書       | `docs/30-workflows/completed-tasks/ut-task06-007-ext-006-new-function-test-expansion.md` | 完了条件の確認元                         |
| タスク実行ルール   | `.claude/rules/05-task-execution.md`                                                     | Phase 10ゲート判定基準                   |
| 対象スクリプト     | `apps/desktop/scripts/check-ipc-contracts.ts`                                            | export追加後の本体                       |
| テストファイル     | `apps/desktop/scripts/__tests__/check-ipc-contracts.test.ts`                             | 追加済みテストファイル                   |
| 要件定義書         | `outputs/phase-1/requirements.md`                                                        | Phase 1 成果物                           |
| 設計書             | `outputs/phase-2/design.md`                                                              | Phase 2 成果物                           |
| カバレッジレポート | `outputs/phase-7/coverage-report.md`                                                     | Phase 7 成果物                           |

## 実行手順

### ステップ1: タスク指示書の完了条件チェック

タスク指示書の完了条件6項目を逐一確認する:

| #   | 完了条件                                                                                  | 確認方法                        | 判定 |
| --- | ----------------------------------------------------------------------------------------- | ------------------------------- | ---- |
| 1   | `normalizeTypeAnnotation` のテスト5件（T-N-01〜05）が全PASS                               | Phase 9テスト実行結果の確認     | -    |
| 2   | `isPrimitiveTypeAnnotation` のテスト6件（T-P-01〜06）が全PASS                             | Phase 9テスト実行結果の確認     | -    |
| 3   | `mergeChannelMaps` のテスト4件（T-M-01〜04）が全PASS                                      | Phase 9テスト実行結果の確認     | -    |
| 4   | `CHANNEL_OBJECT_PATTERN` / `PRELOAD_CALL_START_PATTERN` のテスト5件（T-R-01〜05）が全PASS | Phase 9テスト実行結果の確認     | -    |
| 5   | 既存テスト49件が全PASS維持（回帰テスト）                                                  | Phase 9テスト実行結果の確認     | -    |
| 6   | Line Coverage 95%以上を維持                                                               | Phase 9カバレッジ計測結果の確認 | -    |

### ステップ2: コード品質の確認

`check-ipc-contracts.ts` へのexport追加がプロダクション動作に影響しないことを確認する:

| 確認項目                                                        | 確認方法                                                                   |
| --------------------------------------------------------------- | -------------------------------------------------------------------------- |
| exportキーワード追加のみでロジック変更がないこと                | `git diff apps/desktop/scripts/check-ipc-contracts.ts` でdiff確認          |
| 追加したexport（5箇所）が既存の関数シグネチャを変えていないこと | Phase 8 ステップ1の確認コマンド結果                                        |
| `isDirectRun` による直接実行ガードが維持されていること          | `grep -n "isDirectRun" apps/desktop/scripts/check-ipc-contracts.ts` で確認 |
| `main()` 関数の動作に変更がないこと                             | Phase 9の `T-7a〜T-7e` テスト全PASS確認                                    |

### ステップ3: テスト品質の確認

追加した20件のテストが、Phase 1の要件定義（FR-1〜FR-4）を十分にカバーしているかを確認する:

**FR-1 (normalizeTypeAnnotation) チェック:**

| テストID | 検証ポイント           | テスト存在 |
| -------- | ---------------------- | ---------- |
| T-N-01   | パススルー（変換なし） | -          |
| T-N-02   | arrow function除去     | -          |
| T-N-03   | default value除去      | -          |
| T-N-04   | readonly除去           | -          |
| T-N-05   | 前後空白のtrim         | -          |

**FR-2 (isPrimitiveTypeAnnotation) チェック:**

| テストID | 検証ポイント                  | テスト存在 |
| -------- | ----------------------------- | ---------- |
| T-P-01   | 単体プリミティブ型 string     | OK         |
| T-P-02   | 単体プリミティブ型 number     | OK         |
| T-P-03   | union型                       | OK         |
| T-P-04   | nullable型                    | OK         |
| T-P-05   | オブジェクト型（falseを返す） | OK         |
| T-P-06   | 空文字列（falseを返す）       | OK         |

**FR-3 (mergeChannelMaps) チェック:**

| テストID | 検証ポイント                | テスト存在 |
| -------- | --------------------------- | ---------- |
| T-M-01   | 1ファイルマージ             | OK         |
| T-M-02   | 重複キー（先勝ち）          | OK         |
| T-M-03   | 空ファイルリスト            | OK         |
| T-M-04   | チャンネル定義なし（空Map） | OK         |

**FR-4 (パターン) チェック:**

| テストID | 検証ポイント                     | テスト存在 |
| -------- | -------------------------------- | ---------- |
| T-R-01   | CHANNEL_OBJECT_PATTERN基本マッチ | OK         |
| T-R-02   | exportなし const にもマッチ      | OK         |
| T-R-03   | as constなし（マッチしない）     | OK         |
| T-R-04   | safeInvoke 呼び出しにマッチ      | OK         |
| T-R-05   | safeOn 呼び出しにマッチ          | OK         |

### ステップ4: 整合性確認

Phase 1〜9の成果物間でトレーサビリティが成立しているか確認する:

| 確認項目                                                                        | 期待状態                                              |
| ------------------------------------------------------------------------------- | ----------------------------------------------------- |
| Phase 1のFR-1〜FR-4（20件）が全てテストファイルに実装されている                 | T-N-01〜05, T-P-01〜06, T-M-01〜04, T-R-01〜05 が存在 |
| Phase 2の設計（describe構造、fsモック方式）が実装に反映されている               | 一時ファイル方式、lastIndex回避が確認できる           |
| Phase 3のリスク評価対象（CHANNEL_OBJECT_PATTERN lastIndex問題）が対処されている | テスト内で `new RegExp(source, flags)` を使用         |
| Phase 9の品質レポートが全項目PASSを記録している                                 | `outputs/phase-9/quality-report.md` 参照              |

### ステップ5: ゲート判定

上記ステップ1〜4の確認結果に基づき、以下の基準でゲート判定を行う:

| 判定     | 条件                                                                                     | 対応                                         |
| -------- | ---------------------------------------------------------------------------------------- | -------------------------------------------- |
| PASS     | 全完了条件が充足、コード品質・テスト品質に問題なし                                       | Phase 11へ                                   |
| MINOR    | 軽微な問題あり（追加テスト1〜2件の不足、命名の軽微な不整合等）                           | 未タスク仕様書に変換後Phase 11へ（省略不可） |
| MAJOR    | 完了条件未充足（件数不足、カバレッジ基準未達）または設計との重大な乖離                   | 影響範囲に応じてPhase 4〜7へ戻る             |
| CRITICAL | テスト追加によって既存49件に回帰デグレが発生、またはexport追加がプロダクション動作を破壊 | Phase 1へ戻り要件再確認                      |

**判定実施時の記録事項:**

- 各ステップの確認結果（OK/NG）
- 指摘事項（MINOR/MAJOR/CRITICALの場合は具体的内容）
- 総合判定とその理由

### ステップ6: MINOR指摘の処理（該当する場合）

MINOR判定の場合、指摘事項を未タスク仕様書として `docs/30-workflows/unassigned-task/` に作成する。

作成する仕様書の内容:

- タスクID: `UT-TASK06-007-EXT-006-FOLLOWUP-NNN`
- 指摘内容の詳細
- 対応方針
- 受け入れ基準

「機能影響なし」であっても省略は不可（`.claude/rules/05-task-execution.md` Phase 10ゲート判定参照）。

### ステップ7: 最終レビュー結果の記録

`outputs/phase-10/final-review-result.md` に以下を記録する:

```markdown
# Phase 10 最終レビュー結果

## レビュー実施日

2026-03-21

## 完了観点チェック結果

| #   | 完了条件                              | 結果  |
| --- | ------------------------------------- | ----- |
| 1   | normalizeTypeAnnotation テスト5件PASS | OK/NG |

...（全6項目）

## コード品質確認結果

- export追加のdiff確認: OK/NG
  ...

## テスト品質確認結果

- FR-1 T-N-01〜05: OK/NG
  ...（全20件）

## 整合性確認結果

...

## ゲート判定

**PASS / MINOR / MAJOR / CRITICAL**

判定理由: ...

## MINOR指摘事項（PASSの場合は「なし」）

...
```

## 統合テスト連携

Phase 10では追加の実行は行わず、Phase 9の結果を基に判定する。

## 成果物

| 成果物             | パス                                                                      | 説明                         |
| ------------------ | ------------------------------------------------------------------------- | ---------------------------- |
| 最終レビュー結果書 | `outputs/phase-10/final-review-result.md`                                 | ゲート判定と全確認結果の記録 |
| 未タスク仕様書     | `docs/30-workflows/unassigned-task/UT-TASK06-007-EXT-006-FOLLOWUP-NNN.md` | MINOR指摘がある場合のみ作成  |

## 完了条件

- [x] タスク指示書の完了条件6項目が全てOKであることを確認
- [x] コード品質確認（export追加による破壊的変更なし）が完了
- [x] テスト品質確認（FR-1〜FR-4の20件全テストID存在確認）が完了
- [x] Phase 1〜9の整合性確認が完了
- [x] ゲート判定が PASS で記録されている
- [x] MINOR 判定ではないため追加の未タスク仕様書は不要と確認
- [x] `outputs/phase-10/final-review-result.md` を作成
- [x] **本Phase内の全タスクを100%実行完了**

## 次Phase

- **PASS**: Phase 11（手動テスト）に進む
- **MINOR**: 未タスク仕様書を作成後、Phase 11（手動テスト）に進む
- **MAJOR**: 影響範囲に応じてPhase 4〜7へ戻る
- **CRITICAL**: Phase 1へ戻り要件再確認
