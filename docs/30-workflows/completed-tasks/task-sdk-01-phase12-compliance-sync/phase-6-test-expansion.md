# Phase 6: テスト拡充

## メタ情報

| 項目     | 値                                             |
| -------- | ---------------------------------------------- |
| Phase    | 6                                              |
| 機能名   | task-sdk-01-phase12-compliance-sync            |
| 作成日   | 2026-03-26                                     |
| タスクID | UT-IMP-TASK-SDK-01-PHASE12-COMPLIANCE-SYNC-001 |

## 目的

Phase 5 実装後に再発しやすい drift と blocker 重複を防ぐ追加確認を定義する。

## 実行タスク

- regression case 追加: summary と changelog の主張差分を検出する
- blocker reuse case 追加: `esbuild` blocker の重複起票を防ぐ
- repeatability case 追加: 同じ command を再実行しても同じ判定になる条件を定義する

## 参照資料

| 資料名                 | パス                                                                                              | 説明             |
| ---------------------- | ------------------------------------------------------------------------------------------------- | ---------------- |
| phase-5 implementation | `phase-5-implementation.md`                                                                       | 更新面           |
| file change plan       | `outputs/phase-5/file-change-plan.md`                                                             | 対象一覧         |
| lessons                | `.claude/skills/aiworkflow-requirements/references/lessons-learned-phase12-workflow-lifecycle.md` | blocker 重複防止 |

## 実行手順

### ステップ1: regression case を整理する

Phase 12 outputs 間の主張不一致と 4点同期不一致の検出ケースを追加する。

### ステップ2: blocker reuse case を整理する

既存 tracker を再利用する条件と新規 formalize 条件を分ける。

### ステップ3: repeatability を定義する

validator を連続実行しても current / baseline 判定が変わらない条件を整理する。

## 統合テスト連携

| 観点           | 実施内容                                          |
| -------------- | ------------------------------------------------- |
| outputs parity | summary / changelog / compliance-check の一致確認 |
| blocker reuse  | backlog 既存 task 検索の必須化                    |
| repeatability  | command の再実行で同値判定になる確認              |

## 多角的チェック観点

| 観点       | この Phase で確認する内容                |
| ---------- | ---------------------------------------- |
| 再発防止   | 既知 lessons が test case へ落ちているか |
| 論理一貫性 | current と baseline を混同していないか   |
| 省力化     | 同じ失敗を別名で起票しないか             |

## サブタスク管理

1. regression case 定義
2. blocker reuse case 定義
3. repeatability 定義
4. Phase 7 input 整理

## 成果物

| 成果物                    | パス                                           | 説明             |
| ------------------------- | ---------------------------------------------- | ---------------- |
| regression expansion plan | `outputs/phase-6/regression-expansion-plan.md` | 回帰観点         |
| blocker handling cases    | `outputs/phase-6/blocker-handling-cases.md`    | blocker 判定基準 |
| repeatability notes       | `outputs/phase-6/repeatability-notes.md`       | 再実行条件       |

## 完了条件

- [ ] regression case が定義されている
- [ ] blocker reuse case が定義されている
- [ ] repeatability 条件が定義されている
- [ ] **本Phase内の全タスクを100%実行完了**

## タスク100%実行確認【必須】

- [ ] Phase 5 を参照した
- [ ] lessons を参照した
- [ ] regression case を定義した
- [ ] repeatability 条件を定義した

## 次のPhase

Phase 7: カバレッジ確認
