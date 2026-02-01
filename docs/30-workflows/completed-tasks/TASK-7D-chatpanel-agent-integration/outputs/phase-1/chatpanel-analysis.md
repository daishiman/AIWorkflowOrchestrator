# ChatPanel 構造分析レポート

## 基本情報

| 項目      | 内容                                                         |
| --------- | ------------------------------------------------------------ |
| ファイル  | `apps/desktop/src/renderer/components/chat/ChatPanel.tsx`    |
| 行数      | 136行                                                        |
| パターン  | forwardRef + useImperativeHandle                             |
| Store接続 | useAppStore (skillSlice経由)                                 |
| テスト    | `__tests__/ChatPanel.test.tsx` (311行, 22+テスト, 7describe) |

## コンポーネント構造

```
ChatPanel (forwardRef<ChatPanelHandle, ChatPanelProps>)
├── Header
│   └── SkillSelector (TASK-7A)
├── MessageArea
│   └── SkillStreamingView (条件付き表示)
│       ├── StatusBadge
│       ├── StreamMessageItem
│       └── ToolExecutionHistory
├── InputArea (placeholder)
└── Dialogs
    ├── SkillImportDialog (TASK-7B)
    └── PermissionDialog (TASK-7C, Store-direct)
```

## Props/Handle インターフェース

```typescript
export interface ChatPanelProps {
  onImportRequest?: (skill: SkillMetadata) => void;
}

export interface ChatPanelHandle {
  handleImportRequest: (skill: SkillMetadata) => void;
}
```

## Store依存関係

| 状態/アクション      | 型                           | 用途                          |
| -------------------- | ---------------------------- | ----------------------------- |
| selectedSkillName    | string \| null               | 選択中スキル名表示            |
| streamingMessages    | SkillStreamMessage[]         | ストリーミング表示            |
| isExecuting          | boolean                      | 実行中判定                    |
| skillExecutionStatus | SkillExecutionStatus \| null | ステータスバッジ              |
| fetchSkills          | () => Promise\<void\>        | スキル一覧取得(useEffect初回) |

## ローカルState

| State             | 型                    | 用途                        |
| ----------------- | --------------------- | --------------------------- |
| importDialogSkill | SkillMetadata \| null | SkillImportDialogの表示制御 |

## 表示条件ロジック

| 条件                                        | 表示                   |
| ------------------------------------------- | ---------------------- |
| `isExecuting && selectedSkillName`がtruthy  | SkillStreamingView表示 |
| `importDialogSkill !== null`                | SkillImportDialog表示  |
| 常時マウント (pendingPermission で自己制御) | PermissionDialog       |

## 既存テスト（ChatPanel.test.tsx）

| Describe Block             | テスト数 | 内容                                |
| -------------------------- | -------- | ----------------------------------- |
| 基本レンダリング           | 3        | SkillSelector/PermissionDialog/構造 |
| SkillStreamingView表示制御 | 3        | 条件付きレンダリング                |
| fetchSkills初期化          | 1        | useEffect初回呼び出し               |
| エッジケース               | 2        | エラー処理・初期状態                |
| アクセシビリティ           | 2        | toolbar role, aria-label            |
| SkillImportDialog統合      | 4        | ref handler, callbacks              |
| **合計**                   | **15+**  |                                     |

## 関連テスト（StreamingMessage.test.tsx）

- 513行、55+テストケース
- TC-UI-001〜011: レンダリング・キャンセル・a11y・境界値
- ChatInput拡張テストを含む
