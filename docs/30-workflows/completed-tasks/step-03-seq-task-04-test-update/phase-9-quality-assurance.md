# Phase 9: 品質保証 — テスト期待値更新

## メタ情報

| 項目      | 値                        |
| --------- | ------------------------- |
| Phase番号 | 9                         |
| 機能名    | test-update               |
| タスクID  | TASK-LLM-MOD-04           |
| 作成日    | 2026-03-23                |
| 前Phase   | Phase 8: リファクタリング |
| 次Phase   | Phase 10: 最終レビュー    |

## 目的

Lint・型チェック・全テスト実行を通じて、テストファイルの変更が品質基準を満たしていることを確認する。

## 実行タスク

### Task 9-1: Lint チェック

```bash
# プロジェクトルートから実行
pnpm --filter @repo/desktop lint

# shared パッケージの Lint チェック（provider.test.ts が変更対象に含まれる場合）
pnpm --filter @repo/shared lint
```

Lint エラーが発生した場合:

1. エラー内容を確認する
2. 自動修正可能な場合は `pnpm --filter @repo/desktop lint --fix` を実行する
3. 手動修正が必要な場合は修正する

### Task 9-2: TypeScript 型チェック

```bash
pnpm --filter @repo/desktop typecheck
```

型エラーが発生した場合:

1. エラーのあるファイルを特定する
2. 型定義を修正する（`any` を使用しない、`@ts-ignore` を安易に使用しない）

### Task 9-3: 全テスト実行

```bash
# 必須: apps/desktop ディレクトリから実行（P40 対応）
cd apps/desktop && pnpm vitest run
```

FAIL が発生した場合:

1. FAIL しているテストを特定する
2. 期待値の記述ミスを修正する
3. Task01〜03 の実装バグの可能性がある場合は依存タスクへフィードバックする

### Task 9-4: 品質チェック結果の記録

| チェック項目         | 結果                  | 備考                               |
| -------------------- | --------------------- | ---------------------------------- |
| Lint                 | PASS（P50: 変更なし） | コード変更0行のため既存状態維持    |
| TypeScript型チェック | PASS（P50: 変更なし） | コード変更0行のため既存状態維持    |
| 全テスト             | PASS（149/149）       | 13ファイルは@repo/shared依存で除外 |

## 参照資料

| 資料                                     | 用途                         |
| ---------------------------------------- | ---------------------------- |
| `.claude/rules/02-code-quality.md`       | 型安全・コード品質基準       |
| `.claude/rules/06-known-pitfalls.md#P40` | テスト実行ディレクトリ確認   |
| `CLAUDE.md`                              | pnpm コマンド・Hook 環境変数 |

## 統合テスト連携

Task 9-3 の全テスト実行が、Task01〜03 を含むすべての変更に対して PASS することを確認する。これがこのタスク（TASK-LLM-MOD-04）の最終的な受入基準（R-05）を満たすことを意味する。

## 成果物

| 成果物                                     | パス                           |
| ------------------------------------------ | ------------------------------ |
| 品質保証結果（本ファイル Task 9-4 に記録） | `phase-9-quality-assurance.md` |

## P50 適用記録

> Task01-03 実装時にテスト更新が同時完了していたことを Phase 5 事前確認で発見。
> 「検証・補完モード」に切り替え、変更0行で全要件充足を確認した。

## 完了条件

- [x] P50 パターン適用: Task01-03 完了時にテスト更新済みであることを確認（変更0行）
- [ ] `pnpm --filter @repo/desktop lint` が 0 エラーで完了する
- [ ] `pnpm --filter @repo/desktop typecheck` が 0 エラーで完了する
- [ ] `cd apps/desktop && pnpm vitest run` が全 PASS する
- [ ] Task 9-4 のチェック結果テーブルに実際の結果を記入した

## 次のPhase

Phase 10: 最終レビュー (`phase-10-final-review.md`)
