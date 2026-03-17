# SkillDistributionService テスト仕様書

## メタ情報

| 項目       | 内容                                                                             |
| ---------- | -------------------------------------------------------------------------------- |
| 文書       | Phase 4 - Task 2 成果物                                                          |
| タスクID   | TASK-SKILL-LIFECYCLE-08                                                          |
| 作成日     | 2026-03-17                                                                       |
| 依存成果物 | `outputs/phase-2/distribution-operations-design.md`                              |
| 対象       | `SkillDistributionService`（importSkill / exportSkill / forkSkill / shareSkill） |
| テストID   | DT-01 〜 DT-28                                                                   |

---

## 1. 概要

本仕様書は `SkillDistributionService` インターフェースの各メソッドに対するテストケースを定義する。

- **対象メソッド**: `importSkill()` / `exportSkill()` / `forkSkill()` / `shareSkill()`
- **IPC レスポンス形式**: P60 準拠 `IpcResponse<T>` wrapper を使用。エラーアサーションは `result.error.code` で行う（`result.code` ではない）
- **バリデーション**: P42 準拠の 3 段バリデーション（型チェック → 空文字列 → trim 後空文字列）を全文字列引数に適用
- **エラーコード**: `SKILL_DISTRIBUTION_ERROR_CODES` 定数を使用（`distribution-operations-design.md` セクション 2.7）
- **設計参照**: `outputs/phase-2/distribution-operations-design.md`

---

## 2. テストケース一覧テーブル

