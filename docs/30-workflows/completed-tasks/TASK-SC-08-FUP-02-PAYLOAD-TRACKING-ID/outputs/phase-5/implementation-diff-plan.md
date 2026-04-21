# Phase 5 成果物: implementation-diff-plan.md

## メタ情報

| 項目     | 値                                                                                        |
| -------- | ----------------------------------------------------------------------------------------- |
| Phase    | 5                                                                                         |
| タスクID | TASK-SC-08-FUP-02-PAYLOAD-TRACKING-ID                                                     |
| Lane     | Lane B                                                                                    |
| 目的     | 4 ファイル変更を 4 ステップに分解し、各ステップの before/after 差分を spec として提示する |
| 原則     | **spec-only**（phase-5 仕様書「本 spec では発行しない」準拠）                             |

## 対象ファイル

| 種別       | パス                                                                  |
| ---------- | --------------------------------------------------------------------- |
| preload 型 | `apps/desktop/src/preload/skill-creator-api.ts`                       |
| Main 送信  | `apps/desktop/src/main/ipc/skillCreatorHandlers.ts`                   |
| Runtime    | `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts` |
| Renderer   | `apps/desktop/src/renderer/hooks/useStreamingProgress.ts`             |

## 4 ステップの実装計画

| #   | ステップ                                       | 担当 Lane | 対応 AC    | 主目的                                                   |
| --- | ---------------------------------------------- | --------- | ---------- | -------------------------------------------------------- |
| 1   | 型拡張（preload）                              | Lane A    | AC-1       | `SkillCreatorProgress` に `planId?` / `requestId?` 追加  |
| 2   | Main `sendSkillCreatorProgress` シグネチャ     | Lane A    | AC-2       | progress 引数型を拡張型に追従                            |
| 3   | Runtime `executeAsync` emit 経路で planId 注入 | Lane B    | AC-2       | onProgress callback に planId を貫通                     |
| 4   | Renderer Hook フィルタ                         | Lane C    | AC-3〜AC-7 | `options?: { planId?: string }` と early return フィルタ |

## ステップ 1: 型拡張（preload）

対象: `apps/desktop/src/preload/skill-creator-api.ts`

before (L60-64):

```ts
export interface SkillCreatorProgress {
  phase: string;
  percentage: number;
  message: string;
}
```

after (spec 案):

```ts
export interface SkillCreatorProgress {
  phase: string;
  percentage: number;
  message: string;
  /**
   * 発生元 plan 識別子。Renderer Hook で options.planId と突合して filter する。
   * 後方互換のためオプショナル。
   */
  planId?: string;
  /**
   * 1 回の progress emit を一意に識別するトレーシング ID。デバッグ用途。
   */
  requestId?: string;
}
```

検証: `pnpm --filter @repo/desktop typecheck`（AC-1）

## ステップ 2: Main `sendSkillCreatorProgress` シグネチャ

対象: `apps/desktop/src/main/ipc/skillCreatorHandlers.ts`

before (L720-731):

```ts
export function sendSkillCreatorProgress(
  mainWindow: BrowserWindow,
  progress: {
    phase: string;
    percentage: number;
    message: string;
  },
): void {
  if (!mainWindow.isDestroyed()) {
    mainWindow.webContents.send(IPC_CHANNELS.SKILL_CREATOR_PROGRESS, progress);
  }
}
```

after (spec 案):

```ts
import type { SkillCreatorProgress } from "../../preload/skill-creator-api";

export function sendSkillCreatorProgress(
  mainWindow: BrowserWindow,
  progress: SkillCreatorProgress, // planId? / requestId? を含む拡張型
): void {
  if (!mainWindow.isDestroyed()) {
    mainWindow.webContents.send(IPC_CHANNELS.SKILL_CREATOR_PROGRESS, progress);
  }
}
```

補足: `webContents.send` の挙動は変更せず、payload の型だけを差し替える（破壊禁止）。既存呼び出し（`createSkill` 内 L281）は `planId` を渡さないが、オプショナルなので型的に互換。

検証:

- `pnpm --filter @repo/desktop typecheck`
- `grep -rn "sendSkillCreatorProgress" apps/desktop/src/main/`

## ステップ 3: Runtime `executeAsync` emit 経路で planId 注入

対象: `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`

現状確認（grep 結果）:

```
1292: this.workflowEngine.triggerPhaseTransition(planId, "executing", 0);
1305: this.workflowEngine.triggerPhaseTransition(planId, "complete", 100);
1308: this.workflowEngine.triggerPhaseTransition(planId, "error", 0);
1321: this.workflowEngine.triggerPhaseTransition(planId, "error", 0);
```

`triggerPhaseTransition(planId, phase, percentage)` は既に planId を保持する。progress emit 経路で Main の `sendSkillCreatorProgress` を呼ぶ際、その planId を payload に同梱する。

spec 方針（擬似コード差分）:

before（概念）:

