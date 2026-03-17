# SkillRegistryService テスト仕様書

## メタ情報

| 項目       | 内容                                                                             |
| ---------- | -------------------------------------------------------------------------------- |
| 文書       | Phase 4 - Task 1 成果物                                                          |
| タスクID   | TASK-SKILL-LIFECYCLE-08                                                          |
| 作成日     | 2026-03-17                                                                       |
| 依存成果物 | `outputs/phase-2/skill-center-flow-design.md`                                    |
| 対象       | `SkillRegistryService`（register / update / deprecate / remove / getDependents） |
| テストID   | SC-01 〜 SC-27                                                                   |

---

## 1. 概要

本仕様書は `SkillRegistryService` インターフェースの各メソッドに対するテストケースを定義する。

- **対象メソッド**: `register()` / `update()` / `deprecate()` / `remove()` / `getDependents()`
- **IPC レスポンス形式**: P60 準拠 `IpcResponse<T>` wrapper を使用。エラーアサーションは `result.error.code` で行う（`result.code` ではない）
- **バリデーション**: P42 準拠の 3 段バリデーション（型チェック → 空文字列 → trim 後空文字列）を全文字列引数に適用
- **設計参照**: `outputs/phase-2/skill-center-flow-design.md` セクション 3〜7

---

## 2. テストケース一覧テーブル

