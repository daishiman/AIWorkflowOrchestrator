# TASK-UI-04 実装ガイド

## Part 1: 中学生レベルの概念説明

### 仕様書のステータスとは何か

仕様書のステータスは、「この作業が今どこまで進んでいるか」を一目で分かる札です。
これがないと、終わった作業をまだ残っていると勘違いしたり、逆にまだ終わっていない作業を終わったと見落としたりします。

#### なぜ必要か

今回の TASK-UI-04 は、コードではなく仕様書の記録を直す作業です。
なぜ必要かというと、記録が古いままだと、開発者が「まだやることがある」と誤解してしまうからです。
誤解が続くと、余計な確認や重複作業が増えて、チーム全体の時間が無駄になります。

#### たとえば

たとえば、図書室の貸出カードに「未返却」と書いてあるのに、本はすでに返っていたら、係の人はまた確認しに行きます。
実物とカードがズレていると、無駄な動きが増えます。
仕様書のステータスも同じで、現実と一致していないと混乱のもとになります。

### 今回作ったもの

| 何を作ったか                      | 役割                                                           |
| --------------------------------- | -------------------------------------------------------------- |
| `artifacts.json` の status 正規化 | 8件の P0 タスクの状態を実態に合わせるための正本台帳            |
| `index.md` の状態更新             | workflow の入口で最新状態を読めるようにするための案内板        |
| `outputs/artifacts.json`          | root 台帳の mirror。二重管理のズレを見つけやすくするための複写 |
| `outputs/phase-12/*`              | 更新内容の記録、確認結果、未タスク有無、スキル改善案の保存先   |

#### この機能でできること

| できること         | 説明                                                                       |
| ------------------ | -------------------------------------------------------------------------- |
| 現在地を正しく示す | `spec_created` や `in_progress` のまま残っていた状態を、実態に合わせて直す |
| 迷いを減らす       | どのタスクが完了済みかを、仕様書を開いた瞬間に判断しやすくする             |
| mirror をそろえる  | root と `outputs/` の台帳を同じ内容にして、片側だけ古い問題を防ぐ          |
| 後続作業を止めない | Phase 13 は `blocked` のままにして、ユーザーの指示待ち状態を明確にする     |

#### 何をするか

1. 仕様書の状態を読む。
2. 実装状態と比べる。
3. ズレている部分だけを直す。
4. root 台帳と `outputs/` 台帳をそろえる。
5. 直した内容を記録する。

---

## Part 2: 技術詳細

### current contract

| 対象       | 現在の扱い                       |
| ---------- | -------------------------------- |
| TASK-P0-01 | 完了済み                         |
| TASK-P0-02 | 完了済み                         |
| TASK-P0-04 | 完了済み                         |
| TASK-P0-05 | 完了済み                         |
| TASK-P0-06 | 完了済み                         |
| TASK-P0-07 | 完了済み                         |
| TASK-P0-08 | 完了済み                         |
| TASK-P0-09 | 完了済み                         |
| Phase 13   | `blocked`（PR はユーザー承認後） |

### target delta

| 対象                     | 変更内容                                                             |
| ------------------------ | -------------------------------------------------------------------- |
| root `artifacts.json`    | `phase12_completed` に正規化し、Phase 13 を `blocked` に統一         |
| root `index.md`          | 入口のステータス表示を `phase12_completed（Phase 13 未実施）` に更新 |
| `phase-1`〜`phase-12`    | メタ情報のステータスを `completed` に更新                            |
| `outputs/artifacts.json` | root と同内容で mirror を作成                                        |
| `outputs/phase-12/*`     | 実施記録を current facts に合わせて補強                              |

### TypeScript 型定義

```typescript
type WorkflowStatus =
  | "spec_created"
  | "in_progress"
  | "completed"
  | "phase12_completed"
  | "blocked";

interface StatusSyncTarget {
  taskId: string;
  rootStatus: WorkflowStatus;
  phase13Status: "pending" | "blocked";
  rootPath: string;
  mirrorPath: string;
}

interface ValidationResult {
  ok: boolean;
  missingFiles: string[];
  staleStatuses: string[];
}
```

