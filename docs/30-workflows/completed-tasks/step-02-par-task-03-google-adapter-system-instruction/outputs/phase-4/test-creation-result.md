# Phase 4: テスト作成結果 - TASK-LLM-MOD-03

## 実施内容

### Task 4-1: MSW モック URL 更新

全 11 箇所の `googleapis.com/v1/` を `googleapis.com/v1beta/` に一括更新済み。

```
変更前: 11箇所 v1/
変更後: 11箇所 v1beta/  (v1/ 残存: 0箇所)
```

### Task 4-2: 既存テスト置換

`"should prepend systemPrompt as user message"` を `"should send systemPrompt as system_instruction field"` に置換済み。

### Task 4-3: 新規テスト追加

| テストID         | テスト名                                                                    | 検証内容                                       |
| ---------------- | --------------------------------------------------------------------------- | ---------------------------------------------- |
| ADP-012-SI-01    | should send systemPrompt as system_instruction field                        | system_instruction 設定 + contents 非混入      |
| ADP-012-SI-02    | should omit system_instruction when systemPrompt is not provided            | systemPrompt なし時の省略                      |
| ADP-012-SI-03    | should include temperature and maxOutputTokens in generationConfig with ... | generationConfig + system_instruction 同時検証 |
| ADP-STREAM-SI-01 | should send system_instruction in streamChat                                | streamChat での system_instruction 送信        |

### Task 4-6: Red 確認

```
Test Files  1 failed (1)
      Tests  13 failed | 2 passed (15)
```

MSW モック URL が v1beta だが実装が v1 のため全リクエストがモックを通過せず失敗。期待通りの Red 状態。

## 成果物

- `apps/desktop/src/main/adapters/llm/__tests__/GoogleAdapter.test.ts` 更新済み

## 完了条件

- [x] 全 MSW モック URL が `v1beta` に更新されている
- [x] `"should prepend systemPrompt as user message"` が置換されている
- [x] ADP-012-SI-02 が追加されている
- [x] ADP-012-SI-03 が追加されている
- [x] ADP-STREAM-SI-01 が追加されている
- [x] Phase 5 実装前にテストが Red であることを確認済み
- [x] 本Phase内の全タスクを100%実行完了
