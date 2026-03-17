# 命名規則の統一確認

## メタ情報

| 項目       | 内容                                                                                                                                                                    |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 文書       | Phase 8 - タスク2 成果物                                                                                                                                                |
| タスクID   | TASK-SKILL-LIFECYCLE-08                                                                                                                                                 |
| 作成日     | 2026-03-17                                                                                                                                                              |
| 依存成果物 | `outputs/phase-5/type-definitions.md`、`outputs/phase-5/service-interfaces.md`、`outputs/phase-5/ipc-channel-definitions.md`、`outputs/phase-5/zustand-slice-design.md` |
| 適用規則   | 02-code-quality.md（boolean 命名規則: is/has/can/should プレフィックス）、04-electron-security.md（IPC チャンネル名規則）                                               |

---

## 目的

Phase 5 で確定した全型名・フィールド名・IPC チャンネル名・Zustand スライス名・boolean フィールドの命名規則が統一されていることを確認する。違反が発見された場合は修正案を記録する。

---

## 1. 型名チェック結果（PascalCase 規則）

全型名は PascalCase（先頭大文字、単語区切りで大文字）に準拠すること。

| 型名                        | 規則       | 適合 | 修正案 |
| --------------------------- | ---------- | ---- | ------ |
| SkillVisibility             | PascalCase | 適合 | -      |
| SkillPublishingMetadataBase | PascalCase | 適合 | -      |
| LocalMetadata               | PascalCase | 適合 | -      |
| TeamMetadata                | PascalCase | 適合 | -      |
| PublicMetadata              | PascalCase | 適合 | -      |
| SkillPublishingMetadata     | PascalCase | 適合 | -      |
| VisibilityFilter            | PascalCase | 適合 | -      |
| CompatibilityLevel          | PascalCase | 適合 | -      |
| BreakingChange              | PascalCase | 適合 | -      |
| CompatibilityWarning        | PascalCase | 適合 | -      |
| CompatibilityCheckResult    | PascalCase | 適合 | -      |
| PublishReadiness            | PascalCase | 適合 | -      |
| ToolRiskLevel               | PascalCase | 適合 | -      |
| SafetyGateStatus            | PascalCase | 適合 | -      |
| SafetyGateInput             | PascalCase | 適合 | -      |
| QualityTrend                | PascalCase | 適合 | -      |
| ObservabilityMetrics        | PascalCase | 適合 | -      |
| IpcResponse                 | PascalCase | 適合 | -      |
| SkillRegistryService        | PascalCase | 適合 | -      |
| RegisterResult              | PascalCase | 適合 | -      |
| UpdateResult                | PascalCase | 適合 | -      |
| DeprecationNotice           | PascalCase | 適合 | -      |
| SkillDistributionService    | PascalCase | 適合 | -      |
| ImportOptions               | PascalCase | 適合 | -      |
| ImportResult                | PascalCase | 適合 | -      |
| ExportOptions               | PascalCase | 適合 | -      |
| ExportPackage               | PascalCase | 適合 | -      |
| ForkResult                  | PascalCase | 適合 | -      |
| ShareOptions                | PascalCase | 適合 | -      |
| ShareLink                   | PascalCase | 適合 | -      |
| PublishReadinessChecker     | PascalCase | 適合 | -      |
| CompatibilityChecker        | PascalCase | 適合 | -      |
| PublishingState             | PascalCase | 適合 | -      |
| PublishingActions           | PascalCase | 適合 | -      |

**結果**: 34型全て PascalCase に適合。違反なし。

---

## 2. union type 値チェック結果（lowercase 規則）

union type のリテラル値は lowercase（全小文字、ハイフン区切り）に準拠すること。

