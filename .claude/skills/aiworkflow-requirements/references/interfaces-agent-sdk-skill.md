# Agent SDK Skill 仕様

## 概要
この親仕様書は型定義と契約の入口であり、詳細ドメイン別定義と履歴は child companion へ分離した。
旧連番 suffix の reference / history child は semantic filename へ移行済み。旧 filename と current filename の対応や migration 根拠が必要なときは `legacy-ordinal-family-register.md` を参照する。

## 仕様書インデックス
| ファイル | 役割 | 主な見出し |
| --- | --- | --- |
| [interfaces-agent-sdk-skill-core.md](interfaces-agent-sdk-skill-core.md) | core specification | 概要 / Skill Dashboard 型定義（AGENT-002） |
| [interfaces-agent-sdk-skill-details.md](interfaces-agent-sdk-skill-details.md) | detail specification | Skill Dashboard 型定義（AGENT-002） / SkillImportStore（TASK-2B） |
| [interfaces-agent-sdk-skill-advanced.md](interfaces-agent-sdk-skill-advanced.md) | advanced specification | SkillSlice型定義（TASK-6-1） / ModifierSkill（スライド逆同期機能） / ChatPanel統合（TASK-7D） / SkillFileManager（TASK-9A-A） |
| [interfaces-agent-sdk-skill-reference.md](interfaces-agent-sdk-skill-reference.md) | reference bundle (creator / editor / chain / schedule) | SkillCreatorService（TASK-9B-G） / SkillEditor UI 型定義（TASK-9A / completed） / スキルチェーン 型定義（TASK-9D） / スキルスケジュール 型定義（TASK-9G） |
| [interfaces-agent-sdk-skill-reference-share-debug-analytics.md](interfaces-agent-sdk-skill-reference-share-debug-analytics.md) | reference bundle (share / debug / doc-generation / analytics) | スキル共有 型定義（TASK-9F） / スキルデバッグ 型定義（TASK-9H） / スキルドキュメント生成 型定義（TASK-9I） / スキル分析 型定義（TASK-9J） |
| [interfaces-agent-sdk-skill-history.md](interfaces-agent-sdk-skill-history.md) | history bundle (completed tasks / doc links) | 完了タスク / 関連ドキュメント |
| [interfaces-agent-sdk-skill-history-contract-fix-changelog.md](interfaces-agent-sdk-skill-history-contract-fix-changelog.md) | history bundle (contract fix backlog / change log) | 完了タスク / 変更履歴 |

## 利用順序
- まずこの親仕様書で対象 child companion を選ぶ。
- 実装や契約の詳細は `core` / `details` / `advanced` 系を読む。
- 完了タスク、変更履歴、補助情報は `history` / `archive` 系を読む。

## TASK-IMP-IPC-LAYER-INTEGRITY-FIX-001 の読み分け

- `skill:get-detail` / `skill:update` の current contract は [interfaces-agent-sdk-skill-details.md](interfaces-agent-sdk-skill-details.md) を一次正本とする。
- sender検証・P42・エラーサニタイズ・whitelist は [security-skill-ipc-core.md](security-skill-ipc-core.md) を併読する。
- `registerSkillHandlers` の担当範囲は [architecture-overview-core.md](architecture-overview-core.md) を参照する。
- object payload 標準と P44/P45 の背景は [architecture-implementation-patterns-reference-ipc-contract-audits.md](architecture-implementation-patterns-reference-ipc-contract-audits.md)、sync 手順は [ipc-contract-checklist.md](ipc-contract-checklist.md) を使う。
- `api-ipc-agent*.md` は補助参照であり、`skill:get-detail` / `skill:update` の一次契約を上書きしない。

## ライフサイクル履歴型定義（TASK-SKILL-LIFECYCLE-07）

| 項目 | 内容 |
| --- | --- |
| タスクID | TASK-SKILL-LIFECYCLE-07 |
| ステータス | `spec_created`（設計タスク） |
| 成果物 | `docs/30-workflows/skill-lifecycle-unification/tasks/step-05-par-task-07-lifecycle-history-feedback/outputs/` |

### 型サマリー

| 型名 | 概要 |
| --- | --- |
| `SkillLifecycleEvent` | ライフサイクルイベント単体。18種別のイベントを `eventType` で判別し、`metadata` に詳細を格納する |
| `SkillAggregateView` | スキル単位の集約ビュー。成功率・トレンド・推薦スコア・最終イベント日時を保持する |
| `SkillFeedback` | ユーザーフィードバック。rating / comment / category / severity を持つ |
| `PublishReadinessMetrics` | 公開準備度指標。success_rate / test_coverage / feedback_score / overall_readiness を集約する |

### 参照リンク

