# Lessons Learned（教訓集） / current index

> 親仕様書: [lessons-learned.md](lessons-learned.md)
> 役割: current summary のインデックス。各カテゴリ別ファイルへの導線を提供する。
> 古いエントリ（2026-03-15以前）は [lessons-learned-archive-2026-03.md](lessons-learned-archive-2026-03.md) を参照。

## メタ情報

| 項目     | 値                                                                     |
| -------- | ---------------------------------------------------------------------- |
| 正本     | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md` |
| 目的     | タスク実行時の苦戦箇所と解決策を記録し、将来の開発効率を向上           |
| スコープ | 実装過程で遭遇した課題、解決策、コード例                               |
| 対象読者 | AIWorkflowOrchestrator 開発者                                          |

---

## 変更履歴

| 日付       | バージョン | 変更内容                                                                                                                                                                                                                                                                                                              |
| ---------- | ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2026-03-30 | 2.12.0     | TASK-P0-05 execute-skill-file-writer-integration 教訓3件を追加（→ [lessons-learned-ipc-preload-runtime.md](lessons-learned-ipc-preload-runtime.md): L-P005-001 LLM応答パース見出し正規化 / L-P005-002 worktree canonical mirror同期 / L-P005-003 DI未注入 skilFileWriter fail-silent回避）                                                                                                                                                                                                                                                                                    |
| 2026-03-30 | 3.1.0      | TASK-RT-03 SkillCreationResultPanel 教訓4件を追加（raw result local state保持 / terminal_handoff vs integrated_api 型ガード / progressive disclosure パターン / 共通UIパーツ early 抽出）                                                                                                                             |
| 2026-03-30 | 3.2.0      | TASK-RT-05 multi_select UserInputKind 追加の教訓4件を追加（→ [lessons-learned-skill-create-multi-select-kind.md](lessons-learned-skill-create-multi-select-kind.md): L-RT05-001 field追加+kind分岐パターン、L-RT05-002 stale state useEffect reset、L-RT05-003 jest-dom setupFiles確認、L-RT05-004 shared contract same-wave sync） |
| 2026-03-29 | 3.0.0      | TASK-P0-01 SkillCreatorVerificationEngine Layer 1/2 教訓3件を追加（L-VE-001: tmp fixture パターン / L-VE-002: Layer union 型拡張の backward compatibility / L-VE-003: SKILL.md セクション名 drift 検出の重要性）                                                                                                      |
| 2026-03-29 | 2.11.0     | TASK-RT-02 api-key-ui-adapter-status 教訓3件を追加（→ [lessons-learned-ui-adapter-status-retry.md](lessons-learned-ui-adapter-status-retry.md): useRef race condition 防止 / Promise.allSettled 独立エラー処理 / プロバイダー単位 isRetrying Map パターン）                                                           |
| 2026-03-29 | 2.10.0     | UT-RT-06-CONS 教訓2件を追加（→ [lessons-learned-test-typesafety.md](lessons-learned-test-typesafety.md): L-RT-06-CONS-001 Phase 7 グローバル閾値回避の個別カバレッジ計測 / L-RT-06-CONS-002 最小共通helper抽出パターン）                                                                                              |
| 2026-03-28 | 2.9.0      | TASK-SDK-08 session-persistence-and-resume-contract 教訓3件を追加（L-1: esbuild mismatch、L-2: artifact命名規約 / validator不一致、L-3: Phase 11 UI/docs-only判定不一致）                                                                                                                                             |
| 2026-03-27 | 2.8.2      | TASK-SDK-04 の教訓3件を追加（→ [lessons-learned-ipc-preload-runtime.md](lessons-learned-ipc-preload-runtime.md): user input semantics / canonical execute binding、→ [lessons-learned-phase12-workflow-lifecycle.md](lessons-learned-phase12-workflow-lifecycle.md): spec_created task の screenshot/evidence drift） |
| 2026-03-27 | 2.8.2      | UT-IMP-TASK-SDK-06-LAYER34-VERIFY-EXPANSION-001 の教訓3件を追加（→ [lessons-learned-phase12-workflow-lifecycle.md](lessons-learned-phase12-workflow-lifecycle.md): placeholder-only screenshot PASS 禁止 / implementation guide Part 2 必須要素 / Phase 2 contract matrix stale drift 防止）                          |
| 2026-03-26 | 2.8.1      | UT-IMP-RUNTIME-WORKFLOW-VERIFY-ARTIFACT-APPEND-001 の教訓2件を追加（→ [lessons-learned-phase12-workflow-lifecycle.md](lessons-learned-phase12-workflow-lifecycle.md): Step 2 no-op 時の Step 1 台帳同期必須 / Phase 12 root evidence の patch marker 混入監査）                                                       |
| 2026-03-25 | 2.8.0      | TASK-SC-08-E2E-VALIDATION 教訓3件を追加（L-SC-E2E-001: IPC handlerMap モックパターン、L-SC-E2E-002: TerminalHandoff セキュリティ検証、L-SC-E2E-003: Phase仕様書パス移動時の参照ドリフト）                                                                                                                             |
| 2026-03-25 | 2.8.0      | TASK-SC-07-STREAMING-PROGRESS-UI 教訓4件を追加（L-SC-07-001: Slice名前衝突回避、L-SC-07-002: P5対策safeOn cleanup、L-SC-07-003: P47対策ErrorCards網羅性、L-SC-07-004: ローカルstate vs Zustand二重管理）                                                                                                              |
| 2026-03-25 | 2.7.0      | UT-SC-05-IPC-DI-WIRING 教訓2件を追加（L-IPC-DI-001: 仕様書作成時点とコード乖離、L-IPC-DI-002: オプショナルDIサイレントデグラデーション）                                                                                                                                                                              |
| 2026-03-25 | 2.6.1      | UT-LLM-MOD-01-005 の教訓3件を追加（→ [lessons-learned-test-typesafety.md](lessons-learned-test-typesafety.md): provider registry SSoT / optional matcher narrowing / readonly bridge follow-up）                                                                                                                      |
| 2026-03-24 | 2.5.0      | TASK-LLM-MOD-03 苦戦箇所2件を追加（L-LLM-MOD-03-001〜002: baseUrl変更のcross-file依存 / system_instruction条件付加の設計判断）                                                                                                                                                                                        |
| 2026-03-22 | 2.2.3      | TASK-IMP-CHAT-WORKSPACE-GUIDANCE-ACTION-WIRING-001 の Phase 12 教訓4件を追加                                                                                                                                                                                                                                          |
| 2026-03-21 | 2.2.1      | TASK-FIX-LLM-CONFIG-PERSISTENCE の Phase 11/12 教訓3件を追加                                                                                                                                                                                                                                                          |
| 2026-03-21 | 2.2.0      | UT-SLIDE-UI-001 教訓3件を追加（L-SLIDE-UI-001〜003）                                                                                                                                                                                                                                                                  |
| 2026-03-21 | 2.2.2      | TASK-IMP-RUNTIME-POLICY-CAPABILITY-BRIDGE-001 の Phase 12 教訓を追記                                                                                                                                                                                                                                                  |
| 2026-03-21 | 2.2.1      | TASK-IMP-RUNTIME-POLICY-CENTRALIZATION-001 の Phase 12 最終再監査教訓を追記                                                                                                                                                                                                                                           |
| 2026-03-21 | 2.2.0      | TASK-IMP-RUNTIME-POLICY-CENTRALIZATION-001 の Phase 12 close-out 教訓2件を追加                                                                                                                                                                                                                                        |

| 2026-03-23 | 2.5.0 | TASK-SC-05-IMPROVE-LLM 教訓3件を追加（→ [ipc-preload-runtime](lessons-learned-ipc-preload-runtime.md): LLM統合パターン再利用、空文字列beforeバグ、P4/P51再発） |
| 2026-03-23 | 2.4.0 | TASK-IMP-CHATPANEL-REVIEW-HARNESS-ALIGNMENT-001 教訓3件を追加（L-CHRHA-001〜003: GAP ラベルドリフト / DEFERRED 判断誤り / ViewType 型不一致） |
| 2026-03-25 | 2.7.0 | TASK-SC-07-SKILL-CREATE-WIZARD-LLM-CONNECTION 教訓4件を追加（→ [ipc-preload-runtime](lessons-learned-ipc-preload-runtime.md): vi.mock gaps、非破壊拡張、Symmetric Clear横展開、GenerationMode SSoT） |
| 2026-03-24 | 2.6.0 | TASK-SC-06-UI-RUNTIME-CONNECTION 苦戦箇所3件を追加（→ [ipc-preload-runtime](lessons-learned-ipc-preload-runtime.md): Hybrid State Pattern SSoT問題、executePlan引数設計ミス、PlanResult型一本化） |
| 2026-03-24 | 2.5.1 | TASK-IMP-CANONICAL-BRIDGE-LEDGER-GOVERNANCE-001 契約テスト教訓2件を追加（L-CBLG-003: テストマトリクスファイル参照誤り、L-CBLG-004: TS1501 regex /s flag） |
| 2026-03-23 | 2.5.0 | TASK-IMP-CANONICAL-BRIDGE-LEDGER-GOVERNANCE-001 教訓2件を追加（L-CBLG-001: Phase 10 MINOR 照合漏れ、L-CBLG-002: Step A-E 先送り P57 違反） |
| 2026-03-23 | 2.3.2 | UT-RUNTIME-BUILDER-MIGRATION-001 教訓2件を追加（L-RBM-001: shared型3レイヤー波及、L-RBM-002: sanitize テスト正規表現） |
| 2026-03-23 | 2.3.1 | UT-EXECUTION-ENV-TERMINAL-001 教訓1件を追加（L-EXEC-TERMINAL-001） |
| 2026-03-22 | 2.3.1 | TASK-IMP-TRANSCRIPT-TO-CHAT-PROVENANCE-LINKAGE-001 設計タスク教訓2件を追加（L-TCPL-001〜002） |
| 2026-03-22 | 2.3.0 | TASK-IMP-TERMINAL-HANDOFF-SURFACE-REALIZATION-001 設計タスク教訓3件を追加（L-THSR-001〜003） |
| 2026-03-22 | 2.2.3 | TASK-FIX-WORKSPACE-CHAT-STREAM-ERROR の same-wave sync 教訓を追加 |
| 2026-03-20 | 2.1.1 | TASK-FIX-CHATVIEW-ERROR-SILENT-FAILURE 再監査の教訓3件を追加 |
| 2026-03-18 | 2.1.0 | 1598行超過のため分割。2026-03-15以前エントリを archive-2026-03.md へ移動。UT-TASK06-007 苦戦箇所5件を追加 |
| 2026-03-17 | 2.0.0 | 651行超過のため4ファイルに分割しインデックス化 |
| 2026-03-17 | 1.30.00 | TASK-SKILL-LIFECYCLE-08 仕様書作成の教訓4件を追加 |
| 2026-03-16 | 1.29.97 | TASK-FIX-CONVERSATION-IPC-HANDLER-REGISTRATION の教訓3件を追加 |
| 2026-03-16 | 1.29.96 | TASK-FIX-ELECTRON-APP-MENU-ZOOM-001 / UT-06-005 / UT-06-001 / TASK-SKILL-LIFECYCLE-07 / TASK-SKILL-LIFECYCLE-06 の教訓を追加（P57〜P59 新規） |

> 2026-03-15 以前のエントリ（TASK-SKILL-LIFECYCLE-04/05、TASK-IMP-WORKSPACE-CHAT-EDIT P57〜P61、TASK-IMP-AI-RUNTIME-AUTHMODE-UNIFICATION-001 等）は [lessons-learned-archive-2026-03.md](lessons-learned-archive-2026-03.md) を参照。

---

## 分割ファイル一覧

| ファイル | カテゴリ | 含まれるタスク |
| --- | --- | --- |
| [lessons-learned-viewtype-electron-ui.md](lessons-learned-viewtype-electron-ui.md) | ViewType / Electron UI | TASK-IMP-SKILLDETAIL-ACTION-BUTTONS-001, TASK-IMP-VIEWTYPE-RENDERVIEW-FOUNDATION-001, TASK-FIX-ELECTRON-APP-MENU-ZOOM-001 |
| [lessons-learned-ipc-preload-runtime.md](lessons-learned-ipc-preload-runtime.md) | IPC / Preload / AI Runtime | TASK-IMP-SKILL-DOCS-AI-RUNTIME-001, TASK-IMP-WORKSPACE-CHAT-EDIT-AI-RUNTIME-001 (P57-P61), TASK-IMP-AI-RUNTIME-AUTHMODE-UNIFICATION-001, TASK-FIX-WORKSPACE-CHAT-STREAM-ERROR |
| [lessons-learned-test-typesafety.md](lessons-learned-test-typesafety.md) | テスト / 型安全 / 品質 | UT-06-001, UT-06-005 |
| [lessons-learned-phase12-workflow-lifecycle.md](lessons-learned-phase12-workflow-lifecycle.md) | Phase 12 / ワークフロー / ライフサイクル | TASK-FIX-CHATVIEW-ERROR-SILENT-FAILURE, TASK-FIX-LLM-SELECTOR-INLINE-GUIDANCE, TASK-FIX-LLM-CONFIG-PERSISTENCE, TASK-SKILL-LIFECYCLE-04/05/06/07 |
| [lessons-learned-phase12-workflow-lifecycle.md](lessons-learned-phase12-workflow-lifecycle.md) | Phase 12 / ワークフロー / ライフサイクル | TASK-SKILL-LIFECYCLE-04/05/06/07, TASK-IMP-EXECUTION-RESPONSIBILITY-CONTRACT-FOUNDATION-001, TASK-IMP-RUNTIME-POLICY-CENTRALIZATION-001, TASK-IMP-RUNTIME-POLICY-CAPABILITY-BRIDGE-001 |

| [lessons-learned-safety-gate-permission-fallback.md](lessons-learned-safety-gate-permission-fallback.md) | SafetyGate / Permission / Fallback | UT-06-005, TASK-SKILL-LIFECYCLE-08 |
| [lessons-learned-ui-adapter-status-retry.md](lessons-learned-ui-adapter-status-retry.md) | UI / 非同期状態管理 / アダプター | TASK-RT-02 api-key-ui-adapter-status, TASK-RT-03 SkillCreationResultPanel |
| [lessons-learned-ui-adapter-status-retry.md](lessons-learned-ui-adapter-status-retry.md) | UI / 非同期状態管理 / アダプター | TASK-RT-02 api-key-ui-adapter-status |
| [lessons-learned-skill-create-multi-select-kind.md](lessons-learned-skill-create-multi-select-kind.md) | SkillCreator / UserInputKind / multi_select | TASK-RT-05 |
| [lessons-learned-archive-2026-03.md](lessons-learned-archive-2026-03.md) | アーカイブ | 2026-03-15以前の全エントリ |

---

## クイックリファレンス: カテゴリ別検索ガイド

### ViewType / 画面遷移 / Electron メニュー
→ [lessons-learned-viewtype-electron-ui.md](lessons-learned-viewtype-electron-ui.md)
- `renderView` 分岐テスト、screenshot 到達確認、P40 テスト実行ディレクトリ依存
- main shell handoff capture、shared DOM selector scope
- Electron role ベースメニュー、Main Process エントリポイント副作用

### IPC / Preload / AI Runtime / 認証
→ [lessons-learned-ipc-preload-runtime.md](lessons-learned-ipc-preload-runtime.md)
- AuthMode 値乖離（P57）、同名ファイル二重存在（P58）、Preload API 未公開（P59）
- サービススコープ制限（P60）、動的アダプタ注入（P61）
- LLM adapter bind() パターン、CapabilityResolver、esbuild platform mismatch
- Hybrid State Pattern（localPlanResult + store）SSoT 問題、executePlan skillSpec 引数漏れ

### テスト / 型安全 / 品質検証
→ [lessons-learned-test-typesafety.md](lessons-learned-test-typesafety.md)
- Object.freeze + satisfies パターン（P19 再発防止）
- 既実装コードの abort フロー発見遅延（P50）

### Phase 12 / ワークフロー / ライフサイクル設計
→ [lessons-learned-phase12-workflow-lifecycle.md](lessons-learned-phase12-workflow-lifecycle.md)
- 設計タスクでの仕様書更新先送り（P57）、未タスク指示書配置省略（P58）
- 並列エージェント changelog 件数不整合（P59）
- persist task の storage key drift、防ぎきれていない false green、family same-wave sync 漏れ
- spec-only close-out では downstream task status と code diff 0/有を併記する
- standalone root 移設時は parent/downstream/system spec の旧 path を same-wave で閉じる
- `implementation_ready` / `spec_created` / `blocked` の意味を分離し、Phase 13 だけ future gate に残す

### 2026-03-25 TASK-SC-07-STREAMING-PROGRESS-UI ストリーミング進捗UI実装

#### L-SC-07-001: Slice名前衝突回避（`streamingError` → `genProgressError` への改名）

| 項目 | 内容 |
| --- | --- |
| 課題 | `generationProgressSlice` に `streamingError` フィールドを定義したところ、既存の `chatSlice` に同名フィールドが存在していたため、Store マージ時に型衝突が発生した |
| 再発条件 | 新規 Slice を追加する際に、既存 Slice のフィールド名と重複するキーを使用した場合 |
| 解決策 | `streamingError` → `genProgressError` に改名し、Slice スコープを明示するプレフィックスを付与した |
| 標準ルール | 新規 Slice 追加前に `store/index.ts` の既存フィールド名を grep して衝突を事前チェックする |
| 関連パターン | P31（Store セレクタの SSoT） |
| 関連タスク | TASK-SC-07-STREAMING-PROGRESS-UI |

#### L-SC-07-002: P5対策（safeOn cleanup の useEffect return 必須化）

| 項目 | 内容 |
| --- | --- |
| 課題 | `useStreamingProgress` Hook で `safeOn` によるIPCリスナー登録を行ったが、`useEffect` の cleanup 関数を返し忘れたため、コンポーネントのアンマウント後もリスナーが残存し、二重登録が発生した |
| 再発条件 | `safeOn` / `ipcRenderer.on` を `useEffect` 内で呼び出す際に cleanup return を省略した場合 |
| 解決策 | `useEffect` 内で `const cleanup = safeOn(...)` を受け取り、`return () => cleanup()` を必ず返す |
| 標準ルール | IPC リスナーを登録する `useEffect` は必ず cleanup return を含めるルールをコードレビューチェックリストに追加する |
| 関連パターン | P5（IPC リスナー二重登録防止） |
| 関連タスク | TASK-SC-07-STREAMING-PROGRESS-UI |

#### L-SC-07-003: P47対策（`Record<GenerationErrorCode, ReactNode>` による ErrorCards 網羅性保証）

| 項目 | 内容 |
| --- | --- |
| 課題 | ErrorCards コンポーネントでエラーコードごとの表示を `switch` 文で実装していたが、新しい `GenerationErrorCode` 追加時に case 漏れが TypeScript では検出されなかった |
| 再発条件 | エラーコードの union 型が拡張された際に、対応するビューコンポーネント側の分岐が更新されない場合 |
| 解決策 | `const ERROR_CARDS: Record<GenerationErrorCode, ReactNode>` として全コードをキーとするオブジェクト型で定義し、TypeScript の完全性チェックを活用した |
| 標準ルール | エラーコード → UI マッピングは `switch` ではなく `Record<ErrorCode, ReactNode>` パターンで実装する |
| 関連パターン | P47（Exhaustive Check） |
| 関連タスク | TASK-SC-07-STREAMING-PROGRESS-UI |

#### L-SC-07-004: ローカルstate vs Zustand二重管理（createSkillのPromise rejectがIPCチャンネルを経由しないため、resolveStage/bridgeLocalErrorによるブリッジが必要）

| 項目 | 内容 |
| --- | --- |
| 課題 | `createSkill` の IPC 呼び出しは Promise を返すが、ストリーミング進捗イベントは別チャンネルの `safeOn` で受け取る設計になっており、Promise の reject と IPC イベントの到着順序が保証されなかった。Store（`generationProgressSlice`）とローカル state の両方で進捗を管理すると SSoT が崩れた |
| 再発条件 | IPC の request/response と push イベントを混在させるストリーミングパターンで、進捗状態の管理先を一元化しない場合 |
| 解決策 | `resolveStage`（IPC Promise resolve 時に Store へ反映）と `bridgeLocalError`（ローカル catch を Store エラーへ橋渡し）の2つのブリッジ関数を設け、IPC レスポンスと Store 状態を同期させた |
| 標準ルール | ストリーミング進捗パターンでは Promise 側と push イベント側を Store に集約し、ローカル state との二重管理を避ける |
| 関連パターン | P31（Store SSoT）, Hybrid State Pattern |
| 関連タスク | TASK-SC-07-STREAMING-PROGRESS-UI |

---

### 2026-03-25 UT-SC-05-IPC-DI-WIRING DI配線完了

#### L-IPC-DI-001: 仕様書作成時点と実装時点のコード乖離

| 項目 | 内容 |
| --- | --- |
| 課題 | Phase 1-2 で「3依存（skillFileManager, llmAdapter, resourceLoader）がすべて未注入」を前提に設計したが、Phase 3 実行時に resourceLoader と llmAdapter は既に別タスク（TASK-SC-05-IMPROVE-LLM）で注入済みだった。実際の変更は `skillFileManager` の1行追加のみ |
| 再発条件 | 仕様書作成後に他タスクが先に実装をマージし、前提コードが変化した場合 |
| 解決策 | Phase 3 の設計レビューで現状コードとの差分分析を実施し、実際の変更量を特定。仕様書の前提を修正 |
| 標準ルール | Phase 3 開始時に `git diff` または `grep` で仕様書のコードスニペットと現状コードの差分を確認する。コミットハッシュを仕様書に記録する |
| 関連パターン | P34（遅延初期化 DI パターン） |
| 関連タスク | UT-SC-05-IPC-DI-WIRING |

#### L-IPC-DI-002: オプショナル DI のサイレントデグラデーション

| 項目 | 内容 |
| --- | --- |
| 課題 | `RuntimeSkillCreatorFacadeDeps` のフィールドがすべてオプショナルであるため、依存未注入でも TypeScript のコンパイルエラーが発生せず、Graceful Degradation が「正常動作」として長期間見過ごされた |
| 解決策 | Graceful Degradation 発動時のログ計装で「意図しない degradation」を検出可能にする。必須依存は Required フィールドに変更することを検討 |
| 標準ルール | オプショナル DI フィールドを使用する場合、Graceful Degradation 発動時にログ（warn レベル）を出力する |
| 関連タスク | UT-SC-05-IPC-DI-WIRING |

---

### 2026-03-24 TASK-LLM-MOD-03 GoogleAdapter system_instruction 対応

#### 苦戦箇所1（L-LLM-MOD-03-001）: baseUrl v1→v1beta 変更の cross-file 依存

| 項目 | 内容 |
| --- | --- |
| 課題 | `GoogleAdapter.ts` の `baseUrl` を `v1` から `v1beta` に変更した際、`GoogleAdapter.test.ts` の MSW モック URL は Phase 4-5 で更新したが、`streaming.test.ts` の MSW モック URL 3 箇所が `v1` のまま残っていた。Phase 9（品質保証）で全 Adapter テストを実行して初めて発見された |
| 再発条件 | アダプターの URL/エンドポイント変更時に、対象テストファイル以外のテストが同じ URL をモックしているケースを見逃す |
| 解決策 | `streaming.test.ts` の MSW ハンドラ URL 3 箇所を `v1beta` に修正。Phase 9 の全テスト実行ゲートがなければ検出できなかった |
| 標準ルール | URL/エンドポイント変更時は `grep -rn "旧URL" __tests__/` で全テストファイルの使用箇所を検索してから変更する |
| 関連タスク | TASK-LLM-MOD-03 |

#### 苦戦箇所2（L-LLM-MOD-03-002）: system_instruction の条件付加における trim ガード

| 項目 | 内容 |
| --- | --- |
| 課題 | `request.systemPrompt` が空文字列 `""` やスペースのみ `"   "` の場合に、空の `system_instruction` を送信すると Gemini API がエラーを返す可能性がある。Phase 5 で `request.systemPrompt` の truthy チェックだけだと空文字列はブロックできるが、スペースのみは通過する |
| 解決策 | `request.systemPrompt?.trim()` で trim 後の truthy チェックに統一。P42（.trim() バリデーション漏れ）パターンを適用 |
| 標準ルール | 外部 API に送信する文字列フィールドは `.trim()` 後の truthy チェックを標準とする |
| 関連パターン | P42（文字列引数の .trim() バリデーション漏れ） |
| 関連タスク | TASK-LLM-MOD-03 |

---

### 2026-03-22 TASK-FIX-WORKSPACE-CHAT-STREAM-ERROR 同期

#### 苦戦箇所1: structured error と legacy fallback を同じ UI で二重表示しやすい

| 項目 | 内容 |
| --- | --- |
| 課題 | `streamingError` と `errorMessage` を同時に表示すると、Workspace Chat のエラー surface が重複し、同じ内容が2回見える |
| 解決策 | `StreamingErrorDisplay` を primary surface に固定し、`WorkspaceChatInput` の inline error は fallback に限定した |
| 標準ルール | structured error がある場合は fallback を suppress し、同じ状態を2 surface で表示しない |

#### 苦戦箇所2: task03 移管と task04 current root を同じ wave で更新しないと canonical path がずれる

| 項目 | 内容 |
| --- | --- |
| 課題 | Task 03 を completed root に移しても、parent workflow / artifact inventory / legacy register のいずれかが旧 `tasks/03-*` を参照すると canonical path が分岐する |
| 解決策 | Task03 completed root、Task04 current root、parent workflow、artifact inventory、legacy register を同一 wave で更新した |
| 標準ルール | path relocation は root だけで閉じず、参照先一覧をまとめて同期する |

---

### 2026-03-20 TASK-FIX-CHATVIEW-ERROR-SILENT-FAILURE 再監査

#### 苦戦箇所1: ユーザー指定の current workflow root と parent workflow 想定 root がずれた

| 項目 | 内容 |
| --- | --- |
| 課題 | parent workflow は `ai-chat-llm-integration-fix/tasks/01-*` を前提にしていた一方、current canonical root は `docs/30-workflows/completed-tasks/01-TASK-FIX-CHATVIEW-ERROR-SILENT-FAILURE/` へ移行していた |
| 解決策 | completed root を canonical とし、workflow/spec 側の旧参照を drift として是正した |
| 標準ルール | current task root をユーザーが明示した場合、その root を Phase 11/12・system spec 同期の正本として扱う |

#### 苦戦箇所2: worktree でも screenshot 証跡は Playwright + Vite harness で再生成できる

| 項目 | 内容 |
| --- | --- |
| 課題 | CLI 環境を理由に screenshot 不可と判断すると、UI task の Phase 11 が未完了のまま残る |
| 解決策 | `arch -arm64 npx vite --config vite.e2e.config.ts` と Playwright init script で current worktree の representative screenshots を再取得した |
| 標準ルール | worktree / CLI 環境でも、UI task かつユーザーが画面検証を要求した場合は capture script を作成して screenshot を残す |

#### 苦戦箇所3: `validate-phase12-implementation-guide` の失敗を compliance 文書で握りつぶさない

| 項目 | 内容 |
| --- | --- |
| 課題 | implementation guide が 10/10 要件を満たしていないのに、compliance 文書だけ完了扱いにすると Phase 12 の整合性が壊れる |
| 解決策 | validator 実行結果を正として guide を補完し、compliance / changelog / system-spec-update-summary を同ターンで更新した |
| 標準ルール | Phase 12 は validator 実測値を正本とし、narrative 側で完了を先に宣言しない |

---

## TASK-IMP-CHAT-WORKSPACE-GUIDANCE-ACTION-WIRING-001（2026-03-22）

### 苦戦箇所1: standalone task root を移設したら parent / downstream / workflow spec の旧 path が残りやすい

| 項目 | 内容 |
| --- | --- |
| 課題 | Task04 root を standalone に切り出しても、親 workflow index と downstream consumer に旧 nested path が残ると current canonical set が二重化する |
| 再発条件 | workflow root の移設を root index だけで閉じ、parent/downstream/system spec を同一 wave で更新しない |
| 解決策 | `task-workflow-completed.md` / `task-workflow-backlog.md` / `workflow-ai-runtime-execution-responsibility-realignment.md` / capture script の current root を同時に揃えた |
| 標準ルール | standalone root の移設は parent/downstream/system spec の旧 path を同一 wave で閉じる |
| 関連タスク | TASK-IMP-CHAT-WORKSPACE-GUIDANCE-ACTION-WIRING-001 |

### 苦戦箇所2: design task でも Phase 12 の planned wording を残すと complete ではなくなる

| 項目 | 内容 |
| --- | --- |
| 課題 | 設計タスクの close-out で `計画済み` / `更新予定` を残すと、実更新後でも Phase 12 が未完了に見える |
| 再発条件 | workflow root は closed でも、compliance / changelog / backlog / lessons が future tense のまま残る |
| 解決策 | workflow root を `implementation_ready`、completed ledger を `spec_created` として分離し、Phase 13 だけ blocked に固定した |
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

### 苦戦箇所4: screenshot 要求がある spec_created task でも current root に capture script を残す必要がある

| 項目 | 内容 |
| --- | --- |
| 課題 | screenshot evidence を upstream task に流すと、current workflow root で再利用できない |
| 再発条件 | spec_created task で representative screenshot を別 workflow へ移す |
| 解決策 | current workflow root に dedicated capture script と evidence path を残し、task root から直接追跡できるようにした |
| 標準ルール | screenshot 要求がある spec_created task でも dedicated capture script を current workflow root に残す |
| 関連タスク | TASK-IMP-CHAT-WORKSPACE-GUIDANCE-ACTION-WIRING-001 |

---

### 2026-03-17 TASK-SKILL-LIFECYCLE-08 仕様書作成（設計タスク Phase 1-13）

#### 苦戦箇所1: docs-only タスクでの Phase 12 実更新の worktree コンフリクトリスク

| 項目 | 内容 |
| --- | --- |
| 課題 | worktree 環境で `.claude/skills/` を実更新すると、main ブランチの同ファイルと merge 時にコンフリクトが発生するリスクがある。このリスクを理由に Phase 12 実更新を先送りする判断が繰り返し発生した（P57 の再発） |
| 解決策 | worktree でも Phase 12 完了時点で `.claude/skills/` を実更新する。コンフリクトリスクより仕様書乖離リスクの方が高い |
| 標準ルール | Phase 12 の `.claude/skills/` 実更新は worktree 環境でも先送りしない（P57 準拠） |
| 関連パターン | P57（設計タスクにおける Phase 12 システム仕様書更新の先送りパターン） |
| 関連タスク | TASK-SKILL-LIFECYCLE-08 |

#### 苦戦箇所2: 55ファイルの成果物間の整合性維持（Phase 間参照チェイン）

| 項目 | 内容 |
| --- | --- |
| 課題 | Phase 1-12 で55ファイルを生成したが、後続 Phase が前 Phase の成果物パスを参照するチェインが長くなり、N-1 / N-2 Phase の参照が壊れやすかった |
| 解決策 | Phase 5 以降で型名・インターフェース名を変更した場合は `grep -rn "旧名" outputs/` で全成果物の参照を検索し、同ターンで更新する |
| 標準ルール | 型名・インターフェース名の変更は、成果物全体の grep 検索と参照更新を同時に行う |
| 関連タスク | TASK-SKILL-LIFECYCLE-08 |

#### 苦戦箇所3: 並列サブエージェント間の情報断絶（P59 再発リスク）

| 項目 | 内容 |
| --- | --- |
| 課題 | Phase 4/5/12 を並列サブエージェントで分担した際、各エージェントが独自に成果物を生成し、後続のメインエージェントが統合する段階で件数・ステータスの不整合が発生した |
| 解決策 | 並列サブエージェントは成果物ファイルを出力し、メインエージェントが統合時に `find outputs/ -name "*.md" | wc -l` で件数を検証する。documentation-changelog は最後にメインエージェントが一括作成する |
| 標準ルール | 並列エージェントの成果物統合後にメインエージェントが件数・ステータスの照合を行い、changelog は事後統合する（P59 準拠） |
| 関連パターン | P59（並列エージェント changelog 件数不整合） |
| 関連タスク | TASK-SKILL-LIFECYCLE-08 |

#### 苦戦箇所4: Phase 12 Task 6（遵守チェックリスト）の作成漏れパターン

| 項目 | 内容 |
| --- | --- |
| 課題 | Phase 12 の Task 1-5 に注力した結果、Task 6（Phase 12 遵守チェックリスト）の作成が漏れた |
| 解決策 | Phase 12 開始時に Task 6（遵守チェックリスト）を最初に空ファイルで作成し、各 Task 完了ごとにチェックを記入する |
| 標準ルール | Phase 12 遵守チェックリストは最初に空テンプレートで作成し、逐次記入する |
| 関連タスク | TASK-SKILL-LIFECYCLE-08 |

---

### 2026-03-17 TASK-SKILL-LIFECYCLE-08 再監査（Phase 11/12 実績同期）

#### 苦戦箇所1: 実更新済みなのに成果物文書が「計画」記述のまま残る

| 項目 | 内容 |
| --- | --- |
| 課題 | `system-spec-update-summary.md` と `documentation-changelog.md` が計画文言のままで、実更新済みの `.claude/skills/*` と整合しなかった |
| 解決策 | 文書を実績形式へ全面更新し、実際に更新したファイル群と validator 結果を記録した |
| 標準ルール | Phase 12 完了前に「実更新ファイル一覧 + 検証結果 + planned wording 0件」を同一ターンで確定する |

#### 苦戦箇所2: 設計タスクでも screenshot 要求に対する証跡不足

| 項目 | 内容 |
| --- | --- |
| 課題 | docs-only 前提で進めた結果、Phase 11 の TC-ID と screenshot 証跡が不足して validator が失敗した |
| 解決策 | dedicated capture script を作成し、TC-11-01〜03 の screenshot と metadata を再生成した |
| 標準ルール | 設計タスクでもユーザーが画面検証を要求した場合は screenshot 取得を必須にし、`validate-phase11-screenshot-coverage` を完了ゲートに置く |

#### 苦戦箇所3: 未タスク台帳のリンク切れが後段で一括失敗を誘発

| 項目 | 内容 |
| --- | --- |
| 課題 | `task-workflow.md` の `unassigned-task/` 参照切れ12件で `verify-unassigned-links` が失敗した |
| 解決策 | 欠落12件を即時復旧し、TASK-08由来の4件を新規 formalize して台帳を同時更新した |
| 標準ルール | 未タスクの新規/移設時は `verify-unassigned-links` を即時実行し、リンク切れ0件を確認してから Phase 12 を閉じる |

---

### 2026-03-17 TASK-IMP-MAIN-CHAT-SETTINGS-AI-RUNTIME-001 実装（GAP-01〜03 修正）

#### 苦戦箇所1: GAP-03 修正の影響範囲が極めて小さかった理由

| 項目 | 内容 |
| --- | --- |
| 課題 | `?? DEFAULT_CONFIG` を1行削除するだけで済んだ。修正規模が極めて小さい割に、Phase 1-3 の設計フェーズに多くの時間を投資した |
| 解決策 | Phase 1 で `grep -rn "getSelectedLLMConfig" apps/desktop/src/` を実行し、呼び出し元の null チェック状況を事前確認する |
| 標準ルール | 設計フェーズの呼び出し元調査精度が実装の効率に直結する |
| 関連タスク | TASK-IMP-MAIN-CHAT-SETTINGS-AI-RUNTIME-001 |

#### 苦戦箇所2: GAP-02 の既存テスト回帰（`"error"` → `"disconnected"`）

| 項目 | 内容 |
| --- | --- |
| 課題 | `status: "error"` → `"disconnected"` の変更で既存テスト `llm.test.ts` L231 が失敗。既存テストの期待値を事前に棚卸しなかった |
| 解決策 | 値変更前に `grep -rn 'status.*"error"\|"error".*status' apps/desktop/src/__tests__/` で既存テストの期待値を確認してから実装する |
| 標準ルール | 既存の enum 値を変更する場合は、変更前に既存テストの期待値を grep で全件確認し、回帰修正をセットで実施する |
| 関連タスク | TASK-IMP-MAIN-CHAT-SETTINGS-AI-RUNTIME-001 |

#### 苦戦箇所3: P42 バリデーション追加の配置順序

| 項目 | 内容 |
| --- | --- |
| 課題 | P42 準拠の trim チェックを、既存の `if (!request.providerId \|\| !request.modelId)` チェックの**前**に配置すると、undefined/null に対して `.trim()` を呼んで TypeError が発生する |
| 解決策 | バリデーション順序: (1) falsy チェック → (2) 型チェック → (3) 空文字 → (4) trim の順を守る |
| 標準ルール | P42 バリデーション追加時は既存の falsy チェック（`!value`）を先に通過させ、その後に `.trim() === ""` を追加する |
| 関連パターン | P42（文字列引数の .trim() バリデーション漏れ） |
| 関連タスク | TASK-IMP-MAIN-CHAT-SETTINGS-AI-RUNTIME-001 |

---

### 2026-03-17 TASK-IMP-MAIN-CHAT-SETTINGS-AI-RUNTIME-001 再監査（契約衝突検知）

#### 苦戦箇所: 「廃止完了」と「legacy残置」の二重記述

| 項目 | 内容 |
| --- | --- |
| 課題 | Task06 の成果物で `AI_CHECK_CONNECTION` を「廃止完了」と記述していた一方、実装（`aiHandlers.ts` / `preload/index.ts` / `channels.ts`）は legacy 互換で残存していた |
| 解決策 | 仕様を実装実体へ同期し、`AI_CHECK_CONNECTION` は legacy 方針へ修正。primary 経路を `llm:check-health` に固定した |
| 標準ルール | 存廃を含む IPC は「コード実体 > 設計意図」の順で判定し、Phase 12 で `rg` 実測値を必ず残す |

---

### 2026-03-17 TASK-SKILL-LIFECYCLE-08 / UT-06-005（SafetyGate・Permission・Fallback 実装）

> 詳細版: [lessons-learned-safety-gate-permission-fallback.md](lessons-learned-safety-gate-permission-fallback.md)

#### 苦戦箇所1: PermissionStore の DI スコープ問題（P62）

| 項目 | 内容 |
| --- | --- |
| 課題 | PermissionStore が `track()` クロージャ内部でインスタンス化されていたため、SafetyGate がそのインスタンスにアクセスできなかった |
| 解決策 | PermissionStore を `track()` クロージャの外（上位スコープ）に抽出し、複数クロージャから共有参照可能にした |
| 標準ルール | `track()` クロージャを使う場合、複数クロージャ間で共有が必要なインスタンスはスコープ外に抽出する |
| 関連パターン | P34（遅延初期化 DI パターン選択）、P54（safeRegister パターン不適合） |
| 関連タスク | TASK-SKILL-LIFECYCLE-08 |

#### 苦戦箇所2: SafetyGate metadataProvider の抽象化境界（P63）

| 項目 | 内容 |
| --- | --- |
| 課題 | DefaultSafetyGate の `metadataProvider` に暫定スタブ実装（`async () => []`）を入れたが、実スキル実行時にスキルマニフェストからの動的取得が必要 |
| 解決策 | 現時点ではスタブ実装を維持し、スタブ判断の根拠を Phase 2 設計ドキュメントに明記し、未タスク化した |
| 標準ルール | インターフェースの設計時に「このメソッドのデータソースはどのモジュールか」を明記。スタブが残る場合は設計ドキュメントに判断根拠を記録して未タスク化する |
| 関連タスク | TASK-SKILL-LIFECYCLE-08 |

#### 苦戦箇所3: フォールバック制御の境界条件テスト設計

| 項目 | 内容 |
| --- | --- |
| 課題 | abort/skip/retry/timeout の4パターン × 正常/異常の組み合わせが多く、テストケースの網羅性確保が困難だった |
| 解決策 | 各フォールバック戦略の代表的なケース（成功/失敗/タイムアウト）に限定。revokeSessionEntries は独立したテストグループとして分離した |
| 標準ルール | フォールバック戦略のテストは「各戦略の最重要パス（成功/失敗）」+「共通インフラの独立テスト」の2層構造で設計する |
| 関連タスク | UT-06-005 |

---

### 2026-03-17 UT-06-003 SafetyGate 実装

#### 苦戦箇所1: IPC テスト応答形式の不一致（最も苦戦）

| 項目 | 内容 |
| --- | --- |
| 課題 | テスト I-3〜I-7 が `{ code: "VALIDATION_ERROR" }` のフラットな形式を期待していたが、実装は `{ success: false, error: { code: "VALIDATION_ERROR" } }` のラッパー形式を返していた |
| 解決策 | テストの全アサーションを `result.error.code` 形式に修正。Phase 4 で IPC レスポンスの wrapper 形式を事前に明示的に定義する |
| 標準ルール | IPC ハンドラのテスト設計時にレスポンス構造（success/error wrapper）を Phase 2 設計書に明記する |
| 関連パターン | P60（新規） |
| 関連タスク | UT-06-003 |

#### 苦戦箇所2: DIP 違反の遅発検出

| 項目 | 内容 |
| --- | --- |
| 課題 | `registerSafetyGateHandlers` が `DefaultSafetyGate`（具象クラス）を引数に取っていた。Phase 10 の最終レビューまで検出されなかった |
| 解決策 | 引数型を `SafetyGatePort`（インターフェース）に変更 |
| 標準ルール | Phase 2 設計書に「IPC ハンドラの依存先が Port/Interface であること」を設計チェック項目として含める |
| 関連パターン | P61（新規）、DIP（依存性逆転原則） |
| 関連タスク | UT-06-003 |

#### 苦戦箇所3〜5: P49違反残存・ternary分岐カバレッジ・未タスク配置ミス

| 苦戦箇所 | 解決策 | 関連パターン |
| --- | --- | --- |
| catch ブロック内の `as` キャスト（P49） | `in` 演算子 + `typeof` による段階的な実行時検証に置換 | P49 |
| ternary 演算子の分岐カバレッジ特定困難 | JSON カバレッジ出力 + Node.js スクリプトで正確な未カバー分岐を特定 | P41 |
| 未タスク指示書を workflow ローカルパスに配置 | root canonical path（`docs/30-workflows/unassigned-task/`）へ再配置 | P38、P58 |

---

### 2026-03-16 TASK-FIX-ELECTRON-APP-MENU-ZOOM-001

#### 苦戦箇所1: Main Process エントリポイントのトップレベル副作用でテスト不可能

| 項目 | 内容 |
| --- | --- |
| 課題 | Main Process の index.ts に直接メニューロジックを追加しようとしたが、テストファイルで import するだけでトップレベル副作用が実行され、テストが動作しない |
| 解決策 | ロジックを独立したモジュール（menu.ts）に分離してテスト容易性を確保（SRP準拠） |
| 標準ルール | Electron Main Process にメニュー/機能を追加する際は、まず独立モジュールに分離してからエントリポイントで呼び出す |
| 関連タスク | TASK-FIX-ELECTRON-APP-MENU-ZOOM-001 |

#### 苦戦箇所2: Electron role ベースメニューの検証手法

| 項目 | 内容 |
| --- | --- |
| 課題 | Electron の role ベースメニュー項目は OS ネイティブ処理に委譲されるため、動作の直接テストが困難 |
| 解決策 | `Menu.buildFromTemplate` のモック呼出し引数を検査してメニュー構造を検証する |
| 標準ルール | role ベースのメニュー項目は Electron に処理を委譲し、テストはメニュー構造の検証に留める |
| 関連タスク | TASK-FIX-ELECTRON-APP-MENU-ZOOM-001 |

---

### 2026-03-16 TASK-SKILL-LIFECYCLE-06

#### 苦戦箇所1: 設計タスクでのシステム仕様書更新先送り（P57）

| 項目 | 内容 |
| --- | --- |
| 課題 | 設計タスク（型定義・契約定義のみ）では「`.claude/skills/` の実更新は PR 作成時に実施」と先送りし、`system-spec-update-summary.md` に計画文だけを記録した。Phase 12 完了条件を満たさなかった |
| 解決策 | 設計タスクでも Phase 12 完了時点で `.claude/skills/` を実更新する |
| 標準ルール | Phase 12 は実績ログのみを残し、計画文は残さない |
| 関連パターン | P57（新規）、P26（システム仕様書更新遅延） |
| 関連タスク | TASK-SKILL-LIFECYCLE-06 |

#### 苦戦箇所2: 設計タスクを理由とした未タスク指示書の配置省略（P58）

| 項目 | 内容 |
| --- | --- |
| 課題 | 「設計タスクだから」という例外判断で `docs/30-workflows/unassigned-task/` への独立指示書ファイルの作成を省略した |
| 解決策 | 設計タスクの未タスクであっても独立した指示書ファイルを `docs/30-workflows/unassigned-task/` に作成する |
| 標準ルール | P3（①指示書作成 → ②task-workflow 登録 → ③関連仕様書リンク追加）に例外はない |
| 関連パターン | P58（新規）、P3、P38 |
| 関連タスク | TASK-SKILL-LIFECYCLE-06 |

#### 苦戦箇所3: 並列エージェント分担による documentation-changelog 件数不整合（P59）

| 項目 | 内容 |
| --- | --- |
| 課題 | documentation-changelog.md に「Task 4 検出件数: 0件」と記載されたが、実際の `unassigned-task-detection.md` では8件検出されていた |
| 解決策 | documentation-changelog.md は全 Task 完了後にメインエージェントが一括作成し、件数を照合してから記録する |
| 標準ルール | changelog は「事後統合」する。並列エージェントの中間報告をそのまま changelog に転記しない |
| 関連パターン | P59（新規）、P4、P43、P51 |
| 関連タスク | TASK-SKILL-LIFECYCLE-06 |

---

### 2026-03-16 UT-06-005 Permission Fallback（abort/skip/retry/timeout）

#### 苦戦箇所 S-PF-1: 既実装コードの4ステップ abort フロー発見遅延

| 項目 | 内容 |
| --- | --- |
| 課題 | Phase 4 でテストを書き始めた段階で、abort 4ステップ（cancelAll→revokeSessionEntries→log→IPC通知）が既に SkillExecutor.ts に実装済みだった |
| 解決策 | Phase 1 で `git log --oneline -- <target-file>` と `grep -n "abort\|fallback\|retry" <target-file>` を実行し、既存実装の有無を確認してから要件を策定する |
| 関連パターン | P50（既実装防御の発見による Phase 転換）|
| 関連タスク | UT-06-005 |

#### 苦戦箇所 S-PF-2〜S-PF-3: スタブ実装判断・デッドコード化

| 苦戦箇所 | 解決策 |
| --- | --- |
| revokeSessionEntries スタブ実装（全エントリクリア）の設計判断 | スタブ実装を選択し、本格実装を UT-06-005-B として未タスク化。Phase 2 に判断根拠を明記 |
| `PERMISSION_MAX_RETRIES=3` デッドコード化 + `abortedExecutions` メモリリーク | (1) retryCounters の条件を `PERMISSION_MAX_RETRIES` 参照に変更 (2) セッション単位のクリア機構を追加 |

---

### 2026-03-16 TASK-SKILL-LIFECYCLE-07

#### 苦戦箇所1〜4 サマリー

| 苦戦箇所 | 解決策 | 標準ルール |
| --- | --- | --- |
| Phase 12 サブエージェントが「設計タスク範囲外」として実ファイル更新を保留 | 設計タスクでも Step 1-A/1-C/Step 2 は実ファイルへの書き込みが必須 | Phase 12 はタスク種別に関わらず実ファイル変更を必ず伴う |
| Phase 3 MINOR 4件の追跡フローが Phase 横断で見失われる | Phase 5 完了時点で「Phase 3 MINOR 追跡マトリクス」を作成 | MINOR が3件以上の場合は Phase 5 完了時に追跡マトリクスを作成 |
| バックグラウンドエージェントの TaskOutput timeout | timeout 後は `find` / `ls` で成果物ファイルの存在を直接確認する | timeout 後は成果物ファイルの存在確認を優先する |
| コンテキストウィンドウ圧縮で前セッションのエージェント結果が消失 | 並列エージェントの結果は必ず成果物ファイルとして出力する | 成果物ファイル出力を優先し、結果参照はファイルベースで行う |

---

### 2026-03-16 TASK-IMP-SKILL-DOCS-AI-RUNTIME-001

#### 教訓1: Constructor Injection による queryFn 差替パターン

| 項目 | 内容 |
| --- | --- |
| 状況 | SkillDocGenerator の stubQueryFn を LLMDocQueryAdapter.query() に差し替える必要があった |
| 解決策 | `adapter.query.bind(adapter)` で既存の `LLMQueryFn` シグネチャに合わせることで、SkillDocGenerator 自体に変更を加えずに adapter を注入できた（Open-Closed Principle） |
| 関連タスク | TASK-IMP-SKILL-DOCS-AI-RUNTIME-001 |

#### 教訓2〜3 サマリー

| 教訓 | 解決策 |
| --- | --- |
| CapabilityResolver の terminal-handoff パス（事後判定） | terminal-handoff は LLM呼出し失敗後の fallback として設計し、事前判定と混在させない |
| Phase 4-5 統合実行の効率性 | TDD の Red-Green サイクルを1エージェントで統合実行するほうが効率的 |

---

## UT-TASK06-007 IPC契約ドリフト自動検出スクリプト（2026-03-18）

### 苦戦箇所1: マルチラインipcMain.handle対応

**問題**: `ipcMain.handle(\n    IPC_CHANNELS.XXX,` のように改行が入るパターンが全体の約67%を占め、1行正規表現では22/324件しか抽出できなかった。
**解決策**: 現在行が `ipcMain.handle(` で終わる場合、次の5行を結合してから正規表現マッチを試行するロジックを追加。結果、216件抽出に改善。
**教訓**: IPCハンドラのgrepベース抽出では、コードフォーマッターによる改行挿入を考慮したマルチライン対応が必須。

### 苦戦箇所2: タプル配列経由ハンドラ登録パターン

**問題**: `registerFallbackHandlers` が `[IPC_CHANNELS.XXX, handler]` 形式のタプル配列をループで `ipcMain.handle(channel, handler)` に登録するパターンが約108件存在。動的なチャンネル名のため静的解析では抽出困難。
**解決策**: 現バージョンでは未対応（未タスク UT-TASK06-007-EXT-001 として登録）。タプル配列の定義箇所を別途スキャンし、定数名→チャンネル名のマッピングを取得する方式を検討。
**教訓**: Electron IPCの登録パターンは多様（直接呼び出し、関数参照渡し、タプル配列経由）であり、単一の正規表現では全パターンをカバーできない。

### 苦戦箇所3: worktree環境のesbuildプラットフォーム不一致

**問題**: worktreeのnode_modulesがdarwin-arm64向けにインストールされているが、実行環境がdarwin-x64であり、vitestがesbuildの起動に失敗。P7（ネイティブモジュールのバイナリ不一致）の再発。
**解決策**: tsx経由で全テストケースを手動実行する代替手法で検証を完了。
**教訓**: worktree環境でのテスト実行は `pnpm install --force` またはtsx経由の代替手法を事前に用意すべき。Phase 4テンプレートに代替テスト手法のガイダンスを追加すべき（未タスク候補）。

### 苦戦箇所4: process.argv[1]ベースのパス解決

**問題**: tsxで実行した場合、`require.main === module` が期待通り動作せず、`__dirname` が `.` を返す。main()が呼ばれない、またはパスが不正。
**解決策**: エントリポイント判定を `process.argv[1].includes("check-ipc-contracts")` に変更。パス解決を `process.argv[1]` から `path.dirname(path.resolve(scriptFile))` で算出する方式に変更。
**教訓**: tsx/ts-node環境では `require.main === module` やCommonJSの `__dirname` が期待通り動作しない場合がある。`process.argv[1]` ベースのパス解決がworktree環境で最も信頼性が高い。

### 苦戦箇所5: P57再発（Phase 12仕様書更新先送り）

**問題**: 初回Phase 12で「worktree環境のためPR時に実施」として、LOGS.md x2、SKILL.md x2、quality-requirements.md、ipc-contract-checklist.md、phase-templates.md、task-workflow-backlog.md、未タスク指示書3件の実更新を先送りした。再監査で全10件の漏れが検出された。
**解決策**: 即座に全ファイルを実更新して漏れを解消。
**教訓**: P57の教訓「worktree環境でのコンフリクトリスクより、仕様書と実装の乖離リスクの方が高い」を再確認。Phase 12では「計画台帳」ではなく「実更新の完了」が完了条件。

---

## TASK-IMP-RUNTIME-POLICY-CAPABILITY-BRIDGE-001（2026-03-21）

### 苦戦箇所

#### L-CB-01: packages/shared の exports 未登録による import 解決失敗

- **症状**: `@repo/shared/types/execution-capability` が vite の import analysis で解決できず、テストが起動しない
- **原因**: `execution-capability.ts` は `packages/shared/src/types/` に存在するが、`package.json` の `exports` と `typesVersions`、および `tsup.config.ts` の `entry` に未登録だった
- **解決策**: 3箇所同時追加が必要: (1) package.json exports (2) package.json typesVersions (3) tsup.config.ts entry。追加後に `pnpm --filter @repo/shared build` でリビルド
- **教訓**: モノレポで新規サブパスを追加する際は、この3箇所同時更新チェックリストを使う

#### L-CB-02: タスク仕様書のファイルパス精度（skillCreatorHandlers.ts vs creatorHandlers.ts）

- **症状**: 仕様書が `skillCreatorHandlers.ts` を direct caller と記載していたが、実際の IPC boundary は `creatorHandlers.ts` だった
- **原因**: 仕様書作成時に `grep -rn "RuntimeSkillCreatorFacade"` で全使用箇所を確認せず、類似名のファイルを誤認
- **解決策**: Phase 1（P50チェック）で `grep -rn` により実際の呼び出し元を特定し、仕様書のパスを補正
- **教訓**: 仕様書に記載するファイルパスは、タスク開始前に `grep` で実際の import/usage を確認してから確定する

#### L-CB-03: execute() の terminalSurface 未消費パターン

- **症状**: 初期実装で `execute()` の `decision` を `void decision` で棄却していた。terminalSurface のとき SkillExecutor に無条件委譲してしまう
- **原因**: Phase 2 設計書で execute() の4状態ハンドリングを十分に設計しなかった
- **解決策**: linter/ユーザーのフィードバックで `RuntimeTerminalHandoffResult` 型を導入し、execute() でも terminalSurface → handoff bundle を返す分岐を追加
- **教訓**: 3-role facade（plan/execute/improve）で4状態ハンドリングを設計する際は、全 role × 全 capability の matrix を Phase 2 で明示的に埋める

---

### TASK-IMP-TRANSCRIPT-TO-CHAT-PROVENANCE-LINKAGE-001 設計タスク教訓（2026-03-22）

#### L-TCPL-001: worktree マージ後の conflict marker 残骸が複数ファイルに波及

- **症状**: `||||||| 77abcbc7f` の conflict marker 残骸が LOGS.md x2、SKILL.md x2、task-workflow-completed.md、lessons-learned-current.md の計6ファイルに残存していた。`<<<<<<<`/`=======`/`>>>>>>>` は解消済みだが base marker だけが取り残されていた
- **原因**: worktree でのマージ時に `diff3` スタイルのマージ出力で base marker が残り、目視レビューで見落とした。重複行（base 版のコンテンツ）も同時に残存し、ファイルが膨張していた
- **解決策**: worktree マージ後は `grep -rn '||||||| ' .claude/skills/` で全ファイルを走査し、base marker と重複行を同時に除去する
- **教訓**: `<<<<<<<` / `>>>>>>>` の解消だけでは不十分。`diff3` marker は3種ではなく4種（`|||||||` 含む）をチェックする

#### L-TCPL-002: standalone root 移設後の stale path 14件 + P3 3ステップ漏れ

- **症状**: `tasks/` サブディレクトリから standalone root に移設した後、全13 Phase spec ファイルの「Task index」参照行が旧パスのまま残存（14件）。加えて P3 3ステップ（backlog 登録 / 関連仕様書リンク）が未完了だった
- **原因**: ディレクトリ移設時に index.md と artifacts.json のパスは更新したが、各 Phase spec 内の参照資料テーブルは手動更新対象であることを認識していなかった
- **解決策**: standalone root 移設時は `grep -rn '<old-path>' <new-dir>/` で全ファイルの旧パス参照を走査し、0件化してから完了とする。P3 3ステップはチェックボックスの `[ ]` → `[x]` 更新を含めて実行する
- **教訓**: ディレクトリ移設は「コピー + パス更新」の2段階ではなく「コピー + 全 grep 走査 + P3 3ステップ」の3段階で完了とする

---

### TASK-IMP-TERMINAL-HANDOFF-SURFACE-REALIZATION-001 設計タスク教訓（2026-03-22）

#### L-THSR-001: 設計タスクの Phase 12 仕様書更新先送りパターン（P57 再発）

- **症状**: system-spec-update-summary.md に「更新内容」を詳細に記載したが、実際の `.claude/skills/` ファイルへの追記が 0 行だった
- **原因**: 「計画書を書くこと」と「実ファイルへの反映」を混同。system-spec-update-summary を書いた時点で完了と認識してしまった
- **解決策**: documentation-changelog に `git diff --stat -- .claude/skills/` の実行結果を事後記録として貼り付けるルールを追加
- **教訓**: 設計タスクでも Phase 12 完了時点で `.claude/skills/` を実更新する。「計画文」ではなく「実績ログ」のみを残す

#### L-THSR-002: Concern 3分割 × 5 Consumer の設計整理手法

- **症状**: Launcher / Handoff Card / Consumer Adapter の 3 concern に対して 5 consumer（Chat Edit / Runtime / Skill Docs / Agent Execution / Manual Launcher）の組合せが発生し、設計の見通しが悪くなった
- **解決策**: Consumer → DTO マッピングテーブルを Phase 2 で一枚表として定義し、surfaceType 列挙で concern 横断の統一キーを設けた。テーブル化により各 consumer の入力型・変換関数・出力型が一覧で比較でき、冗長パスの早期発見に有効だった
- **教訓**: 複数 concern × 複数 consumer の設計では、Phase 2 で全組合せのマッピングテーブルを作成し、テーブルの空セルから設計漏れを検出する

#### L-THSR-003: 未タスク件数の system-spec-update-summary ↔ unassigned-task-detection 不整合（P59 再発）

- **症状**: system-spec-update-summary.md に「5 件」と記載されたが、unassigned-task-detection.md の実際の検出件数は「8 件」だった
- **原因**: Phase 12 を並列エージェントで分担した結果、summary 作成エージェントと未タスク検出エージェントの間で情報が断絶した
- **解決策**: documentation-changelog は全 Task 完了後にメインエージェントが一括作成する。件数は unassigned-task-detection.md の確定値を参照し、他ファイルの「予測値」を使わない
- **教訓**: Phase 12 の件数系データは最後に1箇所で確定し、全ファイルにコピーする（逆方向の参照は禁止）

### TASK-IMP-CANONICAL-BRIDGE-LEDGER-GOVERNANCE-001（2026-03-23）

#### L-CBLG-001: Phase 10 MINOR 指摘と unassigned-task-detection の照合漏れ

- **症状**: Phase 10 final-gate-decision.md に MINOR M-01（rsync worktree 注意書き不足）が記録されていたが、Phase 12 Task 4 の unassigned-task-detection.md では「0件」と記載された
- **原因**: unassigned-task-detection 作成時に Phase 10 の MINOR 一覧を確認せず、「設計タスクは Phase 4-11 をスキップ」という誤った判断で Phase 10 MINOR を無視した
- **解決策**: Phase 12 Task 4 開始時に `phase-10/final-gate-decision.md` の MINOR 一覧を必ず読み込み、各 MINOR の対応状況（未タスク化 or Phase 12 内解決）を照合する
- **教訓**: 設計タスクであっても Phase 10 は実施されるため、Phase 10 MINOR の照合は省略不可

#### L-CBLG-002: 設計タスク + worktree 環境での Step A-E 先送り（P57 違反）

- **症状**: documentation-changelog.md で Step A-E が全て「計画済（PR マージ後に実施）」と記載された。P57（設計タスクでも Phase 12 完了時点で実更新する）に違反
- **原因**: worktree 環境でのコンフリクトリスクを過大評価し、P57 ルールよりも先送りを優先した
- **解決策**: worktree 環境であっても `.claude/skills/` の実更新は Phase 12 内で実施する。コンフリクトが発生した場合はその場で解決する方が、仕様書と実装の乖離リスクより低い
- **教訓**: 「worktree だから」は Step A-E 先送りの正当な理由にならない。P57 は worktree 環境にも適用される

## TASK-IMP-CANONICAL-BRIDGE-LEDGER-GOVERNANCE-001 契約テスト教訓（2026-03-24）

### L-CBLG-003: Phase 4 テストマトリクスのファイル参照誤り

- **苦戦箇所**: Phase 4 の test-matrix.md で、テストケース C-3/U-2-5/I-6 が `contract-matrix.md` を参照先として指定していたが、実際の `rsync` コマンドや bridge rule の記載は `design-summary.md` にあった。テスト実装時に初めてファイル参照誤りが発覚し、3テストのアサーション修正が必要になった
- **解決策**: テストマトリクス作成時に参照先ファイルの内容を `grep` で実際に確認してからテストケースに記載する。契約テストでは `readOutput()` ヘルパーで Phase 別ファイルを読み込む設計にし、参照先変更が1箇所で済むようにする
- **再利用**: 設計タスクの Phase 4 でテストマトリクスを書く際は、参照ファイルパスをハードコードする前に `grep -l "検索語" outputs/phase-2/` で所在を確認する

### L-CBLG-004: TypeScript TS1501 regex /s flag は ES2018+ 必須

- **苦戦箇所**: Rollback テストで `/Step A.*中断|中断.*Step A/s` のように dotAll flag (`/s`) を使用したところ、TypeScript が TS1501 エラー（This regular expression flag is only available when targeting 'es2018' or later）を出力した。プロジェクトの tsconfig target が ES2018 未満のため使用不可
- **解決策**: `/s` flag の代わりに `[\s\S]` で改行を含む任意文字にマッチさせる。`/Step A[\s\S]*中断|中断[\s\S]*Step A/` で同等の動作を実現
- **再利用**: TypeScript テストで複数行マッチが必要な場合は `[\s\S]*` パターンを標準とする

> 5分解決カード: テストマトリクスの参照先ファイル誤り → `grep -l "keyword" outputs/phase-*/` → アサーション対象変数を修正 → テスト再実行

## UT-SC-05-APPLY-IMPROVEMENT-UI: 改善提案 承認/適用 UI

### L-AIUI-001: React Props Silent Drop は TypeScript で検出不能

- **苦戦箇所**: `ImprovementProposalPanel` の `onClose` prop が destructuring から除外されていたが、TypeScript コンパイル・62テスト全 PASS・ESLint 0件の状態で Phase 10 最終レビューまで検出できなかった。パネル閉じるボタンが未実装のまま放置されていた
- **解決策**: Phase 10 レビューで発見後、destructuring に `onClose` を追加し、パネル閉じるボタン（`aria-label="パネルを閉じる"`）を追加。P-6〜P-8 テスト3件を追加して検証
- **再利用**: コンポーネント実装後に Props interface の全フィールドと destructuring の突合チェックを行う。新規 Pitfall P67 として登録済み

### L-AIUI-002: `import()` 型伝播で Preload 型二重管理を解消

- **苦戦箇所**: `preload/types.ts` に `SkillCreatorAPI` の全メソッドを列挙する方式だと、P23/P32 の二重管理リスクがある
- **解決策**: `import("./skill-creator-api").SkillCreatorAPI` の `import()` 型を使用し、実装ファイルから型を自動伝播させる構造を採用。新メソッド `applyRuntimeImprovement` の追加時に `types.ts` の変更が不要だった
- **再利用**: Preload API の型定義は `import()` 型伝播パターン（S36）を標準とする

### L-AIUI-003: Mock 型安全性ギャップ — `vi.fn().mockResolvedValue()` は `any` を受容

- **苦戦箇所**: H-18 テストで `ApplyImprovementResult.errors` の mock データを `{ section, message }[]` で定義したが、実際の型は `string[]`。`vi.fn().mockResolvedValue()` が `any` を受け入れるため、TypeScript は型不整合を検出しなかった
- **解決策**: Phase 10 レビューで mock データの型を `string[]` に修正。`mockResolvedValue` に明示的な型引数（`mockResolvedValue<ApplyImprovementResult>({...})`）を使用する方針を策定
- **再利用**: テスト mock の戻り値には `satisfies` または明示的型引数で型チェックを強制する

> 5分解決カード: Props silent drop → Props interface と destructuring のフィールド数を比較 → 不足フィールドを追加 → テスト追加

---

## TASK-IMP-ADVANCED-CONSOLE-SAFETY-GOVERNANCE-001 からの教訓（2026-03-24）

### 1. 設計タスクでもプロダクションコードが含まれる場合がある

| 項目 | 内容 |
| --- | --- |
| 課題 | タスク種別を「設計タスク」として開始したが、ApprovalGate / Consumer Auth Guard / 3ハンドラファイル等の実装が含まれていた |
| 解決策 | タスク分析の早期（Phase 1-2）に「設計のみか実装を伴うか」を明示的に判断し、種別を「設計・実装タスク」に更新する |
| 標準ルール | Phase 2 設計レビュー時点で新規ファイル作成が発生するなら「実装タスク」として種別を修正する |
| 関連タスク | TASK-IMP-ADVANCED-CONSOLE-SAFETY-GOVERNANCE-001 |

### 2. IPC channel 数の整合

| 項目 | 内容 |
| --- | --- |
| 課題 | 仕様書間で IPC channel 数を記載する際、Phase が進むにつれてチャンネル数が変動し、ドキュメント間で不整合が生じた |
| 解決策 | 仕様書の IPC channel 数は実装後に grep で実測し、全ドキュメントで同一の正確な数値を使用する |
| 標準ルール | IPC channel 数を記載する場合は `grep -rn "ipcMain.handle" src/main/ipc/` で実測値を確認してから記載する |
| 関連タスク | TASK-IMP-ADVANCED-CONSOLE-SAFETY-GOVERNANCE-001 |

### 3. 3層レイヤーアーキテクチャは安全ガバナンスに有効

| 項目 | 内容 |
| --- | --- |
| 課題 | 実行コンソールの安全ガバナンスを単一コンポーネントで実装しようとすると、UX と安全性のトレードオフが生じる |
| 解決策 | Primary Surface（概要表示） → Safety Surface（承認要求） → Detail Surface（ログ詳細）の3層に分離することで段階的開示を実現し、UX と安全性を両立した |
| 標準ルール | 承認フロー + 情報開示が要件に含まれる画面は、3層分離を設計の起点とする |
| 関連タスク | TASK-IMP-ADVANCED-CONSOLE-SAFETY-GOVERNANCE-001 |

### 4. ApprovalGate の DI パターン

| 項目 | 内容 |
| --- | --- |
| 課題 | 既存の terminalHandlers.ts に承認ゲートを追加する際、既存のコードへの影響を最小化しながらテスタビリティを確保する必要があった |
| 解決策 | `IApprovalGate` インターフェースによる DI でテスタビリティを確保しつつ、optional パラメータで既存コードへの影響を最小化した。未注入時は degraded モードとして動作 |
| 標準ルール | 既存ハンドラへの機能追加は optional パラメータ + interface DI で拡張する（P61 パターン適用） |
| 関連パターン | P61（DIP 違反の遅発検出）、ApprovalGate Enforcement パターン |
| 関連タスク | TASK-IMP-ADVANCED-CONSOLE-SAFETY-GOVERNANCE-001 |

---

## TASK-SC-08-E2E-VALIDATION 教訓（2026-03-25）

### L-SC-E2E-001: IPC handlerMap モックパターン

- **症状**: Electron の `ipcMain.handle` を直接モックすると、ハンドラ登録のタイミング依存でテストが不安定になる
- **原因**: `vi.mock('electron')` だけではハンドラの呼び出しチェーンをテストできない
- **解決策**: `handlerMap: Record<string, Function>` をキャプチャし、`ipcMain.handle` のモック内で格納。テスト時は `handlerMap[channelName](event, args)` で直接呼び出す
- **関連Pitfall**: P60（IPC テスト応答形式不一致）

### L-SC-E2E-002: TerminalHandoff セキュリティ検証

- **症状**: `suggestedCommand` の形式検証が不十分だと、シェルインジェクションの脆弱性が残る
- **原因**: CLI コマンド文字列の妥当性を正規表現のみで検証していた
- **解決策**: (1) `/^[a-zA-Z]/` でアルファベット開始を検証 (2) `;`, `|`, `$()`, `` ` `` のシェルメタ文字を禁止 (3) NFR-1 準拠で API Key 等の機密情報が含まれないことをアサート
- **関連Pitfall**: NFR-1（機密情報漏洩防止）

