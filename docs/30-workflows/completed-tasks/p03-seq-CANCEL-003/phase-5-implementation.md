# Phase 5: 実装

## メタ情報

| 項目       | 内容                              |
| ---------- | --------------------------------- |
| Phase      | 5                                 |
| タスクID   | TASK-SW-CANCEL-003                |
| 機能名     | skill-creator-cancel-main-handler |
| 前提Phase  | Phase 4                           |
| 後続Phase  | Phase 6                           |
| 作成日     | 2026-04-15                        |
| ステータス | completed                         |

## 目的

`SkillCreatorService.ts` にキャンセルフラグと `cancelCurrentOperation()` を実装し、`skillCreatorHandlers.ts` に `SKILL_CREATOR_CANCEL` ハンドラーと `unregisterSkillCreatorHandlers()` の更新を行う。TC-01〜TC-07 が全 PASS することを確認する。

## 実行手順

### 0. 既存テスト回帰確認（baseline確認）【必須】

```bash
pnpm --filter @repo/desktop test
# 期待: 既存テストが全 PASS（TC-01〜TC-07 は FAIL）
```

### 1. 実装ファイルリスト

| 操作 | ファイルパス                                                  | 変更内容                                                                       |
| ---- | ------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| 修正 | `apps/desktop/src/main/services/skill/SkillCreatorService.ts` | `currentAbortController` プロパティ・`cancelCurrentOperation()` 追加           |
| 修正 | `apps/desktop/src/main/ipc/skillCreatorHandlers.ts`           | `SKILL_CREATOR_CANCEL` ハンドラー追加・`unregisterSkillCreatorHandlers()` 更新 |

### 2. SkillCreatorService.ts の変更内容

```typescript
// クラス本体への追加
private currentAbortController: AbortController | null = null;

public cancelCurrentOperation(): void {
  this.currentAbortController?.abort();
  this.currentAbortController = null;
}

// createSkill メソッド内での AbortController 管理
async createSkill(options: CreateSkillOptions, ...): Promise<string> {
  this.currentAbortController = new AbortController();
  try {
    // 既存処理...
    return skillDir;
  } finally {
    this.currentAbortController = null;
  }
}
```

### 3. skillCreatorHandlers.ts の変更内容

```typescript
// registerSkillCreatorHandlers() 内に追加
ipcMain.handle(IPC_CHANNELS.SKILL_CREATOR_CANCEL, async () => {
  skillCreatorService.cancelCurrentOperation();
  return { success: true };
});

// unregisterSkillCreatorHandlers() に追加
ipcMain.removeHandler(IPC_CHANNELS.SKILL_CREATOR_CANCEL);
```

### 4. Green 確認コマンド

```bash
# SkillCreatorService テスト
pnpm --filter @repo/desktop exec vitest run \
  src/main/services/skill/__tests__/SkillCreatorService-cancel.test.ts

# skillCreatorHandlers テスト
pnpm --filter @repo/desktop exec vitest run \
  src/main/ipc/__tests__/skillCreatorHandlers-cancel.test.ts

# 型チェック
pnpm --filter @repo/desktop typecheck

# lint
pnpm --filter @repo/desktop lint
```

### 5. 既存テスト回帰確認（実装後）

```bash
pnpm --filter @repo/desktop test
```

## 実行タスク

- [ ] baseline の既存テスト状況を確認する
- [ ] `SkillCreatorService.ts` にキャンセル制御を実装する
- [ ] `skillCreatorHandlers.ts` に cancel handler / removeHandler を実装する
- [ ] 対象テスト・typecheck・lint を実行して Green を確認する

## 参照資料

- `apps/desktop/src/main/services/skill/SkillCreatorService.ts`
- `apps/desktop/src/main/ipc/skillCreatorHandlers.ts`
- `apps/desktop/src/main/services/skill/__tests__/SkillCreatorService-cancel.test.ts`
- `apps/desktop/src/main/ipc/__tests__/skillCreatorHandlers-cancel.test.ts`

## 統合テスト連携【必須】

| 判定項目             | 基準    | 結果    |
| -------------------- | ------- | ------- |
| TC-01〜TC-07 全 PASS | PASS    | pending |
| 既存テスト回帰なし   | 全 PASS | pending |
| 型チェック PASS      | PASS    | pending |
| lint 0 error         | 0 error | pending |

## 多角的チェック観点（AIが判断）

- [ ] `cancelCurrentOperation()` が `public` として定義されているか
- [ ] `createSkill()` の `finally` ブロックが既存の例外処理と干渉しないか
- [ ] `unregisterSkillCreatorHandlers()` の既存チャンネル解除と同じフォーマットで追加されているか
- [ ] 既存のテスト（`skillCreatorHandlers.validation.test.ts` 等）が引き続き PASS しているか

## サブタスク管理

1. baseline 確認（既存テスト全 PASS 確認）
2. `SkillCreatorService.ts` に `currentAbortController` プロパティ追加
3. `SkillCreatorService.ts` に `cancelCurrentOperation()` 追加
4. `SkillCreatorService.ts` の `createSkill()` に AbortController 管理追加
5. `skillCreatorHandlers.ts` に `SKILL_CREATOR_CANCEL` ハンドラー追加
6. `skillCreatorHandlers.ts` の `unregisterSkillCreatorHandlers()` 更新
7. Green 確認（TC-01〜TC-07 PASS）
8. 型チェック・lint 確認

## 成果物

| 成果物                        | パス                                                          | 説明                                |
| ----------------------------- | ------------------------------------------------------------- | ----------------------------------- |
| SkillCreatorService 実装追加  | `apps/desktop/src/main/services/skill/SkillCreatorService.ts` | キャンセルフラグ・メソッド追加済み  |
| skillCreatorHandlers 実装追加 | `apps/desktop/src/main/ipc/skillCreatorHandlers.ts`           | ハンドラー追加・unregister 更新済み |

## 完了条件

- [ ] baseline 確認実施済み
- [ ] `currentAbortController` プロパティが実装済み
- [ ] `cancelCurrentOperation()` が実装済み
- [ ] `createSkill()` で AbortController が管理されている
- [ ] `SKILL_CREATOR_CANCEL` ハンドラーが登録済み
- [ ] `unregisterSkillCreatorHandlers()` に removeHandler が追加済み
- [ ] TC-01〜TC-07 が全 PASS（Green 確認）
- [ ] 既存テストへの悪影響なし
- [ ] 型チェック・lint がエラーなし
- [ ] 本 Phase 内の全タスクを100%実行完了

## タスク100%実行確認【必須】

- [ ] 本 Phase 内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

## 次のPhase

Phase 6: テスト拡充
