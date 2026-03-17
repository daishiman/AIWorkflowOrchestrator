# Phase 5 型定義カバレッジ

## メタ情報

| 項目     | 内容                                  |
| -------- | ------------------------------------- |
| 文書     | Phase 7 - カバレッジ確認 成果物 3/4   |
| タスクID | TASK-SKILL-LIFECYCLE-08               |
| 作成日   | 2026-03-17                            |
| 参照     | `outputs/phase-5/type-definitions.md` |

---

## 1. 目的

Phase 5 で確定した全型定義の全フィールドが、Phase 4 + Phase 6 のテストケースで少なくとも1回はアサーション対象になっているかを検証する。

---

## 2. publishing-types.ts のフィールドカバレッジ

### 2.1 SkillVisibility 型

| 値         | テストで検証済みか | テストID                      |
| ---------- | ------------------ | ----------------------------- |
| `"local"`  | YES                | PUB-V-1, PUB-SC-1〜4          |
| `"team"`   | YES                | PUB-V-2, PUB-SC-5〜8          |
| `"public"` | YES                | PUB-V-3, PUB-SC-9, VCB-07〜08 |

**カバレッジ: 3/3 = 100%**

### 2.2 SkillPublishingMetadataBase

| フィールド    | 型       | テストで検証済みか | テストID                |
| ------------- | -------- | ------------------ | ----------------------- |
| `name`        | `string` | YES                | PUB-L-1〜4, EHE-05〜06  |
| `description` | `string` | YES                | PUB-L-5〜7, COC-02      |
| `version`     | `string` | YES                | PUB-L-8〜10, SDD-03〜05 |

**カバレッジ: 3/3 = 100%**

### 2.3 LocalMetadata

| フィールド                                  | 型        | テストで検証済みか | テストID |
| ------------------------------------------- | --------- | ------------------ | -------- |
| `visibility`                                | `"local"` | YES                | PUB-V-1  |
| (name/description/version は Base から継承) |           |                    |          |

**カバレッジ: 1/1 = 100%** (Base 含めると 4/4)

### 2.4 TeamMetadata

| フィールド   | 型         | テストで検証済みか | テストID                           |
| ------------ | ---------- | ------------------ | ---------------------------------- |
| `visibility` | `"team"`   | YES                | PUB-V-2                            |
| `author`     | `string`   | YES                | PUB-T-1〜4                         |
| `tags`       | `string[]` | YES                | PUB-T-5〜8, SDD-06〜07, EHE-07〜08 |
| `teamId`     | `string`   | YES                | PUB-T-9〜11                        |

**カバレッジ: 4/4 = 100%** (Base 含めると 7/7)

### 2.5 PublicMetadata

| フィールド      | 型         | テストで検証済みか | テストID                           |
| --------------- | ---------- | ------------------ | ---------------------------------- |
| `visibility`    | `"public"` | YES                | PUB-V-3, VCB-07                    |
| `author`        | `string`   | YES                | PUB-P-1 (Base から)                |
| `tags`          | `string[]` | YES                | PUB-P-1 (Base から)                |
| `teamId`        | `string`   | YES                | PUB-P-1 (Base から)                |
| `license`       | `string`   | YES                | PUB-P-2〜4, EHE-09〜12             |
| `readme`        | `string`   | YES                | PUB-P-5〜6                         |
| `changelog`     | `string`   | YES                | PUB-P-7〜8                         |
| `minAppVersion` | `string`   | YES                | PUB-P-9                            |
| `repository`    | `string?`  | YES                | PUB-P-1 (任意フィールド、存在確認) |

**カバレッジ: 9/9 = 100%**

### 2.6 VisibilityFilter 型

| 値         | テストで検証済みか                                                | テストID |
| ---------- | ----------------------------------------------------------------- | -------- |
| `"local"`  | YES（SkillVisibility テストで間接カバー）                         | PUB-V-1  |
| `"team"`   | YES                                                               | PUB-V-2  |
| `"public"` | YES                                                               | PUB-V-3  |
| `"all"`    | 直接テストなし（UI フィルタ用、zustand-slice 設計のデフォルト値） | --       |

**カバレッジ: 3/4 = 75%** (NOTE: `"all"` は UI フィルタのデフォルト値であり、バリデーション対象ではない。Store 初期値テストで検証予定)

### 2.7 IpcResponse 型

| バリアント                                     | テストで検証済みか | テストID                                         |
| ---------------------------------------------- | ------------------ | ------------------------------------------------ |
| `{ success: true, data: T }`                   | YES                | SC-01〜05, DT-01〜04, VCB-07〜08, DRB-05         |
| `{ success: false, error: { code, message } }` | YES                | SC-06〜10, DT-07〜08, VCB-05〜06, COC-10, EHE-17 |

