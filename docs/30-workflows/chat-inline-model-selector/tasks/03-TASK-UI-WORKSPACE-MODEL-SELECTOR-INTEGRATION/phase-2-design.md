# Phase 2: 設計 — WorkspaceChatPanel インラインモデルセレクタ統合

## メタ情報

| 項目     | 値                                           |
| -------- | -------------------------------------------- |
| Phase    | 2                                            |
| 機能名   | workspace-inline-model-selector-integration  |
| タスクID | TASK-UI-WORKSPACE-MODEL-SELECTOR-INTEGRATION |
| 作成日   | 2026-03-21                                   |
| 更新日   | 2026-03-22                                   |

## 目的

Phase 1の要件定義に基づき、WorkspaceChatPanelへのInlineModelSelector配置設計・GuidanceBlockとの共存設計・useWorkspaceChatControllerとの連動設計を行う。

## 実行タスク

- 配置設計: WorkspaceChatPanelヘッダー部への具体的な配置位置とレイアウトを決定
- 表示制御設計: GuidanceBlock(variant="blocked")とInlineModelSelectorの共存ルールを設計
- disabled制御設計: ストリーミング中のInlineModelSelector無効化方式を設計
- controller連動設計: isModelBlocked判定との連動方式を確認

## 参照資料

| 資料名                     | パス                                                                                                                         | 説明                              |
| -------------------------- | ---------------------------------------------------------------------------------------------------------------------------- | --------------------------------- |
| Phase 1 要件定義           | `docs/30-workflows/chat-inline-model-selector/tasks/03-TASK-UI-WORKSPACE-MODEL-SELECTOR-INTEGRATION/phase-1-requirements.md` | WorkspaceChat統合の要件・受入基準 |
| WorkspaceChatPanel実装     | `apps/desktop/src/renderer/views/WorkspaceView/WorkspaceChatPanel.tsx`                                                       | 統合先（76行）                    |
| useWorkspaceChatController | `apps/desktop/src/renderer/views/WorkspaceView/hooks/useWorkspaceChatController.ts`                                          | チャットコントローラー（652行）   |
| InlineModelSelector        | `apps/desktop/src/renderer/components/llm/InlineModelSelector.tsx`                                                           | Task 01成果物（462行）            |

### システム仕様（aiworkflow-requirements）

| 参照資料            | パス                                                                                             | 内容                     |
| ------------------- | ------------------------------------------------------------------------------------------------ | ------------------------ |
| UI/UXコンポーネント | `.claude/skills/aiworkflow-requirements/references/ui-ux-components.md`                          | 既存UIコンポーネント構造 |
| デザイン原則        | `.claude/skills/aiworkflow-requirements/references/ui-ux-design-principles.md`                   | Apple HIG準拠設計        |
| 実装パターン        | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns-core.md` | P31/P48対策パターン      |

## 実行手順

### ステップ1: WorkspaceChatPanel現行レイアウトの分析

```
WorkspaceChatPanel (現行: 76行)
┌─────────────────────────────────────────┐
│ <section.flex.flex-col.rounded-3xl>     │
│                                         │
│   <div.border-b>  ← ヘッダー部         │
│     <h1> Workspace Chat </h1>           │
│     <p> 説明テキスト </p>               │
│   </div>                                │
│                                         │
│   <div.flex.flex-col.gap-4>             │
│     {isModelBlocked && (                │
│       <GuidanceBlock variant="blocked"/>│  ← モデル未選択時
│     )}                                  │
│                                         │
│     {showSuggestionBubbles && (         │
│       <WorkspaceSuggestionBubbles />    │  ← ゼロステート
│     )}                                  │
│                                         │
│     <WorkspaceChatMessageList />        │  ← メッセージ一覧
│     <WorkspaceFileContextChips />       │  ← ファイルコンテキスト
│     <WorkspaceChatInput />              │  ← 入力エリア
│   </div>                                │
│ </section>                              │
└─────────────────────────────────────────┘
```

### ステップ2: InlineModelSelector配置設計

```
WorkspaceChatPanel (変更後)
┌─────────────────────────────────────────┐
│ <section.flex.flex-col.rounded-3xl>     │
│                                         │
│   <div.border-b>  ← ヘッダー部         │
│     <h1> Workspace Chat </h1>           │
│     <p> 説明テキスト </p>               │
│     <InlineModelSelector compact        │  ← 新規追加
│       disabled={controller.isStreaming}/>│
│   </div>                                │
│                                         │
│   <div.flex.flex-col.gap-4>             │
│     {isModelBlocked && (                │  ← 既存ロジック維持
│       <GuidanceBlock variant="blocked"/>│
│     )}                                  │
│     ... (以降変更なし)                   │
│   </div>                                │
│ </section>                              │
└─────────────────────────────────────────┘
```

**配置位置**: ヘッダー部（`div.border-b`）の末尾、説明テキストの下
**理由**:

1. サイドパネル内のヘッダー直下に配置することで、チャット操作前にモデルを確認できる
2. compact版（高さ28px）はパネル幅に収まる
3. GuidanceBlockの上に位置するため、モデル選択 → GuidanceBlock消滅の視覚フローが自然

### ステップ3: 実装変更箇所の特定

#### 3.1 WorkspaceChatPanel.tsx の変更

```typescript
// 追加するimport
import { InlineModelSelector } from "@/renderer/components/llm";

