# セキュリティ設計原則・認証認可

> 本ドキュメントは統合システム設計仕様書の一部です。
> 管理: .claude/skills/aiworkflow-requirements/

---

## セキュリティ設計原則

### 基本原則

| 原則             | 説明                               | 適用場面                          |
| ---------------- | ---------------------------------- | --------------------------------- |
| 最小権限         | 必要最小限のアクセス権のみ付与する | API認証、ファイルアクセス、DB権限 |
| 多層防御         | 単一の防御に依存しない             | 認証+認可+暗号化の組み合わせ      |
| フェイルセキュア | 障害時は安全側に倒す               | エラー時はアクセス拒否            |
| 完全な仲介       | すべてのアクセスを検証する         | ミドルウェアでの認証チェック      |
| 経済的設計       | シンプルな設計で攻撃面を減らす     | 不要な機能の削除                  |

### 個人開発での優先順位

**必須（リリース前に対応）**:

- APIキーの環境変数管理
- HTTPS通信の強制
- 入力値のバリデーション
- 認証・認可の実装
- セキュアなセッション管理

**推奨（段階的に対応）**:

- 依存関係の脆弱性監査
- Content Security Policy（CSP）設定
- レート制限の実装
- 監査ログの記録

**将来対応（ユーザー増加時）**:

- 侵入検知システム
- セキュリティ監査の自動化
- ペネトレーションテスト

---

## 認証・認可

### 認証方式

| 方式             | 用途                       | 推奨ライブラリ |
| ---------------- | -------------------------- | -------------- |
| OAuth 2.0 PKCE   | Desktop ソーシャルログイン | Supabase Auth  |
| OAuth 2.0        | Web ソーシャルログイン     | NextAuth.js    |
| APIキー          | Local Agent認証            | カスタム実装   |
| セッションCookie | Web UI認証                 | NextAuth.js    |

### Supabase Auth（Desktop）

Electron Desktop アプリでは Supabase Auth を使用し、OAuth 2.0 PKCE フローで認証を行う。

**対応プロバイダー**: Google, GitHub, Discord

**OAuth認証フロー実装状況**:

| 項目                   | 状態        | 説明                                                |
| ---------------------- | ----------- | --------------------------------------------------- |
| カスタムプロトコル     | ✅ 実装済み | `aiworkflow://auth/callback` で認証コールバック受信 |
| Refresh Token暗号化    | ✅ 実装済み | safeStorage.encryptString()で暗号化後保存           |
| Access Tokenメモリ保持 | ✅ 実装済み | Zustand storeでメモリ上のみ保持                     |
| State parameter検証    | ✅ 実装済み | DEBT-SEC-001完了（2026-02-06）                      |
| PKCE実装               | ❌ 未実装   | DEBT-SEC-002として技術的負債に記録                  |

**実装ファイル**:

| ファイル                                                | 責務                   |
| ------------------------------------------------------- | ---------------------- |
| `apps/desktop/src/main/index.ts:105-188`                | カスタムプロトコル処理 |
| `apps/desktop/src/main/infrastructure/secureStorage.ts` | トークン暗号化・復号化 |
| `apps/desktop/src/main/ipc/authHandlers.ts`             | 認証IPCハンドラー      |
| `apps/desktop/src/renderer/store/slices/authSlice.ts`   | 認証状態管理           |

**認証フロー（PKCE）**:

1. アプリが PKCE code_verifier を生成
2. 外部ブラウザで OAuth 認証画面を開く
3. 認証完了後、カスタムプロトコル（`aiworkflow://auth/callback`）でコールバック
4. アプリがトークンを受信し、SafeStorage に保存

**セキュリティ設定**:

| 設定項目         | 値    | 実装箇所         | 理由                                |
| ---------------- | ----- | ---------------- | ----------------------------------- |
| contextIsolation | true  | main/index.ts:54 | Preload スクリプトの分離            |
| nodeIntegration  | false | main/index.ts:55 | Renderer からのシステムアクセス防止 |
| sandbox          | true  | main/index.ts:53 | Chromium サンドボックスの有効化     |
| webSecurity      | true  | -                | Same-Origin ポリシーの強制          |

