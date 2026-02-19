# Phase 4: テストケース一覧

## タスク: TASK-FIX-10-1-VITEST-ERROR-HANDLING

## 1. vitest-config.test.ts

### TC-1-1: dangerouslyIgnoreUnhandledErrors が存在しないこと

- **目的**: フラグが再追加されることを防止するリグレッションテスト
- **入力**: vitest.config.ts のファイル内容
- **期待結果**: `dangerouslyIgnoreUnhandledErrors` 文字列が含まれていない

### TC-1-2: happy-dom 環境が設定されていること

- **目的**: テスト環境の整合性確認
- **入力**: vitest.config.ts のファイル内容
- **期待結果**: `environment: "happy-dom"` が含まれている

### TC-1-3: setupFiles が設定されていること

- **目的**: テストセットアップファイルの存在確認
- **入力**: vitest.config.ts のファイル内容
- **期待結果**: `setupFiles` が含まれている

### TC-1-4: testTimeout が設定されていること

- **目的**: テストタイムアウト設定の存在確認
- **入力**: vitest.config.ts のファイル内容
- **期待結果**: `testTimeout` が含まれている

### TC-1-5: teardownTimeout が設定されていること

- **目的**: ティアダウンタイムアウト設定の存在確認
- **入力**: vitest.config.ts のファイル内容
- **期待結果**: `teardownTimeout` が含まれている

## 2. async-error-handling.test.ts

### TC-2-1: rejected Promise が expect().rejects で捕捉されること

- **目的**: 非同期エラーの標準的な捕捉パターン検証
- **入力**: async 関数が throw するPromise
- **期待結果**: `.rejects.toThrow()` で正しくキャッチされる

### TC-2-2: mockRejectedValue が処理されること

- **目的**: vi.fn().mockRejectedValue の動作確認
- **入力**: mockRejectedValue で設定されたモック関数
- **期待結果**: `.rejects.toThrow()` で正しくキャッチされる

### TC-2-3: mockRejectedValueOnce の連続呼び出し

- **目的**: 1回目拒否、2回目成功のシナリオ
- **入力**: mockRejectedValueOnce + mockResolvedValueOnce
- **期待結果**: 1回目は拒否、2回目は成功

### TC-2-4: 非同期クリーンアップの完了確認

- **目的**: afterEach での非同期処理完了検証
- **入力**: mockResolvedValue のクリーンアップ関数
- **期待結果**: クリーンアップが完了すること

### TC-2-5: モックリストアのクリーンアップ

- **目的**: vi.restoreAllMocks でペンディング操作がないこと
- **入力**: console.log のスパイ
- **期待結果**: afterEach で自動クリーンアップ

### TC-2-6: タイマークリーンアップ (setTimeout)

- **目的**: タイマーが unhandled error を発生させないこと
- **入力**: setTimeout + advanceTimersByTime
- **期待結果**: コールバック実行後クリーンに完了

### TC-2-7: タイマークリーンアップ (setInterval)

- **目的**: インターバルが unhandled error を発生させないこと
- **入力**: setInterval + advanceTimersByTime
- **期待結果**: 正しい回数のコールバック実行後クリーンに完了

### TC-2-8: try-catch パターン

- **目的**: async 関数内の try-catch パターン検証
- **入力**: throw する async 関数
- **期待結果**: catch ブロックで Error インスタンスとメッセージを検証
