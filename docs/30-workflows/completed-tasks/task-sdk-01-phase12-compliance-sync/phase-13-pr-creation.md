# Phase 13: PR作成

## メタ情報

| 項目     | 値                                             |
| -------- | ---------------------------------------------- |
| Phase    | 13                                             |
| 機能名   | task-sdk-01-phase12-compliance-sync            |
| 作成日   | 2026-03-26                                     |
| タスクID | UT-IMP-TASK-SDK-01-PHASE12-COMPLIANCE-SYNC-001 |

## 目的

ユーザーが明示した時だけ PR preparation を行える状態を保持する。

## 実行タスク

- blocked 理由記録: commit、PR、push を行わない理由を残す
- PR input 整理: 変更対象、validator 結果、残リスクを整理する
- 実行条件固定: ユーザー明示指示が来た時の着手条件を記録する

## 参照資料

| 資料名                    | パス                           | 説明           |
| ------------------------- | ------------------------------ | -------------- |
| phase-1 requirements      | `phase-1-requirements.md`      | 禁止アクション |
| phase-2 design            | `phase-2-design.md`            | 実行順         |
| phase-5 implementation    | `phase-5-implementation.md`    | 更新面         |
| phase-6 test expansion    | `phase-6-test-expansion.md`    | regression     |
| phase-7 coverage check    | `phase-7-coverage-check.md`    | coverage       |
| phase-8 refactoring       | `phase-8-refactoring.md`       | wording        |
| phase-9 quality assurance | `phase-9-quality-assurance.md` | audit          |
| phase-10 final review     | `phase-10-final-review.md`     | gate           |
| phase-11 manual test      | `phase-11-manual-test.md`      | human review   |
| phase-12 documentation    | `phase-12-documentation.md`    | close-out      |

## 実行手順

### ステップ1: blocked 理由を維持する

ユーザー指示が来るまで commit、PR、push を行わない。

### ステップ2: PR input を整理する

差分、validator 結果、残リスクを `pr-preparation.md` に整理する。

### ステップ3: 実行条件を明記する

ユーザー明示指示が来た時だけ Phase 13 を `in_progress` へ変える。

## 統合テスト連携

| 観点          | 実施内容                                 |
| ------------- | ---------------------------------------- |
| blocked state | status が維持されるか                    |
| inputs        | PR input が揃っているか                  |
| guard         | ユーザー明示指示の条件が明記されているか |

## 多角的チェック観点

| 観点       | この Phase で確認する内容       |
| ---------- | ------------------------------- |
| ガバナンス | 禁止アクションが破られないか    |
| 明確性     | Phase 13 の開始条件が一意か     |
| 監査性     | PR を作らない理由が文書に残るか |

## サブタスク管理

1. blocked 理由記録
2. PR input 整理
3. 実行条件固定

## 成果物

| 成果物         | パス                                 | 説明               |
| -------------- | ------------------------------------ | ------------------ |
| pr preparation | `outputs/phase-13/pr-preparation.md` | 差分と gate の要約 |

## 完了条件

- [ ] blocked 理由が記録されている
- [ ] PR input が整理されている
- [ ] ユーザー明示指示が開始条件として記録されている
- [ ] **本Phase内の全タスクを100%実行完了**

## タスク100%実行確認【必須】

- [ ] Phase 1 を参照した
- [ ] Phase 2 を参照した
- [ ] Phase 5 を参照した
- [ ] Phase 6 を参照した
- [ ] Phase 7 を参照した
- [ ] Phase 8 を参照した
- [ ] Phase 9 を参照した
- [ ] Phase 10 を参照した
- [ ] Phase 11 を参照した
- [ ] Phase 12 を参照した

## 次のPhase

ユーザー明示指示後に実行
