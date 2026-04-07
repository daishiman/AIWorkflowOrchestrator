# Lessons Learned（current）2026-03 初旬〜中旬
> 親ファイル: [lessons-learned-current.md](lessons-learned-current.md)


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

| 項目         | 内容                                                                                                                                                              |
| ------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 課題         | `generationProgressSlice` に `streamingError` フィールドを定義したところ、既存の `chatSlice` に同名フィールドが存在していたため、Store マージ時に型衝突が発生した |
| 再発条件     | 新規 Slice を追加する際に、既存 Slice のフィールド名と重複するキーを使用した場合                                                                                  |
| 解決策       | `streamingError` → `genProgressError` に改名し、Slice スコープを明示するプレフィックスを付与した                                                                  |
| 標準ルール   | 新規 Slice 追加前に `store/index.ts` の既存フィールド名を grep して衝突を事前チェックする                                                                         |
| 関連パターン | P31（Store セレクタの SSoT）                                                                                                                                      |
| 関連タスク   | TASK-SC-07-STREAMING-PROGRESS-UI                                                                                                                                  |

#### L-SC-07-002: P5対策（safeOn cleanup の useEffect return 必須化）

| 項目         | 内容                                                                                                                                                                                       |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 課題         | `useStreamingProgress` Hook で `safeOn` によるIPCリスナー登録を行ったが、`useEffect` の cleanup 関数を返し忘れたため、コンポーネントのアンマウント後もリスナーが残存し、二重登録が発生した |
| 再発条件     | `safeOn` / `ipcRenderer.on` を `useEffect` 内で呼び出す際に cleanup return を省略した場合                                                                                                  |
| 解決策       | `useEffect` 内で `const cleanup = safeOn(...)` を受け取り、`return () => cleanup()` を必ず返す                                                                                             |
| 標準ルール   | IPC リスナーを登録する `useEffect` は必ず cleanup return を含めるルールをコードレビューチェックリストに追加する                                                                            |
| 関連パターン | P5（IPC リスナー二重登録防止）                                                                                                                                                             |
| 関連タスク   | TASK-SC-07-STREAMING-PROGRESS-UI                                                                                                                                                           |

#### L-SC-07-003: P47対策（`Record<GenerationErrorCode, ReactNode>` による ErrorCards 網羅性保証）

| 項目         | 内容                                                                                                                                                               |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 課題         | ErrorCards コンポーネントでエラーコードごとの表示を `switch` 文で実装していたが、新しい `GenerationErrorCode` 追加時に case 漏れが TypeScript では検出されなかった |
| 再発条件     | エラーコードの union 型が拡張された際に、対応するビューコンポーネント側の分岐が更新されない場合                                                                    |
| 解決策       | `const ERROR_CARDS: Record<GenerationErrorCode, ReactNode>` として全コードをキーとするオブジェクト型で定義し、TypeScript の完全性チェックを活用した                |
| 標準ルール   | エラーコード → UI マッピングは `switch` ではなく `Record<ErrorCode, ReactNode>` パターンで実装する                                                                 |
| 関連パターン | P47（Exhaustive Check）                                                                                                                                            |
| 関連タスク   | TASK-SC-07-STREAMING-PROGRESS-UI                                                                                                                                   |

#### L-SC-07-004: ローカルstate vs Zustand二重管理（createSkillのPromise rejectがIPCチャンネルを経由しないため、resolveStage/bridgeLocalErrorによるブリッジが必要）

| 項目         | 内容                                                                                                                                                                                                                                                                                       |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 課題         | `createSkill` の IPC 呼び出しは Promise を返すが、ストリーミング進捗イベントは別チャンネルの `safeOn` で受け取る設計になっており、Promise の reject と IPC イベントの到着順序が保証されなかった。Store（`generationProgressSlice`）とローカル state の両方で進捗を管理すると SSoT が崩れた |
| 再発条件     | IPC の request/response と push イベントを混在させるストリーミングパターンで、進捗状態の管理先を一元化しない場合                                                                                                                                                                           |
| 解決策       | `resolveStage`（IPC Promise resolve 時に Store へ反映）と `bridgeLocalError`（ローカル catch を Store エラーへ橋渡し）の2つのブリッジ関数を設け、IPC レスポンスと Store 状態を同期させた                                                                                                   |
| 標準ルール   | ストリーミング進捗パターンでは Promise 側と push イベント側を Store に集約し、ローカル state との二重管理を避ける                                                                                                                                                                          |
| 関連パターン | P31（Store SSoT）, Hybrid State Pattern                                                                                                                                                                                                                                                    |
| 関連タスク   | TASK-SC-07-STREAMING-PROGRESS-UI                                                                                                                                                                                                                                                           |

