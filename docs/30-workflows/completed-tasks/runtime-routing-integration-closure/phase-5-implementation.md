# Phase 5: 実装 - タスク仕様書

## メタ情報

| 項目       | 内容                                                       |
| ---------- | ---------------------------------------------------------- |
| Phase      | 5                                                          |
| Phase名    | 実装                                                       |
| タスクID   | UT-IMP-SKILL-AGENT-RUNTIME-ROUTING-INTEGRATION-CLOSURE-001 |
| 前提Phase  | Phase 4（テスト作成）                                      |
| 後続Phase  | Phase 6（テスト拡充）                                      |
| ステータス | completed                                                  |
| 作成日     | 2026-03-14                                                 |
| 機能名     | runtime-routing-integration-closure                        |

## 目的

Phase 4 のテストを PASS させる最小限の実装を行う（TDD: Green フェーズ）。RuntimeResolver の共通化、IPC ハンドラへの DI 注入、TerminalHandoffCard コンポーネント実装、Renderer Hook の authMode 分岐追加、Store の handoffGuidance 状態拡張を完成させる。

## 実行タスク

- RuntimeResolver 共通化実装: `services/chat-edit/` から `services/runtime/` に移動し、chat-edit 依存を解除する
- IPC ハンドラ拡張: skillHandlers / agentHandlers に RuntimeResolver を DI する
- composition root 更新: `registerAllIpcHandlers` で RuntimeResolver を1回生成し、全ハンドラに注入する
- TerminalHandoffCard 実装: organisms レベル、Apple HIG 準拠、HandoffGuidance を表示する UI コンポーネント
- Renderer Hook 拡張: useSkillExecution / useAgent に authMode 分岐ロジックを追加する
- Store 拡張: agentSlice に `handoffGuidance` 状態と個別セレクタ `useHandoffGuidance()` を追加する

## 参照資料

| 参照資料                 | パス                                                                        | 内容                                              |
| ------------------------ | --------------------------------------------------------------------------- | ------------------------------------------------- |
| Phase 4 テスト設計書     | `outputs/phase-4/test-design.md`                                            | テストケース一覧と統合テストシナリオ              |
| Phase 3 設計レビュー結果 | `outputs/phase-3/design-review-result.md`                                   | レビュー判定と指摘対応内容                        |
| Phase 2 設計サマリー     | `outputs/phase-2/design-summary.md`                                         | 全設計の概要と判断根拠                            |
| Phase 2 契約マトリクス   | `outputs/phase-2/contract-matrix.md`                                        | 変更前後のインターフェース契約対照表              |
| Phase 2 UI/UX 実現仕様   | `outputs/phase-2/ui-ux-realization.md`                                      | TerminalHandoffCard の UI 仕様                    |
| RuntimeResolver 実装     | `apps/desktop/src/main/services/chat-edit/RuntimeResolver.ts`               | 移動元の実装（移動後は削除）                      |
| TerminalHandoffBuilder   | `apps/desktop/src/main/services/chat-edit/TerminalHandoffBuilder.ts`        | HandoffGuidance 型定義（参照維持）                |
| chatEditHandlers         | `apps/desktop/src/main/ipc/chatEditHandlers.ts`                             | RuntimeResolver DI の参考実装パターン（L130-191） |
| composition root         | `apps/desktop/src/main/ipc/index.ts`                                        | registerAllIpcHandlers の DI 構造（L819-844）     |
| skillHandlers            | `apps/desktop/src/main/ipc/skillHandlers.ts`                                | skill execute IPC ハンドラ（修正対象）            |
| agentHandlers            | `apps/desktop/src/main/ipc/agentHandlers.ts`                                | agent execute IPC ハンドラ（修正対象）            |
| agentSlice               | `apps/desktop/src/renderer/store/slices/agentSlice.ts`                      | handoffGuidance 状態の追加先                      |
| useSkillExecution        | `apps/desktop/src/renderer/hooks/useSkillExecution.ts`                      | authMode 分岐追加の修正対象                       |
| useAgent                 | `apps/desktop/src/renderer/hooks/useAgent.ts`                               | authMode 分岐追加の修正対象                       |
| AgentExecutionView       | `apps/desktop/src/renderer/views/AgentExecutionView/AgentExecutionView.tsx` | TerminalHandoffCard の組み込み先（参考）          |
| authModeSlice            | `apps/desktop/src/renderer/store/slices/authModeSlice.ts`                   | `useAuthMode()` 個別セレクタの参照元              |

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
| security-skill-execution      | `.claude/skills/aiworkflow-requirements/references/security-skill-execution.md`                 | permission と trust 境界の正本  |
| arch-electron-services        | `.claude/skills/aiworkflow-requirements/references/arch-electron-services.md`                   | Main service DI の正本          |
| arch-state-management         | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`                    | Zustand Store 設計の正本        |
| ui-ux-agent-execution         | `.claude/skills/aiworkflow-requirements/references/ui-ux-agent-execution.md`                    | Agent surface の UI 契約        |
| ui-ux-feature-components      | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md`                 | runtime 関連 UI の横断仕様      |
| ui-ux-settings                | `.claude/skills/aiworkflow-requirements/references/ui-ux-settings.md`                           | authMode 設定導線               |
| llm-workspace-chat-edit       | `.claude/skills/aiworkflow-requirements/references/llm-workspace-chat-edit.md`                  | RuntimeResolver 移設元契約      |
| ipc-contract-checklist        | `.claude/skills/aiworkflow-requirements/references/ipc-contract-checklist.md`                   | IPC 契約監査チェック項目        |
| follow-up unassigned          | `docs/30-workflows/unassigned-task/task-imp-ai-runtime-test-separation-criteria-001.md`         | 関連未タスクの境界条件          |

