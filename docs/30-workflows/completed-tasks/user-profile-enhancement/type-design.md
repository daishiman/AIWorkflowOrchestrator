# ユーザープロフィール拡張 - 型定義・バリデーション設計書

## メタ情報

| 項目       | 内容                  |
| ---------- | --------------------- |
| 文書ID     | TYPE-USER-PROFILE-001 |
| 作成日     | 2025-12-10            |
| 担当者     | @schema-def           |
| ステータス | 確定                  |
| 関連タスク | T-01-2                |

---

## 1. 概要

### 1.1 目的

拡張プロフィール機能のTypeScript型定義とZodバリデーションスキーマを設計する。

### 1.2 設計方針

- **型安全性**: すべてのデータに厳密な型定義を適用
- **ランタイムバリデーション**: Zodスキーマでバリデーションを実施
- **後方互換性**: 既存の `UserProfile` 型を拡張
- **再利用性**: 共通型を `packages/shared/types/` に配置

---

## 2. 型定義

### 2.1 基本型

```typescript
// packages/shared/types/profile.ts

/**
 * IANA タイムゾーン識別子
 * @example "Asia/Tokyo", "America/New_York", "Europe/London"
 */
export type Timezone = string;

/**
 * BCP 47 言語タグ
 * @example "ja", "en", "zh-CN", "zh-TW", "ko"
 */
export type Locale = "ja" | "en" | "zh-CN" | "zh-TW" | "ko";

/**
 * サポートするロケール一覧
 */
export const SUPPORTED_LOCALES: Locale[] = ["ja", "en", "zh-CN", "zh-TW", "ko"];

/**
 * ロケール表示名マッピング
 */
export const LOCALE_DISPLAY_NAMES: Record<Locale, string> = {
  ja: "日本語",
  en: "English",
  "zh-CN": "简体中文",
  "zh-TW": "繁體中文",
  ko: "한국어",
};
```

### 2.2 通知設定型

```typescript
// packages/shared/types/profile.ts

/**
 * 通知設定
 */
export interface NotificationSettings {
  /** メール通知を受け取る */
  email: boolean;
  /** デスクトップ通知を表示する */
  desktop: boolean;
  /** 通知音を鳴らす */
  sound: boolean;
  /** ワークフロー完了時に通知 */
  workflowComplete: boolean;
  /** ワークフローエラー時に通知 */
  workflowError: boolean;
}

/**
 * デフォルトの通知設定
 */
export const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettings = {
  email: true,
  desktop: true,
  sound: true,
  workflowComplete: true,
  workflowError: true,
};
```

### 2.3 ユーザー設定型

```typescript
// packages/shared/types/profile.ts

/**
 * ユーザー設定（将来の拡張用）
 */
export interface UserPreferences {
  [key: string]: unknown;
}

/**
 * デフォルトのユーザー設定
 */
export const DEFAULT_USER_PREFERENCES: UserPreferences = {};
```

### 2.4 拡張プロフィール型

```typescript
// packages/shared/types/profile.ts

import { UserProfile } from "./auth";

/**
 * 拡張ユーザープロフィール
 * 既存の UserProfile を拡張
 */
export interface ExtendedUserProfile extends UserProfile {
  /** タイムゾーン (IANA形式) */
  timezone: Timezone;
  /** ロケール (BCP 47形式) */
  locale: Locale;
  /** 通知設定 */
  notificationSettings: NotificationSettings;
  /** ユーザー設定 */
  preferences: UserPreferences;
}

/**
 * デフォルトの拡張プロフィール値
 */
export const DEFAULT_EXTENDED_PROFILE: Pick<
  ExtendedUserProfile,
  "timezone" | "locale" | "notificationSettings" | "preferences"
> = {
  timezone: "Asia/Tokyo",
  locale: "ja",
  notificationSettings: DEFAULT_NOTIFICATION_SETTINGS,
  preferences: DEFAULT_USER_PREFERENCES,
};
```

### 2.5 IPC ペイロード型

```typescript
// packages/shared/types/profile.ts

/**
 * タイムゾーン更新ペイロード
 */
export interface UpdateTimezonePayload {
  timezone: Timezone;
}

/**
 * ロケール更新ペイロード
 */
export interface UpdateLocalePayload {
  locale: Locale;
}

/**
 * 通知設定更新ペイロード
 */
export interface UpdateNotificationSettingsPayload {
  notificationSettings: Partial<NotificationSettings>;
}

/**
 * プロフィールエクスポートレスポンス
 */
export interface ProfileExportResponse {
  success: boolean;
  filePath?: string;
  error?: string;
}

/**
 * プロフィールインポートペイロード
 */
export interface ProfileImportPayload {
  filePath: string;
}

/**
 * プロフィールインポートレスポンス
 */
export interface ProfileImportResponse {
  success: boolean;
  profile?: Partial<ExtendedUserProfile>;
  error?: string;
}
```

