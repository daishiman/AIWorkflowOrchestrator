# Phase 11 発見事項レポート（Blocker / HIGH / Note / Info 分類）

## 集計サマリ

| 区分    | 件数 | 対応                                    |
| ------- | ---- | --------------------------------------- |
| Blocker | 0    | —                                       |
| HIGH    | 0    | —（unassigned-task 自動生成の発動なし） |
| Note    | 2    | 記録のみ・本タスク責務外                |
| Info    | 3    | 実測値の記録                            |

## Blocker（0 件）

なし。

## HIGH（0 件）

なし。仕様書 Phase 11 に列挙されている HIGH 条件について実測評価:

| HIGH 条件                                           | 実測結果                                                      | 判定     |
| --------------------------------------------------- | ------------------------------------------------------------- | -------- |
| session-init の実行時間が 1 秒を超えた              | 最大 0.443s（Run 3 / parity NG 条件）                         | 該当せず |
| `sync-skills-mirror.sh` 実行後も差分が残存する      | シナリオ 2 で `[mirror-sync] 完了: parity OK` + diff 空       | 該当せず |
| pre-push hook が abort しない（シナリオ 3 失敗）    | isolated 実測で exit=1 / abort メッセージあり                 | 該当せず |
| mirror-only ファイルが検出され rsync 前警告が出ない | 本タスクの対象リポジトリには mirror-only ファイルが存在しない | 該当せず |

**HIGH 0 件のため `docs/30-workflows/unassigned-task/` 配下の follow-up 仕様書自動生成は実行しない。**

## Note（2 件）

### Note-1: pre-push hook の gate 順序（parity gate が末尾）

- **事象**: シナリオ 3 で full pre-push hook 経由の `git push` では exit=1 になったが、停止理由は **Phase 1 shared build が esbuild version mismatch で先に失敗**していた
  ```
  ✘ [ERROR] Cannot start service: Host version "0.27.2" does not match binary version "0.25.12"
  ❌ Phase 1 failed: shared-build
  ```
- **切り分け**:
  - parity gate block 自体は `.husky/pre-push` 末尾に配置されている
  - full hook 経由で Phase 1 / Phase 2（lint / shared-build / typecheck / tests）が全成功した場合のみ parity gate に到達する
  - isolated 実測（parity gate block 単独 `bash -c`）では exit=1 / abort メッセージ / sync 案内メッセージ を確認済 → **AC-4 のロジック要件は充足**
- **本タスクでの扱い**: 本タスクの AC-4 は「parity NG 時に push を中止、`--no-verify` 導線なし」であり、parity gate が存在して動作することで satisfy される。gate の優先順位は本タスクのスコープ外
- **esbuild 環境問題**: 開発者ローカルの `@esbuild/darwin-arm64` binary バージョン不一致で、`pnpm install` 再実行または `pnpm --force rebuild esbuild` で解消可能（本タスク責務外）
- **follow-up 候補**: 将来的に parity gate を pre-push 先頭に配置する場合は `task-skills-parity-prepush-precedence-001` として別タスク化（ただし parity check が 0.3 秒かかるため先頭配置すると "lint が通ったのに parity で弾かれる" UX になる点の設計判断必要）

### Note-2: validate-structure の既存警告（本タスク責務外）

- **事象**: `node validate-structure.js .claude/skills/aiworkflow-requirements` は exit 0 だが、`lessons-learned-*.md` 等の既存ファイルがサイズ上限警告を出している
- **本タスクでの扱い**: 本タスクは parity guard の追加のみが責務で、既存コンテンツのサイズ最適化はスコープ外
- **follow-up**: 別途 `task-aiworkflow-requirements-lessons-learned-cleanup` 相当で対応想定（未起票）

## Info（3 件 / 実測値の記録）

### Info-1: session-init.sh timing 実測値

| 条件                          | real 時間 | AC-6 基準（< 1 秒） |
| ----------------------------- | --------- | ------------------- |
| opt-out（SKIP_HEAVY_HOOKS=1） | 0.228s    | ✅                  |
| normal（parity OK 状態）      | 0.384s    | ✅                  |
| normal（parity NG 状態）      | 0.443s    | ✅                  |

parity NG 条件でも `diff -qr` の数十ミリ秒オーバーヘッドで済んでおり、1 秒基準に対して十分な margin。

### Info-2: CLAUDE_SKIP_HEAVY_HOOKS=1 の opt-out 効果

- `grep -c "parity"` = **0 件**（parity ブロック完全非実行）
- exit code = 0（hook 全体は正常終了）
- 確認: session-init.sh の parity block 先頭に配置した `if [ "${CLAUDE_SKIP_HEAVY_HOOKS:-0}" != "1" ]; then` で早期スキップされている

### Info-3: int-test-skill mirror ファイルサイズ

- `.agents/skills/int-test-skill/SKILL.md`: 1016 bytes（canonical と完全一致）
- rsync `-a` によりタイムスタンプまで完全同期

## 発見事項のスコープ境界

| 事象                                          | 本タスク内 | 別タスク        |
| --------------------------------------------- | ---------- | --------------- |
| parity gate の exit code 契約                 | ✅         | —               |
| session-init timing（1 秒未満）               | ✅         | —               |
| CLAUDE_SKIP_HEAVY_HOOKS=1 opt-out             | ✅         | —               |
| esbuild darwin-arm64 バージョン不整合         | —          | 環境 / 別 issue |
| pre-push gate の優先順位（parity を先頭に？） | —          | future scope    |
| lessons-learned-\*.md のサイズ最適化          | —          | 別 skill メンテ |

## 総括

- **Blocker 0 / HIGH 0**: Phase 12 進行可
- **Note 2**: いずれも記録のみで対応不要
- **Info 3**: 実測値の evidence 化
- `unassigned-task/` 配下の follow-up 仕様書自動生成は **不要**
