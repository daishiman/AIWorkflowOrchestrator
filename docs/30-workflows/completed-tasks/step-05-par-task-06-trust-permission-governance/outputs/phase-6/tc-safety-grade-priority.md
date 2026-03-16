# TC-R-005: SafetyGrade 優先度全組合せテスト仕様

## メタ情報

| 項目                 | 値                                                       |
| -------------------- | -------------------------------------------------------- |
| テストID             | TC-R-005a〜g（7組合せ）                                  |
| カテゴリ             | ルールロジックテスト（TC-R）                             |
| 対象インターフェース | `SafetyGatePort.evaluate()`                              |
| 定義フェーズ         | Phase 6                                                  |
| 関連成果物           | Phase 5: `safety-gate-port.ts`, `safety-gate-service.ts` |

---

## 概要

`SafetyGatePort.evaluate()` が返す `SafetyGateResult` の `overallGrade` は、
適用された `SafetyCheckDetail[]` の個別 `grade` を以下の優先度ルールで集約する。

### SafetyGrade 優先度ルール

| 優先度    | 条件                                                       | overallGrade         |
| --------- | ---------------------------------------------------------- | -------------------- |
| 1（最高） | UNSAFE チェックが1件以上存在する                           | `UNSAFE`             |
| 2         | SAFE_WITH_WARNINGS チェックが1件以上存在する（UNSAFEなし） | `SAFE_WITH_WARNINGS` |
| 3（最低） | すべてのチェックが SAFE（またはチェック0件）               | `SAFE`               |

### 各チェックIDのデフォルトグレード

| SafetyCheckId            | grade                |
| ------------------------ | -------------------- |
| `CRITICAL_TOOL_REQUIRED` | `UNSAFE`             |
| `PROTECTED_PATH_ACCESS`  | `UNSAFE`             |
| `HIGH_TOOL_REQUIRED`     | `SAFE_WITH_WARNINGS` |
| `NO_PERMANENT_APPROVAL`  | `SAFE_WITH_WARNINGS` |
| `ALL_LOW_TOOLS`          | `SAFE`               |

### SafetyGateResult 型定義

```typescript
interface SafetyGateResult {
  overallGrade: SafetyGrade;
  checks: SafetyCheckDetail[];
  checkedAt: Date;
}

interface SafetyCheckDetail {
  checkId: SafetyCheckId;
  grade: SafetyGrade;
  message: string;
  affectedTools?: string[];
}

type SafetyGrade = "SAFE" | "SAFE_WITH_WARNINGS" | "UNSAFE";

type SafetyCheckId =
  | "CRITICAL_TOOL_REQUIRED"
  | "HIGH_TOOL_REQUIRED"
  | "NO_PERMANENT_APPROVAL"
  | "ALL_LOW_TOOLS"
  | "PROTECTED_PATH_ACCESS";
```

---

## テストケース一覧

| テストID  | 適用チェック組合せ                             | 期待 overallGrade    | 適用優先度ルール                                 |
| --------- | ---------------------------------------------- | -------------------- | ------------------------------------------------ |
| TC-R-005a | `CRITICAL_TOOL_REQUIRED` のみ                  | `UNSAFE`             | UNSAFE が1件 → UNSAFE                            |
| TC-R-005b | `CRITICAL_TOOL_REQUIRED` + `ALL_LOW_TOOLS`     | `UNSAFE`             | UNSAFE が SAFE に優先（矛盾組合せ）              |
| TC-R-005c | `HIGH_TOOL_REQUIRED` + `NO_PERMANENT_APPROVAL` | `SAFE_WITH_WARNINGS` | SAFE_WITH_WARNINGS 同士の統合                    |
| TC-R-005d | `ALL_LOW_TOOLS` + `NO_PERMANENT_APPROVAL`      | `SAFE_WITH_WARNINGS` | SAFE_WITH_WARNINGS が SAFE に優先                |
| TC-R-005e | `ALL_LOW_TOOLS` のみ                           | `SAFE`               | SAFE チェックのみ → SAFE                         |
| TC-R-005f | `PROTECTED_PATH_ACCESS` + `ALL_LOW_TOOLS`      | `UNSAFE`             | PROTECTED_PATH は UNSAFE（Low ツールでも上書き） |
| TC-R-005g | チェック対象ルールが0件                        | `SAFE`               | 空のチェックリスト → SAFE                        |

---

## TC-R-005a: CRITICAL_TOOL_REQUIRED 単独は UNSAFE

