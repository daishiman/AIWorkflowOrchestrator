# Lessons Learned: Phase 12 / ライフサイクル（2026-03-21〜2026-03-25）
> 親ファイル: [lessons-learned-phase12-workflow-lifecycle.md](lessons-learned-phase12-workflow-lifecycle.md)

## 2026-03-21 TASK-IMP-RUNTIME-POLICY-CAPABILITY-BRIDGE-001

### 苦戦箇所1: `manual-test-result.md` が `not_run` のままだと Phase 11/12 completed と衝突する

| 項目       | 内容                                                                                                                                                    |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 課題       | workflow 本文と `artifacts.json` は completed でも、`outputs/phase-11/manual-test-result.md` が `not_run` のままだと manual evidence が未完了のまま残る |
| 再発条件   | non-visual task で「後で rerun する」と考え、manual result の status を更新しない                                                                       |
| 解決策     | `NON_VISUAL_FALLBACK` と blocker、代替 evidence を `manual-test-result.md` と Phase 11 本文へ同時記録した                                               |
| 標準ルール | `manual-test-result.md` が `not_run` のままなら Phase 11 / 12 を completed にしない。fallback の場合も blocker と evidence を必須記録する               |
| 関連タスク | TASK-IMP-RUNTIME-POLICY-CAPABILITY-BRIDGE-001                                                                                                           |

### 苦戦箇所2: `index.md` / `phase-*.md` / `artifacts.json` / `outputs/artifacts.json` の parity を同一ターンで閉じないと completed false positive が出る

| 項目       | 内容                                                                                                                    |
| ---------- | ----------------------------------------------------------------------------------------------------------------------- |
| 課題       | Phase status が本文と artifact inventory でずれると、completed に見えても validator が warning を返す                   |
| 再発条件   | workflow 本文と `outputs/` だけ更新し、root artifact inventory を後回しにする                                           |
| 解決策     | 4点同期を Phase 12 の必須完了条件として扱い、`validate-phase-output` の warning 0 を目標に修正した                      |
| 標準ルール | `index.md` / `phase-*.md` / `artifacts.json` / `outputs/artifacts.json` は同一ターンで同期し、partial update を残さない |
| 関連タスク | TASK-IMP-RUNTIME-POLICY-CAPABILITY-BRIDGE-001                                                                           |

### 苦戦箇所3: internal adapter と public IPC / preload contract を混同すると system spec が過大申告になる

| 項目       | 内容                                                                                                                                          |
| ---------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| 課題       | `creatorHandlers.ts` を実装した事実だけで public `skill-creator:*` contract まで更新済みと読める文面が混入した                                |
| 再発条件   | internal `ipcMain.handle()` 実装と app registration / preload 公開面を同じ「IPC更新」として扱う                                               |
| 解決策     | `creatorHandlers.ts` を internal adapter と明記し、public wiring は follow-up `UT-IMP-RUNTIME-SKILL-CREATOR-IPC-WIRING-001` に formalize した |
| 標準ルール | internal adapter 追加だけでは public IPC / preload 更新済みと記録しない。未接続なら follow-up として formalize する                           |
| 関連タスク | TASK-IMP-RUNTIME-POLICY-CAPABILITY-BRIDGE-001                                                                                                 |

### 同種課題の簡潔解決手順（3ステップ）

1. `manual-test-result.md` が `not_run` でないことを先に確認し、fallback なら blocker と代替 evidence を固定する。
2. workflow 本文、phase 本文、`artifacts.json`、`outputs/artifacts.json` を同一ターンで同期する。
3. internal IPC adapter と public preload / registration の到達面を分離し、未接続なら follow-up へ昇格する。

---

## 2026-03-22 TASK-IMP-CHAT-WORKSPACE-GUIDANCE-ACTION-WIRING-001

### 苦戦箇所1: standalone task root 移設時は parent / downstream / system spec の旧 path を同一 wave で閉じる

