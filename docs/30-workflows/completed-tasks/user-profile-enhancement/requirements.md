# ユーザープロフィール詳細管理機能 - 要件定義書

## メタ情報

| 項目       | 内容                 |
| ---------- | -------------------- |
| 文書ID     | REQ-USER-PROFILE-001 |
| 作成日     | 2025-12-10           |
| 担当者     | .claude/agents/req-analyst.md         |
| ステータス | 確定                 |
| 関連タスク | TASK-USER-DATA-02    |

---

## 1. 概要

### 1.1 目的

ユーザープロフィールに詳細情報（タイムゾーン、言語、通知設定）を追加し、パーソナライズされた体験を提供する。

### 1.2 背景

現在のユーザープロフィール管理は以下の項目のみをサポート:

- `display_name` (表示名)
- `email` (メールアドレス)
- `avatar_url` (アバターURL)
- `plan` (プラン)

グローバルユーザー対応やワークフローのスケジュール実行において、追加の設定項目が必要。

### 1.3 スコープ

#### 含むもの

- タイムゾーン設定の追加・永続化
- 言語/ロケール設定の追加
- 通知設定（メール、デスクトップ、サウンド）の管理
- プロフィール情報のエクスポート/インポート機能
- Supabase `user_profiles` テーブルの拡張
- electron-store キャッシュの拡張

#### 含まないもの

- 多言語対応の翻訳ファイル作成（i18n実装は別タスク）
- 実際の通知送信機能（設定のみ）
- ソーシャル機能（プロフィール公開等）

---

## 2. 機能要件

### 2.1 タイムゾーン設定 (FR-001)

| 項目   | 内容                                           |
| ------ | ---------------------------------------------- |
| 要件ID | FR-001                                         |
| 機能名 | タイムゾーン設定                               |
| 優先度 | 必須                                           |
| 説明   | ユーザーが自身のタイムゾーンを設定・変更できる |

#### 詳細仕様

- **データ型**: VARCHAR(50) - IANA タイムゾーン形式
- **デフォルト値**: `Asia/Tokyo`
- **選択肢**: IANA Time Zone Database の全タイムゾーン
- **UI**: ドロップダウンセレクター（検索可能）
- **保存先**: Supabase `user_profiles.timezone`

#### 受け入れ基準

- [ ] タイムゾーンをドロップダウンから選択できる
- [ ] 検索機能で絞り込みができる
- [ ] 変更が即座に保存される
- [ ] 再起動後も設定が保持される
- [ ] オフライン時はキャッシュから読み込まれる

---

### 2.2 言語/ロケール設定 (FR-002)

| 項目   | 内容                                     |
| ------ | ---------------------------------------- |
| 要件ID | FR-002                                   |
| 機能名 | 言語/ロケール設定                        |
| 優先度 | 必須                                     |
| 説明   | ユーザーがUIの表示言語を設定・変更できる |

#### 詳細仕様

- **データ型**: VARCHAR(10) - BCP 47 言語タグ
- **デフォルト値**: `ja`
- **選択肢**:
  - `ja` - 日本語
  - `en` - English
  - `zh-CN` - 简体中文
  - `zh-TW` - 繁體中文
  - `ko` - 한국어
- **UI**: ドロップダウンセレクター
- **保存先**: Supabase `user_profiles.locale`

#### 受け入れ基準

- [ ] 言語をドロップダウンから選択できる
- [ ] 変更が即座に保存される
- [ ] 再起動後も設定が保持される
- [ ] ※実際のUIローカライズは別タスクで実装

---

### 2.3 通知設定 (FR-003)

| 項目   | 内容                                       |
| ------ | ------------------------------------------ |
| 要件ID | FR-003                                     |
| 機能名 | 通知設定                                   |
| 優先度 | 必須                                       |
| 説明   | ユーザーが通知の受信方法を細かく設定できる |

#### 詳細仕様

- **データ型**: JSONB
- **デフォルト値**:
  ```json
  {
    "email": true,
    "desktop": true,
    "sound": true,
    "workflowComplete": true,
    "workflowError": true
  }
  ```
- **UI**: トグルスイッチ群
- **保存先**: Supabase `user_profiles.notification_settings`

#### 通知設定項目

