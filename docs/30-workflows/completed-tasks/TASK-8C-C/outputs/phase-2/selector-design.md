# Phase 2: セレクタ設計

## メタ情報

| 項目     | 値                                 |
| -------- | ---------------------------------- |
| タスクID | TASK-8C-C                          |
| 機能名   | E2Eテスト - インポート・実行フロー |
| 作成日   | 2026-02-02                         |

## UIセレクタ一覧

### ChatPanel関連

| 要素             | セレクタ                       | コンポーネント    |
| ---------------- | ------------------------------ | ----------------- |
| チャットパネル   | `[data-testid="chat-panel"]`   | ChatPanel.tsx:84  |
| チャットヘッダー | `[data-testid="chat-header"]`  | ChatPanel.tsx:90  |
| メッセージエリア | `[data-testid="message-area"]` | ChatPanel.tsx:100 |
| 入力エリア       | `[data-testid="input-area"]`   | ChatPanel.tsx:115 |

### SkillSelector関連

| 要素                     | セレクタ                  | コンポーネント          |
| ------------------------ | ------------------------- | ----------------------- |
| スキル選択ボタン         | `role=combobox`           | SkillSelector.tsx:304   |
| スキルリストボックス     | `[id="skill-listbox"]`    | SkillSelector.tsx:349   |
| スキルオプション         | `role=option`             | SkillSelector.tsx:81-83 |
| インポート済みセクション | `text="インポート済み"`   | SkillSelector.tsx:376   |
| 利用可能セクション       | `text="利用可能なスキル"` | SkillSelector.tsx:405   |
| 再スキャンボタン         | `aria-label="再スキャン"` | SkillSelector.tsx:430   |
| スキャン中表示           | `text="スキャン中..."`    | SkillSelector.tsx:436   |

### SkillImportDialog関連

| 要素                       | セレクタ                        | コンポーネント            |
| -------------------------- | ------------------------------- | ------------------------- |
| インポートダイアログ       | `role=dialog`                   | SkillImportDialog.tsx:179 |
| ダイアログタイトル         | `text="スキルをインポート"`     | SkillImportDialog.tsx:189 |
| 許可ツールセクション       | `text="許可ツール"`             | SkillImportDialog.tsx:229 |
| サブエージェントセクション | `text=/サブエージェント/`       | SkillImportDialog.tsx:75  |
| インポートボタン           | `button:has-text("インポート")` | SkillImportDialog.tsx:263 |
| キャンセルボタン           | `button:has-text("キャンセル")` | SkillImportDialog.tsx:256 |
| 閉じるボタン               | `[aria-label="閉じる"]`         | SkillImportDialog.tsx:196 |

### SkillStreamingView関連

| 要素                     | セレクタ                               | コンポーネント             |
| ------------------------ | -------------------------------------- | -------------------------- |
| ストリーミングビュー     | `[data-testid="skill-streaming-view"]` | SkillStreamingView.tsx:205 |
| スキル名表示             | `[data-testid="skill-name"]`           | SkillStreamingView.tsx:210 |
| ステータスバッジ         | `[data-testid="status-badge"]`         | SkillStreamingView.tsx:63  |
| 停止ボタン               | `[data-testid="abort-button"]`         | SkillStreamingView.tsx:221 |
| 停止ボタン（テキスト）   | `button:has-text("停止")`              | SkillStreamingView.tsx:223 |
| メッセージコンテナ       | `[data-testid="message-container"]`    | SkillStreamingView.tsx:234 |
| ステータス「キャンセル」 | `text="キャンセル"`                    | SkillStreamingView.tsx:39  |

### ChatInput関連

| 要素         | セレクタ                           | コンポーネント   |
| ------------ | ---------------------------------- | ---------------- |
| チャット入力 | `[data-testid="chat-input"]`       | ChatInput.tsx:44 |
| 送信ボタン   | `[data-testid="chat-send-button"]` | ChatInput.tsx:53 |

## セレクタ使用マッピング

### TC-1: インポートダイアログ表示

