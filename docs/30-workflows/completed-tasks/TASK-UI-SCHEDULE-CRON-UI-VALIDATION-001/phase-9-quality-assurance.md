# Phase 9: 品質保証

## メタ情報

| 項目       | 内容                                    |
| ---------- | --------------------------------------- |
| Phase      | 9                                       |
| タスクID   | TASK-UI-SCHEDULE-CRON-UI-VALIDATION-001 |
| タスク名   | VisualCronPicker UIバリデーション整理   |
| 前提Phase  | Phase 8（リファクタリング完了）         |
| 後続Phase  | Phase 10                                |
| 作成日     | 2026-04-13                              |
| ステータス | 完了                                    |

## 目的

`VisualCronPicker` のバリデーション整理が出荷可能品質であることを確認する。
ESLint・TypeScript 型チェック・全テスト PASS の三点を一括判定し、
リグレッションがないことを保証する。

## 実行タスク

1. ESLint を実行し、エラー・警告がないことを確認する
2. TypeScript 型チェックを実行し、型エラーがないことを確認する
3. `VisualCronPicker` 関連テストを全件実行し、PASS していることを確認する
4. 既存テストのリグレッション（他コンポーネントへの影響）がないことを確認する
5. 品質チェックリストの AC-1〜AC-10 を順に判定する
6. `outputs/phase-9/qa-result.md` に品質ゲート判定結果を記録する

## 品質チェックリスト

- [x] AC-1: weekly + 空曜日でエラーメッセージが表示される
- [x] AC-2: `onValidationChange(false)` が weekly + 空曜日で呼び出される
- [x] AC-3: `onValidationChange(true)` が weekly + 曜日選択済みで呼び出される
- [x] AC-4: monthly + `dayOfMonth < 1` でエラーメッセージが表示される
- [x] AC-5: monthly + `dayOfMonth > 31` でエラーメッセージが表示される
- [x] AC-6: `onValidationChange(false)` が monthly + 無効日付で呼び出される
- [x] AC-7: `onValidationChange(true)` が monthly + 有効な日付（1〜31）で呼び出される
- [x] AC-8: `onValidationChange` が未指定の場合でもエラーが発生しない
- [x] AC-9: 全テスト PASS
- [x] AC-10: 型チェック PASS
- [x] ESLint チェック PASS（エラーなし）
- [x] 既存テストのリグレッションなし

## 実行コマンド

| コマンド                                                                   | 目的             | 期待結果           |
| -------------------------------------------------------------------------- | ---------------- | ------------------ |
| `pnpm --filter @repo/desktop test -- --testPathPattern="VisualCronPicker"` | 対象テスト全実行 | 全テスト PASS      |
| `pnpm --filter @repo/desktop typecheck`                                    | 型チェック       | エラーなし         |
| `pnpm --filter @repo/desktop lint`                                         | ESLint           | エラーなし         |
| `pnpm --filter @repo/desktop test`                                         | 全テスト実行     | リグレッションなし |

## 実行手順

### Step 1: ESLint チェック

```bash
pnpm --filter @repo/desktop lint
```

**期待結果**: エラーなし（警告も可能な限り 0 件）

### Step 2: TypeScript 型チェック

```bash
pnpm --filter @repo/desktop typecheck
```

**期待結果**: エラーなし

### Step 3: VisualCronPicker テスト全実行

```bash
pnpm --filter @repo/desktop test -- --testPathPattern="VisualCronPicker"
```

**期待結果**: AC-1〜AC-10 に対応するテストが全件 PASS

### Step 4: 既存テストのリグレッション確認

```bash
pnpm --filter @repo/desktop test
```

**期待結果**: `VisualCronPicker` 以外のテストも含めて全件 PASS（リグレッションなし）

### Step 5: 品質ゲート一括判定

