# Phase 3: 設計レビュー - TASK-9H-SKILL-DEBUG

## メタ情報

| 項目               | 値                                                                    |
| ------------------ | --------------------------------------------------------------------- |
| タスクID           | TASK-9H-SKILL-DEBUG                                                   |
| Phase              | 3（設計レビュー）                                                     |
| 機能名             | skill-debug                                                           |
| 作成日             | 2026-02-27                                                            |
| 前提Phase          | phase-2-design.md                                                     |
| 依存タスク         | TASK-9B（skill-creator スキル）                                       |
| 目的               | Phase 1 要件と Phase 2 設計の整合性を検証し、レビューゲートを通過する |
| 成果物ディレクトリ | docs/30-workflows/TASK-9H-skill-debug/                                |

## 目的

Phase 2 で確定した設計（型定義・クラス・IPC・Hooks・Preload・状態遷移）が Phase 1 の要件（FR-1〜FR-7、NFR-1〜NFR-3、AT-1〜AT-24、AC-1〜AC-8）を満たしているか多角的に検証する。IPC 契約の整合性（P42/P44/P45準拠）、セキュリティ（式評価サンドボックス、入力バリデーション）、統合テスト観点を重点的にレビューする。

## 実行タスク

- **Task 1**: 要件・設計整合性レビュー（FR/NFR/AT カバレッジ検証）
- **Task 2**: IPC 契約検証（P42/P44/P45 準拠チェック）
- **Task 3**: セキュリティレビュー（式評価サンドボックス、入力バリデーション）
- **Task 4**: 統合テスト観点レビュー
- **Task 5**: レビューゲート判定

## SubAgent 分担

| SubAgent | 担当Task  | 並列実行                |
| -------- | --------- | ----------------------- |
| Agent-1  | Task 1, 4 | 可能                    |
| Agent-2  | Task 2, 3 | 可能                    |
| Agent-3  | Task 5    | 不可（Task 1-4 完了後） |

## 参照資料

### システム仕様（aiworkflow-requirements）

| 参照資料                 | パス                                                                                      | 内容                                  |
| ------------------------ | ----------------------------------------------------------------------------------------- | ------------------------------------- |
| API IPC仕様              | .claude/skills/aiworkflow-requirements/references/api-ipc-agent.md                        | IPCチャネル命名、引数契約、戻り値契約 |
| Skillインターフェース    | .claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md           | スキル型定義・API仕様                 |
| Electron IPCセキュリティ | .claude/skills/aiworkflow-requirements/references/security-electron-ipc.md                | IPCセキュリティ実装パターン           |
| アーキテクチャ概要       | .claude/skills/aiworkflow-requirements/references/architecture-overview.md                | システム全体構造                      |
| エラーハンドリング       | .claude/skills/aiworkflow-requirements/references/error-handling.md                       | エラーカテゴリ・処理方針              |
| IPC契約チェックリスト    | .claude/skills/aiworkflow-requirements/references/ipc-contract-checklist.md               | IPC契約検証手順（P42/P44/P45準拠）    |
| Electronサービス設計     | .claude/skills/aiworkflow-requirements/references/arch-electron-services.md               | Main Processサービス設計方針          |
| 実装パターン             | .claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md | DI・セキュリティ・テストパターン      |
| 品質基準                 | .claude/skills/aiworkflow-requirements/references/quality-requirements.md                 | カバレッジ・テスト基準                |
| 既知の落とし穴           | .claude/rules/06-known-pitfalls.md                                                        | P42/P44/P45/P34/P5等の教訓            |
| Claude Agent SDK         | .claude/skills/claude-agent-sdk/SKILL.md                                                  | SDK統合パターン・Hooks仕様            |

### タスク固有参照

| 参照資料       | パス                    | 内容                     |
| -------------- | ----------------------- | ------------------------ |
| Phase 1 成果物 | phase-1-requirements.md | 要件定義（FR/NFR/AT/AC） |
| Phase 2 成果物 | phase-2-design.md       | 設計書                   |

---

## 実行手順

### Task 1: 要件・設計整合性レビュー

#### 1-1. 機能要件（FR）カバレッジ検証

各機能要件が Phase 2 設計のどのコンポーネントで実現されているか検証する。

