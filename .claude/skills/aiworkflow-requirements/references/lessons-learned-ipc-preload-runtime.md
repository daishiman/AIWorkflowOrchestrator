# Lessons Learned: IPC / Preload / AI Runtime

> 親仕様書: [lessons-learned.md](lessons-learned.md)
> 役割: IPC ハンドラ、Preload API、AI Runtime アダプタ、認証モード統合に関する教訓
> 分割元: [lessons-learned-current.md](lessons-learned-current.md)

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

## 2026-03-14 TASK-IMP-WORKSPACE-CHAT-EDIT-AI-RUNTIME-001（P57-P61）

### P57: 設計書と実コードの AuthMode 値の乖離

| 項目       | 内容                                                                                                                                                                                                                    |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 課題       | 設計ドキュメントでは AuthMode を `"integrated"` / `"terminal"` / `"hybrid"` の3値で定義したが、実コードベースでは `"subscription" \| "api-key"` の2値。RuntimeResolver の実装時に解決テーブルの全面書き直しが必要だった |
| 再発条件   | Phase 2（設計）で想定値を使い、実コードの型定義を検証しない                                                                                                                                                             |
| 解決策     | Phase 1（要件定義）で `grep -rn "AuthMode" packages/shared/` を実行し、正本の型定義値を確認する。設計書で想定値を使う前に必ず実コードの型を検証                                                                         |
| 標準ルール | 設計書で列挙型の値を参照するときは、実コードの型定義を正本として先に確認する                                                                                                                                            |
| 関連タスク | TASK-IMP-WORKSPACE-CHAT-EDIT-AI-RUNTIME-001                                                                                                                                                                             |

### P58: 同名ファイルの二重存在（chatEditHandlers.ts）

| 項目       | 内容                                                                                                                                                                                                                                                                                                     |
| ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 課題       | `apps/desktop/src/main/handlers/chatEditHandlers.ts` と `apps/desktop/src/main/ipc/chatEditHandlers.ts` の2つが存在し、実際に `ipc/index.ts` から import されているのは `ipc/chatEditHandlers.ts` だった。設計書は `handlers/chatEditHandlers.ts` を参照しており、誤ったファイルを修正するリスクがあった |
| 再発条件   | 設計書のファイルパスを信じて修正対象を決め、実際の import 元を確認しない                                                                                                                                                                                                                                 |
| 解決策     | 修正対象ファイルの特定には `grep -rn "import.*chatEditHandlers" apps/desktop/src/main/` で実際の import 元を確認する                                                                                                                                                                                     |
| 標準ルール | 同名ファイルが複数ディレクトリに存在する場合、`grep import` で実際に使用されている方を正本とする                                                                                                                                                                                                         |
| 関連タスク | TASK-IMP-WORKSPACE-CHAT-EDIT-AI-RUNTIME-001                                                                                                                                                                                                                                                              |

### P59: Preload API 未公開（exposeChatEditAPI 呼び出し欠落）

| 項目         | 内容                                                                                                                                                                                                                                   |
| ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 課題         | `chatEditApi.ts` に `exposeChatEditAPI()` 関数は定義されていたが、`preload/index.ts` で一切呼ばれておらず、`chatEditAPI` が Renderer に完全に未公開だった。他の全 API（electronAPI, agentAPI 等）は contextBridge 経由で公開済みだった |
| 症状         | `window.chatEditAPI` が `undefined` で全ての chat-edit IPC 呼び出しが失敗                                                                                                                                                              |
| 再発条件     | 新規 Preload API を定義するだけで `preload/index.ts` の `contextBridge.exposeInMainWorld()` ブロックへの追記を忘れる                                                                                                                   |
| 解決策       | 新規 Preload API を追加した場合、`preload/index.ts` の `contextBridge.exposeInMainWorld()` ブロックと else ブロックの両方に追記されているか必ず確認する                                                                                |
| 再発防止     | `grep -c "exposeInMainWorld" preload/index.ts` と `grep -c "chatEditAPI\|slideApi\|agentAPI" preload/index.ts` で API 公開数を監査                                                                                                     |
| 関連パターン | M-01（contextBridge 未使用）、P23（API二重定義の型管理複雑性）                                                                                                                                                                         |
| 関連タスク   | TASK-IMP-WORKSPACE-CHAT-EDIT-AI-RUNTIME-001                                                                                                                                                                                            |

### P60: createAuthModeService のスコープ制限

| 項目         | 内容                                                                                                                                                                                                                                                                                                      |
| ------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 課題         | `ipc/index.ts` で `createAuthModeService(authKeyService)` が `track("registerAuthModeHandlers", ...)` コールバック内で呼ばれており、そのスコープ外（chat-edit ハンドラ登録ブロック）からは参照できなかった。chat-edit ハンドラにも authModeService が必要だったため、別インスタンスを生成する必要があった |
| 再発条件     | 複数のハンドラ登録ブロックで同じサービスが必要なのに、外側スコープに引き上げない                                                                                                                                                                                                                          |
| 解決策       | 複数のハンドラ登録ブロックで同じサービスが必要な場合、外側スコープで生成するか、各ブロック内で `createXxxService()` を呼ぶ                                                                                                                                                                                |
| 標準ルール   | サービスの共有スコープは「最も外側の共通消費者」に合わせて配置する                                                                                                                                                                                                                                        |
| 関連パターン | P34（遅延初期化 DI パターン選択）                                                                                                                                                                                                                                                                         |
| 関連タスク   | TASK-IMP-WORKSPACE-CHAT-EDIT-AI-RUNTIME-001                                                                                                                                                                                                                                                               |

### P61: ChatEditService の動的アダプタ注入

