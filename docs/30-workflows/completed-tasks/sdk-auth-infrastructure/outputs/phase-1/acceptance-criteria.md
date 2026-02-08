# 受け入れ基準: Claude Agent SDK 認証キー管理基盤

## メタ情報

| 項目         | 内容                                     |
| ------------ | ---------------------------------------- |
| タスクID     | TASK-FIX-16-1-SDK-AUTH-INFRASTRUCTURE    |
| タスク名     | Claude Agent SDK用認証キー管理基盤の構築 |
| 作成日       | 2026-02-07                               |
| Phase        | 1 (要件定義)                             |
| ドキュメント | 受け入れ基準                             |

---

## FR-1: 認証キーの暗号化保存

### AC-1.1: safeStorage による暗号化

**Given** アプリケーションが起動済みで、safeStorage が利用可能な状態のとき
**When** ユーザーが認証キーを設定するとき
**Then** 認証キーは safeStorage API で暗号化される
**And** 暗号化されたデータは Base64 エンコードされる
**And** electron-store に永続化される

### AC-1.2: 暗号化データの永続化

**Given** 認証キーが暗号化されたとき
**When** アプリケーションを再起動するとき
**Then** 保存された認証キーを復号して取得できる
**And** 復号されたキーは元のキーと一致する

### AC-1.3: 暗号化不可時の開発環境フォールバック

**Given** safeStorage.isEncryptionAvailable() が false を返すとき
**And** NODE_ENV が development のとき
**When** 認証キーを設定するとき
**Then** 警告ログが出力される
**And** 認証キーは平文で保存される

### AC-1.4: 暗号化不可時の本番環境エラー

**Given** safeStorage.isEncryptionAvailable() が false を返すとき
**And** NODE_ENV が production のとき
**When** 認証キーを設定するとき
**Then** エラーがスローされる
**And** 認証キーは保存されない

---

## FR-2: query() への認証キー渡し

### AC-2.1: SkillExecutor での認証キー取得

**Given** SkillExecutor が AuthKeyService を持つとき
**And** 認証キーが設定されているとき
**When** callSDKQuery() が呼び出されるとき
**Then** AuthKeyService.getKey() が呼び出される
**And** 取得したキーが query() の options.apiKey に渡される

### AC-2.2: キー未設定時のエラー

**Given** SkillExecutor が AuthKeyService を持つとき
**And** 認証キーが設定されていないとき
**When** callSDKQuery() が呼び出されるとき
**Then** AuthKeyNotSetError がスローされる
**And** エラーコードは 3001 である

### AC-2.3: 環境変数フォールバック

**Given** 認証キーが設定されていないとき
**And** ANTHROPIC_API_KEY 環境変数が設定されているとき
**When** getKey() が呼び出されるとき
**Then** 環境変数の値が返される

### AC-2.4: 遅延初期化

**Given** アプリケーションが起動したとき
**When** AuthKeyService がインスタンス化されるとき
**Then** Store はまだ初期化されない
**And** getKey() または setKey() が初回呼び出しされたときに Store が初期化される

---

## FR-3: キー未設定時のエラーハンドリング

### AC-3.1: AuthKeyNotSetError の詳細

**Given** 認証キーが設定されていないとき
**When** スキル実行時に callSDKQuery() が呼び出されるとき
**Then** AuthKeyNotSetError がスローされる
**And** エラーコードは 3001 である
**And** エラーメッセージに "Please set it in Settings" が含まれる
**And** isRetryable は false である

### AC-3.2: AuthKeyInvalidError の詳細

**Given** 無効な認証キーが設定されているとき
**When** キー検証が行われるとき
**Then** AuthKeyInvalidError がスローされる
**And** エラーコードは 3002 である
**And** isRetryable は false である

### AC-3.3: Renderer へのエラー通知

**Given** AuthKeyNotSetError が発生したとき
**When** エラーが Renderer に通知されるとき
**Then** エラーメッセージが IPC 経由で送信される
**And** 認証キーの値はメッセージに含まれない

---

## FR-4: IPC API 提供

### AC-4.1: auth-key:set の成功

**Given** 有効な認証キーが提供されるとき
**When** auth-key:set IPC が呼び出されるとき
**Then** 認証キーが暗号化されて保存される
**And** { success: true } が返される

### AC-4.2: auth-key:set の失敗

**Given** 空の認証キーが提供されるとき
**When** auth-key:set IPC が呼び出されるとき
**Then** { success: false, error: "Key cannot be empty" } が返される

### AC-4.3: auth-key:exists の確認

**Given** 認証キーが設定されているとき
**When** auth-key:exists IPC が呼び出されるとき
**Then** { exists: true } が返される

