# Electron Main Process サービス / advanced specification

> 親仕様書: [arch-electron-services.md](arch-electron-services.md)
> 役割: advanced specification

## スキル管理サービス

### PermissionResolver（TASK-3-1-C実装）

> **実装完了**: 2026-01-25（TASK-3-1-C）
> **参照**: [interfaces-agent-sdk.md](interfaces-agent-sdk.md) の PermissionRequest/PermissionResponse型
> **実装ガイド**: [permission-request-hook.md](../../../docs/guides/permission-request-hook.md)

権限リクエストの非同期待機と解決を管理するクラス。Claude Agent SDK の PermissionRequest Hook を実装。

#### コンポーネント構成

PermissionResolverはMain Process（Electron）上で動作し、以下の階層構造を持つ。

**SkillExecutor（スキル実行エンジン）**

| メソッド                   | 説明                        |
| -------------------------- | --------------------------- |
| sendPermissionRequest()    | IPC経由で権限リクエスト送信 |
| handlePermissionResponse() | IPC経由で権限応答受信       |
| sanitizeArgs()             | 機密情報サニタイズ          |
| getPermissionReason()      | 理由文生成                  |

**PermissionResolver（権限解決管理）**

| メソッド            | 説明           |
| ------------------- | -------------- |
| waitForResponse()   | Promise待機    |
| resolveRequest()    | 応答解決       |
| cancelRequest()     | 個別キャンセル |
| cancelAllRequests() | 全キャンセル   |

#### PermissionResolver API

| メソッド            | 引数                                 | 戻り値                        | 説明           |
| ------------------- | ------------------------------------ | ----------------------------- | -------------- |
| `waitForResponse`   | `requestId, signal?, timeoutMs?`     | `Promise<PermissionResponse>` | 権限応答を待機 |
| `resolveRequest`    | `response: PermissionResponse`       | `void`                        | 権限応答を解決 |
| `cancelRequest`     | `requestId: string, reason?: string` | `void`                        | 個別キャンセル |
| `cancelAllRequests` | `reason?: string`                    | `void`                        | 全キャンセル   |

#### IPC チャネル

| チャネル                    | 方向            | データ型             | 説明           |
| --------------------------- | --------------- | -------------------- | -------------- |
| `skill:permission:request`  | Main → Renderer | `PermissionRequest`  | 権限リクエスト |
| `skill:permission:response` | Renderer → Main | `PermissionResponse` | 権限応答       |

#### 機密キーサニタイズ（14パターン）

機密情報を含むキーは以下の14パターンで検出され、サニタイズされる。定数名は `SENSITIVE_KEY_PATTERNS`。

| No. | パターン      | 説明                        |
| --- | ------------- | --------------------------- |
| 1   | password      | パスワード                  |
| 2   | passwd        | パスワード（短縮形）        |
| 3   | pwd           | パスワード（省略形）        |
| 4   | secret        | シークレット                |
| 5   | token         | トークン                    |
| 6   | bearer        | Bearerトークン              |
| 7   | key           | キー                        |
| 8   | apikey        | APIキー（連結形）           |
| 9   | api_key       | APIキー（アンダースコア形） |
| 10  | credential    | 認証情報                    |
| 11  | auth          | 認証                        |
| 12  | access_token  | アクセストークン            |
| 13  | refresh_token | リフレッシュトークン        |
| 14  | private_key   | 秘密鍵                      |

#### 定数

| 定数                            | 値    | 説明                   |
| ------------------------------- | ----- | ---------------------- |
| `PERMISSION_REQUEST_TIMEOUT_MS` | 30000 | タイムアウト（ミリ秒） |
| `MAX_ARG_LENGTH`                | 500   | 引数表示最大長         |

#### データフロー

スキル実行時の権限リクエスト処理フローを以下に示す。

**フェーズ1: Main Process（権限リクエスト送信）**

| ステップ | 処理                         | 詳細                                  |
| -------- | ---------------------------- | ------------------------------------- |
| 1-1      | SkillExecutor.executeSkill() | スキル実行開始                        |
| 1-2      | PermissionRequest Hook発火   | 権限確認が必要な操作を検出            |
| 1-3      | sendPermissionRequest()      | 権限リクエスト送信処理開始            |
| 1-3a     | sanitizeArgs()               | 機密情報を除去                        |
| 1-3b     | getPermissionReason()        | 理由文を生成                          |
| 1-3c     | IPC送信                      | skill:permission:request チャネル経由 |

**フェーズ2: Renderer Process（ユーザー応答）**

| ステップ | 処理                 | 詳細                                   |
| -------- | -------------------- | -------------------------------------- |
| 2-1      | PermissionDialog表示 | 権限確認ダイアログを表示               |
| 2-2      | ユーザー選択         | 許可または拒否を選択                   |
| 2-3      | IPC送信              | skill:permission:response チャネル経由 |

**フェーズ3: Main Process（応答処理）**

| ステップ | 処理                                | 詳細                                   |
| -------- | ----------------------------------- | -------------------------------------- |
| 3-1      | handlePermissionResponse()          | 権限応答を受信                         |
| 3-2      | PermissionResolver.resolveRequest() | 待機中のPromiseを解決                  |
| 3-3      | SkillExecutor続行/中止              | 結果に応じてスキル実行を継続または中止 |

---