| 項目         | 内容                                                                                                                                                                                                                                                                                                                            |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 課題         | ChatEditService はコンストラクタで LLMAdapter を受け取る設計だが、RuntimeResolver の結果（API キー有無）によって adapter が変わるため、毎回 `new ChatEditService(resolution.adapter, contextBuilder)` で生成する方式を採用。stubLLMAdapter を置き換える際、Setter Injection ではなく Factory パターンに近い動的生成が最適だった |
| 再発条件     | adapter が呼び出し時の状態に依存するのに、インスタンスをキャッシュする                                                                                                                                                                                                                                                          |
| 解決策       | adapter が呼び出し時の状態に依存する場合は、毎回 new でインスタンスを生成する。API キーが変更される可能性を考慮すると、キャッシュを避ける                                                                                                                                                                                       |
| 標準ルール   | DI 対象が実行時コンテキスト依存（認証状態等）の場合は Factory パターンで毎回生成する                                                                                                                                                                                                                                            |
| 関連パターン | P34（遅延初期化 DI）                                                                                                                                                                                                                                                                                                            |
| 関連タスク   | TASK-IMP-WORKSPACE-CHAT-EDIT-AI-RUNTIME-001                                                                                                                                                                                                                                                                                     |

### 同種課題の簡潔解決手順（5ステップ）

1. Phase 1 で `grep -rn "AuthMode\|ChatEdit" packages/shared/ apps/desktop/src/` を実行し、実コードの型定義値と既存ファイル配置を先に確認する。
2. 同名ファイルがある場合は `grep -rn "import.*FileName"` で実際の import 元を特定し、正本を決定する。
3. 新規 Preload API は定義後に `preload/index.ts` の `contextBridge.exposeInMainWorld()` と else ブロックの両方に追記を確認する。
4. サービスの共有スコープは消費者ブロックの共通親に引き上げるか、各ブロック内で `createXxxService()` を呼ぶ。
5. DI 対象が認証状態依存の場合は Factory パターンで毎回生成し、キャッシュを避ける。

---

## 2026-03-14 TASK-IMP-AI-RUNTIME-AUTHMODE-UNIFICATION-001（Phase 12 再確認追補）

### 苦戦箇所: 既存未タスクを再参照しても、対象ファイル自体が10見出し要件を満たしていない場合がある

| 項目       | 内容                                                                                                                                                |
| ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| 課題       | `unassigned-task-detection.md` で「既存未タスクを再利用」と記録しても、`audit-unassigned-tasks --target-file` では current 違反が出るケースがあった |
| 再発条件   | diff監査（`--diff-from HEAD`）だけで完了判定し、再参照した既存未タスク本文を個別監査しない                                                          |
| 解決策     | 再参照した各未タスクに対して `audit-unassigned-tasks --target-file` を実行し、違反があれば同ターンで9見出しへ是正した                               |
| 標準ルール | Phase 12 の「新規未タスク0件」判定時でも、再参照した既存未タスクは `target-file` 監査で `currentViolations=0` を確認する                            |

### 同種課題の簡潔解決手順（5ステップ）

1. `verify-unassigned-links --source .../task-workflow.md` で参照切れを先に潰す。
2. `audit-unassigned-tasks --json --diff-from HEAD` で今回差分の合否（current）を確認する。
3. `unassigned-task-detection.md` で再参照した既存未タスクを列挙する。
4. 各ファイルへ `audit-unassigned-tasks --target-file <path>` を実行し、current違反を確認する。
5. 違反があれば同ターンで9見出し是正し、再実行で `currentViolations=0` を固定する。

---

## 2026-03-14 TASK-IMP-WORKSPACE-CHAT-EDIT-AI-RUNTIME-001 / TASK-IMP-CLAUDE-CODE-TERMINAL-SURFACE-001

### 苦戦箇所1: current build screenshot が esbuild platform mismatch で停止する

| 項目       | 内容                                                                                                                                |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| 課題       | `electron-vite dev` が `@esbuild/darwin-arm64` / `@esbuild/darwin-x64` 不一致で起動できず、Phase 11 の実画面 capture が中断した     |
| 再発条件   | worktree の node 実行アーキと lockfile 由来 binary がずれている状態で capture script を実行する                                     |
| 解決策     | 当日中に fallback review board capture を current workflow 配下で生成し、`phase11-capture-metadata.json` へ理由と source を固定した |
| 標準ルール | 明示 screenshot 要求時は「実画面試行ログ → fallback 実行 → metadata 記録 → coverage validator PASS」まで同一ターンで閉じる          |

### 苦戦箇所2: chatEdit preload と Main IPC の payload 契約がドリフトしていた

| 項目       | 内容                                                                                                                                           |
| ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| 課題       | `chatEditAPI.readFile/writeFile` が positional 引数で invoke し、Main 側の object payload 契約（`{ filePath, workspacePath? }`）と不整合だった |
| 再発条件   | IPC handler 側シグネチャ変更時に preload API と renderer hook の引数形を同時更新しない                                                         |
| 解決策     | `chatEditApi.ts` を object payload 契約へ統一し、`getEditorSelection` も `{ success, data }` を unwrap する実装へ修正した                      |
| 標準ルール | IPC 契約変更時は handler / preload / renderer usage を 1 セットで更新し、`typecheck` と関連テストを同ターンで実行する                          |

### 同種課題の簡潔解決手順（5ステップ）

1. Phase 11 capture 前に `pnpm --filter @repo/desktop dev` の preflight 実行可否を確認する。
2. 起動不可ならエラー理由を記録し、fallback capture を current workflow 配下で生成する。
3. screenshot plan / manual-test-result / metadata を同時更新して TC-ID と証跡を 1:1 にする。
4. IPC 契約差分がある場合は handler・preload・renderer 呼び出しの 3 点を同時に修正する。
5. `validate-phase11-screenshot-coverage` / `validate-phase12-implementation-guide` / `verify-all-specs` / `validate-phase-output` を連続実行して PASS を固定する。

