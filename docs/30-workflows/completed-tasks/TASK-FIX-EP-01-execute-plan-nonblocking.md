# execute-plan IPC の非同期化（fire-and-forget化） - タスク指示書

## メタ情報

```yaml
issue_number: 1883
```

## メタ情報

| 項目           | 内容                                                                                                            |
| -------------- | --------------------------------------------------------------------------------------------------------------- |
| タスクID       | TASK-FIX-EP-01                                                                                                  |
| 正式タスクID   | TASK-FIX-EXECUTE-PLAN-FF-001                                                                                    |
| タスク名       | execute-plan IPC の非同期化（fire-and-forget化）                                                                |
| 分類           | バグ修正 / IPC非同期化シリーズ - step3                                                                          |
| 対象機能       | Skill Creator - skill-creator:execute-plan IPC チャネル                                                         |
| 優先度         | 高                                                                                                              |
| 見積もり規模   | 小規模                                                                                                          |
| ステータス     | **未実施**（ただし一部実装が先行している可能性あり。Phase 1 の調査で確認すること）                              |
| 発見元         | IPC非同期化シリーズ（auth:login IPC タイムアウト問題の横展開）                                                  |
| 発見日         | 2026-04-04                                                                                                      |
| Step           | IPC修正シリーズ step3                                                                                           |
| 依存タスク     | TASK-FIX-AUTH-IPC-001（auth:login IPC非同期化, PR#1829 完了済み）                                               |
| 後続依存       | TASK-NOTIFICATION-SERVICE-001（fix-step4, 完了済み）、TASK-FIX-LIFECYCLE-PANEL-ERROR-001（fix-step5, 完了済み） |
| 関連仕様書索引 | `docs/30-workflows/skill-creator-agent-sdk-lane/index.md`（IPC修正タスク一覧テーブル）                          |

> **注意**: fix-step4（NotificationService）と fix-step5（lifecycle-panel エラー表示修正）はすでに完了済みである。
> 本タスク（step3）は論理的には step4/step5 の前提だが、コード整備順序として先行完了している場合がある。
> Phase 1 でコードの実態を必ず確認し、実装済みの部分はテスト・仕様書同期だけを行うこと。

---

## 1. なぜこのタスクが必要か（Why）

### IPC非同期化シリーズの文脈

Skill Creator の動作中、以下の問題が段階的に発見された。

1. **発端（PR#1823 以前）**: `auth:login` チャンネルが OAuth フロー全体（最大 300 秒）を同期 await していた。`preload/ipc-utils.ts` の `CHANNEL_TIMEOUTS["auth:login"] = 500`（500ms）により即座にタイムアウトし、スキル生成が失敗するケースが頻発。

2. **fix-step1（PR#1823 完了）**: IPC チャンネル別タイムアウト設定を整備し、`auth:login` を 500ms に固定した。しかしこれは「タイムアウトを正確に設定した」だけであり、根本的な同期ブロック問題を解消していない。

3. **fix-step2（PR#1829 完了）**: `auth:login` ハンドラーを fire-and-forget 化した。OAuth フロー開始後 `{ success: true }` を即座に返し、完了通知は `AUTH_STATE_CHANGED` イベント経由とする設計に変更。

4. **fix-step3（本タスク・未実施）**: `auth:login` を非同期化しても、`skill-creator:execute-plan` 自体が同期パターンのままであれば、スキル生成の実行フェーズで再びタイムアウトが発生する。execute-plan はスキル仕様書の生成・ファイル書き込みまで担当しており、処理時間は数秒〜数分オーダーになる。

5. **fix-step4（完了）**: 非同期化後の完了通知インフラ（NotificationService, INotificationService）を整備済み。

6. **fix-step5（完了）**: `SkillLifecyclePanel` の `setWorkflowError(null)` 無条件クリアバグを修正済み。

### 現在の問題点

```
[問題の連鎖]
ipcRenderer.invoke("skill-creator:execute-plan", args)
  → ipcMain.handle で同期 await
    → RuntimeSkillCreatorFacade.execute() が数分間ブロック
      → IPC タイムアウト発生
        → renderer 側でエラー表示
          → 実際には Main 側でスキル生成は完走しているが renderer は失敗と判断
```

- `execute-plan` が同期パターンのままだと、IPC のデフォルトタイムアウト（5000ms）または設定値を超えて失敗する
- Electron の main-renderer 間 IPC が長時間ブロックされると、他の IPC 呼び出しがキューに詰まる（デッドロックリスク）
- fix-step4 の NotificationService が整備済みであるため、fire-and-forget 化の完了通知インフラは利用可能な状態にある

