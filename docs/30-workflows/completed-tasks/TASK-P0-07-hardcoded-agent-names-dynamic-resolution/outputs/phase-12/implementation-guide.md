# TASK-P0-07 実装ガイド: ハードコードされた AGENT_NAMES の動的解決

---

## Part 1: 概念説明（中学生レベル）

### 「動的解決」とは何か

お店の料理メニューを想像してください。

**今まで（ハードコード）**: お店の壁にメニューを直接ペンキで書いていた。新しい料理を追加したいときは、壁を塗り直して書き換える必要がある。大変だし、書き間違いのリスクもある。

**これから（manifest = レシピ本）**: レシピ本に料理の一覧を書いておく。お店はレシピ本を読んでメニューを自動で作る。新しい料理を追加したいときは、レシピ本に1行追加するだけ。

この「レシピ本」が `workflow-manifest.json` で、「お店がレシピ本を読む仕組み」が `buildPhaseResourceRequestsFromManifest()` です。

### 「フォールバック」とは何か

もしレシピ本がなくなったり、ページが破れていたりしても、壁に書いてある古いメニュー（`PLAN_RESOURCE_REQUESTS` / `IMPROVE_RESOURCE_REQUESTS`）で料理は出せます。お店が止まることはありません。

これが「フォールバック」で、以下の5つの場面で発動します:

1. レシピ本にそのページ（フェーズ）がない
2. ページに料理名（resourceIds）が書かれていない
3. 料理名リストが空っぽ
4. 書いてある料理名が全部、レシピの詳細ページに見つからない
5. そもそもレシピ本を読む仕組み自体がオフになっている

### 「リファクタリング」とは何か

お店の仕組みを変えるけど、お客さんから見たらメニューは同じ。裏方の仕組みだけが良くなる。テストが全部通ることで「お客さんへの影響なし」を保証します。

### この変更で何が嬉しいか

新しい料理人（エージェント）を追加したいとき、レシピ本（manifest）に書き足すだけで OK。壁（ソースコード）を書き換えなくていい。

---

## Part 2: 技術者レベル詳細

### 1. 関数シグネチャ

```typescript
// apps/desktop/src/main/services/runtime/manifestResourceResolver.ts

import type { LoadedWorkflowManifest } from "@repo/shared/types";
import type { PhaseResourceRequest } from "./PhaseResourcePlanner";

function buildPhaseResourceRequestsFromManifest(
  manifest: LoadedWorkflowManifest,
  phaseId: string,
  fallback: readonly PhaseResourceRequest[],
): PhaseResourceRequest[];
```

### 2. 変換ロジック詳細

#### 2.1 Phase 検索

`manifest.phases` 配列から `phaseId` に一致するフェーズを `Array.find()` で検索。

#### 2.2 Resource マッピング

フェーズの `resourceIds[]` を順にイテレートし、各 ID を `manifest.resources` から検索。見つかったリソースを `PhaseResourceRequest` に変換。

#### 2.3 Path 変換ルール

```
resource.path: "./agents/discover-problem.md"
  ↓ replace(/^\.\//, "")
relativePath: "agents/discover-problem.md"
```

先頭の `./` のみ除去。`./` がない場合はそのまま使用。

#### 2.4 kind → tier マッピング

| kind        | tier               | required |
| ----------- | ------------------ | -------- |
| `agent`     | `required-core`    | `true`   |
| `reference` | `optional-quality` | `false`  |
| `schema`    | `optional-quality` | `false`  |
| `asset`     | `optional-quality` | `false`  |

### 3. フォールバック条件一覧（5パターン）

| #   | 条件                                            | 動作                             |
| --- | ----------------------------------------------- | -------------------------------- |
| 1   | manifest に対象 phaseId が存在しない            | `fallback` をそのまま返す + warn |
| 2   | フェーズの `resourceIds` が undefined           | `fallback` をそのまま返す + warn |
| 3   | フェーズの `resourceIds` が空配列 `[]`          | `fallback` をそのまま返す + warn |
| 4   | resourceIds の全 ID が resources に見つからない | `fallback` をそのまま返す + warn |
| 5   | `hasDynamicResourcePipeline()` が false         | 既存の静的パスをそのまま使用     |

### 4. データフロー図

