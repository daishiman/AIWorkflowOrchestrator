# Lessons Learned: Phase 12 / ワークフロー / ライフサイクル

> 親仕様書: [lessons-learned.md](lessons-learned.md)
> 役割: Phase 12 ドキュメント管理、ワークフロー運用、スキルライフサイクル設計に関する教訓
> 分割元: [lessons-learned-current.md](lessons-learned-current.md)

## メタ情報

| 項目     | 値                                                                     |
| -------- | ---------------------------------------------------------------------- |
| 正本     | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md` |
| 目的     | Phase 12/ワークフロー/ライフサイクルに関する教訓を集約                 |
| スコープ | Phase 12 成果物管理、並列エージェント、未タスク管理、設計タスク運用    |
| 対象読者 | AIWorkflowOrchestrator 開発者                                          |

---

## 変更履歴

| 日付 | バージョン | 変更内容 |
|------|-----------|----------|
| 2026-03-26 | 1.8.0 | TASK-SDK-01 manifest-contract-foundation の Phase 12 教訓2件を追加 |
| 2026-03-23 | 1.7.0 | TASK-IMP-CHATPANEL-REVIEW-HARNESS-ALIGNMENT-001 教訓3件を追加（L-CHRHA-001〜003） |
| 2026-03-21 | 1.6.0 | TASK-FIX-LLM-CONFIG-PERSISTENCE の Phase 11/12 教訓3件を追加 |
| 2026-03-21 | 1.5.0 | TASK-FIX-LLM-SELECTOR-INLINE-GUIDANCE の Phase 12 教訓4件を追加 |
| 2026-03-21 | 1.5.2 | TASK-IMP-RUNTIME-POLICY-CAPABILITY-BRIDGE-001 の Phase 12 教訓3件を追加 |
| 2026-03-21 | 1.5.1 | TASK-IMP-RUNTIME-POLICY-CENTRALIZATION-001 最終再監査の教訓1件を追加 |
| 2026-03-21 | 1.5.0 | TASK-IMP-RUNTIME-POLICY-CENTRALIZATION-001 の Phase 12 close-out 教訓2件を追加 |

| 2026-03-20 | 1.4.0 | TASK-IMP-EXECUTION-RESPONSIBILITY-CONTRACT-FOUNDATION-001 の Phase 12 教訓2件を追加 |
| 2026-03-18 | 1.3.0 | TASK-SKILL-LIFECYCLE-08 仕様書作成4件 + 再監査3件を lessons-learned-current.md から移動 |
| 2026-03-18 | 1.2.0 | TASK-SKILL-LIFECYCLE-02 の苦戦箇所3件追加（P50 既実装検出 / P4+P43 テスト数値伝達ミス / P4 Mirror Sync 早期完了記載）。合計5件 |
| 2026-03-18 | 1.1.0 | TASK-SKILL-LIFECYCLE-02 の苦戦箇所2件（P31 Zustand 個別セレクタ / P39 happy-dom fireEvent）を追加 |
| 2026-03-17 | 1.0.0 | lessons-learned-current.md から分割作成 |

---

## 2026-03-26 TASK-SDK-01 manifest-contract-foundation

### 苦戦箇所1: foundation / internal-contract task は Step 2 の本文追記が不要でも、Step 1 と skill sync を省略できない

| 項目 | 内容 |
| --- | --- |
| 課題 | manifest foundation の型・loader 契約は system spec 正本へ既に反映済みだったが、「追記不要」を「Phase 12 作業不要」と誤読しやすかった |
| 再発条件 | internal contract task で `interfaces-*` / `architecture-*` に current facts が既にあり、Phase 12 を completed ledger と lessons なしで閉じる |
| 解決策 | Step 2 no-op の根拠を `system-spec-update-summary.md` と `documentation-changelog.md` に残し、completed ledger / lessons / LOGS / SKILL 更新を同一ターンで完了した |
| 標準ルール | domain spec 本文が既に current でも、Step 1-A〜1-G と skill sync は必須。Step 2 は「更新なし」ではなく「no-op 根拠付き完了」として扱う |
| 関連タスク | TASK-SDK-01 |

### 苦戦箇所2: test runner の環境 blocker は新規未タスク化より先に既存 follow-up と重複確認する

| 項目 | 内容 |
| --- | --- |
| 課題 | `Vitest + esbuild` の起動失敗を見つけた時、新規未タスクを毎回作ると native binary / worktree guard の既存台帳と重複しやすい |
| 再発条件 | code/typecheck は完了しているが test runner が環境要因で落ち、既存 backlog を検索せずに follow-up を新設する |
| 解決策 | native binary / worktree guard 系の既存未タスクを検索し、今回差分が同種 blocker なら重複作成せず evidence だけ current workflow へ記録した |
| 標準ルール | Phase 12 で環境 blocker を見つけたら、まず既存 `unassigned-task/` と lessons を検索し、重複しない場合のみ新規 formalize する |
| 関連タスク | TASK-SDK-01 |

### 同種課題の簡潔解決手順（3ステップ）

1. Step 2 対象の system spec 本文が既に current かを先に確認し、no-op なら根拠を Phase 12 成果物へ明記する。
2. Step 1-A〜1-G、completed ledger、lessons、LOGS、SKILL を同一ターンで閉じる。
3. test/environment blocker は既存未タスクとの重複検索を先に行い、重複しない時だけ新規 formalize する。

---

## 2026-03-21 TASK-IMP-RUNTIME-POLICY-CAPABILITY-BRIDGE-001

### 苦戦箇所1: `manual-test-result.md` が `not_run` のままだと Phase 11/12 completed と衝突する

| 項目 | 内容 |
| --- | --- |
| 課題 | workflow 本文と `artifacts.json` は completed でも、`outputs/phase-11/manual-test-result.md` が `not_run` のままだと manual evidence が未完了のまま残る |
| 再発条件 | non-visual task で「後で rerun する」と考え、manual result の status を更新しない |
| 解決策 | `NON_VISUAL_FALLBACK` と blocker、代替 evidence を `manual-test-result.md` と Phase 11 本文へ同時記録した |
| 標準ルール | `manual-test-result.md` が `not_run` のままなら Phase 11 / 12 を completed にしない。fallback の場合も blocker と evidence を必須記録する |
| 関連タスク | TASK-IMP-RUNTIME-POLICY-CAPABILITY-BRIDGE-001 |

### 苦戦箇所2: `index.md` / `phase-*.md` / `artifacts.json` / `outputs/artifacts.json` の parity を同一ターンで閉じないと completed false positive が出る

| 項目 | 内容 |
| --- | --- |
| 課題 | Phase status が本文と artifact inventory でずれると、completed に見えても validator が warning を返す |
| 再発条件 | workflow 本文と `outputs/` だけ更新し、root artifact inventory を後回しにする |
| 解決策 | 4点同期を Phase 12 の必須完了条件として扱い、`validate-phase-output` の warning 0 を目標に修正した |
| 標準ルール | `index.md` / `phase-*.md` / `artifacts.json` / `outputs/artifacts.json` は同一ターンで同期し、partial update を残さない |
| 関連タスク | TASK-IMP-RUNTIME-POLICY-CAPABILITY-BRIDGE-001 |

### 苦戦箇所3: internal adapter と public IPC / preload contract を混同すると system spec が過大申告になる

| 項目 | 内容 |
| --- | --- |
| 課題 | `creatorHandlers.ts` を実装した事実だけで public `skill-creator:*` contract まで更新済みと読める文面が混入した |
| 再発条件 | internal `ipcMain.handle()` 実装と app registration / preload 公開面を同じ「IPC更新」として扱う |
| 解決策 | `creatorHandlers.ts` を internal adapter と明記し、public wiring は follow-up `UT-IMP-RUNTIME-SKILL-CREATOR-IPC-WIRING-001` に formalize した |
| 標準ルール | internal adapter 追加だけでは public IPC / preload 更新済みと記録しない。未接続なら follow-up として formalize する |
| 関連タスク | TASK-IMP-RUNTIME-POLICY-CAPABILITY-BRIDGE-001 |

### 同種課題の簡潔解決手順（3ステップ）

1. `manual-test-result.md` が `not_run` でないことを先に確認し、fallback なら blocker と代替 evidence を固定する。
2. workflow 本文、phase 本文、`artifacts.json`、`outputs/artifacts.json` を同一ターンで同期する。
3. internal IPC adapter と public preload / registration の到達面を分離し、未接続なら follow-up へ昇格する。

---

## 2026-03-22 TASK-IMP-CHAT-WORKSPACE-GUIDANCE-ACTION-WIRING-001

### 苦戦箇所1: standalone task root 移設時は parent / downstream / system spec の旧 path を同一 wave で閉じる

| 項目 | 内容 |
| --- | --- |
| 課題 | Task04 root を standalone に移したのに、親 workflow index と downstream consumer の旧 nested path が残ると current canonical set が二重化する |
| 再発条件 | workflow root の移設を root index だけで閉じ、parent/downstream/system spec を同一 wave で更新しない |
| 解決策 | `task-workflow-completed.md` / `task-workflow-backlog.md` / `workflow-ai-runtime-execution-responsibility-realignment.md` を同時更新し、current root を固定した |
| 標準ルール | standalone root の移設は parent/downstream/system spec の旧 path を同一 wave で閉じる |
| 関連タスク | TASK-IMP-CHAT-WORKSPACE-GUIDANCE-ACTION-WIRING-001 |

### 苦戦箇所2: design task でも Phase 12 の planned wording を残すと complete ではなくなる

| 項目 | 内容 |
| --- | --- |
| 課題 | `計画済み` / `更新予定` が成果物に残ると、実更新後でも Phase 12 が未完了に見える |
| 再発条件 | workflow root は closed でも、compliance / changelog / backlog / lessons が future tense のまま残る |
| 解決策 | workflow root を `implementation_ready`、completed ledger を `spec_created` に分離し、Phase 13 だけ blocked に固定した |
| 標準ルール | design task でも Phase 12 deferred wording を残さない |
| 関連タスク | TASK-IMP-CHAT-WORKSPACE-GUIDANCE-ACTION-WIRING-001 |

### 苦戦箇所3: unassigned detection を backlog だけで閉じると formalize 漏れが起きる

| 項目 | 内容 |
| --- | --- |
| 課題 | 未タスク化の候補を backlog に積むだけでは、workflow / lessons / task-workflow の導線が閉じない |
| 再発条件 | formalize を backlog 追加だけで済ませ、completed ledger / lessons / workflow を同時更新しない |
| 解決策 | unassigned detection を formalize / backlog / workflow / lessons の 4点同期で扱うようにした |
| 標準ルール | unassigned detection は formalize/backlog/workflow/lessons の 4点同期 |
| 関連タスク | TASK-IMP-CHAT-WORKSPACE-GUIDANCE-ACTION-WIRING-001 |

### 苦戦箇所4: screenshot 要求がある spec_created task でも dedicated capture script を current workflow root に残す必要がある

| 項目 | 内容 |
| --- | --- |
| 課題 | screenshot evidence を upstream task に流すと、current workflow root で再利用できない |
| 再発条件 | spec_created task で representative screenshot を別 workflow へ移す |
| 解決策 | current workflow root に dedicated capture script と evidence path を残し、task root から直接追跡できるようにした |
| 標準ルール | screenshot 要求がある spec_created task でも dedicated capture script を current workflow root に残す |
| 関連タスク | TASK-IMP-CHAT-WORKSPACE-GUIDANCE-ACTION-WIRING-001 |

---

## 2026-03-21 TASK-FIX-LLM-CONFIG-PERSISTENCE

### 苦戦箇所1: persist task の Phase 11 で storage 実体を generic 名で推測すると誤る

| 項目 | 内容 |
| --- | --- |
| 課題 | manual test 文書が `electron-store` を前提にしており、実装の正本である Renderer localStorage `knowledge-studio-store` とずれていた |
| 再発条件 | persistence 系 task で storage key をコードから引かず、過去 task の generic 手順を流用する |
| 解決策 | Phase 11 仕様書に actual storage key、capture script、harness route、補助キーを明記した |
| 標準ルール | persist / hydration task の Phase 11 は storage key と validation entrypoint を仕様書へ固定する |
| 関連タスク | TASK-FIX-LLM-CONFIG-PERSISTENCE |

### 苦戦箇所2: Phase 12 narrative completed が validator 実態より先行すると false green になる

| 項目 | 内容 |
| --- | --- |
| 課題 | implementation-guide FAIL、必須成果物不足、unassigned report のリンク欠落があっても completed と読める状態が残っていた |
| 再発条件 | guide validator / link validator / artifacts parity を最後まで待たずに changelog を閉じる |
| 解決策 | guide を 10/10 前提へ補完し、必須 6 成果物と validator 実行結果を compliance file に集約した |
| 標準ルール | Phase 12 は validator 実測値、必須 6 成果物、mirror parity の3点セットで閉じる |
| 関連タスク | TASK-FIX-LLM-CONFIG-PERSISTENCE |

### 苦戦箇所3: current workflow だけ直しても family inventory と completed shard が stale のまま残る

| 項目 | 内容 |
| --- | --- |
| 課題 | Task03 単体の workflow は存在しても、parent workflow / artifact inventory / completed shard / lessons に反映されていないと search entrypoint から完了事実を拾えない |
| 再発条件 | same-wave sync を「関連仕様書検索結果のうち目についたものだけ」で閉じる |
| 解決策 | parent workflow、workflow spec、artifact inventory、completed ledger、lessons、LOGS、SKILL を同ターンで更新した |
| 標準ルール | family task を閉じるときは parent + workflow spec + inventory + completed shard + lessons + logs/skill を最小同期セットにする |
| 関連タスク | TASK-FIX-LLM-CONFIG-PERSISTENCE |

### 同種課題の簡潔解決手順（3ステップ）

1. storage key / validation entrypoint / harness route を Phase 11 仕様書へ先に固定する。
2. Phase 12 は guide validator・link validator・必須 6 成果物を先にそろえる。
3. parent workflow / inventory / completed shard / lessons / LOGS / SKILL を同じターンで更新する。

---

## 2026-03-20 TASK-IMP-EXECUTION-RESPONSIBILITY-CONTRACT-FOUNDATION-001

### 苦戦箇所1: current workflow の canonical entrypoint 不足で必要仕様を取りこぼす

| 項目 | 内容 |
| --- | --- |
| 課題 | execution responsibility 系の current workflow は存在するのに、`.claude/skills/aiworkflow-requirements/` 側に旧 authmode pack への導線しかなく、必要仕様抽出時に current task の正本へ辿り着けなかった |
| 再発条件 | workflow 名を再定義したのに resource-map / task-workflow / workflow integration spec を同一 wave で更新しない |
| 解決策 | `workflow-ai-runtime-execution-responsibility-realignment.md` を canonical entrypoint として追加し、`resource-map.md` / `task-workflow.md` / parent workflow index の参照を同じターンで揃える |
| 標準ルール | workflow 名変更や主語変更が入った task は、current canonical workflow spec を 1 ファイル追加し、search entrypoint を複数持たせない |
| 関連タスク | TASK-IMP-EXECUTION-RESPONSIBILITY-CONTRACT-FOUNDATION-001 |

### 苦戦箇所2: Phase 12 実更新後も planned wording が残り完了判定を誤る

| 項目 | 内容 |
| --- | --- |
| 課題 | `.claude` 正本と workflow metadata は更新済みでも、`system-spec-update-summary.md` や `documentation-changelog.md` に `計画済み` / `更新予定` / `PRマージ後に実施` が残っていると、監査上は未完了なのに見かけ上 completed に見えてしまう |
| 再発条件 | docs-heavy task で「先に実更新、あとで成果物文面修正」の2段階運用を許す |
| 解決策 | planned wording を incomplete 扱いにするルールを skill 正本へ追加し、実行コマンド・更新ファイル・blocked 条件を実績ベースで記録する |
| 標準ルール | Phase 12 完了条件は「実更新ファイル一覧 + validator 結果 + planned wording 0件」の3点セットで確認する |
| 関連タスク | TASK-IMP-EXECUTION-RESPONSIBILITY-CONTRACT-FOUNDATION-001 |

### 同種課題の簡潔解決手順（3ステップ）

1. current workflow の canonical entrypoint を追加し、resource-map / task-workflow / parent index を同時更新する。
2. `.claude` 正本を更新した同ターンで workflow 成果物を実績文へ書き換える。
3. planned wording を grep または validator でゼロ確認してから Phase 12 を閉じる。

---

## 2026-03-21 TASK-IMP-RUNTIME-POLICY-CENTRALIZATION-001

### 苦戦箇所1: 設計タスクの Phase 12 完了をコード完了と誤読しやすい

| 項目 | 内容 |
| --- | --- |
| 課題 | Task02 の Phase 12 / SKILL / LOGS には完了記録がある一方、`apps/desktop` / `packages/shared` に centralization 実装差分がなく、downstream Task03-09 も `spec_created` / `not_started` のままだった。文面だけ読むと feature 全体が完了したように誤読しやすかった |
| 再発条件 | design/spec task の close-out で、downstream implementation status と code diff 0 の事実を併記しない |
| 解決策 | `system-spec-update-summary.md` / workflow 正本 / implementation-guide に「spec-only close-out」「downstream 未着手」「現行コード snapshot」を同一ターンで追記した |
| 標準ルール | design/spec task の完了ログには `spec-only`、downstream task status、`apps/desktop` / `packages/shared` の差分有無を必ず併記する |
| 関連タスク | TASK-IMP-RUNTIME-POLICY-CENTRALIZATION-001 |

### 苦戦箇所2: 未タスク指示書だけ作って backlog / 関連仕様書リンクを閉じ忘れる

| 項目 | 内容 |
| --- | --- |
| 課題 | `unassigned-task-detection.md` に 3 件の follow-up を記録しても、`task-workflow-backlog.md` と workflow 正本 / lessons への導線がなければ Phase 12 の 3ステップが未完了のまま残る |
| 再発条件 | P3 の3ステップを「指示書作成」で止め、backlog family と関連仕様書リンク追加を次回や PR マージ時へ先送りする |
| 解決策 | `task-workflow-backlog.md` / `workflow-ai-runtime-execution-responsibility-realignment.md` / `lessons-learned-phase12-workflow-lifecycle.md` を同ターンで更新し、3件とも導線を閉じた |
| 標準ルール | Phase 12 の未タスク formalize は「1. 指示書 2. backlog family 3. workflow/lessons 導線」の3点を同一ターンで完了する。PR マージ後対応は禁止 |
| 関連タスク | TASK-IMP-RUNTIME-POLICY-CENTRALIZATION-001 |

### 同種課題の簡潔解決手順（3ステップ）

1. design/spec task の close-out 時は `spec-only` と downstream 実装 status、code diff 0/有を summary と workflow 正本へ同時記録する。
2. 未タスク検出後は、指示書だけで止めず `task-workflow-backlog` と workflow/lessons への導線を同ターンで追加する。
3. planned wording と「PR マージ時に対応」を Phase 12 成果物から除去してから完了扱いにする。

### 苦戦箇所3: design close-out だけ見て current code sweep を省略すると実装 gap を取り逃がす

| 項目 | 内容 |
| --- | --- |
| 課題 | Task02 は docs と台帳の close-out 自体は成立していたが、current code の consumer 実装と test を再確認すると centralization 実装が閉じていなかった |
| 再発条件 | Phase 12 の再監査で `outputs/` と `.claude` だけを見て、composition root / IPC consumer / execute path / tests を確認しない |
| 解決策 | `skillHandlers.ts` / `agentHandlers.ts` / `aiHandlers.ts` / `RuntimeSkillCreatorFacade.ts` / shared transport / tests を監査し、高優先度 implementation closure task を formalize した |
| 標準ルール | design task の final re-audit は docs 監査だけで終えず、current code の主要 consumer とテスト実体を必ず確認する |
| 関連タスク | TASK-IMP-RUNTIME-POLICY-CENTRALIZATION-001 |

### follow-up 導線

| タスクID | 追跡先 |
| --- | --- |
| TASK-IMP-RUNTIME-POLICY-CENTRALIZATION-IMPLEMENTATION-CLOSURE-001 | `docs/30-workflows/unassigned-task/task-imp-runtime-policy-centralization-implementation-closure-001.md` |
| UT-CLEANUP-AI-CHECK-CONNECTION-001 | `docs/30-workflows/unassigned-task/UT-CLEANUP-AI-CHECK-CONNECTION-001.md` |
| UT-CLEANUP-RUNTIME-RESOLVER-001 | `docs/30-workflows/unassigned-task/UT-CLEANUP-RUNTIME-RESOLVER-001.md` |
| UT-DESIGN-SANITIZE-PLACEMENT-001 | `docs/30-workflows/unassigned-task/UT-DESIGN-SANITIZE-PLACEMENT-001.md` |

---

## 2026-03-17 TASK-SKILL-LIFECYCLE-08 仕様書作成（設計タスク Phase 1-13）

### 苦戦箇所1: docs-only タスクでの Phase 12 実更新の worktree コンフリクトリスク

| 項目 | 内容 |
| --- | --- |
| 課題 | worktree 環境で `.claude/skills/` を実更新すると、main ブランチの同ファイルと merge 時にコンフリクトが発生するリスクがある。このリスクを理由に Phase 12 実更新を先送りする判断が繰り返し発生した（P57 の再発） |
| 再発条件 | worktree で設計タスクを実行し、`.claude/skills/` への実更新を「merge 後でよい」と判断する |
| 解決策 | worktree でも Phase 12 完了時点で `.claude/skills/` を実更新する。コンフリクトリスクより仕様書乖離リスクの方が高い。コンフリクト発生時は merge 時に手動解消する |
| 標準ルール | Phase 12 の `.claude/skills/` 実更新は worktree 環境でも先送りしない（P57 準拠） |
| 関連パターン | P57（設計タスクにおける Phase 12 システム仕様書更新の先送りパターン） |
| 関連タスク | TASK-SKILL-LIFECYCLE-08 |

### 苦戦箇所2: 55ファイルの成果物間の整合性維持（Phase 間参照チェイン）

| 項目 | 内容 |
| --- | --- |
| 課題 | Phase 1-12 で55ファイルを生成したが、後続 Phase が前 Phase の成果物パスを参照するチェインが長くなり、N-1 / N-2 Phase の参照が壊れやすかった。Phase 5 で型名を変更した際に Phase 2 / Phase 4 の参照が更新されないケースが発生した |
| 再発条件 | 成果物数が30ファイルを超え、Phase 間の参照が3段以上の深さになる場合 |
| 解決策 | Phase 5 以降で型名・インターフェース名を変更した場合は `grep -rn "旧名" outputs/` で全成果物の参照を検索し、同ターンで更新する |
| 標準ルール | 型名・インターフェース名の変更は、成果物全体の grep 検索と参照更新を同時に行う |
| 関連タスク | TASK-SKILL-LIFECYCLE-08 |

### 苦戦箇所3: 並列サブエージェント間の情報断絶（P59 再発リスク）

| 項目 | 内容 |
| --- | --- |
| 課題 | Phase 4/5/12 を並列サブエージェントで分担した際、各エージェントが独自に成果物を生成し、後続のメインエージェントが統合する段階で件数・ステータスの不整合が発生した（P59 パターン） |
| 再発条件 | 3つ以上のサブエージェントを並列実行し、各エージェントの成果物を統合する場合 |
| 解決策 | 並列サブエージェントは成果物ファイルを出力し、メインエージェントが統合時に `find outputs/ -name "*.md" | wc -l` で件数を検証する。documentation-changelog は最後にメインエージェントが一括作成する |
| 標準ルール | 並列エージェントの成果物統合後にメインエージェントが件数・ステータスの照合を行い、changelog は事後統合する（P59 準拠） |
| 関連パターン | P59（並列エージェント changelog 件数不整合）、P43（サブエージェント rate limit 中断） |
| 関連タスク | TASK-SKILL-LIFECYCLE-08 |

### 苦戦箇所4: Phase 12 Task 6（遵守チェックリスト）の作成漏れパターン

| 項目 | 内容 |
| --- | --- |
| 課題 | Phase 12 の Task 1-5 に注力した結果、Task 6（Phase 12 遵守チェックリスト）の作成が漏れた。再監査で初めて欠落が検出され、追加作業が発生した |
| 再発条件 | Phase 12 の Task 数が5以上で、最後の Task が「チェックリスト作成」のようなメタタスクの場合 |
| 解決策 | Phase 12 開始時に Task 6（遵守チェックリスト）を最初に空ファイルで作成し、各 Task 完了ごとにチェックを記入する |
| 標準ルール | Phase 12 遵守チェックリストは最初に空テンプレートで作成し、逐次記入する |
| 関連タスク | TASK-SKILL-LIFECYCLE-08 |

### 同種課題の簡潔解決手順（4ステップ）

1. Phase 12 開始時に遵守チェックリスト（Task 6）を空テンプレートで先行作成する。
2. 型名・IF名の変更時は `grep -rn "旧名" outputs/` で成果物全体の参照を同ターンで更新する。
3. 並列エージェントの成果物統合はメインエージェントが件数照合し、changelog は事後一括作成する。
4. worktree 環境でも `.claude/skills/` 実更新を先送りしない（P57 準拠）。

---

## 2026-03-17 TASK-SKILL-LIFECYCLE-08 再監査（Phase 11/12 実績同期）

### 苦戦箇所1: 実更新済みなのに成果物文書が「計画」記述のまま残る

| 項目 | 内容 |
| --- | --- |
| 課題 | `system-spec-update-summary.md` と `documentation-changelog.md` が計画文言のままで、実更新済みの `.claude/skills/*` と整合しなかった |
| 解決策 | 文書を実績形式へ全面更新し、実際に更新したファイル群と validator 結果を記録した |
| 標準ルール | Phase 12 完了前に「実更新ファイル一覧 + 検証結果 + planned wording 0件」を同一ターンで確定する |

### 苦戦箇所2: 設計タスクでも screenshot 要求に対する証跡不足

| 項目 | 内容 |
| --- | --- |
| 課題 | docs-only 前提で進めた結果、Phase 11 の TC-ID と screenshot 証跡が不足して validator が失敗した |
| 解決策 | dedicated capture script を作成し、TC-11-01〜03 の screenshot と metadata を再生成した |
| 標準ルール | 設計タスクでもユーザーが画面検証を要求した場合は screenshot 取得を必須にし、`validate-phase11-screenshot-coverage` を完了ゲートに置く |

### 苦戦箇所3: 未タスク台帳のリンク切れが後段で一括失敗を誘発

| 項目 | 内容 |
| --- | --- |
| 課題 | `task-workflow.md` の `unassigned-task/` 参照切れ12件で `verify-unassigned-links` が失敗した |
| 解決策 | 欠落12件を即時復旧し、TASK-08由来の4件を新規 formalize して台帳を同時更新した |
| 標準ルール | 未タスクの新規/移設時は `verify-unassigned-links` を即時実行し、リンク切れ0件を確認してから Phase 12 を閉じる |

---

## 2026-03-16 TASK-SKILL-LIFECYCLE-06

### 苦戦箇所1: 設計タスクでのシステム仕様書更新先送り（P57）

| 項目 | 内容 |
| --- | --- |
| 課題 | 設計タスク（型定義・契約定義のみ）では「`.claude/skills/` の実更新は PR 作成時に実施」と先送りし、`system-spec-update-summary.md` に計画文だけを記録した。Phase 12 完了条件を満たさなかった |
| 再発条件 | 「プロダクションコードがないから仕様書更新は後でよい」と判断する |
| 解決策 | 設計タスクでも Phase 12 完了時点で `.claude/skills/` を実更新する。worktree 環境でのコンフリクトリスクより、仕様書と実装の乖離リスクの方が高い |
| 標準ルール | Phase 12 は実績ログのみを残し、計画文は残さない（TASK-SKILL-LIFECYCLE-05 苦戦箇所6 の再発） |
| 関連パターン | P57（新規）、P26（システム仕様書更新遅延） |
| 関連タスク | TASK-SKILL-LIFECYCLE-06 |

### 苦戦箇所2: 設計タスクを理由とした未タスク指示書の配置省略（P58）

| 項目 | 内容 |
| --- | --- |
| 課題 | 「設計タスクだから」という例外判断で `docs/30-workflows/completed-tasks/step-04-par-task-09-slide-ai-runtime-alignment/unassigned-task/` への独立指示書ファイルの作成を省略した。「本レポート内で完了」という代替措置では、後続の監査ツールが指示書パスを参照できず不整合が発生する |
| 再発条件 | タスク種別を理由に P3 の3ステップを例外扱いにする |
| 解決策 | 設計タスクの未タスクであっても独立した指示書ファイルを `docs/30-workflows/completed-tasks/step-04-par-task-09-slide-ai-runtime-alignment/unassigned-task/` に作成する |
| 標準ルール | P3（1.指示書作成 → 2.task-workflow 登録 → 3.関連仕様書リンク追加）に例外はない |
| 関連パターン | P58（新規）、P3（未タスク管理の3ステップ不完全）、P38（未タスク配置ディレクトリ間違い） |
| 関連タスク | TASK-SKILL-LIFECYCLE-06 |

### 苦戦箇所3: 並列エージェント分担による documentation-changelog 件数不整合（P59）

| 項目 | 内容 |
| --- | --- |
| 課題 | documentation-changelog.md に「Task 4 検出件数: 0件」と記載されたが、実際の `unassigned-task-detection.md` では8件検出されていた。Phase 12 を複数の並列エージェントで分担した結果、changelog 作成エージェントと未タスク検出エージェントの情報が断絶した |
| 再発条件 | 並列エージェントで分担し、changelog を各エージェントが個別に記録する |
| 解決策 | documentation-changelog.md は全 Task 完了後にメインエージェントが一括作成し、`unassigned-task-detection.md` の検出件数と照合してから記録する |
| 標準ルール | changelog は「事後統合」する。並列エージェントの中間報告をそのまま changelog に転記しない |
| 関連パターン | P59（新規）、P4（早期完了記載）、P43（サブエージェント中断）、P51（サブエージェント早期完了記載） |
| 関連タスク | TASK-SKILL-LIFECYCLE-06 |

### 同種課題の簡潔解決手順（3ステップ）

1. Phase 12 開始時に「設計タスク / 実装タスク」に関わらず `.claude/skills/` の実更新を必須とし、計画文ではなく実績ログのみを記録する。
2. 未タスク検出は P3 の3ステップを必ず完遂し、タスク種別を理由に例外判断をしない。
3. documentation-changelog はメインエージェントが最終統合する。並列エージェントの分担結果を `unassigned-task-detection.md` の件数と照合してから記録する。

---

## 2026-03-16 TASK-SKILL-LIFECYCLE-07

### 苦戦箇所1: Phase 12 サブエージェントが「設計タスク範囲外」として実ファイル更新を保留する

| 項目 | 内容 |
| --- | --- |
| 課題 | Phase 12 の Step 1-A〜Step 2 で、サブエージェントが「設計タスクなので実ファイル更新は実装タスクで行う」と判断し、更新計画のみ記録して実ファイルへの反映を行わなかった |
| 再発条件 | 設計タスク（spec_created）で Phase 12 を実行する場合に、「設計 = ファイル変更不要」と誤解する |
| 解決策 | 設計タスクでも Phase 12 の Step 1-A（タスク完了記録）、Step 1-C（関連タスクテーブル）、Step 2（システム仕様更新）は実ファイルへの書き込みが必須。「更新計画の記録」は成果物にならない |
| 標準ルール | Phase 12 のシステム仕様書更新は、タスク種別（設計/実装）に関わらず実ファイル変更を必ず伴う |
| 関連タスク | TASK-SKILL-LIFECYCLE-07 |

### 苦戦箇所2: Phase 3 MINOR 4件の追跡フローが Phase 横断で見失われる

| 項目 | 内容 |
| --- | --- |
| 課題 | Phase 3 で検出された MINOR 4件が Phase 5→9→10 を横断する過程で、追跡マトリクスを作成しなかったため対応状況の確認に時間がかかった |
| 再発条件 | Phase 3 の MINOR 指摘が4件以上で、複数 Phase にまたがる修正が必要な場合 |
| 解決策 | Phase 5 完了時点で「Phase 3 MINOR 追跡マトリクス」を作成し、各指摘の対応状況（対応済み/未対応/Phase 10 に持ち越し）を明示する |
| 標準ルール | Phase 3 の MINOR が3件以上の場合は Phase 5 完了時に追跡マトリクスを作成する |
| 関連タスク | TASK-SKILL-LIFECYCLE-07 |

### 苦戦箇所3: バックグラウンドエージェントの TaskOutput timeout パターン

| 項目 | 内容 |
| --- | --- |
| 課題 | 並列実行したバックグラウンドエージェントが10分 timeout で結果取得に失敗したが、実際には成果物ファイルの生成は完了していた |
| 再発条件 | 大量の成果物を生成する Phase（Phase 4/5/12）をバックグラウンドエージェントで実行した場合 |
| 解決策 | timeout 後は `find` / `ls` で成果物ファイルの存在を直接確認する。TaskOutput の成功/失敗だけで判断しない |
| 標準ルール | バックグラウンドエージェント timeout 後は成果物ファイルの存在確認を優先する |
| 関連タスク | TASK-SKILL-LIFECYCLE-07 |

### 苦戦箇所4: コンテキストウィンドウ圧縮で前セッションのエージェント結果が消失する

| 項目 | 内容 |
| --- | --- |
| 課題 | 並列エージェントの結果をメモリ上で保持したが、コンテキストウィンドウ圧縮により前セッションの結果が参照不能になった |
| 再発条件 | 長時間セッションで並列エージェントを多用し、結果をファイル出力せずメモリのみで保持した場合 |
| 解決策 | 並列エージェントの結果は必ず成果物ファイルとして出力し、後続 Phase ではファイルから読み取る |
| 標準ルール | 並列エージェントは成果物ファイル出力を優先し、結果参照はファイルベースで行う |
| 関連タスク | TASK-SKILL-LIFECYCLE-07 |

### 同種課題の簡潔解決手順（4ステップ）

1. 設計タスクの Phase 12 でも実ファイル更新を必ず実施する。「更新計画の記録」だけでは成果物にならない。
2. Phase 3 MINOR が3件以上の場合は Phase 5 完了時に追跡マトリクスを作成し、各指摘の対応状況を明示する。
3. バックグラウンドエージェント timeout 後は `find`/`ls` で成果物存在を直接確認する。
4. 並列エージェントの結果は成果物ファイルに出力し、コンテキスト消失に備える。

---

## 2026-03-15 TASK-SKILL-LIFECYCLE-05

### 苦戦箇所1: Phase 11 の必須成果物が揃っておらず screenshot coverage validator が失敗する

| 項目 | 内容 |
| --- | --- |
| 課題 | `manual-test-result.md` のみで運用し、`manual-test-checklist.md` と `screenshot-plan.json` が欠落した状態で再監査に進んでしまった |
| 再発条件 | 「スクリーンショットがあるから十分」と判断し、validator 前提ファイルを確認しない |
| 解決策 | `outputs/phase-11/` を `checklist/result/plan/screenshots` の4点セットで再構成し、TC-11-01〜05 の証跡を 1:1 で再紐付けした |
| 標準ルール | Phase 11 完了判定は `validate-phase11-screenshot-coverage` PASS を必須にし、必須ファイル欠落を残さない |

### 苦戦箇所2: docs-heavy task の画面検証が build 依存で停止する

| 項目 | 内容 |
| --- | --- |
| 課題 | current build での capture が環境要因で不安定なとき、画面検証の証跡収集が止まりやすい |
| 再発条件 | fallback 経路を事前定義せず、実画面 capture 成功だけを前提に運用する |
| 解決策 | source screenshot を current workflow に集約し、review board 1件を current workflow で新規 capture、metadata で source と用途を明記した |
| 標準ルール | docs-heavy + screenshot要求時は review board fallback を許容し、source / review board / metadata を同時に記録する |

### 苦戦箇所3: implementation-guide の literal 要件漏れで Phase 12 が失敗する

| 項目 | 内容 |
| --- | --- |
| 課題 | Part 1 の「なぜ先行」と Part 2 の「使用例」「エッジケース」が欠けると validator で fail する |
| 再発条件 | 内容は充実していても、validator が見る literal 見出し・語句を満たさない |
| 解決策 | Part 1 冒頭に why-first を追加し、Part 2 に API 使用例セクションとエッジケースセクションを明示追加した |
| 標準ルール | implementation-guide は内容品質だけでなく validator literal 互換を同時に満たす |

### 苦戦箇所4: Record パターンでの ScoringGate 網羅性保証

| 項目 | 内容 |
| --- | --- |
| 課題 | switch 文で ScoringGate の4段階を分岐しようとしたが、新しい段階が追加された場合にコンパイルエラーにならない。exhaustive check の `default: never` パターンも検討したが、静的マッピングの方が安全だった |
| 再発条件 | ユニオン型の分岐に switch 文を使い、exhaustive check を忘れる |
| 解決策 | `Record<ScoringGate, CTAVisibility>` で全キーの定義を型レベルで強制する。キーが不足するとコンパイルエラーになるため、網羅性が保証される |
| 標準ルール | ユニオン型の全ケース網羅には `Record<UnionType, Config>` パターンを使う（02-code-quality.md 準拠） |
| 関連タスク | TASK-SKILL-LIFECYCLE-05 |

### 苦戦箇所5: 設計タスクの artifacts.json 逐次更新忘れ

| 項目 | 内容 |
| --- | --- |
| 課題 | 49成果物を全て作成済みだったが、artifacts.json の phase status が全て `not_started` のまま放置。3つの並列検証エージェントで全Phase PASS を確認した後に初めて発見した |
| 再発条件 | 設計タスクでは「コードを書かない」前提があり、状態ファイルの更新が後回しにされる |
| 解決策 | 各Phase完了ごとに artifacts.json の status, artifacts 配列, acceptanceCriteria を逐次更新。最終的に status: "completed" + 全AC verified: true に更新した |
| 標準ルール | artifacts.json は Phase 完了の正式記録であり、成果物作成と同時に更新する |
| 関連タスク | TASK-SKILL-LIFECYCLE-05 |

### 苦戦箇所6: Phase 12 本文と成果物の実績が乖離する

| 項目 | 内容 |
| --- | --- |
| 課題 | `phase-12-documentation.md` が `not_started` のまま、`documentation-changelog.md` に「実装タスクで後続対応」といった計画文が残り、成果物実体と矛盾した |
| 再発条件 | outputs 実体更新後に本体仕様書と changelog を同時更新しない |
| 解決策 | `phase-12-documentation.md` / `documentation-changelog.md` / `spec-update-summary.md` の3点を同一ターンで更新し、planned wording を除去した |
| 標準ルール | Phase 12 は実績ログのみを残し、計画文は残さない |
| 関連タスク | TASK-SKILL-LIFECYCLE-05 |

### 同種課題の簡潔解決手順（5ステップ）

1. Phase 11 開始時に `checklist/result/plan/screenshots` の4点セットを先に作る。
2. screenshot 取得は「実画面試行 → fallback review board → metadata固定」の順で閉じる。
3. Phase 12 は `implementation-guide` の literal 要件を先に満たしてから詳細説明を肉付けする。
4. `phase-12-documentation.md` / `documentation-changelog.md` / `spec-update-summary.md` を同時に更新して整合を固定する。
5. 最終判定で `verify-all-specs` / `validate-phase-output` / `validate-phase11-screenshot-coverage` / `validate-phase12-implementation-guide` を連続実行する。

---

## 2026-03-14 TASK-SKILL-LIFECYCLE-04

### 苦戦箇所1: 未タスク配置先ドリフトで指定ディレクトリ監査が不成立になる

| 項目 | 内容 |
| --- | --- |
| 課題 | 未タスクを `docs/30-workflows/skill-lifecycle-unification/tasks/unassigned-task/` に置いたため、`--target-file` 監査境界と衝突した |
| 再発条件 | workflow ローカル path を temporary 運用のまま台帳反映する |
| 解決策 | root canonical path（`docs/30-workflows/completed-tasks/step-04-par-task-09-slide-ai-runtime-alignment/unassigned-task/`）へ再配置し、`phase-12-documentation` / `unassigned-task-detection` / `task-workflow-backlog` / `interfaces` 参照を同ターン更新した |
| 標準ルール | active 未タスクは root canonical path を正本とし、workflow ローカル path は使わない |

### 苦戦箇所2: `current`/`baseline` と配置可否を同一判定にすると報告が崩れる

| 項目 | 内容 |
| --- | --- |
| 課題 | 監査値だけで「指定ディレクトリに置けているか」を判定しようとして説明が曖昧になった |
| 再発条件 | 配置可否・link整合・監査値を 1 つの数値で報告する |
| 解決策 | `配置可否`、`verify-unassigned-links`、`audit --diff-from HEAD --target-file` を3軸で分離記録した |
| 標準ルール | `currentViolations=0` は品質判定、配置可否は別項目として必ず明記する |

### 苦戦箇所3: system spec の同期対象を絞りすぎると same-wave が崩れる

| 項目 | 内容 |
| --- | --- |
| 課題 | workflow 成果物だけ更新して `resource-map` / `quick-reference` / `legacy register` / `LOGS` を後回しにすると、再利用入口が stale になる |
| 再発条件 | 「実装記録は完了したので index は後でよい」と判断する |
| 解決策 | `workflow-skill-lifecycle-evaluation-scoring-gate.md` を統合正本として追加し、`current canonical set` と `artifact inventory` を起点に parent docs / ledger / indexes / logs を同一 wave で同期した |
| 標準ルール | Phase 12 の close-out は `workflow + parent docs + task-workflow + lessons + indexes + LOGS + mirror` を最小単位とする |

### 同種課題の簡潔解決手順（4ステップ）

1. MINOR 検出時に未タスク指示書を root `docs/30-workflows/completed-tasks/step-04-par-task-09-slide-ai-runtime-alignment/unassigned-task/` へ作成する。
2. 指示書は 9セクション形式（`## 1..9` + `3.5`）で作り、親タスク苦戦箇所を継承する。
3. `task-workflow-backlog` / 関連仕様書 / workflow outputs の参照を同ターンで更新する。
4. `verify-unassigned-links` と `audit --diff-from HEAD --target-file` で link と品質を分離検証する。

---

## 2026-03-18 TASK-SKILL-LIFECYCLE-02

### 苦戦箇所1: P31 Zustand 個別セレクタによる無限ループ回避

| 項目 | 内容 |
| --- | --- |
| 課題 | `useSkillCenter` 内で `setCurrentView` を取得する際、合成 Hook（`useAppStore()`）を使用すると毎回新しいオブジェクト参照が返り、`useCallback` 依存配列で無限ループが発生する |
| 再発条件 | ナビゲーション関数内で Zustand store の action を合成 Hook 経由で取得する |
| 解決策 | `useAppStore((state) => state.setCurrentView)` のように個別セレクタで action を直接取得し、安定した参照を確保した |
| 標準ルール | Zustand action は必ず個別セレクタ（`useAppStore(state => state.action)`）で取得する。合成 Hook の戻り値を `useEffect` / `useCallback` の依存配列に含めない（P31 準拠） |

### 苦戦箇所2: P39 happy-dom 環境での fireEvent 使用

| 項目 | 内容 |
| --- | --- |
| 課題 | CTA ボタンのクリックテストで `userEvent.setup()` を使用すると `Symbol(Node prepared with document state workarounds)` エラーが発生し、テストが全滅する |
| 再発条件 | happy-dom テスト環境で `@testing-library/user-event` を使用する |
| 解決策 | `fireEvent.click()` を使用し、非同期ハンドラは `await act(async () => { fireEvent.click(el) })` で包む |
| 標準ルール | happy-dom 環境では `userEvent` 使用禁止。`fireEvent` + `act()` パターンを標準とする（P39 準拠） |

### 苦戦箇所3: P50 既実装検出による Phase 4-5 モード切替

| 項目 | 内容 |
| --- | --- |
| 課題 | Phase 1 開始時点で全コード実装（CTA ボタン、ナビゲーション関数、ctaLabel 型拡張）が既に完了していた。Phase 4-5 を「新規実装」前提で進めると、不要なコード重複が発生するリスクがあった |
| 再発条件 | worktree で前タスクの成果物が残った状態で後続タスクを開始し、既存コードの確認を省略する |
| 解決策 | Phase 1 で `git diff --stat HEAD` と対象ファイルの内容を確認し、既実装であることを検出。Phase 4-5 を「検証・補完」モードに切り替え、既存実装に対するテスト追加とカバレッジ確認に集中した |
| 標準ルール | Phase 1 開始時に必ず P50 チェック（`git diff --stat` + 対象ファイル確認）を実施し、既実装の場合は Phase 4-5 を検証モードに切り替える |
| 関連パターン | P50（既実装防御の発見による Phase 転換） |
| 関連タスク | TASK-SKILL-LIFECYCLE-02 |

### 苦戦箇所4: サブエージェント間のテスト数・カバレッジ値伝達ミス（P4/P43 複合）

| 項目 | 内容 |
| --- | --- |
| 課題 | 並列サブエージェントが個別にテストを実行した結果、テスト数（50テスト/3ファイル）とカバレッジ値の伝達時に数値の不整合が発生した。documentation-changelog に中間報告の数値がそのまま転記され、最終的な二次検証で修正が必要になった |
| 再発条件 | 3つ以上のサブエージェントが個別にテストを実行し、メインエージェントが結果を統合する際に照合を省略する |
| 解決策 | メインエージェントが `pnpm --filter @repo/desktop exec vitest run` で全テストを一括実行し、出力から正確なテスト数・カバレッジ値を取得。サブエージェントの中間報告値とクロスチェックしてから changelog に記録した |
| 標準ルール | テスト数・カバレッジ値は最終的にメインエージェントが一括実行結果から取得し、サブエージェント報告値とクロスチェックする（P4/P43 準拠） |
| 関連パターン | P4（documentation-changelog への早期完了記載）、P43（サブエージェント rate limit 中断） |
| 関連タスク | TASK-SKILL-LIFECYCLE-02 |

### 苦戦箇所5: Mirror Sync 差分の早期完了記載（P4 再発）

| 項目 | 内容 |
| --- | --- |
| 課題 | documentation-changelog.md に「Mirror Sync 差分0件」と早期記載したが、実際は `.claude/skills/` と `.agents/skills/` の間に3ファイルの差分が残存していた。`diff -qr` による事後確認で発見し、`rsync --checksum` で修正した |
| 再発条件 | Mirror Sync の実行結果を確認せずに changelog に「0件」と記載する |
| 解決策 | `rsync -avz --checksum ./.claude/skills/ ./.agents/skills/` 実行後に `diff -qr ./.claude/skills/ ./.agents/skills/` で差分0件を確認してから changelog に記録する。事前ではなく事後に記録する |
| 標準ルール | Mirror Sync は `rsync` 実行 → `diff -qr` で0件確認 → changelog 事後記録の順序を厳守する（P4 準拠） |
| 関連パターン | P4（documentation-changelog への早期完了記載） |
| 関連タスク | TASK-SKILL-LIFECYCLE-02 |

### P66: Phase 12 LOGS.md/SKILL.md 更新の worktree 先送りパターン（P57 再発）

| 項目 | 内容 |
| --- | --- |
| 課題 | Phase 12 で「worktree 制約のため PR マージ時に実施」と LOGS.md/SKILL.md の更新を先送りしたが、worktree 環境でも `.claude/skills/` は直接編集可能。P57（設計タスクにおける Phase 12 システム仕様書更新の先送りパターン）の再発 |
| 再発条件 | worktree 環境で Phase 12 を実行し、「worktree だから先送り」と判断する |
| 解決策 | Phase 12 完了時点で `.claude/skills/` を実更新する。worktree 環境を理由に先送りしない |
| 標準ルール | Phase 12 テンプレートに「worktree でも .claude/skills/ は編集可能であり、先送りは P57 違反」と明記する |
| 関連パターン | P57（設計タスクにおける Phase 12 システム仕様書更新の先送りパターン） |
| 関連タスク | UT-LIFECYCLE-EXECUTION-STATUS-TYPE-SPEC-SYNC-001 |

### P67: 未タスク検出時の「スコープ内対応可能」による3ステップ省略（P3/P58 再発）

| 項目 | 内容 |
| --- | --- |
| 課題 | Phase 12 で StatusBadge マッピングの未タスクを検出したが、「Task12 スコープ内で対応可能なため省略」と判断し3ステップ（指示書作成 → 残課題テーブル登録 → 関連仕様書リンク追加）を実施しなかった |
| 再発条件 | 未タスクが「現在のスコープで対応可能」と判断され、3ステップを省略する |
| 解決策 | 検出した未タスクは件数・規模に関わらず P3 の3ステップを必ず完了する。「他タスクのスコープ内」は省略の理由にならない |
| 標準ルール | Phase 12 Task 4 のチェックリストに「3ステップに例外はない」を太字で明記する |
| 関連パターン | P3（未タスク管理の3ステップ不完全）、P58（設計タスクにおける未タスク指示書の配置省略） |
| 関連タスク | UT-LIFECYCLE-EXECUTION-STATUS-TYPE-SPEC-SYNC-001 |

### P68: ローカル型定義の同期漏れ（型拡張時の P32 派生パターン）

| 項目 | 内容 |
| --- | --- |
| 課題 | `packages/shared/src/types/skill.ts` の `SkillExecutionStatus` を6値から9値に拡張した際、`apps/desktop/src/renderer/` の `SkillLifecyclePanel.tsx` にローカル定義された `SkillExecutionStatusValue` が古い6値のまま残り typecheck が失敗した |
| 再発条件 | shared パッケージの union 型を拡張した際、desktop 側に `type X = "a" \| "b" \| ...` のローカル型定義が存在する |
| 解決策 | ローカル型定義を shared の型を参照する形（`type X = SharedType \| null`）に書き換える。`grep -rn "type.*=.*\"idle\".*\"running\"" apps/desktop/src/` でローカル型定義の残存を検出 |
| 関連パターン | P32（型定義の二箇所同時更新必須） |
| 関連タスク | UT-LIFECYCLE-EXECUTION-STATUS-TYPE-SPEC-SYNC-001 |

### 同種課題の簡潔解決手順（5ステップ）

1. Phase 1 開始時に `git diff --stat HEAD` で既実装を P50 チェックし、検証モードへの切替を判断する。
2. Zustand action は個別セレクタ（`useAppStore(state => state.action)`）で取得する（P31 準拠）。
3. happy-dom 環境では `fireEvent` + `act()` を使用し、`userEvent` は禁止する（P39 準拠）。
4. テスト数・カバレッジ値はメインエージェントが一括実行結果からクロスチェックする。
5. Mirror Sync は実行→確認→記録の順で事後記録する（P4 準拠）。

---

## 2026-03-23 TASK-IMP-CHATPANEL-REVIEW-HARNESS-ALIGNMENT-001 教訓

### L-CHRHA-001: GAP ラベルドリフト（Phase 間のドキュメント不整合）

| 項目 | 内容 |
|------|------|
| 課題 | Phase 8（refactor-boundaries.md）と Phase 12（implementation-guide.md）の GAP ラベルが Phase 1 正本（current-state-inventory.md）と乖離した。Phase 1 では GAP-01=onTerminalSwitch だが、Phase 8/12 では GAP-01=onSendMessage と誤記 |
| 原因 | Phase 間でドキュメントをコピーする際に、正本を参照せずに記憶に基づいて記述した |
| 解決策 | GAP ラベルドリフト是正を実施し、Phase 1 正本に統一。事後修正をドキュメントチェンジログに記録 |
| 再発防止 | Phase 8/12 のドキュメント作成時は Phase 1 の正本定義を grep で参照してからラベルを記述する |
| 関連タスク | TASK-IMP-CHATPANEL-REVIEW-HARNESS-ALIGNMENT-001 |

### L-CHRHA-002: DEFERRED 判断の誤り（worktree 内ファイル存在確認の省略）

| 項目 | 内容 |
|------|------|
| 課題 | system-spec-update-summary.md で ui-ux-panels.md を「worktree に存在しない」と判断し DEFERRED としたが、実際にはファイルが存在していた |
| 原因 | worktree 環境で正本ファイルの存在を実際に確認せず、「worktree だから存在しないだろう」という推測で先送りした |
| 解決策 | 事後検証で存在を確認し、Review Harness セクションを ui-ux-panels.md に追加 |
| 再発防止 | DEFERRED 判断の前に `ls` / `find` で対象ファイルの存在を実際に確認する。P57 の亜種として記録 |
| 関連パターン | P57（設計タスクでのシステム仕様書更新先送り）、P26（システム仕様書更新遅延） |
| 関連タスク | TASK-IMP-CHATPANEL-REVIEW-HARNESS-ALIGNMENT-001 |

### L-CHRHA-003: ViewType union 型と string の型不一致

| 項目 | 内容 |
|------|------|
| 課題 | `selectProvider(id)` の引数型が `LLMProviderId`（union 型）だが、コールバックから渡される `id` は `string` 型。直接代入すると型エラーが発生 |
| 解決策 | `useCallback` ラッパーで `id as Parameters<typeof selectProvider>[0]` を使用。将来的には selectProvider の引数型を string に緩和するか、コールバック側で union 型を渡す |
| 関連タスク | TASK-IMP-CHATPANEL-REVIEW-HARNESS-ALIGNMENT-001 |
