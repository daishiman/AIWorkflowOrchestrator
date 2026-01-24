# マイグレーション設計: SkillImportStore

## 概要

electron-store のマイグレーション機能を使用したスキーマバージョン管理設計。

---

## 1. バージョン管理

### 1.1 現在のバージョン

```typescript
const CURRENT_SCHEMA_VERSION = 1;
```

### 1.2 バージョン履歴

| バージョン | リリース日 | 変更内容       |
| ---------- | ---------- | -------------- |
| 1          | 2026-01-24 | 初期バージョン |

---

## 2. electron-store マイグレーション機構

### 2.1 マイグレーション定義

```typescript
import Store from "electron-store";

const skillStoreMigrations = {
  // バージョン1へのマイグレーション（初期化）
  "1": (store: Store<SkillStoreSchema>) => {
    // 初期バージョン - 基本的なスキーマ設定
    store.set("schemaVersion", 1);

    // importedSkills が未定義なら初期化
    if (!store.has("importedSkills")) {
      store.set("importedSkills", {});
    }

    // skillSettings が未定義なら初期化
    if (!store.has("skillSettings")) {
      store.set("skillSettings", {});
    }
  },

  // 将来のマイグレーション例
  // "2": (store: Store<SkillStoreSchema>) => {
  //   // 例: 新しいフィールドを追加
  //   const imports = store.get("importedSkills", {});
  //   for (const [key, skill] of Object.entries(imports)) {
  //     if (!skill.newField) {
  //       skill.newField = "default";
  //     }
  //   }
  //   store.set("importedSkills", imports);
  //   store.set("schemaVersion", 2);
  // },
};
```

### 2.2 ストア初期化

```typescript
const store = new Store<SkillStoreSchema>({
  name: "skill-imports",
  defaults: {
    schemaVersion: CURRENT_SCHEMA_VERSION,
    importedSkills: {},
    skillSettings: {},
  },
  migrations: skillStoreMigrations,
});
```

---

## 3. マイグレーション戦略

### 3.1 基本原則

| 原則         | 説明                                         |
| ------------ | -------------------------------------------- |
| 前方互換性   | 古いバージョンのデータを新しいスキーマに変換 |
| データ保持   | 既存データを可能な限り保持                   |
| デフォルト値 | 新フィールドにはデフォルト値を設定           |
| 冪等性       | 複数回実行しても同じ結果                     |

### 3.2 マイグレーション実行タイミング

```
アプリ起動
    ↓
electron-store 初期化
    ↓
現在バージョン確認
    ↓
マイグレーション必要？ ──No──> 通常起動
    ↓ Yes
順次マイグレーション実行
    ↓
schemaVersion 更新
    ↓
通常起動
```

---

## 4. バージョン別マイグレーション

### 4.1 バージョン 0 → 1（初期化）

**対象**: 新規インストール、または schemaVersion が未定義

```typescript
"1": (store: Store<SkillStoreSchema>) => {
  store.set("schemaVersion", 1);

  if (!store.has("importedSkills")) {
    store.set("importedSkills", {});
  }

  if (!store.has("skillSettings")) {
    store.set("skillSettings", {});
  }
}
```

### 4.2 バージョン 1 → 2（将来）

**想定変更例**: ImportedSkillData に新フィールド追加

```typescript
// 例: 将来のマイグレーション
"2": (store: Store<SkillStoreSchema>) => {
  const imports = store.get("importedSkills", {});

  for (const skill of Object.values(imports)) {
    // 新フィールドのデフォルト値を設定
    if (skill.priority === undefined) {
      skill.priority = 0;
    }
  }

  store.set("importedSkills", imports);
  store.set("schemaVersion", 2);
}
```

---

## 5. エラーハンドリング

### 5.1 マイグレーション失敗時

| エラーケース   | 対応                       |
| -------------- | -------------------------- |
| 読み込みエラー | デフォルト値で初期化       |
| 変換エラー     | 該当フィールドをスキップ   |
| 書き込みエラー | エラーログ出力、再試行なし |

### 5.2 リカバリー戦略

```typescript
function initializeStoreWithRecovery(): Store<SkillStoreSchema> {
  try {
    return new Store<SkillStoreSchema>({
      name: "skill-imports",
      defaults: DEFAULT_STORE_DATA,
      migrations: skillStoreMigrations,
    });
  } catch (error) {
    console.error("Store initialization failed, resetting:", error);

    // ストアファイルを削除してリトライ
    const storePath = app.getPath("userData");
    const storeFile = path.join(storePath, "skill-imports.json");

    if (fs.existsSync(storeFile)) {
      fs.unlinkSync(storeFile);
    }

    return new Store<SkillStoreSchema>({
      name: "skill-imports",
      defaults: DEFAULT_STORE_DATA,
      migrations: skillStoreMigrations,
    });
  }
}
```

---

## 6. テスト戦略

### 6.1 マイグレーションテスト

```typescript
describe("schema migration", () => {
  it("should migrate from version 0 to 1", () => {
    // 古いフォーマットのデータを準備
    const oldData = {
      // schemaVersion なし
      importedSkills: {
        "test-skill": {
          name: "test-skill",
          importedAt: "2026-01-01T00:00:00.000Z",
          status: "active",
        },
      },
    };

    // ストアファイルに書き込み
    fs.writeFileSync(storePath, JSON.stringify(oldData));

    // ストア初期化（マイグレーション実行）
    const store = new Store<SkillStoreSchema>({
      name: "skill-imports",
      defaults: DEFAULT_STORE_DATA,
      migrations: skillStoreMigrations,
    });

    // 検証
    expect(store.get("schemaVersion")).toBe(1);
    expect(store.get("importedSkills.test-skill")).toBeDefined();
  });

  it("should handle corrupted data gracefully", () => {
    // 破損データを書き込み
    fs.writeFileSync(storePath, "{ invalid json");

    // ストア初期化
    const store = initializeStoreWithRecovery();

    // デフォルト値で初期化されることを確認
    expect(store.get("schemaVersion")).toBe(CURRENT_SCHEMA_VERSION);
    expect(store.get("importedSkills")).toEqual({});
  });
});
```

---

## 7. 将来の拡張性

### 7.1 マイグレーションの追加手順

1. `CURRENT_SCHEMA_VERSION` をインクリメント
2. 新しいマイグレーション関数を追加
3. マイグレーションテストを追加
4. 変更履歴を更新

### 7.2 スキーマ変更の例

| 変更タイプ       | マイグレーション内容                   |
| ---------------- | -------------------------------------- |
| フィールド追加   | デフォルト値を設定                     |
| フィールド削除   | 古いフィールドを削除                   |
| フィールド名変更 | データをコピーして古いフィールドを削除 |
| 型変更           | データを新しい型に変換                 |

---

## 8. 設計決定理由

| 決定                        | 理由                             |
| --------------------------- | -------------------------------- |
| electron-store 組み込み機能 | 検証済み、メンテナンス不要       |
| 順次マイグレーション        | 中間バージョンのスキップを避ける |
| 冪等性                      | 複数回実行時の安全性             |
| エラーリカバリー            | ユーザーデータ損失を最小化       |

---

## 9. バージョン管理ファイル

### 9.1 定数エクスポート

```typescript
// skillImportStore.ts からエクスポート
export const CURRENT_SCHEMA_VERSION = 1;
export const skillStoreMigrations = { ... };
```

### 9.2 型定義

```typescript
interface SkillStoreSchema {
  schemaVersion: number; // 必須フィールド
  // ...
}
```