## 実行手順

### ステップ1: RuntimeResolver を共通サービスに移動する

**実装箇所**: `apps/desktop/src/main/services/runtime/RuntimeResolver.ts`（新規作成）

移動手順:

1. `apps/desktop/src/main/services/runtime/` ディレクトリを作成する
2. `apps/desktop/src/main/services/chat-edit/RuntimeResolver.ts` の内容をベースに、`services/runtime/RuntimeResolver.ts` を作成する
3. chat-edit 固有の依存（`chatEditHandlers` への直接参照）を除去し、汎用化する
4. `chatEditHandlers.ts` の import パスを新しい場所に更新する

実装仕様:

```typescript
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
  | { type: "handoff"; reason: HandoffReason };

type HandoffReason = "subscription_mode" | "api_key_missing";
```

Pitfall 注意:

- P5: 移動後に古いパスへの import が残っていないことを `grep -rn "chat-edit/RuntimeResolver"` で確認する

### ステップ2: agentSlice に handoffGuidance 状態を追加する

**実装箇所**: `apps/desktop/src/renderer/store/slices/agentSlice.ts`

追加仕様:

```typescript
// 状態の型拡張
interface AgentState {
  // ... 既存フィールド
  handoffGuidance: HandoffGuidance | null;
}

// アクション追加
interface AgentActions {
  // ... 既存アクション
  setHandoffGuidance: (guidance: HandoffGuidance) => void;
  clearHandoffGuidance: () => void;
}

// 個別セレクタ追加（P31対策: 合成 Hook を経由しない）
export const useHandoffGuidance = () =>
  useAppStore((state) => state.handoffGuidance);
```

Pitfall 注意:

- **P31対策**: `useHandoffGuidance()` は個別セレクタとして追加し、合成 Hook を経由しない
- **P48対策**: `handoffGuidance` はオブジェクト参照のため、`useShallow` 適用が必要かどうかを確認する（フィールド数が多い場合は適用する）

### ステップ3: IPC ハンドラに RuntimeResolver を DI する

**実装箇所**:

- `apps/desktop/src/main/ipc/skillHandlers.ts`
- `apps/desktop/src/main/ipc/agentHandlers.ts`
- `apps/desktop/src/main/ipc/index.ts`

skillHandlers.ts の修正仕様:

