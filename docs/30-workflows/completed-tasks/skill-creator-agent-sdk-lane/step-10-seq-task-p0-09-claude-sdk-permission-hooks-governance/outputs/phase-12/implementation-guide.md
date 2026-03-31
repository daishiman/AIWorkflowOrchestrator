# TASK-P0-09: Claude SDK Permission Hooks Governance -- 実装ガイド

## Part 1: まず何を直したのか

この変更は、スキル作成レーンを「作業部屋ごとに入ってよい道具箱を切り替える」ようにしたものです。

- `plan` は設計を見るだけなので、読む道具を中心に使う
- `execute` は実際にファイルを作るので、書く道具を許可する
- `verify` は結果確認なので、また読む道具へ戻す
- `improve` は直す作業だけに絞る

なぜ必要かというと、全部の phase で同じ強い権限を持たせると、設計確認だけの場面でも不用意な変更が入り得るからです。最初に「何ができるか」を phase ごとに固定しておくと、安全境界が崩れにくくなります。

今回の task は UI コンポーネント追加ではなく governance hardening なので、Phase 11 では `NON_VISUAL` 判定になっています。したがって `outputs/phase-11/screenshots/` は不要で、根拠は `outputs/phase-11/manual-test-result.md` に残しています。

## Part 2: 技術詳細

### Summary

Claude Code SDK の `permissionMode`、`allowedTools` / `disallowedTools`、`canUseTool`、Hooks を skill-creator lane の phase (plan / execute / verify / improve) ごとに扱う governance module を実装した。

current facts として成立しているのは、phase 別 policy 定義、`execute` の tool-level enforcement、`verify` を含む session audit 記録、renderer 向け governance state 公開である。設計上予定していた path-scoped enforcement は policy helper と単体テストまでは存在するが、SDK 実行経路への `targetPath` / `allowedSkillRoot` 接続は未完了であり、carry-forward task として管理する。

### 主な変更点

- **Phase 別 tool policy**: plan は read-only、execute は write 許可、verify は read + test、improve は限定 edit
- **Governance hooks**: `SkillExecutor` の SDK hooks と facade 側の phase 監査を接続し、実行時の tool 利用を記録
- **Audit sink**: 監査イベントの一元蓄積とフィルタリング (session / denial / recent)
- **IPC 統合**: `getGovernanceState()` API で renderer に governance 状態を公開
- **型安全**: 6 つの governance 型を shared types に追加

---

## New Files

### apps/desktop/src/main/services/runtime/governance/

| ファイル                          | 責務                                    | 行数 (概算) |
| --------------------------------- | --------------------------------------- | ----------- |
| `SkillCreatorPermissionPolicy.ts` | Phase 別 tool policy と canUseTool 判定 | ~196        |
| `SkillCreatorHooksFactory.ts`     | Phase 別 Hooks handler 生成             | ~102        |
| `SkillCreatorAuditSink.ts`        | 監査イベント一元収集・保持              | ~102        |
| `index.ts`                        | バレルエクスポート                      | ~16         |

---

## Modified Files

| ファイル                                                                  | 変更内容                                               |
| ------------------------------------------------------------------------- | ------------------------------------------------------ |
| `packages/shared/src/types/skillCreator.ts`                               | 6 governance 型追加                                    |
| `packages/shared/src/types/index.ts`                                      | 新規型のエクスポート追加                               |
| `apps/desktop/src/preload/channels.ts`                                    | `SKILL_CREATOR_GET_GOVERNANCE_STATE` channel 追加      |
| `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`     | governance hooks を plan/execute/verify/improve に統合 |
| `apps/desktop/src/main/services/skill/SkillExecutor.ts`                   | SDK hooks 実接続と permissionMode 透過                 |
| `apps/desktop/src/main/ipc/creatorHandlers.ts`                            | governance state IPC handler 追加                      |
| `apps/desktop/src/preload/skill-creator-api.ts`                           | `getGovernanceState()` API メソッド追加                |
| `apps/desktop/src/main/ipc/__tests__/creatorHandlers.test.ts`             | handler 登録数テスト 9 → 10 更新                       |
| `apps/desktop/src/preload/__tests__/skill-creator-api.governance.test.ts` | governance テスト更新                                  |

