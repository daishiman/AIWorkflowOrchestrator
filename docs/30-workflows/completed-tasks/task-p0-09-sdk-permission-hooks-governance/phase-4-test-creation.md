# Phase 4: テスト作成（TDD Red）

## メタ情報

| 項目       | 内容                                         |
| ---------- | -------------------------------------------- |
| Phase      | 4                                            |
| 名称       | テスト作成（TDD Red）                        |
| タスクID   | TASK-P0-09                                   |
| ステータス | 未実施                                       |
| 依存       | Phase 3 完了（PASS または MINOR）            |
| 完了条件   | 全テストが定義され、Red 状態が確認されること |

---

## 目的

governance 基盤（policy / hooks / audit sink / Facade 統合）のテストケースを全て定義する。
TDD の Red フェーズとして、実装前にテストを先行して作成する。

**命名規則確認**（Phase 1 で確認した規則）: `camelCase` 関数名、`PascalCase` クラス名。
テストファイルは `*.test.ts` 形式。

---

## テストファイル構成

```
apps/desktop/src/main/services/runtime/__tests__/governance/
├── SkillCreatorPermissionPolicy.test.ts
├── SkillCreatorHooksFactory.test.ts
├── SkillCreatorAuditSink.test.ts
├── SkillCreatorGovernance.integration.test.ts
└── GovernanceAllPhases.test.ts
```

---

## 実行タスク

### T-04-1: SkillCreatorPermissionPolicy.test.ts の作成

**テストケース一覧**:

| TC-ID    | テスト名                                                   | 検証内容                                                                               |
| -------- | ---------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| TC-PP-01 | plan phase: allowedTools に Read 系が含まれる              | `getPolicy("plan").allowedTools` に "Read", "Glob", "Grep", "Bash", "Agent" が含まれる |
| TC-PP-02 | plan phase: disallowedTools に Write/Edit が含まれる       | `getPolicy("plan").disallowedTools` に "Write", "Edit" が含まれる                      |
| TC-PP-03 | plan phase: permissionMode が "default"                    | `getPolicy("plan").permissionMode === "default"`                                       |
| TC-PP-04 | execute phase: allowedTools に Write/Edit が含まれる       | `getPolicy("execute").allowedTools` に "Write", "Edit" が含まれる                      |
| TC-PP-05 | execute phase: permissionMode が "acceptEdits"             | `getPolicy("execute").permissionMode === "acceptEdits"`                                |
| TC-PP-06 | verify phase: disallowedTools に Write/Edit が含まれる     | `getPolicy("verify").disallowedTools` に "Write", "Edit" が含まれる                    |
| TC-PP-07 | improve phase: allowedTools に Edit が含まれる             | `getPolicy("improve").allowedTools` に "Edit" が含まれる                               |
| TC-PP-08 | improve phase: disallowedTools に Write が含まれる         | `getPolicy("improve").disallowedTools` に "Write" が含まれる                           |
| TC-PP-09 | DESTRUCTIVE_TOOLS が全 phase の disallowedTools に含まれる | 全 phase で "NotebookEdit" が disallowed                                               |
| TC-PP-10 | canUseTool: plan phase で Read → allowed                   | `canUseTool("Read", "plan").allowed === true`                                          |
| TC-PP-11 | canUseTool: plan phase で Write → denied                   | `canUseTool("Write", "plan").allowed === false`                                        |
| TC-PP-12 | canUseTool: execute phase で Write → allowed               | `canUseTool("Write", "execute").allowed === true`                                      |
| TC-PP-13 | canUseTool: execute phase で NotebookEdit → denied         | `canUseTool("NotebookEdit", "execute").allowed === false`                              |
| TC-PP-14 | canUseTool: verify phase で Edit → denied                  | `canUseTool("Edit", "verify").allowed === false`                                       |
| TC-PP-15 | canUseTool: improve phase で Edit → allowed                | `canUseTool("Edit", "improve").allowed === true`                                       |
| TC-PP-16 | canUseTool: improve phase で Write → denied                | `canUseTool("Write", "improve").allowed === false`                                     |
| TC-PP-17 | getAllPolicies: 全 phase の policy を返す                  | `Object.keys(getAllPolicies())` が plan/execute/verify/improve を含む                  |
| TC-PP-18 | getPolicy: 未知の phase を受け取れない                     | TypeScript の型システムで保証（runtime test ではなく compile-time guard）              |

