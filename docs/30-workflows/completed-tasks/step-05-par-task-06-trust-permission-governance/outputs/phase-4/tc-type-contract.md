# TC-T: 型契約テスト仕様書

## メタ情報

| 項目       | 値                                                 |
| ---------- | -------------------------------------------------- |
| タスクID   | TASK-SKILL-LIFECYCLE-06                            |
| Phase      | 4: テスト作成                                      |
| カテゴリ   | TC-T（型契約テスト）                               |
| テスト数   | 6件（TC-T-001〜TC-T-006）                          |
| 依存成果物 | `outputs/phase-2/risk-level-design.md`             |
|            | `outputs/phase-2/safety-gate-contract.md`          |
|            | `outputs/phase-2/permission-persistence-design.md` |
| 作成日     | 2026-03-16                                         |

---

## TC-T-001: ToolRiskConfig型定義の必須フィールド検証

### 目的

`TOOL_RISK_CONFIG` の全4リスクレベルが必須フィールドを持ち、criticalレベルの不変条件を満たすことを検証する。

### 前提条件

- `packages/shared/src/constants/security.ts` に `TOOL_RISK_CONFIG` が定義されている

### テストケース

#### TC-T-001-a: 全4レベルのRecord網羅性

- **入力**: `Object.keys(TOOL_RISK_CONFIG)`
- **期待出力**: `["critical", "high", "medium", "low"]`（順不同で4要素）
- **条件式**: `Object.keys(TOOL_RISK_CONFIG).sort().join(",") === "critical,high,low,medium"`

#### TC-T-001-b: 各レベルの必須フィールド存在確認

- **入力**: 全4レベルの各 `ToolRiskConfig` エントリ
- **期待出力**: 以下の6フィールドが全て存在する
  - `level`: `typeof config.level === "string"`
  - `allowApproveOnce`: `typeof config.allowApproveOnce === "boolean"`
  - `allowPermanent`: `typeof config.allowPermanent === "boolean"`
  - `autoDenyDefault`: `typeof config.autoDenyDefault === "boolean"`
  - `headerColorToken`: `typeof config.headerColorToken === "string"`
  - `dialogWidth`: `typeof config.dialogWidth === "number"`

#### TC-T-001-c: Criticalレベルの不変条件

- **入力**: `TOOL_RISK_CONFIG.critical`
- **条件式**:
  - `TOOL_RISK_CONFIG.critical.allowPermanent === false`
  - `TOOL_RISK_CONFIG.critical.allowApproveOnce === false`
  - `TOOL_RISK_CONFIG.critical.autoDenyDefault === true`
  - `TOOL_RISK_CONFIG.critical.dialogWidth === 640`

#### TC-T-001-d: levelフィールドとキーの一致

- **入力**: 各エントリ
- **条件式**: `TOOL_RISK_CONFIG[key].level === key`（全4レベルで成立する）

#### TC-T-001-e: Highレベルの制約

- **入力**: `TOOL_RISK_CONFIG.high`
- **条件式**:
  - `TOOL_RISK_CONFIG.high.allowApproveOnce === true`
  - `TOOL_RISK_CONFIG.high.allowPermanent === false`
  - `TOOL_RISK_CONFIG.high.autoDenyDefault === false`
  - `TOOL_RISK_CONFIG.high.dialogWidth === 480`

#### TC-T-001-f: Medium/Lowレベルの許可オプション

- **入力**: `TOOL_RISK_CONFIG.medium`, `TOOL_RISK_CONFIG.low`
- **条件式**:
  - `TOOL_RISK_CONFIG.medium.allowApproveOnce === true`
  - `TOOL_RISK_CONFIG.medium.allowPermanent === true`
  - `TOOL_RISK_CONFIG.low.allowApproveOnce === true`
  - `TOOL_RISK_CONFIG.low.allowPermanent === true`
  - `TOOL_RISK_CONFIG.medium.dialogWidth === 400`
  - `TOOL_RISK_CONFIG.low.dialogWidth === 400`

### 合格基準

全6サブケース（a〜f）が条件式を満たす。

---

## TC-T-002: dialogWidthの型制約検証

### 目的

`dialogWidth` が `400 | 480 | 640` の3値のみを受け入れることを検証する。

### テストケース

#### TC-T-002-a: 有効値の検証

- **入力**: 全4レベルの `dialogWidth` 値
- **条件式**: `[400, 480, 640].includes(config.dialogWidth)` が全レベルで `true`

