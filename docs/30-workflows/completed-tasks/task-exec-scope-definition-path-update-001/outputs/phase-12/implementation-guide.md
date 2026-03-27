# Implementation Guide

## Part 1: 中学生向けの説明

なぜ必要かというと、案内板に大事な部屋の名前が 1 つ抜けていると、あとから来た人が正しい場所へ進めなくなるからです。

たとえば、学校の校内図に図書室と保健室はあるのに、よく使う理科室だけ書かれていないと、生徒は遠回りしたり、別の部屋へ行ったりします。今回の `execution-capability.ts` は、その抜けている理科室のようなものです。

### 何をするか

やることは大きく 3 つだけです。

1. 本当にその部屋が存在するか確認する
2. どの案内板を直すべきか確認する
3. その案内板に 1 行だけ足して、他の行を壊していないか確かめる

Issue が閉じていても、「管理上いったん閉じた」だけなら作業対象から外しません。大事なのは、今のファイルに何が足りているかです。

## Part 2: 技術者向けの説明

### task の技術的ゴール

Task01 scope-definition の D. Implementation Anchor に、shared capability contract の実装アンカーを 1 行追加する。

### 対象ファイル

```ts
type TargetFile =
  "docs/30-workflows/completed-tasks/step-01-seq-task-01-execution-responsibility-contract-foundation/outputs/phase-1/scope-definition.md";

type ImplementationAnchorRow = {
  path: string;
  purpose: string;
};
```

### 追加する行

```ts
const newRow: ImplementationAnchorRow = {
  path: "packages/shared/src/types/execution-capability.ts",
  purpose: "AccessCapability と関連型・pure function の実装正本",
};
```

### 実行シグネチャ

```bash
ls -la packages/shared/src/types/execution-capability.ts
rg -n "### D\\. Implementation Anchor|execution-capability.ts" docs/30-workflows/completed-tasks/step-01-seq-task-01-execution-responsibility-contract-foundation/outputs/phase-1/scope-definition.md
git diff -- docs/30-workflows/completed-tasks/step-01-seq-task-01-execution-responsibility-contract-foundation/outputs/phase-1/scope-definition.md
```

### 使用例

```bash
TARGET="docs/30-workflows/completed-tasks/step-01-seq-task-01-execution-responsibility-contract-foundation/outputs/phase-1/scope-definition.md"
rg -n "execution-capability.ts" "$TARGET"
git diff -- "$TARGET"
```

上のように target path を shell 変数へ固定してから grep / diff すると、stale path へ誤って触れにくい。

### エラーハンドリング

- target file が存在しない場合: stale path か worktree drift を疑い、Phase 2 の `target-path-decision.md` に戻る
- `execution-capability.ts` が存在しない場合: upstream contract drift のため、この task を続行せず parent task 側の整合確認へ戻す
- `git diff` に想定外の差分が出る場合: existing 2 行 preservation が壊れているため patch を見直す

### エッジケース

- source task に stale path が書かれていても、actual target decision を優先する
- duplicate source が残っていても patch target は 1 つだけにする
- existing row 2 件は non-regression として扱う

### no-op 条件

- `execution-capability.ts` の内容変更はしない
- aiworkflow-requirements の Step 2 更新は不要
- commit / push / PR はしない

### 設定項目・定数

| 名称             | 値 / 役割                                             |
| ---------------- | ----------------------------------------------------- |
| `TargetFile`     | actual patch target の型エイリアス                    |
| `newRow.path`    | `packages/shared/src/types/execution-capability.ts`   |
| `newRow.purpose` | `AccessCapability` と関連型・pure function の実装正本 |
