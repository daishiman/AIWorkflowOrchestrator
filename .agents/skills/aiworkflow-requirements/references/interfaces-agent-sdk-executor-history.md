# Agent SDK Executor 仕様 / history bundle

> 親仕様書: [interfaces-agent-sdk-executor.md](interfaces-agent-sdk-executor.md)
> 役割: history bundle

## 完了タスク

### タスク: UT-IMP-SKILL-AGENT-RUNTIME-ROUTING-INTEGRATION-CLOSURE-001 Runtime routing 統合クロージャ（2026-03-15完了）

| 項目         | 内容                                                                 |
| ------------ | -------------------------------------------------------------------- |
| タスクID     | UT-IMP-SKILL-AGENT-RUNTIME-ROUTING-INTEGRATION-CLOSURE-001          |
| 完了日       | 2026-03-15                                                           |
| ステータス   | **完了**                                                             |
| 対象         | `skill:execute` / `agent:start` runtime routing、handoff DTO、Preload channel整合 |
| ドキュメント | `docs/30-workflows/completed-tasks/runtime-routing-integration-closure/`             |

#### 変更内容

| 変更箇所 | 内容 |
| -------- | ---- |
| Main IPC | `RuntimeResolver` 注入時に `integrated` / `handoff` 分岐を適用 |
| Skill応答 | handoff 時に `SkillExecutionResponse.handoff/guidance` を返却 |
| Agent応答 | handoff 時に `AgentStartResult.handoff/guidance` を返却 |
| Preload | `agentAPI` を `AGENT_EXECUTION_*` チャネルへ統一 |
| Renderer | `TerminalHandoffCard` 表示へ `guidance` を接続 |

#### 検証結果

- `apps/desktop/src/main/ipc/__tests__/skillHandlers.runtime.test.ts`
- `apps/desktop/src/main/ipc/__tests__/agentHandlers.runtime.test.ts`
- `docs/30-workflows/completed-tasks/runtime-routing-integration-closure/outputs/phase-11/screenshots/TC-01..09`

---

### タスク: TASK-FIX-SKILL-EXECUTOR-AUTHKEY-DI-001 AuthKeyService注入経路統一（2026-03-05完了）

| 項目         | 内容                                                                 |
| ------------ | -------------------------------------------------------------------- |
| タスクID     | TASK-FIX-SKILL-EXECUTOR-AUTHKEY-DI-001                              |
| 完了日       | 2026-03-05                                                           |
| ステータス   | **完了**                                                             |
| テスト数     | 148（回帰セット）                                                    |
| 発見課題     | 0件                                                                  |
| ドキュメント | `docs/30-workflows/02-TASK-FIX-SKILL-EXECUTOR-AUTHKEY-DI-001/`      |

#### 変更内容

| 変更箇所 | 内容 |
| -------- | ---- |
| Main composition root | `AuthKeyService` を先行単一生成し、Skill/Auth 系ハンドラへ共有注入 |
| Skillハンドラ | `registerSkillHandlers` が `authKeyService?: IAuthKeyService` を受理 |
| Executor生成 | `new SkillExecutor(mainWindow, undefined, authKeyService)` へ統一 |
| テスト | `ipc-double-registration` に第3引数注入・同一インスタンス検証を追加 |

#### 検証結果

- `src/main/ipc/__tests__/ipc-double-registration.test.ts`
- `src/main/ipc/__tests__/skillHandlers.execute.test.ts`
- `src/preload/__tests__/skill-api.contract.test.ts`
- `src/renderer/hooks/__tests__/useSkillExecution.test.ts`
- `src/main/services/skill/__tests__/SkillExecutor.auth.test.ts`
- 5 files / 148 tests PASS

---

### タスク: TASK-FIX-11-1-SDK-TEST-ENABLEMENT SDK統合テスト有効化（2026-02-13完了）

