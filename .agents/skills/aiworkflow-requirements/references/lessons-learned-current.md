# Lessons Learned（教訓集） / current summary

> 親仕様書: [lessons-learned.md](lessons-learned.md)
> 役割: current summary

## メタ情報

| 項目     | 値                                                                     |
| -------- | ---------------------------------------------------------------------- |
| 正本     | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md` |
| 目的     | タスク実行時の苦戦箇所と解決策を記録し、将来の開発効率を向上           |
| スコープ | 実装過程で遭遇した課題、解決策、コード例                               |
| 対象読者 | AIWorkflowOrchestrator 開発者                                          |

---

## 変更履歴

| 日付 | バージョン | 変更内容 |
|------|-----------|----------|
| 2026-03-15 | 1.29.94 | TASK-SKILL-LIFECYCLE-05 の苦戦箇所6（Phase 12 本文と成果物の実績乖離）を追加。`phase-12-documentation` / `documentation-changelog` / `spec-update-summary` の同値同期ルールを追記 |
| 2026-03-15 | 1.29.93 | TASK-SKILL-LIFECYCLE-05 の苦戦箇所4（Record パターン ScoringGate 網羅性）・苦戦箇所5（artifacts.json 逐次更新忘れ）を追加。変更履歴を最新10件に圧縮し、2026-03-11以前の教訓を専用ファイルへ移動 |
| 2026-03-15 | 1.29.92 | TASK-SKILL-LIFECYCLE-05 再監査を追補。Phase 11 screenshot 必須成果物（checklist/result/plan + TC証跡）欠落時の復旧手順、docs-heavy の review board fallback、Phase 12 implementation-guide literal 要件（Part1 why-first / Part2 usage+edge cases）の充足手順を追加 |
| 2026-03-14 | 1.29.91 | TASK-SKILL-LIFECYCLE-04 の system spec 同一 wave 同期を追補。`workflow-skill-lifecycle-evaluation-scoring-gate.md` を統合正本として追加し、current canonical set / artifact inventory / legacy path 互換 / mirror parity 手順を固定 |
| 2026-03-14 | 1.29.90 | TASK-IMP-WORKSPACE-CHAT-EDIT-AI-RUNTIME-001 の実装教訓 P57〜P61 を追加。AuthMode 値乖離、同名ファイル二重存在、Preload API 未公開、サービススコープ制限、動的アダプタ注入の5教訓と5ステップ解決手順を追記 |
| 2026-03-14 | 1.29.89 | TASK-IMP-AI-RUNTIME-AUTHMODE-UNIFICATION-001 の Phase 12 再確認追補を反映。再参照既存未タスクが `target-file` 監査で current 違反になり得る点を追加し、`audit-unassigned-tasks --target-file` で是正確認する運用を明文化 |
| 2026-03-14 | 1.29.88 | TASK-IMP-WORKSPACE-CHAT-EDIT-AI-RUNTIME-001 / TASK-IMP-CLAUDE-CODE-TERMINAL-SURFACE-001 の再監査教訓を追補。`electron-vite dev` の esbuild platform mismatch で実画面 capture が詰まる条件、fallback review board 証跡化、`chatEditAPI` payload 契約（object vs positional）ドリフト是正を追加 |
| 2026-03-14 | 1.29.87 | TASK-IMP-AI-RUNTIME-AUTHMODE-UNIFICATION-001 の follow-up 教訓を追補。Phase 4 契約テストと Phase 6 回帰テストの責務混線を `UT-AI-RUNTIME-TEST-SEPARATION-CRITERIA-001` として未タスク化し、境界定義と重複防止手順を追加 |
| 2026-03-12 | 1.29.83 | TASK-IMP-TASK-SPECIFICATION-CREATOR-LINE-BUDGET-REFORM-001 の教訓を追加。large skill docs は `SKILL.md` を入口に保ち、family file と rolling `LOGS.md` + archive へ責務分離し、`.claude` 正本更新後に `.agents` mirror と validator 3点セットを同期する手順を標準化 |
| 2026-03-12 | 1.29.82 | TASK-IMP-LIGHT-THEME-CONTRAST-REGRESSION-GUARD-001 の Phase 12 再確認を追補。workflow baseline backlog `64` と global `docs/30-workflows/unassigned-task/` legacy `134` を分離して報告するルール、および Task 5 で `skill-creator` まで同期した場合は `skill-feedback-report` / `documentation-changelog` / `spec-update-summary` の3ファイルへ同値転記するルールを追加 |
| 2026-03-06 | 1.29.43 | UT-IMP-AIWORKFLOW-SKILL-ENTRYPOINT-COVERAGE-GUARD-001 を追加。`aiworkflow-requirements` が 145 warning を残す理由を「大規模 reference スキルの入口設計と validator 前提の不整合」として分離し、`SKILL.md` / `quick-reference.md` / `resource-map.md` の三層入口と validator 整合を未タスク化した |

> 以前の変更履歴（2026-03-11以前）は各専用ファイル（lessons-learned-*.md）の archive を参照してください。

---

## 最新教訓

### 2026-03-16 TASK-IMP-SKILL-DOCS-AI-RUNTIME-001

#### 教訓1: Constructor Injection による queryFn 差替パターン

| 項目 | 内容 |
| --- | --- |
| 状況 | SkillDocGenerator の stubQueryFn を LLMDocQueryAdapter.query() に差し替える必要があった |
| 解決策 | `adapter.query.bind(adapter)` で既存の `LLMQueryFn` シグネチャに合わせることで、SkillDocGenerator 自体に変更を加えずに adapter を注入できた（Open-Closed Principle） |
| 適用範囲 | 他の LLM 統合箇所（chat-edit, agent-execution 等）でも同パターンが適用可能 |
| 関連タスク | TASK-IMP-SKILL-DOCS-AI-RUNTIME-001 |

#### 教訓2: CapabilityResolver パターンの再利用性

| 項目 | 内容 |
| --- | --- |
| 状況 | Skill Docs の capability 判定（integrated-api / guidance-only / terminal-handoff）を3パスで実装 |
| 解決策 | ILLMDocQueryAdapter インターフェースの isAvailable() / getProviderName() を基に resolver が判定する疎結合設計 |
| 注意 | terminal-handoff は事後判定（LLM呼出し失敗後の fallback）であり、事前判定には isAvailable() では不十分。実LLM接続テストが必要（UT-SKILL-DOCS-TERMINAL-HANDOFF-001 として未タスク化） |
| 関連タスク | TASK-IMP-SKILL-DOCS-AI-RUNTIME-001 |

#### 教訓3: Phase 4-5 統合実行の効率性

| 項目 | 内容 |
| --- | --- |
| 状況 | Phase 4（テスト作成 Red）と Phase 5（実装 Green）を別エージェントで実行しようとした |
| 解決策 | TDD の Red-Green サイクルを1エージェントで統合実行するほうが、型定義→テスト→実装のコンテキスト切替コストが低く効率的だった |
| 適用範囲 | 今後の Phase 4-5 実行時は統合エージェントを推奨 |
| 関連タスク | TASK-IMP-SKILL-DOCS-AI-RUNTIME-001 |

#### 同種課題の簡潔解決手順（3ステップ）

1. LLM adapter 差し替えは `bind()` パターンで既存シグネチャに合わせ、Generator クラス本体を変更しない。
2. CapabilityResolver の terminal-handoff パスは「失敗後 fallback」として設計し、事前判定と混在させない。
3. Phase 4-5 は同一エージェントで Red-Green サイクルを完結させる。

---

### 2026-03-15 TASK-SKILL-LIFECYCLE-05

#### 苦戦箇所1: Phase 11 の必須成果物が揃っておらず screenshot coverage validator が失敗する

| 項目 | 内容 |
| --- | --- |
| 課題 | `manual-test-result.md` のみで運用し、`manual-test-checklist.md` と `screenshot-plan.json` が欠落した状態で再監査に進んでしまった |
| 再発条件 | 「スクリーンショットがあるから十分」と判断し、validator 前提ファイルを確認しない |
| 解決策 | `outputs/phase-11/` を `checklist/result/plan/screenshots` の4点セットで再構成し、TC-11-01〜05 の証跡を 1:1 で再紐付けした |
| 標準ルール | Phase 11 完了判定は `validate-phase11-screenshot-coverage` PASS を必須にし、必須ファイル欠落を残さない |

#### 苦戦箇所2: docs-heavy task の画面検証が build 依存で停止する

| 項目 | 内容 |
| --- | --- |
| 課題 | current build での capture が環境要因で不安定なとき、画面検証の証跡収集が止まりやすい |
| 再発条件 | fallback 経路を事前定義せず、実画面 capture 成功だけを前提に運用する |
| 解決策 | source screenshot を current workflow に集約し、review board 1件を current workflow で新規 capture、metadata で source と用途を明記した |
| 標準ルール | docs-heavy + screenshot要求時は review board fallback を許容し、source / review board / metadata を同時に記録する |

#### 苦戦箇所3: implementation-guide の literal 要件漏れで Phase 12 が失敗する

| 項目 | 内容 |
| --- | --- |
| 課題 | Part 1 の「なぜ先行」と Part 2 の「使用例」「エッジケース」が欠けると validator で fail する |
| 再発条件 | 内容は充実していても、validator が見る literal 見出し・語句を満たさない |
| 解決策 | Part 1 冒頭に why-first を追加し、Part 2 に API 使用例セクションとエッジケースセクションを明示追加した |
| 標準ルール | implementation-guide は内容品質だけでなく validator literal 互換を同時に満たす |

#### 苦戦箇所4: Record パターンでの ScoringGate 網羅性保証

| 項目 | 内容 |
| --- | --- |
| 課題 | switch 文で ScoringGate の4段階を分岐しようとしたが、新しい段階が追加された場合にコンパイルエラーにならない。exhaustive check の `default: never` パターンも検討したが、静的マッピングの方が安全だった |
| 再発条件 | ユニオン型の分岐に switch 文を使い、exhaustive check を忘れる |
| 解決策 | `Record<ScoringGate, CTAVisibility>` で全キーの定義を型レベルで強制する。キーが不足するとコンパイルエラーになるため、網羅性が保証される |
| 標準ルール | ユニオン型の全ケース網羅には `Record<UnionType, Config>` パターンを使う（02-code-quality.md 準拠） |
| 関連タスク | TASK-SKILL-LIFECYCLE-05 |

#### 苦戦箇所5: 設計タスクの artifacts.json 逐次更新忘れ

| 項目 | 内容 |
| --- | --- |
| 課題 | 49成果物を全て作成済みだったが、artifacts.json の phase status が全て `not_started` のまま放置。3つの並列検証エージェントで全Phase PASS を確認した後に初めて発見した |
| 再発条件 | 設計タスクでは「コードを書かない」前提があり、状態ファイルの更新が後回しにされる |
| 解決策 | 各Phase完了ごとに artifacts.json の status, artifacts 配列, acceptanceCriteria を逐次更新。最終的に status: "completed" + 全AC verified: true に更新した |
| 標準ルール | artifacts.json は Phase 完了の正式記録であり、成果物作成と同時に更新する |
| 関連タスク | TASK-SKILL-LIFECYCLE-05 |

#### 苦戦箇所6: Phase 12 本文と成果物の実績が乖離する

| 項目 | 内容 |
| --- | --- |
| 課題 | `phase-12-documentation.md` が `not_started` のまま、`documentation-changelog.md` に「実装タスクで後続対応」といった計画文が残り、成果物実体と矛盾した |
| 再発条件 | outputs 実体更新後に本体仕様書と changelog を同時更新しない |
| 解決策 | `phase-12-documentation.md` / `documentation-changelog.md` / `spec-update-summary.md` の3点を同一ターンで更新し、planned wording を除去した |
| 標準ルール | Phase 12 は実績ログのみを残し、計画文は残さない |
| 関連タスク | TASK-SKILL-LIFECYCLE-05 |

#### 同種課題の簡潔解決手順（5ステップ）

1. Phase 11 開始時に `checklist/result/plan/screenshots` の4点セットを先に作る。
2. screenshot 取得は「実画面試行 → fallback review board → metadata固定」の順で閉じる。
3. Phase 12 は `implementation-guide` の literal 要件を先に満たしてから詳細説明を肉付けする。
4. `phase-12-documentation.md` / `documentation-changelog.md` / `spec-update-summary.md` を同時に更新して整合を固定する。
5. 最終判定で `verify-all-specs` / `validate-phase-output` / `validate-phase11-screenshot-coverage` / `validate-phase12-implementation-guide` を連続実行する。

---

### 2026-03-14 TASK-SKILL-LIFECYCLE-04

#### 苦戦箇所1: 未タスク配置先ドリフトで指定ディレクトリ監査が不成立になる

| 項目 | 内容 |
| --- | --- |
| 課題 | 未タスクを `docs/30-workflows/skill-lifecycle-unification/tasks/unassigned-task/` に置いたため、`--target-file` 監査境界と衝突した |
| 再発条件 | workflow ローカル path を temporary 運用のまま台帳反映する |
| 解決策 | root canonical path（`docs/30-workflows/unassigned-task/`）へ再配置し、`phase-12-documentation` / `unassigned-task-detection` / `task-workflow-backlog` / `interfaces` 参照を同ターン更新した |
| 標準ルール | active 未タスクは root canonical path を正本とし、workflow ローカル path は使わない |

#### 苦戦箇所2: `current`/`baseline` と配置可否を同一判定にすると報告が崩れる

| 項目 | 内容 |
| --- | --- |
| 課題 | 監査値だけで「指定ディレクトリに置けているか」を判定しようとして説明が曖昧になった |
| 再発条件 | 配置可否・link整合・監査値を 1 つの数値で報告する |
| 解決策 | `配置可否`、`verify-unassigned-links`、`audit --diff-from HEAD --target-file` を3軸で分離記録した |
| 標準ルール | `currentViolations=0` は品質判定、配置可否は別項目として必ず明記する |

#### 苦戦箇所3: system spec の同期対象を絞りすぎると same-wave が崩れる

| 項目 | 内容 |
| --- | --- |
| 課題 | workflow 成果物だけ更新して `resource-map` / `quick-reference` / `legacy register` / `LOGS` を後回しにすると、再利用入口が stale になる |
| 再発条件 | 「実装記録は完了したので index は後でよい」と判断する |
| 解決策 | `workflow-skill-lifecycle-evaluation-scoring-gate.md` を統合正本として追加し、`current canonical set` と `artifact inventory` を起点に parent docs / ledger / indexes / logs を同一 wave で同期した |
| 標準ルール | Phase 12 の close-out は `workflow + parent docs + task-workflow + lessons + indexes + LOGS + mirror` を最小単位とする |

#### 同種課題の簡潔解決手順（4ステップ）

1. MINOR 検出時に未タスク指示書を root `docs/30-workflows/unassigned-task/` へ作成する。
2. 指示書は 9セクション形式（`## 1..9` + `3.5`）で作り、親タスク苦戦箇所を継承する。
3. `task-workflow-backlog` / 関連仕様書 / workflow outputs の参照を同ターンで更新する。
4. `verify-unassigned-links` と `audit --diff-from HEAD --target-file` で link と品質を分離検証する。

