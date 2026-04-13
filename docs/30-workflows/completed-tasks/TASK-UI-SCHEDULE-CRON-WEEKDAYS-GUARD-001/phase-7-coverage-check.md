# Phase 7: カバレッジ確認

## メタ情報

| 項目       | 内容                                          |
| ---------- | --------------------------------------------- |
| Phase      | 7                                             |
| タスクID   | TASK-UI-SCHEDULE-CRON-WEEKDAYS-GUARD-001      |
| 機能名     | cronConverter 空曜日ガード処理追加            |
| 前提Phase  | Phase 6（テスト拡充完了・全件 PASS 確認済み） |
| 後続Phase  | Phase 8                                       |
| 作成日     | 2026-04-12                                    |
| ステータス | pending                                       |

## 目的

Phase 5 で追加したガード処理ブランチ（`weekdays.length === 0` の early return）が
テストによって両方カバーされているかを計測し、カバレッジ目標の達成を確認する。
カバレッジ対象は変更したファイル・ブロックに限定し、局所検証の精度を保つ。

## 実行タスク

1. `cronConverter` の対象範囲に対してカバレッジ計測を実行する
2. JSON サマリーを確認し、Line / Branch / Function Coverage の実測値を記録する
3. `weekdays.length === 0` の true / false 両ブランチがカバーされていることを確認する
4. 未到達ブロックがある場合は原因を分析し、Phase 6 へ戻すか Phase 8 で対処する
5. `outputs/phase-7/coverage-report.md` を作成し、達成可否を明記する

## カバレッジ目標

| 指標              | 目標                                   |
| ----------------- | -------------------------------------- |
| Line Coverage     | 90% 以上                               |
| Branch Coverage   | 80% 以上（空曜日 true / false を含む） |
| Function Coverage | 100%                                   |

> カバレッジ対象範囲は `apps/desktop/src/renderer/utils/cronConverter.ts` に限定する。
> 全ファイル一律指定は局所検証の意図をぼやかすため採用しない。

## 実行手順

### Step 1: カバレッジ計測コマンド実行

```bash
pnpm vitest run --coverage apps/desktop/src/__tests__/utils/cronConverter
```

### Step 2: カバレッジレポート確認

```bash
# JSON サマリーで数値確認
cat coverage/coverage-summary.json | jq '"'"'.["apps/desktop/src/renderer/utils/cronConverter.ts"]'"'"'
```

### Step 3: ガード処理ブランチの確認

`visualConfigToCron` 関数内の以下の 2 ブランチが両方カバーされていることを確認する。

| ブランチ                                | 対応テストケース |
| --------------------------------------- | ---------------- |
| `weekdays.length === 0` が true のとき  | TC-07（空曜日）  |
| `weekdays.length === 0` が false のとき | TC-08〜TC-10     |

### Step 4: 未到達ブロック分析

カバレッジ計測後、未到達ブロックが発見された場合:

1. 未到達理由を分析する（dead code か・テスト不足か）
2. テスト不足の場合 → Phase 6 へ戻りテスト追加
3. dead code の場合 → Phase 8（リファクタリング）で対処

## 統合テスト連携

本 Phase はカバレッジ確認に限定され、プロダクションコードの変更は行わない。
未到達ブロックが見つかった場合のみ、Phase 6 のテスト拡充または Phase 8 のリファクタリングへ接続する。

## 多角的チェック観点

| 観点              | 確認内容                                          |
| ----------------- | ------------------------------------------------- |
| Line Coverage     | ガード処理追加行がすべて実行されていること        |
| Branch Coverage   | true / false の両方のブランチが実行されていること |
| Function Coverage | `visualConfigToCron` が 100% カバーされていること |

## 参照資料

| 資料名                     | パス                                                                         | 用途                       |
| -------------------------- | ---------------------------------------------------------------------------- | -------------------------- |
| Phase 5 Green 確認レポート | `outputs/phase-5/green-confirmation.md`                                      | 実装後 PASS 状態の確認     |
| Phase 6 テスト拡充結果     | `outputs/phase-6/test-expansion-result.md`                                   | 拡充テストケース一覧の確認 |
| coverage-standards         | `.claude/skills/task-specification-creator/references/coverage-standards.md` | カバレッジ基準             |

## サブタスク管理

| #   | サブタスク                                 | 担当   | 状態    |
| --- | ------------------------------------------ | ------ | ------- |
| 1   | カバレッジ計測コマンド実行                 | 実装者 | pending |
| 2   | Line/Branch/Function Coverage の実測値記録 | 実装者 | pending |
| 3   | ガード処理の両ブランチカバー確認           | 実装者 | pending |
| 4   | 未到達ブロック分析・対処方針決定           | 実装者 | pending |

## 成果物

| 成果物           | パス                                 | 説明                                         |
| ---------------- | ------------------------------------ | -------------------------------------------- |
| カバレッジ報告書 | `outputs/phase-7/coverage-report.md` | 実測値・未到達分析・目標達成可否を含む報告書 |

## 完了条件

- [ ] `cronConverter.ts` の Line Coverage が 90% 以上であること
- [ ] `cronConverter.ts` の Branch Coverage が 80% 以上であること
- [ ] `cronConverter.ts` の Function Coverage が 100% であること
- [ ] ガード処理ブランチ（true / false 両方）がカバーされていること
- [ ] 未到達ブロックの分析結果が記録されていること
- [ ] カバレッジ目標の達成可否が明記されていること
- [ ] `outputs/phase-7/coverage-report.md` が作成されていること

## タスク100%実行確認【必須】

- [ ] 本 Phase 内の全タスクを 100% 実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

## 次Phase

Phase 8: リファクタリング
