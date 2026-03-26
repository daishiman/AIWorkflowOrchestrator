# Implementation Guide

## Part 1: 初学者向けの説明

### なぜこの修正が必要か

失敗した出来事の記録が途中で消えると、あとから流れをたどれません。たとえば、学校の連絡帳に「うまくいったこと」だけ書いて「失敗したこと」を書かなければ、先生も保護者も本当の経過を見失います。

### 何をするか

今回の修正では、失敗したときの確認結果も履歴に追加します。たとえば、テストの点数だけでなく「どこでつまずいたか」も毎回書き足すイメージです。そうすると、最後の状態だけでなく、失敗が何回起きたかも分かります。

### この修正でできること

| 機能             | 説明                             | 例                                                    |
| ---------------- | -------------------------------- | ----------------------------------------------------- |
| 履歴が欠けない   | 失敗時の確認結果も毎回残る       | 2回失敗したら2回分の記録を追える                      |
| 読む側が迷わない | 最新状態と履歴の役割を分けられる | 最後の状態は `state`、過去の流れは `artifacts` で見る |
| 再発防止しやすい | テストで件数と順序を固定できる   | append が upsert に戻ったらすぐ検知できる             |

## Part 2: 開発者向け詳細

### 対象コンポーネント

| 項目          | 内容                                                                                                                                                                                               |
| ------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| write owner   | `apps/desktop/src/main/services/runtime/SkillCreatorWorkflowEngine.ts`                                                                                                                             |
| reader bridge | `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`                                                                                                                              |
| tests         | `apps/desktop/src/main/services/runtime/__tests__/SkillCreatorWorkflowEngine.test.ts`, `apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.workflow-orchestration.test.ts` |

### TypeScript 型定義

```ts
type SkillCreatorWorkflowArtifactKind =
  | "route_snapshot"
  | "plan_result"
  | "execute_result"
  | "handoff_bundle"
  | "verify_result";

interface SkillCreatorVerifyResult {
  status: "pending" | "pass" | "fail";
  message?: string;
  nextAction?: "review" | "improve";
  updatedAt: string;
}
```

### APIシグネチャ

```ts
recordExecuteResult(
  planId: string,
  result: RuntimeSkillCreatorExecuteResult,
): SkillCreatorWorkflowStateSnapshot

recordVerifyFailure(
  planId: string,
  message: string,
  nextAction: "review" | "improve" = "improve",
): SkillCreatorWorkflowStateSnapshot
```

### 使用例

```ts
const snapshot = engine.recordVerifyFailure(
  "plan-001",
  "verify failed",
  "improve",
);

const verifyArtifacts = snapshot.phaseArtifacts.filter(
  (artifact) => artifact.kind === "verify_result",
);

expect(verifyArtifacts).toHaveLength(2);
expect(verifyArtifacts.at(-1)?.payload).toMatchObject(snapshot.verifyResult!);
```

### エラーハンドリング

- public IPC / preload / shared types には触れず、engine 内部の履歴戦略だけを変更した
- facade 側では engine snapshot をそのまま読み取り、失敗履歴を再構成しない

### エッジケース

- repeated failure: `execute_result` と `verify_result` を毎回 append し、履歴件数を減らさない
- latest snapshot: `state.verifyResult` は最後の failure/pending を保持し、履歴は `phaseArtifacts` が担う
- non-visual task: Phase 11 は screenshot ではなく direct state snapshot で閉じる

### 設定と定数

| 項目                        | 値                                                                                                                                                                                                                                                                                                                 |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| targeted test command       | `ESBUILD_BINARY_PATH="$PWD/node_modules/.pnpm/esbuild@0.21.5/node_modules/esbuild/bin/esbuild" pnpm exec vitest run apps/desktop/src/main/services/runtime/__tests__/SkillCreatorWorkflowEngine.test.ts apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.workflow-orchestration.test.ts` |
| manual verification command | `ESBUILD_BINARY_PATH="$PWD/node_modules/.pnpm/esbuild@0.27.2/node_modules/esbuild/bin/esbuild" pnpm exec tsx --eval '...SkillCreatorWorkflowEngine scenario...'`                                                                                                                                                   |
| source of truth             | latest state は `state.verifyResult`、履歴正本は `phaseArtifacts.verify_result`                                                                                                                                                                                                                                    |
| non-goal                    | public IPC / preload / shared contract の変更                                                                                                                                                                                                                                                                      |
