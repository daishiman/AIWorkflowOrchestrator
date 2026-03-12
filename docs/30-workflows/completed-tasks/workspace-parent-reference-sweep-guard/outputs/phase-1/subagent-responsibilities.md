# SubAgent 責務分担

| SubAgent   | 関心ごと                                                                             | 入力                                                                                                                 | 主成果物                                                     | 並列化可否                      |
| ---------- | ------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------ | ------------------------------- |
| SubAgent-A | parent pointer / completed-task pointer docs / master index / legacy index inventory | task-060, task-000, task-090, completed-task pointer docs                                                            | manifest の pointer/index 項目、status drift 一覧            | Phase 1-2 で B/C/D と並列調査可 |
| SubAgent-B | interfaces / capture script stale path                                               | `interfaces-llm.md`, `interfaces-chat-history.md`, `task-workflow.md`, `ui-ux-feature-components.md`, capture script | path drift ルール、expected path 一覧                        | Phase 1-2 で A/C/D と並列調査可 |
| SubAgent-C | mirror sync / validator contract                                                     | `.claude`, `.agents`, `diff -qr`, 新 guard script                                                                    | mirror drift ルール、CLI 出力仕様、再現コマンド              | Phase 2-4 で A/B と並列化可     |
| SubAgent-D | Phase 12 sync                                                                        | `task-workflow.md`, `ui-ux-feature-components.md`, `lessons-learned.md`, `interfaces-*`, LOGS                        | spec update summary、documentation changelog、skill feedback | Phase 2 で設計、Phase 12 で実行 |
| Lead       | concern boundary 統合                                                                | A/B/C/D の成果                                                                                                       | review gate、実装順、traceability                            | 全フェーズで直列責務            |

## ハンドオフ規則

1. A は pointer/index の expected path を B/C へ渡す。
2. B は stale path 一覧を C へ渡し、validator の forbidden pattern に落とす。
3. C は validator 出力形式を D へ渡し、Phase 12 の changelog と compliance check に反映させる。
4. D は spec 更新順と mirror sync 結果を Lead へ返し、Phase 10/12 の判定材料にする。