---

## Architecture

### Governance Module 構成

```
governance/
  SkillCreatorPermissionPolicy.ts   ← Policy 判定
  SkillCreatorHooksFactory.ts       ← Hooks 生成
  SkillCreatorAuditSink.ts          ← Audit 記録
  index.ts                          ← バレルエクスポート
```

### 依存グラフ

```
shared types (skillCreator.ts)
    ↑
    ├── PermissionPolicy ──────────┐
    │                              │
    ├── AuditSink ─────────────────┤
    │                              │
    ├── HooksFactory ──────────────┤
    │      ↑ depends on            │
    │      ├── PermissionPolicy    │
    │      └── AuditSink           │
    │                              │
    ├── Facade ────────────────────┤
    │      ↑ depends on            │
    │      └── HooksFactory        │
    │                              │
    ├── creatorHandlers ───────────┤
    │      ↑ depends on            │
    │      └── Facade              │
    │                              │
    └── skill-creator-api ─────────┘
           ↑ depends on
           └── IPC channels
```

### 処理フロー

```
1. Facade.plan() / execute() / verify() / improve() が呼ばれる
2. createGovernanceHooks(phase) で hooks を生成
3. hooks.onSessionStart() で session/provenance を記録
4. `SkillExecutor` が SDK `query()` に hooks と `canUseTool` を渡し、実行中の tool 利用を監視する
   - allowed → audit 記録 → tool 実行
   - denied → audit 記録 (denial) → tool 実行拒否
5. hooks.onPostToolUse() で実行結果を記録
6. hooks.onSessionEnd() で session summary を記録
7. renderer は getGovernanceState() で状態を取得
```

---

## Phase 別 Policy テーブル

| Phase     | permissionMode | allowedTools                               | disallowedTools           | パス制約                                       |
| --------- | -------------- | ------------------------------------------ | ------------------------- | ---------------------------------------------- |
| `plan`    | `default`      | Read, Glob, Grep, Bash, Agent              | Write, Edit, NotebookEdit | なし                                           |
| `execute` | `acceptEdits`  | Read, Glob, Grep, Bash, Agent, Write, Edit | NotebookEdit              | tool-level enforce 済み。path 制約は follow-up |
| `verify`  | `default`      | Read, Glob, Grep, Bash, Agent              | Write, Edit, NotebookEdit | なし                                           |
| `improve` | `acceptEdits`  | Read, Glob, Grep, Bash, Agent, Edit        | Write, NotebookEdit       | path 制約は未接続 (提案生成 phase)             |

### canUseTool 判定フロー

```
canUseTool(toolName, phase, context?)
  │
  ├─ disallowedTools に含まれるか？ → YES → deny
  ├─ allowedTools に含まれるか？ → NO → deny
  ├─ context が接続されているか？ → YES → パス制約チェック
  │    └─ targetPath が allowedSkillRoot 外？ → YES → deny
  └─ allow
```

注記:

- `SkillCreatorPermissionPolicy.canUseTool()` 自体は context-aware 判定を持つ
- 現在の runtime execute 経路では `toolName` ベース判定までが実効範囲
- path-scoped enforcement 完了には SDK callback 入力から `targetPath` を抽出し、`allowedSkillRoot` と結合する追加配線が必要

---

## Hooks Lifecycle