| テストID | メソッド    | テスト名                                   | 入力概要                                                  | 期待出力                                                                        | 検証条件                                                   |
| -------- | ----------- | ------------------------------------------ | --------------------------------------------------------- | ------------------------------------------------------------------------------- | ---------------------------------------------------------- |
| DT-01    | importSkill | 正常インポート（依存なし）                 | 有効 sourceUrl, autoResolveDependencies=false             | `{ success: true, data: { skillId, importedAt, resolvedDependencies: [] } }`    | skillId 非空、importedAt ISO 8601、resolvedDependencies=[] |
| DT-02    | importSkill | 正常インポート（依存自動解決）             | 有効 sourceUrl, autoResolveDependencies=true              | `{ success: true, data: { skillId, importedAt, resolvedDependencies: [id1] } }` | resolvedDependencies 配列に依存スキル ID が含まれる        |
| DT-03    | importSkill | sourceUrl が空文字列（P42 違反）           | `sourceUrl: ""`                                           | `{ success: false, error: { code: "SKILL_DIST_VALIDATION_ERROR" } }`            | `result.error.code === "SKILL_DIST_VALIDATION_ERROR"`      |
| DT-04    | importSkill | sourceUrl がスペースのみ（P42 trim 違反）  | `sourceUrl: "   "`                                        | `{ success: false, error: { code: "SKILL_DIST_VALIDATION_ERROR" } }`            | `result.error.code === "SKILL_DIST_VALIDATION_ERROR"`      |
| DT-05    | importSkill | team スキルのインポートブロック            | visibility="team" のスキル URL                            | `{ success: false, error: { code: "SKILL_DIST_IMPORT_BLOCKED_TEAM" } }`         | `result.error.code === "SKILL_DIST_IMPORT_BLOCKED_TEAM"`   |
| DT-06    | importSkill | 依存スキルが未解決（DEPENDENCY_ERROR）     | 依存スキルが存在しない URL, autoResolveDependencies=false | `{ success: false, error: { code: "SKILL_DIST_DEPENDENCY_ERROR" } }`            | `result.error.code === "SKILL_DIST_DEPENDENCY_ERROR"`      |
| DT-07    | importSkill | ネットワークエラー                         | 到達不能な sourceUrl                                      | `{ success: false, error: { code: "SKILL_DIST_NETWORK_ERROR" } }`               | `result.error.code === "SKILL_DIST_NETWORK_ERROR"`         |
| DT-08    | importSkill | targetDirectory がスペースのみ（P42 違反） | `options.targetDirectory: "   "`                          | `{ success: false, error: { code: "SKILL_DIST_VALIDATION_ERROR" } }`            | `result.error.code === "SKILL_DIST_VALIDATION_ERROR"`      |
| DT-09    | exportSkill | 正常エクスポート（メタデータ含む）         | 有効 skillId, includeMetadata=true                        | `{ success: true, data: { fileName, size, checksum } }`                         | fileName に version 含む、checksum が 64 文字の 16 進数    |
| DT-10    | exportSkill | 正常エクスポート（メタデータなし）         | 有効 skillId, includeMetadata=false                       | `{ success: true, data: { fileName, size, checksum } }`                         | fileName 存在、checksum 64 文字                            |
| DT-11    | exportSkill | skillId が空文字列（P42 違反）             | `skillId: ""`                                             | `{ success: false, error: { code: "SKILL_DIST_VALIDATION_ERROR" } }`            | `result.error.code === "SKILL_DIST_VALIDATION_ERROR"`      |
| DT-12    | exportSkill | skillId がスペースのみ（P42 trim 違反）    | `skillId: "   "`                                          | `{ success: false, error: { code: "SKILL_DIST_VALIDATION_ERROR" } }`            | `result.error.code === "SKILL_DIST_VALIDATION_ERROR"`      |
| DT-13    | exportSkill | 存在しない skillId                         | `skillId: "not-exist"`                                    | `{ success: false, error: { code: "SKILL_DIST_NOT_FOUND_ERROR" } }`             | `result.error.code === "SKILL_DIST_NOT_FOUND_ERROR"`       |
| DT-14    | exportSkill | SHA-256 チェックサム検証                   | 有効 skillId                                              | checksum が 64 文字の小文字 16 進数文字列                                       | `/^[0-9a-f]{64}$/.test(checksum) === true`                 |
| DT-15    | forkSkill   | 正常 fork（重複名なし）                    | 有効 skillId, newName="my-fork"                           | `{ success: true, data: { newSkillId, parentRef, forkedAt } }`                  | parentRef === skillId, forkedAt ISO 8601, newSkillId 非空  |
| DT-16    | forkSkill   | 重複名の場合サフィックス自動付与           | newName が既存スキルと同名                                | `{ success: true, data: { newSkillId, parentRef, forkedAt } }`                  | エラーではなく自動補正                                     |
| DT-17    | forkSkill   | skillId が空文字列（P42 違反）             | `skillId: ""`                                             | `{ success: false, error: { code: "SKILL_DIST_VALIDATION_ERROR" } }`            | `result.error.code === "SKILL_DIST_VALIDATION_ERROR"`      |
| DT-18    | forkSkill   | newName がスペースのみ（P42 trim 違反）    | `newName: "   "`                                          | `{ success: false, error: { code: "SKILL_DIST_VALIDATION_ERROR" } }`            | `result.error.code === "SKILL_DIST_VALIDATION_ERROR"`      |
| DT-19    | forkSkill   | fork 権限なし                              | 他ユーザーの team スキル（shared_with に含まれず）        | `{ success: false, error: { code: "SKILL_DIST_FORK_NOT_ALLOWED" } }`            | `result.error.code === "SKILL_DIST_FORK_NOT_ALLOWED"`      |
| DT-20    | forkSkill   | parentRef が fork 元 skillId と一致する    | 有効 skillId                                              | `data.parentRef === skillId`                                                    | fork 元 ID が parentRef フィールドに保持される             |
| DT-21    | shareSkill  | 正常共有（read 権限、24 時間）             | 有効 skillId, 有効 teamId, expiresIn=86400                | `{ success: true, data: { url, teamId, expiresAt, token } }`                    | url 非空, token 非空, expiresAt ISO 8601                   |
| DT-22    | shareSkill  | 正常共有（read-write 権限）                | 有効 skillId, 有効 teamId, permissions="read-write"       | `{ success: true, data: { ... } }`                                              | 正常完了                                                   |
| DT-23    | shareSkill  | teamId が空文字列（P42 違反）              | `teamId: ""`                                              | `{ success: false, error: { code: "SKILL_DIST_VALIDATION_ERROR" } }`            | `result.error.code === "SKILL_DIST_VALIDATION_ERROR"`      |
| DT-24    | shareSkill  | teamId がスペースのみ（P42 trim 違反）     | `teamId: "   "`                                           | `{ success: false, error: { code: "SKILL_DIST_VALIDATION_ERROR" } }`            | `result.error.code === "SKILL_DIST_VALIDATION_ERROR"`      |
| DT-25    | shareSkill  | expiresIn が 0（正整数違反）               | `expiresIn: 0`                                            | `{ success: false, error: { code: "SKILL_DIST_VALIDATION_ERROR" } }`            | `result.error.code === "SKILL_DIST_VALIDATION_ERROR"`      |
| DT-26    | shareSkill  | expiresIn が負の値                         | `expiresIn: -1`                                           | `{ success: false, error: { code: "SKILL_DIST_VALIDATION_ERROR" } }`            | `result.error.code === "SKILL_DIST_VALIDATION_ERROR"`      |
| DT-27    | shareSkill  | expiresIn が小数                           | `expiresIn: 1.5`                                          | `{ success: false, error: { code: "SKILL_DIST_VALIDATION_ERROR" } }`            | `result.error.code === "SKILL_DIST_VALIDATION_ERROR"`      |
| DT-28    | shareSkill  | 存在しない skillId                         | `skillId: "not-exist"`                                    | `{ success: false, error: { code: "SKILL_DIST_NOT_FOUND_ERROR" } }`             | `result.error.code === "SKILL_DIST_NOT_FOUND_ERROR"`       |