**Discord OAuth設定の注意点**:

- リダイレクトURLは本番・開発環境それぞれ登録する
- スコープは必要最小限（identify, guilds）に限定する
- Client Secretは環境変数で管理し、クライアントサイドに露出しない
- トークンの有効期限を適切に設定する

### 認証UI表示規則

ユーザーへの表示は「ログイン」ではなく「続ける」を使用し、新規登録とログインの区別をユーザーに意識させない。

**ボタン表示**:

| 表示テキスト       | 用途                                  |
| ------------------ | ------------------------------------- |
| 「〇〇で続ける」   | OAuth認証ボタン（推奨）               |
| 「〇〇でログイン」 | 非推奨（新規/既存の区別を想起させる） |

例: 「Googleで続ける」「GitHubで続ける」「Discordで続ける」

### カスタムプロトコルのセキュリティ考慮事項

**実装状況**:

| 項目               | 状態        | 説明                                              |
| ------------------ | ----------- | ------------------------------------------------- |
| プロトコル登録     | ✅ 実装済み | electron-builder.ymlで`aiworkflow://`を登録       |
| コールバック処理   | ✅ 実装済み | app.setAsDefaultProtocolClient()で受信            |
| トークン抽出       | ✅ 実装済み | URLフラグメントからaccess_token/refresh_token抽出 |
| トークン暗号化保存 | ✅ 実装済み | safeStorage.encryptString()でRefresh Token暗号化  |
| URL検証            | ⚠️ 一部実装 | aiworkflow://スキーム確認のみ、詳細検証は未実装   |

**セキュリティリスクと対策**:

| リスク                | 対策状況    | 技術的負債                          |
| --------------------- | ----------- | ----------------------------------- |
| CSRF攻撃              | ✅ 対策済み | State parameter検証（DEBT-SEC-001完了） |
| 認可コード横取り      | ⚠️ 一部対策 | PKCE実装（DEBT-SEC-002）            |
| 不正なコールバックURL | ⚠️ 基本対策 | URL詳細検証（DEBT-SEC-003）         |

**worktree使用時の注意事項**:

macOSのLaunchServicesキャッシュにより、削除されたworktreeのパスが残ることがある。

**対策**:

- ✅ Gitフック（.husky/post-checkout）による自動クリーンアップ
- ✅ 手動スクリプト（scripts/setup-worktree.sh）による修復

**認証完了メッセージ**:

| 状態     | 判定条件                                   | 表示メッセージ                   |
| -------- | ------------------------------------------ | -------------------------------- |
| 新規登録 | created_at と last_sign_in_at の差 < 30秒  | 「アカウント登録が完了しました」 |
| ログイン | created_at と last_sign_in_at の差 >= 30秒 | 「ログインしました」             |

**連携済みプロバイダー表示**:

- 登録済みプロバイダーには「登録済み」バッジとチェックアイコンを表示
- メールアドレスも併記してどのアカウントで連携しているか明示
- 未連携プロバイダーには「連携する」ボタンを表示

### セッション管理

| 項目                 | 推奨値                            | 理由                                     |
| -------------------- | --------------------------------- | ---------------------------------------- |
| セッション有効期限   | 30日                              | 個人利用の利便性とセキュリティのバランス |
| アイドルタイムアウト | 7日                               | 長期放置への対策                         |
| Cookie属性           | HttpOnly, Secure, SameSite=Strict | XSS・CSRF防止                            |
| セッションID         | 暗号学的乱数生成                  | 推測攻撃の防止                           |

**セッションストレージの選択肢**:

| 方式                | メリット                       | デメリット       |
| ------------------- | ------------------------------ | ---------------- |
| JWT（ステートレス） | サーバー負荷軽減、スケーラブル | 即時無効化が困難 |
| DBセッション        | 即時無効化可能、細かい制御     | DBアクセス必須   |
| Redis               | 高速、即時無効化可能           | 追加インフラ必要 |

個人開発では、NextAuth.jsのデフォルトJWTセッションを推奨する。無効化が必要な場合はDBセッションに切り替える。

### アカウント削除

**ソフトデリート設計**:

アカウント削除は論理削除（ソフトデリート）で実装し、管理者による復元を可能にする。

| 項目         | 内容                                       |
| ------------ | ------------------------------------------ |
| 削除方式     | 論理削除（`deleted_at`タイムスタンプ設定） |
| 復元可能期間 | 無期限（管理者手動復元）                   |
| 物理削除     | 管理者の手動操作でのみ実行                 |
| Storage保持  | アバター等のファイルは保持                 |

**確認プロセス**:

1. ユーザーが削除ボタンをクリック
2. 確認ダイアログでメールアドレスの入力を要求
3. 入力されたメールと登録メールが完全一致した場合のみ削除を実行
4. 削除成功後、認証状態をクリアしログアウト

**セキュリティ考慮事項**:

- メールアドレス確認により誤操作を防止
- `profile:delete` IPCハンドラーは`withValidation`でsender検証
- 削除処理中のエラーでも認証状態は維持（ユーザー操作可能）
- 削除成功時のみ認証状態をクリア

**実装ファイル**:

- `apps/desktop/src/main/ipc/profileHandlers.ts` - ソフトデリートハンドラー
- `apps/desktop/src/renderer/components/organisms/AccountSection/index.tsx` - 確認ダイアログUI

### Local Agent認証

**認証フロー**:

1. Local AgentはCloud APIに対してAGENT_SECRET_KEYを含めてリクエストする
2. Cloud APIはキーを検証し、一致しない場合は401エラーを返す
3. 認証成功時はリクエストを処理する

**セキュリティ考慮事項**:

- AGENT_SECRET_KEYは32文字以上のランダム文字列とする
- キーは環境変数でのみ管理し、ログに出力しない
- 定期的なキーローテーションを行う（3ヶ月ごと推奨）
- 不正アクセス検知のため、認証失敗をログに記録する

---

## データ保護

### 機密情報の分類

| 分類 | 例                                     | 保護要件                                 |
| ---- | -------------------------------------- | ---------------------------------------- |
| 極秘 | APIキー、OAuthシークレット、DB認証情報 | 暗号化必須、アクセスログ、ローテーション |
| 機密 | ユーザー設定、ワークフロー内容         | 暗号化推奨、アクセス制御                 |
| 内部 | ログ、メトリクス                       | アクセス制御                             |
| 公開 | 公開ドキュメント                       | 制限なし                                 |

### 暗号化

**通信の暗号化**:

| 対象            | 方式    | 設定                               |
| --------------- | ------- | ---------------------------------- |
| Web通信         | TLS 1.3 | RailwayのHTTPS自動設定             |
| Local Agent通信 | HTTPS   | 自己署名証明書または Let's Encrypt |
| WebSocket       | WSS     | 同上                               |

**保存データの暗号化**:

| 対象              | 方式                     | 実装場所                         |
| ----------------- | ------------------------ | -------------------------------- |
| APIキー（DB保存） | AES-256-GCM              | アプリケーション層で暗号化後保存 |
| ローカルファイル  | Electron safeStorage API | デスクトップアプリ               |
| バックアップ      | GPG暗号化                | CI/CDパイプライン                |

**暗号化キーの管理**:

- マスターキーは環境変数で管理する
- キーの導出にはPBKDF2またはArgon2を使用する
- 暗号化キーとデータを同じ場所に保存しない
- キーローテーション時は古いキーでの復号→新しいキーでの暗号化を行う

### Electronでの機密情報管理

**safeStorage APIの使用**:

