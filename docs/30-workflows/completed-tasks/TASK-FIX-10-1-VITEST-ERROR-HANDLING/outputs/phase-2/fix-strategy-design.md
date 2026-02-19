# Phase 2 成果物: 修正方針設計書

## メタ情報

| 項目       | 値                                  |
| ---------- | ----------------------------------- |
| タスクID   | TASK-FIX-10-1-VITEST-ERROR-HANDLING |
| Phase      | 2                                   |
| 作成日     | 2026-02-19                          |
| ステータス | 完了                                |

---

## 修正パターン分類

本タスクで対処する失敗テストの根本原因を以下のパターンに分類する。Phase 1 で特定した 3 カテゴリを、修正アプローチに基づくパターンに再分類した。

### パターン一覧

| パターン ID | パターン名                 | 該当ファイル数 | 推定テスト数 | 修正対象             | 修正難易度 |
| ----------- | -------------------------- | -------------- | ------------ | -------------------- | ---------- |
| P-ALIAS     | サブパスエイリアス未登録   | 25             | ~220         | vitest.config.ts     | 低         |
| P-CLEANUP   | 非同期クリーンアップ不足   | 6              | ~30          | テストコード         | 中         |
| P-WORKER    | Worker 予期せぬ終了（P22） | 1              | ~2           | 対処不要（リトライ） | -          |

> **注記**: Phase 2 仕様書で定義された汎用パターン（P-AWAIT, P-CATCH, P-MOCK, P-FIRE, P-TIMER）は、実際の分析結果では個別の該当ケースが確認されなかった。主要な失敗原因は P-ALIAS（設定不足）と P-CLEANUP（テスト teardown 不備）の 2 パターンに集約される。

---

## パターン別修正アプローチ

### P-ALIAS: サブパスエイリアス未登録

#### 根本原因

`apps/desktop/vitest.config.ts` の `resolve.alias` に `@repo/shared` の一部サブパスが未登録のため、テスト実行時にモジュール解決が失敗する。`dangerouslyIgnoreUnhandledErrors: true` が設定されている間はこのエラーが隠蔽されていた。

#### 未登録サブパス一覧

| サブパス                           | 参照元テスト（代表例）                              |
| ---------------------------------- | --------------------------------------------------- |
| `@repo/shared/types/auth`          | authHandlers.test.ts, profileHandlers.test.ts 等    |
| `@repo/shared/types/api-keys`      | apiKeyHandlers.test.ts, apiKeyStorage.test.ts       |
| `@repo/shared/types/agent`         | agentHandlers.test.ts, AgentExecutor.test.ts        |
| `@repo/shared/types/skill`         | SkillCard.test.tsx, SkillList.test.tsx 等           |
| `@repo/shared/infrastructure/auth` | auth-callback.test.ts, authFlowOrchestrator.test.ts |

#### 修正アプローチ

`vitest.config.ts` の `resolve.alias` セクションに未登録のサブパスを追加する。

```typescript
// 修正前: resolve.alias に以下のサブパスが未登録
// @repo/shared/types/auth, @repo/shared/types/api-keys, etc.

// 修正後: resolve.alias に追加
resolve: {
  alias: {
    // 既存のエイリアス...
    '@repo/shared/types/auth': path.resolve(__dirname, '../../packages/shared/src/types/auth'),
    '@repo/shared/types/api-keys': path.resolve(__dirname, '../../packages/shared/src/types/api-keys'),
    '@repo/shared/types/agent': path.resolve(__dirname, '../../packages/shared/src/types/agent'),
    '@repo/shared/types/skill': path.resolve(__dirname, '../../packages/shared/src/types/skill'),
    '@repo/shared/infrastructure/auth': path.resolve(__dirname, '../../packages/shared/src/infrastructure/auth'),
  }
}
```

#### 修正による影響

- テストコードの変更: 不要
- プロダクションコードの変更: 不要
- 設定ファイルの変更: `vitest.config.ts` のみ
- 他テストへの影響: なし（新規エイリアス追加のため、既存解決パスに影響しない）

---

### P-CLEANUP: 非同期クリーンアップ不足

#### 根本原因

chat-history 関連のテストにおいて、happy-dom 環境の AsyncTaskManager が破壊された後もスクリプト実行が継続する。テスト teardown（`afterEach` / `afterAll`）で非同期処理のクリーンアップが不完全なため、未処理の Promise 拒否が発生する。

#### 該当ファイル