### L-SC-E2E-003: Phase仕様書パス移動時の参照ドリフト

- **症状**: Phase仕様書ディレクトリを移動した後、「次のPhase」リンクが旧パスのまま残り、ナビゲーションが壊れる
- **原因**: ディレクトリ名変更時に、Phase仕様書内の相対パス参照が自動更新されない
- **解決策**: 移動後に `grep -r "旧パス" 新ディレクトリ/` で残存参照を検出し、一括置換する
- **新規Pitfall候補**: P-NEW: Phase仕様書ディレクトリ移動時の「次のPhase」リンク残存

---

## TASK-SDK-08 session-persistence-and-resume-contract (2026-03-28)

### L-1: esbuild host/binary version mismatch でVitest起動停止

| 項目 | 内容 |
| --- | --- |
| 症状 | `pnpm vitest run` が esbuild version mismatch エラーで即座に停止 |
| 原因 | worktreeのnode_modulesとesbuildバイナリのバージョン不一致 |
| 解決 | worktreeルートで `pnpm install` を再実行 |
| 再発防止 | worktree作成後は必ず `pnpm install` を確認してから `vitest` を実行 |

### L-2: artifact命名規約とvalidator期待値の不一致

| 項目 | 内容 |
| --- | --- |
| 症状 | structure validator PASSでもphase-output validationで失敗 |
| 原因 | task spec本文のartifact名と実際のファイル名が微妙にずれている |
| 解決 | task root生成時にartifact命名のcanonical一覧を先に確定させる |
| 再発防止 | Phase-12着手前に artifacts.json と phase spec のartifact名を照合すること |

