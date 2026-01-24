# SkillImportStore 要件仕様書

## メタ情報

| 項目           | 内容        |
| -------------- | ----------- |
| ドキュメントID | TASK-2B-REQ |
| バージョン     | 1.0         |
| 作成日         | 2026-01-24  |
| ステータス     | 確定        |

---

## 1. 概要

### 1.1 目的

electron-store を使用してインポート済みスキルの情報を永続化するストアモジュールを実装する。
このストアは Main Process で動作し、スキルのインポート状態・設定・権限記憶・キャッシュを管理する。

### 1.2 スコープ

| 範囲内                      | 範囲外             |
| --------------------------- | ------------------ |
| インポート済みスキルの CRUD | スキルスキャン処理 |
| スキル個別設定の管理        | スキル実行処理     |
| 権限記憶機能                | IPC Handler 実装   |
| メタデータキャッシュ        | UI コンポーネント  |
| スキーママイグレーション    | -                  |

### 1.3 依存関係

| 依存タスク | 内容       | 状態    |
| ---------- | ---------- | ------- |
| TASK-1-1   | 共通型定義 | ✅ 完了 |

| 後続タスク | 内容         |
| ---------- | ------------ |
| TASK-4-2   | IPC Handlers |

---

## 2. 機能要件

### 2.1 インポート管理

#### FR-2.1.1 インポート済みスキル一覧取得

| 項目     | 内容                                   |
| -------- | -------------------------------------- |
| メソッド | `getImported()`                        |
| 入力     | なし                                   |
| 出力     | `ImportedSkillData[]`                  |
| 動作     | 全てのインポート済みスキルを配列で返却 |

#### FR-2.1.2 スキルインポート

| 項目     | 内容                                       |
| -------- | ------------------------------------------ |
| メソッド | `addImport(skillName: string)`             |
| 入力     | スキル名                                   |
| 出力     | `void`                                     |
| 動作     | スキルをインポート済みとして登録           |
| 初期状態 | `status: "active"`, `importedAt: 現在日時` |

#### FR-2.1.3 スキル削除

| 項目     | 内容                              |
| -------- | --------------------------------- |
| メソッド | `removeImport(skillName: string)` |
| 入力     | スキル名                          |
| 出力     | `void`                            |
| 動作     | インポート情報と関連設定を削除    |

#### FR-2.1.4 存在確認

| 項目     | 内容                           |
| -------- | ------------------------------ |
| メソッド | `exists(skillName: string)`    |
| 入力     | スキル名                       |
| 出力     | `boolean`                      |
| 動作     | スキルがインポート済みかを確認 |

#### FR-2.1.5 最終使用日時更新

| 項目     | 内容                                |
| -------- | ----------------------------------- |
| メソッド | `updateLastUsed(skillName: string)` |
| 入力     | スキル名                            |
| 出力     | `void`                              |
| 動作     | `lastUsedAt` を現在日時で更新       |

---

### 2.2 設定管理

#### FR-2.2.1 設定取得

| 項目     | 内容                                           |
| -------- | ---------------------------------------------- |
| メソッド | `getSettings(skillName: string)`               |
| 入力     | スキル名                                       |
| 出力     | `SkillSettings`                                |
| 動作     | スキル個別設定を取得（未設定時はデフォルト値） |

#### FR-2.2.2 設定更新

| 項目     | 内容                                                                  |
| -------- | --------------------------------------------------------------------- |
| メソッド | `updateSettings(skillName: string, settings: Partial<SkillSettings>)` |
| 入力     | スキル名, 部分設定                                                    |
| 出力     | `void`                                                                |
| 動作     | 既存設定とマージして更新                                              |

---

### 2.3 権限記憶

#### FR-2.3.1 権限を記憶

| 項目     | 内容                                                                                   |
| -------- | -------------------------------------------------------------------------------------- |
| メソッド | `rememberPermission(skillName: string, toolName: string, decision: "allow" \| "deny")` |
| 入力     | スキル名, ツール名, 決定                                                               |
| 出力     | `void`                                                                                 |
| 動作     | ツールに対する権限決定を記憶                                                           |

#### FR-2.3.2 記憶された権限を取得

