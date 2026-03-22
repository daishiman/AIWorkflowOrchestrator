# Phase 2 成果物: 検証マトリクス

## メタ情報

| 項目       | 内容                                              |
| ---------- | ------------------------------------------------- |
| タスクID   | TASK-IMP-TERMINAL-HANDOFF-SURFACE-REALIZATION-001 |
| Phase      | 2（設計）                                         |
| 成果物種別 | 検証マトリクス                                    |
| 作成日     | 2026-03-22                                        |

---

## 1. Phase 3 設計レビュー観点

### 1.1 Manual Boundary 破り チェック項目

設計上「禁止」と定めた操作が設計書内に混入していないかを確認する。

| チェック項目                                         | 確認方法                                           | PASS 条件                                         |
| ---------------------------------------------------- | -------------------------------------------------- | ------------------------------------------------- |
| auto-send が設計書に許容操作として含まれていないこと | contract-matrix.md 2.2 禁止操作を参照              | auto-send が禁止行にのみ存在する                  |
| hidden injection の設計上の余地がないこと            | action 契約の「動作制約」列を全行確認              | inject 用の hook / escape hatch がない            |
| headless execution が設計書から除外されていること    | state 遷移図に user action なし実行パスがない      | state 遷移図で user action なしのコマンド実行なし |
| Renderer が capability を local 判定していないこと   | ownership 契約 3.2 で Renderer が owner でないこと | capability 判定の Renderer = 禁止 / consumer のみ |

### 1.2 DTO 重複 チェック項目

同一情報が複数の DTO で表現され、乖離が生じるリスクを確認する。

| チェック項目                                             | 確認方法                                                  | PASS 条件                                      |
| -------------------------------------------------------- | --------------------------------------------------------- | ---------------------------------------------- |
| HandoffGuidance が全 consumer の統一 DTO であること      | design-summary.md Consumer DTO マッピングを参照           | 全 consumer が HandoffGuidance を消費          |
| TerminalHandoffBundle が Renderer に露出していないこと   | contract-matrix.md 3.2 Ownership で Renderer = 禁止       | Renderer 欄が「禁止」                          |
| SkillDocsCapabilityResult が Renderer に露出していること | IPC 通過型ルール table を参照                             | packages/shared 配置で Renderer 参照可         |
| 同一フィールドが2つの DTO に存在しないこと               | HandoffGuidance vs TerminalHandoffBundle のフィールド比較 | 重複フィールドなし（BuilderForSurface が変換） |

### 1.3 UI Drift チェック項目

surface ごとに TerminalHandoffCard の見た目・CTA・動作が乖離するリスクを確認する。

| チェック項目                                                    | 確認方法                                                   | PASS 条件                                                   |
| --------------------------------------------------------------- | ---------------------------------------------------------- | ----------------------------------------------------------- |
| CTA ラベルが全 surface で統一されていること                     | i18n key 一覧（cta.copyCommand / cta.dismiss）の一意性確認 | 同一 i18n key を全 surface が使用している                   |
| TerminalHandoffCard が全 surface で同一コンポーネントであること | design-summary.md Concern-B の「コンポーネント」欄を確認   | 「TerminalHandoffCard（organisms 層）を全 consumer で共有」 |
| guidance-only 時に TerminalHandoffCard を表示しないこと         | contract-matrix.md 1.3 Handoff 状態別表示ルールを参照      | guidance-only → GuidanceBlock（TerminalHandoffCard でない） |
| surface ごとに独自 CTA が追加されていないこと                   | CTA 仕様の Primary + Secondary が 2 個以内であること       | 全状態で CTA 総数 ≤ 2                                       |

---

## 2. Phase 4 テスト観点

### 2.1 Unit Test 対象シナリオ

| TC-ID | 対象                   | テスト観点                                                         | 優先度 |
| ----- | ---------------------- | ------------------------------------------------------------------ | ------ |
| UT-01 | toHandoffGuidance()    | `capability === "guidance-only"` → HandoffGuidance を返す          | 高     |
| UT-02 | toHandoffGuidance()    | `capability === "terminal-handoff"` → HandoffGuidance を返す       | 高     |
| UT-03 | toHandoffGuidance()    | `capability === "integrated-api"` → null を返す                    | 高     |
| UT-04 | toHandoffGuidance()    | `guidance === undefined` 時に fallback テキストを返す              | 中     |
| UT-05 | toHandoffGuidance()    | `reason === undefined` 時に fallback テキストを返す                | 中     |
| UT-06 | TerminalHandoffCard    | `handoffGuidance` が null の場合に何も render しない               | 高     |
| UT-07 | TerminalHandoffCard    | copy command button 押下で clipboard に terminalCommand を書き込む | 高     |
| UT-08 | TerminalHandoffCard    | dismiss button 押下で `clearHandoffGuidance()` が呼ばれる          | 高     |
| UT-09 | TerminalHandoffCard    | terminalCommand / contextSummary が表示される                      | 高     |
| UT-10 | assertNoSilentFallback | `capability === "none"` → エラーを throw する                      | 高     |
| UT-11 | assertNoSilentFallback | `capability !== "none"` → エラーを throw しない                    | 中     |
| UT-12 | TerminalHandoffBuilder | API key パターン（`sk-`, `Bearer`）を terminalCommand に含めない   | 高     |
| UT-13 | TerminalHandoffBuilder | shell メタ文字がエスケープされている                               | 高     |