---

### 2026-03-14 TASK-IMP-WORKSPACE-CHAT-EDIT-AI-RUNTIME-001（P57〜P61）

#### P57: 設計書と実コードの AuthMode 値の乖離

| 項目 | 内容 |
| --- | --- |
| 課題 | 設計ドキュメントでは AuthMode を `"integrated"` / `"terminal"` / `"hybrid"` の3値で定義したが、実コードベースでは `"subscription" \| "api-key"` の2値。RuntimeResolver の実装時に解決テーブルの全面書き直しが必要だった |
| 再発条件 | Phase 2（設計）で想定値を使い、実コードの型定義を検証しない |
| 解決策 | Phase 1（要件定義）で `grep -rn "AuthMode" packages/shared/` を実行し、正本の型定義値を確認する。設計書で想定値を使う前に必ず実コードの型を検証 |
| 標準ルール | 設計書で列挙型の値を参照するときは、実コードの型定義を正本として先に確認する |
| 関連タスク | TASK-IMP-WORKSPACE-CHAT-EDIT-AI-RUNTIME-001 |

#### P58: 同名ファイルの二重存在（chatEditHandlers.ts）

| 項目 | 内容 |
| --- | --- |
| 課題 | `apps/desktop/src/main/handlers/chatEditHandlers.ts` と `apps/desktop/src/main/ipc/chatEditHandlers.ts` の2つが存在し、実際に `ipc/index.ts` から import されているのは `ipc/chatEditHandlers.ts` だった。設計書は `handlers/chatEditHandlers.ts` を参照しており、誤ったファイルを修正するリスクがあった |
| 再発条件 | 設計書のファイルパスを信じて修正対象を決め、実際の import 元を確認しない |
| 解決策 | 修正対象ファイルの特定には `grep -rn "import.*chatEditHandlers" apps/desktop/src/main/` で実際の import 元を確認する |
| 標準ルール | 同名ファイルが複数ディレクトリに存在する場合、`grep import` で実際に使用されている方を正本とする |
| 関連タスク | TASK-IMP-WORKSPACE-CHAT-EDIT-AI-RUNTIME-001 |

