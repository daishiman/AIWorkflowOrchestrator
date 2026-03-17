# 公開可否判定ロジック テスト仕様書

## メタ情報

| 項目         | 内容                                                             |
| ------------ | ---------------------------------------------------------------- |
| バージョン   | 2.0.0                                                            |
| 作成日       | 2026-03-17                                                       |
| 対象         | PublishReadinessChecker                                          |
| 依存設計書   | `outputs/phase-2/publish-readiness-design.md`                    |
| テストID形式 | PR-01〜PR-12（判定パス網羅）、PR-V-01〜PR-V-04（バリデーション） |

---

## 1. 概要

PublishReadinessChecker の `checkPublishReadiness(input, metrics)` メソッドに対するテスト仕様。

### 1.1 判定ステータス

| ステータス                   | 意味                             |
| ---------------------------- | -------------------------------- |
| `"auto-approved"`            | 安全に自動公開可                 |
| `"review-required"`          | レビュー後に公開可               |
| `"manual-approval-required"` | 手動承認が必要                   |
| `"blocked"`                  | 公開不可（Gate拒否 or Critical） |

### 1.2 判定優先度（上から順に評価）

1. `gateStatus === "rejected"` → `"blocked"`
2. `riskLevel === "critical"` → `"blocked"`
3. `riskLevel === "high"` → `"manual-approval-required"`
4. `riskLevel === "medium"` かつ metrics 条件 → `"review-required"` or `"manual-approval-required"`
5. `riskLevel === "low"` かつ metrics 条件 → `"auto-approved"` or `"review-required"`

---

## 2. テストケース一覧

### 2.1 判定パス網羅テスト（PR-01〜PR-12）

| ID    | テスト名                                                               | SafetyGateInput  | ObservabilityMetrics | 期待ステータス               |
| ----- | ---------------------------------------------------------------------- | ---------------- | -------------------- | ---------------------------- |
| PR-01 | gateStatus=rejected → blocked（riskLevel問わず）                       | モックD          | モックX              | `"blocked"`                  |
| PR-02 | riskLevel=critical + gateStatus=approved → blocked                     | criticalApproved | モックX              | `"blocked"`                  |
| PR-03 | riskLevel=high + metrics良好 → manual-approval-required                | モックC          | モックX              | `"manual-approval-required"` |
| PR-04 | riskLevel=high + metrics不良 → manual-approval-required                | モックC          | モックZ              | `"manual-approval-required"` |
| PR-05 | riskLevel=medium + successRate高 + trend良 + score高 → review-required | モックB          | モックX              | `"review-required"`          |
| PR-06 | riskLevel=medium + successRate低 → manual-approval-required            | モックB          | モックZ              | `"manual-approval-required"` |
| PR-07 | riskLevel=medium + feedbackScore低（<3.5）→ manual-approval-required   | モックB          | モックW              | `"manual-approval-required"` |
| PR-08 | riskLevel=medium + 境界値メトリクス（sr=85, score=3.5）                | モックB          | モックY              | `"review-required"`          |
| PR-09 | riskLevel=low + successRate高 + trend良 + score高 → auto-approved      | モックA          | モックX              | `"auto-approved"`            |
| PR-10 | riskLevel=low + successRate低（<90）→ review-required                  | モックA          | モックZ              | `"review-required"`          |
| PR-11 | riskLevel=low + feedbackScore低（<3.0）→ review-required               | モックA          | モックW              | `"review-required"`          |
| PR-12 | riskLevel=low + qualityTrend=declining → review-required               | モックA          | モックZ              | `"review-required"`          |

### 2.2 バリデーションテスト（PR-V-01〜PR-V-04）

| ID      | テスト名                               | 入力                | 期待エラーコード     |
| ------- | -------------------------------------- | ------------------- | -------------------- |
| PR-V-01 | input が null → バリデーションエラー   | `input: null`       | `"VALIDATION_ERROR"` |
| PR-V-02 | metrics が null → バリデーションエラー | `metrics: null`     | `"VALIDATION_ERROR"` |
| PR-V-03 | successRate が範囲外（101）            | `successRate: 101`  | `"VALIDATION_ERROR"` |
| PR-V-04 | feedbackScore が範囲外（-1）           | `feedbackScore: -1` | `"VALIDATION_ERROR"` |