### L-3: Phase 11 UI task / docs-only task 判定の不一致

| 項目 | 内容 |
| --- | --- |
| 症状 | Phase 11 でスクリーンショット要求とdocs-only判定が食い違う |
| 原因 | spec本文とartifact名でtask分類が異なっていた |
| 解決 | Phase 1 要件定義時に UI task か docs-only task かを明示し、全フェーズで統一 |
| 再発防止 | Phase 12 compliance check で artifact命名とPhase 11判定の一致を確認項目に追加 |

---

## UT-SDK-07 shared IPC channel 契約整合（2026-03-29）

### L-UT-SDK07-001: shared チャネル移管後の仕様書参照パス更新

| 項目 | 内容 |
| --- | --- |
| 課題 | APPROVAL_CHANNELS / EXECUTION_CHANNELS が `apps/desktop/src/preload/channels.ts` から `packages/shared/src/ipc/channels.ts` に移管されたが、仕様書（ipc-preload-spec-sync-guardian の SKILL.md 等）が旧パスを正本として記載したままになりやすい |
| 解決策 | チャネル定数を shared に移管した場合は、当該チャネルを参照するすべての仕様書・スキルの「リソース参照」テーブルと「Phase 3 アクション」を同ターンで shared パスに更新する |
| 標準ルール | `APPROVAL_CHANNELS` / `EXECUTION_CHANNELS` 等の正本が `packages/shared/src/ipc/channels.ts` であることを仕様書に記載する。`preload/channels.ts` は shared からの import 先として副次的な参照に留める |
| 関連タスク | UT-SDK-07 |