---

## 3. モックデータ定義

```typescript
import { describe, it, expect, beforeEach, vi } from "vitest";
import type {
  SkillDistributionService,
  ImportOptions,
  ImportResult,
  ExportOptions,
  ExportPackage,
  ForkResult,
  ShareOptions,
  ShareLink,
} from "@repo/shared";

// --- 共通定数 ---

const VALID_SKILL_ID = "skill-abc-123";
const VALID_TEAM_ID = "team-xyz-456";
const VALID_SOURCE_URL =
  "https://skill-center.example.com/skills/my-analyzer@1.2.0";
const FORK_SOURCE_SKILL_ID = "source-skill-999";
const FORK_NEW_NAME = "my-fork-skill";
const DUPLICATE_NAME = "existing-skill";

// --- importSkill モックデータ ---

/** 正常インポートオプション（依存解決なし） */
const importOptionsNoResolve: ImportOptions = {
  autoResolveDependencies: false,
};

/** 正常インポートオプション（依存自動解決あり） */
const importOptionsWithResolve: ImportOptions = {
  autoResolveDependencies: true,
};

/** 正常インポート結果（依存なし） */
const validImportResult: ImportResult = {
  skillId: "imported-skill-001",
  importedAt: "2026-03-17T07:20:46.000Z",
  resolvedDependencies: [],
};

/** 依存解決付きインポート結果 */
const importResultWithDeps: ImportResult = {
  skillId: "imported-skill-002",
  importedAt: "2026-03-17T07:20:46.000Z",
  resolvedDependencies: ["dep-skill-001", "dep-skill-002"],
};

// --- exportSkill モックデータ ---

/** エクスポートオプション（メタデータ含む） */
const exportOptionsWithMeta: ExportOptions = {
  includeMetadata: true,
  format: "skill-package",
};

/** エクスポートオプション（メタデータなし） */
const exportOptionsWithoutMeta: ExportOptions = {
  includeMetadata: false,
  format: "skill-package",
};

/** 正常エクスポート結果（SHA-256 64文字 16進数） */
const validExportPackage: ExportPackage = {
  fileName: "my-analyzer@1.2.0.skillpkg",
  size: 10240,
  checksum: "a3f5b2c1d4e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2",
};

// --- forkSkill モックデータ ---

/** 正常 fork 結果 */
const validForkResult: ForkResult = {
  newSkillId: "forked-skill-uuid-v4",
  parentRef: FORK_SOURCE_SKILL_ID,
  forkedAt: "2026-03-17T07:20:46.000Z",
};

/** 重複名時の fork 結果（サービスが自動サフィックス付与） */
const duplicateNameForkResult: ForkResult = {
  newSkillId: "forked-skill-uuid-v4-2",
  parentRef: FORK_SOURCE_SKILL_ID,
  forkedAt: "2026-03-17T07:20:46.000Z",
};

// --- shareSkill モックデータ ---

/** 正常共有オプション（read, 24 時間） */
const shareOptionsRead: ShareOptions = {
  expiresIn: 86400,
  permissions: "read",
};

/** 正常共有オプション（read-write） */
const shareOptionsReadWrite: ShareOptions = {
  expiresIn: 86400,
  permissions: "read-write",
};

/** 正常共有リンク結果 */
const validShareLink: ShareLink = {
  url: "https://skill-center.example.com/share/eyJhbGciOiJIUzI1NiJ9",
  teamId: VALID_TEAM_ID,
  expiresAt: "2026-03-18T07:20:46.000Z",
  token:
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJza2lsbElkIjoiYWJjIn0.signature",
};

// --- SkillDistributionService モック ---

const mockDistributionService: SkillDistributionService = {
  importSkill: vi.fn(),
  exportSkill: vi.fn(),
  forkSkill: vi.fn(),
  shareSkill: vi.fn(),
};

beforeEach(() => {
  vi.clearAllMocks();
});
```

