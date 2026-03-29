# Lessons Learned（教訓集） / auth / ipc / runtime skill creator

> 親仕様書: [lessons-learned.md](lessons-learned.md)
> 役割: Runtime Skill Creator IPC / workflow engine / session / resource planner 教訓
> 分割先: [lessons-learned-auth-settings-degradation-guard.md](lessons-learned-auth-settings-degradation-guard.md)（Settings契約防御・Graceful Degradation・AuthGuard timeout）

## TASK-9B: SkillCreator IPC拡張同期 再監査（2026-02-26）

## UT-IMP-RUNTIME-SKILL-CREATOR-IPC-WIRING-001 Runtime Skill Creator public IPC wiring（2026-03-21）

## TASK-SDK-02 workflow-engine-runtime-orchestration（2026-03-26）

## UT-IMP-RUNTIME-WORKFLOW-ENGINE-FAILURE-LIFECYCLE-001 Runtime workflow engine failure lifecycle（2026-03-26）

### 苦戦箇所と解決策

#### 1. `executor reject` と `success:false` を同じ failure とみなすと downstream review 契約が崩れる

| 項目 | 内容 |
| --- | --- |
| 課題 | `RuntimeSkillCreatorFacade.execute()` が reject / `success:false` / verify review required を同列に扱うと、verify pending へ誤遷移し、Task04/08 が参照する review 契約と実装がずれる |
| 原因 | `ExecutionResult` の失敗と promise reject を「どちらも失敗だから同じ snapshot でよい」とまとめ、state transition の意味論を固定していなかった |
| 解決策 | `execution_error` / `execution_failed` / `verification_review` を分離し、reject は `recordExecutionFailure()`、`success:false` は verify 非遷移の failure snapshot、review required は `awaitingUserInput` に閉じ込めた |
| 教訓 | runtime failure lifecycle は「失敗した」ではなく「どの owner が次を決めるか」で分類すると downstream contract が崩れにくい |

#### 2. failure artifact を upsert すると時系列監査が失われる

| 項目 | 内容 |
| --- | --- |
| 課題 | 同じ artifact kind を上書きすると repeated failure の履歴が消え、どの実行で何が起きたかを Phase 12 や review で再現しにくい |
| 原因 | success path の snapshot 更新パターンを failure path にも流用し、history と latest snapshot を区別していなかった |
| 解決策 | artifact 生成を append ベースへ変更し、読み出し側は latest accessor で現在値を取る構成に整理した |
| 教訓 | workflow engine の failure artifact は「履歴を append、消費は latest accessor」の二層に分けると監査性と実装単純さを両立しやすい |

#### 3. toolchain workaround を記録せずに close-out すると再検証が再現できない

| 項目 | 内容 |
| --- | --- |
| 課題 | worktree 環境では素の `pnpm vitest` が esbuild binary mismatch で落ちるため、Phase 12 に exact command を残さないと再検証者が同じ失敗を踏む |
| 原因 | blocker の存在だけ記録し、実際に PASS した回避コマンドを system spec / workflow outputs / skill update へ横展開していなかった |
| 解決策 | `ESBUILD_BINARY_PATH=... pnpm vitest ... --run` を verification command として成果物へ明記し、未タスクは既存 native binary guard を再利用する方針に固定した |
| 教訓 | 環境 blocker を新設しない場合でも、「何で PASS したか」の exact command は lessons と implementation-guide の両方へ残す必要がある |

### 同種課題向け簡潔解決手順（4ステップ）

1. reject / `success:false` / review required を別 reason に分け、verify pending へ進めてよい経路を先に固定する。
2. failure artifact は append、参照は latest accessor として owner の責務を分離する。
3. `awaitingUserInput` は `verification_review` のように次の owner が分かる reason を必ず持たせる。
4. toolchain workaround で検証した場合は PASS した exact command を Phase 12 成果物、lessons、skill logs に同値転記する。

### 苦戦箇所と解決策

#### 1. facade が public bridge と state owner を兼務したままだと downstream task の責務境界が崩れる