---

## 2. 何を達成するか（What）

### 主要ゴール

| ID   | 達成すること                                                                                  |
| ---- | --------------------------------------------------------------------------------------------- |
| G-01 | `skill-creator:execute-plan` IPC ハンドラーを fire-and-forget 化する                          |
| G-02 | ハンドラーは即座に `{ accepted: true, planId: string }` を返す（100ms 以内）                  |
| G-03 | バックグラウンドで `executeAsync()` を非同期実行する                                          |
| G-04 | 実行完了・失敗は `SKILL_CREATOR_WORKFLOW_STATE_CHANGED` イベントで renderer に通知する        |
| G-05 | renderer 側が `{ accepted: true, planId }` レスポンスを受け取った後、イベント監視に切り替える |
| G-06 | 対応するユニットテストを追加・更新する（TDD red → green）                                     |

### 変更しないこと

- `auth:login` 以外の OAuth 関連処理
- LLMAdapter 初期化エラー通知（TASK-RT-01 の責務）
- 新規 IPC チャンネルの追加（既存チャンネルのパターン変更のみ）
- `preload/ipc-utils.ts` のタイムアウト値（fix-step1 の管轄）

---

## 3. どのように実行するか（How）

### 前提条件

本タスクに着手する前に以下を確認すること。

| 確認項目                                             | 確認方法                                                                                        |
| ---------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| fix-step2（PR#1829）がマージ済みであること           | `git log --oneline` で PR#1829 のコミットが含まれることを確認                                   |
| fix-step4（NotificationService）が完了済みであること | `docs/30-workflows/skill-creator-agent-sdk-lane/index.md` の step4 欄が「完了」であることを確認 |
| `INotificationService` が利用可能であること          | `apps/desktop/src/main/services/` 配下に NotificationService の実装ファイルが存在することを確認 |

### アーキテクチャ設計

```
[fire-and-forget パターン]

Renderer                          Main (ipcMain.handle)
   |                                    |
   |── invoke("execute-plan", args) ──> |
   |                                    |── void executeAsync(planId, args)  ← バックグラウンド開始
   |<── { accepted: true, planId } ──── |  ← 即座に返す（100ms 以内）
   |                                    |
   |                                    |  [バックグラウンドで実行中...]
   |                                    |
   |<── webContents.send(            ── |  ← 完了時: SKILL_CREATOR_WORKFLOW_STATE_CHANGED
   |      "skill-creator:workflow-state-changed",
   |      snapshot
   |    )
   |
   |  [renderer がイベントで状態更新]
```

### 主要ファイルと役割

| ファイル                                                                      | 役割                                                                                |
| ----------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| `apps/desktop/src/main/ipc/creatorHandlers.ts`（line 168付近）                | execute-plan ハンドラー定義。fire-and-forget パターンに変更する主要箇所             |
| `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`         | `executeAsync()` メソッドの実装箇所。バックグラウンド実行ロジック                   |
| `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx`          | renderer 側の `handleExecutePlan` 関数。await パターン→イベント監視への切り替え     |
| `apps/desktop/src/preload/channels.ts`                                        | `SKILL_CREATOR_EXECUTE_PLAN`、`SKILL_CREATOR_WORKFLOW_STATE_CHANGED` チャンネル定義 |
| `apps/desktop/src/main/ipc/__tests__/creatorHandlers.fire-and-forget.test.ts` | TDD テストファイル（TC-T2-01〜TC-T2-07）                                            |

---

## 4. 実行手順

### Phase 1: 現状調査（作業時間の目安: 30分）

**目的**: 実装済みの部分と未実装の部分を正確に把握する。

#### 手順 1-1: Main 側ハンドラーの確認

```bash
# execute-plan ハンドラーの現在の実装を確認
grep -n "execute-plan\|executePlan\|executeAsync\|fire-and-forget\|accepted" \
  apps/desktop/src/main/ipc/creatorHandlers.ts
```

確認すべきポイント:

- `ipcMain.handle(IPC_CHANNELS.SKILL_CREATOR_EXECUTE_PLAN, ...)` のハンドラー本体
- `void runtimeSkillCreatorService.executeAsync(planId, args)` の形で fire-and-forget になっているか
- `return { accepted: true, planId }` を即座に返しているか

**期待する状態（fire-and-forget 済み）**:

```typescript
// creatorHandlers.ts
ipcMain.handle(IPC_CHANNELS.SKILL_CREATOR_EXECUTE_PLAN, async (event, args) => {
  // ... バリデーション ...
  const planId = args.planId.trim();
  void runtimeSkillCreatorService.executeAsync(planId, args); // fire-and-forget
  return { accepted: true, planId }; // 即座に返す
});
```

**未実装の状態（同期パターン）**:

```typescript
// creatorHandlers.ts（修正前）
ipcMain.handle(
  IPC_CHANNELS.SKILL_CREATOR_EXECUTE_PLAN,
  async (event, args) => {
    // ... バリデーション ...
    const result = await runtimeSkillCreatorService.execute(...);  // ブロッキング
    return { success: true, data: result };
  }
);
```

#### 手順 1-2: executeAsync メソッドの確認

```bash
# RuntimeSkillCreatorFacade の executeAsync 実装を確認
grep -n "executeAsync\|onWorkflowStateSnapshot" \
  apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts
```

確認ポイント:

- `executeAsync(planId, args)` メソッドが定義されているか
- `this.workflowEngine.triggerPhaseTransition(planId, ...)` で状態を更新しているか
- `this.onWorkflowStateSnapshot?.(planId, snapshot)` でコールバックを呼んでいるか

#### 手順 1-3: Renderer 側の確認

```bash
# SkillLifecyclePanel の handleExecutePlan を確認
grep -n "executePlan\|isExecutePlanAck\|accepted\|setActiveWorkflowId" \
  apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx
```

確認ポイント:

- `const result = await skillCreatorApi.executePlan(...)` の後に `isExecutePlanAck(result.data)` の分岐があるか
- `{ accepted: true, planId }` レスポンスを受けた場合に `setActiveWorkflowId(planId)` して workflow イベント監視に切り替えているか

#### 手順 1-4: テストファイルの確認

```bash
# fire-and-forget テストファイルの存在確認
ls apps/desktop/src/main/ipc/__tests__/creatorHandlers.fire-and-forget.test.ts 2>/dev/null && echo "存在する" || echo "存在しない"

# テストが通るか確認
pnpm --filter @repo/desktop vitest run src/main/ipc/__tests__/creatorHandlers.fire-and-forget.test.ts 2>&1 | tail -20
```

#### 手順 1-5: 調査結果の記録

以下のチェックリストを埋めて、次の Phase に進む。

| 項目                                           | 状態（済み/未実装/不明） |
| ---------------------------------------------- | ------------------------ |
| creatorHandlers.ts が fire-and-forget パターン | ?                        |
| executeAsync メソッドが存在する                | ?                        |
| renderer の isExecutePlanAck 分岐が存在する    | ?                        |
| fire-and-forget テストが存在する               | ?                        |
| fire-and-forget テストが PASS している         | ?                        |

**全項目「済み」の場合**: Phase 2〜3 はスキップし、Phase 4（テスト確認）から開始する。
**未実装項目がある場合**: 未実装項目を含む Phase から実装を開始する。

---

### Phase 2: Main 側 fire-and-forget 化（未実装の場合のみ実施）

**目的**: `creatorHandlers.ts` の execute-plan ハンドラーを fire-and-forget パターンに変更する。

#### 手順 2-1: ハンドラーの変更

`apps/desktop/src/main/ipc/creatorHandlers.ts` の execute-plan ハンドラー（`ipcMain.handle(IPC_CHANNELS.SKILL_CREATOR_EXECUTE_PLAN, ...)` のブロック）を以下の形に変更する。

**変更前（同期パターン）**:

```typescript
ipcMain.handle(
  IPC_CHANNELS.SKILL_CREATOR_EXECUTE_PLAN,
  async (event, args) => {
    validateSender(event, IPC_CHANNELS.SKILL_CREATOR_EXECUTE_PLAN, mainWindow);

    if (isBlank(args?.planId)) return validationError("planId が指定されていません");
    if (isBlank(args?.skillSpec)) return validationError("skillSpec が指定されていません");
    if (!runtimeSkillCreatorService) return validationError(RUNTIME_SKILL_CREATOR_UNAVAILABLE);

    try {
      const result = await runtimeSkillCreatorService.execute(
        { planId: args.planId.trim(), skillSpec: args.skillSpec, ... },
        args.authMode ?? "api-key",
        args.apiKey ?? null,
      );
      return { success: true, data: result };
    } catch (error) {
      return { success: false, error: sanitizeErrorMessage(error, "...") };
    }
  }
);
```

**変更後（fire-and-forget パターン）**:

