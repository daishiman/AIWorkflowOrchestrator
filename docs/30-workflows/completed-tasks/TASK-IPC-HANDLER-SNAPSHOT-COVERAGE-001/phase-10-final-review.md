# Phase 10: 最終レビュー - タスク仕様書

## メタ情報

| 項目       | 内容                                   |
| ---------- | -------------------------------------- |
| Phase      | 10                                     |
| タスクID   | TASK-IPC-HANDLER-SNAPSHOT-COVERAGE-001 |
| ステータス | 未実施                                 |
| 作成日     | 2026-04-19                             |
| 前Phase    | 9: 品質保証                            |
| 次Phase    | 11: 手動テスト                         |

---

## 目的

index.md に定義された受入基準（AC-001〜AC-008）との照合を実施し、
残課題を `unassigned-task/` へ登録したうえで、
Phase 11（手動テスト）への進行判定を行う。

> **NON_VISUAL タスクとしての注記**
>
> 本タスクは UI 変更を含まない（NON_VISUAL）ため、視覚的なスクリーンショット証跡は不要。
> AC の達成証跡はすべてテスト実行ログ・CI ログ・outputs/ 配下の成果物で代替する。
> `outputs/phase-9/quality-check-result.md` および `outputs/phase-10/final-review-result.md` を正本証跡とする。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: 受入基準 AC-001〜AC-008 の照合

**目的**: index.mdに定義された全受入基準が満たされているかを証跡付きで確認する

**実行手順**:

1. `docs/30-workflows/TASK-IPC-HANDLER-SNAPSHOT-COVERAGE-001/index.md` の受入基準セクションを開く
2. 以下の照合マトリクスを記入する（証跡は各Phaseのoutputsを参照）

**照合マトリクス**:

| ID     | 受入基準                                                                                                                                                                   | 達成状況 | 証跡                                                                          |
| ------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | ----------------------------------------------------------------------------- |
| AC-001 | `handler-inventory.md` に列挙された全 registration unit が、`REG-SNAP` 導入済みまたは `coverage-report.md` / `unassigned-task/` に対象外理由・後続計画付きで整理されている | 未確認   | `outputs/phase-7/coverage-report.md`, `docs/30-workflows/unassigned-task/`    |
| AC-002 | `handler-inventory.md` に列挙された全 registration unit が、`REG-DEDUP` 導入済みまたは代替検証方針付きで整理されている                                                     | 未確認   | `outputs/phase-7/coverage-report.md`                                          |
| AC-003 | `handler-inventory.md` に列挙された全 registration unit が、`REG-COUNT` 導入済みまたは `handle/on/mixed` 差分に応じた検証方針付きで整理されている                          | 未確認   | `outputs/phase-7/coverage-report.md`                                          |
| AC-004 | Wave 1 の全テストが CI で PASS する                                                                                                                                        | 未確認   | `outputs/phase-9/quality-check-result.md`                                     |
| AC-005 | Wave 2 の全テストが CI で PASS する                                                                                                                                        | 未確認   | `outputs/phase-9/quality-check-result.md`                                     |
| AC-006 | Wave 3 の事前調査・優先順位・後続実施計画が `wave3-prereq-check.md` と `coverage-report.md` に記録されている                                                               | 未確認   | `outputs/phase-6/wave3-prereq-check.md`, `outputs/phase-7/coverage-report.md` |
| AC-007 | 既存テスト（`creatorHandlers.registrationSnapshot.test.ts`）が引き続き PASS する                                                                                           | 未確認   | `outputs/phase-9/quality-check-result.md`                                     |
| AC-008 | 新規テストファイルの命名規則が `*Handlers.registrationSnapshot.test.ts` に準拠する                                                                                         | 未確認   | `outputs/phase-7/coverage-report.md`, 各テストファイル                        |

3. 各 AC について「達成」「未達」「一部達成」のいずれかを記録する
4. 未達・一部達成のACがある場合は原因を特定する

**期待される成果物**:

- `outputs/phase-10/final-review-result.md` の受入基準照合セクション