| 設定キー           | 説明                       | デフォルト |
| ------------------ | -------------------------- | ---------- |
| `email`            | メール通知を受け取る       | true       |
| `desktop`          | デスクトップ通知を表示する | true       |
| `sound`            | 通知音を鳴らす             | true       |
| `workflowComplete` | ワークフロー完了時に通知   | true       |
| `workflowError`    | ワークフローエラー時に通知 | true       |

#### 受け入れ基準

- [ ] 各通知設定をトグルでON/OFFできる
- [ ] 変更が即座に保存される
- [ ] 再起動後も設定が保持される
- [ ] JSONBで柔軟に拡張可能

---

### 2.4 プロフィールエクスポート (FR-004)

| 項目   | 内容                                                       |
| ------ | ---------------------------------------------------------- |
| 要件ID | FR-004                                                     |
| 機能名 | プロフィールエクスポート                                   |
| 優先度 | 推奨                                                       |
| 説明   | ユーザーがプロフィール情報をJSONファイルとしてエクスポート |

#### 詳細仕様

- **出力形式**: JSON
- **ファイル名**: `profile-export-{YYYY-MM-DD}.json`
- **含むデータ**:
  - display_name
  - timezone
  - locale
  - notification_settings
  - preferences
- **除外データ**（セキュリティ）:
  - email（個人情報）
  - avatar_url（外部URL）
  - APIキー
  - トークン

#### 受け入れ基準

- [ ] エクスポートボタンでJSONファイルをダウンロードできる
- [ ] 機密情報が含まれていない
- [ ] ファイル名に日付が含まれる

---

### 2.5 プロフィールインポート (FR-005)

| 項目   | 内容                                       |
| ------ | ------------------------------------------ |
| 要件ID | FR-005                                     |
| 機能名 | プロフィールインポート                     |
| 優先度 | 推奨                                       |
| 説明   | エクスポートしたJSONファイルから設定を復元 |

#### 詳細仕様

- **入力形式**: JSON（エクスポート形式と同一）
- **バリデーション**: Zodスキーマで検証
- **マージ戦略**: インポートデータで上書き

#### 受け入れ基準

- [ ] インポートボタンでファイル選択ダイアログが開く
- [ ] 有効なJSONファイルのみ受け付ける
- [ ] 不正なデータの場合エラーメッセージを表示
- [ ] インポート成功時に設定が反映される

---

## 3. 非機能要件

### 3.1 パフォーマンス (NFR-001)

| 項目     | 内容           |
| -------- | -------------- |
| 要件ID   | NFR-001        |
| カテゴリ | パフォーマンス |

| 指標                   | 基準      |
| ---------------------- | --------- |
| 設定画面の読み込み時間 | 500ms以内 |
| 設定変更の保存時間     | 1秒以内   |
| エクスポート処理時間   | 2秒以内   |
| インポート処理時間     | 3秒以内   |

---

### 3.2 可用性 (NFR-002)

| 項目     | 内容    |
| -------- | ------- |
| 要件ID   | NFR-002 |
| カテゴリ | 可用性  |

#### オフライン対応

- キャッシュから最後の設定を読み込む（24時間TTL）
- オフライン時は設定変更をローカルに保存
- オンライン復帰時にSupabaseと同期

#### エラーハンドリング

- ネットワークエラー時はリトライ（最大3回）
- 保存失敗時はユーザーに通知
- データ不整合時はSupabaseを正として同期

---

### 3.3 セキュリティ (NFR-003)

| 項目     | 内容         |
| -------- | ------------ |
| 要件ID   | NFR-003      |
| カテゴリ | セキュリティ |

#### データ保護

- RLS（Row Level Security）により自分のデータのみアクセス可能
- エクスポートデータに機密情報を含めない
- インポート時は厳密なバリデーション

#### 入力検証

- タイムゾーン: IANAタイムゾーンリストに存在するか検証
- ロケール: サポート言語リストに存在するか検証
- 通知設定: Zodスキーマでboolean値を検証

---

### 3.4 保守性 (NFR-004)

| 項目     | 内容    |
| -------- | ------- |
| 要件ID   | NFR-004 |
| カテゴリ | 保守性  |

#### 拡張性

