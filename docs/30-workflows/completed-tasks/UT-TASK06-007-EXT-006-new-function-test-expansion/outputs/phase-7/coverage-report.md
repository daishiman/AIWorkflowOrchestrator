# カバレッジレポート - UT-TASK06-007-EXT-006

## 計測日時

2026-03-21 08:21

## 計測コマンド

```bash
cd apps/desktop && pnpm vitest run scripts/__tests__/check-ipc-contracts.test.ts --coverage --coverage.include='scripts/check-ipc-contracts.ts'
```

## 計測結果

| 指標               | 計測値 | 基準 | 判定 |
| ------------------ | ------ | ---- | ---- |
| Line Coverage      | 95.79% | 95%  | PASS |
| Branch Coverage    | 91.55% | 70%  | PASS |
| Function Coverage  | 100%   | 90%  | PASS |
| Statement Coverage | 95.79% | -    | PASS |

## テスト件数

| 種別       | 件数 |
| ---------- | ---- |
| 既存テスト | 49   |
| 新規テスト | 20   |
| 合計       | 69   |

## 未カバー行

- L564-569: `process.exitCode = 1` のエラーパス（`strict` モード + warnings 分岐の一部）
- L576-584: `isDirectRun` による直接実行ガード部分（テスト環境では実行されない）

これらは以下の理由でカバーされていない:

1. L564-569: `strict` モードのwarningパスは T-7d で既にカバー済みだが、v8プロバイダのインライン関数カウント（P41）の影響
2. L576-584: スクリプト直接実行時の `try-catch` ガードで、テストimportでは通過しない設計

## 判定

PASS - 全基準を充足。Phase 8（リファクタリング）に進む。
