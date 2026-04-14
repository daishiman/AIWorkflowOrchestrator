# TASK-CRON-ALL-FREQUENCY-GUARD-001: cronConverter hour/minute 全周波数共通範囲ガード処理追加

## メタ情報

| 項目         | 内容                                                          |
| ------------ | ------------------------------------------------------------- |
| タスクID     | TASK-CRON-ALL-FREQUENCY-GUARD-001                             |
| タスク名     | cronConverter hour/minute 全周波数共通範囲ガード処理追加      |
| 分類         | バグ修正                                                      |
| 対象機能     | スケジュール設定 / cron式変換                                 |
| 優先度       | **低**                                                        |
| 見積もり規模 | 小規模                                                        |
| ステータス   | 未着手                                                        |
| 発見元       | TASK-UI-SCHEDULE-CRON-MONTHLY-GUARD-001 Phase 12 未タスク検出 |
| 発見日       | 2026-04-13                                                    |
| 依存タスク   | なし                                                          |
| 関連Issue    | #2127                                                         |

## 1. なぜこのタスクが必要か（Why）

### 1-1. 問題の背景

`cronConverter.ts` の全周波数分岐（`daily`・`weekly`・`monthly`）において、`hour`（有効範囲: 0-23）および `minute`（有効範囲: 0-59）に不正値が渡された場合でも、無効な cron 式が生成される。

現在の各分岐は以下の通りであり、いずれも `hour`・`minute` の入力値を検証しない:

```typescript
case "daily":
  return `${minute} ${hour} * * *`;

case "weekly": {
  // weekdays のガードのみ実装済み
  return `${minute} ${hour} * * ${sorted.join(",")}`;
}

case "monthly": {
  // dayOfMonth のガードのみ実装済み
  return `${minute} ${hour} ${dayOfMonth} * *`;
}
```

この実装では、以下のような不正な cron 式が生成される:

| 入力値       | 生成される cron 式 | 問題                         |
| ------------ | ------------------ | ---------------------------- |
| `hour=-1`    | `"0 -1 * * *"`     | 無効（負の値）               |
| `hour=24`    | `"0 24 * * *"`     | 無効（時は 0-23 が上限）     |
| `minute=-1`  | `"-1 9 * * *"`     | 無効（負の値）               |
| `minute=60`  | `"60 9 * * *"`     | 無効（分は 0-59 が上限）     |
| `hour=NaN`   | `"0 NaN * * *"`    | 無効（NaN は整数ではない）   |
| `minute=1.5` | `"1.5 9 * * *"`    | 無効（小数点は整数ではない） |

### 1-2. 影響範囲

- `VisualCronConfig.hour` および `VisualCronConfig.minute` は `number` 型で定義されているため、型レベルでは不正値の混入を防げない
- UIバリデーションでガードされているとしても、純粋関数 `visualConfigToCron` レベルでのガードが不在である
- `weekdays`（TASK-UI-SCHEDULE-CRON-WEEKDAYS-GUARD-001 で対処済み）および `dayOfMonth`（TASK-UI-SCHEDULE-CRON-MONTHLY-GUARD-001 で対処済み）のガードと対称性がなく、設計の一貫性が欠けている
- `cronParser.ts` の逆変換処理においても、不正な `hour`・`minute` を含む cron 式が `daily` や `monthly` として誤分類されるリスクがある

### 1-3. 設計上の問題

`weekly` 分岐および `monthly` 分岐には既に個別フィールドのガードが実装済みである:

```typescript
// weekly: weekdays ガード（TASK-UI-SCHEDULE-CRON-WEEKDAYS-GUARD-001 で実装済み）
if ((weekdays ?? []).length === 0) return "";

// monthly: dayOfMonth ガード（TASK-UI-SCHEDULE-CRON-MONTHLY-GUARD-001 で実装済み）
if (dayOfMonth == null || dayOfMonth < 1 || dayOfMonth > 31) return "";
```

