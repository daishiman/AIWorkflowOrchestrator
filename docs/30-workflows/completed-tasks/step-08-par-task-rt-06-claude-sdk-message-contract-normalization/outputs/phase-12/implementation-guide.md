# Implementation Guide

## Part 1: 概念説明（中学生レベル）

### なぜ必要か

Claude SDK は実行中に色々な種類のメッセージを返す。これをそのまま画面やワークフローに流すと、

- どれが開始情報か
- どれが結果か
- どこで失敗したか
  が毎回バラバラになり、後続機能（再開、承認、表示）が壊れやすくなる。

### 何をしたか

「生メッセージを一度そろえる翻訳係」を `RuntimeSkillCreatorFacade` に置いた。

日常の例え:

- 先生ごとに違う形式のプリントを、そのまま配ると混乱する
- 先に「共通フォーマット」に書き直してから配ると、全員が同じ読み方で理解できる

RT-06 はこの「共通フォーマット化」を担当する。

### 今回の効果

- `sessionId`、停止理由、permission denial などの重要情報を共通形式で扱える
- 実行失敗時も error event を落とさず保持できる
- 後続タスク（RT-03 / P0-05 / P0-08 / P0-09）が同じ契約を前提に進められる

## Part 2: 技術詳細（開発者向け）

### 1. 型契約

```ts
export interface SkillCreatorSdkEvent {
  eventType: "init" | "assistant" | "result" | "error";
  sequence: number;
  rawType: string;
  sessionId?: string;
  resultSubtype?: string;
  stopReason?: string;
  permissionDenials?: SkillCreatorSdkPermissionDenial[];
  errorMessage?: string;
}
```

### 2. API シグネチャ

```ts
export function normalizeSkillCreatorSdkEvents(
  sdkMessages: unknown[],
  sourceProvenance?: SkillCreatorWorkflowSourceProvenance,
): SkillCreatorSdkEvent[];

export function normalizeSkillCreatorSdkMessage(
  message: unknown,
  sequence: number,
  sourceProvenance?: SkillCreatorWorkflowSourceProvenance,
): SkillCreatorSdkEvent | null;
```

### 3. 使用例

```ts
const sdkEvents = normalizeSkillCreatorSdkEvents(response.sdkMessages ?? []);
const sessionId = sdkEvents.find((event) =>
  Boolean(event.sessionId),
)?.sessionId;
```

### 4. エラーハンドリング

- SDK message が0件または全件不正形式: fallback error event を1件生成
- execute 失敗時: `execution_error` として workflow artifact に記録
- plan degraded: `llm_adapter_unavailable` / `resource_loader_unavailable` を返す

### 5. エッジケース

- `system/init` 不在
- `result` のみ存在
- permission denial が文字列配列で返る
- snake_case / camelCase の混在フィールド

### 6. 設定値・定数

- `PLAN_PROMPT_CONSTANTS.DEFAULT_CONTEXT_BUDGET_BYTES`
- `PLAN_PROMPT_CONSTANTS.DEFAULT_MAX_TOKENS`
- `IMPROVE_PROMPT_CONSTANTS.DEFAULT_CONTEXT_BUDGET_BYTES`
- `IMPROVE_PROMPT_CONSTANTS.DEFAULT_MAX_TOKENS`

## 検証結果

- `pnpm typecheck:shared`: PASS
- `pnpm typecheck:desktop`: PASS
- `pnpm vitest apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.sdk-normalization.test.ts`: FAIL（esbuild アーキ不整合）

## スクリーンショット参照

- 本タスクは UI 非変更のため視覚差分スクリーンショットは N/A
- 代替証跡: `outputs/phase-11/manual-test-checklist.md`
