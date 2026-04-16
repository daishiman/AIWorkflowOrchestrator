# Lessons Learned（current）2026-04 — State / Mode Management

> 分割元: lessons-learned-current-2026-04.md
> 範囲: TASK-CRON-SEMANTIC-VALIDATION-001 教訓（2026-04-12） 〜 TASK-SW-FIX-MODE-MGMT-001 スキルウィザード mode 管理廃止 教訓（2026-04-14）

## TASK-CRON-SEMANTIC-VALIDATION-001 教訓（2026-04-12）

### L-CRON-SV-001: 段階的バリデーションパターン（2026-04-12）

**タスク**: TASK-CRON-SEMANTIC-VALIDATION-001

cronExpression のバリデーションは3段階（syntax → range → semantics）に分離すると保守性が高い。
各ステージを独立した関数として実装し、Stage 3（意味論）は内部ユーティリティ関数として隠蔽する。

| 項目       | 内容                                                                                           |
| ---------- | ---------------------------------------------------------------------------------------------- |
| 知見       | 3段階（syntax→range→semantics）分離パターンはcron式検証の標準化に有効                          |
| 注意点     | 2月29日は有効（閏年非依存）/ 複合フィールドはStage 2委譲 / `validateCronSemantics`はexport不可 |
| 適用場面   | 他のバリデーター実装時にこの3段階パターンを参考にすること                                      |
| 関連タスク | TASK-CRON-SEMANTIC-VALIDATION-001                                                              |

### L-CRON-SV-002: 2月29日許容の設計意図（2026-04-12）

**タスク**: TASK-CRON-SEMANTIC-VALIDATION-001

| 項目       | 内容                                                                                                            |
| ---------- | --------------------------------------------------------------------------------------------------------------- |
| 課題       | cron式の「29 _ 2 _ \*」（2月29日）が閏年にしか存在しないため、バリデーション時の有効/無効判断が曖昧になりやすい |
| 解決策     | cron式は年を指定しないため、2月29日は「いずれ閏年で実行される可能性がある」として有効扱いとする設計判断を明文化 |
| 標準ルール | `MAX_DAYS_PER_MONTH[2] = 29` と明示し、2月29日を検出しない（有効とする）設計意図をコード内コメントに記す        |
| 関連タスク | TASK-CRON-SEMANTIC-VALIDATION-001                                                                               |

### L-CRON-SV-003: 内部ユーティリティ関数の隠蔽原則（2026-04-12）

**タスク**: TASK-CRON-SEMANTIC-VALIDATION-001

| 項目       | 内容                                                                                                                                       |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| 課題       | Stage 3（意味論チェック）の実装関数 `validateCronSemantics` を export すると、外部から直接呼び出されて将来のリファクタリング自由度が下がる |
| 解決策     | `validateCronSemantics` は同ファイル内の内部関数として定義し、export しない。`validateCronExpression` のみを公開 API とする                |
| 標準ルール | バリデーター内部の段階ごとの実装関数は原則 export 不可。公開 API は最上位の `validateXxx` 関数に一本化する                                 |
| 関連タスク | TASK-CRON-SEMANTIC-VALIDATION-001                                                                                                          |


## TASK-SW-FIX-MODE-MGMT-001: SkillCreateWizard LLM専用化・状態管理修正 教訓（2026-04-13）

### L-MODEMGMT-001: 二重状態管理フラグの危険性（generationMode + hasActivatedLlmMode）

