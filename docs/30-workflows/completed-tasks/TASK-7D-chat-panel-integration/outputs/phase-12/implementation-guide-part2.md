# TASK-7D 実装ガイド Part 2: 技術者向け詳細説明

- **日付**: 2026-01-30
- **対象読者**: 技術者レベル
- **タスク**: TASK-7D ChatPanel統合

---

## 1. 概要

TASK-7D は ChatPanel 統合タスクである。SkillSelector、SkillStreamingView、SkillImportDialog、PermissionDialog を統合したチャットパネルコンポーネントを構築し、スキル実行のストリーミング表示・権限確認・インポートフローを一つの画面に集約する。

---

## 2. インターフェース/型定義

```typescript
// ChatPanel
interface ChatPanelProps {
  onImportRequest?: (skill: SkillMetadata) => void;
}
interface ChatPanelHandle {
  handleImportRequest: (skill: SkillMetadata) => void;
}

// SkillStreamingView
interface SkillStreamingViewProps {
  skillName: string;
  messages: SkillStreamMessage[];
  status: SkillExecutionStatus | null;
}

// SkillStreamMessage (discriminated union)
type SkillStreamMessage =
  | {
      executionId: string;
      type: "assistant";
      content: { text: string; isPartial: boolean };
      timestamp: number;
    }
  | {
      executionId: string;
      type: "tool_use";
      content: {
        toolName: string;
        args: Record<string, unknown>;
        toolUseId: string;
      };
      timestamp: number;
    }
  | {
      executionId: string;
      type: "tool_result";
      content: { toolUseId: string; success: boolean; error?: string };
      timestamp: number;
    }
  | {
      executionId: string;
      type: "error";
      content: { code: string; message: string; retryable: boolean };
      timestamp: number;
    }
  | {
      executionId: string;
      type: "status";
      content: { status: string };
      timestamp: number;
    };

// SkillExecutionStatus
type SkillExecutionStatus =
  | "idle"
  | "running"
  | "permission_pending"
  | "completed"
  | "cancelled"
  | "error";
```

---

## 3. コンポーネント構成

### ChatPanel (forwardRef)

統合コンテナコンポーネント。`useAppStore()` で状態を取得し、`useState` で `importDialogSkill` を管理する。`useImperativeHandle` により `handleImportRequest` メソッドを外部に公開する。

### SkillStreamingView (React.memo)

ストリーミング表示コンポーネント。Props 経由でデータを受け取る。内部で `useAppStore((s) => s.abortExecution)` により中断関数のみを取得する。

### StatusBadge

ステータスバッジコンポーネント。`DisplayableStatus = Exclude<SkillExecutionStatus, "idle">` 型を使用し、`STATUS_CONFIG` マップで各ステータスの表示設定を管理する。

### StreamMessageItem

メッセージアイテムコンポーネント。discriminated union の `type` フィールドで switch 分岐し、各メッセージタイプに応じた表示を行う。

### ToolExecutionHistory

ツール履歴コンポーネント。HTML の `details/summary` で折りたたみ表示を実現し、`tool_use` と `tool_result` メッセージのみをフィルタリングして表示する。

---

## 4. データフロー図

```
useAppStore() → {selectedSkillName, streamingMessages, isExecuting, skillExecutionStatus, fetchSkills}
     ↓
ChatPanel (forwardRef)
     ├── SkillSelector (内部でuseSkillStore使用)
     ├── SkillStreamingView ← {skillName, messages, status}
     │   ├── StatusBadge ← {status}
     │   ├── StreamMessageItem[] ← {message} (discriminated union switch)
     │   └── ToolExecutionHistory ← {messages} (filter: tool_use | tool_result)
     ├── SkillImportDialog ← {skill: importDialogSkill, isOpen: true, onClose}
     └── PermissionDialog (Store-direct pattern, no props)
```

---

## 5. Store 接続パターン

| コンポーネント     | パターン             | 詳細                                                      |
| ------------------ | -------------------- | --------------------------------------------------------- |
| ChatPanel          | individual selectors | `useAppStore` で個別セレクタを使用し、再レンダーを最適化  |
| SkillStreamingView | single selector      | `useAppStore((s) => s.abortExecution)` - 中断関数のみ取得 |
| PermissionDialog   | Store-direct pattern | 内部で `useAppStore` を直接使用、Props 不要               |

### ChatPanel の Store 接続例

```typescript
const selectedSkillName = useAppStore((s) => s.selectedSkillName);
const streamingMessages = useAppStore((s) => s.streamingMessages);
const isExecuting = useAppStore((s) => s.isExecuting);
const skillExecutionStatus = useAppStore((s) => s.skillExecutionStatus);
const fetchSkills = useAppStore((s) => s.fetchSkills);
```

個別セレクタを使うことで、関係のない状態変更時に不要な再レンダーが発生しない。

---

## 6. 条件付きレンダリング