```typescript
ipcMain.handle(
  IPC_CHANNELS.SKILL_CREATOR_EXECUTE_PLAN,
  async (
    event: IpcMainInvokeEvent,
    args: {
      planId: string;
      skillSpec: string;
      authMode?: AuthMode;
      apiKey?: string | null;
    },
  ): Promise<IpcResult<never> | { accepted: true; planId: string }> => {
    validateSender(event, IPC_CHANNELS.SKILL_CREATOR_EXECUTE_PLAN, mainWindow);

    if (isBlank(args?.planId))
      return validationError("planId が指定されていません");
    if (isBlank(args?.skillSpec))
      return validationError("skillSpec が指定されていません");
    if (!runtimeSkillCreatorService)
      return validationError(RUNTIME_SKILL_CREATOR_UNAVAILABLE);

    const planId = args.planId.trim();
    // fire-and-forget: バックグラウンドで非同期実行
    // snapshot 通知は executeAsync → onWorkflowStateSnapshot → SKILL_CREATOR_WORKFLOW_STATE_CHANGED に流れる
    void runtimeSkillCreatorService.executeAsync(planId, args);
    return { accepted: true, planId };
  },
);
```

**重要**: `void` は TypeScript の lint エラーを抑制するための必須キーワード（`no-floating-promises` ルール対策）。

#### 手順 2-2: executeAsync メソッドの追加（未実装の場合）

`RuntimeSkillCreatorFacade.ts` に `executeAsync` メソッドが存在しない場合のみ追加する。

```typescript
/**
 * Executor role の fire-and-forget 版。
 * IPC ハンドラーから void で呼ばれ、バックグラウンドで実行される。
 * 進捗/完了/失敗時に workflow snapshot を Renderer へ通知する。
 * Public IPC: "skill-creator:execute-plan" (fire-and-forget)
 *
 * @param planId - trimされた planId
 * @param args - IPC ハンドラーから受け取った引数オブジェクト
 */
async executeAsync(
  planId: string,
  args: {
    planId: string;
    skillSpec: string;
    authMode?: AuthMode;
    apiKey?: string | null;
  },
): Promise<void> {
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

  this.workflowEngine.triggerPhaseTransition(planId, "executing", 0);

  try {
    const executeResult = await this.execute(
      planResult,
      args.authMode ?? "api-key",
      args.apiKey ?? null,
    );

    const phase =
      typeof executeResult === "object" &&
      executeResult !== null &&
      "success" in executeResult &&
      executeResult.success === false
        ? "error"
        : "complete";
    this.workflowEngine.triggerPhaseTransition(
      planId,
      phase,
      phase === "complete" ? 100 : 0,
    );
  } catch (error) {
    this.workflowEngine.triggerPhaseTransition(planId, "error", 0);
    const errorMessage = error instanceof Error ? error.message : String(error);
    const snapshot = this.workflowEngine.getWorkflowState(planId);
    if (!snapshot) {
      this.onWorkflowStateSnapshot?.(planId, null, errorMessage);
    }
    console.error(
      "[RuntimeSkillCreatorFacade] executeAsync failed",
      planId,
      errorMessage,
    );
  }
}
```

#### 手順 2-3: onWorkflowStateSnapshot コールバックのワイヤリング確認

`creatorHandlers.ts` の `registerRuntimeSkillCreatorHandlers` 関数内で、`runtimeSkillCreatorService.onWorkflowStateSnapshot` が設定されていることを確認する。

```typescript
// registerRuntimeSkillCreatorHandlers の先頭付近
if (runtimeSkillCreatorService) {
  runtimeSkillCreatorService.onWorkflowStateSnapshot = (_planId, snapshot) => {
    if (snapshot) {
      emitWorkflowStateChanged(mainWindow, snapshot); // renderer に送信
    }
  };
}
```

`emitWorkflowStateChanged` が未定義の場合は追加する:

```typescript
function emitWorkflowStateChanged(
  mainWindow: BrowserWindow,
  snapshot: SkillCreatorWorkflowUiSnapshot,
): void {
  if (mainWindow.isDestroyed()) {
    return;
  }
  mainWindow.webContents.send(
    IPC_CHANNELS.SKILL_CREATOR_WORKFLOW_STATE_CHANGED,
    snapshot,
  );
}
```

---

### Phase 3: Renderer 側非同期パターンへの変更（未実装の場合のみ実施）

**目的**: `SkillLifecyclePanel.tsx` の `handleExecutePlan` が `{ accepted: true, planId }` を受け取った場合にイベント監視パターンに切り替えるよう変更する。