| 項目       | 内容                                                                                                                                                                                       |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 症状       | `generationMode: "template" \| "llm"` と `hasActivatedLlmMode: boolean` の2フラグが同期必要な状態だったため、「LLMモードを選択したのに Step 1 がスキップされる」バグの根本原因になっていた |
| 原因       | 複数のフラグが独立したstateとして存在し、片方だけ更新するコードパスが許容されていた                                                                                                        |
| 解決策     | `generationMode` を削除してLLM専用に一本化し、`hasActivatedLlmMode` も同時に廃止。フロー分岐フラグは単一 state で管理し、派生値が必要な場合は `useMemo` で同期的に派生させる               |
| 設計原則   | ウィザード全体に影響する分岐フラグはオーケストレーターコンポーネント（SkillCreateWizard）に1本だけ置く。追加的なフラグ（`has*`）は state 増加ではなく `useMemo` 派生で表現する             |
| 関連タスク | TASK-SW-FIX-MODE-MGMT-001                                                                                                                                                                  |

### L-MODEMGMT-002: TDD Red→Green サイクルによるバグ箇所の特定

| 項目         | 内容                                                                                                                                                          |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 課題         | ウィザードの step 遷移ロジックはブラックボックスになりがちで、どの条件で Step 1 がスキップされるかを静的解析だけで特定するのが難しかった                      |
| 解決策       | Phase 4 でテストを先に書き、「Step 0→Step 2 への直接遷移」というバグを Red テストとして再現した後、Phase 5 で Green にする実装経路を特定した                  |
| 将来への知見 | 複雑な step 遷移ロジックを持つウィザードコンポーネントの修正は、まず「壊れた振る舞い」をテストで再現（Red）してから実装修正（Green）する TDD 戦略が最も効率的 |
| 関連タスク   | TASK-SW-FIX-MODE-MGMT-001                                                                                                                                     |

### L-MODEMGMT-003: happy-dom 環境では `userEvent` が動作しない（`fireEvent` を使う）

| 項目       | 内容                                                                                                                                     |
| ---------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| 症状       | Vitest + happy-dom 環境で `@testing-library/user-event` の `await userEvent.click()` を使うとテストが非同期タイムアウトになる            |
| 原因       | `userEvent` は `jsdom` を前提としており、`happy-dom` 環境ではイベントディスパッチが正常に動作しない                                      |
| 解決策     | ボタンクリック等のインタラクションはすべて `fireEvent.click(element)` を使う。`userEvent` はこのプロジェクトの Vitest テストでは使用禁止 |
| 適用条件   | `apps/desktop` 配下の全 Vitest テスト（`testEnvironment: "happy-dom"` が設定済み）                                                       |
| 関連タスク | TASK-SW-FIX-MODE-MGMT-001                                                                                                                |

### L-MODEMGMT-004: SkillInfoStep props の単純化パターン

| 項目       | 内容                                                                                                                                                              |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 背景       | `SkillInfoStep` は `generationMode` / `onGenerationModeChange` を props として受け取っていたが、LLM専用化でこれらが不要になった                                   |
| 解決策     | 不要な props を削除し、`SkillInfoStep` の props インターフェースを最小化した（`formData` / `onFormDataChange` / `onNext` の3点のみ）                              |
| 設計原則   | 子コンポーネントには「今何をすべきか」の props のみ渡す。モード判定ロジック・分岐フラグはオーケストレーターコンポーネントに封じ込め、子コンポーネントに持たせない |
| 関連タスク | TASK-SW-FIX-MODE-MGMT-001                                                                                                                                         |


## TASK-UT-RT-01-RENDERER-ERROR-UI-CHECK-001: Renderer エラー UI 表示 E2E 確認 教訓（2026-04-13）

### L-RT01-RENDERER-FINAL-001: Renderer error 表示 E2E は DOM assertion で完結させる

