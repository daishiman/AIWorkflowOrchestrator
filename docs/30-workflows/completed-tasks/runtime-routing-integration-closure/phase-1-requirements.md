# Phase 1: 要件定義 - タスク仕様書

## メタ情報

| 項目       | 内容                                                       |
| ---------- | ---------------------------------------------------------- |
| Phase      | 1                                                          |
| Phase名    | 要件定義                                                   |
| タスクID   | UT-IMP-SKILL-AGENT-RUNTIME-ROUTING-INTEGRATION-CLOSURE-001 |
| 前提Phase  | なし                                                       |
| 後続Phase  | Phase 2（設計）                                            |
| ステータス | completed                                                  |
| 作成日     | 2026-03-14                                                 |
| 機能名     | runtime-routing-integration-closure                        |

## 目的

Skill / Agent / Creator の3実行パスにおける runtime routing の現状ギャップを洗い出し、統合クロージャの要件と受入基準を明文化する。

## 実行タスク

- Gap 棚卸し: 3実行パス（SkillExecutor, AgentExecutor, SkillCreatorService）で RuntimeResolver が適用されていない箇所を特定する
- Renderer Hook 分析: useSkillExecution / useAgent が authMode を参照していない箇所を特定し、分岐追加の要件を定義する
- TerminalHandoffCard 要件: handoff 時に表示すべき情報（CLI コマンド、コンテキストサマリー、理由）を定義する
- 既存保証抽出: preflight / permission / streaming 契約として維持すべき不変条件を抽出する
- 受入基準作成: 各要件に対して検証可能な受入基準を定義する

## 参照資料

| 参照資料                    | パス                                                                 | 内容                                                    |
| --------------------------- | -------------------------------------------------------------------- | ------------------------------------------------------- |
| RuntimeResolver             | `apps/desktop/src/main/services/chat-edit/RuntimeResolver.ts`        | 既存の runtime 決定ロジック（L23-48）を確認する         |
| TerminalHandoffBuilder      | `apps/desktop/src/main/services/chat-edit/TerminalHandoffBuilder.ts` | handoff guidance 生成ロジックを確認する                 |
| chatEditHandlers            | `apps/desktop/src/main/ipc/chatEditHandlers.ts`                      | RuntimeResolver の統合パターン（L130-191）を参考にする  |
| SkillExecutor               | `apps/desktop/src/main/services/skill/SkillExecutor.ts`              | skill execute path の runtime 未適用を確認する          |
| AgentExecutor               | `apps/desktop/src/main/services/agent/AgentExecutor.ts`              | agent execute path の runtime 未適用を確認する          |
| SkillCreatorService         | `apps/desktop/src/main/services/skill/SkillCreatorService.ts`        | creator の runtime 未適用を確認する                     |
| useSkillExecution           | `apps/desktop/src/renderer/hooks/useSkillExecution.ts`               | authMode 未参照の箇所を確認する                         |
| useAgent                    | `apps/desktop/src/renderer/hooks/useAgent.ts`                        | authMode 未参照の箇所を確認する                         |
| skillExecutionAuthPreflight | `apps/desktop/src/renderer/utils/skillExecutionAuthPreflight.ts`     | API キー確認のみで authMode 分岐がないことを確認する    |
| authModeSlice               | `apps/desktop/src/renderer/store/slices/authModeSlice.ts`            | authMode 状態管理の個別セレクタを確認する               |
| composition root            | `apps/desktop/src/main/ipc/index.ts`                                 | registerAllIpcHandlers の DI 構造（L819-844）を確認する |

### システム仕様（aiworkflow-requirements）

> 実装前に以下の正本仕様を確認し、既存設計との整合性を確保する。