---

## 2026-03-18 TASK-IMP-WORKSPACE-CHAT-PANEL-AI-RUNTIME-001

### 苦戦箇所1: esbuild アーキテクチャ不一致による Phase 7/9/11 DEFERRED（P53 派生）

| 項目        | 内容                                                                                                                                                                                                                                                                                       |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| タスクID    | TASK-IMP-WORKSPACE-CHAT-PANEL-AI-RUNTIME-001                                                                                                                                                                                                                                               |
| 課題        | worktree 環境で `pnpm install --force` を実行せずに作業を開始したため、esbuild のネイティブバイナリが arm64/x64 で不一致となり、vitest および Electron が実行不可能になった。結果として Phase 7（カバレッジ確認）、Phase 9（品質検証）、Phase 11（手動テスト）が全て DEFERRED 判定となった |
| 再発条件    | worktree を新規作成した後に `pnpm install` のみ実行し `--force` を省略した状態で、esbuild に依存するツール（vitest, electron-vite）を使用する                                                                                                                                              |
| 解決策      | worktree 作成時の標準手順に `pnpm install --force` を含める。具体的には: (1) `git worktree add` 実行後、(2) `cd` で worktree に移動、(3) `pnpm install --force` を実行してネイティブバイナリを現在のアーキテクチャに合わせてリビルド                                                       |
| 関連Pitfall | P53（CLI 環境でのスクリーンショット取得制約）の派生。P53 は CLI 環境自体の制約だが、本件は worktree 固有のバイナリ不一致が原因                                                                                                                                                             |
| 標準ルール  | worktree 新規作成後は `pnpm install --force` を必ず実行する。`--force` なしの install ではキャッシュされた古いバイナリが残る（P7 と同根）                                                                                                                                                  |

### 苦戦箇所2: テスト数伝播エラー（P37 派生）

| 項目        | 内容                                                                                                                                                                                                                                                                                 |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| タスクID    | TASK-IMP-WORKSPACE-CHAT-PANEL-AI-RUNTIME-001                                                                                                                                                                                                                                         |
| 課題        | implementation-guide で Renderer 層テスト（31+7=38件）のみカウントし、Main ハンドラ（24件）+ IPC 統合（15件）テストを漏らした結果、7 ファイルに渡って「38件」を「77件」に修正する連鎖修正が発生した                                                                                  |
| 再発条件    | Renderer 層のテストのみ集計し、Main Process 層・IPC 統合層のテストを集計対象から除外する                                                                                                                                                                                             |
| 解決策      | Phase 4 完了時に全テストファイルの正確なカウントを取る。具体的には `grep -c "it\\\(" apps/desktop/src/**/*.test.ts` で全テストファイルを走査し、Renderer / Main / IPC 統合の各層を合算する。Phase 12 implementation-guide 記載時にも再集計を行い、Phase 4 の数値をそのまま流用しない |
| 関連Pitfall | P37（ドキュメント数値の早期固定）の派生。P37 は Phase 4 想定値と Phase 5 実績値の乖離だが、本件は層別集計の欠落が原因                                                                                                                                                                |

### 苦戦箇所3: P62 DEFAULT_CONFIG fallback の発見と三層防御パターン確立

| 項目         | 内容                                                                                                                                                                                                                                                                                                                                              |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| タスクID     | TASK-IMP-WORKSPACE-CHAT-PANEL-AI-RUNTIME-001                                                                                                                                                                                                                                                                                                      |
| 課題         | `selectedModelId ?? "gpt-4o"` という暗黙 fallback が1箇所存在し、ユーザーが意図しない AI モデルでリクエスト送信されるリスクがあった。Settings で provider/model を未選択のまま WorkspaceChatPanel からメッセージを送信すると、DEFAULT_CONFIG の値で LLM API が呼ばれる                                                                            |
| 再発条件     | 新規チャット画面を追加する際に、provider/model の選択状態を検証せずに LLM API を呼び出す                                                                                                                                                                                                                                                          |
| 解決策       | P62 三層防御パターンを確立: (1) UI `canSend` で provider/model 未選択時は送信ボタンを disabled にする、(2) Controller `sendMessage` で runtime 未設定を検出して早期リターンし GuidanceBlock の blocked variant を表示、(3) Main `handleStreamChat` で provider/model の空文字列バリデーション。3層全てを通過しないと LLM API 呼び出しに到達しない |
| 関連Pitfall  | P62（DEFAULT_CONFIG への暗黙 fallback）。本タスクで防御パターンを WorkspaceChatPanel に適用し、先行タスク TASK-IMP-MAIN-CHAT-SETTINGS-AI-RUNTIME-001 で確立したパターンを横展開した                                                                                                                                                               |
| 再利用ルール | 新規チャット UI を追加する際は、必ず P62 三層防御（UI disabled / Controller guard / Main validation）を実装する。fallback は一切行わず、未選択時はエラー表示または設定画面への誘導を行う                                                                                                                                                          |

### 同種課題の簡潔解決手順（3ステップ）

1. worktree 作成直後に `pnpm install --force` を実行し、ネイティブバイナリの整合を確保する。
2. Phase 4 完了時にプロジェクト全体の `grep -c "it(" *.test.ts` でテスト総数を確定し、以降のドキュメントではこの数値を使用する。
3. チャット UI 実装時は P62 三層防御（UI canSend / Controller guard / Main validation）を設計段階で組み込み、DEFAULT_CONFIG fallback を排除する。

---

## 2026-03-19 UT-TASK06-007 IPC契約ドリフト自動検出 実装セッション

### 苦戦箇所1: worktree 環境での esbuild プラットフォーム不一致（P7 worktree 派生）

