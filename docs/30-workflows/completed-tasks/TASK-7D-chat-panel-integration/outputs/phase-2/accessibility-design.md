# アクセシビリティ設計書

## 設計日: 2026-01-30

## SkillStreamingView

| 要素                 | 属性         | 値                       |
| -------------------- | ------------ | ------------------------ |
| メッセージ表示エリア | `role`       | `"log"`                  |
| メッセージ表示エリア | `aria-live`  | `"polite"`               |
| メッセージ表示エリア | `aria-label` | `"スキル実行結果"`       |
| StatusBadge          | `role`       | `"status"`               |
| 中止ボタン           | `aria-label` | `"スキル実行を中止する"` |
| 中止ボタン           | `type`       | `"button"`               |

## ChatPanel ヘッダー

| 要素     | 属性         | 値               |
| -------- | ------------ | ---------------- |
| ヘッダー | `role`       | `"toolbar"`      |
| ヘッダー | `aria-label` | `"チャット設定"` |

## フォーカス管理

- PermissionDialog 表示時: ダイアログにフォーカス移動（TASK-7C 実装済み）
- SkillImportDialog 表示時: ダイアログにフォーカス移動（TASK-7B 実装済み）
- 中止ボタン: Tab キーでフォーカス可能
- ToolExecutionHistory: details/summary は Enter/Space で開閉可能（ネイティブ）

## 色覚依存対策

- StatusBadge: 色+テキストラベルで識別可能
- tool_result: 色+アイコン（✅/❌）で識別可能
- error: 色+テキストで識別可能
