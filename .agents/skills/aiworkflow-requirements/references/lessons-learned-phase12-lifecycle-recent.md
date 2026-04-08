# Lessons Learned: Phase 12 / ライフサイクル（2026-03-26〜2026-04）
> 親ファイル: [lessons-learned-phase12-workflow-lifecycle.md](lessons-learned-phase12-workflow-lifecycle.md)

## 2026-04-02 TASK-FIX-LIFECYCLE-PANEL-ERROR-001

### 苦戦箇所1: `handoff` 時の error clear を 1 経路だけ直すと別経路で再発する

| 項目 | 内容 |
| --- | --- |
| 課題 | `onWorkflowStateChanged` だけ `handoff` ガードしても、`getWorkflowState` / `submitUserInput` / execute 後再取得が `setWorkflowError(null)` を呼ぶと UI 上のエラーが消える |
| 再発条件 | 同じ state 遷移を複数経路から取り込むコンポーネントで、経路ごとに個別 patch を当てる場合 |
| 解決策 | `applyWorkflowSnapshot()` を導入し、snapshot 適用と `handoffBundle` 更新を 1 箇所へ集約した |
| 標準ルール | workflow snapshot を複数 API から受け取る UI は、phase 判定と副作用を helper へ集約して全経路で共有する |
| 関連タスク | TASK-FIX-LIFECYCLE-PANEL-ERROR-001 |

### 苦戦箇所2: stale vocabulary `phase: 'failed'` を backlog に残すと shared type と食い違う

| 項目 | 内容 |
| --- | --- |
| 課題 | 実装正本は `currentPhase: "handoff"` なのに、close-out 台帳へ `phase: 'failed'` が残ると次の人が誤った修正を再実装する |
| 再発条件 | workflow docs だけ直して system spec backlog / completed ledger を same-wave sync しない場合 |
| 解決策 | backlog の旧 row を completed 扱いへ移し、implementation guide / completed ledger / lessons の語彙を `currentPhase` / `handoff` へ揃えた |
| 標準ルール | shared type を正本とし、Phase 12 では workflow docs だけでなく backlog / completed / lessons / logs の vocabulary も同一ターンで同期する |
| 関連タスク | TASK-FIX-LIFECYCLE-PANEL-ERROR-001 |

### 苦戦箇所3: NON_VISUAL task で blocker を PASS と書くと false green になる

| 項目 | 内容 |
| --- | --- |
| 課題 | 手動実測や vitest が環境ブロッカーで止まっているのに、auto test の要約だけを書いて Phase 11/10 を PASS にすると証跡の種類が崩れる |
| 再発条件 | NON_VISUAL task で manual-test-result に「何を実行したか」「何が止めたか」を残さず、placeholder や要約だけで閉じる場合 |
| 解決策 | `manual-test-result.md` を BLOCKED とし、実行コマンド、esbuild mismatch、代替で確認した current facts を明記した |
| 標準ルール | NON_VISUAL task でも blocker があれば PASS を偽装せず、コマンド、失敗理由、代替 evidence を `manual-test-result.md` に残す |
| 関連タスク | TASK-FIX-LIFECYCLE-PANEL-ERROR-001 |

---

## 2026-04-04 TASK-SKILL-CENTER-LIFECYCLE-NAV-001

### 苦戦箇所1: 戻り導線の screenshot は同一 surface のため初期表示と見た目が同じになる

| 項目 | 内容 |
| --- | --- |
| 課題 | `SkillManagementPanel` の「スキルセンターへ戻る」後は `SkillCenterView` に戻るため、スクリーンショット単体では初期表示と差が出ない |
| 再発条件 | return route を別 surface と誤認し、見た目の diff だけで回帰判定してしまう場合 |
| 解決策 | `TC-11-05` は戻り後の surface を表す代表画像として扱い、戻り操作の成立は action trace と合わせて判定した |
| 標準ルール | same surface return の検証では、`action trace + screenshot + route` を 1 組で扱う |
| 関連タスク | TASK-SKILL-CENTER-LIFECYCLE-NAV-001 |

### 苦戦箇所2: secondary surface を追加したら dock の canonical surface を壊しやすい

| 項目 | 内容 |
| --- | --- |
| 課題 | `skillManagement` を新しい ViewType として追加すると、dock / sidebar の active state が別 surface として扱われやすい |
| 再発条件 | secondary surface を top-level surface と同列に登録してしまう場合 |
| 解決策 | `skillManagement` を `skillCenter` に正規化し、active state を canonical surface へ維持した |
| 標準ルール | secondary surface は UI の到達経路としては増やしても、canonical surface は 1 つに固定する |
| 関連タスク | TASK-SKILL-CENTER-LIFECYCLE-NAV-001 |

