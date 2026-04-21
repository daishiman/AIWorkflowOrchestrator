# 現実装監査レポート

## タスクID: TASK-SW-CANCEL-004

## 監査対象ファイル別確認結果

### 1. `apps/desktop/src/renderer/hooks/useCancelGeneration.ts`

**確認内容**: L37 付近に `await skillCreatorAPI?.cancelGeneration?.()` があるか

```typescript
// L24〜41
const cancelGeneration = useCallback(async (): Promise<void> => {
  abortControllerRef.current?.abort();
  abortControllerRef.current = null;
  setStage("cancelled");
  const skillCreatorAPI = (window as ...).skillCreatorAPI;
  try {
    await skillCreatorAPI?.cancelGeneration?.();  // ← L37 確認済み
  } catch {
    // local abort を優先
  }
}, [setStage]);
```

**判定**: ✅ PASS

**追加確認**: `startGeneration()` はフックが返すが、`SkillCreateWizard.tsx` では `cancelGeneration` のみ destructure されており、`startGeneration` は呼ばれていない。

---

### 2. `apps/desktop/src/preload/channels.ts`

**確認内容**: `ALLOWED_INVOKE_CHANNELS` に `IPC_CHANNELS.SKILL_CREATOR_CANCEL` があるか

```typescript
// L366-367: IPC_CHANNELS 定義
SKILL_CREATOR_CANCEL: "skill-creator:cancel",

// L715-716: ALLOWED_INVOKE_CHANNELS に追加済み
// Skill Creator cancel channel (TASK-SW-CANCEL-002)
IPC_CHANNELS.SKILL_CREATOR_CANCEL,
```

**判定**: ✅ PASS

---

### 3. `apps/desktop/src/preload/index.ts`

**確認内容**: L646 付近に `contextBridge.exposeInMainWorld("skillCreatorAPI", skillCreatorAPI)` があるか

```typescript
// L646
contextBridge.exposeInMainWorld("skillCreatorAPI", skillCreatorAPI);
```

**判定**: ✅ PASS

---

### 4. `apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx`

**確認内容**: キャンセルボタンが `handleCancelGeneration` にバインドされているか

```typescript
// L324
const { cancelGeneration } = useCancelGeneration(); // startGeneration は destructure されていない

// L553-554
const handleCancelGeneration = () => {
  cancelGeneration();
};

// L641
onCancel = { handleCancelGeneration }; // ボタンバインディング OK
```

**判定（AC-4）**: ✅ PASS（バインディングは正しい）
**判定（AC-5）**: ❌ FAIL（`startGeneration` が destructure も呼び出しもされていない）

---

### 5. `apps/desktop/src/preload/skill-creator-api.ts`

**確認内容**: `cancelGeneration` が `safeInvoke(SKILL_CREATOR_CANCEL)` で実装されているか

```typescript
// L396: 型定義
cancelGeneration: () => Promise<IpcResult<void>>;

// L726-727: 実装
cancelGeneration: (): Promise<IpcResult<void>> =>
  safeInvoke<IpcResult<void>>(IPC_CHANNELS.SKILL_CREATOR_CANCEL),
```

**判定**: ✅ PASS

---

### 6. `startGeneration()` consumer 調査

**確認内容**: `startGeneration()` の返り値 AbortSignal を使用している Renderer コードがあるか

`grep -rn "startGeneration" apps/desktop/src/` の結果:

- `useCancelGeneration.ts`: 定義のみ
- `useCancelGeneration.test.ts`: テストのみ（mock）
- `SkillCreateWizard.store-integration.test.tsx`: mock のみ

**実コードでの `startGeneration` 呼び出し**: **なし**

**判定**: ❌ FAIL

**詳細分析**:

- `createSkill` (agentSlice.ts:1200) は AbortSignal パラメータを持たない
- `cancelGeneration()` の `abortControllerRef.current?.abort()` は AbortController 未初期化のためスキップされる
- IPC 経由の Main プロセスキャンセルは動作する

## 総合判定

| AC   | 判定                |
| ---- | ------------------- |
| AC-1 | ✅ PASS             |
| AC-2 | ✅ PASS             |
| AC-3 | ✅ PASS             |
| AC-4 | ✅ PASS             |
| AC-5 | ❌ FAIL（修正必要） |

## 修正方針（Phase 5 向け）

Pattern B を適用：`SkillCreateWizard.tsx` の `handleGenerate()` 冒頭で `startGeneration()` を呼び出し AbortController を初期化する。
`createSkill` が AbortSignal を受け取らないため、完全な consumer wiring は将来タスクとし、今回は AbortController 初期化のみで AC-5 を満たす。
