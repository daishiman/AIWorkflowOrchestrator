# Phase 12: 実装ガイド - TASK-UI-SCHEDULE-CRON-WEEKDAYS-GUARD-001

## メタ情報

| 項目    | 内容                                      |
| ------- | ----------------------------------------- |
| Task ID | TASK-UI-SCHEDULE-CRON-WEEKDAYS-GUARD-001  |
| 作成日  | 2026-04-12                                |
| 対象    | `cronConverter.ts` の weekly 空曜日ガード |
| 状態    | completed                                 |

---

## Part 1: 中学生向け説明

### 何を直したのか

スケジュール画面では「毎週、月・水・金に動く」のような設定を cron という命令文に変える。  
そのとき曜日が 1 つも選ばれていないのに、命令文だけを無理に作ると、空っぽの材料で料理名だけ書いたメモのように壊れたものになる。

### なぜ必要か

- 変な命令文を返すと、あとで使う側が困る
- 画面側のチェックだけに頼ると、別の呼び出し方で抜けることがある
- 変換する場所で止めると、壊れた値が広がらない

### 何をするか

- 曜日が空の weekly 設定を見つける
- その場で空文字を返す
- 無理に cron 文を作らない

### たとえ話

曜日は弁当のおかずみたいなもの。  
おかずが 1 つも入っていないのに「月・水・金の弁当」とラベルだけ貼ると、中身と札が合わない。  
この修正は、札を貼る前に中身を確認して、空なら空のまま返す動きに近い。

---

## Part 2: 開発者向け説明

### current contract

```ts
export type FrequencyType =
  | "every-minute"
  | "every-hour"
  | "daily"
  | "weekly"
  | "monthly"
  | "custom";

export type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export interface VisualCronConfig {
  frequency: FrequencyType;
  hour: number;
  minute: number;
  weekdays: Weekday[];
  dayOfMonth: number;
  rawCronExpression?: string;
}

export function visualConfigToCron(config: VisualCronConfig): string;
```

### 実装ポイント

| 項目   | 内容                                                                 |
| ------ | -------------------------------------------------------------------- |
| 対象   | `apps/desktop/src/renderer/utils/cronConverter.ts`                   |
| ガード | `frequency === "weekly"` かつ `weekdays.length === 0` で `""` を返す |
| 正常系 | `weekdays` は重複除去と昇順ソートの後に join する                    |
| JSDoc  | 空曜日時の返り値と意図を `@returns` / `@remarks` に記載する          |

### 使用例

```ts
visualConfigToCron({
  frequency: "weekly",
  hour: 9,
  minute: 0,
  weekdays: [1, 3, 5],
  dayOfMonth: 1,
});
// "0 9 * * 1,3,5"

visualConfigToCron({
  frequency: "weekly",
  hour: 9,
  minute: 0,
  weekdays: [],
  dayOfMonth: 1,
});
// ""
```

### エラーとエッジケース

- `weekdays` が空の weekly 設定は空文字になる
- `weekdays` に重複や順不同があっても、weekly の cron は正規化される
- `custom` で `rawCronExpression` が空なら空文字になる
- `monthly` は `dayOfMonth` をそのまま使う
- この関数は例外を投げず、入力に応じて文字列を返す

### 設定可能なパラメータと定数

| 名前                | 種別            | 役割                    |
| ------------------- | --------------- | ----------------------- |
| `frequency`         | `FrequencyType` | 変換分岐を決める        |
| `hour`              | number          | 時刻の時を決める        |
| `minute`            | number          | 時刻の分を決める        |
| `weekdays`          | `Weekday[]`     | weekly の曜日を決める   |
| `dayOfMonth`        | number          | monthly の日付を決める  |
| `rawCronExpression` | string          | custom の生 cron を渡す |

### 検証メモ

- weekly 空曜日ガードは source review で確認済み
- edge test に空曜日ケースが存在する
- runtime vitest はこの workspace で esbuild mismatch により停止した

### まとめ

weekly 空曜日の変換は、壊れた cron 文を返さないための最小ガードとして機能している。  
JSDoc と test file の両方で意図が追えるため、呼び出し側の読み違いが起きにくい。
