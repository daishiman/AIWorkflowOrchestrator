# Lessons Learned（教訓集） / auth / ipc lessons

> 親仕様書: [lessons-learned.md](lessons-learned.md)
> 役割: auth / ipc / skill-creator governance / hooks / permission lessons

## TASK-P0-09: Claude SDK permissionMode + canUseTool + Hooks ガバナンス実装（2026-03-31）

### タスク概要

| 項目       | 値                                                                                                                       |
| ---------- | ------------------------------------------------------------------------------------------------------------------------ |
| タスクID   | TASK-P0-09                                                                                                               |
| 目的       | Skill Creator lane に Claude Code SDK の permissionMode / allowedTools / disallowedTools / canUseTool / Hooks ガバナンスを追加 |
| 完了日     | 2026-03-31                                                                                                               |
| ステータス | ✅ 完了                                                                                                                   |
| テスト結果 | 68 governance tests PASS（全体 580 tests）                                                                               |

### 苦戦箇所

| #   | 課題                                          | 原因                                                                                                                                   | 解決策                                                                                                                                                                                  | 教訓                                                                                                                                                                                               |
| --- | --------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | `@repo/shared` モジュール解決エラー             | 新規型定義を `packages/shared/src/types/skillCreator.ts` に追加したが、テスト実行前に `pnpm --filter @repo/shared build` を忘れた        | `pnpm --filter @repo/shared build` で再ビルド後、全テスト PASS                                                                                                                          | `@repo/shared` に型追加したらテスト前に必ずビルドする。「Failed to load url @repo/shared/types」はビルド未実施のサイン                                                                              |
| 2   | `creatorHandlers.test.ts` handler count アサーション失敗 | IPC ハンドラ追加（`SKILL_CREATOR_GET_GOVERNANCE_STATE`）により `handlerMap.size` が 9→10 に変化。3箇所に `toBe(9)` が hardcode されていた | 3箇所全て `toBe(10)` に変更                                                                                                                                                              | IPC ハンドラ追加は `creatorHandlers.test.ts` の handler count assertion を必ず更新する。hardcode 数値は追加のたびにサイレント失敗を引き起こす可能性があるため、count assertion は変更理由として認識する |
| 3   | ガバナンスチャンネル漏れテストとの衝突          | `skill-creator-api.governance.test.ts` は「governance チャンネルが存在しない」ことを assertしていた（当時の漏洩防止テスト）。TASK-P0-09で正当に `get-governance-state` を追加したため失敗 | テストを「approval/disclosure チャンネルが存在しない」に限定変更し、`SKILL_CREATOR_GET_GOVERNANCE_STATE` が ALLOWED_INVOKE_CHANNELS に含まれることを正の assertion として追加              | セキュリティテストの「存在しないこと」assertionは、将来の正当な機能追加で壊れる。対象ドメインを絞る（例: 「approval系チャンネルが無い」）か、許容リストを明示する形にする                              |
| 4   | ガバナンス層が AC-6（dynamic skill loading）を壊さない設計 | ガバナンス機能を RuntimeSkillCreatorFacade 内に直接注入すると ManifestLoader パイプラインに干渉するリスクがあった                        | governance hooks をラッパー層として実装し、`createGovernanceHooks(phase)` が各 phase メソッドの開始/終了に audit record を追加するのみとした。ManifestLoader や skill loading パイプラインへの変更なし | ガバナンス機能は「横断的関心事（cross-cutting concern）」として実装する。コアロジックへの侵入を避け、Start/End の lifecycle フックとして外側に追加する                                               |

### 主要設計決定

#### Phase別ツールポリシー

```typescript
// governance/SkillCreatorPermissionPolicy.ts
const POLICY_TABLE: Record<SkillCreatorGovernancePhase, SkillCreatorSdkPolicy> = {
  plan:    { permissionMode: "default",      allowedTools: ["Read", "Glob", "Grep", "Bash"], disallowedTools: ["Write", "Edit", "NotebookEdit"] },
  execute: { permissionMode: "acceptEdits",  allowedTools: ["Write", "Edit", "Read", "Glob", "Grep", "Bash"], disallowedTools: ["NotebookEdit"] },
  verify:  { permissionMode: "default",      allowedTools: ["Read", "Glob", "Grep", "Bash"], disallowedTools: ["Write", "Edit", "NotebookEdit"] },
  improve: { permissionMode: "acceptEdits",  allowedTools: ["Edit", "Read", "Glob", "Grep", "Bash"], disallowedTools: ["Write", "NotebookEdit"] },
};
```