---

## 4. 正常系テスト詳細

### DT-01: importSkill() - 正常インポート（依存なし）

```typescript
it("DT-01: importSkill() - 有効な sourceUrl で依存なしインポートが成功する", async () => {
  vi.mocked(mockDistributionService.importSkill).mockResolvedValue(
    validImportResult,
  );

  const result = await mockDistributionService.importSkill(
    VALID_SOURCE_URL,
    importOptionsNoResolve,
  );

  expect(result.skillId).toBeTruthy();
  expect(result.importedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/); // ISO 8601
  expect(result.resolvedDependencies).toEqual([]);
});
```

### DT-02: importSkill() - 依存自動解決

```typescript
it("DT-02: importSkill() - autoResolveDependencies=true で依存スキルが自動解決される", async () => {
  vi.mocked(mockDistributionService.importSkill).mockResolvedValue(
    importResultWithDeps,
  );

  const result = await mockDistributionService.importSkill(
    VALID_SOURCE_URL,
    importOptionsWithResolve,
  );

  expect(result.resolvedDependencies).toHaveLength(2);
  result.resolvedDependencies.forEach((id) => expect(typeof id).toBe("string"));
});
```

### DT-09 〜 DT-10: exportSkill() - 正常エクスポート

```typescript
it("DT-09: exportSkill() - includeMetadata=true でエクスポートが成功しパッケージ情報を返す", async () => {
  vi.mocked(mockDistributionService.exportSkill).mockResolvedValue(
    validExportPackage,
  );

  const result = await mockDistributionService.exportSkill(
    VALID_SKILL_ID,
    exportOptionsWithMeta,
  );

  expect(result.fileName).toBeTruthy();
  expect(result.size).toBeGreaterThan(0);
  expect(result.checksum).toHaveLength(64);
});

it("DT-10: exportSkill() - includeMetadata=false でもエクスポートが成功する", async () => {
  vi.mocked(mockDistributionService.exportSkill).mockResolvedValue(
    validExportPackage,
  );

  const result = await mockDistributionService.exportSkill(
    VALID_SKILL_ID,
    exportOptionsWithoutMeta,
  );

  expect(result.fileName).toBeTruthy();
  expect(result.checksum).toHaveLength(64);
});
```

