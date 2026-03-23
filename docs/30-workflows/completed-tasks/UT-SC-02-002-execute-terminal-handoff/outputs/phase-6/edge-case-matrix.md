# Phase 6: テスト拡充 — エッジケースマトリクス

## 実行日時: 2026-03-23

## 追加テストケース

| テストID | テスト名                                                                                                | 対応する plan() テスト | 確認内容                      |
| -------- | ------------------------------------------------------------------------------------------------------- | ---------------------- | ----------------------------- |
| E-6      | apiKey 未指定の api-key モードで resolveWithService が integrated_api を返す場合は executor に委譲する  | L88-108                | executeMock が呼ばれること    |
| E-7      | apiKey 未指定の api-key モードで resolveWithService が terminal_handoff を返す場合は build 引数が正しい | L110-139               | buildSpy の引数検証           |
| E-8      | 明示的 apiKey が渡された場合は resolveWithService を使わない                                            | L141-159               | resolveWithService 非呼び出し |

## テスト結果

```
Test Files  1 passed (1)
Tests       15 passed (15)
```

## 完了条件チェック

- [x] E-6, E-7, E-8 が追加されている
- [x] E-6: `executeMock` が呼ばれていることを確認している
- [x] E-7: `buildSpy` の引数に `planResult.skillSpec` と `process.cwd()` が渡されていることを確認している
- [x] E-8: `resolveWithService` が呼ばれていないことを確認している
- [x] 全テスト（plan/execute/improve の全ケース）が PASS