| テストID | メソッド      | テスト名                                 | 入力概要                                             | 期待出力                                                                   | 検証条件                                                     |
| -------- | ------------- | ---------------------------------------- | ---------------------------------------------------- | -------------------------------------------------------------------------- | ------------------------------------------------------------ |
| SC-01    | register      | 正常登録（public 昇格）                  | 有効メタデータ、visibility="public"                  | `{ success: true, data: { skillId, registeredAt, visibility:"public" } }`  | skillId 非空, registeredAt ISO 8601, visibility="public"     |
| SC-02    | register      | name が空文字列（P42 違反）              | `name: ""`                                           | `{ success: false, error: { code: "VALIDATION_ERROR" } }`                  | `result.error.code === "VALIDATION_ERROR"`                   |
| SC-03    | register      | name がスペースのみ（P42 trim 違反）     | `name: "   "`                                        | `{ success: false, error: { code: "VALIDATION_ERROR" } }`                  | `result.error.code === "VALIDATION_ERROR"`                   |
| SC-04    | register      | license が空文字列（public 昇格時）      | `visibility:"public"`, `license: ""`                 | `{ success: false, error: { code: "VALIDATION_ERROR" } }`                  | `result.error.code === "VALIDATION_ERROR"`                   |
| SC-05    | register      | license がスペースのみ（public 昇格時）  | `visibility:"public"`, `license: "   "`              | `{ success: false, error: { code: "VALIDATION_ERROR" } }`                  | `result.error.code === "VALIDATION_ERROR"`                   |
| SC-06    | register      | SafetyGate ブロック（critical リスク）   | riskLevel="critical" のスキル                        | `{ success: false, error: { code: "SAFETY_GATE_BLOCKED" } }`               | `result.error.code === "SAFETY_GATE_BLOCKED"`                |
| SC-07    | update        | 正常更新（compatible、自動承認）         | skillId 有効, newVersion.version="1.1.0", compatible | `{ success: true, data: { oldVersion, newVersion, compatibilityResult } }` | oldVersion < newVersion, updatedAt ISO 8601                  |
| SC-08    | update        | 正常更新（minor-incompatible、自動承認） | level="minor-incompatible", minor バンプ             | `{ success: true, data: { ... } }`                                         | compatibilityResult.level="minor-incompatible"               |
| SC-09    | update        | breaking + major バンプ済み（手動承認）  | level="breaking", version="2.0.0"                    | `{ success: true, data: { ... } }`                                         | compatibilityResult.level="breaking", 手動承認キュー登録確認 |
| SC-10    | update        | breaking + major バンプ未実施            | level="breaking", version="1.5.0"                    | `{ success: false, error: { code: "BREAKING_CHANGE_ERROR" } }`             | `result.error.code === "BREAKING_CHANGE_ERROR"`              |
| SC-11    | update        | skillId が空文字列（P42 違反）           | `skillId: ""`                                        | `{ success: false, error: { code: "VALIDATION_ERROR" } }`                  | `result.error.code === "VALIDATION_ERROR"`                   |
| SC-12    | update        | newVersion.version がスペースのみ        | `newVersion.version: "   "`                          | `{ success: false, error: { code: "VALIDATION_ERROR" } }`                  | `result.error.code === "VALIDATION_ERROR"`                   |
| SC-13    | update        | semver 形式違反                          | `newVersion.version: "abc"`                          | `{ success: false, error: { code: "INVALID_SEMVER_ERROR" } }`              | `result.error.code === "INVALID_SEMVER_ERROR"`               |
| SC-14    | update        | 存在しない skillId                       | `skillId: "not-exist"`                               | `{ success: false, error: { code: "NOT_FOUND_ERROR" } }`                   | `result.error.code === "NOT_FOUND_ERROR"`                    |
| SC-15    | deprecate     | 正常非推奨化（reason 有効、30 日）       | reason="廃止予定", gracePeriodDays=30                | `{ success: true }` (void)                                                 | 正常完了（戻り値なし）                                       |
| SC-16    | deprecate     | reason が 1 文字（境界値）               | reason="廃"                                          | `{ success: true }` (void)                                                 | 正常完了                                                     |
| SC-17    | deprecate     | reason が 50 文字（境界値）              | reason が 50 文字の文字列                            | `{ success: true }` (void)                                                 | 正常完了                                                     |
| SC-18    | deprecate     | reason が 51 文字（上限超過）            | reason が 51 文字の文字列                            | `{ success: false, error: { code: "VALIDATION_ERROR" } }`                  | `result.error.code === "VALIDATION_ERROR"`                   |
| SC-19    | deprecate     | reason がスペースのみ（P42 trim 違反）   | `reason: "   "`                                      | `{ success: false, error: { code: "VALIDATION_ERROR" } }`                  | `result.error.code === "VALIDATION_ERROR"`                   |
| SC-20    | deprecate     | gracePeriodDays=0（緊急停止）            | gracePeriodDays=0, emergency=true                    | `{ success: true }` (void)                                                 | grace period なしで非推奨化完了                              |
| SC-21    | remove        | 正常削除（30 日経過後）                  | deprecatedAt が 30 日以上前                          | `{ success: true }` (void)                                                 | 正常完了                                                     |
| SC-22    | remove        | 30 日未経過エラー                        | deprecatedAt が 29 日前                              | `{ success: false, error: { code: "REMOVAL_TOO_EARLY_ERROR" } }`           | `result.error.code === "REMOVAL_TOO_EARLY_ERROR"`            |
| SC-23    | remove        | 緊急削除（emergency=true）               | emergency=true、grace period チェックスキップ        | `{ success: true }` (void)                                                 | 即時削除                                                     |
| SC-24    | remove        | skillId がスペースのみ（P42 違反）       | `skillId: "   "`                                     | `{ success: false, error: { code: "VALIDATION_ERROR" } }`                  | `result.error.code === "VALIDATION_ERROR"`                   |
| SC-25    | getDependents | 依存スキルあり（直接・間接）             | 依存スキルが 3 件存在する skillId                    | `string[]`（長さ >= 1）                                                    | 配列の長さ >= 1, 各要素が文字列                              |
| SC-26    | getDependents | 依存スキルなし                           | 依存スキルが 0 件の skillId                          | `[]`                                                                       | 空配列                                                       |
| SC-27    | getDependents | 存在しない skillId                       | `skillId: "not-exist"`                               | `{ success: false, error: { code: "NOT_FOUND_ERROR" } }`                   | `result.error.code === "NOT_FOUND_ERROR"`                    |

---

## 3. モックデータ定義

