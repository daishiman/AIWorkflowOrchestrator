# Phase 4: テスト設計書

## 命名規則整合確認結果

| 確認項目              | 現状                                                      | テストに適用              |
| --------------------- | --------------------------------------------------------- | ------------------------- |
| describe ブロック命名 | `describe("RuntimeSkillCreatorFacade.executeAsync", ...)` | ✅ 同一 describe 内に追加 |
| it/test 命名規則      | `it("TC-ID: 説明文", ...)`                                | ✅ 従う                   |
| ファイル命名パターン  | `RuntimeSkillCreatorFacade.executeAsync.test.ts`          | ✅ 既存ファイルへ追加     |

## 既存テスト一覧（Phase 1 確認済み）

| TC ID    | テスト内容                                                                                 | 期待状態 |
| -------- | ------------------------------------------------------------------------------------------ | -------- |
| TC-T4-01 | executeAsync の成功時に snapshot callback を通知する                                       | PASS     |
| TC-T4-02 | executeAsync の失敗時に throw せず failure callback を通知する                             | PASS     |
| TC-T4-03 | adapter guard で execute が失敗した場合も snapshot callback を通知する                     | PASS     |
| TC-T4-04 | execute() が structured error を返した場合に error.message を snapshot callback へ伝搬する | PASS     |
| T-01     | structured error パス - snapshot が存在する場合も error.message が第3引数に渡る            | PASS     |
| T-02     | catch パス - snapshot が存在する場合も error.message が第3引数に渡る                       | PASS     |
| T-03     | terminal_handoff パス - onWorkflowStateSnapshot の第3引数は undefined                      | PASS     |
| T-04     | success パス - onWorkflowStateSnapshot の第3引数は undefined                               | PASS     |
| T-05     | structured error パス - snapshot が undefined の場合も null として第2引数に渡る            | PASS     |
| T-06     | catch パス - Error 以外の値を throw した場合も String(error) が第3引数に渡る               | PASS     |

## 新規テスト設計

### TC-07: switch 網羅性テスト（型レベル）

**種別**: 手動検証手順（runtime test ではなく TypeScript type check）

**手順**:

1. `RuntimeSkillCreatorExecuteResponse` に仮バリアント `{ type: 'pending'; reason: string }` を追加
2. `pnpm --filter @repo/desktop typecheck` でコンパイルエラーが `assertNever` 行で発生することを確認
3. `classifyExecuteResult()` に `if (result.type === "pending") return "error"` を追加してエラー解消を確認
4. 仮バリアントと追加した case を削除して元に戻す

**コード内 it.todo での記録**:

```typescript
it.todo("TC-09: union型に新バリアント追加時のエンドツーエンド検証"); // UT-RT-02-TYPE-EXPANSION-TEST-001
```

### TC-08: unknown variant の smoke test

**目的**: `classifyExecuteResult()` が処理できない unknown バリアントが `executeAsync()` に流れた場合、`assertNever` が throw → `catch` パス経由でエラー処理されることを確認する。

**テスト設計**:

```typescript
it("TC-08: 未知のバリアントが executeAsync の catch パスを経由してエラー処理される", async () => {
  // facade.execute() を直接モック: unknown バリアントを返す
  vi.spyOn(facade, "execute").mockResolvedValue({
    type: "unknown_variant",
  } as any);

  // classifyExecuteResult() の assertNever が throw
  // → executeAsync() catch パスへ
  // → onWorkflowStateSnapshot(planId, null, "Unhandled case: ...") が呼ばれる

  expect(snapshotSpy).toHaveBeenCalledWith(
    "plan-TC08",
    null,
    expect.stringContaining("Unhandled case"),
  );
});
```

**アサート設計根拠**:

- `assertNever` は `throw new Error("Unhandled case: ...")` を throw
- `executeAsync()` の catch ブロックが `errorMessage = error.message` を取得
- `onWorkflowStateSnapshot(planId, null, "Unhandled case: ...")` が呼ばれる

## テストファイル変更内容

**ファイル**: `apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.executeAsync.test.ts`
**変更種別**: 既存 describe ブロック末尾へ TC-07 コメント + `it.todo("TC-09")` + TC-08 実装を追加

## Phase 4 完了確認

- [x] Phase 1-3 で確認した命名規則とテストが整合している
- [x] 既存テスト T-01〜T-06（+ TC-T4-01〜04）が現状で PASS することを確認済み（switch化後も維持）
- [x] TC-07（switch網羅性・手動検証）が追加されている（it.todo + コメント）
- [x] TC-08（unknown variant の smoke test）が追加されている
- [x] TC-09 は `it.todo()` で記録し、未タスク番号 UT-RT-02-TYPE-EXPANSION-TEST-001 を付与済み
- [x] テスト設計書（`outputs/phase-4/test-design.md`）が作成されている
- [x] 本Phase内の全タスクを100%実行完了
