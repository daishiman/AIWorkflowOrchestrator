# Phase 4: テスト作成

## メタ情報

| 項目       | 内容                                  |
| ---------- | ------------------------------------- |
| Phase      | 4                                     |
| タスクID   | TASK-SW-CANCEL-001                    |
| 機能名     | skill-creator-cancel-channel-constant |
| 前提Phase  | Phase 3                               |
| 後続Phase  | Phase 5                               |
| 作成日     | 2026-04-15                            |
| ステータス | completed                             |

## 目的

TDD RED 段階として、`SKILL_CREATOR_CANCEL` チャンネル定数の存在・値・型安全性を検証するテストを先に作成する。実装前のため全テストが RED（失敗）状態になることを確認する。

## テスト対象

- `packages/shared/src/ipc/channels.ts` の `SKILL_CREATOR_RUNTIME_CHANNELS.SKILL_CREATOR_CANCEL`
- `IPC_CHANNELS.SKILL_CREATOR_CANCEL` の型安全な参照

## テスト設計

### テストファイル

`packages/shared/src/ipc/__tests__/channels-cancel.test.ts`

### TC-01: チャンネル定数が存在すること

```typescript
it("SKILL_CREATOR_CANCEL チャンネル定数が存在する", () => {
  expect(SKILL_CREATOR_RUNTIME_CHANNELS).toHaveProperty("SKILL_CREATOR_CANCEL");
});
```

### TC-02: チャンネル値が正しいこと

```typescript
it("SKILL_CREATOR_CANCEL の値が 'skill-creator:cancel' である", () => {
  expect(SKILL_CREATOR_RUNTIME_CHANNELS.SKILL_CREATOR_CANCEL).toBe(
    "skill-creator:cancel",
  );
});
```

### TC-03: IPC_CHANNELS からも参照できること

```typescript
it("IPC_CHANNELS.SKILL_CREATOR_CANCEL として参照できる", () => {
  expect(IPC_CHANNELS.SKILL_CREATOR_CANCEL).toBe("skill-creator:cancel");
});
```

### TC-04: 既存チャンネルと値が重複していないこと

```typescript
it("SKILL_CREATOR_CANCEL の値が他のチャンネルと重複しない", () => {
  const allValues = Object.values(IPC_CHANNELS);
  const cancelValue = "skill-creator:cancel";
  const occurrences = allValues.filter((v) => v === cancelValue);
  expect(occurrences).toHaveLength(1);
});
```

## 統合テスト連携【必須】

| 判定項目              | 基準   | 結果    |
| --------------------- | ------ | ------- |
| TC-01〜TC-04 が作成済 | 作成済 | pending |
| 実装前に RED 確認     | RED    | pending |

## 多角的チェック観点（AIが判断）

- [ ] TC-04 で重複チェックが正しく機能するか（既存に同値がないか）
- [ ] テストが実装前に RED になることを確認しているか

## サブタスク管理

1. テストファイル作成（TC-01〜TC-04）
2. 実装前の RED 確認（`pnpm --filter @repo/shared test` 実行）

## 成果物

| 成果物               | パス                                                        | 説明                  |
| -------------------- | ----------------------------------------------------------- | --------------------- |
| チャンネル定数テスト | `packages/shared/src/ipc/__tests__/channels-cancel.test.ts` | TC-01〜TC-04 のテスト |

## 完了条件

- [ ] TC-01〜TC-04 が作成されている
- [ ] 実装前に全テストが RED であることを確認している
- [ ] 本 Phase 内の全タスクを100%実行完了

## タスク100%実行確認【必須】

- [ ] 本 Phase 内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

## 次のPhase

Phase 5: 実装
