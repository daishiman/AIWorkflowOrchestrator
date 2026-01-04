# 認証・プロフィール インターフェース仕様

> 本ドキュメントは統合システム設計仕様書の一部です。
> 管理: .claude/skills/aiworkflow-requirements/

---

## 認証・プロフィール型定義

Desktop アプリの認証機能で使用する型定義。

### AuthUser

認証済みユーザーの基本情報。

| フィールド   | 型             | 説明                    |
| ------------ | -------------- | ----------------------- |
| id           | string         | ユーザーID              |
| email        | string \| null | メールアドレス          |
| displayName  | string \| null | 表示名                  |
| avatarUrl    | string \| null | アバターURL             |
| createdAt    | string         | 作成日時（ISO8601）     |
| lastSignInAt | string         | 最終ログイン（ISO8601） |

### UserProfile

ユーザープロフィール詳細情報。

| フィールド  | 型                              | 説明                |
| ----------- | ------------------------------- | ------------------- |
| id          | string                          | ユーザーID          |
| displayName | string                          | 表示名              |
| email       | string                          | メールアドレス      |
| avatarUrl   | string \| null                  | アバターURL         |
| plan        | "free" \| "pro" \| "enterprise" | プラン種別          |
| createdAt   | string                          | 作成日時（ISO8601） |
| updatedAt   | string                          | 更新日時（ISO8601） |

### ExtendedUserProfile

ユーザープロフィール拡張情報（通知設定等を含む）。

| フィールド           | 型                   | 説明                       |
| -------------------- | -------------------- | -------------------------- |
| id                   | string               | ユーザーID                 |
| displayName          | string               | 表示名                     |
| email                | string               | メールアドレス             |
| avatarUrl            | string \| null       | アバターURL                |
| plan                 | string               | プラン種別                 |
| createdAt            | string               | 作成日時（ISO8601）        |
| updatedAt            | string               | 更新日時（ISO8601）        |
| timezone             | string               | タイムゾーン（IANA形式）   |
| locale               | string               | ロケール（ja, en等）       |
| notificationSettings | NotificationSettings | 通知設定                   |
| preferences          | object               | ユーザー設定（将来拡張用） |

### NotificationSettings

通知設定オブジェクト。

| フィールド       | 型      | 説明                       |
| ---------------- | ------- | -------------------------- |
| email            | boolean | メール通知を受け取る       |
| desktop          | boolean | デスクトップ通知を表示     |
| sound            | boolean | 通知時に音を鳴らす         |
| workflowComplete | boolean | ワークフロー完了時に通知   |
| workflowError    | boolean | ワークフローエラー時に通知 |

**デフォルト値**: すべて `true`

### OAuthProvider

対応する OAuth プロバイダー。

| 値      | 説明          |
| ------- | ------------- |
| google  | Google OAuth  |
| github  | GitHub OAuth  |
| discord | Discord OAuth |

### LinkedProvider

連携済みプロバイダー情報。

| フィールド | 型             | 説明                 |
| ---------- | -------------- | -------------------- |
| id         | string         | Identity ID          |
| provider   | string         | プロバイダー名       |
| email      | string \| null | プロバイダーのメール |
| name       | string \| null | プロバイダーの名前   |
| avatarUrl  | string \| null | アバターURL          |
| linkedAt   | string         | 連携日時（ISO8601）  |

### AuthGuardState

認証ガードの状態を表す Discriminated Union。

| status          | 追加フィールド | 説明     |
| --------------- | -------------- | -------- |
| checking        | -              | 確認中   |
| authenticated   | user: AuthUser | 認証済み |
| unauthenticated | -              | 未認証   |

### AuthErrorCode

認証エラーコード。

| コード                | 説明                   |
| --------------------- | ---------------------- |
| NETWORK_ERROR         | ネットワーク接続エラー |
| AUTH_FAILED           | 認証失敗               |
| TIMEOUT               | タイムアウト           |
| SESSION_EXPIRED       | セッション期限切れ     |
| PROVIDER_ERROR        | プロバイダーエラー     |
| PROFILE_UPDATE_FAILED | プロフィール更新失敗   |
| LINK_PROVIDER_FAILED  | アカウント連携失敗     |
| DATABASE_ERROR        | データベースエラー     |
| UNKNOWN               | 未分類エラー           |

**実装場所**: `packages/shared/types/auth.ts`, `apps/desktop/src/renderer/components/AuthGuard/types.ts`

---

## ワークスペース型定義

Desktop アプリの複数フォルダ管理機能で使用する型定義。

### Workspace

ワークスペースの状態を表す型。

| フィールド         | 型             | 説明                       |
| ------------------ | -------------- | -------------------------- |
| id                 | WorkspaceId    | ワークスペースID（固定値） |
| folders            | FolderEntry[]  | 登録フォルダ一覧           |
| lastSelectedFileId | FileId \| null | 最後に選択したファイルID   |
| createdAt          | Date           | 作成日時                   |
| updatedAt          | Date           | 更新日時                   |

### FolderEntry

登録フォルダのエントリ。

| フィールド    | 型            | 説明                 |
| ------------- | ------------- | -------------------- |
| id            | FolderId      | フォルダID（UUID）   |
| path          | FolderPath    | 絶対パス             |
| displayName   | string        | 表示名（フォルダ名） |
| isExpanded    | boolean       | 展開状態             |
| expandedPaths | Set\<string\> | 展開サブフォルダパス |
| addedAt       | Date          | 追加日時             |

### Branded Types

型安全性を高めるためのブランド型。

| 型名        | ベース型 | 説明                                |
| ----------- | -------- | ----------------------------------- |
| WorkspaceId | string   | ワークスペースID（"default"固定）   |
| FolderId    | string   | フォルダID（UUID形式）              |
| FolderPath  | string   | フォルダパス（絶対パス、"/"で開始） |
| FileId      | string   | ファイルID（UUID形式）              |
| FilePath    | string   | ファイルパス（絶対パス、"/"で開始） |

### セキュリティ制約

| 制約             | 実装                               |
| ---------------- | ---------------------------------- |
| パストラバーサル | ".." を含むパスは拒否              |
| 絶対パス         | "/" で開始しないパスは拒否         |
| パス正規化       | 連続スラッシュ・末尾スラッシュ除去 |
| ファイルサイズ   | 10MB 上限                          |

**実装場所**: `apps/desktop/src/renderer/store/types/workspace.ts`, `apps/desktop/src/main/ipc/validation.ts`

---