```ts
const onProgressCallback = (progress: { phase; percentage; message }) => {
  sendSkillCreatorProgress(mainWindow, progress);
};
```

after（概念）:

```ts
const onProgressCallback = (progress: { phase; percentage; message }) => {
  sendSkillCreatorProgress(mainWindow, {
    ...progress,
    planId, // executeAsync のスコープで確定している planId を貫通
  });
};
```

ポイント:

- `executeAsync(planId, ...)` のスコープにある planId を closure として capture
- `workflowEngine.triggerPhaseTransition` 経由の snapshot push と、progress broadcast の双方で同じ planId を使用
- `requestId` を生成する場合は `crypto.randomUUID()` を onProgress 先頭で発行し、同 emit サイクル中は同値とする

検証:

- `grep -rn "sendSkillCreatorProgress" apps/desktop/src/main/` で Runtime 経由呼び出しが検出される
- targeted test は Main 側（`skillCreatorHandlers.progress.test.ts`）で planId 付き payload 送信を assert

## ステップ 4: Renderer Hook フィルタ

対象: `apps/desktop/src/renderer/hooks/useStreamingProgress.ts`

before (L72-89, L100-126):

```ts
type StreamingProgressApi = {
  onProgress?: (
    callback: (progress: {
      phase: string;
      percentage: number;
      message: string;
    }) => void,
  ) => () => void;
};

export function useStreamingProgress(): UseStreamingProgressReturn {
  // ...
  useEffect(() => {
    const api = getSkillCreatorApi();
    if (!api?.onProgress) return;
    const cleanup = api.onProgress((progress) => {
      if (progress.phase === "error") {
        /* ... */ return;
      }
      const mappedStage = mapPhaseToStage(progress.phase);
      updateProgress({
        stage: mappedStage,
        percent: progress.percentage,
        message: progress.message,
      });
    });
    return () => {
      cleanup();
      resetProgress();
    };
  }, [updateProgress, setStage, setError, resetProgress]);
}
```

after (spec 案):

```ts
export interface UseStreamingProgressOptions {
  /**
   * 指定した場合、progress.planId が一致する通知のみを受信する。
   * 未指定時は全 progress を受信（後方互換）。
   */
  planId?: string;
}

type StreamingProgressApi = {
  onProgress?: (
    callback: (progress: {
      phase: string;
      percentage: number;
      message: string;
      planId?: string;
      requestId?: string;
    }) => void,
  ) => () => void;
};

export function useStreamingProgress(
  options?: UseStreamingProgressOptions,
): UseStreamingProgressReturn {
  // ...
  useEffect(() => {
    const api = getSkillCreatorApi();
    if (!api?.onProgress) return;

    const cleanup = api.onProgress((progress) => {
      // ---- planId filter（AC-4 / AC-5 / AC-6 / AC-7）----
      if (
        options?.planId !== undefined &&
        progress.planId !== undefined &&
        progress.planId !== options.planId
      ) {
        return; // filter miss: 早期 return
      }

      if (progress.phase === "error") {
        const errorCode = parseErrorCode(progress.message);
        setStage("error");
        setError({ code: errorCode, message: progress.message });
        return;
      }

      const mappedStage = mapPhaseToStage(progress.phase);
      updateProgress({
        stage: mappedStage,
        percent: progress.percentage,
        message: progress.message,
      });
    });

    return () => {
      cleanup();
      resetProgress();
    };
  }, [
    options?.planId, // Phase 6 TC-E2: planId 変更時の再登録
    updateProgress,
    setStage,
    setError,
    resetProgress,
  ]);
  // ...
}
```

判定マトリクス（filter 条件）:

| options.planId | progress.planId | 判定 | 理由                                           |
| -------------- | --------------- | ---- | ---------------------------------------------- |
| undefined      | any             | 受理 | AC-7 no options                                |
| defined        | undefined       | 受理 | AC-6 legacy payload（planId 未設定は後方互換） |
| defined        | 同値            | 受理 | AC-4 match                                     |
| defined        | 不一致          | skip | AC-5 miss                                      |

## spec-only 宣言

| 項目         | 方針                                                                                                 |
| ------------ | ---------------------------------------------------------------------------------------------------- |
| 実装範囲     | 本 spec では上記 4 ステップの "計画" のみを提示。実コード変更 / テスト追加 / commit は別タスクで行う |
| 出力対象     | `outputs/phase-5/` 配下の Markdown 成果物のみ                                                        |
| 準拠根拠     | `phase-5-implementation.md` の「コミット / push 方針: 本 spec では発行しない（spec-only task）」     |
| Runtime 前提 | Runtime emit path の詳細実装は Lane B の「onProgressCallback 拡張」として `patch-plan.md` に続ける   |

## 参照

- phase-2-design.md 変更対象ファイル設計 / Hook filter 擬似コード
- phase-4-test-creation.md TC-01〜TC-04
- phase-1-requirements.md AC-1〜AC-9
