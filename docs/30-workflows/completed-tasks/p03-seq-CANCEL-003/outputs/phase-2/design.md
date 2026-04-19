# Phase 2 成果物: 設計書

## メタ情報

| 項目      | 内容                              |
| --------- | --------------------------------- |
| Phase     | 2                                 |
| タスクID  | TASK-SW-CANCEL-003                |
| 機能名    | skill-creator-cancel-main-handler |
| 前提Phase | Phase 1                           |
| 作成日    | 2026-04-19                        |

## 設計の目的

Phase 1 の要件に基づき、`SkillCreatorService` のキャンセルフラグと `cancelCurrentOperation()`、`skillCreatorHandlers.ts` の `SKILL_CREATOR_CANCEL` ハンドラー、`unregisterSkillCreatorHandlers()` の更新を設計する。

## 1. SkillCreatorService への追加

### 1.1 プロパティ

```typescript
/** TASK-SW-CANCEL-003: 実行中の操作を中断するための AbortController */
private currentAbortController: AbortController | null = null;
```

- **可視性**: `private`（外部から直接アクセスさせない）
- **初期値**: `null`（実行中でないことを表す）
- **型**: `AbortController | null`（nullable で明示）

### 1.2 `cancelCurrentOperation()` メソッド

```typescript
public cancelCurrentOperation(): void {
  this.currentAbortController?.abort();
  this.currentAbortController = null;
}
```

- **可視性**: `public`（IPC ハンドラーから呼ぶ）
- **副作用**: `AbortController.abort()` によるシグナル伝播、`null` リセット
- **冪等性**: 連続呼び出しでも例外なし（`?.` ガード）
- **戻り値**: `void`（エラーを投げないので `Result` 型不要）

### 1.3 `createSkill()` 内での AbortController 管理

```typescript
const abortController = new AbortController();
this.currentAbortController = abortController;
const operationSignal = abortController.signal;
try {
  // 既存処理。executeScript / validateSkill / generateTaskSpecs 等に operationSignal を渡す
  return skillDir;
} catch (error) {
  await this.cleanupCancelledSkillDir(
    skillDir,
    skillDirExistedBefore,
    operationSignal,
    error,
  );
  throw error;
} finally {
  // 同一 controller のときのみリセット（キャンセル後の新規呼び出しを守る）
  if (this.currentAbortController === abortController) {
    this.currentAbortController = null;
  }
}
```

- **ローカル変数 `abortController`**: インスタンス変数への上書き競合に備えて、クロージャ内の参照を保持する
- **同一性チェック (`=== abortController`)**: 後続の `createSkill` 呼び出しで置き換わった場合、誤って新しい controller を null にしないための保護
- **`cleanupCancelledSkillDir`**: キャンセル発火時のみ半作成ディレクトリを削除（既存メカニズム）

## 2. skillCreatorHandlers への追加

### 2.1 ハンドラー登録

```typescript
ipcMain.handle(
  IPC_CHANNELS.SKILL_CREATOR_CANCEL,
  async (event: IpcMainInvokeEvent): Promise<IpcResult<void>> => {
    const validation = validateIpcSender(
      event,
      IPC_CHANNELS.SKILL_CREATOR_CANCEL,
      { getAllowedWindows: () => [mainWindow] },
    );
    if (!validation.valid) {
      throw toIPCValidationError(validation);
    }
    skillCreatorService.cancelCurrentOperation();
    onCancelCurrentSkillCreation?.();
    return { success: true };
  },
);
```

- **送信者検証**: `validateIpcSender` で他ハンドラーと同一の防御
- **付加的コールバック**: `onCancelCurrentSkillCreation?.()` で runtime facade 側にもキャンセルを伝播
- **戻り値**: `{ success: true }`（キャンセルは常に成功扱い、失敗モード不要）

### 2.2 `unregisterSkillCreatorHandlers()` への追加

```typescript
export function unregisterSkillCreatorHandlers(): void {
  ipcMain.removeHandler(IPC_CHANNELS.SKILL_CREATOR_DETECT_MODE);
  // ...既存の removeHandler...
  ipcMain.removeHandler(IPC_CHANNELS.SKILL_CREATOR_CANCEL);
  unregisterRuntimeSkillCreatorHandlers();
}
```

- **位置**: 既存の `STATS` 解除の直後、`unregisterRuntimeSkillCreatorHandlers()` の直前
- **フォーマット**: 他チャンネルと同一パターン（可読性と Review Checklist の満足）

## 3. IPC 4 層整合性チェック表

| 層                | 確認内容                                                | 対応タスク         | ステータス   |
| ----------------- | ------------------------------------------------------- | ------------------ | ------------ |
| 1. 定数定義       | `IPC_CHANNELS.SKILL_CREATOR_CANCEL` が定義済み          | TASK-SW-CANCEL-001 | 完了         |
| 2. ホワイトリスト | `ALLOWED_INVOKE_CHANNELS` に登録済み                    | TASK-SW-CANCEL-002 | 完了         |
| 3. ハンドラ登録   | `ipcMain.handle()` が `SKILL_CREATOR_CANCEL` を処理する | TASK-SW-CANCEL-003 | **本タスク** |
| 4. Preload API    | `cancelGeneration` として公開済み                       | TASK-SW-CANCEL-002 | 完了         |

## 4. AbortSignal 調査結果の反映

Phase 1 の `abort-signal-usage-report.md` より:

- Renderer の `startGeneration()` の戻り値 `AbortSignal` は `SkillCreateWizard` で利用されていない
- Electron IPC は `AbortSignal` を serialize できないため、Renderer → Main への直接伝播は不可能
- 本タスクでは **Renderer-Main 二重 AbortController** パターンを採用し、IPC チャンネル経由で `abort()` を同期する
- **設計変更なし**（現設計で十分）。将来の改善点として `useCancelGeneration` の戻り値を TASK-SW-CANCEL-004 で見直し

## 5. 状態整合性リスクと対応

| リスク                                                             | 対応方針                                                                                         |
| ------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------ |
| キャンセル後の半作成ディレクトリ残存                               | `SkillCreatorService.cleanupCancelledSkillDir()` で対応済み                                      |
| `currentAbortController` の競合状態（並行 createSkill の重複）     | `finally` 内で `=== abortController` 同一性チェック付きリセット                                  |
| `cancelCurrentOperation()` が `null` 状態で呼ばれる                | `?.abort()` でガード                                                                             |
| 連続 `cancelCurrentOperation()` 呼び出し                           | 初回でリセット後、2 回目は `null?.abort()` → `null` で no-op                                     |
| `unregisterSkillCreatorHandlers()` の `removeHandler` 呼び出し漏れ | 登録前の呼び出しでも `ipcMain.removeHandler` 自体は安全（Electron は登録済みチャンネルのみ解除） |

## 6. 多角的チェック観点

| 観点                                                   | 設計判断                                                   |
| ------------------------------------------------------ | ---------------------------------------------------------- |
| `cancelCurrentOperation()` が `null` 時に安全か        | `?.abort()` + `= null` で安全                              |
| `finally` ブロックのリセットが再呼び出しに対応できるか | 同一性チェックで後続呼び出しの controller を誤って消さない |
| `ipcMain.removeHandler` が登録前に実行されても安全か   | Electron の実装は存在チェック済みで例外なし                |

## 成果物ファイル

- `outputs/phase-2/design.md`（本ファイル）

## 次 Phase

Phase 3: 設計レビューゲート