| 項目         | 内容                                                        |
| ------------ | ----------------------------------------------------------- |
| タスクID     | TASK-FIX-11-1-SDK-TEST-ENABLEMENT                          |
| 完了日       | 2026-02-13                                                  |
| ステータス   | **完了**                                                    |
| テスト数     | TODO有効化17件（3ファイル）+ 既存回帰全PASS                |
| 発見課題     | 0件                                                         |
| ドキュメント | `docs/30-workflows/sdk-test-enablement/`                   |

#### 変更内容

| 変更ファイル | 変更内容 |
| ------------ | -------- |
| `apps/desktop/src/main/slide/__tests__/agent-client.test.ts` | AC-06, SDK-AC-01〜06, SDK-AC-09〜10 のTODOを実テスト化。`mockRejectedValueOnce` と Fake Timers を導入 |
| `apps/desktop/src/main/slide/__tests__/sdk-integration.test.ts` | INT-02, INT-05, SDK-INT-01 のTODOを実テスト化。APIキー無効・SDK障害をモック検証 |
| `apps/desktop/src/main/slide/__tests__/skill-executor.test.ts` | SDK-SE-05, SDK-SE-13, SDK-SE-14 を有効化。`beforeEach` でモック再初期化しP9を回避 |

#### 仕様化したテストパターン

- `mockRejectedValueOnce` を優先し、テスト間のモック汚染を防止
- `vi.clearAllMocks()` だけでなく `mockReset` とデフォルト実装再設定を併用
- 30秒タイムアウトは `Promise.all([advanceTimersByTimeAsync, rejects])` で決定論的に検証

#### 実装上の課題と教訓

| 課題 | 詳細 | 解決策 |
|------|------|--------|
| Phase 12 Step 1-A/1-D誤判定 | テスト変更のみのためドキュメント更新を初回で「該当なし」と誤判定 | Step 1-A（LOGS/SKILL更新）と Step 1-D（index再生成）を必須として再実行 |
| 未タスク検出の誤検知 | `detect-unassigned-tasks.js` の raw 検出が仕様書本文の TODO 文言を多数検出 | 実装ディレクトリ優先スキャン + raw結果の手動精査で「候補」と「確定」を分離 |
| Vitestモック状態リーク | `vi.clearAllMocks()` のみでは実装が残り後続テストに影響 | `beforeEach` でデフォルト実装を再設定し、失敗系は `mockRejectedValueOnce` を使用 |

#### 成果物

| 成果物 | パス |
| ------ | ---- |
| 実装ガイド | `docs/30-workflows/sdk-test-enablement/outputs/phase-12/implementation-guide.md` |
| ドキュメント更新履歴 | `docs/30-workflows/sdk-test-enablement/outputs/phase-12/documentation-changelog.md` |
| 未タスク検出レポート | `docs/30-workflows/sdk-test-enablement/outputs/phase-12/unassigned-task-detection.md` |

---

### タスク: SDK型安全統合 - as any除去（2026-02-12完了）

| 項目         | 内容                                                       |
| ------------ | ---------------------------------------------------------- |
| タスクID     | TASK-9B-I-SDK-FORMAL-INTEGRATION                           |
| 完了日       | 2026-02-12                                                 |
| ステータス   | **完了**                                                   |
| テスト数     | 13（SDK型安全テスト）+ 既存278件全PASS                     |
| 発見課題     | 1件（UT-9B-I-001）                                        |
| ドキュメント | `docs/30-workflows/completed-tasks/sdk-formal-integration/`                |

#### 変更内容

| 変更項目                       | 変更前                                              | 変更後                                                         |
| ------------------------------ | --------------------------------------------------- | -------------------------------------------------------------- |
| SDK import                     | `(await import(...)) as any`                        | 型安全な `import` + 実型参照                                   |
| SDK Options: apiKey             | `apiKey: string`                                    | `env: { ANTHROPIC_API_KEY: string }`                           |
| SDK Options: signal             | `signal: AbortSignal`                               | `abortController: AbortController`                             |
| SDK Query 戻り値               | `conversation.stream()` で AsyncIterable 取得       | `conversation` を直接 AsyncIterable として利用                  |
| SDKQueryOptions: permissionMode | ローカル定義                                        | SDK 実型（`@anthropic-ai/claude-agent-sdk`）に準拠             |