- OSのキーチェーン（macOS）/Credential Manager（Windows）を活用する
- 認証トークン、APIキーの保存に使用する
- アプリアンインストール時に自動削除される

**認証トークン保存（実装済み）**:

- **Refresh Token**: safeStorage.encryptString()で暗号化後、electron-storeに保存
- **Access Token**: メモリ上のみ保持（Zustand store）
- **保存場所**: `apps/desktop/src/main/infrastructure/secureStorage.ts`

**処理フロー**:

暗号化保存処理:

| ステップ | 処理内容                     | API/メソッド                                                         |
| -------- | ---------------------------- | -------------------------------------------------------------------- |
| 1        | 暗号化可能か確認             | `safeStorage.isEncryptionAvailable()`                                |
| 2        | トークンを暗号化             | `safeStorage.encryptString(token)`                                   |
| 3        | Base64エンコードして保存     | `getStore().set(REFRESH_TOKEN_KEY, encrypted.toString("base64"))`    |

復号化取得処理:

| ステップ | 処理内容                     | API/メソッド                                                         |
| -------- | ---------------------------- | -------------------------------------------------------------------- |
| 1        | Base64文字列を取得           | `getStore().get(REFRESH_TOKEN_KEY)`                                  |
| 2        | バッファに変換               | `Buffer.from(encryptedBase64, "base64")`                             |
| 3        | 復号化して返却               | `safeStorage.decryptString(encrypted)`                               |

**暗号化利用不可時の動作**:

- `safeStorage.isEncryptionAvailable()` が `false` の場合
- Refresh Tokenは保存されない（セッション維持不可）
- 警告ログを出力

**禁止事項**:

- ソースコード内への機密情報ハードコード
- localStorage/IndexedDBへの機密情報保存
- Electronアプリのasarアーカイブ内への機密情報埋め込み
- コンソールログへの機密情報出力

### AIプロバイダーAPIキー管理

ユーザーが登録するAIプロバイダー（OpenAI、Anthropic、Google、xAI）のAPIキーは以下のセキュリティ要件に従って管理する。

**ストレージ構成**:

| コンポーネント | 役割                              | 実装場所                 |
| -------------- | --------------------------------- | ------------------------ |
| 暗号化         | Electron safeStorage API          | `apiKeyStorage.ts`       |
| 永続化         | electron-store (Base64エンコード) | `userData/api-keys.json` |
| IPC通信        | contextBridge経由                 | `apiKeyHandlers.ts`      |
| 検証           | プロバイダーAPI呼び出し           | `apiKeyValidator.ts`     |

**セキュリティ設計**:

| 要件         | 実装                                                  |
| ------------ | ----------------------------------------------------- |
| 暗号化       | safeStorage.encryptString() → Base64 → electron-store |
| Renderer分離 | APIキー取得(get)はRenderer非公開（Main Processのみ）  |
| IPC検証      | withValidation() ラッパーでsender検証                 |
| ログ出力     | APIキー値は一切ログに出力しない                       |
| マスク表示   | UIではパスワードフィールド（type="password"）使用     |

**IPCチャネル**:

| チャネル        | 公開先    | 用途                       |
| --------------- | --------- | -------------------------- |
| apiKey:save     | Renderer  | キー保存                   |
| apiKey:delete   | Renderer  | キー削除                   |
| apiKey:validate | Renderer  | キー検証                   |
| apiKey:list     | Renderer  | 登録状況一覧               |
| apiKey:get      | Main Only | キー取得（Renderer非公開） |

**実装ファイル**:

- `apps/desktop/src/main/infrastructure/apiKeyStorage.ts` - 暗号化ストレージ
- `apps/desktop/src/main/ipc/apiKeyHandlers.ts` - IPCハンドラー
- `packages/shared/infrastructure/ai/apiKeyValidator.ts` - API検証
- `apps/desktop/src/renderer/components/organisms/ApiKeysSection/` - UI

### Claude Agent SDK 認証キー管理（TASK-FIX-16-1）