#### TC-T-002-b: 値の分布検証

- **入力**: `TOOL_RISK_CONFIG` 全4レベル
- **期待出力**:
  - `TOOL_RISK_CONFIG.critical.dialogWidth === 640`
  - `TOOL_RISK_CONFIG.high.dialogWidth === 480`
  - `TOOL_RISK_CONFIG.medium.dialogWidth === 400`
  - `TOOL_RISK_CONFIG.low.dialogWidth === 400`

#### TC-T-002-c: TypeScriptコンパイル時検証（型レベル）

- **検証方法**: `dialogWidth: 500` のようなリテラル型外の値を代入すると TypeScript コンパイルエラーになることを `@ts-expect-error` で確認する
- **条件式**: `// @ts-expect-error: 500 is not assignable to 400 | 480 | 640` のコメント付きコードがコンパイルエラーを発生させる

### 合格基準

全3サブケース（a〜c）が条件式を満たす。

---

## TC-T-003: headerColorTokenの形式検証

### 目的

全リスクレベルの `headerColorToken` がCSS変数名として有効な形式であることを検証する。

### テストケース

#### TC-T-003-a: 正規表現パターンマッチ

- **入力**: 全4レベルの `headerColorToken`
- **条件式**: `/^--[a-z-]+$/.test(config.headerColorToken) === true`（全4レベル）

#### TC-T-003-b: 具体値の検証

- **入力**: 各レベルの `headerColorToken`
- **期待出力**:
  - `TOOL_RISK_CONFIG.critical.headerColorToken === "--status-destructive"`
  - `TOOL_RISK_CONFIG.high.headerColorToken === "--status-warning"`
  - `TOOL_RISK_CONFIG.medium.headerColorToken === "--status-caution"`
  - `TOOL_RISK_CONFIG.low.headerColorToken === "--status-info"`

#### TC-T-003-c: 無効パターン拒否（設計検証用）

以下のパターンが `/^--[a-z-]+$/` にマッチしないことを確認する:

| 無効パターン      | 理由                    |
| ----------------- | ----------------------- |
| `"status-info"`   | `--` プレフィックスなし |
| `"--Status"`      | 大文字を含む            |
| `"--status_info"` | アンダースコアを含む    |
| `""`              | 空文字列                |
| `"--"`            | 変数名部分が空          |

### 合格基準

全3サブケース（a〜c）が条件式を満たし、全4レベルで異なる値が設定されている。

---

## TC-T-004: AllowedToolEntryV2型定義の後方互換検証

### 目的

`AllowedToolEntryV2` が `AllowedToolEntry` を正しく拡張し、V1エントリとの後方互換性を維持することを検証する。

### 前提条件

- `AllowedToolEntry` が `{ toolName: string; allowedAt: number }` で定義されている
- `AllowedToolEntryV2` が `AllowedToolEntry` を extends している

### テストケース

#### TC-T-004-a: V1エントリのV2型への代入互換

- **入力**: `{ toolName: "Bash", allowedAt: 1710000000000 }`
- **条件式**: V1フォーマットのオブジェクトが `AllowedToolEntryV2` 型として受け入れられる（TypeScript コンパイルが通過する）

#### TC-T-004-b: expiresAtのoptional性

- **入力**: `{ toolName: "Bash", allowedAt: 1710000000000, expiresAt: undefined }`
- **条件式**: `entry.expiresAt === undefined` が合法であること

#### TC-T-004-c: expiryPolicyの4値制約

- **入力**: `expiryPolicy` フィールド
- **条件式**: `"session" | "time_24h" | "time_7d" | "permanent"` の4値のみ代入可能
- **検証方法**: `"invalid_policy"` を代入すると TypeScript コンパイルエラーになることを `@ts-expect-error` で確認する

#### TC-T-004-d: skillNameのoptional性

- **入力**: `{ toolName: "Bash", allowedAt: 1710000000000, skillName: undefined }`
- **条件式**: `entry.skillName === undefined` のとき全スキルに適用として扱われる

#### TC-T-004-e: V2フィールド全指定

- **入力**: `{ toolName: "Read", allowedAt: 1710000000000, expiresAt: 1710086400000, skillName: "my-skill", expiryPolicy: "time_24h" }`
- **条件式**: 全フィールドが正しく読み取れる
  - `entry.toolName === "Read"`
  - `entry.allowedAt === 1710000000000`
  - `entry.expiresAt === 1710086400000`
  - `entry.skillName === "my-skill"`
  - `entry.expiryPolicy === "time_24h"`

