# 要件定義書: Claude Agent SDK 認証キー管理基盤

## メタ情報

| 項目         | 内容                                     |
| ------------ | ---------------------------------------- |
| タスクID     | TASK-FIX-16-1-SDK-AUTH-INFRASTRUCTURE    |
| タスク名     | Claude Agent SDK用認証キー管理基盤の構築 |
| 作成日       | 2026-02-07                               |
| Phase        | 1 (要件定義)                             |
| ドキュメント | 要件定義書                               |

---

## 1. 概要

### 1.1 目的

Anthropic 認証キー（API Key）のセキュアな管理基盤を構築し、`SkillExecutor.callSDKQuery()` での SDK 呼び出し時に認証キーを安全に提供する。

### 1.2 背景

現状の `SkillExecutor.ts` L746-755 において、Claude Agent SDK の `query()` API 呼び出し時に認証キーが渡されていない。SDK は認証なしでは動作しないため、認証キー管理基盤の構築が必須である。

### 1.3 スコープ

#### 実装範囲

- 認証キーの暗号化保存機能
- 認証キーの取得・検証・削除機能
- IPC API の提供
- SkillExecutor への統合

#### 除外範囲

- Settings UI の実装（別タスクで対応）
- 複数キーの管理機能（将来拡張）
- キーのローテーション機能（将来拡張）

---

## 2. 機能要件

### FR-1: 認証キーの暗号化保存

| 項目    | 内容                                           |
| ------- | ---------------------------------------------- |
| 機能ID  | FR-1                                           |
| 機能名  | 認証キーの暗号化保存                           |
| 概要    | Anthropic API Key を暗号化して安全に永続化する |
| 優先度  | 必須（P0）                                     |
| 関連NFR | NFR-1 (セキュリティ)                           |

#### FR-1.1: safeStorage API による暗号化

- Electron `safeStorage` API を使用して認証キーを暗号化する
- 暗号化された認証キーを Base64 エンコードして保存する
- 暗号化が利用可能かどうかを `safeStorage.isEncryptionAvailable()` で確認する

#### FR-1.2: electron-store による永続化

- `electron-store` を使用して暗号化済みキーを永続化する
- Store 名: `auth-key-store`
- キー名: `encryptedAuthKey`

#### FR-1.3: 暗号化不可時のフォールバック

- `safeStorage.isEncryptionAvailable()` が `false` の場合:
  - 開発環境: 警告ログを出力し、平文で保存（テスト用途）
  - 本番環境: エラーを発生させ、保存を拒否

---

### FR-2: query() への認証キー渡し

| 項目    | 内容                                                |
| ------- | --------------------------------------------------- |
| 機能ID  | FR-2                                                |
| 機能名  | query() への認証キー渡し                            |
| 概要    | SkillExecutor が SDK 呼び出し時に認証キーを提供する |
| 優先度  | 必須（P0）                                          |
| 関連NFR | NFR-3 (パフォーマンス)                              |

#### FR-2.1: SkillExecutor への AuthKeyService 統合

- `SkillExecutor` コンストラクタで `IAuthKeyService` を受け取る
- 既存のコンストラクタシグネチャとの後方互換性を維持する

#### FR-2.2: callSDKQuery() での認証キー取得

- `callSDKQuery()` 実行時に `authKeyService.getKey()` を呼び出す
- 取得したキーを `query()` の `options.apiKey` に渡す
- キーが `null` の場合は `AuthKeyNotSetError` をスローする

#### FR-2.3: 遅延初期化パターン

- `AuthKeyService` 内の Store は必要時に初期化する（遅延初期化）
- テスト時にモックが間に合うよう、モジュールレベルの初期化を避ける

---

### FR-3: キー未設定時のエラーハンドリング

| 項目    | 内容                                 |
| ------- | ------------------------------------ |
| 機能ID  | FR-3                                 |
| 機能名  | キー未設定時のエラーハンドリング     |
| 概要    | 認証キー未設定時に適切なエラーを返す |
| 優先度  | 必須（P0）                           |
| 関連NFR | NFR-1 (セキュリティ)                 |

#### FR-3.1: AuthKeyNotSetError

- エラーコード: `3001` (External Service Error 範囲)
- エラーメッセージ: `"Anthropic API Key is not configured. Please set it in Settings."`
- リトライ可能フラグ: `false`

#### FR-3.2: AuthKeyInvalidError

- エラーコード: `3002` (External Service Error 範囲)
- エラーメッセージ: `"The provided Anthropic API Key is invalid."`
- リトライ可能フラグ: `false`

#### FR-3.3: ユーザーガイダンス

- エラーメッセージには設定画面への誘導を含める
- Renderer に送信されるエラーは Skill 実行エラーとして表示される

---

### FR-4: IPC API 提供

| 項目    | 内容                                    |
| ------- | --------------------------------------- |
| 機能ID  | FR-4                                    |
| 機能名  | IPC API 提供                            |
| 概要    | Renderer から認証キー操作を行う IPC API |
| 優先度  | 必須（P0）                              |
| 関連NFR | NFR-1 (セキュリティ)                    |