---

## 2026-03-29 TASK-RT-04 skill-authkey-api-key-management-ui

### 苦戦箇所1: esbuild バイナリアーキ不一致によるテスト起動失敗

| 項目       | 内容                                                                                                                                                       |
| ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 課題       | `ApiKeySettingsPanel.test.tsx` 実行時に `@esbuild/darwin-arm64` が検出されるが環境は `darwin-x64` のため、Vitest が起動しない                              |
| 再発条件   | `pnpm install` 後に optional deps の platform 判定がキャッシュされたアーキを返す場合（特に CI 共有キャッシュや worktree コピー環境）                       |
| 解決策     | `pnpm install --force` で optional dependency を現在のアーキに再解決する。`node -p "process.platform + ' ' + process.arch"` で事前確認してから実行すること |
| 標準ルール | test 実行前に `process.arch` を確認し、ミスマッチが疑われる場合は `--force` を優先する                                                                     |
| 関連タスク | UT-TASK-RT-04-TEST-RUNTIME-ESBUILD-ARCH-001                                                                                                                |

### 苦戦箇所2: 共有 IPC チャネル再利用時の主導線/補助導線責務境界曖昧化

| 項目       | 内容                                                                                                                                                                                                                               |
| ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 課題       | `auth-key:*` IPC チャネルを `SettingsView`（主導線）と `SkillLifecyclePanel`（補助導線）の両方から呼ぶ設計で、task spec と実装の記述が曖昧なまま進行した                                                                           |
| 再発条件   | 同一 IPC チャネルを複数の UI surface から再利用する場合、「どちらが主でどちらが補助か」を仕様に明記しないと drift が生じる                                                                                                         |
| 解決策     | workflow `index.md` の AC-1 に「`SettingsView` 主導線 / `SkillLifecyclePanel` 補助導線」を明文化し、双方の契約境界（`apiKey:*` vs `auth-key:*`）も同時に記録する                                                                   |
| 標準ルール | 同一チャネルを複数 surface が再利用する場合は、必ず主導線/補助導線の役割分担と channel namespace の境界を workflow index.md と system spec に同時記録する（UT-TASK-RT-04-SETTINGS-VS-LIFECYCLE-BOUNDARY-001 のパターンを再利用可） |
| 関連タスク | UT-TASK-RT-04-SETTINGS-VS-LIFECYCLE-BOUNDARY-001                                                                                                                                                                                   |

---

## 2026-03-31 TASK-ELECTRON-BUILD-FIX

### 苦戦箇所1: NON_VISUAL task でも壊れた placeholder screenshot を残すと false green になる

| 項目       | 内容                                                                                                                            |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------- |
| 課題       | UI 差分がない task に placeholder PNG だけを置いて Phase 11 を閉じると、validator 互換には見えても evidence chain が壊れる      |
| 再発条件   | `screenshot-plan.json` を validator 互換の名目で placeholder 1 枚に固定し、`manual-test-result.md` に NON_VISUAL 根拠を書かない |
| 解決策     | placeholder binary を撤去し、`manual-test-result.md` と `screenshot-plan.json` に NON_VISUAL 理由と CLI 証跡を明記した          |
| 標準ルール | UI 差分がない task は screenshot を捏造せず、NON_VISUAL 理由・walkthrough・CLI 証跡で閉じる                                     |
| 関連タスク | TASK-ELECTRON-BUILD-FIX                                                                                                         |

### 苦戦箇所2: electron-builder hook の `arch` は数値 enum として来る

| 項目       | 内容                                                                                                                    |
| ---------- | ----------------------------------------------------------------------------------------------------------------------- |
| 課題       | `afterPack` hook で `context.arch` をそのまま `--arch` へ渡すと、`1` や `3` が CLI に流れて native rebuild が失敗しうる |
| 再発条件   | hook 実行時コンテキストを文字列だと仮定し、設定存在確認テストだけで閉じる                                               |
| 解決策     | `rebuild-native-for-electron.mjs` に数値 enum -> 文字列の正規化を追加し、静的検証テストでもこの分岐を確認した           |
| 標準ルール | packaging hook では electron-builder の context 型を確認し、enum / path / platform を CLI 互換の値へ正規化する          |
| 関連タスク | TASK-ELECTRON-BUILD-FIX                                                                                                 |