| 操作順 | 操作内容                   | セレクタ                    |
| ------ | -------------------------- | --------------------------- |
| 1      | スキル選択ボタンをクリック | `role=combobox`             |
| 2      | 未インポートスキルを選択   | `role=option` + skill name  |
| -      | ダイアログ表示確認         | `text="スキルをインポート"` |

### TC-2: スキル詳細表示

| 操作順 | 操作内容             | セレクタ                  |
| ------ | -------------------- | ------------------------- |
| 1      | ダイアログ表示後     | -                         |
| -      | 許可ツール表示確認   | `text="許可ツール"`       |
| -      | サブエージェント確認 | `text=/サブエージェント/` |

### TC-3: インポート実行

| 操作順 | 操作内容                 | セレクタ                             |
| ------ | ------------------------ | ------------------------------------ |
| 1      | インポートボタンクリック | `button:has-text("インポート")`      |
| 2      | ダイアログ閉じを待機     | `text="スキルをインポート"` (hidden) |
| 3      | スキル選択UIを再度開く   | `role=combobox`                      |
| -      | インポート済み確認       | `text="インポート済み"`              |

### TC-4: ストリーミング表示

| 操作順 | 操作内容               | セレクタ                               |
| ------ | ---------------------- | -------------------------------------- |
| 前提   | test-skillをインポート | API経由                                |
| 1      | スキルを選択           | `role=option`                          |
| 2      | プロンプト入力         | `[data-testid="chat-input"]`           |
| 3      | Enter押下              | keyboard "Enter"                       |
| -      | ストリーミング確認     | `[data-testid="skill-streaming-view"]` |

### TC-5: 停止ボタン表示

| 操作順 | 操作内容       | セレクタ                       |
| ------ | -------------- | ------------------------------ |
| 前提   | スキル実行開始 | TC-4と同様                     |
| -      | 停止ボタン確認 | `[data-testid="abort-button"]` |

### TC-6: 実行中止

| 操作順 | 操作内容           | セレクタ                       |
| ------ | ------------------ | ------------------------------ |
| 前提   | スキル実行開始     | TC-4と同様                     |
| 1      | 停止ボタンクリック | `[data-testid="abort-button"]` |
| -      | キャンセル確認     | `text="キャンセル"`            |

### TC-7: 再スキャン実行

| 操作順 | 操作内容           | セレクタ                        |
| ------ | ------------------ | ------------------------------- |
| 1      | スキル選択UIを開く | `role=combobox`                 |
| 2      | 再スキャンクリック | `aria-label="再スキャン"`       |
| -      | スキャン中表示確認 | `text="スキャン中..."`          |
| 3      | スキャン完了を待機 | `text="スキャン中..."` (hidden) |
| -      | リストボックス確認 | `role=listbox`                  |

## セレクタ優先順位ガイドライン

| 優先度 | セレクタ種別      | 理由                               |
| ------ | ----------------- | ---------------------------------- |
| 1      | `data-testid`     | テスト専用、安定性高い             |
| 2      | `role` + `aria-*` | アクセシビリティ準拠、意味的に明確 |
| 3      | `text=`           | 可読性高い、ローカライズ注意       |
| 4      | CSS class         | 最終手段、スタイル変更に弱い       |

## 注意事項

### 元タスク仕様書との差異

| 元仕様のセレクタ                      | 実際の推奨セレクタ                | 理由                         |
| ------------------------------------- | --------------------------------- | ---------------------------- |
| `[aria-label="スキルを選択"]`         | `role=combobox`                   | ボタン自体にはaria-labelなし |
| `[data-testid="import-skill-button"]` | 未インポートスキル選択→ダイアログ | 専用ボタンなし               |
| `button:has-text("停止")`             | `[data-testid="abort-button"]`    | data-testidがより安定        |

### 待機が必要な操作

| 操作                 | 待機方法                                    |
| -------------------- | ------------------------------------------- |
| ダイアログ表示       | `toBeVisible()` または `waitForSelector`    |
| ダイアログ非表示     | `waitForSelector(..., { state: "hidden" })` |
| スキャン完了         | `waitForSelector(..., { state: "hidden" })` |
| ストリーミングビュー | `toBeVisible()`                             |