| 項目 | 内容 |
| --- | --- |
| 課題 | `RuntimeSkillCreatorFacade` に phase/state を残したままだと、Task03/04/08 が facade 前提で設計され、engine 導入後に route/state/UI 責務が再混在する |
| 原因 | public IPC bridge と workflow state owner を「同じ runtime service」と見なし、review / verify / resume の保存責務を facade へ寄せていた |
| 解決策 | `SkillCreatorWorkflowEngine` を新設し、`currentPhase` / `awaitingUserInput` / `verifyResult` / artifacts / `resumeTokenEnvelope` を engine の単独 owner にした |
| 教訓 | runtime orchestration では「public bridge」と「workflow state owner」を別クラスに切り分けた方が downstream handoff と spec sync が安定する |

#### 2. `terminal_handoff` 経路で executor を呼ぶと public contract は正しくても state と副作用がねじれる

| 項目 | 内容 |
| --- | --- |
| 課題 | `execute()` が `terminal_handoff` 判定後も executor 側へ進むと、public response は handoff でも内部副作用が integrated path と混線する |
| 原因 | policy 判定と state 遷移の owner が分離されておらず、「戻り値の union が合っていればよい」という認識で止まっていた |
| 解決策 | `RuntimeSkillCreatorFacade.execute()` を early return 化し、handoff は engine に handoff state だけを記録、integrated path のみ verify phase へ進めた |
| 教訓 | runtime union の検証は戻り値型だけでなく「禁止される副作用」を含めてテスト化する必要がある |

#### 3. source provenance を単一 path に頼ると resume contract と Task03 resource selection の境界が曖昧になる

| 項目 | 内容 |
| --- | --- |
| 課題 | `DEFAULT_SKILL_CREATOR_PATH` や単一 `getBasePath()` だけを前提にすると、dynamic source root / manifest snapshot / resume route snapshot の provenance が別々に漂流する |
| 原因 | resource root を compile-time constant・single-root loader・multi-root selection のどこで持つかを固定していなかった |
| 解決策 | `getSkillCreatorRootCandidates()` + `SkillCreatorSourceResolver` + `PhaseResourcePlanner` で candidate / selected / dropped を確定し、engine が `resumeTokenEnvelope.sourceProvenance` に snapshot を保持する形へ整理した |
| 教訓 | resume や downstream handoff に渡す provenance は「どの root を選び、何を落としたか」まで含む snapshot として残すと再利用しやすい |

### 同種課題向け簡潔解決手順（4ステップ）

1. `RuntimeSkillCreatorFacade` の責務を public bridge に限定し、owner 候補を `engine` / `renderer` / downstream task に棚卸しする。
2. `terminal_handoff` は early return にし、禁止すべき副作用をテストで固定する。
3. `resumeTokenEnvelope` / verify state / artifacts は同一 owner に集約する。
4. source root は `ResourceLoader` 由来の snapshot として engine に記録し、shared/preload/ipc parity test を同時に回す。

## UT-IMP-RUNTIME-WORKFLOW-ENGINE-FAILURE-LIFECYCLE-001 Runtime workflow engine failure lifecycle hardening（2026-03-26）

### 苦戦箇所と解決策

#### 1. `success:false` を verify pending に流すと response union は正しくても review contract が壊れる

| 項目 | 内容 |
| --- | --- |
| 課題 | execute 結果が `success:false` でも verify pending へ進むと、Renderer は再レビュー待ちを認識できず Task04 / Task08 の前提が崩れる |
| 原因 | `success:false` を「統合実行は終わったので verify へ送る」と解釈し、review へ戻す契約が state machine に入っていなかった |
| 解決策 | `recordExecuteResult()` を review path に寄せ、`verification_review` と `awaitingUserInput` を同時保存する形へ統一した |
| 教訓 | runtime union は `success` 値ごとの phase contract まで定義しないと、戻り値型だけ current でも state drift が起きる |

#### 2. executor reject を facade 外へ漏らすと `execute` 停滞と証跡欠落が同時に起きる

| 項目 | 内容 |
| --- | --- |
| 課題 | `skillExecutor.execute()` reject 時に state が `execute` のまま残り、失敗 artifact / `verifyResult` / review prompt が一切残らない |
| 原因 | integrated path を success response 前提で組み、例外経路の snapshot 保存 owner を決めていなかった |
| 解決策 | `RuntimeSkillCreatorFacade.execute()` で reject を catch し、engine に failure snapshot を保存した上で sanitize 済み error を返す |
| 教訓 | runtime facade は public bridge でも「engine へ失敗 snapshot を残す責務」だけは持つ必要がある |

