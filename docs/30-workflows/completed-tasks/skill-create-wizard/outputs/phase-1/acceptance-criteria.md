# TASK-10A-C: 受入基準

## 正常系シナリオ

### GWT-001: 説明入力から完了までの基本フロー

- Given: ウィザードが表示されている
- When: 説明を入力し「次へ」→ オプションを設定し「スキルを生成」→ 生成成功
- Then: 完了メッセージとスキルパスが表示され「閉じる」で onClose が呼ばれる

### GWT-002: デフォルトオプションでの生成

- Given: Step 2 が表示されている
- When: オプションを変更せず「スキルを生成」をクリック
- Then: generateTasks=true, addAgents=false, addReferences=false で IPC が呼ばれる

### GWT-003: 全オプション有効化

- Given: Step 2 が表示されている
- When: 全チェックボックスを有効にして「スキルを生成」
- Then: 全オプションが true で IPC が呼ばれる

### GWT-004: ステップ間の前後移動

- Given: Step 2 が表示されている
- When: 「戻る」をクリック
- Then: Step 1 に戻り、入力済みの説明が保持されている

### GWT-005: StepIndicator の状態表示

- Given: ウィザードの各ステップにいる
- When: StepIndicator を確認する
- Then: 現在のステップが active、完了済みが completed、未到達が pending

## エラー系シナリオ

### GWT-E001: 空入力でのバリデーション

- Given: Step 1 が表示されている
- When: 説明が空の状態で「次へ」を確認
- Then: ボタンが disabled で操作できない

### GWT-E002: スペースのみ入力

- Given: Step 1 が表示されている
- When: スペースのみ入力
- Then: ボタンが disabled（.trim() チェック）

### GWT-E003: IPC 失敗時のエラー表示

- Given: Step 3（生成中）に遷移した
- When: IPC が reject される
- Then: エラーメッセージが表示される

### GWT-E004: 不明エラーのフォールバック

- Given: IPC が Error でない値で reject
- When: catch ブロックに入る
- Then: 「スキル生成に失敗しました」デフォルトメッセージが表示

## アクセシビリティシナリオ

### GWT-A001: StepIndicator の aria 属性

- Then: nav に aria-label="ウィザードの進捗"、アクティブステップに aria-current="step"

### GWT-A002: テキストエリアのラベル関連付け

- Then: label[htmlFor] と textarea[id] が関連付けられている

### GWT-A003: 生成中のスクリーンリーダー通知

- Then: aria-live="polite" で生成状態がアナウンスされる
