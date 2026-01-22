# Phase 2 設計書

## メタ情報

| 項目     | 内容                       |
| -------- | -------------------------- |
| 作成日時 | 2026-01-22                 |
| タスクID | SKILL-IMPORT-PERSIST-001   |
| 修正対象 | スキルインポート永続化機能 |

---

## 1. 既存アーキテクチャ分析

### 1.1 現在のストア設定

| ストア名                | ファイル         | defaults | encryptionKey |
| ----------------------- | ---------------- | -------- | ------------- |
| knowledge-studio        | storeHandlers.ts | ✅ あり  | -             |
| knowledge-studio-secure | storeHandlers.ts | -        | ✅ あり       |
| skills                  | ipc/index.ts     | ❌ なし  | -             |

### 1.2 設定の差異

```typescript
// knowledge-studio（正常動作）
store = new Store<StoreSchema>({
  name: "knowledge-studio",
  defaults: {
    currentView: "dashboard",
    expandedFolders: [],
    autoSyncEnabled: true,
    windowSize: { width: 1200, height: 800 },
  },
});

// skills（問題あり）
const skillStore = new Store({ name: "skills" });
```

**差異点**:

1. `defaults`オプションが未設定
2. 型スキーマが未定義
3. デバッグログがなく問題追跡が困難

---

## 2. 修正方針

### 2.1 採用する修正パターン

**採用: パターンA + B の組み合わせ**

#### パターンA: ストア設定の改善

```typescript
// ipc/index.ts
interface SkillStoreSchema {
  importedSkillIds: string[];
}

const skillStore = new Store<SkillStoreSchema>({
  name: "skills",
  defaults: {
    importedSkillIds: [],
  },
});
```

#### パターンB: デバッグログの追加

```typescript
// SkillImportManager.ts - コンストラクタ
constructor(store: ElectronStore) {
  this.store = store;
  console.log("[SkillImportManager] Store path:", (store as any).path);
  const stored = this.store.get(STORE_KEY, []) as string[];
  console.log("[SkillImportManager] Loaded from store:", stored);
  this.importedIds = new Set(stored);
}

// persist()
private persist(): void {
  console.log("[SkillImportManager] Persisting:", Array.from(this.importedIds));
  this.store.set(STORE_KEY, Array.from(this.importedIds));
  console.log("[SkillImportManager] Persist complete");
}
```

### 2.2 選択理由

| 理由           | 説明                                     |
| -------------- | ---------------------------------------- |
| 一貫性         | 他のストア設定（knowledge-studio）と一致 |
| 明示性         | defaults設定によりスキーマが明確に       |
| デバッグ容易性 | ログにより問題追跡が容易に               |
| 後方互換性     | 既存のインターフェースに変更なし         |
| リスク最小化   | 既存の動作ロジックを変更しない           |

---

## 3. 変更対象ファイル

| ファイル                                                     | 変更内容                     |
| ------------------------------------------------------------ | ---------------------------- |
| `apps/desktop/src/main/ipc/index.ts`                         | ストア設定にdefaults追加     |
| `apps/desktop/src/main/services/skill/SkillImportManager.ts` | デバッグログ追加（実施済み） |

---

## 4. 変更内容詳細

### 4.1 ipc/index.ts の変更

**変更前:**

```typescript
const skillStore = new Store({ name: "skills" });
```

**変更後:**

```typescript
interface SkillStoreSchema {
  importedSkillIds: string[];
}

const skillStore = new Store<SkillStoreSchema>({
  name: "skills",
  defaults: {
    importedSkillIds: [],
  },
});
```

### 4.2 SkillImportManager.ts の変更

**変更前:**

```typescript
constructor(store: ElectronStore) {
  this.store = store;
  const stored = this.store.get(STORE_KEY, []) as string[];
  this.importedIds = new Set(stored);
}

private persist(): void {
  this.store.set(STORE_KEY, Array.from(this.importedIds));
}
```

**変更後:**

```typescript
constructor(store: ElectronStore) {
  this.store = store;
  console.log("[SkillImportManager] Store path:", (store as any).path);
  const stored = this.store.get(STORE_KEY, []) as string[];
  console.log("[SkillImportManager] Loaded from store:", stored);
  this.importedIds = new Set(stored);
}

private persist(): void {
  console.log("[SkillImportManager] Persisting:", Array.from(this.importedIds));
  this.store.set(STORE_KEY, Array.from(this.importedIds));
  console.log("[SkillImportManager] Persist complete");
}
```

---

## 5. インターフェース影響分析

### 5.1 既存インターフェース

```typescript
// SkillImportManager
class SkillImportManager {
  constructor(store: ElectronStore);
  importSkills(skillIds: string[]): Promise<ImportResult>;
  removeSkill(skillId: string): Promise<RemoveResult>;
  getImportedSkillIds(): string[];
  isImported(skillId: string): boolean;
}
```

### 5.2 影響

| インターフェース    | 影響     | 備考             |
| ------------------- | -------- | ---------------- |
| constructor         | 変更なし | ログ追加のみ     |
| importSkills        | 変更なし | 既存ロジック維持 |
| removeSkill         | 変更なし | 既存ロジック維持 |
| getImportedSkillIds | 変更なし | 既存ロジック維持 |
| isImported          | 変更なし | 既存ロジック維持 |

**結論: 外部インターフェースへの影響なし**

---

## 6. 後方互換性の考慮事項

### 6.1 既存データ

- 既存のストアファイルがある場合、defaultsは既存データを上書きしない
- electron-storeの仕様により、既存のキーは保持される

### 6.2 既存テスト

- モックストアを使用しているため、テストへの影響なし
- 新規テストケースの追加のみ必要

### 6.3 マイグレーション

- 不要（データ構造に変更なし）

---

## 7. テスト戦略

### 7.1 追加するテストケース

| テストID | テストケース                             | 期待結果                   |
| -------- | ---------------------------------------- | -------------------------- |
| TC-P01   | 永続化されたデータが起動時に読み込まれる | ストアから値が取得できる   |
| TC-P02   | インポート後にデータが永続化される       | ストアにデータが保存される |
| TC-P03   | 空のストアから初期化できる               | 空配列で初期化される       |

---

## 変更履歴

| バージョン | 日付       | 変更内容 |
| ---------- | ---------- | -------- |
| 1.0.0      | 2026-01-22 | 初版作成 |
