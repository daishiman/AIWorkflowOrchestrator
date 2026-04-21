# Phase 1 成果物: 実装監査（current-implementation-audit）

## 目的

現状の 4 実装ファイル + 1 テストファイルを grep/read で精査し、
Phase 2 設計の入力として正確な行番号・スニペット・呼び出し経路を記録する。

## 1. `SkillCreatorProgress` 型の現状

### ファイル

`apps/desktop/src/preload/skill-creator-api.ts`

### 該当箇所（L60-64）

```typescript
/**
 * 進捗通知データ型
 */
export interface SkillCreatorProgress {
  phase: string;
  percentage: number;
  message: string;
}
```

### 所見

- `planId` / `requestId` フィールド **不在**
- `onProgress` callback の型 (L333-335) は `callback: (progress: SkillCreatorProgress) => void`
- Phase 2 で `planId?: string` / `requestId?: string` をオプショナル追加 → 既存呼び出し無変更で動作する

### 関連箇所

- L679-682: `onProgress` 実装は `safeOn<SkillCreatorProgress>(IPC_CHANNELS.SKILL_CREATOR_PROGRESS, callback)` を経由
- L437-456: `safeOn` は `ALLOWED_ON_CHANNELS` を検査し `ipcRenderer.on` でリスナー登録

---

## 2. `sendSkillCreatorProgress` のシグネチャと呼び出し箇所

### ファイル

`apps/desktop/src/main/ipc/skillCreatorHandlers.ts`

### シグネチャ（L720-731）

