# Phase 12: Implementation Guide — TASK-FIX-PRELOAD-VITE-ALIAS-SHARED-IPC-001

## Part 1: 中学生レベルの説明

### なぜ必要か

たとえば、図書館の本の場所を書いた札が、教室では正しいのに職員室では別の場所を指していたら、どちらかで必ず迷子が出る。
今回の `@repo/shared/src/ipc/channels` も同じで、build と test で違う場所を見ていたのが問題だった。

### 何をしたか

本棚の札を 2 か所で同じ場所にそろえた。

- preload build では、shared の札を外に追い出さないようにした
- test では、同じ shared の札を正しく読めるようにした
- つなぎの遠回り経路だった 7 階層相対パスをやめた

## Part 2: 技術詳細

### 型と設定

```ts
type SharedIpcAlias = {
  find: "@repo/shared/src/ipc/channels";
  replacement: "../../packages/shared/src/ipc/channels.ts";
};
```

### 実装

```ts
// electron.vite.config.ts
externalizeDepsPlugin({ exclude: ["@repo/shared"] });
resolve.alias["@repo/shared/src/ipc/channels"] = resolve(
  __dirname,
  "../../packages/shared/src/ipc/channels.ts",
);

// vitest.config.ts
resolve.alias["@repo/shared/src/ipc/channels"] = resolve(
  __dirname,
  "../../packages/shared/src/ipc/channels.ts",
);
```

### 使用例

```ts
const { APPROVAL_CHANNELS, EXECUTION_CHANNELS } =
  await import("@repo/shared/src/ipc/channels");
```

### エラーハンドリング / エッジケース

- `exclude` を入れず alias だけにすると preload bundle 側で external 化が先に走る
- Vitest 側に alias がないと `vite:import-analysis` で import 解決に失敗する
- alias は `channels.ts` 完全一致のみとし、shared 他サブパスへ波及させない

### 設定項目

| 項目                  | 値                                                |
| --------------------- | ------------------------------------------------- |
| preload external 除外 | `@repo/shared`                                    |
| shared IPC alias      | `@repo/shared/src/ipc/channels`                   |
| 解決先                | `../../packages/shared/src/ipc/channels.ts`       |
| targeted tests        | `skill-api.getDetail-update`, `governance-bundle` |

### 検証結果

- `pnpm --filter @repo/desktop typecheck` PASS
- `pnpm --filter @repo/desktop build` PASS
- preload bundle: shared require `0`, `skill:list` `2`, `@repo/shared` `0`
- targeted vitest: `2 files / 37 tests PASS`