対称性の観点から、全周波数に共通する `hour`・`minute` にも同様のガードが必要である。

## 2. 何を達成するか（What）

### 2-1. 実装目標

`cronConverter.ts` の全周波数分岐に共通して適用される `hour`（0-23）および `minute`（0-59）の有効範囲チェックを追加し、不正値の場合に空文字 `""` を返すガード処理を実装する。整数チェック（`Number.isInteger()`）も含め、`NaN` や小数値を確実に弾く。

### 2-2. 受け入れ条件（Acceptance Criteria）

| AC番号 | 条件                                                                        | 検証方法       |
| ------ | --------------------------------------------------------------------------- | -------------- |
| AC-1   | `hour=-1` のとき全周波数で `""` を返す                                      | 単体テスト     |
| AC-2   | `hour=24` のとき全周波数で `""` を返す                                      | 単体テスト     |
| AC-3   | `minute=-1` のとき全周波数で `""` を返す                                    | 単体テスト     |
| AC-4   | `minute=60` のとき全周波数で `""` を返す                                    | 単体テスト     |
| AC-5   | `hour=0` のとき正常動作する（境界値・最小）                                 | 単体テスト     |
| AC-6   | `hour=23` のとき正常動作する（境界値・最大）                                | 単体テスト     |
| AC-7   | `minute=0` のとき正常動作する（境界値・最小）                               | 単体テスト     |
| AC-8   | `minute=59` のとき正常動作する（境界値・最大）                              | 単体テスト     |
| AC-9   | 既存テスト全件（`cronConverter.edge.test.ts` 他）が引き続きパスする         | vitest 実行    |
| AC-10  | JSDoc の `@returns` と `@remarks` に hour/minute ガード仕様が追記されている | コードレビュー |

### 2-3. スコープ外

- UIバリデーションロジックの変更
- `weekdays` の空配列ガード（TASK-UI-SCHEDULE-CRON-WEEKDAYS-GUARD-001 にて対処済み）
- `dayOfMonth` の範囲ガード（TASK-UI-SCHEDULE-CRON-MONTHLY-GUARD-001 にて対処済み）
- `hourly` frequency 等、既存実装に存在しない周波数の追加

## 3. どのように実行するか（How）

### 3-1. 実装方針

各周波数分岐の前段（またはスイッチ文の手前）に共通ガードを追加する。`Number.isInteger()` を先に評価することで `NaN` や小数値を弾き、その後に範囲チェックを行う。

**修正前（各分岐の例）:**

```typescript
case "daily":
  return `${minute} ${hour} * * *`;
```

**修正後（共通ガードを先頭に追加する方法の例）:**

```typescript
// 共通ガード: hour / minute の整数・範囲チェック
if (
  !Number.isInteger(hour) ||
  hour < 0 ||
  hour > 23 ||
  !Number.isInteger(minute) ||
  minute < 0 ||
  minute > 59
) {
  return "";
}

switch (frequency) {
  case "daily":
    return `${minute} ${hour} * * *`;
  // ...
}
```

> **注意**: 共通ガードはスイッチ文の前に一箇所で実装することで、全周波数に漏れなく適用する。各分岐に個別に追加すると実装漏れのリスクがある。

### 3-2. cronParser.ts 双方向バリデーション

`cronConverter.ts` のガード追加と対称的に、`cronParser.ts` の逆変換側でも不正な `hour`・`minute` を含む cron 式を適切に扱う。具体的には、パース結果の `hour`・`minute` が有効範囲外であれば `null` またはエラーを返すよう修正する。これにより、不正な cron 式が `daily` や `monthly` として誤分類されることを防ぐ。

### 3-3. テスト追加方針

`apps/desktop/src/__tests__/utils/cronConverter.edge.test.ts` に `hour`・`minute` ガードのテストブロックを追加する。

