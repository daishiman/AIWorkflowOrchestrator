# エラーハンドリング設計: SkillImportStore

## 概要

SkillImportStore におけるエラーハンドリング戦略の設計。
error-handling.md の方針に準拠。

---

## 1. エラー分類

### 1.1 エラーカテゴリ

| カテゴリ             | コード範囲 | 例                   |
| -------------------- | ---------- | -------------------- |
| Validation Error     | 1000-1999  | 無効なスキル名       |
| Business Error       | 2000-2999  | スキル未存在         |
| Infrastructure Error | 4000-4999  | ストア読み書きエラー |
| Internal Error       | 5000-5999  | 予期しないエラー     |

### 1.2 エラーコード定義

```typescript
export const SKILL_STORE_ERRORS = {
  // Validation Error
  INVALID_SKILL_NAME: "ERR_1001",
  INVALID_TOOL_NAME: "ERR_1002",
  INVALID_SETTINGS: "ERR_1003",

  // Business Error
  SKILL_NOT_FOUND: "ERR_2001",
  SKILL_ALREADY_EXISTS: "ERR_2003",

  // Infrastructure Error
  STORE_READ_ERROR: "ERR_4001",
  STORE_WRITE_ERROR: "ERR_4002",

  // Internal Error
  INTERNAL_ERROR: "ERR_5001",
} as const;
```

---

## 2. エラーパターン別対応

### 2.1 バリデーションエラー

| エラー         | 発生箇所           | 対応         |
| -------------- | ------------------ | ------------ |
| 無効なスキル名 | addImport          | Error スロー |
| 無効なツール名 | rememberPermission | Error スロー |
| 無効な設定値   | updateSettings     | Error スロー |

**実装例**:

```typescript
function validateSkillName(name: string): void {
  if (!name) {
    throw new SkillStoreError(
      SKILL_STORE_ERRORS.INVALID_SKILL_NAME,
      "Skill name is required",
    );
  }
  if (!SKILL_NAME_PATTERN.test(name)) {
    throw new SkillStoreError(
      SKILL_STORE_ERRORS.INVALID_SKILL_NAME,
      `Invalid skill name: ${name}`,
    );
  }
}
```

---

### 2.2 ビジネスエラー

| エラー       | 発生箇所       | 対応             |
| ------------ | -------------- | ---------------- |
| スキル未存在 | updateLastUsed | 静かに無視       |
| スキル未存在 | getSettings    | デフォルト値返却 |
| スキル未存在 | getCache       | undefined 返却   |

**設計方針**:

- 読み取り系: デフォルト値または undefined を返す
- 書き込み系: 静かに無視（冪等性確保）

---

### 2.3 インフラエラー

| エラー               | 発生箇所    | 対応                   |
| -------------------- | ----------- | ---------------------- |
| ストア読み込みエラー | getImported | 空配列返却             |
| ストア書き込みエラー | addImport   | Error スロー           |
| ファイル破損         | 初期化      | デフォルト値で再初期化 |

**実装例**:

```typescript
getImported(): ImportedSkillData[] {
  try {
    const skills = this._store.get("importedSkills", {});
    return Object.values(skills);
  } catch (error) {
    console.error("Failed to read imported skills:", error);
    return [];  // フォールバック
  }
}
```

---

## 3. エラークラス

### 3.1 SkillStoreError

```typescript
export class SkillStoreError extends Error {
  public readonly code: string;
  public readonly retryable: boolean;

  constructor(code: string, message: string, retryable = false) {
    super(message);
    this.name = "SkillStoreError";
    this.code = code;
    this.retryable = retryable;
  }
}
```

### 3.2 型ガード

```typescript
export function isSkillStoreError(error: unknown): error is SkillStoreError {
  return (
    error instanceof Error &&
    error.name === "SkillStoreError" &&
    "code" in error
  );
}
```

---

## 4. API別エラー処理

### 4.1 インポート管理

| API            | エラー処理                         |
| -------------- | ---------------------------------- |
| getImported    | try-catch で空配列にフォールバック |
| addImport      | バリデーションエラーをスロー       |
| removeImport   | 存在しなくても正常終了（冪等）     |
| exists         | エラー時は false を返す            |
| updateLastUsed | 存在しない場合は何もしない         |

### 4.2 設定管理

