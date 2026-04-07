# Lessons Learned: Phase 12 / ライフサイクル（2026-03-23〜2026-04）
> 親ファイル: [lessons-learned-phase12-workflow-lifecycle.md](lessons-learned-phase12-workflow-lifecycle.md)

## 2026-03-23 TASK-IMP-CHATPANEL-REVIEW-HARNESS-ALIGNMENT-001 教訓

### L-CHRHA-001: GAP ラベルドリフト（Phase 間のドキュメント不整合）

| 項目       | 内容                                                                                                                                                                                                                                |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 課題       | Phase 8（refactor-boundaries.md）と Phase 12（implementation-guide.md）の GAP ラベルが Phase 1 正本（current-state-inventory.md）と乖離した。Phase 1 では GAP-01=onTerminalSwitch だが、Phase 8/12 では GAP-01=onSendMessage と誤記 |
| 原因       | Phase 間でドキュメントをコピーする際に、正本を参照せずに記憶に基づいて記述した                                                                                                                                                      |
| 解決策     | GAP ラベルドリフト是正を実施し、Phase 1 正本に統一。事後修正をドキュメントチェンジログに記録                                                                                                                                        |
| 再発防止   | Phase 8/12 のドキュメント作成時は Phase 1 の正本定義を grep で参照してからラベルを記述する                                                                                                                                          |
| 関連タスク | TASK-IMP-CHATPANEL-REVIEW-HARNESS-ALIGNMENT-001                                                                                                                                                                                     |

### L-CHRHA-002: DEFERRED 判断の誤り（worktree 内ファイル存在確認の省略）

| 項目         | 内容                                                                                                                                   |
| ------------ | -------------------------------------------------------------------------------------------------------------------------------------- |
| 課題         | system-spec-update-summary.md で ui-ux-panels.md を「worktree に存在しない」と判断し DEFERRED としたが、実際にはファイルが存在していた |
| 原因         | worktree 環境で正本ファイルの存在を実際に確認せず、「worktree だから存在しないだろう」という推測で先送りした                           |
| 解決策       | 事後検証で存在を確認し、Review Harness セクションを ui-ux-panels.md に追加                                                             |
| 再発防止     | DEFERRED 判断の前に `ls` / `find` で対象ファイルの存在を実際に確認する。P57 の亜種として記録                                           |
| 関連パターン | P57（設計タスクでのシステム仕様書更新先送り）、P26（システム仕様書更新遅延）                                                           |
| 関連タスク   | TASK-IMP-CHATPANEL-REVIEW-HARNESS-ALIGNMENT-001                                                                                        |

### L-CHRHA-003: ViewType union 型と string の型不一致

| 項目       | 内容                                                                                                                                                                    |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 課題       | `selectProvider(id)` の引数型が `LLMProviderId`（union 型）だが、コールバックから渡される `id` は `string` 型。直接代入すると型エラーが発生                             |
| 解決策     | `useCallback` ラッパーで `id as Parameters<typeof selectProvider>[0]` を使用。将来的には selectProvider の引数型を string に緩和するか、コールバック側で union 型を渡す |
| 関連タスク | TASK-IMP-CHATPANEL-REVIEW-HARNESS-ALIGNMENT-001                                                                                                                         |

---

## TASK-RT-06 Phase 12 close-out 教訓（2026-03-29）

### L-RT06-P12-001: Implementation Guide の Part 1/Part 2 未分離は gate fail の直因

| 項目       | 内容                                                                                                   |
| ---------- | ------------------------------------------------------------------------------------------------------ |
| 課題       | implementation-guide が変更概要のみで、Part 1（中学生向け）/Part 2（技術詳細）要件を満たしていなかった |
| 解決策     | Part 1/Part 2 を明示した2層構成に再編し、型定義・APIシグネチャ・エッジケース・定数一覧を追記           |
| 標準ルール | Phase 12 Task 12-1 は「見出し存在」ではなく必須要素充足で判定する                                      |

### L-RT06-P12-002: 実行不能テストは「PASS扱い」せず未タスク化して条件付き判定へ分離

