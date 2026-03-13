# Phase 12 スキルフィードバック

## 総評

`aiworkflow-requirements` と `task-specification-creator` は、Phase 1-3 の設計固定と Phase 11/12 の validator 条件整理に有効だった。特に screenshot validator の literal 見出し要件は再利用価値が高い。

task-061 全体を通じて、overlay 方式の選択（新規 ViewType 不追加）・既存 IPC チャンネルの再利用・GENERIC_NAMES 正規化の 3 点が設計上の強みとなった。これらの決定は Phase 1-3 のスキル参照によって早期に固定できた。

## 良かった点

| 項目                   | 理由                                                                       |
| ---------------------- | -------------------------------------------------------------------------- |
| progressive disclosure | 必要な reference だけを読めた                                              |
| Phase 11/12 guide      | screenshot と documentation の必須条件を早期に固定できた                   |
| compliance template    | Phase 12 の Task 12-1〜12-5 を 1 ファイルへ集約できた                      |
| Phase 4 のテスト設計   | 受け入れ基準 26 項目を先に固定したことで、Phase 5 実装の迷いが最小化された |

## 改善したい点

| 項目                                    | 提案                                                                                                                                                                          |
| --------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `validate-phase-output.js` の help 不足 | `--help` を実装して引数誤用を減らす                                                                                                                                           |
| coverage 指針                           | mock が強い task で file 単位 coverage が欠けるときの扱いを guide に追加する                                                                                                  |
| dual root sync                          | `.claude` と `.agents` の canonical / mirror ルールを guide の先頭に置き、完了判定は `diff -qr` 実行結果つきで残す                                                            |
| visual / non-visual ID 管理             | screenshot TC (`TC-*`) と keyboard / dismiss などの非視覚確認 (`NV-*` or automated test) を同じ ID 空間で混在させないルールを guide に追加する                                |
| Phase 11 pre-flight                     | Phase 10 checklist と `outputs/phase-4/test-cases.md` の TC-ID が同義かを capture 前に突合する pre-flight を guide に明記する                                                 |
| follow-up unassigned task drift check   | 既存未タスクを流用する時は、`docs/30-workflows/unassigned-task/` 配下の `2.2` / `3.1` / `3.5` / 検証手順が current contract を向いているかを確認するルールを guide に追加する |

## 今回の再監査で分かったこと

今回のズレは「TC が足りない」のではなく、「同じ TC-ID に別シナリオを割り当てた」ことが原因だった。

- `TC-11-04` はもともと Step 4 の `system` preview を含む visual case であり、Phase 11 screenshot 6 件の中で既に担保されていた
- `TC-11-07` は Phase 4 の test-cases と Phase 10/12 の narrative で別の意味に再利用され、手動テスト欠落のように見えていた
- その結果、Phase 12 成果物が「未実施評価」を記録していたが、実際にはドキュメント drift だった

今回の修正では、visual TC を `TC-11-01..06` に固定し、dismiss / ESC 系は automated test と非視覚確認へ分離した。

## 次回へ残すメモ

- screenshot validator は `phase-11-manual-test.md` の literal 見出し依存が強い。見出し名変更時はバリデーション失敗を想定すること。
- worktree では build と screenshot 前に native dependency を点検したほうが安定する。
- `system` preview のような split-theme surface は、primary text を gradient の dark half へ直接載せないこと。
- Phase 11 担当者は screenshot capture 前に Phase 4 test-cases と Phase 10 checklist の TC-ID が同義かを突合すること。
- Phase 12 担当者は「新規未タスク 0 件」でも、関連する既存 unassigned task の配置と contract drift を確認すること。