### 2.2 Integration Test 対象シナリオ

| TC-ID | 対象                          | テスト観点                                                                             | 優先度 |
| ----- | ----------------------------- | -------------------------------------------------------------------------------------- | ------ |
| IT-01 | chatEditHandlers handoff path | `resolution.type === "terminal_handoff"` → HandoffGuidance が IPC レスポンスに含まれる | 高     |
| IT-02 | chatEditHandlers normal path  | `resolution.type !== "terminal_handoff"` → HandoffGuidance が null                     | 中     |
| IT-03 | SkillDocsCapabilityResolver   | `guidance-only` → toHandoffGuidance → HandoffGuidance が返される                       | 高     |
| IT-04 | SkillDocsCapabilityResolver   | `terminal-handoff` → toHandoffGuidance → HandoffGuidance が返される                    | 高     |
| IT-05 | SkillDocsCapabilityResolver   | `integrated-api` → HandoffGuidance が null で返される                                  | 中     |
| IT-06 | Launcher → terminal dock      | launcher button 押下 → dock open → auto-send が発生しない                              | 高     |
| IT-07 | Launcher → terminal dock      | dock close → reopen で transcript が保持されている                                     | 中     |
| IT-08 | IPC contract                  | TerminalHandoffBundle が IPC レスポンスに含まれない（non-null assertion なし）         | 高     |

### 2.3 Contract Test 対象シナリオ

P60 対策として IPC レスポンス形式の一致を contract test で検証する。

| TC-ID | 対象                  | テスト観点                                                                   | 優先度 |
| ----- | --------------------- | ---------------------------------------------------------------------------- | ------ |
| CT-01 | HandoffGuidance IPC   | レスポンスが `{ success: true, data: HandoffGuidance }` 形式である           | 高     |
| CT-02 | HandoffGuidance IPC   | エラー時が `{ success: false, error: { code, message } }` 形式である         | 高     |
| CT-03 | SkillDocsCapability   | レスポンスが `{ success: true, data: SkillDocsCapabilityResult }` 形式である | 中     |
| CT-04 | HandoffGuidance props | TerminalHandoffCard が受け取る props が HandoffGuidance 型に一致する         | 高     |

---

## 3. Phase 11 手動テスト観点

### 3.1 TC-ID リスト（screenshot / walkthrough）

| TC-ID    | 画面状態                                | 検証観点                                                       | スクリーンショット要否 |
| -------- | --------------------------------------- | -------------------------------------------------------------- | ---------------------- |
| TC-MAN-1 | TerminalHandoffCard 表示中              | terminalCommand / contextSummary の表示、copy / dismiss CTA    | 要                     |
| TC-MAN-2 | TerminalHandoffCard: copy 完了          | clipboard 書き込み成功フィードバック（コピー完了インジケータ） | 要                     |
| TC-MAN-3 | TerminalHandoffCard: dismiss 後         | カード非表示、state クリア確認                                 | 要                     |
| TC-MAN-4 | persistent launcher（App Shell Header） | 右上固定、統一ラベル、アイコン表示                             | 要                     |
| TC-MAN-5 | terminal dock open（bottom sheet）      | transcript 表示、auto-send が発生していないこと                | 要                     |
| TC-MAN-6 | terminal dock close → reopen            | transcript が保持されていること                                | 要                     |
| TC-MAN-7 | guidance-only 状態                      | GuidanceBlock 表示 + 設定画面への導線が存在すること            | 要                     |
| TC-MAN-8 | blocked 状態（capability === "none"）   | 設定画面への導線が表示され、実行ボタンが非表示であること       | 要                     |
| TC-MAN-9 | unavailable 状態（CLI 未インストール）  | launcher button が disabled で tooltip が表示されること        | 要                     |

### 3.2 Manual Boundary 確認 Walkthrough