Claude Agent SDK を使用したスキル実行に必要な Anthropic API Key を管理する。

**アーキテクチャ**:

| コンポーネント   | 役割                              | 実装場所                                 |
| ---------------- | --------------------------------- | ---------------------------------------- |
| AuthKeyService   | キー管理の Facade                 | `apps/desktop/src/main/services/auth/`   |
| AuthKeyStorage   | safeStorage による暗号化・永続化  | `apps/desktop/src/main/services/auth/`   |
| IPC Handlers     | Renderer との通信                 | `apps/desktop/src/main/ipc/authKeyHandlers.ts` |
| Preload API      | contextBridge 経由の安全な公開    | `apps/desktop/src/preload/authKeyApi.ts` |
| SkillExecutor    | SDK query() 呼び出し時にキー使用  | `apps/desktop/src/main/services/skill/SkillExecutor.ts` |

**セキュリティ設計**:

| 要件               | 実装                                                      |
| ------------------ | --------------------------------------------------------- |
| 暗号化             | safeStorage.encryptString() → Base64 → electron-store     |
| Renderer 分離      | getKey() は Main Process のみ（Renderer 非公開）          |
| フォーマット検証   | `sk-ant-api` プレフィックスパターンによるバリデーション   |
| 環境変数フォールバック | ANTHROPIC_API_KEY 環境変数からの取得（開発用）        |
| IPC 検証           | withValidation() ラッパーで sender 検証                   |
| ログ出力           | キー値は一切ログに出力しない                              |

**キー取得優先順位**:

1. electron-store に保存された暗号化済みキー
2. ANTHROPIC_API_KEY 環境変数（フォールバック）

**IPCチャネル**:

| チャネル          | 公開先   | 用途                       |
| ----------------- | -------- | -------------------------- |
| auth-key:set      | Renderer | キー保存（暗号化）         |
| auth-key:exists   | Renderer | キー存在確認               |
| auth-key:validate | Renderer | Anthropic API でキー検証   |
| auth-key:delete   | Renderer | キー削除                   |
| (getKey)          | Main Only | キー取得（Renderer 非公開） |

**エラーコード**:

| コード | 名称                      | 説明                       | カテゴリ               |
| ------ | ------------------------- | -------------------------- | ---------------------- |
| 3001   | AUTH_KEY_NOT_SET          | 認証キー未設定             | External Service Error |
| 3002   | AUTH_KEY_INVALID          | 認証キー無効               | External Service Error |
| 3003   | VALIDATION_FAILED         | バリデーションエラー       | External Service Error |
| 3004   | NETWORK_ERROR             | ネットワークエラー         | External Service Error |
| 4001   | ENCRYPTION_UNAVAILABLE    | safeStorage 暗号化不可     | Infrastructure Error   |
| 4002   | STORAGE_ERROR             | ストレージエラー           | Infrastructure Error   |

**実装ファイル**:

- `apps/desktop/src/main/services/auth/AuthKeyService.ts` - キー管理サービス
- `apps/desktop/src/main/services/auth/types.ts` - 型定義
- `apps/desktop/src/main/ipc/authKeyHandlers.ts` - IPCハンドラー
- `apps/desktop/src/preload/authKeyApi.ts` - Preload API

---

## 変更履歴

| バージョン | 日付       | 変更内容                                                       |
| ---------- | ---------- | -------------------------------------------------------------- |
| v1.3.0     | 2026-02-08 | TASK-FIX-16-1: Claude Agent SDK認証キー管理セクション追加（AuthKeyService、IPCチャンネル4種、エラーコード6種） |
| v1.2.0     | 2026-02-06 | DEBT-SEC-001完了: State parameter検証実装済み、CSRF対策ステータス更新 |
| v1.1.0     | 2026-01-26 | spec-guidelines.md準拠: コードブロックを表形式に変換           |
| v1.0.0     | -          | 初版作成                                                       |