#### P59: Preload API 未公開（exposeChatEditAPI 呼び出し欠落）

| 項目 | 内容 |
| --- | --- |
| 課題 | `chatEditApi.ts` に `exposeChatEditAPI()` 関数は定義されていたが、`preload/index.ts` で一切呼ばれておらず、`chatEditAPI` が Renderer に完全に未公開だった。他の全 API（electronAPI, agentAPI 等）は contextBridge 経由で公開済みだった |
| 症状 | `window.chatEditAPI` が `undefined` で全ての chat-edit IPC 呼び出しが失敗 |
| 再発条件 | 新規 Preload API を定義するだけで `preload/index.ts` の `contextBridge.exposeInMainWorld()` ブロックへの追記を忘れる |
| 解決策 | 新規 Preload API を追加した場合、`preload/index.ts` の `contextBridge.exposeInMainWorld()` ブロックと else ブロックの両方に追記されているか必ず確認する |
| 再発防止 | `grep -c "exposeInMainWorld" preload/index.ts` と `grep -c "chatEditAPI\|slideApi\|agentAPI" preload/index.ts` で API 公開数を監査 |
| 関連パターン | M-01（contextBridge 未使用）、P23（API二重定義の型管理複雑性） |
| 関連タスク | TASK-IMP-WORKSPACE-CHAT-EDIT-AI-RUNTIME-001 |

