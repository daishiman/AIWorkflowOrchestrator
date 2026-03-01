# 要件定義サマリー — packages/shared ソースディレクトリ構造統一

## 機能要件（FR）

| ID   | 要件名                          | 概要                                                                                    |
| ---- | ------------------------------- | --------------------------------------------------------------------------------------- |
| FR-1 | ソースディレクトリ統一          | `types/` 配下の5ファイルを `src/types/` に移動する                                      |
| FR-2 | package.json exports 更新       | `./types/auth` と `./types/api-keys` の exports パスを `./dist/src/types/` に変更する   |
| FR-3 | package.json typesVersions 更新 | `types/auth` と `types/api-keys` の typesVersions パスを `./src/types/` に変更する      |
| FR-4 | tsup.config.ts エントリー更新   | 旧 `types/` エントリを削除し、`src/types/auth.ts` と `src/types/api-keys.ts` を追加する |
| FR-5 | index.ts 統合                   | `types/index.ts` の re-export 内容を `src/types/index.ts` に統合する                    |
| FR-6 | テストファイル移行              | `types/__tests__/auth.test.ts` を `src/types/__tests__/auth.test.ts` に移動する         |
| FR-7 | 旧ディレクトリ削除              | 全移動完了後に `packages/shared/types/` を完全に削除する                                |

## 非機能要件（NFR）

| ID    | 要件名       | 概要                                                 | 検証方法                                            |
| ----- | ------------ | ---------------------------------------------------- | --------------------------------------------------- |
| NFR-1 | 後方互換性   | 公開パス（`@repo/shared/types/auth` 等）は変更しない | 既存 import 文がコンパイル成功                      |
| NFR-2 | ビルド整合性 | `pnpm --filter @repo/shared build` が成功する        | `dist/src/types/auth.d.ts` の存在確認               |
| NFR-3 | 型チェック   | `pnpm typecheck` がプロジェクト全体で 0 エラー       | `@repo/shared` と `@repo/desktop` の typecheck 実行 |
| NFR-4 | テスト全PASS | `pnpm --filter @repo/shared test:run` が全 PASS      | 移行テストを含む全テスト実行                        |

## aiworkflow-requirements 抽出結果

| 参照仕様                   | 抽出した必須情報                                                | FR/NFR への反映         |
| -------------------------- | --------------------------------------------------------------- | ----------------------- |
| `architecture-monorepo.md` | `@repo/shared/types/*` の公開契約は維持し、実体パスのみ更新する | FR-2, FR-3, NFR-1       |
| `directory-structure.md`   | `packages/shared` 配下で型定義を単一路径に統合する              | FR-1, FR-5, FR-7        |
| `quality-requirements.md`  | ビルド/型チェック/テストを完了条件に含める                      | NFR-2, NFR-3, NFR-4     |
| `task-workflow.md`         | Phaseごとの成果物と完了条件を検証可能な形式で管理する           | AC と完了条件の定義方針 |

## 移行対象ファイル一覧

| 現在のパス                     | 移行先                              | 公開パス                      |
| ------------------------------ | ----------------------------------- | ----------------------------- |
| `types/auth.ts`                | `src/types/auth.ts`                 | `@repo/shared/types/auth`     |
| `types/api-keys.ts`            | `src/types/api-keys.ts`             | `@repo/shared/types/api-keys` |
| `types/common.ts`              | `src/types/common.ts`               | re-export 経由                |
| `types/file-selection.ts`      | `src/types/file-selection.ts`       | re-export 経由                |
| `types/workflow.ts`            | `src/types/workflow.ts`             | re-export 経由                |
| `types/index.ts`               | 削除（`src/types/index.ts` に統合） | -                             |
| `types/__tests__/auth.test.ts` | `src/types/__tests__/auth.test.ts`  | -                             |