| 要件グループ | 要件ID      | 設計コンポーネント                               | 検証項目                                                                  |
| ------------ | ----------- | ------------------------------------------------ | ------------------------------------------------------------------------- |
| FR-1         | FR-1-1      | SkillDebugger.startDebugSession()                | skillName, prompt, breakpoints パラメータが定義されている                 |
| FR-1         | FR-1-2      | DebugSession（id フィールド, UUID v4）           | セッションIDが UUID v4 で生成される設計である                             |
| FR-1         | FR-1-3      | DebugSession.transitionTo()                      | 状態遷移図で idle→running→paused→running→completed の経路が定義されている |
| FR-1         | FR-1-4      | DebugSession.transitionTo("error")               | 任意の状態から error への遷移が状態遷移図に含まれている                   |
| FR-1         | FR-1-5      | SkillDebugger.executeCommand("stop")             | stop コマンドが DebugCommand 型に含まれている                             |
| FR-1         | FR-1-6      | SkillDebugger.activeSession（排他制御）          | 同時実行1つの制約が activeSession フィールドで実現されている              |
| FR-2         | FR-2-1〜2-3 | Breakpoint 型, BreakpointType                    | tool/hook/step の3タイプが型定義されている                                |
| FR-2         | FR-2-4      | Breakpoint.condition フィールド                  | condition がオプショナルフィールドとして定義されている                    |
| FR-2         | FR-2-5      | Breakpoint.enabled フィールド                    | enabled フラグが shouldBreak() で参照される設計である                     |
| FR-2         | FR-2-6      | SkillDebugger.addBreakpoint/removeBreakpoint     | 動的追加・削除の IPC チャネルが設計されている                             |
| FR-2         | FR-2-7      | SkillDebugger.addBreakpoint（UUID v4）           | ID自動生成が設計に含まれている                                            |
| FR-3         | FR-3-1〜3-6 | DebugCommand 型, executeCommand()                | 6つのコマンドが DebugCommand 型に定義されている                           |
| FR-3         | FR-3-7      | DebugStep 型                                     | stepNumber, type, timestamp フィールドが定義されている                    |
| FR-3         | FR-3-8      | DebugStep.input/output フィールド                | input/output がオプショナルフィールドとして定義されている                 |
| FR-4         | FR-4-1      | SkillDebugger.inspectVariable()                  | path パラメータでドット区切りインスペクションが設計されている             |
| FR-4         | FR-4-2      | DebugSession.\_variables                         | Record<string, unknown> 型で管理される設計である                          |
| FR-4         | FR-4-3      | DebugVariableChangedEvent                        | variable-changed イベントが DebugEvent 共用型に含まれている               |
| FR-5         | FR-5-1      | SkillDebugger.evaluateExpression()               | 式評価メソッドが設計されている                                            |
| FR-5         | FR-5-2      | evaluateInSandbox（variables スコープ限定）      | サンドボックスのスコープが variables に限定される設計である               |
| FR-5         | FR-5-3      | EXPRESSION_TIMEOUT_MS = 5_000                    | 5秒タイムアウト定数が定義されている                                       |
| FR-5         | FR-5-4      | evaluateInSandbox（process/require/fs ブロック） | ブロック対象が明示的に列挙されている                                      |
| FR-6         | FR-6-1      | CallStackEntry 型                                | depth, name, type, startTime フィールドが定義されている                   |
| FR-6         | FR-6-2      | DebugSession.pushCallStack/popCallStack          | プッシュ・ポップ操作が設計されている                                      |
| FR-6         | FR-6-3      | DebugSession.callStack アクセサ                  | ReadonlyArray<CallStackEntry> として公開される設計である                  |
| FR-7         | FR-7-1〜7-4 | DebugEvent 共用型（4種類）                       | step/breakpoint-hit/variable-changed/session-ended が定義されている       |
| FR-7         | FR-7-5      | emitDebugEvent + IPC_CHANNELS.SKILL_DEBUG_EVENT  | webContents.send によるイベント送信が設計されている                       |

**検証結果判定基準**:

- 全 FR の設計コンポーネント列が埋まっている: PASS
- 1-3件の軽微な未対応がある: MINOR（未タスク化して Phase 4 へ）
- 4件以上の未対応、または構造的な欠陥がある: MAJOR（Phase 1 または Phase 2 へ戻る）

#### 1-2. 非機能要件（NFR）カバレッジ検証

