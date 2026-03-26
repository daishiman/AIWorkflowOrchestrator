# Implementation Guide

## Part 1: なぜ必要かを先に説明する

なぜ必要か。`TASK-SDK-02` は実装自体は終わっていても、説明書の置き場所と道しるべがずれていると、次の人が古い前提で作業してしまうからです。

たとえば、教室の名簿では「この人が班長」と書いてあるのに、廊下の掲示板ではまだ「班長は未定」と書いてある状態に近いです。中身が正しくても、見る場所ごとに説明が違うと、作業する人は迷います。

何をするか。この task では、正しい説明が書かれている場所をそろえ、古い通り道を消し、更新が終わった証拠をまとめます。

## Part 2: 技術者向け詳細

### TypeScript 型定義

```typescript
interface SameWaveSyncTarget {
  lane: "system-spec" | "ledger" | "workflow-local" | "validation";
  path: string;
  reason: string;
}

type VerificationCommand = {
  id: string;
  command: string;
  expected: "PASS" | "0 hit";
};
```

### APIシグネチャ

- CLIシグネチャ: `node .claude/skills/task-specification-creator/scripts/verify-all-specs.js --workflow <path> --json`
- CLIシグネチャ: `node .claude/skills/task-specification-creator/scripts/validate-phase12-implementation-guide.js --workflow <path> --json`

### 使用例

使用例:

```bash
node .claude/skills/task-specification-creator/scripts/verify-all-specs.js \
  --workflow docs/30-workflows/completed-tasks/ut-imp-task-sdk-02-system-spec-and-path-sync-001 --json

node .claude/skills/task-specification-creator/scripts/validate-phase12-implementation-guide.js \
  --workflow docs/30-workflows/completed-tasks/ut-imp-task-sdk-02-system-spec-and-path-sync-001 --json
```

### エラーハンドリング

- `verify-all-specs` が fail の場合は、Phase 1-13 の欠落、必須セクション不足、曖昧表現を優先修正する。
- grep に hit が残る場合は、未完了表現と stale path を incomplete とみなして close しない。

### エッジケース

- system spec 本文が既に current の場合でも、ledger / lessons / index の same-wave 同期は必要。
- 新規未タスクが不要な場合でも、`no follow-up` の根拠を changelog と unassigned detection に残す。

### 設定可能なパラメータと定数一覧

| 項目                     | 値                                                                                   |
| ------------------------ | ------------------------------------------------------------------------------------ |
| workflow path            | `docs/30-workflows/completed-tasks/ut-imp-task-sdk-02-system-spec-and-path-sync-001` |
| incomplete wording guard | `更新予定`, `後でやる`, `後続判断待ち`, `マージ後に実施`                             |
| stale path guard         | `../root-workflow-pack`, `../step-03-par-task-03`, `../step-03-par-task-04`          |