---

## 3. モックデータ定義

### 3.1 Task06 SafetyGateInput モック（モックA〜D）

```typescript
import type { SafetyGateInput } from "../types/publish-readiness";

/**
 * モックA: リスク低・承認済み・スキャン正常・警告なし
 * 使用: PR-09, PR-10, PR-11, PR-12
 */
export const mockSafetyGateA: SafetyGateInput = {
  riskLevel: "low",
  gateStatus: "approved",
  securityScan: {
    passed: true,
    criticals: 0,
    warnings: 0,
  },
};

/**
 * モックB: リスク中・承認済み・スキャン正常・軽微な警告
 * 使用: PR-05, PR-06, PR-07, PR-08
 */
export const mockSafetyGateB: SafetyGateInput = {
  riskLevel: "medium",
  gateStatus: "approved",
  securityScan: {
    passed: true,
    criticals: 0,
    warnings: 2,
  },
};

/**
 * モックC: リスク高・承認済み・スキャン正常・警告あり
 * 使用: PR-03, PR-04
 */
export const mockSafetyGateC: SafetyGateInput = {
  riskLevel: "high",
  gateStatus: "approved",
  securityScan: {
    passed: true,
    criticals: 0,
    warnings: 5,
  },
};

/**
 * モックD: リスク最高・Gate拒否・スキャン失敗・クリティカル多数
 * 使用: PR-01
 * 注意: gateStatus="rejected" が最優先で "blocked" を返す
 */
export const mockSafetyGateD: SafetyGateInput = {
  riskLevel: "critical",
  gateStatus: "rejected",
  securityScan: {
    passed: false,
    criticals: 3,
    warnings: 10,
  },
};

/**
 * PR-02 専用: riskLevel=critical かつ gateStatus=approved
 * gateStatus が "approved" でも riskLevel="critical" なら blocked
 */
export const mockSafetyGateCriticalApproved: SafetyGateInput = {
  riskLevel: "critical",
  gateStatus: "approved",
  securityScan: {
    passed: false,
    criticals: 3,
    warnings: 10,
  },
};
```

### 3.2 Task07 ObservabilityMetrics モック（モックX〜W）

```typescript
import type { ObservabilityMetrics } from "../types/publish-readiness";

/**
 * モックX: 最良指標（successRate=95, improving, feedbackScore=4.5）
 * 使用: PR-01, PR-02, PR-03, PR-05, PR-09
 */
export const mockMetricsX: ObservabilityMetrics = {
  successRate: 95,
  qualityTrend: "improving",
  feedbackScore: 4.5,
};

/**
 * モックY: 良好指標（successRate=85, stable, feedbackScore=3.5）
 * 使用: PR-08（medium + 境界値 → review-required）
 * successRate=85 は medium 閾値（80）を超える
 * feedbackScore=3.5 は medium 閾値（3.5）ちょうど（境界値）
 */
export const mockMetricsY: ObservabilityMetrics = {
  successRate: 85,
  qualityTrend: "stable",
  feedbackScore: 3.5,
};

/**
 * モックZ: 不良指標（successRate=70, declining, feedbackScore=2.0）
 * 使用: PR-04, PR-06, PR-10, PR-12
 * successRate=70 は low 閾値（90）・medium 閾値（80）を共に下回る
 */
export const mockMetricsZ: ObservabilityMetrics = {
  successRate: 70,
  qualityTrend: "declining",
  feedbackScore: 2.0,
};

/**
 * モックW: 最悪指標（successRate=50, declining, feedbackScore=0）
 * 使用: PR-07, PR-11
 * feedbackScore=0 は low 閾値（3.0）を大幅に下回る
 */
export const mockMetricsW: ObservabilityMetrics = {
  successRate: 50,
  qualityTrend: "declining",
  feedbackScore: 0,
};
```

