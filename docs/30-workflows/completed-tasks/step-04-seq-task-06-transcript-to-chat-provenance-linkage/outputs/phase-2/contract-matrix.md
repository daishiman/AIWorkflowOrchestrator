# Phase 2: 契約マトリクス

> タスクID: TASK-IMP-TRANSCRIPT-TO-CHAT-PROVENANCE-LINKAGE-001
> 確定日: 2026-03-22

## 1. State 契約

| State                   | 型                                                     | 所有者                              | 初期値      | 更新トリガー               |
| ----------------------- | ------------------------------------------------------ | ----------------------------------- | ----------- | -------------------------- |
| transcriptSessions      | `TranscriptSession[]`                                  | workspaceSlice                      | `[]`        | Terminal session 開始/終了 |
| selectedRange           | `{ start: number; end: number; text: string } \| null` | TranscriptPanel (useState)          | `null`      | ユーザーテキスト選択       |
| shareState              | `"idle" \| "sharing" \| "shared" \| "error"`           | useWorkspaceChatController          | `"idle"`    | share 操作実行             |
| provenanceChipDismissed | `Set<string>`                                          | WorkspaceChatMessageList (useState) | `new Set()` | ユーザー dismiss           |

## 2. Action 契約

| Action                | 引数                                           | 戻り値 | 副作用                                                |
| --------------------- | ---------------------------------------------- | ------ | ----------------------------------------------------- |
| shareSelectionToChat  | `{ text: string; sessionTitle: string }`       | `void` | Chat composer に text 挿入 + provenance 設定          |
| attachRecentOutput    | `{ sessionTitle: string; lineCount?: number }` | `void` | Chat attachment に直近出力追加 + provenance 設定      |
| pasteSession          | `{ sessionTitle: string; content: string }`    | `void` | Chat attachment に session 全文追加 + provenance 設定 |
| dismissProvenanceChip | `{ messageId: string }`                        | `void` | UI 上の chip を非表示（metadata は保持）              |

## 3. Ownership 契約

| 層                         | 所有リソース                          | 責務               |
| -------------------------- | ------------------------------------- | ------------------ |
| TranscriptPanel            | Transcript 表示 + 選択 + CTA          | 3 操作の入口提供   |
| useWorkspaceChatController | share 操作の実行 + Chat composer 操作 | 操作の coordinator |
| WorkspaceChatMessageList   | message 表示 + provenance chip        | 出所表示の出口     |
| ChatMessage.metadata       | provenance の永続化                   | 監査証跡の保存     |

## 4. DTO 契約

### 4.1 TranscriptProvenance

```typescript
export interface TranscriptProvenance {
  sourceType: "range" | "last-output" | "session";
  sharedAt: string; // ISO 8601
  sessionTitle: string;
  messageRange?: {
    startLine: number;
    endLine: number;
  };
  originalContent: string; // copy 元テキスト（最大10,000文字、超過分は切り捨て）
}
```

### 4.2 TranscriptSession（参考: workspaceSlice 管理）

```typescript
export interface TranscriptSession {
  id: string;
  title: string;
  startedAt: string; // ISO 8601
  endedAt?: string; // ISO 8601, session 終了時
  messages: TranscriptMessage[];
}

export interface TranscriptMessage {
  index: number;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: string;
}
```

### 4.3 WorkspaceChatMessage（拡張後）

```typescript
export interface WorkspaceChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: string;
  transcriptProvenance?: TranscriptProvenance; // 新規追加
}
```

## 5. CTA 契約

| Surface                          | Primary CTA                  | Secondary CTA              | 表示条件                         |
| -------------------------------- | ---------------------------- | -------------------------- | -------------------------------- |
| TranscriptPanel (selection あり) | 「選択範囲をチャットへ送る」 | なし                       | selectedRange != null            |
| TranscriptPanel (selection なし) | 「直近出力を添付」           | 「セッションを貼り付ける」 | session 存在                     |
| TranscriptProvenanceChip         | inspect（元位置へ移動）      | dismiss（非表示）          | provenance != null && !dismissed |

**i18n keys**:

| key                        | 日本語                   | 英語                    |
| -------------------------- | ------------------------ | ----------------------- |
| `cta.shareSelectionToChat` | 選択範囲をチャットへ送る | Share selection to chat |
| `cta.attachRecentOutput`   | 直近出力を添付           | Attach recent output    |
| `cta.pasteSession`         | セッションを貼り付ける   | Paste session           |
| `cta.inspectProvenance`    | 元の位置を表示           | Show original location  |
| `cta.dismissProvenance`    | 閉じる                   | Dismiss                 |

## 6. 状態遷移契約

```
[TranscriptVisible]
    |
    | ユーザーがテキスト選択
    v
[RangeSelected]
    |
    | OP-1 CTA クリック
    v
[ShareReady] ---> shareState = "sharing"
    |
    | 操作完了
    v
[ChatAttached / ChatPasted]
    |
    | Chat 側に反映
    v
[ProvenanceVisible]
    |
    | ユーザー dismiss
    v
[ProvenanceDismissed]（UI 非表示、metadata 保持）
```

**alternative path（OP-2 / OP-3）**:

```
[TranscriptVisible]
    |
    | OP-2 or OP-3 CTA クリック（selection 不要）
    v
[ShareReady] ---> shareState = "sharing"
    |
    v
[ChatAttached]
    |
    v
[ProvenanceVisible]
```

## 7. Integration 契約（Phase 3 review 用）

| 統合ポイント                                       | 検証方法                                                            |
| -------------------------------------------------- | ------------------------------------------------------------------- |
| TranscriptPanel -> useWorkspaceChatController      | shareSelectionToChat / attachRecentOutput / pasteSession の呼び出し |
| useWorkspaceChatController -> ChatMessage.metadata | transcriptProvenance の保存と復元                                   |
| ChatMessage.metadata -> TranscriptProvenanceChip   | provenance chip の表示と dismiss                                    |
| Terminal Handoff Card (Task 05) vs Transcript CTA  | 表示領域と条件の非競合                                              |