| 項目       | 内容                                                                                                                                                            |
| ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 課題       | Task04 root を standalone に移したのに、親 workflow index と downstream consumer の旧 nested path が残ると current canonical set が二重化する                   |
| 再発条件   | workflow root の移設を root index だけで閉じ、parent/downstream/system spec を同一 wave で更新しない                                                            |
| 解決策     | `task-workflow-completed.md` / `task-workflow-backlog.md` / `workflow-ai-runtime-execution-responsibility-realignment.md` を同時更新し、current root を固定した |
| 標準ルール | standalone root の移設は parent/downstream/system spec の旧 path を同一 wave で閉じる                                                                           |
| 関連タスク | TASK-IMP-CHAT-WORKSPACE-GUIDANCE-ACTION-WIRING-001                                                                                                              |

### 苦戦箇所2: design task でも Phase 12 の planned wording を残すと complete ではなくなる

| 項目       | 内容                                                                                                                   |
| ---------- | ---------------------------------------------------------------------------------------------------------------------- |
| 課題       | `計画済み` / `更新予定` が成果物に残ると、実更新後でも Phase 12 が未完了に見える                                       |
| 再発条件   | workflow root は closed でも、compliance / changelog / backlog / lessons が future tense のまま残る                    |
| 解決策     | workflow root を `implementation_ready`、completed ledger を `spec_created` に分離し、Phase 13 だけ blocked に固定した |
| 標準ルール | design task でも Phase 12 deferred wording を残さない                                                                  |
| 関連タスク | TASK-IMP-CHAT-WORKSPACE-GUIDANCE-ACTION-WIRING-001                                                                     |

### 苦戦箇所3: unassigned detection を backlog だけで閉じると formalize 漏れが起きる

| 項目       | 内容                                                                                           |
| ---------- | ---------------------------------------------------------------------------------------------- |
| 課題       | 未タスク化の候補を backlog に積むだけでは、workflow / lessons / task-workflow の導線が閉じない |
| 再発条件   | formalize を backlog 追加だけで済ませ、completed ledger / lessons / workflow を同時更新しない  |
| 解決策     | unassigned detection を formalize / backlog / workflow / lessons の 4点同期で扱うようにした    |
| 標準ルール | unassigned detection は formalize/backlog/workflow/lessons の 4点同期                          |
| 関連タスク | TASK-IMP-CHAT-WORKSPACE-GUIDANCE-ACTION-WIRING-001                                             |

### 苦戦箇所4: screenshot 要求がある spec_created task でも dedicated capture script を current workflow root に残す必要がある

| 項目       | 内容                                                                                                              |
| ---------- | ----------------------------------------------------------------------------------------------------------------- |
| 課題       | screenshot evidence を upstream task に流すと、current workflow root で再利用できない                             |
| 再発条件   | spec_created task で representative screenshot を別 workflow へ移す                                               |
| 解決策     | current workflow root に dedicated capture script と evidence path を残し、task root から直接追跡できるようにした |
| 標準ルール | screenshot 要求がある spec_created task でも dedicated capture script を current workflow root に残す             |
| 関連タスク | TASK-IMP-CHAT-WORKSPACE-GUIDANCE-ACTION-WIRING-001                                                                |

---

## 2026-03-21 TASK-FIX-LLM-CONFIG-PERSISTENCE

### 苦戦箇所1: persist task の Phase 11 で storage 実体を generic 名で推測すると誤る

| 項目       | 内容                                                                                                                               |
| ---------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| 課題       | manual test 文書が `electron-store` を前提にしており、実装の正本である Renderer localStorage `knowledge-studio-store` とずれていた |
| 再発条件   | persistence 系 task で storage key をコードから引かず、過去 task の generic 手順を流用する                                         |
| 解決策     | Phase 11 仕様書に actual storage key、capture script、harness route、補助キーを明記した                                            |
| 標準ルール | persist / hydration task の Phase 11 は storage key と validation entrypoint を仕様書へ固定する                                    |
| 関連タスク | TASK-FIX-LLM-CONFIG-PERSISTENCE                                                                                                    |

