# Phase 12: ドキュメント更新

## メタ情報

| 項目       | 内容             |
| ---------- | ---------------- |
| タスクID   | TASK-P0-04       |
| Phase      | 12               |
| Phase名    | ドキュメント更新 |
| ステータス | completed        |
| 前提Phase  | Phase 11         |
| 後続Phase  | Phase 13         |

## 目的

workflow root 構造と Phase 12 必須成果物を same-wave で揃え、仕様書に書いた内容を原則この task package 内で閉じる。

## 実行タスク

- implementation guide を追加する
- system spec update summary を追加する
- changelog / unassigned / feedback / compliance-check を揃える
- 未タスクは重大かつ危険な課題だけに限定し、単純な未実行項目は残さない

## 参照資料

| 資料                                                     | 用途         |
| -------------------------------------------------------- | ------------ |
| `phase-2-design.md`                                      | 設計整合     |
| `phase-5-implementation.md`                              | 実装整合     |
| `phase-6-test-expansion.md`                              | テスト整合   |
| `phase-7-coverage-check.md`                              | coverage整合 |
| `phase-8-refactoring.md`                                 | refactor整合 |
| `phase-9-quality-assurance.md`                           | quality整合  |
| `phase-10-final-review.md`                               | 最終判定整合 |
| `outputs/phase-12/implementation-guide.md`               | Task 12-1    |
| `outputs/phase-12/system-spec-update-summary.md`         | Task 12-2    |
| `outputs/phase-12/documentation-changelog.md`            | Task 12-3    |
| `outputs/phase-12/unassigned-task-detection.md`          | Task 12-4    |
| `outputs/phase-12/skill-feedback-report.md`              | Task 12-5    |
| `outputs/phase-12/phase12-task-spec-compliance-check.md` | 最終確認     |

## 成果物

- `outputs/phase-12/implementation-guide.md`
- `outputs/phase-12/system-spec-update-summary.md`
- `outputs/phase-12/documentation-changelog.md`
- `outputs/phase-12/unassigned-task-detection.md`
- `outputs/phase-12/skill-feedback-report.md`
- `outputs/phase-12/phase12-task-spec-compliance-check.md`

## 完了条件

- [x] 必須6ファイルが揃う
- [x] `outputs/artifacts.json` が root と一致する
- [x] 未タスク化の閾値を「重大かつ危険な課題のみ」に固定した
