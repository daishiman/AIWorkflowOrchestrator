# Implementation Guide

## Part 1: 非技術者向け

### なぜ必要か

起動のたびに「どの manifest を読むか」を毎回人が探す形だと、設定ミスが起きやすくなります。だから先に「標準の置き場所」を決めておく必要がありました。

### 日常生活での例え

たとえば、学校の部室で毎回カギの置き場所が変わると、活動を始める前に探す時間がかかります。そこで「まずこの引き出しを見る」と決めておけば、見つからない時だけ別の場所を探せます。今回の helper は、その「まずこの引き出しを見る」を決める役目です。

### 何をしたか

- manifest の標準ファイル名を定数にした
- 指定された場所があればそこを優先する helper を追加した
- どこにも manifest がない時は、黙って失敗せず理由が分かるエラーにした

## Part 2: 実装者向け

### 型定義

```ts
export const SKILL_CREATOR_MANIFEST_PATH = "workflow-manifest.json";

export interface SkillCreatorRootCandidate {
  source: "explicit" | "env" | "home" | "repo";
  path: string;
}
```

### APIシグネチャ

```ts
export function resolveDefaultManifestPath(explicitRoot?: string): string;
```

### 使用例

```ts
const manifestPath = resolveDefaultManifestPath();
const explicitManifestPath = resolveDefaultManifestPath("/tmp/skill-creator");
```

```bash
pnpm --filter @repo/desktop exec vitest run \
  src/main/services/runtime/__tests__/ManifestLoader.production-manifest.test.ts
```

### 実装要点

- `explicitRoot` が与えられた場合はそれを最優先する
- 未指定時は `getSkillCreatorRootCandidates()` の候補から `workflow-manifest.json` を探索する
- parse と schema 検証は `ManifestLoader` に委譲し、helper は path 解決だけに責務を絞る

### エラーハンドリング

- 候補に manifest が存在しない場合は日本語エラーを throw する
- 破損 JSON は `ManifestLoader` が reject する

### エッジケース

- 存在しない `explicitRoot` を渡しても helper は path を返すだけで、存在確認は呼び出し側と `ManifestLoader` に委ねる
- facade は未変更のため runtime startup 自動統合はまだ起こらない

### 設定と定数

| 項目                            | 内容                     |
| ------------------------------- | ------------------------ |
| `SKILL_CREATOR_MANIFEST_PATH`   | 標準 manifest ファイル名 |
| `AIWORKFLOW_SKILL_CREATOR_PATH` | env override             |
| `HOME_SKILL_CREATOR_PATH`       | home 配下の候補          |
| `REPO_SKILL_CREATOR_PATH`       | repo 同梱候補            |