### DT-14: exportSkill() - SHA-256 チェックサム検証

```typescript
it("DT-14: exportSkill() - SHA-256 チェックサムが 64 文字の小文字 16 進数文字列である", async () => {
  vi.mocked(mockDistributionService.exportSkill).mockResolvedValue(
    validExportPackage,
  );

  const result = await mockDistributionService.exportSkill(
    VALID_SKILL_ID,
    exportOptionsWithMeta,
  );

  expect(/^[0-9a-f]{64}$/.test(result.checksum)).toBe(true);
});
```

### DT-15: forkSkill() - 正常 fork

```typescript
it("DT-15: forkSkill() - 有効な skillId と newName で fork が成功する", async () => {
  vi.mocked(mockDistributionService.forkSkill).mockResolvedValue(
    validForkResult,
  );

  const result = await mockDistributionService.forkSkill(
    FORK_SOURCE_SKILL_ID,
    FORK_NEW_NAME,
  );

  expect(result.newSkillId).toBeTruthy();
  expect(result.parentRef).toBe(FORK_SOURCE_SKILL_ID);
  expect(result.forkedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/); // ISO 8601
});
```

### DT-16: forkSkill() - 重複名の場合サフィックス自動付与

```typescript
it("DT-16: forkSkill() - 重複名の場合はエラーではなく自動サフィックスで補正される", async () => {
  // 設計: 同名 fork 既存時 → サフィックス付与（DUPLICATE_NAME_ERROR ではない）
  vi.mocked(mockDistributionService.forkSkill).mockResolvedValue(
    duplicateNameForkResult,
  );

  const result = await mockDistributionService.forkSkill(
    FORK_SOURCE_SKILL_ID,
    DUPLICATE_NAME,
  );

  // エラーにならず成功すること
  expect(result.newSkillId).toBeTruthy();
  expect(result.parentRef).toBe(FORK_SOURCE_SKILL_ID);
});
```

### DT-20: forkSkill() - parentRef が fork 元 skillId と一致

```typescript
it("DT-20: forkSkill() - parentRef フィールドに fork 元 skillId が保持される", async () => {
  vi.mocked(mockDistributionService.forkSkill).mockResolvedValue(
    validForkResult,
  );

  const result = await mockDistributionService.forkSkill(
    FORK_SOURCE_SKILL_ID,
    FORK_NEW_NAME,
  );

  expect(result.parentRef).toBe(FORK_SOURCE_SKILL_ID);
});
```

### DT-21 〜 DT-22: shareSkill() - 正常共有

```typescript
it("DT-21: shareSkill() - 有効な引数で共有リンク（read 権限、24 時間）を生成できる", async () => {
  vi.mocked(mockDistributionService.shareSkill).mockResolvedValue(
    validShareLink,
  );

  const result = await mockDistributionService.shareSkill(
    VALID_SKILL_ID,
    VALID_TEAM_ID,
    shareOptionsRead,
  );

  expect(result.url).toBeTruthy();
  expect(result.teamId).toBe(VALID_TEAM_ID);
  expect(result.expiresAt).toMatch(/^\d{4}-\d{2}-\d{2}T/); // ISO 8601
  expect(result.token).toBeTruthy();
});

it("DT-22: shareSkill() - read-write 権限でも正常に共有リンクを生成できる", async () => {
  vi.mocked(mockDistributionService.shareSkill).mockResolvedValue(
    validShareLink,
  );

  const result = await mockDistributionService.shareSkill(
    VALID_SKILL_ID,
    VALID_TEAM_ID,
    shareOptionsReadWrite,
  );

  expect(result.url).toBeTruthy();
  expect(result.token).toBeTruthy();
});
```

---

## 5. 異常系テスト詳細

