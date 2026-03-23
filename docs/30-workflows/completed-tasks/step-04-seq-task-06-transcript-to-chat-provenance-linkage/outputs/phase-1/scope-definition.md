# Phase 1: スコープ定義

> タスクID: TASK-IMP-TRANSCRIPT-TO-CHAT-PROVENANCE-LINKAGE-001
> 確定日: 2026-03-22

## 1. 対象スコープ

### 1.1 対象操作（3 操作）

| ID   | 操作名                   | 説明                                                   | ソース              | デスティネーション         |
| ---- | ------------------------ | ------------------------------------------------------ | ------------------- | -------------------------- |
| OP-1 | 選択範囲をチャットへ送る | Transcript 内のテキスト選択範囲を Chat composer に挿入 | Transcript 選択範囲 | Chat composer input        |
| OP-2 | 直近出力を添付           | Terminal の直近出力を Chat の attachment として添付    | Terminal 直近出力   | Chat attachment area       |
| OP-3 | セッションを貼り付ける   | Terminal session 全体を Chat に貼り付け                | Session 全体        | Chat composer / attachment |

### 1.2 対象コンポーネント

| コンポーネント           | 責務                                                       |
| ------------------------ | ---------------------------------------------------------- |
| TranscriptProvenanceChip | copy 後の出所表示（source / sharedAt / dismiss / inspect） |
| TranscriptPanel          | Transcript 表示 + 3 操作の CTA 提供                        |
| WorkspaceChatPanel       | copy 受信側の provenance chip 表示                         |
| WorkspaceChatMessage 型  | metadata 拡張（provenance フィールド追加）                 |

### 1.3 対象契約

| 契約                         | 内容                                                                                             |
| ---------------------------- | ------------------------------------------------------------------------------------------------ |
| Provenance metadata contract | source type / sharedAt / sessionTitle / messageRange の構造定義                                  |
| 状態遷移契約                 | TranscriptVisible -> RangeSelected -> ShareReady -> ChatAttached/ChatPasted -> ProvenanceVisible |
| CTA 契約                     | primary CTA 1 個 + secondary CTA 1 個の上限遵守                                                  |

## 2. 除外スコープ

| 除外項目                         | 理由                                                                               |
| -------------------------------- | ---------------------------------------------------------------------------------- |
| Transcript の自動要約            | UI/UX 正本で禁止（no auto-send boundary を strict に維持）                         |
| Hidden parsing / 自動 message 化 | Terminal surface は user-operated workspace であり hidden automation lane ではない |
| IPC チャネル新設                 | 設計タスクのため IPC 実装は後続実装タスクで対応                                    |
| DB スキーマ変更                  | ChatMessage 型は既に metadata フィールドを持つため、スキーマ変更不要               |
| SelectedFile source 拡張         | 本タスクのスコープ外（未タスク候補として検出）                                     |
| Terminal session 管理の実装      | Task 05 で設計済み、本タスクは provenance linkage のみ                             |

## 3. 依存タスク

| タスクID                                           | タスク名                          | 状態            | 本タスクへの影響                                    |
| -------------------------------------------------- | --------------------------------- | --------------- | --------------------------------------------------- |
| TASK-IMP-CHAT-WORKSPACE-GUIDANCE-ACTION-WIRING-001 | Task 04: Chat Workspace Guidance  | Phase 1-12 完了 | useBlockedGuidance Hook / BLOCKED_GUIDANCE_MAP 確定 |
| TASK-IMP-TERMINAL-HANDOFF-SURFACE-REALIZATION-001  | Task 05: Terminal Handoff Surface | Phase 1-12 完了 | Launcher / Handoff Card / Consumer Adapter 確定     |

### 3.1 Task 04 から受け取るインターフェース

- `useBlockedGuidance` Hook: reason -> guidance の型安全変換
- `BlockedReason` 型: 6 種類の blocked reason
- `GuidanceConfig`: message / variant / primaryAction / secondaryAction

### 3.2 Task 05 から受け取るインターフェース

- `TerminalHandoffCard` コンポーネント（organisms 層）
- `HandoffGuidance` DTO: terminalCommand / contextSummary / reason
- Terminal Launcher: App Shell Header 右上に常駐
- Consumer Adapter パターン: `toHandoffGuidance` 変換関数

## 4. 責務境界

```
[Terminal Surface]          [本タスク責務]              [Chat Surface]
 ┌──────────────┐    ┌──────────────────────┐    ┌──────────────────┐
 │ Terminal Dock │───→│ 3 操作 CTA           │───→│ Chat Composer    │
 │ Transcript    │    │ Provenance Metadata  │    │ Provenance Chip  │
 │ Session       │    │ State Transition     │    │ Message Metadata │
 └──────────────┘    └──────────────────────┘    └──────────────────┘
   Task 05 所有         Task 06 所有                Task 04/06 共有
```

## 5. Phase 2 への引継ぎ concern

| #   | concern               | Phase 2 での設計対象                                                                  |
| --- | --------------------- | ------------------------------------------------------------------------------------- |
| C-1 | Renderer metadata gap | WorkspaceChatMessage に provenance フィールドを追加する方法の設計                     |
| C-2 | Copy contract 形式    | 3 操作それぞれの clipboard / attachment 形式（JSON / Markdown / Plain text）の決定    |
| C-3 | State ownership       | Transcript selection state と provenance state の所有者決定（Hook vs Store vs Props） |
