# Implementation Guide

## Part 1: 中学生向けの説明

この task は、Skill Creator の verify 結果を「合格か不合格か」だけで終わらせず、理由まで画面で読めるようにした実装です。

たとえると、通知表に点数だけでなく、「どこで減点されたか」「先生が何を見て判断したか」「もう一度見直せるか」が増えた状態です。

大事なのは、詳しく見せても担当範囲を壊していないことです。verify の詳細表示は Task06 の担当ですが、承認ルールは Task07、保存や再開の互換は Task08 の担当のままです。

今回やったことは次の 3 つです。

| 何をしたか     | やさしい説明                                                                     |
| -------------- | -------------------------------------------------------------------------------- |
| 情報をそろえた | shared type、IPC、preload、renderer で同じ項目名を使うようにした                 |
| 画面を増やした | verify の詳細、証拠、経路、再検証ボタンを `SkillLifecyclePanel` に追加した       |
| 境界を守った   | Task07 / Task08 の担当項目はメモ表示だけにして、別 task の責務を持ち込まなかった |

## Part 2: 技術者向けの説明

### 実装要約

- `packages/shared/src/types/skillCreator.ts` に verify detail / reverify request-response DTO を追加した
- `SkillCreatorWorkflowEngine` に `getVerifyDetail(planId)` と `requestReverify(planId)` を追加し、`RuntimeSkillCreatorFacade` から公開した
- `creatorHandlers.ts` / `channels.ts` / `skill-creator-api.ts` で `skill-creator:get-verify-detail` と `skill-creator:reverify-workflow` を追加した
- `SkillLifecyclePanel.tsx` に verify detail card、check list、provenance summary、delegated note、re-verify button を追加した
- runtime/unit test を更新し、shared→main→preload→renderer の contract を追跡した

### 実装対象

| ディレクトリ       | 状態     | 内容                                     |
| ------------------ | -------- | ---------------------------------------- |
| `apps/desktop/`    | 変更あり | main / preload / renderer / tests を更新 |
| `packages/shared/` | 変更あり | verify detail / reverify DTO を追加      |
| `apps/backend/`    | 変更なし | 今回の workflow では対象機能なし         |

### 主要 API

```ts
interface SkillCreatorWorkflowApi {
  getVerifyDetail(
    workflowId: string,
  ): Promise<RuntimeSkillCreatorVerifyDetailResponse>;
  reverifyWorkflow(workflowId: string): Promise<{
    success: boolean;
    accepted: boolean;
    disabledReason?: string;
  }>;
}
```

### 型定義

```ts
interface RuntimeSkillCreatorVerifyDetail {
  planId: string;
  currentPhase:
    | "plan"
    | "review"
    | "execute"
    | "verify"
    | "improve"
    | "handoff";
  status: "pending" | "pass" | "fail";
  checks: Array<{
    id: string;
    layer: "layer3" | "layer4";
    severity: "info" | "warning" | "error";
    summary: string;
    evidenceSummary?: string;
  }>;
  evidenceCount: number;
  route: {
    type: "integrated_api" | "terminal_handoff";
    permissionMode?: "default" | "acceptEdits" | "bypassPermissions";
    launcher?: string;
    summary: string;
  };
  reverifyEligible: boolean;
  disabledReason?: string;
  delegatedGovernanceNote: string;
  delegatedSessionNote: string;
}
```

### 使用例

```ts
const detailResult =
  await window.electronAPI.skillCreator.getVerifyDetail(planId);
if (detailResult.success && detailResult.data) {
  console.log(detailResult.data.route.summary);
}

const reverifyResult =
  await window.electronAPI.skillCreator.reverifyWorkflow(planId);
if (reverifyResult.success && reverifyResult.data?.accepted) {
  console.log("verify loop restarted");
}
```

### 表示内容

| surface            | 内容                                                            |
| ------------------ | --------------------------------------------------------------- |
| verify detail card | status / phase / evidence / route / message                     |
| checks list        | severity 付き check summary                                     |
| provenance         | manifest path / hash / route snapshot / evidence summary        |
| delegated notes    | governance / session の owner が別 task であることを説明        |
| action             | `reverifyEligible` に応じた re-verify button と disabled reason |

### エラーハンドリングと edge case

| ケース                   | 挙動                                                                        |
| ------------------------ | --------------------------------------------------------------------------- |
| `planId` が空            | main IPC で validation error を返す                                         |
| workflow が未存在        | facade / engine 側で例外を返し、IPC で sanitize された error message を返す |
| execute 未完了           | `reverifyWorkflow()` は `accepted: false` と `disabledReason` を返す        |
| `terminal_handoff` route | re-verify は無効化し、Task07 owner であることを説明する                     |
| provenance が一部未取得  | optional field として扱い、warning 系 check を返す                          |

### 設定可能パラメータ / 定数

| 項目                   | 値 / 取りうる値                                 | 用途                                |
| ---------------------- | ----------------------------------------------- | ----------------------------------- |
| `route.type`           | `integrated_api` / `terminal_handoff`           | verify detail surface の route 表示 |
| `route.permissionMode` | `default` / `acceptEdits` / `bypassPermissions` | integrated route の mode 表示       |
| `check.layer`          | `layer3` / `layer4`                             | check の責務階層表示                |
| `check.severity`       | `info` / `warning` / `error`                    | check badge 表示                    |
| `status`               | `pending` / `pass` / `fail`                     | verify status badge                 |

### 実施した検証

- `pnpm exec tsc --noEmit -p apps/desktop/tsconfig.json`: PASS
- `pnpm exec prettier --check ...`: PASS
- `node .agents/skills/task-specification-creator/scripts/verify-all-specs.js --workflow docs/30-workflows/completed-tasks/ut-imp-task-sdk-06-layer34-verify-expansion-001`: PASS
- `node .agents/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/completed-tasks/ut-imp-task-sdk-06-layer34-verify-expansion-001`: PASS
- `node .agents/skills/task-specification-creator/scripts/verify-unassigned-links.js --source docs/30-workflows/completed-tasks/ut-imp-task-sdk-06-layer34-verify-expansion-001/outputs/phase-12/unassigned-task-detection.md`: PASS

### 既知の制約

- Vitest は `Cannot start service: Host version "0.21.5" does not match binary version "0.27.4"` のため未実行
- Phase 11 の screenshot は live capture ではなく review board fallback を保存し、理由と source evidence を metadata へ記録した

### Phase 11 参照

- screenshot artifact: `outputs/phase-11/screenshots/TC-11-01-verify-detail-review-board.png`
- capture metadata: `outputs/phase-11/screenshots/phase11-capture-metadata.json`
- screenshot coverage: `outputs/phase-11/screenshot-coverage.md`
- manual result: `outputs/phase-11/manual-test-result.md`
