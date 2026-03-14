# Phase 2: 設計 - タスク仕様書

## メタ情報

| 項目       | 内容                                                       |
| ---------- | ---------------------------------------------------------- |
| Phase      | 2                                                          |
| Phase名    | 設計                                                       |
| タスクID   | UT-IMP-SKILL-AGENT-RUNTIME-ROUTING-INTEGRATION-CLOSURE-001 |
| 前提Phase  | Phase 1（要件定義）                                        |
| 後続Phase  | Phase 3（設計レビュー）                                    |
| ステータス | completed                                                  |
| 作成日     | 2026-03-14                                                 |
| 機能名     | runtime-routing-integration-closure                        |

## 目的

Phase 1 で特定した runtime routing gap を解消するための設計を確定する。SkillRuntimeResolver の共通化、TerminalHandoffCard コンポーネント設計、Renderer Hook の authMode 分岐設計を行う。

## 実行タスク

- RuntimeResolver 共通化設計: chat-edit ドメイン専用の RuntimeResolver を Skill / Agent / Creator 実行パスでも利用可能な共通サービスに再設計する
- TerminalHandoffCard コンポーネント設計: handoff 時に表示する UI コンポーネントの Props / 状態 / レイアウトを設計する
- Renderer Hook 分岐設計: useSkillExecution / useAgent に authMode 分岐ロジックを追加する設計を行う
- IPC 拡張設計: Skill / Agent 実行ハンドラに RuntimeResolver を DI する設計を行う
- 状態管理設計: handoff 状態を Zustand Store でどう管理するかを設計する

## 参照資料

| 参照資料               | パス                                                                        | 内容                                               |
| ---------------------- | --------------------------------------------------------------------------- | -------------------------------------------------- |
| Phase 1 要件定義書     | `outputs/phase-1/requirements-definition.md`                                | Phase 1 で整理した gap マトリクスと受入基準        |
| Phase 1 スコープ定義   | `outputs/phase-1/scope-definition.md`                                       | 対象範囲と除外範囲                                 |
| RuntimeResolver 実装   | `apps/desktop/src/main/services/chat-edit/RuntimeResolver.ts`               | 既存 runtime 決定ロジック（再利用のベース）        |
| TerminalHandoffBuilder | `apps/desktop/src/main/services/chat-edit/TerminalHandoffBuilder.ts`        | HandoffGuidance 型定義                             |
| chatEditHandlers       | `apps/desktop/src/main/ipc/chatEditHandlers.ts`                             | RuntimeResolver 統合パターンの参考実装（L130-191） |
| composition root       | `apps/desktop/src/main/ipc/index.ts`                                        | registerAllIpcHandlers の DI 構造                  |
| authModeSlice          | `apps/desktop/src/renderer/store/slices/authModeSlice.ts`                   | 個別セレクタ（useAuthMode 他）の設計               |
| skillHandlers          | `apps/desktop/src/main/ipc/skillHandlers.ts`                                | skill execute IPC の authority 構造                |
| AgentExecutionView     | `apps/desktop/src/renderer/views/AgentExecutionView/AgentExecutionView.tsx` | Agent 実行 UI の現状構造                           |

### システム仕様（aiworkflow-requirements）

> 実装前に以下の正本仕様を確認し、既存設計との整合性を確保する。

