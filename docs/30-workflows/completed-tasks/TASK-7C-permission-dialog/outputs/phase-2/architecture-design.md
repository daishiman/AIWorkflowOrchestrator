# Phase 2: アーキテクチャ設計 - PermissionDialog コンポーネント

## 1. コンポーネント階層設計

```
PermissionDialog (ルートコンポーネント - Store直結)
├── Modal Overlay (fixed inset-0 bg-black/50)
├── Dialog Container (白背景、角丸、シャドウ、max-w-lg)
│   ├── DialogHeader
│   │   ├── WarningIcon (⚠️)
│   │   ├── Title (h2: "権限の確認")
│   │   └── CloseButton (✕ → handleDeny)
│   ├── DialogContent (px-6 py-4)
│   │   ├── Description (説明テキスト)
│   │   ├── ToolInfo (ツール名バッジ表示)
│   │   ├── ArgsDisplay (formatArgs による引数フォーマット表示)
│   │   ├── ReasonDisplay (reason が存在する場合のみ表示)
│   │   └── RememberCheckbox (自動許可チェックボックス)
│   └── DialogFooter (flex justify-end gap-3)
│       ├── DenyButton ("拒否" → handleDeny)
│       ├── ApproveOnceButton ("1回許可" → handleApproveOnce)
│       └── ApproveButton ("許可" → handleApprove)
```

## 2. 状態管理設計

### 2.1 Store接続（外部状態）

```typescript
// useAppStore() から取得
const { pendingPermission, respondToSkillPermission } = useAppStore();
```

### 2.2 内部状態

```typescript
const [rememberChoice, setRememberChoice] = useState(false);
```

### 2.3 アクションハンドラ

```typescript
const handleApprove = () => {
  respondToSkillPermission(true, rememberChoice);
  setRememberChoice(false);
};

const handleApproveOnce = () => {
  respondToSkillPermission(true, false);
  setRememberChoice(false);
};

const handleDeny = () => {
  respondToSkillPermission(false, false);
  setRememberChoice(false);
};
```

### 2.4 状態遷移図

```
[非表示] ─ pendingPermission が設定される ─→ [ダイアログ表示]
    ↑                                              │
    │                                    ┌─────────┼─────────┐
    │                                    │         │         │
    │                              [拒否ボタン] [1回許可] [許可ボタン]
    │                                    │         │         │
    │                                    ▼         ▼         ▼
    │                              respondTo  respondTo  respondTo
    │                              (false,    (true,     (true,
    │                               false)    false)     remember)
    │                                    │         │         │
    └──── pendingPermission が null ──────┴─────────┴─────────┘
                                    + rememberChoice リセット
```

## 3. アクセシビリティ設計

### 3.1 ARIA属性設計

| 要素         | 属性               | 値                         |
| ------------ | ------------------ | -------------------------- |
| ダイアログ   | `role`             | `"dialog"`                 |
| ダイアログ   | `aria-modal`       | `"true"`                   |
| ダイアログ   | `aria-labelledby`  | `"{uniqueId}-title"`       |
| ダイアログ   | `aria-describedby` | `"{uniqueId}-description"` |
| タイトルh2   | `id`               | `"{uniqueId}-title"`       |
| 説明テキスト | `id`               | `"{uniqueId}-description"` |
| 閉じるボタン | `aria-label`       | `"閉じる"`                 |

### 3.2 フォーカス管理

```
初期フォーカス → 「許可」ボタン（主要アクション）
Tab順序: チェックボックス → 拒否 → 1回許可 → 許可 → 閉じるボタン → （循環）
Escape → handleDeny() 実行
```

### 3.3 キーボードイベント

| キー        | 動作                                        |
| ----------- | ------------------------------------------- |
| Escape      | `handleDeny()` を実行                       |
| Tab         | 次のフォーカス可能要素へ移動（循環）        |
| Shift+Tab   | 前のフォーカス可能要素へ移動（循環）        |
| Enter/Space | フォーカス中のボタン/チェックボックスを実行 |

## 4. スタイリング設計

### 4.1 レイアウト

| 要素           | Tailwindクラス                                                      |
| -------------- | ------------------------------------------------------------------- |
| オーバーレイ   | `fixed inset-0 bg-black/50 flex items-center justify-center z-50`   |
| ダイアログ本体 | `bg-white rounded-lg shadow-xl w-full max-w-lg overflow-hidden`     |
| ヘッダー       | `flex justify-between items-center px-6 py-4 border-b bg-yellow-50` |
| コンテンツ     | `px-6 py-4`                                                         |
| ツール情報     | `bg-gray-50 rounded-lg p-4 mb-4`                                    |
| 引数表示       | `mt-1 p-2 bg-gray-100 rounded text-xs overflow-x-auto`              |
| フッター       | `flex justify-end gap-3 px-6 py-4 border-t bg-gray-50`              |

### 4.2 ボタンスタイル

| ボタン  | Tailwindクラス                                                         |
| ------- | ---------------------------------------------------------------------- |
| 拒否    | `px-4 py-2 text-red-600 border border-red-200 rounded hover:bg-red-50` |
| 1回許可 | `px-4 py-2 text-gray-700 border rounded hover:bg-gray-100`             |
| 許可    | `px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700`           |

## 5. formatArgs ヘルパー関数設計

```typescript
function formatArgs(args: Record<string, unknown>): string {
  // 1. Bashコマンドの場合: args.command を直接返す
  if (args.command && typeof args.command === "string") {
    return args.command;
  }
  // 2. ファイルパスの場合: args.path を直接返す
  if (args.path && typeof args.path === "string") {
    return args.path;
  }
  // 3. その他: JSONフォーマット
  return JSON.stringify(args, null, 2);
}
```

### 入出力例

| 入力                            | 出力                                        |
| ------------------------------- | ------------------------------------------- |
| `{ command: "ls -la" }`         | `"ls -la"`                                  |
| `{ command: "npm install" }`    | `"npm install"`                             |
| `{ path: "/tmp/file.txt" }`     | `"/tmp/file.txt"`                           |
| `{ path: "/home/user/doc.md" }` | `"/home/user/doc.md"`                       |
| `{ query: "test", limit: 10 }`  | `'{\n  "query": "test",\n  "limit": 10\n}'` |

## 6. 統合テスト連携

| カテゴリ     | 確認内容                                                         |
| ------------ | ---------------------------------------------------------------- |
| 状態同期     | useAppStore() からの pendingPermission 取得が正常に動作する      |
| データフロー | respondToSkillPermission の引数が正しく Store → IPC に伝播される |
| エラー処理   | pendingPermission の型が不正な場合のフォールバック動作           |
