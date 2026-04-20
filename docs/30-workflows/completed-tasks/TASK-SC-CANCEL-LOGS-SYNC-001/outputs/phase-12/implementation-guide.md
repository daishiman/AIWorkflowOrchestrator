---
phase: 12
task_id: TASK-SC-CANCEL-LOGS-SYNC-001
artifact: implementation-guide
created_date: 2026-04-20
status: completed
---

# Phase 12 成果物: 実装ガイド

## Part 1: 中学生レベルの説明

### なぜ必要か

親タスクで作った情報が、プロジェクトの正本ドキュメント全部に同時に反映されていないと、「完了したはずなのに別の台帳では未完了」といった食い違いが起きる。今回のタスクは、その食い違いをなくして「どこを見ても同じ状態」にそろえるために必要だった。

### 何をするか

このタスクでは、親タスクの完了を 5 種類の正本へ反映した。

1. `task-specification-creator/LOGS.md`
2. `aiworkflow-requirements/LOGS.md`
3. `task-workflow-active.md` / `task-workflow-completed-recent-2026-04g.md`
4. `lessons-learned-current-2026-04.md`
5. 親タスク `index.md`

さらに、本タスク自身の完了も両 LOGS と completed ledger に記録して、追跡が途中で切れないようにした。

### 日常の例え

たとえば、学校で「文化祭の仕事が終わった」という連絡を、教室の黒板、学級日誌、先生の連絡ノート、反省メモの全部に書く場面を想像すると分かりやすい。1 つでも書き忘れると、後から見た人が「まだ終わっていない」と勘違いする。本タスクは、その書き忘れをなくすためのまとめ書きにあたる。

### 今回作ったもの

- Phase 11 の grep スナップショット正本
- Phase 12 の実装ガイド、仕様更新サマリー、変更履歴、未タスク、スキルフィードバック、準拠チェック
- 親タスクと子タスクの完了をつなぐ close-out 記録

## Part 2: 開発者向け詳細

### 型定義

本タスクはドキュメント同期タスクであり、新規実装コードの型は追加していない。ただし、管理対象を説明するための型は以下のように表現できる。

```ts
type SyncTarget =
  | "task_spec_log"
  | "aiworkflow_log"
  | "completed_ledger"
  | "lessons_learned"
  | "parent_index"
  | "task_root_metadata";

interface SyncRecord {
  target: SyncTarget;
  status: "completed" | "blocked";
  evidence: string;
}
```

### APIシグネチャ

本タスクで public API / IPC / DB schema の変更はない。代わりに CLI コマンドと validation script を利用して整合を検証した。

### 使用例

```bash
OUT=docs/30-workflows/TASK-SC-CANCEL-LOGS-SYNC-001/outputs/phase-11/grep-snapshots
mkdir -p "$OUT"
grep -n "TASK-SC-CANCEL-CLEANUP-PARTIAL-DIR-001" .claude/skills/task-specification-creator/LOGS.md > "$OUT/tc-01-task-spec-creator-logs.txt"
grep -n "TASK-SC-CANCEL-CLEANUP-PARTIAL-DIR-001" .claude/skills/aiworkflow-requirements/LOGS.md > "$OUT/tc-02-aiworkflow-req-logs.txt"
grep -rn "TASK-SC-CANCEL-CLEANUP-PARTIAL-DIR-001" .claude/skills/aiworkflow-requirements/references/ > "$OUT/tc-03-task-workflow-references.txt"
grep -rEn "NON_VISUAL|scope.*境界|repo-wide sync" .claude/skills/aiworkflow-requirements/references/lessons-learned*.md > "$OUT/tc-04-lessons-learned.txt"
grep -nE "Phase 12.*completed|status:.*pending_pr" docs/30-workflows/TASK-SC-CANCEL-CLEANUP-PARTIAL-DIR-001/index.md > "$OUT/tc-05-parent-index.txt"
```

### エラーハンドリング

- grep 結果が 0 件なら FAIL とし、Phase 5 の追記漏れを疑う
- completed ledger / LOGS / 親 `index.md` のどれか 1 つでも stale なら close-out 完了を宣言しない
- `.claude` 修正後に `.agents` mirror と `diff -qr` で parity 0 を確認する

### エッジケース

| ケース                              | リスク                           | 対応                                                 |
| ----------------------------------- | -------------------------------- | ---------------------------------------------------- |
| LOGS の見出し形式差分               | skill ごとに `-` と `—` が異なる | Phase 4 fixture に合わせて追記                       |
| 親タスクは完了、子タスクは pending  | completed/pending の二重管理崩れ | 親子 `index.md` と `artifacts.json` を同 wave で同期 |
| NON_VISUAL なのに screenshot を探す | false negative                   | Phase 11 で grep スナップショットを一次ソース化      |

### 設定項目と定数一覧

| 項目              | 値 / ルール                                                  |
| ----------------- | ------------------------------------------------------------ |
| taskType          | `NON_VISUAL`                                                 |
| closeout date     | `2026-04-20`                                                 |
| evidence source   | `outputs/phase-11/manual-test-result.md`                     |
| mirror rule       | `.claude` を canonical、`.agents` を mirror として最後に同期 |
| phase status rule | Phase 1-12 `completed`、Phase 13 `blocked`                   |

### テスト構成

| テスト | 内容                                 | 判定 |
| ------ | ------------------------------------ | ---- |
| TC-01  | task-specification-creator LOGS 追記 | PASS |
| TC-02  | aiworkflow-requirements LOGS 追記    | PASS |
| TC-03  | task-workflow / lessons 反映         | PASS |
| TC-04  | 3 知見反映                           | PASS |
| TC-05  | 親 `index.md` 完了宣言               | PASS |

### 追記実行ガイド

| Lane   | 対象                                 | 実施内容                                                  |
| ------ | ------------------------------------ | --------------------------------------------------------- |
| Lane A | 両 LOGS / 両 SKILL                   | 親タスク close-out と本タスク self-close-out を追記       |
| Lane B | completed ledger / lessons / indexes | 親タスク・本タスクの completed 記録、3 知見、index 再生成 |
| Lane C | 親 `index.md` / 子 task root         | status、current_phase、Phase 一覧、artifacts を同期       |

### 親タスク完了宣言ガイド

- 親タスクは `status: pending_pr`、`current_phase: 13` を維持
- 親 Phase 12 行は `completed`
- 子タスクも同じく Phase 1-12 完了、Phase 13 blocked として台帳を閉じる

## 視覚証跡

UI/UX変更なしのため Phase 11 スクリーンショット不要

- 代替証跡 1: [../phase-10/final-review-result.md](../phase-10/final-review-result.md)
- 代替証跡 2: [../phase-11/manual-test-result.md](../phase-11/manual-test-result.md)
- grep スナップショット: `outputs/phase-11/grep-snapshots/tc-01`〜`tc-05`

## 参照資料

- [../phase-1/requirements-definition.md](../phase-1/requirements-definition.md)
- [../phase-2/sync-design.md](../phase-2/sync-design.md)
- [../phase-5/sync-execution-log.md](../phase-5/sync-execution-log.md)
- [../phase-11/manual-test-result.md](../phase-11/manual-test-result.md)
- [../../phase-12-documentation.md](../../phase-12-documentation.md)
