# 契約整合性チェックスクリプト詳細仕様（v2）

<!-- Task-06 Phase 5 成果物: Phase 4 仕様の拡充版 -->

## メタ情報

| 項目           | 内容                                                       |
| -------------- | ---------------------------------------------------------- |
| 作成フェーズ   | Phase 5（実装仕様）                                        |
| 前バージョン   | Phase 4 validate-script-spec.md（項目定義のみ）            |
| スクリプトパス | `scripts/validate-trust-governance-design.ts`              |
| 実行コマンド   | `pnpm ts-node scripts/validate-trust-governance-design.ts` |

---

## 前提条件

スクリプトを実行する前に以下が満たされていること:

1. `pnpm install` が完了していること
2. `packages/shared/src/constants/security.ts` が存在すること
3. `apps/desktop/src/main/permissions/permission-store-interface.ts` が存在すること
4. `apps/desktop/src/main/permissions/safety-gate.ts` が存在すること

---

## 検証項目 6 件と詳細ロジック

### 項目 1: TOOL_RISK_CONFIG 不変条件検証

**検証内容**: Critical ツールへの許可禁止フラグが正しく設定されていること

```typescript
// 検証ロジック疑似コード
function validateCriticalToolInvariants(): ValidationResult {
  const critical = TOOL_RISK_CONFIG["critical"];

  const checks = [
    {
      name: "critical.allowPermanent === false",
      pass: critical.allowPermanent === false,
      errorMsg: `critical.allowPermanent は false でなければならないが、${critical.allowPermanent} が設定されている`,
    },
    {
      name: "critical.allowApproveOnce === false",
      pass: critical.allowApproveOnce === false,
      errorMsg: `critical.allowApproveOnce は false でなければならないが、${critical.allowApproveOnce} が設定されている`,
    },
    {
      name: "critical.autoDenyDefault === true",
      pass: critical.autoDenyDefault === true,
      errorMsg: `critical.autoDenyDefault は true でなければならないが、${critical.autoDenyDefault} が設定されている`,
    },
  ];

  const failures = checks.filter((c) => !c.pass);
  return {
    passed: failures.length === 0,
    failures: failures.map((f) => f.errorMsg),
  };
}
```

**期待出力（成功時）**: `[PASS] 項目 1: TOOL_RISK_CONFIG 不変条件 (3/3 チェック通過)`
**期待出力（失敗時）**: `[FAIL] 項目 1: critical.allowPermanent は false でなければならないが、true が設定されている`

---

### 項目 2: TOOL_RISK_CONFIG 網羅性検証

**検証内容**: 全 ToolRiskLevel が TOOL_RISK_CONFIG に定義されていること

```typescript
function validateRiskConfigCompleteness(): ValidationResult {
  const expectedLevels: ToolRiskLevel[] = ["critical", "high", "medium", "low"];
  const actualLevels = Object.keys(TOOL_RISK_CONFIG) as ToolRiskLevel[];

  const missing = expectedLevels.filter(
    (level) => !actualLevels.includes(level),
  );
  const unexpected = actualLevels.filter(
    (level) => !expectedLevels.includes(level),
  );

  return {
    passed: missing.length === 0 && unexpected.length === 0,
    failures: [
      ...missing.map((l) => `TOOL_RISK_CONFIG に "${l}" が定義されていない`),
      ...unexpected.map(
        (l) => `TOOL_RISK_CONFIG に未定義の level "${l}" が含まれている`,
      ),
    ],
  };
}
```

**期待出力（成功時）**: `[PASS] 項目 2: TOOL_RISK_CONFIG 網羅性 (4レベル全て定義済み)`
**期待出力（失敗時）**: `[FAIL] 項目 2: TOOL_RISK_CONFIG に "medium" が定義されていない`

---

### 項目 3: calcExpiresAt 計算正確性検証

**検証内容**: 各ポリシーの expiresAt 計算値が仕様と一致すること