| 項目       | 内容                                                                                                                                                                                                                                                  |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 症状       | `executeAsync` → `onWorkflowStateSnapshot(snapshot, errorMessage)` → `setWorkflowError()` → renderer component の表示経路が長いため、IPC mock 単体テストだけでは renderer 側の DOM 表示まで確認できず漏れが発生した                                   |
| 原因       | IPC 層の unit test で `errorMessage` が正しく伝搬することは確認済みだったが、`SkillLifecyclePanel` が実際に `data-testid="skill-lifecycle-error"` 要素を描画するかは別の検証スコープだった                                                            |
| 解決策     | `SkillLifecyclePanel.test.tsx` に `mockStoreState.workflowError = "..."` → `renderPanel()` → `screen.getByTestId("skill-lifecycle-error")` → `toHaveAttribute("role", "alert")` → `toHaveTextContent(...)` の positive DOM assertion テストを追加した |
| 標準ルール | Runtime error propagation タスク完了時は、renderer component 側の表示チェック（DOM visibility + aria accessibility）を E2E 対象に含める。IPC 単体テスト通過 ≠ UI 表示到達                                                                             |
| 関連タスク | TASK-UT-RT-01-RENDERER-ERROR-UI-CHECK-001                                                                                                                                                                                                             |


## TASK-SW-FIX-MODE-MGMT-001 スキルウィザード mode 管理廃止 教訓（2026-04-14）

> 詳細: [lessons-learned-skill-wizard-mode-mgmt.md](lessons-learned-skill-wizard-mode-mgmt.md)

- **L-MODE-001**: state 廃止は 6ステップ（state → UI → props → 呼び出し側 → grep → DOM確認）で完結させる
- **L-MODE-002**: TC-06 型の動的廃止検証（DOM query で旧要素が 0件）を廃止系タスクの標準テストに組み込む
- **L-MODE-003**: Wave 分割実施では TDD Red フェーズを Wave A・B 同時設計する（Wave A 完了後では Red 状態を作れない）
- **L-MODE-004**: Electron 実機なし時は「36 UT + grep ゼロ + TC-06 DOM query + typecheck」の 4 点 NON_VISUAL 証跡で代替する
- **L-MODE-005**: SkillCreateWizard 確定フロー Step 0→1→2→3（LLM 専用・分岐なし）を基準とし、逸脱を禁止する
| 項目       | 内容                                                                                                                                                                                      |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 背景       | `SkillCreateWizard.tsx` → `agentSlice.ts` → `skill-api.ts` → `skillHandlers.ts` の 4 層を通じて `SkillCreationContext` を伝播させる際、既存呼び出し（context なし）を壊さない必要があった |
| 解決策     | 全引数を `context?: SkillCreationContext`（optional）にし、`buildSkillGenerationPrompt(context)` 側で `undefined` をハンドリングする。既存呼び出しは無変更で動作継続                      |
| 設計原則   | 新規コンテキスト引数は必ず optional。IPC ハンドラ側でデフォルト値 / undefined guard を持ち、クライアント側に変更を強制しない                                                              |
| 適用条件   | 既存 IPC チャンネルへの引数追加時（`skill:create` のような多層を跨ぐチャンネル）                                                                                                          |
| 関連タスク | TASK-SW-FIX-DATAFLOW-001                                                                                                                                                                  |

---

## TASK-UT-RT-01-RENDERER-ERROR-UI-CHECK-001: Renderer エラー UI 表示 E2E 確認 教訓（2026-04-13）

### L-RT01-RENDERER-FINAL-001: Renderer error 表示 E2E は DOM assertion で完結させる

| 項目       | 内容                                                                                                                                                                                                                                                  |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 症状       | `executeAsync` → `onWorkflowStateSnapshot(snapshot, errorMessage)` → `setWorkflowError()` → renderer component の表示経路が長いため、IPC mock 単体テストだけでは renderer 側の DOM 表示まで確認できず漏れが発生した                                   |
| 原因       | IPC 層の unit test で `errorMessage` が正しく伝搬することは確認済みだったが、`SkillLifecyclePanel` が実際に `data-testid="skill-lifecycle-error"` 要素を描画するかは別の検証スコープだった                                                            |
| 解決策     | `SkillLifecyclePanel.test.tsx` に `mockStoreState.workflowError = "..."` → `renderPanel()` → `screen.getByTestId("skill-lifecycle-error")` → `toHaveAttribute("role", "alert")` → `toHaveTextContent(...)` の positive DOM assertion テストを追加した |
| 標準ルール | Runtime error propagation タスク完了時は、renderer component 側の表示チェック（DOM visibility + aria accessibility）を E2E 対象に含める。IPC 単体テスト通過 ≠ UI 表示到達                                                                             |
| 関連タスク | TASK-UT-RT-01-RENDERER-ERROR-UI-CHECK-001                                                                                                                                                                                                             |

