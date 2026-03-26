# Phase 7: カバレッジ確認

## メタ情報

| 項目     | 値                                             |
| -------- | ---------------------------------------------- |
| Phase    | 7                                              |
| 機能名   | task-sdk-01-phase12-compliance-sync            |
| 作成日   | 2026-03-26                                     |
| タスクID | UT-IMP-TASK-SDK-01-PHASE12-COMPLIANCE-SYNC-001 |

## 目的

受入基準、対象ファイル、validator、ledger sync が全て coverage されているかを確認する。

## 実行タスク

- coverage matrix 作成: AC と対象ファイルの対応表を作る
- evidence traceability 作成: command と出力先の対応表を作る
- uncovered risk 抽出: coverage 外の論点を洗い出す

## 参照資料

| 資料名                 | パス                                   | 説明         |
| ---------------------- | -------------------------------------- | ------------ |
| phase-5 implementation | `phase-5-implementation.md`            | 変更面       |
| phase-6 test expansion | `phase-6-test-expansion.md`            | 追加観点     |
| Phase 1                | `phase-1-requirements.md`              | AC 一覧      |
| coverage inputs        | `outputs/phase-2/validation-matrix.md` | command 一覧 |

## 実行手順

### ステップ1: AC coverage を作る

AC-1 から AC-5 を file / command / ledger に割り当てる。

### ステップ2: evidence traceability を作る

どの command の結果をどの output または summary に転記するかを整理する。

### ステップ3: uncovered risk を記録する

現時点で command では拾えない review point を列挙する。

## 統合テスト連携

| 観点        | 実施内容                   |
| ----------- | -------------------------- |
| AC coverage | AC と command の対応確認   |
| evidence    | command と出力先の対応確認 |
| risk        | coverage 外の論点の記録    |

## 多角的チェック観点

| 観点       | この Phase で確認する内容              |
| ---------- | -------------------------------------- |
| 網羅性     | AC に未対応の file や command がないか |
| 証跡性     | 結果の転記先が曖昧になっていないか     |
| リスク認識 | coverage 外の論点を無視していないか    |

## サブタスク管理

1. AC coverage 作成
2. evidence traceability 作成
3. uncovered risk 抽出
4. Phase 8 input 整理

## 成果物

| 成果物                | パス                                       | 説明              |
| --------------------- | ------------------------------------------ | ----------------- |
| coverage matrix       | `outputs/phase-7/coverage-matrix.md`       | AC 対応表         |
| evidence traceability | `outputs/phase-7/evidence-traceability.md` | 証跡対応表        |
| uncovered risks       | `outputs/phase-7/uncovered-risks.md`       | coverage 外の論点 |

## 完了条件

- [ ] AC coverage が作成されている
- [ ] evidence traceability が作成されている
- [ ] uncovered risk が記録されている
- [ ] **本Phase内の全タスクを100%実行完了**

## タスク100%実行確認【必須】

- [ ] Phase 5 を参照した
- [ ] Phase 6 を参照した
- [ ] AC coverage を作成した
- [ ] uncovered risk を記録した

## 次のPhase

Phase 8: リファクタリング