| コンポーネント     | 条件                                   | 説明                                             |
| ------------------ | -------------------------------------- | ------------------------------------------------ |
| SkillStreamingView | `isExecuting && selectedSkillName`     | 両方が truthy の場合のみ表示                     |
| SkillImportDialog  | `importDialogSkill !== null`           | インポート対象スキルが設定されている場合のみ表示 |
| StatusBadge        | `status !== null && status !== "idle"` | idle 以外のアクティブステータス時のみ表示        |
| Abort ボタン       | `status === "running"`                 | 実行中のみ中断ボタンを表示                       |

---

## 7. エラーハンドリング

| シナリオ                       | 処理                                   | 影響                                |
| ------------------------------ | -------------------------------------- | ----------------------------------- |
| fetchSkills 失敗               | useEffect 内で呼出、失敗してもキャッチ | UI 影響なし（スキル一覧が空のまま） |
| StreamMessageItem unknown type | default case で `null` を返す          | 不明なメッセージタイプは非表示      |
| ToolExecutionHistory 0 件      | `null` を返す                          | ツール履歴セクション自体が非表示    |
| StatusBadge unknown status     | config lookup 失敗時 `null` を返す     | バッジが非表示になる                |

---

## 8. パフォーマンス最適化

### React.memo の適用

`SkillStreamingView` に `React.memo` を適用し、`messages` 配列が変更された場合のみ再レンダーする。

### 個別セレクタ

`useAppStore` で個別にセレクタを指定することで、不要な再レンダーを防止する。全状態をまとめて取得すると、無関係な状態変更でも再レンダーが発生するため、個別取得が重要。

### 安定した key 属性

リストレンダリングでは `${msg.timestamp}-${index}` を key として使用する。タイムスタンプとインデックスの組み合わせにより、安定したキーを提供する。

---

## 9. テスト戦略

### Store mock パターン

```typescript
vi.mock("../../../store", () => ({
  useAppStore: vi.fn(),
}));

// セレクタコールバックパターン
const mockUseAppStore = vi.mocked(useAppStore);
mockUseAppStore.mockImplementation((selector: any) => {
  const state = {
    selectedSkillName: "test-skill",
    streamingMessages: [],
    isExecuting: false,
    skillExecutionStatus: null,
    fetchSkills: vi.fn(),
    abortExecution: vi.fn(),
  };
  return selector ? selector(state) : state;
});
```

### Component mock パターン

```typescript
vi.mock("../../skill", () => ({
  SkillSelector: () => <div data-testid="skill-selector" />,
  SkillStreamingView: (props: any) => (
    <div data-testid="skill-streaming-view">{props.skillName}</div>
  ),
}));
vi.mock("../../skill/SkillImportDialog", () => ({
  SkillImportDialog: (props: any) =>
    props.isOpen ? <div data-testid="skill-import-dialog" /> : null,
}));
vi.mock("../PermissionDialog", () => ({
  PermissionDialog: () => <div data-testid="permission-dialog" />,
}));
```

### テストデータファクトリ

```typescript
const createAssistantMessage = (
  text: string,
  isPartial = false,
): SkillStreamMessage => ({
  executionId: "exec-1",
  type: "assistant",
  content: { text, isPartial },
  timestamp: Date.now(),
});

const createToolUseMessage = (toolName: string): SkillStreamMessage => ({
  executionId: "exec-1",
  type: "tool_use",
  content: { toolName, args: {}, toolUseId: `tool-${toolName}` },
  timestamp: Date.now(),
});

const createToolResultMessage = (
  toolUseId: string,
  success = true,
): SkillStreamMessage => ({
  executionId: "exec-1",
  type: "tool_result",
  content: { toolUseId, success },
  timestamp: Date.now(),
});

const createErrorMessage = (message: string): SkillStreamMessage => ({
  executionId: "exec-1",
  type: "error",
  content: { code: "ERR_001", message, retryable: false },
  timestamp: Date.now(),
});

const createStatusMessage = (status: string): SkillStreamMessage => ({
  executionId: "exec-1",
  type: "status",
  content: { status },
  timestamp: Date.now(),
});
```

### forwardRef テスト

```typescript
it("handleImportRequest を ref 経由で呼び出せる", () => {
  const ref = React.createRef<ChatPanelHandle>();
  render(<ChatPanel ref={ref} />);

  act(() => {
    ref.current?.handleImportRequest(mockSkillMetadata);
  });

  expect(screen.getByTestId("skill-import-dialog")).toBeInTheDocument();
});
```

---

## 10. ファイル一覧

| ファイル                                      | 行数 | 種別            |
| --------------------------------------------- | ---- | --------------- |
| `components/chat/ChatPanel.tsx`               | 131  | Implementation  |
| `components/skill/SkillStreamingView.tsx`     | 252  | Implementation  |
| `components/skill/index.ts`                   | 7    | Export barrel   |
| `chat/__tests__/ChatPanel.test.tsx`           | ~270 | Test (15 cases) |
| `skill/__tests__/SkillStreamingView.test.tsx` | ~563 | Test (33 cases) |

### ディレクトリ構造

```
src/renderer/components/
├── chat/
│   ├── ChatPanel.tsx
│   ├── __tests__/
│   │   └── ChatPanel.test.tsx
│   └── ...
└── skill/
    ├── SkillStreamingView.tsx
    ├── index.ts
    ├── __tests__/
    │   └── SkillStreamingView.test.tsx
    └── ...
```
