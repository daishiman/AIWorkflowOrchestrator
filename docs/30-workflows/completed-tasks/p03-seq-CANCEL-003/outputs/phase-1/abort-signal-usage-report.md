# Phase 1 成果物: AbortSignal 利用調査レポート

## 調査対象

`apps/desktop/src/renderer/hooks/useCancelGeneration.ts` の `startGeneration()` が返す `AbortSignal` の利用箇所。

## 調査方法

```bash
grep -rn "startGeneration\|AbortSignal\|abortSignal" apps/desktop/src/renderer/ | grep -v ".test."
```

## 調査結果

### 1. `useCancelGeneration` の実装（現状）

```typescript
// apps/desktop/src/renderer/hooks/useCancelGeneration.ts
const startGeneration = useCallback((): AbortSignal => {
  abortControllerRef.current = new AbortController();
  return abortControllerRef.current.signal;
}, []);

const cancelGeneration = useCallback(async (): Promise<void> => {
  abortControllerRef.current?.abort();
  abortControllerRef.current = null;
  setStage("cancelled");
  const skillCreatorAPI = (window as ...).skillCreatorAPI;
  try {
    await skillCreatorAPI?.cancelGeneration?.();
  } catch {}
}, [setStage]);
```

### 2. `startGeneration()` / `AbortSignal` の消費箇所

| ファイル                                                           | 呼び出し内容                                                                                                      | 戻り値 `AbortSignal` の利用 |
| ------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------- | --------------------------- |
| `apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx` | `useCancelGeneration()` から `cancelGeneration` のみ destructure（324行目）。`startGeneration()` は呼ばれていない | **未利用**（dead return）   |

具体的には以下のように `cancelGeneration` のみを取り出している:

```typescript
const { cancelGeneration } = useCancelGeneration(); // 324行目
```

そして `handleCancelGeneration`（553-556行目）で `cancelGeneration()` のみ呼ばれている。

### 3. `AbortSignal` が `skillCreatorAPI.createSkill()` に渡されているか

- Renderer 側の Preload API は `skillCreatorAPI.createSkill(options)` 形式で、`AbortSignal` を引数として受け取っていない（IPC invoke が `AbortSignal` を serialize できないため、そもそも渡せない）。
- 代わりに、キャンセル指示は別チャンネル（`SKILL_CREATOR_CANCEL`）として送信され、メインプロセス側で `SkillCreatorService.currentAbortController` を介して `abort()` される。

## 評価

### 影響評価

| 項目                                                                             | 評価         | 備考                                                                                        |
| -------------------------------------------------------------------------------- | ------------ | ------------------------------------------------------------------------------------------- |
| TASK-SW-CANCEL-003 実装への影響                                                  | **なし**     | Renderer の `AbortSignal` はメインプロセスに渡らない設計。TASK-003 は独立に動作する         |
| `startGeneration()` の戻り値 `AbortSignal` が未利用                              | **中**       | dead code に相当する。将来の Renderer 側 fetch/stream 中断用に残されていると推測される      |
| IPC チャンネル経由のキャンセル経路（Renderer → Preload → Main）                  | **確立済み** | `cancelGeneration()` → `skillCreatorAPI.cancelGeneration()` → `SKILL_CREATOR_CANCEL` invoke |
| メインプロセス側の内部 `AbortController`（TASK-003 の `currentAbortController`） | **独立**     | Renderer の `AbortSignal` とは別のインスタンス。メイン内で `ScriptExecutor` まで伝播する    |

### アーキテクチャ上の論点

- Electron IPC は `AbortSignal` を serialize できないため、Renderer から直接メインプロセスへ `signal` を渡す経路は存在しない。
- したがって、TASK-SW-CANCEL-003 のメイン側 `AbortController` と Renderer 側 `startGeneration()` の `AbortSignal` は **論理的に対応する別々のインスタンス** であり、IPC チャンネル経由で `abort()` を同期する構造となる。
- 本設計は **Renderer-Main 二重 AbortController** パターンで、IPC 境界をまたぐキャンセル処理の標準的な実装である。

### 推奨事項

| 推奨                                                                                                                                          | 対応タスク         | 優先度 |
| --------------------------------------------------------------------------------------------------------------------------------------------- | ------------------ | ------ |
| `startGeneration()` の戻り値 `AbortSignal` の利用目的が不明な場合、TASK-SW-CANCEL-004 で `SkillCreateWizard` 側に接続するか、API から除去する | TASK-SW-CANCEL-004 | 中     |
| 現状の IPC ベースキャンセル経路は十分動作するため、TASK-003 のスコープ内では追加対応不要                                                      | -                  | -      |

## 結論

- TASK-SW-CANCEL-003 の実装スコープには **影響しない**
- `startGeneration()` の戻り値 `AbortSignal` は現時点で `SkillCreateWizard` では利用されていない（dead return）
- TASK-SW-CANCEL-004（`useCancelGeneration.ts` 修正）で Renderer-Main 間のキャンセル動線を仕上げる際に、この dead return を活用するか削除するかを再検討する
