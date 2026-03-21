# Phase 5: 実装 — ChatViewへのインラインモデルセレクタ配置

## メタ情報

| 項目          | 値                                                                                                                |
| ------------- | ----------------------------------------------------------------------------------------------------------------- |
| 機能名        | chat-inline-model-selector                                                                                        |
| タスクID      | TASK-UI-CHATVIEW-MODEL-SELECTOR-INTEGRATION                                                                       |
| Phase         | 5                                                                                                                 |
| 作成日        | 2026-03-21                                                                                                        |
| 依存          | Phase 4（テスト作成）完了後                                                                                       |
| 前Phase成果物 | docs/30-workflows/chat-inline-model-selector/tasks/02-TASK-UI-CHATVIEW-MODEL-SELECTOR-INTEGRATION/phase-4-test.md |

## 目的

Phase 4で作成した統合テストをGreenにするため、ChatView/index.tsxにInlineModelSelectorを組み込み、LLMGuidanceBanner.tsxとの連携を確認する。

## 実行タスク

- `ChatView/index.tsx` にInlineModelSelectorをimportして配置する
- InlineModelSelectorのdisabledをストリーミング中のstateに連動させる
- LLMGuidanceBanner.tsxの既存動作を維持する（モデル選択済みで非表示）
- Phase 4テストがGreenになることを確認する

## 参照資料

| 資料                                                | パス                                                                                                                    |
| --------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| Phase 2 設計書（ChatView配置設計 3.1/3.3）          | docs/30-workflows/chat-inline-model-selector/phase-2-design.md                                                          |
| Phase 4 テスト仕様                                  | docs/30-workflows/chat-inline-model-selector/tasks/02-TASK-UI-CHATVIEW-MODEL-SELECTOR-INTEGRATION/phase-4-test.md       |
| Task 01 成果物（InlineModelSelectorコンポーネント） | docs/30-workflows/chat-inline-model-selector/tasks/01-TASK-UI-INLINE-MODEL-SELECTOR-COMPONENT/phase-5-implementation.md |
| アーキテクチャルール                                | .claude/rules/01-architecture.md                                                                                        |
| 状態管理ルール                                      | .claude/rules/03-state-management.md                                                                                    |

## 実行手順

### Step 1: InlineModelSelectorの配置先確認

ChatView/index.tsxの現在のヘッダー構造を確認する。

```bash
grep -n "SystemPromptToggleButton\|header\|Header" \
  apps/desktop/src/renderer/views/ChatView/index.tsx | head -30
```

Phase 2設計書セクション3.1に記載されたヘッダーレイアウト仕様に照らして、配置位置（SystemPromptToggleButtonの隣・ヘッダー左側）を特定する。

### Step 2: ChatView/index.tsx の修正

#### 2-1. InlineModelSelectorのimport追加

```tsx
import { InlineModelSelector } from "@/renderer/components/llm";
```

importパスはTask 01のPhase 5でindex.tsからエクスポートされる設計に合わせ、`@/renderer/components/llm` のindex経由で参照する。

#### 2-2. streamingstate の取得

ストリーミング状態を取得するセレクタを追加する。P31対策として合成Hookではなく個別セレクタを使用する。

```tsx
const isStreaming = useIsStreaming(); // 既存のセレクタがあれば流用
```

#### 2-3. ヘッダー部分へのInlineModelSelector配置

Phase 2設計書セクション3.1のレイアウト仕様に従い、SystemPromptToggleButtonの隣に配置する。

```tsx
<header className="flex items-center gap-2 px-4 py-2 border-b border-separator">
  {/* 左側 */}
  <div className="flex items-center gap-2">
    <SystemPromptToggleButton />
    <InlineModelSelector disabled={isStreaming} />
  </div>
  {/* 右側 */}
  <div className="ml-auto flex items-center gap-2">{/* 既存の右側要素 */}</div>
</header>
```

`data-testid="inline-model-selector"` はInlineModelSelectorコンポーネント内部で付与される（Task 01成果物）。

### Step 3: LLMGuidanceBanner.tsx の動作確認・調整

LLMGuidanceBannerは既存の表示条件（selected model が null の場合に表示）を維持する。

```bash
grep -n "selectedModel\|isModelSelected\|data-testid" \
  apps/desktop/src/renderer/components/organisms/LLMGuidanceBanner.tsx
```

以下を確認し、必要な場合のみ修正する:

- モデル未選択時に `data-testid="llm-guidance-banner"` を持つ要素が表示されること（TC-I-3）
- モデル選択後に同要素が DOM から削除されること（TC-I-4）
- APIキー関連のガイダンスは維持すること

### Step 4: Green確認

Phase 4で作成したテストがすべてGreenになることを確認する。

```bash
cd apps/desktop && pnpm vitest run src/renderer/views/ChatView/__tests__/ChatView.integration.test.tsx
```

期待: 5件すべてPASS（Greenステータス）

### Step 5: 既存テストの非デグレード確認

ChatViewに関連する既存テストがすべてGreenであることを確認する。

```bash
cd apps/desktop && pnpm vitest run src/renderer/views/ChatView/
```

## 成果物

| 成果物                          | パス                                                                 | 説明                                 |
| ------------------------------- | -------------------------------------------------------------------- | ------------------------------------ |
| ChatView修正                    | apps/desktop/src/renderer/views/ChatView/index.tsx                   | InlineModelSelector組み込み済み      |
| LLMGuidanceBanner確認・調整済み | apps/desktop/src/renderer/components/organisms/LLMGuidanceBanner.tsx | 既存動作を維持（必要な場合のみ修正） |

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
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/chat-inline-model-selector/tasks/02-TASK-UI-CHATVIEW-MODEL-SELECTOR-INTEGRATION --phase 5
```

## 完了条件

- [ ] InlineModelSelectorがChatViewヘッダー左側（SystemPromptToggleButtonの隣）に配置されている
- [ ] `disabled={isStreaming}` が正しく連動している
- [ ] LLMGuidanceBannerの既存動作（モデル未選択で表示、選択後で非表示）が維持されている
- [ ] APIキー関連のガイダンスが維持されている
- [ ] TC-I-1〜TC-I-5 の5件がすべてGreen
- [ ] 既存のChatViewテストが非デグレード（すべてGreen）
- [ ] P31準拠: 個別セレクタを使用している（合成Hook不使用）

## 次のPhase

[Phase 6: テスト拡充](./phase-6-test-expansion.md)
