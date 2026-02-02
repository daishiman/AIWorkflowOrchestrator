# TASK-8B 受け入れ基準

## SkillSelector（15ケース）

### SS-R-01: スキル未選択時の表示

- **Given**: `selectedSkillName = null`
- **When**: コンポーネントをレンダリング
- **Then**: ボタンに「なし」テキストが表示される

### SS-R-02: 選択中スキル名表示

- **Given**: `selectedSkillName = "my-skill"`
- **When**: コンポーネントをレンダリング
- **Then**: ボタンに「my-skill」テキストが表示される

### SS-R-03: スキャン中の状態表示

- **Given**: `isScanning = true`
- **When**: コンポーネントをレンダリングしドロップダウンを開く
- **Then**: 「スキャン中...」テキストが表示される

### SS-I-04: クリックで開く

- **Given**: ドロップダウンが閉じている
- **When**: ボタンをクリック
- **Then**: `role="listbox"`要素が表示される

### SS-I-05: 外側クリックで閉じる

- **Given**: ドロップダウンが開いている
- **When**: ドロップダウン外をクリック
- **Then**: `role="listbox"`要素が非表示になる

### SS-I-06: インポート済みセクション表示

- **Given**: `importedSkills`に1件以上のスキルがある
- **When**: ドロップダウンを開く
- **Then**: 「インポート済み」テキストが表示される

### SS-I-07: 利用可能セクション表示

- **Given**: `availableSkills`にインポート済みでないスキルがある
- **When**: ドロップダウンを開く
- **Then**: 「利用可能なスキル」テキストが表示される

### SS-S-08: スキル選択

- **Given**: ドロップダウンにインポート済みスキルが表示されている
- **When**: スキルをクリック
- **Then**: `selectSkillByName("skill-name")`が呼ばれる

### SS-S-09: スキル選択解除

- **Given**: ドロップダウンに「なし」オプションが表示されている
- **When**: 「なし」をクリック
- **Then**: `selectSkillByName(null)`が呼ばれる

### SS-K-10: Escapeで閉じる

- **Given**: ドロップダウンが開いている
- **When**: Escapeキーを押す
- **Then**: ドロップダウンが閉じる

### SS-K-11: 矢印キーナビゲーション

- **Given**: ドロップダウンが開いている
- **When**: ArrowDownキーを押す
- **Then**: フォーカスが次のオプションに移動する

### SS-R-12: 再スキャン実行

- **Given**: ドロップダウンが開いている
- **When**: 「再スキャン」ボタンをクリック
- **Then**: `rescanSkills()`が呼ばれる

### SS-R-13: スキャン中はボタン無効

- **Given**: `isScanning = true`
- **When**: ドロップダウンを開く
- **Then**: 再スキャンボタンが`disabled`になっている

### SS-A-14: ARIA属性

- **Given**: コンポーネントをレンダリング
- **When**: -
- **Then**: ボタンに`aria-haspopup="listbox"`, `aria-expanded`が設定されている

### SS-A-15: aria-expanded更新

- **Given**: ドロップダウンが閉じている
- **When**: ボタンをクリック
- **Then**: `aria-expanded="true"`に更新される

## SkillImportDialog（12ケース）

### SID-R-01: isOpen=falseで非表示

- **Given**: `isOpen = false`
- **When**: コンポーネントをレンダリング
- **Then**: `role="dialog"`要素が存在しない

### SID-R-02: スキル名・説明表示

- **Given**: `isOpen = true`, `skill.name = "test-skill"`
- **When**: コンポーネントをレンダリング
- **Then**: 「test-skill」テキストと説明が表示される

### SID-R-03: 許可ツール表示

- **Given**: `skill.allowedTools = ["Bash", "Read", "Write"]`
- **When**: コンポーネントをレンダリング
- **Then**: 「Bash」「Read」「Write」テキストが表示される

### SID-R-04: agents一覧表示

- **Given**: `skill.agents`に2件のエージェントがある
- **When**: コンポーネントをレンダリング
- **Then**: 「サブエージェント (agents/) - 2件」が表示される

### SID-R-05: references一覧表示

- **Given**: `skill.references`に1件の参照がある
- **When**: コンポーネントをレンダリング
- **Then**: 「参照資料 (references/) - 1件」が表示される

### SID-R-06: 空セクション非表示

- **Given**: `skill.scripts = []`
- **When**: コンポーネントをレンダリング
- **Then**: 「スクリプト」セクションが表示されない

### SID-I-07: インポート実行

- **Given**: ダイアログが開いている
- **When**: 「インポート」ボタンをクリック
- **Then**: `importSkill("test-skill")`が呼ばれる

### SID-I-08: ローディング状態

- **Given**: `isImporting = true`, `importingSkillName = "test-skill"`
- **When**: コンポーネントをレンダリング
- **Then**: インポートボタンが`disabled`で「インポート中...」表示

### SID-I-09: 成功後ダイアログ閉じる

- **Given**: インポートが成功する
- **When**: `importSkill`が正常完了
- **Then**: `onClose()`が呼ばれる

### SID-I-10: キャンセルボタン

- **Given**: ダイアログが開いている
- **When**: 「キャンセル」ボタンをクリック
- **Then**: `onClose()`が呼ばれる

### SID-I-11: 閉じるボタン

- **Given**: ダイアログが開いている
- **When**: ×ボタンをクリック
- **Then**: `onClose()`が呼ばれる

### SID-I-12: インポート中は無効

- **Given**: `isImporting = true`
- **When**: コンポーネントをレンダリング
- **Then**: キャンセルボタンが`disabled`になっている

## PermissionDialog（12ケース）