### L-UT-SDK07-002: packages/shared/src/ipc/ サブパス追加時は 3 箇所同時更新が必須

| 項目 | 内容 |
| --- | --- |
| 課題 | `packages/shared/src/ipc/channels.ts` を新設した際、`package.json exports` / `package.json typesVersions` / `tsup.config.ts entry` の 3 箇所に登録しないと desktop/renderer 側で import 解決が失敗する（L-CB-01 のパターンの再現） |
| 解決策 | shared に新しいサブパスを追加するたびに 3 箇所同時更新チェックリストを適用し、追加後に `pnpm --filter @repo/shared build` でリビルドして typecheck を確認する |
| 標準ルール | shared 型・定数追加の 3 箇所同時更新チェックリスト（L-CB-01）を IPC channel 定数追加にも適用する |
| 関連タスク | UT-SDK-07 |

### L-UT-SDK07-003: preload が shared を import する構造への仕様書更新パターン

| 項目 | 内容 |
| --- | --- |
| 課題 | `preload/channels.ts` が共通チャネルを直接定義するのではなく `@repo/shared/src/ipc/channels` から import する構造に変わると、仕様書の「channels.ts の定義箇所」記述が陳腐化し、ipc-preload-spec-sync-guardian の監査チェック対象が正しく設定されなくなる |
| 解決策 | shared チャネルの移管完了時に、関連スキル（ipc-preload-spec-sync-guardian 等）の Trigger キーワード・Phase 3 アクション・リソース参照を同ターンで更新する。移管後の正本は shared 側のファイルパスを明記する |
| 標準ルール | IPC channel 定数を shared に移管する場合は「移管完了 → スキル更新」を同一 wave に含める（P57 準拠） |
| 関連タスク | UT-SDK-07 |

