# Lessons Learned（current）2026-04 — Wizard / Integration

> 分割元: lessons-learned-current-2026-04.md
> 範囲: UT-RT-06-SKILL-STREAM-SKCE-TYPE-UNIFICATION 教訓（2026-04-04） 〜 UT-SKILL-WIZARD-W1-LIFECYCLE-PANEL-TRANSITION-001: SkillLifecyclePanel ウィザード遷移ボタン化

## UT-RT-06-SKILL-STREAM-SKCE-TYPE-UNIFICATION 教訓（2026-04-04）

### L-RT06-001: 共通基底型（SdkOutputMessageBase）によるlane統一パターン

| 項目       | 内容                                                                                                                              |
| ---------- | --------------------------------------------------------------------------------------------------------------------------------- |
| 課題       | 実行lane（`SkillStreamMessage`）とcreator lane（`SkillCreatorSdkEvent`）が独立した型定義を持ち、共通フィールドが重複していた      |
| 解決策     | `SdkOutputMessageBase`（`type: string; timestamp?: number`）を共通基底型として定義し、両laneの型が継承する形に統一した            |
| 標準ルール | lane間に共通フィールドが存在する場合は基底型を `packages/shared` に定義し、各lane型が継承するパターンを採用する                    |
| 関連タスク | UT-RT-06-SKILL-STREAM-SKCE-TYPE-UNIFICATION-001                                                                                   |

### L-RT06-002: @deprecated型エイリアスによる後方互換維持戦略

| 項目       | 内容                                                                                                                                       |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| 課題       | `SkillExecutor.ts` 内でローカル定義していた型を shared に移管する際、既存コードへの影響を最小化する必要があった                             |
| 解決策     | ローカル型を `/** @deprecated Use SkillExecutorStreamMessage from @repo/shared */` エイリアスとして残し、段階的移行を可能にした             |
| 標準ルール | shared 移管時は移管元ファイルに `@deprecated` エイリアスを一定期間残し、import の移行猶予期間を設ける                                       |
| 関連タスク | UT-RT-06-SKILL-STREAM-SKCE-TYPE-UNIFICATION-001                                                                                            |

### L-RT06-003: lane別timestamp必須性の差異（実行lane:必須、creator lane:省略可）

| 項目       | 内容                                                                                                                                  |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| 課題       | 基底型に `timestamp?: number` を定義すると実行laneの必須制約が失われ、型安全性が低下する問題が生じた                                  |
| 解決策     | 基底型では `timestamp?: number`（省略可）とし、`SkillExecutorStreamMessage` では `timestamp: number`（必須）にオーバーライドした       |
| 標準ルール | 基底型で省略可にしたプロパティを子型で必須にする場合は、子型定義で明示的に `required` に変更することで型安全を確保する               |
| 関連タスク | UT-RT-06-SKILL-STREAM-SKCE-TYPE-UNIFICATION-001                                                                                       |

### L-RT06-004: contextual sessionId伝播（init→後続イベント）

| 項目       | 内容                                                                                                                                        |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| 課題       | creator laneのストリームでは init イベントにのみ `sessionId` が含まれ、後続イベントでは `sessionId` が欠落するため、文脈追跡が困難だった    |
| 解決策     | ストリーム正規化ループ内で `sessionId` を contextual 変数として管理し、init 観測時に保存した値を後続イベントに自動的に伝播させた            |
| 標準ルール | session や correlation ID が一部のイベントにしか含まれないストリームでは、最初の観測値を contextual 変数で保持し後続イベントへ注入する        |
| 関連タスク | UT-RT-06-SKILL-STREAM-SKCE-TYPE-UNIFICATION-001                                                                                             |

---

## TASK-P0-05 execute→SkillFileWriter persist 統合 教訓（2026-04-05）

### L-P005-001: LLMAdapter Setter Injection パターン（非同期DI）

| 項目       | 内容                                                                                                                                                             |
| ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 課題       | `RuntimeSkillCreatorFacade` の constructor 時点では LLMAdapter が未初期化であり、constructor injection では DI できなかった                                      |
| 解決策     | Setter Injection（P34 準拠）パターンを採用し、`setLlmAdapter()` で非同期初期化完了後に遅延注入する設計とした                                                      |
| 標準ルール | 非同期初期化が必要な依存は Setter Injection で注入し、public メソッドの先頭で adapter 有無を検査して structured error を返却する                                   |
| 関連タスク | TASK-P0-05                                                                                                                                                       |