| 要件グループ | 要件ID  | 設計コンポーネント                           | 検証項目                                                       |
| ------------ | ------- | -------------------------------------------- | -------------------------------------------------------------- |
| NFR-1        | NFR-1-1 | evaluateInSandbox（vm.createContext）        | Node.js グローバルオブジェクトのブロックリストが明示されている |
| NFR-1        | NFR-1-2 | IPC ハンドラパターン（validateIpcSender）    | 全7ハンドラのうち6つ（handle型）で送信元検証が設計されている   |
| NFR-1        | NFR-1-3 | IPC ハンドラパターン（3段バリデーション）    | 全文字列引数のバリデーションコードが設計に含まれている         |
| NFR-1        | NFR-1-4 | vm.Script.runInContext（timeout パラメータ） | タイムアウト設定が vm 実行オプションに含まれている             |
| NFR-1        | NFR-1-5 | emitDebugEvent（サニタイズ方針）             | エラーサニタイズの方針が設計に含まれている                     |
| NFR-1        | NFR-1-6 | evaluateConditionSync                        | 条件式もサンドボックスで評価される設計である                   |
| NFR-2        | NFR-2-1 | -（テスト時に計測）                          | 設計レベルではオーバーヘッド最小化のための設計判断を確認       |
| NFR-2        | NFR-2-2 | shouldBreak（線形探索）                      | ブレークポイント数が少数（数十個以下）の前提で10ms以内         |
| NFR-2        | NFR-2-3 | inspectVariable（ドット区切りパス探索）      | 変数の深度が限定的であるためO(depth)で100ms以内                |
| NFR-2        | NFR-2-4 | emitDebugEvent（webContents.send）           | JSON シリアライズ + IPC 送信で50ms以内                         |
| NFR-2        | NFR-2-5 | MAX_STEPS = 10_000                           | 上限定数が定義されている                                       |
| NFR-3        | NFR-3-1 | cleanupSession()                             | クリーンアップメソッドが設計に含まれている                     |
| NFR-3        | NFR-3-2 | SESSION*TIMEOUT_MS = 30 * 60 \_ 1000         | タイムアウト定数が定義されている                               |
| NFR-3        | NFR-3-3 | IPC ハンドラのエラーサニタイズ               | try-catch + サニタイズ済みエラー返却が設計されている           |
| NFR-3        | NFR-3-4 | SkillDebugger Constructor Injection          | DI パターンが指定されている                                    |

#### 1-3. アーキテクチャ層別要件（AT）カバレッジ検証

| 要件ID | 設計 Phase 2 の該当箇所                     | 検証結果 |
| ------ | ------------------------------------------- | -------- |
| AT-1   | Task 1: DebugSession インターフェース定義   | 確認対象 |
| AT-2   | Task 1: Breakpoint インターフェース定義     | 確認対象 |
| AT-3   | Task 1: DebugStep インターフェース定義      | 確認対象 |
| AT-4   | Task 1: CallStackEntry インターフェース定義 | 確認対象 |
| AT-5   | Task 1: DebugEvent 判別共用型定義           | 確認対象 |
| AT-6   | Task 1: DebugCommand リテラル型定義         | 確認対象 |
| AT-7   | Task 1: ISO 8601 文字列型の使用             | 確認対象 |
| AT-8   | Task 1: index.ts への export 追加           | 確認対象 |
| AT-9   | Task 2: SkillDebugger クラス設計            | 確認対象 |
| AT-10  | Task 2: DebugSession クラス設計             | 確認対象 |
| AT-11  | Task 4: createHooks() メソッド設計          | 確認対象 |
| AT-12  | Task 2: DI パターン記載                     | 確認対象 |
| AT-13  | Task 6: IPC シリアライズ方針                | 確認対象 |
| AT-14  | Task 2: activeSession フィールド設計        | 確認対象 |
| AT-15  | Task 3: 7チャネルの一覧テーブル             | 確認対象 |
| AT-16  | Task 3: validateIpcSender 使用パターン      | 確認対象 |
| AT-17  | Task 3: P42 バリデーションパターン          | 確認対象 |
| AT-18  | Task 3: webContents.send 使用設計           | 確認対象 |
| AT-19  | Task 3: エラーサニタイズパターン            | 確認対象 |
| AT-20  | Task 5: channels.ts チャネル定数追加        | 確認対象 |
| AT-21  | Task 5: SkillAPI.debug プロパティ追加       | 確認対象 |
| AT-22  | Task 5: types.ts re-export 追加             | 確認対象 |
| AT-23  | Task 5: safeOn パターン使用                 | 確認対象 |
| AT-24  | Task 5: IPC_CHANNELS 定数参照               | 確認対象 |