### PD-R-01: pendingPermission nullで非表示

- **Given**: `pendingPermission = null` (Storeから)
- **When**: コンポーネントをレンダリング
- **Then**: `role="dialog"`要素が存在しない

### PD-R-02: ツール名表示

- **Given**: `pendingPermission.toolName = "Bash"`
- **When**: コンポーネントをレンダリング
- **Then**: 「Bash」テキストが表示される

### PD-R-03: Bashコマンド引数表示

- **Given**: `pendingPermission.args = { command: "ls -la /home/user" }`
- **When**: コンポーネントをレンダリング
- **Then**: `ls -la /home/user`テキストが表示される

### PD-R-04: ファイルパス引数表示

- **Given**: `toolName = "Read"`, `args = { path: "/path/to/file.txt" }`
- **When**: コンポーネントをレンダリング
- **Then**: `/path/to/file.txt`テキストが表示される

### PD-R-05: JSON引数表示

- **Given**: `toolName = "WebSearch"`, `args = { query: "test query" }`
- **When**: コンポーネントをレンダリング
- **Then**: `"query": "test query"`テキストが表示される

### PD-R-06: 理由表示

- **Given**: `pendingPermission.reason = "List files in user directory"`
- **When**: コンポーネントをレンダリング
- **Then**: 「List files in user directory」テキストが表示される

### PD-I-07: 拒否ボタン

- **Given**: ダイアログが表示されている
- **When**: 「拒否」ボタンをクリック
- **Then**: `respondToSkillPermission(false, false)`が呼ばれる

### PD-I-08: 閉じるボタン

- **Given**: ダイアログが表示されている
- **When**: ×ボタンをクリック
- **Then**: `respondToSkillPermission(false, false)`が呼ばれる

### PD-I-09: 1回許可

- **Given**: ダイアログが表示されている
- **When**: 「1回許可」ボタンをクリック
- **Then**: `respondToSkillPermission(true, false)`が呼ばれる

### PD-I-10: 許可（rememberなし）

- **Given**: チェックボックス未チェック
- **When**: 「許可」ボタンをクリック
- **Then**: `respondToSkillPermission(true, false)`が呼ばれる

### PD-I-11: 許可（rememberあり）

- **Given**: チェックボックスをチェック済み
- **When**: 「許可」ボタンをクリック
- **Then**: `respondToSkillPermission(true, true)`が呼ばれる

### PD-I-12: チェックボックスリセット

- **Given**: チェックボックスをチェックして許可した後
- **When**: 新しいpendingPermissionでrerenderされる
- **Then**: チェックボックスが未チェック状態

## SkillStreamingView（16ケース）

### SSV-R-01: スキル名表示

- **Given**: `skillName = "test-skill"`
- **When**: コンポーネントをレンダリング
- **Then**: 「test-skill」テキストが表示される

### SSV-R-02: アシスタントメッセージ

- **Given**: `messages`にassistantタイプがある
- **When**: コンポーネントをレンダリング
- **Then**: テキスト内容が表示される

### SSV-R-03: パーシャルメッセージ

- **Given**: `messages`にisPartial=trueのassistantメッセージがある
- **When**: コンポーネントをレンダリング
- **Then**: カーソル表示要素がある

### SSV-R-04: ツール使用通知

- **Given**: `messages`にtool_useタイプがある
- **When**: コンポーネントをレンダリング
- **Then**: 「ツール使用: Bash」テキストが表示される

### SSV-R-05: ツール結果（成功）

- **Given**: `messages`にsuccess=trueのtool_resultがある
- **When**: コンポーネントをレンダリング
- **Then**: 「完了」テキストが表示される

### SSV-R-06: ツール結果（失敗）

- **Given**: `messages`にsuccess=falseのtool_resultがある
- **When**: コンポーネントをレンダリング
- **Then**: 「エラー: {error}」テキストが表示される

### SSV-R-07: エラーメッセージ

- **Given**: `messages`にerrorタイプがある
- **When**: コンポーネントをレンダリング
- **Then**: エラーメッセージ内容が表示される

### SSV-S-08: running表示

- **Given**: `status = "running"`
- **When**: コンポーネントをレンダリング
- **Then**: 「実行中...」バッジが表示される

### SSV-S-09: permission_pending表示

- **Given**: `status = "permission_pending"`
- **When**: コンポーネントをレンダリング
- **Then**: 「権限確認」バッジが表示される

### SSV-S-10: completed表示

- **Given**: `status = "completed"`
- **When**: コンポーネントをレンダリング
- **Then**: 「完了」バッジが表示される

### SSV-S-11: error表示

- **Given**: `status = "error"`
- **When**: コンポーネントをレンダリング
- **Then**: 「エラー」バッジが表示される

### SSV-S-12: idleでバッジなし

- **Given**: `status = "idle"`
- **When**: コンポーネントをレンダリング
- **Then**: ステータスバッジが表示されない

### SSV-I-13: running時に表示

- **Given**: `status = "running"`
- **When**: コンポーネントをレンダリング
- **Then**: 停止ボタンが表示される

### SSV-I-14: completed時に非表示

- **Given**: `status = "completed"`
- **When**: コンポーネントをレンダリング
- **Then**: 停止ボタンが表示されない

### SSV-I-15: クリックで実行

- **Given**: `status = "running"`
- **When**: 停止ボタンをクリック
- **Then**: `abortExecution()`が呼ばれる

### SSV-R-16: ツール履歴表示/非表示

- **Given**: `messages`にtool_use + tool_resultのペアがある
- **When**: コンポーネントをレンダリング
- **Then**: 「ツール実行履歴（1件）」テキストが表示される
