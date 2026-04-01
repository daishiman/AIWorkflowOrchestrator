# Phase 9: 品質保証

## メタ情報

| 項目   | 値                                         |
| ------ | ------------------------------------------ |
| Phase  | 9                                          |
| 機能名 | auth:login IPCハンドラーの非ブロッキング化 |
| 作成日 | 2026-04-01                                 |

## 目的

変更が既存の OAuth フローと listener にリグレッションを起こしていないことを確認する。

## 実行タスク

- handler / orchestrator / listener の regression を確認する
- typecheck / lint / vitest を通す
- `AUTH_STATE_CHANGED` の重複送信がないことを確認する

## 品質確認観点

### 1. 既存テストへの影響確認

```bash
pnpm --filter @repo/desktop exec vitest run src/main/ipc/authHandlers.test.ts src/main/auth/__tests__/authFlowOrchestrator.test.ts src/renderer/store/slices/authSlice.test.ts
```

### 2. TypeScript 型チェック

```bash
pnpm --filter @repo/desktop typecheck
```

### 3. ESLint チェック

```bash
pnpm --filter @repo/desktop lint src/main/ipc/authHandlers.ts
```

### 4. OAuth フロー正常動作の確認

| 確認観点       | 方法              | 期待結果                                       |
| -------------- | ----------------- | ---------------------------------------------- |
| 即時レスポンス | handler unit test | `{ success: true }`                            |
| 成功通知       | orchestrator test | `AUTH_STATE_CHANGED` が継続送信される          |
| 失敗通知       | orchestrator test | `{ authenticated: false, error }` が送信される |
| listener 互換  | authSlice test    | state 更新が維持される                         |

### 5. リグレッションリスクの評価

| リスク                         | 影響度 | 評価                                        |
| ------------------------------ | ------ | ------------------------------------------- |
| handler が成功通知を再送する   | 高     | `.catch()` を logging-only にすることで回避 |
| `.catch()` がエラーを飲み込む  | 中     | orchestrator 側の通知で UX を維持           |
| provider validation を壊す     | 中     | `isValidProvider()` を維持                  |
| 並列 auth:login 呼び出しの競合 | 低     | Phase 6 で確認済み                          |

### 6. 全体テスト実行

```bash
pnpm --filter @repo/desktop exec vitest run
```

## 品質基準

| 指標                  | 基準                                     |
| --------------------- | ---------------------------------------- |
| ユニットテスト        | 全て PASS                                |
| TypeScript 型チェック | エラー 0 件                              |
| ESLint                | エラー 0 件、警告 0 件（既存警告は許容） |
| 既存テストへの影響    | リグレッションなし                       |

## 統合テスト連携

| テスト対象                                                          | 役割                       |
| ------------------------------------------------------------------- | -------------------------- |
| `apps/desktop/src/main/ipc/authHandlers.test.ts`                    | 500ms 以内のレスポンス確認 |
| `apps/desktop/src/main/auth/__tests__/authFlowOrchestrator.test.ts` | success / failure 通知確認 |
| `apps/desktop/src/renderer/store/slices/authSlice.test.ts`          | listener 互換確認          |

## 参照資料

| 資料名     | パス                          | 説明           |
| ---------- | ----------------------------- | -------------- |
| 要件定義   | `./phase-1-requirements.md`   | AC-05 の確認   |
| テスト作成 | `./phase-4-test-creation.md`  | TC-01 〜 TC-05 |
| テスト拡充 | `./phase-6-test-expansion.md` | TC-06 〜 TC-09 |
| 実装       | `./phase-5-implementation.md` | 修正内容       |

## 成果物

| 成果物   | パス                           | 説明       |
| -------- | ------------------------------ | ---------- |
| 品質保証 | `phase-9-quality-assurance.md` | 本ファイル |

## 完了条件

- [ ] `pnpm --filter @repo/desktop exec vitest run` が全て PASS している
- [ ] `pnpm --filter @repo/desktop typecheck` が PASS している
- [ ] `pnpm --filter @repo/desktop lint` が PASS している
- [ ] 既存 OAuth フローのテストにリグレッションがない
- [ ] リスク評価で高リスクが全て緩和されている
- [ ] **本Phase内の全タスクを100%実行完了**
