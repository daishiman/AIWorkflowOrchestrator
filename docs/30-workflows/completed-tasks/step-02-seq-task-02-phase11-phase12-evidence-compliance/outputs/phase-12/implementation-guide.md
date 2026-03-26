# Implementation Guide

## Part 1: 中学生レベルの説明

なぜこの corrective workflow が必要かというと、ファイルがあるだけで「終わった」と見なすと、本当に読める証跡かどうかが分からなくなるからです。

たとえば、宿題を出したかどうかを「机の上に紙がある」で判断すると、中身が白紙でも気づけません。この workflow は、紙があるだけでなく、中に何が書いてあるかまで確認する係です。

### この機能でできること

| 機能                        | 説明                                     | 例                                        |
| --------------------------- | ---------------------------------------- | ----------------------------------------- |
| Phase 11 証跡を結び直す     | TC-ID と PNG と判定を 1:1 で追跡できる   | `TC-11-01` から review board PNG に辿れる |
| Phase 12 を内容完了で閉じる | guide や compliance を中身で確認する     | Part 1 / Part 2 の両方を満たすか判定する  |
| placeholder をやめる        | 仮の画像ではなく current evidence を残す | review board PNG と metadata を保存する   |

## Part 2: 技術者向け説明

### TypeScript 型定義

```ts
export interface RuntimeSkillCreatorPlanResult {
  planId: string;
  skillSpec: string;
  estimatedSteps: number;
  skillName: string;
  description: string;
  agents: Array<{ name: string; role: string }>;
  scripts: Array<{ name: string; purpose: string }>;
  triggers: string[];
  anchors: string[];
}

export type RuntimeSkillCreatorExecuteResponse =
  | RuntimeSkillCreatorExecuteResult
  | {
      type: "terminal_handoff";
      bundle: TerminalHandoffBundle;
    };
```

### APIシグネチャ

```ts
planSkill(
  prompt: string,
  authMode?: AuthMode,
  apiKey?: string | null,
): Promise<IpcResult<RuntimeSkillCreatorPlanResponse>>;

executePlan(
  planId: string,
  skillSpec: string,
  authMode?: AuthMode,
  apiKey?: string | null,
): Promise<IpcResult<RuntimeSkillCreatorExecuteResponse>>;
```

### 使用例

```bash
node .agents/skills/task-specification-creator/scripts/validate-phase11-screenshot-coverage.js \
  --workflow docs/30-workflows/step-02-seq-task-02-workflow-engine-runtime-orchestration --json
```

### エラーハンドリング

- parent Phase 11 に TC-ID がない場合は `validate-phase11-screenshot-coverage.js` が失敗する
- parent implementation guide の Part 1 / Part 2 literal が不足すると `validate-phase12-implementation-guide.js` が失敗する
- placeholder が残る場合は human review で FAIL とする

### エッジケース

- docs-only task でも PNG が 1 件必要な validator に合わせ、review board PNG を保持する
- non-visual 判定でも metadata と result に理由を二重記録する
- Phase 13 は user approval 未取得なら blocked を維持する

### 設定項目と定数一覧

| 項目          | 値 / 役割                                  |
| ------------- | ------------------------------------------ |
| decision      | `non_visual`                               |
| evidence kind | `review_board`                             |
| validator 1   | `validate-phase-output.js`                 |
| validator 2   | `verify-all-specs.js`                      |
| validator 3   | `validate-phase11-screenshot-coverage.js`  |
| validator 4   | `validate-phase12-implementation-guide.js` |
