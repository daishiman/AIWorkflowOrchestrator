# UI/UX 要件定義書

## SkillSelector配置位置

- ChatPanelヘッダー内に配置
- `role="toolbar"`, `aria-label="チャットツールバー"` のツールバー内
- ModelSelector（既存）の隣に配置

## ストリーミング表示レイアウト

### メッセージタイプ別表示

| タイプ      | 表示内容                                     | スタイル                |
| ----------- | -------------------------------------------- | ----------------------- |
| assistant   | テキスト + partialカーソル `▌`               | 通常テキスト            |
| tool_use    | `🔧 ツール使用: {toolName}`                  | bg-blue-50              |
| tool_result | 成功: `✅ 完了` / 失敗: `❌ エラー: {error}` | bg-green-50 / bg-red-50 |
| error       | エラーメッセージ                             | bg-red-50, text-red-600 |
| status      | (非表示)                                     | -                       |

### ストリーミングエリア

- `role="log"` - ログ領域として認識
- `aria-live="polite"` - スクリーンリーダーへのライブ通知
- `aria-label="スキル実行結果"` - エリア説明

## ステータスバッジ

| ステータス         | 色                 | ラベル       | 表示条件                        |
| ------------------ | ------------------ | ------------ | ------------------------------- |
| running            | 青 (bg-blue-500)   | "実行中..."  | status === "running"            |
| permission_pending | 黄 (bg-yellow-500) | "権限確認"   | status === "permission_pending" |
| completed          | 緑 (bg-green-500)  | "完了"       | status === "completed"          |
| cancelled          | 灰 (bg-gray-500)   | "キャンセル" | status === "cancelled"          |
| error              | 赤 (bg-red-500)    | "エラー"     | status === "error"              |
| idle               | (非表示)           | -            | -                               |
| null               | (非表示)           | -            | -                               |

バッジ属性: `role="status"`

## ツール実行履歴

- `<details>` / `<summary>` による折りたたみ表示
- tool_use + tool_result メッセージをフィルタリング
- ツール数: `toolMessages.length / 2`
- ツールメッセージがゼロの場合は非表示

## 実行中止ボタン

- 表示条件: `status === "running"`
- クリック時: `abortExecution()` を呼び出し
- `type="button"` 指定
- `aria-label="スキル実行を中止する"`

## PermissionDialog

- Store-directパターン（ChatPanelからのProps不要）
- pendingPermission !== null で自動表示
- 3ボタンパターン: Deny / OneTime Allow / Allow
- フォーカストラップ実装
- ESCキーでDeny
- TOOL_ICONSマッピング (10種+default)
- getDescription() による人間可読説明
- 記憶チェックボックス

## SkillImportDialog

- importDialogSkill設定時に表示
- Props: `skill`, `isOpen`, `onClose`
- ESCキーで閉じる
- フォーカストラップ実装

## アクセシビリティ要件（WCAG 2.1 AA）

| 要件               | 実装                                         |
| ------------------ | -------------------------------------------- |
| キーボードナビ     | Tab/Shift+Tab/Enter/Escape操作可能           |
| スクリーンリーダー | aria-label, aria-live, role属性              |
| フォーカス管理     | PermissionDialog/SkillImportDialogにトラップ |
| 色コントラスト     | 4.5:1比率以上                                |
| ライブリージョン   | aria-live="polite" (ストリーミング出力)      |
| モーダルダイアログ | role="dialog", aria-modal="true"             |

## IPCチャンネル（参考）

| チャンネル           | 方向            | 用途           |
| -------------------- | --------------- | -------------- |
| agent:start          | Renderer → Main | 実行開始       |
| agent:stop           | Renderer → Main | 実行停止       |
| agent:stream         | Main → Renderer | ストリーミング |
| agent:complete       | Main → Renderer | 完了通知       |
| agent:error          | Main → Renderer | エラー通知     |
| agent:permission     | Main → Renderer | 権限要求       |
| agent:permission:res | Renderer → Main | 権限応答       |
