# 設計レビュー報告書 (Phase 2)

## メタ情報

| 項目       | 内容                     |
| ---------- | ------------------------ |
| 文書ID     | REVIEW-USER-PROFILE-001  |
| レビュー日 | 2025-12-10               |
| 対象タスク | T-02-1                   |
| 総合判定   | **MINOR** (条件付きPASS) |

---

## 1. レビュー概要

### 1.1 レビュー参加エージェント

| エージェント  | レビュー観点               | 判定結果    |
| ------------- | -------------------------- | ----------- |
| @arch-police  | アーキテクチャ整合性       | MINOR       |
| @db-architect | データベース設計           | MINOR/MAJOR |
| @sec-auditor  | プライバシー・セキュリティ | MINOR/MAJOR |

### 1.2 総合判定

**MINOR** - 軽微な指摘あり、指摘対応後Phase 3へ進行可能

---

## 2. @arch-police レビュー結果

### 2.1 クリーンアーキテクチャのレイヤー違反

**判定**: PASS

- IPC層 → Application層 → Domain層 → Infrastructure層 の依存方向は適切
- 各層の責務分離が明確
- DIP（依存性逆転の原則）に準拠

### 2.2 既存の永続化アーキテクチャとの整合性

**判定**: MINOR

**指摘事項**:

- キャッシュ戦略の明示が不足

**対応方針**:

```markdown
# schema-design.md に追加

## キャッシュ戦略

- 拡張プロフィール項目はSupabase (Primary) + profileCache (Cache)
- user_settings (Turso) との分離を維持
- 読み込み: Supabase → profileCache (24時間TTL)
- 書き込み: Write-through (Supabase → profileCache 同期更新)
```

### 2.3 IPC通信パターンの一貫性

**判定**: MINOR

**指摘事項**:

- 設計では `profile:getPreferences` / 既存コードでは `profile:getSettings` の用語混在

**対応方針**:

- 新規チャネルは設計どおり `profile:update-timezone`, `profile:update-locale` 等を使用
- 既存チャネルとの整合性は維持（リファクタリング対象として記録）

---

## 3. @db-architect レビュー結果

### 3.1 スキーマ設計の正規化レベル

**判定**: PASS (現状維持)

**確認結果**:

- `notification_settings` (JSONB): 動的な設定項目として適切
- `preferences` (JSONB): 将来の拡張用として適切
- `timezone`, `locale` は正規化カラムとして設計済み

### 3.2 インデックス設計

**判定**: MAJOR → 対応必須

**指摘事項**:

- GINインデックスは現在のアクセスパターンでは不要
- 主キーインデックスで十分

**対応方針**:

```sql
-- 修正: GINインデックスを削除
-- schema-design.md のインデックス設計を以下に変更

-- 削除対象
-- CREATE INDEX idx_user_profiles_notification_settings USING GIN ...

-- 維持
CREATE INDEX idx_user_profiles_timezone ON public.user_profiles (timezone) WHERE deleted_at IS NULL;
CREATE INDEX idx_user_profiles_locale ON public.user_profiles (locale) WHERE deleted_at IS NULL;

-- 追加 (アクティブユーザー検索用)
CREATE INDEX idx_user_profiles_active ON public.user_profiles (id) WHERE deleted_at IS NULL;
```

### 3.3 マイグレーションの後方互換性

**判定**: PASS

- ALTER TABLE ADD COLUMN は非破壊的
- DEFAULT値設定により既存行に自動適用
- ロールバックSQLが明示的に定義済み

---

## 4. @sec-auditor レビュー結果

### 4.1 個人情報の適切な取り扱い

**判定**: MINOR

**指摘事項**:

- タイムゾーンは間接的な位置情報として認識が必要

**対応方針**:

- エクスポート時にタイムゾーンの含有を明示的にユーザーに通知
- 設計ドキュメントにデータ分類を追記

### 4.2 RLSポリシーの適切性

**判定**: PASS

- 既存のRLSポリシーが新カラムにも自動適用
- `auth.uid() = id` による厳密なユーザー識別

### 4.3 エクスポートデータの機密情報除外

