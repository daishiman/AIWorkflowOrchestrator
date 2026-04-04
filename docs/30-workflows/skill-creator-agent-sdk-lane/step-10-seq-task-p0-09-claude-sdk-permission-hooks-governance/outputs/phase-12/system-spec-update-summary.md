# Phase 12: システム仕様更新サマリ (System Spec Update Summary)

## メタ情報

| 項目     | 値                                     |
| -------- | -------------------------------------- |
| タスクID | TASK-P0-09                             |
| Phase    | 12                                     |
| 機能名   | claude-sdk-permission-hooks-governance |
| 作成日   | 2026-03-31                             |

---

## 1. 更新要否判定

### 判定: 更新あり

新規 interface / type / IPC channel の追加があるため、システム仕様への反映が必要。

---

## 2. 追加された型 (packages/shared/src/types/skillCreator.ts)

| 型名                               | 種別      | 説明                                                                                    |
| ---------------------------------- | --------- | --------------------------------------------------------------------------------------- |
| `SkillCreatorGovernancePhase`      | type      | `"plan" \| "execute" \| "verify" \| "improve"`                                          |
| `SkillCreatorSdkPolicy`            | interface | phase / permissionMode / allowedTools / disallowedTools                                 |
| `SkillCreatorToolDecision`         | interface | allowed / reason / phase / toolName                                                     |
| `SkillCreatorHookEventType`        | type      | `"session_start" \| "pre_tool_use" \| "post_tool_use" \| "session_end"`                 |
| `SkillCreatorGovernanceAuditEvent` | interface | eventType / timestamp / sessionId / phase / toolName / decision / provenance / metadata |
| `SkillCreatorGovernanceState`      | interface | phase / activePolicy / recentAuditEvents / recentDenials                                |

---

## 3. 追加された IPC Channel (apps/desktop/src/preload/channels.ts)

| Channel 名                           | 値                                   | 方向            | 用途                |
| ------------------------------------ | ------------------------------------ | --------------- | ------------------- |
| `SKILL_CREATOR_GET_GOVERNANCE_STATE` | `skill-creator:get-governance-state` | renderer → main | governance 状態取得 |

---

## 4. 追加されたモジュール

| モジュール                                                                          | 種別         | 説明                      |
| ----------------------------------------------------------------------------------- | ------------ | ------------------------- |
| `apps/desktop/src/main/services/runtime/governance/SkillCreatorPermissionPolicy.ts` | 新規ファイル | Phase 別 tool policy 判定 |
| `apps/desktop/src/main/services/runtime/governance/SkillCreatorHooksFactory.ts`     | 新規ファイル | Hooks handler 生成        |
| `apps/desktop/src/main/services/runtime/governance/SkillCreatorAuditSink.ts`        | 新規ファイル | 監査イベント一元収集      |
| `apps/desktop/src/main/services/runtime/governance/index.ts`                        | 新規ファイル | バレルエクスポート        |

---

## 5. 既存仕様への影響

| 既存仕様                         | 影響     | 詳細                                   |
| -------------------------------- | -------- | -------------------------------------- |
| RuntimeSkillCreatorFacade の API | 拡張     | getGovernanceState() メソッド追加      |
| creatorHandlers の handler 数    | 増加     | 9 → 10 (governance state handler 追加) |
| skill-creator-api の API         | 拡張     | getGovernanceState() メソッド追加      |
| ManifestLoader コアロジック      | 変更なし | --                                     |
| SkillCreatorSourceResolver       | 変更なし | --                                     |

---

## 6. 根拠

本タスクでは以下の新規 API / 型 / channel を追加しており、システム仕様書への反映が必要:

1. 6 つの governance 型は shared types として全レイヤーから参照される
2. IPC channel は preload の ALLOWED_INVOKE_CHANNELS に登録済み
3. governance/ モジュールは RuntimeSkillCreatorFacade の internal dependency として追加
4. getGovernanceState() は renderer が能動的に governance 状態を取得するための public API

## 7. 更新した正本仕様

| ファイル                                                                                    | 反映内容                                                              |
| ------------------------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| `.claude/skills/aiworkflow-requirements/references/api-ipc-system-core.md`                  | runtime public IPC 一覧へ `skill-creator:get-governance-state` を追加 |
| `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill-reference.md` | `skillCreatorAPI` surface に `getGovernanceState()` を追加            |
| `.claude/skills/aiworkflow-requirements/references/task-workflow-completed.md`              | TASK-P0-09 close-out record を追加                                    |