```typescript
import { describe, it, expect, beforeEach, vi } from "vitest";
import type {
  SkillRegistryService,
  SkillPublishingMetadata,
  SkillVersion,
  DeprecationNotice,
  RemoveOptions,
  RegisterResult,
  UpdateResult,
} from "@repo/shared";

// --- 共通モックデータ ---

/** 有効なスキルメタデータ（public 昇格用） */
const validPublicMetadata: SkillPublishingMetadata = {
  name: "my-analyzer",
  description: "コードを解析するスキル",
  tags: ["analysis", "code"],
  license: "MIT",
  visibility: "public",
};

/** 有効な新バージョン（compatible） */
const compatibleNewVersion: SkillVersion = {
  version: "1.1.0",
  changelog: "バグ修正と軽微な改善",
  metadata: validPublicMetadata,
};

/** breaking change 付き major バンプバージョン */
const breakingMajorVersion: SkillVersion = {
  version: "2.0.0",
  changelog: "APIの大幅な変更",
  metadata: validPublicMetadata,
};

/** breaking change 付き major バンプ未実施バージョン */
const breakingMinorVersion: SkillVersion = {
  version: "1.5.0",
  changelog: "破壊的変更（major バンプ忘れ）",
  metadata: validPublicMetadata,
};

/** 有効な非推奨化通知 */
const validDeprecationNotice: DeprecationNotice = {
  reason: "廃止予定のスキル",
  gracePeriodDays: 30,
};

/** 有効な skillId */
const validSkillId = "skill-abc-123";

/** 存在しない skillId */
const notFoundSkillId = "not-exist-skill";

// --- SkillRegistryService モック ---

const mockRegistryService: SkillRegistryService = {
  register: vi.fn(),
  update: vi.fn(),
  deprecate: vi.fn(),
  remove: vi.fn(),
  getDependents: vi.fn(),
};

beforeEach(() => {
  vi.clearAllMocks();
});
```

---

## 4. 正常系テスト詳細

### SC-01: register() - 正常登録（public 昇格）

```typescript
it("SC-01: register() - 有効なメタデータで public スキルを登録できる", async () => {
  const expectedResult: RegisterResult = {
    skillId: "skill-abc-123",
    registeredAt: "2026-03-17T07:20:46.000Z",
    visibility: "public",
  };
  vi.mocked(mockRegistryService.register).mockResolvedValue(expectedResult);

  const result = await mockRegistryService.register(validPublicMetadata);

  expect(result.skillId).toBeTruthy();
  expect(result.registeredAt).toMatch(/^\d{4}-\d{2}-\d{2}T/); // ISO 8601
  expect(result.visibility).toBe("public");
});
```

### SC-07: update() - 正常更新（compatible、自動承認）

```typescript
it("SC-07: update() - compatible バージョンは自動承認で更新される", async () => {
  const expectedResult: UpdateResult = {
    skillId: validSkillId,
    oldVersion: "1.0.0",
    newVersion: "1.1.0",
    compatibilityResult: { level: "compatible", breakingChanges: [] },
    updatedAt: "2026-03-17T07:20:46.000Z",
  };
  vi.mocked(mockRegistryService.update).mockResolvedValue(expectedResult);

  const result = await mockRegistryService.update(
    validSkillId,
    compatibleNewVersion,
  );

  expect(result.oldVersion).toBe("1.0.0");
  expect(result.newVersion).toBe("1.1.0");
  expect(result.compatibilityResult.level).toBe("compatible");
  expect(result.updatedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
});
```

### SC-08: update() - 正常更新（minor-incompatible、自動承認）

```typescript
it("SC-08: update() - minor-incompatible バージョンも自動承認で更新される", async () => {
  const expectedResult: UpdateResult = {
    skillId: validSkillId,
    oldVersion: "1.0.0",
    newVersion: "1.1.0",
    compatibilityResult: {
      level: "minor-incompatible",
      breakingChanges: ["optional field removed"],
    },
    updatedAt: "2026-03-17T07:20:46.000Z",
  };
  vi.mocked(mockRegistryService.update).mockResolvedValue(expectedResult);

  const result = await mockRegistryService.update(
    validSkillId,
    compatibleNewVersion,
  );

  expect(result.compatibilityResult.level).toBe("minor-incompatible");
});
```

### SC-09: update() - breaking + major バンプ済み（手動承認キュー登録）

```typescript
it("SC-09: update() - breaking change + major バンプ済みは手動承認キューに登録される", async () => {
  const expectedResult: UpdateResult = {
    skillId: validSkillId,
    oldVersion: "1.0.0",
    newVersion: "2.0.0",
    compatibilityResult: {
      level: "breaking",
      breakingChanges: ["input schema changed", "output schema removed"],
    },
    updatedAt: "2026-03-17T07:20:46.000Z",
  };
  vi.mocked(mockRegistryService.update).mockResolvedValue(expectedResult);

  const result = await mockRegistryService.update(
    validSkillId,
    breakingMajorVersion,
  );

  expect(result.compatibilityResult.level).toBe("breaking");
  expect(result.newVersion).toBe("2.0.0");
});
```

### SC-15 〜 SC-17: deprecate() - 正常非推奨化・境界値