### 合格基準

全5サブケース（a〜e）が条件式を満たし、`AllowedToolEntry` 型が `AllowedToolEntryV2` 型に代入可能であることが確認できる。

---

## TC-T-005: SafetyGatePortインターフェース契約検証

### 目的

`SafetyGatePort.evaluate` のシグネチャと `SafetyGateResult` の構造が設計仕様どおりであることを検証する。

### 前提条件

- `packages/shared/src/types/safety-gate.ts` に型定義が存在する

### テストケース

#### TC-T-005-a: evaluateシグネチャ

- **条件式**: `SafetyGatePort` が `evaluate(skillName: string): Promise<SafetyGateResult>` メソッドを持つ
- **検証方法**: モック実装が型チェックを通過することで確認する

```typescript
const mockGate: SafetyGatePort = {
  evaluate: vi.fn().mockResolvedValue({
    skillName: "test-skill",
    evaluatedAt: Date.now(),
    overallGrade: "SAFE",
    details: [],
  }),
};
```

#### TC-T-005-b: SafetyGateResult必須フィールド

- **入力**: `evaluate` の戻り値
- **条件式**:
  - `typeof result.skillName === "string"`
  - `typeof result.evaluatedAt === "number"`
  - `["SAFE", "SAFE_WITH_WARNINGS", "UNSAFE"].includes(result.overallGrade)`
  - `Array.isArray(result.details)`

#### TC-T-005-c: details配列の要素数保証

- **入力**: 正常な `evaluate` 呼び出しの戻り値
- **条件式**: `result.details.length === 5`

#### TC-T-005-d: SafetyCheckDetail必須フィールド

- **入力**: `result.details` の各要素
- **条件式**:
  - `typeof detail.checkId === "string"`
  - `typeof detail.toolName === "string"`
  - `["critical", "high", "medium", "low"].includes(detail.riskLevel)`
  - `["passed", "warned", "blocked"].includes(detail.status)`
  - `typeof detail.message === "string"`

#### TC-T-005-e: SafetyCheckIdの5種類網羅

- **入力**: `result.details` の全 `checkId`
- **条件式**: 以下の5つが全て含まれる
  - `"CRITICAL_TOOL_REQUIRED"`
  - `"HIGH_TOOL_REQUIRED"`
  - `"NO_PERMANENT_APPROVAL"`
  - `"ALL_LOW_TOOLS"`
  - `"PROTECTED_PATH_ACCESS"`

#### TC-T-005-f: overallGradeの3値制約

- **条件式**: `overallGrade` が `"SAFE" | "SAFE_WITH_WARNINGS" | "UNSAFE"` の3値のみ取りうる
- **検証方法**: `"DANGEROUS"` のような4番目の値を代入すると TypeScript コンパイルエラーになることを確認する

### 合格基準

全6サブケース（a〜f）が条件式を満たす。`SafetyCheckDetail.status` が `"passed" | "warned" | "blocked"` の3値のみであることが型レベルで保証される。

---

## TC-T-006: 設計文書完全性チェックスクリプト仕様

### 目的

Phase 2 成果物5ファイルの整合性を自動検証するスクリプトの仕様を定義する。

### 詳細仕様

`outputs/phase-4/validate-design-script-spec.md` に記載。6項目の検証内容を定義する。

### テストケース概要

| 検証項目 | 検証内容                                  | 合格条件                                                                                 |
| -------- | ----------------------------------------- | ---------------------------------------------------------------------------------------- |
| V-01     | ToolRiskLevel 4値の網羅性                 | 5ファイル全てで同一の4値を参照している                                                   |
| V-02     | CSS変数トークン名の一貫性                 | `risk-level-design.md` と `accountability-ui-design.md` で同一のトークン名を使用している |
| V-03     | SafetyCheckId 5件の一貫性                 | `safety-gate-contract.md` 内で定義と参照が一致している                                   |
| V-04     | DEFAULT_TIMEOUT_MS 値の一貫性             | `abort-fallback-design.md` 内で全て 300000 を使用している                                |
| V-05     | expiryPolicy 4種の一貫性                  | `permission-persistence-design.md` 内で定義と参照が一致している                          |
| V-06     | PERMISSION_HISTORY_MAX_ENTRIES 値の一貫性 | `permission-persistence-design.md` 内で 1000 を使用している                              |

### 合格基準

スクリプト実行時の exitCode が 0 であり、"Result: 6/6 PASS" が出力される。