| 項目       | 内容                                                                                     |
| ---------- | ---------------------------------------------------------------------------------------- |
| 課題       | vitest が esbuild 不整合で実行不能なのに AC 全PASS表記が残り、最終レビュー判定が矛盾     |
| 解決策     | final-review を条件付き PASS に修正し、`UT-RT-06-ESBUILD-ARCH-MISMATCH-001` を formalize |
| 標準ルール | テスト環境 blocker は Phase 10/12 で同一IDの未タスクとして formalize し、判定を分離する  |

---

## UT-RT-06-ESBUILD-ARCH-MISMATCH-001 (2026-03-29)

### 苦戦箇所1: esbuild バイナリアーキ不一致の診断

- **症状**: `pnpm install` 後に vitest が起動しない。`Error: The package "esbuild-darwin-arm64" could not be found.` または類似エラー
- **原因**: macOS 上で Rosetta 経由 x64 Node と native arm64 Node が混在する環境で、`pnpm install` 時の esbuild optional dependency 解決結果と実行時の `process.arch` がずれる
- **解決策**: `EXPECTED_PLATFORM="darwin-$(node -p process.arch)"` を基準に診断し、`pnpm install --force` で optional dependency を再解決
- **再発防止**: `docs/40-guides/esbuild-arch-mismatch-prevention.md` の Preflight チェックリスト（5ステップ）参照

### 知見: arm64 固定ではなく process.arch 動的取得が重要

- `arm64` を直接ハードコードすると x64 環境での誤検知が発生する
- `node -p process.arch` で実行時アーキを動的取得することで、CI/CD 環境の差異も吸収できる

---

## UT-SDK-07-SHARED-IPC-CHANNEL-CONTRACT-001 Phase 12 教訓（2026-03-29）

### L-SDK07-SC-001: Vite テスト環境での @repo/shared パスエイリアス未解決

| 項目       | 内容                                                                                                                                                                                                                       |
| ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 課題       | `packages/shared/src/ipc/__tests__/channels.test.ts` で `@repo/shared` エイリアスを使用してインポートすると、Vitest（Vite バンドラー）が `@repo/shared` を解決できずテストが失敗する                                       |
| 再発条件   | monorepo packages 配下のテストファイルで、自パッケージへの参照に workspace エイリアス（`@repo/*`）を使用する場合                                                                                                           |
| 解決策     | テストファイル内のインポートを相対パス（`../channels` 等）に変更する。workspace エイリアスのパス解決は Vite の tsconfig paths 設定と vite-tsconfig-paths プラグインに依存するため、packages 内テストでは相対パスを優先する |
| 標準ルール | `packages/shared` 配下のテストでは `@repo/shared` ではなく相対パスでインポートする。`apps/desktop` 側は vite-tsconfig-paths プラグインが解決するため `@repo/shared` を使用可能                                             |
| 関連タスク | UT-SDK-07-SHARED-IPC-CHANNEL-CONTRACT-001                                                                                                                                                                                  |

### L-SDK07-SC-002: 命名規則（camelCase vs kebab-case）の事前分析が Phase 4 以降の手戻りを防ぐ

| 項目       | 内容                                                                                                                                                                                                                                           |
| ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 課題       | IPC チャネル名は `approval:respond`（kebab-case 区切りコロン）、TS 定数名は `APPROVAL_RESPOND`（UPPER_SNAKE_CASE）という既存規則があるが、Phase 1 設計時に既存パターンを網羅的に確認せずに命名すると、Phase 4 のテスト作成時に不整合が発覚する |
| 再発条件   | 新規チャネルを追加する際に `packages/shared/src/ipc/channels.ts` の既存命名パターンを grep で確認しないまま設計を進める                                                                                                                        |
| 解決策     | Phase 1（設計）の開始前に `grep -n "CHANNELS" packages/shared/src/ipc/channels.ts` で既存命名パターンを確認し、camelCase / UPPER_SNAKE_CASE / kebab-case の各層での規則を表として整理してから設計に着手する                                    |
| 標準ルール | IPC チャネル追加タスクの Phase 1 では「命名規則分析」を必須ステップとして実施する                                                                                                                                                              |
| 関連タスク | UT-SDK-07-SHARED-IPC-CHANNEL-CONTRACT-001                                                                                                                                                                                                      |

### L-SDK07-SC-003: TDD Red Phase 前に設計前提（既存チャネルとの重複・命名衝突）を整合確認する