#### 手順 3-1: isExecutePlanAck 型ガードの確認

型ガード関数 `isExecutePlanAck` が存在するか確認する。

```bash
grep -n "isExecutePlanAck\|SkillCreatorExecutePlanAck" \
  apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx \
  packages/shared/src/types/*.ts 2>/dev/null
```

存在しない場合は追加する:

```typescript
// SkillCreatorExecutePlanAck 型定義（packages/shared/src/types/ 配下の適切なファイルに追加）
export interface SkillCreatorExecutePlanAck {
  accepted: true;
  planId: string;
}

// 型ガード
export function isExecutePlanAck(
  data: unknown,
): data is SkillCreatorExecutePlanAck {
  return (
    typeof data === "object" &&
    data !== null &&
    (data as Record<string, unknown>).accepted === true &&
    typeof (data as Record<string, unknown>).planId === "string"
  );
}
```

#### 手順 3-2: handleExecutePlan の変更

`SkillLifecyclePanel.tsx` の `handleExecutePlan` 関数を以下のパターンに変更する。

**変更前（同期パターン）**:

```typescript
const handleExecutePlan = async () => {
  // ...
  const result = await skillCreatorApi.executePlan(
    planId,
    approvedSkillSpec ?? undefined,
  );
  if (!result.success || !result.data) {
    setGenerationError(result.error ?? "計画実行に失敗しました");
    return;
  }
  // result.data を直接使って処理
  const executeResponse = result.data;
  // ...スキル一覧更新など同期的な後処理...
};
```

**変更後（fire-and-forget + イベント監視パターン）**:

```typescript
const handleExecutePlan = async () => {
  const planId = storePlanId ?? activePlanResult?.planId;
  if (!planId) return;

  const skillCreatorApi = getSkillCreatorApi();
  if (!skillCreatorApi?.executePlan) return;

  try {
    setIsGenerating(true);
    setDisclosureInfo(null);
    const result = await skillCreatorApi.executePlan(
      planId,
      approvedSkillSpec ?? undefined,
    );
    if (!result.success || !result.data) {
      setGenerationError(result.error ?? "計画実行に失敗しました");
      return;
    }
    if (isExecutePlanAck(result.data)) {
      // fire-and-forget モード: ack 受信後はイベント監視に移行
      setActiveWorkflowId(planId);
      if (skillCreatorApi.getWorkflowState) {
        try {
          const snapshotResult = await skillCreatorApi.getWorkflowState(planId);
          if (snapshotResult.success && snapshotResult.data) {
            setWorkflowSnapshot(snapshotResult.data);
            setWorkflowError(null);
            if (await processWorkflowOutcome(snapshotResult.data)) {
              await loadVerifyDetail(planId);
              return;
            }
          }
        } catch {
          // ack 受理後の snapshot 取得失敗は後続の workflow event に委譲する
        }
      }
      await loadVerifyDetail(planId);
      return;
    }
    // ... 旧パターン（後方互換）の処理は残す ...
  } catch (error) {
    setGenerationError(
      error instanceof Error ? error.message : "予期しないエラーが発生しました",
    );
  } finally {
    setIsGenerating(false);
  }
};
```

**重要な設計ポイント**:

- `isExecutePlanAck` で `{ accepted: true }` を判定したら、イベント（`SKILL_CREATOR_WORKFLOW_STATE_CHANGED`）の到着を待つ
- `setActiveWorkflowId(planId)` を設定することで `onWorkflowStateChanged` リスナーが planId に対応するイベントを受け取れるようになる
- `getWorkflowState` で現時点の snapshot を1回取得することで、すでに完了済みの場合も対応できる

---

### Phase 4: テスト追加・更新

**目的**: fire-and-forget パターンの動作を保証するテストを追加・確認する。

#### 手順 4-1: fire-and-forget テストの確認と実行

```bash
# テストファイルが存在する場合
pnpm --filter @repo/desktop vitest run \
  src/main/ipc/__tests__/creatorHandlers.fire-and-forget.test.ts 2>&1 | tail -30
```

**テストケース一覧（TC-T2-xx）**:

