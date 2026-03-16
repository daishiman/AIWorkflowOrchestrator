# Phase 5: 実装 - タスク仕様書

## メタ情報

| 項目       | 内容                         |
| ---------- | ---------------------------- |
| Phase      | 5                            |
| Phase名    | 実装                         |
| 前提Phase  | Phase 4（テスト作成）        |
| 後続Phase  | Phase 6（テスト拡充）        |
| ステータス | 未実施                       |
| 作成日     | 2026-03-16                   |
| 機能名     | スキル共有・公開・互換性統合 |
| タスクID   | TASK-SKILL-LIFECYCLE-08      |
| タスク種別 | 設計                         |

## 目的

Phase 2 の設計と Phase 4 のテスト仕様に基づき、TypeScript 型定義・サービスインターフェース・IPC チャンネル定数・Zustand Store スライス設計を確定し、`.claude` 正本（aiworkflow-requirements）への配置計画を文書化する。設計タスクのためランタイム実装コードは成果物ではない。

## 背景

TASK-SKILL-LIFECYCLE-08 は設計タスクであり、Phase 5 の「実装」は「型定義と設計ドキュメントを正本に反映する計画を確定する」フェーズを意味する。Phase 4 のテスト仕様からフィードバックされた「モック可能性」「DI 適合性」「P42バリデーション要件」を型定義に組み込む。P57（設計タスクにおける Phase 12 システム仕様書更新の先送りパターン）を防ぐため、配置計画を具体的なファイルパスとセクション名まで明記する。設計タスクのため TDD Green（テスト通過によるコード実装確認）は該当しない。

## 実行タスク

### タスク1: TypeScript 型定義の確定

**目的**: Phase 2 で設計した全型定義を TypeScript として確定し、配置先ファイルパスを決定する。

**実行手順**:

1. `SkillVisibility` と `SkillPublishingMetadata` の型定義を確定する:

   ```typescript
   // 配置先: packages/shared/src/types/skill-publishing.ts
   type SkillVisibility = "local" | "team" | "public";

   interface SkillPublishingMetadata {
     // local 必須フィールド
     name: string;
     description: string;
     version: string; // semver 形式: "^[0-9]+\.[0-9]+\.[0-9]+$"
     visibility: SkillVisibility;
     // team 追加必須フィールド（visibility が "team" または "public" の場合）
     author?: string;
     tags?: string[]; // 1要素以上必須（visibility: "team" 以上）
     teamId?: string; // UUID v4 形式
     // public 追加必須フィールド（visibility が "public" の場合）
     license?: string;
     readme?: string;
     changelog?: string;
     minAppVersion?: string; // semver 形式
     // 任意フィールド
     repository?: string;
   }
   ```

2. `CompatibilityCheckResult` と関連型の定義を確定する:

   ```typescript
   // 配置先: packages/shared/src/types/skill-compatibility.ts
   type CompatibilityLevel = "compatible" | "minor-incompatible" | "breaking";

   interface BreakingChange {
     field: string;
     changeType: "removed" | "type-changed" | "required-added";
     before: string;
     after: string;
   }

   interface CompatibilityWarning {
     field: string;
     message: string;
   }

   interface CompatibilityCheckResult {
     level: CompatibilityLevel;
     breakingChanges: BreakingChange[];
     warnings: CompatibilityWarning[];
     suggestedBump: "major" | "minor" | "patch";
   }
   ```

3. `PublishReadiness` と `SafetyGateResult`、`ObservabilityMetrics` の型を確定する:

   ```typescript
   // 配置先: packages/shared/src/types/skill-publishing.ts（追記）
   type PublishReadiness =
     | { status: "auto-approved" }
     | { status: "review-required"; reasons: string[] }
     | { status: "manual-approval-required"; reasons: string[] }
     | { status: "blocked"; reasons: string[] };

   type ToolRiskLevel = "low" | "medium" | "high" | "critical";
   type SafetyGateStatus = "approved" | "pending" | "rejected";

   interface SafetyGateResult {
     riskLevel: ToolRiskLevel;
     safetyStatus: SafetyGateStatus;
     scan: { passed: boolean; criticalFindings: number; warnings: number };
   }

   type QualityTrend = "improving" | "stable" | "declining";

   interface ObservabilityMetrics {
     successRate: number; // 0-100
     qualityTrend: QualityTrend;
     feedbackScore: number; // 0-5（0はデータなし）
   }
   ```

