# Implementation Guide

## Part 1: はじめて読む人向け

### なぜこの親 workflow が必要か

04A、04B、04C はそれぞれ別の仕事を持っています。ところが、入口になる紙が1枚にまとまっていないと、「どこから読めばいいか」「どれが本物の置き場所か」で毎回迷います。たとえば、学校の図書室で本の置き場所は決まっているのに、案内板だけ古いまま残っていて別の棚を指している状態に近いです。まず必要なのは、本を増やすことではなく、案内板を正しい棚に向け直すことです。

### 何をするか

この parent workflow は、新しい UI を作るのではなく、案内板を整理します。

- 04A はレイアウト担当
- 04B はチャット担当
- 04C はプレビュー担当

親 workflow は「この3つがどこにあるか」「どの順で読むか」「あとでどの仕様書にも記録するか」だけを持ちます。

### どこが便利になるか

- 迷わず child workflow に到達できる
- 古い path を踏みにくくなる
- 画面確認の証拠を parent 側で取り直さなくて済む

### 画面確認はどう扱うか

今回は親 workflow 自体に新しい画面はありません。なので、新しく写真を撮る代わりに、04A / 04B / 04C がすでに持っている画面証拠を「ちゃんと見に行けるか」を確認します。

## Part 2: 開発者向け詳細

### 目的

`TASK-UI-04-WORKSPACE-VIEW` を docs-only の親参照仕様として完了させ、pointer / dependency / canonical path / evidence inheritance / system spec sync を管理する。

### TypeScript 型定義

```ts
type ChildWorkflowId =
  | "TASK-UI-04A-WORKSPACE-LAYOUT"
  | "TASK-UI-04B-WORKSPACE-CHAT"
  | "TASK-UI-04C-WORKSPACE-PREVIEW";

interface ChildWorkflowRecord {
  id: ChildWorkflowId;
  canonicalPath: string;
  screenshotCount: number;
}

interface ParentWorkflowPolicy {
  taskId: "TASK-UI-04-WORKSPACE-VIEW";
  status: "spec_created";
  childWorkflows: ChildWorkflowRecord[];
  allowNewScreenshotCapture: false;
}
```

### APIシグネチャ / CLIシグネチャ

| 種別           | シグネチャ                                                                                                              | 用途                        |
| -------------- | ----------------------------------------------------------------------------------------------------------------------- | --------------------------- |
| 構造検証       | `node .claude/skills/task-specification-creator/scripts/validate-phase-output.js <workflow>`                            | Phase 構造の機械検証        |
| 全体整合       | `node .claude/skills/task-specification-creator/scripts/verify-all-specs.js --workflow <workflow>`                      | workflow 全体整合           |
| 実装ガイド検証 | `node .claude/skills/task-specification-creator/scripts/validate-phase12-implementation-guide.js --workflow <workflow>` | Part 1/2 の充足確認         |
| index 再生成   | `node .claude/skills/aiworkflow-requirements/scripts/generate-index.js`                                                 | topic-map / keywords 再生成 |

### 使用例

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js \
  docs/30-workflows/completed-tasks/task-060-ui-04-workspace-view

node .claude/skills/task-specification-creator/scripts/verify-all-specs.js \
  --workflow docs/30-workflows/completed-tasks/task-060-ui-04-workspace-view
```

```ts
const parentPolicy: ParentWorkflowPolicy = {
  taskId: "TASK-UI-04-WORKSPACE-VIEW",
  status: "spec_created",
  allowNewScreenshotCapture: false,
  childWorkflows: [
    {
      id: "TASK-UI-04A-WORKSPACE-LAYOUT",
      canonicalPath:
        "docs/30-workflows/completed-tasks/task-058b-ui-04a-workspace-layout-filebrowser/",
      screenshotCount: 8,
    },
    {
      id: "TASK-UI-04B-WORKSPACE-CHAT",
      canonicalPath:
        "docs/30-workflows/completed-tasks/task-059a-ui-04b-workspace-chat-panel/",
      screenshotCount: 8,
    },
    {
      id: "TASK-UI-04C-WORKSPACE-PREVIEW",
      canonicalPath:
        "docs/30-workflows/completed-tasks/task-059b-ui-04c-workspace-preview-quicksearch/",
      screenshotCount: 11,
    },
  ],
};
```

### エラーハンドリング

- parent pointer が stale path を指す場合は Phase 5 の修正対象として扱う
- system spec に current path が残る場合は Phase 12 の sync gap として扱う
- child screenshot count が期待値未満なら Phase 11 blocked として扱う

### エッジケース

- docs-only task でも Phase 11 が必要になる
- child workflow が completed-tasks へ移管済みでも、旧 pointer doc が残ることがある
- `.claude` と `.agents` が同一内容でないと、次回の参照 root により結論が変わる

### 設定可能なパラメータ

| 設定項目                   | 値                                  |
| -------------------------- | ----------------------------------- |
| canonical root             | `.claude/skills`                    |
| mirror root                | `.agents/skills`                    |
| parent task status         | `spec_created`                      |
| screenshot policy          | `allowNewScreenshotCapture = false` |
| expected screenshot counts | 04A=8, 04B=8, 04C=11                |

### 設定と定数

| 定数                        | 意味                                    |
| --------------------------- | --------------------------------------- |
| `TASK-UI-04-WORKSPACE-VIEW` | 親参照仕様 task ID                      |
| `spec_created`              | 仕様書完了・実装なしの状態              |
| `completed-tasks`           | child workflow の canonical path 置き場 |

### 実装上の注意

- parent は child の実装 detail を持たない
- child の status は parent に複製せず canonical path へ送客する
- Phase 12 は system spec 4本 + LOGS 2本 + indexes 再生成 + mirror sync を一体で行う
