# Phase 4 Output: Test Scenarios

## 目的

6 concern の責務分離が line budget、直リンク、archive 導線、mirror parity、dependency integrity を壊していないかを検証する。

## SubAgent レーン別シナリオ

| ID    | レーン  | 対象                  | シナリオ                                                 | 判定ポイント                                                  |
| ----- | ------- | --------------------- | -------------------------------------------------------- | ------------------------------------------------------------- |
| S4-01 | Codex-A | `SKILL.md`            | entrypoint を slim 化しても family file へ遷移できる     | 500 行以内、family file 直リンクあり                          |
| S4-02 | Codex-A | `LOGS.md`             | rolling log から archive へ辿れる                        | `LOGS.md` から `logs-archive-index.md` に到達できる           |
| S4-03 | Codex-B | `patterns*.md`        | pattern family が index + detail に分割される            | `patterns.md` から 3 family file に到達できる                 |
| S4-04 | Codex-B | `phase-template*.md`  | template family が phase 別に分離される                  | `phase-templates.md` から 5 detail file に到達できる          |
| S4-05 | Codex-C | `spec-update*.md`     | Step 1 / Step 2 / validation matrix が独立する           | `spec-update-workflow.md` から child file に到達できる        |
| S4-06 | Codex-C | `phase-11-12*.md`     | screenshot guide と documentation guide が分離される     | `phase-11-12-guide.md` から Phase 11 / 12 detail へ到達できる |
| S4-07 | Codex-V | `.claude` / `.agents` | mirror 同期後も file set が一致する                      | `diff -qr` 差分 0                                             |
| S4-08 | Codex-V | dependency edge       | parent / child / archive / mirror の依存契約が閉じている | orphan file がない                                            |
| S4-09 | Codex-V | validator             | skill validator が split 後も PASS する                  | `quick_validate.js` / `validate_all.js` error 0               |
| S4-10 | Codex-V | workflow docs         | canonical root と root drift guard が保持される          | workflow 側で `.claude` 正本参照を維持する                    |

## concern ごとの重点観点

| concern                      | 重点観点                                | 理由                                |
| ---------------------------- | --------------------------------------- | ----------------------------------- |
| C1 `SKILL.md`                | line budget、直リンク、quick start      | entrypoint の過積載再発を防ぐ       |
| C2 `LOGS.md`                 | archive discoverability、rolling log 化 | 長期履歴が再肥大化しやすい          |
| C3 `patterns.md`             | index と detail の責務分離              | Phase 12 ノウハウが再混在しやすい   |
| C4 `phase-templates.md`      | Phase family 分割、naming 一貫性        | template の可読性が崩れやすい       |
| C5 `spec-update-workflow.md` | Step 1 / Step 2 / validation の分離     | Phase 12 実行時の誤更新を防ぐ       |
| C6 `phase-11-12-guide.md`    | docs-only task と UI task の分岐        | screenshot 不要タスクの誤適用を防ぐ |

## Phase 5 への引き継ぎ

1. 実装は Codex-A/B/C の 3 lane までを並列化し、mirror と validator は Codex-V で直列実行する。
2. 新規 file を追加する concern は、親 index の更新と mirror sync を同じ wave で完了させる。
3. root drift、orphan file、planned wording は Phase 9 と Phase 12 の再監査対象に残す。
