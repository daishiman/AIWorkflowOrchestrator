# SkillImportStore 実装ガイド

## メタ情報

| 項目   | 内容                                                 |
| ------ | ---------------------------------------------------- |
| 作成日 | 2026-01-24                                           |
| 対象   | `apps/desktop/src/main/settings/skillImportStore.ts` |
| 状態   | TASK-2B 完了                                         |

---

## Part 1: 概念的説明

### 概要

SkillImportStore は、ユーザーがインポートしたスキルの情報をアプリケーション再起動後も保持するための永続化サービスです。

Electron の Main Process で動作し、ローカルの JSON ファイルにデータを保存します。

### 主な機能

| 機能             | 説明                                           |
| ---------------- | ---------------------------------------------- |
| スキルインポート | スキルをインポート済みとして登録               |
| スキル管理       | インポート済みスキルの一覧取得・削除・存在確認 |
| スキル設定       | スキルごとの個別設定を管理                     |
| 権限記憶         | ツールに対する許可/拒否の決定を記憶            |
| キャッシュ       | スキルメタデータのキャッシュ                   |

### データの保存先

```
~/.aiworkflow/config/skill-imports.json
```

### 使用シーン

1. **スキルインポート時**: ユーザーがスキルをインポートすると、`addImport()` で登録
2. **スキル使用時**: スキルを使用すると `updateLastUsed()` で最終使用日時を更新
3. **権限確認時**: ツール実行前に `getRememberedPermission()` で過去の決定を確認
4. **設定変更時**: ユーザーが設定を変更すると `updateSettings()` で保存

---

## Part 2: 技術的詳細

### アーキテクチャ

```
┌─────────────────────────────────────────────────────┐
│                  Renderer Process                   │
│  (React UI)                                         │
└─────────────────────────────────────────────────────┘
                         │ IPC
                         ▼
┌─────────────────────────────────────────────────────┐
│                   Main Process                      │
│  ┌─────────────────────────────────────────────┐    │
│  │            IPC Handler (TASK-2C)            │    │
│  └─────────────────────────────────────────────┘    │
│                         │                           │
│                         ▼                           │
│  ┌─────────────────────────────────────────────┐    │
│  │           SkillImportStore                  │    │
│  │  - getImported()                            │    │
│  │  - addImport()                              │    │
│  │  - removeImport()                           │    │
│  │  - ...                                      │    │
│  └─────────────────────────────────────────────┘    │
│                         │                           │
│                         ▼                           │
│  ┌─────────────────────────────────────────────┐    │
│  │           electron-store                    │    │
│  │  ~/.aiworkflow/config/skill-imports.json    │    │
│  └─────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────┘
```

### スキーマ

```typescript
interface SkillStoreSchema {
  schemaVersion: number;
  importedSkills: Record<string, ImportedSkillData>;
  skillSettings: Record<string, SkillSettings>;
  lastScanAt?: string;
  skillCache?: Record<string, SkillCacheEntry>;
}

interface ImportedSkillData {
  name: string;
  importedAt: string; // ISO 8601
  status: "active" | "disabled";
  lastUsedAt?: string;
}

interface SkillSettings {
  autoApproveReadOnly: boolean;
  rememberPermissions: boolean;
  rememberedPermissions: Record<string, "allow" | "deny">;
}
```

### API リファレンス

#### インポート管理

| メソッド       | シグネチャ                     | 説明                   |
| -------------- | ------------------------------ | ---------------------- |
| getImported    | `(): ImportedSkillData[]`      | 全インポート済みスキル |
| addImport      | `(skillName: string): void`    | スキルをインポート     |
| removeImport   | `(skillName: string): void`    | スキルを削除           |
| exists         | `(skillName: string): boolean` | 存在確認               |
| updateLastUsed | `(skillName: string): void`    | 最終使用日時を更新     |

#### 設定管理

| メソッド       | シグネチャ                                          | 説明     |
| -------------- | --------------------------------------------------- | -------- |
| getSettings    | `(skillName: string): SkillSettings`                | 設定取得 |
| updateSettings | `(skillName: string, settings: Partial<...>): void` | 設定更新 |

#### 権限管理

| メソッド                | シグネチャ                                              | 説明       |
| ----------------------- | ------------------------------------------------------- | ---------- |
| rememberPermission      | `(skillName, toolName, decision): void`                 | 権限を記憶 |
| getRememberedPermission | `(skillName, toolName): "allow" \| "deny" \| undefined` | 権限を取得 |

#### キャッシュ管理

| メソッド        | シグネチャ                                      | 説明             |
| --------------- | ----------------------------------------------- | ---------------- |
| setCache        | `(skillName: string, metadata: ...): void`      | キャッシュ設定   |
| getCache        | `(skillName: string): SkillCacheEntry \| undef` | キャッシュ取得   |
| invalidateCache | `(skillName?: string): void`                    | キャッシュ無効化 |

### 使用例

#### 基本的な使用

```typescript
import { getSkillImportStore } from "./skillImportStore";

// シングルトンインスタンスを取得
const store = getSkillImportStore();

// スキルをインポート
store.addImport("my-skill");

// インポート済みスキルを確認
if (store.exists("my-skill")) {
  console.log("スキルは登録済み");
}

// 設定を更新
store.updateSettings("my-skill", {
  autoApproveReadOnly: false,
});

// 権限を記憶
store.rememberPermission("my-skill", "Read", "allow");

// 記憶した権限を確認
const decision = store.getRememberedPermission("my-skill", "Read");
if (decision === "allow") {
  // 自動承認
}
```

#### テストでの使用

```typescript
import { SkillImportStore, resetSkillImportStore } from "./skillImportStore";

describe("My Test", () => {
  beforeEach(() => {
    // シングルトンをリセット
    resetSkillImportStore();
  });

  it("should work", () => {
    const store = getSkillImportStore();
    store.reset(); // データをリセット
    // テスト実行...
  });
});
```

### 注意事項

1. **Main Process 限定**: このストアは Electron の Main Process でのみ使用可能
2. **シングルトン**: `getSkillImportStore()` は常に同じインスタンスを返す
3. **冪等性**: `removeImport()` は存在しないスキルに対しても安全
4. **バリデーション**: スキル名は英数字、アンダースコア、ハイフンのみ（1-128文字）
5. **セキュリティ**: エラーメッセージには入力値の最初の20文字のみ表示（SEC-01対応）

### マイグレーション

スキーマバージョンが変更された場合、自動的にマイグレーションが実行されます。

```typescript
// 現在のバージョン: 1
const CURRENT_SCHEMA_VERSION = 1;
```

マイグレーション時にエラーが発生しても、デフォルト値で動作を継続します。

---

## 関連ドキュメント

| ドキュメント   | パス                                                                |
| -------------- | ------------------------------------------------------------------- |
| 要件仕様書     | `outputs/phase-1/requirements-specification.md`                     |
| API設計書      | `outputs/phase-2/api-design.md`                                     |
| テストファイル | `apps/desktop/src/main/settings/__tests__/skillImportStore.test.ts` |
