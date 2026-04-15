# Phase 9: 品質保証

## メタ情報

| 項目       | 内容                      |
| ---------- | ------------------------- |
| Phase      | 9                         |
| Phase名    | 品質保証                  |
| 対象タスク | TASK-CI-FUTURE-005        |
| 前提Phase  | Phase 8: リファクタリング |
| 次Phase    | Phase 10: 最終レビュー    |
| ステータス | pending                   |
| 作成日     | 2026-04-15                |

## 目的

成果物一覧の充足性・計測結果の整合性・判定根拠の妥当性を一括判定する。

## 実行タスク

- Task 1: 成果物充足性チェック
- Task 2: 計測結果の整合性チェック
- Task 3: 判定根拠の妥当性確認
- Task 4: 条件付き QA
- Task 5: QA 判定

### Task 1: 成果物充足性チェック

| 必須成果物                              | 存在確認 | 内容確認 |
| --------------------------------------- | -------- | -------- |
| `outputs/phase-1/requirements.md`       | ✅ / ❌  | ✅ / ❌  |
| `outputs/phase-2/design.md`             | ✅ / ❌  | ✅ / ❌  |
| `outputs/phase-3/review.md`             | ✅ / ❌  | ✅ / ❌  |
| `outputs/phase-4/test-plan.md`          | ✅ / ❌  | ✅ / ❌  |
| `outputs/phase-5/measurement-result.md` | ✅ / ❌  | ✅ / ❌  |
| `outputs/phase-6/test-expansion.md`     | ✅ / ❌  | ✅ / ❌  |
| `outputs/phase-7/coverage-report.md`    | ✅ / ❌  | ✅ / ❌  |
| `outputs/phase-8/refactoring-notes.md`  | ✅ / ❌  | ✅ / ❌  |

### Task 2: 計測結果の整合性チェック

`outputs/phase-5/measurement-result.md` に以下が記録されていることを確認：

| 必須記録項目                    | 確認結果 |
| ------------------------------- | -------- |
| 計測 Run ID                     | ✅ / ❌  |
| 計測日時                        | ✅ / ❌  |
| 最大キューイング時間（秒）      | ✅ / ❌  |
| 判定結果（継続 or 16 への戻し） | ✅ / ❌  |
| 判定根拠                        | ✅ / ❌  |
| 単一 Run 計測の限界と許容根拠   | ✅ / ❌  |

### Task 3: 判定根拠の妥当性確認

| 確認項目                                         | 判定    |
| ------------------------------------------------ | ------- |
| 計測 Run が TASK-CI-OPT-001 マージ後のものである | ✅ / ❌ |
| 計測 Run が main ブランチのものである            | ✅ / ❌ |
| シャード数が 17 の Run で計測している            | ✅ / ❌ |
| 閾値（60 秒）との比較が正確である                | ✅ / ❌ |
| TASK-CI-OPT-001 CI-M-01 解決の根拠が明確である   | ✅ / ❌ |

### Task 4: 条件付き QA（キューイング > 60 秒の場合）

| 確認項目                                     | 確認方法                                 |
| -------------------------------------------- | ---------------------------------------- |
| `.github/workflows/ci.yml` の変更が正確      | `grep "shard:" .github/workflows/ci.yml` |
| `matrix.shard` が 16 要素である              | 変更後の ci.yml を確認                   |
| `--shard=N/17` の記述が全て `/16` に変更済み | `grep "shard=" .github/workflows/ci.yml` |
| Lint エラーがない                            | `pnpm lint`                              |
| 変更 PR の CI が全て PASS                    | `gh pr checks`                           |

### Task 5: QA 判定

| 判定カテゴリ | 件数   | 内容   |
| ------------ | ------ | ------ |
| CRITICAL     | \_\_\_ | \_\_\_ |
| MAJOR        | \_\_\_ | \_\_\_ |
| MINOR        | \_\_\_ | \_\_\_ |

**判定**: PASS / FAIL（FAIL の場合は Phase 8 に差し戻し）

## 参照資料

| 資料名                   | パス                                    |
| ------------------------ | --------------------------------------- |
| Phase 5 成果物           | `outputs/phase-5/measurement-result.md` |
| Phase 7 カバレッジ報告   | `outputs/phase-7/coverage-report.md`    |
| Phase 8 リファクタリング | `outputs/phase-8/refactoring-notes.md`  |

## 統合テスト連携

- 前Phase の成果物を受け取り、次Phase へ引き継ぐ
- この Phase の成果物は次Phase の検証入力になる

## 成果物

| 成果物      | パス                           | 説明                               |
| ----------- | ------------------------------ | ---------------------------------- |
| QA レポート | `outputs/phase-9/qa-report.md` | 成果物充足性・整合性・判定根拠確認 |

## 完了条件

- [ ] 全必須成果物（Phase 1-8）の存在と内容が確認されている
- [ ] `measurement-result.md` の全必須記録項目が確認されている
- [ ] 判定根拠の妥当性が確認されている
- [ ] 条件付き QA（該当する場合）が実施されている
- [ ] QA 判定が PASS である
- [ ] 本 Phase 内の全タスクを 100% 実行完了

## タスク 100% 実行確認【必須】

- [ ] 本 Phase 内の全タスクを 100% 実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.json が更新されている

## 次 Phase

→ [Phase 10: 最終レビュー](./phase-10-final-review.md)