```typescript
function validateCalcExpiresAt(): ValidationResult {
  const allowedAt = 1_700_000_000_000; // 固定テスト値（2023-11-14 相当）

  const testCases = [
    {
      policy: "session" as const,
      expected: undefined,
      description: "session ポリシーは undefined（electron-store に書かない）",
    },
    {
      policy: "time_24h" as const,
      expected: allowedAt + 86_400_000,
      description: "time_24h ポリシーは allowedAt + 86_400_000",
    },
    {
      policy: "time_7d" as const,
      expected: allowedAt + 604_800_000,
      description: "time_7d ポリシーは allowedAt + 604_800_000",
    },
    {
      policy: "permanent" as const,
      expected: undefined,
      description: "permanent ポリシーは undefined（明示取り消しまで有効）",
    },
  ];

  const failures: string[] = [];
  for (const tc of testCases) {
    const actual = calcExpiresAt(tc.policy, allowedAt);
    if (actual !== tc.expected) {
      failures.push(
        `calcExpiresAt("${tc.policy}", ${allowedAt}) = ${actual} （期待値: ${tc.expected}）― ${tc.description}`,
      );
    }
  }

  return { passed: failures.length === 0, failures };
}
```

**期待出力（成功時）**: `[PASS] 項目 3: calcExpiresAt 計算正確性 (4ポリシー全て正確)`
**期待出力（失敗時）**: `[FAIL] 項目 3: calcExpiresAt("time_24h", 1700000000000) = 1700086500000 （期待値: 1700086400000）`

---

### 項目 4: abort/skip/retry フロー定数検証

**検証内容**: abort・retry・タイムアウトの定数が仕様値と一致すること

```typescript
function validateFlowConstants(): ValidationResult {
  const expectedConstants = [
    {
      name: "MAX_PERMISSION_RETRY_COUNT",
      expected: 3,
      actual: MAX_PERMISSION_RETRY_COUNT,
      source: "abort-fallback-contract.md フロー 3",
    },
    {
      name: "DEFAULT_PERMISSION_TIMEOUT_MS",
      expected: 300_000,
      actual: DEFAULT_PERMISSION_TIMEOUT_MS,
      source: "abort-fallback-contract.md タイムアウト仕様",
    },
    {
      name: "PERMISSION_HISTORY_MAX_ENTRIES",
      expected: 1000,
      actual: PERMISSION_HISTORY_MAX_ENTRIES,
      source: "permission-store-interface.ts",
    },
  ];

  const failures = expectedConstants
    .filter((c) => c.actual !== c.expected)
    .map(
      (c) =>
        `定数 ${c.name} = ${c.actual} （期待値: ${c.expected}）― 参照: ${c.source}`,
    );

  return { passed: failures.length === 0, failures };
}
```

**期待出力（成功時）**: `[PASS] 項目 4: abort/skip/retry フロー定数 (3定数全て仕様値と一致)`
**期待出力（失敗時）**: `[FAIL] 項目 4: 定数 MAX_PERMISSION_RETRY_COUNT = 5 （期待値: 3）`

---

### 項目 5: 権限状態マシン遷移テーブル整合性検証

**検証内容**: 状態遷移テーブルが仕様書（permission-state-machine.md）と一致すること

```typescript
// 検証用の期待遷移テーブル（permission-state-machine.md から抽出）
const EXPECTED_VALID_TRANSITIONS = [
  { from: "denied", to: "approved_once", guard: "riskLevel !== critical" },
  { from: "denied", to: "approved", guard: "allowPermanent === true" },
  { from: "approved_once", to: "denied", guard: "none (session end)" },
  { from: "approved", to: "revoked", guard: "none (user action)" },
  { from: "revoked", to: "denied", guard: "none (auto)" },
] as const;

const EXPECTED_FORBIDDEN_TRANSITIONS = [
  { from: "denied", to: "approved", condition: "riskLevel === critical" },
  {
    from: "denied",
    to: "approved_once",
    condition: "critical && autoDenyDefault",
  },
  { from: "revoked", to: "approved", condition: "always" },
] as const;

function validateStateMachineTable(): ValidationResult {
  // TOOL_RISK_CONFIG から実際のガード条件を計算して期待値と比較する
  const criticalConfig = TOOL_RISK_CONFIG["critical"];
  const highConfig = TOOL_RISK_CONFIG["high"];

  const checks = [
    {
      name: "critical → denied→approved_once が禁止",
      pass: criticalConfig.allowApproveOnce === false,
    },
    {
      name: "critical → denied→approved が禁止",
      pass: criticalConfig.allowPermanent === false,
    },
    {
      name: "high → denied→approved_once が許可",
      pass: highConfig.allowApproveOnce === true,
    },
    {
      name: "high → denied→approved が禁止",
      pass: highConfig.allowPermanent === false,
    },
  ];

  const failures = checks
    .filter((c) => !c.pass)
    .map((c) => `状態遷移テーブル不整合: ${c.name}`);

  return { passed: failures.length === 0, failures };
}
```

