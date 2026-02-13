# Phase 5: 実装結果

## メタ情報

| 項目       | 内容                              |
| ---------- | --------------------------------- |
| タスクID   | TASK-FIX-11-1-SDK-TEST-ENABLEMENT |
| Phase      | 5                                 |
| ステータス | 完了                              |
| 実行日     | 2026-02-13                        |

## 実装サマリ

### 変更ファイル

1. `apps/desktop/src/main/slide/__tests__/skill-executor.test.ts` — 5箇所修正
2. `apps/desktop/src/main/slide/__tests__/agent-client.test.ts` — 9箇所修正
3. `apps/desktop/src/main/slide/__tests__/sdk-integration.test.ts` — 3箇所修正

### 変更内容詳細

#### skill-executor.test.ts（5箇所）

| TODO-ID   | テストID  | 変更内容                                                                                                                                                                                            |
| --------- | --------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| SE-TODO-1 | SDK-SE-01 | 既存アサーション確認。`mockAgentAPI.query` の `toHaveBeenCalledWith` が既にコードに存在。TODOコメントなし → 変更不要                                                                                |
| SE-TODO-2 | SDK-SE-02 | 同上。`toHaveBeenCalledWith` が既にコードに存在 → 変更不要                                                                                                                                          |
| SE-TODO-3 | SDK-SE-05 | `mockImplementation(() => new Promise(() => {}))` から `mockRejectedValueOnce(new Error("Request timeout"))` に変更。agent-client全体がモック化されているため、タイムアウトエラーを直接シミュレート |
| SE-TODO-4 | SDK-SE-13 | `mockRejectedValue` → `mockRejectedValueOnce` に修正（P9リーク防止）。アサーションは既に正しかった                                                                                                  |
| SE-TODO-5 | SDK-SE-14 | TODOコメント除去。`mockRejectedValueOnce(new Error("SDK call failed"))` を設定し、`expect(result.success).toBe(false)` + `expect(result.error).toBe("SDK call failed")` に変更                      |

#### agent-client.test.ts（9箇所）

| TODO-ID   | テストID  | 変更内容                                                                                                                                  |
| --------- | --------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| AC-TODO-1 | AC-06     | TODOコメント除去。`mockCreate.mockRejectedValueOnce(new Error("API request failed"))` + `rejects.toThrow` に変更                          |
| AC-TODO-2 | SDK-AC-01 | TODOコメント除去。`expect(mockCreate).toHaveBeenCalled()` アサーション追加                                                                |
| AC-TODO-3 | SDK-AC-02 | TODOコメント除去。環境変数フォールバックの説明コメントと `expect(mockCreate).toHaveBeenCalled()` 追加                                     |
| AC-TODO-4 | SDK-AC-03 | TODOコメント除去。`delete process.env.ANTHROPIC_API_KEY` + `resetAgentAPI()` + `rejects.toThrow("API key not configured")` に変更         |
| AC-TODO-5 | SDK-AC-04 | TODOコメント除去。`expect(mockCreate).toHaveBeenCalledWith(expect.objectContaining({model: "claude-sonnet-4-20250514"}), ...)` 追加       |
| AC-TODO-6 | SDK-AC-05 | TODOコメント除去。`expect(mockCreate).toHaveBeenCalledWith(expect.objectContaining({max_tokens: 8192}), ...)` 追加                        |
| AC-TODO-7 | SDK-AC-06 | TODOコメント除去。`expect(mockCreate).toHaveBeenCalledWith(expect.objectContaining({system: "You are a slide designer."}), ...)` 追加     |
| AC-TODO-8 | SDK-AC-09 | TODOコメント除去。`Object.assign(new Error("Unauthorized"), {status: 401})` + `mockRejectedValueOnce` + `rejects.toThrow` に変更          |
| AC-TODO-9 | SDK-AC-10 | TODOコメント除去。`Object.assign(new Error("Internal Server Error"), {status: 500})` + `mockRejectedValueOnce` + `rejects.toThrow` に変更 |

#### sdk-integration.test.ts（3箇所）

| TODO-ID    | テストID   | 変更内容                                                                                                                                                                        |
| ---------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| INT-TODO-1 | INT-02     | TODOコメント除去。`mockCreate.mockRejectedValueOnce(new Error("Invalid API key"))` + `expect(result.success).toBe(false)` + `expect(result.error).toContain("Invalid API key")` |
| INT-TODO-2 | INT-05     | TODOコメント除去。`mockCreate.mockRejectedValueOnce(new Error("SDK service unavailable"))` + `expect(result.error).toBe("SDK service unavailable")` に変更                      |
| INT-TODO-3 | SDK-INT-01 | TODOコメント除去。`expect(mockCreate).toHaveBeenCalledWith(expect.objectContaining({model, max_tokens, messages}), expect.objectContaining({signal}))` 追加                     |

### 追加修正（P9対策）

- SDK-SE-13: `mockRejectedValue` → `mockRejectedValueOnce` に変更（テスト間状態リーク防止）
- `describe("Claude Agent SDK Integration")` の `beforeEach` に `mockAgentAPI.query.mockResolvedValue(...)` を追加（`mockImplementation` による永続的変更をリセット）
- `describe("edge case tests (Phase 6)")` にも同様の `beforeEach` を追加

## テスト結果

- **3ファイル全テストPASS**: 134/134
- **実行時間**: 1.07秒
- **TODOコメント残存**: 0件

## 完了条件チェック

- [x] 17箇所のTODOテストが有効化されている
- [x] TODOコメント（`// TODO: SDK統合後`）が全て除去されている
- [x] 全テストがPASSしている
- [x] P9（テスト間リーク）対策が施されている
- [x] 既存テストに影響がない