| 項目        | 内容                                                                                                                                          |
| ----------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| タスクID    | UT-TASK06-007                                                                                                                                 |
| 課題        | worktree 環境で `pnpm install` すると、親リポジトリの node_modules キャッシュが darwin-arm64 のまま残り、x64 Node.js で vitest が起動できない |
| 解決策      | `pnpm store prune && pnpm install --force` でキャッシュクリア＋再インストール                                                                 |
| 関連Pitfall | P7（ネイティブモジュールのバイナリ不一致）の worktree 派生パターン                                                                            |

### 苦戦箇所2: main() 関数テストでの process.argv[1] パス解決（P40 CLI スクリプト派生）

| 項目        | 内容                                                                                                                               |
| ----------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| タスクID    | UT-TASK06-007                                                                                                                      |
| 課題        | `main()` は `process.argv[1]` からスクリプトパスを推定。vitest から呼ぶと二重パス `apps/desktop/apps/desktop/scripts` が生成される |
| 解決策      | `beforeEach` で `process.argv[1] = path.resolve(__dirname, "../check-ipc-contracts.ts")` に設定し `afterEach` で復元               |
| 関連Pitfall | P40（テスト実行ディレクトリ依存）の CLI スクリプト派生パターン                                                                     |

### 苦戦箇所3: vi.mock("fs") の describe ブロック内配置制約

| 項目       | 内容                                                                                                                     |
| ---------- | ------------------------------------------------------------------------------------------------------------------------ |
| タスクID   | UT-TASK06-007                                                                                                            |
| 課題       | `vi.mock("fs")` を describe 内に配置し `require("fs")` で参照すると、ESM import 側の fs とは異なる参照になりモック不適用 |
| 解決策     | fs モックを諦め `process.argv[1]` パス制御＋実ファイル統合テストに切替。カバレッジ 74.49% → 94.94%                       |
| 標準ルール | CLI スクリプトテストは「ファイルシステムモック」より「パス制御＋実ファイル実行」が高カバレッジに有効                     |

### 苦戦箇所4: main() カバレッジ改善パターン

| 項目           | 内容                                                                                                               |
| -------------- | ------------------------------------------------------------------------------------------------------------------ |
| タスクID       | UT-TASK06-007                                                                                                      |
| 課題           | CLI エントリポイント `main()` はファイル I/O + exit code 設定を含み、Line Coverage 74.49% の主因                   |
| 解決策         | `process.argv[1]` 固定＋実コードベース対象の統合テスト5件追加で Line 94.94% / Branch 89.92% / Function 100% に改善 |
| 再利用パターン | CLI テストは主要フラグ（--report-only / --strict / --format）ごとに1テストケース用意する                           |

### 同種課題の簡潔解決手順（4ステップ）

1. worktree 作成後は `pnpm store prune && pnpm install --force` でバイナリ不一致を解消
2. CLI スクリプトテストは `beforeEach` で `process.argv[1]` をスクリプト絶対パスに固定し `afterEach` で復元
3. `vi.mock("fs")` はファイルトップレベルに配置。describe 内配置では ESM モジュールへのモック適用が保証されない
4. `main()` カバレッジは「fs モック」より「パス制御＋実ファイル統合テスト」で達成

---

## TASK-SC-02-RUNTIME-POLICY-CLOSURE（2026-03-22）

### Optional DI + Graceful Degradation パターン

`RuntimePolicyResolver` のコンストラクタで `subscriptionAuthProvider?: ISubscriptionAuthProvider` を optional にすることで、DI 未注入時は安全側（no-auth）にフォールバックする。これにより:

- 後方互換性を維持（既存の呼び出し元を変更せずにデプロイ可能）
- graceful degradation が DI レベルと catch レベルの2層で機能
- P62（DEFAULT_CONFIG fallback禁止）準拠

### checkSubscription() の try-catch フォールバック

`ISubscriptionAuthProvider.validateToken()` の例外時に `false` を返して no-auth にフォールバックする。P54（safeRegister パターン不適合）と同系統のパターン。戻り値が不要な場合は catch で安全な既定値を返す。

### 苦戦箇所: bundle 構築の責務分散

`TerminalHandoffBundle` の構築が `RuntimePolicyResolver` のプライベートメソッドと `TerminalHandoffBuilder.build()` に分散した。Resolver 側は prompt を含まないダミー bundle を生成するため shell injection リスクはないが、構造的に不整合。今後は TerminalHandoffBuilder に統一すべき（UT-SC-02-004）。

---

## TASK-SC-05-IMPROVE-LLM（2026-03-23）

### LLM 統合パターンの再利用

`improve()` は `plan()` と同一パターン（ResourceLoader + ILLMAdapter + RESPONSE_SCHEMA_INSTRUCTION + stripMarkdownCodeBlock + type predicate）で実装。新規 LLM 統合メソッド追加時はこのパターンをテンプレートとして使える。`improvePromptConstants.ts` を `planPromptConstants.ts` と対称に作成し、定数管理を統一した。

### 苦戦箇所: isValidImproveResponse の空文字列 before バグ

`isValidImproveResponse()` が `typeof item.before === "string"` のみで検証し、空文字列を許容していた。`String.prototype.includes("")` は常に `true`、`String.prototype.replace("", after)` は先頭に不正挿入するため、SKILL.md が破壊される。`item.before.trim() === ""` チェックを追加して解決。LLM 出力のバリデーションでは型だけでなく値の意味的妥当性まで検証すべき（P42 の LLM 出力応用）。

### 苦戦箇所: P4/P51 早期完了記載の再発

`documentation-changelog.md` に Step 2「完了」と記載されたが、`interfaces-agent-sdk-skill-reference.md` への型定義追記が実際には未実施だった。P57（先送りパターン）も併発。Phase 12 の同期対象は全ファイル更新後に「完了」を記録すべき。