#### P60: createAuthModeService のスコープ制限

| 項目 | 内容 |
| --- | --- |
| 課題 | `ipc/index.ts` で `createAuthModeService(authKeyService)` が `track("registerAuthModeHandlers", ...)` コールバック内で呼ばれており、そのスコープ外（chat-edit ハンドラ登録ブロック）からは参照できなかった。chat-edit ハンドラにも authModeService が必要だったため、別インスタンスを生成する必要があった |
| 再発条件 | 複数のハンドラ登録ブロックで同じサービスが必要なのに、外側スコープに引き上げない |
| 解決策 | 複数のハンドラ登録ブロックで同じサービスが必要な場合、外側スコープで生成するか、各ブロック内で `createXxxService()` を呼ぶ |
| 標準ルール | サービスの共有スコープは「最も外側の共通消費者」に合わせて配置する |
| 関連パターン | P34（遅延初期化 DI パターン選択） |
| 関連タスク | TASK-IMP-WORKSPACE-CHAT-EDIT-AI-RUNTIME-001 |

#### P61: ChatEditService の動的アダプタ注入

| 項目 | 内容 |
| --- | --- |
| 課題 | ChatEditService はコンストラクタで LLMAdapter を受け取る設計だが、RuntimeResolver の結果（API キー有無）によって adapter が変わるため、毎回 `new ChatEditService(resolution.adapter, contextBuilder)` で生成する方式を採用。stubLLMAdapter を置き換える際、Setter Injection ではなく Factory パターンに近い動的生成が最適だった |
| 再発条件 | adapter が呼び出し時の状態に依存するのに、インスタンスをキャッシュする |
| 解決策 | adapter が呼び出し時の状態に依存する場合は、毎回 new でインスタンスを生成する。API キーが変更される可能性を考慮すると、キャッシュを避ける |
| 標準ルール | DI 対象が実行時コンテキスト依存（認証状態等）の場合は Factory パターンで毎回生成する |
| 関連パターン | P34（遅延初期化 DI） |
| 関連タスク | TASK-IMP-WORKSPACE-CHAT-EDIT-AI-RUNTIME-001 |