追加するテストケース（TC-X1〜TC-X10）:

| TC番号 | 入力                             | 期待値 | 対応AC |
| ------ | -------------------------------- | ------ | ------ |
| TC-X1  | `hour=-1`（daily）               | `""`   | AC-1   |
| TC-X2  | `hour=24`（daily）               | `""`   | AC-2   |
| TC-X3  | `minute=-1`（daily）             | `""`   | AC-3   |
| TC-X4  | `minute=60`（daily）             | `""`   | AC-4   |
| TC-X5  | `hour=0`（境界最小値・daily）    | 正常値 | AC-5   |
| TC-X6  | `hour=23`（境界最大値・daily）   | 正常値 | AC-6   |
| TC-X7  | `minute=0`（境界最小値・daily）  | 正常値 | AC-7   |
| TC-X8  | `minute=59`（境界最大値・daily） | 正常値 | AC-8   |
| TC-X9  | `hour=-1`（weekly）              | `""`   | AC-1   |
| TC-X10 | `minute=60`（monthly）           | `""`   | AC-4   |

weekly・monthly でも代表的な不正値ケースを追加し、共通ガードが全周波数に効いていることを確認する。

### 3-4. JSDoc 更新

`visualConfigToCron` の `@returns` と `@remarks` に hour/minute ガード仕様を追記する:

```typescript
/**
 * @returns cron 式文字列。
 *   - `frequency="weekly"` かつ `weekdays=[]` の場合は空文字 `""` を返す。
 *   - `frequency="monthly"` かつ `dayOfMonth` が範囲外（< 1 または > 31）の場合は空文字 `""` を返す。
 *   - `hour` が整数でない、または範囲外（< 0 または > 23）の場合は空文字 `""` を返す。
 *   - `minute` が整数でない、または範囲外（< 0 または > 59）の場合は空文字 `""` を返す。
 *
 * @remarks
 * 空曜日・不正な日付・不正な時刻は有効な cron 式に変換できないため、ガード処理では例外を投げず空文字を返す。
 * 呼び出し元は既存のバリデーションで空文字を無効入力として扱う。
 * `Number.isInteger()` を先に評価することで NaN・小数値を確実に排除する。
 */
```

## 4. 実行手順 (Phase 1-13)

| Phase    | 名称             | 主な作業                                                                                       |
| -------- | ---------------- | ---------------------------------------------------------------------------------------------- |
| Phase 1  | 要件確認         | AC の確定・スコープ明確化（hour/minute 共通ガード・cronParser 双方向バリデーションの範囲確認） |
| Phase 2  | 設計             | 共通ガードの配置場所（スイッチ文前 vs 各分岐内）を確定・cronParser 修正箇所の特定              |
| Phase 3  | 設計レビュー     | 既存 weekdays・dayOfMonth ガードとの対称性確認・`Number.isInteger()` 先置きの必要性確認        |
| Phase 4  | テスト作成       | TC-X1〜TC-X10 を `cronConverter.edge.test.ts` に追加（Red フェーズ）                           |
| Phase 5  | 実装             | `cronConverter.ts` に共通ガード処理を追加（Green フェーズ）                                    |
| Phase 6  | cronParser 対応  | `cronParser.ts` の逆変換側に hour/minute 範囲チェックを追加し、誤分類を防ぐ                    |
| Phase 7  | テスト拡充       | NaN・小数値・undefined・null 等の追加テスト検討                                                |
| Phase 8  | カバレッジ確認   | `pnpm --filter @repo/desktop test` でカバレッジ計測                                            |
| Phase 9  | リファクタリング | 共通ガードのコードの簡潔さ・全周波数への適用漏れがないことの最終確認                           |
| Phase 10 | 品質保証         | lint・typecheck・全テストの通過確認                                                            |
| Phase 11 | 最終レビュー     | AC 全件チェック                                                                                |
| Phase 12 | ドキュメント更新 | 実装ガイド・未タスク検出・スキルフィードバック作成                                             |
| Phase 13 | PR 作成          | レビュー依頼・マージ                                                                           |

