# P50チェック結果（既実装コード調査）

## メタ情報

| 項目     | 内容                              |
| -------- | --------------------------------- |
| Phase    | 1                                 |
| タスクID | TASK-CRON-SEMANTIC-VALIDATION-001 |
| 調査日   | 2026-04-12                        |

---

## 調査対象ファイル

| ファイル                                                                | 行数 | 状態   |
| ----------------------------------------------------------------------- | ---- | ------ |
| `apps/desktop/src/renderer/utils/scheduleConfigValidator.ts`            | 117  | 調査済 |
| `apps/desktop/src/__tests__/utils/scheduleConfigValidator.test.ts`      | 108  | 調査済 |
| `apps/desktop/src/__tests__/utils/scheduleConfigValidator.edge.test.ts` | 52   | 調査済 |

---

## 現行 `validateCronExpression` の動作

### 実装内容

```
validateCronExpression(value: string): string | null
  Stage 1: 空文字チェック → "cron式を入力してください"
  Stage 2: 5フィールドチェック → "cron式は5フィールド必要です（現在: Nフィールド）"
  Stage 3: 値域チェック（FIELD_RANGES 使用）→ "cron式の形式が正しくありません"
  → 全チェック通過なら null を返す
```

### FIELD_RANGES の定義

| フィールド | min | max |
| ---------- | --- | --- |
| 分         | 0   | 59  |
| 時         | 0   | 23  |
| 日         | 1   | 31  |
| 月         | 1   | 12  |
| 曜日       | 0   | 7   |

### 問題の確認

`0 9 31 2 *` を現行バリデーションで検証した場合:

- Stage 1: "0 9 31 2 \*".trim() → 空文字でない ✓
- Stage 2: 5フィールド分割 → ["0", "9", "31", "2", "*"] → 5フィールド ✓
- Stage 3: 各フィールドの値域チェック
  - 分 "0": 0〜59 ✓
  - 時 "9": 0〜23 ✓
  - 日 "31": 1〜31 ✓（範囲内なのでパス）
  - 月 "2": 1〜12 ✓
  - 曜日 "\*": ワイルドカード ✓
- **結果: null を返す（誤り）**

### 意味論チェックの欠如

現行実装のコメント（行4）に `semantic validation（next-run 計算など）は行わない` と明記されているため、これは既知の設計上の制限であり、本タスクで対処する。

---

## 既存テストの状態

### `scheduleConfigValidator.test.ts`

- SCV-11: `"semantic validationは行わない（月次指定はnull）"` というテストケースが存在
- このテストは意味論チェック追加後も変更不要（`"0 9 1 * *"` は実在する日付）

補足: SCV-11 のテスト名は Phase 12 で `weekday 指定時は意味論チェックをスキップする` に更新済み。

### `scheduleConfigValidator.edge.test.ts`

- 既存のエッジケースは構文・値域チェックのみを対象としている
- 意味論チェック用の TC-EDGE / TC-LEAP / TC-COMP / TC-REG は Phase 6 で追加する

---

## 結論

1. 現行実装は `0 9 31 2 *` を正常として通過させる（問題再現確認）
2. 意味論チェックは純 TypeScript で安全に追加可能
3. 既存テストへの影響は最小（SCV-11 は依然として有効）