---

## TASK-SC-06-UI-RUNTIME-CONNECTION（2026-03-24）

### 苦戦箇所1（L-SC-06-001）: Hybrid State Pattern と Single Source of Truth の衝突

| 項目         | 内容                                                                                                                                                                                                                                                                                          |
| ------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 課題         | `SkillLifecyclePanel` で `localPlanResult`（useState）と `storePlanResult`（Zustand）の両方に PlanResult を格納する Hybrid State Pattern を採用した。`activePlanResult = localPlanResult ?? storePlanResult` で統合しているが、どちらが SSoT かが曖昧になり、テストでの状態再現が困難になった |
| 症状         | ストア側だけ更新してもローカル側が null でない限り UI が更新されない。テストで `setCurrentPlanResult` を呼んでも表示に反映されないケースが発生                                                                                                                                                |
| 解決策       | ローカル状態は「即時 UI フィードバック」用、Zustand は「永続化・他コンポーネント共有」用と責務を明確化。`setLocalPlanResult(null)` で明示的にクリアしてからストア側を優先する設計に統一                                                                                                       |
| 関連パターン | P31（Zustand Store Hooks 無限ループ）、P48（useShallow 未適用）                                                                                                                                                                                                                               |
| 再発防止     | Hybrid State Pattern を採用する場合は、Phase 2 設計書に「どちらが SSoT か」「クリア順序」を明記する。TASK-SC-12 でガイド化予定                                                                                                                                                                |

### 苦戦箇所2（L-SC-06-002）: executePlan 引数設計ミス（P44/P45 派生）

| 項目         | 内容                                                                                                                                                                                                                        |
| ------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 課題         | 初回実装で `executePlan(planId)` と引数1つで呼び出していたが、runtime API 側は `executePlan(planId, skillSpec)` の2引数を期待していた。Phase 10 レビューで C-1 として検出され、`executePlan(planId, request.trim())` に修正 |
| 症状         | planSkill で生成した計画に基づいて executePlan を呼んでも、skillSpec が undefined のため空のスキルが生成される                                                                                                              |
| 解決策       | IPC API のシグネチャを Phase 2 設計書に明示し、呼び出し側のテストで引数の数と型を検証する                                                                                                                                   |
| 関連パターン | P44（IPC インターフェース不整合）、P45（IPC 引数命名の契約ドリフト）                                                                                                                                                        |

### 苦戦箇所3（L-SC-06-003）: PlanResult 型の二重定義（C-4 問題）

| 項目         | 内容                                                                                                                                                                                                       |
| ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 課題         | `SkillLifecyclePanel.tsx` にローカル `type PlanResult` を定義し、`agentSlice.ts` にも `export interface PlanResult` を定義していた。両者が乖離した場合にコンパイルエラーが出ず、実行時に型不整合が発生する |
| 解決策       | ローカル型定義を削除し、`agentSlice.ts` からの import に一本化（Single Source of Truth）。Phase 10 レビュー C-4 で修正                                                                                     |
| 関連パターン | P23（API 二重定義の型管理複雑性）、P32（型定義の二箇所同時更新必須）                                                                                                                                       |

---

## TASK-IMP-HEALTH-POLICY-UNIFICATION-001（2026-03-25）

### L-HEALTH-001: @deprecated フィールドの段階的移行パターン

| 項目         | 内容                                                                                                                                                                                                                                                        |
| ------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| タスク       | TASK-IMP-HEALTH-POLICY-UNIFICATION-001                                                                                                                                                                                                                      |
| 教訓         | `apiKeyDegraded` を直接削除せず `@deprecated v0.8.0` マーク + optional DI で新旧パスを共存させた。消費側は healthPolicy が渡されれば優先、未渡しなら旧 apiKeyDegraded にフォールバックする dual-path パターン。strangler fig pattern のフィールドレベル適用 |
| 適用条件     | 既存フィールドを新インターフェースに移行する際、全消費者を同時に更新できない場合                                                                                                                                                                            |
| コード例     | `const isDegraded = input.healthPolicy ? input.healthPolicy.isDegraded : (input.apiKeyDegraded ?? false);`                                                                                                                                                  |
| 関連パターン | P26（システム仕様書更新遅延）、P34（遅延初期化 DI パターン選択）                                                                                                                                                                                            |

---

## TASK-SC-07-SKILL-CREATE-WIZARD-LLM-CONNECTION（2026-03-25）

### 苦戦箇所1（L-SC-07-001）: vi.mock gaps — Store hook追加時の既存テスト全破壊

| 項目         | 内容                                                                                                                                                                                                         |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 課題         | TASK-SC-07 で agentSlice に11個の新規 Store hooks を追加したところ、`SkillCreateWizard.store-integration.test.tsx` の `vi.mock('../../../store')` に新しい hook が定義されておらず、15テストが一括 FAIL した |
| 解決策       | Store hooks を追加する際は、`grep -r "vi.mock.*store" --include="*.test.*"` で全テストファイルの vi.mock 定義を検索し、欠落分を補完する                                                                      |
| 関連パターン | P23（API 二重定義の型管理複雑性）、P31（Zustand Store Hooks 無限ループ）                                                                                                                                     |
| 再発防止     | Store hook 追加の PR チェックリストに「既存テストの vi.mock 更新確認」を必須項目として追加する                                                                                                               |

### 苦戦箇所2（L-SC-07-002）: 非破壊拡張 — Optional Props による後方互換性確保

| 項目         | 内容                                                                                                                                     |
| ------------ | ---------------------------------------------------------------------------------------------------------------------------------------- |
| 課題         | SkillCreateWizard に7個の新規 Props（generationMode, isGenerating 等）を追加する際、既存の呼び出し元に影響を与えずに拡張する必要があった |
| 解決策       | 全新規 Props を `?`（optional）として定義し、コンポーネント内部でデフォルト値にフォールバックする。既存テストは変更不要                  |
| 関連パターン | P44（IPC インターフェース不整合）                                                                                                        |

