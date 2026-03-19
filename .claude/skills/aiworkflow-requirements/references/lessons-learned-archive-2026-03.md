# Lessons Learned アーカイブ（2026-03-01 〜 2026-03-15）

> 親仕様書: [lessons-learned.md](lessons-learned.md)
> current summary: [lessons-learned-current.md](lessons-learned-current.md)
> 役割: 2026-03-01〜2026-03-15 の教訓エントリを保管するアーカイブ
> 2026-03-16以降のエントリは [lessons-learned-current.md](lessons-learned-current.md) を参照

## メタ情報

| 項目     | 値                                                                     |
| -------- | ---------------------------------------------------------------------- |
| 正本     | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md` |
| 目的     | current summary から分離した過去教訓の保管                             |
| スコープ | 2026-03-01〜2026-03-15 に記録された教訓エントリ                        |
| 対象読者 | AIWorkflowOrchestrator 開発者                                          |

---

## 教訓アーカイブ（2026-03-01 〜 2026-03-15）

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

### 2026-03-12 TASK-IMP-TASK-SPECIFICATION-CREATOR-LINE-BUDGET-REFORM-001

#### 苦戦箇所1: `SKILL.md` に detail を抱えたままでは validator は通っても再利用性が落ちる

| 項目 | 内容 |
| --- | --- |
| 課題 | 入口ファイルに Phase 12 detail、長い pattern、長い logs が混在すると探索コストが高い |
| 解決策 | `SKILL.md` は入口だけにし、detail を family file へ出す |
| 標準ルール | large skill docs は `SKILL.md` を 300 行前後の入口へ保つ |

#### 苦戦箇所2: `LOGS.md` を rolling 化しないと line budget と履歴保全が両立しない

| 項目 | 内容 |
| --- | --- |
| 課題 | usage log を本体に積み続けると 500 行超の monolith へ戻る |
| 解決策 | rolling log + archive index + 月次 archive に分ける |
| 標準ルール | 再利用頻度の高い直近ログだけを本体へ残す |

#### 苦戦箇所3: `.claude` と `.agents` の同期を最後にまとめないと drift が再発する

| 項目 | 内容 |
| --- | --- |
| 課題 | family file を多数追加すると mirror 漏れが起きやすい |
| 解決策 | `.claude` 正本更新後に `diff -qr` 前提で mirror を同期する |
| 標準ルール | `quick_validate.js`、`validate_all.js`、`diff -qr` を 1 セットで実行する |

### 2026-03-11 TASK-UI-04B-WORKSPACE-CHAT

#### 苦戦箇所1: stream の chunk/end が同一ティックで届くと assistant 応答が欠落する

| 項目 | 内容 |
| --- | --- |
| 課題 | `setState` 反映より先に end が確定し、assistant メッセージが空扱いで終わるケースがあった |
| 再発条件 | stream 更新を state だけで管理し、即時参照用の ref を持たない |
| 解決策 | `streamContentRef` / `isStreamingRef` を chunk/end 受信時に即時同期し、end 側の判定を ref 基準へ寄せた |
| 標準ルール | stream UI は「描画 state」と「同期判定 ref」を分離し、chunk/end 競合を先に潰す |

#### 苦戦箇所2: screenshot harness が llm / conversation API を揃えないと streaming 状態を再現できない

| 項目 | 内容 |
| --- | --- |
| 課題 | 04A 用 harness を流用すると、04B の stream/mention 状態が再現できず証跡が欠ける |
| 再発条件 | UI capture script で対象機能の API mock を最低限にしすぎる |
| 解決策 | `capture-task-059a-workspace-chat-panel-phase11.mjs` に llm/conversation mock を追加し、TC-11-01〜08 を固定した |
| 標準ルール | Phase 11 の capture script は対象機能の API 境界（file/llm/conversation）を先に棚卸しする |

#### 苦戦箇所3: Phase 12 実装ガイドが Part 1/2 の見出しだけでは validator に通らない

| 項目 | 内容 |
| --- | --- |
| 課題 | `implementation-guide.md` が Part 1/2 構成だけ満たし、型/API/使用例/エッジケース/定数一覧が不足していた |
| 再発条件 | 「構造あり = 完了」と判断し、内容 validator を後回しにする |
| 解決策 | Part 2 に TypeScript 型定義、APIシグネチャ、使用例、エラーハンドリング、エッジケース、設定と定数を追記した |
| 標準ルール | Phase 12 は `validate-phase12-implementation-guide.js` を必ず実行し、2/10 のような部分充足で閉じない |

#### 同種課題の簡潔解決手順（5ステップ）

1. stream 実装は chunk/end 競合テストを先に作り、state と ref の責務を分離する。
2. screenshot harness は対象 UI の API 境界を一覧化してから mock を追加する。
3. Phase 11 は TC と screenshot path を `phase-11-manual-test.md` に固定する。
4. Phase 12 は implementation-guide validator を先に実行し、NG項目を埋めてから他仕様を更新する。
5. `task-workflow` / `lessons-learned` / `LOGS` / `SKILL` を同一ターンで同期する。

### 2026-03-11 TASK-FIX-LIGHT-THEME-TOKEN-FOUNDATION-001

#### 苦戦箇所1: token 修正だけでは renderer 全域の light drift を止めきれない

| 項目 | 内容 |
| --- | --- |
| 課題 | `tokens.css` を white/black 基準へ直しても、renderer 側に残る `text-white` / `bg-gray-*` / `border-white/*` 系 class で一部画面が dark mode 寄りのまま残った |
| 再発条件 | token 契約だけを修正し、renderer 全域の hardcoded neutral class を棚卸ししない |
| 解決策 | `globals.css` に compatibility bridge を追加して全画面の暫定整合を先に取り、同時に `Button` / `Input` / `TextArea` / `Checkbox` / `SettingsCard` を token 基準へ移行した |
| 標準ルール | Light Mode 全画面是正は「token 修正 → renderer 監査 → compatibility bridge → component migration」の順で分離して進める |

#### 苦戦箇所2: desktop CI の 1 shard fail は全量再実行だけでは原因が埋もれる

| 項目 | 内容 |
| --- | --- |
| 課題 | GitHub Actions では desktop test の shard 11 だけが失敗していたが、全量 rerun だけでは `DashboardView` の `--accent` drift が埋もれた |
| 再発条件 | failing shard 番号を local で再現せず、broad rerun だけで当たりを付ける |
| 解決策 | `pnpm --filter @repo/desktop exec vitest run --shard=11/16` で同じ shard を再現し、`--accent` を `--accent-primary` へ統一した |
| 標準ルール | GitHub desktop CI が shard 単位で落ちたら、同じ `--shard=<n>/16` を local 再現の起点にする |

#### 苦戦箇所3: global light remediation 後に screenshot を再取得しないと証跡が stale になる

| 項目 | 内容 |
| --- | --- |
| 課題 | token / primitive / compatibility bridge を変えた後も旧 screenshot を残すと、Apple UI/UX 判断が最新実装を反映しない |
| 再発条件 | 視覚証跡を「既にあるファイル」で済ませ、再撮影と coverage validator を省く |
| 解決策 | capture script の workflow root を completed path に直し、5件を再撮影して `validate-phase11-screenshot-coverage` を再実行した |
| 標準ルール | Light Mode の見た目を変えたら screenshot を撮り直し、coverage validator PASS を同ターンで固定する |

#### 苦戦箇所4: Phase成果物の欠落を放置すると「実装済みだが台帳未完了」の誤判定になる

| 項目 | 内容 |
| --- | --- |
| 課題 | `tokens.css` 実装とテストは完了していたが、`outputs/phase-5..12` が不足し `artifacts/index` と不整合が発生した |
| 再発条件 | 実装後に workflow outputs の生成を後段へ回し、phase status 更新だけ先に行う |
| 解決策 | 不足成果物を補完し、`artifacts.json` / `outputs/artifacts.json` / `index.md` / `phase-*.md` を同ターンで同期した |
| 標準ルール | 「実装完了」判定前に `outputs` 実体・status・registry の3点を同時確認する |

#### 苦戦箇所5: Phase 11 で `テストケース` と `画面カバレッジマトリクス` を欠くと根拠追跡が崩れる

| 項目 | 内容 |
| --- | --- |
| 課題 | screenshot は存在していても、`phase-11-manual-test.md` 必須節不足で証跡追跡が弱くなった |
| 再発条件 | `manual-test-result.md` の記録だけを先に作り、仕様書本体の matrix を省略する |
| 解決策 | `phase-11-manual-test.md` に TC 表と matrix を追記し、`証跡` 列を screenshot ファイル名へ厳密に紐づけた |
| 標準ルール | Phase 11 は「TC表 + matrix + result証跡列」を 1 セットで作成する |

#### 苦戦箇所6: Phase 12 で `spec_created` と `completed` を混在させると台帳ドリフトが再発する

| 項目 | 内容 |
| --- | --- |
| 課題 | `phase-12-documentation.md` に `spec_created` 文言が残ると、実装完了タスクの状態が曖昧になる |
| 再発条件 | 仕様作成専用テンプレート文言を実装完了タスクへ流用する |
| 解決策 | Task 12-2 / 完了条件の表現を `completed` に統一し、Step 1-A〜2 の整合を修正した |
| 標準ルール | 実装完了タスクの Phase 12 では `completed` を唯一の完了状態として使う |

#### 苦戦箇所7: completed workflow へ移管した後の follow-up backlog は正本配置を固定しないと導線がぶれる

| 項目 | 内容 |
| --- | --- |
| 課題 | `light-theme-shared-color-migration/` などの workflow 名だけを参照すると、正式な task spec / issue 追跡先が分離しやすい |
| 再発条件 | 親 workflow を `completed-tasks/` へ移した後も、root `unassigned-task/` や workflow 名参照だけで運用する |
| 解決策 | 2件を `docs/30-workflows/completed-tasks/light-theme-token-foundation/unassigned-task/` に揃え、`audit-unassigned-tasks --json --diff-from HEAD --target-file <file>` で個別 `currentViolations=0` を確認した |
| 標準ルール | active workflow 由来の未実施タスクは `docs/30-workflows/completed-tasks/step-04-par-task-09-slide-ai-runtime-alignment/unassigned-task/`、completed workflow 由来の継続 backlog は `docs/30-workflows/completed-tasks/<workflow>/unassigned-task/` を正本にする |

#### 同種課題の簡潔解決手順（5ステップ）

1. light token baseline を `#ffffff / #000000` に固定する。
2. `rg -n "text-white|bg-white/|border-white/|text-gray-|bg-gray-|border-gray-" apps/desktop/src/renderer` で renderer 全域を監査し、token / bridge / component の責務を分ける。
3. 全画面共通の drift は `globals.css` の compatibility bridge で先に止め、primitives を token へ寄せる。
4. CI fail が shard 単位なら `pnpm --filter @repo/desktop exec vitest run --shard=<n>/16` で再現し、screenshot を撮り直して `validate-phase11-screenshot-coverage` を通す。
5. `ui-ux-design-system` / `task-workflow` / `lessons-learned` / `SKILL` / `LOGS` を同一ターンで同期する。

### 2026-03-12 TASK-FIX-LIGHT-THEME-SHARED-COLOR-MIGRATION-001

#### 苦戦箇所1: old unassigned-task の対象一覧を盲信すると current worktree とずれる

| 項目 | 内容 |
| --- | --- |
| 課題 | `SettingsView` / `SettingsCard` / `DashboardView` を主対象のまま持ち込むと、実際に hardcoded color が多い `AccountSection` / `ApiKeysSection` / `AuthModeSelector` / `AuthKeySection` / `WorkspaceSearchPanel` が薄まる |
| 再発条件 | 親 task の未タスク指示書を current worktree 監査なしで再利用する |
| 解決策 | `outputs/phase-1/requirements-definition.md` の inventory を正本にし、wrapper は verification-only lane へ落とした |
| 標準ルール | spec_created UI task では Phase 1 で current worktree の inventory correction を必ず行う |

#### 苦戦箇所2: token scope と component scope を混ぜると task が肥大化する

| 項目 | 内容 |
| --- | --- |
| 課題 | token foundation の残件と component migration を同一 task に入れると、設計レビューで責務境界が曖昧になる |
| 再発条件 | `white/black baseline` の議論と `shared component migration` を同時に扱う |
| 解決策 | 親 workflow を token 基盤、current workflow を component migration、`SettingsView` / `SettingsCard` / `DashboardView` を verification-only として 3 lane に分離した |
| 標準ルール | Light Mode follow-up は token / component / verification-only の 3 つに分ける |

#### 苦戦箇所3: UI 仕様だけ読むと auth/search/security/portal/state の前提が漏れる

| 項目 | 内容 |
| --- | --- |
| 課題 | `AuthView` / `WorkspaceSearchPanel` / Settings sections を跨ぐのに、UI 正本だけでは IPC / security / portal / state の制約が読めない |
| 再発条件 | `ui-ux-*` だけで Phase 1-2 を閉じる |
| 解決策 | `rag-desktop-state` / `api-ipc-auth` / `api-ipc-system` / `architecture-auth-security` / `security-electron-ipc` / `security-principles` / `ui-ux-portal-patterns` を同時抽出した |
| 標準ルール | settings + auth + workspace が同居する UI task は UI + state + api/auth + security + portal を同一ターンで読む |

#### 苦戦箇所4: Phase 1-3 gate を崩すと後続 phase の設計が揺れる

| 項目 | 内容 |
| --- | --- |
| 課題 | inventory correction 前に Phase 4 以降の内容を詳細化すると、batch と test anchor が二重修正になる |
| 再発条件 | 設計レビュー PASS 前に downstream phase を先に完成扱いにする |
| 解決策 | Phase 1-3 を completed に固定し、Phase 4-13 は planned のまま保持した |
| 標準ルール | spec_created task は「Phase 1-3 completed → 4+ planned」の順序を守る |

#### 同種課題の簡潔解決手順（5ステップ）

1. Phase 1 で current worktree の hardcoded color inventory を取り直す。
2. token scope / component scope / verification-only lane を先に分ける。
3. `ui-ux-*` だけでなく `rag-desktop-state` / `api-ipc-*` / `architecture-auth-security` / `security-*` / `ui-ux-portal-patterns` の要否を同時判定する。
4. Phase 1-3 を completed にしてから、Phase 4 以降は planned task として設計する。
5. `workflow-light-theme-global-remediation` / `task-workflow` / `lessons-learned` / skill template を同一ターンで同期する。

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
| 課題 | `chatEditApi.ts` に `exposeChatEditAPI()` 関数は定義されていたが、`preload/index.ts` で一切呼ばれておらず、`chatEditAPI` が Renderer に完全に未公開だった |
| 症状 | `window.chatEditAPI` が `undefined` で全ての chat-edit IPC 呼び出しが失敗 |
| 再発条件 | 新規 Preload API を定義するだけで `preload/index.ts` の `contextBridge.exposeInMainWorld()` ブロックへの追記を忘れる |
| 解決策 | 新規 Preload API を追加した場合、`preload/index.ts` の `contextBridge.exposeInMainWorld()` ブロックと else ブロックの両方に追記されているか必ず確認する |
| 関連タスク | TASK-IMP-WORKSPACE-CHAT-EDIT-AI-RUNTIME-001 |

#### P60: createAuthModeService のスコープ制限

| 項目 | 内容 |
| --- | --- |
| 課題 | `ipc/index.ts` で `createAuthModeService(authKeyService)` が `track("registerAuthModeHandlers", ...)` コールバック内で呼ばれており、そのスコープ外（chat-edit ハンドラ登録ブロック）からは参照できなかった |
| 解決策 | 複数のハンドラ登録ブロックで同じサービスが必要な場合、外側スコープで生成するか、各ブロック内で `createXxxService()` を呼ぶ |
| 標準ルール | サービスの共有スコープは「最も外側の共通消費者」に合わせて配置する |
| 関連タスク | TASK-IMP-WORKSPACE-CHAT-EDIT-AI-RUNTIME-001 |

#### P61: ChatEditService の動的アダプタ注入

| 項目 | 内容 |
| --- | --- |
| 課題 | ChatEditService はコンストラクタで LLMAdapter を受け取る設計だが、RuntimeResolver の結果（API キー有無）によって adapter が変わるため、毎回 `new ChatEditService(resolution.adapter, contextBuilder)` で生成する方式を採用 |
| 解決策 | adapter が呼び出し時の状態に依存する場合は、毎回 new でインスタンスを生成する |
| 標準ルール | DI 対象が実行時コンテキスト依存（認証状態等）の場合は Factory パターンで毎回生成する |
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

### 関連未タスク（2026-03-12 追補）

| 未タスクID | 概要 | タスク仕様書 |
| --- | --- | --- |
| UT-IMP-SPEC-CREATED-UI-WORKFLOW-ROOT-SYNC-GUARD-001 | `spec_created` UI workflow の current inventory / verification-only lane / system spec extraction / root registry sync を同時に固定する | `docs/30-workflows/completed-tasks/step-04-par-task-09-slide-ai-runtime-alignment/unassigned-task/task-imp-spec-created-ui-workflow-root-sync-guard-001.md` |

---

### 2026-03-15 TASK-SKILL-LIFECYCLE-05

#### 苦戦箇所1: Phase 11 の必須成果物が揃っておらず screenshot coverage validator が失敗する

| 項目 | 内容 |
| --- | --- |
| 課題 | `manual-test-result.md` のみで運用し、`manual-test-checklist.md` と `screenshot-plan.json` が欠落した状態で再監査に進んでしまった |
| 再発条件 | 「スクリーンショットがあるから十分」と判断し、validator 前提ファイルを確認しない |
| 解決策 | `outputs/phase-11/` を `checklist/result/plan/screenshots` の4点セットで再構成し、TC-11-01〜05 の証跡を 1:1 で再紐付けした |
| 標準ルール | Phase 11 完了判定は `validate-phase11-screenshot-coverage` PASS を必須にし、必須ファイル欠落を残さない |

#### 苦戦箇所4: Record パターンでの ScoringGate 網羅性保証

| 項目 | 内容 |
| --- | --- |
| 課題 | switch 文で ScoringGate の4段階を分岐しようとしたが、新しい段階が追加された場合にコンパイルエラーにならない |
| 解決策 | `Record<ScoringGate, CTAVisibility>` で全キーの定義を型レベルで強制する |
| 標準ルール | ユニオン型の全ケース網羅には `Record<UnionType, Config>` パターンを使う |
| 関連タスク | TASK-SKILL-LIFECYCLE-05 |

#### 苦戦箇所5: 設計タスクの artifacts.json 逐次更新忘れ

| 項目 | 内容 |
| --- | --- |
| 課題 | 49成果物を全て作成済みだったが、artifacts.json の phase status が全て `not_started` のまま放置 |
| 解決策 | 各Phase完了ごとに artifacts.json の status, artifacts 配列, acceptanceCriteria を逐次更新 |
| 標準ルール | artifacts.json は Phase 完了の正式記録であり、成果物作成と同時に更新する |
| 関連タスク | TASK-SKILL-LIFECYCLE-05 |

#### 苦戦箇所6: Phase 12 本文と成果物の実績が乖離する

| 項目 | 内容 |
| --- | --- |
| 課題 | `phase-12-documentation.md` が `not_started` のまま、`documentation-changelog.md` に計画文が残り、成果物実体と矛盾した |
| 解決策 | `phase-12-documentation.md` / `documentation-changelog.md` / `spec-update-summary.md` の3点を同一ターンで更新した |
| 標準ルール | Phase 12 は実績ログのみを残し、計画文は残さない |
| 関連タスク | TASK-SKILL-LIFECYCLE-05 |

---

### 2026-03-14 TASK-SKILL-LIFECYCLE-04

#### 苦戦箇所1: 未タスク配置先ドリフトで指定ディレクトリ監査が不成立になる

| 項目 | 内容 |
| --- | --- |
| 課題 | 未タスクを `docs/30-workflows/skill-lifecycle-unification/tasks/unassigned-task/` に置いたため、`--target-file` 監査境界と衝突した |
| 解決策 | root canonical path（`docs/30-workflows/completed-tasks/step-04-par-task-09-slide-ai-runtime-alignment/unassigned-task/`）へ再配置した |
| 標準ルール | active 未タスクは root canonical path を正本とし、workflow ローカル path は使わない |

#### 苦戦箇所3: system spec の同期対象を絞りすぎると same-wave が崩れる

| 項目 | 内容 |
| --- | --- |
| 課題 | workflow 成果物だけ更新して `resource-map` / `quick-reference` / `legacy register` / `LOGS` を後回しにすると、再利用入口が stale になる |
| 解決策 | `workflow-skill-lifecycle-evaluation-scoring-gate.md` を統合正本として追加し、`parent docs / ledger / indexes / logs` を同一 wave で同期した |
| 標準ルール | Phase 12 の close-out は `workflow + parent docs + task-workflow + lessons + indexes + LOGS + mirror` を最小単位とする |

---

### 2026-03-16 TASK-SKILL-LIFECYCLE-07

#### 苦戦箇所1: Phase 12 サブエージェントが「設計タスク範囲外」として実ファイル更新を保留する

| 項目 | 内容 |
| --- | --- |
| 課題 | Phase 12 の Step 1-A〜Step 2 で、サブエージェントが「設計タスクなので実ファイル更新は実装タスクで行う」と判断し、更新計画のみ記録した |
| 解決策 | 設計タスクでも Step 1-A（タスク完了記録）、Step 1-C（関連タスクテーブル）、Step 2（システム仕様更新）は実ファイルへの書き込みが必須 |
| 標準ルール | Phase 12 のシステム仕様書更新は、タスク種別に関わらず実ファイル変更を必ず伴う |

#### 苦戦箇所2: Phase 3 MINOR 4件の追跡フローが Phase 横断で見失われる

| 項目 | 内容 |
| --- | --- |
| 課題 | Phase 3 で検出された MINOR 4件が Phase 5→9→10 を横断する過程で、追跡マトリクスを作成しなかったため対応状況の確認に時間がかかった |
| 解決策 | Phase 5 完了時点で「Phase 3 MINOR 追跡マトリクス」を作成し、各指摘の対応状況を明示する |
| 標準ルール | Phase 3 の MINOR が3件以上の場合は Phase 5 完了時に追跡マトリクスを作成する |

#### 苦戦箇所3: バックグラウンドエージェントの TaskOutput timeout パターン

| 項目 | 内容 |
| --- | --- |
| 課題 | 並列実行したバックグラウンドエージェントが10分 timeout で結果取得に失敗したが、実際には成果物ファイルの生成は完了していた |
| 解決策 | timeout 後は `find` / `ls` で成果物ファイルの存在を直接確認する |
| 標準ルール | バックグラウンドエージェント timeout 後は成果物ファイルの存在確認を優先する |

#### 苦戦箇所4: コンテキストウィンドウ圧縮で前セッションのエージェント結果が消失する

| 項目 | 内容 |
| --- | --- |
| 課題 | 並列エージェントの結果をメモリ上で保持したが、コンテキストウィンドウ圧縮により前セッションの結果が参照不能になった |
| 解決策 | 並列エージェントの結果は必ず成果物ファイルとして出力し、後続 Phase ではファイルから読み取る |
| 標準ルール | 並列エージェントは成果物ファイル出力を優先し、結果参照はファイルベースで行う |
