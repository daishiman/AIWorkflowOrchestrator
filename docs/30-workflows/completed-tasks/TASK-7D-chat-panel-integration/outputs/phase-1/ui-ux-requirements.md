# UI/UX 要件定義書

## 分析日: 2026-01-30

## 1. SkillSelector 配置位置

- **位置**: ChatPanel ヘッダー領域、ModelSelector の右隣
- **レイアウト**: `flex items-center gap-4`
- **仕様根拠**: specification.md §4.1

## 2. ストリーミング表示（SkillStreamingView）

### レイアウト

- メッセージ領域の下部に表示
- **表示条件**: `isExecuting && selectedSkillName` が truthy
- 背景色: `bg-gray-50`、ボーダー: `border-t`
- パディング: `p-4`

### ステータスバッジ（StatusBadge）

| ステータス         | 色                       | ラベル     |
| ------------------ | ------------------------ | ---------- |
| running            | bg-blue-500 text-white   | 実行中...  |
| permission_pending | bg-yellow-500 text-white | 権限確認   |
| completed          | bg-green-500 text-white  | 完了       |
| cancelled          | bg-gray-500 text-white   | キャンセル |
| error              | bg-red-500 text-white    | エラー     |
| idle / null        | -                        | （非表示） |

### メッセージタイプ別表示

| type                  | 表示                                | スタイル                           |
| --------------------- | ----------------------------------- | ---------------------------------- |
| assistant             | テキスト + ▌カーソル（isPartial時） | -                                  |
| tool_use              | 🔧 ツール使用: {toolName}           | bg-blue-50 p-2 rounded             |
| tool_result (success) | ✅ 完了                             | bg-green-50 p-2 rounded            |
| tool_result (failure) | ❌ エラー: {error}                  | bg-red-50 p-2 rounded              |
| error                 | エラーメッセージ                    | bg-red-50 text-red-600 p-2 rounded |

### ツール実行履歴（ToolExecutionHistory）

- `<details>/<summary>` による折りたたみ表示
- summary: 「ツール実行履歴（{count}件）」
- ツール数計算: tool_use + tool_result メッセージをフィルタリング

## 3. 実行中止ボタン

- **表示条件**: `status === "running"`
- **テキスト**: 「停止する」
- **アクション**: `abortExecution()` 呼び出し
- **アクセシビリティ**: `aria-label="スキル実行を中止する"`

## 4. ダイアログ

- **SkillImportDialog**: ChatPanel ローカル state (`importDialogSkill`) で制御
- **PermissionDialog**: Store-direct パターン、常時マウント、`pendingPermission !== null` で自動表示
