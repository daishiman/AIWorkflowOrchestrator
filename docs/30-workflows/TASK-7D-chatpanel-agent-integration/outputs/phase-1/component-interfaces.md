# コンポーネントインターフェース一覧

## 1. SkillSelector (TASK-7A)

| 項目     | 内容                                                           |
| -------- | -------------------------------------------------------------- |
| ファイル | `apps/desktop/src/renderer/components/skill/SkillSelector.tsx` |
| 行数     | 約400行                                                        |
| パターン | useSkillStore() フック使用                                     |

```typescript
export interface SkillSelectorProps {
  className?: string;
}
```

**Store依存 (useSkillStore)**:

- `availableSkills` - 未インポートスキル
- `importedSkills` - インポート済みスキル
- `selectedSkillName` - 選択中スキル名
- `isScanning` - リスキャン中フラグ
- `selectSkillByName(name)` - スキル選択
- `rescanSkills()` - リスキャン

**機能**: ドロップダウン、キーボードナビ、検索フィルタ、リスキャンボタン

## 2. SkillImportDialog (TASK-7B)

| 項目     | 内容                                                               |
| -------- | ------------------------------------------------------------------ |
| ファイル | `apps/desktop/src/renderer/components/skill/SkillImportDialog.tsx` |
| 行数     | 約260行                                                            |
| パターン | Props-driven                                                       |

```typescript
export interface SkillImportDialogProps {
  skill: SkillMetadata;
  isOpen: boolean;
  onClose: () => void;
}
```

**Store依存**:

- `importSkill(skillName)` - インポート実行
- `isImporting` - インポート中フラグ
- `importingSkillName` - インポート中スキル名

**機能**: モーダル、ESCキー、フォーカストラップ、許可ツール表示、サブリソース一覧

## 3. PermissionDialog (TASK-7C)

| 項目     | 内容                                                              |
| -------- | ----------------------------------------------------------------- |
| ファイル | `apps/desktop/src/renderer/components/skill/PermissionDialog.tsx` |
| 行数     | 約280行                                                           |
| パターン | **Store-direct** (Props不要)                                      |

**Store依存**:

- `pendingPermission` - SkillPermissionRequest
- `respondToSkillPermission(approved, remember?)` - 権限応答

**ヘルパー関数**:

- `getToolIcon(toolName)` - ツール→絵文字マッピング (10種+default)
- `formatArgs(args)` - 引数フォーマット
- `getDescription(toolName, args)` - 人間可読説明

**機能**: モーダル、3ボタン(Deny/OneTime/Allow)、記憶チェックボックス、ESCキー、フォーカストラップ

## 4. SkillStreamingView (TASK-7D新規)

| 項目     | 内容                                                                |
| -------- | ------------------------------------------------------------------- |
| ファイル | `apps/desktop/src/renderer/components/skill/SkillStreamingView.tsx` |
| 行数     | 約252行                                                             |
| パターン | React.memo                                                          |

```typescript
export interface SkillStreamingViewProps {
  skillName: string;
  messages: SkillStreamMessage[];
  status: SkillExecutionStatus | null;
}
```

**サブコンポーネント**:

- `StatusBadge` - ステータス表示 (running/permission_pending/completed/cancelled/error)
- `StreamMessageItem` - メッセージ種別表示 (assistant/tool_use/tool_result/error)
- `ToolExecutionHistory` - 折りたたみ表示 (details/summary)

**Store依存**:

- `abortExecution()` - 実行中止

## 5. skill/index.ts エクスポート

```typescript
export { PermissionDialog } from "./PermissionDialog";
export { SkillImportDialog } from "./SkillImportDialog";
export type { SkillImportDialogProps } from "./SkillImportDialog";
export { SkillSelector } from "./SkillSelector";
export type { SkillSelectorProps } from "./SkillSelector";
export { SkillStreamingView } from "./SkillStreamingView";
export type { SkillStreamingViewProps } from "./SkillStreamingView";
```

## テスト状況

| コンポーネント     | テストファイル                    | テスト数 | カバレッジ |
| ------------------ | --------------------------------- | -------- | ---------- |
| ChatPanel          | ChatPanel.test.tsx (311行)        | 22+      | Line 100%  |
| StreamingMessage   | StreamingMessage.test.tsx (513行) | 55+      | Line 100%  |
| SkillSelector      | SkillSelector.test.tsx            | 多数     | 高         |
| SkillImportDialog  | SkillImportDialog.test.tsx        | 多数     | 高         |
| PermissionDialog   | PermissionDialog.test.tsx         | 40       | Line 100%  |
| SkillStreamingView | SkillStreamingView.test.tsx       | 33       | Line 100%  |