### 苦戦箇所3（L-SC-07-003）: Symmetric Clear Pattern — handleExecutePlan と handleCancelPlan の対称的クリア

| 項目         | 内容                                                                                                                                                             |
| ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 課題         | handleExecutePlan のみで `setLocalPlanResult(null)` + `clearGenerationState()` を実行し、handleCancelPlan ではクリアを忘れると、キャンセル後にステール状態が残る |
| 解決策       | 両ハンドラで同一のクリア処理を対称的に実行する（Symmetric Clear Pattern）。コードレビューで「対になるハンドラ」の存在を確認するチェックを追加                    |
| 関連パターン | L-SC-06-001（Hybrid State Pattern と SSoT の衝突）                                                                                                               |

### 苦戦箇所4（L-SC-07-004）: GenerationMode SSoT — 型定義の Single Source of Truth

| 項目         | 内容                                                                                                                  |
| ------------ | --------------------------------------------------------------------------------------------------------------------- |
| 課題         | `GenerationMode` 型が wizard/index.tsx にローカル定義されると、他コンポーネントとの型共有時に二重定義リスクが発生する |
| 解決策       | `GenerationMode = "llm" \| "template"` を wizard/types.ts に集約し、全参照先から import する（SSoT 原則）             |
| 関連パターン | P23（API 二重定義の型管理複雑性）、L-SC-06-003（PlanResult 型の二重定義）                                             |

---

## UT-SC-02-005（2026-03-25）

### 苦戦箇所1（L-SC-07-005）: Preload executePlan 型追従漏れ

| 項目         | 内容                                                                                                                                                                                                                                                       |
| ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 課題         | IPC ハンドラ（`creatorHandlers.ts`）の `skill-creator:execute-plan` 戻り値型が `RuntimeSkillCreatorExecuteResponse` に更新されたが、Preload（`skill-creator-api.ts`）の `executePlan` 戻り値型が旧型 `RuntimeSkillCreatorExecuteResult` のまま残存していた |
| 症状         | Renderer 側で `terminal_handoff` 型の存在を前提にナロイングを書いても、Preload 型定義が旧型のため TypeScript が誤ったシグネチャを提供し続け、実行時に型不整合が発生する                                                                                    |
| 原因         | P44/P45 パターンの典型例。IPC ハンドラ変更時に Preload → Renderer の3層を同時に走査する習慣が欠けていた                                                                                                                                                    |
| 修正内容     | Preload の `executePlan` 戻り値型を `RuntimeSkillCreatorExecuteResponse` に更新し、Renderer（`SkillLifecyclePanel.tsx`）に `terminal_handoff` 型ナロイングを追加した                                                                                       |
| 関連パターン | P44（IPC インターフェース不整合）、P45（IPC 引数命名の契約ドリフト）                                                                                                                                                                                       |
| 再発防止     | IPC ハンドラの戻り値型変更時は必ず「IPC ハンドラ → Preload API → Renderer 消費箇所」の3層を同一ターンで走査して型追従を確認する                                                                                                                            |

---

## TASK-FIX-EXECUTE-PLAN-FF-001（2026-04-01）

### 教訓1: fire-and-forget の ack と compat path は同じ wave で閉じる

| 項目       | 内容                                                                                                                                                                                                                                                             |
| ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 課題       | `skill-creator:execute-plan` を `{ accepted: true, planId }` の ack に切り替えると、preload の正本契約、Renderer consumer の compat path、snapshot relay を別々に直したくなるが、分けると contract drift が長期化する                       |
| 解決策     | `SkillCreatorExecutePlanAck` を preload の正本として定義し、Renderer は `SkillCreatorWorkflowUiSnapshot` の relay を受ける。旧 `RuntimeSkillCreatorExecuteResponse` は compat path のみで扱い、follow-up cleanup は backlog に分離する |
| 標準ルール | public IPC の戻り値を変更する場合は、ack の正本化・snapshot relay・compat shim の終端・follow-up backlog の 4 点を同一 wave で記録する                                                                                                                      |

### 教訓2: 非同期 progress hook は internal phase と public snapshot を混ぜない

| 項目       | 内容                                                                                                                                                                                                                      |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 課題       | `SkillCreatorExecuteAsyncPhase` を renderer public へ露出させると、`SkillCreatorWorkflowPhase` と役割が重なり、UI は internal progress と workflow state を同列に誤解しやすい                                                  |
| 解決策     | `SkillCreatorExecuteAsyncPhase = "executing" \| "complete" \| "error"` は `SkillCreatorWorkflowEngine` の内部 hook に閉じ、Renderer へは `SKILL_CREATOR_WORKFLOW_STATE_CHANGED` の snapshot だけを送る               |
| 標準ルール | internal progress label / public snapshot / renderer state の 3 層は混在させず、type 名と通知経路を別々に定義する                                                                                                           |

---

## TASK-FIX-BETTER-SQLITE3-ELECTRON-ABI-001（2026-03-31）

### 苦戦箇所1（L-BETTER-SQLITE3-ABI-001）: native addon ABI 不一致 — postinstall で自動 rebuild

