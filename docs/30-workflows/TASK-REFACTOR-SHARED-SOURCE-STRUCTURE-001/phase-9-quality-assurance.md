# Phase 9: 品質検証 - タスク仕様書

## メタ情報

| 項目       | 内容                                      |
| ---------- | ----------------------------------------- |
| Phase      | 9                                         |
| Phase名    | 品質検証（Quality Assurance）             |
| タスクID   | TASK-REFACTOR-SHARED-SOURCE-STRUCTURE-001 |
| 前提Phase  | Phase 8（リファクタリング）               |
| 後続Phase  | Phase 10（最終レビュー）                  |
| ステータス | 未着手                                    |
| 作成日     | 2026-02-28                                |
| 機能名     | TASK-REFACTOR-SHARED-SOURCE-STRUCTURE-001 |

---

## 目的

Lint・型チェック・全テスト実行・ビルド検証・旧パス残存チェックの5つの品質ゲートを通過させ、`types/` → `src/types/` 移行が品質基準を満たしていることを確認する。

## 背景

Phase 8（リファクタリング）で re-export 整理・設定ファイル整理・旧パス除去が完了した。本 Phase では、これらの変更が既存の機能・型安全性・テストカバレッジに悪影響を与えていないことを、自動化された品質ゲートで検証する。特に以下の観点が重要:

1. `@repo/shared` パッケージ単体の型チェックとテストが通ること
2. `@repo/desktop` パッケージの型チェックとテストが通ること（消費者側への影響確認）
3. ビルド成果物（`dist/`）に旧パス構造が残存していないこと

---

## 実行タスク

### タスク1: ESLint 実行

**目的**: コードスタイルと静的解析の品質ゲートを通過させる。

**実行手順**:

1. プロジェクトルートで ESLint を実行する
2. エラーが 0 件であることを確認する
3. 警告がある場合は内容を記録する（警告は Phase 10 で判断）

**実行コマンド**:

```bash
pnpm lint
```

**合格基準**: エラー 0 件。

---

### タスク2: TypeScript 型チェック

**目的**: 型安全性が維持されていることを確認する。shared パッケージと desktop パッケージの両方で型チェックを実行する。

**実行手順**:

1. `@repo/shared` パッケージの型チェックを実行する
2. エラーが 0 件であることを確認する
3. `@repo/desktop` パッケージの型チェックを実行する
4. エラーが 0 件であることを確認する
5. エラーが発生した場合は、エラーメッセージと対象ファイルを記録する

**実行コマンド**:

```bash
# shared パッケージ
pnpm --filter @repo/shared typecheck

# desktop パッケージ（消費者側の型整合性確認）
pnpm --filter @repo/desktop typecheck
```

**合格基準**: 両パッケージでエラー 0 件。

---

### タスク3: テスト全実行

**目的**: 全テストが PASS することを確認する。特に移行対象ファイルのテストと、消費者側（desktop）のテストに注目する。

**実行手順**:

1. `@repo/shared` パッケージのテストを実行する
2. 全テストが PASS することを確認する
3. `@repo/desktop` パッケージのテストを実行する（P40 対策: desktop ディレクトリから実行）
4. 全テストが PASS することを確認する
5. テスト失敗がある場合は、失敗テスト名・エラーメッセージ・対象ファイルを記録する

**実行コマンド**:

```bash
# shared パッケージ
pnpm --filter @repo/shared test:run

# desktop パッケージ（P40対策: --filter で実行）
pnpm --filter @repo/desktop exec vitest run
```

**合格基準**: 全テスト PASS（失敗 0 件）。

**注意事項**:

- P40（テスト実行ディレクトリ依存）: desktop のテストはプロジェクトルートから直接 vitest を実行しないこと。`pnpm --filter @repo/desktop exec vitest run` または `cd apps/desktop && pnpm vitest run` で実行する

---

### タスク4: ビルド検証

**目的**: ビルド成果物が正しく生成され、旧パス構造が `dist/` に残存していないことを確認する。

**実行手順**:

1. `@repo/shared` パッケージをビルドする
2. ビルドが成功することを確認する
3. `dist/` ディレクトリ構造を確認する:
   - `dist/src/types/` ディレクトリが存在すること
   - `dist/types/` ディレクトリが存在しないこと（旧パスが残存していないこと）
4. ビルド成果物のファイル一覧を記録する

**実行コマンド**:

```bash
# ビルド実行
pnpm --filter @repo/shared build

# dist/ 構造確認（旧パスが存在しないこと）
ls -la packages/shared/dist/types/ 2>&1
# 期待結果: No such file or directory

# 新パスが存在すること
ls -la packages/shared/dist/src/types/
```

**合格基準**:

- ビルドが成功すること（exit code 0）
- `dist/types/` が存在しないこと
- `dist/src/types/` が存在し、移行対象ファイルのビルド成果物が含まれていること

---

### タスク5: 旧パス残存チェック

**目的**: 設定ファイル・ソースコード内に旧パス（`types/` を直接参照する記述）が残存していないことを網羅的に確認する。

**実行手順**:

1. `package.json` の旧パス残存チェック:

