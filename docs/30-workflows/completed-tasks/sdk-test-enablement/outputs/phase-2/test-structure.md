# Phase 2: 設計ドキュメント

## メタ情報

| 項目       | 内容                              |
| ---------- | --------------------------------- |
| タスクID   | TASK-FIX-11-1-SDK-TEST-ENABLEMENT |
| Phase      | 2                                 |
| ステータス | 完了                              |
| 実行日     | 2026-02-13                        |

## 設計方針

### 既存モックパターンの活用（NFR-007準拠）

新たなモック戦略を導入せず、既存の`vi.mock`/`vi.hoisted`パターンを活用する。

### ファイル別モック戦略

#### skill-executor.test.ts

- 既存: `vi.mock("../agent-client")` → `mockAgentAPI.query`
- SE-TODO-1/2: `mockAgentAPI.query` の `toHaveBeenCalledWith` でスキル名・projectPathを検証
- SE-TODO-3: `mockAgentAPI.query.mockImplementation(() => new Promise(() => {}))` で応答しないモック → 30秒タイムアウト
  - P13対策: `vi.advanceTimersByTimeAsync(30000)` を使用（`runAllTimers`は使わない）
- SE-TODO-4: `mockAgentAPI.query.mockRejectedValue(new Error("API key not configured"))` で既に実装済み。アサーション追加のみ
- SE-TODO-5: `mockAgentAPI.query.mockRejectedValueOnce(new Error("SDK call failed"))` を設定し、エラーハンドリングを検証

#### agent-client.test.ts

- 既存: `vi.hoisted(() => mockCreate)` → `mockCreate` で Anthropic SDK の `messages.create` をモック
- AC-TODO-1: `mockCreate` の呼び出し確認（`toHaveBeenCalled()`）
- AC-TODO-2/3: APIキー取得テスト
  - AC-02: safeStorage.isEncryptionAvailable が false の場合 → 環境変数フォールバック
  - AC-03: 環境変数も未設定 → 「API key not configured」エラー
- AC-TODO-4/5/6: `mockCreate` の引数検証
  - `expect(mockCreate).toHaveBeenCalledWith(expect.objectContaining({model: "claude-sonnet-4-20250514", max_tokens: 8192, system: "..."}))`
- AC-TODO-8/9: エラーシミュレーション
  - `mockCreate.mockRejectedValueOnce(new Error(...))`（name: 'Error'、status情報含む）

#### sdk-integration.test.ts

- 既存: `vi.hoisted` + `vi.mock` の組み合わせ
- INT-TODO-1: `mockCreate.mockRejectedValueOnce` で認証エラーシミュレート
- INT-TODO-2: `mockCreate.mockRejectedValueOnce` でSDK障害シミュレート
- INT-TODO-3: `mockCreate` 引数の `model`, `max_tokens`, `system`, `messages` を検証

### テスト間分離（P9対策）

- 各テストの `beforeEach` で `mockCreate.mockReset()` / `vi.clearAllMocks()` が既に設定済み
- `mockRejectedValueOnce` の "Once" サフィックスにより、次のテストへの副作用を防止

### タイマーテスト（P13対策）

- `vi.useFakeTimers()` と `vi.advanceTimersByTimeAsync()` の組み合わせ
- `runAllTimers` / `runAllTimersAsync` は使用禁止（無限ループリスク）

## アーキテクチャ決定

### ADR-1: モック差し替えは `mockImplementation` で行う

- 各テストケースの先頭で `mockCreate.mockXxx()` または `mockAgentAPI.query.mockXxx()` を呼び出す
- `beforeEach` でのリセットにより、テスト間で状態が漏れない

### ADR-2: エラーテストでは `mockRejectedValueOnce` を使用

- "Once" を使うことで、1回限りのエラーシミュレーションとなり、次のテストに影響しない

### ADR-3: タイムアウトテストは `advanceTimersByTimeAsync` のみ

- P13（タイマーテスト無限ループ）を回避するため

## 完了条件チェック

- [x] 17箇所全てに対する有効化設計が存在する
- [x] 既存モックパターンを活用した設計である
- [x] P9/P13/P20対策が組み込まれている
- [x] テスト間分離が保証されている