### CLIシグネチャ

```bash
node .agents/skills/task-specification-creator/scripts/complete-phase.js \
  --workflow docs/30-workflows/step-13-seq-task-ui-04-spec-status-drift-correction \
  --phase 12 \
  --artifacts "outputs/phase-12/implementation-guide.md:実装ガイド,outputs/phase-12/system-spec-update-summary.md:システム仕様更新サマリー,outputs/phase-12/documentation-changelog.md:ドキュメント更新履歴,outputs/phase-12/unassigned-task-detection.md:未タスク検出,outputs/phase-12/skill-feedback-report.md:スキルフィードバック,outputs/phase-12/phase12-task-spec-compliance-check.md:準拠チェック"

node .agents/skills/task-specification-creator/scripts/generate-index.js \
  --workflow docs/30-workflows/step-13-seq-task-ui-04-spec-status-drift-correction \
  --regenerate
```

### 使用例

```bash
# 1. Phase 12 の成果物を確認する
ls docs/30-workflows/step-13-seq-task-ui-04-spec-status-drift-correction/outputs/phase-12

# 2. root と mirror の台帳が同じかを見る
diff -u \
  docs/30-workflows/step-13-seq-task-ui-04-spec-status-drift-correction/artifacts.json \
  docs/30-workflows/step-13-seq-task-ui-04-spec-status-drift-correction/outputs/artifacts.json

# 3. 仕様書の状態を確認する
rg -n '"status":|"ステータス"' \
  docs/30-workflows/step-13-seq-task-ui-04-spec-status-drift-correction
```

### エラーハンドリング

- `phase_12_completed` のような非標準値は、標準値に正規化する。
- `outputs/artifacts.json` が存在しない場合は、root と同内容で新規作成する。
- `index.md` が root `artifacts.json` と食い違う場合は、入口側を正本に合わせる。
- Phase 13 がまだ実施されない場合は、`completed` に上げず `blocked` のままにする。

### エッジケース

- 仕様書は全部完了しているが、Phase 13 はユーザー承認待ちのまま。
- UI の変更はないので、スクリーンショットは対象外。
- `verify-unassigned-links.js` が baseline の欠落を検出しても、TASK-UI-04 の今回差分とは切り分ける。
- root と mirror の差分がないことを確認してから Phase 12 完了とみなす。

### 設定項目と定数一覧

| 項目                | 値                                                                                             | 意味               |
| ------------------- | ---------------------------------------------------------------------------------------------- | ------------------ |
| `spec_created`      | 仕様書作成済み                                                                                 | 実装前             |
| `in_progress`       | 実行中                                                                                         | 作業中             |
| `completed`         | 完了                                                                                           | 仕様と実態が一致   |
| `phase12_completed` | Phase 12 完了                                                                                  | Phase 13 未実施    |
| `blocked`           | ユーザー指示待ち                                                                               | PR はまだ出さない  |
| root path           | `docs/30-workflows/step-13-seq-task-ui-04-spec-status-drift-correction`                        | 本 workflow の正本 |
| mirror path         | `docs/30-workflows/step-13-seq-task-ui-04-spec-status-drift-correction/outputs/artifacts.json` | 台帳の複写         |

### テスト構成

- `node .agents/skills/task-specification-creator/scripts/validate-phase12-implementation-guide.js --workflow docs/30-workflows/step-13-seq-task-ui-04-spec-status-drift-correction --json`
- `diff -u artifacts.json outputs/artifacts.json`
- `rg -n "pending|spec_created|in_progress" docs/30-workflows/step-13-seq-task-ui-04-spec-status-drift-correction`
- `rg -n "計画|予定|TODO|future|保留" outputs/phase-12/*.md`

### current facts と target delta の境界

- current facts: 8件の P0 タスクは実装済みで、Phase 12 の記録だけがズレていた。
- target delta: root 台帳、mirror 台帳、index、phase 本文、Phase 12 出力を同じ current facts にそろえる。
- no-op: API、interface、state、security、UI contract の変更はない。