```typescript
// 関数シグネチャの修正
export function registerSkillHandlers(
  mainWindow: BrowserWindow,
  skillService: ISkillService,
  runtimeResolver: RuntimeResolver,
): void;

// ハンドラ内の runtime 分岐
ipcMain.handle(IPC_CHANNELS.SKILL_EXECUTE, async (event, skillName: string) => {
  // P42: 3段バリデーション（型 → 空文字列 → トリム空文字列）
  if (typeof skillName !== "string" || skillName.trim() === "") {
    return {
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "skillName must be a non-empty string",
      },
    };
  }

  const resolution = await runtimeResolver.resolve();
  if (resolution.type === "handoff") {
    const guidance = await terminalHandoffBuilder.build(resolution.reason);
    return { success: false, type: "handoff", guidance };
  }

  // 既存の execute フロー（変更なし）
  return skillService.executeSkill(skillName);
});
```

composition root の修正仕様（`apps/desktop/src/main/ipc/index.ts`）:

```typescript
// RuntimeResolver を1回生成して全ハンドラに注入（P5対策）
const runtimeResolver = new RuntimeResolver(authKeyService, authModeService);

registerSkillHandlers(mainWindow, skillService, runtimeResolver);
registerAgentHandlers(mainWindow, agentService, runtimeResolver);
// chatEditHandlers はすでに RuntimeResolver を使用済み（変更なし）
```

Pitfall 注意:

- **P5対策**: `runtimeResolver` インスタンスは composition root で1回だけ生成する
- **P44/P45対策**: ハンドラ引数の型と Preload 側の呼び出し形式が一致していることを確認する（引数名のセマンティクスが実際の値と一致すること）
- **P42対策**: 全文字列引数に3段バリデーション（型チェック → 空文字列 → トリム空文字列）を適用する

### ステップ4: TerminalHandoffCard コンポーネントを実装する

**実装箇所**: `apps/desktop/src/renderer/components/organisms/TerminalHandoffCard/`

ディレクトリ構成:

```
TerminalHandoffCard/
  index.tsx          # コンポーネント実装
  index.css          # スタイル（Tailwind CSS）
  __tests__/
    TerminalHandoffCard.test.tsx  # Phase 4 で作成済み
```

実装仕様:

```typescript
// Props 型定義（Phase 2 設計準拠）
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

Apple HIG 準拠の実装要件:

- 角丸: `rounded-lg`（8-12px）
- シャドウ: `shadow-sm`（繊細なシャドウ）
- カラー: ライトモードでは `bg-white` + `border border-[var(--border)]`
- フォント: CLI コマンド表示部分は `font-mono`（monospace）
- スペーシング: 8px グリッドに従った `p-4`、`gap-3`
- コピーボタン: アイコン + テキストで明確なフィードバック
- アクセシビリティ: コピーボタンに `aria-label="コマンドをコピー"`、閉じるボタンに `aria-label="閉じる"` を付与（WCAG 2.1 AA 準拠）

コントラスト要件（WCAG 2.1 AA）:

- 理由テキスト: コントラスト比 4.5:1 以上
- CLI コマンド: コントラスト比 4.5:1 以上
- ボタン: コントラスト比 3:1 以上（大テキスト / UI 部品）

### ステップ5: Renderer Hook に authMode 分岐を追加する

**実装箇所**:

- `apps/desktop/src/renderer/hooks/useSkillExecution.ts`
- `apps/desktop/src/renderer/hooks/useAgent.ts`

useSkillExecution.ts の修正仕様:

```typescript
export function useSkillExecution() {
  // P31対策: 個別セレクタを使用（合成 Hook 不使用）
  const authMode = useAuthMode();
  const setHandoffGuidance = useSetHandoffGuidance();
  const clearHandoffGuidance = useClearHandoffGuidance();

  const executeSkill = useCallback(
    async (skillName: string) => {
      if (authMode === "subscription") {
        // handoff フロー: IPC で handoff guidance を要求
        const result =
          await window.electronAPI.skill.executeWithHandoff(skillName);
        if (result.type === "handoff" && result.guidance) {
          setHandoffGuidance(result.guidance);
        }
        return result;
      }

      // api-key フロー: 既存の execute フロー（変更なし）
      clearHandoffGuidance();
      return window.electronAPI.skill.execute(skillName);
    },
    [authMode, setHandoffGuidance, clearHandoffGuidance],
  );

  return { executeSkill };
}
```

Pitfall 注意:

- **P31対策**: `useAuthMode()` 個別セレクタを使用し、`useAuthModeStore()` の合成 Hook を使わない
- **P48対策**: `useSetHandoffGuidance()` / `useClearHandoffGuidance()` は関数を返すセレクタのため、Zustand アクション参照は安定しており `useShallow` 不要
- authMode を `useEffect` の依存配列に含める場合は個別セレクタの参照が安定していることを確認する

### ステップ6: 各実装後にテストを実行し Red → Green を確認する

実装の順序と確認:

1. RuntimeResolver 移動 → `pnpm --filter @repo/desktop exec vitest run src/main/services/runtime/`
2. agentSlice 拡張 → `pnpm --filter @repo/desktop exec vitest run src/renderer/store/`
3. skillHandlers / agentHandlers 修正 → `pnpm --filter @repo/desktop exec vitest run src/main/ipc/`
4. TerminalHandoffCard 実装 → `pnpm --filter @repo/desktop exec vitest run src/renderer/components/organisms/TerminalHandoffCard/`
5. useSkillExecution / useAgent 修正 → `pnpm --filter @repo/desktop exec vitest run src/renderer/hooks/`
6. 全テスト実行 → `pnpm --filter @repo/desktop test`

注意: **P40対策**: テスト実行は `apps/desktop/` ディレクトリから実行するか、`pnpm --filter @repo/desktop exec vitest run` を使用する。プロジェクトルートからのパス指定では happy-dom 設定が適用されない。

### ステップ7: 実装サマリーを作成する

`outputs/phase-5/implementation-summary.md` に以下を記録する:

- 変更したファイルの一覧と変更概要
- 各 Pitfall 対策の適用結果
- テスト Red → Green の確認記録
- 既存テストへの影響（変更によって壊れたテストの修正内容）

## 統合テスト連携

- 各実装完了後にテスト実行で Red → Green を確認する
- IPC → Preload → Renderer の接続を以下の手順で検証する:
  1. Main Process: `RuntimeResolver.resolve()` が正しい結果を返すことを確認する
  2. IPC ハンドラ: handoff 時に `HandoffGuidance` が返されることを確認する
  3. Preload: `window.electronAPI` で handoff guidance が受け取れることを確認する
  4. Renderer Hook: `useSkillExecution()` が `handoffGuidance` を Store に設定することを確認する

## 多角的チェック観点（AIが判断）

| 観点           | 適用判断                                              | 仕様参照先                                                  |
| -------------- | ----------------------------------------------------- | ----------------------------------------------------------- |
| セキュリティ   | 該当（API Key を TerminalHandoffCard に漏洩させない） | `aiworkflow-requirements: security-skill-execution.md`      |
| UI/UX          | 該当（Apple HIG 準拠、WCAG 2.1 AA）                   | `aiworkflow-requirements: ui-ux-agent-execution.md`         |
| アーキテクチャ | 該当（DI 拡張、composition root 変更）                | `aiworkflow-requirements: arch-electron-services.md`        |
| IPC通信        | 該当（ハンドラ引数形式、P44/P45 対策）                | `aiworkflow-requirements: interfaces-agent-sdk-executor.md` |
| 状態管理       | 該当（P31/P48 対策、handoffGuidance 管理）            | `aiworkflow-requirements: arch-state-management.md`         |

**Electronデスクトップアプリ観点**:

| 層                         | 適用判断                                      | 仕様参照先                                                  |
| -------------------------- | --------------------------------------------- | ----------------------------------------------------------- |
| フロントエンド（Renderer） | 該当（TerminalHandoffCard / Hook 実装）       | `aiworkflow-requirements: ui-ux-agent-execution.md`         |
| バックエンド（Main）       | 該当（RuntimeResolver 移動、ハンドラ DI）     | `aiworkflow-requirements: arch-electron-services.md`        |
| IPC通信                    | 該当（ハンドラ修正、handoff 応答）            | `aiworkflow-requirements: interfaces-agent-sdk-executor.md` |
| Preload/セキュリティ       | 該当（contextIsolation 維持、API Key 非漏洩） | `aiworkflow-requirements: security-skill-execution.md`      |

## 成果物

| 成果物              | パス                                                                           | 内容                                             |
| ------------------- | ------------------------------------------------------------------------------ | ------------------------------------------------ |
| 実装サマリー        | `outputs/phase-5/implementation-summary.md`                                    | 変更ファイル一覧、Pitfall 対策適用結果、確認記録 |
| RuntimeResolver     | `apps/desktop/src/main/services/runtime/RuntimeResolver.ts`                    | 共通化した RuntimeResolver 実装                  |
| skillHandlers       | `apps/desktop/src/main/ipc/skillHandlers.ts`                                   | RuntimeResolver DI を追加した skill ハンドラ     |
| agentHandlers       | `apps/desktop/src/main/ipc/agentHandlers.ts`                                   | RuntimeResolver DI を追加した agent ハンドラ     |
| composition root    | `apps/desktop/src/main/ipc/index.ts`                                           | RuntimeResolver 1回生成・全ハンドラ注入          |
| TerminalHandoffCard | `apps/desktop/src/renderer/components/organisms/TerminalHandoffCard/index.tsx` | Apple HIG 準拠の handoff UI コンポーネント       |
| useSkillExecution   | `apps/desktop/src/renderer/hooks/useSkillExecution.ts`                         | authMode 分岐追加済み Hook                       |
| useAgent            | `apps/desktop/src/renderer/hooks/useAgent.ts`                                  | authMode 分岐追加済み Hook                       |
| agentSlice          | `apps/desktop/src/renderer/store/slices/agentSlice.ts`                         | handoffGuidance 状態と個別セレクタを追加         |

## 完了条件

- [ ] RuntimeResolver が `services/runtime/` に移動し、chat-edit 依存が解除されている
- [ ] chatEditHandlers.ts の import パスが新しい場所に更新されている
- [ ] `grep -rn "chat-edit/RuntimeResolver"` で古い import パスが0件であることを確認している
- [ ] agentSlice に `handoffGuidance` 状態と `setHandoffGuidance` / `clearHandoffGuidance` アクションが追加されている
- [ ] `useHandoffGuidance()` 個別セレクタが agentSlice に追加されている（P31対策）
- [ ] skillHandlers / agentHandlers に RuntimeResolver DI が追加されている
- [ ] composition root で RuntimeResolver が1回だけ生成されている（P5対策）
- [ ] P42 準拠の3段バリデーション（型 → 空文字列 → トリム空文字列）が全 IPC ハンドラに適用されている
- [ ] P44/P45 準拠でハンドラ引数形式と Preload 呼び出し形式が一致している
- [ ] TerminalHandoffCard が organisms レベルに実装されている
- [ ] TerminalHandoffCard が Apple HIG 準拠のビジュアル（角丸・シャドウ・カラー）で実装されている
- [ ] WCAG 2.1 AA のコントラスト比を満たしている（テキスト 4.5:1 以上、UI 部品 3:1 以上）
- [ ] ARIA ラベルが付与され、役割と操作対象が識別できる
- [ ] useSkillExecution / useAgent に authMode 分岐が追加されている
- [ ] P31 対策として `useAuthMode()` 個別セレクタを使用している
- [ ] Phase 4 で作成した全テストが Green になっている
- [ ] 既存テストが全て PASS している（新規実装によるリグレッションがない）
- [ ] `outputs/phase-5/implementation-summary.md` に変更内容が記録されている
- [ ] **本Phase内の全タスクを100%実行完了**

## 次のPhase

- [Phase 6（テスト拡充）](./phase-6-test-expansion.md) に進む