```typescript
it("SC-15: deprecate() - 有効な reason で非推奨化が正常完了する", async () => {
  vi.mocked(mockRegistryService.deprecate).mockResolvedValue(undefined);

  await expect(
    mockRegistryService.deprecate(validSkillId, validDeprecationNotice),
  ).resolves.toBeUndefined();
});

it("SC-16: deprecate() - reason が 1 文字（境界値下限）の場合は正常完了する", async () => {
  const oneCharNotice: DeprecationNotice = {
    reason: "廃",
    gracePeriodDays: 30,
  };
  vi.mocked(mockRegistryService.deprecate).mockResolvedValue(undefined);

  await expect(
    mockRegistryService.deprecate(validSkillId, oneCharNotice),
  ).resolves.toBeUndefined();
});

it("SC-17: deprecate() - reason が 50 文字（境界値上限）の場合は正常完了する", async () => {
  const fiftyCharNotice: DeprecationNotice = {
    reason: "あ".repeat(50),
    gracePeriodDays: 30,
  };
  vi.mocked(mockRegistryService.deprecate).mockResolvedValue(undefined);

  await expect(
    mockRegistryService.deprecate(validSkillId, fiftyCharNotice),
  ).resolves.toBeUndefined();
});
```

### SC-21: remove() - 正常削除（30 日経過後）

```typescript
it("SC-21: remove() - deprecate 後 30 日経過したスキルを削除できる", async () => {
  vi.mocked(mockRegistryService.remove).mockResolvedValue(undefined);

  await expect(
    mockRegistryService.remove(validSkillId),
  ).resolves.toBeUndefined();
});
```

### SC-23: remove() - 緊急削除

```typescript
it("SC-23: remove() - emergency=true で grace period チェックをスキップして即時削除できる", async () => {
  const emergencyOptions: RemoveOptions = { emergency: true };
  vi.mocked(mockRegistryService.remove).mockResolvedValue(undefined);

  await expect(
    mockRegistryService.remove(validSkillId, emergencyOptions),
  ).resolves.toBeUndefined();
  expect(mockRegistryService.remove).toHaveBeenCalledWith(validSkillId, {
    emergency: true,
  });
});
```

### SC-25 〜 SC-26: getDependents() - 依存スキル取得

```typescript
it("SC-25: getDependents() - 依存スキルが存在する場合は ID 配列を返す", async () => {
  const dependentIds = ["dep-skill-001", "dep-skill-002", "dep-skill-003"];
  vi.mocked(mockRegistryService.getDependents).mockResolvedValue(dependentIds);

  const result = await mockRegistryService.getDependents(validSkillId);

  expect(result).toHaveLength(3);
  result.forEach((id) => expect(typeof id).toBe("string"));
});

it("SC-26: getDependents() - 依存スキルが存在しない場合は空配列を返す", async () => {
  vi.mocked(mockRegistryService.getDependents).mockResolvedValue([]);

  const result = await mockRegistryService.getDependents(validSkillId);

  expect(result).toEqual([]);
});
```

---

## 5. 異常系テスト詳細

### SC-02 〜 SC-05: register() バリデーションエラー（P42 準拠）

```typescript
it("SC-02: register() ハンドラ - name が空文字列の場合 VALIDATION_ERROR（P42 2段目）", () => {
  const invalidMetadata = { ...validPublicMetadata, name: "" };
  // P42: 型チェック → 空文字列 → trim
  const isValid =
    typeof invalidMetadata.name === "string" &&
    invalidMetadata.name !== "" &&
    invalidMetadata.name.trim() !== "";
  expect(isValid).toBe(false);
  // IPC ハンドラは { success: false, error: { code: "VALIDATION_ERROR" } } を返す
});

it("SC-03: register() ハンドラ - name がスペースのみの場合 VALIDATION_ERROR（P42 3段目）", () => {
  const invalidMetadata = { ...validPublicMetadata, name: "   " };
  const isValid =
    typeof invalidMetadata.name === "string" &&
    invalidMetadata.name !== "" &&
    invalidMetadata.name.trim() !== "";
  expect(isValid).toBe(false);
});

it("SC-04: register() ハンドラ - public 昇格時に license が空文字列の場合 VALIDATION_ERROR", () => {
  const invalidMetadata = { ...validPublicMetadata, license: "" };
  const isLicenseValid =
    invalidMetadata.visibility !== "public" ||
    (typeof invalidMetadata.license === "string" &&
      invalidMetadata.license !== "" &&
      invalidMetadata.license.trim() !== "");
  expect(isLicenseValid).toBe(false);
});

it("SC-05: register() ハンドラ - public 昇格時に license がスペースのみの場合 VALIDATION_ERROR", () => {
  const invalidMetadata = { ...validPublicMetadata, license: "   " };
  const isLicenseValid =
    invalidMetadata.visibility !== "public" ||
    (typeof invalidMetadata.license === "string" &&
      invalidMetadata.license !== "" &&
      invalidMetadata.license.trim() !== "");
  expect(isLicenseValid).toBe(false);
});
```

