# Phase 12: 30思考法 + エレガント検証 監査

## 目的

close-out 文書、コード、ledger、system spec 参照の間に残っていた漏れを、
30種の思考法で再点検し、反映先まで追跡可能にする。

## 思考法マトリクス

| 思考法               | 発見                                                                       | 判断                                         | 反映先                                                            |
| -------------------- | -------------------------------------------------------------------------- | -------------------------------------------- | ----------------------------------------------------------------- |
| 批判的思考           | parity PASS 主張が mirror 実体と不一致                                     | PASS 条件を実体一致へ修正                    | `outputs/artifacts.json`, `phase12-task-spec-compliance-check.md` |
| 演繹思考             | verifier FAIL なら 4条件 PASS は成立しない                                 | 必須セクションを補完する                     | `phase-4`〜`phase-13`                                             |
| 帰納的思考           | stale 記述はすべて「rerun不可」系に集中                                    | current-turn 実測へ置換する                  | `index.md`, `phase-7`, `phase-9`, `phase-11`                      |
| アブダクション       | follow-up open 記述と実装済みコードが矛盾                                  | historical / current facts の混線と仮説化    | `quality-report.md`, `final-review-result.md`                     |
| 垂直思考             | validator error を順に潰せば close-out 品質が上がる                        | 構造欠落を優先修正                           | `phase-4`〜`phase-13`                                             |
| 要素分解             | 問題は構造・事実・台帳・参照の4群                                          | 修正対象を4群に分解                          | 本監査全体                                                        |
| MECE                 | 漏れ検出対象を文書/コード/ledger/spec に分割                               | 網羅漏れ防止                                 | `documentation-changelog.md`                                      |
| 2軸思考              | historical vs current / local vs repository-wide                           | 粒度を混ぜない                               | `system-spec-update-summary.md`                                   |
| プロセス思考         | Phase 11/12 証跡不足が validator FAIL を誘発                               | checklist と discovered を追加               | `outputs/phase-11/*`                                              |
| メタ思考             | 「CANCEL-002 単体 close-out」と「cancel chain 全体 current facts」が別文脈 | 文脈を明示する                               | `index.md`, `system-spec-update-summary.md`                       |
| 抽象化思考           | 根本は close-out 文書 stale 化                                             | 個別誤記ではなく同期原則の問題と捉える       | `LOGS.md`                                                         |
| ダブル・ループ思考   | 文書を直すだけでは再発する                                                 | validator 実測と no-op 記録を残す            | `phase12-task-spec-compliance-check.md`                           |
| ブレインストーミング | 修正案は parity同期、ledger同期、30思考法記録など複数                      | 影響が局所なものを同 wave で採用             | 本監査全体                                                        |
| 水平思考             | Phase 12 に監査成果物を1枚追加して証跡化                                   | `recheck-multithinking-audit.md` を追加      | 本ファイル                                                        |
| 逆説思考             | 「follow-up open」のままでもコードは完了している                           | stale spec 整理問題として切り出す            | `unassigned-task-detection.md`                                    |
| 類推思考             | 他 task の Phase 12 監査成果物パターンを流用                               | 監査専用 md を追加                           | 本ファイル                                                        |
| if思考               | このまま放置すると今後も PASS 誤認が続く                                   | 今回の wave で validator PASS まで持っていく | `verification-report.md` 再生成前提                               |
| 素人思考             | 初見だと `p05-par-CANCEL-002` 参照を正と誤認する                           | ledger を現行 path へ直す                    | `completed-tasks/TASK-SW-CANCEL-002.md`                           |
| システム思考         | workflow / outputs / completed-tasks / system spec が連鎖                  | 個別修正でなく連携修正が必要                 | 本監査全体                                                        |
| 因果関係分析         | old path 参照が index から再利用を壊す                                     | legacy index も修正対象に含める              | `skill-create-flow-gaps/index.md`                                 |
| 因果ループ           | stale docs が誤読を生み、さらに stale updates を招く                       | 同期の起点を root inventory に固定           | `artifacts.json`, `outputs/artifacts.json`                        |
| トレードオン思考     | 003/004 を今 turn で close-out するのは大きい                              | まず p02 の誤記是正を優先                    | `unassigned-task-detection.md`                                    |
| プラスサム思考       | docs 修正と小さな code drift 修正は両立可能                                | comment / hook 契約も同時改善                | `channels.ts`, `useCancelGeneration.ts`                           |
| 価値提案思考         | 一番価値が高いのは「誤判定しない close-out」                               | validator PASS と traceability を優先        | `phase12-task-spec-compliance-check.md`                           |
| 戦略的思考           | no-op と actual update を分けると将来監査が軽い                            | system spec は no-op 記録に留める            | `system-spec-update-summary.md`                                   |
| why思考              | なぜ FAIL かを掘ると構造欠落と stale facts に収束                          | それ以外の修正は従属項目                     | 本監査全体                                                        |
| 改善思考             | drift は残さず current-turn で解消できる                                   | `channels.ts` コメントを修正                 | `channels.ts`                                                     |
| 仮説思考             | hook の fire-and-forget が lessons とズレる                                | await 可能シグネチャへ寄せる                 | `useCancelGeneration.ts`                                          |
| 論点思考             | 今回の真の論点は「何が正本で何が現況か」                                   | root/mirror/spec/ledger を同期               | 本監査全体                                                        |
| KJ法                 | 個別症状を束ねると「構造」「事実」「参照」「運用」の4群                    | changelog と summary に反映                  | `documentation-changelog.md`, `system-spec-update-summary.md`     |

## エレガント検証

- 不要な複雑性: historical facts と current facts の混線を解き、二重説明を削減した
- 冗長・重複: mirror inventory を root inventory と同粒度に揃え、説明差分を減らした
- 全体調和: workflow 本体、outputs、legacy index、completed ledger が同じ現行 path を指す状態へ寄せた
- 残課題: `p03-seq-CANCEL-003` / `p04-seq-CANCEL-004` の legacy workflow spec close-out は別 wave で整理余地がある
