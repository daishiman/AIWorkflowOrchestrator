# Phase 7: カバレッジ確認 — 成果物

## メタ情報

| 項目       | 値                                      |
| ---------- | --------------------------------------- |
| Phase      | 7                                       |
| 機能名     | step-ut-rt-06-esbuild-arch-mismatch-001 |
| 作成日     | 2026-03-29                              |
| ステータス | 完了                                    |

## Step 1: coverage 実行

```bash
pnpm --filter @repo/desktop exec -- npx vitest run --coverage \
  src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.sdk-normalization.test.ts
```

### 結果

- テスト自体: **27 passed** (全 PASS)
- Coverage threshold: グローバル閾値（80%）未達（0.17% lines）
- Exit code: 1（閾値違反による）

### 解釈

この Phase の目的は coverage 値を上げることではなく、環境修正後に **coverage 実行経路まで回復した** ことを確認することにある。target test は全 PASS し、vitest + esbuild の観測経路は正常化している。グローバル閾値未達は、単一テストファイルでの coverage 実行では desktop パッケージ全体の閾値を満たせないことが原因であり、本タスクの範囲外。

## Step 2: AC 証跡整理

| AC    | 観点                                      | 証跡                                                                   | 判定 |
| ----- | ----------------------------------------- | ---------------------------------------------------------------------- | ---- |
| AC-01 | 対象テストの pass                         | 27 passed, exit 0                                                      | PASS |
| AC-02 | runtime と optional dependency の整合     | darwin-arm64 が 4 バージョン存在                                       | PASS |
| AC-03 | mismatch 系エラーの不在                   | テスト出力に mismatch なし                                             | PASS |
| AC-04 | docs 存在                                 | `docs/40-guides/esbuild-arch-mismatch-prevention.md` あり              | PASS |
| AC-05 | docs に exact command と checklist がある | `process.arch`(7箇所), `pnpm install --force`(4箇所), Preflight(1箇所) | PASS |

## Step 3: 解釈

coverage 実行により `vitest + esbuild` の観測経路まで正常化したことを確認した。環境修正タスクとして必要な AC は全て満たされている。

## 完了条件

- [x] coverage 実行結果を記録した
- [x] AC-01〜AC-05 の証跡を整理した
- [x] coverage の解釈を明記した
- [x] 本Phase内の全タスクを100%実行完了
