# 拡張性レビュー

## メタ情報

| 項目   | 内容                                  |
| ------ | ------------------------------------- |
| Phase  | 3                                     |
| タスク | 3                                     |
| 対象   | schema-design.md, migration-design.md |
| 作成日 | 2026-01-24                            |

---

## 1. スキーマ拡張性

### 1.1 新規フィールド追加

| 観点           | 設計での対応                              | 評価    |
| -------------- | ----------------------------------------- | ------- |
| Record型使用   | importedSkills, skillSettings, skillCache | ✅ 容易 |
| オプショナル   | lastScanAt?, skillCache?                  | ✅ 容易 |
| 必須フィールド | schemaVersion                             | ✅ 適切 |

**拡張例**:

```typescript
// 現在のスキーマ
interface SkillStoreSchema {
  schemaVersion: number;
  importedSkills: Record<string, ImportedSkillData>;
  skillSettings: Record<string, SkillSettings>;
  lastScanAt?: string;
  skillCache?: Record<string, SkillCacheEntry>;
}

// 拡張後（新フィールド追加）
interface SkillStoreSchema {
  schemaVersion: number;
  importedSkills: Record<string, ImportedSkillData>;
  skillSettings: Record<string, SkillSettings>;
  lastScanAt?: string;
  skillCache?: Record<string, SkillCacheEntry>;
  globalSettings?: GlobalSkillSettings; // 新規追加
  importHistory?: ImportHistoryEntry[]; // 新規追加
}
```

**評価**: ✅ PASS - オプショナルフィールドとして追加可能

### 1.2 既存フィールド拡張

| 対象              | 拡張例                  | 影響      |
| ----------------- | ----------------------- | --------- |
| ImportedSkillData | priority フィールド追加 | ✅ 低影響 |
| SkillSettings     | 新規設定項目追加        | ✅ 低影響 |
| SkillCacheEntry   | キャッシュTTL追加       | ✅ 低影響 |

**拡張手順**:

1. 型定義にオプショナルフィールドを追加
2. マイグレーションでデフォルト値を設定
3. JSON Schemaを更新
4. 関連APIを必要に応じて追加

---

## 2. マイグレーション設計

### 2.1 バージョン管理

| 観点                 | 設計での対応              | 評価    |
| -------------------- | ------------------------- | ------- |
| schemaVersion        | 明示的なバージョン番号    | ✅ 適切 |
| マイグレーション定義 | migrations オブジェクト   | ✅ 適切 |
| 順次実行             | バージョン1→2→3と順次適用 | ✅ 適切 |

### 2.2 将来のマイグレーション対応

**migration-design.md L131-150 での設計例**:

```typescript
const skillStoreMigrations = {
  "1": (store) => {
    /* 初期化 */
  },

  // 将来のマイグレーション
  "2": (store) => {
    const imports = store.get("importedSkills", {});
    for (const skill of Object.values(imports)) {
      if (skill.priority === undefined) {
        skill.priority = 0; // デフォルト値
      }
    }
    store.set("importedSkills", imports);
    store.set("schemaVersion", 2);
  },
};
```

**評価**: ✅ PASS - 明確なマイグレーションパターンが設計済み

### 2.3 マイグレーション追加手順

| ステップ | 内容                                    |
| -------- | --------------------------------------- |
| 1        | CURRENT_SCHEMA_VERSION をインクリメント |
| 2        | 新しいマイグレーション関数を追加        |
| 3        | マイグレーションテストを追加            |
| 4        | 変更履歴を更新                          |

---

## 3. 後方互換性

### 3.1 古いデータの読み込み

| シナリオ            | 対応                         | 評価      |
| ------------------- | ---------------------------- | --------- |
| schemaVersion未定義 | マイグレーションで初期化     | ✅ 対応済 |
| フィールド欠損      | デフォルト値でフォールバック | ✅ 対応済 |
| 型不一致            | JSON Schemaでバリデーション  | ✅ 対応済 |

### 3.2 デフォルト値設計

```typescript
// schema-design.md L130-147
const DEFAULT_STORE_DATA: SkillStoreSchema = {
  schemaVersion: CURRENT_SCHEMA_VERSION,
  importedSkills: {},
  skillSettings: {},
};

const DEFAULT_SKILL_SETTINGS: SkillSettings = {
  autoApproveReadOnly: true,
  rememberPermissions: false,
  rememberedPermissions: {},
};
```

**評価**: ✅ PASS - 全フィールドにデフォルト値が定義済み