| 項目       | 内容                                                                                                                                                                                                                         |
| ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 課題       | TDD の Red（失敗テスト先書き）フェーズに入る前に、追加するチャネル名が既存定数と衝突していないか、preload 側の `ALLOWED_INVOKE_CHANNELS` 等の allowlist に影響しないかを確認しないと、Green フェーズで想定外の修正が発生する |
| 再発条件   | `channels.ts` に新定数を追加した後、preload の allowlist や既存テストの期待値が暗黙的に「全チャネル数」を前提にしている場合に、Green フェーズで regression が検出される                                                      |
| 解決策     | Phase 3（TDD Red）の前に「設計前提整合確認チェックリスト」として①既存チャネル名との衝突なし、②preload allowlist への影響範囲確認、③既存テストの期待値（チャネル総数など）への影響確認の3点を実施してから、失敗テストを書く   |
| 標準ルール | TDD Red を開始する前に「設計前提整合確認」を Phase 3 の先行ステップとして実施し、影響範囲を文書化する                                                                                                                        |
| 関連タスク | UT-SDK-07-SHARED-IPC-CHANNEL-CONTRACT-001                                                                                                                                                                                    |

### 同種課題の簡潔解決手順（3ステップ）

1. shared パッケージ内テストでは `@repo/shared` エイリアスを使用せず相対パスでインポートする。
2. IPC チャネル追加前に既存の `channels.ts` を grep で確認し、命名規則（文字列形式 / TS定数名）のパターンを表に整理してから設計に着手する。
3. TDD Red Phase 前にチャネル追加による preload allowlist・既存テスト期待値への影響範囲を確認してから失敗テストを書く。

---

## TASK-UIUX-FEEDBACK-001 Phase 12 review 教訓（2026-03-31）

### L-UIUX-001: `spec_created` workflow に code draft が入っても completed に上げてはいけない

| 項目       | 内容                                                                                                                                                              |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 課題       | canonical root に script 実装が存在することを理由に workflow 全体を completed 扱いし、`artifacts.json` Phase 4-12 と Phase 12 summary が false green になっていた |
| 解決策     | code draft の存在と workflow state を分離し、`spec_created` を維持したまま current facts を記録する                                                               |
| 標準ルール | skill 実装差分があっても Phase 11 実測 evidence と close-out 条件が揃うまでは workflow を completed にしない                                                      |

### L-UIUX-002: placeholder screenshot は evidence ではなく blocker 情報

| 項目       | 内容                                                                                                                        |
| ---------- | --------------------------------------------------------------------------------------------------------------------------- |
| 課題       | `scaffold-placeholder.png` があるだけで screenshot coverage を満たしたように読める文書が残っていた                          |
| 解決策     | `phase11-capture-metadata.json` の `status: "not_run"` を正として、placeholder を actual capture の代替に使わないと明記した |
| 標準ルール | placeholder は「未実行の証跡」であり、「実行済みの証跡」ではない                                                            |

### L-UIUX-003: CLI 引数を prompt context に渡さないと評価結果が task 非依存になる

| 項目       | 内容                                                                                                                                |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| 課題       | `evaluate-ui-ux.js` が `--task-id` を受け取っても `evaluateUIWithClaude()` へ渡していなかったため、常にデフォルト文脈で評価していた |
| 解決策     | CLI 引数をそのまま `taskContext` として渡し、回帰テストを追加した                                                                   |
| 標準ルール | evaluator CLI は `argv` を parse したら prompt input まで到達していることをテストで保証する                                         |

---

## 2026-04-01 TASK-SC-DIALOG-MANDATORY-001 skill-creator 対話強制

### L-SC-DIALOG-001: 宣言型から命令型への転換で LLM の自律スキップを防ぐ

| 項目       | 内容                                                                                                                                                               |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 課題       | SKILL.md が「推奨する」「省略可」という宣言型記述だったため、Claude が詳細な要件があると判断した際に AskUserQuestion をスキップしてスキル生成を開始していた        |
| 解決策     | SKILL.md 冒頭に `## 必須：最初の実行ステップ` ブロックを命令型で追加（「最初のアクションは必ず AskUserQuestion」「ユーザーの回答なしに生成を開始してはならない」） |
| 標準ルール | LLM に特定のアクション順序を保証させたい場合は「〜が推奨」ではなく「最初のアクションは必ず〜」という命令型を使う。宣言型は自律判断の余地を残すため不適切           |
| 関連タスク | TASK-SC-DIALOG-MANDATORY-001                                                                                                                                       |