---

## TASK-SW-FIX-UI-001 UI整合性修正 教訓（2026-04-14）

> 詳細: [skill-feedback-report.md](../docs/30-workflows/skill-wizard-bugfix-wave/WC-par-03b-fix-ui/outputs/phase-12/skill-feedback-report.md)

### L-UI-001: null → 空配列への型設計変更はnullチェック除去の機会

| 項目       | 内容                                                                                                                           |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------ |
| 症状       | `category: SkillCategory \| null` では選択前の状態を `=== null` で判定し、後続ロジックで null チェックが分散していた            |
| 原因       | 単一選択の設計を複数選択に拡張する際、「未選択 = null」の慣習をそのまま引き継いでいた                                         |
| 解決策     | 未選択を空配列 `[]` で表現し、型を `SkillCategory[]` に変更。全箇所の null チェックを `.length > 0` / `.includes()` に統一   |
| 設計原則   | 複数選択フィールドの未選択状態は空配列を使う。null は「値が存在しないこと」を示す用途に限定する                                |
| 関連タスク | TASK-SW-FIX-UI-001（問題2・15）                                                                                                |

---

### L-UI-002: トグルロジックは includes/filter の1パターンで完結させる

| 項目       | 内容                                                                                                          |
| ---------- | ------------------------------------------------------------------------------------------------------------- |
| 背景       | カテゴリの追加・解除・再選択の3状態を実装する際に、複数の条件分岐が必要に見えた                              |
| 解決策     | `includes(value)` で選択済みを判定し、true なら `filter(c => c !== value)`、false なら `[...arr, value]` に統一 |
| 利点       | エッジケース（空配列・最後の1件の解除）を追加ガードなしで処理できる。コードが1関数4行に収まる                 |
| 関連タスク | TASK-SW-FIX-UI-001（問題15）                                                                                  |

---

### L-UI-003: ProgressBar動的計算には Math.max(1, count) で最小値を保証する

| 項目       | 内容                                                                                                 |
| ---------- | ---------------------------------------------------------------------------------------------------- |
| 症状       | `answeredCount` が 0 の初期状態で `currentQuestion = 0` となり「0/6」が表示されるバグリスクがあった  |
| 解決策     | `Math.max(1, answeredCount)` により初期値・全未回答時でも最低「1/6」を表示する                      |
| 注意点     | Page 2 開始直後（Q4 未回答）に「3/6」が表示される場合があるが、これは「回答済み数の反映」として仕様 |
| 関連タスク | TASK-SW-FIX-UI-001（問題11・16）                                                                     |

---

### L-UI-004: CSS変数統一はルートbarrelに波及させず subpath export に閉じる

| 項目       | 内容                                                                                                              |
| ---------- | ----------------------------------------------------------------------------------------------------------------- |
| 背景       | `bg-blue-600` を CSS変数 `var(--status-primary)` に置換する際、型変更も伴うため影響範囲の管理が重要だった        |
| 解決策     | 変更を `@repo/shared/skill-creator` の subpath export スコープに限定し、ルート barrel (`@repo/shared`) は無変更   |
| 利点       | 外部パッケージからの import 互換性を維持しながら、内部型定義と UI スタイルを刷新できた                            |
| 関連タスク | TASK-SW-FIX-UI-001（問題2・3）                                                                                    |

---

## TASK-SW-FIX-MODE-MGMT-001 スキルウィザード mode 管理廃止 教訓（2026-04-14）