#### FR-4.1: auth-key:set

- チャンネル: `auth-key:set`
- 入力: `{ key: string }`
- 出力: `{ success: boolean }`
- 処理: 認証キーを暗号化して保存

#### FR-4.2: auth-key:exists

- チャンネル: `auth-key:exists`
- 入力: なし
- 出力: `{ exists: boolean }`
- 処理: 認証キーが設定されているか確認

#### FR-4.3: auth-key:validate

- チャンネル: `auth-key:validate`
- 入力: `{ key: string }`
- 出力: `{ valid: boolean, error?: string }`
- 処理: Anthropic API を呼び出してキーの有効性を確認

#### FR-4.4: auth-key:delete

- チャンネル: `auth-key:delete`
- 入力: なし
- 出力: `{ success: boolean }`
- 処理: 保存されている認証キーを削除

---

## 3. 非機能要件

### NFR-1: セキュリティ

| 項目            | 要件                                            | 検証方法                            |
| --------------- | ----------------------------------------------- | ----------------------------------- |
| キー暗号化      | `safeStorage` API による暗号化必須              | electron-store 内容の Base64 確認   |
| プロセス制限    | 認証キーは Main Process のみでアクセス可能      | Renderer からの直接アクセス不可確認 |
| Renderer 非送信 | 認証キーを IPC 経由で Renderer に送信しない     | IPC ハンドラーのレスポンス確認      |
| ログ除外        | 認証キーをログに含めない（`[REDACTED]` に置換） | ログ出力のレビュー                  |
| フォールバック  | 暗号化不可時は本番環境でエラー、開発環境で警告  | `NODE_ENV` による分岐テスト         |
| IPC 検証        | 全ハンドラーで送信元ウィンドウを検証            | `validateIpcSender` の呼び出し確認  |

### NFR-2: 可用性

| 項目                   | 要件                                       | 検証方法                     |
| ---------------------- | ------------------------------------------ | ---------------------------- |
| 環境変数フォールバック | `ANTHROPIC_API_KEY` 環境変数からの読み取り | 環境変数設定時の動作確認     |
| 遅延初期化             | Store は必要時に初期化（テスト対応）       | ユニットテストでのモック確認 |
| 既存機能互換           | 既存の認証フローに影響を与えない           | 認証関連の回帰テスト         |

### NFR-3: パフォーマンス

| 項目               | 要件                             | 検証方法                 |
| ------------------ | -------------------------------- | ------------------------ |
| キー取得レイテンシ | 10ms 以内                        | パフォーマンス計測テスト |
| 暗号化/復号コスト  | safeStorage の標準性能に依存     | ベンチマークテスト       |
| キャッシュ         | 取得したキーをメモリにキャッシュ | 連続呼び出しの性能測定   |

---

## 4. 外部依存関係

| 依存先                           | バージョン | 用途                    |
| -------------------------------- | ---------- | ----------------------- |
| `electron.safeStorage`           | Electron   | 認証キーの暗号化/復号   |
| `electron-store`                 | 既存       | 暗号化済みキーの永続化  |
| `@anthropic-ai/claude-agent-sdk` | 最新       | キー検証用 API 呼び出し |

---

## 5. 統合ポイント

### 5.1 SkillExecutor 統合

- `SkillExecutor` が `IAuthKeyService` を依存注入で受け取る
- `callSDKQuery()` 内で `getKey()` を呼び出し、SDK に渡す

### 5.2 IPC ハンドラー登録

- `registerAuthKeyHandlers()` を `registerAllIpcHandlers()` から呼び出す
- 既存の IPC 登録パターンに準拠

### 5.3 Preload Bridge 拡張

- `window.electronAPI.authKey` として API を公開
- `contextBridge.exposeInMainWorld()` で安全に公開

---

## 6. セキュリティ考慮事項

### 6.1 04-electron-security.md 準拠

| 原則             | 対応                                    |
| ---------------- | --------------------------------------- |
| 最小権限         | 認証キーは Main Process のみでアクセス  |
| 多層防御         | safeStorage + electron-store の二重保護 |
| フェイルセキュア | 暗号化不可時は本番環境でエラー          |
| 完全仲介         | 全 IPC ハンドラーで sender 検証         |

### 6.2 ログ除外

認証キーはログ出力時に `[REDACTED]` に置換する。既存の `SENSITIVE_KEY_PATTERNS` に `apiKey`、`anthropic_api_key` を追加。

---

## 7. 除外事項と将来拡張

### 7.1 除外事項

- Settings UI の実装（別タスクで対応）
- 複数 API キーの管理
- キーのローテーション機能
- キーの有効期限管理

### 7.2 将来拡張

- 複数プロバイダー対応（OpenAI, Google など）
- キーの暗号化強度オプション
- キー使用履歴の監査ログ