| 項目     | 内容                                                           |
| -------- | -------------------------------------------------------------- |
| メソッド | `getRememberedPermission(skillName: string, toolName: string)` |
| 入力     | スキル名, ツール名                                             |
| 出力     | `"allow" \| "deny" \| undefined`                               |
| 動作     | 記憶された権限を取得（未記憶時は `undefined`）                 |

---

### 2.4 キャッシュ管理

#### FR-2.4.1 キャッシュ設定

| 項目     | 内容                                                   |
| -------- | ------------------------------------------------------ |
| メソッド | `setCache(skillName: string, metadata: SkillMetadata)` |
| 入力     | スキル名, メタデータ                                   |
| 出力     | `void`                                                 |
| 動作     | メタデータをキャッシュに保存（`cachedAt` を自動設定）  |

#### FR-2.4.2 キャッシュ取得

| 項目     | 内容                                                         |
| -------- | ------------------------------------------------------------ |
| メソッド | `getCache(skillName: string)`                                |
| 入力     | スキル名                                                     |
| 出力     | `{ metadata: SkillMetadata; cachedAt: string } \| undefined` |
| 動作     | キャッシュされたメタデータを取得                             |

#### FR-2.4.3 キャッシュ無効化

| 項目     | 内容                                 |
| -------- | ------------------------------------ |
| メソッド | `invalidateCache(skillName: string)` |
| 入力     | スキル名                             |
| 出力     | `void`                               |
| 動作     | 指定スキルのキャッシュを削除         |

---

### 2.5 スキーマ管理

#### FR-2.5.1 スキーマバージョン

| 項目           | 内容                    |
| -------------- | ----------------------- |
| 初期バージョン | 1                       |
| 保存形式       | `schemaVersion: number` |

#### FR-2.5.2 マイグレーション

| 項目 | 内容                                    |
| ---- | --------------------------------------- |
| 方式 | electron-store 組み込みマイグレーション |
| 対象 | バージョン間のスキーマ変更              |

---

### 2.6 テスト支援

#### FR-2.6.1 ストアリセット

| 項目     | 内容                             |
| -------- | -------------------------------- |
| メソッド | `reset()`                        |
| 動作     | 全データをデフォルト値にリセット |
| 用途     | テスト間の状態分離               |

#### FR-2.6.2 内部ストアアクセス

| 項目       | 内容                      |
| ---------- | ------------------------- |
| プロパティ | `internalStore`           |
| 戻り値     | `Store<SkillStoreSchema>` |
| 用途       | テスト用の直接アクセス    |

---

## 3. 非機能要件

### 3.1 パフォーマンス

| 項目         | 要件                 |
| ------------ | -------------------- |
| 読み込み時間 | < 10ms（同期操作）   |
| 書き込み時間 | < 50ms（同期操作）   |
| メモリ使用量 | < 10MB（通常使用時） |

### 3.2 セキュリティ

| 項目         | 要件                               |
| ------------ | ---------------------------------- |
| スキル名検証 | 不正な文字（`..`, `\0` 等）を拒否  |
| パス検証     | キャッシュ内パスのトラバーサル防止 |
| データ整合性 | JSON スキーマによるバリデーション  |

### 3.3 信頼性

| 項目             | 要件                             |
| ---------------- | -------------------------------- |
| データ永続化     | アプリ再起動後もデータ保持       |
| 破損復旧         | ストア破損時はデフォルト値で復旧 |
| マイグレーション | バージョンアップ時のデータ移行   |

### 3.4 保守性

| 項目             | 要件                                |
| ---------------- | ----------------------------------- |
| 設計パターン     | 既存 `slideSettingsStore.ts` と一貫 |
| 型安全性         | TypeScript strict モード            |
| テストカバレッジ | 80% 以上                            |

---

## 4. データ構造

### 4.1 SkillStoreSchema

```typescript
interface SkillStoreSchema {
  schemaVersion: number;
  importedSkills: Record<string, ImportedSkillData>;
  skillSettings: Record<string, SkillSettings>;
  lastScanAt?: string;
  skillCache?: Record<string, { metadata: SkillMetadata; cachedAt: string }>;
}
```

### 4.2 ImportedSkillData

