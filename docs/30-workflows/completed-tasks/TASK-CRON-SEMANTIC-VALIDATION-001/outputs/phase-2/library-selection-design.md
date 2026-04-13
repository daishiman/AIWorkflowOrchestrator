# 実装方式設計（ライブラリ選定設計）

## メタ情報

| 項目     | 内容                              |
| -------- | --------------------------------- |
| Phase    | 2                                 |
| タスクID | TASK-CRON-SEMANTIC-VALIDATION-001 |
| 作成日   | 2026-04-12                        |

---

## 採用方針

**純 TypeScript の手動実装**（外部ライブラリ追加なし）

---

## 選定根拠

| 観点           | 純TS手動実装                        | cron-parser 等のライブラリ利用             |
| -------------- | ----------------------------------- | ------------------------------------------ |
| ブラウザ対応   | ✅ 完全対応（純粋な同期演算）       | ⚠️ Node.js 向けが多く、Renderer 動作要確認 |
| バンドルサイズ | ✅ 増加ゼロ                         | ❌ 数KB〜数十KBの増加                      |
| 依存関係       | ✅ 追加なし                         | ❌ package.json への追加が必要             |
| 実装コスト     | ✅ 低（月末日テーブルのみ）         | ⚠️ API 調査・ラッパー実装が必要            |
| 将来の保守性   | ✅ ロジックが自前で明確             | ⚠️ ライブラリのメジャーアップデートリスク  |
| 対応スコープ   | ⚠️ 単純数値のみ（複合式はスキップ） | ✅ 複合式・次回実行日計算も対応可能        |

---

## 実装概要

```typescript
const MAX_DAYS_PER_MONTH: Record<number, number> = {
  1: 31,
  2: 29,
  3: 31,
  4: 30,
  5: 31,
  6: 30,
  7: 31,
  8: 31,
  9: 30,
  10: 31,
  11: 30,
  12: 31,
};

function validateCronSemantics(fields: string[]): string | null {
  const dayField = fields[2];
  const monthField = fields[3];
  const weekdayField = fields[4];

  // 単純数値 + weekday が "*" の場合のみ意味論チェックを実行
  if (
    !/^\d+$/.test(dayField) ||
    !/^\d+$/.test(monthField) ||
    weekdayField !== "*"
  ) {
    return null;
  }

  const day = Number(dayField);
  const month = Number(monthField);
  const maxDays = MAX_DAYS_PER_MONTH[month];
  if (!maxDays || day > maxDays) {
    return "指定した日付は存在しません（例: 2月31日）";
  }

  return null;
}
```

---

## スコープ外の判断

複合フィールド（`1,15`・`1-15`・`*/5` など）の意味論チェックはスコープ外とする。

理由:

1. パターンが多様で実装コストが高い
2. 値域チェック（Stage 2）で範囲外の数値は既に弾かれる
3. ユーザーが複合指定を使う場合は意図的な高度な指定と見なせる