### L-P005-002: 二重パイプライン（A経路/B経路）の併存管理

| 項目       | 内容                                                                                                                                                                                                         |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 課題       | A経路（Facade.execute() → parseLlmResponseToContent → SkillFileWriter.persist）と B経路（OutputHandler.handleSessionComplete → SkillRegistry）が同一スキル生成を異なるタイミングで処理し、競合リスクがあった |
| 解決策     | A経路は executeResult に `persistResult`/`persistError` を返し、B経路は SkillRegistry へのインメモリ登録に責務を限定することで、ファイル書き込みとレジストリ登録を分離した                                     |
| 標準ルール | 同一成果物に対して複数パイプラインが存在する場合、各経路の責務（persist vs registry）を明確に分離し、executeResult 型に経路別の結果フィールドを持たせる                                                       |
| 関連タスク | TASK-P0-05                                                                                                                                                                                                   |

### L-P005-003: verify→improve→re-verify ループの再試行戦略

| 項目       | 内容                                                                                                                                                             |
| ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 課題       | verify 結果が不合格の場合に improve→re-verify を繰り返すループで、再試行回数と終了条件の設計が必要だった                                                          |
| 解決策     | ループ内で verify→improve→re-verify の各ステップを逐次実行し、成功または最大再試行回数到達で終了する戦略を採用した                                                 |
| 標準ルール | 再試行ループは最大回数を設定し、各イテレーションの結果を executeResult に累積記録することで、失敗時の原因追跡を可能にする                                           |
| 関連タスク | TASK-P0-05                                                                                                                                                       |

### L-P005-004: パストラバーサル対策の多層防御

| 項目       | 内容                                                                                                                                                             |
| ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 課題       | skillName に `../malicious` や `dir/subdir` 等のパストラバーサル攻撃パターンが渡される可能性があった                                                               |
| 解決策     | `SkillCreatorOutputHandler.toSlug()` でスキル名を安全な slug に変換し、`SkillFileWriter.persist()` で `PATH_TRAVERSAL` エラーコードによるバリデーションを実施、さらにロールバック機能で部分書き込み時の一貫性を保証する多層防御を実装した |
| 標準ルール | ファイルパス生成時は (1) slug 変換、(2) パスバリデーション（PATH_TRAVERSAL 検出）、(3) 部分書き込みロールバックの 3 層で防御する                                    |
| 関連タスク | TASK-P0-05                                                                                                                                                       |

---

## TASK-P0-07 ハードコード AGENT_NAMES の動的解決 教訓（2026-04-06）

### L-P007-001: manifest 不在 vs 破損の validation boundary

| 項目       | 内容                                                                                                                                                             |
| ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 課題       | manifest ファイルが存在しない場合と、manifest が破損している・phase が不在・resourceIds が空の場合を同じ fallback で処理すると、silent regression が発生した      |
| 解決策     | manifest **不在**のみ static fallback（`PLAN_RESOURCE_REQUESTS`/`IMPROVE_RESOURCE_REQUESTS`）を使用し、**破損・phase 不在・resourceIds 空**は `VALIDATION_ERROR` を返す boundary を明確化した |
| 標準ルール | fallback と error の境界は「ファイルが存在しない＝正常な初期状態」vs「ファイルが不正＝設定ミス」で引く。silent fallback は設定ミスを隠蔽するため error に変える  |
| 関連タスク | TASK-P0-07                                                                                                                                                       |

### L-P007-002: resolver/planner/facade の責務分離

| 項目       | 内容                                                                                                                                                             |
| ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 課題       | `RuntimeSkillCreatorFacade.resolveOperationResources()` が root 収集・dedupe・resource 計画の全責務を持っていた                                                   |
| 解決策     | root 収集と dedupe は `SkillCreatorSourceResolver` に、resource 計画は `PhaseResourcePlanner` に分離し、Facade は消費者として両者を組み合わせる設計とした          |
| 標準ルール | 動的解決パイプラインは「収集・整理・計画・実行」の各ステップを独立クラスに分離する。Facade は組み合わせのみを担い、アルゴリズムは各クラスに閉じ込める              |
| 関連タスク | TASK-P0-07                                                                                                                                                       |

### L-P007-003: plan/improve 両方に同じルールを適用する一貫性

