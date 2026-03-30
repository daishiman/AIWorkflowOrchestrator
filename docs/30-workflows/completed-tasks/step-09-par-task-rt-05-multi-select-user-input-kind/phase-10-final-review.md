# Phase 10: 最終レビュー

## メタ情報

| 項目   | 値                           |
| ------ | ---------------------------- |
| Phase  | 10                           |
| 機能名 | multi-select-user-input-kind |
| 作成日 | 2026-03-29                   |

## 目的

AC、dependency、path、validator の 4 観点で最終判定を行う。

## 実行タスク

- AC-1〜AC-4 の達成根拠を再確認する
- upstream path と downstream 再利用性を再確認する
- validator 結果に blocker がないことを確認する
- Phase 12 へ引き継ぐ MINOR を切り出す

## 参照資料

| 資料名           | パス                           | 説明      |
| ---------------- | ------------------------------ | --------- |
| Phase 7 coverage | `phase-7-coverage-check.md`    | coverage  |
| Phase 9 QA       | `phase-9-quality-assurance.md` | validator |

## 実行手順

### 最終ゲート

| 観点       | PASS 条件                                    |
| ---------- | -------------------------------------------- |
| AC         | AC-1〜AC-4 の根拠が coverage matrix で追える |
| Path       | upstream link が現配置で実在する             |
| Dependency | TASK-P0-06 が再利用可能な契約になっている    |
| Validation | task spec validator が blocker 0 である      |

## 統合テスト連携

- Phase 9 の結果を gate 入力にする
- Phase 12 の MINOR 追跡テーブルへ引き渡す

## 成果物

| 成果物              | パス                                      | 説明      |
| ------------------- | ----------------------------------------- | --------- |
| 最終レビュー仕様    | `phase-10-final-review.md`                | gate 条件 |
| final review result | `outputs/phase-10/final-review-result.md` | 判定結果  |

## 完了条件

- [ ] AC の根拠が確認されている
- [ ] path と dependency の整合が確認されている
- [ ] Phase 12 へ引き継ぐ MINOR の扱いが定義されている
- [ ] **本Phase内の全タスクを100%実行完了**