**カバレッジ: 2/2 = 100%**

---

## 3. compatibility-types.ts のフィールドカバレッジ

### 3.1 CompatibilityLevel 型

| 値                     | テストで検証済みか | テストID                                    |
| ---------------------- | ------------------ | ------------------------------------------- |
| `"compatible"`         | YES                | CMP-S-1〜3, VCB-01, VCB-07                  |
| `"minor-incompatible"` | YES                | CMP-S-4〜6, SDD-01, VCB-08                  |
| `"breaking"`           | YES                | CMP-S-7〜10, VCB-03, VCB-05〜06, SDD-08〜09 |

**カバレッジ: 3/3 = 100%**

### 3.2 BreakingChange インターフェース

| フィールド   | 型                                                | テストで検証済みか | テストID                    |
| ------------ | ------------------------------------------------- | ------------------ | --------------------------- |
| `field`      | `string`                                          | YES                | CMP-BC-1〜5, VCB-03, SDD-02 |
| `changeType` | `"removed" \| "type-changed" \| "required-added"` | YES                | CMP-BC-1〜5, VCB-03         |
| `before`     | `string`                                          | YES                | CMP-R-5〜8                  |
| `after`      | `string`                                          | YES                | CMP-R-5〜8                  |

**カバレッジ: 4/4 = 100%**

### 3.3 CompatibilityWarning インターフェース

| フィールド | 型       | テストで検証済みか | テストID   |
| ---------- | -------- | ------------------ | ---------- |
| `field`    | `string` | YES                | CMP-R-3〜4 |
| `message`  | `string` | YES                | CMP-R-3〜4 |

**カバレッジ: 2/2 = 100%**

### 3.4 CompatibilityCheckResult インターフェース

| フィールド        | 型                              | テストで検証済みか | テストID                            |
| ----------------- | ------------------------------- | ------------------ | ----------------------------------- |
| `level`           | `CompatibilityLevel`            | YES                | CMP-R-1, VCB-01, VCB-03, SDD-01     |
| `breakingChanges` | `BreakingChange[]`              | YES                | CMP-R-2, VCB-03, SDD-02, SDD-10〜11 |
| `warnings`        | `CompatibilityWarning[]`        | YES                | CMP-R-3〜4, VCB-01                  |
| `suggestedBump`   | `"major" \| "minor" \| "patch"` | YES                | CMP-R-1, VCB-01, VCB-03, SDD-08〜09 |

**カバレッジ: 4/4 = 100%**

---

## 4. publish-eligibility.ts のフィールドカバレッジ

### 4.1 PublishReadiness 型

| ステータス                             | テストで検証済みか | テストID             |
| -------------------------------------- | ------------------ | -------------------- |
| `"auto-approved"`                      | YES                | PR-10                |
| `"review-required"` + reasons          | YES                | PR-07〜09, PR-11〜12 |
| `"manual-approval-required"` + reasons | YES                | PR-04〜06            |
| `"blocked"` + reasons                  | YES                | PR-01〜03            |

**カバレッジ: 4/4 = 100%**

### 4.2 ToolRiskLevel 型

| 値           | テストで検証済みか | テストID  |
| ------------ | ------------------ | --------- |
| `"low"`      | YES                | PR-10〜12 |
| `"medium"`   | YES                | PR-07〜09 |
| `"high"`     | YES                | PR-04〜06 |
| `"critical"` | YES                | PR-02〜03 |

**カバレッジ: 4/4 = 100%**

### 4.3 SafetyGateStatus 型

| 値           | テストで検証済みか | テストID            |
| ------------ | ------------------ | ------------------- |
| `"approved"` | YES                | PR-04, PR-07, PR-10 |
| `"pending"`  | YES                | PR-05               |
| `"rejected"` | YES                | PR-01               |

**カバレッジ: 3/3 = 100%**

### 4.4 SafetyGateInput インターフェース

| フィールド                      | 型                 | テストで検証済みか | テストID     |
| ------------------------------- | ------------------ | ------------------ | ------------ |
| `riskLevel`                     | `ToolRiskLevel`    | YES                | PR-01〜12    |
| `gateStatus`                    | `SafetyGateStatus` | YES                | PR-01〜12    |
| `securityScan.passed`           | `boolean`          | YES                | PR-09, PR-11 |
| `securityScan.criticalFindings` | `number`           | YES                | PR-03        |
| `securityScan.warnings`         | `number`           | YES                | PR-09        |

**カバレッジ: 5/5 = 100%**

### 4.5 QualityTrend 型

| 値            | テストで検証済みか | テストID     |
| ------------- | ------------------ | ------------ |
| `"improving"` | YES                | PR-10        |
| `"stable"`    | YES                | PR-04, PR-07 |
| `"declining"` | YES                | PR-08, PR-12 |