### 苦戦箇所3: Rosetta 2 環境での arch 検出は Phase 4 テスト計画に含めるべきだった

| 項目       | 内容                                                                                                                                        |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| 課題       | Rosetta 2 (arm64 Mac で x86_64 として動作) 環境での native binary arch 検出誤判定が Phase 11 で発覚。Phase 4 テスト計画に含まれていなかった |
| 再発条件   | Apple Silicon Mac で x86_64 Electron を実行する場合、`process.arch` は `x64` を返すが、native module の実 arch と一致しないことがある       |
| 解決策     | `rebuild-sqlite-for-electron.mjs` で Electron バイナリの実 arch を直接読み取る実装に変更                                                    |
| 標準ルール | native module を扱う desktop task の Phase 4 テスト計画には「Rosetta 2 / CI / worktree」3環境での arch 検出確認を明示的に追加する           |
| 関連タスク | TASK-ELECTRON-BUILD-FIX                                                                                                                     |

### 苦戦箇所4: pnpm strict resolution の影響は Phase 2 設計時に考慮すべきだった

| 項目       | 内容                                                                                                                                          |
| ---------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| 課題       | `setup-native-modules.sh` の `require` テストが pnpm strict resolution 環境で失敗した。Phase 5 実装中に発覚し、修正が必要になった             |
| 再発条件   | `node -e "require('better-sqlite3')"` のような単純な require テストが pnpm workspace の strict hoisting 設定下で機能しない                    |
| 解決策     | 絶対パスによる require テストに変更: `node -e "require('$(pwd)/node_modules/better-sqlite3')"`                                                |
| 標準ルール | native module の load テストは絶対パスで実施し、pnpm hoisting に依存しない。Phase 2 設計時に「pnpm strict resolution での動作前提」を明記する |
| 関連タスク | TASK-ELECTRON-BUILD-FIX                                                                                                                       |

### 苦戦箇所5: 独立した問題は並列 SubAgent で解決する設計を Phase 2 に明示する

| 項目       | 内容                                                                                                                      |
| ---------- | ------------------------------------------------------------------------------------------------------------------------- |
| 課題       | 問題A（@repo/shared ESM/CJS dual output）と問題B（better-sqlite3 ABI 再ビルド）は独立しているが、当初は直列で分析していた |
| 再発条件   | 複数の独立した問題を含む bugfix task で依存グラフを描かずに直列実行する場合                                               |
| 解決策     | Phase 2 設計時に問題の依存グラフを明示し、独立した問題を並列 SubAgent に割り当てた                                        |
| 標準ルール | bugfix task の Phase 2 では問題の依存グラフを成果物として残し、独立した問題は並列 SubAgent 割り当てを採用する             |
| 関連タスク | TASK-ELECTRON-BUILD-FIX                                                                                                   |

---

## 2026-03-28 TASK-SDK-07 execution-governance-and-handoff-alignment

### 苦戦箇所1: shared channel 再利用と新規 Skill Creator channel 作成の混同

| 項目       | 内容                                                                                                                                                                                                                                                                                                                                                             |
| ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 課題       | governance 機能（approval / disclosure）を Skill Creator に追加するとき、`skill-creator:approval` / `skill-creator:disclosure` のような専用 channel を作りたくなるが、これは MB-3（hidden injection 禁止）違反になる。既存の `approval:respond` / `execution:get-disclosure-info` shared channel を Skill Creator preload の `safeInvoke` で再利用するのが正しい |
| 再発条件   | 新しい surface に governance 機能を追加するたびに「surface 名 + 機能名」の専用 channel を定義し、ALLOWED_INVOKE_CHANNELS に追加する                                                                                                                                                                                                                              |
| 解決策     | `skillCreatorAPI.respondToApproval()` / `getDisclosureInfo()` をそれぞれ shared channel (`IPC_CHANNELS.APPROVAL_RESPOND` / `IPC_CHANNELS.EXECUTION_GET_DISCLOSURE_INFO`) 経由の `safeInvoke` ラッパーとして実装した。preload test では「専用 channel が存在しないこと」を explicit assertion として記録する                                                      |
| 標準ルール | governance channel（approval / disclosure）は surface をまたいで共有する。新 surface が追加されても governance channel は増やさない                                                                                                                                                                                                                              |
| 関連タスク | TASK-SDK-07                                                                                                                                                                                                                                                                                                                                                      |

### 苦戦箇所2: disclosure fetch の graceful degradation と execution authority 移譲の混同

