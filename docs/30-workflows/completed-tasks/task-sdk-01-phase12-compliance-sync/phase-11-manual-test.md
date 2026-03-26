# Phase 11: 手動テスト

## メタ情報

| 項目     | 値                                             |
| -------- | ---------------------------------------------- |
| Phase    | 11                                             |
| 機能名   | task-sdk-01-phase12-compliance-sync            |
| 作成日   | 2026-03-26                                     |
| タスクID | UT-IMP-TASK-SDK-01-PHASE12-COMPLIANCE-SYNC-001 |

## 目的

docs-only task として、文書導線と validator 出力の読み取りを人手で再確認する。

## 実行タスク

- manual checklist 実行: 親 workflow と backlog 導線を確認する
- manual result 記録: non-visual review の結果を記録する
- discovered issue 記録: command では拾いづらい違和感を記録する

## 参照資料

| 資料名                    | パス                           | 説明          |
| ------------------------- | ------------------------------ | ------------- |
| phase-1 requirements      | `phase-1-requirements.md`      | AC            |
| phase-2 design            | `phase-2-design.md`            | topology      |
| phase-5 implementation    | `phase-5-implementation.md`    | 更新面        |
| phase-6 test expansion    | `phase-6-test-expansion.md`    | blocker reuse |
| phase-7 coverage check    | `phase-7-coverage-check.md`    | coverage      |
| phase-8 refactoring       | `phase-8-refactoring.md`       | wording       |
| phase-9 quality assurance | `phase-9-quality-assurance.md` | checklist     |
| phase-10 final review     | `phase-10-final-review.md`     | gate          |

## 実行手順

### ステップ1: manual checklist を実行する

親 workflow の各 path、backlog 行、completed ledger 行、unassigned-task path を目視で辿る。

### ステップ2: manual result を記録する

non-visual review として、読んだ順序、確認した path、気づいた差分を記録する。

### ステップ3: discovered issue を記録する

validator では error にならないが混乱を生む表現や導線を記録する。

## 統合テスト連携

| 観点             | 実施内容                                                |
| ---------------- | ------------------------------------------------------- |
| path walkthrough | path を手で辿って導線を確認する                         |
| reading order    | summary と changelog の読み順が破綻していないか確認する |
| human audit      | 機械検証だけでは見えない違和感を抽出する                |

## 多角的チェック観点

| 観点       | この Phase で確認する内容                 |
| ---------- | ----------------------------------------- |
| 人間可読性 | 監査者が 1 回で追跡できるか               |
| 導線確認   | backlog と unassigned-task の接続が自然か |
| 監査補完   | 機械検証の外側に残る違和感がないか        |

## サブタスク管理

1. manual checklist 実行
2. manual result 記録
3. discovered issue 記録
4. Phase 12 input 整理

## 成果物

| 成果物                | パス                                        | 説明                   |
| --------------------- | ------------------------------------------- | ---------------------- |
| manual test checklist | `outputs/phase-11/manual-test-checklist.md` | 人手確認項目           |
| manual test result    | `outputs/phase-11/manual-test-result.md`    | non-visual review 結果 |

## 完了条件

- [ ] manual checklist が実行されている
- [ ] manual result が記録されている
- [ ] discovered issue の有無が記録されている
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

## 次のPhase

Phase 12: ドキュメント更新