> 詳細: [lessons-learned-skill-wizard-mode-mgmt.md](lessons-learned-skill-wizard-mode-mgmt.md)

- **L-MODE-001**: state 廃止は 6ステップ（state → UI → props → 呼び出し側 → grep → DOM確認）で完結させる
- **L-MODE-002**: TC-06 型の動的廃止検証（DOM query で旧要素が 0件）を廃止系タスクの標準テストに組み込む
- **L-MODE-003**: Wave 分割実施では TDD Red フェーズを Wave A・B 同時設計する（Wave A 完了後では Red 状態を作れない）
- **L-MODE-004**: Electron 実機なし時は「36 UT + grep ゼロ + TC-06 DOM query + typecheck」の 4 点 NON_VISUAL 証跡で代替する
- **L-MODE-005**: SkillCreateWizard 確定フロー Step 0→1→2→3（LLM 専用・分岐なし）を基準とし、逸脱を禁止する
| 解決策     | 全引数を `context?: SkillCreationContext`（optional）にし、`buildSkillGenerationPrompt(context)` 側で `undefined` をハンドリングする。既存呼び出しは無変更で動作継続 |
| 設計原則   | 新規コンテキスト引数は必ず optional。IPC ハンドラ側でデフォルト値 / undefined guard を持ち、クライアント側に変更を強制しない |
| 適用条件   | 既存 IPC チャンネルへの引数追加時（`skill:create` のような多層を跨ぐチャンネル） |
| 関連タスク | TASK-SW-FIX-DATAFLOW-001 |

---

## TASK-UT-RT-01-RENDERER-ERROR-UI-CHECK-001: Renderer エラー UI 表示 E2E 確認 教訓（2026-04-13）

### L-RT01-RENDERER-FINAL-001: Renderer error 表示 E2E は DOM assertion で完結させる

| 項目       | 内容 |
| ---------- | ---- |
| 症状       | `executeAsync` → `onWorkflowStateSnapshot(snapshot, errorMessage)` → `setWorkflowError()` → renderer component の表示経路が長いため、IPC mock 単体テストだけでは renderer 側の DOM 表示まで確認できず漏れが発生した |
| 原因       | IPC 層の unit test で `errorMessage` が正しく伝搬することは確認済みだったが、`SkillLifecyclePanel` が実際に `data-testid="skill-lifecycle-error"` 要素を描画するかは別の検証スコープだった |
| 解決策     | `SkillLifecyclePanel.test.tsx` に `mockStoreState.workflowError = "..."` → `renderPanel()` → `screen.getByTestId("skill-lifecycle-error")` → `toHaveAttribute("role", "alert")` → `toHaveTextContent(...)` の positive DOM assertion テストを追加した |
| 標準ルール | Runtime error propagation タスク完了時は、renderer component 側の表示チェック（DOM visibility + aria accessibility）を E2E 対象に含める。IPC 単体テスト通過 ≠ UI 表示到達 |
| 関連タスク | TASK-UT-RT-01-RENDERER-ERROR-UI-CHECK-001 |

---

## TASK-UT-RT-01-RENDERER-ERROR-UI-CHECK-001: Renderer エラー UI 表示 E2E 確認 教訓（2026-04-13）

### L-RT01-RENDERER-FINAL-001: Renderer error 表示 E2E は DOM assertion で完結させる