### 苦戦箇所2: Phase 12 narrative completed が validator 実態より先行すると false green になる

| 項目       | 内容                                                                                                                   |
| ---------- | ---------------------------------------------------------------------------------------------------------------------- |
| 課題       | implementation-guide FAIL、必須成果物不足、unassigned report のリンク欠落があっても completed と読める状態が残っていた |
| 再発条件   | guide validator / link validator / artifacts parity を最後まで待たずに changelog を閉じる                              |
| 解決策     | guide を 10/10 前提へ補完し、必須 6 成果物と validator 実行結果を compliance file に集約した                           |
| 標準ルール | Phase 12 は validator 実測値、必須 6 成果物、mirror parity の3点セットで閉じる                                         |
| 関連タスク | TASK-FIX-LLM-CONFIG-PERSISTENCE                                                                                        |

### 苦戦箇所3: current workflow だけ直しても family inventory と completed shard が stale のまま残る

| 項目       | 内容                                                                                                                                                                |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 課題       | Task03 単体の workflow は存在しても、parent workflow / artifact inventory / completed shard / lessons に反映されていないと search entrypoint から完了事実を拾えない |
| 再発条件   | same-wave sync を「関連仕様書検索結果のうち目についたものだけ」で閉じる                                                                                             |
| 解決策     | parent workflow、workflow spec、artifact inventory、completed ledger、lessons、LOGS、SKILL を同ターンで更新した                                                     |
| 標準ルール | family task を閉じるときは parent + workflow spec + inventory + completed shard + lessons + logs/skill を最小同期セットにする                                       |
| 関連タスク | TASK-FIX-LLM-CONFIG-PERSISTENCE                                                                                                                                     |

### 同種課題の簡潔解決手順（3ステップ）

1. storage key / validation entrypoint / harness route を Phase 11 仕様書へ先に固定する。
2. Phase 12 は guide validator・link validator・必須 6 成果物を先にそろえる。
3. parent workflow / inventory / completed shard / lessons / LOGS / SKILL を同じターンで更新する。

---

## 2026-03-20 TASK-IMP-EXECUTION-RESPONSIBILITY-CONTRACT-FOUNDATION-001

### 苦戦箇所1: current workflow の canonical entrypoint 不足で必要仕様を取りこぼす

| 項目       | 内容                                                                                                                                                                                                   |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 課題       | execution responsibility 系の current workflow は存在するのに、`.claude/skills/aiworkflow-requirements/` 側に旧 authmode pack への導線しかなく、必要仕様抽出時に current task の正本へ辿り着けなかった |
| 再発条件   | workflow 名を再定義したのに resource-map / task-workflow / workflow integration spec を同一 wave で更新しない                                                                                          |
| 解決策     | `workflow-ai-runtime-execution-responsibility-realignment.md` を canonical entrypoint として追加し、`resource-map.md` / `task-workflow.md` / parent workflow index の参照を同じターンで揃える          |
| 標準ルール | workflow 名変更や主語変更が入った task は、current canonical workflow spec を 1 ファイル追加し、search entrypoint を複数持たせない                                                                     |
| 関連タスク | TASK-IMP-EXECUTION-RESPONSIBILITY-CONTRACT-FOUNDATION-001                                                                                                                                              |

### 苦戦箇所2: Phase 12 実更新後も planned wording が残り完了判定を誤る

| 項目       | 内容                                                                                                                                                                                                                                     |
| ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 課題       | `.claude` 正本と workflow metadata は更新済みでも、`system-spec-update-summary.md` や `documentation-changelog.md` に `計画済み` / `更新予定` / `PRマージ後に実施` が残っていると、監査上は未完了なのに見かけ上 completed に見えてしまう |
| 再発条件   | docs-heavy task で「先に実更新、あとで成果物文面修正」の2段階運用を許す                                                                                                                                                                  |
| 解決策     | planned wording を incomplete 扱いにするルールを skill 正本へ追加し、実行コマンド・更新ファイル・blocked 条件を実績ベースで記録する                                                                                                      |
| 標準ルール | Phase 12 完了条件は「実更新ファイル一覧 + validator 結果 + planned wording 0件」の3点セットで確認する                                                                                                                                    |
| 関連タスク | TASK-IMP-EXECUTION-RESPONSIBILITY-CONTRACT-FOUNDATION-001                                                                                                                                                                                |