### L-SC-DIALOG-002: 実行ゲートパターン（ファイル読み込み直後にアクション強制）

| 項目       | 内容                                                                                                                                                                    |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 課題       | `discover-problem.md` を読み込んだ後、LLM が Phase 0-0 の質問を飛ばして次の Phase に進むケースがあった                                                                  |
| 解決策     | ファイル冒頭の「読み込み条件」ブロック直後に「⚠ 実行ゲート」ブロックを追加し、AskUserQuestion を強制実行させた。読み込みとアクション実行を一体化させた                  |
| 標準ルール | エージェント仕様書は「読んで終わり」にせず、読み込み直後に実行すべきアクションを強制するゲートブロックを置く。docs-only タスクでもコード変更なしに LLM 動作を制御できる |
| 関連タスク | TASK-SC-DIALOG-MANDATORY-001                                                                                                                                            |

### L-SC-DIALOG-003: graceful degradation で前提成果物欠損時のエラー停止を回避

| 項目       | 内容                                                                                                                                                          |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 課題       | `interview-user.md` が `problem-definition.json` 欠損時に「Phase 0-0 未完了エラー」で停止していたため、初回呼び出しやスキップしたユーザーがブロックされていた |
| 解決策     | 欠損時処理を「AskUserQuestion で問題定義を収集して作成する（エラー停止しない）」に変更。前提成果物がなくても対話的に補完できるようにした                      |
| 標準ルール | 前提成果物の欠損は fatal error ではなく「収集のトリガー」として扱う。happy path 以外からの呼び出しでも graceful に対応できる設計が望ましい                    |
| 関連タスク | TASK-SC-DIALOG-MANDATORY-001                                                                                                                                  |

---

## 2026-04-03 TASK-FIX-LIFECYCLE-PANEL-ERROR-001 handoff エラー保持パターン

### L-LIFECYCLE-EP-001: fire-and-forget IPC では後続スナップショットによるエラークリア防止が必要

| 項目       | 内容                                                                                                                                                          |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 課題       | `SKILL_CREATOR_WORKFLOW_STATE_CHANGED` が fire-and-forget で配信されると、エラー設定後の後続スナップショットで `setWorkflowError(null)` が呼ばれエラーが消える |
| 解決策     | `currentPhase === "handoff"` 単一条件で `setWorkflowError(null)` 呼び出しをガード。コメントに Issue 番号を明記 |
| 標準ルール | IPC fire-and-forget パターンを採用する場合、Renderer state のエラー保持を壊さないようスナップショット受信コールバックにフェーズ別ガードを設ける |
| 関連タスク | TASK-FIX-LIFECYCLE-PANEL-ERROR-001（Issue #1844）                                                                                                             |

### L-LIFECYCLE-EP-002: setupCallbackCapture パターンで IPC コールバックを確定的にテスト

| 項目       | 内容                                                                                                                                                    |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 課題       | IPC コールバック（`onWorkflowStateChanged`）は非同期イベントのため、テストで確定的に再現するのが難しい                                                   |
| 解決策     | `mockOnWorkflowStateChanged.mockImplementation(cb => { capturedCallback = cb; return () => {}; })` でコールバックをキャプチャし、`triggerCallback()` で任意のタイミングで呼び出す |
| 標準ルール | IPC コールバックのテストは `setupCallbackCapture()` パターンを使う。コンポーネントの `useEffect` 登録を経由するため `render` + `act` の組み合わせが必要 |
| 関連タスク | TASK-FIX-LIFECYCLE-PANEL-ERROR-001                                                                                                                      |

### L-LIFECYCLE-EP-003: NON_VISUAL 判定基準 — state 変更のみは自動テストで代替可能

