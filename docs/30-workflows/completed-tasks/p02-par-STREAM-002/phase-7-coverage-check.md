# Phase 7: カバレッジ確認

## メタ情報

| 項目       | 内容                                   |
| ---------- | -------------------------------------- |
| Phase      | 7                                      |
| タスクID   | TASK-SW-STREAM-002                     |
| 機能名     | skill-creator-handlers-progress-wiring |
| 前提Phase  | Phase 6                                |
| 後続Phase  | Phase 8                                |
| 作成日     | 2026-04-15                             |
| ステータス | pending                                |

## 目的

テストカバレッジを計測し、目標基準（Line 80%+・Branch 60%+・Function 80%+）を達成しているか確認する。
未達の場合は Phase 6 へ戻りテストを追加する。

## 実行タスク

- テストカバレッジの計測
- カバレッジ目標との比較
- 未達項目の特定（未達の場合）
- ゲート判定（PASS / 未達）

## 参照資料

| 資料名         | パス                                                                        | 用途               |
| -------------- | --------------------------------------------------------------------------- | ------------------ |
| テストファイル | `apps/desktop/src/main/ipc/__tests__/skillCreatorHandlers.progress.test.ts` | カバレッジ計測対象 |
| 実装ファイル   | `apps/desktop/src/main/ipc/skillCreatorHandlers.ts`                         | カバレッジ計測対象 |

## 実行手順

### 1. カバレッジ計測コマンド

```bash
# カバレッジ付きテスト実行
pnpm --filter @repo/desktop exec vitest run --coverage \
  src/main/ipc/__tests__/skillCreatorHandlers.progress.test.ts

# 全テストのカバレッジ確認
pnpm --filter @repo/desktop exec vitest run --coverage src/main/ipc/
```

### 2. カバレッジ目標との比較

| 指標              | 最低基準 | 推奨基準 | 計測結果 | 判定   |
| ----------------- | -------- | -------- | -------- | ------ |
| Line Coverage     | 80%      | 90%      | TBD      | 確認要 |
| Branch Coverage   | 60%      | 70%      | TBD      | 確認要 |
| Function Coverage | 80%      | 90%      | TBD      | 確認要 |

### 3. カバレッジ未達の場合の対応

未達の場合は Phase 6 へ戻り、不足しているカバレッジを補うテストを追加する。

**主な未達パターンと対応**:

| 未達パターン                              | 追加すべきテスト                                    |
| ----------------------------------------- | --------------------------------------------------- |
| `sendSkillCreatorProgress` の branch 未達 | `mainWindow.isDestroyed()` の true/false 両ケース   |
| コールバック接続の branch 未達            | コールバックが undefined の場合のエラーハンドリング |
| エラーハンドリングの branch 未達          | `createSkill` reject 時のフロー                     |

### 4. ゲート判定

- **PASS**: 全指標が最低基準以上 → Phase 8 へ進む
- **未達**: いずれかの指標が最低基準未満 → Phase 6 へ戻る

## 統合テスト連携【必須】

統合テストの再実行とゲート判定。

| 判定項目          | 基準 | 結果    |
| ----------------- | ---- | ------- |
| Line Coverage     | 80%+ | pending |
| Branch Coverage   | 60%+ | pending |
| Function Coverage | 80%+ | pending |

## 多角的チェック観点

| 観点            | チェック内容                                                   |
| --------------- | -------------------------------------------------------------- |
| Branch Coverage | `isDestroyed()` の true/false の両ブランチがテストされているか |
| 未テスト関数    | `sendSkillCreatorProgress` 自体のカバレッジが確認されているか  |
| 回帰テスト      | 拡充テスト追加後も既存テストが PASS していることを確認済みか   |

## 成果物

| 成果物             | パス                                 | 説明                               |
| ------------------ | ------------------------------------ | ---------------------------------- |
| カバレッジレポート | `outputs/phase-7/coverage-report.md` | 計測結果・目標比較・ゲート判定記録 |

## 完了条件

- [ ] カバレッジ計測が完了済み
- [ ] 全指標が最低基準（Line 80%+・Branch 60%+・Function 80%+）を満たしている
- [ ] ゲート判定が PASS
- [ ] カバレッジレポートが `outputs/phase-7/coverage-report.md` に記録されている
- [ ] 本Phase内の全タスクを100%実行完了

## サブタスク管理

1. カバレッジ計測コマンド実行
2. 目標基準との比較
3. 未達項目の特定（未達の場合）
4. ゲート判定（PASS / Phase 6 へ戻る）
5. カバレッジレポート作成

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

## 次Phase

Phase 8: リファクタリング