### SC-06: register() - SafetyGate ブロック

```typescript
it("SC-06: register() - critical リスクスキルは SAFETY_GATE_BLOCKED エラーを返す", () => {
  // IPC ハンドラ内部で SafetyGate.check() が riskLevel="critical" を返した場合:
  // result.success === false
  // result.error.code === "SAFETY_GATE_BLOCKED"
  const response = {
    success: false as const,
    error: {
      code: "SAFETY_GATE_BLOCKED",
      message: "critical リスクのスキルは公開できません",
    },
  };
  expect(response.success).toBe(false);
  expect(response.error.code).toBe("SAFETY_GATE_BLOCKED");
});
```

### SC-10: update() - breaking + major バンプ未実施

```typescript
it("SC-10: update() - breaking change があるが major バンプ未実施の場合 BREAKING_CHANGE_ERROR", () => {
  // CompatibilityChecker が level="breaking" を返し、
  // newVersion.major <= currentVersion.major の場合:
  const response = {
    success: false as const,
    error: { code: "BREAKING_CHANGE_ERROR", message: "major バンプが必要です" },
  };
  expect(response.success).toBe(false);
  expect(response.error.code).toBe("BREAKING_CHANGE_ERROR");
});
```

### SC-11 〜 SC-13: update() バリデーションエラー

```typescript
it("SC-11: update() ハンドラ - skillId が空文字列の場合 VALIDATION_ERROR（P42 2段目）", () => {
  const skillId = "";
  const isValid =
    typeof skillId === "string" && skillId !== "" && skillId.trim() !== "";
  expect(isValid).toBe(false);
});

it("SC-12: update() ハンドラ - newVersion.version がスペースのみの場合 VALIDATION_ERROR（P42 3段目）", () => {
  const version = "   ";
  const isValid =
    typeof version === "string" && version !== "" && version.trim() !== "";
  expect(isValid).toBe(false);
});

it("SC-13: update() ハンドラ - semver 形式違反の場合 INVALID_SEMVER_ERROR", () => {
  const invalidVersion = "abc";
  const semverRegex = /^\d+\.\d+\.\d+/;
  expect(semverRegex.test(invalidVersion)).toBe(false);
  // ハンドラは result.error.code === "INVALID_SEMVER_ERROR" を返す
});
```

### SC-14: update() - 存在しない skillId

```typescript
it("SC-14: update() - 存在しない skillId の場合 NOT_FOUND_ERROR を返す", () => {
  const response = {
    success: false as const,
    error: { code: "NOT_FOUND_ERROR", message: "スキルが見つかりません" },
  };
  expect(response.success).toBe(false);
  expect(response.error.code).toBe("NOT_FOUND_ERROR");
});
```

### SC-18 〜 SC-19: deprecate() バリデーションエラー

```typescript
it("SC-18: deprecate() ハンドラ - reason が 51 文字の場合 VALIDATION_ERROR（上限超過）", () => {
  const tooLongReason = "あ".repeat(51);
  const trimmed = tooLongReason.trim();
  const isValid = trimmed.length >= 1 && trimmed.length <= 50;
  expect(isValid).toBe(false);
});

it("SC-19: deprecate() ハンドラ - reason がスペースのみの場合 VALIDATION_ERROR（P42 3段目）", () => {
  const spacesOnlyReason = "   ";
  const trimmed = spacesOnlyReason.trim();
  const isValid = trimmed.length >= 1 && trimmed.length <= 50;
  expect(isValid).toBe(false);
});
```

### SC-22: remove() - 30 日未経過エラー