**完了条件**:

- [ ] TC-PP-01〜TC-PP-18 が全て定義されている
- [ ] テストが Red 状態であることを確認済み（実装がない or 差分がある場合）

---

### T-04-2: SkillCreatorHooksFactory.test.ts の作成

**テストケース一覧**:

| TC-ID    | テスト名                                                                               | 検証内容                                                                                 |
| -------- | -------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| TC-HF-01 | createHooks: plan phase で hooks オブジェクトが返る                                    | `createHooks("plan", auditSink)` が 4 メソッドを持つオブジェクトを返す                   |
| TC-HF-02 | onSessionStart: auditSink に "session_start" イベントが記録される                      | `hooks.onSessionStart({sessionId: "s1"})` 後に auditSink に session_start イベントがある |
| TC-HF-03 | onPreToolUse: plan phase で Read → ToolDecision.allowed === true                       | `hooks.onPreToolUse({sessionId, toolName: "Read"}).allowed === true`                     |
| TC-HF-04 | onPreToolUse: plan phase で Write → ToolDecision.allowed === false                     | `hooks.onPreToolUse({sessionId, toolName: "Write"}).allowed === false`                   |
| TC-HF-05 | onPreToolUse: execute phase で Write → ToolDecision.allowed === true                   | execute phase hooks で Write が allowed                                                  |
| TC-HF-06 | onPreToolUse: "pre_tool_use" イベントが auditSink に記録される                         | 判定後に auditSink へ記録される                                                          |
| TC-HF-07 | onPostToolUse: "post_tool_use" イベントが auditSink に記録される                       | success / error 情報込みで記録される                                                     |
| TC-HF-08 | onSessionEnd: "session_end" イベントが auditSink に記録される                          | summary 付きで記録される                                                                 |
| TC-HF-09 | createHooks: provenance が渡された場合、session_start イベントに provenance が含まれる | provenance 情報が audit イベントに伝播する                                               |
| TC-HF-10 | 全 phase（plan/execute/verify/improve）で createHooks が動作する                       | 各 phase で hooks オブジェクトが生成される                                               |

**完了条件**:

- [ ] TC-HF-01〜TC-HF-10 が全て定義されている

---

### T-04-3: SkillCreatorAuditSink.test.ts の作成

**テストケース一覧**:

| TC-ID    | テスト名                                                       | 検証内容                                                     |
| -------- | -------------------------------------------------------------- | ------------------------------------------------------------ |
| TC-AS-01 | record: イベントが追加される                                   | `sink.record(event)` 後に `sink.size === 1`                  |
| TC-AS-02 | record: maxEvents を超えた場合に古いイベントが破棄される       | maxEvents=3 で 4 件目を追加すると最初のイベントが消える      |
| TC-AS-03 | getEvents: 全イベントの read-only コピーが返る                 | `sink.getEvents()` が配列を返し、元の配列と別インスタンス    |
| TC-AS-04 | getRecentEvents: 直近 N 件が返る                               | `sink.getRecentEvents(2)` で最後の 2 件が返る                |
| TC-AS-05 | getEventsBySession: 指定 sessionId のイベントのみ返る          | 複数 session のイベントをフィルタリング                      |
| TC-AS-06 | getDenialEvents: decision.allowed === false のイベントのみ返る | denial イベントのみがフィルタリングされる                    |
| TC-AS-07 | clear: 全イベントが消去される                                  | `sink.clear()` 後に `sink.size === 0`                        |
| TC-AS-08 | recordEvent: 構造化イベントが生成・記録される                  | timestamp / sessionId / phase 等が正しく設定される           |
| TC-AS-09 | recordEvent: 返り値がイベントオブジェクト                      | `recordEvent()` が `SkillCreatorGovernanceAuditEvent` を返す |
| TC-AS-10 | constructor: maxEvents をカスタム設定できる                    | `new SkillCreatorAuditSink(10)` で maxEvents が 10 になる    |
| TC-AS-11 | size: イベント数が正しく返る                                   | record 後に size が増加し、clear 後に 0 になる               |
| TC-AS-12 | ring buffer: デフォルト maxEvents(500)で動作する               | 501 件追加後に size === 500                                  |