**カバレッジ: 3/3 = 100%**

### 4.6 ObservabilityMetrics インターフェース

| フィールド      | 型             | テストで検証済みか | テストID                  |
| --------------- | -------------- | ------------------ | ------------------------- |
| `successRate`   | `number`       | YES                | PR-07, PR-10, PR-V-01〜02 |
| `qualityTrend`  | `QualityTrend` | YES                | PR-08, PR-10, PR-12       |
| `feedbackScore` | `number`       | YES                | PR-10, PR-V-03〜04        |

**カバレッジ: 3/3 = 100%**

---

## 5. 型カバレッジ集計

| 型定義ファイル         | 型/インターフェース数 | 全フィールド数 | カバー済み | カバレッジ |
| ---------------------- | --------------------- | -------------- | ---------- | ---------- |
| publishing-types.ts    | 7型                   | 26             | 25         | 96.2%      |
| compatibility-types.ts | 4型                   | 13             | 13         | 100%       |
| publish-eligibility.ts | 6型                   | 22             | 22         | 100%       |
| **合計**               | **17型**              | **61**         | **60**     | **98.4%**  |

**未カバーフィールド**: `VisibilityFilter` の `"all"` 値（UI フィルタのデフォルト値。Store 初期化テストで検証予定。バリデーションロジックの対象外であるため、機能テストへの影響はない）。

---

## 6. サービスインターフェースのメソッドカバレッジ

Phase 5 `service-interfaces.md` で定義した4サービスの全メソッドがテストで検証されているか。

### 6.1 SkillRegistryService（5メソッド）

| メソッド          | テストで検証済みか | テストID                          |
| ----------------- | ------------------ | --------------------------------- |
| `register()`      | YES                | SC-01〜10, VCB-05〜08, DRB-05〜07 |
| `update()`        | YES                | SC-11〜14, COC-01〜02             |
| `deprecate()`     | YES                | SC-15〜20, DRB-08〜13             |
| `remove()`        | YES                | SC-21〜24                         |
| `getDependents()` | YES                | SC-25〜27, DRB-08〜09             |

**カバレッジ: 5/5 = 100%**

### 6.2 SkillDistributionService（4メソッド）

| メソッド        | テストで検証済みか | テストID                                      |
| --------------- | ------------------ | --------------------------------------------- |
| `importSkill()` | YES                | DT-01〜08, DRB-01〜04, COC-01〜03, EHE-01〜04 |
| `exportSkill()` | YES                | DT-09〜14                                     |
| `forkSkill()`   | YES                | DT-15〜20, VCB-02, COC-04〜07                 |
| `shareSkill()`  | YES                | DT-21〜28, COC-08〜10, EHE-13〜14             |

**カバレッジ: 4/4 = 100%**

### 6.3 PublishReadinessChecker（1メソッド）

| メソッド  | テストで検証済みか | テストID               |
| --------- | ------------------ | ---------------------- |
| `check()` | YES                | PR-01〜12, PR-V-01〜04 |

**カバレッジ: 1/1 = 100%**

### 6.4 CompatibilityChecker（2メソッド）

| メソッド              | テストで検証済みか | テストID                                                         |
| --------------------- | ------------------ | ---------------------------------------------------------------- |
| `check()`             | YES                | CMP-S-1〜10, CMP-BC-1〜5, VCB-01, VCB-03, SDD-01〜02, SDD-08〜11 |
| `checkDependencies()` | YES                | CMP-D-1〜9                                                       |

**カバレッジ: 2/2 = 100%**

---

## 7. IPC チャンネルカバレッジ

Phase 5 `ipc-channel-definitions.md` で定義した11チャンネルのテスト対応状況。

| チャンネル                             | テストで検証済みか | テストID              |
| -------------------------------------- | ------------------ | --------------------- |
| `skill:publishing:register`            | YES                | SC-01〜10             |
| `skill:publishing:update`              | YES                | SC-11〜14             |
| `skill:publishing:deprecate`           | YES                | SC-15〜20, DRB-08〜13 |
| `skill:publishing:remove`              | YES                | SC-21〜24             |
| `skill:publishing:get-dependents`      | YES                | SC-25〜27             |
| `skill:publishing:check-readiness`     | YES                | PR-01〜12             |
| `skill:publishing:check-compatibility` | YES                | CMP-S-1〜10           |
| `skill:distribution:import`            | YES                | DT-01〜08             |
| `skill:distribution:export`            | YES                | DT-09〜14             |
| `skill:distribution:fork`              | YES                | DT-15〜20             |
| `skill:distribution:share`             | YES                | DT-21〜28             |

**カバレッジ: 11/11 = 100%**