| 参照資料                      | パス                                                                                            | 内容                            |
| ----------------------------- | ----------------------------------------------------------------------------------------------- | ------------------------------- |
| workflow-ai-runtime-authmode  | `.claude/skills/aiworkflow-requirements/references/workflow-ai-runtime-authmode-unification.md` | 親 workflow 契約と未完了範囲    |
| legacy-family-register        | `.claude/skills/aiworkflow-requirements/references/legacy-ordinal-family-register.md`           | 旧ファイル名との互換導線        |
| interfaces-agent-sdk-executor | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-executor.md`            | execute 契約と error code 正本  |
| interfaces-agent-sdk-skill    | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md`               | skill lifecycle 契約正本        |
| interfaces-agent-sdk-ui       | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-ui.md`                  | Agent SDK UI / Hook の正本      |
| interfaces-llm                | `.claude/skills/aiworkflow-requirements/references/interfaces-llm.md`                           | RuntimeResolution / Guidance 型 |
| interfaces-auth               | `.claude/skills/aiworkflow-requirements/references/interfaces-auth.md`                          | authMode / auth key 契約        |
| api-ipc-agent-core            | `.claude/skills/aiworkflow-requirements/references/api-ipc-agent-core.md`                       | chat-edit runtime IPC 契約      |
| api-ipc-agent                 | `.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md`                            | Skill / Agent IPC 契約          |
| api-ipc-system                | `.claude/skills/aiworkflow-requirements/references/api-ipc-system.md`                           | system IPC / authMode 契約      |
| security-electron-ipc-core    | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc-core.md`               | workspacePath 境界検証          |
| security-electron-ipc         | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`                    | IPC sender 検証と境界防御       |
| ui-ux-agent-execution         | `.claude/skills/aiworkflow-requirements/references/ui-ux-agent-execution.md`                    | Agent surface の UI 契約        |
| ui-ux-feature-components      | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md`                 | runtime 関連 UI の横断仕様      |
| ui-ux-settings                | `.claude/skills/aiworkflow-requirements/references/ui-ux-settings.md`                           | authMode 設定導線               |
| arch-electron-services        | `.claude/skills/aiworkflow-requirements/references/arch-electron-services.md`                   | Main service DI の正本          |
| arch-state-management         | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`                    | Zustand Store 設計の正本        |
| llm-workspace-chat-edit       | `.claude/skills/aiworkflow-requirements/references/llm-workspace-chat-edit.md`                  | RuntimeResolver 移設元契約      |
| ipc-contract-checklist        | `.claude/skills/aiworkflow-requirements/references/ipc-contract-checklist.md`                   | IPC 契約監査チェック項目        |
| follow-up unassigned          | `docs/30-workflows/unassigned-task/task-imp-ai-runtime-test-separation-criteria-001.md`         | 関連未タスクの境界条件          |

## 実行手順

### ステップ1: RuntimeResolver 共通化設計

既存の `RuntimeResolver`（chat-edit ドメイン専用）を共通サービスとして再設計する。

設計方針:

- `apps/desktop/src/main/services/runtime/RuntimeResolver.ts` に移動（chat-edit 依存を解除）
- `IAuthKeyService` / `IAuthModeService` の DI は維持
- `RuntimeResolution` 型（`integrated` / `handoff`）は変更しない
- SkillExecutor / AgentExecutor / SkillCreatorService のハンドラで共有

```typescript
// 設計イメージ（実装は Phase 5）
// apps/desktop/src/main/services/runtime/RuntimeResolver.ts
export class RuntimeResolver {
  constructor(
    private readonly authKeyService: IAuthKeyService,
    private readonly authModeService: IAuthModeService,
  ) {}
  async resolve(): Promise<RuntimeResolution>;
}

export type RuntimeResolution =
  | { type: "integrated"; adapter: LLMAdapter }
  | { type: "handoff"; reason: string };
```

### ステップ2: TerminalHandoffCard コンポーネント設計

Renderer Process で handoff 結果を表示するコンポーネントを設計する。

設計方針:

- Atomic Design: organisms レベルに配置
- Apple HIG 準拠のビジュアル（角丸 8-12px、繊細なシャドウ）
- `HandoffGuidance` 型のデータを表示

```typescript
// Props 設計
interface TerminalHandoffCardProps {
  guidance: HandoffGuidance;
  onCopyCommand: () => void;
  onDismiss: () => void;
}

interface HandoffGuidance {
  terminalCommand: string;
  contextSummary: string;
  reason: string;
}
```

表示要素:

- 理由テキスト（なぜ terminal handoff が必要か）
- CLI コマンド（コピー可能、monospace フォント）
- コンテキストサマリー（実行に必要な背景情報）
- コピーボタン / 閉じるボタン

### ステップ3: Renderer Hook 分岐設計

useSkillExecution / useAgent に authMode 分岐を追加する設計を行う。

設計方針:

- P31 対策: 個別セレクタ `useAuthMode()` を使用し、合成 Hook は使わない
- P48 対策: 派生セレクタが必要な場合は `useShallow` を適用
- handoff 状態は新規 state として管理

```typescript
// useSkillExecution への分岐追加（設計イメージ）
const authMode = useAuthMode();

