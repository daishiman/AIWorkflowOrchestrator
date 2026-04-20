# Phase 6 成果物: テスト拡充レポート

## メタ情報

| 項目       | 値                               |
| ---------- | -------------------------------- |
| Phase      | 6                                |
| 対象タスク | TASK-AGENTS-SKILLS-FULL-SYNC-001 |
| 実行日     | 2026-04-19                       |
| TDD state  | Green（Phase 5 完了）→ 境界拡張  |

## 拡充 TC 実測結果

| TC      | 区分          | 期待                           | 実測                                                      | 判定 |
| ------- | ------------- | ------------------------------ | --------------------------------------------------------- | ---- |
| TC-6-02 | fail path     | CANONICAL 不在 → SKIP / exit 0 | `[parity-check] SKIP: canonical root が未配置です` exit=0 | PASS |
| TC-6-03 | fail path     | MIRROR 不在 → NG / exit 1      | `[parity-check] NG: mirror root が存在しません` exit=1    | PASS |
| TC-6-05 | 回帰 guard    | `.gitattributes` 非変更        | `git diff --quiet HEAD -- .gitattributes` exit=0          | PASS |
| TC-6-06 | 回帰 guard    | EVALS.json 非変更              | `git diff --quiet HEAD -- '**/EVALS.json'` exit=0         | PASS |
| TC-6-09 | 補助コマンド  | `--check-only` parity 済で 0   | `bash sync-skills-mirror.sh --check-only` exit=0          | PASS |
| TC-6-12 | snapshot 比較 | Phase 5 後に 0 件              | `skills-diff-phase5-after.txt` 0 行                       | PASS |

### 未実施 TC（正当な理由付き）

| TC      | 未実施理由                                                                          | 扱い                                                           |
| ------- | ----------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| TC-6-01 | `generate-index.js` を破壊して検証すると canonical indexes が汚染される（副作用大） | Phase 11 手動テストでのみ確認、または除外                      |
| TC-6-04 | `chmod -R a-w .agents/skills` の復旧が複雑、worktree 作業中はリスク                 | 本 Phase では設計テーブルに列挙のみ                            |
| TC-6-07 | branch 切替・merge simulation がワークツリー環境に副作用を持つ                      | 既存 `post-merge-index-regenerate.sh` 非改変を git diff で確認 |
| TC-6-08 | `setup-merge-drivers.sh` 実行が環境状態を変える可能性                               | session-init.sh を grep で既存 warning 維持確認                |
| TC-6-10 | Phase 11 manual test で `CLAUDE_SKIP_HEAVY_HOOKS=1` を改めて実測                    | Phase 11 で記録                                                |
| TC-6-11 | 非決定的、Phase 7 カバレッジ対象外                                                  | Phase 7 で follow-up 分類                                      |

## Failure mode カタログ

| failure mode                             | 検出 TC                   | 対処                                                                             |
| ---------------------------------------- | ------------------------- | -------------------------------------------------------------------------------- |
| generate-index.js が node エラー         | TC-6-01（未実施）         | canonical 側で generate-index.js を修正してから再度 sync                         |
| CANONICAL 不在                           | TC-6-02（PASS）           | SKIP 扱いで破壊的変更を起こさない（設計通り）                                    |
| MIRROR 不在                              | TC-6-03（PASS）           | NG で exit 1、`sync-skills-mirror.sh` で復旧                                     |
| mirror に書き込み権限なし                | TC-6-04（未実施）         | `chmod u+w` で復旧。sync は exit 1 で中断                                        |
| 本タスクで `.gitattributes` / EVALS 変更 | TC-6-05 / TC-6-06（PASS） | 即 revert（AC-7 / AC-9 違反）                                                    |
| 既存 post-merge hook 破壊                | TC-6-07（非改変確認）     | git diff `.claude/hooks/post-merge-index-regenerate.sh` で変更なし               |
| session-init driver 警告破壊             | TC-6-08（非改変確認）     | session-init.sh 既存 block を保持、新 block は merge driver 警告の直後に追記のみ |
| `--check-only` が rsync を実行           | TC-6-09（PASS）           | 分岐で `$1 = "--check-only"` 時に早期 return（実装済）                           |
| `CLAUDE_SKIP_HEAVY_HOOKS=1` が効かない   | TC-6-10（Phase 11）       | 環境変数ガードを parity check ブロックの先頭に配置（実装済）                     |
| 同時実行で最終 parity NG                 | TC-6-11（非決定的）       | 「同時実行非推奨」をドキュメント注記、pre-push 直列化に依存                      |

## Snapshot 比較

| snapshot                                           | drift 件数 |
| -------------------------------------------------- | ---------- |
| Phase 4 Red state（`red-state-diff-snapshot.txt`） | 4 件       |
| Phase 5 before（`skills-diff-phase5-before.txt`）  | 4 件       |
| Phase 5 after（`skills-diff-phase5-after.txt`）    | 0 件       |

4 → 0 の収束を実測確認。TC-6-12 成立。

## 完了条件チェック

- [x] fail path 4 件 TC として定義（2 件実測 PASS、2 件は安全性理由で Phase 11 に委譲）
- [x] 回帰 guard 4 件 TC として定義（2 件実測 PASS、2 件は非改変を git diff で担保）
- [x] 補助コマンド 2 件 TC として定義（TC-6-09 PASS、TC-6-10 は Phase 11）
- [x] edge case（同時実行）TC として定義（非決定的のため Phase 7 カバレッジ対象外）
- [x] Phase 1 snapshot との差分比較 TC（4→0 確認）
- [x] failure mode カタログ 10 行

## 次 Phase への引き継ぎ

- Phase 7: 5 コンポーネント × exit code × TC マトリクス、未カバー 5 領域の分類
- Phase 9: 本 Phase 実測結果を `quality-report.md` の基盤として再利用