```typescript
interface ImportedSkillData {
  name: string;
  importedAt: string; // ISO 8601
  status: "active" | "disabled";
  lastUsedAt?: string; // ISO 8601
}
```

### 4.3 SkillSettings

```typescript
interface SkillSettings {
  autoApproveReadOnly: boolean;
  rememberPermissions: boolean;
  rememberedPermissions: Record<string, "allow" | "deny">;
}
```

### 4.4 デフォルト値

```typescript
const DEFAULT_SKILL_SETTINGS: SkillSettings = {
  autoApproveReadOnly: true,
  rememberPermissions: false,
  rememberedPermissions: {},
};

const DEFAULT_STORE_DATA: SkillStoreSchema = {
  schemaVersion: 1,
  importedSkills: {},
  skillSettings: {},
};
```

---

## 5. API 一覧

| カテゴリ   | メソッド                                            | 戻り値                           |
| ---------- | --------------------------------------------------- | -------------------------------- |
| インポート | `getImported()`                                     | `ImportedSkillData[]`            |
| インポート | `addImport(skillName)`                              | `void`                           |
| インポート | `removeImport(skillName)`                           | `void`                           |
| インポート | `exists(skillName)`                                 | `boolean`                        |
| インポート | `updateLastUsed(skillName)`                         | `void`                           |
| 設定       | `getSettings(skillName)`                            | `SkillSettings`                  |
| 設定       | `updateSettings(skillName, settings)`               | `void`                           |
| 権限       | `rememberPermission(skillName, toolName, decision)` | `void`                           |
| 権限       | `getRememberedPermission(skillName, toolName)`      | `"allow" \| "deny" \| undefined` |
| キャッシュ | `setCache(skillName, metadata)`                     | `void`                           |
| キャッシュ | `getCache(skillName)`                               | `{...} \| undefined`             |
| キャッシュ | `invalidateCache(skillName)`                        | `void`                           |
| テスト     | `reset()`                                           | `void`                           |

---

## 6. 受け入れ基準

### 6.1 機能要件

- [ ] `getImported()` がインポート済みスキル一覧を返す
- [ ] `addImport()` がスキルを登録し、初期状態を設定する
- [ ] `removeImport()` がスキルと関連設定を削除する
- [ ] `exists()` がスキルの存在を正しく判定する
- [ ] `updateLastUsed()` が最終使用日時を更新する
- [ ] `getSettings()` がデフォルト値付きで設定を返す
- [ ] `updateSettings()` が設定をマージして更新する
- [ ] `rememberPermission()` が権限を記憶する
- [ ] `getRememberedPermission()` が記憶された権限を返す
- [ ] `setCache()` がメタデータをキャッシュする
- [ ] `getCache()` がキャッシュを取得する
- [ ] `invalidateCache()` がキャッシュを削除する

### 6.2 非機能要件

- [ ] JSON スキーマによるバリデーションが動作する
- [ ] アプリ再起動後もデータが保持される
- [ ] ストア破損時にデフォルト値で復旧する
- [ ] マイグレーションが正しく動作する
- [ ] テストカバレッジが 80% 以上

### 6.3 統合テスト観点

- [ ] IPC Handler からストアメソッドを呼び出せる
- [ ] エラーが適切に IPC レスポンスに変換される
- [ ] 型が共通型定義と整合している

---

## 7. 参照ドキュメント

| ドキュメント        | パス                                                           |
| ------------------- | -------------------------------------------------------------- |
| 既存パターン分析    | `outputs/phase-1/existing-pattern-analysis.md`                 |
| 仕様整合性確認      | `outputs/phase-1/specification-alignment.md`                   |
| 型定義整合性確認    | `outputs/phase-1/type-alignment.md`                            |
| IPC連携要件         | `outputs/phase-1/ipc-integration-requirements.md`              |
| 仕様書セクション6.1 | `docs/30-workflows/skill-import-agent-system/specification.md` |
| 共通型定義          | `packages/shared/src/types/skill.ts`                           |
| 既存ストア実装      | `apps/desktop/src/main/settings/slideSettingsStore.ts`         |

---

## 8. 更新履歴

| バージョン | 日付       | 内容     |
| ---------- | ---------- | -------- |
| 1.0        | 2026-01-24 | 初版作成 |
