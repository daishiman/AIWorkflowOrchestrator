# Implementation Guide

## Part 1: 中学生レベルの説明

### 1.1 この task がそろえるもの

この task は、「途中まで進めた作業を、あとで安全に続きから開けるようにする」ための約束を決める作業です。

たとえば読書で、しおりを本にはさむだけでは足りないことがあります。どの本のどの版を読んでいたか、途中で本の中身が入れ替わっていないか、しおりを誰かに動かされていないかも分からないと、間違ったページから再開してしまいます。

Task08 は、この「しおり」だけでなく、「本が同じか」「別の人が動かしていないか」まで確認する約束を作ります。

### 1.2 なぜ必要か

`SkillCreatorWorkflowEngine` は今の状態をメモリに持っていますが、アプリを閉じたり、後で再開したりすると、そのままでは消えます。だから保存先が必要です。

ただし、前と同じ状態か分からないまま続きから開くと危険です。そこで Task08 では、次の 3 つを分けて考えます。

| 項目     | 何を確認するか                       |
| -------- | ------------------------------------ |
| 保存対象 | どの状態を残すか                     |
| 相性判定 | そのまま再開してよいか               |
| 競合判定 | 別の人や別の実行が先に触っていないか |

### 1.3 完成形

- 何を保存するかがはっきりしている
- 中身が変わったら再開を止められる
- 少しだけ場所が変わった場合は warning を出して再開できる
- 途中の細かい実行までは追わず、区切りのよい地点だけ保存する

## Part 2: 技術者向け説明（実装後 current facts）

### 2.1 実装済み型定義 (`packages/shared/src/types/skillCreator.ts`)

```ts
// Checkpoint 種別
type SkillCreatorCheckpointType =
  | "review-ready"
  | "execute-complete"
  | "verify-fail"
  | "handoff-ready";

// Compatibility evaluator の判定結果
type ResumeCompatibilityStatus =
  | "compatible"
  | "compatible_with_warning"
  | "incompatible"
  | "conflict";

// 不整合理由コード (9 値)
type ResumeIncompatibilityReason =
  | "version_mismatch"
  | "route_type_mismatch"
  | "manifest_cache_key_mismatch"
  | "resource_descriptor_hash_mismatch"
  | "root_relocation_warning"
  | "revision_mismatch"
  | "active_lease_conflict"
  | "checkpoint_not_found"
  | "missing_workflow_payload";

// Checkpoint の永続化本体
interface SkillCreatorPersistedWorkflowCheckpoint {
  checkpointId: string;
  planId: string;
  checkpointType: SkillCreatorCheckpointType;
  workflowStateSnapshot: {
    currentPhase: SkillCreatorWorkflowPhase;
    awaitingUserInput: SkillCreatorUserInputRequest | null;
    verifyResult: SkillCreatorVerifyResult | null;
    phaseArtifacts: SkillCreatorWorkflowArtifactEntry[];
    resumeTokenEnvelope: SkillCreatorResumeTokenEnvelope;
    handoffBundle?: TerminalHandoffBundle | null;
  };
  compatibilitySnapshot: SkillCreatorCompatibilitySnapshot;
  revision: number;
  lease?: WorkflowCheckpointLease;
  createdAt: number;
  updatedAt: number;
  invalidatedAt?: number;
}

// Stale write guard 用 lease
interface WorkflowCheckpointLease {
  ownerInstanceId: string;
  leaseExpiresAt: number;
  acquiredAt: number;
}

// Engine version
const SKILL_CREATOR_ENGINE_VERSION = "task-sdk-08-v1";
```

### 2.2 実装済みクラス