| MB-ID | 確認内容                                                    | 手順                                     | 期待結果                                                     |
| ----- | ----------------------------------------------------------- | ---------------------------------------- | ------------------------------------------------------------ |
| MB-1  | terminal dock open 時にコマンドが自動送信されないこと       | launcher を押して dock を開く            | input は空のまま。ユーザー操作が必要                         |
| MB-2  | terminalCommand に API key が含まれないこと                 | copy command して clipboard を確認する   | command に `sk-` / `Bearer` がない                           |
| MB-3  | TerminalHandoffCard に hidden prompt が inject されないこと | DevTools で DOM を確認する               | 表示内容が HandoffGuidance のみ                              |
| MB-4  | headless execution が発生しないこと                         | ユーザー操作なしで 30 秒待機する         | コマンドが自動実行されない                                   |
| MB-5  | guidance-only 時に TerminalHandoffCard が表示されないこと   | API key を未設定にして Skill Docs を開く | GuidanceBlock が表示され、TerminalHandoffCard が表示されない |

---

## 4. Known Pitfall 対策チェック

### 4.1 P5: リスナー二重登録

| 対策チェック項目                                              | PASS 条件                                                            |
| ------------------------------------------------------------- | -------------------------------------------------------------------- |
| IPC リスナーが一度だけ登録されるガードが設計に含まれること    | `ipcMain.handle()` の二重登録ガードが設計書に記述済み                |
| React StrictMode の二重実行に対するガードが設計に含まれること | Renderer の useEffect リスナー登録にモジュールレベルガードが定義済み |

### 4.2 P42: .trim() バリデーション漏れ

| 対策チェック項目                                                           | PASS 条件                                                                                    |
| -------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| open working directory の IPC 引数に P42 3段バリデーションが適用されること | contract-matrix.md 5.3 に `typeof === "string"` → `=== ""` → `.trim() === ""` の順が記載済み |
| workspacePath の IPC handler が 3 段バリデーションを実装すること           | Phase 4 のテスト設計に UT-PATH-01（空文字列）/ UT-PATH-02（スペースのみ）が含まれること      |

### 4.3 P44: IPC 引数命名の契約ドリフト

| 対策チェック項目                                                   | PASS 条件                                                                   |
| ------------------------------------------------------------------ | --------------------------------------------------------------------------- |
| IPC handler の引数名がセマンティクスに一致していること             | contract-matrix.md 4.1 HandoffGuidance フィールド名が実際の値と一致している |
| Preload 側の呼び出し引数と Main 側の受け取り引数が一致していること | Phase 3 設計レビューで IPC contract checklist を実施している                |
| P65 dead-end namespace が発生しないこと                            | design-summary.md に IPC channel namespace の一覧が記載されている           |

### 4.4 P48: non-null assertion による安全性偽装

| 対策チェック項目                                                                  | PASS 条件                                                                                   |
| --------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| HandoffGuidance の IPC レスポンスで non-null assertion を使用しないこと           | contract-matrix.md の DTO 不変条件に non-null assertion 禁止が明記されている                |
| SkillDocsCapabilityResult のフィールドアクセスに optional chaining を使用すること | UT-04 / UT-05 で `guidance === undefined` / `reason === undefined` の場合のテストが定義済み |

### 4.5 P62: DEFAULT_CONFIG への暗黙 fallback

| 対策チェック項目                                                              | PASS 条件                                                                             |
| ----------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| `capability === "none"` が `integratedRuntime` に暗黙変換されないこと         | contract-matrix.md 1.2 に P62 対策が明記され、`assertNoSilentFallback` 設計が定義済み |
| `assertNoSilentFallback` の unit test が Phase 4 に含まれること               | UT-10 / UT-11 が unit test 一覧に定義済み                                             |
| capabilityResolver の出口で `assertNoSilentFallback` が呼ばれる設計であること | design-summary.md の state 遷移図に `assertNoSilentFallback` 呼び出しが記述されている |

---

## 5. AC 検証マトリクス（Phase 別進捗管理）

| AC   | 検証観点                       | Phase 3 | Phase 4 | Phase 9 | Phase 10 | Phase 11 |
| ---- | ------------------------------ | ------- | ------- | ------- | -------- | -------- |
| AC-1 | launcher UI 責務定義           | review  | test    | QA      | final    | manual   |
| AC-1 | handoff card UI 責務定義       | review  | test    | QA      | final    | manual   |
| AC-2 | copy command 許容操作          | review  | test    | QA      | final    | manual   |
| AC-2 | copy context 許容操作          | review  | test    | QA      | final    | manual   |
| AC-2 | open working dir 許容操作      | review  | test    | QA      | final    | manual   |
| AC-3 | guidance-only 同一 DTO         | review  | test    | QA      | final    | -        |
| AC-3 | Skill Docs consumer adapter    | review  | test    | QA      | final    | -        |
| AC-4 | auto-send 禁止                 | review  | test    | QA      | final    | manual   |
| AC-4 | hidden injection 禁止          | review  | test    | QA      | final    | manual   |
| AC-4 | screenshot 契約（TC-MAN-1〜9） | -       | -       | -       | -        | manual   |
