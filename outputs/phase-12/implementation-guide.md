# implementation-guide.md

## TASK-CRON-CONVERTER-WEEKDAYS-GUARD-001

---

## Part 1: 中学生向け説明

### cronConverter の weekdays=[] ガードとは？

cron 式は、「いつ動かすか」を文字で表す決まりごとです。たとえば `"0 9 * * 1,2,3,4,5"` は「月〜金曜の朝 9 時に動かす」という意味です。

今回の修正は、「毎週実行する設定なのに、曜日を 1 つも選んでいない」ケースを止めるものです。曜日が 0 個だと、アラームを鳴らす日が 1 日もないのと同じで、予定として成立しません。UI では先に防いでいても、`cronConverter.ts` 自体が自分で安全確認しないと、直接呼ばれたときに壊れた cron を返してしまいます。

修正後は、曜日が空ならその場でエラーを返し、壊れた式を作る前に問題を伝えます。

**専門用語の説明：**

| 用語                | 説明                                                            |
| ------------------- | --------------------------------------------------------------- |
| cron 式             | 定期実行スケジュールを表す文字列（`"0 9 * * 1"` = 毎週月曜9時） |
| ガード処理          | 不正な入力を早期に検出してエラーを投げる処理                    |
| 単一責任原則（SRP） | 1 つの関数・クラスは 1 つのことだけに責任を持つというルール     |
| InvalidConfigError  | 設定値が無効な場合に投げるカスタムエラークラス                  |

---

## Part 2: 技術者向け説明

### 変更ファイル

変更ファイル数: 2

| ファイル                                                          | 変更種別 | 変更内容                                            |
| ----------------------------------------------------------------- | -------- | --------------------------------------------------- |
| `apps/desktop/src/renderer/utils/cronConverter.ts`                | 修正     | InvalidConfigError 定義追加・ガード追加・JSDoc 更新 |
| `apps/desktop/src/renderer/utils/__tests__/cronConverter.test.ts` | 新規     | 16 テストケース追加                                 |

### 新規定義: InvalidConfigError

```typescript
export class InvalidConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidConfigError";
  }
}
```

### ガード処理（weekly ケース内）

```typescript
case "weekly": {
  if (weekdays.length === 0) {
    throw new InvalidConfigError(
      "weekdays must not be empty when frequency is 'weekly'",
    );
  }
  const sorted = [...new Set(weekdays)].sort((a, b) => a - b);
  return `${minute} ${hour} * * ${sorted.join(",")}`;
}
```

### JSDoc 追加

```typescript
/**
 * VisualCronConfig をクロン式文字列に変換する。
 * @param config - ビジュアル設定オブジェクト
 * @returns cron 式文字列
 * @throws {InvalidConfigError} frequency が "weekly" のとき weekdays が空配列の場合
 */
```

### テスト結果（全 AC 充足）

実行コマンド: `npx vitest run apps/desktop/src/renderer/utils/__tests__/cronConverter.test.ts`

| 入力                        | 期待結果                  | 結果 |
| --------------------------- | ------------------------- | ---- |
| `weekdays: []`              | `InvalidConfigError`      | ✅   |
| `weekdays: [0]`             | `"0 9 * * 0"`             | ✅   |
| `weekdays: [1,2,3,4,5]`     | `"0 9 * * 1,2,3,4,5"`     | ✅   |
| `weekdays: [0,1,2,3,4,5,6]` | `"0 9 * * 0,1,2,3,4,5,6"` | ✅   |

### エッジケース

| ケース                    | 期待動作                     |
| ------------------------- | ---------------------------- |
| `weekdays: [0, 0]` 重複値 | Set 正規化 → `"0 9 * * 0"`   |
| `weekdays: [6]` 単一値    | `"0 9 * * 6"` を維持         |
| `weekdays: [5,3,1]` 逆順  | ソート → `"0 9 * * 1,3,5"`   |
| `frequency !== "weekly"`  | ガード発動せず既存動作を維持 |

---

## 手動テスト結果

NON_VISUAL タスク。自動テスト 16/16 passed で確認済み。
