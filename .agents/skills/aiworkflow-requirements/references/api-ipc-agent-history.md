# Agent Dashboard・Workspace Chat Edit IPC / history bundle

> 親仕様書: [api-ipc-agent.md](api-ipc-agent.md)
> 役割: history bundle

## 完了タスク

### Workspace Chat Edit Main Process（2026-01-25完了）

| 項目         | 内容                                                           |
| ------------ | -------------------------------------------------------------- |
| タスクID     | TASK-WCE-MAIN-001                                              |
| Issue        | #469                                                           |
| ステータス   | **完了**                                                       |
| 実装内容     | FileService, ContextBuilder, ChatEditService, chatEditHandlers |
| テスト数     | 164（自動）+ 23（手動検証項目）                                |
| カバレッジ   | Line 92.55%, Branch 92.85%                                     |
| ドキュメント | `docs/30-workflows/workspace-chat-edit-main-process/`          |

### Workspace管理統合（TASK-WCE-WORKSPACE-001）2026-02-02完了

| 項目         | 内容                                                                                    |
| ------------ | --------------------------------------------------------------------------------------- |
| タスクID     | TASK-WCE-WORKSPACE-001                                                                  |
| Issue        | #660                                                                                    |
| ステータス   | **完了**                                                                                |
| 実装内容     | workspacePathパラメータ追加、isWithinWorkspace検証、folderFileTreesからファイル一覧取得 |
| 修正ファイル | chatEditHandlers.ts, useFileContext.ts, fileTreeUtils.ts（新規）                        |
| テスト数     | 45（ユニット＋統合）                                                                    |
| カバレッジ   | Line 95%, Branch 90%, Function 100%                                                     |
| ドキュメント | `docs/30-workflows/TASK-WCE-WORKSPACE-001/`                                             |

### Monaco Editor選択範囲取得（TASK-WCE-MONACO-001）2026-02-03完了

| 項目         | 内容                                                                          |
| ------------ | ----------------------------------------------------------------------------- |
| タスクID     | TASK-WCE-MONACO-001                                                           |
| ステータス   | **完了**                                                                      |
| 実装内容     | Monaco Editorの選択範囲をMain Processから取得するAPI実装                      |
| 新規ファイル | editorSelection.ts（Renderer）、chatEditHandlers.selection.test.ts（テスト）  |
| 修正ファイル | chatEditHandlers.ts、index.ts                                                 |
| テスト数     | 26（editorSelection: 14、chatEditHandlers.selection: 12）                     |
| カバレッジ   | Line 100%, Branch 100%                                                        |
| ドキュメント | `docs/30-workflows/TASK-WCE-MONACO-001/outputs/`                              |

**テスト結果サマリー**:

| テストファイル                     | テスト数 | 成功 | 失敗 | 時間  |
| ---------------------------------- | -------- | ---- | ---- | ----- |
| editorSelection.test.ts            | 14       | 14   | 0    | 51ms  |
| chatEditHandlers.selection.test.ts | 12       | 12   | 0    | 202ms |

**成果物テーブル**:

| Phase | 成果物                   | ファイル                    |
| ----- | ------------------------ | --------------------------- |
| 1     | 要件定義書               | requirements-definition.md  |
| 1     | 受け入れ基準             | acceptance-criteria.md      |
| 1     | スコープ定義             | scope-definition.md         |
| 2     | アーキテクチャ設計       | architecture-design.md      |
| 2     | API設計                  | api-design.md               |
| 2     | シーケンス図             | sequence-diagram.md         |
| 3     | 設計レビュー結果         | design-review-result.md     |
| 4     | テスト仕様書             | test-specification.md       |
| 4     | テストケース一覧         | test-cases.md               |
| 4     | 統合テスト設計           | integration-test-design.md  |
| 5     | 実装サマリー             | implementation-summary.md   |
| 6     | テスト拡充レポート       | test-enhancement-report.md  |
| 7     | カバレッジレポート       | coverage-report.md          |
| 8     | リファクタリングレポート | refactoring-report.md       |
| 9     | 品質保証レポート         | qa-report.md                |
| 10    | 最終レビュー結果         | final-review.md             |
| 11    | 手動テスト手順書         | manual-test-procedure.md    |
| 12    | ドキュメント更新         | documentation-update.md     |

