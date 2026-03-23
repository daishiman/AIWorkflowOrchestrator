# Phase 9: 品質保証

## メタ情報

| 項目   | 値                                   |
| ------ | ------------------------------------ |
| Phase  | 9                                    |
| 機能名 | guided-execution-console-realization |
| 作成日 | 2026-03-23                           |

## 目的

Phase 5 の実装順を基点に、親パック全体の品質チェックとリスク登録を行う。

## 実行タスク

- quality checklist 作成: root と Task01-03 の必須チェック項目を定義する
- risk register 作成: 実行順の崩れ、compliance、naming drift のリスクを列挙する
- release blocker 定義: user confusion、silent fallback、manual boundary 破りを blocker とする

## 参照資料

| 資料名         | パス                                                                                        | 説明          |
| -------------- | ------------------------------------------------------------------------------------------- | ------------- |
| Phase 5        | `phase-5-implementation.md`                                                                 | 実装順の前提  |
| Task01 Phase 9 | `tasks/step-01-seq-task-01-guided-execution-shell-foundation/phase-9-quality-assurance.md`  | foundation QA |
| Task02 Phase 9 | `tasks/step-02-seq-task-02-session-dock-artifact-bridge/phase-9-quality-assurance.md`       | session QA    |
| Task03 Phase 9 | `tasks/step-03-seq-task-03-advanced-console-safety-governance/phase-9-quality-assurance.md` | safety QA     |
| design audit   | `design-audit-matrix.md`                                                                    | 監査軸        |

## 実行手順

### ステップ1: child QA 観点を集約する

Task01-03 の品質観点を root checklist に束ねる。

### ステップ2: release blocker を決める

一般ユーザーが誤解しやすい表示、manual share 境界の破れ、規約説明の不足を blocker に設定する。

### ステップ3: リスクの所有者を決める

各リスクを Task01-03 のいずれかへ割り当て、root で追跡できるようにする。

## 統合テスト連携

root QA では UI confusion と compliance drift を child task の証跡と結びつけて追跡する。

## 成果物

| 成果物            | パス                                   | 説明              |
| ----------------- | -------------------------------------- | ----------------- |
| quality checklist | `outputs/phase-9/quality-checklist.md` | root 品質確認項目 |
| risk register     | `outputs/phase-9/risk-register.md`     | root リスク一覧   |

## 完了条件

- [ ] root quality checklist に Task01-03 の観点が集約されている
- [ ] release blocker が 3 件以上定義されている
- [ ] リスクの ownership が task 単位で明記されている
- [ ] **本Phase内の全タスクを100%実行完了**

## 次のPhase

- [Phase 10（最終レビュー）](./phase-10-final-review.md)
