# Phase 12 Output: Implementation Guide

## Part 1: 中学生向け説明

### なぜ必要か

この作業は、分厚すぎて読みにくくなった説明書を、迷わず探せる形に直すために必要だった。1冊に全部を詰め込むと、あとから読む人が「どこに何があるか」を見失いやすい。Phase 12 では、分けた結果が本当に使える形で残っているか、説明書本体と記録台帳の両方をそろえて確認した。

### たとえばどういうことか

たとえば、学校の図書室で全教科のプリントが1冊の巨大ファイルにまとめられていたら、国語だけ探したい人も理科だけ探したい人も毎回最初からめくらないといけない。そこで「目次の冊子」と「教科ごとの冊子」に分けると探しやすくなる。今回やった manual docs reform は、この図書室の整理に近い。

### 何をしたか

- manual docs 34件を parent index + child companion に分割し、入口導線をそろえた
- `.claude/skills/aiworkflow-requirements/` を正本、`.agents/skills/aiworkflow-requirements/` を mirror として同期した
- `topic-map.md` は自動生成物なので今タスクでは無理に手書き修正せず、follow-up の未タスクへ切り出した
- Phase 12 では outputs、system spec、未タスク、validator 結果を同じ値で記録し直した

## Part 2: 技術者向け実装要約

### 何を固定したか

- manual over-limit Markdown 34件を family split で再編した
- ledger 系の `LOGS` / `task-workflow` / `lessons-learned` は archive と companion を使って責務分離した
- generated artifact は `generate-index.js` 再生成を正とし、manual docs gate と分離して扱った
- Phase 12 再監査では `implementation-guide`、`system-spec-update-summary`、`documentation-changelog`、`unassigned-task-detection`、`skill-feedback-report` を root evidence として再構成した

### 型定義

```ts
type WorkflowStatus = "completed" | "blocked" | "in_progress";

interface ManualDocFamily {
  parent: string;
  children: string[];
  maxManualLines: number;
  mirrorRoot: ".claude" | ".agents";
}

interface GeneratedIndexFollowUp {
  file: "indexes/topic-map.md";
  lineCount: number;
  resolution: "follow-up-unassigned-task";
  taskId: "TASK-IMP-AIWORKFLOW-REQUIREMENTS-GENERATED-INDEX-SHARDING-001";
}

interface Phase12ComplianceSnapshot {
  workflowStatus: WorkflowStatus;
  currentPhase: 13;
  verifyUnassignedLinksSource: string;
  currentViolations: number;
  baselineViolations: number;
}
```

### CLIシグネチャ

```bash
node .claude/skills/aiworkflow-requirements/scripts/generate-index.js
node .claude/skills/task-specification-creator/scripts/verify-all-specs.js --workflow docs/30-workflows/completed-tasks/aiworkflow-requirements-line-budget-reform
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/completed-tasks/aiworkflow-requirements-line-budget-reform
node .claude/skills/task-specification-creator/scripts/validate-phase12-implementation-guide.js --workflow docs/30-workflows/completed-tasks/aiworkflow-requirements-line-budget-reform
node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js --source .claude/skills/aiworkflow-requirements/references/task-workflow.md
node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js --json --diff-from HEAD --target-file docs/30-workflows/unassigned-task/task-imp-aiworkflow-requirements-generated-index-sharding-001.md
```

### 使用例

```bash
# 1. workflow の Phase 出力と仕様書状態をまとめて検証する
node .claude/skills/task-specification-creator/scripts/verify-all-specs.js \
  --workflow docs/30-workflows/completed-tasks/aiworkflow-requirements-line-budget-reform

# 2. split parent を渡して backlog / completed shard まで含めて unassigned link を監査する
node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js \
  --source .claude/skills/aiworkflow-requirements/references/task-workflow.md

# 3. 今回追加した active unassigned task だけを current 判定する
node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js \
  --json \
  --diff-from HEAD \
  --target-file docs/30-workflows/unassigned-task/task-imp-aiworkflow-requirements-generated-index-sharding-001.md
```

### エラーハンドリング

- `verify-unassigned-links` は link 実在性しか見ないため、Phase 12 成果物欠落は `validate-phase-output` と分離して確認する
- `audit-unassigned-tasks` は `currentViolations` を今回差分の合否、`baselineViolations` を既存負債の参考値として読む
- schema drift があると `validate-schema.js` が false negative を出すため、`artifact-definition.json` は current workflow 実体に追従させる

### エッジケース

- `task-workflow.md` 親ファイルだけを見ると split 後の backlog shard にある未タスクリンクを取りこぼす
- docs-only task でも user が branch screenshot を明示要求した場合は Phase 11 evidence を N/A にせず取得する
- manual docs は 500行以下でも generated `topic-map.md` は再生成後に再肥大化するため、同じ gate で合否判定しない

### 設定項目と定数

| 項目                    | 値                                                              | 役割                          |
| ----------------------- | --------------------------------------------------------------- | ----------------------------- |
| manual line budget      | `500`                                                           | manual docs reform の合格基準 |
| workflow `currentPhase` | `13`                                                            | Phase 12 完了後の branch 状態 |
| generated blocker file  | `indexes/topic-map.md`                                          | follow-up 切り出し対象        |
| follow-up task          | `TASK-IMP-AIWORKFLOW-REQUIREMENTS-GENERATED-INDEX-SHARDING-001` | generator-aware 恒久対応      |
| canonical root          | `.claude/skills/aiworkflow-requirements/`                       | system spec 正本              |
| mirror root             | `.agents/skills/aiworkflow-requirements/`                       | parity 検証対象               |

### 現時点の結論

- manual docs reform 自体は完了している
- Phase 12 は task spec 準拠へ再補強した
- 残ブロッカーは generated `topic-map.md` のみで、active unassigned task に切り出し済み
