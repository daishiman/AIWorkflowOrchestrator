# Phase 7: カバレッジ確認

## メタ情報

| 項目       | 内容                             |
| ---------- | -------------------------------- |
| Phase      | 7                                |
| タスクID   | TASK-SW-CANCEL-002               |
| 機能名     | skill-creator-cancel-preload-api |
| 前提Phase  | Phase 6                          |
| 後続Phase  | Phase 8                          |
| 作成日     | 2026-04-15                       |
| ステータス | pending                          |

## 目的

テストカバレッジを計測し、目標基準を満たしているかを確認する。

## 実行手順

### 1. カバレッジ計測

```bash
pnpm --filter @repo/desktop test --coverage -- \
  --testPathPattern="preload"
```

### 2. 対象ファイルのカバレッジ確認

- `apps/desktop/src/preload/skill-creator-api.ts` の `cancelGeneration` 追加行
- `apps/desktop/src/preload/channels.ts` の `ALLOWED_INVOKE_CHANNELS` 追加行

## カバレッジ目標

| 指標              | 最低基準 | 推奨基準 |
| ----------------- | -------- | -------- |
| Line Coverage     | 80%      | 90%      |
| Branch Coverage   | 60%      | 70%      |
| Function Coverage | 80%      | 90%      |

## 統合テスト連携【必須】

| 判定項目                     | 基準 | 結果    |
| ---------------------------- | ---- | ------- |
| Line Coverage が最低基準以上 | ≥80% | pending |
| カバレッジゲート判定完了     | 完了 | pending |

## 多角的チェック観点（AIが判断）

- [ ] `cancelGeneration` 関数が Function Coverage に含まれているか
- [ ] TC-07 のエラーパスがカバレッジに貢献しているか

## サブタスク管理

1. カバレッジ計測実行
2. 目標基準との比較
3. カバレッジレポートの成果物作成

## 成果物

| 成果物             | パス                                 | 説明           |
| ------------------ | ------------------------------------ | -------------- |
| カバレッジレポート | `outputs/phase-7/coverage-report.md` | 計測結果・判定 |

## 完了条件

- [ ] カバレッジが最低基準を満たしている
- [ ] カバレッジレポートが作成されている
- [ ] 本 Phase 内の全タスクを100%実行完了

## タスク100%実行確認【必須】

- [ ] 本 Phase 内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

## 次のPhase

Phase 8: リファクタリング