| 項目       | 内容                                                                                                                                                                                                                                                                                     |
| ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 課題       | `fetchDisclosureInfo()` が失敗した時（disclosure handler unavailable など）に catch を入れないと、エラーが `executePlan` の終了を止めてしまう。一方で catch しすぎると disclosure 失敗を無視していると誤解される                                                                         |
| 再発条件   | disclosure fetch を await して、失敗時に `return` や `throw` で execution 経路を変えてしまう                                                                                                                                                                                             |
| 解決策     | `fetchDisclosureInfo()` 内で try/catch し、失敗しても `setDisclosureInfo(null)` のままにし、execution authority を Renderer に渡さない（コメント: "disclosure fetch 失敗は execution authority を Renderer へ移さない"）。`void fetchDisclosureInfo()` で fire-and-forget として呼び出す |
| 標準ルール | disclosure fetch の失敗は graceful degradation であり、execution 経路変更の理由にしない                                                                                                                                                                                                  |
| 関連タスク | TASK-SDK-07                                                                                                                                                                                                                                                                              |

### 苦戦箇所3: spec_created task への code wave 注入後も AC 追跡を closed のままにしない

| 項目       | 内容                                                                                                                                                                                                                                                                                                    |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 課題       | TASK-SDK-07 は `spec_created`（docs-only）として分類されていたが、Phase 12 で gap 確認をしたところ実装が必要な箇所（preload API ラッパー未追加、disclosure UI 未接続）が発見され、code wave を入れた。その後 AC-4（approval request surface）と AC-6（screenshot evidence）が未完のまま閉じそうになった |
| 再発条件   | `spec_created` task に code wave が入った後も「docs-only だから AC/証跡は N/A」と判定し、残余 gap を backlog 化せずに閉じる                                                                                                                                                                             |
| 解決策     | 未完の AC（AC-4 approval surface / AC-6 screenshot）を 3 件の未タスクとして backlog に formalize し、phase12-task-spec-compliance-check に FAIL + 残課題 3 件を明記した                                                                                                                                 |
| 標準ルール | spec_created task であっても code wave が入ったら AC 追跡を再評価し、未完残課題は必ず backlog 化する                                                                                                                                                                                                    |
| 関連タスク | TASK-SDK-07                                                                                                                                                                                                                                                                                             |

### 同種課題の簡潔解決手順（3ステップ）

1. governance 機能を新 surface へ追加する時は、まず既存 shared channel が使えないかを確認する。専用 channel 作成は「なぜ shared では駄目か」の明示的な理由がある場合に限る。
2. disclosure fetch は fire-and-forget (`void`) で呼び出し、失敗しても execution 経路を変えない。catch 内で execution authority を Renderer へ渡してはいけない。
3. spec_created task に code wave が混入した場合は Phase 12 の AC 追跡表を再評価し、未完箇所を未タスクとして backlog に formalize してから閉じる。

---

## 2026-03-27 UT-IMP-TASK-SDK-06-LAYER34-VERIFY-EXPANSION-001

### 苦戦箇所1: spec_created の verify/reverify UI でも current workflow 配下の Phase 11 screenshot 契約を空 placeholder で閉じると false green になる

| 項目       | 内容                                                                                                                                                                                              |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 課題       | verify detail / reverify の UI 差分があるのに、placeholder PNG だけを current workflow に置いて PASS 扱いすると、review board fallback や source evidence の根拠が辿れず shallow close-out になる |
| 再発条件   | docs-heavy / spec_created task で「same-day upstream evidence がある」ことを理由に、`TC-ID ↔ png ↔ screenshot-coverage.md ↔ metadata JSON` を current workflow に揃えない                         |
| 解決策     | review board HTML/PNG、`screenshot-coverage.md`、`phase11-capture-metadata.json`、`manual-test-result.md` を current workflow へ集約し、fallback reason と source evidence を同時記録した         |
| 標準ルール | current workflow に screenshot 契約がある限り、placeholder-only PASS を禁止し、fallback でも evidence chain を current workflow で完結させる                                                      |
| 関連タスク | UT-IMP-TASK-SDK-06-LAYER34-VERIFY-EXPANSION-001                                                                                                                                                   |

### 苦戦箇所2: implementation guide Part 2 が API シグネチャ止まりだと validator を通しても再利用価値が足りない

