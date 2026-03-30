# TASK-P0-04: ManifestLoader デフォルト起動パス基盤の整理 - タスク実行仕様書

## メタ情報

| 項目       | 値                                                                              |
| ---------- | ------------------------------------------------------------------------------- |
| タスクID   | TASK-P0-04                                                                      |
| 機能名     | manifest-loader-default-startup                                                 |
| 作成日     | 2026-03-29                                                                      |
| 配置       | `docs/30-workflows/completed-tasks/task-p0-04-manifest-loader-default-startup/` |
| 現在の状態 | Phase 1-12 完了、Phase 13 は `blocked`                                          |

## 一次結論

- 本ブランチの実変更は `constants.ts` への `SKILL_CREATOR_MANIFEST_PATH` / `resolveDefaultManifestPath()` 追加と、`ManifestLoader.production-manifest.test.ts` の 25 テスト整備である。
- `RuntimeSkillCreatorFacade.loadWorkflowManifest()` 自体は未変更であり、runtime pipeline への自動組み込みまでを本タスク完了として記録してはいけない。
- よって本仕様書は「デフォルト起動そのもの」ではなく、「デフォルト起動の前提になる manifest path 解決基盤と検証証跡」を正本として扱う。

## エレガント改善

- 論点を「起動統合」から「path 解決基盤」に絞り、変更差分と仕様書のズレを解消した。
- workflow root 欠落を補い、`index.md` / `phase-*.md` / `artifacts.json` / `outputs/phase-*/*.md` の構造を再構成した。
- Phase 12 の欠落物を補完し、implementation guide・system spec sync・compliance-check を追加した。
- 完了済みと downstream を分離し、TASK-P0-05 に残る責務を未混在化した。

## 30種の思考法サマリー

| 思考法               | 改善示唆                                                           |
| -------------------- | ------------------------------------------------------------------ |
| 批判的思考           | 「自動起動実装済み」という記述はコード差分と矛盾していた           |
| 演繹思考             | 変更ファイルが2件なら実装責務も2件に閉じるべき                     |
| 帰納的思考           | 既存 completed-task 正例は workflow root と Phase 12 完備を持つ    |
| アブダクション       | 欠落 root は移設途中のドリフトが原因と推定できる                   |
| 垂直思考             | まず validator failure をゼロにするのが最短だった                  |
| 要素分解             | root 構造欠落、事実不整合、Phase 12 欠落に分解した                 |
| MECE                 | 構造・内容・close-out を重複なく整理した                           |
| 2軸思考              | 「実装済み/未実装」×「local/root sync 済/未済」で判断した          |
| プロセス思考         | Phase 1-12 の入力と出力を current facts へ戻した                   |
| メタ思考             | 仕様書自身が validator 対象である点を再優先した                    |
| 抽象化思考           | 本質を「manifest default path contract」に抽象化した               |
| ダブル・ループ思考   | 文章修正ではなく workflow root 設計自体を是正した                  |
| ブレインストーミング | root md だけ直す案、outputsだけ直す案、両方直す案を比較した        |
| 水平思考             | 既存 completed-task 正例から必要最小の構造を転用した               |
| 逆説思考             | 完了扱いを弱めることで全体の整合性を上げた                         |
| 類推思考             | P0-03 / SDK系 completed task の close-out 形を参考にした           |
| if思考               | facade まで変更していたら Step 2 の仕様更新範囲は広がっていた      |
| 素人思考             | 「結局どのファイルが変わったのか」が一読で分かる形に戻した         |
| システム思考         | task spec、outputs、validator、completed ledger を一系として扱った |
| 因果関係分析         | root 欠落が verify failure を生み、false green を誘発していた      |
| 因果ループ           | incomplete close-out が次の spec drift を増幅するループを断った    |
| トレードオン思考     | 詳細の多さより current facts の正確さを優先した                    |
| プラスサム思考       | validator 合格と読みやすさを同時に満たす薄い root を採った         |
| 価値提案思考         | 次の担当者が「何が完了し何が残るか」を迷わないことを価値に置いた   |
| 戦略的思考           | downstream TASK-P0-05 の責務を侵食しない線で close-out した        |
| why思考              | なぜズレたかを「移設後の構造欠落」として明文化した                 |
| 改善思考             | 既存 outputs を捨てず、誤記だけを current facts へ再同期した       |
| 仮説思考             | implementation-guide validator 追加で Phase 12 が閉じると仮定した  |
| 論点思考             | 主論点は runtime hookup ではなく helper/test foundation だった     |
| KJ法                 | 指摘を「構造」「事実」「close-out」「evidence」に束ねた            |

## 参照

- workflow root: `docs/30-workflows/completed-tasks/task-p0-04-manifest-loader-default-startup/`
- 実装差分: `apps/desktop/src/main/services/skill/constants.ts`, `apps/desktop/src/main/services/runtime/__tests__/ManifestLoader.production-manifest.test.ts`
- downstream: TASK-P0-05（runtime pipeline への組み込み）