### 2.6 エクスポートデータ型

```typescript
// packages/shared/types/profile.ts

/**
 * プロフィールエクスポートデータ
 *
 * セキュリティ考慮事項:
 * - email: 除外 (個人識別情報)
 * - avatarUrl: 除外 (Supabase Storage URL = ユーザー識別可能)
 * - id: 除外 (内部識別子)
 *
 * 含める理由:
 * - displayName: ユーザーが設定した公開情報
 * - timezone: おおよその地域情報（ユーザーに通知の上エクスポート）
 * - locale: 言語設定（機密性低）
 * - notificationSettings: アプリ設定（機密性低）
 * - preferences: カスタマイズ設定（機密性低）
 */
export interface ProfileExportData {
  /** エクスポート形式バージョン */
  version: "1.0";
  /** エクスポート日時 (ISO 8601) */
  exportedAt: string;
  /** 表示名 */
  displayName: string;
  /** タイムゾーン (間接的位置情報として扱う) */
  timezone: Timezone;
  /** ロケール */
  locale: Locale;
  /** 通知設定 */
  notificationSettings: NotificationSettings;
  /** ユーザー設定 */
  preferences: UserPreferences;

  // 以下は明示的に除外 (型定義に含めない)
  // email: EXCLUDED - 個人識別情報
  // avatarUrl: EXCLUDED - Supabase Storage URL
  // id: EXCLUDED - 内部識別子
  // plan: EXCLUDED - サブスクリプション情報
}

/**
 * インポート制限定数
 */
export const IMPORT_LIMITS = {
  /** 最大ファイルサイズ (1MB) */
  MAX_FILE_SIZE: 1024 * 1024,
  /** 表示名最大長 */
  MAX_DISPLAY_NAME_LENGTH: 100,
  /** プロフィールエクスポートバージョン */
  CURRENT_VERSION: "1.0" as const,
} as const;
```

---

## 3. Zodスキーマ

### 3.1 基本スキーマ

```typescript
// packages/shared/schemas/profile.ts

import { z } from "zod";
import { SUPPORTED_LOCALES } from "../types/profile";

/**
 * タイムゾーンスキーマ
 * IANAタイムゾーン形式を検証
 */
export const timezoneSchema = z
  .string()
  .min(1, "タイムゾーンは必須です")
  .max(50, "タイムゾーンは50文字以内で入力してください")
  .refine(
    (tz) => {
      // クライアント側で Intl API を使用して検証
      try {
        Intl.DateTimeFormat(undefined, { timeZone: tz });
        return true;
      } catch {
        return false;
      }
    },
    { message: "無効なタイムゾーンです" },
  );

/**
 * ロケールスキーマ
 */
export const localeSchema = z.enum(SUPPORTED_LOCALES as [string, ...string[]], {
  errorMap: () => ({ message: "サポートされていない言語です" }),
});
```

### 3.2 通知設定スキーマ

```typescript
// packages/shared/schemas/profile.ts

/**
 * 通知設定スキーマ
 */
export const notificationSettingsSchema = z.object({
  email: z.boolean().default(true),
  desktop: z.boolean().default(true),
  sound: z.boolean().default(true),
  workflowComplete: z.boolean().default(true),
  workflowError: z.boolean().default(true),
});

/**
 * 通知設定部分更新スキーマ
 */
export const partialNotificationSettingsSchema =
  notificationSettingsSchema.partial();

/**
 * 型推論
 */
export type NotificationSettingsInput = z.input<
  typeof notificationSettingsSchema
>;
export type NotificationSettingsOutput = z.output<
  typeof notificationSettingsSchema
>;
```

### 3.3 ユーザー設定スキーマ

```typescript
// packages/shared/schemas/profile.ts

/**
 * ユーザー設定スキーマ（将来の拡張用）
 */
export const userPreferencesSchema = z.record(z.unknown()).default({});

/**
 * 型推論
 */
export type UserPreferencesInput = z.input<typeof userPreferencesSchema>;
export type UserPreferencesOutput = z.output<typeof userPreferencesSchema>;
```

### 3.4 拡張プロフィールスキーマ

