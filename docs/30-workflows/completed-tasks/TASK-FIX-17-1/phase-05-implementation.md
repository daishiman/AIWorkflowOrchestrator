# Phase 5: 実装（TDD: Green）

## メタ情報

| 項目      | 値                                 |
| --------- | ---------------------------------- |
| Phase     | 5                                  |
| タスクID  | TASK-FIX-17-1-SKILL-SCAN-HANDLER   |
| タスク名  | skill:scan IPCハンドラーの新規追加 |
| 作成日    | 2026-02-08                         |
| 前提Phase | Phase 4（テスト作成）              |

## 目的

Phase 4 で作成したテストをすべて通過させる最小限の実装を行う（Green状態）。

---

## 実行タスク

### Task 1: IPCハンドラー実装

**対象ファイル**: `apps/desktop/src/main/ipc/skillHandlers.ts`

**実装箇所**: `registerSkillHandlers` 関数内、`skill:list` ハンドラーの後に追加

**実装コード**:

```typescript
// skill:scan - スキルの強制再スキャン
ipcMain.handle(IPC_CHANNELS.SKILL_SCAN, async (event: IpcMainInvokeEvent) => {
  const validation = validateIpcSender(event, IPC_CHANNELS.SKILL_SCAN, {
    getAllowedWindows: () => [mainWindow],
  });
  if (!validation.valid) {
    throw toIPCValidationError(validation);
  }
  try {
    const result = await skillService.scanAvailableSkills(true);
    return { success: true, data: result.skills };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "スキャンに失敗しました",
    };
  }
});
```

**設計ポイント**:

| ポイント             | 説明                                               |
| -------------------- | -------------------------------------------------- |
| `forceRefresh: true` | 常に強制リフレッシュモードでスキャンを実行         |
| 戻り値形式           | `{ success: true, data: skills }` 形式で統一       |
| エラーハンドリング   | try-catch でエラーを捕捉し、エラーレスポンスを返す |
| セキュリティ         | `validateIpcSender` による送信元検証を実施         |

### Task 2: unregisterSkillHandlers 更新

**対象ファイル**: `apps/desktop/src/main/ipc/skillHandlers.ts`

**実装箇所**: `unregisterSkillHandlers` 関数内に追加

**実装コード**:

```typescript
export function unregisterSkillHandlers(): void {
  _skillExecutorInstance = null;
  // TASK-FIX-4-1-IPC-CONSOLIDATION: unified channels
  ipcMain.removeHandler(IPC_CHANNELS.SKILL_LIST);
  ipcMain.removeHandler(IPC_CHANNELS.SKILL_SCAN); // 追加
  ipcMain.removeHandler(IPC_CHANNELS.SKILL_GET_IMPORTED);
  // ... 以下既存のコード
}
```

### Task 3: 実装確認

**確認ポイント**:

| No  | 確認項目                                       | 期待結果                |
| --- | ---------------------------------------------- | ----------------------- |
| 1   | `IPC_CHANNELS.SKILL_SCAN` が import されている | channels.ts から import |
| 2   | `validateIpcSender` が呼び出されている         | セキュリティ検証実施    |
| 3   | `scanAvailableSkills(true)` が呼び出されている | 強制リフレッシュ実行    |
| 4   | 戻り値が `OperationResult` 形式                | 統一フォーマット        |
| 5   | `unregisterSkillHandlers` で解除されている     | リソースリーク防止      |

---

## 参照資料

| 資料名         | パス                                                    | 説明              |
| -------------- | ------------------------------------------------------- | ----------------- |
| タスク指示書   | `tasks/02b-task-fix-17-1-skill-scan-handler.md`         | タスク仕様        |
| Phase 4成果物  | `phase-outputs/TASK-FIX-17-1/phase-04-test-creation.md` | テスト仕様        |
| 既存ハンドラー | `apps/desktop/src/main/ipc/skillHandlers.ts`            | 参考実装パターン  |
| チャネル定義   | `apps/desktop/src/preload/channels.ts` L185             | `SKILL_SCAN` 定義 |

---

## 実装パターン比較

**skill:list ハンドラー（参考）**:

```typescript
ipcMain.handle(
  IPC_CHANNELS.SKILL_LIST,
  async (
    event: IpcMainInvokeEvent,
    args?: { basePath?: string; forceRefresh?: boolean },
  ) => {
    const validation = validateIpcSender(event, IPC_CHANNELS.SKILL_LIST, {
      getAllowedWindows: () => [mainWindow],
    });
    if (!validation.valid) {
      throw toIPCValidationError(validation);
    }
    try {
      const result = await skillService.scanAvailableSkills(args?.forceRefresh);
      return { success: true, data: result.skills };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "スキャンに失敗しました",
      };
    }
  },
);
```

**skill:scan ハンドラー（今回実装）との違い**:

| 項目           | skill:list                          | skill:scan     |
| -------------- | ----------------------------------- | -------------- |
| 引数           | `args?: { forceRefresh?: boolean }` | なし           |
| `forceRefresh` | オプション（引数から取得）          | 固定 `true`    |
| 用途           | 通常のスキル一覧取得                | 強制再スキャン |

---

## 成果物

| 成果物                      | パス                                                     | 説明                      |
| --------------------------- | -------------------------------------------------------- | ------------------------- |
| 修正された skillHandlers.ts | `apps/desktop/src/main/ipc/skillHandlers.ts`             | SKILL_SCAN ハンドラー追加 |
| 実装仕様書                  | `phase-outputs/TASK-FIX-17-1/phase-05-implementation.md` | 本ドキュメント            |

---

## 完了条件

- [ ] `IPC_CHANNELS.SKILL_SCAN` ハンドラーが `registerSkillHandlers` に追加されている
- [ ] `scanAvailableSkills(true)` が呼び出される（強制リフレッシュ固定）
- [ ] `validateIpcSender` によるセキュリティ検証が実施される
- [ ] エラー時に `{ success: false, error: message }` 形式で返却される
- [ ] `unregisterSkillHandlers` に `SKILL_SCAN` の解除が追加されている
- [ ] Phase 4 の全テストが通過する（Green状態）

---

## TDD検証

```bash
# テスト実行コマンド
pnpm --filter @repo/desktop test -- --grep "skill:scan"

# 確認項目
# - [ ] SH-SC-01 〜 SH-SC-05 がすべて PASS
# - [ ] 既存テスト（SH-LA-01 など）が影響を受けていない
```

---

## 次のPhase

Phase 6: テスト拡充