## 5. 完了条件チェックリスト

- [ ] `apps/desktop/src/renderer/utils/cronConverter.ts` に `hour`・`minute` 共通ガード処理が実装されている
- [ ] AC-1: `hour=-1` で全周波数 `""` が返る
- [ ] AC-2: `hour=24` で全周波数 `""` が返る
- [ ] AC-3: `minute=-1` で全周波数 `""` が返る
- [ ] AC-4: `minute=60` で全周波数 `""` が返る
- [ ] AC-5: `hour=0` で正常動作する（境界値）
- [ ] AC-6: `hour=23` で正常動作する（境界値）
- [ ] AC-7: `minute=0` で正常動作する（境界値）
- [ ] AC-8: `minute=59` で正常動作する（境界値）
- [ ] AC-9: 既存テスト全件がパスしている
- [ ] AC-10: JSDoc に `hour`・`minute` ガード仕様が追記されている
- [ ] `cronParser.ts` に hour/minute 範囲チェックが追加され、誤分類が防がれている
- [ ] `pnpm --filter @repo/desktop test` が全件グリーン
- [ ] `pnpm lint` が通過
- [ ] `pnpm typecheck` が通過

## 6. 検証方法

### 6-1. 単体テスト実行

```bash
# worktree ルートから実行
pnpm --filter @repo/desktop test

# テストファイルを直接指定して実行
pnpm vitest run apps/desktop/src/__tests__/utils/cronConverter.edge.test.ts
```

### 6-2. 型チェック・Lint

```bash
pnpm --filter @repo/desktop typecheck
pnpm --filter @repo/desktop lint
```

### 6-3. 手動確認（Phase 11）

1. デスクトップアプリを起動する
2. スケジュール設定画面を開く
3. `daily`・`weekly`・`monthly` 各設定で、UIから通常入力できない不正な時刻（負の値・上限超え）に相当するケースをコード経由で試みる
4. バリデーションが適切に働き、不正な cron 式が生成・保存されないことを確認する

## 7. リスクと対策

| リスク                                                   | 影響度 | 発生確率 | 対策                                                                                                                 |
| -------------------------------------------------------- | ------ | -------- | -------------------------------------------------------------------------------------------------------------------- |
| esbuild mismatch による vitest 起動失敗                  | 高     | 中       | `pnpm install` を実行して解消する（発見元タスク実績あり）                                                            |
| `NaN < 0` が `false` となる直感に反する挙動による漏れ    | 高     | 中       | `Number.isInteger()` を範囲チェックより先に置く。NaN は `Number.isInteger(NaN) === false` で確実に弾かれる           |
| 共通ガードの配置漏れで特定周波数にガードが効かない       | 高     | 低       | スイッチ文の前に一箇所で実装し、各分岐内に個別追加しない設計にする                                                   |
| `cronParser.ts` 修正漏れによる逆変換側の誤分類           | 中     | 中       | Phase 6 を独立フェーズとして設け、cronParser 側の修正を必須作業として明示する                                        |
| 既存テストの回帰破壊                                     | 高     | 低       | Phase 4（テスト Red）→ Phase 5（実装 Green）の TDD サイクルを厳守する                                                |
| `hour`・`minute` が `undefined` の場合のランタイムエラー | 中     | 低       | `Number.isInteger(undefined)` は `false` を返すため、`Number.isInteger()` チェックを先置きすることで同時に対応できる |

## 8. 参照情報

