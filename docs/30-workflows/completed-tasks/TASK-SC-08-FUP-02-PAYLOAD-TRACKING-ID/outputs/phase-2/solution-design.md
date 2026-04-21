# Phase 2 成果物: 解決策設計（solution-design）

## 目的

Phase 1 で確定した AC-1 〜 AC-9 を満たすため、
型・関数・Hook・テストの変更設計を確定し、SubAgent lane 分割と検証導線を定義する。

## 設計方針

| 観点           | 方針                                                                                          |
| -------------- | --------------------------------------------------------------------------------------------- |
| 後方互換       | `planId` / `requestId` / `options.planId` すべてオプショナル。既存呼び出し無変更で動作する    |
| フィルタ論理   | `options.planId !== undefined && progress.planId !== undefined && 値が不一致` のみスキップ    |
| Runtime ルート | `executeAsync` で progress を emit する箇所に planId を貫通（必要なら callback 注入を設計）   |
| 破壊禁止       | progress チャンネルの多重化は行わない（payload メタデータ戦略）                               |
| テスト方針     | 既存テストは PASS を維持。新規 4 シナリオ（match / miss / legacy payload / no options）を追加 |

### 後方互換ポリシー（オプショナルフィールド運用）

1. **`SkillCreatorProgress`**: `planId?: string` / `requestId?: string` をオプショナル追加。
   既存の `{ phase, percentage, message }` のみの payload は型エラーにならない
2. **`sendSkillCreatorProgress`**: progress 引数型にオプショナルフィールドを追加。
   旧呼出箇所（`skillCreatorHandlers.ts:281` の createSkill ルート）は planId 未付与でも動作継続
3. **`useStreamingProgress`**: `options?: { planId?: string }`。
   options 未指定の呼出（現状の `useStreamingProgress()` callsite）は全通知を受け入れる挙動を維持
4. **フィルタ条件**: 「`options.planId` と `progress.planId` の両方が指定されたとき、値不一致の場合のみスキップ」。
   いずれかが undefined の場合は受け入れる（素人思考的にも自然な「分からないなら通す」）

## 変更対象ファイル設計

| #   | ファイル                                                              | 変更内容                                                                        |
| --- | --------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| 1   | `apps/desktop/src/preload/skill-creator-api.ts`                       | `SkillCreatorProgress` に `planId?: string` / `requestId?: string` を追加       |
| 2   | `apps/desktop/src/main/ipc/skillCreatorHandlers.ts`                   | `sendSkillCreatorProgress` の progress 引数型に `planId?` / `requestId?` を追加 |
| 3   | `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts` | progress emit 経路に planId 注入（onProgressCallback シグネチャ見直しを含む）   |
| 4   | `apps/desktop/src/renderer/hooks/useStreamingProgress.ts`             | `options?: { planId?: string }` を追加し、受信コールバック先頭で filter 分岐    |

### ファイル 1: `skill-creator-api.ts`

```typescript
export interface SkillCreatorProgress {
  phase: string;
  percentage: number;
  message: string;
  /** 発生元の planId。複数 executePlan 並行時の混線防止に使用 */
  planId?: string;
  /** 発生元の requestId（UI インタラクション識別用） */
  requestId?: string;
}
```

### ファイル 2: `skillCreatorHandlers.ts`

```typescript
export function sendSkillCreatorProgress(
  mainWindow: BrowserWindow,
  progress: {
    phase: string;
    percentage: number;
    message: string;
    planId?: string;
    requestId?: string;
  },
): void {
  if (!mainWindow.isDestroyed()) {
    mainWindow.webContents.send(IPC_CHANNELS.SKILL_CREATOR_PROGRESS, progress);
  }
}
```

### ファイル 3: `RuntimeSkillCreatorFacade.ts`

Runtime ルートは現状 `skill-creator:progress` を **直接 emit していない**（Phase 1 監査で確認）。
`workflowEngine.triggerPhaseTransition(planId, phase, percentage)` → `onWorkflowStateSnapshot(planId, snapshot)` 経路のみ。

Phase 5 実装計画では以下を調査・決定する：

- Runtime ルートでも `skill-creator:progress` へ emit する必要があるか
- その場合、`onProgressCallback?: (progress: SkillCreatorProgress) => void` を facade にコンストラクタ注入する
- `executeAsync` 内の各 `triggerPhaseTransition` 呼出後に callback を呼び、`planId` を payload に載せる

### ファイル 4: `useStreamingProgress.ts`

- Hook シグネチャ: `useStreamingProgress(options?: { planId?: string })`
- useEffect 依存配列に `options?.planId` を追加
- callback 先頭で filter 分岐

## Hook filter 擬似コード

```typescript
const cleanup = api.onProgress((progress) => {
  if (
    options?.planId !== undefined &&
    progress.planId !== undefined &&
    progress.planId !== options.planId
  ) {
    return; // filter out
  }

  if (progress.phase === "error") {
    handleError(progress);
    return;
  }

  updateProgress({
    stage: mapPhaseToStage(progress.phase),
    percent: progress.percentage,
    message: progress.message,
  });
});
```

## 検証導線（5 ステップ）

1. 型変更（Lane A）→ `pnpm --filter @repo/desktop typecheck`
2. Main 送信シグネチャ（Lane A）→ `grep -rn "sendSkillCreatorProgress" apps/desktop/src/main/`
3. Runtime emit 経路（Lane B）→ `executeAsync` / `onWorkflowStateSnapshot` の呼び出し元全捕捉
4. Hook フィルタ（Lane C）→ `pnpm --filter @repo/desktop test -- --run useStreamingProgress`
5. 全体回帰（Lane D）→ `pnpm --filter @repo/desktop test -- --run skill-creator`

## 成果物

| 成果物             | パス                                    |
| ------------------ | --------------------------------------- |
| solution design    | `outputs/phase-2/solution-design.md`    |
| subagent lane plan | `outputs/phase-2/subagent-lane-plan.md` |
| validation path    | `outputs/phase-2/validation-path.md`    |

## 参照資料

- [phase-1-requirements.md](../../phase-1-requirements.md)
- `.claude/skills/aiworkflow-requirements/references/api-ipc-system-skill-creator.md`
- `.claude/skills/aiworkflow-requirements/references/arch-state-management-skill-creator.md`

## 完了条件

- [x] 4 ファイル変更範囲と責務境界が明記されている
- [x] 後方互換ポリシー（オプショナルフィールド運用）が明記されている
- [x] Hook filter 擬似コードが記述されている
- [x] Runtime ルート emit 経路調査の方針が記録されている
- [x] 検証導線 5 ステップが定義されている
