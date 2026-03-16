# Phase 9: 品質検証

## メタ情報

| 項目       | 内容                                                          |
| ---------- | ------------------------------------------------------------- |
| タスク ID  | TASK-FIX-ELECTRON-APP-MENU-ZOOM-001                           |
| Phase      | 9 / 13                                                        |
| 作成日     | 2026-03-16                                                    |
| 担当       | 実装担当者                                                    |
| 依存 Phase | Phase 8（リファクタリング）— 完了済み                         |
| 成果物パス | `docs/30-workflows/electron-app-menu-zoom/phase-9-quality.md` |

---

## 目的

Phase 5（実装）および Phase 8（リファクタリング）の成果物に対して、ESLint・TypeScript 型チェック・Vitest・ビルドの4段階の品質ゲートをすべて通過させる。各コマンドの期待出力を明記し、失敗した場合の戻り先 Phase を定義する。

---

## 実行タスク

| No. | タスク名                  | 目的                                                   |
| --- | ------------------------- | ------------------------------------------------------ |
| 1   | ESLint 実行               | ESLint エラーが 0 件であることを確認する               |
| 2   | TypeScript 型チェック     | TypeScript コンパイルエラーが 0 件であることを確認する |
| 3   | Vitest テスト実行         | デスクトップアプリの全テストが PASS することを確認する |
| 4   | shared ビルド             | `@repo/shared` のビルドが成功することを確認する        |
| 5   | 失敗時の戻り先 Phase 判定 | 各品質ゲートが失敗した場合の対処フローを決定する       |

---

## 参照資料

| 資料                                                               | 参照理由                                             |
| ------------------------------------------------------------------ | ---------------------------------------------------- |
| `docs/30-workflows/electron-app-menu-zoom/phase-1-requirements.md` | AC-6（typecheck PASS）、AC-7（lint PASS）の基準確認  |
| `docs/30-workflows/electron-app-menu-zoom/phase-2-design.md`       | NFR-4（同期処理のみ）、NFR-5（100 行以内）の最終確認 |
| `apps/desktop/src/main/index.ts`                                   | 品質検証対象ファイル                                 |
| `apps/desktop/src/main/__tests__/menu.test.ts`                     | テスト対象ファイル                                   |
| `.claude/rules/02-code-quality.md`                                 | カバレッジ基準（Line 80%、Function 80%）の確認       |

---

## 実行手順

### Step 1: ESLint 実行

プロジェクトルートから以下のコマンドを実行する。

```bash
pnpm lint
```

**期待される出力**:

```
> @repo/root lint
> eslint . --ext .ts,.tsx

(出力なし、または "All files passed linting.")
```

エラーが 0 件の場合: Step 2 に進む。

エラーが 1 件以上ある場合: 以下の手順を実施する。

1. エラーメッセージを確認し、対象ファイルと行番号を特定する。
2. 一般的なエラーカテゴリと対処法:
   - `no-unused-vars`: 未使用の変数・import を削除する。
   - `@typescript-eslint/no-explicit-any`: `any` 型を具体的な型に置換する。
   - `import/order`: import の順序を ESLint の設定に従って並べ替える。
3. 修正後、`pnpm lint` を再実行してエラーが 0 件になることを確認する。
4. 修正が Phase 5 の実装に影響する内容の場合: Phase 5 に戻って実装を修正する。

### Step 2: TypeScript 型チェック実行

プロジェクトルートから以下のコマンドを実行する。

```bash
pnpm typecheck
```

**期待される出力**:

```
> @repo/root typecheck
> tsc --noEmit

(出力なし)
```

エラーが 0 件の場合: Step 3 に進む。

エラーが 1 件以上ある場合: 以下の手順を実施する。

1. エラーメッセージの `TS<番号>` コードを確認する。
2. 一般的なエラーと対処法:
   - `TS2339`（プロパティが存在しない）: `MenuItemConstructorOptions` の `role` や `type` の値が有効であることを確認する。Electron の型定義を確認し、union 型に含まれる値のみを使用する。
   - `TS2345`（型の非互換）: 関数の戻り値型を `Electron.MenuItemConstructorOptions[]` と明示する。
   - `TS2305`（モジュールにエクスポートがない）: `import { Menu } from "electron"` の形式が正しいことを確認する。
3. 修正後、`pnpm typecheck` を再実行してエラーが 0 件になることを確認する。
4. 修正が Phase 5 の実装コードに影響する場合: Phase 5 に戻って実装を修正する。
5. 修正が Phase 8 のリファクタリングに影響する場合: Phase 8 に戻って修正する。

### Step 3: Vitest テスト実行

以下のコマンドを実行する（P40 対策: テストは対象パッケージのディレクトリから実行する）。

```bash
pnpm --filter @repo/desktop test
```

または同等のコマンド:

```bash
cd apps/desktop && pnpm test
```

**期待される出力**:

```
 PASS  src/main/__tests__/menu.test.ts
  createApplicationMenu
    ✓ macOS で buildMacTemplate を使用する
    ✓ Windows で buildDefaultTemplate を使用する
    ✓ Linux で buildDefaultTemplate を使用する
  buildMacTemplate
    ✓ zoomIn role を含む
    ✓ zoomOut role を含む
    ✓ resetZoom role を含む
    ✓ togglefullscreen role を含む
    ✓ アプリ名メニューを含む
    ✓ 編集メニューを含む
    ✓ ウィンドウメニューを含む
  buildDefaultTemplate
    ✓ zoomIn role を含む
    ✓ zoomOut role を含む
    ✓ resetZoom role を含む
    ✓ togglefullscreen role を含む
    ✓ 表示メニューのみを含む

Test Files  1 passed (1)
Tests       N passed (N)
```