#### 3. transition guard を追加すると plan 起点互換が壊れやすい

| 項目 | 内容 |
| --- | --- |
| 課題 | invalid jump を拒否する `assertTransition()` を入れると、既存の plan 起点 review state 初期化まで弾いてしまう |
| 原因 | guard 導入前に存在した暗黙初期化と、正式 state machine の境界が未分離だった |
| 解決策 | `ensureReviewReadyState()` を追加し、plan 起点互換の初期化だけを明示 API に分離した |
| 教訓 | state guard は「禁止遷移」と同時に「許可される互換初期化」の入口も明文化しないと後方互換を壊す |

#### 4. artifact append と upsert の曖昧さが review 再入時の監査性を落とす

| 項目 | 内容 |
| --- | --- |
| 課題 | ownership matrix は append 前提なのに実装が upsert だと、失敗履歴が潰れて再現調査しづらい |
| 原因 | artifact を「現在値 snapshot」と「phase 履歴」のどちらで扱うかが契約化されていなかった |
| 解決策 | 実装を append に揃え、親 workflow の ownership / phase-6 文書も same-wave で修正した |
| 教訓 | artifact 戦略は実装コメントではなく contract なので、append/upsert を曖昧語で残さない |

### 同種課題向け簡潔解決手順（4ステップ）

1. `success:true` / `success:false` / reject / handoff の4経路を表にして、phase / prompt / artifact を先に固定する。
2. facade は error を catch して engine へ snapshot を残し、public response は sanitize した最小情報だけ返す。
3. transition guard と互換初期化 API を対で実装し、plan 起点や resume 起点を明文化する。
4. artifact 戦略は append/upsert のどちらかに揃え、tests と ownership matrix を同ターンで更新する。

## TASK-SDK-08 session-persistence-and-resume-contract（2026-03-26）

### 苦戦箇所と解決策

#### 1. `resumeTokenEnvelope` をそのまま永続化契約とみなすと runtime snapshot と checkpoint responsibility が混線する

| 項目 | 内容 |
| --- | --- |
| 課題 | engine が持つ `resumeTokenEnvelope` をそのまま保存形式とみなすと、route drift / provenance drift / stale write rule を evaluator へ閉じ込めにくい |
| 原因 | runtime snapshot と persisted payload を別責務として分けていなかった |
| 解決策 | Task08 で `resumeTokenEnvelope` は runtime snapshot、persisted checkpoint は repository 契約として別型に分け、compatibility evaluator が両者を比較する構成にした |
| 教訓 | resume 用 snapshot と persistence 用 contract は「似ていても別物」として切り分けた方が silent resume を防ぎやすい |

#### 2. channel 追加がなくても persistence/resume 契約整理は system spec Step 2 の対象になる

| 項目 | 内容 |
| --- | --- |
| 課題 | public IPC をまだ増やしていないため Phase 12 を no-op と誤認しやすかった |
| 原因 | Step 2 を「新規 channel の有無」だけで判定していた |
| 解決策 | owner / provenance / persisted contract / resume namespace rule を architecture / services / task-workflow へ same-wave で追補した |
| 教訓 | runtime orchestration 系 task は channel 不変でも、state owner と persistence contract の整理があれば Step 2 対象として扱う |

### follow-up: verify_result append drift 是正（UT-IMP-RUNTIME-WORKFLOW-VERIFY-ARTIFACT-APPEND-001 / 2026-03-26）

| 項目 | 内容 |
| --- | --- |
| 課題 | engine 導入後も `verify_result` が一部 upsert のままだと、latest state は正しくても artifact 正本から failure history を再構成できない |
| 原因 | owner 分離は完了していたが、pending/fail の履歴戦略を `recordExecuteResult()` / `recordVerifyFailure()` の双方で append に統一し切れていなかった |
| 解決策 | `appendArtifact()` を導入し、`execute_result` / `verify_result` を時系列で残す current fact へ是正した |
| 教訓 | workflow engine follow-up では「owner が正しいか」だけでなく、「latest snapshot と artifact ledger の append/upsert 方針が一致しているか」まで再監査する必要がある |
### 苦戦箇所と解決策