| テストID | 内容                                                                     | 期待結果                                 |
| -------- | ------------------------------------------------------------------------ | ---------------------------------------- |
| TC-T2-01 | invoke が 100ms 以内に `{ accepted: true, planId }` を返す               | elapsed < 100ms                          |
| TC-T2-02 | バックグラウンドで `executeAsync` が呼ばれる                             | `mockFacade.executeAsync` が呼ばれている |
| TC-T2-03 | `executeAsync` がエラーを throw しても invoke は正常に返る               | `{ accepted: true, planId }` が返る      |
| TC-T2-04 | 複数の planId が並列で invoke されてもそれぞれ受け付けられる             | 全ての結果が `{ accepted: true, ... }`   |
| TC-T2-05 | 1回目の executeAsync がエラーになった後、2回目の invoke が正常に動作する | 両方とも正常レスポンス                   |
| TC-T2-06 | planId が req から正しく抽出されて executeAsync に渡される               | `executeAsync` に正しい planId が渡る    |
| TC-T2-07 | 10件の並列 invoke が全て 100ms 以内に `{ accepted: true }` を返す        | elapsed < 100ms かつ全て accepted        |

テストファイルが存在しない場合は、`apps/desktop/src/main/ipc/__tests__/creatorHandlers.fire-and-forget.test.ts` として新規作成する（TC-T2-01〜TC-T2-07 を含む）。

#### 手順 4-2: 既存テストの回帰確認

```bash
# creatorHandlers 関連テスト全体を実行
pnpm --filter @repo/desktop vitest run src/main/ipc/__tests__/ 2>&1 | tail -40

# SkillLifecyclePanel 関連テスト
pnpm --filter @repo/desktop vitest run \
  src/renderer/components/skill/__tests__/SkillLifecyclePanel 2>&1 | tail -30
```

#### 手順 4-3: RuntimeSkillCreatorFacade のテスト確認

```bash
pnpm --filter @repo/desktop vitest run \
  src/main/services/runtime/__tests__/ 2>&1 | tail -30
```

---

### Phase 5: 完了確認と後処理

#### 手順 5-1: 型チェック

```bash
CLAUDE_SKIP_HEAVY_HOOKS=1 pnpm --filter @repo/desktop typecheck 2>&1 | grep -E "error|Error" | head -20
```

#### 手順 5-2: Lint

```bash
pnpm --filter @repo/desktop lint 2>&1 | grep -E "error|Error" | head -20
```

#### 手順 5-3: 全テスト実行

```bash
pnpm --filter @repo/desktop test 2>&1 | tail -40
```

#### 手順 5-4: 仕様書の同期

`docs/30-workflows/skill-creator-agent-sdk-lane/index.md` の step3 ステータス欄を「未着手」から「完了」に更新する。

```markdown
# 変更対象の行（index.md の実行状況テーブル）

| step3 | TASK-FIX-EXECUTE-PLAN-FF-001 | ✅ **完了** | — |
```

---

## 5. 完了条件チェックリスト

### 実装面

- [ ] `creatorHandlers.ts` の execute-plan ハンドラーが fire-and-forget パターンになっている
- [ ] `runtimeSkillCreatorService.executeAsync(planId, args)` を `void` で呼び出している
- [ ] ハンドラーが即座に `{ accepted: true, planId: string }` を返す
- [ ] `RuntimeSkillCreatorFacade.executeAsync()` メソッドが実装されている
- [ ] `onWorkflowStateSnapshot` コールバックが `SKILL_CREATOR_WORKFLOW_STATE_CHANGED` に接続されている
- [ ] renderer の `handleExecutePlan` が `isExecutePlanAck` で分岐し、イベント監視に切り替えている

### テスト面

- [ ] `creatorHandlers.fire-and-forget.test.ts` が存在し、TC-T2-01〜TC-T2-07 が全て PASS
- [ ] 既存の `creatorHandlers.test.ts` が PASS（回帰なし）
- [ ] 既存の `SkillLifecyclePanel.llm-generation.test.tsx` が PASS（回帰なし）
- [ ] `RuntimeSkillCreatorFacade` の関連テストが PASS

### 品質面

- [ ] `pnpm --filter @repo/desktop typecheck` がエラー 0
- [ ] `pnpm --filter @repo/desktop lint` がエラー 0

### ドキュメント面

- [ ] `docs/30-workflows/skill-creator-agent-sdk-lane/index.md` の step3 ステータスを「完了」に更新

---

## 6. 検証方法

### 単体検証（自動）

```bash
# fire-and-forget テスト（TC-T2-01〜TC-T2-07）
pnpm --filter @repo/desktop vitest run \
  src/main/ipc/__tests__/creatorHandlers.fire-and-forget.test.ts

# 回帰確認
pnpm --filter @repo/desktop vitest run src/main/ipc/__tests__/
```

### 統合検証（手動）