| 項目       | 内容                                                                                                                                                            |
| ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 課題       | verify detail / reverify の contract 説明が API シグネチャ中心だと、DTO shape、consumer mapping、disabled reason、reverify eligibility の実装根拠が読み取れない |
| 再発条件   | Part 2 に型定義、使用例、エラーハンドリング、設定項目を入れず、「current contract」の本文を短く済ませる                                                         |
| 解決策     | `RuntimeSkillCreatorVerifyDetail` 型、renderer 利用例、edge case、config/constants を同一ガイドへ追記した                                                       |
| 標準ルール | Phase 12 Part 2 は API シグネチャ単体で閉じず、型・使用例・エラー/edge case・設定一覧を最小セットとして揃える                                                   |
| 関連タスク | UT-IMP-TASK-SDK-06-LAYER34-VERIFY-EXPANSION-001                                                                                                                 |

### 苦戦箇所3: Phase 2 contract matrix が DTO 更新に追従しないと spec sync 後でも reader を誤誘導する

| 項目       | 内容                                                                                                                                                                                            |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 課題       | Phase 2 matrix に `routeSnapshot` / `executionRoute` のような旧 field 名が残ると、Phase 12 で system spec を更新しても workflow 内 design artifact が stale になり、consumer 実装者を誤誘導する |
| 再発条件   | shared DTO / engine / renderer の current contract を確認せず、設計時の表を close-out まで据え置く                                                                                              |
| 解決策     | `route.type` / `route.summary` / `route.permissionMode` / `route.launcher` / `reverifyEligible` / `disabledReason` へ matrix を current contract に同期した                                     |
| 標準ルール | Step 2 の system spec sync 後は、workflow 内の contract matrix も shared type と consumer 実装に照らして current fact へ戻す                                                                    |
| 関連タスク | UT-IMP-TASK-SDK-06-LAYER34-VERIFY-EXPANSION-001                                                                                                                                                 |

### 同種課題の簡潔解決手順（3ステップ）

1. screenshot fallback を使う場合でも、review board PNG、coverage、metadata、fallback reason、source evidence を current workflow へ集約する。
2. Part 2 は API シグネチャだけで閉じず、型・使用例・エラー/edge case・設定一覧を同一ターンで補完する。
3. Phase 2 の contract matrix や close-out narrative に旧 DTO 名が残っていないか、shared type / renderer consumer / engine を突き合わせて再監査する。

---

## 2026-03-27 TASK-SDK-04

## 2026-03-27 UT-EXEC-01

### 苦戦箇所1: docs-only close-out で scope-definition の Implementation Anchor を追補する時も target path 実在確認を省略しない

| 項目       | 内容                                                                                                                                                                                                                    |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 課題       | Markdown の 1 行追記だけに見える close-out でも、追加先の実装正本が stale path なら Phase 12 summary と completed ledger が false green になる                                                                          |
| 再発条件   | `scope-definition.md` や implementation guide の anchor 追補を「文書修正だけ」と見なし、対象の shared type / source file 実在確認を行わない                                                                             |
| 解決策     | Task01 `scope-definition.md` の D. Implementation Anchor に `packages/shared/src/types/execution-capability.ts` を追記する前に実装正本を確認し、workflow spec / completed ledger / quick-reference を同ターンで同期した |
| 標準ルール | docs-only close-out でも implementation anchor を追加する時は target path 実在確認を行い、anchor 追補の事実を workflow spec / completed ledger / Phase 12 summary に同値転記する                                        |
| 関連タスク | UT-EXEC-01                                                                                                                                                                                                              |

### 苦戦箇所2: duplicate source / ID collision は current diff 起因か wider governance baseline かを分離して判定する

| 項目       | 内容                                                                                                                                                                          |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 課題       | source unassigned docs の duplicate source や workflow ID collision を見つけると、今回差分と無関係でも新規未タスクを増やしてしまい、Phase 12 evidence と backlog が過密化する |
| 再発条件   | `unassigned-task-detection.md` の観測結果をそのまま current violation とみなし、source document 側の既知 baseline かどうかを切り分けない                                      |
| 解決策     | duplicate source 整理と `UT-EXEC-01` ID collision 是正を wider governance baseline として扱い、current workflow には no-new-unassigned の理由だけを記録した                   |
| 標準ルール | duplicate source / ID collision は current diff 起因か baseline かを先に判定し、baseline なら lessons と summary に理由を残して重複 formalize しない                          |
| 関連タスク | UT-EXEC-01                                                                                                                                                                    |

## 2026-03-27 TASK-SDK-05

### 苦戦箇所1: `spec_created` UI task の Step 1 を N/A にすると same-wave sync 不足が false green になる

