# Phase 7 成果物: カバレッジゲート結果

## 判定

PASS

## task scope 集計

| 指標       | 実測             | 閾値 | 判定 |
| ---------- | ---------------- | ---- | ---- |
| Statements | 98.79% (490/496) | 80%  | PASS |
| Branches   | 90.16% (55/61)   | 60%  | PASS |
| Functions  | 94.44% (17/18)   | 80%  | PASS |
| Lines      | 98.79% (490/496) | 80%  | PASS |

## ファイル別抜粋

| ファイル                         | Lines   | Branches | Functions |
| -------------------------------- | ------- | -------- | --------- |
| `DashboardView/index.tsx`        | 100.00% | 92.30%   | 75.00%    |
| `components/dashboardContent.ts` | 96.87%  | 87.80%   | 100.00%   |
| `components/*.tsx`               | 100.00% | 100.00%  | 100.00%   |

## コメント

- `DashboardView/index.tsx` の function coverage は 75% だが、task scope 全体では 94.44% を満たしている。
- helper 分離により branch coverage を 90% 超まで引き上げた。
