# Phase 5: 実装（TDD: Green）- タスク仕様書

## メタ情報

| 項目      | 内容                                |
| --------- | ----------------------------------- |
| Phase     | 5                                   |
| Phase名   | 実装                                |
| カテゴリ  | TDD-Green                           |
| 機能名    | TASK-7D-chatpanel-agent-integration |
| 作成日    | 2026-01-31                          |
| 前提Phase | Phase 4                             |
| 後続Phase | Phase 6                             |

## 目的

Phase 4で作成した失敗テストを全てGreenにするために、ChatPanelの修正とSkillStreamingViewコンポーネントを実装する。

## 実行タスク

### タスク1: SkillStreamingViewコンポーネント実装

**目的**: スキル実行結果のストリーミング表示コンポーネントを新規作成する。

**手順**:

1. `apps/desktop/src/renderer/components/skill/SkillStreamingView.tsx` を作成する
2. Propsインターフェースを定義する:

   ```typescript
   interface SkillStreamingViewProps {
     skillName: string;
     messages: SkillStreamMessage[];
     status: SkillExecutionStatus | null;
   }
   ```

3. StatusBadgeサブコンポーネントを実装する:
   - `status`に応じた色とラベルを表示する:
     - `"running"` → 青（bg-blue-500）、"実行中..."
     - `"permission_pending"` → 黄（bg-yellow-500）、"権限確認"
     - `"completed"` → 緑（bg-green-500）、"完了"
     - `"cancelled"` → 灰（bg-gray-500）、"キャンセル"
     - `"error"` → 赤（bg-red-500）、"エラー"
   - `status`が`null`または`"idle"`の場合は`null`を返す
   - `role="status"` 属性を付与する

4. StreamMessageItemサブコンポーネントを実装する:
   - `message.type`でswitch分岐する:
     - `"assistant"`: `message.content.text`を表示し、`message.content.isPartial`が`true`の場合は`▌`カーソル（`animate-pulse`）を追加する
     - `"tool_use"`: `🔧 ツール使用: {message.content.toolName}`をbg-blue-50で表示する
     - `"tool_result"`: 成功時`✅ 完了`（bg-green-50）、失敗時`❌ エラー: {message.content.error}`（bg-red-50）を表示する
     - `"error"`: エラーメッセージをbg-red-50、text-red-600で表示する
     - `default`: `null`を返す

5. ToolExecutionHistoryサブコンポーネントを実装する:
   - `<details>` / `<summary>`で折りたたみ表示する
   - tool_useとtool_resultのメッセージをフィルタリングして表示する
   - ツール数は`toolMessages.length / 2`で計算する
   - ツールメッセージがゼロの場合は`null`を返す

6. 中止ボタンを実装する:
   - `useAppStore`から`abortExecution`を取得する
   - `status === "running"`の場合のみ表示する
   - クリック時に`abortExecution()`を呼び出す
   - `type="button"`を指定する

7. アクセシビリティ属性を追加する:
   - ストリーミング表示エリア: `role="log"`, `aria-live="polite"`, `aria-label="スキル実行結果"`
   - 中止ボタン: `aria-label="スキル実行を中止する"`
   - StatusBadge: `role="status"`

8. React.memoでラップしてパフォーマンスを最適化する

**期待される成果物**:

- `apps/desktop/src/renderer/components/skill/SkillStreamingView.tsx`

### タスク2: ChatPanelコンポーネント修正

**目的**: 既存のChatPanelにSkillSelector、SkillImportDialog、PermissionDialog、SkillStreamingViewを統合する。

**手順**:

1. `apps/desktop/src/renderer/components/chat/ChatPanel.tsx`を修正する
2. 必要なインポートを追加する:

   ```typescript
   import { SkillSelector } from "../skill/SkillSelector";
   import { SkillImportDialog } from "../skill/SkillImportDialog";
   import { PermissionDialog } from "../skill/PermissionDialog";
   import { SkillStreamingView } from "../skill/SkillStreamingView";
   import { useAppStore } from "../../store";
   ```

3. Storeからの状態取得を実装する:

   ```typescript
   const {
     selectedSkillName,
     streamingMessages,
     isExecuting,
     skillExecutionStatus,
     fetchSkills,
   } = useAppStore();
   ```

4. ローカルstateを定義する:

   ```typescript
   const [importDialogSkill, setImportDialogSkill] =
     useState<SkillMetadata | null>(null);
   ```

5. useEffectでスキル一覧を取得する:

   ```typescript
   useEffect(() => {
     fetchSkills();
   }, [fetchSkills]);
   ```

6. JSX構造を実装する:
   - ヘッダー: `<div className="flex items-center gap-4 px-4 py-2 border-b">`にSkillSelectorを配置する
   - メッセージ領域: 条件付きでSkillStreamingViewを表示する
     - 表示条件: `isExecuting && selectedSkillName`がtruthyの場合のみ
     - Props: `skillName={selectedSkillName}`, `messages={streamingMessages}`, `status={skillExecutionStatus}`
   - ダイアログ:
     - SkillImportDialog: `skill={importDialogSkill}`, `isOpen={importDialogSkill !== null}`, `onClose={() => setImportDialogSkill(null)}`
     - PermissionDialog: Props不要（Store-directパターン）

7. forwardRef経由の`ChatPanelHandle.handleImportRequest`メソッドを実装する:
   ```typescript
   useImperativeHandle(ref, () => ({
     handleImportRequest: (skill: SkillMetadata) => setImportDialogSkill(skill),
   }));
   ```

**期待される成果物**:

- `apps/desktop/src/renderer/components/chat/ChatPanel.tsx`（修正）

### タスク3: skill/index.tsエクスポート更新

**目的**: SkillStreamingViewのエクスポートを追加する。

