# Phase 8: リファクタリング

## メタ情報

| 項目   | 値                                         |
| ------ | ------------------------------------------ |
| Phase  | 8                                          |
| 機能名 | auth:login IPCハンドラーの非ブロッキング化 |
| 作成日 | 2026-04-01                                 |

## 目的

Phase 5 の実装を確認し、可読性・保守性の観点でリファクタリングが必要な箇所を整理する。

## リファクタリング観点

### 1. コメントの適切性

fire-and-forget の意図を明確にするコメントが適切に記述されているか確認する。

```typescript
// 確認観点: コメントが意図を説明しているか
// fire-and-forget: OAuth フロー開始のみ、完了は AUTH_STATE_CHANGED で通知
authFlowOrchestrator.startOAuthFlow(provider as OAuthProvider)
  .catch((error) => { ... });
```

### 2. エラーログの追加

`.catch()` ブロック内でエラーをログに記録することを検討する。

```typescript
.catch((error) => {
  logger.error('[AuthHandler] OAuth flow failed:', error);
  mainWindow.webContents.send(IPC_CHANNELS.AUTH_STATE_CHANGED, {
    authenticated: false,
    error: sanitizeErrorMessage(error),
  });
});
```

### 3. 型安全性の改善

`provider as OAuthProvider` のキャストが必要かどうか、型定義を確認する。
バリデーション済み引数であれば型キャストを削除できる可能性がある。

### 4. 関数の分離検討

`.catch()` のエラーハンドリングロジックが複数箇所に現れる場合、共通ヘルパーへの切り出しを検討する。
本修正では 1 箇所のみのため、現状維持で問題ない。

## リファクタリング対象外

| 項目                              | 理由                             |
| --------------------------------- | -------------------------------- |
| `IPC_TIMEOUT_MS` の変更           | スコープ外                       |
| `authFlowOrchestrator` の内部変更 | スコープ外                       |
| `authSlice.ts` のリスナー変更     | 既存動作のため変更不要           |
| ハンドラー登録方式の変更          | 他ハンドラーとの一貫性を保つため |

## 実行手順

### ステップ 1: コードレビュー

- Phase 5 の実装コードを確認する
- コメント・命名・型安全性を確認する

### ステップ 2: 必要なリファクタリングの適用

- エラーログの追加（推奨）
- コメントの明確化（必要な場合）

### ステップ 3: テストの再実行

```bash
# リファクタリング後のテスト確認
pnpm --filter @repo/desktop exec vitest run src/main/ipc/__tests__/authHandlers.test.ts
pnpm --filter @repo/desktop typecheck
```

## 参照資料

| 資料名 | パス                          | 説明           |
| ------ | ----------------------------- | -------------- |
| 実装   | `./phase-5-implementation.md` | 実装済みコード |
| テスト | `./phase-4-test-creation.md`  | テストケース   |

## 成果物

| 成果物         | パス                     | 説明       |
| -------------- | ------------------------ | ---------- |
| リファクタ方針 | `phase-8-refactoring.md` | 本ファイル |

## 完了条件

- [ ] コメントが fire-and-forget の意図を明確に説明している
- [ ] エラーログの追加要否が判断されている
- [ ] 型安全性が確認されている
- [ ] リファクタリング後にテストが全て PASS している
- [ ] `pnpm --filter @repo/desktop typecheck` が PASS している
- [ ] **本Phase内の全タスクを100%実行完了**
