# 受け入れ基準 - TASK-8C-A: IPC統合テスト

## 作成日: 2026-02-02

---

## 受け入れ基準一覧

| 基準ID | カテゴリ        | 基準                                                           | 検証方法                                                                                                  | 合格条件                     |
| ------ | --------------- | -------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- | ---------------------------- |
| AC-001 | テストケース数  | 基本12テストケースが全て実装されている                         | `skillIpc.integration.test.ts` 内の `it()` ブロック数（TC-01〜TC-12）                                     | 12件の `it()` ブロック       |
| AC-002 | テストケース数  | IMP-002追加10テストケースが全て実装されている                  | `skillIpc.integration.test.ts` 内の `it()` ブロック数（TC-13〜TC-22）                                     | 10件の `it()` ブロック       |
| AC-003 | テスト実行      | 全22テストが `vitest run` でパスする                           | `pnpm --filter @repo/desktop vitest run apps/desktop/src/main/ipc/__tests__/skillIpc.integration.test.ts` | 22 tests passed, 0 failed    |
| AC-004 | カバレッジ      | `skillHandlers.ts` の行カバレッジが90%以上                     | `pnpm --filter @repo/desktop vitest run --coverage`                                                       | Lines >= 90%                 |
| AC-005 | セキュリティ    | 全チャネルで `validateIpcSender` の呼び出しが検証されている    | テストコード内の `validateIpcSender` 検証箇所確認                                                         | 全ハンドラーテストに検証あり |
| AC-006 | 型安全          | テストファイルがTypeScript strictモードでコンパイル可能        | `pnpm --filter @repo/desktop tsc --noEmit`                                                                | エラー0件                    |
| AC-007 | 命名規則        | テストファイル名が `skillIpc.integration.test.ts`              | ファイル名確認                                                                                            | 正確一致                     |
| AC-008 | 配置            | テストファイルが `apps/desktop/src/main/ipc/__tests__/` に配置 | パス確認                                                                                                  | 正確一致                     |
| AC-009 | エラーパス      | 各チャネルの正常系・異常系が両方テストされている               | テストケース確認                                                                                          | 正常系+異常系ペアが存在      |
| AC-010 | OperationResult | 戻り値が `OperationResult<T>` パターンに準拠して検証されている | テストコード内の `success`, `data`, `error` フィールド検証確認                                            | 全チャネルで検証あり         |

---

## 検証コマンド

```bash
# AC-003: テスト実行
pnpm --filter @repo/desktop vitest run apps/desktop/src/main/ipc/__tests__/skillIpc.integration.test.ts

# AC-004: カバレッジ測定
pnpm --filter @repo/desktop vitest run --coverage apps/desktop/src/main/ipc/__tests__/skillIpc.integration.test.ts

# AC-006: TypeScript型チェック
pnpm --filter @repo/desktop tsc --noEmit

# AC-001/AC-002: テストケース数確認
grep -c "it(" apps/desktop/src/main/ipc/__tests__/skillIpc.integration.test.ts
```
