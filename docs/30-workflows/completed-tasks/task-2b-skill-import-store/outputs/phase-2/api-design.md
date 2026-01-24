# API詳細設計: SkillImportStore

## 概要

SkillImportStore クラスの全メソッドの詳細設計。

---

## 1. クラス構造

### 1.1 クラス定義

```typescript
export class SkillImportStore {
  private _store: Store<SkillStoreSchema>;

  constructor();

  // インポート管理
  getImported(): ImportedSkillData[];
  addImport(skillName: string): void;
  removeImport(skillName: string): void;
  exists(skillName: string): boolean;
  updateLastUsed(skillName: string): void;

  // 設定管理
  getSettings(skillName: string): SkillSettings;
  updateSettings(skillName: string, settings: Partial<SkillSettings>): void;

  // 権限管理
  rememberPermission(
    skillName: string,
    toolName: string,
    decision: "allow" | "deny",
  ): void;
  getRememberedPermission(
    skillName: string,
    toolName: string,
  ): "allow" | "deny" | undefined;

  // キャッシュ管理
  setCache(skillName: string, metadata: SkillMetadata): void;
  getCache(skillName: string): SkillCacheEntry | undefined;
  invalidateCache(skillName?: string): void;

  // テスト支援
  reset(): void;
  get internalStore(): Store<SkillStoreSchema>;
}
```

### 1.2 シングルトン

```typescript
let skillImportStoreInstance: SkillImportStore | null = null;

export function getSkillImportStore(): SkillImportStore {
  if (!skillImportStoreInstance) {
    skillImportStoreInstance = new SkillImportStore();
  }
  return skillImportStoreInstance;
}

export function resetSkillImportStore(): void {
  skillImportStoreInstance = null;
}
```

---

## 2. インポート管理API

### 2.1 getImported()

```typescript
getImported(): ImportedSkillData[]
```

| 項目   | 内容                               |
| ------ | ---------------------------------- |
| 入力   | なし                               |
| 出力   | `ImportedSkillData[]`              |
| 動作   | 全インポート済みスキルを配列で返却 |
| エラー | ストア読み込みエラー時は空配列     |

**実装イメージ**:

```typescript
getImported(): ImportedSkillData[] {
  try {
    const skills = this._store.get("importedSkills", {});
    return Object.values(skills);
  } catch {
    return [];
  }
}
```

---

### 2.2 addImport()

```typescript
addImport(skillName: string): void
```

| 項目           | 内容                       |
| -------------- | -------------------------- |
| 入力           | skillName: string          |
| 出力           | void                       |
| 動作           | スキルを新規インポート     |
| バリデーション | スキル名パターン検証       |
| エラー         | 無効なスキル名で例外スロー |

**入力バリデーション**:

```typescript
if (!skillName || !SKILL_NAME_PATTERN.test(skillName)) {
  throw new Error(`Invalid skill name: ${skillName}`);
}
```

**実装イメージ**:

```typescript
addImport(skillName: string): void {
  validateSkillName(skillName);

  const data: ImportedSkillData = {
    name: skillName,
    importedAt: new Date().toISOString(),
    status: "active",
  };

  this._store.set(`importedSkills.${skillName}`, data);
}
```

---

### 2.3 removeImport()

```typescript
removeImport(skillName: string): void
```

| 項目   | 内容                               |
| ------ | ---------------------------------- |
| 入力   | skillName: string                  |
| 出力   | void                               |
| 動作   | スキルとその設定・キャッシュを削除 |
| エラー | 存在しない場合は静かに終了（冪等） |

**実装イメージ**:

```typescript
removeImport(skillName: string): void {
  // インポート情報を削除
  const imports = this._store.get("importedSkills", {});
  delete imports[skillName];
  this._store.set("importedSkills", imports);

  // 設定も削除
  const settings = this._store.get("skillSettings", {});
  delete settings[skillName];
  this._store.set("skillSettings", settings);

  // キャッシュも削除
  this.invalidateCache(skillName);
}
```

---

### 2.4 exists()

```typescript
exists(skillName: string): boolean
```

| 項目   | 内容                         |
| ------ | ---------------------------- |
| 入力   | skillName: string            |
| 出力   | boolean                      |
| 動作   | スキルがインポート済みか確認 |
| エラー | なし（false を返す）         |