---

### タスク2: 残課題の特定とunassigned-task/への登録

**目的**: タスク1で特定した未達・一部達成項目および将来課題を `unassigned-task/` へ登録する

**実行手順**:

1. 以下の観点で残課題を特定する
   - AC未達項目（修正が必要なもの）
   - Wave 2/3で未着手のhandler（Phase 7のcoverage-report.mdを参照）
   - リファクタリング中に発見した技術的負債（Phase 8のrefactoring-log.mdを参照）
2. 各残課題について以下の形式で `docs/30-workflows/unassigned-task/` 配下に登録する

**残課題登録テンプレート**:

```markdown
# [課題タイトル]

## 概要

[課題の説明]

## 発見Phase

Phase 10（TASK-IPC-HANDLER-SNAPSHOT-COVERAGE-001）

## 優先度

[高 / 中 / 低]

## 対応方針

[実装方針・対応手順の概要]

## 関連ファイル

- [ファイルパス]
```

3. 登録した残課題の一覧を `final-review-result.md` に記録する

**期待される成果物**:

- `outputs/phase-10/final-review-result.md` の残課題一覧セクション
- `docs/30-workflows/unassigned-task/` 配下の残課題ファイル群（該当する場合）

---

### タスク3: Wave 2/3の実施計画確認

**目的**: Wave 2/3の対象handlerに対するスナップショットテスト導入計画が文書化されていることを確認する

**実行手順**:

1. `outputs/phase-7/coverage-report.md` のWave 2/3残課題セクションを確認する
2. Wave 2/3の対象handler一覧・実施優先度・作業ボリューム見積もりが記録されていることを確認する
3. 記録が不十分な場合は `final-review-result.md` に補記する
4. Wave 2/3を別タスクとして管理する場合は `unassigned-task/` へ登録する

**確認チェックリスト**:

- [ ] Wave 2対象handlerの一覧が記録されている
- [ ] Wave 3対象handlerの一覧が記録されている
- [ ] `handle` / `on` の使い分けが整理されている
- [ ] 実施優先度が明記されている

**期待される成果物**:

- `outputs/phase-10/final-review-result.md` のWave 2/3計画確認セクション

---

### タスク4: 最終レビュー判定とPhase 11進行承認

**目的**: 全照合結果を集約し、Phase 11（手動テスト）への進行可否を判定する

**実行手順**:

1. タスク1〜3の結果を集約する
2. 以下の判定基準に基づいて最終判定を行う

**判定基準**:

| 判定     | 条件                                                            | 次のアクション                |
| -------- | --------------------------------------------------------------- | ----------------------------- |
| PASS     | AC-001〜AC-008 が全て「達成」                                   | Phase 11へ進行                |
| MINOR    | 未達が 1 件以下かつ AC-001/002/003/007/008 を含まない           | 修正後に Phase 11 へ進行      |
| MAJOR    | 未達が 2 件以上、または AC-001/002/003/007/008 のいずれかが未達 | 未達 AC の原因 Phase へ戻る   |
| CRITICAL | 設計前提の崩壊、対象定義の破綻、wave 分割方針の破綻             | Phase 1〜3 へ戻りユーザー確認 |

**戻り先決定基準**:

| 問題の種類                                     | 戻り先           |
| ---------------------------------------------- | ---------------- |
| AC-001/002/003 未達（テスト契約未充足）        | Phase 5〜7       |
| AC-004/005/006 未達（Wave 完遂または CI 未達） | Phase 6〜9       |
| AC-007 未達（既存 creator テスト回帰）         | Phase 5 または 9 |
| AC-008 未達（命名不一致）                      | Phase 4 または 7 |

3. 判定結果と根拠を `final-review-result.md` に記録する

**期待される成果物**:

- `outputs/phase-10/final-review-result.md` の最終判定セクション（判定結果・根拠・次アクション）

---

## 参照資料