### 苦戦箇所3: source unassigned の stale target path と duplicate source を閉じ忘れる

| 項目       | 内容                                                                                                                                                                                                                                                                               |
| ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 課題       | source unassigned が `docs/30-workflows/ai-runtime-execution-responsibility-realignment/scope-definition.md` のような非実在 path を保持したままだと、実更新完了後も次回実行者が誤ファイルへ着手する。さらに duplicate source doc が同じ task ID で残ると、未タスクが未解決に見える |
| 再発条件   | follow-up workflow だけ completed にして、source unassigned 本文の status / actual target / workflow root を更新しない                                                                                                                                                             |
| 解決策     | actual target を Task01 `outputs/phase-1/scope-definition.md` に固定し、source unassigned 2 件へ「完了」「duplicate reference」状態と current workflow root を同一ターンで書き戻した                                                                                               |
| 標準ルール | stale target path を含む source unassigned は Phase 12 で status と target path を必ず更新し、duplicate source は新規未タスク化せず reference role を明記して閉じる                                                                                                                |
| 関連タスク | UT-EXEC-01                                                                                                                                                                                                                                                                         |

### 同種課題の簡潔解決手順（3ステップ）

1. current workflow の canonical entrypoint を追加し、resource-map / task-workflow / parent index を同時更新する。
2. `.claude` 正本を更新した同ターンで workflow 成果物を実績文へ書き換える。
3. planned wording を grep または validator でゼロ確認し、source unassigned の status / actual target / duplicate role まで更新してから Phase 12 を閉じる。

---

## 2026-03-21 TASK-IMP-RUNTIME-POLICY-CENTRALIZATION-001

### 苦戦箇所1: 設計タスクの Phase 12 完了をコード完了と誤読しやすい

| 項目       | 内容                                                                                                                                                                                                                                                            |
| ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 課題       | Task02 の Phase 12 / SKILL / LOGS には完了記録がある一方、`apps/desktop` / `packages/shared` に centralization 実装差分がなく、downstream Task03-09 も `spec_created` / `not_started` のままだった。文面だけ読むと feature 全体が完了したように誤読しやすかった |
| 再発条件   | design/spec task の close-out で、downstream implementation status と code diff 0 の事実を併記しない                                                                                                                                                            |
| 解決策     | `system-spec-update-summary.md` / workflow 正本 / implementation-guide に「spec-only close-out」「downstream 未着手」「現行コード snapshot」を同一ターンで追記した                                                                                              |
| 標準ルール | design/spec task の完了ログには `spec-only`、downstream task status、`apps/desktop` / `packages/shared` の差分有無を必ず併記する                                                                                                                                |
| 関連タスク | TASK-IMP-RUNTIME-POLICY-CENTRALIZATION-001                                                                                                                                                                                                                      |

### 苦戦箇所2: 未タスク指示書だけ作って backlog / 関連仕様書リンクを閉じ忘れる

| 項目       | 内容                                                                                                                                                                                 |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 課題       | `unassigned-task-detection.md` に 3 件の follow-up を記録しても、`task-workflow-backlog.md` と workflow 正本 / lessons への導線がなければ Phase 12 の 3ステップが未完了のまま残る    |
| 再発条件   | P3 の3ステップを「指示書作成」で止め、backlog family と関連仕様書リンク追加を次回や PR マージ時へ先送りする                                                                          |
| 解決策     | `task-workflow-backlog.md` / `workflow-ai-runtime-execution-responsibility-realignment.md` / `lessons-learned-phase12-workflow-lifecycle.md` を同ターンで更新し、3件とも導線を閉じた |
| 標準ルール | Phase 12 の未タスク formalize は「1. 指示書 2. backlog family 3. workflow/lessons 導線」の3点を同一ターンで完了する。PR マージ後対応は禁止                                           |
| 関連タスク | TASK-IMP-RUNTIME-POLICY-CENTRALIZATION-001                                                                                                                                           |