#### 同種課題の簡潔解決手順（5ステップ）

1. Phase 1 で `grep -rn "AuthMode\|ChatEdit" packages/shared/ apps/desktop/src/` を実行し、実コードの型定義値と既存ファイル配置を先に確認する。
2. 同名ファイルがある場合は `grep -rn "import.*FileName"` で実際の import 元を特定し、正本を決定する。
3. 新規 Preload API は定義後に `preload/index.ts` の `contextBridge.exposeInMainWorld()` と else ブロックの両方に追記を確認する。
4. サービスの共有スコープは消費者ブロックの共通親に引き上げるか、各ブロック内で `createXxxService()` を呼ぶ。
5. DI 対象が認証状態依存の場合は Factory パターンで毎回生成し、キャッシュを避ける。

---

### 2026-03-14 TASK-IMP-AI-RUNTIME-AUTHMODE-UNIFICATION-001（Phase 12 再確認追補）

#### 苦戦箇所: 既存未タスクを再参照しても、対象ファイル自体が10見出し要件を満たしていない場合がある

| 項目 | 内容 |
| --- | --- |
| 課題 | `unassigned-task-detection.md` で「既存未タスクを再利用」と記録しても、`audit-unassigned-tasks --target-file` では current 違反が出るケースがあった |
| 再発条件 | diff監査（`--diff-from HEAD`）だけで完了判定し、再参照した既存未タスク本文を個別監査しない |
| 解決策 | 再参照した各未タスクに対して `audit-unassigned-tasks --target-file` を実行し、違反があれば同ターンで9見出しへ是正した |
| 標準ルール | Phase 12 の「新規未タスク0件」判定時でも、再参照した既存未タスクは `target-file` 監査で `currentViolations=0` を確認する |

