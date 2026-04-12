# Phase 5: 実装（TDD Green フェーズ） - タスク仕様書

## メタ情報

| 項目       | 値                                 |
| ---------- | ---------------------------------- |
| Phase      | 5                                  |
| タスクID   | TASK-UI-SCHEDULE-CRON-SEMANTIC-001 |
| 機能名     | 意味論的 cron バリデーション追加   |
| タスク種別 | implementation                     |
| 前Phase    | Phase 4: テスト作成                |
| 次Phase    | Phase 6: テスト拡充                |
| ステータス | 未実施                             |
| 作成日     | 2026-04-12                         |

---

## 目的

TDD Green フェーズとして、Phase 4 で作成した失敗テスト（TC-01〜TC-08）を通過させる実装を行う。

具体的には以下を実施する:

1. `cron-parser` ライブラリのインストール
2. `ValidateCronOptions` インターフェースの追加
3. `validateCronExpression` 関数シグネチャへの `options` パラメータ追加
4. 意味論的バリデーションロジックの実装（`options.semantic === true` の場合のみ実行）
5. JSDoc の更新（AC-5 対応）

Phase 5 完了時点で TC-01〜TC-08 が全件 GREEN（PASS）となり、既存テスト SCV-01〜SCV-12 も引き続き PASS していることが期待される。

---

## 実装計画

### 新規作成・修正ファイルパス一覧【必須】

| ファイルパス                                                 | 変更種別 | 変更内容                                                                                                            |
| ------------------------------------------------------------ | -------- | ------------------------------------------------------------------------------------------------------------------- |
| `apps/desktop/src/renderer/utils/scheduleConfigValidator.ts` | 修正     | `ValidateCronOptions` インターフェース追加・`validateCronExpression` シグネチャ変更・意味論ロジック追加・JSDoc 更新 |
| `apps/desktop/package.json`                                  | 修正     | `cron-parser` 依存関係追加（`dependencies`）                                                                        |

### 新規作成ファイルなし

---

## 実行タスク

### タスク1: `cron-parser` ライブラリのインストール手順の定義

**インストールコマンド**（CLAUDE.md に従い `pnpm` のみ使用）:

```bash
pnpm --filter @repo/desktop add cron-parser
```

**インストール後の確認**:

```bash
# package.json に cron-parser が追加されたことを確認
grep "cron-parser" apps/desktop/package.json

# インストール済みパッケージの確認
ls apps/desktop/node_modules/cron-parser 2>/dev/null || \
  ls node_modules/cron-parser 2>/dev/null
```

**バージョン方針**:

- `cron-parser` の最新安定版 `^5.x` を使用する
- `CronExpressionParser.parse(...)` を使う前提で API を固定する
- `package.json` の `dependencies` セクションに追加されること（`devDependencies` ではない）

---

### タスク2: `scheduleConfigValidator.ts` 変更計画の記述

#### 2-1. `ValidateCronOptions` インターフェース定義

ファイルの先頭部（既存の型定義の直前または直後）に以下のインターフェースを追加する:

```typescript
/**
 * validateCronExpression のオプション設定
 */
export interface ValidateCronOptions {
  /**
   * true の場合、構文・値域チェックに加えて next-execution-time 計算による
   * 意味論的バリデーション（到達可能性チェック）を実行する。
   * false または省略した場合は従来の構文チェックのみ実行（後方互換）。
   * @default false
   */
  semantic?: boolean;
}
```

#### 2-2. `validateCronExpression` シグネチャ変更

**変更前**:

```typescript
export function validateCronExpression(value: string): string | null {
```

**変更後**:

```typescript
/**
 * cron 式の 5 フィールド構文とフィールド値の範囲を検証する。
 * options.semantic が true の場合は next-execution-time 計算による到達可能性チェックも実行する。
 *
 * @param value - 検証対象の cron 式文字列
 * @param options - バリデーションオプション
 * @param options.semantic - true の場合、意味論的検証（next-run 計算）を追加実行する（デフォルト: false）
 * @returns エラーメッセージ文字列、または有効なら null
 */
export function validateCronExpression(
  value: string,
  options?: ValidateCronOptions,
): string | null {
```

#### 2-3. 意味論的バリデーションの実装方針

Phase 2 で確定したフロー設計に基づき、既存の構文・値域チェックの**直後**（`return null` の直前）に以下のブロックを追加する:

```typescript
// [5] semantic チェック（cron-parser 使用）
// options.semantic === true の場合のみ実行（後方互換保証）
import { CronExpressionParser } from "cron-parser";

if (options?.semantic === true) {
  try {
    // parse() が成功 → next() で次の実行時刻が計算できるか確認
    const interval = CronExpressionParser.parse(trimmed);
    interval.next(); // 到達不能な場合は例外が発生する
  } catch {
    return "指定した日付の組み合わせは存在しません（例: 2月31日）";
  }
}

return null;
```

**注意事項**:

- `cron-parser` は static import を採用し、`import { CronExpressionParser } from "cron-parser";` をファイル先頭に追加する
- `CronExpressionParser.parse()` が例外を投げた場合のみエラーを返す設計（`options.semantic !== true` の場合はこのブロックに到達しない）

#### 2-4. バリデーションフロー全体（実装後のイメージ）

```
validateCronExpression(value, options)
│
├─ [1] trimmed が空文字 → "cron式を入力してください" を返す
│
├─ [2] fields.length !== 5 → フィールド数エラーを返す
│
├─ [3] 各フィールドの値域チェック（既存ロジック・変更なし）
│       └─ 不正 → "cron式の形式が正しくありません" を返す
│
├─ [4] options?.semantic !== true → null を返す（従来動作・後方互換）
│
└─ [5] semantic チェック実行（options.semantic === true の場合のみ）
        │
        ├─ CronExpressionParser.parse(trimmed).next() 成功 → null を返す
        │
        └─ 例外発生 → "指定した日付の組み合わせは存在しません（例: 2月31日）" を返す
```

---

### タスク3: 実装後の Green 確認コマンド

**Phase 4 テスト（TC-01〜TC-08）の GREEN 確認**:

```bash
pnpm vitest run apps/desktop/src/__tests__/utils/scheduleConfigValidator.edge.test.ts
```

**既存テスト（SCV-01〜SCV-12）の回帰確認**:

```bash
pnpm vitest run apps/desktop/src/__tests__/utils/scheduleConfigValidator.test.ts
```

**全テスト一括実行**:

```bash
pnpm vitest run apps/desktop/src/__tests__/utils/
```

**型チェック確認**（`ValidateCronOptions` のエクスポートが正しいことを確認）:

```bash
pnpm --filter @repo/desktop exec tsc --noEmit
```

**期待結果**:

- TC-01〜TC-08 全件 PASS（GREEN）
- SCV-01〜SCV-12 全件 PASS（回帰なし）
- TypeScript 型エラーなし

---

## 参照資料

| 資料名                         | パス                                                                     | 説明                                               |
| ------------------------------ | ------------------------------------------------------------------------ | -------------------------------------------------- |
| Phase 2 API 設計               | `outputs/phase-2/api-design.md`                                          | `ValidateCronOptions` シグネチャ・フロー設計の根拠 |
| Phase 2 設計詳細               | `docs/30-workflows/task-ui-schedule-cron-semantic-001/phase-2-design.md` | 関数シグネチャ・インターフェース定義の詳細         |
| Phase 3 設計レビュー結果       | `outputs/phase-3/design-review-result.md`                                | MINOR 追跡テーブル（Phase 5 解決対象の確認）       |
| Phase 4 テスト計画書           | `outputs/phase-4/test-plan.md`                                           | TC-01〜TC-08 の一覧・期待結果                      |
| Phase 4 テストケースコード     | `outputs/phase-4/test-cases.md`                                          | RED 確認済みテストコードの全文                     |
| scheduleConfigValidator 実装   | `apps/desktop/src/renderer/utils/scheduleConfigValidator.ts`             | 変更対象ファイル（現行実装）                       |
| scheduleConfigValidator テスト | `apps/desktop/src/__tests__/utils/scheduleConfigValidator.test.ts`       | 回帰ガード対象（SCV-01〜SCV-12）                   |
| scheduleConfigValidator Edge   | `apps/desktop/src/__tests__/utils/scheduleConfigValidator.edge.test.ts`  | Phase 4 追加テスト対象（TC-01〜TC-08）             |
| cron-parser npm                | https://www.npmjs.com/package/cron-parser                                | ライブラリ仕様・API リファレンス                   |

---

## 成果物

| 成果物     | 配置先                                   | 形式     | 説明                                                       |
| ---------- | ---------------------------------------- | -------- | ---------------------------------------------------------- |
| 実装計画書 | `outputs/phase-5/implementation-plan.md` | Markdown | タスク1〜3 の実施内容・コマンド・期待結果のまとめ          |
| 変更ログ   | `outputs/phase-5/change-log.md`          | Markdown | 変更したファイルの差分サマリ・`cron-parser` バージョン記録 |