**期待される成果物**: `outputs/phase-5/type-definitions.md`（全型定義とファイルパスを記載）

---

### タスク2: サービスインターフェースの確定

**目的**: Phase 2 で設計した 4 つのサービスインターフェースを確定し、DI パターンへの適合を明記する。

**実行手順**:

1. `SkillRegistryService` インターフェースを確定する:

   ```typescript
   // 配置先: packages/shared/src/types/skill-registry.ts
   interface RegisterResult {
     success: boolean;
     skillId: string;
     errors?: string[];
   }

   interface UpdateResult {
     success: boolean;
     requiresManualApproval: boolean;
     compatibilityLevel: CompatibilityLevel;
     affectedUserCount?: number;
   }

   interface DeprecationNotice {
     reason: string;
     gracePeriodDays: number; // 30 固定
     alternativeSkillId?: string;
   }

   interface SkillRegistryService {
     register(metadata: SkillPublishingMetadata): Promise<RegisterResult>;
     update(skillId: string, newVersion: SkillVersion): Promise<UpdateResult>;
     deprecate(skillId: string, notice: DeprecationNotice): Promise<void>;
     remove(skillId: string): Promise<void>;
     getDependents(skillId: string): Promise<string[]>;
   }
   ```

2. `SkillDistributionService` インターフェースを確定する:

   ```typescript
   // 配置先: packages/shared/src/types/skill-distribution.ts
   interface ImportOptions {
     installDependencies: boolean;
     overwriteExisting: boolean;
   }

   interface ImportResult {
     success: boolean;
     localSkillId?: string;
     missingDependencies: string[];
     errors?: string[];
   }

   interface ExportOptions {
     includeMetadata: boolean;
     format: "skill"; // .skill ファイル形式のみ
   }

   interface ExportPackage {
     filePath: string; // .skill 拡張子
     metadata: SkillPublishingMetadata;
   }

   interface ForkResult {
     newSkillId: string; // UUID v4
     parentRef: string; // 元スキルの skillId
   }

   interface ShareOptions {
     expireAt: Date;
   }

   interface ShareLink {
     url: string;
     token: string; // 有効期限付き JWT
     expireAt: Date;
   }

   interface SkillDistributionService {
     importSkill(
       sourceUrl: string,
       options: ImportOptions,
     ): Promise<ImportResult>;
     exportSkill(
       skillId: string,
       options: ExportOptions,
     ): Promise<ExportPackage>;
     forkSkill(skillId: string, newName: string): Promise<ForkResult>;
     shareSkill(
       skillId: string,
       teamId: string,
       options: ShareOptions,
     ): Promise<ShareLink>;
   }
   ```

3. `PublishReadinessChecker` と `CompatibilityChecker` インターフェースを確定する:

   ```typescript
   // 配置先: packages/shared/src/types/skill-publishing.ts（追記）
   interface PublishReadinessChecker {
     check(
       safetyGate: SafetyGateResult,
       metrics: ObservabilityMetrics,
     ): PublishReadiness;
   }

   interface CompatibilityChecker {
     check(oldSchema: unknown, newSchema: unknown): CompatibilityCheckResult;
     checkDependencies(
       constraints: Record<string, string>,
     ): CompatibilityCheckResult;
   }
   ```

**期待される成果物**: `outputs/phase-5/service-interfaces.md`

---

### タスク3: IPC チャンネル定数の確定

**目的**: 公開・互換性関連の IPC チャンネル名を定数として確定する（P27: ハードコード文字列の禁止に対応）。

**実行手順**:

1. 新規 IPC チャンネル定数を定義する:

   ```typescript
   // 配置先: packages/shared/src/ipc/channels.ts（既存ファイルへ追記）
   const SKILL_PUBLISHING_CHANNELS = {
     REGISTER: "skill:publishing:register",
     UPDATE: "skill:publishing:update",
     DEPRECATE: "skill:publishing:deprecate",
     REMOVE: "skill:publishing:remove",
     GET_DEPENDENTS: "skill:publishing:get-dependents",
     CHECK_READINESS: "skill:publishing:check-readiness",
     CHECK_COMPAT: "skill:publishing:check-compatibility",
   } as const;

   const SKILL_DISTRIBUTION_CHANNELS = {
     IMPORT: "skill:distribution:import",
     EXPORT: "skill:distribution:export",
     FORK: "skill:distribution:fork",
     SHARE: "skill:distribution:share",
   } as const;
   ```