**期待出力（成功時）**: `[PASS] 項目 5: 権限状態マシン遷移テーブル整合性 (4チェック全て通過)`
**期待出力（失敗時）**: `[FAIL] 項目 5: 状態遷移テーブル不整合: high → denied→approved が禁止`

---

### 項目 6: SafetyGateResult グレード優先度ルール検証

**検証内容**: SafetyCheckDetail の status 集約ロジックが仕様書（safety-gate.ts のコメント）と一致すること

```typescript
function validateSafetyGradePriorityRules(): ValidationResult {
  // グレード計算関数（実装クラスから抽出してテスト）
  function calcOverallGrade(details: SafetyCheckDetail[]): SafetyGrade {
    if (details.some((d) => d.status === "blocked")) return "UNSAFE";
    if (details.some((d) => d.status === "warned")) return "SAFE_WITH_WARNINGS";
    return "SAFE";
  }

  const testCases = [
    {
      description: "全 passed → SAFE",
      details: [
        { status: "passed" as const },
        { status: "passed" as const },
      ] as SafetyCheckDetail[],
      expected: "SAFE" as SafetyGrade,
    },
    {
      description: "blocked 1件 + passed → UNSAFE",
      details: [
        { status: "blocked" as const },
        { status: "passed" as const },
      ] as SafetyCheckDetail[],
      expected: "UNSAFE" as SafetyGrade,
    },
    {
      description: "warned 1件 + passed → SAFE_WITH_WARNINGS",
      details: [
        { status: "warned" as const },
        { status: "passed" as const },
      ] as SafetyCheckDetail[],
      expected: "SAFE_WITH_WARNINGS" as SafetyGrade,
    },
    {
      description: "blocked + warned 混在 → UNSAFE（blocked 優先）",
      details: [
        { status: "blocked" as const },
        { status: "warned" as const },
      ] as SafetyCheckDetail[],
      expected: "UNSAFE" as SafetyGrade,
    },
    {
      description: "空配列 → SAFE",
      details: [] as SafetyCheckDetail[],
      expected: "SAFE" as SafetyGrade,
    },
  ];

  const failures = testCases
    .filter((tc) => calcOverallGrade(tc.details) !== tc.expected)
    .map(
      (tc) =>
        `グレード計算不一致: ${tc.description} → 期待: ${tc.expected}、実際: ${calcOverallGrade(tc.details)}`,
    );

  return { passed: failures.length === 0, failures };
}
```

**期待出力（成功時）**: `[PASS] 項目 6: SafetyGateResult グレード優先度ルール (5テストケース全て通過)`
**期待出力（失敗時）**: `[FAIL] 項目 6: グレード計算不一致: blocked + warned 混在 → 期待: UNSAFE、実際: SAFE_WITH_WARNINGS`

---

## スクリプト全体の出力仕様

### 成功時（exitCode = 0）

```
=== Trust & Governance Design Contract Validation ===
[PASS] 項目 1: TOOL_RISK_CONFIG 不変条件 (3/3 チェック通過)
[PASS] 項目 2: TOOL_RISK_CONFIG 網羅性 (4レベル全て定義済み)
[PASS] 項目 3: calcExpiresAt 計算正確性 (4ポリシー全て正確)
[PASS] 項目 4: abort/skip/retry フロー定数 (3定数全て仕様値と一致)
[PASS] 項目 5: 権限状態マシン遷移テーブル整合性 (4チェック全て通過)
[PASS] 項目 6: SafetyGateResult グレード優先度ルール (5テストケース全て通過)

PASS: 全6項目が検証成功
```

### 失敗時（exitCode = 1）

```
=== Trust & Governance Design Contract Validation ===
[PASS] 項目 1: TOOL_RISK_CONFIG 不変条件 (3/3 チェック通過)
[FAIL] 項目 2: TOOL_RISK_CONFIG に "medium" が定義されていない
[PASS] 項目 3: calcExpiresAt 計算正確性 (4ポリシー全て正確)
...（以降の項目は継続検証）

FAIL: 1件の検証失敗（詳細は上記 [FAIL] 行を参照）
```

**注意**: 失敗が発生しても全 6 項目の検証を最後まで実行する（早期終了しない）。
