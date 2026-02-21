# Phase 11: 手動テスト検証 — TypeScript `@repo/shared` モジュール解決エラー修正

## メタ情報

| 項目       | 値                                       |
| ---------- | ---------------------------------------- |
| Phase      | 11                                       |
| Phase名    | 手動テスト検証                           |
| 前提Phase  | Phase 10（最終レビュー）                 |
| 後続Phase  | Phase 12（ドキュメント更新）             |
| ステータス | 未実施                                   |
| 作成日     | 2026-02-20                               |
| 機能名     | TASK-FIX-TS-SHARED-MODULE-RESOLUTION-001 |
| Issue      | #837                                     |

## 目的

TypeScript の `@repo/shared` モジュール解決エラー 228件の修正が、IDE・ビルド・テスト・新規モジュール追加の全シナリオで正しく動作することを手動で検証する。

## 背景

自動テスト（Phase 4-9）では検証しきれない以下の観点を手動で確認する:

- IDE（VSCode）上での型情報表示・オートコンプリート
- Vitest alias と TypeScript paths の整合性
- 新しいサブパスエクスポート追加時の手順の実行可能性
- 実際の `pnpm typecheck` / `pnpm test` の End-to-End 確認

---

## 参照資料

| 参照資料                 | パス                                                                                  | 確認内容                       |
| ------------------------ | ------------------------------------------------------------------------------------- | ------------------------------ |
| Phase 1 要件定義         | `phase-1-requirements.md`                                                             | 要件・受入基準の確認           |
| Phase 2 設計             | `phase-2-design.md`                                                                   | 設計方針との整合               |
| Phase 5 実装             | `phase-5-implementation.md`                                                           | 実装内容の確認                 |
| Phase 6 テスト拡充       | `phase-6-test-expansion.md`                                                           | 追加テスト観点の確認           |
| Phase 7 カバレッジ       | `phase-7-coverage-check.md`                                                           | カバレッジ基準の確認           |
| Phase 8 リファクタリング | `phase-8-refactoring.md`                                                              | 設定整理後の前提確認           |
| Phase 9 品質保証         | `phase-9-quality-assurance.md`                                                        | 品質ゲート結果の確認           |
| Phase 10 最終レビュー    | `docs/30-workflows/TASK-FIX-TS-SHARED-MODULE-RESOLUTION-001/phase-10-final-review.md` | レビュー判定・未タスク化方針   |
| 品質要件                 | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`           | 手動検証時に確認すべき品質基準 |
| モノレポ要件             | `.claude/skills/aiworkflow-requirements/references/architecture-monorepo.md`          | `@repo/shared` 参照境界        |

---

## 実行タスク

- タスク1: 自動テスト結果の最終確認を実施する
- タスク2: IDE 型情報検証を実施する
- タスク3: 新規モジュール追加シミュレーションを実施する
- タスク4: Vitest alias と TypeScript paths の整合性を検証する
- タスク5: End-to-End 最終確認を実施する

> 以下のタスクを順番に実行してください。

### タスク1: 自動テスト結果の最終確認

**目的**: Phase 9 で実行した品質検証の結果が維持されていることを確認する

**実行手順**:

1. 以下のコマンドを実行:

   ```bash
   # @repo/shared のビルド
   pnpm --filter @repo/shared build

   # 型チェック（全パッケージ）
   pnpm typecheck

   # desktop パッケージのテスト
   pnpm --filter @repo/desktop exec vitest run
   ```

2. `pnpm typecheck` で `@repo/shared` 関連のモジュール解決エラーが **0件** であることを確認
3. Vitest の全テストが PASS であることを確認
4. 結果を記録

**期待される成果物**:

- 自動テスト実行結果ログ

---

### タスク2: IDE 型情報検証

**目的**: VSCode 上で `@repo/shared` のインポートが正しく型解決されることを確認する

**実行手順**:

1. VSCode で `apps/desktop` プロジェクトを開く
2. TypeScript Language Server が起動完了するまで待機（右下のステータスバー確認）
3. 以下のテストケースを実行:

| No  | カテゴリ           | テスト項目                        | 前提条件                    | 操作手順                                                              | 期待結果                                                  | 実行結果 | 備考 |
| --- | ------------------ | --------------------------------- | --------------------------- | --------------------------------------------------------------------- | --------------------------------------------------------- | -------- | ---- |
| 1   | 型情報ホバー       | `@repo/shared` インポートの型表示 | VSCode で対象ファイルを開く | `import { IPC_CHANNELS } from '@repo/shared/ipc'` にカーソルをホバー  | IPC_CHANNELS の型情報がツールチップに表示される           | -        | -    |
| 2   | 型情報ホバー       | サブパスエクスポートの型表示      | VSCode で対象ファイルを開く | `import { AgentConfig } from '@repo/shared/agent'` にカーソルをホバー | AgentConfig のインターフェース定義が表示される            | -        | -    |
| 3   | オートコンプリート | `@repo/shared/` のパス補完        | 新規 .ts ファイルを作成     | `import { } from '@repo/shared/'` と入力し、`/` の後で Ctrl+Space     | 利用可能なサブパス（`ipc`, `agent` 等）が候補に表示される | -        | -    |
| 4   | オートコンプリート | エクスポートメンバーの補完        | import 文を記述             | `import { } from '@repo/shared/ipc'` の `{ }` 内で Ctrl+Space         | IPC_CHANNELS 等のエクスポートメンバーが候補に表示される   | -        | -    |
| 5   | エラー検出         | 存在しないサブパスのエラー表示    | VSCode で対象ファイルを開く | `import { Foo } from '@repo/shared/nonexistent'` を記述               | 赤波線のエラーが表示される                                | -        | -    |

4. 結果を記録

**期待される成果物**:

- IDE 型情報検証結果

---

### タスク3: 新規モジュール追加シミュレーション

**目的**: `@repo/shared` に新しいモジュールを追加した際に、`apps/desktop` から型解決が動作することを確認する

**実行手順**:

1. `packages/shared/src/` 配下に仮のモジュールを作成:

   ```bash
   # 仮モジュール作成
   mkdir -p packages/shared/src/test-module
   cat > packages/shared/src/test-module/index.ts << 'EOF'
   export interface TestType {
     id: string;
     value: number;
   }

   export const TEST_CONSTANT = "test-value" as const;
   EOF
   ```

2. `packages/shared/package.json` の `exports` フィールドに追加:

   ```json
   "./test-module": {
     "types": "./src/test-module/index.ts",
     "import": "./dist/test-module/index.js",
     "require": "./dist/test-module/index.cjs"
   }
   ```

3. TypeScript の `paths`（または `typesVersions`）に対応する設定を追加

4. `apps/desktop` のテストファイルで仮インポートを記述:

   ```typescript
   import { TestType, TEST_CONSTANT } from "@repo/shared/test-module";
   ```

5. `pnpm typecheck` を実行し、エラーが出ないことを確認

6. **テスト完了後、仮モジュールを必ず削除する**:
   ```bash
   rm -rf packages/shared/src/test-module
   # package.json の exports から仮エントリを削除
   # TypeScript paths から仮エントリを削除
   git checkout -- packages/shared/
   ```

| No  | カテゴリ           | テスト項目                   | 前提条件    | 操作手順                      | 期待結果                                       | 実行結果 | 備考 |
| --- | ------------------ | ---------------------------- | ----------- | ----------------------------- | ---------------------------------------------- | -------- | ---- |
| 6   | 新規モジュール追加 | 仮モジュール追加後の型解決   | 手順1-3完了 | `pnpm typecheck` を実行       | `@repo/shared/test-module` の型解決エラーが0件 | -        | -    |
| 7   | 新規モジュール追加 | 仮モジュールの IDE 型表示    | 手順1-3完了 | VSCode で仮インポートにホバー | TestType の型情報が表示される                  | -        | -    |
| 8   | 新規モジュール追加 | 仮モジュール削除後の復元確認 | 手順6完了   | `pnpm typecheck` を実行       | 元のエラー0件状態が復元される                  | -        | -    |

**期待される成果物**:

- 新規モジュール追加シミュレーション結果

---

### タスク4: Vitest alias と TypeScript paths の整合性検証

**目的**: `vitest.config.ts` の `resolve.alias` と TypeScript の `paths` が同じモジュールを指していることを確認する

**実行手順**:

1. `apps/desktop/vitest.config.ts` の `resolve.alias` エントリを一覧化
2. `apps/desktop/tsconfig.json`（または `packages/shared/tsconfig.json`）の `compilerOptions.paths` エントリを一覧化
3. 両者を突き合わせ、以下を確認:

| No  | カテゴリ    | テスト項目                                          | 前提条件               | 操作手順                        | 期待結果                                             | 実行結果 | 備考 |
| --- | ----------- | --------------------------------------------------- | ---------------------- | ------------------------------- | ---------------------------------------------------- | -------- | ---- |
| 9   | alias整合性 | Vitest alias の全エントリが TypeScript paths に存在 | 設定ファイル一覧化完了 | Vitest alias と TS paths を比較 | Vitest alias の全エントリに対応する paths が存在する | -        | -    |
| 10  | alias整合性 | TypeScript paths の全エントリが Vitest alias に存在 | 設定ファイル一覧化完了 | TS paths と Vitest alias を比較 | TS paths の全エントリに対応する alias が存在する     | -        | -    |
| 11  | alias整合性 | alias と paths が同一のファイルパスを指している     | 設定ファイル一覧化完了 | 各エントリの解決先パスを比較    | 同一のモジュールファイルを指している                 | -        | -    |

**期待される成果物**:

- alias 整合性検証結果

---

### タスク5: End-to-End 最終確認

**目的**: 全コマンドを順次実行し、完全なグリーン状態を確認する

**実行手順**:

1. 以下のコマンドを順に実行:

   ```bash
   # 1. クリーンビルド
   pnpm --filter @repo/shared build

   # 2. 型チェック（全パッケージ）
   pnpm typecheck

   # 3. Lint
   pnpm lint

   # 4. desktop テスト
   pnpm --filter @repo/desktop exec vitest run

   # 5. shared テスト（存在する場合）
   pnpm --filter @repo/shared exec vitest run 2>/dev/null || echo "shared tests not configured"
   ```

| No  | カテゴリ | テスト項目                 | 前提条件        | 操作手順                                      | 期待結果                      | 実行結果 | 備考 |
| --- | -------- | -------------------------- | --------------- | --------------------------------------------- | ----------------------------- | -------- | ---- |
| 12  | E2E確認  | `pnpm typecheck` エラー0件 | shared ビルド済 | `pnpm typecheck` 実行                         | `@repo/shared` 関連エラー 0件 | -        | -    |
| 13  | E2E確認  | `pnpm lint` エラー0件      | -               | `pnpm lint` 実行                              | Lint エラー 0件               | -        | -    |
| 14  | E2E確認  | desktop 全テスト PASS      | shared ビルド済 | `pnpm --filter @repo/desktop exec vitest run` | 全テスト PASS                 | -        | -    |

**期待される成果物**:

- E2E 最終確認結果

---

## 統合テスト連携テーブル

| 自動テスト領域              | 手動テストで補完する観点           | Phase 11 テストケース |
| --------------------------- | ---------------------------------- | --------------------- |
| TypeScript コンパイル       | IDE 上の型情報ホバー・補完         | No.1-5                |
| Vitest resolve.alias        | alias と paths の突き合わせ        | No.9-11               |
| package.json exports        | 新規モジュール追加手順の実行可能性 | No.6-8                |
| `pnpm typecheck` ゼロエラー | 全パッケージ横断の E2E 確認        | No.12-14              |

---

## 成果物

| 成果物名           | パス                                     | 説明                               |
| ------------------ | ---------------------------------------- | ---------------------------------- |
| 手動テスト結果     | `outputs/phase-11/manual-test-result.md` | 全テストケースの実行結果           |
| スクリーンショット | `outputs/phase-11/screenshots/`          | IDE 型情報表示のスクリーンショット |

## 完了条件

- [ ] タスク1: `pnpm typecheck` で `@repo/shared` 関連エラー 0件
- [ ] タスク1: `pnpm --filter @repo/desktop exec vitest run` で全テスト PASS
- [ ] タスク2: IDE で `@repo/shared` インポートの型情報が表示される（No.1-5 全 PASS）
- [ ] タスク3: 新規モジュール追加→型解決→削除→復元 のサイクルが成功（No.6-8 全 PASS）
- [ ] タスク3: 仮モジュールが完全に削除されている
- [ ] タスク4: Vitest alias と TypeScript paths が完全に一致（No.9-11 全 PASS）
- [ ] タスク5: E2E 最終確認で全コマンド成功（No.12-14 全 PASS）
- [ ] 全14テストケースの結果が記録されている

## 次のPhase

Phase 12（ドキュメント更新）へ進む。