```
SessionStart
  │  監査: sessionId, phase, provenance を記録
  │
  ├─ PreToolUse (tool ごとに)
  │    │  判定: canUseTool() で allow/deny
  │    │  監査: toolName, decision, reason を記録
  │    │
  │    └─ PostToolUse (tool 実行後)
  │         監査: toolName, success/error, durationMs を記録
  │
  ├─ PreToolUse → PostToolUse  (繰り返し)
  │
  └─ SessionEnd
       監査: sessionSummary (totalToolCalls, denialCount, duration) を記録
```

---

## IPC Integration

### 新規 IPC Channel

| Channel                              | 方向            | 用途                |
| ------------------------------------ | --------------- | ------------------- |
| `skill-creator:get-governance-state` | renderer → main | governance 状態取得 |

### Preload API

```typescript
skillCreatorAPI.getGovernanceState(): Promise<IpcResult<SkillCreatorGovernanceState>>
```

### API シグネチャと使用例

```typescript
// main
facade.getGovernanceState(): SkillCreatorGovernanceState

// preload
skillCreatorAPI.getGovernanceState(): Promise<
  IpcResult<SkillCreatorGovernanceState>
>
```

```typescript
const governance = await window.skillCreatorAPI.getGovernanceState();

if (governance.success) {
  console.log(governance.data.phase);
  console.table(governance.data.recentDenials);
}
```

```typescript
const executeResult = await facade.execute(planResult, "api-key", "sk-test");
const state = facade.getGovernanceState();

console.log({
  phase: state.phase,
  latestAudit: state.recentAuditEvents.at(-1)?.eventType,
  deniedCount: state.recentDenials.length,
});
```

### 画面証跡

- UI 変更なしのため screenshot 要件は N/A
- 判定根拠: `outputs/phase-11/manual-test-result.md` の `NON_VISUAL`
- implementation-guide には screenshot 参照を追加しない

### GovernanceState 構造

```typescript
interface SkillCreatorGovernanceState {
  phase: SkillCreatorGovernancePhase;
  activePolicy: SkillCreatorSdkPolicy;
  recentAuditEvents: SkillCreatorGovernanceAuditEvent[];
  recentDenials: SkillCreatorSdkPermissionDenial[];
}
```

### エラーハンドリングとエッジケース

| ケース                                             | 現在の挙動                                      | 備考                         |
| -------------------------------------------------- | ----------------------------------------------- | ---------------------------- |
| `verificationEngine` 未注入で `verifySkill()` 実行 | 空配列を返し、`session_end` audit を記録        | graceful degradation         |
| `execute()` 中に SDK 実行が throw                  | `execution_error` として workflow engine へ記録 | `sdkEvents` は空配列で正規化 |
| `canUseTool` で不許可 tool を要求                  | deny message を返し audit sink に denial が残る | 現状は tool 名ベース         |
| `NotebookEdit` 要求                                | 全 phase で deny                                | policy table 固定            |
| path-scoped 判定用 context 不在                    | tool-level 判定のみ適用                         | `TASK-P0-09-U1` の対象       |
| renderer が governance API を未消費                | main/preload/shared までは利用可能              | UI 表示は未着手              |

### 設定可能パラメータと定数一覧

| 名前                                           | 種別        | 値 / 役割                                 |
| ---------------------------------------------- | ----------- | ----------------------------------------- |
| `SkillCreatorGovernancePhase`                  | type        | `plan` / `execute` / `verify` / `improve` |
| `permissionMode`                               | SDK option  | `default` または `acceptEdits`            |
| `allowedTools`                                 | policy      | phase ごとの許可 tool 一覧                |
| `disallowedTools`                              | policy      | phase ごとの拒否 tool 一覧                |
| `recentAuditEvents` 上限                       | facade      | 直近 20 件を返却                          |
| `recentDenials` 上限                           | facade      | 直近 10 件を返却                          |
| `DESTRUCTIVE_TOOLS`                            | policy 定数 | `NotebookEdit`                            |
| `READ_TOOLS` / `WRITE_TOOLS` / `IMPROVE_TOOLS` | policy 定数 | phase 別基本 tool セット                  |

---

## Shared Types (追加分)

