# TASK-SC-ABORT-SIGNAL-CREATE-SKILL-001 実装ガイド

## Part 1: はじめて読む人向け

### なぜ必要か

スキル作成を途中で止めたいとき、外側だけ止まっても中で動いている作業が止まらないと不安定になる。だから、入口でも「もう止まっているか」を毎回確かめる必要がある。

### たとえば

たとえば、教室の前の札だけ「入室禁止」に変えても、中の係の人がその札を見ていなければ人を通してしまう。今回やったのは、受付だけでなく教室の入口でも札を確認するようにした、という整理に近い。

### この機能でできること

| できること | 説明                                             | 例                               |
| ---------- | ------------------------------------------------ | -------------------------------- |
| 入口で停止 | private workflow が開始前に abort 済みか確認する | `runCreateWorkflow(..., signal)` |
| 回帰防止   | private minimal test で入口保証を固定する        | aborted signal テスト            |

### 今回作ったもの

| 項目          | 内容                                                            |
| ------------- | --------------------------------------------------------------- |
| private guard | `runOrchestrateWorkflow()` / `runCreateWorkflow()` の入口 guard |
| テスト        | private minimal test 4件                                        |
| close-out     | Phase 11 / 12 / 13 の task-specific outputs                     |

## Part 2: 技術者向け詳細

### current contract

| 対象                       | current contract                                                       | target delta                           |
| -------------------------- | ---------------------------------------------------------------------- | -------------------------------------- |
| `runOrchestrateWorkflow()` | private method、`signal` を受ける                                      | 先頭で `throwIfAborted(signal)` を実行 |
| `runCreateWorkflow()`      | private method、`signal` を受ける                                      | 先頭で `throwIfAborted(signal)` を実行 |
| public flow                | `createSkill()` が `AbortController` を生成し `operationSignal` を渡す | 維持                                   |

### APIシグネチャ

```ts
type PrivateWorkflowAbortTarget = {
  options: CreateSkillOptions;
  signal?: AbortSignal;
};

private async runOrchestrateWorkflow(
  options: CreateSkillOptions,
  signal?: AbortSignal,
): Promise<void>

private async runCreateWorkflow(
  options: CreateSkillOptions,
  signal?: AbortSignal,
): Promise<StructurePlanJson | null>
```

### 使用例

```ts
const controller = new AbortController();
controller.abort();

await service.runCreateWorkflow(
  { name: "test-skill", description: "テスト", mode: "create" },
  controller.signal,
);
// => AbortError
```

### エラーハンドリング

| ケース                           | 挙動                                                          |
| -------------------------------- | ------------------------------------------------------------- |
| `signal.aborted === true`        | `throwIfAborted(signal)` が `AbortError` を投げる             |
| `signal` なし                    | 既存挙動を維持し正常に進行する                                |
| `runCreateWorkflow()` の通常例外 | 既存どおり `createSkill()` 側で fallback / rethrow を判断する |

### エッジケース

| ケース                      | 判断                                                                |
| --------------------------- | ------------------------------------------------------------------- |
| private method 単体呼び出し | task scope 内。最小 direct test で固定する                          |
| public cancel 契約との重複  | 既存テストを維持し、新規追加は private 入口保証のみに絞る           |
| Vitest 実行環境不整合       | `esbuild` mismatch は実装不具合ではなく依存環境問題として切り分ける |

### 設定項目と定数一覧

| 項目                   | 内容                                            |
| ---------------------- | ----------------------------------------------- |
| `signal?: AbortSignal` | private workflow 入口で即時確認する             |
| `CreateSkillOptions`   | 既存の mode / name / description 契約を維持する |

### テスト構成

| ファイル                             | 役割                                      |
| ------------------------------------ | ----------------------------------------- |
| `SkillCreatorService.test.ts`        | 既存の正常系 / public flow 回帰           |
| `SkillCreatorService-cancel.test.ts` | public cancel 契約 + private minimal test |

## 視覚証跡

UI/UX変更なしのため Phase 11 スクリーンショット不要

代替証跡:

- `outputs/phase-10/final-review-result.md`
- `outputs/phase-11/manual-test-result.md`
- `outputs/phase-11/TASK-SC-ABORT-SIGNAL-CREATE-SKILL-001-manual-test-report.md`