| 項目     | 内容                                                                                                                                                                                                        |
| -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 課題     | `pnpm install` 直後の `better-sqlite3` は Node.js ABI（127 = Node.js 22.x）向け prebuilt バイナリが入る。Electron 39.2.4 は ABI 140 を使う内部ランタイムを持つため、ABI 不一致で `ERR_DLOPEN_FAILED` になる |
| 症状     | Electron 起動時に `NODE_MODULE_VERSION 127 … requires NODE_MODULE_VERSION 140` → DB 初期化失敗 → IPC ハンドラ登録失敗                                                                                       |
| 解決策   | `apps/desktop/package.json` に `"postinstall": "pnpm rebuild:native"` を追加。`pnpm install` 後に自動で Electron ABI 向けに native addon を再コンパイルする                                                 |
| 注意点   | `esbuild` は workspace 内の version 競合で rebuild が失敗しやすいため `(pnpm rebuild esbuild \|\| true)` として best-effort 扱いにする。`better-sqlite3` は必須（`\|\| true` 不要）                         |
| 再発防止 | 新しい native addon を追加する際は `apps/desktop/package.json` の `rebuild:native` に対象を追加し、`pnpm --filter @repo/desktop rebuild:native` で動作確認する                                              |

---

## TASK-FIX-PRELOAD-VITE-ALIAS-SHARED-IPC-001（2026-03-31）

### 苦戦箇所1（L-PRELOAD-ALIAS-001）: externalizeDepsPlugin が resolve.alias より前に外部化判定を行う

| 項目     | 内容                                                                                                                                                                                                                                                                      |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 課題     | `externalizeDepsPlugin` が `config` フックで `rollupOptions.external` に `^(@repo/shared)/.+` 正規表現を設定するため、`resolve.alias` のみでは外部化を防げない                                                                                                            |
| 症状     | `apps/desktop/electron.vite.config.ts` preload セクションに `resolve.alias` を追加しても `out/preload/index.js` に `require("@repo/shared/src/ipc/channels")` が残存し続けた                                                                                              |
| 根本原因 | Rollup の external チェックはモジュール解決（`resolveId` フック）より**前**に実行される。`resolve.alias` は Vite のビルトイン alias プラグインとして `resolveId` フックで動作するため、alias 変換が間に合わない                                                           |
| 解決策   | `externalizeDepsPlugin({ exclude: ["@repo/shared"] })` と `resolve.alias` を組み合わせる。`exclude` により `rollupOptions.external` の正規表現から `@repo/shared` が除去され、alias が正常に機能する                                                                      |
| 安全性   | `@repo/shared` の他サブパスが preload で `import type` のみであることを確認してから `exclude` を適用すること。値インポートが存在する場合、意図しないバンドル増加が発生する                                                                                                |
| 再発防止 | `electron.vite.config.ts` の preload セクションで workspace パッケージのサブパスをバンドルに含める場合は、`externalizeDepsPlugin({ exclude: ["パッケージ名"] })` + `resolve.alias` の組み合わせが必要。`resolve.alias` 単独では機能しないことを仕様書設計時に明記すること |

---

## TASK-FIX-AUTH-IPC-001（2026-04-01）

### 教訓1（L-AUTH-IPC-001）: IPC channel timeout と fire-and-forget パターン

| 項目          | 内容                                                                                                                                                                                                                                                     |
| ------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 課題          | `auth:login` ハンドラーが `await authFlowOrchestrator.startOAuthFlow(provider)` で OAuth フロー完了を待機していた。OAuth は外部ブラウザ認証を含み完了まで数秒〜数十秒かかる。`CHANNEL_TIMEOUTS["auth:login"] = 500ms` との矛盾でタイムアウトエラーが発生 |
| 症状          | `[AuthSlice] Login error: Error: IPC timeout: auth:login did not respond within 500ms`                                                                                                                                                                   |
| 根本原因      | handler が長時間の非同期処理完了を await することで IPC レスポンスが遅延する。channel-specific timeout がある場合は特に注意が必要                                                                                                                        |
| 解決策        | `void authFlowOrchestrator.startOAuthFlow(provider).catch(console.error)` — fire-and-forget で即時返却する。バリデーション（invalid provider）のみ同期チェックして即時エラーを返す                                                                       |
| 標準ルール    | `CHANNEL_TIMEOUTS` で channel-specific timeout が設定されている IPC は、handler 内で timeout を超える可能性がある await を使わない。長時間処理は別イベント（`AUTH_STATE_CHANGED` など）で完了を通知する設計にする                                        |
| 5分解決カード | `ipc-utils.ts` の `CHANNEL_TIMEOUTS` を確認し、timeout 値を超える処理を `await` している handler があれば fire-and-forget に切り替え、完了通知を既存イベントに委譲する                                                                                   |

### 教訓2（L-AUTH-IPC-002）: AUTH_STATE_CHANGED 責務境界の分離

| 項目       | 内容                                                                                                                                                                                                          |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 課題       | `auth:login` handler が fire-and-forget 化した場合、OAuth 失敗時に handler が `AUTH_STATE_CHANGED` を二重送信するリスクがある                                                                                 |
| 解決策     | `authHandlers.ts` 側では `AUTH_STATE_CHANGED` を一切送信しない。成功・失敗の通知責務は `AuthFlowOrchestrator` に固定する。handler は「起動確認（success: true）」と「起動拒否（invalid provider）」のみを担う |
| 標準ルール | IPC handler と event emitter の責務を明確に分離する。handler は「受付」、orchestrator は「完了通知」。両方が同じイベントを送信すると Renderer 側で状態遷移の二重処理が発生する                                |
| 関連タスク | TASK-FIX-AUTH-IPC-001 / `authHandlers.ts:auth:login` / `authFlowOrchestrator.ts:startOAuthFlow`                                                                                                               |

---

## Phase-12 IPC 4層型同期（2026-04-06）

### L-IPC-4LAYER-001: IPC 4層型定義は shared 層に集約する

