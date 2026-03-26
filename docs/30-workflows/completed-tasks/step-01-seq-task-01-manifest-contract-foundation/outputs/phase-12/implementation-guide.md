# Implementation Guide

## Part 1: 非技術者向け

なぜこれが必要かというと、workflow の本体ロジックと「どの phase があり、どの資料を読むか」を同じ場所に混ぜると、後続 task がどこまでを設定で変えられるのか分からなくなるためです。

たとえば、レシピ本の中に「今日使う材料一覧」まで毎回書き込むと、献立を変えるたびに本全体を直す必要があります。manifest はレシピ本そのものではなく、「今日はこの順で料理して、この材料を使う」という別紙です。別紙にしておけば、材料一覧や進行順だけを安全に差し替えられます。

今回の実装では、この別紙に相当する manifest へ `schemaVersion`、`workflowId`、`phases`、`resources`、`entry`、`exit` だけを置きました。逆に、認証、権限、IPC、session のような「厨房のルール」は manifest に入れません。これにより、manifest は「何を読むかの案内役」に留まり、実行の責任者にはなりません。

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

### 設定可能な項目と定数

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
- unit test は追加済みだが、現環境では Vitest が `esbuild` mismatch で未実行