---

### 2026-03-25 UT-SC-05-IPC-DI-WIRING DI配線完了

#### L-IPC-DI-001: 仕様書作成時点と実装時点のコード乖離

| 項目         | 内容                                                                                                                                                                                                                                                         |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 課題         | Phase 1-2 で「3依存（skillFileManager, llmAdapter, resourceLoader）がすべて未注入」を前提に設計したが、Phase 3 実行時に resourceLoader と llmAdapter は既に別タスク（TASK-SC-05-IMPROVE-LLM）で注入済みだった。実際の変更は `skillFileManager` の1行追加のみ |
| 再発条件     | 仕様書作成後に他タスクが先に実装をマージし、前提コードが変化した場合                                                                                                                                                                                         |
| 解決策       | Phase 3 の設計レビューで現状コードとの差分分析を実施し、実際の変更量を特定。仕様書の前提を修正                                                                                                                                                               |
| 標準ルール   | Phase 3 開始時に `git diff` または `grep` で仕様書のコードスニペットと現状コードの差分を確認する。コミットハッシュを仕様書に記録する                                                                                                                         |
| 関連パターン | P34（遅延初期化 DI パターン）                                                                                                                                                                                                                                |
| 関連タスク   | UT-SC-05-IPC-DI-WIRING                                                                                                                                                                                                                                       |

#### L-IPC-DI-002: オプショナル DI のサイレントデグラデーション

| 項目       | 内容                                                                                                                                                                                            |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 課題       | `RuntimeSkillCreatorFacadeDeps` のフィールドがすべてオプショナルであるため、依存未注入でも TypeScript のコンパイルエラーが発生せず、Graceful Degradation が「正常動作」として長期間見過ごされた |
| 解決策     | Graceful Degradation 発動時のログ計装で「意図しない degradation」を検出可能にする。必須依存は Required フィールドに変更することを検討                                                           |
| 標準ルール | オプショナル DI フィールドを使用する場合、Graceful Degradation 発動時にログ（warn レベル）を出力する                                                                                            |
| 関連タスク | UT-SC-05-IPC-DI-WIRING                                                                                                                                                                          |

---

### 2026-03-24 TASK-LLM-MOD-03 GoogleAdapter system_instruction 対応

#### 苦戦箇所1（L-LLM-MOD-03-001）: baseUrl v1→v1beta 変更の cross-file 依存

| 項目       | 内容                                                                                                                                                                                                                                                                            |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 課題       | `GoogleAdapter.ts` の `baseUrl` を `v1` から `v1beta` に変更した際、`GoogleAdapter.test.ts` の MSW モック URL は Phase 4-5 で更新したが、`streaming.test.ts` の MSW モック URL 3 箇所が `v1` のまま残っていた。Phase 9（品質保証）で全 Adapter テストを実行して初めて発見された |
| 再発条件   | アダプターの URL/エンドポイント変更時に、対象テストファイル以外のテストが同じ URL をモックしているケースを見逃す                                                                                                                                                                |
| 解決策     | `streaming.test.ts` の MSW ハンドラ URL 3 箇所を `v1beta` に修正。Phase 9 の全テスト実行ゲートがなければ検出できなかった                                                                                                                                                        |
| 標準ルール | URL/エンドポイント変更時は `grep -rn "旧URL" __tests__/` で全テストファイルの使用箇所を検索してから変更する                                                                                                                                                                     |
| 関連タスク | TASK-LLM-MOD-03                                                                                                                                                                                                                                                                 |

#### 苦戦箇所2（L-LLM-MOD-03-002）: system_instruction の条件付加における trim ガード