| 項目       | 内容                                                                                                                                                                                                                                            |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 課題       | Task05 のように新規 interface を追加しない docs-only task でも、completed ledger / quick-reference / resource-map / LOGS / SKILL history を更新しないまま Step 1-A〜1-C を N/A 扱いすると、Phase 12 だけ PASS に見えて discoverability が壊れる |
| 再発条件   | Step 2 no-op を理由に Step 1 まで no-op と誤読し、workflow root 側の close-out 文書だけで完了扱いする                                                                                                                                           |
| 解決策     | `task-workflow-completed.md` / `indexes/quick-reference.md` / `indexes/resource-map.md` / `lessons-learned-phase12-workflow-lifecycle.md` / LOGS / SKILL history を same-wave で更新し、Step 2 のみ no-op 根拠付き完了に戻した                  |
| 標準ルール | `spec_created` task でも Step 1 は実更新必須。Step 2 が no-op でも ledger / index / lesson / skill sync は省略しない                                                                                                                            |
| 関連タスク | TASK-SDK-05                                                                                                                                                                                                                                     |

### 苦戦箇所2: workflow root を移設したら verification-report の対象 path も同一ターンで正規化する

| 項目       | 内容                                                                                                                                                                                                    |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 課題       | workflow 本体を `docs/30-workflows/step-04-par-task-05-create-entry-mainline-unification/` へ置いても、`outputs/verification-report.md` に旧 nested path が残ると reader が誤った canonical root を辿る |
| 再発条件   | validator の PASS 文面だけを転記し、evidence 文書中の workflow root path を再監査しない                                                                                                                 |
| 解決策     | `verification-report.md` の target path、Phase 12 validation command、mirror sync 記録を current root に合わせて是正した                                                                                |
| 標準ルール | workflow root を移設・独立化したターンでは、verification-report / changelog / compliance-check の path literal をまとめて current root へ揃える                                                         |
| 関連タスク | TASK-SDK-05                                                                                                                                                                                             |

### 同種課題の簡潔解決手順（3ステップ）

1. Step 2 no-op かどうかを先に判定し、no-op でも Step 1 の ledger / index / lesson / skill sync を必ず実施する。
2. workflow root を参照する literal path を `verification-report.md` / `documentation-changelog.md` / `phase12-task-spec-compliance-check.md` で横断監査する。
3. `.claude` 正本更新後に `.agents` mirror を same-wave で同期し、`topic-map.md` / `keywords.json` を再生成して discoverability を閉じる。

---

## 2026-03-26 TASK-SDK-01 manifest-contract-foundation

### 苦戦箇所0.7: `spec_created` task に code wave が入ったら screenshot/evidence 判定を docs-heavy 前提のまま残さない

| 項目       | 内容                                                                                                                                                                                                                |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 課題       | workflow root が `spec_created` のままでも、shared / IPC / preload / renderer 実装が後から入ると `manual-test-result.md` の screenshot `N/A` と `system-spec-update-summary.md` の Step 2 N/A が false green になる |
| 再発条件   | docs-heavy task の Phase 11/12 記録をそのまま流用し、current code wave の UI surface と system spec 反映要否を再判定しない                                                                                          |
| 解決策     | walkthrough 証跡と screenshot follow-up を分離し、Step 2 を PASS へ再判定した上で evidence drift を未タスク化した                                                                                                   |
| 標準ルール | `spec_created` task でも current branch に code 実装が入ったら、Phase 11 evidence policy と Step 2 判定を必ず再監査する                                                                                             |
| 関連タスク | TASK-SDK-04, TASK-SDK-04-U3                                                                                                                                                                                         |

## 2026-03-26 UT-IMP-RUNTIME-WORKFLOW-VERIFY-ARTIFACT-APPEND-001

### 苦戦箇所1: internal bugfix でも Step 2 no-op を理由に Step 1 台帳同期まで省略すると completed が false green になる

| 項目       | 内容                                                                                                                                                                                                |
| ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 課題       | public IPC / preload / shared type の変更がない task では Phase 12 全体を no-op と誤読しやすく、completed ledger / lessons / LOGS / SKILL が未更新のままでも workflow だけ completed に見えてしまう |
| 再発条件   | Step 2 が不要な internal bugfix で、Step 1-A / 1-C の same-wave 記録を「仕様変更なしだから不要」と判断する                                                                                          |
| 解決策     | `task-workflow-completed.md` / `lessons-learned-phase12-workflow-lifecycle.md` / LOGS.md 2ファイル / SKILL.md 2ファイル / 元未タスク指示書を同一ターンで更新した                                    |
| 標準ルール | Step 2 domain spec が no-op でも、Step 1 の completed ledger / lessons / skill sync は必須。workflow root だけで close しない                                                                       |
| 関連タスク | UT-IMP-RUNTIME-WORKFLOW-VERIFY-ARTIFACT-APPEND-001                                                                                                                                                  |

