# Phase 8: リファクタリング（TDD: Refactor）

## メタ情報

| 項目   | 値                       |
| ------ | ------------------------ |
| Phase  | 8                        |
| 機能名 | auth-ui-improvements-282 |
| 作成日 | 2026-02-04               |

## 目的

動作を変えずにコード品質を改善する。

---

## 実行タスク

### Task 1: コードリファクタリング（T-08-1）

#### リファクタリング対象

##### 1. profileHandlers.ts - エラー検出ロジック共通化

| 変更前                         | 変更後                                 |
| ------------------------------ | -------------------------------------- |
| PROFILE_GET内で条件判定        | `isUserProfilesTableError()`関数に抽出 |
| PROFILE_UPDATE内で同じ条件判定 | 共通関数を呼び出し                     |

共通関数設計:

```typescript
/**
 * user_profilesテーブル不在エラーかどうかを判定
 * @param error PostgrestError
 * @returns フォールバックが必要な場合true
 */
function isUserProfilesTableError(error: PostgrestError): boolean {
  return (
    error.message.includes("schema cache") ||
    error.message.includes("does not exist") ||
    error.message.includes("user_profiles") ||
    error.message.includes("relation") ||
    error.code === "PGRST200" ||
    error.code === "PGRST116" ||
    error.code === "42P01"
  );
}
```

##### 2. authSlice.ts - コメント改善

| 変更前                                       | 変更後                                                            |
| -------------------------------------------- | ----------------------------------------------------------------- |
| `// Refresh profile after auth state change` | `// Refresh profile and linked providers after auth state change` |
|                                              | `// (連携解除時などにUIを即座に更新するため)`                     |

---

## 統合テスト連携【必須】

リファクタ後の統合テスト継続成功を確認:

```bash
# リファクタリング後のテスト実行
pnpm --filter @repo/desktop test:run
pnpm --filter @repo/desktop test:integration
```

---

## リファクタリングチェックリスト

| チェック項目               | 判定 |
| -------------------------- | ---- |
| 重複コードが排除されている | -    |
| 命名が明確である           | -    |
| 関数が単一責務を持つ       | -    |
| コメントが適切である       | -    |
| テストが継続成功する       | -    |

---

## TDD検証: 継続Green確認

```bash
# テスト実行
pnpm --filter @repo/desktop test:run

# 確認項目
# - [ ] リファクタリング後もテストが成功することを確認
```

---

## 参照資料

| 資料名        | パス                                                               | 説明           |
| ------------- | ------------------------------------------------------------------ | -------------- |
| Phase 7成果物 | `outputs/phase-7/`                                                 | カバレッジ確認 |
| コード品質    | `aiworkflow-requirements: architecture-implementation-patterns.md` | 実装パターン   |

---

## 成果物

| 成果物       | パス                                           | 説明                 |
| ------------ | ---------------------------------------------- | -------------------- |
| 修正ファイル | `apps/desktop/src/main/ipc/profileHandlers.ts` | リファクタリング済み |

---

## 完了条件

- [ ] エラー検出ロジックが共通関数に抽出されている
- [ ] コメントが改善されている
- [ ] テストが継続成功している
- [ ] 重複コードが排除されている
- [ ] **本Phase内の全タスクを100%実行完了**

---

## 次のPhase

Phase 9: 品質保証
