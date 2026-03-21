# Phase 5: 実装

## メタ情報

| 項目          | 内容                                                                                                                 |
| ------------- | -------------------------------------------------------------------------------------------------------------------- |
| Phase番号     | 5                                                                                                                    |
| 機能名        | WorkspaceChatPanelへのインラインモデルセレクタ配置 (TASK-UI-WORKSPACE-MODEL-SELECTOR-INTEGRATION)                    |
| 作成日        | 2026-03-21                                                                                                           |
| 担当          | -                                                                                                                    |
| ステータス    | 未着手                                                                                                               |
| 前Phase成果物 | `docs/30-workflows/chat-inline-model-selector/tasks/03-TASK-UI-WORKSPACE-MODEL-SELECTOR-INTEGRATION/phase-4-test.md` |

## 目的

Phase 4 で作成したテスト（Red状態）をGreen（全PASS）にするための実装を行う。WorkspaceChatPanel.tsxへのInlineModelSelector配置、GuidanceBlock表示条件の調整、useWorkspaceChatControllerのblocked判定連動を実装する。

## 実行タスク

### タスク0: 実装前の現状確認（P50対策）

```bash
# WorkspaceChatPanel の現在の実装を確認
cat apps/desktop/src/renderer/views/WorkspaceView/WorkspaceChatPanel.tsx

# InlineModelSelectorの実装確認（Task 01成果物）
find apps/desktop/src -name "InlineModelSelector.tsx" -not -path "*__tests__*"
# 存在する場合はインポートパスを確認
grep -rn "InlineModelSelector" apps/desktop/src/renderer/ --include="*.tsx" --include="*.ts"

# GuidanceBlock の現在の実装確認
grep -rn "GuidanceBlock\|guidance-block" apps/desktop/src/renderer/ --include="*.tsx" --include="*.ts"

# useWorkspaceChatController の現在の実装確認
grep -n "blocked\|isStreaming\|disabled" apps/desktop/src/renderer/views/WorkspaceView/useWorkspaceChatController.ts 2>/dev/null || \
  find apps/desktop/src -name "useWorkspaceChatController*" -not -path "*__tests__*"
```

### タスク1: WorkspaceChatPanel.tsx へのInlineModelSelector配置

**対象ファイル**: `apps/desktop/src/renderer/views/WorkspaceView/WorkspaceChatPanel.tsx`

**修正内容**: パネル上部にInlineModelSelector(compact=true)をimport・配置する。

```typescript
// 追加するimport
import { InlineModelSelector } from "@/renderer/components/InlineModelSelector";

// JSX内のパネル上部に配置
// 例:
// <div className="workspace-chat-panel">
//   <div className="workspace-chat-panel__header">
//     <InlineModelSelector
//       compact={true}
//       disabled={isStreaming}
//       data-testid="inline-model-selector"
//       data-compact="true"
//     />
//   </div>
//   ...残りのパネルコンテンツ...
// </div>
```

**実装上の注意**:

- `compact={true}` を必ず指定する（WorkspaceChatPanelのレイアウト上、コンパクト表示が必要）
- `disabled` はストリーミング中の `isStreaming` stateに連動させる
- `data-testid="inline-model-selector"` を付与してテストI-1を通過させる
- `data-compact="true"` を付与してテストI-1のattribute確認を通過させる

### タスク2: GuidanceBlock表示条件の調整

**対象ファイル**: `apps/desktop/src/renderer/views/WorkspaceView/WorkspaceChatPanel.tsx`

**修正内容**: モデル選択状態に基づいてGuidanceBlock(variant="blocked")の表示を制御する。

```typescript
// 表示制御の例
// モデルが未選択の場合のみGuidanceBlock(variant="blocked")を表示
// API key未設定時のGuidanceBlockは別条件で維持する

// blocked判定（useWorkspaceChatControllerから取得、または直接計算）
const isModelSelected = selectedProviderId !== null && selectedModelId !== null;

// JSX内
{!isModelSelected && (
  <GuidanceBlock
    variant="blocked"
    data-testid="guidance-block-blocked"
  />
)}
```

**注意**: API key未設定時のGuidanceBlockとモデル未選択時のGuidanceBlockは独立した表示条件であること。モデル選択後はvariant="blocked"のGuidanceBlockのみ非表示にする。

### タスク3: チャット入力の有効化条件調整

**対象ファイル**: `apps/desktop/src/renderer/views/WorkspaceView/WorkspaceChatPanel.tsx`

**修正内容**: モデル選択状態に応じてチャット入力フィールドの有効/無効を制御する。

```typescript
// チャット入力のdisabled条件
const isChatInputDisabled = !isModelSelected || isStreaming;

// JSX内
<textarea
  disabled={isChatInputDisabled}
  // ...他のprops
/>
```

### タスク4: useWorkspaceChatController.ts の調整（必要な場合のみ）

```bash
# blocked判定の現在の実装を確認
grep -n "blocked\|selectedProvider\|selectedModel" \
  apps/desktop/src/renderer/views/WorkspaceView/useWorkspaceChatController.ts
```

必要な場合のみ、blocked判定にモデル選択状態を反映する。既に実装済みの場合はスキップ（P50対策）。