### 苦戦箇所2: Phase 12 成果物に apply_patch の断片が混入すると validator が通っても root evidence が壊れる

| 項目       | 内容                                                                                                                                     |
| ---------- | ---------------------------------------------------------------------------------------------------------------------------------------- | ---------------------- | ----------------------------------------------------- |
| 課題       | `phase12-task-spec-compliance-check.md` の末尾に `*** Add File:` 断片が混入し、artifact 自体は存在していても evidence 文書が破損していた |
| 再発条件   | 追加ファイル作成を含む大きな patch 後に、成果物本文へ patch marker が残っていないかを grep で確認しない                                  |
| 解決策     | Phase 12 完了前に workflow root 配下へ `rg "\\_\\_\\\* Add File:                                                                         | \\_\\_\\\* Begin Patch | \\_\\_\\\* End Patch"` を実行し、混入を検出・除去した |
| 標準ルール | Phase 12 root evidence を編集した後は patch marker 混入監査を追加し、artifact existence だけでなく本文破損も確認する                     |
| 関連タスク | UT-IMP-RUNTIME-WORKFLOW-VERIFY-ARTIFACT-APPEND-001                                                                                       |

---

### 苦戦箇所0: docs-only follow-up が途中で code hardening task に変わったら、source spec と outputs の両方を current facts へ同一ターンで戻す

| 項目       | 内容                                                                                                                                                                                                     |
| ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 課題       | Phase 12 close-out follow-up を docs-heavy 前提で閉じていた状態に、後続ユーザー要求で `packages/` / `apps/` の runtime hardening が追加されると、workflow 本文と outputs が docs-only のまま自己矛盾する |
| 再発条件   | follow-up workflow の root 仕様や `system-spec-update-summary.md` より先にコードだけ更新し、source workflow 側の目的文・Task 12 narrative を据え置く                                                     |
| 解決策     | code change を取り込んだ同一ターンで workflow 本文、Phase 12 outputs、completed ledger、lessons、skill update を current facts へ再同期した                                                              |
| 標準ルール | docs-only / spec-only task でも、後続スコープ拡張でコード変更が入ったら source spec・outputs・台帳・skill feedback を同一ターンで実績ベースへ書き換える                                                  |
| 関連タスク | TASK-SDK-01, UT-IMP-TASK-SDK-01-PHASE12-COMPLIANCE-SYNC-001                                                                                                                                              |

### 苦戦箇所0.5: manifest cache は `mtime` ベースのままだと false hit を止め切れない

| 項目       | 内容                                                                                                                     |
| ---------- | ------------------------------------------------------------------------------------------------------------------------ |
| 課題       | worktree や restore で `mtime` が変わらない条件だと、manifest 本文が変化しても cache が古い normalized result を返しうる |
| 再発条件   | `cacheKey` と resource hash だけで cache hit を判定し、manifest 全体の構造差分を比較しない                               |
| 解決策     | `LoadedWorkflowManifest` に `manifestContentHash` を持たせ、canonicalized manifest 本文 hash で cache 判定を補強した     |
| 標準ルール | foundation loader で schema-valid な構造体を cache する場合、timestamp ではなく canonical content hash を併用する        |
| 関連タスク | TASK-SDK-01                                                                                                              |

### 苦戦箇所0.6: 参照配列の型検証だけでは manifest graph の整合 drift を防げない

| 項目       | 内容                                                                                                                              |
| ---------- | --------------------------------------------------------------------------------------------------------------------------------- |
| 課題       | `resource.phaseIds` と `phase.resourceIds` がどちらも配列型でも、片側だけの参照や未定義 phase 参照が残ると runtime graph が壊れる |
| 再発条件   | schema validation を通した後に、双方向参照の一致確認と重複値チェックを行わない                                                    |
| 解決策     | `ManifestLoader` に相互参照検証と duplicate reject を追加し、Vitest で未定義 phase / mismatch / same-`mtime` 再読込を固定した     |
| 標準ルール | graph 型 manifest は「型が正しい」だけで完了にせず、両方向リンク整合と duplicate 不在を load 時点で監査する                       |
| 関連タスク | TASK-SDK-01                                                                                                                       |

