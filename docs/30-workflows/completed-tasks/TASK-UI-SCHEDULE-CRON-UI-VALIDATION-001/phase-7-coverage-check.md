# Phase 7: カバレッジ確認

## メタ情報

| 項目       | 内容                                          |
| ---------- | --------------------------------------------- |
| Phase      | 7                                             |
| タスクID   | TASK-UI-SCHEDULE-CRON-UI-VALIDATION-001       |
| 機能名     | VisualCronPicker UIバリデーション整理         |
| 前提Phase  | Phase 6（テスト拡充完了・全件 PASS 確認済み） |
| 後続Phase  | Phase 8                                       |
| 作成日     | 2026-04-13                                    |
| ステータス | 完了                                          |

## 目的

Phase 5 で追加した `VisualCronPicker` のバリデーションロジック
（weekly + 空曜日 / monthly + 範囲外エラーメッセージ表示・`onValidationChange` コールバック）が
テストによって十分にカバーされているかを計測し、Line 80% 以上の目標達成を確認する。
カバレッジ対象は変更したコンポーネント・ブロックに限定し、局所検証の精度を保つ。

## 実行タスク

1. `VisualCronPicker` に対してカバレッジ計測を実行する
2. JSON サマリーを確認し、Line / Branch / Function Coverage の実測値を記録する
3. AC-1・AC-4・AC-5（weekly + 空曜日 / monthly + 範囲外でエラーメッセージ表示）の両ブランチがカバーされていることを確認する
4. AC-2〜AC-8（`onValidationChange` コールバック動作）の各分岐がカバーされていることを確認する
5. 未到達ブロックがある場合は原因を分析し、Phase 6 へ戻すか Phase 8 で対処する
6. `outputs/phase-7/coverage-report.md` を作成し、達成可否を明記する

## カバレッジ目標

| 指標              | 目標                                                                           |
| ----------------- | ------------------------------------------------------------------------------ |
| Line Coverage     | 80% 以上                                                                       |
| Branch Coverage   | 80% 以上（weekly + 空曜日 / monthly + 範囲外 true / false の両ブランチを含む） |
| Function Coverage | 100%（`onValidationChange` 呼び出し含む）                                      |

> カバレッジ対象範囲は `VisualCronPicker` コンポーネントに限定する。
> 全ファイル一律指定は局所検証の意図をぼやかすため採用しない。

## 実行手順

### Step 1: カバレッジ計測コマンド実行

```bash
pnpm --filter @repo/desktop test -- --coverage --testPathPattern="VisualCronPicker"
```

### Step 2: カバレッジレポート確認

```bash
# JSON サマリーで数値確認
cat coverage/coverage-summary.json | jq '.[" VisualCronPicker のファイルパス"]'
```

### Step 3: バリデーションブランチの確認

`VisualCronPicker` コンポーネント内の以下のブランチが両方カバーされていることを確認する。

| ブランチ                                                          | 対応テストケース                                       |
| ----------------------------------------------------------------- | ------------------------------------------------------ | --------------------------------- | --------------------------------------------------------- |
| `frequency === "weekly" && weekdays.length === 0` が true のとき  | AC-1 / AC-2 対応テスト（空曜日エラー表示・false 通知） |
| `frequency === "weekly" && weekdays.length === 0` が false のとき | AC-3 対応テスト（正常系・true 通知）                   |
| `frequency === "monthly" && (dayOfMonth < 1                       |                                                        | dayOfMonth > 31)` が true のとき  | AC-4 / AC-5 / AC-6 対応テスト（範囲外エラー・false 通知） |
| `frequency === "monthly" && (dayOfMonth < 1                       |                                                        | dayOfMonth > 31)` が false のとき | AC-7 対応テスト（有効日付・true 通知）                    |
| `onValidationChange` が呼び出されるとき                           | AC-2〜AC-8 対応テスト                                  |

### Step 4: 未到達ブロック分析

カバレッジ計測後、未到達ブロックが発見された場合:

1. 未到達理由を分析する（dead code か・テスト不足か）
2. テスト不足の場合 → Phase 6 へ戻りテスト追加
3. dead code の場合 → Phase 8（リファクタリング）で対処

## 統合テスト連携

本 Phase はカバレッジ確認に限定され、プロダクションコードの変更は行わない。
未到達ブロックが見つかった場合のみ、Phase 6 のテスト拡充または Phase 8 のリファクタリングへ接続する。

## 多角的チェック観点

| 観点              | 確認内容                                                                         |
| ----------------- | -------------------------------------------------------------------------------- |
| Line Coverage     | weekly / monthly のバリデーション追加行がすべて実行されていること                |
| Branch Coverage   | weekly + 空曜日 / monthly + 範囲外の true / false 両ブランチが実行されていること |
| Function Coverage | `onValidationChange` コールバックを含む全関数が 100% カバーされていること        |
| AC-1〜AC-6 対応   | エラー表示と `onValidationChange(false)` の分岐が実行されていること              |
| AC-7〜AC-8 対応   | 有効値通知と `onValidationChange` 未指定時の安全分岐が実行されていること         |

## 参照資料

| 資料名                   | パス                                                                         | 用途                       |
| ------------------------ | ---------------------------------------------------------------------------- | -------------------------- |
| Phase 5 実装結果レポート | `outputs/phase-5/implementation-result.md`                                   | 実装後 PASS 状態の確認     |
| Phase 6 テスト拡充結果   | `outputs/phase-6/test-expansion-result.md`                                   | 拡充テストケース一覧の確認 |
| coverage-standards       | `.claude/skills/task-specification-creator/references/coverage-standards.md` | カバレッジ基準             |

## サブタスク管理

| #   | サブタスク                                          | 担当   | 状態 |
| --- | --------------------------------------------------- | ------ | ---- |
| 1   | カバレッジ計測コマンド実行                          | 実装者 | 完了 |
| 2   | Line/Branch/Function Coverage の実測値記録          | 実装者 | 完了 |
| 3   | weekly + 空曜日バリデーションの両ブランチカバー確認 | 実装者 | 完了 |
| 4   | onValidationChange コールバック分岐のカバー確認     | 実装者 | 完了 |
| 5   | 未到達ブロック分析・対処方針決定                    | 実装者 | 完了 |

## 成果物

| 成果物           | パス                                 | 説明                                         |
| ---------------- | ------------------------------------ | -------------------------------------------- |
| カバレッジ報告書 | `outputs/phase-7/coverage-report.md` | 実測値・未到達分析・目標達成可否を含む報告書 |

## 完了条件

- [x] `VisualCronPicker` の Line Coverage が 80% 以上であること
- [x] `VisualCronPicker` の Branch Coverage が 80% 以上であること
- [x] `VisualCronPicker` の Function Coverage が 100% であること
- [x] weekly + 空曜日バリデーションブランチ（true / false 両方）がカバーされていること
- [x] `onValidationChange` コールバック動作の各分岐がカバーされていること
- [x] 未到達ブロックの分析結果が記録されていること
- [x] カバレッジ目標の達成可否が明記されていること
- [x] `outputs/phase-7/coverage-report.md` が作成されていること

## タスク100%実行確認【必須】

- [x] 本 Phase 内の全タスクを 100% 実行完了
- [x] 成果物テーブル記載のファイルを全件生成
- [x] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [x] 実行記録を残した

## 次Phase

Phase 8: リファクタリング