---

## 統合テスト連携

- Phase 4 で作成した TC-01〜TC-08 の期待値（TC-01 はエラー、TC-02〜TC-08 は PASS）を Phase 5 実装で満たす
- Phase 6 では TC-09〜TC-16 を追加し、カバレッジをさらに向上させる
- Phase 3 の MINOR 追跡テーブルに「Phase 5 解決」と記録されている項目（例: SEM-M-01 バンドルサイズ確認・SEM-M-02 エラーメッセージ文言統一）があれば、本 Phase で対応する
- Phase 11（NON_VISUAL 評価）：バリデーターロジックのみの変更のため、スクリーンショット不要・コード動作確認のみ

---

## 完了条件チェックリスト

- [ ] `pnpm --filter @repo/desktop add cron-parser` が完了し、`apps/desktop/package.json` に `cron-parser` が追加されていること
- [ ] `ValidateCronOptions` インターフェースが `scheduleConfigValidator.ts` に追加・エクスポートされていること
- [ ] `validateCronExpression` のシグネチャが `(value: string, options?: ValidateCronOptions): string | null` に変更されていること
- [ ] 意味論的バリデーションロジック（`options.semantic === true` の場合に `CronExpressionParser.parse` を使用）が実装されていること
- [ ] JSDoc が `@param options.semantic` の説明を含んでいること（AC-5 対応）
- [ ] `pnpm vitest run` で TC-01〜TC-08 が全件 PASS（GREEN）していること
- [ ] `pnpm vitest run` で SCV-01〜SCV-12 が引き続き全件 PASS していること（回帰なし）
- [ ] `pnpm --filter @repo/desktop exec tsc --noEmit` で型エラーがないこと
- [ ] `outputs/phase-5/implementation-plan.md` と `outputs/phase-5/change-log.md` が生成されていること

---

## Phase 末端アクション【必須】

Phase 5 完了時に以下を実行すること:

1. `outputs/phase-5/implementation-plan.md` に実施したタスク1〜3 の内容・コマンドと実行結果を記録する
2. `outputs/phase-5/change-log.md` に変更したファイルの差分サマリと `cron-parser` のインストールバージョンを記録する
3. Phase 3 MINOR 追跡テーブルに「Phase 5 解決」対象の項目がある場合は解決確認 Phase を更新する
4. 全完了条件チェックリストを確認し、未完了項目がある場合は完了させてから Phase 6 へ進む

---

## 依存関係

| 依存 Phase / タスク | 依存内容                                                                           |
| ------------------- | ---------------------------------------------------------------------------------- |
| Phase 3 完了        | 設計レビューが PASS / MINOR のみで完了していること                                 |
| Phase 4 完了        | TC-01〜TC-08 のテストが追加済みであること                                          |
| Phase 2 完了        | `ValidateCronOptions` インターフェース定義・バリデーションフローが確定していること |

---

## Phase 実行記録テンプレート

```markdown
## Phase 5 実行記録

- 実行日時: YYYY-MM-DD HH:mm
- 実行者: -
- cron-parser インストールバージョン: X.X.X
- 変更ファイル数: 2（scheduleConfigValidator.ts + package.json）
- TC-01〜TC-08 GREEN 確認: [ ] 全件 PASS / [ ] 失敗あり（件数: X 件）
- SCV-01〜SCV-12 回帰確認: [ ] 全件 PASS / [ ] 失敗あり（件数: X 件）
- 型チェック結果: [ ] エラーなし / [ ] エラーあり（件数: X 件）
- Phase 3 MINOR 解決件数: X 件
- 完了条件充足状況: X / 9 項目完了
- Phase 6 移行判定: [ ] PASS（Phase 6 へ進む）/ [ ] HOLD（理由: ）
```

---

## 次の Phase 案内

**Phase 6: テスト拡充** — Phase 4 で定義した TC-01〜TC-08 以外のエッジケース・回帰ガード・境界値テスト（TC-09〜TC-16）を追加し、意味論的バリデーションのカバレッジをさらに向上させる。4月・6月・9月・11月の 31 日、2 月 30 日など境界値ケースを網羅する。

**ゲート条件**: Phase 4 で作成した TC-01〜TC-08 の期待値（TC-01 はエラー、TC-02〜TC-08 は PASS）が満たされていない場合、Phase 6 へ進まないこと。