---

### Task 2: IPC 契約検証（P42/P44/P45 準拠チェック）

`ipc-contract-checklist.md` の Phase 1-6 に基づき、7つの IPC チャネルの契約を検証する。

#### 2-1. チャネル別契約検証

各チャネルについて以下を検証:

**検証項目（ipc-contract-checklist.md Phase 1-6）:**

| Phase | 検証内容                                          | 検証方法                                          |
| ----- | ------------------------------------------------- | ------------------------------------------------- |
| 1     | 変更前の契約確認（新規チャネルのため該当なし）    | 新規作成であることを確認                          |
| 2     | ハンドラ引数型とPreload側呼び出し型の一致         | 型定義テーブルで突合                              |
| 3     | 引数名のセマンティクスが実際の値と一致（P45対策） | フィールド名と用途の対応を検証                    |
| 4     | P42準拠3段バリデーションの適用                    | 全文字列フィールドにバリデーションがあるか確認    |
| 5     | エラーレスポンスのサニタイズ                      | 内部情報が漏洩しない形式であるか確認              |
| 6     | 型定義ファイルの同時更新                          | shared/types + preload/types の両方に定義があるか |

#### 2-2. `skill:debug:start` 契約検証

| 検証項目                          | Main ハンドラ側            | Preload 側                           | 一致     |
| --------------------------------- | -------------------------- | ------------------------------------ | -------- |
| 引数型                            | `DebugStartRequest`        | `{ skillName, prompt, breakpoints }` | 確認対象 |
| skillName フィールド型            | `string`                   | `string`                             | 確認対象 |
| prompt フィールド型               | `string`                   | `string`                             | 確認対象 |
| breakpoints フィールド型          | `Omit<Breakpoint, "id">[]` | `Omit<Breakpoint, "id">[]`           | 確認対象 |
| 戻り値型                          | `DebugSession`（IPC JSON） | `Promise<DebugSession>`              | 確認対象 |
| P42 バリデーション（skillName）   | typeof + trim チェック     | -（Main側で検証）                    | 確認対象 |
| P42 バリデーション（prompt）      | typeof + trim チェック     | -（Main側で検証）                    | 確認対象 |
| P42 バリデーション（breakpoints） | Array.isArray チェック     | -（Main側で検証）                    | 確認対象 |
| P45 命名一致                      | skillName = スキル名       | skillName = スキル名                 | 確認対象 |

#### 2-3. `skill:debug:command` 契約検証

| 検証項目                        | Main ハンドラ側            | Preload 側               | 一致     |
| ------------------------------- | -------------------------- | ------------------------ | -------- |
| 引数型                          | `DebugCommandRequest`      | `{ sessionId, command }` | 確認対象 |
| sessionId フィールド型          | `string`                   | `string`                 | 確認対象 |
| command フィールド型            | `DebugCommand`             | `DebugCommand`           | 確認対象 |
| P42 バリデーション（sessionId） | typeof + trim チェック     | -（Main側で検証）        | 確認対象 |
| command 値域検証                | validCommands 配列チェック | -（型制約のみ）          | 確認対象 |
| P45 命名一致                    | sessionId = セッションID   | sessionId = セッションID | 確認対象 |

#### 2-4. `skill:debug:breakpoint:add` 契約検証

| 検証項目                        | Main ハンドラ側             | Preload 側                  | 一致     |
| ------------------------------- | --------------------------- | --------------------------- | -------- |
| 引数型                          | `DebugBreakpointAddRequest` | `{ sessionId, breakpoint }` | 確認対象 |
| sessionId フィールド型          | `string`                    | `string`                    | 確認対象 |
| breakpoint フィールド型         | `Omit<Breakpoint, "id">`    | `Omit<Breakpoint, "id">`    | 確認対象 |
| 戻り値型                        | `Breakpoint`（ID付き）      | `Promise<Breakpoint>`       | 確認対象 |
| P42 バリデーション（sessionId） | typeof + trim チェック      | -（Main側で検証）           | 確認対象 |