---

## TASK-RT-06 教訓（2026-03-29）

### 1. shared 型追加時は barrel export を同ターンで更新しないと desktop が即壊れる

| 項目 | 内容 |
| --- | --- |
| 課題 | `RuntimeSkillCreatorPlanErrorResponse` を shared 型へ追加したが `@repo/shared/types` から再公開漏れがあり desktop typecheck が失敗 |
| 解決策 | `packages/shared/src/types/index.ts` の export type を同一ターンで更新し、desktop 側 import を再検証 |
| 標準ルール | shared 型の追加・改名時は「定義ファイル」と「barrel export」を必ずセットで更新（P32） |
| 関連タスク | TASK-RT-06 |

### 2. UI 非変更タスクでも Phase 11 は N/A 宣言だけで完了にしない

| 項目 | 内容 |
| --- | --- |
| 課題 | スクリーンショット N/A のみで手動検証証跡が不足し、Phase 11 妥当性が監査で否認 |
| 解決策 | `manual-test-checklist.md` と `discovered-issues.md` を必須補助成果物として追加 |
| 標準ルール | UI 非変更タスクは「N/A 根拠 + 代替証跡（checklist/issues）」をセットで残す |
| 関連タスク | TASK-RT-06 |

---

## TASK-P0-04 教訓（2026-03-30）

