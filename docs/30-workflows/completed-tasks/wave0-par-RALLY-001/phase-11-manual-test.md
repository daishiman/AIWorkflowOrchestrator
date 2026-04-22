# Phase 11: 手動テスト検証

## メタ情報

| 項目       | 内容                                    |
| ---------- | --------------------------------------- |
| Phase      | 11                                      |
| タスクID   | TASK-RALLY-001                          |
| 機能名     | skill-lifecycle-panel-dead-code-removal |
| 前提Phase  | Phase 10                                |
| 後続Phase  | Phase 12                                |
| 作成日     | 2026-04-21                              |
| ステータス | completed                               |

## 目的

NON_VISUAL task として、dead code 削除後の再現コマンド実行結果を記録し、UI変更がないことを前提に最小限の手動確認証跡を残す。スクリーンショット撮影は行わない。

## 実行タスク

- タスク1: static / regression evidence を採取する
- タスク2: NON_VISUAL 判定の根拠を明記する
- タスク3: 問題なしを含む発見事項を記録する

## テスト方式

UI/UX変更なしのため Phase 11 スクリーンショット不要

## 手動テストシナリオ

| シナリオ       | 手順                                                      | 期待結果          |
| -------------- | --------------------------------------------------------- | ----------------- |
| 静的参照確認   | `rg` で削除対象識別子の残存を確認する                     | ソース参照が 0 件 |
| 型確認         | `pnpm --filter @repo/desktop typecheck` を再実行する      | エラーなし        |
| Lint確認       | `pnpm --filter @repo/desktop lint` を再実行する           | 回帰なし          |
| 既存テスト通過 | `pnpm --filter @repo/desktop test -- SkillLifecyclePanel` | 全テスト PASS     |
| NON_VISUAL根拠 | 変更内容が dead code 削除のみであることを成果物で確認する | screenshot 不要   |

## 手動テスト実行環境

```bash
# static / regression evidence
rg -n "_handleSubmitWorkflowInput|selectedOptionId|textAnswer|secretAnswer|confirmAnswer" \
  apps/desktop/src apps/desktop/test packages
pnpm --filter @repo/desktop typecheck
pnpm --filter @repo/desktop lint

```

## 統合テスト連携

- Phase 12 は `manual-test-result.md` を primary evidence として参照する
- ランタイム問題が見つかった場合は Phase 5 または Phase 8 に差し戻す

## 参照資料

| 資料名           | パス                                              | 用途            |
| ---------------- | ------------------------------------------------- | --------------- |
| 最終レビュー結果 | `outputs/phase-10/final-review-result.md`         | Phase 10 成果物 |
| 出荷準備チェック | `outputs/phase-10/release-readiness-checklist.md` | Phase 10 成果物 |

## 成果物

| 成果物               | パス                                        | 説明                         |
| -------------------- | ------------------------------------------- | ---------------------------- |
| 手動テスト結果       | `outputs/phase-11/manual-test-result.md`    | primary evidence             |
| 手動テストチェック表 | `outputs/phase-11/manual-test-checklist.md` | 実施観点の事前/事後確認      |
| 発見課題             | `outputs/phase-11/discovered-issues.md`     | 問題なしを含む検出事項の記録 |

## 完了条件

- [x] 全手動テストシナリオを実行した
- [x] NON_VISUAL task として screenshot 不要の理由を記録した
- [x] dead code 関連識別子の残存がないことを確認した
- [x] typecheck / lint / 既存テストの回帰がないことを確認した
- [x] 成果物テーブル記載のファイルを全件生成した

## タスク100%実行確認【必須】

- [x] 本Phase内の全タスクを100%実行完了
- [x] 成果物テーブル記載のファイルを全件生成

## 次のPhase

Phase 12: ドキュメント更新