---

## 実装パターン参照

> **Progressive Disclosure**: 実装時に参照すべきパターンドキュメント

| 実装課題 | 参照パターン | ドキュメント |
|----------|-------------|--------------|
| Main→Renderer状態取得 | webContents.executeJavaScript逆方向クエリ | [architecture-implementation-patterns.md](./architecture-implementation-patterns.md#main→renderer逆方向クエリパターンtask-wce-monaco-001-2026-02-03実装) |
| IPC通信テスト | Handler Map方式、Partial Mock | [architecture-implementation-patterns.md](./architecture-implementation-patterns.md#ipc通信テストパターンtask-8c-a-2026-02-02実装) |
| E2Eテスト | Electron E2Eセットアップ | [architecture-implementation-patterns.md](./architecture-implementation-patterns.md#e2eテストパターンtask-8c-c-2026-02-02実装) |

---

## 関連ドキュメント

- [APIエンドポイント概要](./api-endpoints.md)
- [認証・プロフィールIPC](./api-ipc-auth.md)
- [システムIPC・プロバイダーAPI](./api-ipc-system.md)
- [LLM Workspace Chat Edit](./llm-workspace-chat-edit.md)
- [実装パターン総合ガイド](./architecture-implementation-patterns.md)

---

---

## 完了タスク

| タスクID   | タスク名                             | 完了日     | 変更内容                                                                         |
| ---------- | ------------------------------------ | ---------- | -------------------------------------------------------------------------------- |
| TASK-FIX-SKILL-CHAIN-HANDLER-REGISTRATION-001 | skill:chain:list ハンドラ登録漏れ修正 | 2026-03-03 | `registerSkillChainHandlers` を `registerAllIpcHandlers` へ追加し、`ipc-double-registration` 回帰テストで登録漏れを検出可能化。関連未タスクとしてバレル公開整合タスクを登録 |
| TASK-FIX-SKILL-AUTH-PREFLIGHT-GUARD-001 | `skill:execute` 認証 preflight ガード | 2026-03-04 | `skill:execute` 失敗契約を `{ success:false, error, errorCode? }` に拡張し、`AUTHENTICATION_ERROR` 伝搬を明文化。`auth-key:exists` の store+env 判定順と Preload `Error.code` 転写を同期 |
| TASK-10A-E-A | IPC契約・セキュリティ整合（shareハンドラー） | 2026-03-05 | `skillHandlers.share.ts` で `IPC_CHANNELS` 定数参照へ統一。sender失敗時 `ERR_2004`、validation系 `ERR_1001`、unknown例外 `ERR_5001` を固定し、Preload契約テスト（60件）/Mainテスト（34件）/手動証跡4件を更新 |
| TASK-9D    | スキルチェーンパイプライン機能       | 2026-02-27 | 5チャンネル追加（skill:chain:list/get/save/delete/execute）、SkillChainStore/SkillChainExecutor追加、共有型 `SkillChainDefinition/Step/Result` 追加。Preload API は TASK-UI-05B（2026-03-02）で実装完了 |
| TASK-9E    | スキルフォーク機能（Skill API）      | 2026-02-28 | `skill:fork` チャネル追加、`SkillForker` サービス新規実装、`forkSkill(options)` Preload API追加、共有型 `SkillForkOptions/Result/Metadata` 追加。59テスト（SkillForker 34 + IPC 25）で契約を検証 |
| TASK-9H    | スキルデバッグモード実装             | 2026-02-27 | 7チャンネル追加（invoke 6 + event 1）、`SkillDebugger` / `DebugSession` / `skill-debug.ts` を実装。`skillDebugHandlers` の登録配線を `registerAllIpcHandlers` へ反映し、129テスト全PASS |
| TASK-9I    | スキルドキュメント生成機能           | 2026-02-28 | 4チャンネル追加（skill:docs:generate/preview/export/templates）、SkillDocGenerator追加、Preload API 4メソッド追加、共有型5種追加、テスト64件PASS |
| TASK-9J    | スキル分析・統計機能                 | 2026-02-28 | 5チャンネル追加（skill:analytics:record/statistics/summary/trend/export）、AnalyticsStore/SkillAnalytics追加、Preload API 5メソッド追加、37テストPASS |
| TASK-9G    | スキルスケジュール実行機能           | 2026-02-27 | 5チャンネル追加（skill:schedule:list/add/update/delete/toggle）、ScheduleStore/SkillScheduler追加、Preload API 5メソッド追加、テスト163件（desktop 158 + shared 5）PASS |
| TASK-9F    | スキル共有・インポート機能           | 2026-02-27 | 3チャンネル追加（skill:importFromSource/export/validateSource）、共有型定義10型新規作成、SkillShareManager実装、92テスト全PASS（Line 94-100%, Branch 90-96%, Function 100%） |
| UT-FIX-SKILL-IMPORT-INTERFACE-001 | skill:import IPCインターフェース不整合修正 | 2026-02-21 | `skill:import` の Mainハンドラー引数契約を `skillName: string` に統一。`skillService.importSkills([skillName])` で配列化する実装を反映 |
| UT-FIX-SKILL-REMOVE-INTERFACE-001 | skill:remove IPCインターフェース不整合修正 | 2026-02-20 | `skill:remove` の Mainハンドラー引数契約を `skillName: string` に統一。空白文字列を拒否する3段バリデーションを追加 |
| TASK-9A-B  | スキルファイル操作IPCハンドラー実装  | 2026-02-19 | 6チャンネル追加（skill:readFile/writeFile/createFile/deleteFile/listBackups/restoreBackup）、Preload API実装、セキュリティ準拠、65テスト全PASS |
| TASK-9B    | SkillCreator IPC拡張反映 | 2026-02-26 | SkillCreator IPC契約を 13チャンネル（12 invoke + 1 progress）へ同期。`skill-creator:improve/fork/share/schedule/debug/generate-docs/stats` を追加反映し、`SkillCreatorProgress` 契約を `phase/percentage/message` に実装準拠化 |
| TASK-9B-H  | SkillCreatorService IPCハンドラー登録 | 2026-02-12 | 6チャンネル追加（5 invoke + 1 progress）、SkillCreatorAPI Preload実装、セキュリティ準拠 |
| UT-IMP-RUNTIME-SKILL-CREATOR-IPC-WIRING-001 | Runtime Skill Creator public IPC wiring | 2026-03-21 | `skill-creator:plan/execute-plan/improve-skill` 3チャネル、shared runtime contract、`skillCreatorHandlers.ts` entrypoint 統合、graceful degradation を同期 |

### TASK-9E 実装時の苦戦箇所（IPC契約観点）

| 苦戦箇所 | 原因 | 解決策（簡潔） |
| --- | --- | --- |
| テスト件数表記が成果物間で 57/59 混在 | 追加テスト後の転記元が複数化した | 正本件数を `task-workflow.md` に固定し、TASK文脈抽出で同期 |
| `skill:fork` と `skill-creator:fork` の用途混同 | 類似チャネル名で契約境界が曖昧だった | API/Interface/Architecture で責務境界を同時追記 |
| path境界判定の抜け | prefix一致判定のみで境界を担保していた | `path.relative` 判定へ統一し、IPC+Service+Securityを同一ターンで更新 |

**TASK-9A-B 派生未タスク**:

| タスクID     | タスク名                                            | 優先度 | 指示書パス                                                                              |
| ------------ | --------------------------------------------------- | ------ | --------------------------------------------------------------------------------------- |
| UT-9A-B-001 | IPC入力バリデーション標準化                         | 中     | `docs/30-workflows/completed-tasks/step-04-par-task-09-slide-ai-runtime-alignment/unassigned-task/task-ipc-validation-standardize-improvements.md` |
| UT-9A-B-002 | IPCエラーサニタイズ共通ユーティリティ化             | 中     | `docs/30-workflows/completed-tasks/step-04-par-task-09-slide-ai-runtime-alignment/unassigned-task/task-ipc-error-sanitize-refactoring.md`          |
| UT-9A-B-003 | IPCテストhandlerMapモックユーティリティ共通化       | 低     | `docs/30-workflows/completed-tasks/step-04-par-task-09-slide-ai-runtime-alignment/unassigned-task/task-ipc-test-mock-utils-improvements.md`        |

---

## 変更履歴

| バージョン | 日付       | 変更内容                                                                     |
| ---------- | ---------- | ---------------------------------------------------------------------------- |
| v1.16.7    | 2026-03-21 | UT-IMP-RUNTIME-SKILL-CREATOR-IPC-WIRING-001 反映: Skill Creator IPC契約を 16 チャンネル（15 invoke + 1 progress）へ更新し、`skill-creator:plan/execute-plan/improve-skill`、shared runtime contract、graceful degradation を追記 |
| v1.16.6    | 2026-03-05 | TASK-10A-E-A 追補: share IPC セクションへ「実装内容（IPC契約）」「苦戦箇所」「5ステップ手順」を追加し、Step 2同時同期・`code/errorCode` 二軸固定・画像+diagnostics 証跡の3点を標準化 |
| v1.16.5    | 2026-03-05 | TASK-10A-E-A反映: share IPC（`skill:importFromSource/export/validateSource`）の失敗契約へ `errorCode` を追記。sender失敗 `ERR_2004`、validation `ERR_1001`、unknown例外 `ERR_5001` を明文化し、`IPC_CHANNELS` 定数参照と実装テスト（Main 34 / Preload 60）の整合を記録 |
| v1.16.4    | 2026-03-04 | TASK-FIX-SKILL-AUTH-PREFLIGHT-GUARD-001 反映: `skill:execute` 契約セクションを追加し、失敗レスポンス `errorCode`・Renderer preflight・`auth-key:exists` store+env 判定順・Preload `Error.code` 転写を同期 |
| v1.16.3    | 2026-03-03 | TASK-FIX-SKILL-CHAIN-HANDLER-REGISTRATION-001 の苦戦箇所と4ステップ簡潔解決手順を追記。完了タスク台帳に同タスクを追加し、登録漏れ修正と未タスク移管（バレル公開整合）を同期 |
| v1.16.2    | 2026-03-03 | TASK-FIX-SKILL-CHAIN-HANDLER-REGISTRATION-001: `skill:chain:*` の備考を実装実態へ同期（`registerAllIpcHandlers` での登録保証を明記） |
| v1.16.0    | 2026-03-01 | TASK-UI-05A監査反映: `skill:getFileTree` チャネル仕様セクション追加（FileNode型定義含む）。UT-UI-05A-GETFILETREE-001 未タスクとして登録 |
| v1.16.1    | 2026-03-02 | TASK-UI-05B 実装完了同期: `skill:chain:*` の Preload API 状態を「未実装」から「実装済み」へ更新し、TASK-9D 完了記録に実装日を追記 |
| v1.16.0    | 2026-03-02 | TASK-UI-05B整合性検証: `skill:chain:*`（TASK-9D）5チャネル・`skill:schedule:*`（TASK-9G）5チャネルのIPCセクションを追加。TASK-9D完了タスク記録を追加 |
| v1.15.1    | 2026-02-28 | TASK-9E追補: IPC契約観点の苦戦箇所3件（件数ドリフト/契約境界混同/path境界判定）と簡潔解決策テーブルを追加し、再監査時の参照導線を明確化 |
| v1.15.0    | 2026-02-28 | TASK-9E反映: `skill:fork` チャネルセクション追加。`SkillForkOptions/Result/Metadata` 型契約、P42準拠バリデーション、実装状況、完了タスク記録（59テスト）を同期 |
| v1.14.0    | 2026-02-27 | TASK-9H反映: スキルデバッグ IPC チャネルセクションを追加（`skill:debug:*` 7チャネル、型定義、バリデーション、実装状況、完了タスク記録） |
| v1.15.0    | 2026-02-28 | TASK-9I反映: スキルドキュメント生成 IPC セクションを追加。4チャンネル（skill:docs:generate/preview/export/templates）、共有型5種、バリデーション/セキュリティ仕様、完了タスク記録を同期 |
| v1.15.1    | 2026-02-28 | TASK-9J追補: 「実装時の苦戦箇所」セクションを追加。IPC登録配線漏れ・責務重複・API命名ドリフトの再発防止ルールを明文化 |
| v1.15.0    | 2026-02-28 | TASK-9J: スキル分析・統計IPCチャネル5チャネル追加（record, statistics, summary, trend, export） |
| v1.14.0    | 2026-02-27 | TASK-9G反映: スキルスケジュールIPCチャネルセクション追加。5チャンネル（skill:schedule:list/add/update/delete/toggle）、型定義（ScheduledSkill系）、バリデーション/セキュリティ仕様、完了タスク記録を同期 |
| v1.13.1    | 2026-02-27 | TASK-9F追補: 実装時の苦戦箇所3件（起動配線分離/型パスドリフト/未タスク台帳非同期）と同種課題向け4ステップ手順を追加 |
| v1.13.0    | 2026-02-27 | TASK-9F反映: スキル共有IPCチャネルセクション追加。3チャンネル（skill:importFromSource/export/validateSource）、共有型定義10型、バリデーションルール、セキュリティ仕様、完了タスク記録 |
| v1.12.0    | 2026-02-26 | TASK-9B反映: SkillCreator IPC契約を 13チャンネル（12 invoke + 1 progress）へ更新。拡張7チャンネル、`SkillCreatorProgress`（`phase/percentage/message`）、実装状況テーブルを実装実体へ同期 |
| v1.11.0    | 2026-02-21 | UT-FIX-SKILL-IMPORT-INTERFACE-001反映: `skill:import` IPC引数契約を `skillName: string` に統一した完了記録を追加 |
| v1.10.0    | 2026-02-20 | 未タスク参照パス整合を修正: UT-9A-B-001〜003 の指示書参照を `docs/30-workflows/completed-tasks/step-04-par-task-09-slide-ai-runtime-alignment/unassigned-task/` に統一 |
| v1.9.0     | 2026-02-20 | UT-FIX-SKILL-REMOVE-INTERFACE-001反映: `skill:remove` 引数契約を `skillName: string` に統一し、完了タスクへ記録 |
| v1.8.0     | 2026-02-19 | TASK-9A-B: スキルファイル操作IPCチャンネルセクション追加。6チャンネル（skill:readFile/writeFile/createFile/deleteFile/listBackups/restoreBackup）、型定義、実装状況、セキュリティ仕様、完了タスク記録 |
| v1.7.0     | 2026-02-12 | UT-9B-H-003反映: Skill Creator IPCのセキュリティ強化仕様を追記（validatePath/sanitizeErrorMessage/ALLOWED_SCHEMA_NAMES） |
| v1.6.0     | 2026-02-12 | TASK-9B-H: Skill Creator IPCチャネルセクション追加。6チャンネル（5 invoke + 1 progress）、型定義、実装状況、完了タスク記録 |
| v1.5.0     | 2026-02-10 | UT-FIX-5-4: AgentSDKAPI.abort()型定義修正。`void` → `Promise<void>`。実装（safeInvoke）と型定義の整合性確保 |
| v1.4.0     | 2026-02-10 | UT-FIX-5-3: `agent:abort` IPCセキュリティ修正。`ipcMain.on`→`ipcMain.handle`変更、`safeInvoke`パターン準拠。**注意**: `agent:getStatus`チャネル名不整合（Main: camelCase vs Preload: kebab-case）検出→TASK-FIX-12-2で対応予定 |
| v1.3.0     | 2026-02-03 | TASK-WCE-MONACO-001: get-selection実装完了、完了タスクセクション追加         |
| v1.2.0     | 2026-02-02 | TASK-WCE-WORKSPACE-001: workspacePathパラメータ追加、完了タスク追加          |
| v1.1.0     | 2026-01-26 | TypeScriptコードブロックを表形式に変換（spec-guidelines.md準拠）             |
| v1.0.0     | 2026-01-25 | 初版作成                                                                     |
