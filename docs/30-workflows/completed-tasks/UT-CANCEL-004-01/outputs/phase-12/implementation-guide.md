# UT-CANCEL-004-01 実装ガイド

## Part 1: はじめて読む人向け

### なぜ必要か

生成を止めたいのに、その合図が途中で消えると、止めたつもりでも裏で処理が進んでしまう。だから「止める合図」を、実際に作業を始める直前の場所まで届ける必要がある。

### たとえば

たとえば、レストランで注文を取り消したいときに、入口の案内係だけが知っていて厨房に伝わらなければ、料理は作られてしまう。今回の変更は、その取り消しの連絡を厨房の手前まで確実に渡し、「もう中止なら作らない」と判断できるようにしたものに近い。

### この機能でできること

| できること         | 説明                                      | 例                                                               |
| ------------------ | ----------------------------------------- | ---------------------------------------------------------------- |
| 途中中止の伝達     | 生成開始時に作った合図を store まで渡せる | `startGeneration()` の返り値を `createSkill(..., signal)` へ渡す |
| 無駄な呼び出し防止 | すでに中止済みなら IPC 呼び出し前で止まる | `if (signal?.aborted) return ""`                                 |
| 既存経路維持       | 外向きの IPC の形は変えない               | `{ description, options, context }` を維持                       |

### 今回作ったもの

| 項目           | 内容                                            |
| -------------- | ----------------------------------------------- |
| store bridge   | `createSkill(..., signal?)`                     |
| Renderer guard | aborted signal の early return                  |
| Wizard wiring  | `startGeneration()` の返り値を第4引数へ受け渡し |
| focused tests  | store / Wizard の signal 契約を固定             |

## Part 2: 技術者向け詳細

### current contract

| 対象                               | current contract                        | 実装内容                            |
| ---------------------------------- | --------------------------------------- | ----------------------------------- |
| `AgentActions.createSkill`         | 第4引数 `signal?: AbortSignal` を受ける | `context` の後ろに optional で追加  |
| `createSkill` 実装                 | aborted signal なら early return        | IPC 前に `return ""`                |
| `SkillCreateWizard.handleGenerate` | `startGeneration()` の返り値を受け取る  | `const signal = startGeneration()`  |
| IPC payload                        | public shape 不変                       | `{ description, options, context }` |

### APIシグネチャ

```ts
type CreateSkillAction = (
  description: string,
  options: {
    generateTasks: boolean;
    addAgents: boolean;
    addReferences: boolean;
  },
  context?: SkillCreationContext,
  signal?: AbortSignal,
) => Promise<string>;

createSkill: (
  description: string,
  options: {
    generateTasks: boolean;
    addAgents: boolean;
    addReferences: boolean;
  },
  context?: SkillCreationContext,
  signal?: AbortSignal,
) => Promise<string>;
```

### 使用例

```ts
const signal = startGeneration();

const path = await createSkill(
  formData.purpose,
  SKILL_GENERATION_OPTIONS,
  skillContext,
  signal,
);
```

### エラーハンドリング

| ケース                       | 挙動                                                     |
| ---------------------------- | -------------------------------------------------------- |
| `signal?.aborted === true`   | `""` を返して IPC 呼び出しを行わない                     |
| `signal` 省略                | 従来どおり 3 引数呼び出しで動作する                      |
| cancel 後の abort-like error | 既存の Wizard 側抑制ロジックで UI failure として出さない |
| Vitest 実行環境不整合        | 製品FAILではなく worktree 環境問題として切り分ける       |

### エッジケース

| ケース                     | 判断                                                   |
| -------------------------- | ------------------------------------------------------ |
| signal を IPC へ渡したい   | 今回は不採用。AbortSignal は Renderer 制御値に留める   |
| 他 store action への横展開 | 大きな設計課題は見当たらず、新規未タスク化は不要       |
| stale unassigned 指示書    | formal workflow へ統合済みとして superseded 扱いに更新 |

### 設定項目と定数一覧

| 項目                       | 内容                                                              |
| -------------------------- | ----------------------------------------------------------------- |
| `signal?: AbortSignal`     | Renderer guard 用の optional 引数                                 |
| `SKILL_GENERATION_OPTIONS` | `{ generateTasks: true, addAgents: false, addReferences: false }` |

### テスト構成

| ファイル                                       | 役割                                       |
| ---------------------------------------------- | ------------------------------------------ |
| `agentSlice.createSkill.context.test.ts`       | signal 省略 / aborted / payload shape 維持 |
| `SkillCreateWizard.store-integration.test.tsx` | `startGeneration()` 戻り値の第4引数伝播    |

## 視覚証跡

UI/UX変更なしのため Phase 11 スクリーンショット不要

代替証跡:

- `outputs/phase-10/final-review-result.md`
- `outputs/phase-11/manual-test-result.md`
- `outputs/phase-11/UT-CANCEL-004-01-manual-test-report.md`