| API            | エラー処理                   |
| -------------- | ---------------------------- |
| getSettings    | 未設定時はデフォルト値を返す |
| updateSettings | バリデーションエラーをスロー |

### 4.3 権限管理

| API                     | エラー処理                   |
| ----------------------- | ---------------------------- |
| rememberPermission      | バリデーションエラーをスロー |
| getRememberedPermission | 未記憶時は undefined         |

### 4.4 キャッシュ管理

| API             | エラー処理                 |
| --------------- | -------------------------- |
| setCache        | 書き込みエラーをログ出力   |
| getCache        | 未キャッシュ時は undefined |
| invalidateCache | エラー時は何もしない       |

---

## 5. ログ出力方針

### 5.1 ログレベル別

| レベル | 用途                          |
| ------ | ----------------------------- |
| debug  | 操作の詳細（開発時のみ）      |
| info   | 重要な操作（インポート/削除） |
| warn   | 回復可能なエラー              |
| error  | 致命的なエラー                |

### 5.2 ログ出力例

```typescript
// debug: 操作詳細
console.debug(`[SkillStore] Adding import: ${skillName}`);

// info: 重要な操作
console.info(`[SkillStore] Skill imported: ${skillName}`);

// warn: 回復可能
console.warn(`[SkillStore] Skill not found for update: ${skillName}`);

// error: 致命的
console.error(`[SkillStore] Store write failed:`, error);
```

---

## 6. リカバリー戦略

### 6.1 ストア破損時

```typescript
function recoverFromCorruption(): void {
  const storePath = path.join(app.getPath("userData"), "skill-imports.json");

  // バックアップ作成
  if (fs.existsSync(storePath)) {
    const backupPath = storePath + ".backup";
    fs.copyFileSync(storePath, backupPath);
    console.warn(`[SkillStore] Backup created: ${backupPath}`);
  }

  // ストアファイル削除
  fs.unlinkSync(storePath);

  // 再初期化（デフォルト値で）
  console.info("[SkillStore] Store reset to defaults");
}
```

### 6.2 部分的破損時

```typescript
function repairCorruptedData(
  data: Partial<SkillStoreSchema>,
): SkillStoreSchema {
  return {
    schemaVersion: data.schemaVersion ?? CURRENT_SCHEMA_VERSION,
    importedSkills: repairImportedSkills(data.importedSkills),
    skillSettings: repairSkillSettings(data.skillSettings),
    // オプショナルフィールドは破損時に削除
  };
}
```

---

## 7. IPC エラー変換

### 7.1 IPC Handler でのエラー変換

```typescript
// IPC Handler での使用例
ipcMain.handle("skill:addImport", async (_, skillName: string) => {
  try {
    skillImportStore.addImport(skillName);
    return { success: true };
  } catch (error) {
    if (isSkillStoreError(error)) {
      return {
        success: false,
        error: {
          code: error.code,
          message: error.message,
          retryable: error.retryable,
        },
      };
    }
    return {
      success: false,
      error: {
        code: SKILL_STORE_ERRORS.INTERNAL_ERROR,
        message: "An unexpected error occurred",
        retryable: false,
      },
    };
  }
});
```

---

## 8. テスト戦略

### 8.1 エラーケーステスト

```typescript
describe("error handling", () => {
  it("should throw on invalid skill name", () => {
    expect(() => store.addImport("")).toThrow(SkillStoreError);
    expect(() => store.addImport("../evil")).toThrow(SkillStoreError);
  });

  it("should return empty array on read error", () => {
    // ストアを破損させる
    fs.writeFileSync(storePath, "{ invalid json");

    const store = new SkillImportStore();
    expect(store.getImported()).toEqual([]);
  });

  it("should return default settings for unknown skill", () => {
    const settings = store.getSettings("unknown-skill");
    expect(settings).toEqual(DEFAULT_SKILL_SETTINGS);
  });
});
```

---

## 9. 設計決定理由

| 決定                     | 理由                            |
| ------------------------ | ------------------------------- |
| 読み取りはフォールバック | ユーザー体験を優先              |
| 書き込みは例外スロー     | データ整合性を優先              |
| エラーコード体系         | 既存の error-handling.md に準拠 |
| ログ出力                 | デバッグ・監視に必須            |