// ヘッダー部（div.border-b）の末尾に追加
<InlineModelSelector compact disabled={controller.isStreaming} />
```

**変更量**: import 1行 + JSX 1行（計2行の追加のみ）

**`controller.isStreaming` の取得**: `useWorkspaceChatController` の戻り値として既に利用可能。追加のStore接続は不要。

#### 3.2 useWorkspaceChatController.ts の変更

**変更なし**。現在の実装を確認:

```typescript
// useWorkspaceChatController.ts内（変更不要）
const selectedModelId = useAppStore((state) => state.selectedModelId);

// WorkspaceChatPanel.tsx内の既存ロジック（変更不要）
const isModelBlocked = controller.selectedModelId === null;
```

InlineModelSelectorがStore（`llmSlice`）を更新すると、`useAppStore((state) => state.selectedModelId)` が反応し、controllerの `selectedModelId` が更新される。これにより `isModelBlocked` が自動で `false` に変わる。追加の連携コードは不要。

### ステップ4: GuidanceBlock(variant="blocked")との共存設計

| 状態                          | InlineModelSelector      | GuidanceBlock(blocked) |
| ----------------------------- | ------------------------ | ---------------------- |
| モデル未選択（初回）          | 表示（プレースホルダー） | 表示（Settings誘導）   |
| InlineModelSelectorで選択直後 | 表示（選択中モデル名）   | 即座に非表示           |
| モデル選択済み                | 表示（選択中モデル名）   | 非表示                 |
| ストリーミング中              | 表示（disabled）         | 非表示（選択済み前提） |

**設計判断**: GuidanceBlock表示制御の既存ロジック（`isModelBlocked = controller.selectedModelId === null`）は変更不要。InlineModelSelectorでStore更新 → controller反応 → isModelBlocked自動更新のパスで動作する。

### ステップ5: disabled制御設計

```typescript
// WorkspaceChatPanel.tsx内（controllerの既存プロパティを利用）
<InlineModelSelector compact disabled={controller.isStreaming} />
```

**`isSending` ではなく `isStreaming` を使用する理由**:

- WorkspaceChatPanelは `useWorkspaceChatController` でストリーミング状態を管理している
- `controller.isStreaming` が `true` の間はモデル変更を禁止する
- ChatViewの `isSending`（Store管理）とは異なり、controllerのローカル状態を使用する

### ステップ6: Tab順序設計

```
Tab順序（WorkspaceChatPanel内）:
1. h1 "Workspace Chat"（非フォーカス）
2. InlineModelSelector (combobox)  ← 新規追加
3. GuidanceBlock内ボタン（表示時のみ）
4. WorkspaceSuggestionBubbles（表示時のみ）
5. WorkspaceChatInput
```

DOMの配置順がそのままTab順序になるため、特別な `tabIndex` 設定は不要。

## 統合テスト連携（Phase 2）

- WorkspaceChatPanel内にInlineModelSelectorがレンダーされることのテスト
- `controller.isStreaming=true` 時に `disabled` propが渡されることのテスト
- GuidanceBlockがモデル選択後に非表示になることのテスト
- isModelBlocked判定の連動テスト
- P39対策: happy-dom環境では `fireEvent` を使用

## 多角的チェック観点

| 観点             | 適用 | 確認内容                                                     |
| ---------------- | ---- | ------------------------------------------------------------ |
| UI/UX            | 該当 | サイドパネル内のレイアウト崩れなし、compact版の操作性        |
| アーキテクチャ   | 該当 | 変更量が最小（2行追加）、既存controller/Store活用            |
| アクセシビリティ | 該当 | Tab順序の自然さ（Task 01のARIA実装を継承）                   |
| パフォーマンス   | 該当 | 追加Store接続なし（isStreamingはcontrollerの既存プロパティ） |

## 成果物

| 成果物 | パス                                                                                                                   | 説明           |
| ------ | ---------------------------------------------------------------------------------------------------------------------- | -------------- |
| 設計書 | `docs/30-workflows/chat-inline-model-selector/tasks/03-TASK-UI-WORKSPACE-MODEL-SELECTOR-INTEGRATION/phase-2-design.md` | 本ドキュメント |

## 完了条件

- [x] WorkspaceChatPanel現行レイアウトを分析し配置位置を決定
- [x] InlineModelSelectorの配置位置とprops設計を完了
- [x] GuidanceBlock(variant="blocked")との共存設計を完了
- [x] useWorkspaceChatControllerとの連動設計（変更不要の根拠含む）を完了
- [x] disabled制御（ストリーミング中）の方式を決定
- [x] Tab順序設計を完了
- [x] 影響ファイルの変更箇所と変更量を特定
- [x] **本Phase内の全タスクを100%実行完了**

## 次のPhase

→ `phase-3-design-review.md`（同ディレクトリ内）