| 項目       | 内容                                                                                                                                                             |
| ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 課題       | plan の manifest 優先解決を実装した際、improve 側への同等の対応を後回しにしたため、2 ルートの動作が非対称になるリスクがあった                                     |
| 解決策     | plan と improve で同じ `PhaseResourceRequest` モデルと `resolveOperationResources()` シグネチャを使用し、phase ごとの差異は `fallbackRequests` 引数でのみ表現した |
| 標準ルール | 複数の operation（plan/improve/verify など）に同じルールを適用する場合は、共通ロジックを単一メソッドに集約し、operation 固有の差異のみを引数で表現する            |
| 関連タスク | TASK-P0-07                                                                                                                                                       |

---

## TASK-SDK-04-U1-F1 先行完了パターン教訓（2026-04-06）

### L-PRE-001: 親タスク実装波での先行完了を Phase 1 P50チェックで検出する

- **状況**: TASK-SDK-04-U1-F1 は `createVerificationReviewRequest()` の `kind: "free_text"` → `"single_select"` 変更タスクだったが、Phase 1 調査時に TASK-SDK-04-U1 の実装波で既に `kind: "single_select"` に変更済みであることが判明した。
- **影響**: Phase 4 の Red テストが no-op になり、「Red を作ってから Green にする」の TDD サイクルが成立しなかった。
- **解決策**: 先行実装を検出したら「テスト整合モード」に切り替える。既存テストは TC-MOD で整合し、新規検証は TC-NEW / TC-ADD で追加する（赤→青を強要しない）。
- **再発防止**: Phase 1 の P50チェックで `grep -rn "single_select\|kind:" <target-file>` を実行し、実装状況を先に確認する。コードと仕様書のステータスが乖離していることを前提に調査を始める。
- **関連**: `task-specification-creator` SKILL.md の `[Feedback SDK-04-U1-F1]` ピットフォールも参照。

---

## TASK-FIX-IPC-SKILL-NAME-001 教訓（2026-04-06）

### L-IPC-DUP-001: `ipcMain.handle()` 重複登録による後続ハンドラ全停止

- **状況**: `registerRuntimeSkillCreatorHandlers()` で同一チャネル `SKILL_CREATOR_GET_ADAPTER_STATUS` が 2 回 `ipcMain.handle()` 登録されていた。
- **影響**: 2 回目の登録時に Electron が例外を投げ、後続 14 個のハンドラが全て未登録になった。
- **解決策**: 重複ブロック（約 35 行）を削除し、登録数を 16 に正規化。
- **再発防止**: `unregisterRuntimeSkillCreatorHandlers()` で同数の `removeHandler()` を対称実装。CI スナップショットテスト追加を follow-up（UT-FIX-IPC-REGISTRATION-COMPLETENESS-CI-001）として登録。

### L-IPC-DUP-002: `toWizardSkillName()` 正規化5ステップとフォールバック設計

- **状況**: スキル名の自動生成時に日本語・記号・空文字が渡されると、無効な名前（空文字・連続ハイフン等）が生成されていた。
- **解決策**: 以下の順序で正規化: (1)先頭50文字+trim、(2)小文字化、(3)非許容文字→ハイフン、(4)連続ハイフン圧縮、(5)先頭末尾ハイフン除去、(6)空文字→"new-skill"フォールバック。
- **ポイント**: `resolveUniqueSkillName()` と組み合わせることで `new-skill-2` / `new-skill-3` と衝突回避も実現。

### L-IPC-DUP-003: スキル名バリデーション定数の分散リスク

- **状況**: `SkillService.ts` と `init_skill.js` が同型の正規表現 `/^[a-z0-9]+(-[a-z0-9]+)*$/` を個別に保持。
- **判断**: 今回の Bug Fix はスコープ最小化のため定数一元化を行わなかった。
- **follow-up**: `UT-FIX-IPC-SKILL-NAME-PATTERN-CENTRALIZATION-001` として未タスク登録済み。

---

## UT-SDK-07-APPROVAL-REQUEST-SURFACE-001 教訓（2026-04-06）

### L-APPROVAL-SURFACE-001: onApprovalRequest cleanup の useEffect 登録パターン

- **苦戦箇所**: cleanup 関数を返すリスナー登録は useEffect の return 値として必ず設定しないと、アンマウント後に approval event が届き続ける
- **解決**: `useEffect(() => { const cleanup = api.onApprovalRequest(...); return cleanup; }, [api])` パターンで登録
- **適用**: Renderer 側の onEvent listener を持つコンポーネント全般


## UT-HEALTH-POLICY-MAINLINE-MIGRATION-001 shared policy 移管 教訓（2026-04-08）