#### 1. public surface は `skillCreatorHandlers.ts` なのに runtime 実装だけ `creator:*` に分岐していた

| 項目 | 内容 |
| --- | --- |
| 課題 | runtime 用 `creatorHandlers.ts` が未登録のまま残り、public `skill-creator:*` surface と contract drift を起こしていた |
| 原因 | capability bridge 実装時に internal helper と public handler の責務境界を分けず、別 namespace を暫定追加していた |
| 解決策 | `creatorHandlers.ts` を internal runtime helper に再構成し、`skillCreatorHandlers.ts` entrypoint から `skill-creator:plan/execute-plan/improve-skill` を登録する形へ統一した |
| 教訓 | Electron IPC は「handler を増やす」のではなく「public surface の入口を増やさない」を優先すると drift が減る |

#### 2. preload/main の runtime contract が shared に存在せず、型の重複先がぶれていた

| 項目 | 内容 |
| --- | --- |
| 課題 | `RuntimeSkillCreatorFacade` の戻り値型と Preload API の公開型が別々に存在し、将来の IPC drift 余地が大きかった |
| 原因 | 追加した runtime bridge を「内部実装」と見なし、public IPC contract として shared 型へ上げていなかった |
| 解決策 | `TerminalHandoffBundle` と runtime plan/execute/improve response を `packages/shared/src/types/skillCreator.ts` に集約した |
| 教訓 | public IPC で renderer に見える payload は、使用中 UI がなくても shared contract に昇格させた方が保守しやすい |

#### 3. DI 不在時に「handler 未登録」にするか「一定エラー応答」にするかの判断

| 項目 | 内容 |
| --- | --- |
| 課題 | `SkillExecutor` 未初期化時に handler 登録自体をスキップすると、Renderer からは `No handler registered` になり UX と監査が不安定になる |
| 原因 | graceful degradation を registration failure の文脈だけで考え、public channel の安定性を別扱いしていた |
| 解決策 | handler は常に登録し、runtime service がなければ `"Runtime Skill Creator は現在利用できません"` を返す契約にした |
| 教訓 | public IPC では「channel missing」より「一定の failure envelope」を返す方がデバッグと仕様同期が楽になる |

### 同種課題向け簡潔解決手順（4ステップ）

1. `channels.ts` を起点に public channel 名を決め、preload/main/helper を同時に合わせる。
2. shared contract を先に定義し、戻り値型のローカル重複を避ける。
3. 既存 entrypoint から内部 helper を登録する形に寄せ、dead-end namespace を増やさない。
4. runtime DI が欠ける経路は handler missing ではなく graceful degradation で固定する。

### タスク概要

| 項目       | 内容                                                                                                         |
| ---------- | ------------------------------------------------------------------------------------------------------------ |
| タスクID   | TASK-9B                                                                                                      |
| 目的       | SkillCreator IPC拡張実装（13チャンネル）とシステム仕様書のドリフトを解消し、再利用可能な運用知見へ落とし込む |
| 完了日     | 2026-02-26                                                                                                   |
| ステータス | **完了**                                                                                                     |

### 苦戦箇所と解決策

#### 1. IPCチャンネル契約数（6/13）の混在

| 項目   | 内容                                                                                           |
| ------ | ---------------------------------------------------------------------------------------------- |
| 課題   | 基盤実装の6チャンネル記述と拡張実装の13チャンネル実体が混在し、仕様書ごとに記述がずれた        |
| 原因   | TASK-9B-H（基盤）とTASK-9B（拡張）の仕様同期を同一ターンで束ねていなかった                     |
| 解決策 | `channels.ts` を正本にして `interfaces/security/task/lessons` を一括更新し、13チャンネルへ統一 |
| 教訓   | IPC拡張は「実装完了」より先に「契約数の正本確定」を行うとドリフトを抑制できる                  |

#### 2. createハンドラーのP42 3段バリデーション未完了

| 項目   | 内容                                                                                   |
| ------ | -------------------------------------------------------------------------------------- |
| 課題   | `create` だけ `trim()` 空白検証が欠落し、P42運用に穴があった                           |
| 原因   | 既存ハンドラー改修の水平展開時に、チェック項目の統一基準が暗黙運用だった               |
| 解決策 | `skillCreatorHandlers.ts` に型/空文字/trim空文字を実装し、空文字・空白回帰テストを追加 |
| 教訓   | P42は「実装 + 回帰テスト」までを1セットで完了判定しないと再発する                      |