**実装イメージ**:

```typescript
exists(skillName: string): boolean {
  const imports = this._store.get("importedSkills", {});
  return skillName in imports;
}
```

---

### 2.5 updateLastUsed()

```typescript
updateLastUsed(skillName: string): void
```

| 項目   | 内容                        |
| ------ | --------------------------- |
| 入力   | skillName: string           |
| 出力   | void                        |
| 動作   | lastUsedAt を現在日時で更新 |
| 前提   | スキルが存在すること        |
| エラー | 存在しない場合は何もしない  |

**実装イメージ**:

```typescript
updateLastUsed(skillName: string): void {
  if (!this.exists(skillName)) return;

  const skill = this._store.get(`importedSkills.${skillName}`);
  if (skill) {
    skill.lastUsedAt = new Date().toISOString();
    this._store.set(`importedSkills.${skillName}`, skill);
  }
}
```

---

## 3. 設定管理API

### 3.1 getSettings()

```typescript
getSettings(skillName: string): SkillSettings
```

| 項目   | 内容                                     |
| ------ | ---------------------------------------- |
| 入力   | skillName: string                        |
| 出力   | SkillSettings                            |
| 動作   | スキル設定を取得（未設定時はデフォルト） |
| エラー | なし（デフォルト値を返す）               |

**実装イメージ**:

```typescript
getSettings(skillName: string): SkillSettings {
  const settings = this._store.get(`skillSettings.${skillName}`);
  return settings ?? { ...DEFAULT_SKILL_SETTINGS };
}
```

---

### 3.2 updateSettings()

```typescript
updateSettings(skillName: string, settings: Partial<SkillSettings>): void
```

| 項目   | 内容                                                |
| ------ | --------------------------------------------------- |
| 入力   | skillName: string, settings: Partial<SkillSettings> |
| 出力   | void                                                |
| 動作   | 既存設定とマージして更新                            |
| エラー | なし                                                |

**実装イメージ**:

```typescript
updateSettings(skillName: string, settings: Partial<SkillSettings>): void {
  const current = this.getSettings(skillName);
  const updated = { ...current, ...settings };
  this._store.set(`skillSettings.${skillName}`, updated);
}
```

---

## 4. 権限管理API

### 4.1 rememberPermission()

```typescript
rememberPermission(
  skillName: string,
  toolName: string,
  decision: "allow" | "deny"
): void
```

| 項目 | 内容                          |
| ---- | ----------------------------- |
| 入力 | skillName, toolName, decision |
| 出力 | void                          |
| 動作 | ツールへの権限決定を記憶      |
| 前提 | なし（設定を自動作成）        |

**実装イメージ**:

```typescript
rememberPermission(
  skillName: string,
  toolName: string,
  decision: "allow" | "deny"
): void {
  const settings = this.getSettings(skillName);
  settings.rememberedPermissions[toolName] = decision;
  this.updateSettings(skillName, settings);
}
```

---

### 4.2 getRememberedPermission()

```typescript
getRememberedPermission(
  skillName: string,
  toolName: string
): "allow" | "deny" | undefined
```

| 項目   | 内容                           |
| ------ | ------------------------------ |
| 入力   | skillName, toolName            |
| 出力   | "allow" \| "deny" \| undefined |
| 動作   | 記憶された権限を返却           |
| エラー | 未記憶時は undefined           |

**実装イメージ**:

```typescript
getRememberedPermission(
  skillName: string,
  toolName: string
): "allow" | "deny" | undefined {
  const settings = this.getSettings(skillName);
  return settings.rememberedPermissions[toolName];
}
```

---

## 5. キャッシュ管理API

### 5.1 setCache()

```typescript
setCache(skillName: string, metadata: SkillMetadata): void
```

| 項目 | 内容                                        |
| ---- | ------------------------------------------- |
| 入力 | skillName, metadata                         |
| 出力 | void                                        |
| 動作 | メタデータをキャッシュ（cachedAt 自動設定） |

**実装イメージ**:

```typescript
setCache(skillName: string, metadata: SkillMetadata): void {
  const cache = this._store.get("skillCache", {});
  cache[skillName] = {
    metadata,
    cachedAt: new Date().toISOString(),
  };
  this._store.set("skillCache", cache);
}
```

---

### 5.2 getCache()