### 同種課題の簡潔解決手順（3ステップ）

1. design/spec task の close-out 時は `spec-only` と downstream 実装 status、code diff 0/有を summary と workflow 正本へ同時記録する。
2. 未タスク検出後は、指示書だけで止めず `task-workflow-backlog` と workflow/lessons への導線を同ターンで追加する。
3. planned wording と「PR マージ時に対応」を Phase 12 成果物から除去してから完了扱いにする。

### 苦戦箇所3: design close-out だけ見て current code sweep を省略すると実装 gap を取り逃がす

| 項目       | 内容                                                                                                                                                                                   |
| ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 課題       | Task02 は docs と台帳の close-out 自体は成立していたが、current code の consumer 実装と test を再確認すると centralization 実装が閉じていなかった                                      |
| 再発条件   | Phase 12 の再監査で `outputs/` と `.claude` だけを見て、composition root / IPC consumer / execute path / tests を確認しない                                                            |
| 解決策     | `skillHandlers.ts` / `agentHandlers.ts` / `aiHandlers.ts` / `RuntimeSkillCreatorFacade.ts` / shared transport / tests を監査し、高優先度 implementation closure task を formalize した |
| 標準ルール | design task の final re-audit は docs 監査だけで終えず、current code の主要 consumer とテスト実体を必ず確認する                                                                        |
| 関連タスク | TASK-IMP-RUNTIME-POLICY-CENTRALIZATION-001                                                                                                                                             |

### follow-up 導線

| タスクID                                                          | 追跡先                                                                                                                   |
| ----------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| TASK-IMP-RUNTIME-POLICY-CENTRALIZATION-IMPLEMENTATION-CLOSURE-001 | `docs/30-workflows/completed-tasks/unassigned-task/task-imp-runtime-policy-centralization-implementation-closure-001.md` |
| UT-CLEANUP-AI-CHECK-CONNECTION-001                                | `docs/30-workflows/unassigned-task/UT-CLEANUP-AI-CHECK-CONNECTION-001.md`                                                |
| UT-CLEANUP-RUNTIME-RESOLVER-001                                   | `docs/30-workflows/unassigned-task/UT-CLEANUP-RUNTIME-RESOLVER-001.md`                                                   |
| UT-DESIGN-SANITIZE-PLACEMENT-001                                  | `docs/30-workflows/unassigned-task/UT-DESIGN-SANITIZE-PLACEMENT-001.md`                                                  |

---

## 2026-03-17 TASK-SKILL-LIFECYCLE-08 仕様書作成（設計タスク Phase 1-13）

### 苦戦箇所1: docs-only タスクでの Phase 12 実更新の worktree コンフリクトリスク

| 項目         | 内容                                                                                                                                                                                                           |
| ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 課題         | worktree 環境で `.claude/skills/` を実更新すると、main ブランチの同ファイルと merge 時にコンフリクトが発生するリスクがある。このリスクを理由に Phase 12 実更新を先送りする判断が繰り返し発生した（P57 の再発） |
| 再発条件     | worktree で設計タスクを実行し、`.claude/skills/` への実更新を「merge 後でよい」と判断する                                                                                                                      |
| 解決策       | worktree でも Phase 12 完了時点で `.claude/skills/` を実更新する。コンフリクトリスクより仕様書乖離リスクの方が高い。コンフリクト発生時は merge 時に手動解消する                                                |
| 標準ルール   | Phase 12 の `.claude/skills/` 実更新は worktree 環境でも先送りしない（P57 準拠）                                                                                                                               |
| 関連パターン | P57（設計タスクにおける Phase 12 システム仕様書更新の先送りパターン）                                                                                                                                          |
| 関連タスク   | TASK-SKILL-LIFECYCLE-08                                                                                                                                                                                        |

