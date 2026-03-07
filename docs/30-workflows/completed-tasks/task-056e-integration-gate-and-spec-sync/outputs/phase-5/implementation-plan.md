# Phase 5 実装計画

## 実装対象

| 成果物                   | 担当             | 入力                                | 出力                   |
| ------------------------ | ---------------- | ----------------------------------- | ---------------------- |
| `review-gate.md`         | SubAgent-E1 / E4 | Phase 2 gate design, Phase 3 review | 統合判定表             |
| `spec-sync-targets.md`   | SubAgent-E2      | Phase 2 sync matrix                 | 更新対象一覧           |
| `implementation-plan.md` | SubAgent-E3      | Phase 4 test spec                   | 実行順序と検証コマンド |

## 実施順序

1. 上流正本と aiworkflow 正本の引用箇所を固定する。
2. `review-gate.md` に 5軸の判定条件と戻り先を転記する。
3. `spec-sync-targets.md` に Step 1-A/1-B/1-C/2 の更新先を整理する。
4. downstream 3タスクの unblock 条件を `review-gate.md` に埋め込む。
5. Phase 6/7 で再利用する検証コマンドを列挙する。

## 検証コマンド

```bash
rg -n "state|ipc|security|navigation|documentation" docs/30-workflows/completed-tasks/task-056e-integration-gate-and-spec-sync/outputs/phase-5/review-gate.md
rg -n "常時更新|条件付き更新|更新不要" docs/30-workflows/completed-tasks/task-056e-integration-gate-and-spec-sync/outputs/phase-5/spec-sync-targets.md
rg -n "TASK-UI-02|TASK-UI-03|TASK-UI-04A" docs/30-workflows/completed-tasks/task-056e-integration-gate-and-spec-sync/outputs/phase-5/review-gate.md
```

## 上流引用ルール

| 領域           | 引用元                                                          |
| -------------- | --------------------------------------------------------------- |
| state          | A 正本, C 正本, D 正本                                          |
| ipc / security | B 正本, C 正本                                                  |
| navigation     | D 正本, `TASK-UI-02` 正本                                       |
| documentation  | `task-workflow.md`, `lessons-learned.md`, current workflow docs |