#### 2-5. `skill:debug:breakpoint:remove` 契約検証

| 検証項目                           | Main ハンドラ側                   | Preload 側                        | 一致     |
| ---------------------------------- | --------------------------------- | --------------------------------- | -------- |
| 引数型                             | `DebugBreakpointRemoveRequest`    | `{ sessionId, breakpointId }`     | 確認対象 |
| sessionId フィールド型             | `string`                          | `string`                          | 確認対象 |
| breakpointId フィールド型          | `string`                          | `string`                          | 確認対象 |
| P42 バリデーション（sessionId）    | typeof + trim チェック            | -（Main側で検証）                 | 確認対象 |
| P42 バリデーション（breakpointId） | typeof + trim チェック            | -（Main側で検証）                 | 確認対象 |
| P45 命名一致                       | breakpointId = ブレークポイントID | breakpointId = ブレークポイントID | 確認対象 |

#### 2-6. `skill:debug:inspect` 契約検証

| 検証項目                        | Main ハンドラ側        | Preload 側            | 一致     |
| ------------------------------- | ---------------------- | --------------------- | -------- |
| 引数型                          | `DebugInspectRequest`  | `{ sessionId, path }` | 確認対象 |
| sessionId フィールド型          | `string`               | `string`              | 確認対象 |
| path フィールド型               | `string`               | `string`              | 確認対象 |
| 戻り値型                        | `unknown`              | `Promise<unknown>`    | 確認対象 |
| P42 バリデーション（sessionId） | typeof + trim チェック | -（Main側で検証）     | 確認対象 |
| P42 バリデーション（path）      | typeof + trim チェック | -（Main側で検証）     | 確認対象 |

#### 2-7. `skill:debug:evaluate` 契約検証

| 検証項目                         | Main ハンドラ側         | Preload 側                       | 一致     |
| -------------------------------- | ----------------------- | -------------------------------- | -------- |
| 引数型                           | `DebugEvaluateRequest`  | `{ sessionId, expression }`      | 確認対象 |
| sessionId フィールド型           | `string`                | `string`                         | 確認対象 |
| expression フィールド型          | `string`                | `string`                         | 確認対象 |
| 戻り値型                         | `DebugEvaluateResponse` | `Promise<DebugEvaluateResponse>` | 確認対象 |
| P42 バリデーション（sessionId）  | typeof + trim チェック  | -（Main側で検証）                | 確認対象 |
| P42 バリデーション（expression） | typeof + trim チェック  | -（Main側で検証）                | 確認対象 |

#### 2-8. `skill:debug:event` 契約検証（一方向チャネル）

| 検証項目       | Main 側（送信）               | Preload 側（受信）                        | 一致     |
| -------------- | ----------------------------- | ----------------------------------------- | -------- |
| 送信方法       | `webContents.send`            | `safeOn`（リスナー登録）                  | 確認対象 |
| データ型       | `DebugEvent`                  | `(event: DebugEvent) => void`             | 確認対象 |
| クリーンアップ | -（Main側は送信のみ）         | クリーンアップ関数を返却                  | 確認対象 |
| ウィンドウ限定 | `this.mainWindow.webContents` | -（受信側は自動的にターゲットウィンドウ） | 確認対象 |

---

### Task 3: セキュリティレビュー

#### 3-1. 式評価サンドボックス検証

| 検証項目                                           | 設計箇所                                     | 判定基準                                            |
| -------------------------------------------------- | -------------------------------------------- | --------------------------------------------------- |
| `process` オブジェクトへのアクセスがブロックされる | evaluateInSandbox: `process: undefined`      | sandbox オブジェクトで undefined に設定されている   |
| `require` 関数へのアクセスがブロックされる         | evaluateInSandbox: `require: undefined`      | sandbox オブジェクトで undefined に設定されている   |
| `fs` モジュールへのアクセスがブロックされる        | evaluateInSandbox: `fs: undefined`           | sandbox オブジェクトで undefined に設定されている   |
| `__dirname`/`__filename` がブロックされる          | evaluateInSandbox: 両方 `undefined`          | sandbox オブジェクトで undefined に設定されている   |
| `global`/`globalThis` がブロックされる             | evaluateInSandbox: 両方 `undefined`          | sandbox オブジェクトで undefined に設定されている   |
| タイムアウト（5秒）が設定されている                | vm.Script.runInContext: `timeout: timeoutMs` | timeout パラメータが設定されている                  |
| 条件式評価のタイムアウト（1秒）が設定されている    | evaluateConditionSync: `timeout: 1_000`      | 短いタイムアウトが設定されている                    |
| vm.createContext でコンテキスト分離されている      | evaluateInSandbox: `createContext(sandbox)`  | vm モジュールによるコンテキスト分離が使用されている |