| 型名                               | 説明                                                                                    |
| ---------------------------------- | --------------------------------------------------------------------------------------- |
| `SkillCreatorGovernancePhase`      | `"plan" \| "execute" \| "verify" \| "improve"`                                          |
| `SkillCreatorSdkPolicy`            | phase / permissionMode / allowedTools / disallowedTools                                 |
| `SkillCreatorToolDecision`         | allowed / reason / phase / toolName                                                     |
| `SkillCreatorHookEventType`        | `"session_start" \| "pre_tool_use" \| "post_tool_use" \| "session_end"`                 |
| `SkillCreatorGovernanceAuditEvent` | eventType / timestamp / sessionId / phase / toolName / decision / provenance / metadata |
| `SkillCreatorGovernanceState`      | phase / activePolicy / recentAuditEvents / recentDenials                                |

---

## Test Coverage

| テストファイル                       | テスト数 | 種別 |
| ------------------------------------ | -------- | ---- |
| SkillCreatorPermissionPolicy.test.ts | 29       | unit |
| SkillCreatorHooksFactory.test.ts     | 16       | unit |
| SkillCreatorAuditSink.test.ts        | 11       | unit |
| skill-creator-api.governance.test.ts | 8        | 統合 |
| **合計**                             | **64**   |      |

### テストカバレッジ概要

- **Policy**: 4 phase の allow/deny、context-aware helper、NotebookEdit 全 phase 拒否
- **Hooks**: 実行順 (SessionStart→PreToolUse→PostToolUse→SessionEnd)、provenance 記録、denial audit
- **AuditSink**: record/getEvents/getRecentEvents/getEventsBySession/getDenialEvents/maxEvents/clear
- **IPC**: SKILL_CREATOR_GET_GOVERNANCE_STATE channel 登録、shared channel 再利用

---

## AC Compliance Matrix

| AC   | 基準                                             | 実装                                                                              | テスト   | 判定    |
| ---- | ------------------------------------------------ | --------------------------------------------------------------------------------- | -------- | ------- |
| AC-1 | phase 別 permissionMode / tool 境界定義          | POLICY_TABLE (4 phase)                                                            | 18 tests | PASS    |
| AC-2 | allowedTools / disallowedTools / canUseTool 実装 | tool-level canUseTool は実配線済み。context-aware path enforcement は helper 段階 | 25 tests | PARTIAL |
| AC-3 | Hook による監査イベント記録                      | HooksFactory.createHooks() + AuditSink.recordEvent()                              | 20 tests | PASS    |
| AC-4 | permission denial / hook 結果の UI / audit 反映  | Audit / IPC surface は main-preload-shared まで反映。renderer 利用は別 task       | 12 tests | PASS    |
| AC-5 | 動的読込結果 / provenance の hook / audit 包含   | SessionStart provenance と verify session audit は反映済み                        | 6 tests  | PARTIAL |
| AC-6 | skill-creator の固定化 / hardcoded prompt 不在   | 静的コピーなし、ManifestLoader コア変更なし                                       | 2 tests  | PASS    |

---

## 非破壊性の保証

- `RuntimeSkillCreatorFacade` の plan() / execute() / improve() の既存ロジック本体は変更なし
- governance hooks は wrap として追加されるのみで、主処理に介入しない
- `ManifestLoader` / `SkillCreatorSourceResolver` のコアロジックに変更なし
- `.claude/skills/skill-creator/` は常に動的に読み込まれ、静的コピーは作成しない
- `bypassPermissions` は policy テーブルに含まず、構造的に使用不可

## 残課題

- `TASK-P0-09-U1 governance-actual-enforcement-completion`
  - `execute` / 将来の `improve` 実行経路で `targetPath` と `allowedSkillRoot` を実配線し、path-scoped deny を runtime で有効化する
  - phase outputs の AC / coverage 表現をこの実効 enforcement に合わせて再同期する
