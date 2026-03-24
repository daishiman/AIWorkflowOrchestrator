# Phase 6: テスト拡充 — テスト期待値更新

## メタ情報

| 項目      | 値                      |
| --------- | ----------------------- |
| Phase番号 | 6                       |
| 機能名    | test-update             |
| タスクID  | TASK-LLM-MOD-04         |
| 作成日    | 2026-03-23              |
| 前Phase   | Phase 5: 実装           |
| 次Phase   | Phase 7: カバレッジ確認 |

## 目的

Phase 5 で追加したテストケースに加え、境界値・異常系・組み合わせテストが不足していないかを確認し、必要に応じてテストを補完する。

## 実行タスク

### Task 6-1: inferProviderId の境界値テスト確認

Phase 5 で追加した T-01 / T-02 に加え、以下のケースが既存テストでカバーされているか確認する:

| テストケース                                       | 確認方法                                        | 対応             |
| -------------------------------------------------- | ----------------------------------------------- | ---------------- |
| o3 プレフィックスで始まる未知モデル（例: o3-mini） | 既存テストを grep で確認                        | 必要に応じて追加 |
| 未知のモデルIDに対するフォールバック動作           | `inferProviderId("unknown-model")` の期待値確認 | 既存を確認       |
| 大文字小文字の扱い（例: "O3", "GPT-4"）            | 既存テストに含まれているか確認                  | 既存を確認       |

```bash
grep -n "inferProviderId\|unknown\|fallback" apps/desktop/src/main/handlers/__tests__/llm.test.ts
```

### Task 6-2: GoogleAdapter system_instruction の境界値テスト確認

T-03 / T-04 に加え、以下のケースを確認する:

| テストケース                                          | 優先度 | 対応                        |
| ----------------------------------------------------- | ------ | --------------------------- |
| systemPrompt が空文字列 `""` の場合                   | 中     | 必要に応じて追加            |
| systemPrompt が複数行テキストの場合                   | 低     | スキップ可                  |
| system_instruction の parts 配列が1要素のみであること | 中     | T-03 で検証済みであれば不要 |

```typescript
// 必要な場合に追加するテスト例
it("should omit system_instruction when systemPrompt is empty string", async () => {
  const request = {
    model: "gemini-2.0-flash",
    messages: [{ role: "user" as const, content: "Hello" }],
    systemPrompt: "",
  };
  await adapter.complete(request);
  const calledBody = JSON.parse(
    (mockFetch.mock.calls[0][1] as RequestInit).body as string,
  );
  expect(calledBody.system_instruction).toBeUndefined();
});
```

### Task 6-3: AnthropicAdapter ヘルスチェックの異常系確認

ヘルスチェックが失敗した場合のテストが既存に存在するか確認する:

```bash
grep -n "error\|fail\|throw\|reject" apps/desktop/src/main/adapters/llm/__tests__/AnthropicAdapter.test.ts | grep -i health
```

異常系テストが存在しない場合は追加を検討する（このタスクのスコープ外の場合は未タスク化する）。

### Task 6-4: カバレッジ不足箇所の特定

```bash
# カバレッジ計測（apps/desktop ディレクトリから実行）
cd apps/desktop && pnpm vitest run --coverage src/main/handlers/__tests__/llm.test.ts
cd apps/desktop && pnpm vitest run --coverage src/main/adapters/llm/__tests__/GoogleAdapter.test.ts
```

カバレッジ基準（`.claude/rules/02-code-quality.md` 参照）:

- Line Coverage: 80% 以上（推奨 90%）
- Branch Coverage: 60% 以上（推奨 70%）
- Function Coverage: 80% 以上（推奨 90%）

基準未達の場合は Phase 7 に進む前に追加テストを作成する。

## 参照資料

| 資料                                     | 用途                               |
| ---------------------------------------- | ---------------------------------- |
| `phase-5-implementation.md`              | Phase 5 で追加したテストケース一覧 |
| `.claude/rules/02-code-quality.md`       | カバレッジ基準・テスト設計規約     |
| `.claude/rules/06-known-pitfalls.md#P39` | happy-dom での fireEvent 使用      |

## 統合テスト連携

Phase 6 で追加したテストも含めて `cd apps/desktop && pnpm vitest run` が PASS することを確認する。

## 成果物

| 成果物                           | パス                                 |
| -------------------------------- | ------------------------------------ |
| 拡充済みテストファイル           | 変更があった場合: 対象テストファイル |
| カバレッジレポート（オプション） | 実行時の標準出力                     |

## P50 適用記録

> Task01-03 実装時にテスト更新が同時完了していたことを Phase 5 事前確認で発見。
> 「検証・補完モード」に切り替え、変更0行で全要件充足を確認した。

## 完了条件

- [x] P50 パターン適用: Task01-03 完了時にテスト更新済みであることを確認（変更0行）
- [ ] inferProviderId の境界値テストが確認済み（既存カバー済みまたは追加済み）
- [ ] GoogleAdapter system_instruction の境界値確認が完了している
- [ ] カバレッジ計測を実行し、基準（Line 80%、Branch 60%、Function 80%）を確認している
- [ ] 基準未達の場合はテストを追加済みまたは未タスク化している
- [ ] `cd apps/desktop && pnpm vitest run` が PASS する

## 次のPhase

Phase 7: カバレッジ確認 (`phase-7-coverage.md`)