### L-HP-001: async hook テストは renderHook 後に 1 ティック待つ

| 項目       | 内容                                                                                                                                                                         |
| ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 症状       | `renderHook(() => useMainlineExecutionAccess())` 直後にアサートすると `act(...)` 警告が出る                                                                                   |
| 原因       | async state update が即座に反映されず、テストが非同期更新を待たない                                                                                                          |
| 解決策     | `await act(async () => { await new Promise(r => setTimeout(r, 0)); })` を renderHook 後に挟む、または flush helper を共通化する                                              |
| 再発防止   | async な hook テストは `renderAccessHook` のような flush 済み wrapper を用意し、個別テストで都度 act を書かない                                                              |
| 関連タスク | UT-HEALTH-POLICY-MAINLINE-MIGRATION-001                                                                                                                                      |

### L-HP-002: shared 側正本への純粋関数集約でフック責務が薄くなる

| 項目       | 内容                                                                                                                                                                          |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 症状       | hook 内に独自の `apiKeyDegraded` 計算ロジックが重複し、同じ条件が別ファイルで異なる計算式になるリスクがあった                                                                  |
| 原因       | HealthPolicy の集約場所が shared になかったため、各 hook が独自に計算していた                                                                                                 |
| 解決策     | `resolveHealthPolicy()` を `packages/shared/src/types/health-policy.ts` に純粋関数として実装し、hook は呼び出すだけにする                                                    |
| 再発防止   | ドメインルールは shared 側に集約し、hook 側は UI 状態のマッピングだけを持つ。重複計算は将来的な不整合の温床になるため early に集約する                                        |
| 関連タスク | UT-HEALTH-POLICY-MAINLINE-MIGRATION-001                                                                                                                                       |

### L-HP-003: Phase 12 成果物の canonical ファイル名は task 開始時に確定する

| 項目       | 内容                                                                                                                                                                          |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 症状       | `outputs/phase-12/` に前タスクの draft と今回の canonical が混在し、どちらが正本か判断に迷った                                                                                |
| 原因       | Phase 12 着手前にファイル名の canonical set を確定していなかった                                                                                                              |
| 解決策     | Phase 12 着手時に `outputs/phase-12/` の既存ファイルを棚卸しし、今回出力する canonical 名（`implementation-guide.md` / `system-spec-update.md` / `documentation-changelog.md` / `untasked-detection-report.md` / `skill-feedback-report.md` / `phase12-task-spec-compliance-check.md`）を先に決める |
| 再発防止   | Phase 12 着手時の初手チェックとして「`outputs/phase-12/` の canonical ファイル名の確定」を明示する。`index.md` と `artifacts.json` の status 同期も同一 wave で行う           |
| 関連タスク | UT-HEALTH-POLICY-MAINLINE-MIGRATION-001                                                                                                                                       |

---

## TASK-FIX-WORKTREE-CONFLICT-001: 並列 worktree コンフリクト解消

### L-WC-001: merge 戦略はファイルの「情報の性質」で決める