#### 同種課題の簡潔解決手順（5ステップ）

1. `verify-unassigned-links --source .../task-workflow.md` で参照切れを先に潰す。
2. `audit-unassigned-tasks --json --diff-from HEAD` で今回差分の合否（current）を確認する。
3. `unassigned-task-detection.md` で再参照した既存未タスクを列挙する。
4. 各ファイルへ `audit-unassigned-tasks --target-file <path>` を実行し、current違反を確認する。
5. 違反があれば同ターンで9見出し是正し、再実行で `currentViolations=0` を固定する。

---

### 2026-03-14 TASK-IMP-WORKSPACE-CHAT-EDIT-AI-RUNTIME-001 / TASK-IMP-CLAUDE-CODE-TERMINAL-SURFACE-001

#### 苦戦箇所1: current build screenshot が esbuild platform mismatch で停止する

| 項目 | 内容 |
| --- | --- |
| 課題 | `electron-vite dev` が `@esbuild/darwin-arm64` / `@esbuild/darwin-x64` 不一致で起動できず、Phase 11 の実画面 capture が中断した |
| 再発条件 | worktree の node 実行アーキと lockfile 由来 binary がずれている状態で capture script を実行する |
| 解決策 | 当日中に fallback review board capture を current workflow 配下で生成し、`phase11-capture-metadata.json` へ理由と source を固定した |
| 標準ルール | 明示 screenshot 要求時は「実画面試行ログ → fallback 実行 → metadata 記録 → coverage validator PASS」まで同一ターンで閉じる |

#### 苦戦箇所2: chatEdit preload と Main IPC の payload 契約がドリフトしていた

| 項目 | 内容 |
| --- | --- |
| 課題 | `chatEditAPI.readFile/writeFile` が positional 引数で invoke し、Main 側の object payload 契約（`{ filePath, workspacePath? }`）と不整合だった |
| 再発条件 | IPC handler 側シグネチャ変更時に preload API と renderer hook の引数形を同時更新しない |
| 解決策 | `chatEditApi.ts` を object payload 契約へ統一し、`getEditorSelection` も `{ success, data }` を unwrap する実装へ修正した |
| 標準ルール | IPC 契約変更時は handler / preload / renderer usage を 1 セットで更新し、`typecheck` と関連テストを同ターンで実行する |

#### 同種課題の簡潔解決手順（5ステップ）

1. Phase 11 capture 前に `pnpm --filter @repo/desktop dev` の preflight 実行可否を確認する。
2. 起動不可ならエラー理由を記録し、fallback capture を current workflow 配下で生成する。
3. screenshot plan / manual-test-result / metadata を同時更新して TC-ID と証跡を 1:1 にする。
4. IPC 契約差分がある場合は handler・preload・renderer 呼び出しの 3 点を同時に修正する。
5. `validate-phase11-screenshot-coverage` / `validate-phase12-implementation-guide` / `verify-all-specs` / `validate-phase-output` を連続実行して PASS を固定する。

