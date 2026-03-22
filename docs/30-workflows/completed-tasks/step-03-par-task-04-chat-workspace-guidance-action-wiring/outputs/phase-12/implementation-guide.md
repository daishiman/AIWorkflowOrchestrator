# Phase 12: 実装ガイド

## メタ情報

| 項目     | 内容                                               |
| -------- | -------------------------------------------------- |
| タスクID | TASK-IMP-CHAT-WORKSPACE-GUIDANCE-ACTION-WIRING-001 |
| Phase    | 12                                                 |
| 作成日   | 2026-03-22                                         |

## Part 1: 中学生レベルの概念説明

### なぜこれが必要か

同じアプリなのに、片方の画面では「設定を見る」で直せるのに、もう片方の画面では同じ問題なのに違う文言が出たり、押しても何も起きないボタンが出たりすると、ユーザーはどれを信じればよいか分かりません。

たとえば学校の教室で「忘れ物をした人は職員室へ」という案内が、1年A組では黒板、1年B組ではプリント、1年C組では何も書かれていない状態だと混乱します。案内は1か所のルールから同じ内容で出るべきです。

### 何をするか

今回そろえたことは 3 つです。

1. `NO_PROVIDER` / `NO_MODEL` を `blockedReason` として共通化する
2. 理由に対応する message / CTA / inputHint を shared guidance map に集める
3. ChatView / WorkspaceView の両方がその shared guidance を使うようにする

## Part 2: 技術者向け実装詳細

### 1. TypeScript の型定義

```typescript
export type GuidanceActionType =
  | "open-settings"
  | "open-terminal"
  | "copy-command"
  | "retry-connection";

export type ModelSelectionBlockedReason = "NO_PROVIDER" | "NO_MODEL";

export interface GuidanceActionHandlers {
  openSettings?: () => void;
  openTerminal?: () => void;
  copyCommand?: () => void;
  retryConnection?: () => void;
}
```

### 2. APIシグネチャ

```typescript
deriveModelSelectionBlockedReason(input: {
  selectedProviderId: string | null;
  selectedModelId: string | null;
}): ModelSelectionBlockedReason | null

getModelSelectionGuidance(
  reason: ModelSelectionBlockedReason | null,
): ModelSelectionGuidanceConfig | null

createGuidanceActionDispatcher(
  handlers: GuidanceActionHandlers,
): (actionType: GuidanceActionType) => (() => void) | undefined
```

### 3. 使用例

```typescript
const blockedReason = deriveModelSelectionBlockedReason({
  selectedProviderId,
  selectedModelId,
});

const guidance = getModelSelectionGuidance(blockedReason);
const resolveAction = createGuidanceActionDispatcher({
  openSettings: () => setCurrentView("settings"),
});

const onPrimaryAction = guidance
  ? resolveAction(guidance.primaryAction.type)
  : undefined;
```

```bash
pnpm --filter @repo/desktop exec tsc --noEmit
cd apps/desktop && pnpm exec vitest run src/renderer/guidance/__tests__/modelSelectionGuidance.test.ts
```

### 4. 実装ファイル

| ファイル                                                                            | 役割                                                   |
| ----------------------------------------------------------------------------------- | ------------------------------------------------------ |
| `apps/desktop/src/renderer/guidance/modelSelectionGuidance.ts`                      | blocked reason 推論、guidance map、dispatcher を集約   |
| `apps/desktop/src/renderer/views/ChatView/LLMGuidanceBanner.tsx`                    | ChatView の local 判定を shared guidance lookup に置換 |
| `apps/desktop/src/renderer/views/WorkspaceView/hooks/useWorkspaceChatController.ts` | `blockedReason` を導入し send guard を共通化           |
| `apps/desktop/src/renderer/views/WorkspaceView/WorkspaceChatPanel.tsx`              | shared message / CTA を GuidanceBlock へ流し込む       |
| `apps/desktop/src/renderer/views/WorkspaceView/WorkspaceChatInput.tsx`              | input hint と send 可否を `blockedReason` 基準へ統一   |
| `apps/desktop/src/renderer/views/WorkspaceView/components/GuidanceBlock.tsx`        | secondary CTA props を追加                             |

### 5. エラーハンドリング

- `selectedProviderId === null` の場合は `NO_PROVIDER` として blocked にする
- `selectedModelId === null` の場合は `NO_MODEL` として blocked にする
- handler 未注入の secondary CTA は `undefined` を返し、DOM に出さない
- `sendMessage()` は `blockedReason !== null` の間は no-op にする

### 6. エッジケース

- provider が未設定でも model ID の推論で送信しない
- model が未設定でも fallback 既定値で送信しない
- Chat と Workspace で message / hint / CTA ラベルがずれない
- secondary CTA は将来拡張のため型に残すが、no-op では表示しない

### 7. 設定項目と定数一覧

| 項目                                          | 内容                                     |
| --------------------------------------------- | ---------------------------------------- |
| `MODEL_SELECTION_GUIDANCE`                    | 既存 banner 互換用の定数                 |
| `MODEL_SELECTION_BLOCKED_GUIDANCE_MAP`        | `NO_PROVIDER` / `NO_MODEL` の shared map |
| `SETTINGS_ACTION`                             | primary CTA 定数                         |
| `TERMINAL_ACTION`                             | secondary CTA 定数                       |
| `TASK04_CHAT_WORKSPACE_GUIDANCE_PHASE11_PORT` | capture script の port 上書き環境変数    |

### 8. follow-up

| 項目                         | 状態                       | 追跡先                                                    |
| ---------------------------- | -------------------------- | --------------------------------------------------------- |
| `openTerminal` secondary CTA | handler 未注入             | `UT-IMP-CHAT-WORKSPACE-GUIDANCE-OPEN-TERMINAL-001`        |
| `retryConnection` action     | IPC / UI 未実装            | `UT-IMP-CHAT-WORKSPACE-GUIDANCE-RETRY-CONNECTION-IPC-001` |
| stale state cleanup          | 一部残件あり               | `UT-CLEANUP-CHAT-WORKSPACE-GUIDANCE-STATE-001`            |
| reason priority              | 複数 reason の優先度未定義 | `UT-DESIGN-CHAT-WORKSPACE-GUIDANCE-REASON-PRIORITY-001`   |
