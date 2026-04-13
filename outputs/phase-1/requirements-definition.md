# Phase 1: 要件定義書

## タスクID: TASK-CRON-CONVERTER-WEEKDAYS-GUARD-001

## 機能要件 (FR)

### FR-01: weekdays=[] ガード処理

| 項目             | 内容                                                      |
| ---------------- | --------------------------------------------------------- |
| 対象関数         | `visualConfigToCron()` in `cronConverter.ts`              |
| トリガー条件     | `frequency === "weekly"` かつ `weekdays` が空配列（`[]`） |
| 期待動作         | `InvalidConfigError` をスローする                         |
| エラーメッセージ | `"weekdays must not be empty when frequency is 'weekly'"` |

### FR-02: 正常系維持

| 入力                        | 期待出力                  |
| --------------------------- | ------------------------- |
| `weekdays: [0]`             | `"0 9 * * 0"`             |
| `weekdays: [1,2,3,4,5]`     | `"0 9 * * 1,2,3,4,5"`     |
| `weekdays: [0,1,2,3,4,5,6]` | `"0 9 * * 0,1,2,3,4,5,6"` |

### FR-03: JSDoc 更新

`visualConfigToCron()` に `@throws {InvalidConfigError}` を追加する。

## 非機能要件 (NFR)

- NFR-01: `cronConverter.ts` 自身がガード責任を持つ（SRP）
- NFR-02: 純粋関数として実装し単体テスト容易性を維持する

## 受け入れ基準 (AC)

- AC-01: `weekdays: []` を渡した場合に `InvalidConfigError` がスローされること
- AC-02: `weekdays: [0]` を渡した場合に `"0 9 * * 0"` が返ること
- AC-03: `weekdays: [1,2,3,4,5]` を渡した場合に `"0 9 * * 1,2,3,4,5"` が返ること
- AC-04: `weekdays: [0,1,2,3,4,5,6]` を渡した場合に `"0 9 * * 0,1,2,3,4,5,6"` が返ること
- AC-05: `InvalidConfigError` に適切なエラーメッセージが含まれること
- AC-06: JSDoc に `@throws InvalidConfigError` の記述が追加されること

## P50チェック調査結果

- `cronConverter.ts` の `"weekly"` ケースは `sorted.join(",")` を使用しており、空配列の場合に `"0 9 * * "` が生成される（5フィールド構文違反）
- `InvalidConfigError` は既存コードに存在しない → 新規定義が必要
- UI バリデーション（VisualCronPicker）は実装済みだが `cronConverter.ts` 側にガードなし