**追加検証項目（設計時に確認すべきリスク）:**

| リスク                                    | 対策                                                                | 検証結果 |
| ----------------------------------------- | ------------------------------------------------------------------- | -------- |
| `eval()` による二次式評価                 | vm.createContext のサンドボックス内では eval のスコープも限定される | 確認対象 |
| `Function` コンストラクタによるコード生成 | vm.createContext 内では Function もスコープ限定される               | 確認対象 |
| Prototype pollution による脱出            | variables のシャローコピー（`...variables`）で元オブジェクトを保護  | 確認対象 |
| 無限再帰によるスタックオーバーフロー      | vm の timeout で検出可能（V8 レベルでの制限）                       | 確認対象 |
| 大量メモリ確保による DoS                  | vm の timeout で間接的に制限（メモリ制限は別途検討の余地あり）      | 確認対象 |

#### 3-2. 入力バリデーション検証

| チャネル                        | 文字列フィールド | P42 3段バリデーション | 検証結果 |
| ------------------------------- | ---------------- | --------------------- | -------- |
| `skill:debug:start`             | skillName        | typeof + trim         | 確認対象 |
| `skill:debug:start`             | prompt           | typeof + trim         | 確認対象 |
| `skill:debug:command`           | sessionId        | typeof + trim         | 確認対象 |
| `skill:debug:command`           | command          | validCommands 配列    | 確認対象 |
| `skill:debug:breakpoint:add`    | sessionId        | typeof + trim         | 確認対象 |
| `skill:debug:breakpoint:remove` | sessionId        | typeof + trim         | 確認対象 |
| `skill:debug:breakpoint:remove` | breakpointId     | typeof + trim         | 確認対象 |
| `skill:debug:inspect`           | sessionId        | typeof + trim         | 確認対象 |
| `skill:debug:inspect`           | path             | typeof + trim         | 確認対象 |
| `skill:debug:evaluate`          | sessionId        | typeof + trim         | 確認対象 |
| `skill:debug:evaluate`          | expression       | typeof + trim         | 確認対象 |

#### 3-3. 送信元検証

| チャネル                        | validateIpcSender 使用 | getAllowedWindows 設定 | 検証結果 |
| ------------------------------- | ---------------------- | ---------------------- | -------- |
| `skill:debug:start`             | 設計に含まれている     | `[mainWindow]`         | 確認対象 |
| `skill:debug:command`           | 設計に含まれている     | `[mainWindow]`         | 確認対象 |
| `skill:debug:breakpoint:add`    | 設計に含まれている     | `[mainWindow]`         | 確認対象 |
| `skill:debug:breakpoint:remove` | 設計に含まれている     | `[mainWindow]`         | 確認対象 |
| `skill:debug:inspect`           | 設計に含まれている     | `[mainWindow]`         | 確認対象 |
| `skill:debug:evaluate`          | 設計に含まれている     | `[mainWindow]`         | 確認対象 |

#### 3-4. エラーサニタイズ検証

| 検証項目                                   | 設計箇所                                            | 判定基準                                     |
| ------------------------------------------ | --------------------------------------------------- | -------------------------------------------- |
| スタックトレースが Renderer に送信されない | catch 句: `error.message` のみ抽出                  | Error オブジェクト全体ではなくメッセージのみ |
| エラーコードが定義されている               | `"VALIDATION_ERROR"`, `"DEBUG_ERROR"`               | 構造化エラーが使用されている                 |
| 内部パス情報が漏洩しない                   | evaluateInSandbox: `"Expression evaluation failed"` | 汎用メッセージが使用されている               |

---

### Task 4: 統合テスト観点レビュー

#### 4-1. Phase 4（テスト作成）で必須のテスト観点

