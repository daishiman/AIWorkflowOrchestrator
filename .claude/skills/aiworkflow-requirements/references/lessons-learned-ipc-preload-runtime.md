# Lessons Learned: IPC / Preload / AI Runtime

> 親仕様書: [lessons-learned.md](lessons-learned.md)
> 役割: IPC ハンドラ、Preload API、AI Runtime アダプタ、認証モード統合に関する教訓
> 分割元: [lessons-learned-current.md](lessons-learned-current.md)

## メタ情報

| 項目     | 値                                                                     |
| -------- | ---------------------------------------------------------------------- |
| 正本     | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md` |
| 目的     | IPC/Preload/AI Runtime に関する教訓を集約                              |
| スコープ | IPC 契約、Preload API 公開、AuthMode 統一、LLM アダプタ               |
| 対象読者 | AIWorkflowOrchestrator 開発者                                          |

---

## 変更履歴

| 日付 | バージョン | 変更内容 |
|------|-----------|----------|
| 2026-03-17 | 1.0.0 | lessons-learned-current.md から分割作成 |

---

## 2026-03-16 TASK-FIX-CONVERSATION-IPC-HANDLER-REGISTRATION

> この教訓は lessons-learned-current.md v1.29.97 で追加されたが、変更履歴のみの記録であったため、以下は参照先として機能する。

---

## 2026-03-16 TASK-IMP-SKILL-DOCS-AI-RUNTIME-001

### 教訓1: Constructor Injection による queryFn 差替パターン

| 項目 | 内容 |
| --- | --- |
| 状況 | SkillDocGenerator の stubQueryFn を LLMDocQueryAdapter.query() に差し替える必要があった |
| 解決策 | `adapter.query.bind(adapter)` で既存の `LLMQueryFn` シグネチャに合わせることで、SkillDocGenerator 自体に変更を加えずに adapter を注入できた（Open-Closed Principle） |
| 適用範囲 | 他の LLM 統合箇所（chat-edit, agent-execution 等）でも同パターンが適用可能 |
| 関連タスク | TASK-IMP-SKILL-DOCS-AI-RUNTIME-001 |

### 教訓2: CapabilityResolver パターンの再利用性

| 項目 | 内容 |
| --- | --- |
| 状況 | Skill Docs の capability 判定（integrated-api / guidance-only / terminal-handoff）を3パスで実装 |
| 解決策 | ILLMDocQueryAdapter インターフェースの isAvailable() / getProviderName() を基に resolver が判定する疎結合設計 |
| 注意 | terminal-handoff は事後判定（LLM呼出し失敗後の fallback）であり、事前判定には isAvailable() では不十分。実LLM接続テストが必要（UT-SKILL-DOCS-TERMINAL-HANDOFF-001 として未タスク化） |
| 関連タスク | TASK-IMP-SKILL-DOCS-AI-RUNTIME-001 |

### 教訓3: Phase 4-5 統合実行の効率性

| 項目 | 内容 |
| --- | --- |
| 状況 | Phase 4（テスト作成 Red）と Phase 5（実装 Green）を別エージェントで実行しようとした |
| 解決策 | TDD の Red-Green サイクルを1エージェントで統合実行するほうが、型定義→テスト→実装のコンテキスト切替コストが低く効率的だった |
| 適用範囲 | 今後の Phase 4-5 実行時は統合エージェントを推奨 |
| 関連タスク | TASK-IMP-SKILL-DOCS-AI-RUNTIME-001 |

### 同種課題の簡潔解決手順（3ステップ）

1. LLM adapter 差し替えは `bind()` パターンで既存シグネチャに合わせ、Generator クラス本体を変更しない。
2. CapabilityResolver の terminal-handoff パスは「失敗後 fallback」として設計し、事前判定と混在させない。
3. Phase 4-5 は同一エージェントで Red-Green サイクルを完結させる。

---

## 2026-03-14 TASK-IMP-WORKSPACE-CHAT-EDIT-AI-RUNTIME-001（P57-P61）

### P57: 設計書と実コードの AuthMode 値の乖離

| 項目 | 内容 |
| --- | --- |
| 課題 | 設計ドキュメントでは AuthMode を `"integrated"` / `"terminal"` / `"hybrid"` の3値で定義したが、実コードベースでは `"subscription" \| "api-key"` の2値。RuntimeResolver の実装時に解決テーブルの全面書き直しが必要だった |
| 再発条件 | Phase 2（設計）で想定値を使い、実コードの型定義を検証しない |
| 解決策 | Phase 1（要件定義）で `grep -rn "AuthMode" packages/shared/` を実行し、正本の型定義値を確認する。設計書で想定値を使う前に必ず実コードの型を検証 |
| 標準ルール | 設計書で列挙型の値を参照するときは、実コードの型定義を正本として先に確認する |
| 関連タスク | TASK-IMP-WORKSPACE-CHAT-EDIT-AI-RUNTIME-001 |

### P58: 同名ファイルの二重存在（chatEditHandlers.ts）

| 項目 | 内容 |
| --- | --- |
| 課題 | `apps/desktop/src/main/handlers/chatEditHandlers.ts` と `apps/desktop/src/main/ipc/chatEditHandlers.ts` の2つが存在し、実際に `ipc/index.ts` から import されているのは `ipc/chatEditHandlers.ts` だった。設計書は `handlers/chatEditHandlers.ts` を参照しており、誤ったファイルを修正するリスクがあった |
| 再発条件 | 設計書のファイルパスを信じて修正対象を決め、実際の import 元を確認しない |
| 解決策 | 修正対象ファイルの特定には `grep -rn "import.*chatEditHandlers" apps/desktop/src/main/` で実際の import 元を確認する |
| 標準ルール | 同名ファイルが複数ディレクトリに存在する場合、`grep import` で実際に使用されている方を正本とする |
| 関連タスク | TASK-IMP-WORKSPACE-CHAT-EDIT-AI-RUNTIME-001 |

### P59: Preload API 未公開（exposeChatEditAPI 呼び出し欠落）

| 項目 | 内容 |
| --- | --- |
| 課題 | `chatEditApi.ts` に `exposeChatEditAPI()` 関数は定義されていたが、`preload/index.ts` で一切呼ばれておらず、`chatEditAPI` が Renderer に完全に未公開だった。他の全 API（electronAPI, agentAPI 等）は contextBridge 経由で公開済みだった |
| 症状 | `window.chatEditAPI` が `undefined` で全ての chat-edit IPC 呼び出しが失敗 |
| 再発条件 | 新規 Preload API を定義するだけで `preload/index.ts` の `contextBridge.exposeInMainWorld()` ブロックへの追記を忘れる |
| 解決策 | 新規 Preload API を追加した場合、`preload/index.ts` の `contextBridge.exposeInMainWorld()` ブロックと else ブロックの両方に追記されているか必ず確認する |
| 再発防止 | `grep -c "exposeInMainWorld" preload/index.ts` と `grep -c "chatEditAPI\|slideApi\|agentAPI" preload/index.ts` で API 公開数を監査 |
| 関連パターン | M-01（contextBridge 未使用）、P23（API二重定義の型管理複雑性） |
| 関連タスク | TASK-IMP-WORKSPACE-CHAT-EDIT-AI-RUNTIME-001 |

### P60: createAuthModeService のスコープ制限

| 項目 | 内容 |
| --- | --- |
| 課題 | `ipc/index.ts` で `createAuthModeService(authKeyService)` が `track("registerAuthModeHandlers", ...)` コールバック内で呼ばれており、そのスコープ外（chat-edit ハンドラ登録ブロック）からは参照できなかった。chat-edit ハンドラにも authModeService が必要だったため、別インスタンスを生成する必要があった |
| 再発条件 | 複数のハンドラ登録ブロックで同じサービスが必要なのに、外側スコープに引き上げない |
| 解決策 | 複数のハンドラ登録ブロックで同じサービスが必要な場合、外側スコープで生成するか、各ブロック内で `createXxxService()` を呼ぶ |
| 標準ルール | サービスの共有スコープは「最も外側の共通消費者」に合わせて配置する |
| 関連パターン | P34（遅延初期化 DI パターン選択） |
| 関連タスク | TASK-IMP-WORKSPACE-CHAT-EDIT-AI-RUNTIME-001 |

### P61: ChatEditService の動的アダプタ注入

| 項目 | 内容 |
| --- | --- |
| 課題 | ChatEditService はコンストラクタで LLMAdapter を受け取る設計だが、RuntimeResolver の結果（API キー有無）によって adapter が変わるため、毎回 `new ChatEditService(resolution.adapter, contextBuilder)` で生成する方式を採用。stubLLMAdapter を置き換える際、Setter Injection ではなく Factory パターンに近い動的生成が最適だった |
| 再発条件 | adapter が呼び出し時の状態に依存するのに、インスタンスをキャッシュする |
| 解決策 | adapter が呼び出し時の状態に依存する場合は、毎回 new でインスタンスを生成する。API キーが変更される可能性を考慮すると、キャッシュを避ける |
| 標準ルール | DI 対象が実行時コンテキスト依存（認証状態等）の場合は Factory パターンで毎回生成する |
| 関連パターン | P34（遅延初期化 DI） |
| 関連タスク | TASK-IMP-WORKSPACE-CHAT-EDIT-AI-RUNTIME-001 |

### 同種課題の簡潔解決手順（5ステップ）

1. Phase 1 で `grep -rn "AuthMode\|ChatEdit" packages/shared/ apps/desktop/src/` を実行し、実コードの型定義値と既存ファイル配置を先に確認する。
2. 同名ファイルがある場合は `grep -rn "import.*FileName"` で実際の import 元を特定し、正本を決定する。
3. 新規 Preload API は定義後に `preload/index.ts` の `contextBridge.exposeInMainWorld()` と else ブロックの両方に追記を確認する。
4. サービスの共有スコープは消費者ブロックの共通親に引き上げるか、各ブロック内で `createXxxService()` を呼ぶ。
5. DI 対象が認証状態依存の場合は Factory パターンで毎回生成し、キャッシュを避ける。

---

## 2026-03-14 TASK-IMP-AI-RUNTIME-AUTHMODE-UNIFICATION-001（Phase 12 再確認追補）

### 苦戦箇所: 既存未タスクを再参照しても、対象ファイル自体が10見出し要件を満たしていない場合がある

| 項目 | 内容 |
| --- | --- |
| 課題 | `unassigned-task-detection.md` で「既存未タスクを再利用」と記録しても、`audit-unassigned-tasks --target-file` では current 違反が出るケースがあった |
| 再発条件 | diff監査（`--diff-from HEAD`）だけで完了判定し、再参照した既存未タスク本文を個別監査しない |
| 解決策 | 再参照した各未タスクに対して `audit-unassigned-tasks --target-file` を実行し、違反があれば同ターンで9見出しへ是正した |
| 標準ルール | Phase 12 の「新規未タスク0件」判定時でも、再参照した既存未タスクは `target-file` 監査で `currentViolations=0` を確認する |

### 同種課題の簡潔解決手順（5ステップ）

1. `verify-unassigned-links --source .../task-workflow.md` で参照切れを先に潰す。
2. `audit-unassigned-tasks --json --diff-from HEAD` で今回差分の合否（current）を確認する。
3. `unassigned-task-detection.md` で再参照した既存未タスクを列挙する。
4. 各ファイルへ `audit-unassigned-tasks --target-file <path>` を実行し、current違反を確認する。
5. 違反があれば同ターンで9見出し是正し、再実行で `currentViolations=0` を固定する。

---

## 2026-03-14 TASK-IMP-WORKSPACE-CHAT-EDIT-AI-RUNTIME-001 / TASK-IMP-CLAUDE-CODE-TERMINAL-SURFACE-001

### 苦戦箇所1: current build screenshot が esbuild platform mismatch で停止する

| 項目 | 内容 |
| --- | --- |
| 課題 | `electron-vite dev` が `@esbuild/darwin-arm64` / `@esbuild/darwin-x64` 不一致で起動できず、Phase 11 の実画面 capture が中断した |
| 再発条件 | worktree の node 実行アーキと lockfile 由来 binary がずれている状態で capture script を実行する |
| 解決策 | 当日中に fallback review board capture を current workflow 配下で生成し、`phase11-capture-metadata.json` へ理由と source を固定した |
| 標準ルール | 明示 screenshot 要求時は「実画面試行ログ → fallback 実行 → metadata 記録 → coverage validator PASS」まで同一ターンで閉じる |

### 苦戦箇所2: chatEdit preload と Main IPC の payload 契約がドリフトしていた

| 項目 | 内容 |
| --- | --- |
| 課題 | `chatEditAPI.readFile/writeFile` が positional 引数で invoke し、Main 側の object payload 契約（`{ filePath, workspacePath? }`）と不整合だった |
| 再発条件 | IPC handler 側シグネチャ変更時に preload API と renderer hook の引数形を同時更新しない |
| 解決策 | `chatEditApi.ts` を object payload 契約へ統一し、`getEditorSelection` も `{ success, data }` を unwrap する実装へ修正した |
| 標準ルール | IPC 契約変更時は handler / preload / renderer usage を 1 セットで更新し、`typecheck` と関連テストを同ターンで実行する |

### 同種課題の簡潔解決手順（5ステップ）

1. Phase 11 capture 前に `pnpm --filter @repo/desktop dev` の preflight 実行可否を確認する。
2. 起動不可ならエラー理由を記録し、fallback capture を current workflow 配下で生成する。
3. screenshot plan / manual-test-result / metadata を同時更新して TC-ID と証跡を 1:1 にする。
4. IPC 契約差分がある場合は handler・preload・renderer 呼び出しの 3 点を同時に修正する。
5. `validate-phase11-screenshot-coverage` / `validate-phase12-implementation-guide` / `verify-all-specs` / `validate-phase-output` を連続実行して PASS を固定する。
