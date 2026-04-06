# Phase 12 Implementation Guide

## メタ情報

| 項目     | 値                                   |
| -------- | ------------------------------------ |
| Phase    | 12                                   |
| タイプ   | docs-only / NON_VISUAL               |
| 実施対象 | UT-PHASE-SPEC-FORMAT-IMPROVEMENT-001 |

## Part 1: 中学生レベルの説明

### なぜ必要か

書類をしまうときに、まだ書く途中のメモと、もう終わった宿題を同じ箱に入れると見分けにくくなります。Phase 仕様書でも同じで、やることの説明と、やった結果を混ぜると、あとで確認するときに迷います。

### 何をするか

この Phase では、やることの説明は `実行タスク` に、終わった記録は `outputs/phase-12/` に分けて置きます。そうすると、どこを見ればよいかがすぐにわかります。

たとえば、本棚で「未提出」と「提出済み」のラベルを分けると、先生も自分も探しやすくなります。`phase12-task-spec-compliance-check.md` は、そのラベルの一覧表のような役目です。

### NON_VISUAL の考え方

表示を変えていない仕事では、画面の写真は必要ありません。代わりに、チェックリストや結果メモを残します。これは、写真を撮る代わりに「何を確かめたか」をはっきり書くやり方です。

## Part 2: 開発者向け詳細

### 型定義

```ts
interface Phase12EvidenceItem {
  taskId: string;
  artifactPath: string;
  status: "pass" | "fail" | "na";
}

interface Phase12ComplianceContext {
  workflowDir: string;
  isNonVisual: boolean;
  isSpecCreated: boolean;
}

type Phase12ComplianceResult = {
  ok: boolean;
  evidence: Phase12EvidenceItem[];
};
```

### APIシグネチャ

```ts
function validatePhase12ImplementationGuide(
  workflowDir: string,
): Phase12ComplianceResult;
```

### 使用例

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase12-implementation-guide.js \
  --workflow docs/30-workflows/ut-phase-spec-format-improvement-001 \
  --json
```

### エラーハンドリング

- `implementation-guide.md` が存在しない場合は FAIL にする
- `## Part 1` または `## Part 2` が欠ける場合は FAIL にする
- Part 2 に TypeScript 型定義がない場合は FAIL にする
- Part 1 の説明順が「なぜ必要か」より先に「何をするか」になっていたら FAIL にする

### エッジケース

- `spec_created` のままでも、成果物が正しく揃っていれば PASS にする
- root evidence が空に近い場合は PASS にしない
- `manual-test-checklist.md` と `manual-test-result.md` の TC-ID がずれたら不整合として扱う

### 設定項目と定数

| 項目               | 既定値                                                   | 役割                        |
| ------------------ | -------------------------------------------------------- | --------------------------- |
| `rootEvidencePath` | `outputs/phase-12/phase12-task-spec-compliance-check.md` | root evidence の保存先      |
| `checklistPath`    | `outputs/phase-11/manual-test-checklist.md`              | Phase 11 の主チェックリスト |
| `resultPath`       | `outputs/phase-11/manual-test-result.md`                 | Phase 11 の結果記録         |
| `mode`             | `docs-only / NON_VISUAL`                                 | 証跡テンプレートの分岐      |
