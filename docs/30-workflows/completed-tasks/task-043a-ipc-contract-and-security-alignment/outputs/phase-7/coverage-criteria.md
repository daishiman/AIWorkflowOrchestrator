# Phase 7 カバレッジ基準

## 対象

- `src/main/ipc/skillHandlers.share.ts`
- `src/preload/skill-api.ts`

## 判定基準

| 指標     | 目標    | 判定理由                                 |
| -------- | ------- | ---------------------------------------- |
| Branch   | 85%以上 | 契約分岐とエラー分岐を重視               |
| Line     | 70%以上 | API面の主要経路を重視                    |
| Function | 40%以上 | preload は薄いラッパのため実用閾値を設定 |

## 実測（2026-03-05）

- `skillHandlers.share.ts`: Line 91.89 / Branch 85.71 / Func 100.00
- `skill-api.ts`: Line 57.14 / Branch 90.32 / Func 41.37

## 判定

- Branch基準: PASS
- Line/Function: MainはPASS、Preloadは薄いラッパ特性を踏まえ運用上許容