### 3.3 無効入力モック（バリデーションテスト用）

```typescript
/** PR-V-03: successRate 範囲外（>100） */
export const mockMetricsOutOfRangeHigh: ObservabilityMetrics = {
  successRate: 101,
  qualityTrend: "stable",
  feedbackScore: 3.0,
};

/** PR-V-04: feedbackScore 範囲外（負値） */
export const mockMetricsOutOfRangeNegative: ObservabilityMetrics = {
  successRate: 80,
  qualityTrend: "stable",
  feedbackScore: -1,
};
```

---

## 4. 正常系テスト詳細

### PR-01: gateStatus=rejected → blocked（riskLevel問わず）

**目的**: Gate拒否はすべての条件に優先して `"blocked"` を返す

```typescript
it("PR-01: gateStatus=rejected は最高優先で blocked を返す", () => {
  // Arrange
  const input = mockSafetyGateD; // riskLevel="critical", gateStatus="rejected"
  const metrics = mockMetricsX; // 最良メトリクスでも関係ない

  // Act
  const result = checker.checkPublishReadiness(input, metrics);

  // Assert
  expect(result.success).toBe(true);
  expect(result.data.status).toBe("blocked");
  expect(result.data.reason).toContain("gate");
});
```

**検証条件**:

- `result.success === true`
- `result.data.status === "blocked"`
- `result.data.reason` に Gate 拒否を示す文字列が含まれること

---

### PR-02: riskLevel=critical + gateStatus=approved → blocked

**目的**: Gate承認済みでも critical リスクなら `"blocked"` を返す

```typescript
it("PR-02: riskLevel=critical は gateStatus=approved でも blocked を返す", () => {
  // Arrange
  const input = mockSafetyGateCriticalApproved;
  const metrics = mockMetricsX;

  // Act
  const result = checker.checkPublishReadiness(input, metrics);

  // Assert
  expect(result.success).toBe(true);
  expect(result.data.status).toBe("blocked");
  expect(result.data.reason).toContain("critical");
});
```

**検証条件**:

- `result.data.status === "blocked"`
- `result.data.reason` に `"critical"` が含まれること

---

### PR-03: riskLevel=high + metrics良好 → manual-approval-required

**目的**: high リスクはメトリクスに関わらず `"manual-approval-required"`

```typescript
it("PR-03: riskLevel=high はメトリクス良好でも manual-approval-required", () => {
  // Arrange
  const input = mockSafetyGateC; // riskLevel="high", approved
  const metrics = mockMetricsX; // 最良メトリクス

  // Act
  const result = checker.checkPublishReadiness(input, metrics);

  // Assert
  expect(result.success).toBe(true);
  expect(result.data.status).toBe("manual-approval-required");
});
```

---

### PR-04: riskLevel=high + metrics不良 → manual-approval-required

**目的**: high リスクはメトリクス不良でも同じく `"manual-approval-required"`

```typescript
it("PR-04: riskLevel=high はメトリクス不良でも manual-approval-required", () => {
  // Arrange
  const input = mockSafetyGateC;
  const metrics = mockMetricsZ; // 不良メトリクス

  // Act
  const result = checker.checkPublishReadiness(input, metrics);

  // Assert
  expect(result.success).toBe(true);
  expect(result.data.status).toBe("manual-approval-required");
});
```

---

### PR-05: riskLevel=medium + 良好メトリクス → review-required

**目的**: medium リスクで metrics が閾値を超えると `"review-required"`

```typescript
it("PR-05: riskLevel=medium + 良好メトリクス → review-required", () => {
  // Arrange
  const input = mockSafetyGateB; // riskLevel="medium"
  const metrics = mockMetricsX; // successRate=95, improving, score=4.5

  // Act
  const result = checker.checkPublishReadiness(input, metrics);

  // Assert
  expect(result.success).toBe(true);
  expect(result.data.status).toBe("review-required");
});
```

**検証条件**:

- `successRate >= 80` かつ `feedbackScore >= 3.5` で `"review-required"`

---

### PR-06: riskLevel=medium + successRate低 → manual-approval-required

