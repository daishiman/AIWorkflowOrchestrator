# 依存タスク境界カバレッジ

## メタ情報

| 項目     | 内容                                |
| -------- | ----------------------------------- |
| 文書     | Phase 7 - カバレッジ確認 成果物 2/4 |
| タスクID | TASK-SKILL-LIFECYCLE-08             |
| 作成日   | 2026-03-17                          |

---

## 1. 目的

Task-08 は Task-05（SkillMetadataProvider）、Task-06（SafetyGate）、Task-07（ObservabilityMetrics）の出力を入力として受け取る。本文書は、これらのタスク境界で発生する契約（型・値・エラー）がテストでカバーされているかを検証する。

---

## 2. Task-05 境界（SkillMetadataProvider → SkillPublishingMetadata）

### 2.1 契約定義

Task-05 が提供する `SkillMetadataProvider` は、スキルのメタデータを `SkillPublishingMetadata` 型として返す。Task-08 はこの型を受け取り、visibility に応じたバリデーションを実行する。

### 2.2 境界テストカバレッジ

| 境界条件                                                                           | テストID                           | カバー状態 |
| ---------------------------------------------------------------------------------- | ---------------------------------- | ---------- |
| visibility="local" の必須フィールド（name/description/version）                    | PUB-L-1〜10                        | YES        |
| visibility="team" の追加必須フィールド（author/tags/teamId）                       | PUB-T-1〜11                        | YES        |
| visibility="public" の追加必須フィールド（license/readme/changelog/minAppVersion） | PUB-P-1〜9                         | YES        |
| 無効な visibility 値の拒否                                                         | PUB-V-4〜8                         | YES        |
| P42 準拠3段バリデーション（全文字列フィールド）                                    | PUB-L-2〜4, PUB-T-2〜4, PUB-P-2〜4 | YES        |
| name 長制限境界値（200/201文字）                                                   | EHE-05〜06                         | YES        |
| tags 件数制限境界値（10/11件）                                                     | EHE-07〜08                         | YES        |
| tags 型検証（非配列入力）                                                          | SDD-06〜07                         | YES        |
| semver 形式バリデーション（非準拠文字列）                                          | SDD-03〜05                         | YES        |
| license SPDX チェック                                                              | EHE-09〜12                         | YES        |

**カバレッジ: 10/10 = 100%**

---

## 3. Task-06 境界（SafetyGate → SafetyGateInput）

### 3.1 契約定義

Task-06 の `SafetyGateResult` + `PermissionStore` から `SafetyGateInput` 型に変換して Task-08 の `PublishReadinessChecker.check()` に渡す。

```typescript
interface SafetyGateInput {
  riskLevel: ToolRiskLevel; // "low" | "medium" | "high" | "critical"
  gateStatus: SafetyGateStatus; // "approved" | "pending" | "rejected"
  securityScan: {
    passed: boolean;
    criticalFindings: number;
    warnings: number;
  };
}
```

### 3.2 境界テストカバレッジ

| 境界条件                                   | テストID            | カバー状態 |
| ------------------------------------------ | ------------------- | ---------- |
| riskLevel="low" の判定パス                 | PR-10〜12           | YES        |
| riskLevel="medium" の判定パス              | PR-07〜09           | YES        |
| riskLevel="high" の判定パス                | PR-04〜06           | YES        |
| riskLevel="critical" → blocked 判定        | PR-02〜03           | YES        |
| gateStatus="approved" の判定パス           | PR-04, PR-07, PR-10 | YES        |
| gateStatus="pending" の判定パス            | PR-05               | YES        |
| gateStatus="rejected" → blocked 判定       | PR-01               | YES        |
| securityScan.passed=false の判定パス       | PR-09, PR-11        | YES        |
| securityScan.criticalFindings>0 の判定パス | PR-03               | YES        |

**カバレッジ: 9/9 = 100%**

---

## 4. Task-07 境界（ObservabilityMetrics → PublishReadinessChecker）

### 4.1 契約定義

Task-07 の `SkillAggregateView` から `ObservabilityMetrics` 型に変換して Task-08 の `PublishReadinessChecker.check()` に渡す。

```typescript
interface ObservabilityMetrics {
  successRate: number; // 0〜100
  qualityTrend: QualityTrend; // "improving" | "stable" | "declining"
  feedbackScore: number; // 0〜5
}
```

### 4.2 境界テストカバレッジ

| 境界条件                                         | テストID     | カバー状態 |
| ------------------------------------------------ | ------------ | ---------- |
| successRate >= 95 の判定パス                     | PR-10        | YES        |
| successRate < 80 の判定パス                      | PR-07        | YES        |
| successRate 範囲外（< 0, > 100）のバリデーション | PR-V-01〜02  | YES        |
| qualityTrend="improving" の判定パス              | PR-10        | YES        |
| qualityTrend="stable" の判定パス                 | PR-04, PR-07 | YES        |
| qualityTrend="declining" の判定パス              | PR-08, PR-12 | YES        |
| feedbackScore >= 4.0 の判定パス                  | PR-10        | YES        |
| feedbackScore 範囲外（< 0, > 5）のバリデーション | PR-V-03〜04  | YES        |

**カバレッジ: 8/8 = 100%**

---

## 5. 境界カバレッジ集計

| 依存タスク                       | 境界条件数 | カバー数 | カバレッジ |
| -------------------------------- | ---------- | -------- | ---------- |
| Task-05（SkillMetadataProvider） | 10         | 10       | 100%       |
| Task-06（SafetyGate）            | 9          | 9        | 100%       |
| Task-07（ObservabilityMetrics）  | 8          | 8        | 100%       |
| **合計**                         | **27**     | **27**   | **100%**   |

---

## 6. エラーコードカテゴリ境界

Task-08 のエラーコードが `02-code-quality.md` のカテゴリ分類に準拠していることの検証。

| エラーコード                         | カテゴリ               | コード範囲 | リトライ | テストID                         |
| ------------------------------------ | ---------------------- | ---------- | -------- | -------------------------------- |
| VALIDATION_ERROR                     | Validation Error       | 1000-1999  | 不可     | PUB-L-\*, SDD-03〜07, EHE-05〜12 |
| BREAKING_CHANGE_ERROR                | Business Error         | 2000-2999  | 不可     | VCB-05〜06                       |
| SKILL_DIST_DEPENDENCY_ERROR          | Business Error         | 2000-2999  | 不可     | VCB-04                           |
| SKILL_DIST_IMPORT_BLOCKED_DEPRECATED | Business Error         | 2000-2999  | 不可     | DRB-03                           |
| SKILL_DIST_IMPORT_BLOCKED_PENDING    | Business Error         | 2000-2999  | 不可     | COC-03                           |
| SKILL_DIST_NOT_FOUND_ERROR           | Business Error         | 2000-2999  | 不可     | COC-06〜07                       |
| SKILL_DIST_TEAM_AUTH_ERROR           | Business Error         | 2000-2999  | 不可     | COC-08〜10                       |
| SKILL_DIST_PERMISSION_ERROR          | Business Error         | 2000-2999  | 不可     | EHE-13〜17                       |
| SKILL_DIST_NETWORK_ERROR             | External Service Error | 3000-3999  | 可能     | EHE-01〜04                       |

**全エラーコードのカテゴリ分類がテストで明示的に検証されている。**