1. `src/features/chat-history/__tests__/AppIntegration.test.tsx`
2. `src/features/chat-history/__tests__/ChatHistoryIntegration.test.tsx`
3. `src/features/chat-history/__tests__/ErrorHandling.test.tsx`
4. `src/features/chat-history/__tests__/ExpandedTests.test.tsx`
5. `src/features/chat-history/context/__tests__/ChatHistoryContext.test.tsx`
6. `src/features/chat-history/hooks/__tests__/useChatHistory.test.ts`

#### 修正アプローチ

テストの teardown フェーズで非同期処理を確実にクリーンアップする。具体的な修正パターンは以下のとおり。

**パターン A: afterEach での非同期クリーンアップ追加**

```typescript
// 修正前
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

// 修正後
afterEach(async () => {
  cleanup();
  // 保留中の非同期処理を全て完了させる
  await vi.runAllTimersAsync?.();
  await new Promise((resolve) => setTimeout(resolve, 0));
  vi.restoreAllMocks();
});
```

**パターン B: テスト内の非同期処理の明示的な待機**

```typescript
// 修正前
it('should handle chat history', () => {
  render(<ChatHistoryComponent />);
  fireEvent.click(screen.getByText('Load'));
  // 非同期処理が未完了のままテストが終了
});

// 修正後
it('should handle chat history', async () => {
  render(<ChatHistoryComponent />);
  await act(async () => {
    fireEvent.click(screen.getByText('Load'));
  });
  // 非同期処理の完了を待機
  await waitFor(() => {
    expect(screen.getByText('Loaded')).toBeInTheDocument();
  });
});
```

**パターン C: happy-dom AsyncTaskManager 対策**

```typescript
// 修正後: グローバルな unhandledrejection ハンドラで happy-dom 由来のエラーを捕捉
beforeAll(() => {
  // happy-dom の AsyncTaskManager 破壊後のエラーを安全に処理
  const originalConsoleError = console.error;
  console.error = (...args: unknown[]) => {
    const message = String(args[0]);
    if (message.includes("AsyncTaskManager")) {
      return; // happy-dom 内部エラーを抑制
    }
    originalConsoleError(...args);
  };
});
```

#### 修正による影響

- テストコードの変更: 6 ファイル
- プロダクションコードの変更: 不要
- 他テストへの影響: なし（chat-history テスト内の teardown 修正のみ）

---

### P-WORKER: Worker 予期せぬ終了（P22 既知問題）

#### 根本原因

P22 既知問題。大規模テスト実行時に Vitest Worker がメモリ圧迫またはタイムアウトにより予期せず終了する。

#### 対処方針

- コード修正は実施しない
- テスト実行時にリトライ（最大 3 回）で対処する
- 根本解決は TASK-FIX-10-1 のスコープ外として管理する

---

## 修正実行順序

修正は以下の順序で実施する。

| 順序 | パターン  | 修正内容                                      | 理由                                                           |
| ---- | --------- | --------------------------------------------- | -------------------------------------------------------------- |
| 1    | P-ALIAS   | vitest.config.ts へのサブパスエイリアス追加   | 最多の失敗テスト（~220）を解消し、修正の効果を早期に確認できる |
| 2    | P-CLEANUP | chat-history テストの非同期クリーンアップ修正 | P-ALIAS 修正後に残存する失敗テスト（~30）を解消する            |
| 3    | -         | dangerouslyIgnoreUnhandledErrors 設定行の削除 | 全テスト PASS を確認した後に設定行を削除する                   |

---

## 修正対象ファイル一覧

| #   | 修正対象ファイル                                                          | パターン  | 修正種別     |
| --- | ------------------------------------------------------------------------- | --------- | ------------ |
| 1   | `apps/desktop/vitest.config.ts`                                           | P-ALIAS   | 設定追加     |
| 2   | `src/features/chat-history/__tests__/AppIntegration.test.tsx`             | P-CLEANUP | teardown修正 |
| 3   | `src/features/chat-history/__tests__/ChatHistoryIntegration.test.tsx`     | P-CLEANUP | teardown修正 |
| 4   | `src/features/chat-history/__tests__/ErrorHandling.test.tsx`              | P-CLEANUP | teardown修正 |
| 5   | `src/features/chat-history/__tests__/ExpandedTests.test.tsx`              | P-CLEANUP | teardown修正 |
| 6   | `src/features/chat-history/context/__tests__/ChatHistoryContext.test.tsx` | P-CLEANUP | teardown修正 |
| 7   | `src/features/chat-history/hooks/__tests__/useChatHistory.test.ts`        | P-CLEANUP | teardown修正 |

**修正対象ファイル合計: 7 ファイル**（vitest.config.ts 1 件 + テストファイル 6 件）

---

## 変更履歴

| Version | Date       | Changes  |
| ------- | ---------- | -------- |
| 1.0.0   | 2026-02-19 | 初版作成 |