| 項目       | 内容                                                                                                                                   |
| ---------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| 課題       | UI コンポーネントの変更でも state 管理のみの修正はスクリーンショットが不要だが、基準が曖昧で個別判断になっていた                       |
| 解決策     | 「React state レベルの変更のみで視覚的 UI 変化を伴わない場合は NON_VISUAL」と明示。自動テストで state 変更を完全検証できれば Phase 11 はスクリーンショット不要 |
| 標準ルール | `setXxx(null)` / `setXxx(value)` の呼び出し制御のみの修正は NON_VISUAL と判定する。UI 描画の変更を伴う場合のみスクリーンショットが必要 |
| 関連タスク | TASK-FIX-LIFECYCLE-PANEL-ERROR-001                                                                                                     |

---

## 2026-04-03 task-ut-p0-02-001-repeat-feedback-memory

### L-FEEDBACK-MEM-001: feedback memory 構造化による LLM 改善提案の多様性確保

| 項目       | 内容                                                                                                                                                                                              |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 課題       | `verifyAndImproveLoop()` の `previousImproveSummary: string` は直前1回分しか保持せず、3回ループ時に試行1の情報が試行3に伝わらないため、同一の修正提案が繰り返されるリスクがあった              |
| 解決策     | `ImproveFeedbackHistory[]` 型を `packages/shared` に定義し、各試行の `attempt` / `failedChecks` / `improveSummary` を蓄積。`buildImproveFeedback()` で全履歴をプロンプトに含め、繰り返し失敗チェックには特別警告を付与 |
| 標準ルール | LLM への改善フィードバックは「全試行履歴」を構造化して渡す。直前1回の要約のみを渡すパターンは避ける。persistent failure 検出（全試行で失敗し続けるチェック）は根本的アプローチ変更を促すプロンプトを含める |
| 関連タスク | task-ut-p0-02-001-repeat-feedback-memory                                                                                                                                                          |

### L-FEEDBACK-MEM-002: module-level 非 export 関数のテスト戦略 — 統合パス経由の検証

| 項目       | 内容                                                                                                                                                              |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 課題       | `buildImproveFeedback()` は module-level の非 export 関数であり、直接テストできない                                                                              |
| 解決策     | `verifyAndImproveLoop()` の統合パスを経由し、`sendChat` mock の呼び出し引数から `buildImproveFeedback()` の出力を検証する間接テスト戦略を採用                     |
| 標準ルール | module-level 非 export 関数は export を増やすのではなく、呼び出し元の統合テスト経由で mock 引数を検証する。テスト容易性のためだけに export を追加しない             |
| 関連タスク | task-ut-p0-02-001-repeat-feedback-memory                                                                                                                          |

---

## TASK-UT-RT-01 executeAsync エラーテストパターン（2026-04-06）

### L-EXECUTE-ASYNC-001: `vi.spyOn(facade, 'execute')` vs `executeMock`

- **教訓**: `skillExecutor.execute` をモック (`executeMock`) しても、`execute()` メソッド内で `SkillExecuteResult` に変換されるため、`errorResponse.error.message` が undefined になる
- **対策**: structured error パスのテストでは `vi.spyOn(facade, 'execute')` で `execute()` を直接モックし、`RuntimeSkillCreatorExecuteErrorResponse` を返すようにする
- **適用範囲**: executeAsync のエラーパスをテストする際の標準パターン
- **発見日**: 2026-04-06

### L-EXECUTE-ASYNC-002: `onWorkflowStateSnapshot` の複数呼び出しに対応した検証

- **教訓**: `workflowEngine.onPhaseChanged` と structured error パスの両方から `onWorkflowStateSnapshot` が呼ばれるため、`toHaveBeenCalledTimes(1)` は脆弱
- **対策**: `toHaveBeenCalledWith(...)` で特定引数の呼び出しを検証する方が robust
- **適用範囲**: onWorkflowStateSnapshot のコールバック検証テスト全般
- **発見日**: 2026-04-06

### L-EXECUTE-ASYNC-003: `snapshot ?? null` パターン

- **教訓**: `getWorkflowState()` は `SkillCreatorWorkflowUiSnapshot | undefined` を返す。型安全に `null` に変換するには `?? null` を使う
- **対策**: `|| null` ではなく `?? null` を使うことで falsy な値を誤変換しない
- **適用範囲**: undefined から null への型安全変換パターン全般
- **発見日**: 2026-04-06