### 苦戦箇所1: foundation / internal-contract task は Step 2 の本文追記が不要でも、Step 1 と skill sync を省略できない

| 項目       | 内容                                                                                                                                                               |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 課題       | manifest foundation の型・loader 契約は system spec 正本へ既に反映済みだったが、「追記不要」を「Phase 12 作業不要」と誤読しやすかった                              |
| 再発条件   | internal contract task で `interfaces-*` / `architecture-*` に current facts が既にあり、Phase 12 を completed ledger と lessons なしで閉じる                      |
| 解決策     | Step 2 no-op の根拠を `system-spec-update-summary.md` と `documentation-changelog.md` に残し、completed ledger / lessons / LOGS / SKILL 更新を同一ターンで完了した |
| 標準ルール | domain spec 本文が既に current でも、Step 1-A〜1-G と skill sync は必須。Step 2 は「更新なし」ではなく「no-op 根拠付き完了」として扱う                             |
| 関連タスク | TASK-SDK-01                                                                                                                                                        |

### 苦戦箇所2: test runner の環境 blocker は新規未タスク化より先に既存 follow-up と重複確認する

| 項目       | 内容                                                                                                                                       |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| 課題       | `Vitest + esbuild` の起動失敗を見つけた時、新規未タスクを毎回作ると native binary / worktree guard の既存台帳と重複しやすい                |
| 再発条件   | code/typecheck は完了しているが test runner が環境要因で落ち、既存 backlog を検索せずに follow-up を新設する                               |
| 解決策     | native binary / worktree guard 系の既存未タスクを検索し、今回差分が同種 blocker なら重複作成せず evidence だけ current workflow へ記録した |
| 標準ルール | Phase 12 で環境 blocker を見つけたら、まず既存 `unassigned-task/` と lessons を検索し、重複しない場合のみ新規 formalize する               |
| 関連タスク | TASK-SDK-01                                                                                                                                |

### 苦戦箇所3: `generate-index.js` が `artifacts.json` の phases 配列を添字参照すると Phase 12/13 の status drift が再発する

| 項目       | 内容                                                                                                                                                        |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 課題       | `artifacts.json` の `phases` を配列で持つ workflow で `generate-index.js` が `phases["12"]` のように参照すると、Phase 12 に Phase 13 の status が表示される |
| 再発条件   | parent `index.md` を再生成するたびに Phase 12=`blocked` / Phase 13=`未実施` のような false status が混入する                                                |
| 解決策     | `generate-index.js` を配列 / オブジェクト両対応に修正し、node:test で Phase 12/13 の status 出力を固定した                                                  |
| 標準ルール | Phase status を再生成するスクリプトは `artifacts.json` の構造差分を吸収し、Phase 12/13 drift をテストで固定する                                             |
| 関連タスク | TASK-SDK-01, UT-IMP-TASK-SDK-01-PHASE12-COMPLIANCE-SYNC-001                                                                                                 |

### 苦戦箇所4: docs-only Phase 11 でも validator 互換の補助成果物を残し、その用途を明記しないと warning が消えない

| 項目       | 内容                                                                                                                                                                      |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 課題       | UI 実装差分がない NON_VISUAL task でも、Phase 11 本文に `UI` や `画面証跡` が含まれると `validate-phase-output.js` が `screenshot-plan.json` と `screenshots/` を要求する |
| 再発条件   | docs-only walkthrough で manual result だけ残し、補助成果物の placeholder 方針を明文化しない                                                                              |
| 解決策     | `screenshot-plan.json` と placeholder PNG を validator compatibility 用に保存し、manual-test-result と discovered-issues で UI レビュー根拠ではないことを明記した         |
| 標準ルール | docs-only Phase 11 で validator が補助成果物を要求する場合は placeholder を保存し、用途を「validator 互換用」と文章で固定する                                             |
| 関連タスク | TASK-SDK-01, UT-IMP-TASK-SDK-01-PHASE12-COMPLIANCE-SYNC-001                                                                                                               |

### 同種課題の簡潔解決手順（3ステップ）

1. docs-only 前提だった follow-up に code hardening が入ったら、source spec / outputs / completed ledger を current facts へ戻す。
2. Step 2 対象の system spec 本文が既に current かを先に確認し、no-op なら根拠を Phase 12 成果物へ明記する。
3. parent `index.md` 再生成、docs-only Phase 11 placeholder、test/environment blocker の既存未タスク重複確認を同一ターンで閉じる。

---