### AC-4.4: auth-key:exists の未設定確認

**Given** 認証キーが設定されていないとき
**When** auth-key:exists IPC が呼び出されるとき
**Then** { exists: false } が返される

### AC-4.5: auth-key:validate の成功

**Given** 有効な認証キーが提供されるとき
**When** auth-key:validate IPC が呼び出されるとき
**Then** Anthropic API への検証リクエストが送信される
**And** { valid: true } が返される

### AC-4.6: auth-key:validate の失敗

**Given** 無効な認証キーが提供されるとき
**When** auth-key:validate IPC が呼び出されるとき
**Then** { valid: false, error: "Invalid API key" } が返される

### AC-4.7: auth-key:delete の実行

**Given** 認証キーが設定されているとき
**When** auth-key:delete IPC が呼び出されるとき
**Then** 認証キーが削除される
**And** { success: true } が返される
**And** その後 auth-key:exists は { exists: false } を返す

---

## NFR-1: セキュリティ

### AC-N1.1: Main Process 限定アクセス

**Given** 認証キーが保存されているとき
**When** Renderer Process から直接アクセスを試みるとき
**Then** アクセスは拒否される
**And** 認証キーは取得できない

### AC-N1.2: IPC レスポンスにキーを含めない

**Given** 認証キーが設定されているとき
**When** auth-key:exists IPC が呼び出されるとき
**Then** レスポンスに認証キーの値は含まれない

### AC-N1.3: ログからのキー除外

**Given** 認証キーを含む操作が実行されるとき
**When** ログが出力されるとき
**Then** 認証キーの値は [REDACTED] に置換される

### AC-N1.4: IPC sender 検証

**Given** IPC ハンドラーが登録されているとき
**When** 不正なウィンドウから IPC が呼び出されるとき
**Then** リクエストは拒否される
**And** エラーが返される

---

## NFR-2: 可用性

### AC-N2.1: 環境変数フォールバック

**Given** electron-store にキーが保存されていないとき
**And** ANTHROPIC_API_KEY 環境変数が設定されているとき
**When** getKey() が呼び出されるとき
**Then** 環境変数の値が返される

### AC-N2.2: 環境変数優先度

**Given** electron-store にキーが保存されているとき
**And** ANTHROPIC_API_KEY 環境変数も設定されているとき
**When** getKey() が呼び出されるとき
**Then** electron-store のキーが優先して返される

---

## NFR-3: パフォーマンス

### AC-N3.1: キー取得レイテンシ

**Given** 認証キーが設定されているとき
**When** getKey() が連続で 100 回呼び出されるとき
**Then** 平均レイテンシは 10ms 以内である

### AC-N3.2: キーキャッシュ

**Given** 認証キーが設定されているとき
**When** getKey() が 2 回連続で呼び出されるとき
**Then** 2 回目の呼び出しは 1ms 以内で完了する
**And** safeStorage.decryptString は 1 回のみ呼び出される

---

## 統合テストシナリオ

### IT-1: スキル実行時の認証キー使用

**Given** 認証キーが設定されているとき
**And** スキルが定義されているとき
**When** SkillExecutor.execute() が呼び出されるとき
**Then** callSDKQuery() が認証キー付きで SDK を呼び出す

### IT-2: キー未設定時のスキル実行失敗

**Given** 認証キーが設定されていないとき
**And** 環境変数も設定されていないとき
**When** SkillExecutor.execute() が呼び出されるとき
**Then** AuthKeyNotSetError が発生する
**And** エラーが Renderer に通知される

### IT-3: IPC 経由でのキー設定から実行まで

**Given** 認証キーが設定されていないとき
**When** auth-key:set IPC で有効なキーを設定するとき
**And** その後 SkillExecutor.execute() を呼び出すとき
**Then** スキル実行が正常に開始される

---

## エッジケース

### EC-1: 空文字列のキー

**Given** 空文字列が認証キーとして提供されるとき
**When** auth-key:set が呼び出されるとき
**Then** バリデーションエラーが返される
**And** キーは保存されない

### EC-2: 非常に長いキー

**Given** 1000文字を超える文字列が認証キーとして提供されるとき
**When** auth-key:set が呼び出されるとき
**Then** バリデーションエラーが返される
**And** キーは保存されない

### EC-3: Store 破損時の復旧

**Given** electron-store のデータが破損しているとき
**When** getKey() が呼び出されるとき
**Then** null が返される
**And** エラーログが出力される

### EC-4: 同時アクセス

**Given** 複数の callSDKQuery() が同時に実行されるとき
**When** 各呼び出しが getKey() を呼び出すとき
**Then** 全ての呼び出しが同じキーを取得する
**And** 競合状態は発生しない