```
RuntimeSkillCreatorFacade
  │
  ├── plan() / improve()
  │     │
  │     └── resolveOperationResources(phaseId, fallbackRequests, ...)
  │           │
  │           ├── hasDynamicResourcePipeline() === false?
  │           │     └── YES → 静的パス: fallbackRequests をそのまま使用
  │           │
  │           └── NO (dynamic pipeline available)
  │                 │
  │                 ├── loadManifest()
  │                 │
  │                 └── buildPhaseResourceRequestsFromManifest(manifest, phaseId, fallback)
  │                       │
  │                       ├── phases.find(p => p.id === phaseId)
  │                       │     └── NOT FOUND → fallback + warn
  │                       │
  │                       ├── phase.resourceIds が undefined/空?
  │                       │     └── YES → fallback + warn
  │                       │
  │                       ├── resourceIds.forEach → resources.find()
  │                       │     ├── FOUND → PhaseResourceRequest に変換
  │                       │     └── NOT FOUND → warn + skip
  │                       │
  │                       └── result が空?
  │                             ├── YES → fallback + warn
  │                             └── NO → result を返す
```

### 5. 変更ファイル一覧

| #   | ファイルパス                                                                                 | 変更種別 | 変更概要                                                            |
| --- | -------------------------------------------------------------------------------------------- | -------- | ------------------------------------------------------------------- |
| 1   | `apps/desktop/src/main/services/runtime/manifestResourceResolver.ts`                         | 新規     | `buildPhaseResourceRequestsFromManifest()` 純粋関数                 |
| 2   | `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`                        | 変更     | `resolveOperationResources()` に phaseId 引数追加、動的解決呼び出し |
| 3   | `apps/desktop/src/main/services/runtime/__tests__/manifestResourceResolver.test.ts`          | 新規     | 20 テストケース（正常系 + エッジケース + フォールバック）           |
| 4   | `apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.plan.test.ts`    | 変更     | TASK-P0-07 plan 動的解決テスト追加                                  |
| 5   | `apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.improve.test.ts` | 変更     | TASK-P0-07 improve 動的解決テスト追加                               |

### 6. 設定可能なパラメータと定数一覧

#### 6.1 関数パラメータ

| 名前        | 用途                                              | 代表値 / 内容                                                                                                  |
| ----------- | ------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| `manifest`  | manifest から phase ごとの resourceIds を読み取る | `LoadedWorkflowManifest`                                                                                       |
| `phaseId`   | 対象 phase を選ぶ                                 | `"plan"` / `"improve"`                                                                                         |
| `fallback`  | manifest 解決失敗時の静的退避先                   | `PLAN_RESOURCE_REQUESTS` / `IMPROVE_RESOURCE_REQUESTS`                                                         |
| `maxBytes`  | resource selection の context budget 上限         | `PLAN_PROMPT_CONSTANTS.DEFAULT_CONTEXT_BUDGET_BYTES` / `IMPROVE_PROMPT_CONSTANTS.DEFAULT_CONTEXT_BUDGET_BYTES` |
| `operation` | planner に渡す操作種別                            | `"plan"` / `"improve"`                                                                                         |

#### 6.2 主要定数

| 定数                                                    | 役割                         | 備考                                                                   |
| ------------------------------------------------------- | ---------------------------- | ---------------------------------------------------------------------- |
| `PLAN_RESOURCE_REQUESTS`                                | plan の静的フォールバック    | `discover-problem` / `design-workflow` / `plan-structure` / `overview` |
| `IMPROVE_RESOURCE_REQUESTS`                             | improve の静的フォールバック | `improve-prompt` / `feedback-loop`                                     |
| `PLAN_PROMPT_CONSTANTS.DEFAULT_CONTEXT_BUDGET_BYTES`    | plan の context budget       | 16,384 bytes                                                           |
| `IMPROVE_PROMPT_CONSTANTS.DEFAULT_CONTEXT_BUDGET_BYTES` | improve の context budget    | 12,288 bytes                                                           |
| `PLAN_PROMPT_CONSTANTS.DEFAULT_MODEL_ID`                | plan LLM モデル              | `claude-sonnet-4-20250514`                                             |
| `IMPROVE_PROMPT_CONSTANTS.DEFAULT_MODEL_ID`             | improve LLM モデル           | `claude-sonnet-4-20250514`                                             |
