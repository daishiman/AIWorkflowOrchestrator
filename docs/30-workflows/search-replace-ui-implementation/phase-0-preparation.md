# Phase 0: 準備作業（除外解除）

## メタ情報

| 項目   | 値                    |
| ------ | --------------------- |
| Phase  | 0                     |
| 機能名 | 検索・置換機能 UI実装 |
| 作成日 | 2026-01-05            |

## 目的

バックエンド実装時に一時的に除外されたテストファイルをtypecheckとテスト実行の両方に再追加し、TDDサイクル（Red状態）を開始できる状態にする。

## 背景

TASK-SEARCH-REPLACE-001（バックエンド実装）で、UIコンポーネントが未実装のため以下のテストファイルが除外されている:

- `src/features/search/__tests__/SearchPanel.test.tsx`
- `src/features/search/__tests__/WorkspaceSearchPanel.test.tsx`

これらはTDDアプローチで**先に作成済み**だが、importエラー回避のため一時除外されている。

## 使用スキル

- なし（設定ファイルの手動編集）

## 参照資料

| 資料名         | パス                                                                         | 説明                  |
| -------------- | ---------------------------------------------------------------------------- | --------------------- |
| タスク指示書   | `docs/30-workflows/unassigned-task/task-search-replace-ui-implementation.md` | 元タスク指示書        |
| TypeScript設定 | `apps/desktop/tsconfig.json`                                                 | 除外設定の場所        |
| Vitest設定     | `apps/desktop/vitest.config.ts`                                              | 除外設定の場所        |
| 成果物追跡     | `docs/30-workflows/search-replace-functionality/artifacts.json`              | pendingTestExclusions |

## 実行手順

### ステップ1: tsconfig.json の除外解除

`apps/desktop/tsconfig.json` を開き、`exclude` 配列から以下のエントリを**削除**する:

```json
"src/features/search/__tests__/SearchPanel.test.tsx",
"src/features/search/__tests__/WorkspaceSearchPanel.test.tsx"
```

### ステップ2: vitest.config.ts の除外解除

`apps/desktop/vitest.config.ts` を開き、`test.exclude` 配列から以下のエントリを**削除**する:

```typescript
"src/features/search/__tests__/SearchPanel.test.tsx",
"src/features/search/__tests__/WorkspaceSearchPanel.test.tsx",
```

### ステップ3: 除外解除の確認

```bash
# 型エラーが出ることを確認（UIコンポーネント未実装のため）
pnpm --filter @repo/desktop typecheck

# テスト実行でimportエラーが出ることを確認
pnpm --filter @repo/desktop test:run
```

**期待される結果**: importエラーが発生（これがTDD Red状態）

### ステップ4: 除外追跡情報の更新

`docs/30-workflows/search-replace-functionality/artifacts.json` の `pendingTestExclusions` を確認し、除外解除済みとして記録する。

## 成果物

| 成果物                 | パス                            | 説明                 |
| ---------------------- | ------------------------------- | -------------------- |
| 更新された設定ファイル | `apps/desktop/tsconfig.json`    | 除外エントリ削除済み |
| 更新された設定ファイル | `apps/desktop/vitest.config.ts` | 除外エントリ削除済み |

## 完了条件

- [ ] `tsconfig.json` からテストファイル除外が削除されている
- [ ] `vitest.config.ts` からテストファイル除外が削除されている
- [ ] `pnpm --filter @repo/desktop typecheck` でimportエラーが出ることを確認
- [ ] `pnpm --filter @repo/desktop test:run` でimportエラーが出ることを確認
- [ ] artifacts.jsonの除外追跡情報を確認済み

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. tsconfig.json の除外解除
2. vitest.config.ts の除外解除
3. 型チェックでエラー確認
4. テスト実行でエラー確認
5. artifacts.json確認

## 次のPhase

Phase 4: テスト作成（TDD: Red）