- 通知設定はJSONBで柔軟に拡張可能
- 新しい設定項目を追加しやすい構造
- 型定義とZodスキーマで型安全性を確保

#### テスト容易性

- 単体テストカバレッジ80%以上
- モック可能なインターフェース設計

---

## 4. データ定義

### 4.1 拡張カラム定義

| カラム名              | データ型    | NULL許容 | デフォルト値 | 説明             |
| --------------------- | ----------- | -------- | ------------ | ---------------- |
| timezone              | VARCHAR(50) | YES      | 'Asia/Tokyo' | IANAタイムゾーン |
| locale                | VARCHAR(10) | YES      | 'ja'         | BCP 47言語タグ   |
| notification_settings | JSONB       | YES      | (後述)       | 通知設定         |
| preferences           | JSONB       | YES      | '{}'         | 将来の拡張用     |

### 4.2 notification_settings スキーマ

```typescript
interface NotificationSettings {
  email: boolean; // メール通知
  desktop: boolean; // デスクトップ通知
  sound: boolean; // 通知音
  workflowComplete: boolean; // ワークフロー完了通知
  workflowError: boolean; // ワークフローエラー通知
}
```

### 4.3 preferences スキーマ（将来の拡張用）

```typescript
interface UserPreferences {
  // 将来の拡張用
  [key: string]: unknown;
}
```

---

## 5. 型定義

### 5.1 ExtendedUserProfile

```typescript
interface ExtendedUserProfile {
  id: string;
  displayName: string;
  email: string;
  avatarUrl: string | null;
  plan: "free" | "pro" | "enterprise";
  timezone: string; // 新規
  locale: string; // 新規
  notificationSettings: NotificationSettings; // 新規
  preferences: UserPreferences; // 新規
  createdAt: string;
  updatedAt: string;
}
```

### 5.2 Zodスキーマ

```typescript
import { z } from "zod";

export const notificationSettingsSchema = z.object({
  email: z.boolean().default(true),
  desktop: z.boolean().default(true),
  sound: z.boolean().default(true),
  workflowComplete: z.boolean().default(true),
  workflowError: z.boolean().default(true),
});

export const userPreferencesSchema = z.record(z.unknown()).default({});

export const extendedUserProfileSchema = z.object({
  id: z.string().uuid(),
  displayName: z.string().min(1).max(100),
  email: z.string().email(),
  avatarUrl: z.string().url().nullable(),
  plan: z.enum(["free", "pro", "enterprise"]),
  timezone: z.string().min(1).max(50),
  locale: z.string().min(2).max(10),
  notificationSettings: notificationSettingsSchema,
  preferences: userPreferencesSchema,
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
```

---

## 6. IPC チャネル定義

### 6.1 新規IPCチャネル

| チャネル名                     | 方向          | 説明                     |
| ------------------------------ | ------------- | ------------------------ |
| `profile:update-timezone`      | Renderer→Main | タイムゾーン更新         |
| `profile:update-locale`        | Renderer→Main | ロケール更新             |
| `profile:update-notifications` | Renderer→Main | 通知設定更新             |
| `profile:export`               | Renderer→Main | プロフィールエクスポート |
| `profile:import`               | Renderer→Main | プロフィールインポート   |

### 6.2 IPCペイロード

```typescript
// profile:update-timezone
interface UpdateTimezonePayload {
  timezone: string; // IANA timezone
}

// profile:update-locale
interface UpdateLocalePayload {
  locale: string; // BCP 47 tag
}

// profile:update-notifications
interface UpdateNotificationsPayload {
  notificationSettings: NotificationSettings;
}

// profile:export
interface ExportProfileResponse {
  success: boolean;
  filePath?: string;
  error?: string;
}

// profile:import
interface ImportProfilePayload {
  filePath: string;
}
```

---

## 7. UI設計要件

### 7.1 設定画面レイアウト