#### callSDKQuery 型安全化仕様

`SkillExecutor.callSDKQuery()` は以下の型安全なマッピングで SDK を呼び出す。

| SDK Options パラメータ     | マッピング元                            | 説明                                      |
| ------------------------- | --------------------------------------- | ----------------------------------------- |
| `prompt`                  | `callSDKQuery` の第1引数（独立パラメータ） | 実行プロンプト                            |
| `env.ANTHROPIC_API_KEY`   | `getApiKey()` 経由で取得（独立パラメータ） | 環境変数形式でAPI Keyを渡す               |
| `abortController`         | `new AbortController()`                | AbortController インスタンスを直接渡す    |
| `options.permissionMode`  | SDK 実型の PermissionMode              | 型安全な権限モード指定                    |
| `tools`                   | `SDKQueryOptions.tools`                | ツール一覧（Read, Edit, Bash, Glob, Grep）|

#### テスト結果サマリー

| カテゴリ                          | テスト数 | PASS | FAIL |
| --------------------------------- | -------- | ---- | ---- |
| SDK Options マッピング            | 6        | 6    | 0    |
| AbortController 統合              | 4        | 4    | 0    |
| permissionMode 型検証             | 4        | 4    | 0    |
| AsyncIterable 戻り値処理          | 4        | 4    | 0    |

#### 成果物

| 成果物                    | パス                                                                                       |
| ------------------------- | ------------------------------------------------------------------------------------------ |
| SkillExecutor.ts修正      | `apps/desktop/src/main/services/skill/SkillExecutor.ts`                                    |
| SDK型安全テスト           | `apps/desktop/src/main/services/skill/__tests__/SkillExecutor.sdk-types.test.ts`           |

#### 実装上の課題と教訓

| 課題 | 詳細 | 解決策 |
|------|------|--------|
| TypeScript モジュール解決 | `node_modules` 実型がカスタム `declare module` を上書きし、カスタム `.d.ts` の `PermissionMode`（`auto`/`ask`/`deny`）が無視されゴースト型化 | SDK インストール後はカスタム `.d.ts` を削除する（UT-9B-I-001 で対応予定） |
| SDK パラメータ発見 | `env: { ANTHROPIC_API_KEY }`, `abortController` が公式ドキュメントに明記されておらず発見に時間を要した | 型定義ファイル（`node_modules/@anthropic-ai/claude-agent-sdk/dist/index.d.ts`）を直接参照して全パラメータを把握 |
| PermissionMode 値の不一致 | カスタム型（`auto`/`ask`/`deny`）vs SDK 実型（`default`/`acceptEdits`/`bypassPermissions`/`plan`/`delegate`/`dontAsk`）で値セットが完全に異なる | SDK 実型に統一し、仕様書の PermissionMode 定義を全更新 |
| テスト数乖離 | Phase 4（テスト設計）想定 18 件 vs Phase 5（実装）実績 13 件。設計時に想定していた重複テストケースを実装時に統合 | Phase 12 で `grep -c "it(" *.test.ts` により実測値で仕様書を修正 |
| 未タスク配置ディレクトリ間違い（P3再発） | UT-9B-I-001 の指示書を `tasks/` 直下に配置したが、正しくは `tasks/unassigned-task/` 配下 | P3 チェックリスト（①指示書 → ②残課題テーブル → ③関連仕様書リンク）を再確認して修正 |

