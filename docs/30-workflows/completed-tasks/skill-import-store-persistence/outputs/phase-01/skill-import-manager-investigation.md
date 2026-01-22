# Phase 1 - タスク2: SkillImportManager調査レポート

## 調査日時

2026-01-22

## 調査対象

- `apps/desktop/src/main/services/skill/SkillImportManager.ts`
- `apps/desktop/src/main/ipc/index.ts`（ストア初期化部分）

---

## 調査結果

### 1. SkillImportManagerの構造

```typescript
// SkillImportManager.ts
const STORE_KEY = "importedSkillIds";

interface SkillStore {
  get(key: string, defaultValue: string[]): string[];
  set(key: string, value: string[]): void;
}

export class SkillImportManager {
  private importedIds: Set<string>;
  private store: SkillStore;

  constructor(store: SkillStore) {
    this.store = store;
    try {
      const stored = this.store.get(STORE_KEY, []) as string[];
      this.importedIds = new Set(stored);
    } catch (error) {
      console.error("[SkillImportManager] Failed to load from store:", error);
      this.importedIds = new Set();
    }
  }
  // ...
}
```

### 2. ストアの初期化（ipc/index.ts）

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

const skillImportManager = new SkillImportManager(skillStore);
```

### 3. 設定パラメータの確認

| パラメータ                  | 設定値     | 説明                                  |
| --------------------------- | ---------- | ------------------------------------- |
| `name`                      | `"skills"` | ストアファイル名（skills.json）       |
| `defaults.importedSkillIds` | `[]`       | デフォルト値                          |
| `cwd`                       | 未設定     | デフォルトのApplication Supportを使用 |
| `schema`                    | 未設定     | バリデーションなし                    |

### 4. STORE_KEYの確認

| 箇所                     | 値                   | 一致 |
| ------------------------ | -------------------- | ---- |
| SkillImportManager.ts    | `"importedSkillIds"` | ✅   |
| ipc/index.ts (schema)    | `importedSkillIds`   | ✅   |
| skills.json (実ファイル) | `"importedSkillIds"` | ✅   |

---

## コード分析

### コンストラクタのフロー

1. `store`パラメータを受け取る（Dependency Injection）
2. `store.get(STORE_KEY, [])` で保存済みIDを取得
3. `Set<string>` に変換してメモリに保持
4. エラー時は空のSetで初期化

### persist()メソッド

```typescript
private persist(): void {
  try {
    this.store.set(STORE_KEY, Array.from(this.importedIds));
  } catch (error) {
    console.error("[SkillImportManager] Failed to persist:", error);
  }
}
```

- `importSkills()` で新しいスキルが追加された時に呼び出される
- `removeSkill()` でスキルが削除された時に呼び出される

---

## 発見事項

### 正常動作している点

1. **依存性注入パターン**: テスト容易性を確保
2. **エラーハンドリング**: try-catchでエラーをキャッチ
3. **キー名の一貫性**: 全箇所で`importedSkillIds`を使用

### 潜在的な問題点

1. **デバッグログの不足**:
   - ストアパスのログ出力がない
   - 読み書き時のデータ内容のログがない

2. **テストとの乖離**:
   - ユニットテストはすべてモックストアを使用
   - 実際のelectron-storeとの統合テストがない

3. **型の不整合リスク**:
   - `SkillStore`インターフェースはシンプルだが、electron-storeの実際の挙動とは異なる可能性がある

---

## 推奨デバッグログ

以下のログを追加して実環境での動作を確認する：

```typescript
constructor(store: SkillStore) {
  console.log("[SkillImportManager] Initializing...");
  console.log("[SkillImportManager] Store path:", (store as unknown as { path: string }).path);

  this.store = store;
  try {
    const stored = this.store.get(STORE_KEY, []) as string[];
    console.log("[SkillImportManager] Loaded from store:", stored);
    this.importedIds = new Set(stored);
  } catch (error) {
    console.error("[SkillImportManager] Failed to load from store:", error);
    this.importedIds = new Set();
  }
}
```

---

## 統合テスト観点

- electron-storeの実際のインスタンスを使用したテストが必要
- ストアへの書き込み後にファイルが更新されることを確認するテストが必要
- アプリ再起動後のデータ復元テストが必要

---

## 結論

SkillImportManagerのコード自体に明らかなバグは見つからない。問題は以下のいずれかと考えられる：

1. **インポートIPCが呼び出されていない**（UIからの呼び出しがない）
2. **electron-storeの挙動がモックと異なる**（統合テスト不足）
3. **ストアへの書き込みが発生していない**（importSkillsが呼ばれていない）
