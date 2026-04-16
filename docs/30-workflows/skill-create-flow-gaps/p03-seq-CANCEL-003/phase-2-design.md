# Phase 2: 設計

## メタ情報

| 項目       | 内容                              |
| ---------- | --------------------------------- |
| Phase      | 2                                 |
| タスクID   | TASK-SW-CANCEL-003                |
| 機能名     | skill-creator-cancel-main-handler |
| 前提Phase  | Phase 1                           |
| 後続Phase  | Phase 3                           |
| 作成日     | 2026-04-15                        |
| ステータス | pending                           |

## 目的

`SkillCreatorService` へのキャンセルフラグ追加・`cancelCurrentOperation()` 実装・`skillCreatorHandlers.ts` のハンドラー追加・`unregisterSkillCreatorHandlers()` 更新の設計を確定する。

## 設計内容

### 1. SkillCreatorService へのキャンセルフラグ追加

```typescript
// apps/desktop/src/main/services/skill/SkillCreatorService.ts
export class SkillCreatorService {
  // 既存プロパティ...

  private currentAbortController: AbortController | null = null;

  cancelCurrentOperation(): void {
    this.currentAbortController?.abort();
    this.currentAbortController = null;
  }

  async createSkill(options: CreateSkillOptions, ...): Promise<string> {
    // createSkill 開始時に AbortController を生成
    this.currentAbortController = new AbortController();
    try {
      // 既存の処理...
    } finally {
      // 完了時（正常・キャンセル・エラー問わず）フラグをリセット
      this.currentAbortController = null;
    }
  }
}
```

### 2. skillCreatorHandlers.ts へのハンドラー追加

```typescript
// apps/desktop/src/main/ipc/skillCreatorHandlers.ts
// registerSkillCreatorHandlers() 内に追加
ipcMain.handle(IPC_CHANNELS.SKILL_CREATOR_CANCEL, async () => {
  skillCreatorService.cancelCurrentOperation();
  return { success: true };
});
```

### 3. unregisterSkillCreatorHandlers() への追加

```typescript
// apps/desktop/src/main/ipc/skillCreatorHandlers.ts
export function unregisterSkillCreatorHandlers(): void {
  // 既存の removeHandler...
  ipcMain.removeHandler(IPC_CHANNELS.SKILL_CREATOR_CANCEL); // 追加
}
```

### 4. IPC 4層整合性チェック表（最終状態）

| 層                | 確認内容                                                | 対応タスク         | ステータス |
| ----------------- | ------------------------------------------------------- | ------------------ | ---------- |
| 1. 定数定義       | `IPC_CHANNELS.SKILL_CREATOR_CANCEL` が定義済み          | TASK-SW-CANCEL-001 | 完了       |
| 2. ホワイトリスト | `ALLOWED_INVOKE_CHANNELS` に登録済み                    | TASK-SW-CANCEL-002 | 完了       |
| 3. ハンドラ登録   | `ipcMain.handle()` が `SKILL_CREATOR_CANCEL` を処理する | TASK-SW-CANCEL-003 | 本タスク   |
| 4. Preload API    | `cancelGeneration` として公開済み                       | TASK-SW-CANCEL-002 | 完了       |

本タスク（CANCEL-003）は層3を担当する。

### 5. AbortSignal 利用調査結果の反映

Phase 1 の調査結果に基づき、`startGeneration()` の `AbortSignal` が `skillCreatorAPI.createSkill()` に渡されているかどうかを確認する。渡されていない場合、`currentAbortController` の `signal` を `createSkill` の引数として渡す設計変更を検討する。

### 6. キャンセル中の状態整合性（リスク対応）

| リスク                               | 対応方針                                                        |
| ------------------------------------ | --------------------------------------------------------------- |
| キャンセル後の半作成ディレクトリ残存 | 将来タスクとして分離（本タスクスコープ外）                      |
| `currentAbortController` の競合状態  | `createSkill` の `finally` ブロックでリセットし、単一操作を保証 |

## 統合テスト連携【必須】

| 判定項目                    | 基準 | 結果    |
| --------------------------- | ---- | ------- |
| キャンセルフラグ設計完了    | 完了 | pending |
| ハンドラー設計完了          | 完了 | pending |
| unregister 設計完了         | 完了 | pending |
| IPC 4層整合性チェック表完成 | 完了 | pending |

## 多角的チェック観点（AIが判断）

- [ ] `cancelCurrentOperation()` が `createSkill()` 実行中でない場合（`null` の状態）に安全に動作するか
- [ ] `finally` ブロックでのリセットがキャンセル後の再呼び出しに対応できるか
- [ ] `ipcMain.removeHandler` の呼び出しが登録前に実行されても安全か

## サブタスク管理

1. キャンセルフラグ・メソッド設計
2. ハンドラー設計
3. unregister 更新設計
4. IPC 4層整合性チェック表の最終化
5. AbortSignal 調査結果の反映
6. 成果物の出力

## 成果物

| 成果物 | パス                        | 説明                                        |
| ------ | --------------------------- | ------------------------------------------- |
| 設計書 | `outputs/phase-2/design.md` | キャンセルフラグ・ハンドラー・IPC 4層設計書 |

## 完了条件

- [ ] `currentAbortController` と `cancelCurrentOperation()` の設計が完了している
- [ ] `SKILL_CREATOR_CANCEL` ハンドラーの設計が完了している
- [ ] `unregisterSkillCreatorHandlers()` の更新設計が完了している
- [ ] IPC 4層整合性チェック表が最終化されている
- [ ] 本 Phase 内の全タスクを100%実行完了

## タスク100%実行確認【必須】

- [ ] 本 Phase 内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

## 次のPhase

Phase 3: 設計レビューゲート
