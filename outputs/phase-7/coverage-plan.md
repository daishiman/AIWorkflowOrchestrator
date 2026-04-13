# Phase 7: カバレッジ計画

## 対象

`apps/desktop/src/renderer/utils/cronConverter.ts`

## カバレッジ分析

| コードパス                           | テストカバー | 対応テスト                   |
| ------------------------------------ | ------------ | ---------------------------- |
| `InvalidConfigError` コンストラクタ  | ✅           | InvalidConfigError describe  |
| `case "every-minute"`                | ✅           | 回帰テスト                   |
| `case "every-hour"`                  | ✅           | 回帰テスト                   |
| `case "daily"`                       | ✅           | 回帰テスト                   |
| `case "weekly"` - weekdays=[] ガード | ✅           | AC-01, AC-05                 |
| `case "weekly"` - 正常変換           | ✅           | AC-02, AC-03, AC-04          |
| `case "monthly"`                     | ✅           | 回帰テスト                   |
| `case "custom"`                      | ❌           | 対象外（本タスクスコープ外） |
| `default`                            | ❌           | 対象外（本タスクスコープ外） |

## 未到達パス（本タスクスコープ外）

- `case "custom"`: 既存機能、本タスクの変更対象外
- `default`: 既存機能、本タスクの変更対象外

## 判定

本タスクの変更対象である `case "weekly"` の全パスがカバーされている。✅
