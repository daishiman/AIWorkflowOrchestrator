# Phase 1: 受け入れ基準定義書

## メタ情報

| 項目       | 内容                      |
| ---------- | ------------------------- |
| タスクID   | TASK-FIX-GOOGLE-LOGIN-001 |
| Phase      | 1                         |
| 作成日     | 2026-02-04                |
| ステータス | 完了                      |

---

## 受け入れ基準一覧

### AC-001: OAuth認証エラーパラメータ検出（FR-001）

**シナリオ1: access_denied エラー**

```gherkin
Given ユーザーがGoogleログインを開始した
When Googleの認証画面で「拒否」を選択した
Then コールバックURLに error=access_denied が含まれる
And handleAuthCallback関数がerrorパラメータを検出する
```

**シナリオ2: error_description 付きエラー**

```gherkin
Given ユーザーがGoogleログインを開始した
When OAuth認証が失敗した
Then コールバックURLに error と error_description が含まれる
And handleAuthCallback関数が両パラメータを検出する
```

**検証方法**: 自動テスト（URLパースのユニットテスト）

---

### AC-002: OAuth認証エラーメッセージマッピング（FR-002）

**シナリオ1: access_denied マッピング**

```gherkin
Given OAuth errorコードが "access_denied" の場合
When エラーメッセージをマッピングする
Then "認証がキャンセルされました" というメッセージが返される
```

**シナリオ2: invalid_request マッピング**

```gherkin
Given OAuth errorコードが "invalid_request" の場合
When エラーメッセージをマッピングする
Then "認証リクエストが不正です" というメッセージが返される
```

**シナリオ3: 未知のエラーコード**

```gherkin
Given OAuth errorコードが未定義の値の場合
When エラーメッセージをマッピングする
Then "認証に失敗しました" というデフォルトメッセージが返される
```

**検証方法**: 自動テスト（マッピング関数のユニットテスト）

**エラーコードマッピング表**:

| OAuthエラーコード       | 日本語メッセージ                     |
| ----------------------- | ------------------------------------ |
| access_denied           | 認証がキャンセルされました           |
| invalid_request         | 認証リクエストが不正です             |
| unauthorized_client     | このアプリは認証が許可されていません |
| server_error            | 認証サーバーでエラーが発生しました   |
| temporarily_unavailable | 認証サービスが一時的に利用できません |
| （その他）              | 認証に失敗しました                   |

---

### AC-003: OAuth認証エラーのRenderer通知（FR-003）

**シナリオ1: エラー情報付き通知**

```gherkin
Given OAuth認証がエラー（access_denied）で失敗した
When handleAuthCallback関数がエラーを処理した
Then AUTH_STATE_CHANGEDイベントが送信される
And イベントペイロードに authenticated: false が含まれる
And イベントペイロードに error が含まれる
And イベントペイロードに errorCode が含まれる
```

**シナリオ2: authSliceでのエラー受信**

```gherkin
Given Renderer側でonAuthStateChangedリスナーが登録されている
When AUTH_STATE_CHANGEDイベントにエラー情報が含まれている
Then authSliceのauthError状態がエラーメッセージで更新される
And isLoading状態がfalseになる
```

**検証方法**: 自動テスト（IPC通信のモックテスト）

---

### AC-004: AUTH_NOT_CONFIGUREDエラーコード追加（FR-004）

**シナリオ**

```gherkin
Given AUTH_ERROR_CODES定数オブジェクト
When AUTH_NOT_CONFIGUREDキーを参照する
Then "auth/not-configured" という値が返される
```

**検証方法**: 自動テスト（型チェック、定数テスト）

---

### AC-005: Supabase未設定時のフォールバックレスポンス統一（FR-005）

**シナリオ1: auth:login 呼び出し時**

```gherkin
Given Supabase環境変数が未設定
When auth:login IPCハンドラーが呼び出される
Then IPCResponse { success: false, error: { code: "auth/not-configured", message: "..." } } が返される
```

**シナリオ2: auth:get-session 呼び出し時**

```gherkin
Given Supabase環境変数が未設定
When auth:get-session IPCハンドラーが呼び出される
Then IPCResponse { success: false, error: { code: "auth/not-configured", message: "..." } } が返される
```

**検証方法**: 自動テスト（IPCハンドラーのモックテスト）

---

### AC-006: リフレッシュトークン期限情報の送信（FR-006）

**シナリオ**

```gherkin
Given ユーザーが正常にログインした
When auth:get-session が呼び出される
Then AuthSessionオブジェクトに refreshTokenExpiresAt フィールドが含まれる
And 値はUnixタイムスタンプ（数値）である
```

**検証方法**: 自動テスト（セッション取得のテスト）

**備考**: Supabase APIから取得できるリフレッシュトークン期限情報の有無を調査し、取得不可の場合はデフォルト値（例: 7日）を使用する