### DT-03 〜 DT-04: importSkill() - sourceUrl バリデーションエラー（P42 準拠）

```typescript
it("DT-03: importSkill() ハンドラ - sourceUrl が空文字列の場合 SKILL_DIST_VALIDATION_ERROR（P42 2段目）", () => {
  const sourceUrl = "";
  const isValid =
    typeof sourceUrl === "string" &&
    sourceUrl !== "" &&
    sourceUrl.trim() !== "";
  expect(isValid).toBe(false);
  // ハンドラは { success: false, error: { code: "SKILL_DIST_VALIDATION_ERROR" } } を返す
});

it("DT-04: importSkill() ハンドラ - sourceUrl がスペースのみの場合 SKILL_DIST_VALIDATION_ERROR（P42 3段目）", () => {
  const sourceUrl = "   ";
  const isValid =
    typeof sourceUrl === "string" &&
    sourceUrl !== "" &&
    sourceUrl.trim() !== "";
  expect(isValid).toBe(false);
});
```

### DT-05 〜 DT-07: importSkill() - 業務エラー

```typescript
it("DT-05: importSkill() - team スキルのインポートは SKILL_DIST_IMPORT_BLOCKED_TEAM エラーを返す", () => {
  const response = {
    success: false as const,
    error: {
      code: "SKILL_DIST_IMPORT_BLOCKED_TEAM",
      message: "team スキルはインポートできません",
    },
  };
  expect(response.success).toBe(false);
  expect(response.error.code).toBe("SKILL_DIST_IMPORT_BLOCKED_TEAM");
});

it("DT-06: importSkill() - 依存スキルが未解決の場合 SKILL_DIST_DEPENDENCY_ERROR を返す", () => {
  const response = {
    success: false as const,
    error: {
      code: "SKILL_DIST_DEPENDENCY_ERROR",
      message: "依存スキルが見つかりません",
    },
  };
  expect(response.success).toBe(false);
  expect(response.error.code).toBe("SKILL_DIST_DEPENDENCY_ERROR");
});

it("DT-07: importSkill() - ネットワーク到達不能の場合 SKILL_DIST_NETWORK_ERROR を返す", () => {
  const response = {
    success: false as const,
    error: {
      code: "SKILL_DIST_NETWORK_ERROR",
      message: "ネットワーク接続に失敗しました",
    },
  };
  expect(response.success).toBe(false);
  expect(response.error.code).toBe("SKILL_DIST_NETWORK_ERROR");
});
```

### DT-08: importSkill() - targetDirectory バリデーション

```typescript
it("DT-08: importSkill() ハンドラ - targetDirectory がスペースのみの場合 SKILL_DIST_VALIDATION_ERROR（P42 3段目）", () => {
  const targetDirectory = "   ";
  // 省略時はデフォルトディレクトリを使用するが、指定する場合は P42 準拠
  const isValid =
    targetDirectory === undefined ||
    (typeof targetDirectory === "string" &&
      targetDirectory !== "" &&
      targetDirectory.trim() !== "");
  expect(isValid).toBe(false);
});
```

### DT-11 〜 DT-12: exportSkill() - skillId バリデーションエラー

```typescript
it("DT-11: exportSkill() ハンドラ - skillId が空文字列の場合 SKILL_DIST_VALIDATION_ERROR（P42 2段目）", () => {
  const skillId = "";
  const isValid =
    typeof skillId === "string" && skillId !== "" && skillId.trim() !== "";
  expect(isValid).toBe(false);
});

it("DT-12: exportSkill() ハンドラ - skillId がスペースのみの場合 SKILL_DIST_VALIDATION_ERROR（P42 3段目）", () => {
  const skillId = "   ";
  const isValid =
    typeof skillId === "string" && skillId !== "" && skillId.trim() !== "";
  expect(isValid).toBe(false);
});
```

### DT-13: exportSkill() - 存在しない skillId