2. チャンネル追加に伴う Preload ホワイトリスト更新箇所を特定する:
   - 追加先ファイル: `apps/desktop/src/preload/index.ts`
   - 追加箇所: 既存の `IPC_CHANNELS` ホワイトリスト配列

3. ipc-contract-checklist.md Phase 1-6 の該当項目を確認し、新チャンネルの契約チェックリストを `outputs/phase-5/ipc-contract-checklist.md` に記録する。

4. 初回バリデーション（first validation）として以下を確認する:
   - 全チャンネル名が `"skill:publishing:*"` または `"skill:distribution:*"` の形式に準拠していること
   - `channels.ts` の既存チャンネル名と重複がないこと（`grep "skill:publishing\|skill:distribution" packages/shared/src/ipc/channels.ts` で確認）
   - Preload ホワイトリストに追加予定の 11 チャンネルが全て列挙されていること

**期待される成果物**: `outputs/phase-5/ipc-channel-definitions.md`

---

### タスク4: Zustand Store スライス設計の確定

**目的**: publishing 機能の状態管理スライス設計を確定する。

**実行手順**:

1. `publishingSlice` の state/actions 設計を確定する:

   ```typescript
   // 配置先: apps/desktop/src/renderer/store/slices/publishingSlice.ts（新規）
   interface PublishingState {
     currentVisibility: SkillVisibility | null;
     publishReadiness: PublishReadiness | null;
     compatibilityResult: CompatibilityCheckResult | null;
     isCheckingReadiness: boolean;
     isCheckingCompatibility: boolean;
     lastError: string | null;
   }

   // Actions（個別セレクタとして公開 - P31対策）
   // useCurrentVisibility(): SkillVisibility | null
   // usePublishReadiness(): PublishReadiness | null
   // useSetVisibility(): (v: SkillVisibility) => void
   // useCheckReadiness(): (safetyGate: SafetyGateResult, metrics: ObservabilityMetrics) => void
   ```

2. 既存の `skillSlice` との境界を明記する:
   - `skillSlice`: スキルの CRUD（作成・読み取り・更新・削除）を担当
   - `publishingSlice`: 公開ライフサイクル（登録・互換性チェック・公開判定）を担当
   - 両スライスは `skillId` をキーとして参照する（`skillSlice` のデータを `publishingSlice` が読み込む）

**期待される成果物**: `outputs/phase-5/zustand-slice-design.md`

---

### タスク5: `.claude` 正本反映計画の確定

**目的**: Phase 5 で確定した型定義・インターフェース・チャンネル定数を、どの `.claude` 仕様書ファイルのどのセクションに反映するかを具体的に記述する（P57対策）。

**実行手順**:

1. 反映先配置マップを作成する（ファイルパスとセクション名まで明記）:

   | 成果物                      | 反映先ファイル                                                                     | 追記セクション                           |
   | --------------------------- | ---------------------------------------------------------------------------------- | ---------------------------------------- |
   | SkillVisibility 型          | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md`  | `## 型定義 > SkillVisibility`            |
   | SkillPublishingMetadata 型  | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md`  | `## 型定義 > SkillPublishingMetadata`    |
   | CompatibilityCheckResult 型 | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md`  | `## 型定義 > CompatibilityCheckResult`   |
   | PublishReadiness 型         | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md`  | `## 型定義 > PublishReadiness`           |
   | SkillRegistryService IF     | `.claude/skills/aiworkflow-requirements/references/arch-electron-services-core.md` | `## サービス > SkillRegistryService`     |
   | SkillDistributionService IF | `.claude/skills/aiworkflow-requirements/references/arch-electron-services-core.md` | `## サービス > SkillDistributionService` |
   | IPC チャンネル定数          | `.claude/skills/aiworkflow-requirements/references/api-ipc-agent-core.md`          | `## IPC チャンネル > Skill Publishing`   |
   | publishingSlice 設計        | `.claude/skills/aiworkflow-requirements/references/arch-state-management-core.md`  | `## スライス > publishingSlice`          |

2. 実際の反映は Phase 12（ドキュメント）で実施する。本タスクでは配置マップの確定のみとする。