| 参照資料                      | パス                                                                                            | 内容                            |
| ----------------------------- | ----------------------------------------------------------------------------------------------- | ------------------------------- |
| resource-map                  | `.claude/skills/aiworkflow-requirements/indexes/resource-map.md`                                | タスク種別ごとの必須仕様を特定  |
| quick-reference               | `.claude/skills/aiworkflow-requirements/indexes/quick-reference.md`                             | runtime/authmode 抽出順序を確認 |
| workflow-ai-runtime-authmode  | `.claude/skills/aiworkflow-requirements/references/workflow-ai-runtime-authmode-unification.md` | 親 workflow の契約と未完了範囲  |
| legacy-family-register        | `.claude/skills/aiworkflow-requirements/references/legacy-ordinal-family-register.md`           | 旧ファイル名との互換導線        |
| interfaces-agent-sdk-executor | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-executor.md`            | execute 契約と error code 正本  |
| interfaces-agent-sdk-skill    | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md`               | skill lifecycle 契約正本        |
| interfaces-llm                | `.claude/skills/aiworkflow-requirements/references/interfaces-llm.md`                           | RuntimeResolution / Guidance 型 |
| interfaces-auth               | `.claude/skills/aiworkflow-requirements/references/interfaces-auth.md`                          | authMode / auth key 契約        |
| api-ipc-agent-core            | `.claude/skills/aiworkflow-requirements/references/api-ipc-agent-core.md`                       | chat-edit runtime IPC 契約      |
| api-ipc-agent                 | `.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md`                            | Skill / Agent IPC 契約          |
| api-ipc-system                | `.claude/skills/aiworkflow-requirements/references/api-ipc-system.md`                           | system IPC / authMode 契約      |
| security-electron-ipc-core    | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc-core.md`               | workspacePath 境界検証          |
| security-electron-ipc         | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`                    | IPC sender 検証と境界防御       |
| security-skill-execution      | `.claude/skills/aiworkflow-requirements/references/security-skill-execution.md`                 | permission と trust 境界の正本  |
| arch-electron-services        | `.claude/skills/aiworkflow-requirements/references/arch-electron-services.md`                   | Main service DI の正本          |
| arch-state-management         | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`                    | Store 拡張境界の正本            |
| ui-ux-agent-execution         | `.claude/skills/aiworkflow-requirements/references/ui-ux-agent-execution.md`                    | handoff UI 契約                 |
| ui-ux-feature-components      | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md`                 | runtime 関連 UI の横断仕様      |
| ui-ux-settings                | `.claude/skills/aiworkflow-requirements/references/ui-ux-settings.md`                           | authMode 設定導線               |
| llm-workspace-chat-edit       | `.claude/skills/aiworkflow-requirements/references/llm-workspace-chat-edit.md`                  | RuntimeResolver 移設元契約      |
| ipc-contract-checklist        | `.claude/skills/aiworkflow-requirements/references/ipc-contract-checklist.md`                   | IPC 契約監査チェック項目        |
| task-workflow                 | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`                            | Phase 12 同期先                 |
| lessons-learned-current       | `.claude/skills/aiworkflow-requirements/references/lessons-learned-current.md`                  | Runtime/AuthMode 苦戦箇所       |
| follow-up unassigned          | `docs/30-workflows/unassigned-task/task-imp-ai-runtime-test-separation-criteria-001.md`         | 関連未タスクの境界条件          |

## 実行手順

### ステップ0: P50チェック - 既実装状態の調査（必須）

Phase 1 開始時に、対象ファイルの現在の実装状態を確認する。

```bash
# RuntimeResolver の使用箇所
grep -rn "RuntimeResolver" apps/desktop/src/

# TerminalHandoffBuilder の使用箇所
grep -rn "TerminalHandoffBuilder" apps/desktop/src/

# authMode 参照の検索（Renderer Hook 内）
grep -rn "authMode\|useAuthMode" apps/desktop/src/renderer/hooks/

