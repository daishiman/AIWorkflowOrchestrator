# 未タスク検出レポート（Phase 12 Task 4）

## メタ情報

| 項目       | 値                               |
| ---------- | -------------------------------- |
| 対象タスク | TASK-AGENTS-SKILLS-FULL-SYNC-001 |
| Phase      | 12                               |
| 作成日     | 2026-04-19                       |
| 方針       | 0 件でも出力必須                 |

## 本 Phase 実行時点での検出サマリ

| 優先度 | 件数 | 備考                                                                |
| ------ | ---- | ------------------------------------------------------------------- |
| HIGH   | 0    | Phase 11 で HIGH 条件に該当する事象は検出されなかった               |
| MID    | 2    | 将来的な拡張候補（本タスクのスコープ外）                            |
| LOW    | 2    | リスクは低いが記録としては残したい事項                              |
| 合計   | 4    | いずれも follow-up task 化しない（本 Phase 内で auto-gen 発動なし） |

**HIGH 0 件のため `docs/30-workflows/unassigned-task/` 配下への自動生成は発動しない。**

## MID 優先度（2 件）

### MID-1: `task-p0-05-mirror-sync-automation` との統合

| 項目           | 内容                                                                                                 |
| -------------- | ---------------------------------------------------------------------------------------------------- |
| 事象           | 本タスクは local 側（pre-push hook + session-init hook）での parity ガードのみを提供する             |
| 改善の方向     | CI 側（GitHub Actions）で `verify-skills-parity.sh` を fallback 実行し、`--no-verify` 回避不可にする |
| 関連           | `docs/30-workflows/unassigned-task/task-p0-05-mirror-sync-automation.md`                             |
| 起票タイミング | 本タスク完了後、CI 基盤整備の波に合流                                                                |

### MID-2: post-merge hook への parity check 連結

| 項目           | 内容                                                                                                                           |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| 事象           | `.claude/hooks/post-merge-index-regenerate.sh` は index 再生成のみ実施し、parity までは見ない                                  |
| 改善の方向     | post-merge で index 再生成 → parity check を直列実行し、merge 直後の drift を即時検知                                          |
| 関連           | `post-merge-index-regenerate.sh` と `sync-skills-mirror.sh` の統合（Phase 10 `final-review-result.md` の future scope と一致） |
| 起票タイミング | drift が 1 wave 以上の頻度で再発した時                                                                                         |

## LOW 優先度（2 件）

### LOW-1: worktree 並列 sync 実行時の lock 機構

| 項目           | 内容                                                                                                    |
| -------------- | ------------------------------------------------------------------------------------------------------- |
| 事象           | 複数 worktree で同時に `sync-skills-mirror.sh` を実行した場合、rsync の race condition が理論上あり得る |
| 改善の方向     | `flock` 等で exclusive lock を取得してから rsync 実行                                                   |
| リスク評価     | 現状 pre-push の直列性（1 push 1 実行）に依存しているため実害は観測されていない                         |
| 起票タイミング | 並列 worktree 運用が定着してから                                                                        |

### LOW-2: `generate-index.js` 非 deterministic 時の自動検出ガード

| 項目           | 内容                                                                                                          |
| -------------- | ------------------------------------------------------------------------------------------------------------- |
| 事象           | `generate-index.js` が将来 non-deterministic になった場合、sync 実行のたびに diff が残り parity OK にならない |
| 改善の方向     | sync の最終 `diff -qr` が 0 にならなかった場合、`generate-index.js` を 2 回連続実行して差分が同一かチェック   |
| 現状           | sync exit 1 により間接的に検知可能なため HIGH にはならない                                                    |
| 起票タイミング | 実害が発生してから                                                                                            |

## audit-unassigned-tasks.js による登録確認

```bash
$ node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js --json \
    --target-file docs/30-workflows/unassigned-task/TASK-AGENTS-SKILLS-FULL-SYNC-001.md
```

本タスクは元々 `docs/30-workflows/TASK-AGENTS-SKILLS-FULL-SYNC-001/` ディレクトリに格納され、`unassigned-task/` 配下ではない。元は `TASK-CONFLICT-PREVENT-001 Phase 12 unassigned-task-detection.md` から起票されたもので、現在は本 workflow として正式に実行中。audit script は workflow 別 directory を対象にしないため、登録確認は本 Phase 12 の成果物リスト（`outputs/phase-12/*.md`）を `phase12-task-spec-compliance-check.md` で代替する。

## HIGH 検出時の unassigned-task 自動生成フロー（本 Phase では発動なし）

仕様書 Phase 11 で定義した HIGH 条件を再確認:

| HIGH 条件                                       | Phase 11 実測          | 該当 |
| ----------------------------------------------- | ---------------------- | ---- |
| session-init の実行時間が 1 秒を超えた          | 最大 0.443s            | No   |
| `sync-skills-mirror.sh` 実行後も差分が残存する  | 最終 diff exit=0       | No   |
| pre-push hook が abort しない                   | isolated 実測で exit=1 | No   |
| mirror-only ファイルが検出され rsync 前警告なし | mirror-only 実績なし   | No   |

**いずれも該当しないため follow-up 仕様書の自動生成は実行しない。**

## Phase 12 後にも継続観察すべき観点

| 観点                           | 監視方法                                                      |
| ------------------------------ | ------------------------------------------------------------- |
| CI 側 parity fallback の必要性 | `--no-verify` バイパス事例が観測されたら MID-1 を HIGH に昇格 |
| post-merge drift 頻度          | `LOGS.md` に drift 記録が続くなら MID-2 を実施                |
| session-init timing の劣化     | `timing-measurement.txt` を次タスクで再測定し比較             |

## 総括

- HIGH 0 件 → follow-up task の自動生成なし
- MID 2 件 / LOW 2 件 → 記録のみで別ワークフローへ引き継ぎ
- 0 件記録も「未検出」を evidence として残すことで、将来の regression を早期検知できる台帳になる
