# Phase 6: テスト拡充

## メタ情報

| 項目       | 内容                                            |
| ---------- | ----------------------------------------------- |
| Phase      | 6                                               |
| 機能名     | ut-task-10a-b-008-unassigned-count-resync-guard |
| タスクID   | UT-TASK-10A-B-008                               |
| タスク名   | 未タスク件数再計算同期ガード                    |
| 前提Phase  | Phase 5                                         |
| 後続Phase  | Phase 7                                         |
| 作成日     | 2026-03-06                                      |
| ステータス | completed                                       |

## 目的

件数ドリフトだけでなく、完了済みUT混入、追加UTの反映漏れ、監査判定誤読の再発パターンを回帰テストへ拡張する。

## Atent Team（SubAgent）分担

| SubAgent | 関心ごと             | 実行順序    | 役割                                                     |
| -------- | -------------------- | ----------- | -------------------------------------------------------- |
| A        | 完了済みUT除外ケース | 先行        | `UT-TASK-10A-B-001` の完了扱いを回帰ケース化する         |
| B        | 追加UT反映ケース     | Aと並列     | `UT-TASK-10A-B-009` を含む最新状態の反映ケースを追加する |
| C        | 監査誤読ケース       | A/B後に直列 | `current` と `baseline` の誤読ケースを追加する           |
| D        | 回帰束統合           | C後に直列   | 追加ケースを回帰セットへ統合する                         |

## 実行タスク

- 完了済みUT除外ケース追加: 完了タスクが active set に残らないことを検証する
- 追加UT反映ケース追加: 新規追加UTが active set と台帳へ入ることを検証する
- 監査誤読ケース追加: `baseline` を合否に使わないことを検証する
- 回帰束統合: 追加ケースを一回の実行順へまとめる

## 参照資料

### 前Phase成果物

| 資料名                  | パス                                        | 用途                   |
| ----------------------- | ------------------------------------------- | ---------------------- |
| Phase 5 実装サマリー    | `outputs/phase-5/implementation-summary.md` | 実装差分を引き継ぐ     |
| Phase 5 変更セット計画  | `outputs/phase-5/change-set-plan.md`        | 更新対象を引き継ぐ     |
| Phase 5 active set 証跡 | `outputs/phase-5/active-id-proof.md`        | 当日有効集合を引き継ぐ |

### システム仕様（aiworkflow-requirements）

| 資料名           | パス                                                                          | 用途                                             |
| ---------------- | ----------------------------------------------------------------------------- | ------------------------------------------------ |
| タスク運用正本   | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`          | active set と残課題表の期待値を再確認する        |
| タスク運用ルール | `.claude/skills/aiworkflow-requirements/references/task-workflow-rules.md`    | `current` 判定と配置先境界を回帰ケースへ反映する |
| 品質要件         | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`   | 回帰テストの粒度を確認する                       |
| 開発ガイドライン | `.claude/skills/aiworkflow-requirements/references/development-guidelines.md` | 検証コマンドの記録粒度を確認する                 |
| 教訓正本         | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`        | 監査誤読パターンを確認する                       |

### スクリプト

| 資料名       | パス                                                                           | 用途                     |
| ------------ | ------------------------------------------------------------------------------ | ------------------------ |
| リンク検証   | `.claude/skills/task-specification-creator/scripts/verify-unassigned-links.js` | 参照切れ回帰を追加する   |
| 未タスク監査 | `.claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js`  | 誤読防止ケースを定義する |

## 実行手順

1. Phase 5 の active set 証跡を読み、回帰対象の分岐を洗い出す。
2. 完了済みUT除外ケースと追加UT反映ケースを別ケースとして定義する。
3. `--target-file` と `--diff-from HEAD` の判定差を監査ケースへ加える。
4. 回帰セットを一つの順序表へ統合する。

## 統合テスト連携

- Phase 7 は Phase 6 の回帰ケース数を基準にカバレッジを算出する。
- Phase 11 は回帰束の中から代表ケースを人手で再確認する。

## 多角的チェック観点（関心分離）

| 観点     | 確認内容                                 | 正本                     |
| -------- | ---------------------------------------- | ------------------------ |
| 完了除外 | 完了済みUTを active set へ残していないか | test-expansion-result.md |
| 追加反映 | 新規UTを見落としていないか               | regression-test.md       |
| 監査誤読 | `baseline` を合否へ使っていないか        | lessons-learned.md       |
| 実行順   | 回帰束の順番が固定されているか           | regression-test.md       |

## 成果物

| 成果物         | パス                                       | 説明                             |
| -------------- | ------------------------------------------ | -------------------------------- |
| テスト拡充結果 | `outputs/phase-6/test-expansion-result.md` | 追加ケースを記録する             |
| 回帰テスト計画 | `outputs/phase-6/regression-test.md`       | 回帰束の実行順と期待値を記録する |

## 完了条件

- [x] 完了済みUT除外ケースを追加した
- [x] 追加UT反映ケースを追加した
- [x] 監査誤読ケースを追加した
- [x] 本Phase内の全タスクを100%実行完了

## サブタスク管理

1. Phase 5 成果物の確認
2. SubAgent-A/B の並列ケース追加
3. SubAgent-C の監査ケース追加
4. SubAgent-D の統合作業
5. 成果物出力

## タスク100%実行確認【必須】

- [x] 本Phase内の全タスクを100%実行完了
- [x] 成果物テーブル記載の2ファイルを定義した
- [x] 完了除外、追加反映、監査誤読を回帰束へ追加した
- [x] Phase 7 のカバレッジ算出入力を残した

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/completed-tasks/ut-task-10a-b-008-unassigned-count-resync-guard
```

## 次のPhase

Phase 7: テストカバレッジ確認