**手順**:

1. `apps/desktop/src/renderer/components/skill/index.ts`を読み込む
2. 以下のエクスポートを追加する:
   ```typescript
   export { SkillStreamingView } from "./SkillStreamingView";
   ```

**期待される成果物**:

- `apps/desktop/src/renderer/components/skill/index.ts`（修正）

### タスク4: テストGreen確認

**目的**: Phase 4で作成した全テストがGreen（成功）することを確認する。

**手順**:

1. 以下のコマンドでテストを実行する:
   ```bash
   pnpm --filter @repo/desktop vitest run apps/desktop/src/renderer/components/chat/__tests__/ChatPanel.test.tsx
   pnpm --filter @repo/desktop vitest run apps/desktop/src/renderer/components/skill/__tests__/SkillStreamingView.test.tsx
   ```
2. 全テストがPASSであることを確認する
3. 失敗しているテストがある場合は、実装を修正して再度テストを実行する

### タスク5: TypeScript型チェック・Lint確認

**目的**: 実装した全ファイルの型チェックとLintが通ることを確認する。

**手順**:

1. 型チェック: `pnpm --filter @repo/desktop typecheck`
2. Lint: `pnpm lint`
3. エラーがある場合は修正する

## 参照資料

| 参照資料                         | パス                                                                               | 内容         |
| -------------------------------- | ---------------------------------------------------------------------------------- | ------------ |
| Phase 2コンポーネント設計        | `outputs/phase-2/component-design.md`                                              | 設計書       |
| Phase 4テスト仕様書              | `outputs/phase-4/test-specification.md`                                            | テスト設計   |
| Phase 4 ChatPanelテスト          | `apps/desktop/src/renderer/components/chat/__tests__/ChatPanel.test.tsx`           | テストコード |
| Phase 4 SkillStreamingViewテスト | `apps/desktop/src/renderer/components/skill/__tests__/SkillStreamingView.test.tsx` | テストコード |
| 既存SkillSelector実装            | `apps/desktop/src/renderer/components/skill/SkillSelector.tsx`                     | 参考実装     |
| 既存PermissionDialog実装         | `apps/desktop/src/renderer/components/skill/PermissionDialog.tsx`                  | 参考実装     |
| 既存skillSlice実装               | `apps/desktop/src/renderer/store/slices/skillSlice.ts`                             | Store実装    |
| 共有型定義                       | `packages/shared/src/types/skill.ts`                                               | 型定義       |

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料               | パス                                                                         | 内容               |
| ---------------------- | ---------------------------------------------------------------------------- | ------------------ |
| Agent Execution UI仕様 | `.claude/skills/aiworkflow-requirements/references/ui-ux-agent-execution.md` | コンポーネント仕様 |
| 状態管理アーキテクチャ | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md` | Store設計          |

## 統合テスト連携【必須】

| 実装項目              | 内容                                                             |
| --------------------- | ---------------------------------------------------------------- |
| Store → ChatPanel接続 | useAppStore()でskillSlice状態を取得し子コンポーネントにProps渡し |
| イベント連携          | SkillSelector.onImportRequest → ChatPanel.setImportDialogSkill   |
| 条件付きレンダリング  | isExecuting && selectedSkillNameによるSkillStreamingView表示切替 |

## アーキテクチャ層別実装

| 層               | 実装観点                               | 実装ファイル配置                                                    |
| ---------------- | -------------------------------------- | ------------------------------------------------------------------- |
| Renderer Process | UIコンポーネント、条件付きレンダリング | `apps/desktop/src/renderer/components/skill/SkillStreamingView.tsx` |
| Renderer Process | 統合コンポーネント、Store接続          | `apps/desktop/src/renderer/components/chat/ChatPanel.tsx`           |

## 成果物

| 成果物                 | パス                                                                | 種別 |
| ---------------------- | ------------------------------------------------------------------- | ---- |
| SkillStreamingView     | `apps/desktop/src/renderer/components/skill/SkillStreamingView.tsx` | code |
| ChatPanel（修正）      | `apps/desktop/src/renderer/components/chat/ChatPanel.tsx`           | code |
| skill/index.ts（修正） | `apps/desktop/src/renderer/components/skill/index.ts`               | code |

## 完了条件

- [ ] SkillStreamingView.tsxが作成されている
- [ ] ChatPanel.tsxが修正されている（SkillSelector、SkillImportDialog、PermissionDialog、SkillStreamingViewが統合されている）
- [ ] skill/index.tsにSkillStreamingViewのエクスポートが追加されている
- [ ] Phase 4の全テストがGreen（PASS）である
- [ ] TypeScript型チェックがエラーゼロで通る
- [ ] ESLint/Prettierが通る
- [ ] 本Phase内の全タスクを100%実行完了

## TDD検証

```bash
# テスト実行コマンド
pnpm --filter @repo/desktop vitest run apps/desktop/src/renderer/components/chat/__tests__/ChatPanel.test.tsx
pnpm --filter @repo/desktop vitest run apps/desktop/src/renderer/components/skill/__tests__/SkillStreamingView.test.tsx

# 確認項目
# - [ ] テストが成功することを確認（Green状態）
```

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. 参照資料の確認
2. タスク1: SkillStreamingViewコンポーネント実装
3. タスク2: ChatPanelコンポーネント修正
4. タスク3: skill/index.tsエクスポート更新
5. タスク4: テストGreen確認
6. タスク5: TypeScript型チェック・Lint確認
7. 統合テスト連携の実施
8. 成果物の作成・配置
9. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐにcompletedに更新すること。

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/TASK-7D-chatpanel-agent-integration --phase 5
```

## 次のPhase

Phase 6: テスト拡充 → [phase-6-test-enhancement.md](phase-6-test-enhancement.md)