---

### AC-007: 認証状態リスナー二重登録防止（FR-007）

**シナリオ1: 初回登録**

```gherkin
Given authSliceが初期化されていない
When initializeAuth()が呼び出される
Then onAuthStateChangedリスナーが1回だけ登録される
```

**シナリオ2: 二重登録防止**

```gherkin
Given authSliceが既に初期化済み（リスナー登録済み）
When initializeAuth()が再度呼び出される
Then onAuthStateChangedリスナーは新たに登録されない
And 既存のリスナーが継続して動作する
```

**シナリオ3: クリーンアップ**

```gherkin
Given onAuthStateChangedリスナーが登録されている
When ユーザーがログアウトする
Then リスナーがクリーンアップされる
And 再ログイン時に新しいリスナーが正常に登録できる
```

**検証方法**: 自動テスト（連続initializeAuthのテスト）

---

### AC-008: 動的タイムアウト実装（FR-008）

**シナリオ1: 即時レスポンス**

```gherkin
Given OAuth認証が成功した
When tokensを含むAUTH_STATE_CHANGEDイベントを受信
Then getSession()が即座に呼び出される（固定待機なし）
And セッションデータが正常に取得される
```

**シナリオ2: タイムアウト**

```gherkin
Given OAuth認証が成功した
When AUTH_STATE_CHANGED受信後にgetSession()を呼び出す
And 一定時間（5秒）以内にセッションが取得できない
Then タイムアウトエラーが発生する
And authErrorが設定される
```

**検証方法**: 自動テスト（タイムアウト動作のテスト）

---

### AC-NFR-001: セキュリティ - トークン機密性（NFR-001）

**シナリオ**

```gherkin
Given OAuth認証エラーが発生した
When エラーメッセージがRenderer側に送信される
Then メッセージにアクセストークンが含まれていない
And メッセージにリフレッシュトークンが含まれていない
And メッセージにAPIキーが含まれていない
```

**検証方法**: コードレビュー、自動テスト（エラーメッセージの正規表現チェック）

---

### AC-NFR-002: セキュリティ - エラーメッセージサニタイズ（NFR-002）

**シナリオ**

```gherkin
Given Supabase APIが内部エラーメッセージを返した
When sanitizeErrorMessage()関数で処理される
Then host=***, password=***, token=*** などの機密パターンがマスクされる
And "database connection"を含む場合は"An internal error occurred"に置換される
```

**検証方法**: 自動テスト（sanitizeErrorMessage関数のテスト）

---

### AC-NFR-003: 可用性 - リスナー安定性（NFR-003）

**シナリオ**

```gherkin
Given ユーザーがログイン状態
When 連続5回ログアウト→ログインを実行する
Then すべての操作が正常に完了する
And 認証状態が正しく反映される
And メモリリークが発生しない
```

**検証方法**: 自動テスト（連続操作テスト）、手動テスト

---

### AC-NFR-004: 互換性 - 既存コード整合性（NFR-004）

**シナリオ**

```gherkin
Given 既存のAUTH_ERROR_CODESを使用するコードがある
When AUTH_NOT_CONFIGUREDを追加した
Then 既存のエラーコード（LOGIN_FAILED, LOGOUT_FAILED等）が引き続き利用可能
And 型チェックがエラーなく通過する
And 既存テストが全て成功する
```

**検証方法**: TypeScript型チェック、既存テスト実行

---

## 受け入れ基準サマリー

| AC         | 要件    | 優先度 | 検証方法          | ステータス |
| ---------- | ------- | ------ | ----------------- | ---------- |
| AC-001     | FR-001  | Must   | 自動テスト        | 未実施     |
| AC-002     | FR-002  | Must   | 自動テスト        | 未実施     |
| AC-003     | FR-003  | Must   | 自動テスト        | 未実施     |
| AC-004     | FR-004  | Must   | 自動テスト        | 未実施     |
| AC-005     | FR-005  | Must   | 自動テスト        | 未実施     |
| AC-006     | FR-006  | Should | 自動テスト        | 未実施     |
| AC-007     | FR-007  | Must   | 自動テスト        | 未実施     |
| AC-008     | FR-008  | Should | 自動テスト        | 未実施     |
| AC-NFR-001 | NFR-001 | Must   | レビュー+テスト   | 未実施     |
| AC-NFR-002 | NFR-002 | Must   | 自動テスト        | 未実施     |
| AC-NFR-003 | NFR-003 | Must   | 自動+手動テスト   | 未実施     |
| AC-NFR-004 | NFR-004 | Must   | 型チェック+テスト | 未実施     |

---

## 変更履歴

| 日付       | バージョン | 変更内容 |
| ---------- | ---------- | -------- |
| 2026-02-04 | 1.0.0      | 初版作成 |