### Given

スキルが以下のツール構成を持つ:

```
tools: ["bash", "computer"]
```

- `bash` は `CRITICAL_TOOL_REQUIRED` チェックを発火するツール名として登録されている

### When

```typescript
const result = await safetyGatePort.evaluate({
  skillId: "skill-001",
  requestedTools: ["bash", "computer"],
  permissionContext: mockPermissionContext,
});
```

### Then

```typescript
expect(result.overallGrade).toBe("UNSAFE");
expect(result.checks).toHaveLength(1);
expect(result.checks[0].checkId).toBe("CRITICAL_TOOL_REQUIRED");
expect(result.checks[0].grade).toBe("UNSAFE");
expect(result.checks[0].affectedTools).toContain("bash");
expect(result.checkedAt).toBeInstanceOf(Date);
```

---

## TC-R-005b: CRITICAL_TOOL_REQUIRED + ALL_LOW_TOOLS（矛盾組合せも UNSAFE）

### Given

スキルが Critical ツールと Low ツールの両方を要求する:

```
tools: ["bash", "read_file"]
```

- `bash` → `CRITICAL_TOOL_REQUIRED`（UNSAFE）
- `read_file` → `ALL_LOW_TOOLS`（SAFE）

### When

```typescript
const result = await safetyGatePort.evaluate({
  skillId: "skill-002",
  requestedTools: ["bash", "read_file"],
  permissionContext: mockPermissionContext,
});
```

### Then

```typescript
expect(result.overallGrade).toBe("UNSAFE");
// checks は2件含まれる（UNSAFE + SAFE の両方）
expect(result.checks).toHaveLength(2);
const unsafeCheck = result.checks.find(
  (c) => c.checkId === "CRITICAL_TOOL_REQUIRED",
);
const safeCheck = result.checks.find((c) => c.checkId === "ALL_LOW_TOOLS");
expect(unsafeCheck).toBeDefined();
expect(unsafeCheck!.grade).toBe("UNSAFE");
expect(safeCheck).toBeDefined();
expect(safeCheck!.grade).toBe("SAFE");
// overallGrade は UNSAFE（SAFE チェックが存在しても上書き不可）
expect(result.overallGrade).toBe("UNSAFE");
```

---

## TC-R-005c: HIGH_TOOL_REQUIRED + NO_PERMANENT_APPROVAL（SAFE_WITH_WARNINGS 同士）

### Given

スキルが High リスクツールを要求し、かつ永続承認が設定されていない:

```
tools: ["write_file"]
permissionConfig.allowPermanent = false
```

- `write_file` → `HIGH_TOOL_REQUIRED`（SAFE_WITH_WARNINGS）
- 永続承認なし → `NO_PERMANENT_APPROVAL`（SAFE_WITH_WARNINGS）

### When

```typescript
const result = await safetyGatePort.evaluate({
  skillId: "skill-003",
  requestedTools: ["write_file"],
  permissionContext: {
    ...mockPermissionContext,
    allowPermanent: false,
  },
});
```

### Then

```typescript
expect(result.overallGrade).toBe("SAFE_WITH_WARNINGS");
expect(result.checks).toHaveLength(2);
const highCheck = result.checks.find((c) => c.checkId === "HIGH_TOOL_REQUIRED");
const noPermanentCheck = result.checks.find(
  (c) => c.checkId === "NO_PERMANENT_APPROVAL",
);
expect(highCheck!.grade).toBe("SAFE_WITH_WARNINGS");
expect(noPermanentCheck!.grade).toBe("SAFE_WITH_WARNINGS");
// UNSAFE チェックなし → SAFE_WITH_WARNINGS が最高
expect(result.overallGrade).toBe("SAFE_WITH_WARNINGS");
```

---

## TC-R-005d: ALL_LOW_TOOLS + NO_PERMANENT_APPROVAL（SAFE_WITH_WARNINGS が SAFE に優先）

### Given

スキルが Low ツールのみを要求するが、永続承認が設定されていない:

```
tools: ["read_file"]
permissionConfig.allowPermanent = false
```

- `read_file` → `ALL_LOW_TOOLS`（SAFE）
- 永続承認なし → `NO_PERMANENT_APPROVAL`（SAFE_WITH_WARNINGS）

### When

```typescript
const result = await safetyGatePort.evaluate({
  skillId: "skill-004",
  requestedTools: ["read_file"],
  permissionContext: {
    ...mockPermissionContext,
    allowPermanent: false,
  },
});
```

