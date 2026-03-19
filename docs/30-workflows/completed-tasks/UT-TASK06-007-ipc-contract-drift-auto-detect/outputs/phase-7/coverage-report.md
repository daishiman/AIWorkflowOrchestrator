# Phase 7 カバレッジレポート

## タスクID: UT-TASK06-007

## 測定日: 2026-03-19

## 測定コマンド

```bash
pnpm --filter @repo/desktop exec vitest run scripts/__tests__/check-ipc-contracts.test.ts \
  --coverage.enabled \
  --coverage.reporter=json-summary \
  --coverage.reporter=text-summary \
  --coverage.include=scripts/check-ipc-contracts.ts
```

## 対象

- 対象ファイル: `apps/desktop/scripts/check-ipc-contracts.ts`
- テストファイル: `apps/desktop/scripts/__tests__/check-ipc-contracts.test.ts`
- 実行結果: 49 tests passed
- サマリー出力: `apps/desktop/coverage/coverage-summary.json`

## カバレッジ基準

| 指標               | 最低基準 | 推奨基準 | 実測値 | 詳細      | 判定 |
| ------------------ | -------- | -------- | ------ | --------- | ---- |
| Line Coverage      | 80%      | 90%      | 95.31% | 448 / 470 | PASS |
| Branch Coverage    | 60%      | 70%      | 90.84% | 139 / 153 | PASS |
| Function Coverage  | 80%      | 90%      | 100%   | 13 / 13   | PASS |
| Statement Coverage | 80%      | 90%      | 95.31% | 448 / 470 | PASS |

## 今回追加で効いた観点

- `safeInvoke<T>` / `safeOn<T>` の generic 呼び出し
- 複数行に分割された preload 呼び出し
- typed object 引数を受ける main handler の R-02 判定
- `IPC_CHANNELS.SKILL_IMPORT` / `CHANNELS.CHECK_INSTALLATION` など full-ref 解決
- R-04（定数定義済みだが main 未登録）の直接回帰

## 補足

- この値は対象スクリプト単体の再計測結果であり、アプリ全体のフルスイート集計ではない。
- 2026-03-19 の再監査でテスト数が 44 件から 49 件へ増えたため、旧カバレッジ値は廃止した。

## 判定

対象スクリプトは推奨基準を全て上回った。Phase 8 以降の成果物はこの実測値を正本として扱う。
