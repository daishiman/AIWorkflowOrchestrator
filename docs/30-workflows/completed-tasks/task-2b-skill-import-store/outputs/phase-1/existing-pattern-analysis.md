# 既存パターン分析: slideSettingsStore.ts

## 概要

`apps/desktop/src/main/settings/slideSettingsStore.ts` を分析し、SkillImportStore 実装のための設計パターンを抽出する。

---

## 1. アーキテクチャパターン

### 1.1 クラスベース設計

```typescript
export class SlideSettingsStore {
  private _store: Store<SlideSettingsStoreSchema>;

  constructor() {
    this._store = new Store<SlideSettingsStoreSchema>({...});
  }
}
```

**抽出パターン**:

- クラスでストアをラップ
- プライベートな `_store` インスタンスを保持
- コンストラクタで electron-store を初期化

### 1.2 シングルトンパターン

```typescript
let slideSettingsStoreInstance: SlideSettingsStore | null = null;

export function getSlideSettingsStore(): SlideSettingsStore {
  if (!slideSettingsStoreInstance) {
    slideSettingsStoreInstance = new SlideSettingsStore();
  }
  return slideSettingsStoreInstance;
}

export function resetSlideSettingsStore(): void {
  slideSettingsStoreInstance = null;
}
```

**抽出パターン**:

- モジュールレベルの変数でインスタンスを保持
- ゲッター関数でインスタンス取得（遅延初期化）
- テスト用リセット関数を提供

---

## 2. electron-store 使用パターン

### 2.1 ストア初期化

```typescript
this._store = new Store<SlideSettingsStoreSchema>({
  name: "slide-settings", // ファイル名（.json拡張子は自動付与）
  defaults: {
    outputDirectory: DEFAULT_SLIDE_SETTINGS.outputDirectory,
    autoCreateDirectory: DEFAULT_SLIDE_SETTINGS.autoCreateDirectory,
    defaultTheme: DEFAULT_SLIDE_SETTINGS.defaultTheme,
    schemaVersion: DEFAULT_SLIDE_SETTINGS.schemaVersion,
  },
  schema: slideSettingsSchema, // JSON Schema バリデーション
});
```

**抽出パターン**:

- `name`: ストアファイル名の明示
- `defaults`: 全フィールドのデフォルト値
- `schema`: JSON Schema によるバリデーション

### 2.2 デフォルト値定義

```typescript
export const DEFAULT_SLIDE_SETTINGS: SlideSettings = {
  outputDirectory: "~/Documents/Slides",
  autoCreateDirectory: true,
  defaultTheme: "kanagawa",
  schemaVersion: 1,
};
```

**抽出パターン**:

- 外部エクスポート可能なデフォルト値オブジェクト
- 型安全なデフォルト値

### 2.3 JSON Schema 定義

```typescript
const slideSettingsSchema = {
  outputDirectory: { type: "string" },
  autoCreateDirectory: { type: "boolean" },
  defaultTheme: { type: "string", enum: ["kanagawa"] },
  schemaVersion: { type: "number" },
} as const;
```

**抽出パターン**:

- 各フィールドの型を JSON Schema 形式で定義
- `as const` で型推論を強化

---

## 3. API パターン

### 3.1 取得メソッド

```typescript
getSettings(): SlideSettings {
  try {
    return {
      outputDirectory: this._store.get("outputDirectory", DEFAULT_SLIDE_SETTINGS.outputDirectory)
        ?? DEFAULT_SLIDE_SETTINGS.outputDirectory,
      // ...
    };
  } catch {
    return { ...DEFAULT_SLIDE_SETTINGS };
  }
}
```

**抽出パターン**:

- フォールバック付きの `get()` 呼び出し
- Null合体演算子 (`??`) で追加のフォールバック
- try-catch でストア破損時のデフォルト復帰

### 3.2 設定メソッド

```typescript
setDirectory(dirPath: string): void {
  validatePathSecurity(dirPath);  // セキュリティ検証
  const expandedPath = expandHomePath(dirPath);
  validatePathSecurity(expandedPath);
  this._store.set("outputDirectory", dirPath);
}
```

**抽出パターン**:

- 設定前のバリデーション
- 同期的な `set()` 呼び出し

### 3.3 リセットメソッド

```typescript
reset(): void {
  this._store.set("outputDirectory", DEFAULT_SLIDE_SETTINGS.outputDirectory);
  this._store.set("autoCreateDirectory", DEFAULT_SLIDE_SETTINGS.autoCreateDirectory);
  // ...
}
```

**抽出パターン**:

- 全フィールドをデフォルト値にリセット

---

## 4. スキーマバージョン管理

### 4.1 バージョン取得・設定

```typescript
getSchemaVersion(): number {
  return this._store.get("schemaVersion", DEFAULT_SLIDE_SETTINGS.schemaVersion);
}

setSchemaVersion(version: number): void {
  this._store.set("schemaVersion", version);
}
```

### 4.2 マイグレーション関数

```typescript
export async function applyMigrations(
  store: SlideSettingsStore,
): Promise<void> {
  const currentVersion = store.getSchemaVersion();
  if (currentVersion < 1) {
    store.internalStore.set("schemaVersion", 1);
  }
}
```

**抽出パターン**:

- バージョン番号に基づく条件分岐
- 非同期関数としての定義
- 内部ストアへの直接アクセス（`internalStore`）

---

## 5. セキュリティパターン

### 5.1 パストラバーサル防止

```typescript
function detectPathTraversal(targetPath: string): string | null {
  if (targetPath.includes("\0")) return "Invalid path: null byte detected";
  if (targetPath.includes("..")) return "Path traversal not allowed";
  if (targetPath.includes("%2e") || targetPath.includes("%2E"))
    return "URL encoded path traversal not allowed";
  // ...
}
```

**SkillImportStore への適用**:

- スキルパス検証に同様のパターンを適用

---

## 6. テスト支援パターン

### 6.1 内部ストアアクセス

```typescript
get internalStore(): Store<SlideSettingsStoreSchema> {
  return this._store;
}
```

**抽出パターン**:

- テスト用に内部ストアへのアクセスを提供

### 6.2 シングルトンリセット

```typescript
export function resetSlideSettingsStore(): void {
  slideSettingsStoreInstance = null;
}
```

**抽出パターン**:

- テスト間の状態分離のためのリセット関数

---

## 7. SkillImportStore への適用まとめ

| 項目             | slideSettingsStore | SkillImportStore（計画） |
| ---------------- | ------------------ | ------------------------ |
| クラス名         | SlideSettingsStore | SkillImportStore         |
| ファイル名       | slide-settings     | skill-imports            |
| シングルトン     | ✅                 | ✅                       |
| JSON Schema      | ✅                 | ✅                       |
| マイグレーション | 簡易版             | electron-store組み込み版 |
| テスト支援       | ✅                 | ✅                       |
| セキュリティ     | パス検証           | スキル名検証             |

---

## 結論

既存の `slideSettingsStore.ts` は以下の設計パターンを採用しており、SkillImportStore でも同様のパターンを踏襲する:

1. **クラスベース + シングルトン**: 状態管理の一貫性
2. **JSON Schema バリデーション**: 型安全なデータ永続化
3. **デフォルト値の明示**: フォールバック戦略
4. **テスト支援メソッド**: インスタンスリセット、内部アクセス
5. **マイグレーション機構**: スキーマバージョン管理

ただし、SkillImportStore では electron-store 組み込みのマイグレーション機能を活用し、より堅牢なバージョン管理を実装する。
