# Phase 2: 設計 - PermissionDialog コンポーネント

## メタ情報

| 項目      | 値                                      |
| --------- | --------------------------------------- |
| Phase     | 2                                       |
| Phase名   | 設計                                    |
| カテゴリ  | 設計                                    |
| Feature   | skill-import-agent-system               |
| Task      | TASK-7C PermissionDialog コンポーネント |
| 前提Phase | Phase 1（要件定義）                     |
| 次Phase   | Phase 3（設計レビューゲート）           |
| 作成日    | 2026-01-30                              |

## 目的

Phase 1で定義した機能要件・非機能要件に基づき、PermissionDialogコンポーネントの詳細設計（コンポーネント構造、状態管理、アクセシビリティ設計、スタイリング設計）を行う。

## 実行タスク

### Task 1: コンポーネントアーキテクチャ設計

**目的**: PermissionDialogのコンポーネント階層と責務を設計する

**手順**:

1. Phase 1の要件定義書を読む
2. 既存の `PermissionDialog.tsx`（`components/Permission/`）のアーキテクチャを確認する
3. 以下のコンポーネント構造を設計する:

```
PermissionDialog (ルートコンポーネント)
├── Modal Overlay (bg-black/50 固定オーバーレイ)
├── Dialog Container (白背景、角丸、シャドウ)
│   ├── DialogHeader (警告アイコン + タイトル + 閉じるボタン)
│   ├── DialogContent
│   │   ├── Description (説明テキスト)
│   │   ├── ToolInfo (ツール名表示)
│   │   ├── ArgsDisplay (引数フォーマット表示)
│   │   ├── ReasonDisplay (理由表示 - 条件付き)
│   │   └── RememberCheckbox (自動許可チェックボックス)
│   └── DialogFooter (アクションボタン群)
│       ├── DenyButton (拒否)
│       ├── ApproveOnceButton (1回許可)
│       └── ApproveButton (許可)
```

4. Propsインターフェースを定義する:

```typescript
// PermissionDialog はStore直結のため、Propsは不要
// useAppStore() から pendingPermission と respondToPermission を取得

// 内部で使用するヘルパー関数
function formatArgs(args: Record<string, unknown>): string;
```

### Task 2: 状態管理設計

**目的**: コンポーネント内部状態とStoreとの接続を設計する

**手順**:

1. `skillSlice.ts` の `pendingPermission` と `respondToSkillPermission` を確認する
2. 内部状態を設計する:

```typescript
// 内部状態
const [rememberChoice, setRememberChoice] = useState(false);

// Store接続
const { pendingPermission, respondToSkillPermission } = useAppStore();
// 注: タスク定義では respondToPermission と記載されているが、
// 実際のStore実装は respondToSkillPermission

// アクションハンドラ
const handleApprove = () => {
  respondToSkillPermission(true, rememberChoice);
  setRememberChoice(false); // リセット
};

const handleApproveOnce = () => {
  respondToSkillPermission(true, false);
  setRememberChoice(false); // リセット
};

const handleDeny = () => {
  respondToSkillPermission(false, false);
  setRememberChoice(false); // リセット
};
```

3. 状態遷移図:

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

### Task 3: アクセシビリティ設計

**目的**: WCAG 2.1 AA準拠のアクセシビリティ実装を設計する

**手順**:

1. 既存 `PermissionDialog.tsx` のアクセシビリティ実装を参考にする
2. 以下を設計する:

**ARIA属性設計**:

| 要素         | 属性               | 値                         |
| ------------ | ------------------ | -------------------------- |
| ダイアログ   | `role`             | `"dialog"`                 |
| ダイアログ   | `aria-modal`       | `"true"`                   |
| ダイアログ   | `aria-labelledby`  | `"{uniqueId}-title"`       |
| ダイアログ   | `aria-describedby` | `"{uniqueId}-description"` |
| タイトルh2   | `id`               | `"{uniqueId}-title"`       |
| 説明テキスト | `id`               | `"{uniqueId}-description"` |
| 閉じるボタン | `aria-label`       | `"閉じる"`                 |

**フォーカス管理**:

```
初期フォーカス → 「許可」ボタン（主要アクション）
Tab順序: チェックボックス → 拒否 → 1回許可 → 許可 → （循環）
Escape → handleDeny() 実行
```

**キーボードイベント**:

| キー        | 動作                                        |
| ----------- | ------------------------------------------- |
| Escape      | `handleDeny()` を実行                       |
| Tab         | 次のフォーカス可能要素へ移動（循環）        |
| Shift+Tab   | 前のフォーカス可能要素へ移動（循環）        |
| Enter/Space | フォーカス中のボタン/チェックボックスを実行 |

### Task 4: スタイリング設計

**目的**: Tailwind CSSを使用したビジュアルデザインを設計する

**手順**:

1. `aiworkflow-requirements: ui-ux-design-system.md` のデザイントークンを参照する
2. 以下のスタイル仕様を策定する:

**レイアウト**:

| 要素           | Tailwindクラス                                                      |
| -------------- | ------------------------------------------------------------------- |
| オーバーレイ   | `fixed inset-0 bg-black/50 flex items-center justify-center z-50`   |
| ダイアログ本体 | `bg-white rounded-lg shadow-xl w-full max-w-lg overflow-hidden`     |
| ヘッダー       | `flex justify-between items-center px-6 py-4 border-b bg-yellow-50` |
| コンテンツ     | `px-6 py-4`                                                         |
| ツール情報     | `bg-gray-50 rounded-lg p-4 mb-4`                                    |
| 引数表示       | `mt-1 p-2 bg-gray-100 rounded text-xs overflow-x-auto`              |
| フッター       | `flex justify-end gap-3 px-6 py-4 border-t bg-gray-50`              |

**ボタンスタイル**:

| ボタン  | Tailwindクラス                                                         |
| ------- | ---------------------------------------------------------------------- |
| 拒否    | `px-4 py-2 text-red-600 border border-red-200 rounded hover:bg-red-50` |
| 1回許可 | `px-4 py-2 text-gray-700 border rounded hover:bg-gray-100`             |
| 許可    | `px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700`           |

### Task 5: 引数フォーマット関数設計

**目的**: `formatArgs` ヘルパー関数の仕様を設計する

**手順**:

1. タスク定義の仕様を確認する
2. 以下のロジックを設計する:

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

**入出力例**:

| 入力                            | 出力                                        |
| ------------------------------- | ------------------------------------------- |
| `{ command: "ls -la" }`         | `"ls -la"`                                  |
| `{ command: "npm install" }`    | `"npm install"`                             |
| `{ path: "/tmp/file.txt" }`     | `"/tmp/file.txt"`                           |
| `{ path: "/home/user/doc.md" }` | `"/home/user/doc.md"`                       |
| `{ query: "test", limit: 10 }`  | `'{\n  "query": "test",\n  "limit": 10\n}'` |

## 統合テスト連携

| カテゴリ     | 確認内容                                                         |
| ------------ | ---------------------------------------------------------------- |
| 状態同期     | useAppStore() からの pendingPermission 取得が正常に動作する      |
| データフロー | respondToSkillPermission の引数が正しく Store → IPC に伝播される |
| エラー処理   | pendingPermission の型が不正な場合のフォールバック動作           |

## 多角的観点チェック（AIによる判断）

| 観点               | 該当 | 確認内容                                                |
| ------------------ | ---- | ------------------------------------------------------- |
| セキュリティ       | ○    | React のJSX自動エスケープでXSS防止を確認                |
| UI/UX（Apple HIG） | ○    | モーダルダイアログのHIG準拠（適切なボタン配置・色分け） |
| アクセシビリティ   | ○    | ARIA属性・フォーカストラップ・キーボード操作の設計      |
| アーキテクチャ     | ○    | Store直結パターンの妥当性（TASK-6-1との整合性）         |

## 成果物

| 成果物名           | パス                                     | タイプ   |
| ------------------ | ---------------------------------------- | -------- |
| アーキテクチャ設計 | `outputs/phase-2/architecture-design.md` | document |

## 完了条件

- [ ] コンポーネント階層と責務が設計されている
- [ ] 内部状態とStore接続の設計が完了している
- [ ] 状態遷移図が作成されている
- [ ] アクセシビリティ設計（ARIA属性、フォーカス管理、キーボード操作）が完了している
- [ ] Tailwind CSSを用いたスタイリング仕様が策定されている
- [ ] `formatArgs` ヘルパー関数の仕様が設計されている
- [ ] 統合テスト連携項目が確認されている
- [ ] 本Phase内の全タスクを100%実行完了

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
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/skill-import-agent-system/tasks/TASK-7C-permission-dialog --phase 2
```

## 次のPhase

Phase 3: 設計レビューゲート

`docs/30-workflows/skill-import-agent-system/tasks/TASK-7C-permission-dialog/phase-03-design-review-gate.md`

## 参照資料

| 参照資料              | パス                                                                   | 説明                     |
| --------------------- | ---------------------------------------------------------------------- | ------------------------ |
| Phase 1成果物         | `outputs/phase-1/`                                                     | 要件定義書・受け入れ基準 |
| 既存PermissionDialog  | `apps/desktop/src/renderer/components/Permission/PermissionDialog.tsx` | 参考実装                 |
| SkillSlice            | `apps/desktop/src/renderer/store/slices/skillSlice.ts`                 | Store定義                |
| UI/UXデザインシステム | `aiworkflow-requirements: ui-ux-design-system.md`                      | デザイントークン         |
| エージェント実行UI    | `aiworkflow-requirements: ui-ux-agent-execution.md`                    | ダイアログ仕様           |
