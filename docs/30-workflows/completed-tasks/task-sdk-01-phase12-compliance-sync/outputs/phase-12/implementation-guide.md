# Implementation Guide

## Part 1: 非技術者向け

### なぜ必要か

この follow-up が必要なのは、親 workflow が完了済みに見えても、Phase 12 の説明や台帳がずれていると監査で false green になるからです。特に `index.md` の status と Phase 12 成果物の本文が食い違うと、後続 task が間違った前提で進んでしまいます。

### 日常生活での例え

たとえば、棚卸し表の「在庫あり」と倉庫の実物がずれている状態に似ています。帳簿だけ見ると揃って見えても、実際の棚を見たら数が違うと困ります。今回の follow-up は、その帳簿と実棚をもう一度突き合わせて、見た人が同じ結論になるようにそろえる作業です。

### 何をしたか

- parent workflow の Phase 11 / 12 成果物を current facts に合わせて書き直した
- `generate-index.js` を修正して、Phase 12/13 status drift が再発しないようにした
- backlog / completed ledger / lessons / quick-reference まで同じターンで同期した
- Step 2 は「system spec 本文の新規追記なし」だが、no-op 根拠を summary / changelog / lessons に残して close-out を監査可能にした

## Part 2: 実装者向け

### 型定義

```ts
interface LoadedWorkflowManifest extends WorkflowManifest {
  sourcePath: string;
  manifestDir: string;
  manifestMtimeMs: number;
  manifestContentHash: string;
  resourceDescriptorHash: string;
  cacheKey: string;
}
```

### APIシグネチャ

```ts
async function loadManifest(
  manifestPath: string,
): Promise<LoadedWorkflowManifest>;
function invalidate(manifestPath?: string): void;
```

### 使用例

```bash
node .claude/skills/aiworkflow-requirements/scripts/generate-index.js
pnpm --filter @repo/shared typecheck
pnpm --filter @repo/desktop typecheck
node .claude/skills/task-specification-creator/scripts/verify-all-specs.js --workflow docs/30-workflows/completed-tasks/task-sdk-01-phase12-compliance-sync --strict
```

### エラーハンドリング

- `resource.phaseIds` が未定義 phase を指すと `ManifestLoader` が明示エラーを返す
- `phase.resourceIds` と `resources.phaseIds` が噛み合わないと `ManifestLoader` が reject する
- `esbuild` binary mismatch がある環境では Vitest が不安定になるため、compile gate と分離して扱う

### エッジケース

- `resource.phaseIds` が省略されている既存 manifest は後方互換のため許容する
- manifest 本文だけが変わり `mtime` が元値に戻っても `manifestContentHash` で cache false-hit を防ぐ
- docs-only follow-up でも validator が補助成果物を要求する場合は placeholder を保存する
- Step 2 no-op 判定のときも、ledger / lessons / LOGS / SKILL / quick-reference の same-wave sync は省略しない

### 設定と定数

| 項目                               | 役割                                           |
| ---------------------------------- | ---------------------------------------------- |
| `WORKFLOW_MANIFEST_SCHEMA_VERSION` | manifest schema version の固定値               |
| `manifestContentHash`              | manifest 全体の内容差分を cache 判定へ反映する |
| `resourceDescriptorHash`           | resource path / kind / phaseIds 差分を監視する |
| `invalidate()`                     | path 単位または全体の cache を明示破棄する     |
| `currentViolations.total`          | 今回差分の未タスク品質が PASS かを示す         |
