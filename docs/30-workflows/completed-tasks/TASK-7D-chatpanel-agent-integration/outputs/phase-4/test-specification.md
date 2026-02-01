# テスト仕様書

## テストファイル一覧

| ファイル                    | テスト数 | 対象コンポーネント |
| --------------------------- | -------- | ------------------ |
| ChatPanel.test.tsx (311行)  | 15       | ChatPanel統合      |
| SkillStreamingView.test.tsx | 33       | SkillStreamingView |
| **合計**                    | **48**   |                    |

## ChatPanel統合テスト (15テスト)

### 基本レンダリング (3テスト)

- SkillSelectorがヘッダー内にレンダリングされる
- PermissionDialogが常時マウントされている
- 基本構造が正しい

### SkillStreamingView表示制御 (3テスト)

- isExecuting && selectedSkillNameがtruthyの場合、表示される
- isExecutingがfalseの場合、表示されない
- selectedSkillNameがnullの場合、表示されない

### fetchSkills初期化 (1テスト)

- マウント時にfetchSkillsが呼ばれる

### エッジケース (2テスト)

- エラー状態のハンドリング
- 初期状態の検証

### アクセシビリティ (2テスト)

- toolbar role属性
- aria-label属性

### SkillImportDialog統合 (4テスト)

- refハンドラによるimport request
- コールバック動作
- ダイアログ状態管理

## SkillStreamingViewテスト (33テスト)

### StatusBadge (7テスト)

- running → 青バッジ "実行中..."
- permission_pending → 黄バッジ "権限確認"
- completed → 緑バッジ "完了"
- cancelled → 灰バッジ "キャンセル"
- error → 赤バッジ "エラー"
- null → 非表示
- idle → 非表示

### StreamMessageItem (6テスト)

- assistantメッセージ表示
- isPartialカーソル表示
- tool_useメッセージ表示
- tool_result成功表示
- tool_result失敗表示
- errorメッセージ表示

### ToolExecutionHistory (3テスト)

- 折りたたみ表示
- ゼロ件時非表示
- ツール数計算

### 中止ボタン (3テスト)

- running時表示
- クリック→abortExecution呼出
- 非running時非表示

### アクセシビリティ (3テスト)

- role="log" + aria-live="polite"
- 中止ボタンaria-label
- StatusBadge role="status"