### 3.3 データ修復

| エラーケース   | 対応                              | 設計箇所                       |
| -------------- | --------------------------------- | ------------------------------ |
| ストア破損     | デフォルト値で再初期化            | migration-design L167-191      |
| 部分的破損     | 該当フィールドのみ修復            | error-handling-design L236-247 |
| スキーマ不整合 | JSON Schemaで検出・デフォルト適用 | schema-design L155-211         |

---

## 4. API拡張性

### 4.1 新規メソッド追加

| 観点         | 設計での対応          | 評価      |
| ------------ | --------------------- | --------- |
| クラス設計   | メソッド追加が容易    | ✅ 適切   |
| 既存への影響 | 新メソッドは独立      | ✅ 低影響 |
| 型安全性     | TypeScript strict継続 | ✅ 適切   |

**拡張例**:

```typescript
// 新規メソッド追加
class SkillImportStore {
  // 既存メソッド...

  // 新規追加（既存に影響なし）
  getDisabledSkills(): ImportedSkillData[] {
    return this.getImported().filter((s) => s.status === "disabled");
  }

  toggleStatus(skillName: string): void {
    const skill = this._store.get(`importedSkills.${skillName}`);
    if (skill) {
      skill.status = skill.status === "active" ? "disabled" : "active";
      this._store.set(`importedSkills.${skillName}`, skill);
    }
  }
}
```

### 4.2 IPC拡張

| 観点         | 設計での対応             | 評価    |
| ------------ | ------------------------ | ------- |
| チャネル追加 | 新チャネル登録で対応可能 | ✅ 容易 |
| 型拡張       | 共通型定義を更新         | ✅ 容易 |
| 後方互換     | 既存チャネルは維持       | ✅ 適切 |

---

## 5. 想定される将来の拡張

### 5.1 短期的拡張（1-3ヶ月）

| 拡張          | 必要な変更                      | 難易度 |
| ------------- | ------------------------------- | ------ |
| スキル優先度  | ImportedSkillDataにpriority追加 | 低     |
| カスタムタグ  | SkillSettingsにtags追加         | 低     |
| キャッシュTTL | SkillCacheEntryにttl追加        | 低     |

### 5.2 中期的拡張（3-6ヶ月）

| 拡張           | 必要な変更                  | 難易度 |
| -------------- | --------------------------- | ------ |
| スキルグループ | 新規groupsフィールド追加    | 中     |
| 利用統計       | 新規statsフィールド追加     | 中     |
| 依存関係管理   | ImportedSkillDataにdeps追加 | 中     |

### 5.3 長期的拡張（6ヶ月以上）

| 拡張             | 必要な変更         | 難易度 |
| ---------------- | ------------------ | ------ |
| 複数プロファイル | スキーマ大幅変更   | 高     |
| クラウド同期     | 同期メタデータ追加 | 高     |

---

## 6. 拡張性リスク評価

### 6.1 低リスク

| 項目           | 理由                       |
| -------------- | -------------------------- |
| フィールド追加 | オプショナルとして追加可能 |
| メソッド追加   | クラス設計で独立性確保     |
| 設定項目追加   | SkillSettingsに追加可能    |

### 6.2 中リスク

| 項目             | 対策                   |
| ---------------- | ---------------------- |
| スキーマ構造変更 | マイグレーションで対応 |
| 型定義変更       | 共通型への影響を検証   |

### 6.3 高リスク

| 項目                        | 回避策                       |
| --------------------------- | ---------------------------- |
| Record型からArray型への変更 | 設計時点で決定、変更しない   |
| キー構造の変更              | マイグレーションで慎重に対応 |

---

## 7. レビュー結果

| 観点             | 結果                                         |
| ---------------- | -------------------------------------------- |
| スキーマ拡張     | ✅ PASS - オプショナルフィールドで拡張容易   |
| マイグレーション | ✅ PASS - 明確なパターンが設計済み           |
| 後方互換性       | ✅ PASS - デフォルト値とマイグレーション対応 |
| API拡張          | ✅ PASS - 既存に影響なくメソッド追加可能     |

---

## 8. 結論

**判定: PASS**

SkillImportStoreの設計は将来の機能追加に対して高い拡張性を持つ。

主な拡張性確保ポイント:

1. Record型によるキーバリュー構造で項目追加が容易
2. electron-store組み込みマイグレーションによるバージョン管理
3. デフォルト値設計による後方互換性確保
4. クラスベース設計によるメソッド追加の独立性