| 項目       | 内容 |
| ---------- | ---- |
| 症状       | `executeAsync` → `onWorkflowStateSnapshot(snapshot, errorMessage)` → `setWorkflowError()` → renderer component の表示経路が長いため、IPC mock 単体テストだけでは renderer 側の DOM 表示まで確認できず漏れが発生した |
| 原因       | IPC 層の unit test で `errorMessage` が正しく伝搬することは確認済みだったが、`SkillLifecyclePanel` が実際に `data-testid="skill-lifecycle-error"` 要素を描画するかは別の検証スコープだった |
| 解決策     | `SkillLifecyclePanel.test.tsx` に `mockStoreState.workflowError = "..."` → `renderPanel()` → `screen.getByTestId("skill-lifecycle-error")` → `toHaveAttribute("role", "alert")` → `toHaveTextContent(...)` の positive DOM assertion テストを追加した |
| 標準ルール | Runtime error propagation タスク完了時は、renderer component 側の表示チェック（DOM visibility + aria accessibility）を E2E 対象に含める。IPC 単体テスト通過 ≠ UI 表示到達 |
| 関連タスク | TASK-UT-RT-01-RENDERER-ERROR-UI-CHECK-001 |
| 解決策     | 全引数を `context?: SkillCreationContext`（optional）にし、`buildSkillGenerationPrompt(context)` 側で `undefined` をハンドリングする。既存呼び出しは無変更で動作継続                      |
| 設計原則   | 新規コンテキスト引数は必ず optional。IPC ハンドラ側でデフォルト値 / undefined guard を持ち、クライアント側に変更を強制しない                                                              |
| 適用条件   | 既存 IPC チャンネルへの引数追加時（`skill:create` のような多層を跨ぐチャンネル）                                                                                                          |
| 関連タスク | TASK-SW-FIX-DATAFLOW-001                                                                                                                                                                  |

---

## TASK-UT-RT-01-RENDERER-ERROR-UI-CHECK-001: Renderer エラー UI 表示 E2E 確認 教訓（2026-04-13）

### L-RT01-RENDERER-FINAL-001: Renderer error 表示 E2E は DOM assertion で完結させる

| 項目       | 内容                                                                                                                                                                                                                                                  |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 症状       | `executeAsync` → `onWorkflowStateSnapshot(snapshot, errorMessage)` → `setWorkflowError()` → renderer component の表示経路が長いため、IPC mock 単体テストだけでは renderer 側の DOM 表示まで確認できず漏れが発生した                                   |
| 原因       | IPC 層の unit test で `errorMessage` が正しく伝搬することは確認済みだったが、`SkillLifecyclePanel` が実際に `data-testid="skill-lifecycle-error"` 要素を描画するかは別の検証スコープだった                                                            |
| 解決策     | `SkillLifecyclePanel.test.tsx` に `mockStoreState.workflowError = "..."` → `renderPanel()` → `screen.getByTestId("skill-lifecycle-error")` → `toHaveAttribute("role", "alert")` → `toHaveTextContent(...)` の positive DOM assertion テストを追加した |
| 標準ルール | Runtime error propagation タスク完了時は、renderer component 側の表示チェック（DOM visibility + aria accessibility）を E2E 対象に含める。IPC 単体テスト通過 ≠ UI 表示到達                                                                             |
| 関連タスク | TASK-UT-RT-01-RENDERER-ERROR-UI-CHECK-001                                                                                                                                                                                                             |

---

## TASK-SW-FIX-MODE-MGMT-001 スキルウィザード mode 管理廃止 教訓（2026-04-14）

> 詳細: [lessons-learned-skill-wizard-mode-mgmt.md](lessons-learned-skill-wizard-mode-mgmt.md)

- **L-MODE-001**: state 廃止は 6ステップ（state → UI → props → 呼び出し側 → grep → DOM確認）で完結させる
- **L-MODE-002**: TC-06 型の動的廃止検証（DOM query で旧要素が 0件）を廃止系タスクの標準テストに組み込む
- **L-MODE-003**: Wave 分割実施では TDD Red フェーズを Wave A・B 同時設計する（Wave A 完了後では Red 状態を作れない）
- **L-MODE-004**: Electron 実機なし時は「36 UT + grep ゼロ + TC-06 DOM query + typecheck」の 4 点 NON_VISUAL 証跡で代替する
- **L-MODE-005**: SkillCreateWizard 確定フロー Step 0→1→2→3（LLM 専用・分岐なし）を基準とし、逸脱を禁止する