| チェック項目          | コマンド                                                                   | 期待結果      |
| --------------------- | -------------------------------------------------------------------------- | ------------- |
| ESLint                | `pnpm --filter @repo/desktop lint`                                         | エラーなし    |
| TypeScript 型チェック | `pnpm --filter @repo/desktop typecheck`                                    | エラーなし    |
| 対象テスト            | `pnpm --filter @repo/desktop test -- --testPathPattern="VisualCronPicker"` | 全テスト PASS |
| リグレッション確認    | `pnpm --filter @repo/desktop test`                                         | 全件 PASS     |

## 統合テスト連携

本 Phase は最終的な品質ゲートであり、Phase 7 のカバレッジ確認と Phase 8 のリファクタリング結果を
含めて判定する。問題があれば Phase 6 のテスト拡充または Phase 8 の修正へ戻し、
品質基準を満たした状態で確定する。

## 多角的チェック観点

| 観点             | 確認内容                                                                  |
| ---------------- | ------------------------------------------------------------------------- |
| 静的解析         | ESLint エラー・警告がないこと。useEffect exhaustive-deps 警告がないこと   |
| 型安全           | TypeScript strict モードでエラーがないこと。any 型を使用していないこと    |
| テスト網羅性     | AC-1〜AC-10 に対応するテストが全件 PASS していること                      |
| リグレッション   | `VisualCronPicker` 変更が他コンポーネントのテストに影響していないこと     |
| コールバック動作 | `onValidationChange` が weekly / monthly の各条件で正しく呼び出されること |

## 参照資料

| 資料名                   | パス                                       | 用途              |
| ------------------------ | ------------------------------------------ | ----------------- |
| Phase 1 要件定義         | `phase-1-requirements.md`                  | AC 一覧・前提確認 |
| Phase 5 実装結果レポート | `outputs/phase-5/implementation-result.md` | 実装内容の把握    |
| リファクタリング報告     | `outputs/phase-8/refactoring-result.md`    | Phase 8 成果物    |
| カバレッジ報告書         | `outputs/phase-7/coverage-report.md`       | Phase 7 成果物    |
| テスト設計書             | `phase-4-test-creation.md`                 | テストケース一覧  |

## サブタスク管理

| サブタスクID | 内容                                    | 担当   | 状態 |
| ------------ | --------------------------------------- | ------ | ---- |
| QA-01        | ESLint 実行・結果記録                   | 実装者 | 完了 |
| QA-02        | TypeScript 型チェック実行・結果記録     | 実装者 | 完了 |
| QA-03        | VisualCronPicker テスト全実行・結果記録 | 実装者 | 完了 |
| QA-04        | 既存テストリグレッション確認            | 実装者 | 完了 |
| QA-05        | AC-1〜AC-10 判定記録                    | 実装者 | 完了 |
| QA-06        | `outputs/phase-9/qa-result.md` 作成     | 実装者 | 完了 |

## 成果物

| 成果物       | パス                           | 説明                                                     |
| ------------ | ------------------------------ | -------------------------------------------------------- |
| 品質保証結果 | `outputs/phase-9/qa-result.md` | 品質ゲート判定結果・AC-1〜AC-10 確認・リグレッション確認 |

## 完了条件

- [x] ESLint が PASS している（エラーなし）
- [x] TypeScript 型チェックが PASS している（エラーなし）
- [x] `VisualCronPicker` 関連テストが全件 PASS している
- [x] 既存テストのリグレッションがないこと
- [x] AC-1〜AC-10 が全て満たされていること
- [x] `outputs/phase-9/qa-result.md` が作成されていること

## タスク100%実行確認【必須】

- [x] 本 Phase 内の全タスクを 100% 実行完了
- [x] 成果物テーブル記載のファイルを全件生成（仕様書として記録）
- [x] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [x] 実行記録を残した

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js \
  docs/30-workflows/TASK-UI-SCHEDULE-CRON-UI-VALIDATION-001
```

## 次Phase

Phase 10: 最終レビューゲート