| 項目          | 内容                                                                                                                                                                                                                                 |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 課題          | creatorHandlers（Main）→ SkillCreatorFacade（Service）→ Preload API → Renderer の4層で型定義が個別管理されており、Session Resume の `errorReason` フィールド（`expired` / `incompatible` / `not_found` の3分岐）が全層で同期されているか確認が困難だった |
| 症状          | Preload 層の型に `errorReason` を追加しても Renderer 側の型推論が古いまま残存。TypeScript は個別ファイルの型を参照するため、cross-layer の型同期漏れを静的に検出できない                                                            |
| 解決策        | Session Resume 関連の型（`SessionSummary` / `SessionDetail` / `SessionResumeResult` / `errorReason`）を `packages/shared/src/types/` に SSoT として定義し、4層すべてから import する。型変更は shared の1ファイルを修正すれば全層に波及する |
| 標準ルール    | 複数層にまたがる IPC 型は `packages/shared/src/types/` に集約し、各層では再定義せず import のみとする。Preload 側でもローカル型定義は避け、shared 型をそのまま export する                                                          |
| 関連タスク    | TASK-P0-08 session-resume-renderer-integration                                                                                                                                                                                       |

### L-IPC-4LAYER-002: errorReason 3分岐は型 union で全層同期する

| 項目          | 内容                                                                                                                                                                                     |
| ------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 課題          | `errorReason: 'expired' \| 'incompatible' \| 'not_found'` が Main 側と Renderer 側で別々の string literal union として定義されていると、1分岐の追加が片側だけの修正で終わるリスクがある |
| 解決策        | shared の型定義で `SessionResumeErrorReason = 'expired' \| 'incompatible' \| 'not_found'` として export し、Main/Preload/Renderer の全3箇所でこの型を参照する                          |
| 検証方法      | `packages/shared` の型変更後に `pnpm typecheck --filter @repo/desktop` を実行し、全層のコンパイルエラーで同期漏れを検出する                                                              |
| 標準ルール    | 分岐数が3以上の status/reason 型は必ず shared に抽出し、type alias として管理する。inline string literal は2値（boolean的）の場合のみ許容する                                           |
| 関連タスク    | TASK-P0-08 session-resume-renderer-integration                                                                                                                                           |

### L-SESSION-RESUME-UI-001: SessionResumePrompt の snapshot nullability 設計パターン

| 項目          | 内容                                                                                                                                                                                                                      |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 課題          | `SkillLifecyclePanel` が一次導線に昇格（TASK-UI-01）した後、`SessionResumePrompt` / `SessionIndicator` との画面遷移ロジックが複雑化した。`snapshot` が `null` の場合と `undefined` の場合で挙動を分けていたため、条件分岐が冗長化した |
| 解決策        | `snapshot` は `SkillCreatorWorkflowUiSnapshot \| null` に型を統一し、`undefined` は許容しない。`null` は「セッションなし」、非 null は「セッションあり（resume 可否判定が必要）」として意味を明確化する                  |
| パターン      | `const hasSession = snapshot !== null;` を単一の判定ポイントとし、resume プロンプト表示条件は `hasSession && !isSessionActive` の形で表現する。`snapshot?.sessionId` のような optional chaining の乱用を避ける           |
| 標準ルール    | 遷移条件が3分岐以上になる場合は nullability の型統一（`null` vs `undefined` の使い分け廃止）を最初に行う。`snapshot ?? null` パターンで undefined を早期に null へ正規化する                                           |
| 関連タスク    | TASK-P0-08 session-resume-renderer-integration / TASK-UI-01 lifecycle-panel-primary-route-promotion                                                                                                                       |

---

## TASK-UT-RT-01 executeAsync エラー伝搬パス（2026-04-06）

### L-IPC-VARIADIC-001: IPC の第3引数は preload で明示的に通す

- **教訓**: Main 側で `webContents.send(channel, snapshot, errorMessage)` としても、preload の `safeOn` が 1 引数固定だと errorMessage は Renderer に届かない
- **対策**: multi-arg event は preload bridge を variadic 化し、Renderer 側 callback でも optional errorMessage を受け取る
- **コード例**:
  ```typescript
  // preload 側
  safeOn<[SkillCreatorWorkflowUiSnapshot | null, string?]>(
    ipcRenderer,
    SKILL_CREATOR_WORKFLOW_STATE_CHANGED,
    (snapshot, errorMessage) => callback(snapshot, errorMessage),
  );
  ```
- **適用範囲**: snapshot 以外のメタ情報（errorMessage など）を同一 IPC イベントで流したい場合の標準パターン
- **発見日**: 2026-04-06

---

## TASK-UT-RT-01 executeAsync エラーコールバックガード（2026-04-07）

### L-RT01-CALLBACK-GUARD-001: エラーコールバックを `if (!snapshot)` 等の条件でガードしない

| 項目       | 内容                                                                                                                                                                              |
| ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 課題       | `executeAsync()` のエラーパスで `if (!snapshot)` 条件を使って `onWorkflowStateSnapshot` 呼び出しをガードしていた。snapshot が存在する場合はエラーメッセージがコールバックに届かなかった |
| 解決策     | `onWorkflowStateSnapshot(snapshot ?? null, error)` パターンに統一。snapshot の有無に関わらずエラー情報を必ずコールバックに渡す                                                    |
| 標準ルール | エラーコールバックは「状態が取得できた場合でも渡す、取得できない場合は null にする」という `callback(snapshot ?? null, error)` パターンが正しい。条件分岐でエラー通知をガードしない |
| コード例   | `onWorkflowStateSnapshot(snapshot ?? null, error instanceof Error ? error.message : String(error))` |
| 適用範囲   | fire-and-forget ラッパー内で structured error と catch パスの両方が存在する場合の標準パターン                                                                                    |
| 発見日     | 2026-04-07（TASK-UT-RT-01-EXECUTE-ASYNC-SNAPSHOT-ERROR-MESSAGE-001）                                                                                                            |