1. `pnpm --filter @repo/desktop dev` でアプリを起動する
2. Skill Creator を開き、スキル作成のリクエストを入力する
3. 「計画を立てる」ボタンをクリックし、プランが生成されることを確認する
4. 「実行する」ボタンをクリックし、以下を確認する:
   - ボタンクリック後、UI がすぐに「実行中」状態に切り替わる（100ms 以内にレスポンスが返る）
   - タイムアウトエラーが発生しない
   - workflow 進捗が UI に表示される（`SKILL_CREATOR_WORKFLOW_STATE_CHANGED` イベント経由）
   - スキル生成が完了すると「完了」状態に遷移する
5. Electron の DevTools（Console タブ）で IPC タイムアウトエラーが出ていないことを確認する

---

## 7. リスクと対策

| リスク                                                                                    | 発生確率 | 対策                                                                                                 |
| ----------------------------------------------------------------------------------------- | -------- | ---------------------------------------------------------------------------------------------------- |
| 既存テストが `execute-plan` の同期レスポンスを前提にしている                              | 中       | Phase 4-2 で回帰テストを実行し、失敗したテストのモックを `{ accepted: true, planId }` 形式に更新する |
| renderer が `{ accepted: true }` パターンに対応していない                                 | 中       | Phase 1-3 で確認し、未対応なら Phase 3 で実装する                                                    |
| `executeAsync` がエラーを投げた場合に renderer に通知が届かない                           | 低       | `executeAsync` の catch ブロックで `onWorkflowStateSnapshot?.(planId, null, errorMessage)` を呼ぶ    |
| `SKILL_CREATOR_WORKFLOW_STATE_CHANGED` イベントが renderer 到達前にウィンドウが破棄される | 低       | `emitWorkflowStateChanged` 内で `mainWindow.isDestroyed()` チェックを行う                            |
| fire-and-forget 化で複数の planId が並列実行され、状態が混在する                          | 低       | イベントペイロードに `planId` を含め、renderer が自分の planId のみを処理するようにする              |

---

## 8. 参照情報

### IPC非同期化シリーズの経緯（教訓）

#### 問題の発端

`auth:login` IPC チャンネルが OAuth フロー（最大 300 秒）の全完了を `await` していた。`preload/ipc-utils.ts` に設定された `CHANNEL_TIMEOUTS["auth:login"] = 500`（PR#1823）により、500ms 以内のレスポンスが期待されるが、OAuth フローがそれを超えることは自明だった。

#### fix-step2 の教訓（auth:login 非同期化）

**苦戦箇所 1: パイプライン詰まり**

`auth:login` が同期 await になっていた期間、IPC 待機キューが詰まり、他の無関係な IPC 呼び出しも遅延・失敗するケースがあった。Electron の IPC は single-threaded であり、一つのハンドラーが長時間ブロックすると後続の全ハンドラーに影響する。`execute-plan` でも同じ問題が発生し得る。

**苦戦箇所 2: 通知責務の重複**

`auth:login` を fire-and-forget 化した際、`authHandlers.ts` と `AuthFlowOrchestrator` の両方が `AUTH_STATE_CHANGED` を送信しようとして二重通知が発生した。対策: ハンドラー側で通知を送信せず、通知責務を `AuthFlowOrchestrator` に一本化した。

`execute-plan` でも同様に:

- `creatorHandlers.ts` は `{ accepted: true, planId }` を返すだけ
- 進捗・完了の通知は `executeAsync` → `onWorkflowStateSnapshot` → `emitWorkflowStateChanged` に一本化する

**苦戦箇所 3: renderer 側の状態管理**

renderer が `await ipcRenderer.invoke("auth:login")` の結果を同期的に期待していたため、fire-and-forget 化後に「ログイン完了」の判定が難しくなった。`AUTH_STATE_CHANGED` イベントをリスニングするパターンに切り替える必要があった。

`execute-plan` でも同様に:

- `await skillCreatorApi.executePlan(...)` が `{ accepted: true }` を返した時点では、実行は始まっているがまだ完了していない
- `SKILL_CREATOR_WORKFLOW_STATE_CHANGED` イベントを受け取るまで、renderer は「実行中」状態を維持する必要がある
- `setActiveWorkflowId(planId)` を設定することで、イベントリスナーが正しい planId のイベントを拾えるようにする

#### execute-plan 特有の苦戦箇所

**stale な実行結果の取り扱い**

`executeAsync` が完了する前に renderer が別の操作（中断ボタンなど）を行った場合、後から届く `SKILL_CREATOR_WORKFLOW_STATE_CHANGED` をどう処理するか。`planId` で判定し、現在のアクティブな planId と一致しない場合はイベントを無視する。