**目的**: medium で successRate が閾値（80）を下回ると `"manual-approval-required"`

```typescript
it("PR-06: riskLevel=medium + successRate=70（<80）→ manual-approval-required", () => {
  // Arrange
  const input = mockSafetyGateB;
  const metrics = mockMetricsZ; // successRate=70

  // Act
  const result = checker.checkPublishReadiness(input, metrics);

  // Assert
  expect(result.success).toBe(true);
  expect(result.data.status).toBe("manual-approval-required");
});
```

---

### PR-07: riskLevel=medium + feedbackScore低 → manual-approval-required

**目的**: medium で feedbackScore が 3.5 未満なら `"manual-approval-required"`

```typescript
it("PR-07: riskLevel=medium + feedbackScore=0（<3.5）→ manual-approval-required", () => {
  // Arrange
  const input = mockSafetyGateB;
  const metrics = mockMetricsW; // feedbackScore=0

  // Act
  const result = checker.checkPublishReadiness(input, metrics);

  // Assert
  expect(result.success).toBe(true);
  expect(result.data.status).toBe("manual-approval-required");
});
```

---

### PR-08: riskLevel=medium + 境界値メトリクス → review-required

**目的**: medium で successRate=85（>=80）かつ feedbackScore=3.5（>=3.5 境界値）

```typescript
it("PR-08: riskLevel=medium + successRate=85, feedbackScore=3.5 境界値 → review-required", () => {
  // Arrange
  const input = mockSafetyGateB;
  const metrics = mockMetricsY; // successRate=85, stable, feedbackScore=3.5

  // Act
  const result = checker.checkPublishReadiness(input, metrics);

  // Assert
  expect(result.success).toBe(true);
  expect(result.data.status).toBe("review-required");
});
```

**検証条件**:

- feedbackScore が閾値ちょうどの 3.5 でも `"review-required"` になること（`>=` 判定）

---

### PR-09: riskLevel=low + 良好メトリクス → auto-approved

**目的**: low リスクで全メトリクスが閾値を超えると自動承認

```typescript
it("PR-09: riskLevel=low + 最良メトリクス → auto-approved", () => {
  // Arrange
  const input = mockSafetyGateA; // riskLevel="low"
  const metrics = mockMetricsX; // successRate=95, improving, score=4.5

  // Act
  const result = checker.checkPublishReadiness(input, metrics);

  // Assert
  expect(result.success).toBe(true);
  expect(result.data.status).toBe("auto-approved");
});
```

**検証条件**:

- `successRate >= 90` かつ `feedbackScore >= 3.0` かつ `qualityTrend !== "declining"` で `"auto-approved"`

---

### PR-10: riskLevel=low + successRate低 → review-required

**目的**: low でも successRate が 90 未満なら `"review-required"`

```typescript
it("PR-10: riskLevel=low + successRate=70（<90）→ review-required", () => {
  // Arrange
  const input = mockSafetyGateA;
  const metrics = mockMetricsZ; // successRate=70

  // Act
  const result = checker.checkPublishReadiness(input, metrics);

  // Assert
  expect(result.success).toBe(true);
  expect(result.data.status).toBe("review-required");
});
```

---

### PR-11: riskLevel=low + feedbackScore低 → review-required

**目的**: low で feedbackScore が 3.0 未満なら `"review-required"`

```typescript
it("PR-11: riskLevel=low + feedbackScore=0（<3.0）→ review-required", () => {
  // Arrange
  const input = mockSafetyGateA;
  const metrics = mockMetricsW; // feedbackScore=0

  // Act
  const result = checker.checkPublishReadiness(input, metrics);

  // Assert
  expect(result.success).toBe(true);
  expect(result.data.status).toBe("review-required");
});
```

---

### PR-12: riskLevel=low + qualityTrend=declining → review-required

**目的**: low で qualityTrend が declining なら `"review-required"`