**カバレッジ確認**（`pnpm --filter @repo/desktop test --coverage` で実行する場合）:

| 指標              | 最低基準 | 期待値  |
| ----------------- | -------- | ------- |
| Line Coverage     | 80%      | 90%以上 |
| Branch Coverage   | 60%      | 70%以上 |
| Function Coverage | 80%      | 90%以上 |

テストが失敗した場合: 以下の手順を実施する。

1. 失敗したテストケース名とエラーメッセージを確認する。
2. 失敗の原因を特定する:
   - `Expected value` と `Received value` を比較して、実装の変更がテストの期待値と一致しているか確認する。
   - Phase 8 のリファクタリングによって振る舞いが変わった場合: Phase 8 に戻って修正する。
   - テスト自体の期待値が誤っている場合: Phase 6 に戻ってテストを修正する。
3. `process.platform` のモックが正しく設定されているか確認する（`vi.stubGlobal` または `vi.spyOn` の使用）。
4. 修正後、`pnpm --filter @repo/desktop test` を再実行して全 PASS することを確認する。

### Step 4: shared ビルド実行

以下のコマンドを実行する。

```bash
pnpm --filter @repo/shared build
```

**期待される出力**:

```
> @repo/shared build
> tsc -p tsconfig.build.json

(出力なし、または "Build succeeded.")
```

ビルドが成功した場合: Step 5 に進む。

ビルドが失敗した場合: 以下の手順を実施する。

1. 今回の変更（`Menu` import 追加・メニュー関数追加）が `packages/shared` のコードに影響していないことを確認する。
   ```bash
   git diff packages/shared/
   ```
   差分が 0 件の場合: `shared` の既存コードの問題であり、今回のタスクスコープ外のため、未タスク化して次 Phase に進む。
2. 差分がある場合: 今回のタスクで誤って `packages/shared` を変更した可能性があるため、差分を元に戻す。

### Step 5: 失敗時の戻り先 Phase の確認

すべての品質ゲートが PASS した場合: Phase 10（最終レビュー）に進む。

いずれかが失敗した場合の対処フロー:

| 失敗したゲート   | 原因の分類                           | 戻り先                 |
| ---------------- | ------------------------------------ | ---------------------- |
| `pnpm lint`      | 実装コードの ESLint 規則違反         | Phase 5                |
| `pnpm lint`      | リファクタリング後の新規違反         | Phase 8                |
| `pnpm typecheck` | 実装コードの型エラー                 | Phase 5                |
| `pnpm typecheck` | リファクタリング後の型エラー         | Phase 8                |
| `pnpm ... test`  | テストの期待値が実装と不一致         | Phase 5 または Phase 6 |
| `pnpm ... test`  | リファクタリングによる振る舞い変化   | Phase 8                |
| `pnpm ... build` | `packages/shared` への意図しない変更 | Phase 5                |

---

## 統合テスト連携

4 つの品質ゲートを順番に通過させ、すべて PASS であることを確認する。

| ゲート    | コマンド                           | 期待結果      |
| --------- | ---------------------------------- | ------------- |
| Lint      | `pnpm lint`                        | エラー 0 件   |
| TypeCheck | `pnpm typecheck`                   | エラー 0 件   |
| Test      | `pnpm --filter @repo/desktop test` | 全テスト PASS |
| Build     | `pnpm --filter @repo/shared build` | ビルド成功    |

---

## 成果物

| 成果物          | パス                                                                | 説明            |
| --------------- | ------------------------------------------------------------------- | --------------- |
| Phase 9 仕様書  | `docs/30-workflows/electron-app-menu-zoom/phase-9-quality.md`       | 本仕様書        |
| Phase 10 仕様書 | `docs/30-workflows/electron-app-menu-zoom/phase-10-final-review.md` | 次 Phase 成果物 |

---

## 完了条件

- [ ] `pnpm lint` が実行済みであり、エラー 0 件であることが確認されている
- [ ] `pnpm typecheck` が実行済みであり、エラー 0 件であることが確認されている
- [ ] `pnpm --filter @repo/desktop test` が実行済みであり、全テスト PASS であることが確認されている
- [ ] `pnpm --filter @repo/shared build` が実行済みであり、ビルド成功であることが確認されている
- [ ] 失敗したゲートがある場合、戻り先 Phase が記録されている
- [ ] 曖昧表現（「適切に」「必要に応じて」「など」）が本仕様書に含まれていない
- [ ] カバレッジ計測を実行し、Line Coverage ≥ 80%、Function Coverage ≥ 80% を確認した
- [ ] メニュー関連コードの行数を計測し、NFR-5（100行以内）を充足していることを確認した（`wc -l` またはエディタで確認）

---

## タスク100%実行確認【必須】

| No. | タスク名                  | 結果      | 備考 |
| --- | ------------------------- | --------- | ---- |
| 1   | ESLint 実行               | ⬜ 未実施 |      |
| 2   | TypeScript 型チェック     | ⬜ 未実施 |      |
| 3   | Vitest テスト実行         | ⬜ 未実施 |      |
| 4   | shared ビルド             | ⬜ 未実施 |      |
| 5   | 失敗時の戻り先 Phase 判定 | ⬜ 未実施 |      |

---

## 次 Phase

全品質ゲートが PASS した場合: Phase 10（最終レビュー）へ進む。
いずれかが失敗した場合: 上記「失敗時の戻り先 Phase」テーブルに従い、対応する Phase に戻る。
