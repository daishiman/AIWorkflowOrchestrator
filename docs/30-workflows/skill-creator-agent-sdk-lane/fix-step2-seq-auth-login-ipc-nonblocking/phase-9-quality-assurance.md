# Phase 9: 品質保証

## メタ情報

| 項目   | 値                                         |
| ------ | ------------------------------------------ |
| Phase  | 9                                          |
| 機能名 | auth:login IPCハンドラーの非ブロッキング化 |
| 作成日 | 2026-04-01                                 |

## 目的

既存の OAuth フローが修正によって壊れていないことを確認し、全体的な品質を保証する。

## 品質確認観点

### 1. 既存テストへの影響確認

`authHandlers.ts` の変更が既存テストに影響していないことを確認する。

```bash
# authHandlers 関連テスト全体実行
pnpm --filter @repo/desktop exec vitest run src/main/ipc/

# auth 系テスト全体実行
pnpm --filter @repo/desktop exec vitest run src/main/ --reporter=verbose | grep -E "(auth|PASS|FAIL)"
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

既存 OAuth フローが壊れていないことを以下の観点で確認する。

| 確認観点                                        | 方法                                 | 期待結果                                       |
| ----------------------------------------------- | ------------------------------------ | ---------------------------------------------- |
| `auth:login` IPC 呼び出しが即時レスポンスを返す | ユニットテスト（TC-01）              | `{ success: true }` が返る                     |
| OAuth 成功時に `AUTH_STATE_CHANGED` が発火する  | 既存の `authFlowOrchestrator` テスト | 既存テスト PASS                                |
| OAuth 失敗時に `AUTH_STATE_CHANGED` で失敗通知  | TC-03                                | `{ authenticated: false, error }` が送信される |
| スキル生成ボタン押下でタイムアウトエラーなし    | Phase 11 手動テスト                  | エラーなし                                     |

### 5. リグレッションリスクの評価

| リスク                            | 影響度 | 評価                                              |
| --------------------------------- | ------ | ------------------------------------------------- |
| `auth:login` が成功通知を送らない | 高     | `authFlowOrchestrator` 内部が担当するため問題なし |
| `.catch()` がエラーを飲み込む     | 中     | エラーログ追加で緩和                              |
| `mainWindow` 参照が null になる   | 中     | ハンドラー登録時のクロージャ確認済み              |
| 並列 `auth:login` 呼び出しの競合  | 低     | TC-07 で確認済み                                  |

### 6. 全体テスト実行

```bash
# desktop パッケージの全テスト
pnpm --filter @repo/desktop test

# または vitest run
pnpm --filter @repo/desktop exec vitest run
```

## 品質基準

| 指標                  | 基準                                     |
| --------------------- | ---------------------------------------- |
| ユニットテスト        | 全て PASS                                |
| TypeScript 型チェック | エラー 0 件                              |
| ESLint                | エラー 0 件、警告 0 件（既存警告は許容） |
| 既存テストへの影響    | リグレッションなし                       |

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
- [ ] リスク評価で「高」項目が全て緩和されている
- [ ] **本Phase内の全タスクを100%実行完了**