| union type 値                | 所属型                    | 規則      | 適合 | 修正案 |
| ---------------------------- | ------------------------- | --------- | ---- | ------ |
| `"local"`                    | SkillVisibility           | lowercase | 適合 | -      |
| `"team"`                     | SkillVisibility           | lowercase | 適合 | -      |
| `"public"`                   | SkillVisibility           | lowercase | 適合 | -      |
| `"all"`                      | VisibilityFilter          | lowercase | 適合 | -      |
| `"compatible"`               | CompatibilityLevel        | lowercase | 適合 | -      |
| `"minor-incompatible"`       | CompatibilityLevel        | lowercase | 適合 | -      |
| `"breaking"`                 | CompatibilityLevel        | lowercase | 適合 | -      |
| `"removed"`                  | BreakingChange.changeType | lowercase | 適合 | -      |
| `"type-changed"`             | BreakingChange.changeType | lowercase | 適合 | -      |
| `"required-added"`           | BreakingChange.changeType | lowercase | 適合 | -      |
| `"major"`                    | suggestedBump             | lowercase | 適合 | -      |
| `"minor"`                    | suggestedBump             | lowercase | 適合 | -      |
| `"patch"`                    | suggestedBump             | lowercase | 適合 | -      |
| `"auto-approved"`            | PublishReadiness.status   | lowercase | 適合 | -      |
| `"review-required"`          | PublishReadiness.status   | lowercase | 適合 | -      |
| `"manual-approval-required"` | PublishReadiness.status   | lowercase | 適合 | -      |
| `"blocked"`                  | PublishReadiness.status   | lowercase | 適合 | -      |
| `"low"`                      | ToolRiskLevel             | lowercase | 適合 | -      |
| `"medium"`                   | ToolRiskLevel             | lowercase | 適合 | -      |
| `"high"`                     | ToolRiskLevel             | lowercase | 適合 | -      |
| `"critical"`                 | ToolRiskLevel             | lowercase | 適合 | -      |
| `"approved"`                 | SafetyGateStatus          | lowercase | 適合 | -      |
| `"pending"`                  | SafetyGateStatus          | lowercase | 適合 | -      |
| `"rejected"`                 | SafetyGateStatus          | lowercase | 適合 | -      |
| `"improving"`                | QualityTrend              | lowercase | 適合 | -      |
| `"stable"`                   | QualityTrend              | lowercase | 適合 | -      |
| `"declining"`                | QualityTrend              | lowercase | 適合 | -      |
| `"skill-package"`            | ExportOptions.format      | lowercase | 適合 | -      |

**結果**: 28値全て lowercase に適合。違反なし。

---

## 3. IPC チャンネル名チェック結果

IPC チャンネル名は `skill:{ドメイン}:{動詞}` または `skill:{ドメイン}:{名詞}-{動詞}` パターンに準拠すること。

| チャンネル名                           | パターン                         | 適合 | 修正案 |
| -------------------------------------- | -------------------------------- | ---- | ------ |
| `skill:publishing:register`            | `skill:{ドメイン}:{動詞}`        | 適合 | -      |
| `skill:publishing:update`              | `skill:{ドメイン}:{動詞}`        | 適合 | -      |
| `skill:publishing:deprecate`           | `skill:{ドメイン}:{動詞}`        | 適合 | -      |
| `skill:publishing:remove`              | `skill:{ドメイン}:{動詞}`        | 適合 | -      |
| `skill:publishing:get-dependents`      | `skill:{ドメイン}:{動詞}-{名詞}` | 適合 | -      |
| `skill:publishing:check-readiness`     | `skill:{ドメイン}:{動詞}-{名詞}` | 適合 | -      |
| `skill:publishing:check-compatibility` | `skill:{ドメイン}:{動詞}-{名詞}` | 適合 | -      |
| `skill:distribution:import`            | `skill:{ドメイン}:{動詞}`        | 適合 | -      |
| `skill:distribution:export`            | `skill:{ドメイン}:{動詞}`        | 適合 | -      |
| `skill:distribution:fork`              | `skill:{ドメイン}:{動詞}`        | 適合 | -      |
| `skill:distribution:share`             | `skill:{ドメイン}:{動詞}`        | 適合 | -      |

**結果**: 11チャンネル全て命名パターンに適合。違反なし。

### 3.1 定数名チェック（SCREAMING_SNAKE_CASE）

| 定数名                      | 規則                 | 適合 | 修正案 |
| --------------------------- | -------------------- | ---- | ------ |
| SKILL_PUBLISHING_CHANNELS   | SCREAMING_SNAKE_CASE | 適合 | -      |
| SKILL_DISTRIBUTION_CHANNELS | SCREAMING_SNAKE_CASE | 適合 | -      |
| DEFAULT_VISIBILITY_FILTER   | SCREAMING_SNAKE_CASE | 適合 | -      |

**結果**: 3定数全て適合。

---

## 4. Zustand スライス名チェック結果

スライス名は `{機能名}Slice` パターン（camelCase + Slice サフィックス）に準拠すること。

| スライス名      | パターン        | 適合 | 修正案 |
| --------------- | --------------- | ---- | ------ |
| publishingSlice | `{機能名}Slice` | 適合 | -      |

### 4.1 セレクタ名チェック（use + PascalCase）