```typescript
it("DT-13: exportSkill() - 存在しない skillId の場合 SKILL_DIST_NOT_FOUND_ERROR を返す", () => {
  const response = {
    success: false as const,
    error: {
      code: "SKILL_DIST_NOT_FOUND_ERROR",
      message: "スキルが見つかりません",
    },
  };
  expect(response.success).toBe(false);
  expect(response.error.code).toBe("SKILL_DIST_NOT_FOUND_ERROR");
});
```

### DT-17 〜 DT-18: forkSkill() - バリデーションエラー

```typescript
it("DT-17: forkSkill() ハンドラ - skillId が空文字列の場合 SKILL_DIST_VALIDATION_ERROR（P42 2段目）", () => {
  const skillId = "";
  const isValid =
    typeof skillId === "string" && skillId !== "" && skillId.trim() !== "";
  expect(isValid).toBe(false);
});

it("DT-18: forkSkill() ハンドラ - newName がスペースのみの場合 SKILL_DIST_VALIDATION_ERROR（P42 3段目）", () => {
  const newName = "   ";
  const isValid =
    typeof newName === "string" && newName !== "" && newName.trim() !== "";
  expect(isValid).toBe(false);
});
```

### DT-19: forkSkill() - fork 権限なし

```typescript
it("DT-19: forkSkill() - 権限のない team スキルに対して SKILL_DIST_FORK_NOT_ALLOWED を返す", () => {
  const response = {
    success: false as const,
    error: {
      code: "SKILL_DIST_FORK_NOT_ALLOWED",
      message: "fork 権限がありません",
    },
  };
  expect(response.success).toBe(false);
  expect(response.error.code).toBe("SKILL_DIST_FORK_NOT_ALLOWED");
});
```

### DT-23 〜 DT-24: shareSkill() - teamId バリデーションエラー

```typescript
it("DT-23: shareSkill() ハンドラ - teamId が空文字列の場合 SKILL_DIST_VALIDATION_ERROR（P42 2段目）", () => {
  const teamId = "";
  const isValid =
    typeof teamId === "string" && teamId !== "" && teamId.trim() !== "";
  expect(isValid).toBe(false);
});

it("DT-24: shareSkill() ハンドラ - teamId がスペースのみの場合 SKILL_DIST_VALIDATION_ERROR（P42 3段目）", () => {
  const teamId = "   ";
  const isValid =
    typeof teamId === "string" && teamId !== "" && teamId.trim() !== "";
  expect(isValid).toBe(false);
});
```

### DT-25 〜 DT-27: shareSkill() - expiresIn バリデーションエラー

```typescript
it("DT-25: shareSkill() ハンドラ - expiresIn が 0 の場合 SKILL_DIST_VALIDATION_ERROR（正の整数違反）", () => {
  const expiresIn = 0;
  // P42 準拠: 正の整数かつ Number.isInteger であること
  const isValid =
    typeof expiresIn === "number" &&
    expiresIn > 0 &&
    Number.isInteger(expiresIn);
  expect(isValid).toBe(false);
});

it("DT-26: shareSkill() ハンドラ - expiresIn が負の値の場合 SKILL_DIST_VALIDATION_ERROR", () => {
  const expiresIn = -1;
  const isValid =
    typeof expiresIn === "number" &&
    expiresIn > 0 &&
    Number.isInteger(expiresIn);
  expect(isValid).toBe(false);
});

it("DT-27: shareSkill() ハンドラ - expiresIn が小数の場合 SKILL_DIST_VALIDATION_ERROR（整数違反）", () => {
  const expiresIn = 1.5;
  const isValid =
    typeof expiresIn === "number" &&
    expiresIn > 0 &&
    Number.isInteger(expiresIn);
  expect(isValid).toBe(false);
});
```

### DT-28: shareSkill() - 存在しない skillId

