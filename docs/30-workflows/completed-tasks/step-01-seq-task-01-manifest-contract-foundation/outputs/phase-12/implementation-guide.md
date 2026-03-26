# Implementation Guide

## Part 1: 非技術者向け

### なぜ必要か

workflow の本体ロジックと「どの phase があり、どの資料を読むか」を同じ場所に混ぜると、後続 task がどこまでを設定で変えられるのか分からなくなります。さらに Phase 12 の close-out で説明不足が残ると、完了済みに見えても監査で false green になります。だから manifest 自体の責務と、Phase 12 で残す証跡の責務を分けて説明する必要がありました。

### 日常生活での例え

たとえば、レシピ本の中に「今日使う材料一覧」まで毎回書き込むと、献立を変えるたびに本全体を直す必要があります。manifest はレシピ本そのものではなく、「今日はこの順で料理して、この材料を使う」という別紙です。別紙にしておけば、材料一覧や進行順だけを安全に差し替えられます。

### 何をしたか

- manifest へ置く情報を `schemaVersion`、`workflowId`、`phases`、`resources`、`entry`、`exit` に限定した
- 認証、権限、IPC、session のような runtime rule は manifest に入れないと明記した
- Phase 12 の実装ガイド、summary、changelog、unassigned-task detection を current facts ベースで再構成した

## Part 2: 実装者向け

### 型定義

```ts
export const WORKFLOW_MANIFEST_SCHEMA_VERSION = 1 as const;

export interface WorkflowManifestPhase {
  id: string;
  title: string;
  prompt: string;
  entryHook?: string;
  exitHook?: string;
}

export interface WorkflowManifestResourceDescriptor {
  id: string;
  kind: "prompt" | "document" | "template";
  path: string;
}

export interface WorkflowManifest {
  schemaVersion: typeof WORKFLOW_MANIFEST_SCHEMA_VERSION;
  workflowId: string;
  phases: WorkflowManifestPhase[];
  resources: WorkflowManifestResourceDescriptor[];
  entry?: string;
  exit?: string;
}
```

### API シグネチャと使用例

```ts
const loader = new ManifestLoader();
const loaded = await loader.load("/abs/path/workflow-manifest.json");
loader.invalidate("/abs/path/workflow-manifest.json");
```

- `load(manifestPath: string): Promise<LoadedWorkflowManifest>`
  - JSON 読み込み、schema 検証、resource path 正規化、cache 管理を行う
- `invalidate(manifestPath?: string): void`
  - 対象 manifest または全 cache を破棄する

### 使用例

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase12-implementation-guide.js \
  --workflow docs/30-workflows/completed-tasks/step-01-seq-task-01-manifest-contract-foundation
node .claude/skills/task-specification-creator/scripts/verify-all-specs.js \
  --workflow docs/30-workflows/completed-tasks/step-01-seq-task-01-manifest-contract-foundation --strict
```

### 実装要点

- shared に `WorkflowManifest*` 型を追加し、manifest contract を `schemaVersion / workflowId / phases / resources / entry / exit` で固定した
- `ManifestLoader` は `read -> validate -> normalize -> cache` のみを担当し、`authMode` / permission / session / IPC は扱わない
- cache key は `manifestPath + manifestMtimeMs + schemaVersion + resourceDescriptorHash`
- downstream handoff は Task02=`phases`、Task03=`resources`、Task04=`entry/exit hook`

### エラーハンドリングとエッジケース

- `schemaVersion` 不一致は即時 reject する
- unknown top-level field は reject する
- `entry` / `exit` / phase hook が未定義 hook を参照した場合は reject する
- phase の並びが壊れている、resource file が存在しない、ID が重複している場合も reject する
- cache は manifest 更新時に別キーとなるが、強制再読込したい場合は `invalidate()` を使う

### エッジケース

- docs-only task のため UI screenshot は不要だが、Phase 11 validator 互換のため placeholder PNG を補助成果物として保存する
- `index.md` は `artifacts.json` 配列から再生成されるため、phase status の配列/オブジェクト両対応を維持しないと Phase 12/13 の status drift が再発する
- Phase 12 validator は file existence だけでなく、guide の 2 パート構成と wording まで検査する

### 設定と定数

| 項目                               | 内容                                     |
| ---------------------------------- | ---------------------------------------- |
| `WORKFLOW_MANIFEST_SCHEMA_VERSION` | 受理する schema の固定値                 |
| `schemaVersion`                    | manifest 側が宣言する版数                |
| `workflowId`                       | workflow 識別子                          |
| `phases`                           | 後続 task へ handoff する phase topology |
| `resources`                        | 参照リソース一覧                         |
| `entry` / `exit`                   | workflow 全体の入口 / 出口 hook          |

### 検証結果

- `pnpm --filter @repo/desktop typecheck`: PASS
- `pnpm --filter @repo/shared typecheck`: PASS
- `validate-phase12-implementation-guide.js`: PASS（10/10）
- unit test は追加済みだが、現環境では Vitest が `esbuild` mismatch で未実行
