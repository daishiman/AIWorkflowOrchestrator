# Phase 9: 品質検証 - タスク仕様書

## メタ情報

| 項目       | 内容                            |
| ---------- | ------------------------------- |
| タスクID   | TASK-FIX-SAFEINVOKE-TIMEOUT-001 |
| Phase      | 9                               |
| Phase名    | 品質検証                        |
| カテゴリ   | fix                             |
| ステータス | pending                         |
| 前提Phase  | Phase 8                         |
| 後続Phase  | Phase 10                        |

## 目的

Lint・TypeScript 型チェック・全テスト実行により、実装の品質を総合的に検証する。

## 実行タスク

### タスク1: ESLint 実行

**目的**: コードスタイルとベストプラクティスの遵守を検証する

**手順**:

1. `cd apps/desktop && pnpm lint`
2. エラー/警告がないことを確認
3. エラーがある場合は修正

### タスク2: TypeScript 型チェック

**目的**: 型安全性を検証する

**手順**:

1. `cd apps/desktop && pnpm typecheck`
2. 型エラーがないことを確認
3. 特に `Promise.race` の型推論が正しいことを確認（`Promise<T>` が維持されている）

### タスク3: 全テスト実行

**目的**: 全テストが PASS することを確認する

**手順**:

1. `cd apps/desktop && pnpm vitest run`
2. 全テスト PASS を確認
3. 失敗テストがある場合は原因調査・修正

### タスク4: Shared パッケージとの整合確認

**目的**: モノレポ全体での整合性を確認する

**手順**:

1. `pnpm --filter @repo/shared build` で shared パッケージのビルド
2. `pnpm typecheck` でモノレポ全体の型チェック

## 参照資料

| 参照資料                 | パス                                                                       |
| ------------------------ | -------------------------------------------------------------------------- |
| Phase 8 リファクタリング | `docs/30-workflows/TASK-FIX-SAFEINVOKE-TIMEOUT-001/phase-8-refactoring.md` |
| コード品質ルール         | `.claude/rules/02-code-quality.md`                                         |
| Git ツーリング           | `.claude/rules/07-git-and-tooling.md`                                      |

## 統合テスト連携

- 全テスト PASS が Phase 10（最終レビュー）の前提条件
- テスト失敗時は Phase 5 または Phase 6 に戻って修正

## 成果物

| 成果物       | パス                                 |
| ------------ | ------------------------------------ |
| 品質検証結果 | `outputs/phase-9/quality-report.txt` |

## 完了条件

- [ ] ESLint が PASS（エラー 0）
- [ ] TypeScript 型チェックが PASS
- [ ] 全テストが PASS
- [ ] モノレポ全体の整合確認
- [ ] 本Phase内の全タスクを100%実行完了

## 次Phase

Phase 10: 最終レビューへ進む。多角的な品質・整合性検証を行う。
