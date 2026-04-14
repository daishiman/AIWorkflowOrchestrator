# 影響範囲分析書 - TASK-UI-SCHEDULE-CRON-MONTHLY-GUARD-001

## `visualConfigToCron` 呼び出し箇所

| ファイル               | 行  | 用途                                              |
| ---------------------- | --- | ------------------------------------------------- |
| `VisualCronPicker.tsx` | 82  | `const cron = visualConfigToCron(config);`        |
| `VisualCronPicker.tsx` | 124 | `const currentCron = visualConfigToCron(config);` |
| `VisualCronPicker.tsx` | 145 | `setDirectInput(visualConfigToCron(config));`     |
| `VisualCronPicker.tsx` | 153 | `setDirectInput(visualConfigToCron(parsed));`     |
| `VisualCronPicker.tsx` | 175 | `visualConfigToCron(config);`                     |

---

## 影響分析

### 正常ケース（dayOfMonth=1〜31 の整数）

- ガード条件が `false` になるため既存ロジックを通る
- **影響なし** ✅

### 異常ケース（dayOfMonth=0, 32, -1 など）

- 現在: 不正な cron 式（例: `"0 9 0 * *"`）を返す
- 変更後: 空文字 `""` を返す
- 呼び出し元の `VisualCronPicker.tsx` は既存のバリデーションで空文字を無効入力として扱うため、**UI 動作は変わらない**（不正入力はバリデーションで弾かれる）

### スコープ外ファイルへの影響

- `weekly` 分岐: 変更なし
- `every-minute`, `every-hour`, `daily`, `custom` 分岐: 変更なし
- `visualCronConfig.ts` 型定義: 変更なし

---

## 結論

本変更は `monthly` 分岐の早期リターン追加のみであり、副作用は発生しない。