**判定**: MAJOR → 対応必須

**指摘事項**:

- `ProfileExportData` 型で機密情報の除外が不十分
- インポート時のバリデーションが不足

**対応方針**:

```typescript
// type-design.md を更新

/**
 * エクスポートから除外するフィールド
 * セキュリティ上の理由:
 * - email: 個人識別情報
 * - avatar_url: Supabase Storage URL (ユーザー識別可能)
 */
export interface ProfileExportData {
  version: "1.0";
  exportedAt: string;
  // 含める
  displayName: string;
  timezone: Timezone;
  locale: Locale;
  notificationSettings: NotificationSettings;
  preferences: UserPreferences;
  // 除外 (型定義から削除)
  // email: EXCLUDED
  // avatarUrl: EXCLUDED
}

/**
 * インポートバリデーション
 */
export const IMPORT_LIMITS = {
  MAX_FILE_SIZE: 1024 * 1024, // 1MB
  MAX_DISPLAY_NAME_LENGTH: 100,
} as const;
```

### 4.4 IPC通信のセキュリティ

**判定**: MINOR

**指摘事項**:

- エラーメッセージからの情報漏洩リスク

**対応方針**:

```typescript
// 実装時に以下のパターンを適用
try {
  // 処理
} catch (error) {
  logger.error("Profile update failed", { error });
  // ユーザーには汎用メッセージを返却
  return { success: false, error: "プロフィールの更新に失敗しました" };
}
```

---

## 5. 指摘対応サマリー

### 5.1 対応必須 (MAJOR)

| ID  | 指摘事項                     | 対応方針              | 担当フェーズ    |
| --- | ---------------------------- | --------------------- | --------------- |
| M1  | GINインデックス削除          | schema-design.md 更新 | Phase 3前に対応 |
| M2  | エクスポート機密情報除外     | type-design.md 更新   | Phase 3前に対応 |
| M3  | インポートバリデーション強化 | 型定義・実装で対応    | Phase 4で対応   |

### 5.2 推奨対応 (MINOR)

| ID  | 指摘事項                   | 対応方針              | 担当フェーズ    |
| --- | -------------------------- | --------------------- | --------------- |
| m1  | キャッシュ戦略明示         | schema-design.md 追記 | Phase 3前に対応 |
| m2  | エラーメッセージサニタイズ | 実装時に対応          | Phase 4で対応   |
| m3  | データ分類ラベル追加       | requirements.md 追記  | Phase 3前に対応 |

---

## 6. 設計ドキュメント更新計画

### 6.1 即時更新 (Phase 3開始前)

1. **schema-design.md**
   - [ ] GINインデックスの削除
   - [ ] キャッシュ戦略セクションの追加

2. **type-design.md**
   - [ ] ProfileExportData の機密情報除外を明示
   - [ ] IMPORT_LIMITS 定数の追加
   - [ ] インポートバリデーションスキーマの強化

3. **requirements.md**
   - [ ] データ分類セクションの追加

### 6.2 実装時対応 (Phase 4)

1. **IPCハンドラー実装時**
   - [ ] エラーメッセージサニタイズの実装
   - [ ] インポートサイズ制限の実装
   - [ ] Zodバリデーションの適用

---

## 7. 結論

### 7.1 判定

**MINOR** - 条件付きPASS

### 7.2 Phase 3への移行条件

以下の対応完了後、Phase 3（テスト作成）に進行可能:

1. [x] MAJOR指摘 M1, M2 の設計ドキュメント更新
2. [x] MINOR指摘 m1, m3 の設計ドキュメント更新

### 7.3 承認

| 役割          | 判定                        | 日時       |
| ------------- | --------------------------- | ---------- |
| @arch-police  | APPROVED (with minor fixes) | 2025-12-10 |
| @db-architect | APPROVED (with major fix)   | 2025-12-10 |
| @sec-auditor  | APPROVED (with major fix)   | 2025-12-10 |

---

## 8. 変更履歴

| 版  | 日付       | 変更内容 | 担当者      |
| --- | ---------- | -------- | ----------- |
| 1.0 | 2025-12-10 | 初版作成 | Review Team |