```typescript
it("PR-12: riskLevel=low + qualityTrend=declining → review-required", () => {
  // Arrange
  const input = mockSafetyGateA;
  const metrics = mockMetricsZ; // declining

  // Act
  const result = checker.checkPublishReadiness(input, metrics);

  // Assert
  expect(result.success).toBe(true);
  expect(result.data.status).toBe("review-required");
});
```

---

## 5. 異常系テスト詳細

### PR-V-01: input が null → バリデーションエラー

```typescript
it("PR-V-01: input=null → VALIDATION_ERROR", () => {
  // Act
  // P60準拠: エラーアサーションは result.error.code（result.code ではない）
  const result = checker.checkPublishReadiness(
    null as unknown as SafetyGateInput,
    mockMetricsX,
  );

  // Assert
  expect(result.success).toBe(false);
  expect(result.error.code).toBe("VALIDATION_ERROR");
  expect(result.error.message).toContain("input");
});
```

---

### PR-V-02: metrics が null → バリデーションエラー

```typescript
it("PR-V-02: metrics=null → VALIDATION_ERROR", () => {
  // Act
  const result = checker.checkPublishReadiness(
    mockSafetyGateA,
    null as unknown as ObservabilityMetrics,
  );

  // Assert
  expect(result.success).toBe(false);
  expect(result.error.code).toBe("VALIDATION_ERROR");
  expect(result.error.message).toContain("metrics");
});
```

---

### PR-V-03: successRate が 101（範囲外）

```typescript
it("PR-V-03: successRate=101（>100）→ VALIDATION_ERROR", () => {
  // Act
  const result = checker.checkPublishReadiness(
    mockSafetyGateA,
    mockMetricsOutOfRangeHigh,
  );

  // Assert
  expect(result.success).toBe(false);
  expect(result.error.code).toBe("VALIDATION_ERROR");
  expect(result.error.message).toContain("successRate");
});
```

---

### PR-V-04: feedbackScore が -1（範囲外）

```typescript
it("PR-V-04: feedbackScore=-1（<0）→ VALIDATION_ERROR", () => {
  // Act
  const result = checker.checkPublishReadiness(
    mockSafetyGateA,
    mockMetricsOutOfRangeNegative,
  );

  // Assert
  expect(result.success).toBe(false);
  expect(result.error.code).toBe("VALIDATION_ERROR");
  expect(result.error.message).toContain("feedbackScore");
});
```

---

## 6. テストスイート全体構成

```typescript
import { describe, it, expect, beforeEach, vi } from "vitest";
import type {
  SafetyGateInput,
  ObservabilityMetrics,
} from "../types/publish-readiness";
import type { PublishReadinessChecker } from "../interfaces/publish-readiness-checker";
import { DefaultPublishReadinessChecker } from "../services/publish-readiness-checker";

describe("PublishReadinessChecker", () => {
  let checker: PublishReadinessChecker;

  beforeEach(() => {
    vi.clearAllMocks();
    checker = new DefaultPublishReadinessChecker();
  });

  describe("判定パス網羅テスト（PR-01〜PR-12）", () => {
    describe("Step 1: Gate拒否 / Critical リスク", () => {
      it("PR-01: gateStatus=rejected は最優先で blocked"); // mockD + mockX
      it("PR-02: riskLevel=critical + approved でも blocked"); // criticalApproved + mockX
    });

    describe("Step 2: High リスク", () => {
      it("PR-03: riskLevel=high + metrics良好 → manual-approval-required"); // mockC + mockX
      it("PR-04: riskLevel=high + metrics不良 → manual-approval-required"); // mockC + mockZ
    });

    describe("Step 3-M: Medium リスク", () => {
      it("PR-05: riskLevel=medium + 良好メトリクス → review-required"); // mockB + mockX
      it("PR-06: riskLevel=medium + successRate<80 → manual-approval-required"); // mockB + mockZ
      it(
        "PR-07: riskLevel=medium + feedbackScore<3.5 → manual-approval-required",
      ); // mockB + mockW
      it(
        "PR-08: riskLevel=medium + 境界値(sr=85, score=3.5) → review-required",
      ); // mockB + mockY
    });

    describe("Step 3-L: Low リスク", () => {
      it("PR-09: riskLevel=low + 最良メトリクス → auto-approved"); // mockA + mockX
      it("PR-10: riskLevel=low + successRate<90 → review-required"); // mockA + mockZ
      it("PR-11: riskLevel=low + feedbackScore<3.0 → review-required"); // mockA + mockW
      it("PR-12: riskLevel=low + declining → review-required"); // mockA + mockZ
    });
  });

  describe("バリデーションテスト（PR-V-01〜PR-V-04）", () => {
    it("PR-V-01: input=null → VALIDATION_ERROR");
    it("PR-V-02: metrics=null → VALIDATION_ERROR");
    it("PR-V-03: successRate=101 → VALIDATION_ERROR");
    it("PR-V-04: feedbackScore=-1 → VALIDATION_ERROR");
  });
});
```