```typescript
// packages/shared/schemas/profile.ts

/**
 * 拡張プロフィールスキーマ
 */
export const extendedUserProfileSchema = z.object({
  id: z.string().uuid(),
  displayName: z.string().min(1).max(100),
  email: z.string().email(),
  avatarUrl: z.string().url().nullable(),
  plan: z.enum(["free", "pro", "enterprise"]),
  timezone: timezoneSchema,
  locale: localeSchema,
  notificationSettings: notificationSettingsSchema,
  preferences: userPreferencesSchema,
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

/**
 * 型推論
 */
export type ExtendedUserProfileInput = z.input<
  typeof extendedUserProfileSchema
>;
export type ExtendedUserProfileOutput = z.output<
  typeof extendedUserProfileSchema
>;
```

### 3.5 IPCペイロードスキーマ

```typescript
// packages/shared/schemas/profile.ts

/**
 * タイムゾーン更新スキーマ
 */
export const updateTimezoneSchema = z.object({
  timezone: timezoneSchema,
});

/**
 * ロケール更新スキーマ
 */
export const updateLocaleSchema = z.object({
  locale: localeSchema,
});

/**
 * 通知設定更新スキーマ
 */
export const updateNotificationSettingsSchema = z.object({
  notificationSettings: partialNotificationSettingsSchema,
});

/**
 * プロフィールインポートスキーマ
 */
export const profileImportSchema = z.object({
  filePath: z.string().min(1),
});
```

### 3.6 エクスポートデータスキーマ

```typescript
// packages/shared/schemas/profile.ts

/**
 * エクスポートデータスキーマ
 */
export const profileExportDataSchema = z.object({
  version: z.literal("1.0"),
  exportedAt: z.string().datetime(),
  displayName: z.string().min(1).max(100),
  timezone: timezoneSchema,
  locale: localeSchema,
  notificationSettings: notificationSettingsSchema,
  preferences: userPreferencesSchema,
});

/**
 * 型推論
 */
export type ProfileExportDataInput = z.input<typeof profileExportDataSchema>;
export type ProfileExportDataOutput = z.output<typeof profileExportDataSchema>;
```

---

## 4. バリデーションユーティリティ

### 4.1 バリデーション関数

```typescript
// packages/shared/utils/profileValidation.ts

import { z } from "zod";
import {
  timezoneSchema,
  localeSchema,
  notificationSettingsSchema,
  profileExportDataSchema,
} from "../schemas/profile";

/**
 * タイムゾーンを検証
 */
export function validateTimezone(timezone: string): boolean {
  const result = timezoneSchema.safeParse(timezone);
  return result.success;
}

/**
 * ロケールを検証
 */
export function validateLocale(locale: string): boolean {
  const result = localeSchema.safeParse(locale);
  return result.success;
}

/**
 * 通知設定を検証
 */
export function validateNotificationSettings(
  settings: unknown,
): settings is NotificationSettings {
  const result = notificationSettingsSchema.safeParse(settings);
  return result.success;
}

/**
 * エクスポートデータを検証
 */
export function validateProfileExportData(
  data: unknown,
): data is ProfileExportData {
  const result = profileExportDataSchema.safeParse(data);
  return result.success;
}

/**
 * バリデーションエラーを整形
 */
export function formatValidationErrors(error: z.ZodError): string[] {
  return error.errors.map((err) => {
    const path = err.path.join(".");
    return path ? `${path}: ${err.message}` : err.message;
  });
}
```

### 4.2 タイムゾーンユーティリティ