**期待される成果物**: `outputs/phase-5/spec-placement-map.md`

## 参照資料

| 参照資料           | パス                         | 内容                            |
| ------------------ | ---------------------------- | ------------------------------- |
| Phase 1 要件定義   | `./phase-1-requirements.md`  | 受入基準・機能要件              |
| Phase 2 設計       | `./phase-2-design.md`        | 5 つの設計書                    |
| Phase 3 レビュー   | `./phase-3-design-review.md` | レビュー結果・MINOR追跡・DI指摘 |
| Phase 4 テスト仕様 | `./phase-4-test-creation.md` | テストケース・モック定義        |

### システム仕様（aiworkflow-requirements）

| 参照資料                         | パス                                                                                                              | 内容                                                                    |
| -------------------------------- | ----------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| security-skill-execution         | `.claude/skills/aiworkflow-requirements/references/security-skill-execution.md`                                   | 公開前安全性                                                            |
| security-skill-ipc               | `.claude/skills/aiworkflow-requirements/references/security-skill-ipc.md`                                         | 配布操作IPCセキュリティ（IPCチャンネル設計・Preload API設計の根拠）     |
| interfaces-agent-sdk-skill       | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md`                                 | 既存型定義体系（インデックス）                                          |
| interfaces-agent-sdk-skill-share | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill-reference-share-debug-analytics.md` | TASK-9F共有型正本（Task 4 配布操作インターフェースとの整合確認）        |
| arch-electron-services-core      | `.claude/skills/aiworkflow-requirements/references/arch-electron-services-core.md`                                | SkillRegistryService/SkillDistributionService追加先（配置計画書の根拠） |
| api-ipc-agent-core               | `.claude/skills/aiworkflow-requirements/references/api-ipc-agent-core.md`                                         | IPCチャンネル定数追加先（配置計画書の根拠）                             |
| arch-state-management-core       | `.claude/skills/aiworkflow-requirements/references/arch-state-management-core.md`                                 | publishingSlice追加先（配置計画書の根拠）                               |
| lessons-learned                  | `.claude/skills/aiworkflow-requirements/references/lessons-learned-current.md`                                    | P27/P44/P45/P57 教訓                                                    |
| ipc-contract-checklist           | `.claude/skills/aiworkflow-requirements/references/ipc-contract-checklist.md`                                     | IPC 契約チェック                                                        |

## 統合テスト連携

| Phase 4 テスト仕様             | Phase 5 での型定義対応                                                         |
| ------------------------------ | ------------------------------------------------------------------------------ |
| SkillVisibility バリデーション | `SkillPublishingMetadata.visibility: SkillVisibility` は union 型で型安全      |
| P42準拠バリデーション          | IPC ハンドラ引数型: `string` + 呼び出し側で `.trim() === ""` チェック必須      |
| Task06/07 モック               | `PublishReadinessChecker` がインターフェースとして定義され、テストでモック可能 |

## 成果物

| 成果物                         | パス                                         | 内容                                   |
| ------------------------------ | -------------------------------------------- | -------------------------------------- |
| 型定義確定書                   | `outputs/phase-5/type-definitions.md`        | 全 TypeScript 型定義とファイルパス     |
| サービスインターフェース確定書 | `outputs/phase-5/service-interfaces.md`      | 4 サービスの IF 定義                   |
| IPC チャンネル定義書           | `outputs/phase-5/ipc-channel-definitions.md` | チャンネル定数とホワイトリスト更新箇所 |
| Store スライス設計書           | `outputs/phase-5/zustand-slice-design.md`    | publishingSlice の state/actions       |
| 正本反映計画書                 | `outputs/phase-5/spec-placement-map.md`      | 配置マップ（ファイル・セクション）     |

## 完了条件

- [ ] 5 つの設計確定書が `outputs/phase-5/` 配下に作成されている
- [ ] **AC-1対応**: `SkillVisibility` 型と `SkillPublishingMetadata` 型の配置先ファイルパスが具体的に記載されている
- [ ] **AC-2対応**: `CompatibilityCheckResult` 型と `CompatibilityChecker` インターフェースが確定し、配置先が記載されている
- [ ] **AC-3対応**: `PublishReadiness` 型・`SafetyGateResult` 型・`ObservabilityMetrics` 型・`PublishReadinessChecker` インターフェースが確定している
- [ ] **AC-4対応**: `SkillRegistryService` と `SkillDistributionService` のインターフェースが全メソッドを含んでいる
- [ ] IPC チャンネル定数が `"skill:publishing:*"` と `"skill:distribution:*"` 形式で定義されている
- [ ] `publishingSlice` の state 型と個別セレクタ名（P31対策）が定義されている
- [ ] 正本反映計画書にファイルパスとセクション名が全型定義分記載されている
- [ ] 02-code-quality.md 禁止表現（条件・基準が不明確な修飾語）が 0 件である

