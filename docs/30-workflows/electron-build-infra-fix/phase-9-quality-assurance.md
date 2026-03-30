# Phase 9: 品質保証

## メタ情報

| 項目      | 内容                                  |
| --------- | ------------------------------------- |
| Phase     | 9                                     |
| 名称      | 品質保証                              |
| 前提Phase | Phase 8                               |
| 成果物    | lint / typecheck / テスト全通過の証跡 |

## 目的

全変更ファイルに対して lint、typecheck、テストを実行し、品質基準を満たしていることを確認する。CI で実行されるチェックと同等の検証をローカルで完了させる。

## 実行タスク

### Task 9-1: ESLint 実行

```bash
pnpm lint
```

**対象ファイル**:

- `apps/desktop/electron.vite.config.ts`
- `apps/desktop/src/__tests__/build/*.test.ts`
- `packages/shared/src/__tests__/build/*.test.ts`

**確認項目**:

- ESLint エラーが 0 件であること
- ESLint 警告が新規追加されていないこと

**エラーが出た場合の対処**:

- `@typescript-eslint/no-require-imports`: テストファイルの `require()` に対して発生する場合、該当行に `// eslint-disable-next-line @typescript-eslint/no-require-imports` を追加する
- その他のエラー: Phase 8 のコードに戻って修正する

### Task 9-2: TypeScript 型チェック

```bash
pnpm typecheck
```

**対象パッケージ**:

- `@repo/shared`: `packages/shared/package.json` の exports 変更が型解決に影響しないことを確認
- `@repo/desktop`: `electron.vite.config.ts` と新規テストファイルの型が正しいことを確認

**確認項目**:

- TypeScript エラーが 0 件であること
- `@repo/shared` の exports 変更により `apps/web` のビルドが壊れていないこと

**追加チェック**:

```bash
# apps/web の型チェックも実行して後方互換性を確認
pnpm --filter @repo/web typecheck 2>/dev/null || echo "web パッケージが存在しない場合はスキップ"
```

### Task 9-3: 全テスト実行

```bash
# 全パッケージのテストを実行
pnpm test
```

**確認項目**:

- 全テストが PASS していること
- Phase 4/6 で追加した 30 テストが含まれていること
- 既存テストに回帰がないこと

**テスト結果の記録**:

```
@repo/shared:
  - 既存テスト: XX/XX PASS
  - 新規テスト（build/）: 7/7 PASS

@repo/desktop:
  - 既存テスト: XX/XX PASS
  - 新規テスト（build/）: 23/23 PASS

合計: 全 PASS
```

### Task 9-4: Prettier フォーマット確認

```bash
pnpm format
```

**確認項目**:

- フォーマットによる変更が発生しないこと（既に正しくフォーマットされていること）
- 変更が発生した場合は差分を確認し、コミットに含める

### Task 9-5: ビルド成功確認

```bash
# shared パッケージのビルド
pnpm --filter @repo/shared build

# desktop パッケージのビルド
pnpm --filter @repo/desktop build
```

**確認項目**:

- `pnpm --filter @repo/shared build` が成功し、`dist/` に ESM + CJS ファイルが生成されること
- `pnpm --filter @repo/desktop build` が成功し、`out/main/` と `out/preload/` にバンドルが生成されること
- ビルドエラーが 0 件であること
- ビルド警告に新規の critical な警告がないこと

### Task 9-6: 品質チェックサマリ

| チェック項目   | コマンド                            | 期待結果    |
| -------------- | ----------------------------------- | ----------- |
| ESLint         | `pnpm lint`                         | エラー 0 件 |
| TypeScript     | `pnpm typecheck`                    | エラー 0 件 |
| テスト         | `pnpm test`                         | 全 PASS     |
| Prettier       | `pnpm format`                       | 差分なし    |
| shared ビルド  | `pnpm --filter @repo/shared build`  | 成功        |
| desktop ビルド | `pnpm --filter @repo/desktop build` | 成功        |

## 参照資料

### システム仕様（aiworkflow-requirements）

| 資料名           | パス                                   |
| ---------------- | -------------------------------------- |
| 品質要件         | `references/quality-requirements.md`   |
| 開発ガイドライン | `references/development-guidelines.md` |

## 成果物

| 成果物           | 配置先                                       | 説明               |
| ---------------- | -------------------------------------------- | ------------------ |
| 品質チェック結果 | `phase-9-quality-assurance.md`（本ファイル） | チェック結果の記録 |

## 完了条件

- [ ] `pnpm lint` がエラー 0 件で完了している
- [ ] `pnpm typecheck` がエラー 0 件で完了している
- [ ] `pnpm test` が全テスト PASS で完了している
- [ ] `pnpm format` で差分が発生しない（フォーマット済み）
- [ ] `pnpm --filter @repo/shared build` が成功している
- [ ] `pnpm --filter @repo/desktop build` が成功している
- [ ] 品質チェックサマリが全て期待結果を満たしている
- [ ] **本Phase内の全タスクを100%実行完了**