| テスト観点                                  | 対応要件         | 優先度 | テスト種別 |
| ------------------------------------------- | ---------------- | ------ | ---------- |
| セッション開始・終了ライフサイクル          | FR-1-1〜FR-1-6   | 必須   | 単体       |
| 状態遷移の正当性・不正遷移の拒否            | FR-1-3, FR-1-4   | 必須   | 単体       |
| ブレークポイントタイプ別マッチング          | FR-2-1〜FR-2-3   | 必須   | 単体       |
| 条件付きブレークポイント                    | FR-2-4           | 必須   | 単体       |
| ブレークポイント動的追加・削除              | FR-2-6           | 必須   | 単体       |
| 6種類のデバッグコマンド実行                 | FR-3-1〜FR-3-6   | 必須   | 単体       |
| ステップ記録（stepNumber, type, timestamp） | FR-3-7, FR-3-8   | 必須   | 単体       |
| 変数インスペクション（ドット区切りパス）    | FR-4-1           | 必須   | 単体       |
| 式評価（正常系・異常系）                    | FR-5-1〜FR-5-4   | 必須   | 単体       |
| コールスタック push/pop                     | FR-6-1, FR-6-2   | 必須   | 単体       |
| デバッグイベント発火（4種類）               | FR-7-1〜FR-7-5   | 必須   | 単体       |
| サンドボックス脱出防止                      | NFR-1-1, NFR-1-6 | 必須   | 単体       |
| タイムアウト強制終了                        | NFR-1-4, NFR-2-5 | 必須   | 単体       |
| IPC バリデーション（P42 3段階）             | NFR-1-3          | 必須   | 単体       |
| セッション排他制御                          | FR-1-6           | 必須   | 統合       |
| Hooks 統合（PreToolUse/PostToolUse）        | AT-11            | 必須   | 統合       |
| IPC エンドツーエンド（7チャネル）           | AT-15            | 必須   | 統合       |
| セッション自動タイムアウト（30分）          | NFR-3-2          | 必須   | 統合       |
| 異常終了クリーンアップ                      | NFR-3-1          | 必須   | 統合       |

#### 4-2. テストモック戦略

| モック対象        | モック方法                                     | 使用テスト観点                      |
| ----------------- | ---------------------------------------------- | ----------------------------------- |
| SkillExecutor     | vi.fn() でquery() をモック                     | セッションライフサイクル、Hooks統合 |
| BrowserWindow     | webContents.send をモック                      | イベント発火、IPC送信               |
| vm モジュール     | 実際の vm を使用（サンドボックステストのため） | 式評価、セキュリティ                |
| validateIpcSender | vi.fn() で戻り値を制御                         | IPC バリデーション                  |
| crypto.randomUUID | vi.fn() で固定値を返却                         | ID 生成の予測可能性                 |

---

### Task 5: レビューゲート判定

#### 5-1. 判定基準

| 判定     | 条件                                                                     |
| -------- | ------------------------------------------------------------------------ |
| PASS     | Task 1-4 の全検証項目が「確認済み」で、指摘事項なし                      |
| MINOR    | 1-3件の軽微な指摘があるが、機能・セキュリティに影響しない                |
| MAJOR    | 4件以上の指摘、またはセキュリティ・アーキテクチャに構造的な問題がある    |
| CRITICAL | セキュリティ脆弱性（サンドボックス脱出、バリデーション欠落）が検出された |

#### 5-2. 判定後のアクション

| 判定     | アクション                                                                 |
| -------- | -------------------------------------------------------------------------- |
| PASS     | Phase 4（テスト作成）へ進む                                                |
| MINOR    | 指摘事項を未タスク仕様書に変換し、Phase 4 へ進む（未タスク変換は省略不可） |
| MAJOR    | 指摘の性質に応じて Phase 1（要件問題）または Phase 2（設計問題）へ戻る     |
| CRITICAL | Phase 1 へ戻り、セキュリティ要件を再確認する                               |

#### 5-3. レビュー結果記録テンプレート

```markdown
### レビュー結果

| 項目       | 結果                              |
| ---------- | --------------------------------- |
| レビュー日 | 2026-02-27                        |
| 判定       | [PASS / MINOR / MAJOR / CRITICAL] |
| 指摘件数   | [N] 件                            |
| 次のPhase  | [Phase 4 / Phase 1 / Phase 2]     |

#### 指摘事項一覧（該当する場合）

| ID  | 種別                   | 内容               | 対応方針   | 対応先               |
| --- | ---------------------- | ------------------ | ---------- | -------------------- |
| R-1 | [MINOR/MAJOR/CRITICAL] | [具体的な指摘内容] | [修正方針] | [Phase N / 未タスク] |
```

