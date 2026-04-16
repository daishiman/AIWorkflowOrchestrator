# Lessons Learned: IPC / Preload / AI Runtime — Part 1

> 分割元: lessons-learned-ipc-preload-runtime.md
> 範囲: メタ情報 〜 2026-03-16 TASK-IMP-SKILL-DOCS-AI-RUNTIME-001

## メタ情報

| 項目     | 値                                                                     |
| -------- | ---------------------------------------------------------------------- |
| 正本     | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md` |
| 目的     | IPC/Preload/AI Runtime に関する教訓を集約                              |
| スコープ | IPC 契約、Preload API 公開、AuthMode 統一、LLM アダプタ                |
| 対象読者 | AIWorkflowOrchestrator 開発者                                          |

---

## 変更履歴

| 日付       | バージョン | 変更内容                                                                                                                                                         |
| ---------- | ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2026-04-07 | 1.20.0     | TASK-UT-RT-01-EXECUTE-ASYNC-SNAPSHOT-ERROR-MESSAGE-001 教訓1件を追加（L-RT01-CALLBACK-GUARD-001: エラーコールバックを `if (!snapshot)` 等の条件でガードすると snapshot ありケースでエラーが隠れる / `callback(snapshot ?? null, error)` パターンが正解） |
| 2026-04-06 | 1.19.0     | Phase-12 IPC 4層型同期（Session Resume / Session Resume UI遷移）教訓3件を追加（L-IPC-4LAYER-001: 4層型定義 shared 集約原則 / L-IPC-4LAYER-002: errorReason 3分岐の全層同期パターン / L-SESSION-RESUME-UI-001: snapshot nullability 設計パターン） |
| 2026-04-06 | 1.18.0     | TASK-UT-RT-01-EXECUTE-ASYNC-SNAPSHOT-ERROR-MESSAGE-001 教訓1件を追加（L-IPC-VARIADIC-001: multi-arg IPC event は preload で variadic 化する） |
| 2026-04-01 | 1.17.0     | TASK-FIX-AUTH-IPC-001 教訓2件を追加（L-AUTH-IPC-001: IPC channel timeout と fire-and-forget パターン / L-AUTH-IPC-002: AUTH_STATE_CHANGED 責務境界の分離）       |
| 2026-03-31 | 1.16.0     | TASK-FIX-BETTER-SQLITE3-ELECTRON-ABI-001 教訓1件を追加（L-BETTER-SQLITE3-ABI-001: native addon ABI 不一致 / postinstall rebuild / best-effort esbuild パターン） |
| 2026-03-27 | 1.15.0     | runtime policy centralization close-out 教訓1件を追加（composition root authority と handoff reason source の単一化）                                            |
| 2026-03-27 | 1.14.0     | TASK-SDK-04 教訓2件を追加（回答送信後 semantics の owner 不在、planId と execute payload の canonical drift）                                                    |
| 2026-03-25 | 1.13.0     | UT-SC-02-005 教訓1件を追加（L-SC-07-005: Preload executePlan 型追従漏れ、IPC ハンドラ変更時の3層走査）                                                           |
| 2026-03-25 | 1.12.0     | TASK-SC-07-SKILL-CREATE-WIZARD-LLM-CONNECTION 教訓4件を追加（L-SC-07-001〜004: vi.mock gaps、非破壊拡張、Symmetric Clear横展開、GenerationMode SSoT）            |
| 2026-03-24 | 1.11.0     | TASK-SC-06-UI-RUNTIME-CONNECTION 苦戦箇所3件を追加（L-SC-06-001〜003: Hybrid State Pattern SSoT問題、executePlan引数設計ミス、PlanResult型一本化）               |
| 2026-03-24 | 1.10.0     | UT-SC-03-004 教訓3件を追加（esbuild worktree arch mismatch、2層バリデーション境界、BGエージェント doc 精度乖離）                                                 |
| 2026-03-23 | 1.9.0      | TASK-SC-05-IMPROVE-LLM 教訓3件を追加（LLM統合パターン再利用、空文字列beforeバグ、P4/P51早期完了記載の再発）                                                      |
| 2026-03-23 | 1.8.0      | UT-TERMINAL-HANDOFF-ADAPTER-PLACEMENT-001 苦戦箇所2件を追加（エスケープテスト lookbehind regex パターン、adapter サニタイズ対象の統一漏れ）                      |
| 2026-03-22 | 1.7.0      | TASK-FIX-WORKSPACE-CHAT-STREAM-ERROR の same-wave sync 教訓を追加（structured error primary / legacy fallback 分離、Task 03 root 移管の同波反映）                |
| 2026-03-21 | 1.6.0      | UT-TASK06-007-EXT-006 正規表現 lastIndex 汚染パターン（教訓4）を追加                                                                                             |
| 2026-03-21 | 1.5.0      | UT-TASK06-007-EXT-006 Phase 12 再監査教訓を追加（mkdtempSync 一時ディレクトリ戦略、same-wave 指標同期、EXT-006 完了と EXT-001〜005 継続の切り分け）              |
| 2026-03-20 | 1.4.0      | TASK-FIX-CHATVIEW-ERROR-SILENT-FAILURE 再監査教訓を追加（AIChatResponse.error の code/message drift、Renderer raw message fallback、system spec same-wave 同期） |
| 2026-03-19 | 1.3.0      | UT-TASK06-007 実装セッション苦戦箇所を追加（esbuild worktree 不一致、process.argv[1] パス解決、fs モック制約、main() カバレッジ改善）                            |
| 2026-03-19 | 1.2.0      | UT-TASK06-007 再監査教訓を追加（generic/multiline preload 抽出、spec drift 同期、P45 の書き分け）                                                                |
| 2026-03-18 | 1.1.0      | TASK-IMP-WORKSPACE-CHAT-PANEL-AI-RUNTIME-001 教訓3件を追加（esbuild worktree不一致 P53派生、テスト数伝播 P37派生、P62 DEFAULT_CONFIG三層防御）                   |
| 2026-03-17 | 1.0.0      | lessons-learned-current.md から分割作成                                                                                                                          |

---

## 2026-03-23 UT-TERMINAL-HANDOFF-ADAPTER-PLACEMENT-001

## 2026-03-27 TASK-IMP-RUNTIME-POLICY-CENTRALIZATION-IMPLEMENTATION-CLOSURE-001

### 教訓1: runtime policy authority は handler ごとに複製せず composition root で共有する

| 項目       | 内容                                                                                                                                                                                                        |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 課題       | `agentHandlers` / `skillHandlers` が局所 resolver や局所 auth mode 解決に寄ると、同じ runtime policy でも lane 判定と fallback reason の説明が surface ごとにずれる                                         |
| 解決策     | `apps/desktop/src/main/ipc/index.ts` で共有の `RuntimePolicyResolver` と `createAuthModeService(...)` を生成し、handler へ注入したうえで reason source を `decision.bundle.manualRetryRule` に統一した      |
| 標準ルール | public IPC shape が不変でも、authority owner・reason source・decision vocabulary が変わった場合は internal contract hardening として lessons / ledger / quick-reference / skill update を同一 wave で閉じる |

## 2026-03-27 TASK-SDK-04 user interaction bridge / phase UI

### 教訓1: `submitUserInput()` は transport 実装だけで閉じず、回答後の phase semantics まで engine owner に持たせる

| 項目       | 内容                                                                                                                                                                       |
| ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 課題       | `awaitingUserInput` を消すだけで submit を完了扱いにすると、`plan_review` / `verification_review` の UI が no-op になり、Renderer が「回答を送ったのに進まない」状態になる |
| 解決策     | `awaitingUserInput.reason` を meaning source とし、`currentPhase` / `verifyResult.nextAction` の更新を engine owner に集約する                                             |
| 標準ルール | request/response 形が揃っても、review 系入力は「回答後の状態変化」まで system spec に記録する                                                                              |

### 教訓2: `planId` を canonical key にしたら execute payload も同じ canonical plan から読む

| 項目       | 内容                                                                                                |
| ---------- | --------------------------------------------------------------------------------------------------- |
| 課題       | review 後の execute が current textarea 値を再送すると、画面で承認した plan と実行対象がずれる      |
| 解決策     | approved plan と draft input を state 上で分離し、execute は canonical plan snapshot のみを参照する |
| 標準ルール | review / approve / execute の 3段階フローでは、UI draft と approved payload を別 owner に分けて扱う |

## 2026-03-28 TASK-SDK-04-U1 submitUserInput phase transition semantics

### 教訓1: Phase 4 テスト計画で request kind と engine 遷移ロジックの gap を早期検出する

| 項目       | 内容                                                                                                                                                                                                            |
| ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 課題       | `verification_review` request が `free_text` kind のまま設計され、engine 側は `selectedOptionId` ベースで approve/improve/reject を分岐する設計になっていた。Phase 5 実装時に kind と遷移ロジックの不整合が判明 |
| 解決策     | engine 遷移ロジックは `selectedOptionId` を meaning source として動作するよう実装し、request kind の変更は後続タスク（UT-01: single_select kind 変更）に分離した                                                |
| 標準ルール | Phase 4 テスト計画時に、request kind（single_select / free_text / confirm / secret）と engine 遷移ロジックの selectedOptionId が一致するか検証項目に含める                                                      |

### 教訓2: shared types の union 拡張は Phase 2 設計段階で明記する

| 項目       | 内容                                                                                                                                                     |
| ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 課題       | `SkillCreatorVerifyResult.nextAction` に `"handoff"` を追加する必要があったが、Phase 2 設計時に型拡張が明記されておらず Phase 5 実装で後追い対応になった |
| 解決策     | `packages/shared/src/types/skillCreator.ts` の `nextAction` union に `"handoff"` を追加。`RuntimeSkillCreatorVerifyDetail` 側も同期                      |
| 標準ルール | engine state の遷移先で新しい状態値が必要な場合、shared types の union 拡張を Phase 2 設計成果物に含める。実装 Phase で初めて型を足すのは手戻りの元      |

### 苦戦箇所1: エスケープテストの部分文字列マッチ

- **症状**: `\$HOME` は部分文字列として `$HOME` を含むため、`not.toContain("$HOME")` がエスケープ済み文字列に対して偽陽性を返す
- **原因**: `toContain` は部分文字列マッチであり、エスケープ文字 `\` の有無を区別しない
- **解決策**: lookbehind regex `not.toMatch(/(?<!\\)\$HOME/)` で「エスケープされていない `$`」の非存在を検証
- **関連パターン**: P55（正規表現メタ文字を含むパス）
- **5分解決カード**: エスケープテストでは `toContain` ではなく lookbehind regex で未エスケープ文字の非存在を検証する

### 苦戦箇所2: adapter サニタイズ対象の統一漏れ

- **症状**: prompt 系フィールドのみ `sanitizeForShell` を適用し、`workspacePath`/`workingDirectory`/`launcher` フィールドが無サニタイズでコマンドに挿入されていた
- **原因**: 30種思考法分析（批判的思考・帰納的思考）で初めて発見。「パスはシステム由来で安全」という暗黙の前提が検証されていなかった
- **解決策**: `sanitizePath()` でパスのダブルクォート・バックスラッシュをエスケープ、`validateLauncher()` でランチャー名を英数字+ハイフン+アンダースコアに制限
- **関連パターン**: P42（.trim() バリデーション漏れ）の拡張パターン
- **5分解決カード**: adapter/builder で外部入力をコマンド文字列に埋め込む場合、プロンプト系だけでなくパス系・実行ファイル名もサニタイズ対象にする

---

## 2026-03-16 TASK-FIX-CONVERSATION-IPC-HANDLER-REGISTRATION

> この教訓は lessons-learned-current.md v1.29.97 で追加されたが、変更履歴のみの記録であったため、以下は参照先として機能する。

---

## 2026-03-22 TASK-FIX-WORKSPACE-CHAT-STREAM-ERROR

### 教訓1: structured error と legacy fallback は同じ名前空間で扱わない

| 項目       | 内容                                                                                               |
| ---------- | -------------------------------------------------------------------------------------------------- |
| 課題       | `streamingError` と `errorMessage` を同列に扱うと、WorkspaceChatPanel で二重表示や責務混在が起きる |
| 解決策     | `streamingError` を primary contract、`errorMessage` を legacy fallback として分離した             |
| 標準ルール | 新しい状態を追加する場合は、primary / fallback / deprecated を先に分けてから UI に配線する         |

### 教訓2: completed root への移管と current root の更新は同じ wave で行う

| 項目       | 内容                                                                                                            |
| ---------- | --------------------------------------------------------------------------------------------------------------- |
| 課題       | Task 03 の root 移管だけ先に進むと、Task 04 の canonical set や artifact inventory が stale path を参照しやすい |
| 解決策     | `workflow-ai-chat-llm-integration-fix.md` / artifact inventory / parent workflow / logs を同波で更新した        |
| 標準ルール | root migration があるタスクは、workflow-local と system spec の両方を同 wave で閉じる                           |

---

## 2026-03-20 TASK-FIX-CHATVIEW-ERROR-SILENT-FAILURE 再監査

### 教訓1: `AIChatResponse.error` を code-only と決めつけない

| 項目       | 内容                                                                                                                                                       |
| ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 課題       | spec が `AIChatResponse.error = error code` 前提のまま残ると、Main が返した user-facing message string を Renderer が受ける current runtime を説明できない |
| 解決策     | `llm-ipc-types.md` と `error-handling-core.md` に「code or user-facing message」の transport 契約を追記した                                                |
| 標準ルール | transport の `string` は canonical code と raw message の両経路を許容し、Renderer の正規化責務まで明記する                                                 |

### 教訓2: Renderer 側は code 判定と raw message fallback を分離する

| 項目       | 内容                                                                                                      |
| ---------- | --------------------------------------------------------------------------------------------------------- |
| 課題       | `chatError` を code 専用 state と記述すると、非 code 文字列を受けたときの UI 表示が spec から抜ける       |
| 解決策     | `arch-state-management-core.md` に `chatError` が code または raw message string を保持することを明記した |
| 標準ルール | store state の transport 形と UI 変換規則は同じ wave で同期する                                           |

### 教訓3: workflow log だけで「system spec 同期完了」と書かない

| 項目       | 内容                                                                                                                     |
| ---------- | ------------------------------------------------------------------------------------------------------------------------ |
| 課題       | workflow summary や LOGS だけが先に進むと、`llm-ipc-types.md` / `error-handling-core.md` の core contract が古いまま残る |
| 解決策     | re-audit では workflow doc と core spec を一緒に更新し、mirror parity まで閉じる運用へ戻した                             |
| 標準ルール | Phase 12 の「同期完了」は core contract / workflow / backlog / lessons の全更新後にのみ使う                              |

---

## 2026-03-21 UT-TASK06-007-EXT-006 テスト拡充 Phase 12 再監査

### 教訓1: ファイルI/O系ヘルパーは fs モックより `mkdtempSync` 実測の方が短い

| 項目       | 内容                                                                                                             |
| ---------- | ---------------------------------------------------------------------------------------------------------------- |
| 課題       | `mergeChannelMaps` の検証で fs モックを広げると、既存 `vi.mock` 配置と競合しやすく、テストの意図も読みにくくなる |
| 解決策     | `mkdtempSync(join(tmpdir(), "ipc-test-"))` で一時ディレクトリを作り、`writeFileSync` / `rmSync` で完結させた     |
| 標準ルール | Node の純粋なファイル入力ヘルパーは、I/O 規模が小さいなら一時ディレクトリ実測を第一候補にする                    |

### 教訓4: `/gm` フラグ付き RegExp は lastIndex が共有されるため、テストごとに新インスタンスを生成する

| 項目       | 内容                                                                                                                                                                                                               |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 課題       | `CHANNEL_OBJECT_PATTERN` / `PRELOAD_CALL_START_PATTERN` のように `/gm` フラグ付きモジュールスコープ RegExp をテスト間で共有すると、前テストの `exec()` により `lastIndex` が残留し、後テストの先頭マッチが失敗する |
| 解決策     | 各テストケース内で `new RegExp(CHANNEL_OBJECT_PATTERN.source, "gm")` と書き、lastIndex をリセットした新インスタンスを生成する                                                                                      |
| 標準ルール | `/g` または `/gm` フラグ付き RegExp 定数をテストに使う場合は、`new RegExp(pattern.source, pattern.flags)` で新インスタンスを生成するか、テスト前に `pattern.lastIndex = 0` でリセットする                          |

### 教訓2: テスト件数を更新したら quick-reference / pattern detail / completed ledger を同ターンで閉じる

| 項目       | 内容                                                                                                                                                                                      |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 課題       | EXT-006 完了後にテストは69件へ増えたが、quick-reference や pattern detail が 44件 / 94.94% のままだと current facts が壊れる                                                              |
| 解決策     | `architecture-implementation-patterns-reference-ipc-drift-detection.md`、`task-workflow-completed-ipc-contract-preload-alignment.md`、`indexes/quick-reference.md` を同一ターンで更新した |
| 標準ルール | 指標変更は「workflow outputs だけ更新」で止めず、早見表・完了台帳・再利用パターンまで同時に同期する                                                                                       |

### 教訓3: 完了した follow-up と未着手 follow-up を混在させない

| 項目       | 内容                                                                                                                     |
| ---------- | ------------------------------------------------------------------------------------------------------------------------ |
| 課題       | EXT-006 が完了しても、completed ledger と quick-reference が EXT-001〜005 と同列の「未タスク群」に見えると次の判断を誤る |
| 解決策     | EXT-006 は completed workflow として別導線化し、未着手は EXT-001〜005 だけを残課題として明示した                         |
| 標準ルール | follow-up 完了時は「完了済み拡張」と「残未タスク」を見出しレベルで分離する                                               |

---

## 2026-03-19 UT-TASK06-007 IPC契約ドリフト自動検出 再監査

### 教訓1: 検出器の能力が増えたら、metrics だけでなく follow-up の意味も見直す

| 項目       | 内容                                                                                                                                                |
| ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| 課題       | generic / multiline preload 抽出と複数 const object 収集を code に追加したのに、workflow / backlog / checklist は旧前提（別定数未対応）のままだった |
| 解決策     | code change 後に `quality-report` / `final-review` / `implementation-guide` / `LOGS.md` / `task-workflow backlog` を同ターンで再同期した            |
| 標準ルール | 検出器の出力件数や能力境界が変わったら、数値だけでなく「未タスクの意味が変わったか」を必ず確認する                                                  |

### 教訓2: P45 は「設計上の目標」と「現在の自動判定能力」を分けて書く

| 項目       | 内容                                                                                                  |
| ---------- | ----------------------------------------------------------------------------------------------------- |
| 課題       | P45 を「完全検出済み」と書くと、R-02 が object vs primitive 中心の heuristic である事実を隠してしまう |
| 解決策     | current docs では「P45 fully automated ではない。EXT-005 で継続」と明記した                           |
| 標準ルール | ルールが heuristic の場合は、対応 Pitfall と current coverage の差を docs に残す                      |

### 教訓3: docs-heavy task でも user 要求があれば screenshot へ昇格する

| 項目       | 内容                                                                                                      |
| ---------- | --------------------------------------------------------------------------------------------------------- |
| 課題       | backend-heavy task を `NON_VISUAL` で閉じると、user が求める branch 全体の画面 sanity check が欠ける      |
| 解決策     | representative dashboard harness を current workflow 配下へ capture し、TC-ID と png を 1:1 で固定した    |
| 標準ルール | docs-only / backend-heavy でも user が screenshot 検証を要求したら `SCREENSHOT + 非視覚` の二層へ昇格する |

---

## 2026-03-16 TASK-IMP-SKILL-DOCS-AI-RUNTIME-001

### 教訓1: Constructor Injection による queryFn 差替パターン

| 項目       | 内容                                                                                                                                                                 |
| ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 状況       | SkillDocGenerator の stubQueryFn を LLMDocQueryAdapter.query() に差し替える必要があった                                                                              |
| 解決策     | `adapter.query.bind(adapter)` で既存の `LLMQueryFn` シグネチャに合わせることで、SkillDocGenerator 自体に変更を加えずに adapter を注入できた（Open-Closed Principle） |
| 適用範囲   | 他の LLM 統合箇所（chat-edit, agent-execution 等）でも同パターンが適用可能                                                                                           |
| 関連タスク | TASK-IMP-SKILL-DOCS-AI-RUNTIME-001                                                                                                                                   |

### 教訓2: CapabilityResolver パターンの再利用性

| 項目       | 内容                                                                                                                                                                                 |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 状況       | Skill Docs の capability 判定（integrated-api / guidance-only / terminal-handoff）を3パスで実装                                                                                      |
| 解決策     | ILLMDocQueryAdapter インターフェースの isAvailable() / getProviderName() を基に resolver が判定する疎結合設計                                                                        |
| 注意       | terminal-handoff は事後判定（LLM呼出し失敗後の fallback）であり、事前判定には isAvailable() では不十分。実LLM接続テストが必要（UT-SKILL-DOCS-TERMINAL-HANDOFF-001 として未タスク化） |
| 関連タスク | TASK-IMP-SKILL-DOCS-AI-RUNTIME-001                                                                                                                                                   |

### 教訓3: Phase 4-5 統合実行の効率性

| 項目       | 内容                                                                                                                       |
| ---------- | -------------------------------------------------------------------------------------------------------------------------- |
| 状況       | Phase 4（テスト作成 Red）と Phase 5（実装 Green）を別エージェントで実行しようとした                                        |
| 解決策     | TDD の Red-Green サイクルを1エージェントで統合実行するほうが、型定義→テスト→実装のコンテキスト切替コストが低く効率的だった |
| 適用範囲   | 今後の Phase 4-5 実行時は統合エージェントを推奨                                                                            |
| 関連タスク | TASK-IMP-SKILL-DOCS-AI-RUNTIME-001                                                                                         |

### 同種課題の簡潔解決手順（3ステップ）

1. LLM adapter 差し替えは `bind()` パターンで既存シグネチャに合わせ、Generator クラス本体を変更しない。
2. CapabilityResolver の terminal-handoff パスは「失敗後 fallback」として設計し、事前判定と混在させない。
3. Phase 4-5 は同一エージェントで Red-Green サイクルを完結させる。

---
