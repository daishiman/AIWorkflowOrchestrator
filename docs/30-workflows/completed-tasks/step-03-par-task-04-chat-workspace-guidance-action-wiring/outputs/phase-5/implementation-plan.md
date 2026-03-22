# Phase 5: 実装計画 - Implementation Plan

## メタ情報

| 項目     | 内容                                               |
| -------- | -------------------------------------------------- |
| タスクID | TASK-IMP-CHAT-WORKSPACE-GUIDANCE-ACTION-WIRING-001 |
| Phase    | 5                                                  |
| 作成日   | 2026-03-22                                         |

## 1. 実装順序

テストが先に通る順序で実装する（TDD 原則）。

| 順序 | 変更ファイル                           | 変更内容                                                       | 依存    |
| ---- | -------------------------------------- | -------------------------------------------------------------- | ------- |
| 1    | `guidance/blockedGuidanceConfig.ts`    | BlockedReason 型、GuidanceConfig 型、BLOCKED_GUIDANCE_MAP 定数 | なし    |
| 2    | `guidance/useBlockedGuidance.ts`       | useBlockedGuidance Hook（useMemo ラッパー）                    | 順序1   |
| 3    | `guidance/guidanceActionDispatcher.ts` | createGuidanceActionDispatcher 関数                            | 順序1   |
| 4    | `GuidanceBlock.tsx`                    | secondaryActionLabel / onSecondaryAction props 追加            | なし    |
| 5    | `WorkspaceChatPanel.tsx`               | local 判定除去、useBlockedGuidance + dispatcher 消費           | 順序1-4 |
| 6    | `ChatView/index.tsx`                   | LLMGuidanceBanner を GuidanceBlock + useBlockedGuidance に置換 | 順序1-4 |

## 2. 変更詳細

### 順序 1: blockedGuidanceConfig.ts（新規）

- `BlockedReason` union type（6 members）
- `GuidanceActionType` union type（4 members）
- `GuidanceAction` / `GuidanceConfig` interface
- `BLOCKED_GUIDANCE_MAP` const（Record<BlockedReason, GuidanceConfig>）

### 順序 2: useBlockedGuidance.ts（新規）

- `useBlockedGuidance(reason: BlockedReason | null): GuidanceConfig | null`
- useMemo で参照安定化（P31 対策）
- 3行以下の実装

### 順序 3: guidanceActionDispatcher.ts（新規）

- `GuidanceActionHandlers` interface
- `createGuidanceActionDispatcher(handlers): (type) => void`
- exhaustive switch（全 case カバー）

### 順序 4: GuidanceBlock.tsx（修正）

- `secondaryActionLabel?: string` props 追加
- `onSecondaryAction?: () => void` props 追加
- secondary ボタンの条件付き描画（AND ガード維持）

### 順序 5: WorkspaceChatPanel.tsx（修正）

- `const isModelBlocked = controller.selectedModelId === null;` を削除
- `useBlockedGuidance(blockedReason)` に置換
- GuidanceBlock に guidance config を渡す

### 順序 6: ChatView/index.tsx（修正）

- LLMGuidanceBanner の呼び出しを GuidanceBlock + useBlockedGuidance に置換
- 同一の BLOCKED_GUIDANCE_MAP を使用し、メッセージ・CTA を統一

## 3. 禁止事項チェックリスト

- [ ] silent fallback 禁止（P62）: DEFAULT_CONFIG への暗黙 fallback を書かない
- [ ] local runtime 判定禁止（AC-2）: surface 内で selectedModelId === null を直接判定しない
- [ ] no-op handler 禁止（AC-4）: onAction を空関数にしない
- [ ] 合成 Hook 依存禁止（P31）: useEffect 依存配列に合成 Hook 戻り値を含めない
- [ ] useShallow 必須（P48）: .filter()/.map() で配列を返すセレクタには useShallow 適用

## 4. rollback risk

| リスク                                  | 影響 | 軽減策                                   |
| --------------------------------------- | ---- | ---------------------------------------- |
| blockedReason の supply source が未確定 | 中   | 一旦 selectedModelId/ProviderId から導出 |
| openTerminal handler が placeholder     | 低   | Task06 完了まで console.warn で代替      |
| LLMGuidanceBanner 削除で既存テスト破壊  | 中   | GuidanceBanner のテストを先に更新        |