const executeSkill = useCallback(async () => {
  // authMode === "subscription" の場合、IPC で handoff guidance を要求
  // authMode === "api-key" の場合、既存の execute フローを実行
}, [authMode]);
```

### ステップ4: IPC 拡張設計

Skill / Agent 実行ハンドラに RuntimeResolver を DI する設計を行う。

設計方針:

- composition root (`registerAllIpcHandlers`) で RuntimeResolver を1回だけ生成し、各ハンドラに注入
- chatEditHandlers の実装パターン（L834-843）を参考にする
- P5 対策: リスナー二重登録を防ぐ

```typescript
// composition root の DI 設計（既存パターンを拡張）
const runtimeResolver = new RuntimeResolver(authKeyService, authModeService);

// skillHandlers に注入
registerSkillHandlers(mainWindow, skillService, runtimeResolver);

// agentHandlers に注入
registerAgentHandlers(mainWindow, agentService, runtimeResolver);
```

### ステップ5: 状態管理設計

Handoff 状態の Zustand Store 管理を設計する。

設計方針:

- 既存の `agentSlice` に `handoffGuidance: HandoffGuidance | null` を追加
- 新規スライスは作成しない（既存スライスの拡張で対応）
- P31 準拠: 個別セレクタ `useHandoffGuidance()` を追加

### ステップ6: system spec との整合を確認する

aiworkflow-requirements の正本と照合し、設計が既存契約を破壊しないことを確認する。

## 統合テスト連携

設計で定義したインターフェース間の接続点を明確にし、統合テストの対象を特定する:

- RuntimeResolver → SkillExecutor / AgentExecutor / SkillCreatorService の DI 接続
- IPC ハンドラ → Preload → Renderer Hook の handoff 応答経路
- TerminalHandoffCard → HandoffGuidance データバインディング

## 多角的チェック観点（AIが判断）

| 観点           | 適用判断                          | 仕様参照先                                                  |
| -------------- | --------------------------------- | ----------------------------------------------------------- |
| セキュリティ   | 該当（authMode / API Key 取扱い） | `aiworkflow-requirements: security-skill-execution.md`      |
| UI/UX          | 該当（HandoffCard デザイン）      | `aiworkflow-requirements: ui-ux-agent-execution.md`         |
| アーキテクチャ | 該当（DI 拡張、共通サービス化）   | `aiworkflow-requirements: arch-electron-services.md`        |
| IPC通信        | 該当（ハンドラ DI 拡張）          | `aiworkflow-requirements: interfaces-agent-sdk-executor.md` |
| 状態管理       | 該当（handoff 状態の Store 管理） | `aiworkflow-requirements: arch-state-management.md`         |

**Electronデスクトップアプリ観点**:

| 層                         | 適用判断                        | 仕様参照先                                                  |
| -------------------------- | ------------------------------- | ----------------------------------------------------------- |
| フロントエンド（Renderer） | 該当（HandoffCard / Hook 設計） | `aiworkflow-requirements: ui-ux-agent-execution.md`         |
| バックエンド（Main）       | 該当（RuntimeResolver 共通化）  | `aiworkflow-requirements: arch-electron-services.md`        |
| IPC通信                    | 該当（ハンドラ DI 拡張）        | `aiworkflow-requirements: interfaces-agent-sdk-executor.md` |
| Preload/セキュリティ       | 該当（handoff 応答の公開）      | `aiworkflow-requirements: security-skill-execution.md`      |

## 成果物

| 成果物         | パス                                   | 内容                                 |
| -------------- | -------------------------------------- | ------------------------------------ |
| 設計サマリー   | `outputs/phase-2/design-summary.md`    | 全設計の概要と判断根拠               |
| 契約マトリクス | `outputs/phase-2/contract-matrix.md`   | 変更前後のインターフェース契約対照表 |
| UI/UX 実現仕様 | `outputs/phase-2/ui-ux-realization.md` | TerminalHandoffCard の UI 仕様       |

## 完了条件

- [ ] RuntimeResolver の共通化設計が確定している（配置先、DI 方式、型定義）
- [ ] TerminalHandoffCard の Props / 表示要素 / レイアウトが確定している
- [ ] useSkillExecution / useAgent への authMode 分岐追加設計が確定している（P31/P48 対策含む）
- [ ] composition root での RuntimeResolver DI 設計が確定している（P5 対策含む）
- [ ] Handoff 状態の Store 管理設計が確定している（既存スライス拡張 vs 新規スライス）
- [ ] 既存 preflight / permission / streaming 契約を破壊しないことが設計レベルで確認されている
- [ ] system spec との整合が確認されている
- [ ] **本Phase内の全タスクを100%実行完了**

## 次のPhase

- [Phase 3（設計レビュー）](./phase-3-design-review.md) に進む