---

## 7. 判定ロジック仕様（テスト根拠）

### 7.1 feedbackScore 閾値

| riskLevel  | feedbackScore 閾値 | 閾値未満の判定                    |
| ---------- | ------------------ | --------------------------------- |
| `low`      | **3.0**            | `"review-required"`               |
| `medium`   | **3.5**            | `"manual-approval-required"`      |
| `high`     | 閾値なし           | 常に `"manual-approval-required"` |
| `critical` | 閾値なし           | 常に `"blocked"`                  |

### 7.2 successRate 閾値

| riskLevel | successRate 閾値 | 閾値未満の判定               |
| --------- | ---------------- | ---------------------------- |
| `low`     | **90**           | `"review-required"`          |
| `medium`  | **80**           | `"manual-approval-required"` |

### 7.3 qualityTrend 判定

| riskLevel | declining の場合                                                     |
| --------- | -------------------------------------------------------------------- |
| `low`     | `"review-required"`                                                  |
| `medium`  | 他条件次第で `"review-required"` または `"manual-approval-required"` |

---

## 8. IPC レスポンス形式（P60準拠）

本テスト仕様は P60 準拠の IPC レスポンス wrapper を前提とする。

```typescript
// 成功時
type SuccessResponse<T> = { success: true; data: T };

// 失敗時 — P60: エラーアサーションは result.error.code（result.code ではない）
type ErrorResponse = {
  success: false;
  error: {
    code: string; // "VALIDATION_ERROR" 等
    message: string;
  };
};

type IpcResponse<T> = SuccessResponse<T> | ErrorResponse;
```

---

## 9. Phase 2 設計書との対応（トレーサビリティ）

| テストID | 設計書 マトリクス ID | 設計書 記載条件                                                    |
| -------- | -------------------- | ------------------------------------------------------------------ |
| PR-01    | M-01                 | gateStatus=rejected → blocked                                      |
| PR-02    | M-02                 | riskLevel=critical + any gateStatus → blocked                      |
| PR-03    | M-03                 | riskLevel=high + metrics OK → manual-approval-required             |
| PR-04    | M-04                 | riskLevel=high + metrics NG → manual-approval-required             |
| PR-05    | M-05                 | medium + successRate>=80 + score>=3.5 → review-required            |
| PR-06    | M-06                 | medium + successRate<80 → manual-approval-required                 |
| PR-07    | M-07                 | medium + feedbackScore<3.5 → manual-approval-required              |
| PR-08    | M-08                 | medium + 境界値（successRate=85, feedbackScore=3.5）               |
| PR-09    | M-09                 | low + successRate>=90 + score>=3.0 + not declining → auto-approved |
| PR-10    | M-10                 | low + successRate<90 → review-required                             |
| PR-11    | M-11                 | low + feedbackScore<3.0 → review-required                          |
| PR-12    | M-12                 | low + declining → review-required                                  |
| PR-V-01  | バリデーション仕様   | null input 拒否                                                    |
| PR-V-02  | バリデーション仕様   | null metrics 拒否                                                  |
| PR-V-03  | バリデーション仕様   | successRate 範囲（0〜100）                                         |
| PR-V-04  | バリデーション仕様   | feedbackScore 範囲（0〜5）                                         |
