# Phase 12 成果物: 実装ガイド

## メタ情報

| 項目     | 内容                         |
| -------- | ---------------------------- |
| Phase    | 12                           |
| タスクID | TASK-FIX-EXECUTE-PLAN-FF-001 |
| 作成日   | 2026-04-01                   |

---

## Part 1: 中学生レベルの例え話

### なぜ必要だったか（1 文）

スキル生成には 30 分かかるのに、アプリが「5 秒以内に返事が来なければエラー」と判断してしまっていたため、処理が終わる前に「失敗」扱いになっていた。

### 何をしたか

**例え話: 宅配注文と配達通知**

**修正前（待ち続ける仕組み）**:

「宅配会社に電話して注文する。配達員が商品を届けるまで電話を切らずに待つ。30 分後に商品が届いたら電話を切る。」

→ 電話がつながりっぱなしで 30 分かかり、途中で「時間切れ（タイムアウト）」になってしまう。

**修正後（先に受け付けだけ返す仕組み）**:

「宅配会社に電話して注文する。宅配会社が『注文を受け付けました（Order No.12345）』と言ったら電話を切る。商品が届いたら、あとで『届きました』というお知らせが別でもらえる。」

→ 最初の電話は 1 秒以内に終わる。配達の作業は裏側で続いている。届いたとき・失敗したときに自動でお知らせが来る。

**この仕組みの名前**: 「ファイア・アンド・フォーゲット（打ち出したら忘れる）」パターン

---

## Part 2: 技術詳細

### 1. 型と責務の整理

| 型 / プロパティ                                                        | 定義場所                                  | 役割                                    |
| ---------------------------------------------------------------------- | ----------------------------------------- | --------------------------------------- |
| `SkillCreatorExecuteAsyncPhase = "executing" \| "complete" \| "error"` | `SkillCreatorWorkflowEngine.ts`           | 内部進捗ラベル（Renderer には非公開）   |
| `PhaseChangedCallback = (planId, phase, progress) => void`             | `SkillCreatorWorkflowEngine.ts`           | Engine → Facade への内部通知型          |
| `onPhaseChanged?: PhaseChangedCallback`                                | `SkillCreatorWorkflowEngine` インスタンス | Facade が差し込む DI フック             |
| `onWorkflowStateSnapshot?(planId, snapshot, error?)`                   | `RuntimeSkillCreatorFacade.ts`            | Facade → IPC ハンドラーへの公開 relay   |
| `SkillCreatorWorkflowUiSnapshot`                                       | `@repo/shared`                            | Renderer に渡す唯一のスナップショット型 |

Renderer には内部 phase 名（`"executing"` など）は公開しない。Renderer が受け取るのは `SkillCreatorWorkflowUiSnapshot` のみ。

### 2. API シグネチャと使用例

**IPC ハンドラー（Main Process）**:

```typescript
// creatorHandlers.ts
ipcMain.handle(IPC_CHANNELS.SKILL_CREATOR_EXECUTE_PLAN, async (event, args) => {
  validateSender(event, IPC_CHANNELS.SKILL_CREATOR_EXECUTE_PLAN, mainWindow);
  if (isBlank(args?.planId))
    return validationError("planId が指定されていません");
  if (isBlank(args?.skillSpec))
    return validationError("skillSpec が指定されていません");
  if (!runtimeSkillCreatorService)
    return validationError(RUNTIME_SKILL_CREATOR_UNAVAILABLE);
  const planId = args.planId.trim();
  void runtimeSkillCreatorService.executeAsync(planId, args); // fire-and-forget
  return { accepted: true, planId }; // 即時返却
});
```

**Renderer 側の呼び出し（preload 経由）**:

```typescript
const executeResult = await skillCreatorAPI.executePlan(
  planId,
  skillSpec,
  "api-key",
  null,
);

if (executeResult.success) {
  const unsubscribe = skillCreatorAPI.onWorkflowStateChanged((snapshot) => {
    console.log(snapshot.currentPhase, snapshot.awaitingUserInput);
  });
  // 必要に応じて unsubscribe()
}
```