---

### 2026-03-13 TASK-IMP-AI-RUNTIME-AUTHMODE-UNIFICATION-001

#### 苦戦箇所1: screenshot が存在しても `manual-test-result.md` がないと Phase 11 は失敗する

| 項目 | 内容 |
| --- | --- |
| 課題 | `phase-11-manual-test.md` と screenshots が揃っていても、`outputs/phase-11/manual-test-result.md` が欠落すると screenshot coverage validator が失敗した |
| 再発条件 | Phase 11 成果物を「計画 + 画像」だけで完了扱いにする |
| 解決策 | `manual-test-result.md` を追加し、TC-ID と `screenshots/*.png` を 1:1 で紐付けた |
| 標準ルール | Phase 11 は `manual-test` / `manual-test-checklist` / `manual-test-result` / `screenshots` を4点セットで確認する |

#### 苦戦箇所2: 設定画面レビュー添付が task 参照へ伝搬しないと再発する

| 項目 | 内容 |
| --- | --- |
| 課題 | ユーザー添付の settings review（認証方式カード / APIキー入力 / APIキー一覧）が Step-01 だけに閉じると Task06 以降へ反映漏れが起きる |
| 再発条件 | foundation 仕様に画像を置くだけで、後続 task index へ参照を追加しない |
| 解決策 | `TC-11-00-settings-authmode-review-board.png` を Step-01 正式証跡として固定し、Task02-10 index に参照導線を追加した |
| 標準ルール | レビュー添付を受けたら「証跡ID化 -> 後続task参照追加 -> system spec導線同期」を同一ターンで実施する |

#### 苦戦箇所3: `artifacts.json` の命名差分を放置すると後続 validator と台帳がずれる

| 項目 | 内容 |
| --- | --- |
| 課題 | `qa-checklist.md`（旧名）を残したまま進めると、phase出力検証と台帳参照が一致しない |
| 再発条件 | semantic rename 後の旧 filename 互換管理を省略する |
| 解決策 | `legacy-ordinal-family-register.md` に旧名->現行名の対応を登録し、`quality-assurance-checklist.md` に統一した |
| 標準ルール | 旧 filename が残る場合は workflow 本文だけでなく legacy register へ必ず登録する |

#### 苦戦箇所4: 契約テスト（Phase 4）と回帰テスト（Phase 6）の責務境界が曖昧だと重複が増える

| 項目 | 内容 |
| --- | --- |
| 課題 | MR-01〜03 と TC-C112〜113 が同系統検証になり、テスト保守コストが増えた |
| 再発条件 | design/spec_created タスクで Phase 4/6 の責務を先に分離しない |
| 解決策 | `UT-AI-RUNTIME-TEST-SEPARATION-CRITERIA-001` を起票し、契約テスト=単一関数入出力、回帰テスト=伝播経路検証の境界を明文化した |
| 標準ルール | Phase 4/6 の双方に同じケースが出た時点で未タスク化し、重複判定基準を先に固定する |

#### 同種課題の簡潔解決手順（5ステップ）

1. Step-01 の `artifacts.json` と実ファイル名を突合し、命名ドリフトを先に潰す。
2. Phase 11 は `manual-test-result.md` の証跡列まで揃えてから screenshot coverage を実行する。
3. レビュー添付は `TC-ID` 化して後続 task index へ参照導線を追加する。
4. Phase 4 契約テストと Phase 6 回帰テストの責務境界を先に定義する。
5. `task-workflow` / `lessons` / `resource-map` / `quick-reference` / `LOGS` を同一 wave で同期する。

---

### 関連未タスク（2026-03-12 追補）

| 未タスクID | 概要 | タスク仕様書 |
| --- | --- | --- |
| UT-IMP-SPEC-CREATED-UI-WORKFLOW-ROOT-SYNC-GUARD-001 | `spec_created` UI workflow の current inventory / verification-only lane / system spec extraction / root registry sync を同時に固定する | `docs/30-workflows/unassigned-task/task-imp-spec-created-ui-workflow-root-sync-guard-001.md` |