```typescript
getCache(skillName: string): SkillCacheEntry | undefined
```

| 項目   | 内容                         |
| ------ | ---------------------------- |
| 入力   | skillName                    |
| 出力   | SkillCacheEntry \| undefined |
| 動作   | キャッシュを返却             |
| エラー | 未キャッシュ時は undefined   |

**実装イメージ**:

```typescript
getCache(skillName: string): SkillCacheEntry | undefined {
  const cache = this._store.get("skillCache", {});
  return cache[skillName];
}
```

---

### 5.3 invalidateCache()

```typescript
invalidateCache(skillName?: string): void
```

| 項目 | 内容                               |
| ---- | ---------------------------------- |
| 入力 | skillName（省略時は全削除）        |
| 出力 | void                               |
| 動作 | 指定スキルまたは全キャッシュを削除 |

**実装イメージ**:

```typescript
invalidateCache(skillName?: string): void {
  if (skillName) {
    const cache = this._store.get("skillCache", {});
    delete cache[skillName];
    this._store.set("skillCache", cache);
  } else {
    this._store.set("skillCache", {});
  }
}
```

---

## 6. テスト支援API

### 6.1 reset()

```typescript
reset(): void
```

| 項目 | 内容                             |
| ---- | -------------------------------- |
| 出力 | void                             |
| 動作 | 全データをデフォルト値にリセット |
| 用途 | テスト間の状態分離               |

**実装イメージ**:

```typescript
reset(): void {
  this._store.set("schemaVersion", CURRENT_SCHEMA_VERSION);
  this._store.set("importedSkills", {});
  this._store.set("skillSettings", {});
  this._store.delete("lastScanAt");
  this._store.delete("skillCache");
}
```

---

### 6.2 internalStore

```typescript
get internalStore(): Store<SkillStoreSchema>
```

| 項目 | 内容                    |
| ---- | ----------------------- |
| 出力 | Store<SkillStoreSchema> |
| 用途 | テスト用の直接アクセス  |

---

## 7. エラーケース一覧

| API          | エラーケース   | 対応                         |
| ------------ | -------------- | ---------------------------- |
| addImport    | 無効なスキル名 | Error スロー                 |
| addImport    | 既存スキル     | 上書き（冪等）               |
| removeImport | 存在しない     | 何もしない（冪等）           |
| getSettings  | 存在しない     | デフォルト返却               |
| getCache     | 存在しない     | undefined 返却               |
| 全メソッド   | ストア破損     | デフォルト値でフォールバック |

---

## 8. 入力バリデーション

### 8.1 スキル名

```typescript
function validateSkillName(name: string): void {
  if (!name) {
    throw new Error("Skill name is required");
  }
  if (!SKILL_NAME_PATTERN.test(name)) {
    throw new Error(`Invalid skill name: ${name}`);
  }
}
```

### 8.2 ツール名

```typescript
function validateToolName(name: string): void {
  if (!name || typeof name !== "string") {
    throw new Error("Tool name is required");
  }
}
```

---

## 9. API 一覧表

| カテゴリ   | メソッド                | 引数                          | 戻り値                         | 例外  |
| ---------- | ----------------------- | ----------------------------- | ------------------------------ | ----- |
| インポート | getImported             | -                             | ImportedSkillData[]            | なし  |
| インポート | addImport               | skillName                     | void                           | Error |
| インポート | removeImport            | skillName                     | void                           | なし  |
| インポート | exists                  | skillName                     | boolean                        | なし  |
| インポート | updateLastUsed          | skillName                     | void                           | なし  |
| 設定       | getSettings             | skillName                     | SkillSettings                  | なし  |
| 設定       | updateSettings          | skillName, settings           | void                           | なし  |
| 権限       | rememberPermission      | skillName, toolName, decision | void                           | なし  |
| 権限       | getRememberedPermission | skillName, toolName           | "allow" \| "deny" \| undefined | なし  |
| キャッシュ | setCache                | skillName, metadata           | void                           | なし  |
| キャッシュ | getCache                | skillName                     | SkillCacheEntry \| undefined   | なし  |
| キャッシュ | invalidateCache         | skillName?                    | void                           | なし  |
| テスト     | reset                   | -                             | void                           | なし  |
| テスト     | internalStore           | -                             | Store                          | なし  |