**進捗表示と最終完了の区別**

`onWorkflowStateSnapshot` は進捗更新（`executing` 状態）と最終完了（`complete`/`error` 状態）の両方で呼ばれる。renderer はスナップショットの `phase` フィールドを見て UI を更新する。`processWorkflowOutcome()` はスナップショットを受け取り、`complete` または `error` の場合に後続処理（スキル一覧更新など）を行う。

### 関連ファイル一覧

| ファイルパス                                                                          | 説明                                        |
| ------------------------------------------------------------------------------------- | ------------------------------------------- |
| `apps/desktop/src/main/ipc/creatorHandlers.ts`                                        | execute-plan ハンドラー（line 168付近）     |
| `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`                 | `executeAsync()` メソッド（line 942付近）   |
| `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx`                  | `handleExecutePlan` 関数（line 1257付近）   |
| `apps/desktop/src/preload/channels.ts`                                                | `SKILL_CREATOR_EXECUTE_PLAN` チャンネル定数 |
| `apps/desktop/src/main/ipc/__tests__/creatorHandlers.fire-and-forget.test.ts`         | fire-and-forget TDD テスト（TC-T2-01〜07）  |
| `docs/30-workflows/skill-creator-agent-sdk-lane/index.md`                             | IPC修正タスク一覧（step3 ステータス欄）     |
| `docs/30-workflows/completed-tasks/fix-step2-seq-auth-login-ipc-nonblocking/index.md` | auth:login 非同期化の完了仕様書（参考）     |

### 関連 PR・タスク

| ID                                 | 内容                                        | ステータス |
| ---------------------------------- | ------------------------------------------- | ---------- |
| PR#1823                            | IPC チャンネル別タイムアウト設定            | 完了       |
| PR#1829                            | auth:login IPC fire-and-forget 化           | 完了       |
| TASK-FIX-AUTH-IPC-001              | auth:login 非同期化（fix-step2）            | 完了       |
| TASK-NOTIFICATION-SERVICE-001      | NotificationService 整備（fix-step4）       | 完了       |
| TASK-FIX-LIFECYCLE-PANEL-ERROR-001 | lifecycle-panel エラー表示修正（fix-step5） | 完了       |

---

## 9. 備考

### 実装確認の重要性

本仕様書の作成時点（2026-04-04）で、コードベースを調査した結果:

- `creatorHandlers.ts` の execute-plan ハンドラーはすでに fire-and-forget パターンで実装されている可能性がある（line 196-199 付近: `void runtimeSkillCreatorService.executeAsync(planId, args); return { accepted: true, planId };`）
- `RuntimeSkillCreatorFacade.ts` の `executeAsync` メソッドも実装済みの可能性がある（line 942付近）
- `SkillLifecyclePanel.tsx` の `handleExecutePlan` も `isExecutePlanAck` 分岐を持つ可能性がある（line 1277付近）
- `creatorHandlers.fire-and-forget.test.ts` も存在する可能性がある

**必ず Phase 1 の調査を最初に実施すること。** 既に実装済みの部分を再実装すると、テストが壊れる可能性がある。

### タスクIDの表記について

本仕様書のファイル名は `TASK-FIX-EP-01`（内部整理用の短縮ID）だが、正式なタスクIDは `TASK-FIX-EXECUTE-PLAN-FF-001` である。`docs/30-workflows/skill-creator-agent-sdk-lane/index.md` および `docs/30-workflows/completed-tasks/fix-step2-seq-auth-login-ipc-nonblocking/index.md` では正式IDが使用されている。

### 「100人中100人が同じ理解で実行できる」ポイント

1. **Phase 1 を必ず最初に実施する**: 実装状況によって Phase 2〜3 をスキップできる
2. **fire-and-forget = void + 即座に返す**: `await` を除去し、`void` キーワードで floating promise を許可する
3. **renderer は ack 受信後にイベント監視に切り替える**: `isExecutePlanAck(result.data)` が true なら `setActiveWorkflowId(planId)` して後続イベントを待つ
4. **通知は SKILL_CREATOR_WORKFLOW_STATE_CHANGED 一本**: 進捗も完了も同じイベントチャンネルで `phase` フィールドで区別する
5. **テストは TC-T2-01〜TC-T2-07 を全て PASS させる**: 特に TC-T2-01（100ms 以内）と TC-T2-03（エラーでも invoke は成功）が重要