---

## 統合テスト連携

| 連携先Phase | 内容                                                     |
| ----------- | -------------------------------------------------------- |
| Phase 1     | 要件との整合性不備が検出された場合に差し戻し             |
| Phase 2     | 設計上の問題が検出された場合に差し戻し                   |
| Phase 4     | レビュー PASS 後、テスト観点をテストケース設計に引き継ぐ |

## 多角的チェック観点

| 観点               | 適用判断 | 仕様参照先                                        |
| ------------------ | -------- | ------------------------------------------------- |
| セキュリティ       | 必須     | aiworkflow-requirements: security-electron-ipc.md |
| UI/UX              | 非該当   | -                                                 |
| アーキテクチャ     | 必須     | aiworkflow-requirements: architecture-overview.md |
| API設計            | 必須     | aiworkflow-requirements: api-ipc-agent.md         |
| データ整合性       | 非該当   | -                                                 |
| エラーハンドリング | 必須     | aiworkflow-requirements: error-handling.md        |
| パフォーマンス     | 対象限定 | aiworkflow-requirements: quality-requirements.md  |
| アクセシビリティ   | 非該当   | -                                                 |
| テスタビリティ     | 必須     | aiworkflow-requirements: quality-requirements.md  |

### Electronデスクトップアプリ観点

| 層                         | 適用判断 | 仕様参照先                                             |
| -------------------------- | -------- | ------------------------------------------------------ |
| フロントエンド（Renderer） | 契約確認 | aiworkflow-requirements: interfaces-agent-sdk-skill.md |
| バックエンド（Main）       | 必須     | aiworkflow-requirements: arch-electron-services.md     |
| IPC通信                    | 必須     | aiworkflow-requirements: api-ipc-agent.md              |
| Preload/セキュリティ       | 必須     | aiworkflow-requirements: security-api-electron.md      |
| ローカルストレージ         | 非該当   | -                                                      |

## 成果物

| 成果物           | ファイル                 | 内容                                                        |
| ---------------- | ------------------------ | ----------------------------------------------------------- |
| 設計レビュー結果 | phase-3-design-review.md | 要件整合性・IPC契約・セキュリティ・テスト観点のレビュー結果 |

## 完了条件

- [ ] 機能要件（FR-1〜FR-7）の全項目が設計に反映されていることを検証済みである
- [ ] 非機能要件（NFR-1〜NFR-3）の全項目が設計に反映されていることを検証済みである
- [ ] アーキテクチャ層別要件（AT-1〜AT-24）の全項目が設計に反映されていることを検証済みである
- [ ] 7つの IPC チャネルの契約検証（ipc-contract-checklist.md Phase 1-6 準拠）が完了している
- [ ] 式評価サンドボックスのセキュリティ検証（ブロック対象、タイムアウト、コンテキスト分離）が完了している
- [ ] 全文字列フィールドの P42 準拠3段バリデーションが設計に含まれていることを検証済みである
- [ ] 全 IPC ハンドラの validateIpcSender 使用が設計に含まれていることを検証済みである
- [ ] P45 準拠の引数名セマンティクス一致が全チャネルで検証済みである
- [ ] 統合テスト観点（19項目）がリストアップされ、Phase 4 への引き継ぎ準備が完了している
- [ ] テストモック戦略（5つのモック対象）が定義されている
- [ ] レビューゲート判定（PASS/MINOR/MAJOR/CRITICAL）が記録されている
- [ ] MINOR 指摘がある場合、全件が未タスク仕様書に変換されている

## サブタスク管理

1. SubAgent はタスク完了時に成果物を指定パスに出力する
2. 全 SubAgent の完了を確認後、成果物の統合確認を行う
3. 不整合がある場合は該当 SubAgent のタスクを再実行する
4. 全成果物の整合性が確認できたら Phase 完了とする

## タスク100%実行確認

- [ ] 全 Task（Task 1〜5）が実行完了している
- [ ] 完了条件の全項目がチェック済みである
- [ ] 成果物が指定パスに出力されている
- [ ] レビューゲート判定結果が記録されている
- [ ] 次 Phase（Phase 4）の入力として十分な情報が含まれている

## 次のPhase

Phase 4: テスト作成（phase-4-test-creation.md）
