# System Spec Update Summary

## 判定

| 項目                      | 結果                                                           |
| ------------------------- | -------------------------------------------------------------- |
| ステータス判定 (Step 1-B) | `completed` — execute phase governance 接続と spec sync を反映 |
| 後続タスク (Step 1-C)     | 1 件 formalized（UI surface / full phase coverage）            |

## Step 1-A: 同一 conversation scope での更新対象

| 対象                                                          | 内容                                      |
| ------------------------------------------------------------- | ----------------------------------------- |
| `.claude/skills/aiworkflow-requirements/LOGS.md`              | TASK-P0-09 完了記録追加                   |
| `.claude/skills/task-specification-creator/LOGS.md`           | TASK-P0-09 完了記録追加                   |
| `.claude/skills/aiworkflow-requirements/indexes/topic-map.md` | 追加 spec の検索導線を再生成              |
| `task-workflow-completed.md`                                  | TASK-P0-09 完了記録追加                   |
| `api-ipc-system-core.md`                                      | governance payload 取得契約を追加         |
| `api-ipc-agent-core.md`                                       | governance IPC 追記                       |
| `interfaces-agent-sdk-skill-reference.md`                     | RuntimeSkillCreatorFacade governance 追記 |

## Step 1-B: ステータス判定

`completed` を判定した。根拠は以下の通り。

- Phase 1-12 の required outputs は実体化済み
- `SkillExecutor` に governance 実行オプション伝播を追加し、`RuntimeSkillCreatorFacade.execute()` から `permissionMode` / `hooks` / `permissions.canUseTool` を渡す current 実装へ是正した
- `SkillCreatorGovernancePolicy` のパス検証を `path.resolve` / `path.relative` ベースに揃え、空パス・traversal・targetDir 未指定を拒否する current facts へ更新した
- system spec 側に runtime governance 追記を行った

## Step 1-C: 後続タスク確認

機能の mainline は完了しているが、次の follow-up を formalize した。

| タスクID                                                  | 内容                                         |
| --------------------------------------------------------- | -------------------------------------------- |
| `UT-P0-09-GOVERNANCE-RUNTIME-COVERAGE-AND-UI-SURFACE-001` | governance の全 phase 適用と renderer 可視化 |

## Step 2: system spec 更新対象

新規 interface / type / API が追加されたため、system spec 更新を実施した。

### 新規型定義（8 型）

`packages/shared/src/types/skillCreator.ts` に追加した governance 関連型。

| 型名                          | 種別      | 説明                                                          |
| ----------------------------- | --------- | ------------------------------------------------------------- |
| `SkillCreatorGovernancePhase` | type      | `"plan" \| "execute" \| "verify" \| "improve"`                |
| `SdkPermissionMode`           | type      | `"default" \| "acceptEdits" \| "bypassPermissions" \| "plan"` |
| `SkillCreatorSdkPolicy`       | interface | Phase 別ポリシー定義                                          |
| `CanUseToolResult`            | interface | canUseTool 判定結果                                           |
| `GovernanceAuditEventKind`    | type      | 監査イベント種別                                              |
| `GovernanceAuditEvent`        | interface | 監査イベント                                                  |
| `GovernanceSessionSummary`    | interface | セッションサマリー                                            |
| `GovernanceUiPayload`         | interface | UI 向けペイロード                                             |

### 新規モジュール（3 モジュール）

| モジュール                     | パス                                                                     | 責務                                                                   |
| ------------------------------ | ------------------------------------------------------------------------ | ---------------------------------------------------------------------- |
| `SkillCreatorGovernancePolicy` | `apps/desktop/src/main/services/runtime/SkillCreatorGovernancePolicy.ts` | Phase 別ポリシー定数と canUseTool コールバック生成                     |
| `GovernanceAuditSink`          | `apps/desktop/src/main/services/runtime/GovernanceAuditSink.ts`          | 監査イベント収集・サマリー生成・UI ペイロード構築                      |
| `GovernanceHooksFactory`       | `apps/desktop/src/main/services/runtime/GovernanceHooksFactory.ts`       | SDK Hooks セット生成（SessionStart/PreToolUse/PostToolUse/SessionEnd） |

### 新規 IPC チャネル（1 チャネル）

| チャネル名                     | 定数名                         | リクエスト                               | レスポンス                       |
| ------------------------------ | ------------------------------ | ---------------------------------------- | -------------------------------- |
| `skill-creator:get-governance` | `SKILL_CREATOR_GET_GOVERNANCE` | `{ phase: SkillCreatorGovernancePhase }` | `IpcResult<GovernanceUiPayload>` |

### 新規 preload API メソッド（1 メソッド）

| メソッド               | シグネチャ                                                                        | 説明                                  |
| ---------------------- | --------------------------------------------------------------------------------- | ------------------------------------- |
| `getGovernancePayload` | `(phase: SkillCreatorGovernancePhase) => Promise<IpcResult<GovernanceUiPayload>>` | renderer 側から governance 状態を取得 |

### RuntimeSkillCreatorFacade 拡張（3 メソッド）

| メソッド                           | 可視性  | 説明                                          |
| ---------------------------------- | ------- | --------------------------------------------- |
| `getGovernanceUiPayload(phase)`    | public  | GovernanceUiPayload を構築して返す            |
| `getGovernanceAuditEvents()`       | public  | 蓄積された全監査イベントを返す                |
| `resolveSkillTargetDir(skillName)` | private | `$HOME/.claude/skills/<skillName>` パスを生成 |

### 更新した system spec ファイル

| ファイル                                                                                    | 反映内容                                                                                |
| ------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| `.claude/skills/aiworkflow-requirements/references/api-ipc-system-core.md`                  | `skill-creator:get-governance` の public contract と shared/preload/main 責務を追加     |
| `.claude/skills/aiworkflow-requirements/references/api-ipc-agent-core.md`                   | `skill-creator:get-governance` IPC と関連型を追加                                       |
| `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill-reference.md` | `RuntimeSkillCreatorFacade` の governance 拡張と execute wiring の current facts を追記 |
| `.claude/skills/aiworkflow-requirements/references/task-workflow-completed.md`              | TASK-P0-09 の完了記録と follow-up を追加                                                |
| `.claude/skills/aiworkflow-requirements/indexes/topic-map.md`                               | 追加した spec セクションへの検索導線を再生成                                            |