| 項目 | 内容 |
|------|------|
| 症状 | 50〜60本の並列 worktree ブランチが `.claude/skills/` 配下を更新するとマージコンフリクトが頻発 |
| 原因 | 追記型テキスト（LOGS.md）・JSON 構造体（EVALS.json）・自動生成ファイル（indexes/*.json）・静的仕様（SKILL.md）が同じ merge 戦略で扱われていた |
| 解決策 | 追記型 → `merge=union`、JSON 構造・自動生成 → `merge=ours` + post-merge 再生成、静的仕様 → 変更履歴を別ファイルに分離して `merge=union` |
| 再発防止 | 新しいファイルを `.gitattributes` に追加する際は「追記型か・構造化データか・自動生成か・静的仕様か」を最初に判断する |
| 関連タスク | TASK-FIX-WORKTREE-CONFLICT-001 |

### L-WC-002: シェルスクリプトの外部コマンドは `command -v` で存在確認する

| 項目 | 内容 |
|------|------|
| 症状 | `set -euo pipefail` 環境で `node: command not found` → 終了コード 127 でフックが失敗 |
| 原因 | `[ -f "$SCRIPT" ]` でスクリプト存在確認はしていたが、`node` コマンド自体の存在確認がなかった |
| 解決策 | `command -v node > /dev/null 2>&1 &&` を条件に追加し、node 不在時は正常終了 |
| 再発防止 | `set -euo pipefail` 環境では外部コマンドの呼び出し前に必ず `command -v <cmd>` で存在確認する |
| 関連タスク | TASK-FIX-WORKTREE-CONFLICT-001 |

### L-WC-003: husky を使うプロジェクトでは git フックパスが `.husky/_/` になる

| 項目 | 内容 |
|------|------|
| 症状 | `git rev-parse --git-path hooks/post-merge` が `.git/hooks/post-merge` ではなく `.husky/_/post-merge` を返す |
| 原因 | プロジェクトが husky を使用しており、`core.hooksPath=.husky/_` が設定されている |
| 解決策 | `git rev-parse --git-path hooks/post-merge` の返り値をそのままインストール先として使う（パスを決め打ちしない） |
| 再発防止 | フックのインストール先は常に `git rev-parse --git-path hooks/<hook-name>` で動的に解決する |
| 関連タスク | TASK-FIX-WORKTREE-CONFLICT-001 |

---

## UT-SKILL-WIZARD-W0-RUNTIME-VALIDATION-001 教訓（2026-04-08）

### L-RV-001: テスト文字列の実文字数を必ず数えて確認する

| 項目       | 内容                                                                                                                                                         |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 症状       | EC-09 で `"十文字以上の目的"` を「10文字以上の目的文字列」として使い、minLength バリデーションが通過してしまうはずが実際にはテスト失敗した                     |
| 原因       | `"十文字以上の目的"` は日本語7文字であり、minLength: 10 の条件を満たさなかった。目視で「十文字以上と書いてあるから10文字以上だろう」と誤認したため              |
| 解決策     | テスト文字列を書く前に `"...".length` で実文字数を確認する。日本語の場合、漢数字表記の意味と実際の文字数は別物                                                |
| 再発防止   | minLength / maxLength を境界にするテストケースは、文字列の実 `.length` 値を先にコメントとして記載してからテストを書く                                        |
| 関連タスク | UT-SKILL-WIZARD-W0-RUNTIME-VALIDATION-001                                                                                                                   |

### L-RV-002: pure function バリデーションは Zod なしでも型安全を達成できる

| 項目       | 内容                                                                                                                                                         |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 設計判断   | `validateSkillName` / `validatePurpose` / `validateSkillInfoForm` を Zod スキーマではなく TypeScript 純粋関数として実装した                                   |
| 利点       | ① `packages/shared` への Zod 依存追加なし ② 戻り値型（`SkillInfoFieldValidationResult` / `SkillInfoFormValidationResult`）が明示的で、呼び出し元の型推論が効く ③ テストが純粋な入出力検証で完結し、スキーマ定義とのズレが発生しない |
| 適用条件   | バリデーションルールが「文字数制限」「空白チェック」程度のシンプルなケースに有効。複雑な依存検証が必要な場合は Zod の方が保守性が高い                          |
| 関連タスク | UT-SKILL-WIZARD-W0-RUNTIME-VALIDATION-001                                                                                                                   |

---

## UT-SKILL-WIZARD-W1-CONVERSATION-ROUND-STEP-001 教訓（2026-04-08）

### L-CRS-001: ConversationRoundStep semantic デフォルト正規化の設計的分散

| 項目       | 内容                                                                                                                                                                                                                                         |
| ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 課題       | `normalizeSelectedOption()` の switch 文が q1/q3/q5/q6 の 4 ケースに分散しており、新しい `SmartDefaultResult` フィールドを追加する際に「型定義（`ConversationAnswers`）」「マッピング（`QUESTION_OPTION_VALUES`）」「switch 文」の 3 箇所を同時更新する必要がある |
| 再発条件   | SmartDefaultResult のフィールドが増えるたびに normalizeSelectedOption の switch 文に新ケースを追加し忘れると、新フィールドのデフォルト値が正規化されずに raw 値のままUIラベルとして表示される                                                   |
| 解決策     | 将来的には `SEMANTIC_LABEL_MAP: Record<QuestionKey, Record<string, string>>` のような宣言的マッピングテーブルに集約することで更新箇所を 1 箇所に削減できる。現在の switch 文は各 QuestionKey に対応するマッピングを 1 オブジェクトに統一する形にリファクタリング可能 |
| 標準ルール | semantic デフォルト正規化ロジックは宣言的テーブルで管理し、新フィールド追加時はテーブル 1 箇所の更新で完結するよう設計する                                                                                                                      |
| 関連タスク | UT-SKILL-WIZARD-W1-CONVERSATION-ROUND-STEP-001                                                                                                                                                                                               |
| 対象ファイル | `apps/desktop/src/renderer/components/skill/wizard/ConversationRoundStep.tsx`                                                                                                                                                               |

### L-CRS-002: worktree と main ブランチの仕様書ステータス同期不整合

| 項目       | 内容                                                                                                                                                                                                                           |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 課題       | main ブランチで完了済みのタスク（`ut-health-policy-runtime-injection`）の spec files が worktree 内に `spec_created` ステータスのまま残留した。worktree が別タスク専用に切られた際に main 側の完了状態が worktree に反映されないことが原因 |
| 再発条件   | worktree 作成後に main 側でタスクが完了し `docs/30-workflows/` から spec が削除・移動された場合、worktree では依然として旧 spec が存在し続ける                                                                                    |
| 解決策     | worktree 作成時（または作業開始時）に `docs/30-workflows/` の仕様書ステータスを `git diff main -- docs/30-workflows/` で main と照合する。main 側で削除済みの spec は worktree からも削除またはアーカイブへ移動する              |
| 標準ルール | worktree 独立性を保ちつつ、Phase 1 のタスク開始時チェックとして「main ブランチでの完了済み spec の残留がないか」を確認する手順を追加する                                                                                          |
| 関連タスク | UT-SKILL-WIZARD-W1-CONVERSATION-ROUND-STEP-001                                                                                                                                                                                  |
| 関連削除   | `docs/30-workflows/ut-health-policy-runtime-injection/` 削除（worktree 内残留解消）                                                                                                                                             |

---

## W0-seq-02 SmartDefault推論サービス実装 教訓（2026-04-08）

### L-SMART-DEFAULT-001: inferSmartDefaults の三軸推論設計

- **苦戦箇所**: Slack / GitHub / Notion を判定するツール推論・タイミング推論・フォーマット推論の3軸が混在すると、テストケースの責務が不明確になる。
- **解決策**: `inferSmartDefaults()` を「ツール推論 → タイミング推論 → フォーマット推論」の順で直列パイプラインとし、各軸の推論を独立した private 関数に分離した。ユニットテスト33件はすべて軸単位のアサーション。
- **標準ルール**: 複数軸の推論を持つサービスは、軸ごとに private 関数を切り出し、統合関数はパイプライン呼び出しのみにする。テストは軸ごとに分割して責務を明確化する。
- **関連タスク**: W0-seq-02, UT-SKILL-WIZARD-W0-SMART-DEFAULT-REASONING-001

### L-SMART-DEFAULT-002: SmartDefaultResult / SkillInfoFormData の root export 追加

- **状況**: `packages/shared/src/index.ts` への export 追加を後回しにしたため、renderer 側 import がコンパイルエラーになった。
- **解決策**: 共有型は実装と同ターンで `src/index.ts` に export する。
- **再発防止**: shared パッケージに新型を追加する際は Phase 2 設計成果物に root export 追加を必須 checklist として入れる。

---

## UT-HEALTH-POLICY-RUNTIME-INJECTION-001 healthPolicy DI注入 教訓（2026-04-08）

### L-HEALTH-DI-001: RuntimeSkillCreatorFacade への optional DI 追加パターン

- **苦戦箇所**: `RuntimeSkillCreatorFacade` のコンストラクタに `healthPolicy?: HealthPolicy` を追加する際、既存のテストが引数順序の変更で全壊するリスクがあった。
- **解決策**: 末尾 optional 引数として追加し、`RuntimePolicyResolver` の第3引数へ接続。既存テストは無変更で PASS。
- **標準ルール**: Facade への DI 追加は末尾 optional パラメータ優先。引数順序が固定された既存テストを壊さずに拡張できる。
- **関連タスク**: UT-HEALTH-POLICY-RUNTIME-INJECTION-001

### L-HEALTH-DI-002: improve/plan 両テストへの対称適用

- **状況**: `RuntimeSkillCreatorFacade.improve.test.ts` にのみ healthPolicy テストを追加し、`plan.test.ts` への対称追加を後回しにした。
- **教訓**: DI 対象が複数の operation（plan/improve）を持つ場合、同一ターンで両方のテストを更新しないと非対称状態が残る。

---

## W1-par-02a SkillInfoStep実装（DescribeStep再設計）教訓（2026-04-08）

### L-SKILL-INFO-STEP-001: DescribeStep → SkillInfoStep の破壊的改名理由

- **背景**: `DescribeStep` はウィザード Step 0 の役割を「説明入力」に限定した命名だったが、実際には skill名・カテゴリ・タグ等の複合情報入力フォームへと要件が拡張された。
- **解決策**: `SkillInfoStep` に改名し、フォームフィールドを `SkillInfoFormData` 型で一元管理。スクリーンショット証跡 TC-01〜TC-08 で UI 検証を実施。
- **標準ルール**: ウィザード Step コンポーネントの命名は「操作動詞（Describe）」ではなく「対象ドメイン（SkillInfo）」ベースにする。拡張時の改名コストを下げるため。
- **関連タスク**: W1-par-02a, UT-SKILL-WIZARD-W1-par-02a

### L-SKILL-INFO-STEP-002: arch-state-management-skill-creator.md の current facts 是正

- **状況**: `arch-state-management-skill-creator.md` に `generationMode` の古い記述と DescribeStep への参照が残り、仕様書と実装が乖離していた。
- **解決策**: 同ターンで `SkillInfoStep` への参照に更新し、current facts として是正。
- **再発防止**: コンポーネント改名時は arch-state-management 系ドキュメントを必ず同ターンで更新する。

---

## UT-SKILL-WIZARD-W2-seq-03b wizard exports 教訓（2026-04-08）

### L-WIZARD-EXPORT-001: barrel export の「今回の差分」と「既に廃止済み」を分けて記録する

- **苦戦箇所**: `wizard/index.ts` の export 整理で、`DescribeStep` の削除と `ConfigureStep` 系の既廃止を同じ粒度で書くと、実差分と履歴が混ざって見える。
- **解決策**: current diff では実際に変更した `DescribeStep` / `DescribeStepProps` と `SkillInfoStepProps` だけを明示し、`ConfigureStep` 系は「既に削除済み」と注記する。
- **標準ルール**: barrel export の記録は「今回の差分」「既存の廃止済み」「維持エクスポート」を分けて書き、実コードとの差分を 1 対 1 にする。

### L-WIZARD-EXPORT-002: NON_VISUAL の証跡は actual test case と no-op 記録を一致させる

- **苦戦箇所**: Phase 11 の証跡で、実際の 13 テスト内容と `@deprecated` JSDoc などの未検証項目が混ざると、再現時に証跡の信頼性が落ちる。
- **解決策**: 手動テスト結果・証跡インデックス・スクリーンショット計画を同じ語彙に揃え、UI 変更がない場合は `no-op` と明示する。
- **標準ルール**: NON_VISUAL タスクでは、screenshot を「不要」と書くだけでなく、代替証跡とテスト名を完全一致させる。

---

## Google Calendar スキル新規追加 教訓（2026-04-08）

### L-GOOGLE-CAL-001: サービスアカウント + Slack Webhook の複合認証設計

- **苦戦箇所**: Google Calendar API（サービスアカウント認証）と Slack API（Webhook URL）の2種類の認証方式を1スキルで管理する際、環境変数の命名規則と設定ガイドを分離しないと混乱が生じた。
- **解決策**: `references/google-calendar-setup.md` と `references/slack-setup.md` を別ファイルに分離し、各認証の設定手順を独立管理。`scripts/setup_check.js` で Phase 1 の環境確認を自動化した。
- **標準ルール**: 複数外部サービスを扱うスキルは、サービスごとに setup ガイドを別ファイルに分離する。単一 README に混在させない。

### L-GOOGLE-CAL-002: googleapis パッケージの pnpm workspace 配置

- **状況**: `googleapis ^144.0.0` を `.claude/skills/google/package.json` に配置したが、workspace の pnpm に認識されるか確認が必要だった。
- **解決策**: スキルディレクトリを独立 package として扱い、`node_modules` は `scripts/` 実行時に `pnpm install` で解決する設計とした。
- **適用**: Claude Code スキルでのみ使う外部 npm パッケージは、スキルディレクトリ直下の `package.json` に閉じ込める。

---

## UT-SKILL-WIZARD-W1-LIFECYCLE-PANEL-TRANSITION-001: SkillLifecyclePanel ウィザード遷移ボタン化

### L-WIZARD-001: 固定値プロンプトによる実行フロー安定化

| 項目       | 内容 |
| ---------- | ---- |
| 症状       | UIのtextarea入力に依存した実行フローで、入力値の存在確認ロジックが複雑化していた |
| 原因       | `executionPrompt` stateを通じた自由入力を許可していたため、`canExecuteSkill`判定が3条件以上に肥大化 |
| 解決策     | `defaultExecutionPrompt`定数を導入し、UIからの入力を排除。`canExecuteSkill`を「アダプター正常・スキル選択済み・実行中でない」の3条件に簡約化 |
| 再発防止   | スキル実行フローの「入力値」は定数化を検討する。UIに入力欄を設けると条件分岐が増えるため、UIとロジックを早期に分離する |
| 関連タスク | UT-SKILL-WIZARD-W1-LIFECYCLE-PANEL-TRANSITION-001 |

### L-WIZARD-002: 責務別props分離パターン（ウィザード・スキル・設定の導線分離）

| 項目       | 内容 |
| ---------- | ---- |
| 症状       | 画面遷移の導線が1つのcallbackに混在しそうになっていた |
| 原因       | `onOpenWizard` / `onOpenSkillWizard` / `onOpenSettings` を同一propsにまとめようとしていた |
| 解決策     | 導線の責務ごとにpropsを分離。`onOpenWizard`（新規スキル作成）、`onOpenSkillWizard`（既存スキルウィザード）、`onOpenSettings`（設定画面）を独立したpropとして定義 |
| 再発防止   | 複数の画面遷移が必要なコンポーネントは、遷移先の「責務」ごとにpropsを分割する。1つのcallbackで分岐するとテスタビリティが下がる |
| 関連タスク | UT-SKILL-WIZARD-W1-LIFECYCLE-PANEL-TRANSITION-001 |

### L-WIZARD-003: 部分完了タスクの引き継ぎ管理

| 項目       | 内容 |
| ---------- | ---- |
| 症状       | 前タスク(PR#2036)で実装済みの要素（`skill-lifecycle-request-input`削除、ウィザードボタン追加）と、今タスクの新規作業（`skill-lifecycle-execution-input`削除）が混在し、Phase 1の現状分析が複雑化 |
| 原因       | タスク分割時に「前タスクのcarry-over要素」を明示するセクションがPhase 1にない |
| 解決策     | Phase 1の要件定義着手前に「前タスクのcurrent facts」を棚卸しし、今タスクで新規実施する作業との差異を明確化する |
| 再発防止   | Phase 1 requirement definitionに「前タスクcarry-over確認」セクションを追加する。`git log --oneline -5`と`current code`の照合を初手で行う |
| 関連タスク | UT-SKILL-WIZARD-W1-LIFECYCLE-PANEL-TRANSITION-001 |

### L-WIZARD-004: describe.skip内の旧testid参照残存リスク

| 項目       | 内容 |
| ---------- | ---- |
| 症状       | `llm-generation.test.tsx` と `auth-regression.test.tsx` の `describe.skip` ブロック内に、削除済みtestid `skill-lifecycle-request-input` が残存 |
| 原因       | UIコンポーネントのtestidを変更・削除した際、`skip`されているテストファイルへの影響確認を省略していた |
| 解決策     | testid削除時は`grep -r "testid名" --include="*.test.*"`で全テストファイルを検索し、skipブロック内の参照も確認する |
| 再発防止   | Phase 12準拠チェックに「削除したtestidがskipブロック内に残っていないか確認」を追加する。残存している場合はcleanupタスクをbacklogに登録する |
| 関連タスク | UT-SKILL-WIZARD-W1-LIFECYCLE-PANEL-TRANSITION-001 |
> 注記（2026-04-08 分離）:
> - UT-HEALTH-POLICY-MAINLINE-MIGRATION-001 教訓（L-HP-001/002/003）と TASK-FIX-WORKTREE-CONFLICT-001 教訓（L-WC-001/002/003）は [lessons-learned-health-policy-worktree-2026-04.md](lessons-learned-health-policy-worktree-2026-04.md) へ移動しました。
> - スキルウィザード関連教訓（L-CRS-001/002, L-SMART-DEFAULT-001/002, L-HEALTH-DI-001/002, L-SKILL-INFO-STEP-001/002, L-WIZARD-EXPORT-001/002, L-GOOGLE-CAL-001/002）は [lessons-learned-skill-wizard-redesign.md](lessons-learned-skill-wizard-redesign.md) へ移動しました。
> - W3-seq-04 使用率計装教訓（L-W3-TRACK-001/002, L-WIZARD-LANE-CLEANUP-001）は [lessons-learned-w3-usage-tracking-2026-04.md](lessons-learned-w3-usage-tracking-2026-04.md) へ移動しました。

---