| 項目         | 内容                                                                                                                                                                                                                                                                 |
| ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 課題         | `request.systemPrompt` が空文字列 `""` やスペースのみ `"   "` の場合に、空の `system_instruction` を送信すると Gemini API がエラーを返す可能性がある。Phase 5 で `request.systemPrompt` の truthy チェックだけだと空文字列はブロックできるが、スペースのみは通過する |
| 解決策       | `request.systemPrompt?.trim()` で trim 後の truthy チェックに統一。P42（.trim() バリデーション漏れ）パターンを適用                                                                                                                                                   |
| 標準ルール   | 外部 API に送信する文字列フィールドは `.trim()` 後の truthy チェックを標準とする                                                                                                                                                                                     |
| 関連パターン | P42（文字列引数の .trim() バリデーション漏れ）                                                                                                                                                                                                                       |
| 関連タスク   | TASK-LLM-MOD-03                                                                                                                                                                                                                                                      |

---

### 2026-03-22 TASK-FIX-WORKSPACE-CHAT-STREAM-ERROR 同期

#### 苦戦箇所1: structured error と legacy fallback を同じ UI で二重表示しやすい

| 項目       | 内容                                                                                                                 |
| ---------- | -------------------------------------------------------------------------------------------------------------------- |
| 課題       | `streamingError` と `errorMessage` を同時に表示すると、Workspace Chat のエラー surface が重複し、同じ内容が2回見える |
| 解決策     | `StreamingErrorDisplay` を primary surface に固定し、`WorkspaceChatInput` の inline error は fallback に限定した     |
| 標準ルール | structured error がある場合は fallback を suppress し、同じ状態を2 surface で表示しない                              |

#### 苦戦箇所2: task03 移管と task04 current root を同じ wave で更新しないと canonical path がずれる

| 項目       | 内容                                                                                                                                                            |
| ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 課題       | Task 03 を completed root に移しても、parent workflow / artifact inventory / legacy register のいずれかが旧 `tasks/03-*` を参照すると canonical path が分岐する |
| 解決策     | Task03 completed root、Task04 current root、parent workflow、artifact inventory、legacy register を同一 wave で更新した                                         |
| 標準ルール | path relocation は root だけで閉じず、参照先一覧をまとめて同期する                                                                                              |

---

### 2026-03-20 TASK-FIX-CHATVIEW-ERROR-SILENT-FAILURE 再監査

#### 苦戦箇所1: ユーザー指定の current workflow root と parent workflow 想定 root がずれた

| 項目       | 内容                                                                                                                                                                                                      |
| ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 課題       | parent workflow は `ai-chat-llm-integration-fix/tasks/01-*` を前提にしていた一方、current canonical root は `docs/30-workflows/completed-tasks/01-TASK-FIX-CHATVIEW-ERROR-SILENT-FAILURE/` へ移行していた |
| 解決策     | completed root を canonical とし、workflow/spec 側の旧参照を drift として是正した                                                                                                                         |
| 標準ルール | current task root をユーザーが明示した場合、その root を Phase 11/12・system spec 同期の正本として扱う                                                                                                    |

#### 苦戦箇所2: worktree でも screenshot 証跡は Playwright + Vite harness で再生成できる

| 項目       | 内容                                                                                                                                        |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| 課題       | CLI 環境を理由に screenshot 不可と判断すると、UI task の Phase 11 が未完了のまま残る                                                        |
| 解決策     | `arch -arm64 npx vite --config vite.e2e.config.ts` と Playwright init script で current worktree の representative screenshots を再取得した |
| 標準ルール | worktree / CLI 環境でも、UI task かつユーザーが画面検証を要求した場合は capture script を作成して screenshot を残す                         |

#### 苦戦箇所3: `validate-phase12-implementation-guide` の失敗を compliance 文書で握りつぶさない

| 項目       | 内容                                                                                                                  |
| ---------- | --------------------------------------------------------------------------------------------------------------------- |
| 課題       | implementation guide が 10/10 要件を満たしていないのに、compliance 文書だけ完了扱いにすると Phase 12 の整合性が壊れる |
| 解決策     | validator 実行結果を正として guide を補完し、compliance / changelog / system-spec-update-summary を同ターンで更新した |
| 標準ルール | Phase 12 は validator 実測値を正本とし、narrative 側で完了を先に宣言しない                                            |

---

