# UT-CHATPANEL-REFACTOR-003 インラインセレクタ置換 + useStreamingChat useMemo 適用

## メタ情報

| 項目         | 内容                                                                          |
| ------------ | ----------------------------------------------------------------------------- |
| タスクID     | UT-CHATPANEL-REFACTOR-003                                                     |
| タスク名     | インラインセレクタ置換 + useStreamingChat useMemo 適用                        |
| 分類         | リファクタリング                                                              |
| 対象機能     | ChatPanel パフォーマンス最適化                                                |
| 優先度       | 低                                                                            |
| 見積もり規模 | 小規模                                                                        |
| ステータス   | 未実施                                                                        |
| 発見元       | TASK-IMP-CHATPANEL-REAL-AI-CHAT-001 エレガンスレビュー NOTE-5/6（2026-03-18） |
| 発見日       | 2026-03-18                                                                    |

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

ChatPanel.tsx が `useAppStore((s) => s.xxx)` のインラインセレクタを使用しており、P31/P48 準拠の個別セレクタ（`useChatPanelStatus()` 等）が `store/index.ts` に定義済みであるにもかかわらず使用されていない。また `useStreamingChat` の戻り値 `{ state, actions }` が毎レンダーで新オブジェクトを生成し、不要な再レンダーの原因になっている。

### 1.2 問題点・課題

- インラインセレクタは P31 無限ループリスクがある（合成 Hook パターンではないが、将来的にフィルタ/マップを含む派生セレクタに変更された場合に P48 リスク）
- `useStreamingChat` が `{ state, actions }` を毎回生成するため、この hook を使用するコンポーネントが不要に再レンダーされる
- コードベースの一貫性が損なわれている（個別セレクタが定義済みなのに使われていない）

### 1.3 放置した場合の影響

パフォーマンスの微小な低下。P31/P48 リスクの潜在化。コードレビュー時の混乱。

## 2. 何を達成するか（What）

### 2.1 目的

ChatPanel.tsx のインラインセレクタを個別セレクタに置換し、useStreamingChat の戻り値に useMemo を適用する。

### 2.2 受入基準

- [ ] ChatPanel.tsx 内に `useAppStore((s) => s.xxx)` パターンが 0 箇所
- [ ] 全て `store/index.ts` の個別セレクタ経由に置換されている
- [ ] useStreamingChat の戻り値が useMemo でメモ化されている
- [ ] 既存テスト 139 件が全て PASS
- [ ] `tsc --noEmit` PASS

## 3. どのように実施するか（How）

### 3.1 対象ファイル

- `apps/desktop/src/renderer/components/chat/ChatPanel.tsx`（インラインセレクタ置換）
- `apps/desktop/src/renderer/hooks/useStreamingChat.ts`（useMemo 適用）

### 3.2 実装方針

```typescript
// Before (P31/P48 リスク)
const chatPanelStatus = useAppStore((s) => s.chatPanelStatus);
const messages = useAppStore((s) => s.chatMessages);

// After (個別セレクタ)
const chatPanelStatus = useChatPanelStatus();
const messages = useChatMessages();
```

```typescript
// useStreamingChat.ts - useMemo 適用
const state = useMemo(
  () => ({ isStreaming, streamingContent, error }),
  [isStreaming, streamingContent, error],
);
const actions = useMemo(
  () => ({ startStream, cancelStream }),
  [startStream, cancelStream],
);
return { state, actions };
```

## 3.5 実装課題と解決策（親タスクからの教訓）

| 課題                                        | 発見経緯                                 | 解決策                          | 教訓                                                             |
| ------------------------------------------- | ---------------------------------------- | ------------------------------- | ---------------------------------------------------------------- |
| streaming disabled/canSubmit の二重制御混乱 | Phase 6 テスト EC-06 で混乱              | 各制御の設計意図を JSDoc に明記 | セレクタ置換時に、各セレクタの用途を JSDoc に明記する            |
| P31 Zustand Store Hooks 無限ループ          | 合成 Hook が毎回新しいオブジェクトを返す | 個別セレクタベースに再設計      | インラインセレクタも個別セレクタに置換することで一貫性を確保する |

**固有の教訓**:

- P31 は合成 Hook だけでなく、インラインセレクタが将来的に派生セレクタ（.filter()/.map()）に変更された場合にも発生しうる。予防的に個別セレクタへ置換する
- useStreamingChat の useMemo 適用時、actions の中に useCallback で安定化されていない関数がある場合は先に useCallback 適用が必要

## 4. 参照

- エレガンスレビュー NOTE-5/6: `outputs/verification-report.md`
- P31: `.claude/rules/06-known-pitfalls.md`（Zustand Store Hooks 無限ループ）
- P48: `.claude/rules/06-known-pitfalls.md`（useShallow 未適用）
- Store 設計: `.claude/skills/aiworkflow-requirements/references/arch-state-management-core.md`