**参照**: [architecture-implementation-patterns.md#S11](./architecture-implementation-patterns.md)（TypeScript モジュール解決）、[architecture-implementation-patterns.md#S12](./architecture-implementation-patterns.md)（SDK API パラメータの把握）

#### 関連未タスク

| タスクID     | タスク名                                       | 優先度 | 指示書                                                                                           |
| ------------ | ---------------------------------------------- | ------ | ------------------------------------------------------------------------------------------------ |
| UT-9B-I-001  | カスタム型宣言ファイルと SDK 実型の共存整理     | 低     | `docs/30-workflows/completed-tasks/sdk-formal-integration/outputs/phase-12/ut-9b-i-001-custom-declare-module-cleanup.md` |

---

### タスク: SkillExecutor リトライ機構実装（2026-01-31完了）

| 項目         | 内容                                                       |
| ------------ | ---------------------------------------------------------- |
| タスクID     | TASK-SKILL-RETRY-001                                       |
| 完了日       | 2026-01-31                                                 |
| ステータス   | **完了**                                                   |
| テスト数     | 72（自動テスト）+ 12（手動テスト項目）                     |
| 発見課題     | 0件                                                        |
| ドキュメント | `docs/30-workflows/skillexecutor-retry-mechanism/`         |

#### テスト結果サマリー

| カテゴリ                     | テスト数 | PASS | FAIL |
| ---------------------------- | -------- | ---- | ---- |
| リトライ基本機能             | 15       | 15   | 0    |
| エラー分類                   | 12       | 12   | 0    |
| バックオフ計算               | 10       | 10   | 0    |
| Retry-After対応              | 8        | 8    | 0    |
| abort連携                    | 8        | 8    | 0    |
| ストリーミング通知           | 7        | 7    | 0    |
| エッジケース                 | 6        | 6    | 0    |
| 並行実行                     | 3        | 3    | 0    |
| 手動テスト（executeWithRetry）| 12      | 12   | 0    |

#### 成果物

| 成果物                    | パス                                                                                       |
| ------------------------- | ------------------------------------------------------------------------------------------ |
| テスト結果レポート        | `docs/30-workflows/skillexecutor-retry-mechanism/outputs/phase-11/manual-test-results.md`  |
| 実装ガイド（初学者向け）  | `docs/30-workflows/skillexecutor-retry-mechanism/outputs/phase-12/implementation-guide-part1.md` |
| 実装ガイド（技術者向け）  | `docs/30-workflows/skillexecutor-retry-mechanism/outputs/phase-12/implementation-guide-part2.md` |

---

### タスク: スキル管理モジュール単体テスト（2026-02-02完了）

| 項目         | 内容                                                       |
| ------------ | ---------------------------------------------------------- |
| タスクID     | TASK-8A                                                    |
| 完了日       | 2026-02-02                                                 |
| ステータス   | **完了**                                                   |
| テスト数     | 231（SkillExecutor: 52, PermissionResolver: 43, 他3モジュール: 136） |
| 発見課題     | 1件（task-skillscanner-file-deletion-race: P3 - SkillScanner SKILL.md削除中レース） |
| ドキュメント | `docs/30-workflows/TASK-8A/`                               |

#### テスト結果サマリー（SkillExecutor + PermissionResolver）

| カテゴリ                          | テスト数 | PASS | FAIL |
| --------------------------------- | -------- | ---- | ---- |
| SkillExecutor - execute           | 15       | 15   | 0    |
| SkillExecutor - abort             | 8        | 8    | 0    |
| SkillExecutor - stream handling   | 10       | 10   | 0    |
| SkillExecutor - createHooks       | 1        | 1    | 0    |
| SkillExecutor - handlePermission  | 2        | 2    | 0    |
| SkillExecutor - Edge Cases        | 16       | 16   | 0    |
| PermissionResolver - waitForResponse | 12    | 12   | 0    |
| PermissionResolver - cancelRequest   | 8     | 8    | 0    |
| PermissionResolver - cancelAll       | 8     | 8    | 0    |
| PermissionResolver - Edge Cases      | 15    | 15   | 0    |

#### 成果物

| 成果物             | パス                                                                    |
| ------------------ | ----------------------------------------------------------------------- |
| 実装ガイド         | `docs/30-workflows/TASK-8A/outputs/phase-12/implementation-guide.md`    |
| カバレッジレポート | `docs/30-workflows/TASK-8A/outputs/phase-7/coverage-report.md`          |

---

## 関連ドキュメント

| ドキュメント                        | 説明                       |
| ----------------------------------- | -------------------------- |
| interfaces-agent-sdk.md             | 親ファイル（インデックス） |
| interfaces-agent-sdk-integration.md | 統合機能仕様               |
| interfaces-agent-sdk-history.md     | 完了タスク履歴             |
| [TASK-FIX-SKILL-EXECUTOR-AUTHKEY-DI-001 実装ガイド](../../../docs/30-workflows/02-TASK-FIX-SKILL-EXECUTOR-AUTHKEY-DI-001/outputs/phase-12/implementation-guide.md) | AuthKeyService DI 統一路の実装・検証記録 |
| [SDKテスト有効化 実装ガイド](../../../docs/30-workflows/sdk-test-enablement/outputs/phase-12/implementation-guide.md) | TASK-FIX-11-1 のテスト実装パターン |
| [実装ガイドPart1](../../../docs/30-workflows/skillexecutor-retry-mechanism/outputs/phase-12/implementation-guide-part1.md) | リトライ機構 初学者向け概念説明 |
| [実装ガイドPart2](../../../docs/30-workflows/skillexecutor-retry-mechanism/outputs/phase-12/implementation-guide-part2.md) | リトライ機構 技術者向け詳細 |

---

## 変更履歴

| 日付       | バージョン | 変更内容                                                   |
| ---------- | ---------- | ---------------------------------------------------------- |
| 2026-03-15 | 1.7.4      | UT-IMP-SKILL-AGENT-RUNTIME-ROUTING-INTEGRATION-CLOSURE-001 反映: `skill:execute` / `agent:start` の runtime routing と handoff 契約、Preload `AGENT_EXECUTION_*` チャネル整合、TerminalHandoffCard 連携を追記 |
| 2026-03-05 | 1.7.3      | DI初期化フロー表のシグネチャを実装に同期（`registerSkillHandlers(mainWindow, skillService, authKeyService)` / `main/ipc/index.ts`）。旧2引数表記を更新 |
| 2026-03-05 | 1.7.2      | TASK-FIX-SKILL-EXECUTOR-AUTHKEY-DI-001 反映: AuthKeyService DI配線契約（単一生成 + Skill/Auth同一注入）を追加。完了タスク記録と関連ドキュメントリンクを同期 |
| 2026-02-13 | 1.7.1      | TASK-FIX-11-1-SDK-TEST-ENABLEMENT: 「実装上の課題と教訓」追記（Step 1-A/1-D誤判定、未タスクraw誤検知、Vitestモック再初期化） |
| 2026-02-13 | 1.7.0      | TASK-FIX-11-1-SDK-TEST-ENABLEMENT: 完了タスク追加（SDK統合テスト17件有効化、P9対策モック再初期化、タイムアウト検証パターン） |
| 2026-02-12 | 1.6.1      | TASK-9B-I-SDK-FORMAL-INTEGRATION: 完了タスクセクションに「実装上の課題と教訓」サブセクション追加（TypeScriptモジュール解決、SDKパラメータ発見、PermissionMode不一致、テスト数乖離、P3再発） |
| 2026-02-12 | 1.6.0      | TASK-9B-I-SDK-FORMAL-INTEGRATION: callSDKQuery型安全化仕様追加、SDK Optionsマッピング（env.ANTHROPIC_API_KEY, abortController）、完了タスク追加 |
| 2026-02-11 | 1.5.0      | TASK-FIX-7-1: SkillService統合セクション追加、型変換パターン（Skill→SkillMetadata）追加 |
| 2026-02-08 | 1.4.0      | TASK-FIX-16-1: AuthKeyService統合（AUTHENTICATION_ERROR追加、DI対応、キー取得フロー追加） |
| 2026-02-02 | 1.3.0      | TASK-8A: SkillExecutor/PermissionResolver単体テスト95テスト全PASS、完了タスク追加 |
| 2026-01-31 | 1.2.0      | TASK-SKILL-RETRY-001: リトライ機構の型・API・定数追加      |
| 2026-01-26 | 1.1.0      | spec-guidelines.md準拠: コードブロックを表形式・文章に変換 |
| 2026-01-26 | 1.0.0      | interfaces-agent-sdk.mdから分割                            |