#### 3. 未タスク監査のcurrent/baseline混同

| 項目   | 内容                                                                                            |
| ------ | ----------------------------------------------------------------------------------------------- |
| 課題   | 全体監査の違反数を今回差分違反と誤認し、不要な是正作業に流れやすい                              |
| 原因   | `audit-unassigned-tasks --json` と `--diff-from HEAD` の役割差を明示していなかった              |
| 解決策 | 合否判定は `--diff-from HEAD` の `currentViolations` に固定し、全体監査値は監視値として分離記録 |
| 教訓   | 監査値は「current=合否」「baseline=既存負債」の2軸で扱うと判断が安定する                        |

### 同種課題向け簡潔解決手順（5ステップ）

1. `channels.ts` を正本にして契約数・型・方向（invoke/on）を確定する。
2. IPCハンドラーは全invokeで `validateIpcSender` + P42 3段バリデーションを適用する。
3. 仕様同期は `interfaces/security/task/lessons` を SubAgent 分担で同時に更新する。
4. `verify-all-specs` / `validate-phase-output` / `verify-unassigned-links` / `audit --diff-from HEAD` を連続実行する。
5. `spec-update-summary.md` と `unassigned-task-detection.md` に最終数値・時刻を記録して完了判定する。

### 成果物

| 成果物               | パス                                                                                                    |
| -------------------- | ------------------------------------------------------------------------------------------------------- |
| 実行ワークフロー     | `docs/30-workflows/completed-tasks/task-9b-skill-creator/`                                              |
| 仕様更新サマリー     | `docs/30-workflows/completed-tasks/task-9b-skill-creator/outputs/phase-12/spec-update-summary.md`       |
| 未タスク検出レポート | `docs/30-workflows/completed-tasks/task-9b-skill-creator/outputs/phase-12/unassigned-task-detection.md` |
| 整合性監査台帳       | `docs/30-workflows/completed-tasks/task-9b-skill-creator/outputs/phase-12/elegant-solution-audit.md`    |

---

## TASK-SDK-03〜06 / UT-IMP-RUNTIME-WORKFLOW-VERIFY-ARTIFACT-APPEND-001 追加教訓（2026-03-27）

### 苦戦箇所と解決策

#### 1. アーティファクトID生成の複雑性（TASK-SDK-03/06）

| 項目 | 内容 |
| --- | --- |
| 課題 | 単純 counter ベースのアーティファクト ID 生成では、同じ phase/kind ペアで複数回 append する際に sequence が衝突し、履歴の一意性が保てない |
| 原因 | phase+kind 複合 counter への移行時に、append 回数の算出元を既存 artifact リストの filter count に統一する判断が遅れた |
| 解決策 | `state.phaseArtifacts.filter(a => a.phase === phase && a.kind === kind).length + 1` で sequence を算出し、phase+kind ペアごとの一意性を保証した |
| 教訓 | workflow artifact の ID 生成は「phase+kind+sequence」の複合キーで設計し、append 回数は既存リストからの動的算出に限定すると衝突を防げる |

#### 2. 多層リソース意思決定（PhaseResourcePlanner）（TASK-SDK-03）

| 項目 | 内容 |
| --- | --- |
| 課題 | manifest 解決 → リソース選択 → 予算強制の3段階で、各段階の責務境界が曖昧になり、tier ベースの段階的リソース削減ロジックが facade に漏れた |
| 原因 | optional-deep-dive → optional-quality → required-context の tier 階層を「単なるフィルタ」と見なし、planner クラスとして独立させる判断が遅れた |
| 解決策 | `SkillCreatorSourceResolver`（候補解決）→ `PhaseResourcePlanner`（tier 選択・予算強制）→ `ResolvedResourceReader`（読み出し）に3分離し、facade は pipeline を呼ぶだけに限定した |
| 教訓 | リソース選択が3段階以上になる場合は、resolver / planner / reader を独立クラスに分離した方が tier ロジックのテストと再利用が安定する |

#### 3. IPC/Preload/Shared 型境界管理（TASK-SDK-04/05）

