# Phase 4 テストマトリクス - Skill Docs Runtime Integration

## テストファイル一覧

| #        | テストファイル                        | テスト数 | 対象                         |
| -------- | ------------------------------------- | -------- | ---------------------------- |
| 1        | `LLMDocQueryAdapter.test.ts`          | 15       | LLMDocQueryAdapter           |
| 2        | `SkillDocGenerator.queryFn.test.ts`   | 4        | SkillDocGenerator queryFn DI |
| 3        | `SkillDocsCapabilityResolver.test.ts` | 3        | SkillDocsCapabilityResolver  |
| **合計** |                                       | **22**   |                              |

## テストケース詳細

### T-4-1: LLMDocQueryAdapter (15 tests)

| ID        | テストケース                                    | 検証内容                  | 結果 |
| --------- | ----------------------------------------------- | ------------------------- | ---- |
| T-4-1-01  | query returns success with data string          | 正常レスポンス            | PASS |
| T-4-1-02  | isAvailable returns true when API key is set    | API key有効判定           | PASS |
| T-4-1-03  | getProviderName returns the provider name       | プロバイダ名取得          | PASS |
| T-4-1-04  | isAvailable returns false when API key is null  | null判定                  | PASS |
| T-4-1-04b | isAvailable returns false for empty string      | 空文字列判定              | PASS |
| T-4-1-04c | isAvailable returns false for whitespace (P42)  | スペースのみ判定          | PASS |
| T-4-1-05  | query maps timeout error to code 3001           | タイムアウトマッピング    | PASS |
| T-4-1-06  | query maps 429 rate limit to code 3002          | レートリミットマッピング  | PASS |
| T-4-1-07  | query maps 500 server error to code 3003        | サーバーエラーマッピング  | PASS |
| T-4-1-08  | query maps 401 unauthorized to code 2002        | 認証エラーマッピング      | PASS |
| -         | validation error for empty prompt               | P42空文字列バリデーション | PASS |
| -         | validation error for whitespace-only prompt     | P42トリムバリデーション   | PASS |
| -         | business error 2001 when API key not configured | API key未設定             | PASS |
| -         | unknown error maps to code 5001 INTERNAL        | フォールバックエラー      | PASS |
| -         | defaults provider name to 'stub'                | デフォルト値              | PASS |

### T-4-2: SkillDocGenerator queryFn (4 tests)

| ID       | テストケース                               | 検証内容     | 結果 |
| -------- | ------------------------------------------ | ------------ | ---- |
| T-4-2-01 | stub queryFn returns fixed response        | スタブ注入   | PASS |
| T-4-2-02 | adapter.query bound as queryFn             | アダプタ統合 | PASS |
| T-4-2-03 | default stub queryFn produces valid doc    | 回帰テスト   | PASS |
| T-4-2-04 | adapter with no API key returns error 2001 | エラー伝播   | PASS |

### T-4-4: SkillDocsCapabilityResolver (3 tests)

| ID       | テストケース                             | 検証内容                 | 結果 |
| -------- | ---------------------------------------- | ------------------------ | ---- |
| T-4-4-01 | integrated-api when adapter is available | API利用可能パス          | PASS |
| T-4-4-02 | guidance-only when adapter not available | ガイダンスパス           | PASS |
| T-4-4-03 | integrated-api for available adapter     | terminal-handoff事後判定 | PASS |

## P42 準拠確認

- [x] prompt: 3段バリデーション（型チェック/空文字列/.trim()空文字列）
- [x] API key: 3段バリデーション（null/空文字列/.trim()空文字列）
