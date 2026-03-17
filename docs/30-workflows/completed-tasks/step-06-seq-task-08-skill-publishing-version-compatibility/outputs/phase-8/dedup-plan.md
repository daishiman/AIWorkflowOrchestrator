# 型定義の重複排除設計

## メタ情報

| 項目       | 内容                                                                                                              |
| ---------- | ----------------------------------------------------------------------------------------------------------------- |
| 文書       | Phase 8 - タスク1 成果物                                                                                          |
| タスクID   | TASK-SKILL-LIFECYCLE-08                                                                                           |
| 作成日     | 2026-03-17                                                                                                        |
| 依存成果物 | `outputs/phase-2/*.md`（5設計書）、`outputs/phase-5/type-definitions.md`、`outputs/phase-5/service-interfaces.md` |
| 前提Phase  | Phase 7（カバレッジ確認）完了                                                                                     |

---

## 目的

Phase 2（5設計書）と Phase 5（型定義確定書・サービスインターフェース確定書）間で重複定義されている型を列挙し、正規定義箇所を1箇所に特定する。Phase 5 で既に実施した型整理（重複統合・フィールド改名）の実績を記録する。

---

## 1. 重複型リスト

以下の型が Phase 2 設計書と Phase 5 確定書の両方で定義されている。Phase 5 が正規定義であり、Phase 2 は参照元（設計根拠）として扱う。

### 1.1 packages/shared 配置型

| 型名                        | Phase 2 定義箇所                                                                                             | Phase 5 正規定義箇所     | 一元化先ファイル                                 | 差分の有無 |
| --------------------------- | ------------------------------------------------------------------------------------------------------------ | ------------------------ | ------------------------------------------------ | ---------- |
| SkillVisibility             | publishing-metadata-design.md §2.1                                                                           | type-definitions.md §1.1 | packages/shared/src/skill/publishing-types.ts    | なし       |
| SkillPublishingMetadataBase | publishing-metadata-design.md §2.2                                                                           | type-definitions.md §1.2 | packages/shared/src/skill/publishing-types.ts    | なし       |
| LocalMetadata               | publishing-metadata-design.md §2.2                                                                           | type-definitions.md §1.2 | packages/shared/src/skill/publishing-types.ts    | なし       |
| TeamMetadata                | publishing-metadata-design.md §2.2                                                                           | type-definitions.md §1.2 | packages/shared/src/skill/publishing-types.ts    | なし       |
| PublicMetadata              | publishing-metadata-design.md §2.2                                                                           | type-definitions.md §1.2 | packages/shared/src/skill/publishing-types.ts    | なし       |
| SkillPublishingMetadata     | publishing-metadata-design.md §2.2                                                                           | type-definitions.md §1.2 | packages/shared/src/skill/publishing-types.ts    | なし       |
| VisibilityFilter            | publishing-metadata-design.md §2.3                                                                           | type-definitions.md §1.4 | packages/shared/src/skill/publishing-types.ts    | なし       |
| isValidString               | publishing-metadata-design.md §2.3                                                                           | type-definitions.md §1.4 | packages/shared/src/skill/publishing-types.ts    | なし       |
| CompatibilityLevel          | compatibility-check-design.md §2.1                                                                           | type-definitions.md §2.1 | packages/shared/src/skill/compatibility-types.ts | なし       |
| BreakingChange              | compatibility-check-design.md §2.1                                                                           | type-definitions.md §2.2 | packages/shared/src/skill/compatibility-types.ts | あり       |
| CompatibilityWarning        | compatibility-check-design.md §2.1                                                                           | type-definitions.md §2.3 | packages/shared/src/skill/compatibility-types.ts | あり       |
| CompatibilityCheckResult    | compatibility-check-design.md §2.1                                                                           | type-definitions.md §2.4 | packages/shared/src/skill/compatibility-types.ts | なし       |
| PublishReadiness            | publish-readiness-design.md §3.1                                                                             | type-definitions.md §3.1 | packages/shared/src/types/publish-eligibility.ts | なし       |
| ToolRiskLevel               | publish-readiness-design.md §1.1                                                                             | type-definitions.md §3.2 | packages/shared/src/types/publish-eligibility.ts | なし       |
| SafetyGateStatus            | publish-readiness-design.md §1.2                                                                             | type-definitions.md §3.3 | packages/shared/src/types/publish-eligibility.ts | なし       |
| SafetyGateInput             | publish-readiness-design.md §1.4                                                                             | type-definitions.md §3.4 | packages/shared/src/types/publish-eligibility.ts | なし       |
| QualityTrend                | publish-readiness-design.md §2.1                                                                             | type-definitions.md §3.5 | packages/shared/src/types/publish-eligibility.ts | なし       |
| ObservabilityMetrics        | publish-readiness-design.md §2.2                                                                             | type-definitions.md §3.6 | packages/shared/src/types/publish-eligibility.ts | なし       |
| IpcResponse                 | publishing-metadata-design.md §2.3, distribution-operations-design.md §2.1, skill-center-flow-design.md §2.4 | type-definitions.md §1.4 | packages/shared/src/types/ipc-response.ts        | なし       |