- 要件定義: `docs/30-workflows/skill-lifecycle-unification/tasks/step-05-par-task-07-lifecycle-history-feedback/phase-1-requirements.md`
- 設計: `docs/30-workflows/skill-lifecycle-unification/tasks/step-05-par-task-07-lifecycle-history-feedback/phase-2-design.md`
- 最終レビュー: `docs/30-workflows/skill-lifecycle-unification/tasks/step-05-par-task-07-lifecycle-history-feedback/phase-10-final-review.md`

---

## 公開・互換性型定義（TASK-SKILL-LIFECYCLE-08）

| 項目 | 内容 |
| --- | --- |
| タスクID | TASK-SKILL-LIFECYCLE-08 |
| ステータス | `spec_created`（設計完了、実装は未タスク化済み） |
| 成果物 | `docs/30-workflows/skill-lifecycle-unification/tasks/step-06-seq-task-08-skill-publishing-version-compatibility/outputs/` |

### 型サマリー

| 型名 | 概要 |
| --- | --- |
| `SkillVisibility` | 公開レベル（`local` / `team` / `public`） |
| `SkillPublishingMetadata` | 公開メタデータの識別ユニオン（Local/Team/Public） |
| `CompatibilityCheckResult` | 互換性判定結果（`compatible` / `minor-incompatible` / `breaking`） |
| `PublishReadiness` | 公開判定（`auto-approved` / `review-required` / `manual-approval-required` / `blocked`） |
| `SkillRegistryService` | 登録・更新・停止・削除・依存参照の契約 |
| `SkillDistributionService` | import/export/fork/share 契約 |
| `PublishReadinessChecker` | SafetyGate + Observability 入力から公開可否を返すポート |
| `CompatibilityChecker` | semver / schema 差分の互換性を評価するポート |

### 型定義詳細

#### SkillVisibility

```typescript
type SkillVisibility = "local" | "team" | "public";
```

デフォルト値: `"local"`（新規作成スキルは必ず `"local"` から開始）。配置先: `packages/shared/src/skill/publishing-types.ts`

#### SkillPublishingMetadata（識別ユニオン型）

```typescript
interface SkillPublishingMetadataBase {
  name: string;         // 1〜100文字
  description: string;  // 20〜500文字
  version: string;      // semver 形式
}
interface LocalMetadata extends SkillPublishingMetadataBase { visibility: "local"; }
interface TeamMetadata extends SkillPublishingMetadataBase {
  visibility: "team"; author: string; tags: string[]; teamId: string;
}
interface PublicMetadata extends SkillPublishingMetadataBase {
  visibility: "public"; author: string; tags: string[]; teamId: string;
  license: string; readme: string; changelog: string; minAppVersion: string; repository?: string;
}
type SkillPublishingMetadata = LocalMetadata | TeamMetadata | PublicMetadata;
```

配置先: `packages/shared/src/skill/publishing-types.ts`

#### CompatibilityCheckResult

```typescript
type CompatibilityLevel = "compatible" | "minor-incompatible" | "breaking";
interface BreakingChange { field: string; changeType: "removed" | "type-changed" | "required-added"; before: string; after: string; }
interface CompatibilityWarning { field: string; message: string; }
interface CompatibilityCheckResult {
  level: CompatibilityLevel;
  breakingChanges: BreakingChange[];
  warnings: CompatibilityWarning[];
  suggestedBump: "major" | "minor" | "patch";
}
```

配置先: `packages/shared/src/skill/compatibility-types.ts`

#### PublishReadiness

```typescript
type PublishReadiness =
  | { status: "auto-approved" }
  | { status: "review-required"; reasons: string[] }
  | { status: "manual-approval-required"; reasons: string[] }
  | { status: "blocked"; reasons: string[] };
```

配置先: `packages/shared/src/types/publish-eligibility.ts`

#### SkillRegistryService

```typescript
interface SkillRegistryService {
  register(metadata: SkillPublishingMetadata): Promise<RegisterResult>;
  update(skillId: string, newMetadata: SkillPublishingMetadata): Promise<UpdateResult>;
  deprecate(skillId: string, notice: DeprecationNotice): Promise<void>;
  remove(skillId: string): Promise<void>;
  getDependents(skillId: string): Promise<string[]>;
}
```

配置先: `packages/shared/src/types/skill-registry.ts`。P61 準拠: IPC ハンドラの引数型はこのインターフェース。

#### SkillDistributionService

```typescript
interface SkillDistributionService {
  importSkill(sourceUrl: string, options: ImportOptions): Promise<ImportResult>;
  exportSkill(skillId: string, options: ExportOptions): Promise<ExportPackage>;
  forkSkill(skillId: string, newName: string): Promise<ForkResult>;
  shareSkill(skillId: string, teamId: string, options: ShareOptions): Promise<ShareLink>;
}
```

配置先: `packages/shared/src/types/skill-distribution.ts`。P61 準拠: IPC ハンドラの引数型はこのインターフェース。

#### PublishReadinessChecker / CompatibilityChecker

