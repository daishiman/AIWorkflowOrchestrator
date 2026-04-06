# Phase 5: 実装（TDD Green）

## メタ情報

| 項目       | 内容                                            |
| ---------- | ----------------------------------------------- |
| Phase      | 5                                               |
| 名称       | 実装（TDD Green）                               |
| タスクID   | TASK-P0-09                                      |
| ステータス | 未実施                                          |
| 依存       | Phase 4 完了                                    |
| 完了条件   | 全テストが PASS し、typecheck/lint がエラーなし |

---

## 目的

Phase 4 で定義したテストを全て PASS させる実装を行う。
TDD の Green フェーズとして、テストを通すことを最優先に実装する。

---

## 実装ファイル一覧（Phase 2 確定分）

| ファイル                          | 変更種別 | 主な変更内容                                                                   |
| --------------------------------- | -------- | ------------------------------------------------------------------------------ |
| `SkillCreatorPermissionPolicy.ts` | 修正     | policy テーブルの差分修正（Phase 1 調査結果を反映）、`canUseTool()` の整合確認 |
| `SkillCreatorHooksFactory.ts`     | 修正     | lifecycle hooks の整合確認・不足部分の修正                                     |
| `SkillCreatorAuditSink.ts`        | 修正     | in-memory ring buffer の実装確認・修正                                         |
| `governance/index.ts`             | 修正     | エクスポート一覧の整合確認・追加                                               |
| `RuntimeSkillCreatorFacade.ts`    | 修正     | governance 統合の整合確認・不足部分の修正                                      |

---

## 実行タスク

### T-05-1: SkillCreatorPermissionPolicy.ts の実装・修正

Phase 2 の設計書に基づいて実装を修正する。

**実装チェックリスト**:

- [ ] `plan` phase の policy が設計書と一致している（permissionMode: "default", allowedTools: READ_TOOLS, disallowedTools: ["Write", "Edit", ...DESTRUCTIVE_TOOLS]）
- [ ] `execute` phase の policy が設計書と一致している（permissionMode: "acceptEdits", allowedTools: WRITE_TOOLS）
- [ ] `verify` phase の policy が設計書と一致している（permissionMode: "default", allowedTools: TEST_TOOLS）
- [ ] `improve` phase の policy が設計書と一致している（permissionMode: "acceptEdits", allowedTools: IMPROVE_TOOLS）
- [ ] `DESTRUCTIVE_TOOLS` が全 phase の `disallowedTools` に含まれている
- [ ] `Object.freeze()` で policy テーブルが保護されている
- [ ] `canUseTool()` が allowedTools / disallowedTools を正しく評価している
- [ ] `evaluateContextPolicy()` が execute/improve phase で targetPath チェックを行う（U1 carry-forward として TODO コメントを残す）

**命名規則確認**:

- 定数は `SCREAMING_SNAKE_CASE`（READ_TOOLS, WRITE_TOOLS, TEST_TOOLS, IMPROVE_TOOLS, DESTRUCTIVE_TOOLS）
- 関数は `camelCase`（getPolicy, canUseTool, getAllPolicies, evaluateContextPolicy）
- 型は `PascalCase`（CanUseToolContext）

**テスト実行**:

```bash
pnpm --filter @repo/desktop test -- --grep "SkillCreatorPermissionPolicy" --run
```

**完了条件**:

- [ ] TC-PP-01〜TC-PP-18 が全て PASS している

---

### T-05-2: SkillCreatorHooksFactory.ts の実装・修正

**実装チェックリスト**:

- [ ] `createHooks(phase, auditSink, provenance?)` のシグネチャが正しい
- [ ] `onSessionStart`: `auditSink.recordEvent({ eventType: "session_start", ... })` を呼ぶ
- [ ] `onPreToolUse`: `canUseTool(toolName, phase)` で判定し、`auditSink.recordEvent({ eventType: "pre_tool_use", ... })` を呼ぶ
- [ ] `onPreToolUse`: `SkillCreatorToolDecision` を返す
- [ ] `onPostToolUse`: `auditSink.recordEvent({ eventType: "post_tool_use", ... })` を呼ぶ
- [ ] `onSessionEnd`: `auditSink.recordEvent({ eventType: "session_end", ... })` を呼ぶ
- [ ] `SkillCreatorHooks` インターフェースが export されている

**テスト実行**:

```bash
pnpm --filter @repo/desktop test -- --grep "SkillCreatorHooksFactory" --run
```

**完了条件**:

- [ ] TC-HF-01〜TC-HF-10 が全て PASS している

---

### T-05-3: SkillCreatorAuditSink.ts の実装・修正

**実装チェックリスト**:

- [ ] `record(event)`: イベントを追加し、maxEvents を超えた場合に `slice(-maxEvents)` でトリム
- [ ] `recordEvent(params)`: 構造化イベントを生成して `record()` を呼ぶ。`timestamp` は `new Date().toISOString()`
- [ ] `getEvents()`: `[...this.events]` でコピーを返す（read-only）
- [ ] `getRecentEvents(count)`: `this.events.slice(-count)` を返す
- [ ] `getEventsBySession(sessionId)`: `sessionId` でフィルタリング
- [ ] `getDenialEvents()`: `decision.allowed === false` でフィルタリング
- [ ] `clear()`: `this.events = []` でリセット
- [ ] `get size()`: `this.events.length` を返す
- [ ] `constructor(maxEvents?)`: デフォルト 500 件