### Then

```typescript
expect(result.overallGrade).toBe("SAFE_WITH_WARNINGS");
expect(result.checks).toHaveLength(2);
const lowCheck = result.checks.find((c) => c.checkId === "ALL_LOW_TOOLS");
const noPermanentCheck = result.checks.find(
  (c) => c.checkId === "NO_PERMANENT_APPROVAL",
);
expect(lowCheck!.grade).toBe("SAFE");
expect(noPermanentCheck!.grade).toBe("SAFE_WITH_WARNINGS");
// SAFE_WITH_WARNINGS が SAFE より優先
expect(result.overallGrade).toBe("SAFE_WITH_WARNINGS");
```

---

## TC-R-005e: ALL_LOW_TOOLS のみ → SAFE

### Given

スキルが Low リスクツールのみを要求し、永続承認も設定済み:

```
tools: ["read_file", "list_directory"]
permissionConfig.allowPermanent = true
```

- 全ツール → `ALL_LOW_TOOLS`（SAFE）

### When

```typescript
const result = await safetyGatePort.evaluate({
  skillId: "skill-005",
  requestedTools: ["read_file", "list_directory"],
  permissionContext: {
    ...mockPermissionContext,
    allowPermanent: true,
  },
});
```

### Then

```typescript
expect(result.overallGrade).toBe("SAFE");
expect(result.checks).toHaveLength(1);
expect(result.checks[0].checkId).toBe("ALL_LOW_TOOLS");
expect(result.checks[0].grade).toBe("SAFE");
// UNSAFE も SAFE_WITH_WARNINGS もなし → SAFE
expect(result.overallGrade).toBe("SAFE");
```

---

## TC-R-005f: PROTECTED_PATH_ACCESS + ALL_LOW_TOOLS（Protected Path は Low でも UNSAFE）

### Given

スキルが Low ツールを使って保護パスにアクセスしようとする:

```
tools: ["read_file"]
requestedPaths: ["/etc/passwd", "/System/Library"]
```

- `read_file` 自体は Low ツール → `ALL_LOW_TOOLS`（SAFE）
- 保護パスへのアクセス → `PROTECTED_PATH_ACCESS`（UNSAFE）

### When

```typescript
const result = await safetyGatePort.evaluate({
  skillId: "skill-006",
  requestedTools: ["read_file"],
  requestedPaths: ["/etc/passwd", "/System/Library"],
  permissionContext: mockPermissionContext,
});
```

### Then

```typescript
expect(result.overallGrade).toBe("UNSAFE");
expect(result.checks).toHaveLength(2);
const protectedCheck = result.checks.find(
  (c) => c.checkId === "PROTECTED_PATH_ACCESS",
);
const lowCheck = result.checks.find((c) => c.checkId === "ALL_LOW_TOOLS");
expect(protectedCheck!.grade).toBe("UNSAFE");
expect(protectedCheck!.affectedTools).toBeDefined();
expect(lowCheck!.grade).toBe("SAFE");
// ツールが Low でも、保護パスアクセスは UNSAFE
expect(result.overallGrade).toBe("UNSAFE");
```

---

## TC-R-005g: チェック対象ルールが0件（ツール要求なし）→ SAFE

### Given

スキルがツール要求を一切持たない（ツール不要スキル）:

```
tools: []
requestedPaths: []
```

### When

```typescript
const result = await safetyGatePort.evaluate({
  skillId: "skill-007",
  requestedTools: [],
  permissionContext: mockPermissionContext,
});
```

### Then

```typescript
expect(result.overallGrade).toBe("SAFE");
// チェックが空配列
expect(result.checks).toHaveLength(0);
// 空のチェックは SAFE として扱う（デフォルト安全）
expect(result.overallGrade).toBe("SAFE");
expect(result.checkedAt).toBeInstanceOf(Date);
```

---

## 補足: overallGrade 集約ロジック参照実装

```typescript
function aggregateGrade(checks: SafetyCheckDetail[]): SafetyGrade {
  if (checks.length === 0) return "SAFE";
  if (checks.some((c) => c.grade === "UNSAFE")) return "UNSAFE";
  if (checks.some((c) => c.grade === "SAFE_WITH_WARNINGS"))
    return "SAFE_WITH_WARNINGS";
  return "SAFE";
}
```

この集約ロジックに対して TC-R-005a〜g の7組合せすべてがカバーされていることを確認する。