```
┌─────────────────────────────────────────────────────────────┐
│ Settings                                                     │
├─────────────────────────────────────────────────────────────┤
│ ┌─ Profile ───────────────────────────────────────────────┐ │
│ │ Display Name: [John Doe               ]                 │ │
│ │ Email: john.doe@example.com (読み取り専用)              │ │
│ │ Avatar: [Change Avatar]                                 │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                              │
│ ┌─ Regional Settings ─────────────────────────────────────┐ │
│ │ Timezone: [Asia/Tokyo (UTC+9)      ▼]                   │ │
│ │ Language: [日本語                  ▼]                   │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                              │
│ ┌─ Notifications ─────────────────────────────────────────┐ │
│ │ Email Notifications           [====]                    │ │
│ │ Desktop Notifications         [====]                    │ │
│ │ Sound                         [====]                    │ │
│ │ ─────────────────────────────────────                   │ │
│ │ Workflow Complete             [====]                    │ │
│ │ Workflow Error                [====]                    │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                              │
│ ┌─ Data Management ───────────────────────────────────────┐ │
│ │ [Export Profile]  [Import Profile]                      │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### 7.2 アクセシビリティ要件

- すべてのフォーム要素にラベルを関連付け
- キーボードナビゲーション対応
- スクリーンリーダー対応
- 十分なコントラスト比を確保

---

## 8. テスト要件

### 8.1 単体テスト

| テスト対象          | テスト内容                       |
| ------------------- | -------------------------------- |
| updateTimezone      | 有効/無効なタイムゾーンの処理    |
| updateLocale        | 有効/無効なロケールの処理        |
| updateNotifications | 各設定の更新処理                 |
| exportProfile       | エクスポートデータの整合性       |
| importProfile       | インポートデータのバリデーション |

### 8.2 統合テスト

| テスト対象     | テスト内容                  |
| -------------- | --------------------------- |
| Supabase同期   | 設定変更がDBに反映されるか  |
| キャッシュ同期 | オフライン→オンラインの同期 |
| IPC通信        | Renderer↔Main間の通信       |

### 8.3 E2Eテスト

| テスト対象              | テスト内容                |
| ----------------------- | ------------------------- |
| 設定画面フロー          | 設定変更→保存→再起動→確認 |
| エクスポート/インポート | ファイル操作の一連の流れ  |

---

## 9. データ分類とセキュリティ

### 9.1 データ分類

| データ項目            | 分類         | エクスポート | 説明                       |
| --------------------- | ------------ | ------------ | -------------------------- |
| display_name          | 公開可能     | 含める       | ユーザーが設定した公開情報 |
| timezone              | プライベート | 含める       | 間接的位置情報（通知の上） |
| locale                | プライベート | 含める       | 言語設定                   |
| notification_settings | プライベート | 含める       | アプリ設定                 |
| preferences           | プライベート | 含める       | カスタマイズ設定           |
| email                 | 機密         | **除外**     | 個人識別情報 (PII)         |
| avatar_url            | 機密         | **除外**     | Supabase Storage URL       |
| plan                  | 機密         | **除外**     | サブスクリプション情報     |

### 9.2 エクスポート/インポート制限

| 制限項目           | 値  | 説明                                  |
| ------------------ | --- | ------------------------------------- |
| 最大ファイルサイズ | 1MB | DoS攻撃対策                           |
| バージョン形式     | 1.0 | 互換性管理                            |
| バリデーション     | Zod | 厳密な型チェック + 追加フィールド拒否 |

### 9.3 エラーハンドリング方針

- 内部エラー詳細はログのみ記録
- ユーザーには汎用メッセージを返却
- APIキー・トークンはエラーメッセージに含めない

---

## 10. 用語集

| 用語          | 定義                                                             |
| ------------- | ---------------------------------------------------------------- |
| IANA Timezone | Internet Assigned Numbers Authority が管理するタイムゾーン識別子 |
| BCP 47        | 言語タグの国際標準（例: ja, en-US, zh-CN）                       |
| TTL           | Time To Live - キャッシュの有効期限                              |
| RLS           | Row Level Security - 行レベルのアクセス制御                      |
| JSONB         | PostgreSQLのバイナリJSON型                                       |
| PII           | Personally Identifiable Information - 個人識別情報               |

---

## 11. 変更履歴

| 版  | 日付       | 変更内容                                   | 担当者       |
| --- | ---------- | ------------------------------------------ | ------------ |
| 1.0 | 2025-12-10 | 初版作成                                   | .claude/agents/req-analyst.md |
| 1.1 | 2025-12-10 | レビュー指摘対応: データ分類セクション追加 | Review Team  |
