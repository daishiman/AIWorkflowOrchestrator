# Phase 6: テスト拡充

## メタ情報

| 項目       | 内容                             |
| ---------- | -------------------------------- |
| Phase      | 6                                |
| タスクID   | TASK-SW-CANCEL-002               |
| 機能名     | skill-creator-cancel-preload-api |
| 前提Phase  | Phase 5                          |
| 後続Phase  | Phase 7                          |
| 作成日     | 2026-04-15                       |
| ステータス | pending                          |

## 目的

Phase 4 の TC-01〜TC-06 に加え、エラーハンドリング・エッジケースのテストを追加してカバレッジを向上させる。

## 追加テスト設計

### TC-07: IPC 呼び出し失敗時に Promise が reject されないこと（safeInvoke のエラー処理）

```typescript
it("safeInvoke が失敗しても cancelGeneration は reject しない", async () => {
  vi.mocked(safeInvoke).mockResolvedValue({ success: false, error: "timeout" });
  const result = await skillCreatorAPI.cancelGeneration();
  // safeInvoke は失敗をエラーオブジェクトとして返すため、reject しない
  expect(result.success).toBe(false);
});
```

### TC-08: cancelGeneration が引数を取らないこと

```typescript
it("cancelGeneration は引数なしで呼び出せる", () => {
  expect(() => skillCreatorAPI.cancelGeneration()).not.toThrow();
});
```

## 統合テスト連携【必須】

| 判定項目                  | 基準   | 結果    |
| ------------------------- | ------ | ------- |
| TC-07〜TC-08 が追加済み   | 追加済 | pending |
| 全テスト（TC-01〜08）PASS | PASS   | pending |

## 多角的チェック観点（AIが判断）

- [ ] TC-07 が `safeInvoke` のエラー処理パターンと整合しているか
- [ ] TC-08 が TypeScript の型チェックと整合しているか

## サブタスク管理

1. TC-07〜TC-08 の追加
2. 全テスト（TC-01〜TC-08）の PASS 確認

## 成果物

| 成果物                   | パス                                                                  | 説明              |
| ------------------------ | --------------------------------------------------------------------- | ----------------- |
| エラーハンドリングテスト | `apps/desktop/src/preload/__tests__/skill-creator-api-cancel.test.ts` | TC-07〜TC-08 追加 |

## 完了条件

- [ ] TC-07〜TC-08 が追加されている
- [ ] 全テスト（TC-01〜TC-08）が PASS している
- [ ] 本 Phase 内の全タスクを100%実行完了

## タスク100%実行確認【必須】

- [ ] 本 Phase 内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

## 次のPhase

Phase 7: カバレッジ確認
