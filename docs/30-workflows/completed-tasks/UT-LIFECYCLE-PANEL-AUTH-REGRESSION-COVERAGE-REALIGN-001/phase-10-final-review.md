# Phase 10: 最終レビュー - タスク仕様書

## メタ情報

| 項目       | 内容                                                    |
| ---------- | ------------------------------------------------------- |
| Phase      | 10                                                      |
| タスクID   | UT-LIFECYCLE-PANEL-AUTH-REGRESSION-COVERAGE-REALIGN-001 |
| タスク名   | auth regression coverage realignment                    |
| タスク種別 | NON_VISUAL                                              |
| ステータス | 未実施                                                  |
| 作成日     | 2026-04-19                                              |
| 前Phase    | 9: 品質保証                                             |
| 次Phase    | 11: 手動テスト                                          |

---

## 目的

index.md に定義された受入基準（AC-001〜AC-006）と Phase 1〜9 の証跡を照合し、
MINOR 指摘と残課題を区別して記録したうえで、
Phase 11（手動テスト）への進行判定を行う。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: 受入基準 AC-001〜AC-006 の照合

**目的**: index.md に定義された全受入基準が満たされているかを証跡付きで確認する

**実行手順**:

1. `docs/30-workflows/UT-LIFECYCLE-PANEL-AUTH-REGRESSION-COVERAGE-REALIGN-001/index.md` の受入基準セクションを開く
2. 以下の照合マトリクスを記入する（証跡は各 Phase の outputs を参照）

**照合マトリクス**:

| ID     | 受入基準                                                                           | 達成状況 | 証跡                                                                  |
| ------ | ---------------------------------------------------------------------------------- | -------- | --------------------------------------------------------------------- |
| AC-001 | 単体テストと統合テストの責務境界が `responsibility-boundary.md` に明文化されている | 未確認   | `outputs/phase-1/responsibility-boundary.md`                          |
| AC-002 | rapid click 再現テスト（TC-06 相当）が現行 UI 基準で定義・実装されている           | 未確認   | `outputs/phase-2/test-cases.md`, `outputs/phase-7/coverage-result.md` |
| AC-003 | rerender 回帰テスト（TC-07 相当）が現行 UI 基準で定義・実装されている              | 未確認   | `outputs/phase-2/test-cases.md`, `outputs/phase-7/coverage-result.md` |
| AC-004 | `onOpenSkillWizard` / `onOpenWizard` / `handleSessionStartNew` の非発火保証がある  | 未確認   | `outputs/phase-2/test-cases.md`, `outputs/phase-7/coverage-result.md` |
| AC-005 | 新規テストケースが CI で PASS する                                                 | 未確認   | `outputs/phase-9/quality-check-result.md`                             |
| AC-006 | traceability マトリクスが更新され保証点の対応が記録されている                      | 未確認   | `outputs/phase-7/traceability-matrix.md`                              |

3. 各 AC について「達成」「未達」「一部達成」のいずれかを記録する
4. 未達・一部達成の AC がある場合は原因を特定する

**期待される成果物**:

- `outputs/phase-10/final-review-result.md` の受入基準照合セクション

---

### タスク2: リリース準備チェックリストの確認

**目的**: PR 作成前に必要な全準備が整っているかを確認する

**実行手順**:

1. 以下のリリース準備チェックリストを記入する

**リリース準備チェックリスト**:

#### コード品質

- [ ] typecheck エラーゼロ（`outputs/phase-9/quality-check-result.md` 参照）
- [ ] lint エラーゼロ（`outputs/phase-9/quality-check-result.md` 参照）

#### テスト品質

- [ ] 対象テストファイルの全テストケースが PASS
- [ ] 既存テストへの回帰がない
- [ ] 旧 TC-06 / TC-07 が削除されている

#### ドキュメント

- [ ] Phase 8 リファクタリングサマリーが作成されている
- [ ] Phase 9 品質チェック結果が作成されている

#### 受入基準

- [ ] AC-001〜AC-006 が全て「達成」

2. 未達項目がある場合は原因と対処方針を記録する

**期待される成果物**:

- `outputs/phase-10/release-readiness-checklist.md`

---

### タスク3: 残課題の特定と unassigned-task/ への登録

**目的**: 未達・一部達成項目および将来課題を `unassigned-task/` へ登録する

**実行手順**:

1. 以下の観点で残課題を特定する
   - AC 未達項目（修正が必要なもの）
   - リファクタリング中に発見した技術的負債（Phase 8 の refactoring-summary.md を参照）
   - 今回のスコープ外だが将来対応が必要な auth-regression テストシナリオ
2. 各残課題について以下の形式で `docs/30-workflows/unassigned-task/` 配下に登録する

**残課題登録テンプレート**:

```markdown
# [課題タイトル]

## 概要

[課題の説明]

## 発見Phase

Phase 10（UT-LIFECYCLE-PANEL-AUTH-REGRESSION-COVERAGE-REALIGN-001）

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

### タスク3.5: MINOR 指摘の追跡表作成

**目的**: Phase 12 で追跡すべき MINOR 指摘を、残課題とは別に明示する

**実行手順**:

1. PASS ではないが即差し戻し不要の項目を `final-review-result.md` に表形式で記録する
2. 各指摘に「Phase 12 で解決」または「未タスク化」のどちらで閉じるかを記載する

**期待される成果物**:

- `outputs/phase-10/final-review-result.md` の MINOR 追跡セクション

---

### タスク4: 最終レビュー判定と Phase 11 進行承認

**目的**: 全照合結果を集約し、Phase 11（手動テスト）への進行可否を判定する

**実行手順**:

1. タスク1〜3の結果を集約する
2. 以下の判定基準に基づいて最終判定を行う

**判定基準**:

| 判定     | 条件                                                        | 次のアクション                |
| -------- | ----------------------------------------------------------- | ----------------------------- |
| PASS     | AC-001〜AC-006 が全て「達成」                               | Phase 11 へ進行               |
| MINOR    | 未達が 1 件以下かつ AC-002/003/005/006 を含まない           | 修正後に Phase 11 へ進行      |
| MAJOR    | 未達が 2 件以上、または AC-002/003/005/006 のいずれかが未達 | 未達 AC の原因 Phase へ戻る   |
| CRITICAL | 設計前提の崩壊、テスト対象定義の破綻                        | Phase 1〜3 へ戻りユーザー確認 |

**戻り先決定基準**:

| 問題の種類                                             | 戻り先     |
| ------------------------------------------------------ | ---------- |
| AC-001 未達（責務境界未確定）                          | Phase 1〜2 |
| AC-002/003 未達（rapid click / rerender テスト未追加） | Phase 4〜7 |
| AC-004 未達（非発火保証の欠落）                        | Phase 2〜7 |
| AC-005 未達（テスト FAIL）                             | Phase 6〜9 |
| AC-006 未達（traceability 不備）                       | Phase 7    |

3. 判定結果と根拠を `final-review-result.md` に記録する

**期待される成果物**:

- `outputs/phase-10/final-review-result.md` の最終判定セクション（判定結果・根拠・次アクション）

---

## 参照資料

| 参照資料                         | パス                                                                                 | 内容                          |
| -------------------------------- | ------------------------------------------------------------------------------------ | ----------------------------- |
| 受入基準（index.md）             | `docs/30-workflows/UT-LIFECYCLE-PANEL-AUTH-REGRESSION-COVERAGE-REALIGN-001/index.md` | AC-001〜AC-006 の定義         |
| Phase 7 カバレッジ結果           | `outputs/phase-7/coverage-result.md`                                                 | テストケース導入状況          |
| Phase 8 リファクタリングサマリー | `outputs/phase-8/refactoring-summary.md`                                             | Before / After / 理由テーブル |
| Phase 9 品質チェック結果         | `outputs/phase-9/quality-check-result.md`                                            | lint / typecheck / test 結果  |
| unassigned-task/                 | `docs/30-workflows/unassigned-task/`                                                 | 残課題登録先                  |

---

## 成果物

| 成果物                     | パス                                              | 内容                              |
| -------------------------- | ------------------------------------------------- | --------------------------------- |
| 最終レビュー結果           | `outputs/phase-10/final-review-result.md`         | AC 照合・残課題・最終判定         |
| リリース準備チェックリスト | `outputs/phase-10/release-readiness-checklist.md` | PR 作成前の準備確認チェックリスト |
| 残課題ファイル群           | `docs/30-workflows/unassigned-task/`（該当時）    | 登録された残課題                  |

---

## 統合テスト連携（Phase 1〜11は必須）

**Phase 10 の統合テスト連携アクション**:

- AC-001〜AC-006 の全照合により、auth-regression テストの責務再設計が完了していることを最終確認する
- Phase 9 の品質チェック結果（typecheck / lint / vitest run）を証跡として照合に使用する
- 最終判定が PASS / MINOR の場合にのみ Phase 11（手動テスト）へ進行する
- MAJOR / CRITICAL の場合は原因 Phase へ戻り、統合品質を担保してから再照合する

---

## 多角的チェック観点（AIが判断）

| 観点                    | チェック内容                                                                          |
| ----------------------- | ------------------------------------------------------------------------------------- |
| AC 照合の網羅性         | AC-001〜AC-006 を全て証跡付きで照合しているか（漏れがないか）                         |
| 責務境界の整合性        | Phase 1 の責務境界と Phase 2〜7 の設計・実装・traceability が一致しているか           |
| 新テストの実装確認      | rapid click / rerender 条件のテストケースが実際に `auth:login` 非発火を検証しているか |
| 残課題の登録漏れ        | 技術的負債・将来課題が全て unassigned-task/ に登録されているか                        |
| MINOR 追跡の明示性      | Phase 12 で閉じるべき MINOR 指摘が `final-review-result.md` に表形式で残るか          |
| 判定根拠の明示性        | 最終判定が「PASS/MINOR/MAJOR/CRITICAL」のいずれかで明示され、根拠が記録されているか   |
| Phase 11 進行の条件充足 | PASS / MINOR の場合のみ進行し、MINOR なら修正完了後に進行していることが確認できるか   |

---

## サブタスク管理

| サブタスクID | 内容                                   | ステータス |
| ------------ | -------------------------------------- | ---------- |
| ST-10-01     | AC-001〜AC-006 の照合マトリクス記入    | 未実施     |
| ST-10-02     | リリース準備チェックリスト確認         | 未実施     |
| ST-10-03     | 残課題特定と unassigned-task/ への登録 | 未実施     |
| ST-10-04     | 最終レビュー判定と Phase 11 進行承認   | 未実施     |

---

## 完了条件

- [ ] AC-001〜AC-006 の全受入基準が証跡付きで照合されている
- [ ] 未達・一部達成の AC について原因が特定されている
- [ ] 残課題が `docs/30-workflows/unassigned-task/` へ登録されている（課題がある場合）
- [ ] `outputs/phase-10/final-review-result.md` が生成されている
- [ ] `outputs/phase-10/release-readiness-checklist.md` が生成されている
- [ ] 最終判定が PASS / MINOR であり、Phase 11 への進行が承認されている

---

## タスク100%実行確認【必須】

- [ ] 本 Phase 内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 次Phase

完了後、以下のファイルを実行してください:

`docs/30-workflows/UT-LIFECYCLE-PANEL-AUTH-REGRESSION-COVERAGE-REALIGN-001/phase-11-manual-test.md`
