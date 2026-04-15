# Phase 4: テスト作成

## メタ情報

| 項目       | 内容                             |
| ---------- | -------------------------------- |
| Phase      | 4                                |
| タスクID   | TASK-SW-CANCEL-002               |
| 機能名     | skill-creator-cancel-preload-api |
| 前提Phase  | Phase 3                          |
| 後続Phase  | Phase 5                          |
| 作成日     | 2026-04-15                       |
| ステータス | pending                          |

## 目的

TDD RED 段階として、`cancelGeneration` Preload API とホワイトリスト登録を検証するテストを先に作成する。実装前のため全テストが RED（失敗）状態になることを確認する。

## テスト対象

- `apps/desktop/src/preload/skill-creator-api.ts` の `cancelGeneration` メソッド
- `apps/desktop/src/preload/channels.ts` の `ALLOWED_INVOKE_CHANNELS`

## テスト設計

### テストファイル1: Preload API テスト

`apps/desktop/src/preload/__tests__/skill-creator-api-cancel.test.ts`

#### TC-01: cancelGeneration メソッドが存在すること

```typescript
it("skillCreatorAPI に cancelGeneration メソッドが存在する", () => {
  expect(typeof skillCreatorAPI.cancelGeneration).toBe("function");
});
```

#### TC-02: cancelGeneration が Promise を返すこと

```typescript
it("cancelGeneration が Promise を返す", () => {
  // safeInvoke をモック
  const mockSafeInvoke = vi.fn().mockResolvedValue({ success: true });
  // cancelGeneration 呼び出し
  const result = skillCreatorAPI.cancelGeneration();
  expect(result).toBeInstanceOf(Promise);
});
```

#### TC-03: cancelGeneration が SKILL_CREATOR_CANCEL チャンネルで invoke すること

```typescript
it("cancelGeneration が IPC_CHANNELS.SKILL_CREATOR_CANCEL で safeInvoke を呼ぶ", async () => {
  const mockSafeInvoke = vi.fn().mockResolvedValue({ success: true });
  // safeInvoke をモックして呼び出しチャンネルを確認
  await skillCreatorAPI.cancelGeneration();
  expect(mockSafeInvoke).toHaveBeenCalledWith(
    IPC_CHANNELS.SKILL_CREATOR_CANCEL,
  );
});
```

#### TC-04: cancelGeneration が IpcResult を返すこと

```typescript
it("cancelGeneration が IpcResult<void> を返す", async () => {
  const mockResult = { success: true, data: undefined };
  vi.mocked(safeInvoke).mockResolvedValue(mockResult);
  const result = await skillCreatorAPI.cancelGeneration();
  expect(result).toEqual(mockResult);
});
```

### テストファイル2: ホワイトリストテスト

`apps/desktop/src/preload/__tests__/channels-cancel.test.ts`

#### TC-05: ALLOWED_INVOKE_CHANNELS に SKILL_CREATOR_CANCEL が含まれること

```typescript
it("ALLOWED_INVOKE_CHANNELS に SKILL_CREATOR_CANCEL が含まれる", () => {
  expect(ALLOWED_INVOKE_CHANNELS).toContain(IPC_CHANNELS.SKILL_CREATOR_CANCEL);
});
```

#### TC-06: SKILL_CREATOR_CANCEL が invoke 可能なチャンネルであること

```typescript
it("SKILL_CREATOR_CANCEL が invoke ホワイトリストに登録されている", () => {
  const cancelChannel = IPC_CHANNELS.SKILL_CREATOR_CANCEL;
  expect(ALLOWED_INVOKE_CHANNELS.includes(cancelChannel)).toBe(true);
});
```

## 統合テスト連携【必須】

| 判定項目                | 基準   | 結果    |
| ----------------------- | ------ | ------- |
| TC-01〜TC-06 が作成済み | 作成済 | pending |
| 実装前に RED 確認       | RED    | pending |

## 多角的チェック観点（AIが判断）

- [ ] `safeInvoke` のモック方法が既存テストパターンと一致しているか
- [ ] TC-03 でチャンネル名の検証が正しく行えるか

## サブタスク管理

1. テストファイル1作成（TC-01〜TC-04）
2. テストファイル2作成（TC-05〜TC-06）
3. 実装前の RED 確認

## 成果物

| 成果物               | パス                                                                  | 説明         |
| -------------------- | --------------------------------------------------------------------- | ------------ |
| Preload API テスト   | `apps/desktop/src/preload/__tests__/skill-creator-api-cancel.test.ts` | TC-01〜TC-04 |
| ホワイトリストテスト | `apps/desktop/src/preload/__tests__/channels-cancel.test.ts`          | TC-05〜TC-06 |

## 完了条件

- [ ] TC-01〜TC-06 が作成されている
- [ ] 実装前に全テストが RED であることを確認している
- [ ] 本 Phase 内の全タスクを100%実行完了

## タスク100%実行確認【必須】

- [ ] 本 Phase 内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

## 次のPhase

Phase 5: 実装