### L-P0-04-001: vitest 実行時の process.cwd() はプロジェクトルートではない

| 項目 | 内容 |
| --- | --- |
| 課題 | `REPO_SKILL_CREATOR_PATH` は `path.resolve(process.cwd(), ".claude", ...)` でモジュールロード時に評価される。vitest では cwd が `apps/desktop/` になるため、プロジェクトルートの `.claude/` を参照できずテストが失敗する |
| 解決策 | テスト環境では `AIWORKFLOW_SKILL_CREATOR_PATH` 環境変数を `beforeAll`/`afterAll` でセットして `getSkillCreatorRootCandidates()` を正しいパスに誘導する。本番コードの変更は不要 |
| 標準ルール | `process.cwd()` ベースの定数はモジュールロード時に固定される点に注意。テスト内でパス依存のコードをテストする際は環境変数 DI パターンを使用する |
| 関連タスク | TASK-P0-04 |

### L-P0-04-002: TDD Red は「import エラー」ではなく「実行エラー」で確認する

| 項目 | 内容 |
| --- | --- |
| 課題 | 未実装関数を import すると、同ファイル内の既存テストも巻き込んで全失敗になる。Red の確認目的が「新テストの失敗」なのに既存テストが壊れる副作用が生じる |
| 解決策 | スケルトン関数（`throw new Error("not implemented")`）を先に定義し、import はコンパイルできる状態にする。実行時にのみ新テストが Red になるよう設計する |
| 標準ルール | テストファースト実装では「スケルトン定義 → テスト記述 → Red 確認 → 実装 → Green 確認」の順序を守る |
| 関連タスク | TASK-P0-04 |