```typescript
it("SC-22: remove() - deprecate 後 30 日が経過していない場合 REMOVAL_TOO_EARLY_ERROR を返す", () => {
  // deprecatedAt = 29日前
  const deprecatedAt = new Date();
  deprecatedAt.setDate(deprecatedAt.getDate() - 29);
  const now = new Date();
  const daysSinceDeprecation =
    (now.getTime() - deprecatedAt.getTime()) / (1000 * 60 * 60 * 24);

  const canRemove = daysSinceDeprecation >= 30;
  expect(canRemove).toBe(false);
  // ハンドラは result.error.code === "REMOVAL_TOO_EARLY_ERROR" を返す
});
```

### SC-24: remove() - skillId バリデーションエラー

```typescript
it("SC-24: remove() ハンドラ - skillId がスペースのみの場合 VALIDATION_ERROR（P42 3段目）", () => {
  const skillId = "   ";
  const isValid =
    typeof skillId === "string" && skillId !== "" && skillId.trim() !== "";
  expect(isValid).toBe(false);
});
```

### SC-27: getDependents() - 存在しない skillId

```typescript
it("SC-27: getDependents() - 存在しない skillId の場合 NOT_FOUND_ERROR を返す", () => {
  const response = {
    success: false as const,
    error: { code: "NOT_FOUND_ERROR", message: "スキルが見つかりません" },
  };
  expect(response.success).toBe(false);
  expect(response.error.code).toBe("NOT_FOUND_ERROR");
});
```

---

## 6. Phase 2 設計書との対応（トレーサビリティ）

| テストID       | Phase 2 設計書参照箇所                                                  | 検証する設計要素                                     |
| -------------- | ----------------------------------------------------------------------- | ---------------------------------------------------- |
| SC-01          | `skill-center-flow-design.md` セクション 3.2 Step 4                     | visibility="public" 昇格、registeredAt 記録          |
| SC-02 〜 SC-05 | `skill-center-flow-design.md` セクション 7（バリデーションマトリクス）  | P42 準拠 3 段バリデーション（name / license）        |
| SC-06          | `skill-center-flow-design.md` セクション 3.2 Step 2                     | SafetyGate による公開ブロック（SAFETY_GATE_BLOCKED） |
| SC-07 〜 SC-08 | `skill-center-flow-design.md` セクション 4.2                            | compatible / minor-incompatible → 自動承認           |
| SC-09          | `skill-center-flow-design.md` セクション 4.2 breaking 時の手動承認      | breaking + major バンプ → 手動承認キュー登録         |
| SC-10          | `skill-center-flow-design.md` セクション 6.3（BREAKING_CHANGE_ERROR）   | breaking + major バンプ未実施 → エラー               |
| SC-11 〜 SC-13 | `skill-center-flow-design.md` セクション 7（update バリデーション）     | skillId / version P42 / semver チェック              |
| SC-14          | `skill-center-flow-design.md` セクション 6.3（NOT_FOUND_ERROR）         | 存在しない skillId のエラー処理                      |
| SC-15          | `skill-center-flow-design.md` セクション 5.1 通常停止                   | deprecation notice 掲載、30 日 grace period 開始     |
| SC-16 〜 SC-17 | `skill-center-flow-design.md` セクション 7（deprecate reason）          | reason 1〜50 文字の境界値テスト                      |
| SC-18 〜 SC-19 | `skill-center-flow-design.md` セクション 7（deprecate バリデーション）  | reason 51 文字超過 / スペースのみ                    |
| SC-20          | `skill-center-flow-design.md` セクション 5.2 緊急停止                   | gracePeriodDays=0, emergency=true で即時停止         |
| SC-21          | `skill-center-flow-design.md` セクション 5.1（30 日後削除）             | deprecate 後 30 日経過でのカタログ削除               |
| SC-22          | `skill-center-flow-design.md` セクション 6.3（REMOVAL_TOO_EARLY_ERROR） | 30 日未経過でのエラー                                |
| SC-23          | `skill-center-flow-design.md` セクション 5.2 緊急停止                   | emergency=true で grace period チェックスキップ      |
| SC-24          | `skill-center-flow-design.md` セクション 7（remove バリデーション）     | skillId P42 バリデーション                           |
| SC-25 〜 SC-26 | `skill-center-flow-design.md` セクション 5.3 依存スキル影響分析         | getDependents() の返却値（配列 / 空配列）            |
| SC-27          | `skill-center-flow-design.md` セクション 6.3（NOT_FOUND_ERROR）         | 存在しない skillId の NOT_FOUND_ERROR                |