> **⚠️ 現行 consumer の注意**: `SkillCreateWizard.tsx` / `SkillLifecyclePanel.tsx` は `SkillCreatorExecutePlanAck` と `SkillCreatorWorkflowUiSnapshot` を受ける compat path を持つ。`RuntimeSkillCreatorExecuteResponse` は旧 execute result の互換保持用に限定し、正本は `{ accepted: true, planId }` ack + `SKILL_CREATOR_WORKFLOW_STATE_CHANGED` snapshot relay とする。

**Facade の fire-and-forget 実行 API**:

```typescript
// RuntimeSkillCreatorFacade.ts
async executeAsync(
  planId: string,
  args: {
    planId: string;
    skillSpec: string;
    authMode?: AuthMode;
    apiKey?: string | null;
  },
): Promise<void> {
  this.workflowEngine.triggerPhaseTransition(planId, "executing", 0);
  try {
    const planResult: SkillPlanResult = {
      planId,
      skillSpec: args.skillSpec.trim(),
      estimatedSteps: 3,
      skillName: "",
      description: "",
      agents: [],
      scripts: [],
      triggers: [],
      anchors: [],
    };
    const executeResult = await this.execute(
      planResult,
      args.authMode ?? "api-key",
      args.apiKey ?? null,
    );
    const phase = /* success か error か判定 */;
    this.workflowEngine.triggerPhaseTransition(planId, phase, phase === "complete" ? 100 : 0);
  } catch (error) {
    this.workflowEngine.triggerPhaseTransition(planId, "error", 0);
    console.error("[RuntimeSkillCreatorFacade] executeAsync failed", planId, error);
  }
}
```

### 3. エラーハンドリングとエッジケース

| シナリオ                          | 処理内容                                                                                              |
| --------------------------------- | ----------------------------------------------------------------------------------------------------- |
| `planId` / `skillSpec` が空       | `validationError()` を即時返却（executeAsync は呼ばれない）                                           |
| `executeAsync` 内で例外発生       | `catch` でキャッチし `triggerPhaseTransition(planId, "error", 0)` を呼ぶ。Renderer へ例外は伝播しない |
| snapshot が存在しない状態でエラー | `onWorkflowStateSnapshot(planId, null, errorMessage)` で error fallback を送信                        |
| `mainWindow` が破棄済み           | `emitWorkflowStateChanged` がガード済みのため送信をスキップ                                           |
| 複数 planId の並列実行            | `workflows: Map<string, SkillCreatorWorkflowState>` で planId ごとに分離される                        |

### 4. 設定可能なパラメータと定数

| 定数 / 設定                                      | 値                                        | 説明                                     |
| ------------------------------------------------ | ----------------------------------------- | ---------------------------------------- |
| `IPC_TIMEOUT_MS`                                 | `5000`                                    | デフォルト IPC タイムアウト              |
| `CHANNEL_TIMEOUTS["skill-creator:execute-plan"]` | `1_800_000` (30 分)                       | execute-plan 専用タイムアウト上書き      |
| `SKILL_CREATOR_WORKFLOW_STATE_CHANGED`           | IPC event 名                              | Main→Renderer の snapshot relay イベント |
| `SkillCreatorExecuteAsyncPhase`                  | `"executing" \| "complete" \| "error"`    | 内部進捗の 3 値                          |
| `executeAsync` の progress 値                    | `0`（executing/error）/ `100`（complete） | progress は `0〜100` の範囲              |
| `SkillCreatorExecutePlanRequest` の `authMode`   | `"api-key" \| "oauth"`                    | 認証モード                               |
| `SkillCreatorExecutePlanRequest` の `apiKey`     | `string \| null`                          | `authMode === "api-key"` 時に使用        |
