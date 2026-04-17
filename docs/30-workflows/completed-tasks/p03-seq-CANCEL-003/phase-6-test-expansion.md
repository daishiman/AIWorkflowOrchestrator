# Phase 6: テスト拡充

## メタ情報

| 項目       | 内容                              |
| ---------- | --------------------------------- |
| Phase      | 6                                 |
| タスクID   | TASK-SW-CANCEL-003                |
| 機能名     | skill-creator-cancel-main-handler |
| 前提Phase  | Phase 5                           |
| 後続Phase  | Phase 7                           |
| 作成日     | 2026-04-15                        |
| ステータス | pending                           |

## 目的

Phase 4 で作成した TC-01〜TC-07 に加え、状態整合性・エッジケースに関するテストを追加してカバレッジを向上させる。

## 追加テストケース

| ID    | テストケース名                                                        | 期待結果                                      |
| ----- | --------------------------------------------------------------------- | --------------------------------------------- |
| TC-08 | createSkill 実行中に cancelCurrentOperation を呼ぶと abort が発火する | AbortController.signal.aborted が true になる |
| TC-09 | createSkill 完了後に currentAbortController が null にリセットされる  | 完了後は null である                          |
| TC-10 | cancelCurrentOperation を連続2回呼び出しても例外が発生しない          | 2回目の呼び出しで例外なし                     |
| TC-11 | SKILL_CREATOR_CANCEL ハンドラーが { success: true } を返す            | 戻り値が正しい形式である                      |

## 実行手順

### 1. SkillCreatorService テストへの追加

```typescript
// SkillCreatorService-cancel.test.ts に追記

describe("SkillCreatorService キャンセル状態整合性", () => {
  it("TC-08: createSkill 実行中に cancelCurrentOperation を呼ぶと abort が発火する", async () => {
    // createSkill を開始して中断する
    const controller = new AbortController();
    (service as any).currentAbortController = controller;
    service.cancelCurrentOperation();
    expect(controller.signal.aborted).toBe(true);
  });

  it("TC-09: cancelCurrentOperation 後に currentAbortController が null になる", () => {
    (service as any).currentAbortController = new AbortController();
    service.cancelCurrentOperation();
    expect((service as any).currentAbortController).toBeNull();
  });

  it("TC-10: cancelCurrentOperation を連続2回呼び出しても例外が発生しない", () => {
    service.cancelCurrentOperation();
    expect(() => service.cancelCurrentOperation()).not.toThrow();
  });
});
```

### 2. skillCreatorHandlers テストへの追加

```typescript
// skillCreatorHandlers-cancel.test.ts に追記

it("TC-11: SKILL_CREATOR_CANCEL ハンドラーが { success: true } を返す", async () => {
  registerSkillCreatorHandlers(/* 必要な引数 */);
  const handlerCall = (ipcMain.handle as vi.Mock).mock.calls.find(
    ([channel]) => channel === IPC_CHANNELS.SKILL_CREATOR_CANCEL,
  );
  const handler = handlerCall?.[1];
  const result = await handler?.();
  expect(result).toEqual({ success: true });
});
```

### 3. 全テスト PASS 確認

```bash
pnpm --filter @repo/desktop exec vitest run \
  src/main/services/skill/__tests__/SkillCreatorService-cancel.test.ts \
  src/main/ipc/__tests__/skillCreatorHandlers-cancel.test.ts
# 期待: TC-01〜TC-11 全て PASS
```

## 統合テスト連携【必須】

| 判定項目              | 基準 | 結果    |
| --------------------- | ---- | ------- |
| TC-08〜TC-11 作成完了 | 完了 | pending |
| TC-01〜TC-11 全 PASS  | PASS | pending |

## 多角的チェック観点（AIが判断）

- [ ] TC-08 で `createSkill` のモックが適切に設定されているか
- [ ] TC-10 が `null` の `abort()` 呼び出しを正しく検証しているか

## サブタスク管理

1. TC-08〜TC-10 作成（SkillCreatorService テスト）
2. TC-11 作成（skillCreatorHandlers テスト）
3. 全テスト PASS 確認

## 成果物

| 成果物     | パス                                                                                | 説明                  |
| ---------- | ----------------------------------------------------------------------------------- | --------------------- |
| テスト拡充 | `apps/desktop/src/main/services/skill/__tests__/SkillCreatorService-cancel.test.ts` | TC-08〜TC-10 追加済み |
| テスト拡充 | `apps/desktop/src/main/ipc/__tests__/skillCreatorHandlers-cancel.test.ts`           | TC-11 追加済み        |

## 完了条件

- [ ] TC-08〜TC-11 が追加されている
- [ ] TC-01〜TC-11 が全て PASS
- [ ] 本 Phase 内の全タスクを100%実行完了

## タスク100%実行確認【必須】

- [ ] 本 Phase 内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

## 次のPhase

Phase 7: カバレッジ確認
