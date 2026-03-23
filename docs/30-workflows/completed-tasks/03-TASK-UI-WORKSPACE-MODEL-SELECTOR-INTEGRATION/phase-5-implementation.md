# Phase 5: 実装

## メタ情報

| 項目          | 内容                                                                                                                 |
| ------------- | -------------------------------------------------------------------------------------------------------------------- |
| Phase番号     | 5                                                                                                                    |
| 機能名        | WorkspaceChatPanelへのインラインモデルセレクタ配置 (TASK-UI-WORKSPACE-MODEL-SELECTOR-INTEGRATION)                    |
| 作成日        | 2026-03-21                                                                                                           |
| 更新日        | 2026-03-23                                                                                                           |
| 担当          | -                                                                                                                    |
| ステータス    | 完了                                                                                                                 |
| 前Phase成果物 | `docs/30-workflows/chat-inline-model-selector/tasks/03-TASK-UI-WORKSPACE-MODEL-SELECTOR-INTEGRATION/phase-4-test.md` |

## 目的

Phase 4 で作成したテスト（Red状態）をGreen（全PASS）にするための実装を行う。WorkspaceChatPanel.tsxへのInlineModelSelector配置を実装する。

## 実行タスク

### タスク0: 実装前の現状確認（P50対策）

```bash
# WorkspaceChatPanel の現在の実装を確認（108行）
cat apps/desktop/src/renderer/views/WorkspaceView/WorkspaceChatPanel.tsx

# InlineModelSelectorのexport確認（Task 01成果物）
grep -n "export.*InlineModelSelector" apps/desktop/src/renderer/components/llm/index.ts

# InlineModelSelectorProps のインターフェース確認
grep -A 20 "export interface InlineModelSelectorProps" apps/desktop/src/renderer/components/llm/InlineModelSelector.tsx
```

**確認すべきポイント**:

- `InlineModelSelector` が `compact?: boolean` と `disabled?: boolean` props を持つこと
- `@/renderer/components/llm` から re-export されていること
- WorkspaceChatPanel が `{ controller: WorkspaceChatController }` props のみ受け取ること

### タスク1: WorkspaceChatPanel.tsx へのInlineModelSelector配置

**対象ファイル**: `apps/desktop/src/renderer/views/WorkspaceView/WorkspaceChatPanel.tsx`

**修正内容**: ヘッダー部（`div.border-b`）の末尾にInlineModelSelector(compact)を追加する。

```typescript
// 追加するimport（ファイル先頭のimportブロックに追加）
import { InlineModelSelector } from "../../components/llm";

// ヘッダー部（div.border-b）内、</p>の後に追加:
<InlineModelSelector compact disabled={controller.isStreaming} />
```

**実装詳細**:

```typescript
// 変更前（L50-57付近）:
      <div className="border-b border-[var(--border-subtle)] px-5 py-4">
        <h1 className="text-lg font-semibold text-[var(--text-primary)]">
          Workspace Chat
        </h1>
        <p className="mt-1 text-sm text-[var(--text-primary)] opacity-70">
          ファイル背景情報と会話履歴を使って、作業コンテキストに沿った回答を得られます。
        </p>
      </div>

// 変更後:
      <div className="border-b border-[var(--border-subtle)] px-5 py-4">
        <h1 className="text-lg font-semibold text-[var(--text-primary)]">
          Workspace Chat
        </h1>
        <p className="mt-1 text-sm text-[var(--text-primary)] opacity-70">
          ファイル背景情報と会話履歴を使って、作業コンテキストに沿った回答を得られます。
        </p>
        <div className="mt-3">
          <InlineModelSelector compact disabled={controller.isStreaming} />
        </div>
      </div>
```

**変更量**: import 1行 + JSX 3行（wrapper div含む）

**注意事項**:

- `compact` prop を必ず指定する（サイドパネル幅に対応）
- `disabled={controller.isStreaming}` で controller の既存プロパティを利用（追加Store接続不要）
- GuidanceBlock の表示制御ロジックは変更不要（`blockedGuidance` による既存制御を維持）
- useWorkspaceChatController.ts の変更は不要（`blockedReason` の算出ロジックがInlineModelSelectorのStore更新に自動反応）

### タスク2: テスト実行でGreen確認

```bash
# apps/desktopディレクトリから実行（P40対策）
cd apps/desktop

# 統合テスト実行
pnpm vitest run src/renderer/views/WorkspaceView/__tests__/WorkspaceChatPanel.integration.test.tsx

# リグレッション確認（既存テストが壊れていないか）
pnpm vitest run src/renderer/views/WorkspaceView/
```