## タスク100%実行確認【必須】

| #   | 確認項目                                           | 確認方法                                                             | 合否基準                     |
| --- | -------------------------------------------------- | -------------------------------------------------------------------- | ---------------------------- |
| 1   | 5 つの確定書が存在する                             | `ls outputs/phase-5/` で 5 ファイルを確認                            | 5 ファイル全て存在する       |
| 2   | 型定義の配置先が具体的に記載されている             | `type-definitions.md` の各型に配置先ファイルパスが記載されているか   | 全型に具体的なパスが存在する |
| 3   | IPC チャンネルが定数で定義されている               | `ipc-channel-definitions.md` に `as const` が使用されているか        | ハードコード文字列が 0 件    |
| 4   | 正本反映計画書が具体的ファイル・セクションまで記載 | `spec-placement-map.md` の全行に反映先パスとセクション名が存在するか | TBD/空白セルが 0 件          |
| 5   | P31 対策が型定義に反映されている                   | `publishingSlice` の actions が個別セレクタ形式で定義されているか    | 合成 Hook が 0 件            |

---

## 多角的チェック観点（AIが判断）

- TypeScript 型定義の配置先が既存のモノレポ構造（`packages/shared` / `apps/desktop`）と整合しているか
- IPC チャンネル定数が既存の `IPC_CHANNELS` 定数オブジェクトの命名規則に従っているか
- `publishingSlice` の設計が P31（合成Hook無限ループ）と P48（派生セレクタ無限ループ）を回避しているか
- 正本反映計画書が既存の仕様書構造と矛盾しないか
- サービスインターフェースが DI パターン（P34: 遅延初期化対応）を考慮しているか

---

## サブタスク管理

| #   | タスク名                         | ステータス | 完了基準                           |
| --- | -------------------------------- | ---------- | ---------------------------------- |
| 1   | TypeScript 型定義の確定          | 未実施     | 全型定義の配置先ファイルパスが記載 |
| 2   | サービスインターフェースの確定   | 未実施     | 全メソッドのシグネチャが定義       |
| 3   | IPC チャンネル定数の確定         | 未実施     | 定数形式で定義（ハードコード0件）  |
| 4   | Zustand Store スライス設計の確定 | 未実施     | 個別セレクタ名が定義（P31対策）    |
| 5   | `.claude` 正本反映計画の確定     | 未実施     | 反映先パスとセクション名が全記載   |

---

## TDD検証

本タスクは設計タスクのため、実行可能コードの実装は行わない。TDD サイクルの Green フェーズ（テストを通す実装）は後続の実装タスクで実施する。

**確認項目**:

- [ ] Phase 4 のテスト仕様書の期待値と整合する型定義・インターフェースが設計されている
- [ ] 型定義が Phase 4 の全テストケースに対応するフィールドを持っている

---

## 依存関係

- **前提**: Phase 4（テスト作成）が完了していること
- **後続**: Phase 6（テスト拡充）へ進む

---

## Phase実行記録

Phase完了後、以下を記録してください:

```markdown
### 実行タスク

- タスク1（TypeScript 型定義の確定）: （結果を記録）
- タスク2（サービスインターフェースの確定）: （結果を記録）
- タスク3（IPC チャンネル定数の確定）: （結果を記録）
- タスク4（Zustand Store スライス設計の確定）: （結果を記録）
- タスク5（`.claude` 正本反映計画の確定）: （結果を記録）

### 発見事項

- 良かった点:
- 問題点:
- 改善提案:

### 次Phase への引き継ぎ事項

-
```

---

## 次Phase

Phase 6（テスト拡充）: `./phase-6-test-expansion.md`

Phase 4 で定義したテスト仕様では網羅できなかった境界ケース・異常系・回帰ガードのテスト仕様を追加し、Phase 5 で確定した型定義の全フィールドがテストで検証されるようにする。
