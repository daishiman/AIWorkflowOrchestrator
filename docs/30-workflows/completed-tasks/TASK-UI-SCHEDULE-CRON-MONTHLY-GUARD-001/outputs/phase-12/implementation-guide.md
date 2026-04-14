# 実装ガイド - TASK-UI-SCHEDULE-CRON-MONTHLY-GUARD-001

---

## Part 1: 中学生レベルの概念説明

### なぜこの修正が必要だったか

コンピュータのスケジュール設定には「cron 式」という形式が使われています。
たとえば「毎月1日の午前9時に実行する」は `0 9 1 * *` と書きます。

ここで問題がありました。「毎月〇日」の「〇」の部分（`dayOfMonth`）に、
**0 や 32 など存在しない日付を入れても、そのまま不正な cron 式が作られてしまっていた**のです。

日常生活で例えると、郵便番号の入力フォームで「999999」と入力しても
そのまま受け付けてしまう状態です。

### 何をしたか

「もし日付が 1〜31 の整数でなければ、空文字を返して処理を止める」という
**入口での見張り（ガード処理）** を1か所追加しました。

この見張りは同じファイルの「毎週〇曜日」設定（`weekly`）にはすでに存在していました。
今回は「毎月〇日」設定（`monthly`）にも同じパターンで追加したことで、
**コードの対称性**が保たれるようになりました。

---

## Part 2: 技術的詳細

### 変更ファイル

| ファイル                                                      | 変更内容                                   |
| ------------------------------------------------------------- | ------------------------------------------ |
| `apps/desktop/src/renderer/utils/cronConverter.ts`            | `monthly` 分岐にガード処理追加・JSDoc 更新 |
| `apps/desktop/src/__tests__/utils/cronConverter.edge.test.ts` | TC-11〜TC-19 追加                          |

### 実装コード

```typescript
// 変更前
case "monthly":
  return `${minute} ${hour} ${dayOfMonth} * *`;

// 変更後
case "monthly": {
  if (!Number.isInteger(dayOfMonth) || dayOfMonth < 1 || dayOfMonth > 31) {
    return "";
  }
  return `${minute} ${hour} ${dayOfMonth} * *`;
}
```

### `Number.isInteger()` を使う理由

TypeScript の `number` 型は `NaN`・`Infinity`・小数を含む。
`Number.isInteger(NaN)` → `false`、`Number.isInteger(1.5)` → `false` であるため、
範囲比較（`< 1 || > 31`）の前に整数性チェックを置くことで、1つの条件式で全ての不正値を弾ける。

**注意**: `NaN < 1` は `false`、`NaN > 31` は `false` であるため、
整数性チェックなしでは `NaN` が漏れる（`case "monthly"` の正常パスに到達してしまう）。

### `weekly` との対称パターン

```typescript
// weekly（既実装）
case "weekly": {
  if ((weekdays ?? []).length === 0) { return ""; }
  // ...
}

// monthly（今回追加）
case "monthly": {
  if (!Number.isInteger(dayOfMonth) || dayOfMonth < 1 || dayOfMonth > 31) { return ""; }
  // ...
}
```

ブロック構文 `{}` + 早期リターン `return ""` パターンで対称性を維持。

### 追加の安全策: 逆変換側の monthly 誤分類防止

今回のレビューでは、`visualConfigToCron` の防御だけでは不十分な経路も確認した。
`cronParser.ts` でも monthly の `dayOfMonth` が 1〜31 の範囲外なら `custom` にフォールバックするよう補強し、
`cronToHumanReadable` と `VisualCronPicker` の初期化が不正な monthly 値を誤って表示しないようにした。
これにより、生成側と解釈側の両方で境界条件を閉じている。

### API シグネチャ

```typescript
export function visualConfigToCron(config: VisualCronConfig): string;
```

- 入力: `VisualCronConfig`（`frequency="monthly"`, `dayOfMonth: number` を含む）
- 出力: cron 式文字列。不正な `dayOfMonth` の場合は `""` を返す
- 例外: 投げない（呼び出し元バリデーションに委ねる設計）

### TDD サイクル（Red → Green）

1. **Red**: TC-11〜TC-13 を先に書き、失敗を確認（`"0 9 0 * *"` が返されることを確認）
2. **Green**: ガード処理1行追加で全テスト Pass
3. **Refactor**: リファクタリング不要と判定（設計通り実装済みのため）

### Evidence

- `outputs/phase-11/manual-test-result.md`
- スクリーンショット: なし（NON_VISUAL）