**テスト実行**:

```bash
pnpm --filter @repo/desktop test -- --grep "SkillCreatorAuditSink" --run
```

**完了条件**:

- [ ] TC-AS-01〜TC-AS-12 が全て PASS している（ring buffer 境界値テストを含む）

---

### T-05-4: RuntimeSkillCreatorFacade.ts の governance 統合修正

`SkillCreatorGovernance.integration.test.ts` と `GovernanceAllPhases.test.ts` の両方を満たすことを前提に、
Facade 側の hooks 接続と phase 横断の状態遷移を修正する。

**実装チェックリスト**:

- [ ] `auditSink` が `new SkillCreatorAuditSink()` でインスタンス化され、class フィールドに保持されている
- [ ] `currentGovernancePhase` が `SkillCreatorGovernancePhase` 型で初期値 `"plan"`
- [ ] `createGovernanceHooks(phase)`: `this.currentGovernancePhase = phase` を設定し、`createHooks(phase, this.auditSink, provenance)` を返す
- [ ] `plan()`: `createGovernanceHooks("plan")` → `onSessionStart` → ... → `onSessionEnd` の順序
- [ ] `_executeInternal()`: `createGovernanceHooks("execute")` → `onSessionStart` → hookObservers 接続 → `onSessionEnd`
- [ ] `verifySkill()`: `createGovernanceHooks("verify")` → `onSessionStart` → ... → `onSessionEnd`
- [ ] `improve()`: `createGovernanceHooks("improve")` → `onSessionStart` → ... → `onSessionEnd`
- [ ] `getGovernanceState()`: `{ phase, activePolicy, recentAuditEvents, recentDenials }` を返す
- [ ] `createExecuteGovernanceCanUseTool()`: `_input` は `Record<string, unknown>` のまま（U1 carry-forward コメント付き）

**テスト実行**:

```bash
pnpm --filter @repo/desktop test -- --grep "governance" --run
```

**完了条件**:

- [ ] TC-FG-01〜TC-FG-09 が全て PASS している
- [ ] TC-G-01〜TC-G-14 が全て PASS している

---

### T-05-5: governance/index.ts のエクスポート整合確認

**実装チェックリスト**:

- [ ] `getPolicy`, `canUseTool`, `getAllPolicies` が `SkillCreatorPermissionPolicy` からエクスポートされている
- [ ] `CanUseToolContext` 型がエクスポートされている
- [ ] `SkillCreatorAuditSink` クラスがエクスポートされている
- [ ] `createHooks` 関数がエクスポートされている
- [ ] `SkillCreatorHooks` 型がエクスポートされている

**完了条件**:

- [ ] `governance/index.ts` の全エクスポートが Phase 2 設計書と一致している

---

### T-05-6: 全テスト実行・型チェック・Lint

```bash
# governance テストのみ実行
pnpm --filter @repo/desktop test -- --grep "governance|SkillCreatorPermission|SkillCreatorHooks|SkillCreatorAudit" --run

# 型チェック
pnpm --filter @repo/desktop typecheck

# lint
pnpm --filter @repo/desktop lint
```

**完了条件**:

- [ ] 全テストが PASS している
- [ ] `pnpm --filter @repo/desktop typecheck` がエラーなし
- [ ] `pnpm --filter @repo/desktop lint` がエラーなし

---

## 成果物

| 成果物名                                   | パス                                                                                | 必須 |
| ------------------------------------------ | ----------------------------------------------------------------------------------- | ---- |
| 修正済み `SkillCreatorPermissionPolicy.ts` | `apps/desktop/src/main/services/runtime/governance/SkillCreatorPermissionPolicy.ts` | ✅   |
| 修正済み `SkillCreatorHooksFactory.ts`     | `apps/desktop/src/main/services/runtime/governance/SkillCreatorHooksFactory.ts`     | ✅   |
| 修正済み `SkillCreatorAuditSink.ts`        | `apps/desktop/src/main/services/runtime/governance/SkillCreatorAuditSink.ts`        | ✅   |
| 修正済み `governance/index.ts`             | `apps/desktop/src/main/services/runtime/governance/index.ts`                        | ✅   |
| 修正済み `RuntimeSkillCreatorFacade.ts`    | `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`               | ✅   |
| テスト実行結果（Green 確認）               | `outputs/phase-5/test-green-result.md`                                              | ✅   |

---

## 完了条件チェックリスト

- [ ] 全テスト（TC-PP/TC-HF/TC-AS/TC-FG）が PASS している
- [ ] `pnpm --filter @repo/desktop typecheck` がエラーなし
- [ ] `pnpm --filter @repo/desktop lint` がエラーなし
- [ ] `_input` 未使用箇所に U1 carry-forward の TODO コメントが付いている
- [ ] `GovernanceAllPhases.test.ts` を含む governance テスト群が PASS している
- [ ] `outputs/phase-5/test-green-result.md` にテスト実行結果が記録されている

---

## 参照資料

| 参照先                                           | 内容                         |
| ------------------------------------------------ | ---------------------------- |
| `outputs/phase-2/change-file-list.md`            | 実装すべきファイルと変更内容 |
| `outputs/phase-4/`                               | テストケース一覧             |
| `docs/30-workflows/unassigned-task/TASK-P0-09-*` | 実装指針・設計判断           |