| クラス                                  | ファイル                                           | 責務                                                                   |
| --------------------------------------- | -------------------------------------------------- | ---------------------------------------------------------------------- |
| `ResumeCompatibilityEvaluator`          | `session/ResumeCompatibilityEvaluator.ts`          | version/route/hash/lease の比較判定                                    |
| `WorkflowSessionStorage`                | `session/WorkflowSessionStorage.ts`                | electron-store wrapper (store name: `skill-creator-workflow-sessions`) |
| `SkillCreatorWorkflowSessionRepository` | `session/SkillCreatorWorkflowSessionRepository.ts` | save/load/invalidate/evaluate                                          |
| `SkillCreatorWorkflowEngine` (拡張)     | `runtime/SkillCreatorWorkflowEngine.ts`            | hydrateFromCheckpoint / serializeArtifactsForPersistence               |

### 2.3 実装済み API シグネチャ

```ts
// Repository
class SkillCreatorWorkflowSessionRepository {
  saveCheckpoint(input: SaveCheckpointInput): SaveCheckpointResult;
  loadLatestCheckpoint(
    planId: string,
  ): SkillCreatorPersistedWorkflowCheckpoint | undefined;
  invalidateCheckpoint(planId: string): boolean;
  evaluateResumeCompatibility(
    planId: string,
    context: ResumeEvaluationContext,
  ): ResumeCompatibilityResult;
  listCheckpoints(): SkillCreatorPersistedWorkflowCheckpoint[];
  cleanupExpiredLeases(): number;
}

// Evaluator
class ResumeCompatibilityEvaluator {
  evaluate(
    checkpoint: SkillCreatorPersistedWorkflowCheckpoint,
    context: ResumeEvaluationContext,
  ): ResumeCompatibilityResult;
}

// Engine (追加メソッド)
class SkillCreatorWorkflowEngine {
  hydrateFromCheckpoint(
    checkpoint: SkillCreatorPersistedWorkflowCheckpoint,
  ): SkillCreatorWorkflowStateSnapshot;
  serializeArtifactsForPersistence(
    planId: string,
  ): SkillCreatorWorkflowArtifactEntry[];
}
```

### 2.4 推奨呼び出し順

1. engine snapshot を phase boundary で取得する。
2. repository が workflow checkpoint を保存する（revision/lease guard 付き）。
3. resume 時に latest checkpoint を読む。
4. compatibility evaluator が version / route / hash / lease を判定する。
5. `compatible` / `compatible_with_warning` の場合のみ engine を hydrate する。

### 2.5 エラーハンドリング

| ケース                         | 期待動作                         |
| ------------------------------ | -------------------------------- |
| version mismatch               | `incompatible` を返す            |
| route mismatch                 | `incompatible` を返す            |
| hash mismatch                  | `incompatible` を返す            |
| root relocation only           | `compatible_with_warning` を返す |
| active lease by another writer | `conflict` を返す                |
| revision mismatch              | saveCheckpoint で reject         |
| workflow payload 不在          | loadLatestCheckpoint → undefined |

### 2.6 テスト結果

- ResumeCompatibilityEvaluator: 12 tests passed
- SkillCreatorWorkflowSessionRepository: 19 tests passed
- SkillCreatorWorkflowEngine.persistence: 8 tests passed
- 既存 SkillCreatorWorkflowEngine: 14 tests passed (回帰なし)
- TypeScript 型チェック: shared + desktop エラーなし

### 2.7 非目標

- mid-stream checkpoint
- rewind / fork
- renderer 側 session list UI
- `agent:resumeSession` との統合
- public preload channel 追加（後続 wave で条件付き）

### 2.8 target delta と残課題

- `skill-creator:*` resume public channel は未追加で、internal repository + engine hydrate に留める。
- renderer 側 session list / warning UI は後続 wave の責務として分離する。
- `missing_workflow_payload` は legacy / 破損 checkpoint を graceful reject する runtime guard を優先し、cross-version migration tool はまだ導入しない。

### 2.9 Phase 11 エビデンス参照

- スクリーンショット計画: `outputs/phase-11/screenshot-plan.json`
- 手動テスト結果: `outputs/phase-11/manual-test-result.md`
- 代表エビデンス: `outputs/phase-11/screenshots/placeholder.png`