**Green確認チェックリスト**:

- [ ] I-1: InlineModelSelector(compact)の combobox ロールが検出される
- [ ] I-2: blockedReason=null → GuidanceBlock非表示
- [ ] I-3: blockedReason="NO_MODEL" → GuidanceBlock表示
- [ ] I-4: blockedReason=null → チャット操作可能
- [ ] I-5: isStreaming=true → InlineModelSelector が disabled 状態
- [ ] I-6: blockedReason の変化で GuidanceBlock の表示が連動

## 参照資料

### Phase 1-3 ドキュメント

| 資料名                                | パス                                                                                                                   |
| ------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| Phase 2 設計書（配置設計・連動設計）  | `docs/30-workflows/chat-inline-model-selector/tasks/03-TASK-UI-WORKSPACE-MODEL-SELECTOR-INTEGRATION/phase-2-design.md` |
| Task 01 成果物（InlineModelSelector） | `apps/desktop/src/renderer/components/llm/InlineModelSelector.tsx`                                                     |

### 既存コード（実装時参照）

| ファイル                      | パス                                                                                | 説明                                          |
| ----------------------------- | ----------------------------------------------------------------------------------- | --------------------------------------------- |
| WorkspaceChatPanel            | `apps/desktop/src/renderer/views/WorkspaceView/WorkspaceChatPanel.tsx`              | 統合先（108行）                               |
| useWorkspaceChatController    | `apps/desktop/src/renderer/views/WorkspaceView/hooks/useWorkspaceChatController.ts` | チャットコントローラー（blockedReason算出元） |
| modelSelectionGuidance        | `apps/desktop/src/renderer/guidance/modelSelectionGuidance.ts`                      | blockedReason → GuidanceBlock表示制御         |
| InlineModelSelector           | `apps/desktop/src/renderer/components/llm/InlineModelSelector.tsx`                  | Task 01成果物（462行）                        |
| InlineModelSelector re-export | `apps/desktop/src/renderer/components/llm/index.ts`                                 | import元                                      |

### 既知の落とし穴

| 落とし穴ID | 説明                                   | 対策                                                     |
| ---------- | -------------------------------------- | -------------------------------------------------------- |
| P31        | Zustand Store Hooks 無限ループ         | InlineModelSelector内部で個別セレクタ使用済み（Task 01） |
| P40        | テスト実行ディレクトリ依存（モノレポ） | `cd apps/desktop && pnpm vitest run` で実行              |
| P50        | 既実装防御の発見による Phase 転換      | タスク0で既実装状況を必ず確認する                        |

## 実行手順

1. **タスク0の実施**: P50チェックを行い、既実装箇所を確認する
2. **タスク1の実施**: InlineModelSelectorをWorkspaceChatPanelのヘッダー部に配置する
3. **タスク2の実施**: 全テスト（I-1〜I-6）を実行し、Greenであることを確認する

## 統合テスト連携

- 現行実装との差分、対象テスト、依存タスクとの接続点をこのPhaseで確認・更新する。
- 追加・変更したテスト観点は対応する `apps/desktop/src/` の実装ファイルと1対1で突合する。

## 成果物

| 成果物                       | パス                                                                                                                           | 説明                      |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------ | ------------------------- |
| Phase 5 仕様書（本ファイル） | `docs/30-workflows/chat-inline-model-selector/tasks/03-TASK-UI-WORKSPACE-MODEL-SELECTOR-INTEGRATION/phase-5-implementation.md` | 実装手順書                |
| WorkspaceChatPanel.tsx 修正  | `apps/desktop/src/renderer/views/WorkspaceView/WorkspaceChatPanel.tsx`                                                         | InlineModelSelector配置済 |

## サブタスク管理

Phase実行開始時に、TaskCreateツールで以下のサブタスクを作成すること:

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
- [ ] WorkspaceChatPanelヘッダー部にInlineModelSelector(compact)が配置された
- [ ] import元が `@/renderer/components/llm` であること
- [ ] InlineModelSelectorのdisabledがcontroller.isStreamingに連動している
- [ ] GuidanceBlock表示制御ロジック（blockedGuidance）は変更なし
- [ ] useWorkspaceChatController.ts に変更がないこと
- [ ] I-1 〜 I-6 の全テストがGreen（PASS）になった
- [ ] 既存のWorkspaceView関連テストがすべてPASSのままである（リグレッションなし）

## 次のPhase

Phase 6: テスト拡充（`phase-6-test-expansion.md`）
