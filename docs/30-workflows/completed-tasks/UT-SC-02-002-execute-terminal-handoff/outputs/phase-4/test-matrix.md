# Phase 4: テスト作成 — テストマトリクス

## 実行日時: 2026-03-23

## テスト変更内容

### Step 2: L208-246 を integrated_api パターンに書き直し

- `resolve` モックの戻り値を `terminal_handoff` -> `integrated_api` に変更
- `authMode` を `"subscription"` -> `"api-key"` に変更（integrated_api パスの自然な設計）

### Step 3: terminal_handoff テストケース追加 (E-3, E-4, E-5)

| テストID | テスト名                                                                           | 目的                             | ステータス |
| -------- | ---------------------------------------------------------------------------------- | -------------------------------- | ---------- |
| E-1      | SkillExecutor に request と metadata を委譲し、成功結果を返す                      | integrated_api の正常系          | PASS       |
| E-2      | SkillExecutor のエラーを message に変換し、skillName を 50 文字に切り詰める        | integrated_api のエラー系        | PASS       |
| E-3      | terminal_handoff 判定時は builder の結果を返す                                     | terminal_handoff 基本パス        | FAIL (Red) |
| E-4      | apiKey 未指定の api-key モードで resolveWithService が terminal_handoff を返す場合 | resolveWithService 経由          | FAIL (Red) |
| E-5      | 明示的 apiKey 指定でも terminal_handoff は正しく返る                               | 明示的 apiKey + terminal_handoff | FAIL (Red) |

## Red 確認結果

```
Test Files  1 failed (1)
Tests       3 failed | 9 passed (12)
```

E-3, E-4, E-5 の失敗理由: `execute()` に terminal_handoff 分岐がないため `SkillExecutor.execute()` が `executeMock` 未設定で呼ばれ `response.executionId` で TypeError が発生。

## 完了条件チェック

- [x] 既存テスト E-1, E-2 が PASS のまま維持される
- [x] 追加テスト E-3, E-4, E-5 がいずれも FAIL (Red 確認)
- [x] `executeMock.not.toHaveBeenCalled()` のアサーションが E-3, E-4, E-5 に含まれている
- [x] L207-246 の `resolve` モックが `integrated_api` を返すように修正されている
