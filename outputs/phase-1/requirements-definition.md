# 要件定義書 - TASK-UI-SCHEDULE-CRON-SEMANTIC-001

## P50チェック結果

| 確認項目                                         | 結果                                                                     |
| ------------------------------------------------ | ------------------------------------------------------------------------ |
| `validateCronExpression` シグネチャ              | `(value: string): string \| null` — オプション引数未追加 ✅              |
| JSDocに「semantic validationは行わない」コメント | 7行目・56行目に存在 ✅                                                   |
| 既存テストにセマンティック不正ケースなし         | SCV-01〜SCV-12に `"0 0 31 2 *"` 系なし ✅                                |
| `cron-parser` 未インストール                     | `apps/desktop/package.json` に `cron-parser` なし（`node-cron` のみ） ✅ |
| 関連ユーティリティの役割確認                     | `cronParser.ts`, `cronConverter.ts`, `cronHumanizer.ts` 存在確認 ✅      |

## 機能概要

`validateCronExpression` 関数に意味論的バリデーション（next-execution-time計算による到達可能性チェック）を追加する。

## 背景

現在の `validateCronExpression` は5フィールド構文チェックと各フィールドの値域のみを検証しており、`"0 0 31 2 *"`（2月31日）のような存在し得ない日付が通過してしまう。このようなスケジュールが設定された場合、条件が永久に満たされないため実行されない。

## 受け入れ基準

| AC番号 | 基準                                                                                   | 検証方法               |
| ------ | -------------------------------------------------------------------------------------- | ---------------------- |
| AC-1   | `validateCronExpression("0 0 31 2 *", { semantic: true })` がエラー文字列を返す        | テスト PASS            |
| AC-2   | `validateCronExpression("0 0 * * *", { semantic: true })` 等の正常ケースは null を返す | テスト PASS            |
| AC-3   | 既存テスト SCV-01〜SCV-12 が全件 PASS                                                  | `pnpm test` PASS       |
| AC-4   | 意味論的不正ケースのテストが追加されカバレッジが向上                                   | テスト PASS + coverage |
| AC-5   | `scheduleConfigValidator.ts` のJSDocが更新されsemantic オプションの説明が含まれる      | コードレビュー         |

## スコープ

### 含む

- `scheduleConfigValidator.ts` への意味論的検証ロジック追加
- `ValidateCronOptions` インターフェース定義（`options?: { semantic?: boolean }`）
- `cron-parser` ライブラリの導入
- 既存テストへの意味論的不正ケースの追加

### 含まない

- バックエンド（`ScheduleStore` / `SkillScheduler`）の変更
- IPC チャンネルの変更
- UI の変更
- `cronParser.ts`、`cronConverter.ts`、`cronHumanizer.ts` の変更
- `validateTimezone` 関数の変更
