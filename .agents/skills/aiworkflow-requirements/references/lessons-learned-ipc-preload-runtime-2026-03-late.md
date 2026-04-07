# Lessons Learned: IPC / Preload / AI Runtime（2026-03-22〜2026-03-27）
> 親ファイル: [lessons-learned-ipc-preload-runtime.md](lessons-learned-ipc-preload-runtime.md)

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