### 1.2 サービスインターフェース型

| 型名                     | Phase 2 定義箇所                       | Phase 5 正規定義箇所     | 一元化先ファイル                                      | 差分の有無 |
| ------------------------ | -------------------------------------- | ------------------------ | ----------------------------------------------------- | ---------- |
| SkillRegistryService     | skill-center-flow-design.md §2.3       | service-interfaces.md §1 | packages/shared/src/types/skill-registry.ts           | あり       |
| RegisterResult           | skill-center-flow-design.md §2.2       | service-interfaces.md §1 | packages/shared/src/types/skill-registry.ts           | あり       |
| UpdateResult             | skill-center-flow-design.md §2.2       | service-interfaces.md §1 | packages/shared/src/types/skill-registry.ts           | あり       |
| DeprecationNotice        | skill-center-flow-design.md §2.2       | service-interfaces.md §1 | packages/shared/src/types/skill-registry.ts           | あり       |
| SkillDistributionService | distribution-operations-design.md §2.6 | service-interfaces.md §2 | packages/shared/src/types/skill-distribution.ts       | なし       |
| ImportOptions            | distribution-operations-design.md §2.2 | service-interfaces.md §2 | packages/shared/src/types/skill-distribution.ts       | なし       |
| ImportResult             | distribution-operations-design.md §2.2 | service-interfaces.md §2 | packages/shared/src/types/skill-distribution.ts       | なし       |
| ExportOptions            | distribution-operations-design.md §2.3 | service-interfaces.md §2 | packages/shared/src/types/skill-distribution.ts       | なし       |
| ExportPackage            | distribution-operations-design.md §2.3 | service-interfaces.md §2 | packages/shared/src/types/skill-distribution.ts       | あり       |
| ForkResult               | distribution-operations-design.md §2.4 | service-interfaces.md §2 | packages/shared/src/types/skill-distribution.ts       | あり       |
| ShareOptions             | distribution-operations-design.md §2.5 | service-interfaces.md §2 | packages/shared/src/types/skill-distribution.ts       | あり       |
| ShareLink                | distribution-operations-design.md §2.5 | service-interfaces.md §2 | packages/shared/src/types/skill-distribution.ts       | あり       |
| PublishReadinessChecker  | publish-readiness-design.md §5         | service-interfaces.md §3 | packages/shared/src/types/publish-eligibility.ts      | なし       |
| CompatibilityChecker     | compatibility-check-design.md §2.4     | service-interfaces.md §4 | apps/desktop/src/main/domain/compatibility-checker.ts | あり       |

### 1.3 IPC チャンネル定数

| 定数名                      | Phase 2 定義箇所                     | Phase 5 正規定義箇所            | 一元化先ファイル                    | 差分の有無 |
| --------------------------- | ------------------------------------ | ------------------------------- | ----------------------------------- | ---------- |
| SKILL_PUBLISHING_CHANNELS   | skill-center-flow-design.md §6.1     | ipc-channel-definitions.md §1.1 | packages/shared/src/ipc/channels.ts | あり       |
| SKILL_DISTRIBUTION_CHANNELS | distribution-operations-design.md §5 | ipc-channel-definitions.md §1.2 | packages/shared/src/ipc/channels.ts | なし       |

---

## 2. 差分詳細と Phase 5 での解決内容

### 2.1 BreakingChange フィールド改名（P45 準拠）

| フィールド名  | Phase 2 定義                                      | Phase 5 正規定義           | 改名理由                                                                  |
| ------------- | ------------------------------------------------- | -------------------------- | ------------------------------------------------------------------------- |
| `type`        | `"removed" \| "type-changed" \| "required-added"` | `changeType`（同値セット） | P45 準拠: `type` は TypeScript 予約語と紛らわしいため `changeType` に改名 |
| `description` | 人間可読な変更説明                                | `before` / `after`（分離） | 変更前後の値を構造化して保持する方が比較ロジックで利用しやすいため        |
| `severity`    | `"error"`（固定値）                               | 削除                       | 全 BreakingChange は常に error であり冗長なフィールドを排除               |

### 2.2 CompatibilityWarning フィールド簡略化

