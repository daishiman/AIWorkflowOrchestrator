# Implementation Guide

## Part 1: なぜ必要かを先に説明する

なぜ必要か。Task04 は中身の作業が進んでいても、終わりの記録に古い通り道が残ると、次の人が古い説明を本当だと受け取ってしまうからです。

たとえば、学校の教室移動が終わったのに、廊下の案内板だけ前の教室番号のまま残っている状態に近いです。授業は新しい教室で始められていても、案内板が古いと新しく来た人は迷います。

何をするか。この workflow では、Task04 の close-out 証跡を読み直し、正しい場所、正しい状態、正しい follow-up の説明へそろえます。

## Part 2: 技術者向け詳細

### TypeScript 型定義

```typescript
interface StaleEvidenceTarget {
  path: string;
  driftType: "canonical-path" | "judgement" | "validation" | "backlog";
  currentFact: string;
}

type VerificationCommand = {
  id: string;
  command: string;
  expected: "PASS" | "0 hit" | "errors 0";
};
```

### APIシグネチャ

- CLIシグネチャ: `node .claude/skills/task-specification-creator/scripts/validate-phase-output.js <workflow-dir>`
- CLIシグネチャ: `node .claude/skills/task-specification-creator/scripts/verify-all-specs.js --workflow <workflow-dir> --json`
- CLIシグネチャ: `node .claude/skills/task-specification-creator/scripts/validate-phase12-implementation-guide.js --workflow <workflow-dir> --json`

### 使用例

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js \
  docs/30-workflows/completed-tasks/ut-imp-task-sdk-04-phase12-canonical-path-resync-001

node .claude/skills/task-specification-creator/scripts/verify-all-specs.js \
  --workflow docs/30-workflows/completed-tasks/ut-imp-task-sdk-04-phase12-canonical-path-resync-001 --json
```

### エラーハンドリング

- `validate-phase-output.js` が fail の場合は、Phase 1-13 の必須セクション欠落、artifacts parity 不一致、Phase 11 補助成果物不足を修正する。
- `verify-all-specs.js` が fail の場合は、依存 Phase 参照、曖昧表現、参照パスを優先修正する。

### エッジケース

- parent workflow の close-out が current code wave を含んでいても、Task04 自体の `spec_created` 維持判断は別に説明する必要がある。
- `UT-SC-02-006` 吸収済みと `TASK-SDK-04-U1..U3` formalize 済みは両立するため、どちらか一方だけを書くと current fact が崩れる。

### Phase 11 証跡

- screenshot plan: `outputs/phase-11/screenshot-plan.json`
- screenshot placeholder: `outputs/phase-11/screenshots/DOC-11-01-placeholder.png`
- この workflow は docs-only remediation のため、placeholder PNG を validator compatibility 用のスクリーンショット証跡として保持する。

### 設定可能なパラメータと定数一覧

| 項目                 | 値                                                                                           |
| -------------------- | -------------------------------------------------------------------------------------------- |
| workflow path        | `docs/30-workflows/completed-tasks/ut-imp-task-sdk-04-phase12-canonical-path-resync-001`     |
| parent workflow path | `docs/30-workflows/completed-tasks/step-03-par-task-04-user-interaction-bridge-and-phase-ui` |
| old path guard       | `skill-creator-agent-sdk-lane/step-03-par-task-04-user-interaction-bridge-and-phase-ui`      |
| status decision      | `spec_created` を維持                                                                        |
