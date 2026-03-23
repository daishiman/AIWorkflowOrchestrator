# Implementation Guide: WorkspaceChatPanel InlineModelSelector統合

## Part 1: 概念説明（中学生レベル）

### この機能を一言で

ワークスペースのチャット画面で、どのAIモデルと話すかを**その場で選べる**ようにしました。

### 日常のたとえ

レストランで席に着いたとき、メニューが手元にある状態を想像してください。

- **以前**: 「何を食べたいかは、まず受付（設定画面）に戻って伝えてください」と言われていた
- **今回**: メニュー（InlineModelSelector）がテーブル（チャットパネル）に直接置いてあるので、すぐに注文（チャット）できる

### 何が変わったか

1. チャット画面の上部に「モデル選択セレクタ」が追加された
2. モデルを選ぶと、自動的にチャット入力が有効になる
3. AIが回答中（ストリーミング中）はモデルを変更できない（混乱を防ぐため）

---

## Part 2: 開発者向け実装詳細

### 変更ファイル

| ファイル                                  | 変更内容                          | 行数変更 |
| ----------------------------------------- | --------------------------------- | -------- |
| `WorkspaceChatPanel.tsx`                  | InlineModelSelector import + 配置 | +4行     |
| `WorkspaceChatPanel.guidance.test.tsx`    | Store モック追加                  | +8行     |
| `WorkspaceView.test.tsx`                  | Store モック追加                  | +8行     |
| `WorkspaceChatPanel.integration.test.tsx` | 新規テストファイル（11テスト）    | 新規     |

### アーキテクチャ

```
WorkspaceChatPanel (organism)
  ├── InlineModelSelector (molecule) ← 新規追加
  │   └── Store直結 (useLLMProviders等)
  ├── GuidanceBlock (molecule) ← 既存・表示制御は変更なし
  ├── WorkspaceSuggestionBubbles
  ├── WorkspaceChatMessageList
  ├── WorkspaceFileContextChips
  ├── StreamingErrorDisplay
  └── WorkspaceChatInput
```

### データフロー

```
ユーザー操作: InlineModelSelectorでモデル選択
  → llmSlice.selectModel() でStore更新
  → useWorkspaceChatController内 deriveModelSelectionBlockedReason()
  → controller.blockedReason = null
  → blockedGuidance = null
  → GuidanceBlock非表示 + チャット入力有効化
```

### 追加コードなしの連動

`useWorkspaceChatController.ts` は変更なし。Store の `selectedProviderId`/`selectedModelId` の変化を `deriveModelSelectionBlockedReason()` が自動検出し、`blockedReason` を更新する。

### テスト戦略

- **I-1〜I-6**: 基本統合テスト（配置確認、GuidanceBlock連動、disabled制御）
- **E-1〜E-5**: エッジケース（NO_PROVIDER、同時表示、状態遷移、ゼロステート、エラー表示）
- **P39準拠**: happy-dom環境ではfireEvent使用
- **P9準拠**: beforeEachでモックリセット