# TerminalHandoffCard の存在確認
grep -rn "TerminalHandoffCard\|HandoffCard" apps/desktop/src/renderer/
```

| 判定     | 条件                               | 対応                                   |
| -------- | ---------------------------------- | -------------------------------------- |
| 既実装   | runtime 分岐が全実行パスに適用済み | Phase 4-5 を「検証・補完」モードに変更 |
| 部分実装 | chat-edit のみ適用、他パス未適用   | 通常の実装フローで進行                 |
| 未実装   | RuntimeResolver が存在しない       | 設計から開始                           |

### ステップ1: 参照資料を確認する

この Phase で使う code path、system spec を確認し、runtime routing 統合クロージャの対象範囲を固定する。

### ステップ2: Gap 棚卸しを実施する

3実行パスごとに以下のマトリクスを作成する:

| 実行パス            | RuntimeResolver 適用 | authMode 参照 | Handoff UI | Preflight 契約 | Permission 契約 |
| ------------------- | -------------------- | ------------- | ---------- | -------------- | --------------- |
| SkillExecutor       | -                    | -             | -          | -              | -               |
| AgentExecutor       | -                    | -             | -          | -              | -               |
| SkillCreatorService | -                    | -             | -          | -              | -               |
| chat-edit（参考）   | -                    | -             | -          | -              | -               |

### ステップ3: 既存保証を抽出する

preflight / permission / streaming の契約として維持すべき不変条件を以下の形式で記録する:

| 保証名               | 契約内容 | 対象実行パス | 維持必須 |
| -------------------- | -------- | ------------ | -------- |
| API Key Preflight    | -        | -            | -        |
| Permission Dialog    | -        | -            | -        |
| Streaming Completion | -        | -            | -        |

### ステップ4: 受入基準を定義する

各ギャップに対して、検証可能な受入基準をチェックリスト形式で記述する。

### ステップ5: system spec との整合を確認する

aiworkflow-requirements の正本と照合し、契約・UI・security・state のズレを残さない。

## 統合テスト連携

3実行パスの runtime routing gap を要件として整理し、統合テストの接続要件を明文化する。特に以下を要件に含める:

- SkillExecutor / AgentExecutor / SkillCreatorService での authMode 分岐
- Renderer Hook（useSkillExecution / useAgent）での authMode 参照
- TerminalHandoffCard の表示条件と表示内容

## 多角的チェック観点（AIが判断）

| 観点           | 適用判断              | 仕様参照先                                                  |
| -------------- | --------------------- | ----------------------------------------------------------- |
| セキュリティ   | 該当（authMode 認証） | `aiworkflow-requirements: security-skill-execution.md`      |
| UI/UX          | 該当（HandoffCard）   | `aiworkflow-requirements: ui-ux-agent-execution.md`         |
| アーキテクチャ | 該当（DI 設計）       | `aiworkflow-requirements: arch-electron-services.md`        |
| IPC通信        | 該当（routing IPC）   | `aiworkflow-requirements: interfaces-agent-sdk-executor.md` |

## 成果物

| 成果物       | パス                                         | 内容                                     |
| ------------ | -------------------------------------------- | ---------------------------------------- |
| 要件定義書   | `outputs/phase-1/requirements-definition.md` | gap マトリクス、要件、受入基準を整理する |
| スコープ定義 | `outputs/phase-1/scope-definition.md`        | 対象範囲と除外範囲を明記する             |

## 完了条件

- [ ] 3実行パス（SkillExecutor, AgentExecutor, SkillCreatorService）の runtime routing gap が gap マトリクスとして整理されている
- [ ] Renderer Hook（useSkillExecution, useAgent）の authMode 未参照箇所が特定されている
- [ ] TerminalHandoffCard の表示要件（表示条件、表示内容、表示場所）が定義されている
- [ ] 維持すべき preflight / permission / streaming 契約が不変条件として抜き出されている
- [ ] 各ギャップに対して検証可能な受入基準が定義されている
- [ ] system spec（interfaces-agent-sdk-executor, security-skill-execution 他）との整合が確認されている
- [ ] **本Phase内の全タスクを100%実行完了**

## 次のPhase

- [Phase 2（設計）](./phase-2-design.md) に進む
