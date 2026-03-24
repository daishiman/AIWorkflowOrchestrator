# Phase 5: 実装

## メタ情報

| 項目     | 値                             |
| -------- | ------------------------------ |
| Phase    | 5                              |
| タスクID | UT-SC-05-APPLY-IMPROVEMENT-UI  |
| 作成日   | 2026-03-23                     |
| 前提     | Phase 4 完了（テスト作成済み） |

## 目的

Phase 4 で作成したテストを Green にするために、IPC ハンドラ・Preload API・Renderer コンポーネントのプロダクションコードを実装する。

## 実行タスク

### Task 1: IPC チャンネル定義追加

**ファイル**: `apps/desktop/src/preload/channels.ts`

1. `IPC_CHANNELS` オブジェクトの `SKILL_CREATOR_IMPROVE_SKILL` の直後に追加:

   ```typescript
   SKILL_CREATOR_APPLY_IMPROVEMENT: "skill-creator:apply-improvement",
   ```

2. `ALLOWED_INVOKE_CHANNELS` 配列の `IPC_CHANNELS.SKILL_CREATOR_IMPROVE_SKILL` の直後に追加:
   ```typescript
   IPC_CHANNELS.SKILL_CREATOR_APPLY_IMPROVEMENT,
   ```

### Task 2: IPC ハンドラ実装

**ファイル**: `apps/desktop/src/main/ipc/creatorHandlers.ts`

1. `registerRuntimeSkillCreatorHandlers()` 関数内に `skill-creator:apply-improvement` ハンドラを追加する
2. ハンドラ実装は Phase 2 設計書の Task 1-2 に記載のコードに従う
3. `import type` に `ApplyImprovementResult` を追加する:

   ```typescript
   import type {
     RuntimeSkillCreatorExecuteResult,
     RuntimeSkillCreatorImproveResponse,
     RuntimeSkillCreatorPlanResponse,
     RuntimeSkillCreatorImproveSuggestion,
     ApplyImprovementResult,
   } from "@repo/shared/types";
   ```

4. `unregisterRuntimeSkillCreatorHandlers()` に追加:
   ```typescript
   ipcMain.removeHandler(IPC_CHANNELS.SKILL_CREATOR_APPLY_IMPROVEMENT);
   ```

### Task 3: Preload API 実装

**ファイル**: `apps/desktop/src/preload/skill-api.ts`

1. import セクションに `RuntimeSkillCreatorImproveSuggestion` と `ApplyImprovementResult` を追加する
2. skillCreator API セクション（`SKILL_CREATOR_IMPROVE_SKILL` の呼び出し後）に以下を追加:

```typescript
applyRuntimeImprovement: (
  skillName: string,
  suggestions: RuntimeSkillCreatorImproveSuggestion[],
): Promise<IpcResult<ApplyImprovementResult>> =>
  safeInvoke(IPC_CHANNELS.SKILL_CREATOR_APPLY_IMPROVEMENT, {
    skillName,
    suggestions,
  }),
```

### Task 4: Renderer コンポーネント実装

#### 4-1. ImprovementProposalItem（molecules）

**ファイル**: `apps/desktop/src/renderer/components/skill/ImprovementProposalItem.tsx`

- `RuntimeSkillCreatorImproveSuggestion` を `@repo/shared/types` から import する
- `diffStyles` をモジュールスコープに export する（P47 準拠）
- before ブロックに `diffStyles.before`、after ブロックに `diffStyles.after` を適用する
- チェックボックスに `aria-label={`${suggestion.section}の改善提案を選択`}` を付与する
- `React.memo` でメモ化する
- `displayName` を設定する

#### 4-2. ImprovementProposalList（organisms）

**ファイル**: `apps/desktop/src/renderer/components/skill/ImprovementProposalList.tsx`

- props: `suggestions`, `selectedIndices`, `onToggle`, `onSelectAll`, `onDeselectAll`, `onApply`, `isApplying`, `selectedCount`
- suggestions が空の場合「改善提案はありません」メッセージを表示する
- ツールバーに「全て選択」「全て解除」「選択した提案を適用（N件）」ボタンを配置する
- `selectedCount === 0` または `isApplying === true` で「適用」ボタンを disabled にする
- `isApplying` 中はボタンテキストを「適用中...」に変更しスピナーを表示する
- `React.memo` でメモ化する

#### 4-3. ImprovementApplyResult（molecules）

**ファイル**: `apps/desktop/src/renderer/components/skill/ImprovementApplyResult.tsx`

- `ApplyImprovementResult` を `@repo/shared/types` から import する
- 適用件数（applied）を緑色の成功表示にする
- スキップ件数（skipped）を黄色の警告表示にする
- `skippedDetails` を section + reason のリストで表示する
- `errors` を赤色のエラーリストで表示する
- 「閉じる」ボタンを配置する
- `React.memo` でメモ化する

### Task 5: テスト実行・Green 確認

1. `cd apps/desktop && pnpm vitest run src/main/ipc/__tests__/creatorHandlers.applyImprovement.test.ts`
2. `cd apps/desktop && pnpm vitest run src/renderer/components/skill/__tests__/ImprovementProposalItem.test.tsx`
3. `cd apps/desktop && pnpm vitest run src/renderer/components/skill/__tests__/ImprovementProposalList.test.tsx`
4. `cd apps/desktop && pnpm vitest run src/renderer/components/skill/__tests__/ImprovementApplyResult.test.tsx`
5. 全テストが PASS することを確認する

## 参照資料

- `docs/30-workflows/w4b-sc-apply-improvement-ui/phase-02-design.md`（設計書）
- `docs/30-workflows/w4b-sc-apply-improvement-ui/phase-04-test-creation.md`（テストケース）
- `apps/desktop/src/main/ipc/creatorHandlers.ts`（既存ハンドラパターン）
- `apps/desktop/src/preload/skill-api.ts`（既存 Preload API パターン）
- `apps/desktop/src/renderer/components/skill/SuggestionList.tsx`（既存 UI パターン）

## 成果物

- `apps/desktop/src/preload/channels.ts`（修正）
- `apps/desktop/src/main/ipc/creatorHandlers.ts`（修正）
- `apps/desktop/src/preload/skill-api.ts`（修正）
- `apps/desktop/src/renderer/components/skill/ImprovementProposalItem.tsx`（新規）
- `apps/desktop/src/renderer/components/skill/ImprovementProposalList.tsx`（新規）
- `apps/desktop/src/renderer/components/skill/ImprovementApplyResult.tsx`（新規）

## 完了条件

- [ ] `SKILL_CREATOR_APPLY_IMPROVEMENT` が `channels.ts` に定義されている
- [ ] `ALLOWED_INVOKE_CHANNELS` にチャンネルが追加されている
- [ ] `creatorHandlers.ts` にハンドラが登録されている
- [ ] ハンドラに P42 準拠3段バリデーションが実装されている
- [ ] `unregisterRuntimeSkillCreatorHandlers` でハンドラが解除される
- [ ] Preload API に `applyRuntimeImprovement` メソッドが追加されている
- [ ] `ImprovementProposalItem` コンポーネントが実装されている
- [ ] `ImprovementProposalList` コンポーネントが実装されている
- [ ] `ImprovementApplyResult` コンポーネントが実装されている
- [ ] Phase 4 のテスト全件が PASS する

## 次の Phase

Phase 6: テスト拡充