**完了条件**:

- [ ] TC-AS-01〜TC-AS-12 が全て定義されている
- [ ] branch coverage 重点テスト（ring buffer 境界値）が含まれている

---

### T-04-4: SkillCreatorGovernance.integration.test.ts の確認・拡充

**責務**:

- `SkillCreatorPermissionPolicy` / `SkillCreatorHooksFactory` / `SkillCreatorAuditSink` / `RuntimeSkillCreatorFacade` の局所統合を検証する
- `TC-FG-01`〜`TC-FG-09` を担う

**テストケース一覧**（統合テスト）:

| TC-ID    | テスト名                                                                | 検証内容                                                 |
| -------- | ----------------------------------------------------------------------- | -------------------------------------------------------- |
| TC-FG-01 | plan(): createGovernanceHooks("plan") が呼ばれる                        | plan() 実行時に governance phase が "plan" になる        |
| TC-FG-02 | plan(): onSessionStart / onSessionEnd が呼ばれる                        | plan の開始・終了で audit イベントが記録される           |
| TC-FG-03 | execute(): createGovernanceHooks("execute") が呼ばれる                  | execute 実行時に governance phase が "execute" になる    |
| TC-FG-04 | execute(): hookObservers 経由で onPreToolUse が呼ばれる                 | SkillExecutor から hookObservers.onPreToolUse が呼ばれる |
| TC-FG-05 | verify(): createGovernanceHooks("verify") が呼ばれる                    | verify 実行時に governance phase が "verify" になる      |
| TC-FG-06 | improve(): createGovernanceHooks("improve") が呼ばれる                  | improve 実行時に governance phase が "improve" になる    |
| TC-FG-07 | getGovernanceState(): 現在の phase / policy / 直近 audit イベントが返る | IPC 向けレスポンス構造の確認                             |
| TC-FG-08 | createExecuteGovernanceCanUseTool: execute phase で NotebookEdit → deny | canUseTool が deny を返す場合に SDK に deny が渡る       |
| TC-FG-09 | auditSink: plan→execute の順で実行後、両方の audit イベントが記録される | 複数 phase にまたがる audit 記録の検証                   |

**完了条件**:

- [ ] TC-FG-01〜TC-FG-09 が全て定義されている
- [ ] 統合テストで governance の end-to-end フローが検証されている

---

### T-04-5: GovernanceAllPhases.test.ts の確認・拡充

**責務**:

- `plan` / `execute` / `verify` / `improve` を横断した policy / hooks / audit / state の回帰を検証する
- `TC-G-01`〜`TC-G-14` を担う

**テストケース一覧**（全フェーズ回帰テスト）:

| TC-ID   | テスト名                                                     | 検証内容                                          |
| ------- | ------------------------------------------------------------ | ------------------------------------------------- |
| TC-G-01 | plan phase で createGovernanceHooks('plan') が呼ばれる       | plan 実行時に audit の phase が plan になる       |
| TC-G-02 | verify phase で createGovernanceHooks('verify') が呼ばれる   | verify 実行時に audit の phase が verify になる   |
| TC-G-03 | improve phase で createGovernanceHooks('improve') が呼ばれる | improve 実行時に audit の phase が improve になる |
| TC-G-04 | plan phase で Write ツールが拒否される                       | plan の policy が Write を deny する              |
| TC-G-05 | verify phase で Write ツールが拒否される                     | verify の policy が Write を deny する            |
| TC-G-06 | improve phase で Read ツールが許可される                     | improve の policy が Read を許可する              |
| TC-G-07 | getGovernanceState() が現在フェーズを正確に返す              | Facade の初期 state と recentAuditEvents を確認   |
| TC-G-08 | plan → verify → improve でフェーズ変更が audit に記録される  | phase 横断で audit sink が分離・記録される        |
| TC-G-09 | execute phase で Write ツールが許可される                    | execute の policy が Write を許可する             |
| TC-G-10 | improve phase で Write ツールが拒否される                    | improve の policy が Write を deny する           |
| TC-G-11 | plan phase の hooks で denial が audit に記録される          | deny イベントが plan の audit に残る              |
| TC-G-12 | verify phase の hooks で denial が audit に記録される        | deny イベントが verify の audit に残る            |
| TC-G-13 | plan() 失敗時も onSessionEnd が audit に記録される           | early return でも session_end が残る              |
| TC-G-14 | improve() 失敗時も onSessionEnd が audit に記録される        | early return でも session_end が残る              |

**完了条件**:

- [ ] TC-G-01〜TC-G-14 が全て定義されている
- [ ] 全フェーズを横断した policy / audit / state の整合が検証されている

---

## 成果物

| 成果物名                                     | パス                                                                                                     | 必須 |
| -------------------------------------------- | -------------------------------------------------------------------------------------------------------- | ---- |
| `SkillCreatorPermissionPolicy.test.ts`       | `apps/desktop/src/main/services/runtime/__tests__/governance/SkillCreatorPermissionPolicy.test.ts`       | ✅   |
| `SkillCreatorHooksFactory.test.ts`           | `apps/desktop/src/main/services/runtime/__tests__/governance/SkillCreatorHooksFactory.test.ts`           | ✅   |
| `SkillCreatorAuditSink.test.ts`              | `apps/desktop/src/main/services/runtime/__tests__/governance/SkillCreatorAuditSink.test.ts`              | ✅   |
| `SkillCreatorGovernance.integration.test.ts` | `apps/desktop/src/main/services/runtime/__tests__/governance/SkillCreatorGovernance.integration.test.ts` | ✅   |
| `GovernanceAllPhases.test.ts`                | `apps/desktop/src/main/services/runtime/__tests__/governance/GovernanceAllPhases.test.ts`                | ✅   |
| テスト実行結果（Red 確認）                   | `outputs/phase-4/test-red-result.md`                                                                     | ✅   |

---

## 完了条件チェックリスト

- [ ] TC-PP-01〜TC-PP-18 が全て実装されている
- [ ] TC-HF-01〜TC-HF-10 が全て実装されている
- [ ] TC-AS-01〜TC-AS-12 が全て実装されている（ring buffer 境界値含む）
- [ ] TC-FG-01〜TC-FG-09 が全て実装されている
- [ ] TC-G-01〜TC-G-14 が全て実装されている
- [ ] テストが定義され（Red 状態または既存実装との差分確認済み）
- [ ] `outputs/phase-4/test-red-result.md` にテスト実行結果が記録されている
- [ ] Phase 1 で記録した命名規則（camelCase/PascalCase）とテストが整合している

---

## 参照資料

| 参照先                                               | 内容                 |
| ---------------------------------------------------- | -------------------- |
| `.claude/skills/aiworkflow-requirements/references/` | テスト戦略・品質基準 |
| `apps/desktop/src/main/services/runtime/governance/` | テスト対象ファイル   |
| `docs/30-workflows/unassigned-task/TASK-P0-09-*`     | テストケース参考     |