```typescript
// packages/shared/utils/timezone.ts

/**
 * 一般的なタイムゾーンリスト
 */
export const COMMON_TIMEZONES = [
  { value: "Asia/Tokyo", label: "日本標準時 (JST)", offset: "+09:00" },
  { value: "Asia/Seoul", label: "韓国標準時 (KST)", offset: "+09:00" },
  { value: "Asia/Shanghai", label: "中国標準時 (CST)", offset: "+08:00" },
  {
    value: "Asia/Singapore",
    label: "シンガポール標準時 (SGT)",
    offset: "+08:00",
  },
  { value: "America/New_York", label: "米国東部時間 (ET)", offset: "-05:00" },
  {
    value: "America/Los_Angeles",
    label: "米国太平洋時間 (PT)",
    offset: "-08:00",
  },
  { value: "Europe/London", label: "グリニッジ標準時 (GMT)", offset: "+00:00" },
  {
    value: "Europe/Paris",
    label: "中央ヨーロッパ時間 (CET)",
    offset: "+01:00",
  },
  {
    value: "Australia/Sydney",
    label: "オーストラリア東部時間 (AEST)",
    offset: "+10:00",
  },
  {
    value: "Pacific/Auckland",
    label: "ニュージーランド標準時 (NZST)",
    offset: "+12:00",
  },
] as const;

/**
 * ブラウザのタイムゾーンを取得
 */
export function getBrowserTimezone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}

/**
 * タイムゾーンのオフセットを取得
 */
export function getTimezoneOffset(timezone: string): string {
  try {
    const now = new Date();
    const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      timeZoneName: "shortOffset",
    });
    const parts = formatter.formatToParts(now);
    const offset = parts.find((p) => p.type === "timeZoneName")?.value || "";
    return offset;
  } catch {
    return "";
  }
}

/**
 * 全タイムゾーンリストを取得
 */
export function getAllTimezones(): { value: string; label: string }[] {
  // Intl API でサポートされているタイムゾーンを取得
  const timezones = Intl.supportedValuesOf("timeZone");
  return timezones.map((tz) => ({
    value: tz,
    label: `${tz} (${getTimezoneOffset(tz)})`,
  }));
}
```

---

## 5. キャッシュ型拡張

### 5.1 ProfileCache 型拡張

```typescript
// apps/desktop/src/main/infrastructure/profileCache.ts

import {
  ExtendedUserProfile,
  DEFAULT_EXTENDED_PROFILE,
} from "@repo/shared/types/profile";

/**
 * キャッシュされた拡張プロフィール
 */
export interface CachedExtendedProfile extends ExtendedUserProfile {
  /** キャッシュ日時 (ISO 8601) */
  cachedAt: string;
}

/**
 * プロフィールキャッシュのデフォルト値を適用
 */
export function applyExtendedProfileDefaults(
  profile: Partial<ExtendedUserProfile>,
): ExtendedUserProfile {
  return {
    ...profile,
    timezone: profile.timezone ?? DEFAULT_EXTENDED_PROFILE.timezone,
    locale: profile.locale ?? DEFAULT_EXTENDED_PROFILE.locale,
    notificationSettings:
      profile.notificationSettings ??
      DEFAULT_EXTENDED_PROFILE.notificationSettings,
    preferences: profile.preferences ?? DEFAULT_EXTENDED_PROFILE.preferences,
  } as ExtendedUserProfile;
}
```

---

## 6. 型エクスポート

### 6.1 インデックスファイル

```typescript
// packages/shared/types/index.ts

// 既存のエクスポート
export * from "./auth";

// プロフィール拡張型のエクスポート
export * from "./profile";
```

```typescript
// packages/shared/schemas/index.ts

// プロフィールスキーマのエクスポート
export * from "./profile";
```

```typescript
// packages/shared/utils/index.ts

// プロフィールユーティリティのエクスポート
export * from "./profileValidation";
export * from "./timezone";
```

---

## 7. 型定義の使用例

### 7.1 IPCハンドラーでの使用

```typescript
// apps/desktop/src/main/ipc/profileHandlers.ts

import {
  UpdateTimezonePayload,
  UpdateLocalePayload,
  UpdateNotificationSettingsPayload,
} from "@repo/shared/types/profile";
import {
  updateTimezoneSchema,
  updateLocaleSchema,
  updateNotificationSettingsSchema,
} from "@repo/shared/schemas/profile";

// タイムゾーン更新
ipcMain.handle(
  "profile:update-timezone",
  async (_, payload: UpdateTimezonePayload) => {
    const result = updateTimezoneSchema.safeParse(payload);
    if (!result.success) {
      return { success: false, error: "Invalid timezone" };
    }
    // ... 更新処理
  },
);
```

### 7.2 Reactコンポーネントでの使用

```typescript
// apps/desktop/src/renderer/components/TimezoneSelector.tsx

import { Timezone, COMMON_TIMEZONES } from "@repo/shared/types/profile";
import { getAllTimezones } from "@repo/shared/utils/timezone";

interface TimezoneSelectorProps {
  value: Timezone;
  onChange: (timezone: Timezone) => void;
}

export function TimezoneSelector({ value, onChange }: TimezoneSelectorProps) {
  const timezones = getAllTimezones();
  // ... コンポーネント実装
}
```

---

## 8. 変更履歴

| 版  | 日付       | 変更内容 | 担当者      |
| --- | ---------- | -------- | ----------- |
| 1.0 | 2025-12-10 | 初版作成 | @schema-def |
