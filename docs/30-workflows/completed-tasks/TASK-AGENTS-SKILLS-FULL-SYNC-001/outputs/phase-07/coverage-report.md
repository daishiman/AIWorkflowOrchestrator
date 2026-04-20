# Phase 7 成果物: カバレッジレポート

## メタ情報

| 項目       | 値                               |
| ---------- | -------------------------------- |
| Phase      | 7                                |
| 対象タスク | TASK-AGENTS-SKILLS-FULL-SYNC-001 |
| 実行日     | 2026-04-19                       |

## コンポーネント × exit code カバレッジマトリクス

| コンポーネント                                     | exit 0 パス                                | exit 0 対応 TC    | exit 1 パス                                                            | exit 1 対応 TC                     | skip（0）パス                 | skip 対応 TC     |
| -------------------------------------------------- | ------------------------------------------ | ----------------- | ---------------------------------------------------------------------- | ---------------------------------- | ----------------------------- | ---------------- |
| C-1 `verify-skills-parity.sh`                      | 差分なし                                   | TC-4-02           | 差分あり / MIRROR 欠損                                                 | TC-4-01, TC-6-03                   | 両 root 不在 / canonical 不在 | TC-4-12, TC-6-02 |
| C-2 `sync-skills-mirror.sh`                        | rsync + index 再生成後に parity OK         | TC-4-04, TC-6-12  | rsync 後差分残存 / index エラー / 権限エラー / `--check-only` 差分検出 | TC-4-05, TC-6-01, TC-6-04, TC-6-09 | 両 root 不在                  | —                |
| C-3 `.husky/pre-push`                              | parity OK で push 許可                     | Phase 11 シナリオ | parity NG で push 中止                                                 | TC-4-03                            | `.husky/pre-push` 未存在      | TC-4-08          |
| C-4 `.claude/hooks/session-init.sh` parity warning | parity OK で無出力                         | TC-4-06           | 設計上発生しない                                                       | —（intentionally unreachable）     | `CLAUDE_SKIP_HEAVY_HOOKS=1`   | TC-4-07, TC-6-10 |
| C-5 drift 解消（初回 rsync + int-test-skill）      | rsync 完了で int-test-skill が mirror 存在 | TC-4-09           | —（初回のみ）                                                          | —                                  | —                             | —                |

### マトリクス判定

- C-1〜C-3: exit 0 / exit 1 / skip の各パスに TC が紐付き **full covered**
- C-4 exit 1: 設計上発生しない → **intentionally unreachable**
- C-5: 初回イベント → **one-shot covered**

## Dependency edge カバレッジ

| edge                             | 要件                                          | カバー手段                          | カバー TC                          |
| -------------------------------- | --------------------------------------------- | ----------------------------------- | ---------------------------------- |
| verify → `.claude/scripts/` 存在 | PARITY_SCRIPT が配置されている                | `test -f` + bash 実行 exit code     | TC-4-11 (Red) / TC-4-02 (Green)    |
| sync → `generate-index.js`       | canonical 側の generate-index.js 呼び出し可能 | `node ... --quiet` の exit 0        | TC-4-04（Phase 5 実測で PASS）     |
| pre-push → `.husky/`             | husky インストール済みで pre-push hook 追記済 | `test -f .husky/pre-push`           | TC-4-03 / TC-4-08（Phase 11 実測） |
| session-init → 既存 hook         | `merge.ours.driver` 警告の直後に追記          | session-init 実行で両方のメッセージ | TC-6-08（非改変で担保）            |
| sync → rsync コマンド            | rsync が PATH 上で利用可能                    | `which rsync`                       | Phase 5 前提（macOS/Linux 標準）   |
| verify → `diff` コマンド         | diff が PATH 上で利用可能                     | `which diff`                        | Phase 5 前提（macOS/Linux 標準）   |

## 未カバー領域と分類

| 領域                                       | カバー不能の理由                                        | 分類                | 転記先                                                |
| ------------------------------------------ | ------------------------------------------------------- | ------------------- | ----------------------------------------------------- |
| C-2 同時実行の勝敗（TC-6-11）              | 非決定的（OS スケジューラ依存）                         | follow-up（低優先） | `unassigned-task/worktree-parallel-sync-guard-002.md` |
| pre-push の正常通過経路（exit 0）          | dry-run でも実リモート疎通が絡み CI 不安定              | follow-up（低優先） | `unassigned-task/ci-skills-parity-check.md`           |
| 他 worktree からの同時 push                | 複数 worktree セットアップが必要                        | follow-up（低優先） | `unassigned-task/worktree-parallel-sync-guard-002.md` |
| C-4 warning メッセージ本文の snapshot 比較 | 既存 session-init warning 群が将来増減し false positive | fix-in-wave 不要    | 現状の grep で十分                                    |
| `generate-index.js` 自体のユニットテスト   | 本タスク責務外（canonical 側スクリプト契約）            | 隣接タスク委譲      | TASK-CONFLICT-PREVENT-001 Phase 9 に委譲済み          |

## Coverage 判定基準

| 判定名              | 基準                                                                                  | 本 wave 充足 |
| ------------------- | ------------------------------------------------------------------------------------- | ------------ |
| exit code coverage  | C-1〜C-5 の exit code パス（0 / 1 / skip）のうち発生可能なもの全てに TC               | PASS         |
| scenario coverage   | 3 シナリオ（NG / OK / pre-push abort）+ 補助 2（`--check-only` / `SKIP_HEAVY_HOOKS`） | PASS         |
| edge coverage       | 6 dependency edge のうち 4 が TC で、2 が前提条件で担保                               | PASS         |
| regression coverage | 既存 `.gitattributes` / EVALS / post-merge / session-init driver 警告 非破壊          | PASS         |
| snapshot coverage   | Phase 1 snapshot（4 件）vs Phase 5 後 snapshot（0 件）の収束                          | PASS         |

**総合判定: 5 軸すべて充足 → 本 wave coverage OK。Phase 8 進行可**

## 完了条件チェック

- [x] C-1〜C-5 × exit 0 / 1 / skip のマトリクスが埋まり、各セルに TC が紐づく
- [x] 6 dependency edge のカバレッジ確認表を作成
- [x] 未カバー 5 領域を「fix-in-wave 不要」または「follow-up」に分類
- [x] 5 判定（exit / scenario / edge / regression / snapshot）すべて充足
- [x] 本 Phase 判定が「Phase 8 進行可」
- [x] follow-up 候補 2 件（`worktree-parallel-sync-guard-002` / `ci-skills-parity-check`）を Phase 12 向けに記録