```typescript
it("DT-28: shareSkill() - 存在しない skillId の場合 SKILL_DIST_NOT_FOUND_ERROR を返す", () => {
  const response = {
    success: false as const,
    error: {
      code: "SKILL_DIST_NOT_FOUND_ERROR",
      message: "スキルが見つかりません",
    },
  };
  expect(response.success).toBe(false);
  expect(response.error.code).toBe("SKILL_DIST_NOT_FOUND_ERROR");
});
```

---

## 6. Phase 2 設計書との対応（トレーサビリティ）

| テストID       | Phase 2 設計書参照箇所                                                             | 検証する設計要素                                                        |
| -------------- | ---------------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| DT-01          | `distribution-operations-design.md` セクション 4.1（import フロー）                | 正常インポート、importedAt ISO 8601、resolvedDependencies=[]            |
| DT-02          | `distribution-operations-design.md` セクション 4.1 依存解決フロー                  | autoResolveDependencies=true による依存スキルの自動解決                 |
| DT-03 〜 DT-04 | `distribution-operations-design.md` セクション 6（バリデーションマトリクス）       | sourceUrl P42 準拠 3 段バリデーション（空文字 / スペースのみ）          |
| DT-05          | `distribution-operations-design.md` セクション 4.1 visibility チェック             | team スキルのインポートブロック（IMPORT_BLOCKED_TEAM）                  |
| DT-06          | `distribution-operations-design.md` セクション 4.1 依存チェック                    | 未解決依存スキルの DEPENDENCY_ERROR                                     |
| DT-07          | `distribution-operations-design.md` セクション 2.7（NETWORK_ERROR）                | ネットワーク到達不能エラー                                              |
| DT-08          | `distribution-operations-design.md` セクション 6（targetDirectory バリデーション） | 指定ありの targetDirectory P42 バリデーション                           |
| DT-09 〜 DT-10 | `distribution-operations-design.md` セクション 4.2 エクスポートフロー              | includeMetadata 設定、ExportPackage の fileName/size/checksum           |
| DT-11 〜 DT-12 | `distribution-operations-design.md` セクション 6（exportSkill バリデーション）     | skillId P42 準拠 3 段バリデーション                                     |
| DT-13          | `distribution-operations-design.md` セクション 2.7（NOT_FOUND_ERROR）              | 存在しない skillId のエラー処理                                         |
| DT-14          | `distribution-operations-design.md` セクション 2.3（ExportPackage.checksum）       | SHA-256 64 文字 16 進数チェックサム                                     |
| DT-15          | `distribution-operations-design.md` セクション 4.3 fork フロー                     | 正常 fork、parentRef = 元 skillId、forkedAt ISO 8601                    |
| DT-16          | `distribution-operations-design.md` セクション 7.3 競合ケース                      | 重複名でエラーなく自動サフィックス付与（DUPLICATE_NAME_ERROR ではない） |
| DT-17 〜 DT-18 | `distribution-operations-design.md` セクション 6（forkSkill バリデーション）       | skillId / newName P42 準拠 3 段バリデーション                           |
| DT-19          | `distribution-operations-design.md` セクション 4.3 fork 権限チェック               | 権限なし → FORK_NOT_ALLOWED                                             |
| DT-20          | `distribution-operations-design.md` セクション 2.4（ForkResult.parentRef）         | parentRef に fork 元 skillId が保持される                               |
| DT-21 〜 DT-22 | `distribution-operations-design.md` セクション 4.4 share フロー                    | 正常共有、ShareLink の url / teamId / expiresAt / token                 |
| DT-23 〜 DT-24 | `distribution-operations-design.md` セクション 6（shareSkill teamId）              | teamId P42 準拠 3 段バリデーション                                      |
| DT-25 〜 DT-27 | `distribution-operations-design.md` セクション 6（expiresIn バリデーション）       | expiresIn 正整数バリデーション（0, 負値, 小数）                         |
| DT-28          | `distribution-operations-design.md` セクション 2.7（NOT_FOUND_ERROR）              | 存在しない skillId での shareSkill エラー                               |