| フィールド名  | Phase 2 定義                                             | Phase 5 正規定義 | 変更理由                                                                |
| ------------- | -------------------------------------------------------- | ---------------- | ----------------------------------------------------------------------- |
| `type`        | `"optional-added" \| "deprecated" \| "behavior-changed"` | 削除             | 警告種別は `message` で十分に表現可能であり、ユニオン型の保守負荷を軽減 |
| `description` | 人間可読な説明                                           | `message` に改名 | フィールド名をセマンティクスに一致させる（P45 準拠）                    |
| `severity`    | `"warning"`（固定値）                                    | 削除             | 全 CompatibilityWarning は常に warning であり冗長なフィールドを排除     |

### 2.3 RegisterResult フィールド差分

Phase 2（skill-center-flow-design.md）では `registeredAt` と `visibility` を含む3フィールド構成。Phase 5（service-interfaces.md）では汎用的な `success` / `skillId` / `errors?` の構成に変更。

Phase 5 正規定義が優先。登録日時や visibility の返却はIPC レスポンスの `data` フィールドで必要に応じて拡張する。

### 2.4 CompatibilityChecker メソッドシグネチャ差分

| メソッド             | Phase 2 定義                                                           | Phase 5 正規定義                                                    |
| -------------------- | ---------------------------------------------------------------------- | ------------------------------------------------------------------- |
| `checkVersion`       | `(oldVersion, newVersion, diff) => CompatibilityCheckResult`           | `check(oldSchema, newSchema) => CompatibilityCheckResult`           |
| `checkDependencies`  | `(dependencies: DependencyConstraint[]) => DependencyResolutionResult` | `(constraints: Record<string, string>) => CompatibilityCheckResult` |
| `suggestVersionBump` | `(changes: SchemaDiff) => "major" \| "minor" \| "patch"`               | 削除（check() の戻り値 suggestedBump に統合）                       |

Phase 5 ではシグネチャを簡略化し、内部の SchemaDiff 型を外部インターフェースから隠蔽する設計に変更している。

### 2.5 ExportPackage / ForkResult / ShareOptions / ShareLink フィールド差分

Phase 2（distribution-operations-design.md）ではフィールドが詳細（ExportPackage に `fileName`/`size`/`checksum`、ShareOptions に `expiresIn`/`permissions`）。Phase 5（service-interfaces.md）では簡略化されたフィールド構成（ExportPackage に `filePath`/`metadata`、ShareOptions に `expireAt: Date`）。

Phase 5 正規定義が優先。Phase 2 の詳細フィールドは具象クラスの内部実装で保持する。

### 2.6 SKILL_PUBLISHING_CHANNELS チャンネル数差分

| 項目                 | Phase 2                                  | Phase 5                            |
| -------------------- | ---------------------------------------- | ---------------------------------- |
| チャンネル数         | 7（CONFIRM を含む）                      | 7（CHECK_READINESS を含む）        |
| `CONFIRM` チャンネル | `skill:publishing:confirm`（登録確定用） | 未定義                             |
| `CHECK_READINESS`    | 未定義                                   | `skill:publishing:check-readiness` |
| `CHECK_COMPAT` 名称  | `CHECK_COMPATIBILITY`                    | `CHECK_COMPAT`（短縮形）           |

Phase 5 正規定義が優先。`CONFIRM` チャンネルは登録フローの Step 4 で必要だが、後続の実装タスクで追加する。

---

## 3. 一元化対応テーブル

| 一元化先ファイル                                   | 収録する型定義                                                                                                                                                                                                         | 正規定義の Phase 5 参照元                        |
| -------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------ |
| `packages/shared/src/skill/publishing-types.ts`    | SkillVisibility, SkillPublishingMetadataBase, LocalMetadata, TeamMetadata, PublicMetadata, SkillPublishingMetadata, VisibilityFilter, DEFAULT_VISIBILITY_FILTER, isValidString, visibilityBadgeStyles, visibilityIcons | type-definitions.md §1                           |
| `packages/shared/src/skill/compatibility-types.ts` | CompatibilityLevel, BreakingChange, CompatibilityWarning, CompatibilityCheckResult                                                                                                                                     | type-definitions.md §2                           |
| `packages/shared/src/types/publish-eligibility.ts` | PublishReadiness, ToolRiskLevel, SafetyGateStatus, SafetyGateInput, QualityTrend, ObservabilityMetrics, PublishReadinessChecker                                                                                        | type-definitions.md §3, service-interfaces.md §3 |
| `packages/shared/src/types/skill-registry.ts`      | SkillRegistryService, RegisterResult, UpdateResult, DeprecationNotice                                                                                                                                                  | service-interfaces.md §1                         |
| `packages/shared/src/types/skill-distribution.ts`  | SkillDistributionService, ImportOptions, ImportResult, ExportOptions, ExportPackage, ForkResult, ShareOptions, ShareLink                                                                                               | service-interfaces.md §2                         |
| `packages/shared/src/types/ipc-response.ts`        | IpcResponse\<T\>                                                                                                                                                                                                       | type-definitions.md §1.4                         |
| `packages/shared/src/ipc/channels.ts`              | SKILL_PUBLISHING_CHANNELS, SKILL_DISTRIBUTION_CHANNELS                                                                                                                                                                 | ipc-channel-definitions.md §1                    |

