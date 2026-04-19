# Phase 7: AC トレーサビリティ行列

## AC-1〜AC-7 対応テスト一覧

| AC   | 内容                                                             | 対応テスト                   | カバレッジ確認 |
| ---- | ---------------------------------------------------------------- | ---------------------------- | -------------- |
| AC-1 | 実 LLM プロバイダで `skill:docs:generate` が成功レスポンスを返す | TC-01, TC-08（H-12）         | ✅             |
| AC-2 | APIキー未設定時に `API_KEY_MISSING` + `retryable: false` を返す  | TC-02, TC-09, TC-18          | ✅             |
| AC-3 | APIキー無効時に `API_KEY_INVALID` + `retryable: false` を返す    | TC-03                        | ✅             |
| AC-4 | 429時に `RATE_LIMIT` + `retryable: true` を返す                  | TC-04, TC-12, TC-13, TC-19   | ✅             |
| AC-5 | 5xx時に `SERVER_ERROR` + `retryable: true` を返す                | TC-05, TC-14                 | ✅             |
| AC-6 | タイムアウト時に `TIMEOUT` + `retryable: true` を返す            | TC-06, TC-16, TC-17          | ✅             |
| AC-7 | `LLMDocQueryAdapter` の stub が本番経路から排除されている        | TC-11（stub 排除確認テスト） | ✅             |

## 全 AC 達成確認

- AC-1: ✅ TC-01（LLMClient 正常応答）+ H-12（IPC 統合）
- AC-2: ✅ TC-02（null/空文字）+ TC-18（retryable: false）
- AC-3: ✅ TC-03（401/403 → API_KEY_INVALID）
- AC-4: ✅ TC-04（429 → RATE_LIMIT）+ TC-12/TC-13（リトライ）+ TC-19（retryable: true）
- AC-5: ✅ TC-05（500 → SERVER_ERROR）+ TC-14（500→成功）
- AC-6: ✅ TC-06（30秒超過）+ TC-16（29秒OK）+ TC-17（30001ms NG）
- AC-7: ✅ TC-11（`Generated content for:` 文字列 0件）

## 網羅率

7 / 7 AC = **100% 達成**