| 資料名                               | パス                                                                           | 用途                                      |
| ------------------------------------ | ------------------------------------------------------------------------------ | ----------------------------------------- |
| 対象実装ファイル                     | `apps/desktop/src/renderer/utils/cronConverter.ts`                             | 共通ガード処理追加対象                    |
| 逆変換実装ファイル                   | `apps/desktop/src/renderer/utils/cronParser.ts`                                | 双方向バリデーション追加対象              |
| テストファイル                       | `apps/desktop/src/__tests__/utils/cronConverter.edge.test.ts`                  | テスト追加対象                            |
| 型定義ファイル                       | `apps/desktop/src/renderer/types/visualCronConfig.ts`                          | `hour: number`・`minute: number` 定義確認 |
| dayOfMonth ガード実装タスク仕様書    | `docs/30-workflows/unassigned-task/TASK-UI-SCHEDULE-CRON-MONTHLY-GUARD-001.md` | 対称設計の参考・実装パターン参照          |
| weekdays ガード実装タスク仕様書      | `docs/30-workflows/TASK-UI-SCHEDULE-CRON-WEEKDAYS-GUARD-001/`                  | 実装パターンの根拠・対称設計の参考        |
| 発見元 Phase 12 未タスク検出レポート | `outputs/phase-12/unassigned-task-detection.md`                                | 本タスクの発見経緯                        |

## 9. 苦戦箇所・知見（発見元タスクより）

TASK-UI-SCHEDULE-CRON-MONTHLY-GUARD-001 の実装を通じて得られた知見を以下に記録する。本タスク実装時は必ず参照すること。

### 9-1. `Number.isInteger()` の NaN 挙動（重要）

`NaN < 0` は `false`、`NaN > 23` も `false` であるため、範囲チェック（`hour < 0 || hour > 23`）だけでは `NaN` を弾くことができない。`NaN` はどの比較演算においても `false` を返すため、範囲チェックをすり抜けてしまう。

**必ず `Number.isInteger()` を先頭に置くこと:**

```typescript
// 誤り: NaN が範囲チェックをすり抜ける
if (hour < 0 || hour > 23) return ""; // NaN は弾かれない

// 正しい: Number.isInteger() を先置きして NaN・小数値を先に弾く
if (!Number.isInteger(hour) || hour < 0 || hour > 23) return "";
```

`Number.isInteger(NaN)` は `false` を返すため、確実に弾くことができる。同様に `undefined`・`null`・小数値も `false` を返す。

### 9-2. 双方向バリデーションの必要性

`cronConverter.ts` でガードを追加するだけでなく、`cronParser.ts` の逆変換側でも不正値の誤分類を防ぐ必要がある。例えば、不正な `hour` を含む cron 式が `cronParser` によって `daily` や `monthly` として誤分類されると、UI 上に不整合な状態が表示される。

**実装時の確認ポイント:**

- `cronParser.ts` でパースした `hour`・`minute` が有効範囲外の場合、`null` またはエラーを返すように修正する
- `cronConverter.ts` と `cronParser.ts` の両方をセットで修正することで、双方向の整合性を保つ

### 9-3. esbuild mismatch による vitest 起動失敗

vitest が起動しない場合は、esbuild のバージョン不一致が原因である可能性が高い。`pnpm install` を実行することで解消できる（発見元タスクでの実績あり）。テスト実行前に環境が正常であることを確認すること。

### 9-4. TDD サイクルの厳守

Phase 4（テスト Red）→ Phase 5（実装 Green）の順序を守ることで、ガード処理の実装漏れを防ぐ。テストを先に書くことで、共通ガードが全周波数（daily/weekly/monthly）に効いていることをコードで保証できる。特に「共通ガードのつもりがスイッチ文の特定分岐にしか効いていない」という実装ミスをテストで検出できる。

### 9-5. JSDoc の更新忘れ注意

AC-10 で要求されるため、実装と同時に `@returns` と `@remarks` の更新を行うこと。`cronConverter.ts` の JSDoc は既に `weekdays` と `dayOfMonth` のガード仕様が記載されているため、`hour`・`minute` のガード仕様を同じ形式で追記する。実装後にコードレビューで確認することを推奨する。
