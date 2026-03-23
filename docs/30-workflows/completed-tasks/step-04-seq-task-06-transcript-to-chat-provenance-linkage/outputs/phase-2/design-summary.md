# Phase 2: 設計サマリー

> タスクID: TASK-IMP-TRANSCRIPT-TO-CHAT-PROVENANCE-LINKAGE-001
> 確定日: 2026-03-22

## 1. Concern 分解（3 以下）

Phase 1 で抽出した 3 concern をそのまま設計対象とする。

| Concern | 名称                       | 設計対象                                                                   |
| ------- | -------------------------- | -------------------------------------------------------------------------- |
| C-1     | Provenance Metadata Bridge | Renderer <-> DB 間の metadata gap を埋め、provenance chip を表示可能にする |
| C-2     | Copy Operation Contract    | 3 操作それぞれの input / output / clipboard 形式を定義する                 |
| C-3     | State & Ownership          | Transcript selection / share / provenance の state 所有境界を決める        |

## 2. Concern 別設計

### C-1: Provenance Metadata Bridge

**問題**: `WorkspaceChatMessage` は `{id, role, content, timestamp}` のみで metadata を持たない。DB の `ChatMessage.metadata` に保存された provenance を Renderer に届ける bridge が必要。

**設計選択肢**:

| 案           | 方式                                                       | メリット                   | デメリット              |
| ------------ | ---------------------------------------------------------- | -------------------------- | ----------------------- |
| A            | WorkspaceChatMessage 型を拡張                              | シンプル、既存 flow に乗る | 型変更が広範囲に波及    |
| B            | 別 context (ProvenanceContext) で管理                      | 既存型に影響しない         | 新 context の学習コスト |
| **C (採用)** | WorkspaceChatMessage に optional provenance フィールド追加 | 最小変更、後方互換         | optional チェック必要   |

**採用案 C の設計**:

```typescript
// 新規型定義（packages/shared/src/types/transcript-provenance.ts）
export interface TranscriptProvenance {
  sourceType: "range" | "last-output" | "session";
  sharedAt: string; // ISO 8601
  sessionTitle: string;
  messageRange?: {
    startLine: number;
    endLine: number;
  };
  originalContent: string; // copy 元テキスト（truncated 可）
}

// WorkspaceChatMessage 型拡張
export interface WorkspaceChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: string;
  transcriptProvenance?: TranscriptProvenance; // 追加
}
```

**永続化パス**:

```
User: 3操作の1つを実行
  -> useWorkspaceChatController.shareTranscript(provenance)
  -> WorkspaceChatMessage に transcriptProvenance を設定
  -> conversationAPI.addMessage({ ..., metadata: { transcriptProvenance } })
  -> DB: ChatMessage.metadata.transcriptProvenance に保存

復元:
  -> conversationAPI.getMessages()
  -> ChatMessage.metadata.transcriptProvenance を読み取り
  -> WorkspaceChatMessage.transcriptProvenance にマッピング
  -> TranscriptProvenanceChip が表示
```

### C-2: Copy Operation Contract

**3 操作の contract**:

| 操作                           | Input                          | Clipboard 形式      | Chat 挿入方式              | Provenance sourceType |
| ------------------------------ | ------------------------------ | ------------------- | -------------------------- | --------------------- |
| OP-1: 選択範囲をチャットへ送る | ユーザー選択テキスト           | Plain text          | composer input に直接挿入  | `"range"`             |
| OP-2: 直近出力を添付           | Terminal 直近出力（最新 N 行） | Markdown code block | attachment chip として添付 | `"last-output"`       |
| OP-3: セッションを貼り付ける   | Session 全文                   | Markdown code block | attachment chip として添付 | `"session"`           |

**設計決定**:

1. **OP-1** は clipboard を経由せず、直接 Chat composer の input に挿入する（paste 操作を省略）
2. **OP-2 / OP-3** は content が長いため attachment chip として表示し、展開可能にする
3. 全操作で `TranscriptProvenance` metadata を自動付与する
4. auto-send は禁止。挿入/添付後、ユーザーが Send CTA を明示的にクリックするまで送信しない

**Simpler Alternative（不採用）**:

| 案                           | 説明                                 | 不採用理由                                   |
| ---------------------------- | ------------------------------------ | -------------------------------------------- |
| 全操作を clipboard copy のみ | 3 操作とも「コピー」して手動ペースト | provenance metadata が失われる（AC-4 違反）  |
| 全操作を attachment 統一     | 選択範囲も attachment にする         | 短いテキストを attachment にすると UX が悪い |

### C-3: State & Ownership

**State 所有マトリクス**:

| State                      | 所有者                                       | 根拠                             |
| -------------------------- | -------------------------------------------- | -------------------------------- |
| Transcript session list    | Zustand Store (workspaceSlice)               | 複数コンポーネントが参照         |
| Transcript selected range  | React local state (TranscriptPanel)          | コンポーネント固有の UI state    |
| Share operation result     | useWorkspaceChatController Hook              | Chat composer への挿入操作を管理 |
| Provenance metadata        | ChatMessage.metadata (DB)                    | 永続化が必要                     |
| Provenance chip visibility | React local state (WorkspaceChatMessageList) | dismiss は UI state              |

**設計決定**:

- Transcript selection は `TranscriptPanel` の local state（`useState`）で管理する
- Share 操作は `useWorkspaceChatController` に `shareTranscript(provenance)` メソッドを追加する
- Provenance の永続化は既存の `ChatMessage.metadata` パスを利用する（新規 IPC 不要）
- Chip の dismiss 状態は UI state のみ（DB に dismiss 状態は保存しない）

## 3. コンポーネント構成図

```
Terminal Dock
  +- TranscriptPanel (新規)
  |   +- TranscriptMessageList
  |   +- TranscriptSelectionToolbar (新規)
  |   |   +- ShareToChatButton     [OP-1: 選択範囲をチャットへ送る]
  |   |   +- AttachRecentButton    [OP-2: 直近出力を添付]
  |   |   +- PasteSessionButton    [OP-3: セッションを貼り付ける]
  |   +- TerminalHandoffCard (Task 05 で設計済み)
  |
WorkspaceChatPanel
  +- WorkspaceChatMessageList
  |   +- WorkspaceChatMessageItem
  |       +- TranscriptProvenanceChip (拡張)
  +- WorkspaceFileContextChips
  +- WorkspaceChatInput
```

## 4. 責務分離（Terminal Handoff vs Transcript Copy）

| 観点       | Terminal Handoff (Task 05)     | Transcript Copy (本タスク)               |
| ---------- | ------------------------------ | ---------------------------------------- |
| 目的       | CLI コマンドを terminal で実行 | Transcript 内容を Chat に転送            |
| トリガー   | AI が handoff を提案           | ユーザーが能動的に選択                   |
| CTA        | 「コマンドをコピー」           | 「チャットへ送る」「添付」「貼り付ける」 |
| 表示領域   | Handoff Card (inline)          | Transcript Toolbar (上部)                |
| Provenance | HandoffGuidance DTO            | TranscriptProvenance                     |
| 競合回避   | handoffGuidance != null で表示 | selection あり / session 存在で表示      |

**競合しない保証**: Handoff Card は AI 提案時のみ表示、Transcript CTA はユーザー選択時のみ有効化。同時表示される場合でも表示領域が異なるため視覚的競合なし。

## 5. Phase 3 review 観点

| 観点                   | drift リスク                                                          | blocked 条件                             |
| ---------------------- | --------------------------------------------------------------------- | ---------------------------------------- |
| C-1 の型拡張範囲       | WorkspaceChatMessage の変更が他コンポーネントに波及する可能性         | 型変更のコンパイル影響を Phase 4 で調査  |
| C-2 の attachment 形式 | OP-2/OP-3 の Markdown code block が Chat 表示で崩れる可能性           | 手動テスト（Phase 11）で確認             |
| C-3 の Store 追加      | workspaceSlice に transcript session list を追加する場合の P31 リスク | 個別セレクタで回避（P31/P48 対策）       |
| 責務境界の曖昧さ       | Handoff Card と Transcript CTA の表示条件が将来衝突する可能性         | 表示条件を enum で管理（Phase 5 で実装） |