**設計原則**: plan/verify = read-only (default), execute = write 可 (acceptEdits), improve = edit 可・new file 不可 (acceptEdits)

#### canUseTool context-aware 判定

```typescript
// CanUseToolContext: path-scoped enforcement（TASK-P0-09-U1 で runtime 接続予定）
export interface CanUseToolContext {
  targetPath?: string;       // 操作対象ファイルパス
  allowedSkillRoot?: string; // 許可されたスキルルートディレクトリ
}

canUseTool("Write", "execute", {
  targetPath: "/other/file.ts",
  allowedSkillRoot: "/skills/my-skill",
}) // → { allowed: false, reason: "outside allowed skill root" }
```

**未接続**: policy helper と unit tests は実装済みだが、SDK execution path への接続は TASK-P0-09-U1 として未タスク化

#### AuditSink maxEvents ガード

```typescript
// SkillCreatorAuditSink.ts
private readonly maxEvents = 500;
record(event) {
  if (this.events.length >= this.maxEvents) {
    this.events.shift(); // 最古イベントを除去
  }
  this.events.push(event);
}
```

**設計意図**: ガバナンスのメモリ増大を防ぐ。長時間セッションでも 500 件上限を維持

#### Hooks-as-audit-only 原則

```typescript
// SkillCreatorHooksFactory.ts
createHooks(phase, auditSink, provenance?) {
  return {
    onPreToolUse: (toolName, input?) => {
      const decision = canUseTool(toolName, phase);
      auditSink.record({ eventType: "pre_tool_use", decision, ... });
      return decision; // SDKへの decision 返却は実装済み
    },
    onSessionStart: () => auditSink.record({ eventType: "session_start", ... }),
    onSessionEnd: () => auditSink.record({ eventType: "session_end", ... }),
    onPostToolUse: () => auditSink.record({ eventType: "post_tool_use", ... }),
  };
}
```

**原則**: hooks はあくまで監査・記録が主目的。ブロック機能は decision を返すが、実際の SDK enforcement は接続ポイント次第

### IPC 拡張パターン（TASK-P0-09）

| レイヤー             | 追加内容                                                                                |
| -------------------- | --------------------------------------------------------------------------------------- |
| `packages/shared`    | 6型追加: `SkillCreatorGovernancePhase`, `SkillCreatorSdkPolicy`, `SkillCreatorToolDecision`, `SkillCreatorHookEventType`, `SkillCreatorGovernanceAuditEvent`, `SkillCreatorGovernanceState` |
| `preload/channels.ts` | `SKILL_CREATOR_GET_GOVERNANCE_STATE` チャンネル追加 + ALLOWED_INVOKE_CHANNELS 登録      |
| `main/ipc/creatorHandlers.ts` | `getGovernanceState` ハンドラ追加（handler count 9→10）                          |
| `preload/skill-creator-api.ts` | `getGovernanceState()` メソッド追加                                             |

### ファイル構成（新規作成）

```
apps/desktop/src/main/services/runtime/governance/
  SkillCreatorPermissionPolicy.ts  # phase policy table + canUseTool
  SkillCreatorAuditSink.ts         # max-500 in-memory audit store
  SkillCreatorHooksFactory.ts      # createHooks() per phase
  index.ts                         # governance モジュール公開 API
```

### 未タスク（carry-forward）

- **TASK-P0-09-U1**: path-scoped enforcement の runtime 接続
  - `canUseTool` の `CanUseToolContext` を SDK execution path に接続
  - `allowedSkillRoot` を実行時の skill root から動的に取得
  - 詳細: `docs/30-workflows/unassigned-task/TASK-P0-09-U1-path-scoped-governance-runtime-enforcement.md`