```typescript
// useWorkspaceChatController.ts に追加（必要な場合のみ）
const selectedProviderId = useSelectedProviderId(); // 個別セレクタ使用（P31対策）
const selectedModelId = useSelectedModelId(); // 個別セレクタ使用（P31対策）

const blocked = selectedProviderId === null || selectedModelId === null;

return {
  // ...既存の返り値
  blocked,
};
```

**P31対策**: `useAppStore()` の合成Hookではなく、個別セレクタ（`useSelectedProviderId()` 等）を使用すること。

### タスク5: テスト実行でGreen確認

```bash
# apps/desktopディレクトリから実行（P40対策）
cd apps/desktop

# 統合テスト実行
pnpm vitest run src/renderer/views/WorkspaceView/__tests__/WorkspaceChatPanel.integration.test.tsx

# リグレッション確認
pnpm vitest run src/renderer/views/WorkspaceView/
```

## 参照資料

### Phase 1-3 ドキュメント

| 資料名                                          | パス                                                                                                                          |
| ----------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| Phase 2 設計書（WorkspaceChat配置設計 3.2/3.3） | `docs/30-workflows/chat-inline-model-selector/tasks/03-TASK-UI-WORKSPACE-MODEL-SELECTOR-INTEGRATION/` （Task 01完了後に参照） |
| Task 01 成果物（InlineModelSelector）           | `apps/desktop/src/renderer/components/InlineModelSelector.tsx`（Task 01完了後に参照）                                         |

### システム仕様

| 資料名              | パス                                                                                        |
| ------------------- | ------------------------------------------------------------------------------------------- |
| UI/UXコンポーネント | `.claude/skills/aiworkflow-requirements/references/arch-ui-components.md`                   |
| 状態管理            | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`                |
| 実装パターン        | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` |

### 既知の落とし穴

| 落とし穴ID | 説明                                   | 対策                                                     |
| ---------- | -------------------------------------- | -------------------------------------------------------- |
| P31        | Zustand Store Hooks 無限ループ         | 個別セレクタを使用、合成Hookの戻り値を依存配列に含めない |
| P40        | テスト実行ディレクトリ依存（モノレポ） | `cd apps/desktop && pnpm vitest run` で実行              |
| P50        | 既実装防御の発見による Phase 転換      | タスク0で既実装状況を必ず確認する                        |

## 実行手順

1. **タスク0の実施**: P50チェックを行い、既実装箇所を確認する
2. **タスク1の実施**: InlineModelSelectorをWorkspaceChatPanelに配置する
3. **タスク1後のテスト実行**: I-1テストがGreenになることを確認する
4. **タスク2の実施**: GuidanceBlock表示条件を調整する
5. **タスク2後のテスト実行**: I-2/I-3テストがGreenになることを確認する
6. **タスク3の実施**: チャット入力の有効化条件を調整する
7. **タスク3後のテスト実行**: I-4テストがGreenになることを確認する
8. **タスク4の実施**: useWorkspaceChatControllerのblocked判定を調整する（必要な場合のみ）
9. **タスク5の実施**: 全テストを実行し、I-1〜I-6がGreenであることを確認する

## 統合テスト連携

- 現行実装との差分、対象テスト、依存タスクとの接続点をこのPhaseで確認・更新する。
- 追加・変更したテスト観点は対応する `apps/desktop/src/` の実装ファイルと1対1で突合する。

## 成果物

| 成果物                                 | パス                                                                                                                           | 説明                                       |
| -------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------ |
| Phase 5 仕様書（本ファイル）           | `docs/30-workflows/chat-inline-model-selector/tasks/03-TASK-UI-WORKSPACE-MODEL-SELECTOR-INTEGRATION/phase-5-implementation.md` | 実装手順書                                 |
| WorkspaceChatPanel.tsx 修正            | `apps/desktop/src/renderer/views/WorkspaceView/WorkspaceChatPanel.tsx`                                                         | InlineModelSelector配置・GuidanceBlock条件 |
| useWorkspaceChatController修正（任意） | `apps/desktop/src/renderer/views/WorkspaceView/useWorkspaceChatController.ts`                                                  | blocked判定調整（必要な場合のみ）          |

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. 参照資料の確認
2. 実行タスクの実施（各タスクごとに1サブタスク）
3. 統合テスト連携の実施
4. 成果物の作成・配置
5. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐにcompletedに更新すること。

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/chat-inline-model-selector/tasks/03-TASK-UI-WORKSPACE-MODEL-SELECTOR-INTEGRATION --phase 5
```

## 完了条件

- [ ] タスク0のP50チェックを実施し、既実装状況を確認した
- [ ] WorkspaceChatPanel上部にInlineModelSelector(compact=true)が配置された
- [ ] InlineModelSelectorのdisabledがisStreamingに連動している
- [ ] モデル未選択時にGuidanceBlock(variant="blocked")が表示されるよう実装された
- [ ] モデル選択後にGuidanceBlock(variant="blocked")が非表示になるよう実装された
- [ ] API key未設定時のGuidanceBlockは別条件で維持されている
- [ ] チャット入力フィールドのdisabled条件がモデル選択状態に連動している
- [ ] I-1 〜 I-6 の全テストがGreen（PASS）になった
- [ ] 既存のWorkspaceView関連テストがすべてPASSのままである（リグレッションなし）

## 次のPhase

Phase 6: テスト拡充（`phase-6-test-expansion.md`）