### 苦戦箇所2: 55ファイルの成果物間の整合性維持（Phase 間参照チェイン）

| 項目       | 内容                                                                                                                                                                                                                             |
| ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 課題       | Phase 1-12 で55ファイルを生成したが、後続 Phase が前 Phase の成果物パスを参照するチェインが長くなり、N-1 / N-2 Phase の参照が壊れやすかった。Phase 5 で型名を変更した際に Phase 2 / Phase 4 の参照が更新されないケースが発生した |
| 再発条件   | 成果物数が30ファイルを超え、Phase 間の参照が3段以上の深さになる場合                                                                                                                                                              |
| 解決策     | Phase 5 以降で型名・インターフェース名を変更した場合は `grep -rn "旧名" outputs/` で全成果物の参照を検索し、同ターンで更新する                                                                                                   |
| 標準ルール | 型名・インターフェース名の変更は、成果物全体の grep 検索と参照更新を同時に行う                                                                                                                                                   |
| 関連タスク | TASK-SKILL-LIFECYCLE-08                                                                                                                                                                                                          |

### 苦戦箇所3: 並列サブエージェント間の情報断絶（P59 再発リスク）

| 項目         | 内容                                                                                                                                                                              |
| ------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| 課題         | Phase 4/5/12 を並列サブエージェントで分担した際、各エージェントが独自に成果物を生成し、後続のメインエージェントが統合する段階で件数・ステータスの不整合が発生した（P59 パターン） |
| 再発条件     | 3つ以上のサブエージェントを並列実行し、各エージェントの成果物を統合する場合                                                                                                       |
| 解決策       | 並列サブエージェントは成果物ファイルを出力し、メインエージェントが統合時に `find outputs/ -name "\*.md"                                                                           | wc -l` で件数を検証する。documentation-changelog は最後にメインエージェントが一括作成する |
| 標準ルール   | 並列エージェントの成果物統合後にメインエージェントが件数・ステータスの照合を行い、changelog は事後統合する（P59 準拠）                                                            |
| 関連パターン | P59（並列エージェント changelog 件数不整合）、P43（サブエージェント rate limit 中断）                                                                                             |
| 関連タスク   | TASK-SKILL-LIFECYCLE-08                                                                                                                                                           |

### 苦戦箇所4: Phase 12 Task 6（遵守チェックリスト）の作成漏れパターン

| 項目       | 内容                                                                                                                                       |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| 課題       | Phase 12 の Task 1-5 に注力した結果、Task 6（Phase 12 遵守チェックリスト）の作成が漏れた。再監査で初めて欠落が検出され、追加作業が発生した |
| 再発条件   | Phase 12 の Task 数が5以上で、最後の Task が「チェックリスト作成」のようなメタタスクの場合                                                 |
| 解決策     | Phase 12 開始時に Task 6（遵守チェックリスト）を最初に空ファイルで作成し、各 Task 完了ごとにチェックを記入する                             |
| 標準ルール | Phase 12 遵守チェックリストは最初に空テンプレートで作成し、逐次記入する                                                                    |
| 関連タスク | TASK-SKILL-LIFECYCLE-08                                                                                                                    |

### 同種課題の簡潔解決手順（4ステップ）

1. Phase 12 開始時に遵守チェックリスト（Task 6）を空テンプレートで先行作成する。
2. 型名・IF名の変更時は `grep -rn "旧名" outputs/` で成果物全体の参照を同ターンで更新する。
3. 並列エージェントの成果物統合はメインエージェントが件数照合し、changelog は事後一括作成する。
4. worktree 環境でも `.claude/skills/` 実更新を先送りしない（P57 準拠）。

---