---

## 4. Phase 5 実施済みセクション

Phase 5 で以下のリファクタリングが既に完了している。Phase 8 では改めて実施する必要はなく、本セクションで実績を記録する。

### 4.1 実施済み項目一覧

| 項目                                         | Phase 5 成果物                  | 実施内容                                                                                   |
| -------------------------------------------- | ------------------------------- | ------------------------------------------------------------------------------------------ |
| Phase 2 の5設計書から型定義を統合            | type-definitions.md             | 19型を3ファイルに集約し、packages/shared/src/index.ts からの re-export 計画を確定          |
| BreakingChange の `type` → `changeType` 改名 | type-definitions.md §2.2        | P45 準拠でフィールド名を値のセマンティクスに一致させた                                     |
| CompatibilityWarning の簡略化                | type-definitions.md §2.3        | `type` / `severity` フィールドを削除し `field` / `message` の2フィールド構成に変更         |
| CompatibilityChecker シグネチャ簡略化        | service-interfaces.md §4        | `checkVersion` + `suggestVersionBump` を `check(oldSchema, newSchema)` に統合              |
| Phase 3 MINOR 10件の型定義レベル対応         | type-definitions.md §8          | M-AC-1〜M-DQ-4 の型定義への影響を評価し、該当する4件（M-AC-1/2/3, M-SS-3）を解決           |
| Phase 1/2 トレーサビリティテーブル作成       | type-definitions.md §7          | 12型の Phase 1 受入基準 → Phase 2 設計書 → Phase 5 確定ファイルの追跡テーブルを作成        |
| 4サービスインターフェースの DI 適合性明記    | service-interfaces.md §1-4      | P61 準拠で全インターフェースに「IPC ハンドラ登録関数の引数型はインターフェース」注記を追加 |
| IPC チャンネル11本の P42/P60/P61 準拠確認    | ipc-channel-definitions.md §4-8 | ipc-contract-checklist.md Phase 1-6 の全項目を PASS 確認                                   |
| publishingSlice と skillSlice の責務境界確定 | zustand-slice-design.md §7      | 一方向データフロー（publishingSlice → skillSlice は参照のみ、書き換え禁止）を明示          |
| P48 useShallow 適用基準の文書化              | zustand-slice-design.md §10     | 適用要否の判定テーブル（6条件）を作成し、publishingSlice の2派生セレクタに適用必須と判定   |

### 4.2 Phase 5 で未実施の項目（後続タスク）

| 項目                                | 理由                                            | 対応先                     |
| ----------------------------------- | ----------------------------------------------- | -------------------------- |
| IpcResponse\<T\> の既存定義との統合 | 既存の ipc-response.ts が存在するか未確認のため | 後続実装タスクで確認・統合 |
| CONFIRM チャンネルの追加            | Phase 2 登録フローの Step 4 で必要              | 後続実装タスクで追加       |
| isDeprecated フィールドの追加       | M-AC-1 対応として未タスク化済み                 | 未タスク仕様書で管理       |

---

## 5. 再検証結果

### 5.1 型整合性再検証

Phase 4/6 テスト仕様書で参照されている型名が、Phase 5 正規定義と一致していることを確認した。

| テスト仕様書                   | 参照型名                  | Phase 5 正規定義         | 一致 |
| ------------------------------ | ------------------------- | ------------------------ | ---- |
| publishing-test-spec.md        | SkillVisibility           | type-definitions.md §1.1 | 一致 |
| publishing-test-spec.md        | SkillPublishingMetadata   | type-definitions.md §1.2 | 一致 |
| compatibility-test-spec.md     | CompatibilityCheckResult  | type-definitions.md §2.4 | 一致 |
| compatibility-test-spec.md     | BreakingChange.changeType | type-definitions.md §2.2 | 一致 |
| publish-readiness-test-spec.md | PublishReadiness          | type-definitions.md §3.1 | 一致 |
| distribution-test-spec.md      | ImportResult              | service-interfaces.md §2 | 一致 |
| skill-center-test-spec.md      | RegisterResult            | service-interfaces.md §1 | 一致 |