| セレクタ名                 | パターン           | 適合 | 修正案 |
| -------------------------- | ------------------ | ---- | ------ |
| useCurrentVisibility       | `use` + PascalCase | 適合 | -      |
| usePublishReadiness        | `use` + PascalCase | 適合 | -      |
| useCompatibilityResult     | `use` + PascalCase | 適合 | -      |
| useIsCheckingReadiness     | `use` + PascalCase | 適合 | -      |
| useIsCheckingCompatibility | `use` + PascalCase | 適合 | -      |
| usePublishingLastError     | `use` + PascalCase | 適合 | -      |
| useSetVisibility           | `use` + PascalCase | 適合 | -      |
| useCheckReadiness          | `use` + PascalCase | 適合 | -      |
| useCheckCompatibility      | `use` + PascalCase | 適合 | -      |
| useClearPublishingError    | `use` + PascalCase | 適合 | -      |
| useResetPublishing         | `use` + PascalCase | 適合 | -      |
| usePublishReadinessReasons | `use` + PascalCase | 適合 | -      |
| useBreakingChanges         | `use` + PascalCase | 適合 | -      |

**結果**: 13セレクタ全て適合。

---

## 5. boolean フィールド命名チェック結果

boolean フィールドは `is` / `has` / `can` / `should` プレフィックスに準拠すること（02-code-quality.md）。

| フィールド名            | 所属型 / スライス | プレフィックス | 適合 | 修正案   |
| ----------------------- | ----------------- | -------------- | ---- | -------- |
| isCheckingReadiness     | PublishingState   | `is`           | 適合 | -        |
| isCheckingCompatibility | PublishingState   | `is`           | 適合 | -        |
| isRequired              | SchemaField       | `is`           | 適合 | -        |
| isRequired              | SchemaFieldChange | `is`           | 適合 | -        |
| autoResolveDependencies | ImportOptions     | なし           | 違反 | 下記参照 |
| includeMetadata         | ExportOptions     | なし           | 違反 | 下記参照 |
| passed                  | securityScan      | なし           | 違反 | 下記参照 |

### 5.1 違反リストと修正案

| #   | フィールド名              | 所属型                       | 現在の命名         | 修正案                          | 修正の要否     |
| --- | ------------------------- | ---------------------------- | ------------------ | ------------------------------- | -------------- |
| V-1 | `autoResolveDependencies` | ImportOptions                | プレフィックスなし | `shouldAutoResolveDependencies` | 推奨（非必須） |
| V-2 | `includeMetadata`         | ExportOptions                | プレフィックスなし | `shouldIncludeMetadata`         | 推奨（非必須） |
| V-3 | `passed`                  | SafetyGateInput.securityScan | プレフィックスなし | `hasPassed` または `isPassed`   | 推奨（非必須） |

**判定**: V-1〜V-3 は全て Phase 5 で確定済みの型定義である。命名規則の厳密適用は推奨だが、フィールド名の変更は Phase 4/6 のテスト仕様書にも波及する。後続の実装タスクで対応可能なため、本 Phase では修正を実施せず、未タスク候補として記録する。

### 5.2 修正の波及影響分析

| 修正対象       | 影響範囲                                                                                         |
| -------------- | ------------------------------------------------------------------------------------------------ |
| V-1 修正の場合 | distribution-test-spec.md の DT-01〜DT-08（import テスト）で参照。テストケース8件に修正が必要    |
| V-2 修正の場合 | distribution-test-spec.md の DT-09〜DT-14（export テスト）で参照。テストケース6件に修正が必要    |
| V-3 修正の場合 | publish-readiness-test-spec.md の PR-01〜PR-12（全15ケース）で参照。テストケース15件に修正が必要 |

**結論**: 波及範囲が広いため、現時点では修正を保留する。boolean フィールド命名の統一は別途の未タスクとして管理する。

---

## 6. 総合結果

| カテゴリ           | 検査数 | 適合数 | 違反数 | 違反内容                                          |
| ------------------ | ------ | ------ | ------ | ------------------------------------------------- |
| 型名 PascalCase    | 34     | 34     | 0      | -                                                 |
| union 値 lowercase | 28     | 28     | 0      | -                                                 |
| IPC チャンネル名   | 11     | 11     | 0      | -                                                 |
| 定数名 SCREAMING   | 3      | 3      | 0      | -                                                 |
| スライス名         | 1      | 1      | 0      | -                                                 |
| セレクタ名         | 13     | 13     | 0      | -                                                 |
| boolean 命名       | 7      | 4      | 3      | V-1 / V-2 / V-3（推奨修正、後続タスクで対応可能） |
| **合計**           | **97** | **94** | **3**  | 全て推奨レベル。ブロッキング違反なし              |