| 参照資料                    | パス                                                                | 内容                      |
| --------------------------- | ------------------------------------------------------------------- | ------------------------- |
| 受入基準（index.md）        | `docs/30-workflows/TASK-IPC-HANDLER-SNAPSHOT-COVERAGE-001/index.md` | AC-001〜AC-008 の定義     |
| Phase 7カバレッジレポート   | `outputs/phase-7/coverage-report.md`                                | handler別導入状況         |
| Phase 8リファクタリングログ | `outputs/phase-8/refactoring-log.md`                                | Before/After/理由テーブル |
| Phase 9品質チェック結果     | `outputs/phase-9/quality-check-result.md`                           | lint/typecheck/test結果   |
| unassigned-task/            | `docs/30-workflows/unassigned-task/`                                | 残課題登録先              |

---

## 成果物

| 成果物           | パス                                           | 内容                                   |
| ---------------- | ---------------------------------------------- | -------------------------------------- |
| 最終レビュー結果 | `outputs/phase-10/final-review-result.md`      | AC照合・残課題・Wave 2/3計画・最終判定 |
| 残課題ファイル群 | `docs/30-workflows/unassigned-task/`（該当時） | 登録された残課題                       |

---

## 統合テスト連携（Phase 1〜11は必須）

**Phase 10の統合テスト連携アクション**:

- AC-001〜AC-008 の全照合により、統合テストとしての registration snapshot guard が機能していることを最終確認する
- Phase 9の品質チェック結果（lint/typecheck/vitest run）を証跡として照合に使用する
- 最終判定がPASS/MINORの場合にのみPhase 11（手動テスト）へ進行する
- MAJOR/CRITICALの場合は原因Phaseへ戻り、統合品質を担保してから再照合する

---

## 多角的チェック観点（AIが判断）

| 観点                    | チェック内容                                                                        |
| ----------------------- | ----------------------------------------------------------------------------------- |
| AC照合の網羅性          | AC-001〜AC-008 を全て証跡付きで照合しているか（漏れがないか）                       |
| 残課題の登録漏れ        | Wave 2/3の未着手handler、技術的負債が全て unassigned-task/ に登録されているか       |
| handle/on差分の整理状況 | AC-4の整理結果が `coverage-report.md` に具体的に記載されているか                    |
| wave分割文書の完全性    | AC-5の wave分割方針が index.md に具体的なhandler名・優先度込みで記載されているか    |
| 判定根拠の明示性        | 最終判定が「PASS/MINOR/MAJOR/CRITICAL」のいずれかで明示され、根拠が記録されているか |
| Phase 11進行の条件充足  | PASS/MINORの場合のみ進行し、MINORなら修正完了後に進行していることが確認できるか     |

---

## サブタスク管理

| サブタスクID | 内容                                 | ステータス |
| ------------ | ------------------------------------ | ---------- |
| ST-10-01     | AC-001〜AC-008 の照合マトリクス記入  | 未実施     |
| ST-10-02     | 残課題特定とunassigned-task/への登録 | 未実施     |
| ST-10-03     | Wave 2/3実施計画の確認               | 未実施     |
| ST-10-04     | 最終レビュー判定とPhase 11進行承認   | 未実施     |

---

## 完了条件

- [ ] AC-001〜AC-008 の全受入基準が証跡付きで照合されている
- [ ] 未達・一部達成のACについて原因が特定されている
- [ ] 残課題が `docs/30-workflows/unassigned-task/` へ登録されている（課題がある場合）
- [ ] Wave 2/3の実施計画が確認・補記されている
- [ ] `outputs/phase-10/final-review-result.md` が生成されている
- [ ] 最終判定がPASS/MINORであり、Phase 11への進行が承認されている
- [ ] NON_VISUAL タスクとして、スクリーンショット不要の旨が `final-review-result.md` に記録されている
- [ ] Wave 1/2 のテスト PASS と Wave 3 の後続実施計画が AC-004/005/006 として証跡付きで確認されている

---

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 次Phase

完了後、以下のファイルを実行してください:

`docs/30-workflows/TASK-IPC-HANDLER-SNAPSHOT-COVERAGE-001/phase-11-manual-test.md`