```typescript
interface PublishReadinessChecker {
  check(safetyGate: SafetyGateInput, metrics: ObservabilityMetrics): PublishReadiness;
}
interface CompatibilityChecker {
  check(oldSchema: unknown, newSchema: unknown): CompatibilityCheckResult;
  checkDependencies(constraints: Record<string, string>): CompatibilityCheckResult;
}
```

PublishReadinessChecker 配置先: `packages/shared/src/types/publish-eligibility.ts`
CompatibilityChecker 配置先: `apps/desktop/src/main/domain/compatibility-checker.ts`

### IPC チャンネル定数（11チャンネル）

```typescript
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

配置先: `packages/shared/src/ipc/channels.ts`（既存ファイルへ追記）。全レスポンスは `IpcResponse<T>` wrapper 形式（P60 準拠）。

### 実装移行の未タスク

| 未タスクID | 役割 | 指示書 |
| --- | --- | --- |
| `UT-SKILL-LIFECYCLE-08-TYPE-IMPL` | 上記型のランタイム実装 | `docs/30-workflows/completed-tasks/step-04-par-task-09-slide-ai-runtime-alignment/unassigned-task/task-ut-skill-lifecycle-08-type-impl.md` |
| `UT-SKILL-LIFECYCLE-08-NAMING-FIX` | boolean 命名規約の是正 | `docs/30-workflows/completed-tasks/step-04-par-task-09-slide-ai-runtime-alignment/unassigned-task/task-ut-skill-lifecycle-08-naming-fix.md` |

---

## IPermissionStoreV2 インターフェース（UT-06-002）

| 項目 | 内容 |
| --- | --- |
| タスクID | UT-06-002 |
| ステータス | completed（Phase 1-12, 2026-03-23） |
| 型定義 | `packages/shared/src/types/permission-store.ts` |
| 実装 | `apps/desktop/src/main/services/skill/PermissionStore.ts` |

V1 の PermissionStore を V2 へ拡張。AllowedToolEntryV2（expiresAt / skillName / expiryPolicy）、ExpiryPolicy union 型、calcExpiresAt 純関数、isToolAllowed 6分岐フロー、permission:clear-session IPC チャネルを追加。

詳細仕様: [security-skill-execution.md - Permission Store V2](security-skill-execution.md#permission-store-v2ut-06-002)

---


## buildPhaseResourceRequestsFromManifest 純粋関数（TASK-P0-07）

| 項目 | 内容 |
| --- | --- |
| タスクID | TASK-P0-07 |
| ステータス | completed（2026-04-06） |
| 配置先 | `apps/desktop/src/main/services/runtime/manifestResourceResolver.ts` |
| 呼び出し元 | `RuntimeSkillCreatorFacade.resolveOperationResources()` |

### シグネチャ

```typescript
function buildPhaseResourceRequestsFromManifest(
  manifest: LoadedWorkflowManifest,
  phaseId: string,
  fallback: readonly PhaseResourceRequest[],
): PhaseResourceRequest[];
```

### 入出力

| パラメータ | 型 | 説明 |
| --- | --- | --- |
| `manifest` | `LoadedWorkflowManifest` | `ManifestLoader` から取得した validated manifest |
| `phaseId` | `string` | 解決対象の phase 識別子（例: `"plan"`, `"improve"`） |
| `fallback` | `readonly PhaseResourceRequest[]` | manifest 解決失敗時に返す静的フォールバック配列 |
| 戻り値 | `PhaseResourceRequest[]` | manifest から組み立てた resource request 配列 |

### フォールバック 5 パターン

| # | 条件 | 動作 |
| --- | --- | --- |
| 1 | `manifest.phases` に `phaseId` が存在しない | `console.warn` + `[...fallback]` を返す |
| 2 | phase の `resourceIds` が `undefined` | `console.warn` + `[...fallback]` を返す |
| 3 | phase の `resourceIds` が空配列 | `console.warn` + `[...fallback]` を返す |
| 4 | 全 `resourceId` が `manifest.resources[]` に未発見 | `console.warn` + `[...fallback]` を返す |
| 5 | dynamic pipeline off（呼び出し元で判定） | `resolveOperationResources()` が直接 static requests を使用 |

### リソースマッピングルール

```typescript
// manifest resource → PhaseResourceRequest 変換
{
  id: resource.id,
  kind: resource.kind,
  relativePath: resource.path.replace(/^\.\// , ""),
  tier: resource.kind === "agent" ? "required-core" : "optional-quality",
  required: resource.kind === "agent",
}
```

### 参照リンク

- 実装: `apps/desktop/src/main/services/runtime/manifestResourceResolver.ts`
- テスト: `apps/desktop/src/main/services/runtime/__tests__/manifestResourceResolver.test.ts`
- 呼び出し元: `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`（`resolveOperationResources()`）
- manifest 定義: `.claude/skills/skill-creator/workflow-manifest.json`

---

## 関連ドキュメント
- `indexes/quick-reference.md`
- `indexes/resource-map.md`
