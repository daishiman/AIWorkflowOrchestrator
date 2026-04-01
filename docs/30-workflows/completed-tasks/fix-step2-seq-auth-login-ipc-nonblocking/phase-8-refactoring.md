# Phase 8: リファクタリング

## メタ情報

| 項目   | 値                                         |
| ------ | ------------------------------------------ |
| Phase  | 8                                          |
| 機能名 | auth:login IPCハンドラーの非ブロッキング化 |
| 作成日 | 2026-04-01                                 |

## 目的

動作を変えずに、fire-and-forget の意図を明確にし、重複責務を増やさない形に整える。

## 実行タスク

- fire-and-forget のコメントを簡潔にする
- logging-only の `.catch()` 以外の処理を増やさない
- handler 側で `AUTH_STATE_CHANGED` を送らないことを明文化する

## リファクタリング観点

### 1. コメントの適切性

fire-and-forget の意図を明確にするコメントが、1 行で読み取れるか確認する。

```typescript
// OAuth フローの完了通知は AuthFlowOrchestrator に任せるため、ここでは待たない
void authFlowOrchestrator!
  .startOAuthFlow(provider as OAuthProvider)
  .catch((error) => {
    console.error(
      "[AuthHandlers] auth:login fire-and-forget failed:",
      sanitizeErrorMessage(error),
    );
  });
```

### 2. エラーログの追加

`.catch()` ブロック内は logging-only にして、通知責務を増やさない。

```typescript
.catch((error) => {
  console.error("[AuthHandlers] auth:login fire-and-forget failed:", sanitizeErrorMessage(error));
});
```

### 3. 型安全性の改善

`provider as OAuthProvider` は `isValidProvider()` を通った後だけ使うため、追加のヘルパーは不要。

### 4. 関数の分離検討

この修正は 1 箇所だけなので、共通ヘルパーへ切り出さない。

## リファクタリング対象外

| 項目                              | 理由                              |
| --------------------------------- | --------------------------------- |
| `CHANNEL_TIMEOUTS` の変更         | 変更不要                          |
| `authFlowOrchestrator` の内部変更 | 既存責務を維持するため不要        |
| `authSlice.ts` のリスナー変更     | 既存動作のため不要                |
| handler 登録方式の変更            | 他 handler と一貫性を保つため不要 |

## 実行手順

### ステップ 1: コードレビュー

- Phase 5 の実装コードを確認する
- コメント・命名・型安全性を確認する

### ステップ 2: 必要なリファクタリングの適用

- logging-only の `.catch()` に統一する
- コメントを 1 行で意図が伝わる形にする

### ステップ 3: テストの再実行

```bash
pnpm --filter @repo/desktop exec vitest run src/main/ipc/authHandlers.test.ts
pnpm --filter @repo/desktop typecheck
```

## 統合テスト連携

| テスト対象                                                          | 役割                          |
| ------------------------------------------------------------------- | ----------------------------- |
| `apps/desktop/src/main/ipc/authHandlers.test.ts`                    | handler の即時応答確認        |
| `apps/desktop/src/main/auth/__tests__/authFlowOrchestrator.test.ts` | AUTH_STATE_CHANGED の継続確認 |

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
- [ ] logging-only の `.catch()` に統一されている
- [ ] 型安全性が確認されている
- [ ] リファクタリング後にテストが全て PASS している
- [ ] `pnpm --filter @repo/desktop typecheck` が PASS している
- [ ] **本Phase内の全タスクを100%実行完了**