```bash
# exports の旧パス（dist/types/ で src を含まない）
grep -n "dist/types/" packages/shared/package.json | grep -v "dist/src/types/"

# typesVersions の旧パス
grep -n '"./types/' packages/shared/package.json
```

2. `tsup.config.ts` の旧パス残存チェック:

```bash
# 旧エントリー（types/ で src を含まない）
grep -n "types/" packages/shared/tsup.config.ts | grep -v "src/types/" | grep -v "node_modules"
```

3. `tsconfig.json` の旧 include 残存チェック:

```bash
# types/**/*.ts の残存確認
grep -n 'types/\*\*' packages/shared/tsconfig.json
```

4. ソースコード内の旧 import パス残存チェック:

```bash
# types/ ディレクトリを直接参照する import（src/types/ は除外）
grep -rn "from ['\"].*types/" packages/shared/src/ | grep -v "src/types/" | grep -v "node_modules"
```

**合格基準**: 全 grep コマンドの出力が 0 件であること。

---

## 参照資料

| 参照資料                         | パス                                                                                                    | 内容                         |
| -------------------------------- | ------------------------------------------------------------------------------------------------------- | ---------------------------- |
| Phase 5 実装サマリー             | `docs/30-workflows/TASK-REFACTOR-SHARED-SOURCE-STRUCTURE-001/outputs/phase-5/implementation-summary.md` | 移行実装の基準状態           |
| Phase 8 リファクタリングレポート | `docs/30-workflows/TASK-REFACTOR-SHARED-SOURCE-STRUCTURE-001/outputs/phase-8/refactoring-report.md`     | リファクタリング実施結果     |
| package.json                     | `packages/shared/package.json`                                                                          | exports/typesVersions 定義   |
| tsup.config.ts                   | `packages/shared/tsup.config.ts`                                                                        | ビルドエントリーポイント定義 |
| tsconfig.json                    | `packages/shared/tsconfig.json`                                                                         | TypeScript コンパイル設定    |
| vitest.config.ts                 | `apps/desktop/vitest.config.ts`                                                                         | テスト時パス解決定義         |

### システム仕様（aiworkflow-requirements）

| 参照資料           | パス                                                                          | 内容               |
| ------------------ | ----------------------------------------------------------------------------- | ------------------ |
| アーキテクチャ概要 | `.claude/skills/aiworkflow-requirements/references/architecture-overview.md`  | モノレポ構造の正本 |
| 開発ガイドライン   | `.claude/skills/aiworkflow-requirements/references/development-guidelines.md` | 品質基準の正本     |

---

## 統合テスト連携

本 Phase のテスト実行では、以下の統合テスト観点を含む:

| 統合テスト観点                          | 確認方法                                      |
| --------------------------------------- | --------------------------------------------- |
| shared → desktop の型参照が正常         | `pnpm --filter @repo/desktop typecheck`       |
| shared → desktop のランタイム参照が正常 | `pnpm --filter @repo/desktop exec vitest run` |
| shared 単体のビルド成果物が正常         | `pnpm --filter @repo/shared build`            |
| 公開パスの解決が正常                    | 旧パス残存チェック（タスク5）                 |

---

## 成果物

| 成果物       | パス                                                                                                  | 内容                                 |
| ------------ | ----------------------------------------------------------------------------------------------------- | ------------------------------------ |
| 品質検証結果 | `docs/30-workflows/TASK-REFACTOR-SHARED-SOURCE-STRUCTURE-001/outputs/phase-9/quality-verification.md` | Lint・型チェック・テスト・ビルド結果 |

---

## 完了条件

- [ ] `pnpm lint` がエラー 0 件で完了していること
- [ ] `pnpm --filter @repo/shared typecheck` がエラー 0 件で完了していること
- [ ] `pnpm --filter @repo/desktop typecheck` がエラー 0 件で完了していること
- [ ] `pnpm --filter @repo/shared test:run` が全テスト PASS していること
- [ ] `pnpm --filter @repo/desktop exec vitest run` が全テスト PASS していること（P40 対策で desktop ディレクトリから実行）
- [ ] `pnpm --filter @repo/shared build` が成功していること
- [ ] `dist/types/` ディレクトリが存在しないこと（旧パス不在）
- [ ] `dist/src/types/` ディレクトリが存在し、移行対象ファイルのビルド成果物が含まれていること
- [ ] `package.json` に旧パス（`dist/types/` で `src` を含まない）が 0 件であること
- [ ] `tsup.config.ts` に旧パス（`types/` で `src` を含まない）が 0 件であること
- [ ] `tsconfig.json` の include に `types/**/*.ts` が含まれていないこと
- [ ] 品質検証結果（`outputs/phase-9/quality-verification.md`）が作成されていること

## Phase末端アクション【必須】

- [ ] `artifacts.json` の Phase 9 ステータスを更新
- [ ] 品質検証結果の全セクションが記入済みであることを確認
- [ ] Phase 10 の前提条件が満たされていることを確認

---

## 依存関係

- **前提**: Phase 8（リファクタリング）が完了していること
- **後続**: Phase 10（最終レビュー）で多角的品質・整合性の最終検証を実施

## 次のPhase

完了後、以下を実行:

```
docs/30-workflows/TASK-REFACTOR-SHARED-SOURCE-STRUCTURE-001/phase-10-final-review.md
```