```typescript
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

### 呼び出し箇所

- L281（`skill-creator:create` ハンドラ内）:
  ```typescript
  const skillDir = await skillCreatorService.createSkill(
    validatedArgs,
    (progress) => {
      sendSkillCreatorProgress(mainWindow, progress);
    },
  );
  ```
- 既存テストからの呼び出し（参考のみ）:
  - `apps/desktop/src/main/ipc/__tests__/skillCreatorHandlers.progress.test.ts` TC-01
  - `apps/desktop/src/main/ipc/__tests__/skillCreatorHandlers.validation.test.ts` L667-690（`describe("sendSkillCreatorProgress", () => …")`）
  - `apps/desktop/src/main/ipc/__tests__/skillCreatorIpc.integration.test.ts` L590, 597, 614, 1016, 1035, 1056, 1074, 1089, 1104, 1123, 1142, 1164, 1172, 1230

### 所見

- Runtime ルート側（`executeAsync`）からは **直接 `sendSkillCreatorProgress` を呼んでいない**（grep 結果より）
- Phase 2 で progress 引数型に `planId?` / `requestId?` を追加可能（後方互換）
- 内部実装は `webContents.send` をそのまま実行するだけなので、payload 拡張はそのまま素通り

---

## 3. Runtime `executeAsync` の progress emit 経路

### ファイル

`apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`

### 該当箇所

- L235-239（コンストラクタ内の `onPhaseChanged` 登録）:
  ```typescript
  this.workflowEngine.onPhaseChanged = (planId) => {
    const snapshot = this.workflowEngine.getWorkflowState(planId);
    // …
    this.onWorkflowStateSnapshot?.(planId, snapshot);
  };
  ```
- L1250-1266 付近: `onWorkflowStateSnapshot?: (planId: string, snapshot, errorMessage?) => void`
- L1271-1330 `executeAsync`:
  ```typescript
  async executeAsync(
    planId: string,
    params: { planId: string; … },
  ): Promise<void> {
    // …
    this.workflowEngine.triggerPhaseTransition(planId, "executing", 0);
    // … 実行 …
    this.workflowEngine.triggerPhaseTransition(planId, "complete", 100);
    // 失敗時
    this.workflowEngine.triggerPhaseTransition(planId, "error", 0);
    const snapshot = this.workflowEngine.getWorkflowState(planId);
    this.onWorkflowStateSnapshot?.(planId, snapshot ?? null, errorMessage);
  }
  ```

### 所見

- Runtime ルートは `workflowEngine.triggerPhaseTransition(planId, phase, percentage)` を経由して
  `onWorkflowStateSnapshot` コールバックへ snapshot を push している
- `skill-creator:progress` IPC チャンネルへの **直接 emit は存在しない**（grep 結果で `sendSkillCreatorProgress` の呼び出しは `skillCreatorHandlers.ts` L281 のみ）
- したがって Phase 2 では、Runtime ルートから `skill-creator:progress` へも progress を貫通させる経路を
  callback 注入（`onProgressCallback`）等で追加するかの **設計判断**が必要
- emit 経路を追加する場合、`planId` / `requestId` も同時に payload へ付与する

### 関連箇所

- L1100 付近: `const planId = \`plan-${Date.now()}\`;` で planId 生成
- L1188, 1208, 1210, 1239: `planId` が sessionId / governanceHooks 等へ伝播している

---

## 4. `useStreamingProgress` の onProgress callback 構造

### ファイル

`apps/desktop/src/renderer/hooks/useStreamingProgress.ts`

### 該当箇所（L100-126）

```typescript
useEffect(() => {
  const api = getSkillCreatorApi();
  if (!api?.onProgress) return;

  // P5 対策: safeOn が返すクリーンアップ関数を保持
  const cleanup = api.onProgress((progress) => {
    // エラーチェック
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
}, [updateProgress, setStage, setError, resetProgress]);
```

### 所見

- 現状の Hook シグネチャ (L89): `export function useStreamingProgress(): UseStreamingProgressReturn`
  → **引数なし**
- callback 内で **無条件に** `updateProgress` を呼んでおり、planId フィルタは存在しない
- Phase 2 では `options?: { planId?: string }` を受け取り、callback 先頭で
  `options?.planId !== undefined && progress.planId !== undefined && 値不一致` のみ return する分岐を追加
- `useEffect` の依存配列に `options?.planId` を含めるかどうかは Phase 3 レビュー観点

### Phase → Stage マッピング（L29-50）

- create モード: `planning`, `generating-skill`, `generating-agents`, `validating`, `done`
- collaborative モード: `interview`, `consensus` → `planning`
- update モード: `loading-skill`, `analyzing` → `planning`
- orchestrate モード: `engine-selection` → `planning`
- improve-prompt モード: `improving` → `generating-skill`

---

## 5. 既存テスト `useStreamingProgress.test.ts` のシナリオ数と観点

### ファイル

`apps/desktop/src/renderer/hooks/__tests__/useStreamingProgress.test.ts`

### シナリオ集計

| Describe ブロック                       | 観点                                                  | it 数（概算） |
| --------------------------------------- | ----------------------------------------------------- | ------------- |
| 初期状態                                | idle 初期値                                           | 1             |
| IPC リスナー登録                        | onProgress 登録確認                                   | 1             |
| P5: クリーンアップ                      | アンマウント時 cleanup 呼び出し                       | 1             |
| 進捗更新                                | stage / percent / message                             | 3             |
| エラー処理                              | API_KEY / NETWORK / LLM_ERROR                         | 3             |
| 未知のフェーズ                          | planning フォールバック                               | 1             |
| electronAPI 不在                        | クラッシュしない                                      | 1             |
| リスナーライフサイクル（P5対策）        | 再マウント時の二重登録防止 等                         | 2             |
| モード別phaseマッピング（TC-00〜TC-09） | collaborative / update / orchestrate / improve-prompt | 10            |
| 全ステージマッピング                    | 5 ステージ × mapping 確認                             | 5             |
| generationProgressSlice アクション      | slice 動作                                            | 5             |
| isGenerating フラグ                     | active phases / error / idle                          | 6             |
| hook から UI への反映                   | GenerateStep 連動                                     | 1             |

**合計**: 約 40 シナリオ規模

### 観点

- Zustand store の `resetStreamingProgress()` を `beforeEach` でリセット
- `mockOnProgress = vi.fn(() => mockCleanup)` で mock callback を注入
- callback 内引数を `mockOnProgress.mock.calls[0][0]` で取り出し、`act()` 内で直接呼び出してストア更新を検証
- Phase 2 の新規 4 シナリオ（match / miss / legacy payload / no options）はこの mock 基盤を再利用可能

### 所見

- 既存テストは `{ phase, percentage, message }` の 3 プロパティのみを progress として渡しており、
  オプショナルフィールド `planId` / `requestId` を追加しても破壊されない（AC-8 担保）
- 新規 4 シナリオは `{ phase, percentage, message, planId? }` の 4 プロパティと `options?.planId` の組合せを検証

---

## 参考: 全呼び出し箇所サマリ

| 対象                                | 場所                                                    |
| ----------------------------------- | ------------------------------------------------------- |
| `sendSkillCreatorProgress` 定義     | `skillCreatorHandlers.ts:720`                           |
| `sendSkillCreatorProgress` 本番呼出 | `skillCreatorHandlers.ts:281`（createSkill ハンドラ内） |
| `onWorkflowStateSnapshot` 定義      | `RuntimeSkillCreatorFacade.ts:1250`                     |
| `executeAsync` 定義                 | `RuntimeSkillCreatorFacade.ts:1271`                     |
| `triggerPhaseTransition` 呼出       | `RuntimeSkillCreatorFacade.ts:1292, 1305, 1308, 1321`   |
| `onProgress` 型定義                 | `skill-creator-api.ts:333-335`                          |
| `onProgress` 実装                   | `skill-creator-api.ts:679-682`                          |
| Hook listener 登録                  | `useStreamingProgress.ts:100-126`                       |
