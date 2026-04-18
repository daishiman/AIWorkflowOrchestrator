# Phase 7 カバレッジレポート - TASK-SW-CANCEL-001

## メタ情報

| 項目     | 内容               |
| -------- | ------------------ |
| タスクID | TASK-SW-CANCEL-001 |
| Phase    | 7                  |
| 作成日   | 2026-04-16         |

## カバレッジ計測結果

対象ファイル: `packages/shared/src/ipc/channels.ts`

| 指標               | 達成値 | 最低基準 | 推奨基準 | 判定     |
| ------------------ | ------ | -------- | -------- | -------- |
| Line Coverage      | 100%   | 80%      | 90%      | **PASS** |
| Branch Coverage    | 100%   | 60%      | 70%      | **PASS** |
| Function Coverage  | 100%   | 80%      | 90%      | **PASS** |
| Statement Coverage | 100%   | -        | -        | **PASS** |

## 計測コマンド

```bash
npx vitest run packages/shared/src/ipc/__tests__/ --coverage
```

## 未到達コード分析

未到達行なし。`channels.ts` は定数定義のみのファイルであり、インポート時に全行が評価される。

## ゲート判定

カバレッジゲート: **PASS**（全指標で推奨基準を超過）

Phase 8 へ進む。