| 項目 | 内容 |
| --- | --- |
| 課題 | ローカル型（`AwaitingUserInput`）を共有型（`packages/shared/`）の `UserInputRequest` へ外部化する際に、型名リネームが IPC / Preload / Main 全レイヤーで同時に必要となり、部分的なリネームが compile error を連鎖させた |
| 原因 | 型の外部化を「shared に移すだけ」と見なし、リネーム影響範囲（channels.ts / skill-api.ts / handler / facade / engine）の全レイヤー同時更新を計画に入れていなかった |
| 解決策 | 型外部化時に「影響レイヤー一覧表（shared → preload → handler → facade → engine → test）」を先に作成し、全レイヤーを1コミットで同時更新する手順に固定した |
| 教訓 | IPC 境界の型リネームは「shared 側の rename → 全消費者の grep → 同時更新」を atomic に行い、中間状態を許容しない |

#### 4. Verify Detail 証拠追跡（TASK-SDK-06）

| 項目 | 内容 |
| --- | --- |
| 課題 | artifact + provenance + route + phase の複合 evidence を管理する verify detail で、disable 理由の4段階判定（not_verified / no_artifact / incomplete_provenance / route_mismatch）が当初 2段階しかなく、ユーザーへの説明が不十分だった |
| 原因 | verify check の自動生成を layer3 / layer4 で分けた際に、各 layer が必要とする evidence 項目を事前に棚卸ししていなかった |
| 解決策 | `getVerifyDetail()` で artifact / provenance / route / phase の4軸を個別に検証し、欠落軸ごとの disable 理由を返す構成にした。layer3 / layer4 の verify check 自動生成も evidence 4軸に基づいて出力する |
| 教訓 | verify detail のような複合 evidence 管理は、先に evidence 軸（artifact / provenance / route / phase）を列挙し、各軸の存在/欠落が disable 理由にどう対応するかをマトリクスで設計してからコードに入ると手戻りが少ない |

### 同種課題向け簡潔解決手順（4ステップ）

1. artifact ID は phase+kind+sequence の複合キーで設計し、sequence は既存リストの filter count から動的算出する。
2. リソース意思決定が3段階以上なら resolver / planner / reader を独立クラスに分離する。
3. IPC 境界の型リネームは影響レイヤー一覧表を先に作成し、全レイヤーを atomic に同時更新する。
4. verify detail の evidence 管理は、evidence 軸を先に列挙し、disable 理由マトリクスを設計してから実装に入る。

---

## TASK-RT-06: SDK Event Normalizer 実装知見

### 背景
Claude Code SDK の `SDKMessage` を `SkillCreatorSdkEvent` へ変換する normalizer を設計・実装。

### 苦戦箇所

#### 1. sessionId 伝播設計
- **課題**: `init` メッセージの sessionId を後続の assistant/result メッセージに伝播する必要があるが、各メッセージは独立して変換されるため状態管理が必要
- **解決**: `normalizeSdkStream()` がストリーム全体を走査し、init から sessionId を抽出して後続メッセージに注入する設計を採用
- **教訓**: stateless な変換関数（normalizeSdkMessage）と stateful なストリーム変換（normalizeSdkStream）を分離することで、単体テストが容易になる

#### 2. 型安全と `unknown` 入力の扱い
- **課題**: IPC経由で受け取るメッセージが `unknown[]` のため、型ガードが必要
- **解決**: normalizer 内部で type フィールドの存在確認と値検証を行い、不正な入力は errorイベントに変換
- **教訓**: 境界層（IPC/preload）では `unknown` を受け取り、内部で段階的に型を絞り込む設計が安全

#### 3. Branch カバレッジの壁（91.22%止まり）
- **課題**: null/undefined 入力の一部ブランチをテストしきれなかった
- **解決**: 実用上重要なパス（sessionId欠損、permission denial、未知type）を優先してテスト
- **教訓**: 100% branch coverage より「重要なパスの完全カバー」を優先する方針が現実的

### 設計パターン
- **Facade注入**: normalizer を RuntimeSkillCreatorFacade に DI することで、テスト時のモック置き換えが容易
- **IPC境界**: `skill-creator:normalize-sdk-messages` チャネルを新設し、renderer側からの変換リクエストを受け付ける設計

---
